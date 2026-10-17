"use strict";
// Beam sketch above the diagrams and its section inset.

// v1.01: the beam frame keeps a 146-unit high viewBox but is drawn at its CSS
// height (104 to 154 px), so one screen pixel is 146 / height units; the
// viewBox width follows, and the drawing is never shrunk around its centre.
function beamScale(){const h=$('#beam')?.clientHeight;return h>0?146/h:1;}
function beamWidth(){return ($('#beam')?.clientWidth||1000)*beamScale();}
// Screen position of x (m) under the diagrams: the supports of the sketch sit
// on the support lines of the plots, in viewBox units of the beam frame.
function beamX(x,total){
 const beam=$('#beam').getBoundingClientRect(),comparing=view==='comparison'&&typeof comparisonResult!=='undefined'&&comparisonResult;
 const plot=$(comparing?'#comparison-view .plot':'#charts .plot,#charts .il-plot,#charts .stiffness-plot')?.getBoundingClientRect();
 const length=comparing?Math.max(total,comparisonResult.x.at(-1)):total,L=comparing?38:26,span=comparing?870:874,k=beamScale();
 if(plot?.width>0){if(!comparing)beamX.last={left:plot.left-beam.left,width:plot.width,beam:beam.width};return (plot.left-beam.left+(L+x/length*span)/926*plot.width)*k;}
 const m=beamX.last;if(m&&Math.abs(m.beam-beam.width)<1)return (m.left+(L+x/length*span)/926*m.width)*k;
 return (26+x/total*(beam.width-52))*k;
}
function renderBeam() {
 if(!model)return;
 $('#beam').setAttribute('viewBox',`0 0 ${beamWidth()} 146`);
 if(typeof modalBeam==='function'&&modalBeam())return;
 const total=model.spans.reduce((v,s)=>v+s.length,0);if(!Number.isFinite(total)||total<=0)return;
 const xp=x=>beamX(x,total);
 let starts=[0];model.spans.forEach(s=>starts.push(starts.at(-1)+s.length));
 const beamDepth=sectionDepth;
 const maxDepth=Math.max(...model.sections.map(beamDepth)), depthScale=23/maxDepth;
 const dt=model.thermal.delta_T,hot=dt>0?'#ed875c':dt<0?'#70b6d3':'#f2d6b1',cold=dt>0?'#70b6d3':dt<0?'#ed875c':'#f2d6b1';
 let svg=`<defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0 0L5 3L0 6Z" fill="#ecb46a"/></marker><marker id="dl-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#7aabb9"/></marker><linearGradient id="thermal-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hot}"/><stop offset=".52" stop-color="#f2d6b1"/><stop offset="1" stop-color="${cold}"/></linearGradient></defs>`;
 model.spans.forEach((s,i)=>{
  const outline=[];let previous=0;
  const zones=model.nonprismatic&&s.zones.length?s.zones:[{end:1,section:s.section,end_section:s.section,profile:'constant'}];
  zones.forEach(z=>{const a=model.sections[z.section]||model.sections[0],b=model.sections[z.end_section??z.section]||a;
   for(let j=0;j<=16;j++){const f=j/16,shape=z.profile==='constant'?0:z.profile==='parabolic'?(a.depth>b.depth?1-(1-f)**2:f*f):f;outline.push([xp(starts[i]+s.length*(previous+(z.end-previous)*f)),65+(beamDepth(a)*(1-shape)+beamDepth(b)*shape)*depthScale])}previous=z.end;
  });
  svg+=`<path d="M${xp(starts[i])} 65H${xp(starts[i+1])}L${outline.slice().reverse().map(p=>p.join(' ')).join('L')}Z" fill="#2b5967" stroke="#73d8bd" stroke-width="1.2"/><line x1="${xp(starts[i])}" x2="${xp(starts[i+1])}" y1="65" y2="65" stroke="#a2f1d5" stroke-width="2"/>`;
  svg+=beamZoneLabels(s,i,zones,starts,xp);
  svg+=`<path d="M${xp(starts[i])} 133v7m0-3h${xp(starts[i+1])-xp(starts[i])}m0-4v7" stroke="#607e8d" stroke-width="1" fill="none"/><text x="${spanLabelX(i,starts,xp,total)}" y="131" fill="#bdced7" text-anchor="middle" font-size="12">${fmt(s.length)} m</text>`;
 });
 if(['dead','both'].includes(model.load_mode))model.dead.forEach(load=>{
  if(!load.w)return;
  model.spans.forEach((s,i)=>{if(load.span!==-1&&load.span!==i)return;const a=starts[i]+s.length*load.start,b=starts[i]+s.length*load.end;
   svg+=`<line x1="${xp(a)}" x2="${xp(b)}" y1="42" y2="42" stroke="#7aabb9"/>`;
   for(let x=a;x<=b;x+=(b-a)/Math.max(2,Math.round((b-a)/total*24)))svg+=`<line x1="${xp(x)}" x2="${xp(x)}" y1="42" y2="61" stroke="#7aabb9" marker-end="url(#dl-arrow)"/>`;
  });
 });
 if(['dead','both'].includes(model.load_mode)){
  // Girder self-weight: a light band on the deck, its height following w(x).
  const sw=selfWeightIntervals(),wmax=Math.max(0,...sw.map(v=>v.w));
  sw.forEach(v=>{const hgt=3+5*v.w/wmax;svg+=`<rect class="self-weight" x="${xp(v.start)}" y="${(64-hgt).toFixed(1)}" width="${Math.max(0,xp(v.end)-xp(v.start)).toFixed(1)}" height="${hgt.toFixed(1)}" fill="#c9b37e" opacity=".55"><title>${t('selfWeightShort')} ${fmt(v.w,2)} kN/m</title></rect>`;});
  if(sw.length)svg+=`<text x="${xp(0)+4}" y="53" font-size="11" fill="#d9c592">${t('selfWeightShort')}</text>`;
 }
 if(snap && display==='snapshot') snap.lane.forEach(v=>{svg+=`<rect x="${xp(v.start)}" y="47" width="${Math.max(0,xp(v.end)-xp(v.start))}" height="13" fill="#edb66f" opacity=".24"/>`});
 if(['live','both'].includes(model.load_mode)) {
  const pattern=vehiclePattern(),weights=pattern.weights,spaces=pattern.spaces,displayWeights=weights.map(w=>w*visualAxleFactor());let offsets=[0];spaces.forEach(s=>offsets.push(offsets.at(-1)+s));
  const front=Math.min(total*.78,Math.max(offsets.at(-1)+total*.12,total*.6));
  const axles=snap&&display==='snapshot'?snap.axles:display==='influence'&&influenceData?.governing_max?influenceData.governing_max.axles:weights.map((w,i)=>({x:front-offsets[i],load:w,id:i+1})).filter(a=>a.x>=0&&a.x<=total);
  const loadScale=35/Math.max(...displayWeights);const labels=[];
  axles.forEach(a=>{const special=snap?.record.case==='hl93_two_trucks',shownLoad=(special?([35,145,145][(a.id-1)%3]*.9*(model.live.axle_factor??1)):displayWeights[a.id-1]),y=61-shownLoad*loadScale;const labelX=Math.max(18,Math.min(beamWidth()-18,xp(a.x))),labelWidth=String(Math.round(shownLoad)).length*7+8;let labelY=y-5;while(labels.some(b=>Math.abs(labelX-b.x)<(labelWidth+b.w)/2&&Math.abs(labelY-b.y)<13))labelY-=14;labels.push({x:labelX,y:labelY,w:labelWidth});svg+=`<line class="axle-arrow" data-load="${shownLoad}" x1="${xp(a.x)}" x2="${xp(a.x)}" y1="${y}" y2="61" stroke="#ecb46a" stroke-width="1.6" marker-end="url(#arrow)"/><text x="${labelX}" y="${labelY}" text-anchor="middle" font-size="12" fill="#ffd49a">${fmt(shownLoad,0)}</text>`});
 }
 if(model.load_mode==='thermal')svg+=imposedBeamBand(xp,total);
 starts.forEach((x,i)=>{
  const X=xp(x);
  if(model.supports[i]==='fixed'){
   // Integral abutment: clamped wall with hatching on the outer side.
   const side=i===0?-1:i===starts.length-1?1:0,wx=side?X+side*3:X;
   svg+=`<line x1="${wx}" x2="${wx}" y1="62" y2="104" stroke="#dceaf0" stroke-width="3"/>`;
   for(let k=0;k<6;k++){const y=66+k*7;svg+=side?`<line x1="${wx}" x2="${wx+side*7}" y1="${y}" y2="${y+6}" stroke="#9fb9c6"/>`:`<line x1="${X-7}" x2="${X+7}" y1="${y+6}" y2="${y}" stroke="#9fb9c6"/>`;}
  } else if(model.supports[i]==='split'){
   // Split pier: deck joint and two bearings, one under each deck end.
   svg+=`<line x1="${X}" x2="${X}" y1="58" y2="72" stroke="#ffd49a" stroke-width="2"/><path d="M${X-6} 89l-6 11h12Z M${X+6} 89l-6 11h12Z" fill="#dceaf0" stroke="#dceaf0"/><rect x="${X-15}" y="100" width="30" height="5" rx="1" fill="#7695a6"/>`;
  } else svg+=`<path d="M${X} 89l-8 13h16Z" fill="#dceaf0" stroke="#dceaf0"/>`;
  if(model.supports[i]==='spring'){
   // Rotational spring: a spiral around the support node.
   let d='';for(let a=0;a<=4.4*Math.PI;a+=.25){const r=2+a*1.25;d+=`${d?'L':'M'}${(X+r*Math.cos(a)).toFixed(1)} ${(78+r*Math.sin(a)).toFixed(1)}`;}
   svg+=`<path d="${d}" fill="none" stroke="#f0b35a" stroke-width="1.4"/>`;
  }
  if(model.supports[i]==='roller')svg+=`<circle cx="${X-4}" cy="105" r="2" fill="#cadbe3"/><circle cx="${X+4}" cy="105" r="2" fill="#cadbe3"/>`;
  svg+=`<line x1="${X-13}" x2="${X+13}" y1="109" y2="109" stroke="#7695a6"/><text x="${X}" y="121" text-anchor="middle" font-size="11" fill="#91acbb">R${i+1}${model.supports[i]==='split'?' ‖':''}</text>`;
  // Hinge (moment release) next to a simple span: open circles on the deck axis.
  [[model.spans[i-1],-1],[model.spans[i],1]].forEach(([s,side])=>{if(s?.simple)svg+=`<circle class="hinge" cx="${X+side*6}" cy="65" r="3.6" fill="#17374b" stroke="#ffd49a" stroke-width="1.6"/>`;});
 });
 $('#beam').innerHTML=svg;$('#beam').setAttribute('aria-label',t('beamLoads'));
 const qbCaption=model.load_mode==='thermal'?imposedCaption():model.load_mode==='dead'?t('deadOnly')+(selfWeightIntervals().length?` · ${t('selfWeightIncluded')}`:''):(snap&&display==='snapshot'?`${snap.record.case==='hl93_two_trucks'?t('twoTruckCase'):vehicleName()} · ${t('nominalTruck')}`:`${vehicleName()} · ${t('nominalTruck')}`)+(result?.ft&&model.load_mode!=='dead'?` · <span class="axle-caption">${t('axleCaption')} · ${t(result.ft.girder==='interior'?'interiorGirder':'exteriorGirder')} · ${t(result.ft.state==='ULS'?'ulsState':'flsState')}${['slab','voided_slab'].includes(model.distribution?.bridge_type)?` · ${t('perMetre')}`:''}</span>`:'');
}
function imposedBeamBand(xp,total){
 const k=imposedKind(),th=model.thermal,x=xp(0),w=xp(total)-xp(0);
 if(k==='thermal'){const bil=(th.profile||'linear')==='bilinear',dt=bil?(th.slab_delta_T??30):th.delta_T;return `<rect x="${x}" y="19" width="${w}" height="25" rx="4" fill="url(#thermal-gradient)" opacity=".92"/><text x="${x+8}" y="29" font-size="9" fill="#17374b">${t('thermalTop')}</text><text x="${x+8}" y="41" font-size="9" fill="#17374b">${t('thermalBottom')}</text><text x="${xp(total)-8}" y="35" text-anchor="end" font-size="11" fill="#17374b">${bil?'T₁':'ΔT'} ${dt>0?'+':''}${fmt(dt,1)} °C</text>`;}
 const e=imposedStrainMicro(),label=`${t(IMPOSED_KEYS[k])} · ε ${e===null?'—':`−${fmt(e,0)}×10⁻⁶`}`;
 let g=`<rect x="${x}" y="47" width="${w}" height="13" rx="3" fill="#e3d3a8" opacity=".9"/><text x="${x+w/2}" y="40" text-anchor="middle" font-size="11" fill="#ffd4ad">${label}</text>`;
 const n=Math.max(2,Math.round(w/150));for(let i=0;i<n;i++){const a=x+w*(i+.5)/n;g+=`<path d="M${a-26} 53.5h16M${a-14} 50.5l4 3-4 3M${a+26} 53.5h-16M${a+14} 50.5l-4 3 4 3" stroke="#c4502f" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;}
 return g;
}
// --- Section inset in the beam frame (bottom right, under the last span) -----
function sectionAtX(x){
 let start=0;
 for(let i=0;i<model.spans.length;i++){const s=model.spans[i];
  if(x<=start+s.length+1e-9||i===model.spans.length-1){const f=Math.min(1,Math.max(0,(x-start)/s.length));
   if(!model.nonprismatic||!s.zones.length)return model.sections[s.section]||model.sections[0];
   let prev=0;for(const z of s.zones){if(f<=z.end+1e-9){const a=model.sections[z.section]||model.sections[0],b=model.sections[z.end_section??z.section]||a;if(z.profile==='constant'||a===b)return a;const src=z.plates==='end'?b:z.plates==='deep'&&b.depth>a.depth?b:a,u=(f-prev)/Math.max(1e-9,z.end-prev),g=z.profile==='parabolic'?(a.depth>b.depth?1-(1-u)**2:u*u):u;return {...src,depth:a.depth*(1-g)+b.depth*g,taper:true};}prev=z.end;}
   return model.sections[s.zones.at(-1).section]||model.sections[0];}
  start+=s.length;}
 return model.sections[0];
}
function beamInsetGeom(xp,total){
 // Under the last span, right of centre, below the girder (y ≥ 91). Compact
 // (drawing only) when the last span is short on screen.
 const right=xp(total)-24,last=xp(total-model.spans.at(-1).length),compact=right-last<130,W=compact?42:104;
 return {left:Math.max(last+16,right-W),W,compact};
}
function spanLabelX(i,starts,xp,total){
 const mid=xp((starts[i]+starts[i+1])/2);if(i!==model.spans.length-1)return mid;
 const g=beamInsetGeom(xp,total),a=xp(starts[i])+14;
 return mid+26>g.left&&(a+g.left)/2>a+14?(a+g.left)/2:mid;
}
function beamInsetContent(sec,x,compact){
 const W=compact?42:104,H=34,dw=compact?34:40,dh=26,dx=W-dw/2-4,top=4;
 let g=`<rect x="0" y="0" width="${W}" height="${H}" rx="5" fill="#0c2536" fill-opacity=".92" stroke="#3b6b7f"/>`;
 const name=esc(sec.name||'S'),depth=sectionDepth(sec);
 if(!compact)g+=`<text x="7" y="13" font-size="10" font-weight="700" fill="#a2f1d5">${t('sectionInset')} ${name}</text><text x="7" y="${x!==null?23:26}" font-size="9" fill="#bdced7">${sec.kind==='ei'?'EI':`h ${fmt(depth,0)} mm`}</text>${x!==null?`<text x="7" y="31.5" font-size="8" fill="#91acbb">x = ${fmt(x,1)} m</text>`:''}`;
 if(sec.kind==='ei'){g+=`<rect x="${dx-dw/2}" y="${top+3}" width="${dw}" height="${dh-6}" rx="2" fill="#2b5967" stroke="#73d8bd" stroke-width="1.2"/><text x="${dx}" y="${top+dh/2+4}" text-anchor="middle" font-size="11" font-weight="700" fill="#e8fff8">EI</text>`;return g;}
 const c=sec.composite&&sec.composite.enabled?sec.composite:null,slabH=c?c.slab_thickness+c.haunch:0,total=depth+slabH;
 const gw=sec.kind==='nebt'?1200:Math.max(sec.top_width,sec.bottom_width),bw=c?Math.min(c.effective_width,2.2*gw):gw,k=Math.min(dh/total,dw/Math.max(gw,bw)),y=v=>top+(dh-total*k)/2+(total-v)*k,X=v=>dx+v*k;
 if(c)g+=`<rect x="${X(-bw/2)}" y="${y(total)}" width="${bw*k}" height="${Math.max(1.5,c.slab_thickness*k)}" fill="#d9c592" fill-opacity=".85" stroke="#c9b37e" stroke-width=".8"/>`;
 if(c&&c.haunch>0){const fw=sec.kind==='nebt'?1200:sec.top_width;g+=`<rect x="${X(-fw/2)}" y="${y(depth+c.haunch)}" width="${fw*k}" height="${Math.max(1,c.haunch*k)}" fill="#d9c592" fill-opacity=".85" stroke="#c9b37e" stroke-width=".6"/>`;}
 if(sec.kind==='nebt'){const h=depth,R=[[600,0],[600,85],[90,135],[90,h-320],[405,h-100],[405,h]],pts=[...R,...R.slice().reverse().map(([u,v])=>[-u,v])].map(([u,v])=>`${X(u).toFixed(1)},${y(depth-v).toFixed(1)}`).join(' ');g+=`<polygon points="${pts}" fill="#2b5967" stroke="#73d8bd" stroke-width="1"/>`;}
 else{const tt=Math.max(1.6,sec.top_thickness*k),tb=Math.max(1.6,sec.bottom_thickness*k),tw=Math.max(1.2,sec.web_thickness*k),yt=y(depth),yb=y(0);g+=`<path d="M${X(-sec.top_width/2)} ${yt}h${sec.top_width*k}v${tt}H${dx+tw/2}V${yb-tb}H${X(sec.bottom_width/2)}v${tb}H${X(-sec.bottom_width/2)}v${-tb}H${dx-tw/2}V${yt+tt}H${X(-sec.top_width/2)}Z" fill="#2b5967" stroke="#73d8bd" stroke-width="1"/>`;}
 return g;
}
function beamSectionInset(xp,total){
 const geo=beamInsetGeom(xp,total),x=beamInsetX;beamInsetCompact=geo.compact;
 return `<g id="beam-section" transform="translate(${geo.left.toFixed(1)} 92)"><title>${esc(t('sectionAtCursor'))}</title>${beamInsetContent(sectionAtX(x??(model.spans[0].length/2)),x,geo.compact)}</g>`;
}
function beamInsetUpdate(x){beamInsetX=x;const g=$('#beam-section');if(g&&model)g.innerHTML=`<title>${esc(t('sectionAtCursor'))}</title>`+beamInsetContent(sectionAtX(x??(model.spans[0].length/2)),x,beamInsetCompact);}
// Section names along the girder of the beam frame: one label per zone,
// "S1→S2" in a taper, a tick at each zone boundary.
function beamZoneLabels(s,i,zones,starts,xp){
 let g='',previous=0;const L=s.length;
 zones.forEach((z,j)=>{
  const a=model.sections[z.section]||model.sections[0],b=model.sections[z.end_section??z.section]||a,xa=xp(starts[i]+L*previous),xb=xp(starts[i]+L*z.end);
  if(j>0)g+=`<line x1="${xa}" x2="${xa}" y1="66" y2="86" stroke="#a2f1d5" stroke-width=".8" stroke-dasharray="2 2" opacity=".8"/>`;
  let label=z.profile==='constant'||a===b?a.name:`${a.name}→${b.name}`;if(s.simple&&zones.length===1)label=`${t('simpleSpan')} · ${label}`;
  const w=label.length*5.6+8;
  if(xb-xa>w)g+=`<text class="zone-label${s.simple?' simple':''}" x="${(xa+xb)/2}" y="77" text-anchor="middle">${esc(label)}</text>`;
  else if(s.simple&&j===0&&xp(starts[i+1])-xa>t('simpleSpan').length*5.6)g+=`<text class="zone-label simple" x="${(xp(starts[i])+xp(starts[i+1]))/2}" y="77" text-anchor="middle">${t('simpleSpan')}</text>`;
  previous=z.end;
 });
 return g;
}
function jointBeamSvg(total){
 const j=model.joint;if(!j?.enabled||!(total>0))return '';
 const X=beamX(j.x,total),label=`${j.kind==='cut'?'✂ ':''}${fmt(j.x,2)} m`;let g='<g class="joint-mark">';
 const cut=jointRemoved();
 if(cut){const a=beamX(cut[0],total),b=beamX(cut[1],total);g+=`<defs><pattern id="joint-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#0f2a3a" opacity=".55"/><line x1="0" y1="0" x2="0" y2="7" stroke="#6f8fa0" stroke-width="1.2" opacity=".6"/></pattern></defs><rect x="${Math.min(a,b)}" y="34" width="${Math.abs(b-a)}" height="78" fill="url(#joint-hatch)"><title>${esc(t('jointRemoved'))}</title></rect><text x="${(a+b)/2}" y="104" text-anchor="middle" font-size="11" fill="#c6d6de" class="joint-removed-label">${t('jointRemoved')}</text>`;}
 if(j.kind==='cut')g+=`<path d="M${X} 50l-4 5l8 6l-8 6l8 6l-8 6l8 6l-4 5" fill="none" stroke="#ff9c7a" stroke-width="2.2" stroke-linejoin="round"/>`;
 else g+=`<circle cx="${X}" cy="65" r="4.4" fill="#17374b" stroke="#ffd49a" stroke-width="1.9"/>`;
 const w=label.length*6.2+12,lx=Math.min(Math.max(X,w/2+4),beamWidth()-w/2-4);
 g+=`<rect x="${lx-w/2}" y="20" width="${w}" height="16" rx="8" fill="${j.kind==='cut'?'#5a2f2a':'#4d3f22'}" stroke="${j.kind==='cut'?'#ff9c7a':'#ffd49a'}" stroke-width="1"/><text x="${lx}" y="31.5" text-anchor="middle" font-size="11" fill="#ffe2d6">${label}</text>`;
 return g+'</g>';
}
