"""v0.9.98: resistance along the bridge (effects of the analysis), steel
girder alone (lateral-torsional buckling, class 4 web Frd), V-M interaction,
evaluation levels for the CL-625 only, road classes C/D merged, schema 15."""

import json
import math

import numpy as np
import pytest

from quickerbridge.browser import dispatch
from quickerbridge.engine import analyse, stage_moments
from quickerbridge.loads import lane_parameters, vehicle_data
from quickerbridge.models import LiveLoad, Model, Resistance, Section
from quickerbridge.projects import create_project, validate_project
from quickerbridge.resistance import (
    classes,
    frd,
    girder,
    resistance,
    resistance_all,
    station_check,
)
from quickerbridge.sections import section_at, section_source

from test_v0997 import example_section


def test_author_sheet_steel_girder_alone_positive_moment():
    """The author's sheet (Notion, 2026-10-06), Mr+ of the girder alone:
    L = 6000 mm, ω2 = 1, Iyc 89E+6, βx −852, B1 −2.1, B2 2.8, Mu 8149,
    My 5060, Mr (class 3) 4567, Frd 0.992, Mr' 4531, Mf 4500: 99.3 %."""
    out = resistance(example_section(), Resistance(), "steel", mf_pos=4500)
    assert out["kind"] == "steel"
    p = out["positive"]
    lt = p["ltb"]
    assert lt["L"] == 6000 and lt["omega2"] == 1
    assert lt["Iyc"] == pytest.approx(89.3e6, rel=1e-3)
    assert lt["beta_x"] == pytest.approx(-852, abs=1)
    assert lt["B1"] == pytest.approx(-2.1, abs=0.05)
    assert lt["B2"] == pytest.approx(2.8, abs=0.05)
    assert lt["Mu"] == pytest.approx(8149, rel=1e-3)
    assert p["My"] == pytest.approx(5060, abs=1)
    assert p["Mr"] == pytest.approx(4567, abs=1)  # class 3 rule, 10.10.3.3
    # Web 2dc/w = 113.4 > 1900/√Fy = 102.3: class 4, Frd for Mf (10.10.4.4).
    cls = out["classes"]
    assert cls["web"]["positive"]["ratio"] == pytest.approx(113.4, abs=0.05)
    assert cls["web"]["positive"]["class"] == 4 and cls["positive"] == 4
    check = out["check"]["positive"]
    assert check["Frd"] == pytest.approx(0.992, abs=5e-4)
    assert check["Mr"] == pytest.approx(4531, abs=1)
    assert check["ratio"] == pytest.approx(0.993, abs=5e-4)
    # Class 1-2 formula with Mp from the plastic modulus (PNA in the bottom
    # flange): Mr = 1.15 φs Mp (1 − 0.28 Mp/Mu) ≤ φs Mp.
    g = girder(example_section())
    mp = g["Zx"] * 345 / 1e6
    assert p["Mp"] == pytest.approx(mp)
    mu = lt["Mu"]
    expected = min(1.15 * 0.95 * mp * (1 - 0.28 * mp / mu), 0.95 * mp)
    neg = resistance(example_section(), Resistance(), "steel")["negative"]
    assert neg["class"] == 1  # bottom flange in compression, small dc
    assert neg["ltb"]["beta_x"] == pytest.approx(852, abs=1)  # sign flips
    assert neg["Mr"] == pytest.approx(
        min(1.15 * 0.95 * mp * (1 - 0.28 * mp / neg["ltb"]["Mu"]), 0.95 * mp)
    )
    assert expected > 0


def test_frd_bounds_and_short_unbraced_length():
    data = resistance(example_section(), Resistance(), "steel")["positive"]["frd"]
    assert frd(data, 0) == 1.0
    # A small Mf: 1900/√(Mf/φS) exceeds 2dc/w, no reduction.
    assert frd(data, 200) == 1.0
    assert frd(data, 6000) < frd(data, 4500) < 1
    # Short unbraced length: Mu large, Mr tends to φs My (class 3).
    short = resistance(example_section(), Resistance(unbraced_length=500), "steel")
    assert short["positive"]["Mr"] == pytest.approx(0.95 * 5060, rel=2e-3)


def test_class_is_worst_of_three_plates():
    s = example_section()
    s.bottom_width, s.bottom_thickness = 600, 30  # b/2t = 10: class 3 flange
    cls = classes(s, 345)
    assert cls["bottom_flange"]["class"] == 3 and cls["web"]["positive"]["class"] == 2
    # v0.9.98: the bottom flange also governs the M+ class of the composite.
    assert cls["positive"] == cls["negative"] == 3


def test_class_4_flange_effective_modulus():
    s = example_section()
    s.top_width, s.top_thickness = 500, 10  # b/2t = 25 > 200/√345
    out = resistance(s, Resistance(), "steel")
    assert out["classes"]["top_flange"]["class"] == 4
    p = out["positive"]
    t = 10
    assert p["effective_width"] == pytest.approx(
        2 * min(200 * t / math.sqrt(345), 30 * t)
    )
    gross = girder(s)
    assert p["My"] < min(gross["S_top"], gross["S_bot"]) * 345 / 1e6


def test_interaction_only_for_tension_field_webs():
    s = example_section()
    out = resistance(s, Resistance(), "composite", mf_pos=11000, vf=2400)
    inter = out["check"]["interaction"]
    assert out["shear"]["tension_field"]
    assert inter["value"] == pytest.approx(
        0.727 * 11000 / 17494 + 0.455 * 2400 / 2602, abs=1e-3
    )
    # Unstiffened web: no tension field, no 10.10.5.2 check.
    plain = resistance(s, Resistance(stiffened=False), "composite", mf_pos=1, vf=1)
    assert "interaction" not in plain["check"]
    # Stocky web (h/w ≤ 502 √(kv/Fy)): no tension field either.
    stocky = Section(web_thickness=25, composite=s.composite)
    assert not resistance(stocky, Resistance(), "composite")["shear"]["tension_field"]


def test_class_3_negative_equivalent_moment():
    s = example_section()
    s.bottom_width, s.bottom_thickness = 600, 30
    base = resistance(s, Resistance(), "composite")
    n = base["negative"]
    assert n["method"] == "elastic"
    # Fcr: lateral-torsional buckling of the bottom flange over L (a wide
    # flange braced every 6 m reaches Fy; a long unbraced length does not).
    assert n["Fcr"] == pytest.approx(345)
    longer = resistance(s, Resistance(unbraced_length=25000), "composite")
    assert longer["negative"]["Fcr"] < 345
    chk = station_check(base, 0, 3000, 1000, 0)["negative"]
    at = station_check(base, 0, chk["Mr"], 1000, 0)["negative"]
    assert max(c["ratio"] for c in at["checks"]) == pytest.approx(1.0)
    assert chk["ratio"] == pytest.approx(3000 / chk["Mr"])


def two_span(slab=True):
    m = Model()
    for s in m.sections:
        if slab:
            s.composite = example_section().composite
    return m


def test_resistance_along_the_bridge():
    m = Model.model_validate(two_span().model_dump())
    m.nonprismatic = True
    from quickerbridge.models import apply_default_haunches

    m.sections.append(Section(name="S2", depth=1560, composite=m.sections[0].composite))
    apply_default_haunches(m)
    m = Model.model_validate(m.model_dump())
    r = analyse(m)
    out = resistance_all(m, r, Resistance())
    rows = out["rows"]
    n = len(r["x"])
    assert all(len(v) == n for v in rows.values())
    assert set(rows["kind"]) == {"composite"}
    # Station by station: Mf+ from the envelope, Mr from the section there.
    i = int(np.argmax(r["max"]["M"]))
    sec = section_at(m, r["x"][i], r["sides"][i])
    one = resistance(sec, Resistance(), "composite", mf_pos=r["max"]["M"][i])
    assert rows["Mr_pos"][i] == pytest.approx(one["check"]["positive"]["Mr"])
    assert rows["r_pos"][i] == pytest.approx(r["max"]["M"][i] / rows["Mr_pos"][i])
    assert out["summary"]["r_pos"]["ratio"] == pytest.approx(
        max(v for v in rows["r_pos"] if v is not None)
    )
    # Over the pier the deeper (tapered) girder resists more.
    pier = int(np.argmin(np.abs(np.array(r["x"]) - 34.8)))
    assert rows["Mr_neg"][pier] > rows["Mr_neg"][i]
    # Steel alone for S2 only (index 1): stations with plates of S2.
    steel = resistance_all(m, r, Resistance(types=["composite", "steel"]))
    assert steel["rows"]["kind"][pier] == "steel"
    assert steel["rows"]["kind"][i] == "composite"
    # Detail at a station: same numbers, effects of the envelope.
    detail = resistance_all(m, r, Resistance(), index=i)
    assert detail["check"]["positive"]["Mr"] == pytest.approx(rows["Mr_pos"][i])
    assert detail["effects"]["M_max"] == r["max"]["M"][i]
    json.dumps(detail, allow_nan=False)
    json.dumps(out, allow_nan=False)


def test_girder_alone_moment_for_class_3_negative():
    m = two_span()
    m.dead[0].stage = "steel"
    r = analyse(m)
    m_sw, m_steel, _ = stage_moments(m, r)
    s = m.sections[0]
    s.bottom_width, s.bottom_thickness = 600, 30
    m = Model.model_validate(m.model_dump())
    pier = int(np.argmin(np.abs(np.array(r["x"]) - 34.8)))
    d = resistance_all(m, r, Resistance(), index=pier)
    expected = min(-(m_sw[pier] + m_steel[pier]), -r["min"]["M"][pier])
    assert d["check"]["negative"]["Mfd"] == pytest.approx(expected)
    assert d["effects"]["M_girder"] == pytest.approx(m_sw[pier] + m_steel[pier])


def test_section_source_index_and_non_girder_stations():
    m = Model.model_validate(two_span().model_dump())
    m.sections.append(Section(name="EI", kind="ei"))
    m.spans[1].section = 1
    m = Model.model_validate(m.model_dump())
    assert section_source(m, 10.0)[0] == 0 and section_source(m, 50.0)[0] == 1
    r = analyse(m)
    rows = resistance_all(m, r, Resistance())["rows"]
    after = [k for k, x in enumerate(r["x"]) if x > 35]
    assert all(rows["Mr_pos"][k] is None for k in after)
    assert rows["Mr_pos"][0] is not None


def test_dispatch_resistance_all_and_thermal():
    m = two_span()
    dispatch(
        json.dumps({"action": "analyse", "data": {"model": m.model_dump(), "job": "a"}})
    )
    value = json.loads(
        dispatch(
            json.dumps(
                {
                    "action": "resistance",
                    "data": {"job": "a", "settings": {"enabled": True}},
                }
            )
        )
    )
    assert value["summary"]["r_pos"]["ratio"] > 0
    m.load_mode = "thermal"
    m.sections[0].composite = example_section().composite
    dispatch(
        json.dumps({"action": "analyse", "data": {"model": m.model_dump(), "job": "t"}})
    )
    with pytest.raises(ValueError):
        dispatch(
            json.dumps({"action": "resistance", "data": {"job": "t", "settings": {}}})
        )


def test_type_of_defaults():
    s = example_section()
    r = Resistance()
    assert r.type_of(0, s) == "composite" and r.type_of(0, Section()) == "steel"
    assert Resistance(types=["steel"]).type_of(0, s) == "steel"
    # A composite choice without a slab is the girder alone.
    assert Resistance(types=["composite"]).type_of(0, Section()) == "steel"


# --- evaluation, road classes, schema 15 -----------------------------------------


def test_evaluation_cl625_only_and_road_class_cd():
    live = LiveLoad(vehicle="CL750QC", evaluation="2")
    assert live.evaluation == "design"
    assert len(vehicle_data(live)[0]) == 5  # the CL-750-QC itself
    for old in ("C", "D"):
        live = LiveLoad(vehicle="CL625", evaluation="1", road_class=old)
        assert live.road_class == "CD" and lane_parameters(live)[0] == 7.0


def test_schema_15_migration_of_v0997_resistance():
    m = Model()
    text = json.dumps(create_project(m, "v0.9.97"))
    old = json.loads(text)
    old["schema_version"] = 14
    old["model"]["resistance"] = {
        "mode": "composite",
        "section": 0,
        "stiffened": False,
        "stiffener_spacing": 2500,
        "fy_bar": 400,
        "phi_s": 0.95,
        "phi_r": 0.9,
        "phi_c": 0.75,
        "mf_pos": 1000,
        "mf_neg": 0,
        "mf_neg_steel": 0,
        "vf": 10,
    }
    old["model"]["live"].update(vehicle="CL750QC", evaluation="3", road_class="D")
    data = validate_project(json.dumps(old))
    assert data["schema_version"] == 16
    assert data["model"]["resistance"] == {
        "effects": "both",
        "enabled": False,
        "types": [],
        "stiffened": False,
        "stiffener_spacing": 2500,
        "unbraced_length": 6000,
    }
    assert data["model"]["live"]["evaluation"] == "design"
    assert data["model"]["live"]["road_class"] == "CD"
    with pytest.raises(Exception):
        Resistance.model_validate({"unknown": 1})


def test_resistance_settings_never_change_the_analysis():
    m = two_span()
    base = analyse(m)
    m.resistance = Resistance(enabled=True, types=["steel"], unbraced_length=3000)
    np.testing.assert_array_equal(analyse(m)["max"]["M"], base["max"]["M"])
