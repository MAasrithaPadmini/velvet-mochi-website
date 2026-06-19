import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import crypto from "node:crypto";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceKey) {
  throw new Error("Missing Supabase env vars.");
}

const service = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const stamp = Date.now();
const adminEmail = `codex-admin-workflow-${stamp}@example.com`;
const adminPassword = `Velvet-${crypto.randomBytes(8).toString("base64url")}-Mochi!9`;
const storyTitle = `UI Workflow Test Story ${stamp}`;
const storySlug = `ui-workflow-test-story-${stamp}`;
const chapterTitle = `UI Workflow Test Chapter ${stamp}`;
const cleanup = [];
const results = [];
const cookieJar = new Map();

function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
}

function cookieHeader() {
  return [...cookieJar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function api(path, init = {}) {
  const headers = new Headers(init.headers ?? {});
  headers.set("Cookie", cookieHeader());
  if (!(init.body instanceof FormData) && init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${siteUrl}${path}`, { ...init, headers, redirect: "manual" });
}

try {
  const created = await service.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { display_name: "Codex Admin Workflow" }
  });
  if (created.error) throw created.error;
  const adminUserId = created.data.user.id;
  cleanup.push(async () => service.auth.admin.deleteUser(adminUserId));

  const profile = await service.from("profiles").upsert({
    id: adminUserId,
    display_name: "Codex Admin Workflow",
    role: "admin"
  });
  if (profile.error) throw profile.error;

  const browserClient = createBrowserClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return [...cookieJar.entries()].map(([name, value]) => ({ name, value }));
      },
      setAll(cookies) {
        cookies.forEach(({ name, value }) => {
          if (value) cookieJar.set(name, value);
          else cookieJar.delete(name);
        });
      }
    }
  });

  const signIn = await browserClient.auth.signInWithPassword({ email: adminEmail, password: adminPassword });
  record("Admin auth session for API/UI routes", !signIn.error && cookieJar.size > 0, signIn.error?.message ?? `${cookieJar.size} cookies set`);

  const dashboard = await api("/dashboard");
  record("Protected dashboard route allows admin session", dashboard.status === 200, `status ${dashboard.status}`);

  const storyCreate = await api("/api/admin/stories", {
    method: "POST",
    body: JSON.stringify({
      title: storyTitle,
      slug: storySlug,
      synopsis: "Created by the admin workflow verifier.",
      status: "draft",
      universe: "Workflow Verification",
      genre: "Dark romance",
      heat: "Slow burn"
    })
  });
  const storyCreateJson = await storyCreate.json();
  const story = storyCreateJson.story;
  record("Create Story via protected API used by UI", storyCreate.ok && Boolean(story?.id), storyCreateJson.error ?? "created");
  if (!story?.id) throw new Error(storyCreateJson.error ?? "Story create failed");
  cleanup.push(async () => service.from("stories").delete().eq("id", story.id));

  const storyEdit = await api(`/api/admin/stories/${story.id}`, {
    method: "PATCH",
    body: JSON.stringify({ synopsis: "Edited by the admin workflow verifier.", status: "published" })
  });
  const storyEditJson = await storyEdit.json();
  record("Edit Story via protected API used by UI", storyEdit.ok && storyEditJson.story?.status === "published", storyEditJson.error ?? "edited");

  const pngBytes = Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
    0x0d, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0xf8, 0xcf, 0xc0, 0xf0,
    0x1f, 0x00, 0x05, 0x00, 0x01, 0xff, 0x89, 0x99, 0x3d, 0x1d, 0x00, 0x00,
    0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
  ]);
  const coverPath = `${story.id}/workflow-cover-${stamp}.png`;
  const form = new FormData();
  form.append("bucket", "story-covers");
  form.append("path", coverPath);
  form.append("file", new Blob([pngBytes], { type: "image/png" }), "workflow-cover.png");
  const upload = await api("/api/admin/storage", { method: "POST", body: form });
  const uploadJson = await upload.json();
  record("Upload Story Cover Image via protected storage API", upload.ok && Boolean(uploadJson.publicUrl), uploadJson.error ?? "uploaded");
  cleanup.push(async () => service.storage.from("story-covers").remove([coverPath]));

  const coverSave = await api(`/api/admin/stories/${story.id}`, {
    method: "PATCH",
    body: JSON.stringify({ cover_url: uploadJson.publicUrl })
  });
  const coverSaveJson = await coverSave.json();
  record("Persist uploaded cover URL on story", coverSave.ok && coverSaveJson.story?.cover_url === uploadJson.publicUrl, coverSaveJson.error ?? "cover saved");

  const chapterCreate = await api("/api/admin/chapters", {
    method: "POST",
    body: JSON.stringify({
      story_id: story.id,
      title: chapterTitle,
      body: "Created through the admin chapter workflow verifier.",
      status: "draft",
      reading_minutes: 7
    })
  });
  const chapterCreateJson = await chapterCreate.json();
  const chapter = chapterCreateJson.chapter;
  record("Create Chapter via protected API used by UI", chapterCreate.ok && Boolean(chapter?.id), chapterCreateJson.error ?? "created");
  if (!chapter?.id) throw new Error(chapterCreateJson.error ?? "Chapter create failed");

  const chapterEdit = await api(`/api/admin/chapters/${chapter.id}`, {
    method: "PATCH",
    body: JSON.stringify({ title: `${chapterTitle} Edited`, body: "Edited chapter body.", reading_minutes: 9 })
  });
  const chapterEditJson = await chapterEdit.json();
  record("Edit Chapter via protected API used by UI", chapterEdit.ok && chapterEditJson.chapter?.title?.endsWith("Edited"), chapterEditJson.error ?? "edited");

  const publish = await api(`/api/admin/chapters/${chapter.id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "published" })
  });
  const publishJson = await publish.json();
  record("Publish Chapter", publish.ok && publishJson.chapter?.status === "published" && Boolean(publishJson.chapter?.published_at), publishJson.error ?? "published");

  const unpublish = await api(`/api/admin/chapters/${chapter.id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "draft" })
  });
  const unpublishJson = await unpublish.json();
  record("Unpublish Chapter", unpublish.ok && unpublishJson.chapter?.status === "draft" && !unpublishJson.chapter?.published_at, unpublishJson.error ?? "unpublished");

  const persistedStory = await service.from("stories").select("id, title, status, cover_url").eq("id", story.id).single();
  record("Supabase persistence: test story", !persistedStory.error && persistedStory.data?.title === storyTitle && Boolean(persistedStory.data?.cover_url), persistedStory.error?.message ?? "persisted");

  const persistedChapter = await service.from("chapters").select("id, title, status, story_id").eq("id", chapter.id).single();
  record("Supabase persistence: test chapter", !persistedChapter.error && persistedChapter.data?.story_id === story.id, persistedChapter.error?.message ?? "persisted");

  const deleteChapter = await api(`/api/admin/chapters/${chapter.id}`, { method: "DELETE" });
  const deleteChapterJson = await deleteChapter.json();
  record("Delete Chapter via protected API used by UI", deleteChapter.ok, deleteChapterJson.error ?? "deleted");

  const deleteStory = await api(`/api/admin/stories/${story.id}`, { method: "DELETE" });
  const deleteStoryJson = await deleteStory.json();
  record("Delete Story via protected API used by UI", deleteStory.ok, deleteStoryJson.error ?? "deleted");
} finally {
  for (const fn of cleanup.reverse()) {
    try {
      await fn();
    } catch {
      // Best-effort cleanup.
    }
  }
}

console.log(JSON.stringify({ passed: results.filter((item) => item.ok).length, failed: results.filter((item) => !item.ok).length, results }, null, 2));
process.exitCode = results.every((item) => item.ok) ? 0 : 1;
