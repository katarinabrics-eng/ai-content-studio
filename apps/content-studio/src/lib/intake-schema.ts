import { z } from "zod";

const CONTENT_GOAL = ["prodej", "důvěra", "edukace"] as const;
const STYLE_PREFERENCE = ["humor", "storytelling", "edukace", "prodejní"] as const;
const PLATFORMS = ["instagram", "facebook", "linkedin"] as const;

export const AWARENESS_LEVELS = ["unaware", "problem_aware", "solution_aware", "product_aware", "most_aware"] as const;
export type AwarenessLevel = (typeof AWARENESS_LEVELS)[number];

export const intakeSchema = z.object({
  brandName: z.string().min(1, "Název značky je povinný"),
  website: z
    .union([z.string().url("Neplatná URL"), z.literal("")])
    .optional(),
  industry: z.string().min(1, "Odvětví je povinné"),
  targetAudience: z.string().min(1, "Cílová skupina je povinná"),
  offers: z.string().min(1, "Nabídky jsou povinné"),
  toneOfVoice: z.string().min(1, "Tón hlasu je povinný"),
  forbiddenWords: z.string().optional(),
  contentGoal: z.enum(CONTENT_GOAL, {
    errorMap: () => ({ message: "Vyberte cíl obsahu" }),
  }),
  platforms: z
    .array(z.enum(PLATFORMS))
    .min(1, "Vyberte alespoň jednu platformu"),
  stylePreference: z.enum(STYLE_PREFERENCE, {
    errorMap: () => ({ message: "Vyberte styl" }),
  }),
  ctaPreference: z.string().optional(),
  // Brand assets (placeholder – ukládáme jen text / cesty)
  brandAssets: z
    .object({
      logo: z.string().optional(),
      logoUrl: z.string().optional(),
      colors: z.string().optional(),
      fonts: z.string().optional(),
      photosNote: z.string().optional(),
    })
    .optional(),
  // Optional Brand Visual DNA
  visualStyleProfile: z
    .object({
      styleName: z.string().optional(),
      palette: z.array(z.string()).optional(),
      typographyTone: z.string().optional(),
      compositionRules: z.array(z.string()).optional(),
      doNotUse: z.array(z.string()).optional(),
      referenceImageUrls: z.array(z.string()).optional(),
    })
    .optional(),
  strategyMode: z.enum(["auto", "manual"]).optional().default("auto"),
  strategyId: z.string().optional(),
  awarenessLevel: z.enum(AWARENESS_LEVELS).optional().default("problem_aware"),
});

export type IntakeFormData = z.infer<typeof intakeSchema>;

export const CONTENT_GOAL_OPTIONS = CONTENT_GOAL;
export const STYLE_PREFERENCE_OPTIONS = STYLE_PREFERENCE;
export const PLATFORM_OPTIONS = PLATFORMS;
