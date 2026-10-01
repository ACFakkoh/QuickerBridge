"""v0.9.5: negative-region I', y per configuration, constant support section."""

import json

import pytest

from quickerbridge.browser import dispatch
from quickerbridge.engine import analyse
from quickerbridge.models import CompositeSlab, Section, default_model
from quickerbridge.projects import create_project, validate_project
from quickerbridge.section_props import section_properties
from quickerbridge.sections import properties, span_ei, span_zones

# Reference sheet slab of test_v093bis (225 mm slab, 15M @ 150, y = 915 mm).
REFERENCE = CompositeSlab(
    slab_thickness=225,
    effective_width=3110,
    haunch=50,
    spacing_top=150,
    spacing_bottom=150,
    cover_top=35,
    cover_bottom=60,
    y3=915,
)


def test_negative_region_is_steel_plus_bars_only():
    out = section_properties(Section(composite=REFERENCE))
    steel, neg = out["steel"], out["composite"]["negative"]
    # Hand check: parallel axes with both bar layers (4147 mm² each) at 43 and
    # 157 mm below the top of the slab (top of slab at 1200 + 50 + 225).
    bars = [(4146.67, 1475 - 43), (4146.67, 1475 - 157)]
    area = steel["A"] + sum(a for a, _ in bars)
    ybar = (steel["A"] * steel["y_bottom"] + sum(a * y for a, y in bars)) / area
    inertia = (
        steel["Ix"]
        + steel["A"] * (steel["y_bottom"] - ybar) ** 2
        + sum(a * (y - ybar) ** 2 for a, y in bars)
    )
    assert neg["A"] == pytest.approx(area, rel=1e-5)
    assert neg["y_bottom"] == pytest.approx(ybar, rel=1e-5)
    assert neg["I"] == pytest.approx(inertia, rel=1e-5)
    assert neg["S"]["S5"] == pytest.approx(inertia / ybar, rel=1e-5)
    assert neg["S"]["S1"] == pytest.approx(inertia / (1432 - ybar), rel=1e-5)
    assert neg["ratio"] == pytest.approx(inertia / steel["Ix"], rel=1e-5)
    # No concrete: f'c, unit weight and FrQr do not change I'.
    other = REFERENCE.model_copy(update={"fc": 70, "unit_weight": 18, "frqr": 0.5})
    assert section_properties(Section(composite=other))["composite"]["negative"][
        "I"
    ] == pytest.approx(neg["I"])
    # Web compressed from the bottom flange under M−: dc = ȳ' − tb.
    assert neg["web_2dc"][0] == pytest.approx(2 * (ybar - 50) / 14, rel=1e-5)
    assert out["region"] == "positive"


def test_y_per_configuration():
    c = REFERENCE.model_copy(
        update={"y3": 500, "y_steel": 300, "y_3n": 600, "y_1n": 915, "y_neg": 200}
    )
    out = section_properties(Section(composite=c))
    comp = out["composite"]
    assert out["steel"]["S"]["S3"] == pytest.approx(out["steel"]["Ix"] / 300)
    assert comp["3n"]["S"]["S3"] == pytest.approx(comp["3n"]["I"] / 600)
    # Same value as the reference sheet with one y = 915 mm below the 1n ENA.
    assert comp["1n"]["S"]["S3"] == pytest.approx(51.8e6, rel=1.5e-3)
    assert comp["negative"]["S"]["S3"] == pytest.approx(comp["negative"]["I"] / 200)
    # Unset y falls back to y3.
    out = section_properties(Section(composite=REFERENCE))
    assert out["composite"]["3n"]["points"]["S3"] == pytest.approx(
        out["composite"]["3n"]["y_bottom"] - 915
    )


def test_steel_only_y_and_region_without_slab():
    s = Section(composite=CompositeSlab(enabled=False, y_steel=250, region="negative"))
    out = dispatch(
        json.dumps(
            {"action": "section_properties", "data": {"section": s.model_dump()}}
        )
    )
    out = json.loads(out) if isinstance(out, str) else out
    out = out.get("result", out)
    assert "composite" not in out and out["region"] == "negative"
    assert out["steel"]["S"]["S3"] == pytest.approx(out["steel"]["Ix"] / 250)


def test_constant_support_section_default_400_mm():
    m = default_model()
    assert m.support_length == 400
    left, right = span_zones(m, 0), span_zones(m, 1)
    L = m.spans[0].length
    # 200 mm each side of the pier at the deep support section S2.
    assert right[0].profile == "constant" and right[0].section == 1
    assert right[0].end * L == pytest.approx(0.2)
    assert left[-1].profile == "constant" and left[-1].section == 1
    assert (1 - left[-2].end) * L == pytest.approx(0.2)
    deep = properties(m.sections[1])["EI"]
    e1, e2 = span_ei(m, 0), span_ei(m, 1)
    for x in (0.0, 0.1, 0.19):
        assert e2(x) == pytest.approx(deep) and e1(L - x) == pytest.approx(deep)
    assert e2(0.5) < deep
    # The user's zones are unchanged; 0 restores haunches up to the support.
    assert len(m.spans[1].zones) == 2
    m0 = m.model_copy(update={"support_length": 0})
    assert span_zones(m0, 1) == list(m0.spans[1].zones)
    assert span_ei(m0, 1)(0.1) < deep


def test_support_section_changes_the_analysis_slightly():
    m = default_model()
    a = analyse(m)
    b = analyse(m.model_copy(update={"support_length": 0}))
    ma, mb = min(a["min"]["M"]), min(b["min"]["M"])
    assert ma != mb and abs(ma - mb) < 0.02 * abs(mb)


def test_older_projects_keep_haunches_up_to_the_support():
    m = default_model()
    project = create_project(m, "p")
    assert project["schema_version"] == 8
    assert validate_project(json.dumps(project))["model"]["support_length"] == 400
    project["schema_version"] = 7
    project["model"].pop("support_length")
    assert validate_project(json.dumps(project))["model"]["support_length"] == 0

def test_stress_s3_fibre_steel_alone_and_reference():
    from quickerbridge.section_props import stress_profile

    s = Section(composite=CompositeSlab(enabled=False, y_steel=250))
    out = stress_profile(s, {"steel": 1000.0, "3n": 0.0, "1n": 0.0})
    fibres = {f["name"]: f["y"] for f in out["fibres"]}
    ybar = out["stages"]["steel"]["ybar"]
    assert fibres["S3"] == pytest.approx(ybar - 250)
    assert out["s3_ref"] == "steel" and out["s3_y"] == 250
    # S3 stress = M y / I (tension below the axis under a sagging moment).
    assert out["total"]["S3"] == pytest.approx(
        1000e6 * 250 / out["stages"]["steel"]["I"]
    )
    s = Section(composite=REFERENCE.model_copy(update={"y_1n": 600}))
    out = stress_profile(s, {"steel": 0.0, "3n": 0.0, "1n": 1000.0})
    fibres = {f["name"]: f["y"] for f in out["fibres"]}
    assert out["s3_ref"] == "1n" and out["s3_y"] == 600
    assert fibres["S3"] == pytest.approx(out["stages"]["1n"]["ybar"] - 600)
