/**
 * Mapování intake (IntakeFormData) na CreateProjectParams pro /api/intake/pipeline a /api/start.
 */

import type { IntakeFormData } from "./intake-schema";
import type { CreateProjectParams } from "./supabase-projects";

export function intakeToCreateProjectParams(
  data: IntakeFormData,
  overrides: {
    logo_url?: string | null;
    brand_pdf_url?: string | null;
    client_email?: string | null;
  } = {}
): CreateProjectParams {
  const platforms = Array.isArray(data.platforms) ? data.platforms : [];
  const contentGoal = data.contentGoal ?? "edukace";
  return {
    plan_id: "basic",
    brand_name: (data.brandName ?? "").trim(),
    industry: (data.industry ?? "").trim(),
    communication_goal: contentGoal,
    platforms: platforms.length ? platforms : ["instagram"],
    tone_of_voice: (data.toneOfVoice ?? data.tone_of_voice ?? "").trim(),
    website_or_profile: (data.website ?? "").trim(),
    client_email: overrides.client_email ?? null,
    note: (data.forbiddenWords ?? "").trim() || undefined,
    target_audience: (data.targetAudience ?? "").trim() || null,
    offers: (data.offers ?? "").trim() || null,
    forbidden_words: (data.forbiddenWords ?? "").trim() || null,
    preferred_style: (data.stylePreference ?? "").trim() || null,
    preferred_cta: (data.ctaPreference ?? "").trim() || null,
    logo_url: overrides.logo_url ?? (data.brandAssets as { logo?: string } | undefined)?.logo ?? null,
    brand_colors: (data.brandAssets as { colors?: string } | undefined)?.colors?.trim() || null,
    brand_fonts: (data.brandAssets as { fonts?: string } | undefined)?.fonts?.trim() || null,
    image_refs: (data.brandAssets as { photosNote?: string } | undefined)?.photosNote?.trim() || null,
    source_url: (data.website ?? "").trim() || null,
    brand_pdf_url: overrides.brand_pdf_url ?? null,
  };
}
