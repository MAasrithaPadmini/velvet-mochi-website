import { AdminNav, AppShell, PageHeader } from "@/components/app-shell";
import { StoryManager } from "@/components/admin-managers";
import { requireAdmin } from "@/lib/auth";
import { listStories } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function StoryManagementPage() {
  await requireAdmin();
  const stories = await listStories({ includeDrafts: true });
  return (
    <AppShell>
      <PageHeader eyebrow="Story management" title="Create, edit, publish, archive." />
      <AdminNav />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <StoryManager initialStories={stories} />
      </section>
    </AppShell>
  );
}
