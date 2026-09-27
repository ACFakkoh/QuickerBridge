"""The NumPy-only SciPy subset used by the browser build equals SciPy."""

import numpy as np
import pytest

from quickerbridge import _scipy_lite as lite

scipy = pytest.importorskip("scipy")
if getattr(scipy, "__quickerbridge_lite__", False):
    pytest.skip("comparison needs the real SciPy", allow_module_level=True)
from scipy import integrate, interpolate, linalg  # noqa: E402

rng = np.random.default_rng(7)


@pytest.mark.parametrize("n", [2, 3, 4, 5, 49, 97])
def test_cubic_spline_matches_scipy(n):
    x = np.sort(rng.uniform(0, 30, n))
    x[0], x[-1] = 0, 30
    y = rng.normal(size=(n, 7))
    q = np.linspace(-1, 31, 777)
    ref = interpolate.CubicSpline(x, y, axis=0)(q)
    np.testing.assert_allclose(
        lite.CubicSpline(x, y, axis=0)(q), ref, rtol=1e-9, atol=1e-9
    )
    # 1-D data and scalar queries behave like SciPy too.
    np.testing.assert_allclose(
        lite.CubicSpline(x, y[:, 0])(12.3), interpolate.CubicSpline(x, y[:, 0])(12.3)
    )


def test_cumulative_trapezoid_matches_scipy():
    x = np.sort(rng.uniform(0, 5, 41))
    y = rng.normal(size=(3, 41))
    for kw in ({"x": x}, {"dx": 0.3}):
        for initial in (None, 0):
            np.testing.assert_allclose(
                lite.cumulative_trapezoid(y, initial=initial, **kw),
                integrate.cumulative_trapezoid(y, initial=initial, **kw),
            )


@pytest.mark.parametrize("n", [2, 3, 4, 11, 12, 101, 102])
def test_simpson_matches_scipy(n):
    x = np.sort(rng.uniform(0, 5, n))
    y = rng.normal(size=(2, n))
    np.testing.assert_allclose(
        lite.simpson(y, x=x), integrate.simpson(y, x=x), rtol=1e-10
    )
    np.testing.assert_allclose(
        lite.simpson(y[0], dx=0.2), integrate.simpson(y[0], dx=0.2), rtol=1e-10
    )


def test_quad_vec_matches_scipy_with_breakpoints():
    def f(t):
        step = 1.0 if t < 3.3 else 4.0
        return np.array([np.sin(3 * t) / step, t**2 * np.exp(-t) / step])

    ours, err, info = lite.quad_vec(
        f, 0, 10, points=[3.3], epsabs=1e-14, epsrel=1e-10, full_output=True
    )
    ref = integrate.quad_vec(f, 0, 10, points=[3.3], epsabs=1e-14, epsrel=1e-10)[0]
    assert info.success
    np.testing.assert_allclose(ours, ref, rtol=1e-9)


def test_generalized_eigh_matches_scipy():
    a = rng.normal(size=(6, 6))
    a = a @ a.T
    b = rng.normal(size=(6, 6))
    b = b @ b.T + 6 * np.eye(6)
    np.testing.assert_allclose(lite.eigh(a, b)[0], linalg.eigh(a, b)[0], rtol=1e-9)
