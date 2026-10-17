"use strict";
// Diagrams V, M, deflection, reactions, EI: geometry, labels, hover, governing case.

function renderUpliftWarning(){
 const box=$('#uplift-warning');if(!box)return;
 if(!result||result.kind==='thermal'||model.load_mode==='live'){box.classList.add('hidden');box.innerHTML='';return;}
 const live=snap&&display==='snapshot';
 const bad=result.reactions.flatMap((r,i)=>r.split?splitReactionItems(r,i,false,live,false).map(o=>({r,v:o.lo,label:`R${r.support} ${t(o.side==='left'?'splitLeftShort':'splitRightShort')}`})):[{r,v:live?snap.R[i]:r.min,label:`R${r.support}`}]).filter(o=>o.v<-1e-6);
 if(!bad.length){box.classList.add('hidden');box.innerHTML='';return;}
 const why=live?'upliftSnapshot':model.load_mode==='live'?'upliftLive':model.load_mode==='dead'?'upliftDead':'upliftBoth';
 box.innerHTML=`<b>⚠ ${t('upliftTitle')}</b> ${bad.map(o=>`${o.label} = ${fmt(o.v,1)} kN`).join(' · ')} — ${t(why)}`;
 box.classList.remove('hidden');
}
function renderStiffnessWarning(){
 const box=$('#stiffness-warning');if(!box)return;const jumps=[];
 if(!jumps.length){box.classList.add('hidden');box.innerHTML='';return;}
 box.innerHTML=`<b>${t('stiffnessJumpTitle')}</b> `+jumps.map(j=>`x = ${fmt(j.x)} m (${t(j.kind==='support'?'support':'zone')}) : EI ${fmt(j.left/1e6,2)} → ${fmt(j.right/1e6,2)} ×10⁶ kN·m² (×${fmt(Math.max(j.left,j.right)/Math.min(j.left,j.right),2)})`).join(' · ')+`<br><small>${t('stiffnessJumpHelp')}</small>`;
 box.classList.remove('hidden');
}
function niceStep(v){const p=10**Math.floor(Math.log10(v)),m=v/p;return (m<1.5?1:m<3?2:m<7?5:10)*p;}
function axisGrid(amp,direction,Y){
 const G=plotGeom();
 // Graduated axis with a light grid: one or two labelled ticks on each side of zero.
 const limit=amp/1.12;let step=niceStep(limit/1.6);for(let i=0;i<4&&step/amp*G.half*G.k<20&&niceStep(step*1.8)<=limit;i++)step=niceStep(step*1.8);const digits=step>=1?0:step>=.1?1:step>=.01?2:3;let g='';
 for(let k=-Math.floor(limit/step);k<=Math.floor(limit/step);k++){if(!k)continue;const v=k*step,y=Y(v);if(y<G.top-G.u(12)||y>G.bot+G.u(6))continue;
  g+=`<line x1="26" x2="900" y1="${y.toFixed(2)}" y2="${y.toFixed(2)}" class="grid-line"/><text class="tick" x="30" y="${(y-G.u(3)).toFixed(2)}">${fmt(v,digits)}</text>`;}
 return g;
}
function plotGeom(){const {H,k}=PG,u=p=>p/k,top=u(20),bot=H-u(40);return {H,k,u,top,bot,mid:(top+bot)/2,half:(bot-top)/2,lab:H-u(7)};}
function measurePlots(){
 const svg=$('#charts svg');if(!svg)return false;const r=svg.getBoundingClientRect();if(r.width<50||r.height<20)return false;
 const k=r.width/926,H=r.height/k;if(Math.abs(H-PG.H)<.5&&Math.abs(k-PG.k)<.002)return false;PG={H,k};return true;
}
function plotAttrs(){return `viewBox="0 0 926 ${PG.H.toFixed(2)}" preserveAspectRatio="none" style="--k:${PG.k.toFixed(4)}"`;}
function afterCharts(redraw){if(measurePlots())redraw();}
// v0.8.6 Δ view: one switch replaces V, M and δ by the envelope ranges
// ΔV, ΔM, Δδ = max − min (the live-load range at each station; permanent
// loads cancel). Read with the same cursor as the envelope.
function deltaActive(){return deltaMode&&!!result&&result.kind!=='thermal'&&display==='envelope'&&['live','both'].includes(model.load_mode);}
function deltaValues(key){return result.max[key].map((v,i)=>v-result.min[key][i]);}
function deltaY(amp){const G=plotGeom();return v=>G.bot-v/amp*(G.bot-G.top);}
// Support reactions as a fifth diagram: arrows at the supports on the same
// 926-unit grid (kN ↑+: an upward reaction points up into the beam, uplift
// points down, in red). Envelope: a max and a min arrow per support; Δ view:
// the range; truck position and thermal: the single value. Fixed and spring
// supports add the fixed-end moment Me (v0.9.98: Mr is kept for the
// factored moment resistance) with a curved arrow and the fixity.
// v1.01: the reactions take REACTION_RATIO of a diagram height (CSS
// --reaction-ratio), drawn with the same horizontal scale as V, M and δ.
function reactionGeom(){const g=plotGeom();return {...g,H:g.H*REACTION_RATIO};}
function reactionAttrs(){return `viewBox="0 0 926 ${(PG.H*REACTION_RATIO).toFixed(2)}" preserveAspectRatio="none" style="--k:${PG.k.toFixed(4)}"`;}
function reactionChart(X){
 const rs=result.reactions;if(!rs||!rs.length)return '';
 const thermal=result.kind==='thermal',live=!!snap&&display==='snapshot',delta=deltaActive(),G=reactionGeom(),nx=result.x.length;
 const items=rs.flatMap((r,i)=>{
  if(r.split)return splitReactionItems(r,i,thermal,live,delta);
  const fixed=r.type==='fixed'||r.type==='spring';
  if(thermal)return {r,i,fixed,lo:r.value,hi:r.value,mlo:r.moment,mhi:r.moment,single:true};
  if(live)return {r,i,fixed,lo:snap.R[i],hi:snap.R[i],mlo:snap.Mr?.[i],mhi:snap.Mr?.[i],single:true};
  if(delta){const d=r.max-r.min,m=r.moment_max-r.moment_min;return {r,i,fixed,lo:d,hi:d,mlo:m,mhi:m,single:true};}
  return {r,i,fixed,lo:r.min,hi:r.max,mlo:r.moment_min,mhi:r.moment_max,single:Math.abs(r.max-r.min)<1e-4};
 });
 const values=items.flatMap(o=>[o.lo,o.hi]),pos=Math.max(0,...values),neg=Math.max(0,...values.map(v=>-v)),amp=Math.max(pos+neg,1e-6);
 const hasMr=items.some(o=>o.fixed&&Number.isFinite(o.mlo)),start=G.u(neg>1e-6?30:20),end=G.H-G.u(hasMr?32:17),span=Math.max(end-start,G.u(10)),base=start+span*neg/amp,room=span,env=!thermal&&!live&&!delta&&!items.every(o=>o.single);
 const colors={hi:'#7a5bb5',lo:'#a99bd8'},red='#c0392b',text={hi:'#6b4aa5',lo:'#8f7fc4'};
 let svg=`<line x1="26" x2="900" y1="${base}" y2="${base}" stroke="#9db4c1" stroke-width=".8"/>`;
 const arrow=(cx,v,kind,o,sense)=>{
  const neg=v<-1e-6,len=Math.abs(v)/amp*room,hh=Math.min(G.u(8),len),hw=G.u(3.6),col=neg?red:colors[kind],tx=neg?red:text[kind];
  const tail=base+(neg?-1:1)*len,dir=neg?-1:1,label=fmt(v,0);
  let g=len>0.3?`<line x1="${cx}" x2="${cx}" y1="${tail}" y2="${base+dir*hh}" stroke="${col}" stroke-width="2.4"/><polygon points="${cx},${base} ${cx-hw},${base+dir*hh} ${cx+hw},${base+dir*hh}" fill="${col}"/>`:`<line x1="${cx-G.u(4)}" x2="${cx+G.u(4)}" y1="${base}" y2="${base}" stroke="${col}" stroke-width="2.4"/>`;
  const anchor=cx<26+G.u(18)?'start':cx>900-G.u(18)?'end':'middle',lx=anchor==='start'?cx-G.u(4):anchor==='end'?cx+G.u(4):cx;
  g+=`<text class="rv" x="${lx}" y="${neg?tail-G.u(5):tail+G.u(12)}" text-anchor="${anchor}" style="fill:${qbInk(tx)}">${label}</text>`;
  const hit=sense&&!thermal&&!live&&!delta;
  return `<g${hit?` class="r-hit" data-critical="${o.crit?o.crit[sense][0]:3*nx+o.i}" data-sense="${o.crit?o.crit[sense][1]:sense}"`:''}><title>${hit?t('reactionCase'):t('reactionHelp')}</title>${g}</g>`;
 };
 // Smaller value of the same sign: light band on the shaft of the larger arrow, tick and side label.
 const band=(cx,v,kind,o,sense)=>{
  const neg=v<-1e-6,len=Math.abs(v)/amp*room,col=neg?'#e8a49c':colors[kind],tx=neg?red:text[kind],end=base+(neg?-1:1)*len,w=G.u(4.5);
  const right=o.side?o.side==="right":cx<26+G.u(40),lx=cx+(right?1:-1)*(w+G.u(3)),anchor=right?'start':'end';
  const g=`<line x1="${cx}" x2="${cx}" y1="${base}" y2="${end}" stroke="${col}" stroke-width="8" stroke-opacity=".55"/><line x1="${cx-w}" x2="${cx+w}" y1="${end}" y2="${end}" stroke="${col}" stroke-width="2.4"/><text class="rv" x="${lx}" y="${end+G.u(4)}" text-anchor="${anchor}" style="fill:${qbInk(tx)}">${fmt(v,0)}</text>`;
  const hit=sense&&!thermal&&!live&&!delta;
  return `<g${hit?` class="r-hit" data-critical="${o.crit?o.crit[sense][0]:3*nx+o.i}" data-sense="${o.crit?o.crit[sense][1]:sense}"`:''}><title>${hit?t('reactionCase'):t('reactionHelp')}</title>${g}</g>`;
 };
 items.forEach(o=>{
  const cx=X(o.r.x)+(o.side==='left'?-G.u(13):o.side==='right'?G.u(13):0);
  if(o.side!=='right')svg+=`<line x1="${X(o.r.x)}" x2="${X(o.r.x)}" y1="${G.u(15)}" y2="${G.H-G.u(4)}" stroke="#dbe5eb" stroke-dasharray="3 3"/>`;
  if(o.single)svg+=arrow(cx,o.hi,'hi',o,null);
  else if(o.lo*o.hi<0)svg+=arrow(cx,o.lo,'lo',o,'min')+arrow(cx,o.hi,'hi',o,'max');
  else if(Math.abs(o.hi)>=Math.abs(o.lo))svg+=band(cx,o.lo,'lo',o,'min')+arrow(cx,o.hi,'hi',o,'max');
  else svg+=band(cx,o.hi,'hi',o,'max')+arrow(cx,o.lo,'lo',o,'min');
  const type=o.r.type==='fixed'?' · ⊏⊐':o.r.type==='spring'?` · ↻ ${fmt(100*o.r.fixity,0)} %`:'';
  svg+=`<text class="rl" x="${cx}" y="${G.u(11)}" text-anchor="${o.side==='left'?'end':o.side==='right'?'start':'middle'}">R${o.r.support}${o.side?` ${t(o.side==='left'?'splitLeftShort':'splitRightShort')}`:''}${type}</text>`;
  if(o.fixed&&Number.isFinite(o.mlo)){
   const txt=o.single||Math.abs(o.mlo-o.mhi)<1e-4?`Me ${fmt(o.mhi,0)}`:`Me ${fmt(o.mlo,0)} / ${fmt(o.mhi,0)}`,y=G.H-G.u(9),w=G.u(txt.length*6.2),r=G.u(5),sgn=(Math.abs(o.mhi)>=Math.abs(o.mlo)?o.mhi:o.mlo)<0?-1:1,gx=cx-w/2-G.u(9);
   const hit=!thermal&&!live&&!delta&&!o.single;
   svg+=`<g${hit?` class="r-hit" data-critical="${o.r.moment_index}" data-sense="${Math.abs(o.mhi)>=Math.abs(o.mlo)?'max':'min'}"`:''}><title>${t('momentReaction')}</title><g transform="translate(${gx},${y-G.u(4)}) scale(${sgn},1)"><path d="M0 ${-r}A${r} ${r} 0 1 1 ${-r} 0" fill="none" stroke="#b5577a" stroke-width="1.6"/><polygon points="${-r},${-G.u(3)} ${-r-G.u(2.6)},${G.u(1.6)} ${-r+G.u(2.6)},${G.u(1.6)}" fill="#b5577a"/></g><text class="rm" x="${cx}" y="${y}" text-anchor="middle">${txt}</text></g>`;
  }
 });
 const legend=env?`<small><span style="color:${colors.hi}">▲</span> max <span style="color:${colors.lo}">▮</span> min</small>`:'';
 return `<div class="chart-row reaction-row"><div class="chart-label" style="color:#7a5bb5">${t('reactionsShort')}<small>kN ↑+</small>${legend}</div><svg class="reaction-plot" role="img" aria-label="${t('supportReactions')}" ${reactionAttrs()}>${svg}</svg></div>`;
}
function renderDeltaCharts(cfg,X,total){
 const G=plotGeom(),xs=result.x;
 $('#charts').innerHTML=cfg.map(([key,label,unit,color])=>{
  const d=deltaValues(key),amp=Math.max(...d.map(Math.abs),1e-6)*1.08,Y=deltaY(amp);
  const line=d.map((v,i)=>`${i?'L':'M'}${X(xs[i]).toFixed(3)},${Y(v).toFixed(3)}`).join('');
  let svg=axisGrid(amp,-1,Y)+`<line x1="26" x2="900" y1="${G.bot}" y2="${G.bot}" stroke="#9db4c1" stroke-width=".8"/>`;
  result.reactions.forEach(r=>{svg+=`<line x1="${X(r.x)}" x2="${X(r.x)}" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#dbe5eb" stroke-dasharray="3 3"/><text x="${X(r.x)}" y="${G.lab}" text-anchor="middle">${fmt(r.x,1)}</text>`});
  svg+=`<text x="20" y="${G.bot+G.u(4)}" text-anchor="end">0</text><path d="${line}L${X(xs.at(-1)).toFixed(3)},${G.bot}L${X(xs[0]).toFixed(3)},${G.bot}Z" fill="${color}" fill-opacity=".13"/><path class="envelope-delta" d="${line}" fill="none" stroke="${color}" stroke-width="2.4"/>`;
  const placed=[];qbDeltaPoints(key,d,xs).filter(k=>d[k]>amp*.02).forEach(k=>{
   const text=`Δ ${fmt(qbCeil(d[k],key==='D'?1:0),key==='D'?1:0)}`,width=G.u(text.length*6.2+8),px=Math.min(900-width/2,Math.max(26+width/2,X(xs[k])));
   if(placed.some(b=>b.text===text&&Math.abs(b.x-px)<G.u(40)))return;
   let y=Math.max(G.u(12),Y(d[k])-G.u(6));
   for(let n=0;n<5&&placed.some(b=>Math.abs(px-b.x)<(width+b.w)/2&&Math.abs(y-b.y)<G.u(13));n++)y+=G.u(14);
   placed.push({x:px,y,w:width,text});svg+=`<text class="peak-label" x="${px}" y="${y}" text-anchor="middle" style="fill:${qbInk(color)}">${text}</text>`;
  });
  svg+=`<line class="cursor" x1="0" x2="0" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#426774" stroke-dasharray="2 2" visibility="hidden"/><circle class="cursor-high" r="${G.u(3.5)}" fill="${color}" visibility="hidden"/>`;
  return `<div class="chart-row"><div class="chart-label" style="color:${qbInk(color)}">Δ${key==='D'?'δ':key} · ${label}<small>${unit}</small></div><svg class="plot delta-plot" tabindex="0" role="img" aria-describedby="qb-chart-keys" aria-label="Δ ${label} · ${unit}" data-effect="${key}" data-amp="${amp}" data-delta="1" ${plotAttrs()}>${svg}</svg></div>`;
 }).join('');
 if(!renderCharts.again){renderCharts.again=true;try{afterCharts(renderCharts)}finally{renderCharts.again=false}}
 $$('#charts .plot').forEach(svg=>svg.addEventListener('pointermove',chartHover));
}
function renderCharts() {
 if(!result)return;
 if(display==='influence'&&result.kind!=='thermal'){renderInfluence();return;}
 const thermal=result.kind==='thermal',graph=!thermal&&snap&&display==='snapshot'?(snap.plot||snap):null;
 const xs=graph?graph.x:result.x;
 const total=result.x.at(-1),X=x=>26+x/total*874,G=plotGeom();
 const cfg=[['V',t('shear'),'kN','#407dcc',-1],['M',t('moment'),'kN·m','#008378',1],['D',t('deflection'),'mm','#9d762e',1]];
 if(deltaActive()){renderDeltaCharts(cfg,X,total);return;}
 $('#charts').innerHTML=cfg.map(([key,label,unit,color,direction])=>{
  const lo=graph?graph[key]:thermal?result.values[key]:result.min[key],hi=graph?graph[key]:thermal?result.values[key]:result.max[key];
  // In a truck position the envelope stays as a faint reference and fixes the scale.
  const ghost=graph?[result.min[key],result.max[key]]:[];
  // v0.9.98: the resistance curves (Résistance tab) stay inside the scale.
  const resB=typeof resChartBounds==='function'?resChartBounds(key):[];
  const amp=Math.max(...lo.map(Math.abs),...hi.map(Math.abs),...ghost.flat().map(Math.abs),...resB.map(Math.abs),1e-6)*1.12,Y=v=>G.mid+direction*v/amp*G.half;
  const path=(values,xv=xs)=>values.map((v,i)=>`${i?'L':'M'}${X(xv[i]).toFixed(3)},${Y(v).toFixed(3)}`).join('');
  const polygon=path(hi)+lo.map((_,j)=>{const i=lo.length-1-j;return `L${X(xs[i]).toFixed(3)},${Y(lo[i]).toFixed(3)}`}).join('')+'Z';
  let svg=axisGrid(amp,direction,Y)+`<line x1="26" x2="900" y1="${G.mid}" y2="${G.mid}" stroke="#9db4c1" stroke-width=".8"/>`;
  result.reactions.forEach(r=>{svg+=`<line x1="${X(r.x)}" x2="${X(r.x)}" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#dbe5eb" stroke-dasharray="3 3"/><text x="${X(r.x)}" y="${G.lab}" text-anchor="middle">${fmt(r.x,1)}</text>`});
  if(!thermal&&typeof axleChartMarks==='function')svg+=axleChartMarks(key,X,G);
  ghost.forEach(g=>{svg+=`<path d="${path(g,result.x)}" fill="none" stroke="${color}" stroke-opacity=".28" stroke-width="1.2" stroke-dasharray="4 3"/>`});
  svg+=`<text x="20" y="${G.mid+G.u(4)}" text-anchor="end">0</text>${thermal?'':`<path d="${polygon}" fill="${color}" fill-opacity=".13"/>`}${!thermal&&!graph?`<path class="envelope-lower" d="${path(lo)}" fill="none" stroke="${color}" stroke-width="2.4"/>`:""}<path class="envelope-upper" d="${path(hi)}" fill="none" stroke="${color}" stroke-width="2.4"/>${!thermal&&typeof resChartMarks==='function'?resChartMarks(key,X,Y,G):''}<line class="cursor" x1="0" x2="0" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#426774" stroke-dasharray="2 2" visibility="hidden"/><circle class="cursor-high" r="${G.u(3.5)}" fill="${color}" visibility="hidden"/>${thermal?'':`<circle class="cursor-low" r="${G.u(3.5)}" fill="${color}" visibility="hidden"/>`}`;
  const peak=(values,best)=>{let k=0;values.forEach((v,i)=>{if(best(v,values[k]))k=i});return k};
  const labels=qbLabelPoints(key,hi,lo,xs).filter(([v,k])=>Math.abs(v[k])>amp*0.02);
  const placed=[];labels.forEach(([v,k])=>{
   const text=fmt(qbCeil(v[k],key==='D'?1:0),key==='D'?1:0),width=G.u(text.length*6.2+8),px=Math.min(900-width/2,Math.max(26+width/2,X(xs[k]))),py=Y(v[k]);
   if(placed.some(b=>b.text===text&&Math.abs(b.x-px)<G.u(40)))return;
   let y=Math.min(G.H-G.u(3),Math.max(G.u(12),py+(py>G.mid?G.u(15):-G.u(6))));
   for(let n=0;n<5&&placed.some(b=>Math.abs(px-b.x)<(width+b.w)/2&&Math.abs(y-b.y)<G.u(13));n++)y+=py>G.mid?-G.u(14):G.u(14);
   placed.push({x:px,y,w:width,text});svg+=`<text class="peak-label" x="${px}" y="${y}" text-anchor="middle" style="fill:${qbInk(color)}">${text}</text>`;
  });
  return `<div class="chart-row"><div class="chart-label" style="color:${qbInk(color)}">${label}<small>${unit}</small>${!thermal&&typeof resChartLabel==='function'?resChartLabel(key):''}</div><svg class="plot" tabindex="0" role="img" aria-describedby="qb-chart-keys" aria-label="${label} · ${unit}" data-effect="${key}" data-amp="${amp}" data-sign="${direction}" ${plotAttrs()}>${svg}</svg></div>`;
 }).join('')+reactionChart(X)+stiffnessChart(X,total);
 if(!renderCharts.again){renderCharts.again=true;try{afterCharts(renderCharts)}finally{renderCharts.again=false}}
 $('.stiffness-plot')?.addEventListener('pointermove',chartHover);
 $$('#charts .plot').forEach(svg=>{svg.addEventListener('pointermove',chartHover);if(!thermal){svg.addEventListener('click',chartClick);svg.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const k=svg.dataset.effect,nx=result.x.length,i=qbKbStation??0,off=k==='M'?nx:k==='D'?2*nx:0,sense=Math.abs(result.max[k][i])>=Math.abs(result.min[k][i])?'max':'min';Promise.resolve(inspectCase(off+i,sense)).then(()=>$(`#charts svg.plot[data-effect="${k}"]`)?.focus({preventScroll:true}));})}});
}
function stiffnessChart(X,total){
 const st=result?.stiffness;if(!st||!st.EI.length)return '';
 const max=Math.max(...st.EI),min=Math.min(...st.EI);if(max<=0)return '';
 const G=plotGeom(),Y=v=>G.bot-v/(max*1.08)*(G.bot-G.top),d=st.x.map((x,i)=>`${i?'L':'M'}${X(x).toFixed(2)},${Y(st.EI[i]).toFixed(2)}`).join('');
 let svg=`<line x1="26" x2="900" y1="${G.bot}" y2="${G.bot}" stroke="#9db4c1" stroke-width=".8"/><path d="${d}L${X(total)},${G.bot}L${X(0)},${G.bot}Z" fill="#7a5bb5" fill-opacity=".12"/><path d="${d}" fill="none" stroke="#7a5bb5" stroke-width="2"/>`;
 result.reactions.forEach(r=>{svg+=`<line x1="${X(r.x)}" x2="${X(r.x)}" y1="${G.top-G.u(12)}" y2="${G.bot+G.u(6)}" stroke="#dbe5eb" stroke-dasharray="3 3"/>`});
 svg+=`<text x="20" y="${Y(max)+G.u(4)}" text-anchor="end">${fmt(max/1e6,1)}</text><text x="20" y="${Y(min)+G.u(4)}" text-anchor="end">${fmt(min/1e6,1)}</text>`;
 svg+=`<line class="cursor" y1="${G.top}" y2="${G.bot}" stroke="#426774" stroke-dasharray="2 2" visibility="hidden"/><circle class="cursor-ei" r="${G.u(3.5)}" fill="#7a5bb5" visibility="hidden"/>`;
 return `<div class="chart-row stiffness-row"><div class="chart-label" style="color:#7a5bb5">EI<small>×10⁶ kN·m²</small></div><svg class="stiffness-plot" data-max="${max}" role="img" aria-label="EI(x)" ${plotAttrs()}>${svg}</svg></div>`;
}
function nearest(x,xs=result.x) {let best=0;for(let i=1;i<xs.length;i++)if(Math.abs(xs[i]-x)<Math.abs(xs[best]-x))best=i;return best;}
function currentGraph(){return snap&&display==='snapshot'?(snap.plot||snap):null;}
function pointerStation(e) {const rect=e.currentTarget.getBoundingClientRect();return nearest(Math.max(0,Math.min(1,((e.clientX-rect.left)/rect.width*926-26)/874))*result.x.at(-1),currentGraph()?.x||result.x);}
function eiValue(x,side='right'){const st=result.stiffness;if(!st)return null;let j=0;while(j<st.x.length-1&&st.x[j]<x-1e-8)j++;if(Math.abs(st.x[j]-x)<1e-8){if(side==='right')while(j+1<st.x.length&&Math.abs(st.x[j+1]-x)<1e-8)j++;return st.EI[j];}const a=Math.max(0,j-1),f=(x-st.x[a])/(st.x[j]-st.x[a]);return st.EI[a]+f*(st.EI[j]-st.EI[a]);}
// v0.9.6: readout precision, V and M without decimals, deflection to 0.1 mm.
function qbFmtEffect(key,v){const dec=key==='D'?1:0;return fmt(qbCeil(v,dec),dec);}
function chartHover(e) {
 if(!result)return;const graph=display==='influence'?null:currentGraph(),i=e.currentTarget.classList.contains('stiffness-plot')?nearest(pointerX(e)):pointerStation(e),x=(graph?.x||result.x)[i],sx=26+x/result.x.at(-1)*874;
 $('.stiffness-plot')?.addEventListener('pointermove',chartHover);
 $$('#charts .plot').forEach(svg=>{
  const key=svg.dataset.effect,thermal=result.kind==='thermal',G=plotGeom();
  if(svg.dataset.delta){const line=svg.querySelector('.cursor'),dot=svg.querySelector('.cursor-high');line.setAttribute('x1',sx);line.setAttribute('x2',sx);line.setAttribute('visibility','visible');dot.setAttribute('cx',sx);const dv=result.max[key][i]-result.min[key][i],cy=deltaY(Number(svg.dataset.amp))(dv);dot.setAttribute('cy',cy);dot.setAttribute('visibility','visible');let tx=svg.querySelector('.cursor-val-d');if(!tx){tx=document.createElementNS('http://www.w3.org/2000/svg','text');tx.setAttribute('class','cursor-val cursor-val-d');svg.appendChild(tx);}const right=sx>700;tx.setAttribute('x',sx+(right?-G.u(8):G.u(8)));tx.setAttribute('y',Math.max(G.u(13),cy-G.u(8)));tx.setAttribute('text-anchor',right?'end':'start');tx.setAttribute('visibility','visible');tx.style.fill=svg.closest('.chart-row')?.querySelector('.chart-label')?.style.color||'#17374b';tx.textContent='Δ '+qbFmtEffect(key,dv);const boxes=[tx.getBoundingClientRect()];svg.querySelectorAll('.peak-label').forEach(pl=>{const b=pl.getBoundingClientRect(),hit=boxes.some(c=>!(c.right<b.left-2||b.right<c.left-2||c.bottom<b.top-1||b.bottom<c.top-1));pl.classList.toggle('peak-dim',hit);});return;}
  const lo=graph?graph[key][i]:thermal?result.values[key][i]:result.min[key][i],hi=graph?graph[key][i]:thermal?result.values[key][i]:result.max[key][i],Y=v=>G.mid+Number(svg.dataset.sign)*v/Number(svg.dataset.amp)*G.half;
  const line=svg.querySelector('.cursor');line.setAttribute('x1',sx);line.setAttribute('x2',sx);line.setAttribute('visibility','visible');
  [['.cursor-high',hi],['.cursor-low',lo]].forEach(([cl,v])=>{const circle=svg.querySelector(cl);if(circle){circle.setAttribute('cx',sx);circle.setAttribute('cy',Y(v));circle.setAttribute('visibility','visible')}});
  // v0.9.6: values follow the dots, in the colour of the diagram. The upper
  // dot's value goes above it and the lower one's below, kept apart and inside
  // the plot so the two values stay readable at every station.
  const color=svg.closest('.chart-row')?.querySelector('.chart-label')?.style.color||'#17374b';
  const same=Math.abs(hi-lo)<1e-9,marks=[{k:'hi',v:hi,y:Y(hi)},{k:'lo',v:lo,y:Y(lo)}].sort((a,b)=>a.y-b.y);
  let yUp=marks[0].y-G.u(8),yDown=marks[1].y+G.u(19);
  if(yUp<G.u(13)){yUp=G.u(13);}
  if(yDown>G.H-G.u(2)){yDown=G.H-G.u(2);}
  if(yDown-yUp<G.u(17)){yDown=yUp+G.u(17);}
  marks.forEach((m,n)=>{let tx=svg.querySelector('.cursor-val-'+m.k);if(!tx){tx=document.createElementNS('http://www.w3.org/2000/svg','text');tx.setAttribute('class','cursor-val cursor-val-'+m.k);svg.appendChild(tx);}
   const hide=same&&m.k==='lo';tx.setAttribute('visibility',hide?'hidden':'visible');if(hide)return;
   const right=sx>700;tx.setAttribute('x',sx+(right?-G.u(8):G.u(8)));tx.setAttribute('y',same?m.y-G.u(8):n?yDown:yUp);tx.setAttribute('text-anchor',right?'end':'start');tx.style.fill=color;tx.textContent=qbFmtEffect(key,m.v);});
  // Static extreme labels under a moving value are dimmed, never overlapped.
  const boxes=[...svg.querySelectorAll('.cursor-val')].filter(x=>x.getAttribute('visibility')!=='hidden').map(x=>x.getBBox());
  if(!svg.qbPeaks)svg.qbPeaks=[...svg.querySelectorAll('.peak-label')].map(pl=>({pl,b:pl.getBBox()}));
  const m=G.u(2);svg.qbPeaks.forEach(({pl,b})=>{const hit=boxes.some(c=>!(c.x+c.width<b.x-m||b.x+b.width<c.x-m||c.y+c.height<b.y-m/2||b.y+b.height<c.y-m/2));pl.classList.toggle('peak-dim',hit);});
 });
 const side=(graph?.sides||result.sides)[i],ei=eiValue(x,side),eiSvg=$('.stiffness-plot');if(eiSvg&&ei!==null){const line=eiSvg.querySelector('.cursor'),dot=eiSvg.querySelector('.cursor-ei'),G=plotGeom();line.setAttribute('x1',sx);line.setAttribute('x2',sx);line.setAttribute('visibility','visible');dot.setAttribute('cx',sx);dot.setAttribute('cy',G.bot-ei/(Number(eiSvg.dataset.max)*1.08)*(G.bot-G.top));{const cy=G.bot-ei/(Number(eiSvg.dataset.max)*1.08)*(G.bot-G.top);let tx=eiSvg.querySelector('.cursor-val-ei');if(!tx){tx=document.createElementNS('http://www.w3.org/2000/svg','text');tx.setAttribute('class','cursor-val cursor-val-ei');eiSvg.appendChild(tx);}const right=sx>700;tx.setAttribute('x',sx+(right?-G.u(8):G.u(8)));tx.setAttribute('y',Math.max(G.u(13),cy-G.u(8)));tx.setAttribute('text-anchor',right?'end':'start');tx.setAttribute('visibility','visible');tx.style.fill=eiSvg.closest('.chart-row')?.querySelector('.chart-label')?.style.color||'#7a5bb5';tx.textContent=fmt(ei/1e6,3);}dot.setAttribute('visibility','visible');}
 if(typeof stPeek==='function')stPeek(graph?nearest(x):i,e);
}
function chartClick(e) {
 if(!result||result.kind==='thermal')return;const gi=pointerStation(e),i=currentGraph()?nearest(currentGraph().x[gi]):gi,key=e.currentTarget.dataset.effect,offset=key==='M'?result.x.length:key==='D'?2*result.x.length:0;
 const rect=e.currentTarget.getBoundingClientRect(),G=plotGeom(),y=(e.clientY-rect.top)/rect.height*G.H,Y=v=>G.mid+Number(e.currentTarget.dataset.sign)*v/Number(e.currentTarget.dataset.amp)*G.half;
 const sense=Math.abs(y-Y(result.min[key][i]))<Math.abs(y-Y(result.max[key][i]))?'min':'max';
 // v0.9.4: a double-click opens the stresses; wait briefly before inspecting the case.
 if(e.detail>1)return;clearTimeout(window.qbClickTimer);window.qbClickTimer=setTimeout(()=>inspectCase(offset+i,sense),260);
}
async function inspectCase(index,sense,position=null) {
 if(!result||result.kind==='thermal'||$('#excel').disabled)return;
 stopAnimation();const token=++snapRevision;
 try{
  const data=await solver.request('snapshot',{job:jobId,index,sense,position,direction:manualDirection});
  if(token!==snapRevision)return;
  snap=data;display='snapshot';view='diagrams';syncPositionControls(Number(data.record.position.toFixed(3)));renderResults();renderBeam();return data;
 }catch(e){if(token===snapRevision){$('#error').textContent=t('failed');$('#error').classList.remove('hidden')}}
}
// R left = −V(x⁻) (end of the left deck), R right = V(x⁺) (start of the right deck).
function splitReactionItems(r,i,thermal,live,delta){
 const a=r.split.left,b=r.split.right,out=[];
 const sv=live&&snap?(snap.V||snap.plot?.V):null;
 [['left',a,-1],['right',b,1]].forEach(([side,k,sg])=>{
  let o;
  if(thermal){const v=sg*result.values.V[k];o={lo:v,hi:v,single:true};}
  else if(live&&sv){const v=sg*sv[k];o={lo:v,hi:v,single:true};}
  else if(delta){const d=result.max.V[k]-result.min.V[k];o={lo:d,hi:d,single:true};}
  else{const lo=sg>0?result.min.V[k]:-result.max.V[k],hi=sg>0?result.max.V[k]:-result.min.V[k];o={lo,hi,single:Math.abs(hi-lo)<1e-4,crit:sg>0?{max:[k,'max'],min:[k,'min']}:{max:[k,'min'],min:[k,'max']}};}
  out.push({r,i,fixed:false,side,...o});
 });
 return out;
}
// Independent parts of the bridge: a simple span or a split pier ends a continuous chain.
function qbParts(){
 if(!model)return [];let starts=[0];model.spans.forEach(s=>starts.push(starts.at(-1)+s.length));
 const cuts=new Set();model.spans.forEach((s,i)=>{if(s.simple){cuts.add(i);cuts.add(i+1);}});
 model.supports.forEach((s,i)=>{if(s==='split')cuts.add(i);});
 const nodes=[...cuts].filter(i=>i>0&&i<model.spans.length).sort((a,b)=>a-b);let a=0;const parts=[];
 nodes.forEach(i=>{parts.push([starts[a],starts[i]]);a=i;});parts.push([starts[a],starts.at(-1)]);return parts;
}
// Stations labelled on a curve: the extreme of each independent part, plus
// every other peak within 0.5 % of the overall extreme (symmetry at a glance).
// v0.9.96: a plateau (constant shear of an imposed deformation…) is one peak,
// labelled once at its middle.
function qbPeaks(v,xs,sense){
 const better=(a,b)=>sense>0?a>b:a<b,total=xs.at(-1)||1,picked=[];
 const far=k=>picked.every(j=>Math.abs(xs[j]-xs[k])>total*.03);
 let g=0;v.forEach((x,i)=>{if(better(x,v[g]))g=i;});
 const ref=Math.abs(v[g]),tol=Math.max(ref*1e-7,1e-9),same=(a,b)=>Math.abs(a-b)<=tol;
 const run=k=>{let i=k,j=k;while(i>0&&same(v[i-1],v[k]))i--;while(j<v.length-1&&same(v[j+1],v[k]))j++;return [i,j];};
 const centre=k=>{const [i,j]=run(k);if(i===j)return k;const mid=(xs[i]+xs[j])/2;let c=i;for(let n=i;n<=j;n++)if(Math.abs(xs[n]-mid)<Math.abs(xs[c]-mid))c=n;return c;};
 qbParts().forEach(([x0,x1])=>{let k=-1;xs.forEach((x,i)=>{if(x>=x0-1e-9&&x<=x1+1e-9&&(k<0||better(v[i],v[k])))k=i;});if(k>=0){k=centre(k);if(far(k))picked.push(k);}});
 if(ref>0)for(let i=0;i<v.length;){
  const [a,b]=run(i),x=v[i];
  const local=(a===0||!better(v[a-1],x))&&(b===v.length-1||!better(v[b+1],x));
  if(local&&Math.sign(x)===Math.sign(v[g])&&Math.abs(x)>=ref*.995){const c=centre(i);if(far(c))picked.push(c);}
  i=b+1;
 }
 return picked;
}
// v0.9.96: moments are always labelled span by span (M+ max of every span)
// and pier by pier (M− at every interior support), continuous or not.
function qbSpanPierPeaks(hi,lo,xs){
 if(!model)return [];const starts=[0];model.spans.forEach(s=>starts.push(starts.at(-1)+s.length));
 const out=[];
 for(let n=0;n<model.spans.length;n++){let k=-1;xs.forEach((x,i)=>{if(x>=starts[n]-1e-9&&x<=starts[n+1]+1e-9&&(k<0||hi[i]>hi[k]))k=i;});if(k>=0&&hi[k]>0)out.push([hi,k]);}
 for(let n=1;n<model.spans.length;n++){if(!lo)break;const w0=starts[n]-.2*model.spans[n-1].length,w1=starts[n]+.2*model.spans[n].length;let k=-1;xs.forEach((x,i)=>{if(x>=w0&&x<=w1&&(k<0||lo[i]<lo[k]))k=i;});if(k>=0&&lo[k]<0)out.push([lo,k]);}
 return out;
}
// Labels of one diagram: [values, station] pairs.
// v0.9.97: stations of span n (supports included, on the side of the span).
function qbSpanStations(n,xs){
 const starts=[0];model.spans.forEach(s=>starts.push(starts.at(-1)+s.length));const sides=result?.sides||[],a=starts[n],b=starts[n+1],out=[];
 xs.forEach((x,i)=>{if(x<a-1e-9||x>b+1e-9)return;if(Math.abs(x-a)<1e-9&&sides[i]==='left'&&n>0)return;if(Math.abs(x-b)<1e-9&&sides[i]==='right'&&n<model.spans.length-1)return;out.push(i);});
 return out;
}
// v0.9.97: shear and deflection are labelled span by span too (max and min of every span).
function qbSpanMinMax(hi,lo,xs){
 if(!model||(snap&&display==='snapshot'))return [];const out=[];
 model.spans.forEach((_,n)=>{const idx=qbSpanStations(n,xs);if(!idx.length)return;
  const kh=idx.reduce((k,i)=>hi[i]>hi[k]?i:k,idx[0]);if(hi[kh]>0)out.push([hi,kh]);
  if(lo){const kl=idx.reduce((k,i)=>lo[i]<lo[k]?i:k,idx[0]);if(lo[kl]<0)out.push([lo,kl]);}});
 return out;
}
function qbLabelPoints(key,hi,lo,xs){
 const pts=[...qbPeaks(hi,xs,1).map(k=>[hi,k]),...qbPeaks(lo,xs,-1).map(k=>[lo,k])];
 return key==='M'?[...qbSpanPierPeaks(hi,lo,xs),...pts]:[...qbSpanMinMax(hi,lo,xs),...pts];
}
// Δ ranges: the same labels on the range (moments: largest Δ of every span and Δ at every pier).
function qbDeltaPoints(key,d,xs){
 if(!model)return qbPeaks(d,xs,1);
 if(key!=='M')return [...model.spans.map((_,n)=>{const idx=qbSpanStations(n,xs);return idx.length?idx.reduce((k,i)=>d[i]>d[k]?i:k,idx[0]):-1;}).filter(k=>k>=0),...qbPeaks(d,xs,1)];
 const starts=[0];model.spans.forEach(s=>starts.push(starts.at(-1)+s.length));const out=[];
 for(let n=0;n<model.spans.length;n++){let k=-1;xs.forEach((x,i)=>{if(x>starts[n]+1e-9&&x<starts[n+1]-1e-9&&(k<0||d[i]>d[k]))k=i;});if(k>=0)out.push(k);}
 for(let n=1;n<model.spans.length;n++){let k=-1;xs.forEach((x,i)=>{if(Math.abs(x-starts[n])<1e-6&&(k<0||d[i]>d[k]))k=i;});if(k>=0)out.push(k);}
 return out;
}
function qbPlotStation(svg,i){
 if(!result)return;const xs=(currentGraph()?.x||result.x),n=xs.length;i=Math.max(0,Math.min(n-1,i));qbKbStation=i;
 const r=svg.getBoundingClientRect(),cx=r.left+(26+xs[i]/result.x.at(-1)*874)/926*r.width;
 chartHover({currentTarget:svg,clientX:cx,clientY:r.top+r.height/2});
 const key=svg.dataset.effect,unit=key==='M'?'kN·m':key==='D'?'mm':'kN',g=currentGraph();
 const v=g?`${qbFmtEffect(key,g[key][i])}`:svg.dataset.delta?`Δ ${qbFmtEffect(key,result.max[key][i]-result.min[key][i])}`:result.kind==='thermal'?qbFmtEffect(key,result.values[key][i]):`max ${qbFmtEffect(key,result.max[key][i])} · min ${qbFmtEffect(key,result.min[key][i])}`;
 const out=$('#qb-readout');if(out)out.textContent=`x = ${fmt(xs[i])} m · ${key==='D'?'δ':key} ${v} ${unit}`;
}
function qbGovTip(){
 const gov=$('#governing');if(!gov)return;let tip=$('#gov-tip');
 const hidden=qbStore(ls=>ls.getItem('qb-gov-tip'))==='off',show=!!(result&&result.kind!=='thermal'&&snap&&display==='snapshot')&&!hidden;
 if(!show){tip?.remove();return;}
 if(!tip){tip=document.createElement('div');tip.id='gov-tip';tip.className='gov-tip';tip.setAttribute('role','note');gov.before(tip);}
 tip.innerHTML=`<span class="gov-tip-mark" aria-hidden="true">↖</span><span>${t('govTip')}</span><button type="button" class="icon-button" data-gov-tip-close title="${esc(t('govTipClose'))}" aria-label="${esc(t('govTipClose'))}">×</button>`;
}
// Diagrams: the joint as a dashed line, a removed part hatched.
function jointChartMarks(){
 const j=model?.joint;$$('#charts .joint-chart').forEach(e=>e.remove());if(!j?.enabled||!result||result.kind==='modal')return;
 const total=result.x.at(-1),X=x=>26+x/total*874,cut=jointRemoved();
 $$('#charts svg.plot').forEach(svg=>{const H=Number(svg.getAttribute('viewBox')?.split(' ')[3])||PG.H;let g=`<g class="joint-chart">`;
  if(cut)g+=`<rect x="${X(cut[0]).toFixed(2)}" y="0" width="${(X(cut[1])-X(cut[0])).toFixed(2)}" height="${H}" class="joint-band"/>`;
  g+=`<line x1="${X(j.x).toFixed(2)}" x2="${X(j.x).toFixed(2)}" y1="0" y2="${H}" class="joint-line ${j.kind}"/></g>`;
  svg.insertAdjacentHTML('afterbegin',g);});
}
