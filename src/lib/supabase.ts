import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Sem chaves => MODO DEMO: todas as telas funcionam com mock data + localStorage. */
export const isDemoMode = !url || !anonKey;

export const supabase: SupabaseClient | null = isDemoMode ? null : createClient(url!, anonKey!);

/** Cliente com service role — usar SOMENTE em rotas de servidor (ex.: /api/jobs/sync). */
export function createServiceClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
