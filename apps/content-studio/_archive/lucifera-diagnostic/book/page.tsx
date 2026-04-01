"use client";

import { Header } from "../../components/Header";
import Link from "next/link";

export default function LuciferaDiagnosticBookPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#1A1A1A]">
      <Header />
      <section className="mx-auto max-w-[820px] px-6 py-12">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Výběr termínu</h1>
        <p className="mt-2 text-[#6F6F6F]">
          Zde bude embedded Calendly (placeholder). Po rezervaci vás přesměrujeme k úhradě.
        </p>
        <div
          className="mt-8 flex min-h-[320px] items-center justify-center rounded-2xl border border-[#EAEAE7] bg-white/50"
          aria-hidden
        >
          <span className="text-sm text-[#6F6F6F]">Calendly placeholder</span>
        </div>
        <Link
          href="/lucifera-diagnostic/success"
          className="mt-6 inline-block rounded-xl bg-[#B7E300] px-6 py-3 text-base font-semibold text-[#1A1A1A] hover:opacity-90"
        >
          Simulovat rezervaci a pokračovat
        </Link>
      </section>
    </main>
  );
}
