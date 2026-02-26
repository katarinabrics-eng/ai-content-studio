import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../components/Header";
import { StandardCarousel } from "../components/StandardCarousel";
import { OfferCarousel } from "../components/OfferCarousel";

export const metadata: Metadata = {
  title: "Portréty | Studio Lucifera",
  description: "Portrét, který nese vaši pozici. Autorský portrét v ateliérovém standardu – pro podnikatele, herce i osobní značku.",
};

export default function PortretyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* BLOK 1: HERO – Asymetrický, text vlevo, vizuál vpravo */}
      <section className="w-full bg-white py-[140px]">
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <h1
                className="font-bold leading-[1.05] tracking-[-0.03em] text-[#111111]"
                style={{ fontSize: "clamp(2.5rem, 5.5vw, 64px)" }}
              >
                Portrét, který nese vaši pozici.
              </h1>
              <p className="mt-8 text-[20px] leading-[1.8] text-[#3A3A3A]">
                Vaše tvář je vaše značka. Postarejme se, aby odpovídala vaší skutečné úrovni.
              </p>
              <Link
                href="/start"
                className="mt-10 inline-block rounded-lg bg-[#A8EB12] px-8 py-3.5 text-base font-semibold text-zinc-900 hover:bg-[#A8EB12]/90"
              >
                Rezervovat termín
              </Link>
              <p className="mt-6 text-[14px] text-stone-500">
                Odpovídáme osobně do 48 hodin.
              </p>
            </div>
            <div className="relative lg:col-span-6 lg:col-start-7 overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)]">
              <img
                src="/placeholders/PORTFOLIO PORTRET/vyber/7.JPG"
                alt=""
                className="w-full object-cover object-center"
                style={{ aspectRatio: "4/5", maxHeight: "75vh" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* BLOK 2: UVĚDOMĚNÍ – Text vlevo, portrét vpravo */}
      <section className="w-full py-[140px]" style={{ backgroundColor: "#F7F8F5" }}>
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <h2
                className="font-bold leading-[1.08] text-[#111111]"
                style={{ fontSize: "clamp(2rem, 4.5vw, 52px)", marginBottom: "32px" }}
              >
                Možná jste vyrostli. Váš obraz zatím ne.
              </h2>
              <p className="text-[19px] leading-[1.8] text-[#3A3A3A]">
                Vaše zkušenosti rostou. Vaše odpovědnost roste. Vaše prezentace by měla také. Fotografie, která vás zmenšuje, není neutrální. Oslabuje vaši pozici. Portrét v Lucifeře není dekorace. Je to vědomá práce s tím, jak vás svět čte.
              </p>
            </div>
            <div className="lg:col-span-5 lg:col-start-8 overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)]">
              <img
                src="/placeholders/PORTFOLIO PORTRET/vyber/25.JPG"
                alt=""
                className="w-full object-cover object-center"
                style={{ aspectRatio: "3/4", maxHeight: "560px" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* BLOK 3: GALERIE STANDARDU – Grid 2×2 */}
      <section className="w-full bg-white py-[140px]">
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="max-w-[720px]" style={{ marginBottom: "56px" }}>
            <h2
              className="font-bold leading-[1.08] text-[#111111]"
              style={{ fontSize: "clamp(2rem, 4.5vw, 52px)", marginBottom: "24px" }}
            >
              Standard, který drží obraz pohromadě.
            </h2>
            <p className="text-[19px] leading-[1.8] text-[#3A3A3A]">
              Každý portrét vzniká ve stejném ateliérovém standardu. Neřešíme trendy. Řešíme čitelnost.
            </p>
          </div>
          <div className="max-w-[900px] mx-auto">
            <StandardCarousel />
          </div>
        </div>
      </section>

      {/* BLOK 4: METODIKA – 3 sloupce, limetková linka */}
      <section className="w-full py-[140px]" style={{ backgroundColor: "#F7F8F5" }}>
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="max-w-[720px]" style={{ marginBottom: "56px" }}>
            <h2
              className="font-bold leading-[1.08] text-[#111111]"
              style={{ fontSize: "clamp(2rem, 4.5vw, 52px)" }}
            >
              Jak přemýšlíme
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-14 md:grid-cols-3">
            <div>
              <div className="mb-5 h-[2px] w-10 rounded-full bg-[#A8EB12]" aria-hidden />
              <h3 className="text-[22px] font-bold leading-tight text-[#111111]">Psychologie přítomnosti</h3>
              <p className="mt-4 text-[18px] leading-[1.8] text-[#3A3A3A]">
                Nepózujeme. Vedeme. Uvolnění je proces. Váš klid před objektivem je součást výsledku.
              </p>
            </div>
            <div>
              <div className="mb-5 h-[2px] w-10 rounded-full bg-[#A8EB12]" aria-hidden />
              <h3 className="text-[22px] font-bold leading-tight text-[#111111]">Světlo jako nástroj</h3>
              <p className="mt-4 text-[18px] leading-[1.8] text-[#3A3A3A]">
                Světlo není dekorace. Je to struktura. Používáme ho vědomě tak, aby vás podpořilo – ne přikrylo.
              </p>
            </div>
            <div>
              <div className="mb-5 h-[2px] w-10 rounded-full bg-[#A8EB12]" aria-hidden />
              <h3 className="text-[22px] font-bold leading-tight text-[#111111]">Autorská postprodukce</h3>
              <p className="mt-4 text-[18px] leading-[1.8] text-[#3A3A3A]">
                Retuš není filtr. Zachováváme strukturu pleti. Čistíme obraz, ne osobnost. RAW soubory neposkytujeme. Každý výstup je finální autorský výsledek.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BLOK 5: NABÍDKA – Autorský portrét + headshot vpravo */}
      <section className="w-full bg-white py-[140px]">
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div
              className="rounded-2xl px-8 py-12 md:px-12 md:py-16 lg:col-span-5"
              style={{ backgroundColor: "#F7F8F5" }}
            >
              <div className="mb-6 h-[3px] w-10 rounded-full bg-[#A8EB12]" aria-hidden />
              <h2
                className="font-bold leading-[1.1] text-[#111111]"
                style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", marginBottom: "16px" }}
              >
                Autorský portrét – Řízená práce s pozicí.
              </h2>
              <p className="text-[28px] font-bold text-[#111111]">4 500 Kč</p>
              <p className="mt-1 text-[15px] text-stone-500">Jednorázová investice</p>
              <ul className="mt-10 space-y-4 text-[18px] leading-[1.7] text-[#3A3A3A]">
                {[
                  "45 minut práce v ateliéru",
                  "3 finálně retušované fotografie",
                  "Výběr z cca 100 záběrů",
                  "Stylingová konzultace na místě",
                  "Náhledy k výběru do 24–48 hodin",
                  "Licence pro profesní i osobní použití",
                  "Vedení během focení",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1.5 h-5 w-5 shrink-0 rounded-full bg-[#A8EB12]/30 flex items-center justify-center text-[#111111] text-xs font-bold" aria-hidden>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-[17px] leading-[1.7] text-[#3A3A3A]">
                Pokud potřebujete více variant nebo delší práci, další hodina ateliérové práce je 3 600 Kč.
              </p>
              <Link
                href="/start"
                className="mt-10 inline-block rounded-lg bg-[#A8EB12] px-8 py-3.5 text-base font-semibold text-zinc-900 hover:bg-[#A8EB12]/90"
              >
                Rezervovat termín
              </Link>
              <p className="mt-6 text-[14px] text-stone-500">
                Nejste si jistí, zda je to správný krok? Domluvte si krátkou konzultaci.
              </p>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex justify-center lg:justify-end">
              <OfferCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* BLOK 6: KDY PORTRÉT NESTAČÍ – Cross-sell */}
      <section className="w-full bg-[#111111] px-6 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-[720px] text-center">
          <h2
            className="font-bold leading-[1.1] text-white"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", marginBottom: "24px" }}
          >
            Kdy portrét nestačí
          </h2>
          <p className="text-[18px] leading-[1.8] text-stone-300">
            Někdy nestačí jen jeden silný záběr. Pokud plánujete rebranding, vstupujete do nové cenové úrovně nebo budujete osobní značku ve větším měřítku, doporučujeme Prémiovou vizuální identitu.
          </p>
          <Link
            href="/premiova-vizualni-identita"
            className="mt-10 inline-block rounded-lg border-2 border-white px-8 py-3.5 text-base font-semibold text-white hover:bg-white hover:text-[#111111] transition-colors"
          >
            Zjistit více o Prémiové identitě
          </Link>
        </div>
      </section>

      {/* BLOK 7: ZÁVĚREČNÉ CTA */}
      <section className="w-full bg-white py-[140px]">
        <div className="mx-auto max-w-[640px] text-center px-6">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#111111] sm:text-4xl md:text-5xl md:leading-[1.15]">
            Silná pozice začíná<br />u obrazu.
          </h2>
          <Link
            href="/start"
            className="mt-10 inline-block rounded-lg bg-[#A8EB12] px-8 py-4 text-base font-semibold text-zinc-900 hover:bg-[#A8EB12]/90"
          >
            Chci svůj portrét
          </Link>
          <p className="mt-8 text-[15px] text-stone-500">
            Lucifera Studio · Praha. Ateliérová práce s jasným standardem.
          </p>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white py-8 text-center text-sm text-stone-500">
        <Link href="/obchodni-podminky" className="underline underline-offset-2 hover:text-stone-700">
          Obchodní podmínky
        </Link>
        <span className="mx-2">·</span>
        <Link href="/gdpr" className="underline underline-offset-2 hover:text-stone-700">
          Ochrana osobních údajů
        </Link>
        <span className="mx-2">·</span>
        © {new Date().getFullYear()} Studio Lucifera
      </footer>
    </main>
  );
}
