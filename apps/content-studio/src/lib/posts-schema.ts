import { z } from "zod";

export const PLATFORMS = ["instagram", "facebook", "linkedin"] as const;

export const postDraftSchema = z.object({
  platform: z.enum(PLATFORMS),
  angle: z.string(),
  hook: z.string(),
  caption: z.string(),
  cta: z.string(),
  hashtags: z.array(z.string()),
  visualBrief: z.string(),
  status: z.literal("draft"),
});

export type PostDraft = z.infer<typeof postDraftSchema>;

export const VISUAL_STATUS = ["idle", "generating", "ready", "error"] as const;
export type VisualStatus = (typeof VISUAL_STATUS)[number];

export type StoredPostDraft = PostDraft & {
  id: string;
  intakeId: string;
  createdAt: string;
  visualImageUrl?: string;
  visualBaseImageUrl?: string;
  visualStatus?: VisualStatus;
  visualPrompt?: string;
  visualError?: string;
  visualUpdatedAt?: string;
  visualCreativeScore?: number;
  visualFormat?: string;
  visualStyleLocked?: boolean;
  brandApplied?: { tone?: boolean; forbiddenWords?: boolean; platform?: boolean };
  brandWarnings?: string[];
  visualStyle?: string;
  visualStyleId?: string;
  visualStyleLabel?: string;
  brandContextApplied?: boolean;
  visualVariants?: { url: string; score: number }[];
  visualCriticNote?: string;
  visualBrandApplied?: { colors?: boolean; logo?: boolean; tone?: boolean; layout?: boolean };
  visualBrandWarnings?: string[];
  strategyId?: string;
  strategyLabel?: string;
  strategyRationale?: string;
  awarenessLevel?: string;
  visualStrategyId?: string;
  visualStrategySource?: "draft" | "override";
  topicCompliance?: { passed: boolean; violations: string[] };
}

export const generateRequestSchema = z.object({
  intakeId: z.string().optional(),
  count: z.number().min(1).max(10).optional().default(3),
  brandLock: z.boolean().optional().default(true),
  strategyMode: z.enum(["auto", "manual"]).optional().default("auto"),
  strategyId: z.string().optional(),
});
