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
  } | null;
};

export function projectToStrategistParams(project: ProjectWithBrief): Record<string, string> {
  const brief = project.brief;
  const brand = brief?.brand_name ?? "—";
  const goal = brief?.communication_goal ?? "";
  const note = brief?.note ?? "";
  const combined = [brand, brief?.industry, goal].filter(Boolean).join(" · ");
  return {
    produkt_sluzba: combined || (project.client_email ?? ""),
    tema_napad: goal || brand,
    cil: goal || brand,
    sdeleni_text: note || goal || brand,
    produkt: brand || (project.plan_id ?? ""),
  };
}

export function isValidStrategistId(id: string): id is StrategistId {
  return [
    "hormozi",
    "garyvee",
    "tonyrobbins",
    "donaldmiller",
    "sigrun",
    "trend2026",
  ].includes(id);
}
