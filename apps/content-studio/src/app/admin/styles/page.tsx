"use client";

import Link from "next/link";

const STYLE_CARDS = [
  { id: "bold-facts", name: "Bold Facts", font: "Pacifico + Montserrat ExtraBold", used: 3 },
  { id: "gradient-luxe", name: "Gradient Luxe", font: "Bebas + systém", used: 2 },
  { id: "clean-tech", name: "Clean Tech", font: "Poppins", used: 4 },
];

export default function AdminStylesPage() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#F5F5F5]">
            Grafické styly
          </h1>
          <p className="text-sm text-[#888] mt-1">
            Šablony pro generování postů. Rozšiřitelné bez změny kódu.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {STYLE_CARDS.map((style) => (
          <div
            key={style.id}
            className="rounded-xl border border-white/[0.06] bg-[#141414] p-5 flex flex-wrap items-center justify-between gap-4"
            style={{ boxShadow: "0 0 40px rgba(168,235,18,0.04)" }}
          >
            <div>
              <h2 className="text-lg font-medium text-[#F5F5F5]">{style.name}</h2>
              <p className="text-sm text-[#888] mt-0.5">Font: {style.font}</p>
              <p className="text-xs text-[#666] mt-1">Použito u {style.used} klientů</p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-[#888]">
                Náhled šablon
              </span>
              <span className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-[#888]">
                Duplikovat
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-[#666]">
        Styly jsou definované v kódu (style system). Pro úpravy viz dokumentace.
      </p>
    </div>
  );
}
