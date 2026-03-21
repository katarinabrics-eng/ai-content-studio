"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

type RtgClient = { name: string | null; email: string | null };

function RtgNav({ projectCode, token }: { projectCode: string; token: string }) {
  const [client, setClient] = useState<RtgClient | null>(null);

  useEffect(() => {
    if (!token) return;
    // Načteme jméno klienta z batch endpointu (validuje token)
    // Použijeme lightweight validate
    fetch(`/api/client/rtg/batch?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          // batch endpoint nevrací jméno klienta — zobrazíme prázdno, nebo zkusíme z tokenu
          setClient({ name: null, email: null });
        }
      })
      .catch(() => {});
  }, [token]);

  return (
    <header className="sticky top-0 z-50 bg-[#fafaf8] border-b border-[#e8e8e4]">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <a
          href={`/client/${projectCode}/rtg?token=${encodeURIComponent(token)}`}
          className="font-semibold text-[#1a1a1a] tracking-tight text-base"
        >
          Ready <span className="text-[#b5d45c]">to Go</span>
        </a>
        {client?.name && (
          <span className="text-sm text-[#888] truncate max-w-[180px]">{client.name}</span>
        )}
      </div>
    </header>
  );
}

function RtgLayoutInner({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectCode = params.projectCode as string;
  const token = searchParams.get("token") ?? "";

  return (
    <div className="min-h-screen bg-[#fafaf8]" style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}>
      <RtgNav projectCode={projectCode} token={token} />
      <main>{children}</main>
    </div>
  );
}

export default function RtgLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#e8e8e4] border-t-[#d0ec78] rounded-full animate-spin" />
        </div>
      }
    >
      <RtgLayoutInner>{children}</RtgLayoutInner>
    </Suspense>
  );
}
