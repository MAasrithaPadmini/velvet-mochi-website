import { AdminNav, AppShell, PageHeader } from "@/components/app-shell";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

async function checkBucket(name: string): Promise<boolean> {
  const svc = createServiceClient();
  if (!svc) return false;
  const { data, error } = await svc.storage.from(name).list("", { limit: 1 });
  return !error && Array.isArray(data);
}

export default async function SettingsPage() {
  await requireAdmin();

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    CRON_SECRET: Boolean(process.env.CRON_SECRET),
  };

  const buckets = ["story-covers", "character-art", "moodboards", "author-assets"];
  const bucketChecks = await Promise.all(buckets.map(async (b) => ({ name: b, ok: await checkBucket(b) })));

  return (
    <AppShell>
      <PageHeader eyebrow="Settings" title="Configuration and health checks." />
      <AdminNav />

      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="glass rounded-[1.5rem] p-5">
          <h2 className="font-display text-2xl text-cream">Environment variables</h2>
          <p className="mt-2 text-sm text-cream/55">
            These come from your <code className="text-champagne">.env.local</code> file (or Vercel project settings).
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {Object.entries(env).map(([key, ok]) => (
              <li key={key} className="flex items-center justify-between rounded-xl border border-cream/8 bg-cream/5 p-3">
                <code className="text-cream/85">{key}</code>
                <span className={ok ? "text-champagne" : "text-rose"}>{ok ? "✓ set" : "✗ missing"}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-[1.5rem] p-5">
          <h2 className="font-display text-2xl text-cream">Storage buckets</h2>
          <p className="mt-2 text-sm text-cream/55">
            Cover uploads need these public buckets. Create any missing ones in Supabase Studio → Storage.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {bucketChecks.map((b) => (
              <li key={b.name} className="flex items-center justify-between rounded-xl border border-cream/8 bg-cream/5 p-3">
                <code className="text-cream/85">{b.name}</code>
                <span className={b.ok ? "text-champagne" : "text-rose"}>{b.ok ? "✓ exists" : "✗ missing"}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-[1.5rem] p-5 lg:col-span-2">
          <h2 className="font-display text-2xl text-cream">Scheduled chapter cron</h2>
          <p className="mt-2 text-sm text-cream/60">
            Vercel runs <code className="text-champagne">/api/cron/publish-scheduled</code> every 15 minutes to
            auto-publish any chapter whose <code>scheduled_for</code> time has passed. The route is protected by{" "}
            <code className="text-champagne">CRON_SECRET</code>.
          </p>
          <p className="mt-3 text-sm text-cream/55">
            If you want to test manually:{" "}
            <code className="text-champagne">curl -H &quot;Authorization: Bearer YOUR_CRON_SECRET&quot; https://your-domain/api/cron/publish-scheduled</code>
          </p>
        </div>
      </section>
    </AppShell>
  );
}
