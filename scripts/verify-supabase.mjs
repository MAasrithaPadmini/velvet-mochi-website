import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const requiredTables = [
  "profiles",
  "stories",
  "chapters",
  "reading_progress",
  "bookmarks",
  "comments",
  "notifications",
  "newsletter_subscribers"
];
const requiredViews = ["chapter_library"];
const requiredBuckets = ["story-covers", "character-art", "moodboards", "author-assets"];

const results = [];
const missingTables = [];
const missingBuckets = [];
const cleanup = [];

function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
}

function isMissingRelation(error) {
  return error?.code === "42P01" || /relation .* does not exist/i.test(error?.message ?? "");
}

async function main() {
  record("Environment: NEXT_PUBLIC_SUPABASE_URL", Boolean(url), url ? "present" : "missing");
  record("Environment: NEXT_PUBLIC_SUPABASE_ANON_KEY", Boolean(anonKey), anonKey ? "present" : "missing");
  record("Environment: SUPABASE_SERVICE_ROLE_KEY", Boolean(serviceKey), serviceKey ? "present" : "missing");

  if (!url || !anonKey) {
    print();
    process.exitCode = 1;
    return;
  }

  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const service = serviceKey
    ? createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      })
    : null;

  const sessionCheck = await anon.auth.getSession();
  record("Auth connection", !sessionCheck.error, sessionCheck.error?.message ?? "anon auth client reachable");

  if (!service) {
    record("Service role connection", false, "SUPABASE_SERVICE_ROLE_KEY required for admin verification");
    print();
    process.exitCode = 1;
    return;
  }

  const usersCheck = await service.auth.admin.listUsers({ page: 1, perPage: 1 });
  record("Auth admin connection", !usersCheck.error, usersCheck.error?.message ?? "service auth admin reachable");

  for (const table of requiredTables) {
    const { error, count } = await service.from(table).select("*", { count: "exact", head: true });
    if (error) {
      if (isMissingRelation(error)) missingTables.push(table);
      record(`Database table: ${table}`, false, `${error.code ?? "error"} ${error.message}`);
    } else {
      record(`Database table: ${table}`, true, `${count ?? 0} rows`);
    }
  }

  for (const view of requiredViews) {
    const { error } = await service.from(view).select("*", { head: true, count: "exact" });
    if (error) {
      if (isMissingRelation(error)) missingTables.push(view);
      record(`Database view: ${view}`, false, `${error.code ?? "error"} ${error.message}`);
    } else {
      record(`Database view: ${view}`, true, "reachable");
    }
  }

  const buckets = await service.storage.listBuckets();
  record("Storage connection", !buckets.error, buckets.error?.message ?? "bucket list reachable");
  const bucketNames = new Set((buckets.data ?? []).map((bucket) => bucket.name));
  for (const bucket of requiredBuckets) {
    const exists = bucketNames.has(bucket);
    if (!exists) missingBuckets.push(bucket);
    record(`Storage bucket: ${bucket}`, exists, exists ? "exists" : "missing");
  }

  const stamp = Date.now();
  const testEmail = `codex-verify-${stamp}@example.com`;
  const testPassword = `Velvet-${stamp}-Mochi!`;
  let testUserId = null;
  let testStoryId = null;
  let testChapterId = null;

  try {
    const createUser = await service.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { display_name: "Codex Verification Reader" }
    });
    testUserId = createUser.data.user?.id ?? null;
    record("Auth test user create", !createUser.error && Boolean(testUserId), createUser.error?.message ?? "created");

    if (testUserId) {
      cleanup.push(async () => {
        await service.auth.admin.deleteUser(testUserId);
      });
      await service.from("profiles").upsert({
        id: testUserId,
        display_name: "Codex Verification Reader",
        role: "reader"
      });
    }

    const storyInsert = await service
      .from("stories")
      .insert({
        slug: `codex-verify-${stamp}`,
        title: "Codex Verification Story",
        synopsis: "Temporary CRUD verification story.",
        status: "draft",
        universe: "Verification",
        genre: "Dark romance",
        heat: "Slow burn",
        trigger_warnings: [],
        characters: [],
        mature: true
      })
      .select("id, slug")
      .single();
    testStoryId = storyInsert.data?.id ?? null;
    record("Story CRUD: create", !storyInsert.error && Boolean(testStoryId), storyInsert.error?.message ?? "created");

    if (testStoryId) {
      cleanup.push(async () => {
        await service.from("stories").delete().eq("id", testStoryId);
      });
      const storyUpdate = await service.from("stories").update({ status: "published" }).eq("id", testStoryId).select("id").single();
      record("Story CRUD: update", !storyUpdate.error, storyUpdate.error?.message ?? "updated");
      const storyRead = await service.from("stories").select("id").eq("id", testStoryId).single();
      record("Story CRUD: read", !storyRead.error, storyRead.error?.message ?? "read");
    }

    if (testStoryId) {
      const chapterInsert = await service
        .from("chapters")
        .insert({
          story_id: testStoryId,
          number: 1,
          title: "Codex Verification Chapter",
          body: "Temporary chapter body.",
          status: "published",
          published_at: new Date().toISOString()
        })
        .select("id")
        .single();
      testChapterId = chapterInsert.data?.id ?? null;
      record("Chapter CRUD: create", !chapterInsert.error && Boolean(testChapterId), chapterInsert.error?.message ?? "created");

      if (testChapterId) {
        cleanup.push(async () => {
          await service.from("chapters").delete().eq("id", testChapterId);
        });
        const chapterUpdate = await service.from("chapters").update({ views: 1 }).eq("id", testChapterId).select("id").single();
        record("Chapter CRUD: update", !chapterUpdate.error, chapterUpdate.error?.message ?? "updated");
        const chapterRead = await service.from("chapters").select("id").eq("id", testChapterId).single();
        record("Chapter CRUD: read", !chapterRead.error, chapterRead.error?.message ?? "read");
      }
    }

    const anonStoryInsert = await anon.from("stories").insert({
      slug: `anon-rls-${stamp}`,
      title: "Anon RLS Probe",
      synopsis: "Should fail.",
      status: "draft"
    });
    record("RLS: anonymous story insert blocked", Boolean(anonStoryInsert.error), anonStoryInsert.error ? "blocked" : "unexpectedly allowed");

    const anonPublishedRead = await anon.from("stories").select("id").eq("status", "published").limit(1);
    record("RLS: anonymous published story read", !anonPublishedRead.error, anonPublishedRead.error?.message ?? "allowed");

    const newsletterEmail = `codex-newsletter-${stamp}@example.com`;
    const newsletterInsert = await anon.from("newsletter_subscribers").insert({ email: newsletterEmail, status: "subscribed" });
    record("RLS: anonymous newsletter insert", !newsletterInsert.error, newsletterInsert.error?.message ?? "allowed");
    cleanup.push(async () => {
      await service.from("newsletter_subscribers").delete().eq("email", newsletterEmail);
    });

    const signIn = await anon.auth.signInWithPassword({ email: testEmail, password: testPassword });
    record("Auth sign-in", !signIn.error, signIn.error?.message ?? "signed in");

    if (!signIn.error && testStoryId && testChapterId) {
      const bookmark = await anon
        .from("bookmarks")
        .insert({ story_id: testStoryId, chapter_id: testChapterId, label: "Verification bookmark", user_id: testUserId })
        .select("id")
        .single();
      record("Bookmarks persistence", !bookmark.error, bookmark.error?.message ?? "created");
      if (bookmark.data?.id) {
        cleanup.push(async () => {
          await service.from("bookmarks").delete().eq("id", bookmark.data.id);
        });
      }

      const progress = await anon
        .from("reading_progress")
        .upsert({ story_id: testStoryId, chapter_id: testChapterId, progress: 42, user_id: testUserId })
        .select("progress")
        .single();
      record("Reading progress persistence", !progress.error && progress.data?.progress === 42, progress.error?.message ?? "saved");
      cleanup.push(async () => {
        await service.from("reading_progress").delete().eq("user_id", testUserId).eq("chapter_id", testChapterId);
      });

      const comment = await anon
        .from("comments")
        .insert({ story_id: testStoryId, chapter_id: testChapterId, body: "Verification comment", user_id: testUserId })
        .select("id")
        .single();
      record("Comments persistence", !comment.error, comment.error?.message ?? "created");
      if (comment.data?.id) {
        cleanup.push(async () => {
          await service.from("comments").delete().eq("id", comment.data.id);
        });
      }

      const notificationInsert = await service
        .from("notifications")
        .insert({ user_id: testUserId, title: "Verification notification", body: "Temporary notification." })
        .select("id")
        .single();
      record("Notifications: create", !notificationInsert.error, notificationInsert.error?.message ?? "created");
      if (notificationInsert.data?.id) {
        cleanup.push(async () => {
          await service.from("notifications").delete().eq("id", notificationInsert.data.id);
        });
        const notificationRead = await anon.from("notifications").select("id, title").eq("id", notificationInsert.data.id).single();
        record("Notifications: authenticated read", !notificationRead.error, notificationRead.error?.message ?? "read");
      }
    }

    const anonBookmark = await createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
      .from("bookmarks")
      .insert({ story_id: testStoryId, chapter_id: testChapterId, label: "Should fail", user_id: testUserId });
    record("RLS: anonymous bookmark insert blocked", Boolean(anonBookmark.error), anonBookmark.error ? "blocked" : "unexpectedly allowed");
  } finally {
    for (const fn of cleanup.reverse()) {
      try {
        await fn();
      } catch {
        // Best-effort cleanup; details are not secret but not useful for the summary.
      }
    }
  }

  print({ missingTables: [...new Set(missingTables)], missingBuckets });
  process.exitCode = results.every((result) => result.ok) ? 0 : 1;
}

function print(extra = {}) {
  const summary = {
    passed: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok).length,
    results,
    ...extra
  };
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  record("Verifier crashed", false, error?.message ?? String(error));
  print();
  process.exitCode = 1;
});
