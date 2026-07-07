"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, MessageSquare, Flag } from "lucide-react";
import type { Comment } from "@/lib/types";

export function CommentsList({
  storyId,
  chapterId,
  currentUserId,
  isAdmin,
}: {
  storyId: string;
  chapterId: string;
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const url = new URL("/api/comments", window.location.origin);
    url.searchParams.set("story_id", storyId);
    url.searchParams.set("chapter_id", chapterId);
    const response = await fetch(url.toString());
    if (response.ok) {
      const json = await response.json();
      setComments(json.comments ?? []);
    }
    setLoading(false);
  }, [storyId, chapterId]);

  useEffect(() => {
    fetchComments();
    function handlePosted() {
      fetchComments();
    }
    window.addEventListener("velvet:comment-posted", handlePosted);
    return () => window.removeEventListener("velvet:comment-posted", handlePosted);
  }, [fetchComments]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function remove(id: string) {
    if (!window.confirm("Delete this comment?")) return;
    const response = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (response.ok) setComments((current) => current.filter((c) => c.id !== id));
  }

  async function report(id: string) {
    if (reportedIds.has(id)) return;
    if (!currentUserId) {
      setToast("Login to report a comment.");
      return;
    }
    if (!window.confirm("Report this comment for review by a moderator?")) return;
    const response = await fetch(`/api/comments/${id}/report`, { method: "POST" });
    if (response.ok) {
      setReportedIds((prev) => new Set(prev).add(id));
      setToast("Comment reported. A moderator will review it.");
    } else {
      const json = await response.json().catch(() => ({}));
      setToast(json.error ?? "Failed to report. Please try again.");
    }
  }

  return (
    <div className="glass rounded-[1.75rem] p-5 sm:p-6">
      <h2 className="font-display text-3xl text-cream inline-flex items-center gap-2">
        <MessageSquare size={20} /> Reader notes ({comments.length})
      </h2>
      {loading && <p className="mt-4 text-sm text-cream/55">Gathering whispers from the library...</p>}
      {!loading && comments.length === 0 && (
        <p className="mt-4 rounded-2xl border border-cream/10 bg-cream/5 p-4 text-sm text-cream/60">
          No comments yet. Be the first to leave a thought.
        </p>
      )}
      <div className="mt-4 space-y-3">
        {comments.map((c) => {
          const isOwn = c.user_id === currentUserId;
          const alreadyReported = reportedIds.has(c.id);
          return (
            <div key={c.id} className="rounded-2xl border border-cream/10 bg-cream/6 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs uppercase tracking-wide text-champagne/75">
                    {c.display_name ?? "Anonymous reader"} · {new Date(c.created_at).toLocaleDateString()}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-cream/85">{c.body}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {!isOwn && (
                    <button
                      onClick={() => report(c.id)}
                      disabled={alreadyReported}
                      aria-label="Report comment"
                      title={alreadyReported ? "Reported" : "Report this comment"}
                      className={`grid size-8 place-items-center rounded-full border ${
                        alreadyReported ? "border-cream/10 text-cream/25" : "border-cream/15 text-cream/50 hover:text-champagne"
                      }`}
                    >
                      <Flag size={13} />
                    </button>
                  )}
                  {(isOwn || isAdmin) && (
                    <button
                      onClick={() => remove(c.id)}
                      aria-label="Delete comment"
                      className="grid size-8 place-items-center rounded-full border border-rose/30 text-rose"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {toast && (
        <p className="mt-4 rounded-2xl border border-champagne/25 bg-champagne/10 p-3 text-xs text-champagne">
          {toast}
        </p>
      )}
    </div>
  );
}
