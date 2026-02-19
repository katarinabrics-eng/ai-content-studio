"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_ORDER,
  ALLOWED_TRANSITIONS,
  type ProjectStatus,
} from "@/lib/project-status-engine";

type Project = {
  id: string;
  plan_id: string;
  brand: string;
  obor: string;
  cil: string;
  sit: string;
  tonalita: string;
  poznamka: string;
  email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function AdminProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchProject = useCallback(() => {
    fetch(`/api/admin/projects/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setProject(d.project);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  function setStatus(newStatus: ProjectStatus) {
    if (!project) return;
    setUpdating(true);
    fetch(`/api/admin/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.project) setProject(d.project);
      })
      .finally(() => setUpdating(false));
  }

  if (loading) return <main className="p-6"><p>Načítám…</p></main>;
  if (!project) return <main className="p-6"><p>Projekt nenalezen.</p><a href="/admin/projects" className="text-lucifera-lime underline">Zpět</a></main>;

  const current = project.status as ProjectStatus;
  const nextStatuses = ALLOWED_TRANSITIONS[current] ?? [];

  return (
    <main className="min-h-screen bg-stone-100 p-6">
      <div className="mx-auto max-w-3xl">
        <a href="/admin/projects" className="text-sm text-stone-600 hover:underline">← Přehled projektů</a>
        <h1 className="mt-4 text-2xl font-bold text-stone-900">{project.brand || "Projekt"}</h1>
        <p className="text-stone-600">ID: {project.id} · Tarif: {project.plan_id}</p>

        <section className="mt-8 rounded-lg border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">Dodané informace</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <dt className="text-stone-500">Značka</dt><dd className="text-stone-900">{project.brand || "—"}</dd>
            <dt className="text-stone-500">Obor</dt><dd className="text-stone-900">{project.obor || "—"}</dd>
            <dt className="text-stone-500">Cíl</dt><dd className="text-stone-900">{project.cil || "—"}</dd>
            <dt className="text-stone-500">Síť</dt><dd className="text-stone-900">{project.sit || "—"}</dd>
            <dt className="text-stone-500">Tonalita</dt><dd className="text-stone-900">{project.tonalita || "—"}</dd>
            <dt className="text-stone-500">Poznámka</dt><dd className="text-stone-900">{project.poznamka || "—"}</dd>
            <dt className="text-stone-500">E-mail</dt><dd className="text-stone-900">{project.email ?? "— (přístup kód + PIN)"}</dd>
          </dl>
        </section>

        <section className="mt-6 rounded-lg border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">Stav zakázky</h2>
          <p className="mt-2 text-stone-700">{PROJECT_STATUS_LABELS[current] ?? current}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PROJECT_STATUS_ORDER.map((s) => (
              <span key={s} className={`rounded px-2 py-0.5 text-xs ${s === current ? "bg-lucifera-lime/30 text-stone-900" : "bg-stone-100 text-stone-500"}`}>
                {PROJECT_STATUS_LABELS[s]}
              </span>
            ))}
          </div>
          <h3 className="mt-4 font-medium text-stone-800">Změnit stav</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                disabled={updating}
                className="rounded bg-stone-800 px-3 py-1.5 text-sm text-white hover:bg-stone-700 disabled:opacity-50"
              >
                → {PROJECT_STATUS_LABELS[s]}
              </button>
            ))}
            {nextStatuses.length === 0 && <span className="text-sm text-stone-500">Žádné další přechody</span>}
          </div>
        </section>

        <p className="mt-4 text-sm text-stone-500">Vytvořeno: {new Date(project.created_at).toLocaleString("cs-CZ")} · Aktualizováno: {new Date(project.updated_at).toLocaleString("cs-CZ")}</p>
      </div>
    </main>
  );
}
