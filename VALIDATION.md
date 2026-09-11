# QuickerBridge 0.3 validation — 2026-09-11

## Automated checks

- QuickerBridge application suite: **34 passed**. Two warnings come from the
  optional FastAPI/Starlette test-client dependencies. Black 23.12.1 and Node
  JavaScript syntax checks pass.
- The earlier vendored PyCBA suite completed with **362 passed, 4 skipped**. No
  PyCBA numerical code changed in v0.3.
- Two identical release builds produced identical SHA-256 checksums.
- The source ZIP was extracted to a clean directory and rebuilt with
  `build_portable.py --no-release`. The portable HTML, source bundle, and source
  disclosure ZIP were recreated without using project-relative imports or `.venv`.
- The staged source contains no `.git`, `.venv`, `DOC-REF`, handoff/plan notes,
  supplied PDF/XLS files, caches, or temporary data.

## Thermal-gradient checks

The UI convention is `ΔT = Ttop − Tbottom`; PyCBA receives
`κ = −αΔT/h`. Deflection is displayed positive downward.

- Simple 10 m span, EI = 180,000 kN·m², ΔT = 15 °C, α = 12×10⁻⁶/°C,
  h = 1800 mm: κ = −1.0×10⁻⁴ 1/m; V, M, and R are zero; peak displayed
  deflection is −1.25 mm. Changing EI alone does not change the free deflection.
- Two equal 10 m spans at the same EI and curvature: interior restraint moment
  is +27 kN·m after the UI sign mapping; reactions are +2.7, −5.4, +2.7 kN.
- Zero-gradient, sign reversal, scaling, equilibrium, direct-EI, nonprismatic
  parabolic-section, browser-dispatch, and thermal workbook cases pass.
- Thermal results are unchanged by stored dead/live edits. Mechanical results are
  unchanged by thermal-input edits. The thermal result has one signed V/M/δ/R
  value and no governing truck arrangement.

## Project-file checks

- The schema round-trips a one-span constant-EI model, a five-span
  nonprismatic/custom-seven-axle model, and a negative-gradient thermal model.
- Malformed JSON, files over 1 MiB, wrong format, unsupported schema versions,
  unknown fields, invalid geometry, and bad references are rejected before model
  replacement.
- Visible invalid numeric input blocks Save. Reopen increments the UI revision so
  an older in-flight result cannot become current.

## Browser checks

The latest static build was inspected in French and English. French is the initial
language when no preference is stored. Save/Open, v0.3, Anthony Chéruel, the date,
thermal inputs, single thermal diagrams/reactions/table, warnings, and disclaimers
are present. The default mechanical rounded values remain M+ 3664.4 kN·m,
M− −3330.6 kN·m, |V| 795.3 kN, and |δ| 36.04 mm.

A clean extracted site loaded successfully from `/dist/`, exercising relative
asset URLs under a repository-style subpath. Pyodide loaded PyCBA and completed the
default envelope. The thermal view completed with κ = −1.000×10⁻⁴ 1/m and the
expected single-case results.

The user previously confirmed Excel downloading and explicitly asked that it not
be retested. The new thermal workbook structure was validated in memory only.
Automated `file://` navigation is blocked by the development browser policy, so
double-clicking `QuickerBridge.html` remains a manual target-browser check.

Nothing was published, pushed, or created on GitHub.

