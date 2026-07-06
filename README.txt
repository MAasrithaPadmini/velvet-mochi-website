VELVET MOCHI - FIXES BATCH 2
================================================

FILES CHANGED / ADDED
----------------------
1. components/chapter-list.tsx (NEW)
   - Chapters now group into collapsible blocks of 20, newest chapters
     first, with the latest group open by default.
   - For stories with 20 or fewer chapters, it just shows a flat list
     (no grouping UI needed).

2. app/stories/[slug]/page.tsx (EDITED)
   - Now uses the new ChapterList component instead of rendering all
     chapters inline. Removed the now-unused "Link" import.

3. app/page.tsx (EDITED) -- FIXES THE DUPLICATE DESCRIPTION BUG
   - Previously: your featured story (stories[0]) showed in the hero
     section with its full title + synopsis, AND ALSO appeared again
     in the "New and beloved" grid right below it (since
     stories.slice(0,3) included that same story at index 0). That's
     exactly the "same story description repeat avuthondi" bug.
   - Fixed: the grid below now starts from stories.slice(1, 4) --
     skipping the featured story so it doesn't duplicate. Also changed
     the section's visibility condition to only show when there's more
     than 1 story, so it doesn't render an empty section when you only
     have one story total.

4. components/story-card.tsx (EDITED) -- FIXES "Unscheduled" LABEL
   - Added a releaseLabel() helper: if a story has no next_release
     date set, it now shows "Ongoing" (for published/active stories)
     or "Completed" (for archived stories) instead of the raw
     "Unscheduled" placeholder text.

HOW TO APPLY
------------
Copy each file into the same path in your project (paths shown above),
overwriting the existing ones. Commit and push.

NOTE
----
The "Possessive" spelling typo you mentioned isn't in the code -- it's
in the actual story content you entered through the admin dashboard.
Just edit that story's genre/tag text directly in your dashboard to
fix it.
