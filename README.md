# Velvet Mochi 🌙

A serialized dark romance reading platform. You publish chapters daily, readers come back to continue where they left off, bookmark favorites, leave comments, and get notified when new chapters drop.

Built on Next.js 15, Supabase, and Tailwind.

---

## ⚠️ READ THIS FIRST: rotate your Supabase keys

The `.env.local` file shipped in this zip contains real keys from earlier development. **Before you publish your site to the world**, rotate them:

1. Go to your Supabase project → **Settings → API**
2. Click **"Reset"** next to both the `anon` key and the `service_role` key
3. Paste the new values into `.env.local` (and into Vercel's environment variables when you deploy)

The `service_role` key especially can do anything to your database. Treat it like a credit card.

---

## 🚀 Run it locally (5 minutes)

You need [Node.js 20+](https://nodejs.org) installed.

```bash
# 1. Install dependencies
npm install

# 2. Set up your Supabase database
#    - Open https://supabase.com/dashboard
#    - Pick your project → SQL editor
#    - Paste the entire contents of supabase/schema.sql and run it
#    - This creates all tables, policies, triggers, and the profile-creation trigger

# 3. Create your storage buckets (one-time, in the Supabase dashboard → Storage)
#    Create these 4 buckets, all PUBLIC:
#      - story-covers
#      - character-art
#      - moodboards
#      - author-assets

# 4. Seed three demo stories (optional, just to see something)
npm run seed:supabase

# 5. Make your admin account
#    First sign up at /register with your email, then run:
npm run create:admin -- your@email.com
#    This promotes your account to the "admin" role so you can use /dashboard

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📝 Daily publishing workflow (this is what you'll do every day)

1. Log in at `/login` with your admin account
2. Go to **Dashboard → Chapters**
3. Pick the story, write the chapter title and body
4. The body supports light markdown:
   - `**bold**` for **bold**
   - `*italic*` or `_italic_` for *italic*
   - A blank line starts a new paragraph
5. Three buttons:
   - **Save draft** — for unfinished writing (auto-saves every 4 seconds)
   - **Schedule** — pick a date/time and the chapter auto-publishes then
   - **Publish now** — goes live immediately + notifies all readers

When you publish (now or scheduled), every reader gets a notification on their Bookshelf with a link to the new chapter.

---

## 🌍 Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → import the repo
3. Add environment variables (copy from `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET` — set this to a long random string (run `openssl rand -hex 32` to make one)
4. Click Deploy
5. In Vercel project settings → **Domains**, add your custom domain
6. In Supabase → **Authentication → URL Configuration**:
   - Set your **Site URL** to `https://yourdomain.com`
   - Add `https://yourdomain.com/auth/callback` and `https://yourdomain.com/reset-password/confirm` to **Redirect URLs**

Vercel's cron will hit `/api/cron/publish-scheduled` every 15 minutes to publish any chapter whose scheduled time has passed.

---

## 🗺️ Project structure

```
app/
  page.tsx                      Homepage with continue-reading
  library/                      Browse all stories
  bookshelf/                    Logged-in reader home (progress, bookmarks, notifications)
  profile/                      Reader profile + achievements
  stories/[slug]/               Story detail
  stories/[slug]/chapters/[n]/  Chapter reader
  dashboard/                    ADMIN ONLY — your publishing command room
    page.tsx                    Overview with metrics
    stories/                    Create/edit/delete stories
    chapters/                   Write & schedule chapters (auto-save)
    notifications/              Broadcast to all readers
    newsletter/                 Subscribers + send campaigns
    analytics/                  Reader pulse, top stories, top chapters
    settings/                   Env + bucket health checks
  login/  register/             Auth pages
  reset-password/               Password reset flow
  auth/callback/                Email confirmation handler
  api/
    admin/                      Admin-only CRUD (auth-gated)
    reader/                     Logged-in reader endpoints (progress, bookmarks)
    cron/publish-scheduled      Vercel cron auto-publishes scheduled chapters
    comments/                   Comments CRUD
    newsletter/                 Public subscribe
    notifications/              Read + mark-read
components/
  app-shell.tsx                 Nav + mobile menu + age gate wrapper
  admin-managers.tsx            Story & chapter editors (the publishing UI)
  reader-sidebar.tsx            Bookmark, progress, comment posting
  comments-list.tsx             Comments display
  age-gate.tsx                  18+ confirmation (legal protection)
  newsletter-form.tsx           Public email signup
lib/
  auth.ts                       getCurrentProfile, requireAdmin
  repositories.ts               Data fetching
  markdown.ts                   Chapter body renderer
  supabase/                     Server + browser + service clients
  types.ts                      All TypeScript types
middleware.ts                   Session refresh — KEEPS USERS LOGGED IN
supabase/schema.sql             Full database schema (run once)
vercel.json                     Cron config
```

---

## ❓ Common questions

**Will the platform crash if Supabase env vars are missing?**
No — the app stays up but lists/queries return empty. Visit `/dashboard/settings` to see what's set up.

**How do I make myself an admin without the script?**
In Supabase SQL editor: `update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'your@email.com');`

**Why don't emails actually send when I click "Send campaign"?**
By design, "Send campaign" only logs the campaign and shows the subscriber list. To actually deliver email, plug in [Resend](https://resend.com) or [Postmark](https://postmarkapp.com) inside `app/api/admin/newsletter/send/route.ts` (look for the `TODO` comment area near `insert into newsletter_campaigns`).

**Can readers see drafts?**
No. Drafts and scheduled chapters are RLS-protected — only authors/admins see them.

**What about the age gate?**
It's a localStorage check that appears on first visit. It's a soft gate (not foolproof), but it gives you a reasonable legal posture for adult content.

**My scheduled chapter didn't publish on Vercel.**
Check that `CRON_SECRET` is set in Vercel project env. Vercel hobby tier supports cron — confirm the cron is enabled in your project settings.

---

## 🐛 Troubleshooting

- **"Supabase not configured"** anywhere → check `.env.local` has all three keys
- **Sign up appears to succeed but profile is missing** → re-run `supabase/schema.sql`; the `handle_new_user` trigger creates profiles automatically
- **Cover upload fails** → make sure the 4 storage buckets exist and are **public**
- **Comments don't appear** → run `supabase/schema.sql` again, the policies must be in place
- **Cron not firing on Vercel** → set `CRON_SECRET` and confirm `vercel.json` is in the project root

Happy publishing 🌙
