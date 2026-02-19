export type VisualStyleId =
  | "auto"
  | "product_hero"
  | "conversion_clean"
  | "trust_authority"
  | "community_story"
  | "minimal_premium"
  | "bold_growth"
  | "generic_saas"   // legacy -> conversion_clean
  | "minimal_clean"  // legacy -> minimal_premium
  | "brand_product_ad"   // legacy -> product_hero
  | "simby_product_ad";  // legacy -> product_hero

/** Normalize legacy style ids for backward compatibility. */
export function normalizeStyleId(id: string | undefined | null): string {
  if (!id) return id ?? "";
  const LEGACY_MAP: Record<string, string> = {
    simby_product_ad: "product_hero",
    brand_product_ad: "product_hero",
    generic_saas: "conversion_clean",
    minimal_clean: "minimal_premium",
  };
  return LEGACY_MAP[id] ?? id;
}

export type VisualStylePreset = {
  id: Exclude<VisualStyleId, "auto">;
  label: string;
  description: string;
  promptDirectives: string[];
  negativePrompt: string[];
  defaultAspectRatio: "4:5" | "1:1" | "16:9";
  preferredSize: "1080x1350" | "1024x1024" | "1792x1024";
};

type CanonicalStyleId = "product_hero" | "conversion_clean" | "trust_authority" | "community_story" | "minimal_premium" | "bold_growth";

export const VISUAL_STYLE_PRESETS: Record<CanonicalStyleId, VisualStylePreset> = {
  product_hero: {
    id: "product_hero",
    label: "Produktový Hero",
    description: "Čistý produktový SaaS styl s mockupy, UI a profesionálním layoutem.",
    promptDirectives: [
      "clean SaaS product ad",
      "device mockups (laptop/mobile)",
      "UI screenshot style",
      "light gray background",
      "accent CTA feel",
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

  conversion_clean: {
    id: "conversion_clean",
    label: "Conversion clean",
    description: "Čistý produktový vizuál pro konverze, použitelné pro většinu SaaS značek.",
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

  trust_authority: {
    id: "trust_authority",
    label: "Trust & Authority",
    description: "Důvěryhodný, profesionální vizuál s důrazem na autoritu a serióznost.",
    promptDirectives: [
      "professional corporate look",
      "trust-building composition",
      "clean corporate aesthetic",
      "authoritative tone",
      "balanced composition",
    ],
    negativePrompt: [
      "no playful elements",
      "no random text",
      "no watermark",
      "no chaotic layout",
    ],
    defaultAspectRatio: "4:5",
    preferredSize: "1080x1350",
  },

  community_story: {
    id: "community_story",
    label: "Community story",
    description: "Vizuál pro komunitní storytelling a autentický obsah.",
    promptDirectives: [
      "community feel",
      "authentic storytelling",
      "relatable composition",
      "warm and approachable",
      "engagement-focused",
    ],
    negativePrompt: [
      "no cold corporate look",
      "no random text",
      "no watermark",
      "no sterile stock look",
    ],
    defaultAspectRatio: "4:5",
    preferredSize: "1080x1350",
  },

  minimal_premium: {
    id: "minimal_premium",
    label: "Minimal premium",
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
};

export function getPresetById(id: string | undefined | null): VisualStylePreset | undefined {
  const normalized = normalizeStyleId(id);
  return normalized ? (VISUAL_STYLE_PRESETS as Record<string, VisualStylePreset>)[normalized] : undefined;
}

export const CANONICAL_STYLE_IDS: readonly CanonicalStyleId[] = [
  "product_hero",
  "conversion_clean",
  "trust_authority",
  "community_story",
  "minimal_premium",
  "bold_growth",
] as const;
