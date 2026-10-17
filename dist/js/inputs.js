"use strict";
// Left panel: fields, vehicle, supports, pedestrian load, imposed deformation, deck joint.

function field(key, path, value, unit="", options={}) {
 const id = "f-" + path.replaceAll(".","-");
 const scale = options.scale || 1;
 return `<label class="field ${options.full?'full':''}" for="${id}"><span>${esc(t(key))}${unit}</span><input id="${id}" data-path="${path}" data-scale="${scale}" type="${options.text?'text':'number'}" ${options.text?'maxlength="80"':`step="${options.step || 'any'}" min="${options.min ?? 0}" ${options.max!==undefined?`max="${options.max}"`:''}`} value="${esc(options.text?value:+(value / scale).toPrecision(12))}"></label>`;
}
function select(key,path,value,options) {
 const id = "f-"+path.replaceAll(".","-");
 return `<label class="field" for="${id}"><span>${esc(t(key))}</span><select id="${id}" data-path="${path}">${options.map(([v,label])=>`<option value="${v}" ${String(v)===String(value)?'selected':''}>${esc(label)}</option>`).join('')}</select></label>`;
}
function vehiclePattern(live=model.live) {
 if(qbEvalOn(live)){const W=625,n={1:5,2:4,3:3}[live.evaluation];return {weights:[.08,.2,.2,.28,.24].slice(0,n).map(f=>+(f*W).toFixed(6)),spaces:[3.6,1.2,6.6,6.6].slice(0,n-1)};}
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
// v0.9.97: S6-25 Section 14 evaluation level (Figure 14.1) of CL-625 / CL-750-QC.
function qbEvalOn(live=model?.live){return !!live&&live.vehicle==='CL625'&&['1','2','3'].includes(String(live.evaluation||'design'));}
function qbEvalLane(live=model?.live){return {A:9,B:8,CD:7,C:7,D:7}[live?.road_class||'A'];}
function vehicleName(vehicle=model.live.vehicle) {if(vehicle===model?.live?.vehicle&&qbEvalOn())return `CL${model.live.evaluation}-625`;return vehicle==='CL625'?'CL-625':vehicle==='CL750QC'?'CL-750-QC':vehicle==='HL93Truck'?t('hl93Truck'):vehicle==='HL93Tandem'?t('hl93Tandem'):vehicle==='Cooper'?t('cooper'):vehicle==='Maintenance'?t('maintenance'):t('custom');}
function canadianLaneVehicle(vehicle=model.live.vehicle) {return ['CL625','CL750QC','custom'].includes(vehicle);}
function visualAxleFactor(record=snap?.record) {const lane=record?record.case==='lane':model.live.case==='lane',reduction=lane&&canadianLaneVehicle()?(record?.fraction??(model.live.vehicle==='CL625'||qbEvalOn()?.8:model.live.lane_fraction)):1;return (model.live.axle_factor??1)*reduction;}
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
function inputGroup(key,title,body,defaultOpen=true,meta=''){
 const open=groupOpen[key]??defaultOpen;
 return `<details class="input-group" data-group="${key}" ${open?'open':''}><summary><span class="group-title">${title}</span>${meta?`<span class="group-meta">${meta}</span>`:''}</summary><div class="group-body">${body}</div></details>`;
}
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
 } else if(inputPanel==="sections") {
  const hasNebt=model.sections.some(s=>s.kind==='nebt');
  let cards=`<label class="toggle-row${hasNebt?' disabled':''}" title="${hasNebt?t('nebtNoTaper'):''}"><input type="checkbox" data-path="nonprismatic" ${model.nonprismatic?'checked':''} ${hasNebt?'disabled':''}>${t('nonprismatic')}</label>${hasNebt?`<p class="help">${t('nebtNoTaper')}</p>`:''}`;
  cards+=model.sections.map((s,i)=>sectionCard(s,i)).join('');
  cards+=`<button class="add-button" id="add-section">${t('addSection')}</button>`;
  html+=inputGroup('sec-model',t('sectionMode'),cards,true,`${model.sections.length} · ${model.nonprismatic?t('variableShort'):t('prismaticShort')}`);
  let spans=model.spans.map((s,i)=>model.nonprismatic?spanZonesCard(s,i):`<section class="section-card"><b>${t('span')} ${i+1} · ${fmt(s.length)} m</b>${select('section',`spans.${i}.section`,s.section,sectionOptions())}</section>`).join('');
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
  if(model.live.vehicle==='CL625')live+=select('evalLevel','live.evaluation',model.live.evaluation||'design',[['design',t('evalDesign')],['1',t('evalLevel1')],['2',t('evalLevel2')],['3',t('evalLevel3')]]);
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
   const evalOn=qbEvalOn(),mtqAuto=model.live.vehicle==='CL750QC'&&model.live.mtq_auto!==false&&!evalOn;
   if(evalOn)live+=select('evalRoadClass','live.road_class',model.live.road_class||'A',[['A','A · q = 9 kN/m'],['B','B · q = 8 kN/m'],['CD','C / D · q = 7 kN/m']]);
   if(model.live.vehicle==='CL750QC'&&!evalOn)live+=`<label class="toggle-row"><input type="checkbox" data-path="live.mtq_auto" ${mtqAuto?'checked':''}>${t('mtqAuto')}</label><p class="help">${t('mtqAutoHelp')}</p>`;
   if(canadianLaneVehicle()&&model.live.vehicle!=='CL625'&&!mtqAuto&&!evalOn)live+=select('fraction','live.lane_fraction',model.live.lane_fraction,[[.8,'80 %'],[.63,'63 %']]);
   const laneW=evalOn?qbEvalLane():model.live.vehicle==='CL625'?9:model.live.vehicle==='CL750QC'?12.6:model.live.vehicle==='HL93Truck'||model.live.vehicle==='HL93Tandem'?9.3:model.live.vehicle==='Cooper'?model.live.cooper_e/10*4.4482216/.3048:model.live.lane_w;
   if(model.live.vehicle==='custom')live+=field('laneIntensity','live.lane_w',model.live.lane_w);else live+=`<p class="note">${t('laneIntensity')}: <b>${fmt(laneW,1)}</b>${model.live.vehicle==='CL625'||evalOn?' · 80 %':''}</p>`;
   // v0.9.97: the lane UDL is always on the spans that increase each effect (no option).
  }
  live+=['Cooper','Maintenance'].includes(model.live.vehicle)?`<p class="help">${t('noDynamic')}</p>`:`<label class="toggle-row"><input type="checkbox" data-path="live.dynamic" ${model.live.dynamic?'checked':''}>${t('dynamic')}</label>`;live+=`<p class="help">${t('bothDirectionsAlways')}</p>`;
  const walkers=model.live.source==='pedestrian';
  if(walkers)live=`<p class="note ped-replaced">${t('vehicleReplaced')}</p><div class="ped-dimmed">${live}</div>`;
  html+=inputGroup('loads-live',t('liveLoads'),live,false,walkers?t('pedestrianShort'):vehicleName());
  html+=inputGroup('loads-ped',t('pedestrianGroup'),pedestrianCard(),walkers,walkers?t('pedOnShort'):t('offShort'));
  if(typeof axleCard==='function')html+=inputGroup('loads-ft',t('axleGroup'),(walkers?`<p class="note">${t('ftNotPedestrian')}</p>`:'')+axleCard(),false,typeof axleGroupMeta==='function'?axleGroupMeta():'');
 }
 $('#input-content').innerHTML=html;
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
 if(isNumInput(el) && (!el.validity.valid||el.value==='')) { if(path.startsWith('distribution.')||path.startsWith('resistance.')||/^sections\.\d+\.composite\./.test(path)){updateProjectState();return;} invalidate(t('invalid'));return; }
 let value=el.type==='checkbox'?el.checked:isNumInput(el)?+(numValue(el)*Number(el.dataset.scale||1)).toPrecision(12):el.value;
 if(el.tagName==='SELECT' && (path.endsWith('section')||path.endsWith('end_section')||path.endsWith('.span')||path==='live.lane_fraction'))value=Number(value);
 const previousVehicle=model.live.vehicle,previousPattern=path==='live.vehicle'?vehiclePattern():null;
 // S6-25 FT settings never change the analysis: no recalculation of the envelopes.
 // Composite slab data of the section properties window: display only, no analysis.
 // v0.9.97: Résistance tab, display only: no recalculation of the envelopes.
 if(path==='live.road_class'&&model.distribution)model.distribution.road_class=value==='CD'?'CD':'AB';
 let evalSync=false;if(path==='distribution.road_class'){const before=model.live.road_class;model.live.road_class=value==='CD'?'CD':before==='CD'?'A':before;evalSync=qbEvalOn()&&before!==model.live.road_class;}
 if(path.startsWith('resistance.')){setValue(path,value);updateProjectState();if(typeof resistanceChanged==='function')resistanceChanged(path,el);return;}
 if(/^sections\.\d+\.composite\./.test(path)){setValue(path,value);updateProjectState();if(typeof sectionPropsChanged==='function')sectionPropsChanged(path);return;}
 if(path.startsWith('sections.')&&typeof sectionPropsChanged==='function')setTimeout(()=>sectionPropsChanged(path));
 // S6-25 FT: recalculate the envelopes only when FT is (or was just) applied.
 if(path.startsWith('distribution.')){
  const wasApplied=model.distribution.enabled&&model.distribution.apply;setValue(path,value);
  const isApplied=model.distribution.enabled&&model.distribution.apply;
  if(el.tagName==='SELECT'||el.type==='checkbox'){renderInputs();if(typeof axleDialogOpen==='function'&&axleDialogOpen())renderAxleView();}
  if(wasApplied||isApplied||evalSync)changed();else{updateProjectState();if(typeof axleChanged==='function')axleChanged();}
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
 if(el.tagName==='SELECT'||el.type==='checkbox'||el.type==='radio')renderInputs();
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
function imposedCaption(){
 const k=imposedKind(),th=model.thermal;
 let d;if(k==='thermal')d=`α ${fmt(th.alpha_micro,2)}×10⁻⁶/°C · ${(th.profile||'linear')==='bilinear'?`${t('thermalBilinear')} ${fmt(th.slab_delta_T??30,0)} °C`:(th.depth_source||'sections')==='manual'?`h ${fmt(th.depth,0)} mm`:t('thermalDepthShort')}`;
 else{const e=imposedStrainMicro();d=`${k==='creep'?`φ ${fmt(th.creep_phi??2,1)} · σc ${fmt(th.creep_stress??3,1)} MPa · `:''}ε ${e===null?'—':fmt(e,0)}×10⁻⁶ · ${fmt(th.modular_factor??3,1)}n`;}
 return `<span class="thermal-badge">${imposedIcon(k,16)}${t(IMPOSED_KEYS[k])} · ${d}</span>`;
}
function illuSection(){return slabSection()||model.sections[model.spans[0]?.section]||model.sections[0];}
function illuGirder(s,gTop,bot){
 if(s?.kind==='ei')return `<rect x="56" y="${gTop}" width="36" height="${bot-gTop}" rx="3" fill="#cfe7e6" stroke="#007f78" stroke-width="1.3"/><text x="74" y="${(gTop+bot)/2+4}" text-anchor="middle" font-size="12" font-weight="700" fill="#007f78">EI</text>`;
 if(s?.kind==='nebt'){const h=(NEBT_DATA[s.nebt]||NEBT_DATA.NEBT1400).h,sx=52/1200,sy=(bot-gTop)/h,r=[[600,h],[600,h-90],[90,h-230],[90,330],[405,180],[405,0]],pts=[...r,...r.slice().reverse().map(([x,y])=>[-x,y])].map(([x,y])=>`${(74+x*sx).toFixed(1)},${(bot-y*sy).toFixed(1)}`).join(' ');return `<polygon points="${pts}" fill="#e6e1d6" stroke="#8a7a5c" stroke-width="1.3"/>`;}
 return `<path d="M52 ${gTop}h44v5H76v${bot-gTop-11}h24v6H48v-6h24V${gTop+5}H52Z" fill="#cfe7e6" stroke="#007f78" stroke-width="1.3"/>`;
}
function pedSettings(){if(!model.pedestrian)model.pedestrian={width_source:'slab',width:2000,maintenance:false};return model.pedestrian;}
function pedSlabWidth(){const s=model.sections.find(x=>x.composite&&x.composite.enabled);return s?s.composite.effective_width:null;}
function pedWidthMm(){const p=pedSettings(),slab=pedSlabWidth();return p.width_source==='slab'&&slab?slab:p.width;}
// v0.9.97: S6-25 3.8.9, p = 4.25 (0.5 + √(5/s)) ≤ 4.25 kPa (s: total loaded length, m).
function pedIntensity(len){return Math.min(4.25*(.5+Math.sqrt(5/Math.max(len,1e-9))),4.25);}
function pedestrianMeta(){const L=model.spans.reduce((a,s)=>a+s.length,0),p=pedIntensity(L);return `${fmt(p,2)} kPa · ${fmt(p*pedWidthMm()/1000,2)} kN/m`;}
function pedTableRows(){
 const L=model.spans.reduce((a,s)=>a+s.length,0),rows=[...model.spans.map((s,i)=>[`${t('spanWord')} ${i+1}`,s.length]),[t('pedWhole'),L]],w=pedWidthMm();
 return rows.map(([n,l])=>`<tr><td>${esc(n)}</td><td>${fmt(l,2)}</td><td>${fmt(pedIntensity(l),2)}</td><td>${fmt(pedIntensity(l)*w/1000,2)}</td></tr>`).join('');
}
function pedestrianCard(){
 const p=pedSettings(),on=model.live.source==='pedestrian',slab=pedSlabWidth();
 let h=`<div class="load-card ped-card"><label class="toggle-row"><input type="checkbox" id="ped-source" ${on?'checked':''}>${t('pedestrianUse')}</label>`;
 if(!on)return h+`<p class="help">${t('pedHelp')}</p></div>`;
 h+=select('pedWidthSource','pedestrian.width_source',slab?p.width_source:'manual',slab?[['slab',`${t('pedWidthSlab')} · ${fmt(slab,0)} mm`],['manual',t('pedWidthManual')]]:[['manual',t('pedWidthManual')]]);
 if(!slab||p.width_source==='manual')h+=field('pedWidth','pedestrian.width',p.width,'',{min:1,max:30000});
 h+=`<p class="ped-formula">p = 4,25 (0,5 + √(5 / s)) ≤ 4,25 kPa</p><p class="help">${t('pedFormula')}</p>`;
 h+=`<table class="axle-table ped-table"><thead><tr><th></th><th>s (m)</th><th>p (kPa)</th><th>w (kN/m)</th></tr></thead><tbody>${pedTableRows()}</tbody></table>`;
 h+=`<div class="field-row">${field('loadFactor','live.factor',model.live.factor??1)}</div>`;
 h+=`<label class="toggle-row"><input type="checkbox" data-path="pedestrian.maintenance" ${p.maintenance?'checked':''}>${t('pedMaintenance')}</label><p class="help">${t('pedMaintenanceHelp')}</p><p class="help">${t('pedHelp')}</p></div>`;
 return h;
}
// --- deck joint --------------------------------------------------------------
function jointSettings(){if(!model.joint)model.joint={enabled:false,x:10,kind:'cut',keep:'both'};return model.joint;}
function jointStarts(){const s=[0];model.spans.forEach(p=>s.push(s.at(-1)+p.length));return s;}
function jointValid(x){const s=jointStarts();return x>0&&x<s.at(-1)&&s.every(e=>Math.abs(x-e)>=.05);}
function jointRemoved(){const j=model?.joint;if(!j?.enabled||j.kind!=='cut'||!j.keep||j.keep==='both')return null;const L=jointStarts().at(-1);return j.keep==='left'?[j.x,L]:[0,j.x];}
function jointGroup(){
 const j=jointSettings(),L=jointStarts().at(-1);
 let b=`<label class="toggle-row"><input type="checkbox" data-path="joint.enabled" ${j.enabled?'checked':''}>${t('jointEnable')}</label>`;
 if(j.enabled){
  // v1.0: saw cut only (the hinge option is withdrawn; legacy projects keep theirs).
  const legacy=j.kind==='hinge';
  b+=`<div class="field-row">${field('jointX','joint.x',j.x,'',{min:.05,max:Math.max(.1,+(L-.05).toFixed(3))})}${legacy?select('jointKind','joint.kind',j.kind,[['cut',t('jointCutShort')],['hinge',t('jointHingeShort')]]):''}</div>`;
  b+=`<p class="joint-kind-note">${t(legacy?'jointLegacyHinge':'jointCut')}</p>`;
  if(!legacy)b+=select('jointKeep','joint.keep',j.keep||'both',[['both',t('jointKeepBoth')],['left',t('jointKeepLeft')],['right',t('jointKeepRight')]]);
 }
 const meta=j.enabled?`${t(j.kind==='cut'?'jointCutShort':'jointHingeShort')} · ${fmt(j.x,2)} m`:t('jointOff');
 return inputGroup('geo-joint',t('jointTitle'),b,!!j.enabled,meta);
}
