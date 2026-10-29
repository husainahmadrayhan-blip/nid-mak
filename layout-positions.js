(()=>{'use strict';
const STORAGE='visual-editor:permanent-layout:v1';
const props=['position','left','top','right','bottom','width','height','fontSize','fontFamily','fontWeight','letterSpacing','webkitTextStroke','color','opacity','zIndex','objectFit','transform'];
const special=['field-name-bn','field-name-en','field-father-bn','field-mother-bn','field-dob-en','field-id-en','field-address-bn','field-birth-place','field-blood-en','field-issue-date-bn'];
function selector(el){
 if(el.getAttribute('data-image-role'))return '[data-image-role="'+CSS.escape(el.getAttribute('data-image-role'))+'"]';
 if(el.dataset.field)return '[data-field="'+CSS.escape(el.dataset.field)+'"]';
 for(const c of special)if(el.classList.contains(c))return '.'+c;
 if(el.id)return '#'+CSS.escape(el.id);
 if(el.hasAttribute('data-new-editor-text')){
   const parent=el.parentElement;
   if(!parent)return null;
   const same=[...parent.children].filter(x=>x.hasAttribute('data-new-editor-text'));
   const idx=same.indexOf(el)+1;
   const parentKey=parent.id?'#'+CSS.escape(parent.id):(parent.dataset.field?'[data-field="'+CSS.escape(parent.dataset.field)+'"]':parent.tagName.toLowerCase());
   return parentKey+' > [data-new-editor-text]:nth-child('+([...parent.children].indexOf(el)+1)+')';
 }
 return null;
}
function roleOf(el){
 const existing=(el.getAttribute('data-image-role')||'').toLowerCase();
 if(existing==='fingerprint'||existing==='signature'||existing==='photo')return existing;
 const hint=[el.getAttribute('alt'),el.getAttribute('title'),el.getAttribute('aria-label'),el.id,el.className,el.getAttribute('src')].filter(Boolean).join(' ').toLowerCase();
 if(/finger|print|biometric|আঙুল|ফিঙ্গার/.test(hint))return 'fingerprint';
 if(/signature|sign(?:ature)?|স্বাক্ষর|সাইন/.test(hint))return 'signature';
 if(/\bphoto\b|portrait|profile/.test(hint))return 'photo';
 return '';
}
function normalizeRoles(){if(!doc)return;for(const el of doc.querySelectorAll('img,[role="img"]')){const role=roleOf(el);if(role&&!el.hasAttribute('data-image-role'))el.setAttribute('data-image-role',role)}}
function roleKey(role){return '__image_role__:'+role}
function snapshot(){const data={};if(!doc)return data;normalizeRoles();for(const el of doc.body.querySelectorAll('*')){const key=selector(el);if(!key)continue;const styles={};for(const prop of props){const v=el.style[prop];if(v)styles[prop]=v}if(Object.keys(styles).length){data[key]=styles;const role=roleOf(el);if(role)data[roleKey(role)]={...styles}}}return data}
function readEmbedded(){try{return JSON.parse(doc?.body?.getAttribute('data-permanent-layout')||'{}')}catch(_){return {}}}
function getSaved(){let local={};try{local=JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch(_){}return {...local,...readEmbedded()}}
function save(){if(!doc)return;try{normalizeRoles();const merged={...readEmbedded(),...JSON.parse(localStorage.getItem(STORAGE)||'{}'),...snapshot()};for(const role of ['fingerprint','signature','photo']){const el=[...doc.querySelectorAll('[data-image-role]')].find(x=>roleOf(x)===role);if(el){const styles={};for(const prop of props){const v=el.style[prop];if(v)styles[prop]=v}if(Object.keys(styles).length)merged[roleKey(role)]=styles;}}
 localStorage.setItem(STORAGE,JSON.stringify(merged));doc.body.setAttribute('data-permanent-layout',JSON.stringify(merged));notice('Fingerprint ও Signature-এর আলাদা Position/Rotation HTML-এ Save হয়েছে ✓')}catch(e){notice('Layout save failed: '+e.message)}}
function notice(t){const n=document.getElementById('layout-status');if(n)n.textContent=t}
function apply(el){const data=getSaved();const role=roleOf(el);const key=selector(el);const styles=(role&&data[roleKey(role)])||data[key];if(!styles)return;for(const [prop,v] of Object.entries(styles))if(props.includes(prop))el.style[prop]=v}
function enforceTargetFontSizes(){if(!doc)return;for(const el of doc.querySelectorAll('.field-name-bn,.field-name-en')){el.style.setProperty('font-size','32px','important');el.style.setProperty('-webkit-text-size-adjust','none');el.style.setProperty('text-size-adjust','none')}for(const el of doc.querySelectorAll('.field-dob-en,.field-id-en')){el.style.setProperty('font-size','21px','important');el.style.setProperty('-webkit-text-size-adjust','none');el.style.setProperty('text-size-adjust','none')}for(const el of doc.querySelectorAll('.field-issue-date-bn')){el.style.setProperty('font-size','18px','important');el.style.setProperty('-webkit-text-size-adjust','none');el.style.setProperty('text-size-adjust','none')}}
window.applySavedLayoutToElement=apply;
function restore(){if(!doc)return;normalizeRoles();const data=getSaved();for(const el of doc.body.querySelectorAll('*')){const role=roleOf(el);if(role&&data[roleKey(role)]){for(const [prop,v] of Object.entries(data[roleKey(role)]))if(props.includes(prop))el.style[prop]=v;continue;}apply(el)}enforceTargetFontSizes();notice('সেভ করা Fingerprint/Signature Position প্রয়োগ হয়েছে ✓')}
window.flushPermanentLayout=save;
const button=document.createElement('button');button.type='button';button.id='layout-save';button.textContent='📌 Save Positions Permanently';button.onclick=save;document.querySelector('header').append(button);
const indicator=document.createElement('span');indicator.id='layout-status';indicator.style.cssText='font-size:12px;color:#b9dfc6';indicator.textContent='Drag করে পজিশন ঠিক করুন—Auto Save চালু';document.querySelector('header').append(indicator);
const oldLoad=load;load=async function(files){await oldLoad(files);restore();if(doc)render()};
const oldRender=render;render=function(...args){if(doc)restore();return oldRender(...args)};
let timer;function soon(){clearTimeout(timer);timer=setTimeout(save,450)}
const oldUpdate=update;update=function(...args){oldUpdate(...args);soon()};
const oldStyle=styleSelected;styleSelected=function(...args){oldStyle(...args);soon()};
document.addEventListener('change',e=>{if(['x','y','font','width','height','family','weight','color','spacing'].includes(e.target.id))soon()});
document.addEventListener('pointerup',()=>{if(doc)soon()});
window.addEventListener('beforeunload',()=>{if(doc)save()});
})();