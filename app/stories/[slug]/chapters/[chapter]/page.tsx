import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ReaderSidebar } from "@/components/reader-sidebar";
import { ReaderControls } from "@/components/reader-controls";
import { CommentsList } from "@/components/comments-list";
import { getChapter, getStory, listChapters } from "@/lib/repositories";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { renderChapterBody } from "@/lib/markdown";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

// Shared between generateMetadata and the page so each request queries Supabase once.
const loadStory = cache((slug: string) => getStory(slug));
const loadChapter = cache((slug: string, number: number) => getChapter(slug, number));

function toPlainExcerpt(markdown: string, max = 155): string {
  const text = markdown
    .replace(/<[^>]+>/g, " ") // html tags
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> text
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "") // headings, quotes, lists
    .replace(/[*_~`]+/g, "") // emphasis / code marks
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : max)}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}): Promise<Metadata> {
  const { slug, chapter } = await params;
  const number = Number(chapter);
  if (!Number.isFinite(number) || number < 1) return { title: "Chapter not found | Velvet Mochi" };

  const [story, currentChapter] = await Promise.all([loadStory(slug), loadChapter(slug, number)]);
  if (!story || !currentChapter || currentChapter.status !== "published" || story.status === "draft") {
    return { title: "Chapter not found | Velvet Mochi", robots: { index: false } };
  }

  const title = `${currentChapter.title} – ${story.title} | Velvet Mochi`;
  const description =
    toPlainExcerpt(currentChapter.body ?? "") || `Read ${currentChapter.title} of ${story.title} on Velvet Mochi.`;
  const url = `${SITE_URL}/stories/${story.slug}/chapters/${currentChapter.number}`;
  const ogTitle = `${currentChapter.title} – ${story.title}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description,
      url,
      type: "article",
      siteName: "Velvet Mochi",
      images: story.cover_url ? [{ url: story.cover_url, width: 800, height: 1200, alt: story.title }] : undefined,
    },
    twitter: {
      card: story.cover_url ? "summary_large_image" : "summary",
      title: ogTitle,
      description,
      images: story.cover_url ? [story.cover_url] : undefined,
    },
  };
}

export default async function ChapterReaderPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter } = await params;
  const number = Number(chapter);
  if (!Number.isFinite(number) || number < 1) notFound();

  const profile = await getCurrentProfile();
  const isAdmin = profile && (profile.role === "admin" || profile.role === "author");

  const [story, currentChapter, allChapters] = await Promise.all([
    loadStory(slug),
    loadChapter(slug, number),
    listChapters(slug, Boolean(isAdmin)),
  ]);

  if (!story || !currentChapter) notFound();
  if (currentChapter.status !== "published" && !isAdmin) notFound();

  // Get reader state
  let initialProgress = 0;
  let isBookmarked = false;
  if (profile) {
    const supabase = await createClient();
    if (supabase) {
      const [progressRes, bookmarkRes] = await Promise.all([
        supabase
          .from("reading_progress")
          .select("progress")
          .eq("user_id", profile.id)
          .eq("chapter_id", currentChapter.id)
          .maybeSingle(),
        supabase
          .from("bookmarks")
          .select("id")
          .eq("user_id", profile.id)
          .eq("chapter_id", currentChapter.id)
          .maybeSingle(),
      ]);
      initialProgress = progressRes.data?.progress ?? 0;
      isBookmarked = Boolean(bookmarkRes.data);
    }
  }

  // Increment views (fire-and-forget, only for published chapters)
  if (currentChapter.status === "published") {
    const svc = createServiceClient();
    if (svc) {
      svc.rpc("increment_chapter_views", { chapter_id_input: currentChapter.id }).then(() => {});
    }
  }

  const sortedNumbers = allChapters
    .filter((c) => c.status === "published" || isAdmin)
    .map((c) => c.number)
    .sort((a, b) => a - b);
  const currentIdx = sortedNumbers.indexOf(number);
  const prevNumber = currentIdx > 0 ? sortedNumbers[currentIdx - 1] : null;
  const nextNumber = currentIdx >= 0 && currentIdx < sortedNumbers.length - 1 ? sortedNumbers[currentIdx + 1] : null;

  const html = renderChapterBody(currentChapter.body);

  return (
    <AppShell>
      <PageHeader
        eyebrow={story.title}
        title={currentChapter.title}
        copy={`Chapter ${currentChapter.number} · ${currentChapter.reading_minutes} minute read`}
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <div>
          <ReaderControls />
          <article
            className="reader-prose glass rounded-[1.75rem] p-6 sm:p-10 font-display text-[1.2rem] sm:text-[1.35rem] leading-[1.85]"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
        <ReaderSidebar
          story={story}
          chapter={currentChapter}
          initialProgress={initialProgress}
          isBookmarked={isBookmarked}
          loggedIn={Boolean(profile)}
          prevNumber={prevNumber}
          nextNumber={nextNumber}
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <CommentsList
          storyId={story.id}
          chapterId={currentChapter.id}
          currentUserId={profile?.id ?? null}
          isAdmin={Boolean(isAdmin)}
        />
      </section>
    </AppShell>
  );
}
