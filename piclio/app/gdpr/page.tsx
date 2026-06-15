import Image from 'next/image'
import Link from 'next/link'

export const metadata = { title: 'Zásady ochrany osobních údajů — Piclio' }

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

export default function GdprPage() {
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
            Zásady ochrany osobních údajů
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Účinnost od: 17. června 2025</p>
        </div>

        <div style={{ width: 40, height: 3, background: '#b7e94c', borderRadius: 2, marginBottom: 48 }} />

        <Section title="1. Správce osobních údajů">
          <P>Piclio by Lucifera Studio — MgA. Katarína Brič &amp; MgA. Luboš Novotný</P>
          <P>Luboš Novotný, Máchova 1730, 511 01 Turnov<br />IČO: 86689614</P>
          <P>E-mail: <a href="mailto:ahoj@piclio.cz" style={{ color: '#b7e94c', textDecoration: 'none' }}>ahoj@piclio.cz</a></P>
        </Section>

        <Section title="2. Jaké osobní údaje zpracováváme">
          <Ul items={[
            'jméno a příjmení',
            'e-mailová adresa',
            'číslo odznaku přiřazené na eventu',
            'fotografie pořízené na eventu',
            'IP adresa a technické údaje o zařízení',
            'token přístupu do galerie',
            'záznamy o odeslané emailové komunikaci',
          ]} />
          <P>
            V případě aktivní funkce rozpoznávání obličejů zpracováváme biometrické údaje (face encoding) v&nbsp;AWS Rekognition.
          </P>
        </Section>

        <Section title="3. Účely zpracování">
          <Ul items={[
            'doručení fotografií hostům eventu',
            'komunikace s hostem ohledně jeho galerie',
            'správa eventů fotografem a zadavatelem',
            'zasílání emailových notifikací (max. 2 emaily na hosta)',
            'zajištění bezpečnosti a integrity systému',
          ]} />
        </Section>

        <Section title="4. Právní základ zpracování">
          <Ul items={[
            'plnění smlouvy (čl. 6 odst. 1 písm. b) GDPR)',
            'oprávněný zájem (čl. 6 odst. 1 písm. f) GDPR)',
            'souhlas — face detection, marketing (čl. 6 odst. 1 písm. a) GDPR)',
          ]} />
        </Section>

        <Section title="5. Zpracování fotografií a biometrických údajů">
          <P>
            Fotografie jsou automaticky zpracovány pomocí OCR detekce čísla odznaku (Claude Vision AI). Volitelně probíhá rozpoznání obličeje přes AWS Rekognition pro přiřazení fotografií ke správnému hostu. Zpracované fotografie jsou uloženy v Supabase Storage a odkaz na galerii je doručen emailem.
          </P>
          <P>
            Biometrické údaje (face encoding) jsou uchovávány výhradně po dobu eventu a smazány do 30 dní po jeho skončení.
          </P>
        </Section>

        <Section title="6. Předávání osobních údajů třetím stranám">
          <Ul items={[
            'Supabase Inc. — databáze a úložiště fotografií (USA, smlouva o zpracování dat)',
            'Amazon Web Services (AWS) — rozpoznávání obličejů (EU region)',
            'Anthropic — OCR zpracování pomocí AI (USA, smlouva o zpracování dat)',
            'Resend Inc. — odesílání emailových notifikací (USA, smlouva o zpracování dat)',
            'Vercel Inc. — hosting platformy (USA, smlouva o zpracování dat)',
          ]} />
        </Section>

        <Section title="7. Doba uchovávání údajů">
          <Ul items={[
            'Fotografie: 90 dní od skončení eventu',
            'Biometrické údaje (face encoding): 30 dní od skončení eventu',
            'Emailové záznamy a komunikace: 12 měsíců',
            'Fakturační a smluvní dokumenty: 10 let (zákonná povinnost)',
          ]} />
        </Section>

        <Section title="8. Práva subjektu údajů">
          <P>Máte právo na:</P>
          <Ul items={[
            'přístup k osobním údajům',
            'opravu nepřesných nebo neúplných údajů',
            'výmaz údajů („právo být zapomenut")',
            'omezení zpracování',
            'přenositelnost údajů',
            'námitku proti zpracování',
            'podání stížnosti u Úřadu pro ochranu osobních údajů (www.uoou.cz)',
          ]} />
          <P>
            Pro uplatnění svých práv nás kontaktujte na{' '}
            <a href="mailto:ahoj@piclio.cz" style={{ color: '#b7e94c', textDecoration: 'none' }}>ahoj@piclio.cz</a>.
          </P>
        </Section>

        <Section title="9. Odvolání souhlasu">
          <P>
            Souhlas se zpracováním osobních údajů (zejména biometrických dat a marketingových sdělení) můžete kdykoli odvolat zasláním emailu na{' '}
            <a href="mailto:ahoj@piclio.cz" style={{ color: '#b7e94c', textDecoration: 'none' }}>ahoj@piclio.cz</a>.
            Odvolání souhlasu nemá vliv na zákonnost zpracování před jeho odvoláním.
          </P>
        </Section>

        <Section title="10. Zabezpečení osobních údajů">
          <P>
            Veškerá komunikace probíhá prostřednictvím šifrovaného spojení HTTPS/TLS. Přístup k fotografiím je chráněn unikátními tokeny. Přímé URL soubory jsou časově omezeny (platnost 48 hodin). Přístup k systému mají pouze oprávněné osoby.
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
            <Link href="/obchodni-podminky" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Obchodní podmínky</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
