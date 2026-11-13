import { BRAND } from "@/lib/brand";
import { listStories } from "@/lib/repositories";
import { SITE_URL } from "@/lib/site";
import { excerpt } from "@/lib/plain-text";
import { storyStatusLabel } from "@/lib/chapter-label";

// /llms.txt: a plain-text guide to the site for AI assistants and AI search
// (see llmstxt.org). Built from live data so new stories appear automatically.
export const revalidate = 3600;

export async function GET() {
  const stories = await listStories().catch(() => []);

  const storyLines = stories.length
    ? stories
        .map(
          (s) =>
            `- [${s.title}](${SITE_URL}/stories/${s.slug}): ${s.genre}, ${s.chapter_count} chapters, ${storyStatusLabel(
              s.status
            ).toLowerCase()}. ${excerpt(s.synopsis, 220)}`
        )
        .join("\n")
    : "- See the library for the current list of stories.";

  const body = `# ${BRAND.name}

> ${BRAND.shortDescription}

${BRAND.longDescription}

${BRAND.disambiguation}

Key facts:
- Website: ${SITE_URL}
- Author: ${BRAND.authorName} (India)
- Format: original serialized fiction, released chapter by chapter
- Genre: dark romance, slow burn, possessive romance; Indian settings
- Audience: adults 18+; every story lists content warnings
- Price: free to read; free account for bookmarks, progress and comments
- Contact: ${BRAND.email}

## Stories

${storyLines}

## Pages

- [Library](${SITE_URL}/library): every story with genre, chapter count and status
- [About the author](${SITE_URL}/about): ${BRAND.authorName}
- [FAQ](${SITE_URL}/faq): what Velvet Mochi is, pricing, schedule, accounts
- [Release schedule](${SITE_URL}/schedule): how often each story updates
- [Content guide](${SITE_URL}/content-guide): what each content warning means
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
