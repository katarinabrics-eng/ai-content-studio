"use client";

import Image from "next/image";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { StoredPostDraft } from "@/lib/posts-schema";
import { STRATEGY_PRESETS } from "@/lib/strategy-library";

const VISUAL_TIMEOUT_MS = 120_000;
const SUCCESS_MESSAGE_DURATION_MS = 2000;

function getProgressMessage(elapsedSec: number): string {
  if (elapsedSec >= 45) return "Dokončuji finální kompozici...";
  if (elapsedSec >= 25) return "Vyhodnocuji nejlepší variantu...";
  if (elapsedSec >= 10) return "Generuji varianty vizuálu...";
  return "Analyzuji brand a připravuji scénu...";
}

const FORMAT_OPTIONS = [
  { value: "instagram-feed", label: "IG Feed 1080×1350" },
  { value: "instagram-story", label: "IG Story 1080×1920" },
  { value: "facebook-feed", label: "FB Feed 1080×1350" },
  { value: "linkedin-post", label: "LinkedIn 1200×627" },
] as const;

const STYLE_OPTIONS = [
  { value: "generic_saas", label: "SaaS (obecný)" },
  { value: "minimal_clean", label: "Minimal clean" },
  { value: "bold_growth", label: "Bold growth" },
  { value: "simby_product_ad", label: "SIMBY produktový creative" },
] as const;

function DraftsContent() {
  const searchParams = useSearchParams();
  const intakeIdParam = searchParams.get("intakeId");

  const [drafts, setDrafts] = useState<StoredPostDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [visualStatusByDraftId, setVisualStatusByDraftId] = useState<Record<string, "idle" | "running" | "done" | "error">>({});
  const [visualMessageByDraftId, setVisualMessageByDraftId] = useState<Record<string, string>>({});
  const [visualStartedAtByDraftId, setVisualStartedAtByDraftId] = useState<Record<string, number | null>>({});
  const [visualElapsedByDraftId, setVisualElapsedByDraftId] = useState<Record<string, number>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showBasePerDraft, setShowBasePerDraft] = useState<Record<string, boolean>>({});
  const [formatPerDraft, setFormatPerDraft] = useState<Record<string, string>>({});
  const [styleLockedPerDraft, setStyleLockedPerDraft] = useState<Record<string, boolean>>({});
  const [strategyOverridePerDraft, setStrategyOverridePerDraft] = useState<Record<string, string>>({});
  const [useStrategyOverridePerDraft, setUseStrategyOverridePerDraft] = useState<Record<string, boolean>>({});
  const [brandLock, setBrandLock] = useState(true);
  const [styleProfilePerDraft, setStyleProfilePerDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  /** "studio" = 1 column (default), "compact" = 2 columns */
  const [viewMode, setViewMode] = useState<"studio" | "compact">("studio");

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

  // Elapsed timer + progress messages for running visual generation
  useEffect(() => {
    const runningIds = Object.entries(visualStatusByDraftId)
      .filter(([, s]) => s === "running")
      .map(([id]) => id);
    if (runningIds.length === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      const now = Date.now();
      setVisualElapsedByDraftId((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const id of runningIds) {
          const started = visualStartedAtByDraftId[id];
          if (started != null) {
            const elapsed = Math.floor((now - started) / 1000);
            if (next[id] !== elapsed) {
              next[id] = elapsed;
              changed = true;
            }
          }
        }
        return changed ? next : prev;
      });
      setVisualMessageByDraftId((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const id of runningIds) {
          const started = visualStartedAtByDraftId[id];
          if (started != null) {
            const elapsed = Math.floor((now - started) / 1000);
            const msg = getProgressMessage(elapsed);
            if (next[id] !== msg) {
              next[id] = msg;
              changed = true;
            }
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visualStatusByDraftId, visualStartedAtByDraftId]);

  async function handleGenerate() {
    setGenerateError(null);
    setGenerateLoading(true);
    try {
      const body: { intakeId?: string; count?: number; brandLock?: boolean } = intakeIdParam
        ? { intakeId: intakeIdParam, count: 3, brandLock }
        : { count: 3, brandLock };
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

  const setVisualCardState = useCallback(
    (id: string, status: "idle" | "running" | "done" | "error", message?: string) => {
      setVisualStatusByDraftId((p) => ({ ...p, [id]: status }));
      if (message !== undefined) setVisualMessageByDraftId((p) => ({ ...p, [id]: message }));
      if (status === "running") {
        setVisualStartedAtByDraftId((p) => ({ ...p, [id]: Date.now() }));
        setVisualElapsedByDraftId((p) => ({ ...p, [id]: 0 }));
      } else {
        setVisualStartedAtByDraftId((p) => ({ ...p, [id]: null }));
      }
    },
    []
  );

  async function handleGenerateVisual(draftId: string, sameStyle = false) {
    setVisualCardState(draftId, "running", "Analyzuji brand a připravuji scénu...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), VISUAL_TIMEOUT_MS);

    const format = formatPerDraft[draftId];
    const styleProfile = styleProfilePerDraft[draftId];
    const lockStyle = sameStyle || styleLockedPerDraft[draftId];
    const useOverride = useStrategyOverridePerDraft[draftId] ?? false;
    const strategyIdOverride = useOverride && strategyOverridePerDraft[draftId] ? strategyOverridePerDraft[draftId] : undefined;

    try {
      const res = await fetch("/api/visuals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId,
          format: format || undefined,
          lockStyle,
          brandLock,
          styleProfile: styleProfile || undefined,
          strategyIdOverride: strategyIdOverride || undefined,
          strategyModeOverride: useOverride && strategyIdOverride ? "manual" : undefined,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg = [data.error, data.detail, data.hint].filter(Boolean).join(" – ") || "Generování vizuálu selhalo.";
        setVisualCardState(draftId, "error", errMsg);
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
            visualBaseImageUrl: data.visualBaseImageUrl ?? next[idx].visualBaseImageUrl,
            visualStatus: "ready",
            visualError: undefined,
            visualCreativeScore: data.visualCreativeScore ?? next[idx].visualCreativeScore,
            visualFormat: data.visualFormat ?? next[idx].visualFormat,
            visualBrandApplied: data.brandApplied ?? next[idx].visualBrandApplied,
            visualBrandWarnings: data.brandWarnings ?? next[idx].visualBrandWarnings,
            visualStrategyId: data.visualStrategyId ?? next[idx].visualStrategyId,
            visualStrategySource: data.visualStrategySource ?? next[idx].visualStrategySource,
            visualCriticNote: data.visualCriticNote ?? next[idx].visualCriticNote,
          };
          return next;
        });
        setVisualCardState(draftId, "done", "Hotovo. Vizuál je připraven.");
        setTimeout(() => {
          setVisualStatusByDraftId((p) => {
            const next = { ...p };
            if (next[draftId] === "done") delete next[draftId];
            return next;
          });
          setVisualMessageByDraftId((p) => {
            const next = { ...p };
            delete next[draftId];
            return next;
          });
        }, SUCCESS_MESSAGE_DURATION_MS);
      }
    } catch (e) {
      clearTimeout(timeoutId);
      const isAbort = e instanceof Error && e.name === "AbortError";
      const errMsg = isAbort
        ? "Generování trvá déle než obvykle. Zkuste to znovu."
        : (e instanceof Error ? e.message : "Došlo k chybě při generování.");
      setVisualCardState(draftId, "error", errMsg);
      setDrafts((prev) => {
        const idx = prev.findIndex((d) => d.id === draftId);
        if (idx < 0) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], visualStatus: "error", visualError: errMsg };
        return next;
      });
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
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={brandLock}
            onChange={(e) => setBrandLock(e.target.checked)}
          />
          <span className="text-sm font-medium text-slate-700">Brand Lock</span>
        </label>
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
        <>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Zobrazení:</span>
            <button
              type="button"
              onClick={() => setViewMode("studio")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${viewMode === "studio" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              Studio (1 sloupec)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("compact")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${viewMode === "compact" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              Kompaktní (2 sloupce)
            </button>
          </div>
          <div
            className={`mt-6 grid gap-6 ${viewMode === "compact" ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"}`}
          >
          {[...drafts]
            .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
            .slice(0, 3)
            .map((draft) => (
            <article
              key={draft.id}
              className="max-w-none rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-sm font-medium text-slate-700">
                  {draft.platform}
                </span>
                {draft.angle ? (
                  <span className="text-xs text-slate-500">Úhel: {draft.angle}</span>
                ) : null}
              </div>
              {draft.strategyLabel ? (
                <div className="mb-2 rounded-md bg-slate-50 p-2 text-sm">
                  <p className="font-medium text-slate-700">
                    Použitá strategie: {draft.strategyLabel}
                  </p>
                  {draft.strategyRationale ? (
                    <p className="mt-1 text-xs text-slate-600">{draft.strategyRationale}</p>
                  ) : null}
                </div>
              ) : null}
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
                {draft.visualCreativeScore != null ? (
                  <span className="mb-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Creative quality: {draft.visualCreativeScore}/10
                  </span>
                ) : null}
                {draft.visualCriticNote ? (
                  <p className="mb-2 text-xs text-slate-600 italic">{draft.visualCriticNote}</p>
                ) : null}
                {draft.visualBrandApplied ? (
                  <div className="mb-2 flex flex-wrap gap-1 text-xs text-slate-600">
                    {draft.visualBrandApplied.colors ? <span className="rounded bg-green-100 px-1.5 py-0.5">barvy</span> : null}
                    {draft.visualBrandApplied.logo ? <span className="rounded bg-green-100 px-1.5 py-0.5">logo</span> : null}
                    {draft.visualBrandApplied.tone ? <span className="rounded bg-green-100 px-1.5 py-0.5">tón</span> : null}
                    {draft.visualBrandApplied.layout ? <span className="rounded bg-green-100 px-1.5 py-0.5">layout</span> : null}
                  </div>
                ) : null}
                {draft.brandApplied ? (
                  <div className="mb-2 flex flex-wrap gap-1 text-xs text-slate-600">
                    {draft.brandApplied.tone ? <span className="rounded bg-green-100 px-1.5 py-0.5">tón</span> : null}
                    {draft.brandApplied.forbiddenWords ? <span className="rounded bg-green-100 px-1.5 py-0.5">zakázaná slova</span> : null}
                    {draft.brandApplied.platform ? <span className="rounded bg-green-100 px-1.5 py-0.5">platforma</span> : null}
                  </div>
                ) : null}
                {(draft.visualBrandWarnings?.length ?? draft.brandWarnings?.length ?? 0) > 0 ? (
                  <div className="mb-2 text-xs text-amber-700">
                    {(draft.visualBrandWarnings ?? draft.brandWarnings ?? []).map((w, i) => (
                      <div key={i}>⚠ {w}</div>
                    ))}
                  </div>
                ) : null}
                <div className="mb-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={useStrategyOverridePerDraft[draft.id] ?? false}
                        onChange={(e) =>
                          setUseStrategyOverridePerDraft((p) => ({ ...p, [draft.id]: e.target.checked }))
                        }
                      />
                      Použít override jen pro tento vizuál
                    </label>
                  </div>
                  {(useStrategyOverridePerDraft[draft.id] ?? false) && (
                    <select
                      value={strategyOverridePerDraft[draft.id] ?? ""}
                      onChange={(e) =>
                        setStrategyOverridePerDraft((p) => ({ ...p, [draft.id]: e.target.value }))
                      }
                      className="rounded border border-slate-300 px-2 py-1 text-sm"
                    >
                      <option value="">Vyberte strategii</option>
                      {STRATEGY_PRESETS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.publicLabel}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <select
                    value={formatPerDraft[draft.id] ?? draft.visualFormat ?? "instagram-feed"}
                    onChange={(e) =>
                      setFormatPerDraft((p) => ({ ...p, [draft.id]: e.target.value }))
                    }
                    className="rounded border border-slate-300 px-2 py-1 text-sm"
                  >
                    {FORMAT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={styleProfilePerDraft[draft.id] ?? ""}
                    onChange={(e) =>
                      setStyleProfilePerDraft((p) => ({ ...p, [draft.id]: e.target.value }))
                    }
                    className="rounded border border-slate-300 px-2 py-1 text-sm"
                  >
                    <option value="">Styl (default)</option>
                    {STYLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={styleLockedPerDraft[draft.id] ?? draft.visualStyleLocked ?? false}
                      onChange={(e) =>
                        setStyleLockedPerDraft((p) => ({ ...p, [draft.id]: e.target.checked }))
                      }
                    />
                    Uzamknout styl
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateVisual(draft.id, false)}
                    disabled={visualStatusByDraftId[draft.id] === "running"}
                    className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {visualStatusByDraftId[draft.id] === "running"
                      ? "Generuji…"
                      : draft.visualImageUrl
                        ? "Regenerovat"
                        : "Vygenerovat vizuál"}
                  </button>
                  {draft.visualImageUrl ? (
                    <button
                      type="button"
                      onClick={() => handleGenerateVisual(draft.id, true)}
                      disabled={visualStatusByDraftId[draft.id] === "running"}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Regenerovat ve stejném stylu
                    </button>
                  ) : null}
                </div>
                {(visualStatusByDraftId[draft.id] === "running" ||
                  visualStatusByDraftId[draft.id] === "done" ||
                  visualStatusByDraftId[draft.id] === "error") && (
                  <div className="mt-2 min-h-[2.5rem] rounded border border-slate-200 bg-slate-50 px-3 py-2" role="status">
                    {visualStatusByDraftId[draft.id] === "running" && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-slate-700" aria-hidden />
                        <span>{visualMessageByDraftId[draft.id] ?? "Generuji…"}</span>
                        <span className="text-slate-500">
                          ({visualElapsedByDraftId[draft.id] ?? 0} s)
                        </span>
                      </div>
                    )}
                    {(visualStatusByDraftId[draft.id] === "done" || visualStatusByDraftId[draft.id] === "error") && (
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm ${visualStatusByDraftId[draft.id] === "error" ? "text-red-700" : "text-green-700"}`}
                        >
                          {visualMessageByDraftId[draft.id]}
                        </p>
                        {visualStatusByDraftId[draft.id] === "error" && (
                          <button
                            type="button"
                            onClick={() => {
                              setVisualStatusByDraftId((p) => ({ ...p, [draft.id]: "idle" }));
                              setVisualMessageByDraftId((p) => {
                                const n = { ...p };
                                delete n[draft.id];
                                return n;
                              });
                              handleGenerateVisual(draft.id, false);
                            }}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Zkusit znovu
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {draft.visualImageUrl || draft.visualBaseImageUrl ? (
                  <div className="mt-3">
                    <div className="mb-1 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setShowBasePerDraft((p) => ({ ...p, [draft.id]: false }))
                        }
                        className={`text-xs ${!showBasePerDraft[draft.id] ? "font-bold underline" : "text-slate-500"}`}
                      >
                        Finální
                      </button>
                      {draft.visualBaseImageUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setShowBasePerDraft((p) => ({ ...p, [draft.id]: true }))
                          }
                          className={`text-xs ${showBasePerDraft[draft.id] ? "font-bold underline" : "text-slate-500"}`}
                        >
                          Base
                        </button>
                      ) : null}
                    </div>
                    <div className="relative mb-2 w-full overflow-hidden rounded-lg border border-slate-200" style={{ aspectRatio: "4/5" }}>
                      <Image
                        src={
                          showBasePerDraft[draft.id] && draft.visualBaseImageUrl
                            ? draft.visualBaseImageUrl
                            : draft.visualImageUrl!
                        }
                        alt="Náhled vizuálu"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1280px) 100vw, 50vw"
                      />
                    </div>
                    <a
                      href={draft.visualImageUrl ?? draft.visualBaseImageUrl ?? "#"}
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
        </>
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
