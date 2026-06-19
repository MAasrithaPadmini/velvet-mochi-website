import { AdminNav, AppShell, PageHeader } from "@/components/app-shell";
import { requireAdmin } from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/repositories";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

async function getTopChapters() {
  const svc = createServiceClient();
  if (!svc) return [];
  const { data } = await svc
    .from("chapter_library")
    .select("id, story_title, number, title, views, published_at")
    .eq("status", "published")
    .order("views", { ascending: false })
    .limit(10);
  return data ?? [];
}

async function getTopStories() {
  const svc = createServiceClient();
  if (!svc) return [];
  const { data: stories } = await svc.from("stories").select("id, title, chapter_count");
  if (!stories) return [];
  const { data: chapters } = await svc.from("chapters").select("story_id, views");
  if (!chapters) return [];
  const viewsByStory = new Map<string, number>();
  for (const c of chapters) {
    viewsByStory.set(c.story_id, (viewsByStory.get(c.story_id) ?? 0) + (c.views ?? 0));
  }
  return stories
    .map((s) => ({ ...s, totalViews: viewsByStory.get(s.id) ?? 0 }))
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 8);
}

export default async function AnalyticsPage() {
  await requireAdmin();
  const [metrics, topChapters, topStories] = await Promise.all([
    getDashboardMetrics(),
    getTopChapters(),
    getTopStories(),
  ]);

  return (
    <AppShell>
      <PageHeader eyebrow="Analytics" title="Reader pulse and story performance." />
      <AdminNav />

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <Metric label="Active readers (7d)" value={metrics.activeReaders} />
        <Metric label="Total views" value={metrics.totalViews} />
        <Metric label="Subscribers" value={metrics.subscribers} />
        <Metric label="Comments" value={metrics.totalComments} />
        <Metric label="Stories" value={metrics.totalStories} />
        <Metric label="Published chapters" value={metrics.publishedChapters} />
        <Metric label="Scheduled chapters" value={metrics.scheduledChapters} />
        <Metric label="Drafts" value={metrics.draftChapters} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="glass rounded-[1.5rem] p-5">
          <h2 className="font-display text-2xl text-cream">Top stories by views</h2>
          {topStories.length === 0 ? (
            <p className="mt-3 text-sm text-cream/60">No view data yet.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {topStories.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-2xl border border-cream/10 bg-cream/6 p-3">
                  <div>
                    <div className="font-semibold text-cream">{s.title}</div>
                    <div className="text-xs text-cream/55">{s.chapter_count} chapters</div>
                  </div>
                  <div className="text-champagne font-medium">{s.totalViews.toLocaleString()} views</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="glass rounded-[1.5rem] p-5">
          <h2 className="font-display text-2xl text-cream">Top chapters by views</h2>
          {topChapters.length === 0 ? (
            <p className="mt-3 text-sm text-cream/60">No view data yet.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {topChapters.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-2xl border border-cream/10 bg-cream/6 p-3">
                  <div>
                    <div className="font-semibold text-cream">
                      #{c.number} · {c.title}
                    </div>
                    <div className="text-xs text-cream/55">
                      {c.story_title}
                      {c.published_at && ` · ${new Date(c.published_at).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="text-champagne font-medium">{(c.views ?? 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-[1.5rem] p-5">
      <div className="text-3xl font-semibold text-champagne">{value.toLocaleString()}</div>
      <div className="mt-2 text-sm text-cream/65">{label}</div>
    </div>
  );
}
