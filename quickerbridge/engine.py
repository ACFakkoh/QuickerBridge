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
from .sections import span_ei, properties
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


class Basis:
    def __init__(self, model):
        self.model = model
        self.lengths = [s.length for s in model.spans]
        self.support_x = np.r_[0.0, np.cumsum(self.lengths)]
        self.length = float(self.support_x[-1])
        self.x, self.span_ids, self.sides = stations(model)
        self.nx = len(self.x)
        self.ns = len(self.support_x)
        self.nresponse = 3 * self.nx + self.ns
        self.ei = [span_ei(model, i) for i in range(len(self.lengths))]
        self.ba = cba.BeamAnalysis(self.lengths, self.ei, supports=model.supports)
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
            local_d = result.D[1:-1].copy()
            # Both end deflections are known to be zero. Correct the integration
            # constant's small trapezoidal drift using the end boundary condition.
            local_d -= local_d[0] + local_x / length * (local_d[-1] - local_d[0])
            query = self.x[np.array(self.span_ids) == i] - start
            ds.extend(-1000 * np.interp(query, local_x, local_d))
            start += length
        return np.asarray(ba.beam_results.R, float), np.array(ds)

    def build(self):
        samples = 48 if self.model.precision == "standard" else 96
        for i, length in enumerate(self.lengths):
            q = np.linspace(0, length, samples + 1)
            # Include section discontinuities in the load interpolation grid.
            if isinstance(self.ei[i], cba.SectionEI):
                q = np.unique(np.r_[q, self.ei[i].breakpoints])
            values = []
            for a in q:
                self.solve_loads([[i + 1, 2, 1.0, float(a), 0]])
                reaction, deflection = self.read_result(self.ba)
                err = max(
                    abs(reaction.sum() - 1),
                    abs(reaction @ self.support_x - (a + self.support_x[i]))
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
        """Rows are point-load locations, columns V, M, downward D, reactions."""
        p = np.atleast_1d(np.asarray(positions, float))
        rd = np.zeros((len(p), self.ns + self.nx))
        for i, length in enumerate(self.lengths):
            mask = (p >= self.support_x[i]) & (p <= self.support_x[i + 1])
            if mask.any():
                rd[mask] = self.interpolators[i](p[mask] - self.support_x[i])
        r, d = rd[:, : self.ns], rd[:, self.ns :]
        on = (p >= 0) & (p <= self.length)
        v = r @ self.left - ((p[:, None] < self.cut) & on[:, None])
        m = r @ self.lever - np.maximum(self.x[None, :] - p[:, None], 0) * on[:, None]
        return np.c_[v, m, d, r]

    def static_dead(self):
        intervals = dead_intervals(self.model)
        if not intervals:
            return np.zeros(self.nresponse), intervals
        self.solve_loads(
            [[v["span"] + 1, 3, v["w"], v["a"], v["b"] - v["a"]] for v in intervals]
        )
        r, d = self.read_result(self.ba)
        v, m = r @ self.left, r @ self.lever
        for load in intervals:
            a, b, w = load["start"], load["end"], load["w"]
            v -= w * np.clip(self.x - a, 0, b - a)
            m -= (
                w
                / 2
                * (np.maximum(self.x - a, 0) ** 2 - np.maximum(self.x - b, 0) ** 2)
            )
        return np.r_[v, m, d, r], intervals

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
        r, d = self.read_result(self.ba)
        v, m = r @ self.left, r @ self.lever
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
        return np.r_[v, m, d, r]


def structure_key(model):
    data = model.model_dump()
    for key in ("live", "dead", "thermal", "load_mode"):
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
                        axle_effect = raw * model.live.axle_factor
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
    low += dead
    high += dead
    nx = basis.nx

    def pack(values):
        return {
            "V": values[:nx].tolist(),
            "M": values[nx : 2 * nx].tolist(),
            "D": values[2 * nx : 3 * nx].tolist(),
            "R": values[3 * nx :].tolist(),
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
    reactions = [
        {
            "support": i + 1,
            "x": float(x),
            "min": float(low[3 * nx + i]),
            "max": float(high[3 * nx + i]),
            "min_case": info_low[3 * nx + i],
            "max_case": info_high[3 * nx + i],
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
        "model": model.model_dump(),
    }


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
    weights, offsets = vehicle_data(model.live, record.get("rear_spacing"))
    sign = -1 if record.get("direction") == "forward" else 1
    p = record.get("position", 0)
    ids = record.get("axles", list(range(1, len(weights) + 1)))
    factor = record.get("factor", 1)
    if model.load_mode == "dead" or record.get("case") == "unloaded":
        ids = []
    is_lane = record.get("case") == "lane"
    lane_w, _, lane_style = lane_parameters(model.live)
    if is_lane:
        factor = lane_axle_factor(model.live, factor)
    axles = [
        {
            "id": i + 1,
            "x": float(p + sign * offset),
            "load": float(
                weights[i] * model.live.axle_factor * factor * model.live.factor
            ),
        }
        for i, offset in enumerate(offsets)
        if i + 1 in ids and 0 <= p + sign * offset <= basis.length
    ]
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
    r = values[3 * nx :]
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
        "R": r.tolist(),
        "plot": graph,
        "axles": axles,
        "lane": lane_intervals,
        "dead_loads": intervals,
        "record": record,
        "equilibrium": {
            "force": float(r.sum() - total_load),
            "moment": float(r @ basis.support_x - total_moment),
        },
    }
