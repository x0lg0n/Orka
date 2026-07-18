import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | null = null;

export function getWalletUsersClient() {
  if (!client) {
    const url =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Missing Supabase URL or SUPABASE_SERVICE_ROLE_KEY for auth-v2");
    }
    client = createClient(url, key);
  }
  return client;
}
