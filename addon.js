(()=>{'use strict';
const by=id=>document.getElementById(id);
const ui=document.createElement('section');ui.id='pdf-addon';
ui.innerHTML=`
<style>
#pdf-addon{width:100%;max-width:100%;margin:0 0 18px;padding:18px;background:#f0f8fd;color:#14243b;border:1px solid #d7e5ef;border-radius:14px;font:14px system-ui,"Noto Sans Bengali",Arial,sans-serif;box-sizing:border-box}
#pdf-addon *{box-sizing:border-box}
#pdf-addon .app-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:18px}
#pdf-addon .app-head h3{font-size:20px;margin:0;color:#17345b}
#pdf-addon .app-sub{font-size:12px;color:#62758b;margin-top:4px}
#pdf-addon .app-actions{display:flex;gap:8px;flex-wrap:wrap}
#pdf-addon .app-pdf-upload{margin-top:0}
#pdf-addon .app-pdf-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(180px,2fr) auto;align-items:center;gap:12px}
#pdf-addon .app-pdf-row label{font-size:12px;font-weight:700;color:#304a66}
#pdf-addon .app-pdf-row input[type=file]{display:block!important;width:100%;min-width:0;max-width:100%;padding:8px;background:#f8fbff;border:1px solid #c9d7e5;border-radius:6px;color:#243a53}
#pdf-addon .app-main-actions{justify-content:flex-end;margin:0 0 12px}

/* User request: hide AI/helper buttons and PDF/JSON tools + field-mapping controls. Keep their DOM/handlers intact for compatibility. */
#pdf-addon .app-footer,
#pdf-addon #addon-tools-jump,
#pdf-addon #addon-fill-bottom { display:none !important; }
@media(max-width:760px){#pdf-addon .app-pdf-row{grid-template-columns:1fr}#pdf-addon .app-main-actions button{flex:1 1 100%}}

#pdf-addon button{background:#2454b4;color:#fff;border:1px solid #1f4da7;border-radius:7px;padding:10px 14px;min-height:40px;font-weight:600;cursor:pointer}
#pdf-addon button.secondary{background:#fff;color:#214b91;border-color:#c7d9e8}
#pdf-addon .app-section{background:#fff;border:1px solid #d9e5ee;border-radius:16px;padding:14px;margin:12px 0;box-shadow:0 3px 14px rgba(28,83,135,.06)}
#pdf-addon .app-section h4{background:linear-gradient(90deg,#dcefff,#eaf6ff);border:0;border-radius:9px;padding:10px 12px;margin:-2px 0 14px;font-size:17px}
#pdf-addon .app-field{font-size:14px;font-weight:500;color:#26384d}
#pdf-addon .app-field input,#pdf-addon .app-field textarea,#pdf-addon .app-field select{border-radius:12px;min-height:48px;font-size:15px;padding:11px 13px}
#pdf-addon .app-field textarea{min-height:104px}
#pdf-addon .app-download-card{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;min-height:58px;margin:12px 0 0;border:0;border-radius:12px;background:linear-gradient(100deg,#1264ef,#129bea);color:#fff;font-size:20px;font-weight:700;box-shadow:0 5px 14px rgba(22,105,231,.22)}
#pdf-addon .app-download-card span{font-size:30px;line-height:1}
#pdf-addon .app-pdf-row{grid-template-columns:1fr}
#pdf-addon .app-pdf-row label{font-size:15px}
#pdf-addon .app-pdf-upload input[type=file]{min-height:48px;border-radius:12px}
@media(min-width:761px){#pdf-addon .app-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 18px}}
@media(max-width:760px){#pdf-addon .app-grid,#pdf-addon .app-media-grid{grid-template-columns:1fr}}

#pdf-addon .app-section h4{font-size:14px;color:#17345b;margin:0 0 14px;padding-bottom:9px;border-bottom:1px solid #dce7f0}
#pdf-addon .app-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px 16px}
#pdf-addon .app-field{display:flex;flex-direction:column;gap:6px;min-width:0;color:#304a66;font-size:12px;font-weight:600}
#pdf-addon .app-field input,#pdf-addon .app-field textarea,#pdf-addon .app-field select{width:100%;min-width:0;padding:10px 11px;border:1px solid #c9d7e5;border-radius:6px;background:#fff;color:#14243b;font:14px system-ui,"Noto Sans Bengali",Arial,sans-serif;min-height:40px}
#pdf-addon .app-field textarea{min-height:82px;resize:vertical}
#pdf-addon .app-field input:focus,#pdf-addon .app-field textarea:focus{outline:2px solid #b8d5ff;border-color:#3b82f6}
#pdf-addon .app-media-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
#pdf-addon .app-upload{border:1px dashed #bfd1e2;background:#f9fcff;border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:10px}
#pdf-addon .app-upload label{font-weight:600;color:#274563;font-size:12px}
#pdf-addon .app-upload input{display:block!important;width:100%;max-width:100%;font-size:12px}#pdf-addon input[type=file]{display:block!important;max-width:100%}
#pdf-addon .app-upload{border:1px solid #d8e5f2;background:linear-gradient(145deg,#fbfdff,#f2f7fd);border-radius:12px;padding:15px;box-shadow:0 2px 8px rgba(30,64,110,.045);min-width:0}
#pdf-addon .app-upload label{font-weight:700;color:#203e64;font-size:13px}
#pdf-addon .app-upload input[type=file]{display:block!important;width:100%;max-width:100%;font-size:12px;padding:9px;border:1px solid #d5e0ed;border-radius:8px;background:#fff;color:#40536b}
#pdf-addon .app-upload small{font-size:11px;color:#8293a8}
#pdf-addon .app-upload select{width:100%;padding:10px 12px;border:1px solid #d5e0ed;border-radius:8px;background:#fff;color:#233d5e;font-weight:600}
#pdf-addon .asset-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
#pdf-addon .asset-card{min-width:0;overflow:hidden;border:1px solid #d8e5f2;border-radius:12px;padding:0;background:#fff;box-shadow:0 3px 12px rgba(30,64,110,.055)}
#pdf-addon .asset-card>b{display:flex;align-items:center;gap:8px;padding:12px 14px;background:linear-gradient(90deg,#f3f7fd,#fff);border-bottom:1px solid #e4edf6;color:#203e64;font-size:12px;letter-spacing:.2px}
#pdf-addon .asset-card>b:before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:#4c7ed2}
#pdf-addon .asset-card>div{min-height:190px;padding:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;color:#7b8ba0;font-size:12px;background:#f8fbff}
#pdf-addon .asset-card img{display:block;max-width:100%;max-height:260px;width:auto;height:auto;object-fit:contain;border-radius:5px;box-shadow:0 2px 10px rgba(15,35,60,.12);background:#fff}
@media(max-width:980px){#pdf-addon .asset-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:760px){#pdf-addon .asset-grid{grid-template-columns:1fr}#pdf-addon .asset-card>div{min-height:150px}}
#pdf-addon .app-status{color:#536b83;font-size:12px;line-height:1.5;overflow-wrap:anywhere;margin:8px 0}
#pdf-addon details{background:#fff;border:1px solid #d9e5ee;border-radius:10px;margin-top:12px;padding:12px}
#pdf-addon summary{cursor:pointer;font-weight:700;color:#214b91}
#pdf-addon #addon-json{display:block;width:100%;margin:10px 0;background:#f8fbff;color:#14243b;border:1px solid #c9d7e5;border-radius:7px;padding:10px;font:12px ui-monospace,Consolas,monospace;min-height:160px}
#pdf-addon #addon-mappings{max-height:280px;overflow:auto;margin-top:10px;color:#243a53}
#pdf-addon #addon-mappings>div{padding:5px 0;border-bottom:1px solid #e5edf4}
#pdf-addon #addon-mappings select{background:#fff;color:#14243b;border:1px solid #c9d7e5;border-radius:6px;padding:8px;max-width:58%}
#pdf-addon .app-footer{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
#pdf-addon .app-footer button{flex:1 1 170px}
@media(max-width:760px){#pdf-addon{padding:11px;border-radius:0;margin-bottom:10px}#pdf-addon .app-grid,#pdf-addon .app-media-grid{grid-template-columns:1fr}#pdf-addon .app-head h3{font-size:17px}#pdf-addon .app-section{padding:11px}#pdf-addon .app-actions{width:100%}#pdf-addon .app-actions button{flex:1 1 130px}#pdf-addon .app-footer button{flex:1 1 100%}}
/* Final screenshot-matched overrides (placed last to win over legacy rules). */
#pdf-addon .app-section{background:#fff;border:1px solid #d9eaf6;border-radius:18px;padding:14px 16px;margin:12px 0;box-shadow:0 4px 16px rgba(35,105,160,.07)}
#pdf-addon .app-section h4{display:block;background:linear-gradient(90deg,#d9efff,#e8f6ff);border:0;border-radius:10px;padding:10px 13px;margin:0 0 14px;color:#12345b;font-size:17px;font-weight:700}
#pdf-addon .app-field{font-size:14px;font-weight:500;color:#26384d}
#pdf-addon .app-field input,#pdf-addon .app-field textarea,#pdf-addon .app-field select{border:1px solid #cbd7e2;border-radius:12px;min-height:48px;font-size:15px;padding:11px 13px}
#pdf-addon .app-field textarea{min-height:104px}
#pdf-addon .app-download-card{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;min-height:58px;margin:12px 0 0;border:0;border-radius:12px;background:linear-gradient(100deg,#1264ef,#129bea);color:#fff;font-size:20px;font-weight:700;box-shadow:0 5px 14px rgba(22,105,231,.22)}
#pdf-addon .app-download-card span{font-size:30px;line-height:1}
#pdf-addon .app-pdf-row{grid-template-columns:1fr}
#pdf-addon .app-pdf-row label{font-size:15px}
#pdf-addon .app-pdf-upload input[type=file]{min-height:48px;border-radius:12px}
@media(max-width:760px){#pdf-addon .app-grid,#pdf-addon .app-media-grid{grid-template-columns:1fr}}

/* Screenshot-accurate compact Bengali mobile form */
#pdf-addon{padding:10px;background:#eef8ff;border:0;border-radius:0;margin:0 0 10px;font-family:system-ui,"Noto Sans Bengali",Arial,sans-serif}
#pdf-addon .app-head{display:none}
#pdf-addon .app-top-uploads{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0 0 12px}
#pdf-addon .app-upload-tile{padding:0;border:0;background:transparent;box-shadow:none;gap:6px}
#pdf-addon .app-upload-tile>label{display:flex;align-items:center;gap:7px;flex-wrap:wrap;min-height:38px;padding:7px 9px;border-radius:10px;background:linear-gradient(90deg,#d7edff,#e8f5ff);font-size:12px;color:#17385e}
#pdf-addon .app-upload-tile>label .upload-icon{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:6px;background:#1477ef;color:white;font-size:16px}
#pdf-addon .app-upload-tile>label small{width:100%;padding-left:31px;margin-top:-7px;font-size:9px;font-weight:400;color:#71839a}
#pdf-addon .upload-drop{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:91px;padding:8px 4px;border:1px dashed #a9d0eb;border-radius:10px;background:linear-gradient(145deg,#fff,#f4fbff);text-align:center;color:#233d5d;overflow:hidden}
#pdf-addon .upload-cloud{display:flex;align-items:center;justify-content:center;width:40px;height:29px;border-radius:18px;background:#0879ed;color:white;font-size:23px;font-weight:700;line-height:1}
#pdf-addon .upload-drop b{font-size:11px}
#pdf-addon .upload-drop small{font-size:9px;color:#8a9aab}
#pdf-addon .upload-drop input[type=file]{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;z-index:2}
#pdf-addon .upload-drop select{position:relative;z-index:3;max-width:95%;font-size:10px;padding:2px;margin-top:3px}
#pdf-addon .app-section{padding:9px 10px;margin:7px 0;border-radius:13px;background:#fff;border:1px solid #e0f0fb;box-shadow:0 2px 10px rgba(30,113,171,.06)}
#pdf-addon .app-section h4{display:flex;align-items:center;gap:8px;padding:7px 9px;margin:0 0 7px;border-radius:8px;background:linear-gradient(90deg,#d9efff,#e7f6ff);font-size:13px;font-weight:700;color:#183b65}
#pdf-addon .app-section h4 span{font-size:16px;color:#1673e8}
#pdf-addon .app-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px 12px}
#pdf-addon .app-field{gap:3px;font-size:11px;font-weight:500;color:#34485f}
#pdf-addon .app-field input,#pdf-addon .app-field select{min-height:29px;height:29px;padding:4px 8px;border:1px solid #d1dce6;border-radius:7px;background:#fff;font-size:12px;box-shadow:inset 0 1px 2px rgba(0,0,0,.025)}
#pdf-addon .app-field textarea{min-height:73px;padding:7px 9px;border-radius:7px;font-size:11px}
#pdf-addon .app-download-card{min-height:42px;margin:8px 0 0;border-radius:8px;font-size:14px}
#pdf-addon .app-download-card span{font-size:21px}
#pdf-addon .app-status{font-size:10px;margin:5px 0}
#pdf-addon .app-pdf-upload{margin-top:8px}
@media(max-width:520px){#pdf-addon{padding:7px}#pdf-addon .app-top-uploads{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#pdf-addon .app-section{padding:8px;margin:6px 0}#pdf-addon .app-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 8px}#pdf-addon .app-field input,#pdf-addon .app-field select{font-size:11px;padding:4px 6px}#pdf-addon .app-field textarea{min-height:68px}}

#addon-sidebar-tools{margin:12px 8px;padding:12px;background:linear-gradient(145deg,#f8fcff,#eaf5ff);border:1px solid #c9e3f8;border-radius:12px;color:#17375d;box-shadow:0 5px 16px rgba(25,95,155,.09);font:13px system-ui,"Noto Sans Bengali",Arial,sans-serif}
#addon-sidebar-tools h3{font-size:14px;margin:0 0 5px;color:#1257b3}
#addon-sidebar-tools p{font-size:11px;color:#71839a;margin:0 0 9px}
#addon-sidebar-tools #addon-advanced{display:block!important;margin:0;padding:9px;border-radius:9px;background:#fff}
#addon-sidebar-tools #addon-advanced summary{font-size:12px}
#addon-sidebar-tools #addon-json{min-height:110px;font-size:11px}
#addon-sidebar-tools .app-actions button{font-size:11px;padding:7px 8px;min-height:32px}
</style>
<div class="app-head"><div><h3>NID তথ্য ফর্ম</h3><div class="app-sub">তথ্য পূরণ করুন অথবা PDF আপলোড করুন</div></div></div>
<div class="app-section app-pdf-upload"><h4>PDF Upload</h4><div class="app-pdf-row"><label for="addon-pdf">PDF ফাইল নির্বাচন করুন</label><input id="addon-pdf" type="file" accept="application/pdf,.pdf"><button id="addon-extract" type="button" hidden aria-hidden="true" style="display:none">Local PDF Extract</button></div></div>
<div class="app-media-grid app-top-uploads">
 <div class="app-upload app-upload-tile"><label for="addon-photo-file"><span class="upload-icon">▣</span><span>ফটো আপলোড</span><small>আপনার ছবি এখানে আপলোড করুন</small></label><div class="upload-drop"><span class="upload-cloud">↑</span><b>এখানে ফাইল আপলোড করুন</b><small>অথবা ফাইল নির্বাচন করুন</small><small>JPG, PNG (সর্বোচ্চ 2 MB)</small><input id="addon-photo-file" type="file" accept="image/*" aria-label="ফটো আপলোড"></div></div>
 <div class="app-upload app-upload-tile"><label for="addon-sign-file"><span class="upload-icon">▤</span><span>আইডি স্বাক্ষর</span><small>আইডি স্বাক্ষর আপলোড করুন</small></label><div class="upload-drop"><span class="upload-cloud">↑</span><b>এখানে ফাইল আপলোড করুন</b><small>অথবা ফাইল নির্বাচন করুন</small><small>JPG, PNG (সর্বোচ্চ 2 MB)</small><input id="addon-sign-file" type="file" accept="image/*" aria-label="আইডি স্বাক্ষর"><select id="addon-sign-type"><option value="signature">Signature</option><option value="fingerprint">Fingerprint</option></select></div></div>
</div>

<div class="app-section"><h4><span>▣</span> আইডি তথ্য</h4><div class="app-grid" id="addon-basic-fields"></div></div>
<div class="app-section"><h4><span>♟</span> ব্যক্তিগত তথ্য</h4><div class="app-grid" id="addon-personal-fields"></div></div>
<div class="app-section"><h4><span>♟♟</span> পারিবারিক তথ্য</h4><div class="app-grid" id="addon-family-fields"></div></div>
<div class="app-section"><h4><span>⌂</span> ঠিকানা</h4><div class="app-grid" id="addon-address-fields"></div></div>
<div class="app-actions app-main-actions" hidden aria-hidden="true" style="display:none"><button id="addon-map" type="button" class="secondary">Detect Fields</button><button id="addon-fill" type="button">HTML Auto Fill</button></div>
<button id="addon-download-card" class="app-download-card" type="button"><span aria-hidden="true">⇩</span> ডাউনলোড কার্ড</button>
<div class="app-status" id="addon-msg" role="status">PDF নির্বাচন করুন, তথ্য যাচাই করুন, তারপর ডাউনলোড কার্ড চাপুন।</div>
<div class="app-footer"><button id="addon-fill-bottom" type="button">HTML Preview-তে দেখুন</button><button id="addon-tools-jump" type="button" class="secondary">PDF / JSON Tools খুলুন</button></div>
<details id="addon-advanced"><summary>PDF / JSON Tools এবং Field Mapping</summary>
<textarea id="addon-json" rows="8" spellcheck="false" placeholder="Extracted JSON বা নিজের JSON পেস্ট করুন"></textarea>
<div class="app-actions"><button id="addon-json-parse" type="button" class="secondary">JSON থেকে ফর্ম পূরণ</button><button id="addon-download-photo" type="button" class="secondary">Download Photo</button><button id="addon-download-mark" type="button" class="secondary">Download Signature / Fingerprint</button></div>
<div id="addon-mappings"></div>
<hr style="border:0;border-top:1px solid #dce7f0;margin:14px 0">
<b>Photo / Signature / Fingerprint</b><p style="font-size:12px">JSON-এর userIMG / signIMG / fingerIMG ব্যবহার করুন, অথবা আলাদা ছবি আপলোড করুন।</p>
<label class="app-field">Image type <select id="addon-image-type"><option value="photo">Photo</option><option value="signature">Signature</option><option value="fingerprint">Fingerprint</option><option value="other">Other image</option></select></label>
<label class="app-field" style="margin-top:8px">Image <input id="addon-image" type="file" accept="image/*"></label><button id="addon-add-image" type="button" class="secondary" style="margin-top:8px">Add / Replace Image</button>
</details>`;
const staleAssetPreview=document.querySelectorAll('#extracted-asset-preview,.extracted-asset-preview,.asset-preview-grid,[data-role="extracted-asset-preview"]');
staleAssetPreview.forEach(el=>el.remove());
// Keep the complete PDF/JSON application inside the Tools Drawer.
const editorToolsActions=document.getElementById('allEditorActions');
if(editorToolsActions){
 ui.dataset.editorToolsPanel='true';
 editorToolsActions.append(ui);
}else{
 // Keep the PDF/JSON panel out of the main preview area even on older layouts.
 const editorToolsDrawer=document.querySelector('main>aside');
 if(editorToolsDrawer){
  ui.dataset.editorToolsPanel='true';
  editorToolsDrawer.append(ui);
 }
}
// Keep advanced JSON/field-mapping controls in the editor sidebar instead of the main form.
const toolsSidebar=document.querySelector('main>aside, #sidebar, .sidebar, [role="complementary"]');
const advancedTools=by('addon-advanced');
if(toolsSidebar&&advancedTools){
 const toolGroup=document.createElement('section');
 toolGroup.id='addon-sidebar-tools';
 toolGroup.innerHTML='<h3>☰ PDF / JSON / Editor Tools</h3><p>ফরম্যাট পেস্ট, Parse এবং HTML Auto Fill-এর অতিরিক্ত টুলস</p>';
 toolGroup.append(advancedTools);
 toolsSidebar.append(toolGroup);
}
const msg=s=>by('addon-msg').textContent=s;
const alias={name:['name','fullname','applicantname','নাম','আবেদনকারীরনাম'],nameBn:['namebn','banglaname','বাংলানাম'],nameEn:['nameen','englishname','ইংরেজিনাম'],fatherName:['fathername','father','পিতারনাম'],motherName:['mothername','mother','মাতারনাম'],birthDate:['birthdate','dob','dateofbirth','জন্মতারিখ'],dob:['dob','birthdate','dateofbirth','জন্মতারিখ','জন্মতারিখঃ','dateofbirth'],pinNumber:['pinnumber','pin','nid','nidnumber','nationalid','nationalidnumber','জাতীয়পরিচয়পত্রনম্বর','এনআইডি','জাতীয়পরিচয়পত্র'],birthPlace:['birthplace','placeofbirth','birthlocation','জন্মস্থান','জন্মস্থানেরনাম'],birthRegNo:['birthregno','brn','জন্মনিবন্ধন'],documentNumber:['documentnumber','idnumber','nidnumber','জাতীয়পরিচয়পত্রনম্বর'],gender:['gender','লিঙ্গ'],permanentAddress:['permanentaddress','স্থায়ীঠিকানা'],presentAddress:['presentaddress','বর্তমানঠিকানা'],address:['address','ঠিকানা'],mobile:['mobile','phone','মোবাইল'],bloodGroup:['bloodgroup','রক্তেরগ্রুপ']};
const normalize=s=>String(s||'').toLowerCase().replace(/[\s_\-.:()\[\]#]/g,'');
const fieldLabels={
nameBn:'Name (Bangla)',nameEn:'Name (English)',name:'Name',documentNumber:'NID Number',nidNumber:'NID Number',pinNumber:'PIN Code',birthDate:'Date of Birth',dob:'Date of Birth',birthPlace:'Birth Place',birthRegNo:'Birth Registration No',bloodGroup:'Blood Group',gender:'Gender',fatherName:'Father’s Name',fatherNameBn:'Father’s Name (Bangla)',fatherNameEn:'Father’s Name (English)',motherName:'Mother’s Name',motherNameBn:'Mother’s Name (Bangla)',motherNameEn:'Mother’s Name (English)',presentAddress:'Present Address (Full Text)',permanentAddress:'Permanent Address (Full Text)',address:'Address',mobile:'Mobile Number',nationality:'Nationality',issueDate:'Issue Date',voterArea:'Voter Area'
};
function displayLabel(key){const last=String(key).split('.').pop();return fieldLabels[last]||last.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,c=>c.toUpperCase())}
function formGroup(key){
 const k=normalize(String(key).split('.').pop());
 if(/^(documentnumber|nidnumber|pinnumber|birthregno|issu edate|issuedate)$/.test(k))return 'basic';
 if(/(father|mother|bloodgroup|nationality|gender)/.test(k))return 'family';
 if(/(address|village|postoffice|division|district|upazila|union|ward|birthplace)/.test(k))return 'address';
 if(/(name|dob|birthdate|dateofbirth|mobile|phone|occupation|marital)/.test(k))return 'personal';
 return 'personal';
}
function setPath(obj,path,value){const parts=String(path).split('.');let at=obj;for(let i=0;i<parts.length-1;i++){if(!at[parts[i]]||typeof at[parts[i]]!=='object')at[parts[i]]={};at=at[parts[i]]}at[parts[parts.length-1]]=value}
const permanentFieldDefaults={
 documentNumber:'',pinNumber:'',nameBn:'',nameEn:'',birthDate:'',birthPlace:'',
 fatherNameBn:'',fatherNameEn:'',motherNameBn:'',motherNameEn:'',bloodGroup:'',
 issueDate:'',permanentAddress:'',presentAddress:'',gender:'',nationality:'',
 mobile:'',voterArea:''
};
function renderForm(data){
 const groups={basic:by('addon-basic-fields'),personal:by('addon-personal-fields'),family:by('addon-family-fields'),address:by('addon-address-fields')};
 Object.values(groups).forEach(el=>el.replaceChildren());
 // Fixed screenshot-matched field layout: extracted extra keys stay in JSON but
 // never add/remove visible controls, so the form cannot jump when a PDF is loaded.
 const source=(data&&typeof data==='object')?data:{};
 const fields=[
  ['documentNumber','basic','আইডি নাম্বার','text',['documentNumber','nidNumber','idNumber']],
  ['pinNumber','basic','পিন নাম্বার','text',['pinNumber','pin','pinCode']],
  ['nameBn','personal','নাম (বাংলা)','text',['nameBn','banglaName','name']],
  ['nameEn','personal','নাম (ইংরেজি)','text',['nameEn','englishName']],
  ['birthDate','personal','জন্ম তারিখ','date',['birthDate','dob','dateOfBirth']],
  ['birthPlace','personal','জন্মস্থান','text',['birthPlace','placeOfBirth']],
  ['fatherNameBn','family','পিতার নাম','text',['fatherNameBn','fatherName','father']],
  ['motherNameBn','family','মাতার নাম','text',['motherNameBn','motherName','mother']],
  ['bloodGroup','family','রক্তের গ্রুপ','select',['bloodGroup']],
  ['issueDate','family','ইস্যু তারিখ','date',['issueDate']],
  ['address','address','ঠিকানা','textarea',['address','permanentAddress','presentAddress']]
 ];
 const normalized=k=>String(k||'').toLowerCase().replace(/[\s_.-]/g,'');
 for(const [key,group,label,type,aliases] of fields){
  const found=Object.keys(source).find(k=>aliases.some(a=>normalized(a)===normalized(k)));
  const value=found!==undefined?source[found]:(permanentFieldDefaults[key]||'');
  const wrap=document.createElement('label');wrap.className='app-field';wrap.title=key;
  const caption=document.createElement('span');caption.textContent=label;
  let input;
  if(type==='textarea'){input=document.createElement('textarea');}
  else if(type==='select'){input=document.createElement('select');['','A+','A-','B+','B-','O+','O-','AB+','AB-'].forEach(v=>input.add(new Option(v||'Select',v)));}
  else {input=document.createElement('input');input.type=type==='date'?'date':'text';}
  input.value=String(value??'');input.dataset.jsonKey=found!==undefined?found:key;input.autocomplete='off';
  input.addEventListener('input',()=>{try{const raw=JSON.parse(by('addon-json').value||'{}');setPath(raw,input.dataset.jsonKey,input.value);by('addon-json').value=JSON.stringify(raw,null,2)}catch{}});
  wrap.append(caption,input);groups[group].append(wrap);
 }
}
async function imageToDataURL(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file)})}
async function setMediaFromFile(file,role){
 if(!file)return;const dataUrl=await imageToDataURL(file);let raw={};try{raw=JSON.parse(by('addon-json').value||'{}')}catch{}
 if(role==='photo')raw.userIMG=dataUrl;else{delete raw.signIMG;delete raw.fingerIMG;delete raw.fingerprintIMG;if(role==='fingerprint'){raw.fingerIMG=dataUrl;raw.markType='fingerprint'}else{raw.signIMG=dataUrl;raw.markType='signature'}}
 by('addon-json').value=JSON.stringify(raw,null,2);msg(`${role==='photo'?'Photo':'Signature/Fingerprint'} JSON-এ যোগ হয়েছে। HTML Auto Fill চাপুন।`);
}

function flatten(obj,prefix='',out={}){for(const [k,v] of Object.entries(obj||{})){const path=prefix?prefix+'.'+k:k;if(v&&typeof v==='object'&&!Array.isArray(v))flatten(v,path,out);else if(typeof v==='string'||typeof v==='number')out[path]=v}return out}
function getData(){let parsed=JSON.parse(by('addon-json').value);return flatten(parsed)}
function targetNodes(){if(!doc)throw Error('আগে HTML/CSS প্রজেক্ট খুলুন');return [...doc.body.querySelectorAll('*')].filter(el=>!['SCRIPT','STYLE','BR','META','LINK'].includes(el.tagName)&&(el.children.length===0||['INPUT','TEXTAREA','IMG'].includes(el.tagName)))}
function score(el,key){const nk=normalize(key.split('.').pop());const known=[nk,...(alias[key.split('.').pop()]||[])];const hints=[el.id,el.getAttribute('name'),el.getAttribute('data-field'),el.getAttribute('placeholder'),el.getAttribute('aria-label'),el.getAttribute('title'),el.getAttribute('class'),el.textContent?.trim().length<65?el.textContent:''].filter(Boolean).map(normalize);let best=0;for(const hint of hints)for(const word of known){const w=normalize(word);if(w&&hint===w)best=Math.max(best,100);else if(w&&hint.includes(w)&&w.length>=4)best=Math.max(best,65)}return best}
// Match the supplied HTML by exact CSS class, never by guessed text labels.
const templateMap=window.VisualEditorTemplateMap||{};
function preferredKey(data,keys){return keys.find(k=>data[k]!==undefined&&data[k]!==null&&String(data[k]).trim()&&!/^(Father Name|Mother Name)$/i.test(String(data[k]).trim()))}
function formatted(key,value){const v=String(value).trim();if(/(^|\.)(nameEn|englishName|fatherNameEn|motherNameEn)$/i.test(key))return v.toUpperCase();if(key==='dob'||key==='birthDate'){const m=v.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/);if(m)return `${m[1].padStart(2,'0')} ${m[2]} ${m[3]}`;}return v}
function fillTemplate(data){let done=0,missing=[];for(const [selector,keys] of Object.entries(templateMap)){const key=preferredKey(data,keys);if(!key)continue;const elements=[...doc.querySelectorAll(selector)];if(!elements.length){missing.push(selector);continue;}for(const el of elements){const val=formatted(key,data[key]);if(el.tagName==='INPUT'||el.tagName==='TEXTAREA')el.value=val;else el.textContent=val;done++;}}return {done,missing}}
let rows=[];let lastDataText='';
function detect(){lastDataText=by('addon-json').value;const data=getData(),nodes=targetNodes(),keys=Object.keys(data).filter(k=>!/^data:image\//.test(String(data[k])));renderForm(data);rows=[];const panel=by('addon-mappings');panel.replaceChildren();for(const key of keys){let best=-1,points=0;nodes.forEach((el,i)=>{const n=score(el,key);if(n>points){points=n;best=i}});const line=document.createElement('div');line.style.cssText='display:flex;gap:5px;margin:5px 0;align-items:center';const label=document.createElement('span');label.style.cssText='flex:1;overflow:hidden;text-overflow:ellipsis';label.textContent=key;const sel=document.createElement('select');sel.style.width='55%';sel.add(new Option('— Skip —',''));nodes.forEach((el,i)=>{let description=[el.id,el.getAttribute('name'),el.getAttribute('data-field'),el.getAttribute('placeholder')].filter(Boolean).join(' / ')||el.textContent.trim().slice(0,24)||el.tagName;sel.add(new Option(`${i}: ${description}`,String(i)))});sel.value=best>=0?String(best):'';line.append(label,sel);panel.append(line);rows.push({key,sel})}msg(`${keys.length} fields found. Mapping যাচাই করুন।`)}
by('addon-extract').onclick=async()=>{
 const file=by('addon-pdf').files[0];
 if(!file)return msg('PDF নির্বাচন করুন');
 msg('PDF Extract হচ্ছে… Signature থাকলে Background Removal-ও স্বয়ংক্রিয়ভাবে চলবে।');
 try{
  const res=await fetch('/api/extract',{method:'POST',headers:{'Content-Type':'application/pdf'},body:file});
  const result=await res.json();
  if(!res.ok||!result.ok)throw Error(result.error||'Extraction failed');
  const extracted=result.data||{};
  by('addon-json').value=JSON.stringify(extracted,null,2);
  updateInlineAssetPreview(extracted);
  const extractedKind=String(extracted.markType||extracted.imageType||extracted.type||'').toLowerCase();
  const extractedSignature=imageData(extracted.signIMG)||imageData(extracted.signatureIMG)||imageData(extracted.signature);
  const isFingerprint=extractedKind.includes('finger') || (!imageData(extracted.signIMG) && (imageData(extracted.fingerIMG)||imageData(extracted.fingerprintIMG)));
  let backgroundStatus='';
  if(extractedSignature && !isFingerprint){
   // Reset a previous job's Fingerprint selection; otherwise the remover refuses to run.
   by('addon-sign-type').value='signature';
   if(!imageData(extracted.signIMG)) extracted.signIMG=extractedSignature;
   extracted.markType='signature';
   by('addon-json').value=JSON.stringify(extracted,null,2);
   updateInlineAssetPreview(extracted);
   const removed=await removeExtractedSignatureBackground({silent:true});
   backgroundStatus=removed?' Signature background স্বয়ংক্রিয়ভাবে সরানো হয়েছে।':' Signature পাওয়া গেছে, কিন্তু Background Removal সম্পন্ন হয়নি।';
  } else if(isFingerprint){
   by('addon-sign-type').value='fingerprint';
   backgroundStatus=' Fingerprint শনাক্ত হয়েছে, তাই Background Removal চালানো হয়নি।';
  } else {
   backgroundStatus=' এই PDF-এ Extracted Signature পাওয়া যায়নি, তাই Background Removal চালানো যায়নি।';
  }
  const finalExtracted=JSON.parse(by('addon-json').value||'{}');
  updateInlineAssetPreview(finalExtracted);detect();
  by('addon-fill').click();
  msg('PDF Extract সম্পন্ন। Field Mapping ও HTML Auto Fill স্বয়ংক্রিয়ভাবে সম্পন্ন হয়েছে।'+backgroundStatus);
 }catch(e){msg('PDF Extract error: '+e.message+' — RUN-LOCAL-WINDOWS.bat দিয়ে চালু করুন এবং requirements ইনস্টল করুন।')}
};
by('addon-pdf').addEventListener('change',()=>{
  const f=by('addon-pdf').files && by('addon-pdf').files[0];
  if(!f) return;
  const key=[f.name,f.size,f.lastModified].join(':');
  if(window.__lastAutoPdfKey===key) return;
  window.__lastAutoPdfKey=key;
  by('addon-extract').click();
});
by('addon-map').onclick=()=>{try{detect()}catch(e){msg(e.message)}};
by('addon-fill').onclick=()=>{try{const data=getData(),nodes=targetNodes();if(!rows.length||lastDataText!==by('addon-json').value)detect();let count=0;snap();const exact=fillTemplate(data);count+=exact.done;const mediaCount=fillMedia(data);count+=mediaCount;for(const {key,sel} of rows){if(Object.values(templateMap).some(keys=>keys.includes(key)))continue;if(sel.value==='')continue;const el=nodes[Number(sel.value)];if(!el)continue;let val=String(data[key]??'');if(/^data:image\//.test(val))continue;if(/(^|\.)(nameEn|englishName|fatherNameEn|motherNameEn)$/i.test(key))val=val.toUpperCase();if(key==='dob'||key==='birthDate'){const d=new Date(val);if(!Number.isNaN(d.getTime()) && /^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}$/.test(val.trim()))val=String(d.getUTCDate()).padStart(2,'0')+'/'+String(d.getUTCMonth()+1).padStart(2,'0')+'/'+d.getUTCFullYear();}if(el.tagName==='INPUT'||el.tagName==='TEXTAREA'){el.setAttribute('value',val);if(el.tagName==='TEXTAREA')el.textContent=val}else if(el.tagName!=='IMG')el.textContent=val;else continue;count++}render();msg(`${count}টি HTML Field পূরণ হয়েছে। Exact HTML matching: ${exact.done}; Images: ${mediaCount}; unmatched selectors: ${exact.missing.join(', ')||'none'}. Export ZIP দিয়ে Save করুন।`)}catch(e){msg('Auto Fill error: '+e.message)}};
// Media mapping uses actual image data and keeps distinct image types.
const mediaSelectors={photo:'[data-image-role="photo"],.field-photo,.field-user-photo,.field-portrait',signature:'[data-image-role="signature"],.field-signature,.field-sign',fingerprint:'[data-image-role="fingerprint"],.field-fingerprint,.field-finger'};
function imageData(v){return typeof v==='string' && /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=\s]+$/i.test(v.trim())?v.trim():null}

// Render extracted assets inside the existing Photo and Signature/Fingerprint upload areas.
// No separate preview panel is created; each image stays associated with its original upload control.
function ensureInlineAssetPreview(role, title) {
 const input = by(role==='photo' ? 'addon-photo-file' : 'addon-sign-file');
 const host = input && input.closest('.app-upload');
 if (!host) return null;
 let wrap = host.querySelector(`[data-inline-extracted-preview="${role}"]`);
 if (!wrap) {
  wrap = document.createElement('div');
  wrap.dataset.inlineExtractedPreview = role;
  wrap.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:10px;padding-top:8px;border-top:1px solid #dce7f0;min-width:0;';
  const img = document.createElement('img');
  img.alt = title + ' extracted preview';
  img.style.cssText = 'display:none;max-width:150px;max-height:115px;width:auto;height:auto;object-fit:contain;border:1px solid #dce7f0;border-radius:5px;background:#fff;padding:3px;';
  const details = document.createElement('div');
  details.style.cssText = 'display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;gap:8px;min-width:0;';
  const info = document.createElement('div');
  info.className = 'inline-asset-info';
  info.style.cssText = 'font-size:12px;color:#475569;overflow-wrap:anywhere;';
  info.textContent = title + ': Not Found';
  details.append(info);
  if (role === 'signature') {
   const rotateBtn = document.createElement('button');
   rotateBtn.type = 'button';
   rotateBtn.id = 'addon-rotate-mark';
   rotateBtn.className = 'secondary';
   rotateBtn.textContent = 'Rotate 0° / 90° / 180° / 270°';
   rotateBtn.style.cssText = 'display:none;padding:8px 11px;min-height:34px;font-size:12px;';
   rotateBtn.addEventListener('click', rotateExtractedMark);
   const removeBtn = document.createElement('button');
   removeBtn.type = 'button';
   removeBtn.id = 'addon-remove-sign-background';
   removeBtn.className = 'secondary';
   removeBtn.textContent = 'Remove Signature Background';
   removeBtn.style.cssText = 'display:none;padding:8px 11px;min-height:34px;font-size:12px;';
   removeBtn.addEventListener('click', removeExtractedSignatureBackground);
   const nameInput = document.createElement('input');
   nameInput.id = 'addon-name-mark';
   nameInput.type = 'text';
   nameInput.placeholder = 'বাংলা বা English নাম লিখুন';
   nameInput.autocomplete = 'off';
   nameInput.style.cssText = 'display:none;width:100%;max-width:260px;padding:8px 10px;border:1px solid #c9d7e5;border-radius:7px;font:13px system-ui,"Noto Sans Bengali",Arial,sans-serif;';
   const createBtn = document.createElement('button');
   createBtn.type = 'button';
   createBtn.id = 'addon-create-name-mark';
   createBtn.className = 'secondary';
   createBtn.textContent = 'Create Name Mark';
   createBtn.style.cssText = 'display:none;padding:8px 11px;min-height:34px;font-size:12px;';
   createBtn.addEventListener('click', createNameMarkFromInput);
   const flowBtn = document.createElement('button');
   flowBtn.type = 'button';
   flowBtn.id = 'addon-create-flowing-signature';
   flowBtn.className = 'secondary';
   flowBtn.textContent = 'Create Flowing Signature';
   flowBtn.style.cssText = 'display:none;padding:8px 11px;min-height:34px;font-size:12px;';
   flowBtn.addEventListener('click', createFlowingSignatureFromInput);
   details.append(rotateBtn, removeBtn, nameInput, createBtn, flowBtn);
  }
  wrap.append(img, details);
  host.append(wrap);
 }
 return wrap;
}
let fingerprintAutoRotateBusy = false;
function scheduleFingerprintAutoRotation(data) {
 if (fingerprintAutoRotateBusy) return;
 const jsonBox = by('addon-json');
 if (!jsonBox) return;
 let raw;
 try { raw = JSON.parse(jsonBox.value || '{}'); } catch (_) { return; }
 // An explicit saved angle (including 0°) means this fingerprint was already handled.
 if (Object.prototype.hasOwnProperty.call(raw, 'fingerRotation')) return;
 const keys = ['fingerIMG','fingerprintIMG','fingerprint','fingerImage'];
 let key = keys.find(k => imageData(raw[k]));
 if (!key && String(raw.markType || '').toLowerCase().includes('finger')) {
   key = ['signIMG','signatureIMG','signature','signImage'].find(k => imageData(raw[k]));
 }
 if (!key) return;
 fingerprintAutoRotateBusy = true;
 (async () => {
  try {
   const img = new Image();
   await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Fingerprint image load failed'));img.src=raw[key];});
   const canvas = document.createElement('canvas');
   canvas.width = img.naturalHeight; canvas.height = img.naturalWidth;
   const ctx = canvas.getContext('2d');
   ctx.translate(canvas.width/2, canvas.height/2); ctx.rotate(Math.PI/2);
   ctx.drawImage(img, -img.naturalWidth/2, -img.naturalHeight/2);
   raw[key] = canvas.toDataURL('image/png');
   raw.fingerRotation = 90;
   raw.markType = 'fingerprint';
   // Only overwrite if the JSON still contains the same source; avoid clobbering user edits.
   const latest = JSON.parse(jsonBox.value || '{}');
   if (!Object.prototype.hasOwnProperty.call(latest, 'fingerRotation') && imageData(latest[key])) {
    jsonBox.value = JSON.stringify({...latest, [key]: raw[key], fingerRotation: 90, markType: 'fingerprint'}, null, 2);
    updateInlineAssetPreview(JSON.parse(jsonBox.value));
    // Critical: write the rotated image into the actual loaded HTML document too.
    // Export ZIP serializes `doc`, not the JSON preview, so preview-only updates are lost.
    if (doc) { try { placeMedia('fingerprint', raw[key], 'Fingerprint'); render(); } catch (e) { console.warn('Could not persist fingerprint into HTML:', e); } }
    const btn = by('addon-rotate-mark'); if (btn) btn.textContent = 'Rotate: 90° (0° / 90° / 180° / 270°)';
    msg('Fingerprint 90° Rotate করে JSON ও HTML দুটিতেই বসানো হয়েছে। Export ZIP করলে HTML-এ থাকবে।');
   }
  } catch (e) { console.warn('Fingerprint auto-rotation skipped:', e); }
  finally { fingerprintAutoRotateBusy = false; }
 })();
}

function updateInlineAssetPreview(data) {
 const photo = imageData(data.userIMG)||imageData(data.photoIMG)||imageData(data.photo);
 const sign = imageData(data.signIMG);
 const finger = imageData(data.fingerIMG)||imageData(data.fingerprintIMG);
 const kind = String(data.markType||'').toLowerCase();
 const signature = sign && !kind.includes('finger') ? sign : null;
 const fingerprint = finger || (sign && kind.includes('finger') ? sign : null);
 // New extracted fingerprints default to 90° exactly once. Persist the rotated pixels
 // and the angle in the JSON so preview/export/next load use the same orientation.
 if (fingerprint) scheduleFingerprintAutoRotation(data);
 const items = [
  ['photo','Photo',photo,'Photo'],
  ['signature','Signature',signature,'Signature'],
  ['fingerprint','Fingerprint',fingerprint,'Fingerprint']
 ];
 for (const [role,title,src,label] of items) {
  const wrap = ensureInlineAssetPreview(role==='photo'?'photo':role, title);
  if (!wrap) continue;
  const img = wrap.querySelector('img');
  const info = wrap.querySelector('.inline-asset-info');
  if (src) {
   img.src = src; img.style.display='block';
   info.textContent = `${label} · Extracted preview`;
   const canEditSignature = label === 'Signature' && by('addon-sign-type').value === 'signature';
   const rotateBtn = wrap.querySelector('#addon-rotate-mark');
   const removeBtn = wrap.querySelector('#addon-remove-sign-background');
   const nameInput = wrap.querySelector('#addon-name-mark');
   if (rotateBtn) rotateBtn.style.display = src ? 'inline-flex' : 'none';
   const createBtn = wrap.querySelector('#addon-create-name-mark');
   const flowBtn = wrap.querySelector('#addon-create-flowing-signature');
   if (removeBtn) removeBtn.style.display = canEditSignature ? 'inline-flex' : 'none';
   if (nameInput) nameInput.style.display = canEditSignature ? 'block' : 'none';
   if (createBtn) createBtn.style.display = canEditSignature ? 'inline-flex' : 'none';
   if (flowBtn) flowBtn.style.display = canEditSignature ? 'inline-flex' : 'none';
   img.onerror = () => { img.removeAttribute('src'); img.style.display='none'; info.textContent = `${label}: Preview failed`; };
  } else {
   img.removeAttribute('src'); img.style.display='none';
   info.textContent = `${label}: Not Found`;
   const rotateBtn = wrap.querySelector('#addon-rotate-mark');
   const removeBtn = wrap.querySelector('#addon-remove-sign-background');
   if (rotateBtn) rotateBtn.style.display = 'none';
   if (removeBtn) removeBtn.style.display = 'none';
  }
 }
 // Signature and fingerprint share the existing Signature/Fingerprint upload area.
 const signHost = by('addon-sign-file')?.closest('.app-upload');
 if (signHost) {
  const fp = signHost.querySelector('[data-inline-extracted-preview="fingerprint"]');
  if (fp) fp.style.display = 'none'; // use one existing upload location, not an extra UI card
  const wrap = ensureInlineAssetPreview('signature','Signature / Fingerprint');
  if (wrap) {
   const img=wrap.querySelector('img'), info=wrap.querySelector('.inline-asset-info');
   const src = fingerprint || signature;
   const label = fingerprint ? 'Fingerprint' : 'Signature';
   if (src) { img.src=src; img.style.display='block'; info.textContent=`${label} · Extracted preview`; const rb=wrap.querySelector('#addon-rotate-mark'); if(rb){rb.style.display='inline-flex';rb.textContent='Rotate: 0° / 90° / 180° / 270°';} const rm=wrap.querySelector('#addon-remove-sign-background'); if(rm)rm.style.display=label==='Signature'?'inline-flex':'none'; const ni=wrap.querySelector('#addon-name-mark'); if(ni)ni.style.display=label==='Signature'?'block':'none'; const cb=wrap.querySelector('#addon-create-name-mark'); if(cb)cb.style.display=label==='Signature'?'inline-flex':'none'; const fb=wrap.querySelector('#addon-create-flowing-signature'); if(fb)fb.style.display=label==='Signature'?'inline-flex':'none'; }
   else { img.removeAttribute('src'); img.style.display='none'; info.textContent='Signature / Fingerprint: Not Found'; const rb=wrap.querySelector('#addon-rotate-mark'); if(rb)rb.style.display='none'; }
  }
 }
}
// Rotate the currently selected signature or fingerprint clockwise by 90 degrees.
// The rotated pixels are saved back to JSON and refreshed in preview/HTML, not merely CSS-transformed.
async function rotateExtractedMark(){
 try{
  const raw=JSON.parse(by('addon-json').value||'{}');
  const selected=String(by('addon-sign-type')?.value||'').toLowerCase();
  const fingerKeys=['fingerIMG','fingerprintIMG','fingerprint','fingerImage'];
  const signKeys=['signIMG','signatureIMG','signature','signImage'];
  let role=selected.includes('finger')?'fingerprint':'signature';
  let keys=role==='fingerprint'?[...fingerKeys,...signKeys]:[...signKeys,...fingerKeys];
  let key=keys.find(k=>imageData(raw[k]));
  if(!key) throw Error('ঘোরানোর জন্য Extracted Signature/Fingerprint পাওয়া যায়নি। PDF Extract করে আবার চেষ্টা করুন।');
  if(fingerKeys.includes(key)||(key==='signIMG'&&String(raw.markType||'').toLowerCase().includes('finger'))) role='fingerprint';
  const src=raw[key], img=new Image();
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('ছবি লোড হয়নি।'));img.src=src;});
  const stateKey=role==='fingerprint'?'fingerRotation':'signRotation';
  // Rotate the current pixels exactly +90° each click; angle is only the saved label/state.
  // This avoids applying an absolute angle to pixels that were already rotated.
  const previousAngle=((Number(raw[stateKey])||0)%360+360)%360;
  const angle=(previousAngle+90)%360;
  const swap=img.naturalWidth===img.naturalHeight?false:true;
  const canvas=document.createElement('canvas'); canvas.width=img.naturalHeight; canvas.height=img.naturalWidth;
  const ctx=canvas.getContext('2d'); ctx.translate(canvas.width/2,canvas.height/2); ctx.rotate(Math.PI/2); ctx.drawImage(img,-img.naturalWidth/2,-img.naturalHeight/2);
  const rotated=canvas.toDataURL('image/png'); raw[key]=rotated; raw[stateKey]=angle; raw.markType=role;
  by('addon-json').value=JSON.stringify(raw,null,2); updateInlineAssetPreview(raw);
  if(doc){
   if(role==='fingerprint') {
    // Ensure the rotated base64 pixels are embedded in the source HTML document.
    // Create the fingerprint element if the template has no matching placeholder.
    try { placeMedia('fingerprint', rotated, 'Fingerprint'); } catch (e) { console.warn('Fingerprint HTML sync failed:', e); }
   } else {
    const selector=mediaSelectors.signature;
    doc.querySelectorAll(selector).forEach(el=>{if(el.tagName==='IMG'){el.setAttribute('src',rotated);el.style.transform='rotate(0deg)';el.dataset.rotationDegrees='0';}});
   }
   try{render()}catch(_){}
  }
  // Save the fingerprint's box position and rotation in the editor's permanent layout store.
  if(role==='fingerprint') { try { document.getElementById('layout-save')?.click(); } catch(_) {} }
  const btn=by('addon-rotate-mark'); if(btn)btn.textContent='Rotate: '+angle+'° (0° / 90° / 180° / 270°)';
  msg((role==='fingerprint'?'Fingerprint':'Signature')+' '+angle+'° করা হয়েছে। Project ZIP Export/Save Project করলে পরিবর্তনটি HTML-এ থাকবে।');
 }catch(e){msg('Rotate হয়নি: '+e.message)}
}

// Remove a light/white signature background into real PNG alpha. The output stays a PNG
// data URL, so HTML preview and print render transparent pixels instead of a black rectangle.
async function removeExtractedSignatureBackground(options={}) {
 try {
  if (by('addon-sign-type').value !== 'signature') throw Error('আগে Signature নির্বাচন করুন।');
  const raw = JSON.parse(by('addon-json').value || '{}');
  const key = imageData(raw.signIMG) ? 'signIMG' : (imageData(raw.signatureIMG) ? 'signatureIMG' : (imageData(raw.signature) ? 'signature' : ''));
  if (!key) throw Error('JSON-এ Extracted Signature পাওয়া যায়নি। PDF আবার Extract করুন।');
  const src = raw[key];
  const img = new Image();
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Signature image লোড হয়নি।'));img.src=src;});
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(img,0,0);
  const frame = ctx.getImageData(0,0,canvas.width,canvas.height);
  const px = frame.data, w=canvas.width, h=canvas.height;

  // TYPE GATE: process only dark handwriting on a mostly opaque, light neutral
  // paper scan. Skip already-transparent PNGs, photos, dark/colorful backgrounds
  // and other image types so cleanup cannot damage unrelated extracted assets.
  const pixelCount=w*h;
  let opaqueCount=0, transparentCount=0, darkCount=0, lightCount=0;
  let borderLight=0, borderTotal=0;
  const inspect=(p,isBorder)=>{
   const i=p*4,a=px[i+3];
   if(a<16){transparentCount++;if(isBorder)borderTotal++;return}
   opaqueCount++;
   const r=px[i],g=px[i+1],b=px[i+2];
   const lum=0.2126*r+0.7152*g+0.0722*b;
   const spread=Math.max(r,g,b)-Math.min(r,g,b);
   if(lum<145)darkCount++;
   if(lum>180&&spread<85)lightCount++;
   if(isBorder){borderTotal++;if(lum>145&&spread<100)borderLight++}
  };
  for(let x=0;x<w;x++){inspect(x,true);inspect((h-1)*w+x,true)}
  for(let y=1;y<h-1;y++){inspect(y*w,true);inspect(y*w+w-1,true)}
  opaqueCount=0;transparentCount=0;darkCount=0;lightCount=0;
  for(let p=0;p<pixelCount;p++)inspect(p,false);
  const opaqueRatio=opaqueCount/Math.max(1,pixelCount);
  const darkRatio=darkCount/Math.max(1,opaqueCount);
  const lightRatio=lightCount/Math.max(1,opaqueCount);
  const borderPaperRatio=borderLight/Math.max(1,borderTotal);
  // Preserve gray scanned-paper signatures like the user's examples.
  // Only activate this guard when most border pixels are neutral gray and
  // their average brightness is below white/off-white paper.
  let borderLumSum=0,borderNeutralCount=0,borderOpaqueCount=0;
  const measureGrayBorder=(p)=>{
   const i=p*4;
   if(px[i+3]<16)return;
   const r=px[i],g=px[i+1],b=px[i+2];
   const lum=0.2126*r+0.7152*g+0.0722*b;
   const spread=Math.max(r,g,b)-Math.min(r,g,b);
   borderLumSum+=lum;borderOpaqueCount++;
   if(spread<=38)borderNeutralCount++;
  };
  for(let x=0;x<w;x++){measureGrayBorder(x);measureGrayBorder((h-1)*w+x);}
  for(let y=1;y<h-1;y++){measureGrayBorder(y*w);measureGrayBorder(y*w+w-1);}
  const avgBorderLum=borderLumSum/Math.max(1,borderOpaqueCount);
  const neutralBorderRatio=borderNeutralCount/Math.max(1,borderOpaqueCount);
  if(avgBorderLum<188 && neutralBorderRatio>=0.62){
   if(!options.silent)msg('ধূসর স্ক্যান ব্যাকগ্রাউন্ড শনাক্ত হয়েছে। সিগনেচারের ব্যাকগ্রাউন্ড অপরিবর্তিত রাখা হয়েছে।');
   return false;
  }
  if(opaqueRatio<0.88){
   if(!options.silent)msg('এই সিগনেচারটি আগে থেকেই transparent বা non-standard image। নিরাপত্তার জন্য Background Removal চালানো হয়নি।');
   return false;
  }
  if(borderPaperRatio<0.42||lightRatio<0.28||darkRatio<0.015){
   if(!options.silent)msg('এই ইমেজটি হালকা কাগজের ওপর গাঢ় সিগনেচার ধরনের নয়। নিরাপত্তার জন্য Background Removal চালানো হয়নি।');
   return false;
  }
  // Estimate the paper/background from the image border, then remove only
  // near-white pixels connected to the border. This avoids turning the whole
  // image black when transparency is later rendered/printed.
  const lumAt=(i)=>0.2126*px[i]+0.7152*px[i+1]+0.0722*px[i+2];
  const n=w*h, seen=new Uint8Array(n), queue=new Int32Array(n);
  let head=0,tail=0;
  // Estimate paper tone from all four borders; scanned paper may be cream,
  // gray or slightly tinted rather than pure white.
  let br=0,bg=0,bb=0,bc=0;
  const sampleBorder=(p)=>{
   const i=p*4;
   if(px[i+3]<16)return;
   const lum=lumAt(i), spread=Math.max(px[i],px[i+1],px[i+2])-Math.min(px[i],px[i+1],px[i+2]);
   if(lum>150 && spread<105){br+=px[i];bg+=px[i+1];bb+=px[i+2];bc++;}
  };
  for(let x=0;x<w;x++){sampleBorder(x);sampleBorder((h-1)*w+x);}
  for(let y=1;y<h-1;y++){sampleBorder(y*w);sampleBorder(y*w+w-1);}
  const paperR=bc?br/bc:245, paperG=bc?bg/bc:245, paperB=bc?bb/bc:245;
  const isPaper=(p)=>{
   const i=p*4, a=px[i+3];
   if(a===0)return true;
   const lum=lumAt(i), spread=Math.max(px[i],px[i+1],px[i+2])-Math.min(px[i],px[i+1],px[i+2]);
   const colorDistance=Math.sqrt((px[i]-paperR)**2+(px[i+1]-paperG)**2+(px[i+2]-paperB)**2);
   // Aggressive but adaptive flood-fill: remove border-connected paper tones,
   // while protecting dark strokes and strongly colored ink.
   return (lum>=158 && spread<=112 && colorDistance<=92) || (lum>=205 && spread<=135);
  };
  const push=(p)=>{if(p<0||p>=n||seen[p]||!isPaper(p))return;seen[p]=1;queue[tail++]=p;};
  for(let x=0;x<w;x++){push(x);push((h-1)*w+x)}
  for(let y=0;y<h;y++){push(y*w);push(y*w+w-1)}
  while(head<tail){const p=queue[head++],x=p%w,y=(p/w)|0;
   if(x>0)push(p-1);if(x+1<w)push(p+1);if(y>0)push(p-w);if(y+1<h)push(p+w);
  }
  let removed=0;
  for(let p=0;p<n;p++){
   const i=p*4;
   if(seen[p]){px[i+3]=0;removed++;continue;}
   // Remove residual light paper/halo while keeping anti-aliased signature ink.
   const lum=lumAt(i);
   const spread=Math.max(px[i],px[i+1],px[i+2])-Math.min(px[i],px[i+1],px[i+2]);
   if(lum>=232 && spread<=92){px[i+3]=0;removed++;continue;}
   // Stronger halo cleanup for pale neutral pixels; preserve strongly colored
   // ink and darker anti-aliased strokes.
   if(lum>172 && spread<=96){
    const alpha=Math.max(0,Math.min(255,Math.round((232-lum)/60*255)));
    px[i+3]=Math.min(px[i+3],alpha);
    if(alpha<8)removed++;
   }
  }
  if(removed < n*0.02) throw Error('সাদা ব্যাকগ্রাউন্ড স্পষ্টভাবে শনাক্ত হয়নি। অন্য Signature image দিয়ে চেষ্টা করুন।');
  // Remove isolated straight scanner/paper-edge artifacts only when they sit
  // outside the actual signature ink area. This deliberately leaves the rest
  // of the image-processing and editor logic unchanged.
  const ink = new Uint8Array(n);
  let minX=w,minY=h,maxX=-1,maxY=-1;
  for(let p=0;p<n;p++){
   const i=p*4;
   if(px[i+3]>24 && lumAt(i)<185){
    ink[p]=1; const x=p%w,y=(p/w)|0;
    if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
   }
  }
  if(maxX>=0){
   const margin=4;
   const outsideInk=(x,y)=>x<minX-margin||x>maxX+margin||y<minY-margin||y>maxY+margin;
   const runMin=Math.max(12,Math.floor(h*0.32));
   // Remove long, thin scanner rules outside the signature ink bounds.
   // The previous condition rejected continuous lines because it expected a
   // long run to contain very few pixels. Judge by run length and thinness instead.
   const linePixel=(p)=>{
    const i=p*4, spread=Math.max(px[i],px[i+1],px[i+2])-Math.min(px[i],px[i+1],px[i+2]);
    return px[i+3]>0 && spread<58 && lumAt(i)<238;
   };
   const verticalMin=Math.max(12,Math.floor(h*0.30));
   for(let x=0;x<w;x++){
    if(x>=minX-margin && x<=maxX+margin)continue;
    let run=[];
    const flush=()=>{
     if(run.length>=verticalMin){
      let neighborHits=0;
      for(const p of run){const y=(p/w)|0;for(const dx of [-2,-1,1,2]){const xx=x+dx;if(xx>=0&&xx<w&&linePixel(y*w+xx))neighborHits++;}}
      // A true narrow rule has few dark neighbors across adjacent columns.
      if(neighborHits < run.length*0.8) for(const p of run) px[p*4+3]=0;
     }
     run=[];
    };
    for(let y=0;y<h;y++){const p=y*w+x;if(outsideInk(x,y)&&linePixel(p))run.push(p);else flush();}
    flush();
   }
   const horizontalMin=Math.max(18,Math.floor(w*0.28));
   for(let y=0;y<h;y++){
    if(y>=minY-margin && y<=maxY+margin)continue;
    let run=[];
    const flush=()=>{
     if(run.length>=horizontalMin){
      let neighborHits=0;
      for(const p of run){const x=p%w;for(const dy of [-2,-1,1,2]){const yy=y+dy;if(yy>=0&&yy<h&&linePixel(yy*w+x))neighborHits++;}}
      if(neighborHits < run.length*0.8) for(const p of run) px[p*4+3]=0;
     }
     run=[];
    };
    for(let x=0;x<w;x++){const p=y*w+x;if(outsideInk(x,y)&&linePixel(p))run.push(p);else flush();}
    flush();
   }
  }
  // Remove detached edge artifacts (for example a thin vertical scan rule) by
  // connected-component analysis. Do not rely on the global ink bounding box,
  // because a detached line can incorrectly expand that box.
  {
   const dark = new Uint8Array(n), visited = new Uint8Array(n);
   for(let p=0;p<n;p++){
    const i=p*4;
    if(px[i+3]>18 && lumAt(i)<190) dark[p]=1;
   }
   const q = new Int32Array(n), components=[];
   for(let start=0;start<n;start++){
    if(!dark[start]||visited[start]) continue;
    let qh=0,qt=0,minx=w,miny=h,maxx=-1,maxy=-1,sumx=0,sumy=0;
    visited[start]=1;q[qt++]=start;
    while(qh<qt){
     const p=q[qh++],x=p%w,y=(p/w)|0;
     if(x<minx)minx=x;if(x>maxx)maxx=x;if(y<miny)miny=y;if(y>maxy)maxy=y;sumx+=x;sumy+=y;
     for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(!dx&&!dy)continue;const xx=x+dx,yy=y+dy;
      if(xx<0||xx>=w||yy<0||yy>=h)continue;const np=yy*w+xx;
      if(dark[np]&&!visited[np]){visited[np]=1;q[qt++]=np;}
     }
    }
    components.push({pixels:qt,minx,miny,maxx,maxy,width:maxx-minx+1,height:maxy-miny+1,meanx:sumx/qt,meany:sumy/qt});
   }
   if(components.length){
    // Keep plausible ink components near the central signature. A component is
    // an artifact candidate only if it is thin/elongated and close to an image edge.
    const edgeX=Math.max(4,Math.floor(w*0.055)), edgeY=Math.max(4,Math.floor(h*0.055));
    for(const c of components){
     const vertical=c.height>=Math.max(12,h*0.28) && c.height>=c.width*7;
     const horizontal=c.width>=Math.max(16,w*0.25) && c.width>=c.height*7;
     const atSide=c.minx<=edgeX || c.maxx>=w-1-edgeX;
     const atTopBottom=c.miny<=edgeY || c.maxy>=h-1-edgeY;
     // A long rule along the border is removed only when it is distinctly
     // line-shaped and detached from the signature body.
     if((vertical&&atSide)||(horizontal&&atTopBottom)){
      for(let p=0;p<n;p++){
       if(dark[p]){const x=p%w,y=(p/w)|0;if(x>=c.minx&&x<=c.maxx&&y>=c.miny&&y<=c.maxy)px[p*4+3]=0;}
      }
     }
    }
   }
  }
  ctx.putImageData(frame,0,0);
  const cleaned=canvas.toDataURL('image/png');
  raw.signIMG=cleaned; raw.markType='signature';
  by('addon-json').value=JSON.stringify(raw,null,2);
  updateInlineAssetPreview(raw);
  // Update an already-open HTML preview immediately as well; Auto Fill can be
  // run again afterward to persist the same transparent PNG into exported HTML.
  if(doc){try{const existing=doc.querySelectorAll(mediaSelectors.signature).length?doc.querySelectorAll(mediaSelectors.signature):[];existing.forEach(el=>{if(el.tagName==='IMG')el.setAttribute('src',cleaned)});render();}catch(_){}}
  if(!options.silent) msg('ব্যাকগ্রাউন্ডের সাদা অংশ স্বচ্ছ করা হয়েছে। HTML Auto Fill আবার চালিয়ে Preview/Export যাচাই করুন।');
  return true;
 } catch(e) { if(!options.silent) msg('Background removal হয়নি: '+e.message); return false; }
}

function updateInlinePreviewFromEditor() {
 try { updateInlineAssetPreview(JSON.parse(by('addon-json').value||'{}')); }
 catch { updateInlineAssetPreview({}); }
}

function placeMedia(role,src,alt){if(!doc)throw Error('আগে HTML প্রজেক্ট খুলুন');const host=doc.querySelector('.nid-card')||doc.body;const other=role==='fingerprint'?'signature':'fingerprint';host.querySelectorAll(mediaSelectors[other]).forEach(old=>{if(old.tagName==='IMG')old.remove()});let el=host.querySelector(mediaSelectors[role]||'[data-image-role="other"]');if(el&&el.tagName!=='IMG')el=null;
if(!el){el=doc.createElement('img');el.setAttribute('data-image-role',role);el.alt=alt||role;el.style.cssText='position:absolute;left:60px;top:60px;width:130px;height:auto;z-index:9998;cursor:move;object-fit:contain';host.append(el)}
el.setAttribute('src',src);window.applySavedLayoutToElement?.(el);window.fitMediaElement?.(el,src);return el}
function fillMedia(data){let done=0;const photo=imageData(data.userIMG)||imageData(data.photoIMG)||imageData(data.photo);if(photo){placeMedia('photo',photo,'Photo');done++}
const mark=imageData(data.signIMG);const kind=String(data.markType||'').toLowerCase();if(mark){if(kind.includes('finger')){placeMedia('fingerprint',mark,'Fingerprint');done++}else if(kind.includes('sign')){placeMedia('signature',mark,'Signature');done++}else{msg('signIMG পাওয়া গেছে, কিন্তু markType অস্পষ্ট। Signature/Fingerprint ম্যানুয়ালি নির্ধারণ করুন।')}}
const finger=imageData(data.fingerIMG)||imageData(data.fingerprintIMG);if(finger){placeMedia('fingerprint',finger,'Fingerprint');done++}return done}
by('addon-add-image').onclick=async()=>{try{if(!doc)throw Error('আগে HTML প্রজেক্ট খুলুন');const f=by('addon-image').files[0];if(!f)throw Error('ছবি নির্বাচন করুন');if(!f.type.startsWith('image/'))throw Error('Image ফাইল দিন');const buf=new Uint8Array(await f.arrayBuffer());const filename='editor-assets/'+Date.now()+'-'+f.name.replace(/[^a-zA-Z0-9_.-]/g,'_');snap();put(filename,buf);placeMedia(by('addon-image-type').value,filename,f.name);render();msg('ছবি যোগ হয়েছে। Drag করে জায়গা ঠিক করুন; Export ZIP-এ ছবিও থাকবে।')}catch(e){msg(e.message)}};
function downloadExtractedImage(keys, filename){
 try{
  const data=getData();let value='';
  for(const key of keys){if(typeof data[key]==='string' && /^data:image\//i.test(data[key])){value=data[key];break}}
  if(!value){msg('এই PDF/JSON-এ এই ধরনের ছবি পাওয়া যায়নি।');return}
  const a=document.createElement('a');a.href=value;a.download=filename;document.body.appendChild(a);a.click();a.remove();
  msg(filename+' ডাউনলোড শুরু হয়েছে।');
 }catch(e){msg('Image download error: '+e.message)}
}
by('addon-download-photo').onclick=()=>downloadExtractedImage(['userIMG','photoIMG','photo'],'extracted-photo.png');
by('addon-download-mark').onclick=()=>downloadExtractedImage(['fingerIMG','fingerprintIMG','signIMG'],'extracted-signature-or-fingerprint.png');
by('addon-json-parse').onclick=()=>{try{const data=getData();updateInlineAssetPreview(JSON.parse(by('addon-json').value||'{}'));renderForm(data);detect();msg('JSON থেকে ফর্ম পূরণ হয়েছে। তথ্য যাচাই করে HTML Auto Fill চাপুন।')}catch(e){msg('JSON error: '+e.message)}};
by('addon-fill-bottom').onclick=()=>by('addon-fill').click();
by('addon-download-card').onclick=()=>{const printButton=document.getElementById('printPdf');if(printButton)printButton.click();else msg('Print বাটন পাওয়া যায়নি। মূল editor toolbar দেখুন।')};
by('addon-tools-jump').onclick=()=>{const d=by('addon-advanced');d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'})};
by('addon-photo-file').addEventListener('change',async e=>{try{await setMediaFromFile(e.target.files[0],'photo');updateInlinePreviewFromEditor()}catch(err){msg('Photo error: '+err.message)}});
by('addon-sign-file').addEventListener('change',async e=>{try{const role=by('addon-sign-type').value;await setMediaFromFile(e.target.files[0],role);if(role==='signature'){const removed=await removeExtractedSignatureBackground({silent:true});msg(removed?'Signature upload সম্পন্ন। Background স্বয়ংক্রিয়ভাবে সরানো হয়েছে।':'Signature upload হয়েছে, কিন্তু Background Removal সম্পন্ন হয়নি।')}updateInlinePreviewFromEditor()}catch(err){msg('Image error: '+err.message)}});
by('addon-sign-type').addEventListener('change',updateInlinePreviewFromEditor);

// Create a polished transparent name mark. This is a typographic name mark,
// not a reproduction of a person's handwritten/legal signature.
async function createNameMarkFromInput(){
 try{
  if(by('addon-sign-type').value!=='signature') throw Error('Name Mark তৈরি করতে Signature নির্বাচন করুন।');
  const name=String(by('addon-name-mark').value||'').trim().replace(/\s+/g,' ');
  if(!name) throw Error('আগে বাংলা বা English নাম লিখুন।');
  const isBangla=/[\u0980-\u09FF]/.test(name);
  const canvas=document.createElement('canvas');
  const measure=canvas.getContext('2d');
  const fontSize=isBangla?14:18;
  // Prefer installed Bengali typefaces with graceful fallbacks. A browser can only
  // use fonts installed/loaded on that device, so do not depend on a remote font.
  const fontFamily=isBangla
   ? '"Siyam Rupali", "SolaimanLipi", "Noto Sans Bengali", "Noto Serif Bengali", "Nikosh", "Vrinda", serif'
   : '"Segoe Script", "Brush Script MT", "URW Chancery L", "Comic Sans MS", cursive';
  const fontWeight=isBangla?'500':'500';
  const fontStyle='normal';
  const font=`${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  measure.font=font;
  const textWidth=Math.ceil(measure.measureText(name).width);
  const padX=isBangla?8:12;
  const padY=5;
  const dpr=3;
  const logicalW=Math.max(180,Math.min(1500,textWidth+padX*2));
  const logicalH=isBangla?30:36;
  canvas.width=logicalW*dpr;
  canvas.height=logicalH*dpr;
  const ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,logicalW,logicalH);
  ctx.fillStyle='#111111';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.font=font;
  // Keep the name on a straight, level baseline. Do not rotate or skew the
  // whole signature; slightly widen Bengali text to create a flowing look.
  const x=logicalW/2;
  const y=logicalH/2+(isBangla?0:0);
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(isBangla?1.12:1.0,1);
  ctx.fillText(name,0,0,logicalW-padX*2);
  ctx.restore();
  // Tighten excess transparent margins to the rendered glyph bounds, with safe padding.
  const rawCanvas=document.createElement('canvas');
  rawCanvas.width=canvas.width;rawCanvas.height=canvas.height;
  rawCanvas.getContext('2d').drawImage(canvas,0,0);
  const imageData=rawCanvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,rawCanvas.width,rawCanvas.height);
  const px=imageData.data;let minX=rawCanvas.width,minY=rawCanvas.height,maxX=-1,maxY=-1;
  for(let yy=0;yy<rawCanvas.height;yy++) for(let xx=0;xx<rawCanvas.width;xx++){
   const a=px[(yy*rawCanvas.width+xx)*4+3];
   if(a>8){if(xx<minX)minX=xx;if(xx>maxX)maxX=xx;if(yy<minY)minY=yy;if(yy>maxY)maxY=yy;}
  }
  let dataUrl;
  if(maxX>=minX&&maxY>=minY){
   const trimPad=2*dpr;
   minX=Math.max(0,minX-trimPad);minY=Math.max(0,minY-trimPad);
   maxX=Math.min(rawCanvas.width-1,maxX+trimPad);maxY=Math.min(rawCanvas.height-1,maxY+trimPad);
   const trimmed=document.createElement('canvas');trimmed.width=maxX-minX+1;trimmed.height=maxY-minY+1;
   trimmed.getContext('2d').drawImage(rawCanvas,minX,minY,trimmed.width,trimmed.height,0,0,trimmed.width,trimmed.height);
   dataUrl=trimmed.toDataURL('image/png');
  }else dataUrl=canvas.toDataURL('image/png');
  const raw=JSON.parse(by('addon-json').value||'{}');
  delete raw.fingerIMG;delete raw.fingerprintIMG;
  raw.signIMG=dataUrl;raw.markType='signature';raw.signImageSource='generated-name-mark';
  by('addon-json').value=JSON.stringify(raw,null,2);
  updateInlineAssetPreview(raw);
  if(doc){try{const existing=doc.querySelectorAll(mediaSelectors.signature);existing.forEach(el=>{if(el.tagName==='IMG')el.setAttribute('src',dataUrl)});render();}catch{}}
  msg(`${isBangla?'উন্নত বাংলা':'উন্নত English'} Name Mark তৈরি হয়েছে। HTML Auto Fill দিয়ে Preview/Export-এ বসান।`);
 }catch(e){msg('Name Mark তৈরি হয়নি: '+e.message)}
}


function createFlowingSignatureFromInput(){
 try{
  if(by('addon-sign-type').value!=='signature') throw Error('Name Mark তৈরি করতে Signature নির্বাচন করুন।');
  const name=String(by('addon-name-mark').value||'').trim().replace(/\s+/g,' ');
  if(!name) throw Error('আগে বাংলা বা English নাম লিখুন।');
  const isBangla=/[\u0980-\u09FF]/.test(name);
  const fontFamily=isBangla
   ? '"FreeSerif", "Siyam Rupali", "SolaimanLipi", "Noto Sans Bengali", "Nikosh", serif'
   : '"Segoe Script", "Brush Script MT", "URW Chancery L", "Apple Chancery", cursive';
  const fontSize=isBangla?24:31;
  const weight=isBangla?'500':'400';
  const font=`italic ${weight} ${fontSize}px ${fontFamily}`;
  const measure=document.createElement('canvas').getContext('2d');
  measure.font=font;
  const textWidth=Math.ceil(measure.measureText(name).width);
  const logicalW=Math.max(220,Math.min(1800,textWidth+100));
  const logicalH=isBangla?66:76;
  const dpr=3;
  const canvas=document.createElement('canvas');
  canvas.width=logicalW*dpr; canvas.height=logicalH*dpr;
  const ctx=canvas.getContext('2d'); ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,logicalW,logicalH);
  ctx.fillStyle='#111'; ctx.strokeStyle='#111'; ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.font=font; ctx.textAlign='center'; ctx.textBaseline='middle';
  const cx=logicalW/2, cy=logicalH*0.49;
  // Keep the name on a level baseline. Only the decorative terminal strokes flow.
  ctx.save(); ctx.translate(cx,cy); ctx.scale(isBangla?1.04:1.0,1);
  ctx.fillText(name,0,0,logicalW-70); ctx.restore();
  // Elegant, restrained signature-style swashes around the name, not through the letters.
  const left=Math.max(8,(logicalW-textWidth)/2-20), right=Math.min(logicalW-8,(logicalW+textWidth)/2+20);
  ctx.lineWidth=isBangla?1.15:1.35;
  ctx.beginPath();
  ctx.moveTo(left+5,cy+fontSize*0.46);
  ctx.quadraticCurveTo(left-3,cy+fontSize*0.58,left+15,cy+fontSize*0.48);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(right-12,cy-fontSize*0.18);
  ctx.bezierCurveTo(right+5,cy-fontSize*0.55,Math.min(logicalW-8,right+22),cy-fontSize*0.42,Math.min(logicalW-7,right+8),cy-fontSize*0.23);
  ctx.stroke();
  // Trim transparent margins but retain enough room for the swashes.
  const im=ctx.getImageData(0,0,canvas.width,canvas.height), px=im.data;
  let minX=canvas.width,minY=canvas.height,maxX=-1,maxY=-1;
  for(let y=0;y<canvas.height;y++) for(let x=0;x<canvas.width;x++){
   if(px[(y*canvas.width+x)*4+3]>8){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;}
  }
  let dataUrl=canvas.toDataURL('image/png');
  if(maxX>=minX&&maxY>=minY){
   const pad=4*dpr; minX=Math.max(0,minX-pad);minY=Math.max(0,minY-pad);maxX=Math.min(canvas.width-1,maxX+pad);maxY=Math.min(canvas.height-1,maxY+pad);
   const trimmed=document.createElement('canvas');trimmed.width=maxX-minX+1;trimmed.height=maxY-minY+1;
   trimmed.getContext('2d').drawImage(canvas,minX,minY,trimmed.width,trimmed.height,0,0,trimmed.width,trimmed.height);
   dataUrl=trimmed.toDataURL('image/png');
  }
  const raw=JSON.parse(by('addon-json').value||'{}');
  delete raw.fingerIMG; delete raw.fingerprintIMG;
  raw.signIMG=dataUrl; raw.markType='signature'; raw.signImageSource='generated-flowing-name-mark';
  by('addon-json').value=JSON.stringify(raw,null,2); updateInlineAssetPreview(raw);
  if(doc){try{doc.querySelectorAll(mediaSelectors.signature).forEach(el=>{if(el.tagName==='IMG')el.setAttribute('src',dataUrl)});render();}catch{}}
  msg(`${isBangla?'বাংলা':'English'} Flowing Name Mark তৈরি হয়েছে। HTML Auto Fill দিয়ে Preview/Export-এ বসান।`);
 }catch(e){msg('Flowing Name Mark তৈরি হয়নি: '+e.message)}
}

// Render the permanent extracted-data fields immediately on startup.
// Keep this call inside the same closure as renderForm() and by().
try {
 const initialData=JSON.parse(by('addon-json').value||'{}');
 renderForm(initialData);
 updateInlineAssetPreview(initialData);
} catch(e) {
 try { renderForm({}); } catch {}
 try { updateInlineAssetPreview({}); } catch {}
}
})(); 
