from http.server import HTTPServer, ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import os, json, threading, webbrowser, base64, zipfile, io, re, shutil, time, uuid, traceback, hashlib
ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)
PROJECTS_DIR = ROOT / "projects"
PROJECTS_DIR.mkdir(exist_ok=True)
PDF_PREVIEWS = {}

def clean_project_name(raw):
    name = re.sub(r'[<>:"/\\\\|?*\x00-\x1f]', '_', str(raw or '').strip())
    name = re.sub(r'\s+', ' ', name).strip(' .')
    if not name:
        name = 'Untitled Project'
    return name[:80]

def project_dir(name):
    return PROJECTS_DIR / clean_project_name(name)

def json_reply(handler, code, payload):
    body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
    handler.send_response(code)
    handler.send_header('Content-Type', 'application/json; charset=utf-8')
    handler.send_header('Content-Length', str(len(body)))
    handler.send_header('Cache-Control', 'no-store')
    handler.end_headers()
    handler.wfile.write(body)

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        # Browsers request this automatically; the editor has no favicon asset.
        if parsed.path == '/favicon.ico':
            self.send_response(204); self.send_header('Content-Length', '0'); self.end_headers(); return
        if parsed.path == '/api/pdf/view':
            token = parse_qs(parsed.query).get('id', [''])[0]
            entry = PDF_PREVIEWS.get(token)
            if not entry or entry[0] < time.time():
                PDF_PREVIEWS.pop(token, None)
                self.send_error(404, 'PDF preview expired or not found')
                return
            data = entry[1]
            self.send_response(200)
            self.send_header('Content-Type', 'application/pdf')
            self.send_header('Content-Disposition', 'inline; filename="editor-preview.pdf"')
            self.send_header('Content-Length', str(len(data)))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.end_headers()
            self.wfile.write(data)
            return
        if parsed.path == '/health':
            return json_reply(self, 200, {'ok': True, 'service': 'visual-html-editor'})
        if parsed.path == '/api/pdf/health':
            is_render = bool(os.environ.get('RENDER')) or bool(os.environ.get('PORT'))
            service_url = os.environ.get('PDF_SERVICE_URL', '').strip().rstrip('/')
            if not service_url and not is_render:
                service_url = 'http://127.0.0.1:3000'
            password = os.environ.get('PDF_SERVICE_TOKEN', '').strip()
            if not service_url:
                return json_reply(self, 503, {'ok': False, 'error': 'Set PDF_SERVICE_URL in the server environment'})
            try:
                from urllib.request import urlopen, Request
                import base64
                headers = {}
                if password:
                    credentials = base64.b64encode(('nidmak:' + password).encode('utf-8')).decode('ascii')
                    headers['Authorization'] = 'Basic ' + credentials
                request = Request(service_url + '/health', headers=headers)
                with urlopen(request, timeout=15) as response:
                    status = response.status
                    data = json.loads(response.read().decode('utf-8'))
                return json_reply(self, 200 if status == 200 and data.get('status') == 'up' else 502, {
                    'ok': bool(status == 200 and data.get('status') == 'up'),
                    'service': 'gotenberg',
                    'renderer': data
                })
            except Exception as exc:
                return json_reply(self, 502, {'ok': False, 'service': 'gotenberg', 'error': str(exc)[:1200]})
        if parsed.path == '/api/projects':
            projects = []
            for folder in PROJECTS_DIR.iterdir():
                if folder.is_dir() and (folder / 'project.zip').is_file():
                    projects.append({'name': folder.name, 'updated': int((folder / 'project.zip').stat().st_mtime)})
            projects.sort(key=lambda p: p['updated'], reverse=True)
            return json_reply(self, 200, {'ok': True, 'projects': projects})
        if parsed.path == '/api/projects/open':
            name = clean_project_name(parse_qs(parsed.query).get('name', [''])[0])
            archive = project_dir(name) / 'project.zip'
            if not archive.is_file():
                return json_reply(self, 404, {'ok': False, 'error': 'Project not found'})
            data = archive.read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', 'application/zip')
            self.send_header('Content-Disposition', 'attachment; filename="project.zip"')
            self.send_header('Content-Length', str(len(data)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(data)
            return
        if parsed.path in ('/', '/index.html'):
            # Inject the mobile workspace stylesheet after the embedded index CSS.
            # This keeps the large editor HTML untouched and ensures the fix is loaded.
            page = (ROOT / 'index.html').read_text(encoding='utf-8')
            link = '<link rel="stylesheet" href="/mobile-workspace-fix.css">'
            if link not in page:
                page = page.replace('</head>', link + '\n</head>', 1)
            # Intercept only the existing Print/PDF popup's print() call.
            # The editor's original print layout and stage-cloning code remain untouched.
            bridge = r'''<script>
(function(){
  document.addEventListener('click', function(event){
    const button = event.target && event.target.closest ? event.target.closest('#printPdf') : null;
    if (!button) return;
    const nativeOpen = window.open;
    window.open = function(){
      const popup = nativeOpen.apply(window, arguments);
      window.open = nativeOpen;
      if (!popup) return popup;
      return new Proxy(popup, {
        get(target, property){
          if (property === 'print') return async function(){
            try {
              const html = '<!doctype html>' + popup.document.documentElement.outerHTML;
              const response = await fetch('/api/pdf/create', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({html: html})
              });
              if (!response.ok) {
                let message = 'PDF তৈরি করা যায়নি';
                try { const data = await response.json(); message = data.error || message; } catch (_) {}
                throw new Error(message);
              }
              const result = await response.json();
              if (!result.ok || !result.url) throw new Error(result.error || 'PDF URL পাওয়া যায়নি');
              // A same-origin HTTP response with application/pdf reliably invokes
              // Chrome's built-in PDF viewer in the already-opened tab.
              const pdfUrl = new URL(result.url, window.location.origin).href;
              popup.location.replace(pdfUrl);
            } catch (error) {
              try { popup.close(); } catch (_) {}
              alert('PDF তৈরি করা যায়নি: ' + error.message);
            }
          };
          const value = Reflect.get(target, property, target);
          return typeof value === 'function' ? value.bind(target) : value;
        }
      });
    };
    setTimeout(function(){ window.open = nativeOpen; }, 0);
  }, true);
})();
</script>'''
            if 'CHROME_NATIVE_PDF_BRIDGE' not in page:
                body_close = page.lower().rfind('</body>')
                if body_close < 0:
                    raise RuntimeError('Editor HTML closing body tag was not found')
                page = page[:body_close] + bridge.replace('<script>', '<script>/* CHROME_NATIVE_PDF_BRIDGE */', 1) + '\n' + page[body_close:]
            body = page.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(body)
            return
        return super().do_GET()

    def do_DELETE(self):
        parsed = urlparse(self.path)
        if parsed.path != '/api/projects/delete':
            self.send_error(404)
            return
        name = clean_project_name(parse_qs(parsed.query).get('name', [''])[0])
        folder = project_dir(name)
        if not folder.is_dir() or folder.parent.resolve() != PROJECTS_DIR.resolve():
            return json_reply(self, 404, {'ok': False, 'error': 'Project not found'})
        shutil.rmtree(folder)
        return json_reply(self, 200, {'ok': True, 'name': name})


    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/pdf/create':
            try:
                size = int(self.headers.get('Content-Length', '0'))
                if not 0 < size <= 100 * 1024 * 1024:
                    raise ValueError('Print document must be between 1 byte and 100 MB')
                payload = json.loads(self.rfile.read(size).decode('utf-8'))
                document_html = payload.get('html')
                if not isinstance(document_html, str) or '<html' not in document_html.lower():
                    raise ValueError('Valid HTML print document is required')
                is_render = bool(os.environ.get('RENDER')) or bool(os.environ.get('PORT'))
                service_url = os.environ.get('PDF_SERVICE_URL', '').strip().rstrip('/')
                if not service_url and not is_render:
                    service_url = 'http://127.0.0.1:3000'
                token = os.environ.get('PDF_SERVICE_TOKEN', '').strip()
                if not service_url:
                    return json_reply(self, 503, {
                        'ok': False,
                        'error': 'PDF service is not configured. Set PDF_SERVICE_URL in the server environment.'
                    })
                from urllib.request import Request, urlopen
                from urllib.error import HTTPError, URLError
                import base64
                import secrets
                from urllib.parse import urljoin
                forwarded_proto = self.headers.get('X-Forwarded-Proto', 'https').split(',')[0].strip()
                host = self.headers.get('Host', '127.0.0.1')
                origin = forwarded_proto + '://' + host + '/'
                # Resolve relative asset URLs against the editor origin. Gotenberg's
                # HTML upload endpoint runs in a separate container, so relative
                # paths must be absolute URLs to remain reachable.
                def absolute_ref(match):
                    attr, quote, value = match.group(1), match.group(2), match.group(3)
                    value = value.strip()
                    if not value or value.startswith(('data:', 'http://', 'https://', '//', '#', 'blob:', 'javascript:', 'mailto:')):
                        return match.group(0)
                    return attr + quote + urljoin(origin, value) + quote
                document_html = re.sub(r"\b(src|href)\s*=\s*(['\"])(.*?)\2", absolute_ref, document_html, flags=re.I)
                document_html = re.sub(
                    r"url\(\s*(['\"]?)(?!data:|https?:|//|#)([^)'\"]+)\1\s*\)",
                    lambda m: 'url("' + urljoin(origin, m.group(2).strip()) + '")',
                    document_html, flags=re.I
                )
                boundary = '----NidMakGotenberg' + secrets.token_hex(16)
                parts = []
                def add_field(name, value):
                    parts.append(('--' + boundary + '\r\n').encode())
                    parts.append(('Content-Disposition: form-data; name="' + name + '"\r\n\r\n').encode())
                    parts.append(str(value).encode('utf-8'))
                    parts.append(b'\r\n')
                parts.append(('--' + boundary + '\r\n').encode())
                parts.append(b'Content-Disposition: form-data; name="files"; filename="index.html"\r\n')
                parts.append(b'Content-Type: text/html; charset=utf-8\r\n\r\n')
                parts.append(document_html.encode('utf-8'))
                parts.append(b'\r\n')
                add_field('printBackground', 'true')
                add_field('preferCssPageSize', 'true')
                add_field('emulatedMediaType', 'screen')
                add_field('waitDelay', '1s')
                parts.append(('--' + boundary + '--\r\n').encode())
                request_body = b''.join(parts)
                request_headers = {
                    'Content-Type': 'multipart/form-data; boundary=' + boundary,
                    'Gotenberg-Output-Filename': 'nid-mak-preview'
                }
                if token:
                    credentials = base64.b64encode(('nidmak:' + token).encode('utf-8')).decode('ascii')
                    request_headers['Authorization'] = 'Basic ' + credentials
                request = Request(
                    service_url + '/forms/chromium/convert/html',
                    data=request_body,
                    headers=request_headers,
                    method='POST'
                )
                try:
                    with urlopen(request, timeout=150) as response:
                        pdf_data = response.read()
                except HTTPError as exc:
                    detail = exc.read(4000).decode('utf-8', errors='replace')
                    raise RuntimeError('Gotenberg returned HTTP ' + str(exc.code) + ': ' + detail)
                except URLError as exc:
                    raise RuntimeError('Could not connect to Gotenberg: ' + str(exc.reason))
                if not pdf_data.startswith(b'%PDF-'):
                    raise RuntimeError('PDF renderer returned invalid PDF bytes')
                now = time.time()
                for old_token, old_entry in list(PDF_PREVIEWS.items()):
                    if old_entry[0] < now:
                        PDF_PREVIEWS.pop(old_token, None)
                token_id = uuid.uuid4().hex
                PDF_PREVIEWS[token_id] = (now + 600, pdf_data)
                return json_reply(self, 200, {'ok': True, 'url': '/api/pdf/view?id=' + token_id})
            except Exception as exc:
                print('[PDF_CREATE] PDF service request failed:', repr(exc), flush=True)
                traceback.print_exc()
                return json_reply(self, 500, {'ok': False, 'error': 'PDF তৈরি ব্যর্থ: ' + str(exc)})
        if parsed.path == '/api/projects/save':
            name = clean_project_name(parse_qs(parsed.query).get('name', [''])[0])
            try:
                size = int(self.headers.get('Content-Length', '0'))
                if not 0 < size <= 100 * 1024 * 1024:
                    raise ValueError('Project ZIP must be between 1 byte and 100 MB')
                raw = self.rfile.read(size)
                with zipfile.ZipFile(io.BytesIO(raw)) as z:
                    bad = z.testzip()
                    if bad:
                        raise ValueError('ZIP validation failed: ' + bad)
                    # Reject path traversal before extracting project files.
                    for info in z.infolist():
                        target = (project_dir(name) / info.filename).resolve()
                        if target != project_dir(name).resolve() and project_dir(name).resolve() not in target.parents:
                            raise ValueError('Unsafe path in ZIP: ' + info.filename)
                    folder = project_dir(name)
                    folder.mkdir(parents=True, exist_ok=True)
                    for child in list(folder.iterdir()):
                        if child.is_dir():
                            shutil.rmtree(child)
                        else:
                            child.unlink()
                    z.extractall(folder)
                    # Keep a self-contained copy of the uploaded ZIP for easy reopening.
                    (folder / 'project.zip').write_bytes(raw)
                return json_reply(self, 200, {'ok': True, 'name': name})
            except Exception as exc:
                return json_reply(self, 400, {'ok': False, 'error': str(exc)})
        if parsed.path == '/api/remove-background':
            try:
                size = int(self.headers.get('Content-Length', '0'))
                if not 0 < size <= 12 * 1024 * 1024:
                    raise ValueError('ছবির ডেটা ১২ MB-এর মধ্যে হতে হবে')
                payload = json.loads(self.rfile.read(size))
                raw = base64.b64decode(payload['image'].split(',', 1)[-1], validate=True)
                import cv2, numpy as np
                image = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_COLOR)
                if image is None:
                    raise ValueError('ছবিটি পড়া যায়নি। JPG বা PNG ছবি দিন।')
                h, w = image.shape[:2]
                if w < 40 or h < 40:
                    raise ValueError('ছবির রেজোলিউশন খুব ছোট')
                # Limit GrabCut memory use on large mobile photos.
                scale = min(1.0, 1500.0 / max(w, h))
                if scale < 1.0:
                    image = cv2.resize(image, (max(40, int(w * scale)), max(40, int(h * scale))), interpolation=cv2.INTER_AREA)
                h, w = image.shape[:2]
                margin = max(2, int(min(w, h) * 0.035))
                rect = (margin, margin, max(1, w - 2 * margin), max(1, h - 2 * margin))
                mask = np.zeros((h, w), np.uint8)
                bgd = np.zeros((1, 65), np.float64)
                fgd = np.zeros((1, 65), np.float64)
                cv2.grabCut(image, mask, rect, bgd, fgd, 5, cv2.GC_INIT_WITH_RECT)
                alpha = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
                # Clean isolated noise and soften the cutout edge slightly.
                kernel = np.ones((3, 3), np.uint8)
                alpha = cv2.morphologyEx(alpha, cv2.MORPH_OPEN, kernel, iterations=1)
                alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel, iterations=1)
                alpha = cv2.GaussianBlur(alpha, (0, 0), 1.0)
                rgba = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)
                rgba[:, :, 3] = alpha
                ok, encoded = cv2.imencode('.png', rgba, [cv2.IMWRITE_PNG_COMPRESSION, 6])
                if not ok:
                    raise RuntimeError('Transparent PNG তৈরি করা যায়নি')
                result = 'data:image/png;base64,' + base64.b64encode(encoded.tobytes()).decode('ascii')
                return json_reply(self, 200, {'ok': True, 'image': result, 'width': w, 'height': h,
                    'method': 'OpenCV GrabCut', 'note': 'ফলাফল ছবির background ও আলো অনুযায়ী বদলাতে পারে; edge/চুল হাতে পরীক্ষা করুন।'})
            except Exception as exc:
                return json_reply(self, 400, {'ok': False, 'error': str(exc)})
        if parsed.path == '/api/face':
            try:
                size=int(self.headers.get('Content-Length','0'))
                if not 0<size<=8*1024*1024: raise ValueError('Image too large')
                payload=json.loads(self.rfile.read(size))
                raw=base64.b64decode(payload['image'].split(',',1)[-1],validate=True)
                import cv2, numpy as np
                # Detect wrong/shadowed cv2 packages instead of failing later with a vague error.
                required = ('imdecode', 'IMREAD_COLOR', 'cvtColor', 'COLOR_BGR2GRAY', 'CascadeClassifier', 'data')
                missing = [name for name in required if not hasattr(cv2, name)]
                if missing:
                    module_path = getattr(cv2, '__file__', None) or getattr(cv2, '__path__', None)
                    raise RuntimeError('The imported cv2 module is not a valid OpenCV installation. Missing: ' + ', '.join(missing) + '. Imported from: ' + str(module_path) + '. Run FIX-OPENCV-WINDOWS.bat and restart the editor.')
                cascade_path = os.path.join(cv2.data.haarcascades, 'haarcascade_frontalface_default.xml')
                if not os.path.isfile(cascade_path):
                    raise RuntimeError('OpenCV Haar cascade file is missing: ' + cascade_path + '. Run FIX-OPENCV-WINDOWS.bat and restart the editor.')
                image=cv2.imdecode(np.frombuffer(raw,dtype=np.uint8),cv2.IMREAD_COLOR)
                if image is None: raise ValueError('Invalid image')
                gray=cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)
                cascade=cv2.CascadeClassifier(cascade_path)
                if cascade.empty(): raise RuntimeError('OpenCV could not load the face cascade XML: ' + cascade_path)
                faces=cascade.detectMultiScale(gray,scaleFactor=1.08,minNeighbors=5,minSize=(35,35))
                face=max(faces,key=lambda f:f[2]*f[3]) if len(faces) else None
                result={'face':dict(zip(('x','y','width','height'),map(int,face))) if face is not None else None}
                body=json.dumps(result).encode('utf-8')
                self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
            except Exception as exc:
                # Report missing OpenCV clearly; the browser can still use its manual-crop fallback.
                message = str(exc)
                missing_cv = isinstance(exc, ModuleNotFoundError) and exc.name in ('cv2', 'numpy')
                broken_cv = isinstance(exc, RuntimeError) and ('cv2 module is not a valid OpenCV' in message or 'cascade file is missing' in message or 'could not load the face cascade' in message)
                payload = {'face': None, 'warning': message}
                if missing_cv or broken_cv:
                    payload['install_hint'] = 'Close the editor, run FIX-OPENCV-WINDOWS.bat, then restart RUN-LOCAL-WINDOWS.bat.'
                body=json.dumps(payload, ensure_ascii=False).encode('utf-8')
                self.send_response(503 if missing_cv or broken_cv else 400);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(body)));self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(body)
            return
        if parsed.path != '/api/extract':
            self.send_error(404); return
        try:
            size=int(self.headers.get('Content-Length','0'))
            if not 0<size<=25*1024*1024: raise ValueError('PDF size must be 1–25 MB')
            data=self.rfile.read(size)
            if not data.startswith(b'%PDF-'): raise ValueError('Not a PDF file')
            try: import pymupdf
            except ImportError: raise RuntimeError('PyMuPDF not installed. Run: python -m pip install -r requirements.txt')
            from extract import parse
            pdf=pymupdf.open(stream=data,filetype='pdf')
            try: result=parse(pdf)
            finally: pdf.close()
            payload={'ok':True,'data':result};code=200
        except Exception as exc:
            payload={'ok':False,'error':str(exc)};code=400
        body=json.dumps(payload,ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Content-Length',str(len(body)))
        self.end_headers();self.wfile.write(body)
# Use a threaded server so browser asset requests can be served while
# the PDF-generation request is being processed. Render binds to 0.0.0.0:$PORT.
IS_RENDER = bool(os.environ.get('RENDER')) or bool(os.environ.get('PORT'))
if IS_RENDER:
    HOST = '0.0.0.0'
    PORT = int(os.environ.get('PORT', '10000'))
    s = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f'Editor listening on {HOST}:{PORT}', flush=True)
    print('Health check: /health', flush=True)
    print('Projects directory (ephemeral on standard Render disks):', str(PROJECTS_DIR), flush=True)
else:
    s = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    url = f'http://127.0.0.1:{s.server_port}/'
    print('Editor:', url, flush=True)
    print('Permanent projects folder:', str(PROJECTS_DIR), flush=True)
    threading.Timer(1, lambda: webbrowser.open(url)).start()

s.serve_forever()
