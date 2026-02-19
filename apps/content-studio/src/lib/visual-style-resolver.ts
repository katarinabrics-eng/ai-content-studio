import {
  VISUAL_STYLE_PRESETS,
  type VisualStyleId,
  type VisualStylePreset,
} from "@/lib/visual-style-presets";

type ResolveInput = {
  requestedStyleId?: VisualStyleId;
  brandName?: string;
  website?: string;
};

type ResolveResult = {
  preset: VisualStylePreset;
  source: "manual" | "auto_brand_rule" | "auto_default";
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
    return {
      preset: VISUAL_STYLE_PRESETS[requested],
      source: "manual",
    };
  }

  // auto brand-specific
  if (isSimby(input.brandName, input.website)) {
    return {
      preset: VISUAL_STYLE_PRESETS.simby_product_ad,
      source: "auto_brand_rule",
    };
  }

  // default generic
  return {
    preset: VISUAL_STYLE_PRESETS.generic_saas,
    source: "auto_default",
  };
}
