import { Suspense } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { UnsubscribeForm } from "@/components/unsubscribe-form";

export default function UnsubscribePage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Newsletter" title="Unsubscribe" />
      <section className="mx-auto max-w-lg px-4 pb-16 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <UnsubscribeForm />
        </Suspense>
      </section>
    </AppShell>
  );
}
