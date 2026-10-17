"use strict";
// Shared helpers: number inputs (QuickerUnits style), floating windows, menus, accessibility, errors.

// French by default (v0.9.5: new key, older stored choices are dropped).
// v0.9.96: a saved choice first, else the browser languages (French by default).
function initialLanguage(){let saved=null;try{saved=localStorage.getItem("qb-language-v095");}catch(e){}if(saved==="en"||saved==="fr")return saved;const list=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||""]).map(l=>String(l).toLowerCase().slice(0,2));return list.find(l=>l==="fr"||l==="en")||"fr";}
// v0.9.8: numeric inputs in the QuickerUnits style. Every <input type=number>
// becomes a text box: localized display (FR "1 234,5"), a typed calculation
// ("2*17,4", "(3+4)/2", "1,2e3") is evaluated, highlighted while edited.
function qbParse(raw){
 let s=String(raw??'').trim();if(!s)return null;
 s=s.replace(/[\s  ']/g,'').replace(/[−–]/g,'-').replace(/[×x·]/gi,'*').replace(/÷/g,'/').replace(/\*\*/g,'^');
 // Comma: decimal separator in French, thousands separator in English.
 s=lang==='fr'?s.replace(/,/g,'.'):s.replace(/,/g,'');
 let i=0;const peek=()=>s[i];
 const num=()=>{const m=/^(\d+\.?\d*|\.\d+)(e[-+]?\d+)?/i.exec(s.slice(i));if(!m)throw 0;i+=m[0].length;return parseFloat(m[0]);};
 const primary=()=>{if(peek()==='('){i++;const v=expr();if(peek()!==')')throw 0;i++;return v;}if(/^pi/i.test(s.slice(i))){i+=2;return Math.PI;}if(peek()==='π'){i++;return Math.PI;}return num();};
 const unary=()=>peek()==='-'?(i++,-unary()):peek()==='+'?(i++,unary()):power();
 const power=()=>{const b=primary();if(peek()==='^'){i++;return Math.pow(b,unary());}return b;};
 const term=()=>{let v=unary();while(peek()==='*'||peek()==='/'){const op=s[i++],r=unary();v=op==='*'?v*r:v/r;}return v;};
 const expr=()=>{let v=term();while(peek()==='+'||peek()==='-'){const op=s[i++],r=term();v=op==='+'?v+r:v-r;}return v;};
 try{const v=expr();return i===s.length&&Number.isFinite(v)?v:NaN;}catch{return NaN;}
}
function qbFmtInput(v){
 if(v===null||v===undefined||v===''||!Number.isFinite(Number(v)))return '';
 const n=Number(v),a=Math.abs(n);if(a&&(a>=1e15||a<1e-6))return n.toExponential().replace('.',lang==='fr'?',':'.');
 return n.toLocaleString(lang==='fr'?'fr-CA':'en-CA',{maximumFractionDigits:10,useGrouping:a>=1e4});
}
function numValue(el){if(el.type==='number')return el.value===''?NaN:Number(el.value);const v=qbParse(el.value);return v===null?NaN:v;}
function qbCheck(el){
 const v=qbParse(el.value),min=el.dataset.min===''||el.dataset.min===undefined?-Infinity:Number(el.dataset.min),max=el.dataset.max===''||el.dataset.max===undefined?Infinity:Number(el.dataset.max);
 // A disabled field is barred from validation: never paint it as an error.
 const bad=!el.disabled&&(v===null||Number.isNaN(v)||v<min||v>max);
 el.setCustomValidity(bad?(v===null||Number.isNaN(v)?t('numInvalid'):`${t('numRange')} ${qbFmtInput(min===-Infinity?null:min)||'−∞'} … ${qbFmtInput(max===Infinity?null:max)||'∞'}`):'');
 el.title=bad?el.validationMessage:'';el.classList.toggle('num-err',bad);el.setAttribute('aria-invalid',String(bad));if(typeof qbTip==='function')qbTip(el);return bad?NaN:v;
}
function qbEnhance(root=document){
 root.querySelectorAll?.('input[type="number"]:not(#position)').forEach(el=>{
  const v=el.value;el.dataset.min=el.getAttribute('min')??'';el.dataset.max=el.getAttribute('max')??'';
  el.type='text';el.inputMode='decimal';el.autocomplete='off';el.spellcheck=false;el.classList.add('qb-num');
  el.value=v===''?'':qbFmtInput(Number(v));qbCheck(el);
 });
}
function qbFloat(dlg){
 dlg.classList.add('qb-float');
 if(!dlg.open){
  dlg.show();
  const w=Math.min(dlg.offsetWidth||900,innerWidth-16),off=(qbFloatCount++%4)*24;
  dlg.style.left=`${Math.max(8,(innerWidth-w)/2+off)}px`;dlg.style.top=`${Math.max(8,56+off)}px`;
 }
 dlg.style.zIndex=++qbFloatZ;
}
function showError(message,transient=false){const box=$('#error');box.textContent=message;box.classList.remove('hidden');clearTimeout(errorTimer);if(transient)errorTimer=setTimeout(()=>box.classList.add('hidden'),6000);}
function closeMenus(except=null){$$('.qb-menu.open').forEach(m=>{if(m!==except){m.classList.remove('open');m.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded','false');}});}
function qbStore(fn){try{return fn(localStorage)}catch(e){return null}}
// --- Inline message under an invalid number field ------------------------------
function qbTip(el){
 let tip=$('#qb-num-tip');
 const show=el&&el===document.activeElement&&el.classList.contains('num-err')&&el.validationMessage;
 if(!show){if(el)el.removeAttribute('aria-describedby');if(tip&&(!el||el===document.activeElement))tip.hidden=true;return;}
 if(!tip){tip=document.createElement('div');tip.id='qb-num-tip';tip.setAttribute('role','alert');}
 const dlg=el.closest('dialog')||document.body;if(tip.parentNode!==dlg)dlg.append(tip);
 tip.textContent=el.validationMessage;tip.hidden=false;el.setAttribute('aria-describedby','qb-num-tip');
 const r=el.getBoundingClientRect(),w=Math.min(300,innerWidth-16);tip.style.maxWidth=`${w}px`;
 tip.style.left=`${Math.max(8,Math.min(r.left,innerWidth-w-8))}px`;tip.style.top=`${r.bottom+5}px`;
}
// Rounded up in magnitude: 5 675,4 → 5 676; −6 405,9 → −6 406; 243,89 → 243,9.
function qbCeil(v,dec=0){const p=10**dec,a=Math.abs(v)*p;return Math.sign(v)*Math.ceil(a-1e-9*Math.max(1,a))/p;}
function qbInk(c){return QB_INK[String(c).toLowerCase()]||c;}
// Selected state follows the visual state: aria-pressed on segmented buttons,
// aria-selected and a roving tab stop on tabs.
function qbSyncAria(){
 $$('#load-mode button,#display-mode button').forEach(b=>b.setAttribute('aria-pressed',String(b.classList.contains('active'))));
 $$('.input-tabs,.view-tabs').forEach(list=>{const tabs=[...list.querySelectorAll('button')];const any=tabs.some(b=>b.classList.contains('active'));tabs.forEach((b,i)=>{const on=b.classList.contains('active')||(!any&&i===0);b.setAttribute('role','tab');b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;});});
 $$('.view-tabs button').forEach(b=>b.setAttribute('aria-controls',`${b.dataset.view}-view`));
 $$('.input-tabs button').forEach(b=>b.setAttribute('aria-controls','input-content'));
}
// File and Examples menus: menu-button pattern.
function qbMenuItems(menu){return [...menu.querySelectorAll('.menu-pop [role="menuitem"]')].filter(b=>!b.disabled&&b.offsetParent!==null);}
function qbMenuOpen(menu,focus){const tg=menu.querySelector('[data-menu-toggle]');if(!menu.classList.contains('open'))tg.click();setTimeout(()=>{const it=qbMenuItems(menu);(focus==='last'?it.at(-1):it[0])?.focus();},0);}
function qbEdge(dlg,e){const r=dlg.getBoundingClientRect();let s='';if(e.clientY-r.top<QB_EDGE)s+='n';else if(r.bottom-e.clientY<QB_EDGE)s+='s';if(e.clientX-r.left<QB_EDGE)s+='w';else if(r.right-e.clientX<QB_EDGE)s+='e';return s;}
// ---- v1.0 (feedback V1.0) ------------------------------------------------------
// Floating windows stay inside the screen: when their content grows (a slab
// switched on, a longer sheet) or the window shrinks, they slide back up so
// their bottom edge stays visible; the height is capped by CSS and the body
// scrolls.
function qbKeepInView(dlg){
 if(!dlg?.open||dlg.classList.contains('dragging')||dlg.classList.contains('resizing'))return;
 const r=dlg.getBoundingClientRect(),m=8;
 if(r.bottom>innerHeight-m)dlg.style.top=`${Math.max(m,innerHeight-m-r.height)}px`;
 if(r.right>innerWidth-m)dlg.style.left=`${Math.max(m,innerWidth-m-r.width)}px`;
}
