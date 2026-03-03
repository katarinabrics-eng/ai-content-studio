"use client";

import { ChoiceButton } from "@/components/ChoiceButton";

const MANUAL_OFFER_TYPES = [
  "Konzultace",
  "Online kurz",
  "Produkt",
  "Kreativní služba",
  "Péče / zdraví",
  "Technologie",
  "Jiné",
] as const;

const MANUAL_AUDIENCE = [
  "Podnikatelé a manažeři",
  "Ženy budující osobní značku",
  "Malé a střední firmy",
  "Kreativci a freelanceři",
] as const;

const MANUAL_PRICE_LEVELS = ["Základní", "Střední", "Prémiová"] as const;

const MAX_OFFER_SELECT = 2;
const MAX_AUDIENCE_SELECT = 2;

const C = {
  card: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
  },
  lbl: {
    fontSize: 9,
    color: "#444",
    textTransform: "uppercase" as const,
    letterSpacing: "0.15em",
    marginBottom: 5,
    display: "block",
  },
  inp: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 10,
    padding: "12px 14px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box" as const,
  },
  btn: {
    width: "100%",
    padding: 13,
    background: "#a8e063",
    color: "#000",
    fontWeight: 700,
    fontSize: 14,
    border: "none",
    borderRadius: 10,
    cursor: "pointer" as const,
    marginTop: 10,
  },
};

export type WebAnalyzerProps = {
  diagnostika?: boolean;
  mode: "web" | "manual";
  setMode: (m: "web" | "manual") => void;
  url: string;
  setUrl: (s: string) => void;
  brandName: string;
  setBrandName: (s: string) => void;
  offerTypes: string[];
  setOfferTypes: (s: string[] | ((prev: string[]) => string[])) => void;
  audience: string[];
  setAudience: (s: string[] | ((prev: string[]) => string[])) => void;
  priceLevel: string | null;
  setPriceLevel: (s: string | null) => void;
  manualOptionalText: string;
  setManualOptionalText: (s: string) => void;
  brandFile: File | null;
  setBrandFile: (f: File | null) => void;
  imageFile: File | null;
  setImageFile: (f: File | null) => void;
  hasManualInput: boolean;
  onAnalyze: () => void;
  error: string;
};

/** Vstup URL + toggle mám/nemám web + manual formulář. */
export function WebAnalyzer({
  diagnostika = false,
  mode,
  setMode,
  url,
  setUrl,
  brandName,
  setBrandName,
  offerTypes,
  setOfferTypes,
  audience,
  setAudience,
  priceLevel,
  setPriceLevel,
  manualOptionalText,
  setManualOptionalText,
  brandFile,
  setBrandFile,
  imageFile,
  setImageFile,
  hasManualInput,
  onAnalyze,
  error,
}: WebAnalyzerProps) {
  const canSubmit = (mode === "web" && url.trim()) || (diagnostika && mode === "manual" && hasManualInput);
  return (
    <div className="analyzer-fade">
      {diagnostika && (
        <section className="relative max-w-4xl mx-auto mb-20 px-6">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-gradient-to-r from-lime-400 via-emerald-500 to-teal-400 rounded-full" />
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-lime-400 mb-4">Strategický vstup</p>
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">Analýza vizuální úrovně značky</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Diskrétní orientační rozbor toho, jak vaše značka působí navenek. Ukážeme vám silné body, slabá místa a jeden možný směr dalšího rozvoje.
            </p>
          </div>
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-10 backdrop-blur-xl shadow-[0_0_80px_rgba(132,204,22,0.08)]">
            <p className="text-zinc-300 leading-relaxed mb-8">
              Tato ukázková analýza je vstupní fází před strategickou konzultací. Plná diagnostika a vizuální board jsou součástí placené spolupráce.
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-8" />
            <p className="text-sm uppercase tracking-widest text-zinc-500 mb-6">Jak to probíhá</p>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-zinc-300">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6">
                <div className="text-lime-400 text-lg mb-3">01</div>
                Zadáte web nebo podklady o značce.
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6">
                <div className="text-lime-400 text-lg mb-3">02</div>
                Získáte orientační analýzu a návrh jednoho směru.
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6">
                <div className="text-lime-400 text-lg mb-3">03</div>
                Pokud dává smysl pokračovat, rezervujete termín a zahájíme spolupráci.
              </div>
            </div>
          </div>
        </section>
      )}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: 20,
            background: "rgba(168,224,99,0.07)",
            border: "1px solid rgba(168,224,99,0.15)",
            color: "#a8e063",
            fontSize: 11,
            marginBottom: 18,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a8e063" }} />
          {diagnostika ? "Ukázková analýza" : "Modul 1 · Analýza značky"}
        </span>
        <h1 style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.3, marginBottom: 10, color: "#fff" }}>
          Zadejte web.
          <br />
          <span style={{ color: "#2a2a3a" }}>Zbytek uděláme za vás.</span>
        </h1>
      </div>

      <div className={diagnostika ? "bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl" : ""} style={diagnostika ? undefined : C.card}>
        {diagnostika && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setMode("web")}
                className={`px-6 py-2 rounded-full text-sm transition ${mode === "web" ? "bg-emerald-500 text-black" : "text-white/60 hover:text-white"}`}
              >
                Mám web
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`px-6 py-2 rounded-full text-sm transition ${mode === "manual" ? "bg-emerald-500 text-black" : "text-white/60 hover:text-white"}`}
              >
                Nemám web
              </button>
            </div>
          </div>
        )}

        {(!diagnostika || mode === "web") && (
          <>
            <label style={C.lbl}>URL webu klienta</label>
            <input
              className="analyzer-inp"
              style={C.inp}
              placeholder="Zde zadejte adresu webu"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAnalyze()}
            />
          </>
        )}

        {diagnostika && mode === "manual" && (
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center mb-2">
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-1">Nemáte web?</h2>
              <p className="text-white/60 text-sm md:text-base">Stačí pár informací. Provedeme vás.</p>
            </div>

            <div className="rounded-2xl bg-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.24)] px-6 py-6 md:px-8 md:py-8">
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-3">Název značky / jméno</label>
              <input
                type="text"
                style={C.inp}
                placeholder="Např. Jana Nováková Coaching"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="analyzer-inp rounded-xl"
              />
            </div>

            <div className="rounded-2xl bg-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.24)] px-6 py-6 md:px-8 md:py-8">
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-3">Co nabízíte (max 1–2)</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {MANUAL_OFFER_TYPES.map((opt) => {
                  const on = offerTypes.includes(opt);
                  const canAdd = offerTypes.length < MAX_OFFER_SELECT || on;
                  return (
                    <ChoiceButton
                      key={opt}
                      label={opt}
                      selected={on}
                      onClick={() => {
                        if (on) setOfferTypes((prev) => prev.filter((x) => x !== opt));
                        else if (canAdd) setOfferTypes((prev) => [...prev, opt]);
                      }}
                      disabled={!canAdd}
                      multi
                    />
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.24)] px-6 py-6 md:px-8 md:py-8">
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-3">Pro koho (max 2)</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {MANUAL_AUDIENCE.map((opt) => {
                  const on = audience.includes(opt);
                  const canAdd = audience.length < MAX_AUDIENCE_SELECT || on;
                  return (
                    <ChoiceButton
                      key={opt}
                      label={opt}
                      selected={on}
                      onClick={() => {
                        if (on) setAudience((prev) => prev.filter((x) => x !== opt));
                        else if (canAdd) setAudience((prev) => [...prev, opt]);
                      }}
                      disabled={!canAdd}
                      multi
                    />
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.24)] px-6 py-6 md:px-8 md:py-8">
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-3">Cenová úroveň</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {MANUAL_PRICE_LEVELS.map((opt) => (
                  <ChoiceButton
                    key={opt}
                    label={opt}
                    selected={priceLevel === opt}
                    onClick={() => setPriceLevel(priceLevel === opt ? null : opt)}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.24)] px-6 py-6 md:px-8 md:py-8">
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-3">Stručně popište, co děláte (volitelné)</label>
              <textarea
                style={{ ...C.inp, minHeight: 88 }}
                placeholder={"Například:\nPomáhám ženám po mateřské nastavit online podnikání.\nVytvářím přírodní kosmetiku pro citlivou pleť.\nUčím firmy pracovat s vizuální identitou."}
                value={manualOptionalText}
                onChange={(e) => setManualOptionalText(e.target.value)}
                className="analyzer-inp rounded-xl resize-y placeholder:text-zinc-500"
              />
              <p className="text-[11px] text-zinc-500 mt-2">Krátké. Konkrétní. Jasné.</p>
            </div>

            <div className="rounded-2xl bg-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.24)] px-6 py-6 md:px-8 md:py-8 text-center">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.type !== "application/pdf") {
                    alert("Povolen je pouze PDF soubor.");
                    return;
                  }
                  if (file.size > 2 * 1024 * 1024) {
                    alert("Soubor je příliš velký. Maximální velikost je 2 MB.");
                    return;
                  }
                  setBrandFile(file);
                }}
                className="hidden"
                id="pdfUpload"
              />
              <label htmlFor="pdfUpload" className="cursor-pointer text-white/60 hover:text-white/90 transition block text-sm">
                {brandFile ? `Vybrán soubor: ${brandFile.name}` : "Nahrajte textový PDF dokument (max 2 MB). Dokument by měl obsahovat pouze textové informace o značce."}
              </label>
              <p className="text-[11px] text-zinc-500 mt-2">Dokument musí obsahovat skutečný text (ne naskenované obrázky).</p>
            </div>

            <div className="rounded-2xl bg-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.24)] px-6 py-6 md:px-8 md:py-8 text-center">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
                    alert("Povolen je pouze JPG, PNG nebo WEBP obrázek.");
                    return;
                  }
                  if (file.size > 1024 * 1024) {
                    alert("Obrázek je příliš velký. Maximální velikost je 1 MB.");
                    return;
                  }
                  setImageFile(file);
                }}
                className="hidden"
                id="imageUpload"
              />
              <label htmlFor="imageUpload" className="cursor-pointer text-white/60 hover:text-white/90 transition block text-sm">
                {imageFile ? `Vybrán obrázek: ${imageFile.name}` : "Nahrajte jednu ukázku grafiky nebo fotografie (max 1 MB). Ideálně reprezentativní vizuál vaší značky."}
              </label>
              {imageFile && (
                <img src={URL.createObjectURL(imageFile)} alt="Náhled" className="mt-3 rounded-md max-h-40 mx-auto object-contain" />
              )}
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: 10,
              padding: "10px 14px",
              background: "rgba(224,90,90,0.07)",
              border: "1px solid rgba(224,90,90,0.2)",
              borderRadius: 8,
              color: "#e05a5a",
              fontSize: 13,
            }}
          >
            ⚠ {error}
          </div>
        )}
        <button
          type="button"
          style={{ ...C.btn, opacity: canSubmit ? 1 : 0.3 }}
          onClick={onAnalyze}
          disabled={!canSubmit}
        >
          {diagnostika && mode === "manual" ? "✨ Spustit strategický scan" : diagnostika ? "Analyzovat" : "Analyzovat →"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
        {["Screenshot webu", "Analýza textu", "Claude Vision", "Brand DNA"].map((t) => (
          <span key={t} style={{ fontSize: 10, color: "#2a2a3a" }}>✓ {t}</span>
        ))}
      </div>
    </div>
  );
}
