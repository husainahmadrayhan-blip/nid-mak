EDITOR + PERMANENT PROJECT SAVE
================================

RUN:
1. Extract the whole "New folder" directory somewhere on your Windows PC.
2. Open "New folder".
3. Double-click RUN-LOCAL-WINDOWS.bat.
4. The Editor opens and the included NID HTML Project loads automatically.

PERMANENT SAVE:
- Enter a project name and click "Save Project".
- The project is written to: New folder\projects\<Project Name>\
- A project.zip copy is stored in that folder.
- Select a project in "Saved Projects" and click "Open Saved" to reopen it.
- "Delete Saved" removes that project's folder from disk.
- "Export ZIP" still downloads a portable copy.

IMPORTANT:
- Keep RUN-LOCAL-WINDOWS.bat and server.py in the same folder.
- Leave the server console open while using the Editor.
- Saved projects are files on your computer, not browser-only storage.
- Back up the "projects" folder if the projects are important.

STABLE HTML POSITIONS:
- Use "Save Positions Permanently" after arranging fields.
- Saved positions are reapplied before the preview is redrawn, including after Auto Fill.
- Re-running Auto Fill changes field values, not their saved layout positions.

FONT MATCHING UPDATE:
- Font Family list now includes Nikosh, Noto Serif Bengali, Siyam Rupali, and SutonnyMJ.
- The selected font style is saved with the permanent layout when you click Save Positions Permanently.
- Install the matching font in Windows if it is not already available.

NEW: FULL ZIP WITH PERMANENT POSITION
====================================
- নতুন “Full ZIP (Saved Position)” বোতাম যোগ করা হয়েছে।
- Text size/position পরিবর্তনের পরে এই বোতাম চাপলে বর্তমান সম্পাদিত HTML এবং প্রজেক্টের সব লোড করা ফাইল/asset একসাথে ZIP হবে।
- ZIP ফাইলে সম্পাদিত HTML-এ বর্তমান font size, অবস্থান, font family এবং অন্যান্য style রাখা হয়।
- ZIP নাম হবে <ProjectName>-permanent-full-project.zip।
- ZIP বানানোর আগে উপলব্ধ permanent-layout flush ফাংশন চালানো হয়।
