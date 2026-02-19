import { PLATFORM_FORMATS, type CreativeBrief, type PlatformFormatKey } from "./visual-schema";
import type { VisualStylePreset } from "./visual-style-presets";

const STRICT_SUFFIX =
  " no text, no letters, no typography, no watermark, no logo, clean composition, negative space for overlay.";

export const OPENAI_SIZES = ["1024x1024", "1536x1024", "1024x1536"] as const;

export function getOpenAISize(format: PlatformFormatKey): (typeof OPENAI_SIZES)[number] {
  const dims = PLATFORM_FORMATS[format];
  const ratio = dims.width / dims.height;
  if (ratio > 1.2) return "1536x1024";
  if (ratio < 0.85) return "1024x1536";
  return "1024x1024";
}

export type ResolvedStyleForPrompt = {
  palette: string[];
  moodKeywords: string[];
  negativePrompt: string;
  visualStyleId: string;
  visualStyleLabel: string;
  visualStyleSource: string;
  brandContextApplied: boolean;
};

export function buildCreativeBriefPrompt(
  draft: { payload: Record<string, unknown> },
  intake: Record<string, unknown>,
  brandSpec: { colors: string[]; toneOfVoice?: string },
  resolvedStyle: ResolvedStyleForPrompt,
  visualStyleProfile?: Record<string, unknown> | null,
  strategy?: { visualDirectives?: string[] }
): string {
  const p = draft.payload;
  const paletteNote = resolvedStyle.palette.length > 0
    ? `Palette: ${resolvedStyle.palette.join(", ")}`
    : brandSpec.colors.length
      ? `Použij barvy z palety: ${brandSpec.colors.join(", ")}`
      : "";
  const toneNote = brandSpec.toneOfVoice ? `Mood/tón: ${brandSpec.toneOfVoice}` : "";
  const moodNote = resolvedStyle.moodKeywords.length > 0
    ? `Mood keywords: ${resolvedStyle.moodKeywords.join(", ")}`
    : "";
  const styleNote = resolvedStyle.visualStyleLabel !== "Default"
    ? `Styl: ${resolvedStyle.visualStyleLabel}. ${resolvedStyle.negativePrompt}`
    : "";
  const visualDirectivesNote = strategy?.visualDirectives?.length
    ? `Art direction: ${strategy.visualDirectives.join("; ")}`
    : "";
  return `Jsi art director. Na základě draftu a intake vytvoř creative brief pro vizuál (POUZE POZADÍ – žádný text v obrázku).
Draft: platform=${p.platform}, hook=${p.hook}, caption=${p.caption}, cta=${p.cta}, visualBrief=${p.visualBrief}
Intake: toneOfVoice=${intake.toneOfVoice}, offers=${intake.offers}, targetAudience=${intake.targetAudience}
${paletteNote}
${toneNote}
${moodNote}
${styleNote}
${visualDirectivesNote}
${visualStyleProfile ? `Visual style profile: ${JSON.stringify(visualStyleProfile)}` : ""}

Vrať POUZE validní JSON bez markdownu:
{
  "concept": "hlavní koncept",
  "shotType": "typ záběru (close-up, medium, wide...)",
  "scene": "popis scény",
  "lighting": "osvětlení",
  "composition": "kompozice",
  "palette": "barvy",
  "headline": "hlavní nadpis max 6 slov",
  "subheadline": "podnadpis max 12 slov (volitelné)",
  "cta": "CTA text",
  "negativePrompt": "co NEPOUŽÍVAT: text v obraze, písmena, watermark, logo v obraze, collage chaos, rušné pozadí"
}
Pravidla: žádný text v samotném obrázku (text overlay přijde zvlášť). Čistá kompozice, negativní prostor pro overlay.`;
}

export function buildPresetStyleImagePrompt(
  brief: CreativeBrief,
  preset: VisualStylePreset,
  brandColors: string[],
  tone: string
): string {
  const conceptParts = [brief.concept, brief.scene, brief.lighting, brief.composition].filter(Boolean);
  const conceptLine = conceptParts.length > 0
    ? `Visual concept: ${conceptParts.join(". ")}.`
    : "";
  const prompt = [
    `Create a social ad background (${preset.defaultAspectRatio}) for a Czech brand.`,
    conceptLine,
    `Style profile: ${preset.label}.`,
    `Tone of voice: ${tone}.`,
    brandColors.length ? `Brand colors: ${brandColors.join(", ")}.` : "Use clean neutral palette with subtle brand accents.",
    ...preset.promptDirectives.map((d) => `- ${d}`),
    `Hard constraints: ${preset.negativePrompt.join(", ")}.`,
  ].filter(Boolean).join("\n");
  return prompt + " " + STRICT_SUFFIX;
}

export { PLATFORM_FORMATS };
export type { PlatformFormatKey };
