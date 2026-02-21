"use client";

import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const inputClass =
  "mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-lucifera-lime/50 focus:outline-none";
const labelClass = "block text-sm font-medium text-white/90";

export default function ClientBriefPage() {
  const params = useParams();
  const router = useRouter();
  const projectCode = params.projectCode as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectStatus, setProjectStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/client/project?code=${encodeURIComponent(projectCode)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.project) {
          setProjectStatus(d.project.status);
        }
      })
      .catch(() => {});
  }, [projectCode]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const data = {
      brand: (form.querySelector("[name=brand]") as HTMLInputElement)?.value ?? "",
      obor: (form.querySelector("[name=obor]") as HTMLInputElement)?.value ?? "",
      cil: (form.querySelector("[name=cil]") as HTMLInputElement)?.value ?? "",
      sit: (form.querySelector("[name=sit]") as HTMLSelectElement)?.value ?? "instagram",
      tonalita: (form.querySelector("[name=tonalita]") as HTMLInputElement)?.value ?? "",
      poznamka: (form.querySelector("[name=poznamka]") as HTMLTextAreaElement)?.value ?? "",
      email: (form.querySelector("[name=email]") as HTMLInputElement)?.value ?? "",
      cilova_skupina: (form.querySelector("[name=cilova_skupina]") as HTMLInputElement)?.value ?? "",
      nabidky_produkty: (form.querySelector("[name=nabidky_produkty]") as HTMLTextAreaElement)?.value ?? "",
      zakazana_slova: (form.querySelector("[name=zakazana_slova]") as HTMLInputElement)?.value ?? "",
      preferovany_styl: (form.querySelector("[name=preferovany_styl]") as HTMLInputElement)?.value ?? "",
      preferovana_cta: (form.querySelector("[name=preferovana_cta]") as HTMLInputElement)?.value ?? "",
      brand_name: (form.querySelector("[name=brand]") as HTMLInputElement)?.value ?? "",
      industry: (form.querySelector("[name=obor]") as HTMLInputElement)?.value ?? "",
      communication_goal: (form.querySelector("[name=cil]") as HTMLInputElement)?.value ?? "",
      tone_of_voice: (form.querySelector("[name=tonalita]") as HTMLInputElement)?.value ?? "",
      website_or_profile: (form.querySelector("[name=website]") as HTMLInputElement)?.value ?? "",
      note: (form.querySelector("[name=poznamka]") as HTMLTextAreaElement)?.value ?? "",
      target_audience: (form.querySelector("[name=cilova_skupina]") as HTMLInputElement)?.value ?? "",
      offers: (form.querySelector("[name=nabidky_produkty]") as HTMLTextAreaElement)?.value ?? "",
      forbidden_words: (form.querySelector("[name=zakazana_slova]") as HTMLInputElement)?.value ?? "",
      preferred_style: (form.querySelector("[name=preferovany_styl]") as HTMLInputElement)?.value ?? "",
      preferred_cta: (form.querySelector("[name=preferovana_cta]") as HTMLInputElement)?.value ?? "",
      plan_id: "test-week-800",
    };

    try {
      const res = await fetch(`/api/client/brief?code=${encodeURIComponent(projectCode)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.ok) {
        router.push(`/client/${encodeURIComponent(projectCode)}`);
        return;
      }
      setError(json.error ?? json.missing?.join(", ") ?? "Nepodařilo se odeslat dotazník.");
    } catch {
      setError("Chyba odeslání.");
    } finally {
      setLoading(false);
    }
  }

  if (projectStatus && !["PAID", "WAITING_BRIEF"].includes(projectStatus)) {
    return (
      <main className="min-h-screen bg-lucifera-dark flex items-center justify-center px-4">
        <div className="glass-panel max-w-md p-8 text-center">
          <h1 className="text-xl font-bold text-white">Dotazník již byl odeslán</h1>
          <p className="mt-4 text-white/70">
            Váš projekt je v další fázi. Sledujte stav zakázky na dashboardu.
          </p>
          <a
            href={`/client/${encodeURIComponent(projectCode)}`}
            className="btn-lime-primary mt-6 inline-block"
          >
            Zpět na dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-lucifera-dark px-4 py-12">
      <div className="mx-auto max-w-lg">
        <a
          href={`/client/${encodeURIComponent(projectCode)}`}
          className="text-sm text-white/50 hover:text-white/70"
        >
          ← Zpět na dashboard
        </a>
        <h1 className="mt-4 text-2xl font-bold text-white">Vyplnit dotazník</h1>
        <p className="mt-2 text-white/70">
          Vyplňte údaje o vaší značce. Na jejich základě připravíme návrhy příspěvků.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="glass-panel p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Základní informace</h2>
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
            </div>
            <div>
              <label className={labelClass}>Obor *</label>
              <input name="obor" required className={inputClass} placeholder="Např. poradenství, e-shop" />
            </div>
            <div>
              <label className={labelClass}>Cíl komunikace *</label>
              <input name="cil" required className={inputClass} placeholder="Např. získat klienty" />
            </div>
            <div>
              <label className={labelClass}>Síť *</label>
              <select name="sit" className={inputClass} required>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="vse">Vše</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Web / profil</label>
              <input name="website" type="url" className={inputClass} placeholder="https://…" />
            </div>
            <div>
              <label className={labelClass}>Tonalita / tón *</label>
              <input
                name="tonalita"
                required
                className={inputClass}
                placeholder="Např. profesionální, přátelský"
              />
            </div>
            <div>
              <label className={labelClass}>Poznámka</label>
              <textarea name="poznamka" rows={2} className={inputClass} placeholder="Další informace" />
            </div>
          </section>

          <section className="glass-panel p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Volitelné upřesnění</h2>
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
              <input name="preferovany_styl" className={inputClass} placeholder="Např. minimalistický" />
            </div>
            <div>
              <label className={labelClass}>Preferovaná CTA</label>
              <input name="preferovana_cta" className={inputClass} placeholder="Např. Napište nám" />
            </div>
          </section>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-lime-primary w-full text-zinc-900"
          >
            {loading ? "Odesílám…" : "Odeslat dotazník"}
          </button>
        </form>
      </div>
    </main>
  );
}
