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

export default function AdminProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<ProjectWithBriefAndMeta | null>(null);
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
  const brief = project.brief;
  const meta = project.admin_meta;
  const { percent: completenessPercent, missing: missingFields } = meta
    ? { percent: meta.brief_completeness, missing: meta.missing_fields }
    : getBriefCompleteness(brief);

  return (
    <main className="min-h-screen bg-stone-100 p-6">
      <div className="mx-auto max-w-3xl">
        <a href="/admin/projects" className="text-sm text-stone-600 hover:underline">← Přehled projektů</a>
        <h1 className="mt-4 text-2xl font-bold text-stone-900">{brief?.brand_name || "Projekt"}</h1>
        <p className="text-stone-600">ID: {project.id} · Tarif: {project.plan_id}</p>

        <section className="mt-6 rounded-lg border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">Completeness briefu</h2>
          <p className="mt-1 text-2xl font-bold text-stone-900">{completenessPercent} %</p>
          {missingFields.length > 0 && (
            <p className="mt-2 text-sm text-stone-600">Chybějící klíčová pole: {missingFields.join(", ")}</p>
          )}
        </section>

        <section className="mt-6 rounded-lg border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">Dodané informace</h2>
          <dl className="mt-3 space-y-1 text-sm">
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
            {brief?.logo_url && <><dt className="text-stone-500">Logo URL</dt><dd className="text-stone-900">{brief.logo_url}</dd></>}
            {brief?.brand_colors && <><dt className="text-stone-500">Barvy</dt><dd className="text-stone-900">{brief.brand_colors}</dd></>}
            {brief?.brand_fonts && <><dt className="text-stone-500">Fonty</dt><dd className="text-stone-900">{brief.brand_fonts}</dd></>}
            {brief?.source_url && <><dt className="text-stone-500">URL auto-fill</dt><dd className="text-stone-900">{brief.source_url}</dd></>}
            {brief?.brand_pdf_url && <><dt className="text-stone-500">PDF</dt><dd className="text-stone-900">{brief.brand_pdf_url}</dd></>}
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
