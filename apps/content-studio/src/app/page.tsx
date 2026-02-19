import { HeroImageFull } from "./components/HomePlaceholders";

const processSteps = [
  { title: "Vyberete tarif", text: "Zvolíte balíček podle tempa, které vaše značka právě potřebuje.", icon: "cursor" },
  { title: "Vyplníte formulář", text: "Krátký onboarding. Předáte nám brand, cílovku a tón komunikace.", day: "Pondělí", icon: "form" },
  { title: "Dostanete 3 návrhy", text: "Do 24–48 hodin vám pošleme konkrétní příspěvky připravené ke schválení.", day: "Úterý/Středa", icon: "cards" },
  { title: "Schválíte nebo připomínkujete", text: "Pokud máte námitky, obratem je zapracujeme.", day: "Čtvrtek", icon: "check" },
  { title: "Máte hotovo", text: "Do dalšího dne máte finální verzi připravenou k propagaci.", day: "Pátek", icon: "rocket" },
];

const faqs = [
  { q: "Je potřeba hodně schůzek a callů?", a: "Ne. Náš systém je postavený tak, abyste nemuseli trávit hodiny na meetinzích. Spolupráce je asynchronní a rychlá." },
  { q: "Co když s návrhem nesouhlasíme?", a: "To se může stát. Jednoduše nám pošlete své námitky, my je upravíme a do dalšího dne vám dodáme finální, vyladěnou verzi." },
  { q: "Jak rychle uvidíme první výstupy?", a: "První 3 návrhy od nás standardně dostanete do 24–48 hodin od dodání podkladů." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-lucifera-dark">
      {/* NAV — Lucifera Glass */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-lucifera-dark/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="focus:outline-none">
            <span className="text-sm font-semibold tracking-wide text-white">AI CONTENT STUDIO LUCIFERA</span>
            <span className="ml-2 text-xs text-white/60">AI + kreativní kurátor</span>
          </a>
          <nav className="hidden gap-8 text-sm text-white/80 md:flex">
            <a href="#jak-to-funguje" className="transition-colors hover:text-lucifera-lime">Jak to funguje</a>
            <a href="#problem" className="transition-colors hover:text-lucifera-lime">Problém</a>
            <a href="#reseni" className="transition-colors hover:text-lucifera-lime">Řešení</a>
            <a href="#proc-my" className="transition-colors hover:text-lucifera-lime">Proč my</a>
            <a href="#faq" className="transition-colors hover:text-lucifera-lime">FAQ</a>
            <a href="#kontakt" className="transition-colors hover:text-lucifera-lime">Kontakt</a>
          </nav>
          <a href="#kontakt" className="btn-lime-primary">
            Zvolit tarif
          </a>
        </div>
      </header>

      {/* HERO — moving light map bg + big glass panel + visual */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Abstract moving light map background */}
        <div
          className="absolute inset-0 opacity-40 animate-light-map"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(192, 255, 0, 0.15) 0%, transparent 50%), radial-gradient(ellipse 60% 80% at 80% 60%, rgba(192, 255, 0, 0.08) 0%, transparent 45%), radial-gradient(ellipse 100% 100% at 50% 50%, rgba(10, 15, 13, 0) 0%, #0d1210 70%)",
          }}
        />
        <div className="absolute inset-0 bg-lucifera-dark" />
        <div className="relative z-10 grid min-h-screen w-full grid-cols-1 items-center px-4 py-20 lg:grid-cols-2 lg:gap-12 lg:px-12 xl:px-16">
          {/* Main glass panel with copy */}
          <div className="glass-panel p-8 md:p-10 lg:p-12">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Tvorba sítí nemá být každodenní boj. Věnujte se své profesi, obsah nechte na nás.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              Znáte to: zahlcení, paralýza před prázdnou obrazovkou a pocit, že „zase nic nevyšlo“. AI Content Studio Lucifera vám vrátí klid. Vyplníte krátký formulář a my vám do 48 hodin dodáme první příspěvky. Bez chaosu, bez dlouhých schůzek.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#kontakt" className="btn-lime-primary">
                Chci si odlehčit tvorbu a vybrat tarif
              </a>
              <a href="#jak-to-funguje" className="btn-lime-outline">
                Jak probíhá spolupráce
              </a>
            </div>
            <p className="mt-6 text-sm font-medium text-lucifera-lime">
              V pondělí dodáte data. V pátek publikujete.
            </p>
          </div>
          {/* Hero visual: abstract 3D glass / network with pulsing lime */}
          <div className="relative hidden min-h-[50vh] lg:block">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-80 w-80 animate-pulse-lime">
                <div
                  className="absolute inset-0 rounded-full opacity-30 blur-3xl"
                  style={{ background: "radial-gradient(circle, rgba(192,255,0,0.4) 0%, transparent 70%)" }}
                />
                <div
                  className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-lucifera-lime/30 opacity-60"
                  style={{ boxShadow: "0 0 60px rgba(192,255,0,0.2), inset 0 0 40px rgba(192,255,0,0.05)" }}
                />
                <div
                  className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lucifera-lime/10"
                  style={{ boxShadow: "inset 0 0 30px rgba(192,255,0,0.2), 0 0 40px rgba(192,255,0,0.15)" }}
                />
                <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lucifera-lime shadow-lime-glow" />
              </div>
            </div>
            <div className="absolute right-0 top-1/2 h-full w-full -translate-y-1/2 lg:w-[80%]">
              <HeroImageFull />
            </div>
          </div>
          {/* Mobile: image below copy */}
          <div className="relative min-h-[40vh] w-full lg:hidden">
            <HeroImageFull />
          </div>
        </div>
      </section>

      {/* Sekce 1: Agitace — 3 glass karty s ikonami */}
      <section id="problem" className="relative w-full bg-lucifera-dark-green px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Nejste líní. Jste jen přehlcení.
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-white/80">
            Většina podnikatelů a specialistů nechce „nepostovat“. Jen na to po celém dni plném klientské práce a řízení byznysu už zkrátka nezbývá kapacita.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { text: "Znáte své téma perfektně, ale nevíte, jak ho prodat na sítích.", icon: "theme" },
              { text: "Když už si sednete k obsahu, ztrácíte hodiny přepisováním jedné věty.", icon: "hourglass" },
              { text: "Každý příspěvek je mentální start od nuly. Prázdný rám čeká.", icon: "frame" },
            ].map((card) => (
              <div key={card.icon} className="glass-panel flex flex-col p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-lucifera-lime/10 text-lucifera-lime">
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
                <p className="text-white/90">{card.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-white/70">
            Místo toho, abyste se věnovali tomu, co vás živí, řešíte „co dnes dát na Instagram nebo LinkedIn“.
          </p>
        </div>
      </section>

      {/* Sekce 2: Řešení — Dříve (dim) vs S Luciferou (bright) */}
      <section id="reseni" className="relative w-full bg-lucifera-dark px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Neřešíme jen texty. Řešíme vaši rozhodovací únavu.
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-white/80">
            Náš cíl není vygenerovat náhodný text. Náš cíl je zařídit, aby vám z hlavy zmizel každodenní tlak na obsah. Vaše značka bude vidět pravidelně, kvalitně a konzistentně – a vy u toho nebudete muset trpět.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="glass-panel-dim p-8">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-red-400/90">Dříve</h3>
              <ul className="mt-4 space-y-3 text-white/70">
                <li className="flex items-center gap-2"><span className="text-red-400/80">✕</span> „Co dnes postnout?“</li>
                <li className="flex items-center gap-2"><span className="text-red-400/80">✕</span> „Nemám kapacitu.“</li>
                <li className="flex items-center gap-2"><span className="text-red-400/80">✕</span> „Zase jsem nic nevydal/a.“</li>
              </ul>
            </div>
            <div className="glass-panel-bright p-8">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-lucifera-lime">S Luciferou</h3>
              <ul className="mt-4 space-y-3 text-white/90">
                <li className="flex items-center gap-2"><span className="text-lucifera-lime">✓</span> „Mám návrhy včas a bez stresu.“</li>
                <li className="flex items-center gap-2"><span className="text-lucifera-lime">✓</span> „Vím přesně, co a kdy jde ven.“</li>
                <li className="flex items-center gap-2"><span className="text-lucifera-lime">✓</span> „Sítě běží, já řeším svoji práci.“</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Sekce 3: Proces — timeline, 5 kruhů + limetková linka */}
      <section id="jak-to-funguje" className="relative w-full bg-lucifera-dark-green px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Od briefu k publikaci během jednoho týdne. Žádné zbytečné cally.
          </h2>
          <p className="mt-4 max-w-3xl text-white/80">
            Spolupráce je navržená tak, aby byla maximálně asynchronní a nezdržovala vás.
          </p>
          {/* Timeline: 5 kruhů + limetková linka mezi nimi */}
          <div className="mt-14 flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
            {processSteps.map((step, i) => (
              <div key={step.title} className="flex flex-1 flex-col items-center lg:max-w-[180px]">
                <div className="flex w-full items-center justify-center lg:justify-center">
                  {i > 0 && <div className="hidden h-0.5 flex-1 max-w-[20px] bg-lucifera-lime/40 lg:block" />}
                  <div className="glass-panel z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-lucifera-lime/40 text-lucifera-lime">
                    {step.icon === "cursor" && <span className="text-lg">▸</span>}
                    {step.icon === "form" && <span className="text-lg">✎</span>}
                    {step.icon === "cards" && <span className="text-lg">☰</span>}
                    {step.icon === "check" && <span className="text-lg">✓</span>}
                    {step.icon === "rocket" && <span className="text-lg">↑</span>}
                  </div>
                  {i < processSteps.length - 1 && <div className="hidden h-0.5 flex-1 min-w-[8px] max-w-[40px] bg-lucifera-lime/40 lg:block" />}
                </div>
                <div className="mt-4 text-center">
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{step.text}</p>
                  {step.day && (
                    <span className="mt-2 inline-block rounded-full bg-lucifera-lime/20 px-2 py-0.5 text-xs font-medium text-lucifera-lime">
                      {step.day}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-lg font-medium text-white/90">
            Výsledek: Vy se mezitím věnujete své profesi. My držíme obsahový rytmus.
          </p>
        </div>
      </section>

      {/* Sekce 4: Diferenciace — AI + Kurátor, centrální záblesk */}
      <section id="proc-my" className="relative w-full bg-lucifera-dark px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white md:text-4xl">
            Rychlost AI. Zodpovědnost člověka.
          </h2>
          <div className="mt-12 flex flex-col items-center justify-center gap-8 lg:flex-row">
            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-sm">
              <div className="h-16 w-16 rounded-full border border-lucifera-lime/30 bg-lucifera-lime/10" style={{ boxShadow: "0 0 30px rgba(192,255,0,0.15)" }} />
              <p className="mt-3 text-sm font-medium text-white/90">AI</p>
              <p className="text-center text-xs text-white/60">Neuronová síť, generace</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lucifera-lime/30 text-lucifera-lime" style={{ boxShadow: "0 0 40px rgba(192,255,0,0.4)" }}>
              <span className="text-xl">✦</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-lucifera-lime/20 bg-lucifera-lime/5 px-8 py-6 backdrop-blur-sm">
              <div className="h-16 w-16 rounded-full border border-lucifera-lime/50 bg-lucifera-lime/20" style={{ boxShadow: "0 0 30px rgba(192,255,0,0.2)" }} />
              <p className="mt-3 text-sm font-medium text-white/90">Kurátor</p>
              <p className="text-center text-xs text-white/60">Kontrola, tón, kvalita</p>
            </div>
          </div>
          <div className="glass-panel mt-10 p-8">
            <p className="text-center text-white/90">
              AI dramaticky urychluje produkci a eliminuje prázdnou stránku. Ale na konci vždy stojí náš Kreativní kurátor.
              Každý výstup pečlivě kontroluje. Hlídá kvalitu, tón vaší značky a funkčnost sdělení. Když je potřeba, zasáhne ručně, aby výstup nebyl jen „rychlý“, ale především prvotřídní a přesný.
            </p>
          </div>
        </div>
      </section>

      {/* Sekce 5: FAQ — glass accordion */}
      <section id="faq" className="relative w-full bg-lucifera-dark-green px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Často kladené otázky</h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group glass-panel overflow-hidden transition-all duration-300 [&[open]]:border-lucifera-lime/30 [&[open]]:shadow-[0_0_30px_rgba(192,255,0,0.12)]"
              >
                <summary className="cursor-pointer list-none px-6 py-4 font-semibold text-white [&::-webkit-details-marker]:hidden">
                  {faq.q}
                </summary>
                <p className="border-t border-white/10 px-6 py-4 text-white/80">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Závěrečné CTA — obří skleněný panel */}
      <section id="kontakt" className="relative w-full overflow-hidden bg-lucifera-dark px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-lucifera-dark blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-lucifera-dark-green/80" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="glass-panel p-10 md:p-14">
            <div className="flex flex-col items-center text-center">
              <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
                Chcete mít v pondělí zadáno a v pátek publikováno?
              </h2>
              <p className="mt-4 max-w-xl text-lg text-white/80">
                Vyberte si tarif, vyplňte krátký formulář a sledujte, jak váš obsah vzniká – včas, kvalitně a naprosto bez chaosu.
              </p>
              <a
                href="mailto:kontakt@studiolucifera.cz?subject=Tarif%20AI%20Content%20Studio"
                className="btn-lime-primary mt-10 px-8 py-4 text-base"
              >
                Zvolit tarif a spustit projekt
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/50">
        © {new Date().getFullYear()} AI Content Studio Lucifera
      </footer>
    </main>
  );
}
