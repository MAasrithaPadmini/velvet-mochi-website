"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import type { ReportRow } from "@/app/dashboard/moderation/page";

export function ModerationQueue({ initialReports }: { initialReports: ReportRow[] }) {
  const [reports, setReports] = useState(initialReports);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function dismiss(reportId: string) {
    setBusyId(reportId);
    const res = await fetch(`/api/admin/moderation/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dismiss" }),
    });
    if (res.ok) setReports((r) => r.filter((x) => x.id !== reportId));
    setBusyId(null);
  }

  async function deleteAndAction(reportId: string, commentId: string) {
    if (!window.confirm("Delete this comment and mark the report as actioned?")) return;
    setBusyId(reportId);
    const res = await fetch(`/api/admin/moderation/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", comment_id: commentId }),
    });
    if (res.ok) setReports((r) => r.filter((x) => x.id !== reportId));
    setBusyId(null);
  }

  if (reports.length === 0) {
    return (
      <div className="glass rounded-[1.75rem] p-8 text-center">
        <p className="text-cream/60">No pending reports. All clear.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((r) => (
        <div key={r.id} className="glass rounded-2xl p-5">
          <div className="text-xs uppercase tracking-wide text-rose/80">
            Reported {new Date(r.created_at).toLocaleString()} {r.reason && `· "${r.reason}"`}
          </div>
          <p className="mt-2 text-sm text-cream/60">By: {r.comment_author}</p>
          <p className="mt-2 whitespace-pre-wrap rounded-xl border border-cream/10 bg-cream/6 p-3 text-sm text-cream/85">
            {r.comment_body}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => dismiss(r.id)}
              disabled={busyId === r.id}
              className="inline-flex items-center gap-2 rounded-full border border-champagne/30 px-4 py-2 text-sm text-champagne disabled:opacity-50"
            >
              <Check size={14} /> Dismiss (not spam)
            </button>
            <button
              onClick={() => deleteAndAction(r.id, r.comment_id)}
              disabled={busyId === r.id}
              className="inline-flex items-center gap-2 rounded-full border border-rose/30 px-4 py-2 text-sm text-rose disabled:opacity-50"
            >
              <Trash2 size={14} /> Delete comment
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
