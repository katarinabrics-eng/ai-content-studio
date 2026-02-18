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

export type StoredPostDraft = PostDraft & {
  id: string;
  intakeId: string;
  createdAt: string;
};

export const generateRequestSchema = z.object({
  intakeId: z.string().optional(),
  count: z.number().min(1).max(10).optional().default(3),
});
