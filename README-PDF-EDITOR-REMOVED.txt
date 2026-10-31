PDF Editor Upload Removal
=========================
The additional "PDF Viewer ও Editable Layer" upload/editor section and its API endpoints have been removed as requested.
The existing original PDF Upload + Extract PDF function for the PDF-to-JSON workflow remains.


Correction: Native Chrome Print only
- The server-side print interception that was still posting to /api/pdf/create has been removed.
- The Gotenberg health and PDF creation endpoints have been removed from server.py.
- The Print/PDF button now uses the editor's native browser print flow only.
- Start the editor with RUN-NIDMAK-WITH-TUNNEL.bat. Docker/Gotenberg is not started.
