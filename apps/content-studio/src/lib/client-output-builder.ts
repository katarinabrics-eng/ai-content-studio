import type { ClientProjectRow } from "@/lib/supabase-client-projects";
import { getStrategist, type StrategistId } from "@/lib/strategists/config";
import { STRATEGISTS_META } from "@/lib/strategist-selector";

type ScanResult = ClientProjectRow["scan_result"] & {
  brandDna?: Record<string, unknown>;
  brandScore?: Record<string, unknown>;
  pillarAnalysis?: Record<string, { score?: number; interpretation?: string; strategicOpportunity?: string }>;
  summary?: string;
  strategic_plan?: string | Record<string, unknown>;
  strategist_id?: string;
  posts?: Array<Record<string, unknown>>;
};

function parsePlan(plan: string | Record<string, unknown> | undefined): Record<string, unknown> | null {
  if (plan == null) return null;
  if (typeof plan === "object") return plan;
  try {
    const parsed = JSON.parse(plan as string) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function getStrategistLabel(scan: ScanResult): string {
  const id = scan?.strategist_id;
  if (typeof id === "string") {
    const meta = STRATEGISTS_META.find((m) => m.id === id);
    if (meta) return meta.label;
    const s = getStrategist(id as StrategistId);
    if (s) return s.name;
  }
  return "Strategický plán";
}

function formatVisualStyle(visualStyle: unknown): string {
  if (!visualStyle || typeof visualStyle !== "object") return "—";
  const v = visualStyle as Record<string, unknown>;
  const parts = [
    v.mood,
    v.primaryColor,
    v.secondaryColor,
    v.typography,
  ].filter(Boolean);
  return parts.length ? String(parts.join(", ")) : "—";
}

/** Sestaví strukturovaný text pro Gamma.app. Sekce oddělené \n---\n = jedna karta. */
export function buildGammaInput(project: ClientProjectRow): string {
  const scan = (project.scan_result ?? {}) as ScanResult;
  const rawPlan = scan.strategic_plan;
  const plan = parsePlan(rawPlan);
  const planAsObject = plan ?? (typeof rawPlan === "string" && rawPlan ? { _raw: rawPlan } : null);
  const dna = scan.brandDna ?? {};
  const score = scan.brandScore ?? {};
  const strategistLabel = getStrategistLabel(scan);
  const clientName = project.name ?? "Klient";
  const summary = typeof scan.summary === "string" ? scan.summary : "";
  const mainMessage = summary || (dna.positioning as string) ?? "";

  const cards: string[] = [];

  cards.push(`# ${clientName}
## Strategická cesta vaší značky
### Zpracováno: ${strategistLabel}

*Tento dokument obsahuje vaši osobní strategii, vizuální směr a připravený obsah.*`);

  cards.push(`# Vaše značka v kostce
## Brand DNA

**Název:** ${(dna.name as string) ?? clientName}
**Positioning:** ${(dna.positioning as string) ?? "—"}
**Jedinečná hodnota:** ${(dna.uniqueValue as string) ?? "—"}
**Tón komunikace:** ${(dna.tone as string) ?? "—"}
**Cílová skupina:** ${(dna.targetAudience as string) ?? "—"}

> ${mainMessage}`);

  const pillars = scan.pillarAnalysis ?? {};
  const pillarNames: Record<string, string> = {
    light: "💡 Světlo — jasnost sdělení",
    energy: "⚡ Energie — síla přítomnosti",
    architecture: "🏗️ Architektura — struktura nabídky",
    identity: "🎯 Identita — konzistence značky",
    trust: "🤝 Důvěra — autorita a social proof",
  };
  const pillarLines = Object.entries(pillars).map(([key, val]) => {
    const p = val as { score?: number; interpretation?: string };
    return `**${pillarNames[key] ?? key}:** ${p?.score ?? "?"}/10 — ${p?.interpretation ?? ""}`;
  }).join("\n");

  const offerText = score.hasOffer === true ? "Ano" : score.hasOffer === false ? "Ne" : "—";
  const ctaText = score.hasCTA === true ? "Ano" : score.hasCTA === false ? "Ne" : "—";

  cards.push(`# Výsledky diagnostiky
## Celkové skóre: ${score.total ?? "?"}/100

${pillarLines}

**Nabídka:** ${offerText}
**CTA:** ${ctaText}`);

  if (planAsObject?.executive_summary) {
    cards.push(`# Strategická situace
## Co vidí ${strategistLabel}

${planAsObject.executive_summary}`);
  } else if (planAsObject?._raw && typeof planAsObject._raw === "string") {
    cards.push(`# Strategický plán
## ${strategistLabel}

${planAsObject._raw}`);
  }

  const keySections: Record<string, string> = {
    offer_engineering: "Inženýring nabídky",
    value_formula_analysis: "Analýza hodnoty",
    brandscript: "BrandScript — váš příběh",
    messaging_rewrites: "Přepisy sdělení",
    platform_strategy: "Strategie platforem",
    "30_day_launch_plan": "30denní plán",
    transformation_arc: "Transformační cesta",
    sales_scripts: "Prodejní komunikace",
    niche_definition: "Definice niche a kmene",
    positioning_strategy: "Pozicování",
    value_ladder: "Value Ladder",
    funnel_architecture: "Cesta zákazníka",
    personal_brand_pillars: "Pilíře osobní značky",
    community_strategy: "Strategie komunity",
    trend_relevance_map: "Klíčové trendy pro vaši značku",
    ai_integration_strategy: "AI jako váš nástroj",
  };

  let addedSections = 0;
  for (const [key, label] of Object.entries(keySections)) {
    if (addedSections >= 4) break;
    if (!planAsObject?.[key]) continue;
    const sectionText = formatSectionForGamma(planAsObject[key], label);
    if (sectionText) {
      cards.push(sectionText);
      addedSections++;
    }
  }

  const ap = planAsObject?.action_plan as Record<string, unknown> | undefined;
  if (ap && typeof ap === "object") {
    const p1 = ap.priority_1 as Record<string, unknown> | undefined;
    const p2 = ap.priority_2 as Record<string, unknown> | undefined;
    const p3 = ap.priority_3 as Record<string, unknown> | undefined;
    cards.push(`# Váš akční plán
## Tři kroky které změní se vše

### 🥇 Priorita 1
**${p1?.action ?? "—"}**
${p1?.why ?? ""}
*Termín: ${p1?.timeline ?? "—"}*

### 🥈 Priorita 2
**${p2?.action ?? "—"}**
${p2?.why ?? ""}
*Termín: ${p2?.timeline ?? "—"}*

### 🥉 Priorita 3
**${p3?.action ?? "—"}**
${p3?.why ?? ""}
*Termín: ${p3?.timeline ?? "—"}*`);
  }

  const verdictKey = planAsObject ? Object.keys(planAsObject).find((k) => k.endsWith("_verdict")) : null;
  if (verdictKey && planAsObject?.[verdictKey]) {
    cards.push(`# Závěrečné slovo
## ${strategistLabel} říká:

*"${planAsObject[verdictKey]}"*`);
  }

  const posts = scan.posts ?? [];
  if (posts.length > 0) {
    const postPreview = posts.slice(0, 3).map((p: Record<string, unknown>, i: number) =>
      `### Příspěvek ${i + 1}: ${p.hook ?? p.title ?? ""}
${p.body ?? p.content ?? ""}
**CTA:** ${p.cta ?? "—"}`
    ).join("\n\n");
    cards.push(`# Připravené příspěvky
## 5 textů připravených k publikaci

${postPreview}

*+ další 2 příspěvky v přílohách*`);
  }

  cards.push(`# Co dál?
## Vaše další kroky

✅ Projděte strategický plán a potvrďte směr
✅ Stáhněte si Canva šablony pro příspěvky
✅ Naplánujte první příspěvek na tento týden
✅ Otevřete svůj NotebookLM průvodce — ptejte se na cokoliv

---

*Připraveno pro vás týmem Studio Lucifera*
*Máte otázky? Odpovědi najdete ve vašem osobním průvodci (NotebookLM)*`);

  return cards.join("\n---\n");
}

function formatSectionForGamma(section: unknown, label: string): string | null {
  if (section == null || typeof section !== "object") return null;
  const lines: string[] = [`# ${label}`];

  const formatValue = (val: unknown, depth: number): string => {
    if (typeof val === "string") return val;
    if (typeof val === "number") return String(val);
    if (Array.isArray(val)) {
      return val.map((v) =>
        typeof v === "string" ? `• ${v}` : formatValue(v, depth + 1)
      ).join("\n");
    }
    if (typeof val === "object" && val !== null) {
      return Object.entries(val).map(([k, v]) => {
        const lbl = k.replace(/_/g, " ");
        return `**${lbl}:** ${formatValue(v, depth + 1)}`;
      }).join("\n");
    }
    return String(val);
  };

  const entries = Object.entries(section as Record<string, unknown>).slice(0, 5);
  for (const [key, val] of entries) {
    if (key === "_raw") continue;
    if (typeof val === "string" && val.length > 10) {
      lines.push(`## ${key.replace(/_/g, " ")}\n${val}`);
    } else if (typeof val === "object") {
      lines.push(`## ${key.replace(/_/g, " ")}\n${formatValue(val, 0)}`);
    }
  }
  return lines.join("\n\n");
}

// ─────────────────────────────────────────────────────────────
// NOTEBOOKLM SOURCES
// ─────────────────────────────────────────────────────────────

export interface NotebookLMSource {
  filename: string;
  title: string;
  content: string;
  description: string;
}

export function buildNotebookLMSources(project: ClientProjectRow): NotebookLMSource[] {
  const scan = (project.scan_result ?? {}) as ScanResult;
  const rawPlan = scan.strategic_plan;
  const plan = parsePlan(rawPlan);
  const planAsObject = plan ?? (typeof rawPlan === "string" && rawPlan ? { _raw: rawPlan } : null);
  const dna = scan.brandDna ?? {};
  const score = scan.brandScore ?? {};
  const pillars = scan.pillarAnalysis ?? {};
  const clientName = project.name ?? "Klient";
  const strategistLabel = getStrategistLabel(scan);
  const visualStr = formatVisualStyle(dna.visualStyle);
  const summary = typeof scan.summary === "string" ? scan.summary : "neuvedeno";
  const offerText = score.hasOffer === true ? "Ano" : score.hasOffer === false ? "Ne" : "neuvedeno";
  const ctaText = score.hasCTA === true ? "Ano" : score.hasCTA === false ? "Ne" : "neuvedeno";

  const sources: NotebookLMSource[] = [];

  sources.push({
    filename: `${clientName}_brand_dna.txt`,
    title: "Brand DNA a výsledky diagnostiky",
    description: "Základ značky — kdo jsi, pro koho pracuješ, jak komunikuješ",
    content: `BRAND DNA — ${clientName}
${"=".repeat(50)}

NÁZEV ZNAČKY: ${(dna.name as string) ?? clientName}
POSITIONING: ${(dna.positioning as string) ?? "neuvedeno"}
JEDINEČNÁ HODNOTA: ${(dna.uniqueValue as string) ?? "neuvedeno"}
TÓN KOMUNIKACE: ${(dna.tone as string) ?? "neuvedeno"}
KOMUNIKAČNÍ STYL: ${(dna.communicationStyle as string) ?? "neuvedeno"}
CÍLOVÁ SKUPINA: ${(dna.targetAudience as string) ?? "neuvedeno"}
VIZUÁLNÍ IDENTITA: ${visualStr}

VÝSLEDKY DIAGNOSTIKY
${"─".repeat(40)}
Celkové skóre: ${score.total ?? "?"}/100
Shrnutí: ${summary}
Nabídka: ${offerText}
CTA: ${ctaText}

PILÍŘE ZNAČKY
${"─".repeat(40)}
${Object.entries(pillars).map(([key, val]) => {
  const p = val as { score?: number; interpretation?: string; strategicOpportunity?: string };
  return `
${key.toUpperCase()} — ${p?.score ?? "?"}/10
Interpretace: ${p?.interpretation ?? ""}
Strategická příležitost: ${p?.strategicOpportunity ?? ""}
`;
}).join("")}

SHRNUTÍ DIAGNOSTIKY
${"─".repeat(40)}
${summary}
`,
  });

  if (planAsObject) {
    const planText = typeof planAsObject._raw === "string"
      ? planAsObject._raw
      : formatPlanAsText(planAsObject);
    sources.push({
      filename: `${clientName}_strategicky_plan.txt`,
      title: `Strategický plán — ${strategistLabel}`,
      description: `Kompletní strategický plán podle metodologie ${strategistLabel}`,
      content: `STRATEGICKÝ PLÁN — ${clientName}
Stratég: ${strategistLabel}
${"=".repeat(50)}

${planText}
`,
    });
  }

  const ap = planAsObject?.action_plan as Record<string, unknown> | undefined;
  if (ap && typeof ap === "object") {
    const p1 = ap.priority_1 as Record<string, unknown> | undefined;
    const p2 = ap.priority_2 as Record<string, unknown> | undefined;
    const p3 = ap.priority_3 as Record<string, unknown> | undefined;
    const verdictKey = planAsObject ? Object.keys(planAsObject).find((k) => k.endsWith("_verdict")) : null;
    const verdictBlock = verdictKey && planAsObject?.[verdictKey]
      ? `\nZÁVĚREČNÉ SLOVO STRATÉGA\n${"─".repeat(40)}\n${planAsObject[verdictKey]}`
      : "";

    sources.push({
      filename: `${clientName}_akcni_plan.txt`,
      title: "Akční plán — co dělat a kdy",
      description: "Tři prioritní kroky s termíny a konkrétními instrukcemi",
      content: `AKČNÍ PLÁN — ${clientName}
${"=".repeat(50)}

PRIORITA 1: ${p1?.action ?? "—"}
Proč: ${p1?.why ?? ""}
Jak: ${p1?.how ?? ""}
Termín: ${p1?.timeline ?? "—"}

PRIORITA 2: ${p2?.action ?? "—"}
Proč: ${p2?.why ?? ""}
Jak: ${p2?.how ?? ""}
Termín: ${p2?.timeline ?? "—"}

PRIORITA 3: ${p3?.action ?? "—"}
Proč: ${p3?.why ?? ""}
Jak: ${p3?.how ?? ""}
Termín: ${p3?.timeline ?? "—"}
${verdictBlock}
`,
    });
  }

  const posts = scan.posts ?? [];
  if (posts.length > 0) {
    const postsText = posts.map((p: Record<string, unknown>, i: number) => `
PŘÍSPĚVEK ${i + 1}
${"─".repeat(40)}
Hook: ${p.hook ?? p.title ?? ""}
Tělo: ${p.body ?? p.content ?? ""}
CTA: ${p.cta ?? "—"}
Hashtags: ${Array.isArray(p.hashtags) ? p.hashtags.join(" ") : "—"}
Canva šablona: ${p.canvaTemplate ?? "—"}
`).join("\n");
    sources.push({
      filename: `${clientName}_prispevky.txt`,
      title: "5 připravených příspěvků",
      description: "Hotové texty příspěvků připravené k publikaci s Canva šablonami",
      content: `PŘIPRAVENÉ PŘÍSPĚVKY — ${clientName}
${"=".repeat(50)}
${postsText}
`,
    });
  }

  sources.push({
    filename: `${clientName}_pruvodce_notebooklm.txt`,
    title: "Průvodce — jak pracovat s tímto notebookem",
    description: "Instrukce pro AI v NotebookLM jak odpovídat na dotazy klienta",
    content: `PRŮVODCE PRO AI ASISTENTA — ${clientName}
${"=".repeat(50)}

Jsi osobní průvodce strategií značky ${(dna.name as string) ?? clientName}.
Máš k dispozici kompletní Brand DNA, diagnostiku a strategický plán.

JAK ODPOVÍDAT:
- Vždy odpovídej konkrétně na základě dat v tomto notebooku
- Pokud se ptají na strategii, odkazuj na konkrétní části plánu
- Pokud se ptají "co mám dělat", ukaž na akční plán
- Mluv v první osobě množného čísla jako součást týmu ("navrhujeme", "doporučujeme")
- Tón: přátelský, sebejistý, konkrétní — bez zbytečného omáčkování

ČASTÉ OTÁZKY KTERÉ KLIENT BUDE KLÁST:
- "Kdo je moje cílová skupina?" → Brand DNA, cílová skupina
- "Co mám publikovat?" → Příspěvky, content pillars ze stratéga
- "Jak začít?" → Akční plán, Priorita 1
- "Proč je moje skóre X?" → Diagnostika, pilíře
- "Co mi říká stratég?" → Executive summary + verdict

KONTEXT PROJEKTU:
Klient: ${clientName}
Stratég: ${strategistLabel}
Datum zpracování: ${new Date().toLocaleDateString("cs-CZ")}
Zpracováno: Studio Lucifera
`,
  });

  return sources;
}

function formatPlanAsText(plan: Record<string, unknown>, depth = 0): string {
  const skip = ["strategist", "strategist_label", "strategist_tagline", "_raw"];
  const lines: string[] = [];
  const indent = "  ".repeat(depth);

  for (const [key, val] of Object.entries(plan)) {
    if (skip.includes(key)) continue;
    const label = key.replace(/_/g, " ").toUpperCase();

    if (typeof val === "string") {
      lines.push(`${indent}${label}:\n${indent}${val}\n`);
    } else if (typeof val === "number" || typeof val === "boolean") {
      lines.push(`${indent}${label}: ${val}`);
    } else if (Array.isArray(val)) {
      lines.push(`${indent}${label}:`);
      val.forEach((item, i) => {
        if (typeof item === "string") {
          lines.push(`${indent}  ${i + 1}. ${item}`);
        } else if (typeof item === "object" && item !== null) {
          lines.push(`${indent}  — ${formatPlanAsText(item as Record<string, unknown>, depth + 2)}`);
        }
      });
      lines.push("");
    } else if (typeof val === "object" && val !== null) {
      lines.push(`${indent}${label}:`);
      lines.push(`${"─".repeat(40 - depth * 2)}`);
      lines.push(formatPlanAsText(val as Record<string, unknown>, depth + 1));
    }
  }

  return lines.join("\n");
}
