import { HeroImageFull } from "./components/HomePlaceholders";

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
            <a href="#rozdil" className="transition-colors hover:text-zinc-900">Rozdíl</a>
            <a href="#jak-to-funguje" className="transition-colors hover:text-zinc-900">Jak to funguje</a>
            <a href="#testovaci-nabidka" className="transition-colors hover:text-zinc-900">Nabídka</a>
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

      <section id="rozdil" className="w-full border-t border-stone-200 bg-[#2d2d2d] px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1fr] md:items-center">
          <div className="aspect-[3/4] max-h-[480px] overflow-hidden rounded bg-zinc-800">
            <div className="flex h-full w-full items-center justify-center text-zinc-500">
              <span className="text-sm">Portrét · placeholder</span>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Rozhoduje zkušenost.
            </h2>
            <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-zinc-300">
              {`Technologie navrhuje. Zkušenost vybírá.
25 let práce s obrazem.
Reálné projekty. Reálné značky.`}
            </p>
          </div>
        </div>
      </section>

      <section id="jak-to-funguje" className="w-full border-t border-stone-200 bg-white px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
            Jednoduchý systém.
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            <div className="relative border-l-2 border-zinc-200 pl-6">
              <span className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-[#A3E635]" />
              <p className="text-lg font-medium text-zinc-900">Vyplníte krátký formulář.</p>
            </div>
            <div className="relative border-l-2 border-zinc-200 pl-6">
              <span className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-[#A3E635]" />
              <p className="text-lg font-medium text-zinc-900">Do 48 hodin obdržíte návrhy.</p>
            </div>
            <div className="relative border-l-2 border-zinc-200 pl-6">
              <span className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-[#A3E635]" />
              <p className="text-lg font-medium text-zinc-900">Publikujete.</p>
            </div>
          </div>
          <p className="mt-12 text-zinc-600">
            Žádné dlouhé procesy. Žádné meetingy.
          </p>
        </div>
      </section>

      <section id="testovaci-nabidka" className="w-full border-t border-stone-200 bg-stone-50 px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
              Testovací týden.
            </h2>
            <ul className="mt-6 space-y-3 text-zinc-700">
              <li>3 příspěvky</li>
              <li>Text + vizuál</li>
              <li>Doručení do 48 hodin</li>
              <li>800 Kč (zaváděcí cena)</li>
            </ul>
            <p className="mt-6 text-sm text-zinc-600">
              Kapacita je omezená.
            </p>
            <a
              href="/start?plan=test-week"
              className="mt-8 block w-full rounded bg-[#A3E635] py-3 text-center text-sm font-semibold text-zinc-900 hover:bg-[#A3E635]/90"
            >
              Chci mít hotovo
            </a>
          </div>
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
                  <a href="/start?plan=test-week" className="mt-6 block w-full rounded bg-[#A3E635] py-3 text-center text-sm font-semibold text-zinc-900 hover:bg-[#A3E635]/90">
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
