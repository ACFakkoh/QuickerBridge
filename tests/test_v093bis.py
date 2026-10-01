"""v0.9.3bis: steel and composite section properties (reference sheet)."""

import json

import pytest

from quickerbridge.browser import dispatch
from quickerbridge.engine import analyse, structure_key
from quickerbridge.models import CompositeSlab, Model, Section
from quickerbridge.section_props import (
    composite_properties,
    concrete_modulus,
    steel_properties,
)

# Validated reference (author, 2026-10-01): 1200 mm girder, 350 × 25 top
# flange, 14 mm web, 600 × 50 bottom flange; 225 mm slab on a 50 mm haunch,
# be = 3110 mm, 15M @ 150 top and bottom (4147 mm²), bar centroids 43 and
# 157 mm below the top of the slab (covers 35 / 60), f'c = 35 MPa, 24 kN/m³.
REFERENCE = CompositeSlab(
    slab_thickness=225,
    effective_width=3110,
    haunch=50,
    spacing_top=150,
    spacing_bottom=150,
    cover_top=35,
    cover_bottom=60,
    y3=915,  # S3 (stiffener end) 915 mm below the 1n elastic neutral axis
)


@pytest.fixture(scope="module")
def ref():
    return composite_properties(Section(), REFERENCE)


def close(value, expected, digits):
    """Equal to the sheet's displayed number of significant digits."""
    assert float(f"{value:.{digits}g}") == pytest.approx(expected)


def test_steel_alone(ref):
    s = ref["steel"]
    assert s["A"] == 54_500
    assert round(s["y_top"]) == 819 and round(s["y_bottom"]) == 381
    close(s["Ix"], 12.0e9, 3)
    close(s["S_top"], 14.7e6, 3)
    close(s["S_bot"], 31.5e6, 3)
    close(s["Iy"], 989.6e6, 4)
    close(s["J"], 27.85e6, 4)
    close(s["Cw"], 109.81e12, 5)
    assert s["h_prime"] == pytest.approx(1162.5)


def test_plastic_modulus_with_pna_in_the_bottom_flange(ref):
    # The reference sheet's "PNA in the web" formula gives 19.0e6 with an
    # impossible yp.bot = −146 mm: here the PNA is in the bottom flange.
    s = ref["steel"]
    assert s["PNA_from_bottom"] == pytest.approx(45.42, abs=0.01)
    assert s["PNA_from_bottom"] < 50
    by_hand = 8750 * (1187.5 - 45.4167) + 15750 * (612.5 - 45.4167)
    by_hand += 600 * (50 - 45.4167) ** 2 / 2 + 600 * 45.4167**2 / 2
    assert s["Zx"] == pytest.approx(by_hand, rel=1e-6)


def test_section_classes(ref):
    c = ref["steel"]["classes"]
    assert c["top_flange"] == (pytest.approx(7.0), 1)
    assert c["bottom_flange"] == (pytest.approx(6.0), 1)
    assert round(c["web"][0], 1) == 80.4 and c["web"][1] == 2
    assert round(c["web_2dc"][0]) == 113 and c["web_2dc"][1] is True


def test_materials_and_bars(ref):
    assert concrete_modulus(35, 24000 / 9.81) == pytest.approx(28_987, abs=1)
    assert round(ref["n"], 2) == 6.90
    assert round(ref["Gc"]) == 12_283 and round(ref["Gs"]) == 76_923
    assert round(ref["concrete_area"]) == 691_457
    assert [round(b["area"]) for b in ref["bars"]] == [4147, 4147]
    assert [round(b["from_top"]) for b in ref["bars"]] == [43, 157]


def test_composite_1n(ref):
    c = ref["1n"]
    assert round(c["A"]) == 163_010
    assert round(c["y_top_slab"]) == 440 and round(c["y_bottom"]) == 1035
    close(c["I"], 47.4e9, 3)
    # 0.08 % from the sheet: rounding of I or of the bar position there.
    assert c["S"]["S1"] == pytest.approx(119.6e6, rel=1.5e-3)
    close(c["S"]["S2"], 287.8e6, 4)
    # 47.44e9 / 915 = 51.85e6: the sheet shows 51.8 (half-unit rounding).
    assert c["S"]["S3"] == pytest.approx(51.8e6, rel=1.5e-3)
    close(c["S"]["S4"], 48.2e6, 3)
    close(c["S"]["S5"], 45.8e6, 3)
    close(c["J"], 970.6e6, 4)


def test_composite_3n(ref):
    c = ref["3n"]
    assert round(c["A"]) == 96_199
    assert round(c["y_top_slab"]) == 667 and round(c["y_bottom"]) == 808
    close(c["I"], 35.0e9, 3)
    close(c["S"]["S1"], 56.1e6, 3)
    close(c["S"]["S2"], 89.3e6, 3)
    close(c["S"]["S5"], 43.4e6, 3)


def test_effective_properties(ref):
    close(ref["1ne"]["I"], 42.1e9, 3)
    close(ref["1ne"]["S_top"], 246.8e6, 4)
    close(ref["1ne"]["S_bot"], 43.7e6, 3)
    close(ref["3ne"]["I"], 31.6e9, 3)
    close(ref["3ne"]["S_top"], 78.1e6, 3)
    close(ref["3ne"]["S_bot"], 41.6e6, 3)


def test_defaults_and_worker_action():
    c = CompositeSlab()
    assert (c.slab_thickness, c.haunch, c.fc, c.cover_top, c.cover_bottom) == (
        200,
        50,
        35,
        60,
        35,
    )
    assert (c.bar_top, c.spacing_top, c.bar_bottom, c.spacing_bottom) == (
        "15M",
        300,
        "15M",
        300,
    )
    section = Section(composite=CompositeSlab()).model_dump()
    out = json.loads(
        dispatch(
            json.dumps({"action": "section_properties", "data": {"section": section}})
        )
    )
    assert {"steel", "composite"} <= set(out)
    bare = json.loads(
        dispatch(
            json.dumps(
                {
                    "action": "section_properties",
                    "data": {"section": Section().model_dump()},
                }
            )
        )
    )
    assert "composite" not in bare
    assert steel_properties(Section())["A"] == 54_500


def test_composite_data_never_changes_the_analysis():
    plain = Model.model_validate(Model().model_dump())
    with_slab = Model.model_validate(plain.model_dump())
    with_slab.sections[0].composite = CompositeSlab()
    assert structure_key(plain) == structure_key(with_slab)
    assert analyse(plain)["max"]["M"] == analyse(with_slab)["max"]["M"]


def test_s3_is_measured_from_each_elastic_neutral_axis(ref):
    y = REFERENCE.y3
    assert ref["1n"]["S"]["S3"] == pytest.approx(ref["1n"]["I"] / y)
    assert ref["3n"]["S"]["S3"] == pytest.approx(ref["3n"]["I"] / y)
    assert ref["steel"]["S"]["S3"] == pytest.approx(ref["steel"]["Ix"] / y)
    # Physical point: y below the axis of the section considered.
    assert ref["1n"]["points"]["S3"] == pytest.approx(ref["1n"]["y_bottom"] - y)
