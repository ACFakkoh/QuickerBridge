"use strict";
// Influence lines and truck crossing animation.

function influenceRows(){
 const il=influenceData,rows=[['V',t('shear'),'kN/kN','#407dcc',-1],['M',t('moment'),'kN·m/kN','#008378',1],['D',t('deflection'),'mm/kN','#9d762e',1],['R',`R${il.support}`,'kN/kN','#7a5bb5',-1]];
 if(il.fixed)rows.push(['Mr',`Me${il.support}`,'kN·m/kN','#b5577a',-1]);
 return rows;
}
function ilValue(values,x){const xs=influenceData.x;let j=1;while(j<xs.length-1&&xs[j]<x)j++;const a=xs[j-1],b=xs[j],f=b>a?(x-a)/(b-a):0;return values[j-1]+(values[j]-values[j-1])*Math.max(0,Math.min(1,f));}
function influenceSum(){const g=influenceData?.governing_max;if(!g)return null;return g.axles.reduce((v,a)=>v+a.load*ilValue(influenceData.M,a.x),0);}
function influenceSummary(){
 const il=influenceData,sum=influenceSum(),g=il.governing_max;
 let text=`${t('ilAt')} x = ${fmt(il.x_station)} m (${t(il.side)}) · R${il.support}`;
 if(g&&sum!==null)text+=` · ${t('ilGoverning')} : ${caseText(g.record)} · ${t('ilSum')} = ${fmt(sum,1)} kN·m${g.record.case==='lane'?' ('+t('ilLaneNote')+')':''}`;
 return text;
}
function renderInfluence(){
 if(!influenceData){$('#charts').innerHTML=`<p class="help">${t('ilHint')}</p>`;return;}
 const il=influenceData,xs=il.x,total=result.x.at(-1),X=x=>26+x/total*874,g=il.governing_max,G=plotGeom();
 $('#charts').innerHTML=`<p class="help il-hint">${t('ilHint')}</p>`+influenceRows().map(([key,label,unit,color,direction])=>{
  const values=il[key],amp=Math.max(...values.map(Math.abs),1e-9)*1.12,Y=v=>G.mid+direction*v/amp*G.half;
  const d=values.map((v,i)=>`${i?'L':'M'}${X(xs[i]).toFixed(2)},${Y(v).toFixed(2)}`).join('');
  let svg=axisGrid(amp,direction,Y)+`<line x1="26" x2="900" y1="${G.mid}" y2="${G.mid}" stroke="#9db4c1" stroke-width=".8"/>`;
  result.reactions.forEach(r=>{svg+=`<line x1="${X(r.x)}" x2="${X(r.x)}" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#dbe5eb" stroke-dasharray="3 3"/><text x="${X(r.x)}" y="${G.lab}" text-anchor="middle">${fmt(r.x,1)}</text>`});
  svg+=`<path d="${d}L${X(total)},${G.mid}L${X(0)},${G.mid}Z" fill="${color}" fill-opacity=".12"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2.2"/>`;
  const marker=key==='R'||key==='Mr'?il.x_support:il.x_station;
  svg+=`<line x1="${X(marker)}" x2="${X(marker)}" y1="${G.top-G.u(14)}" y2="${G.bot+G.u(8)}" stroke="#c0392b" stroke-width="1.2"/>`;
  if(key==='M'&&g)g.axles.forEach(a=>{const y=Y(ilValue(values,a.x));svg+=`<line x1="${X(a.x)}" x2="${X(a.x)}" y1="${(y-G.u(16)).toFixed(1)}" y2="${(y-G.u(3)).toFixed(1)}" stroke="#d98c2b" stroke-width="1.6" marker-end="url(#il-arrow)"/>`});
  const peak=values.reduce((k,v,i)=>Math.abs(v)>Math.abs(values[k])?i:k,0);
  svg+=`<text class="peak-label" x="${Math.min(880,Math.max(46,X(xs[peak])))}" y="${Y(values[peak])>G.mid?Math.min(G.H-G.u(2),Y(values[peak])+G.u(15)):Math.max(G.u(12),Y(values[peak])-G.u(6))}" text-anchor="middle" style="fill:${qbInk(color)}">${fmt(values[peak],key==='D'?4:3)}</text>`;
  svg+=`<line class="cursor" x1="0" x2="0" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#426774" stroke-dasharray="2 2" visibility="hidden"/>`;
  return `<div class="chart-row"><div class="chart-label" style="color:${qbInk(color)}">η ${label}<small>${unit}</small></div><svg class="il-plot" role="img" aria-label="η ${label}" data-effect="${key}" ${plotAttrs()}><defs><marker id="il-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#d98c2b"/></marker></defs>${svg}</svg></div>`;
 }).join('');
 $$('.il-plot').forEach(svg=>{svg.addEventListener('pointermove',influenceHover);svg.addEventListener('click',influenceClick);});
 if(!renderInfluence.again){renderInfluence.again=true;try{afterCharts(renderInfluence)}finally{renderInfluence.again=false}}
}
function pointerX(e){const rect=e.currentTarget.getBoundingClientRect();return Math.max(0,Math.min(1,((e.clientX-rect.left)/rect.width*926-26)/874))*result.x.at(-1);}
function influenceHover(e){
 if(!influenceData)return;const x=pointerX(e),sx=26+x/result.x.at(-1)*874;
 $$('.il-plot .cursor').forEach(line=>{line.setAttribute('x1',sx);line.setAttribute('x2',sx);line.setAttribute('visibility','visible')});
}
function influenceClick(e){requestInfluence(nearest(pointerX(e)));}
async function requestInfluence(index){
 if(!result||result.kind==='thermal'||!jobId)return;stopAnimation();const token=++snapRevision;
 try{const data=await solver.request('influence',{job:jobId,index});if(token!==snapRevision)return;influenceData=data;snap=null;display='influence';view='diagrams';renderResults();renderBeam();}
 catch(e){console.error(e);if(token===snapRevision){$('#error').textContent=t('failed');$('#error').classList.remove('hidden');}}
}
// ---- Crossing animation: one precomputed traverse, then pure client-side playback.
function stopAnimation(){if(playTimer){clearInterval(playTimer);playTimer=null;const b=$('#play');if(b)b.textContent=t('play');}}
function showFrame(k){
 const data=traverseData,f=data.frames[k];frameIndex=k;
 snap={record:f.record,axles:f.axles,lane:f.lane,R:f.R,Mr:f.Mr,plot:{x:data.x,sides:result.sides,V:f.V,M:f.M,D:f.D}};
 display='snapshot';syncPositionControls(Number(f.position.toFixed(2)));
 renderCharts();renderBeam();renderUpliftWarning();
 $('#governing').innerHTML=`<span>${playTimer?t('animating')+' · ':''}${caseText(f.record)}</span><button id="restore" class="text-button">${t('restore')}</button>`;$('#governing').classList.remove('hidden');
}
async function ensureTraverse(){
 const key=`${jobId}|${manualDirection}`;
 if(traverseData?.key===key)return traverseData;
 const data=await solver.request('traverse',{job:jobId,direction:manualDirection,frames:60});
 data.key=key;traverseData=data;return data;
}
async function togglePlay(){
 if(playTimer){stopAnimation();renderResults();return;}
 if(!result||result.kind==='thermal'||!jobId)return;
 const token=revision;let data;
 try{data=await ensureTraverse();}catch(e){console.error(e);return;}
 if(token!==revision)return;
 let k=0;$('#play').textContent=t('stop');
 playTimer=setInterval(()=>{if(token!==revision||!traverseData){stopAnimation();return;}showFrame(k);k++;if(k>=data.frames.length){stopAnimation();renderResults();}},85);
}
function scrubFrame(position){
 // Slider scrubbing reuses precomputed frames when available: no solver call.
 const data=traverseData;if(!data||data.key!==`${jobId}|${manualDirection}`)return false;
 let best=0;data.frames.forEach((f,i)=>{if(Math.abs(f.position-position)<Math.abs(data.frames[best].position-position))best=i});
 if(Math.abs(data.frames[best].position-position)>0.6)return false;showFrame(best);return true;
}
