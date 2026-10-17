"use strict";
// Analysis requests, result views, station table, method window, start-up.

function bootErrorHtml(e){
 // Clear, actionable start-up failure: which stage, which library/host, what to try.
 const stage=e?.stage||'Python / WebAssembly',detail=String(e?.detail||e?.message||'').slice(0,300);
 return `<b>${t('bootFailedTitle')}</b><br>${t('bootFailedStage')} <b>${esc(stage)}</b>${e?.attempts?` · ${e.attempts} ${t('bootAttempts')}`:''}${e?.stalled?` · ${t('bootStalled')}`:''}<br><small>${esc(detail)}</small><br>${t('bootHint')}<br><button id="boot-retry" class="text-button">${t('bootRetry')}</button>`;
}
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
 }catch(e){if(token===revision){window.QBSplash?.done();console.error(e);const known=['thermal.needs_slab','model.nebt_nonprismatic','composite.bars','model.split_end','joint.position','joint.unstable'].find(k=>String(e).includes(k));invalidate(known?t(known):t('invalid'))}}
 finally{calcBusy=false;if(calcPending){calcPending=false;calculate(revision);}}
}
function caseText(c) {
 if(!c)return '';
 const name=c.case==='hl93_two_trucks'?t('twoTruckCase'):c.case==='lane'?t('lane'):c.case==='unloaded'?t('unloaded'):t('truck');
 const canadianLane=c.case==='lane'&&canadianLaneVehicle(),codeFactor=canadianLane?`${t('fraction')} ×${fmt(c.fraction??(model.live.vehicle==='CL625'||qbEvalOn()?.8:model.live.lane_fraction),2)}`:['Cooper','Maintenance'].includes(model.live.vehicle)?t('noDynamic'):`${t('dynamicFactor')} ×${fmt(c.factor,2)}`;
 return `${name} · ${t('axles')} ${c.axles.length?c.axles.join('–'):'—'} · ${codeFactor} · ${t('loadFactor')} ×${fmt(model.live.factor??1,2)} · ${t('axleFactor')} ×${fmt(model.live.axle_factor??1,2)}${c.rear_spacing!==undefined?` · s₃ = ${fmt(c.rear_spacing,2)} m`:''}${c.second_position!==undefined?` · x₂ = ${fmt(c.second_position)} m · ≥ ${fmt(c.gap,2)} m`:''} · x₁ = ${fmt(c.position,1)} m · ${c.direction==='forward'?t('forward'):t('backward')}`;
}
function showView(name) {
 document.body.classList.toggle('comparison-mode',name==='comparison');
 const previous=view;view=name;document.body.dataset.view=name;$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));$$('.result-view').forEach(el=>el.classList.toggle('hidden',el.id!==name+'-view'));
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
function renderTable() {
 if(!result)return;
 const seen=new Set();
 const thermal=result.kind==='thermal',dead=!thermal&&model.load_mode==='dead',single=thermal||dead;
 const headers=single?'<th>V</th><th>M</th><th>δ</th><th>R</th>':'<th>V min</th><th>V max</th><th>M min</th><th>M max</th><th>δ min</th><th>δ max</th><th>R min</th><th>R max</th>';
 $('#table-view').innerHTML=`<p class="help">${t(thermal?'thermalCase':dead?'deadOnly':'envelope')} · V: kN · M: kN·m · δ: mm · R: kN</p><label class="table-options">${t('subdivisions')} <input id="subdivisions" type="number" min="2" max="100" step="1" data-path="subdivisions" value="${model.subdivisions}"></label><div class="table-scroll"><table><thead><tr><th>${t('span')}</th><th>x (m)</th><th>${t('side')}</th>${headers}</tr></thead><tbody>${result.table.map(row=>{const sp=result.reactions.find(r=>r.split&&Math.abs(r.x-row.x)<1e-8);let r=sp?null:result.reactions.find(r=>Math.abs(r.x-row.x)<1e-8&&!seen.has(r.support));if(r)seen.add(r.support);if(sp){const o=splitReactionItems(sp,0,thermal,false,false).find(o=>o.side===row.side);if(o)r={value:o.hi,min:o.lo,max:o.hi};}const cells=thermal?['V','M','D'].map(k=>`<td>${fmt(row[k])}</td>`).join('')+`<td>${r?fmt(r.value):'—'}</td>`:dead?['V_max','M_max','D_max'].map(k=>`<td>${fmt(row[k])}</td>`).join('')+`<td>${r?fmt(r.max):'—'}</td>`:['V_min','V_max','M_min','M_max','D_min','D_max'].map(k=>`<td>${fmt(row[k])}</td>`).join('')+`<td>${r?fmt(r.min):'—'}</td><td>${r?fmt(r.max):'—'}</td>`;return `<tr class="${row.station===0||row.station===model.subdivisions?'support-station':''}"><td>${row.span} · ${row.station}</td><td>${fmt(row.x)}</td><td>${t(row.side)}</td>${cells}</tr>`}).join('')}</tbody></table></div><div class="table-footnote">${t('subdivisionHelp')}</div>`;
}
function renderMethod() {
 const thermal=result?.kind==='thermal',sections=thermal?[['methodTitle','methodBody'],['thermalNotes','thermalBody'],['sectionNotes','sectionBody'],['unitsTitle','unitsBody']]:[['methodTitle','methodBody'],['sectionNotes','sectionBody'],['selfWeightNotes','selfWeightBody'],...(model?.supports?.includes('split')?[['splitNotes','splitBody']]:[]),...(model?.load_mode==='dead'?[]:[['loadNotes','loadBodyCurrent']]),['methodScope','scopeBodyCurrent'],['precisionTitle','precisionBody'],['unitsTitle','unitsBody']];
 const source=qbEvalOn()?`CAN/CSA S6-25 · 14.9.1 · ${t('evalFigure')}<br>`:model?.live?.vehicle==='CL750QC'?`CAN/CSA S6-25 · 3.8.4.5.3<br>MTQ · Info-structures A2023-05 · 2023-02-17<br>`:model?.live?.vehicle==='CL625'?`CAN/CSA S6-25 · 3.8.4.5.3<br>`:model?.live?.vehicle==='HL93Truck'||model?.live?.vehicle==='HL93Tandem'?`AASHTO LRFD HL-93 · PyCBA VehicleLibrary.US<br>`:model?.live?.vehicle==='Cooper'?`AREA / AREMA Cooper E · PyCBA VehicleLibrary.US<br>`:'';
 $('#method-view').innerHTML=`<div class="method-content">${sections.map(([h,p])=>`<h3>${t(h)}</h3><p>${t(p)}</p>`).join('')}<h3>${t('sourceTitle')}</h3><p>${thermal?'':source}<a href="https://ccaprani.github.io/pycba/" target="_blank" rel="noreferrer">PyCBA · ${result?result.meta.pycba:'1.0.1'}</a></p>${result?`<h3>${t('runTitle')}</h3><p>${esc(result.kind==='thermal'?`κ = ${Number(result.meta.curvature).toExponential(3)} 1/m`:`Δx ${fmt(result.meta.travel_step,2)} m · ${fmt(result.meta.positions,0)} ${t('positions')} · ${result.meta.groups} ${t('groups')}`)} · ${t('signsShort')}</p>`:''}</div>`;
}
function restoreEnvelope() {stopAnimation();snapRevision++;snap=null;display='envelope';renderResults();renderBeam();}
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
