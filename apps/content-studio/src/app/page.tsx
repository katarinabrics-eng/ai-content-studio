import { HeroImageFull, SectionImages } from "./components/HomePlaceholders";

const steps = [
  {
    title: "1) Brand onboarding",
    text: "Předáte nám brand manuál, tone of voice, cílovku a cíle komunikace.",
  },
  {
    title: "2) AI návrhy",
    text: "AI připraví rychlé koncepty příspěvků, hooky, varianty CTA a obsahové úhly.",
  },
  {
    title: "3) Kreativní kurátor",
    text: "Živý člověk kontroluje kvalitu, kontext, argumentaci i soulad se značkou.",
  },
  {
    title: "4) Hotový balík",
    text: "Dostanete příspěvky připravené k publikaci v jasném redakčním plánu.",
  },
];

const outputs = [
  "Měsíční content plán pro vaše sítě",
  "Příspěvky připravené k publikaci",
  "Hooky, CTA a varianty textů pro testování",
  "Brand-safe kontrola každého výstupu",
  "Rychlé iterace bez ztráty kvality",
  "Stabilní rytmus publikace bez chaosu",
];

const faqs = [
  {
    q: "Čím se lišíte od běžných AI generátorů?",
    a: "Neprodáváme surový AI text. Každý výstup prochází kreativním kurátorem, který hlídá kvalitu, kontext a značkovou přesnost.",
  },
  {
    q: "Za jak dlouho dostaneme první obsah?",
    a: "První návrhy obvykle dodáváme do 48 hodin od kompletního brand onboardingu.",
  },
  {
    q: "Musíme mít hotový detailní brand manuál?",
    a: "Ne. Stačí základní podklady a společně nastavíme tonality, témata i hranice komunikace.",
  },
  {
    q: "Umíte přizpůsobit obsah různým sítím?",
    a: "Ano. Připravujeme obsah podle formátu a publika jednotlivých platforem (např. IG, LinkedIn, FB).",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fafaf9] text-stone-900">
      {/* NAV — veřejná, bez interních odkazů */}
      <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-[#fafaf9]/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="focus:outline-none">
            <span className="text-sm font-semibold tracking-wide text-stone-800">AI CONTENT STUDIO LUCIFERA</span>
            <span className="ml-2 text-xs text-stone-500">AI + kreativní kurátor</span>
          </a>
          <nav className="hidden gap-8 text-sm text-stone-600 md:flex">
            <a href="#jak-to-funguje" className="transition-colors hover:text-stone-900">Jak to funguje</a>
            <a href="#proc-my" className="transition-colors hover:text-stone-900">Proč my</a>
            <a href="#vystupy" className="transition-colors hover:text-stone-900">Výstupy</a>
            <a href="#faq" className="transition-colors hover:text-stone-900">FAQ</a>
            <a href="#kontakt" className="transition-colors hover:text-stone-900">Kontakt</a>
          </nav>
          <a
            href="#kontakt"
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-800"
          >
            Poptat spolupráci
          </a>
        </div>
      </header>

      {/* HERO — full screen / full width, 2 sloupce (copy vlevo, vizuál vpravo), na mobile 1 sloupec */}
      <section className="min-h-screen w-full relative overflow-hidden bg-[#fafaf9]">
        <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-16 lg:px-12 xl:px-16">
            <p className="inline-flex w-fit rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1 text-xs font-medium uppercase tracking-wide text-amber-900/80">
              Nová služba Studia Lucifera
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-[1.12] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
              Dáte nám přístup k brandu.
              <br />
              My vám dodáme příspěvky, které prodávají.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
              Žádná náhoda. AI + kreativní kurátor. Živý člověk dohlíží na kvalitu a zasahuje, když je třeba.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#kontakt"
                className="rounded-full bg-amber-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
              >
                Chci návrh spolupráce
              </a>
              <a
                href="#jak-to-funguje"
                className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                Zobrazit proces
              </a>
            </div>
            <div className="mt-10 grid gap-4 text-sm text-stone-600 sm:grid-cols-3">
              <div>
                <p className="font-semibold text-stone-800">Rychlý start</p>
                <p className="mt-1">První návrhy typicky do 48 hodin.</p>
              </div>
              <div>
                <p className="font-semibold text-stone-800">Brand-safe obsah</p>
                <p className="mt-1">Každý text prochází lidskou kontrolou.</p>
              </div>
              <div>
                <p className="font-semibold text-stone-800">Bez chaosu</p>
                <p className="mt-1">Stabilní publikační rytmus i jasný plán.</p>
              </div>
            </div>
          </div>
          <div className="relative min-h-[50vh] w-full lg:min-h-screen">
            <HeroImageFull />
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-stone-200/80 bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <h2 className="text-xl font-bold tracking-tight text-stone-900">Proč běžný AI obsah často selhává</h2>
            <ul className="mt-4 space-y-2 text-stone-600">
              <li>• Je generický a neodpovídá hlasu značky</li>
              <li>• Chybí mu strategický záměr</li>
              <li>• Nemá konzistentní kvalitu</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-stone-200/80 bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <h2 className="text-xl font-bold tracking-tight text-stone-900">Jak to řešíme my</h2>
            <ul className="mt-4 space-y-2 text-stone-600">
              <li>• AI pro rychlost a škálu</li>
              <li>• Kurátor pro značku, smysl a kvalitu</li>
              <li>• Výstup připravený rovnou k publikaci</li>
            </ul>
          </article>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SectionImages count={3} />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="jak-to-funguje" className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">Jak spolupráce probíhá</h2>
        <p className="mt-3 max-w-2xl text-stone-600">
          Jednoduchý proces, který drží vysoký standard: rychlost AI + kontrola živým člověkem.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {steps.map((step) => (
            <article
              key={step.title}
              className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
            >
              <h3 className="text-lg font-semibold text-stone-900">{step.title}</h3>
              <p className="mt-2 text-stone-600">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* DIFFERENTIATOR */}
      <section id="proc-my" className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-stone-50/90 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
            Žádná náhoda. AI + kreativní kurátor.
          </h2>
          <p className="mt-4 max-w-3xl text-stone-700">
            Nejsme generátor textů. Jsme produkční systém, který dává vašemu obsahu tempo,
            kvalitu a značkovou přesnost. Když je potřeba, kurátor zasáhne ručně, aby výsledek
            byl prvotřídní a funkční.
          </p>
        </div>
      </section>

      {/* OUTPUTS */}
      <section id="vystupy" className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">Co od nás dostanete</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {outputs.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-stone-200/80 bg-white p-5 text-stone-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">Často kladené otázky</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-stone-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
            >
              <summary className="cursor-pointer list-none font-semibold text-stone-900 [&::-webkit-details-marker]:hidden">
                {faq.q}
              </summary>
              <p className="mt-3 text-stone-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="kontakt" className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-stone-900 p-8 text-stone-100 shadow-xl md:p-12">
          <h2 className="max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
            Chcete obsah, který je rychlý, brandový a opravdu funguje?
          </h2>
          <p className="mt-4 max-w-2xl text-stone-400">
            Pošlete nám krátké info o značce a cíli. Připravíme návrh spolupráce bez omáčky.
          </p>
          <div className="mt-8">
            <a
              href="mailto:kontakt@studiolucifera.cz?subject=Poptavka%20AI%20Content%20Studio"
              className="inline-flex rounded-full bg-amber-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
            >
              Napsat na kontakt@studiolucifera.cz
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200/80 py-8 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} AI Content Studio Lucifera
      </footer>
    </main>
  );
}
