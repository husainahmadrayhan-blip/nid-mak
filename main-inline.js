
// Offline bundled JSZip is loaded below if CDN unavailable.



const $=id=>document.getElementById(id),stage=$('stage'),fileMap=new Map();let doc=null,selected=null,history=[],future=[],currentHtml='index.html',cssPaths=[],backgroundName=null,drag=null;let autoFit=true;let fitRequest=0;
function status(s){$('status').textContent=s}function snap(){if(!doc)return;history.push(new XMLSerializer().serializeToString(doc));if(history.length>80)history.shift();future=[]}function restore(s){doc=new DOMParser().parseFromString(s,'text/html');render()}
$('undo').onclick=()=>{if(!history.length||!doc)return;future.push(new XMLSerializer().serializeToString(doc));restore(history.pop())};$('redo').onclick=()=>{if(!future.length||!doc)return;history.push(new XMLSerializer().serializeToString(doc));restore(future.pop())};
function findPath(name){const names=[...fileMap.keys()];return names.find(x=>x===name)||names.find(x=>x.endsWith('/'+name))||names.find(x=>x.split('/').pop()===name.split('/').pop())}
function pathResolve(base,rel){let p=rel.split('?')[0].split('#')[0].replace(/^\.\//,'');let parts=base.split('/');parts.pop();for(let s of p.split('/')){if(s==='..')parts.pop();else if(s&&s!=='.')parts.push(s)}return parts.join('/')}
function asset(base,url){if(!url||/^(data:|blob:|https?:|#)/i.test(url))return url;let name=findPath(pathResolve(base,url))||findPath(url);let v=name&&fileMap.get(name);return v?.url||url}
function resolveCssUrls(css,base){return css.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi,(match,q,raw)=>{const u=raw.trim();if(!u||/^(data:|blob:|https?:|#)/i.test(u))return match;const resolved=asset(base,u);if(resolved===u&&!findPath(pathResolve(base,u))&&!findPath(u)){missingAssets.add(u);return match;}return 'url("'+resolved+'")';});}
let missingAssets=new Set();
function collectStyle(){let css='';cssPaths=[];missingAssets.clear();for(let link of doc.querySelectorAll('link[rel="stylesheet"]')){let href=link.getAttribute('href');let p=findPath(pathResolve(currentHtml,href||''));if(p){cssPaths.push(p);css+='\n'+resolveCssUrls(fileMap.get(p).text,p)+'\n'}else if(href)missingAssets.add(href)}for(let st of doc.querySelectorAll('style'))css+='\n'+resolveCssUrls(st.textContent,currentHtml)+'\n';return css}
function render(){selected=null;drag=null;stage.replaceChildren();if(!doc)return;let style=document.createElement('style');style.textContent=collectStyle();stage.append(style);
let body=doc.body.cloneNode(true);body.querySelectorAll('script,iframe,object,embed').forEach(e=>e.remove());
 // Hide the Format → HTML Auto Fill block from the rendered main preview on mobile.
 // It lives inside the loaded project HTML, so this must run on every render().
 if(window.matchMedia('(max-width: 800px)').matches){
   const all=[...body.querySelectorAll('*')];
   const parse=all.find(el=>el.children.length===0&&/normal\s*parse/i.test((el.textContent||'').trim()));
   const apply=all.find(el=>el.children.length===0&&/apply\s*to\s*html/i.test((el.textContent||'').trim()));
   if(parse&&apply){
     let block=parse;
     while(block&&block!==body&&!(block.contains(apply)&&block.querySelectorAll('textarea').length>=1))block=block.parentElement;
     if(block&&block!==body)block.remove();
   }
   // Fallback for projects where the format panel is identified by its heading.
   if(!parse||!apply){
     const heading=all.find(el=>el.children.length===0&&/format\s*[→>-]\s*html\s*auto\s*fill/i.test((el.textContent||'').trim()));
     if(heading){
       let block=heading;
       while(block&&block!==body&&block.querySelectorAll('textarea').length<1)block=block.parentElement;
       if(block&&block!==body)block.remove();
     }
   }
 }let sourceNodes=[...doc.body.querySelectorAll('*')],targetNodes=[...body.querySelectorAll('*')];body.setAttribute('data-editor-root','');stage.append(body);stage.style.width='auto';stage.style.height='auto';let sw=parseFloat(getComputedStyle(body).width),sh=parseFloat(getComputedStyle(body).height);const originalWidth=sw,originalHeight=sh;if(!Number.isFinite(sw)||sw<200||sw>10000)sw=800;if(!Number.isFinite(sh)||sh<100||sh>10000)sh=500;const bg=body.querySelector('img');if(bg){const iw=parseFloat(bg.getAttribute('width'))||0,ih=parseFloat(bg.getAttribute('height'))||0;if(iw>sw&&iw<=10000)sw=iw;if(ih>sh&&ih<=10000)sh=ih;}const sized=[...body.querySelectorAll('*')].filter(e=>e!==bg);for(const e of sized){const cs=getComputedStyle(e);const left=parseFloat(cs.left),top=parseFloat(cs.top),w=parseFloat(cs.width),h=parseFloat(cs.height);if(cs.position==='absolute'&&Number.isFinite(left)&&Number.isFinite(w))sw=Math.max(sw,left+w);if(cs.position==='absolute'&&Number.isFinite(top)&&Number.isFinite(h))sh=Math.max(sh,top+h);}sw=Math.min(10000,Math.ceil(sw));sh=Math.min(10000,Math.ceil(sh));stage.style.width=sw+'px';stage.style.height=sh+'px';body.style.width='100%';body.style.height='100%';body.style.margin='0';body.style.position='relative';body.style.overflow='hidden';body.querySelectorAll('[data-new-editor-text]').forEach(e=>{e.style.zIndex='9999';e.style.pointerEvents='auto'});
let all=[body,...targetNodes];for(let el of all){for(let attr of ['src','poster'])if(el.hasAttribute(attr))el.setAttribute(attr,asset(currentHtml,el.getAttribute(attr)));if(el.hasAttribute('style'))el.style.backgroundImage=resolveCssUrls(el.style.backgroundImage,currentHtml)}
let nodes=[...body.querySelectorAll('*')];nodes.forEach((el,i)=>{if(!['SCRIPT','STYLE','LINK','META','BR'].includes(el.tagName)&&!el.closest('[data-editor-ignore]')){el.dataset.editorIndex=i;el.addEventListener('pointerdown',e=>startDrag(e,el));}});body.addEventListener('pointerdown',e=>{if(e.target===body)select(body)});status(missingAssets.size?'Missing background/assets: '+[...missingAssets].slice(0,3).join(', '):'Loaded — '+nodes.length+' elements');requestAnimationFrame(()=>{if(autoFit)fitScreen();else applyZoom();});body.querySelectorAll('img').forEach(img=>{if(!img.complete)img.addEventListener('load',()=>{if(autoFit)fitScreen()},{once:true})});}
function sourceFor(el){if(!el)return null;if(el===stage.firstElementChild)return doc.body;if(el===stage.querySelector('[data-editor-root]'))return doc.body;let idx=el.dataset.editorIndex;if(idx===undefined)return null;return doc.body.querySelectorAll('*')[Number(idx)]||null}
function select(el){stage.querySelectorAll('.selected').forEach(e=>e.classList.remove('selected'));selected=el;el.classList.add('selected');$('chosen').textContent=el.tagName+' '+(el.textContent||'').trim().slice(0,50);$('textedit').value=el.children.length===0?(el.textContent||''):'';$('textedit').disabled=el.children.length>0;const r=el.getBoundingClientRect(),s=stage.getBoundingClientRect(),z=Number($('zoom').value)/100;$('x').value=Math.round((r.left-s.left)/z);$('y').value=Math.round((r.top-s.top)/z);$('font').value=parseFloat(getComputedStyle(el).fontSize)||16;const cs=getComputedStyle(el);$('weight').value=[...$('weight').options].some(o=>o.value===cs.fontWeight)?cs.fontWeight:'400';$('thickness').value=Number(cs.fontWeight)||400;$('thicknessvalue').textContent=$('thickness').value;$('stroke').value=Math.min(2,parseFloat(cs.webkitTextStrokeWidth)||0);$('strokevalue').textContent=$('stroke').value+'px';$('darkness').value=Math.round((Number.isFinite(parseFloat(cs.opacity))?parseFloat(cs.opacity):1)*100);$('darknessvalue').textContent=$('darkness').value+'%';$('color').value=toHex(cs.color);$('spacing').value=cs.letterSpacing==='normal'?0:(parseFloat(cs.letterSpacing)||0);$('family').value=[...$('family').options].some(o=>o.value===el.style.fontFamily)?el.style.fontFamily:'';$('width').value=Math.round(r.width/z);$('height').value=Math.round(r.height/z)}
$('newtext').onclick=()=>{if(!doc){doc=new DOMParser().parseFromString('<!doctype html><html><head><meta charset="utf-8"></head><body style="width:800px;height:500px;background:white"></body></html>','text/html');currentHtml='index.html';fileMap.clear()}snap();const el=doc.createElement('div');el.setAttribute('data-new-editor-text','true');el.textContent='নতুন বাংলা লেখা';el.style.cssText='position:absolute;left:60px;top:60px;font-family:Arial, sans-serif;font-size:20px;font-weight:400;-webkit-text-stroke:0px transparent;text-shadow:none;opacity:1;color:#000000;white-space:pre-wrap;cursor:move';doc.body.append(el);render();const newIndex=[...doc.body.querySelectorAll('*')].indexOf(el);const newEl=stage.querySelector('[data-editor-index="'+newIndex+'"]');if(newEl)select(newEl);status('নতুন লেখা যোগ হয়েছে — ডান পাশের Selected Text-এ লিখুন')};$('textedit').addEventListener('input',()=>{if(!selected||selected.children.length)return;const src=sourceFor(selected);if(!src)return;snap();src.textContent=$('textedit').value;selected.textContent=$('textedit').value;});
$('duplicateText').onclick=()=>{if(!doc||!selected){status('আগে যে লেখা/HTML ডুপ্লিকেট করবেন সেটি নির্বাচন করুন');return;}const src=sourceFor(selected);if(!src||src===doc.body){status('এই HTML এলিমেন্ট ডুপ্লিকেট করা যাবে না');return;}snap();const cs=getComputedStyle(selected);const r=selected.getBoundingClientRect(),sr=stage.getBoundingClientRect(),z=Math.max(.01,Number($('zoom').value)/100);const x=Math.round((r.left-sr.left)/z)+20,y=Math.round((r.top-sr.top)/z)+20;const clone=doc.createElement('div');clone.setAttribute('data-new-editor-text','true');clone.textContent=(src.textContent||'নতুন বাংলা লেখা').trim();const props=['fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','color','textAlign','textDecoration','webkitTextStroke','textShadow','opacity','backgroundColor','border','borderRadius','padding','whiteSpace','wordBreak','writingMode'];clone.style.position='absolute';clone.style.left=x+'px';clone.style.top=y+'px';clone.style.width=Math.max(30,Math.round(r.width/z))+'px';clone.style.minHeight=Math.max(20,Math.round(r.height/z))+'px';clone.style.boxSizing='border-box';clone.style.cursor='move';clone.style.zIndex='10000';clone.style.userSelect='none';for(const p of props){const v=cs[p];if(v&&v!=='normal'&&v!=='none')clone.style[p]=v;}clone.style.whiteSpace='pre-wrap';clone.style.overflowWrap='anywhere';doc.body.append(clone);render();const ni=[...doc.body.querySelectorAll('*')].indexOf(clone);const rendered=stage.querySelector('[data-editor-index="'+ni+'"]');if(rendered)select(rendered);status('ডুপ্লিকেট তৈরি হয়েছে। লেখা সম্পাদনা করুন এবং টেনে যেকোনো জায়গায় নিন।');};function toHex(v){let m=(v||'').match(/[\d.]+/g);if(!m||m.length<3)return '#000000';return '#'+m.slice(0,3).map(n=>Math.max(0,Math.min(255,Math.round(+n))).toString(16).padStart(2,'0')).join('')}
function styleSelected(prop,value){if(!selected)return;let source=sourceFor(selected);if(!source)return;snap();selected.style[prop]=value;source.style[prop]=value;status('Style updated — Export ZIP to save')}
function update(x,y,opts={}){if(!selected)return;let source=sourceFor(selected);if(!source)return;for(let el of [selected,source]){el.style.position='absolute';el.style.left=x+'px';el.style.top=y+'px';if(opts.font)el.style.fontSize=opts.font+'px';if(opts.width!==undefined)el.style.width=opts.width>0?opts.width+'px':'auto';if(opts.height!==undefined)el.style.height=opts.height>0?opts.height+'px':'auto'}$('x').value=x;$('y').value=y}
function startDrag(e,el){if(e.button!==0)return;e.preventDefault();e.stopPropagation();select(el);snap();let x=Number($('x').value),y=Number($('y').value);drag={el,x,y,px:e.clientX,py:e.clientY};try{el.setPointerCapture(e.pointerId)}catch(_){}}stage.addEventListener('pointermove',e=>{if(!drag)return;let z=Number($('zoom').value)/100;update(Math.round(drag.x+(e.clientX-drag.px)/z),Math.round(drag.y+(e.clientY-drag.py)/z))});stage.addEventListener('pointerup',()=>drag=null);stage.addEventListener('pointercancel',()=>drag=null);
for(let id of ['x','y','font','width','height'])$(id).addEventListener('change',()=>{if(!selected)return;snap();update(Number($('x').value),Number($('y').value),{font:Number($('font').value),width:Number($('width').value),height:Number($('height').value)})});$('family').addEventListener('change',()=>{if(!selected)return;styleSelected('fontFamily',$('family').value)});$('weight').addEventListener('change',()=>{if(!selected)return;styleSelected('fontWeight',$('weight').value);$('thickness').value=Number($('weight').value)||400;$('thicknessvalue').textContent=$('thickness').value});$('color').addEventListener('input',()=>{if(!selected)return;styleSelected('color',$('color').value)});$('spacing').addEventListener('change',()=>{if(!selected)return;styleSelected('letterSpacing',Number($('spacing').value)+'px')});$('thickness').addEventListener('input',()=>{if(!selected)return;const v=$('thickness').value;$('thicknessvalue').textContent=v;styleSelected('fontWeight',v);$('weight').value=v});$('stroke').addEventListener('input',()=>{if(!selected)return;const v=$('stroke').value;$('strokevalue').textContent=v+'px';styleSelected('webkitTextStroke',v==='0'?'0px transparent':v+'px currentColor')});$('resetstyle').onclick=()=>{if(!selected)return;const src=sourceFor(selected);if(!src)return;snap();for(const el of [selected,src]){el.style.fontWeight='400';el.style.webkitTextStroke='0px transparent';el.style.textShadow='none';el.style.opacity='1';el.style.color='#000000'}$('weight').value='400';$('thickness').value='400';$('thicknessvalue').textContent='400';$('stroke').value='0';$('strokevalue').textContent='0px';$('darkness').value='100';$('darknessvalue').textContent='100%';$('color').value='#000000';status('Text style reset — Export ZIP to save')};$('darkness').addEventListener('input',()=>{if(!selected)return;const v=$('darkness').value;$('darknessvalue').textContent=v+'%';styleSelected('opacity',String(Number(v)/100))});for(let id of ['family','weight','color','spacing'])$(id).addEventListener('change',()=>{let prop={family:'fontFamily',weight:'fontWeight',color:'color',spacing:'letterSpacing'}[id];styleSelected(prop,id==='spacing'?Number($(id).value)+'px':$(id).value);if(id==='weight'){$('thickness').value=$(id).value;$('thicknessvalue').textContent=$(id).value}});document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>{$('color').value=b.dataset.color;styleSelected('color',b.dataset.color)}));function applyZoom(){let z=Math.max(1,Math.min(300,Number($('zoom').value)||100))/100;$('zoom').value=+(z*100).toFixed(2);stage.style.transform='scale('+z+')';const holder=$('stage-holder');holder.style.width=Math.ceil(stage.offsetWidth*z)+'px';holder.style.height=Math.ceil(stage.offsetHeight*z)+'px';$('zoomlabel').textContent=+(z*100).toFixed(1)+'%'}
function fitScreen(){if(!doc)return;const work=$('work'),w=stage.offsetWidth||800,h=stage.offsetHeight||500;const availableW=Math.max(1,work.clientWidth-36),availableH=Math.max(1,work.clientHeight-36);const z=Math.min(availableW/w,availableH/h,1);$('zoom').value=+(Math.max(.01,z)*100).toFixed(2);applyZoom();work.scrollTop=0;work.scrollLeft=0}
$('zoom').onchange=()=>{autoFit=false;applyZoom()};$('fit').onclick=()=>{autoFit=true;fitScreen()};$('zoomin').onclick=()=>{autoFit=false;$('zoom').value=Number($('zoom').value)+10;applyZoom()};$('zoomout').onclick=()=>{autoFit=false;$('zoom').value=Number($('zoom').value)-10;applyZoom()};window.addEventListener('resize',()=>{if(autoFit)fitScreen()});$('work').addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();autoFit=false;$('zoom').value=Number($('zoom').value)+(e.deltaY<0?10:-10);applyZoom()},{passive:false});
document.addEventListener('keydown',e=>{if(!selected||!e.key.startsWith('Arrow')||['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;e.preventDefault();snap();let n=e.shiftKey?10:1,x=Number($('x').value),y=Number($('y').value);if(e.key==='ArrowLeft')x-=n;if(e.key==='ArrowRight')x+=n;if(e.key==='ArrowUp')y-=n;if(e.key==='ArrowDown')y+=n;update(x,y)});

function ensureBirthPlace(){
 if(!doc || doc.querySelector('.field-birth-place,[data-field="birthPlace"]'))return;
 const card=doc.querySelector('.nid-card');
 if(!card)return;
 const el=doc.createElement('div');
 el.className='text-block field-birth-place';
 el.setAttribute('data-field','birthPlace');
 el.textContent='';
 el.style.cssText='position:absolute;left:719px;top:160px;font-size:18px;font-family:SolaimanLipi, Noto Sans Bengali, Arial, sans-serif;color:#000;white-space:nowrap;z-index:2;min-width:90px;min-height:24px';
 card.appendChild(el);
}

async function load(files){fileMap.clear();doc=null;for(let file of files){if(/\.zip$/i.test(file.name)){let zip=await JSZip.loadAsync(file);for(let [name,obj] of Object.entries(zip.files)){if(!obj.dir){let bytes=await obj.async('uint8array');put(name,bytes)}}}else put(file.name,new Uint8Array(await file.arrayBuffer()))}let htmls=[...fileMap.keys()].filter(n=>/\.html?$/i.test(n));currentHtml=htmls.find(n=>!/(^|\/)index\.html?$/i.test(n) && !/Visual HTML Editor|Offline Visual HTML Editor/i.test(fileMap.get(n).text.slice(0,2000))) || htmls.find(n=>!(/Visual HTML Editor|Offline Visual HTML Editor/i.test(fileMap.get(n).text.slice(0,2000)))) || htmls[0];if(!currentHtml){status('HTML পাওয়া যায়নি — HTML/CSS/ছবি-সহ প্রজেক্ট ZIP দিন');return}doc=new DOMParser().parseFromString(fileMap.get(currentHtml).text,'text/html');ensureBirthPlace();history=[];future=[];render();status('Project loaded: '+currentHtml+' ('+fileMap.size+' files)'+(missingAssets.size?' | MISSING: '+[...missingAssets].join(', '):''))}
function put(name,bytes){let blob=new Blob([bytes]);fileMap.set(name,{bytes,text:new TextDecoder().decode(bytes),url:URL.createObjectURL(blob)})}


async function refreshSavedProjects(selectName=''){try{const r=await fetch('/api/projects');if(!r.ok)throw new Error('Server project list unavailable');const data=await r.json();const sel=$('savedProjects');sel.replaceChildren(new Option('Saved Projects',''));for(const p of (data.projects||[]))sel.add(new Option(p.name,p.name));if(selectName)sel.value=selectName}catch(e){status('Saved project list unavailable: '+e.message)}}
async function makeProjectZip(){if(!doc)throw new Error('আগে HTML/ZIP প্রজেক্ট লোড করুন');if(typeof window.flushPermanentLayout==='function')window.flushPermanentLayout();const zip=new JSZip();for(const [name,f] of fileMap)zip.file(name,f.bytes);zip.file(currentHtml,'<!DOCTYPE html>\n'+doc.documentElement.outerHTML);return zip.generateAsync({type:'blob'})}
$('saveProject').onclick=async()=>{try{if(!doc)throw new Error('আগে HTML/ZIP প্রজেক্ট লোড করুন');const name=($('projectName').value||currentHtml.replace(/\.(html?|htm)$/i,'')||'Untitled Project').trim();const blob=await makeProjectZip();const r=await fetch('/api/projects/save?name='+encodeURIComponent(name),{method:'POST',headers:{'Content-Type':'application/zip'},body:blob});const data=await r.json();if(!r.ok||!data.ok)throw new Error(data.error||'Save failed');await refreshSavedProjects(data.name);status('কম্পিউটারের New folder-এ স্থায়ীভাবে সেভ হয়েছে: '+data.name)}catch(e){status('Save failed: '+e.message);alert('প্রজেক্ট সেভ করা যায়নি। সার্ভার চালু আছে কি না দেখুন। '+e.message)}};
$('openProject').onclick=async()=>{try{const name=$('savedProjects').value;if(!name){alert('Saved Projects থেকে একটি প্রজেক্ট বাছুন');return}const r=await fetch('/api/projects/open?name='+encodeURIComponent(name));if(!r.ok)throw new Error('Saved project পাওয়া যায়নি');const blob=await r.blob();await load([new File([blob],name+'.zip',{type:'application/zip'})]);$('projectName').value=name;status('কম্পিউটার থেকে প্রজেক্ট খোলা হয়েছে: '+name)}catch(e){status('Open failed: '+e.message);alert('প্রজেক্ট খোলা যায়নি। '+e.message)}};
$('deleteProject').onclick=async()=>{const name=$('savedProjects').value;if(!name){alert('মুছতে Saved Projects থেকে একটি প্রজেক্ট বাছুন');return}if(!confirm('“'+name+'” প্রজেক্টটি কম্পিউটার থেকে মুছে ফেলবেন?'))return;try{const r=await fetch('/api/projects/delete?name='+encodeURIComponent(name),{method:'DELETE'});const data=await r.json();if(!r.ok||!data.ok)throw new Error(data.error||'Delete failed');await refreshSavedProjects();status('প্রজেক্ট কম্পিউটার থেকে মুছে ফেলা হয়েছে')}catch(e){status('Delete failed: '+e.message)}};
refreshSavedProjects();

$('files').onchange=async e=>{try{await load(e.target.files)}catch(err){status('Load error: '+err.message)}};

(async()=>{try{const r=await fetch('/NID-HTML-Project.zip');if(r.ok){const b=await r.blob();await load([new File([b],'NID-HTML-Project.zip',{type:'application/zip'})]);$('projectName').value='NID HTML Project';await refreshSavedProjects('NID HTML Project');status('ডিফল্ট প্রজেক্ট স্বয়ংক্রিয়ভাবে খোলা হয়েছে। New folder/projects-এ স্থায়ী সেভ হবে।')}}catch(e){status('Default project load failed: '+e.message)}})();

$('save').onclick=async()=>{try{const blob=await makeProjectZip();const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='edited-html-project.zip';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),10000);status('Export complete')}catch(e){alert(e.message)}};

// Keep the preview full-screen. The PDF / JSON / Editor Tools button opens one panel
// containing all secondary actions plus the existing editor controls.
(function(){
 const header=document.querySelector('header');
 const aside=document.querySelector('main>aside');
 const toggle=document.getElementById('toggleEditorTools');
 if(!header||!aside||!toggle||document.getElementById('allEditorTools')) return;
 const panel=document.createElement('section');
 panel.id='allEditorTools';
 panel.innerHTML='<b style="display:block;font-size:16px;margin:0 0 10px">PDF / JSON / Editor Tools</b><div id="allEditorActions"></div><hr style="border:0;border-top:1px solid #44516a;margin:14px 0">';
 aside.insertBefore(panel,aside.firstChild);
 const actions=panel.querySelector('#allEditorActions');
 const keep=new Set(['printPdf','toggleEditorTools','status']);
 [...header.children].forEach(el=>{
   if(el.tagName==='H2'||keep.has(el.id)) return;
   actions.appendChild(el);
 });
 // Make controls fit the drawer instead of stretching the top bar.
 actions.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin-bottom:8px';
 actions.querySelectorAll('button,.filebtn,select,input').forEach(el=>{el.style.maxWidth='100%';if(el.id==='projectName')el.style.width='100%'});
})();
const toolsToggle=document.getElementById('toggleEditorTools');
if(toolsToggle){toolsToggle.addEventListener('click',()=>{const open=document.body.classList.toggle('tools-open');toolsToggle.setAttribute('aria-expanded',String(open));toolsToggle.textContent=open?'✕ Close Tools':'☰ PDF / JSON / Editor Tools';});}

/* Main workspace cleanup: keep only the compact tools menu visible above the canvas.
   All toolbar/status/format controls remain reachable inside the tools drawer. */
(function(){
 const style=document.createElement('style');
 style.id='mobile-main-ui-cleanup';
 style.textContent=`
 @media(max-width:800px){
   header{display:flex!important;flex-wrap:wrap!important;gap:6px!important;padding:8px!important;min-height:0!important}
   header>*{display:none!important}
   header #toggleEditorTools{display:block!important;width:100%!important;max-width:none!important;margin:0!important}
   header #toggleEditorTools button{width:100%!important}
   main>aside{display:none!important;width:100%!important;max-width:100%!important;margin:0!important}
   body.tools-open main>aside{display:block!important}
   #allEditorTools{display:block!important;margin:0!important;width:100%!important;max-width:100%!important}
   #allEditorActions{max-height:70vh!important;overflow:auto!important}
   #status{display:none!important}
   #stage-holder,#stage{max-width:100%!important}
   body{overflow-x:hidden!important}
 }
 @media(min-width:801px){
   header>*{display:revert}
 }
 `;
 document.head.appendChild(style);
 // Move the full Format → HTML Auto Fill panel into the tools drawer and hide it on entry.
 const findButton=text=>[...document.querySelectorAll('button,input[type="button"],input[type="submit"]')].find(el=>(el.textContent||el.value||'').trim().toLowerCase()===text.toLowerCase());
 // Find the complete format form from its distinctive textarea and both action buttons.
 const formatTextarea=[...document.querySelectorAll('textarea')].find(el=>/বাংলা\s*\/\s*ইংরেজি\s*ফরম্যাট/.test(el.placeholder||'') || /ফরম্যাট এখানে পেস্ট/.test(el.placeholder||''));
 const parseBtn=[...document.querySelectorAll('button,input[type="button"],input[type="submit"]')].find(el=>/normal\s*parse/i.test((el.textContent||el.value||'').trim()));
 const applyBtn=[...document.querySelectorAll('button,input[type="button"],input[type="submit"]')].find(el=>/apply\s*to\s*html/i.test((el.textContent||el.value||'').trim()));
 if(formatTextarea && parseBtn && applyBtn){
   let formatPanel=formatTextarea.parentElement;
   while(formatPanel && formatPanel!==document.body &&
     !(formatPanel.contains(parseBtn) && formatPanel.contains(applyBtn))) formatPanel=formatPanel.parentElement;
   // Choose the smallest ancestor that contains the paste box and both buttons.
   if(formatPanel && formatPanel!==document.body){
     let smaller=formatPanel;
     while(smaller.parentElement && smaller.parentElement!==document.body &&
       smaller.parentElement.contains(parseBtn) && smaller.parentElement.contains(applyBtn) &&
       smaller.parentElement.contains(formatTextarea) &&
       smaller.parentElement.querySelectorAll('textarea').length<=formatPanel.querySelectorAll('textarea').length){
       // Keep the current smallest candidate; do not climb into the page shell.
       break;
     }
     formatPanel.dataset.movedFormatTools='true';
     actions.appendChild(formatPanel);
   }
 }
 const style2=document.createElement('style');
 style2.textContent=`
  @media(max-width:800px){
    body:not(.tools-open) [data-moved-format-tools="true"]{display:none!important}
    body.tools-open [data-moved-format-tools="true"]{display:block!important}
  }
 `;
 document.head.appendChild(style2);
 // Collapse any expanded JSON tools on initial page load.
 document.querySelectorAll('#addon-advanced').forEach(el=>el.removeAttribute('open'));
})();













function collectStageStyles(){
 let css='';
 // Copy screen styles needed by the certificate, but skip editor-level @media print
 // rules. Those rules target the editor layout and were causing extra blank pages.
 const appendRules=(rules)=>{
   for(const rule of [...rules]){
     if(rule.type===CSSRule.MEDIA_RULE){
       if(/print/i.test(rule.conditionText||rule.media?.mediaText||'')) continue;
       try{css += rule.cssText+'\n'}catch(e){}
     }else{
       try{css += rule.cssText+'\n'}catch(e){}
     }
   }
 };
 for(const sheet of [...document.styleSheets]){
   try{appendRules(sheet.cssRules)}catch(e){}
 }
 return css;
}
function stageDimensions(){
 const r=stage.getBoundingClientRect();
 // Include overflow content, not only the fixed editor canvas size.
 const w=Math.max(parseFloat(stage.style.width)||0,stage.scrollWidth||0,r.width||0,1);
 const h=Math.max(parseFloat(stage.style.height)||0,stage.scrollHeight||0,r.height||0,1);
 return {w,h};
}
$('printPdf').onclick=()=>{
 if(!doc){alert('আগে HTML/ZIP প্রজেক্ট লোড করুন');return}
 let pw=null;
 try{
   pw=window.open('', '_blank');
   if(!pw){alert('Print window blocked. Chrome-এ popup allow করে আবার চেষ্টা করুন।');return}
   const rect=stage.getBoundingClientRect();
   const stageW=Math.max(parseFloat(getComputedStyle(stage).width)||parseFloat(stage.style.width)||stage.scrollWidth||1,1);
   const stageH=Math.max(parseFloat(getComputedStyle(stage).height)||parseFloat(stage.style.height)||stage.scrollHeight||1,1);
   // Find the real visible content bounds inside the editor stage. This avoids
   // printing the large empty stage around the NID card and producing page 2.
   let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
   const candidates=[...stage.querySelectorAll('*')];
   for(const el of candidates){
     if(el.closest('[data-editor-ui],.resize-handle,.selection-box,.drag-handle,.editor-only')) continue;
     const cs=getComputedStyle(el); if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)===0) continue;
     const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) continue;
     // Ignore broad layout containers; measure visible leaves, text, and images.
     if(el.children.length && !['IMG','CANVAS','SVG'].includes(el.tagName)) continue;
     const x=(r.left-rect.left)*(stageW/(rect.width||stageW));
     const y=(r.top-rect.top)*(stageH/(rect.height||stageH));
     const w=r.width*(stageW/(rect.width||stageW)), h=r.height*(stageH/(rect.height||stageH));
     minX=Math.min(minX,x); minY=Math.min(minY,y); maxX=Math.max(maxX,x+w); maxY=Math.max(maxY,y+h);
   }
   if(!Number.isFinite(minX)||maxX<=minX||maxY<=minY){minX=0;minY=0;maxX=stageW;maxY=stageH}
   const pad=4; minX=Math.max(0,minX-pad);minY=Math.max(0,minY-pad);maxX=Math.min(stageW,maxX+pad);maxY=Math.min(stageH,maxY+pad);
   const cropW=Math.max(1,Math.ceil(maxX-minX)),cropH=Math.max(1,Math.ceil(maxY-minY));
   const clone=stage.cloneNode(true);
   clone.style.cssText+=';position:absolute!important;left:'+(-minX)+'px!important;top:'+(-minY)+'px!important;width:'+stageW+'px!important;height:'+stageH+'px!important;margin:0!important;transform:none!important;box-shadow:none!important;background:#fff!important;overflow:visible!important';
   clone.querySelectorAll('.selected,.editable.selected,[data-editor-ui],.resize-handle,.selection-box,.drag-handle,.editor-only').forEach(el=>el.remove());
   const pageWmm=(cropW*25.4/96).toFixed(3), pageHmm=(cropH*25.4/96).toFixed(3);
   const css=collectStageStyles().replace(/@page[^{}]*\{[^}]*\}/gi,'');
   pw.document.open();
   pw.document.write('<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NID PDF</title><style>@page{size:'+pageWmm+'mm '+pageHmm+'mm;margin:0}*{box-sizing:border-box}html,body{margin:0!important;padding:0!important;width:'+cropW+'px!important;height:'+cropH+'px!important;min-width:'+cropW+'px!important;min-height:'+cropH+'px!important;max-width:'+cropW+'px!important;max-height:'+cropH+'px!important;overflow:hidden!important;background:#fff!important;color:#000!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}#print-root{position:relative!important;display:block!important;width:'+cropW+'px!important;height:'+cropH+'px!important;min-width:'+cropW+'px!important;min-height:'+cropH+'px!important;max-width:'+cropW+'px!important;max-height:'+cropH+'px!important;margin:0!important;padding:0!important;overflow:hidden!important;background:#fff!important;break-inside:avoid!important;page-break-inside:avoid!important;break-after:avoid-page!important;page-break-after:avoid!important}#stage{position:absolute!important;left:0!important;top:0!important;transform:none!important;box-shadow:none!important;background:#fff!important;overflow:visible!important}.selected,.editable.selected{outline:none!important}@media screen{body{padding:12px!important;width:auto!important;height:auto!important}#print-root{outline:1px solid #bbb}}@media print{html,body,#print-root{margin:0!important;padding:0!important;overflow:hidden!important;break-before:avoid!important;break-after:avoid!important;page-break-before:avoid!important;page-break-after:avoid!important}}</style><style>'+css.replace(/<\/style/gi,'<\\/style')+'</style></head><body><div id="print-root" style="width:'+cropW+'px;height:'+cropH+'px">'+clone.outerHTML+'</div></body></html>');
   pw.document.close();
   const doPrint=()=>{try{pw.focus();pw.print()}catch(e){alert('PDF Print চালু করা যায়নি: '+e.message)}};
   if(pw.document.readyState==='complete')setTimeout(doPrint,250);else pw.addEventListener('load',()=>setTimeout(doPrint,250),{once:true});
 }catch(e){try{pw&&pw.close()}catch(_){} alert('PDF তৈরি করা যায়নি: '+e.message)}
};
$('downloadImage').onclick=async()=>{
 if(!doc){alert('আগে HTML/ZIP প্রজেক্ট লোড করুন');return}
 try{
   const {w,h}=stageDimensions(),scale=2;
   const clone=stage.cloneNode(true);
   clone.querySelectorAll('.selected,.editable.selected').forEach(el=>{el.classList.remove('selected');el.style.outline='none'});
   clone.style.transform='none';clone.style.margin='0';clone.style.width=w+'px';clone.style.height=h+'px';
   const styles=collectStageStyles();
   const svgDoc=document.implementation.createDocument('http://www.w3.org/2000/svg','svg',null);
   const svg=svgDoc.documentElement;
   svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
   svg.setAttribute('width',String(Math.ceil(w*scale)));svg.setAttribute('height',String(Math.ceil(h*scale)));
   svg.setAttribute('viewBox','0 0 '+w+' '+h);
   const fo=svgDoc.createElementNS('http://www.w3.org/2000/svg','foreignObject');
   fo.setAttribute('width','100%');fo.setAttribute('height','100%');
   const div=svgDoc.createElementNS('http://www.w3.org/1999/xhtml','div');
   div.setAttribute('xmlns','http://www.w3.org/1999/xhtml');
   const style=svgDoc.createElementNS('http://www.w3.org/1999/xhtml','style');style.textContent=styles;
   div.appendChild(style);
   const holder=svgDoc.createElementNS('http://www.w3.org/1999/xhtml','div');
   holder.innerHTML=clone.outerHTML;
   while(holder.firstChild)div.appendChild(svgDoc.importNode(holder.firstChild,true));
   fo.appendChild(div);svg.appendChild(fo);
   const serialized=new XMLSerializer().serializeToString(svg);
   const blob=new Blob([serialized],{type:'image/svg+xml;charset=utf-8'});
   const url=URL.createObjectURL(blob),img=new Image();
   img.onload=()=>{
     try{
       const canvas=document.createElement('canvas');canvas.width=Math.ceil(w*scale);canvas.height=Math.ceil(h*scale);
       const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
       canvas.toBlob(png=>{
         if(!png){alert('PNG তৈরি হয়নি। Print / PDF ব্যবহার করুন।');URL.revokeObjectURL(url);return}
         const a=document.createElement('a');const pngUrl=URL.createObjectURL(png);a.href=pngUrl;a.download='html-preview.png';document.body.appendChild(a);a.click();a.remove();
         setTimeout(()=>URL.revokeObjectURL(pngUrl),15000);URL.revokeObjectURL(url);status('PNG image downloaded');
       },'image/png');
     }catch(err){URL.revokeObjectURL(url);alert('ছবি তৈরি করা যায়নি: '+err.message)}
   };
   img.onerror=()=>{URL.revokeObjectURL(url);alert('এই HTML-এর কিছু ইমেজ/ফন্ট PNG export-এ সমর্থিত হয়নি। Print / PDF ব্যবহার করুন।')};
   img.src=url;
 }catch(err){alert('ইমেজ ডাউনলোড ব্যর্থ: '+err.message)}
};

// Mobile-first cleanup: keep the work canvas visible and put secondary controls in the
// three-bar drawer, rather than letting toolbar rows consume the top of the screen.
(function(){
 const aside=document.querySelector('main>aside');
 const panel=document.getElementById('allEditorTools');
 const actions=document.getElementById('allEditorActions');
 if(!aside||!panel||!actions)return;
 const moveToDrawer=el=>{if(el&&!actions.contains(el))actions.appendChild(el)};
 const findText=(selector,patterns)=>[...document.querySelectorAll(selector)].find(el=>patterns.some(p=>(el.textContent||'').trim().toLowerCase().includes(p)));
 moveToDrawer(findText('button,[role="button"],.filebtn',['save positions permanently','save positions','positions permanently']));
 moveToDrawer(document.getElementById('printPdf'));
 const title=document.querySelector('header h2');
 if(title) title.style.display='none';
 const saveLine=findText('div,p,span',['সেভ করা fingerprint/signature position','fingerprint/signature position প্রয়োগ']);
 if(saveLine && saveLine!==actions && !panel.contains(saveLine)) saveLine.style.display='none';
 const editorTitle=findText('h1,h2,h3',['visual html editor']);
 if(editorTitle) editorTitle.style.display='none';
 // The drawer is the only place for the large JSON/format textarea; never leave it
 // expanded as a full-page block on initial mobile load.
 document.querySelectorAll('#addon-advanced').forEach(el=>el.removeAttribute('open'));
})();
