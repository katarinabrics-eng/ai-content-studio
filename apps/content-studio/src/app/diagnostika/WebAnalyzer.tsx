"use client";

import { ChoiceButton } from "@/components/ChoiceButton";
import { tokens } from "@/lib/design-tokens";
import {
  MANUAL_OFFER_TYPES,
  MANUAL_AUDIENCE,
  MANUAL_PRICE_LEVELS,
  MANUAL_STYLE_OPTIONS,
  MAX_OFFER_SELECT,
  MAX_AUDIENCE_SELECT,
} from "@/lib/diagnostika-manual";

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
  const canSubmit = (mode === "web" && url.trim()) || (diagnostika && mode === "manual" && hasManualInput);
  return (
    <div className="analyzer-fade">
      {diagnostika && (
        <section className="relative max-w-4xl mx-auto mb-20 px-6">
          {/* Záře pod velkým oknem – vrstvený efekt (měkká + výraznější) */}
          <div className="absolute inset-0 -z-20 blur-[100px] opacity-25 rounded-full scale-150" style={{ background: `radial-gradient(ellipse 80% 50% at 50% 70%, ${tokens.colors.primary}50, transparent 70%)` }} />
          <div className="absolute inset-0 -z-10 blur-3xl opacity-40 rounded-full" style={{ background: `linear-gradient(to right, ${tokens.colors.primary}60, ${tokens.colors.accent}60)` }} />
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: tokens.colors.accent }}>Strategický vstup</p>
            <h2 className="text-4xl md:text-5xl font-semibold mb-6" style={{ color: tokens.colors.text }}>Analýza vizuální úrovně značky</h2>
            <p className="max-w-2xl mx-auto leading-relaxed" style={{ color: tokens.colors.muted }}>
              Diskrétní orientační rozbor toho, jak vaše značka působí navenek. Ukážeme vám silné body, slabá místa a jeden možný směr dalšího rozvoje.
            </p>
          </div>
          <div className="rounded-3xl p-10 backdrop-blur-xl border" style={{ background: tokens.colors.card, borderColor: tokens.colors.border }}>
            <p className="leading-relaxed mb-8" style={{ color: tokens.colors.muted }}>
              Tato ukázková analýza je vstupní fází před strategickou konzultací. Plná diagnostika a vizuální board jsou součástí placené spolupráce.
            </p>
            <div className="h-px mb-8" style={{ background: `linear-gradient(to right, transparent, ${tokens.colors.border}, transparent)` }} />
            <p className="text-sm uppercase tracking-widest mb-6" style={{ color: tokens.colors.muted }}>Jak to probíhá</p>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="rounded-2xl p-6 border" style={{ background: tokens.colors.bg, borderColor: tokens.colors.border }}>
                <div className="text-lg mb-3" style={{ color: tokens.colors.accent }}>01</div>
                <span style={{ color: tokens.colors.muted }}>Zadáte web nebo podklady o značce.</span>
              </div>
              <div className="rounded-2xl p-6 border" style={{ background: tokens.colors.bg, borderColor: tokens.colors.border }}>
                <div className="text-lg mb-3" style={{ color: tokens.colors.accent }}>02</div>
                <span style={{ color: tokens.colors.muted }}>Získáte orientační analýzu a návrh jednoho směru.</span>
              </div>
              <div className="rounded-2xl p-6 border" style={{ background: tokens.colors.bg, borderColor: tokens.colors.border }}>
                <div className="text-lg mb-3" style={{ color: tokens.colors.accent }}>03</div>
                <span style={{ color: tokens.colors.muted }}>Pokud dává smysl pokračovat, rezervujete termín a zahájíme spolupráci.</span>
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
            borderRadius: 9999,
            background: `${tokens.colors.accent}18`,
            border: `1px solid ${tokens.colors.accent}40`,
            color: tokens.colors.accent,
            fontSize: 11,
            marginBottom: 18,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: tokens.colors.accent }} />
          {diagnostika ? "Ukázková analýza" : "Modul 1 · Analýza značky"}
        </span>
        <h1 style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.3, marginBottom: 10, color: tokens.colors.text }}>
          Zadejte web.
          <br />
          <span style={{ color: tokens.colors.muted }}>Zbytek uděláme za vás.</span>
        </h1>
      </div>

      <div className={diagnostika ? "backdrop-blur-xl rounded-3xl p-10" : ""} style={diagnostika ? { background: tokens.colors.card, border: `1px solid ${tokens.colors.border}` } : C.card}>
        {diagnostika && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-full p-1 border" style={{ background: tokens.colors.bg, borderColor: tokens.colors.border }}>
              <button
                type="button"
                onClick={() => setMode("web")}
                className="px-6 py-2 rounded-full text-sm transition"
                style={mode === "web" ? { background: tokens.colors.accent, color: "#000" } : { color: tokens.colors.muted }}
              >
                Mám web
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className="px-6 py-2 rounded-full text-sm transition"
                style={mode === "manual" ? { background: tokens.colors.accent, color: "#000" } : { color: tokens.colors.muted }}
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
              <h2 className="text-xl md:text-2xl font-semibold mb-1" style={{ color: tokens.colors.text }}>Nemáte web?</h2>
              <p className="text-sm md:text-base" style={{ color: tokens.colors.muted }}>Stačí pár informací. Provedeme vás.</p>
            </div>

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: tokens.colors.card, borderColor: tokens.colors.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: tokens.colors.muted }}>Název značky / jméno</label>
              <input
                type="text"
                style={C.inp}
                placeholder="Např. Jana Nováková Coaching"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="analyzer-inp rounded-xl"
              />
            </div>

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: tokens.colors.card, borderColor: tokens.colors.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: tokens.colors.muted }}>Co nabízíte (max 1–2)</label>
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

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: tokens.colors.card, borderColor: tokens.colors.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: tokens.colors.muted }}>Pro koho (max 2)</label>
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

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: tokens.colors.card, borderColor: tokens.colors.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: tokens.colors.muted }}>Cenová úroveň</label>
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

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: tokens.colors.card, borderColor: tokens.colors.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: tokens.colors.muted }}>Preferovaný styl (volitelné)</label>
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

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: tokens.colors.card, borderColor: tokens.colors.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: tokens.colors.muted }}>Barvy značky (volitelné)</label>
              <input
                type="text"
                style={C.inp}
                placeholder="Např. #1a1a2e, #16213e, #e94560"
                value={brandColors}
                onChange={(e) => setBrandColors(e.target.value)}
                className="analyzer-inp rounded-xl"
              />
            </div>

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: tokens.colors.card, borderColor: tokens.colors.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: tokens.colors.muted }}>Fonty (volitelné)</label>
              <input
                type="text"
                style={C.inp}
                placeholder="Např. Inter, Playfair Display"
                value={brandFonts}
                onChange={(e) => setBrandFonts(e.target.value)}
                className="analyzer-inp rounded-xl"
              />
            </div>

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: tokens.colors.card, borderColor: tokens.colors.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: tokens.colors.muted }}>Co chcete vyzařovat (volitelné)</label>
              <textarea
                style={{ ...C.inp, minHeight: 80 }}
                placeholder="Např. důvěra, profesionalita, teplo, energie, minimalismus…"
                value={toneOfVoice}
                onChange={(e) => setToneOfVoice(e.target.value)}
                className="analyzer-inp rounded-xl resize-y placeholder:text-zinc-500"
              />
            </div>

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 border" style={{ background: tokens.colors.card, borderColor: tokens.colors.border }}>
              <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: tokens.colors.muted }}>Stručně popište, co děláte (volitelné)</label>
              <textarea
                style={{ ...C.inp, minHeight: 88 }}
                placeholder={"Například:\nPomáhám ženám po mateřské nastavit online podnikání.\nVytvářím přírodní kosmetiku pro citlivou pleť.\nUčím firmy pracovat s vizuální identitou."}
                value={manualOptionalText}
                onChange={(e) => setManualOptionalText(e.target.value)}
                className="analyzer-inp rounded-xl resize-y placeholder:text-zinc-500"
              />
              <p className="text-[11px] mt-2" style={{ color: tokens.colors.muted }}>Krátké. Konkrétní. Jasné.</p>
            </div>

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 text-center border" style={{ background: tokens.colors.card, borderColor: tokens.colors.border }}>
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
              <label htmlFor="pdfUpload" className="cursor-pointer transition block text-sm" style={{ color: tokens.colors.muted }}>
                {brandFile ? `Vybrán soubor: ${brandFile.name}` : "Nahrajte textový PDF dokument (max 2 MB). Dokument by měl obsahovat pouze textové informace o značce."}
              </label>
              <p className="text-[11px] mt-2" style={{ color: tokens.colors.muted }}>Dokument musí obsahovat skutečný text (ne naskenované obrázky).</p>
            </div>

            <div className="rounded-2xl px-6 py-6 md:px-8 md:py-8 text-center border" style={{ background: tokens.colors.card, borderColor: tokens.colors.border }}>
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
              <label htmlFor="imageUpload" className="cursor-pointer transition block text-sm" style={{ color: tokens.colors.muted }}>
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
                background: `${tokens.colors.error}18`,
                border: `1px solid ${tokens.colors.error}40`,
                borderRadius: 12,
                color: tokens.colors.error,
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
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: 10,
                  color: tokens.colors.muted,
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
          style={{ ...C.btn, opacity: canSubmit ? 1 : 0.3 }}
          onClick={onAnalyze}
          disabled={!canSubmit}
        >
          {diagnostika && mode === "manual" ? "✨ Spustit strategický scan" : diagnostika ? "Analyzovat" : "Analyzovat →"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
        {["Screenshot webu", "Analýza textu", "Claude Vision", "Brand DNA"].map((t) => (
          <span key={t} style={{ fontSize: 10, color: tokens.colors.muted }}>✓ {t}</span>
        ))}
      </div>
    </div>
  );
}
