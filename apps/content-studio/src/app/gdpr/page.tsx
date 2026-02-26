import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zásady ochrany osobních údajů (GDPR) | Studio Lucifera",
  description: "Zásady ochrany osobních údajů Studia Lucifera. Účinnost od 1. dubna 2025.",
};

export default function GdprPage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-[720px] px-6 py-16 md:py-24">
        <Link
          href="/"
          className="inline-block text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900"
        >
          ← Zpět na úvod
        </Link>

        <header className="mt-8 border-b border-stone-200 pb-8">
          <h1 className="font-bold leading-tight text-stone-900" style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)" }}>
            Zásady ochrany osobních údajů
          </h1>
          <p className="mt-2 font-medium text-stone-600">Studio Lucifera</p>
          <p className="mt-1 text-sm text-stone-500">Účinnost od: 1. dubna 2025</p>
        </header>

        <section className="mt-12">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            1. Správce osobních údajů
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            Správcem osobních údajů je:
          </p>
          <p className="mt-2 text-[17px] leading-[1.75] text-stone-700">
            <strong>Studio Lucifera</strong>
            <br />
            MgA. Katarína Brič & MgA. Luboš Novotný
          </p>
          <p className="mt-4 text-[17px] leading-[1.75] text-stone-700">
            Fakturace:
            <br />
            Luboš Novotný
            <br />
            Máchova 1730
            <br />
            511 01 Turnov
            <br />
            IČO: 86689614
          </p>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            E-mail:{" "}
            <a href="mailto:ahoj@studiolucifera.cz" className="text-[#A8EB12] underline hover:no-underline">
              ahoj@studiolucifera.cz
            </a>
          </p>
          <p className="mt-2 text-[17px] leading-[1.75] text-stone-600">(dále jen „Správce“)</p>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            2. Jaké osobní údaje zpracováváme
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            Zpracováváme zejména:
          </p>
          <ul className="mt-4 space-y-2 text-[17px] leading-[1.75] text-stone-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>jméno a příjmení</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>e-mail</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>telefonní číslo</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>fakturační údaje</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>IP adresu</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>fotografie a videozáznamy</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>hlasové záznamy (v případě AI avataru)</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>údaje uvedené v objednávkách a formulářích</span>
            </li>
          </ul>
          <p className="mt-4 text-[17px] leading-[1.75] text-stone-700">
            V případě fotografické a video tvorby může docházet ke zpracování podobizny osoby, která může být považována
            za osobní údaj.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            3. Účely zpracování
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            Osobní údaje zpracováváme za účelem:
          </p>
          <ul className="mt-4 space-y-2 text-[17px] leading-[1.75] text-stone-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>plnění smlouvy (realizace focení, videa, AI avatara, vzdělávání),</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>komunikace s klientem,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>fakturace a účetnictví,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>marketingové prezentace vlastní tvorby (na základě souhlasu),</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>zasílání obchodních sdělení (na základě souhlasu nebo oprávněného zájmu),</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>ochrany práv a oprávněných zájmů Správce.</span>
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            4. Právní základ zpracování
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            Osobní údaje zpracováváme na základě:
          </p>
          <ul className="mt-4 space-y-2 text-[17px] leading-[1.75] text-stone-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>plnění smlouvy,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>zákonné povinnosti,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>oprávněného zájmu,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>souhlasu subjektu údajů.</span>
            </li>
          </ul>
          <p className="mt-4 text-[17px] leading-[1.75] text-stone-700">
            Souhlas je vždy dobrovolný a může být kdykoli odvolán.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            5. Používání AI nástrojů
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            V rámci poskytovaných služeb může docházet k využití nástrojů umělé inteligence (např. při tvorbě AI avatara,
            úpravách fotografií nebo videa). V takových případech:
          </p>
          <ul className="mt-4 space-y-2 text-[17px] leading-[1.75] text-stone-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>jsou zpracovávané údaje používány výhradně za účelem realizace sjednané služby,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>mohou být technicky zpracovávány prostřednictvím zabezpečených nástrojů třetích stran,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>Správce vždy dbá na minimalizaci předávaných dat.</span>
            </li>
          </ul>
          <p className="mt-4 text-[17px] leading-[1.75] text-stone-700">
            Správce nevytváří nové digitální podoby, transformace ani další díla založená na podobě klienta bez jeho
            výslovného souhlasu.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            6. Prezentace tvorby (souhlas s užitím)
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            V případě fotografické, video nebo AI tvorby může Správce požádat klienta o souhlas s využitím výstupů pro
            vlastní prezentaci (web, sociální sítě, portfolio, výstavy).
          </p>
          <p className="mt-4 text-[17px] leading-[1.75] text-stone-700">
            Bez výslovného souhlasu klienta:
          </p>
          <ul className="mt-2 space-y-2 text-[17px] leading-[1.75] text-stone-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>nejsou fotografie, video ani hlasové záznamy použity pro marketingové účely,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>nejsou poskytovány třetím stranám mimo rámec realizace projektu.</span>
            </li>
          </ul>
          <p className="mt-4 text-[17px] leading-[1.75] text-stone-700">Souhlas lze kdykoli odvolat.</p>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            7. Předávání osobních údajů třetím stranám
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            Osobní údaje mohou být předány pouze:
          </p>
          <ul className="mt-4 space-y-2 text-[17px] leading-[1.75] text-stone-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>účetní kanceláři,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>poskytovateli hostingu,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>poskytovateli platební brány,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>cloudovým a IT nástrojům,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>AI nástrojům využívaným při realizaci projektu.</span>
            </li>
          </ul>
          <p className="mt-4 text-[17px] leading-[1.75] text-stone-700">
            Údaje nejsou prodávány ani poskytovány třetím stranám pro jejich vlastní marketingové účely.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            8. Doba uchovávání údajů
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            Osobní údaje jsou uchovávány:
          </p>
          <ul className="mt-4 space-y-2 text-[17px] leading-[1.75] text-stone-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>po dobu trvání smluvního vztahu,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>po dobu vyžadovanou účetními předpisy,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>u marketingových souhlasů maximálně 10 let nebo do odvolání souhlasu.</span>
            </li>
          </ul>
          <p className="mt-4 text-[17px] leading-[1.75] text-stone-700">
            Surová data (RAW fotografie, pracovní videozáznamy) jsou archivována po dobu 3 měsíců od předání výstupů.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            9. Práva subjektu údajů
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            Subjekt údajů má právo:
          </p>
          <ul className="mt-4 space-y-2 text-[17px] leading-[1.75] text-stone-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>na přístup ke svým údajům,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>na opravu,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>na výmaz,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>na omezení zpracování,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>na přenositelnost,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>vznést námitku,</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span>
                podat stížnost u{" "}
                <a
                  href="https://www.uoou.cz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A8EB12] underline hover:no-underline"
                >
                  Úřadu pro ochranu osobních údajů (www.uoou.cz)
                </a>
                .
              </span>
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            10. Odvolání souhlasu
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            Souhlas lze kdykoli odvolat zasláním e-mailu na adresu:{" "}
            <a href="mailto:ahoj@studiolucifera.cz" className="text-[#A8EB12] underline hover:no-underline">
              ahoj@studiolucifera.cz
            </a>
          </p>
          <p className="mt-4 text-[17px] leading-[1.75] text-stone-700">
            Odvolání souhlasu nemá vliv na zákonnost zpracování před jeho odvoláním.
          </p>
        </section>

        <div className="mt-14 pt-8 border-t border-stone-200">
          <Link
            href="/"
            className="inline-block rounded-lg bg-[#A8EB12] px-6 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-[#A8EB12]/90"
          >
            Zpět na úvod
          </Link>
        </div>
      </div>
    </main>
  );
}
