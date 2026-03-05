"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { StartAnalyzer } from "../start/StartAnalyzer";

function DiagnostikaContent() {
  const searchParams = useSearchParams();
  const initialUrl = useMemo(() => {
    const u = searchParams.get("url");
    return u ? decodeURIComponent(u) : undefined;
  }, [searchParams]);
  const initialManualText = useMemo(() => {
    if (searchParams.get("manual") !== "true") return undefined;
    const t = searchParams.get("text");
    return t ? decodeURIComponent(t) : undefined;
  }, [searchParams]);

  return (
    <StartAnalyzer
      diagnostika
      initialUrl={initialUrl}
      initialManualText={initialManualText}
    />
  );
}

export default function DiagnostikaPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-500">Načítám…</div>}>
        <DiagnostikaContent />
      </Suspense>
    </main>
  );
}
