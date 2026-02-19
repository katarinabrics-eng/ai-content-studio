/**
 * Core logic for posts generation – shared by POST /api/posts/generate and job processor.
 */
import OpenAI from "openai";
import { getIntakeByIdOrLast } from "@/lib/supabase-intake";
import { insertPostDrafts } from "@/lib/supabase-posts";
import { postDraftSchema, type PostDraft, type StoredPostDraft } from "@/lib/posts-schema";
import { getBrandSpecFromIntake } from "@/lib/brand-spec";
import { getStrategyById } from "@/lib/strategy-library";
import { pickStrategy } from "@/lib/strategy-picker";

const DRAFT_COUNT = 3;
const MAX_REGENERATE = 2;

const BASE_SYSTEM_PROMPT = `Jsi copywriter. Na základě intake (značka, cílová skupina, nabídky, tón, cíle) vygeneruj přesně 3 návrhy sociálních postů.
Vrať POUZE validní JSON bez markdownu:
{
  "drafts": [
    {
      "platform": "instagram" | "facebook" | "linkedin",
      "angle": "úhel / hlavní myšlenka postu",
      "hook": "úvodní věta která chytí pozornost",
      "caption": "hlavní text postu",
      "cta": "výzva k akci",
      "hashtags": ["#tag1", "#tag2"],
      "visualBrief": "krátký popis vizuálu / obrázku",
      "status": "draft"
    }
  ]
}
Každý draft musí mít platform, angle, hook, caption, cta, hashtags (pole), visualBrief, status "draft".`;

function containsForbiddenWords(text: string, forbidden: string[]): string[] {
  if (forbidden.length === 0) return [];
  const lower = text.toLowerCase();
  return forbidden.filter((w) => lower.includes(w.toLowerCase()));
}

function validateDraftBrand(draft: PostDraft, brandSpec: import("@/lib/brand-spec").BrandSpec) {
  const combined = `${draft.hook} ${draft.caption} ${draft.cta} ${draft.visualBrief} ${draft.angle}`.toLowerCase();
  const forbiddenFound = containsForbiddenWords(combined, brandSpec.forbiddenWords);
  const platformOk = brandSpec.platforms.length === 0 || brandSpec.platforms.includes(draft.platform);
  const violations: string[] = [];
  if (brandSpec.disallowedTopics.length > 0) {
    for (const t of brandSpec.disallowedTopics) {
      if (combined.includes(t)) violations.push(`Obsahuje zakázané téma: "${t}"`);
    }
  }
  if (brandSpec.allowedTopics.length > 0) {
    const hasAllowed = brandSpec.allowedTopics.some((t) => combined.includes(t));
    if (!hasAllowed) violations.push(`Text neodpovídá povoleným tématům`);
  }
  if (forbiddenFound.length > 0) violations.push(`Zakázaná slova: ${forbiddenFound.join(", ")}`);
  return {
    forbiddenWords: forbiddenFound,
    toneOk: true,
    platformOk,
    warnings: [] as string[],
    topicCompliance: { passed: violations.length === 0, violations },
  };
}

function normalizeDraft(raw: Record<string, unknown>): PostDraft {
  const parsed = postDraftSchema.safeParse({
    platform: raw.platform ?? "instagram",
    angle: raw.angle ?? "",
    hook: raw.hook ?? "",
    caption: raw.caption ?? "",
    cta: raw.cta ?? "",
    hashtags: Array.isArray(raw.hashtags) ? raw.hashtags.map(String) : [],
    visualBrief: raw.visualBrief ?? "",
    status: "draft",
  });
  if (parsed.success) return parsed.data;
  return {
    platform: (raw.platform as PostDraft["platform"]) ?? "instagram",
    angle: String(raw.angle ?? ""),
    hook: String(raw.hook ?? ""),
    caption: String(raw.caption ?? ""),
    cta: String(raw.cta ?? ""),
    hashtags: Array.isArray(raw.hashtags) ? raw.hashtags.map(String) : [],
    visualBrief: String(raw.visualBrief ?? ""),
    status: "draft",
  };
}

function toStoredDraft(row: { id: string; intake_id: string; created_at: string; payload: Record<string, unknown> }): StoredPostDraft {
  const p = row.payload;
  return {
    id: row.id,
    intakeId: row.intake_id,
    createdAt: row.created_at ?? new Date().toISOString(),
    platform: (p.platform as StoredPostDraft["platform"]) ?? "instagram",
    angle: String(p.angle ?? ""),
    hook: String(p.hook ?? ""),
    caption: String(p.caption ?? ""),
    cta: String(p.cta ?? ""),
    hashtags: Array.isArray(p.hashtags) ? p.hashtags.map(String) : [],
    visualBrief: String(p.visualBrief ?? ""),
    status: "draft",
    visualImageUrl: typeof p.visualImageUrl === "string" ? p.visualImageUrl : undefined,
    visualBaseImageUrl: typeof p.visualBaseImageUrl === "string" ? p.visualBaseImageUrl : undefined,
    visualStatus: p.visualStatus as StoredPostDraft["visualStatus"] | undefined,
    visualPrompt: typeof p.visualPrompt === "string" ? p.visualPrompt : undefined,
    visualError: typeof p.visualError === "string" ? p.visualError : undefined,
    visualUpdatedAt: typeof p.visualUpdatedAt === "string" ? p.visualUpdatedAt : undefined,
    visualCreativeScore: typeof p.visualCreativeScore === "number" ? p.visualCreativeScore : undefined,
    visualFormat: typeof p.visualFormat === "string" ? p.visualFormat : undefined,
    visualStyleLocked: typeof p.visualStyleLocked === "boolean" ? p.visualStyleLocked : undefined,
    brandApplied: p.brandApplied as StoredPostDraft["brandApplied"],
    brandWarnings: Array.isArray(p.brandWarnings) ? p.brandWarnings.map(String) : undefined,
    visualStyle: typeof p.visualStyle === "string" ? p.visualStyle : undefined,
    visualStyleId: typeof p.visualStyleId === "string" ? p.visualStyleId : undefined,
    visualStyleLabel: typeof p.visualStyleLabel === "string" ? p.visualStyleLabel : undefined,
    brandContextApplied: typeof p.brandContextApplied === "boolean" ? p.brandContextApplied : undefined,
    visualVariants: Array.isArray(p.visualVariants) ? p.visualVariants as { url: string; score: number }[] : undefined,
    visualCriticNote: typeof p.visualCriticNote === "string" ? p.visualCriticNote : undefined,
    visualBrandApplied: p.visualBrandApplied as StoredPostDraft["visualBrandApplied"],
    visualBrandWarnings: Array.isArray(p.visualBrandWarnings) ? p.visualBrandWarnings.map(String) : undefined,
    strategyId: typeof p.strategyId === "string" ? p.strategyId : undefined,
    strategyLabel: typeof p.strategyLabel === "string" ? p.strategyLabel : undefined,
    strategyRationale: typeof p.strategyRationale === "string" ? p.strategyRationale : undefined,
    awarenessLevel: typeof p.awarenessLevel === "string" ? p.awarenessLevel : undefined,
    visualStrategyId: typeof p.visualStrategyId === "string" ? p.visualStrategyId : undefined,
    visualStrategySource: p.visualStrategySource === "draft" || p.visualStrategySource === "override" ? p.visualStrategySource : undefined,
    topicCompliance:
      p.topicCompliance && typeof p.topicCompliance === "object" && typeof (p.topicCompliance as { passed?: unknown }).passed === "boolean"
        ? {
            passed: (p.topicCompliance as { passed: boolean }).passed,
            violations: Array.isArray((p.topicCompliance as { violations?: unknown }).violations)
              ? ((p.topicCompliance as { violations: string[] }).violations).filter((x): x is string => typeof x === "string")
              : [],
          }
        : undefined,
  };
}

export type ExecutePostsGenerateParams = {
  intakeId?: string;
  count?: number;
  brandLock?: boolean;
  strategyMode?: string;
  strategyId?: string;
};

export type ExecutePostsGenerateResult = {
  ok: true;
  intakeId: string;
  drafts: StoredPostDraft[];
} | {
  ok: false;
  error: string;
};

export async function executePostsGenerate(
  openaiKey: string,
  params: ExecutePostsGenerateParams
): Promise<ExecutePostsGenerateResult> {
  const intake = await getIntakeByIdOrLast(params.intakeId);
  if (!intake) {
    return { ok: false, error: "Žádný intake k dispozici. Nejdřív odešlete intake formulář." };
  }

  const count = Math.min(3, Math.max(1, params.count ?? 3));
  const brandLock = params.brandLock !== false;
  const intakePayload = intake as Record<string, unknown>;
  const strategyMode = params.strategyMode ?? (intakePayload.strategyMode as string) ?? "auto";
  const strategyIdParam = params.strategyId ?? intakePayload.strategyId;

  const brandSpec = getBrandSpecFromIntake(intakePayload);

  let strategy: { id: string; publicLabel: string; publicDescription: string; ctaStyle: string };
  let strategyRationale: string;
  if (strategyMode === "manual" && strategyIdParam && getStrategyById(strategyIdParam as import("@/lib/strategy-library").StrategyId)) {
    const s = getStrategyById(strategyIdParam as import("@/lib/strategy-library").StrategyId)!;
    strategy = s;
    strategyRationale = s.publicDescription;
  } else {
    const al = (intakePayload.awarenessLevel as string) ?? "problem_aware";
    const awarenessLevel: import("@/lib/strategy-library").AwarenessLevel =
      ["unaware", "problem_aware", "solution_aware", "product_aware", "most_aware"].includes(al) ? (al as import("@/lib/strategy-library").AwarenessLevel) : "problem_aware";
    const picked = pickStrategy({
      contentGoal: (intakePayload.contentGoal as "prodej" | "důvěra" | "edukace") ?? "edukace",
      platforms: (intakePayload.platforms as string[]) ?? [],
      targetAudience: String(intakePayload.targetAudience ?? ""),
      offers: String(intakePayload.offers ?? ""),
      toneOfVoice: String(intakePayload.toneOfVoice ?? ""),
      awarenessLevel,
    });
    strategy = picked.strategy;
    strategyRationale = picked.rationale;
  }

  const brandCore = brandSpec.brandCoreOneLiner || (intakePayload.offers as string) || "";
  const topicRules =
    brandLock && (brandSpec.allowedTopics.length > 0 || brandSpec.disallowedTopics.length > 0)
      ? `
TÉMATA (source of truth):
- Hlavní nabídka: ${brandCore}
- Povolená témata: ${brandSpec.allowedTopics.length ? brandSpec.allowedTopics.join(", ") : "(vše z hlavní nabídky)"}
- Zakázaná témata: ${brandSpec.disallowedTopics.length ? brandSpec.disallowedTopics.join(", ") : "(žádná)"}`
      : "";

  const brandLockRules = brandLock
    ? `
DŮLEŽITÉ (BRAND LOCK ON):
- NIKDY nepoužívej zakázaná slova: ${brandSpec.forbiddenWords.length ? brandSpec.forbiddenWords.join(", ") : "(žádná)"}
- Tón MUSÍ odpovídat: ${brandSpec.toneOfVoice ?? "(neuvedeno)"}
- Platformy pouze z: ${brandSpec.platforms.join(", ")}
- Styl: ${brandSpec.stylePreference ?? "storytelling"}${topicRules}
`
    : "";

  const context = `
Značka: ${intakePayload.brandName ?? ""}
Odvětví: ${intakePayload.industry ?? ""}
Cílová skupina: ${intakePayload.targetAudience ?? ""}
Nabídky: ${intakePayload.offers ?? ""}
Tón: ${intakePayload.toneOfVoice ?? ""}
Cíl obsahu: ${intakePayload.contentGoal ?? ""}
Platformy: ${JSON.stringify(intakePayload.platforms ?? [])}
Styl: ${intakePayload.stylePreference ?? ""}
CTA preference: ${intakePayload.ctaPreference ?? ""}
Zakázaná slova: ${brandSpec.forbiddenWords.length ? brandSpec.forbiddenWords.join(", ") : "(žádná)"}
${brandLockRules}
Strategie: ${strategy.publicLabel}
CTA styl: ${strategy.ctaStyle}
DŮLEŽITÉ: Výstup musí být čistě klientsky čitelný obsah.`.trim();

  const openai = new OpenAI({ apiKey: openaiKey });
  let payloads: { payload: Record<string, unknown> }[] = [];
  let regenerateCount = 0;

  while (regenerateCount <= MAX_REGENERATE) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: BASE_SYSTEM_PROMPT },
        { role: "user", content: `Vygeneruj přesně ${count} návrhů postů.\n\nKontext intake:\n${context}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return { ok: false, error: "AI nevrátilo odpověď" };
    }

    let parsedContent: { drafts?: unknown[] };
    try {
      parsedContent = JSON.parse(content) as { drafts?: unknown[] };
    } catch {
      return { ok: false, error: "Neplatná JSON odpověď od AI" };
    }

    const draftsRaw = Array.isArray(parsedContent.drafts) ? parsedContent.drafts.slice(0, DRAFT_COUNT) : [];
    payloads = [];
    let hasForbiddenFail = false;
    let hasTopicFail = false;

    for (const item of draftsRaw) {
      const obj = typeof item === "object" && item != null ? (item as Record<string, unknown>) : {};
      const normalized = normalizeDraft(obj);
      const validation = brandLock ? validateDraftBrand(normalized, brandSpec) : { forbiddenWords: [] as string[], toneOk: true, platformOk: true, warnings: [] as string[], topicCompliance: { passed: true, violations: [] as string[] } };
      if (validation.forbiddenWords.length > 0 && brandLock) hasForbiddenFail = true;
      if (!validation.topicCompliance.passed && brandLock) hasTopicFail = true;

      payloads.push({
        payload: {
          platform: normalized.platform,
          angle: normalized.angle,
          hook: normalized.hook,
          caption: normalized.caption,
          cta: normalized.cta,
          hashtags: normalized.hashtags,
          visualBrief: normalized.visualBrief,
          status: "draft",
          strategyId: strategy.id,
          strategyLabel: strategy.publicLabel,
          strategyRationale,
          awarenessLevel: (intakePayload.awarenessLevel as string) ?? "problem_aware",
          brandApplied: brandLock ? { tone: validation.toneOk, forbiddenWords: validation.forbiddenWords.length === 0, platform: validation.platformOk } : undefined,
          brandWarnings: validation.warnings.length ? validation.warnings : undefined,
          topicCompliance: validation.topicCompliance,
        },
      });
    }

    if (brandLock && (hasForbiddenFail || hasTopicFail) && regenerateCount < MAX_REGENERATE) {
      regenerateCount++;
      continue;
    }
    break;
  }

  while (payloads.length < DRAFT_COUNT) {
    payloads.push({
      payload: {
        platform: "instagram",
        angle: "",
        hook: "",
        caption: "",
        cta: "",
        hashtags: [],
        visualBrief: "",
        status: "draft",
        strategyId: strategy.id,
        strategyLabel: strategy.publicLabel,
        strategyRationale,
        awarenessLevel: (intakePayload.awarenessLevel as string) ?? "problem_aware",
        topicCompliance: { passed: true, violations: [] },
      },
    });
  }

  const rows = await insertPostDrafts(intake.id, payloads);
  const stored = rows.map(toStoredDraft);

  return { ok: true, intakeId: intake.id, drafts: stored.slice(0, DRAFT_COUNT) };
}
