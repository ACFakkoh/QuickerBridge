"""Factored resistance of steel plate girders, CSA S6-25 Section 10.

Display only: nothing here changes the analysis. Units: mm, N, MPa inside;
results in kN and kN·m. Depths ``z`` are measured downward from the top of
the slab (composite) or from the top of the steel (girder alone).

v0.9.98: the resistance is computed at every station of the envelope, with
the section in force there (tapers included), and compared with the factored
effects of the analysis (permanent + live loads, factors as entered):
Mf+ = max(M max, 0), Mf− = max(−M min, 0), Vf = max |V|. Each steel girder
section resists as a composite girder (slab of its section properties) or as
the girder alone. Resistance factors φs 0.95, φr 0.90, φc 0.75; bars 400 MPa.

Class (10.9.2.1, no axial load): the worst of the top flange, the bottom
flange and the web. Composite girder: web h/w. Girder alone: web 2dc/w, dc
the elastic depth of web in compression (10.10.2.1, 10.10.3.1).

Composite girder:

* M+ classes 1 and 2 (10.11.5.2): fully plastic, C1 = Cc + Cr, C2 = φs As Fy;
  C1 ≥ C2: plastic neutral axis in the slab, a = (C2 − φr Ar fy)/(α1 φc be f'c),
  Mr = Cc ec + Cr er; C1 < C2: PNA in the steel, a = tc,
  Cs = (C2 − C1)/2, Mr = Cc ec + Cr er + Cs es. The haunch raises the slab;
  its concrete is not counted. Both bar layers are taken in compression;
* M+ class 3 (10.11.6.2): the same while the plastic web depth in
  compression is at most 850 w/√Fy, else Figure 10.8 (A'sc = top flange +
  850 w²/√Fy, A'st = (Cc + Cr + Cs)/(φs Fy) from the bottom); class 4: the
  class 3 rule, flagged;
* M− classes 1 and 2 (10.11.5.3.1): Tr = φr Ar fy, Ts = (φs As Fy − Tr)/2,
  Mr = Tr er + Ts es with the compression flange braced (no lateral-
  torsional buckling for a composite girder, author's decision v0.9.99);
* M− classes 3 and 4 (10.11.6.3.1): elastic stresses, Mfd (self-weight and
  "girder alone" loads) on the girder S, the rest on S′ (steel + bars), limits
  a) φs Fcr at the bottom, Fcr = Mr/(φs Sbot) with Mr of 10.10.3.3 for the
  girder alone over the unbraced length, b) φs Fy at the top of the steel,
  c) φr fy at the top bars. Equivalent Mr− = Mfd + the largest composite
  moment meeting a), b) and c).

Girder alone, M+ (top flange in compression) and M− (bottom flange), ω2 = 1:

* Mu = ω2 π/L √(Es Iy Gs J) (B1 + √(1 + B2 + B1²)), B1 = π βx/(2L)
  √(Es Iy/Gs J), B2 = π² Es Cw/(L² Gs J), βx = 0.9 ho (2 Iyc/Iy − 1)
  (1 − (Iy/Ix)²) (C10.10.2.3), Cw = ho² Iyc Iyt/(Iyc + Iyt), J = Σ b t³/3;
* classes 1 and 2 (10.10.2.3): Mr = 1.15 φs Mp (1 − 0.28 Mp/Mu) ≤ φs Mp when
  Mu > 0.67 Mp, else φs Mu; class 3 (10.10.3.3): the same with My = Fy
  min(Stop, Sbot); class 4 flange (10.10.3.4): S → Se, flange outstand
  200 t/√Fy ≤ 30 t; class 4 web (10.10.4.4): Mr × Frd, Frd = 1 −
  [2dc/w − 1900/√(Mf/φs S)]/(300 + 1200 Acf/Aw) ≤ 1 at each station.

Shear (10.10.5.1), fabricated girder: Vr = φs Aw Fs, Aw = h w, Fs = Fcr + Ft
with kv from a/h (unstiffened web: a/h infinite, kv = 5.34, Ft = 0). Webs
that rely on the tension field (stiffened, h/w > 502 √(kv/Fy)): 10.10.5.2
c) 0.727 Mf/Mr + 0.455 Vf/Vr ≤ 1, with the larger of Mf+/Mr+ and Mf−/Mr− at
the station (envelope values: conservative).

v0.9.99: the effects compared can be the permanent loads only, the live load
only or both (``Resistance.effects``); the sheet of a station also gives the
section properties and the V and M of each load stage.
"""

import json
import math

from .models import CompositeSlab, Resistance, Section
from .section_props import BARS

PHI_S, PHI_R, PHI_C = 0.95, 0.90, 0.75
FY_BAR = 400.0  # MPa, reinforcing bars
E_S, G_S = 200_000.0, 77_000.0  # MPa
OMEGA_2 = 1.0  # 10.10.2.3, conservative (v0.9.98)
FLANGE_LIMITS = (145, 170, 200)
WEB_LIMITS = (1100, 1700, 1900)


def alpha1(fc: float) -> float:
    """S6-25 8.8.3: α1 = 0.85 − 0.0015 f'c, at least 0.67."""
    return max(0.67, 0.85 - 0.0015 * fc)


def plates(s: Section, top_width=None, bottom_width=None):
    """(name, width, thickness, z top) of the plates, from the top of the steel."""
    hw = s.depth - s.top_thickness - s.bottom_thickness
    return [
        ("top", top_width or s.top_width, s.top_thickness, 0.0),
        ("web", s.web_thickness, hw, s.top_thickness),
        (
            "bottom",
            bottom_width or s.bottom_width,
            s.bottom_thickness,
            s.depth - s.bottom_thickness,
        ),
    ]


def _slice(parts, area, from_top=True):
    """Split the steel plates at ``area`` measured from the top (or bottom).

    Returns ((area, centroid z) of the first part, (area, z) of the rest,
    and the depth reached in each plate: {name: depth}).
    """
    order = parts if from_top else parts[::-1]
    left, first, rest, depth = area, [], [], {}
    for name, b, t, z0 in order:
        a = b * t
        take = min(max(left, 0.0), a)
        left -= take
        h = take / b
        depth[name] = h
        if from_top:
            if h > 0:
                first.append((take, z0 + h / 2))
            if t - h > 0:
                rest.append((a - take, z0 + h + (t - h) / 2))
        else:
            if h > 0:
                first.append((take, z0 + t - h / 2))
            if t - h > 0:
                rest.append((a - take, z0 + (t - h) / 2))

    def merge(items):
        total = sum(a for a, _ in items)
        return total, (sum(a * z for a, z in items) / total if total > 0 else 0.0)

    return merge(first), merge(rest), depth


def girder(s: Section, top_width=None, bottom_width=None) -> dict:
    """Elastic, plastic and torsional properties of the steel I (mm)."""
    parts = plates(s, top_width, bottom_width)
    rect = [
        (b * t, z0 + t / 2, b * t**3 / 12, t * b**3 / 12) for _, b, t, z0 in parts
    ]
    area = sum(r[0] for r in rect)
    z = sum(r[0] * r[1] for r in rect) / area
    ix = sum(r[2] + r[0] * (r[1] - z) ** 2 for r in rect)
    (half, z1), (_, z2), _ = _slice(parts, area / 2)
    (_, bt, tt, _), (_, w, hw, _), (_, bb, tb, _) = parts
    iy_top, iy_bot = tt * bt**3 / 12, tb * bb**3 / 12
    ho = s.depth - tt / 2 - tb / 2
    return {
        "A": area,
        "z": z,
        "Ix": ix,
        "S_top": ix / z,
        "S_bot": ix / (s.depth - z),
        "Zx": half * (z2 - z1),
        "Iy": iy_top + iy_bot + hw * w**3 / 12,
        "Iy_top": iy_top,
        "Iy_bot": iy_bot,
        "J": (bt * tt**3 + bb * tb**3 + hw * w**3) / 3,
        "Cw": ho**2 * iy_top * iy_bot / (iy_top + iy_bot),
        "ho": ho,
        "hw": hw,
        "Aw": hw * w,
    }


def web_dc(s: Section, g: dict, sign: int) -> float:
    """Elastic depth of web in compression of the girder alone (mm)."""
    dc = g["z"] - s.top_thickness if sign > 0 else s.depth - g["z"] - s.bottom_thickness
    return min(max(dc, 0.0), g["hw"])


def _grade(ratio, limits, root):
    return next((k for k, lim in zip((1, 2, 3), limits) if ratio <= lim / root), 4)


def classes(s: Section, fy: float, steel: bool = False) -> dict:
    """Section class, S6-25 10.9.2.1 (no axial load): worst of the three plates.

    Composite girder: web h/w. Girder alone: web 2dc/w (singly symmetric).
    """
    root = math.sqrt(fy)
    top = s.top_width / (2 * s.top_thickness)
    bottom = s.bottom_width / (2 * s.bottom_thickness)
    hw = s.depth - s.top_thickness - s.bottom_thickness
    if steel:
        g = girder(s)
        webs = {}
        for key, sign in (("positive", 1), ("negative", -1)):
            dc = web_dc(s, g, sign)
            webs[key] = {"ratio": 2 * dc / s.web_thickness, "dc": dc}
    else:
        webs = {k: {"ratio": hw / s.web_thickness} for k in ("positive", "negative")}
    for web in webs.values():
        web["class"] = _grade(web["ratio"], WEB_LIMITS, root)
    out = {
        "top_flange": {"ratio": top, "class": _grade(top, FLANGE_LIMITS, root)},
        "bottom_flange": {
            "ratio": bottom,
            "class": _grade(bottom, FLANGE_LIMITS, root),
        },
        "web": webs,
        "web_basis": "2dc/w" if steel else "h/w",
        "h_w": hw / s.web_thickness,
        "limits": {
            "flange": [v / root for v in FLANGE_LIMITS],
            "web": [v / root for v in WEB_LIMITS],
        },
    }
    flanges = max(out["top_flange"]["class"], out["bottom_flange"]["class"])
    out["positive"] = max(flanges, webs["positive"]["class"])
    out["negative"] = max(flanges, webs["negative"]["class"])
    return out


def shear(s: Section, r: Resistance, fy: float) -> dict:
    """S6-25 10.10.5.1, fabricated girder: Aw = h w."""
    h = s.depth - s.top_thickness - s.bottom_thickness
    w = s.web_thickness
    if r.stiffened:
        ah = r.stiffener_spacing / h
        kv = 4 + 5.34 / ah**2 if ah < 1 else 5.34 + 4 / ah**2
        field = 1 / math.sqrt(1 + ah**2)
    else:
        ah, kv, field = None, 5.34, 0.0
    ratio = h / w
    low, high = 502 * math.sqrt(kv / fy), 621 * math.sqrt(kv / fy)
    if ratio <= low:
        case, fcr, ft = "a", 0.577 * fy, 0.0
    elif ratio <= high:
        case = "b"
        fcr = 290 * math.sqrt(fy * kv) / ratio
        ft = (0.5 * fy - 0.866 * fcr) * field
    else:
        case = "c"
        fcr = 180000 * kv / ratio**2
        ft = (0.5 * fy - 0.866 * fcr) * field
    fs = fcr + ft
    return {
        "h": h,
        "w": w,
        "Aw": h * w,
        "a": r.stiffener_spacing if r.stiffened else None,
        "a_h": ah,
        "kv": kv,
        "h_w": ratio,
        "limits": [low, high],
        "case": case,
        "Fcr": fcr,
        "Ft": ft,
        "Fs": fs,
        "Vr": PHI_S * h * w * fs / 1000,
        # 10.10.5.2: stiffened webs relying on the tension field.
        "tension_field": bool(r.stiffened and ratio > low),
    }


def _bars(c: CompositeSlab):
    """Bar layers: area (mm²), depth z from the top of the slab, force φr A fy (N)."""
    out = []
    for layer in ("top", "bottom"):
        diameter, area = BARS[getattr(c, f"bar_{layer}")]
        total = area * c.effective_width / getattr(c, f"spacing_{layer}")
        cover = getattr(c, f"cover_{layer}")
        z = (
            cover + diameter / 2
            if layer == "top"
            else c.slab_thickness - cover - diameter / 2
        )
        out.append(
            {"layer": layer, "area": total, "z": z, "force": PHI_R * total * FY_BAR}
        )
    return out


def positive_moment(s: Section, c: CompositeSlab, cls: int) -> dict:
    """Mr+ of the composite section, 10.11.5.2 / 10.11.6.2 (N, mm)."""
    fy, fc = c.fy, c.fc
    a1 = alpha1(fc)
    parts = plates(s)
    area = sum(b * t for _, b, t, _ in parts)
    z0 = c.slab_thickness + c.haunch  # top of the steel, from the top of the slab
    bars = _bars(c)
    cr = sum(b["force"] for b in bars)
    unit = a1 * PHI_C * c.effective_width * fc  # N per mm of block depth
    cc_full = unit * c.slab_thickness
    c1, c2 = cc_full + cr, PHI_S * area * fy
    root = math.sqrt(fy)
    limit = 850 * s.web_thickness / root
    out = {
        "method": "composite",
        "alpha1": a1,
        "Cc_full": cc_full / 1000,
        "Cr": cr / 1000,
        "C1": c1 / 1000,
        "C2": c2 / 1000,
        "class": cls,
        "web_limit": limit,
        "bars": [
            {
                "layer": b["layer"],
                "area": b["area"],
                "z": b["z"],
                "C": b["force"] / 1000,
            }
            for b in bars
        ],
    }
    if c1 >= c2:
        # 10.11.5.2.3: plastic neutral axis in the concrete slab.
        a = max((c2 - cr) / unit, 0.0)
        cc = unit * a
        _, ybar = _slice(parts, area)[0]
        zt = z0 + ybar
        terms = [(cc, a / 2, "Cc")] + [
            (b["force"], b["z"], "Cr_" + b["layer"]) for b in bars
        ]
        mr = sum(f * (zt - z) for f, z, _ in terms)
        out.update(
            pna="slab",
            rule="10.11.5.2.3",
            a=a,
            Cc=cc / 1000,
            Cs=0.0,
            Ts=c2 / 1000,
            dc_flange=0.0,
            dc_web=0.0,
            z_tension=zt,
            z_compression_steel=None,
            e={name: zt - z for _, z, name in terms},
        )
    else:
        cc = cc_full
        cs = (c2 - c1) / 2
        (asc, zc), (ast, zt), depth = _slice(parts, cs / (PHI_S * fy))
        dc_web = depth.get("web", 0.0)
        out.update(dc_flange=depth.get("top", 0.0), dc_web=dc_web)
        if cls >= 3 and dc_web > limit:
            # 10.11.6.2.2 (Figure 10.8): compression on the top flange plus
            # 850 w²/√Fy of web; tension A'st from the bottom up.
            top = parts[0]
            asc_area = top[1] * top[2] + 850 * s.web_thickness**2 / root
            cs = PHI_S * asc_area * fy
            (_, zc), _, _ = _slice(parts, asc_area)
            ast_area = (cc + cr + cs) / (PHI_S * fy)
            (_, zt), _, _ = _slice(parts, ast_area, from_top=False)
            rule = "10.11.6.2.2"
            out.update(Asc=asc_area, Ast=ast_area)
        else:
            rule = "10.11.6.2.1" if cls >= 3 else "10.11.5.2.4"
        zt_abs = z0 + zt
        terms = (
            [(cc, c.slab_thickness / 2, "Cc")]
            + [(b["force"], b["z"], "Cr_" + b["layer"]) for b in bars]
            + [(cs, z0 + zc, "Cs")]
        )
        mr = sum(f * (zt_abs - z) for f, z, _ in terms)
        out.update(
            pna="steel",
            rule=rule,
            a=c.slab_thickness,
            Cc=cc / 1000,
            Cs=cs / 1000,
            Ts=(cc + cr + cs) / 1000,
            z_tension=zt_abs,
            z_compression_steel=z0 + zc,
            y_st=zt,
            y_sc=zc,
            e={name: zt_abs - z for _, z, name in terms},
        )
    out["Mr"] = mr / 1e6
    out["class4"] = cls == 4
    return out


def _elastic(parts):
    area = sum(a for a, _, _ in parts)
    zbar = sum(a * z for a, z, _ in parts) / area
    inertia = sum(i + a * (z - zbar) ** 2 for a, z, i in parts)
    return area, zbar, inertia


def lateral_torsional(s: Section, g: dict, sign: int, length: float) -> dict:
    """Mu of the girder alone over the unbraced length (10.10.2.3, N·mm)."""
    iyc = g["Iy_top"] if sign > 0 else g["Iy_bot"]
    beta = 0.9 * g["ho"] * (2 * iyc / g["Iy"] - 1) * (1 - (g["Iy"] / g["Ix"]) ** 2)
    ei, gj = E_S * g["Iy"], G_S * g["J"]
    b1 = math.pi * beta / (2 * length) * math.sqrt(ei / gj)
    b2 = math.pi**2 * E_S * g["Cw"] / (length**2 * gj)
    mu = (
        OMEGA_2
        * math.pi
        / length
        * math.sqrt(ei * gj)
        * (b1 + math.sqrt(1 + b2 + b1**2))
    )
    return {
        "L": length,
        "omega2": OMEGA_2,
        "Iyc": iyc,
        "Iy": g["Iy"],
        "J": g["J"],
        "Cw": g["Cw"],
        "beta_x": beta,
        "B1": b1,
        "B2": b2,
        "Mu": mu,
    }


def ltb_moment(m: float, mu: float) -> float:
    """10.10.2.3 / 10.10.3.3: Mr from Mp (or My) and Mu (N·mm)."""
    if mu > 0.67 * m:
        return min(1.15 * PHI_S * m * (1 - 0.28 * m / mu), PHI_S * m)
    return PHI_S * mu


def negative_moment(s: Section, c: CompositeSlab, cls: int, length: float) -> dict:
    """Mr− of the composite section (cracked slab, bars in tension)."""
    fy = c.fy
    parts = plates(s)
    area = sum(b * t for _, b, t, _ in parts)
    z0 = c.slab_thickness + c.haunch
    bars = _bars(c)
    tr = sum(b["force"] for b in bars)
    ps = PHI_S * area * fy
    out = {
        "class": cls,
        "Tr": tr / 1000,
        "bars": [
            {
                "layer": b["layer"],
                "area": b["area"],
                "z": b["z"],
                "T": b["force"] / 1000,
            }
            for b in bars
        ],
        "class4": cls == 4,
    }
    if cls <= 2:
        # 10.11.5.3.1 a) (Figure 10.7): fully plastic, laterally braced.
        ts = max((ps - tr) / 2, 0.0)
        (_, zt), (_, zc), depth = _slice(parts, ts / (PHI_S * fy))
        zc_abs, zt_abs = z0 + zc, z0 + zt
        mr = sum(b["force"] * (zc_abs - b["z"]) for b in bars) + ts * (zc_abs - zt_abs)
        out.update(
            method="plastic",
            rule="10.11.5.3.1",
            Ts=ts / 1000,
            Cs=(ts + tr) / 1000,
            z_compression=zc_abs,
            z_tension_steel=zt_abs,
            dt_flange=depth.get("top", 0.0),
            dt_web=depth.get("web", 0.0),
            e={"Tr_" + b["layer"]: zc_abs - b["z"] for b in bars}
            | {"Ts": zc_abs - zt_abs},
            Mr=mr / 1e6,
        )
        return out
    # 10.11.6.3.1: linear stresses at first yield (Figure 10.9).
    steel = [(b * t, z0 + zt + t / 2, b * t**3 / 12) for _, b, t, zt in parts]
    _, zs, i_s = _elastic(steel)
    _, zc, i_c = _elastic(steel + [(b["area"], b["z"], 0.0) for b in bars])
    z_bot, z_top = z0 + s.depth, z0
    z_bar = min(b["z"] for b in bars)
    g = girder(s)
    lt = lateral_torsional(s, g, -1, length)
    my = g["S_bot"] * fy
    fcr = ltb_moment(my, lt["Mu"]) / (PHI_S * g["S_bot"])
    out.update(
        method="elastic",
        rule="10.11.6.3.1",
        S={
            "S_bot": i_s / (z_bot - zs),
            "S_bot_c": i_c / (z_bot - zc),
            "S_top": i_s / (zs - z_top),
            "S_top_c": i_c / (zc - z_top),
            "S_bar": i_c / (zc - z_bar),
        },
        ltb={**lt, "Mu": lt["Mu"] / 1e6, "My": my / 1e6},
        Fcr=fcr,
        limits={"a": PHI_S * fcr, "b": PHI_S * fy, "c": PHI_R * FY_BAR},
    )
    return out


def steel_moment(s: Section, sign: int, cls: dict, fy: float, length: float) -> dict:
    """Mr of the girder alone, compression flange on top (sign > 0) or below."""
    key = "positive" if sign > 0 else "negative"
    comp = "top" if sign > 0 else "bottom"
    klass = cls[key]
    root = math.sqrt(fy)
    g = girder(s)
    widths = {}
    if cls[comp + "_flange"]["class"] == 4:
        # 10.10.3.4 b): effective outstand 200 t/√Fy, at most 30 t.
        t = getattr(s, comp + "_thickness")
        b = getattr(s, comp + "_width")
        widths[comp + "_width"] = min(b, 2 * min(200 * t / root, 30 * t))
    ge = girder(s, **widths) if widths else g
    lt = lateral_torsional(s, g, sign, length)
    mp, my = g["Zx"] * fy, min(ge["S_top"], ge["S_bot"]) * fy
    base, rule = (mp, "10.10.2.3") if klass <= 2 else (my, "10.10.3.3")
    mr = ltb_moment(base, lt["Mu"])
    web = cls["web"][key]
    out = {
        "method": "steel",
        "class": klass,
        "rule": rule,
        "ltb": {**lt, "Mu": lt["Mu"] / 1e6},
        "Zx": g["Zx"],
        "S_top": ge["S_top"],
        "S_bot": ge["S_bot"],
        "Mp": mp / 1e6,
        "My": my / 1e6,
        "effective_width": widths.get(comp + "_width"),
        "Mr": mr / 1e6,
        "class4": klass == 4,
    }
    if web["class"] == 4:
        # 10.10.4.4: compression-flange moment reduced by Frd (station Mf).
        acf = getattr(s, comp + "_width") * getattr(s, comp + "_thickness")
        out["frd"] = {
            "dc": web["dc"],
            "slenderness": web["ratio"],
            "Acf": acf,
            "Aw": g["Aw"],
            "S": ge["S_top"] if sign > 0 else ge["S_bot"],
            "limit": 1900 / root,
            "h_w_over_150": g["hw"] / s.web_thickness > 150,
        }
    return out


def frd(data: dict, mf: float) -> float:
    """10.10.4.4 reduction factor for the factored moment ``mf`` (kN·m)."""
    if mf <= 0:
        return 1.0
    stress = mf * 1e6 / (PHI_S * data["S"])
    value = 1 - (data["slenderness"] - 1900 / math.sqrt(stress)) / (
        300 + 1200 * data["Acf"] / data["Aw"]
    )
    return min(1.0, max(0.0, value))


def section_resistance(section: Section, kind: str, settings: Resistance) -> dict:
    """Force-independent resistance of one section ("composite" or "steel")."""
    if section.kind != "girder":
        raise ValueError("resistance.girder")
    slab = (
        section.composite if section.composite and section.composite.enabled else None
    )
    if kind != "composite":
        slab = None
    fy = (section.composite or CompositeSlab()).fy
    steel = slab is None
    cls = classes(section, fy, steel=steel)
    length = settings.unbraced_length
    out = {
        "kind": "steel" if steel else "composite",
        "Fy": fy,
        "phi": {"s": PHI_S, "r": PHI_R, "c": PHI_C},
        "fy_bar": FY_BAR,
        "classes": cls,
        "shear": shear(section, settings, fy),
    }
    if steel:
        out["positive"] = steel_moment(section, 1, cls, fy, length)
        out["negative"] = steel_moment(section, -1, cls, fy, length)
    else:
        out["positive"] = positive_moment(section, slab, cls["positive"])
        out["negative"] = negative_moment(section, slab, cls["negative"], length)
    return out


def moment_check(m: dict, mf: float, mfd: float = 0.0) -> dict:
    """Mr for the factored moment ``mf`` (kN·m, magnitude) and the D/C ratio.

    ``mfd``: part of ``mf`` carried by the girder alone (class 3 composite M−).
    """
    out = {"Mf": mf}
    if m.get("method") == "elastic":
        s, lim = m["S"], m["limits"]
        d, c = min(max(mfd, 0.0), mf) * 1e6, max(mf - mfd, 0.0) * 1e6
        stress = {
            "a": d / s["S_bot"] + c / s["S_bot_c"],
            "b": d / s["S_top"] + c / s["S_top_c"],
            "c": c / s["S_bar"],
        }
        caps = [
            (lim["a"] - d / s["S_bot"]) * s["S_bot_c"],
            (lim["b"] - d / s["S_top"]) * s["S_top_c"],
            lim["c"] * s["S_bar"],
        ]
        cap = min(caps)
        # Girder-alone stage beyond a limit by itself: what the girder carries.
        mr = d + cap if cap >= 0 else min(lim["a"] * s["S_bot"], lim["b"] * s["S_top"])
        out.update(
            Mfd=d / 1e6,
            Mfc=c / 1e6,
            checks=[
                {
                    "id": k,
                    "stress": stress[k],
                    "limit": lim[k],
                    "ratio": stress[k] / lim[k],
                }
                for k in ("a", "b", "c")
            ],
            Mr=mr / 1e6,
        )
    elif m.get("frd"):
        f = frd(m["frd"], mf)
        out.update(Frd=f, Mr=m["Mr"] * f)
    else:
        out["Mr"] = m["Mr"]
    out["ratio"] = mf / out["Mr"] if out["Mr"] > 0 else (math.inf if mf > 0 else 0.0)
    return out


def station_check(base: dict, mf_pos: float, mf_neg: float, mfd: float, vf: float):
    """Resistances and D/C ratios at a station for the given factored effects."""
    pos = moment_check(base["positive"], mf_pos)
    neg = moment_check(base["negative"], mf_neg, mfd)
    v = base["shear"]
    rv = vf / v["Vr"] if v["Vr"] > 0 else math.inf
    out = {
        "positive": pos,
        "negative": neg,
        "shear": {"Vf": vf, "Vr": v["Vr"], "ratio": rv},
    }
    if v["tension_field"]:
        rm = max(pos["ratio"], neg["ratio"])
        out["interaction"] = {
            "Mf_Mr": rm,
            "Vf_Vr": rv,
            "value": 0.727 * rm + 0.455 * rv,
        }
    return out


def resistance(section: Section, settings: Resistance, kind: str = None, **forces):
    """One section with optional effects (kN, kN·m): mf_pos, mf_neg, mfd, vf."""
    if kind is None:
        kind = settings.type_of(0, section)
    base = section_resistance(section, kind, settings)
    base["check"] = station_check(
        base,
        forces.get("mf_pos", 0.0),
        forces.get("mf_neg", 0.0),
        forces.get("mfd", 0.0),
        forces.get("vf", 0.0),
    )
    return base


def station_forces(result, i, effects="both"):
    """(M max, M min, V max, V min) at station ``i`` for the effects compared:
    "both" (as analysed), "dead" (permanent loads), "live" (live load)."""
    dead = result["dead"]
    if effects == "dead":
        m, v = dead["M"][i], dead["V"][i]
        return m, m, v, v
    hi_m, lo_m = result["max"]["M"][i], result["min"]["M"][i]
    hi_v, lo_v = result["max"]["V"][i], result["min"]["V"][i]
    if effects == "live":
        return (
            hi_m - dead["M"][i],
            lo_m - dead["M"][i],
            hi_v - dead["V"][i],
            lo_v - dead["V"][i],
        )
    return hi_m, lo_m, hi_v, lo_v


def _station_effects(result, i, m_steel, effects="both"):
    m_hi, m_lo, v_hi, v_lo = station_forces(result, i, effects)
    mf_pos = max(m_hi, 0.0)
    mf_neg = max(-m_lo, 0.0)
    vf = max(abs(v_hi), abs(v_lo))
    # Girder-alone part of the moment: permanent loads only.
    mfd = 0.0 if effects == "live" else min(max(-m_steel[i], 0.0), mf_neg)
    return mf_pos, mf_neg, mfd, vf


def _finite(v):
    return None if v is None or not math.isfinite(v) else v


def resistance_all(model, result, settings: Resistance, index=None) -> dict:
    """Resistance at every station (or the full sheet at station ``index``).

    The effects are those of the analysis result; the girder-alone part of
    the permanent moment (self-weight and "girder alone" loads) feeds the
    class 3 composite M− check.
    """
    from .engine import stage_effects
    from .section_props import section_properties
    from .sections import section_source

    if result.get("kind") == "thermal":
        raise ValueError("thermal.resistance")
    effects = settings.effects
    stages = stage_effects(model, result)
    m_sw, m_dead_steel, _ = stages["M"]
    m_steel = [a + b for a, b in zip(m_sw, m_dead_steel)]
    if index is not None:
        x, side = result["x"][index], result["sides"][index]
        source, section = section_source(model, x, side)
        if section.kind != "girder":
            raise ValueError("resistance.girder")
        mf_pos, mf_neg, mfd, vf = _station_effects(result, index, m_steel, effects)
        kind = settings.type_of(source, section)
        out = resistance(
            section, settings, kind, mf_pos=mf_pos, mf_neg=mf_neg, mfd=mfd, vf=vf
        )
        out.update(
            x=x,
            side=side,
            index=index,
            section=section.model_dump(),
            section_index=source,
            effects={
                "M_max": result["max"]["M"][index],
                "M_min": result["min"]["M"][index],
                "V_max": result["max"]["V"][index],
                "V_min": result["min"]["V"][index],
                "M_girder": m_steel[index],
                "load_mode": model.load_mode,
                "effects": effects,
            },
            stages={
                key: {
                    "self_weight": stages[key][0][index],
                    "dead_steel": stages[key][1][index],
                    "dead_3n": stages[key][2][index],
                    "live_max": result["max"][key][index] - result["dead"][key][index],
                    "live_min": result["min"][key][index] - result["dead"][key][index],
                }
                for key in ("M", "V")
            },
            props=section_properties(section),
        )
        return _clean(out)
    keys, cache = {}, {}
    names = [s.name for s in model.sections]
    rows = {k: [] for k in ("Mr_pos", "Mr_neg", "Vr", "r_pos", "r_neg", "r_v", "r_mv")}
    rows.update(section=[], kind=[], class_pos=[], class_neg=[])
    for i, (x, side) in enumerate(zip(result["x"], result["sides"])):
        source, section = section_source(model, x, side)
        if section.kind != "girder":
            for v in rows.values():
                v.append(None)
            continue
        kind = settings.type_of(source, section)
        key = (json.dumps(section.model_dump(), sort_keys=True), kind)
        if key not in cache:
            cache[key] = section_resistance(section, kind, settings)
            keys[key] = len(keys)
        base = cache[key]
        chk = station_check(base, *_station_effects(result, i, m_steel, effects))
        rows["Mr_pos"].append(_finite(chk["positive"]["Mr"]))
        rows["Mr_neg"].append(_finite(chk["negative"]["Mr"]))
        rows["Vr"].append(base["shear"]["Vr"])
        rows["r_pos"].append(_finite(chk["positive"]["ratio"]))
        rows["r_neg"].append(_finite(chk["negative"]["ratio"]))
        rows["r_v"].append(_finite(chk["shear"]["ratio"]))
        inter = chk.get("interaction")
        rows["r_mv"].append(_finite(inter["value"]) if inter else None)
        rows["section"].append(source)
        rows["kind"].append(base["kind"])
        rows["class_pos"].append(base["classes"]["positive"])
        rows["class_neg"].append(base["classes"]["negative"])
    summary = {}
    for key in ("r_pos", "r_neg", "r_v", "r_mv"):
        values = [(v, i) for i, v in enumerate(rows[key]) if v is not None]
        if values:
            v, i = max(values)
            summary[key] = {"ratio": v, "index": i, "x": result["x"][i]}
    return {
        "rows": rows,
        "summary": summary,
        "sections": names,
        "load_mode": model.load_mode,
        "effects": effects,
        "distinct": len(keys),
    }


def _clean(value):
    """JSON-safe copy: infinite or NaN ratios become None."""
    if isinstance(value, dict):
        return {k: _clean(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_clean(v) for v in value]
    if isinstance(value, float):
        return _finite(value)
    return value
