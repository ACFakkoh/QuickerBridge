"""Steel I-girder properties and depth-only tapers with explicit plate steps."""

import numpy as np
import pycba as cba

from .models import Section, Model


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


def interpolate(a: Section, b: Section, t: float) -> Section:
    """Only overall depth varies; all plates, E and modifier belong to zone a."""
    data = a.model_dump()
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
            sec.add_segment("const", [start, end], properties(a)["EI"])
        else:
            # Geometry is interpolated first. EI is sampled into positive linear
            # pieces, avoiding polynomial overshoot for asymmetric I-girders.
            t = np.linspace(0, 1, 33 if model.precision == "standard" else 65)
            shape = profile_fraction(a, b, t, zone.profile)
            values = [properties(interpolate(a, b, float(u)))["EI"] for u in shape]
            sec.add_segment("pwl", start + t * (end - start), values)
        start = end
    return sec
