import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Obchodní podmínky | Studio Lucifera",
  description: "Obchodní podmínky a pravidla spolupráce Studia Lucifera (Kreativní dvůr).",
};

export default function ObchodniPodminkyPage() {
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
            Podrobné obchodní podmínky a pravidla spolupráce
          </h1>
          <p className="mt-2 font-medium text-stone-600">Studio Lucifera (Kreativní dvůr)</p>
          <p className="mt-1 text-sm text-stone-500">Účinnost od: 1. dubna 2025</p>
        </header>

        <p className="mt-8 text-[17px] leading-[1.75] text-stone-700">
          Tyto podmínky definují standardy profesionální spolupráce se Studiem Lucifera. Nejsou jen právním dokumentem,
          ale vyjádřením respektu k času, odbornosti a tvůrčímu procesu obou stran.
        </p>

        <section className="mt-12">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            1. Smluvní strany a identifikace
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            <strong>Poskytovatel:</strong> Studio Lucifera (MgA. Katarína Brič & MgA. Luboš Novotný). Fakturační údaje:
            Luboš Novotný, Máchova 1730, 511 01 Turnov, IČO: 86689614.
          </p>
          <p className="mt-2 text-[17px] leading-[1.75] text-stone-700">
            <strong>Klient:</strong> Fyzická nebo právnická osoba, která si objednává služby studia.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            2. Architektura služeb (Předmět plnění)
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            Studio poskytuje služby v rámci konceptu „Kreativního dvora“, rozdělené do těchto pevných pilířů:
          </p>
          <ul className="mt-4 space-y-2 text-[17px] leading-[1.75] text-stone-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>A. Vlajková loď:</strong> Prémiová vizuální identita (strategie, positioning, komplexní vizuální systém).</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>B. Produkční větev:</strong> Profesní portrét (podnikatelé, herci) a Osobní/Rodinný portrét.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>C. Inovace a AI:</strong> Tvorba digitálních dvojníků (AI Avatar) a videotvorba.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>D. Akademie:</strong> Vizuální mentoring a strategické konzultace.</span>
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            3. Vznik spolupráce
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            Spolupráce je považována za závazně sjednanou v momentě, kdy jsou splněny obě tyto podmínky:
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-[17px] leading-[1.75] text-stone-700">
            <li><strong>Písemné potvrzení</strong> cenové nabídky nebo briefu klientem (e-mailem).</li>
            <li><strong>Úhrada první zálohové faktury</strong> (50 % z celkové ceny projektu).</li>
          </ol>
          <p className="mt-4 text-[17px] italic leading-[1.75] text-stone-600">
            Poznámka: Telefonické domluvy jsou informativní a stávají se závaznými až po písemném potvrzení studia.
          </p>

          <h3 className="mt-8 font-bold text-stone-900" style={{ fontSize: "1.15rem" }}>
            3a. Konzultace a záloha za rezervaci termínu
          </h3>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            Konzultace je sice zdarma, studio si však vyhrazuje právo vystavit zálohu za závazné rezervování termínu.
          </p>
          <ul className="mt-4 space-y-2 text-[17px] leading-[1.75] text-stone-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>Záloha za závazné rezervování termínu: 500 Kč.</strong> Pokud se dostavíte, tato částka vám bude vrácena nebo odečtena z další služby, pokud se rozhodnete se studiem spolupracovat.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>Prémiová vizuální identita a Brand focení:</strong> Pokud si zvolíte variantu „Konzultace + vizuální board“, hradíte 1 850 Kč. Pokud zvolíte pouze konzultaci, platí postup s vratnou zálohou 500 Kč za termín (konzultace je zdarma, záloha se vrací při dostavení nebo odečte z další spolupráce).</span>
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            4. Jednoznačná platební struktura (Model 50/25/25)
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            Aby byla zajištěna kontinuita práce a rezervace kapacity, platby jsou rozděleny následovně:
          </p>
          <ul className="mt-4 space-y-3 text-[17px] leading-[1.75] text-stone-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>4.1. Fáze Plánování (50 %):</strong> Splatná pro zahájení projektu. Kryje strategickou přípravu, rešerše, tvorbu moodboardů a blokaci termínů v kalendáři.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>4.2. Fáze Realizace (25 %):</strong> Splatná nejpozději <strong>3 kalendářní dny</strong> před fyzickou realizací (focením/natáčením). Bez této úhrady studio nerealizuje výjezd ani produkci a termín propadá.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>4.3. Fáze Předání (25 % + vícepráce):</strong> Splatná po dokončení postprodukce. Zahrnuje doplatek a případné odsouhlasené náklady nad rámec zadání (extra retuše, časové přesahy).</span>
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            5. Storno podmínky (Ochrana kapacity a práce)
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            Tento bod je klíčový pro eliminaci dvojznačnosti u vracení plateb:
          </p>
          <ul className="mt-4 space-y-3 text-[17px] leading-[1.75] text-stone-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>5.1. Reflexní lhůta (Prvních 7 dní):</strong> Klient může odstoupit bez udání důvodu do <strong>7 kalendářních dnů</strong> od doručení úvodních produkčních podkladů (brief/dotazník). Vrací se <strong>100 % zálohy</strong>.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>5.2. Zahájená strategie (Po 7 dnech):</strong> Pokud klient odstoupí po uplynutí 7denní lhůty, vrací se pouze <strong>50 % z první platby</strong>. Zbývající část (25 % celkové ceny projektu) zůstává studiu jako úhrada za již vykonanou strategickou práci a blokaci kapacity.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>5.3. Kritické storno (Méně než 7 dní před focením):</strong> Pokud dojde ke zrušení realizace v době kratší než 7 kalendářních dnů před domluveným termínem, <strong>celá první platba (50 % ceny) propadá</strong>. Termín již nelze obsadit jiným klientem a strategická příprava je v této fázi kompletně dokončena.</span>
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            6. Termíny a součinnost
          </h2>
          <ul className="mt-4 space-y-3 text-[17px] leading-[1.75] text-stone-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>Časový limit:</strong> Každý projekt musí být realizován do <strong>12 měsíců</strong> od úhrady první zálohy. Po této době projekt expiruje a uhrazené částky propadají bez nároku na plnění.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>Součinnost:</strong> Klient je povinen dodat potřebné materiály do 14 dnů od výzvy. Při delší prodlevě má studio právo projekt pozastavit a přeřadit do nového časového harmonogramu dle aktuálních kapacit.</span>
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            7. Autorská práva, licence a data
          </h2>
          <ul className="mt-4 space-y-3 text-[17px] leading-[1.75] text-stone-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>Vlastnictví:</strong> Autorem všech děl je Studio Lucifera. Klientovi je udělena <strong>nevýhradní licence</strong> k užití děl pro vlastní marketingové a reprezentační účely.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>Zákaz úprav:</strong> Klient nesmí do děl zasahovat, měnit jejich barevnost, ořezy nebo je předávat třetím stranám k dalším úpravám bez souhlasu autora.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>Surová data:</strong> Studio <strong>neposkytuje RAW soubory</strong> ani nezpracovaný materiál. Výstupem je vždy hotové, vykurátované dílo.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8EB12]" aria-hidden />
              <span><strong>Archivace:</strong> Hotová data jsou archivována po dobu <strong>3 měsíců</strong> od předání. Po této době studio neručí za jejich dostupnost.</span>
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            8. Propagace a reference
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            Studio si vyhrazuje právo použít výsledná díla pro svou vlastní prezentaci (web, sítě, portfolio). Pokud si
            klient přeje exkluzivitu (neveřejné snímky), musí být toto sjednáno předem a může být zpoplatněno jako
            příplatek za diskrétnost. U AI Avatarů je k publikaci vždy vyžadován výslovný souhlas klienta.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-bold text-stone-900" style={{ fontSize: "1.35rem" }}>
            9. Odpovědnost
          </h2>
          <p className="mt-3 text-[17px] leading-[1.75] text-stone-700">
            Studio Lucifera buduje vizuální pozici a standard klienta. Nenese odpovědnost za přímé obchodní výsledky
            klienta ani za způsob, jakým klient výstupy v rámci své strategie používá.
          </p>
        </section>

        <p className="mt-14 text-[15px] italic leading-[1.6] text-stone-500">
          Zahájením spolupráce vyjadřujete souhlas s těmito obchodními podmínkami.
        </p>

        <div className="mt-12 pt-8 border-t border-stone-200">
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
