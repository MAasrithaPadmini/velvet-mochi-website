"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "idle" | "working" | "unsubscribed" | "confirmationSent" | "error";

export function UnsubscribeForm() {
  const params = useSearchParams();
  const linkEmail = params.get("email") ?? "";
  const linkToken = params.get("token") ?? "";
  const hasSignedLink = Boolean(linkEmail && linkToken);

  const [email, setEmail] = useState(linkEmail);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  // After a bad/expired link, fall back to the "email me a fresh link" form.
  const [useSignedLink, setUseSignedLink] = useState(hasSignedLink);

  async function submit(payload: { email: string; token?: string }) {
    setStatus("working");
    setErrorMsg("");
    const res = await fetch("/api/newsletter/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.unsubscribed) return setStatus("unsubscribed");
    if (res.ok && json.confirmationSent) return setStatus("confirmationSent");
    if (res.status === 403) setUseSignedLink(false);
    setErrorMsg(json.error ?? "Something went wrong.");
    setStatus("error");
  }

  if (status === "unsubscribed") {
    return (
      <div className="glass rounded-[1.75rem] p-8 text-center">
        <p className="text-cream/80">You&apos;ve been unsubscribed. You won&apos;t receive further chapter emails.</p>
      </div>
    );
  }

  if (status === "confirmationSent") {
    return (
      <div className="glass rounded-[1.75rem] p-8 text-center">
        <p className="text-cream/80">
          If <span className="text-cream">{email.trim()}</span> is subscribed, we&apos;ve sent it a link to confirm. Open
          that email and tap <span className="text-cream">Confirm unsubscribe</span>.
        </p>
      </div>
    );
  }

  if (useSignedLink) {
    return (
      <div className="glass rounded-[1.75rem] p-8 text-center">
        <p className="mb-5 text-cream/80">
          Stop chapter emails to <span className="break-all text-cream">{linkEmail}</span>?
        </p>
        <button
          onClick={() => submit({ email: linkEmail, token: linkToken })}
          disabled={status === "working"}
          className="rounded-full bg-champagne px-6 py-3 font-semibold text-velvet disabled:opacity-60"
        >
          {status === "working" ? "..." : "Confirm unsubscribe"}
        </button>
        {status === "error" && <p className="mt-3 text-sm text-rose">{errorMsg}</p>}
      </div>
    );
  }

  return (
    <div className="glass rounded-[1.75rem] p-8">
      <p className="mb-4 text-sm text-cream/65">
        Enter the email address you subscribed with and we&apos;ll send you a link to confirm.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (email.trim()) submit({ email: email.trim() });
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
          {status === "working" ? "..." : "Send link"}
        </button>
      </form>
      {status === "error" && <p className="mt-3 text-sm text-rose">{errorMsg}</p>}
    </div>
  );
}
