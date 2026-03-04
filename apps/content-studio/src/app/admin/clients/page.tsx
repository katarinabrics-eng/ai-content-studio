"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  getDiagnostikaWorkflowStep,
  getDiagBadgeClassesDark,
  canDiagTransition,
  type DiagWorkflowStatus,
} from "@/lib/diagnostika-workflow";

type ClientProject = {
  id: string;
  created_at: string;
  updated_at?: string;
  name: string | null;
  email: string | null;
  web_url: string | null;
  manual_input: string | null;
  payment_status: string;
  booking_date: string | null;
  booking_time: string | null;
  status: string;
  workflow_status?: string;
  access_token?: string | null;
};

export default function AdminClientsPage() {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  const [backendRef, setBackendRef] = useState<string | null>(null);

  const fetchProjects = useCallback(() => {
    setFetchError(null);
    fetch("/api/admin/client-projects", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.projects)) {
          setProjects(d.projects);
          if (d._meta?.supabaseRef) setBackendRef(d._meta.supabaseRef);
        } else {
          setFetchError(d.error ?? "Chyba načtení.");
        }
      })
      .catch(() => setFetchError("Chyba připojení."))
      .finally(() => setLoading(false));
  }, []);

  const setWorkflowStatus = useCallback(
    (projectId: string, workflowStatus: DiagWorkflowStatus) => {
      fetch(`/api/admin/client-projects/${projectId}/workflow`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow_status: workflowStatus }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.ok) fetchProjects();
        });
    },
    [fetchProjects]
  );

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <main className="min-h-screen bg-[#0c0c14] p-6 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Klienti (diagnostika)</h1>
            <p className="mt-1 text-zinc-400">
              Scan + platba + termín. Jeden zdroj pravdy.
              {!loading && (
                <span className="ml-2 text-zinc-500">
                  · {projects.length} záznamů
                  {backendRef && (
                    <span className="ml-2 text-zinc-600" title="Supabase projekt, ze kterého se čte. Diagnostika zapisuje sem (save-scan → client_projects).">
                      · DB: {backendRef}
                    </span>
                  )}
                </span>
              )}
            </p>
            {!loading && projects.length === 0 && backendRef && (
              <p className="mt-2 text-xs text-zinc-500">
                Záznamy z diagnostiky se ukládají do tabulky <strong>client_projects</strong> (odkaz /d/xxx i „Vstoupit do pracovní plochy“). Pokud zde vidíte 0, ale odkaz z e-mailu funguje, otevřete diagnostiku na této adrese a v konzoli zadejte:{" "}
                <code className="bg-white/10 px-1 rounded">fetch(&quot;/api/diagnostika/backend-id&quot;).then(r=&gt;r.json()).then(console.log)</code>
                {" "}– hodnota <strong>supabaseRef</strong> musí být stejná jako DB zde ({backendRef}).
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href="/diagnostika"
              className="rounded-lg bg-[#A8EB12]/20 border border-[#A8EB12]/40 px-4 py-2 text-sm font-medium text-[#A8EB12] hover:bg-[#A8EB12]/30"
            >
              Spustit diagnostiku
            </Link>
            <Link
              href="/admin/projects"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
            >
              Projekty (AI)
            </Link>
            <button
              type="button"
              onClick={fetchProjects}
              disabled={loading}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10 disabled:opacity-50"
            >
              Obnovit
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

        {showClearModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => !clearing && setShowClearModal(false)}
          >
            <div
              className="w-full max-w-md rounded-xl border border-white/10 bg-[#141414] p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white">Vyčistit diagnostiky</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Smaže všechny záznamy z této tabulky (scan + platba). Toto nelze vrátit. Přehled bude prázdný.
              </p>
              {clearError && <p className="mt-3 text-sm text-red-400">{clearError}</p>}
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
                  disabled={clearing}
                  onClick={async () => {
                    setClearing(true);
                    setClearError(null);
                    try {
                      const res = await fetch("/api/admin/clear-data", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ scope: "client_projects" }),
                      });
                      const data = await res.json();
                      if (data.ok) {
                        setShowClearModal(false);
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
                  {clearing ? "Mažu…" : "Smazat vše"}
                </button>
              </div>
            </div>
          </div>
        )}

        {fetchError && (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {fetchError}
            <p className="mt-2 text-amber-200/80 text-xs">
              Otevřete admin na stejné URL jako při spuštění diagnostiky (např. ai-content-studio-omega.vercel.app). Jinak se načítají data z jiné databáze.
            </p>
          </div>
        )}
        {loading && projects.length === 0 && !fetchError && <p className="mt-6 text-zinc-500">Načítám…</p>}
        {!loading && projects.length === 0 && !fetchError && (
          <div className="mt-6">
            <p className="text-zinc-500">Zatím žádné záznamy.</p>
            <p className="mt-2 text-zinc-500 text-sm">
              Jste na stejné adrese jako klient při dokončení diagnostiky? (Vercel vs. localhost = jiná databáze.)
            </p>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Datum</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">E-mail</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Web / vstup</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Platba</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Termín</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Workflow</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500">Akce / Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {projects.map((p) => {
                  const wf = getDiagnostikaWorkflowStep(p.workflow_status);
                  return (
                    <tr key={p.id} className="hover:bg-white/5">
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-400">
                        {new Date(p.created_at).toLocaleDateString("cs-CZ")}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-200">
                        {p.email ?? p.web_url ?? (p.manual_input ? (p.manual_input.slice(0, 50) + (p.manual_input.length > 50 ? "…" : "")) : null) ?? "—"}
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3 text-sm text-zinc-400" title={p.web_url ?? ""}>
                        {p.web_url || "ruční vstup"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${p.payment_status === "paid" ? "bg-green-500/20 text-green-300" : p.payment_status === "pending" ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-zinc-400"}`}>
                          {p.payment_status === "paid" ? "Zaplaceno" : p.payment_status === "pending" ? "Čeká" : "—"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-400">
                        {p.booking_date && p.booking_time ? `${p.booking_date} ${p.booking_time}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className={`inline-flex w-fit rounded px-2 py-0.5 text-xs font-medium ${getDiagBadgeClassesDark(wf.badge)}`}>
                            {wf.label}
                          </span>
                          {wf.who && <span className="text-[10px] text-zinc-500">Na tahu: {wf.who}</span>}
                          <span className="text-[10px] text-zinc-500" title={wf.currentAction}>Krok {wf.step}/{wf.total}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          {canDiagTransition(p.workflow_status, "DIAG_READY_FOR_CLIENT") && (
                            <button type="button" onClick={() => setWorkflowStatus(p.id, "DIAG_READY_FOR_CLIENT")} className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-zinc-300 hover:bg-white/20">Připravit pro klienta</button>
                          )}
                          {canDiagTransition(p.workflow_status, "DIAG_SENT_TO_CLIENT") && (
                            <button type="button" onClick={() => setWorkflowStatus(p.id, "DIAG_SENT_TO_CLIENT")} className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-zinc-300 hover:bg-white/20">Zasláno</button>
                          )}
                          {canDiagTransition(p.workflow_status, "DIAG_AWAITING_CURATOR") && (
                            <button type="button" onClick={() => setWorkflowStatus(p.id, "DIAG_AWAITING_CURATOR")} className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-zinc-300 hover:bg-white/20">Zpět na kurátora</button>
                          )}
                          {p.status !== "done" && (
                            <button
                              type="button"
                              onClick={async () => {
                                const res = await fetch(`/api/admin/client-projects/${p.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ archive: true }),
                                });
                                if (res.ok) fetchProjects();
                              }}
                              className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-zinc-400 hover:bg-white/10"
                            >
                              Archivovat
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirm("Opravdu smazat tento záznam? Tuto akci nelze vrátit.")) return;
                              const res = await fetch(`/api/admin/client-projects/${p.id}`, { method: "DELETE" });
                              if (res.ok) fetchProjects();
                            }}
                            className="rounded border border-red-500/40 px-2 py-0.5 text-[10px] text-red-400 hover:bg-red-500/10"
                          >
                            Smazat
                          </button>
                          {p.access_token && (
                            <Link href={`/diagnostika/view?token=${encodeURIComponent(p.access_token)}`} className="text-sm font-medium text-[#A8EB12] hover:underline ml-1">Otevřít výsledek</Link>
                          )}
                          <Link href={`/admin/clients/${p.id}`} className="text-sm font-medium text-zinc-400 hover:underline ml-1">Detail admin</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
