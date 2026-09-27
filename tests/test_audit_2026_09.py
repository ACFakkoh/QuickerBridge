"""Regressions found in the 2026-09-27 audit (non-prismatic symmetry)."""

import numpy as np

from quickerbridge.engine import analyse, cached_basis, structure_key
from quickerbridge.models import Model
from quickerbridge.sections import stiffness_profile
from quickerbridge.thermal import analyse_thermal

S1 = dict(
    name="S1",
    E=200,
    inertia_modifier=3.92,
    depth=1200,
    top_width=350,
    top_thickness=25,
    web_thickness=14,
    bottom_width=600,
    bottom_thickness=50,
)
S2 = dict(
    S1, name="S2", inertia_modifier=1.12, depth=1800, top_width=600, top_thickness=50
)
S2_SHALLOW = dict(S2, name="S2b", depth=1200)


def mirrored(precision="fine", load_mode="live"):
    return Model.model_validate(
        {
            "spans": [
                {
                    "length": 34.8,
                    "zones": [
                        {"end": 0.8, "section": 0},
                        {
                            "end": 1,
                            "section": 2,
                            "end_section": 1,
                            "profile": "parabolic",
                        },
                    ],
                },
                {
                    "length": 34.8,
                    "zones": [
                        {
                            "end": 0.2,
                            "section": 1,
                            "end_section": 2,
                            "profile": "parabolic",
                        },
                        {"end": 1, "section": 0},
                    ],
                },
            ],
            "sections": [S1, S2, S2_SHALLOW],
            "nonprismatic": True,
            "load_mode": load_mode,
            "precision": precision,
        }
    )


def test_influence_reactions_keep_equilibrium_with_twin_knots():
    # Fine mode puts EI sampling points 1e-16 m from influence knots.
    basis = cached_basis(structure_key(mirrored()))
    p = np.linspace(0, basis.length, 4001)
    u = basis.unit(p)
    r = u[:, 3 * basis.nx : 3 * basis.nx + basis.ns]
    assert np.abs(r.sum(axis=1) - 1).max() < 1e-9
    assert np.abs(r @ basis.support_x - p).max() < 1e-7
    assert np.abs(u[:, 2 * basis.nx - 1]).max() < 1e-7  # M(end support) = 0


def test_mirrored_nonprismatic_envelope_is_symmetric():
    result = analyse(mirrored())
    x = np.array(result["x"])
    for key in ("M", "D"):
        for sense in ("min", "max"):
            v = np.array(result[sense][key])
            assert (
                np.abs(v - np.interp(x[-1] - x, x, v)).max()
                < 1e-6 * np.abs(v).max() + 1e-9
            )
    assert abs(result["max"]["M"][-1]) < 1e-6


def test_mirrored_nonprismatic_thermal_deflection_is_symmetric():
    result = analyse_thermal(mirrored(load_mode="thermal"))
    x = np.array(result["x"])
    d = np.array(result["values"]["D"])
    assert np.abs(d - np.interp(x[-1] - x, x, d)).max() < 1e-5


def test_stiffness_steps_are_reported():
    model = mirrored(precision="standard")
    model.spans[1].zones[0].section = 1
    model.spans[1].zones[0].end_section = 0  # S2 plates at 1200 mm: EI step
    jumps = stiffness_profile(model)["jumps"]
    assert any(abs(j["x"] - 34.8 * 1.2) < 1e-6 for j in jumps)
    mirror = sorted(
        round(j["x"], 6)
        for j in stiffness_profile(mirrored(precision="standard"))["jumps"]
    )
    assert mirror == [27.84, 41.76]
