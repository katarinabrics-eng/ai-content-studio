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
  payment_status: string;
  booking_date: string | null;
  booking_time: string | null;
  status: string;
  workflow_status?: string;
};

export default function AdminClientsPage() {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(() => {
    fetch("/api/admin/client-projects")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.projects)) setProjects(d.projects);
      })
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
            <p className="mt-1 text-zinc-400">Scan + platba + termín. Jeden zdroj pravdy.</p>
          </div>
          <div className="flex gap-2">
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
          </div>
        </div>

        {loading && projects.length === 0 && <p className="mt-6 text-zinc-500">Načítám…</p>}
        {!loading && projects.length === 0 && <p className="mt-6 text-zinc-500">Zatím žádné záznamy.</p>}

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
                          <Link href={`/admin/clients/${p.id}`} className="text-sm font-medium text-[#A8EB12] hover:underline ml-1">Otevřít</Link>
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
