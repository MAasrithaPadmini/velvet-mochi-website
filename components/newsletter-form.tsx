"use client";

import { Mail } from "lucide-react";
import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, hidden from people
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setMessage(null);
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), website }),
    });
    const json = await response.json().catch(() => ({}));
    if (response.ok) {
      setMessage({
        text: "Almost there — check your inbox (and spam folder) and tap the link to confirm.",
        ok: true,
      });
      setEmail("");
    } else {
      setMessage({ text: json.error ?? "Could not subscribe.", ok: false });
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="glass relative rounded-[1.75rem] p-5 sm:p-6">
      <div className="flex items-center gap-2 text-champagne">
        <Mail size={18} />
        <h3 className="font-display text-2xl text-cream">Chapter alerts in your inbox</h3>
      </div>
      <p className="mt-2 text-sm text-cream/60">
        Subscribe to be notified when new chapters go live. No spam, just moonlight.
      </p>
      {/* Honeypot: invisible to people, bots fill it in and get silently ignored. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded-full border border-cream/10 bg-cream/7 px-4 py-3 text-cream outline-none focus:border-champagne/40"
        />
        <button
          disabled={busy}
          className="rounded-full bg-champagne px-5 py-3 font-semibold text-velvet disabled:opacity-60"
        >
          {busy ? "..." : "Subscribe"}
        </button>
      </div>
      {message && (
        <p className={`mt-3 text-sm ${message.ok ? "text-champagne" : "text-rose"}`}>{message.text}</p>
      )}
    </form>
  );
}
