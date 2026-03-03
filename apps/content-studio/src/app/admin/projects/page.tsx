"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  getWorkflowStep,
  getWorkflowStepFromState,
  getBadgeClassesDark,
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
    <main className="min-h-screen bg-[#0c0c14] p-6 text-zinc-100">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Přehled projektů</h1>
            <p className="mt-1 text-zinc-400">
              CO se zpracovává, KDE to běží, KDO je na tahu.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/analysis-leads"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
            >
              Leady z analýzy
            </Link>
            <Link
              href="/admin/clients"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
            >
              Klienti (diagnostika)
            </Link>
            <button
              type="button"
              onClick={fetchProjects}
              disabled={loading}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10 disabled:opacity-50"
            >
              Obnovit nyní
            </button>
          </div>
        </div>

        {loading && projects.length === 0 && (
          <p className="mt-6 text-zinc-500">Načítám…</p>
        )}
        {!loading && projects.length === 0 && (
          <p className="mt-6 text-zinc-500">Zatím žádné projekty.</p>
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
                  className="rounded-xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <a
                        href={"/admin/projects/" + p.id}
                        className="font-medium text-white hover:text-[#A8EB12]"
                      >
                        {p.brief?.brand_name ?? "—"}
                      </a>
                      <p className="mt-0.5 text-sm text-zinc-500">
                        {p.client_email ?? "Přístup: kód + PIN"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-xs font-medium ${getBadgeClassesDark(wf.badge)}`}
                      >
                        {wf.label}
                      </span>
                      <span className="text-xs text-zinc-500">{p.plan_id}</span>
                      <span className="text-xs text-zinc-500">
                        {new Date(p.created_at).toLocaleDateString("cs-CZ")}
                      </span>
                      <a
                        href={"/admin/projects/" + p.id}
                        className="text-sm font-medium text-[#A8EB12] hover:underline"
                      >
                        Detail
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium text-zinc-300">
                        {stepText}
                      </span>
                      {wf.who && (
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-400">
                          Na tahu: {wf.who}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400">
                      Právě teď: {wf.currentAction}
                    </p>
                    <p className="text-xs text-zinc-500">
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
          <p className="mt-4 text-xs text-zinc-500">
            Auto-obnovení každých 10 s. Poslední načtení:{" "}
            {lastRefresh.toLocaleTimeString("cs-CZ")}
          </p>
        )}
      </div>
    </main>
  );
}
