import { AppShell, PageHeader } from "@/components/app-shell";

export const metadata = {
  title: "Privacy Policy | Velvet Mochi",
};

export default function PrivacyPage() {
  const updated = "June 16, 2026";
  return (
    <AppShell>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="glass rounded-[1.75rem] p-6 sm:p-10">
          <p className="text-sm text-cream/50 mb-8">Last updated: {updated}</p>

          <Section title="1. Information We Collect">
            <p>We collect the following information when you use Velvet Mochi:</p>
            <ul className="mt-3 space-y-2 text-cream/70">
              <li><strong className="text-cream/90">Account information:</strong> Email address, display name, and password (encrypted)</li>
              <li><strong className="text-cream/90">Reading data:</strong> Your reading progress, bookmarks, and chapter history</li>
              <li><strong className="text-cream/90">Comments:</strong> Any comments you post on chapters</li>
              <li><strong className="text-cream/90">Newsletter:</strong> Email address if you subscribe</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="mt-3 space-y-2 text-cream/70">
              <li>To provide and maintain your reading experience</li>
              <li>To save your reading progress across devices</li>
              <li>To send chapter notifications (only if subscribed)</li>
              <li>To display your bookmarks and reading history</li>
              <li>To improve the platform based on usage patterns</li>
            </ul>
          </Section>

          <Section title="3. Data Storage">
            Your data is stored securely using Supabase, a secure cloud database provider. We use industry-standard encryption and Row Level Security to ensure your data is protected and only accessible by you.
          </Section>

          <Section title="4. Cookies">
            We use essential cookies only to maintain your login session. We do not use tracking cookies or advertising cookies. No third-party advertisers have access to your data.
          </Section>

          <Section title="5. Data Sharing">
            We do not sell, trade, or share your personal information with third parties. Your email and personal data remain private and are never shared with advertisers or external companies.
          </Section>

          <Section title="6. Your Rights">
            <p>You have the right to:</p>
            <ul className="mt-3 space-y-2 text-cream/70">
              <li>Access your personal data at any time</li>
              <li>Request deletion of your account and data</li>
              <li>Unsubscribe from newsletters at any time</li>
              <li>Update your profile information</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us through our author page.</p>
          </Section>

          <Section title="7. Children's Privacy">
            Velvet Mochi is strictly for users aged 18 and older. We do not knowingly collect information from minors. If we discover a user is under 18, their account will be immediately terminated and their data deleted.
          </Section>

          <Section title="8. Newsletter">
            If you subscribe to our newsletter, your email is stored securely and used only to send chapter updates and announcements. You can unsubscribe at any time by contacting us directly.
          </Section>

          <Section title="9. Security">
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </Section>

          <Section title="10. Changes to This Policy">
            We may update this privacy policy from time to time. We will notify registered users of significant changes. Continued use of the platform after changes constitutes acceptance of the updated policy.
          </Section>

          <Section title="11. Contact Us">
            If you have questions about this privacy policy or your personal data, please contact us through our author page or social media channels.
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
