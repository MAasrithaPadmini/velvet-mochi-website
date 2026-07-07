"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { StoryCard } from "@/components/story-card";
import type { Story } from "@/lib/types";

export function LibrarySearch({ stories, isAdmin = false }: { stories: Story[]; isAdmin?: boolean }) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [universe, setUniverse] = useState("All");
  const [status, setStatus] = useState("All");
  const [warningsOnly, setWarningsOnly] = useState(false);

  const genres = useMemo(
    () => Array.from(new Set(stories.map((s) => s.genre).filter(Boolean))).sort(),
    [stories]
  );
  const universes = useMemo(
    () => Array.from(new Set(stories.map((s) => s.universe).filter(Boolean))).sort(),
    [stories]
  );

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return stories.filter((story) => {
      const haystack = [story.title, story.synopsis, story.genre, story.universe, story.status, story.heat, ...story.trigger_warnings]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !normalized || haystack.includes(normalized);
      const matchesGenre = genre === "All" || story.genre === genre;
      const matchesUniverse = universe === "All" || story.universe === universe;
      const matchesStatus =
        status === "All" ||
        (status === "Ongoing" && story.status === "published") ||
        (status === "Completed" && story.status === "archived") ||
        (status === "Draft" && story.status === "draft");
      const matchesWarnings = !warningsOnly || story.trigger_warnings.length > 0;
      return matchesQuery && matchesGenre && matchesUniverse && matchesStatus && matchesWarnings;
    });
  }, [query, genre, universe, status, warningsOnly, stories]);

  const selectClass =
    "rounded-full border border-cream/10 bg-cream/6 px-4 py-3 text-sm text-cream/85 outline-none focus:border-champagne/40";

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3">
        <label className="flex min-w-[260px] flex-1 items-center gap-3 rounded-full border border-cream/10 bg-cream/7 px-4 py-3">
          <Search size={18} className="text-champagne" />
          <span className="sr-only">Search library</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search stories, characters, universes..."
            className="w-full bg-transparent text-sm text-cream outline-none placeholder:text-cream/45"
          />
        </label>

        <select value={genre} onChange={(e) => setGenre(e.target.value)} className={selectClass} aria-label="Filter by genre">
          <option value="All">All genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select value={universe} onChange={(e) => setUniverse(e.target.value)} className={selectClass} aria-label="Filter by universe">
          <option value="All">All universes</option>
          {universes.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass} aria-label="Filter by status">
          <option value="All">Any status</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          {isAdmin && <option value="Draft">Draft (admin only)</option>}
        </select>

        <button
          onClick={() => setWarningsOnly((v) => !v)}
          className={`rounded-full border px-4 py-3 text-sm transition ${
            warningsOnly ? "border-champagne/30 bg-champagne/16 text-champagne" : "border-cream/10 bg-cream/6 text-cream/72"
          }`}
        >
          Has content warnings
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-cream/10 bg-cream/5 p-6 text-center text-sm text-cream/55">
          No stories match those filters. Try clearing one and searching again.
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {filtered.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </>
  );
}
