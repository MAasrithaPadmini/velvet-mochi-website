import { AdminNav, AppShell, PageHeader } from "@/components/app-shell";
import { WritingStudio } from "@/components/writing-studio";
import { requireAdmin } from "@/lib/auth";
import { listStories } from "@/lib/repositories";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

async function getTodayWordCount(userId: string) {
  const svc = createServiceClient();
  if (!svc) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data } = await svc
    .from("chapters")
    .select("body, updated_at")
    .gte("updated_at", today.toISOString());
  if (!data) return 0;
  return data.reduce((sum, c) => {
    const words = c.body?.trim().split(/\s+/).filter(Boolean).length ?? 0;
    return sum + words;
  }, 0);
}

async function getWritingStreak() {
  const svc = createServiceClient();
  if (!svc) return 0;
  const { data } = await svc
    .from("chapters")
    .select("updated_at")
    .order("updated_at", { ascending: false })
    .limit(30);
  if (!data || data.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const writingDays = new Set(
    data.map((c) => new Date(c.updated_at).toDateString())
  );

  for (let i = 0; i < 30; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    if (writingDays.has(day.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export default async function WritingStudioPage() {
  const profile = await requireAdmin();
  const stories = await listStories({ includeDrafts: true });
  const [todayWords, streak] = await Promise.all([
    getTodayWordCount(profile.id),
    getWritingStreak(),
  ]);

  return (
    <AppShell>
      <PageHeader
        eyebrow={`Welcome to your studio, ${profile.display_name}`}
        title="The Author's Study. 🌙"
        copy="Your private moonlit writing room. Distraction free. Auto-saves every 4 seconds."
      />
      <AdminNav />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <WritingStudio
          stories={stories}
          todayWords={todayWords}
          streak={streak}
          displayName={profile.display_name}
        />
      </section>
    </AppShell>
  );
}
