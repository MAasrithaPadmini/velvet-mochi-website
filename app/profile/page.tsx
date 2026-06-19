import { redirect } from "next/navigation";
import { AppShell, PageHeader } from "@/components/app-shell";
import { SignOutButton } from "@/components/auth-form";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/profile");

  const supabase = await createClient();
  if (!supabase) redirect("/login");

  const [progressRes, bookmarksRes, commentsRes] = await Promise.all([
    supabase.from("reading_progress").select("chapter_id, progress, updated_at").eq("user_id", profile.id),
    supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
    supabase.from("comments").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
  ]);

  const progress = progressRes.data ?? [];
  const chaptersStarted = progress.length;
  const chaptersFinished = progress.filter((p) => p.progress >= 90).length;
  const bookmarkCount = bookmarksRes.count ?? 0;
  const commentCount = commentsRes.count ?? 0;

  // Achievement check
  const achievements: { name: string; unlocked: boolean; copy: string }[] = [
    { name: "New Reader", unlocked: chaptersStarted >= 1, copy: "Read your first chapter" },
    { name: "Chapter Collector", unlocked: chaptersStarted >= 10, copy: "Started 10 chapters" },
    { name: "Story Devourer", unlocked: chaptersFinished >= 5, copy: "Finished 5 chapters" },
    { name: "Library Guardian", unlocked: bookmarkCount >= 5, copy: "Saved 5 bookmarks" },
    { name: "Velvet Elite", unlocked: chaptersFinished >= 20, copy: "Finished 20 chapters" },
    { name: "Whisperer", unlocked: commentCount >= 3, copy: "Left 3 comments" },
  ];

  return (
    <AppShell>
      <PageHeader eyebrow="Profile" title={profile.display_name} />

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 glass rounded-[1.5rem] p-5">
          <div>
            <div className="text-sm text-cream/55">Role</div>
            <div className="font-display text-2xl text-cream capitalize">{profile.role}</div>
          </div>
          <SignOutButton />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 sm:px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <Stat label="Chapters started" value={chaptersStarted} />
        <Stat label="Chapters finished" value={chaptersFinished} />
        <Stat label="Bookmarks" value={bookmarkCount} />
        <Stat label="Comments left" value={commentCount} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="mb-4 font-display text-3xl text-cream">Achievements</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => (
            <div
              key={a.name}
              className={`glass rounded-[1.5rem] p-5 ${a.unlocked ? "" : "opacity-45"}`}
            >
              <div className="font-display text-2xl text-cream">{a.name}</div>
              <p className="mt-2 text-sm text-cream/60">{a.copy}</p>
              <p className="mt-3 text-xs text-champagne">{a.unlocked ? "✓ Unlocked" : "Locked"}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-[1.5rem] p-5">
      <div className="text-3xl font-semibold text-champagne">{value}</div>
      <div className="mt-2 text-sm text-cream/60">{label}</div>
    </div>
  );
}
