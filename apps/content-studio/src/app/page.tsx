import { HeroImageFull } from "./components/HomePlaceholders";
import { Header } from "./components/Header";

const CONSULTATION_URL = "/start";

const faqs = [
  { q: "Kolik výstupů obdržím?", a: "Rozsah výstupů se nastavuje individuálně podle cílů projektu a dohodnutého rozsahu spolupráce." },
  { q: "Jak dlouho spolupráce trvá?", a: "Délka závisí na rozsahu projektu. Po úvodní konzultaci vám předáme časový rámec." },
  { q: "Pomáháte i s výběrem lokace a stylingu?", a: "Ano. Koncepce focení zahrnuje doporučení lokací a stylingu v souladu se strategií značky." },
  { q: "Je možné spolupráci rozšířit o video?", a: "Možnosti rozšíření řešíme individuálně dle potřeb projektu." },
  { q: "Co když už část vizuálu mám?", a: "Existující materiály zapracujeme do strategie a doplníme tak, aby vznikl konzistentní celek." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <Header />

      {/* 1) HERO */}
      <section className="relative min-h-[90vh] w-full overflow-hidden bg-stone-50">
        <div className="absolute inset-0">
          <HeroImageFull />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, rgba(250,250,249,0.94) 0%, rgba(250,250,249,0.4) 40%, transparent 60%)",
          }}
        />
        {/* Limetkový prvek – vertikální akcent */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1 sm:w-2 bg-[#A3E635]"
          aria-hidden
        />
        <div className="relative mx-auto flex min-h-[90vh] max-w-[1280px] flex-col justify-center px-6 py-20 xl:px-12">
          <div className="max-w-[560px]">
            <h1 className="text-4xl font-bold tracking-tight text-stone-900 md:text-5xl lg:text-6xl lg:leading-[1.05]">
              Prémiová vizuální identita pro osobní značky
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-stone-800 md:text-2xl">
              Vaše značka vyrostla.
              <br />
              Je čas, aby její obraz nesl stejnou úroveň.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-stone-600">
              Pro podnikatele, experty a tváře značek, které vstupují do vyšší kategorie trhu a chtějí působit přesně tak, jakou hodnotu skutečně přinášejí.
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <a
                href={CONSULTATION_URL}
                className="inline-flex rounded-lg bg-[#A3E635] px-8 py-4 text-base font-semibold text-stone-900 shadow-sm transition hover:bg-[#A3E635]/90 focus:outline-none focus:ring-2 focus:ring-[#A3E635] focus:ring-offset-2"
              >
                Rezervovat konzultaci
              </a>
              <a
                href="#proces"
                className="inline-flex rounded-lg border border-stone-300 bg-white px-8 py-4 text-base font-medium text-stone-800 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2"
              >
                Zjistit průběh spolupráce
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2) REALITA */}
      <section id="realita" className="w-full border-t border-stone-200 bg-white px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Možná už máte výsledky, zkušenosti i stabilní klientelu.
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-stone-600">
            Váš byznys dozrál. Vizuální prezentace však často zůstává složená z jednotlivostí, které spolu netvoří jednotný dojem.
          </p>
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-8">
              <p className="text-lg leading-relaxed text-stone-700">
                Vizuál vznikal postupně, bez jednotné linie.
              </p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-8">
              <p className="text-lg leading-relaxed text-stone-700">
                Prezentace je kvalitní, ale neukotvuje autoritu.
              </p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-8">
              <p className="text-lg leading-relaxed text-stone-700">
                Jednotlivé výstupy fungují, celek nemá jasný podpis.
              </p>
            </div>
          </div>
          <p className="mt-14 text-xl font-semibold text-stone-900">
            A právě tady začíná prostor pro novou úroveň.
          </p>
        </div>
      </section>

      {/* 3) PROBLÉM */}
      <section id="problem" className="w-full border-t border-stone-200 bg-stone-50 px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Hezké fotografie nejsou identita.
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-stone-600">
            Pokud vizuální obraz nenese vaši skutečnou úroveň, oslabuje vnímání vaší značky dřív, než začne samotná komunikace.
          </p>
          <ul className="mt-12 space-y-4">
            <li className="flex gap-3 text-lg text-stone-700">
              <span className="text-[#A3E635]">–</span>
              Bez systému působí značka roztříštěně.
            </li>
            <li className="flex gap-3 text-lg text-stone-700">
              <span className="text-[#A3E635]">–</span>
              Bez směru se ztrácí vnímaná hodnota.
            </li>
            <li className="flex gap-3 text-lg text-stone-700">
              <span className="text-[#A3E635]">–</span>
              Bez kontextu zůstává jen estetika.
            </li>
          </ul>
          <p className="mt-14 text-xl font-semibold text-stone-900">
            Vizuální identita není doplněk. Je to strategická pozice.
          </p>
          <a
            href="#co-zahrnuje"
            className="mt-8 inline-block text-base font-medium text-[#A3E635] underline decoration-[#A3E635]/50 underline-offset-4 hover:decoration-[#A3E635] focus:outline-none focus:ring-2 focus:ring-[#A3E635] focus:ring-offset-2 focus:ring-offset-stone-50"
          >
            Chci vidět systém
          </a>
        </div>
      </section>

      {/* 4) CO SLUŽBA ZAHRNUJE */}
      <section id="co-zahrnuje" className="w-full border-t border-stone-200 bg-white px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Co přesně zahrnuje prémiová vizuální identita
          </h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-stone-200 bg-stone-50/30 p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-900">Strategický vizuální směr</h3>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-stone-600">
                <li>analýza značky a cílového vnímání</li>
                <li>definice vizuální energie</li>
                <li>moodboard a vizuální archetyp</li>
                <li>směr komunikace v obraze</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-stone-50/30 p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-900">Portrétní focení</h3>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-stone-600">
                <li>koncepčně vedené focení</li>
                <li>práce s výrazem, držením a energií</li>
                <li>doporučení stylingu</li>
                <li>lokace vycházející ze strategie</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-stone-50/30 p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-900">Vizuální systém</h3>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-stone-600">
                <li>barevnost a tonalita</li>
                <li>kompozice a obrazový rytmus</li>
                <li>grafické prvky</li>
                <li>jednotný styl práce s vizuálem</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-stone-50/30 p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-900">Použitelnost</h3>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-stone-600">
                <li>výstupy pro web</li>
                <li>výstupy pro sociální sítě</li>
                <li>horizontální i vertikální formáty</li>
                <li>obsahový základ na několik měsíců</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* 5) PROCES SPOLUPRÁCE */}
      <section id="proces" className="w-full border-t border-stone-200 bg-stone-50 px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Jak spolupráce probíhá
          </h2>
          <ol className="mt-16 space-y-10">
            {[
              { step: "Úvodní konzultace", text: "Ujasníme cíle, pozici a očekávaný výsledek." },
              { step: "Strategická příprava", text: "Nastavíme směr, vizuální jazyk a kontext značky." },
              { step: "Koncepce a plán focení", text: "Připravíme scénář, styling a lokace." },
              { step: "Realizace", text: "Fotíme s jasnou koncepcí a důrazem na konzistenci." },
              { step: "Postprodukce a předání systému", text: "Obdržíte výstupy i pravidla pro dlouhodobé použití." },
            ].map((item, i) => (
              <li key={item.step} className="flex gap-8">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#A3E635] text-sm font-bold text-stone-900">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-stone-900">{item.step}</h3>
                  <p className="mt-2 text-stone-600">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 6) VÝSLEDEK */}
      <section id="vysledek" className="w-full border-t border-stone-200 bg-white px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Když je vizuální identita nastavená správně, vaše hodnota je čitelná na první pohled.
          </h2>
          <p className="mt-6 text-lg text-stone-600">
            Bez vysvětlování. Bez improvizace.
          </p>
          <ul className="mt-12 space-y-4 text-lg text-stone-700">
            <li className="flex gap-3">
              <span className="text-[#A3E635]">•</span>
              silnější první dojem
            </li>
            <li className="flex gap-3">
              <span className="text-[#A3E635]">•</span>
              vyšší cenová pozice
            </li>
            <li className="flex gap-3">
              <span className="text-[#A3E635]">•</span>
              konzistentní komunikace napříč kanály
            </li>
            <li className="flex gap-3">
              <span className="text-[#A3E635]">•</span>
              méně operativy při tvorbě obsahu
            </li>
            <li className="flex gap-3">
              <span className="text-[#A3E635]">•</span>
              větší jistota ve veřejné prezentaci
            </li>
          </ul>
        </div>
      </section>

      {/* 7) PRO KOHO */}
      <section id="pro-koho" className="w-full border-t border-stone-200 bg-stone-50 px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Pro koho je tato spolupráce
          </h2>
          <div className="mt-16 grid gap-12 lg:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-stone-900">Je pro vás, pokud:</h3>
              <ul className="mt-6 space-y-3 text-stone-700">
                <li className="flex gap-3">
                  <span className="text-[#A3E635]" aria-hidden>✓</span>
                  máte za sebou reálné výsledky
                </li>
                <li className="flex gap-3">
                  <span className="text-[#A3E635]" aria-hidden>✓</span>
                  vaše cenotvorba roste
                </li>
                <li className="flex gap-3">
                  <span className="text-[#A3E635]" aria-hidden>✓</span>
                  vstupujete do vyšší tržní kategorie
                </li>
                <li className="flex gap-3">
                  <span className="text-[#A3E635]" aria-hidden>✓</span>
                  chcete profesionální a dlouhodobě konzistentní obraz značky
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-900">Není pro vás, pokud:</h3>
              <ul className="mt-6 space-y-3 text-stone-600">
                <li className="flex gap-3">
                  <span className="text-stone-400">–</span>
                  jste na úplném začátku podnikání
                </li>
                <li className="flex gap-3">
                  <span className="text-stone-400">–</span>
                  hledáte rychlé jednorázové řešení
                </li>
                <li className="flex gap-3">
                  <span className="text-stone-400">–</span>
                  potřebujete pouze několik fotografií bez systému
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8) INVESTICE */}
      <section id="investice" className="w-full border-t border-stone-200 bg-white px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Investice
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-stone-600">
            Jde o prémiovou službu pro podnikatele, kteří chtějí, aby jejich vizuální prezentace odpovídala úrovni jejich byznysu.
          </p>
          <p className="mt-10 text-2xl font-semibold text-stone-900">
            Investice začíná na: [DOPLŇTE ČÁSTKU]
          </p>
          <p className="mt-4 text-stone-600">
            Konečný rozsah nastavujeme individuálně dle cílů projektu.
          </p>
        </div>
      </section>

      {/* 9) FAQ */}
      <section id="faq" className="w-full border-t border-stone-200 bg-stone-50 px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[720px]">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Často kladené otázky
          </h2>
          <div className="mt-12 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm [&[open]]:border-[#A3E635]/30"
              >
                <summary className="cursor-pointer list-none px-6 py-5 font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#A3E635] focus:ring-inset [&::-webkit-details-marker]:hidden">
                  {faq.q}
                </summary>
                <p className="border-t border-stone-100 px-6 py-5 text-stone-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10) FINÁLNÍ CTA */}
      <section className="w-full border-t border-stone-200 bg-stone-50 px-6 py-28 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[640px] text-center">
          <p className="text-2xl font-semibold leading-snug text-stone-900 md:text-3xl">
            Vaše značka už vyrostla.
            <br />
            Dovolte jejímu obrazu, aby ji důstojně následoval.
          </p>
          <a
            href={CONSULTATION_URL}
            className="mt-12 inline-block rounded-lg bg-[#A3E635] px-10 py-4 text-base font-semibold text-stone-900 shadow-sm transition hover:bg-[#A3E635]/90 focus:outline-none focus:ring-2 focus:ring-[#A3E635] focus:ring-offset-2 focus:ring-offset-stone-50"
          >
            Rezervovat konzultaci
          </a>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white py-10 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} Lucifera
      </footer>
    </main>
  );
}
