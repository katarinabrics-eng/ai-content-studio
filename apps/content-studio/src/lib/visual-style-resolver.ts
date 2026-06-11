import {
  VISUAL_STYLE_PRESETS,
  normalizeStyleId,
  type VisualStyleId,
  type VisualStylePreset,
} from "@/lib/visual-style-presets";

type ResolveInput = {
  requestedStyleId?: VisualStyleId;
  brandName?: string;
  website?: string;
};

export type ResolveResult = {
  preset: VisualStylePreset;
  source: "manual" | "auto_brand_rule" | "auto_default";
  brandContextApplied: boolean;
};

function normalizeHost(url?: string): string {
  if (!url) return "";
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isSimby(brandName?: string, website?: string): boolean {
  const host = normalizeHost(website);
  const b = (brandName || "").toLowerCase();
  return b.includes("simby") || host.includes("simby.cz");
}

export function resolveVisualStyle(input: ResolveInput): ResolveResult {
  const requested = input.requestedStyleId ?? "auto";

  // manual override
  if (requested !== "auto") {
    const normalized = normalizeStyleId(requested);
    const preset = VISUAL_STYLE_PRESETS[normalized as keyof typeof VISUAL_STYLE_PRESETS];
    return {
      preset: preset ?? VISUAL_STYLE_PRESETS.conversion_clean,
      source: "manual",
      brandContextApplied: false,
    };
  }

  // auto brand-specific (detect brand by domain/brandName; output uses generic label)
  if (isSimby(input.brandName, input.website)) {
    return {
      preset: VISUAL_STYLE_PRESETS.product_hero,
      source: "auto_brand_rule",
      brandContextApplied: true,
    };
  }

  // default generic
  return {
    preset: VISUAL_STYLE_PRESETS.conversion_clean,
    source: "auto_default",
    brandContextApplied: false,
  };
}
