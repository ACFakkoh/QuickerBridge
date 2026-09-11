# QuickerBridge 0.3

**Anthony Chéruel · Mise à jour / Updated: 2026-09-11**

## Utilisation

Ouvrez `QuickerBridge.html` dans un navigateur moderne (Edge ou Chrome conseillé).
Aucune installation de Python et aucun serveur local ne sont nécessaires pour
cette édition. Une connexion Internet est nécessaire au lancement pour charger
Pyodide et les bibliothèques scientifiques. Les calculs et les données du pont
restent dans le navigateur; ils ne sont pas envoyés à un service de calcul.
Le cache du navigateur peut accélérer les ouvertures suivantes; le fonctionnement
hors connexion n'est pas garanti.

Le français est la langue initiale; le choix EN/FR est ensuite mémorisé. Saisissez
les dimensions, les portées et les charges. Les résultats se mettent à jour après
une courte pause. Cliquez sur une valeur extrême pour afficher sa disposition de
charges compatible. L'export **Excel** contient les enveloppes aux stations, les
réactions, les dispositions déterminantes et le modèle.

Le bouton **Enregistrer** produit un fichier `.quickerbridge.json` qui contient
toutes les données du modèle, mais aucun résultat calculé. **Ouvrir** valide le
format et recalcule le projet; un fichier invalide ne remplace jamais le modèle
affiché. Si le modèle actuel est modifié, l'interface propose de l'enregistrer,
d'ignorer les modifications ou d'annuler avant d'ouvrir le fichier choisi.

Dans **Sections**, choisissez une poutre en I ou **EI constant (kN·m²)** pour
chaque section. Un EI direct n'a pas d'aire ou d'inertie déduite. Des zones de
rigidité constante peuvent être assemblées dans une poutre non prismatique; les
variations dimensionnelles sont réservées aux sections définies par leur géométrie.
Le dessin d'une section EI est schématique et n'indique pas sa hauteur réelle.

Le mode **Thermique** est un cas distinct. Il transforme le gradient linéaire
`ΔT = Tdessus − Tdessous`, le coefficient `α` et la hauteur thermique `h` en une
courbure libre uniforme `κ = −αΔT/h`. Il calcule V, M, la flèche et les réactions
avec PyCBA, sans ajouter de charges permanentes ou routières. Un dessus plus chaud
produit une courbure vers le haut, donc une flèche négative dans l'affichage.

## English

Open `QuickerBridge.html` in a modern browser. Users do not need Python or a local
server. The first launch downloads the pinned Pyodide runtime and dependencies;
an internet connection is required. Calculations run in a background browser
worker using the same Python/PyCBA source as the native tests. No bridge inputs
are uploaded. Browser caching helps subsequent launches but is not an offline
installation guarantee.

Edit spans, sections and loads to update the diagrams. Click an extreme to inspect
its compatible arrangement. Excel exports always contain the **envelope**, even
when a single truck position is displayed. The station table includes support
reactions once per support, with left/right shear limits preserved.

**Save** downloads a validated `.quickerbridge.json` model file; **Open** validates
and recalculates it. Computed results and temporary browser state are never stored.
Invalid or unsupported files leave the current model intact, and modified work gets
a Save/Discard/Cancel prompt before replacement.

**Thermal** is an exclusive load mode. The signed linear gradient
`ΔT = Ttop − Tbottom`, editable expansion coefficient `α`, and reference depth `h`
produce uniform free curvature `κ = −αΔT/h` on every span. PyCBA solves V, M,
deflection, and reactions for that thermal case alone. Positive top heating bows
upward and therefore appears as negative deflection under the downward-positive
plot convention.

## Distribution: GitHub Pages

The `dist/` directory is a complete static site, with relative asset URLs suitable
for a GitHub project subpath. It does not use a Python HTTP API. GitHub Pages serves
the files; Pyodide runs PyCBA inside the visitor's browser.

No repository has been created and nothing has been published. The prepared source
tree includes `.github/workflows/ci.yml` and a manual
`.github/workflows/pages.yml`. After placing the source in a repository, enable
GitHub Pages with **GitHub Actions** as its source and run the **Publish GitHub
Pages** workflow manually. Ordinary pushes do not deploy Pages.

Rebuild after any Python or UI edit:

```powershell
.venv\Scripts\python.exe build_portable.py
```

`QuickerBridge.html` is the single-file local edition; `QuickerBridge.cmd` simply
opens it on Windows. A normal GitHub release build also creates:

- `release/QuickerBridge-v0.3-source/`: clean GitHub-ready source tree;
- `release/QuickerBridge-v0.3-source.zip`: matching source archive;
- `release/QuickerBridge-v0.3-pages.zip`: static `dist/` artifact;
- `release/QuickerBridge-v0.3-portable.zip`: portable HTML, opener, examples and notices;
- `release/MANIFEST.txt` and `release/SHA256SUMS.txt`.

Automated file-URL navigation is blocked by this development environment's browser
policy; its double-click launch requires a manual check on the target computer.
The static HTTP edition is tested separately. For a guaranteed offline Windows
edition, the next distribution option is a desktop executable with a bundled
Python runtime and an embedded window, without an HTTP server. That executable
is not part of v0.3.

References: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site),
[Pyodide workers](https://pyodide.org/en/0.27.7/usage/webworker.html),
[PyInstaller packaging](https://pyinstaller.org/en/stable/operating-mode.html).

## Calculation basis and limits

- One-lane, full axle loads; 1–5 continuous Euler–Bernoulli spans; pins and rollers
  restrain vertical displacement and permit rotation. Interior supports preserve
  continuity. No shear or axial deformation.
- Gross homogeneous steel I-section: three nonoverlapping rectangles. Overall
  depth includes both flanges. Web clear height is `h - t_top - t_bottom`.
  `y_bar = sum(A_i y_i)/sum(A_i)` and
  `I = sum(b_i h_i^3/12 + A_i (y_i-y_bar)^2)` about the horizontal centroidal axis.
  Input mm → I in m⁴; E in GPa → EI in kN·m² by `EI = E * 10^6 * I`.
  No composite slab, stiffeners, fillets, welds, cracking, prestress, or automatic
  self-weight. Direct EI bypasses geometric property calculations.
- Dimensions and E vary before calculating EI. A parabolic haunch is tangent at
  its shallower end: shallow→deep uses `t²`; deep→shallow uses `1-(1-t)²`.
  Variable EI uses 33/65 positive linear samples per zone (standard/fine).
- CL-625: 50/125/125/175/150 kN. CL-750-QC: 50/160/160/200/180 kN.
  Gaps: 3.6/1.2/6.6/6.6 m. CL-750-QC is an independent PyCBA vehicle extension.
- **CAN/CSA S6-25, 3.8.4.5.3**, as supplied by the user: truck factors 1.40 for
  one axle; 1.30 for two axles or original axles 1–2–3; 1.25 for other 3+ groups.
  All nonempty subsets retain their original axle IDs and spacings. Custom
  vehicle factors count individual axles; special-truck axle units are not inferred.
- Lane case is a separate alternative: CL-625 80% truck + 9 kN/m; CL-750-QC
  selected 80% or 63% truck + 12.6 kN/m. Neither lane component receives DLA.
  The selected percentage applies to the whole lane result; the 63% qualifications
  are shown in the UI. The lane UDL occupies adverse influence regions.
- No ULS/SLS load factors, RL, transverse distribution, deck-joint allowance or
  buried-structure rules. Results are instructional effects, not a code design check.
- Standard/fine travel steps 0.25/0.10 m, augmented by axle/station crossings and
  shear limits. Reaction/deflection influence samples 48/96 per span and EI
  breakpoints; PyCBA deflection integration 480/960. Lane integration 240/480 per
  span augmented at shear discontinuities. Deflections are corrected to zero at
  supports. These remain sampled numerical envelopes, not analytical optimization.
- V and M use section equilibrium. Sagging M is positive and drawn downward;
  deflection is positive down (mm), reactions positive up (kN). Envelope extremes
  are independent; a snapshot is one compatible arrangement.
- Thermal curvature uses PyCBA's imposed-curvature load on every member. It is
  uniform along the bridge and uses the user-entered thermal reference depth,
  independent of the geometric section depth. The thermal mode is a single signed
  case, not an envelope, and is never combined with dead or live loads.

## Development and review

Python is only needed to develop, rebuild after source changes, or run native
regression tests. `QuickerBridge.cmd` now simply opens the portable HTML.
The optional `launch.py` and FastAPI endpoints remain available for development,
but are not required by the delivered browser app.

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m pytest tests -q
.venv\Scripts\python.exe -m black --check quickerbridge tests build_portable.py launch.py
.venv\Scripts\python.exe build_portable.py
```

Use `build_portable.py --no-release` in CI when only the static and single-file
assets are needed. Release metadata is maintained in `quickerbridge/version.py`.

Core files: `quickerbridge/models.py`, `sections.py`, `loads.py`, `engine.py`,
`thermal.py`, `projects.py`, `browser.py`, `exports.py`; UI: `dist/app.js`, `styles.css`, `index.html`;
runtime adapter: `dist/browser-solver.js`; generated files: `dist/solver-bundle.js`
and `QuickerBridge.html`. See `HANDOFF.md` for verification status and remaining
manual checks. Do not edit generated files directly.

PyCBA source: upstream commit `89fb9323433308739e2da9f51f9a1023a21bbd2d`, v1.0.1,
with the local CL-750-QC getter and tests. Its AGPL-3.0-or-later licence is preserved
in `vendor/pycba/LICENSE` and in the embedded source archive. No upstream PR or
release has been created. See [PyCBA docs](https://ccaprani.github.io/pycba/) and
[repository](https://github.com/ccaprani/pycba). The supplied MTQ bulletin A2023-05
and supplied S6-25 clause were used as calculation references.

## Use and liability / Utilisation et responsabilité

Indicative preliminary values only — not a substitute for detailed design.

While I believe these tools to be free of error, I cannot be held liable for their
results. They are provided for instruction only and must not be used to design a bridge.

Valeurs préliminaires indicatives seulement — ne remplacent pas une conception détaillée.
Bien que je considère ces outils comme exempts d'erreurs, je ne peux être tenu
responsable de leurs résultats. Ils sont fournis à des fins pédagogiques seulement
et ne doivent pas servir à concevoir un pont.
