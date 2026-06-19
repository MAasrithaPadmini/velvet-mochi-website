import Link from "next/link";
import { AdminNav, AppShell, PageHeader } from "@/components/app-shell";
import { requireAdmin } from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/repositories";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

async function getUpcomingChapters() {
  const svc = createServiceClient();
  if (!svc) return [];
  const { data } = await svc
    .from("chapter_library")
    .select("id, story_slug, story_title, number, title, scheduled_for")
    .eq("status", "scheduled")
    .order("scheduled_for", { ascending: true })
    .limit(5);
  return data ?? [];
}

export default async function DashboardPage() {
  const profile = await requireAdmin();
  const [metrics, upcoming] = await Promise.all([getDashboardMetrics(), getUpcomingChapters()]);

  return (
    <AppShell>
      <PageHeader
        eyebrow={`Welcome, ${profile.display_name}`}
        title="Publishing command room."
        copy="Everything you need to publish a chapter, send a notification, and watch readers light up the library."
      />
      <AdminNav />

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <Tile href="/dashboard/stories" label="Stories" value={metrics.totalStories} sub={`${metrics.publishedStories} published`} />
        <Tile href="/dashboard/chapters" label="Chapters" value={metrics.totalChapters} sub={`${metrics.publishedChapters} live · ${metrics.draftChapters} draft`} />
        <Tile href="/dashboard/chapters" label="Scheduled" value={metrics.scheduledChapters} sub="auto-publishing" />
        <Tile href="/dashboard/analytics" label="Total views" value={metrics.totalViews} sub="all chapters" />
        <Tile href="/dashboard/newsletter" label="Subscribers" value={metrics.subscribers} sub="newsletter" />
        <Tile href="/dashboard/analytics" label="Active readers" value={metrics.activeReaders} sub="last 7 days" />
        <Tile href="/dashboard/chapters" label="Comments" value={metrics.totalComments} sub="reader notes" />
        <Tile href="/dashboard/notifications" label="Notifications" value="Send" sub="broadcast to readers" />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="glass rounded-[1.5rem] p-5">
          <h2 className="font-display text-2xl text-cream">Upcoming scheduled chapters</h2>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-cream/60">
              No chapters are scheduled. Create one and set a date to auto-publish.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {upcoming.map((c) => (
                <li key={c.id} className="rounded-2xl border border-cream/10 bg-cream/6 p-3">
                  <div className="font-semibold text-cream">
                    {c.story_title} · #{c.number} {c.title}
                  </div>
                  <div className="text-xs text-cream/55">
                    Drops {c.scheduled_for ? new Date(c.scheduled_for).toLocaleString() : "unscheduled"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Tile({ href, label, value, sub }: { href: string; label: string; value: number | string; sub?: string }) {
  return (
    <Link href={href} className="glass rounded-[1.5rem] p-5 hover:bg-cream/8">
      <div className="text-3xl font-semibold text-champagne">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="mt-2 text-sm text-cream/65">{label}</div>
      {sub && <div className="mt-1 text-xs text-cream/45">{sub}</div>}
    </Link>
  );
}
