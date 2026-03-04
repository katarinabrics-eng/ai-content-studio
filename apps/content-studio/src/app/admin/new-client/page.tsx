"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChoiceButton } from "@/components/ChoiceButton";
import {
  MANUAL_OFFER_TYPES,
  MANUAL_AUDIENCE,
  MANUAL_PRICE_LEVELS,
  MAX_OFFER_SELECT,
  MAX_AUDIENCE_SELECT,
  buildManualData,
} from "@/lib/diagnostika-manual";
import { tokens } from "@/lib/design-tokens";

const inputClass =
  "w-full rounded-lg bg-[#0F0F0F] border border-white/[0.08] px-4 py-2.5 text-[#F5F5F5] placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-[#A8EB12]/50";
const labelClass = "block text-sm font-medium text-[#888] mb-1.5";

export default function AdminNewClientPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"web" | "manual">("web");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [webUrl, setWebUrl] = useState("");

  // Manual-only state
  const [brandName, setBrandName] = useState("");
  const [offerTypes, setOfferTypes] = useState<string[]>([]);
  const [audience, setAudience] = useState<string[]>([]);
  const [priceLevel, setPriceLevel] = useState<string | null>(null);
  const [manualOptionalText, setManualOptionalText] = useState("");
  const [brandFile, setBrandFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasManualInput =
    brandName.trim() &&
    (offerTypes.length > 0 ||
      audience.length > 0 ||
      priceLevel ||
      manualOptionalText.trim() ||
      brandFile ||
      imageFile);

  const canSubmit =
    name.trim() &&
    (mode === "web" ? webUrl.trim() : hasManualInput);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setError(null);
    setLoading(true);
    try {
      let result: Record<string, unknown>;
      let webUrlToSave: string | undefined;
      let manualInputToSave: string | undefined;

      if (mode === "web") {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: webUrl.trim(), format: "diagnostika" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Analýza selhala.");
        result = data.result as Record<string, unknown>;
        webUrlToSave = webUrl.trim();
      } else {
        const manualData = buildManualData({
          brandName,
          offerTypes,
          audience,
          priceLevel,
          manualOptionalText,
        });
        const body: Record<string, unknown> = {
          manualData,
          format: "diagnostika",
        };
        if (brandFile) {
          const base64 = await new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve((r.result as string).split(",")[1] ?? "");
            r.onerror = reject;
            r.readAsDataURL(brandFile);
          });
          body.pdfBase64 = base64;
        }
        if (imageFile) {
          const base64 = await new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve((r.result as string).split(",")[1] ?? "");
            r.onerror = reject;
            r.readAsDataURL(imageFile);
          });
          body.imageBase64 = base64;
          body.imageMimeType = imageFile.type;
        }
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Analýza selhala.");
        result = data.result as Record<string, unknown>;
        manualInputToSave = manualData;
      }

      const saveRes = await fetch("/api/diagnostika/save-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webUrl: webUrlToSave,
          manualInput: manualInputToSave,
          result,
          name: name.trim() || undefined,
          email: email.trim() || undefined,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData?.error ?? "Uložení projektu selhalo.");
      router.push("/admin/clients");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Něco se pokazilo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-[#F5F5F5] mb-1">
        Nový klient
      </h1>
      <p className="text-sm text-[#888] mb-8">
        Zadejte údaje a spusťte AI diagnostiku z webu nebo z manuálních podkladů.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-white/[0.06] bg-[#141414] p-6"
        style={{ boxShadow: "0 0 40px rgba(168,235,18,0.04)" }}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Jméno klienta</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Firma nebo jméno"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="klient@email.cz"
              className={inputClass}
            />
          </div>

          <div className="pt-2">
            <span className={labelClass}>Zdroj podkladů</span>
            <div className="inline-flex rounded-full p-1 border border-white/[0.08] bg-[#0F0F0F]">
              <button
                type="button"
                onClick={() => { setMode("web"); setError(null); }}
                className="px-5 py-2 rounded-full text-sm font-medium transition"
                style={
                  mode === "web"
                    ? { background: tokens.colors.accent, color: "#000" }
                    : { color: "#888" }
                }
              >
                Mám web
              </button>
              <button
                type="button"
                onClick={() => { setMode("manual"); setError(null); }}
                className="px-5 py-2 rounded-full text-sm font-medium transition"
                style={
                  mode === "manual"
                    ? { background: tokens.colors.accent, color: "#000" }
                    : { color: "#888" }
                }
              >
                Nemám web
              </button>
            </div>
          </div>

          {mode === "web" && (
            <div>
              <label className={labelClass}>Web URL</label>
              <input
                type="url"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="https://…"
                className={inputClass}
                required={mode === "web"}
              />
            </div>
          )}

          {mode === "manual" && (
            <div className="space-y-6 pt-2 border-t border-white/[0.06]">
              <div>
                <label className={labelClass}>Název značky / jméno</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Např. Jana Nováková Coaching"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Co nabízíte (max 1–2)</label>
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
              <div>
                <label className={labelClass}>Pro koho (max 2)</label>
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
              <div>
                <label className={labelClass}>Cenová úroveň</label>
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
              <div>
                <label className={labelClass}>Stručně popište, co děláte (volitelné)</label>
                <textarea
                  value={manualOptionalText}
                  onChange={(e) => setManualOptionalText(e.target.value)}
                  placeholder="Např. Pomáhám ženám po mateřské nastavit online podnikání."
                  className={`${inputClass} min-h-[88px] resize-y`}
                  rows={3}
                />
              </div>
              <div>
                <label className={labelClass}>PDF (max 2 MB, volitelné)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      setError("Soubor je příliš velký. Maximálně 2 MB.");
                      return;
                    }
                    setBrandFile(file);
                  }}
                  className="block w-full text-sm text-[#888] file:mr-3 file:rounded file:border-0 file:bg-[#A8EB12]/20 file:px-3 file:py-1.5 file:text-[#A8EB12]"
                />
                {brandFile && <p className="text-xs text-[#666] mt-1">Vybráno: {brandFile.name}</p>}
              </div>
              <div>
                <label className={labelClass}>Obrázek značky (max 1 MB, volitelné)</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 1024 * 1024) {
                      setError("Obrázek je příliš velký. Maximálně 1 MB.");
                      return;
                    }
                    setImageFile(file);
                  }}
                  className="block w-full text-sm text-[#888] file:mr-3 file:rounded file:border-0 file:bg-[#A8EB12]/20 file:px-3 file:py-1.5 file:text-[#A8EB12]"
                />
                {imageFile && (
                  <p className="text-xs text-[#666] mt-1">Vybráno: {imageFile.name}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="inline-flex items-center justify-center rounded-lg bg-[#A8EB12] px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-[#b8f022] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzuji…" : "Spustit AI diagnostiku"}
          </button>
          <Link
            href="/admin/clients"
            className="inline-flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-[#888] hover:bg-white/[0.08] transition-colors"
          >
            ← Zpět na klienty
          </Link>
        </div>
      </form>
    </div>
  );
}
