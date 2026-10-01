"""Free-vibration (modal) analysis of the deck in vertical bending.

Same formulation as PyCBA's ``BeamAnalysis.modal`` (``pycba.modal``): Euler-
Bernoulli Hermite elements, consistent mass matrix, generalized eigenproblem
``K phi = omega^2 M phi`` with the supports applied at the span nodes. PyCBA's
version is limited to prismatic spans with one mass per span, so this module
extends it to what QuickerBridge models:

* non-prismatic spans: element stiffness integrated with EI(x) (3-point Gauss),
  the mesh breaks at every zone limit so EI steps fall on nodes;
* mass from the permanent loads (unfactored, m = w / g), which may cover part
  of a span only: the mesh also breaks at every load limit;
* pinned, roller, fixed (integral) and rotational-spring supports.

For a prismatic model with uniform mass the mesh is PyCBA's uniform mesh and
the matrices are identical; ``tests/test_modal.py`` checks both agree, and
compares with closed-form frequencies.

Units: EI in kN m2, mass in t/m, k in kN m/rad -> omega in rad/s.
"""

import math
import time

import numpy as np

from .sections import span_ei, span_zones
from .models import Model
from .loads import self_weight_intervals
from .engine import end_releases

G = 9.81  # m/s2, weight (kN/m) -> mass (t/m)
_GAUSS = (
    (0.5 - math.sqrt(15) / 10, 5 / 18),
    (0.5, 8 / 18),
    (0.5 + math.sqrt(15) / 10, 5 / 18),
)


def _stiffness(ei, x0, h):
    """Hermite element stiffness with EI(x) integrated by 3-point Gauss."""
    k = np.zeros((4, 4))
    for xi, w in _GAUSS:
        value = float(ei(x0 + xi * h)) if callable(ei) else float(ei)
        b = np.array(
            [
                (-6 + 12 * xi) / h**2,
                (-4 + 6 * xi) / h,
                (6 - 12 * xi) / h**2,
                (-2 + 6 * xi) / h,
            ]
        )
        k += w * h * value * np.outer(b, b)
    return k


def _mass(m, h):
    """Consistent mass matrix, uniform mass per length (same as PyCBA)."""
    return (m * h / 420.0) * np.array(
        [
            [156, 22 * h, 54, -13 * h],
            [22 * h, 4 * h * h, 13 * h, -3 * h * h],
            [54, 13 * h, 156, -22 * h],
            [-13 * h, -3 * h * h, -22 * h, 4 * h * h],
        ]
    )


def mass_profile(model: Model):
    """Mass per length intervals ``(start, end, t/m)`` in global x."""
    settings = model.modal
    starts = np.r_[0, np.cumsum([s.length for s in model.spans])]
    if settings.mass_source == "custom":
        # Imposed value given as a weight per length (kN/m), like the loads.
        return [(0.0, float(starts[-1]), settings.mass / G)]
    # Girder self-weight (with its allowance) is real mass; its load factor is not.
    out = [
        (v["start"], v["end"], v["input_w"] / G)
        for v in self_weight_intervals(model, starts)
    ]
    for load in model.dead:
        # Mass is the unfactored permanent load: a load factor is not mass.
        if not load.w:
            continue
        for i, span in enumerate(model.spans):
            if load.span in (-1, i):
                out.append(
                    (
                        float(starts[i] + load.start * span.length),
                        float(starts[i] + load.end * span.length),
                        load.w / G,
                    )
                )
    return out


def _mass_at(profile, x):
    return sum(m for a, b, m in profile if a - 1e-9 <= x <= b + 1e-9)


def mesh(model: Model, profile, per_span: int):
    """Element list ``(span, global x0, local x0, h)`` with breaks at limits."""
    elements = []
    start = 0.0
    for i, span in enumerate(model.spans):
        length = span.length
        breaks = {0.0, length}
        if model.nonprismatic:
            breaks.update(z.end * length for z in span_zones(model, i))
        for a, b, _ in profile:
            for value in (a - start, b - start):
                if 0 < value < length:
                    breaks.add(value)
        points = sorted(breaks)
        merged = [points[0]]
        for p in points[1:]:
            if p - merged[-1] > 1e-6 * length:
                merged.append(p)
        merged[-1] = length
        target = length / per_span
        for a, b in zip(merged[:-1], merged[1:]):
            n = max(1, int(math.ceil((b - a) / target - 1e-9)))
            h = (b - a) / n
            for k in range(n):
                elements.append((i, start + a + k * h, a + k * h, h))
        start += length
    return elements


def _classify(x, v):
    """Symmetric (S) or antisymmetric (A) about mid-length, else '—'."""
    mirror = np.interp(x[-1] - x, x, v)
    norm = float(v @ v)
    if norm <= 0:
        return "—"
    c = float(v @ mirror) / norm
    return "S" if c > 0.98 else "A" if c < -0.98 else "—"


def analyse_modal(model: Model) -> dict:
    started = time.perf_counter()
    settings = model.modal
    profile = mass_profile(model)
    lengths = [s.length for s in model.spans]
    total_length = float(sum(lengths))
    total_mass = sum((b - a) * m for a, b, m in profile)
    if total_mass <= 0:
        raise ValueError("modal.no_mass")
    per_span = 40 if model.precision == "standard" else 80
    elements = mesh(model, profile, per_span)
    n_nodes = len(elements) + 1
    eis = [span_ei(model, i) for i in range(len(lengths))]
    x_nodes = np.r_[elements[0][1], [gx0 + h for _, gx0, _, h in elements]]
    support_x = np.r_[0.0, np.cumsum(lengths)]
    support_nodes = [int(np.argmin(np.abs(x_nodes - x))) for x in support_x]
    # Isostatic spans: at a support next to a released member end, the two
    # sides get independent rotations (a hinge). The rotational restraint of
    # a fixed/spring support acts only on the sides that are not released.
    releases = end_releases(model)
    nspan = len(lengths)
    split, restrained_sides = {}, {}
    for j, node in enumerate(support_nodes):
        left = releases[j - 1][1] if j > 0 else None
        right = releases[j][0] if j < nspan else None
        split[node] = left is not None and right is not None and (left or right)
        restrained_sides[j] = [
            s for s, rel in (("l", left), ("r", right)) if rel is False
        ]
    # DOF map: vertical, rotation seen from the left, rotation seen from the right.
    vdof, rl, rr = [], [], []
    count = 0
    for node in range(n_nodes):
        vdof.append(count)
        rl.append(count + 1)
        rr.append(count + 2 if split.get(node) else count + 1)
        count += 3 if split.get(node) else 2
    ndof = count
    K = np.zeros((ndof, ndof))
    M = np.zeros((ndof, ndof))
    mean_mass = total_mass / total_length
    # A massless stretch (partial permanent load) would make M singular; a
    # negligible floor keeps it positive definite without changing results.
    floor = 1e-6 * mean_mass
    unloaded = 0.0
    for e, (span, gx0, lx0, h) in enumerate(elements):
        m = _mass_at(profile, gx0 + h / 2)
        if m <= 0:
            unloaded += h
        dofs = np.array([vdof[e], rr[e], vdof[e + 1], rl[e + 1]])
        K[np.ix_(dofs, dofs)] += _stiffness(eis[span], lx0, h)
        M[np.ix_(dofs, dofs)] += _mass(max(m, floor), h)
    fixed = []
    for j, kind in enumerate(model.supports):
        node = support_nodes[j]
        fixed.append(vdof[node])
        rotations = sorted(
            {rl[node] if s == "l" else rr[node] for s in restrained_sides[j]}
        )
        if kind == "fixed":
            fixed.extend(rotations)
        elif kind == "spring":
            for dof in rotations:
                K[dof, dof] += float(model.support_springs[j])
    free = np.setdiff1d(np.arange(ndof), fixed)
    Kff, Mff = K[np.ix_(free, free)], M[np.ix_(free, free)]
    try:
        from scipy.linalg import eigh
    except ImportError:  # pragma: no cover - browser without the lite shim
        from ._scipy_lite import eigh
    w2, vectors = eigh(Kff, Mff)
    order = np.argsort(w2)
    w2, vectors = np.clip(w2[order], 0, None), vectors[:, order]
    count = int(min(settings.modes, len(w2)))
    # Vertical rigid-body influence vector: modal participation to a uniform
    # vertical excitation, as a share of the total mass of the deck.
    r = np.zeros(ndof)
    r[vdof] = 1.0
    r = r[free]
    modes, shapes = [], []
    for n in range(count):
        phi = vectors[:, n]
        generalized = float(phi @ Mff @ phi)
        gamma = float(phi @ Mff @ r)
        full = np.zeros(ndof)
        full[free] = phi
        v = full[vdof]
        peak = float(np.max(np.abs(v)))
        if peak > 0:
            v = v / peak
        if v[int(np.argmax(np.abs(v)))] < 0:
            v = -v
        omega = math.sqrt(float(w2[n]))
        f = omega / (2 * math.pi)
        modes.append(
            {
                "n": n + 1,
                "omega": omega,
                "f": f,
                "T": 1 / f if f > 0 else None,
                "mass_ratio": gamma * gamma / generalized / total_mass,
                "symmetry": _classify(x_nodes, v),
            }
        )
        shapes.append([round(float(value), 5) for value in v])
    references = []
    for i, length in enumerate(lengths):
        ei = eis[i]
        mean_ei = (
            float(np.mean(ei(np.linspace(0, length, 201)))) if callable(ei) else ei
        )
        m = (
            sum(
                max(0.0, min(b, support_x[i + 1]) - max(a, support_x[i])) * mm
                for a, b, mm in profile
            )
            / length
        )
        references.append(
            {
                "span": i + 1,
                "f_simple": (
                    math.pi / (2 * length**2) * math.sqrt(mean_ei / m)
                    if m > 0
                    else None
                ),
            }
        )
    return {
        "kind": "modal",
        "x": [round(float(v), 5) for v in x_nodes],
        "support_x": [float(v) for v in support_x],
        "supports": list(model.supports),
        "modes": modes,
        "shapes": shapes,
        "mass": {
            "source": settings.mass_source,
            "total_t": total_mass,
            "mean_t_per_m": mean_mass,
            "unloaded_length": unloaded,
            "profile": [[a, b, m] for a, b, m in profile],
        },
        "references": references,
        "elements": len(elements),
        "time_ms": (time.perf_counter() - started) * 1000,
    }
