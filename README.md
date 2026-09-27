# QuickerBridge 0.5

**Anthony Chéruel · 2026-09-27 · Français / English**

Un outil de calcul préliminaire de poutres continues de ponts, avec PyCBA dans le
navigateur. Géométrie, charges et diagrammes restent réunis dans une interface
compacte. Aucune installation de Python et aucun serveur local pour les utilisateurs.

## Démarrer

- **Sur le web :** ouvrez le lien GitHub Pages fourni par l’auteur.
- **Fichier reçu :** ouvrez `QuickerBridge.html` dans un navigateur moderne. Si vous
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
2. **Sections :** saisissez les dimensions des tôles en mm et E en GPa, ou une
   rigidité EI constante directement en kN·m². La hauteur comprend les semelles.
3. **Charges :** choisissez permanentes, routières, les deux, ou thermique seul.
   Plusieurs charges uniformes sont possibles. CL-750QC à 80 % est le choix initial;
   CL-625, le camion et le tandem AASHTO HL-93, le train Cooper E, le véhicule
   d’entretien 24 + 56 kN et un véhicule personnalisé de 1 à 7 essieux sont disponibles.
   Chaque charge permanente a son facteur. Le facteur routier multiplie tout le cas
   routier; le facteur d’essieu multiplie seulement les charges d’essieux.
4. Attendez la fin du calcul, puis inspectez les diagrammes et le tableau.
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

### Enveloppes et thermique

Les deux lignes épaisses limitent les enveloppes min/max. Chaque extrême peut
venir d’une disposition de charges différente. Cliquez sur un extrême pour voir
la disposition compatible. Les flèches d’essieux et leurs nombres montrent les
 **charges nominales multipliées par le facteur d’essieu**; dans un cas de voie
 canadien, elles incluent aussi la réduction de voie. Elles n’affichent jamais le
 CMD ni le facteur routier global.
Moment positif en travée, flèche positive vers le bas,
réactions positives vers le haut.

Le mode thermique applique seul un gradient linéaire : ΔT = Tdessus − Tdessous.
Saisissez α en 10⁻⁶/°C et une hauteur thermique de référence en mm. Cette hauteur
est indépendante de la géométrie des sections. Le même gradient et la même
courbure libre sont appliqués à toutes les travées. Un dessus plus chaud courbe
la poutre vers le haut. Le cas thermique ne se superpose pas aux autres charges.
PyCBA reçoit une courbure imposée; il ne définit pas nativement un profil thermique
bilinéaire dans la hauteur. Cette version conserve donc le gradient linéaire explicite.

### Enregistrer, rouvrir et exporter

**Enregistrer** télécharge un fichier `.quickerbridge.json` avec les paramètres.
**Ouvrir** vérifie le fichier et recalcule les résultats. Aucun diagramme ni résultat
n’est sauvegardé dans le projet. Enregistrez avant de fermer le navigateur.
Les anciens projets dont les tôles variaient continûment doivent être consultés
avec v0.3 puis redéfinis explicitement en zones dans v0.4; l’application les signale.

**Excel** exporte les enveloppes, les réactions et le modèle, même si une position
particulière du camion est affichée. En mode thermique, il exporte ce cas unique.
Les appuis partagés ont deux lignes pour les cisaillements gauche et droite.
Le bouton **Agrandir les diagrammes** masque temporairement les entrées et agrandit
les trois graphiques sans relancer le calcul.

### Si le calcul paraît lent

Le premier démarrage télécharge le moteur. Ensuite, modifier la géométrie ou EI
reconstruit les fonctions d’influence; modifier uniquement les charges peut les
réutiliser. Les zones nombreuses, cinq travées et le mode Fin prennent plus de temps.
Les calculs non prismatiques de v0.4 évitent de recalculer inutilement la rigidité.
Si le moteur ne démarre pas, vérifiez la connexion et rechargez la page. Si une
entrée est invalide, corrigez-la avant d’utiliser les résultats grisés.

## English quick guide

Open the provided GitHub Pages link, or double-click the extracted
`QuickerBridge.html`. **No Python installation or local server is needed.** Internet
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
the full bridge. The maintenance vehicle is 24 + 56 kN at 2.0 m, with no lane load
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
