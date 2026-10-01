"""v0.9: CSA S6-25 truck load fraction FT for slab-on-girder bridges."""

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
    assert D.gamma_c_exterior(3, 1.4) == 1
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
    assert reopened["schema_version"] == 7
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
    fv, fm = D.station_factors(iso, [17.557, 17.557], ["left", "right"])
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
    fv, fm = D.station_factors(on, x, sides)
    if case == "truck":
        # Truck only: every V and M value is exactly the zone fraction times
        # the one-lane value; δ and reactions are unchanged.
        np.testing.assert_allclose(b["max"]["M"], np.array(a["max"]["M"]) * fm)
        np.testing.assert_allclose(b["min"]["V"], np.array(a["min"]["V"]) * fv)
    else:
        # The companion lane load is not scaled, so the result is not simply
        # the one-lane value times FT, but it does change.
        assert not np.allclose(b["max"]["M"], a["max"]["M"])
        assert not np.allclose(b["max"]["M"], np.array(a["max"]["M"]) * fm)
    np.testing.assert_allclose(b["max"]["D"], a["max"]["D"])
    np.testing.assert_allclose(b["max"]["R"], a["max"]["R"])
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


def test_nebt_concrete_default_is_28_gpa():
    assert Section(kind="nebt").E == 28
