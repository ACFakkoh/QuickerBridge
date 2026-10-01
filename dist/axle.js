"use strict";
// v0.9 — CSA S6-25 truck load fraction FT ("facteur d'essieu"), slab-on-girder
// bridges (art. 5.6.4, tables 5.3 to 5.7). Computed by quickerbridge/distribution.py
// in the worker; it never changes the analysis until the user applies a value.
Object.assign(words.fr,{axleTab:'FT · S6-25',axleTitle:'Facteur d’essieu FT',axleSub:'Pont à dalle sur poutres · CSA S6-25, art. 5.6.4',axleEnable:'Calculer la fraction de charge de camion',girdersN:'Nombre de poutres N',spacingS:'Espacement S (m)',overhangSc:'Porte-à-faux de rive Sc (m)',carriagewayWc:'Largeur carrossable Wc (m)',roadClass:'Classe de route',classAB:'A ou B',skewPsi:'Biais ψ (°)',hLeft:'Culée intégrale h₁ (m)',hRight:'Culée intégrale h₂ (m)',girderType:'Poutre',interiorGirder:'Intérieure',exteriorGirder:'Extérieure',limitState:'État limite',ulsState:'ÉLUL / ÉLUT1',flsState:'ÉLF / ÉLUT2',effectKind:'Effet',effMax:'Enveloppe M et V',effMoment:'Moment',effShear:'Cisaillement',applyAxle:'→ Facteur d’essieu',applyLive:'→ Facteur de charge',axleApplied:'appliqué',axleDetail:'Détail ↗',axleComputing:'Calcul…',axleAppliedStatus:'FT appliqué',axleOnlyCanadian:'Disponible pour les camions CL-625 et CL-750-QC.',axleWarn_vehicle:'Prévu pour les camions CL-625 et CL-750-QC (essieux CL-W, voies de roues à 1,8 m).',axleWarn_overhang:'Sc > 0,6 S : hors du domaine du tableau 5.5, γc extrapolé.',axleWarn_width:'B = (N − 1) S + 2 Sc est inférieure à Wc : vérifiez S, Sc et Wc.',axleWarn_le_clamped:'Le borné entre 3 et 60 m (art. 5.6.4.6).',axleSpan:'Travée',axleSupport:'Appui',axleRow_Le:'Le (m)',axleMomInt:'Moment · poutre intérieure',axleMomExt:'Moment · poutre extérieure',axleShear:'Cisaillement',axleShearInt:'FT · poutre intérieure',axleShearExt:'FT · poutre extérieure × Fs',axleMinNote:'min : FT gouverné par la borne 1,05 n RL / N (ÉLUL) ou 1,05 / N (ÉLF).',axleMethod:'Méthode et hypothèses',axleMethodBody:'FT = S / (DT γc (1 + μλ + γe)) avec DT, λ, γc et γe des tableaux 5.3 à 5.7 (classes A et B), μ = (We − 3,3)/0,6 ≤ 1,0 et We = Wc/n (tableau 3.5). Le suit la figure 5.1 : L pour une travée simple; 0,75 L (travée de rive), 0,5 L (travée intérieure) et 0,20 (L1 + L2) sur pile (S6-25, au lieu de 0,25) pour une poutre continue; culée intégrale (appui encastré ou ressort) : 0,6 L, 0,15 L + h à la culée et 0,25 (L1 + L2) sur pile (figure 5.1 d). Une travée isostatique sépare le pont en parties indépendantes. DVE (figure 5.2) : camion centré dans la voie de rive, roues à ± 0,9 m, avec B = (N − 1) S + 2 Sc. Fs (art. 5.6.6.2) majore le cisaillement de la poutre extérieure au coin obtus.',axleInterpret:'Lecture des tableaux',axleInterpretBody:'γe (tableau 5.7) s’ajoute dans la parenthèse : 1 + μλ + γe. Pour le moment extérieur à l’ÉLF avec n ≥ 3 voies, λ = 0,0 (tableau 5.3). Le cisaillement sur pile d’une poutre continue utilise γc = (S/4,5)^0,15 ≤ 0,9 (tableau 5.6), les autres régions (S/2,0)^0,25 ≤ 1,0.',axleApplyBody:'S6 applique FT à l’effet d’une voie (camion et charge de voie). « → Facteur d’essieu » le copie dans le facteur d’essieu (essieux seulement); « → Facteur de charge » dans le facteur de charge routière (tout le cas routier). La valeur précédente est remplacée.'});
Object.assign(words.en,{axleTab:'FT · S6-25',axleTitle:'Truck load fraction FT',axleSub:'Slab-on-girder bridge · CSA S6-25, cl. 5.6.4',axleEnable:'Compute the truck load fraction',girdersN:'Number of girders N',spacingS:'Girder spacing S (m)',overhangSc:'Edge overhang Sc (m)',carriagewayWc:'Carriageway width Wc (m)',roadClass:'Highway class',classAB:'A or B',skewPsi:'Skew ψ (°)',hLeft:'Integral abutment h₁ (m)',hRight:'Integral abutment h₂ (m)',girderType:'Girder',interiorGirder:'Interior',exteriorGirder:'Exterior',limitState:'Limit state',ulsState:'ULS / SLS1',flsState:'FLS / SLS2',effectKind:'Effect',effMax:'Envelope of M and V',effMoment:'Moment',effShear:'Shear',applyAxle:'→ Axle factor',applyLive:'→ Load factor',axleApplied:'applied',axleDetail:'Details ↗',axleComputing:'Computing…',axleAppliedStatus:'FT applied',axleOnlyCanadian:'Available for the CL-625 and CL-750-QC trucks.',axleWarn_vehicle:'Intended for the CL-625 and CL-750-QC trucks (CL-W axles, 1.8 m wheel lines).',axleWarn_overhang:'Sc > 0.6 S: outside Table 5.5, γc extrapolated.',axleWarn_width:'B = (N − 1) S + 2 Sc is less than Wc: check S, Sc and Wc.',axleWarn_le_clamped:'Le limited to 3–60 m (cl. 5.6.4.6).',axleSpan:'Span',axleSupport:'Support',axleRow_Le:'Le (m)',axleMomInt:'Moment · interior girder',axleMomExt:'Moment · exterior girder',axleShear:'Shear',axleShearInt:'FT · interior girder',axleShearExt:'FT · exterior girder × Fs',axleMinNote:'min: FT governed by the 1.05 n RL / N (ULS) or 1.05 / N (FLS) floor.',axleMethod:'Method and assumptions',axleMethodBody:'FT = S / (DT γc (1 + μλ + γe)) with DT, λ, γc and γe from Tables 5.3 to 5.7 (classes A and B), μ = (We − 3.3)/0.6 ≤ 1.0 and We = Wc/n (Table 3.5). Le follows Figure 5.1: L for a simple span; 0.75 L (end span), 0.5 L (interior span) and 0.20 (L1 + L2) over a pier (S6-25, instead of 0.25) for a continuous girder; integral abutment (fixed or spring support): 0.6 L, 0.15 L + h at the abutment and 0.25 (L1 + L2) over the pier (Figure 5.1 d). A simple span splits the bridge into independent parts. DVE (Figure 5.2): truck centred in the edge lane, wheels at ± 0.9 m, with B = (N − 1) S + 2 Sc. Fs (cl. 5.6.6.2) increases exterior-girder shear at the obtuse corner.',axleInterpret:'Reading of the tables',axleInterpretBody:'γe (Table 5.7) is added inside the bracket: 1 + μλ + γe. For the exterior moment at FLS with n ≥ 3 lanes, λ = 0.0 (Table 5.3). Shear over a pier of a continuous girder uses γc = (S/4.5)^0.15 ≤ 0.9 (Table 5.6), other regions (S/2.0)^0.25 ≤ 1.0.',axleApplyBody:'S6 applies FT to the effect of one lane (truck and lane load). “→ Axle factor” copies it to the axle factor (axles only); “→ Load factor” to the live load factor (whole live case). The previous value is replaced.'});
let axleData=null,axleTimer=null,axleToken=0;
function axleSettings(){
 model.distribution??={enabled:false,girders:6,spacing:3.25,overhang:1.73,carriageway:18.8,road_class:'AB',skew:0,h_left:3,h_right:3,girder:'interior',state:'ULS',effect:'max'};
 return model.distribution;
}
function axleCanadian(){return ['CL625','CL750QC'].includes(model.live.vehicle);}
function axleIntegral(){const s=model.supports,n=model.spans.length;return [['fixed','spring'].includes(s[0])&&!model.spans[0].simple,['fixed','spring'].includes(s[n])&&!model.spans[n-1].simple];}
function axleValue(){
 const d=axleSettings();if(!axleData)return null;
 const sum=axleData.summary[`${d.state}:${d.girder}`];return sum?sum[d.effect]:null;
}
function axleGoverning(){
 const d=axleSettings();if(!axleData)return null;
 const rows=axleData.rows.filter(r=>r.state===d.state&&r.girder===d.girder&&(d.effect==='max'||r.effect===d.effect));
 return rows.reduce((a,r)=>!a||r.FT_Fs>a.FT_Fs?r:a,null);
}
function axleWhere(where){const [kind,k]=where.split(':');return `${t(kind==='span'?'axleSpan':'axleSupport')} ${k}`;}
function axleCard(){
 const d=axleSettings();
 let html=`<section class="axle-card${d.enabled?' on':''}"><div class="axle-head"><span class="axle-badge">S6-25</span><div><b>${t('axleTitle')}</b><small>${t('axleSub')}</small></div></div>`;
 html+=`<label class="toggle-row"><input type="checkbox" data-path="distribution.enabled" ${d.enabled?'checked':''}>${t('axleEnable')}</label>`;
 if(!d.enabled)return html+(axleCanadian()?'':`<p class="help">${t('axleOnlyCanadian')}</p>`)+`</section>`;
 const [left,right]=axleIntegral();
 html+=`<div class="field-row">${field('girdersN','distribution.girders',d.girders,'',{min:1,max:40,step:1})}${field('spacingS','distribution.spacing',d.spacing,'',{min:.31,max:10})}</div>`;
 html+=`<div class="field-row">${field('overhangSc','distribution.overhang',d.overhang,'',{min:0,max:6})}${field('carriagewayWc','distribution.carriageway',d.carriageway,'',{min:1.01,max:60})}</div>`;
 html+=`<div class="field-row">${field('skewPsi','distribution.skew',d.skew,'',{min:0,max:45})}${select('roadClass','distribution.road_class',d.road_class,[['AB',t('classAB')]])}</div>`;
 if(left||right)html+=`<div class="field-row">${left?field('hLeft','distribution.h_left',d.h_left,'',{min:0,max:30}):''}${right?field('hRight','distribution.h_right',d.h_right,'',{min:0,max:30}):''}</div>`;
 html+=`<div class="axle-derived" id="axle-derived">${axleDerivedHtml()}</div>`;
 html+=`<div class="field-row">${select('girderType','distribution.girder',d.girder,[['interior',t('interiorGirder')],['exterior',t('exteriorGirder')]])}${select('limitState','distribution.state',d.state,[['ULS',t('ulsState')],['FLS',t('flsState')]])}</div>`;
 html+=select('effectKind','distribution.effect',d.effect,[['max',t('effMax')],['moment',t('effMoment')],['shear',t('effShear')]]);
 html+=`<div class="axle-result" id="axle-result">${axleResultHtml()}</div>`;
 html+=`<div class="axle-actions"><button id="axle-apply-axle">${t('applyAxle')}</button><button id="axle-apply-live">${t('applyLive')}</button><button class="text-button" data-view="axle">${t('axleDetail')}</button></div>`;
 html+=`<div id="axle-warnings">${axleWarningsHtml()}</div>`;
 return html+`</section>`;
}
function axleDerivedHtml(){
 if(!axleData)return `<span>${t('axleComputing')}</span>`;
 const v=axleData.derived;
 return [['B',fmt(v.B,2)+' m'],['n',v.n],['RL',fmt(v.RL,2)],['We',fmt(v.We,2)+' m'],['μ',fmt(v.mu,3)],['DVE',fmt(v.DVE,3)+' m'],['Fs',v.spans.map(s=>fmt(s.Fs,3)).join(' / ')]].map(([k,x])=>`<span>${k} <b>${x}</b></span>`).join('');
}
function axleResultHtml(){
 const value=axleValue(),g=axleGoverning();
 if(value===null||!g)return `<span class="axle-ft-label">FT</span><b class="axle-ft">…</b>`;
 const live=model.live,rounded=Math.round(value*1000)/1000,applied=[live.axle_factor,live.factor].some(f=>Math.abs((f??1)-rounded)<5e-4);
 const what=`${g.effect==='moment'?(g.sign==='+'?'M+':'M−'):'V'} · ${axleWhere(g.where)}${g.effect==='moment'?` · Le ${fmt(g.Le,2)} m`:''}${g.minimum_governs?' · min':''}${g.effect==='shear'&&g.Fs>1?` · Fs ${fmt(g.Fs,3)}`:''}`;
 return `<span class="axle-ft-label">FT</span><b class="axle-ft">${fmt(value,3)}</b><small>${what}${applied?` · ✓ ${t('axleApplied')}`:''}</small>`;
}
function axleWarningsHtml(){return (axleData?.warnings||[]).map(w=>`<p class="axle-warning">⚠ ${t('axleWarn_'+w)}</p>`).join('');}
function axleRefresh(){
 const d=axleSettings();
 $('#axle-tab')?.classList.toggle('hidden',!d.enabled);
 if(!d.enabled&&view==='axle')showView('diagrams');
 const derived=$('#axle-derived');if(derived)derived.innerHTML=axleDerivedHtml();
 const res=$('#axle-result');if(res)res.innerHTML=axleResultHtml();
 const warn=$('#axle-warnings');if(warn)warn.innerHTML=axleWarningsHtml();
 if(view==='axle')renderAxleView();
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
function axleApply(target){
 const value=axleValue();if(value===null)return;
 const rounded=Math.round(value*1000)/1000;
 if(target==='axle')model.live.axle_factor=rounded;else model.live.factor=rounded;
 renderInputs();changed();$('#status').textContent=`${t('axleAppliedStatus')} : ${fmt(rounded,3)} → ${t(target==='axle'?'axleFactor':'loadFactor')}`;
}
function renderAxleView(){
 const host=$('#axle-view');if(!host)return;
 if(!axleData){host.innerHTML=`<p class="help">${t('axleComputing')}</p>`;return;}
 const a=axleData,dv=a.derived,nspan=dv.spans.length;
 // Columns follow the bridge: support (if a negative region), span, support…
 const cols=[];
 for(let s=1;s<=nspan+1;s++){
  const neg=dv.negative.find(x=>x.support===s);if(neg)cols.push({where:`support:${s}`,sign:'-',label:`${t('axleSupport')} ${s}`,Le:neg.Le,rule:neg.rule});
  if(s<=nspan){const pos=dv.positive.find(x=>x.span===s);cols.push({where:`span:${s}`,sign:'+',label:`${t('axleSpan')} ${s}`,Le:pos.Le,rule:pos.rule});}
 }
 const cell=(state,girder,effect,c,key,digits=3)=>{const r=a.rows.find(r=>r.state===state&&r.girder===girder&&r.effect===effect&&r.where===c.where&&r.sign===c.sign);if(!r)return '<td class="axle-empty"></td>';const v=r[key];const ft=key==='FT'||key==='FT_Fs';return `<td class="${ft?'axle-ftcell':''}">${fmt(v,digits)}${ft&&r.minimum_governs?'<sup>min</sup>':''}</td>`;};
 const row=(label,fn,cls='')=>`<tr class="${cls}"><th>${label}</th>${cols.map(fn).join('')}</tr>`;
 const block=state=>{
  const title=t(state==='ULS'?'ulsState':'flsState');
  let h=`<h3>${title}</h3><div class="table-scroll"><table class="axle-table-view"><thead><tr><th></th>${cols.map(c=>`<th>${c.label}<small>${c.sign==='+'?'M+':'M−'}</small></th>`).join('')}</tr></thead><tbody>`;
  h+=row(t('axleRow_Le'),c=>`<td>${fmt(c.Le,3)}<small>${esc(c.rule)}</small></td>`);
  h+=`<tr class="axle-group"><th colspan="${cols.length+1}">${t('axleMomInt')}</th></tr>`;
  h+=row('DT',c=>cell(state,'interior','moment',c,'DT'))+row('λ',c=>cell(state,'interior','moment',c,'lambda'))+row('γc',c=>cell(state,'interior','moment',c,'gamma_c'))+row('FT',c=>cell(state,'interior','moment',c,'FT'),'axle-ftrow');
  h+=`<tr class="axle-group"><th colspan="${cols.length+1}">${t('axleMomExt')}</th></tr>`;
  h+=row('DT',c=>cell(state,'exterior','moment',c,'DT'))+row('λ',c=>cell(state,'exterior','moment',c,'lambda'))+row('γc',c=>cell(state,'exterior','moment',c,'gamma_c'));
  if(state==='FLS')h+=row('γe',c=>cell(state,'exterior','moment',c,'gamma_e'));
  h+=row('FT',c=>cell(state,'exterior','moment',c,'FT'),'axle-ftrow');
  h+=`<tr class="axle-group"><th colspan="${cols.length+1}">${t('axleShear')}</th></tr>`;
  h+=row('DT',c=>cell(state,'interior','shear',c,'DT'))+row('γc',c=>cell(state,'interior','shear',c,'gamma_c'))+row(t('axleShearInt'),c=>cell(state,'interior','shear',c,'FT'),'axle-ftrow')+row(t('axleShearExt'),c=>cell(state,'exterior','shear',c,'FT_Fs'),'axle-ftrow');
  return h+`</tbody></table></div>`;
 };
 const d=a.inputs,chips=[['N',d.girders],['S',fmt(d.spacing,2)+' m'],['Sc',fmt(d.overhang,2)+' m'],['Wc',fmt(d.carriageway,2)+' m'],['ψ',fmt(d.skew,1)+'°'],[t('roadClass'),t('classAB')]];
 host.innerHTML=`<div class="axle-view"><div class="axle-view-head"><span class="axle-badge">S6-25</span><div><b>${t('axleTitle')}</b><small>${t('axleSub')}</small></div></div><div class="axle-derived">${chips.map(([k,x])=>`<span>${k} <b>${x}</b></span>`).join('')}${axleDerivedHtml()}</div>${axleWarningsHtml()}${block('ULS')}${block('FLS')}<p class="help">${t('axleMinNote')}</p><div class="method-content"><h3>${t('axleMethod')}</h3><p>${t('axleMethodBody')}</p><h3>${t('axleInterpret')}</h3><p>${t('axleInterpretBody')}</p><p>${t('axleApplyBody')}</p></div></div>`;
}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||!model)return;
 if(b.id==='axle-apply-axle')axleApply('axle');
 if(b.id==='axle-apply-live')axleApply('live');
});
