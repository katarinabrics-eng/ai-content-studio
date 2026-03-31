"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface MagnetData {
  web_url: string;
  agent_style: string;
  platforms: string[];
  topics: string[];
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

export default function MagnetPreviewPage() {
  const router = useRouter();
  const [data, setData] = useState<MagnetData | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("magnet_onboarding");
    if (raw) {
      try {
        setData(JSON.parse(raw) as MagnetData);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  return (
    <div
      className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-20"
      style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
    >
      <div className="w-full max-w-md flex flex-col items-center gap-8 text-center">

        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-[#e8e8e4] border-t-[#b7e94c] rounded-full animate-spin" />

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-semibold text-[#111] mb-2">
            Generujeme tvůj obsah...
          </h1>
          <p className="text-sm text-[#666] leading-relaxed">
            Připravujeme 3 posty přesně pro tvou značku.
          </p>
        </div>

        {/* Souhrn dat */}
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
                <p className="text-sm text-[#111]">
                  {AGENT_LABELS[data.agent_style] ?? data.agent_style}
                </p>
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

        {/* CTA */}
        <button
          onClick={() => router.push("/ready-to-go#plans")}
          className="w-full py-3 rounded-lg bg-[#b7e94c] text-[#111] text-sm font-semibold hover:bg-[#a0d940] transition-colors"
        >
          Přejít na RTG →
        </button>

      </div>
    </div>
  );
}
