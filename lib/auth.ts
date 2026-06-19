import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, role, avatar_url, favorite_genres, age_confirmed")
    .eq("id", auth.user.id)
    .single();

  return data as Profile | null;
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || !["author", "admin"].includes(profile.role)) {
    redirect("/login?next=/dashboard");
  }
  return profile;
}
