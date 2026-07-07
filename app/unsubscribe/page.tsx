"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell, PageHeader } from "@/components/app-shell";

function UnsubscribeForm() {
  const params = useSearchParams();
  const prefill = params.get("email") ?? "";
  const [email, setEmail] = useState(prefill);
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function doUnsubscribe(targetEmail: string) {
    setStatus("working");
    const res = await fetch("/api/newsletter/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });
    if (res.ok) {
      setStatus("done");
    } else {
      const json = await res.json().catch(() => ({}));
      setErrorMsg(json.error ?? "Something went wrong.");
      setStatus("error");
    }
  }

  useEffect(() => {
    if (prefill) doUnsubscribe(prefill);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "done") {
    return (
      <div className="glass rounded-[1.75rem] p-8 text-center">
        <p className="text-cream/80">You&apos;ve been unsubscribed. You won&apos;t receive further chapter emails.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-[1.75rem] p-8">
      <p className="mb-4 text-sm text-cream/65">Enter the email address you subscribed with.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (email.trim()) doUnsubscribe(email.trim());
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded-full border border-cream/10 bg-cream/7 px-4 py-3 text-cream outline-none focus:border-champagne/40"
        />
        <button
          disabled={status === "working"}
          className="rounded-full bg-champagne px-5 py-3 font-semibold text-velvet disabled:opacity-60"
        >
          {status === "working" ? "..." : "Unsubscribe"}
        </button>
      </form>
      {status === "error" && <p className="mt-3 text-sm text-rose">{errorMsg}</p>}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Newsletter" title="Unsubscribe" />
      <section className="mx-auto max-w-lg px-4 pb-16 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <UnsubscribeForm />
        </Suspense>
      </section>
    </AppShell>
  );
}
