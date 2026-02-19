export default function HomePage() {
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

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold tracking-wide">AI CONTENT STUDIO LUCIFERA</p>
            <p className="text-xs text-stone-600">AI + kreativní kurátor</p>
          </div>
          <nav className="hidden gap-6 text-sm text-stone-700 md:flex">
            <a href="#jak-to-funguje" className="hover:text-stone-900">Jak to funguje</a>
            <a href="#proc-my" className="hover:text-stone-900">Proč my</a>
            <a href="#kontakt" className="hover:text-stone-900">Kontakt</a>
          </nav>
          <a
            href="#kontakt"
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
          >
            Poptat spolupráci
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-14 sm:px-6 lg:px-8 lg:pt-20">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm md:p-12">
          <p className="inline-flex rounded-full border border-stone-300 bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-stone-700">
            Nová služba Studia Lucifera
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Dáte nám přístup k brandu.
            <br />
            My vám dodáme příspěvky, které prodávají.
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-stone-700">
            AI Content Studio Lucifera spojuje rychlost AI a kvalitu živého člověka.
            Žádná náhoda: každý výstup prochází kreativním kurátorem, který dohlíží na
            funkčnost, směr a prvotřídní úroveň obsahu.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#kontakt"
              className="rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-800"
            >
              Chci návrh spolupráce
            </a>
            <a
              href="#jak-to-funguje"
              className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-100"
            >
              Zobrazit proces
            </a>
          </div>

          <div className="mt-8 grid gap-3 text-sm text-stone-700 md:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="font-semibold">Rychlý start</p>
              <p>První návrhy typicky do 48 hodin.</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="font-semibold">Brand-safe obsah</p>
              <p>Každý text prochází lidskou kontrolou.</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="font-semibold">Bez chaosu</p>
              <p>Stabilní publikační rytmus i jasný plán.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-2xl font-bold tracking-tight">Proč běžný AI obsah často selhává</h2>
            <ul className="mt-4 space-y-2 text-stone-700">
              <li>• Je generický a neodpovídá hlasu značky</li>
              <li>• Chybí mu strategický záměr</li>
              <li>• Nemá konzistentní kvalitu</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-2xl font-bold tracking-tight">Jak to řešíme my</h2>
            <ul className="mt-4 space-y-2 text-stone-700">
              <li>• AI pro rychlost a škálu</li>
              <li>• Kurátor pro značku, smysl a kvalitu</li>
              <li>• Výstup připravený rovnou k publikaci</li>
            </ul>
          </article>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="jak-to-funguje" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Jak spolupráce probíhá</h2>
        <p className="mt-3 max-w-3xl text-stone-700">
          Jednoduchý proces, který drží vysoký standard: rychlost AI + kontrola živým člověkem.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {steps.map((step) => (
            <article key={step.title} className="rounded-2xl border border-stone-200 bg-white p-6">
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-stone-700">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* DIFFERENTIATOR */}
      <section id="proc-my" className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-8">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Žádná náhoda. AI + kreativní kurátor.
          </h2>
          <p className="mt-4 max-w-3xl text-stone-800">
            Nejsme generátor textů. Jsme produkční systém, který dává vašemu obsahu tempo,
            kvalitu a značkovou přesnost. Když je potřeba, kurátor zasáhne ručně, aby výsledek
            byl prvotřídní a funkční.
          </p>
        </div>
      </section>

      {/* OUTPUTS */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Co od nás dostanete</h2>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {outputs.map((item) => (
            <div key={item} className="rounded-2xl border border-stone-200 bg-white p-5 text-stone-800">
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Často kladené otázky</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="rounded-2xl border border-stone-200 bg-white p-5">
              <summary className="cursor-pointer list-none font-semibold">{faq.q}</summary>
              <p className="mt-3 text-stone-700">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="kontakt" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-stone-900 p-8 text-stone-100 md:p-12">
          <h2 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            Chcete obsah, který je rychlý, brandový a opravdu funguje?
          </h2>
          <p className="mt-4 max-w-2xl text-stone-300">
            Pošlete nám krátké info o značce a cíli. Připravíme návrh spolupráce bez omáčky.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="mailto:kontakt@studiolucifera.cz?subject=Poptavka%20AI%20Content%20Studio"
              className="rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-800"
            >
              Napsat na kontakt@studiolucifera.cz
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-600">
        © {new Date().getFullYear()} AI Content Studio Lucifera
      </footer>
    </main>
  );
}
