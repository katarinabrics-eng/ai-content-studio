"use client";

import { Header } from "../../components/Header";
import { LuciferaDiagnosticWizard } from "../../components/LuciferaDiagnosticWizard";

export default function LuciferaDiagnosticStartPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#1A1A1A]">
      <Header />
      <section className="mx-auto max-w-[820px] px-6 py-12">
        <LuciferaDiagnosticWizard />
      </section>
    </main>
  );
}
