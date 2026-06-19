import { AppShell, PageHeader } from "@/components/app-shell";

export const metadata = {
  title: "Terms of Service | Velvet Mochi",
};

export default function TermsPage() {
  const updated = "June 16, 2026";
  return (
    <AppShell>
      <PageHeader eyebrow="Legal" title="Terms of Service" />
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="glass rounded-[1.75rem] p-6 sm:p-10 prose-velvet">
          <p className="text-sm text-cream/50 mb-8">Last updated: {updated}</p>

          <Section title="1. Acceptance of Terms">
            By accessing and using Velvet Mochi ('the Platform'), you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use this platform.
          </Section>

          <Section title="2. About the Platform">
            Velvet Mochi is a serialized dark romance fiction platform. All stories published here are works of fiction. Names, characters, places, and incidents are either products of the author's imagination or used fictitiously.
          </Section>

          <Section title="3. Age Requirement">
            This platform contains mature content intended for adults aged 18 and older. By using this platform, you confirm that you are at least 18 years of age. We reserve the right to terminate accounts of users found to be under 18.
          </Section>

          <Section title="4. User Accounts">
            You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to terminate accounts that violate these terms.
          </Section>

          <Section title="5. Content Ownership">
            All stories, chapters, characters, and creative content published on Velvet Mochi are the intellectual property of Padroha (the author). You may not reproduce, distribute, or create derivative works from any content on this platform without explicit written permission.
          </Section>

          <Section title="6. User Conduct">
            You agree not to:
            <ul className="mt-3 space-y-2 text-cream/70">
              <li>Copy or reproduce any content from this platform</li>
              <li>Use automated tools to scrape or download content</li>
              <li>Harass other users in comments or discussions</li>
              <li>Post spam or inappropriate comments</li>
              <li>Attempt to gain unauthorized access to any part of the platform</li>
              <li>Share your account with others</li>
            </ul>
          </Section>

          <Section title="7. Comments and User Content">
            By posting comments, you grant Velvet Mochi a non-exclusive license to display your content. We reserve the right to remove any comment that violates these terms or is deemed inappropriate without prior notice.
          </Section>

          <Section title="8. Newsletter">
            By subscribing to our newsletter, you consent to receive email updates about new chapters and announcements. You may unsubscribe at any time by contacting us.
          </Section>

          <Section title="9. Mature Content Warning">
            Stories on this platform contain dark romance themes including but not limited to: possessive relationships, power dynamics, violence, and other mature themes. All content involves fictional adult characters. Reader discretion is advised.
          </Section>

          <Section title="10. Disclaimer">
            The stories on Velvet Mochi are works of fiction created for entertainment purposes. The author does not condone or glorify any harmful behaviors depicted in fiction. All romantic scenarios involve consenting adult fictional characters.
          </Section>

          <Section title="11. Changes to Terms">
            We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
          </Section>

          <Section title="12. Contact">
            For any questions about these terms, please contact us through the author page or via our social media channels.
          </Section>
        </div>
      </section>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-2xl text-cream mb-3">{title}</h2>
      <div className="text-cream/70 leading-7 text-sm">{children}</div>
    </div>
  );
}
