import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const stories = [
  {
    slug: "vow-of-velvet-thorns",
    title: "Vow of Velvet Thorns",
    synopsis: "A cursed archivist, a ruthless duke, and a forbidden archive where every confession becomes a binding spell.",
    status: "published",
    universe: "The Thornlit Court",
    genre: "Gothic romance",
    heat: "Slow burn",
    cover: "from-burgundy via-plum to-black",
    rating: 4.9,
    readers: "42.8K",
    trigger_warnings: ["Possessive romance", "Power imbalance", "Curses", "Violence"],
    next_release: "Tonight, 11:30 PM",
    chapter_count: 3,
    progress: 74,
    characters: ["Seren Vale", "Dorian Ash", "Mira Nocturne"],
    mature: true
  },
  {
    slug: "honeyed-nightshade",
    title: "Honeyed Nightshade",
    synopsis: "She delivers rare teas to monsters in silk suits. One customer starts leaving roses, debts, and impossible choices.",
    status: "published",
    universe: "Moonlace District",
    genre: "Mafia fairytale",
    heat: "High tension",
    cover: "from-[#28101e] via-[#5c1730] to-[#0b0610]",
    rating: 4.8,
    readers: "31.2K",
    trigger_warnings: ["Stalking themes", "Mature situations", "Violence"],
    next_release: "Tomorrow, 9:00 PM",
    chapter_count: 2,
    progress: 39,
    characters: ["Liora Mae", "Cassian Voss", "Aunt Romy"],
    mature: true
  },
  {
    slug: "the-library-of-satin-sins",
    title: "The Library of Satin Sins",
    synopsis: "A private library opens only during rain, and its keeper remembers every secret her heart tries to forget.",
    status: "published",
    universe: "The Thornlit Court",
    genre: "Paranormal romance",
    heat: "Devoted obsession",
    cover: "from-[#100810] via-[#2c1231] to-[#8c2543]",
    rating: 5,
    readers: "88.6K",
    trigger_warnings: ["Dark themes", "Possession", "Grief", "Blood magic"],
    next_release: "Bonus epilogue Friday",
    chapter_count: 3,
    progress: 100,
    characters: ["Evelyn Rose", "Lucien Gray", "The Keeper"],
    mature: true
  }
];

const chapterBodies = [
  "Rain tapped the library windows as if every drop had been taught a secret rhythm.\n\nBeyond the glass, the moon hung low and silver, caught in the black branches of the rose garden.\n\nThe forbidden shelf breathed once, then opened.",
  "The candlelight leaned toward him before she did.\n\nSeren knew the archive was listening. She also knew Dorian would make the silence confess first.",
  "Every vow in the Thornlit Court had a price.\n\nTonight, hers wore black gloves and waited beside the rain-streaked window."
];

const seeded = [];

for (const story of stories) {
  const { data, error } = await supabase.from("stories").upsert(story, { onConflict: "slug" }).select("id, slug, title").single();
  if (error) throw new Error(`Story seed failed for ${story.slug}: ${error.message}`);
  seeded.push(data);

  for (let index = 0; index < Math.min(story.chapter_count, chapterBodies.length); index += 1) {
    const { error: chapterError } = await supabase.from("chapters").upsert(
      {
        story_id: data.id,
        number: index + 1,
        title: `Chapter ${index + 1}: ${["The Window Kept Breathing", "The Candle Chose Him", "A Vow in Black Gloves"][index]}`,
        body: chapterBodies[index],
        status: "published",
        reading_minutes: 10 + index,
        views: 1000 * (index + 1),
        published_at: new Date().toISOString()
      },
      { onConflict: "story_id,number" }
    );
    if (chapterError) throw new Error(`Chapter seed failed for ${story.slug} #${index + 1}: ${chapterError.message}`);
  }
}

console.log(JSON.stringify({ seededStories: seeded.length, seededChapters: seeded.reduce((sum, story) => {
  const source = stories.find((item) => item.slug === story.slug);
  return sum + (source?.chapter_count ?? 0);
}, 0) }, null, 2));
