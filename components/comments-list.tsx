"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, MessageSquare } from "lucide-react";
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

  async function remove(id: string) {
    if (!window.confirm("Delete this comment?")) return;
    const response = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (response.ok) setComments((current) => current.filter((c) => c.id !== id));
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
        {comments.map((c) => (
          <div key={c.id} className="rounded-2xl border border-cream/10 bg-cream/6 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase tracking-wide text-champagne/75">
                  {c.display_name ?? "Anonymous reader"} · {new Date(c.created_at).toLocaleDateString()}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-cream/85">{c.body}</p>
              </div>
              {(c.user_id === currentUserId || isAdmin) && (
                <button
                  onClick={() => remove(c.id)}
                  aria-label="Delete comment"
                  className="grid size-8 shrink-0 place-items-center rounded-full border border-rose/30 text-rose"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
