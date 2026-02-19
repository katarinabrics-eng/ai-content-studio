"use client";

import { useEffect, useState } from "react";
import { PROJECT_STATUS_LABELS } from "@/lib/project-status-engine";
import type { ProjectStatus } from "@/lib/project-status-engine";

type Project = {
  id: string;
  plan_id: string;
  client_email: string | null;
  status: string;
  created_at: string;
  brief?: { brand_name?: string } | null;
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.projects)) setProjects(d.projects);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-stone-100 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-stone-900">Přehled projektů (test)</h1>
        <p className="mt-1 text-stone-600">Klient, tarif, stav, datum.</p>
        {loading && <p className="mt-6 text-stone-500">Načítám…</p>}
        {!loading && projects.length === 0 && <p className="mt-6 text-stone-500">Zatím žádné projekty.</p>}
        {!loading && projects.length > 0 && (
          <ul className="mt-6 space-y-3">
            {projects.map((p) => (
              <li key={p.id} className="rounded-lg border border-stone-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <a href={"/admin/projects/" + p.id} className="font-medium text-stone-900 hover:underline">
                      {p.brief?.brand_name ?? "—"}
                    </a>
                    <p className="text-sm text-stone-500">{p.client_email ?? "Přístup: kód + PIN"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-stone-100 px-2 py-0.5 text-sm text-stone-700">
                      {PROJECT_STATUS_LABELS[p.status as ProjectStatus] ?? p.status}
                    </span>
                    <span className="text-sm text-stone-500">{p.plan_id}</span>
                    <span className="text-sm text-stone-500">{new Date(p.created_at).toLocaleDateString("cs-CZ")}</span>
                    <a href={"/admin/projects/" + p.id} className="text-sm text-lucifera-lime hover:underline">Detail</a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
