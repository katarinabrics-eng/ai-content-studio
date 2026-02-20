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
            <a href="#jak-to-funguje" className="transition-colors hover:text-zinc-900">Jak to funguje</a>
            <a href="#problem" className="transition-colors hover:text-zinc-900">Problém</a>
            <a href="#reseni" className="transition-colors hover:text-zinc-900">Řešení</a>
            <a href="#proc-my" className="transition-colors hover:text-zinc-900">Proč my</a>
            <a href="#faq" className="transition-colors hover:text-zinc-900">FAQ</a>
            <a href="#kontakt" className="transition-colors hover:text-zinc-900">Kontakt</a>
          </nav>
          <a href="/start" className="btn-lime-primary text-zinc-900">
            Spustit projekt
          </a>
        </div>
      </header>

      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: "calc(100vh - 76px)" }}
      >
        <HeroImageFull />
        <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/30 to-transparent lg:from-white/65 lg:via-white/20 lg:to-transparent" />
        <div className="relative mx-auto flex min-h-[calc(100vh-76px)] max-w-[1720px] flex-col justify-center px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="animate-fade-in max-w-2xl">
            <h1
              className="font-sans font-black tracking-[-0.035em] text-zinc-900"
              style={{
                fontSize: "clamp(2.25rem, 5.2vw, 6rem)",
                lineHeight: 0.95,
              }}
            >
              Obsah, který má směr.
            </h1>
            <p
              className="mt-6 max-w-xl text-lg text-zinc-700"
              style={{ lineHeight: "1.875rem" }}
            >
              Vizuálně silné příspěvky pod odborným dohledem.
              Technologie generuje. Já rozhoduji.
            </p>
            <p className="mt-4 text-sm font-medium text-zinc-600">
              Doručení do 48 hodin · Zaváděcí cena 800 Kč
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="/start" className="btn-lime-primary text-zinc-900">
                Chci mít hotovo
              </a>
              <a
                href="#jak-to-funguje"
                className="rounded-full border border-lucifera-lime/50 bg-white/50 px-6 py-3 text-sm font-medium text-zinc-900 backdrop-blur-sm transition-colors hover:bg-lucifera-lime/10"
              >
                Jak to funguje
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="relative w-full bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Nejste líní. Jste jen přehlcení.
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-stone-600">
            Většina podnikatelů a specialistů nechce nepostovat. Jen na to po celém dni plném klientské práce a řízení byznysu už zkrátka nezbývá kapacita.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { text: "Znáte své téma perfektně, ale nevíte, jak ho prodat na sítích.", icon: "theme" },
              { text: "Když už si sednete k obsahu, ztrácíte hodiny přepisováním jedné věty.", icon: "hourglass" },
              { text: "Každý příspěvek je mentální start od nuly. Prázdný rám čeká.", icon: "frame" },
            ].map((card) => (
              <div key={card.icon} className="glass-lime flex flex-col p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-lucifera-lime/15 text-zinc-700">
                  {card.icon === "hourglass" && (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {card.icon === "theme" && (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  )}
                  {card.icon === "frame" && (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                  )}
                </div>
                <p className="text-stone-700">{card.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-stone-600">
            Místo toho, abyste se věnovali tomu, co vás živí, řešíte co dnes dát na Instagram nebo LinkedIn.
          </p>
        </div>
      </section>

      <section id="reseni" className="relative w-full bg-stone-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Neřešíme jen texty. Řešíme vaši rozhodovací únavu.
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-stone-600">
            Náš cíl není vygenerovat náhodný text. Náš cíl je zařídit, aby vám z hlavy zmizel každodenní tlak na obsah. Vaše značka bude vidět pravidelně, kvalitně a konzistentně – a vy u toho nebudete muset trpět.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-red-500">Dříve</h3>
              <ul className="mt-4 space-y-3 text-stone-600">
                <li className="flex items-center gap-2"><span className="text-red-400">✕</span> Co dnes postnout?</li>
                <li className="flex items-center gap-2"><span className="text-red-400">✕</span> Nemám kapacitu.</li>
                <li className="flex items-center gap-2"><span className="text-red-400">✕</span> Zase jsem nic nevydal/a.</li>
              </ul>
            </div>
            <div className="glass-lime p-8">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-900">S Luciferou</h3>
              <ul className="mt-4 space-y-3 text-stone-800">
                <li className="flex items-center gap-2"><span className="text-zinc-700">✓</span> Mám návrhy včas a bez stresu.</li>
                <li className="flex items-center gap-2"><span className="text-zinc-700">✓</span> Vím přesně, co a kdy jde ven.</li>
                <li className="flex items-center gap-2"><span className="text-zinc-700">✓</span> Sítě běží, já řeším svoji práci.</li>
              </ul>
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
