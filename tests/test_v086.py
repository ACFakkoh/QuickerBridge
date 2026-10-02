"""v0.8.6: NEBT sections, automatic girder self-weight, isostatic spans."""

import json
import math

import numpy as np
import pycba as cba
import pytest

from quickerbridge.engine import analyse, end_releases, influence, member_types
from quickerbridge.loads import dead_intervals
from quickerbridge.modal import analyse_modal
from quickerbridge.models import Model, Section, SelfWeight, Span, Zone
from quickerbridge.projects import create_project, validate_project
from quickerbridge.sections import NEBT, STEEL_UNIT_WEIGHT, properties


def dead_only(spans, supports, sections=None, w=0.0, **extra):
    data = {
        "spans": [{"length": L} for L in spans],
        "supports": supports,
        "dead": [{"w": w}] if w else [],
        "load_mode": "dead",
        **extra,
    }
    if sections:
        data["sections"] = sections
    return Model.model_validate(data)


def pier_index(r, x):
    return int(np.argmin(np.abs(np.array(r["x"]) - x)))


# --- NEBT ------------------------------------------------------------------


def test_nebt_properties_match_the_standard_table():
    s = Section(kind="nebt", nebt="NEBT1600")
    assert s.E == 28  # concrete default, not the steel 200 GPa
    p = properties(s)
    assert p["A"] == pytest.approx(0.589884)
    assert p["I"] == pytest.approx(0.20492)
    assert p["centroid"] == pytest.approx(761.2)
    assert p["w"] == pytest.approx(14.45)
    assert p["EI"] == pytest.approx(28e6 * 0.20492)
    # Table weights are the areas at 24.5 kN/m³.
    for data in NEBT.values():
        assert data["w"] == pytest.approx(data["A"] * 1e-6 * 24.5, abs=0.006)
    assert properties(Section(kind="nebt", E=35, inertia_modifier=2))[
        "EI"
    ] == pytest.approx(35e6 * 0.146547 * 2)


def test_nebt_zones_must_be_constant():
    with pytest.raises(ValueError):
        Model(
            nonprismatic=True,
            sections=[Section(kind="nebt"), Section(kind="nebt", nebt="NEBT1800")],
            spans=[
                Span(zones=[Zone(end=1, section=0, end_section=1, profile="linear")])
            ],
            supports=["pin", "roller"],
        )


# --- Self-weight -----------------------------------------------------------


def test_steel_self_weight_default_15_percent_on_simple_span():
    m = dead_only([20], ["pin", "roller"])
    w = properties(m.sections[0])["A"] * STEEL_UNIT_WEIGHT * 1.15
    r = analyse(m)
    assert sum(r["max"]["R"]) == pytest.approx(w * 20)
    assert max(r["max"]["M"]) == pytest.approx(w * 20**2 / 8, rel=1e-9)
    (interval,) = dead_intervals(m)
    assert interval["self_weight"] and interval["input_w"] == pytest.approx(w)


def test_nebt_self_weight_default_10_percent_factor_and_switch_off():
    sections = [{"kind": "nebt", "nebt": "NEBT1200"}]
    m = dead_only([25], ["pin", "roller"], sections)
    assert sum(analyse(m)["max"]["R"]) == pytest.approx(12.69 * 1.10 * 25)
    m.self_weight = SelfWeight(nebt_increase=0, factor=1.25)
    assert sum(analyse(m)["max"]["R"]) == pytest.approx(12.69 * 1.25 * 25)
    m.self_weight = SelfWeight(apply=False)
    assert sum(analyse(m)["max"]["R"]) == pytest.approx(0)
    assert dead_intervals(m) == []


def test_direct_ei_section_has_no_self_weight_and_user_loads_add():
    m = dead_only([10], ["pin", "roller"], [{"kind": "ei", "EI": 1e6}], w=5)
    assert sum(analyse(m)["max"]["R"]) == pytest.approx(50)


def test_tapered_steel_self_weight_follows_the_web_height():
    shallow, deep = Section(), Section(depth=2400)
    m = Model(
        spans=[Span(length=30)],
        supports=["pin", "roller"],
        sections=[shallow, deep],
        nonprismatic=True,
        dead=[],
        load_mode="dead",
    )
    m.spans[0].zones = [Zone(end=1, section=0, end_section=1, profile="linear")]
    # Linear depth -> linear web area: the weight is the mean of both ends.
    mean = (properties(shallow)["w"] + properties(deep)["w"]) / 2 * 1.15
    r = analyse(m)
    assert sum(r["max"]["R"]) == pytest.approx(mean * 30, rel=1e-9)
    # Heavier deep end carries the larger reaction.
    assert r["max"]["R"][1] > r["max"]["R"][0]


def test_self_weight_is_modal_mass_without_its_load_factor():
    base = dead_only([30], ["pin", "roller"])
    factored = base.model_copy(deep=True)
    factored.self_weight.factor = 3
    f = analyse_modal(base)["modes"][0]["f"]
    assert analyse_modal(factored)["modes"][0]["f"] == pytest.approx(f)
    ei = properties(base.sections[0])["EI"]
    m = properties(base.sections[0])["w"] * 1.15 / 9.81
    assert f == pytest.approx(math.pi / (2 * 30**2) * math.sqrt(ei / m), rel=1e-5)


def test_old_projects_keep_results_and_new_projects_apply_self_weight():
    project = create_project(dead_only([20], ["pin", "roller"], w=10), "Old")
    project["schema_version"] = 4
    del project["model"]["self_weight"]
    for span in project["model"]["spans"]:
        del span["simple"]
    reopened = validate_project(json.dumps(project))
    assert reopened["schema_version"] == 10
    assert reopened["model"]["self_weight"]["apply"] is False
    fresh = validate_project(json.dumps(create_project(Model(), "New")))
    assert fresh["model"]["self_weight"]["apply"] is True


# --- Isostatic spans -------------------------------------------------------


@pytest.mark.parametrize("nonprismatic", [False, True])
def test_pycba_pinned_pinned_member_shears_under_a_point_load(nonprismatic):
    # Local PyCBA fix: an off-centre point load on a PP member gave
    # V_ff + (Ma + Mb)/L instead of the simply-supported shears.
    ei = 1e6
    if nonprismatic:
        ei = cba.SectionEI()
        ei.add_segment("pwl", [0, 30], [1e6, 3e6])
    ba = cba.BeamAnalysis(
        [20, 30, 20], [1e6, ei, 1e6], supports=["pin"] * 4, eletype=[1, 4, 1]
    )
    ba.set_loads([[2, 2, 1.0, 5.0, 0], [2, 3, 2.0, 3.0, 10.0]])
    ba.analyze()
    np.testing.assert_allclose(
        ba.beam_results.R,
        [0, 25 / 30 + 2 * 10 * 22 / 30, 5 / 30 + 2 * 10 * 8 / 30, 0],
        atol=1e-9,
    )


def test_release_layout_keeps_every_node_stable():
    m = Model(spans=[Span(simple=True)] * 3, supports=["pin"] * 4)
    assert end_releases(m) == [(False, True), (False, True), (False, False)]
    assert member_types(m) == [2, 2, 1]
    fixed = Model(spans=[Span(simple=True)] * 2, supports=["fixed"] * 3)
    assert member_types(fixed) == [4, 4]


@pytest.mark.parametrize("supports", [["pin", "roller", "roller"], ["fixed"] * 3])
def test_two_simple_spans_behave_as_two_independent_beams(supports):
    m = dead_only([20, 30], supports, w=10, self_weight={"apply": False})
    for span in m.spans:
        span.simple = True
    r = analyse(m)
    np.testing.assert_allclose(r["max"]["R"], [100, 250, 150], atol=1e-6)
    np.testing.assert_allclose(r["max"]["Mr"], 0, atol=1e-6)
    assert r["max"]["M"][pier_index(r, 20)] == pytest.approx(0, abs=1e-6)
    left = [m_ for x, m_ in zip(r["x"], r["max"]["M"]) if x <= 20]
    assert max(left) == pytest.approx(10 * 20**2 / 8, rel=1e-6)
    assert max(r["max"]["M"]) == pytest.approx(10 * 30**2 / 8, rel=1e-6)
    # Mid-span deflection of a simple span: 5wL⁴/384EI.
    ei = properties(m.sections[0])["EI"]
    mid = pier_index(r, 35)
    assert r["max"]["D"][mid] == pytest.approx(
        5 * 10 * 30**4 / (384 * ei) * 1000, rel=2e-3
    )


def test_simple_span_next_to_a_continuous_fixed_span():
    # Span 1 simple; span 2 is pinned at the pier and fixed at the far end:
    # a propped cantilever with M = -wL²/8 at the fixed end.
    m = dead_only(
        [15, 20], ["pin", "roller", "fixed"], w=12, self_weight={"apply": False}
    )
    m.spans[0].simple = True
    r = analyse(m)
    assert r["max"]["M"][pier_index(r, 15)] == pytest.approx(0, abs=1e-6)
    # Hogging wall moment: clockwise on the right end, hence negative (CCW +).
    assert r["max"]["Mr"][2] == pytest.approx(-12 * 20**2 / 8, rel=1e-6)
    assert r["max"]["R"][0] == pytest.approx(12 * 15 / 2, rel=1e-9)


def test_simple_middle_span_isolates_all_three_spans_under_live_load():
    m = Model(
        spans=[Span(length=20), Span(length=30, simple=True), Span(length=20)],
        supports=["pin", "roller", "roller", "roller"],
        load_mode="live",
    )
    r = analyse(m)
    for x in (20, 50):
        i = pier_index(r, x)
        assert r["min"]["M"][i] == pytest.approx(0, abs=1e-6)
        assert r["max"]["M"][i] == pytest.approx(0, abs=1e-6)
    il = influence(m, pier_index(r, 10))
    # A load on another span has no effect on span 1.
    x, eta = np.array(il["x"]), np.array(il["M"])
    assert np.abs(eta[x > 20 + 1e-6]).max() < 1e-9


def test_thermal_gradient_produces_no_moment_in_simple_spans():
    m = Model(
        spans=[Span(length=12, simple=True), Span(length=12, simple=True)],
        supports=["fixed", "pin", "fixed"],
        load_mode="thermal",
    )
    r = analyse(m)
    np.testing.assert_allclose(r["values"]["M"], 0, atol=1e-6)
    np.testing.assert_allclose(r["values"]["R"], 0, atol=1e-6)


@pytest.mark.parametrize("supports", [["pin", "roller", "roller"], ["fixed"] * 3])
def test_modal_simple_spans_vibrate_as_simple_beams(supports):
    m = Model.model_validate(
        {
            "spans": [{"length": 25, "simple": True}, {"length": 25, "simple": True}],
            "supports": supports,
            "sections": [{"kind": "ei", "EI": 2.4e6}],
            "dead": [{"w": 24}],
        }
    )
    modes = analyse_modal(m)["modes"]
    f = math.pi / (2 * 25**2) * math.sqrt(2.4e6 / (24 / 9.81))
    assert modes[0]["f"] == pytest.approx(f, rel=1e-5)
    assert modes[1]["f"] == pytest.approx(f, rel=1e-5)  # two identical beams


def test_project_round_trip_keeps_simple_spans():
    m = Model(spans=[Span(simple=True), Span()])
    reopened = validate_project(json.dumps(create_project(m, "Iso")))
    assert reopened["model"]["spans"][0]["simple"] is True
    assert reopened["model"]["spans"][1]["simple"] is False
