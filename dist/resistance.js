"use strict";
// v0.9.98–0.9.99 — Résistance tab: factored resistance of the steel girders,
// CSA S6-25 Section 10, at every station of the analysis
// (quickerbridge/resistance.py). Nothing is typed by hand: the effects are
// those of the analysis (permanent loads, live load or both, chosen in the
// calculation sheet). Each girder section resists as a composite girder or as
// the girder alone. v0.9.99: Mr and Vr are no longer drawn on the main
// diagrams; the calculation sheet shows the V and M diagrams with Vr and Mr,
// a compact D/C summary and tables with one value per row (section
// properties, materials, effects of each load stage). Display only.
Object.assign(words.fr,{resistanceTab:'Résistance',resSheet:'Note de calcul',resSheetHint:'Diagrammes V et M avec Vr et Mr, station par station',resNoGirder:'Aucune poutre en I en acier : la résistance est calculée pour les sections « Poutre en I » (onglet Sections).',resTypesTitle:'Sections · type de résistance',resTypeComposite:'Mixte',resTypeSteel:'Acier seul',resNoSlabShort:'sans dalle',resDefineSlab:'Définir la dalle ↗',resNotChecked:'non vérifiée',resTypesHelp:'Mixte : avec la dalle des « Propriétés de section » (connecteurs). Acier seul : poutre seule (sans connecteurs, ou pendant la construction).',resWebTitle:'Âme et déversement',resStiffened:'Âme avec raidisseurs transversaux',resSpacing:'Espacement a (mm)',resUnstiffened:'Âme non raidie : a/h infini, kv = 5,34, pas de champ de tension.',resUnbraced:'Longueur non retenue L (mm)',resUnbracedHelp:'Semelle comprimée entre retenues latérales (10.10.2.3, ω2 = 1) : poutre acier seul en M+ et M−, semelle inférieure en M− mixte de classe 3.',resFoot:'φs 0,95 · φr 0,90 · φc 0,75 · fy armatures 400 MPa · S6-25, chapitre 10. Efforts de l’analyse, pondérés par les facteurs saisis (onglet Charges).',resLoadMode:'Cas analysé : {mode}. Pour la vérification ÉLUL, analysez « permanentes + surcharge ».',resComputing:'Calcul…',resNeedAnalysis:'Résultats disponibles après l’analyse.',resThermal:'Pas de résistance pour une déformation imposée.',resError:'Calcul impossible',resSummary:'Rapports D/C maximaux',resAt:'x = {x} m',resInteraction:'Interaction V-M',resOk:'OK',resNg:'NG',resStation:'Station x (m)',resPrev:'Station précédente',resNext:'Station suivante',resNoteTitle:'Résistance · note de calcul',resNoteSub:'CSA S6-25, chapitre 10',resNoSteelHere:'Pas de poutre en I en acier à cette station.',resEffects:'Efforts Mf et Vf',resEffDead:'Permanentes',resEffLive:'Surcharge',resEffBoth:'Perm. + surcharge',resEffShort:{dead:'permanentes',live:'surcharge',both:'permanentes + surcharge'},resDiagHelp:'Cliquez ou glissez sur un diagramme pour choisir la station (← → au clavier). Tirets : résistance; rouge : dépassement.',resShear:'Cisaillement',resMoment:'Moment',resKind:{composite:'Poutre mixte',steel:'Poutre acier seule'},resFactored:'Effort pondéré',resResist:'Résistance',resRatio:'D/C',resGeo:'Propriétés géométriques',resGeoSteel:'Poutre seule',resGeoComp:'Section mixte',resMat:'Matériaux et coefficients',resPlates:'Section à la station',resTopFlange:'Semelle sup.',resBottomFlange:'Semelle inf.',resWeb:'Âme',resDepth:'Hauteur',resSlab:'Dalle',resHaunch:'Gousset',resBe:'Largeur effective',resLoadsTitle:'Efforts appliqués à la station',resMomentsAt:'Moments (kN·m)',resShearsAt:'Efforts tranchants (kN)',resStageSw:'Poids propre',resStageSteel:'Permanentes « poutre seule »',resStage3n:'Autres permanentes',resLiveMax:'Surcharge (env. max)',resLiveMin:'Surcharge (env. min)',resOnSteel:'Acier seul',resOn3n:'Mixte 3n',resOn1n:'Mixte 1n',resMfPos:'M<sub>f</sub>+ retenu',resMfNeg:'M<sub>f</sub>− retenu',resVfUsed:'V<sub>f</sub> retenu',resNotUsed:'non retenu ({e})',resClassTitle:'Classe de la section (10.9.2)',resClassPos:'Classe M+',resClassNeg:'Classe M−',resClass:'classe',resClassRule:'Classe = la pire des trois plaques (10.9.2.1, sans effort axial).',resWebBasisH:'Âme : h/w (section mixte).',resWebBasis2dc:'Âme : 2dc/w avec dc élastique (poutre seule).',resShearTitle:'Cisaillement (10.10.5.1)',resCase:'Cas',resCaseA:'plastification (a)',resCaseB:'voilement inélastique (b)',resCaseC:'voilement élastique (c)',resInterTitle:'Cisaillement et moment combinés (10.10.5.2)',resInterApplies:'Âme raidie avec champ de tension (h/w > 502 √(kv/Fy)) : 0,727 Mf/Mr + 0,455 Vf/Vr ≤ 1, avec le plus grand de Mf+/Mr+ et Mf−/Mr− (efforts non concomitants, conservateur).',resInterNo:'Interaction V-M : ne s’applique pas (pas de champ de tension).',resPosTitle:'Moment positif M+',resNegTitle:'Moment négatif M−',resPna:'Axe neutre plastique',resPnaSlab:'dans la dalle (C1 ≥ C2)',resPnaSteel:'dans l’acier (C1 < C2)',resPnaFlange:'semelle sup.',resPnaWeb:'âme',resClass3Rule:'Classe 3, âme comprimée > 850 w/√Fy : figure 10.8.',resClass4Comp:'Classe 4 : règles de la classe 3 appliquées, à confirmer.',resBarsComp:'Les deux lits d’armatures sont comprimés (C1 = Cc + Cr).',resNegBraced:'Classes 1-2 (10.11.5.3.1, figure 10.7) : Mr plastique, semelle comprimée retenue, connecteurs et armatures continues sur les appuis; pas de déversement en poutre mixte.',resNegElastic:'Contraintes élastiques cumulées (figure 10.9) : Mfd (poids propre et charges « poutre seule ») sur S, le reste sur S′ (acier + armatures). Mr,éq = Mfd + le plus grand moment mixte qui respecte a), b) et c).',resCheckA:'a) fibre inf. ≤ φs Fcr',resCheckB:'b) fibre sup. acier ≤ φs Fy',resCheckC:'c) armatures sup. ≤ φr fy',resLtb:'Déversement (10.10.2.3)',resLtbNote:'βx (C10.10.2.3) = 0,9 ho (2 Iyc/Iy − 1)(1 − (Iy/Ix)²); Cw = ho² Iyc Iyt/(Iyc + Iyt); J = Σ b t³/3; ω2 = 1.',resFrd:'Âme de classe 4 (10.10.4.4) : Mr × Frd, Frd calculé pour le Mf de la station (poutre acier seule seulement).',resOver150:'h/w > 150 : poutre à âme raidie longitudinalement (10.10.4) requise, hors de ce module.',resFlange4:'Semelle comprimée de classe 4 : module effectif Se (10.10.3.4).',resNoFrdComposite:'Frd (10.10.4.4) ne s’applique qu’à la poutre acier seule, pas en mixte.',resGov:'max'});
Object.assign(words.en,{resistanceTab:'Resistance',resSheet:'Calculation sheet',resSheetHint:'V and M diagrams with Vr and Mr, station by station',resNoGirder:'No steel I-girder: the resistance is computed for “I-girder” sections (Sections tab).',resTypesTitle:'Sections · resistance type',resTypeComposite:'Composite',resTypeSteel:'Steel alone',resNoSlabShort:'no slab',resDefineSlab:'Define the slab ↗',resNotChecked:'not checked',resTypesHelp:'Composite: with the slab of “Section properties” (shear connectors). Steel alone: girder alone (no connectors, or during construction).',resWebTitle:'Web and lateral buckling',resStiffened:'Web with transverse stiffeners',resSpacing:'Spacing a (mm)',resUnstiffened:'Unstiffened web: a/h infinite, kv = 5.34, no tension field.',resUnbraced:'Unbraced length L (mm)',resUnbracedHelp:'Compression flange between lateral restraints (10.10.2.3, ω2 = 1): steel girder alone in M+ and M−, bottom flange in class 3 composite M−.',resFoot:'φs 0.95 · φr 0.90 · φc 0.75 · bar fy 400 MPa · S6-25, Section 10. Effects of the analysis, with the factors entered (Loads tab).',resLoadMode:'Case analysed: {mode}. For the ULS check, analyse “permanent + live”.',resComputing:'Computing…',resNeedAnalysis:'Available once the analysis has run.',resThermal:'No resistance for an imposed deformation.',resError:'Calculation failed',resSummary:'Maximum D/C ratios',resAt:'x = {x} m',resInteraction:'V-M interaction',resOk:'OK',resNg:'NG',resStation:'Station x (m)',resPrev:'Previous station',resNext:'Next station',resNoteTitle:'Resistance · calculation sheet',resNoteSub:'CSA S6-25, Section 10',resNoSteelHere:'No steel I-girder at this station.',resEffects:'Effects Mf and Vf',resEffDead:'Permanent',resEffLive:'Live',resEffBoth:'Perm. + live',resEffShort:{dead:'permanent',live:'live',both:'permanent + live'},resDiagHelp:'Click or drag on a diagram to pick the station (← → keys). Dashes: resistance; red: exceeded.',resShear:'Shear',resMoment:'Moment',resKind:{composite:'Composite girder',steel:'Steel girder alone'},resFactored:'Factored effect',resResist:'Resistance',resRatio:'D/C',resGeo:'Section properties',resGeoSteel:'Girder alone',resGeoComp:'Composite section',resMat:'Materials and factors',resPlates:'Section at the station',resTopFlange:'Top flange',resBottomFlange:'Bottom flange',resWeb:'Web',resDepth:'Depth',resSlab:'Slab',resHaunch:'Haunch',resBe:'Effective width',resLoadsTitle:'Effects at the station',resMomentsAt:'Moments (kN·m)',resShearsAt:'Shears (kN)',resStageSw:'Self-weight',resStageSteel:'“Girder alone” permanent',resStage3n:'Other permanent',resLiveMax:'Live (env. max)',resLiveMin:'Live (env. min)',resOnSteel:'Steel alone',resOn3n:'Composite 3n',resOn1n:'Composite 1n',resMfPos:'M<sub>f</sub>+ used',resMfNeg:'M<sub>f</sub>− used',resVfUsed:'V<sub>f</sub> used',resNotUsed:'not used ({e})',resClassTitle:'Section class (10.9.2)',resClassPos:'Class M+',resClassNeg:'Class M−',resClass:'class',resClassRule:'Class = the worst of the three plates (10.9.2.1, no axial load).',resWebBasisH:'Web: h/w (composite section).',resWebBasis2dc:'Web: 2dc/w with elastic dc (girder alone).',resShearTitle:'Shear (10.10.5.1)',resCase:'Case',resCaseA:'yielding (a)',resCaseB:'inelastic buckling (b)',resCaseC:'elastic buckling (c)',resInterTitle:'Combined shear and moment (10.10.5.2)',resInterApplies:'Stiffened web with tension field (h/w > 502 √(kv/Fy)): 0.727 Mf/Mr + 0.455 Vf/Vr ≤ 1, with the larger of Mf+/Mr+ and Mf−/Mr− (non-concurrent effects, conservative).',resInterNo:'V-M interaction: not applicable (no tension field).',resPosTitle:'Positive moment M+',resNegTitle:'Negative moment M−',resPna:'Plastic neutral axis',resPnaSlab:'in the slab (C1 ≥ C2)',resPnaSteel:'in the steel (C1 < C2)',resPnaFlange:'top flange',resPnaWeb:'web',resClass3Rule:'Class 3, compressed web > 850 w/√Fy: Figure 10.8.',resClass4Comp:'Class 4: class 3 rules applied, to be confirmed.',resBarsComp:'Both bar layers in compression (C1 = Cc + Cr).',resNegBraced:'Classes 1-2 (10.11.5.3.1, Figure 10.7): plastic Mr, compression flange braced, connectors and bars continuous over the supports; no lateral buckling for a composite girder.',resNegElastic:'Accumulated elastic stresses (Figure 10.9): Mfd (self-weight and “girder alone” loads) on S, the rest on S′ (steel + bars). Mr,eq = Mfd + the largest composite moment meeting a), b) and c).',resCheckA:'a) bottom fibre ≤ φs Fcr',resCheckB:'b) top of steel ≤ φs Fy',resCheckC:'c) top bars ≤ φr fy',resLtb:'Lateral-torsional buckling (10.10.2.3)',resLtbNote:'βx (C10.10.2.3) = 0.9 ho (2 Iyc/Iy − 1)(1 − (Iy/Ix)²); Cw = ho² Iyc Iyt/(Iyc + Iyt); J = Σ b t³/3; ω2 = 1.',resFrd:'Class 4 web (10.10.4.4): Mr × Frd, Frd for the Mf of the station (steel girder alone only).',resOver150:'h/w > 150: longitudinally stiffened girder (10.10.4) required, outside this module.',resFlange4:'Class 4 compression flange: effective modulus Se (10.10.3.4).',resNoFrdComposite:'Frd (10.10.4.4) applies to the steel girder alone only, not to a composite girder.',resGov:'max'});

const RES_DEFAULTS={types:[],stiffened:true,stiffener_spacing:3000,unbraced_length:6000,effects:'both'};
const RES_LEGACY=['mode','section','fy_bar','phi_s','phi_r','phi_c','mf_pos','mf_neg','mf_neg_steel','vf'];
const RES_COLORS={M:'#008378',V:'#407dcc',cap:'#2f4a5a'};
let resAll={key:null,data:null,promise:null,error:null},resTimer=0;
function resSettings(){
 if(!model.resistance||typeof model.resistance!=='object')model.resistance={};
 const r=model.resistance;RES_LEGACY.forEach(k=>delete r[k]);
 for(const k in RES_DEFAULTS)if(r[k]===undefined)r[k]=clone(RES_DEFAULTS[k]);
 return r;
}
function resSlab(s){return s&&s.composite&&s.composite.enabled?s.composite:null;}
function resGirders(){return model.sections.map((s,i)=>[i,s]).filter(([,s])=>s.kind==='girder');}
function resType(i){const s=model.sections[i];if(!resSlab(s))return 'steel';return resSettings().types[i]||'composite';}
function resSetType(i,kind){const r=resSettings();while(r.types.length<model.sections.length)r.types.push('composite');r.types.length=model.sections.length;r.types[i]=kind;}
const resComposites=()=>model.sections.map(s=>s.composite?clone(s.composite):null);
function resPayload(){const r=resSettings();return {types:r.types.slice(0,model.sections.length),stiffened:r.stiffened,stiffener_spacing:r.stiffener_spacing,unbraced_length:r.unbraced_length,effects:r.effects||'both'};}
function resKey(){return `${jobId}|${JSON.stringify(resPayload())}|${JSON.stringify(model.sections.map(s=>s.composite||null))}`;}
function resUsable(){return !!(model&&result&&result.kind!=='thermal'&&jobId&&resGirders().length);}
function resReady(){return model&&resAll.key===resKey()&&resAll.data?resAll.data:null;}
function resWanted(){return !!model&&(inputPanel==='resistance'||resNoteOpen());}
function resLoad(){
 if(!resUsable())return Promise.resolve(null);
 const key=resKey();if(resAll.key===key&&resAll.promise)return resAll.promise;
 resAll={key,data:null,promise:null,error:null};
 resAll.promise=solver.request('resistance',{job:jobId,settings:resPayload(),composites:resComposites()}).then(d=>{if(resAll.key===key)resAll.data=d;return d;}).catch(e=>{console.error(e);if(resAll.key===key)resAll.error=String(e?.message||e);return null;});
 return resAll.promise;
}
function resAfterLoad(){resPanelRefresh();if(resNoteOpen())resNoteRender(true);}
function resRefresh(delay=150){
 clearTimeout(resTimer);
 if(!resWanted())return;
 resPanelRefresh();
 resTimer=setTimeout(()=>{resLoad().then(resAfterLoad);},delay);
}
// --- small formatting helpers ------------------------------------------------
const resPct=v=>v==null?'—':`${fmt(100*v,1)} %`;
const resState=v=>v==null?'':v<=1?'ok':'ng';
function resMaxEntry(d){const s=d.summary;return ['r_pos','r_neg','r_v','r_mv'].map(k=>s[k]?{k,...s[k]}:null).filter(Boolean).sort((a,b)=>b.ratio-a.ratio)[0]||null;}
function resEffName(e=resSettings().effects||'both'){return t('resEffShort')[e]||e;}
// --- input panel: sections, web, then the summary and the sheet at the bottom
function resKpis(){
 if(!result)return `<p class="help">${t('resNeedAnalysis')}</p>`;
 if(result.kind==='thermal')return `<p class="help">${t('resThermal')}</p>`;
 if(resAll.key===resKey()&&resAll.error)return `<p class="note res-error">${t('resError')} · ${esc(resAll.error)}</p>`;
 const d=resReady();if(!d)return `<p class="help res-wait">${t('resComputing')}</p>`;
 const items=[['r_pos','M+'],['r_neg','M−'],['r_v','V']];if(d.summary.r_mv)items.push(['r_mv','V-M']);
 return `<div class="res-kpis">${items.map(([k,label])=>{const s=d.summary[k];if(!s)return '';return `<button type="button" class="res-kpi ${resState(s.ratio)}" data-res-open="${s.index}" title="${esc(t('resSheet'))} · x = ${fmt(s.x,1)} m"><span class="res-kpi-label">${label}</span><b>${resPct(s.ratio)}</b><small>${t('resAt').replace('{x}',fmt(s.x,1))}</small></button>`;}).join('')}</div>`;
}
function resModeNote(){
 if(!result||result.kind==='thermal'||model.load_mode==='both')return '';
 const mode=$(`#load-mode [data-mode="${model.load_mode}"]`)?.textContent||model.load_mode;
 return `<p class="note res-mode-note">${t('resLoadMode').replace('{mode}',`« ${esc(mode.trim())} »`)}</p>`;
}
function resTypesTable(){
 const rows=model.sections.map((s,i)=>{
  if(s.kind!=='girder')return `<tr class="res-type-off"><th scope="row">${esc(s.name)}<small>${s.kind==='nebt'?'NEBT':'EI'}</small></th><td colspan="2">${t('resNotChecked')}</td></tr>`;
  const slab=resSlab(s),kind=resType(i),c=slab?`${fmt(s.depth,0)} · ${t('resTypeComposite').toLowerCase()} ${fmt(slab.slab_thickness,0)}`:`${fmt(s.depth,0)} mm · ${t('resNoSlabShort')}`;
  const box=(k,label,dis)=>`<td><label class="res-check${dis?' disabled':''}"><input type="checkbox" data-res-type="${i}" value="${k}" ${kind===k?'checked':''} ${dis?'disabled':''} aria-label="${esc(s.name)} · ${esc(label)}"><span aria-hidden="true"></span></label></td>`;
  return `<tr><th scope="row">${esc(s.name)}<small>${c}${!slab?` · <button type="button" class="text-button" data-res-slab="${i}">${t('resDefineSlab')}</button>`:''}</small></th>${box('composite',t('resTypeComposite'),!slab)}${box('steel',t('resTypeSteel'),false)}</tr>`;
 }).join('');
 return `<table class="res-types"><thead><tr><th>${t('sections')}</th><th>${t('resTypeComposite')}</th><th>${t('resTypeSteel')}</th></tr></thead><tbody>${rows}</tbody></table><p class="help">${t('resTypesHelp')}</p>`;
}
function resistancePanel(){
 const r=resSettings();
 if(!resGirders().length)return `<p class="note">${t('resNoGirder')}</p>`;
 const kinds=resGirders().map(([i])=>resType(i)),meta=[...new Set(kinds)].map(k=>t(k==='composite'?'resTypeComposite':'resTypeSteel')).join(' · ');
 let h=inputGroup('res-types',t('resTypesTitle'),resTypesTable(),true,meta);
 let w=`<label class="toggle-row"><input type="checkbox" data-path="resistance.stiffened" ${r.stiffened?'checked':''}>${t('resStiffened')}</label>`;
 w+=r.stiffened?field('resSpacing','resistance.stiffener_spacing',r.stiffener_spacing,'',{min:1,max:100000}):`<p class="help">${t('resUnstiffened')}</p>`;
 w+=field('resUnbraced','resistance.unbraced_length',r.unbraced_length,'',{min:1,max:200000})+`<p class="help">${t('resUnbracedHelp')}</p>`;
 h+=inputGroup('res-web',t('resWebTitle'),w,true,`${r.stiffened?`a ${fmt(r.stiffener_spacing,0)}`:'kv 5,34'} · L ${fmt(r.unbraced_length,0)} mm`);
 h+=`<section class="res-bottom" aria-label="${esc(t('resSummary'))}"><div class="res-sum-head"><b>${t('resSummary')}</b><small id="res-eff-name">${t('resEffects')} : ${esc(resEffName())}</small></div><div id="res-kpis">${resKpis()}</div>${resModeNote()}<button type="button" class="res-note-open" id="res-note-open"><svg class="res-note-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 2.5h7l3.5 3.5v11.5h-10.5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 2.5V6h3.5M8 10h5M8 13h5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span><b>${t('resSheet')} ↗</b><small>${t('resSheetHint')}</small></span></button></section>`;
 return h+`<p class="help res-foot">${t('resFoot')}</p>`;
}
function resPanelRefresh(){const box=$('#res-kpis');if(box)box.innerHTML=resKpis();const n=$('#res-eff-name');if(n)n.textContent=`${t('resEffects')} : ${resEffName()}`;}
// Called by onInput for every resistance.* field: no analysis, only this module.
function resistanceChanged(path,el){
 if(el&&(el.tagName==='SELECT'||el.type==='checkbox'))renderInputs();
 if($$('#input-content input[data-path^="resistance."]').some(x=>!x.validity.valid||x.value===''))return;
 resRefresh(200);
}
// --- calculation sheet window ------------------------------------------------------
let resIndex=null,resDetail=null,resDetailToken=0,resDetailTimer=0,resObserver=null;
function resNoteOpen(){return !!$('#res-dialog')?.open;}
function resDialog(){
 let dlg=$('#res-dialog');if(dlg)return dlg;
 dlg=document.createElement('dialog');dlg.id='res-dialog';dlg.className='section-dialog res-dialog';document.body.appendChild(dlg);
 dlg.addEventListener('close',()=>{if(!dlg.open)resIndex=null;});
 dlg.addEventListener('qb-resize',()=>resDiagrams());
 return dlg;
}
function resDefaultIndex(){const d=resReady(),m=d&&resMaxEntry(d);return m?m.index:0;}
async function resOpenNote(index=null){
 if(!result||result.kind==='thermal'||!jobId){$('#status').textContent=t(result&&result.kind==='thermal'?'resThermal':'resNeedAnalysis');return;}
 const dlg=resDialog();resIndex=index;resDetail=null;dlg.innerHTML='';resNoteShell();qbFloat(dlg);
 await resLoad();if(resIndex===null)resIndex=resDefaultIndex();resNoteRender(true);
}
function resNoteShell(){
 const dlg=$('#res-dialog');if(!dlg||dlg.querySelector('#res-body'))return;
 const e=resSettings().effects||'both';
 dlg.innerHTML=`<div class="sp-head"><span class="axle-badge">R</span><div><b id="res-title">${t('resNoteTitle')}</b><small>${t('resNoteSub')}</small></div><button type="button" class="icon-button sp-close" data-res-close title="${esc(t('spClose'))}" aria-label="${esc(t('spClose'))}">×</button></div>
<div class="res-note-controls"><div class="field st-station"><span>${t('resStation')}</span><div class="st-station-row"><button type="button" class="icon-button" data-res-step="-1" title="${esc(t('resPrev'))}" aria-label="${esc(t('resPrev'))}">◀</button><input id="res-x" type="number" step="any" min="0"><button type="button" class="icon-button" data-res-step="1" title="${esc(t('resNext'))}" aria-label="${esc(t('resNext'))}">▶</button></div></div><div class="field res-eff"><span>${t('resEffects')}</span><div class="segmented small" role="group" aria-label="${esc(t('resEffects'))}">${[['dead','resEffDead'],['live','resEffLive'],['both','resEffBoth']].map(([k,l])=>`<button type="button" data-res-effects="${k}" class="${e===k?'active':''}" aria-pressed="${e===k}">${t(l)}</button>`).join('')}</div></div><div class="res-chips" id="res-chips"></div></div>
<div class="res-diagrams" id="res-diagrams"></div><p class="res-diag-help">${t('resDiagHelp')}</p><div id="res-body"></div>`;
 if(window.ResizeObserver){resObserver?.disconnect();resObserver=new ResizeObserver(()=>{if(resNoteOpen())resDiagrams();});resObserver.observe(dlg.querySelector('#res-diagrams'));}
}
function resNoteRender(fetch=false){
 const dlg=$('#res-dialog');if(!dlg||!dlg.open||!result)return;resNoteShell();
 if(resIndex===null)resIndex=resDefaultIndex();resIndex=Math.max(0,Math.min(result.x.length-1,resIndex));
 const xi=dlg.querySelector('#res-x');xi.max=result.x.at(-1);if(document.activeElement!==xi){xi.value=qbFmtInput(Number(result.x[resIndex].toFixed(3)));qbCheck(xi);}
 const e=resSettings().effects||'both';dlg.querySelectorAll('[data-res-effects]').forEach(b=>{const on=b.dataset.resEffects===e;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
 resChips();resDiagrams();
 if(fetch)resDetailRequest(0);else resBodyRender();
}
function resDetailRequest(delay=130){
 clearTimeout(resDetailTimer);const token=++resDetailToken;$('#res-body')?.classList.add('res-stale');
 resDetailTimer=setTimeout(async()=>{
  if(!resUsable()||resIndex===null)return;
  try{const d=await solver.request('resistance',{job:jobId,settings:resPayload(),composites:resComposites(),index:resIndex});if(token!==resDetailToken)return;resDetail=d;}
  catch(e){if(token!==resDetailToken)return;resDetail={error:String(e?.message||e)};}
  resBodyRender();
 },delay);
}
function resGo(i){if(!result)return;const j=Math.max(0,Math.min(result.x.length-1,i));if(j===resIndex)return;resIndex=j;resNoteRender();resDetailRequest();}
// Compact D/C of the station (no meter).
function resChips(){
 const box=$('#res-chips');if(!box)return;const d=resReady();
 if(!d){box.innerHTML=`<span class="res-wait">${t('resComputing')}</span>`;return;}
 const r=d.rows,i=resIndex,items=[['r_pos','M+'],['r_neg','M−'],['r_v','V']].concat(r.r_mv[i]!=null?[['r_mv','V-M']]:[]);
 box.innerHTML=r.Vr[i]==null?`<span class="res-wait">${t('resNoSteelHere')}</span>`:items.map(([k,l])=>`<span class="res-chip ${resState(r[k][i])}"><b>${l}</b>${resPct(r[k][i])}</span>`).join('');
}
// Effects compared: permanent loads, live load or both (as analysed).
function resCurves(key){
 const e=resSettings().effects||'both',d=result.dead?.[key]||result.x.map(()=>0),hi=result.max[key],lo=result.min[key];
 if(e==='dead')return {hi:d,lo:d};
 if(e==='live')return {hi:hi.map((v,i)=>v-d[i]),lo:lo.map((v,i)=>v-d[i])};
 return {hi,lo};
}
function resNice(v){const p=10**Math.floor(Math.log10(v)),m=v/p;return (m<1.5?1:m<3?2:m<7?5:10)*p;}
// One diagram (V or M) with the resistance, the exceedances and the station.
function resPlot(key,W,H,d){
 const xs=result.x,total=xs.at(-1),L=8,R=W-10,top=24,bot=H-30,X=x=>L+x/total*(R-L),dir=key==='M'?1:-1,color=RES_COLORS[key];
 const {hi,lo}=resCurves(key),r=d?.rows;
 const lines=!r?[]:key==='M'?[{v:r.Mr_pos,s:1,name:'Mr+',sum:d.summary.r_pos,eff:hi},{v:r.Mr_neg,s:-1,name:'Mr−',sum:d.summary.r_neg,eff:lo}]:[{v:r.Vr,s:1,name:'Vr',eff:hi},{v:r.Vr,s:-1,name:'Vr',eff:lo}];
 if(r&&key==='V'&&d.summary.r_v){const i=d.summary.r_v.index;lines[Math.abs(hi[i])>=Math.abs(lo[i])?0:1].sum=d.summary.r_v;}
 const vals=[...hi,...lo].map(Math.abs).concat(lines.flatMap(l=>l.v.filter(v=>v!=null)));
 const amp=Math.max(1e-6,...vals)*1.1,mid=(top+bot)/2,half=(bot-top)/2,Y=v=>mid+dir*v/amp*half;
 let g='';
 const step=resNice(amp/2.4),digits=step>=1?0:1;
 for(let k=-Math.floor(amp/step);k<=Math.floor(amp/step);k++){if(!k)continue;const y=Y(k*step);if(y<top-6||y>bot+6)continue;g+=`<line x1="${L}" x2="${R}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" class="rp-grid"/><text x="${L+4}" y="${(y-3).toFixed(1)}" class="rp-tick">${fmt(k*step,digits)}</text>`;}
 g+=`<line x1="${L}" x2="${R}" y1="${mid}" y2="${mid}" class="rp-zero"/>`;
 result.reactions.forEach(s=>{g+=`<line x1="${X(s.x).toFixed(1)}" x2="${X(s.x).toFixed(1)}" y1="${top-10}" y2="${bot+6}" class="rp-support"/><text x="${X(s.x).toFixed(1)}" y="${H-8}" text-anchor="${s.x<=0?'start':s.x>=total?'end':'middle'}" class="rp-tick">${fmt(s.x,1)}</text>`;});
 const j=model.joint;if(j?.enabled)g+=`<line x1="${X(j.x).toFixed(1)}" x2="${X(j.x).toFixed(1)}" y1="${top-10}" y2="${bot+6}" class="joint-line ${j.kind}"/>`;
 const path=v=>{let p='',on=false;v.forEach((y,i)=>{if(y==null){on=false;return;}p+=`${on?'L':'M'}${X(xs[i]).toFixed(1)},${Y(y).toFixed(1)}`;on=true;});return p;};
 g+=`<path d="${path(hi)}${lo.map((_,q)=>{const i=lo.length-1-q;return `L${X(xs[i]).toFixed(1)},${Y(lo[i]).toFixed(1)}`;}).join('')}Z" fill="${color}" fill-opacity=".1"/>`;
 lines.forEach(l=>{
  // Effect beyond the resistance: red band between the two curves.
  let band='';for(let i=1;i<xs.length;i++){const a=l.v[i-1],b=l.v[i];if(a==null||b==null)continue;const ea=l.s*l.eff[i-1],eb=l.s*l.eff[i];if(ea<=a&&eb<=b)continue;
   band+=`M${X(xs[i-1]).toFixed(1)},${Y(l.s*a).toFixed(1)}L${X(xs[i]).toFixed(1)},${Y(l.s*b).toFixed(1)}L${X(xs[i]).toFixed(1)},${Y(l.s*Math.max(eb,b)).toFixed(1)}L${X(xs[i-1]).toFixed(1)},${Y(l.s*Math.max(ea,a)).toFixed(1)}Z`;}
  if(band)g+=`<path class="res-over" d="${band}"/>`;
  g+=`<path class="res-cap" d="${path(l.v.map(v=>v==null?null:l.s*v))}"/>`;
 });
 g+=`<path d="${path(hi)}" fill="none" stroke="${color}" stroke-width="2.2"/><path d="${path(lo)}" fill="none" stroke="${color}" stroke-width="2.2"/>`;
 const labels=[];
 const label=(x,y,text,cls,anchor='middle')=>{let ly=y;for(let n=0;n<6&&labels.some(b=>Math.abs(b.x-x)<(b.w+text.length*6.4)/2+4&&Math.abs(b.y-ly)<13);n++)ly+=y>mid?13:-13;ly=Math.max(12,Math.min(H-16,ly));labels.push({x,y:ly,w:text.length*6.4});g+=`<text x="${Math.max(L+20,Math.min(R-20,x)).toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" class="${cls}">${text}</text>`;};
 // Governing ratios: dot on the resistance curve and its value.
 lines.forEach(l=>{if(!l.sum)return;const i=l.sum.index,v=l.v[i];if(v==null)return;const y=Y(l.s*v),cx=X(xs[i]);g+=`<circle class="res-dot ${resState(l.sum.ratio)}" cx="${cx.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5"/>`;label(cx,y>mid?y+15:y-7,`${l.name} ${fmt(v,0)} · ${resPct(l.sum.ratio)}`,`res-label ${resState(l.sum.ratio)}`);});
 // Envelope peaks.
 const peak=(v,best)=>{let k=0;v.forEach((y,i)=>{if(best(y,v[k]))k=i;});return k;};
 [[hi,peak(hi,(a,b)=>a>b)],[lo,peak(lo,(a,b)=>a<b)]].forEach(([v,k])=>{if(Math.abs(v[k])<amp*.03)return;const y=Y(v[k]);label(X(xs[k]),y>mid?y+15:y-6,fmt(v[k],0),'rp-peak');});
 // Station cursor.
 const i=resIndex??0,cx=X(xs[i]);g+=`<line x1="${cx.toFixed(1)}" x2="${cx.toFixed(1)}" y1="${top-12}" y2="${bot+6}" class="rp-cursor"/>`;
 const same=Math.abs(hi[i]-lo[i])<1e-9;[[hi[i],'hi'],...(same?[]:[[lo[i],'lo']])].forEach(([v])=>{const y=Y(v);g+=`<circle cx="${cx.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${color}" stroke="#fff" stroke-width="1.5"/>`;const right=cx<W-90;g+=`<text x="${(cx+(right?8:-8)).toFixed(1)}" y="${(y+(y>mid?14:-7)).toFixed(1)}" text-anchor="${right?'start':'end'}" class="rp-value" style="fill:${color}">${fmt(v,0)}</text>`;});
 return g;
}
function resDiagrams(){
 const box=$('#res-diagrams');if(!box||!result)return;
 const d=resReady(),W=Math.max(300,Math.round((box.clientWidth||900)-118));
 const best=k=>{if(!d)return null;const s=k==='M'?[d.summary.r_pos,d.summary.r_neg].filter(Boolean).map(v=>v.ratio):d.summary.r_v?[d.summary.r_v.ratio]:[];return s.length?Math.max(...s):null;};
 box.innerHTML=[['V','resShear','kN',170,'Vr'],['M','resMoment','kN·m',200,'Mr']].map(([key,label,unit,H,cap])=>{const b=best(key);return `<div class="rp-row"><div class="rp-label" style="color:${RES_COLORS[key]}">${t(label)}<small>${unit}</small>${b!=null?`<small class="res-key ${resState(b)}"><i aria-hidden="true"></i>${cap} ${fmt(100*b,0)} %</small>`:''}</div><svg class="res-plot" data-key="${key}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" tabindex="0" role="slider" aria-label="${esc(t(label))} · ${esc(t('resStation'))}" aria-valuemin="0" aria-valuemax="${result.x.length-1}" aria-valuenow="${resIndex??0}">${resPlot(key,W,H,d)}</svg></div>`;}).join('');
}
function resPick(svg,e){const b=svg.getBoundingClientRect();if(!b.width)return;const W=Number(svg.getAttribute('width')),u=((e.clientX-b.left)/b.width*W-8)/(W-18);resGo(nearest(Math.max(0,Math.min(1,u))*result.x.at(-1)));}
document.addEventListener('pointerdown',e=>{const svg=e.target.closest?.('svg.res-plot');if(!svg||!result)return;svg.setPointerCapture?.(e.pointerId);svg.dataset.drag='1';resPick(svg,e);});
document.addEventListener('pointermove',e=>{const svg=e.target.closest?.('svg.res-plot');if(svg&&svg.dataset.drag==='1')resPick(svg,e);});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>document.addEventListener(ev,()=>$$('svg.res-plot').forEach(s=>s.dataset.drag=''),true));
document.addEventListener('keydown',e=>{const svg=e.target.closest?.('svg.res-plot');if(!svg||resIndex===null)return;const s=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!s)return;e.preventDefault();const k=svg.dataset.key;resGo(resIndex+s);$(`svg.res-plot[data-key="${k}"]`)?.focus({preventScroll:true});});
// --- sheet body: one value per row ---------------------------------------------------
function resRow(label,sym,value,unit='',note='',cls=''){return `<tr class="${cls}"><th>${label}${sym?` <span class="sym">${sym}</span>`:''}</th><td class="num">${value}${unit?` <span class="unit">${unit}</span>`:''}</td><td class="nt">${note}</td></tr>`;}
function resBlock(title,rows,foot='',cls=''){return `<section class="res-block ${cls}"><h3>${title}</h3><table class="res-table">${rows.join('')}</table>${foot?`<p class="res-foot">${foot}</p>`:''}</section>`;}
function resTag(v){return v==null?'':`<span class="res-tag ${resState(v)}">${t(v<=1?'resOk':'resNg')}</span>`;}
const f0=v=>v==null?'—':fmt(v,0),f1=v=>v==null?'—':fmt(v,1),f2=v=>v==null?'—':fmt(v,2),f3=v=>v==null?'—':fmt(v,3);
const sci=(v,p)=>v==null?'—':fmt(v/10**p,p>=9?2:1);
function resGeoBlock(d){
 const s=d.section,p=d.props||{},st=p.steel||{},c=p.composite,rows=[];
 rows.push(resRow(t('resDepth'),'d',f0(s.depth),'mm'),resRow(t('resTopFlange'),'b<sub>t</sub>',f0(s.top_width),'mm'),resRow('','t<sub>t</sub>',f1(s.top_thickness),'mm'),resRow(t('resWeb'),'h',f1(d.shear.h),'mm'),resRow('','w',f1(s.web_thickness),'mm'),resRow(t('resBottomFlange'),'b<sub>b</sub>',f0(s.bottom_width),'mm'),resRow('','t<sub>b</sub>',f1(s.bottom_thickness),'mm'));
 if(d.kind==='composite'){const k=s.composite;rows.push(resRow(t('resSlab'),'t<sub>c</sub>',f0(k.slab_thickness),'mm'),resRow(t('resHaunch'),'',f0(k.haunch),'mm'),resRow(t('resBe'),'b<sub>e</sub>',f0(k.effective_width),'mm'));}
 const g=[`<tr class="res-sub"><th colspan="3">${t('resGeoSteel')}</th></tr>`,resRow('','A',f0(st.A),'mm²'),resRow('','ȳ (bas)',f1(st.y_bottom),'mm'),resRow('','I<sub>x</sub>',sci(st.Ix,6),'10⁶ mm⁴'),resRow('','S<sub>sup</sub>',sci(st.S_top,3),'10³ mm³'),resRow('','S<sub>inf</sub>',sci(st.S_bot,3),'10³ mm³'),resRow('','Z<sub>x</sub>',sci(st.Zx,3),'10³ mm³'),resRow('','ANP (bas)',f1(st.PNA_from_bottom),'mm'),resRow('','I<sub>y</sub>',sci(st.Iy,6),'10⁶ mm⁴'),resRow('','J',sci(st.J,6),'10⁶ mm⁴'),resRow('','C<sub>w</sub>',sci(st.Cw,12),'10¹² mm⁶')];
 if(c&&d.kind==='composite'){g.push(`<tr class="res-sub"><th colspan="3">${t('resGeoComp')}</th></tr>`,resRow('','n = E<sub>s</sub>/E<sub>c</sub>',f2(c.n)),resRow('','I 3n',sci(c['3n'].I,6),'10⁶ mm⁴'),resRow('','ȳ 3n',f1(c['3n'].y_bottom),'mm'),resRow('','I 1n',sci(c['1n'].I,6),'10⁶ mm⁴'),resRow('','ȳ 1n',f1(c['1n'].y_bottom),'mm'),resRow('',"I′ (acier + arm.)",sci(c.negative.I,6),'10⁶ mm⁴'),resRow('',"ȳ′",f1(c.negative.y_bottom),'mm'),resRow('','A<sub>r</sub>',f0(c.negative.bars_area),'mm²'));}
 return resBlock(t('resPlates'),rows)+resBlock(t('resGeo'),g);
}
function resMatBlock(d){
 const s=d.section,rows=[resRow('F<sub>y</sub>','',f0(d.Fy),'MPa'),resRow('E<sub>s</sub>','',f0(200000),'MPa'),resRow('G<sub>s</sub>','',f0(77000),'MPa'),resRow('φ<sub>s</sub>','',f2(d.phi.s))];
 if(d.kind==='composite'){const k=s.composite,ec=d.props?.composite?.Ec;rows.push(resRow("f′<sub>c</sub>",'',f0(k.fc),'MPa'),resRow('E<sub>c</sub>','',f0(ec),'MPa'),resRow('α<sub>1</sub>','',f3(d.positive.alpha1)),resRow('f<sub>y</sub> arm.','',f0(d.fy_bar),'MPa'),resRow('φ<sub>c</sub>','',f2(d.phi.c)),resRow('φ<sub>r</sub>','',f2(d.phi.r)));}
 const r=resSettings();rows.push(resRow(t('resUnbraced').replace(/\s*\(mm\)/,''),'L',f0(r.unbraced_length),'mm'),resRow('','ω<sub>2</sub>',f2(1)));
 return resBlock(t('resMat'),rows);
}
function resLoadsBlock(d){
 const st=d.stages;if(!st)return '';const comp=d.kind==='composite',e=d.effects?.effects||'both',c=d.check;
 const on=[t('resOnSteel'),t('resOnSteel'),comp?t('resOn3n'):t('resOnSteel'),comp?t('resOn1n'):t('resOnSteel')];
 const dimDead=e==='live',dimLive=e==='dead';
 const table=(k,unit)=>{const v=st[k];return `<table class="res-table res-loads"><caption>${t(k==='M'?'resMomentsAt':'resShearsAt')}</caption>${[[t('resStageSw'),on[0],v.self_weight,dimDead],[t('resStageSteel'),on[1],v.dead_steel,dimDead],[t('resStage3n'),on[2],v.dead_3n,dimDead],[t('resLiveMax'),on[3],v.live_max,dimLive],[t('resLiveMin'),on[3],v.live_min,dimLive]].map(([a,b,x,dim])=>`<tr class="${dim?'res-dim':''}"><th>${a} <span class="res-on">· ${b}</span></th><td class="num">${f1(x)}</td></tr>`).join('')}${k==='M'?`<tr class="total"><th>${t('resMfPos')}</th><td class="num"><b>${f1(c.positive.Mf)}</b></td></tr><tr class="total"><th>${t('resMfNeg')}</th><td class="num"><b>${f1(c.negative.Mf)}</b></td></tr>`:`<tr class="total"><th>${t('resVfUsed')}</th><td class="num"><b>${f1(c.shear.Vf)}</b></td></tr>`}</table>`;};
 return `<section class="res-block res-loads-block"><h3>${t('resLoadsTitle')} · ${esc(resEffName(e))}</h3><div class="res-loads-grid">${table('M')}${table('V')}</div></section>`;
}
function resClassBlock(d){
 const cl=d.classes,lim=cl.limits,rows=[],word=t('resClass');
 const lab=(ratio,limits)=>{const k=limits.findIndex(l=>ratio<=l);return k<0?`${word} 4 (> ${f1(limits[2])})`:`${word} ${k+1} (≤ ${f1(limits[k])})`;};
 rows.push(resRow(t('resTopFlange'),'b/2t',f1(cl.top_flange.ratio),'',lab(cl.top_flange.ratio,lim.flange)),resRow(t('resBottomFlange'),'b/2t',f1(cl.bottom_flange.ratio),'',lab(cl.bottom_flange.ratio,lim.flange)));
 if(cl.web_basis==='h/w')rows.push(resRow(t('resWeb'),'h/w',f1(cl.web.positive.ratio),'',lab(cl.web.positive.ratio,lim.web)));
 else rows.push(resRow(t('resWeb')+' M+','d<sub>c</sub>',f0(cl.web.positive.dc),'mm'),resRow('','2d<sub>c</sub>/w',f1(cl.web.positive.ratio),'',lab(cl.web.positive.ratio,lim.web)),resRow(t('resWeb')+' M−','d<sub>c</sub>',f0(cl.web.negative.dc),'mm'),resRow('','2d<sub>c</sub>/w',f1(cl.web.negative.ratio),'',lab(cl.web.negative.ratio,lim.web)));
 rows.push(resRow(`<b>${t('resClassPos')}</b>`,'',`<b>${cl.positive}</b>`,'','','total'),resRow(`<b>${t('resClassNeg')}</b>`,'',`<b>${cl.negative}</b>`,'','','total'));
 return resBlock(t('resClassTitle'),rows,`${t('resClassRule')} ${t(cl.web_basis==='h/w'?'resWebBasisH':'resWebBasis2dc')}`);
}
function resShearBlock(d){
 const sh=d.shear,c=d.check,caseName=t(sh.case==='a'?'resCaseA':sh.case==='b'?'resCaseB':'resCaseC');
 const rows=[resRow('','a',sh.a==null?'∞':f0(sh.a),'mm'),resRow('','a/h',sh.a_h==null?'∞':f2(sh.a_h)),resRow('','k<sub>v</sub>',f2(sh.kv)),resRow('','h/w',f1(sh.h_w)),resRow('','502 √(k<sub>v</sub>/F<sub>y</sub>)',f1(sh.limits[0])),resRow('','621 √(k<sub>v</sub>/F<sub>y</sub>)',f1(sh.limits[1])),resRow(t('resCase'),'',caseName),resRow('','F<sub>cr</sub>',f1(sh.Fcr),'MPa'),resRow('','F<sub>t</sub>',f1(sh.Ft),'MPa'),resRow('','F<sub>s</sub> = F<sub>cr</sub> + F<sub>t</sub>',f1(sh.Fs),'MPa'),resRow('','A<sub>w</sub> = h w',f0(sh.Aw),'mm²'),resRow(`<b>${t('resResist')}</b>`,'V<sub>r</sub> = φ<sub>s</sub> A<sub>w</sub> F<sub>s</sub>',`<b>${f0(sh.Vr)}</b>`,'kN'),resRow(t('resFactored'),'V<sub>f</sub>',f0(c.shear.Vf),'kN'),resRow(`<b>${t('resRatio')}</b>`,'V<sub>f</sub>/V<sub>r</sub>',`<b>${resPct(c.shear.ratio)}</b>`,'',resTag(c.shear.ratio),'total')];
 if(c.interaction)rows.push(`<tr class="res-sub"><th colspan="3">${t('resInterTitle')}</th></tr>`,resRow('','M<sub>f</sub>/M<sub>r</sub> (max)',f3(c.interaction.Mf_Mr)),resRow('','V<sub>f</sub>/V<sub>r</sub>',f3(c.interaction.Vf_Vr)),resRow(`<b>${t('resInteraction')}</b>`,'0,727 M<sub>f</sub>/M<sub>r</sub> + 0,455 V<sub>f</sub>/V<sub>r</sub>',`<b>${resPct(c.interaction.value)}</b>`,'',resTag(c.interaction.value),'total'));
 return resBlock(t('resShearTitle'),rows,c.interaction?t('resInterApplies'):t('resInterNo'));
}
function resLtbRows(lt){
 return [`<tr class="res-sub"><th colspan="3">${t('resLtb')}</th></tr>`,resRow('','L',f0(lt.L),'mm'),resRow('','I<sub>yc</sub>',sci(lt.Iyc,6),'10⁶ mm⁴'),resRow('','I<sub>y</sub>',sci(lt.Iy,6),'10⁶ mm⁴'),resRow('','J',sci(lt.J,6),'10⁶ mm⁴'),resRow('','C<sub>w</sub>',sci(lt.Cw,12),'10¹² mm⁶'),resRow('','β<sub>x</sub>',f0(lt.beta_x),'mm'),resRow('','B<sub>1</sub>',f3(lt.B1)),resRow('','B<sub>2</sub>',f3(lt.B2)),resRow('','M<sub>u</sub>',f0(lt.Mu),'kN·m')];
}
function resMomentBlock(sign,d){
 const m=d[sign],k=d.check[sign],title=t(sign==='positive'?'resPosTitle':'resNegTitle'),rows=[],foot=[],cls=`${t('resClass')} ${m.class}`;
 const tail=()=>rows.push(resRow(t('resFactored'),'M<sub>f</sub>',f0(k.Mf),'kN·m'),resRow(`<b>${t('resRatio')}</b>`,'M<sub>f</sub>/M<sub>r</sub>',`<b>${resPct(k.ratio)}</b>`,'',resTag(k.ratio),'total'));
 if(m.method==='steel'){
  rows.push(...resLtbRows(m.ltb),`<tr class="res-sub"><th colspan="3">${t('resResist')}</th></tr>`,resRow('','Z<sub>x</sub>',sci(m.Zx,3),'10³ mm³'),resRow('','M<sub>p</sub> = Z<sub>x</sub> F<sub>y</sub>',f0(m.Mp),'kN·m'),resRow('','S<sub>sup</sub>',sci(m.S_top,3),'10³ mm³'),resRow('','S<sub>inf</sub>',sci(m.S_bot,3),'10³ mm³'),resRow('','M<sub>y</sub> = F<sub>y</sub> min(S)',f0(m.My),'kN·m'),resRow('','M<sub>r</sub>',f0(m.Mr),'kN·m',`${m.rule} · ${cls}`));
  if(m.frd){const fr=m.frd;rows.push(`<tr class="res-sub"><th colspan="3">F<sub>rd</sub> (10.10.4.4)</th></tr>`,resRow('','2d<sub>c</sub>/w',f1(fr.slenderness)),resRow('','1900/√F<sub>y</sub>',f1(fr.limit)),resRow('','A<sub>cf</sub>',f0(fr.Acf),'mm²'),resRow('','A<sub>w</sub>',f0(fr.Aw),'mm²'),resRow('','F<sub>rd</sub>',f3(k.Frd)));foot.push(t('resFrd'));if(fr.h_w_over_150)foot.push(t('resOver150'));}
  rows.push(resRow(`<b>${t('resResist')}</b>`,m.frd?'M<sub>r</sub>′ = F<sub>rd</sub> M<sub>r</sub>':'M<sub>r</sub>',`<b>${f0(k.Mr)}</b>`,'kN·m'));
  if(m.effective_width)foot.push(`${t('resFlange4')} b<sub>e</sub> = ${f0(m.effective_width)} mm.`);
  foot.push(t('resLtbNote'));tail();
 }else if(sign==='positive'){
  const e=m.e;
  rows.push(resRow('','α<sub>1</sub>',f3(m.alpha1)),resRow('','C<sub>c</sub> max = α<sub>1</sub>φ<sub>c</sub>b<sub>e</sub>t<sub>c</sub>f′<sub>c</sub>',f0(m.Cc_full),'kN'),resRow('','C<sub>r</sub>',f0(m.Cr),'kN'),resRow('','C<sub>1</sub> = C<sub>c</sub> + C<sub>r</sub>',f0(m.C1),'kN'),resRow('','C<sub>2</sub> = φ<sub>s</sub>A<sub>s</sub>F<sub>y</sub>',f0(m.C2),'kN'),resRow(t('resPna'),'',m.pna==='slab'?t('resPnaSlab'):`${t('resPnaSteel')} · ${m.dc_web>0?t('resPnaWeb'):t('resPnaFlange')}`),resRow('','a',f0(m.a),'mm'));
  if(m.pna==='steel')rows.push(resRow('','d<sub>c</sub> semelle',f1(m.dc_flange),'mm'),resRow('','d<sub>c</sub> âme',f1(m.dc_web),'mm'),resRow('','850 w/√F<sub>y</sub>',f1(m.web_limit),'mm'),resRow('','C<sub>c</sub>',f0(m.Cc),'kN'),resRow('','C<sub>s</sub>',f0(m.Cs),'kN'),resRow('','T<sub>s</sub>',f0(m.Ts),'kN'),resRow('','y<sub>st</sub>',f0(m.y_st),'mm'),resRow('','y<sub>sc</sub>',f0(m.y_sc),'mm'));
  else rows.push(resRow('','C<sub>c</sub>',f0(m.Cc),'kN'),resRow('','T<sub>s</sub>',f0(m.Ts),'kN'));
  rows.push(resRow('','e<sub>c</sub>',f0(e.Cc),'mm'),resRow('','e<sub>r</sub> sup.',f0(e.Cr_top),'mm'),resRow('','e<sub>r</sub> inf.',f0(e.Cr_bottom),'mm'));
  if(e.Cs!==undefined)rows.push(resRow('','e<sub>s</sub>',f0(e.Cs),'mm'));
  rows.push(resRow(`<b>${t('resResist')}</b>`,'M<sub>r</sub> = Σ C e',`<b>${f0(m.Mr)}</b>`,'kN·m',`${m.rule} · ${cls}`));
  foot.push(t('resBarsComp'));if(m.rule==='10.11.6.2.2')foot.push(t('resClass3Rule'));if(m.class4)foot.push(t('resClass4Comp'),t('resNoFrdComposite'));tail();
 }else if(m.method==='plastic'){
  rows.push(resRow('','T<sub>r</sub> = φ<sub>r</sub>A<sub>r</sub>f<sub>y</sub>',f0(m.Tr),'kN'),resRow('','T<sub>s</sub> = ½(φ<sub>s</sub>A<sub>s</sub>F<sub>y</sub> − T<sub>r</sub>)',f0(m.Ts),'kN'),resRow('','C<sub>s</sub>',f0(m.Cs),'kN'),resRow('','e<sub>r</sub> sup.',f0(m.e.Tr_top),'mm'),resRow('','e<sub>r</sub> inf.',f0(m.e.Tr_bottom),'mm'),resRow('','e<sub>s</sub>',f0(m.e.Ts),'mm'),resRow(`<b>${t('resResist')}</b>`,'M<sub>r</sub> = T<sub>r</sub>e<sub>r</sub> + T<sub>s</sub>e<sub>s</sub>',`<b>${f0(m.Mr)}</b>`,'kN·m',`${m.rule} · ${cls}`));
  foot.push(t('resNegBraced'));tail();
 }else{
  const S=m.S;
  rows.push(...resLtbRows(m.ltb),resRow('','M<sub>y</sub> (poutre)',f0(m.ltb.My),'kN·m'),resRow('','F<sub>cr</sub> = M<sub>r</sub>/(φ<sub>s</sub>S<sub>inf</sub>)',f1(m.Fcr),'MPa','10.10.3.3'),`<tr class="res-sub"><th colspan="3">${t('resResist')}</th></tr>`,resRow('','S inf.',sci(S.S_bot,3),'10³ mm³'),resRow('','S′ inf.',sci(S.S_bot_c,3),'10³ mm³'),resRow('','S sup.',sci(S.S_top,3),'10³ mm³'),resRow('','S′ sup.',sci(S.S_top_c,3),'10³ mm³'),resRow('','S′ arm.',sci(S.S_bar,3),'10³ mm³'),resRow('','M<sub>fd</sub>',f0(k.Mfd),'kN·m'),resRow('','M<sub>fsd</sub> + M<sub>fl</sub>',f0(k.Mfc),'kN·m'));
  (k.checks||[]).forEach(ck=>rows.push(resRow(t('resCheck'+ck.id.toUpperCase()),'σ',f1(ck.stress),'MPa',`≤ ${f1(ck.limit)} · ${resPct(ck.ratio)}`)));
  rows.push(resRow(`<b>${t('resResist')}</b>`,'M<sub>r,éq</sub>',`<b>${f0(k.Mr)}</b>`,'kN·m',`${m.rule} · ${cls}`));
  foot.push(t('resNegElastic'));if(m.class4)foot.push(t('resClass4Comp'),t('resNoFrdComposite'));tail();
 }
 return resBlock(`${title} · ${t('resKind')[d.kind]}`,rows,foot.join(' '),`res-${sign}`);
}
function resBodyRender(){
 const box=$('#res-body');if(!box)return;box.classList.remove('res-stale');
 const d=resDetail,title=$('#res-title');
 if(!d){box.innerHTML=`<p class="help">${t('resComputing')}</p>`;return;}
 if(d.error){box.innerHTML=`<p class="note res-error">${d.error.includes('resistance.girder')?t('resNoSteelHere'):`${t('resError')} · ${esc(d.error)}`}</p>`;if(title)title.textContent=t('resNoteTitle');return;}
 if(title)title.innerHTML=`${t('resNoteTitle')} · x = ${fmt(d.x,2)} m · ${esc(d.section.name)} · ${t('resKind')[d.kind]}`;
 box.innerHTML=`<div class="res-sheet"><aside class="res-side">${resGeoBlock(d)}${resMatBlock(d)}</aside><div class="res-main">${resLoadsBlock(d)}<div class="res-grid">${resClassBlock(d)}${resShearBlock(d)}${resMomentBlock('positive',d)}${resMomentBlock('negative',d)}</div></div></div>`;
}
// --- events ----------------------------------------------------------------------------
document.addEventListener('click',e=>{
 if(!model)return;
 if(e.target.closest('#res-note-open')){resOpenNote(null);return;}
 const k=e.target.closest('[data-res-open]');if(k){resOpenNote(Number(k.dataset.resOpen));return;}
 if(e.target.closest('[data-res-close]')){$('#res-dialog')?.close();return;}
 const st=e.target.closest('[data-res-step]');if(st&&resIndex!==null){resGo(resIndex+Number(st.dataset.resStep));return;}
 const ef=e.target.closest('[data-res-effects]');if(ef){const r=resSettings();if(r.effects!==ef.dataset.resEffects){r.effects=ef.dataset.resEffects;updateProjectState();resDetail=null;resNoteRender();resPanelRefresh();resLoad().then(()=>{resAfterLoad();});}return;}
 const sl=e.target.closest('[data-res-slab]');if(sl&&typeof openSectionProps==='function'){openSectionProps(Number(sl.dataset.resSlab));return;}
});
document.addEventListener('change',e=>{
 if(!model)return;
 const box=e.target.closest?.('[data-res-type]');
 if(box){const i=Number(box.dataset.resType);resSetType(i,box.checked?box.value:(box.value==='steel'&&resSlab(model.sections[i])?'composite':'steel'));updateProjectState();renderInputs();resRefresh(0);return;}
 if(e.target.id==='res-x'&&resIndex!==null&&e.target.validity.valid&&e.target.value!==''){resGo(nearest(numValue(e.target)));e.target.blur();}
});
// The Résistance tab renders its own panel; the other tabs are unchanged.
{const ri=renderInputs;renderInputs=function(){if(model&&inputPanel==='resistance'){resSettings();$('#input-content').innerHTML=resistancePanel();if(typeof qbEnhance==='function')qbEnhance($('#input-content'));if(!resReady())resRefresh(0);return;}return ri.apply(this,arguments);};}
document.addEventListener('click',e=>{if(e.target.closest('[data-panel="resistance"]'))resRefresh(0);});
// A new analysis: new effects at every station.
{const rr=renderResults;renderResults=function(){const out=rr.apply(this,arguments);if(model&&result&&resWanted()&&!resReady())resRefresh(0);if(resNoteOpen()&&resUsable())resDetailRequest(0);return out;};}
// Section and slab edits change the resistance (display only).
{const sc=typeof sectionPropsChanged==='function'?sectionPropsChanged:null;if(sc)sectionPropsChanged=function(){const r=sc.apply(this,arguments);if(resWanted())resRefresh(300);return r;};}
{const tr=translate;translate=function(){const r=tr.apply(this,arguments);if(resNoteOpen()){const dlg=$('#res-dialog');dlg.innerHTML='';resNoteShell();resNoteRender();resBodyRender();}return r;};}
// A new project (or example) starts the module again from its own settings.
{const ap=typeof applyProject==='function'?applyProject:null;if(ap)applyProject=function(){resAll={key:null,data:null,promise:null,error:null};resDetail=null;$('#res-dialog')?.close();return ap.apply(this,arguments);};}
