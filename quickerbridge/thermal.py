"""Uniform linear thermal-gradient analysis through PyCBA imposed curvature."""

import time

import numpy as np
import pycba as cba

from .engine import node_reactions, pycba_supports, stations, support_fixity
from .models import Model
from .sections import member_deflection, stiffness_profile, properties, span_ei


def thermal_curvature(model: Model) -> float:
    """Return PyCBA curvature; positive top heating bows upward in app coordinates."""
    thermal = model.thermal
    return -(thermal.alpha_micro * 1e-6) * thermal.delta_T / (thermal.depth / 1000)


def analyse_thermal(model: Model) -> dict:
    """Solve thermal curvature alone, without dead or live load superposition."""
    started = time.perf_counter()
    lengths = [span.length for span in model.spans]
    support_x = np.r_[0.0, np.cumsum(lengths)]
    x, span_ids, sides = stations(model)
    eis = [span_ei(model, i) for i in range(len(lengths))]
    ba = cba.BeamAnalysis(
        lengths,
        eis,
        supports=pycba_supports(model),
    )
    kappa = thermal_curvature(model)
    for member in range(1, len(lengths) + 1):
        ba.add_ic(member, kappa)
    npts = 480 if model.precision == "standard" else 960
    ba.analyze(npts=npts)

    shear, moment, deflection = [], [], []
    for i, result in enumerate(ba.beam_results.vRes):
        mask = np.asarray(span_ids) == i
        query = x[mask]
        physical_x = result.x[1:-1]
        shear.extend(np.interp(query, physical_x, result.V[1:-1]))
        moment.extend(np.interp(query, physical_x, result.M[1:-1]))
        local_x = physical_x - support_x[i]
        refined = member_deflection(local_x, result.M[1:-1], eis[i], kappa)
        if refined is not None:
            fine_x, fine_d = refined
            deflection.extend(-1000 * np.interp(query - support_x[i], fine_x, fine_d))
            continue
        local_d = result.D[1:-1].copy()
        local_d -= local_d[0] + local_x / lengths[i] * (local_d[-1] - local_d[0])
        deflection.extend(-1000 * np.interp(query, physical_x, local_d))

    values = {
        "V": np.asarray(shear, float),
        "M": np.asarray(moment, float),
        "D": np.asarray(deflection, float),
        "R": node_reactions(ba)[: len(support_x)],
        "Mr": node_reactions(ba)[len(support_x) :],
    }
    packed = {key: value.tolist() for key, value in values.items()}
    extrema = []
    for response in ("M", "V", "D"):
        data = values[response]
        for sense, index in (("max", int(data.argmax())), ("min", int(data.argmin()))):
            extrema.append(
                {
                    "response": response,
                    "sense": sense,
                    "value": float(data[index]),
                    "x": float(x[index]),
                    "index": index,
                }
            )
    fixity = support_fixity(model, eis)
    reactions = [
        {
            "support": i + 1,
            "x": float(support_x[i]),
            "value": float(value),
            "min": float(value),
            "max": float(value),
            "type": model.supports[i],
            "k": (
                float(model.support_springs[i])
                if model.supports[i] == "spring"
                else None
            ),
            "fixity": fixity[i],
            "moment": float(values["Mr"][i]),
            "moment_min": float(values["Mr"][i]),
            "moment_max": float(values["Mr"][i]),
        }
        for i, value in enumerate(values["R"])
    ]
    table = []
    for i, global_x in enumerate(x):
        span = span_ids[i]
        local = global_x - support_x[span]
        fraction_x = local / lengths[span] * model.subdivisions
        if abs(fraction_x - round(fraction_x)) < 1e-7:
            table.append(
                {
                    "span": span + 1,
                    "station": int(round(fraction_x)),
                    "x": float(global_x),
                    "local_x": float(local),
                    "side": sides[i],
                    "V": float(values["V"][i]),
                    "M": float(values["M"][i]),
                    "D": float(values["D"][i]),
                }
            )
    max_force_error = abs(float(values["R"].sum()))
    max_moment_error = abs(float(values["R"] @ support_x + values["Mr"].sum()))
    return {
        "kind": "thermal",
        "x": x.tolist(),
        "sides": sides,
        "span_ids": span_ids,
        "values": packed,
        # Aliases keep common plotting code simple; this is still one load case.
        "min": packed,
        "max": packed,
        "extrema": extrema,
        "reactions": reactions,
        "table": table,
        "stiffness": stiffness_profile(model),
        "sections": [properties(section) for section in model.sections],
        "meta": {
            "elapsed": round(time.perf_counter() - started, 3),
            "curvature": kappa,
            "equilibrium_error": max(max_force_error, max_moment_error),
            "pycba": cba.__version__,
            "precision": model.precision,
        },
        "model": model.model_dump(),
    }
