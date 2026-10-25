(()=>{'use strict';
const KEY='visual-editor:smart-face:v1';
const defaults={faceSize:68,verticalCenter:44,align:true,crop:true};
let config;try{config={...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(_){config={...defaults}}
const pane=document.createElement('section');pane.style.cssText='padding:12px;margin-top:12px;border:1px solid #536781;border-radius:8px;background:#152c42';
pane.innerHTML='<h3 style="margin:0 0 8px">📷 Smart Face + Fixed Photo Box</h3><p style="font-size:12px">Photo box-এর Width/Height ও Position একবার Save layout করুন। মুখ শনাক্ত হলে সেটিকে একই অনুপাতে ফ্রেমে বসানো হবে। না হলে Manual Crop ব্যবহার করুন। সম্পূর্ণ অফলাইন।</p><label>Face width (%) <input id="sf-size" type="number" min="30" max="95" style="width:68px"></label><label style="display:block;margin:8px 0">Face vertical center (%) <input id="sf-y" type="number" min="15" max="85" style="width:68px"></label><label style="display:block"><input type="checkbox" id="sf-align"> Auto face alignment</label><label style="display:block"><input type="checkbox" id="sf-crop"> Auto crop to photo box</label><label style="display:block;margin-top:8px">Manual horizontal center (%) <input id="sf-xmanual" type="number" min="0" max="100" value="50" style="width:65px"></label><label style="display:block;margin-top:8px">Manual zoom (%) <input id="sf-zoom" type="number" min="50" max="400" value="100" style="width:65px"></label><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:9px"><button type="button" id="sf-save">Save Photo Settings</button><button type="button" id="sf-apply">Reprocess Photo</button></div><div id="sf-msg" style="font-size:12px;margin-top:8px;overflow-wrap:anywhere"></div>';
document.querySelector('aside').append(pane);
const $s=id=>document.getElementById(id),note=t=>$s('sf-msg').textContent=t;
function show(){ $s('sf-size').value=config.faceSize;$s('sf-y').value=config.verticalCenter;$s('sf-align').checked=config.align;$s('sf-crop').checked=config.crop }show();
function save(){config={faceSize:Math.max(30,Math.min(95,Number($s('sf-size').value)||68)),verticalCenter:Math.max(15,Math.min(85,Number($s('sf-y').value)||44)),align:$s('sf-align').checked,crop:$s('sf-crop').checked};localStorage.setItem(KEY,JSON.stringify(config));note('Photo settings saved ✓')}
$s('sf-save').onclick=save;
function imageURL(src){if(src.startsWith('data:')||src.startsWith('blob:'))return src;return fileMap.get(src)?.url||src}
function loadImage(src){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Cannot load photo'));i.src=imageURL(src)})}
async function findFace(img,src){
 if(config.align && typeof FaceDetector!=='undefined')try{const faces=await new FaceDetector({fastMode:false,maxDetectedFaces:1}).detect(img);if(faces.length)return faces[0].boundingBox}catch(_){}
 if(!config.align)return null;
 // Optional local Python/OpenCV detection. No cloud calls; failure falls back to manual centering.
 try{const cv=document.createElement('canvas'),ratio=Math.min(1,900/Math.max(img.naturalWidth,img.naturalHeight));cv.width=Math.round(img.naturalWidth*ratio);cv.height=Math.round(img.naturalHeight*ratio);cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);const r=await fetch('/api/face',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:cv.toDataURL('image/jpeg',0.85)})});const data=await r.json().catch(()=>({}));if(!r.ok){note('Face API unavailable ('+r.status+'); manual crop will be used.');return null}if(data.face)return {x:data.face.x/ratio,y:data.face.y/ratio,width:data.face.width/ratio,height:data.face.height/ratio};}catch(_){}return null;
}
const originalSources=new WeakMap(),tickets=new WeakMap();
async function process(el,original){if(!el||!el.isConnected)return;const src=original||originalSources.get(el)||el.getAttribute('data-photo-original')||el.getAttribute('src');if(!src)return;
 originalSources.set(el,src);const ticket={};tickets.set(el,ticket);
 try{const img=await loadImage(src);if(tickets.get(el)!==ticket||!el.isConnected)return;
 const w=img.naturalWidth,h=img.naturalHeight;if(!w||!h)throw Error('Empty image');
 const face=await findFace(img,src);if(tickets.get(el)!==ticket||!el.isConnected)return;
 const boxW=Math.max(10,parseFloat(el.style.width)||130),boxH=Math.max(10,parseFloat(el.style.height)||150),ratio=boxW/boxH;
 let cropW,cropH,cx,cy;
 if(face){cropW=Math.max(1,face.width)/(config.faceSize/100);cropH=cropW/ratio;cx=face.x+face.width/2;cy=face.y+face.height/2+(0.5-config.verticalCenter/100)*cropH;}
 else{const manualZoom=Math.max(.5,Math.min(4,Number($s('sf-zoom').value)||100)/100);cropW=Math.min(w,h*ratio)/manualZoom;cropH=cropW/ratio;cx=w*(Number($s('sf-xmanual').value)||50)/100;cy=h*config.verticalCenter/100;}
 if(!config.crop){el.style.objectFit='contain';note(face?'Face detected; crop disabled':'Face not detected; original image preserved');return}
 // Clamp the crop strictly inside the original photo: no white margins.
 // The face-size preference is a target, not permission to draw outside the source.
 if(cropW>w || cropH>h){const factor=Math.max(cropW/w,cropH/h);cropW/=factor;cropH/=factor}
 cropW=Math.min(w,cropW);cropH=Math.min(h,cropH);
 // Keep the requested photo-box aspect ratio after limiting crop dimensions.
 if(cropW/cropH>ratio)cropW=cropH*ratio;else cropH=cropW/ratio;
 const sx=Math.max(0,Math.min(w-cropW,cx-cropW/2));
 const sy=Math.max(0,Math.min(h-cropH,cy-cropH/2));
 const out=document.createElement('canvas');out.width=Math.max(1,Math.round(boxW*2));out.height=Math.max(1,Math.round(boxH*2));
 const ctx=out.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(img,sx,sy,cropW,cropH,0,0,out.width,out.height);
 const result=out.toDataURL('image/jpeg',0.94);if(tickets.get(el)!==ticket)return;
 el.src=result;el.style.objectFit='cover';el.style.objectPosition='center center';el.style.width=boxW+'px';el.style.height=boxH+'px';
 note(face?'✓ Face detected and aligned (size '+config.faceSize+'%, center '+config.verticalCenter+'%)':'⚠ Face not detected: manual centered crop. Adjust manual controls if needed.');
 if(typeof render==='function')render();
 }catch(e){note('Photo alignment skipped: '+e.message)}
}
const oldFit=window.fitMediaElement;
window.fitMediaElement=function(el,src){if(el?.getAttribute('data-image-role')==='photo'){process(el,src);return}return oldFit?.(el,src)};
$s('sf-apply').onclick=()=>{save();const el=doc?.querySelector('[data-image-role="photo"]');if(!el){note('Photo not found');return}process(el,originalSources.get(el)||el.getAttribute('src'))};
window.smartFaceReprocess=()=>{const el=doc?.querySelector('[data-image-role="photo"]');if(el)process(el,originalSources.get(el)||el.getAttribute('src'))};
})();
