import Image from 'next/image'
import Link from 'next/link'

export const metadata = { title: 'Obchodní podmínky — Piclio' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ color: '#b7e94c', fontSize: 17, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.2px' }}>
        {title}
      </h2>
      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.75 }}>
        {children}
      </div>
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '0 0 10px' }}>{children}</p>
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: '6px 0 10px', paddingLeft: 22 }}>
      {items.map((item, i) => <li key={i} style={{ marginBottom: 4 }}>{item}</li>)}
    </ul>
  )
}


export default function ObchodniPodminkyPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1225',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '48px 20px 80px',
    }}>
      {/* Header / Logo */}
      <div style={{ maxWidth: 720, margin: '0 auto 48px' }}>
        <Link href="/">
          <Image src="/logo01.png" alt="Piclio" width={120} height={40} priority style={{ objectFit: 'contain' }} />
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Obchodní podmínky
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Účinnost od: 17. června 2025</p>
        </div>

        <div style={{ width: 40, height: 3, background: '#b7e94c', borderRadius: 2, marginBottom: 48 }} />

        <Section title="1. Smluvní strany">
          <P><strong style={{ color: '#fff' }}>Poskytovatel:</strong> Piclio by Lucifera Studio</P>
          <P>Luboš Novotný, Máchova 1730, 511 01 Turnov<br />IČO: 86689614</P>
          <P>
            <a href="mailto:ahoj@piclio.cz" style={{ color: '#b7e94c', textDecoration: 'none' }}>ahoj@piclio.cz</a>
            {' | '}
            <a href="https://piclio.cz" style={{ color: '#b7e94c', textDecoration: 'none' }}>piclio.cz</a>
          </P>
          <P><strong style={{ color: '#fff' }}>Klient:</strong> Fotograf nebo zadavatel eventu, který využívá platformu Piclio.</P>
        </Section>

        <Section title="2. Předmět smlouvy">
          <P>
            Předmětem smlouvy je poskytnutí přístupu k SaaS platformě Piclio pro automatické doručování fotografií hostům eventů. Služba zahrnuje:
          </P>
          <Ul items={[
            'přístup k platformě Piclio a správě eventů',
            'automatické zpracování fotografií (OCR detekce, párování s hosty, doručení)',
            'emailová komunikace s hosty eventu',
            'správa hostů, fotografií a galerií',
          ]} />
        </Section>

        <Section title="3. Vznik smluvního vztahu">
          <P>
            Smluvní vztah vzniká registrací fotografa a potvrzením těchto podmínek, nebo písemnou objednávkou.
            Zadavatel eventu přijetím přístupu k dashboardu souhlasí s těmito podmínkami.
          </P>
        </Section>

        <Section title="4. Ceny a platební podmínky">
          <P>
            Aktuální ceník služeb Piclio je dostupný na{' '}
            <a href="https://piclio.cz" style={{ color: '#b7e94c', textDecoration: 'none' }}>piclio.cz</a>
            {' '}nebo na základě individuální poptávky na{' '}
            <a href="mailto:ahoj@piclio.cz" style={{ color: '#b7e94c', textDecoration: 'none' }}>ahoj@piclio.cz</a>.
          </P>
        </Section>

        <Section title="5. Storno a vrácení plateb">
          <P><strong style={{ color: '#fff' }}>Předplatné (měsíční / roční):</strong></P>
          <Ul items={[
            'Zrušení předplatného je možné kdykoli; přístup trvá do konce zaplaceného období.',
            'Roční plán: vrácení platby do 14 dní od zakoupení, pokud nebyly zpracovány žádné eventy.',
          ]} />
          <P><strong style={{ color: '#fff' }}>Jednorázový event:</strong></P>
          <Ul items={[
            '100 % vrácení — storno více než 7 dní před eventem',
            '50 % vrácení — storno 3–7 dní před eventem',
            '0 % vrácení — storno méně než 3 dny před eventem',
          ]} />
        </Section>

        <Section title="6. Povinnosti klienta">
          <Ul items={[
            'Využívat platformu v souladu s těmito podmínkami a platným právem.',
            'Zajistit souhlas hostů s pořizováním a zpracováním fotografií.',
            'Informovat hosty o zpracování jejich osobních údajů.',
            'Neposkytovat přihlašovací údaje třetím stranám.',
          ]} />
        </Section>

        <Section title="7. Odpovědnost poskytovatele">
          <P>
            Poskytovatel garantuje dostupnost platformy 99&nbsp;% měsíčně a bezpečné uložení fotografií po dobu 90 dní od eventu.
          </P>
          <P>Poskytovatel nenese odpovědnost za:</P>
          <Ul items={[
            'kvalitu fotografií dodaných fotografem',
            'chyby OCR detekce čísla odznaku způsobené nevyhovující kvalitou snímku',
            'nedoručení emailů způsobené spam filtry třetích stran',
            'výpadky způsobené třetími stranami (AWS, Supabase, Vercel)',
          ]} />
        </Section>

        <Section title="8. Autorská práva">
          <P>
            Fotograf zůstává výhradním autorem jím pořízených fotografií. Piclio má nevýhradní licenci výhradně pro technické zpracování fotografií v rámci poskytované služby (komprese, OCR, přiřazení, uložení, doručení). Tato licence zaniká spolu se smluvním vztahem.
          </P>
        </Section>

        <Section title="9. Ochrana osobních údajů">
          <P>
            Zpracování osobních údajů se řídí dokumentem Zásady ochrany osobních údajů dostupným na{' '}
            <Link href="/gdpr" style={{ color: '#b7e94c', textDecoration: 'none' }}>piclio.cz/gdpr</Link>.
          </P>
        </Section>

        <Section title="10. Změny podmínek">
          <P>
            Poskytovatel je oprávněn tyto podmínky měnit. O změně bude klient informován emailem nejméně 14 dní před její účinností. Pokud klient s novou verzí nesouhlasí, má právo smlouvu ukončit před jejich nabytím účinnosti.
          </P>
        </Section>

        <Section title="11. Rozhodné právo a řešení sporů">
          <P>
            Tyto podmínky se řídí právem České republiky. Veškeré spory budou řešeny příslušnými soudy České republiky. Spotřebitelé mají právo na mimosoudní řešení spotřebitelského sporu.
          </P>
        </Section>

        <Section title="12. Kontakt">
          <P>
            <a href="mailto:ahoj@piclio.cz" style={{ color: '#b7e94c', textDecoration: 'none' }}>ahoj@piclio.cz</a>
            {' | '}
            <a href="https://piclio.cz" style={{ color: '#b7e94c', textDecoration: 'none' }}>piclio.cz</a>
          </P>
        </Section>

        {/* Footer */}
        <div style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 13,
          color: 'rgba(255,255,255,0.3)',
        }}>
          <span>Piclio by Lucifera Studio</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="https://piclio.cz" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>piclio.cz</a>
            <a href="mailto:ahoj@piclio.cz" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>ahoj@piclio.cz</a>
            <Link href="/gdpr" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Zásady ochrany osobních údajů</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
