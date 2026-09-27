# Validation — QuickerBridge v0.4

2026-09-15. Numerical checks are software regressions, not certification for bridge design.

## Tests executed

- Application suite: **45 passed**.
- Application + vendored non-prismatic suite: **94 passed**.
- Full vendored PyCBA suite: **362 passed, 4 skipped**. The 49 non-prismatic tests
  above are included in this total, not additional tests.
- Black formatting and JavaScript syntax checks completed.
- Two existing project examples and the new 2 × 34.8 m reference example validate.

The regressions cover rectangle, symmetric and asymmetric steel-section inertia;
analytical simple-span and continuous-beam responses; thermal signs, reversal and
isolation; non-prismatic comparison with refined constant-EI meshes; truck factors;
project validation; depth-only interpolation, plate steps, effective inertia and
cache invalidation; dead/live/axle factors; maintenance-vehicle definition;
full-deck Canadian lane loads; and mirrored travel grids. The modified PyCBA integration also passes constant-section
limits for UDL, point, partial UDL, moment and trapezoidal loads with end releases.

M = 4 retains gross steel I, A and centroid, quadruples EI and divides a simple-span
load deflection by four. Direct EI is unchanged. Cached matrices are scoped to one
immutable Basis; fixed-end-force caches are cleared for every new load matrix.

## CL-750QC and symmetry investigation

The MTQ A2023-05 truck diagram was checked visually: axle loads are 50, 160, 160,
200 and 180 kN at gaps 3.6, 1.2, 6.6 and 6.6 m. Its 12.6 kN/m companion load is
now applied over the full bridge with the complete reduced truck. Axle subsets remain
available only to the truck-only S6 dynamic-allowance checks.

Against direct PyCBA at 0.1 m travel spacing on the default 2 × 34.8 m bridge,
QuickerBridge/PyCBA maximum moments were 4578.591/4578.399 kN·m for the ×1.25
truck and 4002.012/4001.471 kN·m for the 80% truck plus lane load. Minimum moments
matched to displayed precision (-2737.548 and -3659.419 kN·m respectively).

The default standard live-load envelope is mirror-symmetric within 7e-12 kN·m for
moment and 3e-13 mm for deflection. A single non-prismatic thermal span and mirrored
two-span tapers are also symmetric within numerical precision. Repeating the same
shallow-to-deep taper direction on both spans is not a mirrored stiffness model and
correctly gives an asymmetric response.

## Performance investigation

The previous non-prismatic implementation used 2001 Simpson stations **per EI
piece**, repeatedly rebuilt member stiffness, and scanned all EI pieces for each
query. A three-zone span with two tapers produces 65 pieces in Standard mode.
This explains the reported long first geometry calculation after engine startup.

`tests/performance.py` uses two 30 m spans, 1200/1800 mm heights, two parabolic
zones plus a constant zone in each span, and identical plates. Each span retains
107 unit-load locations. On the development machine, separate native runs measured:

| Wrapper / integration | Influence-basis build |
| --- | --- |
| Previous v0.3 | 252.12 s |
| Corrected v0.4 | 0.58 s |

These single measurements occurred during development and are not controlled
hardware benchmarks or guaranteed browser times. They exclude runtime downloads
and subsequent truck-envelope traversal. An earlier instrumented baseline was
80.8 s, demonstrating the variability; do not advertise a fixed speedup ratio.

The app now caches member stiffness, vectorizes EI lookup and integrates fixed-end
forces with converged Gaussian quadrature, splitting at EI and load discontinuities.
Endpoint sentinels preserve PyCBA load-result conventions. A quad_vec fallback
handles cases not converged at the tested Gauss orders. The EI piece count, influence
sample count and downstream diagram integration resolution are unchanged.

At four test axle coordinates, maximum absolute old/new differences normalized by
the maximum new magnitude **within each response family** were V 0.0021%,
M 0.0098%, deflection 0.0088%, R 0.0040%. Differences include correction of endpoint
handling in the old piece-by-piece load integration. This comparison is not a
universal error bound; the independent regressions provide the accuracy checks.
The raw timing outputs are retained privately in `ref/source/tmp/timing-v03.json`
and `timing-v04-final.json`.

## Browser verification

The rebuilt static site was exercised in the Codex in-app browser over a temporary
loopback preview. Verified: French initial display, v0.4 author/date, 2 × 34.8 m,
CL-750QC, 1200 mm girder and revised plates, both thick envelope boundaries, English
translation, and M = 4 changing EI to 9,604,285 kN·m². The corresponding maximum
load deflection changed from 239.61 to 59.90 mm.

The first completed default calculation displayed 7.97 s. Switching to the generated
two-span non-prismatic model completed in 7.96 s, excluding runtime initialization.
This is one browser/hardware observation. The first-zone parabolic depth option was
also exercised. The download of Excel was not retested; Anthony previously confirmed
that it works. Backend workbook regressions remain in the application suite.

Double-click/file-URL launching remains a manual target-browser check because the
automation environment blocks file-URL navigation. The portable build embeds the same
UI, worker and Python sources as the tested static page. Internet is still required
for runtime libraries; a guaranteed offline distribution has not been built.

## Reproduce locally

From the source checkout, after installing requirements:

```powershell
$env:MPLCONFIGDIR = './tmp/mpl'
.venv/Scripts/python.exe -m pytest tests vendor/pycba/tests/test_nonprismatic.py -q
.venv/Scripts/python.exe -m black --check quickerbridge tests build_portable.py launch.py
.venv/Scripts/python.exe tests/performance.py
.venv/Scripts/python.exe build_portable.py
```

Open the generated HTML, check FR/EN and a representative non-prismatic model,
inspect nominal axle labels and both min/max curves, then save and reopen a project.
For public hosting, verify the deployed GitHub Pages URL after its workflow completes.
No GitHub repository or website was published by this task.

## v0.5 additions (2026-09-27)

Full suites: **application 72 passed**; application + vendored PyCBA **437 passed,
1 skipped**. New regressions in `tests/test_audit_2026_09.py` and `tests/test_v05.py`:

- Fixed (integral) abutments against closed forms: fixed–fixed UDL (end −wL²/12,
  midspan wL²/24, δ = wL⁴/384EI, Mr = ±wL²/12), propped cantilever (−wL²/8, 5wL/8,
  3wL/8), fixed–fixed unit-load influence lines (−ab²/L², R = b²(L+2a)/L³), vertical
  and moment equilibrium of every unit load including moment reactions, M(L) = Mr(L),
  mirror symmetry of a fixed–pin–fixed bridge, reduced sagging and deflection versus
  pinned abutments, snapshot equilibrium, and thermal fixed–fixed (uniform M = −EIκ,
  zero deflection and vertical reactions).
- Plate-source option: Deeper/Deeper and End/Start give mirrored EI(x) and envelopes;
  Start/Start keeps the v0.4 asymmetric interpretation; flange fit validated with the
  chosen plates. Schema 3 projects round-trip; schema 2 files open unchanged.
- Influence lines equal the cached unit-load basis, satisfy Maxwell–Betti reciprocity,
  and Σ η·P of the governing axles reproduces the envelope value. Traverse frames equal
  individual snapshots (forward and reverse); lane cases include the full-deck UDL.
- v0.4.1 audit fixes: influence-spline twin knots (equilibrium), refined non-prismatic
  deflection integration, and the related UI input fixes.

## v0.6 additions (2026-09-27)

Application suite **86 passed**; with vendored PyCBA **451 passed, 1 skipped**.
`tests/test_v06.py` checks rotational-spring supports against the compatibility
closed form M = θ₀ / (L/3EI + 1/k) (spring + pin, five stiffnesses) and
M = θ₀ / (L/2EI + 1/k) (two springs); limits k → 0 (pinned) and k → ∞ (fixed);
vertical/moment equilibrium of every unit load; mirror symmetry; snapshot
equilibrium; an interior spring; thermal curvature with springs (uniform
M = −κL/2 / (L/2EI + 1/k), between pinned and fixed); validation, project
round-trip and the Excel spring label. Fixity is reported as k / (k + Σ3EI/L).
The opening animation solves a 3-span beam with the three-moment equation in
JavaScript; it is illustrative and never feeds the analysis.

## v0.6.1 start-up robustness (2026-09-27)

Every engine boot attempt runs in a fresh Web Worker watched by a stall timer
(90 s without progress). A failed or stalled attempt is terminated and retried
automatically, up to 4 attempts; the loading screen shows "retrying n/4" and,
after the last attempt, an explicit error with the blocked stage, library and
host, network advice and a Retry button. Pyodide's `loadPackage` errors are
collected and the imports are verified, so a silently failed wheel can no longer
leave the application hanging. Excel (openpyxl from PyPI) is optional: if it
cannot be installed the analysis still starts and the Excel button explains why.

Browser scenarios checked with a mocked Pyodide (Playwright): pyodide.js refused
(error after 3 attempts), SciPy failing three times then succeeding on the fourth
attempt (application starts), pyodide.js stalled (watchdog, error "download
stalled"), package loading stalled once (automatic recovery), SciPy failing every
time (error naming scipy and cdn.jsdelivr.net), and openpyxl unavailable (analysis
runs, Excel explains). With the real CDN blocked, the error appears after 4 attempts
in about 9 s. Application suite: 87 passed.

## v0.7 start-up time (2026-09-27)

Measured in headless Chromium with the real Pyodide 0.27.7 distribution served locally
(no network latency; slower CPU than a typical PC), default model:

| Milestone | v0.6.1 | v0.7 |
| --- | --- | --- |
| Results visible | 16.4 s | ≈ 3.5 s (end of the 3 s intro; pre-computed) |
| Engine ready | 13.9 s | 5.8 s |
| Live analysis done | 16.3 s | 7.9 s |
| Runtime downloaded | ≈ 40 MB | ≈ 16 MB (core + NumPy + pydantic) |

Changes: the default result is computed at build time (`dist/default-result.js`) and
recomputed silently once the engine is ready; SciPy (13.5 MB, ≈ 3 s of loading and
import) is replaced by `quickerbridge/_scipy_lite.py`; matplotlib and its dependencies
(≈ 11 MB) by `_mpl_stub.py`; openpyxl is installed on the first Excel export; wheel
downloads start in parallel with the Python runtime; the intro always lasts about 3 s. `tests/test_scipy_lite.py` compares every replacement with
SciPy (CubicSpline 2–97 knots, cumulative_trapezoid, simpson odd/even, quad_vec with
breakpoints, generalized eigh) and the full application suite passes in the browser
configuration (`QB_MPL_STUB=1 QB_SCIPY_LITE=1`, also run in CI). Totals: 468 passed and
1 skipped natively; 87 passed and 1 skipped in the browser configuration.
