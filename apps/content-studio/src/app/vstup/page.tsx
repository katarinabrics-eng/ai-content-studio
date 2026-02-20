"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ENABLE_CODE_PIN_ACCESS = process.env.NEXT_PUBLIC_ENABLE_CODE_PIN_ACCESS === "true";

function VstupContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  if (!ENABLE_CODE_PIN_ACCESS) {
    return (
      <main className="min-h-screen bg-lucifera-dark flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="glass-panel p-8">
            <h1 className="text-xl font-bold text-white">Klientský vstup dočasně vypnut</h1>
            <p className="mt-4 text-white/70">
              Přihlášení kódem a PINem je dočasně vypnuto. 
              Pro novou objednávku použijte hlavní stránku.
            </p>
            {errorParam && (
              <p className="mt-4 text-sm text-amber-400">
                {errorParam === "missing_token" && "Chybí přístupový token."}
                {errorParam === "invalid_token" && "Neplatný přístupový token."}
              </p>
            )}
            <a href="/start" className="btn-lime-primary mt-6 inline-block">
              Přejít na objednávku
            </a>
            <a href="/" className="mt-3 block text-sm text-white/50 hover:text-white/70">
              Zpět na hlavní stránku
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-lucifera-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <p className="text-white/70">Code+PIN access is enabled but form not rendered (feature flag active).</p>
        <a href="/" className="btn-lime-primary mt-6 inline-block">Zpět</a>
      </div>
    </main>
  );
}

export default function VstupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-white">Načítám…</div>}>
      <VstupContent />
    </Suspense>
  );
}
