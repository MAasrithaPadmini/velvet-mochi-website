import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Chapter, Story } from "@/lib/types";

const STORY_COLS =
  "id, slug, title, synopsis, status, universe, genre, heat, cover_url, cover, rating, readers, trigger_warnings, next_release, chapter_count, progress, characters, mature";

export async function listStories({ includeDrafts = false } = {}): Promise<Story[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase.from("stories").select(STORY_COLS).order("updated_at", { ascending: false });
  if (!includeDrafts) query = query.eq("status", "published");

  const { data, error } = await query;
  if (error) {
    console.error("[listStories]", error.message);
    return [];
  }
  return (data ?? []) as Story[];
}

export async function getStory(slug: string): Promise<Story | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("stories").select(STORY_COLS).eq("slug", slug).single();
  if (error) return null;
  return data as Story;
}

export async function listChapters(storySlug?: string, includeDrafts = false): Promise<Chapter[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase.from("chapter_library").select("*").order("number", { ascending: true });
  if (storySlug) query = query.eq("story_slug", storySlug);
  if (!includeDrafts) query = query.eq("status", "published");

  const { data, error } = await query;
  if (error) {
    console.error("[listChapters]", error.message);
    return [];
  }
  return (data ?? []) as Chapter[];
}

export async function listAllChaptersForAdmin(storySlug?: string): Promise<Chapter[]> {
  return listChapters(storySlug, true);
}

export async function getChapter(storySlug: string, number: number): Promise<Chapter | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("chapter_library")
    .select("*")
    .eq("story_slug", storySlug)
    .eq("number", number)
    .single();
  if (error) return null;
  return data as Chapter;
}

export async function getDashboardMetrics() {
  const svc = createServiceClient();
  if (!svc) {
    return {
      totalStories: 0,
      publishedStories: 0,
      totalChapters: 0,
      publishedChapters: 0,
      scheduledChapters: 0,
      draftChapters: 0,
      totalViews: 0,
      subscribers: 0,
      activeReaders: 0,
      totalComments: 0,
    };
  }

  const [storiesAll, storiesPub, chaptersAll, chaptersPub, chaptersSched, chaptersDraft, subs, views, progress, comments] = await Promise.all([
    svc.from("stories").select("*", { count: "exact", head: true }),
    svc.from("stories").select("*", { count: "exact", head: true }).eq("status", "published"),
    svc.from("chapters").select("*", { count: "exact", head: true }),
    svc.from("chapters").select("*", { count: "exact", head: true }).eq("status", "published"),
    svc.from("chapters").select("*", { count: "exact", head: true }).eq("status", "scheduled"),
    svc.from("chapters").select("*", { count: "exact", head: true }).eq("status", "draft"),
    svc.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("status", "subscribed"),
    svc.from("chapters").select("views"),
    svc.from("reading_progress").select("user_id").gte("updated_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    svc.from("comments").select("*", { count: "exact", head: true }),
  ]);

  const totalViews = (views.data ?? []).reduce((sum, row) => sum + (row.views ?? 0), 0);
  const activeReaders = new Set((progress.data ?? []).map((r) => r.user_id)).size;

  return {
    totalStories: storiesAll.count ?? 0,
    publishedStories: storiesPub.count ?? 0,
    totalChapters: chaptersAll.count ?? 0,
    publishedChapters: chaptersPub.count ?? 0,
    scheduledChapters: chaptersSched.count ?? 0,
    draftChapters: chaptersDraft.count ?? 0,
    totalViews,
    subscribers: subs.count ?? 0,
    activeReaders,
    totalComments: comments.count ?? 0,
  };
}
