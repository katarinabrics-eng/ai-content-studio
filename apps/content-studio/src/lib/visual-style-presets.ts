export type VisualStylePreset = {
  id: string;
  label: string;
  palette: string[];
  moodKeywords: string[];
  negativePrompt: string;
};

export const VISUAL_STYLE_PRESETS: VisualStylePreset[] = [
  {
    id: "katarina_signature",
    label: "Katarina signature",
    palette: [],
    moodKeywords: ["elegant", "professional", "warm"],
    negativePrompt: "chaos, collage, gibberish, watermark",
  },
  {
    id: "minimal_clean",
    label: "Minimal clean",
    palette: [],
    moodKeywords: ["minimalist", "clean", "simple"],
    negativePrompt: "busy, cluttered, text in image",
  },
  {
    id: "bold_growth",
    label: "Bold growth",
    palette: [],
    moodKeywords: ["bold", "dynamic", "confident"],
    negativePrompt: "boring, flat, low contrast",
  },
  {
    id: "simby_clean_saas",
    label: "SIMBY clean SaaS",
    palette: ["#22c55e", "#f8fafc", "#0f172a"],
    moodKeywords: ["clean", "SaaS", "UI", "cards", "device mockup"],
    negativePrompt: "random collage, gibberish text, watermark, chaotic",
  },
];

export function getPresetById(id: string): VisualStylePreset | undefined {
  return VISUAL_STYLE_PRESETS.find((p) => p.id === id);
}
