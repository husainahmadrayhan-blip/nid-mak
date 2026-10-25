from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import os, json, threading, webbrowser, base64, zipfile, io, re, shutil, time
ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)
PROJECTS_DIR = ROOT / "projects"
PROJECTS_DIR.mkdir(exist_ok=True)

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
# Playwright's synchronous API is thread-affine. Use a single-threaded local HTTP server
# so browser startup, status checks, and PDF uploads all run on the same thread.
s=HTTPServer(('127.0.0.1',0),Handler)
url=f'http://127.0.0.1:{s.server_port}/'
print('Editor:',url,flush=True)
print('Permanent projects folder:', str(PROJECTS_DIR), flush=True)
threading.Timer(1,lambda:webbrowser.open(url)).start()
s.serve_forever()
