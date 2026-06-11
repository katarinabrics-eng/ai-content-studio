import { z } from "zod";

export const CONTENT_GOAL = ["prodej", "důvěra", "edukace"] as const;
export const STYLE_PREFERENCE = ["humor", "storytelling", "edukace", "prodejní"] as const;
export const PLATFORMS = ["instagram", "facebook", "linkedin"] as const;

export const enrichRequestSchema = z.object({
  website: z.string().min(1, "Website je povinné").url("Neplatná URL webu"),
});

const brandAssetsSchema = z
  .object({
    logo: z.string().optional(),
    colors: z.string().optional(),
    fonts: z.string().optional(),
    photos: z.string().optional(),
  })
  .optional();

function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
  }
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

/** Normalize LLM variance: object, array (legacy), or null/undefined → object with string[] keys. */
export function normalizeSuggestionsInput(input: unknown): {
  targetAudience: string[];
  offers: string[];
  toneOfVoice: string[];
  ctaPreference: string[];
  forbiddenWords: string[];
} {
  const empty = {
    targetAudience: [] as string[],
    offers: [] as string[],
    toneOfVoice: [] as string[],
    ctaPreference: [] as string[],
    forbiddenWords: [] as string[],
  };
  if (input == null) return empty;
  if (Array.isArray(input)) {
    return { ...empty, offers: toStringArray(input) };
  }
  if (typeof input === "object" && !Array.isArray(input)) {
    const o = input as Record<string, unknown>;
    return {
      targetAudience: toStringArray(o.targetAudience),
      offers: toStringArray(o.offers),
      toneOfVoice: toStringArray(o.toneOfVoice),
      ctaPreference: toStringArray(o.ctaPreference),
      forbiddenWords: toStringArray(o.forbiddenWords),
    };
  }
  return empty;
}

const suggestionsSchema = z.preprocess(
  normalizeSuggestionsInput,
  z.object({
    targetAudience: z.array(z.string()),
    offers: z.array(z.string()),
    toneOfVoice: z.array(z.string()),
    ctaPreference: z.array(z.string()),
    forbiddenWords: z.array(z.string()),
  })
);

const evidenceSchema = z.object({
  field: z.string(),
  sourceUrl: z.string(),
  snippet: z.string(),
});

/** Schema pro výstup z LLM – všechna pole optional (enrich je jen předvyplnění). */
export const enrichResultSchema = z.object({
  brandName: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  offers: z.string().optional(),
  toneOfVoice: z.string().optional(),
  forbiddenWords: z.string().optional(),
  contentGoal: z.enum(CONTENT_GOAL).optional().nullable().transform((v) => v ?? undefined),
  platforms: z.array(z.enum(PLATFORMS)).optional().nullable().transform((v) => v ?? undefined),
  stylePreference: z.enum(STYLE_PREFERENCE).optional().nullable().transform((v) => v ?? undefined),
  ctaPreference: z.string().optional(),
  brandAssets: brandAssetsSchema,
  suggestions: suggestionsSchema.optional().transform((v) => v ?? normalizeSuggestionsInput(null)),
  missingFields: z.array(z.string()).optional().default([]),
  confidence: z.number().min(0).max(1).optional().default(0.5),
  brandCoreOneLiner: z.string().optional(),
  allowedTopics: z.array(z.string()).optional().default([]),
  disallowedTopics: z.array(z.string()).optional().default([]),
  evidence: z.array(evidenceSchema).optional().default([]),
});

export type EnrichResponse = z.infer<typeof enrichResultSchema>;

/** Prefill objekt – všechna intake pole jako string/pole, bez null. */
export type EnrichPrefill = {
  brandName: string;
  website: string;
  industry: string;
  targetAudience: string;
  offers: string;
  toneOfVoice: string;
  forbiddenWords: string;
  contentGoal: (typeof CONTENT_GOAL)[number];
  platforms: (typeof PLATFORMS)[number][];
  stylePreference: (typeof STYLE_PREFERENCE)[number];
  ctaPreference: string;
  strategyMode?: "auto" | "manual";
  strategyId?: string;
  awarenessLevel?: string;
  brandAssets: {
    logoUrl: string;
    colors: string;
    fonts: string;
    photosNote: string;
  };
};

/** AI návrhy pro úpravu – pole stringů pro vybraná pole. */
export type EnrichSuggestions = {
  targetAudience: string[];
  offers: string[];
  toneOfVoice: string[];
  ctaPreference: string[];
  forbiddenWords: string[];
};

/** Detekované assety z webu. */
export type DetectedAssets = {
  logoCandidates: string[];
  colors: string[];
  fonts: string[];
};

/** Evidence pro klíčový claim – url + snippet. */
export type EnrichEvidence = {
  field: string;
  sourceUrl: string;
  snippet: string;
};

/** Odpověď /api/intake/enrich při úspěchu. */
export type EnrichApiResponse = {
  ok: true;
  prefill: EnrichPrefill;
  suggestions: EnrichSuggestions;
  detectedAssets: DetectedAssets;
  missingFields: string[];
  confidence: number;
  /** Hlavní nabídka značky (1 věta) – zdroj pravdy pro content */
  brandCoreOneLiner: string;
  /** Povolená témata – content musí zůstat v těchto tématech */
  allowedTopics: string[];
  /** Zakázaná témata – content nesmí obsahovat */
  disallowedTopics: string[];
  /** Evidence pro klíčové claims (offers, industry, targetAudience) */
  evidence: EnrichEvidence[];
  /** Např. "Suggestions normalized due to invalid shape" */
  warnings?: string[];
  /** Enrich diagnostika: confidence, source, warnings, evidenceCount */
  diagnostics?: {
    confidence: number;
    source: "scrape" | "fallback_cached";
    warnings: string[];
    evidenceCount: number;
  };
};

export const PDF_MIME = "application/pdf";
export const PDF_MAX_BYTES = 15 * 1024 * 1024; // 15 MB
