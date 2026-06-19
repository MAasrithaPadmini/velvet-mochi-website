import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Bookmark as BookmarkIcon, Bell } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ProgressRow = {
  story_id: string;
  chapter_id: string;
  progress: number;
  updated_at: string;
};

type BookmarkRow = {
  id: string;
  story_id: string;
  chapter_id: string | null;
  label: string;
  created_at: string;
};

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  created_at: string;
  read_at: string | null;
};

export default async function BookshelfPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/bookshelf");

  const supabase = await createClient();
  if (!supabase) redirect("/login?next=/bookshelf");

  const [progressRes, bookmarksRes, notificationsRes, storiesRes, chaptersRes] = await Promise.all([
    supabase
      .from("reading_progress")
      .select("story_id, chapter_id, progress, updated_at")
      .eq("user_id", profile.id)
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase
      .from("bookmarks")
      .select("id, story_id, chapter_id, label, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("notifications")
      .select("id, title, body, link, created_at, read_at")
      .or(`user_id.eq.${profile.id},user_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(15),
    supabase.from("stories").select("id, slug, title, synopsis, cover, cover_url, chapter_count"),
    supabase.from("chapter_library").select("id, story_slug, number, title"),
  ]);

  const progress = (progressRes.data ?? []) as ProgressRow[];
  const bookmarks = (bookmarksRes.data ?? []) as BookmarkRow[];
  const notifications = (notificationsRes.data ?? []) as NotificationRow[];
  const stories = storiesRes.data ?? [];
  const chapters = chaptersRes.data ?? [];

  const storyMap = new Map(stories.map((s) => [s.id, s]));
  const chapterMap = new Map(chapters.map((c) => [c.id, c]));

  // Group reading progress by story → keep most recent chapter per story
  const continueByStory = new Map<string, ProgressRow>();
  for (const row of progress) {
    if (!continueByStory.has(row.story_id)) continueByStory.set(row.story_id, row);
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow={`Welcome back, ${profile.display_name}`}
        title="Your private bookshelf."
        copy="Continue where you left off, revisit bookmarks, and catch up on chapter alerts."
      />

      {/* Continue reading */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="mb-4 inline-flex items-center gap-2 font-display text-3xl text-cream">
          <BookOpen size={22} /> Continue reading
        </h2>
        {continueByStory.size === 0 ? (
          <div className="glass rounded-[1.5rem] p-6 text-cream/60">
            You haven&apos;t started reading yet.{" "}
            <Link href="/library" className="text-champagne">
              Browse the library
            </Link>{" "}
            to begin.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from(continueByStory.values()).map((row) => {
              const story = storyMap.get(row.story_id);
              const chapter = chapterMap.get(row.chapter_id);
              if (!story || !chapter) return null;
              return (
                <Link
                  key={row.chapter_id}
                  href={`/stories/${story.slug}/chapters/${chapter.number}`}
                  className="glass rounded-[1.5rem] p-5 hover:bg-cream/8"
                >
                  <div className="text-xs uppercase tracking-wide text-champagne/75">{story.title}</div>
                  <div className="mt-1 font-display text-2xl text-cream">{chapter.title}</div>
                  <div className="mt-3 h-1.5 rounded-full bg-cream/8 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose to-champagne"
                      style={{ width: `${row.progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-cream/55">
                    {row.progress}% · Last read {new Date(row.updated_at).toLocaleDateString()}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Bookmarks */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="mb-4 inline-flex items-center gap-2 font-display text-3xl text-cream">
          <BookmarkIcon size={22} /> Bookmarks ({bookmarks.length})
        </h2>
        {bookmarks.length === 0 ? (
          <p className="glass rounded-[1.5rem] p-5 text-sm text-cream/60">
            No bookmarks yet. Tap the bookmark icon on any chapter to save it here.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {bookmarks.map((b) => {
              const story = storyMap.get(b.story_id);
              const chapter = b.chapter_id ? chapterMap.get(b.chapter_id) : null;
              if (!story) return null;
              return (
                <Link
                  key={b.id}
                  href={chapter ? `/stories/${story.slug}/chapters/${chapter.number}` : `/stories/${story.slug}`}
                  className="rounded-2xl border border-cream/10 bg-cream/6 p-4 hover:bg-cream/10"
                >
                  <div className="text-xs uppercase tracking-wide text-champagne/70">{story.title}</div>
                  <div className="mt-1 font-medium text-cream">{b.label}</div>
                  <div className="mt-1 text-xs text-cream/50">{new Date(b.created_at).toLocaleDateString()}</div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Notifications */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="mb-4 inline-flex items-center gap-2 font-display text-3xl text-cream">
          <Bell size={22} /> Recent notifications
        </h2>
        {notifications.length === 0 ? (
          <p className="glass rounded-[1.5rem] p-5 text-sm text-cream/60">No notifications yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {notifications.map((n) => {
              const content = (
                <>
                  <div className="font-semibold text-cream">{n.title}</div>
                  <p className="mt-1 text-sm text-cream/65">{n.body}</p>
                  <p className="mt-2 text-xs text-cream/45">{new Date(n.created_at).toLocaleString()}</p>
                </>
              );
              return n.link ? (
                <Link
                  key={n.id}
                  href={n.link}
                  className="rounded-2xl border border-cream/10 bg-cream/6 p-4 hover:bg-cream/10"
                >
                  {content}
                </Link>
              ) : (
                <div key={n.id} className="rounded-2xl border border-cream/10 bg-cream/6 p-4">
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}
