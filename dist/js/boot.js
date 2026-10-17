"use strict";
// Global state, solver, event wiring and start-up (statements run in this order).

const QB_META=window.QB_META||{version:'0.4',date:'2026-09-15',author:'Anthony Chéruel'};
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
let lang = initialLanguage();
let model, result, jobId, defaultModel, snap = null, inputPanel = "geometry", view = "diagrams", display = "envelope", manualDirection = "forward", revision = 0, timer, positionTimer, snapRevision = 0;
let influenceData=null,traverseData=null,playTimer=null,frameIndex=0;
let projectName="", savedModel="", savedProjectName="", pendingProject=null;
const NEBT_DATA={NEBT1000:{A:481787,I:62119,yb:483.4,h:1000,w:11.80},NEBT1200:{A:517773,I:99187,yb:574.8,h:1200,w:12.69},NEBT1400:{A:553643,I:146547,yb:667.4,h:1400,w:13.56},NEBT1600:{A:589884,I:204920,yb:761.2,h:1600,w:14.45},NEBT1800:{A:625457,I:275049,yb:854.9,h:1800,w:15.32}};
const STEEL_UNIT_WEIGHT=77;
let deltaMode=false;
const t = key => words[lang][key] || key;
const esc = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = (value, digits=2) => {const n=Math.abs(Number(value))<.5*10**-digits?0:Number(value);return n.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA",{minimumFractionDigits:digits,maximumFractionDigits:digits}).replace(/^-/,'−')};
const qbIsExpression=raw=>/[0-9.,)]\s*[+\-*/×÷^(]|^\(|π|pi/i.test(String(raw).replace(/[eE][-+]/g,''));
const isNumInput=el=>!!el&&(el.type==='number'||el.classList?.contains('qb-num'));
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
const sectionOptions = () => model.sections.map((s,i)=>[i,s.name]);
const groupOpen={};
document.addEventListener('toggle',e=>{if(e.target.matches?.('details.input-group'))groupOpen[e.target.dataset.group]=e.target.open;},true);
let excelAvailable=true;
const solver = new BrowserSolver((stage,info={})=>{
 if(stage==='retry'){const what=info.error?.stage||'';$('#status').textContent=`${t('retrying')} ${info.attempt}/${info.of}${what?' · '+what:''}`;window.QBSplash?.retry(info);return;}
 $('#status').textContent=`${t(result&&!jobId?'preloaded':'initializing')} · ${stage}${info.attempt>1?` · ${t('attempt')} ${info.attempt}/${info.of}`:''}`;window.QBSplash?.stage(stage,info);
});
// v0.9.8: one analysis at a time. Changes made while the engine is busy are
// merged into a single follow-up analysis of the latest model (never a queue
// of stale ones), and the wait before starting grows with the last duration.
let calcBusy=false,calcPending=false,lastElapsed=0;
// v0.8: undistorted diagrams. The SVG keeps a 926-unit wide coordinate
// system but its height follows the real on-screen aspect ratio, so the
// scaling is uniform (no squashed text). Text sizes are given in screen
// pixels through --k (screen px per SVG unit).
let PG={H:106,k:1};
const REACTION_RATIO=.55; // also --reaction-ratio in css/layout.css
let plotResizePending=false;
if(window.ResizeObserver)new ResizeObserver(()=>{if(plotResizePending)return;plotResizePending=true;requestAnimationFrame(()=>{plotResizePending=false;if(result&&view==='diagrams'){if(measurePlots())renderCharts();renderBeam();}if(view==='comparison')renderComparison();});}).observe($('.results'));
$('#charts')?.addEventListener('click',e=>{const h=e.target.closest('.reaction-plot .r-hit');if(h)inspectCase(Number(h.dataset.critical),h.dataset.sense);});
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
  model.sections.splice(i,1);if(Array.isArray(model.resistance?.types))model.resistance.types.splice(i,1);model.spans.forEach(s=>{if(s.section>i)s.section--;s.zones.forEach(z=>{if(z.section>i)z.section--;if(z.end_section>i)z.end_section--})});renderInputs();changed();return}
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
registerAnalysisTools();
$('#replace-dialog').addEventListener('close',()=>{const choice=$('#replace-dialog').returnValue,project=pendingProject;pendingProject=null;qbReplaceKind('open');if(!project||!['save','discard'].includes(choice))return;if(choice==='save'&&!saveProject())return;if(project.qbReset)qbDoReset();else applyProject(project)});
// All modules must be initialized before the first render in the combined HTML.
document.addEventListener('DOMContentLoaded',init,{once:true});
