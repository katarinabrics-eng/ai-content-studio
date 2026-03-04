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
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editWebUrl, setEditWebUrl] = useState("");
  const [editManualInput, setEditManualInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchProject = useCallback(() => {
    fetch(`/api/admin/client-projects/${id}`, { cache: "no-store" })
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

  useEffect(() => {
    if (project) {
      setEditName(project.name ?? "");
      setEditEmail(project.email ?? "");
      setEditWebUrl(project.web_url ?? "");
      setEditManualInput(project.manual_input ?? "");
    }
  }, [project]);

  const saveEdits = useCallback(async () => {
    if (!id || saving) return;
    setSaveError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/client-projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim() || null,
          email: editEmail.trim() || null,
          web_url: editWebUrl.trim() || null,
          manual_input: editManualInput.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.ok && data.project) {
        setProject(data.project);
        setEditing(false);
      } else {
        setSaveError(data?.error ?? "Chyba při ukládání.");
      }
    } catch {
      setSaveError("Chyba připojení.");
    } finally {
      setSaving(false);
    }
  }, [id, editName, editEmail, editWebUrl, editManualInput, saving]);

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
  const pillarAnalysis = project.scan_result?.pillarAnalysis as Record<string, {
    score?: number;
    interpretation?: string;
    observed?: string[];
    notObserved?: string[];
    reasoning?: string;
    strategicOpportunity?: string;
  }> | undefined;
  const missingElements = (project.scan_result?.missingElements as string[] | undefined)
    ?? (brandDna?.missingElements as string[] | undefined)
    ?? [];
  const PILLAR_NAMES: Record<string, string> = { light: "SVĚTLO", energy: "ENERGIE", architecture: "ARCHITEKTURA", identity: "IDENTITA", trust: "DŮVĚRA" };

  return (
    <main className="min-h-screen bg-[#0c0c14] p-6 text-zinc-100">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin/clients" className="text-sm text-zinc-400 hover:text-[#A8EB12]">← Seznam klientů</Link>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-xl font-bold text-white">Detail klienta</h1>
          <p className="mt-1 text-sm text-zinc-500">Vytvořeno: {new Date(project.created_at).toLocaleString("cs-CZ")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/admin/clients/${id}/style`} className="text-sm text-zinc-400 hover:text-[#A8EB12]">Styl</Link>
            <span className="text-zinc-600">·</span>
            <Link href={`/admin/clients/${id}/generate`} className="text-sm text-zinc-400 hover:text-[#A8EB12]">Generování</Link>
            <span className="text-zinc-600">·</span>
            <Link href={`/admin/clients/${id}/approve`} className="text-sm text-zinc-400 hover:text-[#A8EB12]">Schválení</Link>
          </div>

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
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase text-zinc-500">Vstupní údaje / vstup</h2>
              <button
                type="button"
                onClick={() => setEditing((e) => !e)}
                className="text-sm text-[#A8EB12] hover:underline"
              >
                {editing ? "Zrušit úpravu" : "Upravit"}
              </button>
            </div>
            {editing ? (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Jméno klienta</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-lg bg-zinc-800 border border-white/10 px-3 py-2 text-zinc-200 placeholder:text-zinc-500"
                    placeholder="Jméno nebo firma"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-lg bg-zinc-800 border border-white/10 px-3 py-2 text-zinc-200 placeholder:text-zinc-500"
                    placeholder="email@example.cz"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Web URL</label>
                  <input
                    type="url"
                    value={editWebUrl}
                    onChange={(e) => setEditWebUrl(e.target.value)}
                    className="w-full rounded-lg bg-zinc-800 border border-white/10 px-3 py-2 text-zinc-200 placeholder:text-zinc-500"
                    placeholder="https://…"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Manuální vstup / popis (text o značce)</label>
                  <textarea
                    value={editManualInput}
                    onChange={(e) => setEditManualInput(e.target.value)}
                    rows={5}
                    className="w-full rounded-lg bg-zinc-800 border border-white/10 px-3 py-2 text-zinc-200 placeholder:text-zinc-500 resize-y"
                    placeholder="Text z manuální diagnostiky (Nemám web)…"
                  />
                </div>
                {saveError && <p className="text-sm text-red-400">{saveError}</p>}
                <button
                  type="button"
                  onClick={saveEdits}
                  disabled={saving}
                  className="rounded-lg bg-[#A8EB12] px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-[#b8f022] disabled:opacity-50"
                >
                  {saving ? "Ukládám…" : "Uložit změny"}
                </button>
              </div>
            ) : (
              <>
                <p className="mt-2 text-zinc-300">{project.name ? `Jméno: ${project.name}` : ""}</p>
                <p className="mt-1 text-zinc-300">{project.email ? `E-mail: ${project.email}` : ""}</p>
                {project.web_url && <p className="mt-2 text-zinc-300">Web: <a href={project.web_url} target="_blank" rel="noreferrer" className="text-[#A8EB12] underline">{project.web_url}</a></p>}
                {project.manual_input && <div className="mt-2 rounded-lg bg-zinc-800/50 p-3 text-sm text-zinc-300 whitespace-pre-wrap">{project.manual_input}</div>}
                {!project.web_url && !project.manual_input && !project.name && !project.email && <p className="mt-2 text-zinc-500">—</p>}
              </>
            )}
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <h2 className="text-sm font-semibold uppercase text-zinc-500">Výstup scanu</h2>
            {score?.total != null && <p className="mt-2 text-zinc-300">Skóre: <strong>{score.total}</strong> / 100</p>}

            {pillarAnalysis && Object.keys(pillarAnalysis).length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase text-zinc-500">Pilíře (pillarAnalysis)</h3>
                <div className="mt-2 space-y-4">
                  {Object.entries(pillarAnalysis).map(([key, p]) => (
                    <div key={key} className="rounded-lg bg-zinc-800/50 p-4 text-sm">
                      <p className="font-medium text-zinc-200">{PILLAR_NAMES[key] ?? key} {p.score != null && <span className="text-zinc-500">— {p.score}/10</span>}</p>
                      {p.interpretation && <p className="mt-2 text-zinc-300">{p.interpretation}</p>}
                      {p.observed && p.observed.length > 0 && (
                        <p className="mt-2"><span className="text-zinc-500">Zaznamenáno:</span> <span className="text-zinc-300">{p.observed.join("; ")}</span></p>
                      )}
                      {p.notObserved && p.notObserved.length > 0 && (
                        <p className="mt-1"><span className="text-zinc-500">Chybí:</span> <span className="text-amber-200/90">{p.notObserved.join("; ")}</span></p>
                      )}
                      {p.reasoning && <p className="mt-2 text-zinc-400 italic">{p.reasoning}</p>}
                      {p.strategicOpportunity && <p className="mt-1 text-[#A8EB12]">{p.strategicOpportunity}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {missingElements.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase text-zinc-500">Rizika (missingElements)</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-zinc-300">
                  {missingElements.slice(0, 3).map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase text-zinc-500">Doporučený posun (summary)</h3>
                <p className="mt-2 text-zinc-300">{summary}</p>
              </div>
            )}

            {brandDna && (
              <div className="mt-6 rounded-lg bg-zinc-800/50 p-4 text-sm">
                <p className="font-medium text-zinc-200">Brand DNA (surová data)</p>
                <pre className="mt-2 overflow-auto max-h-48 whitespace-pre-wrap text-zinc-400 text-xs">{JSON.stringify(brandDna, null, 2)}</pre>
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
