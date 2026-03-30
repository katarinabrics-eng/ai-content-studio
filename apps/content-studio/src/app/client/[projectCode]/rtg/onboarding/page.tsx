"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const AGENTS = [
  {
    id: "editorial_silence",
    name: "Editorial Silence",
    desc: "Klidný, minimalistický. Méně slov, více váhy.",
    emoji: "🤍",
  },
  {
    id: "bold_statement",
    name: "Bold Statement",
    desc: "Silné výroky, krátké věty. Čtete a zastavíte se.",
    emoji: "⚡",
  },
  {
    id: "golden_moment",
    name: "Golden Moment",
    desc: "Storytelling a osobní příběhy. Čtenář se pozná.",
    emoji: "✨",
  },
  {
    id: "the_disruptor",
    name: "The Disruptor",
    desc: "Provokativní, nekonvenční. Říká co ostatní neřeknou.",
    emoji: "🔥",
  },
  {
    id: "clean_educator",
    name: "Clean Educator",
    desc: "Edukační a strukturované. Jasné kroky, jasný výsledek.",
    emoji: "📐",
  },
];

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    desc: "Hook + 3–5 vět",
    icon: "📸",
  },
  {
    id: "facebook",
    name: "Facebook",
    desc: "Delší text, 1–3 odstavce",
    icon: "💬",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    desc: "Odborný, strukturovaný",
    icon: "💼",
  },
  {
    id: "reels",
    name: "Reels / TikTok",
    desc: "Krátký skript, akční",
    icon: "🎬",
  },
];

const TOPIC_SUGGESTIONS = [
  "Osobní rozvoj",
  "Byznys a podnikání",
  "Zdraví a wellbeing",
  "Kreativita a umění",
  "Technologie a AI",
  "Vztahy a komunikace",
  "Finance a investice",
  "Vzdělávání a kurzy",
  "Životní styl",
  "Motivace",
  "Marketing",
  "Mindset",
];

const TOTAL_STEPS = 4;

// ─── Onboarding ───────────────────────────────────────────────────────────────

function OnboardingInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = params.projectCode as string;
  const token = searchParams.get("token") ?? "";

  const [step, setStep] = useState(1);

  // Krok 1
  const [webUrl, setWebUrl] = useState("");
  // Krok 2
  const [agentId, setAgentId] = useState<string | null>(null);
  // Krok 3
  const [platforms, setPlatforms] = useState<string[]>([]);
  // Krok 4
  const [topics, setTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function togglePlatform(id: string) {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function toggleTopic(topic: string) {
    setTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : prev.length < 5
        ? [...prev, topic]
        : prev
    );
  }

  function addCustomTopic() {
    const t = customTopic.trim();
    if (!t || topics.includes(t) || topics.length >= 5) return;
    setTopics((prev) => [...prev, t]);
    setCustomTopic("");
  }

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
          agent_style: agentId,
          platforms,
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

  // ─── UI helpers ─────────────────────────────────────────────────────────────

  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div
      className="min-h-screen bg-white flex flex-col items-center pt-16 px-6 pb-20"
      style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
    >
      <div className="w-full max-w-lg">

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex justify-between text-xs text-[#b0aea8] mb-2">
            <span>Krok {step} z {TOTAL_STEPS}</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <div className="h-1 w-full bg-[#e8e8e4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#d0ec78] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* ── KROK 1 — URL ─────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#b0aea8] mb-2">
                Krok 1
              </p>
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

        {/* ── KROK 2 — STYL AGENTA ─────────────────────────────────────────── */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#b0aea8] mb-2">
                Krok 2
              </p>
              <h1 className="text-2xl font-semibold text-[#111] mb-1">
                Jaký styl ti sedí?
              </h1>
              <p className="text-sm text-[#666]">
                Vyber jeden — tímto hlasem bude váš obsah mluvit.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setAgentId(agent.id)}
                  className={[
                    "flex items-start gap-4 p-4 rounded-xl text-left transition-all",
                    agentId === agent.id
                      ? "border-2 border-[#d0ec78] bg-[#f3fbdc]"
                      : "border border-[#e8e8e4] bg-white hover:border-[#c8c8c0]",
                  ].join(" ")}
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{agent.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#111] mb-0.5">
                      {agent.name}
                    </p>
                    <p className="text-xs text-[#666] leading-relaxed">
                      {agent.desc}
                    </p>
                  </div>
                  {agentId === agent.id && (
                    <span className="ml-auto text-[#d0ec78] text-lg flex-shrink-0">✓</span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(3)}
              disabled={!agentId}
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

        {/* ── KROK 3 — PLATFORMY ───────────────────────────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#b0aea8] mb-2">
                Krok 3
              </p>
              <h1 className="text-2xl font-semibold text-[#111] mb-1">
                Kde publikuješ?
              </h1>
              <p className="text-sm text-[#666]">
                Vyber platformy — každá dostane obsah ve správném formátu a délce.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={[
                    "flex flex-col items-start gap-1.5 p-4 rounded-xl text-left transition-all",
                    platforms.includes(platform.id)
                      ? "border-2 border-[#d0ec78] bg-[#f3fbdc]"
                      : "border border-[#e8e8e4] bg-white hover:border-[#c8c8c0]",
                  ].join(" ")}
                >
                  <span className="text-xl">{platform.icon}</span>
                  <p className="text-sm font-semibold text-[#111]">
                    {platform.name}
                  </p>
                  <p className="text-xs text-[#888]">{platform.desc}</p>
                </button>
              ))}
            </div>
            {platforms.includes("facebook") && (
              <div className="bg-[#f5f3ee] border border-[#e8e4dc] rounded-xl p-4">
                <p className="text-xs text-[#666] leading-relaxed">
                  <span className="font-medium text-[#111]">Facebook:</span>{" "}
                  Texty budou delší — 1 až 3 odstavce s osobním úvodem, rozvinutou myšlenkou a výzvou k akci.
                </p>
              </div>
            )}
            <button
              onClick={() => setStep(4)}
              disabled={platforms.length === 0}
              className="w-full py-3 rounded-lg bg-[#111] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
            >
              Pokračovat →
            </button>
            <button
              onClick={() => setStep(2)}
              className="text-sm text-[#b0aea8] underline text-center"
            >
              ← Zpět
            </button>
          </div>
        )}

        {/* ── KROK 4 — TÉMATA ──────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#b0aea8] mb-2">
                Krok 4
              </p>
              <h1 className="text-2xl font-semibold text-[#111] mb-1">
                O čem tvoříš obsah?
              </h1>
              <p className="text-sm text-[#666]">
                Vyber až 5 témat nebo napiš vlastní.
              </p>
            </div>

            {/* Připravená témata */}
            <div className="flex flex-wrap gap-2">
              {TOPIC_SUGGESTIONS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={[
                    "text-sm px-4 py-2 rounded-full transition-all border",
                    topics.includes(topic)
                      ? "border-[#d0ec78] bg-[#f3fbdc] text-[#111] font-medium"
                      : topics.length >= 5
                      ? "border-[#e8e8e4] bg-white text-[#ccc] cursor-not-allowed"
                      : "border-[#e8e8e4] bg-white text-[#555] hover:border-[#c8c8c0]",
                  ].join(" ")}
                  disabled={!topics.includes(topic) && topics.length >= 5}
                >
                  {topics.includes(topic) && "✓ "}
                  {topic}
                </button>
              ))}
            </div>

            {/* Vlastní téma */}
            {topics.length < 5 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTopic();
                    }
                  }}
                  placeholder="Vlastní téma…"
                  className="flex-1 text-sm border border-[#e8e8e4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#d0ec78] bg-white text-[#111] placeholder:text-[#b0aea8]"
                />
                <button
                  onClick={addCustomTopic}
                  disabled={!customTopic.trim()}
                  className="shrink-0 px-4 py-3 rounded-lg bg-[#111] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
                >
                  +
                </button>
              </div>
            )}

            {/* Vybraná témata */}
            {topics.length > 0 && (
              <div>
                <p className="text-xs text-[#b0aea8] mb-2">
                  Vybráno: {topics.length} / 5
                </p>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center gap-1.5 bg-[#f3fbdc] border border-[#d0ec78] text-[#111] text-sm px-3 py-1.5 rounded-full"
                    >
                      {topic}
                      <button
                        onClick={() => toggleTopic(topic)}
                        className="text-[#888] hover:text-[#111] leading-none"
                        aria-label={`Odebrat ${topic}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {saveError && (
              <p className="text-sm text-red-500">{saveError}</p>
            )}

            <button
              onClick={handleComplete}
              disabled={saving || topics.length === 0}
              className="w-full py-3 rounded-lg bg-[#111] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
            >
              {saving ? "Ukládám…" : "Dokončit nastavení →"}
            </button>
            <button
              onClick={() => setStep(3)}
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
