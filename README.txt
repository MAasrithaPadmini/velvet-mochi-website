VELVET MOCHI - FIXES BATCH 5
================================================

FILES CHANGED
----------------------
1. components/library-search.tsx (REWRITTEN)
   Previously: the "Genre", "Universe", "Warnings" buttons didn't
   actually filter by a *specific* genre or universe -- they just
   checked whether the field existed at all, so they barely narrowed
   results. The "Draft" filter button was also visible to every
   visitor, including regular readers who never have draft stories to
   see -- a confusing dead-end filter.

   Now:
   - Real dropdown for Genre (populated from your actual stories'
     genre values)
   - Real dropdown for Universe (same, from actual data)
   - Status dropdown: Ongoing / Completed for everyone, with a
     "Draft (admin only)" option that ONLY appears when isAdmin is
     true
   - A toggle button for "Has content warnings"
   - A friendly empty-state message when filters match nothing

2. app/library/page.tsx (EDITED)
   - Passes isAdmin down to LibrarySearch so the Draft filter is
     correctly hidden from regular readers.

3. app/stories/[slug]/page.tsx (EDITED) -- FIXES MISSING SHARE IMAGES
   Previously: this page had NO per-story metadata at all, so sharing
   any story link on WhatsApp/Facebook/Twitter showed your generic
   homepage title and description -- never the actual story's cover
   or synopsis.

   Now: added generateMetadata() that builds a unique title,
   description (from the story's synopsis), and a proper social share
   image using the story's actual cover_url -- for both Open Graph
   (Facebook/WhatsApp) and Twitter Card previews.

HOW TO APPLY
------------
Copy each file into the same path in your project, overwriting the
existing ones. Commit and push.

NOTE
----
After deploying, if you want to double check the share preview looks
right, use Facebook's Sharing Debugger or WhatsApp's own preview (paste
a story link into a WhatsApp chat draft) -- cached old previews can
take a little while to refresh even after the fix is live.
