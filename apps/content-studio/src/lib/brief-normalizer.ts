/**
 * Mapování form input (start/intake) -> brief schema pro DB a Storage.
 */

export type BriefInput = Record<string, unknown>;

export type BriefSchema = {
  plan_id: string;
  brand_name: string;
  industry: string;
  communication_goal: string;
  platforms: string[];
  tone_of_voice: string;
  website_or_profile: string;
  client_email: string | null;
  note: string;
  target_audience: string | null;
  offers: string | null;
  forbidden_words: string | null;
  preferred_style: string | null;
  preferred_cta: string | null;
  logo_url: string | null;
  brand_colors: string | null;
  brand_fonts: string | null;
  image_refs: string | null;
  source_url: string | null;
  brand_pdf_url: string | null;
};

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function strOrNull(v: unknown): string | null {
  const s = str(v);
  return s === "" ? null : s;
}

const zEmail = (v: unknown) =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** Mapuje /start (brand, obor, cil...) i /intake (brandName, industry...) na BriefSchema. */
export function normalizeStartForm(input: BriefInput): BriefSchema {
  const plan_id = str(input.plan_id) || "basic";
  const brand_name = str(input.brand_name ?? input.brand ?? input.brandName);
  const industry = str(input.industry ?? input.obor);
  const communication_goal = str(input.communication_goal ?? input.cil ?? input.contentGoal);
  const sit = str(input.sit);
  const platforms: string[] = Array.isArray(input.platforms)
    ? (input.platforms as string[]).filter((x) => typeof x === "string" && x.trim())
    : sit
      ? sit === "vse"
        ? ["instagram", "linkedin", "facebook"]
        : [sit]
      : [];
  const tone_of_voice = str(input.tone_of_voice ?? input.tonalita ?? input.toneOfVoice ?? input.tone);
  const website_or_profile = str(input.website_or_profile ?? input.web ?? input.website ?? "");
  const emailRaw =
    typeof input.email === "string" ? input.email.trim() : typeof input.client_email === "string" ? (input.client_email as string).trim() : null;
  const client_email = emailRaw && zEmail(emailRaw) ? emailRaw : null;
  const note = str(input.note ?? input.poznamka ?? input.forbiddenWords);
  const brand_assets = (input.brand_assets ?? {}) as Record<string, unknown>;
  return {
    plan_id,
    brand_name,
    industry,
    communication_goal,
    platforms: platforms.length ? platforms : ["instagram"],
    tone_of_voice,
    website_or_profile,
    client_email,
    note,
    target_audience: strOrNull(input.target_audience ?? input.cilova_skupina ?? input.targetAudience),
    offers: strOrNull(input.offers ?? input.nabidky_produkty),
    forbidden_words: strOrNull(input.forbidden_words ?? input.zakazana_slova ?? input.forbiddenWords),
    preferred_style: strOrNull(input.preferred_style ?? input.preferovany_styl ?? input.stylePreference),
    preferred_cta: strOrNull(input.preferred_cta ?? input.preferovana_cta ?? input.ctaPreference),
    logo_url: strOrNull(input.logo_url ?? brand_assets?.logo_url),
    brand_colors: strOrNull(input.brand_colors ?? brand_assets?.barvy),
    brand_fonts: strOrNull(input.brand_fonts ?? brand_assets?.fonty),
    image_refs: strOrNull(input.image_refs ?? brand_assets?.obrazky),
    source_url: strOrNull(input.source_url ?? input.url_pdf_autofill ?? input.website),
    brand_pdf_url: strOrNull(input.brand_pdf_url),
  };
}

/** Validace povinných polí briefu. */
export function validateRequiredBrief(brief: BriefSchema): { ok: true } | { ok: false; missing: string[] } {
  const missing: string[] = [];
  if (!brief.brand_name) missing.push("Značka / název");
  if (!brief.industry) missing.push("Obor");
  if (!brief.communication_goal) missing.push("Cíl komunikace");
  if (!brief.platforms?.length) missing.push("Síť(e)");
  if (!brief.tone_of_voice) missing.push("Tonalita");
  if (!brief.plan_id) missing.push("Tarif");
  if (missing.length) return { ok: false, missing };
  return { ok: true };
}
