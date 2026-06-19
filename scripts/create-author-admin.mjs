import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/create-author-admin.mjs author@example.com");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error(JSON.stringify({ ok: false, error: "Missing Supabase environment variables." }, null, 2));
  process.exit(1);
}

const service = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const password = `Velvet-${crypto.randomBytes(8).toString("base64url")}-Mochi!9`;

const userList = await service.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (userList.error) throw userList.error;

let action = "found";
let user = userList.data.users.find((item) => item.email?.toLowerCase() === email.toLowerCase()) ?? null;

if (!user) {
  const created = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: "Velvet Mochi Author" }
  });
  if (created.error) throw created.error;
  user = created.data.user;
  action = "created";
} else {
  const updated = await service.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
    user_metadata: {
      ...(user.user_metadata ?? {}),
      display_name: user.user_metadata?.display_name ?? "Velvet Mochi Author"
    }
  });
  if (updated.error) throw updated.error;
  user = updated.data.user;
  action = "updated_password";
}

const profile = await service
  .from("profiles")
  .upsert({
    id: user.id,
    display_name: "Velvet Mochi Author",
    role: "admin",
    favorite_genres: ["Dark romance", "Gothic romance", "Paranormal romance"]
  })
  .select("id, display_name, role")
  .single();

if (profile.error) throw profile.error;

const signedIn = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const signIn = await signedIn.auth.signInWithPassword({ email, password });
if (signIn.error) throw signIn.error;

const profileAsUser = await signedIn
  .from("profiles")
  .select("id, display_name, role")
  .eq("id", user.id)
  .single();

if (profileAsUser.error) throw profileAsUser.error;

console.log(
  JSON.stringify(
    {
      ok: true,
      action,
      email,
      userId: user.id,
      temporaryPassword: password,
      profile: profile.data,
      authSignIn: Boolean(signIn.data.session?.access_token),
      adminRoleVisibleToSignedInUser: profileAsUser.data.role === "admin",
      dashboardAccessExpected: profile.data.role === "admin" && profileAsUser.data.role === "admin"
    },
    null,
    2
  )
);
