"""v0.9.4: staged stresses over the depth at a station."""

import json

import numpy as np
import pytest

from quickerbridge.browser import _results, dispatch
from quickerbridge.models import CompositeSlab, Model, Section, Zone, default_model
from quickerbridge.section_props import (
    composite_properties,
    steel_properties,
    stress_profile,
)
from quickerbridge.sections import section_at


def test_steel_alone_bending_stress_by_hand():
    s = Section()
    p = steel_properties(s)
    r = stress_profile(s, {"steel": 1000.0})
    # σ = −M (y − ȳ) / I, sagging compresses the top (negative).
    assert r["total"]["S5"] == pytest.approx(1e9 * p["y_bottom"] / p["Ix"])
    assert r["total"]["S2"] == pytest.approx(-1e9 * p["y_top"] / p["Ix"])
    assert not r["composite"]


def test_composite_positive_and_cracked_negative():
    s = Section(composite=CompositeSlab())
    comp = composite_properties(s, s.composite)
    top = s.depth + s.composite.haunch + s.composite.slab_thickness
    pos = stress_profile(s, {"1n": 2000.0})
    one = comp["1n"]
    expected_concrete = -2e9 * (top - one["y_bottom"]) / one["I"] / comp["n"]
    assert pos["total"]["slab_top"] == pytest.approx(expected_concrete)
    assert pos["total"]["slab_top"] < 0 and pos["total"]["S5"] > 0
    # 3n: concrete stress divided by 3n.
    three = stress_profile(s, {"3n": 2000.0})
    assert three["stages"]["3n"]["ratio"] == pytest.approx(3 * comp["n"])
    # Negative moment: cracked composite, concrete carries nothing, bars in tension.
    neg = stress_profile(s, {"1n": -2000.0})
    assert neg["stages"]["1n"]["cracked"]
    assert neg["total"]["slab_top"] == 0 and neg["total"]["bar_top"] > 0
    assert neg["total"]["S5"] < 0


def test_stages_add_up():
    s = Section(composite=CompositeSlab())
    moments = {"steel": 500.0, "3n": 300.0, "1n": 800.0}
    total = stress_profile(s, moments)["total"]
    parts = [stress_profile(s, {k: v})["total"] for k, v in moments.items()]
    for name, value in total.items():
        assert value == pytest.approx(sum(p[name] for p in parts))
    # Steel-alone stage: the slab and bars do not act.
    alone = stress_profile(s, {"steel": 500.0})["total"]
    assert alone["slab_top"] == 0 and alone["bar_top"] == 0


def test_section_at_follows_zones_and_tapers():
    m = default_model()
    s1, s2 = m.sections
    assert section_at(m, 5.0).depth == s1.depth
    # Over the pier (end of span 1 = start of span 2) the deep section.
    pier = m.spans[0].length
    assert section_at(m, pier, "left").depth == pytest.approx(s2.depth)
    assert section_at(m, pier, "right").depth == pytest.approx(s2.depth)
    # Half-way along the parabolic haunch: between S1 and S2, tangent at S1.
    x = pier - 0.1 * m.spans[0].length
    mid = section_at(m, x).depth
    assert s1.depth < mid < (s1.depth + s2.depth) / 2
    plain = Model()
    assert section_at(plain, 40.0) == plain.sections[0]


def request(action, data):
    return json.loads(dispatch(json.dumps({"action": action, "data": data})))


def test_stress_request_reproduces_the_envelope_moments():
    m = default_model()
    m.sections[0].composite = CompositeSlab()
    request("analyse", {"model": m.model_dump(), "job": "stress-test"})
    result = _results["stress-test"]
    i = int(np.argmax(result["max"]["M"]))
    out = request("stress", {"job": "stress-test", "index": i})
    mo = out["moments"]
    total_max = mo["self_weight"] + mo["dead_steel"] + mo["dead_3n"] + mo["live_max"]
    assert total_max == pytest.approx(result["max"]["M"][i])
    case = out["cases"]["max"]
    assert case["stages"]["steel"]["M"] == pytest.approx(
        mo["self_weight"] + mo["dead_steel"]
    )
    assert case["stages"]["3n"]["M"] == pytest.approx(mo["dead_3n"])
    assert case["stages"]["1n"]["M"] == pytest.approx(mo["live_max"])
    assert case["composite"] and case["total"]["S5"] > 0
    with pytest.raises(ValueError):
        request("stress", {"job": "stress-test", "index": 10_000})


def test_stress_needs_a_known_girder_and_no_thermal():
    # v0.9.6: NEBT girders have stresses too; a direct-EI section does not.
    m = Model.model_validate({"sections": [{"kind": "ei"}]})
    request("analyse", {"model": m.model_dump(), "job": "stress-ei"})
    with pytest.raises(ValueError):
        request("stress", {"job": "stress-ei", "index": 10})
    t = Model(load_mode="thermal")
    request("analyse", {"model": t.model_dump(), "job": "stress-thermal"})
    with pytest.raises(ValueError):
        request("stress", {"job": "stress-thermal", "index": 10})


def test_stress_uses_the_current_slab_data():
    m = default_model()
    request("analyse", {"model": m.model_dump(), "job": "stress-slab"})
    i = int(np.argmax(_results["stress-slab"]["max"]["M"]))
    bare = request("stress", {"job": "stress-slab", "index": i})
    assert not bare["cases"]["max"]["composite"]
    slab = CompositeSlab().model_dump()
    with_slab = request(
        "stress",
        {"job": "stress-slab", "index": i, "composites": [slab, None]},
    )
    assert with_slab["cases"]["max"]["composite"]


def test_fibres_are_ordered_bottom_to_top():
    s = Section(composite=CompositeSlab(y3=120))
    ys = [f["y"] for f in stress_profile(s, {"1n": 100.0})["fibres"]]
    assert ys == sorted(ys)
