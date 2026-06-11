/** Dominant colors and mood for visual prompts. Uses intake (brandAssets) + style/tone. */
export type WebStyleContext = {
  dominantColors: string[];
  moodKeywords: string[];
};

const STYLE_TO_MOOD: Record<string, string[]> = {
  humor: ["playful", "friendly", "light", "approachable"],
  storytelling: ["narrative", "emotional", "warm", "engaging"],
  edukace: ["clean", "informative", "clear", "professional"],
  prodejní: ["premium", "confident", "dynamic", "conversion-focused"],
};

/** Derive web-style context from intake. Fallback: intake brand colors + stylePreference/toneOfVoice. */
export function getWebStyleFromIntake(intakePayload: Record<string, unknown>): WebStyleContext {
  const brandAssets = (intakePayload.brandAssets ?? {}) as Record<string, unknown>;
  const colorsRaw = brandAssets.colors;
  const dominantColors: string[] = [];
  if (typeof colorsRaw === "string" && colorsRaw.trim()) {
    const hex = colorsRaw.match(/#?[0-9A-Fa-f]{3,6}/g);
    if (hex) {
      hex.forEach((c) => dominantColors.push(c.startsWith("#") ? c : `#${c}`));
    }
  }
  if (Array.isArray(colorsRaw)) {
    (colorsRaw as string[]).forEach((c) => {
      if (typeof c === "string" && /^#?[0-9A-Fa-f]{3,6}$/.test(c)) {
        dominantColors.push(c.startsWith("#") ? c : `#${c}`);
      }
    });
  }

  const stylePreference = String(intakePayload.stylePreference ?? "edukace");
  const toneOfVoice = String(intakePayload.toneOfVoice ?? "").toLowerCase();
  const moodKeywords: string[] = [...(STYLE_TO_MOOD[stylePreference] ?? ["modern", "clean", "professional"])];
  if (toneOfVoice.includes("premium") || toneOfVoice.includes("luxus")) moodKeywords.push("premium", "minimalist");
  if (toneOfVoice.includes("minimal") || toneOfVoice.includes("jednoduch")) moodKeywords.push("minimalist");
  if (toneOfVoice.includes("odváž") || toneOfVoice.includes("bold")) moodKeywords.push("bold", "confident");

  return {
    dominantColors: dominantColors.slice(0, 5),
    moodKeywords: Array.from(new Set(moodKeywords)).slice(0, 6),
  };
}
