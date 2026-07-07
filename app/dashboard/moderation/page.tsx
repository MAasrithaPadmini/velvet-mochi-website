import { AppShell, AdminNav, PageHeader } from "@/components/app-shell";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { ModerationQueue } from "@/components/moderation-queue";

export const dynamic = "force-dynamic";

export interface ReportRow {
  id: string;
  comment_id: string;
  reason: string | null;
  status: string;
  created_at: string;
  comment_body: string;
  comment_author: string;
  reporter_name: string;
  story_slug: string | null;
  chapter_number: number | null;
}

async function getPendingReports(): Promise<ReportRow[]> {
  const svc = createServiceClient();
  if (!svc) return [];

  const { data: reports } = await svc
    .from("comment_reports")
    .select("id, comment_id, reason, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (!reports || reports.length === 0) return [];

  const commentIds = Array.from(new Set(reports.map((r) => r.comment_id)));
  const reporterIds = Array.from(new Set(reports.map((r) => (r as { reported_by?: string }).reported_by).filter(Boolean)));

  const { data: comments } = await svc
    .from("comments")
    .select("id, body, user_id, story_id, chapter_id")
    .in("id", commentIds);

  const userIds = Array.from(
    new Set([...(comments ?? []).map((c) => c.user_id), ...reporterIds].filter(Boolean) as string[])
  );

  const { data: profiles } = await svc.from("profiles").select("id, display_name").in("id", userIds);
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
  const commentMap = new Map((comments ?? []).map((c) => [c.id, c]));

  return reports.map((r) => {
    const comment = commentMap.get(r.comment_id);
    return {
      id: r.id,
      comment_id: r.comment_id,
      reason: r.reason,
      status: r.status,
      created_at: r.created_at,
      comment_body: comment?.body ?? "(comment deleted)",
      comment_author: comment ? profileMap.get(comment.user_id) ?? "Unknown reader" : "Unknown reader",
      reporter_name: "Reader",
      story_slug: null,
      chapter_number: null,
    };
  });
}

export default async function ModerationPage() {
  await requireAdmin();
  const reports = await getPendingReports();

  return (
    <AppShell>
      <PageHeader eyebrow="Trust & safety" title="Comment moderation" copy="Review reported comments and take action." />
      <AdminNav />
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <ModerationQueue initialReports={reports} />
      </section>
    </AppShell>
  );
}
