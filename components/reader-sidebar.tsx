"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bookmark, MessageSquare, Save } from "lucide-react";
import type { Chapter, Story } from "@/lib/types";

export function ReaderSidebar({
  story,
  chapter,
  initialProgress,
  isBookmarked,
  loggedIn,
  prevNumber,
  nextNumber,
}: {
  story: Story;
  chapter: Chapter;
  initialProgress: number;
  isBookmarked: boolean;
  loggedIn: boolean;
  prevNumber: number | null;
  nextNumber: number | null;
}) {
  const [progress, setProgress] = useState(initialProgress);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [posting, setPosting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef(initialProgress);

  // Track scroll position → progress (debounced save)
  useEffect(() => {
    if (!loggedIn) return;
    function onScroll() {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const pct = Math.min(100, Math.max(0, Math.round((window.scrollY / total) * 100)));
      setProgress(pct);

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        if (Math.abs(pct - lastSaved.current) < 2) return;
        lastSaved.current = pct;
        fetch("/api/reader/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ story_id: story.id, chapter_id: chapter.id, progress: pct }),
        }).catch(() => {});
      }, 1200);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [story.id, chapter.id, loggedIn]);

  async function toggleBookmark() {
    if (!loggedIn) {
      setMessage({ text: "Login to save bookmarks.", ok: false });
      return;
    }
    const response = await fetch("/api/reader/bookmarks", {
      method: bookmarked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story_id: story.id, chapter_id: chapter.id, label: chapter.title }),
    });
    const json = await response.json();
    if (response.ok) {
      setBookmarked(!bookmarked);
      setMessage({ text: bookmarked ? "Bookmark removed." : "Bookmarked.", ok: true });
    } else {
      setMessage({ text: json.error ?? "Failed.", ok: false });
    }
  }

  async function postComment() {
    if (!loggedIn) {
      setMessage({ text: "Login to leave a comment.", ok: false });
      return;
    }
    if (!comment.trim()) return;
    setPosting(true);
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story_id: story.id, chapter_id: chapter.id, body: comment.trim() }),
    });
    const json = await response.json();
    setPosting(false);
    if (response.ok) {
      setComment("");
      setMessage({ text: "Comment posted. Scroll down to see it.", ok: true });
      // Trigger a soft reload of the comments section
      window.dispatchEvent(new CustomEvent("velvet:comment-posted"));
    } else {
      setMessage({ text: json.error ?? "Failed to post.", ok: false });
    }
  }

  return (
    <aside className="glass h-fit rounded-[1.75rem] p-5 lg:sticky lg:top-28">
      <h2 className="font-display text-2xl text-cream">Reader memory</h2>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-cream/60">Progress</span>
          <span className="text-champagne">{progress}%</span>
        </div>
        <div className="mt-1 h-1.5 rounded-full bg-cream/8 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rose to-champagne transition-all" style={{ width: `${progress}%` }} />
        </div>
        {!loggedIn && (
          <p className="mt-2 text-xs text-cream/50">
            <Link href={`/login?next=/stories/${story.slug}/chapters/${chapter.number}`} className="text-champagne">
              Login
            </Link>{" "}
            to save your place.
          </p>
        )}
      </div>

      <button
        onClick={toggleBookmark}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm ${
          bookmarked
            ? "bg-champagne text-velvet font-semibold"
            : "border border-cream/12 bg-cream/6 text-cream/85"
        }`}
      >
        <Bookmark size={14} fill={bookmarked ? "currentColor" : "none"} />
        {bookmarked ? "Bookmarked" : "Bookmark this chapter"}
      </button>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {prevNumber !== null ? (
          <Link href={`/stories/${story.slug}/chapters/${prevNumber}`} className="rounded-full border border-cream/12 px-3 py-2 text-center text-sm text-cream/80">
            ← Prev
          </Link>
        ) : (
          <div className="rounded-full border border-cream/8 px-3 py-2 text-center text-sm text-cream/35">←</div>
        )}
        <Link href={`/stories/${story.slug}`} className="rounded-full border border-cream/12 bg-cream/4 px-3 py-2 text-center text-sm text-cream/80">
          Chapters
        </Link>
        {nextNumber !== null ? (
          <Link href={`/stories/${story.slug}/chapters/${nextNumber}`} className="rounded-full bg-cream/8 px-3 py-2 text-center text-sm text-cream/80">
            Next →
          </Link>
        ) : (
          <div className="rounded-full border border-cream/8 px-3 py-2 text-center text-sm text-cream/35">→</div>
        )}
      </div>

      <div className="mt-6 border-t border-cream/8 pt-5">
        <label className="block text-sm text-cream/60">
          <span className="inline-flex items-center gap-2">
            <MessageSquare size={13} /> Leave a comment
          </span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did this chapter make you feel?"
            rows={4}
            disabled={!loggedIn}
            className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-3 py-2 text-sm text-cream outline-none disabled:opacity-50"
          />
        </label>
        <button
          onClick={postComment}
          disabled={posting || !comment.trim()}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-champagne/90 px-3 py-2 text-sm font-semibold text-velvet disabled:opacity-50"
        >
          <Save size={13} /> Post comment
        </button>
      </div>

      {message && (
        <p className={`mt-4 rounded-xl border p-2 text-xs ${message.ok ? "border-champagne/30 bg-champagne/10 text-champagne" : "border-rose/30 bg-rose/10 text-rose"}`}>
          {message.text}
        </p>
      )}
    </aside>
  );
}
