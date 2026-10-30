import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/database.types";

/**
 * Service-role client. Bypasses RLS. Allowed callers, by design:
 *   - Stripe webhook (writes subscriptions)
 *   - account deletion (auth.admin.deleteUser)
 *   - Pro share-link reads (token validated first)
 * Nothing else. Never import from a client component.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_KEY is not set");
  return createSupabaseClient<Database>(publicEnv.supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function adminConfigured() {
  return Boolean(process.env.SUPABASE_SERVICE_KEY);
}
