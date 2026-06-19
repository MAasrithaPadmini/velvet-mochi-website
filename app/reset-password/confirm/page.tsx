import { ResetConfirmForm } from "./confirm-form";

export default function ResetPasswordConfirmPage() {
  return (
    <div className="pt-32 pb-16">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <p className="text-xs uppercase tracking-[.28em] text-champagne/70">New key</p>
        <h1 className="mt-3 font-display text-5xl text-cream">Choose a new password.</h1>
        <div className="mt-8">
          <ResetConfirmForm />
        </div>
      </div>
    </div>
  );
}
