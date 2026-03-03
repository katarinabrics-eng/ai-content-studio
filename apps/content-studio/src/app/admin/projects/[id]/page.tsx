"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  PROJECT_STATUS_LABELS,
  ALLOWED_TRANSITIONS,
  computeProjectStatus,
  getWorkflowStep,
  getWorkflowStepFromState,
  getBadgeClasses,
  type ProjectStatus,
  type ProjectStateForStatus,
} from "@/lib/project-status-engine";
import { getBriefCompleteness } from "@/lib/supabase-projects";
import type { ProjectWithBriefAndMeta } from "@/lib/supabase-projects";
import { STRATEGISTS, type StrategistId } from "@/lib/strategists/config";

type Draft = {
  id: string;
  draft_index: number;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  platform: string;
  status: string;
};

export default function AdminProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<ProjectWithBriefAndMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationWarning, setGenerationWarning] = useState<string | null>(null);
  const [aiModeManual, setAiModeManual] = useState(true);

  const [selectedStrategistId, setSelectedStrategistId] = useState<StrategistId | "">("hormozi");
  const [strategistOutput, setStrategistOutput] = useState<string | null>(null);
  const [strategistLoading, setStrategistLoading] = useState(false);
  const [strategistError, setStrategistError] = useState<string | null>(null);

  const fetchProject = useCallback(() => {
    fetch(`/api/admin/projects/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setProject(d.project);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const fetchDrafts = useCallback(() => {
    setDraftsLoading(true);
    fetch(`/api/admin/projects/${id}/drafts`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.drafts)) {
          setDrafts(d.drafts);
        }
      })
      .finally(() => setDraftsLoading(false));
  }, [id]);

  useEffect(() => {
    fetchProject();
    fetchDrafts();
  }, [fetchProject, fetchDrafts]);

  useEffect(() => {
    const interval = setInterval(fetchProject, 10_000);
    return () => clearInterval(interval);
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

  async function handleGenerateDrafts() {
    setGenerating(true);
    setGenerationError(null);
    setGenerationWarning(null);
    try {
      const res = await fetch(`/api/admin/projects/${id}/drafts`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        if (Array.isArray(data.drafts)) {
          setDrafts(data.drafts);
        }
        if (data.warning) {
          setGenerationWarning(data.warning);
        }
        fetchProject();
      } else {
        setGenerationError(data.error ?? "Generování selhalo");
      }
    } catch (e) {
      setGenerationError(e instanceof Error ? e.message : "Chyba při generování");
    } finally {
      setGenerating(false);
    }
  }

  async function handleTriggerAI() {
    setGenerating(true);
    setGenerationError(null);
    setGenerationWarning(null);
    try {
      const instructionEl = document.getElementById("ai-instruction") as HTMLInputElement | null;
      const instruction = instructionEl?.value?.trim() ?? undefined;
      const res = await fetch(`/api/admin/projects/${id}/trigger-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction }),
      });
      const data = await res.json();
      if (data.ok) {
        if (Array.isArray(data.drafts)) {
          setDrafts(data.drafts);
        }
        fetchProject();
        fetchDrafts();
      } else {
        setGenerationError(data.error ?? "Spuštění AI selhalo");
      }
    } catch (e) {
      setGenerationError(e instanceof Error ? e.message : "Chyba při spuštění AI");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRunStrategist() {
    if (!selectedStrategistId) return;
    setStrategistLoading(true);
    setStrategistError(null);
    setStrategistOutput(null);
    try {
      const res = await fetch(`/api/admin/projects/${id}/run-strategist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategistId: selectedStrategistId }),
      });
      const data = await res.json();
      if (data.ok) {
        setStrategistOutput(data.output ?? "");
      } else {
        setStrategistError(data.error ?? "Spuštění stratega selhalo");
      }
    } catch (e) {
      setStrategistError(e instanceof Error ? e.message : "Chyba při spuštění stratega");
    } finally {
      setStrategistLoading(false);
    }
  }

  async function handleMarkReady() {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/projects/${id}/drafts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_ready" }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchDrafts();
        fetchProject();
      }
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <main className="p-6"><p>Načítám…</p></main>;
  if (!project) return <main className="p-6"><p>Projekt nenalezen.</p><a href="/admin/projects" className="text-lucifera-lime underline">Zpět</a></main>;

  const workflowState = (project as ProjectWithBriefAndMeta & { workflowState?: ProjectStateForStatus | null }).workflowState;
  const current = (workflowState != null ? computeProjectStatus(workflowState) : project.status) as ProjectStatus;
  const nextStatuses = (ALLOWED_TRANSITIONS[current] ?? []) as string[];
  const brief = project.brief;
  const meta = project.admin_meta;
  const wf =
    workflowState != null
      ? getWorkflowStepFromState(
          workflowState,
          (workflowState.error || current === "ERROR") ? meta?.internal_notes : null
        )
      : getWorkflowStep(
          project.status,
          project.status === "ERROR" ? meta?.internal_notes : null
        );
  const { percent: completenessPercent, missing: missingFields } = meta
    ? { percent: meta.brief_completeness, missing: meta.missing_fields }
    : getBriefCompleteness(brief);

  return (
    <main className="min-h-screen bg-stone-100 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <a href="/admin/projects" className="text-sm text-stone-600 hover:underline">← Přehled projektů</a>
          <button
            type="button"
            onClick={() => { fetchProject(); fetchDrafts(); }}
            disabled={updating}
            className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            Obnovit nyní
          </button>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-stone-900">{brief?.brand_name || "Projekt"}</h1>
        <p className="text-stone-600">
          ID: {project.id} · Tarif: {project.plan_id}
          {(project as unknown as { project_code?: string | null }).project_code && (
            <> · Kód: <span className="font-mono">{(project as unknown as { project_code: string }).project_code}</span></>
          )}
          {(project as unknown as { storage_prefix?: string | null }).storage_prefix && (
            <> · Složka: <span className="font-mono text-xs">{(project as unknown as { storage_prefix: string }).storage_prefix}</span></>
          )}
        </p>

        <section className="mt-6 rounded-lg border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">Completeness briefu</h2>
          <p className="mt-1 text-2xl font-bold text-stone-900">{completenessPercent} %</p>
          {missingFields.length > 0 && (
            <p className="mt-2 text-sm text-stone-600">Chybějící klíčová pole: {missingFields.join(", ")}</p>
          )}
        </section>

        <section className="mt-6 rounded-lg border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">Dodané informace</h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-stone-500">Značka</dt><dd className="text-stone-900">{brief?.brand_name ?? "—"}</dd>
            <dt className="text-stone-500">Obor</dt><dd className="text-stone-900">{brief?.industry ?? "—"}</dd>
            <dt className="text-stone-500">Cíl</dt><dd className="text-stone-900">{brief?.communication_goal ?? "—"}</dd>
            <dt className="text-stone-500">Síť(e)</dt><dd className="text-stone-900">{brief?.platforms?.length ? brief.platforms.join(", ") : "—"}</dd>
            <dt className="text-stone-500">Tonalita</dt><dd className="text-stone-900">{brief?.tone_of_voice ?? "—"}</dd>
            <dt className="text-stone-500">Web / profil</dt><dd className="text-stone-900">{brief?.website_or_profile ?? "—"}</dd>
            <dt className="text-stone-500">Poznámka</dt><dd className="text-stone-900">{brief?.note ?? "—"}</dd>
            <dt className="text-stone-500">E-mail</dt><dd className="text-stone-900">{project.client_email ?? "— (přístup kód + PIN)"}</dd>
            {brief?.target_audience && <><dt className="text-stone-500">Cílová skupina</dt><dd className="text-stone-900">{brief.target_audience}</dd></>}
            {brief?.offers && <><dt className="text-stone-500">Nabídky / produkty</dt><dd className="text-stone-900">{brief.offers}</dd></>}
            {brief?.forbidden_words && <><dt className="text-stone-500">Zakázaná slova</dt><dd className="text-stone-900">{brief.forbidden_words}</dd></>}
            {brief?.preferred_style && <><dt className="text-stone-500">Preferovaný styl</dt><dd className="text-stone-900">{brief.preferred_style}</dd></>}
            {brief?.preferred_cta && <><dt className="text-stone-500">Preferovaná CTA</dt><dd className="text-stone-900">{brief.preferred_cta}</dd></>}
            {brief?.logo_url && <><dt className="text-stone-500">Logo URL</dt><dd className="text-stone-900 truncate">{brief.logo_url}</dd></>}
            {brief?.brand_colors && <><dt className="text-stone-500">Barvy</dt><dd className="text-stone-900">{brief.brand_colors}</dd></>}
            {brief?.brand_fonts && <><dt className="text-stone-500">Fonty</dt><dd className="text-stone-900">{brief.brand_fonts}</dd></>}
            {brief?.source_url && <><dt className="text-stone-500">URL auto-fill</dt><dd className="text-stone-900">{brief.source_url}</dd></>}
            {brief?.brand_pdf_url && <><dt className="text-stone-500">PDF</dt><dd className="text-stone-900 truncate">{brief.brand_pdf_url}</dd></>}
          </dl>
        </section>

        {Array.isArray((project as unknown as { files?: unknown[] }).files) &&
        (project as unknown as { files: { id: string; kind: string; original_name: string | null; download_url: string | null }[] }).files.length > 0 && (
          <section className="mt-6 rounded-lg border border-stone-200 bg-white p-6">
            <h2 className="font-semibold text-stone-900">Soubory (logo, fotky, PDF)</h2>
            <ul className="mt-3 space-y-2">
              {(project as unknown as { files: { id: string; kind: string; original_name: string | null; download_url: string | null }[] }).files.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded border border-stone-100 bg-stone-50 px-3 py-2 text-sm">
                  <span className="text-stone-700">
                    <span className="font-medium text-stone-500">{f.kind}</span>
                    {f.original_name && ` · ${f.original_name}`}
                  </span>
                  {f.download_url ? (
                    <a href={f.download_url} target="_blank" rel="noreferrer" className="text-lucifera-lime hover:underline">
                      Stáhnout
                    </a>
                  ) : (
                    <span className="text-stone-400">—</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-6 rounded-lg border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">Workflow</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className={`rounded-md px-2.5 py-1 text-sm font-medium ${getBadgeClasses(wf.badge)}`}>
              {wf.label}
            </span>
            {wf.step > 0 && (
              <span className="text-sm text-stone-500">Krok {wf.step}/{wf.total}</span>
            )}
            {wf.who && (
              <span className="rounded bg-stone-100 px-2 py-0.5 text-sm text-stone-600">
                Na tahu: {wf.who}
              </span>
            )}
          </div>
          <p className="mt-3 text-stone-700">
            Právě teď: {wf.currentAction}
          </p>
          {(current === "AI_PROCESSING" || current === "IN_PRODUCTION") && (
            <p className="mt-1 text-sm text-stone-500">ETA: cca 2–5 min</p>
          )}

          {current === "ERROR" && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="font-medium text-red-800">Důvod chyby:</p>
              <p className="mt-1 text-sm text-red-700">
                {meta?.internal_notes || "Neurčeno. Zkuste znovu nebo doplňte internal_notes."}
              </p>
              <button
                type="button"
                onClick={() => setStatus("AWAITING_MANUAL_PROMPT")}
                disabled={updating}
                className="mt-3 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Zkusit znovu
              </button>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <span className="text-stone-600">AI režim:</span>
              <button
                type="button"
                role="switch"
                aria-checked={aiModeManual}
                onClick={() => setAiModeManual(!aiModeManual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  aiModeManual ? "bg-amber-500" : "bg-stone-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    aiModeManual ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="font-medium text-stone-700">
                {aiModeManual ? "Manuální" : "Automatický"}
              </span>
            </label>
          </div>

          {(current === "WAITING_MANUAL_AI_COMMAND" || current === "AWAITING_MANUAL_PROMPT" || current === "READY_FOR_AI" || current === "INPUT_RECEIVED") && aiModeManual && (
            <div className="mt-4 space-y-3">
              {current === "WAITING_MANUAL_AI_COMMAND" && (
                <p className="text-sm text-amber-700 font-medium">
                  ⚡ AI se spustí pouze po manuálním pokynu. Bez tohoto kroku se AI job nevytvoří.
                </p>
              )}
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-stone-500 mb-1">Volitelný pokyn pro AI</label>
                  <input
                    type="text"
                    id="ai-instruction"
                    placeholder="Např. Zaměř se na B2B, použij formálnější tón…"
                    className="w-full rounded border border-stone-300 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={current === "WAITING_MANUAL_AI_COMMAND" ? handleTriggerAI : handleGenerateDrafts}
                  disabled={generating}
                  className="rounded bg-[#A8EB12] px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-[#A8EB12]/90 disabled:opacity-50"
                >
                  {generating ? "Pokyn přijat, zpracováváme…" : current === "WAITING_MANUAL_AI_COMMAND" ? "Spustit AI podle pokynu" : "Odeslat nový pokyn AI"}
                </button>
              </div>
              {generating && <p className="mt-1 text-sm text-stone-500">AI zpracovává zadání</p>}
            </div>
          )}

          <h3 className="mt-6 font-medium text-stone-800">Změnit stav ručně</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s as ProjectStatus)}
                disabled={updating}
                className="rounded bg-stone-800 px-3 py-1.5 text-sm text-white hover:bg-stone-700 disabled:opacity-50"
              >
                → {PROJECT_STATUS_LABELS[s] ?? s}
              </button>
            ))}
            {nextStatuses.length === 0 && <span className="text-sm text-stone-500">Žádné další přechody</span>}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">Timeline</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
              <div>
                <p className="font-medium text-stone-800">Projekt vytvořen</p>
                <p className="text-stone-500">{new Date(project.created_at).toLocaleString("cs-CZ")}</p>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              <div>
                <p className="font-medium text-stone-800">Aktuální stav: {wf.label}</p>
                <p className="text-stone-500">{new Date(project.updated_at).toLocaleString("cs-CZ")}</p>
              </div>
            </li>
          </ul>
        </section>

        <section className="mt-6 rounded-lg border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">Stratega</h2>
          <p className="mt-1 text-sm text-stone-600">
            Vyber stratega a spusť ho – výstup vychází z dat projektu a briefu.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[200px]">
              <label className="block text-xs text-stone-500 mb-1">Strateg</label>
              <select
                value={selectedStrategistId}
                onChange={(e) => setSelectedStrategistId((e.target.value || "") as StrategistId | "")}
                className="w-full rounded border border-stone-300 px-3 py-2 text-sm bg-white"
              >
                {STRATEGISTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} – {s.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleRunStrategist}
              disabled={strategistLoading || !selectedStrategistId}
              className="rounded bg-[#A8EB12] px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-[#A8EB12]/90 disabled:opacity-50"
            >
              {strategistLoading ? "Spouštím…" : "Spustit stratega"}
            </button>
          </div>
          {strategistError && (
            <p className="mt-3 text-sm text-red-600">{strategistError}</p>
          )}
          {strategistOutput != null && strategistOutput !== "" && (
            <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs font-medium text-stone-500 mb-2">Výstup</p>
              <pre className="whitespace-pre-wrap text-sm text-stone-800 font-sans max-h-96 overflow-y-auto">
                {strategistOutput}
              </pre>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-lg border-2 border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold text-stone-900 flex items-center gap-2">
            <span className="text-amber-600">⚡</span>
            AI Textové návrhy
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Vygenerujte 3 textové návrhy příspěvků na základě briefu klienta.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handleGenerateDrafts}
              disabled={generating}
              className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {generating ? "Generuji..." : drafts.length > 0 ? "Regenerovat texty" : "Vygenerovat 3 textové návrhy"}
            </button>
            {drafts.length > 0 && (
              <button
                onClick={handleMarkReady}
                disabled={updating}
                className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                Označit jako připraveno pro klienta
              </button>
            )}
          </div>

          {generationError && (
            <p className="mt-3 text-sm text-red-600">{generationError}</p>
          )}
          {generationWarning && (
            <p className="mt-3 text-sm text-amber-700">{generationWarning}</p>
          )}

          {draftsLoading && <p className="mt-4 text-sm text-stone-500">Načítám návrhy...</p>}

          {!draftsLoading && drafts.length > 0 && (
            <div className="mt-6 space-y-4">
              {drafts.map((draft, i) => (
                <div key={draft.id ?? i} className="rounded-lg border border-stone-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-stone-900">Návrh {draft.draft_index ?? i + 1}</h3>
                    <span className="text-xs text-stone-500">{draft.platform}</span>
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <p><span className="font-medium text-stone-600">Hook:</span> {draft.hook}</p>
                    <p><span className="font-medium text-stone-600">Body:</span> {draft.body}</p>
                    <p><span className="font-medium text-stone-600">CTA:</span> {draft.cta}</p>
                    <p><span className="font-medium text-stone-600">Hashtags:</span> {draft.hashtags?.join(" ") ?? "—"}</p>
                  </div>
                  {draft.status && (
                    <p className="mt-2 text-xs text-stone-400">Status: {draft.status}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {!draftsLoading && drafts.length === 0 && (
            <p className="mt-4 text-sm text-stone-500">Zatím žádné návrhy. Klikněte na tlačítko výše pro vygenerování.</p>
          )}

          <p className="mt-4 text-xs text-stone-400">
            Poznámka: Vizuální generování je v této fázi vypnuto.
          </p>
        </section>

        <p className="mt-4 text-sm text-stone-500">Vytvořeno: {new Date(project.created_at).toLocaleString("cs-CZ")} · Aktualizováno: {new Date(project.updated_at).toLocaleString("cs-CZ")}</p>
      </div>
    </main>
  );
}
