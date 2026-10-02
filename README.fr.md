# QuickerBridge 0.9.6 — guide en français

[English README](README.md)

**Anthony Chéruel · 2026-10-01 · Français / English**

Un outil de calcul préliminaire de poutres continues de ponts, avec PyCBA dans le
navigateur. Géométrie, charges et diagrammes restent réunis dans une interface
compacte. Aucune installation de Python et aucun serveur local pour les utilisateurs.

## Démarrer

- **Sur le web :** https://acfakkoh.github.io/QuickerBridge/ (GitHub Pages, publié à chaque mise à jour de `main`).
- **Fichier reçu :** ouvrez `QuickerBridge-v<version>-<date>.html` (p. ex. `QuickerBridge-v0.9.6-2026-10-02.html`) dans un navigateur moderne. Si vous
  recevez l’archive portable, extrayez-la avant d’ouvrir le HTML.
- Une connexion Internet est nécessaire au démarrage pour charger Pyodide et ses
  bibliothèques. Le cache peut accélérer les ouvertures suivantes; cette édition
  ne garantit pas un fonctionnement hors connexion.
- FR est la langue initiale. Le bouton EN/FR en haut mémorise ensuite votre choix.

Les calculs s’exécutent dans un processus de travail du navigateur. Les données du
pont ne sont pas envoyées à un serveur de calcul. Fermer l’onglet interrompt le calcul.

## Saisir un modèle

1. **Géométrie :** choisissez 1 à 5 travées, leurs longueurs en mètres et les appuis.
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
3. **Charges :** choisissez permanentes, routières, les deux, ou thermique seul.
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
inférieure **600 × 50 mm**. E = 200 GPa; multiplicateur d’inertie M = 1.
Ces valeurs sont des données de départ, pas une validation de ce pont.

### Rigidité et zones non prismatiques

Le multiplicateur d’inertie M agit sur **EI = E × I acier × M**. M = 4 quadruple
la rigidité. L’inertie affichée reste celle de l’acier brut; EI inclut M. Ce moyen
permet une hypothèse de rigidité effective, sans calculer une dalle transformée,
son centre de gravité, les contraintes ou la résistance composite.

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
- **Animation :** en « Position du camion », ▶ Animer rejoue 60 positions
  précalculées du véhicule complet; le curseur réutilise ces positions sans recalcul.
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

Define 1–5 spans, supports, steel plates or direct constant EI, then select dead,
live, combined, or thermal-only loading. An inertia modifier multiplies the gross
steel I for stiffness only; it does not calculate composite section properties.
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
the full bridge; the optional 90% two-truck HL-93 case uses adverse lane regions
for negative moments and interior reactions, with at least 50 ft clear headway
and fixed 14 ft truck axle spacings. The maintenance vehicle is 24 + 56 kN at 2.0 m, with no lane load
or dynamic allowance. Truck and lane cases are alternatives. No automatic self-weight,
load combinations, transverse
load distribution, shear deformation, staged construction, prestress, cracking,
resistance checks or code compliance verification is included. Numerical envelopes
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

## Nouveautés 0.9.6

- Corrections d’audit : la section d’appui constante de la 0.9.5 est retirée (elle écrasait les zones non prismatiques; les anciens fichiers s’ouvrent toujours); les armatures doivent être dans la dalle; les étapes de chargement des contraintes sont enregistrées dans le projet; un seul schéma de projet (9).
- Poutres NEBT : propriétés de section (A, I, yb, h tabulés; section mixte avec n = Eg/Ec et armatures m = Es/Eg; région négative I′) et contraintes comme pour l’acier. Un pont en NEBT ne peut pas être non prismatique.
- Contraintes : aperçu instantané au survol, échelle fixe selon la traction et la compression extrêmes du pont, valeurs en MPa sur le dessin colorées selon le signe, S1 à S5 repérés dans la fenêtre complète.
- Onglet FT toujours visible, aucun facteur d’essieu par défaut. Cisaillement ÉLF des dalles, n ≥ 2 : formule imprimée de chaque tableau (A/B : 3,20 + 0,10 Le; C/D : 3,20 + 0,10/Le). Feuille Excel FT complète.
- Valeurs de lecture aux couleurs des diagrammes et à côté des points; fenêtre « Méthode et hypothèses » en haut à droite; explication de la précision standard / fine.
