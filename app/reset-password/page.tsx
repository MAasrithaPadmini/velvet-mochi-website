"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell, PageHeader } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setBusy(true);
    const supabase = createClient();
    if (!supabase) {
      setMessage({ text: "Supabase not configured.", ok: false });
      setBusy(false);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password/confirm`,
    });
    setMessage({
      text: error ? error.message : "If that email exists, we just sent a reset link. Check your inbox.",
      ok: !error,
    });
    setBusy(false);
  }

  return (
    <AppShell>
      <PageHeader eyebrow="Forgotten key" title="Reset your password." />
      <section className="mx-auto max-w-xl px-4 pb-16 sm:px-6 lg:px-8">
        <form onSubmit={submit} className="glass rounded-[1.75rem] p-6 sm:p-8">
          <label className="block text-sm text-cream/60">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream outline-none focus:border-champagne/40"
            />
          </label>
          <button
            disabled={busy}
            className="mt-5 w-full rounded-full bg-champagne px-5 py-3 font-semibold text-velvet disabled:opacity-60"
          >
            {busy ? "Sending..." : "Send reset link"}
          </button>
          <Link href="/login" className="mt-4 block text-center text-sm text-champagne">
            Back to login
          </Link>
          {message && (
            <p
              className={`mt-4 rounded-2xl border p-3 text-sm ${
                message.ok ? "border-champagne/30 bg-champagne/10 text-champagne" : "border-rose/30 bg-rose/10 text-rose"
              }`}
            >
              {message.text}
            </p>
          )}
        </form>
      </section>
    </AppShell>
  );
}
