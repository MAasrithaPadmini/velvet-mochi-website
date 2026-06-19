"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, PageHeader } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) {
      setMessage({ text: "Password must be at least 8 characters.", ok: false });
      return;
    }
    if (password !== confirm) {
      setMessage({ text: "Passwords don't match.", ok: false });
      return;
    }
    setBusy(true);
    const supabase = createClient();
    if (!supabase) {
      setMessage({ text: "Supabase not configured.", ok: false });
      setBusy(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setMessage({ text: error.message, ok: false });
      return;
    }
    setMessage({ text: "Password updated. Redirecting...", ok: true });
    setTimeout(() => router.push("/bookshelf"), 1200);
  }

  return (
    <AppShell>
      <PageHeader eyebrow="New key" title="Choose a new password." />
      <section className="mx-auto max-w-xl px-4 pb-16 sm:px-6 lg:px-8">
        <form onSubmit={submit} className="glass rounded-[1.75rem] p-6 sm:p-8">
          <label className="block text-sm text-cream/60">
            New password
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream outline-none focus:border-champagne/40"
            />
          </label>
          <label className="mt-4 block text-sm text-cream/60">
            Confirm password
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream outline-none focus:border-champagne/40"
            />
          </label>
          <button
            disabled={busy}
            className="mt-5 w-full rounded-full bg-champagne px-5 py-3 font-semibold text-velvet disabled:opacity-60"
          >
            {busy ? "Updating..." : "Update password"}
          </button>
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
