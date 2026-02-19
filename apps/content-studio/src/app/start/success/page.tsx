"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const magicLinkUrl = searchParams.get("magicLinkUrl");
  const projectCode = searchParams.get("projectCode");
  const pin = searchParams.get("pin");
  const [copied, setCopied] = useState(false);

  const copyCodePin = useCallback(() => {
    if (projectCode && pin) {
      const text = `Kód: ${projectCode}\nPIN: ${pin}\nPřihlášení: ${typeof window !== "undefined" ? window.location.origin : ""}/vstup`;
      void navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [projectCode, pin]);

  return (
    <main className="min-h-screen bg-lucifera-dark px-4 py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-white">Projekt byl vytvořen</h1>
        <p className="mt-2 text-white/70">
          Data se zpracovávají. Pokud něco chybí, AI spolu s lidským kurátorem vyberou nejlépe pasující variantu pro váš projekt.
        </p>

        {magicLinkUrl ? (
          <div className="glass-panel mt-8 p-6">
            <p className="text-sm text-white/80">Odkaz na váš projekt (odeslali jsme ho i na e-mail):</p>
            <a
              href={magicLinkUrl}
              className="mt-3 block break-all text-lucifera-lime underline"
            >
              {magicLinkUrl}
            </a>
            <a href={magicLinkUrl} className="btn-lime-primary mt-4 inline-block">
              Otevřít projekt
            </a>
          </div>
        ) : projectCode && pin ? (
          <div className="glass-panel mt-8 p-6">
            <p className="text-sm text-white/80">Uložte si kód a PIN pro přístup k projektu:</p>
            <div className="mt-3 rounded-lg bg-white/5 p-4 font-mono text-white">
              <p><span className="text-white/60">Kód:</span> {projectCode}</p>
              <p className="mt-1"><span className="text-white/60">PIN:</span> {pin}</p>
            </div>
            <p className="mt-2 text-xs text-white/50">Přihlášení: /vstup (zadejte kód a PIN)</p>
            <button type="button" onClick={copyCodePin} className="btn-lime-primary mt-4">
              {copied ? "Zkopírováno" : "Zkopírovat"}
            </button>
            <a href="/vstup" className="ml-3 inline-block rounded-full border border-lucifera-lime/60 px-6 py-3 text-sm font-medium text-white">
              Přejít na přihlášení
            </a>
          </div>
        ) : (
          <p className="mt-6 text-white/60">Nemáte údaje k zobrazení. Vraťte se na <a href="/start" className="text-lucifera-lime underline">/start</a>.</p>
        )}
      </div>
    </main>
  );
}

export default function StartSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-white">Načítám…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
