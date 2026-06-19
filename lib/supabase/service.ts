import { createClient } from "@supabase/supabase-js";
import { supabaseServiceRoleKey, supabaseUrl } from "@/lib/supabase/config";

export function createServiceClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
