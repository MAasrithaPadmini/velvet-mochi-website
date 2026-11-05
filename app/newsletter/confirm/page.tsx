import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell, PageHeader } from "@/components/app-shell";
import { SubscribeConfirm } from "@/components/subscribe-confirm";

export const metadata: Metadata = {
  title: "Confirm chapter alerts | Velvet Mochi",
  robots: { index: false, follow: false },
};

export default function ConfirmSubscriptionPage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Newsletter" title="Confirm your chapter alerts" />
      <section className="mx-auto max-w-lg px-4 pb-16 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <SubscribeConfirm />
        </Suspense>
      </section>
    </AppShell>
  );
}
