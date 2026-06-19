"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";
import type { Notification } from "@/lib/types";

export function BroadcastPanel({ pastBroadcasts }: { pastBroadcasts: Notification[] }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [history, setHistory] = useState(pastBroadcasts);

  async function send() {
    if (!title.trim() || !body.trim()) {
      setMessage({ text: "Title and body required.", ok: false });
      return;
    }
    setBusy(true);
    const response = await fetch("/api/admin/notifications/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, link: link || null }),
    });
    const json = await response.json();
    setBusy(false);
    if (response.ok) {
      setMessage({ text: "Broadcast sent.", ok: true });
      setTitle("");
      setBody("");
      setLink("");
      if (json.notification) setHistory([json.notification, ...history]);
    } else {
      setMessage({ text: json.error ?? "Failed.", ok: false });
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div className="glass rounded-[1.5rem] p-5">
        <h2 className="inline-flex items-center gap-2 font-display text-2xl text-cream">
          <Megaphone size={20} /> New broadcast
        </h2>
        <label className="mt-4 block text-sm text-cream/60">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Site is taking a one-day pause"
            className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream"
          />
        </label>
        <label className="mt-4 block text-sm text-cream/60">
          Message
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="No new chapter tomorrow — back the following day with a longer one."
            className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream"
          />
        </label>
        <label className="mt-4 block text-sm text-cream/60">
          Link (optional, e.g. /stories/honeyed-nightshade)
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream"
          />
        </label>
        <button
          onClick={send}
          disabled={busy}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-champagne px-5 py-3 font-semibold text-velvet disabled:opacity-60"
        >
          {busy ? "Broadcasting..." : "Broadcast to all readers"}
        </button>
        {message && (
          <p className={`mt-3 rounded-2xl border p-3 text-sm ${message.ok ? "border-champagne/30 bg-champagne/10 text-champagne" : "border-rose/30 bg-rose/10 text-rose"}`}>
            {message.text}
          </p>
        )}
      </div>

      <div className="glass rounded-[1.5rem] p-5">
        <h2 className="font-display text-2xl text-cream">Recent broadcasts ({history.length})</h2>
        <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1 scrollbar-soft">
          {history.length === 0 && <p className="text-sm text-cream/55">No broadcasts yet.</p>}
          {history.map((n) => (
            <div key={n.id} className="rounded-2xl border border-cream/10 bg-cream/6 p-3">
              <div className="font-semibold text-cream">{n.title}</div>
              <p className="mt-1 text-sm text-cream/70">{n.body}</p>
              <div className="mt-2 text-xs text-cream/45">{new Date(n.created_at).toLocaleString()}</div>
              {n.link && <div className="mt-1 text-xs text-champagne/80">→ {n.link}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
