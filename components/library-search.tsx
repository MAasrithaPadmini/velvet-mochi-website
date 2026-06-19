"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { StoryCard } from "@/components/story-card";
import type { Story } from "@/lib/types";

const filters = ["All", "Genre", "Universe", "Warnings", "Published", "Draft"];

export function LibrarySearch({ stories }: { stories: Story[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return stories.filter((story) => {
      const haystack = [story.title, story.synopsis, story.genre, story.universe, story.status, story.heat, ...story.trigger_warnings].join(" ").toLowerCase();
      const matchesQuery = !normalized || haystack.includes(normalized);
      const matchesFilter =
        filter === "All" ||
        (filter === "Published" && story.status === "published") ||
        (filter === "Draft" && story.status === "draft") ||
        (filter === "Warnings" && story.trigger_warnings.length > 0) ||
        (filter === "Genre" && Boolean(story.genre)) ||
        (filter === "Universe" && Boolean(story.universe));
      return matchesQuery && matchesFilter;
    });
  }, [filter, query, stories]);

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3">
        <label className="flex min-w-[260px] flex-1 items-center gap-3 rounded-full border border-cream/10 bg-cream/7 px-4 py-3">
          <Search size={18} className="text-champagne" />
          <span className="sr-only">Search library</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stories, characters, universes..." className="w-full bg-transparent text-sm text-cream outline-none placeholder:text-cream/45" />
        </label>
        {filters.map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`rounded-full border px-4 py-3 text-sm ${filter === item ? "border-champagne/30 bg-champagne/16 text-champagne" : "border-cream/10 bg-cream/6 text-cream/72"}`}>
            {item}
          </button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {filtered.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </>
  );
}
