"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AWARENESS_LEVELS,
  CONTENT_GOAL_OPTIONS,
  PLATFORM_OPTIONS,
  STYLE_PREFERENCE_OPTIONS,
  type AwarenessLevel,
  type IntakeFormData,
} from "@/lib/intake-schema";
import { STRATEGY_PRESETS } from "@/lib/strategy-library";
import type { EnrichApiResponse, EnrichPrefill, EnrichSuggestions } from "@/lib/enrich-schema";

const LOGO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const LOGO_MIME = "image/png";

type SubmitStatus = "idle" | "success" | "error";
type SubmitError = { message?: string; details?: Record<string, string[]> };

type EnrichMeta = { missingFields: string[]; confidence: number; lowConfidence?: boolean; warnings?: string[] };

function SuggestionChips({
  items,
  onSelect,
  label = "AI návrhy",
}: {
  items: string[];
  onSelect: (value: string) => void;
  label?: string;
}) {
  if (!items.length) return null;
  return (
    <div className="mt-2">
      <span className="text-xs font-medium text-slate-500">{label}:</span>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {items.map((s, i) => (
          <button
            key={`${i}-${s.slice(0, 30)}`}
            type="button"
            onClick={() => onSelect(s)}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-200"
          >
            {s.length > 40 ? `${s.slice(0, 38)}…` : s}
          </button>
        ))}
      </div>
    </div>
  );
}

function IntakeContent() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState<SubmitError | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [enrichWebsite, setEnrichWebsite] = useState("");
  const [enrichPdfFile, setEnrichPdfFile] = useState<File | null>(null);
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);
  const [enrichMeta, setEnrichMeta] = useState<EnrichMeta | null>(null);
  const [enrichSuggestions, setEnrichSuggestions] = useState<EnrichSuggestions | null>(null);
  const enrichPdfRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const client = searchParams.get("client");
    const website = searchParams.get("website");
    if (client != null && client.trim()) {
      setForm((prev) => ({ ...prev, brandName: decodeURIComponent(client.trim()) }));
    }
    if (website != null && website.trim()) {
      const w = decodeURIComponent(website.trim());
      setForm((prev) => ({ ...prev, website: w }));
      setEnrichWebsite(w);
    }
  }, [searchParams]);

  const [lastSubmittedIntakeId, setLastSubmittedIntakeId] = useState<string | null>(null);
  const [clientEmailForPipeline, setClientEmailForPipeline] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [brandPdfFile, setBrandPdfFile] = useState<File | null>(null);
  const [pipelineSubmitting, setPipelineSubmitting] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<{ projectCode: string; pin: string | null; projectId: string; loginUrl?: string } | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const brandPdfInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<IntakeFormData>({
    brandName: "",
    website: "",
    industry: "",
    targetAudience: "",
    offers: "",
    toneOfVoice: "",
    forbiddenWords: "",
    contentGoal: "edukace",
    platforms: [],
    stylePreference: "edukace",
    ctaPreference: "",
    strategyMode: "auto",
    strategyId: undefined,
    awarenessLevel: "problem_aware",
    brandCoreOneLiner: "",
    allowedTopics: [],
    disallowedTopics: [],
    brandAssets: {
      logoUrl: "",
      colors: "",
      fonts: "",
      photosNote: "",
    },
  });

  const update = (updates: Partial<IntakeFormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setStatus("idle");
    setError(null);
  };

  const togglePlatform = (p: (typeof PLATFORM_OPTIONS)[number]) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter((x) => x !== p)
        : [...prev.platforms, p],
    }));
    setStatus("idle");
  };

  function validateLogoFile(file: File): string | null {
    if (file.type !== LOGO_MIME) {
      return "Logo musí být soubor PNG (image/png).";
    }
    if (file.size > LOGO_MAX_BYTES) {
      return "Logo může mít maximálně 5 MB.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setError(null);

    if (logoFile) {
      const logoErr = validateLogoFile(logoFile);
      if (logoErr) {
        setStatus("error");
        setError({ message: logoErr });
        return;
      }
    }

    const payload = {
      ...form,
      website: form.website?.trim() || undefined,
      forbiddenWords: form.forbiddenWords?.trim() || undefined,
      ctaPreference: form.ctaPreference?.trim() || undefined,
      brandCoreOneLiner: form.brandCoreOneLiner?.trim() || undefined,
      allowedTopics: form.allowedTopics?.length ? form.allowedTopics : undefined,
      disallowedTopics: form.disallowedTopics?.length ? form.disallowedTopics : undefined,
      brandAssets: form.brandAssets
        ? {
            logoUrl: form.brandAssets.logoUrl?.trim() || undefined,
            colors: form.brandAssets.colors?.trim() || undefined,
            fonts: form.brandAssets.fonts?.trim() || undefined,
            photosNote: form.brandAssets.photosNote?.trim() || undefined,
          }
        : undefined,
    };

    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    if (logoFile) {
      formData.append("logoFile", logoFile);
    }

    const res = await fetch("/api/intake", {
      method: "POST",
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.ok) {
      setStatus("success");
      if (typeof data.id === "string") setLastSubmittedIntakeId(data.id);
      setLogoFile(null);
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
      setForm({
        brandName: "",
        website: "",
        industry: "",
        targetAudience: "",
        offers: "",
        toneOfVoice: "",
        forbiddenWords: "",
        contentGoal: "edukace",
        platforms: [],
        stylePreference: "edukace",
        ctaPreference: "",
        strategyMode: "auto",
        strategyId: undefined,
        awarenessLevel: "problem_aware",
        brandCoreOneLiner: "",
        allowedTopics: [],
        disallowedTopics: [],
        brandAssets: { logoUrl: "", colors: "", fonts: "", photosNote: "" },
      });
      return;
    }

    setStatus("error");
    const msg = data.detail
      ? `${data.error ?? "Chyba"}: ${data.detail}`
      : (data.error ?? "Odeslání se nezdařilo");
    setError({
      message: msg,
      details: data.details ?? undefined,
    });
  }

  async function handlePipelineSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setError(null);
    setPipelineResult(null);
    if (logoFile) {
      const logoErr = validateLogoFile(logoFile);
      if (logoErr) {
        setStatus("error");
        setError({ message: logoErr });
        return;
      }
    }
    const payload = {
      ...form,
      website: form.website?.trim() || undefined,
      forbiddenWords: form.forbiddenWords?.trim() || undefined,
      ctaPreference: form.ctaPreference?.trim() || undefined,
      brandCoreOneLiner: form.brandCoreOneLiner?.trim() || undefined,
      allowedTopics: form.allowedTopics?.length ? form.allowedTopics : undefined,
      disallowedTopics: form.disallowedTopics?.length ? form.disallowedTopics : undefined,
      brandAssets: form.brandAssets
        ? {
            logoUrl: form.brandAssets.logoUrl?.trim() || undefined,
            colors: form.brandAssets.colors?.trim() || undefined,
            fonts: form.brandAssets.fonts?.trim() || undefined,
            photosNote: form.brandAssets.photosNote?.trim() || undefined,
          }
        : undefined,
      client_email: clientEmailForPipeline.trim() || undefined,
    };
    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    if (logoFile) formData.append("logo", logoFile);
    photoFiles.forEach((f) => formData.append("photos", f));
    if (brandPdfFile) formData.append("brandPdf", brandPdfFile);
    setPipelineSubmitting(true);
    try {
      const res = await fetch("/api/intake/pipeline", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setPipelineResult({
          projectCode: data.projectCode ?? "",
          pin: data.pin ?? null,
          projectId: data.projectId ?? "",
          loginUrl: data.loginUrl,
        });
        setStatus("success");
        setLogoFile(null);
        if (logoInputRef.current) logoInputRef.current.value = "";
        setPhotoFiles([]);
        if (photoInputRef.current) photoInputRef.current.value = "";
        setBrandPdfFile(null);
        if (brandPdfInputRef.current) brandPdfInputRef.current.value = "";
        return;
      }
      setStatus("error");
      const msg = data.detail ? `${data.error ?? "Chyba"}: ${data.detail}` : (data.error ?? "Vytvoření projektu se nezdařilo");
      setError({ message: msg, details: data.details });
    } finally {
      setPipelineSubmitting(false);
    }
  }

  async function handleEnrich(e: React.FormEvent) {
    e.preventDefault();
    const website = enrichWebsite.trim();
    if (!website) {
      setEnrichError("Zadejte URL webu.");
      return;
    }
    setEnrichError(null);
    setEnrichMeta(null);
    setEnrichLoading(true);

    try {
      const formData = new FormData();
      formData.append("website", website);
      if (enrichPdfFile) {
        formData.append("brandManualPdf", enrichPdfFile);
      }
      const res = await fetch("/api/intake/enrich", {
        method: "POST",
        body: formData,
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detail = typeof json.detail === "string" ? json.detail : null;
        const msg = json.error ?? "Načtení dat se nezdařilo.";
        setEnrichError(detail ? `${msg}: ${detail}` : msg);
        return;
      }
      if (!json.ok) {
        setEnrichError("Neplatná odpověď ze serveru.");
        return;
      }

      const apiResponse = json as EnrichApiResponse;
      if (apiResponse.prefill) {
        setForm({
          brandName: apiResponse.prefill.brandName ?? "",
          website: apiResponse.prefill.website ?? "",
          industry: apiResponse.prefill.industry ?? "",
          targetAudience: apiResponse.prefill.targetAudience ?? "",
          offers: apiResponse.prefill.offers ?? "",
          toneOfVoice: apiResponse.prefill.toneOfVoice ?? "",
          forbiddenWords: apiResponse.prefill.forbiddenWords ?? "",
          contentGoal: apiResponse.prefill.contentGoal ?? "edukace",
          platforms: apiResponse.prefill.platforms ?? [],
          stylePreference: apiResponse.prefill.stylePreference ?? "edukace",
          ctaPreference: apiResponse.prefill.ctaPreference ?? "",
          strategyMode: apiResponse.prefill.strategyMode ?? "auto",
          strategyId: apiResponse.prefill.strategyId,
          awarenessLevel: (AWARENESS_LEVELS as readonly string[]).includes(String(apiResponse.prefill.awarenessLevel ?? ""))
            ? (apiResponse.prefill.awarenessLevel as AwarenessLevel)
            : "problem_aware",
          brandCoreOneLiner: typeof apiResponse.brandCoreOneLiner === "string" ? apiResponse.brandCoreOneLiner : "",
          allowedTopics: Array.isArray(apiResponse.allowedTopics) ? apiResponse.allowedTopics : [],
          disallowedTopics: Array.isArray(apiResponse.disallowedTopics) ? apiResponse.disallowedTopics : [],
          brandAssets: {
            logoUrl: apiResponse.prefill.brandAssets?.logoUrl ?? "",
            colors: apiResponse.prefill.brandAssets?.colors ?? "",
            fonts: apiResponse.prefill.brandAssets?.fonts ?? "",
            photosNote: apiResponse.prefill.brandAssets?.photosNote ?? "",
          },
        });
        setEnrichSuggestions(apiResponse.suggestions ?? null);
      }
      setEnrichMeta({
        missingFields: Array.isArray(apiResponse.missingFields) ? apiResponse.missingFields : [],
        confidence: typeof apiResponse.confidence === "number" ? apiResponse.confidence : 0,
        lowConfidence: (apiResponse.confidence ?? 0) < 0.75,
        warnings: apiResponse.diagnostics?.warnings ?? [],
      });
      setEnrichWebsite("");
      setEnrichPdfFile(null);
      if (enrichPdfRef.current) enrichPdfRef.current.value = "";
    } catch {
      setEnrichError("Došlo k chybě při načítání.");
    } finally {
      setEnrichLoading(false);
    }
  }

  const fieldError = (name: keyof IntakeFormData) =>
    error?.details?.[name]?.[0];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Intake formulář</h1>
      <p className="mt-1 text-slate-600">
        Vyplňte údaje o značce a cílech obsahu.
      </p>

      {status === "success" && !pipelineResult && (
        <div
          className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
          role="alert"
        >
          <p>Formulář byl úspěšně odeslán. Data jsou uložena.</p>
          <a
            href={lastSubmittedIntakeId ? `/drafts?intakeId=${encodeURIComponent(lastSubmittedIntakeId)}` : "/drafts"}
            className="mt-2 inline-block font-medium underline hover:no-underline"
          >
            Přejít na návrhy postů
          </a>
        </div>
      )}

      {status === "success" && pipelineResult && (
        <div
          className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
          role="alert"
        >
          <p className="font-medium">Projekt byl vytvořen.</p>
          <p className="mt-2 font-mono text-sm">
            Kód: {pipelineResult.projectCode}
            {pipelineResult.pin && <> · PIN: {pipelineResult.pin}</>}
          </p>
          <p className="mt-1 text-sm">Uložte si kód a PIN pro přístup k projektu.</p>
          {pipelineResult.loginUrl && (
            <a
              href={pipelineResult.loginUrl}
              className="mt-2 inline-block font-medium underline hover:no-underline"
            >
              Přihlásit se k projektu
            </a>
          )}
          <a href="/admin/projects" className="ml-4 mt-2 inline-block text-sm underline hover:no-underline">
            Admin: přehled projektů
          </a>
        </div>
      )}

      {status === "error" && (
        <div
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
          role="alert"
        >
          <p className="font-medium">{error?.message}</p>
          {error?.details && (
            <ul className="mt-2 list-inside list-disc text-sm">
              {Object.entries(error.details).map(([key, msgs]) =>
                (msgs as string[]).map((msg, i) => (
                  <li key={`${key}-${i}`}>
                    {key}: {msg}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}

      <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50/50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">
          Auto-vyplnit z webu / PDF
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Zadejte URL webu a volitelně nahrajte brand manual (PDF). Formulář se níže předvyplní podle rozpoznaných údajů.
        </p>
        <form onSubmit={handleEnrich} className="mt-4 flex flex-wrap items-end gap-4">
          <div className="min-w-[200px] flex-1">
            <label htmlFor="enrichWebsite" className="block text-sm font-medium text-slate-700">
              URL webu *
            </label>
            <input
              id="enrichWebsite"
              type="url"
              required
              placeholder="https://…"
              value={enrichWebsite}
              onChange={(e) => {
                setEnrichWebsite(e.target.value);
                setEnrichError(null);
              }}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div className="min-w-[180px]">
            <label htmlFor="enrichPdf" className="block text-sm font-medium text-slate-700">
              Brand manual (PDF, volitelné)
            </label>
            <input
              ref={enrichPdfRef}
              id="enrichPdf"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                setEnrichPdfFile(e.target.files?.[0] ?? null);
                setEnrichError(null);
              }}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm text-slate-700 file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-slate-700"
            />
          </div>
          <button
            type="submit"
            disabled={enrichLoading}
            className="rounded-md bg-amber-600 px-4 py-2.5 font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {enrichLoading ? "Načítám…" : "Načíst automaticky"}
          </button>
        </form>
        {enrichError && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {enrichError}
          </p>
        )}
        {enrichMeta && (
          <div className="mt-3 rounded border border-amber-200 bg-white p-3 text-sm text-slate-700">
            <p>
              <strong>Důvěra:</strong> {Math.round(enrichMeta.confidence * 100)} %
              {enrichMeta.missingFields.length > 0 && (
                <>
                  {" · "}
                  <strong>Chybějící pole:</strong> {enrichMeta.missingFields.join(", ")}
                </>
              )}
              {enrichMeta.lowConfidence && (
                <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">
                  Nízká důvěra – zkontrolujte předvyplněné údaje před odesláním.
                </span>
              )}
            </p>
            {enrichMeta.warnings?.length ? (
              <p className="mt-1 text-amber-700">
                {enrichMeta.warnings.join(" ")}
              </p>
            ) : null}
            <p className="mt-1 text-slate-500">
              Formulář níže byl předvyplněn. Potvrďte hlavní nabídku a témata v sekci níže, poté odešlete.
            </p>
          </div>
        )}
      </section>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Základní údaje</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="brandName" className="block text-sm font-medium text-slate-700">
                Název značky *
              </label>
              <input
                id="brandName"
                type="text"
                required
                value={form.brandName}
                onChange={(e) => update({ brandName: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              {fieldError("brandName") && (
                <p className="mt-1 text-sm text-red-600">{fieldError("brandName")}</p>
              )}
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-slate-700">
                Web (URL)
              </label>
              <input
                id="website"
                type="url"
                placeholder="https://…"
                value={form.website}
                onChange={(e) => update({ website: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              {fieldError("website") && (
                <p className="mt-1 text-sm text-red-600">{fieldError("website")}</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="industry" className="block text-sm font-medium text-slate-700">
              Odvětví *
            </label>
            <input
              id="industry"
              type="text"
              required
              value={form.industry}
              onChange={(e) => update({ industry: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
            {fieldError("industry") && (
              <p className="mt-1 text-sm text-red-600">{fieldError("industry")}</p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Cílová skupina a nabídky</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium text-slate-700">
                Cílová skupina *
              </label>
              <textarea
                id="targetAudience"
                required
                rows={3}
                value={form.targetAudience}
                onChange={(e) => update({ targetAudience: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              <SuggestionChips
                items={enrichSuggestions?.targetAudience ?? []}
                onSelect={(s) => update({ targetAudience: s })}
              />
              {fieldError("targetAudience") && (
                <p className="mt-1 text-sm text-red-600">{fieldError("targetAudience")}</p>
              )}
            </div>
            <div>
              <label htmlFor="offers" className="block text-sm font-medium text-slate-700">
                Nabídky / produkty *
              </label>
              <textarea
                id="offers"
                required
                rows={3}
                value={form.offers}
                onChange={(e) => update({ offers: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              <SuggestionChips
                items={enrichSuggestions?.offers ?? []}
                onSelect={(s) => update({ offers: s })}
              />
              {fieldError("offers") && (
                <p className="mt-1 text-sm text-red-600">{fieldError("offers")}</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Styl a cíle</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="toneOfVoice" className="block text-sm font-medium text-slate-700">
                Tón hlasu *
              </label>
              <input
                id="toneOfVoice"
                type="text"
                required
                value={form.toneOfVoice}
                onChange={(e) => update({ toneOfVoice: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              <SuggestionChips
                items={enrichSuggestions?.toneOfVoice ?? []}
                onSelect={(s) => update({ toneOfVoice: s })}
              />
              {fieldError("toneOfVoice") && (
                <p className="mt-1 text-sm text-red-600">{fieldError("toneOfVoice")}</p>
              )}
            </div>
            <div>
              <label htmlFor="forbiddenWords" className="block text-sm font-medium text-slate-700">
                Zakázaná slova (volitelné)
              </label>
              <textarea
                id="forbiddenWords"
                rows={2}
                value={form.forbiddenWords}
                onChange={(e) => update({ forbiddenWords: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              <SuggestionChips
                items={enrichSuggestions?.forbiddenWords ?? []}
                onSelect={(s) => update({ forbiddenWords: s })}
              />
            </div>
            <div>
              <span className="block text-sm font-medium text-slate-700">
                Cíl obsahu *
              </span>
              <div className="mt-2 flex flex-wrap gap-3">
                {CONTENT_GOAL_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="contentGoal"
                      value={opt}
                      checked={form.contentGoal === opt}
                      onChange={() => update({ contentGoal: opt })}
                      className="rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                    />
                    <span className="text-slate-700">{opt}</span>
                  </label>
                ))}
              </div>
              {fieldError("contentGoal") && (
                <p className="mt-1 text-sm text-red-600">{fieldError("contentGoal")}</p>
              )}
            </div>
            <div>
              <span className="block text-sm font-medium text-slate-700">
                Platformy *
              </span>
              <div className="mt-2 flex flex-wrap gap-3">
                {PLATFORM_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.platforms.includes(opt)}
                      onChange={() => togglePlatform(opt)}
                      className="rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                    />
                    <span className="text-slate-700">{opt}</span>
                  </label>
                ))}
              </div>
              {fieldError("platforms") && (
                <p className="mt-1 text-sm text-red-600">{fieldError("platforms")}</p>
              )}
            </div>
            <div>
              <span className="block text-sm font-medium text-slate-700">
                Preferovaný styl *
              </span>
              <div className="mt-2 flex flex-wrap gap-3">
                {STYLE_PREFERENCE_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="stylePreference"
                      value={opt}
                      checked={form.stylePreference === opt}
                      onChange={() => update({ stylePreference: opt })}
                      className="rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                    />
                    <span className="text-slate-700">{opt}</span>
                  </label>
                ))}
              </div>
              {fieldError("stylePreference") && (
                <p className="mt-1 text-sm text-red-600">{fieldError("stylePreference")}</p>
              )}
            </div>
            <div>
              <label htmlFor="ctaPreference" className="block text-sm font-medium text-slate-700">
                Preferovaná CTA (volitelné)
              </label>
              <input
                id="ctaPreference"
                type="text"
                value={form.ctaPreference}
                onChange={(e) => update({ ctaPreference: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              <SuggestionChips
                items={enrichSuggestions?.ctaPreference ?? []}
                onSelect={(s) => update({ ctaPreference: s })}
              />
            </div>
            <div>
              <span className="block text-sm font-medium text-slate-700">
                Režim strategie
              </span>
              <div className="mt-2 flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="strategyMode"
                    checked={form.strategyMode === "auto"}
                    onChange={() => update({ strategyMode: "auto", strategyId: undefined })}
                    className="rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                  />
                  <span className="text-slate-700">Automatický (doporučeno)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="strategyMode"
                    checked={form.strategyMode === "manual"}
                    onChange={() => update({ strategyMode: "manual" })}
                    className="rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                  />
                  <span className="text-slate-700">Ruční výběr</span>
                </label>
              </div>
              {form.strategyMode === "manual" && (
                <div className="mt-2">
                  <select
                    value={form.strategyId ?? ""}
                    onChange={(e) => update({ strategyId: e.target.value || undefined })}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    <option value="">Vyberte strategii</option>
                    {STRATEGY_PRESETS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.publicLabel}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="awarenessLevel" className="block text-sm font-medium text-slate-700">
                Úroveň povědomí publika
              </label>
              <select
                id="awarenessLevel"
                value={form.awarenessLevel ?? "problem_aware"}
                onChange={(e) => update({ awarenessLevel: e.target.value as AwarenessLevel })}
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="unaware">Nevědomé (ještě neví o problému)</option>
                <option value="problem_aware">Vědomí problému</option>
                <option value="solution_aware">Vědomí řešení</option>
                <option value="product_aware">Vědomí produktu</option>
                <option value="most_aware">Plně připravení (ready to buy)</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Potvrďte hlavní nabídku značky</h2>
          <p className="mt-1 text-sm text-slate-500">
            Hlavní nabídka a témata slouží jako zdroj pravdy pro generování obsahu. Obsah nesmí jít mimo povolená témata.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="brandCoreOneLiner" className="block text-sm font-medium text-slate-700">
                Hlavní nabídka (1 věta)
              </label>
              <input
                id="brandCoreOneLiner"
                type="text"
                placeholder="Např. Poskytujeme web development a email automaci pro B2B firmy."
                value={form.brandCoreOneLiner ?? ""}
                onChange={(e) => update({ brandCoreOneLiner: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Povolená témata</label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {(form.allowedTopics ?? []).map((t, i) => (
                  <span
                    key={`a-${i}`}
                    className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          allowedTopics: (form.allowedTopics ?? []).filter((_, j) => j !== i),
                        })
                      }
                      className="ml-1.5 inline-flex rounded-full p-0.5 hover:bg-green-200"
                      aria-label="Odstranit"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Přidat téma (Enter)"
                  className="min-w-[120px] rounded border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        update({ allowedTopics: [...(form.allowedTopics ?? []), val] });
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Zakázaná témata</label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {(form.disallowedTopics ?? []).map((t, i) => (
                  <span
                    key={`d-${i}`}
                    className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          disallowedTopics: (form.disallowedTopics ?? []).filter((_, j) => j !== i),
                        })
                      }
                      className="ml-1.5 inline-flex rounded-full p-0.5 hover:bg-red-200"
                      aria-label="Odstranit"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Přidat zakázané téma (Enter)"
                  className="min-w-[120px] rounded border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        update({ disallowedTopics: [...(form.disallowedTopics ?? []), val] });
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Brand assets</h2>
          <p className="mt-1 text-sm text-slate-500">
            Logo (URL nebo PNG upload), barvy, fonty a fotky.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="logoUrl" className="block text-sm font-medium text-slate-700">
                Logo URL (navržené nebo vlastní)
              </label>
              <input
                id="logoUrl"
                type="url"
                placeholder="https://…"
                value={form.brandAssets?.logoUrl ?? ""}
                onChange={(e) =>
                  update({
                    brandAssets: { ...form.brandAssets, logoUrl: e.target.value },
                  })
                }
                className="mt-1 w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label htmlFor="logoFile" className="block text-sm font-medium text-slate-700">
                Logo (PNG, max 5 MB) – nebo nahrajte soubor
              </label>
              <div className="mt-1 flex items-center gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 text-xs">
                  {logoFile ? logoFile.name : "Logo"}
                </div>
                <input
                  ref={logoInputRef}
                  id="logoFile"
                  type="file"
                  accept=".png,image/png"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setLogoFile(f ?? null);
                    setStatus("idle");
                    setError(null);
                  }}
                  className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-slate-700"
                />
              </div>
              {logoFile && (
                <p className="mt-1 text-xs text-slate-500">
                  {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
            <div>
              <label htmlFor="colors" className="block text-sm font-medium text-slate-700">
                Barvy (hex nebo popis)
              </label>
              <input
                id="colors"
                type="text"
                placeholder="např. #1a1a2e, #16213e"
                value={form.brandAssets?.colors ?? ""}
                onChange={(e) =>
                  update({
                    brandAssets: { ...form.brandAssets, colors: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label htmlFor="fonts" className="block text-sm font-medium text-slate-700">
                Fonty
              </label>
              <input
                id="fonts"
                type="text"
                placeholder="např. Inter, Roboto"
                value={form.brandAssets?.fonts ?? ""}
                onChange={(e) =>
                  update({
                    brandAssets: { ...form.brandAssets, fonts: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label htmlFor="photosNote" className="block text-sm font-medium text-slate-700">
                Fotky / obrázky (popis nebo odkaz)
              </label>
              <div className="mt-1 flex items-center gap-3">
                <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 text-xs text-center">
                  Upload
                </div>
                <input
                  id="photosNote"
                  type="text"
                  placeholder="Odkaz na složku nebo popis"
                  value={form.brandAssets?.photosNote ?? ""}
                  onChange={(e) =>
                    update({
                      brandAssets: { ...form.brandAssets, photosNote: e.target.value },
                    })
                  }
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-700">Vytvořit projekt (pipeline)</p>
              <p className="mt-1 text-xs text-slate-500">
                E-mail (volitelné), fotky a PDF se uloží do složky projektu a budou vidět v adminu.
              </p>
              <div className="mt-3 space-y-3">
                <div>
                  <label htmlFor="clientEmailPipeline" className="block text-xs font-medium text-slate-600">
                    E-mail klienta (volitelné – pro magický odkaz)
                  </label>
                  <input
                    id="clientEmailPipeline"
                    type="email"
                    placeholder="klient@example.com"
                    value={clientEmailForPipeline}
                    onChange={(e) => setClientEmailForPipeline(e.target.value)}
                    className="mt-1 w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="photoFiles" className="block text-xs font-medium text-slate-600">
                    Fotky (JPEG/PNG/WebP, max 20 souborů)
                  </label>
                  <input
                    ref={photoInputRef}
                    id="photoFiles"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => setPhotoFiles(Array.from(e.target.files ?? []))}
                    className="mt-1 w-full max-w-md rounded-md border border-slate-300 px-2 py-2 text-sm text-slate-700 file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-slate-700"
                  />
                  {photoFiles.length > 0 && (
                    <p className="mt-1 text-xs text-slate-500">{photoFiles.length} soubor(ů) vybráno</p>
                  )}
                </div>
                <div>
                  <label htmlFor="brandPdfPipeline" className="block text-xs font-medium text-slate-600">
                    Brand manuál (PDF, volitelné)
                  </label>
                  <input
                    ref={brandPdfInputRef}
                    id="brandPdfPipeline"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setBrandPdfFile(e.target.files?.[0] ?? null)}
                    className="mt-1 w-full max-w-md rounded-md border border-slate-300 px-2 py-2 text-sm text-slate-700 file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-slate-700"
                  />
                  {brandPdfFile && <p className="mt-1 text-xs text-slate-500">{brandPdfFile.name}</p>}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-md bg-slate-800 px-5 py-2.5 font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Odeslat (pouze intake)
          </button>
          <button
            type="button"
            disabled={pipelineSubmitting}
            onClick={handlePipelineSubmit}
            className="rounded-md bg-lucifera-lime px-5 py-2.5 font-medium text-zinc-900 hover:bg-lucifera-lime/90 focus:outline-none focus:ring-2 focus:ring-lucifera-lime focus:ring-offset-2 disabled:opacity-60"
          >
            {pipelineSubmitting ? "Vytvářím projekt…" : "Odeslat a vytvořit projekt (včetně souborů)"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setError(null);
            }}
            className="rounded-md border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            Zrušit chybu
          </button>
        </div>
      </form>
    </div>
  );
}

export default function IntakePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Načítám…</div>}>
      <IntakeContent />
    </Suspense>
  );
}
