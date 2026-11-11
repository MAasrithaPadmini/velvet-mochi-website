import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign in | Velvet Mochi",
  robots: { index: false, follow: true },
  // Every ?next=... variant is the same page; point search engines at one URL.
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Secure auth" title="Return to the library." />
      <Suspense><AuthForm mode="login" /></Suspense>
    </AppShell>
  );
}
