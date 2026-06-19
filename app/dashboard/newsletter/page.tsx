import { AdminNav, AppShell, PageHeader } from "@/components/app-shell";
import { NewsletterDashboard } from "@/components/newsletter-dashboard";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  await requireAdmin();
  const svc = createServiceClient();
  const [{ data: subscribers }, { data: campaigns }] = svc
    ? await Promise.all([
        svc.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }),
        svc.from("newsletter_campaigns").select("*").order("sent_at", { ascending: false }).limit(20),
      ])
    : [{ data: [] }, { data: [] }];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Newsletter"
        title="Send chapter alerts to your subscribers."
        copy="A campaign is logged here. To actually deliver email, connect a sender (Resend, Postmark) on the Settings page later."
      />
      <AdminNav />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <NewsletterDashboard subscribers={subscribers ?? []} campaigns={campaigns ?? []} />
      </section>
    </AppShell>
  );
}
