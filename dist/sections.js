"use strict";
// v0.9.3bis — section properties window (steel girder alone, composite 3n and
// 1n, effective properties), computed by quickerbridge/section_props.py. The
// dialog is created on first use only; nothing runs at start-up. Display
// only: the beam stiffness changes only if the user copies a ratio into M.
Object.assign(words.fr,{spTitle:'Propriétés de section',spOpen:'Propriétés de section ↗',spSteel:'Poutre d’acier',spSlab:'Dalle de béton (section mixte)',spAddSlab:'Section mixte avec dalle',spMaterials:'Matériaux',spBars:'Armatures longitudinales',spTop:'Rang sup.',spBottom:'Rang inf.',spCover:'Recouvrement (mm)',spSpacing:'Espacement (mm)',spBar:'Barre',spTc:'Épaisseur dalle tc (mm)',spHaunch:'Gousset de béton (mm)',spBe:'Largeur efficace be (mm)',spFc:'f′c béton (MPa)',spGamma:'Poids volumique béton (kN/m³)',spFy:'Fy acier (MPa)',spFrqr:'FrQr (propriétés effectives)',spY3:'Point S3 : y sous l’ANE (mm)',spResults:'Résultats',spSteelOnly:'Acier seul',spMixed3:'Mixte 3n',spMixed1:'Mixte 1n',spEffective:'Effectives (FrQr)',spClasses:'Classe de section (S6, 10.9.2.1, sans effort axial)',spTopFlange:'Semelle sup. b/2t',spBottomFlange:'Semelle inf. b/2t',spWeb:'Âme h/w',spWeb2dc:'Âme 2dc/w, acier seul, M+ (10.10.2.1)',spReduced:'moment réduit',spOk:'conforme',spClass:'Classe',spCopy1:'M ← I 1n / I acier',spCopy3:'M ← I 3n / I acier',spCopied:'Multiplicateur M mis à jour',spAxisNote:'y mesuré depuis l’axe neutre élastique (ANE), positif vers le bas : S = I / y. Chaque section (acier, 3n, 1n) a son propre ANE.',spNotGirder:'Disponible pour les poutres en I en acier.',spClose:'Fermer',spPna:'ANP depuis le bas',spCentroid:'ȳ depuis le bas',spYtopSlab:'ANE depuis le dessus de la dalle',spMethod:'Hypothèses',spMethodBody:'Rectangles et barres, formules fermées. Le gousset relève la dalle mais son béton n’est pas compté. Béton net des armatures, transformé par n = Es/Ec (3n : 3 × n); armatures comptées comme de l’acier. Ec = (3300 √f′c + 6900)(γc/2300)^1,5. J mixte 1n = J acier + be tc³/6 · Gc/Gs. Propriétés effectives : I acier + FrQr (I mixte − I acier), même règle pour S. Affichage seulement : la rigidité de l’analyse ne change que si vous copiez un rapport dans M.'});
Object.assign(words.en,{spTitle:'Section properties',spOpen:'Section properties ↗',spSteel:'Steel girder',spSlab:'Concrete slab (composite section)',spAddSlab:'Composite section with slab',spMaterials:'Materials',spBars:'Longitudinal reinforcement',spTop:'Top layer',spBottom:'Bottom layer',spCover:'Cover (mm)',spSpacing:'Spacing (mm)',spBar:'Bar',spTc:'Slab thickness tc (mm)',spHaunch:'Concrete haunch (mm)',spBe:'Effective width be (mm)',spFc:'Concrete f′c (MPa)',spGamma:'Concrete unit weight (kN/m³)',spFy:'Steel Fy (MPa)',spFrqr:'FrQr (effective properties)',spY3:'Point S3: y below the ENA (mm)',spResults:'Results',spSteelOnly:'Steel alone',spMixed3:'Composite 3n',spMixed1:'Composite 1n',spEffective:'Effective (FrQr)',spClasses:'Section class (S6, 10.9.2.1, no axial load)',spTopFlange:'Top flange b/2t',spBottomFlange:'Bottom flange b/2t',spWeb:'Web h/w',spWeb2dc:'Web 2dc/w, steel alone, M+ (10.10.2.1)',spReduced:'reduced moment',spOk:'compliant',spClass:'Class',spCopy1:'M ← I 1n / I steel',spCopy3:'M ← I 3n / I steel',spCopied:'Inertia modifier M updated',spAxisNote:'y measured from the elastic neutral axis (ENA), positive downward: S = I / y. Each section (steel, 3n, 1n) has its own ENA.',spNotGirder:'Available for steel I-girders.',spClose:'Close',spPna:'PNA from bottom',spCentroid:'ȳ from bottom',spYtopSlab:'ENA from top of slab',spMethod:'Assumptions',spMethodBody:'Rectangles and bars, closed form. The haunch raises the slab but its concrete is not counted. Concrete net of the bars, transformed by n = Es/Ec (3n: 3 × n); bars count as steel. Ec = (3300 √f′c + 6900)(γc/2300)^1.5. Composite 1n J = steel J + be tc³/6 · Gc/Gs. Effective properties: steel I + FrQr (composite I − steel I), same rule for S. Display only: the analysis stiffness changes only if you copy a ratio into M.'});
let spIndex=null,spData=null,spToken=0,spTimer=null;
const SP_BARS={'10M':[11.3,100],'15M':[16.0,200],'20M':[19.5,300]};
function spDefaults(){const d=model.distribution,be=d&&d.bridge_type==='slab_on_girder'?Math.round(d.spacing*1000):3110;return {enabled:true,slab_thickness:200,haunch:50,effective_width:be,fc:35,unit_weight:24,bar_top:'15M',spacing_top:300,bar_bottom:'15M',spacing_bottom:300,cover_top:60,cover_bottom:35,fy:345,frqr:.85,y3:500};}
function spSci(v,unit){
 if(v===null||v===undefined||!Number.isFinite(v))return '—';
 const a=Math.abs(v);if(a<1e6)return `${fmt(v,a<100?2:0)}${unit?` <small>${unit}</small>`:''}`;
 const e=Math.floor(Math.log10(a)/3)*3,m=v/10**e;return `${fmt(m,m>=100?1:m>=10?2:3)}·10<sup>${e}</sup>${unit?` <small>${unit}</small>`:''}`;
}
function spDialog(){
 let dlg=$('#section-dialog');if(dlg)return dlg;
 dlg=document.createElement('dialog');dlg.id='section-dialog';dlg.className='section-dialog';document.body.appendChild(dlg);
 dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});
 dlg.addEventListener('close',()=>{spIndex=null;});
 return dlg;
}
function openSectionProps(i){spIndex=i;const dlg=spDialog();renderSectionDialog();if(!dlg.open)dlg.showModal();spRequest();}
function spField(key,sub,value,opts={}){return field(key,`sections.${spIndex}.composite.${sub}`,value,'',opts);}
function renderSectionDialog(){
 const dlg=$('#section-dialog');if(!dlg||spIndex===null)return;const s=model.sections[spIndex];if(!s){dlg.close();return;}
 const c=s.composite,steel=s.kind==='girder';
 let left=`<h3>${t('spSteel')} · ${esc(s.name)}</h3>`;
 left+=steel?`<div class="sp-grid">${['depth','web_thickness','top_width','top_thickness','bottom_width','bottom_thickness'].map(k=>field(k,`sections.${spIndex}.${k}`,s[k],'',{min:.1,max:20000})).join('')}${field('E',`sections.${spIndex}.E`,s.E,'',{min:.1,max:1000})}${c?spField('spFy','fy',c.fy,{min:1,max:1000}):''}</div>`:`<p class="help">${t('spNotGirder')}</p>`;
 if(steel){
  left+=`<label class="toggle-row sp-toggle"><input type="checkbox" data-sp-composite="${spIndex}" ${c&&c.enabled?'checked':''}>${t('spAddSlab')}</label>`;
  if(c&&c.enabled){
   left+=`<h3>${t('spSlab')}</h3><div class="sp-grid">${spField('spTc','slab_thickness',c.slab_thickness,{min:1,max:2000})}${spField('spHaunch','haunch',c.haunch,{min:0,max:1000})}${spField('spBe','effective_width',c.effective_width,{min:1,max:20000})}${spField('spY3','y3',c.y3,{min:0,max:15000})}</div>`;
   left+=`<h3>${t('spMaterials')}</h3><div class="sp-grid">${spField('spFc','fc',c.fc,{min:1,max:150})}${spField('spGamma','unit_weight',c.unit_weight,{min:10.01,max:40})}${spField('spFrqr','frqr',c.frqr,{min:.01,max:1})}</div>`;
   const barRow=(layer,label)=>`<div class="sp-bars"><b>${t(label)}</b>${select('spBar',`sections.${spIndex}.composite.bar_${layer}`,c['bar_'+layer],Object.keys(SP_BARS).map(k=>[k,`${k} · ${SP_BARS[k][1]} mm²`]))}${spField('spSpacing','spacing_'+layer,c['spacing_'+layer],{min:10.01,max:2000})}${spField('spCover','cover_'+layer,c['cover_'+layer],{min:0,max:500})}</div>`;
   left+=`<h3>${t('spBars')}</h3>${barRow('top','spTop')}${barRow('bottom','spBottom')}`;
  }
 }
 dlg.innerHTML=`<div class="sp-head"><span class="axle-badge">S6</span><div><b>${t('spTitle')} · ${esc(s.name)}</b><small>${t('spAxisNote')}</small></div><button class="icon-button sp-close" data-sp-close title="${t('spClose')}">×</button></div><div class="sp-body"><div class="sp-inputs">${left}</div><div class="sp-figure" id="sp-figure"></div><div class="sp-results" id="sp-results"></div></div><details class="sp-notes"><summary>${t('spMethod')}</summary><p>${t('spMethodBody')}</p></details>`;
 spRenderResults();
}
function spRequest(){
 clearTimeout(spTimer);if(spIndex===null)return;const s=model.sections[spIndex];if(!s||s.kind!=='girder'){spData=null;spRenderResults();return;}
 if($$('#section-dialog input[type="number"]').some(el=>!el.validity.valid||el.value===''))return;
 const token=++spToken;
 spTimer=setTimeout(async()=>{try{const data=await solver.request('section_properties',{section:clone(s)});if(token===spToken){spData=data;spRenderResults();}}catch(e){console.error(e);}},120);
}
function spRenderResults(){
 const fig=$('#sp-figure'),res=$('#sp-results');if(!fig||!res)return;const s=model.sections[spIndex];
 fig.innerHTML=spSvg(s,spData);
 if(!spData){res.innerHTML=`<p class="help">${t('axleComputing')}</p>`;return;}
 const st=spData.steel,c=spData.composite;
 const col=c?[st,c['3n'],c['1n']]:[st];const heads=c?[t('spSteelOnly'),t('spMixed3'),t('spMixed1')]:[t('spSteelOnly')];
 const row=(label,vals,unit)=>`<tr><th>${label}</th>${vals.map(v=>`<td>${spSci(v,unit)}</td>`).join('')}</tr>`;
 let h=`<h3>${t('spResults')}</h3><table class="sp-table"><thead><tr><th></th>${heads.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>`;
 h+=row('A',col.map(x=>x.A),'mm²')+row(t('spCentroid'),col.map(x=>x.y_bottom),'mm');
 if(c)h+=row(t('spYtopSlab'),[null,c['3n'].y_top_slab,c['1n'].y_top_slab],'mm');
 h+=row('I<sub>x</sub>',col.map((x,i)=>i?x.I:x.Ix),'mm⁴');
 ['S1','S2','S3','S4','S5'].forEach(k=>{if(!c&&k==='S1')return;h+=row(k,col.map(x=>x.S?.[k]??null),'mm³');});
 h+=`</tbody></table>`;
 if(c){h+=`<h3>${t('spEffective')} · FrQr ${fmt(model.sections[spIndex].composite.frqr,2)}</h3><table class="sp-table"><thead><tr><th></th><th>3ne</th><th>1ne</th></tr></thead><tbody>${row('I<sub>e</sub>',[c['3ne'].I,c['1ne'].I],'mm⁴')}${row('S<sub>e</sub> sup.',[c['3ne'].S_top,c['1ne'].S_top],'mm³')}${row('S<sub>e</sub> inf.',[c['3ne'].S_bot,c['1ne'].S_bot],'mm³')}</tbody></table>`;}
 h+=`<table class="sp-table sp-misc"><tbody>${row('I<sub>y</sub>',[st.Iy],'mm⁴')}${row('J',[st.J],'mm⁴')}${c?row('J 1n',[c['1n'].J],'mm⁴'):''}${row('C<sub>w</sub>',[st.Cw],'mm⁶')}${row('Z<sub>x</sub>',[st.Zx],'mm³')}${row(t('spPna'),[st.PNA_from_bottom],'mm')}${c?row('n = Es/Ec',[c.n],'')+row('Ec',[c.Ec],'MPa')+row('A<sub>r</sub> sup. / inf.',[c.bars[0].area,c.bars[1].area],'mm²'):''}</tbody></table>`;
 const cls=st.classes,lim=st.limits;
 const cl=(label,[ratio,k],limits)=>`<tr><th>${label}</th><td>${fmt(ratio,1)}</td><td class="sp-class sp-class-${k}">${t('spClass')} ${k}</td><td><small>${limits.map(v=>fmt(v,1)).join(' / ')}</small></td></tr>`;
 h+=`<h3>${t('spClasses')}</h3><table class="sp-table sp-classes"><tbody>${cl(t('spTopFlange'),cls.top_flange,lim.flange)}${cl(t('spBottomFlange'),cls.bottom_flange,lim.flange)}${cl(t('spWeb'),cls.web,lim.web)}<tr><th>${t('spWeb2dc')}</th><td>${fmt(cls.web_2dc[0],1)}</td><td class="sp-class ${cls.web_2dc[1]?'sp-class-4':'sp-class-1'}">${cls.web_2dc[1]?t('spReduced'):t('spOk')}</td><td><small>${fmt(lim.web[2],1)}</small></td></tr></tbody></table>`;
 if(c)h+=`<div class="sp-actions"><button data-sp-copy="1n">${t('spCopy1')} = ${fmt(c['1n'].I/st.Ix,3)}</button><button data-sp-copy="3n">${t('spCopy3')} = ${fmt(c['3n'].I/st.Ix,3)}</button></div>`;
 res.innerHTML=h;
}
// Cross-section drawing: true proportions, y up from the bottom of the girder.
function spSvg(s,data){
 if(!s||s.kind!=='girder')return '';
 const c=s.composite&&s.composite.enabled?s.composite:null,d=s.depth,top=c?d+c.haunch+c.slab_thickness:d;
 // A wide slab would crush the girder at true scale: it is cut (break marks)
 // at 2.6 × the widest flange, with be given as a dimension.
 const maxF=Math.max(s.top_width,s.bottom_width),shownB=c?Math.min(c.effective_width,2.6*maxF):0,cut=c&&shownB<c.effective_width;
 const W=Math.max(shownB,maxF);
 const vw=260,vh=360,pad=34,sc=Math.min((vw-2*pad-30)/W,(vh-2*pad-14)/top),cx=pad+10+(vw-2*pad-30)/2,Y=y=>vh-pad-y*sc,X=x=>cx+x*sc;
 let g=`<rect x="${X(-s.bottom_width/2)}" y="${Y(s.bottom_thickness)}" width="${s.bottom_width*sc}" height="${s.bottom_thickness*sc}" class="sp-steel"/><rect x="${X(-s.web_thickness/2)}" y="${Y(d-s.top_thickness)}" width="${Math.max(1,s.web_thickness*sc)}" height="${(d-s.top_thickness-s.bottom_thickness)*sc}" class="sp-steel"/><rect x="${X(-s.top_width/2)}" y="${Y(d)}" width="${s.top_width*sc}" height="${s.top_thickness*sc}" class="sp-steel"/>`;
 if(c){
  g+=`<rect x="${X(-s.top_width/2)}" y="${Y(d+c.haunch)}" width="${s.top_width*sc}" height="${c.haunch*sc}" class="sp-haunch"/><rect x="${X(-shownB/2)}" y="${Y(top)}" width="${shownB*sc}" height="${c.slab_thickness*sc}" class="sp-concrete"/>`;
  [['top',top-c.cover_top-SP_BARS[c.bar_top][0]/2,c.spacing_top],['bottom',d+c.haunch+c.cover_bottom+SP_BARS[c.bar_bottom][0]/2,c.spacing_bottom]].forEach(([_,y,sp])=>{const n=Math.max(2,Math.min(40,Math.round(shownB/sp)));for(let k=0;k<n;k++){const x=-shownB/2+(k+.5)*shownB/n;g+=`<circle cx="${X(x)}" cy="${Y(y)}" r="1.8" class="sp-bar"/>`;}});
  if(cut)[-1,1].forEach(side=>{const x=X(side*shownB/2),y0=Y(top)-3,y1=Y(d+c.haunch)+3,m=(y0+y1)/2;g+=`<path d="M${x} ${y0}L${x} ${m-4}L${x+side*4} ${m-1}L${x-side*4} ${m+1}L${x} ${m+4}L${x} ${y1}" class="sp-break"/>`;});
  g+=`<line x1="${X(-shownB/2)}" x2="${X(shownB/2)}" y1="${Y(top)-8}" y2="${Y(top)-8}" class="sp-axis"/><text x="${cx}" y="${Y(top)-11}" class="sp-dim">be = ${fmt(c.effective_width,0)} mm</text>`;
 }
 // y axis from the bottom of the girder.
 // y axis: origin at the elastic neutral axis (1n, or steel alone), positive downward.
 if(data){const ena=data.composite?data.composite['1n'].y_bottom:data.steel.y_bottom;g+=`<line x1="${pad-6}" x2="${pad-6}" y1="${Y(ena)}" y2="${Y(0)+2}" class="sp-axis" marker-end="url(#sp-arrow)"/><text x="${pad-10}" y="${Y(0)+12}" class="sp-axis-label">y</text><text x="${pad-10}" y="${Y(ena)+3}" class="sp-axis-label">0</text>`;}
 if(data){
  const lines=[[data.steel.y_bottom,'sp-na-steel',t('spSteelOnly')]];
  if(data.composite){lines.push([data.composite['3n'].y_bottom,'sp-na-3n','3n']);lines.push([data.composite['1n'].y_bottom,'sp-na-1n','1n']);}
  lines.forEach(([y,cls,label])=>{g+=`<line x1="${pad}" x2="${vw-pad+6}" y1="${Y(y)}" y2="${Y(y)}" class="${cls}"/><text x="${vw-pad+8}" y="${Y(y)+3}" class="sp-na-label ${cls}">ANE ${label}</text>`;});
  const pts=data.composite?data.composite['1n'].points:{S2:d,S4:s.bottom_thickness,S5:0,...(s.composite?{S3:data.steel.y_bottom-s.composite.y3}:{})};
  // Ticks at the true heights; labels pushed apart (≥ 10 px) with a leader.
  let last=Infinity;
  Object.entries(pts).sort((a,b)=>a[1]-b[1]).forEach(([k,y])=>{const yt=Y(y),yl=Math.min(yt,last-10);last=yl;g+=`<line x1="${X(-W/2)-4}" x2="${X(-W/2)-10}" y1="${yt}" y2="${yt}" class="sp-point"/><line x1="${X(-W/2)-10}" x2="${X(-W/2)-14}" y1="${yt}" y2="${yl}" class="sp-point"/><text x="${X(-W/2)-16}" y="${yl+3}" text-anchor="end" class="sp-point-label">${k}</text>`;});
 }
 return `<svg viewBox="0 0 ${vw+40} ${vh}" class="sp-svg" role="img" aria-label="${t('spTitle')}"><defs><marker id="sp-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#5d7d8c"/></marker></defs>${g}</svg>`;
}
function sectionPropsChanged(path){if(spIndex!==null&&path.startsWith(`sections.${spIndex}.`))spRequest();}
document.addEventListener('click',e=>{
 const open=e.target.closest('[data-section-props]');if(open){openSectionProps(Number(open.dataset.sectionProps));return;}
 if(e.target.closest('[data-sp-close]')){$('#section-dialog')?.close();return;}
 const copy=e.target.closest('[data-sp-copy]');
 if(copy&&spData?.composite){const s=model.sections[spIndex],ratio=spData.composite[copy.dataset.spCopy].I/spData.steel.Ix;s.inertia_modifier=Math.round(ratio*1000)/1000;renderInputs();changed();$('#status').textContent=`${t('spCopied')} : ${fmt(s.inertia_modifier,3)}`;renderSectionDialog();spRequest();}
});
document.addEventListener('change',e=>{
 const box=e.target.closest?.('[data-sp-composite]');if(!box)return;
 const s=model.sections[Number(box.dataset.spComposite)];
 if(!s.composite)s.composite=spDefaults();else s.composite.enabled=box.checked;
 updateProjectState();renderSectionDialog();spRequest();
});
// v0.9.4 — staged stresses over the depth at a station (double-click a
// diagram, or "σ ↗" in the readout). Self-weight and other permanent loads on
// the steel alone or the 3n section, live load on the 1n section; a composite
// stage under a negative moment uses the cracked section (steel + bars).
Object.assign(words.fr,{stTitle:'Contraintes sur la hauteur',stOpen:'σ ↗',stHint:'Double-cliquez un diagramme pour les contraintes à cette station.',stSelfStage:'Poids propre repris par',stDeadStage:'Autres permanentes reprises par',stSteel:'Acier seul',st3n:'Mixte 3n',stMoments:'Moments à la station (kN·m)',stSelf:'Poids propre',stDead:'Autres permanentes',stLiveMax:'Surcharge (env. max)',stLiveMin:'Surcharge (env. min)',stCaseMax:'Cas M max',stCaseMin:'Cas M min',stFibre:'Fibre',stTotal:'Total',stSlabTop:'Dessus de dalle',stSlabBottom:'Dessous de dalle',stBarTop:'Armature sup.',stBarBottom:'Armature inf.',stS2:'S2 · haut semelle sup.',stS3:'S3 · y sous l’ANE 1n',stS4:'S4 · haut semelle inf.',stS5:'S5 · bas semelle inf.',stSign:'σ en MPa, traction +, compression −. Béton : σ acier équivalente / n (ou 3n). Moment négatif sur la section mixte : béton fissuré, acier + armatures.',stNoSlab:'Aucune dalle définie pour cette section : toutes les étapes sur l’acier seul. Définissez la dalle dans « Propriétés de section ».',stCracked:'fissurée',stNotSteel:'Contraintes disponibles pour les poutres en I en acier.',stDefine:'Définir la dalle ↗'});
Object.assign(words.en,{stTitle:'Stresses over the depth',stOpen:'σ ↗',stHint:'Double-click a diagram for the stresses at that station.',stSelfStage:'Self-weight carried by',stDeadStage:'Other permanent loads carried by',stSteel:'Steel alone',st3n:'Composite 3n',stMoments:'Moments at the station (kN·m)',stSelf:'Self-weight',stDead:'Other permanent',stLiveMax:'Live load (envelope max)',stLiveMin:'Live load (envelope min)',stCaseMax:'M max case',stCaseMin:'M min case',stFibre:'Fibre',stTotal:'Total',stSlabTop:'Top of slab',stSlabBottom:'Bottom of slab',stBarTop:'Top bars',stBarBottom:'Bottom bars',stS2:'S2 · top of top flange',stS3:'S3 · y below the 1n ENA',stS4:'S4 · top of bottom flange',stS5:'S5 · bottom of bottom flange',stSign:'σ in MPa, tension +, compression −. Concrete: equivalent steel σ / n (or 3n). Negative moment on the composite section: cracked concrete, steel + bars.',stNoSlab:'No slab defined for this section: every stage on the steel alone. Define the slab in “Section properties”.',stCracked:'cracked',stNotSteel:'Stresses are available for steel I-girders.',stDefine:'Define the slab ↗'});
let stIndex=null,stData=null,stToken=0,stStages={self:'steel',dead:'3n'};
function stDialog(){
 let dlg=$('#stress-dialog');if(dlg)return dlg;
 dlg=document.createElement('dialog');dlg.id='stress-dialog';dlg.className='section-dialog stress-dialog';document.body.appendChild(dlg);
 dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});dlg.addEventListener('close',()=>{stIndex=null;});
 return dlg;
}
function openStress(index){
 if(!result||result.kind==='thermal'||!jobId)return;
 stIndex=index;const dlg=stDialog();stData=null;renderStress();if(!dlg.open)dlg.showModal();stRequest();
}
async function stRequest(){
 const token=++stToken;
 try{const data=await solver.request('stress',{job:jobId,index:stIndex,self_weight_stage:stStages.self,dead_stage:stStages.dead,composites:model.sections.map(s=>s.composite?clone(s.composite):null)});if(token!==stToken)return;stData=data;}
 catch(e){if(token!==stToken)return;stData={error:String(e)};}
 renderStress();
}
const ST_NAMES={slab_top:'stSlabTop',bar_top:'stBarTop',bar_bottom:'stBarBottom',slab_bottom:'stSlabBottom',S2:'stS2',S3:'stS3',S4:'stS4',S5:'stS5'};
function renderStress(){
 const dlg=$('#stress-dialog');if(!dlg||stIndex===null)return;
 const x=result.x[stIndex],stageSel=(key,path,val)=>`<label class="field"><span>${t(key)}</span><select data-st-stage="${path}"><option value="steel" ${val==='steel'?'selected':''}>${t('stSteel')}</option><option value="3n" ${val==='3n'?'selected':''}>${t('st3n')}</option></select></label>`;
 let body;
 if(!stData)body=`<p class="help">${t('axleComputing')}</p>`;
 else if(stData.error)body=`<p class="help">${t(stData.error.includes('section_kind')?'stNotSteel':'failed')}</p>`;
 else body=stBody(stData);
 const sec=stData&&!stData.error?stData.section:null;
 dlg.innerHTML=`<div class="sp-head"><span class="axle-badge">σ</span><div><b>${t('stTitle')} · x = ${fmt(x)} m${sec?` · ${esc(sec.name)} · h ${fmt(sec.depth,0)} mm`:''}</b><small>${t('stSign')}</small></div><button class="icon-button sp-close" data-st-close title="${t('spClose')}">×</button></div><div class="st-controls">${stageSel('stSelfStage','self',stStages.self)}${stageSel('stDeadStage','dead',stStages.dead)}</div>${body}`;
}
function stBody(d){
 const mx=d.cases.max,mn=d.cases.min,mo=d.moments;
 let h='';
 if(!mx.composite){const i=model.sections.findIndex(s=>s.name===d.section.name);h+=`<p class="axle-warning">⚠ ${t('stNoSlab')}${i>=0&&model.sections[i].kind==='girder'?` <button class="text-button" data-section-props="${i}">${t('stDefine')}</button>`:''}</p>`;}
 h+=`<div class="st-body"><div class="sp-figure">${stSvg(d)}</div><div>`;
 h+=`<h3>${t('stMoments')}</h3><table class="sp-table"><tbody><tr><th>${t('stSelf')} · ${t(mo.self_weight_stage==='steel'?'stSteel':'st3n')}</th><td>${fmt(mo.self_weight,1)}</td></tr><tr><th>${t('stDead')} · ${t(mo.dead_stage==='steel'?'stSteel':'st3n')}</th><td>${fmt(mo.dead,1)}</td></tr><tr><th>${t('stLiveMax')} · 1n</th><td>${fmt(mo.live_max,1)}</td></tr><tr><th>${t('stLiveMin')} · 1n</th><td>${fmt(mo.live_min,1)}</td></tr></tbody></table>`;
 const st=k=>mx.stages[k],cr=k=>st(k).cracked?` <small>(${t('stCracked')})</small>`:'';
 h+=`<h3>σ (MPa)</h3><table class="sp-table st-table"><thead><tr><th>${t('stFibre')}</th><th>${t('stSteel')}</th><th>3n${cr('3n')}</th><th>1n${cr('1n')}</th><th>${t('stCaseMax')}</th><th>${t('stCaseMin')}</th></tr></thead><tbody>`;
 [...mx.fibres].reverse().forEach(f=>{const v=(c,k)=>c.stages[k].sigma[f.name];const cell=s=>`<td class="${s>1e-9?'st-tension':s<-1e-9?'st-compression':''}">${fmt(s,1)}</td>`;h+=`<tr><th>${t(ST_NAMES[f.name]||f.name)}</th>${cell(v(mx,'steel'))}${cell(v(mx,'3n'))}${cell(v(mx,'1n'))}${cell(mx.total[f.name]).replace('<td','<td data-total')}${cell(mn.total[f.name]).replace('<td','<td data-total')}</tr>`;});
 return h+`</tbody></table></div></div>`;
}
// Section outline and the two total stress profiles on the same height scale.
function stSvg(d){
 const mx=d.cases.max,mn=d.cases.min,s=d.section,H=mx.height,vw=460,vh=340,pad=30,sy=(vh-2*pad)/H,Y=y=>vh-pad-y*sy;
 const all=[...Object.values(mx.total),...Object.values(mn.total),1];const smax=Math.max(...all.map(Math.abs));
 const ox=250,half=170,SX=v=>ox+v/smax*half*.9;
 const c=s.composite&&s.composite.enabled?s.composite:null,d0=s.depth,w=Math.max(s.top_width,s.bottom_width,c?Math.min(c.effective_width,2.6*Math.max(s.top_width,s.bottom_width)):0),sx=Math.min(120/w,sy),cx=80,X=v=>cx+v*sx;
 let g=`<rect x="${X(-s.bottom_width/2)}" y="${Y(s.bottom_thickness)}" width="${s.bottom_width*sx}" height="${s.bottom_thickness*sy}" class="sp-steel"/><rect x="${X(-s.web_thickness/2)}" y="${Y(d0-s.top_thickness)}" width="${Math.max(1,s.web_thickness*sx)}" height="${(d0-s.top_thickness-s.bottom_thickness)*sy}" class="sp-steel"/><rect x="${X(-s.top_width/2)}" y="${Y(d0)}" width="${s.top_width*sx}" height="${s.top_thickness*sy}" class="sp-steel"/>`;
 if(c&&mx.composite){const bw=Math.min(c.effective_width,2.6*Math.max(s.top_width,s.bottom_width));g+=`<rect x="${X(-s.top_width/2)}" y="${Y(d0+c.haunch)}" width="${s.top_width*sx}" height="${c.haunch*sy}" class="sp-haunch"/><rect x="${X(-bw/2)}" y="${Y(H)}" width="${bw*sx}" height="${c.slab_thickness*sy}" class="sp-concrete"/>`;}
 g+=`<line x1="${ox}" x2="${ox}" y1="${pad-10}" y2="${vh-pad+6}" class="sp-axis"/><text x="${ox}" y="${vh-8}" class="sp-dim">0</text><text x="${ox+half*.9}" y="${vh-8}" class="sp-dim">+${fmt(smax,0)} MPa</text><text x="${ox-half*.9}" y="${vh-8}" class="sp-dim">−${fmt(smax,0)}</text>`;
 const by=Object.fromEntries(mx.fibres.map(f=>[f.name,f.y]));
 [[mx,'st-max'],[mn,'st-min']].forEach(([cs,cls])=>{
  const seg=(a,b)=>`<path d="M${SX(cs.total[a])} ${Y(by[a])}L${SX(cs.total[b])} ${Y(by[b])}" class="${cls}"/>`;
  g+=seg('S5','S2')+`<path d="M${ox} ${Y(0)}L${SX(cs.total.S5)} ${Y(0)}M${ox} ${Y(d0)}L${SX(cs.total.S2)} ${Y(d0)}" class="${cls} st-fill"/>`;
  if(cs.composite){g+=seg('slab_bottom','slab_top')+`<path d="M${ox} ${Y(by.slab_top)}L${SX(cs.total.slab_top)} ${Y(by.slab_top)}M${ox} ${Y(by.slab_bottom)}L${SX(cs.total.slab_bottom)} ${Y(by.slab_bottom)}" class="${cls} st-fill"/>`;['bar_top','bar_bottom'].forEach(b=>{g+=`<circle cx="${SX(cs.total[b])}" cy="${Y(by[b])}" r="2.6" class="${cls} st-dot"/>`;});}
 });
 [['S5',mx],['S2',mx]].concat(mx.composite?[['slab_top',mx]]:[]).forEach(([k])=>{g+=`<text x="${SX(mx.total[k])+(mx.total[k]>=0?4:-4)}" y="${Y(by[k])-3}" text-anchor="${mx.total[k]>=0?'start':'end'}" class="st-label st-max-text">${fmt(mx.total[k],0)}</text>`;});
 g+=`<text x="${vw-6}" y="16" text-anchor="end" class="st-legend st-max-text">— ${t('stCaseMax')}</text><text x="${vw-6}" y="30" text-anchor="end" class="st-legend st-min-text">— ${t('stCaseMin')}</text>`;
 return `<svg viewBox="0 0 ${vw} ${vh}" class="sp-svg" role="img" aria-label="${t('stTitle')}">${g}</svg>`;
}
document.addEventListener('click',e=>{
 const open=e.target.closest('[data-stress-index]');if(open){openStress(Number(open.dataset.stressIndex));return;}
 if(e.target.closest('[data-st-close]')){$('#stress-dialog')?.close();}
});
document.addEventListener('change',e=>{const sel=e.target.closest?.('[data-st-stage]');if(!sel)return;stStages[sel.dataset.stStage]=sel.value;stRequest();});
document.addEventListener('dblclick',e=>{
 const svg=e.target.closest?.('#charts svg.plot');if(!svg||svg.classList.contains('delta-plot')||!result||result.kind==='thermal')return;
 clearTimeout(window.qbClickTimer);
 const rect=svg.getBoundingClientRect(),x=Math.max(0,Math.min(1,((e.clientX-rect.left)/rect.width*926-26)/874))*result.x.at(-1);
 openStress(nearest(x));
});
