"use strict";
const QB_META=window.QB_META||{version:'0.4',date:'2026-09-15',author:'Anthony Chéruel'};
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const words = {
 en: {
  excelPreparing:"Preparing Excel export (first use downloads openpyxl)…",preloaded:"Pre-computed default results · calculation engine loading…",solvingAfterBoot:"Will calculate as soon as the engine has loaded…",retrying:"Download failed, retrying",attempt:"attempt",bootFailedTitle:"The calculation engine could not be downloaded.",bootFailedStage:"Blocked at:",bootAttempts:"attempts",bootStalled:"no response from the server (download stalled)",bootHint:"A company network or proxy may be blocking cdn.jsdelivr.net (Python runtime and libraries) or pypi.org (Excel only). Try again, use another network, or ask IT to allow these hosts. Already downloaded files stay in the browser cache.",bootRetry:"↻ Try again",excelUnavailable:"Excel export is unavailable: the openpyxl module could not be downloaded (pypi.org blocked?). The analysis itself works normally.",fixed:"Fixed (integral abutment)",spring:"Rotational spring k",springK:"k (kN·m/rad)",fixity:"Fixity",springHelp:"Rotational spring: vertical movement blocked, rotation resisted by k (kN·m/rad), e.g. an integral abutment on flexible piles. Fixity = k / (k + Σ3EI/L of the adjacent spans): 0 % pinned, 100 % fixed. Default k gives 50 %. Bracket k between realistic soil–pile bounds.",fixedHelp:"Fixed = rotation and vertical movement restrained (integral abutment, upper bound of fixity). A real integral abutment is partially restrained by its piles and backfill: compare with pinned supports to bracket the response. Axial restraint, earth pressure and thermal expansion of the deck are not modelled.",platesFrom:"Plates, E and M from",platesStart:"Start section",platesEnd:"End section",platesDeep:"Deeper section",platesHelp:"In a tapered zone only the overall depth varies. This option chooses which section supplies the flange and web plates, E and the inertia modifier M. Start (v0.4 default): swapping start/end sections on the other side of a pier does NOT mirror the haunch. Deeper: the pier (deep) section plates are used on both sides, so a haunch drawn S1→S2 and S2→S1 is a true mirror. End: the target section supplies the plates.",influence:"Influence lines",ilHint:"Click any diagram to move the station. Unit load of 1 kN, downward.",ilAt:"Influence lines at",ilGoverning:"Governing M max arrangement",ilSum:"axles Σ η·P",ilLaneNote:"lane load not included in Σ η·P",play:"▶ Animate",stop:"■ Stop",animating:"Crossing animation",upliftTitle:"Uplift:",upliftLive:"negative reaction under live load alone. Combine with factored dead load before concluding.",upliftBoth:"negative reaction under dead + live load: check bearing hold-down or anchorage.",upliftDead:"negative reaction under dead load.",upliftSnapshot:"negative reaction in this arrangement.",momentReaction:"Mr (kN·m, CCW +)",stiffnessJumpTitle:"Stiffness step:",stiffnessJumpHelp:"In a tapered zone only depth varies; plates, E and M come from the section chosen in “Plates, E and M from” (start section by default). Check that these steps are intended, e.g. a composite/cracked modifier change at a zone boundary.",zone:"zone",loadFactor:"Load factor",axleFactor:"Axle factor",maintenance:"Maintenance vehicle",maintenanceHelp:"Two axles: 24 and 56 kN at 2.0 m. Vehicle only; no companion lane load or dynamic allowance.",focus:"Focus diagrams",thermalTop:"Top",thermalBottom:"Bottom",canadianLaneFullHelp:"The companion UDL covers the full bridge. Axle labels include the lane reduction and axle factor, but never dynamic or overall live factors.",zoneMirrorHelp:"For a mirrored haunch, reverse the start and end sections on the matching span and set “Plates, E and M from” to Deeper section on both zones.",loadBodyCurrent:"CL-625 and CL-750-QC check every nonempty axle subset at its original spacing. CAN/CSA S6-25 clause 3.8.4.5.3 governs truck-only dynamic allowance. Their lane cases use reduced axles without DLA plus a companion UDL over the full bridge. HL-93 checks the complete truck or tandem with 33% DLA on axles only. Cooper uses the complete E-series train. The maintenance vehicle is 24 + 56 kN at 2.0 m with no lane load or DLA. The optional HL-93 supplementary case applies 90% to two trucks and adverse lane regions, with fixed 14 ft axle spacings and at least 50 ft clear headway. Only negative moments around interior piers and their vertical reactions are enveloped. Truck centres occupy adjacent spans; Standard/Fine controls the travel grid.",scopeBodyCurrent:"These are one-lane longitudinal effects. User load and axle factors are applied exactly as entered. No automatic ULS/SLS, RL lane modification, transverse distribution, deck-joint allowance, or buried-structure rules are added. Fixed (integral) abutments restrain rotation fully and report a moment reaction Mr (counter-clockwise +); real abutment fixity lies between pinned and fixed. Influence lines show the effect of a 1 kN downward load; the crossing animation replays 60 precomputed full-vehicle positions.",precisionHelpCurrent:"Standard: travel spacing no greater than 0.25 m. Fine: no greater than 0.10 m, with denser influence and deflection sampling.",
  inertiaModifier:"Inertia modifier M (×)",modifierHelp:"EI = E × I steel × M. M = 4 gives four times the stiffness. Area and centroid remain steel-only; no transformed composite section is calculated.",legacyTaper:"This older project interpolates plate dimensions. Open it with v0.3, then redefine its zones for depth-only tapers in v0.4.",
  sectionType:"Section definition",girder:"Steel I-girder dimensions",directEI:"Constant EI (kN·m²)",updated:"Updated 2026-09-12",disclaimer:"Use and liability: While I believe these tools to be free of error, I cannot be held liable for their results. They are provided for instruction only and must not be used to design a bridge.",openProject:"Open",saveProject:"Save",untitled:"Untitled project",modified:"Modified",saved:"Project saved",opened:"Project opened",projectInvalid:"This project file is invalid or incompatible.",projectLarge:"The project file exceeds 1 MiB.",unsavedTitle:"Unsaved changes",unsavedBody:"Save the current project before opening the selected file?",cancel:"Cancel",discard:"Discard",saveThenOpen:"Save then open",thermal:"Thermal",thermalLoads:"THERMAL GRADIENT",deltaT:"ΔT = Ttop − Tbottom (°C)",alpha:"Thermal expansion α (10⁻⁶/°C)",thermalDepth:"Thermal reference depth (mm)",thermalHelp:"A linear top-to-bottom gradient is applied alone as a free imposed curvature on every span. Positive ΔT means the top is warmer and bows the beam upward.",thermalOnly:"Thermal gradient only",thermalScope:"All spans · imposed thermal curvature",thermalCase:"Single thermal case",maxMoment:"Maximum moment",minMoment:"Minimum moment",curvature:"Imposed curvature",thermalNotes:"Thermal-gradient model",thermalBody:"The linear temperature difference produces a uniform free curvature κ = −αΔT/h in PyCBA. The sign maps positive top heating to upward bowing, shown as negative deflection. The thermal case is solved alone and is never superposed with dead or live load.",
  brandSub:"CONTINUOUS BEAM WORKSPACE",modes:"Vibration modes",local:"PyCBA",model:"Bridge model",reset:"Reset",geometry:"Geometry",sections:"Sections",loads:"Loads",oneLane:"One lane · longitudinal effects",elastic:"Linear elastic · EI model",dead:"Dead",live:"Live",both:"Dead + live",initializing:"Loading calculation engine (first launch may take a minute)…",beamLoads:"BEAM & LOADS",diagrams:"Diagrams",table:"Station table",method:"Analysis notes",envelope:"Envelope",snapshot:"Truck position",frontAxle:"Front axle",reverse:"Reverse",range:"Min / max envelope",hoverHint:"Move across a diagram to inspect a station",supportReactions:"SUPPORT REACTIONS · kN ↑+",signs:"Sagging M + · deflection downward +",warning:"Indicative preliminary values only — not a substitute for detailed design.",spanCount:"NUMBER OF SPANS",spanLengths:"SPAN LENGTHS",span:"Span",support:"Support",supports:"SUPPORTS",pin:"Pinned",roller:"Roller",supportHelp:"Pins and rollers restrain vertical movement. The beam remains continuous over interior supports.",sectionMode:"SECTION MODEL",nonprismatic:"Non-prismatic / variable section",sectionHelp:"Choose girder dimensions or a direct constant EI in kN·m². Gross steel I is calculated from the plates. The inertia modifier multiplies I for stiffness only. EI-only geometry is schematic.",addSection:"+ Add section",E:"Elastic modulus E (GPa)",depth:"Overall depth h (mm)",top_width:"Top flange width (mm)",top_thickness:"Top flange thickness (mm)",web_thickness:"Web thickness (mm)",bottom_width:"Bottom flange width (mm)",bottom_thickness:"Bottom flange thickness (mm)",section:"Section",zone:"Zone",zoneEnd:"Ends at (% of span)",profile:"Variation",constant:"Constant",linear:"Linear depth",parabolic:"Parabolic depth",startSection:"Start section (start depth)",endSection:"End section (target depth)",addZone:"+ Split last zone",zoneHelp:"Zones run consecutively from 0% to 100%. Start section: initial height. End section: target height. Plates, E and modifier come from the section chosen below (start by default) and change only at the next zone. Positive/negative section names are fixed geometric zones, not automatic stiffness changes with moment sign.",deadLoads:"PERMANENT LOADS",addDead:"+ Add uniform load",allSpans:"All spans",intensity:"Intensity w (kN/m)",applyTo:"Apply to",from:"From (%)",to:"To (%)",liveLoads:"LIVE LOAD MODEL",vehicle:"Design vehicle",hl93Truck:"AASHTO HL-93 truck",hl93Tandem:"AASHTO HL-93 tandem",cooper:"AREA / AREMA Cooper E",cooperE:"Cooper E number",custom:"Custom vehicle",case:"Load case",governing:"Governing: truck / lane",truck:"Vehicle only",lane:"Vehicle + companion UDL",fraction:"Truck fraction in Canadian lane case",laneIntensity:"Companion UDL (kN/m)",hl93Spacing:"HL-93 truck rear-axle spacing: 4.3–9.0 m; all permitted spacings are enveloped.",cooperHelp:"Two PyCBA locomotives (18 axles) plus the Cooper companion UDL. The E number scales every axle and UDL load.",fullLaneHelp:"The companion UDL covers the bridge deck, matching PyCBA’s run_load_model behavior. It is not dynamically amplified.",canadianLaneHelp:"The displayed axle loads are reduced only by the Canadian lane fraction; dynamic allowance is never displayed or applied to a lane case.",noDynamic:"No dynamic allowance",appliedFactor:"Applied axle factor",fractionHelp:"63%: single spans; positive moment and vertical shear of multi-span bridges; other cases per A2023-05. The selected fraction applies to this entire lane-case result.",dynamic:"Apply vehicle dynamic allowance",factorHelp:"CAN/CSA S6-25: 1 axle ×1.40; 2 axles or 1–2–3 ×1.30; other groups of 3+ ×1.25. HL-93: ×1.33 on truck/tandem axles only. Cooper has no dynamic allowance.",axle:"Axle",load:"Load (kN)",spacing:"Gap after (m)",axleCount:"Number of axles",direction:"Travel direction",bothDirections:"Both directions",forward:"Left → right",backward:"Right → left",resolution:"NUMERICAL PRECISION",standard:"Standard",fine:"Fine",precisionHelp:"Standard: 0.25 m travel step. Fine: 0.10 m, denser influence and deflection sampling.",solving:"Calculating envelopes…",ready:"Analysis updated",failed:"Please check your inputs",invalid:"Check positive dimensions, span lengths, axle spacings and complete section zones.",offline:"The browser solver could not start. Check your connection and reload to download the calculation runtime.",sagging:"Max sagging",hogging:"Max hogging",maxShear:"Max |shear|",maxDeflection:"Max |deflection|",shear:"Shear",moment:"Moment",deflection:"Deflection",at:"at",nominalTruck:"Nominal axle loads shown · dynamic allowance is never displayed",deadOnly:"Permanent loads only",subdivisions:"Intervals per span",subdivisionHelp:"Report stations are independent of the solver and travel resolution. Shared supports have two rows for left/right shear; reactions appear once in downloads.",station:"Station",side:"Side",left:"Left",right:"Right",xLocal:"Local x",up:"up",down:"down",restore:"Show envelope",critical:"Governing arrangement",axles:"Axles",dynamicFactor:"DLA factor",unloaded:"No live load",totalLength:"Total length",elapsed:"Solve",positions:"positions",groups:"axle groups",reactionHelp:"Min / max at each support; each extreme can come from a different arrangement.",methodTitle:"Analysis basis",methodBody:"PyCBA solves the 1-D Euler–Bernoulli beam by the direct stiffness method. Pins and rollers restrain vertical movement and permit rotation; internal supports preserve beam continuity. Axial and shear deformation are excluded.",sectionNotes:"Section properties",sectionBody:"A, centroid and I are calculated from top flange, web and bottom flange using the parallel-axis theorem. E is homogeneous within each section. Tapers vary overall depth only; flange dimensions, web thickness, E and inertia modifier remain those of the zone start section and change abruptly at zone boundaries. The end section supplies only the target depth. EI = E × gross I × modifier; the solver uses a positive piecewise-linear EI profile. Direct EI sections use the supplied constant stiffness (kN·m²), without inferred area or inertia. Parabolic haunches are tangent at their shallower end. Gross properties are used, with no automatic cracking, composite action, prestress or self-weight.",loadNotes:"Truck groups and lane cases",loadBody:"Canadian CL-625 and CL-750-QC check all nonempty axle subsets at their original spacings. CAN/CSA S6-25 clause 3.8.4.5.3 governs their dynamic allowance, including the special 1–2–3 group. Their lane cases use reduced axles plus a patterned UDL, with no dynamic allowance on either component. HL-93 checks the complete truck or tandem. Its truck rear spacing is enveloped from 4.3 to 9.0 m, its 33% allowance applies to the axles only, and its 9.3 kN/m companion UDL is unamplified. Cooper uses PyCBA’s complete E-series train with its companion UDL. Truck and lane cases are alternatives in this tool.",scopeBody:"These are one-lane longitudinal effects. No ULS/SLS load factors, RL lane modification, transverse distribution factors, deck-joint allowance, or buried-structure rules are applied. Custom vehicle factors use individual axle counts; special-truck axle-unit rules are not inferred.",precisionTitle:"Resolution and results",precisionBody:"Reaction influence functions and PyCBA deflections are interpolated within each span. Shear and moment are recovered by section equilibrium. Deflection integration is corrected to satisfy zero displacement at supports. Report subdivisions never set calculation accuracy. Fine mode refines truck travel, influence sampling, EI profiles and deflection integration. An envelope is a collection of separate extremes, not one simultaneous load case; click an extreme or diagram to inspect its compatible arrangement.",unitsTitle:"Units and signs",unitsBody:"Bridge coordinates: m. Section dimensions: mm. E: GPa. Loads: kN and kN/m. Moment: kN·m, sagging positive and drawn below the beam axis. Deflection: mm, downward positive. Support reactions: kN, upward positive. The two shear limits at an interior support are kept separately.",sourceTitle:"References",noResults:"Results will appear after a valid analysis.",remove:"Remove",name:"Name",deleteSectionHelp:"This section is in use. Reassign its spans and zones before removing it.",busyExport:"Results are being updated. Exports become available when the calculation finishes.",snapshotHelp:"The entered position displays nominal axle labels. The solver still applies the selected code factor; a Canadian lane case applies only its lane fraction.",originalDirection:"Front axle coordinate follows physical axle 1 in both directions.",methodScope:"Factors included",laneCaption:"Adverse lane regions",permanentName:"Permanent load",manualCaption:"Positioned full vehicle",spanSection:"Section per span",statusDetail:"Input changes update automatically",factorCount:"Axle count",showCase:"Inspect this load arrangement",reactionCase:"Inspect reaction",caseMethod:"Truck/lane extremes may govern at different positions."
 },
 fr: {
  excelPreparing:"Préparation de l’export Excel (le premier usage télécharge openpyxl)…",preloaded:"Résultats par défaut précalculés · moteur de calcul en chargement…",solvingAfterBoot:"Calcul dès que le moteur sera chargé…",retrying:"Téléchargement échoué, nouvel essai",attempt:"essai",bootFailedTitle:"Le moteur de calcul n’a pas pu être téléchargé.",bootFailedStage:"Bloqué à l’étape :",bootAttempts:"essais",bootStalled:"aucune réponse du serveur (téléchargement figé)",bootHint:"Un réseau ou un proxy d’entreprise bloque peut-être cdn.jsdelivr.net (Python et bibliothèques) ou pypi.org (Excel seulement). Réessayez, changez de réseau ou demandez aux TI d’autoriser ces domaines. Les fichiers déjà téléchargés restent dans le cache du navigateur.",bootRetry:"↻ Réessayer",excelUnavailable:"L’export Excel est indisponible : le module openpyxl n’a pas pu être téléchargé (pypi.org bloqué?). Le calcul fonctionne normalement.",fixed:"Encastré (culée intégrale)",spring:"Ressort de rotation k",springK:"k (kN·m/rad)",fixity:"Fixité",springHelp:"Ressort de rotation : déplacement vertical bloqué, rotation retenue par k (kN·m/rad), p. ex. une culée intégrale sur pieux flexibles. Fixité = k / (k + Σ3EI/L des travées adjacentes) : 0 % articulé, 100 % encastré. Le k par défaut donne 50 %. Encadrez k entre des bornes réalistes sol–pieux.",fixedHelp:"Encastré = rotation et déplacement vertical bloqués (culée intégrale, borne supérieure de la fixité). Une vraie culée intégrale est partiellement retenue par ses pieux et le remblai : comparez avec des appuis articulés pour encadrer la réponse. La retenue axiale, la poussée des terres et la dilatation thermique du tablier ne sont pas modélisées.",platesFrom:"Tôles, E et M de",platesStart:"Section initiale",platesEnd:"Section finale",platesDeep:"Section la plus haute",platesHelp:"Dans une zone variable, seule la hauteur totale varie. Cette option choisit la section qui fournit les tôles (semelles, âme), E et le multiplicateur M. Initiale (défaut v0.4) : inverser les sections de l’autre côté d’une pile NE donne PAS un gousset miroir. La plus haute : les tôles de la section sur pile sont utilisées des deux côtés; un gousset S1→S2 puis S2→S1 est alors un vrai miroir. Finale : la section cible fournit les tôles.",influence:"Lignes d’influence",ilHint:"Cliquez un diagramme pour déplacer la station. Charge unitaire de 1 kN vers le bas.",ilAt:"Lignes d’influence à",ilGoverning:"Disposition gouvernante M max",ilSum:"essieux Σ η·P",ilLaneNote:"charge de voie non incluse dans Σ η·P",play:"▶ Animer",stop:"■ Arrêter",animating:"Animation du passage",upliftTitle:"Soulèvement :",upliftLive:"réaction négative sous charge vive seule. Combinez avec les permanentes pondérées avant de conclure.",upliftBoth:"réaction négative sous permanentes + vives : vérifier l’ancrage ou le dispositif anti-soulèvement.",upliftDead:"réaction négative sous charges permanentes.",upliftSnapshot:"réaction négative dans cette disposition.",momentReaction:"Mr (kN·m, anti-horaire +)",stiffnessJumpTitle:"Saut de rigidité :",stiffnessJumpHelp:"Dans une zone variable, seule la hauteur varie; les tôles, E et M viennent de la section choisie dans « Tôles, E et M de » (section initiale par défaut). Vérifiez que ces sauts sont voulus, p. ex. un changement de multiplicateur composite/fissuré à une limite de zone.",  loadFactor:"Facteur de charge",axleFactor:"Facteur d’essieu",maintenance:"Véhicule d’entretien",maintenanceHelp:"Deux essieux : 24 et 56 kN espacés de 2,0 m. Véhicule seulement; aucune charge de voie associée ni majoration dynamique.",focus:"Agrandir les diagrammes",thermalTop:"Dessus",thermalBottom:"Dessous",canadianLaneFullHelp:"La charge uniforme associée couvre tout le pont. Les étiquettes d’essieux incluent la réduction de voie et le facteur d’essieu, mais jamais le CMD ni le facteur global de surcharge.",zoneMirrorHelp:"Pour un gousset miroir, inversez les sections initiale et finale de la travée correspondante et choisissez « Section la plus haute » dans « Tôles, E et M de » pour les deux zones.",loadBodyCurrent:"Les CL-625 et CL-750-QC vérifient chaque sous-ensemble non vide d’essieux avec ses espacements d’origine. L’article 3.8.4.5.3 de CAN/CSA S6-25 régit le CMD du cas camion seul. Leurs cas de voie utilisent les essieux réduits sans CMD et une charge uniforme sur tout le pont. HL-93 vérifie le camion ou tandem complet avec 33 % de CMD sur les essieux seulement. Cooper utilise le train E complet. Le véhicule d’entretien vaut 24 + 56 kN à 2,0 m, sans charge de voie ni CMD. Le cas HL-93 supplémentaire combine 90 % de deux camions et de la voie défavorable, avec des espacements d’essieux de 14 pi et au moins 50 pi libres entre camions. Il concerne les moments négatifs autour des piles et leurs réactions verticales. Les centres des camions occupent deux travées adjacentes; Standard/Fin définit le pas de recherche.",scopeBodyCurrent:"Les résultats sont les effets longitudinaux d’une voie. Les facteurs de charge et d’essieu saisis sont appliqués tels quels. Aucun facteur ÉLUL/ÉLUT automatique, facteur RL, facteur de répartition transversale, CMD de joint ou règle d’ouvrage enfoui n’est ajouté. Les culées encastrées (intégrales) bloquent entièrement la rotation et donnent une réaction de moment Mr (anti-horaire +); la fixité réelle se situe entre articulé et encastré. Les lignes d’influence montrent l’effet d’une charge de 1 kN vers le bas; l’animation rejoue 60 positions précalculées du véhicule complet.",precisionHelpCurrent:"Standard : espacement de passage maximal de 0,25 m. Fin : maximal de 0,10 m, avec influences et flèches plus denses.",
  inertiaModifier:"Multiplicateur d’inertie M (×)",modifierHelp:"EI = E × I acier × M. M = 4 quadruple la rigidité. L’aire et le centre de gravité restent ceux de l’acier; aucune section composite transformée n’est calculée.",legacyTaper:"Cet ancien projet interpole les dimensions des tôles. Ouvrez-le avec v0.3, puis redéfinissez ses zones avec une variation de hauteur seulement dans v0.4.",
  sectionType:"Définition de la section",girder:"Dimensions de la poutre en I",directEI:"EI constant (kN·m²)",updated:"Mise à jour : 2026-09-12",disclaimer:"Utilisation et responsabilité : Bien que je considère ces outils comme exempts d’erreurs, je ne peux être tenu responsable de leurs résultats. Ils sont fournis à des fins pédagogiques seulement et ne doivent pas servir à concevoir un pont.",openProject:"Ouvrir",saveProject:"Enregistrer",untitled:"Sans titre",modified:"Modifié",saved:"Projet enregistré",opened:"Projet ouvert",projectInvalid:"Ce fichier de projet est invalide ou incompatible.",projectLarge:"Le fichier de projet dépasse 1 Mio.",unsavedTitle:"Modifications non enregistrées",unsavedBody:"Enregistrer le projet actuel avant d’ouvrir le fichier sélectionné?",cancel:"Annuler",discard:"Ignorer",saveThenOpen:"Enregistrer puis ouvrir",thermal:"Thermique",thermalLoads:"GRADIENT THERMIQUE",deltaT:"ΔT = Tdessus − Tdessous (°C)",alpha:"Dilatation thermique α (10⁻⁶/°C)",thermalDepth:"Hauteur thermique de référence (mm)",thermalHelp:"Un gradient linéaire entre le dessus et le dessous est appliqué seul comme courbure libre imposée à chaque travée. Un ΔT positif signifie que le dessus est plus chaud et courbe la poutre vers le haut.",thermalOnly:"Gradient thermique seulement",thermalScope:"Toutes les travées · courbure thermique imposée",thermalCase:"Cas thermique unique",maxMoment:"Moment maximal",minMoment:"Moment minimal",curvature:"Courbure imposée",thermalNotes:"Modèle du gradient thermique",thermalBody:"La différence de température linéaire produit une courbure libre uniforme κ = −αΔT/h dans PyCBA. Le signe associe un dessus plus chaud à une courbure vers le haut, affichée comme une flèche négative. Le cas thermique est résolu seul et n’est jamais superposé aux charges permanentes ou routières.",
  brandSub:"ANALYSE DE POUTRES CONTINUES",modes:"Modes propres",local:"PyCBA",model:"Modèle du pont",reset:"Réinitialiser",geometry:"Géométrie",sections:"Sections",loads:"Charges",oneLane:"Une voie · effets longitudinaux",elastic:"Élastique linéaire · modèle EI",dead:"Permanentes",live:"Routières",both:"Les deux",initializing:"Chargement du moteur (le premier lancement peut prendre une minute)…",beamLoads:"POUTRE ET CHARGES",diagrams:"Diagrammes",table:"Tableau des stations",method:"Notes de calcul",envelope:"Enveloppe",snapshot:"Position du camion",frontAxle:"Essieu avant",reverse:"Inverser",range:"Enveloppe min / max",hoverHint:"Survolez un diagramme pour examiner une station",supportReactions:"RÉACTIONS D’APPUI · kN ↑+",signs:"M positif en travée · flèche positive vers le bas",warning:"Valeurs préliminaires indicatives seulement — ne remplacent pas une conception détaillée.",spanCount:"NOMBRE DE TRAVÉES",spanLengths:"LONGUEURS DES TRAVÉES",span:"Travée",support:"Appui",supports:"APPUIS",pin:"Articulé",roller:"À rouleaux",supportHelp:"Les appuis bloquent le déplacement vertical. La poutre reste continue au-dessus des appuis intermédiaires.",sectionMode:"MODÈLE DE SECTION",nonprismatic:"Non prismatique / section variable",sectionHelp:"Choisissez les dimensions de la poutre ou un EI constant en kN·m². I brut est calculé avec les tôles. Le multiplicateur d’inertie modifie uniquement la rigidité. La géométrie des sections EI est schématique.",addSection:"+ Ajouter une section",E:"Module d’élasticité E (GPa)",depth:"Hauteur totale h (mm)",top_width:"Largeur semelle sup. (mm)",top_thickness:"Épaisseur semelle sup. (mm)",web_thickness:"Épaisseur de l’âme (mm)",bottom_width:"Largeur semelle inf. (mm)",bottom_thickness:"Épaisseur semelle inf. (mm)",section:"Section",zone:"Zone",zoneEnd:"Fin (% de la travée)",profile:"Variation",constant:"Constante",linear:"Hauteur linéaire",parabolic:"Hauteur parabolique",startSection:"Section initiale (hauteur de départ)",endSection:"Section finale (hauteur cible)",addZone:"+ Diviser la dernière zone",zoneHelp:"Les zones se suivent de 0 % à 100 %. Section initiale : hauteur de départ. Section finale : hauteur cible. Les tôles, E et le multiplicateur viennent de la section choisie ci-dessous (initiale par défaut) et ne changent qu’à la zone suivante. Les sections de moment positif/négatif correspondent à des zones géométriques fixes, sans changement automatique selon le signe du moment.",deadLoads:"CHARGES PERMANENTES",addDead:"+ Ajouter une charge uniforme",allSpans:"Toutes les travées",intensity:"Intensité w (kN/m)",applyTo:"Appliquer à",from:"Début (%)",to:"Fin (%)",liveLoads:"SURCHARGE ROUTIÈRE",vehicle:"Véhicule de calcul",hl93Truck:"Camion HL-93 AASHTO",hl93Tandem:"Tandem HL-93 AASHTO",cooper:"Cooper E AREA / AREMA",cooperE:"Indice Cooper E",custom:"Véhicule personnalisé",case:"Cas de charge",governing:"Déterminant : camion / voie",truck:"Véhicule seulement",lane:"Véhicule + charge uniforme associée",fraction:"Fraction du camion dans le cas voie canadien",laneIntensity:"Charge uniforme associée (kN/m)",hl93Spacing:"Espacement arrière du camion HL-93 : 4,3 à 9,0 m; toutes les valeurs permises sont enveloppées.",cooperHelp:"Deux locomotives PyCBA (18 essieux) et la charge uniforme associée Cooper. L’indice E multiplie tous les essieux et la charge uniforme.",fullLaneHelp:"La charge uniforme associée couvre le tablier, conformément à run_load_model de PyCBA. Elle n’est jamais majorée dynamiquement.",canadianLaneHelp:"Les essieux affichés sont réduits seulement par la fraction de voie canadienne; aucun CMD n’est affiché ni appliqué à un cas voie.",noDynamic:"Aucune majoration dynamique",appliedFactor:"Facteur d’essieux appliqué",fractionHelp:"63 % : travée simple; moment positif et cisaillement vertical des ponts continus; autres cas selon A2023-05. La fraction sélectionnée s’applique à l’ensemble des résultats du cas de voie.",dynamic:"Appliquer la majoration dynamique du véhicule",factorHelp:"CAN/CSA S6-25 : 1 essieu ×1,40; 2 essieux ou 1–2–3 ×1,30; autres groupes de 3+ ×1,25. HL-93 : ×1,33 sur les essieux seulement. Cooper n’a pas de majoration dynamique.",axle:"Essieu",load:"Charge (kN)",spacing:"Espac. après (m)",axleCount:"Nombre d’essieux",direction:"Sens de circulation",bothDirections:"Les deux sens",forward:"Gauche → droite",backward:"Droite → gauche",resolution:"PRÉCISION NUMÉRIQUE",standard:"Standard",fine:"Fine",precisionHelp:"Standard : pas de 0,25 m. Fine : pas de 0,10 m et calculs d’influence et de flèche plus fins.",solving:"Calcul des enveloppes…",ready:"Analyse à jour",failed:"Veuillez vérifier les données",invalid:"Vérifiez les dimensions positives, les portées, les espacements d’essieux et la couverture des zones.",offline:"Le solveur du navigateur n’a pas démarré. Vérifiez votre connexion et rechargez pour télécharger le moteur de calcul.",sagging:"Moment positif max",hogging:"Moment négatif max",maxShear:"|Cisaillement| max",maxDeflection:"|Flèche| max",shear:"Cisaillement",moment:"Moment",deflection:"Flèche",at:"à",nominalTruck:"Charges nominales illustrées · aucune majoration dynamique affichée",deadOnly:"Charges permanentes seulement",subdivisions:"Intervalles par travée",subdivisionHelp:"Les stations du tableau sont indépendantes de la précision du calcul. Deux lignes aux appuis communs conservent les cisaillements gauche/droite; les réactions apparaissent une seule fois dans les fichiers.",station:"Station",side:"Côté",left:"Gauche",right:"Droite",xLocal:"x local",up:"haut",down:"bas",restore:"Afficher l’enveloppe",critical:"Disposition déterminante",axles:"Essieux",dynamicFactor:"Facteur CMD",unloaded:"Sans surcharge routière",totalLength:"Longueur totale",elapsed:"Calcul",positions:"positions",groups:"groupes d’essieux",reactionHelp:"Min / max à chaque appui; les extrêmes peuvent provenir de dispositions différentes.",methodTitle:"Base de l’analyse",methodBody:"PyCBA résout la poutre 1D d’Euler–Bernoulli par la méthode matricielle des déplacements. Les appuis articulés et à rouleaux bloquent le déplacement vertical et permettent la rotation; la continuité est conservée aux appuis intermédiaires. Les déformations axiales et de cisaillement sont exclues.",sectionNotes:"Propriétés des sections",sectionBody:"L’aire, le centre de gravité et I sont calculés à partir des deux semelles et de l’âme par le théorème des axes parallèles. E est homogène dans chaque section. Seule la hauteur totale varie. Les semelles, l’épaisseur de l’âme, E et le multiplicateur sont ceux de la section initiale de la zone et changent aux limites des zones. La section finale fournit seulement la hauteur cible. EI = E × I brut × multiplicateur; le solveur utilise ensuite un profil EI positif linéaire par morceaux. Les sections EI direct utilisent la rigidité constante saisie (kN·m²), sans aire ni inertie déduite. Les goussets paraboliques sont tangents à leur extrémité la moins haute. Les propriétés sont brutes, sans fissuration, action composite, précontrainte ni poids propre automatiques.",loadNotes:"Groupes d’essieux et cas de voie",loadBody:"Les modèles canadiens CL-625 et CL-750-QC vérifient tous les sous-ensembles non vides d’essieux en conservant leurs espacements. L’article 3.8.4.5.3 de CAN/CSA S6-25 régit leur CMD, y compris le groupe particulier 1–2–3. Leurs cas de voie utilisent les essieux réduits et une charge uniforme sur les régions défavorables, sans CMD sur les deux composantes. HL-93 vérifie le camion ou le tandem complet. L’espacement arrière du camion est enveloppé de 4,3 à 9,0 m, son CMD de 33 % s’applique seulement aux essieux, et sa charge uniforme de 9,3 kN/m n’est pas majorée. Cooper utilise le train E complet de PyCBA avec sa charge uniforme associée. Les cas véhicule et voie sont des alternatives dans cet outil.",scopeBody:"Les résultats sont les effets longitudinaux d’une voie. Aucun facteur de charge ÉLUL/ÉLUT, facteur RL, facteur de répartition transversale, CMD de joint de tablier ou règle d’ouvrage enfoui n’est appliqué. Les facteurs des véhicules personnalisés comptent les essieux individuels; les groupes d’essieux de camions spéciaux ne sont pas déduits.",precisionTitle:"Précision et résultats",precisionBody:"Les fonctions d’influence des réactions et les flèches PyCBA sont interpolées dans chaque travée. V et M sont calculés par équilibre de section. L’intégration des flèches est corrigée pour respecter le déplacement nul aux appuis. La subdivision du tableau ne définit jamais la précision de calcul. Le mode fin raffine le passage, les influences, les profils EI et l’intégration. Une enveloppe regroupe des extrêmes distincts, et non un cas simultané; cliquez sur un extrême pour voir sa disposition compatible.",unitsTitle:"Unités et conventions",unitsBody:"Coordonnées du pont : m. Dimensions des sections : mm. E : GPa. Charges : kN et kN/m. Moment : kN·m, positif en travée et tracé sous l’axe. Flèche : mm, positive vers le bas. Réactions : kN, positives vers le haut. Les deux cisaillements aux appuis intermédiaires sont conservés.",sourceTitle:"Références",noResults:"Les résultats apparaîtront après une analyse valide.",remove:"Supprimer",name:"Nom",deleteSectionHelp:"Cette section est utilisée. Réaffectez ses travées et ses zones avant de la supprimer.",busyExport:"Les résultats sont en cours de mise à jour. Les exports seront disponibles à la fin du calcul.",snapshotHelp:"La position saisie affiche les charges nominales. Le solveur conserve le facteur de code choisi; un cas voie canadien applique seulement sa fraction de voie.",originalDirection:"La coordonnée de l’essieu avant suit l’essieu physique 1 dans les deux sens.",methodScope:"Facteurs inclus",laneCaption:"Régions de voie défavorables",permanentName:"Charge permanente",manualCaption:"Véhicule complet positionné",spanSection:"Section par travée",statusDetail:"Mise à jour automatique après modification",factorCount:"Nombre d’essieux",showCase:"Examiner cette disposition de charges",reactionCase:"Examiner la réaction",caseMethod:"Les extrêmes camion/voie peuvent survenir à des positions différentes."
 }
};
let lang = localStorage.getItem("qb-language-v03") === "en" ? "en" : "fr";
let model, result, jobId, defaultModel, snap = null, inputPanel = "geometry", view = "diagrams", display = "envelope", manualDirection = "forward", revision = 0, timer, positionTimer, snapRevision = 0;
const deltaEffects=new Set();
let influenceData=null,traverseData=null,playTimer=null,frameIndex=0;
let projectName="", savedModel="", savedProjectName="", pendingProject=null;

Object.assign(words.fr,{twoTruckOption:'HL-93 · 90 % de deux camions (M− / R piles)',twoTruckCase:'Deux camions + voie · 90 %',delta:'Afficher Δ (max − min)',fixedHelp:'Rotation bloquée; aucun effet axial.',springHelp:'Rotation retenue par k. Fixité : 0 % articulé, 100 % encastré.',platesHelp:'Seule la hauteur varie. La section choisie fournit les tôles, E et M.',stiffnessJumpHelp:'Vérifiez les tôles, E et M aux limites de zone.',zoneHelp:'Limites en % de la travée; seule la hauteur varie.',hoverHint:'Survoler pour lire les valeurs.',disclaimer:''});
Object.assign(words.en,{twoTruckOption:'HL-93 · 90% of two trucks (M− / pier R)',twoTruckCase:'Two trucks + lane · 90%',delta:'Show Δ (max − min)',fixedHelp:'Rotation restrained; no axial effects.',springHelp:'Rotation resisted by k. Fixity: 0% pinned, 100% fixed.',platesHelp:'Only depth varies. The selected section supplies plates, E and M.',stiffnessJumpHelp:'Check plates, E and M at zone boundaries.',zoneHelp:'Limits in % of span; only depth varies.',hoverHint:'Hover to read values.',disclaimer:''});
const t = key => words[lang][key] || key;
const esc = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = (value, digits=2) => {const n=Math.abs(Number(value))<.5*10**-digits?0:Number(value);return n.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA",{minimumFractionDigits:digits,maximumFractionDigits:digits})};
const clone = value => JSON.parse(JSON.stringify(value));
const modelText = () => JSON.stringify(model);
function updateProjectState() {
 const invalid=$$('input[data-path][type="number"]').some(el=>!el.validity.valid||el.value==='');
 const dirty=!!model&&(modelText()!==savedModel||projectName!==savedProjectName||invalid);
 if(document.activeElement!==$('#project-name'))$('#project-name').value=projectName||t('untitled');
 $('#dirty-state').textContent=dirty?`• ${t('modified')}`:'';
 document.title=`${dirty?'• ':''}${projectName||t('untitled')} · QuickerBridge`;
 return dirty;
}
function safeFilename(name){return (name||'QuickerBridge').normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'QuickerBridge'}
function saveProject() {
 if($$('input[data-path][type="number"]').some(el=>!el.validity.valid||el.value==='')){invalidate(t('invalid'));return false}
 const envelope={format:'QuickerBridgeProject',schema_version:4,app_version:QB_META.version,name:projectName||t('untitled'),saved_at:new Date().toISOString(),model:clone(model)};
 // Standard vehicles are fully defined by their name: keep axle lists only for a custom vehicle.
 if(envelope.model.live.vehicle!=='custom'){delete envelope.model.live.weights;delete envelope.model.live.spacings;}
 const url=URL.createObjectURL(new Blob([JSON.stringify(envelope,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download=`${safeFilename(envelope.name)}.quickerbridge.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 projectName=envelope.name;savedModel=modelText();savedProjectName=projectName;updateProjectState();$('#status').textContent=t('saved');return true;
}
async function validateSelectedProject(file) {
 if(file.size>1024*1024){throw Error('project.too_large')}
 return solver.request('validate_project',{text:await file.text()});
}
function applyProject(project) {
 showView('diagrams');revision++;snapRevision++;clearTimeout(timer);clearExcelFile();result=null;jobId=null;snap=null;display='envelope';
 model=clone(project.model);projectName=project.name;savedModel=modelText();savedProjectName=projectName;inputPanel='geometry';view='diagrams';
 $$('[data-mode]').forEach(el=>el.classList.toggle('active',el.dataset.mode===model.load_mode));$$('[data-panel]').forEach(el=>el.classList.toggle('active',el.dataset.panel===inputPanel));
 renderInputs();updateProjectState();changed();
}
async function openSelectedProject(file) {
 let project;
 try{project=await validateSelectedProject(file)}catch(e){console.error(e);$('#error').textContent=String(e).includes('legacy_taper')?t('legacyTaper'):String(e).includes('too_large')?t('projectLarge'):t('projectInvalid');$('#error').classList.remove('hidden');return}
 pendingProject=project;
 if(updateProjectState()){$('#replace-dialog').showModal()}else{pendingProject=null;applyProject(project)}
}
function field(key, path, value, unit="", options={}) {
 const id = "f-" + path.replaceAll(".","-");
 const scale = options.scale || 1;
 return `<label class="field ${options.full?'full':''}" for="${id}"><span>${esc(t(key))}${unit}</span><input id="${id}" data-path="${path}" data-scale="${scale}" type="${options.text?'text':'number'}" ${options.text?'maxlength="80"':`step="${options.step || 'any'}" min="${options.min ?? 0}" ${options.max!==undefined?`max="${options.max}"`:''}`} value="${esc(options.text?value:+(value / scale).toPrecision(12))}"></label>`;
}
function select(key,path,value,options) {
 const id = "f-"+path.replaceAll(".","-");
 return `<label class="field" for="${id}"><span>${esc(t(key))}</span><select id="${id}" data-path="${path}">${options.map(([v,label])=>`<option value="${v}" ${String(v)===String(value)?'selected':''}>${esc(label)}</option>`).join('')}</select></label>`;
}
const sectionOptions = () => model.sections.map((s,i)=>[i,s.name]);
function vehiclePattern(live=model.live) {
 const canadian=live.vehicle==='CL625'?[50,125,125,175,150]:live.vehicle==='CL750QC'?[50,160,160,200,180]:null;
 if(canadian)return {weights:canadian,spaces:[3.6,1.2,6.6,6.6]};
 if(live.vehicle==='HL93Truck')return {weights:[35,145,145],spaces:[4.3,4.3]};
 if(live.vehicle==='HL93Tandem')return {weights:[110,110],spaces:[1.2]};
 if(live.vehicle==='Maintenance')return {weights:[24,56],spaces:[2]};
 if(live.vehicle==='Cooper'){
  const loco=[5,10,10,10,10,6.5,6.5,6.5,6.5],scale=(live.cooper_e??80)/10*4.4482216;
  return {weights:[...loco,...loco].map(w=>w*scale),spaces:[8,5,5,5,9,5,6,5,8,8,5,5,5,9,5,6,5].map(s=>s*.3048)};
 }
 return {weights:live.weights,spaces:live.spacings};
}
function vehicleName(vehicle=model.live.vehicle) {return vehicle==='CL625'?'CL-625':vehicle==='CL750QC'?'CL-750-QC':vehicle==='HL93Truck'?t('hl93Truck'):vehicle==='HL93Tandem'?t('hl93Tandem'):vehicle==='Cooper'?t('cooper'):vehicle==='Maintenance'?t('maintenance'):t('custom');}
function canadianLaneVehicle(vehicle=model.live.vehicle) {return ['CL625','CL750QC','custom'].includes(vehicle);}
function visualAxleFactor(record=snap?.record) {const lane=record?record.case==='lane':model.live.case==='lane',reduction=lane&&canadianLaneVehicle()?(model.live.vehicle==='CL625'?.8:model.live.lane_fraction):1;return (model.live.axle_factor??1)*reduction;}
function positionBounds() {
 const total=model.spans.reduce((v,s)=>v+s.length,0),{spaces}=vehiclePattern(),wheelbase=spaces.reduce((v,s)=>v+s,0);
 return manualDirection==='forward'?{min:0,max:total+wheelbase}:{min:-wheelbase,max:total};
}
function syncPositionControls(value) {
 const number=$('#position'),slider=$('#position-slider');if(!number||!slider||!model)return;
 const bounds=positionBounds(),candidate=Number(value??number.value),position=Math.min(bounds.max,Math.max(bounds.min,Number.isFinite(candidate)?candidate:bounds.min));
 [number,slider].forEach(el=>{el.min=bounds.min;el.max=bounds.max;el.value=position;});slider.setAttribute('aria-label',t('frontAxle'));
}
function queuePositionSnapshot(position) {clearTimeout(positionTimer);positionTimer=setTimeout(()=>inspectCase(0,'max',position),120);}
function sectionProps(s) {
 if(s.kind==='ei')return {A:null,I:null,EI:s.EI};
 const hw=s.depth-s.top_thickness-s.bottom_thickness;
 const a=[s.bottom_width*s.bottom_thickness,s.web_thickness*hw,s.top_width*s.top_thickness];
 const y=[s.bottom_thickness/2,s.bottom_thickness+hw/2,s.depth-s.top_thickness/2];
 const A=a.reduce((v,w)=>v+w,0), c=a.reduce((v,w,i)=>v+w*y[i],0)/A;
 const I=(s.bottom_width*s.bottom_thickness**3+s.web_thickness*hw**3+s.top_width*s.top_thickness**3)/12+a.reduce((v,w,i)=>v+w*(y[i]-c)**2,0);
 return {A:A/1e6,I:I/1e12,EI:I*s.E/1e6*(s.inertia_modifier??1)};
}
function sectionSvg(s) {
 if(s.kind==='ei')return `<div class="section-svg ei-symbol">EI <small>kN·m²</small></div>`;
 const scale=Math.min(95/s.depth,190/Math.max(s.top_width,s.bottom_width));
 const h=s.depth*scale,bt=s.top_width*scale,bb=s.bottom_width*scale,tt=Math.max(3,s.top_thickness*scale),tb=Math.max(3,s.bottom_thickness*scale),tw=Math.max(2,s.web_thickness*scale),top=12;
 return `<svg class="section-svg" viewBox="0 0 250 125" role="img" aria-label="${esc(s.name)}"><line x1="125" y1="3" x2="125" y2="120" stroke="#a4c5c9" stroke-dasharray="3 3"/><path d="M${125-bt/2} ${top}h${bt}v${tt}H${125+tw/2}v${h-tt-tb}H${125+bb/2}v${tb}H${125-bb/2}v-${tb}H${125-tw/2}V${top+tt}H${125-bt/2}Z" fill="#ceeae2" stroke="#007f78" stroke-width="1.5"/><path d="M${130+Math.max(bt,bb)/2} ${top}h9m-4 0v${h}m-5 0h9" fill="none" stroke="#748f9e"/><text x="${145+Math.max(bt,bb)/2}" y="${top+h/2}" font-size="12" fill="#56798b">h</text></svg>`;
}
function renderInputs() {
 if (!model) return;
 let html="";
 if(inputPanel==="geometry") {
  html=`<div class="section-label">${t('spanCount')}</div><div class="span-count">${[1,2,3,4,5].map(n=>`<button data-spans="${n}" class="${model.spans.length===n?'active':''}" aria-pressed="${model.spans.length===n}">${n}</button>`).join('')}</div><div class="section-label">${t('spanLengths')}</div>`;
  html+=model.spans.map((s,i)=>`<div class="span-row"><label class="span-tag" for="span-${i}">${t('span')} ${i+1}</label><input id="span-${i}" data-path="spans.${i}.length" type="number" min="0.5" max="200" step="any" value="${s.length}"><span class="unit">m</span></div>`).join('');
  html+=`<div class="section-label">${t('supports')}</div>`+model.supports.map((s,i)=>`<div class="support-row"><label for="support-${i}">${t('support')} ${i+1}</label><select id="support-${i}" data-path="supports.${i}"><option value="pin" ${s==='pin'?'selected':''}>${t('pin')}</option><option value="roller" ${s==='roller'?'selected':''}>${t('roller')}</option><option value="fixed" ${s==='fixed'?'selected':''}>${t('fixed')}</option><option value="spring" ${s==='spring'?'selected':''}>${t('spring')}</option></select></div>${s==='spring'?`<div class="spring-row"><label class="field"><span>${t('springK')}</span><input type="number" step="any" min="1" max="10000000000000" data-path="support_springs.${i}" value="${+(model.support_springs?.[i]||0).toPrecision(12)}"></label><span class="fixity" id="fixity-${i}">${springFixityText(i)}</span></div>`:''}`).join('');
  html+=`${model.supports.includes('fixed')?`<p class="note fixed-note">${t('fixedHelp')}</p>`:''}${model.supports.includes('spring')?`<p class="note fixed-note">${t('springHelp')}</p>`:''}${select('resolution','precision',model.precision,[['standard',t('standard')],['fine',t('fine')]])}<div class="note">${t('totalLength')}: <b>${fmt(model.spans.reduce((v,s)=>v+s.length,0))} m</b></div>`;
 } else if(inputPanel==="sections") {
  html=`<label class="toggle-row"><input type="checkbox" data-path="nonprismatic" ${model.nonprismatic?'checked':''}>${t('nonprismatic')}</label>`;
  html+=model.sections.map((s,i)=>{const p=sectionProps(s);return `<section class="section-card"><div class="card-head"><input aria-label="${t('name')}" data-path="sections.${i}.name" value="${esc(s.name)}" maxlength="60"><button data-remove-section="${i}" class="icon-button" title="${t('remove')}" ${model.sections.length===1?'disabled':''}>×</button></div>${select('sectionType',`sections.${i}.kind`,s.kind||'girder',[['girder',t('girder')],['ei',t('directEI')]])}${sectionSvg(s)}<div class="section-props">${s.kind==='ei'?`<span>EI ${fmt(p.EI,0)} kN·m²</span>`:`<span>A ${fmt(p.A,4)} m²</span><span>I ${fmt(p.I,5)} m⁴</span><span>EI ${fmt(p.EI,0)} kN·m²</span>`}</div>${s.kind==='ei'?field('directEI',`sections.${i}.EI`,s.EI,'',{min:0.000001,max:1e15}):`${field('E',`sections.${i}.E`,s.E,'',{min:0.1,max:1000})}${field('inertiaModifier',`sections.${i}.inertia_modifier`,s.inertia_modifier??1,'',{min:0.000001,max:1000})}<div class="field-row dimensions">${['depth','web_thickness','top_width','top_thickness','bottom_width','bottom_thickness'].map(key=>field(key,`sections.${i}.${key}`,s[key],'',{min:.1,max:20000})).join('')}</div>`}</section>`}).join('');
  html+=`<button class="add-button" id="add-section">${t('addSection')}</button><div class="section-label">${t('spanSection')}</div>`;
  html+=model.spans.map((s,i)=>`<section class="section-card"><b>${t('span')} ${i+1} · ${fmt(s.length)} m</b>${model.nonprismatic?`<div>${s.zones.map((z,j)=>`<div class="zone"><div class="zone-heading">${t('zone')} ${j+1}<button class="icon-button" data-remove-zone="${i},${j}" ${s.zones.length===1?'disabled':''} title="${t('remove')}">×</button></div>${field('zoneEnd',`spans.${i}.zones.${j}.end`,z.end,'',{scale:.01,min:.1,max:100})}${select('profile',`spans.${i}.zones.${j}.profile`,z.profile,model.sections[z.section].kind==='ei'?[['constant',t('constant')]]:[['constant',t('constant')],['linear',t('linear')],['parabolic',t('parabolic')]])}${select('startSection',`spans.${i}.zones.${j}.section`,z.section,sectionOptions())}${z.profile!=='constant'?select('endSection',`spans.${i}.zones.${j}.end_section`,z.end_section??z.section,sectionOptions())+select('platesFrom',`spans.${i}.zones.${j}.plates`,z.plates||'start',[['start',t('platesStart')],['end',t('platesEnd')],['deep',t('platesDeep')]]):''}</div>`).join('')}</div><button class="add-button" data-add-zone="${i}" ${s.zones.length>=12?'disabled':''}>${t('addZone')}</button>`:select('section',`spans.${i}.section`,s.section,sectionOptions())}</section>`).join('');
  if(model.nonprismatic) html+=`<p class="help">${t('zoneHelp')}</p><p class="note">${t('platesHelp')}</p>`;
 } else if(model.load_mode==='thermal') {
  const dt=model.thermal.delta_T;
  html=`<div class="section-label">${t('thermalLoads')}</div><div class="load-card thermal-card"><div class="thermal-gradient ${dt<0?'negative':dt>0?'positive':'neutral'}"><span>${t('thermalTop')}</span><span>${t('thermalBottom')}</span></div>${field('deltaT','thermal.delta_T',dt,'',{min:-100,max:100})}${field('alpha','thermal.alpha_micro',model.thermal.alpha_micro,'',{min:.01,max:100})}${field('thermalDepth','thermal.depth',model.thermal.depth,'',{min:.1,max:15000})}<p class="help">${t('thermalHelp')}</p></div>`;
 } else {
  html=`<div class="section-label">${t('deadLoads')}</div>`+model.dead.map((load,i)=>`<div class="load-card"><div class="card-head"><input aria-label="${t('name')}" data-path="dead.${i}.name" maxlength="80" value="${esc(load.name)}"><button data-remove-dead="${i}" class="icon-button" title="${t('remove')}">×</button></div><div class="field-row">${field('intensity',`dead.${i}.w`,load.w)}${field('loadFactor',`dead.${i}.factor`,load.factor??1)}</div>${select('applyTo',`dead.${i}.span`,load.span,[[-1,t('allSpans')],...model.spans.map((s,j)=>[j,`${t('span')} ${j+1}`])])}<div class="field-row">${field('from',`dead.${i}.start`,load.start,'',{scale:.01,min:0,max:99.9})}${field('to',`dead.${i}.end`,load.end,'',{scale:.01,min:.1,max:100})}</div></div>`).join('');
  html+=`<button class="add-button" id="add-dead">${t('addDead')}</button><div class="section-label">${t('liveLoads')}</div>${select('vehicle','live.vehicle',model.live.vehicle,[['CL625','CL-625'],['CL750QC','CL-750-QC'],['HL93Truck',t('hl93Truck')],['HL93Tandem',t('hl93Tandem')],['Cooper',t('cooper')],['Maintenance',t('maintenance')],['custom',t('custom')]])}`;
  const pattern=vehiclePattern(),weights=pattern.weights,gaps=pattern.spaces,hasLane=model.live.vehicle!=='Maintenance';
  html+=`<div class="field-row">${field('loadFactor','live.factor',model.live.factor??1)}${field('axleFactor','live.axle_factor',model.live.axle_factor??1)}</div>`;
  if(model.live.vehicle==='custom')html+=`<label class="field"><span>${t('axleCount')}</span><select id="axle-count">${[1,2,3,4,5,6,7].map(n=>`<option ${n===weights.length?'selected':''}>${n}</option>`).join('')}</select></label>`;
  if(model.live.vehicle==='Cooper')html+=`${field('cooperE','live.cooper_e',model.live.cooper_e,'',{min:10,max:200})}<div class="case-breakdown">18 ${t('axles').toLowerCase()} · E${fmt(model.live.cooper_e,0)} · ${t('laneIntensity')}: ${fmt(model.live.cooper_e/10*4.4482216/.3048,1)}</div>`;
  else {html+=`<table class="axle-table"><thead><tr><th>${t('axle')}</th><th>${t('load')}</th><th>${t('spacing')}</th></tr></thead><tbody>${weights.map((w,i)=>`<tr><td>${i+1}</td><td>${model.live.vehicle==='custom'?`<input aria-label="${t('axle')} ${i+1} ${t('load')}" type="number" min="0.1" max="10000" step="any" data-path="live.weights.${i}" value="${w}">`:fmt(w,0)}</td><td>${i<gaps.length?(model.live.vehicle==='custom'?`<input aria-label="${t('spacing')} ${i+1}" type="number" min="0.01" max="50" step="any" data-path="live.spacings.${i}" value="${gaps[i]}">`:fmt(gaps[i],1)):'—'}</td></tr>`).join('')}</tbody></table><div class="case-breakdown">Σ ${fmt(weights.reduce((a,b)=>a+b,0),0)} kN · ${fmt(gaps.reduce((a,b)=>a+b,0),1)} m</div>`;if(model.live.vehicle==='HL93Truck')html+=`<p class="help">${t('hl93Spacing')}</p>`;}
  if(['HL93Truck','HL93Tandem'].includes(model.live.vehicle))html+=`<label class="toggle-row"><input type="checkbox" data-path="live.two_trucks" ${model.live.two_trucks?'checked':''}>${t('twoTruckOption')}</label>`;
  html+=select('case','live.case',model.live.case,hasLane?[['governing',t('governing')],['truck',t('truck')],['lane',t('lane')]]:[['truck',t('truck')]]);
  if(hasLane&&model.live.case!=='truck') {
   if(canadianLaneVehicle()&&model.live.vehicle!=='CL625')html+=select('fraction','live.lane_fraction',model.live.lane_fraction,[[.8,'80 %'],[.63,'63 %']]);
   const laneW=model.live.vehicle==='CL625'?9:model.live.vehicle==='CL750QC'?12.6:model.live.vehicle==='HL93Truck'||model.live.vehicle==='HL93Tandem'?9.3:model.live.vehicle==='Cooper'?model.live.cooper_e/10*4.4482216/.3048:model.live.lane_w;
   if(model.live.vehicle==='custom')html+=field('laneIntensity','live.lane_w',model.live.lane_w);else html+=`<p class="note">${t('laneIntensity')}: <b>${fmt(laneW,1)}</b>${model.live.vehicle==='CL625'?' · 80 %':''}</p>`;
  }
  html+=['Cooper','Maintenance'].includes(model.live.vehicle)?`<p class="help">${t('noDynamic')}</p>`:`<label class="toggle-row"><input type="checkbox" data-path="live.dynamic" ${model.live.dynamic?'checked':''}>${t('dynamic')}</label>`;html+=select('direction','live.direction',model.live.direction,[['both',t('bothDirections')],['forward',t('forward')],['reverse',t('backward')]]);
 }
 $('#input-content').innerHTML=html;
 $('#scope-footer').textContent=t(model.load_mode==='thermal'?'thermalScope':'oneLane');
}
function translate() {
 document.documentElement.lang=lang;
 if(model&&['Sans titre','Untitled project'].includes(projectName)&&modelText()===savedModel){projectName=t('untitled');savedProjectName=projectName}
 $('#release-version').textContent=`v${QB_META.version} · ${QB_META.author}`;$('#release-date').textContent=`${lang==='fr'?'Mise à jour : ':'Updated '}${QB_META.date}`;
 $$('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
 $('#en').classList.toggle('selected',lang==='en');$('#fr').classList.toggle('selected',lang==='fr');
 $('#en').setAttribute('aria-pressed',lang==='en');$('#fr').setAttribute('aria-pressed',lang==='fr');
 renderInputs();renderResults();renderBeam();updateProjectState();
 if(result && !$('#excel').disabled) $('#status').textContent=`${t('ready')} · ${fmt(result.meta.elapsed,2)} s`;
 else if($('#status').classList.contains('busy')) $('#status').textContent=t('solving');
}
function setValue(path,value) {
 const keys=path.split('.');let obj=model;
 for(const key of keys.slice(0,-1)) obj=obj[key];
 obj[keys.at(-1)]=value;
}
function onInput(event) {
 const el=event.target;if(el.id==='project-name'){projectName=el.value.slice(0,120);updateProjectState();return}if(!el.dataset.path)return;
 const path=el.dataset.path;
 if(el.type==='number' && (!el.validity.valid||el.value==='')) { invalidate(t('invalid'));return; }
 let value=el.type==='checkbox'?el.checked:el.type==='number'?+(Number(el.value)*Number(el.dataset.scale||1)).toPrecision(12):el.value;
 if(el.tagName==='SELECT' && (path.endsWith('section')||path.endsWith('end_section')||path.endsWith('.span')||path==='live.lane_fraction'))value=Number(value);
 const previousVehicle=model.live.vehicle,previousPattern=path==='live.vehicle'?vehiclePattern():null;
 setValue(path,value);
 if(path.startsWith('supports.')){if(model.supports.includes('spring')){const k=model.support_springs||[];model.support_springs=model.supports.map((s,i)=>s==='spring'?(k[i]>0?k[i]:defaultSpring(i)):0);}else model.support_springs=[];}
 if(path==='live.vehicle'&&value==='custom'&&!['custom','Cooper'].includes(previousVehicle)&&previousPattern){model.live.weights=previousPattern.weights.slice(0,7);model.live.spacings=previousPattern.spaces.slice(0,model.live.weights.length-1);}
 if(path==='live.vehicle'&&value==='Maintenance')model.live.case='truck';
 else if(path==='live.vehicle'&&previousVehicle==='Maintenance')model.live.case='governing';
 if(path==='thermal.delta_T'){const strip=$('.thermal-gradient');if(strip)strip.className=`thermal-gradient ${value<0?'negative':value>0?'positive':'neutral'}`;}
 if(path.startsWith('sections.')&&el.type==='number'){
  const s=model.sections[Number(path.split('.')[1])],card=el.closest('.section-card'),p=sectionProps(s);
  if(card){card.querySelector('.section-svg').outerHTML=sectionSvg(s);card.querySelector('.section-props').innerHTML=s.kind==='ei'?`<span>EI ${fmt(p.EI,0)} kN·m²</span>`:`<span>A ${fmt(p.A,4)} m²</span><span>I ${fmt(p.I,5)} m⁴</span><span>EI ${fmt(p.EI,0)} kN·m²</span>`;}
 }
 if(path==='nonprismatic' && value) {
  if(model.sections.length===1){const s=clone(model.sections[0]);s.name='S2';s.depth*=1.3;model.sections.push(s)}
  model.spans.forEach(s=>{if(!s.zones.length)s.zones=[{end:.2,section:1,end_section:0,profile:'linear'},{end:.8,section:0,end_section:0,profile:'constant'},{end:1,section:0,end_section:1,profile:'linear'}]});
 }
 model.spans.forEach(s=>s.zones.forEach(z=>{if([z.section,z.end_section??z.section].some(i=>model.sections[i]?.kind==='ei'))z.profile='constant'}));
 if(el.tagName==='SELECT'||el.type==='checkbox')renderInputs();
 changed();
}
function invalidate(message) {
 clearExcelFile();
 revision++;snapRevision++;clearTimeout(timer);clearTimeout(positionTimer);$('#error').textContent=message;$('#error').classList.remove('hidden');$('#status').textContent=t('failed');$('#status').classList.remove('busy');$('#excel').disabled=true;$('#charts').classList.add('stale');updateProjectState();
}
function changed() {
 clearExcelFile();
 if($$('input[data-path][type="number"]').some(el=>!el.validity.valid||el.value==='')){invalidate(t('invalid'));return;}
 stopAnimation();revision++;snapRevision++;clearTimeout(timer);clearTimeout(positionTimer);snap=null;influenceData=null;traverseData=null;display='envelope';$('#error').classList.add('hidden');$('#status').textContent=t(engineReady?'solving':'solvingAfterBoot');$('#status').classList.add('busy');$('#excel').disabled=true;$('#charts').classList.add('stale');renderBeam();updateProjectState();timer=setTimeout(()=>calculate(revision),450);
 if(typeof modalChanged==='function')modalChanged();
}
let excelAvailable=true;
const solver = new BrowserSolver((stage,info={})=>{
 if(stage==='retry'){const what=info.error?.stage||'';$('#status').textContent=`${t('retrying')} ${info.attempt}/${info.of}${what?' · '+what:''}`;window.QBSplash?.retry(info);return;}
 $('#status').textContent=`${t(result&&!jobId?'preloaded':'initializing')} · ${stage}${info.attempt>1?` · ${t('attempt')} ${info.attempt}/${info.of}`:''}`;window.QBSplash?.stage(stage,info);
});
function bootErrorHtml(e){
 // Clear, actionable start-up failure: which stage, which library/host, what to try.
 const stage=e?.stage||'Python / WebAssembly',detail=String(e?.detail||e?.message||'').slice(0,300);
 return `<b>${t('bootFailedTitle')}</b><br>${t('bootFailedStage')} <b>${esc(stage)}</b>${e?.attempts?` · ${e.attempts} ${t('bootAttempts')}`:''}${e?.stalled?` · ${t('bootStalled')}`:''}<br><small>${esc(detail)}</small><br>${t('bootHint')}<br><button id="boot-retry" class="text-button">${t('bootRetry')}</button>`;
}
async function calculate(token) {
 try {
  const key=String(token),data=await solver.request('analyse',{model:clone(model),job:key});
  if(token!==revision)return;
  window.QBSplash?.done();result=data;jobId=key;snap=null;influenceData=null;traverseData=null;display='envelope';
  $('#status').textContent=`${t('ready')} · ${fmt(result.meta.elapsed,2)} s`;
  $('#status').classList.remove('busy');$('#charts').classList.remove('stale');$('#excel').disabled=false;
  renderResults();renderBeam();
 }catch(e){if(token===revision){window.QBSplash?.done();console.error(e);invalidate(t('invalid'))}}
}
function clearExcelFile(){const file=$('#excel-file');if(file){URL.revokeObjectURL(file.href);file.remove();}}
async function downloadExcel() {
 if(!excelAvailable){$('#error').textContent=t('excelUnavailable');$('#error').classList.remove('hidden');return;}
 $('#status').textContent=t('excelPreparing');
 const key=jobId,language=lang,token=revision,modalKey=JSON.stringify(model.modal);
 $('#excel').disabled=true;$('#excel').textContent='Excel…';
 try {
  const data=await solver.request('excel',{job:key,lang:language,modal:clone(model.modal)});
  if(token!==revision||modalKey!==JSON.stringify(model.modal))return;
  const url=URL.createObjectURL(new Blob([Uint8Array.from(atob(data),c=>c.charCodeAt(0))],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
  const previous=$('#excel-file');if(previous){URL.revokeObjectURL(previous.href);previous.remove();}
  const a=document.createElement('a');a.id='excel-file';a.href=url;a.download=`QuickerBridge-v${QB_META.version}-${language}.xlsx`;a.textContent=language==='fr'?'Fichier prêt ↓':'File ready ↓';a.className='excel-file';$('#excel').after(a);a.click();
 }catch(e){console.error(e);if(String(e).includes('excel.unavailable')){excelAvailable=false;$('#excel').title=t('excelUnavailable');$('#excel').classList.add('excel-off');$('#error').textContent=t('excelUnavailable');}else $('#error').textContent=t('failed');$('#error').classList.remove('hidden')}
 finally{if(token===revision)$('#excel').disabled=false;$('#excel').textContent='↓ Excel';if(result)$('#status').textContent=`${t('ready')} · ${fmt(result.meta.elapsed,2)} s`;}
}
function beamX(x,total){
 const beam=$('#beam').getBoundingClientRect(),comparing=view==='comparison'&&typeof comparisonResult!=='undefined'&&comparisonResult;
 const plot=$(comparing?'#comparison-view .plot':'#charts .plot,#charts .il-plot,#charts .stiffness-plot')?.getBoundingClientRect();
 const length=comparing?Math.max(total,comparisonResult.x.at(-1)):total,L=comparing?38:26,span=comparing?870:874;
 return plot?.width>0?plot.left-beam.left+(L+x/length*span)/926*plot.width:26+x/total*(beam.width-52);
}
function renderBeam() {
 if(!model)return;
 $('#beam').setAttribute('viewBox',`0 0 ${$('#beam').clientWidth||1000} 146`);
 if(typeof modalBeam==='function'&&modalBeam())return;
 const total=model.spans.reduce((v,s)=>v+s.length,0);if(!Number.isFinite(total)||total<=0)return;
 const xp=x=>beamX(x,total);
 let starts=[0];model.spans.forEach(s=>starts.push(starts.at(-1)+s.length));
 const beamDepth=s=>s.kind==='ei'?1800:s.depth;
 const maxDepth=Math.max(...model.sections.map(beamDepth)), depthScale=23/maxDepth;
 const dt=model.thermal.delta_T,hot=dt>0?'#ed875c':dt<0?'#70b6d3':'#f2d6b1',cold=dt>0?'#70b6d3':dt<0?'#ed875c':'#f2d6b1';
 let svg=`<defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0 0L5 3L0 6Z" fill="#ecb46a"/></marker><marker id="dl-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#7aabb9"/></marker><linearGradient id="thermal-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hot}"/><stop offset=".52" stop-color="#f2d6b1"/><stop offset="1" stop-color="${cold}"/></linearGradient></defs>`;
 model.spans.forEach((s,i)=>{
  const outline=[];let previous=0;
  const zones=model.nonprismatic&&s.zones.length?s.zones:[{end:1,section:s.section,end_section:s.section,profile:'constant'}];
  zones.forEach(z=>{const a=model.sections[z.section]||model.sections[0],b=model.sections[z.end_section??z.section]||a;
   for(let j=0;j<=16;j++){const f=j/16,shape=z.profile==='constant'?0:z.profile==='parabolic'?(a.depth>b.depth?1-(1-f)**2:f*f):f;outline.push([xp(starts[i]+s.length*(previous+(z.end-previous)*f)),65+(beamDepth(a)*(1-shape)+beamDepth(b)*shape)*depthScale])}previous=z.end;
  });
  svg+=`<path d="M${xp(starts[i])} 65H${xp(starts[i+1])}L${outline.slice().reverse().map(p=>p.join(' ')).join('L')}Z" fill="#2b5967" stroke="#73d8bd" stroke-width="1.2"/><line x1="${xp(starts[i])}" x2="${xp(starts[i+1])}" y1="65" y2="65" stroke="#a2f1d5" stroke-width="2"/>`;
  svg+=`<path d="M${xp(starts[i])} 133v7m0-3h${xp(starts[i+1])-xp(starts[i])}m0-4v7" stroke="#607e8d" stroke-width="1" fill="none"/><text x="${xp((starts[i]+starts[i+1])/2)}" y="131" fill="#bdced7" text-anchor="middle" font-size="12">${fmt(s.length)} m</text>`;
 });
 if(['dead','both'].includes(model.load_mode))model.dead.forEach(load=>{
  if(!load.w)return;
  model.spans.forEach((s,i)=>{if(load.span!==-1&&load.span!==i)return;const a=starts[i]+s.length*load.start,b=starts[i]+s.length*load.end;
   svg+=`<line x1="${xp(a)}" x2="${xp(b)}" y1="42" y2="42" stroke="#7aabb9"/>`;
   for(let x=a;x<=b;x+=(b-a)/Math.max(2,Math.round((b-a)/total*24)))svg+=`<line x1="${xp(x)}" x2="${xp(x)}" y1="42" y2="61" stroke="#7aabb9" marker-end="url(#dl-arrow)"/>`;
  });
 });
 if(snap && display==='snapshot') snap.lane.forEach(v=>{svg+=`<rect x="${xp(v.start)}" y="47" width="${Math.max(0,xp(v.end)-xp(v.start))}" height="13" fill="#edb66f" opacity=".24"/>`});
 if(['live','both'].includes(model.load_mode)) {
  const pattern=vehiclePattern(),weights=pattern.weights,spaces=pattern.spaces,displayWeights=weights.map(w=>w*visualAxleFactor());let offsets=[0];spaces.forEach(s=>offsets.push(offsets.at(-1)+s));
  const front=Math.min(total*.78,Math.max(offsets.at(-1)+total*.12,total*.6));
  const axles=snap&&display==='snapshot'?snap.axles:display==='influence'&&influenceData?.governing_max?influenceData.governing_max.axles:weights.map((w,i)=>({x:front-offsets[i],load:w,id:i+1})).filter(a=>a.x>=0&&a.x<=total);
  const loadScale=35/Math.max(...displayWeights);const labels=[];
  axles.forEach(a=>{const special=snap?.record.case==='hl93_two_trucks',shownLoad=(special?([35,145,145][(a.id-1)%3]*.9*(model.live.axle_factor??1)):displayWeights[a.id-1]),y=61-shownLoad*loadScale;const labelX=Math.max(18,Math.min($('#beam').clientWidth-18,xp(a.x))),labelWidth=String(Math.round(shownLoad)).length*7+8;let labelY=y-5;while(labels.some(b=>Math.abs(labelX-b.x)<(labelWidth+b.w)/2&&Math.abs(labelY-b.y)<13))labelY-=14;labels.push({x:labelX,y:labelY,w:labelWidth});svg+=`<line class="axle-arrow" data-load="${shownLoad}" x1="${xp(a.x)}" x2="${xp(a.x)}" y1="${y}" y2="61" stroke="#ecb46a" stroke-width="1.6" marker-end="url(#arrow)"/><text x="${labelX}" y="${labelY}" text-anchor="middle" font-size="12" fill="#ffd49a">${fmt(shownLoad,0)}</text>`});
 }
 if(model.load_mode==='thermal')svg+=`<rect x="${xp(0)}" y="19" width="${xp(total)-xp(0)}" height="25" rx="4" fill="url(#thermal-gradient)" opacity=".92"/><text x="${xp(0)+8}" y="29" font-size="9" fill="#17374b">${t('thermalTop')}</text><text x="${xp(0)+8}" y="41" font-size="9" fill="#17374b">${t('thermalBottom')}</text><text x="${xp(total)-8}" y="35" text-anchor="end" font-size="11" fill="#17374b">ΔT ${model.thermal.delta_T>0?'+':''}${fmt(model.thermal.delta_T,1)} °C</text>`;
 starts.forEach((x,i)=>{
  const X=xp(x);
  if(model.supports[i]==='fixed'){
   // Integral abutment: clamped wall with hatching on the outer side.
   const side=i===0?-1:i===starts.length-1?1:0,wx=side?X+side*3:X;
   svg+=`<line x1="${wx}" x2="${wx}" y1="62" y2="104" stroke="#dceaf0" stroke-width="3"/>`;
   for(let k=0;k<6;k++){const y=66+k*7;svg+=side?`<line x1="${wx}" x2="${wx+side*7}" y1="${y}" y2="${y+6}" stroke="#9fb9c6"/>`:`<line x1="${X-7}" x2="${X+7}" y1="${y+6}" y2="${y}" stroke="#9fb9c6"/>`;}
  } else svg+=`<path d="M${X} 89l-8 13h16Z" fill="#dceaf0" stroke="#dceaf0"/>`;
  if(model.supports[i]==='spring'){
   // Rotational spring: a spiral around the support node.
   let d='';for(let a=0;a<=4.4*Math.PI;a+=.25){const r=2+a*1.25;d+=`${d?'L':'M'}${(X+r*Math.cos(a)).toFixed(1)} ${(78+r*Math.sin(a)).toFixed(1)}`;}
   svg+=`<path d="${d}" fill="none" stroke="#f0b35a" stroke-width="1.4"/>`;
  }
  if(model.supports[i]==='roller')svg+=`<circle cx="${X-4}" cy="105" r="2" fill="#cadbe3"/><circle cx="${X+4}" cy="105" r="2" fill="#cadbe3"/>`;
  svg+=`<line x1="${X-13}" x2="${X+13}" y1="109" y2="109" stroke="#7695a6"/><text x="${X}" y="121" text-anchor="middle" font-size="11" fill="#91acbb">R${i+1}</text>`;
 });
 $('#beam').innerHTML=svg;$('#beam').setAttribute('aria-label',t('beamLoads'));
 $('#model-summary').textContent=`${model.spans.length} ${t('span').toLowerCase()}${lang==='en'&&model.spans.length>1?'s':lang==='fr'&&model.spans.length>1?'s':''} · ${fmt(total)} m`;
 $('#load-caption').innerHTML=model.load_mode==='thermal'?`<span class="thermal-badge">${t('thermalOnly')} · α ${fmt(model.thermal.alpha_micro,2)}×10⁻⁶/°C · h ${fmt(model.thermal.depth,0)} mm</span>`:model.load_mode==='dead'?t('deadOnly'):snap&&display==='snapshot'?`${snap.record.case==='hl93_two_trucks'?t('twoTruckCase'):vehicleName()} · ${t('nominalTruck')}`:`${vehicleName()} · ${t('nominalTruck')}`;
}
function caseText(c) {
 if(!c)return '';
 const name=c.case==='hl93_two_trucks'?t('twoTruckCase'):c.case==='lane'?t('lane'):c.case==='unloaded'?t('unloaded'):t('truck');
 const canadianLane=c.case==='lane'&&canadianLaneVehicle(),codeFactor=canadianLane?`${t('fraction')} ×${fmt(model.live.vehicle==='CL625'?.8:model.live.lane_fraction,2)}`:['Cooper','Maintenance'].includes(model.live.vehicle)?t('noDynamic'):`${t('dynamicFactor')} ×${fmt(c.factor,2)}`;
 return `${name} · ${t('axles')} ${c.axles.length?c.axles.join('–'):'—'} · ${codeFactor} · ${t('loadFactor')} ×${fmt(model.live.factor??1,2)} · ${t('axleFactor')} ×${fmt(model.live.axle_factor??1,2)}${c.rear_spacing!==undefined?` · s₃ = ${fmt(c.rear_spacing,2)} m`:''}${c.second_position!==undefined?` · x₂ = ${fmt(c.second_position)} m · ≥ ${fmt(c.gap,2)} m`:''} · x₁ = ${fmt(c.position)} m · ${c.direction==='forward'?t('forward'):t('backward')}`;
}
function showView(name) {
 document.body.classList.toggle('comparison-mode',name==='comparison');
 const previous=view;view=name;$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));$$('.result-view').forEach(el=>el.classList.toggle('hidden',el.id!==name+'-view'));
 // v0.8 vibration modes (modes.js): its own view, animated deck drawing.
 if(name==='diagrams'&&result)requestAnimationFrame(()=>{if(measurePlots())renderCharts()});
 if(name==='modes'&&typeof modalShow==='function')modalShow();else if(previous==='modes'&&typeof modalHide==='function')modalHide();
 if(name==='comparison'&&typeof renderComparison==='function')renderComparison();
}
function renderResults() {
 if(!result){$('#charts').innerHTML=`<p class="help">${t('noResults')}</p>`;return;}
 const thermal=result.kind==='thermal';
 const ext=result.extrema;const shear=ext.filter(e=>e.response==='V').reduce((a,b)=>Math.abs(a.value)>Math.abs(b.value)?a:b);const defl=ext.filter(e=>e.response==='D').reduce((a,b)=>Math.abs(a.value)>Math.abs(b.value)?a:b);
 const metrics=[[t(thermal?'maxMoment':'sagging'),ext[0],'kN·m'],[t(thermal?'minMoment':'hogging'),ext[1],'kN·m'],[t('maxShear'),shear,'kN'],[t('maxDeflection'),defl,'mm']];
 $('#metrics').innerHTML=metrics.map(([label,e,unit],i)=>{const tag=thermal?'div':'button';return `<${tag} class="metric" ${thermal?'':`data-critical="${e.index}" data-sense="${e.sense}" title="${t('showCase')}"`}><div class="metric-label">${label}</div><div class="metric-value">${fmt(i>=2?Math.abs(e.value):e.value,unit==='mm'?2:1)} <small>${unit}</small></div><div class="metric-location">${i>=2?(e.value<0?'−':'+')+' · ':''}${t('at')} x = ${fmt(e.x)} m${thermal?'':' ↗'}</div></${tag}>`}).join('');
 renderReactions();
 $('.reaction-title').textContent=t('supportReactions')+' · '+t(thermal?'thermalCase':snap&&display==='snapshot'?'snapshot':'envelope');
 $('#excel').title=excelAvailable?t(thermal?'thermalCase':'envelope'):t('excelUnavailable');$('#excel').classList.toggle('excel-off',!excelAvailable);
 $('#reactions').title=thermal?t('thermalCase'):t('reactionHelp');
 $('#precision-note').textContent=thermal?`PyCBA ${result.meta.pycba} · ${t('curvature')} κ = ${Number(result.meta.curvature).toExponential(3)} 1/m`:`PyCBA ${result.meta.pycba} · Δx ${fmt(result.meta.travel_step,2)} m · ${fmt(result.meta.positions,0)} ${t('positions')} · ${result.meta.groups} ${t('groups')}`;
 renderCharts();renderTable();renderMethod();if(typeof renderComparison==='function')renderComparison();showView(view);
 $('#display-controls').classList.toggle('hidden',thermal);$$('[data-display]').forEach(b=>b.classList.toggle('active',b.dataset.display===display));$('#position-controls').classList.toggle('hidden',thermal||display!=='snapshot');$('#play').textContent=t(playTimer?'stop':'play');
 if(!thermal)syncPositionControls(snap?.record.position);
 $('#legend').classList.toggle('hidden',thermal||display!=='envelope');
 if(snap&&display==='snapshot'){$('#governing').innerHTML=`<span>${playTimer?t('animating')+' · ':''}${caseText(snap.record)}</span><button id="restore" class="text-button">${t('restore')}</button>`;$('#governing').classList.remove('hidden')}
 else if(display==='influence'&&influenceData&&!thermal){$('#governing').innerHTML=`<span>${influenceSummary()}</span><button id="restore" class="text-button">${t('restore')}</button>`;$('#governing').classList.remove('hidden')}
 else $('#governing').classList.add('hidden');
 renderStiffnessWarning();
}
function adjacentEI(i){
 // EI of the span ends meeting at support i (constant-section estimate for the UI).
 const out=[];[i-1,i].forEach(j=>{const s=model.spans[j];if(!s)return;const z=model.nonprismatic&&s.zones.length?(j===i?s.zones[0]:s.zones.at(-1)):null;const sec=model.sections[z?(j===i?z.section:(z.end_section??z.section)):s.section]||model.sections[0];out.push({EI:sectionProps(sec).EI,L:s.length});});return out;
}
function defaultSpring(i){
 // Default k = sum of 3EI/L of the adjacent members: 50 % fixity, a neutral starting point.
 const k=adjacentEI(i).reduce((v,m)=>v+3*m.EI/m.L,0);return Number(k.toPrecision(2))||1e6;
}
function springFixityText(i){
 const r=result?.reactions?.[i];const f=r&&r.type==='spring'&&r.k===model.support_springs?.[i]?r.fixity:(()=>{const k=model.support_springs?.[i]||0,m=adjacentEI(i).reduce((v,a)=>v+3*a.EI/a.L,0);return k/(k+m)})();
 return `${t('fixity')} ≈ ${fmt(100*f,0)} %`;
}
function renderReactions(){
 if(!result)return;const thermal=result.kind==='thermal',live=snap&&(display==='snapshot');
 const neg=v=>v<-1e-6?' uplift':'';
 $('#reactions').innerHTML=result.reactions.map((r,i)=>{
  const fixed=r.type==='fixed'||r.type==='spring';
  let main=thermal?`<span class="${neg(r.value).trim()}">${fmt(r.value,1)}</span>`:live?`<span class="${neg(snap.R[i]).trim()}">${fmt(snap.R[i],1)}</span>`:`<button class="text-button${neg(r.min)}" data-critical="${3*result.x.length+i}" data-sense="min" title="${t('reactionCase')}">${fmt(r.min,1)}</button> / <button class="text-button" data-critical="${3*result.x.length+i}" data-sense="max" title="${t('reactionCase')}">${fmt(r.max,1)}</button>`;
  let moment='';
  if(fixed)moment=`<small class="moment-reaction" title="${t('momentReaction')}">Mr ${thermal?fmt(r.moment,1):live&&snap.Mr?fmt(snap.Mr[i],1):`<button class="text-button" data-critical="${r.moment_index}" data-sense="min">${fmt(r.moment_min,1)}</button> / <button class="text-button" data-critical="${r.moment_index}" data-sense="max">${fmt(r.moment_max,1)}</button>`} kN·m</small>`;
  return `<div class="reaction${fixed?' fixed':''}"><small>R${r.support} · ${fmt(r.x,1)} m${r.type==='fixed'?' · ⊏⊐':r.type==='spring'?` · ↻ ${fmt(100*r.fixity,0)} %`:''}</small>${main}${moment}</div>`}).join('');
 renderUpliftWarning();
 model.supports.forEach((s,i)=>{const el=$('#fixity-'+i);if(el)el.textContent=springFixityText(i)});
}
function renderUpliftWarning(){
 const box=$('#uplift-warning');if(!box)return;
 if(!result||result.kind==='thermal'){box.classList.add('hidden');return;}
 const live=snap&&display==='snapshot';
 const bad=result.reactions.map((r,i)=>({r,v:live?snap.R[i]:r.min})).filter(o=>o.v<-1e-6);
 if(!bad.length){box.classList.add('hidden');box.innerHTML='';return;}
 const why=live?'upliftSnapshot':model.load_mode==='live'?'upliftLive':model.load_mode==='dead'?'upliftDead':'upliftBoth';
 box.innerHTML=`<b>⚠ ${t('upliftTitle')}</b> ${bad.map(o=>`R${o.r.support} = ${fmt(o.v,1)} kN`).join(' · ')} — ${t(why)}`;
 box.classList.remove('hidden');
}
function renderStiffnessWarning(){
 const box=$('#stiffness-warning');if(!box)return;const jumps=result?.stiffness?.jumps||[];
 if(!jumps.length){box.classList.add('hidden');box.innerHTML='';return;}
 box.innerHTML=`<b>${t('stiffnessJumpTitle')}</b> `+jumps.map(j=>`x = ${fmt(j.x)} m (${t(j.kind==='support'?'support':'zone')}) : EI ${fmt(j.left/1e6,2)} → ${fmt(j.right/1e6,2)} ×10⁶ kN·m² (×${fmt(Math.max(j.left,j.right)/Math.min(j.left,j.right),2)})`).join(' · ')+`<br><small>${t('stiffnessJumpHelp')}</small>`;
 box.classList.remove('hidden');
}
function niceStep(v){const p=10**Math.floor(Math.log10(v)),m=v/p;return (m<1.5?1:m<3?2:m<7?5:10)*p;}
function axisGrid(amp,direction,Y){
 const G=plotGeom();
 // Graduated axis with a light grid: one or two labelled ticks on each side of zero.
 const limit=amp/1.12;let step=niceStep(limit/1.6);for(let i=0;i<4&&step/amp*G.half*G.k<20&&niceStep(step*1.8)<=limit;i++)step=niceStep(step*1.8);const digits=step>=1?0:step>=.1?1:step>=.01?2:3;let g='';
 for(let k=-Math.floor(limit/step);k<=Math.floor(limit/step);k++){if(!k)continue;const v=k*step,y=Y(v);if(y<G.top-G.u(12)||y>G.bot+G.u(6))continue;
  g+=`<line x1="26" x2="900" y1="${y.toFixed(2)}" y2="${y.toFixed(2)}" class="grid-line"/><text class="tick" x="30" y="${(y-G.u(3)).toFixed(2)}">${fmt(v,digits)}</text>`;}
 return g;
}
// v0.8: undistorted diagrams. The SVG keeps a 926-unit wide coordinate
// system but its height follows the real on-screen aspect ratio, so the
// scaling is uniform (no squashed text). Text sizes are given in screen
// pixels through --k (screen px per SVG unit).
let PG={H:106,k:1};
function plotGeom(){const {H,k}=PG,u=p=>p/k,top=u(20),bot=H-u(40);return {H,k,u,top,bot,mid:(top+bot)/2,half:(bot-top)/2,lab:H-u(7)};}
function measurePlots(){
 const svg=$('#charts svg');if(!svg)return false;const r=svg.getBoundingClientRect();if(r.width<50||r.height<20)return false;
 const k=r.width/926,H=r.height/k;if(Math.abs(H-PG.H)<.5&&Math.abs(k-PG.k)<.002)return false;PG={H,k};return true;
}
function plotAttrs(){return `viewBox="0 0 926 ${PG.H.toFixed(2)}" preserveAspectRatio="none" style="--k:${PG.k.toFixed(4)}"`;}
function afterCharts(redraw){if(measurePlots())redraw();}
let plotResizePending=false;
if(window.ResizeObserver)new ResizeObserver(()=>{if(plotResizePending)return;plotResizePending=true;requestAnimationFrame(()=>{plotResizePending=false;if(result&&view==='diagrams'){if(measurePlots())renderCharts();renderBeam();}if(view==='comparison')renderComparison();});}).observe($('.results'));
function renderCharts() {
 if(!result)return;
 if(display==='influence'&&result.kind!=='thermal'){renderInfluence();return;}
 const thermal=result.kind==='thermal',graph=!thermal&&snap&&display==='snapshot'?(snap.plot||snap):null;
 const xs=graph?graph.x:result.x;
 const total=result.x.at(-1),X=x=>26+x/total*874,G=plotGeom();
 const cfg=[['V',t('shear'),'kN','#407dcc',-1],['M',t('moment'),'kN·m','#008378',1],['D',t('deflection'),'mm','#9d762e',1]];
 $('#charts').innerHTML=cfg.map(([key,label,unit,color,direction])=>{
  const lo=graph?graph[key]:thermal?result.values[key]:result.min[key],hi=graph?graph[key]:thermal?result.values[key]:result.max[key];
  // In a truck position the envelope stays as a faint reference and fixes the scale.
  const delta=!thermal&&!graph&&deltaEffects.has(key)&&['live','both'].includes(model.load_mode)?hi.map((v,i)=>v-lo[i]):null;
  const ghost=graph?[result.min[key],result.max[key]]:[];
  const amp=Math.max(...lo.map(Math.abs),...hi.map(Math.abs),...ghost.flat().map(Math.abs),...(delta||[]),1e-6)*1.12,Y=v=>G.mid+direction*v/amp*G.half;
  const path=(values,xv=xs)=>values.map((v,i)=>`${i?'L':'M'}${X(xv[i]).toFixed(3)},${Y(v).toFixed(3)}`).join('');
  const polygon=path(hi)+lo.map((_,j)=>{const i=lo.length-1-j;return `L${X(xs[i]).toFixed(3)},${Y(lo[i]).toFixed(3)}`}).join('')+'Z';
  let svg=axisGrid(amp,direction,Y)+`<line x1="26" x2="900" y1="${G.mid}" y2="${G.mid}" stroke="#9db4c1" stroke-width=".8"/>`;
  result.reactions.forEach(r=>{svg+=`<line x1="${X(r.x)}" x2="${X(r.x)}" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#dbe5eb" stroke-dasharray="3 3"/><text x="${X(r.x)}" y="${G.lab}" text-anchor="middle">${fmt(r.x,1)}</text>`});
  ghost.forEach(g=>{svg+=`<path d="${path(g,result.x)}" fill="none" stroke="${color}" stroke-opacity=".28" stroke-width="1.2" stroke-dasharray="4 3"/>`});
  svg+=`<text x="20" y="${G.mid+G.u(4)}" text-anchor="end">0</text>${thermal?'':`<path d="${polygon}" fill="${color}" fill-opacity=".13"/>`}${!thermal&&!graph?`<path class="envelope-lower" d="${path(lo)}" fill="none" stroke="${color}" stroke-width="2.4"/>`:""}<path class="envelope-upper" d="${path(hi)}" fill="none" stroke="${color}" stroke-width="2.4"/><line class="cursor" x1="0" x2="0" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#426774" stroke-dasharray="2 2" visibility="hidden"/><circle class="cursor-high" r="${G.u(3.5)}" fill="${color}" visibility="hidden"/>${thermal?'':`<circle class="cursor-low" r="${G.u(3.5)}" fill="${color}" visibility="hidden"/>`}`;
  const peak=(values,best)=>{let k=0;values.forEach((v,i)=>{if(best(v,values[k]))k=i});return k};
  const labels=[[hi,peak(hi,(a,b)=>a>b)],[lo,peak(lo,(a,b)=>a<b)]].filter(([v,k])=>Math.abs(v[k])>amp*0.02);
  if(delta){svg+=`<path class="envelope-delta" d="${path(delta)}" fill="none" stroke="#c0392b" stroke-width="1.8" stroke-dasharray="6 3"/>`;labels.push([delta,peak(delta,(a,b)=>a>b)]);}
  const placed=[];labels.forEach(([v,k])=>{
   const text=(v===delta?'Δ ':'')+fmt(v[k],key==='D'?1:0),width=G.u(text.length*6.2+8),px=Math.min(900-width/2,Math.max(26+width/2,X(xs[k]))),py=Y(v[k]);
   if(placed.some(b=>b.text===text&&Math.abs(b.x-px)<G.u(2)))return;
   let y=Math.min(G.H-G.u(3),Math.max(G.u(12),py+(py>G.mid?G.u(15):-G.u(6))));
   for(let n=0;n<5&&placed.some(b=>Math.abs(px-b.x)<(width+b.w)/2&&Math.abs(y-b.y)<G.u(13));n++)y+=py>G.mid?-G.u(14):G.u(14);
   placed.push({x:px,y,w:width,text});svg+=`<text class="peak-label" x="${px}" y="${y}" text-anchor="middle" style="fill:${v===delta?'#c0392b':color}">${text}</text>`;
  });
  return `<div class="chart-row"><div class="chart-label" style="color:${color}">${label}<small>${unit}</small>${!thermal&&!graph&&['live','both'].includes(model.load_mode)?`<label class="delta-option" title="${t('delta')}"><input type="checkbox" data-delta="${key}" aria-label="${label} · ${t('delta')}" ${deltaEffects.has(key)?'checked':''}> Δ</label>`:''}</div><svg class="plot" tabindex="0" role="img" aria-label="${label} · ${unit}" data-effect="${key}" data-amp="${amp}" data-sign="${direction}" ${plotAttrs()}>${svg}</svg></div>`;
 }).join('')+stiffnessChart(X,total);
 if(!renderCharts.again){renderCharts.again=true;try{afterCharts(renderCharts)}finally{renderCharts.again=false}}
 $('.stiffness-plot')?.addEventListener('pointermove',chartHover);
 $$('#charts .plot').forEach(svg=>{svg.addEventListener('pointermove',chartHover);if(!thermal){svg.addEventListener('click',chartClick);svg.addEventListener('keydown',e=>{if(e.key==='Enter')inspectCase(svg.dataset.effect==='M'?result.x.length:svg.dataset.effect==='D'?2*result.x.length:0,'max')})}});
}
function influenceRows(){
 const il=influenceData,rows=[['V',t('shear'),'kN/kN','#407dcc',-1],['M',t('moment'),'kN·m/kN','#008378',1],['D',t('deflection'),'mm/kN','#9d762e',1],['R',`R${il.support}`,'kN/kN','#7a5bb5',-1]];
 if(il.fixed)rows.push(['Mr',`Mr${il.support}`,'kN·m/kN','#b5577a',-1]);
 return rows;
}
function ilValue(values,x){const xs=influenceData.x;let j=1;while(j<xs.length-1&&xs[j]<x)j++;const a=xs[j-1],b=xs[j],f=b>a?(x-a)/(b-a):0;return values[j-1]+(values[j]-values[j-1])*Math.max(0,Math.min(1,f));}
function influenceSum(){const g=influenceData?.governing_max;if(!g)return null;return g.axles.reduce((v,a)=>v+a.load*ilValue(influenceData.M,a.x),0);}
function influenceSummary(){
 const il=influenceData,sum=influenceSum(),g=il.governing_max;
 let text=`${t('ilAt')} x = ${fmt(il.x_station)} m (${t(il.side)}) · R${il.support}`;
 if(g&&sum!==null)text+=` · ${t('ilGoverning')} : ${caseText(g.record)} · ${t('ilSum')} = ${fmt(sum,1)} kN·m${g.record.case==='lane'?' ('+t('ilLaneNote')+')':''}`;
 return text;
}
function renderInfluence(){
 if(!influenceData){$('#charts').innerHTML=`<p class="help">${t('ilHint')}</p>`;return;}
 const il=influenceData,xs=il.x,total=result.x.at(-1),X=x=>26+x/total*874,g=il.governing_max,G=plotGeom();
 $('#charts').innerHTML=`<p class="help il-hint">${t('ilHint')}</p>`+influenceRows().map(([key,label,unit,color,direction])=>{
  const values=il[key],amp=Math.max(...values.map(Math.abs),1e-9)*1.12,Y=v=>G.mid+direction*v/amp*G.half;
  const d=values.map((v,i)=>`${i?'L':'M'}${X(xs[i]).toFixed(2)},${Y(v).toFixed(2)}`).join('');
  let svg=axisGrid(amp,direction,Y)+`<line x1="26" x2="900" y1="${G.mid}" y2="${G.mid}" stroke="#9db4c1" stroke-width=".8"/>`;
  result.reactions.forEach(r=>{svg+=`<line x1="${X(r.x)}" x2="${X(r.x)}" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#dbe5eb" stroke-dasharray="3 3"/><text x="${X(r.x)}" y="${G.lab}" text-anchor="middle">${fmt(r.x,1)}</text>`});
  svg+=`<path d="${d}L${X(total)},${G.mid}L${X(0)},${G.mid}Z" fill="${color}" fill-opacity=".12"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2.2"/>`;
  const marker=key==='R'||key==='Mr'?il.x_support:il.x_station;
  svg+=`<line x1="${X(marker)}" x2="${X(marker)}" y1="${G.top-G.u(14)}" y2="${G.bot+G.u(8)}" stroke="#c0392b" stroke-width="1.2"/>`;
  if(key==='M'&&g)g.axles.forEach(a=>{const y=Y(ilValue(values,a.x));svg+=`<line x1="${X(a.x)}" x2="${X(a.x)}" y1="${(y-G.u(16)).toFixed(1)}" y2="${(y-G.u(3)).toFixed(1)}" stroke="#d98c2b" stroke-width="1.6" marker-end="url(#il-arrow)"/>`});
  const peak=values.reduce((k,v,i)=>Math.abs(v)>Math.abs(values[k])?i:k,0);
  svg+=`<text class="peak-label" x="${Math.min(880,Math.max(46,X(xs[peak])))}" y="${Y(values[peak])>G.mid?Math.min(G.H-G.u(2),Y(values[peak])+G.u(15)):Math.max(G.u(12),Y(values[peak])-G.u(6))}" text-anchor="middle" style="fill:${color}">${fmt(values[peak],key==='D'?4:3)}</text>`;
  svg+=`<line class="cursor" x1="0" x2="0" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#426774" stroke-dasharray="2 2" visibility="hidden"/>`;
  return `<div class="chart-row"><div class="chart-label" style="color:${color}">η ${label}<small>${unit}</small></div><svg class="il-plot" role="img" aria-label="η ${label}" data-effect="${key}" ${plotAttrs()}><defs><marker id="il-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#d98c2b"/></marker></defs>${svg}</svg></div>`;
 }).join('');
 $$('.il-plot').forEach(svg=>{svg.addEventListener('pointermove',influenceHover);svg.addEventListener('click',influenceClick);});
 if(!renderInfluence.again){renderInfluence.again=true;try{afterCharts(renderInfluence)}finally{renderInfluence.again=false}}
}
function pointerX(e){const rect=e.currentTarget.getBoundingClientRect();return Math.max(0,Math.min(1,((e.clientX-rect.left)/rect.width*926-26)/874))*result.x.at(-1);}
function influenceHover(e){
 if(!influenceData)return;const x=pointerX(e),sx=26+x/result.x.at(-1)*874;
 $$('.il-plot .cursor').forEach(line=>{line.setAttribute('x1',sx);line.setAttribute('x2',sx);line.setAttribute('visibility','visible')});
 $('#station-readout').innerHTML=`<span>P = 1 kN @ x <b>${fmt(x)} m</b></span>`+influenceRows().map(([key,label,unit])=>`<span>η ${label} <b>${fmt(ilValue(influenceData[key],x),key==='D'?4:3)}</b> ${unit}</span>`).join('');
}
function influenceClick(e){requestInfluence(nearest(pointerX(e)));}
async function requestInfluence(index){
 if(!result||result.kind==='thermal'||!jobId)return;stopAnimation();const token=++snapRevision;
 try{const data=await solver.request('influence',{job:jobId,index});if(token!==snapRevision)return;influenceData=data;snap=null;display='influence';view='diagrams';renderResults();renderBeam();}
 catch(e){console.error(e);if(token===snapRevision){$('#error').textContent=t('failed');$('#error').classList.remove('hidden');}}
}
// ---- Crossing animation: one precomputed traverse, then pure client-side playback.
function stopAnimation(){if(playTimer){clearInterval(playTimer);playTimer=null;const b=$('#play');if(b)b.textContent=t('play');}}
function showFrame(k){
 const data=traverseData,f=data.frames[k];frameIndex=k;
 snap={record:f.record,axles:f.axles,lane:f.lane,R:f.R,Mr:f.Mr,plot:{x:data.x,sides:result.sides,V:f.V,M:f.M,D:f.D}};
 display='snapshot';syncPositionControls(Number(f.position.toFixed(2)));
 renderCharts();renderBeam();renderReactions();
 $('#governing').innerHTML=`<span>${playTimer?t('animating')+' · ':''}${caseText(f.record)}</span><button id="restore" class="text-button">${t('restore')}</button>`;$('#governing').classList.remove('hidden');
}
async function ensureTraverse(){
 const key=`${jobId}|${manualDirection}`;
 if(traverseData?.key===key)return traverseData;
 const data=await solver.request('traverse',{job:jobId,direction:manualDirection,frames:60});
 data.key=key;traverseData=data;return data;
}
async function togglePlay(){
 if(playTimer){stopAnimation();renderResults();return;}
 if(!result||result.kind==='thermal'||!jobId)return;
 const token=revision;let data;
 try{data=await ensureTraverse();}catch(e){console.error(e);return;}
 if(token!==revision)return;
 let k=0;$('#play').textContent=t('stop');
 playTimer=setInterval(()=>{if(token!==revision||!traverseData){stopAnimation();return;}showFrame(k);k++;if(k>=data.frames.length){stopAnimation();renderResults();}},85);
}
function scrubFrame(position){
 // Slider scrubbing reuses precomputed frames when available: no solver call.
 const data=traverseData;if(!data||data.key!==`${jobId}|${manualDirection}`)return false;
 let best=0;data.frames.forEach((f,i)=>{if(Math.abs(f.position-position)<Math.abs(data.frames[best].position-position))best=i});
 if(Math.abs(data.frames[best].position-position)>0.6)return false;showFrame(best);return true;
}
function stiffnessChart(X,total){
 const st=result?.stiffness;if(!st||!st.EI.length)return '';
 const max=Math.max(...st.EI),min=Math.min(...st.EI);if(max<=0)return '';
 const G=plotGeom(),Y=v=>G.bot-v/(max*1.08)*(G.bot-G.top),d=st.x.map((x,i)=>`${i?'L':'M'}${X(x).toFixed(2)},${Y(st.EI[i]).toFixed(2)}`).join('');
 let svg=`<line x1="26" x2="900" y1="${G.bot}" y2="${G.bot}" stroke="#9db4c1" stroke-width=".8"/><path d="${d}L${X(total)},${G.bot}L${X(0)},${G.bot}Z" fill="#7a5bb5" fill-opacity=".12"/><path d="${d}" fill="none" stroke="#7a5bb5" stroke-width="2"/>`;
 result.reactions.forEach(r=>{svg+=`<line x1="${X(r.x)}" x2="${X(r.x)}" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#dbe5eb" stroke-dasharray="3 3"/>`});
 st.jumps.forEach(j=>{svg+=`<circle cx="${X(j.x)}" cy="${Y(Math.max(j.left,j.right))}" r="${G.u(4.5)}" fill="none" stroke="#c0392b" stroke-width="1.6"/>`});
 svg+=`<text x="20" y="${Y(max)+G.u(4)}" text-anchor="end">${fmt(max/1e6,1)}</text><text x="20" y="${Y(min)+G.u(4)}" text-anchor="end">${fmt(min/1e6,1)}</text>`;
 svg+=`<line class="cursor" y1="${G.top}" y2="${G.bot}" stroke="#426774" stroke-dasharray="2 2" visibility="hidden"/><circle class="cursor-ei" r="${G.u(3.5)}" fill="#7a5bb5" visibility="hidden"/>`;
 return `<div class="chart-row stiffness-row"><div class="chart-label" style="color:#7a5bb5">EI<small>×10⁶ kN·m²</small></div><svg class="stiffness-plot" data-max="${max}" role="img" aria-label="EI(x)" ${plotAttrs()}>${svg}</svg></div>`;
}
function nearest(x,xs=result.x) {let best=0;for(let i=1;i<xs.length;i++)if(Math.abs(xs[i]-x)<Math.abs(xs[best]-x))best=i;return best;}
function currentGraph(){return snap&&display==='snapshot'?(snap.plot||snap):null;}
function pointerStation(e) {const rect=e.currentTarget.getBoundingClientRect();return nearest(Math.max(0,Math.min(1,((e.clientX-rect.left)/rect.width*926-26)/874))*result.x.at(-1),currentGraph()?.x||result.x);}
function eiValue(x,side='right'){const st=result.stiffness;if(!st)return null;let j=0;while(j<st.x.length-1&&st.x[j]<x-1e-8)j++;if(Math.abs(st.x[j]-x)<1e-8){if(side==='right')while(j+1<st.x.length&&Math.abs(st.x[j+1]-x)<1e-8)j++;return st.EI[j];}const a=Math.max(0,j-1),f=(x-st.x[a])/(st.x[j]-st.x[a]);return st.EI[a]+f*(st.EI[j]-st.EI[a]);}
function chartHover(e) {
 if(!result)return;const graph=display==='influence'?null:currentGraph(),i=e.currentTarget.classList.contains('stiffness-plot')?nearest(pointerX(e)):pointerStation(e),x=(graph?.x||result.x)[i],sx=26+x/result.x.at(-1)*874;
 $('.stiffness-plot')?.addEventListener('pointermove',chartHover);
 $$('#charts .plot').forEach(svg=>{
  const key=svg.dataset.effect,thermal=result.kind==='thermal',lo=graph?graph[key][i]:thermal?result.values[key][i]:result.min[key][i],hi=graph?graph[key][i]:thermal?result.values[key][i]:result.max[key][i],G=plotGeom(),Y=v=>G.mid+Number(svg.dataset.sign)*v/Number(svg.dataset.amp)*G.half;
  const line=svg.querySelector('.cursor');line.setAttribute('x1',sx);line.setAttribute('x2',sx);line.setAttribute('visibility','visible');
  [['.cursor-high',hi],['.cursor-low',lo]].forEach(([cl,v])=>{const circle=svg.querySelector(cl);if(circle){circle.setAttribute('cx',sx);circle.setAttribute('cy',Y(v));circle.setAttribute('visibility','visible')}});
 });
 const side=(graph?.sides||result.sides)[i],ei=eiValue(x,side),eiSvg=$('.stiffness-plot');if(eiSvg&&ei!==null){const line=eiSvg.querySelector('.cursor'),dot=eiSvg.querySelector('.cursor-ei'),G=plotGeom();line.setAttribute('x1',sx);line.setAttribute('x2',sx);line.setAttribute('visibility','visible');dot.setAttribute('cx',sx);dot.setAttribute('cy',G.bot-ei/(Number(eiSvg.dataset.max)*1.08)*(G.bot-G.top));dot.setAttribute('visibility','visible');}
 $('#station-readout').innerHTML=`<span>x <b>${fmt(x)} m</b> · ${t((graph?.sides||result.sides)[i])}</span>`+['V','M','D'].map(k=>`<span>${k==='D'?'δ':k} <b>${graph?fmt(graph[k][i]):result.kind==='thermal'?fmt(result.values[k][i]):fmt(result.min[k][i])+' / '+fmt(result.max[k][i])+(deltaEffects.has(k)&&display==='envelope'&&['live','both'].includes(model.load_mode)?' · Δ '+fmt(result.max[k][i]-result.min[k][i]):'')}</b> ${k==='M'?'kN·m':k==='V'?'kN':'mm'}</span>`).join('')+(ei===null?'':`<span>EI <b>${fmt(ei/1e6,3)}</b> ×10⁶ kN·m²</span>`);
}
function chartClick(e) {
 if(!result||result.kind==='thermal')return;const gi=pointerStation(e),i=currentGraph()?nearest(currentGraph().x[gi]):gi,key=e.currentTarget.dataset.effect,offset=key==='M'?result.x.length:key==='D'?2*result.x.length:0;
 const rect=e.currentTarget.getBoundingClientRect(),G=plotGeom(),y=(e.clientY-rect.top)/rect.height*G.H,Y=v=>G.mid+Number(e.currentTarget.dataset.sign)*v/Number(e.currentTarget.dataset.amp)*G.half;
 const sense=Math.abs(y-Y(result.min[key][i]))<Math.abs(y-Y(result.max[key][i]))?'min':'max';inspectCase(offset+i,sense);
}
async function inspectCase(index,sense,position=null) {
 if(!result||result.kind==='thermal'||$('#excel').disabled)return;
 stopAnimation();const token=++snapRevision;
 try{
  const data=await solver.request('snapshot',{job:jobId,index,sense,position,direction:manualDirection});
  if(token!==snapRevision)return;
  snap=data;display='snapshot';view='diagrams';syncPositionControls(Number(data.record.position.toFixed(3)));renderResults();renderBeam();return data;
 }catch(e){if(token===snapRevision){$('#error').textContent=t('failed');$('#error').classList.remove('hidden')}}
}
function renderTable() {
 if(!result)return;
 const seen=new Set();
 const thermal=result.kind==='thermal';
 const headers=thermal?'<th>V</th><th>M</th><th>δ</th><th>R</th>':'<th>V min</th><th>V max</th><th>M min</th><th>M max</th><th>δ min</th><th>δ max</th><th>R min</th><th>R max</th>';
 $('#table-view').innerHTML=`<p class="help">${t(thermal?'thermalCase':'envelope')} · V: kN · M: kN·m · δ: mm · R: kN</p><label class="table-options">${t('subdivisions')} <input id="subdivisions" type="number" min="2" max="100" step="1" data-path="subdivisions" value="${model.subdivisions}"></label><div class="table-scroll"><table><thead><tr><th>${t('span')}</th><th>x (m)</th><th>${t('side')}</th>${headers}</tr></thead><tbody>${result.table.map(row=>{const r=result.reactions.find(r=>Math.abs(r.x-row.x)<1e-8&&!seen.has(r.support));if(r)seen.add(r.support);const cells=thermal?['V','M','D'].map(k=>`<td>${fmt(row[k])}</td>`).join('')+`<td>${r?fmt(r.value):'—'}</td>`:['V_min','V_max','M_min','M_max','D_min','D_max'].map(k=>`<td>${fmt(row[k])}</td>`).join('')+`<td>${r?fmt(r.min):'—'}</td><td>${r?fmt(r.max):'—'}</td>`;return `<tr class="${row.station===0||row.station===model.subdivisions?'support-station':''}"><td>${row.span} · ${row.station}</td><td>${fmt(row.x)}</td><td>${t(row.side)}</td>${cells}</tr>`}).join('')}</tbody></table></div><div class="table-footnote">${t('subdivisionHelp')}</div>`;
}
function renderMethod() {
 const thermal=result?.kind==='thermal',sections=thermal?[['methodTitle','methodBody'],['thermalNotes','thermalBody'],['sectionNotes','sectionBody'],['unitsTitle','unitsBody']]:[['methodTitle','methodBody'],['sectionNotes','sectionBody'],['loadNotes','loadBodyCurrent'],['methodScope','scopeBodyCurrent'],['precisionTitle','precisionBody'],['unitsTitle','unitsBody']];
 const source=model?.live?.vehicle==='CL750QC'?`CAN/CSA S6-25 · 3.8.4.5.3<br>MTQ · Info-structures A2023-05 · 2023-02-17<br>`:model?.live?.vehicle==='CL625'?`CAN/CSA S6-25 · 3.8.4.5.3<br>`:model?.live?.vehicle==='HL93Truck'||model?.live?.vehicle==='HL93Tandem'?`AASHTO LRFD HL-93 · PyCBA VehicleLibrary.US<br>`:model?.live?.vehicle==='Cooper'?`AREA / AREMA Cooper E · PyCBA VehicleLibrary.US<br>`:'';
 $('#method-view').innerHTML=`<div class="method-content">${sections.map(([h,p])=>`<h3>${t(h)}</h3><p>${t(p)}</p>`).join('')}<h3>${t('sourceTitle')}</h3><p>${thermal?'':source}<a href="https://ccaprani.github.io/pycba/" target="_blank" rel="noreferrer">PyCBA · ${result?result.meta.pycba:'1.0.1'}</a></p></div>`;
}
function restoreEnvelope() {stopAnimation();snapRevision++;snap=null;display='envelope';renderResults();renderBeam();}
document.addEventListener('keydown',e=>{if(e.target.type==='number'&&['ArrowUp','ArrowDown'].includes(e.key))e.preventDefault()});
document.addEventListener('input',e=>{if(e.target.id==='position-slider'){const value=Number(e.target.value);$('#position').value=value;if(result&&display==='snapshot'){stopAnimation();if(!scrubFrame(value))queuePositionSnapshot(value);}return;}onInput(e);});
document.addEventListener('change',e=>{
 if(e.target.dataset.delta){const key=e.target.dataset.delta;if(e.target.checked)deltaEffects.add(key);else deltaEffects.delete(key);renderCharts();$('#station-readout').innerHTML='';return}
 if(e.target.id==='project-file'&&e.target.files[0]){openSelectedProject(e.target.files[0]);e.target.value='';return}
 if(e.target.id==='axle-count'){const n=Number(e.target.value);while(model.live.weights.length<n)model.live.weights.push(100);while(model.live.spacings.length<n-1)model.live.spacings.push(1.2);model.live.weights.length=n;model.live.spacings.length=n-1;renderInputs();changed();}
 if(e.target.id==='position' && e.target.validity.valid){syncPositionControls(Number(e.target.value));inspectCase(0,'max',Number(e.target.value));}
 if(e.target.dataset.path?.startsWith('sections.') && e.target.type==='number'){
  const i=Number(e.target.dataset.path.split('.')[1]),card=$$('#input-content > .section-card')[i],s=model.sections[i];
  if(card&&s){const p=sectionProps(s);card.querySelector('.section-svg').outerHTML=sectionSvg(s);card.querySelector('.section-props').innerHTML=`${s.kind==='ei'?`<span>EI ${fmt(p.EI,0)} kN·m²</span>`:`<span>A ${fmt(p.A,4)} m²</span><span>I ${fmt(p.I,5)} m⁴</span><span>EI ${fmt(p.EI,0)} kN·m²</span>`}`;}
 }
});
document.addEventListener('click',e=>{
 if(e.target.closest('#boot-retry')){location.reload();return;}
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(!model&&!['en','fr','collapse-inputs'].includes(b.id))return;
 if(b.id==='en'||b.id==='fr'){lang=b.id;localStorage.setItem('qb-language-v03',lang);translate();if(view==='modes'&&typeof renderModesView==='function'){renderModesView();renderBeam();}return}
 if(b.id==='open-project'){$('#project-file').click();return}
 if(b.id==='save-project'){saveProject();return}
 if(b.id==='focus-results'){const active=document.body.classList.toggle('focus-results');b.setAttribute('aria-pressed',active);requestAnimationFrame(()=>{if(measurePlots())renderCharts();renderBeam();});return}
 if(b.id==='collapse-inputs'){const collapsed=$('.inputs').classList.toggle('collapsed');b.textContent=collapsed?'+':'−';b.setAttribute('aria-expanded',!collapsed);return}
 if(b.dataset.panel){inputPanel=b.dataset.panel;$$('[data-panel]').forEach(el=>el.classList.toggle('active',el===b));renderInputs();return}
 if(b.dataset.view){showView(b.dataset.view);return}
 if(b.dataset.mode){model.load_mode=b.dataset.mode;$$('[data-mode]').forEach(el=>el.classList.toggle('active',el===b));renderInputs();changed();return}
 if(b.dataset.spans){const n=Number(b.dataset.spans);while(model.spans.length<n)model.spans.push(clone(model.spans.at(-1)));model.spans.length=n;model.supports=Array.from({length:n+1},(_,i)=>model.supports[i]||'roller');model.support_springs=Array.from({length:n+1},(_,i)=>model.supports[i]==='spring'?(model.support_springs?.[i]||defaultSpring(i)):0);if(!model.supports.includes('spring'))model.support_springs=[];model.dead=model.dead.filter(d=>d.span<n);renderInputs();changed();return}
 if(b.id==='reset'){model=clone(defaultModel);if(lang==='fr')model.dead[0].name=t('permanentName');projectName=t('untitled');$$('[data-mode]').forEach(el=>el.classList.toggle('active',el.dataset.mode===model.load_mode));renderInputs();changed();return}
 if(b.id==='add-section'){const s=clone(model.sections.at(-1));s.name='S'+(model.sections.length+1);model.sections.push(s);renderInputs();changed();return}
 if(b.dataset.removeSection!==undefined){const i=Number(b.dataset.removeSection);if(model.spans.some(s=>s.section===i||s.zones.some(z=>z.section===i||z.end_section===i))){$('#error').textContent=t('deleteSectionHelp');$('#error').classList.remove('hidden');return}model.sections.splice(i,1);model.spans.forEach(s=>{if(s.section>i)s.section--;s.zones.forEach(z=>{if(z.section>i)z.section--;if(z.end_section>i)z.end_section--})});renderInputs();changed();return}
 if(b.dataset.addZone!==undefined){const zones=model.spans[Number(b.dataset.addZone)].zones,last=zones.at(-1),previous=zones.length>1?zones.at(-2).end:0;last.end=(previous+1)/2;zones.push({...clone(last),end:1});renderInputs();changed();return}
 if(b.dataset.removeZone!==undefined){const [i,j]=b.dataset.removeZone.split(',').map(Number);const z=model.spans[i].zones;z.splice(j,1);z.at(-1).end=1;renderInputs();changed();return}
 if(b.id==='add-dead'){model.dead.push({name:t('permanentName')+' '+(model.dead.length+1),w:5,factor:1,span:-1,start:0,end:1});renderInputs();changed();return}
 if(b.dataset.removeDead!==undefined){model.dead.splice(Number(b.dataset.removeDead),1);renderInputs();changed();return}
 if(b.dataset.critical!==undefined){inspectCase(Number(b.dataset.critical),b.dataset.sense);return}
 if(b.dataset.display==='envelope'||b.id==='restore'){restoreEnvelope();return}
 if(b.dataset.display==='influence'){if(!result||result.kind==='thermal')return;const nx=result.x.length,e=result.extrema.find(x=>x.response==='M'&&x.sense==='max');requestInfluence(influenceData&&display!=='influence'?influenceData.station:e?e.index-nx:0);return}
 if(b.id==='play'){togglePlay();return}
 if(b.dataset.display==='snapshot'){syncPositionControls();inspectCase(0,'max',Number($('#position').value));return}
 if(b.id==='reverse'){stopAnimation();manualDirection=manualDirection==='forward'?'reverse':'forward';syncPositionControls();inspectCase(0,'max',Number($('#position').value));return}
 if(b.id==='excel'&&jobId)downloadExcel();
});
let engineReady=false;
async function init() {
 try{
  translate();
  const pre=window.QB_DEFAULT;
  if(pre&&pre.version===QB_META.version&&pre.result){
   // Instant start: the default model's results were computed at build time.
   // The UI is usable at once; Pyodide/NumPy/SciPy keep loading behind it and
   // the engine silently recomputes the same model when it is ready.
   defaultModel=clone(pre.model);model=clone(defaultModel);if(lang==='fr')model.dead[0].name=t('permanentName');
   projectName=t('untitled');savedModel=modelText();savedProjectName=projectName;
   result=pre.result;jobId=null;snap=null;display='envelope';
   translate();$('#charts').classList.remove('stale');$('#excel').disabled=true;
   $('#status').textContent=t('preloaded');$('#status').classList.add('busy');
   window.QBSplash?.done();
   await solver.ready;engineReady=true;
   if(revision===0){$('#status').textContent=t('solving');calculate(revision);}
   return;
  }
  await solver.ready;engineReady=true;window.QBSplash?.stage('engine');defaultModel=await solver.request('defaults');model=clone(defaultModel);if(lang==='fr')model.dead[0].name=t('permanentName');projectName=t('untitled');savedModel=modelText();savedProjectName=projectName;translate();changed();}
 catch(e){console.error(e);window.QBSplash?.fail(e,bootErrorHtml(e));$('#error').innerHTML=bootErrorHtml(e);$('#error').classList.remove('hidden');$('#status').textContent=t('failed')}
}
function registerAnalysisTools() {
 const context=document.modelContext;if(!context?.registerTool)return;
 const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 const register=tool=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(console.warn)}catch(e){console.warn(e)}};
 register({name:'read_analysis_summary',description:'Read the completed bridge model envelope summary and support reactions.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(input){
  if(!input||typeof input!=='object'||Object.keys(input).length)throw Error('Expected an empty object');
  if(!result||$('#excel').disabled)throw Error('Analysis is not ready');
  return {version:QB_META.version,kind:result.kind,extrema:result.extrema,reactions:result.reactions,meta:result.meta};
 }});
 register({name:'inspect_governing_case',description:'Show a compatible governing arrangement for a current envelope response index and min/max sense.',inputSchema:{type:'object',properties:{index:{type:'integer',minimum:0},sense:{type:'string',enum:['min','max']}},required:['index','sense'],additionalProperties:false},annotations:{readOnlyHint:false},async execute(input){
  if(!input||Object.keys(input).some(k=>!['index','sense'].includes(k))||!Number.isInteger(input.index)||!['min','max'].includes(input.sense)||!result||result.kind==='thermal'||input.index<0||input.index>=result.case_max.length||$('#excel').disabled)throw Error('Invalid case or analysis is not ready');
  const data=await inspectCase(input.index,input.sense);if(!data)throw Error('Case could not be displayed');
  return {record:data.record,reactions:data.R};
 }});
}
registerAnalysisTools();
$('#replace-dialog').addEventListener('close',()=>{const choice=$('#replace-dialog').returnValue,project=pendingProject;pendingProject=null;if(!project||!['save','discard'].includes(choice))return;if(choice==='save'&&!saveProject())return;applyProject(project)});
// All modules must be initialized before the first render in the combined HTML.
document.addEventListener('DOMContentLoaded',init,{once:true});

