import { HeroImageFull } from "./components/HomePlaceholders";
import { Header } from "./components/Header";
import { VibeSection } from "./components/VibeSection";

const faqs = [
  {
    q: "Je to automatické?",
    a: "Ne. Každý krok je řízené strategické rozhodnutí. Kombinujeme lidskou zkušenost s moderními technologiemi (AI), ale směr určuje vždy vize a strategie.",
  },
  {
    q: "Jsou v ceně revize?",
    a: "Ano. Spolupráce je proces. Naším cílem není odevzdat soubory, ale vytvořit vizuální standard, za kterým si budete stoprocentně stát.",
  },
  {
    q: "Co když budu chtít dlouhodobou spolupráci?",
    a: "To je ideální cesta. Značka není jednorázový počin, ale živý systém. Většina našich klientů přechází do formátu kurátorského dohledu, kdy se staráme o jejich vizuální kontinuitu dlouhodobě.",
  },
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
              <a href="/start" className="rounded-lg bg-[#A8EB12] px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-[#A8EB12]/90">
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

      {/* Mezi hero a černý blok: Když značka roste… (světlý blok podle screenu). */}
      <section
        className="relative overflow-hidden py-20 md:py-[100px]"
        style={{ backgroundColor: "#F7F8F5", minHeight: "320px" }}
      >
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
              className="h-1.5 w-[100px] rounded-[3px] bg-[#A8EB12] md:w-[140px]"
              style={{ marginTop: "16px" }}
              aria-hidden
            />
          </div>
        </div>
      </section>

      <VibeSection />

      {/* BLOK 4 – Definice služby. Jen text, stejný layout jako na screenu. */}
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

      {/* SEKCE 2 – Obraz + text vedle sebe. Celý obrázek KDOJSEM_01 bez ořezu. */}
      <section id="rozdil" className="w-full bg-white py-[80px] md:py-[100px]">
        <div className="relative mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="relative flex justify-center lg:col-span-7">
              <img
                src="/placeholders/KDOJSEM_01.png"
                alt=""
                className="max-h-[75vh] w-full object-contain object-center"
              />
            </div>
            <div className="flex flex-col justify-center lg:col-span-5">
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

      {/* BLOK 6 – Ukázky práce v kontextu značky. Grid 2×2, limetkový hover. */}
      <section id="ukazky" className="w-full bg-[#F7F8F5] py-[80px] md:py-[100px]">
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="mx-auto max-w-[720px] text-center" style={{ marginBottom: "48px" }}>
            <h2
              className="font-bold leading-[1.1] text-[#111111]"
              style={{ fontSize: "52px", marginBottom: "16px" }}
            >
              Ukázky práce v kontextu značky
            </h2>
            <p className="text-[20px] leading-[1.6] text-[#3A3A3A]">
              Ne jednotlivé snímky. Ale vizuální jazyk, který funguje v praxi.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-10">
            <div className="overflow-hidden rounded-[16px] border-2 border-transparent transition-[box-shadow,border-color] duration-300 hover:border-[#A8EB12] hover:shadow-[0_0_0_2px_rgba(168,235,18,0.4)]">
              <img
                src="/placeholders/01_ukazky.png"
                alt="Pohled na web – mockup webové stránky klienta"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-[16px] border-2 border-transparent transition-[box-shadow,border-color] duration-300 hover:border-[#A8EB12] hover:shadow-[0_0_0_2px_rgba(168,235,18,0.4)]">
              <img
                src="/placeholders/01_ukazky_1.png"
                alt="Moodboard a strategie – koláž textur a vizuálů"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-[16px] border-2 border-transparent transition-[box-shadow,border-color] duration-300 hover:border-[#A8EB12] hover:shadow-[0_0_0_2px_rgba(168,235,18,0.4)]">
              <img
                src="/placeholders/01_ukazky_2.png"
                alt="Sociální sítě – kurátorský feed, konzistence"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-[16px] border-2 border-transparent transition-[box-shadow,border-color] duration-300 hover:border-[#A8EB12] hover:shadow-[0_0_0_2px_rgba(168,235,18,0.4)]">
              <img
                src="/placeholders/01_ukazky_3.png"
                alt="Portrétní série – různé polohy jedné osobnosti"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BLOK 7 – Vliv na vaši pozici. Tři pilíře + závěrečný statement. */}
      <section id="jak-to-funguje" className="w-full bg-[#FFFFFF] py-[140px]">
        <div className="mx-auto max-w-[1000px] px-6 text-center">
          <h2
            className="font-bold leading-[1.1] text-[#111111]"
            style={{ fontSize: "52px", marginBottom: "32px" }}
          >
            Co vám to přinese
          </h2>
          <p
            className="text-[20px] leading-[1.6] text-[#3A3A3A]"
            style={{ marginBottom: "56px" }}
          >
            Nezvyšujeme hlas. Zvyšujeme vaši úroveň.
          </p>
          <div className="grid grid-cols-1 gap-14 sm:grid-cols-3 lg:gap-[60px]">
            <div className="text-left">
              <div className="mb-4 h-[3px] w-10 rounded-full bg-[#A8EB12]" aria-hidden />
              <h3 className="text-[22px] font-bold leading-tight text-[#111111]">
                Navýšení vnímané hodnoty
              </h3>
              <p className="mt-3 text-[18px] leading-[1.6] text-[#3A3A3A]">
                Váš obraz přímo ovlivňuje vaši cenu. Správně nastavená identita stírá rozdíl mezi „šikovným profesionálem“ a nezpochybnitelnou autoritou v oboru.
              </p>
            </div>
            <div className="text-left">
              <div className="mb-4 h-[3px] w-10 rounded-full bg-[#A8EB12]" aria-hidden />
              <h3 className="text-[22px] font-bold leading-tight text-[#111111]">
                Zrychlení důvěry a čitelnosti
              </h3>
              <p className="mt-3 text-[18px] leading-[1.6] text-[#3A3A3A]">
                Trh si o vás vytvoří názor během několika sekund. Prémiový vizuál za vás odpracuje první fázi prodeje – klient už nemusí zjišťovat, jestli jste dobří, on to vidí.
              </p>
            </div>
            <div className="text-left">
              <div className="mb-4 h-[3px] w-10 rounded-full bg-[#A8EB12]" aria-hidden />
              <h3 className="text-[22px] font-bold leading-tight text-[#111111]">
                Klid a vizuální kontinuita
              </h3>
              <p className="mt-3 text-[18px] leading-[1.6] text-[#3A3A3A]">
                Konec vizuálního chaosu a neustálého řešení „co a jak“ publikovat. Získáte jasný systém a banku výstupů, které pracují pro vás, i když vy zrovna nejste online.
              </p>
            </div>
          </div>
          <p
            className="mt-20 text-center text-[24px] font-bold leading-snug text-[#111111]"
          >
            Váš obraz rozhoduje dřív, než začnete mluvit.
          </p>
        </div>
      </section>

      {/* BLOK 8 – Struktura spolupráce. Framework, ne ceník. */}
      <section id="struktura-spoluprace" className="w-full bg-[#F7F8F5] py-[140px]">
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="max-w-[720px]">
            <h2
              className="font-bold leading-[1.1] text-[#111111]"
              style={{ fontSize: "clamp(2rem, 4.5vw, 52px)", marginBottom: "16px" }}
            >
              Struktura spolupráce
            </h2>
            <p
              className="text-[20px] leading-[1.6] text-[#3A3A3A]"
              style={{ marginBottom: "56px" }}
            >
              Tři fáze od strategie po dlouhodobou implementaci.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="relative">
              <span
                className="pointer-events-none absolute -top-2 left-0 select-none font-bold text-[#111111] opacity-[0.15]"
                style={{ fontSize: "clamp(3rem, 8vw, 5rem)", lineHeight: 1 }}
                aria-hidden
              >
                01
              </span>
              <div className="h-[3px] w-6 rounded-full bg-[#A8EB12]" style={{ marginBottom: "20px" }} aria-hidden />
              <h3 className="text-[22px] font-bold leading-tight text-[#111111]">
                Strategie a vizuální směr
              </h3>
              <p className="mt-3 text-[18px] leading-[1.65] text-[#3A3A3A]">
                Analýza vaší současné pozice a návrh standardu, který odpovídá vaší reálné hodnotě. Definujeme, jak má vaše značka působit, dřív než stiskneme spoušť.
              </p>
            </div>
            <div className="relative">
              <span
                className="pointer-events-none absolute -top-2 left-0 select-none font-bold text-[#111111] opacity-[0.15]"
                style={{ fontSize: "clamp(3rem, 8vw, 5rem)", lineHeight: 1 }}
                aria-hidden
              >
                02
              </span>
              <div className="h-[3px] w-6 rounded-full bg-[#A8EB12]" style={{ marginBottom: "20px" }} aria-hidden />
              <h3 className="text-[22px] font-bold leading-tight text-[#111111]">
                Realizace obsahu
              </h3>
              <p className="mt-3 text-[18px] leading-[1.65] text-[#3A3A3A]">
                Portrétní a obsahová tvorba. Neřešíme počet snímků, ale jejich dopad. Vytvoříme vizuální banku, která za vás odpracuje první fázi prodeje.
              </p>
            </div>
            <div className="relative">
              <span
                className="pointer-events-none absolute -top-2 left-0 select-none font-bold text-[#111111] opacity-[0.15]"
                style={{ fontSize: "clamp(3rem, 8vw, 5rem)", lineHeight: 1 }}
                aria-hidden
              >
                03
              </span>
              <div className="h-[3px] w-6 rounded-full bg-[#A8EB12]" style={{ marginBottom: "20px" }} aria-hidden />
              <h3 className="text-[22px] font-bold leading-tight text-[#111111]">
                Implementace a kontinuita
              </h3>
              <p className="mt-3 text-[18px] leading-[1.65] text-[#3A3A3A]">
                Nastavení systému pro dlouhodobou čitelnost. Propojení reality s technologiemi (AI, digitální dvojníci), aby vaše značka zůstala konzistentní i bez vaší neustálé přítomnosti.
              </p>
            </div>
          </div>
          <p
            className="mt-10 max-w-[720px] text-[16px] italic leading-[1.6] text-[#6E6E6E]"
          >
            Investice do prémiové identity začíná na [doplň částku] a je vždy přizpůsobena rozsahu vašeho byznysu a vašim cílům.
          </p>
          <a
            href="/start"
            className="mt-8 inline-block rounded-lg bg-[#A8EB12] px-8 py-3.5 text-base font-semibold text-zinc-900 hover:bg-[#A8EB12]/90"
          >
            Domluvit strategickou konzultaci
          </a>
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
                <span className="text-[#A8EB12]">✓</span> 3 příspěvky
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#A8EB12]">✓</span> Text + vizuál
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#A8EB12]">✓</span> Doručení do 48 hodin
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#A8EB12]">✓</span> 800 Kč (zaváděcí cena)
              </li>
            </ul>
            <ul className="mt-6 space-y-3 border-t border-stone-100 pt-6 text-sm text-stone-600">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-[#A8EB12]">•</span>
                <span>3 příspěvky za 800 Kč. To je cena jednoho lepšího byznys oběda. Ten vás ale na sítě neprotlačí.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-[#A8EB12]">•</span>
                <span>Dopřejte si týden klidu za cenu, kterou byste jinde dali za 15 minut konzultace.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-[#A8EB12]">•</span>
                <span>Zkuste si to na týden. Riziko je nula, zisk je váš volný čas zpět.</span>
              </li>
            </ul>
            <p className="mt-6 text-sm text-stone-500">
              Kapacita je omezená.
            </p>
            <a
              href="/start?plan=test-week"
              className="mt-8 block w-full rounded-lg bg-[#A8EB12] py-3 text-center text-sm font-semibold text-zinc-900 hover:bg-[#A8EB12]/90"
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
            <div className="rounded-xl border border-[#A8EB12]/30 bg-[#A8EB12]/5 px-8 py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#A8EB12]/50 bg-[#A8EB12]/10">
                <span className="text-lg font-bold text-stone-700">AI</span>
              </div>
              <p className="mt-3 text-sm font-medium text-stone-900">AI</p>
              <p className="text-xs text-stone-500">Neuronová síť, generace</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#A8EB12]/30 text-stone-700">
              <span className="text-xl">✦</span>
            </div>
            <div className="rounded-xl border border-[#A8EB12]/30 bg-[#A8EB12]/5 px-8 py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-[#A8EB12]/50 bg-[#A8EB12]/10">
                <img src="/placeholders/mia-mozek.png" alt="" className="h-full w-full object-cover opacity-60" />
              </div>
              <p className="mt-3 text-sm font-medium text-stone-900">Kurátor</p>
              <p className="text-xs text-stone-500">Kontrola, tón, kvalita</p>
            </div>
          </div>
          <div className="mt-10 rounded-xl border border-[#A8EB12]/20 bg-[#A8EB12]/5 p-8">
            <p className="text-center text-stone-700">
              AI dramaticky urychluje produkci a eliminuje prázdnou stránku. Ale na konci vždy stojí náš Kreativní kurátor.
              Každý výstup pečlivě kontroluje. Hlídá kvalitu, tón vaší značky a funkčnost sdělení. Když je potřeba, zasáhne ručně, aby výstup nebyl jen rychlý, ale především prvotřídní a přesný.
            </p>
          </div>
          <ul className="mt-10 space-y-4 text-stone-700">
            <li className="flex gap-3">
              <span className="mt-1 shrink-0 text-[#A8EB12]">•</span>
              <span>Váš mozek má omezenou kapacitu na kreativitu. Vyčerpáte si ji ráno na Instagramu, nebo ji necháte pro své platící klienty?</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 shrink-0 text-[#A8EB12]">•</span>
              <span>Každá minuta, kdy řešíte fonty a hashtagy, je minuta, kdy neřídíte svůj byznys.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 shrink-0 text-[#A8EB12]">•</span>
              <span>Lucifera neřeší jen texty. Řeší vaši rozhodovací únavu. My tvoříme, vy rozhodujete. To je vše.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 shrink-0 text-[#A8EB12]">•</span>
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

      {/* BLOK 9 – Filtrace (Vyšší liga). Vizuálně čistý, textově nekompromisní. */}
      <section id="pro-koho" className="w-full bg-[#F7F8F5] py-20 lg:py-24">
        <div className="mx-auto max-w-[720px] px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
            Tato spolupráce není pro každého.
          </h2>
          <p className="mt-6 text-[18px] leading-[1.75] text-stone-600">
            Je pro ty, kteří vědí, že jejich značka už dávno vyrostla – a jsou připraveni ji nést. Pokud hledáte jen jednotlivé fotografie nebo rychlá, provizorní řešení, pravděpodobně to nebude správná cesta.
          </p>
          <p className="mt-6 text-[20px] font-bold leading-[1.5] text-stone-900">
            Pokud vaše značka roste, obraz musí růst s ní.
          </p>
        </div>
      </section>

      {/* BLOK 10 – Často kladené otázky. Minimalistický akordeon, limetkové oddělovače. */}
      <section id="faq" className="w-full border-t border-stone-200 bg-stone-50 px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">Často kladené otázky</h2>
          <div className="mt-10">
            {faqs.map((faq, index) => (
              <div key={faq.q}>
                {index > 0 && <div className="h-[2px] w-full bg-[#A8EB12]/50" aria-hidden />}
                <details className="overflow-hidden bg-[#FBFBF6] [&[open]]:ring-1 [&[open]]:ring-[#A8EB12]/40">
                  <summary className="cursor-pointer list-none px-0 py-5 font-semibold text-stone-900 [&::-webkit-details-marker]:hidden">
                    {faq.q}
                  </summary>
                  <p className="border-t border-stone-100 pb-5 pt-2 text-[17px] leading-[1.65] text-stone-600">{faq.a}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOK 11 – Závěrečné CTA. Černé pozadí, hlavní poselství o čitelnosti. */}
      <section id="zaver" className="w-full bg-[#111111] px-6 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl md:leading-[1.15]">
            Silná značka není hlasitá. Je čitelná.
          </h2>
          <p className="mt-6 text-xl font-medium text-[#A8EB12] sm:text-2xl">
            A čitelnost je otázka rozhodnutí.
          </p>
          <a
            href="/start"
            className="mt-10 inline-block rounded-lg bg-[#A8EB12] px-8 py-4 text-base font-semibold text-zinc-900 hover:bg-[#A8EB12]/90"
          >
            DOMLUVIT STRATEGICKOU KONZULTACI
          </a>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white py-8 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} AI Content Studio Lucifera
      </footer>
    </main>
  );
}
