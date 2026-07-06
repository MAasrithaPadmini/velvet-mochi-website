import { AppShell, PageHeader } from "@/components/app-shell";
import { createServiceClient } from "@/lib/supabase/service";
import { Mail } from "lucide-react";

export const metadata = {
  title: "Contact & Support | Velvet Mochi",
  description: "Get in touch with Velvet Mochi for support, questions, or to report copyright infringement or abuse.",
};

export const revalidate = 30;

async function getAuthorEmail(): Promise<string | null> {
  const svc = createServiceClient();
  if (!svc) return null;
  const { data } = await svc.from("author_profile").select("email").eq("id", 1).maybeSingle();
  return (data as { email: string | null } | null)?.email ?? null;
}

export default async function ContactPage() {
  const email = await getAuthorEmail();

  return (
    <AppShell>
      <PageHeader eyebrow="Support" title="Contact & Support" />
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="glass rounded-[1.75rem] p-6 sm:p-10 prose-velvet space-y-8">
          <div>
            <h2 className="font-display text-2xl text-cream mb-3">General questions & feedback</h2>
            <p className="text-cream/70 leading-7 text-sm">
              Have a question, found a bug, or just want to say hi? Reach out any time.
            </p>
            {email ? (
              <a
                href={`mailto:${email}`}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-champagne px-5 py-2.5 font-semibold text-velvet"
              >
                <Mail size={16} /> {email}
              </a>
            ) : (
              <p className="mt-4 text-sm text-cream/50">
                Contact email is not yet configured for this platform.
              </p>
            )}
          </div>

          <div>
            <h2 className="font-display text-2xl text-cream mb-3">Report copyright infringement</h2>
            <p className="text-cream/70 leading-7 text-sm">
              If you believe content on Velvet Mochi infringes your copyright, please email us with:
            </p>
            <ul className="mt-3 space-y-2 text-cream/70 text-sm">
              <li>A description of the copyrighted work you believe has been infringed</li>
              <li>The exact URL(s) on Velvet Mochi where the material is located</li>
              <li>Your contact information</li>
              <li>A statement that you have a good-faith belief the use is unauthorized</li>
            </ul>
            <p className="mt-3 text-cream/70 leading-7 text-sm">
              We take copyright seriously and will review and respond to all valid reports promptly.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-cream mb-3">Report abuse or harassment</h2>
            <p className="text-cream/70 leading-7 text-sm">
              If you encounter harassment, spam, or abusive behavior in comments or elsewhere on the
              platform, please email us with a link to the content and a brief description. We
              review all reports and take action in line with our{" "}
              <a href="/terms" className="text-champagne underline">Terms of Service</a>.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-cream mb-3">Account & data requests</h2>
            <p className="text-cream/70 leading-7 text-sm">
              You can change your password or delete your account any time from your{" "}
              <a href="/profile" className="text-champagne underline">profile page</a>. For any
              other data requests, see our{" "}
              <a href="/privacy" className="text-champagne underline">Privacy Policy</a> or contact
              us directly.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
