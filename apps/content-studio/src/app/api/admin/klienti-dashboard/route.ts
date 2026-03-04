import { NextResponse } from "next/server";
import { listClientProjects } from "@/lib/supabase-client-projects";
import { listProjects, getWorkflowStateForProjects } from "@/lib/supabase-projects";
import { computeProjectStatus } from "@/lib/project-status-engine";
import type { ClientProjectRow } from "@/lib/supabase-client-projects";
import type { ProjectWithBriefAndMeta } from "@/lib/supabase-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DashboardStatus = "diagnostika" | "aktivni" | "zakazka" | "archivovano";

function mapClientProjectStatus(cp: ClientProjectRow): DashboardStatus {
  if (cp.status === "done") return "archivovano";
  const expiresAt = cp.access_expires_at ? new Date(cp.access_expires_at).getTime() : 0;
  if (expiresAt > 0 && Date.now() > expiresAt) return "archivovano";
  if (cp.payment_status === "paid") return "zakazka";
  if (cp.workflow_status === "DIAG_SENT_TO_CLIENT" || cp.workflow_status === "DIAG_DELIVERED") return "aktivni";
  return "diagnostika";
}

function mapProjectStatus(displayStatus: string): DashboardStatus {
  if (displayStatus === "DONE" || displayStatus === "CLOSED" || displayStatus === "ERROR") return "archivovano";
  if (displayStatus === "PAID" || displayStatus === "APPROVED_SCHEDULED" || displayStatus === "FINAL_READY" || displayStatus === "IN_PRODUCTION") return "zakazka";
  return "aktivni";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "2-digit", year: "numeric" }).replace(/\s/g, " ");
}

function initials(email: string | null, name: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    const local = email.split("@")[0];
    if (local.length >= 2) return local.slice(0, 2).toUpperCase();
    return local.slice(0, 1).toUpperCase() + (local[1] ?? "").toUpperCase();
  }
  return "?";
}

/** GET – agreguje client_projects + projects do tvaru pro dashboard Klienti (bez změny DB). */
export async function GET() {
  try {
    const [clientProjects, projects] = await Promise.all([
      listClientProjects(),
      listProjects(),
    ]);
    const stateMap = await getWorkflowStateForProjects(projects);

    const emailToClient: Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        brand: string;
        avatar: string;
        expanded: boolean;
        projects: Array<{
          id: string;
          name: string;
          status: DashboardStatus;
          created: string;
          expires: string | null;
          services: string[];
          notes: string | null;
          timeline: Array< { date: string; event: string; type: "auto" | "client" | "admin" }>;
          source: "client_project" | "project";
          clientProjectId?: string;
          projectId?: string;
          sortAt?: string;
        }>;
      }
    > = new Map();

    for (const cp of clientProjects) {
      const email = (cp.email ?? cp.web_url ?? cp.id).trim() || "bez-emailu";
      if (!emailToClient.has(email)) {
        emailToClient.set(email, {
          id: email,
          name: cp.name ?? email.split("@")[0] ?? "Klient",
          email: cp.email ?? "",
          brand: (() => { try { return cp.web_url ? new URL(cp.web_url).hostname.replace(/^www\./, "") : "Diagnostika"; } catch { return "Diagnostika"; } })(),
          avatar: initials(cp.email, cp.name),
          expanded: false,
          projects: [],
        });
      }
      const status = mapClientProjectStatus(cp);
      const created = formatDate(cp.created_at);
      const expires = cp.access_expires_at ? formatDate(cp.access_expires_at) : null;
      const timeline: Array<{ date: string; event: string; type: "auto" | "client" | "admin" }> = [
        { date: created, event: "Diagnostika vytvořena", type: "auto" },
      ];
      if (cp.workflow_status && cp.workflow_status !== "DIAG_AI_PROCESSING" && cp.workflow_status !== "DIAG_AWAITING_CURATOR") {
        timeline.push({ date: created, event: "Krok: " + cp.workflow_status.replace("DIAG_", ""), type: "admin" });
      }
      if (cp.payment_status === "paid") {
        timeline.push({ date: cp.booking_date ?? created, event: "Zakázka zaplacena", type: "client" });
      }
      emailToClient.get(email)!.projects.push({
        id: cp.id,
        name: "Diagnostika " + created,
        status,
        created,
        expires,
        services: [],
        notes: null,
        timeline,
        source: "client_project",
        clientProjectId: cp.id,
        sortAt: cp.created_at,
      });
    }

    for (const p of projects) {
      const proj = p as ProjectWithBriefAndMeta;
      const email = (proj.client_email ?? "").trim() || "bez-emailu";
      const state = stateMap.get(proj.id);
      const displayStatus = state ? computeProjectStatus(state) : (proj.status as string);
      const status = mapProjectStatus(displayStatus);
      if (!emailToClient.has(email)) {
        emailToClient.set(email, {
          id: email,
          name: email === "bez-emailu" ? "Bez e-mailu" : email.split("@")[0] ?? "Klient",
          email: proj.client_email ?? "",
          brand: (proj.brief as { brand_name?: string } | null)?.brand_name ?? proj.project_code ?? "Projekt",
          avatar: initials(proj.client_email, null),
          expanded: false,
          projects: [],
        });
      }
      const created = formatDate(proj.created_at);
      const notes = (proj.admin_meta as { internal_notes?: string | null } | null)?.internal_notes ?? null;
      const timeline: Array<{ date: string; event: string; type: "auto" | "client" | "admin" }> = [
        { date: created, event: "Projekt vytvořen", type: "admin" },
      ];
      emailToClient.get(email)!.projects.push({
        id: proj.id,
        name: (proj.brief as { brand_name?: string } | null)?.brand_name ?? proj.project_code ?? "Projekt",
        status,
        created,
        expires: null,
        services: [],
        notes,
        timeline,
        source: "project",
        projectId: proj.id,
        projectCode: proj.project_code ?? undefined,
        sortAt: proj.created_at,
      });
    }

    const clients = Array.from(emailToClient.values())
      .filter((c) => c.projects.length > 0)
      .map((c) => ({
        ...c,
        projects: c.projects.sort((a, b) => {
          const tA = a.sortAt ?? a.created;
          const tB = b.sortAt ?? b.created;
          return new Date(tB).getTime() - new Date(tA).getTime();
        }),
      }));

    return NextResponse.json({
      ok: true,
      clients,
      meta: { totalClientProjects: clientProjects.length, totalProjects: projects.length },
    });
  } catch (e) {
    console.error("[admin/klienti-dashboard]", e);
    return NextResponse.json({ error: "Chyba načtení dashboardu." }, { status: 500 });
  }
}
