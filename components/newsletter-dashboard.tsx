"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { NewsletterSubscriber } from "@/lib/types";

type Campaign = { id: string; subject: string; body: string; recipient_count: number; sent_at: string };

export function NewsletterDashboard({
  subscribers,
  campaigns,
}: {
  subscribers: NewsletterSubscriber[];
  campaigns: Campaign[];
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [history, setHistory] = useState(campaigns);

  async function send() {
    if (!subject.trim() || !body.trim()) {
      setMessage({ text: "Subject and body required.", ok: false });
      return;
    }
    setBusy(true);
    const response = await fetch("/api/admin/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    const json = await response.json();
    setBusy(false);
    if (response.ok) {
      setMessage({ text: `Campaign logged for ${json.recipient_count} subscribers.`, ok: true });
      setSubject("");
      setBody("");
      if (json.campaign) setHistory([json.campaign, ...history]);
    } else {
      setMessage({ text: json.error ?? "Failed.", ok: false });
    }
  }

  const active = subscribers.filter((s) => s.status === "subscribed");

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_.9fr]">
      <div className="glass rounded-[1.5rem] p-5">
        <h2 className="font-display text-2xl text-cream">New campaign</h2>
        <label className="mt-4 block text-sm text-cream/60">
          Subject
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream"
          />
        </label>
        <label className="mt-4 block text-sm text-cream/60">
          Message
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream"
          />
        </label>
        <button
          onClick={send}
          disabled={busy}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-champagne px-5 py-3 font-semibold text-velvet disabled:opacity-60"
        >
          <Send size={15} /> {busy ? "Logging..." : `Send to ${active.length} subscribers`}
        </button>
        {message && (
          <p className={`mt-3 rounded-2xl border p-3 text-sm ${message.ok ? "border-champagne/30 bg-champagne/10 text-champagne" : "border-rose/30 bg-rose/10 text-rose"}`}>
            {message.text}
          </p>
        )}

        <h3 className="mt-8 font-display text-xl text-cream">Past campaigns ({history.length})</h3>
        <div className="mt-3 space-y-2">
          {history.length === 0 && <p className="text-sm text-cream/55">No campaigns yet.</p>}
          {history.map((c) => (
            <div key={c.id} className="rounded-2xl border border-cream/10 bg-cream/6 p-3">
              <div className="font-semibold text-cream">{c.subject}</div>
              <div className="text-xs text-cream/55">
                {new Date(c.sent_at).toLocaleString()} · {c.recipient_count} recipients
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-cream/70">{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-[1.5rem] p-5">
        <h2 className="font-display text-2xl text-cream">Subscribers ({active.length})</h2>
        {subscribers.length === 0 ? (
          <p className="mt-3 text-sm text-cream/55">No subscribers yet.</p>
        ) : (
          <div className="mt-4 max-h-[480px] space-y-2 overflow-y-auto pr-1 scrollbar-soft">
            {subscribers.map((s) => (
              <div key={s.id} className="rounded-xl border border-cream/8 bg-cream/5 p-3 text-sm">
                <div className="text-cream truncate">{s.email}</div>
                <div className="text-xs text-cream/45">
                  {s.status} · {new Date(s.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
