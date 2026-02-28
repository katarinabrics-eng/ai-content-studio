import { Header } from "./components/Header";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* BLOK 1: HERO – Background image, overlay, text vlevo. Zarovnáno s logem (jako prémiová). */}
      <section
        className="relative flex min-h-[90vh] w-full items-center overflow-hidden"
        style={{
          backgroundImage: "url('/placeholders/home.png')",
          backgroundSize: "cover",
          backgroundPosition: "70% center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay pro čitelnost textu */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background: "linear-gradient(to right, rgba(245,245,245,0.95) 0%, rgba(245,245,245,0.85) 35%, rgba(245,245,245,0.3) 60%, rgba(245,245,245,0) 80%)",
          }}
        />
        <div className="relative z-[2] mx-auto flex min-h-[90vh] w-full max-w-[1360px] flex-col justify-center px-6 xl:px-10">
          <div className="max-w-[600px]">
          <h1 className="font-sans font-black text-[clamp(2rem,5.2vw,4.5rem)] leading-[0.92] tracking-[-0.035em] text-zinc-900">
            Řídíme váš vizuální obraz.
          </h1>
          <p className="mt-6 text-xl text-zinc-700" style={{ lineHeight: "1.6" }}>
            Studio Lucifera je prostor, kde se podnikatelé, experti i osobnosti přestávají vizuálně podceňovat.{" "}
            <strong className="text-zinc-900">Neprodukujeme obsah. Nastavujeme pozici.</strong>
          </p>
          <div className="mt-12 flex flex-col gap-4">
            <a
              href="#sluzby"
              className="inline-block w-fit rounded-lg bg-[#A8EB12] px-8 py-3.5 text-base font-semibold text-zinc-900 hover:bg-[#A8EB12]/90"
            >
              Prozkoumat služby
            </a>
            <p className="text-[15px] text-stone-500">
              Nejste si jistí, kde začít?{" "}
              <a href="/start" className="underline underline-offset-2 hover:text-stone-700">
                Doporučit mi vhodnou službu
              </a>
            </p>
          </div>
          <p className="mt-8 text-[14px] text-stone-400">
            Odpovídáme osobně. Nečeká vás automat ani prodejní nátlak.
          </p>
          </div>
        </div>
      </section>

      {/* BLOK 2: Koncept Kreativního dvora */}
      <section className="w-full py-[140px]" style={{ backgroundColor: "#F7F8F5" }}>
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="max-w-[720px]">
            <h2 className="font-bold leading-[1.08] text-[#111111]" style={{ fontSize: "clamp(2rem, 4.5vw, 52px)", marginBottom: "32px" }}>
              Jeden prostor. Jeden styl. Jedna energie.
            </h2>
            <p className="text-[19px] leading-[1.75] text-[#3A3A3A]">
              Lucifera není jen fotoateliér. Je to kreativní dvůr, kde má každá služba své místo – ale všechny mluví stejným jazykem.
            </p>
            <p className="mt-6 text-[19px] leading-[1.75] text-[#3A3A3A]">
              Fotografie. Video. AI avatar. Strategická vizuální práce. Každá z těchto částí stojí samostatně, ale dohromady tvoří <strong className="text-[#111111]">jednotný systém</strong>. V Lucifeře nevzniká chaos služeb, ale <strong className="text-[#111111]">kontrolovaná vizuální identita</strong>. Klient nepřechází mezi styly. Vstupuje do jednoho světa.
            </p>
            <p className="mt-10 text-[17px] text-[#3A3A3A]">
              Nejčastější volba nových klientů: <span className="font-medium text-[#111111]">→ Profesní portrét jako první krok.</span>{" "}
              <a href="/portrety" className="underline underline-offset-2 hover:no-underline">
                Zobrazit portréty
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* BLOK 3: Rozcestí služeb – 3 pilíře */}
      <section id="sluzby" className="w-full bg-white py-[140px]">
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
            <div className="flex flex-col border-t border-stone-200 pt-8">
              <div className="overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] mb-6">
                <img src="/placeholders/PORTFOLIO PORTRET/vyber/7.JPG" alt="" className="aspect-[3/4] w-full object-cover object-center" />
              </div>
              <div className="h-[3px] w-10 rounded-full bg-[#A8EB12]" style={{ marginBottom: "24px" }} aria-hidden />
              <h3 className="text-[22px] font-bold leading-tight text-[#111111]">Prémiová vizuální identita</h3>
              <p className="mt-4 text-[17px] leading-[1.65] text-[#3A3A3A]">
                Strategický upgrade vaší přítomnosti. Pro ty, kteří svou současnou vizuální úroveň již přerostli. Tato služba propojuje portrét, pohyb a digitální nástroje do <strong className="text-[#111111]">jednotného vizuálního systému</strong>. Výsledkem je obraz, který odpovídá vaší skutečné hodnotě.
              </p>
              <a href="/premiova-vizualni-identita" className="mt-6 inline-block text-[16px] font-medium text-[#111111] underline underline-offset-2 hover:no-underline">
                Přejít k službě
              </a>
              <p className="mt-4 text-[14px] italic text-stone-500">Vhodné pro podnikatele ve fázi růstu, rebrandu nebo cenového posunu.</p>
            </div>

            <div className="flex flex-col border-t border-stone-200 pt-8">
              <div className="overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] mb-6">
                <img src="/placeholders/PORTFOLIO PORTRET/vyber/23.JPG" alt="" className="aspect-[3/4] w-full object-cover object-center" />
              </div>
              <div className="h-[3px] w-10 rounded-full bg-[#A8EB12]" style={{ marginBottom: "24px" }} aria-hidden />
              <h3 className="text-[22px] font-bold leading-tight text-[#111111]">Profesní portrét</h3>
              <p className="mt-4 text-[17px] leading-[1.65] text-[#3A3A3A]">
                Obraz pozice pro podnikatele, experty a herce. Jistota a čitelnost v jednom záběru. Nejde o hezkou fotku. Jde o to, <strong className="text-[#111111]">jak vás trh čte během prvních sekund</strong>.
              </p>
              <a href="/portrety" className="mt-6 inline-block text-[16px] font-medium text-[#111111] underline underline-offset-2 hover:no-underline">
                Zjistit více
              </a>
              <p className="mt-4 text-[14px] italic text-stone-500">Ideální jako první spolupráce se studiem.</p>
            </div>

            <div className="flex flex-col border-t border-stone-200 pt-8">
              <div className="overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] mb-6">
                <img src="/placeholders/PORTFOLIO PORTRET/vyber/35.JPG" alt="" className="aspect-[3/4] w-full object-cover object-center" />
              </div>
              <div className="h-[3px] w-10 rounded-full bg-[#A8EB12]" style={{ marginBottom: "24px" }} aria-hidden />
              <h3 className="text-[22px] font-bold leading-tight text-[#111111]">Osobní a rodinný portrét</h3>
              <p className="mt-4 text-[17px] leading-[1.65] text-[#3A3A3A]">
                Kreativní radost a přirozenost v ateliérovém standardu. Obraz vašeho skutečného já. I osobní fotografie může mít úroveň, světlo a klid profesionální práce – bez ztráty lehkosti.
              </p>
              <a href="/portrety" className="mt-6 inline-block text-[16px] font-medium text-[#111111] underline underline-offset-2 hover:no-underline">
                Zobrazit detaily
              </a>
              <p className="mt-4 text-[14px] italic text-stone-500">Termíny vypisujeme průběžně. Doporučujeme rezervaci s předstihem.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BLOK 4: O nás – Zkušenost a kontext */}
      <section className="w-full py-[140px]" style={{ backgroundColor: "#F7F8F5" }}>
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="max-w-[720px]">
            <h2 className="font-bold leading-[1.08] text-[#111111]" style={{ fontSize: "clamp(2rem, 4.5vw, 52px)", marginBottom: "28px" }}>
              Rozhoduje zkušenost.
              <br />
              A cit pro kontext.
            </h2>
            <p className="text-[19px] leading-[1.75] text-[#3A3A3A]">
              Nevytváříme efektní momenty. Tvoříme obrazy, které <strong className="text-[#111111]">obstojí v čase</strong>. Vaše značka potřebuje víc než jen sympatie – potřebuje <strong className="text-[#111111]">vizuální váhu</strong>, kterou jí dodá 25 let naší praxe s obrazem.
            </p>
            <p className="mt-8 text-[17px] text-[#3A3A3A]">
              Chcete vědět, jak spolupráce probíhá krok za krokem?{" "}
              <a href="/premiova-vizualni-identita#struktura-spoluprace" className="font-medium text-[#111111] underline underline-offset-2 hover:no-underline">
                Zobrazit průběh spolupráce
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* BLOK 5: Inovace a Akademie */}
      <section className="w-full bg-white py-[140px]">
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="max-w-[720px]">
            <p className="text-[22px] font-bold leading-[1.35] text-[#111111]">
              Protože technologie je nástroj. Identita je rozhodnutí.
            </p>
            <p className="mt-4 text-[17px] leading-[1.65] text-[#3A3A3A]">
              Pro klienty, kteří chtějí pracovat s digitální prezentací a budoucností obsahu.
            </p>
            <div className="mt-8 flex flex-wrap gap-6">
              <a href="#" className="text-[16px] font-medium text-[#111111] underline underline-offset-2 hover:no-underline">
                Lucifera Akademie
              </a>
              <span className="text-stone-300">|</span>
              <a href="#" className="text-[16px] font-medium text-[#111111] underline underline-offset-2 hover:no-underline">
                AI Avataři
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BLOK 6: Závěrečné CTA */}
      <section id="zaver" className="w-full bg-[#111111] px-6 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl md:leading-[1.15]">
            Čitelnost je otázka rozhodnutí.
          </h2>
          <a
            href="/start"
            className="mt-10 inline-block rounded-lg bg-[#A8EB12] px-8 py-4 text-base font-semibold text-zinc-900 hover:bg-[#A8EB12]/90"
          >
            Domluvit strategickou konzultaci
          </a>
          <p className="mt-6 text-[15px] text-stone-400">
            Konzultace trvá 20–30 minut. Pomůže vám ujasnit, zda je Lucifera správný krok právě teď.
          </p>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white py-8 text-center text-sm text-stone-500">
        <a href="/obchodni-podminky" className="underline underline-offset-2 hover:text-stone-700">
          Obchodní podmínky
        </a>
        <span className="mx-2">·</span>
        <a href="/gdpr" className="underline underline-offset-2 hover:text-stone-700">
          Ochrana osobních údajů
        </a>
        <span className="mx-2">·</span>
        © {new Date().getFullYear()} Studio Lucifera
      </footer>
    </main>
  );
}
