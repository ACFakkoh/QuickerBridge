"""Imposed deformations through PyCBA imposed curvature (v0.9.7).

Three cases, each analysed on its own: thermal gradient (linear or
bilinear), slab shrinkage and slab creep. Shrinkage and creep are a uniform
shortening of the slab concrete restrained by the girder.
"""

import time

import numpy as np
import pycba as cba

from .engine import (
    member_types,
    node_reactions,
    pycba_supports,
    stations,
    support_fixity,
)
from .models import Model
from .sections import member_deflection, stiffness_profile, properties, span_ei


def thermal_curvature(model: Model) -> float:
    """Return PyCBA curvature; positive top heating bows upward in app coordinates.

    Linear gradient over the manual reference depth (``thermal.depth``).
    """
    thermal = model.thermal
    return -(thermal.alpha_micro * 1e-6) * thermal.delta_T / (thermal.depth / 1000)


def section_depth(section) -> float | None:
    """Total depth (mm) for the thermal gradient: girder, plus haunch and slab
    when a composite slab is defined. None for a direct-EI section."""
    from .section_props import girder_base

    if section.kind == "ei":
        return None
    depth = girder_base(section)["depth"]
    slab = section.composite
    if slab is not None and slab.enabled:
        depth += slab.haunch + slab.slab_thickness
    return depth


def slab_strain(model: Model, section) -> float:
    """Free shortening of the slab concrete (positive, dimensionless).

    Shrinkage: ε_sh as entered. Creep: ε_cr = φ σc / Ec, with σc the mean
    sustained compression of the slab and Ec from f'c and γc of the slab.
    """
    th = model.thermal
    if th.imposed == "shrinkage":
        return th.shrinkage_micro * 1e-6
    from .section_props import concrete_modulus

    slab = section.composite
    ec = concrete_modulus(slab.fc, slab.unit_weight * 1000 / 9.81)
    return th.creep_phi * th.creep_stress / ec


def slab_restraint(model: Model, section) -> dict:
    """Long-term composite section (slab / k·n) restraining a slab strain.

    Returns the transformed slab area, its lever arm to the neutral axis and
    the inertia (mm², mm, mm⁴) of the k·n section, bars included.
    """
    from .section_props import _combine, bars, composite_properties, girder_base

    slab = section.composite
    if section.kind == "ei" or slab is None or not slab.enabled:
        raise ValueError("thermal.needs_slab")
    comp = composite_properties(section, slab)
    g = girder_base(section)
    ratio = model.thermal.modular_factor * comp["n"]
    base = g["depth"] + slab.haunch
    net = comp["concrete_area"]
    parts = g["parts"] + [
        (
            net / ratio,
            base + slab.slab_thickness / 2,
            net / ratio * slab.slab_thickness**2 / 12,
        )
    ]
    parts += [(b["area"] * comp["m"], base + b["y_in_slab"], 0.0) for b in bars(slab)]
    area, ybar, inertia = _combine(parts)
    return {
        "area": net / ratio,
        "lever": base + slab.slab_thickness / 2 - ybar,
        "I": inertia,
        "ratio": ratio,
        "y_bottom": ybar,
    }


def free_curvature(model: Model, section) -> float:
    """Free curvature (1/m, positive when the top lengthens: top hotter).

    Shrinkage and creep shorten the slab: κ = −ε As e / I on the k·n
    section (sagging, the beam bows downward like a cooler top).

    Linear: α ΔT / h with h from the section (or the manual depth).
    Bilinear (S6-25 type): T falls linearly from slab_delta_T at the top of the
    slab to 0 at its bottom and stays 0 below; κ = α Σ T (y − ȳ) dA / I on the
    composite 1n section (slab / n, bars × m).
    """
    th = model.thermal
    if th.imposed in ("shrinkage", "creep"):
        r = slab_restraint(model, section)
        return -slab_strain(model, section) * r["area"] * r["lever"] / r["I"] * 1000.0
    alpha = th.alpha_micro * 1e-6
    if th.profile == "bilinear":
        from .section_props import composite_properties, girder_base

        slab = section.composite
        if section.kind == "ei" or slab is None or not slab.enabled:
            raise ValueError("thermal.needs_slab")
        comp = composite_properties(section, slab)
        c1 = comp["1n"]
        ybar, inertia = c1["y_bottom"], c1["I"]
        base = girder_base(section)["depth"] + slab.haunch
        tc = slab.slab_thickness
        width = comp["concrete_area"] / comp["n"] / tc  # transformed width, mm
        e = base - ybar
        # ∫0..tc T(s) (e + s) b ds with T = T0 s / tc
        moment = width * th.slab_delta_T / tc * (e * tc**2 / 2 + tc**3 / 3)
        for bar in comp["bars"]:
            s = bar["y_in_slab"]
            moment += bar["area"] * comp["m"] * th.slab_delta_T * s / tc * (e + s)
        return alpha * moment / inertia * 1000.0
    if th.depth_source == "manual":
        depth = th.depth
    else:
        depth = section_depth(section)
        if depth is None:
            depth = th.depth  # direct EI: no geometry, manual depth
    return alpha * th.delta_T / (depth / 1000)


def span_curvatures(model: Model) -> list[float]:
    """PyCBA imposed curvature per span: mean of the free curvature along the
    span (sections sampled every 1/40 of the span, tapers included)."""
    from .sections import section_at

    out, start = [], 0.0
    for span in model.spans:
        xs = np.linspace(0.0, span.length, 41)
        k = np.array(
            [
                free_curvature(
                    model,
                    section_at(
                        model, start + x, "right" if x < span.length else "left"
                    ),
                )
                for x in xs
            ]
        )
        mean = float(np.sum((k[1:] + k[:-1]) / 2 * np.diff(xs)) / span.length)
        out.append(-mean)
        start += span.length
    return out


def imposed_strain(model: Model):
    """Slab shortening (10⁻⁶) of a shrinkage/creep case at the first section
    with a slab, for display; None for the thermal gradient."""
    if model.thermal.imposed == "thermal":
        return None
    for section in model.sections:
        if section.kind != "ei" and section.composite and section.composite.enabled:
            return slab_strain(model, section) * 1e6
    return None


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
        eletype=member_types(model),
    )
    kappas = span_curvatures(model)
    for member, kappa in enumerate(kappas, start=1):
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
        refined = member_deflection(local_x, result.M[1:-1], eis[i], kappas[i])
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
            "curvature": float(np.mean(kappas)),
            "curvatures": kappas,
            "imposed": model.thermal.imposed,
            "slab_strain": imposed_strain(model),
            "equilibrium_error": max(max_force_error, max_moment_error),
            "pycba": cba.__version__,
            "precision": model.precision,
        },
        "model": model.model_dump(),
    }
