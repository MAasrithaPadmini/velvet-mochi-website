import { BRAND, type AuthorProfile, socialUrls } from "@/lib/brand";
import { SITE_URL } from "@/lib/site";
import { chapterLabel } from "@/lib/chapter-label";
import { excerpt } from "@/lib/plain-text";
import type { Chapter, Story } from "@/lib/types";

// schema.org JSON-LD builders. Stable @id values let Google and AI crawlers join
// the pieces (site -> organisation -> author -> books -> chapters) into one entity graph.

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const AUTHOR_ID = `${SITE_URL}/about#author`;

type Json = Record<string, unknown>;

export function authorNode(profile: AuthorProfile | null): Json {
  const sameAs = socialUrls(profile);
  return {
    "@type": "Person",
    "@id": AUTHOR_ID,
    name: profile?.name || "Padmini",
    alternateName: BRAND.penName,
    url: `${SITE_URL}/about`,
    jobTitle: "Author",
    description: profile?.tagline || "Author of moonlit dark romance",
    image: profile?.avatar_url || undefined,
    worksFor: { "@id": ORG_ID },
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export function siteGraph(profile: AuthorProfile | null): Json {
  const sameAs = socialUrls(profile);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: SITE_URL,
        // Google uses this for the site name shown above results.
        name: BRAND.name,
        alternateName: BRAND.alternateNames,
        description: BRAND.shortDescription,
        inLanguage: "en",
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: BRAND.name,
        alternateName: BRAND.alternateNames,
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: BRAND.logo, width: 512, height: 512 },
        description: BRAND.longDescription,
        email: BRAND.email,
        founder: { "@id": AUTHOR_ID },
        sameAs: sameAs.length ? sameAs : undefined,
      },
      authorNode(profile),
    ],
  };
}

function breadcrumb(items: { name: string; url: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function storyUrl(story: Pick<Story, "slug">) {
  return `${SITE_URL}/stories/${story.slug}`;
}

function bookNode(story: Story): Json {
  return {
    "@type": "Book",
    "@id": `${storyUrl(story)}#book`,
    name: story.title,
    url: storyUrl(story),
    description: excerpt(story.synopsis, 300) || undefined,
    image: story.cover_url || undefined,
    genre: [story.genre, "Dark romance", "Serialized fiction"].filter(Boolean),
    inLanguage: "en",
    bookFormat: "https://schema.org/EBook",
    isAccessibleForFree: true,
    audience: { "@type": "PeopleAudience", suggestedMinAge: 18 },
    contentRating: "Mature (18+)",
    author: { "@id": AUTHOR_ID },
    publisher: { "@id": ORG_ID },
  };
}

export function storyGraph(story: Story, chapters: Pick<Chapter, "number" | "title" | "published_at">[]): Json {
  const published = chapters.filter((c) => c.published_at);
  const first = published[0]?.published_at;
  const last = published[published.length - 1]?.published_at;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...bookNode(story),
        datePublished: first || undefined,
        dateModified: last || undefined,
        hasPart: chapters.slice(0, 500).map((c) => ({
          "@type": "Chapter",
          name: chapterLabel(c),
          position: c.number,
          url: `${storyUrl(story)}/chapters/${c.number}`,
        })),
      },
      breadcrumb([
        { name: BRAND.name, url: SITE_URL },
        { name: "Library", url: `${SITE_URL}/library` },
        { name: story.title, url: storyUrl(story) },
      ]),
    ],
  };
}

export function chapterGraph(story: Story, chapter: Chapter): Json {
  const url = `${storyUrl(story)}/chapters/${chapter.number}`;
  const label = chapterLabel(chapter);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Chapter",
        "@id": `${url}#chapter`,
        name: label,
        headline: `${label} – ${story.title}`,
        url,
        position: chapter.number,
        description: excerpt(chapter.body, 200) || undefined,
        datePublished: chapter.published_at || undefined,
        dateModified: (chapter as { updated_at?: string }).updated_at || chapter.published_at || undefined,
        inLanguage: "en",
        isAccessibleForFree: true,
        image: story.cover_url || undefined,
        author: { "@id": AUTHOR_ID },
        publisher: { "@id": ORG_ID },
        isPartOf: { "@type": "Book", "@id": `${storyUrl(story)}#book`, name: story.title, url: storyUrl(story) },
      },
      breadcrumb([
        { name: BRAND.name, url: SITE_URL },
        { name: story.title, url: storyUrl(story) },
        { name: label, url },
      ]),
    ],
  };
}

export function faqGraph(faqs: { q: string; a: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function aboutGraph(profile: AuthorProfile | null): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${SITE_URL}/about`,
    name: `About ${profile?.name || "the author"} | ${BRAND.name}`,
    isPartOf: { "@id": SITE_ID },
    mainEntity: authorNode(profile),
  };
}
