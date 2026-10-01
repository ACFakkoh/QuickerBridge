# Validation — QuickerBridge (v0.4 → v0.9.4)

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

## v0.8 vibration modes and undistorted diagrams (2026-09-28)

`quickerbridge/modal.py` solves K φ = ω² M φ with Hermite Euler-Bernoulli elements and a
consistent mass matrix (the formulation of PyCBA `BeamAnalysis.modal`), extended to
EI(x) (3-point Gauss per element, mesh broken at every zone limit) and to mass defined by
intervals (unfactored permanent loads ÷ g, mesh broken at every load limit).
`tests/test_modal.py` (13 tests):

- simply supported, fixed-fixed and propped cantilever against the closed forms
  (βL = nπ, 4.7300, 7.8532, 3.9266): 1e-4 relative or better for the first 6 modes;
- default 2 × 34.8 m bridge: f1 equals the isolated simply supported span (antisymmetric),
  f2/f1 = (3.9266/π)² (symmetric);
- agrees with `pycba.BeamAnalysis.modal` (rtol 1e-8) for three unequal spans with pinned,
  fixed and rotational-spring supports;
- rotational spring k → 0 and k → ∞ recover the pinned and fixed frequencies;
- modal mass 8/π² and 8/(9π²) for a simply supported span; load factor ignored; two
  half-span loads equal one full load; a partly unloaded deck is reported;
- mirrored haunch: S/A alternation and Standard/Fine agreement to 1e-4;
- modal settings do not change the static structure cache; browser dispatch; project
  schema 4 round trip and upgrade from schema 3.

The result diagrams (V, M, δ, EI, influence lines) now use a viewBox whose height follows
the on-screen aspect ratio, so text and markers are no longer squashed; they are taller
(148 px, 124 px on short screens, 172 px on wide screens, 190 px in focus mode). Checked
in headless Chromium at 820, 1366 and 1920 px wide, FR and EN, with the engine replaced
by the native Python dispatcher.

## v0.8.5 September 29 feedback (verified 2026-09-30)

Scope: only the Notion page “QuickerBridge feedback et features 2026-09-29”.
Version retained at 0.8.5. The application suite passes natively (119 tests,
44.43 s) and with the browser replacements (103 passed, 1 skipped, 227.97 s).
Both runs report two existing FastAPI/Starlette deprecation warnings.

`tests/test_feedback_2026_09_29.py` checks:

- HL-93 supplementary 90% two-truck case: fixed 14 ft axle spacings, at least
  50 ft clear headway (the exact minimum is included in the travel search),
  adverse axle/lane loading, dynamic allowance on axles only, user factors and
  project-file round trip. Only the permitted negative moment regions and
  interior vertical reactions change; V, deflection, positive M and exterior
  reactions retain their ordinary envelopes.
- Governing snapshots reproduce their target envelope value, with force and
  moment equilibrium. For two equal 35 m spans, an independent three-moment
  calculation and a 0.05 m exhaustive truck-position search agree with the
  Standard envelope within 0.05% for pier M− and maximum interior R.
- One workbook includes static results, Δ, modal frequencies and normalized
  shapes. Modal mass/cumulative ratios are numeric percentages; modal settings
  current at export are used. A model without mass retains its static export
  and explains unavailable modes. Reference-project comparisons do not evict
  the current analysis job.

The supplementary case follows
[FHWA-HIF-16-002 Vol.20, §6.2.1, pp.18–19](https://rosap.ntl.bts.gov/view/dot/42904/dot_42904_DS1.pdf)
and uses adjacent spans as described in
[WSDOT Bridge Design Manual, §3.9.2](https://devapps.wsdot.wa.gov/publications/manuals/fulltext/M23-50/M23-50.13Complete.pdf).
Truck centres occupy adjacent spans; positions and clear headway are sampled.
Standard/Fine sensitivity remains relevant for unequal or non-prismatic spans.

Chrome checks use the real Pyodide runtime, including the portable HTML opened
directly from disk. They cover individual V/M/δ range checkboxes, EI hover,
beam/support alignment within 0.8 screen pixels at 390, 600, 1000 and 1440 px,
six default modes, real-time animation, removal of audio, Excel access in the
modal view, and FR/EN. Same-geometry and different-length JSON comparisons
preserve the current model and share an absolute metre axis; comparison text
keeps equal horizontal/vertical scale on mobile. No page errors occurred.

The first portable check exposed premature comparison-module initialization.
Initialization now waits for DOMContentLoaded so all embedded modules are ready;
the corrected portable subsequently passed the checks above. A workbook generated
by real Pyodide was reopened to verify all station Δ values, the six modal
frequencies and mass ratios against browser results, HL-93 governing records,
the shapes chart, typed percentages, frozen panes and version metadata.
Its modal table was rendered and visually inspected.

## v0.8.6 September 30 fixes and features (verified 2026-09-30)

Scope: only the Notion page "QuickerBridge fix and features 2026-09-30".
The application suite passes natively (138 tests, 46.28 s) and with the browser
replacements (122 passed, 1 skipped, 46.45 s); the vendored PyCBA suite passes
(362 passed, 4 skipped). Suites written before v0.8.6 run without the automatic
self-weight (tests/conftest.py) because they check closed-form results of the
user loads; `tests/test_v086.py` keeps the default and checks:

- NEBT 1000-1800 properties against the standard table (A, I, Yb, linear weight;
  table weights equal A x 24.5 kN/m3), concrete E default 30 GPa, constant zones only.
- Self-weight: steel A x 77 kN/m3 x 1.15 and NEBT w x 1.10 by default, editable
  allowances and load factor, switch-off, direct-EI sections without weight, linear
  taper weight equal to the mean of both ends, modal mass without the load factor
  (simple-span frequency), and pre-0.8.6 projects reopened with self-weight off.
- Simple spans: release layout keeps every node stable; two simple spans equal two
  independent beams (R, M, 5wL4/384EI) with pinned or fixed supports; a simple
  span beside a propped cantilever (M = wL2/8 at the wall); a simple middle span
  isolates its neighbours (pier M and influence lines); no thermal moment; modal
  frequencies of simple beams with pinned or fixed supports; project round trip.
- PyCBA fix: an off-centre point load on a pinned-pinned member returned
  V_ff + (Ma + Mb)/L instead of the simply-supported shears (prismatic and
  non-prismatic paths). Symmetric loads were unaffected. See
  pycba-pinned-pinned-shear.patch.

Browser check (real Pyodide, portable HTML served locally): single Δ switch draws
ΔV, ΔM, Δδ with the hover cursor and readout (Δ plus min / max); simple span shows
hinges and zero pier moment; NEBT 1800 card, outline and properties; self-weight
card and deck band; modes, thermal, snapshot equilibrium, influence lines, traverse
and Excel export through the worker; FR/EN; no page errors.

## v0.9 S6-25 truck load fraction FT, concrete E, Δ switch (2026-09-30)

Scope: Notion page "Module facteur d'essieu 2026-09-30" (slab-on-girder bridges,
classes A and B) plus two requests: NEBT concrete E 28 GPa by default and a
"Écarts Δ" switch that no longer moves when clicked.

`quickerbridge/distribution.py` transcribes Tables 3.5, 3.6, 5.3 to 5.7, Figures
5.1 and 5.2 and clauses 5.6.4.3 to 5.6.4.6 and 5.6.6.2:
FT = S / (DT γc (1 + μλ + γe)) with the 1.05 n RL / N (ULS) and 1.05 / N (FLS)
floors. Le over a pier is 0.20 (L1 + L2) (S6-25 update of Figure 5.1 a); integral
abutments follow Figure 5.1 d); simple spans split the bridge into chains.
DVE = (B − Wc)/2 + We/2 − 0.9 with B = (N − 1) S + 2 Sc.

`tests/test_v09.py` reproduces the reference sheet (N = 6, S = 3.25, Sc = 1.73,
Wc = 18.8, ψ = 17.7°, L = 17.557 / 17.607 m, with its pre-S6-25 0.25 pier value):
n, RL, We, μ, B, DVE, Fs, every Le, DT, λ, γc, and FT for interior and exterior
moments at ULS, interior moments at FLS and span shear, all to 0.001. Two
values differ by design and the author confirmed both are simplifications of the
sheet: exterior moment at FLS uses λ = 0.0 for n ≥ 3 (Table 5.3; the sheet keeps
0.05: 0.781 instead of 0.756), and shear over a continuous pier uses
γc = (S/4.5)^0.15 ≤ 0.9 (Table 5.6; the sheet keeps 1.0: 1.062 instead of 0.956).
Branches of Tables 3.5, 3.6, 5.3, 5.4, 5.5, 5.6 and 5.7, Le configurations, Le
limits, warnings, project round trip (schema 6), worker action and Excel sheet
are tested. FT settings never change the analysis until applied.

Browser check (real Pyodide): the Δ switch keeps the same position (758 px at
1440 px wide) checked or not; FT card, detail view, apply to the axle factor and
recalculation, Excel with the FT sheet, FR/EN; no console errors.

## v0.9.1 FT applied by zone (verified 2026-10-01)

FT is no longer copied as one value to a factor. The user picks the girder
(interior/exterior) and the limit state (ULS/SLS1 or FLS/SLS2); when applied, the
axle effects on M and V are multiplied station by station by the moment and
shear FT of their zone: M+ span zones and M- support zones of Figure 5.1
(0.20 L each side of a pier, 0.25 L with integral abutments, 0.15 L at an
integral abutment). The factor enters the moving-load loop on each response
column, so envelopes, governing records and snapshots stay consistent; the lane
load, deflection and reactions keep one full lane, and FT replaces the entered
axle factor. DVE is limited to 3.0 m. Project schema 7 drops the v0.9 "effect".
"Les deux" is renamed "Permanentes + routières".

tests/test_v09.py adds: zone limits and values (interior/exterior, ULS/FLS,
exterior shear x Fs, hinge sides), truck-only M and V equal to one-lane values x
zone FT with deflection and reactions unchanged, lane case changed but not a pure
scaling, governing snapshots reproducing every extreme with force equilibrium,
physical axle loads in the animation, FT replacing the axle factor, DVE cap, and
the schema 6 to 7 upgrade.

Browser check (real Pyodide): FT applied from the Loads card recalculates M and V
(zones 0-14.05 / 14.05-21.08 / 21.08-35.16 m for the reference bridge), axle
factor field disabled, caption and FT markers on the M and V diagrams; data typed
in the FT tab keep the focus during the recalculation; the three compact tables
fit without horizontal scrolling at 1440 px; Excel export; no console errors.

## v0.9.2 fixes and features (verified 2026-10-01)

Scope: Notion page "QuickerBridge 0.9.2 Fix and features" plus two chat requests
(reactions, DVE). FT now applies to the whole live load of one lane (trucks and
lane load, ML and VL), zone by zone: M and deflection x moment FT, V x shear FT,
each reaction x the shear FT of the zone holding its support (Mr x moment FT).
Positive factors commute with the envelope, so the live envelope is scaled per
column; governing snapshots apply the same factors and keep their physical
equilibrium check. Exterior girder: dead-load V and reactions x Fs (5.6.6.2).
S6-25 Table 5.5 (gamma_c <= 1.10) and Table A5.3.3 (classes C and D) are added;
the S6-25 clause 5.6.4.3 image confirms gamma_e only at FLS/SLS2. A bridge type
("slab on girders"; "slab / voided slab" prepared) comes first. Default model:
non-prismatic, parabolic haunches to S2 over 20 % of each span next to interior
supports only, plates from the deeper section; FT applied with N = 5, S = 3.11,
Sc = 1.555, Wc = 10.4, skew 8.5 (DVE capped at 3.0 m). Input panels use
collapsible subsections (Loads: self-weight first, all collapsed; FT its own
subsection); FT notes define every parameter in words.

tests/test_v09.py: whole-live-load scaling of M, V, deflection and reactions
(truck and lane cases), exterior dead-load Fs on V and reactions, Table A5.3.3
rows and floors, Table 5.5 (S6-25), default parameters and DVE cap, default
application model, slab type prepared. 182 tests pass natively.

Browser check (real Pyodide): default model with FT applied, collapsed Loads
subsections in the requested order, haunches regenerated for 3 spans and back,
FT tab fields aligned (carriageway width in French), 20 definitions, no console
errors.

## v0.9.3 FT for slab and voided-slab bridges (verified 2026-10-01)

Scope: Notion page "QuickerBridge features 0.9.3". Clause 5.6.4.2:
FT = B / (Be DT (1 + mu lambda)) per metre of width, floors 1.05 n RL / Be (ULS)
and 1.05 / Be (FLS); Tables 5.1 / 5.2 (classes A, B) and A5.3.1 / A5.3.2
(classes C, D) for both portions; voided slabs with S < 2.0 m: shear DT x
(S/2)^0.25 (5.6.5.1); Be from 5.5.2 (B by default). The FLS/SLS2 solid-slab
shear row for n >= 2 is printed 3.20 + 0.10 Le (5.2) and 3.20 + 0.10/Le
(A5.3.2): 3.20 + 0.10 Le is used for all classes (author's decision). Slab Fs
(5.6.6.2 a: 1 + sin(2 psi - 10), 1 + 0.5 sin(...) when continuous, >= 1) acts on
the dead loads of the exterior portion; item b) of that clause was not
provided, so the live-load fraction takes no Fs.

tests/test_v09.py: hand calculation of a 20 m simple slab (n = 3), every branch
of Tables 5.1, 5.2, A5.3.1, A5.3.2, equivalent width and floors, Fs for simple
and continuous slabs on the exterior dead load, per-metre application by zone,
Excel sheet. 187 tests pass. Browser: voided-slab inputs (B, Be, S, Wc, skew),
compact moment/shear tables, "per metre of width" caption, no console errors.

## v0.9.3bis section properties module (verified 2026-10-01)

Scope: Notion page "Module section properties (seul, mixte) 0.9.3bis".
quickerbridge/section_props.py uses closed-form rectangles and bars (the
section-properties package was not used: it needs a mesher, shapely and
matplotlib, heavy or unavailable in Pyodide, and closed form is exact here).
tests/test_v093bis.py reproduces the author's validated sheet (1200 mm girder,
225 mm slab on a 50 mm haunch, be = 3110 mm, 15M @ 150, covers 35 / 60 there):
steel A, centroid, Ix, S top/bottom, Iy, J, Cw; n = 6.90, Ec = 28 987 MPa
(gamma_c = 24 kN/m3), Gc, Gs, net concrete area 691 457 mm2, bar areas and
positions; 1n and 3n areas, neutral axes, inertias, S1 to S5 (S1 1n within
0.08 %), J 1n; effective 1ne / 3ne inertias and moduli (FrQr = 0.85); section
classes 1 / 1 / 2 and the 2dc/w reduced-moment flag. One value differs on
purpose: Zx = 19.55e6 mm3 (sheet 19.0e6) because the plastic neutral axis lies
in the bottom flange (45.4 mm above the bottom) while the sheet's formula
assumes it in the web (its yp.bot = -146 mm is outside the web). Defaults:
covers 60 top / 35 bottom (author's choice), 15M @ 300, tc 200, haunch 50,
f'c 35 MPa. Composite data never changes the analysis or its cache key.

Browser check (real Pyodide): window created on first use, slab toggle,
reference values displayed, analysis not recalculated for slab inputs, copy of
I 3n / I steel into M (2.640) followed by one recalculation, cut slab drawing
with be dimension, spaced S labels, no horizontal overflow at 1024 px, no
console errors.

## v0.9.4 staged stresses over the depth (verified 2026-10-01)

v0.9.3bis becomes the main line. A double-click on a diagram (or "σ ↗" in the
readout; the single click still inspects the governing case after 260 ms)
opens the stresses at that station: section in force there (tapers
interpolated, slab of the plate-source section), moments split into girder
self-weight (steel alone or 3n), other permanent loads (steel alone or 3n) and
the live envelope max / min (1n, FT and factors as displayed). sigma = -M (y -
ybar) / I per stage, concrete = steel-equivalent / n or 3n, composite stage
under negative moment = cracked section (steel and bars). Slab data are sent
with the request because they never trigger an analysis.

tests/test_v094.py: steel and composite stresses by hand, 3n ratio, cracked
negative section, additivity of stages, section in force along the default
haunched model, moments of a request summing to the envelope value, stage
choices, current slab data, steel-girder and non-thermal guards, fibre order.
Browser: double-click without opening the governing case, stage selectors,
table and profiles (M max and M min), no console errors.

Correction requested by the author (2026-10-01): the user point S3 is given by
its distance y below the elastic neutral axis (positive downward), not from the
bottom flange: S3 = I / y for each section (steel, 3n, 1n) with its own axis;
the reference value S3 1n = 51.8e6 mm3 is reproduced with y = 915 mm. In the
drawing the y axis starts at the 1n (or steel) neutral axis; the stress fibre
S3 is placed y below the 1n axis.
