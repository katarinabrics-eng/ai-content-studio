import { HeroImageFull } from "./components/HomePlaceholders";

const faqs = [
  { q: "Je to automatické?", a: "Ne. Každý výstup prochází dohledem." },
  { q: "Jsou v ceně revize?", a: "U testovací nabídky 800 Kč doručujeme finální návrhy bez revizí." },
  { q: "Co když budu chtít dlouhodobou spolupráci?", a: "Navazující paušální model je k dispozici." },
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
            <a href="#kocka" className="transition-colors hover:text-zinc-900">Studio</a>
            <a href="#faq" className="transition-colors hover:text-zinc-900">FAQ</a>
            <a href="#zaver" className="transition-colors hover:text-zinc-900">Závěr</a>
          </nav>
          <a href="/start?plan=test-week" className="rounded bg-[#A3E635] px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-[#A3E635]/90">
            Spustit projekt
          </a>
        </div>
      </header>

      <section className="relative w-full min-h-[86vh] overflow-hidden bg-white">
        <div className="mx-auto grid min-h-[86vh] w-full max-w-[1360px] grid-cols-1 items-center gap-8 px-6 xl:grid-cols-[0.45fr_0.55fr] xl:gap-10 xl:px-10">
          <div className="flex max-w-[560px] flex-col justify-center py-16">
            <h1 className="font-sans font-black text-[clamp(56px,5.2vw,96px)] leading-[0.92] tracking-[-0.035em] text-zinc-900">
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
          <div className="relative w-full max-w-[760px] justify-self-end">
            <HeroImageFull />
          </div>
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

      <section id="kocka" className="w-full border-t border-stone-200 bg-white px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[minmax(0,280px)_1fr] md:items-center">
          <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg border border-stone-200 bg-stone-100 grayscale opacity-80 md:max-w-[240px]">
            <img
              src="/placeholders/mia-mozek.png"
              alt=""
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
              Pozorujeme. Reagujeme.
            </h2>
            <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-zinc-700">
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
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">Často kladené otázky</h2>
          <div className="mt-10 space-y-2">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group overflow-hidden rounded-lg border border-stone-200 bg-white [&[open]]:border-[#A3E635]/50"
              >
                <summary className="cursor-pointer list-none px-6 py-4 font-semibold text-zinc-900 [&::-webkit-details-marker]:hidden">
                  {faq.q}
                </summary>
                <p className="border-t border-stone-100 px-6 py-4 text-zinc-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="zaver" className="w-full border-t border-stone-200 bg-white px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl lg:text-5xl">
            Chcete mít hotovo?
          </h2>
          <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-zinc-700">
            {`Pokud chcete publikovat pravidelně
bez produkčního chaosu,
začněte testovacím týdnem.`}
          </p>
          <a
            href="/start?plan=test-week"
            className="mt-12 inline-block rounded bg-[#A3E635] px-8 py-4 text-base font-semibold text-zinc-900 hover:bg-[#A3E635]/90"
          >
            Chci mít hotovo
          </a>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} AI Content Studio Lucifera
      </footer>
    </main>
  );
}
