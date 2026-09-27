"""NumPy-only replacements for the few SciPy routines QuickerBridge needs.

The browser build skips the 13.5 MB SciPy wheel (about 3 s of download,
WebAssembly compilation and import on a typical PC). QuickerBridge and PyCBA
only use:

* ``scipy.interpolate.CubicSpline`` (not-a-knot, ``axis=0``), for influence
  interpolation;
* ``scipy.integrate.cumulative_trapezoid``, ``simpson`` and ``quad_vec``;
* ``scipy.linalg.eigh`` (PyCBA modal analysis, unused by QuickerBridge).

``install()`` registers these as ``scipy``, ``scipy.integrate``,
``scipy.interpolate`` and ``scipy.linalg`` only when the real SciPy is not
importable. The native test suite runs against both implementations
(``QB_SCIPY_LITE=1``) to prove they give the same results.
"""

from types import SimpleNamespace, ModuleType
import importlib.util
import sys

import numpy as np


# ------------------------------------------------------------- interpolate
class CubicSpline:
    """Not-a-knot cubic spline through ``(x, y)`` along ``axis=0``."""

    def __init__(self, x, y, axis=0, bc_type="not-a-knot", extrapolate=True):
        if axis != 0 or bc_type != "not-a-knot":
            raise NotImplementedError("CubicSpline lite: axis=0, not-a-knot only")
        x = np.asarray(x, float)
        y = np.asarray(y, float)
        if x.ndim != 1 or len(x) < 2 or len(x) != len(y):
            raise ValueError("CubicSpline lite: invalid data")
        h = np.diff(x)
        if np.any(h <= 0):
            raise ValueError("`x` must be strictly increasing sequence.")
        n = len(x)
        shape = y.shape[1:]
        yy = y.reshape(n, -1)
        slope = np.diff(yy, axis=0) / h[:, None]
        if n == 2:
            m = np.zeros((2, yy.shape[1]))
        elif n == 3:
            # Not-a-knot with three points is the single interpolating parabola.
            c2 = (slope[1] - slope[0]) / (x[2] - x[0])
            m = np.repeat((2 * c2)[None, :], 3, axis=0)
        else:
            a = np.zeros((n, n))
            b = np.zeros((n, yy.shape[1]))
            for i in range(1, n - 1):
                a[i, i - 1] = h[i - 1]
                a[i, i] = 2 * (h[i - 1] + h[i])
                a[i, i + 1] = h[i]
                b[i] = 6 * (slope[i] - slope[i - 1])
            # Continuous third derivative at the second and penultimate knots.
            a[0, :3] = [h[1], -(h[0] + h[1]), h[0]]
            a[-1, -3:] = [h[-1], -(h[-2] + h[-1]), h[-2]]
            m = np.linalg.solve(a, b)
        self.x, self._y, self._m, self._h, self._shape = x, yy, m, h, shape

    def __call__(self, xq):
        xq = np.asarray(xq, float)
        flat = np.atleast_1d(xq).ravel()
        x, y, m, h = self.x, self._y, self._m, self._h
        i = np.clip(np.searchsorted(x, flat, side="right") - 1, 0, len(x) - 2)
        hi = h[i][:, None]
        a = (x[i + 1][:, None] - flat[:, None]) / hi
        b = (flat[:, None] - x[i][:, None]) / hi
        out = (
            a * y[i]
            + b * y[i + 1]
            + ((a**3 - a) * m[i] + (b**3 - b) * m[i + 1]) * hi**2 / 6
        )
        return out.reshape(xq.shape + self._shape)


# --------------------------------------------------------------- integrate
def cumulative_trapezoid(y, x=None, dx=1.0, axis=-1, initial=None):
    y = np.asarray(y, float)
    y = np.moveaxis(y, axis, -1)
    if x is None:
        d = dx
    else:
        x = np.asarray(x, float)
        d = np.diff(x) if x.ndim == 1 else np.diff(np.moveaxis(x, axis, -1))
    res = np.cumsum(d * (y[..., 1:] + y[..., :-1]) / 2.0, axis=-1)
    if initial is not None:
        if initial != 0:
            raise ValueError("`initial` must be `None` or `0`.")
        res = np.concatenate([np.zeros(res.shape[:-1] + (1,)), res], axis=-1)
    return np.moveaxis(res, -1, axis)


def _basic_simpson(y, h):
    h0, h1 = h[0:-1:2], h[1::2]
    hsum, hprod, hq = h0 + h1, h0 * h1, h0 / h1
    return np.sum(
        hsum
        / 6.0
        * (
            y[..., 0:-2:2] * (2.0 - 1.0 / hq)
            + y[..., 1:-1:2] * (hsum * hsum / hprod)
            + y[..., 2::2] * (2.0 - hq)
        ),
        axis=-1,
    )


def simpson(y, *, x=None, dx=1.0, axis=-1):
    """Composite Simpson rule matching SciPy >= 1.11 (Cartwright end fix)."""
    y = np.moveaxis(np.asarray(y, float), axis, -1)
    n = y.shape[-1]
    h = np.full(n - 1, float(dx)) if x is None else np.diff(np.asarray(x, float))
    if n == 1:
        return np.zeros(y.shape[:-1])
    if n == 2:
        return h[0] * (y[..., 0] + y[..., 1]) / 2.0
    if n % 2:
        return _basic_simpson(y, h)
    result = _basic_simpson(y[..., :-1], h[:-1])
    h1, h2 = h[-1], h[-2]
    alpha = (2 * h1**2 + 3 * h1 * h2) / (6 * (h2 + h1))
    beta = (h1**2 + 3 * h1 * h2) / (6 * h2)
    eta = h1**3 / (6 * h2 * (h2 + h1))
    return result + alpha * y[..., -1] + beta * y[..., -2] - eta * y[..., -3]


_GK_X = np.array(
    [
        0.995657163025808080735527280689003,
        0.973906528517171720077964012084452,
        0.930157491355708226001207180059508,
        0.865063366688984510732096688423493,
        0.780817726586416897063717578345042,
        0.679409568299024406234327365114874,
        0.562757134668604683339000099272694,
        0.433395394129247190799265943165784,
        0.294392862701460198131126603103866,
        0.148874338981631210884826001129720,
        0.0,
    ]
)
_GK_WK = np.array(
    [
        0.011694638867371874278064396062192,
        0.032558162307964727478818972459390,
        0.054755896574351996031381300244580,
        0.075039674810919952767043140916190,
        0.093125454583697605535065465083366,
        0.109387158802297641899210590325805,
        0.123491976262065851077958109831074,
        0.134709217311473325928054001771707,
        0.142775938577060080797094273138717,
        0.147739104901338491374841515972068,
        0.149445554002916905664936468389821,
    ]
)
_GK_WG = np.array(
    [
        0.066671344308688137593568809893332,
        0.149451349150580593145776339657697,
        0.219086362515982043995534934228163,
        0.269266719309996355091226921569469,
        0.295524224714752870173892994651338,
    ]
)
_NODES = np.r_[-_GK_X[:-1], _GK_X[::-1]]
_WK = np.r_[_GK_WK[:-1], _GK_WK[::-1]]
_WG = np.zeros(21)
_WG[[1, 3, 5, 7, 9, 11, 13, 15, 17, 19]] = np.r_[_GK_WG, _GK_WG[::-1]]


def quad_vec(
    f, a, b, epsabs=1e-200, epsrel=1e-8, points=(), limit=10000, full_output=False, **_
):
    """Adaptive Gauss–Kronrod (21-point) integration of a vector function."""

    def rule(lo, hi):
        mid, half = (lo + hi) / 2, (hi - lo) / 2
        values = np.array([np.asarray(f(mid + half * t), float) for t in _NODES])
        k = half * np.tensordot(_WK, values, axes=1)
        g = half * np.tensordot(_WG, values, axes=1)
        return k, float(np.max(np.abs(k - g)))

    edges = np.unique(np.r_[a, np.clip(list(points or ()), a, b), b])
    parts = [(lo, hi, *rule(lo, hi)) for lo, hi in zip(edges[:-1], edges[1:])]
    success = False
    for _ in range(limit):
        total = sum(p[2] for p in parts)
        error = sum(p[3] for p in parts)
        if error <= max(epsabs, epsrel * float(np.max(np.abs(total)))):
            success = True
            break
        worst = max(range(len(parts)), key=lambda j: parts[j][3])
        lo, hi, _, _ = parts.pop(worst)
        mid = (lo + hi) / 2
        parts += [(lo, mid, *rule(lo, mid)), (mid, hi, *rule(mid, hi))]
    total = sum(p[2] for p in parts)
    error = sum(p[3] for p in parts)
    if full_output:
        return total, error, SimpleNamespace(success=success, intervals=len(parts))
    return total, error


# ------------------------------------------------------------------ linalg
def eigh(a, b=None, **_):
    """Generalized symmetric eigenproblem via Cholesky reduction."""
    a = np.asarray(a, float)
    if b is None:
        return np.linalg.eigh(a)
    lower = np.linalg.cholesky(np.asarray(b, float))
    inv = np.linalg.inv(lower)
    w, v = np.linalg.eigh(inv @ a @ inv.T)
    return w, inv.T @ v


def install(force=False):
    """Register the lite modules as ``scipy.*`` when SciPy is unavailable."""
    if not force and importlib.util.find_spec("scipy") is not None:
        return False
    for name in [n for n in sys.modules if n.split(".")[0] == "scipy"]:
        del sys.modules[name]
    root = ModuleType("scipy")
    root.__path__ = []
    root.__version__ = "lite"
    root.__quickerbridge_lite__ = True
    modules = {
        "integrate": dict(
            cumulative_trapezoid=cumulative_trapezoid,
            simpson=simpson,
            quad_vec=quad_vec,
        ),
        "interpolate": dict(CubicSpline=CubicSpline),
        "linalg": dict(eigh=eigh),
    }
    sys.modules["scipy"] = root
    for name, members in modules.items():
        module = ModuleType(f"scipy.{name}")
        module.__dict__.update(members)
        sys.modules[f"scipy.{name}"] = module
        setattr(root, name, module)
    return True
