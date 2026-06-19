"use client";

import { useState } from "react";
import { Save, Upload } from "lucide-react";

type AuthorProfile = {
  name: string;
  tagline: string;
  bio: string;
  avatar_url: string | null;
  cover_url: string | null;
  twitter: string | null;
  instagram: string | null;
  tiktok: string | null;
  goodreads: string | null;
  website: string | null;
  email: string | null;
  fun_facts: string[];
};

const empty: AuthorProfile = {
  name: "Velvet Mochi",
  tagline: "Author of moonlit dark romance",
  bio: "",
  avatar_url: null,
  cover_url: null,
  twitter: null,
  instagram: null,
  tiktok: null,
  goodreads: null,
  website: null,
  email: null,
  fun_facts: [],
};

export function AuthorProfileEditor({ initial }: { initial: AuthorProfile | null }) {
  const [form, setForm] = useState<AuthorProfile>(initial ?? empty);
  const [funFactsText, setFunFactsText] = useState((initial?.fun_facts ?? []).join("\n"));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  function update<K extends keyof AuthorProfile>(key: K, value: AuthorProfile[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadImage(file: File, bucket: string): Promise<string | null> {
    if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB.");
    const fd = new FormData();
    fd.append("bucket", bucket);
    fd.append("file", file);
    const response = await fetch("/api/admin/storage", { method: "POST", body: fd });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error ?? "Upload failed");
    return json.url as string;
  }

  async function save() {
    setBusy(true);
    setMessage({ text: "Saving...", ok: true });

    try {
      const updates: AuthorProfile = {
        ...form,
        fun_facts: funFactsText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      };

      if (avatarFile) {
        const url = await uploadImage(avatarFile, "author-assets");
        if (url) updates.avatar_url = url;
      }
      if (coverFile) {
        const url = await uploadImage(coverFile, "author-assets");
        if (url) updates.cover_url = url;
      }

      const response = await fetch("/api/admin/author-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Save failed");

      setForm(updates);
      setAvatarFile(null);
      setCoverFile(null);
      setMessage({ text: "Profile saved. Visit /about to see it live.", ok: true });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Save failed.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass rounded-[1.75rem] p-5 sm:p-7">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Display name">
          <input value={form.name} onChange={(e) => update("name", e.target.value)} className={input} />
        </Field>
        <Field label="Tagline (shown under your name)">
          <input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} className={input} />
        </Field>
      </div>

      <Field label="Bio (write a few paragraphs)">
        <textarea
          value={form.bio}
          onChange={(e) => update("bio", e.target.value)}
          rows={8}
          placeholder="Tell readers about yourself. What stories you write, what inspires you, where they can find you..."
          className={`${input} font-serif text-base leading-7`}
        />
      </Field>

      <Field label="Fun facts (one per line)">
        <textarea
          value={funFactsText}
          onChange={(e) => setFunFactsText(e.target.value)}
          rows={5}
          placeholder={"Coffee runs my veins\nI write best at 2am\nThree cats and a candle obsession"}
          className={input}
        />
      </Field>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Profile picture (square works best)">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
            className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream file:mr-3 file:rounded-full file:border-0 file:bg-champagne file:px-3 file:py-2 file:text-velvet"
          />
          {form.avatar_url && (
            <a href={form.avatar_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-champagne">
              View current avatar
            </a>
          )}
        </Field>
        <Field label="Cover banner (wide image)">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream file:mr-3 file:rounded-full file:border-0 file:bg-champagne file:px-3 file:py-2 file:text-velvet"
          />
          {form.cover_url && (
            <a href={form.cover_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-champagne">
              View current cover
            </a>
          )}
        </Field>
      </div>

      <h3 className="mt-6 font-display text-2xl text-cream">Social links</h3>
      <p className="text-sm text-cream/55">Leave blank to hide a link.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Instagram URL">
          <input value={form.instagram ?? ""} onChange={(e) => update("instagram", e.target.value || null)} placeholder="https://instagram.com/yourhandle" className={input} />
        </Field>
        <Field label="Twitter / X URL">
          <input value={form.twitter ?? ""} onChange={(e) => update("twitter", e.target.value || null)} placeholder="https://x.com/yourhandle" className={input} />
        </Field>
        <Field label="TikTok URL">
          <input value={form.tiktok ?? ""} onChange={(e) => update("tiktok", e.target.value || null)} placeholder="https://tiktok.com/@yourhandle" className={input} />
        </Field>
        <Field label="Goodreads URL">
          <input value={form.goodreads ?? ""} onChange={(e) => update("goodreads", e.target.value || null)} placeholder="https://goodreads.com/author/..." className={input} />
        </Field>
        <Field label="Website URL">
          <input value={form.website ?? ""} onChange={(e) => update("website", e.target.value || null)} placeholder="https://yourblog.com" className={input} />
        </Field>
        <Field label="Public email">
          <input value={form.email ?? ""} onChange={(e) => update("email", e.target.value || null)} placeholder="hello@yourdomain.com" className={input} />
        </Field>
      </div>

      <button
        onClick={save}
        disabled={busy}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-champagne px-5 py-3 font-semibold text-velvet disabled:opacity-60"
      >
        <Save size={16} /> {busy ? "Saving..." : "Save author profile"}
      </button>
      {message && (
        <p className={`mt-3 rounded-2xl border p-3 text-sm ${message.ok ? "border-champagne/30 bg-champagne/10 text-champagne" : "border-rose/30 bg-rose/10 text-rose"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}

const input =
  "mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream outline-none focus:border-champagne/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-3 block text-sm text-cream/60">
      {label}
      {children}
    </label>
  );
}
