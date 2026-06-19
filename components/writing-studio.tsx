"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarClock,
  Eye,
  EyeOff,
  FileText,
  Flame,
  Maximize2,
  Minimize2,
  Moon,
  Save,
  Upload,
  Zap,
} from "lucide-react";
import type { Story } from "@/lib/types";
import { renderChapterBody, estimateReadingMinutes } from "@/lib/markdown";

type Mode = "write" | "preview";

export function WritingStudio({
  stories,
  todayWords,
  streak,
  displayName,
}: {
  stories: Story[];
  todayWords: number;
  streak: number;
  displayName: string;
}) {
  const router = useRouter();
  const [storyId, setStoryId] = useState(stories[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [authorNote, setAuthorNote] = useState("");
  const [mode, setMode] = useState<Mode>("write");
  const [fullscreen, setFullscreen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dailyGoal] = useState(1000);
  const dirty = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const readingMins = estimateReadingMinutes(body);
  const goalProgress = Math.min(100, Math.round((wordCount / dailyGoal) * 100));
  const selectedStory = stories.find((s) => s.id === storyId);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [body]);

  const saveChapter = useCallback(
    async (statusOverride?: "draft" | "scheduled" | "published") => {
      if (!storyId || !title.trim() || !body.trim()) return null;
      const status = statusOverride ?? "draft";
      const fullBody = authorNote.trim()
        ? `${body}\n\n---\n\n*Author's note: ${authorNote.trim()}*`
        : body;

      const payload = {
        story_id: storyId,
        title,
        body: fullBody,
        status,
        reading_minutes: readingMins,
        scheduled_for:
          status === "scheduled" && scheduledFor
            ? new Date(scheduledFor).toISOString()
            : null,
      };

      const url = editingId
        ? `/api/admin/chapters/${editingId}`
        : "/api/admin/chapters";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Save failed");
      if (!editingId) setEditingId(json.chapter.id);
      dirty.current = false;
      return json.chapter;
    },
    [storyId, title, body, authorNote, readingMins, scheduledFor, editingId]
  );

  // Auto-save every 4s when dirty and editing
  useEffect(() => {
    if (!editingId && !title.trim()) return;
    const timer = setInterval(async () => {
      if (!dirty.current) return;
      try {
        setAutoSaveStatus("saving");
        await saveChapter("draft");
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      } catch {
        setAutoSaveStatus("error");
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [editingId, title, saveChapter]);

  async function publish(status: "draft" | "scheduled" | "published") {
    if (!title.trim()) {
      setMessage({ text: "Give your chapter a title first.", ok: false });
      return;
    }
    if (!body.trim()) {
      setMessage({ text: "Your chapter is empty! Write something beautiful first.", ok: false });
      return;
    }
    if (status === "scheduled" && !scheduledFor) {
      setMessage({ text: "Pick a date and time to schedule.", ok: false });
      return;
    }
    setBusy(true);
    try {
      await saveChapter(status);
      const labels = {
        draft: "Saved as draft. Keep writing! 🌙",
        scheduled: "Chapter scheduled. It will go live automatically. ✨",
        published: "Chapter published! Your readers can see it now. 🎉",
      };
      setMessage({ text: labels[status], ok: true });
      router.refresh();
      if (status === "published") {
        // Reset for next chapter
        setTimeout(() => {
          setTitle("");
          setBody("");
          setAuthorNote("");
          setScheduledFor("");
          setEditingId(null);
          setMessage(null);
          dirty.current = false;
        }, 3000);
      }
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Something went wrong.",
        ok: false,
      });
    } finally {
      setBusy(false);
    }
  }

  const wrapperCls = fullscreen
    ? "fixed inset-0 z-[300] bg-velvet overflow-auto p-4 sm:p-8"
    : "";

  return (
    <div className={wrapperCls}>
      {/* Stats bar */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<Flame size={16} />} label="Writing streak" value={`${streak} day${streak === 1 ? "" : "s"}`} color="text-rose" />
        <StatCard icon={<Zap size={16} />} label="Words today" value={todayWords.toLocaleString()} color="text-champagne" />
        <StatCard icon={<Moon size={16} />} label="This chapter" value={`${wordCount.toLocaleString()} words`} color="text-moon" />
        <StatCard icon={<BookOpen size={16} />} label="Reading time" value={`${readingMins} min`} color="text-cream/70" />
      </div>

      {/* Daily goal bar */}
      <div className="glass mb-5 rounded-2xl p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-cream/60">Daily goal: {dailyGoal} words</span>
          <span className={goalProgress >= 100 ? "text-champagne font-semibold" : "text-cream/60"}>
            {goalProgress >= 100 ? "🎉 Goal reached!" : `${goalProgress}% complete`}
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-cream/8 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              goalProgress >= 100
                ? "bg-gradient-to-r from-champagne to-rose"
                : "bg-gradient-to-r from-rose to-champagne"
            }`}
            style={{ width: `${goalProgress}%` }}
          />
        </div>
      </div>

      {/* Main writing area */}
      <div className="glass rounded-[1.75rem] p-5 sm:p-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode(mode === "write" ? "preview" : "write")}
              className="inline-flex items-center gap-2 rounded-full border border-cream/12 bg-cream/6 px-3 py-1.5 text-sm text-cream/80"
            >
              {mode === "write" ? <><Eye size={14} /> Preview</> : <><EyeOff size={14} /> Write</>}
            </button>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="inline-flex items-center gap-2 rounded-full border border-cream/12 bg-cream/6 px-3 py-1.5 text-sm text-cream/80"
            >
              {fullscreen ? <><Minimize2 size={14} /> Exit fullscreen</> : <><Maximize2 size={14} /> Fullscreen</>}
            </button>
          </div>
          <span className="text-xs text-cream/45">
            {autoSaveStatus === "saving" && "Auto-saving..."}
            {autoSaveStatus === "saved" && "✓ Auto-saved"}
            {autoSaveStatus === "error" && "⚠ Auto-save failed"}
          </span>
        </div>

        {/* Story picker */}
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-cream/60">
            Story
            <select
              value={storyId}
              onChange={(e) => setStoryId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-cream/10 bg-plum px-4 py-3 text-cream"
            >
              {stories.length === 0 && <option value="">No stories yet — create one first</option>}
              {stories.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-cream/60">
            Schedule for (optional)
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream"
            />
          </label>
        </div>

        {/* Chapter title */}
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); dirty.current = true; }}
          placeholder="Chapter title..."
          className="mb-6 w-full border-0 border-b border-cream/15 bg-transparent pb-4 font-display text-3xl text-cream placeholder:text-cream/25 outline-none focus:border-champagne/40 sm:text-4xl"
        />

        {mode === "write" ? (
          <>
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => { setBody(e.target.value); dirty.current = true; }}
              placeholder={`Start writing your chapter, ${displayName.split(" ")[0]}...

Use **bold** for emphasis, *italic* for thoughts.
Blank line between paragraphs.

The moonlight was the first thing she noticed...`}
              className="min-h-[400px] w-full resize-none border-0 bg-transparent font-serif text-lg leading-8 text-cream/90 placeholder:text-cream/20 outline-none"
              style={{ height: "auto" }}
            />

            {/* Author's note */}
            <div className="mt-8 border-t border-cream/8 pt-6">
              <label className="block text-sm text-cream/55">
                Author&apos;s note (optional — shown at end of chapter to readers)
                <textarea
                  value={authorNote}
                  onChange={(e) => { setAuthorNote(e.target.value); dirty.current = true; }}
                  placeholder="A little note to your readers... 🌙"
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/5 px-4 py-3 text-sm text-cream/80 outline-none"
                />
              </label>
            </div>
          </>
        ) : (
          // Preview mode
          <div className="min-h-[400px]">
            {body ? (
              <>
                <h2 className="mb-6 font-display text-3xl text-cream">{title || "Untitled"}</h2>
                <div
                  className="reader-prose font-display text-xl leading-[1.85] text-cream/90"
                  dangerouslySetInnerHTML={{
                    __html: renderChapterBody(
                      authorNote.trim()
                        ? `${body}\n\n---\n\n*Author's note: ${authorNote.trim()}*`
                        : body
                    ),
                  }}
                />
              </>
            ) : (
              <p className="text-cream/35 font-serif text-lg italic">Nothing to preview yet. Switch to write mode and start your chapter.</p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap gap-3 border-t border-cream/8 pt-6">
          <button
            onClick={() => publish("draft")}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/8 px-4 py-2.5 text-sm text-cream/90 disabled:opacity-50"
          >
            <FileText size={15} /> Save draft
          </button>
          <button
            onClick={() => publish("scheduled")}
            disabled={busy || !scheduledFor}
            className="inline-flex items-center gap-2 rounded-full border border-moon/20 bg-moon/10 px-4 py-2.5 text-sm text-moon disabled:opacity-40"
          >
            <CalendarClock size={15} /> Schedule
          </button>
          <button
            onClick={() => publish("published")}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-champagne px-5 py-2.5 text-sm font-semibold text-velvet disabled:opacity-60 shadow-glow"
          >
            <Upload size={15} /> Publish now ✨
          </button>
        </div>

        {message && (
          <p className={`mt-4 rounded-2xl border p-3 text-sm ${
            message.ok
              ? "border-champagne/30 bg-champagne/10 text-champagne"
              : "border-rose/30 bg-rose/10 text-rose"
          }`}>
            {message.text}
          </p>
        )}
      </div>

      {/* Tips */}
      <div className="mt-5 glass rounded-2xl p-4">
        <p className="text-xs text-cream/45 leading-5">
          💡 <strong className="text-cream/60">Writing tips:</strong>{" "}
          Use <code className="text-champagne">**bold**</code> for emphasis,{" "}
          <code className="text-champagne">*italic*</code> for inner thoughts,
          blank line between paragraphs. Preview mode shows exactly how readers will see it.
          Auto-save protects every keystroke. 🌙
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className={`inline-flex items-center gap-1.5 text-xs ${color}`}>
        {icon} {label}
      </div>
      <div className="mt-2 font-display text-2xl text-cream">{value}</div>
    </div>
  );
}
