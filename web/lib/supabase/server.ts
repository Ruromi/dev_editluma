/**
 * Server-side Supabase client.
 * Uses SUPABASE_SERVICE_ROLE_KEY — NEVER expose this to the browser.
 * Only import this file in Server Components, Route Handlers, or Server Actions.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

/** Schema helper — returns `dev` in dev, `public` in prod */
export function dbSchema(): string {
  return process.env.SUPABASE_SCHEMA ?? "dev";
}
