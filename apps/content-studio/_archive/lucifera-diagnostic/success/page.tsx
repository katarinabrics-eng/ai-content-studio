"use client";

import { Header } from "../../components/Header";
import Link from "next/link";

export default function LuciferaDiagnosticSuccessPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#1A1A1A]">
      <Header />
      <section className="mx-auto max-w-[820px] px-6 py-12">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Termín rezervován</h1>
        <p className="mt-2 text-[#6F6F6F]">
          Teaser zpráva (placeholder). Po zaplacení vytvoříme váš účet a projekt a přesměrujeme vás do studia.
        </p>
        <div
          className="mt-8 rounded-2xl border border-[#EAEAE7] bg-white p-6"
          aria-hidden
        >
          <span className="text-sm text-[#6F6F6F]">Platební brána placeholder → po zaplacení: vytvoř client, projekt, redirect /studio</span>
        </div>
        <Link
          href="/studio"
          className="mt-6 inline-block rounded-xl bg-[#B7E300] px-6 py-3 text-base font-semibold text-[#1A1A1A] hover:opacity-90"
        >
          Přejít do studia (MVP)
        </Link>
      </section>
    </main>
  );
}
