"use strict";
// v0.9.3bis — section properties window (steel girder alone, composite 3n and
// 1n, effective properties), computed by quickerbridge/section_props.py. The
// dialog is created on first use only; nothing runs at start-up. Display
// only: the beam stiffness changes only if the user copies a ratio into M.
// v0.9.5: region first (positive moment: steel, 3n, 1n; negative moment: steel
// and I' = steel + bars in tension, cracked slab ignored), y of S3 per
// configuration, steel-only y and Fy, larger drawing.
Object.assign(words.fr,{spTitle:'Propriétés de section',spOpen:'Propriétés de section ↗',spSteel:'Poutre d’acier',spSlab:'Dalle de béton (section mixte)',spSlabNeg:'Dalle fissurée : armatures longitudinales (I′)',spAddSlab:'Section mixte avec dalle',spMaterials:'Matériaux',spBars:'Armatures longitudinales',spTop:'Rang sup.',spBottom:'Rang inf.',spCover:'Recouvrement (mm)',spSpacing:'Espacement (mm)',spBar:'Barre',spTc:'Épaisseur dalle tc (mm)',spHaunch:'Gousset de béton (mm)',spBe:'Largeur efficace be (mm)',spFc:'f′c béton (MPa)',spGamma:'Poids volumique béton (kN/m³)',spFy:'Fy acier (MPa)',spFrqr:'FrQr (propriétés effectives)',spY3:'Point S3 : y sous l’ANE (mm)',spYHead:'Point S3 · y sous l’ANE de chaque configuration (mm)',spYsteel:'y · acier seul',spY3n:'y · mixte 3n',spY1n:'y · mixte 1n',spYneg:'y · I′ acier + armatures',spResults:'Résultats',spSteelOnly:'Acier seul',spMixed3:'Mixte 3n',spMixed1:'Mixte 1n',spNeg:'I′ acier + armatures',spEffective:'Effectives (FrQr)',spClasses:'Classe de section (S6, 10.9.2.1, sans effort axial)',spTopFlange:'Semelle sup. b/2t',spBottomFlange:'Semelle inf. b/2t',spWeb:'Âme h/w',spWeb2dc:'Âme 2dc/w, acier seul, M+ (10.10.2.1)',spWeb2dcNeg:'Âme 2dc/w, I′, M− (10.10.2.1)',spReduced:'moment réduit',spOk:'conforme',spClass:'Classe',spCopy1:'M ← I 1n / I acier',spCopy3:'M ← I 3n / I acier',spCopyNeg:'M ← I′ / I acier',spCopied:'Multiplicateur M mis à jour',spAxisNote:'y mesuré depuis l’axe neutre élastique (ANE), positif vers le bas : S = I / y. Chaque configuration a son propre ANE et son propre y.',spNotGirder:'Disponible pour les poutres en I en acier.',spClose:'Fermer',spPna:'ANP depuis le bas',spCentroid:'ȳ depuis le bas',spYtopSlab:'ANE depuis le dessus de la dalle',spYtopBars:'ANE sous l’armature sup.',spBarsArea:'A<sub>r</sub> armatures (traction)',spMethod:'Hypothèses',spRegion:'Région',spPos:'Région positive · M+',spNegR:'Région négative · M−',spPosHelp:'Moment positif : dalle comprimée, sections mixtes 3n (long terme) et 1n (court terme).',spNegHelp:'Moment négatif : dalle tendue et fissurée, béton ignoré. I′ = poutre d’acier + armatures longitudinales (traction seulement); pas de 3n ni de 1n.',spNegNoSlab:'Définissez la dalle et ses armatures (case ci-dessous) pour obtenir I′; sinon seule la section d’acier est donnée.',spMethodBody:'Rectangles et barres, formules fermées. Le gousset relève la dalle mais son béton n’est pas compté. Béton net des armatures, transformé par n = Es/Ec (3n : 3 × n); armatures comptées comme de l’acier. Ec = (3300 √f′c + 6900)(γc/2300)^1,5. J mixte 1n = J acier + be tc³/6 · Gc/Gs. Propriétés effectives : I acier + FrQr (I mixte − I acier), même règle pour S. Région négative : I′ = acier + deux rangs d’armatures, béton fissuré ignoré; 2dc/w avec dc = ȳ′ − tb (âme comprimée par le bas). Affichage seulement : la rigidité de l’analyse ne change que si vous copiez un rapport dans M.'});
Object.assign(words.en,{spTitle:'Section properties',spOpen:'Section properties ↗',spSteel:'Steel girder',spSlab:'Concrete slab (composite section)',spSlabNeg:'Cracked slab: longitudinal bars (I′)',spAddSlab:'Composite section with slab',spMaterials:'Materials',spBars:'Longitudinal reinforcement',spTop:'Top layer',spBottom:'Bottom layer',spCover:'Cover (mm)',spSpacing:'Spacing (mm)',spBar:'Bar',spTc:'Slab thickness tc (mm)',spHaunch:'Concrete haunch (mm)',spBe:'Effective width be (mm)',spFc:'Concrete f′c (MPa)',spGamma:'Concrete unit weight (kN/m³)',spFy:'Steel Fy (MPa)',spFrqr:'FrQr (effective properties)',spY3:'Point S3: y below the ENA (mm)',spYHead:'Point S3 · y below the ENA of each configuration (mm)',spYsteel:'y · steel alone',spY3n:'y · composite 3n',spY1n:'y · composite 1n',spYneg:'y · I′ steel + bars',spResults:'Results',spSteelOnly:'Steel alone',spMixed3:'Composite 3n',spMixed1:'Composite 1n',spNeg:'I′ steel + bars',spEffective:'Effective (FrQr)',spClasses:'Section class (S6, 10.9.2.1, no axial load)',spTopFlange:'Top flange b/2t',spBottomFlange:'Bottom flange b/2t',spWeb:'Web h/w',spWeb2dc:'Web 2dc/w, steel alone, M+ (10.10.2.1)',spWeb2dcNeg:'Web 2dc/w, I′, M− (10.10.2.1)',spReduced:'reduced moment',spOk:'compliant',spClass:'Class',spCopy1:'M ← I 1n / I steel',spCopy3:'M ← I 3n / I steel',spCopyNeg:'M ← I′ / I steel',spCopied:'Inertia modifier M updated',spAxisNote:'y measured from the elastic neutral axis (ENA), positive downward: S = I / y. Each configuration has its own ENA and its own y.',spNotGirder:'Available for steel I-girders.',spClose:'Close',spPna:'PNA from bottom',spCentroid:'ȳ from bottom',spYtopSlab:'ENA from top of slab',spYtopBars:'ENA below the top bars',spBarsArea:'A<sub>r</sub> bars (tension)',spMethod:'Assumptions',spRegion:'Region',spPos:'Positive region · M+',spNegR:'Negative region · M−',spPosHelp:'Positive moment: slab in compression, composite sections 3n (long term) and 1n (short term).',spNegHelp:'Negative moment: slab in tension and cracked, concrete ignored. I′ = steel girder + longitudinal bars (tension only); no 3n or 1n.',spNegNoSlab:'Define the slab and its bars (box below) to get I′; otherwise only the steel section is given.',spMethodBody:'Rectangles and bars, closed form. The haunch raises the slab but its concrete is not counted. Concrete net of the bars, transformed by n = Es/Ec (3n: 3 × n); bars count as steel. Ec = (3300 √f′c + 6900)(γc/2300)^1.5. Composite 1n J = steel J + be tc³/6 · Gc/Gs. Effective properties: steel I + FrQr (composite I − steel I), same rule for S. Negative region: I′ = steel + both bar layers, cracked concrete ignored; 2dc/w with dc = ȳ′ − tb (web compressed from the bottom). Display only: the analysis stiffness changes only if you copy a ratio into M.'});
let spIndex=null,spData=null,spToken=0,spTimer=null;
const SP_BARS={'10M':[11.3,100],'15M':[16.0,200],'20M':[19.5,300]};
function spDefaults(){const d=model.distribution,be=d&&d.bridge_type==='slab_on_girder'?Math.round(d.spacing*1000):3110;return {enabled:true,slab_thickness:200,haunch:50,effective_width:be,fc:35,unit_weight:24,bar_top:'15M',spacing_top:300,bar_bottom:'15M',spacing_bottom:300,cover_top:60,cover_bottom:35,fy:345,frqr:.85,y3:500,y_steel:null,y_3n:null,y_1n:null,y_neg:null,region:'positive'};}
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
// A steel girder always gets a composite block (slab off) so that Fy, y and
// the region can be set for the steel section alone.
function openSectionProps(i){spIndex=i;const s=model.sections[i];if(s&&s.kind==='girder'&&!s.composite)s.composite={...spDefaults(),enabled:false};const dlg=spDialog();renderSectionDialog();if(!dlg.open)dlg.showModal();spRequest();}
function spField(key,sub,value,opts={}){return field(key,`sections.${spIndex}.composite.${sub}`,value,'',opts);}
const spRegionOf=c=>c&&c.region==='negative'?'negative':'positive';
const spY=(c,k)=>c['y_'+k]??c.y3;
function renderSectionDialog(){
 const dlg=$('#section-dialog');if(!dlg||spIndex===null)return;const s=model.sections[spIndex];if(!s){dlg.close();return;}
 const c=s.composite,steel=s.kind==='girder'&&c,neg=spRegionOf(c)==='negative',slab=!!(c&&c.enabled);
 let left='';
 if(steel)left+=`<div class="sp-region"><div class="segmented" role="group" aria-label="${t('spRegion')}"><button data-sp-region="positive" class="${neg?'':'active'}" aria-pressed="${!neg}">${t('spPos')}</button><button data-sp-region="negative" class="${neg?'active':''}" aria-pressed="${neg}">${t('spNegR')}</button></div><p class="help">${t(neg?'spNegHelp':'spPosHelp')}</p></div>`;
 left+=`<h3>${t('spSteel')} · ${esc(s.name)}</h3>`;
 left+=steel?`<div class="sp-grid">${['depth','web_thickness','top_width','top_thickness','bottom_width','bottom_thickness'].map(k=>field(k,`sections.${spIndex}.${k}`,s[k],'',{min:.1,max:20000})).join('')}${field('E',`sections.${spIndex}.E`,s.E,'',{min:.1,max:1000})}${spField('spFy','fy',c.fy,{min:1,max:1000})}</div>`:`<p class="help">${t('spNotGirder')}</p>`;
 if(steel){
  const ys=[['steel','spYsteel']].concat(slab?(neg?[['neg','spYneg']]:[['3n','spY3n'],['1n','spY1n']]):[]);
  left+=`<h3>${t('spYHead')}</h3><div class="sp-grid">${ys.map(([k,label])=>spField(label,'y_'+k,spY(c,k),{min:.001,max:15000})).join('')}</div>`;
  left+=`<label class="toggle-row sp-toggle"><input type="checkbox" data-sp-composite="${spIndex}" ${slab?'checked':''}>${t('spAddSlab')}</label>`;
  if(neg&&!slab)left+=`<p class="help">${t('spNegNoSlab')}</p>`;
  if(slab){
   left+=`<h3>${t(neg?'spSlabNeg':'spSlab')}</h3><div class="sp-grid">${spField('spTc','slab_thickness',c.slab_thickness,{min:1,max:2000})}${spField('spHaunch','haunch',c.haunch,{min:0,max:1000})}${spField('spBe','effective_width',c.effective_width,{min:1,max:20000})}</div>`;
   if(!neg)left+=`<h3>${t('spMaterials')}</h3><div class="sp-grid">${spField('spFc','fc',c.fc,{min:1,max:150})}${spField('spGamma','unit_weight',c.unit_weight,{min:10.01,max:40})}${spField('spFrqr','frqr',c.frqr,{min:.01,max:1})}</div>`;
   const barRow=(layer,label)=>`<div class="sp-bars"><b>${t(label)}</b>${select('spBar',`sections.${spIndex}.composite.bar_${layer}`,c['bar_'+layer],Object.keys(SP_BARS).map(k=>[k,`${k} · ${SP_BARS[k][1]} mm²`]))}${spField('spSpacing','spacing_'+layer,c['spacing_'+layer],{min:10.01,max:2000})}${spField('spCover','cover_'+layer,c['cover_'+layer],{min:0,max:500})}</div>`;
   left+=`<h3>${t('spBars')}</h3>${barRow('top','spTop')}${barRow('bottom','spBottom')}`;
  }
 }
 dlg.innerHTML=`<div class="sp-head"><span class="axle-badge">S6</span><div><b>${t('spTitle')} · ${esc(s.name)}${steel?` · ${t(neg?'spNegR':'spPos')}`:''}</b><small>${t('spAxisNote')}</small></div><button class="icon-button sp-close" data-sp-close title="${t('spClose')}">×</button></div><div class="sp-body"><div class="sp-inputs">${left}</div><div class="sp-figure" id="sp-figure"></div><div class="sp-results" id="sp-results"></div></div><details class="sp-notes"><summary>${t('spMethod')}</summary><p>${t('spMethodBody')}</p></details>`;
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
 const st=spData.steel,c=spData.composite,neg=spRegionOf(s.composite)==='negative',ng=c&&neg?c.negative:null;
 const col=c?(neg?[st,ng]:[st,c['3n'],c['1n']]):[st];const heads=c?(neg?[t('spSteelOnly'),t('spNeg')]:[t('spSteelOnly'),t('spMixed3'),t('spMixed1')]):[t('spSteelOnly')];
 const ys=c?(neg?['steel','neg']:['steel','3n','1n']):['steel'];
 const row=(label,vals,unit)=>`<tr><th>${label}</th>${vals.map(v=>`<td>${spSci(v,unit)}</td>`).join('')}</tr>`;
 let h=`<h3>${t('spResults')} · ${t(neg?'spNegR':'spPos')}</h3><table class="sp-table"><thead><tr><th></th>${heads.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>`;
 h+=row('A',col.map(x=>x.A),'mm²')+row(t('spCentroid'),col.map(x=>x.y_bottom),'mm');
 if(c&&!neg)h+=row(t('spYtopSlab'),[null,c['3n'].y_top_slab,c['1n'].y_top_slab],'mm');
 if(ng)h+=row(t('spYtopBars'),[null,ng.y_top_bars],'mm');
 h+=row(neg&&ng?'I<sub>x</sub> · I′':'I<sub>x</sub>',col.map((x,i)=>i?x.I:x.Ix),'mm⁴');
 h+=row('y (S3)',ys.map(k=>spY(s.composite,k)),'mm');
 ['S1','S2','S3','S4','S5'].forEach(k=>{if(!c&&k==='S1')return;h+=row(k,col.map(x=>x.S?.[k]??null),'mm³');});
 if(ng)h+=row(t('spBarsArea'),[null,ng.bars_area],'mm²')+row('I′ / I acier',[null,ng.ratio],'');
 h+=`</tbody></table>`;
 if(c&&!neg){h+=`<h3>${t('spEffective')} · FrQr ${fmt(s.composite.frqr,2)}</h3><table class="sp-table"><thead><tr><th></th><th>3ne</th><th>1ne</th></tr></thead><tbody>${row('I<sub>e</sub>',[c['3ne'].I,c['1ne'].I],'mm⁴')}${row('S<sub>e</sub> sup.',[c['3ne'].S_top,c['1ne'].S_top],'mm³')}${row('S<sub>e</sub> inf.',[c['3ne'].S_bot,c['1ne'].S_bot],'mm³')}</tbody></table>`;}
 h+=`<table class="sp-table sp-misc"><tbody>${row('I<sub>y</sub>',[st.Iy],'mm⁴')}${row('J',[st.J],'mm⁴')}${c&&!neg?row('J 1n',[c['1n'].J],'mm⁴'):''}${row('C<sub>w</sub>',[st.Cw],'mm⁶')}${row('Z<sub>x</sub>',[st.Zx],'mm³')}${row(t('spPna'),[st.PNA_from_bottom],'mm')}${c&&!neg?row('n = Es/Ec',[c.n],'')+row('Ec',[c.Ec],'MPa'):''}${c?row('A<sub>r</sub> sup. / inf.',[c.bars[0].area,c.bars[1].area],'mm²'):''}</tbody></table>`;
 const cls=st.classes,lim=st.limits;
 const cl=(label,[ratio,k],limits)=>`<tr><th>${label}</th><td>${fmt(ratio,1)}</td><td class="sp-class sp-class-${k}">${t('spClass')} ${k}</td><td><small>${limits.map(v=>fmt(v,1)).join(' / ')}</small></td></tr>`;
 const dc=(label,[ratio,reduced])=>`<tr><th>${label}</th><td>${fmt(ratio,1)}</td><td class="sp-class ${reduced?'sp-class-4':'sp-class-1'}">${reduced?t('spReduced'):t('spOk')}</td><td><small>${fmt(lim.web[2],1)}</small></td></tr>`;
 h+=`<h3>${t('spClasses')}</h3><table class="sp-table sp-classes"><tbody>${cl(t('spTopFlange'),cls.top_flange,lim.flange)}${cl(t('spBottomFlange'),cls.bottom_flange,lim.flange)}${cl(t('spWeb'),cls.web,lim.web)}${neg&&ng?dc(t('spWeb2dcNeg'),ng.web_2dc):dc(t('spWeb2dc'),cls.web_2dc)}</tbody></table>`;
 if(ng)h+=`<div class="sp-actions"><button data-sp-copy="negative">${t('spCopyNeg')} = ${fmt(ng.ratio,3)}</button></div>`;
 else if(c)h+=`<div class="sp-actions"><button data-sp-copy="1n">${t('spCopy1')} = ${fmt(c['1n'].I/st.Ix,3)}</button><button data-sp-copy="3n">${t('spCopy3')} = ${fmt(c['3n'].I/st.Ix,3)}</button></div>`;
 res.innerHTML=h;
}
// Cross-section drawing: true proportions, y up from the bottom of the girder.
function spSvg(s,data){
 if(!s||s.kind!=='girder')return '';
 const c=s.composite&&s.composite.enabled?s.composite:null,neg=spRegionOf(s.composite)==='negative',d=s.depth,top=c?d+c.haunch+c.slab_thickness:d;
 // A wide slab would crush the girder at true scale: it is cut (break marks)
 // at 2 × the widest flange, with be given as a dimension.
 const maxF=Math.max(s.top_width,s.bottom_width),shownB=c?Math.min(c.effective_width,2*maxF):0,cut=c&&shownB<c.effective_width;
 const W=Math.max(shownB,maxF);
 // The view box height follows the section, so the drawing fills the frame.
 const vw=330,pad=40,sc=Math.min((vw-2*pad-30)/W,520/top),vh=Math.max(300,top*sc+2*pad+14),cx=pad+10+(vw-2*pad-30)/2,Y=y=>vh-pad-y*sc,X=x=>cx+x*sc;
 let g=`<rect x="${X(-s.bottom_width/2)}" y="${Y(s.bottom_thickness)}" width="${s.bottom_width*sc}" height="${s.bottom_thickness*sc}" class="sp-steel"/><rect x="${X(-s.web_thickness/2)}" y="${Y(d-s.top_thickness)}" width="${Math.max(1,s.web_thickness*sc)}" height="${(d-s.top_thickness-s.bottom_thickness)*sc}" class="sp-steel"/><rect x="${X(-s.top_width/2)}" y="${Y(d)}" width="${s.top_width*sc}" height="${s.top_thickness*sc}" class="sp-steel"/>`;
 if(c){
  // Negative region: cracked slab drawn faded (not counted), bars only.
  g+=`<g class="${neg?'sp-cracked':''}"><rect x="${X(-s.top_width/2)}" y="${Y(d+c.haunch)}" width="${s.top_width*sc}" height="${c.haunch*sc}" class="sp-haunch"/><rect x="${X(-shownB/2)}" y="${Y(top)}" width="${shownB*sc}" height="${c.slab_thickness*sc}" class="sp-concrete"/>`;
  if(neg)for(let k=1;k<9;k++){const x=X(-shownB/2+k*shownB/9);g+=`<path d="M${x} ${Y(top)}l${(k%2?3:-3)} ${c.slab_thickness*sc*.45}l${(k%2?-4:4)} ${c.slab_thickness*sc*.3}" class="sp-crack"/>`;}
  g+=`</g>`;
  [['top',top-c.cover_top-SP_BARS[c.bar_top][0]/2,c.spacing_top],['bottom',d+c.haunch+c.cover_bottom+SP_BARS[c.bar_bottom][0]/2,c.spacing_bottom]].forEach(([_,y,sp])=>{const n=Math.max(2,Math.min(40,Math.round(shownB/sp)));for(let k=0;k<n;k++){const x=-shownB/2+(k+.5)*shownB/n;g+=`<circle cx="${X(x)}" cy="${Y(y)}" r="2.2" class="sp-bar"/>`;}});
  if(cut)[-1,1].forEach(side=>{const x=X(side*shownB/2),y0=Y(top)-3,y1=Y(d+c.haunch)+3,m=(y0+y1)/2;g+=`<path d="M${x} ${y0}L${x} ${m-4}L${x+side*4} ${m-1}L${x-side*4} ${m+1}L${x} ${m+4}L${x} ${y1}" class="sp-break"/>`;});
  g+=`<line x1="${X(-shownB/2)}" x2="${X(shownB/2)}" y1="${Y(top)-8}" y2="${Y(top)-8}" class="sp-axis"/><text x="${cx}" y="${Y(top)-11}" class="sp-dim">be = ${fmt(c.effective_width,0)} mm</text>`;
 }
 if(data){
  const comp=data.composite,cs=s.composite;
  // ENA of each configuration of the region; y axis from the main one
  // (1n, or I′ in the negative region, or the steel alone), positive downward.
  const confs=[['steel',data.steel,'sp-na-steel',t('spSteelOnly')]].concat(comp?(neg?[['neg',comp.negative,'sp-na-neg','I′']]:[['3n',comp['3n'],'sp-na-3n','3n'],['1n',comp['1n'],'sp-na-1n','1n']]):[]);
  const main=confs.at(-1);
  g+=`<line x1="${pad-6}" x2="${pad-6}" y1="${Y(main[1].y_bottom)}" y2="${Y(0)+2}" class="sp-axis" marker-end="url(#sp-arrow)"/><text x="${pad-10}" y="${Y(0)+12}" class="sp-axis-label">y</text><text x="${pad-10}" y="${Y(main[1].y_bottom)+3}" class="sp-axis-label">0</text>`;
  confs.forEach(([k,p,cls,label])=>{const y=p.y_bottom;g+=`<line x1="${pad}" x2="${vw-pad+6}" y1="${Y(y)}" y2="${Y(y)}" class="${cls}"/><text x="${vw-pad+8}" y="${Y(y)+3}" class="sp-na-label ${cls}">ANE ${label}</text>`;});
  // Usual points of the main configuration; S3 per configuration (merged
  // when they coincide).
  const pts=[];const add=(label,y)=>{const same=pts.find(p=>Math.abs(p.y-y)<.5);if(same)same.label+=' · '+(same.label.startsWith('S3')&&label.startsWith('S3 ')?label.slice(3):label);else pts.push({label,y});};
  ['S1','S2','S4','S5'].forEach(k=>{const y=k==='S1'?(comp?(neg?comp.negative.points.S1:comp['1n'].points.S1):null):k==='S2'?d:k==='S4'?s.bottom_thickness:0;if(y!==null)add(k,y);});
  confs.forEach(([k,p,_,label])=>{const y=p.y_bottom-spY(cs,k);if(y>=-1e-6&&y<=top)add(confs.length>1?`S3 ${k==='steel'?(lang==='fr'?'acier':'steel'):label}`:'S3',y);});
  // Ticks at the true heights; labels pushed apart (≥ 11 px) with a leader.
  let last=Infinity;
  pts.sort((a,b)=>a.y-b.y).forEach(({label,y})=>{const yt=Y(y),yl=Math.min(yt,last-11);last=yl;g+=`<line x1="${X(-W/2)-4}" x2="${X(-W/2)-10}" y1="${yt}" y2="${yt}" class="sp-point"/><line x1="${X(-W/2)-10}" x2="${X(-W/2)-14}" y1="${yt}" y2="${yl}" class="sp-point"/><text x="${X(-W/2)-16}" y="${yl+3}" text-anchor="end" class="sp-point-label">${esc(label)}</text>`;});
 }
 return `<svg viewBox="0 0 ${vw+48} ${vh}" class="sp-svg" role="img" aria-label="${t('spTitle')}"><defs><marker id="sp-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#5d7d8c"/></marker></defs>${g}</svg>`;
}
function sectionPropsChanged(path){if(spIndex!==null&&path.startsWith(`sections.${spIndex}.`)){if(/\.composite\.y_/.test(path))spRenderResults();spRequest();}}
document.addEventListener('click',e=>{
 const open=e.target.closest('[data-section-props]');if(open){openSectionProps(Number(open.dataset.sectionProps));return;}
 if(e.target.closest('[data-sp-close]')){$('#section-dialog')?.close();return;}
 const region=e.target.closest('[data-sp-region]');
 if(region&&spIndex!==null){const s=model.sections[spIndex];if(s.composite){s.composite.region=region.dataset.spRegion;updateProjectState();renderSectionDialog();spRequest();}return;}
 const copy=e.target.closest('[data-sp-copy]');
 if(copy&&spData?.composite){const s=model.sections[spIndex],k=copy.dataset.spCopy,ratio=k==='negative'?spData.composite.negative.ratio:spData.composite[k].I/spData.steel.Ix;s.inertia_modifier=Math.round(ratio*1000)/1000;renderInputs();changed();$('#status').textContent=`${t('spCopied')} : ${fmt(s.inertia_modifier,3)}`;renderSectionDialog();spRequest();}
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
// v0.9.5: station and S3 y set in the window, short fibre table (no slab
// faces, no bottom bars), hover preview next to the diagrams, visible entry.
Object.assign(words.fr,{stOpen:'σ Contraintes ↗',stCta:'σ Contraintes',stCtaTitle:'Ouvrir la fenêtre des contraintes sur la hauteur (station survolée, sinon M max)',stHint:'Double-cliquez un diagramme pour ouvrir la fenêtre complète des contraintes à cette station.',hoverHint:'Survolez un diagramme : valeurs et aperçu des contraintes · double-clic : fenêtre complète des contraintes',stStation:'Station x (m)',stPrev:'Station précédente',stNext:'Station suivante',stY1n:'S3 · y sous l’ANE 1n (mm)',stYsteel:'S3 · y sous l’ANE acier (mm)',stS3s:'S3 · y sous l’ANE acier',stPeekTitle:'Contraintes σ (MPa)',stPeekHint:'Double-clic : fenêtre complète (station, y de S3, étapes de chargement)',stPeekTop:'Haut acier S2',stPeekBottom:'Bas acier S5',stPeekSlab:'Dessus dalle'});
Object.assign(words.en,{stOpen:'σ Stresses ↗',stCta:'σ Stresses',stCtaTitle:'Open the stresses over the depth (hovered station, otherwise M max)',stHint:'Double-click a diagram to open the full stress window at that station.',hoverHint:'Hover a diagram: values and stress preview · double-click: full stress window',stStation:'Station x (m)',stPrev:'Previous station',stNext:'Next station',stY1n:'S3 · y below the 1n ENA (mm)',stYsteel:'S3 · y below the steel ENA (mm)',stS3s:'S3 · y below the steel ENA',stPeekTitle:'Stresses σ (MPa)',stPeekHint:'Double-click: full window (station, S3 y, load stages)',stPeekTop:'Steel top S2',stPeekBottom:'Steel bottom S5',stPeekSlab:'Top of slab'});
let stIndex=null,stData=null,stToken=0,stTimer=null,stStages={self:'steel',dead:'3n'};
const ST_HIDDEN=new Set(['slab_top','slab_bottom','bar_bottom']);
function stDialog(){
 let dlg=$('#stress-dialog');if(dlg)return dlg;
 dlg=document.createElement('dialog');dlg.id='stress-dialog';dlg.className='section-dialog stress-dialog';document.body.appendChild(dlg);
 dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});dlg.addEventListener('close',()=>{if(!dlg.open)stIndex=null;});
 return dlg;
}
function openStress(index){
 if(!result||result.kind==='thermal'||!jobId)return;
 stPeekHide();stIndex=Math.max(0,Math.min(result.x.length-1,index));const dlg=stDialog();stData=null;dlg.innerHTML='';renderStress();if(!dlg.open)dlg.showModal();stRequest();
}
const stComposites=()=>model.sections.map(s=>s.composite?clone(s.composite):null);
async function stRequest(){
 clearTimeout(stTimer);const token=++stToken;
 try{const data=await solver.request('stress',{job:jobId,index:stIndex,self_weight_stage:stStages.self,dead_stage:stStages.dead,composites:stComposites()});if(token!==stToken)return;stData=data;}
 catch(e){if(token!==stToken)return;stData={error:String(e)};}
 renderStress();
}
function stRequestSoon(){clearTimeout(stTimer);stTimer=setTimeout(stRequest,140);}
const ST_NAMES={slab_top:'stSlabTop',bar_top:'stBarTop',bar_bottom:'stBarBottom',slab_bottom:'stSlabBottom',S2:'stS2',S3:'stS3',S4:'stS4',S5:'stS5'};
const stSectionIndex=d=>d&&d.section?model.sections.findIndex(s=>s.name===d.section.name):-1;
// The window is a fixed shell (controls keep focus and the slider can be
// dragged); only the title, the control values and the body are refreshed.
function renderStress(){
 const dlg=$('#stress-dialog');if(!dlg||stIndex===null)return;
 if(!dlg.querySelector('#st-content')){
  const stageSel=(key,path,val)=>`<label class="field"><span>${t(key)}</span><select data-st-stage="${path}"><option value="steel" ${val==='steel'?'selected':''}>${t('stSteel')}</option><option value="3n" ${val==='3n'?'selected':''}>${t('st3n')}</option></select></label>`;
  dlg.innerHTML=`<div class="sp-head"><span class="axle-badge">σ</span><div><b id="st-title"></b><small>${t('stSign')}</small></div><button class="icon-button sp-close" data-st-close title="${t('spClose')}">×</button></div>
<div class="st-controls"><div class="field st-station"><span>${t('stStation')}</span><div class="st-station-row"><button class="icon-button" data-st-step="-1" title="${t('stPrev')}" aria-label="${t('stPrev')}">◀</button><input id="st-x" type="number" step="any" min="0" max="${result.x.at(-1)}"><button class="icon-button" data-st-step="1" title="${t('stNext')}" aria-label="${t('stNext')}">▶</button><input id="st-slider" type="range" min="0" max="${result.x.length-1}" step="1" aria-label="${t('stStation')}"></div></div><label class="field st-y"><span id="st-y-label">${t('stY1n')}</span><input id="st-y" type="number" min="0.001" max="15000" step="any" disabled></label>${stageSel('stSelfStage','self',stStages.self)}${stageSel('stDeadStage','dead',stStages.dead)}</div><div id="st-content"></div>`;
 }
 const x=result.x[stIndex],sec=stData&&!stData.error?stData.section:null,mx=sec?stData.cases.max:null;
 dlg.querySelector('#st-title').innerHTML=`${t('stTitle')} · x = ${fmt(x)} m${sec?` · ${esc(sec.name)} · h ${fmt(sec.depth,0)} mm`:''}`;
 const xi=dlg.querySelector('#st-x'),sl=dlg.querySelector('#st-slider'),yi=dlg.querySelector('#st-y');
 if(document.activeElement!==xi)xi.value=Number(x.toFixed(3));if(document.activeElement!==sl)sl.value=stIndex;
 if(mx){dlg.querySelector('#st-y-label').textContent=t(mx.s3_ref==='1n'?'stY1n':'stYsteel');yi.disabled=stSectionIndex(stData)<0;if(document.activeElement!==yi)yi.value=mx.s3_y??500;}
 let body;
 if(!stData)body=`<p class="help">${t('axleComputing')}</p>`;
 else if(stData.error)body=`<p class="help">${t(stData.error.includes('section_kind')?'stNotSteel':'failed')}</p>`;
 else body=stBody(stData);
 dlg.querySelector('#st-content').innerHTML=body;
}
function stBody(d){
 const mx=d.cases.max,mn=d.cases.min,mo=d.moments;
 let h='';
 if(!mx.composite){const i=stSectionIndex(d);h+=`<p class="axle-warning">⚠ ${t('stNoSlab')}${i>=0&&model.sections[i].kind==='girder'?` <button class="text-button" data-section-props="${i}">${t('stDefine')}</button>`:''}</p>`;}
 h+=`<div class="st-body"><div class="sp-figure">${stSvg(d)}</div><div>`;
 h+=`<h3>${t('stMoments')}</h3><table class="sp-table"><tbody><tr><th>${t('stSelf')} · ${t(mo.self_weight_stage==='steel'?'stSteel':'st3n')}</th><td>${fmt(mo.self_weight,1)}</td></tr><tr><th>${t('stDead')} · ${t(mo.dead_stage==='steel'?'stSteel':'st3n')}</th><td>${fmt(mo.dead,1)}</td></tr><tr><th>${t('stLiveMax')} · 1n</th><td>${fmt(mo.live_max,1)}</td></tr><tr><th>${t('stLiveMin')} · 1n</th><td>${fmt(mo.live_min,1)}</td></tr></tbody></table>`;
 const st=k=>mx.stages[k],cr=k=>st(k).cracked?` <small>(${t('stCracked')})</small>`:'';
 h+=`<h3>σ (MPa)</h3><table class="sp-table st-table"><thead><tr><th>${t('stFibre')}</th><th>${t('stSteel')}</th><th>3n${cr('3n')}</th><th>1n${cr('1n')}</th><th>${t('stCaseMax')}</th><th>${t('stCaseMin')}</th></tr></thead><tbody>`;
 [...mx.fibres].reverse().filter(f=>!ST_HIDDEN.has(f.name)).forEach(f=>{const v=(c,k)=>c.stages[k].sigma[f.name];const cell=s=>`<td class="${s>1e-9?'st-tension':s<-1e-9?'st-compression':''}">${fmt(s,1)}</td>`;const name=f.name==='S3'&&mx.s3_ref==='steel'?'stS3s':ST_NAMES[f.name]||f.name;h+=`<tr><th>${t(name)}</th>${cell(v(mx,'steel'))}${cell(v(mx,'3n'))}${cell(v(mx,'1n'))}${cell(mx.total[f.name]).replace('<td','<td data-total')}${cell(mn.total[f.name]).replace('<td','<td data-total')}</tr>`;});
 return h+`</tbody></table></div></div>`;
}
// Elastic neutral axes of the sections carrying moment at the station (each
// stage has its own: steel, 3n, 1n, or cracked under M−), merged when equal.
function stAxes(d){
 const out=[],name={steel:lang==='fr'?'acier':'steel','3n':'3n','1n':'1n'};
 [d.cases.max,d.cases.min].forEach(cs=>['steel','3n','1n'].forEach(k=>{const st=cs.stages[k];if(!st||(k!=='steel'&&Math.abs(st.M)<1e-9))return;
  const label=name[k]+(st.cracked?(lang==='fr'?' fissurée':' cracked'):''),same=out.find(a=>Math.abs(a.y-st.ybar)<1);
  if(!same)out.push({y:st.ybar,labels:[label]});else if(!same.labels.includes(label))same.labels.push(label);}));
 return out.map(a=>({y:a.y,label:`ANE ${a.labels.join(' / ')}`}));
}
// Compression (left, −) and tension (right, +) sides of the stress axis.
function stZones(ox,half,top,bottom,fs){
 return `<rect x="${ox-half}" y="${top}" width="${half}" height="${bottom-top}" class="st-zone-c"/><rect x="${ox}" y="${top}" width="${half}" height="${bottom-top}" class="st-zone-t"/><text x="${ox-6}" y="${top-4}" text-anchor="end" class="st-zone-label st-compression-text" style="font-size:${fs}px">◀ ${t('stComp')} (−)</text><text x="${ox+6}" y="${top-4}" class="st-zone-label st-tension-text" style="font-size:${fs}px">${t('stTens')} (+) ▶</text>`;
}
// Section outline and the two total stress profiles on the same height scale.
function stSvg(d){
 const mx=d.cases.max,mn=d.cases.min,s=d.section,H=mx.height,vw=540,vh=372,top=44,bot=30,sy=(vh-top-bot)/H,Y=y=>vh-bot-y*sy;
 const all=[...Object.values(mx.total),...Object.values(mn.total),1];const smax=Math.max(...all.map(Math.abs));
 const ox=345,half=180,SX=v=>ox+v/smax*half*.9;
 const c=s.composite&&s.composite.enabled?s.composite:null,d0=s.depth,w=Math.max(s.top_width,s.bottom_width,c?Math.min(c.effective_width,2.6*Math.max(s.top_width,s.bottom_width)):0),sx=Math.min(120/w,sy),cx=88,X=v=>cx+v*sx;
 let g=stZones(ox,half,top-10,vh-bot+6,10.5)+`<rect x="${X(-s.bottom_width/2)}" y="${Y(s.bottom_thickness)}" width="${s.bottom_width*sx}" height="${s.bottom_thickness*sy}" class="sp-steel"/><rect x="${X(-s.web_thickness/2)}" y="${Y(d0-s.top_thickness)}" width="${Math.max(1,s.web_thickness*sx)}" height="${(d0-s.top_thickness-s.bottom_thickness)*sy}" class="sp-steel"/><rect x="${X(-s.top_width/2)}" y="${Y(d0)}" width="${s.top_width*sx}" height="${s.top_thickness*sy}" class="sp-steel"/>`;
 if(c&&mx.composite){const bw=Math.min(c.effective_width,2.6*Math.max(s.top_width,s.bottom_width));g+=`<rect x="${X(-s.top_width/2)}" y="${Y(d0+c.haunch)}" width="${s.top_width*sx}" height="${c.haunch*sy}" class="sp-haunch"/><rect x="${X(-bw/2)}" y="${Y(H)}" width="${bw*sx}" height="${c.slab_thickness*sy}" class="sp-concrete"/>`;}
 g+=`<line x1="${ox}" x2="${ox}" y1="${top-10}" y2="${vh-bot+6}" class="sp-axis"/><text x="${ox}" y="${vh-8}" class="sp-dim">0</text><text x="${ox+half*.9}" y="${vh-8}" class="sp-dim">+${fmt(smax,0)} MPa</text><text x="${ox-half*.9}" y="${vh-8}" class="sp-dim">−${fmt(smax,0)}</text>`;
 const by=Object.fromEntries(mx.fibres.map(f=>[f.name,f.y]));
 // One continuous outline per case, starting from σ = 0 at the bottom: steel
 // bottom → top, back to 0, then the slab (concrete) bottom → top, back to 0.
 [[mn,'st-min'],[mx,'st-max']].forEach(([cs,cls])=>{
  let path=`M${ox} ${Y(0)}L${SX(cs.total.S5)} ${Y(0)}L${SX(cs.total.S2)} ${Y(d0)}L${ox} ${Y(d0)}`;
  if(cs.composite)path+=`L${ox} ${Y(by.slab_bottom)}L${SX(cs.total.slab_bottom)} ${Y(by.slab_bottom)}L${SX(cs.total.slab_top)} ${Y(by.slab_top)}L${ox} ${Y(by.slab_top)}`;
  g+=`<path d="${path}" class="${cls} st-area"/>`;
 });
 // Neutral axes: dashed from the section across the stress diagram.
 let last=-Infinity;
 stAxes(d).sort((a,b)=>b.y-a.y).forEach(a=>{const yy=Y(a.y),yl=Math.max(yy-3,last+11);last=yl;g+=`<line x1="${X(-w/2)-6}" x2="${ox+half}" y1="${yy}" y2="${yy}" class="st-ena"/><text x="${ox+half-2}" y="${yl}" text-anchor="end" class="st-ena-label">${esc(a.label)}</text>`;});
 [['S5',mx],['S2',mx]].concat(mx.composite?[['slab_top',mx]]:[]).forEach(([k])=>{g+=`<text x="${SX(mx.total[k])+(mx.total[k]>=0?4:-4)}" y="${Y(by[k])-3}" text-anchor="${mx.total[k]>=0?'start':'end'}" class="st-label st-max-text">${fmt(mx.total[k],0)}</text>`;});
 g+=`<text x="6" y="14" class="st-legend st-max-text">— ${t('stCaseMax')}</text><text x="6" y="28" class="st-legend st-min-text">— ${t('stCaseMin')}</text>`;
 return `<svg viewBox="0 0 ${vw} ${vh}" class="sp-svg" role="img" aria-label="${t('stTitle')}">${g}</svg>`;
}
// --- Hover preview (v0.9.5) ---------------------------------------------------
// Moving over the envelope diagrams shows a small stress profile at the
// station, on the side of the diagrams away from the cursor. Results are
// cached per station and settings; requests are debounced.
let stPeekIndex=null,stPeekTimer=null,stPeekToken=0,stLastHover=null;const stPeekCache=new Map();
function stPeekEl(){
 let el=$('#st-peek');if(el)return el;const host=$('#diagrams-view');if(!host)return null;
 el=document.createElement('div');el.id='st-peek';el.className='st-peek';el.setAttribute('aria-hidden','true');host.appendChild(el);return el;
}
function stPeekHide(){clearTimeout(stPeekTimer);stPeekIndex=null;const el=$('#st-peek');if(el)el.classList.remove('show');}
function stPeekKey(i){return `${jobId}|${i}|${stStages.self}|${stStages.dead}|${JSON.stringify(stComposites())}`;}
function stPeek(i,e){
 if(!result||result.kind==='thermal'||!jobId||display!=='envelope'||(typeof deltaActive==='function'&&deltaActive())||$('#stress-dialog')?.open){stPeekHide();return;}
 stLastHover=i;const el=stPeekEl();if(!el)return;
 const host=$('#diagrams-view'),charts=$('#charts'),hr=host.getBoundingClientRect(),cr=charts.getBoundingClientRect();
 // Opposite side of the cursor, aligned with the top of the diagrams.
 const right=e.clientX-hr.left<hr.width*.55;el.style.top=`${cr.top-hr.top+4}px`;el.style.left=right?'':'104px';el.style.right=right?'10px':'';
 if(stPeekIndex===i&&el.classList.contains('show'))return;stPeekIndex=i;
 const key=stPeekKey(i),hit=stPeekCache.get(key);
 if(hit){stPeekRender(el,hit,i);return;}
 if(!el.classList.contains('show')||!el.innerHTML){el.innerHTML=`<div class="st-peek-head"><b>${t('stPeekTitle')}</b><span>x = ${fmt(result.x[i])} m</span></div><p class="help">${t('axleComputing')}</p><p class="st-peek-hint">${t('stPeekHint')}</p>`;el.classList.add('show');}
 clearTimeout(stPeekTimer);const token=++stPeekToken;
 stPeekTimer=setTimeout(async()=>{let data;try{data=await solver.request('stress',{job:jobId,index:i,self_weight_stage:stStages.self,dead_stage:stStages.dead,composites:stComposites()});}catch(err){data={error:String(err)};}
  if(stPeekCache.size>500)stPeekCache.clear();stPeekCache.set(key,data);if(token===stPeekToken&&stPeekIndex===i)stPeekRender(el,data,i);},90);
}
function stPeekRender(el,d,i){
 let h=`<div class="st-peek-head"><b>${t('stPeekTitle')}</b><span>x = ${fmt(result.x[i])} m${d&&d.section?` · ${esc(d.section.name)}`:''}</span></div>`;
 if(!d||d.error)h+=`<p class="help">${t(d&&d.error&&d.error.includes('section_kind')?'stNotSteel':'failed')}</p>`;
 else{
  const mx=d.cases.max,mn=d.cases.min,cell=v=>`<td class="${v>1e-9?'st-tension':v<-1e-9?'st-compression':''}">${fmt(v,0)}</td>`;
  const rows=[['slab_top','stPeekSlab'],['S2','stPeekTop'],['S5','stPeekBottom']].filter(([k])=>k in mx.total);
  h+=`<div class="st-peek-svg">${stMini(d)}</div><table class="st-peek-table"><thead><tr><th></th><th>M max</th><th>M min</th></tr></thead><tbody>${rows.map(([k,l])=>`<tr><th>${t(l)}</th>${cell(mx.total[k])}${cell(mn.total[k])}</tr>`).join('')}</tbody></table>`;
 }
 el.innerHTML=h+`<p class="st-peek-hint">${t('stPeekHint')}</p>`;el.classList.add('show');
}
// Compact profile: section outline on the left, M max / M min totals.
function stMini(d){
 const mx=d.cases.max,mn=d.cases.min,s=d.section,H=mx.height,vw=300,vh=184,pad=16,top=28,sy=(vh-top-pad)/H,Y=y=>vh-pad-y*sy;
 const smax=Math.max(1,...[...Object.values(mx.total),...Object.values(mn.total)].map(Math.abs)),ox=180,half=105,SX=v=>ox+v/smax*half*.92;
 const c=mx.composite&&s.composite?s.composite:null,d0=s.depth,w=Math.max(s.top_width,s.bottom_width,c?Math.min(c.effective_width,2*Math.max(s.top_width,s.bottom_width)):0),sx=Math.min(64/w,sy),cx=40,X=v=>cx+v*sx;
 let g=`<rect x="${X(-s.bottom_width/2)}" y="${Y(s.bottom_thickness)}" width="${s.bottom_width*sx}" height="${s.bottom_thickness*sy}" class="sp-steel"/><rect x="${X(-s.web_thickness/2)}" y="${Y(d0-s.top_thickness)}" width="${Math.max(1,s.web_thickness*sx)}" height="${(d0-s.top_thickness-s.bottom_thickness)*sy}" class="sp-steel"/><rect x="${X(-s.top_width/2)}" y="${Y(d0)}" width="${s.top_width*sx}" height="${s.top_thickness*sy}" class="sp-steel"/>`;
 if(c){const bw=Math.min(c.effective_width,2*Math.max(s.top_width,s.bottom_width));g+=`<rect x="${X(-bw/2)}" y="${Y(H)}" width="${bw*sx}" height="${c.slab_thickness*sy}" class="sp-concrete"/>`;}
 g=stZones(ox,half,top-6,vh-pad+4,10)+g+`<line x1="${ox}" x2="${ox}" y1="${top-6}" y2="${vh-pad+4}" class="sp-axis"/>`;
 const by=Object.fromEntries(mx.fibres.map(f=>[f.name,f.y]));
 [[mn,'st-min'],[mx,'st-max']].forEach(([cs,cls])=>{
  let path=`M${ox} ${Y(0)}L${SX(cs.total.S5)} ${Y(0)}L${SX(cs.total.S2)} ${Y(d0)}L${ox} ${Y(d0)}`;
  if(cs.composite)path+=`L${ox} ${Y(by.slab_bottom)}L${SX(cs.total.slab_bottom)} ${Y(by.slab_bottom)}L${SX(cs.total.slab_top)} ${Y(by.slab_top)}L${ox} ${Y(by.slab_top)}`;
  g+=`<path d="${path}" class="${cls} st-mini-area"/>`;
 });
 let last=-Infinity;
 stAxes(d).sort((a,b)=>b.y-a.y).forEach(a=>{const yy=Y(a.y),yl=Math.max(yy-2,last+9);last=yl;g+=`<line x1="${X(-w/2)}" x2="${ox+half}" y1="${yy}" y2="${yy}" class="st-ena"/><text x="${X(w/2)+3}" y="${yl}" class="st-ena-label" style="font-size:8.5px">${esc(a.label)}</text>`;});
 return `<svg viewBox="0 0 ${vw} ${vh}" class="sp-svg" role="img" aria-label="${t('stTitle')}">${g}<text x="${ox+half*.92}" y="${vh-3}" class="sp-dim">+${fmt(smax,0)}</text><text x="${ox-half*.92}" y="${vh-3}" class="sp-dim">−${fmt(smax,0)}</text></svg>`;
}
// Visible entry point next to the display modes.
function stCtaInstall(){
 const host=$('#display-controls .display-left');if(!host||$('#stress-cta'))return;
 const b=document.createElement('button');b.id='stress-cta';b.className='st-cta';b.type='button';host.appendChild(b);stCtaText();
}
function stCtaText(){const b=$('#stress-cta');if(b){b.textContent=`${t('stCta')} ↗`;b.title=t('stCtaTitle');}}
stCtaInstall();
const stTranslate=typeof translate==='function'?translate:null;
if(stTranslate)translate=function(){const r=stTranslate.apply(this,arguments);stCtaText();return r;};
$('#charts')?.addEventListener('pointerleave',stPeekHide);
document.addEventListener('click',e=>{
 const open=e.target.closest('[data-stress-index]');if(open){openStress(Number(open.dataset.stressIndex));return;}
 if(e.target.closest('#stress-cta')){if(!result||result.kind==='thermal'||!jobId){$('#status').textContent=t('stNotSteel');return;}const M=result.max.M.map((v,k)=>Math.max(Math.abs(v),Math.abs(result.min.M[k])));openStress(stLastHover??M.indexOf(Math.max(...M)));return;}
 const step=e.target.closest('[data-st-step]');if(step&&stIndex!==null){stIndex=Math.max(0,Math.min(result.x.length-1,stIndex+Number(step.dataset.stStep)));renderStress();stRequestSoon();return;}
 if(e.target.closest('[data-st-close]')){$('#stress-dialog')?.close();}
});
document.addEventListener('input',e=>{if(e.target.id==='st-slider'&&stIndex!==null){stIndex=Number(e.target.value);renderStress();stRequestSoon();}});
document.addEventListener('change',e=>{
 const sel=e.target.closest?.('[data-st-stage]');if(sel){stStages[sel.dataset.stStage]=sel.value;stRequest();return;}
 if(e.target.id==='st-x'&&stIndex!==null&&e.target.validity.valid&&e.target.value!==''){stIndex=nearest(Number(e.target.value));e.target.blur();renderStress();stRequest();return;}
 if(e.target.id==='st-y'&&stData&&!stData.error&&e.target.validity.valid&&e.target.value!==''){
  const i=stSectionIndex(stData);if(i<0)return;const s=model.sections[i];if(!s.composite)s.composite={...spDefaults(),enabled:false};
  s.composite[stData.cases.max.s3_ref==='1n'?'y_1n':'y_steel']=Number(e.target.value);updateProjectState();stRequest();
 }
});
document.addEventListener('dblclick',e=>{
 const svg=e.target.closest?.('#charts svg.plot');if(!svg||svg.classList.contains('delta-plot')||!result||result.kind==='thermal')return;
 clearTimeout(window.qbClickTimer);
 const rect=svg.getBoundingClientRect(),x=Math.max(0,Math.min(1,((e.clientX-rect.left)/rect.width*926-26)/874))*result.x.at(-1);
 openStress(nearest(x));
});
Object.assign(words.fr,{stComp:'Compression',stTens:'Traction'});Object.assign(words.en,{stComp:'Compression',stTens:'Tension'});
