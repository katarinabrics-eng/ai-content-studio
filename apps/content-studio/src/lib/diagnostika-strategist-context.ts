/**
 * Sestaví kontext pro stratega z client_project (scan_result + manual_input).
 * Používá se v POST /api/admin/diagnostika/[id]/run-strategist.
 */

type ScanResult = {
  brandScore?: { total?: number; hasHeadline?: boolean; hasOffer?: boolean; hasTargetAudience?: boolean; hasCTA?: boolean; hasVisualIdentity?: boolean; hasSocialProof?: boolean };
  brandDna?: {
    name?: string;
    positioning?: string;
    tone?: string;
    targetAudience?: string;
    communicationStyle?: string;
    uniqueValue?: string;
    contentPillars?: string[];
    missingElements?: string[];
    visualStyle?: { primaryColor?: string; secondaryColor?: string; mood?: string; typography?: string };
  };
  summary?: string;
  pillarAnalysis?: Record<
    string,
    { score?: number; interpretation?: string; observed?: string[]; notObserved?: string[]; reasoning?: string; strategicOpportunity?: string }
  >;
};

export function buildDiagnostikaContext(params: {
  scan_result: ScanResult | Record<string, unknown> | null;
  manual_input: string | null;
  name?: string | null;
  email?: string | null;
  web_url?: string | null;
}): string {
  const lines: string[] = [];
  const { scan_result, manual_input, name, email, web_url } = params;
  const sr = (scan_result ?? {}) as ScanResult;

  if (name?.trim()) lines.push(`Název klienta: ${name.trim()}`);
  if (email?.trim()) lines.push(`Email: ${email.trim()}`);
  if (web_url?.trim()) lines.push(`Web: ${web_url.trim()}`);
  if (manual_input?.trim()) {
    lines.push("");
    lines.push("--- Zadané podklady (klient) ---");
    lines.push(manual_input.trim());
  }

  if (sr.summary?.trim()) {
    lines.push("");
    lines.push("--- Shrnutí analýzy ---");
    lines.push(sr.summary.trim());
  }

  const d = sr.brandDna;
  if (d) {
    lines.push("");
    lines.push("--- Brand DNA ---");
    if (d.name?.trim()) lines.push(`Značka: ${d.name.trim()}`);
    if (d.positioning?.trim()) lines.push(`Positioning: ${d.positioning.trim()}`);
    if (d.tone?.trim()) lines.push(`Tón: ${d.tone.trim()}`);
    if (d.targetAudience?.trim()) lines.push(`Cílová skupina: ${d.targetAudience.trim()}`);
    if (d.communicationStyle?.trim()) lines.push(`Komunikační styl: ${d.communicationStyle.trim()}`);
    if (d.uniqueValue?.trim()) lines.push(`Unikátní hodnota: ${d.uniqueValue.trim()}`);
    if (Array.isArray(d.contentPillars) && d.contentPillars.length)
      lines.push(`Obsahové pilíře: ${d.contentPillars.join(", ")}`);
    if (Array.isArray(d.missingElements) && d.missingElements.length)
      lines.push(`Chybějící prvky: ${d.missingElements.join(", ")}`);
    const vs = d.visualStyle;
    if (vs && (vs.primaryColor || vs.mood || vs.typography)) {
      const vsParts = [vs.primaryColor, vs.secondaryColor, vs.mood, vs.typography].filter(Boolean);
      if (vsParts.length) lines.push(`Vizuální styl: ${vsParts.join(", ")}`);
    }
  }

  const score = sr.brandScore;
  if (score) {
    lines.push("");
    lines.push("--- Brand skóre ---");
    lines.push(`Celkem: ${score.total ?? "—"}`);
    const checks = [
      ["Hlavní zpráva", score.hasHeadline],
      ["Nabídka", score.hasOffer],
      ["Cílová skupina", score.hasTargetAudience],
      ["CTA", score.hasCTA],
      ["Vizuální identita", score.hasVisualIdentity],
      ["Reference", score.hasSocialProof],
    ];
    checks.forEach(([label, val]) => {
      if (val !== undefined) lines.push(`  ${label}: ${val ? "ano" : "ne"}`);
    });
  }

  const pillars = sr.pillarAnalysis;
  if (pillars && typeof pillars === "object") {
    lines.push("");
    lines.push("--- Pilíře analýzy ---");
    for (const [key, p] of Object.entries(pillars)) {
      if (!p || typeof p !== "object") continue;
      const interp = (p as { interpretation?: string }).interpretation;
      const opp = (p as { strategicOpportunity?: string }).strategicOpportunity;
      if (interp?.trim()) lines.push(`${key}: ${interp.trim()}`);
      if (opp?.trim()) lines.push(`  → Příležitost: ${opp.trim()}`);
    }
  }

  return lines.join("\n").trim() || "Žádný kontext k dispozici.";
}
