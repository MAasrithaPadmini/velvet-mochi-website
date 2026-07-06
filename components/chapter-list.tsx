"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, ChevronDown } from "lucide-react";
import type { Chapter } from "@/lib/types";

const GROUP_SIZE = 20;

function statusColor(status: Chapter["status"]) {
  if (status === "published") return "text-champagne";
  if (status === "scheduled") return "text-moon";
  return "text-rose";
}

function ChapterRow({ storySlug, chapter }: { storySlug: string; chapter: Chapter }) {
  return (
    <Link
      href={`/stories/${storySlug}/chapters/${chapter.number}`}
      className="block rounded-2xl border border-cream/10 bg-cream/6 p-4 hover:bg-cream/10"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-cream">
            <span className="text-champagne/80">#{chapter.number}</span> {chapter.title}
          </div>
          <div className="mt-1 text-sm text-cream/55">
            {chapter.reading_minutes} min ·{" "}
            <span className={statusColor(chapter.status)}>{chapter.status}</span>
            {chapter.status === "scheduled" && chapter.scheduled_for && (
              <> · drops {new Date(chapter.scheduled_for).toLocaleString()}</>
            )}
          </div>
        </div>
        {chapter.views > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-cream/45">
            <Eye size={12} /> {chapter.views}
          </span>
        )}
      </div>
    </Link>
  );
}

export function ChapterList({ storySlug, chapters }: { storySlug: string; chapters: Chapter[] }) {
  // Chapters arrive sorted ascending by number; show newest first by default.
  const descending = [...chapters].sort((a, b) => b.number - a.number);

  const groups: Chapter[][] = [];
  for (let i = 0; i < descending.length; i += GROUP_SIZE) {
    groups.push(descending.slice(i, i + GROUP_SIZE));
  }

  const [openGroups, setOpenGroups] = useState<Set<number>>(new Set([0]));

  function toggleGroup(index: number) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  if (groups.length <= 1) {
    return (
      <div className="mt-5 space-y-3">
        {descending.map((chapter) => (
          <ChapterRow key={chapter.id} storySlug={storySlug} chapter={chapter} />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-4">
      {groups.map((group, i) => {
        const first = group[0];
        const last = group[group.length - 1];
        const isOpen = openGroups.has(i);
        return (
          <div key={i} className="rounded-2xl border border-cream/10 overflow-hidden">
            <button
              onClick={() => toggleGroup(i)}
              className="flex w-full items-center justify-between bg-cream/8 px-4 py-3 text-left"
            >
              <span className="font-semibold text-cream">
                Chapters {last.number}–{first.number}
              </span>
              <ChevronDown
                size={18}
                className={`text-cream/60 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="space-y-3 p-4">
                {group.map((chapter) => (
                  <ChapterRow key={chapter.id} storySlug={storySlug} chapter={chapter} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
