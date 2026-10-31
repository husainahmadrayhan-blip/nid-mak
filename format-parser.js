(()=>{'use strict';
const F=[['nameBn','নাম (বাংলা)'],['nameEn','Name (English)'],['dob','জন্ম তারিখ'],['fatherName','পিতার নাম (বাংলা)'],['motherName','মাতার নাম (বাংলা)'],['address','ঠিকানা (বাংলা)'],['birthPlace','জন্মস্থান']];
const root=document.createElement('section');root.style.cssText='padding:12px;background:#162c42;border:1px solid #48617a;border-radius:10px;margin:12px 0';
root.innerHTML='<h3 style="margin:0 0 8px">Format → HTML Auto Fill (৭টি ঘর)</h3><textarea id="format-source" rows="9" style="width:100%;box-sizing:border-box;background:#0c1929;color:white;border:1px solid #52627b;border-radius:6px;padding:8px" placeholder="বাংলা/ইংরেজি ফরম্যাট এখানে পেস্ট করুন"></textarea><div style="display:flex;gap:7px;flex-wrap:wrap;margin:8px 0"><button type="button" id="format-parse">Normal Parse</button><button type="button" id="format-fill">Apply to HTML</button></div><div id="format-status" style="font-size:12px;margin:8px 0"></div><div id="format-fields"></div>';

const aiBox=document.createElement('div');
aiBox.style.cssText='margin-top:12px;padding:10px;border:1px solid #526b86;border-radius:8px;background:#102238';
aiBox.innerHTML='<h4 style="margin:0 0 8px">AI API Settings / AI Format Auto Fill</h4><label style="display:block;margin:6px 0">AI Provider <select id="ai-provider" style="width:100%;padding:8px;background:#0c1929;color:white;border:1px solid #52627b;border-radius:5px"><option value="gemini">Gemini 3 Flash</option><option value="grok">Grok Console</option></select></label><label style="display:block;margin:6px 0">API Key <input id="ai-api-key" type="password" autocomplete="new-password" placeholder="API Key এখানে দিন" style="width:100%;box-sizing:border-box;padding:8px;background:#0c1929;color:white;border:1px solid #52627b;border-radius:5px"></label><div style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" id="ai-save-key">Save API Key</button><button type="button" id="ai-delete-key">Delete Key</button><button type="button" id="ai-parse-format">AI Format Parse + Fill</button></div><small id="ai-key-status" style="display:block;margin-top:7px;color:#cbd5e1">API Key server-এর private file-এ সেভ হবে।</small>';
root.append(aiBox);
root.id='format-auto-fill-tools';
const addon=document.getElementById('pdf-addon');
const toolsActions=document.getElementById('allEditorActions');
const toolsDrawer=document.querySelector('main>aside');
if(toolsActions){toolsActions.append(root);}
else if(toolsDrawer){toolsDrawer.append(root);}
else if(addon){addon.parentNode.insertBefore(root,addon);}
const el=id=>document.getElementById(id), status=s=>el('format-status').textContent;
const fields=el('format-fields');for(const [k,label] of F){const wrapper=document.createElement('label');wrapper.style.cssText='display:block;margin:7px 0;font-size:12px';wrapper.textContent=label;const inp=document.createElement('textarea');inp.rows=k==='address'?3:1;inp.id='format-'+k;inp.style.cssText='display:block;width:100%;box-sizing:border-box;margin-top:3px;background:#0c1929;color:white;border:1px solid #52627b;border-radius:5px;padding:6px';wrapper.append(inp);fields.append(wrapper)}
function normalizeDate(value){
 let v=String(value||'').trim().replace(/[০-৯]/g,ch=>'০১২৩৪৫৬৭৮৯'.indexOf(ch));
 let m,d,mo,y;
 if((m=v.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/))){y=+m[1];mo=+m[2];d=+m[3];}
 else if((m=v.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/))){d=+m[1];mo=+m[2];y=+m[3];}
 else if((m=v.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/))){d=+m[1];mo=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(m[2].slice(0,3).toLowerCase())+1;y=+m[3];}
 else return v;
 const dt=new Date(Date.UTC(y,mo-1,d));
 if(!y||!mo||!d||dt.getUTCFullYear()!==y||dt.getUTCMonth()!==mo-1||dt.getUTCDate()!==d)return v;
 return String(d).padStart(2,'0')+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][mo-1]+' '+y;
}
function districtOnly(value){
 const p=String(value||'').split(/[,،]/).map(x=>x.trim()).filter(Boolean);
 if(!p.length)return '';
 const last=p[p.length-1];
 if(/বিভাগ|division/i.test(last)||/বাংলাদেশ|bangladesh/i.test(last))return p.length>1?p[p.length-2]:'';
 return last.replace(/^(জেলা|district)\s*[:：-]?\s*/i,'').trim();
}
function currentAddress(value){
 const v=String(value||'').trim();
 const m=v.match(/(?:^|[,،]\s*)([০-৯\d]{4})\s*[,،]?\s*গ্রাম\s*[:ঃ]?\s*([^,،]+)\s*[,،]\s*ডাকঘর\s*[:ঃ]?\s*([^,،]+)(.*)$/i);
 if(!m)return v;
 const post=m[3].trim(), repeated=post.split(/\s+/).pop();
 const rest=m[4].split(/[,،]/).map(x=>x.trim()).filter(x=>x&&x!==repeated&&!/বিভাগ|division/i.test(x));
 return 'ঠিকানা: গ্রাম/রাস্তা : '+m[2].trim()+', ডাকঘর: '+post+'- '+m[1]+(rest.length?', '+rest.join(', '):'');
}
const clean=s=>String(s||'').replace(/^[\s:：\-–—]+/,'').trim();
function parse(raw){
 const lines=raw.replace(/\r/g,'').split('\n').map(s=>s.trim()).filter(Boolean),o={};let section='applicant';
 for(let i=0;i<lines.length;i++){
  const line=lines[i],next=lines[i+1]||'';let m;
  if(/^পিতার\s*তথ্য/.test(line)){section='father';continue;}
  if(/^মাতার\s*তথ্য/.test(line)){section='mother';continue;}
  if(/^নিজের\s*তথ্য/.test(line)){section='applicant';continue;}
  if(section==='applicant'){
   if((m=line.match(/^(?:\*?\s*)?নাম\s*(?:বাংলায়|বাংলা)?\s*[:ঃ\-–]\s*(.+)$/i)))o.nameBn=clean(m[1]);
   else if((m=line.match(/^(?:নাম\s*(?:ইংরেজিতে|ইংরেজি)|name|english\s*name)\s*[:ঃ\-–]\s*(.+)$/i)))o.nameEn=clean(m[1]).toUpperCase();
   else if((m=line.match(/^(?:জন্ম\s*তারিখ|জন্মতারিখ|date\s*of\s*birth|dob)\s*[:ঃ\-–]\s*(.+)$/i)))o.dob=normalizeDate(clean(m[1]));
   else if(/^(?:স্থায়ী\s*ঠিকানা|বর্তমান\s*ঠিকানা)(?:\s*\([^)]*\))?\s*[-–:]?$/i.test(line)&&next)o.address=currentAddress(next);
   else if((m=line.match(/^(?:গ্রাম\s*\/\s*রাস্তা|ঠিকানা|স্থায়ী\s*ঠিকানা|বর্তমান\s*ঠিকানা)\s*[:ঃ\-–]\s*(.+)$/i)))o.address=currentAddress(clean(m[1]));
   else if(/^(?:জন্ম\s*স্থান|জন্মস্থান|place\s*of\s*birth)(?:\s*\([^)]*\))?\s*[-–:]?$/i.test(line)&&next)o.birthPlace=districtOnly(next);
   else if((m=line.match(/^(?:জন্ম\s*স্থান|জন্মস্থান|place\s*of\s*birth)\s*[:ঃ\-–]\s*(.+)$/i)))o.birthPlace=districtOnly(clean(m[1]));
  }else if(section==='father' && (m=line.match(/^(?:পিতা(?:র)?\s*নাম|নাম\s*বাংলায়)\s*[:ঃ\-–]\s*(.+)$/i)))o.fatherName=clean(m[1]);
  else if(section==='mother' && (m=line.match(/^(?:মাতা(?:র)?\s*নাম|নাম\s*বাংলায়)\s*[:ঃ\-–]\s*(.+)$/i)))o.motherName=clean(m[1]);
 }
 return o;
}
function write(o){for(const [k] of F)el('format-'+k).value=o[k]||''}
el('format-parse').onclick=()=>{const data=parse(el('format-source').value);write(data);status(Object.keys(data).length+'টি ফিল্ড পাওয়া গেছে। ভুল থাকলে নিচের ঘরে সংশোধন করুন।')};
el('format-fill').onclick=()=>{const data={};for(const [k] of F){const v=el('format-'+k).value.trim();if(v)data[k]=k==='nameEn'?v.toUpperCase():v}if(!Object.keys(data).length)return status('প্রথমে Format Parse করুন বা ঘর পূরণ করুন।');
const json=el('addon-json'),fill=el('addon-fill');if(!json||!fill)return status('PDF Auto Fill module পাওয়া যায়নি।');let old={};try{old=JSON.parse(json.value||'{}')}catch(_){}json.value=JSON.stringify({...old,...data},null,2);fill.click();status('HTML-এ ৭টি নির্ধারিত ফিল্ডের ডাটা পাঠানো হয়েছে। Preview যাচাই করুন।')};
// Synchronize edited PDF-extracted fields to the current HTML document.
document.addEventListener('change',event=>{
 const target=event.target;
 if(target?.matches?.('#pdf-addon .app-field input, #pdf-addon .app-field textarea, #pdf-addon .app-field select, #addon-json')){
  const fill=el('addon-fill');
  if(fill && typeof doc!=='undefined' && doc) fill.click();
 }
});

async function aiRequest(path, body){const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||'API request failed');return d}
const aiStatus=el('ai-key-status');
async function refreshAIStatus(){try{const r=await fetch('/api/ai/settings');const d=await r.json();const p=d.providers||{};aiStatus.textContent='Gemini: '+(p.gemini?.configured?'Key saved '+p.gemini.masked:'Key not saved')+' | Grok: '+(p.grok?.configured?'Key saved '+p.grok.masked:'Key not saved');}catch(_){aiStatus.textContent='AI API settings server পাওয়া যায়নি। RUN-LOCAL-WINDOWS.bat দিয়ে চালু করুন।'}}
el('ai-save-key').onclick=async()=>{try{const provider=el('ai-provider').value,key=el('ai-api-key').value.trim();if(!key)throw new Error('API Key লিখুন');await aiRequest('/api/ai/settings',{provider,apiKey:key});el('ai-api-key').value='';await refreshAIStatus();aiStatus.textContent+=' | Key saved';}catch(e){aiStatus.textContent='Save failed: '+e.message}};
el('ai-delete-key').onclick=async()=>{try{await aiRequest('/api/ai/settings',{provider:el('ai-provider').value,delete:true});await refreshAIStatus();}catch(e){aiStatus.textContent='Delete failed: '+e.message}};
el('ai-parse-format').onclick=async()=>{try{const raw=el('format-source').value.trim();if(!raw)throw new Error('আগে Format Paste করুন');aiStatus.textContent='AI বিশ্লেষণ করছে...';const d=await aiRequest('/api/ai/parse',{provider:el('ai-provider').value,text:raw});write(d.data||{});const count=Object.values(d.data||{}).filter(Boolean).length;status(count+'টি ফিল্ড AI দিয়ে শনাক্ত হয়েছে।');const apply=el('format-fill');apply.click();aiStatus.textContent='AI Parse সফল ('+d.model+')। Preview যাচাই করুন।';}catch(e){aiStatus.textContent='AI Parse failed: '+e.message}};
refreshAIStatus();
window.VisualFormatParser={parse};
})();