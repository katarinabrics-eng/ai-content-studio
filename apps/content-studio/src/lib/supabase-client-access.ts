import { createHash, randomBytes } from "crypto";
import { getSupabaseClient } from "./supabase-server";
import { upsertClient, type ClientRow } from "./supabase-clients";

const TOKEN_BYTES = 32;
const TOKEN_EXPIRY_HOURS = 24;
const LINK_STATUS_PENDING = "pending";
const LINK_STATUS_USED = "used";
const LINK_STATUS_EXPIRED = "expired";

export type ClientAccessLinkRow = {
  id: string;
  client_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  status: string;
  created_at: string;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function generateSecureToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

/**
 * Create magic link for client (by email). Creates client if not exists.
 * Returns full URL to use in email (e.g. /client/onboarding?token=...).
 */
export async function createAccessLink(params: {
  email: string;
  baseUrl: string;
  name?: string;
}): Promise<{ client: ClientRow; token: string; expiresAt: Date; magicLinkUrl: string }> {
  const client = await upsertClient({
    email: params.email,
    name: params.name ?? "",
  });

  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("client_access_links").insert({
    client_id: client.id,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
    status: LINK_STATUS_PENDING,
  });

  if (error) {
    throw new Error(`Chyba při vytváření přístupového odkazu: ${error.message}`);
  }

  const path = "/client/verify";
  const magicLinkUrl = `${params.baseUrl.replace(/\/$/, "")}${path}?token=${encodeURIComponent(token)}`;
  return { client, token, expiresAt, magicLinkUrl };
}

/**
 * Verify token: must be pending, not expired, not used.
 * Returns client and link row. Does NOT mark as used (use verifyAndRotateToken for one-time from email).
 */
export async function verifyAccessToken(
  rawToken: string
): Promise<{ client: ClientRow; linkId: string } | null> {
  return validateToken(rawToken);
}

/** Validate token for page load (don't mark used). Same token can be used for multiple requests until expiry. */
export async function validateToken(rawToken: string): Promise<{ client: ClientRow; linkId: string } | null> {
  const tokenHash = hashToken(rawToken.trim());
  const supabase = getSupabaseClient();

  const { data: link, error: linkError } = await supabase
    .from("client_access_links")
    .select("id, client_id, expires_at, used_at, status")
    .eq("token_hash", tokenHash)
    .single();

  if (linkError || !link) {
    return null;
  }

  const row = link as { id: string; client_id: string; expires_at: string; used_at: string | null; status: string };
  if (row.status !== LINK_STATUS_PENDING) {
    return null;
  }
  if (row.used_at) {
    return null;
  }
  const expiresAt = new Date(row.expires_at);
  if (expiresAt < new Date()) {
    await supabase
      .from("client_access_links")
      .update({ status: LINK_STATUS_EXPIRED })
      .eq("id", row.id);
    return null;
  }

  const { data: clientRow } = await supabase
    .from("clients")
    .select("id, email, name, tariff, priority, created_at")
    .eq("id", row.client_id)
    .single();

  if (!clientRow) return null;
  return { client: clientRow as ClientRow, linkId: row.id };
}

/** Mark token as used (call after critical action or after issuing a new token). */
export async function markTokenUsed(linkId: string): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase
    .from("client_access_links")
    .update({ status: LINK_STATUS_USED, used_at: new Date().toISOString() })
    .eq("id", linkId);
}

/** Create a new access link for an existing client (e.g. refresh). Returns new token. */
export async function createAccessLinkForClient(clientId: string): Promise<{ newToken: string; expiresAt: Date }> {
  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("client_access_links").insert({
    client_id: clientId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
    status: LINK_STATUS_PENDING,
  });

  if (error) {
    throw new Error(`Chyba při vytváření odkazu: ${error.message}`);
  }
  return { newToken: token, expiresAt };
}

/**
 * Verify and rotate: validate token, mark it used, create new token, return client + new token.
 */
export async function verifyAndRotateToken(
  rawToken: string
): Promise<{ client: ClientRow; newToken: string; expiresAt: Date } | null> {
  const result = await validateToken(rawToken);
  if (!result) return null;

  const supabase = getSupabaseClient();
  await supabase.from("client_access_links").update({ status: LINK_STATUS_USED, used_at: new Date().toISOString() }).eq("id", result.linkId);

  const created = await createAccessLinkForClient(result.client.id);
  return { client: result.client, newToken: created.newToken, expiresAt: created.expiresAt };
}
