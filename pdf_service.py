from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
import os, json, traceback, hashlib
from playwright.sync_api import sync_playwright

TOKEN = os.environ.get("PDF_SERVICE_TOKEN", "").strip()
MAX_HTML = 100 * 1024 * 1024

class Handler(BaseHTTPRequestHandler):
    def reply(self, code, body, content_type="application/json"):
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/health":
            fingerprint = hashlib.sha256(TOKEN.encode("utf-8")).hexdigest()[:12] if TOKEN else None
            body = json.dumps({
                "ok": True,
                "service": "playwright-pdf",
                "token_configured": bool(TOKEN),
                "token_fingerprint": fingerprint
            }).encode("utf-8")
            self.reply(200, body)
        else:
            self.reply(404, b'{"ok":false,"error":"not found"}')

    def do_POST(self):
        if self.path != "/render":
            return self.reply(404, b'{"ok":false,"error":"not found"}')
        if not TOKEN or self.headers.get("Authorization") != "Bearer " + TOKEN:
            return self.reply(401, b'{"ok":false,"error":"unauthorized"}')
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if not 0 < size <= MAX_HTML:
                raise ValueError("HTML must be between 1 byte and 100 MB")
            payload = json.loads(self.rfile.read(size).decode("utf-8"))
            html = payload.get("html")
            if not isinstance(html, str) or "<html" not in html.lower():
                raise ValueError("Valid HTML is required")
            base_url = str(payload.get("base_url") or "").strip()
            if base_url and "<head" in html.lower():
                import re
                base = '<base href="' + base_url.rstrip("/") + '/">'
                html = re.sub(r"(<head[^>]*>)", lambda m: m.group(1) + base, html, count=1, flags=re.I)
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
                try:
                    page = browser.new_page()
                    page.set_content(html, wait_until="domcontentloaded", timeout=30000)
                    try:
                        page.wait_for_function("() => !document.fonts || document.fonts.status === 'loaded'", timeout=10000)
                    except Exception:
                        pass
                    try:
                        page.wait_for_function("() => Array.from(document.images).every(img => img.complete)", timeout=10000)
                    except Exception:
                        pass
                    pdf = page.pdf(print_background=True, prefer_css_page_size=True)
                    if not pdf.startswith(b"%PDF-"):
                        raise RuntimeError("Chromium returned invalid PDF data")
                finally:
                    browser.close()
            self.reply(200, pdf, "application/pdf")
        except Exception as exc:
            print("[PDF_SERVICE] " + repr(exc), flush=True)
            traceback.print_exc()
            body = json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False).encode("utf-8")
            self.reply(500, body)

    def log_message(self, fmt, *args):
        print("[PDF_SERVICE] " + (fmt % args), flush=True)

port = int(os.environ.get("PORT", "10000"))
server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
print(f"Playwright PDF service listening on 0.0.0.0:{port}", flush=True)
server.serve_forever()
