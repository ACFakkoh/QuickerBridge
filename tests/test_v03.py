"""Thermal-gradient and saved-project regressions for QuickerBridge v0.3."""

from datetime import datetime, timezone
from io import BytesIO
import json

import numpy as np
from openpyxl import load_workbook
import pytest

from quickerbridge.browser import dispatch
from quickerbridge.engine import analyse
from quickerbridge.exports import excel_bytes
from quickerbridge.models import (
    DeadLoad,
    LiveLoad,
    Model,
    Section,
    Span,
    ThermalLoad,
    Zone,
)
from quickerbridge.projects import create_project, validate_project


def thermal_model(spans=(10,), **thermal):
    return Model(
        spans=[Span(length=length) for length in spans],
        supports=["pin"] + ["roller"] * len(spans),
        sections=[Section(kind="ei", EI=180_000)],
        load_mode="thermal",
        thermal=ThermalLoad(**({"depth": 1800} | thermal)),
    )


def test_simple_span_linear_gradient_is_free_curvature_only():
    model = thermal_model(delta_T=15, alpha_micro=12, depth=1800)
    result = analyse(model)
    assert result["kind"] == "thermal"
    assert result["meta"]["curvature"] == pytest.approx(-1e-4)
    np.testing.assert_allclose(result["values"]["V"], 0, atol=1e-10)
    np.testing.assert_allclose(result["values"]["M"], 0, atol=1e-10)
    np.testing.assert_allclose(result["values"]["R"], 0, atol=1e-10)
    assert min(result["values"]["D"]) == pytest.approx(-1.25, rel=3e-4)
    stiffer = model.model_copy(deep=True)
    stiffer.sections[0].EI *= 10
    np.testing.assert_allclose(
        analyse(stiffer)["values"]["D"], result["values"]["D"], atol=1e-10
    )


def test_zero_gradient_and_load_mode_isolation():
    model = thermal_model(delta_T=0)
    model.dead = [DeadLoad(w=999)]
    model.live = LiveLoad(vehicle="custom", weights=[999], spacings=[])
    zero = analyse(model)["values"]
    for response in ("V", "M", "D", "R"):
        np.testing.assert_allclose(zero[response], 0, atol=1e-10)

    model.thermal.delta_T = 15
    first = analyse(model)["values"]
    model.dead[0].w = 1
    model.live.weights[0] = 1
    second = analyse(model)["values"]
    for response in ("V", "M", "D", "R"):
        np.testing.assert_allclose(first[response], second[response], atol=1e-10)

    mechanical = Model(load_mode="dead")
    before = analyse(mechanical)["max"]
    mechanical.thermal.delta_T = -75
    after = analyse(mechanical)["max"]
    for response in ("V", "M", "D", "R"):
        np.testing.assert_allclose(before[response], after[response], atol=1e-10)


def test_two_span_gradient_produces_continuity_restraint_and_equilibrium():
    result = analyse(thermal_model(spans=(10, 10)))
    assert max(result["values"]["M"]) == pytest.approx(27, rel=1e-8)
    np.testing.assert_allclose(result["values"]["R"], [2.7, -5.4, 2.7])
    assert result["meta"]["equilibrium_error"] < 1e-10


def test_gradient_reversal_and_scaling_are_linear():
    positive = analyse(thermal_model(delta_T=15))["values"]
    negative = analyse(thermal_model(delta_T=-30))["values"]
    for response in ("V", "M", "D", "R"):
        np.testing.assert_allclose(
            negative[response], -2 * np.array(positive[response])
        )


def test_thermal_supports_nonprismatic_girder_sections():
    model = thermal_model(spans=(12, 8))
    model.sections = [Section(depth=1800), Section(depth=2600)]
    model.nonprismatic = True
    model.spans[0].zones = [
        Zone(end=0.4, section=0),
        Zone(end=1, section=0, end_section=1, profile="parabolic"),
    ]
    model.spans[1].zones = [Zone(end=1, section=1)]
    result = analyse(model)
    assert result["kind"] == "thermal"
    assert np.isfinite(result["values"]["D"]).all()
    assert len(result["table"]) == 2 * (model.subdivisions + 1)


def test_thermal_deflection_is_symmetric_for_mirrored_tapers():
    model = thermal_model(spans=(12, 12))
    model.sections = [Section(depth=1200), Section(depth=2200)]
    model.nonprismatic = True
    model.spans[0].zones = [Zone(end=1, section=0, end_section=1, profile="linear")]
    model.spans[1].zones = [Zone(end=1, section=1, end_section=0, profile="linear")]
    deflection = np.asarray(analyse(model)["values"]["D"])
    np.testing.assert_allclose(deflection, deflection[::-1], atol=1e-10)


def test_project_round_trip_preserves_full_model_and_normalizes():
    model = thermal_model(spans=(12, 18), delta_T=-22, alpha_micro=10.8, depth=2400)
    project = create_project(
        model, "Thermal example", datetime(2026, 9, 11, tzinfo=timezone.utc)
    )
    reopened = validate_project(json.dumps(project))
    assert reopened["name"] == "Thermal example"
    assert reopened["model"] == model.model_dump(mode="json")
    assert reopened["schema_version"] == 3


def test_project_round_trips_constant_ei_and_five_span_custom_nonprismatic():
    constant = thermal_model()
    constant.load_mode = "dead"
    complex_model = Model(
        spans=[Span(length=10 + i) for i in range(5)],
        supports=["pin"] + ["roller"] * 5,
        sections=[Section(), Section(depth=2400)],
        nonprismatic=True,
        live=LiveLoad(vehicle="custom", weights=[80] * 7, spacings=[1.2] * 6),
    )
    for span in complex_model.spans:
        span.zones = [
            Zone(end=0.5, section=0, end_section=1, profile="linear"),
            Zone(end=1, section=1),
        ]
    for name, model in (("Constant EI", constant), ("Five spans", complex_model)):
        payload = create_project(model, name)
        reopened = validate_project(json.dumps(payload))
        assert reopened["model"] == model.model_dump(mode="json")


@pytest.mark.parametrize(
    "mutate",
    [
        lambda p: p.update(format="WrongFormat"),
        lambda p: p.update(schema_version=4),
        lambda p: p.update(unknown=True),
        lambda p: p["model"].update(unknown=True),
    ],
)
def test_project_rejects_wrong_format_version_and_unknown_fields(mutate):
    project = create_project(thermal_model(), "Example")
    mutate(project)
    with pytest.raises(ValueError):
        validate_project(json.dumps(project))


def test_project_rejects_malformed_and_oversized_files():
    with pytest.raises(ValueError, match="project.invalid_json"):
        validate_project("{")
    with pytest.raises(ValueError, match="project.too_large"):
        validate_project("x" * (1024 * 1024 + 1))


def test_browser_dispatch_validates_project_and_matches_native_thermal():
    model = thermal_model(spans=(10, 10))
    project = create_project(model, "Browser boundary")
    reopened = json.loads(
        dispatch(
            json.dumps(
                {"action": "validate_project", "data": {"text": json.dumps(project)}}
            )
        )
    )
    browser_result = json.loads(
        dispatch(
            json.dumps(
                {
                    "action": "analyse",
                    "data": {"job": "thermal-test", "model": reopened["model"]},
                }
            )
        )
    )
    np.testing.assert_allclose(
        browser_result["values"]["M"], analyse(model)["values"]["M"]
    )


def test_browser_manual_position_keeps_selected_canadian_lane_case():
    model = Model(load_mode="live")
    model.live.case = "lane"
    dispatch(
        json.dumps(
            {
                "action": "analyse",
                "data": {"job": "lane-test", "model": model.model_dump()},
            }
        )
    )
    view = json.loads(
        dispatch(
            json.dumps(
                {
                    "action": "snapshot",
                    "data": {
                        "job": "lane-test",
                        "index": 0,
                        "sense": "max",
                        "position": 20,
                        "direction": "forward",
                    },
                }
            )
        )
    )
    assert view["record"]["case"] == "lane"
    assert [axle["load"] for axle in view["axles"]] == [40, 128, 128, 160, 144]
    assert view["lane"] == [{"start": 0.0, "end": 69.6, "w": 12.6}]


def test_thermal_workbook_is_one_case_with_input_metadata():
    workbook = load_workbook(BytesIO(excel_bytes(analyse(thermal_model()), "fr")))
    assert workbook.sheetnames == ["Stations", "Réactions", "Modèle"]
    assert workbook["Stations"]["F1"].value == "V (kN)"
    assert workbook["Réactions"]["C1"].value == "R (kN)"
    metadata = dict(workbook["Modèle"].iter_rows(values_only=True))
    assert metadata["QuickerBridge"] == "0.7"
    assert metadata["ΔT = Ttop − Tbottom (°C)"] == 15
