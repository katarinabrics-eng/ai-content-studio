"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";

function StartForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get("plan") || "test-week";
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<HTMLInputElement>(null);
  const brandPdfRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const data = {
      plan_id: planFromUrl,
      brand: (form.querySelector("[name=brand]") as HTMLInputElement)?.value ?? "",
      obor: (form.querySelector("[name=obor]") as HTMLInputElement)?.value ?? "",
      cil: (form.querySelector("[name=cil]") as HTMLInputElement)?.value ?? "",
      sit: (form.querySelector("[name=sit]") as HTMLSelectElement)?.value ?? "",
      tonalita: (form.querySelector("[name=tonalita]") as HTMLInputElement)?.value ?? "",
      poznamka: (form.querySelector("[name=poznamka]") as HTMLTextAreaElement)?.value ?? "",
      email: (form.querySelector("[name=email]") as HTMLInputElement)?.value ?? "",
      cilova_skupina: (form.querySelector("[name=cilova_skupina]") as HTMLInputElement)?.value ?? "",
      nabidky_produkty: (form.querySelector("[name=nabidky_produkty]") as HTMLTextAreaElement)?.value ?? "",
      zakazana_slova: (form.querySelector("[name=zakazana_slova]") as HTMLInputElement)?.value ?? "",
      preferovany_styl: (form.querySelector("[name=preferovany_styl]") as HTMLInputElement)?.value ?? "",
      preferovana_cta: (form.querySelector("[name=preferovana_cta]") as HTMLInputElement)?.value ?? "",
      url_pdf_autofill: (form.querySelector("[name=url_pdf_autofill]") as HTMLInputElement)?.value ?? "",
      brand_assets: {
        logo_url: (form.querySelector("[name=logo_url]") as HTMLInputElement)?.value ?? "",
        barvy: (form.querySelector("[name=barvy]") as HTMLInputElement)?.value ?? "",
        fonty: (form.querySelector("[name=fonty]") as HTMLInputElement)?.value ?? "",
        obrazky: (form.querySelector("[name=obrazky]") as HTMLTextAreaElement)?.value ?? "",
      },
    };

    const logo = logoRef.current?.files?.[0];
    const photos = Array.from(photosRef.current?.files ?? []);
    const brandPdf = brandPdfRef.current?.files?.[0];
    const hasFiles = (logo?.size ?? 0) > 0 || photos.some((f) => f.size > 0) || (brandPdf?.size ?? 0) > 0;

    try {
      let res: Response;
      if (hasFiles) {
        const formData = new FormData();
        formData.append("payload", JSON.stringify(data));
        if (logo) formData.append("logo", logo);
        photos.forEach((f) => formData.append("photos", f));
        if (brandPdf) formData.append("brandPdf", brandPdf);
        res = await fetch("/api/start", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof json.errorMessage === "string"
            ? json.errorMessage
            : typeof json.detail === "string"
              ? json.detail
              : json.error ?? "Nepodařilo se vytvořit projekt.";
        setError(msg);
        setLoading(false);
        return;
      }
      const projectCode = json.projectCode as string | undefined;
      router.push(projectCode ? `/start/success?code=${encodeURIComponent(projectCode)}` : "/start/success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Chyba odeslání.";
      setError(msg);
      setLoading(false);
    }
  }

  const inputClass = "mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/40";
  const labelClass = "block text-sm font-medium text-white/90";

  return (
    <main className="min-h-screen bg-lucifera-dark px-4 py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-white">Spustit projekt</h1>
        <p className="mt-2 text-white/70">
          Vyplňte údaje o vaší značce. Do 48 hodin dostanete první 3 návrhy příspěvků.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <section>
            <h2 className="text-lg font-semibold text-white">Základní informace</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className={labelClass}>Značka / název *</label>
                <input name="brand" required className={inputClass} placeholder="Např. Moje firma" />
              </div>
              <div>
                <label className={labelClass}>E-mail *</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  className={inputClass} 
                  placeholder="vas@email.cz" 
                />
                <p className="mt-1 text-xs text-white/50">Na tento e-mail vám zašleme hotové návrhy.</p>
              </div>
              <div>
                <label className={labelClass}>Obor *</label>
                <input name="obor" required className={inputClass} placeholder="Např. poradenství, e-shop, služby" />
              </div>
              <div>
                <label className={labelClass}>Cíl komunikace</label>
                <input name="cil" className={inputClass} placeholder="Např. získat klienty, budovat důvěru" />
              </div>
              <div>
                <label className={labelClass}>Síť</label>
                <select name="sit" className={inputClass}>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                  <option value="vse">Vše</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Web / profil</label>
                <input name="website_or_profile" type="url" className={inputClass} placeholder="https://…" />
              </div>
              <div>
                <label className={labelClass}>Tonalita / tón komunikace</label>
                <input name="tonalita" className={inputClass} placeholder="Např. profesionální, přátelský, hravý" />
              </div>
              <div>
                <label className={labelClass}>Poznámka</label>
                <textarea name="poznamka" rows={2} className={inputClass} placeholder="Další informace pro nás" />
              </div>
            </div>
          </section>

          <details
            open={advancedOpen}
            onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
            className="rounded-lg border border-white/20 bg-white/5"
          >
            <summary className="cursor-pointer list-none px-4 py-3 font-medium text-white [&::-webkit-details-marker]:hidden">
              Pokročilé upřesnění (volitelné)
            </summary>
            <div className="space-y-4 border-t border-white/10 px-4 py-4">
              <div>
                <label className={labelClass}>Cílová skupina</label>
                <input name="cilova_skupina" className={inputClass} placeholder="Např. majitelé firem 30–50 let" />
              </div>
              <div>
                <label className={labelClass}>Nabídky / produkty</label>
                <textarea name="nabidky_produkty" rows={2} className={inputClass} placeholder="Hlavní produkty nebo služby" />
              </div>
              <div>
                <label className={labelClass}>Zakázaná slova</label>
                <input name="zakazana_slova" className={inputClass} placeholder="Slova, která nemají být v textech" />
              </div>
              <div>
                <label className={labelClass}>Preferovaný styl</label>
                <input name="preferovany_styl" className={inputClass} placeholder="Např. minimalistický, hravý" />
              </div>
              <div>
                <label className={labelClass}>Preferovaná CTA</label>
                <input name="preferovana_cta" className={inputClass} placeholder="Např. Napište nám, Rezervujte si hovor" />
              </div>
              <div>
                <label className={labelClass}>Brand assets</label>
                <div className="mt-2 space-y-2">
                  <input name="logo_url" type="url" className={inputClass} placeholder="Logo URL" />
                  <input name="barvy" className={inputClass} placeholder="Barvy (hex nebo popis)" />
                  <input name="fonty" className={inputClass} placeholder="Fonty" />
                  <textarea name="obrazky" rows={1} className={inputClass} placeholder="Odkazy na obrázky (volitelně)" />
                </div>
              </div>
              <div>
                <label className={labelClass}>URL webu k analýze</label>
                <input name="url_pdf_autofill" type="url" className={inputClass} placeholder="Odkaz na web k rozboru" />
              </div>
              <div>
                <label className={labelClass}>Logo (PNG)</label>
                <input ref={logoRef} name="logo" type="file" accept=".png,image/png" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Fotky (JPEG/PNG)</label>
                <input ref={photosRef} name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Brand manuál (PDF)</label>
                <input ref={brandPdfRef} name="brandPdf" type="file" accept=".pdf,application/pdf" className={inputClass} />
              </div>
            </div>
          </details>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-lime-primary w-full text-zinc-900">
            {loading ? "Odesílám..." : "Odeslat a spustit projekt"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          Po odeslání vás budeme kontaktovat na uvedený e-mail.
        </p>
      </div>
    </main>
  );
}

export default function StartPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-white">Načítám…</div>}>
      <StartForm />
    </Suspense>
  );
}
