"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { StoredPostDraft } from "@/lib/posts-schema";

function DraftsContent() {
  const searchParams = useSearchParams();
  const intakeIdParam = searchParams.get("intakeId");

  const [drafts, setDrafts] = useState<StoredPostDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generatingVisualId, setGeneratingVisualId] = useState<string | null>(null);
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

  async function handleGenerateVisual(draftId: string) {
    setGeneratingVisualId(draftId);
    try {
      const res = await fetch("/api/visuals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = data.error ?? "Generování vizuálu selhalo.";
        setDrafts((prev) => {
          const idx = prev.findIndex((d) => d.id === draftId);
          if (idx < 0) return prev;
          const next = [...prev];
          next[idx] = { ...next[idx], visualStatus: "error", visualError: errMsg };
          return next;
        });
        return;
      }
      if (data.ok && data.visualImageUrl) {
        setDrafts((prev) => {
          const idx = prev.findIndex((d) => d.id === draftId);
          if (idx < 0) return prev;
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            visualImageUrl: data.visualImageUrl,
            visualStatus: "ready",
            visualError: undefined,
          };
          return next;
        });
      }
    } catch {
      setDrafts((prev) => {
        const idx = prev.findIndex((d) => d.id === draftId);
        if (idx < 0) return prev;
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          visualStatus: "error",
          visualError: "Došlo k chybě při generování.",
        };
        return next;
      });
    } finally {
      setGeneratingVisualId(null);
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
                <p className="mb-3 text-xs text-slate-500">
                  <span className="font-medium">Vizuál:</span> {draft.visualBrief}
                </p>
              ) : null}
              <div className="mt-3 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => handleGenerateVisual(draft.id)}
                  disabled={generatingVisualId === draft.id}
                  className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  {generatingVisualId === draft.id
                    ? "Generuji…"
                    : draft.visualImageUrl
                      ? "Regenerovat"
                      : "Vygenerovat vizuál"}
                </button>
                {draft.visualImageUrl ? (
                  <div className="mt-3">
                    <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-lg border border-slate-200">
                      <Image
                        src={draft.visualImageUrl}
                        alt="Náhled vizuálu"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <a
                      href={draft.visualImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-600 underline hover:text-slate-800"
                    >
                      Stáhnout PNG
                    </a>
                  </div>
                ) : null}
                {draft.visualError ? (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {draft.visualError}
                  </p>
                ) : null}
              </div>
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
