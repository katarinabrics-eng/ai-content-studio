import { HeroImageFull } from "./components/HomePlaceholders";
import { Header } from "./components/Header";
import { VibeSection } from "./components/VibeSection";

const faqs = [
  { q: "Je to automatické?", a: "Ne. Každý výstup prochází dohledem." },
  { q: "Jsou v ceně revize?", a: "U testovací nabídky 800 Kč doručujeme finální návrhy bez revizí." },
  { q: "Co když budu chtít dlouhodobou spolupráci?", a: "Navazující paušální model je k dispozici." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <Header />

      <section className="relative w-full min-h-[85vh] overflow-hidden bg-white">
        <div className="absolute inset-0">
          <HeroImageFull />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.35) 35%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto flex min-h-[85vh] max-w-[1360px] flex-col justify-center px-6 py-16 xl:px-10">
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
              <a href="/start" className="rounded-lg bg-[#A3E635] px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-[#A3E635]/90">
                Posunout značku výš
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

      {/* Mezi hero a černý blok: To funguje, dokud vás znají osobně. */}
      <section className="w-full bg-white py-16 md:py-20">
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <p className="max-w-[720px] text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.15] text-[#111111]">
            To funguje, dokud vás znají osobně.
          </p>
        </div>
      </section>

      <VibeSection />

      {/* BLOK 2 – Klidná autorita. Stejný grid jako Hero. Žádné boxy, gradienty ani dekorace. */}
      <section
        id="manifest"
        className="relative overflow-hidden py-20 md:py-[100px]"
        style={{ backgroundColor: "#F7F8F5", minHeight: "520px" }}
      >
        {/* Stejný container jako Hero — levé zarovnání na stejné gridové ose */}
        <div className="relative mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="max-w-[720px]">
            <h2
              className="font-bold leading-[1.08] text-[#111111]"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 64px)",
                marginBottom: "40px",
              }}
            >
              Když značka roste
              <br />
              rychleji než její obraz
            </h2>
            <div
              className="text-[20px] leading-[1.8] text-[#3A3A3A]"
              style={{ marginBottom: "48px" }}
            >
              <p>Vaše podnikání se vyvíjí.</p>
              <p>Vaše odpovědnost roste.</p>
              <p>Vaše publikum také.</p>
            </div>
            <p
              className="text-[20px] font-medium leading-[1.6] text-[#1A1A1A]"
              style={{ marginTop: "32px" }}
            >
              Vizuální prezentace často zůstává tam, kde byla před lety.
            </p>
            <div
              className="h-1.5 w-[100px] rounded-[3px] bg-[#A3FF00] md:w-[140px]"
              style={{ marginTop: "16px" }}
              aria-hidden
            />
          </div>
        </div>
      </section>

      {/* BLOK 3 – Struktura a standard (Racionální pilíře). Grid 2×2, jemná limetková linka. */}
      <section id="pilire" className="w-full bg-white py-[120px]">
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <h2
            className="max-w-[720px] font-bold leading-[1.15] text-[#111111]"
            style={{ fontSize: "clamp(2rem, 4vw, 56px)", marginBottom: "32px" }}
          >
            To funguje, dokud vás znají osobně.
          </h2>
          <p
            className="max-w-[680px] text-[20px] leading-[1.8] text-[#3A3A3A]"
            style={{ marginBottom: "72px" }}
          >
            Jakmile vstupujete do většího prostoru,
            <br />
            váš obraz musí unést víc než jen sympatie.
            <br />
            Musí unést vaši úroveň.
          </p>
          <div className="grid max-w-[900px] grid-cols-1 gap-x-20 gap-y-10 sm:grid-cols-2 lg:gap-y-[60px]">
            {[
              { title: "Vizuál, který působí jednotně.", sub: "Jednotný jazyk napříč všemi kanály." },
              { title: "Obraz, který odpovídá vaší ceně.", sub: "Prezentace na úrovni vašeho reálného byznysu." },
              { title: "Prezentace, která nepůsobí nahodile.", sub: "Záměr místo neustálé improvizace." },
              { title: "Jasný vizuální směr místo improvizace.", sub: "Strategie, ne jen jednorázové řešení." },
            ].map((item) => (
              <div key={item.title} className="max-w-[420px]">
                <div className="mb-4 h-[3px] w-12 rounded-full bg-[#A3FF00]" aria-hidden />
                <p className="text-[20px] font-medium leading-[1.5] text-[#1A1A1A]">{item.title}</p>
                <p className="mt-1 text-[17px] leading-[1.5] text-[#555555]">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOK 4 – Definice služby. Strategické rozhodnutí, bez vysvětlování. */}
      <section id="definice-sluzby" className="w-full bg-[#F7F8F5] py-[140px]">
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="max-w-[760px]">
            <h2
              className="font-bold leading-[1.1] text-[#111111]"
              style={{ fontSize: "clamp(2rem, 4.5vw, 56px)", marginBottom: "32px" }}
            >
              Prémiová vizuální identita není kosmetická úprava.
            </h2>
            <p className="text-[20px] leading-[1.8] text-[#2A2A2A]">
              Je to strategické rozhodnutí.
              <br />
              Ukazuje, kdo jste – bez vysvětlování.
            </p>
          </div>
        </div>
      </section>

      <section id="co-delame" className="hidden" aria-hidden="true" />

      {/* SEKCE 2 – Obraz + zkušenost. Obraz 60–70 %, text posunutý níž = diagonální tok oka. */}
      <section id="rozdil" className="w-full bg-white py-[160px]">
        <div className="relative mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="relative lg:col-span-8">
              <img
                src="/placeholders/KDOJSEM_01.png"
                alt=""
                className="w-full object-cover object-center"
                style={{ aspectRatio: "3/4", maxHeight: "600px" }}
              />
            </div>
            <div className="flex flex-col justify-center lg:col-span-5 lg:col-start-8 lg:mt-24">
              <h2
                className="font-bold leading-[1.1] tracking-tight text-[#111111]"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "24px" }}
              >
                Rozhoduje zkušenost.
                <br />
                A schopnost vidět souvislosti.
              </h2>
              <p className="text-[19px] leading-[1.75] text-[#333333]" style={{ marginBottom: "20px" }}>
                Technologie navrhuje. Zkušenost vybírá.
              </p>
              <p className="text-[19px] leading-[1.75] text-[#333333]" style={{ marginBottom: "20px" }}>
                25 let práce s obrazem.
              </p>
              <p className="text-[19px] leading-[1.75] text-[#333333]" style={{ marginBottom: "28px" }}>
                Reálné projekty. Reálné značky.
              </p>
              <p className="text-[18px] font-medium leading-[1.6] text-[#1A1A1A]">
                Pracuji s těmi, kteří vědí, že jejich značka už dávno vyrostla.
              </p>
              <a
                href="/start"
                className="mt-8 inline-block text-[17px] font-medium text-[#111111] underline underline-offset-4 hover:no-underline"
              >
                Domluvit strategickou konzultaci
              </a>
            </div>
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

      {/* Pro koho to není – filtrování, vyšší liga. */}
      <section id="pro-koho" className="w-full border-t border-stone-200 bg-white px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[720px]">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
            Pro koho to není
          </h2>
          <p className="mt-6 text-[18px] leading-[1.75] text-stone-600">
            Tato spolupráce není pro každého. Je pro ty, kteří vědí, že jejich značka už dávno vyrostla – a jsou připraveni ji nést.
          </p>
          <p className="mt-4 text-[18px] leading-[1.75] text-stone-600">
            Pokud hledáte jen jednotlivé fotografie nebo rychlá, provizorní řešení, pravděpodobně to nebude správná cesta.
          </p>
          <p className="mt-4 text-[18px] font-medium leading-[1.75] text-stone-800">
            Pokud chcete svou značku posunout do vyšší vizuální kategorie, pak dává smysl pokračovat.
          </p>
        </div>
      </section>

      <section id="zaver" className="w-full border-t border-stone-200 bg-stone-50 px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Pokud vaše značka roste, obraz musí růst s ní.
          </h2>
          <a
            href="/start"
            className="mt-10 inline-block rounded-lg border-2 border-stone-900 bg-stone-900 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-stone-800"
          >
            Domluvit strategickou konzultaci
          </a>
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
