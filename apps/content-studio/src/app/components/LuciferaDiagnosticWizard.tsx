"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STEPS = [
  { id: 1, title: "Web + sociální sítě", key: "web_social" },
  { id: 2, title: "Ambice značky", key: "ambice" },
  { id: 3, title: "Vizuální sebereflexe", key: "vizualni_sebereflexe" },
  { id: 4, title: "Výběr vizuální energie", key: "vizuální_energie" },
] as const;

export function LuciferaDiagnosticWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({
    web_social: "",
    ambice: "",
    vizualni_sebereflexe: "",
    vizuální_energie: "",
    email: "",
    name: "",
  });

  const next = () => {
    if (step < 4) setStep((s) => s + 1);
  };
  const prev = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleComplete = async () => {
    setError("");
    const email = answers.email?.trim();
    if (!email) {
      setError("Pro uložení a výběr termínu zadejte e-mail.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/lucifera-diagnostic/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: answers.name?.trim() || undefined,
          intake_data: {
            web_social: answers.web_social,
            ambice: answers.ambice,
            vizualni_sebereflexe: answers.vizualni_sebereflexe,
            vizuální_energie: answers.vizuální_energie,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chyba ukládání");
      router.push("/lucifera-diagnostic/book");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nepodařilo se uložit.");
    } finally {
      setSaving(false);
    }
  };

  const currentKey = STEPS[step - 1].key;
  const value = answers[currentKey] ?? "";

  return (
    <div className="rounded-2xl border border-[#EAEAE7] bg-white p-8 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-[#6F6F6F]">
        Krok {step} / 4
      </p>
      <h2 className="mt-2 text-xl font-semibold text-[#1A1A1A]">
        {STEPS[step - 1].title}
      </h2>

      <div className="mt-6">
        {step === 1 && (
          <p className="mb-4 text-sm text-[#6F6F6F]">
            Kde vás můžeme najít online? Web, Instagram, LinkedIn…
          </p>
        )}
        {step === 2 && (
          <p className="mb-4 text-sm text-[#6F6F6F]">
            Kam chcete značku posunout? Jaké máte ambice?
          </p>
        )}
        {step === 3 && (
          <p className="mb-4 text-sm text-[#6F6F6F]">
            Jak vnímáte svou současnou vizuální prezentaci?
          </p>
        )}
        {step === 4 && (
          <p className="mb-4 text-sm text-[#6F6F6F]">
            Jaká vizuální energie vám nejvíc sedí?
          </p>
        )}
        <textarea
          placeholder={`Odpověď – krok ${step}`}
          className="min-h-[120px] w-full max-w-md rounded-lg border border-[#EAEAE7] px-4 py-3 text-[#1A1A1A] placeholder:text-[#9ca3af] focus:border-[#B7E300] focus:outline-none focus:ring-1 focus:ring-[#B7E300]"
          value={value}
          onChange={(e) =>
            setAnswers((a) => ({ ...a, [currentKey]: e.target.value }))
          }
        />
      </div>

      {step === 4 && (
        <div className="mt-6 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#6F6F6F]">
              E-mail *
            </label>
            <input
              type="email"
              required
              placeholder="vas@email.cz"
              className="w-full max-w-md rounded-lg border border-[#EAEAE7] px-4 py-2 text-[#1A1A1A] focus:border-[#B7E300] focus:outline-none focus:ring-1 focus:ring-[#B7E300]"
              value={answers.email ?? ""}
              onChange={(e) =>
                setAnswers((a) => ({ ...a, email: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#6F6F6F]">
              Jméno
            </label>
            <input
              type="text"
              placeholder="Vaše jméno"
              className="w-full max-w-md rounded-lg border border-[#EAEAE7] px-4 py-2 text-[#1A1A1A] focus:border-[#B7E300] focus:outline-none focus:ring-1 focus:ring-[#B7E300]"
              value={answers.name ?? ""}
              onChange={(e) =>
                setAnswers((a) => ({ ...a, name: e.target.value }))
              }
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={prev}
            className="rounded-xl border border-[#EAEAE7] bg-white px-5 py-2.5 text-sm font-medium text-[#1A1A1A] hover:bg-[#F7F7F5]"
          >
            Zpět
          </button>
        )}
        {step < 4 ? (
          <button
            type="button"
            onClick={next}
            className="rounded-xl bg-[#B7E300] px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:opacity-90"
          >
            Další
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            disabled={saving}
            className="rounded-xl bg-[#B7E300] px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:opacity-90 disabled:opacity-70"
          >
            {saving ? "Ukládám…" : "Dokončit a vybrat termín"}
          </button>
        )}
      </div>
      <Link
        href="/lucifera-diagnostic"
        className="mt-6 inline-block text-sm text-[#6F6F6F] hover:underline"
      >
        ← Zpět na úvod diagnostiky
      </Link>
    </div>
  );
}
