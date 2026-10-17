"use strict";
// Section cards: properties, drawings, stiffness, inertia, self-weight, haunches.

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
// Default non-prismatic layout: parabolic haunches to the deeper section over
// 20 % of each span next to an interior support only (mirrors models.apply_default_haunches).
function defaultHaunches(n,deep=1,len=.2){return Array.from({length:n},(_,i)=>{const z=[];if(i>0)z.push({end:len,section:deep,end_section:0,profile:'parabolic',plates:'deep'});if(i<n-1){z.push({end:1-len,section:0,end_section:null,profile:'constant',plates:'start'});z.push({end:1,section:0,end_section:deep,profile:'parabolic',plates:'deep'});}else z.push({end:1,section:0,end_section:null,profile:'constant',plates:'start'});return z;});}
function zoneSignature(spans){return JSON.stringify(spans.map(s=>s.zones.map(z=>[z.end,z.section,z.end_section??z.section,z.profile,z.plates||'start'])));}
function isDefaultHaunches(n){return zoneSignature(model.spans)===zoneSignature(defaultHaunches(n).map(zones=>({zones})));}
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
function sectionE(s){return (s.kind==='ei'||s.kind==='nebt')&&s.stiffness_input==='concrete'?concreteModulus({fc:s.fc??(s.kind==='nebt'?50:35),unit_weight:s.unit_weight??(s.kind==='nebt'?24.5:24)})/1000:s.E;}
function autoM(i){const s=model.sections[i],r=result?.model?.sections?.[i];return s&&r&&r.inertia_source===s.inertia_source&&JSON.stringify(r.composite)===JSON.stringify(s.composite)?r.inertia_modifier:null;}
function inertiaAuto(s){return ['girder','nebt'].includes(s.kind)&&!!s.composite?.enabled&&!['manual','steel'].includes(s.inertia_source||'steel');}
// v0.9.99: M is never entered; girder alone = 1, composite = I config / I girder.
function sectionM(s){if(['girder','nebt'].includes(s.kind)){const src=s.inertia_source||'steel';if(src==='steel'||(src!=='manual'&&!s.composite?.enabled))return 1;if(inertiaAuto(s)){const m=autoM(model.sections.indexOf(s));if(m!==null)return m;}}return s.inertia_modifier??1;}
function sectionEI(s){const mode=s.stiffness_input||'EI';return mode==='EI'?s.EI:sectionE(s)*1e6*(s.I_direct??.25);}
function syncSectionDerived(s){
 if(!s)return;if(s.kind==='nebt'&&(s.stiffness_input||'EI')==='EI')s.stiffness_input='concrete';
 if((s.kind==='ei'||s.kind==='nebt')&&s.stiffness_input==='concrete')s.E=Math.round(sectionE(s)*1e6)/1e6;
 if(s.kind==='ei'&&s.stiffness_input!=='EI')s.EI=s.E*1e6*(s.I_direct??.25);
}
function sectionInUse(i){return model.spans.some(s=>s.section===i||(model.nonprismatic&&s.zones.some(z=>z.section===i||(z.end_section??z.section)===i)));}
function computedE(s){return `<div class="field computed-field"><span>${t('modulusComputed')}</span><output>${fmt(sectionE(s)*1000,0)}</output></div>`;}
function sectionCard(s,i){
 const used=sectionInUse(i),props=['girder','nebt'].includes(s.kind),comp=props&&!!s.composite?.enabled;
 const inertiaSel=props?inertiaChoice(s,i):'';
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
  body+=mode==='concrete'?`<div class="field-row">${fc('nebt')}${gamma('nebt')}</div><div class="field-row">${computedE(s)}</div>`:`<div class="field-row">${field('E',`sections.${i}.E`,s.E,'',{min:.1,max:1000})}${gamma('nebt')}</div>`;
  body+=inertiaSel+`<p class="help">${t('nebtHelp')}</p>`;
 }else body+=`<div class="field-row">${field('E',`sections.${i}.E`,s.E,'',{min:.1,max:1000})}</div>${inertiaSel}<div class="field-row dimensions">${['depth','web_thickness','top_width','top_thickness','bottom_width','bottom_thickness'].map(key=>field(key,`sections.${i}.${key}`,s[key],'',{min:.1,max:20000})).join('')}</div>`;
 const spBtn=props?`<button type="button" class="sp-open-main" data-section-props="${i}"><span class="sp-ico" aria-hidden="true">⌶</span><span class="sp-txt"><b>${t('spOpenMain')}</b><small>${t(comp?'spOpenSubSlab':'spOpenSub')}</small></span><span class="sp-go" aria-hidden="true">↗</span></button>`:'';
 return `<section class="section-card" data-sec="${i}"><div class="card-head"><input aria-label="${t('name')}" data-path="sections.${i}.name" value="${esc(s.name)}" maxlength="60"><button data-remove-section="${i}" class="icon-button" title="${esc(t(used?'sectionUsedBy':'remove'))}" aria-label="${esc(t('remove'))} ${esc(s.name)}" ${model.sections.length===1||used?'disabled':''}>×</button></div>${select('sectionType',`sections.${i}.kind`,s.kind||'girder',[['girder',t('girder')],['nebt',t('nebt')],['ei',t('directEI')]])}${s.kind==='nebt'?select('nebtType',`sections.${i}.nebt`,s.nebt||'NEBT1400',Object.keys(NEBT_DATA).map(k=>[k,`${k.replace('NEBT','NEBT ')} · h ${NEBT_DATA[k].h} mm`])):''}${sectionSvg(s)}<div class="section-props">${sectionPropsHtml(s)}</div>${spBtn}${body}</section>`;
}
function refreshAutoM(){
 $$('[data-auto-m]').forEach(el=>{const s=model.sections[Number(el.dataset.autoM)];if(s)el.innerHTML=inertiaReadout(s);});
 if(inputPanel==='sections')$$("#input-content [data-sec]").forEach(card=>{const s=model.sections[Number(card.dataset.sec)],box=card.querySelector(".section-props");if(s&&box)box.innerHTML=sectionPropsHtml(s);});
}
// --- section inertia ---------------------------------------------------------
function inertiaReadout(s){
 const src=s.inertia_source||'steel',slab=!!s.composite?.enabled,eff=src==='manual'?'manual':slab?src:'steel';
 const m=eff==='steel'?1:eff==='manual'?(s.inertia_modifier??1):autoM(model.sections.indexOf(s));
 return `${t('inertiaRatio')} <b>${m==null?t('inertiaPending'):fmt(m,3)}</b>`;
}
function inertiaChoice(s,i){
 const slab=!!s.composite?.enabled,src=s.inertia_source||'steel',eff=src==='manual'?'manual':slab?src:'steel';
 const opts=[['steel','inertiaSteel','inertiaSteelSub',true],['3n','inertia3n','inertia3nSub',slab],['1n','inertia1n','inertia1nSub',slab],['negative','inertiaNeg','inertiaNegSub',slab]];
 let h=`<fieldset class="inertia-choice"><legend>${t('inertiaSource')}</legend><div class="ic-grid" role="radiogroup">`;
 h+=opts.map(([v,label,sub,ok])=>`<label class="ic-opt${eff===v?' on':''}${ok?'':' off'}"><input type="radio" name="inertia-${i}" data-path="sections.${i}.inertia_source" value="${v}" ${eff===v?'checked':''} ${ok?'':'disabled'}><span><b>${t(label)}</b><small>${t(sub)}</small></span></label>`).join('');
 h+=`</div><p class="ic-read" data-auto-m="${i}">${inertiaReadout(s)}</p>`;
 if(src==='manual')h+=`<p class="note ic-legacy">${t('inertiaLegacy').replace('{m}',fmt(s.inertia_modifier??1,3))}</p>`;
 else if(!slab)h+=`<p class="help ic-noslab">${t('inertiaNoSlab')} <button type="button" class="text-button" data-section-props="${i}">${t('inertiaDefineSlab')}</button></p>`;
 return h+`</fieldset>`;
}
// v1.01: zones of one span as a compact table under a bar drawn to scale
// (one row per zone: end, variation, start and target sections, plates from).
function spanZonesCard(s,i){
 const opts=sectionOptions(),name=k=>esc(model.sections[k]?.name??'');
 const sel=(path,value,options,label)=>`<select data-path="${path}" aria-label="${esc(label)}">${options.map(([v,l])=>`<option value="${v}" ${String(v)===String(value)?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
 let start=0;
 const bar=s.zones.map((z,j)=>{const w=Math.max(z.end-start,0);start=z.end;const variable=z.profile!=='constant';
  return `<span class="zb-seg${variable?' variable':''}" style="flex-basis:${(100*w).toFixed(3)}%" title="${t('zone')} ${j+1}">${name(z.section)}${variable?`→${name(z.end_section??z.section)}`:''}</span>`;}).join('');
 const rows=s.zones.map((z,j)=>{
  const where=`${t('span')} ${i+1} · ${t('zone')} ${j+1}`,base=`spans.${i}.zones.${j}`,variable=z.profile!=='constant';
  const profiles=['ei','nebt'].includes(model.sections[z.section].kind)?[['constant',t('zbConstant')]]:[['constant',t('zbConstant')],['linear',t('zbLinear')],['parabolic',t('zbParabolic')]];
  return `<tr><td><input data-path="${base}.end" data-scale=".01" type="number" step="any" min="0.1" max="100" value="${+(z.end/.01).toPrecision(12)}" aria-label="${esc(t('zoneEnd'))} · ${where}"></td>`
   +`<td>${sel(`${base}.profile`,z.profile,profiles,`${t('profile')} · ${where}`)}</td>`
   +`<td>${sel(`${base}.section`,z.section,opts,`${t('startSection')} · ${where}`)}</td>`
   +`<td>${variable?sel(`${base}.end_section`,z.end_section??z.section,opts,`${t('endSection')} · ${where}`):'<span class="zt-none">—</span>'}</td>`
   +`<td>${variable?sel(`${base}.plates`,z.plates||'start',[['start',t('zbPlatesStart')],['end',t('zbPlatesEnd')],['deep',t('zbPlatesDeep')]],`${t('platesFrom')} · ${where}`):'<span class="zt-none">—</span>'}</td>`
   +`<td><button class="icon-button" data-remove-zone="${i},${j}" ${s.zones.length===1?'disabled':''} title="${t('remove')}" aria-label="${t('remove')} · ${where}">×</button></td></tr>`;
 }).join('');
 return `<section class="section-card span-zones"><b>${t('span')} ${i+1} · ${fmt(s.length)} m</b><div class="zone-bar" aria-hidden="true">${bar}</div>`
  +`<table class="zone-table"><thead><tr><th>${t('zbEnd')}</th><th>${t('zbProfile')}</th><th>${t('zbStart')}</th><th>${t('zbTarget')}</th><th>${t('zbPlates')}</th><th></th></tr></thead><tbody>${rows}</tbody></table>`
  +`<button class="add-button" data-add-zone="${i}" ${s.zones.length>=12?'disabled':''}>${t('addZone')}</button></section>`;
}
