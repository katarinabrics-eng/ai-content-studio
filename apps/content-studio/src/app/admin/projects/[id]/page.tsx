"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_ORDER,
  ALLOWED_TRANSITIONS,
  type ProjectStatus,
} from "@/lib/project-status-engine";
import { getBriefCompleteness } from "@/lib/supabase-projects";
import type { ProjectWithBriefAndMeta } from "@/lib/supabase-projects";

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

  const current = project.status as ProjectStatus;
  const nextStatuses = ALLOWED_TRANSITIONS[current] ?? [];
  const brief = project.brief;
  const meta = project.admin_meta;
  const { percent: completenessPercent, missing: missingFields } = meta
    ? { percent: meta.brief_completeness, missing: meta.missing_fields }
    : getBriefCompleteness(brief);

  return (
    <main className="min-h-screen bg-stone-100 p-6">
      <div className="mx-auto max-w-4xl">
        <a href="/admin/projects" className="text-sm text-stone-600 hover:underline">← Přehled projektů</a>
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
