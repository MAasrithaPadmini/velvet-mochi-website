import { Suspense } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Secure auth" title="Return to the library." />
      <Suspense><AuthForm mode="login" /></Suspense>
    </AppShell>
  );
}
