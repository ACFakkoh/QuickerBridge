"""v0.9.99: deck joint (hinge, saw cut, removed part), section inertia
choice, resistance effects (permanent / live / both), composite M− lateral
buckling, load stages in the calculation sheet, schema 16."""

import json

import numpy as np
import pytest

from quickerbridge.engine import analyse, influence, snapshot, stage_effects
from quickerbridge.modal import analyse_modal
from quickerbridge.models import CompositeSlab, Model, Resistance, Section
from quickerbridge.projects import SCHEMA_VERSION, create_project, validate_project
from quickerbridge.resistance import resistance, resistance_all
from quickerbridge.thermal import analyse_thermal

EI = 1e5


def beam(n=2, length=10.0, supports=None, **extra):
    data = dict(
        spans=[{"length": length}] * n,
        supports=supports or ["pin"] + ["pin"] * (n - 1) + ["roller"],
        sections=[{"kind": "ei", "EI": EI}],
        dead=[{"name": "w", "w": 10}],
        self_weight={"apply": False},
        load_mode="dead",
    )
    data.update(extra)
    return Model.model_validate(data)


def at(result, x, side, key="M", case="max"):
    xs = result["x"]
    i = next(
        k
        for k in range(len(xs))
        if abs(xs[k] - x) < 1e-9 and result["sides"][k] == side
    )
    return result[case][key][i]


# --- deck joint -------------------------------------------------------------------


def test_hinge_gives_the_gerber_beam():
    r = analyse(beam(joint={"enabled": True, "x": 13, "kind": "hinge"}))
    assert abs(at(r, 13, "left")) < 1e-8 and abs(at(r, 13, "right")) < 1e-8
    # Right part 13-20 m on the hinge and R3: 35 kN each; left part 0-13 m.
    assert [x["max"] for x in r["reactions"]] == pytest.approx([35, 130, 35])
    # The hinge carries the shear: V is continuous through it.
    assert at(r, 13, "left", "V") == pytest.approx(at(r, 13, "right", "V"))
    assert at(r, 13, "left", "V") == pytest.approx(35)  # sum of the left forces


def test_cut_separates_two_independent_beams():
    m = beam(3, supports=["pin", "pin", "pin", "roller"])
    m.joint.enabled, m.joint.x = True, 15.0
    r = analyse(Model.model_validate(m.model_dump()))
    for side in ("left", "right"):
        assert abs(at(r, 15, side, "V")) < 1e-6
        assert abs(at(r, 15, side)) < 1e-6
    # Each part: 15 m on supports 10 m apart with a 5 m overhang.
    assert [x["max"] for x in r["reactions"]] == pytest.approx(
        [37.5, 112.5, 112.5, 37.5], abs=2e-3
    )


def test_removed_part_and_cantilever_tip_deflection():
    r = analyse(beam(joint={"enabled": True, "x": 13, "kind": "cut", "keep": "left"}))
    assert [x["max"] for x in r["reactions"]] == pytest.approx([45.5, 84.5, 0])
    w, span, a = 10, 10, 3
    tip = w * a / (24 * EI) * (3 * a**3 + 4 * a**2 * span - span**3) * 1000
    assert at(r, 13, "left", "D") == pytest.approx(tip, rel=1e-6)
    beyond = [i for i, x in enumerate(r["x"]) if x > 13 + 1e-6]
    for key in ("V", "M", "D"):
        assert max(abs(r["max"][key][i]) for i in beyond) < 1e-8


def test_unstable_part_and_position_errors():
    with pytest.raises(ValueError, match="joint.unstable"):
        analyse(beam(joint={"enabled": True, "x": 13, "kind": "cut", "keep": "right"}))
    with pytest.raises(ValueError, match="joint.position"):
        beam(joint={"enabled": True, "x": 10.01})
    with pytest.raises(ValueError, match="joint.position"):
        beam(joint={"enabled": True, "x": 25})


def test_joint_off_keeps_previous_results():
    a = analyse(beam(load_mode="both"))
    b = analyse(beam(load_mode="both", joint={"enabled": False, "x": 13}))
    for key in ("V", "M", "D"):
        np.testing.assert_allclose(a["max"][key], b["max"][key])


def test_live_load_on_removed_part_has_no_effect():
    m = beam(load_mode="both", joint={"enabled": True, "x": 13, "keep": "left"})
    r = analyse(m)
    assert r["reactions"][2]["max"] == 0 and r["reactions"][2]["min"] == 0
    il = influence(m, int(np.argmin(np.abs(np.array(r["x"]) - 5))))
    q, mo = np.array(il["x"]), np.array(il["M"])
    assert np.abs(mo[q > 13 + 1e-4]).max() < 1e-9
    e = next(x for x in r["extrema"] if x["response"] == "M" and x["sense"] == "max")
    snap = snapshot(m, r["case_max"][e["index"]], e["index"], "max")
    assert abs(snap["equilibrium"]["force"]) < 1e-6
    assert abs(snap["equilibrium"]["moment"]) < 1e-5


def test_cut_influence_line_jumps_across_the_joint():
    m = beam(load_mode="live", joint={"enabled": True, "x": 15, "kind": "cut"})
    m = Model.model_validate(
        {
            **m.model_dump(),
            "spans": [{"length": 10}] * 3,
            "supports": ["pin"] * 3 + ["roller"],
        }
    )
    r = analyse(m)
    il = influence(m, 0, support=1)
    q, reac = np.array(il["x"]), np.array(il["R"])
    # A unit load right of the cut never reaches support 2 (x = 10).
    assert np.abs(reac[q > 15 + 1e-4]).max() < 1e-9
    assert reac[np.argmin(np.abs(q - 14.99))] > 1.4


def test_thermal_and_modal_with_a_joint():
    m = beam(load_mode="thermal", joint={"enabled": True, "x": 13, "kind": "hinge"})
    t = analyse_thermal(m)
    # Statically determinate Gerber beam: a curvature gives no moment.
    assert max(abs(v) for v in t["values"]["M"]) < 1e-8
    full = analyse_modal(beam())
    left = analyse_modal(beam(joint={"enabled": True, "x": 13, "keep": "left"}))
    both = analyse_modal(beam(joint={"enabled": True, "x": 15, "kind": "cut"}))
    assert left["modes"][0]["f"] != pytest.approx(full["modes"][0]["f"], rel=1e-3)
    # The cut node appears twice in the mode shapes (two deck ends).
    assert both["x"].count(15.0) == 2


# --- section inertia --------------------------------------------------------------


def test_inertia_choice_and_legacy_multiplier():
    assert Section().inertia_source == "steel"
    assert Section(inertia_modifier=1).inertia_source == "steel"
    legacy = Section(inertia_modifier=3.92)
    assert legacy.inertia_source == "manual" and legacy.inertia_modifier == 3.92
    s = Section(inertia_source="1n")  # no slab: the girder alone
    assert s.inertia_modifier == 1
    s = Section(composite=CompositeSlab(), inertia_source="steel", inertia_modifier=5)
    assert s.inertia_modifier == 1
    s = Section(composite=CompositeSlab(), inertia_source="negative")
    assert 1 < s.inertia_modifier < 2


# --- resistance -------------------------------------------------------------------


def steel_model():
    return Model(sections=[Section(composite=CompositeSlab())])


def test_effects_permanent_live_both():
    m = steel_model()
    r = analyse(m)
    out = {}
    for effects in ("dead", "live", "both"):
        out[effects] = resistance_all(m, r, Resistance(effects=effects))
    i = int(np.argmax(r["max"]["M"]))
    mr = out["both"]["rows"]["Mr_pos"][i]
    assert out["dead"]["rows"]["r_pos"][i] == pytest.approx(
        max(r["dead"]["M"][i], 0) / mr
    )
    assert out["live"]["rows"]["r_pos"][i] == pytest.approx(
        (r["max"]["M"][i] - r["dead"]["M"][i]) / mr
    )
    assert out["both"]["rows"]["r_pos"][i] == pytest.approx(r["max"]["M"][i] / mr)
    assert out["live"]["effects"] == "live"


def test_sheet_stages_add_up_and_properties():
    m = steel_model()
    r = analyse(m)
    i = len(r["x"]) // 3
    d = resistance_all(m, r, Resistance(), index=i)
    for key in ("M", "V"):
        st = d["stages"][key]
        dead = st["self_weight"] + st["dead_steel"] + st["dead_3n"]
        assert dead == pytest.approx(r["dead"][key][i], abs=1e-6)
        assert dead + st["live_max"] == pytest.approx(r["max"][key][i])
    assert d["props"]["steel"]["Ix"] > 0 and "composite" in d["props"]
    stages = stage_effects(m, r)
    assert len(stages["V"][0]) == len(r["x"])


def test_composite_negative_class_2_has_no_lateral_buckling():
    s = Section(composite=CompositeSlab())
    short = resistance(s, Resistance(unbraced_length=1000), "composite")["negative"]
    long = resistance(s, Resistance(unbraced_length=40000), "composite")["negative"]
    assert short["class"] <= 2 and short["method"] == "plastic"
    assert long["Mr"] == pytest.approx(short["Mr"])
    assert "ltb" not in long


def test_frd_only_for_the_girder_alone():
    s = Section(depth=1800, web_thickness=10, composite=CompositeSlab())
    comp = resistance(s, Resistance(), "composite", mf_pos=1000, mf_neg=1000)
    assert "Frd" not in comp["check"]["positive"]
    assert "Frd" not in comp["check"]["negative"]


# --- project schema ------------------------------------------------------------------


def test_schema_16_migration():
    old = json.loads(json.dumps(create_project(Model(), "v0.9.98")))
    old["schema_version"] = 15
    old["model"].pop("joint")
    old["model"]["resistance"].pop("effects")
    for s in old["model"]["sections"]:
        s["inertia_source"] = "manual"
        s["inertia_modifier"] = 1
    data = validate_project(json.dumps(old))
    assert data["schema_version"] == SCHEMA_VERSION == 16
    assert data["model"]["joint"]["enabled"] is False
    assert data["model"]["resistance"]["effects"] == "both"
    assert {s["inertia_source"] for s in data["model"]["sections"]} == {"steel"}


def test_analysis_uses_the_composite_inertia_once():
    """v0.9.99 fix: the cached basis kept the slab-derived M (it fell back to
    the girder alone). Pier moment of the composite example under permanent
    loads checked by the force method with the same EI(x) and loads."""
    from quickerbridge.engine import cached_basis, structure_key
    from quickerbridge.loads import dead_intervals
    from quickerbridge.presets import two_span_steel
    from quickerbridge.sections import span_ei

    m = Model.model_validate({**two_span_steel().model_dump(), "load_mode": "dead"})
    basis = cached_basis(structure_key(m))
    x = np.linspace(0, 34.8, 801)
    for k in range(2):
        np.testing.assert_allclose(basis.ei[k](x), span_ei(m, k)(x), rtol=1e-9)
    length, x = 34.8, np.linspace(0, 34.8, 40001)
    num = den = 0.0
    for k, f in ((0, x / length), (1, 1 - x / length)):
        w = np.zeros_like(x)
        for v in dead_intervals(m):
            if v["span"] == k:
                w += v["w"] * ((x >= v["a"]) & (x <= v["b"]))
        cw = np.r_[0, np.cumsum((w[1:] + w[:-1]) / 2 * np.diff(x))]
        cm = np.r_[0, np.cumsum((w[1:] * x[1:] + w[:-1] * x[:-1]) / 2 * np.diff(x))]
        m0 = (cw[-1] * length - cm[-1]) / length * x - (x * cw - cm)
        ei = np.asarray(span_ei(m, k)(x), float)
        num += np.trapezoid(m0 * f / ei, x)
        den += np.trapezoid(f * f / ei, x)
    assert min(analyse(m)["dead"]["M"]) == pytest.approx(-num / den, rel=0.01)
