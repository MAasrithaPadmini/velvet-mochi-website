import { PageHeader } from "@/components/app-shell";
import { ResetConfirmForm } from "./confirm-form";

export default function ResetPasswordConfirmPage() {
  return (
    <>
      <PageHeader eyebrow="New key" title="Choose a new password." />
      <section className="mx-auto max-w-xl px-4 pb-16 sm:px-6 lg:px-8">
        <ResetConfirmForm />
      </section>
    </>
  );
}
