PDF text/font preservation update
================================

Changes:
- PDF extraction now attempts to extract each page's embedded font programs and associates them with the detected text spans.
- The editor uses the extracted source font in the on-screen editable text layer when available.
- Export sends the same embedded font program back to the PDF writer and attempts to keep the original point size. If the changed text does not fit the original bounding box, the export shrinks it only as needed and wraps it within the box.
- Text layer display font size scales with the PDF preview so the text position and size are easier to compare.

Limitations:
- Some PDFs embed subset fonts containing only the glyphs used in the original PDF. If pasted text includes characters not present in that subset, the exact original font cannot render those new characters; a compatible Bengali font must be used instead.
- Some PDFs use outlined text, Type 3 fonts, unusual encodings, clipping masks, or scanned pages. Such elements may not be editable as normal Unicode text.
- Text length and font metrics may differ after replacement. Always inspect the exported PDF before use.
