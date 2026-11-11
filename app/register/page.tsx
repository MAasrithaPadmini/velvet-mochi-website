import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Create an account | Velvet Mochi",
  robots: { index: false, follow: true },
  // Every ?next=... variant is the same page; point search engines at one URL.
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Secure auth" title="Create your reader key." />
      <Suspense><AuthForm mode="register" /></Suspense>
    </AppShell>
  );
}
