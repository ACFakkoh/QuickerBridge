"use strict";
// Project file, examples, reset, undo / redo, autosave, Excel export.

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
function updateStructureName(){const el=$('#structure-name');if(el)el.textContent=projectName||t('untitled');}
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
// --- Why Excel export is unavailable -----------------------------------------
function qbExcelHint(){
 const b=$('#excel');if(!b)return;const small=b.querySelector('.mi-text small');if(!small)return;
 small.removeAttribute('data-i18n');
 const invalid=$$('input[data-path].qb-num,input[data-path][type="number"]').some(el=>!el.validity.valid||el.value==='');
 small.textContent=!b.disabled?t('excelSub'):!engineReady?t('excelWaitEngine'):invalid?t('excelWaitInvalid'):t('excelWaitCalc');
 b.classList.toggle('mi-waiting',b.disabled);
}
