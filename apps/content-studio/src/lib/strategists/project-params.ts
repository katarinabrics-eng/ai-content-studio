import type { StrategistId } from "./config";

type ProjectWithBrief = {
  id: string;
  plan_id?: string;
  client_email?: string | null;
  brief?: {
    brand_name?: string | null;
    industry?: string | null;
    communication_goal?: string | null;
    note?: string | null;
    platforms?: string[] | null;
    tone_of_voice?: string | null;
    target_audience?: string | null;
    offers?: string | null;
    preferred_style?: string | null;
    preferred_cta?: string | null;
    brand_colors?: string | null;
    brand_fonts?: string | null;
    website_or_profile?: string | null;
  } | null;
};

function cenovaUroven(plan_id?: string): string {
  if (!plan_id) return "—";
  const p = plan_id.toLowerCase();
  if (p.includes("premium") || p.includes("prémi")) return "Prémiová";
  if (p.includes("stredni") || p.includes("standard") || p.includes("pro")) return "Střední";
  return "Základní";
}

export function projectToStrategistParams(project: ProjectWithBrief): Record<string, string> {
  const brief = project.brief;
  const brand = brief?.brand_name ?? "—";
  const goal = brief?.communication_goal ?? "";
  const note = brief?.note ?? "";
  const combined = [brand, brief?.industry, goal].filter(Boolean).join(" · ");

  const kontextLines: string[] = [
    `Značka: ${brand}`,
    `Obor: ${brief?.industry ?? "—"}`,
    `Cíl komunikace: ${goal || "—"}`,
    `Cenová úroveň: ${cenovaUroven(project.plan_id)}`,
    `Tonalita: ${brief?.tone_of_voice ?? "—"}`,
    `Cílová skupina: ${brief?.target_audience ?? "—"}`,
    `Nabídky/produkty: ${brief?.offers ?? "—"}`,
    `Platformy: ${Array.isArray(brief?.platforms) ? brief.platforms.join(", ") : "—"}`,
    `Preferovaný styl: ${brief?.preferred_style ?? "—"}`,
    `Preferovaná CTA: ${brief?.preferred_cta ?? "—"}`,
    `Barvy: ${brief?.brand_colors ?? "—"}`,
    `Fonty: ${brief?.brand_fonts ?? "—"}`,
    `Web/profil: ${brief?.website_or_profile ?? "—"}`,
    `Poznámka: ${note || "—"}`,
  ];
  const kontext = kontextLines.join("\n");

  return {
    kontext,
    produkt_sluzba: combined || (project.client_email ?? ""),
    tema_napad: goal || brand,
    cil: goal || brand,
    sdeleni_text: note || goal || brand,
    produkt: brand || (project.plan_id ?? ""),
  };
}

const VALID_STRATEGIST_IDS: StrategistId[] = [
  "the_architect",
  "the_illuminator",
  "the_pulse",
  "the_catalyst",
  "the_signal",
  "the_pathfinder",
  "the_luminary",
  "the_horizon",
  "the_content_voice",
];

export function isValidStrategistId(id: string): id is StrategistId {
  return VALID_STRATEGIST_IDS.includes(id as StrategistId);
}
