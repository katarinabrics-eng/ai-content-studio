"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

const INTERVALS = [
  { value: "weekly", label: "Každý týden" },
  { value: "biweekly", label: "Ob týden" },
  { value: "triweekly", label: "Ob 3 týdny" },
  { value: "monthly", label: "Měsíčně" },
] as const;

const MAX_TOPICS = 5;

function OnboardingInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectCode = params.projectCode as string;
  const token = searchParams.get("token") ?? "";

  const [step, setStep] = useState(1);

  // Step 1
  const [webUrl, setWebUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlDone, setUrlDone] = useState(false);

  // Step 2
  const [interval, setInterval] = useState<string>("");

  // Step 3
  const [topicInput, setTopicInput] = useState("");
  const [topics, setTopics] = useState<string[]>([]);

  // Final
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Step 1: analyze URL ───────────────────────────────────────────────────

  function handleAnalyze() {
    if (!webUrl.trim()) return;
    setUrlLoading(true);
    // Simulujeme analýzu (skutečná implementace by volala API)
    setTimeout(() => {
      setUrlLoading(false);
      setUrlDone(true);
    }, 1200);
  }

  // ── Step 3: topic management ──────────────────────────────────────────────

  function addTopic() {
    const t = topicInput.trim();
    if (!t || topics.includes(t) || topics.length >= MAX_TOPICS) return;
    setTopics((prev) => [...prev, t]);
    setTopicInput("");
  }

  function removeTopic(topic: string) {
    setTopics((prev) => prev.filter((t) => t !== topic));
  }

  // ── Complete onboarding ───────────────────────────────────────────────────

  async function handleComplete() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(
        `/api/client/rtg/onboarding/complete?token=${encodeURIComponent(token)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ web_url: webUrl || null, interval, topics }),
        }
      );
      const data = await res.json();
      if (!data.ok) {
        setSaveError(data.error ?? "Nepodařilo se uložit.");
        return;
      }
      router.push(`/client/${projectCode}/rtg?token=${encodeURIComponent(token)}`);
    } catch {
      setSaveError("Chyba připojení. Zkuste to znovu.");
    } finally {
      setSaving(false);
    }
  }

  // ── Step indicator ────────────────────────────────────────────────────────

  const steps = ["Web / Instagram", "Interval", "Témata"];

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#b0aea8] mb-2">
          Nastavení
        </p>
        <h1 className="text-2xl font-semibold text-[#1a1a1a]">Vítejte v Ready to Go</h1>
        <p className="text-sm text-[#888] mt-1">
          Pár rychlých kroků a jste připraveni na první obsah.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={n} className="flex items-center gap-2">
              <div
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                  done
                    ? "bg-[#d0ec78] text-[#1a1a1a]"
                    : active
                    ? "bg-[#1a1a1a] text-white"
                    : "bg-[#e8e8e4] text-[#b0aea8]",
                ].join(" ")}
              >
                {done ? "✓" : n}
              </div>
              <span
                className={[
                  "text-xs hidden sm:block",
                  active ? "text-[#1a1a1a] font-medium" : "text-[#b0aea8]",
                ].join(" ")}
              >
                {label}
              </span>
              {i < steps.length - 1 && (
                <div className="w-8 h-px bg-[#e8e8e4] mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step 1 ── */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium text-[#1a1a1a]">
            URL vašeho webu nebo Instagramu
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={webUrl}
              onChange={(e) => { setWebUrl(e.target.value); setUrlDone(false); }}
              placeholder="https://vaseweb.cz nebo @instagram"
              className="flex-1 text-sm border border-[#e8e8e4] rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#d0ec78] bg-white text-[#1a1a1a] placeholder:text-[#b0aea8]"
            />
            <button
              onClick={handleAnalyze}
              disabled={!webUrl.trim() || urlLoading}
              className="shrink-0 px-4 py-3 rounded-lg bg-[#1a1a1a] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
            >
              {urlLoading ? "…" : "Analyzovat"}
            </button>
          </div>
          {urlDone && (
            <div className="flex items-center gap-2 text-sm text-[#3d6b00] bg-[#f0fce0] border border-[#d4f0a0] rounded-lg px-3 py-2">
              <span>✓</span>
              <span>Web přidán. Použijeme ho pro tvorbu obsahu.</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setStep(2)}
              className="text-sm text-[#888] underline"
            >
              Přeskočit
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!webUrl.trim() && !urlDone}
              className="px-6 py-2.5 rounded-lg bg-[#1a1a1a] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
            >
              Dále →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium text-[#1a1a1a]">
            Jak často chcete dostávat nový obsah?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {INTERVALS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setInterval(opt.value)}
                className={[
                  "py-4 px-4 rounded-xl border-2 text-sm font-medium text-left transition-all",
                  interval === opt.value
                    ? "border-[#d0ec78] bg-[#f3fbdc] text-[#1a1a1a]"
                    : "border-[#e8e8e4] bg-white text-[#555] hover:border-[#c8c8c0]",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center pt-2">
            <button onClick={() => setStep(1)} className="text-sm text-[#888] underline">
              ← Zpět
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!interval}
              className="px-6 py-2.5 rounded-lg bg-[#1a1a1a] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
            >
              Dále →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3 ── */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-[#1a1a1a]">
              O čem chcete tvořit obsah?
            </label>
            <p className="text-xs text-[#b0aea8] mt-0.5">
              Přidejte až {MAX_TOPICS} témat (např. &quot;podnikání&quot;, &quot;móda&quot;, &quot;tipy pro klienty&quot;).
            </p>
          </div>

          {/* Topic input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTopic(); } }}
              placeholder="Zadejte téma a stiskněte Enter…"
              disabled={topics.length >= MAX_TOPICS}
              className="flex-1 text-sm border border-[#e8e8e4] rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#d0ec78] bg-white text-[#1a1a1a] placeholder:text-[#b0aea8] disabled:opacity-50"
            />
            <button
              onClick={addTopic}
              disabled={!topicInput.trim() || topics.length >= MAX_TOPICS}
              className="shrink-0 px-4 py-3 rounded-lg bg-[#1a1a1a] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
            >
              Přidat
            </button>
          </div>

          {/* Topic tags */}
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1.5 bg-[#f3fbdc] border border-[#d0ec78] text-[#1a1a1a] text-sm px-3 py-1.5 rounded-full"
                >
                  {topic}
                  <button
                    onClick={() => removeTopic(topic)}
                    className="text-[#888] hover:text-[#1a1a1a] leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {saveError && (
            <p className="text-sm text-red-500">{saveError}</p>
          )}

          <div className="flex justify-between items-center pt-2">
            <button onClick={() => setStep(2)} className="text-sm text-[#888] underline">
              ← Zpět
            </button>
            <button
              onClick={handleComplete}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-[#d0ec78] text-[#1a1a1a] text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b5d45c] transition-colors"
            >
              {saving ? "Ukládám…" : "Dokončit nastavení →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-[#e8e8e4] border-t-[#d0ec78] rounded-full animate-spin" />
        </div>
      }
    >
      <OnboardingInner />
    </Suspense>
  );
}
