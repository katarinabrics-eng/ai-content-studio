import { HeroImageFull } from "./components/HomePlaceholders";
import { Header } from "./components/Header";

const faqs = [
  { q: "Je to automatické?", a: "Ne. Každý výstup prochází dohledem." },
  { q: "Jsou v ceně revize?", a: "U testovací nabídky 800 Kč doručujeme finální návrhy bez revizí." },
  { q: "Co když budu chtít dlouhodobou spolupráci?", a: "Navazující paušální model je k dispozici." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <Header />

      <section className="relative w-full min-h-[86vh] overflow-hidden">
        <div className="absolute inset-0">
          <HeroImageFull />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.35) 35%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto flex min-h-[86vh] max-w-[1360px] flex-col justify-center px-6 py-16 xl:px-10">
          <div className="max-w-[600px]">
            <h1 className="font-sans font-black text-[clamp(2rem,5.2vw,4.5rem)] leading-[0.92] tracking-[-0.035em] text-zinc-900">
              Prémiová vizuální identita pro osobní značky
            </h1>
            <p className="mt-6 text-xl text-zinc-700" style={{ lineHeight: "1.6" }}>
              Váš obraz by měl odpovídat úrovni, na které dnes podnikáte.
            </p>
            <p className="mt-4 text-lg text-zinc-600" style={{ lineHeight: "1.7" }}>
              Strategická spolupráce pro lídry, podnikatele a veřejně vystupující osobnosti,
              kteří chtějí kultivovat svou vizuální prezentaci dlouhodobě.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="/start?plan=test-week" className="rounded-lg bg-[#A3E635] px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-[#A3E635]/90">
                Mám zájem o spolupráci
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

      {/* SECTION: Manifest – 3 sub-sections (problem, transition, statement) */}
      <section id="manifest" className="w-full border-t border-stone-200 bg-[#FAFAF9]">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-8 lg:px-12">
          {/* SECTION 1 – Problem statement (2-column) */}
          <div className="flex flex-col gap-12 py-32 lg:flex-row lg:items-center lg:gap-16">
            <div className="min-w-0 flex-1">
              <h2 className="text-4xl font-bold tracking-tight text-stone-900 md:text-5xl md:leading-[1.1]">
                Když značka vyroste rychleji než její obraz
              </h2>
              <p className="mt-10 text-lg leading-relaxed text-stone-900">
                Vaše podnikání se vyvíjí.
              </p>
              <p className="mt-3 text-lg leading-relaxed text-stone-900">
                Vaše odpovědnost roste.
              </p>
              <p className="mt-3 text-lg leading-relaxed text-stone-900">
                Vaše publikum také.
              </p>
              <p className="mt-10 text-base text-stone-500">
                Ale vizuální prezentace často zůstává tam, kde byla před lety.
              </p>
            </div>
            <div className="relative flex-1 lg:max-w-[420px]">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-stone-200 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]">
                {/* Placeholder: grayscale portrait – replace with real img */}
                <div className="absolute inset-0 bg-stone-300 grayscale" aria-hidden />
                {/* Lime brush stroke overlay */}
                <div
                  className="absolute inset-0 opacity-90 mix-blend-multiply"
                  style={{
                    background: "linear-gradient(135deg, transparent 25%, rgba(180, 240, 0, 0.55) 45%, rgba(180, 240, 0, 0.4) 55%, transparent 75%)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2 – Transition block */}
          <div className="py-16 lg:py-24">
            <p className="text-center text-xl font-semibold text-stone-900 md:text-2xl">
              To funguje, dokud vás znají osobně.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-stone-500">
              Jakmile ale vstupujete do většího prostoru, váš obraz musí unést víc než jen sympatie.
              <br />
              Musí unést vaši úroveň.
            </p>

            <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
              {/* Left: 5 cards */}
              <div className="space-y-4">
                {[
                  { title: "vizuál, který působí jednotně", sub: "Jednotný jazyk napříč kanály." },
                  { title: "obraz, který odpovídá vaší ceně", sub: "Prezentace na úrovni vašeho byznysu." },
                  { title: "prezentace, která nepůsobí nahodile", sub: "Záměr místo náhody." },
                  { title: "fotografie, které nejsou jen „hezké“", sub: "Použitelné v reálné komunikaci." },
                  { title: "jasný vizuální směr místo improvizace", sub: "Strategie, ne jednorázové řešení." },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-xl bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)]"
                  >
                    <div className="h-10 w-10 shrink-0 rounded bg-[#B4F000]" aria-hidden />
                    <div>
                      <p className="font-semibold text-stone-900">{item.title}</p>
                      <p className="mt-1 text-sm text-stone-500">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: 2 image placeholders */}
              <div className="flex flex-col gap-6">
                <div className="relative ml-0 aspect-square max-w-sm overflow-hidden rounded-xl bg-stone-200 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] lg:ml-8">
                  <div className="absolute inset-0 bg-stone-300 grayscale" aria-hidden />
                  <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(180, 240, 0, 0.2) 100%)" }} aria-hidden />
                </div>
                <div className="relative ml-12 aspect-square max-w-sm overflow-hidden rounded-xl bg-stone-200 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] lg:ml-20">
                  <div className="absolute inset-0 bg-stone-300 grayscale" aria-hidden />
                  <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ background: "linear-gradient(0deg, transparent 40%, rgba(180, 240, 0, 0.15) 100%)" }} aria-hidden />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3 – Statement block */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-stone-800 py-20 px-8 md:py-28 md:px-12 lg:flex lg:items-center lg:justify-between lg:gap-16 lg:px-16">
            {/* Lime glow right */}
            <div className="pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full bg-[#B4F000] opacity-20 blur-[100px]" aria-hidden />
            {/* Faint "25" in background */}
            <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-[min(20vw,280px)] font-bold leading-none text-white opacity-[0.05]" aria-hidden>
              25
            </span>

            <div className="relative max-w-2xl">
              <p className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
                Silná značka není hlasitá.
              </p>
              <p className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                Je čitelná.
              </p>
              <p className="mt-8 text-xl text-stone-400">
                A čitelnost je otázka rozhodnutí.
              </p>
            </div>

            <div className="relative mt-12 flex justify-center lg:mt-0 lg:shrink-0">
              <div className="relative h-[280px] w-[280px] md:h-[320px] md:w-[320px]">
                <div className="absolute -inset-4 rounded-full bg-[#B4F000]/40 blur-2xl" aria-hidden />
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-stone-700 shadow-2xl">
                  <div className="absolute inset-0 bg-stone-400 grayscale" aria-hidden />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="co-delame" className="hidden" aria-hidden="true" />

      <section id="rozdil" className="w-full border-t border-stone-200 bg-stone-100 px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1fr] md:items-center">
          <div className="relative aspect-[3/4] max-h-[480px] w-full">
            <img
              src="/placeholders/KDOJSEM_01.png"
              alt=""
              className="h-full w-full object-cover object-center drop-shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
            />
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

      <section id="ukazky" className="w-full border-t border-stone-200 bg-white px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Ukázky naší práce
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-stone-600">
            Příklady příspěvků a vizuálů, které pro klienty připravujeme.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-sm">
              <img
                src="/placeholders/01_ukazky.png"
                alt="Ukázka vizuálů obsahu"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-sm">
              <img
                src="/placeholders/01_ukazky_1.png"
                alt="Ukázka vizuálů obsahu"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-sm">
              <img
                src="/placeholders/01_ukazky_2.png"
                alt="Ukázka vizuálů obsahu"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-sm">
              <img
                src="/placeholders/01_ukazky_3.png"
                alt="Ukázka vizuálů obsahu"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="jak-to-funguje" className="w-full border-t border-stone-200 bg-white px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Co vám to přinese.
          </h2>
          <p className="mt-4 text-stone-600">
            Obsah, který pracuje za vás — bez chaosu, bez ztráty energie.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#A3E635]/50 bg-[#A3E635]/10">
                <svg className="h-6 w-6 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="mt-4 font-medium text-stone-900">Více času na klienty</p>
              <p className="mt-2 text-sm text-stone-600">
                Hodiny strávené tvorbou obsahu vrátíte zpět do práce, která vám skutečně vydělává.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#A3E635]/50 bg-[#A3E635]/10">
                <svg className="h-6 w-6 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="mt-4 font-medium text-stone-900">Pravidelná viditelnost značky</p>
              <p className="mt-2 text-sm text-stone-600">
                Budete na sítích konzistentně vidět, i když máte plný kalendář.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#A3E635]/50 bg-[#A3E635]/10">
                <svg className="h-6 w-6 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <p className="mt-4 font-medium text-stone-900">Klid v hlavě</p>
              <p className="mt-2 text-sm text-stone-600">
                Neřešíte, co dnes publikovat. Jen schválíte výstup a pokračujete ve svém byznysu.
              </p>
            </div>
          </div>
          <p className="mt-12 text-stone-600">
            Méně mentálního hluku. Více prostoru na růst.
          </p>
        </div>
      </section>

      <section id="testovaci-nabidka" className="w-full border-t border-stone-200 bg-stone-50 px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-md">
          <p className="mb-6 text-center text-lg font-medium text-stone-700">
            Konkurence postuje, zatímco vy přemýšlíte, co napsat. Lucifera to vyřeší dřív, než dopijete kávu.
          </p>
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
            <ul className="mt-6 space-y-3 border-t border-stone-100 pt-6 text-sm text-stone-600">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-[#A3E635]">•</span>
                <span>3 příspěvky za 800 Kč. To je cena jednoho lepšího byznys oběda. Ten vás ale na sítě neprotlačí.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-[#A3E635]">•</span>
                <span>Dopřejte si týden klidu za cenu, kterou byste jinde dali za 15 minut konzultace.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-[#A3E635]">•</span>
                <span>Zkuste si to na týden. Riziko je nula, zisk je váš volný čas zpět.</span>
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
          <ul className="mt-10 space-y-4 text-stone-700">
            <li className="flex gap-3">
              <span className="mt-1 shrink-0 text-[#A3E635]">•</span>
              <span>Váš mozek má omezenou kapacitu na kreativitu. Vyčerpáte si ji ráno na Instagramu, nebo ji necháte pro své platící klienty?</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 shrink-0 text-[#A3E635]">•</span>
              <span>Každá minuta, kdy řešíte fonty a hashtagy, je minuta, kdy neřídíte svůj byznys.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 shrink-0 text-[#A3E635]">•</span>
              <span>Lucifera neřeší jen texty. Řeší vaši rozhodovací únavu. My tvoříme, vy rozhodujete. To je vše.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 shrink-0 text-[#A3E635]">•</span>
              <span>Kolik klientů jste mohl obsloužit, zatímco jste bojoval s prázdnou stránkou v Canvě?</span>
            </li>
          </ul>
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

      <section className="w-full border-t border-stone-200 bg-stone-50 px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-4xl md:text-5xl md:leading-[1.15]">
            Silná značka není hlasitá.
          </p>
          <p className="mt-4 text-3xl font-bold leading-tight tracking-tight text-[#A3E635] sm:text-4xl md:text-5xl md:leading-[1.15]">
            Je čitelná.
          </p>
          <p className="mt-10 text-xl font-medium text-stone-600 sm:text-2xl">
            A čitelnost je otázka rozhodnutí.
          </p>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white py-8 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} AI Content Studio Lucifera
      </footer>
    </main>
  );
}
