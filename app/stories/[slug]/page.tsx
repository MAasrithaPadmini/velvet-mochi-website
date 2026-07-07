import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell, PageHeader } from "@/components/app-shell";
import { BookCover } from "@/components/story-card";
import { ChapterList } from "@/components/chapter-list";
import { getStory, listChapters } from "@/lib/repositories";
import { getCurrentProfile } from "@/lib/auth";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story || story.status === "draft") {
    return { title: "Story | Velvet Mochi" };
  }

  const title = `${story.title} | Velvet Mochi`;
  const description = story.synopsis?.slice(0, 160) || "A serialized dark romance on Velvet Mochi.";
  const images = story.cover_url ? [{ url: story.cover_url, width: 800, height: 1200, alt: story.title }] : undefined;

  return {
    title,
    description,
    openGraph: {
      title: story.title,
      description,
      type: "book",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description,
      images: story.cover_url ? [story.cover_url] : undefined,
    },
  };
}

export default async function StoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getCurrentProfile();
  const isAdmin = profile && (profile.role === "admin" || profile.role === "author");

  const story = await getStory(slug);
  if (!story) notFound();
  if (story.status !== "published" && !isAdmin) notFound();

  const chapters = await listChapters(slug, Boolean(isAdmin));

  return (
    <AppShell>
      <PageHeader eyebrow={story.universe} title={story.title} copy={story.synopsis} />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-8">
        <div className="space-y-5">
          <div className="glass rounded-[1.75rem] p-5">
            <BookCover story={story} large />
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-cream/8 px-3 py-1 text-cream/70">{story.genre}</span>
              <span className="rounded-full bg-cream/8 px-3 py-1 text-cream/70">{story.heat}</span>
              <span className="rounded-full bg-cream/8 px-3 py-1 text-cream/70">
                {story.chapter_count} chapter{story.chapter_count === 1 ? "" : "s"}
              </span>
            </div>
            {story.trigger_warnings.length > 0 && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-rose/80">Content warnings</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {story.trigger_warnings.map((w) => (
                    <span key={w} className="rounded-full border border-rose/25 bg-rose/10 px-3 py-1 text-xs text-rose">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {story.characters.length > 0 && (
            <div className="glass rounded-[1.75rem] p-5">
              <h3 className="font-display text-2xl text-cream">Characters</h3>
              <ul className="mt-3 space-y-1 text-sm text-cream/75">
                {story.characters.map((c) => (
                  <li key={c} className="rounded-xl border border-cream/8 bg-cream/5 px-3 py-2">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="glass rounded-[1.75rem] p-5 sm:p-6">
          <h2 className="font-display text-3xl sm:text-4xl text-cream">Chapters</h2>
          {chapters.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-cream/10 bg-cream/5 p-4 text-sm text-cream/60">
              No chapters published yet. {isAdmin && "Add the first chapter from the dashboard."}
            </p>
          ) : (
            <ChapterList storySlug={story.slug} chapters={chapters} />
          )}
        </div>
      </section>
    </AppShell>
  );
}
