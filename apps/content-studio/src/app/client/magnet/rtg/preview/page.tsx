"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface MagnetData {
  web_url: string;
  agent_style: string;
  platforms: string[];
  topics: string[];
}

interface GeneratedPost {
  platform: string;
  topic: string;
  hook: string;
  body: string;
  hashtags: string[];
  type: string;
  imageUrl: string;
}

const AGENT_LABELS: Record<string, string> = {
  editorial_silence: "Editorial Silence",
  bold_statement: "Bold Statement",
  golden_moment: "Golden Moment",
  the_disruptor: "The Disruptor",
  clean_educator: "Clean Educator",
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  reels: "Reels / TikTok",
};

// Kroky loadingu s přibližnými časy (v ms od startu)
const LOADING_STEPS = [
  { label: "Čtu tvůj styl a témata...", pct: 15, delay: 0 },
  { label: "Píšu hooky pro tvoje příspěvky...", pct: 40, delay: 3000 },
  { label: "Rozvíjím obsah a caption...", pct: 65, delay: 7000 },
  { label: "Vybírám vizuály ze knihovny...", pct: 85, delay: 11000 },
  { label: "Finalizuji příspěvky...", pct: 95, delay: 14000 },
];

export default function MagnetPreviewPage() {
  const router = useRouter();
  const [data, setData] = useState<MagnetData | null>(null);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState(LOADING_STEPS[0].label);
  const [done, setDone] = useState(false);
  const calledRef = useRef(false);

  // Načti data z localStorage
  useEffect(() => {
    const raw = localStorage.getItem("magnet_onboarding");
    if (raw) {
      try {
        setData(JSON.parse(raw) as MagnetData);
      } catch {
        setError("Nepodařilo se načíst nastavení. Začni znovu.");
      }
    } else {
      setError("Nastavení nenalezeno. Začni znovu.");
    }
  }, []);

  // Spusť generování jakmile máme data
  useEffect(() => {
    if (!data || calledRef.current) return;
    calledRef.current = true;
    generatePosts(data);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Animace progress baru — postupuje přes kroky
  useEffect(() => {
    if (done) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    LOADING_STEPS.forEach((step) => {
      const t = setTimeout(() => {
        setProgress(step.pct);
        setStepLabel(step.label);
      }, step.delay);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, [done]);

  async function generatePosts(magnet: MagnetData) {
    try {
      const res = await fetch("/api/magnet/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          web_url: magnet.web_url || undefined,
          agent_style: magnet.agent_style,
          platforms: magnet.platforms,
          topics: magnet.topics,
        }),
      });
      const result = await res.json() as { ok: boolean; posts?: GeneratedPost[]; error?: string };
      if (!result.ok || !result.posts) {
        setError(result.error ?? "Generování selhalo. Zkus to znovu.");
        return;
      }
      // Dokončení — 100 %
      setProgress(100);
      setStepLabel("Hotovo!");
      await new Promise((r) => setTimeout(r, 600));
      setPosts(result.posts);
      setDone(true);
    } catch {
      setError("Chyba připojení. Zkus to znovu.");
    }
  }

  // ── Error stav ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-20"
        style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
      >
        <div className="w-full max-w-md text-center flex flex-col gap-6">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-semibold text-[#111]">{error}</h1>
          <button
            onClick={() => router.push("/client/magnet/rtg/onboarding")}
            className="py-3 px-6 rounded-lg bg-[#111] text-white text-sm font-medium hover:bg-[#333] transition-colors"
          >
            ← Zpět na nastavení
          </button>
        </div>
      </div>
    );
  }

  // ── Loading stav ─────────────────────────────────────────────────────────────
  if (!done) {
    return (
      <div
        className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-20"
        style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
      >
        <div className="w-full max-w-md flex flex-col items-center gap-8 text-center">

          {/* Nadpis */}
          <div>
            <h1 className="text-2xl font-semibold text-[#111] mb-2">
              Tvořím tvůj obsah...
            </h1>
            <p className="text-sm text-[#666] leading-relaxed">
              Připravuji 3 příspěvky přesně pro tvou značku.
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full flex flex-col gap-2">
            <div className="h-2 w-full bg-[#e8e8e4] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#b7e94c] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-[#888] text-left transition-all duration-300">{stepLabel}</p>
              <p className="text-xs text-[#b0aea8] font-medium">{progress}%</p>
            </div>
          </div>

          {/* Souhrn nastavení */}
          {data && (
            <div className="w-full bg-[#f5f3ee] border border-[#e8e4dc] rounded-xl p-5 text-left flex flex-col gap-3">
              {data.web_url && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#b0aea8] mb-1">Web</p>
                  <p className="text-sm text-[#111] break-all">{data.web_url}</p>
                </div>
              )}
              {data.agent_style && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#b0aea8] mb-1">Styl</p>
                  <p className="text-sm text-[#111]">{AGENT_LABELS[data.agent_style] ?? data.agent_style}</p>
                </div>
              )}
              {data.platforms?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#b0aea8] mb-1">Platformy</p>
                  <p className="text-sm text-[#111]">
                    {data.platforms.map((p) => PLATFORM_LABELS[p] ?? p).join(", ")}
                  </p>
                </div>
              )}
              {data.topics?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#b0aea8] mb-1">Témata</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {data.topics.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-3 py-1 rounded-full bg-[#f3fbdc] border border-[#d0ec78] text-[#111]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-[#b0aea8]">Obvykle trvá 15–30 sekund</p>
        </div>
      </div>
    );
  }

  // ── Výsledky ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-[#f5f3ee]"
      style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
    >
      {/* Header */}
      <div className="bg-white border-b border-[#e8e4dc] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[#111]">Tvoje příspěvky jsou hotové ✓</h1>
          <p className="text-xs text-[#888] mt-0.5">3 příspěvky připravené ke schválení</p>
        </div>
        <button
          onClick={() => router.push("/ready-to-go")}
          className="text-xs px-4 py-2 rounded-lg bg-[#b7e94c] text-[#111] font-semibold hover:bg-[#a0d940] transition-colors"
        >
          Aktivovat RTG →
        </button>
      </div>

      {/* Příspěvky */}
      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Banner — watermark info */}
        <div className="bg-white border border-[#e8e4dc] rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl flex-shrink-0">🔒</span>
          <div>
            <p className="text-sm font-medium text-[#111] mb-0.5">
              Příspěvky jsou s vodoznakem
            </p>
            <p className="text-xs text-[#666] leading-relaxed">
              Pro stažení bez vodoznaku a plnou tvorbu obsahu každý týden aktivuj tarif RTG.{" "}
              <button
                onClick={() => router.push("/ready-to-go")}
                className="text-[#111] underline"
              >
                Zjisti víc →
              </button>
            </p>
          </div>
        </div>

        {/* Karty příspěvků */}
        {posts.map((post, i) => (
          <PostCard key={i} post={post} index={i} />
        ))}

        {/* CTA dolní */}
        <div className="bg-white border border-[#e8e4dc] rounded-xl p-6 text-center flex flex-col gap-4">
          <div>
            <p className="text-base font-semibold text-[#111] mb-1">
              Líbí se ti obsah?
            </p>
            <p className="text-sm text-[#666]">
              Každý týden 3 nové příspěvky. Bez vodoznaku. Schvaluj kliknutím.
            </p>
          </div>
          <button
            onClick={() => router.push("/ready-to-go")}
            className="w-full py-3 rounded-lg bg-[#111] text-white text-sm font-semibold hover:bg-[#333] transition-colors"
          >
            Aktivovat RTG — od 2 900 Kč/měsíc →
          </button>
          <button
            onClick={() => router.push("/client/magnet/rtg/onboarding")}
            className="text-xs text-[#b0aea8] underline"
          >
            Zkusit jiný styl
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Post karta ────────────────────────────────────────────────────────────────

function PostCard({ post, index }: { post: GeneratedPost; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const typeColors: Record<string, string> = {
    GRAFIKA: "#4A9B8E",
    REELS: "#d4457a",
    CAROUSEL: "#7c4dbe",
  };
  const typeColor = typeColors[post.type] ?? "#888";

  return (
    <div className="bg-white border border-[#e8e4dc] rounded-2xl overflow-hidden">

      {/* Horní část — obrázek + metadata */}
      <div className="flex gap-0">

        {/* Obrázek */}
        <div className="w-36 flex-shrink-0 relative" style={{ minHeight: 160 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt=""
            className="w-full h-full object-cover"
            style={{ minHeight: 160, maxHeight: 220 }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
          {/* Vodoznak */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              background: "rgba(0,0,0,0.18)",
              backdropFilter: "blur(0.5px)",
            }}
          >
            <span
              style={{
                fontFamily: "serif",
                fontSize: 11,
                color: "rgba(255,255,255,0.6)",
                transform: "rotate(-30deg)",
                letterSpacing: 2,
                userSelect: "none",
              }}
            >
              LUCIFERA
            </span>
          </div>
        </div>

        {/* Text obsah */}
        <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: typeColor + "1A", color: typeColor }}
            >
              {post.type}
            </span>
            <span className="text-xs text-[#888]">{post.platform}</span>
            <span className="text-xs font-medium text-[#111] bg-[#f5f3ee] px-2 py-0.5 rounded-full">
              #{index + 1}
            </span>
          </div>

          {/* Téma */}
          <p className="text-xs text-[#b0aea8] uppercase tracking-wider">{post.topic}</p>

          {/* Hook */}
          <p className="text-sm font-semibold text-[#111] leading-snug">&ldquo;{post.hook}&rdquo;</p>

          {/* Tělo — zkrácené */}
          <p className="text-xs text-[#555] leading-relaxed line-clamp-3">{post.body}</p>

          {/* Rozbalit */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[#888] underline text-left mt-auto"
          >
            {expanded ? "Skrýt ↑" : "Zobrazit celý text →"}
          </button>
        </div>
      </div>

      {/* Rozbalený obsah */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-[#f0eeea] flex flex-col gap-3">
          <p className="text-sm text-[#333] leading-relaxed mt-3">{post.body}</p>
          <div className="flex flex-wrap gap-1.5">
            {post.hashtags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-[#f5f3ee] text-[#888]"
              >
                #{tag}
              </span>
            ))}
          </div>
          {/* Tlačítka — disabled s tichým UX */}
          <div className="flex gap-2 mt-1">
            <button
              disabled
              className="text-xs px-4 py-2 rounded-lg bg-[#b7e94c] text-[#111] font-medium opacity-40 cursor-not-allowed"
              title="Dostupné po aktivaci tarifu"
            >
              Použít bez vodoznaku
            </button>
            <button
              disabled
              className="text-xs px-4 py-2 rounded-lg bg-[#f5f3ee] text-[#666] cursor-not-allowed opacity-40"
              title="Dostupné po aktivaci tarifu"
            >
              Upravit text
            </button>
          </div>
          <p className="text-xs text-[#b0aea8]">
            🔒 Stažení bez vodoznaku dostupné po aktivaci RTG tarifu.
          </p>
        </div>
      )}
    </div>
  );
}
