"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (!email || !password) {
      setIsError(true);
      setMessage("Email and password are required.");
      return;
    }
    if (mode === "register" && password.length < 8) {
      setIsError(true);
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (mode === "register" && !agreedToTerms) {
      setIsError(true);
      setMessage("Please agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    if (mode === "register" && !confirmedAge) {
      setIsError(true);
      setMessage("Please confirm you are 18 or older to create an account.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setIsError(true);
      setMessage("Supabase not configured. Check your .env.local file.");
      setLoading(false);
      return;
    }

    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setIsError(true);
        setMessage(error.message);
        setLoading(false);
        return;
      }
      if (!data.session) {
        setIsError(true);
        setMessage("Login succeeded but no session was created. Try again.");
        setLoading(false);
        return;
      }
      // Wait a tick so the cookie is fully written, then hard-redirect.
      setMessage("Signed in. Redirecting...");
      await new Promise((r) => setTimeout(r, 300));
      window.location.href = "/bookshelf";
      return;
    }

    // Register
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: { display_name: displayName || email.split("@")[0], age_confirmed: true },
      },
    });

    if (error) {
      setIsError(true);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setIsError(false);
      setMessage("Account created. Check your email to confirm, then log in. (Or disable email confirmation in Supabase Authentication settings.)");
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").update({ age_confirmed: true }).eq("id", data.user.id);
    }

    await new Promise((r) => setTimeout(r, 300));
    window.location.href = "/bookshelf";
  }

  async function handleForgot() {
    if (!email) {
      setIsError(true);
      setMessage("Enter your email first, then click forgot password.");
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password/confirm`,
    });
    setIsError(Boolean(error));
    setMessage(error ? error.message : "If that email exists, a reset link is on its way.");
  }

  return (
    <form onSubmit={submit} className="glass mx-auto max-w-xl rounded-[1.75rem] p-6 sm:p-8">
      <h2 className="font-display text-4xl text-cream">
        {mode === "login" ? "Welcome back" : "Create your reader key"}
      </h2>
      <p className="mt-2 text-sm text-cream/55">
        {mode === "login"
          ? "Slip back into the moonlit library."
          : "A free account unlocks your bookshelf and reading memory."}
      </p>

      {mode === "register" && (
        <label className="mt-6 block text-sm text-cream/60">
          Display name
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="What should the library call you?"
            className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream outline-none focus:border-champagne/40"
          />
        </label>
      )}

      <label className="mt-4 block text-sm text-cream/60">
        Email
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream outline-none focus:border-champagne/40"
        />
      </label>
      <label className="mt-4 block text-sm text-cream/60">
        Password
        <input
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream outline-none focus:border-champagne/40"
        />
      </label>

      {mode === "register" && (
        <div className="mt-5 space-y-3">
          <label className="flex items-start gap-3 text-sm text-cream/70">
            <input
              type="checkbox"
              checked={confirmedAge}
              onChange={(e) => setConfirmedAge(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-cream/30 bg-cream/7 accent-champagne"
            />
            <span>I confirm that I am 18 years of age or older.</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-cream/70">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-cream/30 bg-cream/7 accent-champagne"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="text-champagne underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="text-champagne underline">
                Privacy Policy
              </Link>.
            </span>
          </label>
        </div>
      )}

      <button
        disabled={loading}
        className="mt-6 w-full rounded-full bg-champagne px-5 py-3 font-semibold text-velvet disabled:opacity-60"
      >
        {loading ? "Working..." : mode === "login" ? "Enter the library" : "Create account"}
      </button>

      <div className="mt-4 flex flex-wrap justify-between gap-3 text-sm text-cream/60">
        <Link href={mode === "login" ? "/register" : "/login"} className="text-champagne">
          {mode === "login" ? "Create account" : "I already have an account"}
        </Link>
        {mode === "login" && (
          <button type="button" onClick={handleForgot} className="text-champagne">
            Forgot password?
          </button>
        )}
      </div>

      {message && (
        <p className={`mt-4 rounded-2xl border p-3 text-sm ${
          isError
            ? "border-rose/30 bg-rose/10 text-rose"
            : "border-champagne/30 bg-champagne/10 text-champagne"
        }`}>
          {message}
        </p>
      )}
    </form>
  );
}

export function SignOutButton() {
  return (
    <button
      onClick={async () => {
        const supabase = createClient();
        if (supabase) await supabase.auth.signOut();
        window.location.href = "/";
      }}
      className="rounded-full border border-cream/12 px-3 py-1 text-sm text-cream/70 hover:bg-cream/8"
    >
      Sign out
    </button>
  );
}
