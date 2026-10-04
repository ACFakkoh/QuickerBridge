"""v0.9: CSA S6-25 truck load fraction FT for slab-on-girder bridges."""

from quickerbridge.projects import SCHEMA_VERSION
from io import BytesIO
import json
import math

import numpy as np
import pytest
from openpyxl import load_workbook

import quickerbridge.distribution as D
from quickerbridge.browser import dispatch
from quickerbridge.engine import analyse
from quickerbridge.exports import excel_bytes
from quickerbridge.models import Model, Section
from quickerbridge.projects import create_project, validate_project


def bridge(lengths=(17.557, 17.607), supports=None, **distribution):
    data = {
        "enabled": True,
        "girders": 6,
        "spacing": 3.25,
        "overhang": 1.73,
        "carriageway": 18.8,
        "skew": 17.7,
        **distribution,
    }
    return Model.model_validate(
        {
            "spans": [{"length": L} for L in lengths],
            "supports": supports or ["pin"] + ["roller"] * len(lengths),
            "distribution": data,
        }
    )


def pick(result, state, girder, effect, sign, where):
    (row,) = [
        r
        for r in result["rows"]
        if (r["state"], r["girder"], r["effect"], r["sign"], r["where"])
        == (state, girder, effect, sign, where)
    ]
    return row


@pytest.fixture
def example(monkeypatch):
    # The reference spreadsheet uses the pre-S6-25 pier value 0.25 (L1 + L2).
    monkeypatch.setattr(D, "PIER_FACTOR", 0.25)
    return D.truck_fraction(bridge())


def test_example_derived_values(example):
    d = example["derived"]
    assert (d["n"], d["RL"]) == (5, 0.6)
    assert d["We"] == pytest.approx(3.76)
    assert d["B"] == pytest.approx(19.71)
    assert d["mu"] == pytest.approx(0.46 / 0.6)
    # Figure 5.2: truck axis on the axis of the exterior design lane.
    assert d["DVE"] == pytest.approx(0.455 + 3.76 / 2 - 0.9)
    assert [round(s["Fs"], 3) for s in d["spans"]] == [1.029, 1.029]
    assert [round(p["Le"], 3) for p in d["positive"]] == [13.168, 13.205]
    assert [round(p["Le"], 3) for p in d["negative"]] == [8.791]


# (state, girder, effect, sign, where) -> (DT, λ or γc, FT) from the example sheet
EXAMPLE = [
    (("ULS", "interior", "moment", "+", "span:1"), 3.36, 0.081, 0.912),
    (("ULS", "interior", "moment", "+", "span:2"), 3.36, 0.081, 0.911),
    (("ULS", "interior", "moment", "-", "support:2"), 3.17, 0.072, 0.971),
    (("ULS", "exterior", "moment", "+", "span:1"), 3.426, 0.081, 0.907),
    (("ULS", "exterior", "moment", "-", "support:2"), 3.418, 0.072, 0.916),
    (("ULS", "interior", "shear", "+", "span:1"), 3.40, 0.0, 0.956),
    (("ULS", "exterior", "shear", "+", "span:2"), 3.40, 0.0, 0.956),
    (("FLS", "interior", "moment", "+", "span:1"), 4.048, 0.05, 0.737),
    (("FLS", "interior", "moment", "+", "span:2"), 4.049, 0.05, 0.737),
    (("FLS", "interior", "moment", "-", "support:2"), 3.801, 0.05, 0.823),
    (("FLS", "interior", "shear", "+", "span:1"), 3.60, 0.0, 0.903),
]


@pytest.mark.parametrize("key, dt, lam, ft", EXAMPLE)
def test_example_values(example, key, dt, lam, ft):
    row = pick(example, *key)
    assert row["DT"] == pytest.approx(dt, abs=0.006)
    assert row["lambda"] == pytest.approx(lam, abs=0.0006)
    assert row["FT"] == pytest.approx(ft, abs=0.0011)


def test_example_gamma_values(example):
    assert pick(example, "FLS", "interior", "moment", "+", "span:1")[
        "gamma_c"
    ] == pytest.approx(1.049, abs=0.0006)
    assert pick(example, "FLS", "interior", "moment", "-", "support:2")["gamma_c"] == 1
    ext = pick(example, "FLS", "exterior", "moment", "+", "span:1")
    assert ext["DT"] == pytest.approx(3.738, abs=0.0006)
    assert ext["gamma_c"] == pytest.approx(1.25 - 0.5 * 1.73 / 3.25)
    assert pick(example, "FLS", "exterior", "moment", "-", "support:2")[
        "DT"
    ] == pytest.approx(3.709, abs=0.0006)


def test_points_where_the_code_tables_differ_from_the_example_sheet(example):
    # Table 5.3: exterior moment at FLS for n >= 3 has λ = 0.0, and γe enters as
    # S / (DT γc (1 + μλ + γe)). The sheet's 0.756 is reproduced with λ = 0.05.
    ext = pick(example, "FLS", "exterior", "moment", "+", "span:1")
    assert ext["lambda"] == 0.0
    x = example["derived"]["DVE"] - 1
    assert ext["gamma_e"] == pytest.approx(0.28 * x * (1 + 0.4 * x**2))
    with_sheet_lambda = 3.25 / (
        ext["DT"]
        * ext["gamma_c"]
        * (1 + example["derived"]["mu"] * 0.05 + ext["gamma_e"])
    )
    assert with_sheet_lambda == pytest.approx(0.756, abs=0.0006)
    assert ext["FT"] == pytest.approx(0.781, abs=0.0006)
    # Table 5.6: interior supports of continuous spans, γc = (S/4.5)^0.15 ≤ 0.9.
    pier = pick(example, "ULS", "interior", "shear", "-", "support:2")
    assert pier["gamma_c"] == 0.9
    assert pier["FT"] == pytest.approx(3.25 / (3.40 * 0.9))


def test_s6_25_pier_value_and_exterior_shear_skew():
    r = D.truck_fraction(bridge())
    (neg,) = r["derived"]["negative"]
    assert neg["Le"] == pytest.approx(0.20 * (17.557 + 17.607))
    row = pick(r, "ULS", "exterior", "shear", "+", "span:1")
    assert row["FT_Fs"] == pytest.approx(row["FT"] * row["Fs"])
    assert pick(r, "ULS", "interior", "shear", "+", "span:1")["Fs"] == 1.0
    assert row["Fs"] > 1


@pytest.mark.parametrize(
    "wc, n",
    [
        (5.9, 1),
        (6.0, 1),
        (6.1, 2),
        (10.0, 2),
        (13.5, 3),
        (17.0, 4),
        (20.5, 5),
        (24, 6),
        (27.5, 7),
        (30, 8),
    ],
)
def test_table_3_5_lanes(wc, n):
    assert D.design_lanes(wc) == n


def test_table_3_6_and_minimum_bounds():
    assert [D.lane_factor(n) for n in range(1, 8)] == [
        1,
        0.9,
        0.8,
        0.7,
        0.6,
        0.55,
        0.55,
    ]
    # Wide spacing on a narrow deck: the 1.05 n RL / N floor governs at ULS.
    m = bridge(girders=4, spacing=0.8, overhang=0.3, carriageway=3.0, skew=0)
    r = D.truck_fraction(m)
    row = pick(r, "ULS", "interior", "moment", "+", "span:1")
    assert row["minimum_governs"] and row["FT"] == pytest.approx(1.05 * 1 * 1.0 / 4)
    assert r["derived"]["minimum"]["FLS"] == pytest.approx(1.05 / 4)


def test_table_5_4_5_5_5_7_branches():
    assert D.gamma_c_interior_fls(1, 30, 3) == 1
    assert D.gamma_c_interior_fls(2, 8, 3) == 1
    assert D.gamma_c_interior_fls(2, 30, 1.0) == 1
    assert D.gamma_c_interior_fls(2, 30, 3) == pytest.approx(1 + 0.54 * 0.5)
    assert D.gamma_c_interior_fls(2, 30, 4) == pytest.approx(1 + 0.72 * 0.5)
    assert D.gamma_c_interior_fls(2, 60, 3) == pytest.approx(1.54)
    assert D.gamma_c_interior_fls(2, 60, 4) == 1.72
    assert D.gamma_c_interior_fls(2, 50, 3) == pytest.approx(0.3 * 3 + 0.64)
    # Table 5.5, S6-25: 1.10 up to 0.3 S, then 1.25 − 0.50 Sc/S ≤ 1.10.
    assert D.gamma_c_exterior(3, 0.9) == 1.10
    assert D.gamma_c_exterior(3, 1.4) == pytest.approx(1.25 - 0.5 * 1.4 / 3)
    assert D.gamma_c_exterior(3, 1.7) == pytest.approx(1.25 - 0.5 * 1.7 / 3)
    assert D.gamma_c_shear(1.5, False) == pytest.approx((1.5 / 2) ** 0.25)
    assert D.gamma_c_shear(3.0, False) == 1.0
    assert D.gamma_c_shear(2.0, True) == pytest.approx((2 / 4.5) ** 0.15)
    assert D.gamma_e(1, 10, 1.5) == 0
    assert D.gamma_e(5, 20, 1.5) == pytest.approx(0.28 * 0.5 * 1.1)
    assert D.gamma_e(5, 40, 1.5) == pytest.approx(0.28 * 0.5 * (1 + 160 * 0.25 / 1600))


def test_table_5_3_single_lane_and_caps():
    dt, lam = D.coefficients("ULS", "interior", "moment", 1, 20)
    assert dt == pytest.approx(4.60 - 3.10 / 5) and lam == pytest.approx(0.05 - 0.005)
    assert D.coefficients("ULS", "interior", "moment", 2, 3)[0] == 2.80
    assert D.coefficients("FLS", "exterior", "moment", 1, 100)[0] == 3.50
    assert D.coefficients("FLS", "exterior", "moment", 2, 100)[0] == 3.80
    assert D.coefficients("FLS", "exterior", "moment", 3, 100)[0] == 4.10
    assert D.coefficients("FLS", "interior", "moment", 2, 25)[0] == pytest.approx(4.2)
    assert D.coefficients("FLS", "interior", "moment", 3, 25)[0] == pytest.approx(4.25)
    assert D.coefficients("ULS", "exterior", "shear", 1, 9) == (3.50, 0.0)


def test_le_configurations_figure_5_1():
    three = Model.model_validate(
        {
            "spans": [{"length": 20}, {"length": 30}, {"length": 20}],
            "supports": ["pin", "roller", "roller", "roller"],
        }
    )
    pos, neg = D.effective_spans(three, 3, 3)
    assert [p[1] for p in pos] == [15, 15, 15]
    assert [n[1] for n in neg] == [pytest.approx(10), pytest.approx(10)]
    # Integral abutments, Figure 5.1 d).
    integral = three.model_copy(deep=True)
    integral.supports = ["fixed", "roller", "roller", "spring"]
    integral.support_springs = [0, 0, 0, 1e6]
    pos, neg = D.effective_spans(integral, 2.5, 4.0)
    assert [p[1] for p in pos] == [12, 15, 12]
    assert [round(n[1], 6) for n in neg] == [5.5, 12.5, 12.5, 7.0]
    # An isostatic middle span splits the bridge: three simple spans.
    iso = three.model_copy(deep=True)
    iso.spans[1].simple = True
    pos, neg = D.effective_spans(iso, 3, 3)
    assert [p[1] for p in pos] == [20, 30, 20] and neg == []
    # Le limits of clause 5.6.4.6.
    assert D.clamp_le(2) == 3 and D.clamp_le(80) == 60


def test_dve_is_capped_at_3_m():
    # Wide overhang: curb (B − Wc)/2 = 3.0 m, so the raw DVE would be 3.98 m.
    m = bridge(girders=4, spacing=3.0, overhang=4.0, carriageway=11.0, skew=0)
    r = D.truck_fraction(m)
    assert r["derived"]["DVE"] == 3.0 and "dve_capped" in r["warnings"]
    ext = pick(r, "FLS", "exterior", "moment", "+", "span:1")
    assert ext["gamma_e"] == pytest.approx(D.gamma_e(4, ext["Le"], 3.0))
    assert "dve_capped" not in D.truck_fraction(bridge())["warnings"]


def test_warnings_and_skew():
    r = D.truck_fraction(bridge(overhang=2.5, carriageway=22))
    assert {"overhang", "width"} <= set(r["warnings"])
    m = bridge()
    m.live.vehicle = "HL93Truck"
    assert "vehicle" in D.truck_fraction(m)["warnings"]
    assert D.skew_factor(20, 3, 0) == 1.0
    eps = 20 / 3 * math.tan(math.radians(30))
    assert D.skew_factor(20, 3, 30) == pytest.approx(1.2 - 2 / (eps + 10))


def test_distribution_changes_the_analysis_only_when_applied_and_round_trips():
    plain = bridge(enabled=False)
    on = bridge()
    assert analyse(plain)["max"]["M"] == analyse(on)["max"]["M"]
    assert analyse(on)["ft"] is None
    reopened = validate_project(json.dumps(create_project(on, "FT")))
    assert reopened["schema_version"] == SCHEMA_VERSION
    assert reopened["model"]["distribution"]["skew"] == 17.7
    old = create_project(plain, "Old")
    old["schema_version"] = 5
    del old["model"]["distribution"]
    assert (
        validate_project(json.dumps(old))["model"]["distribution"]["enabled"] is False
    )
    # v0.9 files carried an enveloped "effect"; it is dropped in v0.9.1.
    v09 = create_project(on, "v0.9")
    v09["schema_version"] = 6
    v09["model"]["distribution"]["effect"] = "max"
    assert "effect" not in validate_project(json.dumps(v09))["model"]["distribution"]


def test_zones_follow_figure_5_1():
    r = D.truck_fraction(bridge())
    zones = [(round(z["x0"], 3), round(z["x1"], 3), z["sign"]) for z in r["zones"]]
    pier = 17.557
    assert zones == [
        (0, round(pier - 0.2 * 17.557, 3), "+"),
        (round(pier - 0.2 * 17.557, 3), round(pier + 0.2 * 17.607, 3), "-"),
        (round(pier + 0.2 * 17.607, 3), 35.164, "+"),
    ]
    neg = r["zones"][1]
    assert neg["FT_M"] == pick(r, "ULS", "interior", "moment", "-", "support:2")["FT"]
    assert neg["FT_V"] == pick(r, "ULS", "interior", "shear", "-", "support:2")["FT"]
    # Exterior girder at FLS: zones carry the exterior FLS values, × Fs on shear.
    ext = D.truck_fraction(bridge(girder="exterior", state="FLS"))
    row = pick(ext, "FLS", "exterior", "shear", "+", "span:1")
    assert ext["zones"][0]["FT_V"] == pytest.approx(row["FT"] * row["Fs"])
    # Station sides pick the zone at a hinge between two simple spans.
    iso = bridge(skew=0)
    iso.spans[0].simple = True
    fv, fm, _ = D.station_factors(iso, [17.557, 17.557], ["left", "right"])
    z = D.truck_fraction(iso)["zones"]
    assert fm == [z[0]["FT_M"], z[1]["FT_M"]] and len(z) == 2


def live_bridge(apply, **distribution):
    data = bridge(apply=apply, **distribution).model_dump()
    data["load_mode"] = "live"
    return Model.model_validate(data)


@pytest.mark.parametrize("case", ["truck", "lane"])
def test_ft_scales_axle_effects_on_v_and_m_by_zone(case):
    off, on = live_bridge(False), live_bridge(True)
    for m in (off, on):
        m.live.case = case
        m.live.lane_fraction = 0.8
    a, b = analyse(off), analyse(on)
    zones = b["ft"]["zones"]
    x = np.array(a["x"])
    sides = a["sides"]
    fv, fm, _ = D.station_factors(on, x, sides)
    # v0.9.2: FT applies to the whole live load (trucks and lane load): every
    # V, M and δ value is exactly the zone fraction times the one-lane value;
    # each reaction takes the shear FT of the zone holding its support.
    for sense in ("max", "min"):
        np.testing.assert_allclose(b[sense]["M"], np.array(a[sense]["M"]) * fm)
        np.testing.assert_allclose(b[sense]["V"], np.array(a[sense]["V"]) * fv)
        np.testing.assert_allclose(b[sense]["D"], np.array(a[sense]["D"]) * fm)
    by_zone = {z["where"]: z for z in zones}
    expected = [
        by_zone["span:1"]["FT_V"],
        by_zone["support:2"]["FT_V"],
        by_zone["span:2"]["FT_V"],
    ]
    np.testing.assert_allclose(b["max"]["R"], np.array(a["max"]["R"]) * expected)
    assert {z["sign"] for z in zones} == {"+", "-"}


def test_ft_snapshots_reproduce_the_envelope_and_keep_equilibrium():
    from quickerbridge.engine import snapshot, traverse

    m = live_bridge(True)
    r = analyse(m)
    for e in r["extrema"]:
        s = snapshot(m, e, e["index"], e["sense"])
        i = e["index"] % len(r["x"])
        assert s[e["response"]][i] == pytest.approx(e["value"], abs=1e-7)
        assert abs(s["equilibrium"]["force"]) < 1e-6
    frames = traverse(m, "forward", 12)["frames"]
    assert len(frames) == 12
    # Displayed axle loads stay the physical ones (no FT on the arrows).
    loads = [a["load"] for f in frames for a in f["axles"]]
    assert max(loads) == pytest.approx(200 * 1.25)  # CL-750-QC axle 4 × DLA


def test_ft_replaces_the_manual_axle_factor():
    a = live_bridge(True)
    b = live_bridge(True)
    b.live.axle_factor = 3.0
    np.testing.assert_allclose(analyse(a)["max"]["M"], analyse(b)["max"]["M"])


def test_browser_action_and_excel_sheet():
    m = bridge()
    out = json.loads(
        dispatch(
            json.dumps({"action": "axle_factor", "data": {"model": m.model_dump()}})
        )
    )
    assert len(out["zones"]) == 3
    assert pick(out, "ULS", "interior", "moment", "+", "span:1")["FT"] == pytest.approx(
        0.912, abs=0.001
    )
    wb = load_workbook(BytesIO(excel_bytes(analyse(m), "fr", m)))
    sheet = wb["Facteur d'essieu FT"]
    assert sheet.max_row > 20 and sheet["N1"].value == "FT"


def test_nebt_concrete_modulus_from_fc_and_unit_weight():
    # v0.9.8: f'c 50 MPa and 24.5 kN/m³ by default; E follows them.
    from quickerbridge.models import concrete_modulus

    s = Section(kind="nebt")
    assert (s.stiffness_input, s.fc, s.unit_weight) == ("concrete", 50, 24.5)
    assert s.E == pytest.approx(concrete_modulus(50, 24.5) / 1000)
    assert s.E == pytest.approx(34.2103, abs=1e-3)
    # Projects saved with an explicit E keep it.
    assert Section(kind="nebt", E=28).E == 28


# --- v0.9.2 ------------------------------------------------------------------


def test_classes_c_and_d_table_a5_3_3():
    le = 20.0
    r = math.sqrt(le + 5)
    cd = lambda *a: D.coefficients(*a, road_class="CD")
    # ULS/SLS1, interior moment: n = 2 and n = 3 rows, with their floors.
    assert cd("ULS", "interior", "moment", 2, le)[0] == pytest.approx(4.80 - 5.60 / r)
    assert cd("ULS", "interior", "moment", 3, le)[0] == pytest.approx(4.50 - 5.30 / r)
    assert cd("ULS", "interior", "moment", 2, 3)[0] == 2.90
    assert cd("ULS", "interior", "moment", 3, 3)[0] == 3.15
    assert cd("ULS", "interior", "moment", 1, le) == D.coefficients(
        "ULS", "interior", "moment", 1, le
    )
    # Exterior moment n = 3 and shear n = 2, 3.
    assert cd("ULS", "exterior", "moment", 3, le) == (
        pytest.approx(3.80 + le / 475),
        pytest.approx(0.10 - 0.25 / le),
    )
    assert cd("ULS", "exterior", "moment", 2, le)[0] == pytest.approx(3.40 + le / 500)
    assert cd("ULS", "interior", "shear", 2, le) == (3.55, 0.0)
    assert cd("ULS", "interior", "shear", 3, le) == (3.55, 0.0)
    # SLS2/FLS rows equal Table 5.3 for n ≤ 3; more lanes use the n = 3 row.
    for n in (1, 2, 3):
        for girder in ("interior", "exterior"):
            assert cd("FLS", girder, "moment", n, le) == D.coefficients(
                "FLS", girder, "moment", n, le
            )
    assert cd("FLS", "interior", "moment", 5, le) == D.coefficients(
        "FLS", "interior", "moment", 3, le
    )
    m = bridge(road_class="CD")
    assert "cd_lanes" in D.truck_fraction(m)["warnings"]  # Wc = 18.8 m: n = 5


def test_default_ft_parameters_and_dve_cap():
    d = Model().distribution
    assert (d.girders, d.spacing, d.overhang, d.carriageway, d.skew) == (
        5,
        3.11,
        1.555,
        10.4,
        8.5,
    )
    assert (d.road_class, d.girder, d.state) == ("AB", "interior", "ULS")
    m = Model.model_validate({"distribution": {"enabled": True}})
    r = D.truck_fraction(m)
    assert r["derived"]["n"] == 3 and r["derived"]["DVE"] == 3.0
    assert "dve_capped" in r["warnings"]


def test_default_application_model():
    from quickerbridge.models import default_model

    m = default_model()
    # v0.9.6: no axle factor by default; the user enables it.
    assert m.nonprismatic and not m.distribution.enabled and not m.distribution.apply
    assert m.sections[1].depth > m.sections[0].depth
    first, second = m.spans
    # S2 only over the pier, parabolic, plates from the deeper section.
    assert [z.end for z in first.zones] == [0.8, 1.0]
    assert first.zones[0].section == 0 and first.zones[0].profile == "constant"
    assert (first.zones[1].end_section, first.zones[1].profile) == (1, "parabolic")
    assert (second.zones[0].section, second.zones[0].plates) == (1, "deep")
    assert second.zones[-1].section == 0  # abutment keeps S1
    r = analyse(m)
    assert r["ft"] is None and r["kind"] == "mechanical"


def test_exterior_girder_dead_load_shear_takes_fs():
    base = bridge(skew=30).model_dump()
    base["load_mode"] = "dead"
    interior = Model.model_validate(base)
    interior.distribution.apply = True
    exterior = interior.model_copy(deep=True)
    exterior.distribution.girder = "exterior"
    plain = Model.model_validate(base)
    a, i, e = analyse(plain), analyse(interior), analyse(exterior)
    np.testing.assert_allclose(i["max"]["V"], a["max"]["V"])
    _, _, fs = D.station_factors(exterior, a["x"], a["sides"])
    np.testing.assert_allclose(e["max"]["V"], np.array(a["max"]["V"]) * fs)
    np.testing.assert_allclose(e["max"]["M"], a["max"]["M"])
    assert min(fs) > 1
    # Dead-load reactions of the exterior girder take Fs as well.
    span_fs = [s["Fs"] for s in D.truck_fraction(exterior)["derived"]["spans"]]
    np.testing.assert_allclose(
        e["max"]["R"], np.array(a["max"]["R"]) * [span_fs[0], max(span_fs), span_fs[1]]
    )
    np.testing.assert_allclose(i["max"]["R"], a["max"]["R"])


# --- v0.9.3: slab and voided-slab bridges --------------------------------------


def slab(bridge_type="slab", lengths=(20.0,), **distribution):
    data = {
        "enabled": True,
        "bridge_type": bridge_type,
        "slab_width": 12.0,
        "carriageway": 10.4,
        "skew": 0,
        **distribution,
    }
    return Model.model_validate(
        {
            "spans": [{"length": L} for L in lengths],
            "supports": ["pin"] + ["roller"] * len(lengths),
            "distribution": data,
        }
    )


def test_slab_ft_hand_calculation():
    r = D.truck_fraction(slab())
    d = r["derived"]
    assert (d["n"], d["RL"], d["B"], d["Be"]) == (3, 0.8, 12.0, 12.0)
    mu = (10.4 / 3 - 3.3) / 0.6
    m = pick(r, "ULS", "interior", "moment", "+", "span:1")
    assert m["DT"] == pytest.approx(4.50 - 4.5 / 20)
    assert m["lambda"] == pytest.approx(0.15 - 0.30 / 20)
    assert m["FT"] == pytest.approx(12 / (12 * 4.275 * (1 + mu * 0.135)))
    v = pick(r, "ULS", "interior", "shear", "+", "span:1")
    assert v["DT"] == pytest.approx(2.35 + 0.35 * math.sqrt(20)) and v["lambda"] == 0
    f = pick(r, "FLS", "interior", "shear", "+", "span:1")
    assert f["DT"] == pytest.approx(3.20 + 0.10 * 20)  # Table 5.2 (classes A, B)
    fm = pick(r, "FLS", "exterior", "moment", "+", "span:1")
    assert fm["DT"] == pytest.approx(11.0 - 14.5 / math.sqrt(20))
    assert fm["lambda"] == pytest.approx(0.15 - 0.40 / 20)
    # Interior and exterior portions share the tables; no γc / γe.
    assert fm["FT"] == pick(r, "FLS", "interior", "moment", "+", "span:1")["FT"]
    assert d["minimum"] == {
        "ULS": pytest.approx(1.05 * 3 * 0.8 / 12),
        "FLS": pytest.approx(1.05 / 12),
    }


def test_slab_equivalent_width_and_floor():
    wide = D.truck_fraction(slab(equivalent_width=10.0))
    base = D.truck_fraction(slab())
    a = pick(wide, "ULS", "interior", "moment", "+", "span:1")
    b = pick(base, "ULS", "interior", "moment", "+", "span:1")
    assert a["FT"] == pytest.approx(b["FT"] * 12 / 10)
    assert wide["derived"]["minimum"]["ULS"] == pytest.approx(1.05 * 3 * 0.8 / 10)
    assert (
        "equivalent_width" in D.truck_fraction(slab(equivalent_width=13.0))["warnings"]
    )
    assert "slab_width" in D.truck_fraction(slab(slab_width=9.0))["warnings"]


def test_slab_tables_branches():
    le = 16.0
    assert D.slab_moment("ULS", 1, le) == (
        pytest.approx(4.20 - 1 / le),
        pytest.approx(0.15 - 0.3 / le),
    )
    assert D.slab_moment("ULS", 2, le)[0] == pytest.approx(4.15 - 3 / le)
    assert D.slab_moment("ULS", 2, 1.2)[0] == 3.00
    assert D.slab_moment("ULS", 4, le)[0] == pytest.approx(5.10 - 7 / le)
    assert D.slab_moment("FLS", 2, le)[0] == pytest.approx(7.0 - 12 / le)
    assert D.slab_moment("FLS", 5, le)[0] == pytest.approx(
        15.0 - 31 / math.sqrt(le + 4)
    )
    # Classes C and D (Table A5.3.1): n = 2 and 3, more lanes use n = 3.
    assert D.slab_moment("ULS", 2, le, "CD")[0] == pytest.approx(4.35 - 3.15 / le)
    assert D.slab_moment("ULS", 3, le, "CD")[0] == pytest.approx(5.15 - 5.15 / le)
    assert D.slab_moment("ULS", 3, 3, "CD")[0] == 3.55
    assert D.slab_moment("FLS", 5, le, "CD") == D.slab_moment("FLS", 3, le)
    # Shear (Tables 5.2 / A5.3.2).
    assert D.slab_shear("ULS", 2, le, False, 3, "CD")[0] == pytest.approx(
        2.45 + 0.40 * 4
    )
    assert D.slab_shear("ULS", 1, le, True, 3) == (3.60, 0.0)
    assert D.slab_shear("ULS", 2, le, True, 3) == (3.50, 0.0)
    assert D.slab_shear("ULS", 2, le, True, 3, "CD") == (3.70, 0.0)
    assert D.slab_shear("FLS", 3, le, True, 3) == (3.60, 0.0)
    # Voided slab, web lines closer than 2.0 m: DT × (S/2)^0.25.
    assert D.slab_shear("ULS", 2, le, True, 1.0)[0] == pytest.approx(3.50 * 0.5**0.25)


def test_slab_skew_factor_on_exterior_dead_load():
    assert D.slab_skew_factor(30, False) == pytest.approx(
        1 + math.sin(math.radians(50))
    )
    assert D.slab_skew_factor(30, True) == pytest.approx(
        1 + 0.5 * math.sin(math.radians(50))
    )
    assert D.slab_skew_factor(4, False) == 1.0  # sin(−2°) < 0: floor 1.0
    simple = D.truck_fraction(slab(skew=30))
    cont = D.truck_fraction(slab(skew=30, lengths=(15.0, 15.0)))
    assert simple["derived"]["spans"][0]["Fs"] == pytest.approx(1.766, abs=1e-3)
    assert cont["derived"]["spans"][0]["Fs"] == pytest.approx(1.383, abs=1e-3)
    # v0.9.5: Fs on the exterior-portion live-load shear too (and dead loads).
    row = pick(simple, "ULS", "exterior", "shear", "+", "span:1")
    assert row["FT_Fs"] == pytest.approx(row["FT"] * 1.766, rel=1e-3)
    inner = pick(simple, "ULS", "interior", "shear", "+", "span:1")
    assert inner["FT_Fs"] == inner["FT"]
    assert pick(simple, "ULS", "exterior", "moment", "+", "span:1")["Fs"] == 1.0
    ext = D.truck_fraction(slab(skew=30, girder="exterior"))
    assert ext["zones"][0]["FT_V"] == pytest.approx(row["FT_Fs"])
    assert simple["zones"][0]["FT_V"] == pytest.approx(inner["FT"])
    m = slab(skew=30)
    m.load_mode = "dead"
    m.distribution.apply = True
    m.distribution.girder = "exterior"
    plain = m.model_copy(deep=True)
    plain.distribution.apply = False
    a, e = analyse(plain), analyse(m)
    np.testing.assert_allclose(
        e["max"]["V"], np.array(a["max"]["V"]) * 1.766, rtol=1e-3
    )


def test_slab_ft_applied_per_metre():
    m = slab(lengths=(15.0, 15.0))
    m.load_mode = "live"
    off = m.model_copy(deep=True)
    m.distribution.apply = True
    a, b = analyse(off), analyse(m)
    _, fm, _ = D.station_factors(m, a["x"], a["sides"])
    np.testing.assert_allclose(b["max"]["M"], np.array(a["max"]["M"]) * fm)
    assert {z["sign"] for z in b["ft"]["zones"]} == {"+", "-"}


def test_slab_excel_sheet():
    m = slab(lengths=(15.0, 15.0))
    wb = load_workbook(BytesIO(excel_bytes(analyse(m), "en", m)))
    values = [c.value for c in wb["Truck fraction FT"]["A"]]
    assert "Be (m)" in values and "DVE (m)" not in values
