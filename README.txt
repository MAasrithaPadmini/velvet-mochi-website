VELVET MOCHI - FIXES BATCH 3
================================================

FILES CHANGED / ADDED
----------------------
1. app/faq/page.tsx (NEW)
   - Answers common questions: is it free, do you need an account,
     what the age gate is, how to report issues, how to delete your
     account, whether it's fan fiction, etc.

2. app/content-guide/page.tsx (NEW)
   - Dynamically pulls every unique content/trigger warning tag
     actually used across your published stories (queries your live
     Supabase data -- doesn't hardcode assumptions) and shows a plain
     explanation for each. Falls back to a generic note for any tag
     not in the built-in dictionary, so it never breaks if you add a
     new warning label later.

3. app/schedule/page.tsx (NEW)
   - Shows each published story with its chapter count, status, and
     "last update: X days/weeks ago" -- computed from real published_at
     timestamps in your chapters, not made up.

4. components/footer.tsx (EDITED)
   - Added links to Release Schedule, Content Guide, and FAQ so
     they're discoverable site-wide.

5. app/sitemap.ts (EDITED)
   - Added /faq, /content-guide, /schedule, and /contact to your
     sitemap so Google indexes them too.

HOW TO APPLY
------------
Copy each file into the same path in your project (paths shown above).
The 3 page.tsx files are new -- create the folders/files fresh. The
footer.tsx and sitemap.ts overwrite existing files. Commit and push.
