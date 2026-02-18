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

const suggestionsSchema = z.object({
  targetAudience: z.array(z.string()).optional().default([]),
  offers: z.array(z.string()).optional().default([]),
  toneOfVoice: z.array(z.string()).optional().default([]),
  ctaPreference: z.array(z.string()).optional().default([]),
  forbiddenWords: z.array(z.string()).optional().default([]),
});

/** Schema pro výstup z LLM – všechna pole optional (enrich je jen předvyplnění), offers string po normalizaci. */
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
  suggestions: suggestionsSchema.optional(),
  missingFields: z.array(z.string()).optional().default([]),
  confidence: z.number().min(0).max(1).optional().default(0.5),
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

/** Odpověď /api/intake/enrich při úspěchu. */
export type EnrichApiResponse = {
  ok: true;
  prefill: EnrichPrefill;
  suggestions: EnrichSuggestions;
  detectedAssets: DetectedAssets;
  missingFields: string[];
  confidence: number;
};

export const PDF_MIME = "application/pdf";
export const PDF_MAX_BYTES = 15 * 1024 * 1024; // 15 MB
