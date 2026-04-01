"use client";

import { Suspense } from "react";
import { ClientTokenGuard } from "../ClientTokenGuard";

function ApprovalContent() {
  return (
    <ClientTokenGuard>
      {(client, token) => (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-slate-800">Schválení obsahu</h1>
          <p className="text-slate-600">
            Zde můžete schválit návrhy, požádat o úpravy nebo stáhnout finální materiály.
          </p>
          <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
            <section>
              <h2 className="font-medium text-slate-800">Akce</h2>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li>• Schválit – obsah je v pořádku</li>
                <li>• Požádat o úpravy – popište požadované změny</li>
                <li>• Stáhnout – export do Canva nebo ZIP</li>
              </ul>
            </section>
            <p className="text-slate-500 text-sm">
              Zakázky připravené ke schválení se zobrazí po dokončení zpracování (stav „Připraveno k schválení“).
            </p>
            <a
              href={`/client/status?token=${encodeURIComponent(token)}`}
              className="inline-block rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
            >
              Zobrazit stav zakázek
            </a>
          </div>
        </div>
      )}
    </ClientTokenGuard>
  );
}

export default function ClientApprovalPage() {
  return (
    <Suspense fallback={<div className="p-6">Načítám…</div>}>
      <ApprovalContent />
    </Suspense>
  );
}
