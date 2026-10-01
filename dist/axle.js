"use strict";
// v0.9.1 — CSA S6-25 truck load fraction FT ("facteur d'essieu"), slab-on-girder
// bridges (art. 5.6.4, tables 5.3 to 5.7), computed by quickerbridge/distribution.py.
// Applied, it multiplies the axle effects on M and V by the moment and shear FT
// of each zone (M+ span zones and M− support zones of Figure 5.1).
Object.assign(words.fr,{axleTab:'FT · S6-25',axleTitle:'Facteur d’essieu FT',axleSub:'Pont à dalle sur poutres · CSA S6-25, art. 5.6.4',axleEnable:'Calculer la fraction de charge de camion',axleApply:'Appliquer FT à M et V (par zone)',axleOpen:'Données et tableaux ↗',axleData:'Données du tablier',axleZones:'FT appliqué par zone',girdersN:'Poutres N',spacingS:'Espacement S (m)',overhangSc:'Porte-à-faux Sc (m)',carriagewayWc:'Largeur carrossable Wc (m)',roadClass:'Classe de route',classAB:'A ou B',skewPsi:'Biais ψ (°)',hLeft:'Culée intégrale h₁ (m)',hRight:'Culée intégrale h₂ (m)',girderType:'Poutre',interiorGirder:'Intérieure',exteriorGirder:'Extérieure',limitState:'État limite',ulsState:'ÉLUL / ÉLUT1',flsState:'ÉLF / ÉLUT2',axleComputing:'Calcul…',axleOnlyCanadian:'Disponible pour les camions CL-625 et CL-750-QC.',axleWarn_vehicle:'Prévu pour les camions CL-625 et CL-750-QC (essieux CL-W, voies de roues à 1,8 m).',axleWarn_overhang:'Sc > 0,6 S : hors du domaine du tableau 5.5, γc extrapolé.',axleWarn_width:'B = (N − 1) S + 2 Sc est inférieure à Wc : vérifiez S, Sc et Wc.',axleWarn_le_clamped:'Le borné entre 3 et 60 m (art. 5.6.4.6).',axleWarn_dve_capped:'DVE limité à 3,0 m.',axleSpan:'Travée',axleSupport:'Appui',axleMomInt:'Moment · poutre int.',axleMomExt:'Moment · poutre ext.',axleShear:'Cisaillement',axleShearInt:'FT poutre int.',axleShearExt:'FT poutre ext. × Fs',axleMinNote:'min : FT gouverné par la borne 1,05 n RL / N (ÉLUL) ou 1,05 / N (ÉLF).',axleMethod:'Méthode et hypothèses',axleMethodBody:'FT = S / (DT γc (1 + μλ + γe)) avec DT, λ, γc et γe des tableaux 5.3 à 5.7 (classes A et B), μ = (We − 3,3)/0,6 ≤ 1,0 et We = Wc/n (tableau 3.5). Le suit la figure 5.1 : L pour une travée simple; 0,75 L (travée de rive), 0,5 L (travée intérieure) et 0,20 (L1 + L2) sur pile (S6-25, au lieu de 0,25) pour une poutre continue; culée intégrale (appui encastré ou ressort) : 0,6 L, 0,15 L + h à la culée et 0,25 (L1 + L2) sur pile (figure 5.1 d). Une travée isostatique sépare le pont en parties indépendantes. DVE (figure 5.2) : camion centré dans la voie de rive, roues à ± 0,9 m, DVE ≤ 3,0 m, avec B = (N − 1) S + 2 Sc. Fs (art. 5.6.6.2) majore le cisaillement de la poutre extérieure.',axleInterpret:'Lecture des tableaux',axleInterpretBody:'γe (tableau 5.7) s’ajoute dans la parenthèse : 1 + μλ + γe. Pour le moment extérieur à l’ÉLF avec n ≥ 3 voies, λ = 0,0 (tableau 5.3). Le cisaillement sur pile d’une poutre continue utilise γc = (S/4,5)^0,15 ≤ 0,9 (tableau 5.6), les autres régions (S/2,0)^0,25 ≤ 1,0.',axleApplyBody:'Appliqué, FT multiplie les effets des essieux (CMD et facteurs inclus) : M par le FT moment de sa zone, V par le FT cisaillement de la même zone. Les zones M− s’étendent sur 0,20 L de part et d’autre d’une pile (0,15 L à une culée intégrale), comme Le à la figure 5.1. La charge de voie, la flèche et les réactions restent celles d’une voie complète. FT remplace alors le facteur d’essieu saisi.',axleReplaces:'Remplacé par FT S6-25 par zone pour M et V',axleCaption:'FT S6-25',axleNotes:'Méthode, lecture des tableaux et application'});
Object.assign(words.en,{axleTab:'FT · S6-25',axleTitle:'Truck load fraction FT',axleSub:'Slab-on-girder bridge · CSA S6-25, cl. 5.6.4',axleEnable:'Compute the truck load fraction',axleApply:'Apply FT to M and V (by zone)',axleOpen:'Inputs and tables ↗',axleData:'Deck data',axleZones:'FT applied by zone',girdersN:'Girders N',spacingS:'Spacing S (m)',overhangSc:'Overhang Sc (m)',carriagewayWc:'Carriageway Wc (m)',roadClass:'Highway class',classAB:'A or B',skewPsi:'Skew ψ (°)',hLeft:'Integral abutment h₁ (m)',hRight:'Integral abutment h₂ (m)',girderType:'Girder',interiorGirder:'Interior',exteriorGirder:'Exterior',limitState:'Limit state',ulsState:'ULS / SLS1',flsState:'FLS / SLS2',axleComputing:'Computing…',axleOnlyCanadian:'Available for the CL-625 and CL-750-QC trucks.',axleWarn_vehicle:'Intended for the CL-625 and CL-750-QC trucks (CL-W axles, 1.8 m wheel lines).',axleWarn_overhang:'Sc > 0.6 S: outside Table 5.5, γc extrapolated.',axleWarn_width:'B = (N − 1) S + 2 Sc is less than Wc: check S, Sc and Wc.',axleWarn_le_clamped:'Le limited to 3–60 m (cl. 5.6.4.6).',axleWarn_dve_capped:'DVE limited to 3.0 m.',axleSpan:'Span',axleSupport:'Support',axleMomInt:'Moment · int. girder',axleMomExt:'Moment · ext. girder',axleShear:'Shear',axleShearInt:'FT int. girder',axleShearExt:'FT ext. girder × Fs',axleMinNote:'min: FT governed by the 1.05 n RL / N (ULS) or 1.05 / N (FLS) floor.',axleMethod:'Method and assumptions',axleMethodBody:'FT = S / (DT γc (1 + μλ + γe)) with DT, λ, γc and γe from Tables 5.3 to 5.7 (classes A and B), μ = (We − 3.3)/0.6 ≤ 1.0 and We = Wc/n (Table 3.5). Le follows Figure 5.1: L for a simple span; 0.75 L (end span), 0.5 L (interior span) and 0.20 (L1 + L2) over a pier (S6-25, instead of 0.25) for a continuous girder; integral abutment (fixed or spring support): 0.6 L, 0.15 L + h at the abutment and 0.25 (L1 + L2) over the pier (Figure 5.1 d). A simple span splits the bridge into independent parts. DVE (Figure 5.2): truck centred in the edge lane, wheels at ± 0.9 m, DVE ≤ 3.0 m, with B = (N − 1) S + 2 Sc. Fs (cl. 5.6.6.2) increases exterior-girder shear.',axleInterpret:'Reading of the tables',axleInterpretBody:'γe (Table 5.7) is added inside the bracket: 1 + μλ + γe. For the exterior moment at FLS with n ≥ 3 lanes, λ = 0.0 (Table 5.3). Shear over a pier of a continuous girder uses γc = (S/4.5)^0.15 ≤ 0.9 (Table 5.6), other regions (S/2.0)^0.25 ≤ 1.0.',axleApplyBody:'When applied, FT multiplies the axle effects (DLA and factors included): M by the moment FT of its zone, V by the shear FT of the same zone. M− zones extend 0.20 L on each side of a pier (0.15 L at an integral abutment), as Le in Figure 5.1. The lane load, deflection and reactions keep one full lane. FT then replaces the entered axle factor.',axleReplaces:'Replaced by S6-25 FT per zone for M and V',axleCaption:'S6-25 FT',axleNotes:'Method, reading of the tables and application'});
let axleData=null,axleTimer=null,axleToken=0;
function axleSettings(){
 model.distribution??={enabled:false,apply:false,girders:6,spacing:3.25,overhang:1.73,carriageway:18.8,road_class:'AB',skew:0,h_left:3,h_right:3,girder:'interior',state:'ULS'};
 return model.distribution;
}
function axleApplied(){const d=axleSettings();return d.enabled&&d.apply;}
function axleCanadian(){return ['CL625','CL750QC'].includes(model.live.vehicle);}
function axleIntegral(){const s=model.supports,n=model.spans.length;return [['fixed','spring'].includes(s[0])&&!model.spans[0].simple,['fixed','spring'].includes(s[n])&&!model.spans[n-1].simple];}
function axleWhere(where){const [kind,k]=where.split(':');return `${t(kind==='span'?'axleSpan':'axleSupport')} ${k}`;}
function axleChoice(){
 const d=axleSettings();
 return `<div class="field-row">${select('girderType','distribution.girder',d.girder,[['interior',t('interiorGirder')],['exterior',t('exteriorGirder')]])}${select('limitState','distribution.state',d.state,[['ULS',t('ulsState')],['FLS',t('flsState')]])}</div><label class="toggle-row axle-apply"><input type="checkbox" data-path="distribution.apply" ${d.apply?'checked':''}>${t('axleApply')}</label>`;
}
// Left panel: switch, the two choices and a link; the deck data live in the tab.
function axleCard(){
 const d=axleSettings();
 let html=`<section class="axle-card${d.enabled?' on':''}"><div class="axle-head"><span class="axle-badge">S6-25</span><div><b>${t('axleTitle')}</b><small>${t('axleSub')}</small></div></div><label class="toggle-row"><input type="checkbox" data-path="distribution.enabled" ${d.enabled?'checked':''}>${t('axleEnable')}</label>`;
 if(!d.enabled)return html+(axleCanadian()?'':`<p class="help">${t('axleOnlyCanadian')}</p>`)+`</section>`;
 return html+axleChoice()+`<div class="axle-mini" id="axle-mini">${axleMiniHtml()}</div><button class="text-button axle-open" data-view="axle">${t('axleOpen')}</button></section>`;
}
function axleRange(values){const lo=Math.min(...values),hi=Math.max(...values);return Math.abs(hi-lo)<5e-4?fmt(lo,3):`${fmt(lo,3)}–${fmt(hi,3)}`;}
function axleMiniHtml(){
 if(!axleData)return `<span>${t('axleComputing')}</span>`;
 const z=axleData.zones;return `<span>FT M <b>${axleRange(z.map(v=>v.FT_M))}</b></span><span>FT V <b>${axleRange(z.map(v=>v.FT_V))}</b></span>`;
}
function axleDerivedHtml(){
 if(!axleData)return `<span>${t('axleComputing')}</span>`;
 const v=axleData.derived;
 return [['B',fmt(v.B,2)+' m'],['n',v.n],['RL',fmt(v.RL,2)],['We',fmt(v.We,2)+' m'],['μ',fmt(v.mu,3)],['DVE',fmt(v.DVE,3)+' m'],['Fs',v.spans.map(s=>fmt(s.Fs,3)).join(' / ')]].map(([k,x])=>`<span>${k} <b>${x}</b></span>`).join('');
}
function axleWarningsHtml(){return (axleData?.warnings||[]).map(w=>`<p class="axle-warning">⚠ ${t('axleWarn_'+w)}</p>`).join('');}
function axleRefresh(){
 const d=axleSettings();
 $('#axle-tab')?.classList.toggle('hidden',!d.enabled);
 if(!d.enabled&&view==='axle')showView('diagrams');
 const mini=$('#axle-mini');if(mini)mini.innerHTML=axleMiniHtml();
 if(view==='axle')renderAxleResults();
}
function axleChanged(){
 const d=axleSettings();clearTimeout(axleTimer);
 if(!d.enabled){axleData=null;axleRefresh();return;}
 if($$('input[data-path^="distribution."]').some(el=>!el.validity.valid||el.value===''))return;
 const token=++axleToken;
 axleTimer=setTimeout(async()=>{
  try{const data=await solver.request('axle_factor',{model:clone(model)});if(token!==axleToken)return;axleData=data;}
  catch(e){console.error(e);if(token!==axleToken)return;axleData=null;}
  axleRefresh();
 },180);
}
// Tab: the inputs are drawn once (typing keeps the focus); results refresh below.
function renderAxleView(){
 const host=$('#axle-view');if(!host)return;const d=axleSettings(),[left,right]=axleIntegral();
 const inputs=[field('girdersN','distribution.girders',d.girders,'',{min:1,max:40,step:1}),field('spacingS','distribution.spacing',d.spacing,'',{min:.31,max:10}),field('overhangSc','distribution.overhang',d.overhang,'',{min:0,max:6}),field('carriagewayWc','distribution.carriageway',d.carriageway,'',{min:1.01,max:60}),field('skewPsi','distribution.skew',d.skew,'',{min:0,max:45}),select('roadClass','distribution.road_class',d.road_class,[['AB',t('classAB')]])];
 if(left)inputs.push(field('hLeft','distribution.h_left',d.h_left,'',{min:0,max:30}));
 if(right)inputs.push(field('hRight','distribution.h_right',d.h_right,'',{min:0,max:30}));
 host.innerHTML=`<div class="axle-view"><div class="axle-view-head"><span class="axle-badge">S6-25</span><div><b>${t('axleTitle')}</b><small>${t('axleSub')}</small></div></div><div class="axle-inputs"><div class="axle-grid">${inputs.join('')}</div><div class="axle-choice">${axleChoice()}</div></div><div id="axle-results"></div><details class="axle-notes"><summary>${t('axleNotes')}</summary><div class="method-content"><h3>${t('axleMethod')}</h3><p>${t('axleMethodBody')}</p><h3>${t('axleInterpret')}</h3><p>${t('axleInterpretBody')}</p><p>${t('axleApplyBody')}</p></div></details></div>`;
 renderAxleResults();
}
function renderAxleResults(){
 const host=$('#axle-results');if(!host)return;
 if(!axleData){host.innerHTML=`<p class="help">${t('axleComputing')}</p>`;return;}
 const a=axleData,dv=a.derived,nspan=dv.spans.length,d=axleSettings();
 const cols=[];
 for(let s=1;s<=nspan+1;s++){
  const neg=dv.negative.find(x=>x.support===s);if(neg)cols.push({where:`support:${s}`,sign:'-',label:`${t('axleSupport')} ${s}`,Le:neg.Le,rule:neg.rule});
  if(s<=nspan){const pos=dv.positive.find(x=>x.span===s);cols.push({where:`span:${s}`,sign:'+',label:`${t('axleSpan')} ${s}`,Le:pos.Le,rule:pos.rule});}
 }
 const head=`<colgroup><col class="axle-labelcol">${cols.map(()=>'<col>').join('')}</colgroup><thead><tr><th></th>${cols.map(c=>`<th>${c.label} <small>${c.sign==='+'?'M+':'M−'}</small></th>`).join('')}</tr></thead>`;
 // Applied FT by zone, for the selected girder and limit state.
 const zones=a.zones.map(z=>`<td><b>${fmt(z.FT_M,3)}</b></td>`),zonesV=a.zones.map(z=>`<td><b>${fmt(z.FT_V,3)}</b></td>`);
 let html=`<div class="axle-derived">${axleDerivedHtml()}</div>${axleWarningsHtml()}`;
 html+=`<h3>${t('axleZones')} · ${t(d.girder==='interior'?'interiorGirder':'exteriorGirder')} · ${t(d.state==='ULS'?'ulsState':'flsState')}</h3><table class="axle-table-view axle-zones"><colgroup><col class="axle-labelcol">${a.zones.map(()=>'<col>').join('')}</colgroup><thead><tr><th></th>${a.zones.map(z=>`<th>${axleWhere(z.where)} <small>${z.sign==='+'?'M+':'M−'} · ${fmt(z.x0,2)}–${fmt(z.x1,2)} m</small></th>`).join('')}</tr></thead><tbody><tr class="axle-ftrow"><th>FT M</th>${zones.join('')}</tr><tr class="axle-ftrow"><th>FT V</th>${zonesV.join('')}</tr></tbody></table>`;
 const cell=(state,girder,effect,c,key)=>{const r=a.rows.find(r=>r.state===state&&r.girder===girder&&r.effect===effect&&r.where===c.where&&r.sign===c.sign);if(!r)return '<td class="axle-empty">·</td>';const ft=key==='FT'||key==='FT_Fs';return `<td class="${ft?'axle-ftcell':''}">${fmt(r[key],3)}${ft&&r.minimum_governs?'<sup>min</sup>':''}</td>`;};
 const row=(label,fn,cls='')=>`<tr class="${cls}"><th>${label}</th>${cols.map(fn).join('')}</tr>`;
 const group=label=>`<tr class="axle-group"><th colspan="${cols.length+1}">${label}</th></tr>`;
 const block=state=>{
  let h=`<h3>${t(state==='ULS'?'ulsState':'flsState')}</h3><table class="axle-table-view${state===d.state?' selected':''}">${head}<tbody>`;
  h+=row('Le (m)',c=>`<td>${fmt(c.Le,3)} <small>${esc(c.rule)}</small></td>`);
  h+=group(t('axleMomInt'))+row('DT',c=>cell(state,'interior','moment',c,'DT'))+row('λ',c=>cell(state,'interior','moment',c,'lambda'))+row('γc',c=>cell(state,'interior','moment',c,'gamma_c'))+row('FT',c=>cell(state,'interior','moment',c,'FT'),'axle-ftrow');
  h+=group(t('axleMomExt'))+row('DT',c=>cell(state,'exterior','moment',c,'DT'))+row('λ',c=>cell(state,'exterior','moment',c,'lambda'))+row('γc',c=>cell(state,'exterior','moment',c,'gamma_c'));
  if(state==='FLS')h+=row('γe',c=>cell(state,'exterior','moment',c,'gamma_e'));
  h+=row('FT',c=>cell(state,'exterior','moment',c,'FT'),'axle-ftrow');
  h+=group(t('axleShear'))+row('DT',c=>cell(state,'interior','shear',c,'DT'))+row('γc',c=>cell(state,'interior','shear',c,'gamma_c'))+row(t('axleShearInt'),c=>cell(state,'interior','shear',c,'FT'),'axle-ftrow')+row(t('axleShearExt'),c=>cell(state,'exterior','shear',c,'FT_Fs'),'axle-ftrow');
  return h+`</tbody></table>`;
 };
 host.innerHTML=html+`<div class="axle-blocks">${block('ULS')}${block('FLS')}</div><p class="help">${t('axleMinNote')}</p>`;
}
// Thin markers of the applied zones on the M and V diagrams.
function axleChartMarks(key,X,G){
 const ft=result?.ft;if(!ft||!['V','M'].includes(key))return '';
 let svg='';ft.zones.forEach((z,i)=>{
  if(i)svg+=`<line x1="${X(z.x0)}" x2="${X(z.x0)}" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#c9a24f" stroke-dasharray="1.5 2.5"/>`;
  svg+=`<text class="axle-mark" x="${X((z.x0+z.x1)/2)}" y="${G.top-G.u(4)}" text-anchor="middle">FT ${fmt(key==='M'?z.FT_M:z.FT_V,3)}</text>`;
 });
 return svg;
}
