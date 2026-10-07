"""PyCBA unit-load superposition with explicit engineering sign conventions.

The stiffness solution belongs to PyCBA. Reactions are interpolated separately
within each physical span. V and M are recovered by exact section equilibrium,
so moving axles and supports retain their shear jumps. D uses PyCBA's integrated
member deflections. Independent numerical settings control influence sampling,
truck traversal and deflection integration; report subdivisions do not set them.
"""

from functools import lru_cache
import json
import time

import numpy as np
from scipy.interpolate import CubicSpline
import pycba as cba

from .models import Model
from .distribution import (
    applied as ft_applied,
    effective_spans,
    station_factors,
    truck_fraction,
)
from .sections import (
    LinearSectionEI,
    member_deflection,
    stiffness_profile,
    span_ei,
    properties,
)
from .loads import (
    CANADIAN_VEHICLES,
    HL93_VEHICLES,
    axle_groups,
    dead_intervals,
    dynamic_factor,
    lane_axle_factor,
    lane_parameters,
    vehicle_data,
    vehicle_variants,
)


def stations(model):
    xs, spans, sides = [], [], []
    start = 0.0
    joint = deck_joint(model)
    for i, span in enumerate(model.spans):
        local = np.unique(
            np.r_[
                np.linspace(0, span.length, 81),
                np.linspace(0, span.length, model.subdivisions + 1),
            ]
        )
        cut = None
        if joint and start < joint[0] < start + span.length:
            # v0.9.99: the deck joint is a station on both of its sides.
            cut = joint[0] - start
            local = np.sort(np.r_[local[np.abs(local - cut) > 1e-6], cut])
        for a in local:
            if cut is not None and a == cut:
                xs += [joint[0], joint[0]]
                spans += [i, i]
                sides += ["left", "right"]
                continue
            xs.append(start + a)
            spans.append(i)
            sides.append("left" if a == span.length else "right")
        start += span.length
    return np.array(xs), spans, sides


def pycba_supports(model):
    """PyCBA support list; a rotational spring is [vertical fixed, k]."""
    out = []
    for i, kind in enumerate(model.supports):
        if kind == "spring":
            out.append([-1, float(model.support_springs[i])])
        elif kind == "split":
            # Split pier (v0.9.8): both members are hinged on the node, whose
            # rotation is then restrained only to keep the system regular; it
            # carries no moment. Each side keeps its own bearing reaction.
            out.append("fixed")
        else:
            out.append(kind)
    return out


def deck_breaks(model):
    """Supports without deck continuity: split piers (v0.9.8) and supports
    next to a simple span (hinge)."""
    n = len(model.spans)
    return [
        k in (0, n)
        or model.supports[k] == "split"
        or model.spans[k - 1].simple
        or model.spans[k].simple
        for k in range(n + 1)
    ]


def split_stations(x, sides, support_x, model):
    """Report-station indices (left side, right side) of every split pier."""
    out = {}
    x = np.asarray(x, float)
    for k, kind in enumerate(model.supports):
        if kind != "split":
            continue
        at = np.flatnonzero(np.abs(x - support_x[k]) < 1e-9)
        left = [int(i) for i in at if sides[i] == "left"]
        right = [int(i) for i in at if sides[i] == "right"]
        if left and right:
            out[k] = {"left": left[0], "right": right[0]}
    return out


def end_releases(model):
    """Moment releases ``(left, right)`` per span for isostatic spans.

    A simple span is hinged at both ends. At a node whose rotation is free
    (pin/roller), only ONE member may be released, or the node rotation would
    have no stiffness: if both neighbours are simple, the right one stays
    attached and, being the node's only member, carries zero end moment
    anyway. At a fixed or spring support every simple span is released, so it
    is disconnected from the rotational restraint. An exterior pin already
    gives zero moment and needs no release.
    """
    n = len(model.spans)
    restrained = [kind in ("fixed", "spring", "split") for kind in model.supports]
    left, right = [False] * n, [False] * n
    for i, span in enumerate(model.spans):
        if span.simple:
            left[i] = restrained[0] if i == 0 else True
            right[i] = restrained[n] if i == n - 1 else True
    for k, kind in enumerate(model.supports):
        if kind == "split":  # interior only (validated): hinge both sides
            right[k - 1] = left[k] = True
    for j in range(1, n):
        if right[j - 1] and left[j] and not restrained[j]:
            left[j] = False
    return list(zip(left, right))


def member_types(model):
    """PyCBA element types: 1 FF, 2 FP, 3 PF, 4 PP."""
    codes = {(False, False): 1, (False, True): 2, (True, False): 3, (True, True): 4}
    return [codes[pair] for pair in end_releases(model)]


def support_fixity(model, eis=None):
    """Degree of fixity k / (k + sum 3EI/L) of each support, 0 (pin) to 1.

    The adjacent members are taken with their far ends pinned; it is an
    indicator of how close a spring is to full fixity, not a code quantity.
    Simple (isostatic) spans are released from the support rotation.
    """
    eis = eis or [span_ei(model, i) for i in range(len(model.spans))]
    lengths = [s.length for s in model.spans]
    releases = end_releases(model)
    out = []
    for i, kind in enumerate(model.supports):
        connected = [
            j
            for j, end in ((i - 1, 1), (i, 0))
            if 0 <= j < len(lengths) and not releases[j][end]
        ]
        if kind == "fixed":
            out.append(1.0 if connected else 0.0)
            continue
        if kind == "split":
            out.append(0.0)
            continue
        if kind != "spring" or not connected:
            out.append(0.0)
            continue
        member = 0.0
        for j, at in ((i - 1, lengths[i - 1] if i else None), (i, 0.0)):
            if j in connected:
                ei = eis[j]
                value = (
                    float(ei(at if at is not None else 0.0))
                    if callable(ei)
                    else float(ei)
                )
                member += 3 * value / lengths[j]
        k = float(model.support_springs[i])
        out.append(k / (k + member))
    return out


def node_reactions(ba):
    """Vertical (up +) and moment (counter-clockwise +) reaction per node.

    PyCBA compacts ``R`` to restrained DOFs only, so a fixed (integral)
    abutment inserts a moment entry. Expand it back to one vertical and one
    moment value per support, whatever the support types.
    """
    restraints = np.asarray(ba._beam.restraints, float)
    full = np.zeros(len(restraints))
    full[restraints < 0] = np.asarray(ba.beam_results.R, float)
    # Elastic (rotational spring) supports report their force in ``Rs``.
    springs = np.asarray(getattr(ba.beam_results, "Rs", []), float)
    if springs.size:
        full[restraints > 0] = springs
    return np.r_[full[0::2], full[1::2]]


JOINT_LINK = 1e-5  # m: zero-stiffness pinned-pinned link of a deck cut
_RELEASE_CODES = {
    (False, False): 1,
    (False, True): 2,
    (True, False): 3,
    (True, True): 4,
}


def deck_joint(model):
    """Active deck joint (v0.9.99) as ``(x, kind, keep)``, else None."""
    joint = getattr(model, "joint", None)
    if joint is None or not joint.enabled:
        return None
    keep = joint.keep if joint.kind == "cut" else "both"
    return float(joint.x), joint.kind, keep


def sub_ei(ei, a, b, length):
    """EI of the part ``[a, b]`` (local x) of a span of ``length``."""
    if not isinstance(ei, cba.SectionEI) or (a <= 0 and b >= length):
        return ei
    out = LinearSectionEI()
    for piece in ei.pieces:
        u0, u1 = max(piece.x0, a), min(piece.x1, b)
        if u1 - u0 > 1e-9 * max(1.0, length):
            values = [float(np.polyval(piece.coeffs, u)) for u in (u0, u1)]
            out.add_segment("pwl", [u0 - a, u1 - a], values)
    return out


class Structure:
    """PyCBA members and nodes of the deck (v0.9.99).

    Without a deck joint: one member per span between the support nodes, as
    before. A hinge splits its span at a free node, the left member being
    released there (the shear crosses, the moment is zero). A cut adds a
    pinned-pinned link of ``JOINT_LINK`` metres between two free nodes; such
    a link has no stiffness at all, so neither V nor M crosses it. With one
    side kept only, the removed part has all its nodes fixed and receives no
    load: it is isolated and its responses are zero.

    Members carry the stations and loads of ``[seg_a, seg_b]`` (bridge x);
    their PyCBA geometry is ``[start, end]``. The member right of a cut
    owns its segment from the cut, open on that side.
    """

    def __init__(self, model, eis=None):
        self.lengths = [s.length for s in model.spans]
        self.support_x = np.r_[0.0, np.cumsum(self.lengths)]
        self.length = float(self.support_x[-1])
        if eis is None:
            eis = [span_ei(model, i) for i in range(len(self.lengths))]
        self.eis = eis
        self.joint = joint = deck_joint(model)
        supports = pycba_supports(model)
        releases = end_releases(model)
        self.lo, self.hi, self.open_lo = 0.0, self.length, False
        if joint and joint[2] == "left":
            self.hi = joint[0]
        elif joint and joint[2] == "right":
            self.lo, self.open_lo = joint[0], True
        nodes, node_x, members, self.support_nodes = [], [], [], []

        def node(spec, x):
            nodes.append(spec)
            node_x.append(float(x))

        def member(span, a, b, release, start=None, end=None, **flags):
            members.append(
                {
                    "span": span,
                    "seg_a": float(a),
                    "seg_b": float(b),
                    "start": float(a if start is None else start),
                    "end": float(b if end is None else end),
                    "release": release,
                    **flags,
                }
            )

        for i in range(len(self.lengths)):
            a0, a1 = self.support_x[i], self.support_x[i + 1]
            self.support_nodes.append(len(nodes))
            node(supports[i], a0)
            left, right = releases[i]
            if joint and a0 < joint[0] < a1:
                xc = joint[0]
                if joint[1] == "hinge":
                    member(i, a0, xc, (left, True))
                    node("free", xc)
                    member(i, xc, a1, (False, right))
                else:
                    member(i, a0, xc, (left, False))
                    node("free", xc)
                    member(None, xc, xc, (True, True), end=xc + JOINT_LINK, link=True)
                    node("free", xc + JOINT_LINK)
                    member(i, xc, a1, (False, right), start=xc + JOINT_LINK, open=True)
            else:
                member(i, a0, a1, (left, right))
        self.support_nodes.append(len(nodes))
        node(supports[-1], self.length)
        if joint and joint[2] != "both":
            # The removed part: every node fixed, so it is stable and isolated.
            for k, x in enumerate(node_x):
                if (joint[2] == "left" and x > self.hi + 1e-9) or (
                    joint[2] == "right" and x < self.lo + JOINT_LINK / 2
                ):
                    nodes[k] = "fixed"
        for m in members:
            m["active"] = not m.get("link") and (
                m["seg_b"] <= self.hi + 1e-9 and m["seg_a"] >= self.lo - 1e-9
            )
        self.nodes, self.node_x, self.members = nodes, node_x, members
        self.held = [spec != "free" for spec in nodes]
        self.member_lengths = [m["end"] - m["start"] for m in members]
        self.member_eis = [
            (
                1.0
                if m.get("link")
                else sub_ei(
                    self.eis[m["span"]],
                    m["start"] - self.support_x[m["span"]],
                    m["end"] - self.support_x[m["span"]],
                    self.lengths[m["span"]],
                )
            )
            for m in members
        ]
        self.eletypes = [_RELEASE_CODES[m["release"]] for m in members]

    def analysis(self):
        ba = cba.BeamAnalysis(
            self.member_lengths,
            self.member_eis,
            supports=self.nodes,
            eletype=self.eletypes,
        )
        if self.joint and not ba.is_stable():
            # A part of the deck left without enough supports (mechanism).
            raise ValueError("joint.unstable")
        return ba

    def reactions(self, ba):
        """Vertical then moment reactions of the supports only."""
        full = node_reactions(ba)
        n = len(self.nodes)
        idx = self.support_nodes
        return np.r_[full[:n][idx], full[n:][idx]]

    def active(self, p):
        """Load positions on the deck that is analysed (kept part)."""
        p = np.asarray(p, float)
        low = p > self.lo if self.open_lo else p >= self.lo
        return low & (p <= self.hi)

    def in_member(self, m, p):
        p = np.asarray(p, float)
        low = p > m["seg_a"] if m.get("open") else p >= m["seg_a"]
        return low & (p <= m["seg_b"])

    def station_members(self, x, sides):
        """Member owning each station (the joint side decides at a joint)."""
        tol = 1e-9 * max(1.0, self.length)
        out = np.full(len(x), -1)
        for i, (xi, side) in enumerate(zip(x, sides)):
            for k, m in enumerate(self.members):
                if m.get("link"):
                    continue
                a, b = m["seg_a"], m["seg_b"]
                after = xi > a + tol or (
                    abs(xi - a) <= tol and (side == "right" or a <= tol)
                )
                before = xi < b - tol or (
                    abs(xi - b) <= tol and (side == "left" or b >= self.length - tol)
                )
                if after and before:
                    out[i] = k
                    break
        return out

    def clip(self, pieces):
        """Distributed loads ``(start, end, w)`` limited to the kept part."""
        out = []
        for a, b, w in pieces:
            a, b = max(a, self.lo), min(b, self.hi)
            if b - a > 1e-12:
                out.append((float(a), float(b), w))
        return out

    def clip_intervals(self, intervals):
        out = []
        for v in intervals:
            a, b = max(v["start"], self.lo), min(v["end"], self.hi)
            if b - a <= 1e-12:
                continue
            out.append(
                {
                    **v,
                    "a": v["a"] + a - v["start"],
                    "b": v["b"] + b - v["end"],
                    "start": a,
                    "end": b,
                }
            )
        return out

    def pycba_udl(self, start, end, w):
        """PyCBA uniform loads ``[member, 3, w, a, c]`` for ``(start, end)``."""
        loads = []
        for k, m in enumerate(self.members):
            if not m["active"]:
                continue
            a = max(start, m["seg_a"], m["start"])
            b = min(end, m["seg_b"], m["end"])
            if w and b - a > 1e-12:
                loads.append([k + 1, 3, w, a - m["start"], b - a])
        return loads

    def deflections(self, ba, x, owner, kappas=None):
        """Downward deflection (mm) at the stations ``x`` of their members."""
        out = np.zeros(len(x))
        for k, (m, result) in enumerate(zip(self.members, ba.beam_results.vRes)):
            sel = np.flatnonzero(owner == k)
            if m.get("link") or not len(sel):
                continue
            length = m["end"] - m["start"]
            local_x = result.x[1:-1] - m["start"]
            local_d = result.D[1:-1].copy()
            held = self.held[k] and self.held[k + 1]
            # A free end (deck joint) keeps PyCBA's nodal deflection.
            ends = (0.0, 0.0) if held else (float(local_d[0]), float(local_d[-1]))
            kappa = 0.0 if kappas is None else kappas[m["span"]]
            refined = member_deflection(
                local_x, result.M[1:-1], self.member_eis[k], kappa, ends
            )
            if refined is not None:
                local_x, local_d = refined
            elif held:
                # Both end deflections are known to be zero. Correct the
                # integration constant's small trapezoidal drift.
                local_d -= local_d[0] + local_x / length * (local_d[-1] - local_d[0])
            query = np.clip(np.asarray(x)[sel] - m["start"], 0, length)
            out[sel] = -1000 * np.interp(query, local_x, local_d)
        return out

    def extra_points(self):
        """Influence-grid points on both sides of the joint."""
        if not self.joint:
            return np.zeros(0)
        x = self.joint[0]
        return np.array([x - 1e-6, x, x + 1e-6, x + JOINT_LINK + 1e-6])


class Basis:
    def __init__(self, model):
        self.model = model
        self.lengths = [s.length for s in model.spans]
        self.support_x = np.r_[0.0, np.cumsum(self.lengths)]
        self.length = float(self.support_x[-1])
        self.x, self.span_ids, self.sides = stations(model)
        self.nx = len(self.x)
        self.ns = len(self.support_x)
        # V, M, D at every station, then vertical and moment reactions.
        self.nresponse = 3 * self.nx + 2 * self.ns
        self.ei = [span_ei(model, i) for i in range(len(self.lengths))]
        # v0.9.99: PyCBA members and nodes (deck joint included).
        self.structure = Structure(model, self.ei)
        self.ba = self.structure.analysis()
        self.owner = self.structure.station_members(self.x, self.sides)
        # A Basis has immutable geometry/EI; only its loads change. These small
        # per-instance caches must never be shared with another Basis.
        beam = self.ba._beam
        beam.k_theta = lru_cache(maxsize=5)(beam.k_theta)
        beam.get_span_k = lru_cache(maxsize=5)(beam.get_span_k)
        beam.get_ref = lru_cache(maxsize=5)(beam.get_ref)
        self.nintegrate = 480 if model.precision == "standard" else 960
        self.ba.npts = self.nintegrate
        self.interpolators = []
        self.eps = 1e-9
        # Exact section sides. Duplicate interior-support stations deliberately
        # carry the two distinct shears, rather than averaged reactions.
        self.cut = self.x + np.array(
            [-self.eps if side == "left" else self.eps for side in self.sides]
        )
        self.lever = np.maximum(self.x[None, :] - self.support_x[:, None], 0)
        self.left = (self.support_x[:, None] < self.cut[None, :]).astype(float)
        self.max_equilibrium_error = 0.0

    def read_result(self, ba):
        """Member-local interpolation; R is read from support reactions only."""
        st = self.structure
        return st.reactions(ba), st.deflections(ba, self.x, self.owner)

    def build(self):
        samples = 48 if self.model.precision == "standard" else 96
        for i, m in enumerate(self.structure.members):
            if not m["active"]:
                # Cut link or removed part: no load is ever applied there.
                self.interpolators.append(None)
                continue
            length = m["end"] - m["start"]
            ei = self.structure.member_eis[i]
            q = np.linspace(0, length, samples + 1)
            # Include section discontinuities in the load interpolation grid.
            if isinstance(ei, cba.SectionEI):
                q = np.unique(np.r_[q, ei.breakpoints])
                # Merge near-coincident knots (floating-point twins such as
                # 1.0875 and 1.0875000000000001). A CubicSpline with knots
                # 1e-16 m apart is ill-conditioned and silently breaks the
                # equilibrium of the interpolated reactions.
                tolerance = 1e-6 * length
                keep = np.r_[True, np.diff(q) > tolerance]
                if not keep[-1]:  # keep the exact span end, drop its twin
                    keep[-1], keep[-2] = True, len(q) == 2
                q = q[keep]
            values = []
            for a in q:
                self.solve_loads([[i + 1, 2, 1.0, float(a), 0]])
                reaction, deflection = self.read_result(self.ba)
                vertical, moment = reaction[: self.ns], reaction[self.ns :]
                err = max(
                    abs(vertical.sum() - 1),
                    abs(vertical @ self.support_x + moment.sum() - (a + m["start"]))
                    / max(1, self.length),
                )
                self.max_equilibrium_error = max(self.max_equilibrium_error, float(err))
                values.append(np.r_[reaction, deflection])
            self.interpolators.append(CubicSpline(q, np.asarray(values), axis=0))
        return self

    def solve_loads(self, loads):
        # PyCBA asks for identical fixed-end forces during assembly and result
        # recovery. Reuse them only until the next load matrix is assigned.
        self.ba._beam.get_ref.cache_clear()
        self.ba.set_loads(loads)
        self.ba.analyze()

    def unit(self, positions):
        """Rows are point-load locations; columns V, M, downward D, R, Mr."""
        p = np.atleast_1d(np.asarray(positions, float))
        rd = np.zeros((len(p), 2 * self.ns + self.nx))
        st = self.structure
        for m, spline in zip(st.members, self.interpolators):
            if spline is None:
                continue
            mask = st.in_member(m, p)
            if mask.any():
                rd[mask] = spline(np.maximum(p[mask] - m["start"], 0))
        r, mr = rd[:, : self.ns], rd[:, self.ns : 2 * self.ns]
        d = rd[:, 2 * self.ns :]
        # On the deck that is analysed (kept part of a cut deck).
        on = st.active(p)
        v = r @ self.left - ((p[:, None] < self.cut) & on[:, None])
        m = (
            r @ self.lever
            - mr @ self.left
            - np.maximum(self.x[None, :] - p[:, None], 0) * on[:, None]
        )
        return np.c_[v, m, d, r, mr]

    def unit_columns(self, positions, cols):
        """Like :meth:`unit` for the crossing rows of :func:`crossing_rows`:
        columns ``cols`` (P, 5) = V, M, δ of one station s per row, then R and
        Mr of a support k (or -1: 0). Only the needed spline columns are
        evaluated, from the piecewise-cubic coefficients (v0.9.8)."""
        p = np.atleast_1d(np.asarray(positions, float))
        nx, ns = self.nx, self.ns
        s = cols[:, 0]
        r, mr, d = np.zeros((len(p), ns)), np.zeros((len(p), ns)), np.zeros(len(p))
        st = self.structure
        for m, spline in zip(st.members, self.interpolators):
            if spline is None:
                continue
            rows = np.flatnonzero(st.in_member(m, p))
            if not len(rows):
                continue
            local = np.maximum(p[rows] - m["start"], 0)
            seg = np.clip(
                np.searchsorted(spline.x, local, side="right") - 1,
                0,
                len(spline.x) - 2,
            )
            dx = (local - spline.x[seg])[:, None]
            c = spline.c[:, seg, : 2 * ns]  # (4, rows, 2 ns)
            rm = ((c[0] * dx + c[1]) * dx + c[2]) * dx + c[3]
            r[rows], mr[rows] = rm[:, :ns], rm[:, ns:]
            c = spline.c[:, seg, 2 * ns + s[rows]]  # (4, rows)
            dx = dx[:, 0]
            d[rows] = ((c[0] * dx + c[1]) * dx + c[2]) * dx + c[3]
        on = st.active(p).astype(float)
        left, lever = self.left[:, s].T, self.lever[:, s].T
        out = np.zeros((len(p), 5))
        out[:, 0] = (r * left).sum(axis=1) - (p < self.cut[s]) * on
        out[:, 1] = (
            (r * lever).sum(axis=1)
            - (mr * left).sum(axis=1)
            - np.maximum(self.x[s] - p, 0) * on
        )
        out[:, 2] = d
        k = cols[:, 3] - 3 * nx
        has = cols[:, 3] >= 0
        out[has, 3] = r[has, k[has]]
        out[has, 4] = mr[has, k[has]]
        return out

    def static_dead(self):
        st = self.structure
        intervals = st.clip_intervals(dead_intervals(self.model))
        loads = [
            load
            for v in intervals
            for load in st.pycba_udl(v["start"], v["end"], v["w"])
        ]
        if not loads:
            return np.zeros(self.nresponse), intervals
        self.solve_loads(loads)
        reaction, d = self.read_result(self.ba)
        r, mr = reaction[: self.ns], reaction[self.ns :]
        v, m = r @ self.left, r @ self.lever - mr @ self.left
        for load in intervals:
            a, b, w = load["start"], load["end"], load["w"]
            v -= w * np.clip(self.x - a, 0, b - a)
            m -= (
                w
                / 2
                * (np.maximum(self.x - a, 0) ** 2 - np.maximum(self.x - b, 0) ** 2)
            )
        return np.r_[v, m, d, r, mr], intervals

    def udl(self, pieces):
        """Response to uniform loads ``(start, end, w)`` in bridge coordinates
        (kN/m), split at the supports."""
        loads, parts = [], []
        for a, b, w in self.structure.clip(pieces):
            if not w:
                continue
            loads += self.structure.pycba_udl(a, b, w)
            parts.append((a, b, w))
        if not loads:
            return np.zeros(self.nresponse)
        self.solve_loads(loads)
        reaction, d = self.read_result(self.ba)
        r, mr = reaction[: self.ns], reaction[self.ns :]
        v, m = r @ self.left, r @ self.lever - mr @ self.left
        for a, b, w in parts:
            v -= w * np.clip(self.x - a, 0, b - a)
            m -= (
                w
                / 2
                * (np.maximum(self.x - a, 0) ** 2 - np.maximum(self.x - b, 0) ** 2)
            )
        return np.r_[v, m, d, r, mr]

    def full_lane(self, w):
        """Response to a companion UDL covering the entire bridge deck
        (PyCBA ``run_load_model(..., w_lane=...)``; QuickerBridge <= 0.9.95)."""
        return self.udl([(0.0, self.length, w)])

    def span_units(self):
        """(spans, responses): response to 1 kN/m on each span alone.
        Geometry only, so it is cached on this immutable Basis."""
        if getattr(self, "_span_units", None) is None:
            self._span_units = np.array(
                [
                    self.udl([(a, a + length, 1.0)])
                    for a, length in zip(self.support_x[:-1], self.lengths)
                ]
            )
        return self._span_units

    def influence_grid(self):
        """Dense unit-load grid (every station +/- 1e-6 m) and its responses,
        for UDLs placed on the parts of an influence line of one sign."""
        if getattr(self, "_influence_grid", None) is None:
            n = 161 if self.model.precision == "standard" else 321
            grid = np.concatenate(
                [
                    np.linspace(a, b, n)
                    for a, b in zip(self.support_x[:-1], self.support_x[1:])
                ]
            )
            q = np.unique(
                np.clip(
                    np.r_[
                        grid,
                        self.x - 1e-6,
                        self.x + 1e-6,
                        self.structure.extra_points(),
                    ],
                    0,
                    self.length,
                )
            )
            self._influence_grid = (q, self.unit(q))
        return self._influence_grid

    def influence_areas(self):
        """Areas of the negative and positive parts of every influence line
        (a segment changing sign is split at its linear root)."""
        q, u = self.influence_grid()
        h = np.diff(q)[:, None]
        y0, y1 = u[:-1], u[1:]
        both = np.abs(y0) + np.abs(y1)
        safe = np.where(both > 0, both, 1)
        mixed = (y0 < 0) != (y1 < 0)
        pos = np.where(
            mixed, np.maximum(y0, y1) ** 2 / (2 * safe), np.maximum((y0 + y1) / 2, 0)
        )
        neg = np.where(
            mixed, -np.minimum(y0, y1) ** 2 / (2 * safe), np.minimum((y0 + y1) / 2, 0)
        )
        return (h * neg).sum(axis=0), (h * pos).sum(axis=0)


def lane_envelope(basis, extent):
    """Lowest and highest responses to a 1 kN/m lane UDL placed per response.

    S6 C3.8.4.1: the uniformly distributed load is applied only where it
    increases the total load effect. By superposition its best placement does
    not depend on the truck position, so it simply adds to the axles.
    """
    if extent == "spans":
        units = basis.span_units()
        return np.minimum(units, 0).sum(axis=0), np.maximum(units, 0).sum(axis=0)
    if extent == "influence":
        return basis.influence_areas()
    full = basis.full_lane(1.0)
    return full, full


def lane_pieces(basis, extent, index=None, sense="max", w=1.0):
    """Loaded parts ``(start, end, w)`` of the lane UDL behind one extreme."""
    if extent == "full" or index is None:
        return [(0.0, basis.length, w)]
    sign = 1 if sense == "max" else -1
    if extent == "spans":
        units = basis.span_units()[:, index]
        return [
            (float(basis.support_x[i]), float(basis.support_x[i + 1]), w)
            for i in range(len(basis.lengths))
            if sign * units[i] > 1e-12
        ]
    q, u = basis.influence_grid()
    y = sign * u[:, index]
    pieces, start = [], None
    for k in range(len(q)):
        if y[k] > 1e-12 and start is None:
            start = q[k]
            if k and y[k - 1] < 0:  # entering: root of the segment
                start = q[k - 1] + (q[k] - q[k - 1]) * -y[k - 1] / (y[k] - y[k - 1])
        elif y[k] <= 1e-12 and start is not None:
            end = q[k]
            if y[k] < 0:
                end = q[k - 1] + (q[k] - q[k - 1]) * y[k - 1] / (y[k - 1] - y[k])
            pieces.append((float(start), float(end), w))
            start = None
    if start is not None:
        pieces.append((float(start), float(q[-1]), w))
    # Merge pieces split only by a station duplicate (shear jump, 2e-6 m).
    merged = []
    for a, b, ww in pieces:
        if merged and a - merged[-1][1] < 1e-5:
            merged[-1] = (merged[-1][0], b, ww)
        else:
            merged.append((a, b, ww))
    return merged


def pedestrian_width(model):
    """Tributary width (m): the slab effective width of the first section
    with a slab, else the width entered (2000 mm by default)."""
    ped = model.pedestrian
    if ped.width_source == "slab":
        for section in model.sections:
            slab = section.composite
            if slab is not None and slab.enabled:
                return slab.effective_width / 1000
    return ped.width / 1000


PEDESTRIAN_MAX = 4.25  # kPa, S6-25 3.8.9


def pedestrian_intensity(ped, loaded_length):
    """S6-25 3.8.9: p = 4.25 (0.5 + √(5 / s)) kPa, at most 4.25 kPa, with s
    the total loaded length (m). ``ped`` is kept for the call signature."""
    s = max(float(loaded_length), 1e-9)
    return float(min(PEDESTRIAN_MAX * (0.5 + (5.0 / s) ** 0.5), PEDESTRIAN_MAX))


def pedestrian_record(mask, loaded_length, p, width):
    return case_record(
        "pedestrian",
        "forward",
        -1,
        [],
        1,
        spans=[i + 1 for i, on in enumerate(mask) if on],
        loaded_length=float(loaded_length),
        intensity=float(p),
        width=float(width),
    )


def pedestrian_envelope(model, basis):
    """Envelope of the pedestrian load over every combination of loaded
    spans (2^n - 1). The intensity depends on the total loaded length s, so
    every combination is evaluated, not only the spans of one sign.

    Returns ``[(low, infos_low), (high, infos_high)]``; an info is None
    where no combination has the sign sought (value 0).
    """
    units = basis.span_units()
    n = len(basis.lengths)
    width = pedestrian_width(model)
    subsets = np.array(
        [[(m >> i) & 1 for i in range(n)] for m in range(1, 2**n)], float
    )
    lengths = subsets @ np.asarray(basis.lengths)
    p = np.array([pedestrian_intensity(model.pedestrian, s) for s in lengths])
    w = p * width * model.live.factor
    values = (subsets * w[:, None]) @ units
    out = []
    for is_low in (True, False):
        rows = values.argmin(axis=0) if is_low else values.argmax(axis=0)
        best = values[rows, np.arange(values.shape[1])]
        loaded = best < -1e-10 if is_low else best > 1e-10
        infos = [
            pedestrian_record(subsets[r], lengths[r], p[r], width) if on else None
            for r, on in zip(rows, loaded)
        ]
        out.append((np.where(loaded, best, 0.0), infos))
    return out


def vehicle_model(model):
    """The model whose vehicle is analysed: itself, or with pedestrians the
    maintenance vehicle (no lane load, no axle factor); None if none."""
    if model.live.source != "pedestrian":
        return model
    if not model.pedestrian.maintenance:
        return None
    vm = model.model_copy(deep=True)
    vm.live.vehicle = "Maintenance"
    vm.live.case = "truck"
    vm.live.axle_factor = 1.0
    return vm


def live_scale(model, basis):
    """S6-25 FT per response column (V, M, D, R, Mr), or None if not applied.

    FT applies to the whole live-load effect of one lane (trucks and lane
    load, ML and VL): V takes the shear FT of its zone, M and δ the moment FT;
    reactions keep one full lane. Positive factors commute with the envelope,
    so the live envelope is simply scaled column by column.
    """
    if not ft_applied(model):
        return None
    fv, fm, _ = station_factors(model, basis.x, basis.sides)
    rv, rm, _ = support_factors(model, basis)
    return np.r_[fv, fm, fm, rv, rm]


def support_factors(model, basis):
    """FT shear (R), FT moment (Mr) and Fs at each support.

    A reaction is the jump of V at its support, so it takes the shear FT of
    the zone holding the support (one M− zone over a continuous pier). Where
    two zones meet (hinge between simple spans), the larger value is kept.
    """
    xs = np.repeat(basis.support_x, 2)
    sides = ["left", "right"] * basis.ns
    fv, fm, fs = (
        np.asarray(f).reshape(-1, 2) for f in station_factors(model, xs, sides)
    )
    # Exterior supports only have one side on the bridge.
    for f in (fv, fm, fs):
        f[0, 0], f[-1, 1] = f[0, 1], f[-1, 0]
    return fv.max(axis=1), fm.max(axis=1), fs.max(axis=1)


def dead_scale(model, basis):
    """Skew factor Fs on the dead-load shear and reactions of an exterior
    girder (5.6.6.2)."""
    d = model.distribution
    if not ft_applied(model) or d.girder != "exterior" or not d.fs_dead:
        return None
    _, _, fs = station_factors(model, basis.x, basis.sides)
    _, _, rs = support_factors(model, basis)
    return np.r_[fs, np.ones(2 * basis.nx), rs, np.ones(basis.ns)]


def displayed_axle_factor(model):
    """Factor carried by the axle loads themselves (1 when FT zones apply,
    and with pedestrians: the maintenance vehicle takes no axle factor)."""
    if ft_applied(model) or model.live.source == "pedestrian":
        return 1.0
    return model.live.axle_factor


def structure_key(model):
    data = model.model_dump()
    for section in data["sections"]:
        # The slab matters for the stiffness only through a composite
        # inertia (3n, 1n, I′), recomputed at every depth of a taper: keep it
        # then, without its display-only data (v0.9.99 fix: the basis was
        # rebuilt without slab, i.e. with the girder alone).
        slab = section.get("composite")
        if (
            slab
            and slab.get("enabled")
            and section.get("inertia_source") in ("3n", "1n", "negative")
        ):
            for key in ("region", "y3", "y_steel", "y_3n", "y_1n", "y_neg", "frqr"):
                slab.pop(key, None)
        else:
            section.pop("composite", None)
    for key in (
        "live",
        "dead",
        "self_weight",
        "thermal",
        "load_mode",
        "modal",
        "distribution",
        "pedestrian",
        "resistance",
    ):
        data.pop(key)
    return json.dumps(data, sort_keys=True)


@lru_cache(maxsize=4)
def cached_basis(key):
    return Basis(Model.model_validate_json(key)).build()


def mtq_active(model: Model) -> bool:
    """MTQ automatic 63 % / 80 % axle fraction applies to this model."""
    return (
        model.live.vehicle == "CL750QC"
        and model.live.mtq_auto
        and model.live.evaluation == "design"  # v0.9.97: S6-25 14.9.1.7
    )


def mtq_lane_fractions(model: Model, basis):
    """Axle fraction (0.63 or 0.80) of the CL-750-QC lane case per response.

    MTQ Info-structures A2023-05: the 12.6 kN/m lane load is superimposed on
    the CL-750-QC truck with axles at 80 %, but at 63 % for single-span
    bridges and culverts, for the positive moment and vertical shear of
    multi-span bridges, for the reactions of a multi-span bridge at an axis
    without deck continuity, and for bearing movements and deck joints.
    Returns ``(low, high)`` arrays over the response columns V, M, D, R, Mr
    (one value per column and per envelope sense):

    * single span: 0.63 everywhere;
    * multi-span: V 0.63 (both senses); M "high" (positive moment) 0.63 except
      at stations inside the negative-moment zones around the interior piers,
      where 0.80 (the integral-abutment zones keep 0.63); M "low" (negative moment) 0.80; D, Mr 0.80;
    * R: 0.63 at the end abutments and at supports next to a simple span
      (hinge: no deck continuity), 0.80 at continuous interior supports.

    The M− zones are the geometric ones of S6-25 Figure 5.1
    (``distribution.effective_spans``, with h = 0), independent of whether FT
    is enabled. A manual position record uses 0.80 (no target response).
    """
    nx, ns = basis.nx, basis.ns
    count = basis.nresponse
    low, high = np.full(count, 0.8), np.full(count, 0.8)
    if len(model.spans) == 1:
        low[:], high[:] = 0.63, 0.63
        return low, high
    low[:nx] = high[:nx] = 0.63
    zones = [z[4] for z in effective_spans(model, 0.0, 0.0)[1] if z[3] != "abutment"]
    positive = np.full(nx, 0.63)
    for a, b in zones:
        positive[(basis.x >= a - 1e-9) & (basis.x <= b + 1e-9)] = 0.8
    high[nx : 2 * nx] = positive
    breaks = deck_breaks(model)
    for k in range(ns):
        if breaks[k]:
            low[3 * nx + k] = high[3 * nx + k] = 0.63
    return low, high


def case_record(case, direction, position, axles, factor, **metadata):
    return {
        "case": case,
        "direction": direction,
        "position": float(position),
        "axles": axles,
        "factor": float(factor),
        **metadata,
    }


def position_record(model: Model, position: float, direction: str):
    """Full vehicle at a user-selected position in the selected load case."""
    model = vehicle_model(model) or model
    weights, _ = vehicle_data(model.live)
    ids = list(range(1, len(weights) + 1))
    _, _, lane_style = lane_parameters(model.live)
    is_lane = model.live.case == "lane" and lane_style != "none"
    factor = dynamic_factor(
        ids,
        model.live.dynamic,
        model.live.vehicle in CANADIAN_VEHICLES,
        model.live.vehicle,
    )
    if is_lane and model.live.vehicle in CANADIAN_VEHICLES:
        factor = 1.0
    # A user-positioned vehicle has no target effect: with MTQ automatic
    # fraction it uses the 80 % axles (the "all effects" rule).
    extra = {"fraction": 0.8} if is_lane and mtq_active(model) else {}
    return case_record(
        "lane" if is_lane else "truck",
        direction,
        position,
        ids,
        factor,
        manual=True,
        **extra,
    )


CHUNK = 64  # travel positions per vectorized block


def truck_selector(groups, count):
    """Exact shortcut over every axle subset of a vehicle (v0.9.8).

    For a fixed number k of axles the largest (smallest) effect of any subset
    is the sum of the k largest (smallest) axle effects. Every subset of size
    k shares the dynamic factor of that size, except a few special groups
    (CL-625 / CL-750-QC axles 1-2-3: 1.30 instead of 1.25), evaluated
    explicitly. With ``base[k]`` the smallest factor of size k, the maximum
    over k of ``base[k] x top-k`` and the special groups equals the maximum
    over the 2^n - 1 groups. Returns None when the groups are not every
    subset (single full-vehicle group).
    """
    from math import comb

    if len(groups) <= 1:
        return None
    sizes = {}
    for group in groups:
        sizes.setdefault(len(group["axles"]), []).append(group)
    if any(len(sizes.get(k, [])) != comb(count, k) for k in range(1, count + 1)):
        return None
    base = np.array(
        [min(g["factor"] for g in sizes[k]) for k in range(1, count + 1)], float
    )
    special = [g for g in groups if g["factor"] > base[len(g["axles"]) - 1] + 1e-12]
    return {"base": base, "special": special}


def crossing_rows(basis, offsets, sign, begin, end):
    """Front-axle positions putting an axle exactly on a station (and 1e-7 m
    either side), with the response columns each one is evaluated for:
    V, M, δ of that station, R and Mr when the station is a support (else -1).
    """
    nx, ns = basis.nx, basis.ns
    support = np.full(nx, -1)
    for k, xs in enumerate(basis.support_x):
        support[np.abs(basis.x - xs) < 1e-9] = k
    s = np.repeat(np.arange(nx), len(offsets) * 3)
    shift = np.tile(np.repeat([0.0, -1e-7, 1e-7], 1), nx * len(offsets))
    axle = np.tile(np.repeat(np.arange(len(offsets)), 3), nx)
    p = basis.x[s] - sign * offsets[axle] + shift
    keep = (p >= begin) & (p <= end)
    s, p = s[keep], p[keep]
    k = support[s]
    cols = np.c_[
        s,
        nx + s,
        2 * nx + s,
        np.where(k >= 0, 3 * nx + k, -1),
        np.where(k >= 0, 3 * nx + ns + k, -1),
    ]
    return p, cols


def _best_rows(values, cols, is_low):
    """Extreme candidate per response column: ``(columns, values, rows, slots)``.

    ``values`` is (positions, K). Without ``cols`` slot j is column j; with a
    (positions, K) column map, the extreme over every row holding a column
    (first occurrence on ties, like ``argmin``/``argmax``).
    """
    if cols is None:
        rows = values.argmin(axis=0) if is_low else values.argmax(axis=0)
        slots = np.arange(values.shape[1])
        return slots, values[rows, slots], rows, slots
    flat, c = values.ravel(), cols.ravel()
    order = np.lexsort((flat if is_low else -flat, c))
    c_sorted = c[order]
    first = np.r_[True, c_sorted[1:] != c_sorted[:-1]]
    pick = order[first]
    pick = pick[c[pick] >= 0]
    k = values.shape[1]
    return c[pick], flat[pick], pick // k, pick % k


def _envelope_block(ctx, effects, p, cols, direction, variant):
    """Update the live envelopes with one block of vehicle positions.

    ``effects`` (axles, positions, K) holds each nominal axle's effect on the
    K responses of the block: every response (``cols`` None) or the per-row
    columns of ``cols``. Truck alone (every axle subset, exact shortcut of
    ``truck_selector``) and truck + lane (Canadian: full truck only).
    """
    model, live = ctx["model"], ctx["model"].live
    groups, selector, scale = ctx["groups"], ctx["selector"], ctx["scale"]
    take = (lambda a: a) if cols is None else (lambda a: a[np.maximum(cols, 0)])
    candidates = []  # (name, low values, high values, record(sense, row, slot))
    if ctx["include_truck"] and selector is not None:
        base, special = selector["base"], selector["special"]
        # Axles on the last (contiguous) axis: sorting 5 values per cell is fast.
        ordered = np.sort(np.moveaxis(effects, 0, -1), axis=-1)
        pair = []
        for is_low in (True, False):
            sums = np.cumsum(ordered if is_low else ordered[..., ::-1], axis=-1) * base
            k = sums.argmin(axis=-1) if is_low else sums.argmax(axis=-1)
            best = np.take_along_axis(sums, k[..., None], axis=-1)[..., 0]
            code = k + 1  # number of axles; special groups are -(index + 1)
            for n, group in enumerate(special):
                value = np.einsum("a,apc->pc", group["mask"], effects) * group["factor"]
                better = value < best - 1e-10 if is_low else value > best + 1e-10
                best = np.where(better, value, best)
                code = np.where(better, -(n + 1), code)
            pair.append((best * scale * live.factor, code))

        def truck_record(is_low, row, slot, codes=(pair[0][1], pair[1][1])):
            c = int(codes[0 if is_low else 1][row, slot])
            if c < 0:
                return special[-c - 1]["axles"], special[-c - 1]["factor"], {}
            column = effects[:, row, slot]
            order = np.argsort(column if is_low else -column, kind="stable")
            return sorted(int(a) + 1 for a in order[:c]), float(base[c - 1]), {}

        candidates.append(("truck", pair[0][0], pair[1][0], truck_record))
        lane_groups = []
        if ctx["include_lane"]:
            lane_groups = groups[-1:] if live.vehicle in CANADIAN_VEHICLES else groups
    else:
        lane_groups = groups
    for group in lane_groups:
        axle_effect = np.einsum("a,apc->pc", group["mask"], effects) * scale

        def group_record(is_low, row, slot, group=group, extra=None):
            return group["axles"], group["factor"], {}

        if ctx["include_truck"] and selector is None:
            amplified = axle_effect * group["factor"] * live.factor
            candidates.append(("truck", amplified, amplified, group_record))
        if ctx["include_lane"] and (
            live.vehicle not in CANADIAN_VEHICLES
            or len(group["axles"]) == ctx["n_axles"]
        ):
            axle_factor = lane_axle_factor(live, group["factor"])
            mtq = ctx["mtq"]
            axle_lo, axle_hi = (
                (take(mtq[0]), take(mtq[1])) if mtq else (axle_factor, axle_factor)
            )
            lane_lo, lane_hi = take(ctx["lane_lo"]), take(ctx["lane_hi"])
            # The record factor reports dynamic allowance.  A Canadian lane
            # reduction is deliberately not DLA.
            reported = group["factor"] if live.vehicle in HL93_VEHICLES else 1.0

            def lane_record(is_low, row, slot, group=group, reported=reported):
                extra = {}
                if mtq:
                    column = slot if cols is None else cols[row, slot]
                    extra = {"fraction": float(mtq[0 if is_low else 1][column])}
                return group["axles"], reported, extra

            candidates.append(
                (
                    "lane",
                    (axle_effect * axle_lo + lane_lo) * live.factor,
                    (axle_effect * axle_hi + lane_hi) * live.factor,
                    lane_record,
                )
            )
    for name, lows, highs, record in candidates:
        for is_low, values, target, infos in (
            (True, lows, ctx["low"], ctx["info_low"]),
            (False, highs, ctx["high"], ctx["info_high"]),
        ):
            columns, cand, rows, slots = _best_rows(values, cols, is_low)
            changed = np.flatnonzero(
                cand < target[columns] - 1e-10
                if is_low
                else cand > target[columns] + 1e-10
            )
            for i in changed:
                j = columns[i]
                target[j] = cand[i]
                axles, factor, extra = record(is_low, rows[i], slots[i])
                infos[j] = case_record(
                    name, direction, p[rows[i]], list(axles), factor, **variant, **extra
                )


def analyse(model: Model):
    if model.load_mode == "thermal":
        from .thermal import analyse_thermal

        return analyse_thermal(model)
    started = time.perf_counter()
    basis = cached_basis(structure_key(model))
    # Basis geometry is cached; permanent loads belong to this request.
    old = basis.model
    basis.model = model
    dead, intervals = basis.static_dead()
    basis.model = old
    if model.load_mode == "live":
        dead *= 0
        intervals = []
    count = basis.nresponse
    low, high = np.zeros(count), np.zeros(count)
    info_low = [case_record("unloaded", "forward", 0, [], 1) for _ in range(count)]
    info_high = [dict(r) for r in info_low]
    pedestrian = model.live.source == "pedestrian"
    # The vehicle analysed: the model's own, the maintenance vehicle beside
    # the pedestrians (never concomitant), or none.
    vm = vehicle_model(model)
    run_vehicle = vm is not None and model.load_mode != "dead"
    vehicle_live = (vm or model).live
    weights, offsets = vehicle_data(vehicle_live)
    if vm is None:
        weights, offsets = np.zeros(0), np.zeros(0)
    variants = vehicle_variants(vehicle_live)
    step = 0.25 if model.precision == "standard" else 0.1
    steps = 0
    groups = axle_groups(vehicle_live) if vm is not None else []
    lane_w, fraction, lane_style = lane_parameters(vehicle_live)
    if vm is None:
        lane_w, lane_style = 0.0, "none"
    include_lane = vehicle_live.case != "truck" and lane_style != "none"
    include_truck = vehicle_live.case != "lane" or lane_style == "none"
    lane_lo = lane_hi = np.zeros(count)
    scale = displayed_axle_factor(model)
    # MTQ automatic fraction: per response column and envelope sense.
    mtq = mtq_lane_fractions(model, basis) if mtq_active(model) else None
    selector = truck_selector(groups, len(weights))
    timing = {"influence": 0.0, "envelope": 0.0, "crossings": 0.0}
    if run_vehicle:
        model_live, model = model, vm
        if include_lane:
            # v0.9.96: the UDL is placed per response (lane_extent).
            unit_lo, unit_hi = lane_envelope(basis, model.live.lane_extent)
            lane_lo, lane_hi = unit_lo * lane_w, unit_hi * lane_w
        ctx = {
            "model": model,
            "groups": groups,
            "selector": selector,
            "include_truck": include_truck,
            "include_lane": include_lane,
            "scale": scale,
            "lane_lo": lane_lo,
            "lane_hi": lane_hi,
            "mtq": mtq,
            "n_axles": len(weights),
            "low": low,
            "high": high,
            "info_low": info_low,
            "info_high": info_high,
        }
        # v0.9.7: always both travel directions.
        directions = ["forward", "reverse"]
        for weights, offsets, variant in variants:
            for direction in directions:
                # Physical front axle: p-offset for forward; p+offset for reverse.
                sign = -1 if direction == "forward" else 1
                begin, end = (
                    (0, basis.length + offsets[-1])
                    if sign == -1
                    else (-offsets[-1], basis.length)
                )
                travel = np.linspace(begin, end, int(np.ceil((end - begin) / step)) + 1)
                steps += len(travel)
                for start in range(0, len(travel), CHUNK):
                    p = travel[start : start + CHUNK]
                    tick = time.perf_counter()
                    effects = np.array(
                        [basis.unit(p + sign * a) * w for a, w in zip(offsets, weights)]
                    )
                    timing["influence"] += time.perf_counter() - tick
                    tick = time.perf_counter()
                    _envelope_block(ctx, effects, p, None, direction, variant)
                    timing["envelope"] += time.perf_counter() - tick
                # v0.9.8: exact axle/station crossings (shear and reaction
                # jumps, moment kinks) only matter for the responses AT that
                # station: V, M, δ there and R, Mr when it is a support. They
                # are evaluated for those columns only (was: every column).
                tick = time.perf_counter()
                p, cols = crossing_rows(basis, offsets, sign, begin, end)
                steps += len(p)
                for start in range(0, len(p), 4 * CHUNK):
                    q, c = p[start : start + 4 * CHUNK], cols[start : start + 4 * CHUNK]
                    effects = np.array(
                        [
                            basis.unit_columns(q + sign * a, c) * w
                            for a, w in zip(offsets, weights)
                        ]
                    )
                    _envelope_block(ctx, effects, q, c, direction, variant)
                timing["crossings"] += time.perf_counter() - tick
        if include_lane:
            # Include the lane case with its truck completely off the bridge.
            for target, candidate, infos, sense in (
                (low, lane_lo * model.live.factor, info_low, -1),
                (high, lane_hi * model.live.factor, info_high, 1),
            ):
                changed = np.flatnonzero(sense * candidate > sense * target + 1e-10)
                target[changed] = candidate[changed]
                for j in changed:
                    infos[j] = case_record("lane", "forward", -1, [], 1)
        if model.live.two_trucks and model.live.vehicle in HL93_VEHICLES:
            if include_lane and basis.ns > 2:
                steps += two_truck_envelope(
                    basis, model, low, high, info_low, info_high, step
                )
        model = model_live
    # S6-25 FT: per-girder live effects (whole live load, by zone) and Fs on
    # the dead-load shear of an exterior girder.
    ls, ds = live_scale(model, basis), dead_scale(model, basis)
    if ls is not None and model.load_mode != "dead":
        low *= ls
        high *= ls
    if pedestrian and model.load_mode != "dead":
        # v0.9.96: pedestrians over every combination of loaded spans; the
        # maintenance vehicle (if any) is an alternative, never added.
        (p_low, p_info_low), (p_high, p_info_high) = pedestrian_envelope(model, basis)
        for target, candidate, infos, cand_infos, sense in (
            (low, p_low, info_low, p_info_low, -1),
            (high, p_high, info_high, p_info_high, 1),
        ):
            for j in np.flatnonzero(sense * candidate > sense * target + 1e-10):
                target[j] = candidate[j]
                infos[j] = cand_infos[j]
    if ds is not None:
        dead = dead * ds
    low += dead
    high += dead
    nx, ns = basis.nx, basis.ns

    def pack(values):
        return {
            "V": values[:nx].tolist(),
            "M": values[nx : 2 * nx].tolist(),
            "D": values[2 * nx : 3 * nx].tolist(),
            "R": values[3 * nx : 3 * nx + ns].tolist(),
            "Mr": values[3 * nx + ns :].tolist(),
        }

    extrema = []
    for response, a, b, senses in (
        ("M", nx, 2 * nx, ["max", "min"]),
        ("V", 0, nx, ["max", "min"]),
        ("D", 2 * nx, 3 * nx, ["max", "min"]),
    ):
        for sense in senses:
            vals, info = (high, info_high) if sense == "max" else (low, info_low)
            j = a + (vals[a:b].argmax() if sense == "max" else vals[a:b].argmin())
            extrema.append(
                {
                    "response": response,
                    "sense": sense,
                    "value": float(vals[j]),
                    "x": float(basis.x[j - a]),
                    "index": int(j),
                    **info[j],
                }
            )
    fixity = support_fixity(model, basis.ei)
    splits = split_stations(basis.x, basis.sides, basis.support_x, model)
    reactions = [
        {
            "support": i + 1,
            "x": float(x),
            "min": float(low[3 * nx + i]),
            "max": float(high[3 * nx + i]),
            "min_case": info_low[3 * nx + i],
            "max_case": info_high[3 * nx + i],
            "type": model.supports[i],
            "k": (
                float(model.support_springs[i])
                if model.supports[i] == "spring"
                else None
            ),
            "fixity": fixity[i],
            "moment_min": float(low[3 * nx + ns + i]),
            "moment_max": float(high[3 * nx + ns + i]),
            "moment_index": 3 * nx + ns + i,
            # Split pier: V stations each side; R left = −V(x⁻), R right = V(x⁺).
            "split": splits.get(i),
        }
        for i, x in enumerate(basis.support_x)
    ]
    table = []
    for i, x in enumerate(basis.x):
        span = basis.span_ids[i]
        local = x - basis.support_x[span]
        fraction_x = local / basis.lengths[span] * model.subdivisions
        if abs(fraction_x - round(fraction_x)) < 1e-7:
            table.append(
                {
                    "span": span + 1,
                    "station": int(round(fraction_x)),
                    "x": float(x),
                    "local_x": float(local),
                    "side": basis.sides[i],
                    "V_min": float(low[i]),
                    "V_max": float(high[i]),
                    "M_min": float(low[nx + i]),
                    "M_max": float(high[nx + i]),
                    "D_min": float(low[2 * nx + i]),
                    "D_max": float(high[2 * nx + i]),
                }
            )
    return {
        "kind": "mechanical",
        "x": basis.x.tolist(),
        "sides": basis.sides,
        "span_ids": basis.span_ids,
        "min": pack(low),
        "max": pack(high),
        "dead": pack(dead),
        "extrema": extrema,
        "reactions": reactions,
        "table": table,
        "case_min": info_low,
        "case_max": info_high,
        "stiffness": stiffness_profile(model),
        "sections": [properties(s) for s in model.sections],
        "vehicle": {
            "weights": weights.tolist(),
            "offsets": offsets.tolist(),
            "lane_w": lane_w,
            "fraction": fraction,
            "lane_style": lane_style,
            "mtq_auto": mtq_active(model),
            "lane_extent": model.live.lane_extent,
            "source": model.live.source,
            "name": vehicle_live.vehicle if vm is not None else None,
            "pedestrian_width": pedestrian_width(model) if pedestrian else None,
        },
        "meta": {
            "elapsed": round(time.perf_counter() - started, 3),
            "travel_step": step,
            "positions": steps,
            "groups": len(groups),
            "spacing_variants": len(variants),
            "equilibrium_error": basis.max_equilibrium_error,
            "pycba": cba.__version__,
            "precision": model.precision,
            "timing": {k: round(v, 3) for k, v in timing.items()},
        },
        "ft": (
            {
                "girder": model.distribution.girder,
                "state": model.distribution.state,
                "zones": truck_fraction(model)["zones"],
            }
            if ft_applied(model) and model.load_mode != "dead"
            else None
        ),
        "model": model.model_dump(),
    }


def two_truck_envelope(basis, model, low, high, info_low, info_high, step):
    """AASHTO 3.6.1.3.1: 90% two trucks + full-deck lane; M− and interior R.

    Fixed 14 ft axle spacing; clear headway >= 50 ft, varied on the travel
    grid. Truck centres occupy adjacent spans. A prefix optimum searches all
    admissible headways in linear time. Axles opposing the effect are omitted.
    Reference: FHWA-HIF-16-002 Vol. 20, section 6.2.1 (pp. 18–19).
    """
    nx, ns = basis.nx, basis.ns
    weights = np.array([35.0, 145.0, 145.0])
    offsets = np.array([0.0, 14 * 0.3048, 28 * 0.3048])
    length = offsets[-1]
    clearance = 50 * 0.3048 + length
    uniform = basis.full_lane(1.0)[nx : 2 * nx]
    negative = uniform < -1e-8
    # Keep only negative-moment regions connected to an interior pier.
    eligible = np.zeros(nx, dtype=bool)
    changes = np.diff(np.r_[False, negative, False].astype(int))
    for a, b in zip(np.flatnonzero(changes == 1), np.flatnonzero(changes == -1)):
        if any(basis.x[a] <= x <= basis.x[b - 1] for x in basis.support_x[1:-1]):
            eligible[a:b] = True
    moment_indices = nx + np.flatnonzero(eligible)
    reactions = 3 * nx + np.arange(1, ns - 1)
    indices = np.r_[moment_indices, reactions]
    if not len(indices):
        return 0
    lane_lo = lane_hi = basis.full_lane(9.3)
    scale = displayed_axle_factor(model)
    factor = 1.33 if model.live.dynamic else 1.0
    directions = ["forward", "reverse"]
    positions = 0
    for direction in directions:
        sign = -1 if direction == "forward" else 1
        q = np.unique(
            np.r_[
                np.linspace(0, basis.length, int(np.ceil(basis.length / step)) + 1),
                (basis.support_x[:, None] - sign * (offsets - length / 2)).ravel(),
            ]
        )
        # Include exactly 50 ft clear headway at every sampled position and
        # axle/support crossing; a coarse travel grid must not skip this limit.
        q = np.unique(np.r_[q, q - clearance, q + clearance])
        q = q[(q >= 0) & (q <= basis.length)]
        positions += len(q)
        effects = np.empty((3, len(q), len(indices)))
        for a, (offset, weight) in enumerate(zip(offsets, weights)):
            for start in range(0, len(q), 128):
                p = q[start : start + 128] + sign * (offset - length / 2)
                effects[a, start : start + 128] = basis.unit(p)[:, indices] * weight
        for sense, target, infos, lane in (
            (-1, low, info_low, lane_lo),
            (1, high, info_high, lane_hi),
        ):
            scores = np.maximum(sense * effects, 0).sum(axis=0)
            for column, index in enumerate(indices):
                if sense == 1 and index < 3 * nx:
                    continue  # supplementary case never affects M+, V or D
                best_score, best_pair = -np.inf, None
                for span in range(ns - 2):
                    left = np.flatnonzero(
                        (q >= basis.support_x[span]) & (q <= basis.support_x[span + 1])
                    )
                    right = np.flatnonzero(
                        (q >= basis.support_x[span + 1])
                        & (q <= basis.support_x[span + 2])
                    )
                    allowed = (
                        np.searchsorted(
                            q[left], q[right] - clearance + 1e-10, side="right"
                        )
                        - 1
                    )
                    right, allowed = right[allowed >= 0], allowed[allowed >= 0]
                    if not len(right):
                        continue
                    values = scores[left, column]
                    prefix = np.maximum.accumulate(values)
                    chosen = np.maximum.accumulate(
                        np.where(values == prefix, np.arange(len(left)), 0)
                    )
                    pairs = prefix[allowed] + scores[right, column]
                    k = int(pairs.argmax())
                    if pairs[k] > best_score:
                        best_score = float(pairs[k])
                        best_pair = (int(left[chosen[allowed[k]]]), int(right[k]))
                if best_pair is None:
                    continue
                value = (
                    0.9
                    * model.live.factor
                    * (sense * best_score * factor * scale + lane[index])
                )
                if sense * value <= sense * target[index] + 1e-10:
                    continue
                axles = []
                for truck, k in enumerate(best_pair):
                    for a, (offset, weight) in enumerate(zip(offsets, weights)):
                        x = q[k] + sign * (offset - length / 2)
                        if (
                            0 <= x <= basis.length
                            and sense * effects[a, k, column] > 1e-12
                        ):
                            axles.append(
                                {
                                    "id": truck * 3 + a + 1,
                                    "x": float(x),
                                    "load": float(weight),
                                }
                            )
                fronts = [float(q[k] - sign * length / 2) for k in best_pair]
                target[index] = value
                infos[index] = case_record(
                    "hl93_two_trucks",
                    direction,
                    fronts[0],
                    [a["id"] for a in axles],
                    factor,
                    second_position=fronts[1],
                    gap=float(q[best_pair[1]] - q[best_pair[0]] - length),
                    reduction=0.9,
                    special_axles=axles,
                    target_index=int(index),
                    sense="min" if sense == -1 else "max",
                )
    return positions


def record_axles(model, record, length):
    """Factored axle loads on the bridge for one governing/position record."""
    if record.get("case") == "pedestrian":
        return []
    model = vehicle_model(model) or model
    if record.get("case") == "hl93_two_trucks":
        return [
            {
                **a,
                "load": a["load"]
                * 0.9
                * record["factor"]
                * displayed_axle_factor(model)
                * model.live.factor,
            }
            for a in record["special_axles"]
        ]
    weights, offsets = vehicle_data(model.live, record.get("rear_spacing"))
    sign = -1 if record.get("direction") == "forward" else 1
    p = record.get("position", 0)
    ids = record.get("axles", list(range(1, len(weights) + 1)))
    factor = record.get("factor", 1)
    if model.load_mode == "dead" or record.get("case") == "unloaded":
        ids = []
    if record.get("case") == "lane":
        factor = lane_axle_factor(model.live, factor, record)
    return [
        {
            "id": i + 1,
            "x": float(p + sign * offset),
            "load": float(
                weights[i] * displayed_axle_factor(model) * factor * model.live.factor
            ),
        }
        for i, offset in enumerate(offsets)
        if i + 1 in ids and 0 <= p + sign * offset <= length
    ]


def influence(model, station, support=None, case_max=None, case_min=None):
    """Unit-load influence lines (1 kN downward) for one station and support.

    Columns come straight from the cached influence basis, so this costs one
    vectorized interpolation. The governing arrangements of M at the station
    are returned as axle positions to overlay the vehicle on the line.
    """
    basis = cached_basis(structure_key(model))
    nx, ns = basis.nx, basis.ns
    if not 0 <= station < nx:
        raise ValueError("influence.station")
    xi = float(basis.x[station])
    if support is None:
        support = int(np.abs(basis.support_x - xi).argmin())
    if not 0 <= support < ns:
        raise ValueError("influence.support")
    grid = np.concatenate(
        [
            np.linspace(a, b, 161 if model.precision == "standard" else 321)
            for a, b in zip(basis.support_x[:-1], basis.support_x[1:])
        ]
    )
    q = np.unique(
        np.clip(
            np.r_[grid, xi - 1e-6, xi + 1e-6, basis.structure.extra_points()],
            0,
            basis.length,
        )
    )
    u = basis.unit(q)
    out = {
        "x": q.tolist(),
        "station": int(station),
        "x_station": xi,
        "side": basis.sides[station],
        "support": support + 1,
        "x_support": float(basis.support_x[support]),
        "fixed": model.supports[support] in ("fixed", "spring"),
        "V": u[:, station].tolist(),
        "M": u[:, nx + station].tolist(),
        "D": u[:, 2 * nx + station].tolist(),
        "R": u[:, 3 * nx + support].tolist(),
        "Mr": u[:, 3 * nx + ns + support].tolist(),
    }
    for key, record in (("governing_max", case_max), ("governing_min", case_min)):
        if record and record.get("case") != "unloaded":
            out[key] = {
                "record": record,
                "axles": record_axles(model, record, basis.length),
            }
    return out


def traverse(model, direction="forward", frames=60):
    """Precompute a full-vehicle crossing for a cheap client-side animation.

    Values are on the report stations. Dead load and a full-length companion
    lane load are computed once; each frame only adds the axle influences.
    """
    frames = int(min(max(frames, 10), 150))
    basis = cached_basis(structure_key(model))
    model = vehicle_model(model) or model
    nx, ns = basis.nx, basis.ns
    _, offsets = vehicle_data(model.live)
    begin, end = (
        (0.0, basis.length + offsets[-1])
        if direction == "forward"
        else (-offsets[-1], basis.length)
    )
    first = position_record(model, begin, direction)
    old = basis.model
    basis.model = model
    dead, _ = basis.static_dead()
    basis.model = old
    if model.load_mode == "live":
        dead = dead * 0
    lane_w, _, lane_style = lane_parameters(model.live)
    base = dead.copy()
    lane = []
    # The crossing shows the positioned vehicle with its lane load on the
    # whole deck, like a user-positioned snapshot.
    if first["case"] == "lane" and lane_style != "none" and model.load_mode != "dead":
        base += basis.full_lane(lane_w * model.live.factor)
        lane = [{"start": 0.0, "end": basis.length, "w": lane_w * model.live.factor}]
    out = []
    ls, ds = live_scale(model, basis), dead_scale(model, basis)
    for position in np.linspace(begin, end, frames):
        record = position_record(model, float(position), direction)
        axles = record_axles(model, record, basis.length)
        values = base.copy()
        for axle in axles:
            values += basis.unit([axle["x"]])[0] * axle["load"]
        if ls is not None:  # per-girder live effects (S6-25 FT by zone)
            values = dead * (1 if ds is None else ds) + (values - dead) * ls
        frame_lane = lane
        out.append(
            {
                "position": float(position),
                "axles": axles,
                "lane": frame_lane,
                "V": np.round(values[:nx], 4).tolist(),
                "M": np.round(values[nx : 2 * nx], 4).tolist(),
                "D": np.round(values[2 * nx : 3 * nx], 5).tolist(),
                "R": np.round(values[3 * nx : 3 * nx + ns], 4).tolist(),
                "Mr": np.round(values[3 * nx + ns :], 4).tolist(),
                "record": record,
            }
        )
    return {"direction": direction, "x": basis.x.tolist(), "frames": out}


def snapshot(model, record, target_index=None, sense="max"):
    """Reconstruct one compatible load arrangement behind an envelope extreme."""
    basis = cached_basis(structure_key(model))
    old = basis.model
    basis.model = model
    dead, intervals = basis.static_dead()
    basis.model = old
    if model.load_mode == "live":
        dead *= 0
        intervals = []
    special = record.get("case") == "hl93_two_trucks"
    walkers = record.get("case") == "pedestrian"
    is_lane = record.get("case") == "lane" or special or walkers
    lane_w, _, _ = lane_parameters((vehicle_model(model) or model).live)
    if special:
        lane_w *= 0.9
    axles = record_axles(model, record, basis.length)
    # v0.9.99: an axle on a removed part of a cut deck carries nothing.
    axles = [a for a in axles if basis.structure.active(a["x"])]
    # Physical arrangement first (equilibrium, reactions, graph); the S6-25
    # zone fractions are applied to the per-girder effects at the end.
    values = dead.copy()
    for axle in axles:
        values += basis.unit([axle["x"]])[0] * axle["load"]
    lane_intervals = []
    if is_lane and model.load_mode != "dead":
        if walkers:
            # Pedestrians: the loaded spans of the record, p(s) x width.
            w = record["intensity"] * record["width"] * model.live.factor
            pieces = [
                (float(basis.support_x[i - 1]), float(basis.support_x[i]), w)
                for i in record["spans"]
            ]
        else:
            # v0.9.96: the lane UDL is on the parts that increase the effect
            # sought (whole bridge for a user-positioned vehicle).
            extent = "full" if special else model.live.lane_extent
            manual = record.get("manual") or target_index is None
            pieces = lane_pieces(
                basis,
                extent,
                None if manual else target_index,
                sense,
                lane_w * model.live.factor,
            )
        pieces = basis.structure.clip(pieces)
        lane_intervals = [{"start": a, "end": b, "w": w} for a, b, w in pieces]
        values += basis.udl(pieces)
    nx = basis.nx
    total_load = sum(a["load"] for a in axles) + sum(
        (v["end"] - v["start"]) * v["w"] for v in intervals
    )
    total_moment = sum(a["load"] * a["x"] for a in axles) + sum(
        (v["end"] - v["start"]) * v["w"] * (v["end"] + v["start"]) / 2
        for v in intervals
    )
    for load in lane_intervals:
        total_load += load["w"] * (load["end"] - load["start"])
        total_moment += (
            load["w"]
            * (load["end"] - load["start"])
            * (load["end"] + load["start"])
            / 2
        )
    r = values[3 * nx : 3 * nx + basis.ns]
    mr = values[3 * nx + basis.ns :]
    # Add both sides of every applied point load to the plotted snapshot. The
    # reporting grid stays unchanged; a diagonal connecting across an axle
    # would otherwise visually conceal its shear jump.
    graph_stations = set(zip(basis.x, basis.sides))
    for axle in axles:
        graph_stations.update([(axle["x"], "left"), (axle["x"], "right")])
    graph_stations = sorted(graph_stations)
    gx = np.array([x for x, side in graph_stations])
    gc = gx + np.array(
        [-basis.eps if side == "left" else basis.eps for x, side in graph_stations]
    )
    gv = r @ (basis.support_x[:, None] < gc)
    gm = r @ np.maximum(gx[None, :] - basis.support_x[:, None], 0)
    gm -= mr @ (basis.support_x[:, None] < gc)
    for axle in axles:
        gv -= axle["load"] * (axle["x"] < gc)
        gm -= axle["load"] * np.maximum(gx - axle["x"], 0)
    for load in intervals:
        a, b, w = load["start"], load["end"], load["w"]
        gv -= w * np.clip(gx - a, 0, b - a)
        gm -= w / 2 * (np.maximum(gx - a, 0) ** 2 - np.maximum(gx - b, 0) ** 2)
    if is_lane:
        for load in lane_intervals:
            a, b, w = load["start"], load["end"], load["w"]
            gv -= w * np.clip(gx - a, 0, b - a)
            gm -= w / 2 * (np.maximum(gx - a, 0) ** 2 - np.maximum(gx - b, 0) ** 2)
    if ft_applied(model):
        # Per-girder effects: the live part (trucks and lane load) takes the
        # zone FT (V: shear, M and δ: moment), the dead-load shear of an
        # exterior girder takes Fs. R and Mr stay physical, so the equilibrium
        # check above is the one of the actual load arrangement.
        rd = dead[3 * nx : 3 * nx + basis.ns]
        mrd = dead[3 * nx + basis.ns :]
        dv = rd @ (basis.support_x[:, None] < gc)
        dm = rd @ np.maximum(gx[None, :] - basis.support_x[:, None], 0)
        dm -= mrd @ (basis.support_x[:, None] < gc)
        for load in intervals:
            a, b, w = load["start"], load["end"], load["w"]
            dv -= w * np.clip(gx - a, 0, b - a)
            dm -= w / 2 * (np.maximum(gx - a, 0) ** 2 - np.maximum(gx - b, 0) ** 2)
        fv, fm, fs = (
            np.asarray(f)
            for f in station_factors(model, gx, [s for _, s in graph_stations])
        )
        exterior = model.distribution.girder == "exterior"
        gv = dv * (fs if exterior else 1) + (gv - dv) * fv
        gm = dm + (gm - dm) * fm
        ds = dead_scale(model, basis)
        values = dead * (1 if ds is None else ds) + (values - dead) * live_scale(
            model, basis
        )
    ux, ui = np.unique(basis.x, return_index=True)
    gd = np.interp(gx, ux, values[2 * nx : 3 * nx][ui])
    graph = {
        "x": gx.tolist(),
        "sides": [side for x, side in graph_stations],
        "V": gv.tolist(),
        "M": gm.tolist(),
        "D": gd.tolist(),
    }
    return {
        "x": basis.x.tolist(),
        "V": values[:nx].tolist(),
        "M": values[nx : 2 * nx].tolist(),
        "D": values[2 * nx : 3 * nx].tolist(),
        # Per-girder reactions when FT applies; the equilibrium below stays the
        # physical check of the actual load arrangement (r, mr).
        "R": values[3 * nx : 3 * nx + basis.ns].tolist(),
        "Mr": values[3 * nx + basis.ns :].tolist(),
        "plot": graph,
        "axles": axles,
        "lane": lane_intervals,
        "dead_loads": intervals,
        "record": record,
        "equilibrium": {
            "force": float(r.sum() - total_load),
            "moment": float(r @ basis.support_x + mr.sum() - total_moment),
        },
    }


def _static_moments(model, result, self_weight: bool, loads):
    """Moments (kN·m) at every report station of a subset of permanent loads."""
    return _static_response(model, result, self_weight, loads)[1]


def _static_response(model, result, self_weight: bool, loads):
    """V (kN) and M (kN·m) at every report station of a subset of permanent
    loads (v0.9.99: V too, for the resistance sheet)."""
    nx = len(result["x"])
    with_sw = self_weight and model.self_weight.apply
    if model.load_mode == "live" or (not loads and not with_sw):
        return [0.0] * nx, [0.0] * nx
    subset = model.model_copy(deep=True)
    subset.dead = [load.model_copy() for load in loads]
    subset.self_weight.apply = with_sw
    basis = cached_basis(structure_key(model))
    old = basis.model
    basis.model = subset
    values, _ = basis.static_dead()
    basis.model = old
    shear = values[:nx]
    ds = dead_scale(model, basis)
    if ds is not None:  # Fs on the dead-load shear of an exterior girder
        shear = shear * ds[:nx]
    return [float(v) for v in shear], [float(v) for v in values[nx : 2 * nx]]


def stage_moments(model, result):
    """Permanent-load moments per stage at every station (v0.9.6).

    The girder self-weight and the loads marked "steel" (slab weight in
    unshored construction) act on the girder alone; the other permanent
    loads on the composite 3n section.
    """
    nx = len(result["x"])
    if model.load_mode == "live":
        zero = [0.0] * nx
        return zero, zero, zero
    m_sw = _static_moments(model, result, True, [])
    steel_loads = [d for d in model.dead if d.stage == "steel"]
    m_steel = _static_moments(model, result, False, steel_loads)
    m_3n = [result["dead"]["M"][i] - m_sw[i] - m_steel[i] for i in range(nx)]
    return m_sw, m_steel, m_3n


def stage_effects(model, result):
    """Permanent-load V and M per stage at every station (v0.9.99).

    Same stages as :func:`stage_moments`: girder self-weight and "girder
    alone" loads on the steel, the other permanent loads on the 3n section
    (the remainder of the analysed permanent effects).
    """
    nx = len(result["x"])
    if model.load_mode == "live":
        zero = [0.0] * nx
        return {"V": (zero, zero, zero), "M": (zero, zero, zero)}
    v_sw, m_sw = _static_response(model, result, True, [])
    steel_loads = [d for d in model.dead if d.stage == "steel"]
    v_st, m_st = _static_response(model, result, False, steel_loads)
    dead = result["dead"]
    return {
        "V": (v_sw, v_st, [dead["V"][i] - v_sw[i] - v_st[i] for i in range(nx)]),
        "M": (m_sw, m_st, [dead["M"][i] - m_sw[i] - m_st[i] for i in range(nx)]),
    }


def stress_at(model, result, index, moments=None):
    """Staged stresses over the depth at report station ``index``.

    Self-weight and "steel" permanent loads on the girder alone, the other
    permanent loads on the composite 3n section, the live load on the 1n
    section, for the envelope maximum and minimum at the station (FT and
    factors included, as displayed).
    """
    from .section_props import stress_profile
    from .sections import section_at

    x, side = result["x"][index], result["sides"][index]
    section = section_at(model, x, side)
    if section.kind not in ("girder", "nebt"):
        raise ValueError("stress.section_kind")  # needs a known section
    m_sw, m_steel, m_3n = moments or stage_moments(model, result)
    dead_total = result["dead"]["M"][index]
    live_max = result["max"]["M"][index] - dead_total
    live_min = result["min"]["M"][index] - dead_total
    out = {"x": x, "side": side, "section": section.model_dump(), "cases": {}}
    for case, live in (("max", live_max), ("min", live_min)):
        stage = {
            "steel": m_sw[index] + m_steel[index],
            "3n": m_3n[index],
            "1n": live,
        }
        out["cases"][case] = stress_profile(section, stage)
    out["moments"] = {
        "self_weight": m_sw[index],
        "dead_steel": m_steel[index],
        "dead_3n": m_3n[index],
        "live_max": live_max,
        "live_min": live_min,
    }
    return out


def stress_all(model, result):
    """Total stresses (M max and M min cases) at every station (v0.9.6).

    Feeds the hover preview and the fixed stress scale: per station the
    section drawing data, the fibres and the totals of both cases; plus the
    extreme tension and compression of the bridge. Composite properties are
    computed once per distinct section.
    """
    import json

    from .section_props import composite_properties, stress_profile
    from .sections import section_at

    m_sw, m_steel, m_3n = stage_moments(model, result)
    sections, keys, comps, stations = [], {}, {}, []
    t_max, c_max = 0.0, 0.0
    for i, (x, side) in enumerate(zip(result["x"], result["sides"])):
        section = section_at(model, x, side)
        if section.kind not in ("girder", "nebt"):
            stations.append(None)
            continue
        key = json.dumps(section.model_dump(), sort_keys=True)
        if key not in keys:
            keys[key] = len(sections)
            sections.append(section.model_dump())
            slab = section.composite
            comps[key] = (
                composite_properties(section, slab)
                if slab is not None and slab.enabled
                else None
            )
        dead_total = result["dead"]["M"][i]
        out = {"s": keys[key]}
        for case in ("max", "min"):
            moments = {
                "steel": m_sw[i] + m_steel[i],
                "3n": m_3n[i],
                "1n": result[case]["M"][i] - dead_total,
            }
            prof = stress_profile(section, moments, comps[key])
            out[case] = prof["total"]
            if case == "max":
                out["fibres"] = [[f["name"], f["y"]] for f in prof["fibres"]]
                out["height"] = prof["height"]
                out["composite"] = prof["composite"]
            values = list(prof["total"].values())
            t_max = max(t_max, *values)
            c_max = min(c_max, *values)
        stations.append(out)
    return {
        "sections": sections,
        "stations": stations,
        "tension": t_max,
        "compression": c_max,
    }
