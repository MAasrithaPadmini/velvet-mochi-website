VELVET MOCHI - BUILD FIX (unsubscribe page crash)
====================================================

WHAT WENT WRONG
------------------
app/unsubscribe/page.tsx had "use client" at the top, but it also
imported AppShell (a server component that reads cookies to check
who's logged in). In Next.js App Router, a file marked "use client"
gets bundled for the browser -- and browser code can't use
next/headers (cookies()), which AppShell's auth check depends on.
That's exactly what the build error was pointing at.

THE FIX
---------
Split it into two files, matching the same pattern your existing
login page already uses correctly:

1. components/unsubscribe-form.tsx (NEW)
   - The interactive part (the actual form, useSearchParams, fetch
     calls) -- this is the ONLY part that needs "use client".

2. app/unsubscribe/page.tsx (REPLACED)
   - Back to being a plain server component (no "use client").
   - Renders AppShell normally, and renders <UnsubscribeForm /> inside
     a Suspense boundary (required because it uses useSearchParams).

HOW TO APPLY
------------
1. Delete app/unsubscribe/page.tsx from your project (the old broken
   version) if it's still there.
2. Add components/unsubscribe-form.tsx (new file).
3. Add app/unsubscribe/page.tsx (replaces the old one).
4. Commit and push. This should fix the failed build.

git add .
git commit -m "Fix unsubscribe page build error (client/server component split)"
git push
