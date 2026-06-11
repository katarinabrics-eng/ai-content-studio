/**
 * Admin heslo: ověření proti env nebo DB, nastavení nového hesla (reset).
 */

import { scryptSync, timingSafeEqual } from "crypto";
import { getSupabaseClient } from "./supabase-server";

const SALT_PREFIX = "admin-lucifera-";
const KEY_LENGTH = 64;

function getSalt(): string {
  return SALT_PREFIX + (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "default");
}

function hashPassword(password: string): string {
  return scryptSync(password, getSalt(), KEY_LENGTH).toString("hex");
}

export async function verifyPasswordAsync(password: string): Promise<boolean> {
  const envPass = process.env.ADMIN_PASSWORD ?? "";
  const trimmedEnv = envPass.trim();
  if (trimmedEnv && password === trimmedEnv) return true;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("app_config").select("value").eq("key", "admin_password_hash").maybeSingle();
  if (error || !data?.value) return false;
  const storedHash = data.value as string;
  const inputHash = hashPassword(password);
  if (inputHash.length !== storedHash.length) return false;
  try {
    return timingSafeEqual(Buffer.from(inputHash, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return false;
  }
}

export async function setPasswordInDb(newPassword: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: "Heslo musí mít alespoň 6 znaků." };
  }
  const hash = hashPassword(newPassword);
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("app_config").upsert(
    { key: "admin_password_hash", value: hash, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export function canResetPassword(): boolean {
  const setupToken = process.env.ADMIN_SETUP_TOKEN ?? "";
  return setupToken.trim().length >= 6;
}
