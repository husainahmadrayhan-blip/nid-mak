PREMIUM LIGHT UPDATE (FULL PROJECT)

এই আপডেটে মূল ZIP-এর বিদ্যমান ফাইল/ফিচার রেখে মূল Visual Editor (index.html) এবং visual-editor/index.html-এ Premium Light UI override যোগ করা হয়েছে।

যা বদলেছে:
- Light background, readable text, white panels, blue toolbar buttons
- Input/select/textarea-র contrast ও focus state উন্নত
- Mobile layout-এর জন্য responsive rules
- Preview stage সাদা রাখা হয়েছে
- Print styling-এ নতুন UI CSS প্রভাব না ফেলার জন্য UI rules screen media-তে সীমাবদ্ধ

যা বদলানো হয়নি:
- Signature/Fingerprint orientation logic
- Auto Fit/Auto Trim behaviour
- Smart Face / OpenCV endpoint
- PDF extraction, export, saved positions, undo/redo, project save/open logic
- Embedded Bengali fonts ও nested project assets

পরীক্ষা:
- ZIP integrity: testzip
- Python compile: server.py, extract.py
- JavaScript syntax: project JS files এবং HTML-এর inline scripts (Node.js থাকলে)
- Browser end-to-end test এই পরিবেশে চালানো হয়নি; আপলোডের পর নিজে PDF, signature/fingerprint, image export এবং print preview পরীক্ষা করুন।

চালানো:
1. ZIP Extract করুন।
2. Windows-এ RUN-LOCAL-WINDOWS.bat চালান।
3. PDF extraction / Smart Face-এর জন্য requirements.txt অনুযায়ী packages install করুন।
4. Existing project files-এর backup রাখুন।
