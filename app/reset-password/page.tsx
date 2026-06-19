import { PageHeader } from "@/components/app-shell";
import { ResetPasswordForm } from "./reset-form";

export default function ResetPasswordPage() {
  return (
    <>
      <PageHeader eyebrow="Forgotten key" title="Reset your password." />
      <section className="mx-auto max-w-xl px-4 pb-16 sm:px-6 lg:px-8">
        <ResetPasswordForm />
      </section>
    </>
  );
}
