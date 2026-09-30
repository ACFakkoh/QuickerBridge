"use strict";
Object.assign(words.fr,{compare:'Comparer',compareOpen:'Choisir un projet JSON',compareClose:'Fermer',compareLoading:'Calcul du projet de référence…',compareCurrent:'Projet courant',compareReference:'Référence',compareDifference:'Écart des extrema',compareGeometry:'Géométrie différente : abscisses en mètres, appuis propres à chaque projet.',compareCases:'Les paramètres de charge enregistrés sont utilisés pour chaque projet.',compareRead:'Survoler pour lire les valeurs des deux projets.',compareInvalid:'Projet de comparaison invalide.'});
Object.assign(words.en,{compare:'Compare',compareOpen:'Choose a JSON project',compareClose:'Close',compareLoading:'Computing the reference project…',compareCurrent:'Current project',compareReference:'Reference',compareDifference:'Difference of extrema',compareGeometry:'Different geometry: coordinates in metres, supports shown for each project.',compareCases:'Each project uses its own saved load settings.',compareRead:'Hover to read both projects.',compareInvalid:'Invalid comparison project.'});
let comparisonProject=null,comparisonResult=null,comparisonToken=0,comparisonLoading=false,comparisonError='';
$('#compare-project').textContent=t('compare');
async function openComparison(file){
 const token=++comparisonToken;comparisonLoading=true;comparisonError='';showView('comparison');renderComparison();
 try{
  const project=await validateSelectedProject(file);
  const data=await solver.request('compare',{model:project.model});
  if(token!==comparisonToken)return;
  comparisonProject=project;comparisonResult=data;
 }catch(e){if(token!==comparisonToken)return;comparisonError=t('compareInvalid');console.error(e);}
 finally{if(token===comparisonToken){comparisonLoading=false;renderComparison();}}
}
function comparisonValues(data,key,sense){return data.kind==='thermal'?data.values[key]:data[sense][key];}
function comparisonSample(data,key,x,sense,side='right'){
 if(x<0||x>data.x.at(-1))return null;
 const values=comparisonValues(data,key,sense),xs=data.x;
 let j=0;while(j<xs.length-1&&xs[j]<x-1e-8)j++;
 if(Math.abs(xs[j]-x)<1e-8){if(side==='right')while(j+1<xs.length&&Math.abs(xs[j+1]-x)<1e-8)j++;return values[j];}
 const a=Math.max(0,j-1),f=(x-xs[a])/(xs[j]-xs[a]);return values[a]+f*(values[j]-values[a]);
}
function renderComparison(){
 const host=$('#comparison-view');if(!host)return;
 document.body.classList.toggle('comparison-mode',view==='comparison');
 const heading=`<div class="compare-head"><span>${esc(comparisonProject?.name||t('compareReference'))}</span><div><button id="comparison-open">${t('compareOpen')}</button> <button id="comparison-close">${t('compareClose')}</button></div></div>`;
 if(comparisonLoading||comparisonError||!comparisonResult||!result){host.innerHTML=heading+`<p class="compare-note" role="status">${comparisonError||t(comparisonLoading?'compareLoading':!result?'noResults':'compareOpen')}</p>`;return;}
 const a=result,b=comparisonResult,total=Math.max(a.x.at(-1),b.x.at(-1));
 const metrics=[['M+',Math.max(...comparisonValues(a,'M','max')),Math.max(...comparisonValues(b,'M','max')),'kN·m'],['M−',Math.min(...comparisonValues(a,'M','min')),Math.min(...comparisonValues(b,'M','min')),'kN·m'],['|V|',Math.max(...['min','max'].flatMap(k=>comparisonValues(a,'V',k).map(Math.abs))),Math.max(...['min','max'].flatMap(k=>comparisonValues(b,'V',k).map(Math.abs))),'kN'],['|δ|',Math.max(...['min','max'].flatMap(k=>comparisonValues(a,'D',k).map(Math.abs))),Math.max(...['min','max'].flatMap(k=>comparisonValues(b,'D',k).map(Math.abs))),'mm']];
 const geometry=JSON.stringify(a.reactions.map(r=>r.x))===JSON.stringify(b.reactions.map(r=>r.x));
 const note=geometry?t('compareCases'):t('compareGeometry');
 const names=[`${t('compareCurrent')} · ${projectName||t('untitled')} · ${t(a.model.load_mode)}`,`${t('compareReference')} · ${comparisonProject.name} · ${t(b.model.load_mode)}`];
 const style=getComputedStyle(host),rowStyle=getComputedStyle($('#charts .chart-row'));
 const width=host.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-parseFloat(rowStyle.gridTemplateColumns)-(parseFloat(rowStyle.columnGap)||0);
 const k=Math.max(.1,width/926),u=p=>p/k,H=parseFloat(style.getPropertyValue('--plot-h'))/k;
 const charts=['V','M','D'].map(key=>{
  const W=926,L=38,R=908,top=u(20),bot=H-u(40),mid=(top+bot)/2;
  const amp=Math.max(...[a,b].flatMap(d=>['min','max'].flatMap(k=>comparisonValues(d,key,k).map(Math.abs))),1e-6)*1.15;
  const X=x=>L+x/total*(R-L),Y=v=>mid+(key==='V'?-1:1)*v/amp*(bot-top)/2;
  const path=(d,sense)=>comparisonValues(d,key,sense).map((v,i)=>`${i?'L':'M'}${X(d.x[i]).toFixed(2)},${Y(v).toFixed(2)}`).join('');
  let svg=`<line x1="${L}" x2="${R}" y1="${mid}" y2="${mid}" stroke="#b5c7d1"/>`;
  [a,b].forEach((d,i)=>{
   d.reactions.forEach(r=>{svg+=`<line x1="${X(r.x)}" x2="${X(r.x)}" y1="${top}" y2="${bot}" stroke="${i?'#e1c4a3':'#dbe5eb'}" stroke-dasharray="${i?'2 4':'4 3'}"/>${!i||!geometry?`<text x="${X(r.x)}" y="${H-u(i?7:22)}" text-anchor="middle">${fmt(r.x,1)}</text>`:''}`;});
   svg+=`<path d="${path(d,'min')}" fill="none" stroke="${i?'#b96f17':'#008378'}" stroke-width="2" ${i?'stroke-dasharray="6 3"':''}/><path d="${path(d,'max')}" fill="none" stroke="${i?'#b96f17':'#008378'}" stroke-width="2" ${i?'stroke-dasharray="6 3"':''}/>`;
  });
  return `<div class="chart-row"><div class="chart-label">${key==='D'?'δ':key}<small>${key==='M'?'kN·m':key==='V'?'kN':'mm'}</small></div><svg class="plot compare-plot" data-key="${key}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${key} · ${t('compare')}" style="--k:${k}">${svg}</svg></div>`;
 }).join('');
 host.innerHTML=heading+`<p class="compare-note">${note}</p><div class="compare-legend"><span>${esc(names[0])} —</span><span>${esc(names[1])} - -</span></div><div class="table-scroll comparison-table"><table><thead><tr><th></th><th>${t('compareCurrent')}</th><th>${t('compareReference')}</th><th>${t('compareDifference')} (${lang==='fr'?'réf. − courant':'ref. − current'})</th></tr></thead><tbody>${metrics.map(([label,v,w,unit])=>`<tr><td>${label} (${unit})</td><td>${fmt(v)}</td><td>${fmt(w)}</td><td>${fmt(w-v)}</td></tr>`).join('')}</tbody></table></div>${charts}<div id="comparison-readout" class="station-readout">${t('compareRead')}</div>`;
 renderBeam();
 host.querySelectorAll('.compare-plot').forEach(svg=>svg.addEventListener('pointermove',e=>{
  const rect=svg.getBoundingClientRect(),x=Math.max(0,Math.min(total,((e.clientX-rect.left)/rect.width*926-38)/870*total)),key=svg.dataset.key;
  $('#comparison-readout').innerHTML=`<span>x <b>${fmt(x)} m</b></span>`+[a,b].map((d,j)=>{const lo=comparisonSample(d,key,x,'min'),hi=comparisonSample(d,key,x,'max');return `<span>${t(j?'compareReference':'compareCurrent')} ${key==='D'?'δ':key} <b>${lo===null?'—':fmt(lo)+' / '+fmt(hi)}</b></span>`;}).join('');
 }));
}
document.addEventListener('click',e=>{
 if(e.target.closest('#compare-project,#comparison-open')){if(!comparisonResult)$('#compare-file').click();else if(e.target.closest('#comparison-open'))$('#compare-file').click();else{showView('comparison');renderComparison();}}
 if(e.target.closest('#comparison-close')){showView('diagrams');renderComparison();renderBeam();}
});
document.addEventListener('change',e=>{if(e.target.id==='compare-file'&&e.target.files[0]){openComparison(e.target.files[0]);e.target.value='';}});
