import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { supabaseUrl } from "./env";

/**
 * Service-role client. Bypasses RLS — only for trusted server code
 * (e.g. /api/order-click writing orders + events). Never import from a Client Component.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing env var SUPABASE_SERVICE_ROLE_KEY.");

  return createClient<Database>(supabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
