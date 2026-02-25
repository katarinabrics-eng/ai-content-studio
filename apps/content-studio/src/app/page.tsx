import { Header } from "./components/Header";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-950">
      <Header />

      {/* 1️⃣ HERO – Statement. Min 85vh, centrum, jen dva řádky + malé CTA. */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-[900px] text-center">
          <h1 className="font-bold leading-[1.12] tracking-tight text-white" style={{ fontSize: "clamp(2.25rem, 5.5vw, 3.75rem)" }}>
            To funguje, dokud vás znají osobně.
            <br />
            Jakmile vás neznají, rozhoduje obraz.
          </h1>
          <a
            href="/start"
            className="mt-12 inline-block text-sm font-medium text-white/80 underline-offset-4 hover:text-white"
          >
            Spustit projekt
          </a>
        </div>
      </section>

      {/* 2️⃣ TICHÁ SEKCE – 120px vzduch. */}
      <section className="h-[120px] flex-shrink-0" aria-hidden />

      {/* 3️⃣ Prémiová vizuální identita – centrovaný blok, max-width 860px, vertikální rytmus. */}
      <section id="definice" className="w-full bg-white py-[140px] text-stone-900">
        <div className="mx-auto max-w-[860px] px-6 text-center xl:px-10">
          <h2 className="font-bold leading-[1.1] tracking-tight text-stone-900" style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)" }}>
            Prémiová vizuální identita
            <br />
            není kosmetická úprava.
          </h2>
          <p className="mt-14 text-[22px] font-semibold text-stone-800">Je to rozhodnutí.</p>
          <div className="mt-16 space-y-6 text-[20px] leading-[1.75] text-stone-600">
            <p>Vizuální identita nastavuje standard. Ukazuje, kdo jste.</p>
            <p className="font-normal text-stone-500">Není o větší viditelnosti. Je o přesnějším dojmu.</p>
          </div>
          <p className="mt-20 text-[24px] font-semibold text-stone-900">Nastavuje směr.</p>
        </div>
      </section>

      {/* 4️⃣ OBRAZ JAKO SCÉNA – full-width, 70–80vh, text v dolní třetině. První vizuální vrchol. */}
      <section id="scena" className="relative w-full" style={{ minHeight: "75vh" }}>
        <div className="absolute inset-0">
          <Image
            src="/placeholders/KDOJSEM_01.png"
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-stone-900/50" aria-hidden />
        </div>
        <div className="relative flex min-h-[75vh] flex-col justify-end px-6 pb-[18vh] pt-24 xl:px-10">
          <div className="mx-auto w-full max-w-[1200px]">
            <h2 className="max-w-[600px] font-bold leading-[1.15] tracking-tight text-white" style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)" }}>
              Rozhoduje zkušenost.
            </h2>
            <p className="mt-4 max-w-[480px] text-lg text-white/90">
              Technologie navrhuje. Zkušenost vybírá. 25 let práce s obrazem. Reálné projekty. Reálné značky.
            </p>
          </div>
        </div>
      </section>

      {/* 5️⃣ ASYMETRICKÝ BLOK – 7 sloupců obraz, 5 sloupců text. Proces / Jak pracujeme. */}
      <section id="proces" className="w-full bg-stone-50 py-[140px] text-stone-900">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-6 lg:grid-cols-12 lg:gap-16 xl:px-10">
          <div className="relative aspect-[4/3] overflow-hidden lg:col-span-7">
            <Image
              src="/placeholders/hlavnycover_02.png"
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
          </div>
          <div className="flex flex-col justify-center lg:col-span-5">
            <h2 className="font-bold leading-[1.12] tracking-tight text-stone-900" style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)", marginBottom: "28px" }}>
              Jak pracujeme
            </h2>
            <p className="text-[18px] leading-[1.75] text-stone-600">
              Úvodní konzultace. Strategický směr. Koncepce a realizace. Výstupy, které nesou vaši úroveň.
            </p>
          </div>
        </div>
      </section>

      {/* 6️⃣ TICHÝ STATEMENT – tmavé pozadí, jeden velký řádek. Druhý vrchol. */}
      <section id="statement" className="w-full bg-stone-900 py-[160px]">
        <div className="mx-auto max-w-[900px] px-6 text-center xl:px-10">
          <p className="font-bold leading-[1.1] tracking-tight text-white" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Obraz musí unést vaši úroveň.
          </p>
        </div>
      </section>

      {/* 7️⃣ CASE / DŮKAZ – galerijní grid, max 1200px, velké náhledy, minimum textu. */}
      <section id="ukazky" className="w-full bg-white py-[140px] text-stone-900">
        <div className="mx-auto max-w-[1200px] px-6 xl:px-10">
          <h2 className="mb-12 font-bold tracking-tight text-stone-900 md:mb-16" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
            Ukázky
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {["/placeholders/01_ukazky.png", "/placeholders/01_ukazky_1.png", "/placeholders/01_ukazky_2.png", "/placeholders/01_ukazky_3.png"].map((src, i) => (
              <div key={i} className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                <Image src={src} alt="" fill className="object-cover object-center" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8️⃣ CTA PŘED KONCEM – velká mezera, centrovaný blok + tlačítko. */}
      <section id="cta" className="w-full bg-stone-50 py-[160px] text-stone-900">
        <div className="mx-auto max-w-[720px] px-6 text-center xl:px-10">
          <p className="font-bold leading-[1.15] tracking-tight text-stone-900" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
            Pokud vaše značka roste,
            <br />
            obraz musí růst s ní.
          </p>
          <a
            href="/start"
            className="mt-12 inline-block rounded-lg bg-stone-900 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-stone-800"
          >
            Spustit projekt
          </a>
        </div>
      </section>

      {/* 9️⃣ PATIČKA – tmavá, logo + krátká věta + kontakt, minimal. */}
      <footer className="w-full border-t border-stone-800 bg-stone-950 py-16">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 px-6 text-center xl:px-10">
          <a href="/" className="focus:outline-none" aria-label="Lucifera">
            <img
              src="/placeholders/LUCIFERA-Logo-Left.png"
              alt="Lucifera"
              className="mx-auto h-8 w-auto opacity-90 brightness-0 invert"
            />
          </a>
          <p className="max-w-[360px] text-sm text-stone-400">
            Prémiová vizuální identita pro osobní značky.
          </p>
          <a href="mailto:info@lucifera.cz" className="text-sm text-stone-500 underline-offset-4 hover:text-stone-300">
            Kontakt
          </a>
          <p className="text-xs text-stone-600">© {new Date().getFullYear()} Lucifera</p>
        </div>
      </footer>
    </main>
  );
}
