import { HeroImageFull } from "./components/HomePlaceholders";

const processSteps = [
  { title: "Vyplníte krátký dotazník", text: "Předáte nám brand, cílovku a tón komunikace.", day: "Pondělí", icon: "form" },
  { title: "Dostanete 3 návrhy", text: "Do 24–48 hodin vám pošleme konkrétní příspěvky připravené ke schválení.", day: "Úterý/Středa", icon: "cards" },
  { title: "Schválíte nebo připomínkujete", text: "Pokud máte námitky, obratem je zapracujeme.", day: "Čtvrtek", icon: "check" },
  { title: "Máte hotovo", text: "Do dalšího dne máte finální verzi připravenou k propagaci.", day: "Pátek", icon: "rocket" },
];

const faqs = [
  { q: "Je potřeba hodně schůzek a callů?", a: "Ne. Náš systém je postavený tak, abyste nemuseli trávit hodiny na meetinzích. Spolupráce je asynchronní a rychlá." },
  { q: "Co když s návrhem nesouhlasíme?", a: "U zaváděcí ceny 800 Kč doručujeme finální návrhy bez revizí. Ladění na míru je dostupné u měsíčních paušálů." },
  { q: "Jak rychle uvidíme první výstupy?", a: "První 3 návrhy od nás standardně dostanete do 24–48 hodin od dodání podkladů." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="focus:outline-none">
            <span className="text-sm font-semibold tracking-wide text-stone-900">AI CONTENT STUDIO LUCIFERA</span>
            <span className="ml-2 text-xs text-stone-500">AI + kreativní kurátor</span>
          </a>
          <nav className="hidden gap-8 text-sm text-stone-600 md:flex">
            <a href="#manifest" className="transition-colors hover:text-zinc-900">Manifest</a>
            <a href="#co-delame" className="transition-colors hover:text-zinc-900">Co děláme</a>
            <a href="#jak-to-funguje" className="transition-colors hover:text-zinc-900">Jak to funguje</a>
            <a href="#proc-my" className="transition-colors hover:text-zinc-900">Proč my</a>
            <a href="#faq" className="transition-colors hover:text-zinc-900">FAQ</a>
            <a href="#kontakt" className="transition-colors hover:text-zinc-900">Kontakt</a>
          </nav>
          <a href="/start?plan=test-week" className="rounded bg-[#A3E635] px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-[#A3E635]/90">
            Spustit projekt
          </a>
        </div>
      </header>

      <section
        className="relative grid min-h-[calc(100vh-76px)] w-full grid-cols-1 overflow-hidden bg-white lg:grid-cols-[2fr_3fr]"
      >
        <div className="flex flex-col justify-center px-6 py-16 lg:px-12 xl:px-16">
          <h1
            className="font-sans font-black tracking-[-0.035em] text-zinc-900"
            style={{
              fontSize: "clamp(2rem, 4.5vw, 4.5rem)",
              lineHeight: 0.95,
            }}
          >
            Obsah pod kontrolou studia.
          </h1>
          <p className="mt-6 max-w-md text-lg text-zinc-700" style={{ lineHeight: "1.75rem" }}>
            Vizuálně silné příspěvky pod odborným dohledem. Technologie generuje. My rozhodujeme.
          </p>
          <p className="mt-4 text-sm text-zinc-600">
            3 příspěvky · do 48 hodin · 800 Kč jednorázově
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="/start?plan=test-week" className="rounded bg-[#A3E635] px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-[#A3E635]/90">
              Chci mít hotovo
            </a>
            <a
              href="#jak-to-funguje"
              className="rounded border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
            >
              Jak to funguje
            </a>
          </div>
        </div>
        <div className="relative min-h-[50vh] lg:min-h-full">
          <HeroImageFull />
        </div>
      </section>

      <section id="manifest" className="w-full border-t border-stone-200 bg-white px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
            Obraz rozhoduje.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-700">
            Značka je vidět dřív, než je čtena. Proto každý výstup prochází výběrem. Ne publikací. Výběrem.
          </p>
        </div>
      </section>

      <section id="co-delame" className="w-full border-t border-stone-200 bg-stone-50 px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
              Produkční model pro značky.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-zinc-700">
              Dodáváme hotové příspěvky. Ne brainstorming. Ne generovaný chaos. Vyplníte brief. Do 48 hodin máte výstupy připravené k publikaci.
            </p>
            <a href="/start?plan=test-week" className="mt-8 inline-block rounded bg-[#A3E635] px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-[#A3E635]/90">
              Chci mít hotovo
            </a>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded border border-stone-200 bg-stone-200">
            <div className="flex h-full w-full items-center justify-center grayscale">
              <div className="text-center text-zinc-500">
                <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="mt-2 text-sm">B/W detail · ruka s tištěným návrhem</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="jak-to-funguje" className="relative w-full bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Od dotazníku k publikaci během jednoho týdne. Žádné zbytečné cally.
          </h2>
          <p className="mt-4 max-w-3xl text-stone-600">
            Spolupráce je navržená tak, aby byla maximálně asynchronní a nezdržovala vás.
          </p>
          <div className="mt-14 flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
            {processSteps.map((step, i) => (
              <div key={step.title} className="flex flex-1 flex-col items-center lg:max-w-[180px]">
                <div className="flex w-full items-center justify-center lg:justify-center">
                  {i > 0 && <div className="hidden h-0.5 flex-1 max-w-[20px] bg-lucifera-lime/40 lg:block" />}
                  <div className="z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-lucifera-lime/50 bg-lucifera-lime/10 text-zinc-800">
                    {step.icon === "form" && <span className="text-lg">✎</span>}
                    {step.icon === "cards" && <span className="text-lg">☰</span>}
                    {step.icon === "check" && <span className="text-lg">✓</span>}
                    {step.icon === "rocket" && <span className="text-lg">↑</span>}
                  </div>
                  {i < processSteps.length - 1 && <div className="hidden h-0.5 flex-1 min-w-[8px] max-w-[40px] bg-lucifera-lime/40 lg:block" />}
                </div>
                <div className="mt-4 text-center">
                  <h3 className="font-semibold text-stone-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-stone-600">{step.text}</p>
                  {step.day && (
                    <span className="mt-2 inline-block rounded-full bg-lucifera-lime/15 px-2 py-0.5 text-xs font-medium text-zinc-800">
                      {step.day}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-lg font-medium text-stone-800">
            Výsledek: Vy se mezitím věnujete své profesi. My držíme obsahový rytmus.
          </p>
        </div>
      </section>

      <section id="proc-my" className="relative w-full bg-stone-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Rychlost AI. Zodpovědnost člověka.
          </h2>
          <div className="mt-12 flex flex-col items-center justify-center gap-8 lg:flex-row">
            <div className="glass-lime flex flex-col items-center px-8 py-6">
              <div className="h-16 w-16 rounded-full border border-lucifera-lime/40 bg-lucifera-lime/10" />
              <p className="mt-3 text-sm font-medium text-stone-900">AI</p>
              <p className="text-center text-xs text-stone-500">Neuronová síť, generace</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lucifera-lime/30 text-zinc-700">
              <span className="text-xl">✦</span>
            </div>
            <div className="glass-lime flex flex-col items-center px-8 py-6">
              <div
                className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-lucifera-lime/50 bg-lucifera-lime/20 text-xs text-stone-500"
                style={{ backgroundImage: "url(/placeholders/lucifera-maskot.png)", backgroundSize: "cover", backgroundPosition: "center" }}
                title="Maskot Lucifera"
              >
                <span className="sr-only">Maskot Lucifera – placeholder</span>
              </div>
              <p className="mt-3 text-sm font-medium text-stone-900">Kurátor</p>
              <p className="text-center text-xs text-stone-500">Kontrola, tón, kvalita</p>
            </div>
          </div>
          <div className="glass-lime mt-10 p-8">
            <p className="text-center text-stone-700">
              AI dramaticky urychluje produkci a eliminuje prázdnou stránku. Ale na konci vždy stojí náš Kreativní kurátor.
              Každý výstup pečlivě kontroluje. Hlídá kvalitu, tón vaší značky a funkčnost sdělení. Když je potřeba, zasáhne ručně, aby výstup nebyl jen rychlý, ale především prvotřídní a přesný.
            </p>
          </div>
        </div>
      </section>

      <section id="faq" className="relative w-full bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">Často kladené otázky</h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group glass-lime overflow-hidden [&[open]]:border-lucifera-lime/35 [&[open]]:shadow-md"
              >
                <summary className="cursor-pointer list-none px-6 py-4 font-semibold text-stone-900 [&::-webkit-details-marker]:hidden">
                  {faq.q}
                </summary>
                <p className="border-t border-stone-200 px-6 py-4 text-stone-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="kontakt" className="relative w-full bg-stone-50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="glass-lime p-10 md:p-14">
            <div className="flex flex-col items-center text-center">
              <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-stone-900 md:text-4xl lg:text-5xl">
                Chcete mít v pondělí zadáno a v pátek publikováno?
              </h2>
              <p className="mt-4 max-w-xl text-lg text-stone-600">
                Vyplňte krátký dotazník a sledujte, jak váš obsah vzniká – včas, kvalitně a naprosto bez chaosu.
              </p>
              
              <div className="mt-8 flex justify-center">
                <div className="relative glass-lime px-8 py-6 text-left ring-2 ring-[#A3E635] shadow-lg max-w-sm">
                  <span className="absolute -top-3 left-4 rounded-full bg-[#A3E635] px-3 py-0.5 text-xs font-bold text-zinc-900">JEDINÁ NABÍDKA</span>
                  <p className="font-semibold text-stone-900 text-lg">TESTOVACÍ TÝDEN</p>
                  <p className="text-xl font-bold text-stone-800 mt-1">800 Kč / jednorázově</p>
                  <ul className="mt-4 space-y-2 text-sm text-stone-600">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span> 3 profesionální příspěvky
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span> grafika v Glass stylu
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span> texty s tónem vaší značky
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span> doručení do 48 hodin
                    </li>
                  </ul>
                  <a href="/start" className="btn-lime-primary mt-6 w-full inline-block text-center text-zinc-900">
                    Spustit projekt →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} AI Content Studio Lucifera
      </footer>
    </main>
  );
}
