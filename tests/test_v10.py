"""v1.0: automatic mesh (no precision setting), deck cut without the hinge
option in the interface, header and layout changes."""

from pathlib import Path
import runpy

import numpy as np
import pytest

from quickerbridge import engine
from quickerbridge.engine import analyse, mesh, structure_key
from quickerbridge.models import Model, Span

DIST = Path(__file__).resolve().parents[1] / "dist"
BUILD = runpy.run_path(str(DIST.parent / "build_portable.py"))


@pytest.mark.parametrize(
    "lengths, step",
    [([34.8, 34.8], 0.25), ([10, 10], 0.125), ([4, 30], 0.05), ([12, 40, 12], 0.15)],
)
def test_travel_step_follows_the_shortest_span(lengths, step):
    model = Model(
        spans=[Span(length=v) for v in lengths],
        supports=["roller"] + ["pin"] + ["roller"] * (len(lengths) - 1),
    )
    assert mesh(model)["step"] == pytest.approx(step)


def test_legacy_precision_is_accepted_and_ignored():
    live = {"load_mode": "live", "spans": [Span(length=10), Span(length=10)]}
    a = analyse(Model(precision="standard", **live))
    b = analyse(Model(precision="fine", **live))
    c = analyse(Model(**live))
    for key in ("M", "V", "D", "R"):
        np.testing.assert_allclose(a["max"][key], b["max"][key], rtol=0, atol=1e-9)
        np.testing.assert_allclose(c["min"][key], b["min"][key], rtol=0, atol=1e-9)
    assert c["meta"]["travel_step"] == pytest.approx(0.125)
    assert c["meta"]["mesh"]["samples"] == 48
    assert structure_key(Model(precision="fine")) == structure_key(Model())


def test_auto_mesh_is_close_to_a_much_finer_mesh():
    model = Model(spans=[Span(length=10), Span(length=10)], load_mode="live")
    auto = analyse(model)
    engine.MESH_OVERRIDE = {"step": 0.025, "samples": 96, "npts": 960, "grid": 321}
    engine.cached_basis.cache_clear()
    try:
        fine = analyse(model)
    finally:
        engine.MESH_OVERRIDE = None
        engine.cached_basis.cache_clear()
    for key in ("M", "V", "D", "R"):
        ref = np.r_[fine["min"][key], fine["max"][key]]
        val = np.r_[auto["min"][key], auto["max"][key]]
        assert np.abs(val - ref).max() <= 1e-3 * np.abs(ref).max()


def test_interface_v10():
    html = (DIST / "index.html").read_text(encoding="utf-8")
    app = "\n".join(
        (DIST / name).read_text(encoding="utf-8") for name in BUILD["APP_SCRIPTS"]
    )
    header = html[html.index('<header class="topbar">') : html.index("</header>")]
    assert 'data-i18n="brandSub"' not in header  # no "continuous beams" subtitle
    assert "https://github.com/acheruel/QuickerBridge" in header
    assert 'class="warning top-warning"' in header  # notice in the top band
    results = html[html.index('<section class="results"') :]
    assert 'class="warning"' not in results
    assert "geo-precision" not in app  # no user precision setting
    assert "jointHelp" not in app  # launching/demolition paragraph removed
    assert "['hinge',t('jointHingeShort')]" in app  # legacy projects only
    assert "const legacy=j.kind==='hinge'" in app


def test_schema_17_migration():
    import json

    from quickerbridge.projects import SCHEMA_VERSION, create_project, validate_project

    old = json.loads(json.dumps(create_project(Model(), "v0.9.99")))
    old["schema_version"] = 16
    old["model"]["precision"] = "fine"
    old["model"]["joint"] = {"enabled": True, "x": 13, "kind": "hinge", "keep": "both"}
    data = validate_project(json.dumps(old))
    assert data["schema_version"] == SCHEMA_VERSION == 17
    assert data["model"]["precision"] == "auto"
    assert data["model"]["joint"]["kind"] == "hinge"  # legacy joint kept
