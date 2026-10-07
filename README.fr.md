# QuickerBridge 0.9.99 — guide en français

[English README](README.md)

**Anthony Chéruel · 2026-10-01 · Français / English**

Un outil de calcul préliminaire de poutres continues de ponts, avec PyCBA dans le
navigateur. Géométrie, charges et diagrammes restent réunis dans une interface
compacte. Aucune installation de Python et aucun serveur local pour les utilisateurs.

## Démarrer

- **Sur le web :** https://acfakkoh.github.io/QuickerBridge/ (GitHub Pages, publié à chaque mise à jour de `main`).
- **Fichier reçu :** ouvrez `QuickerBridge-v<version>-<date>.html` (p. ex. `QuickerBridge-v0.9.99-2026-10-06.html`) dans un navigateur moderne. Si vous
  recevez l’archive portable, extrayez-la avant d’ouvrir le HTML.
- Une connexion Internet est nécessaire au démarrage pour charger Pyodide et ses
  bibliothèques. Le cache peut accélérer les ouvertures suivantes; cette édition
  ne garantit pas un fonctionnement hors connexion.
- FR est la langue initiale. Le bouton EN/FR en haut mémorise ensuite votre choix.

Les calculs s’exécutent dans un processus de travail du navigateur. Les données du
pont ne sont pas envoyées à un serveur de calcul. Fermer l’onglet interrompt le calcul.

## Saisir un modèle

1. **Géométrie :** choisissez 1 à 7 travées, leurs longueurs en mètres et les appuis.
   Les appuis articulés et à rouleaux bloquent le déplacement vertical, avec
   continuité de la poutre aux appuis intérieurs. **Encastré (culée intégrale)**
   bloque aussi la rotation et donne une réaction de moment Mr (anti-horaire +).
   C’est une borne supérieure : une vraie culée intégrale est partiellement retenue
   par ses pieux et le remblai; comparez avec des appuis articulés pour encadrer la
   réponse. Retenue axiale, poussée des terres et dilatation du tablier : non modélisées.
   **Ressort de rotation k** (kN·m/rad) : déplacement vertical bloqué, rotation
   retenue élastiquement (culée intégrale sur pieux, appui partiellement encastré).
   L’application affiche la **fixité** k / (k + Σ3EI/L des travées adjacentes),
   de 0 % (articulé) à 100 % (encastré); le k proposé par défaut donne 50 %.
   La case **Isostatique** d’une travée (v0.8.6) la rend simplement appuyée :
   rotules aux deux extrémités, aucune continuité avec les travées voisines.
2. **Sections :** saisissez les dimensions des tôles en mm et E en GPa, choisissez
   une **poutre précontrainte NEBT 1000 à 1800** (propriétés normalisées, E béton
   28 GPa par défaut, modifiable), ou une rigidité EI constante directement en kN·m².
   La hauteur comprend les semelles.
3. **Charges :** choisissez permanentes, routières, les deux, ou une déformation imposée seule (gradient thermique, retrait ou fluage de la dalle).
   Le **poids propre des poutres** acier (aire × 77 kN/m³, +15 %) et NEBT (poids
   normalisé, +10 %) est ajouté par défaut aux charges permanentes; majorations et
   facteur de charge modifiables, option pour ne pas l’appliquer. Les projets
   enregistrés avant v0.8.6 se rouvrent sans poids propre automatique.
   Plusieurs charges uniformes sont possibles. CL-750QC à 80 % est le choix initial;
   CL-625, le camion et le tandem AASHTO HL-93, le train Cooper E, le véhicule
   d’entretien 24 + 56 kN et un véhicule personnalisé de 1 à 7 essieux sont disponibles.
   Chaque charge permanente a son facteur. Le facteur routier multiplie tout le cas
   routier; le facteur d’essieu multiplie seulement les charges d’essieux.
   **Facteur d’essieu FT (v0.9.2)** : sous-section « S6-25 » de l’onglet Charges,
   pour un pont à dalle sur poutres (classes A/B ou C/D, CL-625 / CL-750-QC). On
   choisit la poutre (intérieure ou extérieure) et l’état limite (ÉLUL/ÉLUT1 ou
   ÉLF/ÉLUT2). Appliqué, FT multiplie toute la surcharge d’une voie (camions et
   charge de voie) zone par zone : M et la flèche par le FT moment, V et les
   réactions par le FT cisaillement de chaque zone M+ (travée) ou M− (0,20 L de
   part et d’autre d’une pile), comme Le à la figure 5.1. Pour une poutre
   extérieure, le cisaillement et les réactions permanents sont majorés par Fs.
   FT remplace alors le facteur d’essieu saisi. Les données du tablier (N,
   S, Sc, Wc, biais, h des culées intégrales) et les tableaux compacts (Le, DT, λ,
   γc, γe, FT par zone) sont dans l’onglet « FT · S6-25 »; l’Excel a une feuille
   dédiée. DVE est borné à 3,0 m.
4. Attendez la fin du calcul, puis inspectez les diagrammes et le tableau. La case
   **Écarts Δ (max − min)** remplace V, M et δ par ΔV, ΔM et Δδ, lus au curseur.
   L’augmentation du nombre de stations du tableau ne raffine pas le solveur.

Le modèle initial comporte **2 × 34,8 m**, une poutre de **1200 mm** de hauteur,
une semelle supérieure **350 × 25 mm**, une âme de **14 mm** et une semelle
inférieure **600 × 50 mm**. E = 200 GPa; inertie de la poutre seule.
Ces valeurs sont des données de départ, pas une validation de ce pont.

### Rigidité et zones non prismatiques

L’inertie utilisée par l’analyse (v0.9.99) se choisit par section : **poutre
seule**, section **mixte 3n** ou **1n** (M+), ou inertie **fissurée I′** (M−,
acier + armatures), calculées avec la dalle des « Propriétés de section ».
EI = E × I de la configuration choisie; le rapport I / I poutre est affiché. Un
projet antérieur avec un multiplicateur M ≠ 1 le conserve, signalé, jusqu’à un
autre choix.

Les zones se suivent de 0 à 100 % de chaque travée. La section initiale d’une zone
fournit sa hauteur initiale, la section finale **la hauteur cible**. L’option
**« Tôles, E et M de »** choisit la section qui fournit les tôles, E et M : initiale
(défaut, comportement v0.4), finale ou **la plus haute**. La hauteur peut être constante, linéaire ou parabolique.
Les semelles et l’épaisseur de l’âme restent constantes dans la zone; pour les
changer, commencez une nouvelle zone. Le profil parabolique est tangent au côté
le moins haut. [Détails et comparaison avec CSiBridge](NONPRISMATIC.md).
Pour un gousset miroir de part et d’autre d’une pile, inversez les sections initiale
et finale dans la travée opposée **et** choisissez « la plus haute » dans les deux
zones : les tôles de la section sur pile sont alors utilisées des deux côtés. Avec
l’option « initiale », l’inversion change les tôles et le pont n’est pas symétrique;
le diagramme EI(x) et l’alerte « Saut de rigidité » le signalent.

### Diagnostics et outils d’inspection (v0.4.1–0.5)

- **EI(x)** sous les diagrammes et alerte de saut de rigidité (> 15 %).
- **Soulèvement :** toute réaction minimale négative est signalée en rouge, avec le
  contexte (charge vive seule, permanentes + vives, ou disposition affichée).
- **Lignes d’influence :** onglet « Lignes d’influence », cliquez un diagramme pour
  choisir la station. V, M, δ à la station et R (et Mr si encastré) à l’appui le plus
  proche, pour 1 kN vers le bas, avec les essieux de la disposition M max.
- **Camion gouvernant :** onglet « Camion gouvernant » ou clic sur un extrême; la
  disposition des essieux est dessinée sur la poutre avec ses diagrammes V, M, δ.
- Axes Y gradués, quadrillage léger et valeurs des pics sur chaque diagramme.
- **Écran d’ouverture (≈ 4 s)** pendant le chargement du moteur : une vraie poutre
  continue à 3 travées résolue par l’équation des trois moments, un CL-750-QC qui
  la traverse et l’enveloppe de M qui se construit. Échap ou › pour passer.

### Enveloppes et thermique

Les deux lignes épaisses limitent les enveloppes min/max. Chaque extrême peut
venir d’une disposition de charges différente. Cliquez sur un extrême pour voir
la disposition compatible. La case **Δ** sous V, M ou δ affiche, pour ce diagramme,
la différence max − min à chaque abscisse. Le survol affiche aussi EI.
Les flèches d’essieux et leurs nombres montrent les
 **charges nominales multipliées par le facteur d’essieu**; dans un cas de voie
 canadien, elles incluent aussi la réduction de voie. Elles n’affichent jamais le
 CMD ni le facteur routier global.
Le cas supplémentaire **HL-93 · 90 % de deux camions** s’active pour les
enveloppes avec voie du camion ou du tandem et au moins deux travées. Il combine
90 % de deux camions à essieux arrière espacés de 14 pi avec 90 % de la voie,
avec un espacement libre d’au moins 50 pi entre camions. Il concerne les moments
négatifs autour des piles et les réactions verticales intérieures. Le CMD de
33 % s’applique aux essieux seulement; les essieux et régions de voie favorables
sont omis. Les centres des camions occupent deux travées adjacentes; leur
espacement et leur position sont cherchés au pas Standard ou Fin.
[Référence FHWA, §6.2.1](https://rosap.ntl.bts.gov/view/dot/42904/dot_42904_DS1.pdf).

Moment positif en travée, flèche positive vers le bas,
réactions positives vers le haut.

Le mode thermique applique seul un gradient linéaire : ΔT = Tdessus − Tdessous.
Saisissez α en 10⁻⁶/°C et une hauteur thermique de référence en mm. Cette hauteur
est indépendante de la géométrie des sections. Le même gradient et la même
courbure libre sont appliqués à toutes les travées. Un dessus plus chaud courbe
la poutre vers le haut. Le cas thermique ne se superpose pas aux autres charges.
PyCBA reçoit une courbure imposée; il ne définit pas nativement un profil thermique
bilinéaire dans la hauteur. Cette version conserve donc le gradient linéaire explicite.

### Modes propres (v0.8)

L’onglet **Modes propres**, à côté des notes de calcul, calcule jusqu’à 12 modes de
flexion verticale du tablier, **6 par défaut** : fréquence f (Hz), période T (s), pulsation ω, masse
modale et forme symétrique/antisymétrique. Il reprend exactement le modèle statique :
travées, sections, zones non prismatiques EI(x), appuis encastrés et ressorts de rotation.

- **Masse :** par défaut les charges permanentes **non pondérées** divisées par g
  (une charge de 10 kN/m donne 1,02 t/m) ; les facteurs de charge ne sont pas de la
  masse. Une charge partielle crée une masse partielle. Choisissez « Masse imposée »
  pour saisir une charge équivalente en kN/m, divisée par g pour obtenir les t/m. Ces réglages ne relancent pas le calcul statique.
- **Animation :** le tablier dessiné dans le bandeau vibre selon le mode choisi
  (**temps réel par défaut**, avec un ralenti disponible). Les vignettes animent
  les modes calculés ; ← → changent de mode. Les fréquences élevées restent
  limitées par le taux de rafraîchissement de l’écran.
- **Spectre :** les modes sur une échelle logarithmique ; la hauteur suit la masse
  modale. Les bandes ombrées sont les plages de risque de résonance piétonne verticale
  (Sétra 2006).
- **Méthode :** éléments d’Euler-Bernoulli et masse cohérente, comme
  `BeamAnalysis.modal` de PyCBA, étendus aux travées non prismatiques et à la masse
  par intervalles. Flexion verticale d’une ligne de poutre seulement : ni torsion,
  ni amortissement, ni interaction véhicule-pont.

### Enregistrer, rouvrir et exporter

**Enregistrer** télécharge un fichier `.quickerbridge.json` avec les paramètres.
**Ouvrir** vérifie le fichier et recalcule les résultats. Aucun diagramme ni résultat
n’est sauvegardé dans le projet. Enregistrez avant de fermer le navigateur.
Les anciens projets dont les tôles variaient continûment doivent être consultés
avec v0.3 puis redéfinis explicitement en zones dans v0.4; l’application les signale.

**Comparer** ouvre un second projet JSON sans remplacer le projet courant.
Les enveloppes V/M/δ se superposent sur une même abscisse en mètres, avec les
appuis de chaque modèle et un tableau des écarts entre leurs extrema. Chaque
projet conserve ses paramètres de charge.

**Excel** exporte les enveloppes, les réactions, les Δ et le modèle, même si une
position particulière du camion est affichée. Le même classeur contient les
fréquences, périodes, masses modales et formes des modes avec les réglages
actuels. Les tableaux sont filtrables et formatés; les unités figurent dans les
entêtes. Sans masse, la feuille Modes indique pourquoi les modes sont indisponibles.
En mode thermique, les résultats statiques sont ceux du cas unique.
Les appuis partagés ont deux lignes pour les cisaillements gauche et droite.
Le bouton **Agrandir les diagrammes** masque temporairement les entrées et agrandit
les trois graphiques sans relancer le calcul.

### Si le calcul paraît lent

**Démarrage (v0.7) :** les résultats du modèle par défaut sont précalculés et
s’affichent dès la fin de l’animation (≈ 3 s). Le moteur se charge en arrière-plan : seulement NumPy et pydantic (≈ 5 Mo au
lieu de ≈ 40 Mo) ; SciPy est remplacé par un sous-ensemble NumPy vérifié et
matplotlib n’est pas chargé. Le module Excel est téléchargé au premier export.

**Réseau d’entreprise :** si une bibliothèque (Pyodide, NumPy, SciPy…) ne se
télécharge pas ou reste figée, QuickerBridge relance automatiquement le chargement
jusqu’à 4 fois, puis affiche l’étape bloquée, la bibliothèque et le domaine en cause
(cdn.jsdelivr.net ou pypi.org) avec un bouton « Réessayer ». Si seul le module Excel
échoue, le calcul fonctionne et le bouton Excel explique pourquoi il est indisponible.

Le premier démarrage télécharge le moteur. Ensuite, modifier la géométrie ou EI
reconstruit les fonctions d’influence; modifier uniquement les charges peut les
réutiliser. Les zones nombreuses, cinq travées et le mode Fin prennent plus de temps.
Les calculs non prismatiques de v0.4 évitent de recalculer inutilement la rigidité.
Si le moteur ne démarre pas, vérifiez la connexion et rechargez la page. Si une
entrée est invalide, corrigez-la avant d’utiliser les résultats grisés.

## English quick guide

Open the provided GitHub Pages link, or double-click the extracted
`QuickerBridge-v<version>-<date>.html`. **No Python installation or local server is needed.** Internet
access is required to download the browser runtime; guaranteed offline use is not
included. Calculations run locally in your browser. Use the top EN/FR toggle.

Define 1–7 spans, supports, steel plates or direct constant EI, then select dead,
live, combined, or thermal-only loading. The analysis inertia of a steel or NEBT
girder is the girder alone, composite 3n or 1n (M+) or cracked I′ (M−).
In a non-prismatic zone, only height varies. “Plates, E and M from” selects the
start section (default), the end section or the deeper section; choose Deeper on both
sides of a pier for a true mirrored haunch. See [depth versus EI interpolation](NONPRISMATIC.md).
Supports can be pinned, roller or **fixed (integral abutment)**, which adds a moment
reaction Mr (CCW +); real fixity lies between pinned and fixed. Influence lines,
uplift warnings, an EI(x) diagram and a 60-frame crossing animation help inspection.

Both envelope limits are drawn in bold. Click an extreme to inspect its governing
arrangement. Axle arrows show nominal loads, or Canadian lane-reduced loads in a
lane case, multiplied by the user axle factor; they never show dynamic allowance or
the overall live factor. The solver applies all selected factors. Save/Open exchanges
model-only `.quickerbridge.json` files. Excel exports
the envelope, or the single thermal case. Shared supports retain both shear limits.

## Portée / Scope

PyCBA solves a linear elastic, 1-D Euler–Bernoulli continuous beam. One lane uses
the selected standard vehicle. CAN/CSA S6-25 §3.8.4.5.3 dynamic allowance is applied
to Canadian truck axle subsets; reduced-truck-plus-lane cases have no dynamic
allowance. HL-93 envelopes its permitted 4.3–9.0 m rear-axle spacing and applies
its 33% allowance to truck/tandem axles only, with a 9.3 kN/m companion UDL. Cooper
uses PyCBA’s full E-series train and companion UDL. Standard companion UDLs cover
the full bridge; the optional 90% two-truck HL-93 case uses the full-deck lane
for negative moments and interior reactions, with at least 50 ft clear headway
and fixed 14 ft truck axle spacings. The maintenance vehicle is 24 + 56 kN at 2.0 m, with no lane load
or dynamic allowance. Truck and lane cases are alternatives. No automatic self-weight,
load combinations, transverse
load distribution, shear deformation, staged construction, prestress, cracking,
code compliance verification is included (the Resistance tab checks one
steel girder section against effects entered or taken from the envelope). Numerical envelopes
are sampled; compare Standard and Fine when assessing sensitivity.

**Valeurs préliminaires indicatives seulement — ne remplacent pas une conception détaillée.**

**Indicative preliminary values only — not a substitute for detailed design.**

Utilisation et responsabilité : bien que je considère ces outils exempts d’erreurs,
je ne peux être tenu responsable de leurs résultats. Ils sont destinés à
l’apprentissage et ne doivent pas servir à concevoir un pont.

Use and liability: While I believe these tools to be free of error, I cannot be held
liable for their results. They are to be used for instruction and should not be used
to design a bridge.

## Développement et publication

Pour installer les sources, tester, reconstruire les livrables ou publier sur
GitHub Pages, consultez [le guide développeur](README_DEVELOPER.md).
[Validation](VALIDATION.md) · [Notices des composants tiers](THIRD_PARTY_NOTICES.md).

## Complément 0.9.5

- **Propriétés de section** : choix de la région en premier. Région négative :
  dalle fissurée ignorée, I′ = poutre d’acier + armatures (traction), sans 3n
  ni 1n. Point S3 : y saisi pour chaque configuration (acier, 3n, 1n, I′), y
  compris pour l’acier seul. Schéma de la section agrandi.
- **Non prismatique** : section d’appui à hauteur constante centrée sur chaque
  appui intermédiaire (400 mm par défaut); les goussets commencent au-delà.
  Les projets antérieurs s’ouvrent avec 0 (géométrie inchangée).
- Langue par défaut : français.
- **Contraintes** : bouton « σ Contraintes ↗ » et aperçu au survol des
  enveloppes (profil, ANE, côtés compression / traction); double-clic pour la
  fenêtre complète, où l’on change la station (◀ ▶, x, curseur) et le y de S3.
  Profils en trait continu depuis σ = 0, ANE en pointillés; lignes dessus /
  dessous de dalle et armature inf. retirées du tableau.

## Nouveautés 0.9.99

- **Coupure ou rotule du tablier à n’importe quelle station** (onglet Géométrie, « Coupure du tablier ») : étapes de lancement ou de démolition. Une **coupure** (sciage) sépare le tablier en deux poutres indépendantes, ni V ni M ne la traversent; une **rotule** transmet l’effort tranchant avec M = 0 (elle ne représente pas un tablier scié). Avec une coupure, on garde les deux tronçons, ou seulement celui de gauche ou de droite : le tronçon retiré n’a ni rigidité, ni charge, ni réaction (hachuré sur la poutre et les diagrammes). Chaque tronçon conservé doit tenir sur ses propres appuis, sinon un message « mécanisme » clair. Enveloppes, lignes d’influence, surcharge gouvernante, déformations imposées et modes propres tiennent compte du joint (PyCBA : nœud libre, membrure relâchée ou lien sans rigidité).
- **Inertie des sections simplifiée :** pour une poutre en acier ou NEBT, l’analyse prend la poutre seule, la section mixte 3n ou 1n (M+) ou l’inertie fissurée I′ (M−, acier + armatures). Le multiplicateur M n’est plus saisi (il vaut I config / I poutre, affiché). Les projets avec M ≠ 1 le gardent, signalé, jusqu’à un autre choix. L’exemple « deux travées » a maintenant une dalle : S1 mixte 1n (3,91, au lieu de M = 3,92), S2 I′ fissurée (1,09, au lieu de 1,12).
- **Onglet Résistance :** plus de Mr/Vr sur les diagrammes principaux (Enveloppe, Surcharge gouvernante) ni d’interrupteur « Déterminer la résistance »; les D/C maximaux et le bouton **Note de calcul** sont en bas du panneau.
- **Note de calcul refaite :** diagrammes V et M superposés avec Vr et Mr (tirets), bandes rouges en cas de dépassement, rapports gouvernants, curseur de station (clic, glisser, ← →); choix des efforts comparés : **permanentes, surcharge ou les deux**; pastilles D/C compactes; à gauche, section, **propriétés géométriques** et **matériaux et coefficients**; à droite, les **efforts à la station par étape de charge** (M et V : poids propre, charges « poutre seule », autres permanentes, surcharge max/min) puis les calculs, **une valeur par ligne**.
- **Poutre mixte :** pas de déversement en M− des classes 1-2 (semelle comprimée retenue), et Frd (10.10.4.4) réservé à la poutre acier seule.
- **Fenêtre Propriétés de section :** un bouton **OK** valide la section; le pont est alors recalculé si la dalle change une inertie mixte de l’analyse. L’inertie de l’analyse se choisit seulement sur la carte de section (4 types une fois la dalle définie).
- **Correctif (trouvé après le premier envoi 0.9.99) :** la base d’analyse en cache était reconstruite sans la dalle, donc une inertie mixte (3n, 1n, I′) revenait à la poutre seule. Vérifié par la méthode des forces sur l’exemple mixte : M− des permanentes = −2 101 kN·m (indépendant −2 102; −2 898 avant le correctif).
- **Fenêtres flottantes** redimensionnables depuis chaque bord et chaque coin.
- Schéma de projet 16.

## Nouveautés 0.9.98

- **Résistance le long du pont.** L’onglet Résistance ne demande plus Mf, Vf ni coefficients de résistance : à chaque station, il prend les efforts pondérés de l’analyse (permanentes + vive, facteurs saisis : Mf+ = max(M max, 0), Mf− = max(−M min, 0), Vf = max |V|) et la section en place, goussets compris. Plus de sous-onglets ni de groupe Résultats. Première commande : **« Déterminer la résistance »** : Mr+, Mr− et ±Vr tracés en tirets autour des enveloppes M et V (vues Enveloppe et Surcharge gouvernante, pas en Écarts ni en lignes d’influence), avec la station gouvernante, son D/C, des bandes rouges là où l’enveloppe dépasse la résistance et les valeurs sous le curseur. Le panneau affiche les D/C maximaux de M+, M−, V et de l’interaction V-M avec leur position (clic : note de calcul à cette station).
- **Type de résistance par section.** Liste des sections de poutre avec deux cases à cocher, Mixte et Acier seul (mixte : dalle des « Propriétés de section »).
- **Poutre d’acier seule (S6-25 10.10).** M+ et M− avec déversement sur la longueur non retenue L (6000 mm par défaut, seule donnée), ω2 = 1 : Mu avec βx (C10.10.2.3), B1, B2, J, Cw; classes 1-2 avec Mp, classe 3 avec My = Fy min(S); âme de classe 4 : Mr × Frd (10.10.4.4) calculé pour le Mf de chaque station; semelle de classe 4 : Se (10.10.3.4). Reproduit la feuille de l’auteur : βx −852 mm, B1 −2,1, B2 2,8, Mu 8 151 kN·m, My 5 060, Mr 4 567, Frd 0,992, Mr′ 4 531 kN·m, Mf 4 500 → 99,3 %.
- **Classe = la pire des trois plaques** (semelle sup., semelle inf., âme; âme h/w en mixte, 2dc/w pour l’acier seul). Classe 4 en poutre mixte : règles de la classe 3, signalée.
- **M− mixte de classe 3 :** Fcr de la semelle inférieure par déversement sur L (10.10.3.3); Mfd est la part « poutre seule » du moment permanent (poids propre et charges « poutre seule »); le D/C utilise un Mr équivalent = Mfd + le plus grand moment mixte qui respecte a), b), c).
- **Interaction V-M (10.10.5.2)** calculée pour les âmes raidies avec champ de tension (h/w > 502 √(kv/Fy)) : 0,727 Mf/Mr + 0,455 Vf/Vr ≤ 1, avec le plus grand des rapports M+ et M− (enveloppes : conservateur).
- **Note de calcul** dans une large fenêtre flottante : choix de la station sur un ruban D/C le long du pont (clic, glisser, ← →, ◀ ▶ ou x), récapitulatif des efforts, résistances et rapports en tête, blocs compacts côte à côte (section et classe, cisaillement et interaction, M+, M−).
- **Niveaux d’évaluation pour le CL-625 seulement** (le CL-750-QC n’est pas un véhicule d’évaluation; les anciens projets reviennent à ses charges de calcul). Classes de route C et D réunies (q = 7 kN/m); la classe d’évaluation suit la classe de route FT (A/B, C/D).
- **Culées intégrales :** le moment d’encastrement s’appelle **Me** (diagrammes, lignes d’influence, Excel); Mr est réservé au moment résistant.
- Schéma de projet 15 (les données de résistance de 0.9.97 sont retirées).

## Nouveautés 0.9.97

- **Onglet Résistance (nouveau).** Quatrième onglet du modèle, à droite de Charges, avec un premier sous-onglet « Poutre en acier » : résistance pondérée d’une poutre assemblée mixte, CSA S6-25, chapitre 10. Classe de section (10.9.2.1 : semelle sup. et âme en M+, semelle inf. et âme en M−); Mr+ entièrement plastique (10.11.5.2, axe neutre plastique dans la dalle ou dans l’acier) ou classe 3 (10.11.6.2, profondeur d’âme comprimée comparée à 850 w/√Fy, figure 10.8 au-delà); Mr− plastique pour les classes 1 et 2 (10.11.5.3.1, semelle retenue) ou contraintes élastiques pour la classe 3 (10.11.6.3.1 : Mfd sur l’acier, Mfsd + Mfl sur acier + armatures); Vr (10.10.5.1, espacement a des raidisseurs ou âme non raidie, signal si Vf > 0,6 Vr). Géométrie, dalle et armatures viennent de la section et de sa dalle des « Propriétés de section »; Mf+, |Mf−| et Vf sont saisis ou repris de l’enveloppe actuelle. Barres D/C dans le panneau; une feuille de calcul flottante donne toutes les valeurs intermédiaires. Reproduit exactement la feuille de validation de l’auteur (Mr+ 17 494 kN·m, 62,9 %; Vr 2 602 kN, 92,2 %). Affichage seulement : ne modifie jamais l’analyse. Poutre d’acier seule et classe 4 : à venir.
- **Niveaux d’évaluation (S6-25, chapitre 14).** CL-625 et CL-750-QC acceptent un niveau d’évaluation : 1 (CL1-W, 5 essieux), 2 (CL2-W, essieux 1 à 4, 0,76 W) ou 3 (CL3-W, essieux 1 à 3, 0,48 W), W = 625 ou 750 kN, essieux 0,08, 0,2, 0,2, 0,28, 0,24 W (figure 14.1). Charge de voie : 80 % des essieux du niveau plus q de la classe de route (A 9, B 8, C/D 7 kN/m). En évaluation, la fraction MTQ automatique 63/80 % est désactivée.
- **Charge piétonnière, expression S6-25.** p = 4,25 (0,5 + √(5/s)) kPa, au plus 4,25 kPa, s étant la longueur chargée totale; les coefficients modifiables de 0.9.96 sont retirés. Le tableau suit la largeur tributaire pendant la saisie; le titre de la sous-section n’affiche plus de valeur de charge.
- **Implantation de la charge de voie.** Toujours sur les travées qui augmentent chaque effet (le défaut de 0.9.96); l’option et ses explications sont retirées, les anciens projets s’ouvrent ainsi.
- **Étiquettes des diagrammes.** Le cisaillement et la flèche affichent le maximum et le minimum de chaque travée, en enveloppe et en écarts Δ, comme les moments.
- **Surcharge gouvernante.** Une astuce au-dessus des diagrammes indique qu’on peut cliquer sur n’importe quel diagramme, à n’importe quelle station, pour voir la surcharge qui produit cet effet (masquable).
- **Ressorts de culée intégrale.** L’aide explique le degré de fixité : k / (k + Σ 3EI/L des travées adjacentes), soit la rigidité relative du ressort et de la superstructure.

## Nouveautés 0.9.96

- **Charge de voie là où elle augmente l’effet.** Commentaire S6, C3.8.4.1 : les essieux et la charge uniformément répartie ne s’appliquent que là où ils augmentent l’effet total. Pour chaque effet, la charge répartie de la voie ne charge plus que les travées dont la contribution a le signe recherché (nouveau défaut « Travées qui augmentent l’effet »). Options : « Parties de ligne d’influence » (portions de travée là où la ligne d’influence a ce signe) et « Pont complet » (méthode jusqu’à 0.9.95). La vue « Surcharge gouvernante » dessine les travées chargées. Les anciens projets s’ouvrent avec le nouveau défaut.
- **Charge piétonnière (S6, art. 3.8.9).** Nouvelle sous-section « Charge piétonnière » dans Charges, utilisée à la place du véhicule (jamais les deux). p = a − s/b kPa entre p min et p max, s étant la longueur chargée totale; les valeurs par défaut sont celles de la S6-19 (5 − s/30, de 1,6 à 4,0 kPa) en attendant de confirmer l’expression de la S6-25, et chaque coefficient est modifiable. La largeur tributaire est la largeur effective de la dalle si une dalle est définie, sinon 2000 mm (modifiable). Toutes les combinaisons de travées chargées (2^n − 1) sont évaluées : l’enveloppe suit la disposition la plus critique. Option : enveloppe avec le véhicule d’entretien, qui est une autre surcharge, jamais ajoutée aux piétons. Ni CMD, ni facteur d’essieu, ni FT; le facteur de charge vive s’applique. Un clic sur les diagrammes montre la disposition gouvernante (travées chargées, s, p, w).
- **Noms.** « Camion gouvernant » devient « Surcharge gouvernante »; les onglets de cas deviennent « Vive » et « Permanente + vive ». Le gradient bilinéaire s’appelle « ossature type B », 30 °C dans la dalle par défaut (au lieu de 35). La pastille S6-25 est retirée des titres de la sous-section et de la fenêtre FT.
- **Tableaux FT.** Cisaillement de la poutre extérieure : une ligne FT, puis une ligne FT × Fs (deux états limites). Le a deux lignes : son expression (0,75 L, 0,20 (L1+L2)…) et son application numérique (0,75 × 34,80 = 26,100).
- **Étiquettes des diagrammes.** Un plateau (cisaillement constant d’une déformation imposée) n’est étiqueté qu’une fois. Les moments affichent toujours le M+ maximal de chaque travée et le M− de chaque pile, en enveloppe comme en écarts Δ; les écarts Δ suivent les mêmes règles que l’enveloppe.
- **Langue et Excel.** L’interface s’ouvre dans la langue du navigateur (français ou anglais) si aucun choix n’a été enregistré. Le nom du fichier Excel contient le nom du modèle, la version de QuickerBridge et la date d’export; la feuille Modèle reprend le nom et la date et l’heure d’export.
- **Pastille FT.** « FT S6-25 appliqué : valeurs par poutre » est maintenant sur la ligne de l’avertissement au lieu de chevaucher le croquis.

## Nouveautés 0.9.95

- **Bandeau des cas d’analyse.** Les cinq cas (Permanente, Routière, Permanente + routière, Déformation imposée, Modes propres) forment un bandeau au-dessus du croquis de la poutre. Le croquis ne garde que le nom du modèle : plus de titre, de légende des charges ni d’encart de section. Le croquis des modes propres a maintenant la même longueur que les autres.
- **Onglets d’affichage.** Enveloppe · Écarts Δ · Camion gouvernant · Lignes d’influence. Écarts Δ est un onglet (V, M et δ seulement, sans EI ni réactions). Camion gouvernant montre la position du moment positif maximal (cliquer un extrême pour en voir un autre); la rangée position / inverser / animer est retirée. Les lignes d’influence ne répètent plus le diagramme des réactions. La légende « enveloppe min / max » est retirée.
- **Étiquettes des pics.** Chaque partie indépendante du pont (séparée par une travée isostatique ou une pile dédoublée) affiche ses propres extrêmes de V, M et flèche, et tout pic à 0,5 % près de l’extrême global est aussi étiqueté, pour voir la symétrie d’un coup d’œil. Les quatre valeurs maximales sont arrondies au supérieur, sans décimale sauf une pour la flèche.
- **FT dans sa propre fenêtre.** « Régler le FT… » ouvre une fenêtre flottante, comme les contraintes. FT y est toujours calculé; la case « Appliquer le FT S6-25 aux enveloppes » de l’onglet Charges (désactivée par défaut) l’applique. Le tableau par zone a une ligne Fs. Plus d’alerte « DVE limité à 3,0 m ».
- **Interface allégée.** Plus d’avertissement de saut de rigidité ni de cercles rouges sur EI; plus d’avertissement de soulèvement pour la surcharge routière seule; exemples sans description; noms des cas au singulier. L’aperçu des contraintes au survol est désactivé par défaut (case à côté de « σ Contraintes »). « Agrandir les diagrammes » est remplacé par une flèche qui réduit le panneau du modèle. Le menu Exemples s’ouvre au-dessus de toutes les fenêtres.
- **Lisibilité et clavier.** Le texte secondaire, les échelles des diagrammes et les noms des séries atteignent le contraste WCAG AA; le texte fonctionnel fait au moins 11 px. Les menus Fichier et Exemples se parcourent aux flèches et se ferment avec Échap; les onglets et boutons d’options annoncent leur état aux lecteurs d’écran; un diagramme sélectionné au clavier avance de station en station avec ← → (Maj : 10 stations, Début / Fin) et annonce les valeurs. Surfaces plus sobres (sans dégradés ni bordures latérales), avertissement dans la colonne des résultats, et « FT S6-25 appliqué : valeurs par poutre » au-dessus des valeurs maximales quand FT est appliqué.

## Nouveautés 0.9.9

- **Protection du travail.** « Réinitialiser » demande confirmation quand le modèle a des modifications non enregistrées (enregistrer, réinitialiser sans enregistrer ou annuler). Quitter la page avec des modifications non enregistrées demande confirmation. Le modèle non enregistré est conservé dans ce navigateur et proposé au démarrage suivant (« Modèle non enregistré retrouvé » : Restaurer / Ignorer). Ctrl+Z / Ctrl+Y annulent et rétablissent les modifications du modèle (saisies, fichiers ouverts, exemples, réinitialisation), aussi par **Fichier → Annuler**.
- **Type d’analyse séparé du cas de charge.** L’en-tête des résultats a deux commandes : **Statique / Modes propres**, puis les quatre cas de charge (Permanentes, Routières, Permanentes + routières, Déformation imposée). Le cas de charge est conservé pendant l’affichage des modes. L’en-tête passe à la ligne au lieu de déborder sur les écrans moyens et étroits.
- **Erreurs plus claires.** Une valeur invalide affiche son message (p. ex. la plage admise) juste sous la case pendant la saisie. La fenêtre des contraintes n’affiche plus en erreur des valeurs valides de station et de S3. L’export Excel indique pourquoi il n’est pas disponible (moteur en chargement, calcul en cours, valeurs invalides).

## Nouveautés 0.9.8

- **Calcul plus rapide.** Premier calcul d’un pont non prismatique à 6 travées : environ 40 fois plus rapide (règle de Gauss mise en cache dans PyCBA); chaque recalcul de charge vive : 4 à 5 fois plus rapide (toutes les combinaisons d’essieux traitées d’un coup, de façon exacte; les positions « essieu exactement sur une station » ne sont évaluées que pour cette station). Écart sur les enveloppes : moins de 0,01 %. Pendant un calcul, les modifications sont regroupées en un seul recalcul du dernier état, avec un délai d’attente qui s’adapte à la durée du calcul précédent.
- **Pile dédoublée** (onglet Géométrie, type d’appui) : joint de tablier sur une pile, deux appareils d’appui. Les travées de part et d’autre sont indépendantes; le diagramme, le tableau des stations et l’export Excel donnent deux réactions (g / d).
- **Sections.** EI direct défini par EI, par f′c et γc (E calculé) avec I, ou par E (MPa) et I. Poutres NEBT : f′c (50 MPa) et γc (24,5 kN/m³) → E affiché; γc ajuste aussi le poids propre. Sur une poutre avec dalle, l’inertie de l’analyse peut venir directement de la section mixte 1n, 3n ou I′ : M est alors calculé et grisé (jamais appliqué deux fois). Dalle par défaut de 225 mm. Une section inutilisée peut être supprimée.
- **Interface.** Cases de saisie à la QuickerUnits (séparateur des milliers, virgule décimale en français, calcul permis : `2*17,4`), nom du modèle bien visible (aussi dans le cadre de la poutre), menu **Fichier** (Ouvrir, Enregistrer, Comparer, Excel; Ctrl+O, Ctrl+S) et menu **Exemples** (4 ponts anonymes, FT non appliqué). Le schéma de la poutre nomme les sections de chaque zone. Les illustrations de déformation imposée dessinent la vraie poutre (acier, NEBT ou EI).
- FT : la largeur hors-tout B = (N − 1)·S + 2·Sc est mise en évidence avec la bordure (B − Wc)/2.

## Nouveautés 0.9.7

- **Fraction MTQ automatique (CL-750-QC).** Activée par défaut : la voie de 12,6 kN/m accompagne le camion à 63 % ou 80 % de ses essieux selon l’effet, comme dans l’Info-structures A2023-05 du MTQ (63 % pour le M+ hors des zones de M− des appuis, l’effort tranchant, les ponts à une travée et les réactions sans continuité du tablier; 80 % pour le M−, le M+ dans les zones de M− sur piles, les réactions sur piles continues et les flèches). Décochez-la pour choisir 63 % ou 80 % à la main. La charge de voie couvre toujours tout le tablier (cas « bumper-to-bumper » de S6), comme avant. Les réactions d’appui forment maintenant un cinquième diagramme avec des flèches aux appuis, à la place du tableau sous les diagrammes.
- Le véhicule circule toujours dans les deux sens; l’option « sens de circulation » est retirée (les anciens fichiers s’ouvrent sans changement).
- Jusqu’à 7 travées. La section au curseur (poutre, dalle, ou rectangle « EI ») est dessinée dans le cadre de la poutre.
- « Thermique » devient **Déformation imposée** : gradient thermique (profil illustré), retrait de la dalle (250 × 10⁻⁶ par défaut) et fluage de la dalle (ε = φ σc / Ec), chacun analysé seul, sur la section mixte à long terme k·n (k = 3 par défaut).
- Contraintes : l’aperçu au survol montre la contrainte de l’armature sup. dans les deux cas, sans valeur de dalle, et la légende M max / M min; la fenêtre complète a un croquis de la poutre avec curseur (clic ou glisser pour changer de station).

## Nouveautés 0.9.6

- Corrections d’audit : la section d’appui constante de la 0.9.5 est retirée (elle écrasait les zones non prismatiques; les anciens fichiers s’ouvrent toujours); les armatures doivent être dans la dalle; les étapes de chargement des contraintes sont enregistrées dans le projet; un seul schéma de projet (9).
- Poutres NEBT : propriétés de section (A, I, yb, h tabulés; section mixte avec n = Eg/Ec et armatures m = Es/Eg; région négative I′) et contraintes comme pour l’acier. Un pont en NEBT ne peut pas être non prismatique.
- Contraintes : aperçu instantané au survol, échelle fixe selon la traction et la compression extrêmes du pont, valeurs en MPa sur le dessin colorées selon le signe, S1 à S5 repérés dans la fenêtre complète.
- Onglet FT toujours visible, aucun facteur d’essieu par défaut. Cisaillement ÉLF des dalles, n ≥ 2 : formule imprimée de chaque tableau (A/B : 3,20 + 0,10 Le; C/D : 3,20 + 0,10/Le). Feuille Excel FT complète.
- Valeurs de lecture aux couleurs des diagrammes et à côté des points; fenêtre « Méthode et hypothèses » en haut à droite; explication de la précision standard / fine.
- Complément : lecture V et M sans décimale, flèche à 0,1 mm; les deux valeurs de chaque diagramme (et EI) suivent les points sans jamais se superposer; l’échelle des contraintes suit tout changement de section; réglages FT réunis dans l’onglet FT, la carte de gauche n’affiche que l’état.
- Complément 2 : choix « poutre seule / mixte 3n » par charge permanente (poids propre toujours sur la poutre seule, bouton « + Poids de la dalle »); Fs sur V et R des permanentes (poutre ext.) activable; gradient thermique avec la hauteur des sections et profil bilinéaire type S6-25 (35 °C dans la dalle); fenêtres flottantes déplaçables; valeur Δ au point en mode écarts.
