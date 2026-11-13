import { AppShell, PageHeader } from "@/components/app-shell";
import { BRAND } from "@/lib/brand";
import { faqGraph } from "@/lib/structured-data";
import { JsonLd } from "@/components/json-ld";

export const metadata = {
  title: "FAQ | Velvet Mochi",
  description:
    "What is Velvet Mochi, who writes it, is it free, and how often chapters come out: answers about the Velvet Mochi dark romance library.",
  alternates: { canonical: "/faq" },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Velvet Mochi?",
    a: BRAND.longDescription,
  },
  {
    q: "Who writes the stories on Velvet Mochi?",
    a: "Every story on Velvet Mochi is written by Padmini, an Indian author. You can read more about her on the About page.",
  },
  {
    q: "What kind of stories are on Velvet Mochi?",
    a: "Original serialized dark romance for adults: slow-burn and possessive romances with soft, curvy heroines and morally grey heroes, many set in India. Each story page lists its genre and content warnings.",
  },
  {
    q: "Is Velvet Mochi a mochi or dessert brand?",
    a: BRAND.disambiguation + " Velvet Mochi is the brand of author Padmini, and the site is velvetmochi.com.",
  },
  {
    q: "Is Velvet Mochi free to read?",
    a: "Yes. All published chapters are free to read. Creating a free account lets you bookmark stories and pick up where you left off.",
  },
  {
    q: "Do I need an account to read?",
    a: "No — you can read any published chapter without an account. An account just unlocks your bookshelf, reading progress, and the ability to comment.",
  },
  {
    q: "How often do new chapters come out?",
    a: "Update frequency varies by story. Check a story's page for its chapter count and status, or see the Release Schedule page for the current posting rhythm.",
  },
  {
    q: "Why do I see an age verification prompt?",
    a: "Velvet Mochi hosts mature, 18+ dark romance fiction. The age gate is a one-time confirmation per device, in line with our Terms of Service.",
  },
  {
    q: "How do I know what's in a story before reading?",
    a: "Every story page lists its content/trigger warnings. See our Content Guide page for what each warning label means.",
  },
  {
    q: "Can I request a chapter release date?",
    a: "Chapters go up based on the author's writing schedule. Following via account bookmark or newsletter is the best way to know the moment a new chapter drops.",
  },
  {
    q: "How do I report a bug, copyright issue, or abuse?",
    a: "Visit the Contact & Support page — it covers general questions, copyright reports, and abuse reports with what to include.",
  },
  {
    q: "Can I delete my account and data?",
    a: "Yes, any time. Go to your Profile page → Account settings → Delete account. This permanently removes your account, bookshelf, bookmarks, and comments.",
  },
  {
    q: "Is this fan fiction or original fiction?",
    a: "All stories on Velvet Mochi are original fiction, created by the author. Characters and settings are not based on existing copyrighted works.",
  },
];

export default function FaqPage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Help" title="Frequently Asked Questions" />
      <JsonLd data={faqGraph(FAQS)} />
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="glass rounded-[1.75rem] p-6 sm:p-10 space-y-6">
          {FAQS.map((item) => (
            <div key={item.q} className="border-b border-cream/8 pb-6 last:border-0 last:pb-0">
              <h2 className="font-display text-xl text-cream mb-2">{item.q}</h2>
              <p className="text-sm leading-6 text-cream/68">{item.a}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-cream/50">
          Didn&apos;t find your answer?{" "}
          <a href="/contact" className="text-champagne underline">Contact us</a>.
        </p>
      </section>
    </AppShell>
  );
}
