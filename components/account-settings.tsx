"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AccountSettings() {
  const [newPassword, setNewPassword] = useState("");
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [confirmText, setConfirmText] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMessage("");
    setPwError(false);

    if (newPassword.length < 8) {
      setPwError(true);
      setPwMessage("Password must be at least 8 characters.");
      return;
    }

    setPwLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setPwError(true);
      setPwMessage("Supabase not configured.");
      setPwLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwError(Boolean(error));
    setPwMessage(error ? error.message : "Password updated successfully.");
    setPwLoading(false);
    if (!error) setNewPassword("");
  }

  async function deleteAccount() {
    if (confirmText !== "DELETE") return;
    setDeleteLoading(true);
    setDeleteMessage("");

    const res = await fetch("/api/account/delete", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setDeleteMessage(data.error || "Something went wrong. Please try again.");
      setDeleteLoading(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={changePassword} className="glass rounded-[1.5rem] p-5">
        <h2 className="font-display text-2xl text-cream">Change password</h2>
        <label className="mt-4 block text-sm text-cream/60">
          New password
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-cream/10 bg-cream/7 px-4 py-3 text-cream outline-none focus:border-champagne/40"
          />
        </label>
        <button
          disabled={pwLoading}
          className="mt-4 rounded-full bg-champagne px-5 py-2.5 font-semibold text-velvet disabled:opacity-60"
        >
          {pwLoading ? "Updating..." : "Update password"}
        </button>
        {pwMessage && (
          <p className={`mt-3 rounded-2xl border p-3 text-sm ${
            pwError ? "border-rose/30 bg-rose/10 text-rose" : "border-champagne/30 bg-champagne/10 text-champagne"
          }`}>
            {pwMessage}
          </p>
        )}
      </form>

      <div className="glass rounded-[1.5rem] p-5 border border-rose/20">
        <h2 className="font-display text-2xl text-rose">Delete account</h2>
        <p className="mt-2 text-sm text-cream/60">
          This permanently deletes your account, bookshelf, bookmarks, reading progress, and comments.
          This cannot be undone.
        </p>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="mt-4 rounded-full border border-rose/40 px-5 py-2.5 font-semibold text-rose hover:bg-rose/10"
          >
            Delete my account
          </button>
        ) : (
          <div className="mt-4 space-y-3">
            <label className="block text-sm text-cream/60">
              Type <span className="font-semibold text-rose">DELETE</span> to confirm
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-rose/30 bg-cream/7 px-4 py-3 text-cream outline-none focus:border-rose/60"
              />
            </label>
            <div className="flex gap-3">
              <button
                onClick={deleteAccount}
                disabled={confirmText !== "DELETE" || deleteLoading}
                className="rounded-full bg-rose px-5 py-2.5 font-semibold text-velvet disabled:opacity-40"
              >
                {deleteLoading ? "Deleting..." : "Permanently delete"}
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmText("");
                }}
                className="rounded-full border border-cream/12 px-5 py-2.5 text-cream/70"
              >
                Cancel
              </button>
            </div>
            {deleteMessage && (
              <p className="rounded-2xl border border-rose/30 bg-rose/10 p-3 text-sm text-rose">
                {deleteMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
