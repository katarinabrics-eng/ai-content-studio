import { HeroImageFull, SectionImages } from "./components/HomePlaceholders";

const processSteps = [
  { title: "Vyberete tarif", text: "Zvolíte balíček podle tempa, které vaše značka právě potřebuje." },
  { title: "Vyplníte formulář", text: "Krátký onboarding. Předáte nám brand, cílovku a tón komunikace.", day: "Pondělí" },
  { title: "Dostanete 3 návrhy", text: "Do 24–48 hodin vám pošleme konkrétní příspěvky připravené ke schválení.", day: "Úterý/Středa" },
  { title: "Schválíte nebo připomínkujete", text: "Pokud máte námitky, obratem je zapracujeme.", day: "Čtvrtek" },
  { title: "Máte hotovo", text: "Do dalšího dne máte finální verzi připravenou k propagaci.", day: "Pátek" },
];

const faqs = [
  {
    q: "Je potřeba hodně schůzek a callů?",
    a: "Ne. Náš systém je postavený tak, abyste nemuseli trávit hodiny na meetinzích. Spolupráce je asynchronní a rychlá.",
  },
  {
    q: "Co když s návrhem nesouhlasíme?",
    a: "To se může stát. Jednoduše nám pošlete své námitky, my je upravíme a do dalšího dne vám dodáme finální, vyladěnou verzi.",
  },
  {
    q: "Jak rychle uvidíme první výstupy?",
    a: "První 3 návrhy od nás standardně dostanete do 24–48 hodin od dodání podkladů.",
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
            <a href="#problem" className="transition-colors hover:text-stone-900">Problém</a>
            <a href="#reseni" className="transition-colors hover:text-stone-900">Řešení</a>
            <a href="#proc-my" className="transition-colors hover:text-stone-900">Proč my</a>
            <a href="#faq" className="transition-colors hover:text-stone-900">FAQ</a>
            <a href="#kontakt" className="transition-colors hover:text-stone-900">Kontakt</a>
          </nav>
          <a
            href="#kontakt"
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-800"
          >
            Zvolit tarif
          </a>
        </div>
      </header>

      {/* HERO — full screen / full width, 2 sloupce (copy vlevo, vizuál vpravo), na mobile 1 sloupec */}
      <section className="min-h-screen w-full relative overflow-hidden bg-[#fafaf9]">
        <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-16 lg:px-12 xl:px-16">
            <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
              Tvorba sítí nemá být každodenní boj. Věnujte se své profesi, obsah nechte na nás.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
              Znáte to: zahlcení, paralýza před prázdnou obrazovkou a pocit, že „zase nic nevyšlo“. AI Content Studio Lucifera vám vrátí klid. Vyplníte krátký formulář a my vám do 48 hodin dodáme první příspěvky. Bez chaosu, bez dlouhých schůzek.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#kontakt"
                className="rounded-full bg-amber-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
              >
                Chci si odlehčit tvorbu a vybrat tarif
              </a>
              <a
                href="#jak-to-funguje"
                className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                Jak probíhá spolupráce
              </a>
            </div>
            <p className="mt-6 text-sm font-medium text-stone-700">
              V pondělí dodáte data. V pátek publikujete.
            </p>
          </div>
          <div className="relative min-h-[50vh] w-full lg:min-h-screen">
            <HeroImageFull />
          </div>
        </div>
      </section>

      {/* Sekce 1: Agitace problému */}
      <section id="problem" className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
          Nejste líní. Jste jen přehlcení.
        </h2>
        <p className="mt-4 max-w-3xl text-lg text-stone-600">
          Většina podnikatelů a specialistů nechce „nepostovat“. Jen na to po celém dni plném klientské práce a řízení byznysu už zkrátka nezbývá kapacita.
        </p>
        <ul className="mt-6 space-y-3 text-stone-600">
          <li>• Znáte své téma perfektně, ale nevíte, jak ho prodat na sítích.</li>
          <li>• Když už si sednete k obsahu, ztrácíte hodiny přepisováním jedné věty.</li>
          <li>• Každý příspěvek je mentální start od nuly.</li>
          <li>• Místo toho, abyste se věnovali tomu, co vás živí, řešíte „co dnes dát na Instagram nebo LinkedIn“.</li>
        </ul>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SectionImages count={3} />
        </div>
      </section>

      {/* Sekce 2: Řešení */}
      <section id="reseni" className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
          Neřešíme jen texty. Řešíme vaši rozhodovací únavu.
        </h2>
        <p className="mt-4 max-w-3xl text-lg text-stone-600">
          Náš cíl není vygenerovat náhodný text. Náš cíl je zařídit, aby vám z hlavy zmizel každodenní tlak na obsah. Vaše značka bude vidět pravidelně, kvalitně a konzistentně – a vy u toho nebudete muset trpět.
        </p>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Dříve</h3>
            <ul className="mt-4 space-y-2 text-stone-600">
              <li>❌ „Co dnes postnout?“</li>
              <li>❌ „Nemám kapacitu.“</li>
              <li>❌ „Zase jsem nic nevydal/a.“</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/50 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-800/80">S Luciferou</h3>
            <ul className="mt-4 space-y-2 text-stone-700">
              <li>✅ „Mám návrhy včas a bez stresu.“</li>
              <li>✅ „Vím přesně, co a kdy jde ven.“</li>
              <li>✅ „Sítě běží, já řeším svoji práci.“</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Sekce 3: Proces */}
      <section id="jak-to-funguje" className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
          Od briefu k publikaci během jednoho týdne. Žádné zbytečné cally.
        </h2>
        <p className="mt-4 max-w-3xl text-stone-600">
          Spolupráce je navržená tak, aby byla maximálně asynchronní a nezdržovala vás.
        </p>
        <div className="mt-10 space-y-4">
          {processSteps.map((step) => (
            <article
              key={step.title}
              className="flex flex-col gap-1 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-stone-900">{step.title}</h3>
                <p className="mt-1 text-stone-600">{step.text}</p>
              </div>
              {step.day && (
                <span className="mt-2 shrink-0 rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-600 sm:mt-0">
                  {step.day}
                </span>
              )}
            </article>
          ))}
        </div>
        <p className="mt-8 text-lg font-medium text-stone-700">
          Výsledek: Vy se mezitím věnujete své profesi. My držíme obsahový rytmus.
        </p>
      </section>

      {/* Sekce 4: Diferenciace */}
      <section id="proc-my" className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-stone-50/90 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
            Rychlost AI. Zodpovědnost člověka.
          </h2>
          <p className="mt-4 max-w-3xl text-stone-700">
            AI dramaticky urychluje produkci a eliminuje prázdnou stránku. Ale na konci vždy stojí náš Kreativní kurátor.
            Každý výstup pečlivě kontroluje. Hlídá kvalitu, tón vaší značky a funkčnost sdělení. Když je potřeba, zasáhne ručně, aby výstup nebyl jen „rychlý“, ale především prvotřídní a přesný.
          </p>
        </div>
      </section>

      {/* Sekce 5: FAQ */}
      <section id="faq" className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
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

      {/* Závěrečné CTA */}
      <section id="kontakt" className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-stone-900 p-8 text-stone-100 shadow-xl md:p-12">
          <h2 className="max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
            Chcete mít v pondělí zadáno a v pátek publikováno?
          </h2>
          <p className="mt-4 max-w-2xl text-stone-400">
            Vyberte si tarif, vyplňte krátký formulář a sledujte, jak váš obsah vzniká – včas, kvalitně a naprosto bez chaosu.
          </p>
          <div className="mt-8">
            <a
              href="mailto:kontakt@studiolucifera.cz?subject=Tarif%20AI%20Content%20Studio"
              className="inline-flex rounded-full bg-amber-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
            >
              Zvolit tarif a spustit projekt
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
