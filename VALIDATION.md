# Validation — QuickerBridge v0.4

2026-09-12. Numerical checks are software regressions, not certification for bridge design.

## Tests executed

- Application suite: **39 passed**.
- Application + vendored non-prismatic suite: **88 passed**.
- Full vendored PyCBA suite: **362 passed, 4 skipped**. The 49 non-prismatic tests
  above are included in this total, not additional tests.
- Black formatting and JavaScript syntax checks completed.
- Two existing project examples and the new 2 × 34.8 m reference example validate.

The regressions cover rectangle, symmetric and asymmetric steel-section inertia;
analytical simple-span and continuous-beam responses; thermal signs, reversal and
isolation; non-prismatic comparison with refined constant-EI meshes; truck factors;
project validation; depth-only interpolation, plate steps, effective inertia and
cache invalidation. The modified PyCBA integration also passes constant-section
limits for UDL, point, partial UDL, moment and trapezoidal loads with end releases.

M = 4 retains gross steel I, A and centroid, quadruples EI and divides a simple-span
load deflection by four. Direct EI is unchanged. Cached matrices are scoped to one
immutable Basis; fixed-end-force caches are cleared for every new load matrix.

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
