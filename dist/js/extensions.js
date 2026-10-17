"use strict";
// Later feature layers (v0.9.5 and up): their state, event wiring and the wrappers that extend earlier functions. Runs after boot.js, in this order.

// v0.9.6: method and assumptions in a window opened from the header.
document.addEventListener('click',e=>{
 if(e.target.closest('#method-open')){renderMethod();const d=$('#method-dialog');if(d)qbFloat(d);return;}
 if(e.target.closest('[data-method-close]'))$('#method-dialog')?.close();
});
// v0.9.6: floating windows (section properties, stresses, method). Non-modal:
// the main interface stays usable and is not darkened; dragged by their
// header, brought to the front on click, closed with × or Escape.
let qbFloatZ=60,qbFloatCount=0;
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
const IMPOSED_KEYS={thermal:'imposedThermal',shrinkage:'imposedShrinkage',creep:'imposedCreep'};
let beamInsetX=null;
let beamInsetCompact=false;
$('#charts')?.addEventListener('pointermove',e=>{const svg=e.target.closest?.('svg.plot,svg.il-plot,svg.stiffness-plot');if(!svg||!result||view==='modes')return;const r=svg.getBoundingClientRect();if(!r.width)return;const u=Math.max(0,Math.min(1,((e.clientX-r.left)/r.width*926-26)/874)),total=model.spans.reduce((v,s)=>v+s.length,0);beamInsetUpdate(u*total);});
$('#charts')?.addEventListener('pointerleave',()=>beamInsetUpdate(null));
let errorTimer=null;
$('#error')?.addEventListener('click',e=>{if(!e.target.closest('button'))$('#error').classList.add('hidden');});
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
addEventListener('beforeunload',e=>{if(model&&updateProjectState()){e.preventDefault();e.returnValue='';}});
// --- Undo / redo ---------------------------------------------------------------
const qbHist={undo:[],redo:[],last:null,at:0,coalesce:false,applying:false};
document.addEventListener('keydown',e=>{
 if(!(e.ctrlKey||e.metaKey)||e.altKey||!model)return;const k=e.key.toLowerCase();
 if(k!=='z'&&k!=='y')return;
 // Inside a text field the browser's own undo applies to the typed text.
 const a=document.activeElement;if(a&&(a.tagName==='TEXTAREA'||(a.tagName==='INPUT'&&!['checkbox','radio','range','button'].includes(a.type))))return;
 if($('dialog[open]:not(.qb-float)'))return;
 e.preventDefault();qbHistGo(k==='y'||e.shiftKey?1:-1);
});
// --- Autosave in this browser and restore at the next start ------------------
const QB_AUTOSAVE='qb-autosave-v1';
let qbAutoTimer=0,qbAutoArmed=false,qbAutoFound=null;
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
document.addEventListener('focusin',e=>{if(e.target.classList?.contains('qb-num'))qbTip(e.target);});
document.addEventListener('focusout',e=>{const tip=$('#qb-num-tip');if(tip&&e.target.classList?.contains('qb-num'))tip.hidden=true;});
addEventListener('scroll',()=>{const a=document.activeElement;if(a?.classList?.contains('qb-num'))qbTip(a);},true);
document.addEventListener('DOMContentLoaded',()=>{
 const b=$('#excel');if(b){new MutationObserver(qbExcelHint).observe(b,{attributes:true,attributeFilter:['disabled']});qbExcelHint();}
 // An Undo entry in the File menu makes the shortcut discoverable.
 const save=$('#save-project');if(save&&!$('#undo-model'))save.insertAdjacentHTML('afterend',`<button type="button" id="undo-model" role="menuitem"><svg class="mi-ico" viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 5L4 8.5 7.5 12 M4.5 8.5h7a4 4 0 010 8H8.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="mi-text"><b data-i18n="undoMenu">${esc(t('undoMenu'))}</b><small data-i18n="undoMenuSub">${esc(t('undoMenuSub'))}</small></span><kbd>Ctrl Z</kbd></button>`);
},{once:true});
document.addEventListener('click',e=>{if(e.target.closest('#undo-model'))qbHistGo(-1);});
const qbTranslate0=translate;
translate=function(){qbTranslate0();qbExcelHint();$('#analysis-type')?.setAttribute('aria-label',t('analysisType'));$('#load-mode')?.setAttribute('aria-label',t('loadCase'));const d=$('#replace-dialog');if(d?.dataset.kind)qbReplaceKind(d.dataset.kind);if(qbAutoFound)qbRestoreBar(qbAutoFound);};
// The collapse arrow and the band carry names in the current language.
{const tr=translate;translate=function(){const r=tr.apply(this,arguments);const b=$('#panel-toggle');if(b){const c=document.body.classList.contains('focus-results');b.setAttribute('aria-label',t(c?'panelShow':'panelHide'));b.title=t(c?'panelShow':'panelHide');}$('#case-band')?.setAttribute('aria-label',t('caseBand'));$('#load-mode')?.setAttribute('aria-label',t('loadCase'));return r;};}
// Text in a series colour: darker inks that pass AA on white (strokes keep the hue).
const QB_INK={'#407dcc':'#3567ad','#9d762e':'#81601f','#8f7fc4':'#6d5aa8','#a99bd8':'#7f6fbd','#6b4aa5':'#5f4699','#7a5bb5':'#6d5aa8','#b5577a':'#9c4466'};
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
// v0.9.97: the table follows the tributary width as it is typed.
document.addEventListener('input',e=>{const path=e.target.dataset?.path;if(!model||!path||!path.startsWith('pedestrian.'))return;const body=$('.ped-table tbody');if(body)body.innerHTML=pedTableRows();});
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
 svg.insertAdjacentHTML('beforeend',`<g class="ped-band"><rect x="${left}" y="47" width="${right-left}" height="13" fill="#edb66f" opacity=".24"/><text x="${(left+right)/2}" y="43" text-anchor="middle" font-size="11" fill="#f1c47f">${esc(t('pedCase'))} · S6-25 3.8.9</text></g>`);
}catch(e){console.warn(e)}return r;};}
{const rr=renderResults;renderResults=function(){const r=rr.apply(this,arguments);qbGovTip();return r;};}
{const tr=translate;translate=function(){const r=tr.apply(this,arguments);qbGovTip();return r;};}
document.addEventListener('click',e=>{if(e.target.closest('[data-gov-tip-close]')){qbStore(ls=>ls.setItem('qb-gov-tip','off'));$('#gov-tip')?.remove();}});
{const ri=renderInputs;renderInputs=function(){const r=ri.apply(this,arguments);if(model&&inputPanel==='geometry'){const sup=$('#input-content details[data-group="geo-supports"]');if(sup&&!$('#input-content details[data-group="geo-joint"]')){sup.insertAdjacentHTML('afterend',jointGroup());qbEnhance($('#input-content details[data-group="geo-joint"]'));}}return r;};}
// A joint switched on lands in the middle of the last span when its x is not valid.
{const oi=onInput;onInput=function(e){const el=e.target;if(model&&el?.dataset?.path==='joint.enabled'&&el.checked){const j=jointSettings();j.kind='cut';if(!jointValid(j.x)||j.x===10){const s=jointStarts(),k=model.spans.length-1;j.x=+((s[k]+s[k+1])/2).toFixed(2);}}return oi.apply(this,arguments);};}
{const rb=renderBeam;renderBeam=function(){const r=rb.apply(this,arguments);try{if(model&&!(typeof modalBeam==='function'&&view==='modes')){const svg=$('#beam'),total=jointStarts().at(-1);svg?.querySelector('.joint-mark')?.remove();const h=jointBeamSvg(total);if(h)svg.insertAdjacentHTML('beforeend',h);}}catch(e){console.warn(e);}return r;};}
{const rc=renderCharts;renderCharts=function(){const r=rc.apply(this,arguments);try{jointChartMarks();}catch(e){console.warn(e);}return r;};}
// --- floating windows: resize from every edge and corner -----------------------
const QB_EDGE=6,QB_CURSOR={n:'ns-resize',s:'ns-resize',e:'ew-resize',w:'ew-resize',ne:'nesw-resize',sw:'nesw-resize',nw:'nwse-resize',se:'nwse-resize'};
document.addEventListener('pointermove',e=>{
 if(e.buttons)return;const dlg=e.target.closest?.('dialog.qb-float');
 $$('dialog.qb-float[data-edge]').forEach(d=>{if(d!==dlg){d.style.cursor='';delete d.dataset.edge;}});
 if(!dlg)return;const s=qbEdge(dlg,e);
 if(s){dlg.dataset.edge=s;dlg.style.cursor=QB_CURSOR[s];}else if(dlg.dataset.edge){delete dlg.dataset.edge;dlg.style.cursor='';}
});
document.addEventListener('pointerdown',e=>{
 const dlg=e.target.closest?.('dialog.qb-float');if(!dlg||e.button!==0)return;const s=qbEdge(dlg,e);if(!s)return;
 e.preventDefault();e.stopImmediatePropagation();dlg.style.zIndex=++qbFloatZ;
 const r=dlg.getBoundingClientRect(),x0=e.clientX,y0=e.clientY,minW=Math.min(340,innerWidth-16),minH=200;dlg.classList.add('resizing');
 const move=ev=>{
  const dx=ev.clientX-x0,dy=ev.clientY-y0;let left=r.left,top=r.top,width=r.width,height=r.height;
  if(s.includes('e'))width=Math.max(minW,Math.min(innerWidth-r.left-2,r.width+dx));
  if(s.includes('w')){width=Math.max(minW,r.width-dx);left=Math.max(0,r.right-width);width=r.right-left;}
  if(s.includes('s'))height=Math.max(minH,Math.min(innerHeight-r.top-2,r.height+dy));
  if(s.includes('n')){height=Math.max(minH,r.height-dy);top=Math.max(0,r.bottom-height);height=r.bottom-top;}
  Object.assign(dlg.style,{left:`${left}px`,top:`${top}px`,width:`${width}px`,height:`${height}px`,maxWidth:'none',maxHeight:'none'});
 };
 const end=()=>{dlg.classList.remove('resizing');removeEventListener('pointermove',move);removeEventListener('pointerup',end);removeEventListener('pointercancel',end);dlg.dispatchEvent(new Event('qb-resize'));};
 addEventListener('pointermove',move);addEventListener('pointerup',end);addEventListener('pointercancel',end);
},true);
{const qbInView=window.ResizeObserver?new ResizeObserver(es=>es.forEach(e=>qbKeepInView(e.target))):null;
 const f=qbFloat;qbFloat=function(dlg){const r=f.apply(this,arguments);if(!dlg.dataset.inView){dlg.dataset.inView='1';qbInView?.observe(dlg);let tm=0;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>qbKeepInView(dlg),60);}).observe(dlg,{childList:true,subtree:true});}qbKeepInView(dlg);[60,300,900].forEach(t=>setTimeout(()=>qbKeepInView(dlg),t));return r;};
 addEventListener('resize',()=>$$('dialog.qb-float[open]').forEach(qbKeepInView));}
// Fallback without layout callbacks (background tab): re-check after an edit.
['change','click'].forEach(type=>document.addEventListener(type,e=>{const dlg=e.target.closest?.('dialog.qb-float');if(dlg)setTimeout(()=>qbKeepInView(dlg),80);}));
