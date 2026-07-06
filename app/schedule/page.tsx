import { AppShell, PageHeader } from "@/components/app-shell";
import Link from "next/link";
import { listStories, listChapters } from "@/lib/repositories";

export const metadata = {
  title: "Release Schedule | Velvet Mochi",
  description: "See how often each story on Velvet Mochi updates and when the latest chapter went up.",
};

export const revalidate = 60;

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "No chapters yet";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? "" : "s"} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) === 1 ? "" : "s"} ago`;
}

export default async function SchedulePage() {
  const stories = await listStories();

  const rows = await Promise.all(
    stories.map(async (story) => {
      const chapters = await listChapters(story.slug);
      const published = chapters.filter((c) => c.published_at);
      const latest = published.sort(
        (a, b) => new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime()
      )[0];
      return { story, latestDate: latest?.published_at ?? null, chapterCount: published.length };
    })
  );

  return (
    <AppShell>
      <PageHeader eyebrow="Updates" title="Release Schedule" />
      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="glass rounded-[1.75rem] p-6 sm:p-10">
          <p className="text-sm leading-6 text-cream/68 mb-6">
            Update pace varies by story. Here&apos;s when each one last posted a new chapter, so you know
            what to expect.
          </p>

          {rows.length === 0 ? (
            <p className="text-sm text-cream/55">No stories published yet.</p>
          ) : (
            <div className="space-y-3">
              {rows.map(({ story, latestDate, chapterCount }) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.slug}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cream/10 bg-cream/6 p-4 hover:bg-cream/10"
                >
                  <div>
                    <div className="font-display text-xl text-cream">{story.title}</div>
                    <div className="mt-1 text-sm text-cream/55">
                      {chapterCount} chapter{chapterCount === 1 ? "" : "s"} · {story.status}
                    </div>
                  </div>
                  <div className="text-sm text-champagne">
                    Last update: {timeAgo(latestDate)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
