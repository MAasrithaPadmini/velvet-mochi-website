import Link from "next/link";
import Image from "next/image";
import type { Story } from "@/lib/types";

export function BookCover({ story, large = false }: { story: Story; large?: boolean }) {
  const height = large ? "min-h-[340px]" : "min-h-[260px]";

  if (story.cover_url) {
    return (
      <div className={`${height} relative overflow-hidden rounded-[1.5rem] shadow-velvet`}>
        <Image
          src={story.cover_url}
          alt={story.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          priority={large}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-5">
          <div className="flex justify-between">
            <span className="rounded-full bg-black/40 px-3 py-1 text-xs text-cream/85">{story.heat}</span>
            <span aria-hidden className="text-lg leading-none text-champagne">✦</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[.24em] text-champagne/85">{story.genre}</p>
            <h3 className="mt-2 font-display text-3xl leading-tight text-cream sm:text-4xl">{story.title}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${height} relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${story.cover || "from-burgundy via-plum to-black"} p-5 shadow-velvet`}
    >
      <div className="absolute inset-4 rounded-[1rem] border border-champagne/24" />
      <div className="absolute -right-10 -top-10 size-44 rounded-full bg-moon/18 blur-2xl" />
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-black/58 to-transparent" />
      <div className="relative flex h-full min-h-[inherit] flex-col justify-between">
        <div className="flex justify-between">
          <span className="rounded-full bg-black/24 px-3 py-1 text-xs text-cream/70">{story.heat}</span>
          <span aria-hidden className="text-lg leading-none text-champagne">✦</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[.24em] text-champagne/76">{story.genre}</p>
          <h3 className="mt-2 font-display text-3xl leading-tight text-cream sm:text-4xl">{story.title}</h3>
        </div>
      </div>
    </div>
  );
}

function releaseLabel(story: Story): string {
  const val = story.next_release?.trim();
  if (val && val.toLowerCase() !== "unscheduled") return val;
  if (story.status === "archived") return "Completed";
  return "Ongoing";
}

export function StoryCard({ story }: { story: Story }) {
  return (
    <article className="glass overflow-hidden rounded-[1.75rem] p-4">
      <BookCover story={story} />
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[.2em] text-champagne/70 truncate">{story.universe}</p>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl text-cream">{story.title}</h2>
        </div>
        <span className="shrink-0 rounded-full bg-cream/8 px-3 py-1 text-xs text-cream/70">{story.status}</span>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-cream/62">{story.synopsis}</p>
      <div className="mt-4 flex items-center justify-between text-sm text-cream/58">
        <span>
          {story.chapter_count} chapter{story.chapter_count === 1 ? "" : "s"}
        </span>
        <span>{releaseLabel(story)}</span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Link href={`/stories/${story.slug}`} className="rounded-full bg-champagne px-4 py-2 text-center text-sm font-semibold text-velvet">
          Story
        </Link>
        <Link href={`/stories/${story.slug}/chapters/1`} className="rounded-full border border-cream/12 px-4 py-2 text-center text-sm text-cream/75">
          Read
        </Link>
      </div>
    </article>
  );
}
