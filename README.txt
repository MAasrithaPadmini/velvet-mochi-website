VELVET MOCHI - FIXES BATCH 6 (COMMENTS MODERATION)
=====================================================

⚠️ THIS BATCH REQUIRES A DATABASE STEP -- DO THIS FIRST
---------------------------------------------------------
1. Go to your Supabase project -> SQL Editor -> New query
2. Open supabase/migrations/comment_reports.sql from this zip
3. Paste its full contents into the SQL editor and click Run
   (this creates the comment_reports table safely -- it won't affect
   any existing data)

FILES CHANGED / ADDED
----------------------
1. supabase/migrations/comment_reports.sql (NEW)
   - New table to store comment reports, with RLS so only admins can
     read/update reports, and any signed-in reader can file one for
     themselves (one report per person per comment).

2. app/api/comments/[id]/report/route.ts (NEW)
   - API route a reader hits to report a comment.

3. components/comments-list.tsx (REWRITTEN)
   - Added a "Report" flag button on every comment that isn't the
     current user's own. Once reported, the button disables so the
     same person can't spam-report the same comment repeatedly.
   - Small toast message confirms the report was received.

4. app/api/comments/route.ts (EDITED) -- SPAM PROTECTION
   - Rate limiting: max 5 comments per 5 minutes per user.
   - Blocks comments with more than 2 links (common spam pattern).
   - Blocks comments with long runs of the same repeated character
     (e.g. "aaaaaaaaaa...", a classic spam/flood pattern).

5. app/dashboard/moderation/page.tsx (NEW)
   - Admin-only page listing every pending report: who wrote the
     comment, what it says, when it was reported, and why.

6. components/moderation-queue.tsx (NEW)
   - "Dismiss (not spam)" and "Delete comment" actions for each report.

7. app/api/admin/moderation/[id]/route.ts (NEW)
   - Backend route the moderation page calls to dismiss a report or
     delete the comment + mark the report actioned.

8. components/app-shell.tsx (EDITED)
   - Added "Moderation" to the admin nav so you can find the new page.

HOW TO APPLY
------------
1. Run the SQL migration in Supabase FIRST (see above).
2. Copy each file into the same path in your project.
3. Commit and push.
4. Visit /dashboard/moderation as an admin to see the new queue.

NOTE ON SPAM PROTECTION
-------------------------
These are reasonable, lightweight heuristics (rate limit + link count +
repeated-character detection) -- good enough to stop casual spam bots
and flooding. They won't stop a sophisticated, targeted spammer. If you
ever need stronger protection, a proper CAPTCHA (like Cloudflare Turnstile,
which is free) on the comment form would be the next step up.
