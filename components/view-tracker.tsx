"use client";

import { useEffect } from "react";

const READ_AFTER_MS = 15_000; // count a view once the reader has stayed 15s
const ONCE_PER_MS = 12 * 60 * 60 * 1000; // per browser, per chapter

// Records one view per real reader. Runs only in the browser, so crawlers that
// just fetch the page never count, and refreshes within 12 hours don't either.
export function ViewTracker({ chapterId }: { chapterId: string }) {
  useEffect(() => {
    const key = `vm-viewed:${chapterId}`;
    try {
      const last = Number(window.localStorage.getItem(key) ?? 0);
      if (Date.now() - last < ONCE_PER_MS) return;
    } catch {
      // Storage blocked (private mode etc.): still count, the server rate-limits.
    }

    const timer = window.setTimeout(() => {
      if (document.visibilityState !== "visible") return;
      fetch(`/api/chapters/${chapterId}/view`, { method: "POST", keepalive: true }).catch(() => {});
      try {
        window.localStorage.setItem(key, String(Date.now()));
      } catch {
        /* ignore */
      }
    }, READ_AFTER_MS);

    return () => window.clearTimeout(timer);
  }, [chapterId]);

  return null;
}
