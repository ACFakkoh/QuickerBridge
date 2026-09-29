"use strict";
// ---- QuickerBridge v0.8 · Vibration modes ("Modes propres") -----------------
// A self-contained module on top of app.js. It reuses the model (spans,
// sections, EI(x), supports) and the permanent loads as mass, calls its own
// solver action ('modal', quickerbridge/modal.py) and owns one result view.
// It never changes the static analysis, its cache or its results.
Object.assign(words.en,{
 modesTitle:"Free vibration · vertical bending",deckModes:"DECK · VIBRATION MODE",modalMass:"Mass",massDead:"Permanent loads ÷ g (unfactored)",massCustom:"Imposed mass (kN/m)",modalCount:"Modes",
 slow:"Slow motion",realTime:"Real time",listen:"Listen to the bridge",listenHelp:"Plays the modal frequencies transposed into the audible range (ratios preserved); loudness follows the modal mass.",
 modalLoading:"Computing the vibration modes…",modalEngine:"The vibration modes are computed once the calculation engine has loaded.",modalFailed:"The vibration modes could not be computed.",noMass:"No mass: add a permanent load or choose an imposed mass.",
 mode:"Mode",frequency:"Frequency",period:"Period",modalMassShort:"Modal mass",cumulative:"Cumulative",shape:"Shape",symS:"Symmetric",symA:"Antisymmetric",
 modalCaption:"Mode {n} · f = {f} Hz · T = {T} s · {sym}modal mass {m} %",slowed:"slowed ×{k}",realSpeed:"true speed",tooFast:"too fast for the screen: slowed ×{k}",
 massNoteDead:"Mass = unfactored permanent loads ÷ g: {m} t/m on average, {M} t in total. Load factors are not mass.",massNoteCustom:"Imposed mass {w} kN/m ÷ g = {m} t/m, {M} t in total.",unloaded:"{L} m of deck carry no permanent load, hence no mass.",
 refNote:"Benchmark · isolated simply supported span, f = π/(2L²)·√(EI/m):",methodModal:"Euler-Bernoulli elements (the formulation of PyCBA BeamAnalysis.modal), consistent mass, {n} elements, EI(x) integrated with 3-point Gauss, supports and rotational springs as in the static model. Vertical bending of one girder line only: no torsion, no vehicle-bridge interaction, no damping. The modal mass is the share of the deck mass mobilised by a uniform vertical motion (±1-2 %).",
 pedestrianBand:"Shaded bands: vertical pedestrian resonance risk (Sétra 2006): 1.7-2.1 Hz maximum, 1-2.6 Hz medium, 2.6-5 Hz low (2nd harmonic).",
 modesHint:"Click a mode, or use ← →. The deck drawing above vibrates in the selected mode (arbitrary amplitude).",nodes:"nodes"
});
Object.assign(words.fr,{
 modesTitle:"Vibrations libres · flexion verticale",deckModes:"TABLIER · MODE PROPRE",modalMass:"Masse",massDead:"Charges permanentes ÷ g (non pondérées)",massCustom:"Masse imposée (kN/m)",modalCount:"Modes",
 slow:"Ralenti",realTime:"Temps réel",listen:"Écouter le pont",listenHelp:"Joue les fréquences propres transposées dans l’audible (rapports conservés) ; le volume suit la masse modale.",
 modalLoading:"Calcul des modes propres…",modalEngine:"Les modes propres seront calculés dès que le moteur de calcul sera chargé.",modalFailed:"Les modes propres n’ont pas pu être calculés.",noMass:"Aucune masse : ajoutez une charge permanente ou choisissez une masse imposée.",
 mode:"Mode",frequency:"Fréquence",period:"Période",modalMassShort:"Masse modale",cumulative:"Cumul",shape:"Forme",symS:"Symétrique",symA:"Antisymétrique",
 modalCaption:"Mode {n} · f = {f} Hz · T = {T} s · {sym}masse modale {m} %",slowed:"ralenti ×{k}",realSpeed:"vitesse réelle",tooFast:"trop rapide pour l’écran : ralenti ×{k}",
 massNoteDead:"Masse = charges permanentes non pondérées ÷ g : {m} t/m en moyenne, {M} t au total. Les facteurs de charge ne sont pas de la masse.",massNoteCustom:"Masse imposée {w} kN/m ÷ g = {m} t/m, {M} t au total.",unloaded:"{L} m de tablier sans charge permanente, donc sans masse.",
 refNote:"Repère · travée isolée simplement appuyée, f = π/(2L²)·√(EI/m) :",methodModal:"Éléments d’Euler-Bernoulli (formulation de PyCBA BeamAnalysis.modal), masse cohérente, {n} éléments, EI(x) intégré par Gauss à 3 points, appuis et ressorts de rotation comme dans le modèle statique. Flexion verticale d’une ligne de poutre seulement : ni torsion, ni interaction véhicule-pont, ni amortissement. La masse modale est la part de la masse du tablier mobilisée par un mouvement vertical uniforme (±1-2 %).",
 pedestrianBand:"Bandes ombrées : risque de résonance piétonne verticale (Sétra 2006) : 1,7-2,1 Hz maximal, 1-2,6 Hz moyen, 2,6-5 Hz faible (2ᵉ harmonique).",
 modesHint:"Cliquez sur un mode, ou utilisez ← →. Le tablier dessiné plus haut vibre selon le mode choisi (amplitude arbitraire).",nodes:"nœuds"
});
const tf=(key,values)=>t(key).replace(/\{(\w+)\}/g,(_,k)=>values[k]);
let modalData=null,modalSel=0,modalToken=0,modalTimer=null,modalRAF=null,modalSpeed='slow',modalState='idle',modalError='',modalAudio=null;
function modalSettings(){if(!model.modal)model.modal={mass_source:'dead',mass:10,modes:12};return model.modal;}
// Displayed oscillation rates. Thumbnails: compressed so the order stays
// readable (faster for higher modes). Selected mode: slowed to ~0.7 Hz, or its
// true frequency in "real time" when the screen can show it.
function thumbRate(i){const f1=modalData.modes[0].f||1;return Math.min(3,.45*Math.sqrt(modalData.modes[i].f/f1));}
function deckRate(i){const f=modalData.modes[i].f;if(modalSpeed==='real'&&f<=8)return {rate:f,note:t('realSpeed')};const rate=.7;return {rate,note:tf(modalSpeed==='real'?'tooFast':'slowed',{k:fmt(f/rate,f/rate<10?1:0)})};}
function modalChanged(){
 modalData=modalData&&{...modalData,stale:true};clearTimeout(modalTimer);
 if(view==='modes')modalTimer=setTimeout(requestModal,500);
}
async function requestModal(){
 if(!model)return;
 if(!engineReady){modalState='engine';renderModesView();solver.ready.then(()=>{if(view==='modes')requestModal()}).catch(()=>{});return;}
 const token=++modalToken;modalState='loading';renderModesView();
 try{
  const data=await solver.request('modal',{model:clone(model)});
  if(token!==modalToken)return;
  modalData=data;modalState='ready';modalSel=Math.min(modalSel,data.modes.length-1);
  renderModesView();renderBeam();startModalAnimation();
 }catch(e){if(token!==modalToken)return;console.error(e);modalData=null;modalState='error';modalError=String(e.message||e);renderModesView();renderBeam();}
}
function modalMode(on){
 // Vibration modes sit next to the load cases; the static result panels hide.
 document.body.classList.toggle('modal-mode',on);
 $$('#load-mode [data-mode]').forEach(b=>b.classList.toggle('active',!on&&b.dataset.mode===model?.load_mode));
 $('#modes-mode')?.classList.toggle('active',on);
}
function modalShow(){modalMode(true);if(!modalData||modalData.stale)requestModal();else{renderModesView();startModalAnimation();}renderBeam();}
function modalHide(){modalMode(false);stopModalAnimation();const heading=$('[data-i18n="beamLoads"]');if(heading)heading.textContent=t('beamLoads');renderBeam();}
// ---- Beam panel: the deck itself vibrates in the selected mode.
function modalBeam(){
 if(view!=='modes'||!modalData||!model)return false;
 const d=modalData,total=d.x.at(-1),xp=x=>55+x/total*890,y0=64,A=22,i=modalSel,v=d.shapes[i],mode=d.modes[i];
 let svg=`<defs><linearGradient id="modal-glow" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#73d8bd" stop-opacity=".18"/><stop offset="1" stop-color="#73d8bd" stop-opacity=".04"/></linearGradient></defs>`;
 const env=s=>d.x.map((x,k)=>`${k?'L':'M'}${xp(x).toFixed(1)},${(y0+s*A*v[k]).toFixed(1)}`).join('');
 svg+=`<path d="${env(1)}${d.x.map((x,k)=>`L${xp(d.x[d.x.length-1-k]).toFixed(1)},${(y0-A*v[d.x.length-1-k]).toFixed(1)}`).join('')}Z" fill="url(#modal-glow)"/>`;
 svg+=`<path d="${env(1)}" fill="none" stroke="#73d8bd" stroke-opacity=".35" stroke-dasharray="3 4"/><path d="${env(-1)}" fill="none" stroke="#73d8bd" stroke-opacity=".35" stroke-dasharray="3 4"/>`;
 svg+=`<line x1="${xp(0)}" x2="${xp(total)}" y1="${y0}" y2="${y0}" stroke="#607e8d" stroke-dasharray="2 5"/>`;
 // Nodes (zero crossings away from supports).
 for(let k=1;k<v.length;k++){if(v[k-1]*v[k]<0){const x=d.x[k-1]+(d.x[k]-d.x[k-1])*v[k-1]/(v[k-1]-v[k]);if(d.support_x.every(s=>Math.abs(s-x)>total*.004))svg+=`<circle cx="${xp(x).toFixed(1)}" cy="${y0}" r="3" fill="#ffd49a"/>`;}}
 svg+=`<path id="modal-deck" d="" fill="#2b5967" stroke="#a2f1d5" stroke-width="1.4"/>`;
 const supportDepth=modalDepths(d.support_x);
 d.support_x.forEach((x,j)=>{
  const X=xp(x),kind=d.supports[j],yb=58+supportDepth[j];
  if(kind==='fixed'){const side=j===0?-1:j===d.support_x.length-1?1:0,wx=side?X+side*3:X;svg+=`<line x1="${wx}" x2="${wx}" y1="${y0-16}" y2="${yb+20}" stroke="#dceaf0" stroke-width="3"/>`;for(let k=0;k<6;k++){const y=y0-12+k*8;if(side)svg+=`<line x1="${wx}" x2="${wx+side*7}" y1="${y}" y2="${y+6}" stroke="#9fb9c6"/>`}}
  else svg+=`<path d="M${X} ${yb}l-8 13h16Z" fill="#dceaf0"/>`;
  if(kind==='spring'){let p='';for(let a=0;a<=4.4*Math.PI;a+=.25){const r=2+a*1.25;p+=`${p?'L':'M'}${(X+r*Math.cos(a)).toFixed(1)} ${(y0+r*Math.sin(a)).toFixed(1)}`;}svg+=`<path d="${p}" fill="none" stroke="#f0b35a" stroke-width="1.4"/>`;}
  if(kind==='roller')svg+=`<circle cx="${X-4}" cy="${yb+16}" r="2" fill="#cadbe3"/><circle cx="${X+4}" cy="${yb+16}" r="2" fill="#cadbe3"/>`;
  svg+=`<line x1="${X-13}" x2="${X+13}" y1="${yb+20}" y2="${yb+20}" stroke="#7695a6"/><text x="${X}" y="${yb+32}" text-anchor="middle" font-size="11" fill="#91acbb">R${j+1}</text>`;
 });
 let starts=[0];model.spans.forEach(s=>starts.push(starts.at(-1)+s.length));
 model.spans.forEach((s,k)=>{svg+=`<path d="M${xp(starts[k])} 133v7m0-3h${xp(starts[k+1])-xp(starts[k])}m0-4v7" stroke="#607e8d" stroke-width="1" fill="none"/><text x="${xp((starts[k]+starts[k+1])/2)}" y="131" fill="#bdced7" text-anchor="middle" font-size="12">${fmt(s.length)} m</text>`});
 svg+=`<text x="${xp(0)}" y="16" font-size="12" fill="#a2f1d5" font-weight="600">${t('mode')} ${mode.n} · ${fmt(mode.f,2)} Hz</text><text id="modal-speed-note" x="${xp(total)}" y="16" font-size="11" fill="#91acbb" text-anchor="end"></text>`;
 $('#beam').innerHTML=svg;const heading=$('[data-i18n="beamLoads"]');if(heading)heading.textContent=t('deckModes');
 const sym=mode.symmetry==='S'?t('symS').toLowerCase()+' · ':mode.symmetry==='A'?t('symA').toLowerCase()+' · ':'';
 $('#load-caption').innerHTML=tf('modalCaption',{n:mode.n,f:fmt(mode.f,3),T:fmt(mode.T,3),sym,m:fmt(100*mode.mass_ratio,1)});
 $('#modal-speed-note').textContent=deckRate(i).note;
 drawModalFrame(performance.now());
 return true;
}
// Girder depth along the deck, as drawn by renderBeam (haunches included).
function modalDepths(xs){
 const depth=s=>s.kind==='ei'?1800:s.depth,max=Math.max(...model.sections.map(depth));let starts=[0];model.spans.forEach(s=>starts.push(starts.at(-1)+s.length));
 return xs.map(x=>{let i=starts.findIndex((a,k)=>k<model.spans.length&&x<=starts[k+1]+1e-9);if(i<0)i=model.spans.length-1;const s=model.spans[i],u=(x-starts[i])/s.length;
  const zones=model.nonprismatic&&s.zones.length?s.zones:[{end:1,section:s.section,end_section:s.section,profile:'constant'}];let prev=0,z=zones.find(z=>u<=z.end+1e-9)||zones.at(-1);zones.some(q=>{if(q===z)return true;prev=q.end;return false});
  const a=model.sections[z.section]||model.sections[0],b=model.sections[z.end_section??z.section]||a,f=z.end>prev?Math.min(1,Math.max(0,(u-prev)/(z.end-prev))):0,sh=z.profile==='constant'?0:z.profile==='parabolic'?(a.depth>b.depth?1-(1-f)**2:f*f):f;
  return 7+15*(depth(a)*(1-sh)+depth(b)*sh)/max;});
}
// ---- Animation: one requestAnimationFrame loop for the deck and thumbnails.
let modalCache=null;
function modalGeometry(){
 const d=modalData,total=d.x.at(-1),step=Math.max(1,Math.ceil(d.x.length/110));
 const idx=d.x.map((_,k)=>k).filter(k=>k%step===0||k===d.x.length-1);
 return {key:d,xs:idx.map(k=>(4+d.x[k]/total*192).toFixed(1)),thumbs:d.shapes.map(v=>idx.map(k=>v[k])),depth:modalDepths(d.x)};
}
function drawModalFrame(now){
 if(!modalData)return;
 if(modalCache?.key!==modalData)modalCache=modalGeometry();
 const tsec=now/1000,deck=$('#modal-deck');
 if(deck){
  const d=modalData,total=d.x.at(-1),xp=x=>55+x/total*890,v=d.shapes[modalSel],s=Math.sin(2*Math.PI*deckRate(modalSel).rate*tsec)*22,dp=modalCache.depth;
  const top=d.x.map((x,k)=>`${k?'L':'M'}${xp(x).toFixed(1)},${(58+s*v[k]).toFixed(1)}`).join('');
  const bottom=d.x.map((_,k)=>{const j=d.x.length-1-k;return `L${xp(d.x[j]).toFixed(1)},${(58+dp[j]+s*v[j]).toFixed(1)}`}).join('');
  deck.setAttribute('d',top+bottom+'Z');
 }
 $$('.modal-card polyline').forEach(line=>{const i=Number(line.dataset.mode),s=Math.sin(2*Math.PI*thumbRate(i)*tsec)*20,v=modalCache.thumbs[i];line.setAttribute('points',modalCache.xs.map((x,k)=>`${x},${(32+s*v[k]).toFixed(1)}`).join(' '));});
}
function startModalAnimation(){
 stopModalAnimation();if(!modalData||view!=='modes')return;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){drawModalFrame(250/deckRate(modalSel).rate);return;}
 const loop=now=>{if(view!=='modes'||!modalData){modalRAF=null;return;}drawModalFrame(now);modalRAF=requestAnimationFrame(loop);};
 modalRAF=requestAnimationFrame(loop);
}
function stopModalAnimation(){if(modalRAF)cancelAnimationFrame(modalRAF);modalRAF=null;}
// ---- Spectrum: modes on a log frequency axis with pedestrian risk bands.
function spectrumSvg(){
 const d=modalData,host=$('#modes-view'),W=Math.max(320,(host?.clientWidth||900)-24),H=86,fs=d.modes.map(m=>m.f).filter(f=>f>0);
 const fmin=Math.min(...fs),lo=fmin<.25?.1:fmin<.6?.2:fmin<1.2?.5:1,top=Math.max(10,...fs)*1.12,e10=10**Math.floor(Math.log10(top)),hi=[1,2,5,10].map(m=>m*e10).find(v=>v>=top),L=36,R=W-12;
 const X=f=>L+(Math.log10(f)-Math.log10(lo))/(Math.log10(hi)-Math.log10(lo))*(R-L),base=H-22;
 let svg='';
 [[1,1.7,.13],[1.7,2.1,.3],[2.1,2.6,.13],[2.6,5,.06]].forEach(([a,b,o])=>{if(b>lo&&a<hi)svg+=`<rect x="${X(Math.max(a,lo))}" y="6" width="${X(Math.min(b,hi))-X(Math.max(a,lo))}" height="${base-6}" fill="#d98c2b" fill-opacity="${o}"/>`});
 svg+=`<line x1="${L}" x2="${R}" y1="${base}" y2="${base}" stroke="#9db4c1"/>`;
 for(let e=Math.log10(lo);e<=Math.log10(hi)+1e-9;e++)[1,2,5].forEach(m=>{const f=m*10**e;if(f<lo-1e-12||f>hi+1e-9)return;svg+=`<line x1="${X(f)}" x2="${X(f)}" y1="${base}" y2="${base+4}" stroke="#9db4c1"/><text x="${X(f)}" y="${base+16}" text-anchor="middle" class="tick">${fmt(f,f<1?1:0)}</text>`});
 svg+=`<text x="${L-8}" y="${base+4}" text-anchor="end" class="tick">Hz</text>`;
 d.modes.forEach((m,i)=>{if(!(m.f>0))return;const x=X(m.f),h=10+48*Math.sqrt(Math.max(0,m.mass_ratio)),sel=i===modalSel;
  svg+=`<g class="spectrum-mode${sel?' selected':''}" data-mode-index="${i}"><rect x="${x-7}" y="4" width="14" height="${base-2}" fill="transparent"/><line x1="${x}" x2="${x}" y1="${base}" y2="${base-h}" stroke="${sel?'#c0392b':'#008378'}" stroke-width="${sel?3:2}"/><circle cx="${x}" cy="${base-h}" r="${sel?4.5:3.5}" fill="${sel?'#c0392b':'#008378'}"/><text x="${x}" y="${base-h-6}" text-anchor="middle" class="spec-label">${m.n}</text></g>`;});
 return `<svg class="modal-spectrum" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${t('frequency')} (Hz)">${svg}</svg>`;
}
function renderModesView(){
 const host=$('#modes-view');if(!host||!model)return;const st=modalSettings();
 const controls=`<div class="modal-head"><div class="modal-controls"><label>${t('modalMass')} <select data-modal="mass_source"><option value="dead"${st.mass_source==='dead'?' selected':''}>${t('massDead')}</option><option value="custom"${st.mass_source==='custom'?' selected':''}>${t('massCustom')}</option></select></label>${st.mass_source==='custom'?`<label><input type="number" step="any" min="0.001" max="10000" data-modal="mass" value="${st.mass}"> kN/m</label>`:''}<label>${t('modalCount')} <select data-modal="modes">${[3,6,9,12].map(n=>`<option${st.modes===n?' selected':''}>${n}</option>`).join('')}</select></label></div><div class="modal-actions"><div class="segmented small"><button data-modal-speed="slow" class="${modalSpeed==='slow'?'active':''}">${t('slow')}</button><button data-modal-speed="real" class="${modalSpeed==='real'?'active':''}">${t('realTime')}</button></div><button id="modal-listen" title="${esc(t('listenHelp'))}" ${modalData?'':'disabled'}><svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true"><path d="M3 8h3l4-4v12l-4-4H3z" fill="currentColor"/><path d="M13 6.5a5 5 0 0 1 0 7M15.5 4a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg> ${t('listen')}</button></div></div>`;
 let body='';
 if(modalState==='engine')body=`<p class="help">${t('modalEngine')}</p>`;
 else if(modalState==='error')body=`<p class="error">${modalError.includes('modal.no_mass')?t('noMass'):t('modalFailed')}</p>`;
 else if(!modalData)body=`<p class="help">${t('modalLoading')}</p>`;
 else{
  const d=modalData;let cumulative=0;
  const cards=d.modes.map((m,i)=>{const sx=d.support_x.map(x=>(4+x/d.x.at(-1)*192).toFixed(1));return `<button class="modal-card${i===modalSel?' selected':''}" data-mode-index="${i}" aria-pressed="${i===modalSel}"><span class="mc-head"><b>${m.n}</b><span>${fmt(m.f,m.f<10?2:1)} Hz</span></span><svg viewBox="0 0 200 64" preserveAspectRatio="none" aria-hidden="true"><line x1="4" x2="196" y1="32" y2="32" stroke="#dbe5eb" vector-effect="non-scaling-stroke"/>${sx.map(x=>`<path d="M${x} 34l-4 7h8z" fill="#9db4c1"/>`).join('')}<polyline data-mode="${i}" fill="none" stroke="#008378" stroke-width="2" vector-effect="non-scaling-stroke" points=""/></svg><span class="mc-foot">T ${fmt(m.T,3)} s · ${fmt(100*m.mass_ratio,1)} %${m.symmetry!=='—'?` · ${m.symmetry}`:''}</span></button>`}).join('');
  const rows=d.modes.map((m,i)=>{cumulative+=m.mass_ratio;return `<tr class="${i===modalSel?'selected':''}" data-mode-index="${i}"><td>${m.n}</td><td>${fmt(m.f,3)}</td><td>${fmt(m.T,4)}</td><td>${fmt(m.omega,2)}</td><td>${fmt(100*m.mass_ratio,1)}</td><td>${fmt(100*cumulative,1)}</td><td>${m.symmetry==='S'?t('symS'):m.symmetry==='A'?t('symA'):'—'}</td></tr>`}).join('');
  const mass=d.mass,massNote=mass.source==='dead'?tf('massNoteDead',{m:fmt(mass.mean_t_per_m,3),M:fmt(mass.total_t,1)}):tf('massNoteCustom',{w:fmt(mass.mean_t_per_m*9.81,2),m:fmt(mass.mean_t_per_m,3),M:fmt(mass.total_t,1)});
  body=`<div class="modal-spectrum-wrap">${spectrumSvg()}</div><div class="modal-grid${d.stale?' stale':''}">${cards}</div><p class="help modal-hint">${t('modesHint')}</p><div class="table-scroll modal-table"><table><thead><tr><th>${t('mode')}</th><th>f (Hz)</th><th>T (s)</th><th>ω (rad/s)</th><th>${t('modalMassShort')} (%)</th><th>${t('cumulative')} (%)</th><th>${t('shape')}</th></tr></thead><tbody>${rows}</tbody></table></div><div class="table-footnote">${massNote}${mass.unloaded_length>1e-6?` <b>${tf('unloaded',{L:fmt(mass.unloaded_length,2)})}</b>`:''}<br>${t('refNote')} ${d.references.map(r=>`${t('span')} ${r.span} : ${r.f_simple?fmt(r.f_simple,3)+' Hz':'—'}`).join(' · ')}<br>${t('pedestrianBand')}<br>${tf('methodModal',{n:d.elements})}</div>`;
 }
 host.innerHTML=`<h3 class="modal-title">${t('modesTitle')}</h3>`+controls+body;
 if(modalState==='loading'&&modalData)host.querySelector('.modal-grid')?.classList.add('stale');
 if(modalData)drawModalFrame(performance.now());
}
function selectMode(i){if(!modalData)return;modalSel=Math.max(0,Math.min(modalData.modes.length-1,i));renderModesView();renderBeam();}
// ---- "Listen to the bridge": modal frequencies transposed to the audible range.
function listenBridge(){
 if(!modalData)return;const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
 modalAudio=modalAudio||new Ctx();const ctx=modalAudio;if(ctx.state==='suspended')ctx.resume();
 const modes=modalData.modes.filter(m=>m.f>0),k=196/modes[0].f,now=ctx.currentTime+.05,master=ctx.createGain();
 master.gain.value=.22;master.connect(ctx.destination);
 const initial=modalSel;let last=0;
 modes.forEach((m,i)=>{const freq=m.f*k;if(freq>5000)return;last=i;
  const osc=ctx.createOscillator(),g=ctx.createGain(),start=now+i*.075,dur=3.4*(modes[0].f/m.f)**.3,peak=(.3+.7*Math.sqrt(Math.max(0,m.mass_ratio)))/Math.sqrt(modes.length/2);
  osc.type='sine';osc.frequency.value=freq;g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(peak,start+.012);g.gain.exponentialRampToValueAtTime(.0001,start+dur);
  osc.connect(g);g.connect(master);osc.start(start);osc.stop(start+dur+.05);
  setTimeout(()=>{if(view==='modes'&&modalData)selectModeQuiet(modalData.modes.indexOf(m))},(start-ctx.currentTime)*1000);
 });
 // Back to the mode that was selected once the arpeggio has been heard.
 setTimeout(()=>{if(view==='modes'&&modalData)selectModeQuiet(initial)},(now+last*.075-ctx.currentTime)*1000+900);
}
function selectModeQuiet(i){if(i<0||i===modalSel)return;modalSel=i;$$('.modal-card').forEach(c=>{const on=Number(c.dataset.modeIndex)===i;c.classList.toggle('selected',on);c.setAttribute('aria-pressed',on)});$$('.modal-table tr[data-mode-index]').forEach(r=>r.classList.toggle('selected',Number(r.dataset.modeIndex)===i));const sw=$('.modal-spectrum-wrap');if(sw)sw.innerHTML=spectrumSvg();renderBeam();}
// ---- Events (delegated; the view is re-rendered on every change).
document.addEventListener('click',e=>{
 const b=e.target.closest('#modes-mode,#load-mode [data-mode]');if(!b||!model)return;
 if(b.id==='modes-mode'){if(view!=='modes')showView('modes');return;}
 if(view==='modes')showView('diagrams');
},true);
document.addEventListener('click',e=>{
 if(!$('#modes-view')?.contains(e.target))return;
 const card=e.target.closest('[data-mode-index]');if(card){selectMode(Number(card.dataset.modeIndex));return;}
 const speed=e.target.closest('[data-modal-speed]');if(speed){modalSpeed=speed.dataset.modalSpeed;renderModesView();renderBeam();return;}
 if(e.target.closest('#modal-listen'))listenBridge();
});
document.addEventListener('change',e=>{
 const el=e.target.closest('[data-modal]');if(!el||!model)return;const st=modalSettings(),key=el.dataset.modal;
 if(key==='mass'){const v=Number(el.value);if(!(v>0&&v<=10000)||!el.validity.valid)return;st.mass=v;}
 else if(key==='modes')st.modes=Number(el.value);
 else{st.mass_source=el.value;if(el.value==='custom'&&modalData?.mass?.source==='dead')st.mass=Number((modalData.mass.mean_t_per_m*9.81).toPrecision(4));}
 // Mass settings only feed this module: no static recalculation.
 updateProjectState();modalChanged();clearTimeout(modalTimer);requestModal();
});
document.addEventListener('keydown',e=>{
 if(view!=='modes'||!modalData||e.target.closest('input,select,textarea'))return;
 if(e.key==='ArrowRight'){selectMode(modalSel+1);e.preventDefault();}else if(e.key==='ArrowLeft'){selectMode(modalSel-1);e.preventDefault();}
});
let modalResizeFrame=null;
if(window.ResizeObserver)new ResizeObserver(()=>{if(view!=='modes'||!modalData||modalResizeFrame)return;modalResizeFrame=requestAnimationFrame(()=>{modalResizeFrame=null;const sw=$('.modal-spectrum-wrap');if(sw)sw.innerHTML=spectrumSvg();});}).observe(document.documentElement);
