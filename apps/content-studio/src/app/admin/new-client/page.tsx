"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminNewClientPage() {
  const [name, setName] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-[#F5F5F5] mb-1">
        Nový klient
      </h1>
      <p className="text-sm text-[#888] mb-8">
        Zadejte údaje a spusťte AI diagnostiku z webu klienta.
      </p>

      <div
        className="rounded-xl border border-white/[0.06] bg-[#141414] p-6"
        style={{ boxShadow: "0 0 40px rgba(168,235,18,0.04)" }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#888] mb-1.5">
              Jméno klienta
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Firma nebo jméno"
              className="w-full rounded-lg bg-[#0F0F0F] border border-white/[0.08] px-4 py-2.5 text-[#F5F5F5] placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-[#A8EB12]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#888] mb-1.5">
              Web URL
            </label>
            <input
              type="url"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-lg bg-[#0F0F0F] border border-white/[0.08] px-4 py-2.5 text-[#F5F5F5] placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-[#A8EB12]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#888] mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="klient@email.cz"
              className="w-full rounded-lg bg-[#0F0F0F] border border-white/[0.08] px-4 py-2.5 text-[#F5F5F5] placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-[#A8EB12]/50"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/diagnostika"
            className="inline-flex items-center justify-center rounded-lg bg-[#A8EB12] px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-[#b8f022] transition-colors"
          >
            🔍 Spustit AI diagnostiku
          </Link>
          <Link
            href="/admin/clients"
            className="inline-flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-[#888] hover:bg-white/[0.08] transition-colors"
          >
            ← Zpět na klienty
          </Link>
        </div>
        <p className="mt-4 text-xs text-[#666]">
            Diagnostika se spouští na veřejné stránce Diagnostika; po dokončení skenu se záznam objeví v Klienti (diagnostika).
        </p>
      </div>
    </div>
  );
}
