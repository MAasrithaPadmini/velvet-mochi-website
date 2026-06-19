"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Eye, FileText, Save, Trash2, Upload } from "lucide-react";
import type { Chapter, Story } from "@/lib/types";

// =======================================================================
// STORY MANAGER
// =======================================================================

type StoryForm = {
  title: string;
  slug: string;
  synopsis: string;
  status: "draft" | "published" | "archived";
  universe: string;
  genre: string;
  heat: string;
  cover_url: string | null;
  cover: string;
  trigger_warnings: string;
  characters: string;
  mature: boolean;
};

const emptyStory: StoryForm = {
  title: "",
  slug: "",
  synopsis: "",
  status: "draft",
  universe: "Velvet Archive",
  genre: "Dark romance",
  heat: "Slow burn",
  cover_url: null,
  cover: "from-burgundy via-plum to-black",
  trigger_warnings: "",
  characters: "",
  mature: true,
};

function storyToForm(story: Story): StoryForm {
  return {
    title: story.title,
    slug: story.slug,
    synopsis: story.synopsis,
    status: story.status,
    universe: story.universe,
    genre: story.genre,
    heat: story.heat,
    cover_url: story.cover_url,
    cover: story.cover,
    trigger_warnings: story.trigger_warnings.join(", "),
    characters: story.characters.join(", "),
    mature: story.mature,
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function StoryManager({ initialStories }: { initialStories: Story[] }) {
  const router = useRouter();
  const [stories, setStories] = useState(initialStories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StoryForm>(emptyStory);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const slugDirty = useRef(false);
  const isEditing = Boolean(editingId);

  function update<K extends keyof StoryForm>(key: K, value: StoryForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "slug") slugDirty.current = true;
    if (key === "title" && !slugDirty.current && !isEditing) {
      setForm((current) => ({ ...current, slug: slugify(value as string) }));
    }
  }

  function selectStory(story: Story) {
    setEditingId(story.id);
    setForm(storyToForm(story));
    setCoverFile(null);
    setMessage({ text: `Editing "${story.title}"`, ok: true });
    slugDirty.current = true;
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setForm(emptyStory);
    setCoverFile(null);
    setMessage(null);
    slugDirty.current = false;
  }

  async function uploadCover(storyId: string): Promise<string | null> {
    if (!coverFile) return form.cover_url;
    if (coverFile.size > 5 * 1024 * 1024) {
      throw new Error("Cover must be under 5 MB.");
    }
    const extension = (coverFile.name.split(".").pop() || "jpg").toLowerCase();
    if (!["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) {
      throw new Error("Cover must be jpg, png, webp, or gif.");
    }
    const storagePath = `${storyId}/cover-${Date.now()}.${extension}`;
    const upload = new FormData();
    upload.append("bucket", "story-covers");
    upload.append("path", storagePath);
    upload.append("file", coverFile);
    const response = await fetch("/api/admin/storage", { method: "POST", body: upload });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error ?? "Cover upload failed");
    return (json.publicUrl ?? json.url) as string;
  }

  async function saveStory() {
    if (!form.title.trim() || !form.synopsis.trim()) {
      setMessage({ text: "Title and synopsis are required.", ok: false });
      return;
    }
    setBusy(true);
    setMessage({ text: "Saving story...", ok: true });

    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      trigger_warnings: form.trigger_warnings.split(",").map((s) => s.trim()).filter(Boolean),
      characters: form.characters.split(",").map((s) => s.trim()).filter(Boolean),
    };

    const method = isEditing ? "PATCH" : "POST";
    const url = isEditing ? `/api/admin/stories/${editingId}` : "/api/admin/stories";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok || !json.story) throw new Error(json.error ?? "Story save failed");

      let story = json.story as Story;
      if (coverFile) {
        const publicUrl = await uploadCover(story.id);
        if (publicUrl && publicUrl !== story.cover_url) {
          const coverResponse = await fetch(`/api/admin/stories/${story.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cover_url: publicUrl }),
          });
          const coverJson = await coverResponse.json();
          if (!coverResponse.ok) throw new Error(coverJson.error ?? "Cover URL save failed");
          story = coverJson.story as Story;
        }
      }

      setStories((current) => (isEditing ? current.map((s) => (s.id === story.id ? story : s)) : [story, ...current]));
      setEditingId(story.id);
      setForm(storyToForm(story));
      setCoverFile(null);
      setMessage({ text: isEditing ? "Story updated." : "Story created.", ok: true });
      router.refresh();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Save failed.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  async function deleteStory(id: string, title: string) {
    if (!window.confirm(`Permanently delete "${title}" and all of its chapters? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/stories/${id}`, { method: "DELETE" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Delete failed");
      setStories((current) => current.filter((s) => s.id !== id));
      if (editingId === id) reset();
      setMessage({ text: "Story deleted.", ok: true });
      router.refresh();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Delete failed.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
      <div className="glass rounded-[1.75rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-3xl text-cream">{isEditing ? "Edit story" : "Create story"}</h2>
          {isEditing && (
            <button onClick={reset} className="rounded-full border border-cream/12 px-3 py-1 text-sm text-cream/70">
              + New
            </button>
          )}
        </div>

        <Field label="Title">
          <input value={form.title} onChange={(e) => update("title", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Slug (URL)">
          <input value={form.slug} onChange={(e) => update("slug", slugify(e.target.value))} className={inputCls} />
        </Field>
        <Field label="Synopsis">
          <textarea value={form.synopsis} onChange={(e) => update("synopsis", e.target.value)} rows={4} className={inputCls} />
        </Field>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Status">
            <select value={form.status} onChange={(e) => update("status", e.target.value as StoryForm["status"])} className={selectCls}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <Field label="Genre">
            <input value={form.genre} onChange={(e) => update("genre", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Universe">
            <input value={form.universe} onChange={(e) => update("universe", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Heat">
            <input value={form.heat} onChange={(e) => update("heat", e.target.value)} className={inputCls} />
          </Field>
        </div>

        <Field label="Trigger warnings (comma separated)">
          <input
            value={form.trigger_warnings}
            onChange={(e) => update("trigger_warnings", e.target.value)}
            placeholder="Possessive romance, Power imbalance, Violence"
            className={inputCls}
          />
        </Field>
        <Field label="Characters (comma separated)">
          <input
            value={form.characters}
            onChange={(e) => update("characters", e.target.value)}
            placeholder="Seren Vale, Dorian Ash"
            className={inputCls}
          />
        </Field>

        <Field label="Cover image (max 5 MB)">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream file:mr-3 file:rounded-full file:border-0 file:bg-champagne file:px-3 file:py-2 file:text-velvet"
          />
        </Field>
        {form.cover_url && (
          <a href={form.cover_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-champagne">
            View current cover
          </a>
        )}

        <button
          onClick={saveStory}
          disabled={busy}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-champagne px-5 py-3 font-semibold text-velvet disabled:opacity-60"
        >
          <Save size={16} />
          {isEditing ? "Update story" : "Create story"}
        </button>
        {message && (
          <p className={`mt-3 rounded-2xl border p-3 text-sm ${message.ok ? "border-champagne/30 bg-champagne/10 text-champagne" : "border-rose/30 bg-rose/10 text-rose"}`}>
            {message.text}
          </p>
        )}
      </div>

      <div className="glass rounded-[1.75rem] p-5">
        <h2 className="font-display text-3xl text-cream">All stories ({stories.length})</h2>
        <div className="mt-4 space-y-3">
          {stories.length === 0 && (
            <p className="rounded-2xl border border-cream/10 bg-cream/5 p-4 text-sm text-cream/60">
              No stories yet. Create your first one on the left.
            </p>
          )}
          {stories.map((story) => (
            <div key={story.id} className="rounded-2xl border border-cream/10 bg-cream/6 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-cream">{story.title}</div>
                  <div className="text-sm text-cream/52">
                    <span className={story.status === "published" ? "text-champagne" : "text-rose"}>{story.status}</span>
                    {" · "}{story.genre}{" · "}{story.chapter_count} chapters
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => selectStory(story)} className="rounded-full border border-cream/12 px-3 py-1 text-sm text-cream/75">
                    Edit
                  </button>
                  <button onClick={() => deleteStory(story.id, story.title)} className="inline-flex items-center gap-1 rounded-full border border-rose/30 px-3 py-1 text-sm text-rose">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =======================================================================
// CHAPTER MANAGER (daily publishing workhorse)
// =======================================================================

type ChapterForm = {
  story_id: string;
  title: string;
  body: string;
  status: "draft" | "scheduled" | "published";
  reading_minutes: number;
  scheduled_for: string;
};

const emptyChapter = (storyId: string): ChapterForm => ({
  story_id: storyId,
  title: "",
  body: "",
  status: "draft",
  reading_minutes: 10,
  scheduled_for: "",
});

export function ChapterManager({ stories, initialChapters }: { stories: Story[]; initialChapters: Chapter[] }) {
  const router = useRouter();
  const [chapters, setChapters] = useState(initialChapters);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ChapterForm>(emptyChapter(stories[0]?.id ?? ""));
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [filterStoryId, setFilterStoryId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const dirty = useRef(false);
  const isEditing = Boolean(editingId);

  const selectedStory = useMemo(() => stories.find((s) => s.id === form.story_id), [form.story_id, stories]);
  const filteredChapters = useMemo(
    () => (filterStoryId ? chapters.filter((c) => c.story_id === filterStoryId) : chapters),
    [chapters, filterStoryId]
  );

  function update<K extends keyof ChapterForm>(key: K, value: ChapterForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    dirty.current = true;
  }

  function selectChapter(chapter: Chapter) {
    setEditingId(chapter.id);
    setForm({
      story_id: chapter.story_id,
      title: chapter.title,
      body: chapter.body,
      status: chapter.status,
      reading_minutes: chapter.reading_minutes,
      scheduled_for: chapter.scheduled_for ? new Date(chapter.scheduled_for).toISOString().slice(0, 16) : "",
    });
    setMessage({ text: `Editing "${chapter.title}"`, ok: true });
    dirty.current = false;
    setAutoSaveStatus("idle");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setForm(emptyChapter(stories[0]?.id ?? ""));
    setMessage(null);
    dirty.current = false;
    setAutoSaveStatus("idle");
  }

  const performSave = useCallback(
    async (statusOverride?: ChapterForm["status"]): Promise<Chapter | null> => {
      if (!form.story_id) {
        setMessage({ text: "Pick a story first.", ok: false });
        return null;
      }
      if (!form.title.trim() || !form.body.trim()) {
        setMessage({ text: "Title and body are required.", ok: false });
        return null;
      }

      const status = statusOverride ?? form.status;
      const payload = {
        story_id: form.story_id,
        title: form.title,
        body: form.body,
        status,
        reading_minutes: form.reading_minutes,
        scheduled_for: status === "scheduled" && form.scheduled_for ? new Date(form.scheduled_for).toISOString() : null,
      };

      const url = isEditing ? `/api/admin/chapters/${editingId}` : "/api/admin/chapters";
      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok || !json.chapter) throw new Error(json.error ?? "Chapter save failed");
      const chapter = json.chapter as Chapter;

      setChapters((current) =>
        isEditing ? current.map((c) => (c.id === chapter.id ? chapter : c)) : [chapter, ...current]
      );
      setEditingId(chapter.id);
      setForm((current) => ({ ...current, status: chapter.status }));
      dirty.current = false;
      return chapter;
    },
    [editingId, form, isEditing]
  );

  async function saveChapter(statusOverride?: ChapterForm["status"]) {
    setBusy(true);
    setMessage({ text: "Saving...", ok: true });
    try {
      const chapter = await performSave(statusOverride);
      if (chapter) {
        const label =
          statusOverride === "published"
            ? "Chapter published — readers can see it now."
            : statusOverride === "scheduled"
            ? "Chapter scheduled. It will auto-publish at the chosen time."
            : statusOverride === "draft"
            ? "Saved as draft."
            : isEditing
            ? "Chapter updated."
            : "Chapter created.";
        setMessage({ text: label, ok: true });
        router.refresh();
      }
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Save failed.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  async function deleteChapter(id: string, title: string) {
    if (!window.confirm(`Permanently delete "${title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/chapters/${id}`, { method: "DELETE" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Delete failed");
      setChapters((current) => current.filter((c) => c.id !== id));
      if (editingId === id) reset();
      setMessage({ text: "Chapter deleted.", ok: true });
      router.refresh();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Delete failed.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  // Auto-save drafts every 4s when dirty
  useEffect(() => {
    if (!isEditing) return;
    const timer = setInterval(async () => {
      if (!dirty.current) return;
      try {
        setAutoSaveStatus("saving");
        await performSave();
        setAutoSaveStatus("saved");
      } catch {
        setAutoSaveStatus("error");
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [isEditing, performSave]);

  return (
    <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
      <div className="glass rounded-[1.75rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-3xl text-cream">{isEditing ? "Edit chapter" : "New chapter"}</h2>
          <div className="flex items-center gap-2">
            {isEditing && (
              <span className="text-xs text-cream/55">
                {autoSaveStatus === "saving" && "Saving…"}
                {autoSaveStatus === "saved" && "✓ Saved"}
                {autoSaveStatus === "error" && "Save error"}
              </span>
            )}
            {isEditing && (
              <button onClick={reset} className="rounded-full border border-cream/12 px-3 py-1 text-sm text-cream/70">
                + New
              </button>
            )}
          </div>
        </div>

        <Field label="Story">
          <select value={form.story_id} onChange={(e) => update("story_id", e.target.value)} className={selectCls}>
            {stories.length === 0 && <option value="">No stories yet — create one first</option>}
            {stories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Chapter title">
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Chapter 1: The Window Kept Breathing"
            className={inputCls}
          />
        </Field>
        <Field label="Body (supports **bold**, *italic*, blank lines for paragraphs)">
          <textarea
            value={form.body}
            onChange={(e) => update("body", e.target.value)}
            rows={16}
            placeholder="Rain tapped the library windows..."
            className={`${inputCls} font-serif text-base leading-7`}
          />
          <p className="mt-1 text-xs text-cream/45">
            {form.body.trim().split(/\s+/).filter(Boolean).length} words ·{" "}
            {Math.max(1, Math.round(form.body.trim().split(/\s+/).filter(Boolean).length / 230))} min read
          </p>
        </Field>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Reading minutes">
            <input
              type="number"
              min={1}
              value={form.reading_minutes}
              onChange={(e) => update("reading_minutes", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Schedule for (optional)">
            <input
              type="datetime-local"
              value={form.scheduled_for}
              onChange={(e) => update("scheduled_for", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => saveChapter("draft")}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/8 px-4 py-2 text-sm text-cream/90"
          >
            <FileText size={14} /> Save draft
          </button>
          <button
            onClick={() => saveChapter("scheduled")}
            disabled={busy || !form.scheduled_for}
            className="inline-flex items-center gap-2 rounded-full border border-moon/20 bg-moon/10 px-4 py-2 text-sm text-moon disabled:opacity-50"
          >
            <CalendarClock size={14} /> Schedule
          </button>
          <button
            onClick={() => saveChapter("published")}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-champagne px-4 py-2 text-sm font-semibold text-velvet disabled:opacity-60"
          >
            <Upload size={14} /> Publish now
          </button>
        </div>
        {selectedStory && (
          <p className="mt-3 text-xs text-cream/45">
            Story: <span className="text-cream/70">{selectedStory.title}</span>
          </p>
        )}
        {message && (
          <p className={`mt-3 rounded-2xl border p-3 text-sm ${message.ok ? "border-champagne/30 bg-champagne/10 text-champagne" : "border-rose/30 bg-rose/10 text-rose"}`}>
            {message.text}
          </p>
        )}
      </div>

      <div className="glass rounded-[1.75rem] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl text-cream">Chapters ({filteredChapters.length})</h2>
          <select
            value={filterStoryId}
            onChange={(e) => setFilterStoryId(e.target.value)}
            className="rounded-full border border-cream/10 bg-plum px-3 py-1 text-sm text-cream"
          >
            <option value="">All stories</option>
            {stories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 space-y-3">
          {filteredChapters.length === 0 && (
            <p className="rounded-2xl border border-cream/10 bg-cream/5 p-4 text-sm text-cream/60">
              No chapters yet for this filter.
            </p>
          )}
          {filteredChapters.map((chapter) => (
            <div key={chapter.id} className="rounded-2xl border border-cream/10 bg-cream/6 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-cream">
                    #{chapter.number} · {chapter.title}
                  </div>
                  <div className="text-sm text-cream/52">
                    <span className={chapter.status === "published" ? "text-champagne" : chapter.status === "scheduled" ? "text-moon" : "text-rose"}>
                      {chapter.status}
                    </span>
                    {chapter.scheduled_for && chapter.status === "scheduled" && (
                      <> · scheduled {new Date(chapter.scheduled_for).toLocaleString()}</>
                    )}
                    {chapter.story_title && <> · {chapter.story_title}</>}
                    <span className="ml-1 inline-flex items-center gap-1">
                      · <Eye size={12} /> {chapter.views}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => selectChapter(chapter)} className="rounded-full border border-cream/12 px-3 py-1 text-sm text-cream/75">
                    Edit
                  </button>
                  {chapter.status !== "published" && (
                    <button
                      onClick={async () => {
                        const r = await fetch(`/api/admin/chapters/${chapter.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "published" }),
                        });
                        const j = await r.json();
                        if (r.ok && j.chapter) {
                          setChapters((current) => current.map((c) => (c.id === chapter.id ? j.chapter : c)));
                          setMessage({ text: "Published.", ok: true });
                          router.refresh();
                        }
                      }}
                      className="rounded-full bg-champagne/90 px-3 py-1 text-sm font-medium text-velvet"
                    >
                      Publish
                    </button>
                  )}
                  <button onClick={() => deleteChapter(chapter.id, chapter.title)} className="rounded-full border border-rose/30 px-3 py-1 text-sm text-rose">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =======================================================================
// Field helpers
// =======================================================================

const inputCls =
  "mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream outline-none focus:border-champagne/40";
const selectCls =
  "mt-2 w-full rounded-2xl border border-cream/10 bg-plum px-4 py-3 text-cream outline-none focus:border-champagne/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-3 block text-sm text-cream/60">
      {label}
      {children}
    </label>
  );
}
