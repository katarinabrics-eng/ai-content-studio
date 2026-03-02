"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-100 p-6">
        <p className="text-stone-500">Načítám…</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-stone-100 p-6">
        <p className="text-stone-600">Projekt nenalezen.</p>
        <Link href="/admin/clients" className="mt-2 inline-block text-sm text-stone-700 underline">← Seznam klientů</Link>
      </main>
    );
  }

  const score = project.scan_result?.brandScore as { total?: number } | undefined;
  const brandDna = project.scan_result?.brandDna as Record<string, unknown> | undefined;
  const summary = project.scan_result?.summary as string | undefined;

  return (
    <main className="min-h-screen bg-stone-100 p-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin/clients" className="text-sm text-stone-600 hover:text-stone-900">← Seznam klientů</Link>

        <div className="mt-6 rounded-lg border border-stone-200 bg-white p-6">
          <h1 className="text-xl font-bold text-stone-900">Detail klienta</h1>
          <p className="mt-1 text-sm text-stone-500">Vytvořeno: {new Date(project.created_at).toLocaleString("cs-CZ")}</p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold uppercase text-stone-500">Kontakt</h2>
              <p className="mt-1 text-stone-900">{project.email ?? "—"}</p>
              <p className="mt-1 text-stone-600">{project.name ?? "—"}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase text-stone-500">Platba / termín</h2>
              <p className="mt-1">
                <span className={project.payment_status === "paid" ? "text-green-700 font-medium" : "text-stone-600"}>
                  {project.payment_status === "paid" ? "Zaplaceno" : project.payment_status === "pending" ? "Čeká na platbu" : "—"}
                </span>
              </p>
              {project.booking_date && project.booking_time && (
                <p className="mt-1 text-stone-600">Termín: {project.booking_date} {project.booking_time}</p>
              )}
              <p className="mt-1 text-sm text-stone-500">Stav: {project.status}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-stone-200 pt-6">
            <h2 className="text-sm font-semibold uppercase text-stone-500">Vstup</h2>
            {project.web_url && <p className="mt-2 text-stone-700">Web: <a href={project.web_url} target="_blank" rel="noreferrer" className="underline">{project.web_url}</a></p>}
            {project.manual_input && <div className="mt-2 rounded bg-stone-50 p-3 text-sm text-stone-700 whitespace-pre-wrap">{project.manual_input}</div>}
            {!project.web_url && !project.manual_input && <p className="mt-2 text-stone-500">—</p>}
          </div>

          <div className="mt-8 border-t border-stone-200 pt-6">
            <h2 className="text-sm font-semibold uppercase text-stone-500">Výstup scanu</h2>
            {score?.total != null && <p className="mt-2 text-stone-700">Skóre: <strong>{score.total}</strong> / 100</p>}
            {summary && <p className="mt-2 text-stone-700">{summary}</p>}
            {brandDna && (
              <div className="mt-4 rounded bg-stone-50 p-4 text-sm">
                <p className="font-medium text-stone-700">Brand DNA</p>
                <pre className="mt-2 overflow-auto max-h-60 whitespace-pre-wrap text-stone-600">{JSON.stringify(brandDna, null, 2)}</pre>
              </div>
            )}
            {(!project.scan_result || Object.keys(project.scan_result).length === 0) && <p className="mt-2 text-stone-500">Žádná data.</p>}
          </div>

          <div className="mt-8 border-t border-stone-200 pt-6">
            <p className="text-sm text-stone-500">AI pracovní pole (tlačítka strategie, positioning, pilíře…) – připravíme v dalším kroku.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
