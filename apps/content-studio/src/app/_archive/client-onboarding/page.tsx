"use client";

import { Suspense } from "react";
import { ClientTokenGuard } from "../ClientTokenGuard";

function OnboardingContent() {
  return (
    <ClientTokenGuard>
      {(client, token) => (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-slate-800">Onboarding</h1>
          <p className="text-slate-600">
            Vítejte, {client.name || client.email}. Dokončete úvodní kroky.
          </p>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Odkaz na intake formulář (vyplnění údajů o značce):
            </p>
            <a
              href={`/intake?client=${encodeURIComponent(client.name || client.email)}`}
              className="mt-2 inline-block rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
            >
              Přejít na Intake formulář
            </a>
            <p className="mt-4 text-sm text-slate-500">
              Po odeslání intake uvidíte stav v sekci Stav a Schválení.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Token v URL: {token.slice(0, 8)}…
          </p>
        </div>
      )}
    </ClientTokenGuard>
  );
}

export default function ClientOnboardingPage() {
  return (
    <Suspense fallback={<div className="p-6">Načítám…</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
