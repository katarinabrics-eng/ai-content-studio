"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

const INTERVALS: { label: string; value: 7 | 14 | 21 | 30 }[] = [
  { label: "Každý týden", value: 7 },
  { label: "Ob týden", value: 14 },
  { label: "Ob 3 týdny", value: 21 },
  { label: "Měsíčně", value: 30 },
];

const MAX_TOPICS = 5;

function OnboardingInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = params.projectCode as string;
  const token = searchParams.get("token") ?? "";

  const [step, setStep] = useState(1);

  // Krok 1 — URL
  const [webUrl, setWebUrl] = useState("");

  // Krok 2 — Interval
  const [intervalDays, setIntervalDays] = useState<7 | 14 | 21 | 30 | null>(null);

  // Krok 3 — Témata
  const [topicInput, setTopicInput] = useState("");
  const [topics, setTopics] = useState<string[]>([]);

  // Odesílání
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Témata ───────────────────────────────────────────────────────────────

  function addTopic() {
    const t = topicInput.trim();
    if (!t || topics.includes(t) || topics.length >= MAX_TOPICS) return;
    setTopics((prev) => [...prev, t]);
    setTopicInput("");
  }

  function removeTopic(topic: string) {
    setTopics((prev) => prev.filter((t) => t !== topic));
  }

  // ── Dokončení onboardingu ─────────────────────────────────────────────────

  async function handleComplete() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/client/rtg/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          token,
          web_url: webUrl || null,
          interval_days: intervalDays,
          topics,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setSaveError(data.error ?? "Nepodařilo se uložit.");
        return;
      }
      router.push(`/client/${code}/rtg?token=${encodeURIComponent(token)}`);
    } catch {
      setSaveError("Chyba připojení. Zkuste to znovu.");
    } finally {
      setSaving(false);
    }
  }

  // ── Progress dots ─────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen bg-white flex flex-col items-center pt-20 px-6"
      style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
    >
      <div className="w-full max-w-lg">

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-full transition-all duration-200"
              style={{
                width: 10,
                height: 10,
                background: step === n ? "#d0ec78" : "#e8e8e4",
              }}
            />
          ))}
        </div>

        {/* ── Krok 1 — URL ─────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-[#111] mb-1">
                Kde tě najdeme online?
              </h1>
              <p className="text-sm text-[#666]">
                Zadej URL svého webu nebo Instagramu — stačí jeden.
              </p>
            </div>

            <input
              type="url"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              placeholder="https://vas-web.cz nebo instagram.com/vas-profil"
              className="w-full text-sm border border-[#e8e8e4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#d0ec78] bg-white text-[#111] placeholder:text-[#b0aea8]"
            />

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-lg bg-[#111] text-white text-sm font-medium hover:bg-[#333] transition-colors"
            >
              Pokračovat →
            </button>

            <button
              onClick={() => setStep(2)}
              className="text-sm text-[#b0aea8] underline text-center"
            >
              Přeskočit
            </button>
          </div>
        )}

        {/* ── Krok 2 — Interval ────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-[#111] mb-1">
                Jak často chceš nový obsah?
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {INTERVALS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setIntervalDays(opt.value)}
                  className={[
                    "py-4 px-4 rounded-xl text-sm font-medium text-left transition-all",
                    intervalDays === opt.value
                      ? "border-2 border-[#d0ec78] bg-[#f3fbdc] text-[#111]"
                      : "border border-[#e8e8e4] bg-white text-[#555] hover:border-[#c8c8c0]",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!intervalDays}
              className="w-full py-3 rounded-lg bg-[#111] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
            >
              Pokračovat →
            </button>

            <button
              onClick={() => setStep(1)}
              className="text-sm text-[#b0aea8] underline text-center"
            >
              ← Zpět
            </button>
          </div>
        )}

        {/* ── Krok 3 — Témata ──────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-[#111] mb-1">
                O čem nejčastěji tvoříš obsah?
              </h1>
              <p className="text-sm text-[#666]">
                Přidej až 5 témat — stiskni Enter pro přidání.
              </p>
            </div>

            {/* Tag input */}
            {topics.length < MAX_TOPICS && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTopic();
                    }
                  }}
                  placeholder="Zadej téma a stiskni Enter…"
                  className="flex-1 text-sm border border-[#e8e8e4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#d0ec78] bg-white text-[#111] placeholder:text-[#b0aea8]"
                />
                <button
                  onClick={addTopic}
                  disabled={!topicInput.trim()}
                  className="shrink-0 px-4 py-3 rounded-lg bg-[#111] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
                >
                  +
                </button>
              </div>
            )}

            {/* Tag pills */}
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1.5 bg-[#f3fbdc] border border-[#d0ec78] text-[#111] text-sm px-3 py-1.5 rounded-full"
                  >
                    {topic}
                    <button
                      onClick={() => removeTopic(topic)}
                      className="text-[#888] hover:text-[#111] leading-none"
                      aria-label={`Odebrat ${topic}`}
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

            <button
              onClick={handleComplete}
              disabled={saving}
              className="w-full py-3 rounded-lg bg-[#111] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
            >
              {saving ? "Ukládám…" : "Dokončit nastavení →"}
            </button>

            <button
              onClick={() => setStep(2)}
              className="text-sm text-[#b0aea8] underline text-center"
            >
              ← Zpět
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-6 h-6 border-2 border-[#e8e8e4] border-t-[#d0ec78] rounded-full animate-spin" />
        </div>
      }
    >
      <OnboardingInner />
    </Suspense>
  );
}
