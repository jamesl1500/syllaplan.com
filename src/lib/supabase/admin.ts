import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Admin client using the Supabase secret key — bypasses RLS entirely.
 * Only for operations the anon/publishable key can't do (deleting an
 * auth.users row). Never import this outside a server action/route handler,
 * and never pass its results to the client.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not set — required to delete a user.");
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
