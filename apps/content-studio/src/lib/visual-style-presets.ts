export type VisualStyleId =
  | "auto"
  | "generic_saas"
  | "minimal_clean"
  | "bold_growth"
  | "simby_product_ad";

export type VisualStylePreset = {
  id: Exclude<VisualStyleId, "auto">;
  label: string;
  description: string;
  promptDirectives: string[];
  negativePrompt: string[];
  defaultAspectRatio: "4:5" | "1:1" | "16:9";
  preferredSize: "1080x1350" | "1024x1024" | "1792x1024";
};

export const VISUAL_STYLE_PRESETS: Record<
  Exclude<VisualStyleId, "auto">,
  VisualStylePreset
> = {
  generic_saas: {
    id: "generic_saas",
    label: "SaaS (obecný)",
    description: "Čistý produktový vizuál, použitelné pro většinu SaaS značek.",
    promptDirectives: [
      "clean SaaS composition",
      "product UI/device mockup feel",
      "clear hierarchy",
      "professional ad creative",
      "negative space for text overlay",
    ],
    negativePrompt: [
      "no random text",
      "no gibberish letters",
      "no watermark",
      "no chaotic collage",
      "no low quality stock look",
    ],
    defaultAspectRatio: "4:5",
    preferredSize: "1080x1350",
  },

  minimal_clean: {
    id: "minimal_clean",
    label: "Minimal clean",
    description: "Minimalistický, elegantní, světlý a čistý styl.",
    promptDirectives: [
      "minimal design",
      "soft shadows",
      "balanced whitespace",
      "premium clean look",
      "subtle depth",
    ],
    negativePrompt: [
      "no clutter",
      "no heavy textures",
      "no random text",
      "no watermark",
    ],
    defaultAspectRatio: "4:5",
    preferredSize: "1080x1350",
  },

  bold_growth: {
    id: "bold_growth",
    label: "Bold growth",
    description: "Dynamický výkonový vizuál s důrazem na růst/akci.",
    promptDirectives: [
      "dynamic composition",
      "growth visuals",
      "bold contrast",
      "high energy marketing creative",
      "clear focal point",
    ],
    negativePrompt: [
      "no messy layout",
      "no random text",
      "no watermark",
      "no distorted faces",
    ],
    defaultAspectRatio: "4:5",
    preferredSize: "1080x1350",
  },

  simby_product_ad: {
    id: "simby_product_ad",
    label: "SIMBY produktový creative",
    description: "SaaS produktový styl inspirovaný SIMBY layoutem.",
    promptDirectives: [
      "clean SaaS product ad",
      "device mockups (laptop/mobile)",
      "UI screenshot style",
      "light gray background",
      "green accent CTA feel",
      "premium Czech SaaS landing aesthetic",
    ],
    negativePrompt: [
      "no random people-only portrait",
      "no random text blocks",
      "no gibberish letters",
      "no watermark",
      "no chaotic collage",
    ],
    defaultAspectRatio: "4:5",
    preferredSize: "1080x1350",
  },
};

export function getPresetById(id: string): VisualStylePreset | undefined {
  return (VISUAL_STYLE_PRESETS as Record<string, VisualStylePreset>)[id];
}
