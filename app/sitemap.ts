import type { MetadataRoute } from "next";
import { listStories, listChapters } from "@/lib/repositories";
import { SITE_URL } from "@/lib/site";

// lastModified must be the real date content changed. Reporting "now" on every
// request teaches Google to ignore this sitemap's dates, which slows down how
// quickly new chapters get crawled. Static info pages get no date at all.

function newest(...dates: (string | null | undefined)[]): Date | undefined {
  const times = dates.filter(Boolean).map((d) => new Date(d as string).getTime()).filter((t) => !Number.isNaN(t));
  return times.length ? new Date(Math.max(...times)) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const storyEntries: MetadataRoute.Sitemap = [];
  const chapterEntries: MetadataRoute.Sitemap = [];
  let siteUpdated: Date | undefined;

  try {
    const stories = await listStories();

    for (const story of stories) {
      const chapters = await listChapters(story.slug);
      let storyUpdated = newest((story as { updated_at?: string }).updated_at);

      for (const chapter of chapters) {
        const changed = newest((chapter as { updated_at?: string }).updated_at, chapter.published_at);
        if (changed && (!storyUpdated || changed > storyUpdated)) storyUpdated = changed;
        chapterEntries.push({
          url: `${SITE_URL}/stories/${story.slug}/chapters/${chapter.number}`,
          lastModified: changed,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }

      if (storyUpdated && (!siteUpdated || storyUpdated > siteUpdated)) siteUpdated = storyUpdated;
      storyEntries.push({
        url: `${SITE_URL}/stories/${story.slug}`,
        lastModified: storyUpdated,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch (error) {
    console.error("[sitemap] failed to load dynamic entries", error);
  }

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: siteUpdated, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/library`, lastModified: siteUpdated, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/schedule`, lastModified: siteUpdated, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/content-guide`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
  ];

  return [...staticEntries, ...storyEntries, ...chapterEntries];
}
