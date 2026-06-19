import { AppShell, PageHeader } from "@/components/app-shell";
import { LibrarySearch } from "@/components/library-search";
import { listStories } from "@/lib/repositories";
import { getCurrentProfile } from "@/lib/auth";

export const revalidate = 30;

export default async function LibraryPage() {
  const profile = await getCurrentProfile();
  const isAdmin = profile && (profile.role === "admin" || profile.role === "author");
  const stories = await listStories({ includeDrafts: Boolean(isAdmin) });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Digital library"
        title="Search the moonlit shelves."
        copy="Browse stories by universe, genre, heat, and content warnings. Tap any cover to enter its world."
      />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {stories.length === 0 ? (
          <div className="glass rounded-[1.75rem] p-8 text-center">
            <p className="text-cream/65">The shelves are still being prepared. Check back soon.</p>
          </div>
        ) : (
          <LibrarySearch stories={stories} />
        )}
      </section>
    </AppShell>
  );
}
