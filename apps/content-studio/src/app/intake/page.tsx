"use client";

import { useState } from "react";
import {
  CONTENT_GOAL_OPTIONS,
  PLATFORM_OPTIONS,
  STYLE_PREFERENCE_OPTIONS,
  type IntakeFormData,
} from "@/lib/intake-schema";

type SubmitStatus = "idle" | "success" | "error";
type SubmitError = { message?: string; details?: Record<string, string[]> };

export default function IntakePage() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState<SubmitError | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setError(null);

    const payload = {
      ...form,
      website: form.website?.trim() || undefined,
      forbiddenWords: form.forbiddenWords?.trim() || undefined,
      ctaPreference: form.ctaPreference?.trim() || undefined,
      brandAssets: form.brandAssets
        ? {
            logoUrl: form.brandAssets.logoUrl?.trim() || undefined,
            colors: form.brandAssets.colors?.trim() || undefined,
            fonts: form.brandAssets.fonts?.trim() || undefined,
            photosNote: form.brandAssets.photosNote?.trim() || undefined,
          }
        : undefined,
    };

    const res = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.ok) {
      setStatus("success");
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
        brandAssets: { logoUrl: "", colors: "", fonts: "", photosNote: "" },
      });
      return;
    }

    setStatus("error");
    setError({
      message: data.error ?? "Odeslání se nezdařilo",
      details: data.details ?? undefined,
    });
  }

  const fieldError = (name: keyof IntakeFormData) =>
    error?.details?.[name]?.[0];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Intake formulář</h1>
      <p className="mt-1 text-slate-600">
        Vyplňte údaje o značce a cílech obsahu.
      </p>

      {status === "success" && (
        <div
          className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
          role="alert"
        >
          Formulář byl úspěšně odeslán. Data jsou uložena.
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
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Brand assets</h2>
          <p className="mt-1 text-sm text-slate-500">
            Logo, barvy, fonty a fotky (placeholder – upload bude doplněn).
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="logoUrl" className="block text-sm font-medium text-slate-700">
                Logo (URL nebo popis)
              </label>
              <div className="mt-1 flex items-center gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 text-xs">
                  Logo
                </div>
                <input
                  id="logoUrl"
                  type="text"
                  placeholder="URL nebo název souboru"
                  value={form.brandAssets?.logoUrl ?? ""}
                  onChange={(e) =>
                    update({
                      brandAssets: {
                        ...form.brandAssets,
                        logoUrl: e.target.value,
                      },
                    })
                  }
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
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
          </div>
        </section>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-slate-800 px-5 py-2.5 font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Odeslat
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
