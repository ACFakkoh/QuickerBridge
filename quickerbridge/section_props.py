"""Steel I-girder and composite (steel girder + concrete slab) section properties.

Closed-form properties of rectangles and bars, all in mm (stresses in MPa).
Conventions follow the validated reference sheet (author, 2026-10-01):

* heights are measured upward from the bottom of the steel bottom flange;
  the user point S3 is given by its distance y below the elastic neutral axis
  (positive downward): S3 = I / y for each section, with its own ENA;
* the slab sits on a concrete haunch of thickness ``haunch``; the haunch raises
  the slab but its concrete is not counted (conservative, as the reference);
* slab concrete is counted net of the bars, transformed by 1/n; bars count as
  steel (full area);
* Ec = (3300 √f'c + 6900)(γc / 2300)^1.5 (MPa, γc in kg/m³ = unit weight
  in kN/m³ × 1000 / 9.81);
* Gc = Ec / (2 (1 + 0.18)), Gs = Es / (2 (1 + 0.3));
* composite torsion J = Js + be tc³ / 6 · Gc / Gs (reference sheet);
* effective properties (partial shear connection): Ie = Is + FrQr (Ic − Is),
  and the same rule for the section moduli, FrQr = 0.85 by default;
* section modulus S = I / |y − ȳ| at the usual points S1 to S5 (S1 top bars,
  S2 top of top flange, S3 at y below the ENA, S4 top of bottom flange, S5 bottom).

Section classes (CSA S6, 10.9.2.1, no axial load): flanges b/(2t) against
145, 170, 200 / √Fy; web h/w against 1100, 1700, 1900 / √Fy; 10.10.2.1:
2 dc / w of the steel section alone in positive bending against 1900 / √Fy.
"""

import math

from .models import CompositeSlab, Section

BARS = {"10M": (11.3, 100.0), "15M": (16.0, 200.0), "20M": (19.5, 300.0)}
NU_CONCRETE, NU_STEEL = 0.18, 0.3


def concrete_modulus(fc: float, density: float) -> float:
    return (3300 * math.sqrt(fc) + 6900) * (density / 2300) ** 1.5


def _plates(s: Section):
    """(width, thickness, centroid y) of bottom flange, web, top flange."""
    d, bt, tt, tw, bb, tb = (
        s.depth,
        s.top_width,
        s.top_thickness,
        s.web_thickness,
        s.bottom_width,
        s.bottom_thickness,
    )
    hw = d - tt - tb
    return [(bb, tb, tb / 2), (tw, hw, tb + hw / 2), (bt, tt, d - tt / 2)]


def _combine(parts):
    """Area, centroid and inertia of (area, y, own I) parts."""
    area = sum(a for a, _, _ in parts)
    ybar = sum(a * y for a, y, _ in parts) / area
    inertia = sum(i + a * (y - ybar) ** 2 for a, y, i in parts)
    return area, ybar, inertia


def _plastic(s: Section):
    """Plastic modulus Zx and plastic neutral axis (from bottom) of the steel I."""
    plates = _plates(s)
    total = sum(b * t for b, t, _ in plates)
    # Walk up from the bottom until half of the area is below the PNA.
    below, y0 = 0.0, 0.0
    for b, t, _ in plates:
        if below + b * t >= total / 2:
            ypna = y0 + (total / 2 - below) / b
            break
        below += b * t
        y0 += t
    z = 0.0
    y0 = 0.0
    for b, t, _ in plates:
        lo, hi = y0, y0 + t
        for a0, a1 in ((lo, min(hi, ypna)), (max(lo, ypna), hi)):
            if a1 > a0:
                z += b * (a1 - a0) * abs((a0 + a1) / 2 - ypna)
        y0 = hi
    return z, ypna


def steel_properties(s: Section, fy: float = 345.0, y3: float | None = None) -> dict:
    plates = _plates(s)
    parts = [(b * t, y, b * t**3 / 12) for b, t, y in plates]
    area, ybar, ix = _combine(parts)
    d = s.depth
    (bb, tb, _), (tw, hw, _), (bt, tt, _) = plates
    iy = (tb * bb**3 + hw * tw**3 + tt * bt**3) / 12
    j = (bb * tb**3 + hw * tw**3 + bt * tt**3) / 3
    iyt, iyb = tt * bt**3 / 12, tb * bb**3 / 12
    h_flanges = d - tt / 2 - tb / 2  # h', distance between flange centroids
    cw = h_flanges**2 * iyt * iyb / (iyt + iyb)
    zx, ypna = _plastic(s)
    root = math.sqrt(fy)

    def flange_class(ratio):
        for k, limit in ((1, 145), (2, 170), (3, 200)):
            if ratio <= limit / root:
                return k
        return 4

    web_ratio = hw / tw
    web_class = next(
        (
            k
            for k, limit in ((1, 1100), (2, 1700), (3, 1900))
            if web_ratio <= limit / root
        ),
        4,
    )
    dc = d - ybar - tt  # web depth in compression, steel alone, positive moment
    points = {"S2": d, "S4": tb, "S5": 0.0}
    if y3 is not None:
        points["S3"] = ybar - y3  # y measured down from the elastic neutral axis
    return {
        "A": area,
        "y_bottom": ybar,
        "y_top": d - ybar,
        "Ix": ix,
        "S": {k: ix / abs(y - ybar) for k, y in points.items() if abs(y - ybar) > 1e-9},
        "S_top": ix / (d - ybar),
        "S_bot": ix / ybar,
        "Iy": iy,
        "J": j,
        "Cw": cw,
        "h_prime": h_flanges,
        "Zx": zx,
        "PNA_from_bottom": ypna,
        "classes": {
            "top_flange": (bt / (2 * tt), flange_class(bt / (2 * tt))),
            "bottom_flange": (bb / (2 * tb), flange_class(bb / (2 * tb))),
            "web": (web_ratio, web_class),
            "web_2dc": (2 * dc / tw, 2 * dc / tw > 1900 / root),
        },
        "limits": {
            "flange": [145 / root, 170 / root, 200 / root],
            "web": [1100 / root, 1700 / root, 1900 / root],
        },
    }


def bars(c: CompositeSlab):
    """Area and centroid height above the slab bottom of both bar layers."""
    out = []
    for layer in ("top", "bottom"):
        size = getattr(c, f"bar_{layer}")
        spacing = getattr(c, f"spacing_{layer}")
        cover = getattr(c, f"cover_{layer}")
        diameter, area = BARS[size]
        total = area * c.effective_width / spacing
        y = (
            c.slab_thickness - cover - diameter / 2
            if layer == "top"
            else cover + diameter / 2
        )
        out.append(
            {
                "layer": layer,
                "size": size,
                "area": total,
                "y_in_slab": y,
                "from_top": c.slab_thickness - y,
            }
        )
    return out


def composite_properties(s: Section, c: CompositeSlab) -> dict:
    es = s.E * 1000.0  # GPa -> MPa
    ec = concrete_modulus(c.fc, c.unit_weight * 1000 / 9.81)
    n = es / ec
    gc, gs = ec / (2 * (1 + NU_CONCRETE)), es / (2 * (1 + NU_STEEL))
    steel = steel_properties(s, c.fy, c.y3)
    d = s.depth
    base = d + c.haunch  # slab bottom
    height = base + c.slab_thickness
    reinf = bars(c)
    gross = c.effective_width * c.slab_thickness
    net = gross - sum(b["area"] for b in reinf)
    steel_parts = [(b * t, y, b * t**3 / 12) for b, t, y in _plates(s)]
    out = {
        "n": n,
        "Ec": ec,
        "Gc": gc,
        "Gs": gs,
        "concrete_area": net,
        "bars": reinf,
        "height": height,
        "steel": steel,
    }
    for label, ratio in (("1n", n), ("3n", 3 * n)):
        slab = (
            net / ratio,
            base + c.slab_thickness / 2,
            net / ratio * c.slab_thickness**2 / 12,
        )
        rebar = [(b["area"], base + b["y_in_slab"], 0.0) for b in reinf]
        area, ybar, inertia = _combine(steel_parts + [slab] + rebar)
        # S3: y below this section's own elastic neutral axis.
        top_bar = base + reinf[0]["y_in_slab"]
        points = {
            "S1": top_bar,
            "S2": d,
            "S3": ybar - c.y3,
            "S4": s.bottom_thickness,
            "S5": 0.0,
        }
        out[label] = {
            "A": area,
            "y_bottom": ybar,
            "y_top_slab": height - ybar,
            "I": inertia,
            "S": {
                k: inertia / abs(y - ybar)
                for k, y in points.items()
                if abs(y - ybar) > 1e-9
            },
            "points": points,
        }
    out["1n"]["J"] = (
        steel["J"] + c.effective_width * c.slab_thickness**3 / 6 * gc / gs
    )
    fq = c.frqr
    for label in ("1n", "3n"):
        comp = out[label]
        out[label + "e"] = {
            "I": steel["Ix"] + fq * (comp["I"] - steel["Ix"]),
            "S_top": steel["S_top"] + fq * (comp["S"]["S2"] - steel["S_top"]),
            "S_bot": steel["S_bot"] + fq * (comp["S"]["S5"] - steel["S_bot"]),
        }
    return out


def section_properties(section: Section) -> dict:
    """Worker entry: steel alone, plus composite results when a slab is set."""
    composite = section.composite or CompositeSlab()
    result = {"steel": steel_properties(section, composite.fy, composite.y3)}
    if section.composite is not None and section.composite.enabled:
        result["composite"] = composite_properties(section, section.composite)
    return result


# --- Stresses over the depth (v0.9.4) ----------------------------------------
#
# Staged elastic stresses: each moment acts on the section of its stage and
# the stresses add. σ = −M (y − ȳ) / I (sagging M > 0 compresses the top),
# concrete σ = steel-equivalent σ / ratio (n or 3n). A composite stage under a
# negative moment uses the cracked section (steel and bars, concrete ignored).

STAGES = ("steel", "3n", "1n")


def stage_section(section: Section, stage: str, moment: float, comp: dict | None):
    """I, ȳ, concrete ratio (None: concrete not acting) and bars acting."""
    steel_parts = [(b * t, y, b * t**3 / 12) for b, t, y in _plates(section)]
    if stage == "steel" or comp is None:
        area, ybar, inertia = _combine(steel_parts)
        return {
            "I": inertia,
            "ybar": ybar,
            "ratio": None,
            "bars": False,
            "cracked": False,
        }
    c = section.composite
    base = section.depth + c.haunch
    if moment < 0:
        bars_parts = [(b["area"], base + b["y_in_slab"], 0.0) for b in comp["bars"]]
        area, ybar, inertia = _combine(steel_parts + bars_parts)
        return {
            "I": inertia,
            "ybar": ybar,
            "ratio": None,
            "bars": True,
            "cracked": True,
        }
    data = comp[stage]
    ratio = comp["n"] * (3 if stage == "3n" else 1)
    return {
        "I": data["I"],
        "ybar": data["y_bottom"],
        "ratio": ratio,
        "bars": True,
        "cracked": False,
    }


def stress_profile(section: Section, moments: dict) -> dict:
    """Staged stresses (MPa) for moments in kN·m per stage: steel, 3n, 1n.

    Returns the stresses at the usual fibres and a profile over the depth,
    with the contribution of each stage.
    """
    comp = (
        composite_properties(section, section.composite)
        if section.composite is not None and section.composite.enabled
        else None
    )
    d, tb = section.depth, section.bottom_thickness
    fibres = [("S5", 0.0, "steel"), ("S4", tb, "steel"), ("S2", d, "steel")]
    if comp is not None:
        c = section.composite
        base = d + c.haunch
        fibres = (
            [
                ("S5", 0.0, "steel"),
                ("S4", tb, "steel"),
                ("S2", d, "steel"),
            ]
            # S3 placed at y below the composite 1n elastic neutral axis.
            + [
                ("S3", comp["1n"]["points"]["S3"], "steel")
                for _ in [0]
                if 0 <= comp["1n"]["points"]["S3"] <= d
            ]
            + [
                (f"bar_{b['layer']}", base + b["y_in_slab"], "bar")
                for b in reversed(comp["bars"])
            ]
            + [
                ("slab_bottom", base, "concrete"),
                ("slab_top", base + c.slab_thickness, "concrete"),
            ]
        )
    fibres.sort(key=lambda f: f[1])  # bottom to top
    stages = {}
    for stage in STAGES:
        m = float(moments.get(stage, 0.0))
        props = stage_section(section, stage, m, comp)
        values = {}
        for name, y, material in fibres:
            sigma = -m * 1e6 * (y - props["ybar"]) / props["I"]
            if material == "concrete":
                sigma = sigma / props["ratio"] if props["ratio"] else 0.0
            elif material == "bar" and not props["bars"]:
                sigma = 0.0
            values[name] = sigma
        stages[stage] = {"M": m, **props, "sigma": values}
    total = {
        name: sum(stages[s]["sigma"][name] for s in STAGES) for name, _, _ in fibres
    }
    return {
        "fibres": [{"name": n, "y": y, "material": mat} for n, y, mat in fibres],
        "stages": stages,
        "total": total,
        "composite": comp is not None,
        "height": comp["height"] if comp else d,
    }
