"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "idle" | "working" | "done" | "error";

export function SubscribeConfirm() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const exp = params.get("exp") ?? "";
  const token = params.get("token") ?? "";

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!email || !exp || !token) {
    return (
      <div className="glass rounded-[1.75rem] p-8 text-center text-cream/80">
        This link is incomplete. Please use the button in your confirmation email, or{" "}
        <Link href="/" className="text-champagne underline">sign up again</Link>.
      </div>
    );
  }

  async function confirm() {
    setStatus("working");
    setErrorMsg("");
    const res = await fetch("/api/newsletter/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, exp, token }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return setStatus("done");
    setErrorMsg(json.error ?? "Something went wrong.");
    setStatus("error");
  }

  if (status === "done") {
    return (
      <div className="glass rounded-[1.75rem] p-8 text-center">
        <p className="text-cream/80">
          You&apos;re in. We&apos;ll email <span className="break-all text-cream">{email}</span> whenever a new chapter lands.
        </p>
        <Link href="/library" className="mt-5 inline-block text-champagne underline">Browse the library</Link>
      </div>
    );
  }

  return (
    <div className="glass rounded-[1.75rem] p-8 text-center">
      <p className="mb-5 text-cream/80">
        Send new-chapter alerts to <span className="break-all text-cream">{email}</span>?
      </p>
      <button
        onClick={confirm}
        disabled={status === "working"}
        className="rounded-full bg-champagne px-6 py-3 font-semibold text-velvet disabled:opacity-60"
      >
        {status === "working" ? "..." : "Yes, subscribe me"}
      </button>
      {status === "error" && <p className="mt-3 text-sm text-rose">{errorMsg}</p>}
    </div>
  );
}
