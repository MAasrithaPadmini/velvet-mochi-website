VELVET MOCHI - SECURITY/LEGAL FIXES (BATCH 1)
================================================

FILES CHANGED / ADDED
----------------------
1. components/auth-form.tsx (EDITED)
   - Registration now requires two checkboxes before submitting:
     "I confirm I am 18+" and "I agree to Terms & Privacy Policy"
   - On successful signup, saves age_confirmed = true to the user's
     profile row in Supabase.

2. components/account-settings.tsx (NEW)
   - Change password form
   - Delete account flow with a "type DELETE to confirm" safety step

3. app/profile/page.tsx (EDITED)
   - Added an "Account settings" section using the new component

4. app/api/account/delete/route.ts (NEW)
   - Server route that verifies the logged-in user, then uses the
     Supabase service role to permanently delete their auth user.
   - Deleting the auth user cascades to delete their profile row and
     anything else with ON DELETE CASCADE per your schema.sql.

5. app/contact/page.tsx (NEW)
   - Contact & Support page with sections for:
     general questions, reporting copyright infringement, reporting
     abuse/harassment, and account/data requests
   - Pulls the author email from your existing author_profile table
     (same one used on the About page) -- no new config needed.

6. components/footer.tsx (EDITED)
   - Added a "Contact & Support" link so the new page is discoverable
     site-wide.

HOW TO APPLY
------------
Copy each file into the same path in your project, overwriting the
existing ones (auth-form.tsx, profile/page.tsx, footer.tsx) and adding
the 3 new files. Commit and push -- Vercel will auto-deploy.

NOTE ON DELETE ACCOUNT
-----------------------
This uses your SUPABASE_SERVICE_ROLE_KEY (already in your env vars
per your settings page checks) to call the Supabase admin API. Make
sure that env var is set in Vercel's project settings, not just
.env.local, or this route will fail in production.

WHAT'S NEXT
-----------
Next batch will cover: chapter list pagination (you have 101 chapters
on one page right now), the homepage story description bug, and the
"Unscheduled" label fix.
