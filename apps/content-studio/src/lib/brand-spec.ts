/** Source of truth for brand constraints from intake payload */
export type BrandSpec = {
  colors: string[];
  logoUrl?: string;
  fonts: string[];
  toneOfVoice?: string;
  forbiddenWords: string[];
  platforms: ("instagram" | "facebook" | "linkedin")[];
  stylePreference?: "humor" | "storytelling" | "edukace" | "prodejní";
};

const HEX_REGEX = /#?[0-9A-Fa-f]{6}|#?[0-9A-Fa-f]{3}/g;

function parseHexColors(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string" && /^#?[0-9A-Fa-f]{3,6}$/.test(x));
  }
  if (typeof raw === "string") {
    return (raw.match(HEX_REGEX) ?? []).map((c) => (c.startsWith("#") ? c : `#${c}`));
  }
  return [];
}

function parseFonts(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string").slice(0, 5);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(/[,;]/).map((s) => s.trim()).filter(Boolean).slice(0, 5);
  }
  return [];
}

function parseForbiddenWords(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(/[,;]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  }
  return [];
}

function parsePlatforms(raw: unknown): ("instagram" | "facebook" | "linkedin")[] {
  const valid = ["instagram", "facebook", "linkedin"] as const;
  if (Array.isArray(raw)) {
    return raw.filter((x): x is (typeof valid)[number] => valid.includes(x as (typeof valid)[number]));
  }
  return ["instagram"];
}

function parseStyle(raw: unknown): "humor" | "storytelling" | "edukace" | "prodejní" | undefined {
  const valid = ["humor", "storytelling", "edukace", "prodejní"] as const;
  if (typeof raw === "string" && valid.includes(raw as (typeof valid)[number])) {
    return raw as (typeof valid)[number];
  }
  return undefined;
}

/** Extract brand spec from intake payload. Returns defaults for missing fields. */
export function getBrandSpecFromIntake(intakePayload: Record<string, unknown>): BrandSpec {
  const brandAssets = (intakePayload.brandAssets ?? {}) as Record<string, unknown>;
  const logo = brandAssets.logo ?? brandAssets.logoUrl;
  const logoUrl = typeof logo === "string" && logo.trim() ? logo.trim() : undefined;

  const colorsRaw = brandAssets.colors ?? intakePayload.brandColors;
  const fontsRaw = brandAssets.fonts ?? intakePayload.brandFonts;

  return {
    colors: parseHexColors(colorsRaw),
    logoUrl,
    fonts: parseFonts(fontsRaw),
    toneOfVoice: typeof intakePayload.toneOfVoice === "string" ? intakePayload.toneOfVoice.trim() : undefined,
    forbiddenWords: parseForbiddenWords(intakePayload.forbiddenWords),
    platforms: parsePlatforms(intakePayload.platforms),
    stylePreference: parseStyle(intakePayload.stylePreference),
  };
}
