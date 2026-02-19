"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_ORDER,
  getStatusOrder,
  type ProjectStatus,
} from "@/lib/project-status-engine";

type Project = {
  id: string;
  plan_id: string;
  brand: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function TimelineSteps({ currentStatus }: { currentStatus: string }) {
  const currentOrder = getStatusOrder(currentStatus as ProjectStatus);
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {PROJECT_STATUS_ORDER.map((status) => {
        const order = getStatusOrder(status);
        const done = order <= currentOrder;
        return (
          <span
            key={status}
            className={`rounded px-2 py-0.5 text-xs ${done ? "bg-lucifera-lime/20 text-lucifera-lime" : "bg-white/10 text-white/50"}`}
          >
            {PROJECT_STATUS_LABELS[status]}
          </span>
        );
      })}
    </div>
  );
}

function ProjectContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    const url = tokenFromUrl
      ? `/api/project?token=${encodeURIComponent(tokenFromUrl)}`
      : "/api/project";
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Nelze načíst projekt.");
      setProject(null);
      return;
    }
    setProject(data.project);
    setError(null);
  }, [tokenFromUrl]);

  useEffect(() => {
    setLoading(true);
    fetchProject().finally(() => setLoading(false));
  }, [fetchProject]);

  if (loading) {
    return (
      <main className="min-h-screen bg-lucifera-dark flex items-center justify-center text-white">
        Načítám projekt…
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-lucifera-dark flex items-center justify-center px-4">
        <div className="glass-panel max-w-md p-6">
          <p className="font-medium text-white">{error ?? "Projekt nenalezen"}</p>
          <p className="mt-2 text-sm text-white/70">
            Použijte odkaz z e-mailu nebo se přihlaste na <a href="/vstup" className="text-lucifera-lime underline">/vstup</a> (kód + PIN).
          </p>
          <a href="/vstup" className="btn-lime-primary mt-4 inline-block">
            Přihlásit se
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-lucifera-dark px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-white">Váš projekt: {project.brand}</h1>
        <p className="mt-1 text-white/70">Tarif: {project.plan_id}</p>

        <section className="glass-panel mt-8 p-6">
          <h2 className="font-semibold text-white">Stav zakázky</h2>
          <p className="mt-2 text-lucifera-lime">
            {PROJECT_STATUS_LABELS[project.status as ProjectStatus] ?? project.status}
          </p>
          <TimelineSteps currentStatus={project.status} />
        </section>

        <section className="glass-panel mt-6 p-6">
          <h2 className="font-semibold text-white">Schválit / Vznést námitku</h2>
          <p className="mt-2 text-sm text-white/70">
            Až bude návrh připraven ke schválení (stav „Návrh připraven“ nebo „Finální verze připravena“), zde budete moci obsah schválit nebo požádat o úpravy.
          </p>
          <p className="mt-3 text-sm text-white/50">
            Aktuální stav: {PROJECT_STATUS_LABELS[project.status as ProjectStatus] ?? project.status}. {project.status === "DRAFT_READY" || project.status === "FINAL_READY" ? "Můžete nyní schválit nebo vznést námitku." : "Po dokončení zpracování zde zobrazíme akce."}
          </p>
        </section>

        {!tokenFromUrl && (
          <p className="mt-6 text-center text-sm text-white/50">
            Přihlášeni přes kód a PIN. <a href="/" className="text-lucifera-lime underline">Zpět na úvod</a>
          </p>
        )}
      </div>
    </main>
  );
}

export default function ProjectPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-lucifera-dark flex items-center justify-center text-white">Načítám…</main>}>
      <ProjectContent />
    </Suspense>
  );
}
