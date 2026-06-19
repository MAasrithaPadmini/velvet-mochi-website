import { Suspense } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Secure auth" title="Create your reader key." />
      <Suspense><AuthForm mode="register" /></Suspense>
    </AppShell>
  );
}
