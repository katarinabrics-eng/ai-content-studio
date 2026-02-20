"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_ORDER,
  getStatusOrder,
  type ProjectStatus,
} from "@/lib/project-status-engine";

type ProjectData = {
  id: string;
  project_code: string;
  plan_id: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  brief?: {
    brand_name?: string;
  } | null;
};

function TimelineSteps({ currentStatus }: { currentStatus: ProjectStatus }) {
  const currentOrder = getStatusOrder(currentStatus);
  const clientVisibleStatuses: ProjectStatus[] = [
    "PROCESSING_DATA",
    "READY_FOR_AI",
    "IN_PRODUCTION",
    "DRAFT_READY",
    "FINAL_READY",
    "CLOSED",
  ];

  return (
    <div className="mt-6 space-y-3">
      {clientVisibleStatuses.map((status) => {
        const order = getStatusOrder(status);
        const done = order <= currentOrder;
        const current = status === currentStatus;
        return (
          <div
            key={status}
            className={`flex items-center gap-3 rounded-lg border p-4 ${
              current
                ? "border-lucifera-lime bg-lucifera-lime/10"
                : done
                  ? "border-green-200 bg-green-50"
                  : "border-stone-200 bg-stone-50"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                current
                  ? "bg-lucifera-lime text-zinc-900"
                  : done
                    ? "bg-green-500 text-white"
                    : "bg-stone-300 text-stone-600"
              }`}
            >
              {done ? "✓" : order}
            </div>
            <div>
              <p className={`font-medium ${current ? "text-zinc-900" : done ? "text-green-800" : "text-stone-600"}`}>
                {PROJECT_STATUS_LABELS[status]}
              </p>
              {current && (
                <p className="text-sm text-stone-600">Právě probíhá</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getStatusMessage(status: ProjectStatus): string {
  switch (status) {
    case "PROCESSING_DATA":
      return "Data se zpracovávají. Náš tým analyzuje váš brief.";
    case "READY_FOR_AI":
      return "Váš brief je připraven. Začínáme pracovat na návrzích.";
    case "IN_PRODUCTION":
      return "Tvorba probíhá. AI a kurátor pracují na vašich příspěvcích.";
    case "DRAFT_READY":
      return "Návrhy jsou připraveny ke schválení!";
    case "REVISION":
      return "Zapracováváme vaše připomínky.";
    case "FINAL_READY":
      return "Finální verze je připravena!";
    case "CLOSED":
      return "Zakázka byla uzavřena. Děkujeme za spolupráci!";
    default:
      return "Váš projekt je v procesu.";
  }
}

export default function ClientProjectPage() {
  const params = useParams();
  const projectCode = params.projectCode as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/client/project?code=${encodeURIComponent(projectCode)}`);
        const data = await res.json();
        if (data.ok && data.project) {
          setProject(data.project);
        } else {
          setError(data.error ?? "Projekt nenalezen");
        }
      } catch {
        setError("Nepodařilo se načíst projekt");
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [projectCode]);

  if (loading) {
    return (
      <main className="min-h-screen bg-lucifera-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-lucifera-lime border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-white/70">Načítám projekt...</p>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-lucifera-dark flex items-center justify-center px-4">
        <div className="glass-panel max-w-md p-8 text-center">
          <h1 className="text-xl font-bold text-white">Projekt nenalezen</h1>
          <p className="mt-4 text-white/70">{error ?? "Zkontrolujte kód projektu."}</p>
          <a href="/" className="btn-lime-primary mt-6 inline-block">
            Zpět na hlavní stránku
          </a>
        </div>
      </main>
    );
  }

  const status = project.status as ProjectStatus;

  return (
    <main className="min-h-screen bg-lucifera-dark px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">
            {project.brief?.brand_name ?? "Váš projekt"}
          </h1>
          <p className="mt-2 text-white/50 font-mono text-sm">{project.project_code}</p>
        </div>

        <div className="glass-panel mt-8 p-6">
          <h2 className="font-semibold text-white">Aktuální stav</h2>
          <p className="mt-2 text-lucifera-lime text-lg font-medium">
            {PROJECT_STATUS_LABELS[status] ?? status}
          </p>
          <p className="mt-2 text-white/70 text-sm">
            {getStatusMessage(status)}
          </p>
        </div>

        <div className="glass-panel mt-6 p-6">
          <h2 className="font-semibold text-white">Průběh projektu</h2>
          <TimelineSteps currentStatus={status} />
        </div>

        <p className="mt-8 text-center text-xs text-white/40">
          Vytvořeno: {new Date(project.created_at).toLocaleDateString("cs-CZ")}
          {" · "}
          Aktualizováno: {new Date(project.updated_at).toLocaleDateString("cs-CZ")}
        </p>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-white/50 hover:text-white/70">
            ← Zpět na hlavní stránku
          </a>
        </div>
      </div>
    </main>
  );
}
