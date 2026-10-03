"""v0.9.6: audit fixes, NEBT section properties and stresses, FT, exports."""

import io
import json
import math

import pytest
from pydantic import ValidationError

from quickerbridge.distribution import slab_shear
from quickerbridge.engine import analyse, stress_all, stress_at, structure_key
from quickerbridge.models import CompositeSlab, Model, Section, default_model
from quickerbridge.projects import create_project, validate_project
from quickerbridge.section_props import section_properties, stress_profile
from quickerbridge.sections import NEBT, properties, section_at, span_ei


# --- Audit 2026-10-01 ---------------------------------------------------------


def test_bars_must_lie_inside_the_slab():
    # Audit P1: 300 mm top cover in a 200 mm slab put the bars under the slab.
    with pytest.raises(ValidationError, match="composite.bars"):
        CompositeSlab(slab_thickness=200, cover_top=300)
    with pytest.raises(ValidationError, match="composite.bars"):
        CompositeSlab(slab_thickness=80, cover_top=40, cover_bottom=35)  # overlap
    with pytest.raises(ValidationError, match="composite.bars"):
        CompositeSlab(spacing_top=12)  # spacing below the bar diameter
    CompositeSlab()  # defaults are valid
    CompositeSlab(slab_thickness=225, cover_top=35, cover_bottom=60)


def test_stress_stages_are_saved_with_the_project():
    # Audit P2, v0.9.6 form: the stage is a choice of each permanent load,
    # saved with it; the self-weight is always on the girder alone.
    m = default_model()
    m.dead[0].stage = "steel"
    reopened = validate_project(json.dumps(create_project(m, "p")))
    assert reopened["model"]["dead"][0]["stage"] == "steel"
    assert reopened["schema_version"] == 11
    # Schema 9 files: a global "dead on steel" choice moves to every load.
    old = create_project(default_model(), "p")
    old["schema_version"] = 9
    old["model"]["stress"] = {"self_weight": "steel", "dead": "steel"}
    for load in old["model"]["dead"]:
        load.pop("stage")
    out = validate_project(json.dumps(old))["model"]
    assert "stress" not in out and out["dead"][0]["stage"] == "steel"


def test_variable_depth_stress_sections_match_the_analysis():
    # Tapered zones between S1 and S2: interpolated depth, plates of the deeper
    # section (default "deep" option), same I as the analysis EI.
    m = default_model()
    r = analyse(m)
    L = m.spans[0].length
    for i, (x, side) in enumerate(zip(r["x"], r["sides"])):
        if not 0.8 * L < x < 1.2 * L:
            continue
        sec = section_at(m, x, side)
        local, span = (x, 0) if x <= L else (x - L, 1)
        ei = float(
            span_ei(m, span)(min(local, L - 1e-9) if span == 0 else max(local, 1e-9))
        )
        assert m.sections[0].depth <= sec.depth <= m.sections[1].depth
        assert properties(sec)["EI"] == pytest.approx(ei, rel=2e-3)
        st = stress_at(m, r, i)["cases"]["max"]["stages"]["steel"]
        assert st["I"] / 1e12 == pytest.approx(properties(sec)["I"], rel=1e-9)
        assert st["ybar"] == pytest.approx(properties(sec)["centroid"], rel=1e-9)


# --- NEBT ---------------------------------------------------------------------


def nebt(**slab):
    return Section(kind="nebt", nebt="NEBT1400", composite=CompositeSlab(**slab))


def test_nebt_section_properties():
    out = section_properties(nebt(enabled=False, y_steel=300))
    g = out["steel"]
    data = NEBT["NEBT1400"]
    assert out["kind"] == "nebt"
    assert g["A"] == data["A"] and g["y_bottom"] == data["yb"]
    assert g["Ix"] == pytest.approx(data["I"] * 1e6)
    assert g["S"]["S5"] == pytest.approx(data["I"] * 1e6 / data["yb"])
    assert g["S"]["S3"] == pytest.approx(data["I"] * 1e6 / 300)


def test_nebt_composite_uses_girder_modulus():
    s = nebt(effective_width=2500)
    out = section_properties(s)["composite"]
    eg = 28_000.0
    assert out["Eg"] == eg and out["n"] == pytest.approx(eg / out["Ec"])
    assert out["m"] == pytest.approx(200_000 / eg)
    assert "1ne" not in out and "S4" not in out["1n"]["S"]
    # Hand check, 1n: girder + slab / n + bars × m.
    data = NEBT["NEBT1400"]
    base = data["h"] + s.composite.haunch
    bars = [(b["area"] * out["m"], base + b["y_in_slab"]) for b in out["bars"]]
    slab = (out["concrete_area"] / out["n"], base + s.composite.slab_thickness / 2)
    area = data["A"] + slab[0] + sum(a for a, _ in bars)
    ybar = (
        data["A"] * data["yb"] + slab[0] * slab[1] + sum(a * y for a, y in bars)
    ) / area
    assert out["1n"]["A"] == pytest.approx(area)
    assert out["1n"]["y_bottom"] == pytest.approx(ybar)
    neg = out["negative"]
    assert neg["I"] > data["I"] * 1e6 and "web_2dc" not in neg


def test_nebt_stresses_and_no_taper():
    m = Model(sections=[nebt()], spans=[{"length": 30}, {"length": 30}])
    r = analyse(m)
    i = len(r["x"]) // 4
    out = stress_at(m, r, i)
    mx = out["cases"]["max"]
    assert mx["kind"] == "nebt" and mx["depth"] == 1400 and mx["composite"]
    names = {f["name"] for f in mx["fibres"]}
    assert {"S2", "S5", "slab_top", "bar_top"} <= names and "S4" not in names
    # Girder alone stage: σ = −M (y − ȳ) / I with the tabulated I.
    st = mx["stages"]["steel"]
    assert st["I"] == pytest.approx(NEBT["NEBT1400"]["I"] * 1e6)
    with pytest.raises(ValidationError, match="model.nebt_nonprismatic"):
        Model(sections=[nebt()], nonprismatic=True)


# --- All stations, fixed scale ------------------------------------------------


def test_stress_all_matches_station_requests():
    m = default_model()
    for s in m.sections:
        s.composite = CompositeSlab()
    r = analyse(m)
    a = stress_all(m, r)
    assert len(a["stations"]) == len(r["x"])
    for i in (0, 20, len(r["x"]) // 2, len(r["x"]) - 1):
        one = stress_at(m, r, i)
        for case in ("max", "min"):
            for k, v in one["cases"][case]["total"].items():
                assert a["stations"][i][case][k] == pytest.approx(v, abs=1e-9)
    values = [v for st in a["stations"] for c in ("max", "min") for v in st[c].values()]
    assert a["tension"] == pytest.approx(max(values))
    assert a["compression"] == pytest.approx(min(values))


# --- S6-25 FT and exports -----------------------------------------------------


def test_slab_fls_shear_follows_each_printed_table():
    le = 20.0
    assert slab_shear("FLS", 2, le, False, 3.0, "AB")[0] == pytest.approx(
        3.20 + 0.10 * le
    )
    assert slab_shear("FLS", 2, le, False, 3.0, "CD")[0] == pytest.approx(
        3.20 + 0.10 * le
    )  # A5.3.2 typo
    assert slab_shear("ULS", 2, le, False, 3.0, "AB")[0] == pytest.approx(
        2.35 + 0.35 * math.sqrt(le)
    )


def test_default_model_has_no_axle_factor():
    d = default_model().distribution
    assert not d.enabled and not d.apply


def test_excel_ft_sheet_lists_every_parameter():
    openpyxl = pytest.importorskip("openpyxl")
    from quickerbridge.exports import excel_bytes

    m = default_model()
    m.distribution.enabled = True
    data = excel_bytes(analyse(m), "fr", m)
    wb = openpyxl.load_workbook(io.BytesIO(data))
    sheet = wb["Facteur d'essieu FT"]
    labels = [row[0].value for row in sheet.iter_rows() if row[0].value]
    for expected in (
        "Classe de route",
        "Poutre choisie",
        "FT min ÉLUL",
        "N",
        "DVE (m)",
        "μ",
    ):
        assert expected in labels
    assert any(str(x).startswith("Le M+ travée 1") for x in labels)
    assert any(str(x).startswith("Le M− appui 2") for x in labels)
    assert any(str(x).startswith("Travée 2 · Fs") for x in labels)


def test_stress_profile_on_steel_unchanged_by_refactor():
    # Steel girder + reference slab: same values as the v0.9.4/0.9.5 formulas.
    s = Section(
        composite=CompositeSlab(
            slab_thickness=225,
            spacing_top=150,
            spacing_bottom=150,
            cover_top=35,
            cover_bottom=60,
        )
    )
    out = stress_profile(s, {"steel": 0.0, "3n": 0.0, "1n": 1000.0})
    st = out["stages"]["1n"]
    assert out["total"]["S5"] == pytest.approx(1000e6 * st["ybar"] / st["I"])
    comp = section_properties(s)["composite"]
    assert comp["m"] == 1.0
    y_bar = next(f["y"] for f in out["fibres"] if f["name"] == "bar_top")
    assert out["total"]["bar_top"] == pytest.approx(
        -1000e6 * (y_bar - st["ybar"]) / st["I"]
    )


# --- Permanent-load stages, Fs on dead loads, thermal (0.9.6 complement) ------


def test_slab_weight_on_girder_alone_and_self_weight_always_on_steel():
    from quickerbridge.models import DeadLoad
    from quickerbridge.engine import stage_moments

    m = default_model()
    for s in m.sections:
        s.composite = CompositeSlab()
    m.dead = [DeadLoad(name="slab", w=15, stage="steel"), DeadLoad(name="wearing", w=5)]
    r = analyse(m)
    m_sw, m_steel, m_3n = stage_moments(m, r)
    i = int(max(range(len(r["x"])), key=lambda k: r["dead"]["M"][k]))
    # Linear analysis: moments are proportional to the uniform loads.
    assert m_steel[i] / m_3n[i] == pytest.approx(15 / 5, rel=1e-6)
    assert m_sw[i] + m_steel[i] + m_3n[i] == pytest.approx(r["dead"]["M"][i])
    out = stress_at(m, r, i)
    st = out["cases"]["max"]["stages"]
    assert st["steel"]["M"] == pytest.approx(m_sw[i] + m_steel[i])
    assert st["3n"]["M"] == pytest.approx(m_3n[i])


def test_fs_on_dead_loads_can_be_switched_off():
    import numpy as np

    m = default_model()
    m.distribution.enabled = m.distribution.apply = True
    m.distribution.girder = "exterior"
    m.load_mode = "dead"
    on = analyse(m)
    m.distribution.fs_dead = False
    off = analyse(m)
    assert max(on["max"]["V"]) > max(off["max"]["V"])
    np.testing.assert_allclose(on["max"]["M"], off["max"]["M"])


def test_thermal_depth_from_sections_and_bilinear_gradient():
    from quickerbridge.thermal import free_curvature, span_curvatures

    m = Model(load_mode="thermal")
    s = m.sections[0]
    alpha = m.thermal.alpha_micro * 1e-6
    # Linear: h = girder depth (no slab), then + haunch + slab.
    assert free_curvature(m, s) == pytest.approx(alpha * 15 / 1.2)
    s.composite = CompositeSlab()
    assert free_curvature(m, s) == pytest.approx(alpha * 15 / 1.45)
    assert span_curvatures(m)[0] == pytest.approx(-alpha * 15 / 1.45)
    m.thermal.depth_source = "manual"
    m.thermal.depth = 1800
    assert free_curvature(m, s) == pytest.approx(alpha * 15 / 1.8)
    # Bilinear: hand integration over the slab (T linear, 0 at its bottom).
    m.thermal.profile = "bilinear"
    comp = section_properties(s)["composite"]
    c1, tc = comp["1n"], 200.0
    b = comp["concrete_area"] / comp["n"] / tc
    e = 1250.0 - c1["y_bottom"]
    q = b * 35 / tc * (e * tc**2 / 2 + tc**3 / 3)
    q += sum(
        bar["area"] * comp["m"] * 35 * bar["y_in_slab"] / tc * (e + bar["y_in_slab"])
        for bar in comp["bars"]
    )
    assert free_curvature(m, s) == pytest.approx(alpha * q / c1["I"] * 1000)
    r = analyse(m)
    assert r["kind"] == "thermal" and max(abs(v) for v in r["values"]["M"]) > 0
    s.composite = None
    with pytest.raises(ValueError, match="thermal.needs_slab"):
        analyse(m)


def test_old_projects_keep_the_manual_thermal_depth():
    old = create_project(Model(), "p")
    old["schema_version"] = 9
    old["model"]["thermal"].pop("depth_source")
    old["model"]["thermal"]["depth"] = 1800
    out = validate_project(json.dumps(old))["model"]["thermal"]
    assert out["depth_source"] == "manual" and out["depth"] == 1800
