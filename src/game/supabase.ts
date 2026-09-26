import { createClient } from "@supabase/supabase-js";
import { normalizeSave } from "./cloud";
import type { SaveData } from "./save";

const env = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env;
const url = env.VITE_SUPABASE_URL?.trim();
const publishableKey = env.VITE_SUPABASE_ANON_KEY?.trim();

// Only the public/anon key belongs in Vite. Never ship a service-role key.
export const supabase = url && publishableKey
  ? createClient(url, publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export const cloudConfigured = Boolean(supabase);

export async function fetchProfile(userId: string): Promise<SaveData | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("duskline_profiles")
    .select("save_data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`Could not load cloud progress: ${error.message}`);
  if (!data) return null;
  return normalizeSave(data.save_data);
}

export async function storeProfile(userId: string, save: SaveData) {
  if (!supabase) return;
  const { error } = await supabase.from("duskline_profiles").upsert(
    { user_id: userId, save_data: save, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(`Could not sync progress: ${error.message}`);
}