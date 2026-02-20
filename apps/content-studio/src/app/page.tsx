import { HeroImageFull } from "./components/HomePlaceholders";

const faqs = [
  { q: "Je to automatické?", a: "Ne. Každý výstup prochází dohledem." },
  { q: "Jsou v ceně revize?", a: "U testovací nabídky 800 Kč doručujeme finální návrhy bez revizí." },
  { q: "Co když budu chtít dlouhodobou spolupráci?", a: "Navazující paušální model je k dispozici." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="focus:outline-none">
            <span className="text-sm font-semibold tracking-wide text-stone-900">AI CONTENT STUDIO LUCIFERA</span>
            <span className="ml-2 text-xs text-stone-500">AI + kreativní kurátor</span>
          </a>
          <nav className="hidden gap-8 text-sm text-stone-600 md:flex">
            <a href="#manifest" className="transition-colors hover:text-stone-900">Manifest</a>
            <a href="#co-delame" className="transition-colors hover:text-stone-900">Co děláme</a>
            <a href="#rozdil" className="transition-colors hover:text-stone-900">Rozdíl</a>
            <a href="#jak-to-funguje" className="transition-colors hover:text-stone-900">Jak to funguje</a>
            <a href="#testovaci-nabidka" className="transition-colors hover:text-stone-900">Nabídka</a>
            <a href="#proc-my" className="transition-colors hover:text-stone-900">Proč my</a>
            <a href="#faq" className="transition-colors hover:text-stone-900">FAQ</a>
            <a href="#zaver" className="transition-colors hover:text-stone-900">Kontakt</a>
          </nav>
          <a href="/start?plan=test-week" className="rounded-lg bg-[#A3E635] px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-[#A3E635]/90">
            Spustit projekt
          </a>
        </div>
      </header>

      <section className="relative w-full min-h-[86vh] overflow-hidden">
        <div className="absolute inset-0">
          <HeroImageFull />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent" />
        <div className="relative mx-auto flex min-h-[86vh] max-w-[1360px] flex-col justify-center px-6 py-16 xl:px-10">
          <div className="max-w-[560px]">
            <h1 className="font-sans font-black text-[clamp(2rem,5.2vw,4.5rem)] leading-[0.92] tracking-[-0.035em] text-zinc-900">
              Obsah pod kontrolou studia.
            </h1>
            <p className="mt-6 max-w-md text-lg text-zinc-700" style={{ lineHeight: "1.75rem" }}>
              Vizuálně silné příspěvky pod odborným dohledem. Technologie generuje. My rozhodujeme.
            </p>
            <p className="mt-4 text-sm text-zinc-600">
              3 příspěvky · do 48 hodin · 800 Kč jednorázově
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="/start?plan=test-week" className="rounded-lg bg-[#A3E635] px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-[#A3E635]/90">
                Chci mít hotovo
              </a>
              <a
                href="#jak-to-funguje"
                className="rounded-lg border border-stone-300 bg-white/80 px-6 py-3 text-sm font-medium text-stone-900 hover:bg-stone-50"
              >
                Jak to funguje
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="manifest" className="w-full border-t border-stone-200 bg-white px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Obraz rozhoduje.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
            Značka je vidět dřív, než je čtena. Proto každý výstup prochází výběrem. Ne publikací. Výběrem.
          </p>
        </div>
      </section>

      <section id="co-delame" className="w-full border-t border-stone-200 bg-stone-50 px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Produkční model pro značky.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-stone-600">
              Dodáváme hotové příspěvky. Ne brainstorming. Ne generovaný chaos. Vyplníte brief. Do 48 hodin máte výstupy připravené k publikaci.
            </p>
            <a href="/start?plan=test-week" className="mt-8 inline-block rounded-lg bg-[#A3E635] px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-[#A3E635]/90">
              Chci mít hotovo
            </a>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
            <div className="flex h-full w-full items-center justify-center grayscale">
              <div className="text-center text-stone-500">
                <svg className="mx-auto h-16 w-16 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="mt-2 text-sm">B/W detail · ruka s tištěným návrhem</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="rozdil" className="w-full border-t border-stone-200 bg-stone-100 px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1fr] md:items-center">
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            <div className="aspect-[3/4] max-h-[480px] bg-stone-200">
              <div className="flex h-full w-full items-center justify-center text-stone-500">
                <span className="text-sm">Portrét · placeholder</span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Rozhoduje zkušenost.
            </h2>
            <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-stone-600">
              {`Technologie navrhuje. Zkušenost vybírá.
25 let práce s obrazem.
Reálné projekty. Reálné značky.`}
            </p>
          </div>
        </div>
      </section>

      <section id="jak-to-funguje" className="w-full border-t border-stone-200 bg-white px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Jednoduchý systém.
          </h2>
          <p className="mt-4 text-stone-600">
            Spolupráce je navržená tak, aby byla maximálně asynchronní a nezdržovala vás.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#A3E635]/50 bg-[#A3E635]/10">
                <svg className="h-6 w-6 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </div>
              <p className="mt-4 font-medium text-stone-900">Vyplníte krátký formulář.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#A3E635]/50 bg-[#A3E635]/10">
                <svg className="h-6 w-6 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <p className="mt-4 font-medium text-stone-900">Do 48 hodin obdržíte návrhy.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#A3E635]/50 bg-[#A3E635]/10">
                <svg className="h-6 w-6 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="mt-4 font-medium text-stone-900">Publikujete.</p>
            </div>
          </div>
          <p className="mt-12 text-stone-600">
            Žádné dlouhé procesy. Žádné meetingy.
          </p>
        </div>
      </section>

      <section id="testovaci-nabidka" className="w-full border-t border-stone-200 bg-stone-50 px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-md">
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">
              Testovací týden.
            </h2>
            <ul className="mt-6 space-y-3 text-stone-600">
              <li className="flex items-center gap-2">
                <span className="text-[#A3E635]">✓</span> 3 příspěvky
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#A3E635]">✓</span> Text + vizuál
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#A3E635]">✓</span> Doručení do 48 hodin
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#A3E635]">✓</span> 800 Kč (zaváděcí cena)
              </li>
            </ul>
            <p className="mt-6 text-sm text-stone-500">
              Kapacita je omezená.
            </p>
            <a
              href="/start?plan=test-week"
              className="mt-8 block w-full rounded-lg bg-[#A3E635] py-3 text-center text-sm font-semibold text-zinc-900 hover:bg-[#A3E635]/90"
            >
              Chci mít hotovo
            </a>
          </div>
        </div>
      </section>

      <section id="proc-my" className="w-full border-t border-stone-200 bg-stone-50 px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Rychlost AI. Zodpovědnost člověka.
          </h2>
          <div className="mt-12 flex flex-col items-center justify-center gap-8 sm:flex-row">
            <div className="rounded-xl border border-[#A3E635]/30 bg-[#A3E635]/5 px-8 py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#A3E635]/50 bg-[#A3E635]/10">
                <span className="text-lg font-bold text-stone-700">AI</span>
              </div>
              <p className="mt-3 text-sm font-medium text-stone-900">AI</p>
              <p className="text-xs text-stone-500">Neuronová síť, generace</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#A3E635]/30 text-stone-700">
              <span className="text-xl">✦</span>
            </div>
            <div className="rounded-xl border border-[#A3E635]/30 bg-[#A3E635]/5 px-8 py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-[#A3E635]/50 bg-[#A3E635]/10">
                <img src="/placeholders/mia-mozek.png" alt="" className="h-full w-full object-cover opacity-60" />
              </div>
              <p className="mt-3 text-sm font-medium text-stone-900">Kurátor</p>
              <p className="text-xs text-stone-500">Kontrola, tón, kvalita</p>
            </div>
          </div>
          <div className="mt-10 rounded-xl border border-[#A3E635]/20 bg-[#A3E635]/5 p-8">
            <p className="text-center text-stone-700">
              AI dramaticky urychluje produkci a eliminuje prázdnou stránku. Ale na konci vždy stojí náš Kreativní kurátor.
              Každý výstup pečlivě kontroluje. Hlídá kvalitu, tón vaší značky a funkčnost sdělení. Když je potřeba, zasáhne ručně, aby výstup nebyl jen rychlý, ale především prvotřídní a přesný.
            </p>
          </div>
        </div>
      </section>

      <section id="kocka" className="w-full border-t border-stone-200 bg-white px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[minmax(0,240px)_1fr] md:items-center">
          <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-xl border border-stone-200 bg-stone-100 grayscale opacity-80">
            <img src="/placeholders/mia-mozek.png" alt="" className="h-full w-full object-cover object-center" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Pozorujeme. Reagujeme.
            </h2>
            <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-stone-600">
              {`Adaptace je součást procesu.
Sledujeme změny.
Reagujeme rychle.
Rozhodujeme lidsky.`}
            </p>
          </div>
        </div>
      </section>

      <section id="faq" className="w-full border-t border-stone-200 bg-stone-50 px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">Často kladené otázky</h2>
          <div className="mt-10 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="overflow-hidden rounded-xl border border-stone-200 bg-[#FBFBF6] [&[open]]:border-[#A3E635]/40"
              >
                <summary className="cursor-pointer list-none px-6 py-4 font-semibold text-stone-900 [&::-webkit-details-marker]:hidden">
                  {faq.q}
                </summary>
                <p className="border-t border-stone-100 px-6 py-4 text-stone-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="zaver" className="w-full border-t border-stone-200 bg-stone-50 px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-stone-200 bg-white p-10 shadow-sm md:p-14">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl lg:text-5xl">
                Chcete mít v pondělí zadáno a v pátek publikováno?
              </h2>
              <p className="mt-6 max-w-xl mx-auto text-lg text-stone-600">
                Vyplňte krátký dotazník a sledujte, jak váš obsah vzniká – včas, kvalitně a naprosto bez chaosu.
              </p>
              <div className="mt-10 flex justify-center">
                <div className="relative w-full max-w-sm rounded-xl border-2 border-[#A3E635] bg-white px-8 py-6 text-left">
                  <span className="absolute -top-3 left-6 rounded bg-[#A3E635] px-3 py-0.5 text-xs font-bold text-zinc-900">JEDINÁ NABÍDKA</span>
                  <p className="text-lg font-semibold text-stone-900">TESTOVACÍ TÝDEN</p>
                  <p className="mt-1 text-xl font-bold text-stone-800">800 Kč / jednorázově</p>
                  <ul className="mt-4 space-y-2 text-sm text-stone-600">
                    <li className="flex items-center gap-2"><span className="text-[#A3E635]">✓</span> 3 profesionální příspěvky</li>
                    <li className="flex items-center gap-2"><span className="text-[#A3E635]">✓</span> grafika v Glass stylu</li>
                    <li className="flex items-center gap-2"><span className="text-[#A3E635]">✓</span> texty s tónem vaší značky</li>
                    <li className="flex items-center gap-2"><span className="text-[#A3E635]">✓</span> doručení do 48 hodin</li>
                  </ul>
                  <a href="/start?plan=test-week" className="mt-6 block w-full rounded-lg bg-[#A3E635] py-3 text-center text-sm font-semibold text-zinc-900 hover:bg-[#A3E635]/90">
                    Spustit projekt →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white py-8 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} AI Content Studio Lucifera
      </footer>
    </main>
  );
}
