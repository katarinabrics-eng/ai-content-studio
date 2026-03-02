"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  getWorkflowStep,
  getWorkflowStepFromState,
  getBadgeClasses,
} from "@/lib/project-status-engine";
import type { ProjectStateForStatus } from "@/lib/project-status-engine";

type Project = {
  id: string;
  plan_id: string;
  client_email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  brief?: { brand_name?: string } | null;
  admin_meta?: { internal_notes?: string | null } | null;
  workflowState?: ProjectStateForStatus | null;
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchProjects = useCallback(() => {
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.projects)) setProjects(d.projects);
      })
      .finally(() => {
        setLoading(false);
        setLastRefresh(new Date());
      });
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const interval = setInterval(fetchProjects, 10_000);
    return () => clearInterval(interval);
  }, [fetchProjects]);

  return (
    <main className="min-h-screen bg-stone-100 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Přehled projektů</h1>
            <p className="mt-1 text-stone-600">
              CO se zpracovává, KDE to běží, KDO je na tahu.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/clients"
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Klienti (diagnostika)
            </Link>
            <button
              type="button"
              onClick={fetchProjects}
              disabled={loading}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
            >
              Obnovit nyní
            </button>
          </div>
        </div>

        {loading && projects.length === 0 && (
          <p className="mt-6 text-stone-500">Načítám…</p>
        )}
        {!loading && projects.length === 0 && (
          <p className="mt-6 text-stone-500">Zatím žádné projekty.</p>
        )}
        {!loading && projects.length > 0 && (
          <ul className="mt-6 space-y-4">
            {projects.map((p) => {
              const wf =
                p.workflowState != null
                  ? getWorkflowStepFromState(
                      p.workflowState,
                      p.workflowState.error ? p.admin_meta?.internal_notes : null
                    )
                  : getWorkflowStep(
                      p.status,
                      p.status === "ERROR" ? p.admin_meta?.internal_notes : null
                    );
              const stepText =
                wf.step > 0 ? `Krok ${wf.step}/${wf.total}` : "Chyba";
              const updatedAt = new Date(p.updated_at);
              return (
                <li
                  key={p.id}
                  className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <a
                        href={"/admin/projects/" + p.id}
                        className="font-medium text-stone-900 hover:underline"
                      >
                        {p.brief?.brand_name ?? "—"}
                      </a>
                      <p className="mt-0.5 text-sm text-stone-500">
                        {p.client_email ?? "Přístup: kód + PIN"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-xs font-medium ${getBadgeClasses(wf.badge)}`}
                      >
                        {wf.label}
                      </span>
                      <span className="text-xs text-stone-400">{p.plan_id}</span>
                      <span className="text-xs text-stone-400">
                        {new Date(p.created_at).toLocaleDateString("cs-CZ")}
                      </span>
                      <a
                        href={"/admin/projects/" + p.id}
                        className="text-sm text-lucifera-lime hover:underline"
                      >
                        Detail
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 border-t border-stone-100 pt-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium text-stone-700">
                        {stepText}
                      </span>
                      {wf.who && (
                        <span className="rounded bg-stone-100 px-1.5 py-0.5 text-stone-600">
                          Na tahu: {wf.who}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-600">
                      Právě teď: {wf.currentAction}
                    </p>
                    <p className="text-xs text-stone-400">
                      Poslední aktualizace:{" "}
                      {updatedAt.toLocaleTimeString("cs-CZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {lastRefresh && projects.length > 0 && (
          <p className="mt-4 text-xs text-stone-400">
            Auto-obnovení každých 10 s. Poslední načtení:{" "}
            {lastRefresh.toLocaleTimeString("cs-CZ")}
          </p>
        )}
      </div>
    </main>
  );
}
