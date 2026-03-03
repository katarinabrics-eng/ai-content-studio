"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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
  updated_at: string;
  name: string | null;
  email: string | null;
  web_url: string | null;
  manual_input: string | null;
  scan_result: Record<string, unknown>;
  payment_status: string;
  booking_id: string | null;
  booking_date: string | null;
  booking_time: string | null;
  status: string;
  workflow_status?: string;
};

export default function AdminClientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<ClientProject | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = useCallback(() => {
    fetch(`/api/admin/client-projects/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setProject(d.project);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const setWorkflowStatus = useCallback(
    (workflowStatus: DiagWorkflowStatus) => {
      fetch(`/api/admin/client-projects/${id}/workflow`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow_status: workflowStatus }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.ok && d.project) setProject(d.project);
        });
    },
    [id]
  );

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0c0c14] p-6 text-zinc-100">
        <p className="text-zinc-500">Načítám…</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[#0c0c14] p-6 text-zinc-100">
        <p className="text-zinc-400">Projekt nenalezen.</p>
        <Link href="/admin/clients" className="mt-2 inline-block text-sm text-[#A8EB12] underline">← Seznam klientů</Link>
      </main>
    );
  }

  const score = project.scan_result?.brandScore as { total?: number } | undefined;
  const brandDna = project.scan_result?.brandDna as Record<string, unknown> | undefined;
  const summary = project.scan_result?.summary as string | undefined;

  return (
    <main className="min-h-screen bg-[#0c0c14] p-6 text-zinc-100">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin/clients" className="text-sm text-zinc-400 hover:text-[#A8EB12]">← Seznam klientů</Link>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-xl font-bold text-white">Detail klienta</h1>
          <p className="mt-1 text-sm text-zinc-500">Vytvořeno: {new Date(project.created_at).toLocaleString("cs-CZ")}</p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold uppercase text-zinc-500">Kontakt</h2>
              <p className="mt-1 text-zinc-200">{project.email ?? "—"}</p>
              <p className="mt-1 text-zinc-400">{project.name ?? "—"}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase text-zinc-500">Platba / termín</h2>
              <p className="mt-1">
                <span className={project.payment_status === "paid" ? "text-green-400 font-medium" : "text-zinc-400"}>
                  {project.payment_status === "paid" ? "Zaplaceno" : project.payment_status === "pending" ? "Čeká na platbu" : "—"}
                </span>
              </p>
              {project.booking_date && project.booking_time && (
                <p className="mt-1 text-zinc-400">Termín: {project.booking_date} {project.booking_time}</p>
              )}
            </div>
          </div>

          {(() => {
            const wf = getDiagnostikaWorkflowStep(project.workflow_status);
            return (
              <div className="mt-6 border-t border-white/10 pt-6">
                <h2 className="text-sm font-semibold uppercase text-zinc-500">Workflow</h2>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex rounded px-2 py-1 text-sm font-medium ${getDiagBadgeClassesDark(wf.badge)}`}>
                    {wf.label}
                  </span>
                  {wf.who && <span className="text-sm text-zinc-500">Na tahu: {wf.who}</span>}
                  <span className="text-sm text-zinc-500" title={wf.currentAction}>Krok {wf.step}/{wf.total}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-400">{wf.currentAction}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {canDiagTransition(project.workflow_status, "DIAG_READY_FOR_CLIENT") && (
                    <button type="button" onClick={() => setWorkflowStatus("DIAG_READY_FOR_CLIENT")} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/20">Připravit pro klienta</button>
                  )}
                  {canDiagTransition(project.workflow_status, "DIAG_SENT_TO_CLIENT") && (
                    <button type="button" onClick={() => setWorkflowStatus("DIAG_SENT_TO_CLIENT")} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/20">Zasláno</button>
                  )}
                  {canDiagTransition(project.workflow_status, "DIAG_AWAITING_CURATOR") && (
                    <button type="button" onClick={() => setWorkflowStatus("DIAG_AWAITING_CURATOR")} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/20">Zpět na kurátora</button>
                  )}
                </div>
              </div>
            );
          })()}

          <div className="mt-8 border-t border-white/10 pt-6">
            <h2 className="text-sm font-semibold uppercase text-zinc-500">Vstup</h2>
            {project.web_url && <p className="mt-2 text-zinc-300">Web: <a href={project.web_url} target="_blank" rel="noreferrer" className="text-[#A8EB12] underline">{project.web_url}</a></p>}
            {project.manual_input && <div className="mt-2 rounded-lg bg-zinc-800/50 p-3 text-sm text-zinc-300 whitespace-pre-wrap">{project.manual_input}</div>}
            {!project.web_url && !project.manual_input && <p className="mt-2 text-zinc-500">—</p>}
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <h2 className="text-sm font-semibold uppercase text-zinc-500">Výstup scanu</h2>
            {score?.total != null && <p className="mt-2 text-zinc-300">Skóre: <strong>{score.total}</strong> / 100</p>}
            {summary && <p className="mt-2 text-zinc-300">{summary}</p>}
            {brandDna && (
              <div className="mt-4 rounded-lg bg-zinc-800/50 p-4 text-sm">
                <p className="font-medium text-zinc-200">Brand DNA</p>
                <pre className="mt-2 overflow-auto max-h-60 whitespace-pre-wrap text-zinc-400">{JSON.stringify(brandDna, null, 2)}</pre>
              </div>
            )}
            {(!project.scan_result || Object.keys(project.scan_result).length === 0) && <p className="mt-2 text-zinc-500">Žádná data.</p>}
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-sm text-zinc-500">AI pracovní pole (tlačítka strategie, positioning, pilíře…) – připravíme v dalším kroku.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
