import { AdminNav, AppShell, PageHeader } from "@/components/app-shell";
import { AuthorProfileEditor } from "@/components/author-profile-editor";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export default async function AuthorEditorPage() {
  await requireAdmin();
  const svc = createServiceClient();
  const { data } = svc
    ? await svc.from("author_profile").select("*").eq("id", 1).maybeSingle()
    : { data: null };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Author profile"
        title="Edit your public author page."
        copy="Whatever you write here appears on /about for every reader."
      />
      <AdminNav />
      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <AuthorProfileEditor initial={data} />
      </section>
    </AppShell>
  );
}
