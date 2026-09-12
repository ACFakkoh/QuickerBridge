"use strict";
const QB_META=window.QB_META||{version:'0.4',date:'2026-09-11',author:'Anthony Chéruel'};
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const words = {
 en: {
  inertiaModifier:"Inertia modifier M (×)",modifierHelp:"EI = E × I steel × M. M = 4 gives four times the stiffness. Area and centroid remain steel-only; no transformed composite section is calculated.",legacyTaper:"This older project interpolates plate dimensions. Open it with v0.3, then redefine its zones for depth-only tapers in v0.4.",
  sectionType:"Section definition",girder:"Steel I-girder dimensions",directEI:"Constant EI (kN·m²)",updated:"Updated 2026-09-12",disclaimer:"Use and liability: While I believe these tools to be free of error, I cannot be held liable for their results. They are provided for instruction only and must not be used to design a bridge.",openProject:"Open",saveProject:"Save",untitled:"Untitled project",modified:"Modified",saved:"Project saved",opened:"Project opened",projectInvalid:"This project file is invalid or incompatible.",projectLarge:"The project file exceeds 1 MiB.",unsavedTitle:"Unsaved changes",unsavedBody:"Save the current project before opening the selected file?",cancel:"Cancel",discard:"Discard",saveThenOpen:"Save then open",thermal:"Thermal",thermalLoads:"THERMAL GRADIENT",deltaT:"ΔT = Ttop − Tbottom (°C)",alpha:"Thermal expansion α (10⁻⁶/°C)",thermalDepth:"Thermal reference depth (mm)",thermalHelp:"A linear top-to-bottom gradient is applied alone as a free imposed curvature on every span. Positive ΔT means the top is warmer and bows the beam upward.",thermalOnly:"Thermal gradient only",thermalScope:"All spans · imposed thermal curvature",thermalCase:"Single thermal case",maxMoment:"Maximum moment",minMoment:"Minimum moment",curvature:"Imposed curvature",thermalNotes:"Thermal-gradient model",thermalBody:"The linear temperature difference produces a uniform free curvature κ = −αΔT/h in PyCBA. The sign maps positive top heating to upward bowing, shown as negative deflection. The thermal case is solved alone and is never superposed with dead or live load.",
  brandSub:"CONTINUOUS BEAM WORKSPACE",local:"PyCBA",model:"Bridge model",reset:"Reset",geometry:"Geometry",sections:"Sections",loads:"Loads",oneLane:"One lane · longitudinal effects",elastic:"Linear elastic · EI model",dead:"Dead",live:"Live",both:"Dead + live",initializing:"Loading calculation engine (first launch may take a minute)…",beamLoads:"BEAM & LOADS",diagrams:"Diagrams",table:"Station table",method:"Analysis notes",envelope:"Envelope",snapshot:"Truck position",frontAxle:"Front axle",reverse:"Reverse",range:"Min / max envelope",hoverHint:"Move across a diagram to inspect a station",supportReactions:"SUPPORT REACTIONS · kN ↑+",signs:"Sagging M + · deflection downward +",warning:"Indicative preliminary values only — not a substitute for detailed design.",spanCount:"NUMBER OF SPANS",spanLengths:"SPAN LENGTHS",span:"Span",support:"Support",supports:"SUPPORTS",pin:"Pinned",roller:"Roller",supportHelp:"Pins and rollers restrain vertical movement. The beam remains continuous over interior supports.",sectionMode:"SECTION MODEL",nonprismatic:"Non-prismatic / variable section",sectionHelp:"Choose girder dimensions or a direct constant EI in kN·m². Gross steel I is calculated from the plates. The inertia modifier multiplies I for stiffness only. EI-only geometry is schematic.",addSection:"+ Add section",E:"Elastic modulus E (GPa)",depth:"Overall depth h (mm)",top_width:"Top flange width (mm)",top_thickness:"Top flange thickness (mm)",web_thickness:"Web thickness (mm)",bottom_width:"Bottom flange width (mm)",bottom_thickness:"Bottom flange thickness (mm)",section:"Section",zone:"Zone",zoneEnd:"Ends at (% of span)",profile:"Variation",constant:"Constant",linear:"Linear depth",parabolic:"Parabolic depth",startSection:"Zone plates / start depth",endSection:"End depth from section",addZone:"+ Split last zone",zoneHelp:"Zones run consecutively from 0% to 100%. Start section: plates, E, modifier and initial height. End section: target height only. Plates change at the next zone. Positive/negative section names are fixed geometric zones, not automatic stiffness changes with moment sign.",deadLoads:"PERMANENT LOADS",addDead:"+ Add uniform load",allSpans:"All spans",intensity:"Intensity w (kN/m)",applyTo:"Apply to",from:"From (%)",to:"To (%)",liveLoads:"LIVE LOAD MODEL",vehicle:"Design vehicle",hl93Truck:"AASHTO HL-93 truck",hl93Tandem:"AASHTO HL-93 tandem",cooper:"AREA / AREMA Cooper E",cooperE:"Cooper E number",custom:"Custom vehicle",case:"Load case",governing:"Governing: truck / lane",truck:"Vehicle only",lane:"Vehicle + companion UDL",fraction:"Truck fraction in Canadian lane case",laneIntensity:"Companion UDL (kN/m)",hl93Spacing:"HL-93 truck rear-axle spacing: 4.3–9.0 m; all permitted spacings are enveloped.",cooperHelp:"Two PyCBA locomotives (18 axles) plus the Cooper companion UDL. The E number scales every axle and UDL load.",fullLaneHelp:"The companion UDL covers the bridge deck, matching PyCBA’s run_load_model behavior. It is not dynamically amplified.",canadianLaneHelp:"The displayed axle loads are reduced only by the Canadian lane fraction; dynamic allowance is never displayed or applied to a lane case.",noDynamic:"No dynamic allowance",appliedFactor:"Applied axle factor",fractionHelp:"63%: single spans; positive moment and vertical shear of multi-span bridges; other cases per A2023-05. The selected fraction applies to this entire lane-case result.",dynamic:"Apply vehicle dynamic allowance",factorHelp:"CAN/CSA S6-25: 1 axle ×1.40; 2 axles or 1–2–3 ×1.30; other groups of 3+ ×1.25. HL-93: ×1.33 on truck/tandem axles only. Cooper has no dynamic allowance.",axle:"Axle",load:"Load (kN)",spacing:"Gap after (m)",axleCount:"Number of axles",direction:"Travel direction",bothDirections:"Both directions",forward:"Left → right",backward:"Right → left",resolution:"NUMERICAL PRECISION",standard:"Standard",fine:"Fine",precisionHelp:"Standard: 0.25 m travel step. Fine: 0.10 m, denser influence and deflection sampling.",solving:"Calculating envelopes…",ready:"Analysis updated",failed:"Please check your inputs",invalid:"Check positive dimensions, span lengths, axle spacings and complete section zones.",offline:"The browser solver could not start. Check your connection and reload to download the calculation runtime.",sagging:"Max sagging",hogging:"Max hogging",maxShear:"Max |shear|",maxDeflection:"Max |deflection|",shear:"Shear",moment:"Moment",deflection:"Deflection",at:"at",nominalTruck:"Nominal axle loads shown · dynamic allowance is never displayed",deadOnly:"Permanent loads only",subdivisions:"Intervals per span",subdivisionHelp:"Report stations are independent of the solver and travel resolution. Shared supports have two rows for left/right shear; reactions appear once in downloads.",station:"Station",side:"Side",left:"Left",right:"Right",xLocal:"Local x",up:"up",down:"down",restore:"Show envelope",critical:"Governing arrangement",axles:"Axles",dynamicFactor:"DLA factor",unloaded:"No live load",totalLength:"Total length",elapsed:"Solve",positions:"positions",groups:"axle groups",reactionHelp:"Min / max at each support; each extreme can come from a different arrangement.",methodTitle:"Analysis basis",methodBody:"PyCBA solves the 1-D Euler–Bernoulli beam by the direct stiffness method. Pins and rollers restrain vertical movement and permit rotation; internal supports preserve beam continuity. Axial and shear deformation are excluded.",sectionNotes:"Section properties",sectionBody:"A, centroid and I are calculated from top flange, web and bottom flange using the parallel-axis theorem. E is homogeneous within each section. Tapers vary overall depth only; flange dimensions, web thickness, E and inertia modifier remain those of the zone start section and change abruptly at zone boundaries. The end section supplies only the target depth. EI = E × gross I × modifier; the solver uses a positive piecewise-linear EI profile. Direct EI sections use the supplied constant stiffness (kN·m²), without inferred area or inertia. Parabolic haunches are tangent at their shallower end. Gross properties are used, with no automatic cracking, composite action, prestress or self-weight.",loadNotes:"Truck groups and lane cases",loadBody:"Canadian CL-625 and CL-750-QC check all nonempty axle subsets at their original spacings. CAN/CSA S6-25 clause 3.8.4.5.3 governs their dynamic allowance, including the special 1–2–3 group. Their lane cases use reduced axles plus a patterned UDL, with no dynamic allowance on either component. HL-93 checks the complete truck or tandem. Its truck rear spacing is enveloped from 4.3 to 9.0 m, its 33% allowance applies to the axles only, and its 9.3 kN/m companion UDL is unamplified. Cooper uses PyCBA’s complete E-series train with its companion UDL. Truck and lane cases are alternatives in this tool.",scopeBody:"These are one-lane longitudinal effects. No ULS/SLS load factors, RL lane modification, transverse distribution factors, deck-joint allowance, or buried-structure rules are applied. Custom vehicle factors use individual axle counts; special-truck axle-unit rules are not inferred.",precisionTitle:"Resolution and results",precisionBody:"Reaction influence functions and PyCBA deflections are interpolated within each span. Shear and moment are recovered by section equilibrium. Deflection integration is corrected to satisfy zero displacement at supports. Report subdivisions never set calculation accuracy. Fine mode refines truck travel, influence sampling, EI profiles and deflection integration. An envelope is a collection of separate extremes, not one simultaneous load case; click an extreme or diagram to inspect its compatible arrangement.",unitsTitle:"Units and signs",unitsBody:"Bridge coordinates: m. Section dimensions: mm. E: GPa. Loads: kN and kN/m. Moment: kN·m, sagging positive and drawn below the beam axis. Deflection: mm, downward positive. Support reactions: kN, upward positive. The two shear limits at an interior support are kept separately.",sourceTitle:"References",noResults:"Results will appear after a valid analysis.",remove:"Remove",name:"Name",deleteSectionHelp:"This section is in use. Reassign its spans and zones before removing it.",busyExport:"Results are being updated. Exports become available when the calculation finishes.",snapshotHelp:"The entered position displays nominal axle labels. The solver still applies the selected code factor; a Canadian lane case applies only its lane fraction.",originalDirection:"Front axle coordinate follows physical axle 1 in both directions.",methodScope:"Factors included",laneCaption:"Adverse lane regions",permanentName:"Permanent load",manualCaption:"Positioned full vehicle",spanSection:"Section per span",statusDetail:"Input changes update automatically",factorCount:"Axle count",showCase:"Inspect this load arrangement",reactionCase:"Inspect reaction",caseMethod:"Truck/lane extremes may govern at different positions."
 },
 fr: {
  inertiaModifier:"Multiplicateur d’inertie M (×)",modifierHelp:"EI = E × I acier × M. M = 4 quadruple la rigidité. L’aire et le centre de gravité restent ceux de l’acier; aucune section composite transformée n’est calculée.",legacyTaper:"Cet ancien projet interpole les dimensions des tôles. Ouvrez-le avec v0.3, puis redéfinissez ses zones avec une variation de hauteur seulement dans v0.4.",
  sectionType:"Définition de la section",girder:"Dimensions de la poutre en I",directEI:"EI constant (kN·m²)",updated:"Mise à jour : 2026-09-12",disclaimer:"Utilisation et responsabilité : Bien que je considère ces outils comme exempts d’erreurs, je ne peux être tenu responsable de leurs résultats. Ils sont fournis à des fins pédagogiques seulement et ne doivent pas servir à concevoir un pont.",openProject:"Ouvrir",saveProject:"Enregistrer",untitled:"Sans titre",modified:"Modifié",saved:"Projet enregistré",opened:"Projet ouvert",projectInvalid:"Ce fichier de projet est invalide ou incompatible.",projectLarge:"Le fichier de projet dépasse 1 Mio.",unsavedTitle:"Modifications non enregistrées",unsavedBody:"Enregistrer le projet actuel avant d’ouvrir le fichier sélectionné?",cancel:"Annuler",discard:"Ignorer",saveThenOpen:"Enregistrer puis ouvrir",thermal:"Thermique",thermalLoads:"GRADIENT THERMIQUE",deltaT:"ΔT = Tdessus − Tdessous (°C)",alpha:"Dilatation thermique α (10⁻⁶/°C)",thermalDepth:"Hauteur thermique de référence (mm)",thermalHelp:"Un gradient linéaire entre le dessus et le dessous est appliqué seul comme courbure libre imposée à chaque travée. Un ΔT positif signifie que le dessus est plus chaud et courbe la poutre vers le haut.",thermalOnly:"Gradient thermique seulement",thermalScope:"Toutes les travées · courbure thermique imposée",thermalCase:"Cas thermique unique",maxMoment:"Moment maximal",minMoment:"Moment minimal",curvature:"Courbure imposée",thermalNotes:"Modèle du gradient thermique",thermalBody:"La différence de température linéaire produit une courbure libre uniforme κ = −αΔT/h dans PyCBA. Le signe associe un dessus plus chaud à une courbure vers le haut, affichée comme une flèche négative. Le cas thermique est résolu seul et n’est jamais superposé aux charges permanentes ou routières.",
  brandSub:"ANALYSE DE POUTRES CONTINUES",local:"PyCBA",model:"Modèle du pont",reset:"Réinitialiser",geometry:"Géométrie",sections:"Sections",loads:"Charges",oneLane:"Une voie · effets longitudinaux",elastic:"Élastique linéaire · modèle EI",dead:"Permanentes",live:"Routières",both:"Les deux",initializing:"Chargement du moteur (le premier lancement peut prendre une minute)…",beamLoads:"POUTRE ET CHARGES",diagrams:"Diagrammes",table:"Tableau des stations",method:"Notes de calcul",envelope:"Enveloppe",snapshot:"Position du camion",frontAxle:"Essieu avant",reverse:"Inverser",range:"Enveloppe min / max",hoverHint:"Survolez un diagramme pour examiner une station",supportReactions:"RÉACTIONS D’APPUI · kN ↑+",signs:"M positif en travée · flèche positive vers le bas",warning:"Valeurs préliminaires indicatives seulement — ne remplacent pas une conception détaillée.",spanCount:"NOMBRE DE TRAVÉES",spanLengths:"LONGUEURS DES TRAVÉES",span:"Travée",support:"Appui",supports:"APPUIS",pin:"Articulé",roller:"À rouleaux",supportHelp:"Les appuis bloquent le déplacement vertical. La poutre reste continue au-dessus des appuis intermédiaires.",sectionMode:"MODÈLE DE SECTION",nonprismatic:"Non prismatique / section variable",sectionHelp:"Choisissez les dimensions de la poutre ou un EI constant en kN·m². I brut est calculé avec les tôles. Le multiplicateur d’inertie modifie uniquement la rigidité. La géométrie des sections EI est schématique.",addSection:"+ Ajouter une section",E:"Module d’élasticité E (GPa)",depth:"Hauteur totale h (mm)",top_width:"Largeur semelle sup. (mm)",top_thickness:"Épaisseur semelle sup. (mm)",web_thickness:"Épaisseur de l’âme (mm)",bottom_width:"Largeur semelle inf. (mm)",bottom_thickness:"Épaisseur semelle inf. (mm)",section:"Section",zone:"Zone",zoneEnd:"Fin (% de la travée)",profile:"Variation",constant:"Constante",linear:"Hauteur linéaire",parabolic:"Hauteur parabolique",startSection:"Tôles / hauteur initiale",endSection:"Hauteur finale de la section",addZone:"+ Diviser la dernière zone",zoneHelp:"Les zones se suivent de 0 % à 100 %. Section initiale : tôles, E, multiplicateur et hauteur initiale. Section finale : hauteur cible seulement. Les tôles changent à la zone suivante. Les sections de moment positif/négatif correspondent à des zones géométriques fixes, sans changement automatique selon le signe du moment.",deadLoads:"CHARGES PERMANENTES",addDead:"+ Ajouter une charge uniforme",allSpans:"Toutes les travées",intensity:"Intensité w (kN/m)",applyTo:"Appliquer à",from:"Début (%)",to:"Fin (%)",liveLoads:"SURCHARGE ROUTIÈRE",vehicle:"Véhicule de calcul",hl93Truck:"Camion HL-93 AASHTO",hl93Tandem:"Tandem HL-93 AASHTO",cooper:"Cooper E AREA / AREMA",cooperE:"Indice Cooper E",custom:"Véhicule personnalisé",case:"Cas de charge",governing:"Déterminant : camion / voie",truck:"Véhicule seulement",lane:"Véhicule + charge uniforme associée",fraction:"Fraction du camion dans le cas voie canadien",laneIntensity:"Charge uniforme associée (kN/m)",hl93Spacing:"Espacement arrière du camion HL-93 : 4,3 à 9,0 m; toutes les valeurs permises sont enveloppées.",cooperHelp:"Deux locomotives PyCBA (18 essieux) et la charge uniforme associée Cooper. L’indice E multiplie tous les essieux et la charge uniforme.",fullLaneHelp:"La charge uniforme associée couvre le tablier, conformément à run_load_model de PyCBA. Elle n’est jamais majorée dynamiquement.",canadianLaneHelp:"Les essieux affichés sont réduits seulement par la fraction de voie canadienne; aucun CMD n’est affiché ni appliqué à un cas voie.",noDynamic:"Aucune majoration dynamique",appliedFactor:"Facteur d’essieux appliqué",fractionHelp:"63 % : travée simple; moment positif et cisaillement vertical des ponts continus; autres cas selon A2023-05. La fraction sélectionnée s’applique à l’ensemble des résultats du cas de voie.",dynamic:"Appliquer la majoration dynamique du véhicule",factorHelp:"CAN/CSA S6-25 : 1 essieu ×1,40; 2 essieux ou 1–2–3 ×1,30; autres groupes de 3+ ×1,25. HL-93 : ×1,33 sur les essieux seulement. Cooper n’a pas de majoration dynamique.",axle:"Essieu",load:"Charge (kN)",spacing:"Espac. après (m)",axleCount:"Nombre d’essieux",direction:"Sens de circulation",bothDirections:"Les deux sens",forward:"Gauche → droite",backward:"Droite → gauche",resolution:"PRÉCISION NUMÉRIQUE",standard:"Standard",fine:"Fine",precisionHelp:"Standard : pas de 0,25 m. Fine : pas de 0,10 m et calculs d’influence et de flèche plus fins.",solving:"Calcul des enveloppes…",ready:"Analyse à jour",failed:"Veuillez vérifier les données",invalid:"Vérifiez les dimensions positives, les portées, les espacements d’essieux et la couverture des zones.",offline:"Le solveur du navigateur n’a pas démarré. Vérifiez votre connexion et rechargez pour télécharger le moteur de calcul.",sagging:"Moment positif max",hogging:"Moment négatif max",maxShear:"|Cisaillement| max",maxDeflection:"|Flèche| max",shear:"Cisaillement",moment:"Moment",deflection:"Flèche",at:"à",nominalTruck:"Charges nominales illustrées · aucune majoration dynamique affichée",deadOnly:"Charges permanentes seulement",subdivisions:"Intervalles par travée",subdivisionHelp:"Les stations du tableau sont indépendantes de la précision du calcul. Deux lignes aux appuis communs conservent les cisaillements gauche/droite; les réactions apparaissent une seule fois dans les fichiers.",station:"Station",side:"Côté",left:"Gauche",right:"Droite",xLocal:"x local",up:"haut",down:"bas",restore:"Afficher l’enveloppe",critical:"Disposition déterminante",axles:"Essieux",dynamicFactor:"Facteur CMD",unloaded:"Sans surcharge routière",totalLength:"Longueur totale",elapsed:"Calcul",positions:"positions",groups:"groupes d’essieux",reactionHelp:"Min / max à chaque appui; les extrêmes peuvent provenir de dispositions différentes.",methodTitle:"Base de l’analyse",methodBody:"PyCBA résout la poutre 1D d’Euler–Bernoulli par la méthode matricielle des déplacements. Les appuis articulés et à rouleaux bloquent le déplacement vertical et permettent la rotation; la continuité est conservée aux appuis intermédiaires. Les déformations axiales et de cisaillement sont exclues.",sectionNotes:"Propriétés des sections",sectionBody:"L’aire, le centre de gravité et I sont calculés à partir des deux semelles et de l’âme par le théorème des axes parallèles. E est homogène dans chaque section. Seule la hauteur totale varie. Les semelles, l’épaisseur de l’âme, E et le multiplicateur sont ceux de la section initiale de la zone et changent aux limites des zones. La section finale fournit seulement la hauteur cible. EI = E × I brut × multiplicateur; le solveur utilise ensuite un profil EI positif linéaire par morceaux. Les sections EI direct utilisent la rigidité constante saisie (kN·m²), sans aire ni inertie déduite. Les goussets paraboliques sont tangents à leur extrémité la moins haute. Les propriétés sont brutes, sans fissuration, action composite, précontrainte ni poids propre automatiques.",loadNotes:"Groupes d’essieux et cas de voie",loadBody:"Les modèles canadiens CL-625 et CL-750-QC vérifient tous les sous-ensembles non vides d’essieux en conservant leurs espacements. L’article 3.8.4.5.3 de CAN/CSA S6-25 régit leur CMD, y compris le groupe particulier 1–2–3. Leurs cas de voie utilisent les essieux réduits et une charge uniforme sur les régions défavorables, sans CMD sur les deux composantes. HL-93 vérifie le camion ou le tandem complet. L’espacement arrière du camion est enveloppé de 4,3 à 9,0 m, son CMD de 33 % s’applique seulement aux essieux, et sa charge uniforme de 9,3 kN/m n’est pas majorée. Cooper utilise le train E complet de PyCBA avec sa charge uniforme associée. Les cas véhicule et voie sont des alternatives dans cet outil.",scopeBody:"Les résultats sont les effets longitudinaux d’une voie. Aucun facteur de charge ÉLUL/ÉLUT, facteur RL, facteur de répartition transversale, CMD de joint de tablier ou règle d’ouvrage enfoui n’est appliqué. Les facteurs des véhicules personnalisés comptent les essieux individuels; les groupes d’essieux de camions spéciaux ne sont pas déduits.",precisionTitle:"Précision et résultats",precisionBody:"Les fonctions d’influence des réactions et les flèches PyCBA sont interpolées dans chaque travée. V et M sont calculés par équilibre de section. L’intégration des flèches est corrigée pour respecter le déplacement nul aux appuis. La subdivision du tableau ne définit jamais la précision de calcul. Le mode fin raffine le passage, les influences, les profils EI et l’intégration. Une enveloppe regroupe des extrêmes distincts, et non un cas simultané; cliquez sur un extrême pour voir sa disposition compatible.",unitsTitle:"Unités et conventions",unitsBody:"Coordonnées du pont : m. Dimensions des sections : mm. E : GPa. Charges : kN et kN/m. Moment : kN·m, positif en travée et tracé sous l’axe. Flèche : mm, positive vers le bas. Réactions : kN, positives vers le haut. Les deux cisaillements aux appuis intermédiaires sont conservés.",sourceTitle:"Références",noResults:"Les résultats apparaîtront après une analyse valide.",remove:"Supprimer",name:"Nom",deleteSectionHelp:"Cette section est utilisée. Réaffectez ses travées et ses zones avant de la supprimer.",busyExport:"Les résultats sont en cours de mise à jour. Les exports seront disponibles à la fin du calcul.",snapshotHelp:"La position saisie affiche les charges nominales. Le solveur conserve le facteur de code choisi; un cas voie canadien applique seulement sa fraction de voie.",originalDirection:"La coordonnée de l’essieu avant suit l’essieu physique 1 dans les deux sens.",methodScope:"Facteurs inclus",laneCaption:"Régions de voie défavorables",permanentName:"Charge permanente",manualCaption:"Véhicule complet positionné",spanSection:"Section par travée",statusDetail:"Mise à jour automatique après modification",factorCount:"Nombre d’essieux",showCase:"Examiner cette disposition de charges",reactionCase:"Examiner la réaction",caseMethod:"Les extrêmes camion/voie peuvent survenir à des positions différentes."
 }
};
let lang = localStorage.getItem("qb-language-v03") === "en" ? "en" : "fr";
let model, result, jobId, defaultModel, snap = null, inputPanel = "geometry", view = "diagrams", display = "envelope", manualDirection = "forward", revision = 0, timer, positionTimer, snapRevision = 0;
let projectName="", savedModel="", savedProjectName="", pendingProject=null;
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
 const envelope={format:'QuickerBridgeProject',schema_version:2,app_version:QB_META.version,name:projectName||t('untitled'),saved_at:new Date().toISOString(),model:clone(model)};
 const url=URL.createObjectURL(new Blob([JSON.stringify(envelope,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download=`${safeFilename(envelope.name)}.quickerbridge.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 projectName=envelope.name;savedModel=modelText();savedProjectName=projectName;updateProjectState();$('#status').textContent=t('saved');return true;
}
async function validateSelectedProject(file) {
 if(file.size>1024*1024){throw Error('project.too_large')}
 return solver.request('validate_project',{text:await file.text()});
}
function applyProject(project) {
 revision++;snapRevision++;clearTimeout(timer);clearExcelFile();result=null;jobId=null;snap=null;display='envelope';
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
 return `<label class="field ${options.full?'full':''}" for="${id}"><span>${esc(t(key))}${unit}</span><input id="${id}" data-path="${path}" data-scale="${scale}" type="${options.text?'text':'number'}" ${options.text?'maxlength="80"':`step="${options.step || 'any'}" min="${options.min ?? 0}" ${options.max!==undefined?`max="${options.max}"`:''}`} value="${esc(options.text?value:value / scale)}"></label>`;
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
 if(live.vehicle==='Cooper'){
  const loco=[5,10,10,10,10,6.5,6.5,6.5,6.5],scale=(live.cooper_e??80)/10*4.4482216;
  return {weights:[...loco,...loco].map(w=>w*scale),spaces:[8,5,5,5,9,5,6,5,8,8,5,5,5,9,5,6,5].map(s=>s*.3048)};
 }
 return {weights:live.weights,spaces:live.spacings};
}
function vehicleName(vehicle=model.live.vehicle) {return vehicle==='CL625'?'CL-625':vehicle==='CL750QC'?'CL-750-QC':vehicle==='HL93Truck'?t('hl93Truck'):vehicle==='HL93Tandem'?t('hl93Tandem'):vehicle==='Cooper'?t('cooper'):t('custom');}
function canadianLaneVehicle(vehicle=model.live.vehicle) {return ['CL625','CL750QC','custom'].includes(vehicle);}
function visualAxleFactor(record=snap?.record) {const lane=record?record.case==='lane':model.live.case==='lane';if(!lane||!canadianLaneVehicle())return 1;return model.live.vehicle==='CL625'?.8:model.live.lane_fraction;}
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
  html+=`<div class="section-label">${t('supports')}</div>`+model.supports.map((s,i)=>`<div class="support-row"><label for="support-${i}">${t('support')} ${i+1}</label><select id="support-${i}" data-path="supports.${i}"><option value="pin" ${s==='pin'?'selected':''}>${t('pin')}</option><option value="roller" ${s==='roller'?'selected':''}>${t('roller')}</option></select></div>`).join('');
  html+=`<p class="help">${t('supportHelp')}</p><div class="section-label">${t('resolution')}</div>${select('resolution','precision',model.precision,[['standard',t('standard')],['fine',t('fine')]])}<p class="help">${t('precisionHelp')}</p><div class="note">${t('totalLength')}: <b>${fmt(model.spans.reduce((v,s)=>v+s.length,0))} m</b></div>`;
 } else if(inputPanel==="sections") {
  html=`<label class="toggle-row"><input type="checkbox" data-path="nonprismatic" ${model.nonprismatic?'checked':''}>${t('nonprismatic')}</label><p class="help">${t('sectionHelp')}</p>`;
  html+=model.sections.map((s,i)=>{const p=sectionProps(s);return `<section class="section-card"><div class="card-head"><input aria-label="${t('name')}" data-path="sections.${i}.name" value="${esc(s.name)}" maxlength="60"><button data-remove-section="${i}" class="icon-button" title="${t('remove')}" ${model.sections.length===1?'disabled':''}>×</button></div>${select('sectionType',`sections.${i}.kind`,s.kind||'girder',[['girder',t('girder')],['ei',t('directEI')]])}${sectionSvg(s)}<div class="section-props">${s.kind==='ei'?`<span>EI ${fmt(p.EI,0)} kN·m²</span>`:`<span>A ${fmt(p.A,4)} m²</span><span>I ${fmt(p.I,5)} m⁴</span><span>EI ${fmt(p.EI,0)} kN·m²</span>`}</div>${s.kind==='ei'?field('directEI',`sections.${i}.EI`,s.EI,'',{min:0.000001,max:1e15}):`${field('E',`sections.${i}.E`,s.E,'',{min:0.1,max:1000})}${field('inertiaModifier',`sections.${i}.inertia_modifier`,s.inertia_modifier??1,'',{min:0.000001,max:1000})}<p class="help">${t('modifierHelp')}</p><div class="field-row dimensions">${['depth','web_thickness','top_width','top_thickness','bottom_width','bottom_thickness'].map(key=>field(key,`sections.${i}.${key}`,s[key],'',{min:.1,max:20000})).join('')}</div>`}</section>`}).join('');
  html+=`<button class="add-button" id="add-section">${t('addSection')}</button><div class="section-label">${t('spanSection')}</div>`;
  html+=model.spans.map((s,i)=>`<section class="section-card"><b>${t('span')} ${i+1} · ${fmt(s.length)} m</b>${model.nonprismatic?`<div>${s.zones.map((z,j)=>`<div class="zone"><div class="zone-heading">${t('zone')} ${j+1}<button class="icon-button" data-remove-zone="${i},${j}" ${s.zones.length===1?'disabled':''} title="${t('remove')}">×</button></div>${field('zoneEnd',`spans.${i}.zones.${j}.end`,z.end,'',{scale:.01,min:.1,max:100})}${select('profile',`spans.${i}.zones.${j}.profile`,z.profile,model.sections[z.section].kind==='ei'?[['constant',t('constant')]]:[['constant',t('constant')],['linear',t('linear')],['parabolic',t('parabolic')]])}${select('startSection',`spans.${i}.zones.${j}.section`,z.section,sectionOptions())}${z.profile!=='constant'?select('endSection',`spans.${i}.zones.${j}.end_section`,z.end_section??z.section,sectionOptions()):''}</div>`).join('')}</div><button class="add-button" data-add-zone="${i}" ${s.zones.length>=12?'disabled':''}>${t('addZone')}</button>`:select('section',`spans.${i}.section`,s.section,sectionOptions())}</section>`).join('');
  if(model.nonprismatic) html+=`<p class="help">${t('zoneHelp')}</p>`;
 } else if(model.load_mode==='thermal') {
  const dt=model.thermal.delta_T;
  html=`<div class="section-label">${t('thermalLoads')}</div><div class="load-card thermal-card"><div class="thermal-gradient"><span>${t('deltaT')}</span><b>${dt>0?'+':''}${fmt(dt,1)} °C</b></div>${field('deltaT','thermal.delta_T',dt,'',{min:-100,max:100})}${field('alpha','thermal.alpha_micro',model.thermal.alpha_micro,'',{min:.01,max:100})}${field('thermalDepth','thermal.depth',model.thermal.depth,'',{min:.1,max:15000})}<p class="help">${t('thermalHelp')}</p></div>`;
 } else {
  html=`<div class="section-label">${t('deadLoads')}</div>`+model.dead.map((load,i)=>`<div class="load-card"><div class="card-head"><input aria-label="${t('name')}" data-path="dead.${i}.name" maxlength="80" value="${esc(load.name)}"><button data-remove-dead="${i}" class="icon-button" title="${t('remove')}">×</button></div>${field('intensity',`dead.${i}.w`,load.w)}${select('applyTo',`dead.${i}.span`,load.span,[[-1,t('allSpans')],...model.spans.map((s,j)=>[j,`${t('span')} ${j+1}`])])}<div class="field-row">${field('from',`dead.${i}.start`,load.start,'',{scale:.01,min:0,max:99.9})}${field('to',`dead.${i}.end`,load.end,'',{scale:.01,min:.1,max:100})}</div></div>`).join('');
  html+=`<button class="add-button" id="add-dead">${t('addDead')}</button><div class="section-label">${t('liveLoads')}</div>${select('vehicle','live.vehicle',model.live.vehicle,[['CL625','CL-625'],['CL750QC','CL-750-QC'],['HL93Truck',t('hl93Truck')],['HL93Tandem',t('hl93Tandem')],['Cooper',t('cooper')],['custom',t('custom')]])}`;
  const pattern=vehiclePattern(),weights=pattern.weights,gaps=pattern.spaces;
  if(model.live.vehicle==='custom')html+=`<label class="field"><span>${t('axleCount')}</span><select id="axle-count">${[1,2,3,4,5,6,7].map(n=>`<option ${n===weights.length?'selected':''}>${n}</option>`).join('')}</select></label>`;
  if(model.live.vehicle==='Cooper')html+=`${field('cooperE','live.cooper_e',model.live.cooper_e,'',{min:10,max:200})}<p class="help">${t('cooperHelp')}</p><div class="case-breakdown">18 ${t('axles').toLowerCase()} · E${fmt(model.live.cooper_e,0)} · ${t('laneIntensity')}: ${fmt(model.live.cooper_e/10*4.4482216/.3048,1)} kN/m</div>`;
  else {html+=`<table class="axle-table"><thead><tr><th>${t('axle')}</th><th>${t('load')}</th><th>${t('spacing')}</th></tr></thead><tbody>${weights.map((w,i)=>`<tr><td>${i+1}</td><td>${model.live.vehicle==='custom'?`<input aria-label="${t('axle')} ${i+1} ${t('load')}" type="number" min="0.1" max="10000" data-path="live.weights.${i}" value="${w}">`:fmt(w,0)}</td><td>${i<gaps.length?(model.live.vehicle==='custom'?`<input aria-label="${t('spacing')} ${i+1}" type="number" min="0.01" max="50" step="0.1" data-path="live.spacings.${i}" value="${gaps[i]}">`:fmt(gaps[i],1)):'—'}</td></tr>`).join('')}</tbody></table><div class="case-breakdown">Σ ${fmt(weights.reduce((a,b)=>a+b,0),0)} kN · ${fmt(gaps.reduce((a,b)=>a+b,0),1)} m</div>`;if(model.live.vehicle==='HL93Truck')html+=`<p class="help">${t('hl93Spacing')}</p>`;}
  html+=select('case','live.case',model.live.case,[['governing',t('governing')],['truck',t('truck')],['lane',t('lane')]]);
  if(model.live.case!=='truck') {
   if(canadianLaneVehicle()&&model.live.vehicle!=='CL625')html+=select('fraction','live.lane_fraction',model.live.lane_fraction,[[.8,'80 %'],[.63,'63 %']]);
   const laneW=model.live.vehicle==='CL625'?9:model.live.vehicle==='CL750QC'?12.6:model.live.vehicle==='HL93Truck'||model.live.vehicle==='HL93Tandem'?9.3:model.live.vehicle==='Cooper'?model.live.cooper_e/10*4.4482216/.3048:model.live.lane_w;
   if(model.live.vehicle==='custom')html+=field('laneIntensity','live.lane_w',model.live.lane_w);else html+=`<p class="note">${t('laneIntensity')}: <b>${fmt(laneW,1)}</b> kN/m${model.live.vehicle==='CL625'?' · 80 %':''}</p>`;
   html+=`<p class="help">${canadianLaneVehicle()?t('canadianLaneHelp'):t('fullLaneHelp')}</p>`;
   if(model.live.vehicle==='CL750QC')html+=`<p class="help">${t('fractionHelp')}</p>`;
  }
  html+=model.live.vehicle==='Cooper'?`<p class="help">${t('noDynamic')}</p>`:`<label class="toggle-row"><input type="checkbox" data-path="live.dynamic" ${model.live.dynamic?'checked':''}>${t('dynamic')}</label><p class="help">${t('factorHelp')}</p>`;html+=select('direction','live.direction',model.live.direction,[['both',t('bothDirections')],['forward',t('forward')],['reverse',t('backward')]]);
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
 let value=el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value)*Number(el.dataset.scale||1):el.value;
 if(el.tagName==='SELECT' && (path.endsWith('section')||path.endsWith('end_section')||path.endsWith('.span')||path==='live.lane_fraction'))value=Number(value);
 setValue(path,value);
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
 revision++;snapRevision++;clearTimeout(timer);clearTimeout(positionTimer);snap=null;display='envelope';$('#error').classList.add('hidden');$('#status').textContent=t('solving');$('#status').classList.add('busy');$('#excel').disabled=true;$('#charts').classList.add('stale');renderBeam();updateProjectState();timer=setTimeout(()=>calculate(revision),450);
}
const solver = new BrowserSolver(stage=>{$('#status').textContent=`${t('initializing')} · ${stage}`;});
async function calculate(token) {
 try {
  const key=String(token),data=await solver.request('analyse',{model:clone(model),job:key});
  if(token!==revision)return;
  result=data;jobId=key;snap=null;display='envelope';
  $('#status').textContent=`${t('ready')} · ${fmt(result.meta.elapsed,2)} s`;
  $('#status').classList.remove('busy');$('#charts').classList.remove('stale');$('#excel').disabled=false;
  renderResults();renderBeam();
 }catch(e){if(token===revision){console.error(e);invalidate(t('invalid'))}}
}
function clearExcelFile(){const file=$('#excel-file');if(file){URL.revokeObjectURL(file.href);file.remove();}}
async function downloadExcel() {
 const key=jobId,language=lang,token=revision;
 $('#excel').disabled=true;$('#excel').textContent='Excel…';
 try {
  const data=await solver.request('excel',{job:key,lang:language});
  if(token!==revision)return;
  const url=URL.createObjectURL(new Blob([Uint8Array.from(atob(data),c=>c.charCodeAt(0))],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
  const previous=$('#excel-file');if(previous){URL.revokeObjectURL(previous.href);previous.remove();}
  const a=document.createElement('a');a.id='excel-file';a.href=url;a.download=`QuickerBridge-v${QB_META.version}-${language}.xlsx`;a.textContent=language==='fr'?'Fichier prêt ↓':'File ready ↓';a.className='excel-file';$('#excel').after(a);a.click();
 }catch(e){console.error(e);$('#error').textContent=t('failed');$('#error').classList.remove('hidden')}
 finally{if(token===revision)$('#excel').disabled=false;$('#excel').textContent='↓ Excel';}
}
function renderBeam() {
 if(!model)return;
 const total=model.spans.reduce((v,s)=>v+s.length,0);if(!Number.isFinite(total)||total<=0)return;
 const xp=x=>55+x/total*890;
 let starts=[0];model.spans.forEach(s=>starts.push(starts.at(-1)+s.length));
 const beamDepth=s=>s.kind==='ei'?1800:s.depth;
 const maxDepth=Math.max(...model.sections.map(beamDepth)), depthScale=23/maxDepth;
 let svg=`<defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0 0L5 3L0 6Z" fill="#ecb46a"/></marker><marker id="dl-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#7aabb9"/></marker><linearGradient id="thermal-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ed875c"/><stop offset=".52" stop-color="#f2d6b1"/><stop offset="1" stop-color="#70b6d3"/></linearGradient></defs>`;
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
  const axles=snap&&display==='snapshot'?snap.axles:weights.map((w,i)=>({x:front-offsets[i],load:w,id:i+1})).filter(a=>a.x>=0&&a.x<=total);
  const loadScale=35/Math.max(...displayWeights);let previousLabel=null;
  axles.forEach(a=>{const shownLoad=displayWeights[a.id-1],y=61-shownLoad*loadScale;let labelY=y-5;if(previousLabel&&Math.abs(xp(a.x)-previousLabel.x)<30&&Math.abs(labelY-previousLabel.y)<12)labelY-=12;previousLabel={x:xp(a.x),y:labelY};svg+=`<line class="axle-arrow" data-load="${shownLoad}" x1="${xp(a.x)}" x2="${xp(a.x)}" y1="${y}" y2="61" stroke="#ecb46a" stroke-width="1.6" marker-end="url(#arrow)"/><text x="${xp(a.x)}" y="${labelY}" text-anchor="middle" font-size="12" fill="#ffd49a">${fmt(shownLoad,0)}</text>`});
 }
 if(model.load_mode==='thermal')svg+=`<rect x="${xp(0)}" y="19" width="${xp(total)-xp(0)}" height="25" rx="4" fill="url(#thermal-gradient)" opacity=".92"/><text x="${xp(0)+8}" y="35" font-size="11" fill="#17374b">T<tspan baseline-shift="sub">${lang==='fr'?'dessous':'bottom'}</tspan></text><text x="${xp(total)-8}" y="35" text-anchor="end" font-size="11" fill="#17374b">T<tspan baseline-shift="sub">${lang==='fr'?'dessus':'top'}</tspan> · ΔT ${model.thermal.delta_T>0?'+':''}${fmt(model.thermal.delta_T,1)} °C</text>`;
 starts.forEach((x,i)=>{
  const X=xp(x);svg+=`<path d="M${X} 89l-8 13h16Z" fill="#dceaf0" stroke="#dceaf0"/>`;
  if(model.supports[i]==='roller')svg+=`<circle cx="${X-4}" cy="105" r="2" fill="#cadbe3"/><circle cx="${X+4}" cy="105" r="2" fill="#cadbe3"/>`;
  svg+=`<line x1="${X-13}" x2="${X+13}" y1="109" y2="109" stroke="#7695a6"/><text x="${X}" y="121" text-anchor="middle" font-size="11" fill="#91acbb">R${i+1}</text>`;
 });
 $('#beam').innerHTML=svg;$('#beam').setAttribute('aria-label',t('beamLoads'));
 $('#model-summary').textContent=`${model.spans.length} ${t('span').toLowerCase()}${lang==='en'&&model.spans.length>1?'s':lang==='fr'&&model.spans.length>1?'s':''} · ${fmt(total)} m`;
 $('#load-caption').innerHTML=model.load_mode==='thermal'?`<span class="thermal-badge">${t('thermalOnly')} · α ${fmt(model.thermal.alpha_micro,2)}×10⁻⁶/°C · h ${fmt(model.thermal.depth,0)} mm</span>`:model.load_mode==='dead'?t('deadOnly'):snap&&display==='snapshot'?caseText(snap.record):`${vehicleName()} · ${t('nominalTruck')}`;
}
function caseText(c) {
 if(!c)return '';
 const name=c.case==='lane'?t('lane'):c.case==='unloaded'?t('unloaded'):t('truck');
 const canadianLane=c.case==='lane'&&canadianLaneVehicle(),factor=canadianLane?`${t('appliedFactor')} ×${fmt(visualAxleFactor(c),2)}`:model.live.vehicle==='Cooper'?t('noDynamic'):`${t('dynamicFactor')} ×${fmt(c.factor,2)}`;
 return `${name} · ${t('axles')} ${c.axles.length?c.axles.join('–'):'—'} · ${factor}${c.rear_spacing!==undefined?` · s₃ = ${fmt(c.rear_spacing,2)} m`:''} · x₁ = ${fmt(c.position)} m · ${c.direction==='forward'?t('forward'):t('backward')}`;
}
function showView(name) {
 view=name;$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));$$('.result-view').forEach(el=>el.classList.toggle('hidden',el.id!==name+'-view'));
}
function renderResults() {
 if(!result){$('#charts').innerHTML=`<p class="help">${t('noResults')}</p>`;return;}
 const thermal=result.kind==='thermal';
 const ext=result.extrema;const shear=ext.filter(e=>e.response==='V').reduce((a,b)=>Math.abs(a.value)>Math.abs(b.value)?a:b);const defl=ext.filter(e=>e.response==='D').reduce((a,b)=>Math.abs(a.value)>Math.abs(b.value)?a:b);
 const metrics=[[t(thermal?'maxMoment':'sagging'),ext[0],'kN·m'],[t(thermal?'minMoment':'hogging'),ext[1],'kN·m'],[t('maxShear'),shear,'kN'],[t('maxDeflection'),defl,'mm']];
 $('#metrics').innerHTML=metrics.map(([label,e,unit],i)=>{const tag=thermal?'div':'button';return `<${tag} class="metric" ${thermal?'':`data-critical="${e.index}" data-sense="${e.sense}" title="${t('showCase')}"`}><div class="metric-label">${label}</div><div class="metric-value">${fmt(i>=2?Math.abs(e.value):e.value,unit==='mm'?2:1)} <small>${unit}</small></div><div class="metric-location">${i>=2?(e.value<0?'−':'+')+' · ':''}${t('at')} x = ${fmt(e.x)} m${thermal?'':' ↗'}</div></${tag}>`}).join('');
 $('#reactions').innerHTML=result.reactions.map((r,i)=>`<div class="reaction"><small>R${r.support} · ${fmt(r.x,1)} m</small>${thermal?fmt(r.value,1):snap&&display==='snapshot'?fmt(snap.R[i],1):`<button class="text-button" data-critical="${3*result.x.length+i}" data-sense="min" title="${t('reactionCase')}">${fmt(r.min,1)}</button> / <button class="text-button" data-critical="${3*result.x.length+i}" data-sense="max" title="${t('reactionCase')}">${fmt(r.max,1)}</button>`}</div>`).join('');
 $('.reaction-title').textContent=t('supportReactions')+' · '+t(thermal?'thermalCase':snap&&display==='snapshot'?'snapshot':'envelope');
 $('#excel').title=t(thermal?'thermalCase':'envelope');
 $('#reactions').title=thermal?t('thermalCase'):t('reactionHelp');
 $('#precision-note').textContent=thermal?`PyCBA ${result.meta.pycba} · ${t('curvature')} κ = ${Number(result.meta.curvature).toExponential(3)} 1/m`:`PyCBA ${result.meta.pycba} · Δx ${fmt(result.meta.travel_step,2)} m · ${fmt(result.meta.positions,0)} ${t('positions')} · ${result.meta.groups} ${t('groups')}`;
 renderCharts();renderTable();renderMethod();showView(view);
 $('#display-controls').classList.toggle('hidden',thermal);$$('[data-display]').forEach(b=>b.classList.toggle('active',b.dataset.display===display));$('#position-controls').classList.toggle('hidden',thermal||display!=='snapshot');
 if(!thermal)syncPositionControls(snap?.record.position);
 $('#legend').classList.toggle('hidden',thermal||display==='snapshot');
 if(snap&&display==='snapshot'){$('#governing').innerHTML=`<span>${caseText(snap.record)}</span><button id="restore" class="text-button">${t('restore')}</button>`;$('#governing').classList.remove('hidden')}
 else $('#governing').classList.add('hidden');
}
function renderCharts() {
 if(!result)return;
 const thermal=result.kind==='thermal',graph=!thermal&&snap&&display==='snapshot'?(snap.plot||snap):null;
 const xs=graph?graph.x:result.x;
 const total=result.x.at(-1),X=x=>26+x/total*874;
 const cfg=[['V',t('shear'),'kN','#407dcc',-1],['M',t('moment'),'kN·m','#008378',1],['D',t('deflection'),'mm','#9d762e',1]];
 $('#charts').innerHTML=cfg.map(([key,label,unit,color,direction])=>{
  const lo=graph?graph[key]:thermal?result.values[key]:result.min[key],hi=graph?graph[key]:thermal?result.values[key]:result.max[key];
  const amp=Math.max(...lo.map(Math.abs),...hi.map(Math.abs),1e-6)*1.12,Y=v=>48+direction*v/amp*34;
  const path=values=>values.map((v,i)=>`${i?'L':'M'}${X(xs[i]).toFixed(3)},${Y(v).toFixed(3)}`).join('');
  const polygon=path(hi)+lo.map((_,j)=>{const i=lo.length-1-j;return `L${X(xs[i]).toFixed(3)},${Y(lo[i]).toFixed(3)}`}).join('')+'Z';
  let svg=`<line x1="26" x2="900" y1="48" y2="48" stroke="#9db4c1" stroke-width=".8"/>`;
  result.reactions.forEach(r=>{svg+=`<line x1="${X(r.x)}" x2="${X(r.x)}" y1="8" y2="86" stroke="#dbe5eb" stroke-dasharray="3 3"/><text x="${X(r.x)}" y="99" text-anchor="middle">${fmt(r.x,1)}</text>`});
  svg+=`<text x="20" y="51" text-anchor="end">0</text>${thermal?'':`<path d="${polygon}" fill="${color}" fill-opacity=".13"/>`}${!thermal&&!graph?`<path class="envelope-lower" d="${path(lo)}" fill="none" stroke="${color}" stroke-width="2.4"/>`:""}<path class="envelope-upper" d="${path(hi)}" fill="none" stroke="${color}" stroke-width="2.4"/><line class="cursor" x1="0" x2="0" y1="7" y2="86" stroke="#426774" stroke-dasharray="2 2" visibility="hidden"/><circle class="cursor-high" r="3" fill="${color}" visibility="hidden"/>${thermal?'':`<circle class="cursor-low" r="3" fill="${color}" visibility="hidden"/>`}`;
  return `<div class="chart-row"><div class="chart-label" style="color:${color}">${label}<small>${unit}</small></div><svg class="plot" tabindex="0" role="img" aria-label="${label} · ${unit}" data-effect="${key}" data-amp="${amp}" data-sign="${direction}" viewBox="0 0 926 106" preserveAspectRatio="none">${svg}</svg></div>`;
 }).join('');
 $$('.plot').forEach(svg=>{svg.addEventListener('pointermove',chartHover);if(!thermal){svg.addEventListener('click',chartClick);svg.addEventListener('keydown',e=>{if(e.key==='Enter')inspectCase(svg.dataset.effect==='M'?result.x.length:svg.dataset.effect==='D'?2*result.x.length:0,'max')})}});
}
function nearest(x,xs=result.x) {let best=0;for(let i=1;i<xs.length;i++)if(Math.abs(xs[i]-x)<Math.abs(xs[best]-x))best=i;return best;}
function currentGraph(){return snap&&display==='snapshot'?(snap.plot||snap):null;}
function pointerStation(e) {const rect=e.currentTarget.getBoundingClientRect();return nearest(Math.max(0,Math.min(1,((e.clientX-rect.left)/rect.width*926-26)/874))*result.x.at(-1),currentGraph()?.x||result.x);}
function chartHover(e) {
 if(!result)return;const graph=currentGraph(),i=pointerStation(e),x=(graph?.x||result.x)[i],sx=26+x/result.x.at(-1)*874;
 $$('.plot').forEach(svg=>{
  const key=svg.dataset.effect,thermal=result.kind==='thermal',lo=graph?graph[key][i]:thermal?result.values[key][i]:result.min[key][i],hi=graph?graph[key][i]:thermal?result.values[key][i]:result.max[key][i],Y=v=>48+Number(svg.dataset.sign)*v/Number(svg.dataset.amp)*34;
  const line=svg.querySelector('.cursor');line.setAttribute('x1',sx);line.setAttribute('x2',sx);line.setAttribute('visibility','visible');
  [['.cursor-high',hi],['.cursor-low',lo]].forEach(([cl,v])=>{const circle=svg.querySelector(cl);if(circle){circle.setAttribute('cx',sx);circle.setAttribute('cy',Y(v));circle.setAttribute('visibility','visible')}});
 });
 $('#station-readout').innerHTML=`<span>x <b>${fmt(x)} m</b> · ${t((graph?.sides||result.sides)[i])}</span>`+['V','M','D'].map(k=>`<span>${k==='D'?'δ':k} <b>${graph?fmt(graph[k][i]):result.kind==='thermal'?fmt(result.values[k][i]):fmt(result.min[k][i])+' / '+fmt(result.max[k][i])}</b> ${k==='M'?'kN·m':k==='V'?'kN':'mm'}</span>`).join('');
}
function chartClick(e) {
 if(!result||result.kind==='thermal')return;const gi=pointerStation(e),i=currentGraph()?nearest(currentGraph().x[gi]):gi,key=e.currentTarget.dataset.effect,offset=key==='M'?result.x.length:key==='D'?2*result.x.length:0;
 const rect=e.currentTarget.getBoundingClientRect(),y=(e.clientY-rect.top)/rect.height*106,Y=v=>48+Number(e.currentTarget.dataset.sign)*v/Number(e.currentTarget.dataset.amp)*34;
 const sense=Math.abs(y-Y(result.min[key][i]))<Math.abs(y-Y(result.max[key][i]))?'min':'max';inspectCase(offset+i,sense);
}
async function inspectCase(index,sense,position=null) {
 if(!result||result.kind==='thermal'||$('#excel').disabled)return;
 const token=++snapRevision;
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
 $('#table-view').innerHTML=`<p class="help">${t(thermal?'thermalCase':'envelope')} · V: kN · M: kN·m · δ: mm · R: kN</p><label class="table-options">${t('subdivisions')} <input id="subdivisions" type="number" min="2" max="100" step="1" data-path="subdivisions" value="${model.subdivisions}"></label><div class="table-scroll"><table><thead><tr><th>${t('span')}</th><th>x (m)</th><th>${t('side')}</th>${headers}</tr></thead><tbody>${result.table.map(row=>{const r=result.reactions.find(r=>Math.abs(r.x-row.x)<1e-8&&!seen.has(r.support));if(r)seen.add(r.support);const cells=thermal?['V','M','D'].map(k=>`<td>${fmt(row[k])}</td>`).join('')+`<td>${r?fmt(r.value):'—'}</td>`:['V_min','V_max','M_min','M_max','D_min','D_max'].map(k=>`<td>${fmt(row[k])}</td>`).join('')+`<td>${r?fmt(r.min):'—'}</td><td>${r?fmt(r.max):'—'}</td>`;return `<tr class="${row.station===0||row.station===model.subdivisions?'support-station':''}"><td>${row.span} · ${row.station}</td><td>${fmt(row.x)}</td><td>${t(row.side)}</td>${cells}</tr>`}).join('')}</tbody></table></div><div class="table-footnote">V: kN · M: kN·m · δ: mm<br>${t('subdivisionHelp')}</div>`;
}
function renderMethod() {
 const thermal=result?.kind==='thermal',sections=thermal?[['methodTitle','methodBody'],['thermalNotes','thermalBody'],['sectionNotes','sectionBody'],['unitsTitle','unitsBody']]:[['methodTitle','methodBody'],['sectionNotes','sectionBody'],['loadNotes','loadBody'],['methodScope','scopeBody'],['precisionTitle','precisionBody'],['unitsTitle','unitsBody']];
 const source=model?.live?.vehicle==='CL750QC'?`CAN/CSA S6-25 · 3.8.4.5.3<br>MTQ · Info-structures A2023-05 · 2023-02-17<br>`:model?.live?.vehicle==='CL625'?`CAN/CSA S6-25 · 3.8.4.5.3<br>`:model?.live?.vehicle==='HL93Truck'||model?.live?.vehicle==='HL93Tandem'?`AASHTO LRFD HL-93 · PyCBA VehicleLibrary.US<br>`:model?.live?.vehicle==='Cooper'?`AREA / AREMA Cooper E · PyCBA VehicleLibrary.US<br>`:'';
 $('#method-view').innerHTML=`<div class="method-content">${sections.map(([h,p])=>`<h3>${t(h)}</h3><p>${t(p)}</p>`).join('')}<h3>${t('sourceTitle')}</h3><p>${thermal?'':source}<a href="https://ccaprani.github.io/pycba/" target="_blank" rel="noreferrer">PyCBA · ${result?result.meta.pycba:'1.0.1'}</a></p></div>`;
}
function restoreEnvelope() {snapRevision++;snap=null;display='envelope';renderResults();renderBeam();}
document.addEventListener('keydown',e=>{if(e.target.type==='number'&&['ArrowUp','ArrowDown'].includes(e.key))e.preventDefault()});
document.addEventListener('input',e=>{if(e.target.id==='position-slider'){const value=Number(e.target.value);$('#position').value=value;if(result&&display==='snapshot')queuePositionSnapshot(value);return;}onInput(e);});
document.addEventListener('change',e=>{
 if(e.target.id==='project-file'&&e.target.files[0]){openSelectedProject(e.target.files[0]);e.target.value='';return}
 if(e.target.id==='axle-count'){const n=Number(e.target.value);while(model.live.weights.length<n)model.live.weights.push(100);while(model.live.spacings.length<n-1)model.live.spacings.push(1.2);model.live.weights.length=n;model.live.spacings.length=n-1;renderInputs();changed();}
 if(e.target.id==='position' && e.target.validity.valid){syncPositionControls(Number(e.target.value));inspectCase(0,'max',Number(e.target.value));}
 if(e.target.dataset.path?.startsWith('sections.') && e.target.type==='number'){
  const i=Number(e.target.dataset.path.split('.')[1]),card=$$('#input-content > .section-card')[i],s=model.sections[i];
  if(card&&s){const p=sectionProps(s);card.querySelector('.section-svg').outerHTML=sectionSvg(s);card.querySelector('.section-props').innerHTML=`${s.kind==='ei'?`<span>EI ${fmt(p.EI,0)} kN·m²</span>`:`<span>A ${fmt(p.A,4)} m²</span><span>I ${fmt(p.I,5)} m⁴</span><span>EI ${fmt(p.EI,0)} kN·m²</span>`}`;}
 }
});
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(!model&&!['en','fr','collapse-inputs'].includes(b.id))return;
 if(b.id==='en'||b.id==='fr'){lang=b.id;localStorage.setItem('qb-language-v03',lang);translate();return}
 if(b.id==='open-project'){$('#project-file').click();return}
 if(b.id==='save-project'){saveProject();return}
 if(b.id==='collapse-inputs'){const collapsed=$('.inputs').classList.toggle('collapsed');b.textContent=collapsed?'+':'−';b.setAttribute('aria-expanded',!collapsed);return}
 if(b.dataset.panel){inputPanel=b.dataset.panel;$$('[data-panel]').forEach(el=>el.classList.toggle('active',el===b));renderInputs();return}
 if(b.dataset.view){showView(b.dataset.view);return}
 if(b.dataset.mode){model.load_mode=b.dataset.mode;$$('[data-mode]').forEach(el=>el.classList.toggle('active',el===b));renderInputs();changed();return}
 if(b.dataset.spans){const n=Number(b.dataset.spans);while(model.spans.length<n)model.spans.push(clone(model.spans.at(-1)));model.spans.length=n;model.supports=Array.from({length:n+1},(_,i)=>model.supports[i]||'roller');model.dead.forEach(d=>{if(d.span>=n)d.span=-1});renderInputs();changed();return}
 if(b.id==='reset'){model=clone(defaultModel);if(lang==='fr')model.dead[0].name=t('permanentName');projectName=t('untitled');$$('[data-mode]').forEach(el=>el.classList.toggle('active',el.dataset.mode===model.load_mode));renderInputs();changed();return}
 if(b.id==='add-section'){const s=clone(model.sections.at(-1));s.name='S'+(model.sections.length+1);model.sections.push(s);renderInputs();changed();return}
 if(b.dataset.removeSection!==undefined){const i=Number(b.dataset.removeSection);if(model.spans.some(s=>s.section===i||s.zones.some(z=>z.section===i||z.end_section===i))){$('#error').textContent=t('deleteSectionHelp');$('#error').classList.remove('hidden');return}model.sections.splice(i,1);model.spans.forEach(s=>{if(s.section>i)s.section--;s.zones.forEach(z=>{if(z.section>i)z.section--;if(z.end_section>i)z.end_section--})});renderInputs();changed();return}
 if(b.dataset.addZone!==undefined){const zones=model.spans[Number(b.dataset.addZone)].zones,last=zones.at(-1),previous=zones.length>1?zones.at(-2).end:0;last.end=(previous+1)/2;zones.push({...clone(last),end:1});renderInputs();changed();return}
 if(b.dataset.removeZone!==undefined){const [i,j]=b.dataset.removeZone.split(',').map(Number);const z=model.spans[i].zones;z.splice(j,1);z.at(-1).end=1;renderInputs();changed();return}
 if(b.id==='add-dead'){model.dead.push({name:t('permanentName')+' '+(model.dead.length+1),w:5,span:-1,start:0,end:1});renderInputs();changed();return}
 if(b.dataset.removeDead!==undefined){model.dead.splice(Number(b.dataset.removeDead),1);renderInputs();changed();return}
 if(b.dataset.critical!==undefined){inspectCase(Number(b.dataset.critical),b.dataset.sense);return}
 if(b.dataset.display==='envelope'||b.id==='restore'){restoreEnvelope();return}
 if(b.dataset.display==='snapshot'){syncPositionControls();inspectCase(0,'max',Number($('#position').value));return}
 if(b.id==='reverse'){manualDirection=manualDirection==='forward'?'reverse':'forward';syncPositionControls();inspectCase(0,'max',Number($('#position').value));return}
 if(b.id==='excel'&&jobId)downloadExcel();
});
async function init() {
 try{translate();await solver.ready;defaultModel=await solver.request('defaults');model=clone(defaultModel);if(lang==='fr')model.dead[0].name=t('permanentName');projectName=t('untitled');savedModel=modelText();savedProjectName=projectName;translate();changed();}
 catch(e){console.error(e);$('#error').textContent=t('offline');$('#error').classList.remove('hidden');$('#status').textContent=t('failed')}
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
init();

