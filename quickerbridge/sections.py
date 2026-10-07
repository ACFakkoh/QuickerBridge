"""Steel I-girder properties and depth-only tapers with explicit plate steps."""

import numpy as np
import pycba as cba

from .models import Model, Section, plate_source


class LinearSectionEI(cba.SectionEI):
    """Vectorized evaluator for our constant/linear pieces; same PyCBA model.

    Avoid scanning every piece for every integration point. The inherited
    builder still owns the pieces, breakpoints and stiffness integration.
    """

    def add_segment(self, *args, **kwargs):
        self._lookup = None
        return super().add_segment(*args, **kwargs)

    def __call__(self, x):
        if getattr(self, "_lookup", None) is None:
            if not self.pieces or any(p.degree > 1 for p in self.pieces):
                return super().__call__(x)
            self._lookup = (
                np.array([p.x1 for p in self.pieces]),
                np.array([p.coeffs[0] if p.degree else 0 for p in self.pieces]),
                np.array([p.coeffs[-1] for p in self.pieces]),
            )
        ends, slopes, intercepts = self._lookup
        values = np.asarray(x, dtype=float)
        # Preserve PyCBA's left-side convention and boundary tolerance.
        indices = np.minimum(np.searchsorted(ends + 1e-12, values), len(ends) - 1)
        result = slopes[indices] * values + intercepts[indices]
        return float(result) if np.isscalar(x) else result


DIMENSIONS = (
    "depth",
    "top_width",
    "top_thickness",
    "web_thickness",
    "bottom_width",
    "bottom_thickness",
)


# Standard precast prestressed NEBT girders (MTQ "Caractéristiques des poutres
# préfabriquées"): area mm², strong-axis inertia 10⁶ mm⁴, Yb and depth mm,
# linear weight kN/m. Top flange 1200 mm, bottom flange 810 mm, web 180 mm.
NEBT = {
    "NEBT1000": {"A": 481_787, "I": 62_119, "yb": 483.4, "h": 1000, "w": 11.80},
    "NEBT1200": {"A": 517_773, "I": 99_187, "yb": 574.8, "h": 1200, "w": 12.69},
    "NEBT1400": {"A": 553_643, "I": 146_547, "yb": 667.4, "h": 1400, "w": 13.56},
    "NEBT1600": {"A": 589_884, "I": 204_920, "yb": 761.2, "h": 1600, "w": 14.45},
    "NEBT1800": {"A": 625_457, "I": 275_049, "yb": 854.9, "h": 1800, "w": 15.32},
}
STEEL_UNIT_WEIGHT = 77.0  # kN/m³ (7850 kg/m³)


def properties(section: Section) -> dict:
    """Parallel-axis theorem for three non-overlapping rectangles, in SI."""
    if section.kind == "ei":
        return {"A": None, "I": None, "centroid": None, "EI": section.EI, "w": None}
    if section.kind == "nebt":
        data = NEBT[section.nebt]
        inertia = data["I"] * 1e-6  # 10⁶ mm⁴ -> m⁴
        return {
            "A": data["A"] * 1e-6,
            "I": inertia,
            "I_effective": inertia * section.inertia_modifier,
            "centroid": data["yb"],
            "EI": section.E * 1e6 * inertia * section.inertia_modifier,
            # v0.9.8: the tabulated weight is A × 24.5 kN/m³; it follows γc.
            "w": data["w"] * section.unit_weight / 24.5,
        }
    d, bt, tt, tw, bb, tb = [getattr(section, key) / 1000 for key in DIMENSIONS]
    hw = d - tt - tb
    areas = np.array([bb * tb, tw * hw, bt * tt])
    centres = np.array([tb / 2, tb + hw / 2, d - tt / 2])
    area = areas.sum()
    centroid = float(areas @ centres / area)
    inertia = float(
        bb * tb**3 / 12
        + tw * hw**3 / 12
        + bt * tt**3 / 12
        + areas @ (centres - centroid) ** 2
    )
    return {
        "A": float(area),
        "I": inertia,
        "I_effective": inertia * section.inertia_modifier,
        "centroid": centroid * 1000,
        "EI": section.E * 1e6 * inertia * section.inertia_modifier,
        "w": float(area) * STEEL_UNIT_WEIGHT,
    }


def self_weight_pieces(model: Model, pieces_per_taper: int = 6):
    """Nominal girder weight per span as ``(span, a, b, w kN/m, section)``.

    Direct-EI sections have no known area and carry no self-weight. In a
    tapered steel zone the web height (hence the area) follows the depth; the
    zone is split into equal pieces weighted at their mid-length.
    """
    out = []
    for i, span in enumerate(model.spans):
        length = span.length
        if not model.nonprismatic or not span.zones:
            section = model.sections[span.section]
            out.append((i, 0.0, length, properties(section)["w"], section))
            continue
        start = 0.0
        for zone in span.zones:
            end = zone.end * length
            a = model.sections[zone.section]
            b = model.sections[
                zone.end_section if zone.end_section is not None else zone.section
            ]
            if zone.profile == "constant" or a == b:
                out.append((i, start, end, properties(a)["w"], a))
            else:
                source = plate_source(zone, a, b)
                edges = np.linspace(start, end, pieces_per_taper + 1)
                for x0, x1 in zip(edges[:-1], edges[1:]):
                    u = ((x0 + x1) / 2 - start) / (end - start)
                    shape = float(profile_fraction(a, b, u, zone.profile))
                    piece = interpolate(a, b, shape, source)
                    out.append(
                        (i, float(x0), float(x1), properties(piece)["w"], source)
                    )
            start = end
    return [p for p in out if p[3]]


def profile_fraction(a: Section, b: Section, t, profile: str):
    """Parabolic haunch tangent at the shallow end; symmetric on reversal."""
    if profile == "parabolic":
        return 1 - (1 - t) ** 2 if a.depth > b.depth else t**2
    return t


def interpolate(a: Section, b: Section, t: float, plates: Section = None) -> Section:
    """Only overall depth varies; plates, E and modifier come from ``plates``.

    ``plates`` defaults to the start section ``a`` (v0.4 behaviour).
    """
    data = (plates or a).model_dump()
    data["depth"] = a.depth * (1 - t) + b.depth * t
    return Section.model_validate(data)


def span_ei(model: Model, index: int):
    span = model.spans[index]
    if not model.nonprismatic or not span.zones:
        return properties(model.sections[span.section])["EI"]
    sec = LinearSectionEI()
    start = 0.0
    for zone in span.zones:
        end = zone.end * span.length
        a = model.sections[zone.section]
        b = model.sections[
            zone.end_section if zone.end_section is not None else zone.section
        ]
        if zone.profile == "constant" or a == b:
            # A constant zone has one section; the plates option only
            # matters where the depth varies.
            sec.add_segment("const", [start, end], properties(a)["EI"])
        else:
            # Geometry is interpolated first. EI is sampled into positive linear
            # pieces, avoiding polynomial overshoot for asymmetric I-girders.
            t = np.linspace(0, 1, 33 if model.precision == "standard" else 65)
            shape = profile_fraction(a, b, t, zone.profile)
            source = plate_source(zone, a, b)
            values = [
                properties(interpolate(a, b, float(u), source))["EI"] for u in shape
            ]
            sec.add_segment("pwl", start + t * (end - start), values)
        start = end
    return sec


def member_deflection(local_x, moment, ei, kappa=0.0, ends=(0.0, 0.0)):
    """Deflection of one member from M(x)/EI(x) + kappa and its end values.

    PyCBA integrates curvature on a uniform grid. When an EI step falls between
    (or exactly on) grid points, that trapezoidal rule is only first-order
    accurate and, because the jump is seen differently from each end, a
    mirrored non-prismatic bridge gets visibly asymmetric deflections. Here
    the grid is augmented on BOTH sides of every EI breakpoint, so each EI
    piece is integrated separately. Returns (x, D) in PyCBA's sign convention,
    with D(0), D(L) = ``ends``: zero on supports (all QuickerBridge supports
    are vertically fixed), the nodal deflection at a deck joint (v0.9.99).
    Prismatic members return None: PyCBA's closed-form path is already exact.
    """
    if not isinstance(ei, cba.SectionEI):
        return None
    local_x = np.asarray(local_x, float)
    length = float(local_x[-1])
    eps = 1e-9 * max(length, 1.0)
    bp = np.asarray(ei.breakpoints, float)
    bp = bp[(bp > eps) & (bp < length - eps)]
    x = np.unique(np.r_[local_x, bp - eps, bp + eps])
    m = np.interp(x, local_x, np.asarray(moment, float))
    curvature = m / np.asarray(ei(x), float) + kappa
    from scipy.integrate import cumulative_trapezoid

    slope = cumulative_trapezoid(curvature, x, initial=0)
    d = cumulative_trapezoid(slope, x, initial=0)
    d -= x / length * d[-1]
    d += ends[0] + (ends[1] - ends[0]) * x / length
    return x, d


def stiffness_profile(model: Model, samples: int = 97, jump_ratio: float = 1.15):
    """EI(x) along the whole bridge plus warnings for abrupt stiffness steps.

    A step is reported at every zone boundary or interior support where EI on
    the two sides differs by more than ``jump_ratio``. Such steps are often
    unintended: a tapered zone keeps the plates, E and inertia modifier of its
    START section, so reversing start/end sections does not mirror a haunch.
    """
    xs, eis, jumps = [], [], []
    start = 0.0
    previous_right = None
    for i, span in enumerate(model.spans):
        ei = span_ei(model, i)
        local = np.linspace(0, span.length, samples)
        if isinstance(ei, cba.SectionEI):
            eps = 1e-7 * span.length
            bp = np.asarray(ei.breakpoints, float)
            local = np.unique(np.r_[local, bp - eps, bp + eps])
            local = local[(local >= 0) & (local <= span.length)]
            values = np.asarray(ei(local), float)
            for b in bp[(bp > eps) & (bp < span.length - eps)]:
                left, right = float(ei(b - eps)), float(ei(b + eps))
                if max(left, right) / min(left, right) > jump_ratio:
                    jumps.append(
                        {
                            "x": start + float(b),
                            "left": left,
                            "right": right,
                            "span": i + 1,
                            "kind": "zone",
                        }
                    )
        else:
            values = np.full(len(local), float(ei))
        if previous_right is not None:
            left, right = previous_right, float(values[0])
            if max(left, right) / min(left, right) > jump_ratio:
                jumps.append(
                    {
                        "x": start,
                        "left": left,
                        "right": right,
                        "span": i + 1,
                        "kind": "support",
                    }
                )
        previous_right = float(values[-1])
        xs.extend((start + local).tolist())
        eis.extend(values.tolist())
        start += span.length
    return {"x": xs, "EI": eis, "jumps": jumps}


def section_at(model: Model, x: float, side: str = "right") -> Section:
    """Section in force at global x (tapers: interpolated depth, plate source).

    The returned section carries the composite slab of the section that
    supplies the plates (start section of a constant zone).
    """
    return section_source(model, x, side)[1]


def section_source(model: Model, x: float, side: str = "right"):
    """(index, section) at global x: ``index`` is the model section that
    supplies the plates and the slab (v0.9.98, resistance type per section)."""
    start = 0.0
    spans = model.spans
    for i, span in enumerate(spans):
        end = start + span.length
        last = i == len(spans) - 1
        if x < end - 1e-9 or (abs(x - end) <= 1e-9 and (side == "left" or last)):
            break
        start = end
    local = min(max(x - start, 0.0), span.length) / span.length
    if not model.nonprismatic or not span.zones:
        return span.section, model.sections[span.section]
    previous = 0.0
    for zone in span.zones:
        if local <= zone.end + 1e-12:
            break
        previous = zone.end
    end_index = zone.end_section if zone.end_section is not None else zone.section
    a = model.sections[zone.section]
    b = model.sections[end_index]
    if zone.profile == "constant" or a == b:
        return zone.section, a
    t = (local - previous) / (zone.end - previous) if zone.end > previous else 0.0
    shape = float(profile_fraction(a, b, t, zone.profile))
    source = plate_source(zone, a, b)
    index = zone.section if source is a else end_index
    return index, interpolate(a, b, shape, source)
