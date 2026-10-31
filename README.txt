Visual Editor restored from supplied working index.html.
1. Keep all files in one folder.
2. Run RUN-LOCAL-WINDOWS.bat.
3. For PDF extraction install: python -m pip install -r requirements.txt
4. Editor controls: New Text, drag, font, undo/redo, zoom, ZIP export.
5. PDF add-on is on the right. For image import, open a project first.
6. HTML editing can be used without Python PDF dependency; PDF extraction requires PyMuPDF.

PERMANENT POSITION SAVE:
- Import HTML and Auto Fill; drag text/photo/signature/fingerprint into place.
- Click Save Positions Permanently (also auto-saves drag and style changes).
- On next import, saved positions are restored from this browser's localStorage.
- Same browser profile and site address required; clearing site data removes saved layout.
- Export ZIP for a portable backup of positioned HTML.

SMART FACE ALIGNMENT
- Start RUN-LOCAL-WINDOWS.bat. Install requirements with: python -m pip install -r requirements.txt
- Smart Face defaults: face width 68%, vertical center 44%, auto align ON, auto crop ON.
- Face detection uses browser FaceDetector if available, otherwise local OpenCV via /api/face (no external service).
- Face detection is approximate; if it fails, the manual crop fallback is used. Check the result before exporting.
- Fix Photo box dimensions and position in Image Tools, then click Save layout. Save Photo Settings for future photos.
- Reprocess Photo applies current settings to the loaded photo. Signature and fingerprint use the separate Auto Fit controls.

FACE DETECTION FIX (v4)
- RUN-LOCAL-WINDOWS.bat checks whether OpenCV (cv2) and NumPy are installed. If missing, it attempts to install opencv-python-headless before starting the server. Internet access is needed for first-time installation.
- If installation fails, run in Command Prompt: python -m pip install --upgrade pip
  then: python -m pip install opencv-python-headless
- Chrome's /.well-known/appspecific/com.chrome.devtools.json 404 is an optional DevTools request and does not break the editor.
- A "relay with the name already exists" message does not originate in this project's source files; it usually comes from an injected browser extension or external relay integration. Test once in Chrome Incognito with extensions disabled to isolate it.


FACE DETECTION REPAIR (v5)
- v5 checks that cv2 actually provides CascadeClassifier and the Haar cascade XML file. A successful `import cv2` alone is not enough.
- If `/api/face` reports `cv2 has no attribute CascadeClassifier`, close the editor and run FIX-OPENCV-WINDOWS.bat. It removes conflicting OpenCV pip variants and reinstalls opencv-python-headless.
- If it still fails, check that your project does not contain a file or folder named cv2.py or cv2, which can shadow the real library.


DIRECT CHROME PRINT MODE:
- PDF/Print button opens the native Chrome print dialog directly.
- Choose Save as PDF in Chrome to create a PDF file.
- Docker and Gotenberg are not required for printing.
- For correct output, enable Background graphics and set Margins to None in Chrome print settings.


CHROME PRINT ONLY UPDATE:
The Print button uses the browser native print dialog. Local print does not call /api/pdf/create and does not require a Gotenberg container. RUN-NIDMAK-WITH-TUNNEL.bat starts only the editor and Cloudflare Tunnel; it does not start Docker.
