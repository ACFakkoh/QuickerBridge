"""v0.9.97: S6-25 pedestrian expression, Section 14 evaluation levels,
project schema 14, and the steel-girder resistance module (S6-25 Section 10)."""

import json
import math

import numpy as np
import pytest

from quickerbridge.browser import dispatch
from quickerbridge.engine import analyse, mtq_active, pedestrian_intensity
from quickerbridge.loads import axle_groups, lane_parameters, vehicle_data
from quickerbridge.models import CompositeSlab, LiveLoad, Model, Resistance, Section
from quickerbridge.projects import SCHEMA_VERSION, create_project, validate_project
from quickerbridge.resistance import plates, resistance


def example_section(**slab):
    """The author's validation sheet (Notion, 2026-10-05): 350×25 / 1125×14 /
    600×50 girder, 225 mm slab on a 50 mm haunch, be = 3110 mm, 2 × 4200 mm²
    of bars at 48 and 177 mm below the top of the slab."""
    spacing = 200 * 3110 / 4200  # 15M bars: 4200 mm² per layer over be
    data = dict(
        slab_thickness=225,
        haunch=50,
        effective_width=3110,
        fc=35,
        bar_top="15M",
        bar_bottom="15M",
        spacing_top=spacing,
        spacing_bottom=spacing,
        cover_top=40,
        cover_bottom=40,
        fy=345,
    )
    data.update(slab)
    return Section(composite=CompositeSlab(**data))


def test_validation_sheet_positive_moment_and_shear():
    out = resistance(
        example_section(),
        Resistance(stiffener_spacing=3000),
        "composite",
        mf_pos=11000,
        vf=2400,
    )
    c = out["classes"]
    assert (c["top_flange"]["class"], c["bottom_flange"]["class"]) == (1, 1)
    assert c["web"]["positive"]["class"] == 2 and c["positive"] == 2
    assert c["top_flange"]["ratio"] == pytest.approx(7.0)
    v = out["shear"]
    assert v["a_h"] == pytest.approx(2.6667, abs=1e-4)
    assert v["kv"] == pytest.approx(5.90, abs=5e-3)
    assert v["h_w"] == pytest.approx(80.4, abs=0.05)
    assert v["case"] == "b"  # inelastic buckling
    assert v["Fcr"] == pytest.approx(162.9, abs=0.05)
    assert v["Ft"] == pytest.approx(11.05, abs=0.005)
    assert v["Fs"] == pytest.approx(173.9, abs=0.05)
    assert v["Vr"] == pytest.approx(2602, abs=0.5)
    assert out["check"]["shear"]["ratio"] == pytest.approx(0.922, abs=5e-4)
    assert v["tension_field"]
    p = out["positive"]
    assert p["Cc_full"] == pytest.approx(14649, abs=0.5)
    assert p["Cr"] == pytest.approx(3024, abs=0.5)
    assert p["C1"] == pytest.approx(17673, abs=0.5)
    assert p["C2"] == pytest.approx(17862, abs=0.5)
    assert p["pna"] == "steel" and p["rule"] == "10.11.5.2.4"
    assert p["a"] == 225
    assert p["dc_flange"] == pytest.approx(0.8, abs=0.05) and p["dc_web"] == 0
    assert p["Cs"] == pytest.approx(95, abs=0.5)
    assert p["Ts"] == pytest.approx(17768, abs=0.5)
    assert p["y_st"] == pytest.approx(823, abs=0.5)
    assert p["y_sc"] == pytest.approx(0, abs=0.5)
    e = p["e"]
    assert e["Cc"] == pytest.approx(985, abs=0.5)
    assert e["Cr_top"] == pytest.approx(1050, abs=0.5)
    assert e["Cr_bottom"] == pytest.approx(921, abs=0.5)
    assert e["Cs"] == pytest.approx(823, abs=0.5)
    assert p["Mr"] == pytest.approx(17494, abs=1)
    assert out["check"]["positive"]["ratio"] == pytest.approx(0.629, abs=5e-4)


def test_shear_regimes_and_unstiffened_web():
    s = example_section()
    out = resistance(s, Resistance(stiffened=False))["shear"]
    assert out["kv"] == 5.34 and out["Ft"] == 0 and out["a_h"] is None
    # a/h < 1: kv = 4 + 5.34/(a/h)².
    out = resistance(s, Resistance(stiffener_spacing=900))["shear"]
    assert out["kv"] == pytest.approx(4 + 5.34 / 0.8**2)
    # Stocky web: yielding, Fs = 0.577 Fy.
    stocky = Section(web_thickness=25, composite=s.composite)
    out = resistance(stocky, Resistance())["shear"]
    assert out["case"] == "a" and out["Fs"] == pytest.approx(0.577 * 345)
    # Slender web: elastic buckling, Fcr = 180000 kv / (h/w)².
    slender = Section(web_thickness=9, composite=s.composite)
    out = resistance(slender, Resistance())["shear"]
    assert out["case"] == "c"
    assert out["Fcr"] == pytest.approx(180000 * out["kv"] / out["h_w"] ** 2)


def _forces_balance(p):
    return p["Cc"] + p["Cr"] + p["Cs"] == pytest.approx(p["Ts"], rel=1e-9)


def test_plastic_neutral_axis_in_slab():
    # Small girder under a wide slab: C1 > C2, a < tc, Cc + Cr = C2.
    s = Section(
        depth=800,
        top_width=300,
        top_thickness=20,
        web_thickness=12,
        bottom_width=300,
        bottom_thickness=20,
        composite=example_section(effective_width=3000).composite,
    )
    s.composite.spacing_top = s.composite.spacing_bottom = 300
    p = resistance(s, Resistance())["positive"]
    assert p["pna"] == "slab" and p["rule"] == "10.11.5.2.3"
    assert 0 < p["a"] < 225
    assert p["Cc"] + p["Cr"] == pytest.approx(p["C2"], rel=1e-9)
    # Hand check of Mr = Cc ec + Cr er about the steel centroid.
    area = 300 * 20 * 2 + 760 * 12
    ybar = 400  # symmetric girder, from its top
    zt = 225 + 50 + ybar
    mr = p["Cc"] * (zt - p["a"] / 2) + sum(b["C"] * (zt - b["z"]) for b in p["bars"])
    assert p["Mr"] == pytest.approx(mr / 1000, rel=1e-9)
    assert p["C2"] == pytest.approx(0.95 * area * 345 / 1000)


def test_class_3_positive_slender_web_rule():
    # Deep class-3 web (h/w ≈ 98) under a narrow slab: the plastic compressed
    # web depth exceeds 850 w/√Fy, Figure 10.8 applies.
    s = Section(
        depth=1560,
        top_width=400,
        top_thickness=30,
        web_thickness=15,
        bottom_width=700,
        bottom_thickness=60,
        composite=example_section(effective_width=900, slab_thickness=180).composite,
    )
    s.composite.spacing_top = s.composite.spacing_bottom = 300
    out = resistance(s, Resistance(), mf_pos=5000)
    assert out["classes"]["web"]["positive"]["class"] == 3
    p = out["positive"]
    limit = 850 * 15 / math.sqrt(345)
    assert p["dc_web"] > limit
    assert p["rule"] == "10.11.6.2.2"
    assert p["Asc"] == pytest.approx(400 * 30 + 850 * 15**2 / math.sqrt(345))
    assert p["Cs"] == pytest.approx(0.95 * p["Asc"] * 345 / 1000)
    assert p["Ast"] * 0.95 * 345 / 1000 == pytest.approx(p["Ts"], rel=1e-9)
    assert _forces_balance(p)
    # Hand check: moments of each force about the tension resultant.
    mr = sum(f * p["e"][k] for k, f in (("Cc", p["Cc"]), ("Cs", p["Cs"])))
    mr += sum(b["C"] * p["e"]["Cr_" + b["layer"]] for b in p["bars"])
    assert p["Mr"] == pytest.approx(mr / 1000, rel=1e-9)


def test_negative_moment_class_1_2_plastic():
    out = resistance(example_section(), Resistance(), mf_neg=8000)
    n = out["negative"]
    assert n["method"] == "plastic" and n["rule"] == "10.11.5.3.1"
    assert n["Tr"] == pytest.approx(3024, abs=0.5)
    ps = 0.95 * 54500 * 345 / 1000
    assert n["Ts"] == pytest.approx((ps - n["Tr"]) / 2, rel=1e-9)
    assert n["Cs"] == pytest.approx(n["Ts"] + n["Tr"], rel=1e-9)
    # Tension area from the top: top flange then web.
    at = n["Ts"] * 1000 / (0.95 * 345)
    assert n["dt_web"] == pytest.approx((at - 350 * 25) / 14, rel=1e-9)
    mr = n["Tr"] / 2 * (n["e"]["Tr_top"] + n["e"]["Tr_bottom"]) + n["Ts"] * n["e"]["Ts"]
    assert n["Mr"] == pytest.approx(mr / 1000, rel=1e-9)
    assert out["check"]["negative"]["ratio"] == pytest.approx(8000 / n["Mr"])


def test_negative_moment_class_3_elastic_checks():
    # Class 3 bottom flange (b/2t = 10.0): linear stresses of 10.11.6.3.1.
    s = example_section()
    s.bottom_width, s.bottom_thickness = 600, 30
    out = resistance(s, Resistance(), mf_neg=4000, mfd=1500)
    assert out["classes"]["bottom_flange"]["class"] == 3
    n = out["negative"]
    k = out["check"]["negative"]
    assert n["method"] == "elastic" and k["Mfd"] == 1500 and k["Mfc"] == 2500
    # Steel-alone bottom modulus by hand.
    parts = [(b * t, z + t / 2, b * t**3 / 12) for _, b, t, z in plates(s)]
    area = sum(a for a, _, _ in parts)
    zbar = sum(a * z for a, z, _ in parts) / area
    inertia = sum(i + a * (z - zbar) ** 2 for a, z, i in parts)
    sb = inertia / (s.depth - zbar)
    assert n["S"]["S_bot"] == pytest.approx(sb, rel=1e-9)
    a = next(c for c in k["checks"] if c["id"] == "a")
    assert a["stress"] == pytest.approx(
        1500e6 / sb + 2500e6 / n["S"]["S_bot_c"], rel=1e-9
    )
    # v0.9.98: Fcr of the bottom flange from lateral-torsional buckling.
    assert a["limit"] == pytest.approx(0.95 * n["Fcr"]) and n["Fcr"] <= 345
    c = next(c for c in k["checks"] if c["id"] == "c")
    assert c["limit"] == pytest.approx(0.9 * 400)
    # At Mr (equivalent), the governing stress reaches its limit.
    at = resistance(s, Resistance(), mf_neg=k["Mr"], mfd=1500)["check"]["negative"]
    assert max(ck["ratio"] for ck in at["checks"]) == pytest.approx(1.0)
    # The composite section is stiffer: S' > S at the bottom fibre.
    assert n["S"]["S_bot_c"] > n["S"]["S_bot"]


def test_class_4_and_modes():
    s = example_section()
    s.web_thickness = 9  # h/w = 125: class 4 web
    out = resistance(s, Resistance())
    assert out["classes"]["web"]["positive"]["class"] == 4
    # v0.9.98: class 4 = class 3 rules, flagged in the page.
    assert out["negative"]["method"] == "elastic" and out["negative"]["class4"]
    assert out["positive"]["Mr"] > 0 and out["positive"]["class4"]
    steel = resistance(example_section(), Resistance(), "steel")
    assert steel["kind"] == "steel" and steel["positive"]["method"] == "steel"
    no_slab = resistance(Section(), Resistance(), "composite")
    assert no_slab["kind"] == "steel"
    with pytest.raises(ValueError):
        resistance(Section(kind="ei"), Resistance())


def test_resistance_dispatch_and_display_only():
    m = Model()
    m.spans = m.spans[:1]
    m.supports = ["pin", "roller"]
    m.sections[0].composite = example_section().composite
    job = {"action": "analyse", "data": {"model": m.model_dump(), "job": 7}}
    base = json.loads(dispatch(json.dumps(job)))
    raw = {
        "action": "resistance",
        "data": {"job": 7, "settings": Resistance().model_dump(), "index": 5},
    }
    value = json.loads(dispatch(json.dumps(raw)))
    assert value["positive"]["Mr"] == pytest.approx(17494, abs=1)
    # Resistance settings never change the analysis.
    m.resistance.enabled = True
    m.resistance.stiffener_spacing = 1500
    np.testing.assert_array_equal(analyse(m)["max"]["M"], base["max"]["M"])


# --- S6-25 Section 14 evaluation levels ----------------------------------------


@pytest.mark.parametrize("vehicle,w", [("CL625", 625)])
def test_evaluation_vehicles(vehicle, w):
    expected = [0.08 * w, 0.2 * w, 0.2 * w, 0.28 * w, 0.24 * w]
    for level, n, gross in (("1", 5, 1.0), ("2", 4, 0.76), ("3", 3, 0.48)):
        live = LiveLoad(vehicle=vehicle, evaluation=level, road_class="CD")
        weights, offsets = vehicle_data(live)
        np.testing.assert_allclose(weights, expected[:n])
        assert weights.sum() == pytest.approx(gross * w)
        np.testing.assert_allclose(offsets, [0, 3.6, 4.8, 11.4, 18.0][:n])
        assert lane_parameters(live) == (7.0, 0.8, "full")
        assert len(axle_groups(live)) == 2**n - 1
    # CL3-W: the full truck is axles 1-2-3, dynamic allowance 0.30.
    groups = axle_groups(LiveLoad(vehicle=vehicle, evaluation="3"))
    assert next(g for g in groups if g["axles"] == [1, 2, 3])["factor"] == 1.3
    for cls, q in (("A", 9.0), ("B", 8.0), ("D", 7.0), ("CD", 7.0)):
        live = LiveLoad(vehicle=vehicle, evaluation="2", road_class=cls)
        assert lane_parameters(live)[0] == q


def test_evaluation_turns_off_mtq_and_is_ignored_elsewhere():
    m = Model()
    m.live.vehicle = "CL750QC"
    assert mtq_active(m)
    m.live.evaluation = "1"
    m = Model.model_validate(m.model_dump())
    # v0.9.98: no evaluation level for the CL-750-QC: design loads, MTQ on.
    assert m.live.evaluation == "design" and mtq_active(m)
    hl = LiveLoad(vehicle="HL93Truck", evaluation="2")
    assert len(vehicle_data(hl)[0]) == 3  # evaluation only for CL-625 / CL-750-QC


def test_evaluation_level_1_cl625_truck_equals_design():
    def run(level, case="truck"):
        m = Model()
        m.spans = m.spans[:1]
        m.supports = ["pin", "roller"]
        m.live.vehicle = "CL625"
        m.live.case = case
        m.live.evaluation = level
        return analyse(m)

    np.testing.assert_allclose(run("1")["max"]["M"], run("design")["max"]["M"])
    # Lane case, road class A: q = 9 kN/m like the design lane load.
    np.testing.assert_allclose(
        run("1", "lane")["max"]["M"], run("design", "lane")["max"]["M"]
    )
    # Fewer axles, less moment.
    assert (
        max(run("3")["max"]["M"])
        < max(run("2")["max"]["M"])
        < max(run("1")["max"]["M"])
    )


# --- S6-25 pedestrian load and project schema 14 --------------------------------


def test_pedestrian_s6_25_expression():
    ped = Model().pedestrian
    assert pedestrian_intensity(ped, 20) == pytest.approx(4.25)
    assert pedestrian_intensity(ped, 5) == pytest.approx(4.25)  # capped
    assert pedestrian_intensity(ped, 80) == pytest.approx(4.25 * (0.5 + 0.25))
    assert pedestrian_intensity(ped, 1e6) == pytest.approx(
        4.25 * (0.5 + math.sqrt(5e-6))
    )


def test_schema_14_migration():
    m = Model()
    text = json.dumps(create_project(m, "v0.9.96"))
    old = json.loads(text)
    old["schema_version"] = 13
    old["model"]["pedestrian"].update(a=5, b=30, p_min=1.6, p_max=4)
    old["model"]["live"]["lane_extent"] = "full"
    for key in ("evaluation", "road_class"):
        del old["model"]["live"][key]
    del old["model"]["resistance"]
    data = validate_project(json.dumps(old))
    assert data["schema_version"] == SCHEMA_VERSION
    assert set(data["model"]["pedestrian"]) == {"width_source", "width", "maintenance"}
    assert data["model"]["live"]["lane_extent"] == "spans"
    assert data["model"]["live"]["evaluation"] == "design"
    assert data["model"]["resistance"]["stiffener_spacing"] == 3000
