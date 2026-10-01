import os

import pytest

# Run the whole suite as the browser build does:
#   QB_MPL_STUB=1   -> matplotlib replaced by a stub
#   QB_SCIPY_LITE=1 -> SciPy replaced by quickerbridge._scipy_lite
if os.environ.get("QB_MPL_STUB"):
    from quickerbridge import _mpl_stub

    _mpl_stub.install(force=True)
if os.environ.get("QB_SCIPY_LITE"):
    from quickerbridge import _scipy_lite

    _scipy_lite.install(force=True)


# v0.8.6 adds the girder self-weight to the permanent loads by default. The
# suites written before it check closed-form results of the user loads (and
# modal masses) alone, so they run without the automatic self-weight. The
# self-weight itself is verified in test_v086.py, which keeps the default.
@pytest.fixture(autouse=True)
def _user_loads_only_before_v086(request, monkeypatch):
    if request.module.__name__.rsplit(".", 1)[-1] in ("test_v086",):
        return
    import quickerbridge.loads as loads
    import quickerbridge.modal as modal

    monkeypatch.setattr(loads, "self_weight_intervals", lambda *a, **k: [])
    monkeypatch.setattr(modal, "self_weight_intervals", lambda *a, **k: [])
