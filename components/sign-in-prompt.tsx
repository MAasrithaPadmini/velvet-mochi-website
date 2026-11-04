import Link from "next/link";
import { AppShell, PageHeader } from "@/components/app-shell";

// Shown on private pages (bookshelf, profile) to logged-out visitors.
// Rendering this instead of redirecting to /login stops search engines from
// reporting every menu link as "Page with redirect".
export function SignInPrompt({ title, copy, next }: { title: string; copy: string; next: string }) {
  const nextParam = encodeURIComponent(next);
  return (
    <AppShell>
      <PageHeader eyebrow="Members only" title={title} copy={copy} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass flex flex-col gap-3 rounded-[1.75rem] p-8 sm:flex-row sm:items-center">
          <Link
            href={`/login?next=${nextParam}`}
            rel="nofollow"
            className="rounded-full bg-champagne px-6 py-3 text-center font-semibold text-velvet"
          >
            Sign in
          </Link>
          <Link
            href={`/register?next=${nextParam}`}
            rel="nofollow"
            className="rounded-full border border-cream/15 px-6 py-3 text-center text-cream/85"
          >
            Create a free account
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
