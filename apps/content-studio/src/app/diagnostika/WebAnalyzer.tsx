"use client";

import { ChoiceButton } from "@/components/ChoiceButton";
import {
  MANUAL_OFFER_TYPES,
  MANUAL_AUDIENCE,
  MANUAL_PRICE_LEVELS,
  MANUAL_STYLE_OPTIONS,
  MAX_OFFER_SELECT,
  MAX_AUDIENCE_SELECT,
} from "@/lib/diagnostika-manual";

const LIME_MAIN = "#b7e94c";
const CARD_BORDER = "rgba(0,0,0,0.09)";
const C = {
  card: {
    background: "#ffffff",
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
  },
  lbl: {
    fontSize: 9,
    color: "#555555",
    textTransform: "uppercase" as const,
    letterSpacing: "0.15em",
    marginBottom: 5,
    display: "block",
  },
  inp: {
    width: "100%",
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.10)",
    borderRadius: 12,
    padding: "14px 18px",
    color: "#111111",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  inpPremium: {
    border: "1px solid rgba(0,0,0,0.08)",
    padding: "16px 20px",
    borderRadius: 12,
  },
  btn: {
    width: "100%",
    padding: 16,
    background: LIME_MAIN,
    color: "#111",
    fontWeight: 700,
    fontSize: 15,
    border: "none",
    borderRadius: 12,
    cursor: "pointer" as const,
    marginTop: 12,
    transition: "opacity 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 2px 12px rgba(183,233,76,0.35)",
  },
};

const lightTokens = {
  text: "#111111",
  muted: "#555555",
  accent: LIME_MAIN,
  bg: "#f0efeb",
  card: "#ffffff",
  border: CARD_BORDER,
  error: "#dc2626",
};

export type WebAnalyzerProps = {
  diagnostika?: boolean;
  hideIntro?: boolean;
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
  preferredStyle: string | null;
  setPreferredStyle: (s: string | null) => void;
  brandColors: string;
  setBrandColors: (s: string) => void;
  brandFonts: string;
  setBrandFonts: (s: string) => void;
  toneOfVoice: string;
  setToneOfVoice: (s: string) => void;
  hasManualInput: boolean;
  onAnalyze: () => void;
  error: string;
  onRetry?: () => void;
};

/** Vstup URL + toggle mám/nemám web + manual formulář. */
export function WebAnalyzer({
  diagnostika = false,
  hideIntro = false,
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
  preferredStyle,
  setPreferredStyle,
  brandColors,
  setBrandColors,
  brandFonts,
  setBrandFonts,
  toneOfVoice,
  setToneOfVoice,
  hasManualInput,
  onAnalyze,
  error,
  onRetry,
}: WebAnalyzerProps) {
  const urlStr = typeof url === "string" ? url : "";
  const canSubmit = (mode === "web" && urlStr.trim()) || (diagnostika && mode === "manual" && hasManualInput);
  const showIntro = diagnostika && !hideIntro;
  const isBrandScan = diagnostika && hideIntro;
  return (
    <div className="analyzer-fade">
      <style>{`
        .analyzer-inp:focus { border-color: #b7e94c !important; box-shadow: 0 0 0 3px rgba(183,233,76,0.2); outline: none; }
        .analyzer-inp::placeholder { color: #bbbbbb; }
        .analyzer-toggle-btn-active { background: #b7e94c !important; color: #111 !important; font-weight: 700 !important; box-shadow: 0 2px 10px rgba(183,233,76,0.35); }
        .analyzer-checklist-item { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: #555; }
        @media (max-width: 560px) { .analyzer-checklist-wrap { flex-direction: column; align-items: center; gap: 12px; } }
      `}</style>
      {showIntro && (
        <section className="relative max-w-4xl mx-auto mb-20 px-6">
          <div className="absolute inset-0 -z-20 blur-[100px] opacity-25 rounded-full scale-150" style={{ background: `radial-gradient(ellipse 80% 50% at 50% 70%, ${lightTokens.accent}50, transparent 70%)` }} />
          <div className="absolute inset-0 -z-10 blur-3xl opacity-40 rounded-full" style={{ background: `linear-gradient(to right, ${lightTokens.accent}60, ${lightTokens.accent}60)` }} />
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: lightTokens.accent }}>Strategický vstup</p>
            <h2 className="text-4xl md:text-5xl font-semibold mb-6" style={{ color: lightTokens.text }}>Analýza vizuální úrovně značky</h2>
            <p className="max-w-2xl mx-auto leading-relaxed" style={{ color: lightTokens.muted }}>
              Diskrétní orientační rozbor toho, jak vaše značka působí navenek. Ukážeme vám silné body, slabá místa a jeden možný směr dalšího rozvoje.
            </p>
          </div>
          <div className="rounded-3xl p-10 backdrop-blur-xl border" style={{ background: lightTokens.card, borderColor: lightTokens.border }}>
            <p className="leading-relaxed mb-8" style={{ color: lightTokens.muted }}>
              Tato ukázková analýza je vstupní fází před strategickou konzultací. Plná diagnostika a vizuální board jsou součástí placené spolupráce.
            </p>
            <div className="h-px mb-8" style={{ background: `linear-gradient(to right, transparent, ${lightTokens.border}, transparent)` }} />
            <p className="text-sm uppercase tracking-widest mb-6" style={{ color: lightTokens.muted }}>Jak to probíhá</p>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="rounded-2xl p-6 border" style={{ background: lightTokens.bg, borderColor: lightTokens.border }}>
                <div className="text-lg mb-3" style={{ color: lightTokens.accent }}>01</div>
                <span style={{ color: lightTokens.muted }}>Zadáte web nebo podklady o značce.</span>
              </div>
              <div className="rounded-2xl p-6 border" style={{ background: lightTokens.bg, borderColor: lightTokens.border }}>
                <div className="text-lg mb-3" style={{ color: lightTokens.accent }}>02</div>
                <span style={{ color: lightTokens.muted }}>Získáte orientační analýzu a návrh jednoho směru.</span>
              </div>
              <div className="rounded-2xl p-6 border" style={{ background: lightTokens.bg, borderColor: lightTokens.border }}>
                <div className="text-lg mb-3" style={{ color: lightTokens.accent }}>03</div>
                <span style={{ color: lightTokens.muted }}>Pokud dává smysl pokračovat, rezervujete termín a zahájíme spolupráci.</span>
              </div>
            </div>
          </div>
        </section>
      )}
      {!hideIntro && (
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 9999,
              background: "rgba(183,233,76,0.15)",
              border: "1px solid rgba(183,233,76,0.4)",
              color: lightTokens.accent,
              fontSize: 11,
              marginBottom: 18,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: lightTokens.accent }} />
            {diagnostika ? "Ukázková analýza" : "Modul 1 · Analýza značky"}
          </span>
          <h1 style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.3, marginBottom: 10, color: lightTokens.text }}>
            Zadejte web.
            <br />
            <span style={{ color: lightTokens.muted }}>Zbytek uděláme za vás.</span>
          </h1>
        </div>
      )}

      <div className={diagnostika ? "backdrop-blur-xl rounded-3xl p-10" : ""} style={diagnostika ? { background: isBrandScan ? "transparent" : "#ffffff", border: isBrandScan ? "none" : `1px solid ${CARD_BORDER}` } : C.card}>
        {diagnostika && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-full p-1.5 border" style={{ background: lightTokens.bg, borderColor: "rgba(0,0,0,0.1)" }}>
              <button
                type="button"
                onClick={() => setMode("web")}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${mode === "web" ? "analyzer-toggle-btn-active" : ""}`}
                style={mode === "web" ? undefined : { background: "transparent", color: lightTokens.muted }}
              >
                Mám web
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${mode === "manual" ? "analyzer-toggle-btn-active" : ""}`}
                style={mode === "manual" ? undefined : { background: "transparent", color: lightTokens.muted }}
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
              style={isBrandScan ? { ...C.inp, ...C.inpPremium } : C.inp}
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
              <h2 className="text-xl md:text-2xl font-semibold mb-1" style={{ color: lightTokens.text }}>Nemáte web?</h2>
              <p className="text-sm md:text-base" style={{ color: lightTokens.muted }}>Stačí pár informací. Provedeme vás.</p>
            </div>

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: lightTokens.card, borderColor: lightTokens.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: lightTokens.muted }}>Název značky / jméno</label>
              <input
                type="text"
                style={C.inp}
                placeholder="Např. Jana Nováková Coaching"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="analyzer-inp rounded-xl"
              />
            </div>

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: lightTokens.card, borderColor: lightTokens.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: lightTokens.muted }}>Co nabízíte (max 1–2)</label>
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

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: lightTokens.card, borderColor: lightTokens.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: lightTokens.muted }}>Pro koho (max 2)</label>
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

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: lightTokens.card, borderColor: lightTokens.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: lightTokens.muted }}>Cenová úroveň</label>
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

            <p className="text-sm font-medium pt-2 pb-1" style={{ color: lightTokens.muted }}>Vizuál a tón (volitelné)</p>
            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: lightTokens.card, borderColor: lightTokens.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: lightTokens.muted }}>Preferovaný styl</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {MANUAL_STYLE_OPTIONS.map((opt) => (
                  <ChoiceButton
                    key={opt.id}
                    label={opt.label}
                    selected={preferredStyle === opt.id}
                    onClick={() => setPreferredStyle(preferredStyle === opt.id ? null : opt.id)}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: lightTokens.card, borderColor: lightTokens.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: lightTokens.muted }}>Barvy značky (volitelné)</label>
              <input
                type="text"
                style={C.inp}
                placeholder="Např. #1a1a2e, #16213e, #e94560"
                value={brandColors}
                onChange={(e) => setBrandColors(e.target.value)}
                className="analyzer-inp rounded-xl"
              />
            </div>

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: lightTokens.card, borderColor: lightTokens.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: lightTokens.muted }}>Fonty (volitelné)</label>
              <input
                type="text"
                style={C.inp}
                placeholder="Např. Inter, Playfair Display"
                value={brandFonts}
                onChange={(e) => setBrandFonts(e.target.value)}
                className="analyzer-inp rounded-xl"
              />
            </div>

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: lightTokens.card, borderColor: lightTokens.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: lightTokens.muted }}>Co chcete vyzařovat (volitelné)</label>
              <textarea
                style={{ ...C.inp, minHeight: 80 }}
                placeholder="Např. důvěra, profesionalita, teplo, energie, minimalismus…"
                value={toneOfVoice}
                onChange={(e) => setToneOfVoice(e.target.value)}
                className="analyzer-inp rounded-xl resize-y placeholder:text-zinc-500"
              />
            </div>

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: lightTokens.card, borderColor: lightTokens.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: lightTokens.muted }}>Stručně popište, co děláte (volitelné)</label>
              <textarea
                style={{ ...C.inp, minHeight: 88 }}
                placeholder={"Například:\nPomáhám ženám po mateřské nastavit online podnikání.\nVytvářím přírodní kosmetiku pro citlivou pleť.\nUčím firmy pracovat s vizuální identitou."}
                value={manualOptionalText}
                onChange={(e) => setManualOptionalText(e.target.value)}
                className="analyzer-inp rounded-xl resize-y placeholder:text-zinc-500"
              />
              <p className="text-[11px] mt-2" style={{ color: lightTokens.muted }}>Krátké. Konkrétní. Jasné.</p>
            </div>

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 text-center border" style={{ background: lightTokens.card, borderColor: lightTokens.border }}>
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
              <label htmlFor="pdfUpload" className="cursor-pointer transition block text-sm" style={{ color: lightTokens.muted }}>
                {brandFile ? `Vybrán soubor: ${brandFile.name}` : "Nahrajte textový PDF dokument (max 2 MB). Dokument by měl obsahovat pouze textové informace o značce."}
              </label>
              <p className="text-[11px] mt-2" style={{ color: lightTokens.muted }}>Dokument musí obsahovat skutečný text (ne naskenované obrázky).</p>
            </div>

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 text-center border" style={{ background: lightTokens.card, borderColor: lightTokens.border }}>
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
              <label htmlFor="imageUpload" className="cursor-pointer transition block text-sm" style={{ color: lightTokens.muted }}>
                {imageFile ? `Vybrán obrázek: ${imageFile.name}` : "Nahrajte jednu ukázku grafiky nebo fotografie (max 1 MB). Ideálně reprezentativní vizuál vaší značky."}
              </label>
              {imageFile && (
                <img src={URL.createObjectURL(imageFile)} alt="Náhled" className="mt-3 rounded-md max-h-40 mx-auto object-contain" />
              )}
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 10 }}>
            <div
              style={{
                padding: "10px 14px",
                background: `${lightTokens.error}18`,
                border: `1px solid ${lightTokens.error}40`,
                borderRadius: 12,
                color: lightTokens.error,
                fontSize: 13,
              }}
            >
              ⚠ {error}
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                style={{
                  marginTop: 8,
                  padding: "8px 14px",
                  background: "transparent",
                  border: `1px solid ${lightTokens.border}`,
                  borderRadius: 10,
                  color: lightTokens.muted,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Zkusit znovu
              </button>
            )}
          </div>
        )}
        <button
          type="button"
          style={{ ...C.btn, opacity: canSubmit ? 1 : 0.45 }}
          onClick={onAnalyze}
          disabled={!canSubmit}
        >
          {diagnostika && mode === "manual" ? "✨ Spustit strategický scan" : diagnostika ? "Analyzovat" : "Analyzovat →"}
        </button>
      </div>

      <div className={`analyzer-checklist-wrap ${isBrandScan ? "analyzer-checklist-wrap" : ""}`} style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
        {["Screenshot webu", "Analýza textu", "Brand DNA", "Skóre čitelnosti"].map((t) => (
          <span key={t} className="analyzer-checklist-item" style={{ color: lightTokens.muted }}>
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: LIME_MAIN, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#111", flexShrink: 0 }}>✓</span>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
