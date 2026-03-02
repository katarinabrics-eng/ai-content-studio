"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "../../components/Header";

type Project = {
  id: string;
  client_id: string;
  type: string;
  status: string;
  intake_data: Record<string, unknown>;
  created_at: string;
};

export default function StudioProjectPage() {
  const params = useParams();
  const projectId = params?.projectId as string | undefined;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(!!projectId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/diagnostika/project/${encodeURIComponent(projectId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setError(data.error);
        else setProject(data.project ?? null);
      })
      .catch(() => {
        if (!cancelled) setError("Nepodařilo se načíst projekt.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (!projectId) {
    return (
      <main className="min-h-screen bg-[#F7F7F5] text-[#1A1A1A]">
        <Header />
        <section className="mx-auto max-w-[820px] px-6 py-12">
          <p>Chybí identifikátor projektu.</p>
          <Link href="/studio" className="mt-4 inline-block text-[#B7E300] hover:underline">
            ← Zpět na Studio
          </Link>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F7F5] text-[#1A1A1A]">
        <Header />
        <section className="mx-auto max-w-[820px] px-6 py-12">
          <p className="text-[#6F6F6F]">Načítám projekt…</p>
        </section>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-[#F7F7F5] text-[#1A1A1A]">
        <Header />
        <section className="mx-auto max-w-[820px] px-6 py-12">
          <p className="text-red-600">{error || "Projekt nenalezen."}</p>
          <Link href="/studio" className="mt-4 inline-block text-[#B7E300] hover:underline">
            ← Zpět na Studio
          </Link>
        </section>
      </main>
    );
  }

  const intake = (project.intake_data || {}) as Record<string, unknown>;
  const brandScore = intake.brandScore as Record<string, unknown> | undefined;
  const brandDna = intake.brandDna as Record<string, unknown> | undefined;
  const analyzedUrl = intake.analyzedUrl as string | undefined;
  const consultationDate = intake.consultationDate as string | undefined;

  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#1A1A1A]">
      <Header />
      <section className="mx-auto max-w-[820px] px-6 py-12">
        <Link href="/studio" className="text-sm text-[#6F6F6F] hover:underline">
          ← Zpět na přehled
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-[#1A1A1A]">
          {project.type === "diagnostic" ? "Strategická konzultace" : project.type}
        </h1>
        <p className="mt-1 text-sm text-[#6F6F6F]">
          Stav:{" "}
          <span
            className={
              project.status === "active"
                ? "text-green-700"
                : project.status === "closed"
                  ? "text-[#6F6F6F]"
                  : "text-amber-700"
            }
          >
            {project.status === "pending" ? "čeká na platbu" : project.status === "active" ? "aktivní" : "uzavřený"}
          </span>
        </p>

        <div className="mt-8 space-y-6">
          <section className="rounded-2xl border border-[#EAEAE7] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#1A1A1A]">Výstup z AI diagnostiky</h2>
            {analyzedUrl && (
              <p className="mt-2 text-sm text-[#6F6F6F]">
                Analyzovaný web:{" "}
                <a href={analyzedUrl} target="_blank" rel="noopener noreferrer" className="text-[#B7E300] hover:underline">
                  {analyzedUrl}
                </a>
              </p>
            )}
            {brandScore && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-[#6F6F6F]">Brand skóre</h3>
                <pre className="mt-2 overflow-auto rounded-lg bg-[#F7F7F5] p-3 text-xs text-[#1A1A1A]">
                  {JSON.stringify(brandScore, null, 2)}
                </pre>
              </div>
            )}
            {brandDna && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-[#6F6F6F]">Brand DNA</h3>
                <pre className="mt-2 max-h-[300px] overflow-auto rounded-lg bg-[#F7F7F5] p-3 text-xs text-[#1A1A1A]">
                  {JSON.stringify(brandDna, null, 2)}
                </pre>
              </div>
            )}
          </section>

          {consultationDate && (
            <section className="rounded-2xl border border-[#EAEAE7] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-medium text-[#1A1A1A]">Domluvený termín</h2>
              <p className="mt-2 text-[#1A1A1A]">{consultationDate}</p>
            </section>
          )}

          <section className="rounded-2xl border border-dashed border-[#EAEAE7] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#1A1A1A]">Dokumenty</h2>
            <p className="mt-2 text-sm text-[#6F6F6F]">Placeholder – upload dokumentů.</p>
          </section>

          <section className="rounded-2xl border border-dashed border-[#EAEAE7] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#1A1A1A]">Budoucí výstupy</h2>
            <p className="mt-2 text-sm text-[#6F6F6F]">Placeholder – výstupy z konzultace.</p>
          </section>
        </div>
      </section>
    </main>
  );
}
