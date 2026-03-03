"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ScanResultScrollExperience } from "@/app/start/ScanResultScrollExperience";
import type { ScanResult } from "@/app/start/ScanResultScrollExperience";

type AccessState =
  | { status: "loading" }
  | { status: "expired" }
  | { status: "not_found" }
  | { status: "ok"; project: { id: string; scan_result: Record<string, unknown>; access_expires_at: string | null } };

function DiagnostikaViewContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<AccessState>({ status: "loading" });

  const fetchAccess = useCallback(async () => {
    if (!token.trim()) {
      setState({ status: "not_found" });
      return;
    }
    const res = await fetch(`/api/diagnostika/access?token=${encodeURIComponent(token.trim())}`);
    const data = await res.json();
    if (data.ok && data.project) {
      setState({ status: "ok", project: data.project });
    } else if (data.error === "expired") {
      setState({ status: "expired" });
    } else {
      setState({ status: "not_found" });
    }
  }, [token]);

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  if (state.status === "loading") {
    return (
      <main className="min-h-screen bg-[#0c0c14] flex items-center justify-center text-zinc-400">
        <p>Načítám…</p>
      </main>
    );
  }

  if (state.status === "not_found") {
    return (
      <main className="min-h-screen bg-[#0c0c14] flex flex-col items-center justify-center px-6 text-zinc-300">
        <p className="text-lg">Odkaz je neplatný nebo již nebyl aktivován.</p>
        <Link href="/diagnostika" className="mt-4 text-[#A8EB12] underline">Spustit diagnostiku</Link>
      </main>
    );
  }

  if (state.status === "expired") {
    return (
      <main className="min-h-screen bg-[#0c0c14] flex flex-col items-center justify-center px-6 text-zinc-300">
        <h1 className="text-xl font-semibold text-white">Přístup vypršel</h1>
        <p className="mt-2 text-center max-w-md">
          Bezplatný 7denní přístup k výsledkům diagnostiky skončil. Vaše data u nás zůstávají (nerealizované projekty).
        </p>
        <p className="mt-4 text-zinc-400">Chcete‑li pokračovat s prémiovou vizuální identitou nebo konzultací:</p>
        <Link
          href="/rezervace?from=premiova"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#A8EB12] px-5 py-2.5 text-sm font-medium text-[#0c0c14] hover:bg-[#b8f022]"
        >
          Chci – Prémiovou vizuální identitu
        </Link>
        <Link href="/diagnostika" className="mt-4 text-sm text-zinc-500 underline">Spustit diagnostiku znovu</Link>
      </main>
    );
  }

  const result = state.project.scan_result as ScanResult;
  if (!result || typeof result !== "object") {
    return (
      <main className="min-h-screen bg-[#0c0c14] flex items-center justify-center text-zinc-500">
        <p>Žádná data k zobrazení.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0c0c14]">
      <ScanResultScrollExperience
        result={result}
        projectId={state.project.id}
        onEnterWorkspace={undefined}
      />
    </main>
  );
}

export default function DiagnostikaViewPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0c0c14] flex items-center justify-center text-zinc-400">
          <p>Načítám…</p>
        </main>
      }
    >
      <DiagnostikaViewContent />
    </Suspense>
  );
}
