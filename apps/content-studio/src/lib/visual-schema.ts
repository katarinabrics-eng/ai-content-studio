import { z } from "zod";

/** Brand Visual DNA – optional on intake payload */
export const visualStyleProfileSchema = z.object({
  styleName: z.string().optional(),
  palette: z.array(z.string()).optional(),
  typographyTone: z.string().optional(),
  compositionRules: z.array(z.string()).optional(),
  doNotUse: z.array(z.string()).optional(),
  referenceImageUrls: z.array(z.string()).optional(),
});

export type VisualStyleProfile = z.infer<typeof visualStyleProfileSchema>;

/** Creative brief – output of Step A in visual pipeline */
export const creativeBriefSchema = z.object({
  concept: z.string(),
  shotType: z.string(),
  scene: z.string(),
  lighting: z.string(),
  composition: z.string(),
  palette: z.string(),
  headline: z.string(),
  subheadline: z.string().optional(),
  cta: z.string(),
  negativePrompt: z.string().optional(),
});

export type CreativeBrief = z.infer<typeof creativeBriefSchema>;

/** Platform visual formats (width x height) */
export const PLATFORM_FORMATS = {
  "instagram-feed": { width: 1080, height: 1350 },
  "instagram-story": { width: 1080, height: 1920 },
  "facebook-feed": { width: 1080, height: 1350 },
  "linkedin-post": { width: 1200, height: 627 },
} as const;

export type PlatformFormatKey = keyof typeof PLATFORM_FORMATS;
