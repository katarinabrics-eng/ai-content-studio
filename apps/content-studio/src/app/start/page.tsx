"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function StartForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get("plan") || "basic";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const data = {
      plan_id: (form.querySelector("[name=plan_id]") as HTMLInputElement)?.value || planFromUrl,
      brand: (form.querySelector("[name=brand]") as HTMLInputElement)?.value ?? "",
      obor: (form.querySelector("[name=obor]") as HTMLInputElement)?.value ?? "",
      cil: (form.querySelector("[name=cil]") as HTMLInputElement)?.value ?? "",
      sit: (form.querySelector("[name=sit]") as HTMLSelectElement)?.value ?? "",
      tonalita: (form.querySelector("[name=tonalita]") as HTMLInputElement)?.value ?? "",
      poznamka: (form.querySelector("[name=poznamka]") as HTMLTextAreaElement)?.value ?? "",
      email: (form.querySelector("[name=email]") as HTMLInputElement)?.value ?? "",
    };

    try {
      const res = await fetch("/api/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Nepodařilo se vytvořit projekt.");
        setLoading(false);
        return;
      }
      if (json.magicLinkUrl) {
        router.push("/start/success?magicLinkUrl=" + encodeURIComponent(json.magicLinkUrl));
        return;
      }
      router.push("/start/success?projectCode=" + encodeURIComponent(json.projectCode ?? "") + "&pin=" + encodeURIComponent(json.pin ?? ""));
    } catch {
      setError("Chyba odeslání.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-lucifera-dark px-4 py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-white">Spustit test zdarma</h1>
        <p className="mt-2 text-white/70">Testovací provoz bez platby. Projekt se vytvoří ihned.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input type="hidden" name="plan_id" value={planFromUrl} />
          <div>
            <label className="block text-sm font-medium text-white/90">Značka / název *</label>
            <input name="brand" required className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/40" placeholder="Např. Moje firma" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90">Obor</label>
            <input name="obor" className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/40" placeholder="Např. poradenství" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90">Cíl komunikace</label>
            <input name="cil" className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/40" placeholder="Např. získat klienty" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90">Síť</label>
            <select name="sit" className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white">
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
              <option value="vse">Vše</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90">Tonalita</label>
            <input name="tonalita" className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/40" placeholder="Např. profesionální" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90">Poznámka</label>
            <textarea name="poznamka" rows={2} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/40" placeholder="Volitelně" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90">E-mail (volitelný)</label>
            <input type="email" name="email" className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/40" placeholder="napr@email.cz" />
            <p className="mt-1 text-xs text-white/50">Bez e-mailu dostanete kód a PIN pro přístup.</p>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-lime-primary w-full">
            {loading ? "Vytvářím projekt…" : "Vytvořit test projekt"}
          </button>
        </form>
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
