/**
 * Normalizace project code a PIN pro přihlášení.
 */

/** Normalizuje project code: trim, uppercase, pomlčky (– — ‑) -> "-". */
export function normalizeProjectCode(raw: string): string {
  let s = raw.trim().toUpperCase();
  s = s.replace(/[–—‑]/g, "-");
  s = s.replace(/[^A-Z0-9-]/g, "");
  return s;
}

/** Normalizuje PIN na čísla (bez mezer). */
export function normalizePin(raw: string): string {
  return raw.replace(/\D/g, "");
}
