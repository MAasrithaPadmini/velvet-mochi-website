import Link from "next/link";
import { BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { BookCover, StoryCard } from "@/components/story-card";
import { NewsletterForm } from "@/components/newsletter-form";
import { listStories } from "@/lib/repositories";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toPlainText } from "@/lib/plain-text";
import { BRAND, getAuthorProfile } from "@/lib/brand";
import { siteGraph } from "@/lib/structured-data";
import { JsonLd } from "@/components/json-ld";

export const revalidate = 60;

// Canonical set here only: in the root layout it would be inherited by every page.
export const metadata = { alternates: { canonical: "/" } };

async function getContinueReading() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("reading_progress")
    .select("story_id, chapter_id, progress, updated_at")
    .eq("user_id", profile.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;

  const { data: chapter } = await supabase
    .from("chapter_library")
    .select("story_slug, number, title, story_title")
    .eq("id", data.chapter_id)
    .maybeSingle();
  if (!chapter) return null;
  return { ...data, ...chapter };
}

export default async function HomePage() {
  const [stories, continueReading, author] = await Promise.all([listStories(), getContinueReading(), getAuthorProfile()]);
  const featured = stories[0];

  return (
    <AppShell>
      <section className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-16">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-champagne/25 bg-champagne/10 px-4 py-2 text-sm text-champagne">
            <Sparkles size={16} />
            A moonlit serialized fiction library
          </div>
          <h1 className="font-display text-5xl leading-[.95] text-cream drop-shadow-2xl sm:text-7xl lg:text-8xl">
            Velvet Mochi
          </h1>
          <p className="mt-6 max-w-2xl text-base sm:text-lg leading-7 sm:leading-8 text-cream/76">
            Dark romance, serialized chapter by chapter. Cozy reading nooks, persistent bookmarks, and stories that
            return every night with the moon.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/library"
              className="inline-flex items-center gap-2 rounded-full bg-champagne px-5 py-3 font-semibold text-velvet shadow-glow"
            >
              Enter the library <ChevronRight size={18} />
            </Link>
            {continueReading ? (
              <Link
                href={`/stories/${continueReading.story_slug}/chapters/${continueReading.number}`}
                className="inline-flex items-center gap-2 rounded-full border border-cream/14 bg-cream/7 px-5 py-3 font-semibold text-cream"
              >
                Continue {continueReading.story_title} <BookOpen size={18} />
              </Link>
            ) : featured ? (
              <Link
                href={`/stories/${featured.slug}/chapters/1`}
                className="inline-flex items-center gap-2 rounded-full border border-cream/14 bg-cream/7 px-5 py-3 font-semibold text-cream"
              >
                Start reading <BookOpen size={18} />
              </Link>
            ) : null}
          </div>
        </div>
        {featured && (
          <div className="glass rounded-[2rem] p-4">
            <BookCover story={featured} large />
            <h2 className="mt-5 font-display text-3xl sm:text-4xl text-cream">{featured.title}</h2>
            <p className="mt-2 text-sm leading-6 text-cream/68">{toPlainText(featured.synopsis)}</p>
          </div>
        )}
      </section>

      {/* Only show the shelf once it has at least two stories besides the featured one. */}
      {stories.length >= 3 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[.28em] text-champagne/70">Latest shelves</p>
              <h2 className="mt-2 font-display text-3xl sm:text-5xl text-cream">New and beloved</h2>
            </div>
            <Link href="/library" className="hidden rounded-full border border-cream/12 px-4 py-2 text-sm text-cream/72 sm:inline-block">
              View all
            </Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {stories.slice(1, 4).map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 pb-10 sm:px-6 lg:px-8">
        {/* Plain-language answer to "what is Velvet Mochi?" for readers, search engines and AI assistants. */}
        <h2 className="font-display text-3xl text-cream">What is Velvet Mochi?</h2>
        <p className="mt-3 text-sm leading-7 text-cream/70">{BRAND.longDescription}</p>
        <p className="mt-2 text-sm leading-7 text-cream/55">
          Start in the <Link href="/library" className="text-champagne underline">library</Link>, read the{" "}
          <Link href="/faq" className="text-champagne underline">FAQ</Link>, or meet the{" "}
          <Link href="/about" className="text-champagne underline">author</Link>.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <NewsletterForm />
      </section>

      <JsonLd data={siteGraph(author)} />
    </AppShell>
  );
}
