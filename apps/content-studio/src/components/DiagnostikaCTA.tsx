'use client'

export default function DiagnostikaCTA() {
  return (
    <section className="cta-sekce">
      <div className="cta-inner">
        <span className="cta-label">Další krok</span>
        <h2 className="cta-nadpis">
          Značka má potenciál.<br />
          <em>Otázka je, zda ho chcete využít.</em>
        </h2>

        <div className="cta-balicek">
          <div className="cta-cena">9 900 Kč · Bez závazku</div>
          <ul className="cta-seznam">
            <li>Analýza vaší online přítomnosti — web, Instagram, LinkedIn</li>
            <li>Strategický hovor 60 minut — co chcete říkat a komu</li>
            <li>20stránková prezentace rozvoje značky a kampaní</li>
            <li>Vizuální board s vaší podobou — náhledovky jak budete vypadat</li>
            <li>3 Canva šablony na míru s ukázkou v reálných příspěvcích</li>
          </ul>
          <a
            href="/rezervace?from=premiova&step=calendar"
            className="cta-tlacitko"
          >
            Rezervovat vstupní hovor →
          </a>
          <p className="cta-poznamka">9 900 Kč · Bez závazku · Fáze 1</p>
        </div>
      </div>

      <style jsx>{`
        .cta-sekce {
          background: #111;
          border-radius: 20px;
          padding: 4rem 2rem;
          margin: 3rem 0;
          text-align: center;
          font-family: var(--font-dm-sans), 'Helvetica Neue', sans-serif;
        }
        .cta-inner {
          max-width: 620px;
          margin: 0 auto;
        }
        .cta-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #b7e94c;
          margin-bottom: 1rem;
          font-family: var(--font-dm-sans), sans-serif;
        }
        .cta-nadpis {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: clamp(2rem, 3.8vw, 3rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 2rem;
        }
        .cta-nadpis em {
          color: #b7e94c;
          font-style: italic;
          font-weight: 400;
        }
        .cta-balicek {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 2rem;
          text-align: left;
        }
        .cta-cena {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #b7e94c;
          margin-bottom: 1rem;
          text-transform: uppercase;
        }
        .cta-seznam {
          list-style: none;
          padding: 0;
          margin: 0 0 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .cta-seznam li {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.75);
          padding-left: 1.25rem;
          position: relative;
          font-family: var(--font-dm-sans), sans-serif;
          line-height: 1.6;
        }
        .cta-seznam li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #b7e94c;
          font-weight: 700;
        }
        .cta-tlacitko {
          display: block;
          width: 100%;
          background: #b7e94c;
          color: #111;
          font-weight: 700;
          font-size: 1rem;
          text-align: center;
          padding: 1rem 2rem;
          border-radius: 10px;
          text-decoration: none;
          transition: opacity 0.2s;
          box-sizing: border-box;
          font-family: var(--font-dm-sans), sans-serif;
          letter-spacing: -0.01em;
        }
        .cta-tlacitko:hover {
          opacity: 0.88;
        }
        .cta-poznamka {
          text-align: center;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.35);
          margin: 0.75rem 0 0;
        }
      `}</style>
    </section>
  )
}
