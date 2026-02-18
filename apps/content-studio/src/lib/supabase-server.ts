import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseClient(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error(
      "Chybí env proměnné: NEXT_PUBLIC_SUPABASE_URL a SUPABASE_SERVICE_ROLE_KEY musí být nastaveny."
    );
  }
  return createClient(url, serviceKey);
}

export { getSupabaseClient };
