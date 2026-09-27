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


def properties(section: Section) -> dict:
    """Parallel-axis theorem for three non-overlapping rectangles, in SI."""
    if section.kind == "ei":
        return {"A": None, "I": None, "centroid": None, "EI": section.EI}
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
    }


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


def member_deflection(local_x, moment, ei, kappa=0.0):
    """Deflection of one simply-supported-ends member from M(x)/EI(x) + kappa.

    PyCBA integrates curvature on a uniform grid. When an EI step falls between
    (or exactly on) grid points, that trapezoidal rule is only first-order
    accurate and, because the jump is seen differently from each end, a
    mirrored non-prismatic bridge gets visibly asymmetric deflections. Here
    the grid is augmented on BOTH sides of every EI breakpoint, so each EI
    piece is integrated separately. Returns (x, D) in PyCBA's sign convention,
    with D(0) = D(L) = 0 (all QuickerBridge supports are vertically fixed).
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
