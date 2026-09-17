import type { MetadataRoute } from "next";
import { listStories, listChapters } from "@/lib/repositories";

const SITE_URL = "https://velvetmochi.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/library`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/content-guide`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/schedule`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    const stories = await listStories();

    for (const story of stories) {
      entries.push({
        url: `${SITE_URL}/stories/${story.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });

      const chapters = await listChapters(story.slug);
      for (const chapter of chapters) {
        entries.push({
          url: `${SITE_URL}/stories/${story.slug}/chapters/${chapter.number}`,
          lastModified: chapter.published_at ? new Date(chapter.published_at) : new Date(),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error("[sitemap] failed to load dynamic entries", error);
  }

  return entries;
}
