import { AdminNav, AppShell, PageHeader } from "@/components/app-shell";
import { ChapterManager } from "@/components/admin-managers";
import { requireAdmin } from "@/lib/auth";
import { listAllChaptersForAdmin, listStories } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function ChapterManagementPage() {
  await requireAdmin();
  const [stories, chapters] = await Promise.all([
    listStories({ includeDrafts: true }),
    listAllChaptersForAdmin(),
  ]);
  return (
    <AppShell>
      <PageHeader
        eyebrow="Chapter management"
        title="Draft, schedule, publish."
        copy="Write today, schedule for tomorrow. Auto-save protects every keystroke."
      />
      <AdminNav />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <ChapterManager stories={stories} initialChapters={chapters} />
      </section>
    </AppShell>
  );
}
