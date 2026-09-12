"""Independent steel-section and browser-boundary regressions retained in v0.3."""
import base64
import json
from io import BytesIO

import numpy as np
import pytest
from openpyxl import load_workbook

from quickerbridge.models import Model, Section, Span, Zone
from quickerbridge.sections import properties, profile_fraction, span_ei
from quickerbridge.engine import analyse
from quickerbridge.browser import dispatch


def test_symmetric_steel_girder_against_outer_minus_voids():
    # 2000 x 600 mm outer rectangle minus two web-side voids, h_web = 1920.
    s = Section(
        depth=2000,
        top_width=600,
        bottom_width=600,
        top_thickness=40,
        bottom_thickness=40,
        web_thickness=20,
    )
    expected_i = (600 * 2000**3 - 580 * 1920**3) / 12 / 1e12
    p = properties(s)
    assert p["centroid"] == pytest.approx(1000)
    assert p["I"] == pytest.approx(expected_i, rel=1e-13)
    assert p["EI"] == pytest.approx(expected_i * 200e6)


def test_asymmetric_steel_girder_against_raw_area_integrals():
    s = Section(
        depth=1800,
        top_width=600,
        top_thickness=30,
        bottom_width=650,
        bottom_thickness=40,
        web_thickness=16,
    )
    # Integrate b(y), y*b(y), and y²*b(y) from bottom upwards (mm units).
    strips = [(650, 0, 40), (16, 40, 1770), (600, 1770, 1800)]
    a = sum(b * (hi - lo) for b, lo, hi in strips)
    q = sum(b * (hi**2 - lo**2) / 2 for b, lo, hi in strips)
    i0 = sum(b * (hi**3 - lo**3) / 3 for b, lo, hi in strips)
    p = properties(s)
    assert p["A"] == pytest.approx(a / 1e6)
    assert p["centroid"] == pytest.approx(q / a)
    assert p["I"] == pytest.approx((i0 - q * q / a) / 1e12, rel=1e-13)


def test_parabolic_haunches_are_mirrored_and_tangent_at_shallow_end():
    deep, shallow = Section(depth=2400), Section(depth=1800)
    t = np.linspace(0, 1, 33)
    left = deep.depth + (shallow.depth - deep.depth) * profile_fraction(
        deep, shallow, t, "parabolic"
    )
    right = shallow.depth + (deep.depth - shallow.depth) * profile_fraction(
        shallow, deep, t, "parabolic"
    )
    np.testing.assert_allclose(left, right[::-1])
    assert left[16] == pytest.approx(1950)  # corrected first-zone midpoint
    epsilon = 1e-6
    assert (
        profile_fraction(deep, shallow, 1, "parabolic")
        - profile_fraction(deep, shallow, 1 - epsilon, "parabolic")
    ) / epsilon < 2e-6


def test_direct_ei_benchmark_and_browser_excel():
    m = Model(
        spans=[Span(length=10)],
        supports=["pin", "roller"],
        sections=[Section(kind="ei", EI=2_000_000)],
        load_mode="dead",
    )
    assert properties(m.sections[0]) == dict(
        A=None, I=None, centroid=None, EI=2_000_000
    )
    assert span_ei(m, 0) == 2_000_000
    r = json.loads(
        dispatch(
            json.dumps(
                dict(action="analyse", data=dict(job="test", model=m.model_dump()))
            )
        )
    )
    assert max(r["max"]["M"]) == pytest.approx(10 * 10**2 / 8)
    assert max(r["max"]["D"]) == pytest.approx(
        1000 * 5 * 10 * 10**4 / (384 * 2_000_000), rel=1e-4
    )
    encoded = json.loads(
        dispatch(json.dumps(dict(action="excel", data=dict(job="test", lang="fr"))))
    )
    wb = load_workbook(BytesIO(base64.b64decode(encoded)))
    assert wb["Modèle"]["B1"].value == "0.4"
    assert wb["Stations"]["L2"].value == pytest.approx(50)
    m.spans[0].zones = [Zone(end=1, section=0, profile="linear")]
    m.nonprismatic = True
    with pytest.raises(ValueError, match="constant_ei_zone"):
        Model.model_validate(m.model_dump())


def test_constant_ei_matches_dimensioned_girder():
    m = Model(load_mode="dead")
    a = analyse(m)
    m.sections = [Section(kind="ei", EI=properties(m.sections[0])["EI"])]
    b = analyse(m)
    for k in ("V", "M", "D", "R"):
        np.testing.assert_allclose(a["max"][k], b["max"][k], rtol=1e-11, atol=1e-10)
