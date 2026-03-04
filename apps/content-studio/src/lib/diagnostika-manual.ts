/**
 * Sdílené konstanty a logika pro manuální vstup diagnostiky (Nemám web).
 * Používá se na veřejné diagnostice i v adminu Nový klient.
 */

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

export function buildManualData(params: {
  brandName: string;
  offerTypes: string[];
  audience: string[];
  priceLevel: string | null;
  manualOptionalText: string;
}): string {
  const { brandName, offerTypes, audience, priceLevel, manualOptionalText } = params;
  const parts: string[] = [];
  if (brandName.trim()) parts.push(`Název značky: ${brandName.trim()}`);
  if (offerTypes.length) parts.push(`Co nabízíte: ${offerTypes.join(", ")}`);
  if (audience.length) parts.push(`Pro koho: ${audience.join(", ")}`);
  if (priceLevel) parts.push(`Cenová úroveň: ${priceLevel}`);
  if (manualOptionalText.trim()) parts.push(`Popis: ${manualOptionalText.trim()}`);
  return parts.join("\n\n");
}
