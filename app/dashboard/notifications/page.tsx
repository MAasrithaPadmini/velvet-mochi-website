import { AdminNav, AppShell, PageHeader } from "@/components/app-shell";
import { BroadcastPanel } from "@/components/broadcast-panel";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export default async function NotificationsAdminPage() {
  await requireAdmin();
  const svc = createServiceClient();
  const { data: past } = svc
    ? await svc
        .from("notifications")
        .select("*")
        .is("user_id", null)
        .order("created_at", { ascending: false })
        .limit(30)
    : { data: [] };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Notifications"
        title="Broadcast to every reader."
        copy="Send announcements that appear on every reader's bookshelf. Chapter publishes auto-broadcast — use this for everything else."
      />
      <AdminNav />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <BroadcastPanel pastBroadcasts={past ?? []} />
      </section>
    </AppShell>
  );
}
