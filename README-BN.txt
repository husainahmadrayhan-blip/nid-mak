পরিবর্তিত ফাইল
- fingerprint-orientation.js
- auto-fit-media.js

যা বদলানো হয়েছে:
- Fingerprint orientation script আর পুরোনো saved rotation render/observer দিয়ে auto-apply করে না।
- নতুন fingerprint-এর default rotation 0°; Apply to selected / Reset 0°-তে rotation explicit।
- rotation CSS transform দিয়ে প্রয়োগ হয়, left/top/width/height বদলানো হয় না।
- Auto Trim settings default false; trim কেবল ব্যবহারকারী Apply করলে preview/process copy-তে প্রয়োগ হয়, source URL/image বদলে দেওয়া হয় না।

পরীক্ষা:
- Node.js --check fingerprint-orientation.js: PASS
- Node.js --check auto-fit-media.js: PASS
- Full browser upload/preview/save/print end-to-end: এই পরিবেশে চালানো হয়নি।
- Box geometry comparison and print visual parity: বাস্তবে যাচাই করা হয়নি।

AI FORMAT AUTO FILL:
- PDF / JSON / Editor Tools panel-এর Format Auto Fill অংশে Gemini 3 Flash বা Grok Console নির্বাচন করুন।
- API Key Save করলে server folder-এ private-api-keys.json নামে আলাদা ফাইলে থাকবে। এই ফাইল Git ignore করা আছে এবং Export ZIP-এ যোগ করা হয় না।
- Local Windows server-এ ফাইলটি স্থায়ীভাবে থাকবে। Render deploy ব্যবহার করলে private-api-keys.json টিকে রাখার জন্য persistent disk mount করতে হবে; ephemeral filesystem redeploy-এ মুছে যেতে পারে।
- Format Paste করে AI Format Parse + Fill চাপুন। AI কেবল পাওয়া তথ্য বসাবে; খালি তথ্য নিজে থেকে পূরণ করবে না।
