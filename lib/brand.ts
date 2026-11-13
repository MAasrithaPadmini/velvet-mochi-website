import { unstable_cache } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { SITE_URL } from "@/lib/site";

// Single source of truth for how the brand describes itself to search engines
// and AI assistants. Keep these sentences factual and consistent: the same
// wording on the site, in structured data, in llms.txt and on social profiles
// is what lets Google and AI tools recognise "Velvet Mochi" as one entity.

export const BRAND = {
  name: "Velvet Mochi",
  alternateNames: ["VelvetMochi", "velvetmochi.com", "Velvet Mochi by Padroha"],
  penName: "Padroha",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  email: "author.velvetmochi@gmail.com",
  shortDescription:
    "Velvet Mochi is a free online library of original serialized dark romance fiction, written by Indian author Padmini under the pen name Padroha.",
  longDescription:
    "Velvet Mochi (velvetmochi.com) is a free online library of original serialized dark romance fiction for adult readers (18+), written by Indian author Padmini under the pen name Padroha. New chapters of each story are released one by one. The stories centre on soft, curvy heroines and possessive, morally grey heroes, often in Indian settings. Every story is free to read; a free account adds bookmarks, reading progress and comments.",
  // Velvet Mochi is not a food brand; saying so helps AI answers disambiguate.
  disambiguation: "Velvet Mochi is a fiction website. It is not a bakery or a mochi dessert brand.",
} as const;

export type AuthorProfile = {
  name: string;
  tagline: string;
  bio: string;
  avatar_url: string | null;
  twitter: string | null;
  instagram: string | null;
  tiktok: string | null;
  goodreads: string | null;
  website: string | null;
};

// Cached for an hour; the author profile rarely changes and this runs on many pages.
export const getAuthorProfile = unstable_cache(
  async (): Promise<AuthorProfile | null> => {
    const svc = createServiceClient();
    if (!svc) return null;
    const { data } = await svc
      .from("author_profile")
      .select("name, tagline, bio, avatar_url, twitter, instagram, tiktok, goodreads, website")
      .eq("id", 1)
      .maybeSingle();
    return (data as AuthorProfile | null) ?? null;
  },
  ["author-profile-brand"],
  { revalidate: 3600 }
);

/** Public profile URLs (Instagram etc.) used as schema.org sameAs. */
export function socialUrls(profile: AuthorProfile | null): string[] {
  if (!profile) return [];
  return [profile.instagram, profile.twitter, profile.tiktok, profile.goodreads, profile.website]
    .filter((u): u is string => Boolean(u && /^https?:\/\//.test(u)))
    .filter((u) => !u.startsWith(SITE_URL));
}
