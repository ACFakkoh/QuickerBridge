"""Depth-only zones, effective stiffness and unchanged optimized PyCBA results."""

import json

import numpy as np
import pycba as cba
import pytest

from quickerbridge.engine import Basis, analyse
from quickerbridge.models import Model, Section, Span, Zone
from quickerbridge.projects import create_project, validate_project
from quickerbridge.sections import LinearSectionEI, interpolate, properties, span_ei


def test_reference_defaults():
    m = Model()
    assert [s.length for s in m.spans] == [34.8, 34.8]
    s = m.sections[0]
    assert (
        s.depth,
        s.top_width,
        s.top_thickness,
        s.web_thickness,
        s.bottom_width,
        s.bottom_thickness,
    ) == (1200, 350, 25, 14, 600, 50)
    assert m.live.vehicle == "CL750QC" and m.live.lane_fraction == 0.8


def test_modifier_changes_only_flexural_stiffness():
    m = Model(spans=[Span(length=10)], supports=["pin", "roller"], load_mode="dead")
    before = properties(m.sections[0])
    result = analyse(m)
    m.sections[0].inertia_modifier = 4
    after = properties(m.sections[0])
    for key in ("I", "A", "centroid"):
        assert after[key] == before[key]
    assert after["EI"] == 4 * before["EI"]
    assert after["I_effective"] == 4 * before["I"]
    stiffer = analyse(m)
    for key in ("V", "M", "R"):
        np.testing.assert_allclose(stiffer["max"][key], result["max"][key])
    np.testing.assert_allclose(stiffer["max"]["D"], np.array(result["max"]["D"]) / 4)


def test_taper_keeps_start_plates_and_jumps_at_next_zone():
    a = Section(depth=1200, inertia_modifier=2)
    b = Section(
        depth=1800, top_width=500, bottom_thickness=60, E=210, inertia_modifier=4
    )
    middle = interpolate(a, b, 0.5)
    assert middle.depth == 1500
    for key in ("top_width", "bottom_thickness", "E", "inertia_modifier"):
        assert getattr(middle, key) == getattr(a, key)
    m = Model(
        nonprismatic=True,
        sections=[a, b],
        spans=[
            Span(
                length=10,
                zones=[
                    Zone(end=0.5, section=0, end_section=1, profile="linear"),
                    Zone(end=1, section=1),
                ],
            )
        ],
        supports=["pin", "roller"],
    )
    ei = span_ei(m, 0)
    assert ei(5) == pytest.approx(properties(interpolate(a, b, 1))["EI"])
    assert ei(5 + 1e-8) == pytest.approx(properties(b)["EI"])
    a.top_thickness = 650
    a.bottom_thickness = 650
    with pytest.raises(ValueError, match="geometry.depth"):
        Model.model_validate(m.model_dump())


def test_fast_lookup_and_stiffness_cache_match_unmodified_pycba():
    fast, original = LinearSectionEI(), cba.SectionEI()
    for section in (fast, original):
        section.add_segment("pwl", [0, 1, 3, 4], [2e6, 1e6, 1.5e6, 3e6])
        section.add_segment("const", [4, 10], 4e6)
    x = np.r_[-1, np.linspace(0, 10, 401), 4 - 1e-11, 4 + 1e-11, 11]
    np.testing.assert_allclose(fast(x), original(x), rtol=1e-14)
    assert fast(4) == original(4)
    # Adding a piece invalidates the lookup, rather than retaining stale data.
    fast.add_segment("const", [10, 11], 8e6)
    assert fast(10.5) == 8e6
    m = Model(
        nonprismatic=True,
        sections=[Section(), Section(depth=1800)],
        spans=[
            Span(
                length=10,
                zones=[
                    Zone(end=0.4, section=0, end_section=1, profile="parabolic"),
                    Zone(end=1, section=1),
                ],
            ),
            Span(length=12),
        ],
        supports=["pin", "roller", "roller"],
    )
    cached = Basis(m)
    eis = [span_ei(m, i) for i in range(2)]
    ordinary = cba.BeamAnalysis([10, 12], eis, supports=m.supports)
    for loads in ([[1, 2, 100, 2.34, 0]], [[2, 3, 10, 1, 8]], [[1, 6, -1e-4]]):
        cached.solve_loads(loads)
        ordinary.set_loads(loads)
        ordinary.analyze(npts=480)
        for key in ("D", "R"):
            np.testing.assert_allclose(
                getattr(cached.ba.beam_results, key),
                getattr(ordinary.beam_results, key),
                atol=1e-10,
            )


def test_old_taper_projects_are_not_silently_reinterpreted():
    m = Model(nonprismatic=True, sections=[Section(), Section(depth=1800)])
    m.spans[0].zones = [Zone(end=1, section=0, end_section=1, profile="linear")]
    project = create_project(m, "Earlier model")
    project["schema_version"] = 1
    assert validate_project(json.dumps(project))["schema_version"] == 7
    project["model"]["sections"][1]["top_width"] = 600
    with pytest.raises(ValueError, match="project.legacy_taper"):
        validate_project(json.dumps(project))
    project["schema_version"] = 2
    assert (
        validate_project(json.dumps(project))["model"]["sections"][1]["top_width"]
        == 600
    )
