import { getPresetById } from "./visual-style-presets";
import type { BrandSpec } from "./brand-spec";

export type ResolvedVisualStyle = {
  palette: string[];
  moodKeywords: string[];
  negativePrompt: string;
  visualStyle: string;
  visualStyleLabel: string;
  visualStyleSource: "preset" | "brand" | "default";
};

export function resolveVisualStyle(
  presetId: string | undefined,
  brandSpec: BrandSpec,
  moodKeywordsFallback: string[]
): ResolvedVisualStyle {
  const preset = presetId ? getPresetById(presetId) : undefined;

  if (preset) {
    return {
      palette: brandSpec.colors,
      moodKeywords: preset.promptDirectives.length > 0 ? preset.promptDirectives : moodKeywordsFallback,
      negativePrompt: Array.isArray(preset.negativePrompt) ? preset.negativePrompt.join(", ") : String(preset.negativePrompt ?? ""),
      visualStyle: preset.id,
      visualStyleLabel: preset.label,
      visualStyleSource: "preset",
    };
  }

  if (brandSpec.colors.length > 0) {
    return {
      palette: brandSpec.colors,
      moodKeywords: moodKeywordsFallback,
      negativePrompt: "text in image, watermark, gibberish, chaos",
      visualStyle: "brand",
      visualStyleLabel: "Brand palette",
      visualStyleSource: "brand",
    };
  }

  return {
    palette: [],
    moodKeywords: moodKeywordsFallback,
    negativePrompt: "text in image, watermark, gibberish, chaos",
    visualStyle: "default",
    visualStyleLabel: "Default",
    visualStyleSource: "default",
  };
}
