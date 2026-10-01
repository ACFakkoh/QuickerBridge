"""CSA S6-25 simplified method: truck load fraction FT, slab-on-girder bridges.

Scope: highway classes A and B (Table 5.3), CL-625 / CL-750-QC trucks.

    FT = S / (DT γc (1 + μλ + γe))       (clause 5.6.4.3 with Tables 5.3 to 5.7)
    FT ≥ 1.05 n RL / N  at ULS and SLS1,   FT ≥ 1.05 / N  at FLS and SLS2

γe only exists for exterior girders at SLS2/FLS (Table 5.7); it is zero
elsewhere, which gives the S/(DT γc (1+μλ)) form of clause 5.6.4.3.

Notation (S6 symbols): N girders, S girder spacing, Sc overhang to the exterior
web, Wc carriageway width, n design lanes (Table 3.5), We = Wc/n, RL
(Table 3.6), μ = (We − 3.3)/0.6 ≤ 1.0 (5.6.4.4), Le the span between inflection
points (5.6.4.6, Figure 5.1), DVE the vehicle edge distance (Figure 5.2) and
Fs the skew factor for exterior shear at an obtuse corner (5.6.6.2).

Le follows Figure 5.1: simple spans L; continuous spans 0.75 L (end span),
0.5 L (interior span) and, for negative moment over a pier, 0.20 (L1 + L2) —
the S6-25 value replacing the 0.25 of earlier editions in Figure 5.1 a). An
integral abutment (fixed or spring end support) follows Figure 5.1 d): 0.6 L in
the adjacent span, 0.15 L + h at the abutment and 0.25 (L1 + L2) at the pier.
An isostatic span splits the bridge into independent chains.
"""

import math

from .models import Model

# Table 3.5: carriageway width upper limits (m) -> number of design lanes.
LANE_LIMITS = (
    (6.0, 1),
    (10.0, 2),
    (13.5, 3),
    (17.0, 4),
    (20.5, 5),
    (24.0, 6),
    (27.5, 7),
)
# Table 3.6: load modification factor for multiple loaded lanes.
RL = {1: 1.00, 2: 0.90, 3: 0.80, 4: 0.70, 5: 0.60}
WHEEL_GAUGE = 1.8  # m, CL-W truck wheel lines (truck axis on the lane axis)
DVE_MAX = 3.0  # m, upper limit of the vehicle edge distance
PIER_FACTOR = 0.20  # Figure 5.1 a), S6-25
PIER_FACTOR_INTEGRAL = 0.25  # Figure 5.1 d)
STATES = ("ULS", "FLS")  # ULS = ÉLUL and ÉLUT1; FLS = ÉLF and ÉLUT2


def design_lanes(wc: float) -> int:
    for limit, n in LANE_LIMITS:
        if wc <= limit:
            return n
    return 8


def lane_factor(n: int) -> float:
    return RL.get(n, 0.55)


def clamp_le(value: float) -> float:
    """Clause 5.6.4.6: Le is taken as 3 m if smaller and 60 m if larger."""
    return min(max(value, 3.0), 60.0)


def skew_factor(length: float, spacing: float, skew_deg: float) -> float:
    """Clause 5.6.6.2: Fs = 1.2 − 2.0/(ε + 10), ε = (L/S) tan ψ, ψ ≤ 45°."""
    if skew_deg <= 0:
        return 1.0
    eps = length / spacing * math.tan(math.radians(skew_deg))
    return 1.2 - 2.0 / (eps + 10)


def effective_spans(model: Model, h_left: float, h_right: float):
    """Le of every positive-moment span and negative-moment support (Fig. 5.1)."""
    spans = model.spans
    n = len(spans)
    lengths = [s.length for s in spans]
    starts = [0.0]
    for length in lengths:
        starts.append(starts[-1] + length)
    integral = [kind in ("fixed", "spring") for kind in model.supports]
    chains, i = [], 0
    while i < n:
        if spans[i].simple:
            chains.append((i, i, True))
            i += 1
            continue
        j = i
        while j + 1 < n and not spans[j + 1].simple:
            j += 1
        chains.append((i, j, False))
        i = j + 1
    positive, negative = [], []
    for a, b, simple in chains:
        left = not simple and a == 0 and integral[0]
        right = not simple and b == n - 1 and integral[n]
        if simple or (a == b and not left and not right):
            positive.append((a, lengths[a], "L"))
            continue
        for k in range(a, b + 1):
            if (k == a and left) or (k == b and right):
                positive.append((k, 0.6 * lengths[k], "0,6 L"))
            elif k in (a, b):
                positive.append((k, 0.75 * lengths[k], "0,75 L"))
            else:
                positive.append((k, 0.5 * lengths[k], "0,5 L"))
        factor = PIER_FACTOR_INTEGRAL if (left or right) else PIER_FACTOR
        label = "0,25 (L1+L2)" if (left or right) else "0,20 (L1+L2)"
        # The last element is the negative-moment zone along the bridge: the
        # same fraction of each adjacent span as in Le (Figure 5.1).
        if left:
            zone = (starts[0], starts[0] + 0.15 * lengths[a])
            negative.append(
                (0, 0.15 * lengths[a] + h_left, "0,15 L + h", "abutment", zone)
            )
        for k in range(a + 1, b + 1):
            zone = (
                starts[k] - factor * lengths[k - 1],
                starts[k] + factor * lengths[k],
            )
            negative.append(
                (k, factor * (lengths[k - 1] + lengths[k]), label, "pier", zone)
            )
        if right:
            zone = (starts[n] - 0.15 * lengths[b], starts[n])
            negative.append(
                (n, 0.15 * lengths[b] + h_right, "0,15 L + h", "abutment", zone)
            )
    return positive, negative


# --- Table 5.3 (classes A and B) ---------------------------------------------


def coefficients(state, girder, effect, n, le):
    """DT and λ from Table 5.3 for one load effect."""
    if effect == "shear":
        if state == "ULS":
            return (3.50 if n == 1 else 3.40), 0.0
        return (3.50 if n == 1 else 3.60), 0.0
    if state == "ULS":
        lam = 0.05 - 0.10 / le if n == 1 else 0.10 - 0.25 / le
        if girder == "interior":
            if n == 1:
                return 4.60 - 3.10 / math.sqrt(le + 5), lam
            return max(4.60 - 5.30 / math.sqrt(le + 5), 2.80), lam
        return (3.30 + le / 300 if n == 1 else 3.40 + le / 500), lam
    if girder == "interior":
        if n == 1:
            dt = 4.60 - 3.10 / math.sqrt(le + 5)
        elif n == 2:
            dt = 4.80 - 3.00 / math.sqrt(le)
        elif n == 3:
            dt = 4.95 - 3.50 / math.sqrt(le)
        else:
            dt = 5.15 - 4.00 / math.sqrt(le)
        return dt, 0.05
    if n == 1:
        return min(3.25 + le / 200, 3.50), 0.05
    if n == 2:
        return min(3.55 + le / 200, 3.80), 0.05
    return min(3.65 + le / 150, 4.10), 0.0


def gamma_c_interior_fls(n, le, s):
    """Table 5.4: interior girders, moments at SLS2 and FLS."""
    if n == 1 or le <= 10:
        return 1.0
    if s <= 1.2:
        return 1.0
    if le <= 50:
        return 1.0 + (0.3 * s - 0.36 if s <= 3.6 else 0.72) * (le - 10) / 40
    return 0.3 * s + 0.64 if s <= 3.6 else 1.72


def gamma_c_exterior(s, sc):
    """Table 5.5: exterior girders, moments (ULS, SLS and FLS)."""
    if sc <= 0.5 * s:
        return 1.0
    return min(1.25 - 0.50 * sc / s, 1.0)


def gamma_c_shear(s, continuous_support):
    """Table 5.6: shear, interior and exterior girders."""
    if continuous_support:
        return min((s / 4.5) ** 0.15, 0.9)
    return min((s / 2.0) ** 0.25, 1.0)


def gamma_e(girders, le, dve):
    """Table 5.7: exterior girders, moments at SLS2 and FLS."""
    if girders < 2:
        return 0.0
    x = dve - 1.0
    if le <= 20:
        return 0.28 * x * (1 + 0.40 * x**2)
    return 0.28 * x * (1 + 160 * x**2 / le**2)


def truck_fraction(model: Model) -> dict:
    d = model.distribution
    N, S, Sc, Wc = d.girders, d.spacing, d.overhang, d.carriageway
    n = design_lanes(Wc)
    rl = lane_factor(n)
    We = Wc / n
    mu = min((We - 3.3) / 0.6, 1.0)
    B = (N - 1) * S + 2 * Sc
    curb = (B - Wc) / 2
    dve = curb + We / 2 - WHEEL_GAUGE / 2
    warnings = []
    if dve > DVE_MAX:  # DVE shall not exceed 3.0 m
        dve = DVE_MAX
        warnings.append("dve_capped")
    if model.live.vehicle not in ("CL625", "CL750QC"):
        warnings.append("vehicle")
    if Sc > 0.6 * S:
        warnings.append("overhang")
    if curb < 0:
        warnings.append("width")
    positive, negative = effective_spans(model, d.h_left, d.h_right)
    if any(not 3 <= le <= 60 for _, le, *_ in positive + negative):
        warnings.append("le_clamped")
    lengths = [s.length for s in model.spans]
    fs = [skew_factor(L, S, d.skew) for L in lengths]
    nspan = len(lengths)
    continuous = [
        0 < k < nspan and not model.spans[k - 1].simple and not model.spans[k].simple
        for k in range(nspan + 1)
    ]
    minimum = {"ULS": 1.05 * n * rl / N, "FLS": 1.05 / N}
    rows = []

    def add(state, girder, effect, sign, where, le, rule, cont=False, skew=1.0):
        dt, lam = coefficients(state, girder, effect, n, le)
        if effect == "shear":
            gc = gamma_c_shear(S, cont)
        elif girder == "exterior":
            gc = gamma_c_exterior(S, Sc)
        else:
            gc = 1.0 if state == "ULS" else gamma_c_interior_fls(n, le, S)
        ge = (
            gamma_e(N, le, dve)
            if (state == "FLS" and girder == "exterior" and effect == "moment")
            else 0.0
        )
        calc = S / (dt * gc * (1 + mu * lam + ge))
        ft = max(calc, minimum[state])
        rows.append(
            {
                "state": state,
                "girder": girder,
                "effect": effect,
                "sign": sign,
                "where": where,
                "Le": le,
                "Le_rule": rule,
                "DT": dt,
                "lambda": lam,
                "gamma_c": gc,
                "gamma_e": ge,
                "FT_calc": calc,
                "FT_min": minimum[state],
                "FT": ft,
                "minimum_governs": calc < minimum[state],
                "Fs": skew,
                "FT_Fs": ft * skew,
            }
        )

    for state in STATES:
        for girder in ("interior", "exterior"):
            for k, le, rule in positive:
                add(state, girder, "moment", "+", f"span:{k + 1}", clamp_le(le), rule)
            for k, le, rule, kind, _ in negative:
                add(
                    state, girder, "moment", "-", f"support:{k + 1}", clamp_le(le), rule
                )
            # Shear: Le does not enter Table 5.3; positive regions take the
            # simple-support γc, continuous piers the interior-support γc.
            for k, le, rule in positive:
                skew = fs[k] if girder == "exterior" else 1.0
                add(
                    state,
                    girder,
                    "shear",
                    "+",
                    f"span:{k + 1}",
                    clamp_le(le),
                    rule,
                    False,
                    skew,
                )
            for k, le, rule, kind, _ in negative:
                if kind != "pier":
                    continue
                skew = max(fs[k - 1], fs[k]) if girder == "exterior" else 1.0
                add(
                    state,
                    girder,
                    "shear",
                    "-",
                    f"support:{k + 1}",
                    clamp_le(le),
                    rule,
                    continuous[k],
                    skew,
                )
    return {
        "kind": "slab_on_girder",
        "inputs": d.model_dump(),
        "derived": {
            "n": n,
            "RL": rl,
            "We": We,
            "mu": mu,
            "B": B,
            "curb": curb,
            "DVE": dve,
            "spans": [
                {"span": i + 1, "L": L, "Fs": fs[i]} for i, L in enumerate(lengths)
            ],
            "positive": [
                {"span": k + 1, "Le": clamp_le(le), "rule": rule}
                for k, le, rule in positive
            ],
            "negative": [
                {"support": k + 1, "Le": clamp_le(le), "rule": rule, "kind": kind}
                for k, le, rule, kind, _ in negative
            ],
            "minimum": minimum,
        },
        "rows": rows,
        "zones": zones(model, rows, negative),
        "warnings": warnings,
    }


def zones(model: Model, rows, negative):
    """FT applied along the bridge for the selected girder and limit state.

    Negative-moment zones (Figure 5.1) take the M− fraction of their support;
    the rest of each span takes its M+ fraction. Shear uses the same zones:
    the pier shear fraction over a continuous pier, otherwise the span shear
    fraction (exterior girder: × Fs, conservatively over the whole zone).
    """
    d = model.distribution
    sel = {
        (r["effect"], r["where"]): r
        for r in rows
        if r["state"] == d.state and r["girder"] == d.girder
    }
    starts = [0.0]
    for span in model.spans:
        starts.append(starts[-1] + span.length)
    cuts = sorted(
        (zone[0], zone[1], k) for k, _, _, kind, zone in negative
    )  # non-overlapping
    out = []
    for i in range(len(model.spans)):
        pieces = [(starts[i], starts[i + 1])]
        for a, b, _ in cuts:
            pieces = [
                part
                for x0, x1 in pieces
                for part in ((x0, min(x1, a)), (max(x0, b), x1))
                if part[1] - part[0] > 1e-9
            ]
        for x0, x1 in pieces:
            out.append(
                {
                    "x0": x0,
                    "x1": x1,
                    "sign": "+",
                    "where": f"span:{i + 1}",
                    "FT_M": sel[("moment", f"span:{i + 1}")]["FT"],
                    "FT_V": sel[("shear", f"span:{i + 1}")]["FT_Fs"],
                }
            )
    for a, b, k in cuts:
        where = f"support:{k + 1}"
        shear = sel.get(("shear", where))
        if shear is None:  # integral abutment: shear of the adjacent span
            span = min(k, len(model.spans) - 1)
            shear = sel[("shear", f"span:{span + 1}")]
        out.append(
            {
                "x0": a,
                "x1": b,
                "sign": "-",
                "where": where,
                "FT_M": sel[("moment", where)]["FT"],
                "FT_V": shear["FT_Fs"],
            }
        )
    return sorted(out, key=lambda z: z["x0"])


def station_factors(model: Model, xs, sides, data=None):
    """FT on V and M at report stations ``xs`` (side picks the zone at a cut)."""
    data = data or truck_fraction(model)
    zs = data["zones"]
    total = zs[-1]["x1"]
    fv, fm = [], []
    for x, side in zip(xs, sides):
        q = min(max(x + (-1e-9 if side == "left" else 1e-9), 0.0), total)
        zone = next(z for z in zs if z["x0"] - 1e-12 <= q <= z["x1"] + 1e-12)
        fv.append(zone["FT_V"])
        fm.append(zone["FT_M"])
    return fv, fm


def applied(model: Model) -> bool:
    return model.distribution.enabled and model.distribution.apply
