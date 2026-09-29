# QuickerBridge — guide développeur

Version 0.4 · Anthony Chéruel · 2026-09-15

## Quel fichier utiliser ou envoyer ?

Pour utiliser l’outil, ouvrez le **QuickerBridge-v<version>-<date>.html à la racine du dossier personnel**.
Pour l’envoyer à quelqu’un, ce fichier HTML suffit au fonctionnement, avec une
connexion Internet au démarrage. Pour une redistribution complète avec les guides,
exemples et notices, envoyez l’archive `QuickerBridge-v0.4-portable.zip`.

Le dossier personnel est organisé ainsi :

```text
QuickerBridge-v<version>-<date>.html                  application actuelle
GitHub/                            livrables publics prêts à déposer
  QuickerBridge-v0.4-source/        contenu à mettre à la racine du dépôt GitHub
  QuickerBridge-v0.4-source.zip     même arbre, compressé
  QuickerBridge-v0.4-pages.zip      site statique préconstruit
  QuickerBridge-v0.4-portable.zip   édition à envoyer
  MANIFEST.txt / SHA256SUMS.txt
ref/
  source/                          copie de travail complète, tests et outils locaux
  older_versions/v0.3/             HTML et archive source précédents
  documents/                       références personnelles, hors livraison publique
```

`GitHub/` est un résultat de construction; la copie de travail personnelle reste
`ref/source/`. N’éditez pas les deux. Le dépôt GitHub peut ensuite devenir votre
copie principale si vous le clonez séparément. Ne téléversez pas `ref/`, `.venv`,
les PDF du code, vos captures, ni le dossier racine personnel complet.

## Publier sur GitHub Pages

1. Créez un dépôt GitHub et placez **le contenu** de
   `GitHub/QuickerBridge-v0.4-source/` à sa racine, y compris `.github/`.
   `build_portable.py`, `README.md`, `dist/` et `quickerbridge/` doivent être directement
   à la racine du dépôt, sans dossier source supplémentaire autour.
2. Dans **Settings → Pages**, choisissez **GitHub Actions** comme source.
3. Dans **Actions**, ouvrez **Publish GitHub Pages**, puis **Run workflow**.
4. Ouvrez l’URL fournie par le déploiement. Les chemins relatifs permettent un site
   de projet du type `https://compte.github.io/QuickerBridge/`.
5. Pour une mise à jour, poussez les changements, attendez les vérifications, puis
   relancez manuellement ce workflow. Les pushes ordinaires ne publient pas le site.

Le workflow reconstruit `dist/` avec Python, puis publie uniquement ce site statique.
Les visiteurs n’installent rien. Aucun compte de service ou serveur Python n’est
nécessaire. Cette tâche prépare les fichiers; elle ne crée ni ne publie le dépôt.

Option simple sans Actions : extrayez l’archive `pages.zip` et mettez son **contenu**
à la racine d’un dépôt dédié. Choisissez une publication Pages depuis la branche
et le dossier racine. Conservez `index.html`, les quatre scripts, `styles.css`,
`.nojekyll` et l’archive source ensemble. Pour cette option, mettez à jour tous ces
fichiers à chaque livraison, pas seulement le HTML.

[Documentation GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Architecture et fichiers à modifier

| Fichier | Responsabilité |
| --- | --- |
| `dist/index.html`, `dist/styles.css`, `dist/app.js` | Interface, FR/EN, SVG, projets |
| `dist/browser-solver.js` | Worker Pyodide, chargement et échanges JSON |
| `quickerbridge/models.py` | Entrées validées et valeurs initiales |
| `quickerbridge/sections.py` | I acier, multiplicateur, zones de hauteur, EI |
| `quickerbridge/engine.py` | Influences, groupes d’essieux, enveloppes, cache |
| `quickerbridge/loads.py` | Véhicules, facteurs, charge de voie et charges permanentes |
| `quickerbridge/thermal.py` | Courbure thermique indépendante |
| `quickerbridge/modal.py` | Modes propres (v0.8) : fréquences, périodes, formes, masse modale |
| `dist/modes.js` | Vue « Modes propres » : animation, spectre, « Écouter le pont » (module indépendant d’`app.js`) |
| `quickerbridge/projects.py` | Schéma de projet et compatibilité |
| `quickerbridge/version.py` | Version, date, auteur |
| `vendor/pycba/src/pycba/` | Solveur PyCBA et modifications locales |
| `tests/` | Vérifications analytiques, régressions et mesures |
| `build_portable.py` | Génération des HTML, bundles et archives |

Ne modifiez pas à la main `solver-bundle.js`, `version.js` ou `QuickerBridge-v<version>-<date>.html`.
Ils sont régénérés. Le ZIP de sources intégré au worker inclut la licence PyCBA.
Les répertoires `release/` et `GitHub/` sont des livrables, pas les sources de travail.

## Installer et reconstruire

Dans une copie propre du dépôt, Python 3.13 est utilisé par CI :

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe -m pytest tests -q
.venv/Scripts/python.exe -m black --check quickerbridge tests build_portable.py launch.py
.venv/Scripts/python.exe build_portable.py
```

Sous Linux, utilisez `.venv/bin/python`. Le build seul utilise la bibliothèque
standard de Python; les dépendances scientifiques sont nécessaires aux tests.
`--no-release` régénère le HTML et les assets sans créer les archives de livraison.
Le dossier `release/` est remplacé par chaque build complet; archivez-y toute ancienne
version à conserver avant de reconstruire.

Dans la copie de travail personnelle réorganisée, depuis `ref/source/` :

```powershell
$env:MPLCONFIGDIR = './tmp/mpl'
.venv/Scripts/python.exe -m pytest tests -q
.venv/Scripts/python.exe build_portable.py --deliver ../..
```

`--deliver` copie le HTML à la racine choisie et les livrables dans son dossier
`GitHub/`. Il conserve les autres fichiers. Après une nouvelle version, archivez
les anciens livrables pour éviter de distribuer la mauvaise édition.

Pour prévisualiser les fichiers séparés pendant le développement seulement :
`python -m http.server 8766 --bind 127.0.0.1 --directory dist`.
Cela n’est pas requis pour utiliser ou partager le HTML autonome.

## Calculs et performance

Voir [NONPRISMATIC.md](NONPRISMATIC.md) pour les formules et la distinction
entre profondeur géométrique et interpolation EI de CSI.

- Les valeurs affichées de I sont brutes; EI inclut le multiplicateur.
- Les caches de rigidité appartiennent à un seul Basis immuable. Ne modifiez pas
  sa structure après création. Le cache des forces fixes est vidé par
  `Basis.solve_loads()` à chaque changement de charges; utilisez cette méthode.
- Le lookup vectorisé EI préserve les mêmes morceaux linéaires et les côtés des sauts.
- La modification locale de `beam.py` remplace les 2001 points Simpson par morceau
  pour les forces fixes par une quadrature de Gauss, avec coupures aux changements
  EI et aux discontinuités de charge. Les ordres 16, 32, 64, 128 sont comparés;
  `quad_vec` intervient si nécessaire. Les autres chemins PyCBA restent inchangés.
- Les influences utilisent 48/96 intervalles par travée plus les points EI;
  EI a 33/65 points par zone variable; la flèche utilise 480/960 points.
- Le passage du véhicule utilise un `linspace` symétrique dont l’espacement maximal
  est 0,25/0,10 m; les deux sens ont ainsi des grilles miroir exactes.
- Le calcul routier reste une enveloppe numérique discrète. Ne confondez pas
  résolution du tableau, influence, intégration et pas de déplacement du camion.
- CL-625 et CL-750-QC vérifient les sous-ensembles d’essieux prescrits. HL-93
  vérifie le camion ou tandem complet et enveloppe l’espacement arrière du camion
  de 4,3 à 9,0 m; sa majoration de 33 % vise les essieux, pas la charge uniforme.
  Cooper emploie le train E complet et sa charge uniforme associée dans PyCBA.
  Les charges uniformes associées des véhicules standards couvrent le pont complet.
  Le véhicule d’entretien 24 + 56 kN à 2,0 m n’a ni charge de voie ni CMD.

`python tests/performance.py` mesure un modèle défini de deux travées avec quatre
zones paraboliques. `--baseline chemin/ancienne/source` permet une comparaison
native du wrapper précédent. Les temps ne comprennent pas le téléchargement du
runtime. Les mesures navigateur dépendent du matériel, du cache et du réseau.

## Projets et version

Le schéma 2 utilise la variation de hauteur seule. Les fichiers schéma 1 dont la
signification est identique sont acceptés. Les tapers anciens qui interpolaient
les tôles ou E sont refusés avec explication, afin d’éviter une modification
silencieuse du modèle. La valeur M et les nouveaux facteurs de charge valent 1 par
défaut pour les projets qui les omettent.
Incrémentez la version dans `version.py`, mettez à jour la date et reconstruisez.

Avant livraison : exécutez les tests pertinents, vérifiez FR/EN, les deux limites
SVG, les charges nominales — ou réduites par la fraction de voie canadienne — sans
CMD affiché, un changement de zone et un projet rouvert. L’export
Excel a déjà été validé par Anthony; ne redemandez pas ce contrôle de téléchargement.
Voir [VALIDATION.md](VALIDATION.md) pour les preuves et limites de cette livraison.
Les écarts de code peuvent être examinés avec `ref/source/tmp/v0.4-changes.diff`
dans le dossier personnel, ou directement par Git dans le dépôt.

## Composants tiers

PyCBA est distribué avec sa licence AGPL-3.0-or-later et ses sources. Les changements
locaux incluent CL-750QC et l’intégration non prismatique accélérée. Conservez les
notices et l’archive de sources distribuée avec le site. La livraison n’attribue
pas automatiquement une nouvelle licence au code original de QuickerBridge.
[Notices](THIRD_PARTY_NOTICES.md).
