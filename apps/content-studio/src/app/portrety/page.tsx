import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../components/Header";
import { StandardCarousel } from "../components/StandardCarousel";
import { OfferCarousel } from "../components/OfferCarousel";
import BookingCalendar from "@/components/booking/BookingCalendar";
import PostUkazky from "@/components/PostUkazky";

export const metadata: Metadata = {
  title: "Portréty | Studio Lucifera",
  description: "Portrét, který nese vaši pozici. Autorský portrét v ateliérovém standardu – pro podnikatele, herce i osobní značku.",
};

export default function PortretyPage() {
  return (
    <main className="min-h-screen bg-white light-theme">
      <Header />

      {/* BLOK 1: HERO – Asymetrický, text vlevo, vizuál vpravo */}
      <section className="w-full bg-white pt-12 pb-12 md:py-[140px]">
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <h1 className="font-sans font-black text-[clamp(2rem,5.2vw,4.5rem)] leading-[0.92] tracking-[-0.035em] text-zinc-900">
                Portrét, který nese vaši pozici.
              </h1>
              <p className="mt-6 text-xl text-zinc-700" style={{ lineHeight: "1.6" }}>
                Vaše tvář je vaše značka. Postarejme se, aby odpovídala vaší skutečné úrovni.
              </p>
              <Link
                href="#kalendar"
                className="mt-8 inline-block w-full sm:w-auto rounded-lg bg-[#A8EB12] px-8 py-3.5 text-base font-semibold text-zinc-900 hover:bg-[#A8EB12]/90 text-center sm:text-left"
              >
                Rezervovat termín
              </Link>
              <p className="mt-6 text-[14px] text-stone-500">
                Odpovídáme osobně do 48 hodin.
              </p>
            </div>
            <div className="relative lg:col-span-6 lg:col-start-7 overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
      <section className="w-full py-14 md:py-[140px]" style={{ backgroundColor: "#F7F8F5" }}>
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
      <section className="w-full bg-white py-14 md:py-[140px]">
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
          <div className="w-full max-w-[1200px]">
            <StandardCarousel />
          </div>
        </div>
      </section>

      {/* BLOK 4: METODIKA – 3 sloupce, limetková linka */}
      <section className="w-full py-14 md:py-[140px]" style={{ backgroundColor: "#F7F8F5" }}>
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="max-w-[720px]" style={{ marginBottom: "40px" }}>
            <h2
              className="font-bold leading-[1.08] text-[#111111]"
              style={{ fontSize: "clamp(2rem, 4.5vw, 52px)" }}
            >
              Jak přemýšlíme
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-10 md:gap-14 md:grid-cols-3">
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

      {/* BLOK 4b: PORTRÉT V PROSTŘEDÍ – Vizuál vlevo, text a nabídka vpravo */}
      <section className="w-full bg-white py-14 md:py-[140px]">
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/placeholders/home.png"
                  alt=""
                  className="w-full object-cover object-center"
                  style={{ aspectRatio: "4/3", maxHeight: "560px" }}
                />
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2 lg:pl-4">
              <div className="mb-5 h-[2px] w-10 rounded-full bg-[#A8EB12]" aria-hidden />
              <h2
                className="font-bold leading-[1.08] text-[#111111]"
                style={{ fontSize: "clamp(2rem, 4.5vw, 52px)", marginBottom: "24px" }}
              >
                Váš svět jako součást vaší pozice.
              </h2>
              <p className="text-[19px] leading-[1.8] text-[#3A3A3A] mb-6">
                Někdy ateliér nestačí. Vaše prostředí dodává obrazu další vrstvu autenticity.
              </p>
              <p className="text-[18px] leading-[1.8] text-[#3A3A3A] mb-10">
                Přinášíme Lucifera standard i k vám: vědomá práce se světlem a kompozicí v prostředí, které vás vystihuje. Cena není za čas, ale za vizuální upgrade vaší pozice.
              </p>
              <div
                className="rounded-2xl px-8 py-10 md:px-10 md:py-12 max-w-[520px]"
                style={{ backgroundColor: "#F7F8F5" }}
              >
                <div className="mb-4 h-[3px] w-10 rounded-full bg-[#A8EB12]" aria-hidden />
                <h3 className="text-[22px] font-bold leading-tight text-[#111111]">Portrét v prostředí</h3>
                <p className="text-[28px] font-bold text-[#111111] mt-2">8 800 Kč</p>
                <p className="mt-1 text-[15px] text-stone-500">Investice</p>
                <ul className="mt-8 space-y-3 text-[17px] leading-[1.7] text-[#3A3A3A]">
                  {[
                    "2 hodiny intenzivní a řízené tvorby na místě",
                    "15 finálně retušovaných fotografií (výběr z kurátorsky vedeného materiálu)",
                    "2–3 proměnné: práce s vybranými outfity a zákoutími vaší lokace",
                    "Licence pro profesní i osobní užití",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-[#A8EB12]/30 flex items-center justify-center text-[#111111] text-xs font-bold" aria-hidden>✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[14px] text-stone-500">
                  K ceně se připočítává 1 hodina přípravy na místě a cestovné.
                </p>
                <Link
                  href="/rezervace?from=portret"
                  className="mt-8 inline-block w-full sm:w-auto rounded-lg border-2 border-[#111111] px-8 py-3.5 text-base font-semibold text-[#111111] hover:bg-[#111111] hover:text-white transition-colors text-center sm:text-left"
                >
                  Rezervovat focení v prostředí
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOK 5: NABÍDKA – Autorský portrét + karusel vpravo */}
      <section className="w-full bg-white py-14 md:py-[140px]">
        <div className="mx-auto max-w-[1360px] px-6 xl:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
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
                href="#kalendar"
                className="mt-10 inline-block w-full sm:w-auto rounded-lg bg-[#A8EB12] px-8 py-3.5 text-base font-semibold text-zinc-900 hover:bg-[#A8EB12]/90 text-center sm:text-left"
              >
                Rezervovat termín
              </Link>
              <p className="mt-6 text-[14px] text-stone-500">
                Nejste si jistí, zda je to správný krok? Domluvte si krátkou konzultaci.
              </p>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex justify-center lg:justify-start">
              <OfferCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Výběr termínu – jednotný BookingCalendar (theme light, reserve flow) */}
      <PostUkazky />

      <section id="kalendar" className="w-full bg-white py-12 md:py-24">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 xl:px-10">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-10 shadow-xl">
            <BookingCalendar
              service="portret"
              theme="light"
              basePath="/portrety"
              showBackLink={false}
            />
          </div>
        </div>
      </section>

      {/* BLOK 6: KDY PORTRÉT NESTAČÍ – Cross-sell */}
      <section className="w-full bg-[#111111] px-6 py-16 sm:px-8 lg:py-32">
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
            className="mt-10 inline-block w-full sm:w-auto rounded-lg border-2 border-white px-8 py-3.5 text-base font-semibold text-white hover:bg-white hover:text-[#111111] transition-colors text-center"
          >
            Zjistit více o Prémiové identitě
          </Link>
        </div>
      </section>

      {/* BLOK 7: ZÁVĚREČNÉ CTA */}
      <section className="w-full bg-white py-14 md:py-[140px]">
        <div className="mx-auto max-w-[640px] text-center px-6">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#111111] sm:text-4xl md:text-5xl md:leading-[1.15]">
            Silná pozice začíná<br />u obrazu.
          </h2>
          <Link
            href="#kalendar"
            className="mt-10 inline-block w-full sm:w-auto rounded-lg bg-[#A8EB12] px-8 py-4 text-base font-semibold text-zinc-900 hover:bg-[#A8EB12]/90"
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
