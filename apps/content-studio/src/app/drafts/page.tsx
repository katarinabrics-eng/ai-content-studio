"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { StoredPostDraft } from "@/lib/posts-schema";

function DraftsContent() {
  const searchParams = useSearchParams();
  const intakeIdParam = searchParams.get("intakeId");

  const [drafts, setDrafts] = useState<StoredPostDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const q = intakeIdParam ? `?intakeId=${encodeURIComponent(intakeIdParam)}` : "";
    fetch(`/api/posts${q}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.ok && Array.isArray(data.drafts)) {
          setDrafts(data.drafts);
        } else {
          setDrafts([]);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Nepodařilo se načíst návrhy.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [intakeIdParam]);

  async function handleGenerate() {
    setGenerateError(null);
    setGenerateLoading(true);
    try {
      const body: { intakeId?: string; count?: number } = intakeIdParam ? { intakeId: intakeIdParam, count: 3 } : { count: 3 };
      const res = await fetch("/api/posts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setGenerateError(data.error ?? "Generování selhalo.");
        return;
      }
      if (data.ok && Array.isArray(data.drafts)) {
        setDrafts(data.drafts);
      }
    } catch {
      setGenerateError("Došlo k chybě při generování.");
    } finally {
      setGenerateLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Návrhy postů</h1>
      <p className="mt-1 text-slate-600">
        Vygenerujte 3 návrhy postů na základě posledního intake (nebo zvoleného intake).
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generateLoading}
          className="rounded-md bg-slate-800 px-4 py-2.5 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {generateLoading ? "Generuji…" : "Vygenerovat 3 návrhy"}
        </button>
        <a
          href="/intake"
          className="rounded-md border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
        >
          Zpět na Intake
        </a>
      </div>

      {generateError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
          {generateError}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-slate-500">Načítám…</p>
      ) : drafts.length === 0 ? (
        <p className="mt-6 text-slate-500">
          Zatím žádné návrhy. Klikněte na „Vygenerovat 3 návrhy“ nebo nejdřív odešlete intake.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...drafts]
            .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
            .slice(0, 3)
            .map((draft) => (
            <article
              key={draft.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-sm font-medium text-slate-700">
                  {draft.platform}
                </span>
                {draft.angle ? (
                  <span className="text-xs text-slate-500">Úhel: {draft.angle}</span>
                ) : null}
              </div>
              {draft.hook ? (
                <p className="mb-2 font-medium text-slate-800">{draft.hook}</p>
              ) : null}
              {draft.caption ? (
                <p className="mb-2 whitespace-pre-wrap text-sm text-slate-700">{draft.caption}</p>
              ) : null}
              {draft.cta ? (
                <p className="mb-2 text-sm text-slate-600">
                  <span className="font-medium">CTA:</span> {draft.cta}
                </p>
              ) : null}
              {Array.isArray(draft.hashtags) && draft.hashtags.length > 0 ? (
                <p className="mb-2 text-sm text-slate-500">
                  {draft.hashtags.join(" ")}
                </p>
              ) : null}
              {draft.visualBrief ? (
                <p className="text-xs text-slate-500">
                  <span className="font-medium">Vizuál:</span> {draft.visualBrief}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DraftsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Načítám…</div>}>
      <DraftsContent />
    </Suspense>
  );
}
