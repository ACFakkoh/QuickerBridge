import os

# Run the whole suite as the browser build does:
#   QB_MPL_STUB=1   -> matplotlib replaced by a stub
#   QB_SCIPY_LITE=1 -> SciPy replaced by quickerbridge._scipy_lite
if os.environ.get("QB_MPL_STUB"):
    from quickerbridge import _mpl_stub

    _mpl_stub.install(force=True)
if os.environ.get("QB_SCIPY_LITE"):
    from quickerbridge import _scipy_lite

    _scipy_lite.install(force=True)
