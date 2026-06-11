/**
 * Sdílené konstanty a logika pro manuální vstup diagnostiky (Nemám web).
 * Používá se na veřejné diagnostice i v adminu Nový klient.
 */

/** Pole, která mohou chybět po analýze webu – zobrazí se v druhém kroku jako doplňovací formulář. */
export type MissingFieldKey =
  | "preferred_style"
  | "brand_colors"
  | "brand_fonts"
  | "tone_of_voice"
  | "positioning"
  | "target_audience";

/** Popisky pro UI (druhý krok „doplň chybějící“). */
export const MISSING_FIELD_LABELS: Record<MissingFieldKey, string> = {
  preferred_style: "Preferovaný styl",
  brand_colors: "Barvy značky",
  brand_fonts: "Fonty",
  tone_of_voice: "Co chcete vyzařovat",
  positioning: "Hlavní sdělení / positioning",
  target_audience: "Cílová skupina",
};

export const MANUAL_OFFER_TYPES = [
  "Konzultace",
  "Online kurz",
  "Produkt",
  "Kreativní služba",
  "Péče / zdraví",
  "Technologie",
  "Jiné",
] as const;

export const MANUAL_AUDIENCE = [
  "Podnikatelé a manažeři",
  "Ženy budující osobní značku",
  "Malé a střední firmy",
  "Kreativci a freelanceři",
  "Začátečníci",
  "Široká veřejnost",
] as const;

export const MANUAL_PRICE_LEVELS = ["Základní", "Střední", "Prémiová"] as const;

export const MAX_OFFER_SELECT = 2;
export const MAX_AUDIENCE_SELECT = 2;

/** Možnosti stylu pro Nemám web a doplňovací krok (id → label). */
export const MANUAL_STYLE_OPTIONS: { id: string; label: string }[] = [
  { id: "minimal_premium", label: "Minimal premium" },
  { id: "conversion_clean", label: "Conversion clean" },
  { id: "trust_authority", label: "Trust & Authority" },
  { id: "community_story", label: "Community story" },
  { id: "bold_growth", label: "Bold growth" },
  { id: "product_hero", label: "Produktový Hero" },
];

/** Volitelné vizuální / tónové údaje (Nemám web i doplňovací krok po analýze). */
export type ManualVisualParams = {
  preferred_style?: string | null;
  brand_colors?: string | null;
  brand_fonts?: string | null;
  tone_of_voice?: string | null;
  positioning?: string | null;
  target_audience?: string | null;
};

export function buildManualData(
  params: {
    brandName: string;
    offerTypes: string[];
    audience: string[];
    priceLevel: string | null;
    manualOptionalText: string;
  } & Partial<ManualVisualParams>
): string {
  const {
    brandName,
    offerTypes,
    audience,
    priceLevel,
    manualOptionalText,
    preferred_style,
    brand_colors,
    brand_fonts,
    tone_of_voice,
    positioning,
    target_audience,
  } = params;
  const parts: string[] = [];
  if (brandName.trim()) parts.push(`Název značky: ${brandName.trim()}`);
  if (offerTypes.length) parts.push(`Co nabízíte: ${offerTypes.join(", ")}`);
  if (audience.length) parts.push(`Pro koho: ${audience.join(", ")}`);
  if (priceLevel) parts.push(`Cenová úroveň: ${priceLevel}`);
  if (manualOptionalText.trim()) parts.push(`Popis: ${manualOptionalText.trim()}`);
  if (preferred_style?.trim()) parts.push(`Preferovaný styl: ${preferred_style.trim()}`);
  if (brand_colors?.trim()) parts.push(`Barvy: ${brand_colors.trim()}`);
  if (brand_fonts?.trim()) parts.push(`Fonty: ${brand_fonts.trim()}`);
  if (tone_of_voice?.trim()) parts.push(`Co vyzařovat / tón: ${tone_of_voice.trim()}`);
  if (positioning?.trim()) parts.push(`Hlavní sdělení / positioning: ${positioning.trim()}`);
  if (target_audience?.trim()) parts.push(`Cílová skupina: ${target_audience.trim()}`);
  return parts.join("\n\n");
}
