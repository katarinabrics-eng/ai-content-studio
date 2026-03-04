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
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearScope, setClearScope] = useState<"client_projects" | "all" | null>(null);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

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
              href="/admin/klienti"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
            >
              Klienti (přehled)
            </Link>
            <Link
              href="/admin/kurator"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
            >
              Kurátor
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
            <button
              type="button"
              onClick={() => { setShowClearModal(true); setClearError(null); }}
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20"
            >
              Vyčistit přehled
            </button>
          </div>
        </div>

        {/* Modal: Vyčistit přehled */}
        {showClearModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => !clearing && setShowClearModal(false)}
          >
            <div
              className="w-full max-w-md rounded-xl border border-white/10 bg-[#141414] p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white">Vyčistit přehled</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Smaže data v databázi. Toto nelze vrátit. Chcete mít čistý stůl a vidět jen nové záznamy.
              </p>
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  disabled={clearing}
                  onClick={() => setClearScope("client_projects")}
                  className={`block w-full rounded-lg border px-4 py-3 text-left text-sm ${clearScope === "client_projects" ? "border-[#A8EB12]/50 bg-[#A8EB12]/10 text-white" : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"}`}
                >
                  Jen diagnostiky (Klienti diagnostika) – projekty zůstanou
                </button>
                <button
                  type="button"
                  disabled={clearing}
                  onClick={() => setClearScope("all")}
                  className={`block w-full rounded-lg border px-4 py-3 text-left text-sm ${clearScope === "all" ? "border-red-500/50 bg-red-500/10 text-white" : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"}`}
                >
                  Vše (diagnostiky + projekty) – úplně čistý stůl
                </button>
              </div>
              {clearError && (
                <p className="mt-3 text-sm text-red-400">{clearError}</p>
              )}
              <div className="mt-6 flex gap-2 justify-end">
                <button
                  type="button"
                  disabled={clearing}
                  onClick={() => setShowClearModal(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 disabled:opacity-50"
                >
                  Zrušit
                </button>
                <button
                  type="button"
                  disabled={clearing || !clearScope}
                  onClick={async () => {
                    if (!clearScope) return;
                    setClearing(true);
                    setClearError(null);
                    try {
                      const res = await fetch("/api/admin/clear-data", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ scope: clearScope }),
                      });
                      const data = await res.json();
                      if (data.ok) {
                        setShowClearModal(false);
                        setClearScope(null);
                        fetchProjects();
                      } else {
                        setClearError(data.error ?? "Chyba");
                      }
                    } catch {
                      setClearError("Chyba připojení.");
                    } finally {
                      setClearing(false);
                    }
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {clearing ? "Mažu…" : "Smazat"}
                </button>
              </div>
            </div>
          </div>
        )}

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
