"""v0.8 free-vibration module: closed forms, PyCBA agreement, extensions."""

import json
import math

import numpy as np
import pycba as cba
import pytest

from quickerbridge.browser import dispatch
from quickerbridge.modal import G, analyse_modal
from quickerbridge.models import Model
from quickerbridge.projects import create_project, validate_project
from quickerbridge.sections import properties


def model(lengths, supports, ei=2.4e6, w=24.0, **extra):
    data = {
        "spans": [{"length": length} for length in lengths],
        "supports": supports,
        "sections": [{"kind": "ei", "EI": ei}],
        "dead": [{"w": w}],
        "modal": {"modes": 12},
        **extra,
    }
    return Model.model_validate(data)


def closed_form(beta_l, length, ei, m):
    return beta_l**2 / (2 * math.pi * length**2) * math.sqrt(ei / m)


def test_simply_supported_matches_closed_form():
    L, ei, w = 30.0, 3.1e6, 20.0
    r = analyse_modal(model([L], ["pin", "roller"], ei, w))
    for n, mode in enumerate(r["modes"][:6], start=1):
        exact = closed_form(n * math.pi, L, ei, w / G)
        assert mode["f"] == pytest.approx(exact, rel=1e-4)
        assert mode["T"] == pytest.approx(1 / exact, rel=1e-4)
        assert mode["symmetry"] == ("S" if n % 2 else "A")


def test_fixed_fixed_and_propped_cantilever():
    L, ei, w = 25.0, 1.7e6, 15.0
    fixed = analyse_modal(model([L], ["fixed", "fixed"], ei, w))["modes"]
    assert fixed[0]["f"] == pytest.approx(closed_form(4.730041, L, ei, w / G), 1e-5)
    assert fixed[1]["f"] == pytest.approx(closed_form(7.853205, L, ei, w / G), 1e-5)
    propped = analyse_modal(model([L], ["fixed", "roller"], ei, w))["modes"]
    assert propped[0]["f"] == pytest.approx(closed_form(3.926602, L, ei, w / G), 1e-5)


def test_two_equal_spans_default_model():
    r = analyse_modal(Model())
    ei = properties(Model().sections[0])["EI"]
    f_ss = closed_form(math.pi, 34.8, ei, 10 / G)
    assert r["modes"][0]["f"] == pytest.approx(f_ss, rel=1e-5)
    assert r["modes"][0]["symmetry"] == "A"
    # Second mode: each span behaves as pinned-clamped.
    assert r["modes"][1]["f"] / r["modes"][0]["f"] == pytest.approx(
        (3.926602 / math.pi) ** 2, rel=1e-4
    )
    assert r["modes"][1]["symmetry"] == "S"
    assert r["references"][0]["f_simple"] == pytest.approx(f_ss)
    assert len(r["modes"]) == len(r["shapes"]) == 6
    assert all(len(s) == len(r["x"]) for s in r["shapes"])
    assert all(max(abs(v) for v in s) == pytest.approx(1) for s in r["shapes"])


@pytest.mark.parametrize(
    "supports",
    [
        ["pin", "roller", "roller", "roller"],
        ["fixed", "roller", "pin", "fixed"],
        ["spring", "roller", "roller", "spring"],
    ],
)
def test_agrees_with_pycba_modal(supports):
    lengths, ei, w = [22.0, 31.0, 26.5], 2.2e6, 18.0
    springs = [4e5, 0, 0, 9e5]
    extra = {"support_springs": springs} if "spring" in supports else {}
    ours = analyse_modal(model(lengths, supports, ei, w, **extra))
    pycba_supports = []
    for kind, k in zip(supports, springs):
        pycba_supports.append([-1, k] if kind == "spring" else kind)
    ba = cba.BeamAnalysis(lengths, ei, supports=pycba_supports)
    reference = ba.modal(w / G, n_modes=12, nseg=40)
    np.testing.assert_allclose(
        [m["f"] for m in ours["modes"]], reference.f[:12], rtol=1e-8
    )


def test_spring_limits_bracket_pin_and_fixed():
    base = dict(lengths=[28.0, 28.0], ei=2e6, w=20.0)

    def f1(supports, k):
        extra = {"support_springs": [k, 0, k]} if "spring" in supports else {}
        m = model(base["lengths"], supports, base["ei"], base["w"], **extra)
        return analyse_modal(m)["modes"][0]["f"]

    pin = f1(["pin", "roller", "roller"], 0)
    fixed = f1(["fixed", "roller", "fixed"], 0)
    assert f1(["spring", "roller", "spring"], 1e-3) == pytest.approx(pin, rel=1e-6)
    assert f1(["spring", "roller", "spring"], 1e13) == pytest.approx(fixed, rel=1e-4)
    middle = f1(["spring", "roller", "spring"], 3 * 2e6 / 28)
    assert pin < middle < fixed


def test_mass_participation_and_custom_mass():
    r = analyse_modal(model([30.0], ["pin", "roller"]))
    ratios = [m["mass_ratio"] for m in r["modes"]]
    # Simply supported: 8/pi^2 in mode 1, 8/(9 pi^2) in mode 3, zero if even
    # (the mass lumped on the two support nodes is not excited: -0.2 %).
    assert ratios[0] == pytest.approx(8 / math.pi**2, rel=5e-3)
    assert ratios[1] == pytest.approx(0, abs=1e-12)
    assert ratios[2] == pytest.approx(8 / (9 * math.pi**2), rel=2.5e-2)
    assert 0.95 < sum(ratios) <= 1 + 1e-9
    custom = model(
        [30.0], ["pin", "roller"], modal={"mass_source": "custom", "mass": 4.0 * G}
    )
    r4 = analyse_modal(custom)
    scale = math.sqrt((24 / G) / 4.0)
    assert r4["modes"][0]["f"] == pytest.approx(r["modes"][0]["f"] * scale, rel=1e-7)
    assert r4["mass"]["total_t"] == pytest.approx(120)


def test_load_factor_is_not_mass_and_partial_loads():
    plain = analyse_modal(model([30.0], ["pin", "roller"]))
    factored = Model.model_validate(
        {
            **model([30.0], ["pin", "roller"]).model_dump(),
            "dead": [{"w": 24, "factor": 1.35}],
        }
    )
    assert analyse_modal(factored)["modes"][0]["f"] == pytest.approx(
        plain["modes"][0]["f"]
    )
    # Two half-length loads equal one full load: the mesh breaks at mid-span.
    halves = Model.model_validate(
        {
            **model([30.0], ["pin", "roller"]).model_dump(),
            "dead": [
                {"w": 24, "start": 0, "end": 0.5},
                {"w": 24, "start": 0.5, "end": 1},
            ],
        }
    )
    assert analyse_modal(halves)["modes"][0]["f"] == pytest.approx(
        plain["modes"][0]["f"], rel=1e-9
    )
    # A partial load only: the unloaded length is reported, no singular matrix.
    partial = Model.model_validate(
        {
            **model([30.0], ["pin", "roller"]).model_dump(),
            "dead": [{"w": 24, "end": 0.6}],
        }
    )
    result = analyse_modal(partial)
    assert result["mass"]["unloaded_length"] == pytest.approx(12)
    assert result["modes"][0]["f"] > plain["modes"][0]["f"]


def test_no_mass_is_reported():
    with pytest.raises(ValueError, match="modal.no_mass"):
        analyse_modal(model([30.0], ["pin", "roller"], w=0))


def mirrored_haunch():
    girder = {
        "depth": 1200,
        "top_width": 400,
        "top_thickness": 30,
        "web_thickness": 16,
        "bottom_width": 500,
        "bottom_thickness": 40,
    }
    deep = {**girder, "name": "S2", "depth": 1900}
    return Model.model_validate(
        {
            "spans": [
                {
                    "length": 30,
                    "zones": [
                        {"end": 0.75, "section": 0},
                        {
                            "end": 1,
                            "section": 0,
                            "end_section": 1,
                            "profile": "parabolic",
                            "plates": "deep",
                        },
                    ],
                },
                {
                    "length": 30,
                    "zones": [
                        {
                            "end": 0.25,
                            "section": 1,
                            "end_section": 0,
                            "profile": "parabolic",
                            "plates": "deep",
                        },
                        {"end": 1, "section": 0},
                    ],
                },
            ],
            "supports": ["roller", "pin", "roller"],
            "sections": [{**girder, "name": "S1"}, deep],
            "nonprismatic": True,
            "dead": [{"w": 30}],
        }
    )


def test_nonprismatic_mirror_symmetry_and_convergence():
    m = mirrored_haunch()
    r = analyse_modal(m)
    assert [mode["symmetry"] for mode in r["modes"][:4]] == ["A", "S", "A", "S"]
    fine = analyse_modal(m.model_copy(update={"precision": "fine"}))
    np.testing.assert_allclose(
        [x["f"] for x in r["modes"][:8]], [x["f"] for x in fine["modes"][:8]], rtol=1e-4
    )
    # The haunch stiffens the interior support: mode 2 (hogging over the pier)
    # rises more than the antisymmetric mode 1, which has no pier curvature.
    prismatic = analyse_modal(m.model_copy(update={"nonprismatic": False}))
    assert (
        r["modes"][0]["f"] / prismatic["modes"][0]["f"]
        < r["modes"][1]["f"] / prismatic["modes"][1]["f"]
    )


def test_modal_settings_do_not_touch_static_cache_or_results():
    from quickerbridge.engine import structure_key

    a = Model.model_validate(Model().model_dump())
    b = Model.model_validate(
        {**a.model_dump(), "modal": {"mass_source": "custom", "mass": 30}}
    )
    assert structure_key(a) == structure_key(b)


def test_browser_dispatch_and_project_roundtrip():
    m = Model.model_validate({**Model().model_dump(), "modal": {"modes": 6}})
    value = json.loads(
        dispatch(json.dumps({"action": "modal", "data": {"model": m.model_dump()}}))
    )
    assert value["kind"] == "modal" and len(value["modes"]) == 6
    project = create_project(m, "modes")
    reopened = validate_project(json.dumps(project))
    assert reopened["schema_version"] == 6
    assert reopened["model"]["modal"]["modes"] == 6
    old = json.loads(json.dumps(project))
    old["schema_version"] = 3
    del old["model"]["modal"]
    assert validate_project(json.dumps(old))["model"]["modal"]["mass_source"] == "dead"
