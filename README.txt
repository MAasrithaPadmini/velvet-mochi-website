VELVET MOCHI - FIXES BATCH 4
================================================

FILES CHANGED / ADDED
----------------------
1. components/reader-controls.tsx (NEW)
   - Font size control (S/M/L/XL) and reading width control
     (Narrow/Normal/Wide), shown above each chapter's text.
   - Preferences persist per-device via localStorage, so a reader's
     choice sticks across chapters and future visits.

2. app/stories/[slug]/chapters/[chapter]/page.tsx (EDITED)
   - Renders ReaderControls above the chapter text.

3. components/reader-sidebar.tsx (EDITED)
   - Previous/Next buttons now sit alongside a new "Chapters" button
     that links back to the story's full chapter list -- so readers
     always have a way back without hitting browser back button.

4. components/auth-form.tsx (EDITED) -- LOGIN RATE LIMITING
   - After 5 failed login attempts, the form locks for 2 minutes and
     shows a countdown-style message instead of letting further
     attempts through.

   IMPORTANT HONESTY NOTE: this is a client-side (browser-level) speed
   bump, not a substitute for real server-side protection. The actual
   line of defense against brute-force attacks is Supabase Auth itself,
   which already rate-limits sign-in attempts per IP by default on
   their servers. You can review/tighten those settings at:
   Supabase Dashboard -> Authentication -> Rate Limits
   This client-side lockout just gives legitimate users a clearer,
   friendlier message instead of silently failing over and over.

HOW TO APPLY
------------
Copy each file into the same path in your project, overwriting the
existing ones. Commit and push.
