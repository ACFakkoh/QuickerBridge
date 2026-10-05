"use strict";
const QB_META=window.QB_META||{version:'0.4',date:'2026-09-15',author:'Anthony Chéruel'};
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const words = {
 en: {
  excelPreparing:"Preparing Excel export (first use downloads openpyxl)…",preloaded:"Pre-computed · calculation engine loading…",solvingAfterBoot:"Will calculate as soon as the engine has loaded…",retrying:"Download failed, retrying",attempt:"attempt",bootFailedTitle:"The calculation engine could not be downloaded.",bootFailedStage:"Blocked at:",bootAttempts:"attempts",bootStalled:"no response from the server (download stalled)",bootHint:"A company network or proxy may be blocking cdn.jsdelivr.net (Python runtime and libraries) or pypi.org (Excel only). Try again, use another network, or ask IT to allow these hosts. Already downloaded files stay in the browser cache.",bootRetry:"↻ Try again",excelUnavailable:"Excel export is unavailable: the openpyxl module could not be downloaded (pypi.org blocked?). The analysis itself works normally.",fixed:"Fixed (integral abutment)",spring:"Rotational spring k",springK:"k (kN·m/rad)",fixity:"Fixity",springHelp:"Rotational spring: vertical movement blocked, rotation resisted by k (kN·m/rad), e.g. an integral abutment on flexible piles. Fixity = k / (k + Σ3EI/L of the adjacent spans): 0 % pinned, 100 % fixed. Default k gives 50 %. Bracket k between realistic soil–pile bounds.",fixedHelp:"Fixed = rotation and vertical movement restrained (integral abutment, upper bound of fixity). A real integral abutment is partially restrained by its piles and backfill: compare with pinned supports to bracket the response. Axial restraint, earth pressure and thermal expansion of the deck are not modelled.",platesFrom:"Plates, E and M from",platesStart:"Start section",platesEnd:"End section",platesDeep:"Deeper section",platesHelp:"In a tapered zone only the overall depth varies. This option chooses which section supplies the flange and web plates, E and the inertia modifier M. Start (v0.4 default): swapping start/end sections on the other side of a pier does NOT mirror the haunch. Deeper: the pier (deep) section plates are used on both sides, so a haunch drawn S1→S2 and S2→S1 is a true mirror. End: the target section supplies the plates.",influence:"Influence lines",ilHint:"Click any diagram to move the station. Unit load of 1 kN, downward.",ilAt:"Influence lines at",ilGoverning:"Governing M max arrangement",ilSum:"axles Σ η·P",ilLaneNote:"lane load not included in Σ η·P",play:"▶ Animate",stop:"■ Stop",animating:"Crossing animation",upliftTitle:"Uplift:",upliftLive:"negative reaction under live load alone. Combine with factored dead load before concluding.",upliftBoth:"negative reaction under dead + live load: check bearing hold-down or anchorage.",upliftDead:"negative reaction under dead load.",upliftSnapshot:"negative reaction in this arrangement.",momentReaction:"Mr (kN·m, CCW +)",stiffnessJumpTitle:"Stiffness step:",stiffnessJumpHelp:"In a tapered zone only depth varies; plates, E and M come from the section chosen in “Plates, E and M from” (start section by default). Check that these steps are intended, e.g. a composite/cracked modifier change at a zone boundary.",zone:"zone",loadFactor:"Load factor",axleFactor:"Axle factor",maintenance:"Maintenance vehicle",maintenanceHelp:"Two axles: 24 and 56 kN at 2.0 m. Vehicle only; no companion lane load or dynamic allowance.",focus:"Focus diagrams",thermalTop:"Top",thermalBottom:"Bottom",canadianLaneFullHelp:"The companion UDL covers the spans (or influence-line parts) that increase the effect shown, or the whole bridge with “Whole bridge”. Axle labels include the lane reduction and axle factor, but never dynamic or overall live factors.",zoneMirrorHelp:"For a mirrored haunch, reverse the start and end sections on the matching span and set “Plates, E and M from” to Deeper section on both zones.",loadBodyCurrent:"CL-625 and CL-750-QC check every nonempty axle subset at its original spacing. CAN/CSA S6-25 clause 3.8.4.5.3 governs truck-only dynamic allowance. Their lane cases use reduced axles without DLA plus a companion UDL (S6 3.8.3.1.3: truck axles at 80 % on a 9 kN/m UDL), placed since v0.9.96 only where it increases the effect (S6 C3.8.4.1): loaded spans by default, influence-line parts or whole bridge as options. For the CL-750-QC the MTQ automatic fraction (Info-structures A2023-05) takes 63 % or 80 % of the axles response by response. HL-93 checks the complete truck or tandem with 33% DLA on axles only. Cooper uses the complete E-series train. The maintenance vehicle is 24 + 56 kN at 2.0 m with no lane load or DLA. The optional HL-93 supplementary case applies 90% to two trucks and the full-deck lane, with fixed 14 ft axle spacings and at least 50 ft clear headway. Only negative moments around interior piers and their vertical reactions are enveloped. Truck centres occupy adjacent spans; Standard/Fine controls the travel grid.",scopeBodyCurrent:"These are one-lane longitudinal effects. User load and axle factors are applied exactly as entered. No automatic ULS/SLS, RL lane modification, transverse distribution, deck-joint allowance, or buried-structure rules are added. Fixed (integral) abutments restrain rotation fully and report a moment reaction Mr (counter-clockwise +); real abutment fixity lies between pinned and fixed. Influence lines show the effect of a 1 kN downward load; the crossing animation replays 60 precomputed full-vehicle positions.",precisionHelpCurrent:"Standard: travel spacing no greater than 0.25 m. Fine: no greater than 0.10 m, with denser influence and deflection sampling.",
  inertiaModifier:"Inertia modifier M (×)",modifierHelp:"EI = E × I steel × M. M = 4 gives four times the stiffness. Area and centroid remain steel-only; no transformed composite section is calculated.",legacyTaper:"This older project interpolates plate dimensions. Open it with v0.3, then redefine its zones for depth-only tapers in v0.4.",
  sectionType:"Section definition",girder:"Steel I-girder dimensions",directEI:"Constant EI (kN·m²)",updated:"Updated 2026-09-12",disclaimer:"Use and liability: While I believe these tools to be free of error, I cannot be held liable for their results. They are provided for instruction only and must not be used to design a bridge.",openProject:"Open",saveProject:"Save",untitled:"Untitled project",modified:"Modified",saved:"Project saved",opened:"Project opened",projectInvalid:"This project file is invalid or incompatible.",projectLarge:"The project file exceeds 1 MiB.",unsavedTitle:"Unsaved changes",unsavedBody:"Save the current project before opening the selected file?",cancel:"Cancel",discard:"Discard",saveThenOpen:"Save then open",thermal:"Thermal",thermalLoads:"THERMAL GRADIENT",deltaT:"ΔT = Ttop − Tbottom (°C)",alpha:"Thermal expansion α (10⁻⁶/°C)",thermalDepth:"Thermal reference depth (mm)",thermalHelp:"A linear top-to-bottom gradient is applied alone as a free imposed curvature on every span. Positive ΔT means the top is warmer and bows the beam upward.",thermalOnly:"Thermal gradient only",thermalScope:"All spans · imposed thermal curvature",thermalCase:"Single thermal case",maxMoment:"Maximum moment",minMoment:"Minimum moment",curvature:"Imposed curvature",thermalNotes:"Thermal-gradient model",thermalBody:"The linear temperature difference produces a uniform free curvature κ = −αΔT/h in PyCBA. The sign maps positive top heating to upward bowing, shown as negative deflection. The thermal case is solved alone and is never superposed with dead or live load.",
  brandSub:"CONTINUOUS BEAM WORKSPACE",modes:"Vibration modes",local:"PyCBA",model:"Bridge model",reset:"Reset",geometry:"Geometry",sections:"Sections",loads:"Loads",oneLane:"One lane · longitudinal effects",elastic:"Linear elastic · EI model",dead:"Dead",live:"Live",both:"Dead + live",initializing:"Loading calculation engine (first launch may take a minute)…",beamLoads:"BEAM & LOADS",diagrams:"Diagrams",table:"Station table",method:"Analysis notes",envelope:"Envelope",snapshot:"Governing live load",frontAxle:"Front axle",reverse:"Reverse",range:"Min / max envelope",supportReactions:"SUPPORT REACTIONS · kN ↑+",signs:"Sagging M + · deflection downward +",warning:"Indicative preliminary values only — not a substitute for detailed design.",spanCount:"NUMBER OF SPANS",spanLengths:"SPAN LENGTHS",span:"Span",support:"Support",supports:"SUPPORTS",pin:"Pinned",roller:"Roller",supportHelp:"Pins and rollers restrain vertical movement. The beam remains continuous over interior supports.",sectionMode:"SECTION MODEL",nonprismatic:"Non-prismatic / variable section",sectionHelp:"Choose girder dimensions or a direct constant EI in kN·m². Gross steel I is calculated from the plates. The inertia modifier multiplies I for stiffness only. EI-only geometry is schematic.",addSection:"+ Add section",E:"Elastic modulus E (GPa)",depth:"Overall depth h (mm)",top_width:"Top flange width (mm)",top_thickness:"Top flange thickness (mm)",web_thickness:"Web thickness (mm)",bottom_width:"Bottom flange width (mm)",bottom_thickness:"Bottom flange thickness (mm)",section:"Section",zone:"Zone",zoneEnd:"Ends at (% of span)",profile:"Variation",constant:"Constant",linear:"Linear depth",parabolic:"Parabolic depth",startSection:"Start section (start depth)",endSection:"End section (target depth)",addZone:"+ Split last zone",zoneHelp:"Zones run consecutively from 0% to 100%. Start section: initial height. End section: target height. Plates, E and modifier come from the section chosen below (start by default) and change only at the next zone. Positive/negative section names are fixed geometric zones, not automatic stiffness changes with moment sign.",deadLoads:"PERMANENT LOADS",addDead:"+ Add uniform load",allSpans:"All spans",intensity:"Intensity w (kN/m)",applyTo:"Apply to",from:"From (%)",to:"To (%)",liveLoads:"LIVE LOAD MODEL",vehicle:"Design vehicle",hl93Truck:"AASHTO HL-93 truck",hl93Tandem:"AASHTO HL-93 tandem",cooper:"AREA / AREMA Cooper E",cooperE:"Cooper E number",custom:"Custom vehicle",case:"Load case",governing:"Governing: truck / lane",truck:"Vehicle only",lane:"Vehicle + companion UDL",fraction:"Truck fraction in Canadian lane case",laneIntensity:"Companion UDL (kN/m)",hl93Spacing:"HL-93 truck rear-axle spacing: 4.3–9.0 m; all permitted spacings are enveloped.",cooperHelp:"Two PyCBA locomotives (18 axles) plus the Cooper companion UDL. The E number scales every axle and UDL load.",fullLaneHelp:"The companion UDL covers the bridge deck, matching PyCBA’s run_load_model behavior. It is not dynamically amplified.",canadianLaneHelp:"The displayed axle loads are reduced only by the Canadian lane fraction; dynamic allowance is never displayed or applied to a lane case.",noDynamic:"No dynamic allowance",appliedFactor:"Applied axle factor",fractionHelp:"63%: single spans; positive moment and vertical shear of multi-span bridges; other cases per A2023-05. The selected fraction applies to this entire lane-case result.",dynamic:"Apply vehicle dynamic allowance",factorHelp:"CAN/CSA S6-25: 1 axle ×1.40; 2 axles or 1–2–3 ×1.30; other groups of 3+ ×1.25. HL-93: ×1.33 on truck/tandem axles only. Cooper has no dynamic allowance.",axle:"Axle",load:"Load (kN)",spacing:"Gap after (m)",axleCount:"Number of axles",direction:"Travel direction",bothDirections:"Both directions",forward:"Left → right",backward:"Right → left",resolution:"NUMERICAL PRECISION",standard:"Standard",fine:"Fine",precisionHelp:"Standard: 0.25 m travel step. Fine: 0.10 m, denser influence and deflection sampling.",solving:"Calculating envelopes…",ready:"Analysis updated",failed:"Please check your inputs",invalid:"Check positive dimensions, span lengths, axle spacings and complete section zones.",offline:"The browser solver could not start. Check your connection and reload to download the calculation runtime.",sagging:"Max sagging",hogging:"Max hogging",maxShear:"Max |shear|",maxDeflection:"Max |deflection|",shear:"Shear",moment:"Moment",deflection:"Deflection",at:"at",nominalTruck:"Nominal axle loads shown · dynamic allowance is never displayed",deadOnly:"Permanent loads only",subdivisions:"Intervals per span",subdivisionHelp:"Report stations are independent of the solver and travel resolution. Shared supports have two rows for left/right shear; reactions appear once in downloads.",station:"Station",side:"Side",left:"Left",right:"Right",xLocal:"Local x",up:"up",down:"down",restore:"Show envelope",critical:"Governing arrangement",axles:"Axles",dynamicFactor:"DLA factor",unloaded:"No live load",totalLength:"Total length",elapsed:"Solve",positions:"positions",groups:"axle groups",reactionHelp:"Min / max at each support; each extreme can come from a different arrangement.",methodTitle:"Analysis basis",methodBody:"PyCBA solves the 1-D Euler–Bernoulli beam by the direct stiffness method. Pins and rollers restrain vertical movement and permit rotation; internal supports preserve beam continuity. Axial and shear deformation are excluded.",sectionNotes:"Section properties",sectionBody:"A, centroid and I are calculated from top flange, web and bottom flange using the parallel-axis theorem. E is homogeneous within each section. Tapers vary overall depth only; flange dimensions, web thickness, E and inertia modifier remain those of the zone start section and change abruptly at zone boundaries. The end section supplies only the target depth. EI = E × gross I × modifier; the solver uses a positive piecewise-linear EI profile. Direct EI sections use the supplied constant stiffness (kN·m²), without inferred area or inertia. Parabolic haunches are tangent at their shallower end. Gross properties are used, with no automatic cracking, composite action or prestress. NEBT sections use the standard tabulated area, inertia and Yb with the entered concrete E and modifier. Self-weight: see below.",loadNotes:"Truck groups and lane cases",loadBody:"Canadian CL-625 and CL-750-QC check all nonempty axle subsets at their original spacings. CAN/CSA S6-25 clause 3.8.4.5.3 governs their dynamic allowance, including the special 1–2–3 group. Their lane cases use reduced axles plus a UDL placed where it increases the effect (loaded spans by default), with no dynamic allowance on either component. HL-93 checks the complete truck or tandem. Its truck rear spacing is enveloped from 4.3 to 9.0 m, its 33% allowance applies to the axles only, and its 9.3 kN/m companion UDL is unamplified. Cooper uses PyCBA’s complete E-series train with its companion UDL. Truck and lane cases are alternatives in this tool.",scopeBody:"These are one-lane longitudinal effects. No ULS/SLS load factors, RL lane modification, transverse distribution factors, deck-joint allowance, or buried-structure rules are applied. Custom vehicle factors use individual axle counts; special-truck axle-unit rules are not inferred.",precisionTitle:"Resolution and results",precisionBody:"Reaction influence functions and PyCBA deflections are interpolated within each span. Shear and moment are recovered by section equilibrium. Deflection integration is corrected to satisfy zero displacement at supports. Report subdivisions never set calculation accuracy. Fine mode refines truck travel, influence sampling, EI profiles and deflection integration. An envelope is a collection of separate extremes, not one simultaneous load case; click an extreme or diagram to inspect its compatible arrangement.",unitsTitle:"Units and signs",unitsBody:"Bridge coordinates: m. Section dimensions: mm. E: GPa. Loads: kN and kN/m. Moment: kN·m, sagging positive and drawn below the beam axis. Deflection: mm, downward positive. Support reactions: kN, upward positive. The two shear limits at an interior support are kept separately.",sourceTitle:"References",noResults:"Results will appear after a valid analysis.",remove:"Remove",name:"Name",deleteSectionHelp:"This section is in use. Reassign its spans and zones before removing it.",busyExport:"Results are being updated. Exports become available when the calculation finishes.",snapshotHelp:"The entered position displays nominal axle labels. The solver still applies the selected code factor; a Canadian lane case applies only its lane fraction.",originalDirection:"Front axle coordinate follows physical axle 1 in both directions.",methodScope:"Factors included",permanentName:"Permanent load",manualCaption:"Positioned full vehicle",spanSection:"Section per span",statusDetail:"Input changes update automatically",factorCount:"Axle count",showCase:"Inspect this load arrangement",reactionCase:"Inspect reaction",caseMethod:"Truck/lane extremes may govern at different positions."
 },
 fr: {
  excelPreparing:"Préparation de l’export Excel (le premier usage télécharge openpyxl)…",preloaded:"Précalculé · moteur de calcul en chargement…",solvingAfterBoot:"Calcul dès que le moteur sera chargé…",retrying:"Téléchargement échoué, nouvel essai",attempt:"essai",bootFailedTitle:"Le moteur de calcul n’a pas pu être téléchargé.",bootFailedStage:"Bloqué à l’étape :",bootAttempts:"essais",bootStalled:"aucune réponse du serveur (téléchargement figé)",bootHint:"Un réseau ou un proxy d’entreprise bloque peut-être cdn.jsdelivr.net (Python et bibliothèques) ou pypi.org (Excel seulement). Réessayez, changez de réseau ou demandez aux TI d’autoriser ces domaines. Les fichiers déjà téléchargés restent dans le cache du navigateur.",bootRetry:"↻ Réessayer",excelUnavailable:"L’export Excel est indisponible : le module openpyxl n’a pas pu être téléchargé (pypi.org bloqué?). Le calcul fonctionne normalement.",fixed:"Encastré (culée intégrale)",spring:"Ressort de rotation k",springK:"k (kN·m/rad)",fixity:"Fixité",springHelp:"Ressort de rotation : déplacement vertical bloqué, rotation retenue par k (kN·m/rad), p. ex. une culée intégrale sur pieux flexibles. Fixité = k / (k + Σ3EI/L des travées adjacentes) : 0 % articulé, 100 % encastré. Le k par défaut donne 50 %. Encadrez k entre des bornes réalistes sol–pieux.",fixedHelp:"Encastré = rotation et déplacement vertical bloqués (culée intégrale, borne supérieure de la fixité). Une vraie culée intégrale est partiellement retenue par ses pieux et le remblai : comparez avec des appuis articulés pour encadrer la réponse. La retenue axiale, la poussée des terres et la dilatation thermique du tablier ne sont pas modélisées.",platesFrom:"Tôles, E et M de",platesStart:"Section initiale",platesEnd:"Section finale",platesDeep:"Section la plus haute",platesHelp:"Dans une zone variable, seule la hauteur totale varie. Cette option choisit la section qui fournit les tôles (semelles, âme), E et le multiplicateur M. Initiale (défaut v0.4) : inverser les sections de l’autre côté d’une pile NE donne PAS un gousset miroir. La plus haute : les tôles de la section sur pile sont utilisées des deux côtés; un gousset S1→S2 puis S2→S1 est alors un vrai miroir. Finale : la section cible fournit les tôles.",influence:"Lignes d’influence",ilHint:"Cliquez un diagramme pour déplacer la station. Charge unitaire de 1 kN vers le bas.",ilAt:"Lignes d’influence à",ilGoverning:"Disposition gouvernante M max",ilSum:"essieux Σ η·P",ilLaneNote:"charge de voie non incluse dans Σ η·P",play:"▶ Animer",stop:"■ Arrêter",animating:"Animation du passage",upliftTitle:"Soulèvement :",upliftLive:"réaction négative sous charge vive seule. Combinez avec les permanentes pondérées avant de conclure.",upliftBoth:"réaction négative sous permanentes + vives : vérifier l’ancrage ou le dispositif anti-soulèvement.",upliftDead:"réaction négative sous charges permanentes.",upliftSnapshot:"réaction négative dans cette disposition.",momentReaction:"Mr (kN·m, anti-horaire +)",stiffnessJumpTitle:"Saut de rigidité :",stiffnessJumpHelp:"Dans une zone variable, seule la hauteur varie; les tôles, E et M viennent de la section choisie dans « Tôles, E et M de » (section initiale par défaut). Vérifiez que ces sauts sont voulus, p. ex. un changement de multiplicateur composite/fissuré à une limite de zone.",  loadFactor:"Facteur de charge",axleFactor:"Facteur d’essieu",maintenance:"Véhicule d’entretien",maintenanceHelp:"Deux essieux : 24 et 56 kN espacés de 2,0 m. Véhicule seulement; aucune charge de voie associée ni majoration dynamique.",focus:"Agrandir les diagrammes",thermalTop:"Dessus",thermalBottom:"Dessous",canadianLaneFullHelp:"La charge uniforme associée couvre les travées (ou parties de ligne d’influence) qui augmentent l’effet montré, ou tout le pont avec « Pont complet ». Les étiquettes d’essieux incluent la réduction de voie et le facteur d’essieu, mais jamais le CMD ni le facteur global de surcharge.",zoneMirrorHelp:"Pour un gousset miroir, inversez les sections initiale et finale de la travée correspondante et choisissez « Section la plus haute » dans « Tôles, E et M de » pour les deux zones.",loadBodyCurrent:"Les CL-625 et CL-750-QC vérifient chaque sous-ensemble non vide d’essieux avec ses espacements d’origine. L’article 3.8.4.5.3 de CAN/CSA S6-25 régit le CMD du cas camion seul. Leurs cas de voie utilisent les essieux réduits sans CMD et une charge uniforme (S6 3.8.3.1.3 : essieux à 80 % sur 9 kN/m), placée depuis la v0.9.96 seulement là où elle augmente l’effet (S6 C3.8.4.1) : travées chargées par défaut, parties de ligne d’influence ou pont complet en option. Pour le CL-750-QC, la fraction MTQ automatique (Info-structures A2023-05) retient 63 % ou 80 % des essieux selon l’effet. HL-93 vérifie le camion ou tandem complet avec 33 % de CMD sur les essieux seulement. Cooper utilise le train E complet. Le véhicule d’entretien vaut 24 + 56 kN à 2,0 m, sans charge de voie ni CMD. Le cas HL-93 supplémentaire combine 90 % de deux camions et de la voie sur tout le tablier, avec des espacements d’essieux de 14 pi et au moins 50 pi libres entre camions. Il concerne les moments négatifs autour des piles et leurs réactions verticales. Les centres des camions occupent deux travées adjacentes; Standard/Fin définit le pas de recherche.",scopeBodyCurrent:"Les résultats sont les effets longitudinaux d’une voie. Les facteurs de charge et d’essieu saisis sont appliqués tels quels. Aucun facteur ÉLUL/ÉLUT automatique, facteur RL, facteur de répartition transversale, CMD de joint ou règle d’ouvrage enfoui n’est ajouté. Les culées encastrées (intégrales) bloquent entièrement la rotation et donnent une réaction de moment Mr (anti-horaire +); la fixité réelle se situe entre articulé et encastré. Les lignes d’influence montrent l’effet d’une charge de 1 kN vers le bas; l’animation rejoue 60 positions précalculées du véhicule complet.",precisionHelpCurrent:"Standard : espacement de passage maximal de 0,25 m. Fin : maximal de 0,10 m, avec influences et flèches plus denses.",
  inertiaModifier:"Multiplicateur d’inertie M (×)",modifierHelp:"EI = E × I acier × M. M = 4 quadruple la rigidité. L’aire et le centre de gravité restent ceux de l’acier; aucune section composite transformée n’est calculée.",legacyTaper:"Cet ancien projet interpole les dimensions des tôles. Ouvrez-le avec v0.3, puis redéfinissez ses zones avec une variation de hauteur seulement dans v0.4.",
  sectionType:"Définition de la section",girder:"Dimensions de la poutre en I",directEI:"EI constant (kN·m²)",updated:"Mise à jour : 2026-09-12",disclaimer:"Utilisation et responsabilité : Bien que je considère ces outils comme exempts d’erreurs, je ne peux être tenu responsable de leurs résultats. Ils sont fournis à des fins pédagogiques seulement et ne doivent pas servir à concevoir un pont.",openProject:"Ouvrir",saveProject:"Enregistrer",untitled:"Sans titre",modified:"Modifié",saved:"Projet enregistré",opened:"Projet ouvert",projectInvalid:"Ce fichier de projet est invalide ou incompatible.",projectLarge:"Le fichier de projet dépasse 1 Mio.",unsavedTitle:"Modifications non enregistrées",unsavedBody:"Enregistrer le projet actuel avant d’ouvrir le fichier sélectionné?",cancel:"Annuler",discard:"Ignorer",saveThenOpen:"Enregistrer puis ouvrir",thermal:"Thermique",thermalLoads:"GRADIENT THERMIQUE",deltaT:"ΔT = Tdessus − Tdessous (°C)",alpha:"Dilatation thermique α (10⁻⁶/°C)",thermalDepth:"Hauteur thermique de référence (mm)",thermalHelp:"Un gradient linéaire entre le dessus et le dessous est appliqué seul comme courbure libre imposée à chaque travée. Un ΔT positif signifie que le dessus est plus chaud et courbe la poutre vers le haut.",thermalOnly:"Gradient thermique seulement",thermalScope:"Toutes les travées · courbure thermique imposée",thermalCase:"Cas thermique unique",maxMoment:"Moment maximal",minMoment:"Moment minimal",curvature:"Courbure imposée",thermalNotes:"Modèle du gradient thermique",thermalBody:"La différence de température linéaire produit une courbure libre uniforme κ = −αΔT/h dans PyCBA. Le signe associe un dessus plus chaud à une courbure vers le haut, affichée comme une flèche négative. Le cas thermique est résolu seul et n’est jamais superposé aux charges permanentes ou vives.",
  brandSub:"ANALYSE DE POUTRES CONTINUES",modes:"Modes propres",local:"PyCBA",model:"Modèle du pont",reset:"Réinitialiser",geometry:"Géométrie",sections:"Sections",loads:"Charges",oneLane:"Une voie · effets longitudinaux",elastic:"Élastique linéaire · modèle EI",dead:"Permanente",live:"Vive",both:"Permanente + vive",initializing:"Chargement du moteur (le premier lancement peut prendre une minute)…",beamLoads:"POUTRE ET CHARGES",diagrams:"Diagrammes",table:"Tableau des stations",method:"Notes de calcul",envelope:"Enveloppe",snapshot:"Surcharge gouvernante",frontAxle:"Essieu avant",reverse:"Inverser",range:"Enveloppe min / max",supportReactions:"RÉACTIONS D’APPUI · kN ↑+",signs:"M positif en travée · flèche positive vers le bas",warning:"Valeurs préliminaires indicatives seulement — ne remplacent pas une conception détaillée.",spanCount:"NOMBRE DE TRAVÉES",spanLengths:"LONGUEURS DES TRAVÉES",span:"Travée",support:"Appui",supports:"APPUIS",pin:"Articulé",roller:"À rouleaux",supportHelp:"Les appuis bloquent le déplacement vertical. La poutre reste continue au-dessus des appuis intermédiaires.",sectionMode:"MODÈLE DE SECTION",nonprismatic:"Non prismatique / section variable",sectionHelp:"Choisissez les dimensions de la poutre ou un EI constant en kN·m². I brut est calculé avec les tôles. Le multiplicateur d’inertie modifie uniquement la rigidité. La géométrie des sections EI est schématique.",addSection:"+ Ajouter une section",E:"Module d’élasticité E (GPa)",depth:"Hauteur totale h (mm)",top_width:"Largeur semelle sup. (mm)",top_thickness:"Épaisseur semelle sup. (mm)",web_thickness:"Épaisseur de l’âme (mm)",bottom_width:"Largeur semelle inf. (mm)",bottom_thickness:"Épaisseur semelle inf. (mm)",section:"Section",zone:"Zone",zoneEnd:"Fin (% de la travée)",profile:"Variation",constant:"Constante",linear:"Hauteur linéaire",parabolic:"Hauteur parabolique",startSection:"Section initiale (hauteur de départ)",endSection:"Section finale (hauteur cible)",addZone:"+ Diviser la dernière zone",zoneHelp:"Les zones se suivent de 0 % à 100 %. Section initiale : hauteur de départ. Section finale : hauteur cible. Les tôles, E et le multiplicateur viennent de la section choisie ci-dessous (initiale par défaut) et ne changent qu’à la zone suivante. Les sections de moment positif/négatif correspondent à des zones géométriques fixes, sans changement automatique selon le signe du moment.",deadLoads:"CHARGES PERMANENTES",addDead:"+ Ajouter une charge uniforme",allSpans:"Toutes les travées",intensity:"Intensité w (kN/m)",applyTo:"Appliquer à",from:"Début (%)",to:"Fin (%)",liveLoads:"SURCHARGE ROUTIÈRE",vehicle:"Véhicule de calcul",hl93Truck:"Camion HL-93 AASHTO",hl93Tandem:"Tandem HL-93 AASHTO",cooper:"Cooper E AREA / AREMA",cooperE:"Indice Cooper E",custom:"Véhicule personnalisé",case:"Cas de charge",governing:"Déterminant : camion / voie",truck:"Véhicule seulement",lane:"Véhicule + charge uniforme associée",fraction:"Fraction du camion dans le cas voie canadien",laneIntensity:"Charge uniforme associée (kN/m)",hl93Spacing:"Espacement arrière du camion HL-93 : 4,3 à 9,0 m; toutes les valeurs permises sont enveloppées.",cooperHelp:"Deux locomotives PyCBA (18 essieux) et la charge uniforme associée Cooper. L’indice E multiplie tous les essieux et la charge uniforme.",fullLaneHelp:"La charge uniforme associée couvre le tablier, conformément à run_load_model de PyCBA. Elle n’est jamais majorée dynamiquement.",canadianLaneHelp:"Les essieux affichés sont réduits seulement par la fraction de voie canadienne; aucun CMD n’est affiché ni appliqué à un cas voie.",noDynamic:"Aucune majoration dynamique",appliedFactor:"Facteur d’essieux appliqué",fractionHelp:"63 % : travée simple; moment positif et cisaillement vertical des ponts continus; autres cas selon A2023-05. La fraction sélectionnée s’applique à l’ensemble des résultats du cas de voie.",dynamic:"Appliquer la majoration dynamique du véhicule",factorHelp:"CAN/CSA S6-25 : 1 essieu ×1,40; 2 essieux ou 1–2–3 ×1,30; autres groupes de 3+ ×1,25. HL-93 : ×1,33 sur les essieux seulement. Cooper n’a pas de majoration dynamique.",axle:"Essieu",load:"Charge (kN)",spacing:"Espac. après (m)",axleCount:"Nombre d’essieux",direction:"Sens de circulation",bothDirections:"Les deux sens",forward:"Gauche → droite",backward:"Droite → gauche",resolution:"PRÉCISION NUMÉRIQUE",standard:"Standard",fine:"Fine",precisionHelp:"Standard : pas de 0,25 m. Fine : pas de 0,10 m et calculs d’influence et de flèche plus fins.",solving:"Calcul des enveloppes…",ready:"Analyse à jour",failed:"Veuillez vérifier les données",invalid:"Vérifiez les dimensions positives, les portées, les espacements d’essieux et la couverture des zones.",offline:"Le solveur du navigateur n’a pas démarré. Vérifiez votre connexion et rechargez pour télécharger le moteur de calcul.",sagging:"Moment positif max",hogging:"Moment négatif max",maxShear:"|Cisaillement| max",maxDeflection:"|Flèche| max",shear:"Cisaillement",moment:"Moment",deflection:"Flèche",at:"à",nominalTruck:"Charges nominales illustrées · aucune majoration dynamique affichée",deadOnly:"Charges permanentes seulement",subdivisions:"Intervalles par travée",subdivisionHelp:"Les stations du tableau sont indépendantes de la précision du calcul. Deux lignes aux appuis communs conservent les cisaillements gauche/droite; les réactions apparaissent une seule fois dans les fichiers.",station:"Station",side:"Côté",left:"Gauche",right:"Droite",xLocal:"x local",up:"haut",down:"bas",restore:"Afficher l’enveloppe",critical:"Disposition déterminante",axles:"Essieux",dynamicFactor:"Facteur CMD",unloaded:"Sans surcharge vive",totalLength:"Longueur totale",elapsed:"Calcul",positions:"positions",groups:"groupes d’essieux",reactionHelp:"Min / max à chaque appui; les extrêmes peuvent provenir de dispositions différentes.",methodTitle:"Base de l’analyse",methodBody:"PyCBA résout la poutre 1D d’Euler–Bernoulli par la méthode matricielle des déplacements. Les appuis articulés et à rouleaux bloquent le déplacement vertical et permettent la rotation; la continuité est conservée aux appuis intermédiaires. Les déformations axiales et de cisaillement sont exclues.",sectionNotes:"Propriétés des sections",sectionBody:"L’aire, le centre de gravité et I sont calculés à partir des deux semelles et de l’âme par le théorème des axes parallèles. E est homogène dans chaque section. Seule la hauteur totale varie. Les semelles, l’épaisseur de l’âme, E et le multiplicateur sont ceux de la section initiale de la zone et changent aux limites des zones. La section finale fournit seulement la hauteur cible. EI = E × I brut × multiplicateur; le solveur utilise ensuite un profil EI positif linéaire par morceaux. Les sections EI direct utilisent la rigidité constante saisie (kN·m²), sans aire ni inertie déduite. Les goussets paraboliques sont tangents à leur extrémité la moins haute. Les propriétés sont brutes, sans fissuration, action composite ni précontrainte automatiques. Les sections NEBT utilisent l’aire, l’inertie et Yb normalisés avec le E du béton et le multiplicateur saisis. Poids propre : voir ci-dessous.",loadNotes:"Groupes d’essieux et cas de voie",loadBody:"Les modèles canadiens CL-625 et CL-750-QC vérifient tous les sous-ensembles non vides d’essieux en conservant leurs espacements. L’article 3.8.4.5.3 de CAN/CSA S6-25 régit leur CMD, y compris le groupe particulier 1–2–3. Leurs cas de voie utilisent les essieux réduits et une charge uniforme placée là où elle augmente l’effet (travées chargées par défaut), sans CMD sur les deux composantes. HL-93 vérifie le camion ou le tandem complet. L’espacement arrière du camion est enveloppé de 4,3 à 9,0 m, son CMD de 33 % s’applique seulement aux essieux, et sa charge uniforme de 9,3 kN/m n’est pas majorée. Cooper utilise le train E complet de PyCBA avec sa charge uniforme associée. Les cas véhicule et voie sont des alternatives dans cet outil.",scopeBody:"Les résultats sont les effets longitudinaux d’une voie. Aucun facteur de charge ÉLUL/ÉLUT, facteur RL, facteur de répartition transversale, CMD de joint de tablier ou règle d’ouvrage enfoui n’est appliqué. Les facteurs des véhicules personnalisés comptent les essieux individuels; les groupes d’essieux de camions spéciaux ne sont pas déduits.",precisionTitle:"Précision et résultats",precisionBody:"Les fonctions d’influence des réactions et les flèches PyCBA sont interpolées dans chaque travée. V et M sont calculés par équilibre de section. L’intégration des flèches est corrigée pour respecter le déplacement nul aux appuis. La subdivision du tableau ne définit jamais la précision de calcul. Le mode fin raffine le passage, les influences, les profils EI et l’intégration. Une enveloppe regroupe des extrêmes distincts, et non un cas simultané; cliquez sur un extrême pour voir sa disposition compatible.",unitsTitle:"Unités et conventions",unitsBody:"Coordonnées du pont : m. Dimensions des sections : mm. E : GPa. Charges : kN et kN/m. Moment : kN·m, positif en travée et tracé sous l’axe. Flèche : mm, positive vers le bas. Réactions : kN, positives vers le haut. Les deux cisaillements aux appuis intermédiaires sont conservés.",sourceTitle:"Références",noResults:"Les résultats apparaîtront après une analyse valide.",remove:"Supprimer",name:"Nom",deleteSectionHelp:"Cette section est utilisée. Réaffectez ses travées et ses zones avant de la supprimer.",busyExport:"Les résultats sont en cours de mise à jour. Les exports seront disponibles à la fin du calcul.",snapshotHelp:"La position saisie affiche les charges nominales. Le solveur conserve le facteur de code choisi; un cas voie canadien applique seulement sa fraction de voie.",originalDirection:"La coordonnée de l’essieu avant suit l’essieu physique 1 dans les deux sens.",methodScope:"Facteurs inclus",permanentName:"Charge permanente",manualCaption:"Véhicule complet positionné",spanSection:"Section par travée",statusDetail:"Mise à jour automatique après modification",factorCount:"Nombre d’essieux",showCase:"Examiner cette disposition de charges",reactionCase:"Examiner la réaction",caseMethod:"Les extrêmes camion/voie peuvent survenir à des positions différentes."
 }
};
// French by default (v0.9.5: new key, older stored choices are dropped).
// v0.9.96: a saved choice first, else the browser languages (French by default).
function initialLanguage(){let saved=null;try{saved=localStorage.getItem("qb-language-v095");}catch(e){}if(saved==="en"||saved==="fr")return saved;const list=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||""]).map(l=>String(l).toLowerCase().slice(0,2));return list.find(l=>l==="fr"||l==="en")||"fr";}
let lang = initialLanguage();
let model, result, jobId, defaultModel, snap = null, inputPanel = "geometry", view = "diagrams", display = "envelope", manualDirection = "forward", revision = 0, timer, positionTimer, snapRevision = 0;
let influenceData=null,traverseData=null,playTimer=null,frameIndex=0;
let projectName="", savedModel="", savedProjectName="", pendingProject=null;

Object.assign(words.fr,{twoTruckOption:'HL-93 · 90 % de deux camions (M− / R piles)',twoTruckCase:'Deux camions + voie · 90 %',delta:'Afficher Δ (max − min)',fixedHelp:'Rotation bloquée; aucun effet axial.',springHelp:'Rotation retenue par k. Fixité : 0 % articulé, 100 % encastré.',platesHelp:'Seule la hauteur varie. La section choisie fournit les tôles, E et M.',stiffnessJumpHelp:'Vérifiez les tôles, E et M aux limites de zone.',zoneHelp:'Limites en % de la travée; seule la hauteur varie.',disclaimer:''});
Object.assign(words.en,{twoTruckOption:'HL-93 · 90% of two trucks (M− / pier R)',twoTruckCase:'Two trucks + lane · 90%',delta:'Show Δ (max − min)',fixedHelp:'Rotation restrained; no axial effects.',springHelp:'Rotation resisted by k. Fixity: 0% pinned, 100% fixed.',platesHelp:'Only depth varies. The selected section supplies plates, E and M.',stiffnessJumpHelp:'Check plates, E and M at zone boundaries.',zoneHelp:'Limits in % of span; only depth varies.',disclaimer:''});
// v0.8.6: Δ view, NEBT girders, girder self-weight, isostatic spans.
Object.assign(words.fr,{deltaMode:'Écarts Δ (max − min)',deltaLegend:'Écart Δ = max − min de l’enveloppe',nebt:'Poutre précontrainte NEBT',nebtType:'Type de poutre NEBT',nebtHelp:'Propriétés normalisées des poutres NEBT (aire, I, Yb, poids linéique). Ajustez E du béton (28 GPa par défaut). Hauteur constante : pas de variation dans une zone.',selfWeight:'POIDS PROPRE DES POUTRES',selfWeightApply:'Appliquer le poids propre de la poutre',steelIncrease:'Majoration acier (%)',nebtIncrease:'Majoration NEBT (%)',selfWeightHelp:'Acier : aire × 77 kN/m³; NEBT : poids linéique normalisé. La majoration couvre raidisseurs, diaphragmes et assemblages. Le facteur de charge s’applique au poids majoré. Les sections EI direct n’ont pas de poids propre.',selfWeightNone:'Aucune section acier ou NEBT : aucun poids propre calculé.',selfWeightShort:'Poids propre',steelShort:'acier',simpleSpan:'Isostatique',simpleHelp:'Travée isostatique : rotules aux deux extrémités, sans continuité avec les travées voisines. Un appui encastré ou à ressort n’agit pas sur cette travée.',selfWeightNotes:'Poids propre et travées isostatiques',selfWeightBody:'Le poids propre des poutres est ajouté par défaut aux charges permanentes : aire acier × 77 kN/m³ (majoré de 15 % par défaut) ou poids linéique normalisé NEBT (majoré de 10 % par défaut). Dans une zone d’acier à hauteur variable, le poids suit la hauteur de l’âme. Le poids majoré, sans facteur de charge, sert aussi de masse aux modes propres. Une travée isostatique est modélisée par des relâchements de moment à ses deux extrémités (éléments rotulés PyCBA); M y est nul aux appuis et la travée ne reçoit aucun effet des travées voisines.',selfWeightIncluded:'poids propre inclus'});
Object.assign(words.en,{deltaMode:'Δ ranges (max − min)',deltaLegend:'Range Δ = envelope max − min',nebt:'Prestressed NEBT girder',nebtType:'NEBT girder type',nebtHelp:'Standard NEBT girder properties (area, I, Yb, linear weight). Adjust the concrete E (28 GPa by default). Constant depth: no variation within a zone.',selfWeight:'GIRDER SELF-WEIGHT',selfWeightApply:'Apply girder self-weight',steelIncrease:'Steel allowance (%)',nebtIncrease:'NEBT allowance (%)',selfWeightHelp:'Steel: area × 77 kN/m³; NEBT: standard linear weight. The allowance covers stiffeners, diaphragms and connections. The load factor applies to the increased weight. Direct-EI sections carry no self-weight.',selfWeightNone:'No steel or NEBT section: no self-weight computed.',selfWeightShort:'Self-weight',steelShort:'steel',simpleSpan:'Simple span',simpleHelp:'Simple (isostatic) span: hinges at both ends, no continuity with the neighbouring spans. A fixed or spring support does not act on this span.',selfWeightNotes:'Self-weight and simple spans',selfWeightBody:'The girder self-weight is added to the permanent loads by default: steel area × 77 kN/m³ (15% allowance by default) or the standard NEBT linear weight (10% allowance by default). In a tapered steel zone the weight follows the web height. The increased weight, without load factor, is also the vibration mass. A simple span is modelled with moment releases at both ends (PyCBA hinged members); M is zero at its supports and it receives no effect from the neighbouring spans.',selfWeightIncluded:'self-weight included'});
const NEBT_DATA={NEBT1000:{A:481787,I:62119,yb:483.4,h:1000,w:11.80},NEBT1200:{A:517773,I:99187,yb:574.8,h:1200,w:12.69},NEBT1400:{A:553643,I:146547,yb:667.4,h:1400,w:13.56},NEBT1600:{A:589884,I:204920,yb:761.2,h:1600,w:14.45},NEBT1800:{A:625457,I:275049,yb:854.9,h:1800,w:15.32}};
const STEEL_UNIT_WEIGHT=77;
let deltaMode=false;
const t = key => words[lang][key] || key;
const esc = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = (value, digits=2) => {const n=Math.abs(Number(value))<.5*10**-digits?0:Number(value);return n.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA",{minimumFractionDigits:digits,maximumFractionDigits:digits}).replace(/^-/,'−')};
// v0.9.8: numeric inputs in the QuickerUnits style. Every <input type=number>
// becomes a text box: localized display (FR "1 234,5"), a typed calculation
// ("2*17,4", "(3+4)/2", "1,2e3") is evaluated, highlighted while edited.
function qbParse(raw){
 let s=String(raw??'').trim();if(!s)return null;
 s=s.replace(/[\s  ']/g,'').replace(/[−–]/g,'-').replace(/[×x·]/gi,'*').replace(/÷/g,'/').replace(/\*\*/g,'^');
 // Comma: decimal separator in French, thousands separator in English.
 s=lang==='fr'?s.replace(/,/g,'.'):s.replace(/,/g,'');
 let i=0;const peek=()=>s[i];
 const num=()=>{const m=/^(\d+\.?\d*|\.\d+)(e[-+]?\d+)?/i.exec(s.slice(i));if(!m)throw 0;i+=m[0].length;return parseFloat(m[0]);};
 const primary=()=>{if(peek()==='('){i++;const v=expr();if(peek()!==')')throw 0;i++;return v;}if(/^pi/i.test(s.slice(i))){i+=2;return Math.PI;}if(peek()==='π'){i++;return Math.PI;}return num();};
 const unary=()=>peek()==='-'?(i++,-unary()):peek()==='+'?(i++,unary()):power();
 const power=()=>{const b=primary();if(peek()==='^'){i++;return Math.pow(b,unary());}return b;};
 const term=()=>{let v=unary();while(peek()==='*'||peek()==='/'){const op=s[i++],r=unary();v=op==='*'?v*r:v/r;}return v;};
 const expr=()=>{let v=term();while(peek()==='+'||peek()==='-'){const op=s[i++],r=term();v=op==='+'?v+r:v-r;}return v;};
 try{const v=expr();return i===s.length&&Number.isFinite(v)?v:NaN;}catch{return NaN;}
}
const qbIsExpression=raw=>/[0-9.,)]\s*[+\-*/×÷^(]|^\(|π|pi/i.test(String(raw).replace(/[eE][-+]/g,''));
function qbFmtInput(v){
 if(v===null||v===undefined||v===''||!Number.isFinite(Number(v)))return '';
 const n=Number(v),a=Math.abs(n);if(a&&(a>=1e15||a<1e-6))return n.toExponential().replace('.',lang==='fr'?',':'.');
 return n.toLocaleString(lang==='fr'?'fr-CA':'en-CA',{maximumFractionDigits:10,useGrouping:a>=1e4});
}
const isNumInput=el=>!!el&&(el.type==='number'||el.classList?.contains('qb-num'));
function numValue(el){if(el.type==='number')return el.value===''?NaN:Number(el.value);const v=qbParse(el.value);return v===null?NaN:v;}
function qbCheck(el){
 const v=qbParse(el.value),min=el.dataset.min===''||el.dataset.min===undefined?-Infinity:Number(el.dataset.min),max=el.dataset.max===''||el.dataset.max===undefined?Infinity:Number(el.dataset.max);
 // A disabled field is barred from validation: never paint it as an error.
 const bad=!el.disabled&&(v===null||Number.isNaN(v)||v<min||v>max);
 el.setCustomValidity(bad?(v===null||Number.isNaN(v)?t('numInvalid'):`${t('numRange')} ${qbFmtInput(min===-Infinity?null:min)||'−∞'} … ${qbFmtInput(max===Infinity?null:max)||'∞'}`):'');
 el.title=bad?el.validationMessage:'';el.classList.toggle('num-err',bad);el.setAttribute('aria-invalid',String(bad));if(typeof qbTip==='function')qbTip(el);return bad?NaN:v;
}
function qbEnhance(root=document){
 root.querySelectorAll?.('input[type="number"]:not(#position)').forEach(el=>{
  const v=el.value;el.dataset.min=el.getAttribute('min')??'';el.dataset.max=el.getAttribute('max')??'';
  el.type='text';el.inputMode='decimal';el.autocomplete='off';el.spellcheck=false;el.classList.add('qb-num');
  el.value=v===''?'':qbFmtInput(Number(v));qbCheck(el);
 });
}
new MutationObserver(list=>{for(const m of list)for(const n of m.addedNodes)if(n.nodeType===1){if(n.matches?.('input[type="number"]'))qbEnhance(n.parentNode||document);else qbEnhance(n);}}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('input',e=>{if(e.target.classList?.contains('qb-num'))qbCheck(e.target);},true);
document.addEventListener('focusin',e=>{if(e.target.classList?.contains('qb-num'))setTimeout(()=>e.target.select?.(),0);});
document.addEventListener('focusout',e=>{
 const el=e.target;if(!el.classList?.contains('qb-num'))return;const v=qbCheck(el);if(Number.isNaN(v))return;
 const raw=el.value.trim(),shown=qbFmtInput(v);
 if(raw!==shown){el.value=shown;if(qbIsExpression(raw)){el.classList.remove('num-flash');void el.offsetWidth;el.classList.add('num-flash');el.title=`${raw} = ${shown}`;}}
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.classList?.contains('qb-num')){e.target.blur();}});
const clone = value => JSON.parse(JSON.stringify(value));
const modelText = () => JSON.stringify(model);
function updateProjectState() {
 const invalid=$$('input[data-path].qb-num,input[data-path][type="number"]').some(el=>!el.validity.valid||el.value==='');
 const dirty=!!model&&(modelText()!==savedModel||projectName!==savedProjectName||invalid);
 if(document.activeElement!==$('#project-name'))$('#project-name').value=projectName||t('untitled');
 $('#dirty-state').textContent=dirty?`• ${t('modified')}`:'';
 document.title=`${dirty?'• ':''}${projectName||t('untitled')} · QuickerBridge`;
 updateStructureName();
 return dirty;
}
function safeFilename(name){return (name||'QuickerBridge').normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'QuickerBridge'}
function saveProject() {
 if($$('input[data-path].qb-num,input[data-path][type="number"]').some(el=>!el.validity.valid||el.value==='')){invalidate(t('invalid'));return false}
 const envelope={format:'QuickerBridgeProject',schema_version:QB_META.schema||9,app_version:QB_META.version,name:projectName||t('untitled'),saved_at:new Date().toISOString(),model:clone(model)};
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
function visualAxleFactor(record=snap?.record) {const lane=record?record.case==='lane':model.live.case==='lane',reduction=lane&&canadianLaneVehicle()?(record?.fraction??(model.live.vehicle==='CL625'?.8:model.live.lane_fraction)):1;return (model.live.axle_factor??1)*reduction;}
function positionBounds() {
 const total=model.spans.reduce((v,s)=>v+s.length,0),{spaces}=vehiclePattern(),wheelbase=spaces.reduce((v,s)=>v+s,0);
 return manualDirection==='forward'?{min:0,max:total+wheelbase}:{min:-wheelbase,max:total};
}
function syncPositionControls(value) {
 const number=$('#position'),slider=$('#position-slider');if(!number||!slider||!model)return;
 const bounds=positionBounds(),candidate=Number(value??number.value),position=Math.min(bounds.max,Math.max(bounds.min,Number.isFinite(candidate)?candidate:bounds.min));
 const shown=Number(position.toFixed(1));[number,slider].forEach(el=>{el.min=bounds.min;el.max=bounds.max;el.step=.1;el.value=shown;});slider.setAttribute('aria-label',t('frontAxle'));
}
function queuePositionSnapshot(position) {clearTimeout(positionTimer);positionTimer=setTimeout(()=>inspectCase(0,'max',position),120);}
function sectionProps(s) {
 if(s.kind==='ei')return {A:null,I:(s.stiffness_input||'EI')==='EI'?null:s.I_direct,EI:sectionEI(s),w:null};
 if(s.kind==='nebt'){const d=NEBT_DATA[s.nebt]||NEBT_DATA.NEBT1400,I=d.I/1e6;return {A:d.A/1e6,I,EI:I*sectionE(s)*1e6*sectionM(s),w:d.w*(s.unit_weight??24.5)/24.5};}
 const hw=s.depth-s.top_thickness-s.bottom_thickness;
 const a=[s.bottom_width*s.bottom_thickness,s.web_thickness*hw,s.top_width*s.top_thickness];
 const y=[s.bottom_thickness/2,s.bottom_thickness+hw/2,s.depth-s.top_thickness/2];
 const A=a.reduce((v,w)=>v+w,0), c=a.reduce((v,w,i)=>v+w*y[i],0)/A;
 const I=(s.bottom_width*s.bottom_thickness**3+s.web_thickness*hw**3+s.top_width*s.top_thickness**3)/12+a.reduce((v,w,i)=>v+w*(y[i]-c)**2,0);
 return {A:A/1e6,I:I/1e12,EI:I*s.E/1e6*sectionM(s),w:A/1e6*STEEL_UNIT_WEIGHT};
}
function sectionPropsHtml(s){
 const p=sectionProps(s);
 return s.kind==='ei'?`${p.I?`<span>E ${fmt(sectionE(s)*1000,0)} MPa</span><span>I ${fmt(p.I,5)} m⁴</span>`:''}<span>EI ${fmt(p.EI,0)} kN·m²</span>`:s.kind==='nebt'?`<span>E ${fmt(sectionE(s)*1000,0)} MPa</span><span>A ${fmt(p.A,4)} m²</span><span>I ${fmt(p.I,5)} m⁴</span><span>EI ${fmt(p.EI,0)} kN·m²</span><span>${t('selfWeightShort')} ${fmt(p.w,2)} kN/m</span>`:`<span>A ${fmt(p.A,4)} m²</span><span>I ${fmt(p.I,5)} m⁴</span><span>EI ${fmt(p.EI,0)} kN·m²</span><span>${t('selfWeightShort')} ${fmt(p.w,2)} kN/m</span>`;
}
function sectionDepth(s){return s.kind==='ei'?1800:s.kind==='nebt'?(NEBT_DATA[s.nebt]||NEBT_DATA.NEBT1400).h:s.depth;}
// Self-weight intervals per span, mirroring quickerbridge.sections/loads (for display).
function selfWeightIntervals(){
 const sw=model.self_weight;if(!sw||!sw.apply)return [];
 const out=[];let start=0;
 const weight=s=>{const w=sectionProps(s).w;return w?w*(1+(s.kind==='nebt'?sw.nebt_increase:sw.steel_increase)/100):0;};
 model.spans.forEach((span,i)=>{
  const L=span.length;
  if(!model.nonprismatic||!span.zones.length)out.push({span:i,start,end:start+L,w:weight(model.sections[span.section]||model.sections[0])});
  else{let previous=0;span.zones.forEach(z=>{const a=model.sections[z.section]||model.sections[0],b=model.sections[z.end_section??z.section]||a,src=z.plates==='end'?b:z.plates==='deep'&&b.depth>a.depth?b:a;
   if(z.profile==='constant'||a===b)out.push({span:i,start:start+previous*L,end:start+z.end*L,w:weight(a)});
   else for(let k=0;k<6;k++){const u=(k+.5)/6,f=z.profile==='parabolic'?(a.depth>b.depth?1-(1-u)**2:u*u):u;out.push({span:i,start:start+L*(previous+(z.end-previous)*k/6),end:start+L*(previous+(z.end-previous)*(k+1)/6),w:weight({...src,depth:a.depth*(1-f)+b.depth*f})});}
   previous=z.end;});}
  start+=L;
 });
 return out.filter(v=>v.w>0);
}
function nebtSvg(s){
 const d=NEBT_DATA[s.nebt]||NEBT_DATA.NEBT1400,h=d.h,scale=Math.min(100/1800,190/1200),top=12,x=v=>125+v*scale,y=v=>top+v*scale;
 // Right half (mm): top flange 1200 × 85, 50 mm taper to the 180 web, 220 mm bulb taper, 810 × 100 bottom flange.
 const right=[[600,0],[600,85],[90,135],[90,h-320],[405,h-100],[405,h]];
 const pts=[...right,...right.slice().reverse().map(([u,v])=>[-u,v])].map(([u,v])=>`${x(u).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
 return `<svg class="section-svg" viewBox="0 0 250 125" role="img" aria-label="${esc(s.name)} · ${s.nebt}"><line x1="125" y1="3" x2="125" y2="120" stroke="#a4c5c9" stroke-dasharray="3 3"/><polygon points="${pts}" fill="#e6e1d6" stroke="#8a7a5c" stroke-width="1.5"/><text x="${x(620)}" y="${y(h/2)}" font-size="12" fill="#56798b">${s.nebt.replace('NEBT','NEBT ')}</text></svg>`;
}
function sectionSvg(s) {
 if(s.kind==='ei')return `<div class="section-svg ei-symbol">EI <small>kN·m²</small></div>`;
 if(s.kind==='nebt')return nebtSvg(s);
 const scale=Math.min(95/s.depth,190/Math.max(s.top_width,s.bottom_width));
 const h=s.depth*scale,bt=s.top_width*scale,bb=s.bottom_width*scale,tt=Math.max(3,s.top_thickness*scale),tb=Math.max(3,s.bottom_thickness*scale),tw=Math.max(2,s.web_thickness*scale),top=12;
 return `<svg class="section-svg" viewBox="0 0 250 125" role="img" aria-label="${esc(s.name)}"><line x1="125" y1="3" x2="125" y2="120" stroke="#a4c5c9" stroke-dasharray="3 3"/><path d="M${125-bt/2} ${top}h${bt}v${tt}H${125+tw/2}v${h-tt-tb}H${125+bb/2}v${tb}H${125-bb/2}v-${tb}H${125-tw/2}V${top+tt}H${125-bt/2}Z" fill="#ceeae2" stroke="#007f78" stroke-width="1.5"/><path d="M${130+Math.max(bt,bb)/2} ${top}h9m-4 0v${h}m-5 0h9" fill="none" stroke="#748f9e"/><text x="${145+Math.max(bt,bb)/2}" y="${top+h/2}" font-size="12" fill="#56798b">h</text></svg>`;
}
// v0.9.2: collapsible input subsections; their open/closed state survives re-renders.
Object.assign(words.fr,{offShort:'non appliqué',variableShort:'variable',prismaticShort:'prismatique'});
Object.assign(words.en,{offShort:'not applied',variableShort:'variable',prismaticShort:'prismatic'});
const groupOpen={};
function inputGroup(key,title,body,defaultOpen=true,meta=''){
 const open=groupOpen[key]??defaultOpen;
 return `<details class="input-group" data-group="${key}" ${open?'open':''}><summary><span class="group-title">${title}</span>${meta?`<span class="group-meta">${meta}</span>`:''}</summary><div class="group-body">${body}</div></details>`;
}
document.addEventListener('toggle',e=>{if(e.target.matches?.('details.input-group'))groupOpen[e.target.dataset.group]=e.target.open;},true);
// Default non-prismatic layout: parabolic haunches to the deeper section over
// 20 % of each span next to an interior support only (mirrors models.apply_default_haunches).
function defaultHaunches(n,deep=1,len=.2){return Array.from({length:n},(_,i)=>{const z=[];if(i>0)z.push({end:len,section:deep,end_section:0,profile:'parabolic',plates:'deep'});if(i<n-1){z.push({end:1-len,section:0,end_section:null,profile:'constant',plates:'start'});z.push({end:1,section:0,end_section:deep,profile:'parabolic',plates:'deep'});}else z.push({end:1,section:0,end_section:null,profile:'constant',plates:'start'});return z;});}
function zoneSignature(spans){return JSON.stringify(spans.map(s=>s.zones.map(z=>[z.end,z.section,z.end_section??z.section,z.profile,z.plates||'start'])));}
function isDefaultHaunches(n){return zoneSignature(model.spans)===zoneSignature(defaultHaunches(n).map(zones=>({zones})));}
function renderInputs() {
 if (!model) return;
 let html="";
 if(inputPanel==="geometry") {
  html+=inputGroup('geo-count',t('spanCount'),`<div class="span-count">${[1,2,3,4,5,6,7].map(n=>`<button data-spans="${n}" class="${model.spans.length===n?'active':''}" aria-pressed="${model.spans.length===n}">${n}</button>`).join('')}</div>`,true,`${model.spans.length}`);
  let lengths=model.spans.map((s,i)=>`<div class="span-row"><label class="span-tag" for="span-${i}">${t('span')} ${i+1}</label><input id="span-${i}" data-path="spans.${i}.length" type="number" min="0.5" max="200" step="any" value="${s.length}"><span class="unit">m</span><label class="simple-toggle" title="${esc(t('simpleHelp'))}"><input type="checkbox" data-path="spans.${i}.simple" ${s.simple?'checked':''}>${t('simpleSpan')}</label></div>`).join('');
  if(model.spans.some(s=>s.simple))lengths+=`<p class="note fixed-note">${t('simpleHelp')}</p>`;
  lengths+=`<div class="note">${t('totalLength')}: <b id="total-length">${fmt(model.spans.reduce((v,s)=>v+s.length,0))} m</b></div>`;
  html+=inputGroup('geo-lengths',t('spanLengths'),lengths,true,`${fmt(model.spans.reduce((v,s)=>v+s.length,0),1)} m`);
  let supports=model.supports.map((s,i)=>`<div class="support-row"><label for="support-${i}">${t('support')} ${i+1}</label><select id="support-${i}" data-path="supports.${i}"><option value="pin" ${s==='pin'?'selected':''}>${t('pin')}</option><option value="roller" ${s==='roller'?'selected':''}>${t('roller')}</option><option value="fixed" ${s==='fixed'?'selected':''}>${t('fixed')}</option><option value="spring" ${s==='spring'?'selected':''}>${t('spring')}</option>${i>0&&i<model.spans.length?`<option value="split" ${s==='split'?'selected':''}>${t('splitSupport')}</option>`:''}</select></div>${s==='spring'?`<div class="spring-row"><label class="field"><span>${t('springK')}</span><input type="number" step="any" min="1" max="10000000000000" data-path="support_springs.${i}" value="${+(model.support_springs?.[i]||0).toPrecision(12)}"></label><span class="fixity" id="fixity-${i}">${springFixityText(i)}</span></div>`:''}`).join('');
  supports+=`${model.supports.includes('fixed')?`<p class="note fixed-note">${t('fixedHelp')}</p>`:''}${model.supports.includes('spring')?`<p class="note fixed-note">${t('springHelp')}</p>`:''}${model.supports.includes('split')?`<p class="note fixed-note">${t('splitHelp')}</p>`:''}`;
  html+=inputGroup('geo-supports',t('supports'),supports,true);
  html+=inputGroup('geo-precision',t('resolution'),select('resolution','precision',model.precision,[['standard',t('standard')],['fine',t('fine')]])+`<p class="help">${t('precisionHelp')}</p>`,false,t(model.precision));
 } else if(inputPanel==="sections") {
  const hasNebt=model.sections.some(s=>s.kind==='nebt');
  let cards=`<label class="toggle-row${hasNebt?' disabled':''}" title="${hasNebt?t('nebtNoTaper'):''}"><input type="checkbox" data-path="nonprismatic" ${model.nonprismatic?'checked':''} ${hasNebt?'disabled':''}>${t('nonprismatic')}</label>${hasNebt?`<p class="help">${t('nebtNoTaper')}</p>`:''}`;
  cards+=model.sections.map((s,i)=>sectionCard(s,i)).join('');
  cards+=`<button class="add-button" id="add-section">${t('addSection')}</button>`;
  html+=inputGroup('sec-model',t('sectionMode'),cards,true,`${model.sections.length} · ${model.nonprismatic?t('variableShort'):t('prismaticShort')}`);
  let spans=model.spans.map((s,i)=>`<section class="section-card"><b>${t('span')} ${i+1} · ${fmt(s.length)} m</b>${model.nonprismatic?`<div>${s.zones.map((z,j)=>`<div class="zone"><div class="zone-heading">${t('zone')} ${j+1}<button class="icon-button" data-remove-zone="${i},${j}" ${s.zones.length===1?'disabled':''} title="${t('remove')}" aria-label="${t('remove')} · ${t('span')} ${i+1} · zone ${j+1}">×</button></div>${field('zoneEnd',`spans.${i}.zones.${j}.end`,z.end,'',{scale:.01,min:.1,max:100})}${select('profile',`spans.${i}.zones.${j}.profile`,z.profile,['ei','nebt'].includes(model.sections[z.section].kind)?[['constant',t('constant')]]:[['constant',t('constant')],['linear',t('linear')],['parabolic',t('parabolic')]])}${select('startSection',`spans.${i}.zones.${j}.section`,z.section,sectionOptions())}${z.profile!=='constant'?select('endSection',`spans.${i}.zones.${j}.end_section`,z.end_section??z.section,sectionOptions())+select('platesFrom',`spans.${i}.zones.${j}.plates`,z.plates||'start',[['start',t('platesStart')],['end',t('platesEnd')],['deep',t('platesDeep')]]):''}</div>`).join('')}</div><button class="add-button" data-add-zone="${i}" ${s.zones.length>=12?'disabled':''}>${t('addZone')}</button>`:select('section',`spans.${i}.section`,s.section,sectionOptions())}</section>`).join('');
  if(model.nonprismatic)spans+=`<p class="help">${t('zoneHelp')}</p><p class="note">${t('platesHelp')}</p>`;
  html+=inputGroup('sec-spans',t('spanSection'),spans,true);
 } else if(model.load_mode==='thermal') {
  html+=imposedInputs();
 } else {
  // v0.9.2: girder self-weight first, every subsection collapsed by default.
  const sw=model.self_weight,swList=selfWeightIntervals(),swMax=swList.length?Math.max(...swList.map(v=>v.w)):0;
  html+=inputGroup('loads-self',t('selfWeight'),selfWeightCard(),false,sw.apply?(swMax?`${fmt(swMax,2)} kN/m`:'—'):t('offShort'));
  let dead=model.dead.map((load,i)=>`<div class="load-card"><div class="card-head"><input aria-label="${t('name')}" data-path="dead.${i}.name" maxlength="80" value="${esc(load.name)}"><button data-remove-dead="${i}" class="icon-button" title="${t('remove')}" aria-label="${t('remove')} · ${esc(load.name||'')}">×</button></div><div class="field-row">${field('intensity',`dead.${i}.w`,load.w)}${field('loadFactor',`dead.${i}.factor`,load.factor??1)}</div>${select('applyTo',`dead.${i}.span`,load.span,[[-1,t('allSpans')],...model.spans.map((s,j)=>[j,`${t('span')} ${j+1}`])])}<div class="field-row">${field('from',`dead.${i}.start`,load.start,'',{scale:.01,min:0,max:99.9})}${field('to',`dead.${i}.end`,load.end,'',{scale:.01,min:.1,max:100})}</div>${select('deadStage',`dead.${i}.stage`,load.stage||'3n',[['steel',t('deadStageSteel')],['3n',t('deadStage3n')]])}</div>`).join('');
  dead+=`<button class="add-button" id="add-dead">${t('addDead')}</button>`;
  const slabSec=model.sections.find(s=>['girder','nebt'].includes(s.kind)&&s.composite&&s.composite.enabled);
  dead+=slabSec?`<button class="add-button" id="add-slab-weight">${t('addSlabWeight')}</button>`:`<p class="help">${t('slabWeightHint')}</p>`;
  dead+=`<p class="help">${t('deadStageHelp')}</p>`;
  {const d=model.distribution,ext=d.enabled&&d.apply&&d.girder==='exterior';dead+=`<div class="fs-dead-card${ext?' on':''}"><label class="toggle-row"><input type="checkbox" data-path="distribution.fs_dead" ${d.fs_dead!==false?'checked':''}>${t('fsDead')}</label><p class="help">${t(ext?'fsDeadOn':'fsDeadOff')}</p></div>`;}
  html+=inputGroup('loads-dead',t('deadLoads'),dead,false,`${model.dead.length} × · Σ ${fmt(model.dead.reduce((v,d)=>v+d.w*(d.factor??1),0),1)} kN/m`);
  let live=select('vehicle','live.vehicle',model.live.vehicle,[['CL625','CL-625'],['CL750QC','CL-750-QC'],['HL93Truck',t('hl93Truck')],['HL93Tandem',t('hl93Tandem')],['Cooper',t('cooper')],['Maintenance',t('maintenance')],['custom',t('custom')]]);
  const pattern=vehiclePattern(),weights=pattern.weights,gaps=pattern.spaces,hasLane=model.live.vehicle!=='Maintenance';
  const ftApplied=typeof axleApplied==='function'&&axleApplied();
  live+=`<div class="field-row">${field('loadFactor','live.factor',model.live.factor??1)}${ftApplied?field('axleFactor','live.axle_factor',model.live.axle_factor??1).replace('<input ','<input disabled title="'+esc(t('axleReplaces'))+'" '):field('axleFactor','live.axle_factor',model.live.axle_factor??1)}</div>`;
  if(ftApplied)live+=`<p class="note axle-replaces">${t('axleReplaces')}</p>`;
  if(model.live.vehicle==='custom')live+=`<label class="field"><span>${t('axleCount')}</span><select id="axle-count">${[1,2,3,4,5,6,7].map(n=>`<option ${n===weights.length?'selected':''}>${n}</option>`).join('')}</select></label>`;
  if(model.live.vehicle==='Cooper')live+=`${field('cooperE','live.cooper_e',model.live.cooper_e,'',{min:10,max:200})}<div class="case-breakdown">18 ${t('axles').toLowerCase()} · E${fmt(model.live.cooper_e,0)} · ${t('laneIntensity')}: ${fmt(model.live.cooper_e/10*4.4482216/.3048,1)}</div>`;
  else {live+=`<table class="axle-table"><thead><tr><th>${t('axle')}</th><th>${t('load')}</th><th>${t('spacing')}</th></tr></thead><tbody>${weights.map((w,i)=>`<tr><td>${i+1}</td><td>${model.live.vehicle==='custom'?`<input aria-label="${t('axle')} ${i+1} ${t('load')}" type="number" min="0.1" max="10000" step="any" data-path="live.weights.${i}" value="${w}">`:fmt(w,0)}</td><td>${i<gaps.length?(model.live.vehicle==='custom'?`<input aria-label="${t('spacing')} ${i+1}" type="number" min="0.01" max="50" step="any" data-path="live.spacings.${i}" value="${gaps[i]}">`:fmt(gaps[i],1)):'—'}</td></tr>`).join('')}</tbody></table><div class="case-breakdown">Σ ${fmt(weights.reduce((a,b)=>a+b,0),0)} kN · ${fmt(gaps.reduce((a,b)=>a+b,0),1)} m</div>`;if(model.live.vehicle==='HL93Truck')live+=`<p class="help">${t('hl93Spacing')}</p>`;}
  if(['HL93Truck','HL93Tandem'].includes(model.live.vehicle))live+=`<label class="toggle-row"><input type="checkbox" data-path="live.two_trucks" ${model.live.two_trucks?'checked':''}>${t('twoTruckOption')}</label>`;
  live+=select('case','live.case',model.live.case,hasLane?[['governing',t('governing')],['truck',t('truck')],['lane',t('lane')]]:[['truck',t('truck')]]);
  if(hasLane&&model.live.case!=='truck') {
   const mtqAuto=model.live.vehicle==='CL750QC'&&model.live.mtq_auto!==false;
   if(model.live.vehicle==='CL750QC')live+=`<label class="toggle-row"><input type="checkbox" data-path="live.mtq_auto" ${mtqAuto?'checked':''}>${t('mtqAuto')}</label><p class="help">${t('mtqAutoHelp')}</p>`;
   if(canadianLaneVehicle()&&model.live.vehicle!=='CL625'&&!mtqAuto)live+=select('fraction','live.lane_fraction',model.live.lane_fraction,[[.8,'80 %'],[.63,'63 %']]);
   const laneW=model.live.vehicle==='CL625'?9:model.live.vehicle==='CL750QC'?12.6:model.live.vehicle==='HL93Truck'||model.live.vehicle==='HL93Tandem'?9.3:model.live.vehicle==='Cooper'?model.live.cooper_e/10*4.4482216/.3048:model.live.lane_w;
   if(model.live.vehicle==='custom')live+=field('laneIntensity','live.lane_w',model.live.lane_w);else live+=`<p class="note">${t('laneIntensity')}: <b>${fmt(laneW,1)}</b>${model.live.vehicle==='CL625'?' · 80 %':''}</p>`;
   // v0.9.96: extent of the lane UDL (S6 C3.8.4.1).
   live+=select('laneExtent','live.lane_extent',model.live.lane_extent||'spans',[['spans',t('laneSpans')],['influence',t('laneInfluence')],['full',t('laneFull')]])+`<p class="help">${t('laneExtentHelp_'+(model.live.lane_extent||'spans'))}</p>`;
  }
  live+=['Cooper','Maintenance'].includes(model.live.vehicle)?`<p class="help">${t('noDynamic')}</p>`:`<label class="toggle-row"><input type="checkbox" data-path="live.dynamic" ${model.live.dynamic?'checked':''}>${t('dynamic')}</label>`;live+=`<p class="help">${t('bothDirectionsAlways')}</p>`;
  const walkers=model.live.source==='pedestrian';
  if(walkers)live=`<p class="note ped-replaced">${t('vehicleReplaced')}</p><div class="ped-dimmed">${live}</div>`;
  html+=inputGroup('loads-live',t('liveLoads'),live,false,walkers?t('pedestrianShort'):vehicleName());
  html+=inputGroup('loads-ped',t('pedestrianGroup'),pedestrianCard(),walkers,walkers?pedestrianMeta():t('offShort'));
  if(typeof axleCard==='function')html+=inputGroup('loads-ft',t('axleGroup'),(walkers?`<p class="note">${t('ftNotPedestrian')}</p>`:'')+axleCard(),false,typeof axleGroupMeta==='function'?axleGroupMeta():'');
 }
 $('#input-content').innerHTML=html;
}
function weightedSections(){
 const used=[...new Set(model.spans.flatMap(s=>model.nonprismatic&&s.zones.length?s.zones.flatMap(z=>[z.section,z.end_section??z.section]):[s.section]))].map(i=>model.sections[i]).filter(Boolean);
 return used.filter(s=>s.kind!=='ei');
}
function selfWeightBreakdown(){
 const sw=model.self_weight;
 return weightedSections().map(s=>{const w=sectionProps(s).w,inc=s.kind==='nebt'?sw.nebt_increase:sw.steel_increase;return `${esc(s.name)} · ${s.kind==='nebt'?s.nebt.replace('NEBT','NEBT '):t('steelShort')} · ${fmt(w,2)} × ${fmt(1+inc/100,2)} = <b>${fmt(w*(1+inc/100),2)} kN/m</b>`;}).join('<br>');
}
function selfWeightCard(){
 const sw=model.self_weight,weighted=weightedSections(),steel=weighted.some(s=>s.kind==='girder'),nebt=weighted.some(s=>s.kind==='nebt');
 let html=`<div class="load-card self-weight-card"><label class="toggle-row"><input type="checkbox" data-path="self_weight.apply" ${sw.apply?'checked':''}>${t('selfWeightApply')}</label>`;
 if(!weighted.length)return html+`<p class="help">${t('selfWeightNone')}</p></div>`;
 if(sw.apply)html+=`<div class="field-row">${steel?field('steelIncrease','self_weight.steel_increase',sw.steel_increase,'',{min:0,max:200}):''}${nebt?field('nebtIncrease','self_weight.nebt_increase',sw.nebt_increase,'',{min:0,max:200}):''}${field('loadFactor','self_weight.factor',sw.factor??1)}</div><div class="case-breakdown">${selfWeightBreakdown()}</div>`;
 return html+`<p class="help">${t('selfWeightHelp')}</p></div>`;
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
 if(isNumInput(el) && (!el.validity.valid||el.value==='')) { if(path.startsWith('distribution.')||/^sections\.\d+\.composite\./.test(path)){updateProjectState();return;} invalidate(t('invalid'));return; }
 let value=el.type==='checkbox'?el.checked:isNumInput(el)?+(numValue(el)*Number(el.dataset.scale||1)).toPrecision(12):el.value;
 if(el.tagName==='SELECT' && (path.endsWith('section')||path.endsWith('end_section')||path.endsWith('.span')||path==='live.lane_fraction'))value=Number(value);
 const previousVehicle=model.live.vehicle,previousPattern=path==='live.vehicle'?vehiclePattern():null;
 // S6-25 FT settings never change the analysis: no recalculation of the envelopes.
 // Composite slab data of the section properties window: display only, no analysis.
 if(/^sections\.\d+\.composite\./.test(path)){setValue(path,value);updateProjectState();if(typeof sectionPropsChanged==='function')sectionPropsChanged(path);return;}
 if(path.startsWith('sections.')&&typeof sectionPropsChanged==='function')setTimeout(()=>sectionPropsChanged(path));
 // S6-25 FT: recalculate the envelopes only when FT is (or was just) applied.
 if(path.startsWith('distribution.')){
  const wasApplied=model.distribution.enabled&&model.distribution.apply;setValue(path,value);
  const isApplied=model.distribution.enabled&&model.distribution.apply;
  if(el.tagName==='SELECT'||el.type==='checkbox'){renderInputs();if(typeof axleDialogOpen==='function'&&axleDialogOpen())renderAxleView();}
  if(wasApplied||isApplied)changed();else{updateProjectState();if(typeof axleChanged==='function')axleChanged();}
  return;
 }
 const previousKind=path.endsWith('.kind')?model.sections[Number(path.split('.')[1])].kind:null;
 setValue(path,value);
 // Concrete NEBT and steel girders each start from their usual modulus.
 if(previousKind&&previousKind!==value){const s=model.sections[Number(path.split('.')[1])];if(value==='nebt'&&model.nonprismatic){model.nonprismatic=false;model.spans.forEach(sp=>sp.zones=[]);$('#status').textContent=t('nebtNoTaper');}
  // v0.9.8: NEBT from f'c 50 MPa / 24.5 kN/m³; direct EI from EI; steel 200 GPa.
  if(value==='nebt'){s.stiffness_input='concrete';s.fc=50;s.unit_weight=24.5;if(!s.nebt)s.nebt='NEBT1400';}
  else if(value==='ei'){s.stiffness_input='EI';if(previousKind==='nebt'){s.fc=35;s.unit_weight=24;}}
  else if(value==='girder'&&s.E<100)s.E=200;
  syncSectionDerived(s);}
 if(/^sections\.\d+\.(fc|unit_weight|stiffness_input|I_direct|E|EI)$/.test(path))syncSectionDerived(model.sections[Number(path.split('.')[1])]);
 if(path.startsWith('self_weight.')&&isNumInput(el)){const box=$('.self-weight-card .case-breakdown');if(box)box.innerHTML=selfWeightBreakdown();}
 if(path.startsWith('supports.')){if(model.supports.includes('spring')){const k=model.support_springs||[];model.support_springs=model.supports.map((s,i)=>s==='spring'?(k[i]>0?k[i]:defaultSpring(i)):0);}else model.support_springs=[];}
 if(path==='live.vehicle'&&value==='custom'&&!['custom','Cooper'].includes(previousVehicle)&&previousPattern){model.live.weights=previousPattern.weights.slice(0,7);model.live.spacings=previousPattern.spaces.slice(0,model.live.weights.length-1);}
 if(path==='live.vehicle'&&value==='Maintenance')model.live.case='truck';
 else if(path==='live.vehicle'&&previousVehicle==='Maintenance')model.live.case='governing';
 if(path.startsWith('thermal.')&&isNumInput(el)){imposedRefresh();renderBeam();}
 if(path.startsWith('sections.')&&isNumInput(el)){
  const s=model.sections[Number(path.split('.')[1])],card=el.closest('.section-card');
  if(card){card.querySelector('.section-svg').outerHTML=sectionSvg(s);card.querySelector('.section-props').innerHTML=sectionPropsHtml(s);const out=card.querySelector('.computed-field output');if(out)out.textContent=fmt(sectionE(s)*1000,0);}
 }
 if(path==='nonprismatic' && value) {
  if(model.sections.length===1){const s=clone(model.sections[0]);s.name='S2';s.depth*=1.3;model.sections.push(s)}
  const haunches=defaultHaunches(model.spans.length);
  model.spans.forEach((s,i)=>{if(!s.zones.length)s.zones=clone(haunches[i])});
 }
 model.spans.forEach(s=>s.zones.forEach(z=>{if([z.section,z.end_section??z.section].some(i=>['ei','nebt'].includes(model.sections[i]?.kind)))z.profile='constant'}));
 if(el.tagName==='SELECT'||el.type==='checkbox')renderInputs();
 changed();
}
function invalidate(message) {
 clearExcelFile();
 revision++;snapRevision++;clearTimeout(timer);clearTimeout(positionTimer);$('#error').textContent=message;$('#error').classList.remove('hidden');$('#status').textContent=t('failed');$('#status').classList.remove('busy');$('#excel').disabled=true;$('#charts').classList.add('stale');updateProjectState();
}
function changed() {
 clearExcelFile();
 if($$('input[data-path].qb-num,input[data-path][type="number"]').some(el=>!el.validity.valid||el.value==='')){invalidate(t('invalid'));return;}
 stopAnimation();revision++;snapRevision++;clearTimeout(timer);clearTimeout(positionTimer);snap=null;influenceData=null;traverseData=null;display='envelope';$('#error').classList.add('hidden');$('#status').textContent=t(engineReady?'solving':'solvingAfterBoot');$('#status').classList.add('busy');$('#excel').disabled=true;$('#charts').classList.add('stale');renderBeam();updateProjectState();timer=setTimeout(()=>calculate(revision),calcDelay());
 if(typeof modalChanged==='function')modalChanged();
 if(typeof axleChanged==='function')axleChanged();
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
// v0.9.8: one analysis at a time. Changes made while the engine is busy are
// merged into a single follow-up analysis of the latest model (never a queue
// of stale ones), and the wait before starting grows with the last duration.
let calcBusy=false,calcPending=false,lastElapsed=0;
function calcDelay(){return Math.round(Math.min(1500,Math.max(450,lastElapsed*400)));}
async function calculate(token) {
 if(calcBusy){calcPending=true;return;}
 calcBusy=true;const started=performance.now();
 try {
  const key=String(token),data=await solver.request('analyse',{model:clone(model),job:key});
  lastElapsed=(performance.now()-started)/1000;
  if(token!==revision)return;
  window.QBSplash?.done();result=data;jobId=key;snap=null;influenceData=null;traverseData=null;display='envelope';$('#error').classList.add('hidden');
  if(typeof stIndex!=='undefined'&&stIndex!==null&&typeof stRequest==='function'){stIndex=Math.min(stIndex,result.x.length-1);stRequest();}
  $('#status').textContent=`${t('ready')} · ${fmt(result.meta.elapsed,2)} s`;
  $('#status').classList.remove('busy');$('#charts').classList.remove('stale');$('#excel').disabled=false;
  renderResults();renderBeam();refreshAutoM();
 }catch(e){if(token===revision){window.QBSplash?.done();console.error(e);const known=['thermal.needs_slab','model.nebt_nonprismatic','composite.bars','model.split_end'].find(k=>String(e).includes(k));invalidate(known?t(known):t('invalid'))}}
 finally{calcBusy=false;if(calcPending){calcPending=false;calculate(revision);}}
}
function clearExcelFile(){const file=$('#excel-file');if(file){URL.revokeObjectURL(file.href);file.remove();}}
async function downloadExcel() {
 if(!excelAvailable){$('#error').textContent=t('excelUnavailable');$('#error').classList.remove('hidden');return;}
 $('#status').textContent=t('excelPreparing');
 const key=jobId,language=lang,token=revision,modalKey=JSON.stringify(model.modal);
 $('#excel').disabled=true;$('#excel .mi-label').textContent='Excel…';
 try {
  // v0.9.96: model name, export date and version in the file and its name.
  const now=new Date(),pad=n=>String(n).padStart(2,'0'),day=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`,stamp=`${day} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const title=(projectName||t('untitled')).trim()||t('untitled'),safe=title.replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').slice(0,80);
  const data=await solver.request('excel',{job:key,lang:language,modal:clone(model.modal),distribution:clone(model.distribution),name:title,exported:stamp});
  if(token!==revision||modalKey!==JSON.stringify(model.modal))return;
  const url=URL.createObjectURL(new Blob([Uint8Array.from(atob(data),c=>c.charCodeAt(0))],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
  const previous=$('#excel-file');if(previous){URL.revokeObjectURL(previous.href);previous.remove();}
  const a=document.createElement('a');a.id='excel-file';a.href=url;a.download=`${safe} - QuickerBridge v${QB_META.version} - ${day}.xlsx`;a.textContent=language==='fr'?'Fichier prêt ↓':'File ready ↓';a.className='excel-file';$('#excel').after(a);a.click();
 }catch(e){console.error(e);if(String(e).includes('excel.unavailable')){excelAvailable=false;$('#excel').title=t('excelUnavailable');$('#excel').classList.add('excel-off');$('#error').textContent=t('excelUnavailable');}else $('#error').textContent=t('failed');$('#error').classList.remove('hidden')}
 finally{if(token===revision)$('#excel').disabled=false;$('#excel .mi-label').textContent=t('excelExport');if(result)$('#status').textContent=`${t('ready')} · ${fmt(result.meta.elapsed,2)} s`;}
}
function beamX(x,total){
 const beam=$('#beam').getBoundingClientRect(),comparing=view==='comparison'&&typeof comparisonResult!=='undefined'&&comparisonResult;
 const plot=$(comparing?'#comparison-view .plot':'#charts .plot,#charts .il-plot,#charts .stiffness-plot')?.getBoundingClientRect();
 const length=comparing?Math.max(total,comparisonResult.x.at(-1)):total,L=comparing?38:26,span=comparing?870:874;
 if(plot?.width>0){if(!comparing)beamX.last={left:plot.left-beam.left,width:plot.width,beam:beam.width};return plot.left-beam.left+(L+x/length*span)/926*plot.width;}
 const m=beamX.last;if(m&&Math.abs(m.beam-beam.width)<1)return m.left+(L+x/length*span)/926*m.width;
 return 26+x/total*(beam.width-52);
}
function renderBeam() {
 if(!model)return;
 $('#beam').setAttribute('viewBox',`0 0 ${$('#beam').clientWidth||1000} 146`);
 if(typeof modalBeam==='function'&&modalBeam())return;
 const total=model.spans.reduce((v,s)=>v+s.length,0);if(!Number.isFinite(total)||total<=0)return;
 const xp=x=>beamX(x,total);
 let starts=[0];model.spans.forEach(s=>starts.push(starts.at(-1)+s.length));
 const beamDepth=sectionDepth;
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
  svg+=beamZoneLabels(s,i,zones,starts,xp);
  svg+=`<path d="M${xp(starts[i])} 133v7m0-3h${xp(starts[i+1])-xp(starts[i])}m0-4v7" stroke="#607e8d" stroke-width="1" fill="none"/><text x="${spanLabelX(i,starts,xp,total)}" y="131" fill="#bdced7" text-anchor="middle" font-size="12">${fmt(s.length)} m</text>`;
 });
 if(['dead','both'].includes(model.load_mode))model.dead.forEach(load=>{
  if(!load.w)return;
  model.spans.forEach((s,i)=>{if(load.span!==-1&&load.span!==i)return;const a=starts[i]+s.length*load.start,b=starts[i]+s.length*load.end;
   svg+=`<line x1="${xp(a)}" x2="${xp(b)}" y1="42" y2="42" stroke="#7aabb9"/>`;
   for(let x=a;x<=b;x+=(b-a)/Math.max(2,Math.round((b-a)/total*24)))svg+=`<line x1="${xp(x)}" x2="${xp(x)}" y1="42" y2="61" stroke="#7aabb9" marker-end="url(#dl-arrow)"/>`;
  });
 });
 if(['dead','both'].includes(model.load_mode)){
  // Girder self-weight: a light band on the deck, its height following w(x).
  const sw=selfWeightIntervals(),wmax=Math.max(0,...sw.map(v=>v.w));
  sw.forEach(v=>{const hgt=3+5*v.w/wmax;svg+=`<rect class="self-weight" x="${xp(v.start)}" y="${(64-hgt).toFixed(1)}" width="${Math.max(0,xp(v.end)-xp(v.start)).toFixed(1)}" height="${hgt.toFixed(1)}" fill="#c9b37e" opacity=".55"><title>${t('selfWeightShort')} ${fmt(v.w,2)} kN/m</title></rect>`;});
  if(sw.length)svg+=`<text x="${xp(0)+4}" y="53" font-size="11" fill="#d9c592">${t('selfWeightShort')}</text>`;
 }
 if(snap && display==='snapshot') snap.lane.forEach(v=>{svg+=`<rect x="${xp(v.start)}" y="47" width="${Math.max(0,xp(v.end)-xp(v.start))}" height="13" fill="#edb66f" opacity=".24"/>`});
 if(['live','both'].includes(model.load_mode)) {
  const pattern=vehiclePattern(),weights=pattern.weights,spaces=pattern.spaces,displayWeights=weights.map(w=>w*visualAxleFactor());let offsets=[0];spaces.forEach(s=>offsets.push(offsets.at(-1)+s));
  const front=Math.min(total*.78,Math.max(offsets.at(-1)+total*.12,total*.6));
  const axles=snap&&display==='snapshot'?snap.axles:display==='influence'&&influenceData?.governing_max?influenceData.governing_max.axles:weights.map((w,i)=>({x:front-offsets[i],load:w,id:i+1})).filter(a=>a.x>=0&&a.x<=total);
  const loadScale=35/Math.max(...displayWeights);const labels=[];
  axles.forEach(a=>{const special=snap?.record.case==='hl93_two_trucks',shownLoad=(special?([35,145,145][(a.id-1)%3]*.9*(model.live.axle_factor??1)):displayWeights[a.id-1]),y=61-shownLoad*loadScale;const labelX=Math.max(18,Math.min($('#beam').clientWidth-18,xp(a.x))),labelWidth=String(Math.round(shownLoad)).length*7+8;let labelY=y-5;while(labels.some(b=>Math.abs(labelX-b.x)<(labelWidth+b.w)/2&&Math.abs(labelY-b.y)<13))labelY-=14;labels.push({x:labelX,y:labelY,w:labelWidth});svg+=`<line class="axle-arrow" data-load="${shownLoad}" x1="${xp(a.x)}" x2="${xp(a.x)}" y1="${y}" y2="61" stroke="#ecb46a" stroke-width="1.6" marker-end="url(#arrow)"/><text x="${labelX}" y="${labelY}" text-anchor="middle" font-size="12" fill="#ffd49a">${fmt(shownLoad,0)}</text>`});
 }
 if(model.load_mode==='thermal')svg+=imposedBeamBand(xp,total);
 starts.forEach((x,i)=>{
  const X=xp(x);
  if(model.supports[i]==='fixed'){
   // Integral abutment: clamped wall with hatching on the outer side.
   const side=i===0?-1:i===starts.length-1?1:0,wx=side?X+side*3:X;
   svg+=`<line x1="${wx}" x2="${wx}" y1="62" y2="104" stroke="#dceaf0" stroke-width="3"/>`;
   for(let k=0;k<6;k++){const y=66+k*7;svg+=side?`<line x1="${wx}" x2="${wx+side*7}" y1="${y}" y2="${y+6}" stroke="#9fb9c6"/>`:`<line x1="${X-7}" x2="${X+7}" y1="${y+6}" y2="${y}" stroke="#9fb9c6"/>`;}
  } else if(model.supports[i]==='split'){
   // Split pier: deck joint and two bearings, one under each deck end.
   svg+=`<line x1="${X}" x2="${X}" y1="58" y2="72" stroke="#ffd49a" stroke-width="2"/><path d="M${X-6} 89l-6 11h12Z M${X+6} 89l-6 11h12Z" fill="#dceaf0" stroke="#dceaf0"/><rect x="${X-15}" y="100" width="30" height="5" rx="1" fill="#7695a6"/>`;
  } else svg+=`<path d="M${X} 89l-8 13h16Z" fill="#dceaf0" stroke="#dceaf0"/>`;
  if(model.supports[i]==='spring'){
   // Rotational spring: a spiral around the support node.
   let d='';for(let a=0;a<=4.4*Math.PI;a+=.25){const r=2+a*1.25;d+=`${d?'L':'M'}${(X+r*Math.cos(a)).toFixed(1)} ${(78+r*Math.sin(a)).toFixed(1)}`;}
   svg+=`<path d="${d}" fill="none" stroke="#f0b35a" stroke-width="1.4"/>`;
  }
  if(model.supports[i]==='roller')svg+=`<circle cx="${X-4}" cy="105" r="2" fill="#cadbe3"/><circle cx="${X+4}" cy="105" r="2" fill="#cadbe3"/>`;
  svg+=`<line x1="${X-13}" x2="${X+13}" y1="109" y2="109" stroke="#7695a6"/><text x="${X}" y="121" text-anchor="middle" font-size="11" fill="#91acbb">R${i+1}${model.supports[i]==='split'?' ‖':''}</text>`;
  // Hinge (moment release) next to a simple span: open circles on the deck axis.
  [[model.spans[i-1],-1],[model.spans[i],1]].forEach(([s,side])=>{if(s?.simple)svg+=`<circle class="hinge" cx="${X+side*6}" cy="65" r="3.6" fill="#17374b" stroke="#ffd49a" stroke-width="1.6"/>`;});
 });
 $('#beam').innerHTML=svg;$('#beam').setAttribute('aria-label',t('beamLoads'));
 const qbCaption=model.load_mode==='thermal'?imposedCaption():model.load_mode==='dead'?t('deadOnly')+(selfWeightIntervals().length?` · ${t('selfWeightIncluded')}`:''):(snap&&display==='snapshot'?`${snap.record.case==='hl93_two_trucks'?t('twoTruckCase'):vehicleName()} · ${t('nominalTruck')}`:`${vehicleName()} · ${t('nominalTruck')}`)+(result?.ft&&model.load_mode!=='dead'?` · <span class="axle-caption">${t('axleCaption')} · ${t(result.ft.girder==='interior'?'interiorGirder':'exteriorGirder')} · ${t(result.ft.state==='ULS'?'ulsState':'flsState')}${['slab','voided_slab'].includes(model.distribution?.bridge_type)?` · ${t('perMetre')}`:''}</span>`:'');
}
function caseText(c) {
 if(!c)return '';
 const name=c.case==='hl93_two_trucks'?t('twoTruckCase'):c.case==='lane'?t('lane'):c.case==='unloaded'?t('unloaded'):t('truck');
 const canadianLane=c.case==='lane'&&canadianLaneVehicle(),codeFactor=canadianLane?`${t('fraction')} ×${fmt(c.fraction??(model.live.vehicle==='CL625'?.8:model.live.lane_fraction),2)}`:['Cooper','Maintenance'].includes(model.live.vehicle)?t('noDynamic'):`${t('dynamicFactor')} ×${fmt(c.factor,2)}`;
 return `${name} · ${t('axles')} ${c.axles.length?c.axles.join('–'):'—'} · ${codeFactor} · ${t('loadFactor')} ×${fmt(model.live.factor??1,2)} · ${t('axleFactor')} ×${fmt(model.live.axle_factor??1,2)}${c.rear_spacing!==undefined?` · s₃ = ${fmt(c.rear_spacing,2)} m`:''}${c.second_position!==undefined?` · x₂ = ${fmt(c.second_position)} m · ≥ ${fmt(c.gap,2)} m`:''} · x₁ = ${fmt(c.position,1)} m · ${c.direction==='forward'?t('forward'):t('backward')}`;
}
function showView(name) {
 document.body.classList.toggle('comparison-mode',name==='comparison');
 const previous=view;view=name;$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));$$('.result-view').forEach(el=>el.classList.toggle('hidden',el.id!==name+'-view'));
 // v0.8 vibration modes (modes.js): its own view, animated deck drawing.
 if(name==='diagrams'&&result)requestAnimationFrame(()=>{if(measurePlots())renderCharts()});
 if(name==='modes'&&typeof modalShow==='function')modalShow();else if(previous==='modes'&&typeof modalHide==='function')modalHide();
 if(name==='comparison'&&typeof renderComparison==='function')renderComparison();
 // FT tab: rebuild its inputs only on entry; a recalculation refreshes the results.
 if(name==='axle'&&typeof renderAxleView==='function'){if(previous!=='axle'||!$('#axle-results'))renderAxleView();else renderAxleResults();}
}
function renderResults() {
 if(!result){$('#charts').innerHTML=`<p class="help">${t('noResults')}</p>`;return;}
 const thermal=result.kind==='thermal';
 const ext=result.extrema;const shear=ext.filter(e=>e.response==='V').reduce((a,b)=>Math.abs(a.value)>Math.abs(b.value)?a:b);const defl=ext.filter(e=>e.response==='D').reduce((a,b)=>Math.abs(a.value)>Math.abs(b.value)?a:b);
 const metrics=[[t(thermal?'maxMoment':'sagging'),ext[0],'kN·m'],[t(thermal?'minMoment':'hogging'),ext[1],'kN·m'],[t('maxShear'),shear,'kN'],[t('maxDeflection'),defl,'mm']];
 $('#metrics').innerHTML=metrics.map(([label,e,unit],i)=>{const tag=thermal?'div':'button';return `<${tag} class="metric" ${thermal?'':`data-critical="${e.index}" data-sense="${e.sense}" title="${t('showCase')}"`}><div class="metric-label">${label}</div><div class="metric-value">${fmt(qbCeil(i>=2?Math.abs(e.value):e.value,unit==='mm'?1:0),unit==='mm'?1:0)} <small>${unit}</small></div><div class="metric-location">${i>=2?(e.value<0?'−':'+')+' · ':''}${t('at')} x = ${fmt(e.x)} m${thermal?'':' ↗'}</div></${tag}>`}).join('');
 renderUpliftWarning();syncFixity();
 $('#excel').title=excelAvailable?t(thermal?'thermalCase':'envelope'):t('excelUnavailable');$('#excel').classList.toggle('excel-off',!excelAvailable);
 const precisionNote=thermal?`PyCBA ${result.meta.pycba} · ${t('curvature')} κ = ${Number(result.meta.curvature).toExponential(3)} 1/m`:`PyCBA ${result.meta.pycba} · Δx ${fmt(result.meta.travel_step,2)} m · ${fmt(result.meta.positions,0)} ${t('positions')} · ${result.meta.groups} ${t('groups')}`;
 if(!thermal&&model.load_mode==='dead'&&display==='snapshot'){stopAnimation();snap=null;display='envelope';}
 renderCharts();renderTable();renderMethod();if(typeof renderComparison==='function')renderComparison();showView(view);
 $('#display-controls').classList.toggle('hidden',thermal);$$('[data-display]').forEach(b=>b.classList.toggle('active',b.dataset.display===(display==='envelope'&&deltaActive()?'delta':display)));$('#position-controls').classList.add('hidden');$('#play').textContent=t(playTimer?'stop':'play');
 if(!thermal)syncPositionControls(snap?.record.position);
 $('#legend').classList.add('hidden');$$('[data-display="snapshot"]').forEach(b=>b.classList.toggle('hidden',model.load_mode==='dead'));
 $$('[data-display="delta"]').forEach(b=>b.classList.toggle('hidden',thermal||!['live','both'].includes(model.load_mode)));
 
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
function syncFixity(){model.supports.forEach((s,i)=>{const el=$('#fixity-'+i);if(el)el.textContent=springFixityText(i)});}
function renderUpliftWarning(){
 const box=$('#uplift-warning');if(!box)return;
 if(!result||result.kind==='thermal'||model.load_mode==='live'){box.classList.add('hidden');box.innerHTML='';return;}
 const live=snap&&display==='snapshot';
 const bad=result.reactions.flatMap((r,i)=>r.split?splitReactionItems(r,i,false,live,false).map(o=>({r,v:o.lo,label:`R${r.support} ${t(o.side==='left'?'splitLeftShort':'splitRightShort')}`})):[{r,v:live?snap.R[i]:r.min,label:`R${r.support}`}]).filter(o=>o.v<-1e-6);
 if(!bad.length){box.classList.add('hidden');box.innerHTML='';return;}
 const why=live?'upliftSnapshot':model.load_mode==='live'?'upliftLive':model.load_mode==='dead'?'upliftDead':'upliftBoth';
 box.innerHTML=`<b>⚠ ${t('upliftTitle')}</b> ${bad.map(o=>`${o.label} = ${fmt(o.v,1)} kN`).join(' · ')} — ${t(why)}`;
 box.classList.remove('hidden');
}
function renderStiffnessWarning(){
 const box=$('#stiffness-warning');if(!box)return;const jumps=[];
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
// v0.8.6 Δ view: one switch replaces V, M and δ by the envelope ranges
// ΔV, ΔM, Δδ = max − min (the live-load range at each station; permanent
// loads cancel). Read with the same cursor as the envelope.
function deltaActive(){return deltaMode&&!!result&&result.kind!=='thermal'&&display==='envelope'&&['live','both'].includes(model.load_mode);}
function deltaValues(key){return result.max[key].map((v,i)=>v-result.min[key][i]);}
function deltaY(amp){const G=plotGeom();return v=>G.bot-v/amp*(G.bot-G.top);}
// Support reactions as a fifth diagram: arrows at the supports on the same
// 926-unit grid (kN ↑+: an upward reaction points up into the beam, uplift
// points down, in red). Envelope: a max and a min arrow per support; Δ view:
// the range; truck position and thermal: the single value. Fixed and spring
// supports add the moment reaction Mr with a curved arrow and the fixity.
function reactionChart(X){
 const rs=result.reactions;if(!rs||!rs.length)return '';
 const thermal=result.kind==='thermal',live=!!snap&&display==='snapshot',delta=deltaActive(),G=plotGeom(),nx=result.x.length;
 const items=rs.flatMap((r,i)=>{
  if(r.split)return splitReactionItems(r,i,thermal,live,delta);
  const fixed=r.type==='fixed'||r.type==='spring';
  if(thermal)return {r,i,fixed,lo:r.value,hi:r.value,mlo:r.moment,mhi:r.moment,single:true};
  if(live)return {r,i,fixed,lo:snap.R[i],hi:snap.R[i],mlo:snap.Mr?.[i],mhi:snap.Mr?.[i],single:true};
  if(delta){const d=r.max-r.min,m=r.moment_max-r.moment_min;return {r,i,fixed,lo:d,hi:d,mlo:m,mhi:m,single:true};}
  return {r,i,fixed,lo:r.min,hi:r.max,mlo:r.moment_min,mhi:r.moment_max,single:Math.abs(r.max-r.min)<1e-4};
 });
 const values=items.flatMap(o=>[o.lo,o.hi]),pos=Math.max(0,...values),neg=Math.max(0,...values.map(v=>-v)),amp=Math.max(pos+neg,1e-6);
 const hasMr=items.some(o=>o.fixed&&Number.isFinite(o.mlo)),start=G.u(neg>1e-6?30:20),end=G.H-G.u(hasMr?32:17),span=Math.max(end-start,G.u(10)),base=start+span*neg/amp,room=span,env=!thermal&&!live&&!delta&&!items.every(o=>o.single);
 const colors={hi:'#7a5bb5',lo:'#a99bd8'},red='#c0392b',text={hi:'#6b4aa5',lo:'#8f7fc4'};
 let svg=`<line x1="26" x2="900" y1="${base}" y2="${base}" stroke="#9db4c1" stroke-width=".8"/>`;
 const arrow=(cx,v,kind,o,sense)=>{
  const neg=v<-1e-6,len=Math.abs(v)/amp*room,hh=Math.min(G.u(8),len),hw=G.u(3.6),col=neg?red:colors[kind],tx=neg?red:text[kind];
  const tail=base+(neg?-1:1)*len,dir=neg?-1:1,label=fmt(v,0);
  let g=len>0.3?`<line x1="${cx}" x2="${cx}" y1="${tail}" y2="${base+dir*hh}" stroke="${col}" stroke-width="2.4"/><polygon points="${cx},${base} ${cx-hw},${base+dir*hh} ${cx+hw},${base+dir*hh}" fill="${col}"/>`:`<line x1="${cx-G.u(4)}" x2="${cx+G.u(4)}" y1="${base}" y2="${base}" stroke="${col}" stroke-width="2.4"/>`;
  const anchor=cx<26+G.u(18)?'start':cx>900-G.u(18)?'end':'middle',lx=anchor==='start'?cx-G.u(4):anchor==='end'?cx+G.u(4):cx;
  g+=`<text class="rv" x="${lx}" y="${neg?tail-G.u(5):tail+G.u(12)}" text-anchor="${anchor}" style="fill:${qbInk(tx)}">${label}</text>`;
  const hit=sense&&!thermal&&!live&&!delta;
  return `<g${hit?` class="r-hit" data-critical="${o.crit?o.crit[sense][0]:3*nx+o.i}" data-sense="${o.crit?o.crit[sense][1]:sense}"`:''}><title>${hit?t('reactionCase'):t('reactionHelp')}</title>${g}</g>`;
 };
 // Smaller value of the same sign: light band on the shaft of the larger arrow, tick and side label.
 const band=(cx,v,kind,o,sense)=>{
  const neg=v<-1e-6,len=Math.abs(v)/amp*room,col=neg?'#e8a49c':colors[kind],tx=neg?red:text[kind],end=base+(neg?-1:1)*len,w=G.u(4.5);
  const right=o.side?o.side==="right":cx<26+G.u(40),lx=cx+(right?1:-1)*(w+G.u(3)),anchor=right?'start':'end';
  const g=`<line x1="${cx}" x2="${cx}" y1="${base}" y2="${end}" stroke="${col}" stroke-width="8" stroke-opacity=".55"/><line x1="${cx-w}" x2="${cx+w}" y1="${end}" y2="${end}" stroke="${col}" stroke-width="2.4"/><text class="rv" x="${lx}" y="${end+G.u(4)}" text-anchor="${anchor}" style="fill:${qbInk(tx)}">${fmt(v,0)}</text>`;
  const hit=sense&&!thermal&&!live&&!delta;
  return `<g${hit?` class="r-hit" data-critical="${o.crit?o.crit[sense][0]:3*nx+o.i}" data-sense="${o.crit?o.crit[sense][1]:sense}"`:''}><title>${hit?t('reactionCase'):t('reactionHelp')}</title>${g}</g>`;
 };
 items.forEach(o=>{
  const cx=X(o.r.x)+(o.side==='left'?-G.u(13):o.side==='right'?G.u(13):0);
  if(o.side!=='right')svg+=`<line x1="${X(o.r.x)}" x2="${X(o.r.x)}" y1="${G.u(15)}" y2="${G.H-G.u(4)}" stroke="#dbe5eb" stroke-dasharray="3 3"/>`;
  if(o.single)svg+=arrow(cx,o.hi,'hi',o,null);
  else if(o.lo*o.hi<0)svg+=arrow(cx,o.lo,'lo',o,'min')+arrow(cx,o.hi,'hi',o,'max');
  else if(Math.abs(o.hi)>=Math.abs(o.lo))svg+=band(cx,o.lo,'lo',o,'min')+arrow(cx,o.hi,'hi',o,'max');
  else svg+=band(cx,o.hi,'hi',o,'max')+arrow(cx,o.lo,'lo',o,'min');
  const type=o.r.type==='fixed'?' · ⊏⊐':o.r.type==='spring'?` · ↻ ${fmt(100*o.r.fixity,0)} %`:'';
  svg+=`<text class="rl" x="${cx}" y="${G.u(11)}" text-anchor="${o.side==='left'?'end':o.side==='right'?'start':'middle'}">R${o.r.support}${o.side?` ${t(o.side==='left'?'splitLeftShort':'splitRightShort')}`:''}${type}</text>`;
  if(o.fixed&&Number.isFinite(o.mlo)){
   const txt=o.single||Math.abs(o.mlo-o.mhi)<1e-4?`Mr ${fmt(o.mhi,0)}`:`Mr ${fmt(o.mlo,0)} / ${fmt(o.mhi,0)}`,y=G.H-G.u(9),w=G.u(txt.length*6.2),r=G.u(5),sgn=(Math.abs(o.mhi)>=Math.abs(o.mlo)?o.mhi:o.mlo)<0?-1:1,gx=cx-w/2-G.u(9);
   const hit=!thermal&&!live&&!delta&&!o.single;
   svg+=`<g${hit?` class="r-hit" data-critical="${o.r.moment_index}" data-sense="${Math.abs(o.mhi)>=Math.abs(o.mlo)?'max':'min'}"`:''}><title>${t('momentReaction')}</title><g transform="translate(${gx},${y-G.u(4)}) scale(${sgn},1)"><path d="M0 ${-r}A${r} ${r} 0 1 1 ${-r} 0" fill="none" stroke="#b5577a" stroke-width="1.6"/><polygon points="${-r},${-G.u(3)} ${-r-G.u(2.6)},${G.u(1.6)} ${-r+G.u(2.6)},${G.u(1.6)}" fill="#b5577a"/></g><text class="rm" x="${cx}" y="${y}" text-anchor="middle">${txt}</text></g>`;
  }
 });
 const legend=env?`<small><span style="color:${colors.hi}">▲</span> max <span style="color:${colors.lo}">▮</span> min</small>`:'';
 return `<div class="chart-row reaction-row"><div class="chart-label" style="color:#7a5bb5">${t('reactionsShort')}<small>kN ↑+</small>${legend}</div><svg class="reaction-plot" role="img" aria-label="${t('supportReactions')}" ${plotAttrs()}>${svg}</svg></div>`;
}
$('#charts')?.addEventListener('click',e=>{const h=e.target.closest('.reaction-plot .r-hit');if(h)inspectCase(Number(h.dataset.critical),h.dataset.sense);});
function renderDeltaCharts(cfg,X,total){
 const G=plotGeom(),xs=result.x;
 $('#charts').innerHTML=cfg.map(([key,label,unit,color])=>{
  const d=deltaValues(key),amp=Math.max(...d.map(Math.abs),1e-6)*1.08,Y=deltaY(amp);
  const line=d.map((v,i)=>`${i?'L':'M'}${X(xs[i]).toFixed(3)},${Y(v).toFixed(3)}`).join('');
  let svg=axisGrid(amp,-1,Y)+`<line x1="26" x2="900" y1="${G.bot}" y2="${G.bot}" stroke="#9db4c1" stroke-width=".8"/>`;
  result.reactions.forEach(r=>{svg+=`<line x1="${X(r.x)}" x2="${X(r.x)}" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#dbe5eb" stroke-dasharray="3 3"/><text x="${X(r.x)}" y="${G.lab}" text-anchor="middle">${fmt(r.x,1)}</text>`});
  svg+=`<text x="20" y="${G.bot+G.u(4)}" text-anchor="end">0</text><path d="${line}L${X(xs.at(-1)).toFixed(3)},${G.bot}L${X(xs[0]).toFixed(3)},${G.bot}Z" fill="${color}" fill-opacity=".13"/><path class="envelope-delta" d="${line}" fill="none" stroke="${color}" stroke-width="2.4"/>`;
  const placed=[];qbDeltaPoints(key,d,xs).filter(k=>d[k]>amp*.02).forEach(k=>{
   const text=`Δ ${fmt(qbCeil(d[k],key==='D'?1:0),key==='D'?1:0)}`,width=G.u(text.length*6.2+8),px=Math.min(900-width/2,Math.max(26+width/2,X(xs[k])));
   if(placed.some(b=>b.text===text&&Math.abs(b.x-px)<G.u(2)))return;
   let y=Math.max(G.u(12),Y(d[k])-G.u(6));
   for(let n=0;n<5&&placed.some(b=>Math.abs(px-b.x)<(width+b.w)/2&&Math.abs(y-b.y)<G.u(13));n++)y+=G.u(14);
   placed.push({x:px,y,w:width,text});svg+=`<text class="peak-label" x="${px}" y="${y}" text-anchor="middle" style="fill:${qbInk(color)}">${text}</text>`;
  });
  svg+=`<line class="cursor" x1="0" x2="0" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#426774" stroke-dasharray="2 2" visibility="hidden"/><circle class="cursor-high" r="${G.u(3.5)}" fill="${color}" visibility="hidden"/>`;
  return `<div class="chart-row"><div class="chart-label" style="color:${qbInk(color)}">Δ${key==='D'?'δ':key} · ${label}<small>${unit}</small></div><svg class="plot delta-plot" tabindex="0" role="img" aria-describedby="qb-chart-keys" aria-label="Δ ${label} · ${unit}" data-effect="${key}" data-amp="${amp}" data-delta="1" ${plotAttrs()}>${svg}</svg></div>`;
 }).join('');
 if(!renderCharts.again){renderCharts.again=true;try{afterCharts(renderCharts)}finally{renderCharts.again=false}}
 $$('#charts .plot').forEach(svg=>svg.addEventListener('pointermove',chartHover));
}
function renderCharts() {
 if(!result)return;
 if(display==='influence'&&result.kind!=='thermal'){renderInfluence();return;}
 const thermal=result.kind==='thermal',graph=!thermal&&snap&&display==='snapshot'?(snap.plot||snap):null;
 const xs=graph?graph.x:result.x;
 const total=result.x.at(-1),X=x=>26+x/total*874,G=plotGeom();
 const cfg=[['V',t('shear'),'kN','#407dcc',-1],['M',t('moment'),'kN·m','#008378',1],['D',t('deflection'),'mm','#9d762e',1]];
 if(deltaActive()){renderDeltaCharts(cfg,X,total);return;}
 $('#charts').innerHTML=cfg.map(([key,label,unit,color,direction])=>{
  const lo=graph?graph[key]:thermal?result.values[key]:result.min[key],hi=graph?graph[key]:thermal?result.values[key]:result.max[key];
  // In a truck position the envelope stays as a faint reference and fixes the scale.
  const ghost=graph?[result.min[key],result.max[key]]:[];
  const amp=Math.max(...lo.map(Math.abs),...hi.map(Math.abs),...ghost.flat().map(Math.abs),1e-6)*1.12,Y=v=>G.mid+direction*v/amp*G.half;
  const path=(values,xv=xs)=>values.map((v,i)=>`${i?'L':'M'}${X(xv[i]).toFixed(3)},${Y(v).toFixed(3)}`).join('');
  const polygon=path(hi)+lo.map((_,j)=>{const i=lo.length-1-j;return `L${X(xs[i]).toFixed(3)},${Y(lo[i]).toFixed(3)}`}).join('')+'Z';
  let svg=axisGrid(amp,direction,Y)+`<line x1="26" x2="900" y1="${G.mid}" y2="${G.mid}" stroke="#9db4c1" stroke-width=".8"/>`;
  result.reactions.forEach(r=>{svg+=`<line x1="${X(r.x)}" x2="${X(r.x)}" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#dbe5eb" stroke-dasharray="3 3"/><text x="${X(r.x)}" y="${G.lab}" text-anchor="middle">${fmt(r.x,1)}</text>`});
  if(!thermal&&typeof axleChartMarks==='function')svg+=axleChartMarks(key,X,G);
  ghost.forEach(g=>{svg+=`<path d="${path(g,result.x)}" fill="none" stroke="${color}" stroke-opacity=".28" stroke-width="1.2" stroke-dasharray="4 3"/>`});
  svg+=`<text x="20" y="${G.mid+G.u(4)}" text-anchor="end">0</text>${thermal?'':`<path d="${polygon}" fill="${color}" fill-opacity=".13"/>`}${!thermal&&!graph?`<path class="envelope-lower" d="${path(lo)}" fill="none" stroke="${color}" stroke-width="2.4"/>`:""}<path class="envelope-upper" d="${path(hi)}" fill="none" stroke="${color}" stroke-width="2.4"/><line class="cursor" x1="0" x2="0" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#426774" stroke-dasharray="2 2" visibility="hidden"/><circle class="cursor-high" r="${G.u(3.5)}" fill="${color}" visibility="hidden"/>${thermal?'':`<circle class="cursor-low" r="${G.u(3.5)}" fill="${color}" visibility="hidden"/>`}`;
  const peak=(values,best)=>{let k=0;values.forEach((v,i)=>{if(best(v,values[k]))k=i});return k};
  const labels=qbLabelPoints(key,hi,lo,xs).filter(([v,k])=>Math.abs(v[k])>amp*0.02);
  const placed=[];labels.forEach(([v,k])=>{
   const text=fmt(qbCeil(v[k],key==='D'?1:0),key==='D'?1:0),width=G.u(text.length*6.2+8),px=Math.min(900-width/2,Math.max(26+width/2,X(xs[k]))),py=Y(v[k]);
   if(placed.some(b=>b.text===text&&Math.abs(b.x-px)<G.u(2)))return;
   let y=Math.min(G.H-G.u(3),Math.max(G.u(12),py+(py>G.mid?G.u(15):-G.u(6))));
   for(let n=0;n<5&&placed.some(b=>Math.abs(px-b.x)<(width+b.w)/2&&Math.abs(y-b.y)<G.u(13));n++)y+=py>G.mid?-G.u(14):G.u(14);
   placed.push({x:px,y,w:width,text});svg+=`<text class="peak-label" x="${px}" y="${y}" text-anchor="middle" style="fill:${qbInk(color)}">${text}</text>`;
  });
  return `<div class="chart-row"><div class="chart-label" style="color:${qbInk(color)}">${label}<small>${unit}</small></div><svg class="plot" tabindex="0" role="img" aria-describedby="qb-chart-keys" aria-label="${label} · ${unit}" data-effect="${key}" data-amp="${amp}" data-sign="${direction}" ${plotAttrs()}>${svg}</svg></div>`;
 }).join('')+stiffnessChart(X,total)+reactionChart(X);
 if(!renderCharts.again){renderCharts.again=true;try{afterCharts(renderCharts)}finally{renderCharts.again=false}}
 $('.stiffness-plot')?.addEventListener('pointermove',chartHover);
 $$('#charts .plot').forEach(svg=>{svg.addEventListener('pointermove',chartHover);if(!thermal){svg.addEventListener('click',chartClick);svg.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const k=svg.dataset.effect,nx=result.x.length,i=qbKbStation??0,off=k==='M'?nx:k==='D'?2*nx:0,sense=Math.abs(result.max[k][i])>=Math.abs(result.min[k][i])?'max':'min';Promise.resolve(inspectCase(off+i,sense)).then(()=>$(`#charts svg.plot[data-effect="${k}"]`)?.focus({preventScroll:true}));})}});
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
  svg+=`<text class="peak-label" x="${Math.min(880,Math.max(46,X(xs[peak])))}" y="${Y(values[peak])>G.mid?Math.min(G.H-G.u(2),Y(values[peak])+G.u(15)):Math.max(G.u(12),Y(values[peak])-G.u(6))}" text-anchor="middle" style="fill:${qbInk(color)}">${fmt(values[peak],key==='D'?4:3)}</text>`;
  svg+=`<line class="cursor" x1="0" x2="0" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#426774" stroke-dasharray="2 2" visibility="hidden"/>`;
  return `<div class="chart-row"><div class="chart-label" style="color:${qbInk(color)}">η ${label}<small>${unit}</small></div><svg class="il-plot" role="img" aria-label="η ${label}" data-effect="${key}" ${plotAttrs()}><defs><marker id="il-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#d98c2b"/></marker></defs>${svg}</svg></div>`;
 }).join('');
 $$('.il-plot').forEach(svg=>{svg.addEventListener('pointermove',influenceHover);svg.addEventListener('click',influenceClick);});
 if(!renderInfluence.again){renderInfluence.again=true;try{afterCharts(renderInfluence)}finally{renderInfluence.again=false}}
}
function pointerX(e){const rect=e.currentTarget.getBoundingClientRect();return Math.max(0,Math.min(1,((e.clientX-rect.left)/rect.width*926-26)/874))*result.x.at(-1);}
function influenceHover(e){
 if(!influenceData)return;const x=pointerX(e),sx=26+x/result.x.at(-1)*874;
 $$('.il-plot .cursor').forEach(line=>{line.setAttribute('x1',sx);line.setAttribute('x2',sx);line.setAttribute('visibility','visible')});
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
 renderCharts();renderBeam();renderUpliftWarning();
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
 svg+=`<text x="20" y="${Y(max)+G.u(4)}" text-anchor="end">${fmt(max/1e6,1)}</text><text x="20" y="${Y(min)+G.u(4)}" text-anchor="end">${fmt(min/1e6,1)}</text>`;
 svg+=`<line class="cursor" y1="${G.top}" y2="${G.bot}" stroke="#426774" stroke-dasharray="2 2" visibility="hidden"/><circle class="cursor-ei" r="${G.u(3.5)}" fill="#7a5bb5" visibility="hidden"/>`;
 return `<div class="chart-row stiffness-row"><div class="chart-label" style="color:#7a5bb5">EI<small>×10⁶ kN·m²</small></div><svg class="stiffness-plot" data-max="${max}" role="img" aria-label="EI(x)" ${plotAttrs()}>${svg}</svg></div>`;
}
function nearest(x,xs=result.x) {let best=0;for(let i=1;i<xs.length;i++)if(Math.abs(xs[i]-x)<Math.abs(xs[best]-x))best=i;return best;}
function currentGraph(){return snap&&display==='snapshot'?(snap.plot||snap):null;}
function pointerStation(e) {const rect=e.currentTarget.getBoundingClientRect();return nearest(Math.max(0,Math.min(1,((e.clientX-rect.left)/rect.width*926-26)/874))*result.x.at(-1),currentGraph()?.x||result.x);}
function eiValue(x,side='right'){const st=result.stiffness;if(!st)return null;let j=0;while(j<st.x.length-1&&st.x[j]<x-1e-8)j++;if(Math.abs(st.x[j]-x)<1e-8){if(side==='right')while(j+1<st.x.length&&Math.abs(st.x[j+1]-x)<1e-8)j++;return st.EI[j];}const a=Math.max(0,j-1),f=(x-st.x[a])/(st.x[j]-st.x[a]);return st.EI[a]+f*(st.EI[j]-st.EI[a]);}
// v0.9.6: readout precision, V and M without decimals, deflection to 0.1 mm.
function qbFmtEffect(key,v){const dec=key==='D'?1:0;return fmt(qbCeil(v,dec),dec);}
function chartHover(e) {
 if(!result)return;const graph=display==='influence'?null:currentGraph(),i=e.currentTarget.classList.contains('stiffness-plot')?nearest(pointerX(e)):pointerStation(e),x=(graph?.x||result.x)[i],sx=26+x/result.x.at(-1)*874;
 $('.stiffness-plot')?.addEventListener('pointermove',chartHover);
 $$('#charts .plot').forEach(svg=>{
  const key=svg.dataset.effect,thermal=result.kind==='thermal',G=plotGeom();
  if(svg.dataset.delta){const line=svg.querySelector('.cursor'),dot=svg.querySelector('.cursor-high');line.setAttribute('x1',sx);line.setAttribute('x2',sx);line.setAttribute('visibility','visible');dot.setAttribute('cx',sx);const dv=result.max[key][i]-result.min[key][i],cy=deltaY(Number(svg.dataset.amp))(dv);dot.setAttribute('cy',cy);dot.setAttribute('visibility','visible');let tx=svg.querySelector('.cursor-val-d');if(!tx){tx=document.createElementNS('http://www.w3.org/2000/svg','text');tx.setAttribute('class','cursor-val cursor-val-d');svg.appendChild(tx);}const right=sx>700;tx.setAttribute('x',sx+(right?-G.u(8):G.u(8)));tx.setAttribute('y',Math.max(G.u(13),cy-G.u(8)));tx.setAttribute('text-anchor',right?'end':'start');tx.setAttribute('visibility','visible');tx.style.fill=svg.closest('.chart-row')?.querySelector('.chart-label')?.style.color||'#17374b';tx.textContent='Δ '+qbFmtEffect(key,dv);const boxes=[tx.getBoundingClientRect()];svg.querySelectorAll('.peak-label').forEach(pl=>{const b=pl.getBoundingClientRect(),hit=boxes.some(c=>!(c.right<b.left-2||b.right<c.left-2||c.bottom<b.top-1||b.bottom<c.top-1));pl.classList.toggle('peak-dim',hit);});return;}
  const lo=graph?graph[key][i]:thermal?result.values[key][i]:result.min[key][i],hi=graph?graph[key][i]:thermal?result.values[key][i]:result.max[key][i],Y=v=>G.mid+Number(svg.dataset.sign)*v/Number(svg.dataset.amp)*G.half;
  const line=svg.querySelector('.cursor');line.setAttribute('x1',sx);line.setAttribute('x2',sx);line.setAttribute('visibility','visible');
  [['.cursor-high',hi],['.cursor-low',lo]].forEach(([cl,v])=>{const circle=svg.querySelector(cl);if(circle){circle.setAttribute('cx',sx);circle.setAttribute('cy',Y(v));circle.setAttribute('visibility','visible')}});
  // v0.9.6: values follow the dots, in the colour of the diagram. The upper
  // dot's value goes above it and the lower one's below, kept apart and inside
  // the plot so the two values stay readable at every station.
  const color=svg.closest('.chart-row')?.querySelector('.chart-label')?.style.color||'#17374b';
  const same=Math.abs(hi-lo)<1e-9,marks=[{k:'hi',v:hi,y:Y(hi)},{k:'lo',v:lo,y:Y(lo)}].sort((a,b)=>a.y-b.y);
  let yUp=marks[0].y-G.u(8),yDown=marks[1].y+G.u(19);
  if(yUp<G.u(13)){yUp=G.u(13);}
  if(yDown>G.H-G.u(2)){yDown=G.H-G.u(2);}
  if(yDown-yUp<G.u(17)){yDown=yUp+G.u(17);}
  marks.forEach((m,n)=>{let tx=svg.querySelector('.cursor-val-'+m.k);if(!tx){tx=document.createElementNS('http://www.w3.org/2000/svg','text');tx.setAttribute('class','cursor-val cursor-val-'+m.k);svg.appendChild(tx);}
   const hide=same&&m.k==='lo';tx.setAttribute('visibility',hide?'hidden':'visible');if(hide)return;
   const right=sx>700;tx.setAttribute('x',sx+(right?-G.u(8):G.u(8)));tx.setAttribute('y',same?m.y-G.u(8):n?yDown:yUp);tx.setAttribute('text-anchor',right?'end':'start');tx.style.fill=color;tx.textContent=qbFmtEffect(key,m.v);});
  // Static extreme labels under a moving value are dimmed, never overlapped.
  const boxes=[...svg.querySelectorAll('.cursor-val')].filter(x=>x.getAttribute('visibility')!=='hidden').map(x=>x.getBBox());
  if(!svg.qbPeaks)svg.qbPeaks=[...svg.querySelectorAll('.peak-label')].map(pl=>({pl,b:pl.getBBox()}));
  const m=G.u(2);svg.qbPeaks.forEach(({pl,b})=>{const hit=boxes.some(c=>!(c.x+c.width<b.x-m||b.x+b.width<c.x-m||c.y+c.height<b.y-m/2||b.y+b.height<c.y-m/2));pl.classList.toggle('peak-dim',hit);});
 });
 const side=(graph?.sides||result.sides)[i],ei=eiValue(x,side),eiSvg=$('.stiffness-plot');if(eiSvg&&ei!==null){const line=eiSvg.querySelector('.cursor'),dot=eiSvg.querySelector('.cursor-ei'),G=plotGeom();line.setAttribute('x1',sx);line.setAttribute('x2',sx);line.setAttribute('visibility','visible');dot.setAttribute('cx',sx);dot.setAttribute('cy',G.bot-ei/(Number(eiSvg.dataset.max)*1.08)*(G.bot-G.top));{const cy=G.bot-ei/(Number(eiSvg.dataset.max)*1.08)*(G.bot-G.top);let tx=eiSvg.querySelector('.cursor-val-ei');if(!tx){tx=document.createElementNS('http://www.w3.org/2000/svg','text');tx.setAttribute('class','cursor-val cursor-val-ei');eiSvg.appendChild(tx);}const right=sx>700;tx.setAttribute('x',sx+(right?-G.u(8):G.u(8)));tx.setAttribute('y',Math.max(G.u(13),cy-G.u(8)));tx.setAttribute('text-anchor',right?'end':'start');tx.setAttribute('visibility','visible');tx.style.fill=eiSvg.closest('.chart-row')?.querySelector('.chart-label')?.style.color||'#7a5bb5';tx.textContent=fmt(ei/1e6,3);}dot.setAttribute('visibility','visible');}
 if(typeof stPeek==='function')stPeek(graph?nearest(x):i,e);
}
function chartClick(e) {
 if(!result||result.kind==='thermal')return;const gi=pointerStation(e),i=currentGraph()?nearest(currentGraph().x[gi]):gi,key=e.currentTarget.dataset.effect,offset=key==='M'?result.x.length:key==='D'?2*result.x.length:0;
 const rect=e.currentTarget.getBoundingClientRect(),G=plotGeom(),y=(e.clientY-rect.top)/rect.height*G.H,Y=v=>G.mid+Number(e.currentTarget.dataset.sign)*v/Number(e.currentTarget.dataset.amp)*G.half;
 const sense=Math.abs(y-Y(result.min[key][i]))<Math.abs(y-Y(result.max[key][i]))?'min':'max';
 // v0.9.4: a double-click opens the stresses; wait briefly before inspecting the case.
 if(e.detail>1)return;clearTimeout(window.qbClickTimer);window.qbClickTimer=setTimeout(()=>inspectCase(offset+i,sense),260);
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
 const thermal=result.kind==='thermal',dead=!thermal&&model.load_mode==='dead',single=thermal||dead;
 const headers=single?'<th>V</th><th>M</th><th>δ</th><th>R</th>':'<th>V min</th><th>V max</th><th>M min</th><th>M max</th><th>δ min</th><th>δ max</th><th>R min</th><th>R max</th>';
 $('#table-view').innerHTML=`<p class="help">${t(thermal?'thermalCase':dead?'deadOnly':'envelope')} · V: kN · M: kN·m · δ: mm · R: kN</p><label class="table-options">${t('subdivisions')} <input id="subdivisions" type="number" min="2" max="100" step="1" data-path="subdivisions" value="${model.subdivisions}"></label><div class="table-scroll"><table><thead><tr><th>${t('span')}</th><th>x (m)</th><th>${t('side')}</th>${headers}</tr></thead><tbody>${result.table.map(row=>{const sp=result.reactions.find(r=>r.split&&Math.abs(r.x-row.x)<1e-8);let r=sp?null:result.reactions.find(r=>Math.abs(r.x-row.x)<1e-8&&!seen.has(r.support));if(r)seen.add(r.support);if(sp){const o=splitReactionItems(sp,0,thermal,false,false).find(o=>o.side===row.side);if(o)r={value:o.hi,min:o.lo,max:o.hi};}const cells=thermal?['V','M','D'].map(k=>`<td>${fmt(row[k])}</td>`).join('')+`<td>${r?fmt(r.value):'—'}</td>`:dead?['V_max','M_max','D_max'].map(k=>`<td>${fmt(row[k])}</td>`).join('')+`<td>${r?fmt(r.max):'—'}</td>`:['V_min','V_max','M_min','M_max','D_min','D_max'].map(k=>`<td>${fmt(row[k])}</td>`).join('')+`<td>${r?fmt(r.min):'—'}</td><td>${r?fmt(r.max):'—'}</td>`;return `<tr class="${row.station===0||row.station===model.subdivisions?'support-station':''}"><td>${row.span} · ${row.station}</td><td>${fmt(row.x)}</td><td>${t(row.side)}</td>${cells}</tr>`}).join('')}</tbody></table></div><div class="table-footnote">${t('subdivisionHelp')}</div>`;
}
function renderMethod() {
 const thermal=result?.kind==='thermal',sections=thermal?[['methodTitle','methodBody'],['thermalNotes','thermalBody'],['sectionNotes','sectionBody'],['unitsTitle','unitsBody']]:[['methodTitle','methodBody'],['sectionNotes','sectionBody'],['selfWeightNotes','selfWeightBody'],...(model?.supports?.includes('split')?[['splitNotes','splitBody']]:[]),...(model?.load_mode==='dead'?[]:[['loadNotes','loadBodyCurrent']]),['methodScope','scopeBodyCurrent'],['precisionTitle','precisionBody'],['unitsTitle','unitsBody']];
 const source=model?.live?.vehicle==='CL750QC'?`CAN/CSA S6-25 · 3.8.4.5.3<br>MTQ · Info-structures A2023-05 · 2023-02-17<br>`:model?.live?.vehicle==='CL625'?`CAN/CSA S6-25 · 3.8.4.5.3<br>`:model?.live?.vehicle==='HL93Truck'||model?.live?.vehicle==='HL93Tandem'?`AASHTO LRFD HL-93 · PyCBA VehicleLibrary.US<br>`:model?.live?.vehicle==='Cooper'?`AREA / AREMA Cooper E · PyCBA VehicleLibrary.US<br>`:'';
 $('#method-view').innerHTML=`<div class="method-content">${sections.map(([h,p])=>`<h3>${t(h)}</h3><p>${t(p)}</p>`).join('')}<h3>${t('sourceTitle')}</h3><p>${thermal?'':source}<a href="https://ccaprani.github.io/pycba/" target="_blank" rel="noreferrer">PyCBA · ${result?result.meta.pycba:'1.0.1'}</a></p>${result?`<h3>${t('runTitle')}</h3><p>${esc(result.kind==='thermal'?`κ = ${Number(result.meta.curvature).toExponential(3)} 1/m`:`Δx ${fmt(result.meta.travel_step,2)} m · ${fmt(result.meta.positions,0)} ${t('positions')} · ${result.meta.groups} ${t('groups')}`)} · ${t('signsShort')}</p>`:''}</div>`;
}
function restoreEnvelope() {stopAnimation();snapRevision++;snap=null;display='envelope';renderResults();renderBeam();}
document.addEventListener('keydown',e=>{if(e.target.type==='number'&&['ArrowUp','ArrowDown'].includes(e.key))e.preventDefault()});
document.addEventListener('input',e=>{if(e.target.id==='position-slider'){const value=Number(e.target.value);$('#position').value=value;if(result&&display==='snapshot'){stopAnimation();if(!scrubFrame(value))queuePositionSnapshot(value);}return;}onInput(e);});
document.addEventListener('change',e=>{
 if(e.target.id==='project-file'&&e.target.files[0]){openSelectedProject(e.target.files[0]);e.target.value='';return}
 if(e.target.id==='axle-count'){const n=Number(e.target.value);while(model.live.weights.length<n)model.live.weights.push(100);while(model.live.spacings.length<n-1)model.live.spacings.push(1.2);model.live.weights.length=n;model.live.spacings.length=n-1;renderInputs();changed();}
 if(e.target.id==='position' && e.target.validity.valid){syncPositionControls(Number(e.target.value));inspectCase(0,'max',Number(e.target.value));}
 if(e.target.dataset.path?.startsWith('sections.') && isNumInput(e.target)){
  const i=Number(e.target.dataset.path.split('.')[1]),card=$$('#input-content > .section-card')[i],s=model.sections[i];
  if(card&&s){card.querySelector('.section-svg').outerHTML=sectionSvg(s);card.querySelector('.section-props').innerHTML=sectionPropsHtml(s);}
 }
});
document.addEventListener('click',e=>{
 if(e.target.closest('#boot-retry')){location.reload();return;}
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(!model&&!['en','fr','collapse-inputs','panel-toggle'].includes(b.id))return;
 if(b.id==='en'||b.id==='fr'){lang=b.id;localStorage.setItem('qb-language-v095',lang);translate();if(view==='modes'&&typeof renderModesView==='function'){renderModesView();renderBeam();}if(typeof axleDialogOpen==='function'&&axleDialogOpen())renderAxleView();return}
 if(b.id==='open-project'){$('#project-file').click();return}
 if(b.id==='save-project'){saveProject();return}
 if(b.id==='panel-toggle'){const collapsed=document.body.classList.toggle('focus-results');b.setAttribute('aria-expanded',String(!collapsed));b.setAttribute('aria-label',t(collapsed?'panelShow':'panelHide'));b.title=t(collapsed?'panelShow':'panelHide');requestAnimationFrame(()=>{if(measurePlots())renderCharts();renderBeam();});return}
 if(b.id==='collapse-inputs'){const collapsed=$('.inputs').classList.toggle('collapsed');b.textContent=collapsed?'+':'−';b.setAttribute('aria-expanded',!collapsed);return}
 if(b.dataset.panel){inputPanel=b.dataset.panel;$$('[data-panel]').forEach(el=>el.classList.toggle('active',el===b));renderInputs();return}
 if(b.dataset.view){showView(b.dataset.view);return}
 if(b.dataset.imposed){model.thermal.imposed=b.dataset.imposed;renderInputs();changed();return}
 if(b.dataset.mode&&typeof stPeekHide==='function')stPeekHide();
 if(b.dataset.mode){model.load_mode=b.dataset.mode;$$('[data-mode]').forEach(el=>el.classList.toggle('active',el===b));renderInputs();changed();return}
 if(b.dataset.spans){const n=Number(b.dataset.spans),haunched=model.nonprismatic&&model.sections.length>1&&isDefaultHaunches(model.spans.length);while(model.spans.length<n)model.spans.push(clone(model.spans.at(-1)));model.spans.length=n;model.supports=Array.from({length:n+1},(_,i)=>model.supports[i]||'roller');[0,n].forEach(k=>{if(model.supports[k]==='split')model.supports[k]='roller';});model.support_springs=Array.from({length:n+1},(_,i)=>model.supports[i]==='spring'?(model.support_springs?.[i]||defaultSpring(i)):0);if(!model.supports.includes('spring'))model.support_springs=[];model.dead=model.dead.filter(d=>d.span<n);if(haunched)defaultHaunches(n).forEach((zones,i)=>{model.spans[i].zones=zones});renderInputs();changed();return}
 if(b.id==='reset'){qbAskReset();return}
 if(b.id==='add-section'){const s=clone(model.sections.at(-1));s.name='S'+(model.sections.length+1);model.sections.push(s);renderInputs();changed();return}
 if(b.dataset.removeSection!==undefined){const i=Number(b.dataset.removeSection);if(sectionInUse(i)){showError(t('deleteSectionHelp'),true);return}
  // v0.9.8: zones are inactive while the girder is prismatic: forget them.
  if(!model.nonprismatic)model.spans.forEach(s=>{s.zones=[];});
  model.sections.splice(i,1);model.spans.forEach(s=>{if(s.section>i)s.section--;s.zones.forEach(z=>{if(z.section>i)z.section--;if(z.end_section>i)z.end_section--})});renderInputs();changed();return}
 if(b.dataset.addZone!==undefined){const zones=model.spans[Number(b.dataset.addZone)].zones,last=zones.at(-1),previous=zones.length>1?zones.at(-2).end:0;last.end=(previous+1)/2;zones.push({...clone(last),end:1});renderInputs();changed();return}
 if(b.dataset.removeZone!==undefined){const [i,j]=b.dataset.removeZone.split(',').map(Number);const z=model.spans[i].zones;z.splice(j,1);z.at(-1).end=1;renderInputs();changed();return}
 if(b.id==='add-slab-weight'){const s=model.sections.find(q=>['girder','nebt'].includes(q.kind)&&q.composite&&q.composite.enabled);if(!s)return;const c=s.composite,top=s.kind==='nebt'?1200:s.top_width,w=c.unit_weight*(c.effective_width*c.slab_thickness+top*c.haunch)/1e6;model.dead.push({name:t('slabWeightName'),w:Math.round(w*100)/100,factor:1,span:-1,start:0,end:1,stage:'steel'});renderInputs();changed();return}
 if(b.id==='add-dead'){model.dead.push({name:t('permanentName')+' '+(model.dead.length+1),w:5,factor:1,span:-1,start:0,end:1,stage:'3n'});renderInputs();changed();return}
 if(b.dataset.removeDead!==undefined){model.dead.splice(Number(b.dataset.removeDead),1);renderInputs();changed();return}
 if(b.dataset.critical!==undefined){inspectCase(Number(b.dataset.critical),b.dataset.sense);return}
 if(b.dataset.display==='delta'){deltaMode=true;restoreEnvelope();return}
 if(b.dataset.display==='envelope'||b.id==='restore'){deltaMode=false;restoreEnvelope();return}
 if(b.dataset.display==='influence'){if(!result||result.kind==='thermal')return;const nx=result.x.length,e=result.extrema.find(x=>x.response==='M'&&x.sense==='max');requestInfluence(influenceData&&display!=='influence'?influenceData.station:e?e.index-nx:0);return}
 if(b.id==='play'){togglePlay();return}
 // v0.9.95: the governing truck of the largest positive moment (an extreme or a reaction picks another one).
 if(b.dataset.display==='snapshot'){if(!result||result.kind==='thermal')return;deltaMode=false;const e=result.extrema.find(x=>x.response==='M'&&x.sense==='max');if(e)inspectCase(e.index,'max');return}
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
$('#replace-dialog').addEventListener('close',()=>{const choice=$('#replace-dialog').returnValue,project=pendingProject;pendingProject=null;qbReplaceKind('open');if(!project||!['save','discard'].includes(choice))return;if(choice==='save'&&!saveProject())return;if(project.qbReset)qbDoReset();else applyProject(project)});
// All modules must be initialized before the first render in the combined HTML.
document.addEventListener('DOMContentLoaded',init,{once:true});

Object.assign(words.fr,{nebtNoTaper:'Poutres NEBT : section préfabriquée constante, le mode non prismatique n’est pas disponible.','model.nebt_nonprismatic':'Poutres NEBT : le pont ne peut pas être non prismatique.','composite.bars':'Armatures hors du béton ou qui se chevauchent : vérifiez épaisseur de dalle, recouvrements, barres et espacements.'});
Object.assign(words.en,{nebtNoTaper:'NEBT girders: constant precast section, the non-prismatic mode is not available.','model.nebt_nonprismatic':'NEBT girders: the bridge cannot be non-prismatic.','composite.bars':'Bars outside the concrete or overlapping: check slab thickness, covers, bars and spacings.'});
// v0.9.6: method and assumptions in a window opened from the header.
document.addEventListener('click',e=>{
 if(e.target.closest('#method-open')){renderMethod();const d=$('#method-dialog');if(d)qbFloat(d);return;}
 if(e.target.closest('[data-method-close]'))$('#method-dialog')?.close();
});
Object.assign(words.fr,{methodOpen:'Méthode et hypothèses',methodSub:'Comment QuickerBridge calcule',runTitle:'Ce calcul',signsShort:'M positif en travée · flèche positive vers le bas',precisionHelp:'Standard : passage du camion tous les 0,25 m, 48 échantillons d’influence par travée, intégration des flèches sur 480 points, profils EI sur 33 points par zone variable. Fin : 0,10 m, 96, 960 et 65 points, environ 1,5 à 3 fois plus long. Les écarts sont faibles (modèle par défaut : moins de 0,01 % sur M, V, flèche et réactions); le mode fin est utile pour les travées courtes, les essieux rapprochés, les goussets marqués et pour confirmer une valeur proche d’une limite.'});
Object.assign(words.en,{methodOpen:'Method and assumptions',methodSub:'How QuickerBridge calculates',runTitle:'This calculation',signsShort:'Sagging M positive · deflection downward positive',precisionHelp:'Standard: truck moved every 0.25 m, 48 influence samples per span, deflections integrated on 480 points, EI profiles on 33 points per tapered zone. Fine: 0.10 m, 96, 960 and 65 points, about 1.5 to 3 times slower. Differences are small (default model: below 0.01% on M, V, deflection and reactions); fine is useful for short spans, closely spaced axles, deep haunches and to confirm a value near a limit.'});
Object.assign(words.fr,{deadStage:'Reprise (contraintes)',deadStageSteel:'Poutre seule (ex. dalle, non étayée)',deadStage3n:'Section mixte 3n (superposées)',deadStageHelp:'Contraintes : le poids propre de la poutre et les charges « poutre seule » (dalle coulée sans étaiement) agissent sur la poutre seule; les autres permanentes (revêtement, glissières…) sur la section mixte 3n.',addSlabWeight:'+ Poids de la dalle (poutre seule)',slabWeightName:'Poids de la dalle',slabWeightHint:'Définissez la dalle dans « Propriétés de section » pour ajouter son poids automatiquement.',fsDead:'Fs sur V et R des permanentes (poutre ext.)',fsDeadOn:'Actif : FT appliqué, poutre (ou portion) extérieure. Fs (art. 5.6.6.2) majore le cisaillement et les réactions des charges permanentes; les moments ne changent pas. Fs est donné dans l’onglet FT.',fsDeadOff:'Sans effet tant que le FT n’est pas appliqué à une poutre (ou portion) extérieure.',thermalProfile:'Profil du gradient',thermalLinear:'Linéaire sur la hauteur',thermalBilinear:'Bilinéaire (ossature type B)',slabDeltaT:'ΔT dans la dalle (°C)',thermalBilinearHelp:'T décroît linéairement du dessus au dessous de la dalle, puis reste constante dans la poutre. Courbure libre κ = α Σ T (y − ȳ) dA / I sur la section mixte 1n. Nécessite une dalle définie dans « Propriétés de section ».',thermalDepthSource:'Hauteur de référence',thermalDepthSections:'Hauteur des sections (+ dalle)',thermalDepthManual:'Valeur imposée',thermalDepthInfo:'κ = α ΔT / h avec h = hauteur de la poutre, plus gousset et dalle si la dalle est définie; moyenne de κ sur chaque travée (goussets compris).',thermalDepthShort:'h des sections','thermal.needs_slab':'Gradient bilinéaire : définissez la dalle (Propriétés de section) de chaque section utilisée.'});
Object.assign(words.en,{deadStage:'Carried by (stresses)',deadStageSteel:'Girder alone (e.g. slab, unshored)',deadStage3n:'Composite 3n (superimposed)',deadStageHelp:'Stresses: the girder self-weight and the “girder alone” loads (slab cast without shoring) act on the girder alone; the other permanent loads (wearing surface, barriers…) on the composite 3n section.',addSlabWeight:'+ Slab weight (girder alone)',slabWeightName:'Slab weight',slabWeightHint:'Define the slab in “Section properties” to add its weight automatically.',fsDead:'Fs on permanent-load V and R (exterior girder)',fsDeadOn:'Active: FT applied, exterior girder (or portion). Fs (cl. 5.6.6.2) increases the permanent-load shear and reactions; moments are unchanged. Fs is given in the FT tab.',fsDeadOff:'No effect until FT is applied to an exterior girder (or portion).',thermalProfile:'Gradient profile',thermalLinear:'Linear over the depth',thermalBilinear:'Bilinear (type B superstructure)',slabDeltaT:'ΔT in the slab (°C)',thermalBilinearHelp:'T falls linearly from the top to the bottom of the slab, then stays constant in the girder. Free curvature κ = α Σ T (y − ȳ) dA / I on the composite 1n section. Needs a slab defined in “Section properties”.',thermalDepthSource:'Reference depth',thermalDepthSections:'Section depths (+ slab)',thermalDepthManual:'Imposed value',thermalDepthInfo:'κ = α ΔT / h with h = girder depth, plus haunch and slab when the slab is defined; κ averaged over each span (haunches included).',thermalDepthShort:'h from sections','thermal.needs_slab':'Bilinear gradient: define the slab (Section properties) of every section used.'});
// v0.9.6: floating windows (section properties, stresses, method). Non-modal:
// the main interface stays usable and is not darkened; dragged by their
// header, brought to the front on click, closed with × or Escape.
let qbFloatZ=60,qbFloatCount=0;
function qbFloat(dlg){
 dlg.classList.add('qb-float');
 if(!dlg.open){
  dlg.show();
  const w=Math.min(dlg.offsetWidth||900,innerWidth-16),off=(qbFloatCount++%4)*24;
  dlg.style.left=`${Math.max(8,(innerWidth-w)/2+off)}px`;dlg.style.top=`${Math.max(8,56+off)}px`;
 }
 dlg.style.zIndex=++qbFloatZ;
}
document.addEventListener('pointerdown',e=>{
 const dlg=e.target.closest?.('dialog.qb-float');if(!dlg)return;dlg.style.zIndex=++qbFloatZ;
 const head=e.target.closest('.sp-head');if(!head||e.target.closest('button,input,select,a'))return;
 e.preventDefault();const r=dlg.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;dlg.classList.add('dragging');
 const move=ev=>{dlg.style.left=`${Math.min(innerWidth-60,Math.max(-r.width+80,ev.clientX-dx))}px`;dlg.style.top=`${Math.min(innerHeight-40,Math.max(0,ev.clientY-dy))}px`;};
 const up=()=>{dlg.classList.remove('dragging');removeEventListener('pointermove',move);removeEventListener('pointerup',up);};
 head.setPointerCapture?.(e.pointerId);
 const end=()=>{up();removeEventListener('pointercancel',end);removeEventListener('blur',end);};
 addEventListener('pointermove',move);addEventListener('pointerup',end);addEventListener('pointercancel',end);addEventListener('blur',end);
});
document.addEventListener('keydown',e=>{
 if(e.key!=='Escape')return;const open=[...document.querySelectorAll('dialog.qb-float[open]')];if(!open.length)return;
 open.sort((a,b)=>Number(b.style.zIndex||0)-Number(a.style.zIndex||0))[0].close();
});


// v0.9.7: imposed deformations (thermal gradient, slab shrinkage, slab creep),
// each analysed alone; both travel directions always; section inset in the
// beam frame; up to 7 spans.
Object.assign(words.fr,{thermal:'Déformation imposée',thermalOnly:'Déformation imposée seulement',thermalScope:'Toutes les travées · courbure imposée',bothDirectionsAlways:'Le véhicule circule toujours dans les deux sens (analyse dans les deux sens).',imposedCase:'CAS ANALYSÉ',imposedThermal:'Gradient thermique',imposedShrinkage:'Retrait de la dalle',imposedCreep:'Fluage de la dalle',imposedAnalysed:'analysé',imposedAnalyse:'Analyser ce cas',imposedOne:'Chaque déformation est analysée seule, jamais superposée aux charges ni aux autres déformations.',shrinkageMicro:'Retrait libre ε_sh (×10⁻⁶)',creepPhi:'Coefficient de fluage φ',creepStress:'Compression permanente σc dans la dalle (MPa)',modularFactor:'Section à long terme k·n : k',shrinkageHelp:'La dalle se raccourcit de ε_sh, retenue par la poutre : courbure libre κ = ε · (Ac / k·n) · e / I(k·n), e = distance du centre de la dalle à l’ANE de la section k·n. La poutre fléchit vers le bas; en continu, moments de retenue négatifs aux piles.',creepHelp:'Raccourcissement de fluage de la dalle sous les charges permanentes : ε_cr = φ · σc / Ec (Ec de f′c et γc de la dalle), puis même courbure que le retrait sur la section k·n. Modèle simplifié : σc est une compression moyenne saisie.',modularHelp:'k = 3 : section mixte 3n (long terme), usage courant.',imposedNeedsSlab:'Nécessite une dalle définie dans « Propriétés de section » (onglet Sections).',creepStrain:'ε_cr = φ σc / Ec',slabShortening:'Raccourcissement de la dalle','thermal.needs_slab':'Retrait, fluage ou gradient bilinéaire : définissez la dalle (Propriétés de section) de chaque section utilisée.',sectionInset:'Section',sectionAtCursor:'section au curseur'});
Object.assign(words.en,{thermal:'Imposed deformation',thermalOnly:'Imposed deformation only',thermalScope:'All spans · imposed curvature',bothDirectionsAlways:'The vehicle always travels in both directions (both are analysed).',imposedCase:'ANALYSED CASE',imposedThermal:'Thermal gradient',imposedShrinkage:'Slab shrinkage',imposedCreep:'Slab creep',imposedAnalysed:'analysed',imposedAnalyse:'Analyse this case',imposedOne:'Each deformation is analysed alone, never superposed with loads or the other deformations.',shrinkageMicro:'Free shrinkage ε_sh (×10⁻⁶)',creepPhi:'Creep coefficient φ',creepStress:'Sustained slab compression σc (MPa)',modularFactor:'Long-term section k·n: k',shrinkageHelp:'The slab shortens by ε_sh, restrained by the girder: free curvature κ = ε · (Ac / k·n) · e / I(k·n), e = distance from the slab centre to the k·n ENA. The beam deflects downward; continuous spans get negative restraint moments at the piers.',creepHelp:'Creep shortening of the slab under permanent loads: ε_cr = φ · σc / Ec (Ec from the slab f′c and γc), then the same curvature as shrinkage on the k·n section. Simplified model: σc is an entered mean compression.',modularHelp:'k = 3: composite 3n section (long term), usual practice.',imposedNeedsSlab:'Needs a slab defined in “Section properties” (Sections tab).',creepStrain:'ε_cr = φ σc / Ec',slabShortening:'Slab shortening','thermal.needs_slab':'Shrinkage, creep or bilinear gradient: define the slab (Section properties) of every section used.',sectionInset:'Section',sectionAtCursor:'section at cursor'});
Object.assign(words.fr,{mtqAuto:'Fraction MTQ automatique (63 % / 80 %)',mtqAutoHelp:'Info-structures A2023-05 du MTQ : la voie de 12,6 kN/m accompagne le camion CL-750-QC dont les essieux sont réduits à 80 %, mais à 63 % pour le M+ hors des zones de M− des appuis, l’effort tranchant, les ponts à une travée et les réactions sans continuité du tablier (culées, articulations). 80 % pour le M−, le M+ dans les zones de M− sur piles, les réactions sur piles continues et les flèches. Décochez pour choisir la fraction à la main.',reactionsShort:'Réactions'});
Object.assign(words.en,{mtqAuto:'MTQ automatic fraction (63 % / 80 %)',mtqAutoHelp:'MTQ Info-structures A2023-05: the 12.6 kN/m lane load goes with the CL-750-QC truck at 80 % of its axles, but 63 % for M+ outside the M− zones of the supports, shear, single-span bridges and reactions without deck continuity (abutments, hinges). 80 % for M−, M+ in the M− zones over piers, reactions at continuous piers and deflections. Untick to choose the fraction by hand.',reactionsShort:'Reactions'});
const IMPOSED_KEYS={thermal:'imposedThermal',shrinkage:'imposedShrinkage',creep:'imposedCreep'};
function imposedKind(){return model.thermal.imposed||'thermal';}
function imposedIcon(k,size=30){
 const s=`width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true" class="imposed-icon"`;
 if(k==='thermal')return `<svg ${s}><defs><linearGradient id="ic-th-${size}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8704a"/><stop offset=".55" stop-color="#f3d9b0"/><stop offset="1" stop-color="#5aa9cc"/></linearGradient></defs><rect x="12.5" y="2.5" width="7" height="19" rx="3.5" fill="url(#ic-th-${size})" stroke="#17374b" stroke-width="1.4"/><circle cx="16" cy="24.5" r="5" fill="#e8704a" stroke="#17374b" stroke-width="1.4"/><path d="M22.5 6h5M22.5 10.5h3.5M22.5 15h5" stroke="#17374b" stroke-width="1.3" stroke-linecap="round"/><path d="M3 8l3-3 3 3M6 5v9" stroke="#e8704a" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
 if(k==='shrinkage')return `<svg ${s}><rect x="8" y="7" width="16" height="7" rx="1.2" fill="#e3d3a8" stroke="#8a7a5c" stroke-width="1.3"/><path d="M10 14v4h12v-4" fill="#9fc3d2" stroke="#2b5967" stroke-width="1.2"/><path d="M14 18v7h4v-7" fill="#9fc3d2" stroke="#2b5967" stroke-width="1.2"/><path d="M11 25.5h10" stroke="#2b5967" stroke-width="2.4" stroke-linecap="round"/><path d="M1.5 10.5h4.6M4 8l2.6 2.5L4 13M30.5 10.5h-4.6M28 8l-2.6 2.5L28 13" stroke="#c4502f" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
 return `<svg ${s}><circle cx="16" cy="13" r="9.5" fill="#eef6f8" stroke="#17374b" stroke-width="1.4"/><path d="M16 7.5V13l3.8 2.6" stroke="#17374b" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 25.5q13 7 26 0" stroke="#b66c16" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M26 23.5l3 2-3.4 1.4" stroke="#b66c16" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function slabSection(){return model.sections.find(s=>['girder','nebt'].includes(s.kind)&&s.composite&&s.composite.enabled)||null;}
function concreteModulus(c){const density=c.unit_weight*1000/9.81;return (3300*Math.sqrt(c.fc)+6900)*(density/2300)**1.5;}
function imposedStrainMicro(){const th=model.thermal;if(imposedKind()==='shrinkage')return th.shrinkage_micro??250;const s=slabSection();return s?(th.creep_phi??2)*(th.creep_stress??3)/concreteModulus(s.composite)*1e6:null;}
// Illustration: schematic section (slab + girder) and the imposed profile:
// temperature for the gradient, slab shortening for shrinkage and creep.
function imposedIllustration(kind=imposedKind()){
 const th=model.thermal,W=300,H=130,top=18,bot=114,slabBot=38,x0=kind==='thermal'?200:236,hasSlab=!!slabSection()||kind!=='thermal'||(th.profile||'linear')==='bilinear';
 let g=`<rect x="0" y="0" width="${W}" height="${H}" rx="8" fill="#f7fafb"/>`;
 // Section: slab, haunch, I-girder.
 const gTop=hasSlab?slabBot+4:top;
 if(hasSlab)g+=`<rect x="22" y="${top}" width="104" height="${slabBot-top}" fill="#e3d3a8" stroke="#8a7a5c" stroke-width="1.2"/><rect x="52" y="${slabBot}" width="44" height="4" fill="#e3d3a8" stroke="#8a7a5c" stroke-width="1"/>`;
 g+=illuGirder(illuSection(),gTop,bot);
 g+=`<line x1="${x0}" x2="${x0}" y1="${top-6}" y2="${bot+6}" stroke="#9db4c1"/><line x1="140" x2="${W-8}" y1="${top}" y2="${top}" stroke="#dce5eb" stroke-dasharray="3 3"/><line x1="140" x2="${W-8}" y1="${bot}" y2="${bot}" stroke="#dce5eb" stroke-dasharray="3 3"/>`;
 const lab=(x,y,txt,anchor,cls='')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="11" font-weight="700" class="${cls}">${txt}</text>`;
 if(kind==='thermal'){
  const bil=(th.profile||'linear')==='bilinear',dt=bil?(th.slab_delta_T??30):th.delta_T,s=Math.abs(dt)>1e-9?72/Math.abs(dt):0,hot=dt>=0?'#e8704a':'#5aa9cc',xt=x0+dt*s;
  const pts=bil?[[x0,top],[xt,top],[x0,slabBot],[x0,bot]]:[[x0,bot],[xt,top],[x0,top]];
  g+=`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="${hot}" fill-opacity=".22" stroke="${hot}" stroke-width="2" stroke-linejoin="round"/>`;
  g+=lab(xt,top-5,`${bil?'T₁':'ΔT'} = ${dt>0?'+':''}${fmt(dt,1)} °C`,dt>=0?'end':'start','imp-hot').replace('class="imp-hot"',`fill="${hot}"`);
  g+=`<text x="${x0+(dt>=0?-4:4)}" y="${bot-3}" font-size="10" fill="#566e7c" text-anchor="${dt>=0?'end':'start'}">0</text><text x="8" y="${H-3}" font-size="9" fill="#566e7c">${t(bil?'thermalBilinear':'thermalLinear')}</text>`;
 } else {
  const e=imposedStrainMicro()??0,s=e>0?72/Math.max(e,1):0,xe=x0-e*s;
  g+=`<rect x="${Math.min(xe,x0)}" y="${top}" width="${Math.abs(x0-xe)}" height="${slabBot-top}" fill="#c4502f" fill-opacity=".2" stroke="#c4502f" stroke-width="2"/>`;
  g+=`<text x="${xe-4}" y="${slabBot+16}" font-size="11" font-weight="700" fill="#c4502f" text-anchor="start">ε = −${fmt(e,0)} ×10⁻⁶</text>`;
  g+=`<path d="M8 ${(top+slabBot)/2}h10M14 ${(top+slabBot)/2-3}l4 3-4 3M140 ${(top+slabBot)/2}h-10M134 ${(top+slabBot)/2-3}l-4 3 4 3" stroke="#c4502f" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  g+=`<text x="8" y="${H-3}" font-size="9" fill="#566e7c">${t(kind==='creep'?'creepStrain':'slabShortening')}</text>`;
 }
 return `<svg id="imposed-illu" class="imposed-illu" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t(IMPOSED_KEYS[kind]))}">${g}</svg>`;
}
function imposedRefresh(){const svg=$('#imposed-illu');if(svg)svg.outerHTML=imposedIllustration();const e=$('#creep-strain');if(e){const v=imposedStrainMicro();e.textContent=v===null?'—':`${fmt(v,0)} ×10⁻⁶`;}}
function imposedInputs(){
 const th=model.thermal,cur=imposedKind(),slab=slabSection();
 let pick=`<div class="imposed-pick">${['thermal','shrinkage','creep'].map(k=>`<button type="button" data-imposed="${k}" class="${cur===k?'active':''}" aria-pressed="${cur===k}">${imposedIcon(k,30)}<span>${t(IMPOSED_KEYS[k])}</span></button>`).join('')}</div><p class="help">${t('imposedOne')}</p>`;
 let html=inputGroup('imp-case',t('imposedCase'),pick,true,t(IMPOSED_KEYS[cur]));
 const body=k=>{
  let b=`<div class="load-card imposed-card imposed-${k}${cur===k?' on':''}">`;
  if(cur===k)b+=imposedIllustration(k);
  if(k==='thermal'){const bil=(th.profile||'linear')==='bilinear';b+=select('thermalProfile','thermal.profile',th.profile||'linear',[['linear',t('thermalLinear')],['bilinear',t('thermalBilinear')]])+(bil?field('slabDeltaT','thermal.slab_delta_T',th.slab_delta_T??30,'',{min:-100,max:100})+`<p class="help">${t('thermalBilinearHelp')}</p>`:field('deltaT','thermal.delta_T',th.delta_T,'',{min:-100,max:100})+select('thermalDepthSource','thermal.depth_source',th.depth_source||'sections',[['sections',t('thermalDepthSections')],['manual',t('thermalDepthManual')]])+((th.depth_source||'sections')==='manual'?field('thermalDepth','thermal.depth',th.depth,'',{min:.1,max:15000}):`<p class="help">${t('thermalDepthInfo')}</p>`))+field('alpha','thermal.alpha_micro',th.alpha_micro,'',{min:.01,max:100})+`<p class="help">${t('thermalHelp')}</p>`;}
  else if(k==='shrinkage')b+=`<div class="field-row">${field('shrinkageMicro','thermal.shrinkage_micro',th.shrinkage_micro??250,'',{min:0,max:3000})}${field('modularFactor','thermal.modular_factor',th.modular_factor??3,'',{min:1,max:10})}</div><p class="help">${t('shrinkageHelp')} ${t('modularHelp')}</p>`;
  else{const v=imposedStrainMicro();b+=`<div class="field-row field-grid">${field('creepPhi','thermal.creep_phi',th.creep_phi??2,'',{min:0,max:10})}${field('creepStress','thermal.creep_stress',th.creep_stress??3,'',{min:0,max:60})}${field('modularFactor','thermal.modular_factor',th.modular_factor??3,'',{min:1,max:10})}<div class="field computed-field"><span>${t('creepStrain')}</span><output id="creep-strain">${v===null?'—':`${fmt(v,0)} ×10⁻⁶`}</output></div></div><p class="help">${t('creepHelp')} ${t('modularHelp')}</p><p class="help creep-source">${t('creepSource')}</p>`;}
  if(k!=='thermal'&&!slab)b+=`<p class="axle-warning">⚠ ${t('imposedNeedsSlab')}</p>`;
  if(cur!==k)b+=`<button type="button" class="add-button" data-imposed="${k}">${t('imposedAnalyse')}</button>`;
  return b+`</div>`;
 };
 const meta={thermal:`ΔT ${fmt((th.profile||'linear')==='bilinear'?(th.slab_delta_T??30):th.delta_T,1)} °C`,shrinkage:`${fmt(th.shrinkage_micro??250,0)} ×10⁻⁶`,creep:`φ ${fmt(th.creep_phi??2,1)} · σc ${fmt(th.creep_stress??3,1)} MPa`};
 ['thermal','shrinkage','creep'].forEach(k=>{html+=inputGroup('imp-'+k,`${imposedIcon(k,18)}${t(IMPOSED_KEYS[k])}${cur===k?` <span class="imposed-on">${t('imposedAnalysed')}</span>`:''}`,body(k),cur===k,meta[k]);});
 return html;
}
function imposedBeamBand(xp,total){
 const k=imposedKind(),th=model.thermal,x=xp(0),w=xp(total)-xp(0);
 if(k==='thermal'){const bil=(th.profile||'linear')==='bilinear',dt=bil?(th.slab_delta_T??30):th.delta_T;return `<rect x="${x}" y="19" width="${w}" height="25" rx="4" fill="url(#thermal-gradient)" opacity=".92"/><text x="${x+8}" y="29" font-size="9" fill="#17374b">${t('thermalTop')}</text><text x="${x+8}" y="41" font-size="9" fill="#17374b">${t('thermalBottom')}</text><text x="${xp(total)-8}" y="35" text-anchor="end" font-size="11" fill="#17374b">${bil?'T₁':'ΔT'} ${dt>0?'+':''}${fmt(dt,1)} °C</text>`;}
 const e=imposedStrainMicro(),label=`${t(IMPOSED_KEYS[k])} · ε ${e===null?'—':`−${fmt(e,0)}×10⁻⁶`}`;
 let g=`<rect x="${x}" y="47" width="${w}" height="13" rx="3" fill="#e3d3a8" opacity=".9"/><text x="${x+w/2}" y="40" text-anchor="middle" font-size="11" fill="#ffd4ad">${label}</text>`;
 const n=Math.max(2,Math.round(w/150));for(let i=0;i<n;i++){const a=x+w*(i+.5)/n;g+=`<path d="M${a-26} 53.5h16M${a-14} 50.5l4 3-4 3M${a+26} 53.5h-16M${a+14} 50.5l-4 3 4 3" stroke="#c4502f" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;}
 return g;
}
function imposedCaption(){
 const k=imposedKind(),th=model.thermal;
 let d;if(k==='thermal')d=`α ${fmt(th.alpha_micro,2)}×10⁻⁶/°C · ${(th.profile||'linear')==='bilinear'?`${t('thermalBilinear')} ${fmt(th.slab_delta_T??30,0)} °C`:(th.depth_source||'sections')==='manual'?`h ${fmt(th.depth,0)} mm`:t('thermalDepthShort')}`;
 else{const e=imposedStrainMicro();d=`${k==='creep'?`φ ${fmt(th.creep_phi??2,1)} · σc ${fmt(th.creep_stress??3,1)} MPa · `:''}ε ${e===null?'—':fmt(e,0)}×10⁻⁶ · ${fmt(th.modular_factor??3,1)}n`;}
 return `<span class="thermal-badge">${imposedIcon(k,16)}${t(IMPOSED_KEYS[k])} · ${d}</span>`;
}
// --- Section inset in the beam frame (bottom right, under the last span) -----
function sectionAtX(x){
 let start=0;
 for(let i=0;i<model.spans.length;i++){const s=model.spans[i];
  if(x<=start+s.length+1e-9||i===model.spans.length-1){const f=Math.min(1,Math.max(0,(x-start)/s.length));
   if(!model.nonprismatic||!s.zones.length)return model.sections[s.section]||model.sections[0];
   let prev=0;for(const z of s.zones){if(f<=z.end+1e-9){const a=model.sections[z.section]||model.sections[0],b=model.sections[z.end_section??z.section]||a;if(z.profile==='constant'||a===b)return a;const src=z.plates==='end'?b:z.plates==='deep'&&b.depth>a.depth?b:a,u=(f-prev)/Math.max(1e-9,z.end-prev),g=z.profile==='parabolic'?(a.depth>b.depth?1-(1-u)**2:u*u):u;return {...src,depth:a.depth*(1-g)+b.depth*g,taper:true};}prev=z.end;}
   return model.sections[s.zones.at(-1).section]||model.sections[0];}
  start+=s.length;}
 return model.sections[0];
}
let beamInsetX=null;
function beamInsetGeom(xp,total){
 // Under the last span, right of centre, below the girder (y ≥ 91). Compact
 // (drawing only) when the last span is short on screen.
 const right=xp(total)-24,last=xp(total-model.spans.at(-1).length),compact=right-last<130,W=compact?42:104;
 return {left:Math.max(last+16,right-W),W,compact};
}
function spanLabelX(i,starts,xp,total){
 const mid=xp((starts[i]+starts[i+1])/2);if(i!==model.spans.length-1)return mid;
 const g=beamInsetGeom(xp,total),a=xp(starts[i])+14;
 return mid+26>g.left&&(a+g.left)/2>a+14?(a+g.left)/2:mid;
}
function beamInsetContent(sec,x,compact){
 const W=compact?42:104,H=34,dw=compact?34:40,dh=26,dx=W-dw/2-4,top=4;
 let g=`<rect x="0" y="0" width="${W}" height="${H}" rx="5" fill="#0c2536" fill-opacity=".92" stroke="#3b6b7f"/>`;
 const name=esc(sec.name||'S'),depth=sectionDepth(sec);
 if(!compact)g+=`<text x="7" y="13" font-size="10" font-weight="700" fill="#a2f1d5">${t('sectionInset')} ${name}</text><text x="7" y="${x!==null?23:26}" font-size="9" fill="#bdced7">${sec.kind==='ei'?'EI':`h ${fmt(depth,0)} mm`}</text>${x!==null?`<text x="7" y="31.5" font-size="8" fill="#91acbb">x = ${fmt(x,1)} m</text>`:''}`;
 if(sec.kind==='ei'){g+=`<rect x="${dx-dw/2}" y="${top+3}" width="${dw}" height="${dh-6}" rx="2" fill="#2b5967" stroke="#73d8bd" stroke-width="1.2"/><text x="${dx}" y="${top+dh/2+4}" text-anchor="middle" font-size="11" font-weight="700" fill="#e8fff8">EI</text>`;return g;}
 const c=sec.composite&&sec.composite.enabled?sec.composite:null,slabH=c?c.slab_thickness+c.haunch:0,total=depth+slabH;
 const gw=sec.kind==='nebt'?1200:Math.max(sec.top_width,sec.bottom_width),bw=c?Math.min(c.effective_width,2.2*gw):gw,k=Math.min(dh/total,dw/Math.max(gw,bw)),y=v=>top+(dh-total*k)/2+(total-v)*k,X=v=>dx+v*k;
 if(c)g+=`<rect x="${X(-bw/2)}" y="${y(total)}" width="${bw*k}" height="${Math.max(1.5,c.slab_thickness*k)}" fill="#d9c592" fill-opacity=".85" stroke="#c9b37e" stroke-width=".8"/>`;
 if(c&&c.haunch>0){const fw=sec.kind==='nebt'?1200:sec.top_width;g+=`<rect x="${X(-fw/2)}" y="${y(depth+c.haunch)}" width="${fw*k}" height="${Math.max(1,c.haunch*k)}" fill="#d9c592" fill-opacity=".85" stroke="#c9b37e" stroke-width=".6"/>`;}
 if(sec.kind==='nebt'){const h=depth,R=[[600,0],[600,85],[90,135],[90,h-320],[405,h-100],[405,h]],pts=[...R,...R.slice().reverse().map(([u,v])=>[-u,v])].map(([u,v])=>`${X(u).toFixed(1)},${y(depth-v).toFixed(1)}`).join(' ');g+=`<polygon points="${pts}" fill="#2b5967" stroke="#73d8bd" stroke-width="1"/>`;}
 else{const tt=Math.max(1.6,sec.top_thickness*k),tb=Math.max(1.6,sec.bottom_thickness*k),tw=Math.max(1.2,sec.web_thickness*k),yt=y(depth),yb=y(0);g+=`<path d="M${X(-sec.top_width/2)} ${yt}h${sec.top_width*k}v${tt}H${dx+tw/2}V${yb-tb}H${X(sec.bottom_width/2)}v${tb}H${X(-sec.bottom_width/2)}v${-tb}H${dx-tw/2}V${yt+tt}H${X(-sec.top_width/2)}Z" fill="#2b5967" stroke="#73d8bd" stroke-width="1"/>`;}
 return g;
}
let beamInsetCompact=false;
function beamSectionInset(xp,total){
 const geo=beamInsetGeom(xp,total),x=beamInsetX;beamInsetCompact=geo.compact;
 return `<g id="beam-section" transform="translate(${geo.left.toFixed(1)} 92)"><title>${esc(t('sectionAtCursor'))}</title>${beamInsetContent(sectionAtX(x??(model.spans[0].length/2)),x,geo.compact)}</g>`;
}
function beamInsetUpdate(x){beamInsetX=x;const g=$('#beam-section');if(g&&model)g.innerHTML=`<title>${esc(t('sectionAtCursor'))}</title>`+beamInsetContent(sectionAtX(x??(model.spans[0].length/2)),x,beamInsetCompact);}
$('#charts')?.addEventListener('pointermove',e=>{const svg=e.target.closest?.('svg.plot,svg.il-plot,svg.stiffness-plot');if(!svg||!result||view==='modes')return;const r=svg.getBoundingClientRect();if(!r.width)return;const u=Math.max(0,Math.min(1,((e.clientX-r.left)/r.width*926-26)/874)),total=model.spans.reduce((v,s)=>v+s.length,0);beamInsetUpdate(u*total);});
$('#charts')?.addEventListener('pointerleave',()=>beamInsetUpdate(null));

// ---------------------------------------------------------------------------
// v0.9.8: section stiffness inputs (direct EI: EI, f'c → E and I, or E and I;
// NEBT: f'c → E), inertia from the composite section applied once, clearer
// error messages.
Object.assign(words.fr,{eiInput:'Définition de la rigidité',eiModeEI:'EI direct (kN·m²)',eiModeConcrete:'Béton : f′c et γc → E, puis I (m⁴)',eiModeModulus:'E (MPa) et I (m⁴)',fcConcrete:'f′c du béton (MPa)',gammaConcrete:'Poids volumique γc (kN/m³)',inertiaM4:'Inertie I (m⁴)',modulusMPa:'Module E (MPa)',modulusComputed:'E calculé (MPa)',nebtEInput:'Module E du béton',nebtEConcrete:'Calculé depuis f′c et γc',nebtEModulus:'Saisi directement (GPa)',nebtHelp:'Propriétés normalisées NEBT (aire, I, Yb). E = (3300 √f′c + 6900)(γc/2300)^1,5 avec γc en kg/m³ (f′c 50 MPa et 24,5 kN/m³ par défaut). γc donne aussi le poids propre (poids normalisé × γc / 24,5). Hauteur constante.',eiConcreteHelp:'E = (3300 √f′c + 6900)(γc/2300)^1,5, γc en kg/m³; EI = E · I. Aucun poids propre (aire inconnue).',inertiaSource:'Inertie utilisée par l’analyse',inertiaManual:'I de la poutre × M (saisi)',inertia1n:'Section mixte 1n · M automatique',inertia3n:'Section mixte 3n · M automatique',inertiaNeg:'I′ fissurée (acier + armatures) · M automatique',inertiaManualHelp:'EI = E · I poutre · M. Les propriétés mixtes de la fenêtre restent un affichage.',inertiaAutoHelp:'M = I mixte / I poutre, recalculé à chaque modification de la dalle : l’inertie mixte n’est appliquée qu’une fois (EI = E · I mixte). M est donc grisé.',autoShort:'auto',spOpenMain:'Propriétés de section',spOpenSub:'Poutre seule, dalle, sections mixtes 3n · 1n, classes',spOpenSubSlab:'Dalle définie · sections mixtes 3n · 1n · I′',numInvalid:'Valeur ou calcul invalide',numRange:'Plage admise :',sectionUsedBy:'Utilisée par une travée ou une zone : réaffectez-la avant de la supprimer.'});
Object.assign(words.en,{eiInput:'Stiffness input',eiModeEI:'EI directly (kN·m²)',eiModeConcrete:'Concrete: f′c and γc → E, then I (m⁴)',eiModeModulus:'E (MPa) and I (m⁴)',fcConcrete:'Concrete f′c (MPa)',gammaConcrete:'Unit weight γc (kN/m³)',inertiaM4:'Inertia I (m⁴)',modulusMPa:'Modulus E (MPa)',modulusComputed:'Computed E (MPa)',nebtEInput:'Concrete modulus E',nebtEConcrete:'Computed from f′c and γc',nebtEModulus:'Entered directly (GPa)',nebtHelp:'Standard NEBT properties (area, I, Yb). E = (3300 √f′c + 6900)(γc/2300)^1.5 with γc in kg/m³ (f′c 50 MPa and 24.5 kN/m³ by default). γc also gives the self-weight (standard weight × γc / 24.5). Constant depth.',eiConcreteHelp:'E = (3300 √f′c + 6900)(γc/2300)^1.5, γc in kg/m³; EI = E · I. No self-weight (unknown area).',inertiaSource:'Inertia used by the analysis',inertiaManual:'Girder I × M (entered)',inertia1n:'Composite 1n · automatic M',inertia3n:'Composite 3n · automatic M',inertiaNeg:'Cracked I′ (steel + bars) · automatic M',inertiaManualHelp:'EI = E · girder I · M. The composite properties of the window remain display only.',inertiaAutoHelp:'M = composite I / girder I, updated whenever the slab changes: the composite inertia is applied once only (EI = E · composite I). M is therefore greyed out.',autoShort:'auto',spOpenMain:'Section properties',spOpenSub:'Girder alone, slab, composite 3n · 1n, classes',spOpenSubSlab:'Slab defined · composite 3n · 1n · I′',numInvalid:'Invalid value or calculation',numRange:'Allowed range:',sectionUsedBy:'Used by a span or a zone: reassign it before removing it.'});
function sectionE(s){return (s.kind==='ei'||s.kind==='nebt')&&s.stiffness_input==='concrete'?concreteModulus({fc:s.fc??(s.kind==='nebt'?50:35),unit_weight:s.unit_weight??(s.kind==='nebt'?24.5:24)})/1000:s.E;}
function autoM(i){const s=model.sections[i],r=result?.model?.sections?.[i];return s&&r&&r.inertia_source===s.inertia_source&&JSON.stringify(r.composite)===JSON.stringify(s.composite)?r.inertia_modifier:null;}
function inertiaAuto(s){return ['girder','nebt'].includes(s.kind)&&!!s.composite?.enabled&&(s.inertia_source||'manual')!=='manual';}
function sectionM(s){if(inertiaAuto(s)){const m=autoM(model.sections.indexOf(s));if(m!==null)return m;}return s.inertia_modifier??1;}
function sectionEI(s){const mode=s.stiffness_input||'EI';return mode==='EI'?s.EI:sectionE(s)*1e6*(s.I_direct??.25);}
function syncSectionDerived(s){
 if(!s)return;if(s.kind==='nebt'&&(s.stiffness_input||'EI')==='EI')s.stiffness_input='concrete';
 if((s.kind==='ei'||s.kind==='nebt')&&s.stiffness_input==='concrete')s.E=Math.round(sectionE(s)*1e6)/1e6;
 if(s.kind==='ei'&&s.stiffness_input!=='EI')s.EI=s.E*1e6*(s.I_direct??.25);
}
function sectionInUse(i){return model.spans.some(s=>s.section===i||(model.nonprismatic&&s.zones.some(z=>z.section===i||(z.end_section??z.section)===i)));}
function computedE(s){return `<div class="field computed-field"><span>${t('modulusComputed')}</span><output>${fmt(sectionE(s)*1000,0)}</output></div>`;}
function sectionCard(s,i){
 const used=sectionInUse(i),props=['girder','nebt'].includes(s.kind),comp=props&&!!s.composite?.enabled,auto=inertiaAuto(s),m=auto?autoM(i):null;
 const mField=auto?`<label class="field"><span>${t('inertiaModifier')}</span><input class="m-auto" data-auto-m="${i}" disabled value="${m===null?t('autoShort'):esc(qbFmtInput(+m.toFixed(3)))}" title="${esc(t('inertiaAutoHelp'))}"></label>`:field('inertiaModifier',`sections.${i}.inertia_modifier`,s.inertia_modifier??1,'',{min:0.000001,max:1000});
 const inertiaSel=comp?`<div class="inertia-source${auto?' on':''}">${select('inertiaSource',`sections.${i}.inertia_source`,s.inertia_source||'manual',[['manual',t('inertiaManual')],['1n',t('inertia1n')],['3n',t('inertia3n')],['negative',t('inertiaNeg')]])}<p class="help">${t(auto?'inertiaAutoHelp':'inertiaManualHelp')}</p></div>`:'';
 const fc=k=>field('fcConcrete',`sections.${i}.fc`,s.fc??(k==='nebt'?50:35),'',{min:1,max:150}),gamma=k=>field('gammaConcrete',`sections.${i}.unit_weight`,s.unit_weight??(k==='nebt'?24.5:24),'',{min:10.01,max:40}),inertia=field('inertiaM4',`sections.${i}.I_direct`,s.I_direct??.25,'',{min:1e-9,max:1e6});
 let body='';
 if(s.kind==='ei'){
  const mode=s.stiffness_input||'EI';
  body+=select('eiInput',`sections.${i}.stiffness_input`,mode,[['EI',t('eiModeEI')],['concrete',t('eiModeConcrete')],['modulus',t('eiModeModulus')]]);
  if(mode==='EI')body+=field('directEI',`sections.${i}.EI`,s.EI,'',{min:0.000001,max:1e15});
  else if(mode==='concrete')body+=`<div class="field-row">${fc('ei')}${gamma('ei')}</div><div class="field-row">${inertia}${computedE(s)}</div><p class="help">${t('eiConcreteHelp')}</p>`;
  else body+=`<div class="field-row">${field('modulusMPa',`sections.${i}.E`,s.E,'',{min:100,max:1e6,scale:.001})}${inertia}</div>`;
 }else if(s.kind==='nebt'){
  const mode=s.stiffness_input==='modulus'?'modulus':'concrete';
  body+=select('nebtEInput',`sections.${i}.stiffness_input`,mode,[['concrete',t('nebtEConcrete')],['modulus',t('nebtEModulus')]]);
  body+=mode==='concrete'?`<div class="field-row">${fc('nebt')}${gamma('nebt')}</div><div class="field-row">${computedE(s)}${mField}</div>`:`<div class="field-row">${field('E',`sections.${i}.E`,s.E,'',{min:.1,max:1000})}${mField}</div><div class="field-row">${gamma('nebt')}</div>`;
  body+=inertiaSel+`<p class="help">${t('nebtHelp')}</p>`;
 }else body+=`<div class="field-row">${field('E',`sections.${i}.E`,s.E,'',{min:.1,max:1000})}${mField}</div>${inertiaSel}<div class="field-row dimensions">${['depth','web_thickness','top_width','top_thickness','bottom_width','bottom_thickness'].map(key=>field(key,`sections.${i}.${key}`,s[key],'',{min:.1,max:20000})).join('')}</div>`;
 const spBtn=props?`<button type="button" class="sp-open-main" data-section-props="${i}"><span class="sp-ico" aria-hidden="true">⌶</span><span class="sp-txt"><b>${t('spOpenMain')}</b><small>${t(comp?'spOpenSubSlab':'spOpenSub')}</small></span><span class="sp-go" aria-hidden="true">↗</span></button>`:'';
 return `<section class="section-card" data-sec="${i}"><div class="card-head"><input aria-label="${t('name')}" data-path="sections.${i}.name" value="${esc(s.name)}" maxlength="60"><button data-remove-section="${i}" class="icon-button" title="${esc(t(used?'sectionUsedBy':'remove'))}" aria-label="${esc(t('remove'))} ${esc(s.name)}" ${model.sections.length===1||used?'disabled':''}>×</button></div>${select('sectionType',`sections.${i}.kind`,s.kind||'girder',[['girder',t('girder')],['nebt',t('nebt')],['ei',t('directEI')]])}${s.kind==='nebt'?select('nebtType',`sections.${i}.nebt`,s.nebt||'NEBT1400',Object.keys(NEBT_DATA).map(k=>[k,`${k.replace('NEBT','NEBT ')} · h ${NEBT_DATA[k].h} mm`])):''}${sectionSvg(s)}<div class="section-props">${sectionPropsHtml(s)}</div>${spBtn}${body}</section>`;
}
function refreshAutoM(){
 $$('input[data-auto-m]').forEach(el=>{const m=autoM(Number(el.dataset.autoM));el.value=m===null?t('autoShort'):qbFmtInput(+m.toFixed(3));});
 if(inputPanel==='sections')$$("#input-content [data-sec]").forEach(card=>{const s=model.sections[Number(card.dataset.sec)],box=card.querySelector(".section-props");if(s&&box)box.innerHTML=sectionPropsHtml(s);});
}
let errorTimer=null;
function showError(message,transient=false){const box=$('#error');box.textContent=message;box.classList.remove('hidden');clearTimeout(errorTimer);if(transient)errorTimer=setTimeout(()=>box.classList.add('hidden'),6000);}
$('#error')?.addEventListener('click',e=>{if(!e.target.closest('button'))$('#error').classList.add('hidden');});

// v0.9.8: project bar — model name in evidence, "File" menu (open, save,
// compare, Excel) and "Examples" menu of ready-made bridges.
Object.assign(words.fr,{modelName:'Nom du modèle',fileMenu:'Fichier',openProjectSub:'Projet QuickerBridge (.json)',saveProjectSub:'Télécharge le projet (.json)',compareSub:'Superposer un autre projet',excelExport:'Exporter Excel',excelSub:'Enveloppes, cas, réactions (.xlsx)',examplesMenu:'Exemples',examplesHead:'Charger un exemple',examplesNote:'Remplace le modèle courant (FT non appliqué).','model.split_end':'Un appui dédoublé doit être une pile intérieure.'});
Object.assign(words.en,{modelName:'Model name',fileMenu:'File',openProjectSub:'QuickerBridge project (.json)',saveProjectSub:'Downloads the project (.json)',compareSub:'Overlay another project',excelExport:'Export to Excel',excelSub:'Envelopes, cases, reactions (.xlsx)',examplesMenu:'Examples',examplesHead:'Load an example',examplesNote:'Replaces the current model (FT not applied).','model.split_end':'A split support must be an interior pier.'});
function closeMenus(except=null){$$('.qb-menu.open').forEach(m=>{if(m!==except){m.classList.remove('open');m.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded','false');}});}
function renderExamplesMenu(){
 const box=$('#examples-list');if(!box)return;const list=window.QB_EXAMPLES||[];
 box.innerHTML=`<div class="menu-head">${t('examplesHead')}</div>`+list.map(ex=>`<button type="button" role="menuitem" data-example="${esc(ex.id)}"><span class="ex-dot" aria-hidden="true"></span><span class="mi-text"><b>${esc(ex.name[lang]||ex.name.fr)}</b></span></button>`).join('')+`<div class="menu-foot">${t('examplesNote')}</div>`;
}
async function loadExample(id){
 const ex=(window.QB_EXAMPLES||[]).find(e=>e.id===id);if(!ex)return;
 let project={format:'QuickerBridgeProject',schema_version:QB_META.schema||12,app_version:QB_META.version,name:ex.name[lang]||ex.name.fr,saved_at:new Date().toISOString(),model:clone(ex.model)};
 if(engineReady){try{project=await solver.request('validate_project',{text:JSON.stringify(project)});}catch(e){console.error(e);showError(t('projectInvalid'),true);return;}}
 pendingProject=project;
 if(updateProjectState())$('#replace-dialog').showModal();else{pendingProject=null;applyProject(project);}
}
document.addEventListener('click',e=>{
 const toggle=e.target.closest('[data-menu-toggle]');
 if(toggle){const menu=toggle.closest('.qb-menu'),open=!menu.classList.contains('open');closeMenus(menu);menu.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));if(open&&menu.querySelector('#examples-list'))renderExamplesMenu();return;}
 const ex=e.target.closest('[data-example]');if(ex){closeMenus();loadExample(ex.dataset.example);return;}
 if(e.target.closest('.menu-pop button'))setTimeout(closeMenus,0);
 else if(!e.target.closest('.qb-menu'))closeMenus();
},true);
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&$('.qb-menu.open')){closeMenus();return;}
 if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&model){const k=e.key.toLowerCase();if(k==='s'){e.preventDefault();saveProject();}else if(k==='o'){e.preventDefault();$('#project-file').click();}}
});
function updateStructureName(){const el=$('#structure-name');if(el)el.textContent=projectName||t('untitled');}

// v0.9.8: split support (pier with two bearing lines and a deck joint).
Object.assign(words.fr,{splitSupport:'Pile dédoublée (joint, 2 appuis)',splitHelp:'Pile dédoublée : le tablier est interrompu (joint) et chaque côté repose sur son propre appareil d’appui. Les travées de part et d’autre sont indépendantes; deux réactions distinctes (g = gauche, d = droite) apparaissent au diagramme des réactions.',splitLeftShort:'g',splitRightShort:'d'});
Object.assign(words.en,{splitSupport:'Split pier (joint, 2 bearings)',splitHelp:'Split pier: the deck is interrupted (joint) and each side rests on its own bearing. The spans on either side are independent; two distinct reactions (L = left, R = right) appear in the reaction diagram.',splitLeftShort:'L',splitRightShort:'R'});
// R left = −V(x⁻) (end of the left deck), R right = V(x⁺) (start of the right deck).
function splitReactionItems(r,i,thermal,live,delta){
 const a=r.split.left,b=r.split.right,out=[];
 const sv=live&&snap?(snap.V||snap.plot?.V):null;
 [['left',a,-1],['right',b,1]].forEach(([side,k,sg])=>{
  let o;
  if(thermal){const v=sg*result.values.V[k];o={lo:v,hi:v,single:true};}
  else if(live&&sv){const v=sg*sv[k];o={lo:v,hi:v,single:true};}
  else if(delta){const d=result.max.V[k]-result.min.V[k];o={lo:d,hi:d,single:true};}
  else{const lo=sg>0?result.min.V[k]:-result.max.V[k],hi=sg>0?result.max.V[k]:-result.min.V[k];o={lo,hi,single:Math.abs(hi-lo)<1e-4,crit:sg>0?{max:[k,'max'],min:[k,'min']}:{max:[k,'min'],min:[k,'max']}};}
  out.push({r,i,fixed:false,side,...o});
 });
 return out;
}
// Section names along the girder of the beam frame: one label per zone,
// "S1→S2" in a taper, a tick at each zone boundary.
function beamZoneLabels(s,i,zones,starts,xp){
 let g='',previous=0;const L=s.length;
 zones.forEach((z,j)=>{
  const a=model.sections[z.section]||model.sections[0],b=model.sections[z.end_section??z.section]||a,xa=xp(starts[i]+L*previous),xb=xp(starts[i]+L*z.end);
  if(j>0)g+=`<line x1="${xa}" x2="${xa}" y1="66" y2="86" stroke="#a2f1d5" stroke-width=".8" stroke-dasharray="2 2" opacity=".8"/>`;
  let label=z.profile==='constant'||a===b?a.name:`${a.name}→${b.name}`;if(s.simple&&zones.length===1)label=`${t('simpleSpan')} · ${label}`;
  const w=label.length*5.6+8;
  if(xb-xa>w)g+=`<text class="zone-label${s.simple?' simple':''}" x="${(xa+xb)/2}" y="77" text-anchor="middle">${esc(label)}</text>`;
  else if(s.simple&&j===0&&xp(starts[i+1])-xa>t('simpleSpan').length*5.6)g+=`<text class="zone-label simple" x="${(xp(starts[i])+xp(starts[i+1]))/2}" y="77" text-anchor="middle">${t('simpleSpan')}</text>`;
  previous=z.end;
 });
 return g;
}

// v0.9.8: the imposed-deformation illustration draws the actual girder type.
Object.assign(words.fr,{creepPhi:'Coefficient de fluage φ',creepStress:'Compression permanente σc (MPa)',modularFactor:'Section long terme k·n : k',creepStrain:'ε_cr = φ σc / Ec',creepSource:'Origine : fluage linéaire, la déformation différée vaut φ fois la déformation élastique sous la même contrainte, ε_cr = φ · σc / Ec (base de la méthode du module effectif, p. ex. Ghali, Favre et Elbadry, Concrete Structures: Stresses and Deformations). Le raccourcissement est ensuite retenu par la poutre comme le retrait (même courbure libre sur la section k·n). Simplifications : σc constante saisie, sans module ajusté (relaxation) ni historique de chargement.'});
Object.assign(words.en,{creepPhi:'Creep coefficient φ',creepStress:'Sustained compression σc (MPa)',modularFactor:'Long-term section k·n: k',creepStrain:'ε_cr = φ σc / Ec',creepSource:'Origin: linear creep, the delayed strain is φ times the elastic strain under the same stress, ε_cr = φ · σc / Ec (basis of the effective-modulus method, e.g. Ghali, Favre and Elbadry, Concrete Structures: Stresses and Deformations). The shortening is then restrained by the girder like shrinkage (same free curvature on the k·n section). Simplifications: constant entered σc, no age-adjusted modulus (relaxation) nor loading history.'});
function illuSection(){return slabSection()||model.sections[model.spans[0]?.section]||model.sections[0];}
function illuGirder(s,gTop,bot){
 if(s?.kind==='ei')return `<rect x="56" y="${gTop}" width="36" height="${bot-gTop}" rx="3" fill="#cfe7e6" stroke="#007f78" stroke-width="1.3"/><text x="74" y="${(gTop+bot)/2+4}" text-anchor="middle" font-size="12" font-weight="700" fill="#007f78">EI</text>`;
 if(s?.kind==='nebt'){const h=(NEBT_DATA[s.nebt]||NEBT_DATA.NEBT1400).h,sx=52/1200,sy=(bot-gTop)/h,r=[[600,h],[600,h-90],[90,h-230],[90,330],[405,180],[405,0]],pts=[...r,...r.slice().reverse().map(([x,y])=>[-x,y])].map(([x,y])=>`${(74+x*sx).toFixed(1)},${(bot-y*sy).toFixed(1)}`).join(' ');return `<polygon points="${pts}" fill="#e6e1d6" stroke="#8a7a5c" stroke-width="1.3"/>`;}
 return `<path d="M52 ${gTop}h44v5H76v${bot-gTop-11}h24v6H48v-6h24V${gTop+5}H52Z" fill="#cfe7e6" stroke="#007f78" stroke-width="1.3"/>`;
}
Object.assign(words.fr,{splitNotes:'Pile dédoublée',splitBody:'Une pile dédoublée porte un joint de tablier : les deux éléments qui y aboutissent sont rotulés sur le nœud (relâchements de moment PyCBA), dont la rotation est bloquée pour garder le système régulier; aucun moment n’y est transmis. Les deux côtés sont donc indépendants. La réaction de gauche vaut −V juste à gauche de l’appui, celle de droite V juste à droite; leurs enveloppes sont celles de ces efforts tranchants (mêmes facteurs). Les deux appareils sont placés sur le même axe (sans entraxe).'});
Object.assign(words.en,{splitNotes:'Split pier',splitBody:'A split pier carries a deck joint: both members meeting there are hinged on the node (PyCBA moment releases), whose rotation is restrained to keep the system regular; no moment is transmitted. Both sides are therefore independent. The left reaction is −V just left of the support, the right one V just right of it; their envelopes are those of these shears (same factors). Both bearings are on the same axis (no spacing).'});

// v0.9.9: work protection. Reset asks first when the model has unsaved
// changes, leaving the page warns, the unsaved model is kept in this browser
// and offered back at the next start, and Ctrl+Z / Ctrl+Y walk the history of
// model states (file opens and resets included).
Object.assign(words.fr,{resetTitle:'Réinitialiser le modèle?',resetBody:'Le modèle actuel a des modifications non enregistrées. Il sera remplacé par le pont par défaut (Ctrl+Z permet de revenir en arrière).',saveThenReset:'Enregistrer puis réinitialiser',discardReset:'Réinitialiser sans enregistrer',restoreFound:'Modèle non enregistré retrouvé',restoreFrom:'dernière modification',restoreDo:'Restaurer',restoreIgnore:'Ignorer',restoreFailed:'Le modèle retrouvé n’a pas pu être restauré : il ne correspond plus au format de cette version.',undone:'Modification annulée',redone:'Modification rétablie',nothingUndo:'Rien à annuler',nothingRedo:'Rien à rétablir',undoMenu:'Annuler',undoMenuSub:'Revenir à l’état précédent du modèle',excelWaitEngine:'Disponible quand le moteur de calcul est prêt',excelWaitCalc:'Disponible à la fin du calcul',excelWaitInvalid:'Corrigez d’abord les valeurs invalides'});
Object.assign(words.en,{resetTitle:'Reset the model?',resetBody:'The current model has unsaved changes. It will be replaced by the default bridge (Ctrl+Z brings it back).',saveThenReset:'Save then reset',discardReset:'Reset without saving',restoreFound:'Unsaved model found',restoreFrom:'last change',restoreDo:'Restore',restoreIgnore:'Dismiss',restoreFailed:'The model found could not be restored: it no longer matches this version’s format.',undone:'Change undone',redone:'Change redone',nothingUndo:'Nothing to undo',nothingRedo:'Nothing to redo',undoMenu:'Undo',undoMenuSub:'Back to the previous model state',excelWaitEngine:'Available when the calculation engine is ready',excelWaitCalc:'Available when the calculation ends',excelWaitInvalid:'Fix the invalid values first'});

// --- Reset through the unsaved-changes dialog --------------------------------
function qbReplaceKind(kind){
 const d=$('#replace-dialog');if(!d)return;const reset=kind==='reset';d.dataset.kind=kind;
 d.querySelector('h2').textContent=t(reset?'resetTitle':'unsavedTitle');d.querySelector('p').textContent=t(reset?'resetBody':'unsavedBody');
 d.querySelector('button[value="discard"]').textContent=t(reset?'discardReset':'discard');d.querySelector('button[value="save"]').textContent=t(reset?'saveThenReset':'saveThenOpen');
}
function qbDoReset(){
 model=clone(defaultModel);if(lang==='fr')model.dead[0].name=t('permanentName');projectName=t('untitled');
 savedModel=modelText();savedProjectName=projectName;
 $$('[data-mode]').forEach(el=>el.classList.toggle('active',el.dataset.mode===model.load_mode));renderInputs();changed();
}
function qbAskReset(){
 if(!model||!defaultModel)return;
 if(updateProjectState()){pendingProject={qbReset:true};qbReplaceKind('reset');$('#replace-dialog').showModal();}
 else qbDoReset();
}
addEventListener('beforeunload',e=>{if(model&&updateProjectState()){e.preventDefault();e.returnValue='';}});

// --- Undo / redo ---------------------------------------------------------------
const qbHist={undo:[],redo:[],last:null,at:0,coalesce:false,applying:false};
function qbTrack(){
 if(!model||qbHist.applying)return;const now=modelText();
 if(qbHist.last===null){qbHist.last=now;return;}
 if(now===qbHist.last)return;
 // Keystrokes in one field within 0.8 s count as one change.
 const t0=Date.now(),typing=document.activeElement?.tagName==='INPUT'&&!['checkbox','radio'].includes(document.activeElement.type);
 if(!(typing&&qbHist.coalesce&&qbHist.undo.length&&t0-qbHist.at<800))qbHist.undo.push(qbHist.last);
 if(qbHist.undo.length>100)qbHist.undo.shift();
 qbHist.redo.length=0;qbHist.last=now;qbHist.at=t0;qbHist.coalesce=typing;
}
function qbHistGo(dir){
 const from=dir<0?qbHist.undo:qbHist.redo,to=dir<0?qbHist.redo:qbHist.undo;
 if(!from.length){$('#status').textContent=t(dir<0?'nothingUndo':'nothingRedo');return;}
 to.push(modelText());const text=from.pop();
 qbHist.applying=true;
 try{model=JSON.parse(text);qbHist.last=text;qbHist.coalesce=false;
  $$('[data-mode]').forEach(el=>el.classList.toggle('active',el.dataset.mode===model.load_mode));renderInputs();changed();}
 finally{qbHist.applying=false;}
 if($('#status').classList.contains('busy'))$('#status').textContent=`${t(dir<0?'undone':'redone')} · ${t(engineReady?'solving':'solvingAfterBoot')}`;
}
document.addEventListener('keydown',e=>{
 if(!(e.ctrlKey||e.metaKey)||e.altKey||!model)return;const k=e.key.toLowerCase();
 if(k!=='z'&&k!=='y')return;
 // Inside a text field the browser's own undo applies to the typed text.
 const a=document.activeElement;if(a&&(a.tagName==='TEXTAREA'||(a.tagName==='INPUT'&&!['checkbox','radio','range','button'].includes(a.type))))return;
 if($('dialog[open]:not(.qb-float)'))return;
 e.preventDefault();qbHistGo(k==='y'||e.shiftKey?1:-1);
});

// --- Autosave in this browser and restore at the next start ------------------
const QB_AUTOSAVE='qb-autosave-v1';let qbAutoTimer=0,qbAutoArmed=false,qbAutoFound=null;
function qbStore(fn){try{return fn(localStorage)}catch(e){return null}}
function qbAutosave(dirty){
 if(!qbAutoArmed||!model)return;clearTimeout(qbAutoTimer);
 qbAutoTimer=setTimeout(()=>qbStore(ls=>{
  if(!dirty){ls.removeItem(QB_AUTOSAVE);return;}
  ls.setItem(QB_AUTOSAVE,JSON.stringify({version:QB_META.version,schema:QB_META.schema,at:new Date().toISOString(),name:projectName,saved:savedModel,savedName:savedProjectName,model}));
 }),400);
}
function qbRestoreBar(entry){
 let bar=$('#restore-bar');
 if(!entry){bar?.remove();return;}
 if(!bar){bar=document.createElement('div');bar.id='restore-bar';bar.setAttribute('role','status');$('.project-bar')?.after(bar);}
 let when='';try{when=new Intl.DateTimeFormat(lang==='fr'?'fr-CA':'en-CA',{dateStyle:'medium',timeStyle:'short'}).format(new Date(entry.at));}catch(e){}
 bar.innerHTML=`<div class="rb-text"><b>${esc(t('restoreFound'))}</b><small>${esc(entry.name||t('untitled'))}${when?` · ${esc(t('restoreFrom'))} ${esc(when)}`:''}</small></div><div class="rb-actions"><button type="button" class="text-button" data-restore="ignore">${esc(t('restoreIgnore'))}</button><button type="button" class="primary" data-restore="do">${esc(t('restoreDo'))}</button></div>`;
}
async function qbRestore(){
 const entry=qbAutoFound;qbAutoFound=null;qbRestoreBar(null);if(!entry)return;
 try{
  await solver.ready;
  const project=await solver.request('validate_project',{text:JSON.stringify({format:'QuickerBridgeProject',schema_version:entry.schema||QB_META.schema,app_version:entry.version,name:entry.name||t('untitled'),saved_at:entry.at,model:entry.model})});
  applyProject(project);
  // Still unsaved: compare with the model as it was last saved, not with itself.
  savedModel=entry.version===QB_META.version&&typeof entry.saved==='string'?entry.saved:'';savedProjectName=entry.savedName??savedProjectName;
  qbAutoArmed=true;updateProjectState();
 }catch(e){console.error(e);qbAutoArmed=true;showError(t('restoreFailed'),true);}
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-restore]');if(!b)return;
 if(b.dataset.restore==='do')qbRestore();else{qbAutoFound=null;qbRestoreBar(null);qbAutoArmed=true;qbStore(ls=>ls.removeItem(QB_AUTOSAVE));}
});
{
 const raw=qbStore(ls=>ls.getItem(QB_AUTOSAVE));let entry=null;try{entry=raw?JSON.parse(raw):null;}catch(e){}
 if(entry&&entry.model)qbAutoFound=entry;else qbAutoArmed=true;
}
document.addEventListener('DOMContentLoaded',()=>{if(qbAutoFound)qbRestoreBar(qbAutoFound);},{once:true});

// updateProjectState is the one place every model change passes through.
const qbUpdateProjectState0=updateProjectState;
updateProjectState=function(){
 const dirty=qbUpdateProjectState0();qbTrack();
 // Editing on while the restore offer is pending declines it.
 if(dirty&&qbAutoFound&&qbHist.undo.length){qbAutoFound=null;qbRestoreBar(null);qbAutoArmed=true;}
 qbAutosave(dirty);return dirty;
};

// --- Inline message under an invalid number field ------------------------------
function qbTip(el){
 let tip=$('#qb-num-tip');
 const show=el&&el===document.activeElement&&el.classList.contains('num-err')&&el.validationMessage;
 if(!show){if(el)el.removeAttribute('aria-describedby');if(tip&&(!el||el===document.activeElement))tip.hidden=true;return;}
 if(!tip){tip=document.createElement('div');tip.id='qb-num-tip';tip.setAttribute('role','alert');}
 const dlg=el.closest('dialog')||document.body;if(tip.parentNode!==dlg)dlg.append(tip);
 tip.textContent=el.validationMessage;tip.hidden=false;el.setAttribute('aria-describedby','qb-num-tip');
 const r=el.getBoundingClientRect(),w=Math.min(300,innerWidth-16);tip.style.maxWidth=`${w}px`;
 tip.style.left=`${Math.max(8,Math.min(r.left,innerWidth-w-8))}px`;tip.style.top=`${r.bottom+5}px`;
}
document.addEventListener('focusin',e=>{if(e.target.classList?.contains('qb-num'))qbTip(e.target);});
document.addEventListener('focusout',e=>{const tip=$('#qb-num-tip');if(tip&&e.target.classList?.contains('qb-num'))tip.hidden=true;});
addEventListener('scroll',()=>{const a=document.activeElement;if(a?.classList?.contains('qb-num'))qbTip(a);},true);

// --- Why Excel export is unavailable -----------------------------------------
function qbExcelHint(){
 const b=$('#excel');if(!b)return;const small=b.querySelector('.mi-text small');if(!small)return;
 small.removeAttribute('data-i18n');
 const invalid=$$('input[data-path].qb-num,input[data-path][type="number"]').some(el=>!el.validity.valid||el.value==='');
 small.textContent=!b.disabled?t('excelSub'):!engineReady?t('excelWaitEngine'):invalid?t('excelWaitInvalid'):t('excelWaitCalc');
 b.classList.toggle('mi-waiting',b.disabled);
}
document.addEventListener('DOMContentLoaded',()=>{
 const b=$('#excel');if(b){new MutationObserver(qbExcelHint).observe(b,{attributes:true,attributeFilter:['disabled']});qbExcelHint();}
 // An Undo entry in the File menu makes the shortcut discoverable.
 const save=$('#save-project');if(save&&!$('#undo-model'))save.insertAdjacentHTML('afterend',`<button type="button" id="undo-model" role="menuitem"><svg class="mi-ico" viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 5L4 8.5 7.5 12 M4.5 8.5h7a4 4 0 010 8H8.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="mi-text"><b data-i18n="undoMenu">${esc(t('undoMenu'))}</b><small data-i18n="undoMenuSub">${esc(t('undoMenuSub'))}</small></span><kbd>Ctrl Z</kbd></button>`);
},{once:true});
document.addEventListener('click',e=>{if(e.target.closest('#undo-model'))qbHistGo(-1);});
Object.assign(words.fr,{staticAnalysis:'Statique',analysisType:'Type d’analyse',loadCase:'Cas de charge'});
Object.assign(words.en,{staticAnalysis:'Static',analysisType:'Analysis type',loadCase:'Load case'});
const qbTranslate0=translate;
translate=function(){qbTranslate0();qbExcelHint();$('#analysis-type')?.setAttribute('aria-label',t('analysisType'));$('#load-mode')?.setAttribute('aria-label',t('loadCase'));const d=$('#replace-dialog');if(d?.dataset.kind)qbReplaceKind(d.dataset.kind);if(qbAutoFound)qbRestoreBar(qbAutoFound);};

// v0.9.95 (feedback 0.9.9): rounded headline values, peak labels per part.
Object.assign(words.fr,{deltaTab:'Écarts Δ',panelHide:'Réduire le panneau du modèle',panelShow:'Afficher le panneau du modèle',caseBand:'Cas d’analyse'});
Object.assign(words.en,{deltaTab:'Δ ranges',panelHide:'Collapse the model panel',panelShow:'Show the model panel',caseBand:'Analysis case'});
// Rounded up in magnitude: 5 675,4 → 5 676; −6 405,9 → −6 406; 243,89 → 243,9.
function qbCeil(v,dec=0){const p=10**dec,a=Math.abs(v)*p;return Math.sign(v)*Math.ceil(a-1e-9*Math.max(1,a))/p;}
// Independent parts of the bridge: a simple span or a split pier ends a continuous chain.
function qbParts(){
 if(!model)return [];let starts=[0];model.spans.forEach(s=>starts.push(starts.at(-1)+s.length));
 const cuts=new Set();model.spans.forEach((s,i)=>{if(s.simple){cuts.add(i);cuts.add(i+1);}});
 model.supports.forEach((s,i)=>{if(s==='split')cuts.add(i);});
 const nodes=[...cuts].filter(i=>i>0&&i<model.spans.length).sort((a,b)=>a-b);let a=0;const parts=[];
 nodes.forEach(i=>{parts.push([starts[a],starts[i]]);a=i;});parts.push([starts[a],starts.at(-1)]);return parts;
}
// Stations labelled on a curve: the extreme of each independent part, plus
// every other peak within 0.5 % of the overall extreme (symmetry at a glance).
// v0.9.96: a plateau (constant shear of an imposed deformation…) is one peak,
// labelled once at its middle.
function qbPeaks(v,xs,sense){
 const better=(a,b)=>sense>0?a>b:a<b,total=xs.at(-1)||1,picked=[];
 const far=k=>picked.every(j=>Math.abs(xs[j]-xs[k])>total*.03);
 let g=0;v.forEach((x,i)=>{if(better(x,v[g]))g=i;});
 const ref=Math.abs(v[g]),tol=Math.max(ref*1e-7,1e-9),same=(a,b)=>Math.abs(a-b)<=tol;
 const run=k=>{let i=k,j=k;while(i>0&&same(v[i-1],v[k]))i--;while(j<v.length-1&&same(v[j+1],v[k]))j++;return [i,j];};
 const centre=k=>{const [i,j]=run(k);if(i===j)return k;const mid=(xs[i]+xs[j])/2;let c=i;for(let n=i;n<=j;n++)if(Math.abs(xs[n]-mid)<Math.abs(xs[c]-mid))c=n;return c;};
 qbParts().forEach(([x0,x1])=>{let k=-1;xs.forEach((x,i)=>{if(x>=x0-1e-9&&x<=x1+1e-9&&(k<0||better(v[i],v[k])))k=i;});if(k>=0){k=centre(k);if(far(k))picked.push(k);}});
 if(ref>0)for(let i=0;i<v.length;){
  const [a,b]=run(i),x=v[i];
  const local=(a===0||!better(v[a-1],x))&&(b===v.length-1||!better(v[b+1],x));
  if(local&&Math.sign(x)===Math.sign(v[g])&&Math.abs(x)>=ref*.995){const c=centre(i);if(far(c))picked.push(c);}
  i=b+1;
 }
 return picked;
}
// v0.9.96: moments are always labelled span by span (M+ max of every span)
// and pier by pier (M− at every interior support), continuous or not.
function qbSpanPierPeaks(hi,lo,xs){
 if(!model)return [];const starts=[0];model.spans.forEach(s=>starts.push(starts.at(-1)+s.length));
 const out=[];
 for(let n=0;n<model.spans.length;n++){let k=-1;xs.forEach((x,i)=>{if(x>=starts[n]-1e-9&&x<=starts[n+1]+1e-9&&(k<0||hi[i]>hi[k]))k=i;});if(k>=0&&hi[k]>0)out.push([hi,k]);}
 for(let n=1;n<model.spans.length;n++){if(!lo)break;const w0=starts[n]-.2*model.spans[n-1].length,w1=starts[n]+.2*model.spans[n].length;let k=-1;xs.forEach((x,i)=>{if(x>=w0&&x<=w1&&(k<0||lo[i]<lo[k]))k=i;});if(k>=0&&lo[k]<0)out.push([lo,k]);}
 return out;
}
// Labels of one diagram: [values, station] pairs.
function qbLabelPoints(key,hi,lo,xs){
 const pts=[...qbPeaks(hi,xs,1).map(k=>[hi,k]),...qbPeaks(lo,xs,-1).map(k=>[lo,k])];
 return key==='M'?[...qbSpanPierPeaks(hi,lo,xs),...pts]:pts;
}
// Δ ranges: the same labels on the range (moments: largest Δ of every span and Δ at every pier).
function qbDeltaPoints(key,d,xs){
 if(key!=='M'||!model)return qbPeaks(d,xs,1);
 const starts=[0];model.spans.forEach(s=>starts.push(starts.at(-1)+s.length));const out=[];
 for(let n=0;n<model.spans.length;n++){let k=-1;xs.forEach((x,i)=>{if(x>starts[n]+1e-9&&x<starts[n+1]-1e-9&&(k<0||d[i]>d[k]))k=i;});if(k>=0)out.push(k);}
 for(let n=1;n<model.spans.length;n++){let k=-1;xs.forEach((x,i)=>{if(Math.abs(x-starts[n])<1e-6&&(k<0||d[i]>d[k]))k=i;});if(k>=0)out.push(k);}
 return out;
}
// The collapse arrow and the band carry names in the current language.
{const tr=translate;translate=function(){const r=tr.apply(this,arguments);const b=$('#panel-toggle');if(b){const c=document.body.classList.contains('focus-results');b.setAttribute('aria-label',t(c?'panelShow':'panelHide'));b.title=t(c?'panelShow':'panelHide');}$('#case-band')?.setAttribute('aria-label',t('caseBand'));$('#load-mode')?.setAttribute('aria-label',t('loadCase'));return r;};}

// Text in a series colour: darker inks that pass AA on white (strokes keep the hue).
const QB_INK={'#407dcc':'#3567ad','#9d762e':'#81601f','#8f7fc4':'#6d5aa8','#a99bd8':'#7f6fbd','#6b4aa5':'#5f4699','#7a5bb5':'#6d5aa8','#b5577a':'#9c4466'};
function qbInk(c){return QB_INK[String(c).toLowerCase()]||c;}

// ---- Impeccable harden (0.9.95): keyboard and assistive technology --------
Object.assign(words.fr,{close:'Fermer',chartKeys:'Flèches gauche et droite : station; Maj : 10 stations; Entrée : cas gouvernant',ftPerGirder:'FT S6-25 appliqué : valeurs par poutre',collapseMobile:'Réduire ou afficher les données'});
Object.assign(words.en,{close:'Close',chartKeys:'Left and right arrows: station; Shift: 10 stations; Enter: governing case',ftPerGirder:'S6-25 FT applied: values per girder',collapseMobile:'Collapse or show the inputs'});
// Selected state follows the visual state: aria-pressed on segmented buttons,
// aria-selected and a roving tab stop on tabs.
function qbSyncAria(){
 $$('#load-mode button,#display-mode button').forEach(b=>b.setAttribute('aria-pressed',String(b.classList.contains('active'))));
 $$('.input-tabs,.view-tabs').forEach(list=>{const tabs=[...list.querySelectorAll('button')];const any=tabs.some(b=>b.classList.contains('active'));tabs.forEach((b,i)=>{const on=b.classList.contains('active')||(!any&&i===0);b.setAttribute('role','tab');b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;});});
 $$('.view-tabs button').forEach(b=>b.setAttribute('aria-controls',`${b.dataset.view}-view`));
 $$('.input-tabs button').forEach(b=>b.setAttribute('aria-controls','input-content'));
}
document.addEventListener('DOMContentLoaded',()=>{
 qbSyncAria();
 const mo=new MutationObserver(qbSyncAria);$$('#load-mode,#display-mode,.input-tabs,.view-tabs').forEach(el=>mo.observe(el,{subtree:true,attributes:true,attributeFilter:['class']}));
 const live=document.createElement('div');live.id='qb-readout';live.className='sr-only';live.setAttribute('aria-live','polite');document.body.append(live);
 const ci=$('#collapse-inputs');if(ci)ci.setAttribute('aria-label',t('collapseMobile'));
},{once:true});
// Tabs: left / right / Home / End move and select.
document.addEventListener('keydown',e=>{
 const tab=e.target.closest?.('.input-tabs button,.view-tabs button');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
 const tabs=[...tab.parentElement.querySelectorAll('button:not(.hidden)')],i=tabs.indexOf(tab);
 const j=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
 e.preventDefault();tabs[j].focus();tabs[j].click();
});
// File and Examples menus: menu-button pattern.
function qbMenuItems(menu){return [...menu.querySelectorAll('.menu-pop [role="menuitem"]')].filter(b=>!b.disabled&&b.offsetParent!==null);}
function qbMenuOpen(menu,focus){const tg=menu.querySelector('[data-menu-toggle]');if(!menu.classList.contains('open'))tg.click();setTimeout(()=>{const it=qbMenuItems(menu);(focus==='last'?it.at(-1):it[0])?.focus();},0);}
document.addEventListener('click',e=>{const tg=e.target.closest('[data-menu-toggle]');if(!tg||e.detail!==0)return;const menu=tg.closest('.qb-menu');if(menu.classList.contains('open'))setTimeout(()=>qbMenuItems(menu)[0]?.focus(),0);});
document.addEventListener('keydown',e=>{
 const menu=e.target.closest?.('.qb-menu');if(!menu)return;
 const tg=menu.querySelector('[data-menu-toggle]');
 if(e.target===tg&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();qbMenuOpen(menu,e.key==='ArrowUp'?'last':'first');return;}
 if(!e.target.closest('.menu-pop'))return;
 const it=qbMenuItems(menu),i=it.indexOf(e.target);
 if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeMenus();tg.focus();return;}
 if(e.key==='Tab'){closeMenus();return;}
 const j=e.key==='ArrowDown'?(i+1)%it.length:e.key==='ArrowUp'?(i-1+it.length)%it.length:e.key==='Home'?0:e.key==='End'?it.length-1:-1;
 if(j>=0){e.preventDefault();it[j]?.focus();}
},true);
document.addEventListener('focusout',e=>{const menu=e.target.closest?.('.qb-menu.open');if(menu&&e.relatedTarget&&!menu.contains(e.relatedTarget))closeMenus();});
// Plots: a keyboard station, drawn by the same path as the mouse readout.
let qbKbStation=null;
function qbPlotStation(svg,i){
 if(!result)return;const xs=(currentGraph()?.x||result.x),n=xs.length;i=Math.max(0,Math.min(n-1,i));qbKbStation=i;
 const r=svg.getBoundingClientRect(),cx=r.left+(26+xs[i]/result.x.at(-1)*874)/926*r.width;
 chartHover({currentTarget:svg,clientX:cx,clientY:r.top+r.height/2});
 const key=svg.dataset.effect,unit=key==='M'?'kN·m':key==='D'?'mm':'kN',g=currentGraph();
 const v=g?`${qbFmtEffect(key,g[key][i])}`:svg.dataset.delta?`Δ ${qbFmtEffect(key,result.max[key][i]-result.min[key][i])}`:result.kind==='thermal'?qbFmtEffect(key,result.values[key][i]):`max ${qbFmtEffect(key,result.max[key][i])} · min ${qbFmtEffect(key,result.min[key][i])}`;
 const out=$('#qb-readout');if(out)out.textContent=`x = ${fmt(xs[i])} m · ${key==='D'?'δ':key} ${v} ${unit}`;
}
document.addEventListener('keydown',e=>{
 const svg=e.target.closest?.('#charts svg.plot');if(!svg||!result)return;
 const n=(currentGraph()?.x||result.x).length,cur=qbKbStation??Math.floor(n/2),step=e.shiftKey?10:1;
 const to=e.key==='ArrowRight'?cur+step:e.key==='ArrowLeft'?cur-step:e.key==='Home'?0:e.key==='End'?n-1:null;
 if(to===null)return;e.preventDefault();qbPlotStation(svg,to);
});
document.addEventListener('focusin',e=>{const svg=e.target.closest?.('#charts svg.plot');if(svg&&result){svg.setAttribute('aria-describedby','qb-chart-keys');qbPlotStation(svg,qbKbStation??0);}});
document.addEventListener('DOMContentLoaded',()=>{const k=document.createElement('p');k.id='qb-chart-keys';k.className='sr-only';k.textContent=t('chartKeys');document.body.append(k);},{once:true});
// Floating windows carry their title as accessible name.
{const f=qbFloat;qbFloat=function(dlg){f(dlg);const b=dlg.querySelector('.sp-head b');if(b){b.id=b.id||`${dlg.id}-title`;dlg.setAttribute('aria-labelledby',b.id);}dlg.querySelectorAll('.sp-close').forEach(x=>{x.setAttribute('aria-label',t('close'));x.title=t('close');});};}
// Station table: column headers and a caption naming the case.
{const rt=renderTable;renderTable=function(){rt.apply(this,arguments);const tb=$('#table-view table');if(!tb)return;tb.querySelectorAll('thead th').forEach(th=>th.setAttribute('scope','col'));if(!tb.querySelector('caption')){const c=document.createElement('caption');c.className='sr-only';tb.prepend(c);}tb.querySelector('caption').textContent=$('#table-view .help')?.textContent||'';};}
// FT applied: the headline values are per girder, said once on the metrics row.
// v0.9.96: the FT flag sits in the warning line (it was clipped above the values).
{const rr=renderResults;renderResults=function(){rr.apply(this,arguments);const w=document.querySelector('p.warning');if(!w)return;document.querySelectorAll('.metrics-flag').forEach(f=>f.remove());if(result?.ft&&model.load_mode!=='dead'&&result.kind!=='thermal'){const f=document.createElement('span');f.className='metrics-flag';f.textContent=t('ftPerGirder');w.append(f);}};}
{const tr=translate;translate=function(){const r=tr.apply(this,arguments);const k=$('#qb-chart-keys');if(k)k.textContent=t('chartKeys');$('#results-title')&&($('#results-title').textContent=lang==='fr'?'Résultats':'Results');$('#display-mode')?.setAttribute('aria-label',lang==='fr'?'Affichage':'Display');$('.input-tabs')?.setAttribute('aria-label',lang==='fr'?'Données du modèle':'Model data');$('.view-tabs')?.setAttribute('aria-label',lang==='fr'?'Vue des résultats':'Results view');$('#collapse-inputs')?.setAttribute('aria-label',t('collapseMobile'));const sk=document.getElementById('qb-splash-skip');if(sk)sk.setAttribute('aria-label',lang==='fr'?'Passer l’animation':'Skip the animation');return r;};}

// ---- Final pass (0.9.95) -----------------------------------------------------
Object.assign(words.fr,{redoMenu:'Rétablir',redoMenuSub:'Refaire la modification annulée',exampleBody:'Enregistrer le projet actuel avant de charger l’exemple?',saveThenLoad:'Enregistrer puis charger',loadNoSave:'Charger sans enregistrer',openNoSave:'Ouvrir sans enregistrer',govAt:'à'});
Object.assign(words.en,{redoMenu:'Redo',redoMenuSub:'Repeat the undone change',exampleBody:'Save the current project before loading the example?',saveThenLoad:'Save then load',loadNoSave:'Load without saving',openNoSave:'Open without saving',govAt:'at'});
// Redo next to Undo in the File menu.
document.addEventListener('DOMContentLoaded',()=>{const u=$('#undo-model');if(u&&!$('#redo-model'))u.insertAdjacentHTML('afterend',`<button type="button" id="redo-model" role="menuitem"><svg class="mi-ico" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 5L16 8.5 12.5 12 M15.5 8.5h-7a4 4 0 000 8H11.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="mi-text"><b data-i18n="redoMenu">${esc(t('redoMenu'))}</b><small data-i18n="redoMenuSub">${esc(t('redoMenuSub'))}</small></span><kbd>Ctrl Y</kbd></button>`);},{once:true});
document.addEventListener('click',e=>{if(e.target.closest('#redo-model'))qbHistGo(1);});
// The unsaved-changes dialog names what is about to replace the model.
{const k0=qbReplaceKind;qbReplaceKind=function(kind){k0(kind==='example'?'open':kind);const dl=$('#replace-dialog');if(!dl)return;dl.dataset.kind=kind;
 if(kind==='example'){dl.querySelector('p').textContent=t('exampleBody');dl.querySelector('button[value="discard"]').textContent=t('loadNoSave');dl.querySelector('button[value="save"]').textContent=t('saveThenLoad');}
 else if(kind==='open')dl.querySelector('button[value="discard"]').textContent=t('openNoSave');};}
{const le=loadExample;loadExample=async function(id){qbReplaceKind('example');const r=await le.apply(this,arguments);if(!$('#replace-dialog').open)qbReplaceKind('open');return r;};}
// Total length and its group summary follow every committed change.
{const ch=changed;changed=function(){const r=ch.apply(this,arguments);const b=$('#total-length');if(b&&model){const L=fmt(model.spans.reduce((v,s)=>v+s.length,0));b.textContent=`${L} m`;const meta=b.closest('details')?.querySelector('.group-meta');if(meta&&/m$/.test(meta.textContent.trim()))meta.textContent=`${L} m`;}return r;};}
// The governing banner says which extreme it explains.
let qbLastCase=null;
{const ic=inspectCase;inspectCase=async function(index,sense,position=null){if(position===null&&result)qbLastCase={index,sense};else qbLastCase=null;return ic.apply(this,arguments);};}
{const rr=renderResults;renderResults=function(){rr.apply(this,arguments);const g=$('#governing span');if(!g||!qbLastCase||!(snap&&display==='snapshot')||!result)return;
 const nx=result.x.length,{index,sense}=qbLastCase,k=index<nx?'V':index<2*nx?'M':index<3*nx?'D':null;if(!k)return;const i=index%nx;
 const b=document.createElement('b');b.className='gov-effect';b.textContent=`${k==='D'?'δ':k} ${sense} ${t('govAt')} x = ${fmt(result.x[i])} m · `;g.prepend(b);};}
document.addEventListener('DOMContentLoaded',()=>qbReplaceKind('open'),{once:true});

// ---- v0.9.96: S6 pedestrian load (3.8.9), alternative to the vehicle -------
Object.assign(words.fr,{pedestrianGroup:'Charge piétonnière',pedestrianShort:'Piétons',pedestrianUse:'Utiliser la charge piétonnière (remplace le véhicule)',vehicleReplaced:'Remplacé par la charge piétonnière (sous-section ci-dessous).',pedWidthSource:'Largeur tributaire',pedWidthSlab:'Largeur de la dalle',pedWidthManual:'Largeur saisie',pedWidth:'Largeur tributaire (mm)',pedA:'a (kPa)',pedB:'b (m)',pedMin:'p min (kPa)',pedMax:'p max (kPa)',pedFormula:'p = a − s / b, entre p min et p max (s : longueur chargée, somme des travées chargées). Valeurs par défaut : S6-19, art. 3.8.9 — provisoires tant que l’expression de la S6-25 n’est pas confirmée.',pedMaintenance:'Enveloppe avec le véhicule d’entretien (non concomitant)',pedMaintenanceHelp:'Le véhicule d’entretien (24 + 56 kN à 2,0 m) est une autre surcharge : l’enveloppe retient le plus défavorable des deux, jamais leur somme.',pedHelp:'Toutes les combinaisons de travées chargées sont évaluées (p dépend de la longueur chargée). Ni CMD, ni facteur d’essieu, ni FT; le facteur de charge vive s’applique.',pedNoSlab:'Aucune dalle définie : largeur saisie (2000 mm par défaut).',pedWhole:'Pont entier',ftNotPedestrian:'Le FT (fraction de charge de camion) ne s’applique pas à la charge piétonnière.',laneExtent:'Charge répartie de la voie',laneSpans:'Travées qui augmentent l’effet',laneInfluence:'Parties de ligne d’influence',laneFull:'Pont complet (≤ 0.9.95)',laneExtentHelp_spans:'S6, C3.8.4.1 : la charge répartie n’est appliquée que là où elle augmente l’effet. Pour chaque effet, seules les travées dont la contribution a le bon signe sont chargées.',laneExtentHelp_influence:'Comme « travées », mais sur les seules parties de la ligne d’influence du bon signe (portions de travée possibles). Écart très faible avec « travées ».',laneExtentHelp_full:'Charge répartie sur toute la longueur du pont, quel que soit l’effet (méthode des versions ≤ 0.9.95).',pedCase:'Piétons',spansWord:'travées',spanWord:'Travée'});
Object.assign(words.en,{pedestrianGroup:'Pedestrian load',pedestrianShort:'Pedestrians',pedestrianUse:'Use the pedestrian load (replaces the vehicle)',vehicleReplaced:'Replaced by the pedestrian load (subsection below).',pedWidthSource:'Tributary width',pedWidthSlab:'Slab width',pedWidthManual:'Width entered',pedWidth:'Tributary width (mm)',pedA:'a (kPa)',pedB:'b (m)',pedMin:'p min (kPa)',pedMax:'p max (kPa)',pedFormula:'p = a − s / b, between p min and p max (s: loaded length, sum of the loaded spans). Defaults: S6-19, cl. 3.8.9 — placeholders until the S6-25 expression is confirmed.',pedMaintenance:'Envelope with the maintenance vehicle (not concomitant)',pedMaintenanceHelp:'The maintenance vehicle (24 + 56 kN at 2.0 m) is another live load: the envelope keeps the worse of the two, never their sum.',pedHelp:'Every combination of loaded spans is evaluated (p depends on the loaded length). No dynamic allowance, axle factor or FT; the live load factor applies.',pedNoSlab:'No slab defined: width entered (2000 mm by default).',pedWhole:'Whole bridge',ftNotPedestrian:'FT (truck load fraction) does not apply to the pedestrian load.',laneExtent:'Lane uniformly distributed load',laneSpans:'Spans increasing the effect',laneInfluence:'Influence-line parts',laneFull:'Whole bridge (≤ 0.9.95)',laneExtentHelp_spans:'S6, C3.8.4.1: the distributed load is applied only where it increases the effect. For every effect, only the spans contributing with the right sign are loaded.',laneExtentHelp_influence:'Like “spans”, but only on the parts of the influence line with the right sign (partial spans possible). Very small difference from “spans”.',laneExtentHelp_full:'Distributed load over the whole bridge length, whatever the effect (method of versions ≤ 0.9.95).',pedCase:'Pedestrians',spansWord:'spans',spanWord:'Span'});
function pedSettings(){if(!model.pedestrian)model.pedestrian={width_source:'slab',width:2000,a:5,b:30,p_min:1.6,p_max:4,maintenance:false};return model.pedestrian;}
function pedSlabWidth(){const s=model.sections.find(x=>x.composite&&x.composite.enabled);return s?s.composite.effective_width:null;}
function pedWidthMm(){const p=pedSettings(),slab=pedSlabWidth();return p.width_source==='slab'&&slab?slab:p.width;}
function pedIntensity(len){const p=pedSettings();return Math.min(Math.max(p.a-len/p.b,p.p_min),p.p_max);}
function pedestrianMeta(){const L=model.spans.reduce((a,s)=>a+s.length,0),p=pedIntensity(L);return `${fmt(p,2)} kPa · ${fmt(p*pedWidthMm()/1000,2)} kN/m`;}
function pedestrianCard(){
 const p=pedSettings(),on=model.live.source==='pedestrian',slab=pedSlabWidth();
 let h=`<div class="load-card ped-card"><label class="toggle-row"><input type="checkbox" id="ped-source" ${on?'checked':''}>${t('pedestrianUse')}</label>`;
 if(!on)return h+`<p class="help">${t('pedHelp')}</p></div>`;
 h+=select('pedWidthSource','pedestrian.width_source',slab?p.width_source:'manual',slab?[['slab',`${t('pedWidthSlab')} · ${fmt(slab,0)} mm`],['manual',t('pedWidthManual')]]:[['manual',t('pedWidthManual')]]);
 if(!slab||p.width_source==='manual')h+=field('pedWidth','pedestrian.width',p.width,'',{min:1,max:30000});
 if(!slab)h+=`<p class="help">${t('pedNoSlab')}</p>`;
 h+=`<div class="field-row">${field('pedA','pedestrian.a',p.a,'',{min:0,max:50})}${field('pedB','pedestrian.b',p.b,'',{min:.01,max:10000})}</div><div class="field-row">${field('pedMin','pedestrian.p_min',p.p_min,'',{min:0,max:50})}${field('pedMax','pedestrian.p_max',p.p_max,'',{min:0,max:50})}</div>`;
 h+=`<p class="help">${t('pedFormula')}</p>`;
 const L=model.spans.reduce((a,s)=>a+s.length,0),rows=[...model.spans.map((s,i)=>[`${t('spanWord')} ${i+1}`,s.length]),[t('pedWhole'),L]];
 h+=`<table class="axle-table ped-table"><thead><tr><th></th><th>s (m)</th><th>p (kPa)</th><th>w (kN/m)</th></tr></thead><tbody>${rows.map(([n,l])=>`<tr><td>${esc(n)}</td><td>${fmt(l,2)}</td><td>${fmt(pedIntensity(l),2)}</td><td>${fmt(pedIntensity(l)*pedWidthMm()/1000,2)}</td></tr>`).join('')}</tbody></table>`;
 h+=`<div class="field-row">${field('loadFactor','live.factor',model.live.factor??1)}</div>`;
 h+=`<label class="toggle-row"><input type="checkbox" data-path="pedestrian.maintenance" ${p.maintenance?'checked':''}>${t('pedMaintenance')}</label><p class="help">${t('pedMaintenanceHelp')}</p><p class="help">${t('pedHelp')}</p></div>`;
 return h;
}
document.addEventListener('change',e=>{
 if(e.target.id!=='ped-source'||!model)return;pedSettings();model.live.source=e.target.checked?'pedestrian':'vehicle';
 groupOpen['loads-ped']=true;renderInputs();changed();
});

// v0.9.96: with pedestrians the only vehicle is the optional maintenance one.
{const vp=vehiclePattern;vehiclePattern=function(live){if((live===undefined||live===model?.live)&&model?.live?.source==='pedestrian')return pedSettings().maintenance?{weights:[24,56],spaces:[2]}:{weights:[],spaces:[]};return vp.apply(this,arguments);};}
{const vn=vehicleName;vehicleName=function(vehicle){if(vehicle===undefined&&model?.live?.source==='pedestrian')return pedSettings().maintenance?`${t('pedestrianShort')} / ${t('maintenance')}`:t('pedestrianShort');return vn.apply(this,arguments);};}
{const va=visualAxleFactor;visualAxleFactor=function(){if(model?.live?.source==='pedestrian')return model.live.factor??1;return va.apply(this,arguments);};}
{const ct=caseText;caseText=function(c){
 if(c&&c.case==='pedestrian'){const w=c.intensity*c.width*(model.live.factor??1);return `${t('pedCase')} · ${c.spans.length>1?t('spansWord'):t('spanWord').toLowerCase()} ${c.spans.join(', ')} · s = ${fmt(c.loaded_length,2)} m · p = ${fmt(c.intensity,2)} kPa · w = ${fmt(w,2)} kN/m · ${t('loadFactor')} ×${fmt(model.live.factor??1,2)}`;}
 if(c&&c.case==='truck'&&model?.live?.source==='pedestrian')return `${t('maintenance')} · ${t('axles')} ${c.axles.join('–')} · ${t('noDynamic')} · ${t('loadFactor')} ×${fmt(model.live.factor??1,2)} · x₁ = ${fmt(c.position,1)} m · ${c.direction==='forward'?t('forward'):t('backward')}`;
 return ct.apply(this,arguments);};}
// Envelope sketch: the pedestrian load drawn over the whole deck.
{const rb=renderBeam;renderBeam=function(){const r=rb.apply(this,arguments);try{
 if(model?.live?.source!=='pedestrian'||!['live','both'].includes(model.load_mode)||(snap&&display==='snapshot'))return r;
 const svg=$('#beam');if(!svg||svg.querySelector('.ped-band'))return r;
 const total=model.spans.reduce((a,s)=>a+s.length,0),left=beamX(0,total),right=beamX(total,total);
 svg.insertAdjacentHTML('beforeend',`<g class="ped-band"><rect x="${left}" y="47" width="${right-left}" height="13" fill="#edb66f" opacity=".24"/><text x="${(left+right)/2}" y="43" text-anchor="middle" font-size="11" fill="#f1c47f">${esc(t('pedCase'))} · ${esc(pedestrianMeta())}</text></g>`);
}catch(e){console.warn(e)}return r;};}
