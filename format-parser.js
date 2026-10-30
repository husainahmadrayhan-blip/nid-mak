(()=>{'use strict';
const F=[['nameBn','নাম (বাংলা)'],['nameEn','Name (English)'],['dob','জন্ম তারিখ'],['fatherName','পিতার নাম (বাংলা)'],['motherName','মাতার নাম (বাংলা)'],['address','ঠিকানা (বাংলা)'],['birthPlace','জন্মস্থান']];
const root=document.createElement('section');root.style.cssText='padding:12px;background:#162c42;border:1px solid #48617a;border-radius:10px;margin:12px 0';
root.innerHTML='<h3 style="margin:0 0 8px">Format → HTML Auto Fill (৭টি ঘর)</h3><textarea id="format-source" rows="9" style="width:100%;box-sizing:border-box;background:#0c1929;color:white;border:1px solid #52627b;border-radius:6px;padding:8px" placeholder="বাংলা/ইংরেজি ফরম্যাট এখানে পেস্ট করুন"></textarea><div style="display:flex;gap:7px;flex-wrap:wrap;margin:8px 0"><button type="button" id="format-parse">Normal Parse</button><button type="button" id="format-fill">Apply to HTML</button></div><div id="format-status" style="font-size:12px;margin:8px 0"></div><div id="format-fields"></div>';
root.id='format-auto-fill-tools';
const addon=document.getElementById('pdf-addon');
const toolsDrawer=document.querySelector('main>aside');
if(toolsDrawer){if(addon&&addon.parentElement===toolsDrawer)toolsDrawer.insertBefore(root,addon);else toolsDrawer.append(root);}
else if(addon)addon.parentNode.insertBefore(root,addon);
const el=id=>document.getElementById(id), status=s=>el('format-status').textContent=s;
const fields=el('format-fields');for(const [k,label] of F){const wrapper=document.createElement('label');wrapper.style.cssText='display:block;margin:7px 0;font-size:12px';wrapper.textContent=label;const inp=document.createElement('textarea');inp.rows=k==='address'?3:1;inp.id='format-'+k;inp.style.cssText='display:block;width:100%;box-sizing:border-box;margin-top:3px;background:#0c1929;color:white;border:1px solid #52627b;border-radius:5px;padding:6px';wrapper.append(inp);fields.append(wrapper)}
const clean=s=>String(s||'').replace(/^[\s:：\-–—]+/,'').trim();
function parse(raw){const lines=raw.replace(/\r/g,'').split('\n').map(s=>s.trim()).filter(Boolean);let o={};
const patterns=[
['nameBn',/^(?:\*?\s*নাম|বাংলা\s*নাম)\s*[:ঃ\-–]\s*(.+)$/i],
['nameEn',/^(?:name|english\s*name)\s*[:ঃ\-–]\s*(.+)$/i],
['dob',/^(?:জন্ম\s*তারিখ|date\s*of\s*birth|dob)\s*[:ঃ\-–]\s*(.+)$/i],
['fatherName',/^(?:পিতা(?:র)?\s*নাম|পিতার\s*নাম)\s*[:ঃ\-–]\s*(.+)$/i],
['motherName',/^(?:মাতা(?:র)?\s*নাম|মায়ের\s*নাম)\s*[:ঃ\-–]\s*(.+)$/i],
['address',/^(?:গ্রাম\s*\/\s*রাস্তা|ঠিকানা|স্থায়ী\s*ঠিকানা|বর্তমান\s*ঠিকানা)\s*[:ঃ\-–]\s*(.+)$/i],
['birthPlace',/^(?:জন্ম\s*স্থান|জন্মস্থান|place\s*of\s*birth)\s*[:ঃ\-–]\s*(.+)$/i]
];
for(const line of lines){for(const [key,re] of patterns){const m=line.match(re);if(m){o[key]=clean(m[1]);break}}}
if(o.nameEn)o.nameEn=o.nameEn.toUpperCase();
if(o.dob){const m=o.dob.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);if(m)o.dob=m[1].padStart(2,'0')+'/'+m[2].padStart(2,'0')+'/'+m[3]}
return o}
function write(o){for(const [k] of F)el('format-'+k).value=o[k]||''}
el('format-parse').onclick=()=>{const data=parse(el('format-source').value);write(data);status(Object.keys(data).length+'টি ফিল্ড পাওয়া গেছে। ভুল থাকলে নিচের ঘরে সংশোধন করুন।')};
el('format-fill').onclick=()=>{const data={};for(const [k] of F){const v=el('format-'+k).value.trim();if(v)data[k]=k==='nameEn'?v.toUpperCase():v}if(!Object.keys(data).length)return status('প্রথমে Format Parse করুন বা ঘর পূরণ করুন।');
const json=el('addon-json'),fill=el('addon-fill');if(!json||!fill)return status('PDF Auto Fill module পাওয়া যায়নি।');let old={};try{old=JSON.parse(json.value||'{}')}catch(_){}json.value=JSON.stringify({...old,...data},null,2);fill.click();status('HTML-এ ৭টি নির্ধারিত ফিল্ডের ডাটা পাঠানো হয়েছে। Preview যাচাই করুন।')};
window.VisualFormatParser={parse};
})();
