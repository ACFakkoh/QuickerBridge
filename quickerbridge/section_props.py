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
  S2 top of top flange, S3 at y below the ENA, S4 top of bottom flange, S5 bottom);
  y of S3 is given per configuration (steel, 3n, 1n, I'), default ``y3``;
* negative-moment region (v0.9.5): the slab is cracked, so I' counts the steel
  girder and both bar layers (in tension) only; no concrete, no 3n / 1n.

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


# --- Girder of the composite section: steel I or precast NEBT (v0.9.6) -------

ES_BARS = 200_000.0  # MPa, reinforcing bars
NEBT_TOP_WIDTH = 1200.0  # mm, NEBT top flange (MTQ)


def girder_base(s: Section) -> dict:
    """Parts (area, centroid, own I) of the girder alone, depth, top width and
    modulus Eg (MPa). Steel: three plates; NEBT: tabulated A, I, yb, h."""
    if s.kind == "nebt":
        from .sections import NEBT

        data = NEBT[s.nebt]
        return {
            "kind": "nebt",
            "parts": [(float(data["A"]), float(data["yb"]), data["I"] * 1e6)],
            "depth": float(data["h"]),
            "top_width": NEBT_TOP_WIDTH,
            "Eg": s.E * 1000.0,
        }
    return {
        "kind": "girder",
        "parts": [(b * t, y, b * t**3 / 12) for b, t, y in _plates(s)],
        "depth": s.depth,
        "top_width": s.top_width,
        "Eg": s.E * 1000.0,
    }


def nebt_properties(s: Section, y3: float | None = None) -> dict:
    """NEBT girder alone (tabulated): A, ȳ, I and S at S2 (top), S5 (bottom)."""
    g = girder_base(s)
    area, ybar, ix = g["parts"][0]
    d = g["depth"]
    points = {"S2": d, "S5": 0.0}
    if y3 is not None:
        points["S3"] = ybar - y3
    return {
        "kind": "nebt",
        "A": area,
        "y_bottom": ybar,
        "y_top": d - ybar,
        "Ix": ix,
        "S": {k: ix / abs(y - ybar) for k, y in points.items() if abs(y - ybar) > 1e-9},
        "S_top": ix / (d - ybar),
        "S_bot": ix / ybar,
        "depth": d,
    }


def girder_properties(s: Section, fy: float, y3: float | None) -> dict:
    return nebt_properties(s, y3) if s.kind == "nebt" else steel_properties(s, fy, y3)


def composite_properties(s: Section, c: CompositeSlab) -> dict:
    """Girder + slab, 3n and 1n. n = Eg / Ec (slab transformed by 1/n, or
    1/3n); bars transformed by m = Es / Eg (m = 1 for a steel girder)."""
    g = girder_base(s)
    eg = g["Eg"]
    ec = concrete_modulus(c.fc, c.unit_weight * 1000 / 9.81)
    n = eg / ec
    m = ES_BARS / eg
    steel_girder = g["kind"] == "girder"
    gc, gs = ec / (2 * (1 + NU_CONCRETE)), eg / (2 * (1 + NU_STEEL))
    girder = girder_properties(s, c.fy, c.y_of("steel"))
    d = g["depth"]
    base = d + c.haunch  # slab bottom
    height = base + c.slab_thickness
    reinf = bars(c)
    net = c.effective_width * c.slab_thickness - sum(b["area"] for b in reinf)
    rebar = [(b["area"] * m, base + b["y_in_slab"], 0.0) for b in reinf]
    out = {
        "kind": g["kind"],
        "n": n,
        "m": m,
        "Ec": ec,
        "Eg": eg,
        "Gc": gc,
        "Gs": gs,
        "concrete_area": net,
        "bars": reinf,
        "height": height,
        "depth": d,
        "steel": girder,
    }
    for label, ratio in (("1n", n), ("3n", 3 * n)):
        slab = (
            net / ratio,
            base + c.slab_thickness / 2,
            net / ratio * c.slab_thickness**2 / 12,
        )
        area, ybar, inertia = _combine(g["parts"] + [slab] + rebar)
        # S3: y below this section's own elastic neutral axis.
        points = {
            "S1": base + reinf[0]["y_in_slab"],
            "S2": d,
            "S3": ybar - c.y_of(label),
        }
        if steel_girder:
            points["S4"] = s.bottom_thickness
        points["S5"] = 0.0
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
    if steel_girder:
        out["1n"]["J"] = (
            girder["J"] + c.effective_width * c.slab_thickness**3 / 6 * gc / gs
        )
        fq = c.frqr
        for label in ("1n", "3n"):
            comp = out[label]
            out[label + "e"] = {
                "I": girder["Ix"] + fq * (comp["I"] - girder["Ix"]),
                "S_top": girder["S_top"] + fq * (comp["S"]["S2"] - girder["S_top"]),
                "S_bot": girder["S_bot"] + fq * (comp["S"]["S5"] - girder["S_bot"]),
            }
    out["negative"] = negative_properties(s, c, girder)
    return out


def negative_properties(s: Section, c: CompositeSlab, girder: dict) -> dict:
    """Negative-moment region I': girder + both bar layers, no concrete.

    The bars are in tension (transformed by m = Es/Eg, 1 for steel); the
    cracked slab and the haunch are ignored. Steel girder: web compressed from
    the bottom flange, dc = ȳ' − tb for the 2dc/w check (10.10.2.1).
    """
    g = girder_base(s)
    m = ES_BARS / g["Eg"]
    base = g["depth"] + c.haunch
    reinf = bars(c)
    parts = g["parts"] + [(b["area"] * m, base + b["y_in_slab"], 0.0) for b in reinf]
    area, ybar, inertia = _combine(parts)
    points = {
        "S1": base + reinf[0]["y_in_slab"],
        "S2": g["depth"],
        "S3": ybar - c.y_of("neg"),
    }
    if g["kind"] == "girder":
        points["S4"] = s.bottom_thickness
    points["S5"] = 0.0
    out = {
        "A": area,
        "y_bottom": ybar,
        "y_top_bars": points["S1"] - ybar,
        "I": inertia,
        "S": {
            k: inertia / abs(y - ybar)
            for k, y in points.items()
            if abs(y - ybar) > 1e-9
        },
        "points": points,
        "bars_area": sum(b["area"] for b in reinf),
        "ratio": inertia / girder["Ix"],
    }
    if g["kind"] == "girder":
        dc = ybar - s.bottom_thickness
        root = math.sqrt(c.fy)
        out["web_2dc"] = (
            2 * dc / s.web_thickness,
            2 * dc / s.web_thickness > 1900 / root,
        )
    return out


def section_properties(section: Section) -> dict:
    """Worker entry: girder alone (steel I or NEBT), plus composite results
    when a slab is set. ``region`` echoes the region chosen for display."""
    composite = section.composite or CompositeSlab()
    result = {
        "kind": section.kind,
        "steel": girder_properties(section, composite.fy, composite.y_of("steel")),
        "region": composite.region,
    }
    if section.composite is not None and section.composite.enabled:
        result["composite"] = composite_properties(section, section.composite)
    return result


# --- Stresses over the depth (v0.9.4, NEBT v0.9.6) ----------------------------
#
# Staged elastic stresses: each moment acts on the section of its stage and
# the stresses add. σ = −M (y − ȳ) / I (sagging M > 0 compresses the top),
# in girder-material units: slab concrete σ / ratio (n or 3n), bars σ × m. A
# composite stage under a negative moment uses the cracked section (girder and
# bars, concrete ignored).

STAGES = ("steel", "3n", "1n")


def stage_section(section: Section, stage: str, moment: float, comp: dict | None):
    """I, ȳ, concrete ratio (None: concrete not acting) and bars acting."""
    g = girder_base(section)
    if stage == "steel" or comp is None:
        _, ybar, inertia = _combine(g["parts"])
        return {
            "I": inertia,
            "ybar": ybar,
            "ratio": None,
            "bars": False,
            "cracked": False,
        }
    c = section.composite
    base = g["depth"] + c.haunch
    if moment < 0:
        parts = g["parts"] + [
            (b["area"] * comp["m"], base + b["y_in_slab"], 0.0) for b in comp["bars"]
        ]
        _, ybar, inertia = _combine(parts)
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


def stress_fibres(section: Section, comp: dict | None):
    """Fibres (name, y from the bottom, material), bottom to top."""
    g = girder_base(section)
    d = g["depth"]
    fibres = [("S5", 0.0, "steel"), ("S2", d, "steel")]
    if g["kind"] == "girder":
        fibres.append(("S4", section.bottom_thickness, "steel"))
    if comp is None and section.composite is not None:
        # Girder alone: S3 at y_steel below its neutral axis.
        _, ybar, _ = _combine(g["parts"])
        y3 = ybar - section.composite.y_of("steel")
        if 0 <= y3 <= d:
            fibres.append(("S3", y3, "steel"))
    if comp is not None:
        c = section.composite
        base = d + c.haunch
        y3 = comp["1n"]["points"]["S3"]  # y below the composite 1n axis
        if 0 <= y3 <= d:
            fibres.append(("S3", y3, "steel"))
        fibres += [
            (f"bar_{b['layer']}", base + b["y_in_slab"], "bar") for b in comp["bars"]
        ]
        fibres += [
            ("slab_bottom", base, "concrete"),
            ("slab_top", base + c.slab_thickness, "concrete"),
        ]
    fibres.sort(key=lambda f: f[1])
    return fibres


def stress_profile(section: Section, moments: dict, comp="auto") -> dict:
    """Staged stresses (MPa) for moments in kN·m per stage: steel, 3n, 1n.

    Returns the stresses at the usual fibres and the contribution of each
    stage. ``comp`` may pass precomputed composite properties.
    """
    if comp == "auto":
        comp = (
            composite_properties(section, section.composite)
            if section.composite is not None and section.composite.enabled
            else None
        )
    g = girder_base(section)
    fibres = stress_fibres(section, comp)
    stages = {}
    for stage in STAGES:
        m = float(moments.get(stage, 0.0))
        props = stage_section(section, stage, m, comp)
        values = {}
        for name, y, material in fibres:
            sigma = -m * 1e6 * (y - props["ybar"]) / props["I"]
            if material == "concrete":
                sigma = sigma / props["ratio"] if props["ratio"] else 0.0
            elif material == "bar":
                sigma = sigma * comp["m"] if props["bars"] else 0.0
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
        "kind": g["kind"],
        "depth": g["depth"],
        "height": comp["height"] if comp else g["depth"],
        # Reference of the S3 fibre: y below the 1n axis, or the girder axis.
        "s3_ref": "1n" if comp is not None else "steel",
        "s3_y": (
            section.composite.y_of("1n" if comp is not None else "steel")
            if section.composite is not None
            else None
        ),
    }
