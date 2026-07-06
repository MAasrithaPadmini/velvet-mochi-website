import { AppShell, PageHeader } from "@/components/app-shell";
import { listStories } from "@/lib/repositories";

export const metadata = {
  title: "Content Guide | Velvet Mochi",
  description: "What our content and trigger warning labels mean, so you can choose what to read with confidence.",
};

export const revalidate = 60;

// Known explanations for common warning labels. Any warning found on a
// story that isn't in this dictionary still displays, with a generic note.
const EXPLANATIONS: Record<string, string> = {
  "possessive romance": "The romantic lead displays controlling, jealous, or territorial behavior toward the love interest.",
  "power imbalance": "A meaningful difference in power, status, or authority between characters in the relationship.",
  "power dynamics": "A meaningful difference in power, status, or authority between characters in the relationship.",
  "violence": "Depictions of physical violence or conflict, ranging from brief to graphic.",
  "stalking themes": "A character surveils, follows, or pursues another without consent.",
  "mature situations": "Explicit or suggestive adult content intended for readers 18 and older.",
  "dark themes": "Emotionally heavy subject matter such as trauma, loss, or morally complex choices.",
  "possession": "Themes of supernatural or emotional possession/control over a character.",
  "grief": "On-page mourning, death of a character, or loss-related themes.",
  "blood magic": "Fantasy violence involving blood-based magic systems; not real-world gore.",
  "curses": "Fantasy elements involving curses, hexes, or magical consequences.",
};

function explain(tag: string): string {
  return EXPLANATIONS[tag.toLowerCase()] ?? "This story contains this theme — see the story's page for context.";
}

export default async function ContentGuidePage() {
  const stories = await listStories();
  const allTags = new Set<string>();
  stories.forEach((s) => s.trigger_warnings.forEach((w) => allTags.add(w)));
  const tags = Array.from(allTags).sort();

  return (
    <AppShell>
      <PageHeader eyebrow="Reader safety" title="Content Guide" />
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="glass rounded-[1.75rem] p-6 sm:p-10 space-y-6">
          <p className="text-sm leading-6 text-cream/68">
            Velvet Mochi is an 18+ dark romance platform. Every story lists specific content warnings
            on its own page. Below is what our current warning labels mean, so you can decide what&apos;s
            right for you before you start reading.
          </p>

          {tags.length === 0 ? (
            <p className="text-sm text-cream/55">No content warnings are currently listed on any published story.</p>
          ) : (
            <div className="space-y-4">
              {tags.map((tag) => (
                <div key={tag} className="rounded-2xl border border-rose/20 bg-rose/5 p-4">
                  <h2 className="font-display text-lg text-rose">{tag}</h2>
                  <p className="mt-1 text-sm leading-6 text-cream/68">{explain(tag)}</p>
                </div>
              ))}
            </div>
          )}

          <p className="text-sm leading-6 text-cream/68">
            All stories are fiction involving consenting adult characters. If you have questions about
            a specific story's content, feel free to{" "}
            <a href="/contact" className="text-champagne underline">reach out</a>.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
