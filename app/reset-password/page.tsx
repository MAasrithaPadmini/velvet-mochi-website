import { ResetPasswordForm } from "./reset-form";

export default function ResetPasswordPage() {
  return (
    <div className="pt-32 pb-16">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <p className="text-xs uppercase tracking-[.28em] text-champagne/70">
          Forgotten key
        </p>
        <h1 className="mt-3 font-display text-5xl text-cream">
          Reset your password.
        </h1>
        <div className="mt-8">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}