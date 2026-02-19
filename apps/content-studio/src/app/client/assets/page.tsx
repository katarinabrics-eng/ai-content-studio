"use client";

import { Suspense } from "react";
import { ClientTokenGuard } from "../ClientTokenGuard";

function AssetsContent() {
  return (
    <ClientTokenGuard>
      {(client, token) => (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-slate-800">Nahrát assety</h1>
          <p className="text-slate-600">
            Můžete nahrát nové fotografie nebo logo pro použití v obsahu.
          </p>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Nahrávání souborů bude dostupné po propojení s úložištěm (Supabase Storage). Prozatím využijte intake formulář pro URL loga a brand manuál (PDF).
            </p>
            <a
              href={`/intake?client=${encodeURIComponent(client.name || client.email)}`}
              className="mt-4 inline-block rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
            >
              Přejít na Intake
            </a>
          </div>
        </div>
      )}
    </ClientTokenGuard>
  );
}

export default function ClientAssetsPage() {
  return (
    <Suspense fallback={<div className="p-6">Načítám…</div>}>
      <AssetsContent />
    </Suspense>
  );
}
