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
from .distribution import applied as ft_applied, station_factors, truck_fraction
from .sections import member_deflection, stiffness_profile, span_ei, properties
from .loads import (
    CANADIAN_VEHICLES,
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
    for i, span in enumerate(model.spans):
        local = np.unique(
            np.r_[
                np.linspace(0, span.length, 81),
                np.linspace(0, span.length, model.subdivisions + 1),
            ]
        )
        for a in local:
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
        else:
            out.append(kind)
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
    restrained = [kind in ("fixed", "spring") for kind in model.supports]
    left, right = [False] * n, [False] * n
    for i, span in enumerate(model.spans):
        if span.simple:
            left[i] = restrained[0] if i == 0 else True
            right[i] = restrained[n] if i == n - 1 else True
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
        self.ba = cba.BeamAnalysis(
            self.lengths,
            self.ei,
            supports=pycba_supports(model),
            eletype=member_types(model),
        )
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
        ds = []
        start = 0.0
        for i, (length, result) in enumerate(zip(self.lengths, ba.beam_results.vRes)):
            local_x = result.x[1:-1] - start
            refined = member_deflection(local_x, result.M[1:-1], self.ei[i])
            if refined is not None:
                local_x, local_d = refined
            else:
                local_d = result.D[1:-1].copy()
                # Both end deflections are known to be zero. Correct the
                # integration constant's small trapezoidal drift.
                local_d -= local_d[0] + local_x / length * (local_d[-1] - local_d[0])
            query = self.x[np.array(self.span_ids) == i] - start
            ds.extend(-1000 * np.interp(query, local_x, local_d))
            start += length
        return node_reactions(ba), np.array(ds)

    def build(self):
        samples = 48 if self.model.precision == "standard" else 96
        for i, length in enumerate(self.lengths):
            q = np.linspace(0, length, samples + 1)
            # Include section discontinuities in the load interpolation grid.
            if isinstance(self.ei[i], cba.SectionEI):
                q = np.unique(np.r_[q, self.ei[i].breakpoints])
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
                    abs(
                        vertical @ self.support_x
                        + moment.sum()
                        - (a + self.support_x[i])
                    )
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
        for i, length in enumerate(self.lengths):
            mask = (p >= self.support_x[i]) & (p <= self.support_x[i + 1])
            if mask.any():
                rd[mask] = self.interpolators[i](p[mask] - self.support_x[i])
        r, mr = rd[:, : self.ns], rd[:, self.ns : 2 * self.ns]
        d = rd[:, 2 * self.ns :]
        on = (p >= 0) & (p <= self.length)
        v = r @ self.left - ((p[:, None] < self.cut) & on[:, None])
        m = (
            r @ self.lever
            - mr @ self.left
            - np.maximum(self.x[None, :] - p[:, None], 0) * on[:, None]
        )
        return np.c_[v, m, d, r, mr]

    def static_dead(self):
        intervals = dead_intervals(self.model)
        if not intervals:
            return np.zeros(self.nresponse), intervals
        self.solve_loads(
            [[v["span"] + 1, 3, v["w"], v["a"], v["b"] - v["a"]] for v in intervals]
        )
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

    def lane(self, w):
        # Fixed grid augmented on BOTH sides of every response station: the
        # discontinuity in a shear influence line must never be integrated across.
        base = np.concatenate(
            [
                np.linspace(a, b, 241 if self.model.precision == "standard" else 481)
                for a, b in zip(self.support_x[:-1], self.support_x[1:])
            ]
        )
        q = np.unique(
            np.clip(
                np.r_[base, self.x - 2 * self.eps, self.x + 2 * self.eps],
                0,
                self.length,
            )
        )
        u = self.unit(q)
        integrate = np.trapezoid
        return (
            w * integrate(np.minimum(u, 0), q, axis=0),
            w * integrate(np.maximum(u, 0), q, axis=0),
            q,
            u,
        )

    def full_lane(self, w):
        """Response to a companion UDL covering the entire bridge deck.

        This is the lane-load arrangement used by PyCBA's
        ``BridgeAnalysis.run_load_model(..., w_lane=...)``. Custom lanes alone
        can use :meth:`lane` for adverse-region placement.
        """
        self.solve_loads(
            [[i + 1, 3, w, 0.0, length] for i, length in enumerate(self.lengths)]
        )
        reaction, d = self.read_result(self.ba)
        r, mr = reaction[: self.ns], reaction[self.ns :]
        v, m = r @ self.left, r @ self.lever - mr @ self.left
        for start, length in zip(self.support_x[:-1], self.lengths):
            end = start + length
            v -= w * np.clip(self.x - start, 0, length)
            m -= (
                w
                / 2
                * (
                    np.maximum(self.x - start, 0) ** 2
                    - np.maximum(self.x - end, 0) ** 2
                )
            )
        return np.r_[v, m, d, r, mr]


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
    if not ft_applied(model) or model.distribution.girder != "exterior":
        return None
    _, _, fs = station_factors(model, basis.x, basis.sides)
    _, _, rs = support_factors(model, basis)
    return np.r_[fs, np.ones(2 * basis.nx), rs, np.ones(basis.ns)]


def displayed_axle_factor(model):
    """Factor carried by the axle loads themselves (1 when FT zones apply)."""
    return 1.0 if ft_applied(model) else model.live.axle_factor


def structure_key(model):
    data = model.model_dump()
    for section in data["sections"]:
        section.pop("composite", None)  # display-only section properties
    for key in (
        "live",
        "dead",
        "self_weight",
        "thermal",
        "load_mode",
        "modal",
        "distribution",
    ):
        data.pop(key)
    return json.dumps(data, sort_keys=True)


@lru_cache(maxsize=4)
def cached_basis(key):
    return Basis(Model.model_validate_json(key)).build()


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
    return case_record("lane" if is_lane else "truck", direction, position, ids, factor)


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
    weights, offsets = vehicle_data(model.live)
    variants = vehicle_variants(model.live)
    step = 0.25 if model.precision == "standard" else 0.1
    steps = 0
    groups = axle_groups(model.live)
    lane_w, fraction, lane_style = lane_parameters(model.live)
    include_lane = model.live.case != "truck" and lane_style != "none"
    include_truck = model.live.case != "lane" or lane_style == "none"
    lane_lo = lane_hi = np.zeros(count)
    scale = displayed_axle_factor(model)
    if model.load_mode != "dead":
        if include_lane:
            if lane_style == "patterned":
                lane_lo, lane_hi, _, _ = basis.lane(lane_w)
            else:
                lane_lo = lane_hi = basis.full_lane(lane_w)
        directions = (
            ["forward", "reverse"]
            if model.live.direction == "both"
            else [model.live.direction]
        )
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
                # Exact axle/support crossings matter for reaction and shear peaks.
                crossings = (basis.x[:, None] - sign * offsets[None, :]).ravel()
                travel = np.unique(
                    np.r_[travel, crossings, crossings - 1e-7, crossings + 1e-7]
                )
                travel = travel[(travel >= begin) & (travel <= end)]
                steps += len(travel)
                for start in range(0, len(travel), 64):
                    p = travel[start : start + 64]
                    effects = np.array(
                        [basis.unit(p + sign * a) * w for a, w in zip(offsets, weights)]
                    )
                    for group in groups:
                        raw = np.einsum(
                            "a,apc->pc", group["mask"], effects, optimize=False
                        )
                        axle_effect = raw * scale
                        cases = []
                        if include_truck:
                            amplified = (
                                axle_effect * group["factor"] * model.live.factor
                            )
                            cases.append(
                                ("truck", amplified, amplified, group["factor"])
                            )
                        if include_lane and (
                            model.live.vehicle not in CANADIAN_VEHICLES
                            or len(group["axles"]) == len(weights)
                        ):
                            axle_factor = lane_axle_factor(model.live, group["factor"])
                            # The record factor reports dynamic allowance.  A
                            # Canadian lane reduction is deliberately not DLA.
                            reported_factor = (
                                group["factor"]
                                if model.live.vehicle in {"HL93Truck", "HL93Tandem"}
                                else 1.0
                            )
                            cases.append(
                                (
                                    "lane",
                                    (axle_effect * axle_factor + lane_lo)
                                    * model.live.factor,
                                    (axle_effect * axle_factor + lane_hi)
                                    * model.live.factor,
                                    reported_factor,
                                )
                            )
                        for name, lows, highs, factor in cases:
                            il, ih = lows.argmin(axis=0), highs.argmax(axis=0)
                            vl, vh = (
                                lows[il, np.arange(count)],
                                highs[ih, np.arange(count)],
                            )
                            for target, candidate, indices, infos, is_low in (
                                (low, vl, il, info_low, True),
                                (high, vh, ih, info_high, False),
                            ):
                                changed = np.flatnonzero(
                                    candidate < target - 1e-10
                                    if is_low
                                    else candidate > target + 1e-10
                                )
                                target[changed] = candidate[changed]
                                for j in changed:
                                    infos[j] = case_record(
                                        name,
                                        direction,
                                        p[indices[j]],
                                        group["axles"],
                                        factor,
                                        **variant,
                                    )
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
    if (
        model.load_mode != "dead"
        and model.live.two_trucks
        and model.live.vehicle in {"HL93Truck", "HL93Tandem"}
        and include_lane
        and basis.ns > 2
    ):
        steps += two_truck_envelope(basis, model, low, high, info_low, info_high, step)
    # S6-25 FT: per-girder live effects (whole live load, by zone) and Fs on
    # the dead-load shear of an exterior girder.
    ls, ds = live_scale(model, basis), dead_scale(model, basis)
    if ls is not None and model.load_mode != "dead":
        low *= ls
        high *= ls
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
    """AASHTO 3.6.1.3.1: 90% two trucks + adverse lane; M− and interior R.

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
    lane_lo, lane_hi, _, _ = basis.lane(9.3)
    scale = displayed_axle_factor(model)
    factor = 1.33 if model.live.dynamic else 1.0
    directions = (
        ["forward", "reverse"]
        if model.live.direction == "both"
        else [model.live.direction]
    )
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
        factor = lane_axle_factor(model.live, factor)
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
    q = np.unique(np.clip(np.r_[grid, xi - 1e-6, xi + 1e-6], 0, basis.length))
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
    patterned = first["case"] == "lane" and lane_style == "patterned"
    if first["case"] == "lane" and lane_style == "full" and model.load_mode != "dead":
        base += basis.full_lane(lane_w * model.live.factor)
        lane = [{"start": 0.0, "end": basis.length, "w": lane_w * model.live.factor}]
    out = []
    ls, ds = live_scale(model, basis), dead_scale(model, basis)
    for position in np.linspace(begin, end, frames):
        record = position_record(model, float(position), direction)
        if patterned:
            snap = snapshot(model, record)
            values = np.r_[snap["V"], snap["M"], snap["D"], snap["R"], snap["Mr"]]
            axles, frame_lane = snap["axles"], snap["lane"]
        else:
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
    is_lane = record.get("case") == "lane" or special
    lane_w, _, lane_style = lane_parameters(model.live)
    if special:
        lane_style = "patterned"
        lane_w *= 0.9
        target_index = record["target_index"]
        sense = record["sense"]
    axles = record_axles(model, record, basis.length)
    # Physical arrangement first (equilibrium, reactions, graph); the S6-25
    # zone fractions are applied to the per-girder effects at the end.
    values = dead.copy()
    for axle in axles:
        values += basis.unit([axle["x"]])[0] * axle["load"]
    lane_intervals = []
    lane_q = np.array([])
    lane_mass = np.array([])
    if is_lane and model.load_mode != "dead":
        lane_w *= model.live.factor
        if lane_style == "full":
            lane_intervals.append({"start": 0.0, "end": basis.length, "w": lane_w})
            values += basis.full_lane(lane_w)
        else:
            _, _, q, u = basis.lane(lane_w)
            target_index = int(target_index or 0)
            polarity = 1 if sense == "max" else -1
            selected = polarity * u[:, target_index] > 1e-12
            dq = np.diff(q)
            lane_q = q
            lane_mass = (
                lane_w * selected * np.r_[dq[0] / 2, (dq[:-1] + dq[1:]) / 2, dq[-1] / 2]
            )
            # Integrate the SAME nodal pattern for every effect (coincident
            # result), not the individual envelopes of the other responses.
            values += lane_w * np.trapezoid(u * selected[:, None], q, axis=0)
            changes = np.diff(np.r_[False, selected, False].astype(int))
            for a, b in zip(np.where(changes == 1)[0], np.where(changes == -1)[0]):
                lane_intervals.append(
                    {
                        "start": float(q[a]),
                        "end": float(q[min(b, len(q) - 1)]),
                        "w": lane_w,
                    }
                )
    nx = basis.nx
    total_load = sum(a["load"] for a in axles) + sum(
        (v["end"] - v["start"]) * v["w"] for v in intervals
    )
    total_moment = sum(a["load"] * a["x"] for a in axles) + sum(
        (v["end"] - v["start"]) * v["w"] * (v["end"] + v["start"]) / 2
        for v in intervals
    )
    if is_lane:
        if lane_style == "full":
            total_load += lane_w * basis.length
            total_moment += lane_w * basis.length**2 / 2
        else:
            total_load += lane_w * np.trapezoid(selected.astype(float), q)
            total_moment += lane_w * np.trapezoid(selected * q, q)
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
    if is_lane and lane_style == "full":
        for load in lane_intervals:
            a, b, w = load["start"], load["end"], load["w"]
            gv -= w * np.clip(gx - a, 0, b - a)
            gm -= w / 2 * (np.maximum(gx - a, 0) ** 2 - np.maximum(gx - b, 0) ** 2)
    if len(lane_q):
        cumulative = np.r_[0, np.cumsum(lane_mass)]
        moments = np.r_[0, np.cumsum(lane_mass * lane_q)]
        gv -= cumulative[np.searchsorted(lane_q, gc, side="left")]
        before = np.searchsorted(lane_q, gx, side="left")
        gm -= gx * cumulative[before] - moments[before]
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


def stress_at(model, result, index, self_weight_stage="steel", dead_stage="3n"):
    """Staged stresses over the depth at report station ``index`` (v0.9.4).

    The girder self-weight acts on ``self_weight_stage``, the other permanent
    loads on ``dead_stage`` (steel alone or composite 3n), the live load on
    the composite 1n section, for the envelope maximum and minimum at the
    station (FT and factors included, as displayed).
    """
    from .section_props import stress_profile
    from .sections import section_at

    nx = len(result["x"])
    x, side = result["x"][index], result["sides"][index]
    section = section_at(model, x, side)
    if section.kind != "girder":
        raise ValueError("stress.section_kind")  # needs plate dimensions
    dead_total = result["dead"]["M"][index]
    m_sw = 0.0
    if model.load_mode != "live" and model.self_weight.apply:
        only_sw = model.model_copy(deep=True)
        only_sw.dead = []
        basis = cached_basis(structure_key(model))
        old = basis.model
        basis.model = only_sw
        values, _ = basis.static_dead()
        basis.model = old
        m_sw = float(values[nx + index])
    m_dead = dead_total - m_sw
    live_max = result["max"]["M"][index] - dead_total
    live_min = result["min"]["M"][index] - dead_total
    out = {"x": x, "side": side, "section": section.model_dump(), "cases": {}}
    for case, live in (("max", live_max), ("min", live_min)):
        moments = {"steel": 0.0, "3n": 0.0, "1n": live}
        moments[self_weight_stage] += m_sw
        moments[dead_stage] += m_dead
        out["cases"][case] = stress_profile(section, moments)
    out["moments"] = {
        "self_weight": m_sw,
        "dead": m_dead,
        "live_max": live_max,
        "live_min": live_min,
        "self_weight_stage": self_weight_stage,
        "dead_stage": dead_stage,
    }
    return out
