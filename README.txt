VELVET MOCHI - FIXES BATCH 7 (AUTOMATIC CHAPTER NEWSLETTER EMAILS)
=====================================================================

WHAT WAS ACTUALLY WRONG
--------------------------
Subscribing worked fine. But nothing in your code ever automatically
emailed subscribers when a chapter went live -- uploading a chapter
only created an in-app notification (the bell icon). Sending an email
required YOU to manually go to /dashboard/newsletter, write a subject
and message, and click Send. So subscribing + uploading a chapter with
no manual send in between correctly produced silence.

⚠️ YOU STILL NEED RESEND CONFIGURED FOR ANY OF THIS TO SEND
--------------------------------------------------------------
None of this will actually deliver emails until you have:
1. A Resend account (resend.com) with a verified sending domain
   (e.g. velvetmochi.com -- involves adding DNS records at Namecheap)
2. These environment variables set in Vercel:
   - RESEND_API_KEY
   - NEWSLETTER_FROM_EMAIL (must match your verified domain, e.g.
     newsletter@velvetmochi.com)
   - NEWSLETTER_FROM_NAME (e.g. "Velvet Mochi")
3. Redeploy after adding them

If these aren't set, chapter publishing will still work fine --
the code silently skips the email step and logs a warning instead of
failing, so it won't break your publishing flow.

FILES CHANGED / ADDED
----------------------
1. lib/newsletter.ts (NEW)
   - Shared helper: notifySubscribersOfChapter() -- emails every
     subscribed reader with the story title, chapter title, a "Read
     now" button, and a personalized unsubscribe link.

2. app/api/admin/chapters/route.ts (EDITED)
   - When you create a chapter and set it to "published" immediately,
     it now also emails subscribers (in addition to the existing
     in-app notification).

3. app/api/admin/chapters/[id]/route.ts (EDITED)
   - Same, but for when you edit an existing draft/scheduled chapter
     and change its status to "published".

4. app/api/cron/publish-scheduled/route.ts (EDITED)
   - Same, but for chapters that auto-publish via your scheduled
     cron job.

5. app/api/newsletter/unsubscribe/route.ts (NEW)
   - Marks a subscriber's status as "unsubscribed" in the database.

6. app/unsubscribe/page.tsx (NEW)
   - Public unsubscribe page. If someone clicks the unsubscribe link
     in an email (which includes their email as a URL parameter), it
     unsubscribes them automatically. Also works as a manual form if
     someone navigates there directly without a link.

7. app/api/admin/newsletter/send/route.ts (EDITED)
   - Manual newsletter sends (from your dashboard) now also include a
     personalized unsubscribe link in the footer, matching the
     automatic chapter emails.

HOW TO APPLY
------------
Copy each file into the same path in your project. Commit and push.
Then set up Resend + the env vars above if you haven't already.

TO TEST END TO END
-------------------
1. Subscribe with a real email you can check.
2. Publish a new chapter (or edit a draft chapter to "published").
3. Check that inbox within a minute or two.
4. Click "Unsubscribe" in that email and confirm it works.
