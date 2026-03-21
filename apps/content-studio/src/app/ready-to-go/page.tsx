"use client";

import { useEffect } from "react";

export default function ReadyToGoPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
    document.querySelectorAll("#rtg-hero .fade-up").forEach((el) =>
      el.classList.add("visible")
    );
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        /* ─── RESET & BASE ─── */
        #rtg-root *, #rtg-root *::before, #rtg-root *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }
        #rtg-root {
          --lime: #d0ec78;
          --lime-bright: #b7e94c;
          --black: #111111;
          --white: #ffffff;
          --cream: #f7f5ef;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          background: var(--black);
          color: var(--white);
          font-size: 17px;
          line-height: 1.6;
          overflow-x: hidden;
        }

        /* ─── TYPOGRAPHY ─── */
        #rtg-root h1 {
          font-family: var(--font-playfair, 'Playfair Display', serif);
          font-size: clamp(2.6rem, 6vw, 5rem);
          line-height: 1.1;
          letter-spacing: -0.02em;
          font-weight: 700;
        }
        #rtg-root h2 {
          font-family: var(--font-playfair, 'Playfair Display', serif);
          font-size: clamp(1.8rem, 4vw, 3rem);
          line-height: 1.2;
          font-weight: 700;
        }
        #rtg-root .rtg-label {
          font-size: 0.75rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--lime);
          font-weight: 500;
          display: block;
          margin-bottom: 1rem;
        }

        /* ─── LAYOUT ─── */
        #rtg-root .container {
          max-width: 1020px;
          margin: 0 auto;
          padding: 0 28px;
        }
        #rtg-root .container--narrow {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 28px;
        }
        #rtg-root section { padding: 100px 0; }
        #rtg-root section.light {
          background: var(--cream);
          color: var(--black);
        }
        #rtg-root section.lime-bg {
          background: var(--lime);
          color: var(--black);
        }

        /* ─── NAV ─── */
        #rtg-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          padding: 20px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(17,17,17,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        #rtg-nav .nav-logo {
          font-family: var(--font-playfair, 'Playfair Display', serif);
          font-size: 1.1rem;
          color: var(--white);
          text-decoration: none;
          letter-spacing: 0.04em;
        }
        #rtg-nav .nav-logo span { color: var(--lime); }
        #rtg-nav .nav-cta {
          font-size: 0.85rem;
          background: var(--lime);
          color: var(--black);
          border: none;
          padding: 10px 22px;
          border-radius: 2px;
          cursor: pointer;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.2s;
          display: inline-block;
        }
        #rtg-nav .nav-cta:hover { background: var(--lime-bright); }

        /* ─── HERO ─── */
        #rtg-hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding-top: 80px;
          position: relative;
          overflow: hidden;
        }
        #rtg-root .hero-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        #rtg-root .hero-title em {
          font-style: italic;
          color: var(--lime);
        }
        #rtg-root .hero-sub {
          font-size: 1.15rem;
          color: rgba(255,255,255,0.72);
          max-width: 460px;
          line-height: 1.7;
          margin-bottom: 2.4rem;
          margin-top: 1.4rem;
        }
        #rtg-root .hero-tags {
          display: flex;
          gap: 12px;
          margin-bottom: 2.8rem;
          flex-wrap: wrap;
        }
        #rtg-root .tag {
          font-size: 0.82rem;
          padding: 6px 14px;
          border: 1px solid rgba(208,236,120,0.35);
          border-radius: 100px;
          color: var(--lime);
          letter-spacing: 0.04em;
        }
        #rtg-root .hero-visual {
          background: rgba(208,236,120,0.07);
          border: 1px solid rgba(208,236,120,0.18);
          border-radius: 4px;
          aspect-ratio: 4/3;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        #rtg-root .hero-visual::before {
          content: '';
          position: absolute;
          top: -40%; left: -40%;
          width: 180%; height: 180%;
          background: radial-gradient(circle at 60% 40%, rgba(183,233,76,0.13) 0%, transparent 65%);
        }
        #rtg-root .hero-visual-inner {
          text-align: center;
          position: relative;
          z-index: 1;
        }
        #rtg-root .hero-visual-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          display: block;
        }
        #rtg-root .hero-visual-label {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 20px;
        }
        #rtg-root .mockup-bars {
          display: flex; gap: 8px; justify-content: center; margin-top: 1.5rem;
        }
        #rtg-root .mockup-bars + .mockup-bars { margin-top: 8px; }
        #rtg-root .bar {
          border-radius: 2px;
          background: rgba(208,236,120,0.25);
          height: 8px;
        }
        #rtg-root .hero-bg-line {
          position: absolute;
          top: 0; bottom: 0; right: 42%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(208,236,120,0.12) 30%, rgba(208,236,120,0.12) 70%, transparent);
          pointer-events: none;
        }

        /* ─── BUTTONS ─── */
        #rtg-root .btn {
          display: inline-block;
          padding: 16px 32px;
          font-size: 0.95rem;
          font-weight: 500;
          border-radius: 2px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
        }
        #rtg-root .btn-primary { background: var(--lime); color: var(--black); }
        #rtg-root .btn-primary:hover { background: var(--lime-bright); transform: translateY(-1px); }
        #rtg-root .btn-outline {
          background: transparent;
          color: var(--white);
          border: 1px solid rgba(255,255,255,0.25);
          margin-left: 14px;
        }
        #rtg-root .btn-outline:hover { border-color: var(--lime); color: var(--lime); }
        #rtg-root .btn-dark { background: var(--black); color: var(--white); }
        #rtg-root .btn-dark:hover { background: #222; }

        /* ─── REALITA ─── */
        #rtg-realita { border-top: 1px solid rgba(255,255,255,0.07); }
        #rtg-root .pain-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          margin-top: 3rem;
          border: 1px solid rgba(255,255,255,0.08);
        }
        #rtg-root .pain-item {
          padding: 28px 32px;
          border: 1px solid rgba(255,255,255,0.08);
          transition: background 0.2s;
        }
        #rtg-root .pain-item:hover { background: rgba(208,236,120,0.04); }
        #rtg-root .pain-arrow { color: var(--lime); margin-right: 10px; font-style: normal; }
        #rtg-root .pain-item p { color: rgba(255,255,255,0.78); font-size: 1rem; }
        #rtg-root .pain-conclusion {
          text-align: center;
          margin-top: 3rem;
          font-family: var(--font-playfair, 'Playfair Display', serif);
          font-size: 1.5rem;
          font-style: italic;
          color: rgba(255,255,255,0.45);
        }

        /* ─── CO KDYBY ─── */
        #rtg-cokdyby { background: #161616; }
        #rtg-root .imagine-list {
          list-style: none;
          margin-top: 3rem;
          display: flex;
          flex-direction: column;
        }
        #rtg-root .imagine-list li {
          padding: 24px 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: grid;
          grid-template-columns: 40px 1fr;
          gap: 16px;
          align-items: start;
          font-size: 1.1rem;
          color: rgba(255,255,255,0.85);
          transition: color 0.2s;
        }
        #rtg-root .imagine-list li:hover { color: var(--white); }
        #rtg-root .imagine-list li:first-child { border-top: 1px solid rgba(255,255,255,0.07); }
        #rtg-root .imagine-num {
          font-family: var(--font-playfair, 'Playfair Display', serif);
          font-size: 1.3rem;
          color: var(--lime);
          font-style: italic;
          padding-top: 2px;
        }
        #rtg-root .imagine-end {
          margin-top: 2.5rem;
          font-size: 1rem;
          color: rgba(255,255,255,0.42);
          font-style: italic;
        }

        /* ─── CO DOSTANEŠ ─── */
        #rtg-root .delivers-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-top: 3rem;
        }
        #rtg-root .deliver-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 3px;
          padding: 32px;
          transition: border-color 0.2s, background 0.2s;
        }
        #rtg-root .deliver-card:hover {
          border-color: rgba(208,236,120,0.3);
          background: rgba(208,236,120,0.03);
        }
        #rtg-root .deliver-icon { font-size: 1.8rem; margin-bottom: 1rem; display: block; }
        #rtg-root .deliver-card h3 {
          font-size: 1.05rem;
          font-style: normal;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: var(--white);
        }
        #rtg-root .deliver-card p { font-size: 0.9rem; color: rgba(255,255,255,0.55); line-height: 1.6; }
        #rtg-root .delivers-closing {
          text-align: center;
          margin-top: 2.5rem;
          color: rgba(255,255,255,0.45);
          font-style: italic;
          font-family: var(--font-playfair, 'Playfair Display', serif);
          font-size: 1.2rem;
        }

        /* ─── JAK TO FUNGUJE ─── */
        #rtg-jak { background: #161616; }
        #rtg-root .steps-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          margin-top: 3.5rem;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.08);
        }
        #rtg-root .step {
          background: var(--black);
          padding: 40px 32px;
          text-align: center;
        }
        #rtg-root .step-num {
          font-family: var(--font-playfair, 'Playfair Display', serif);
          font-size: 3rem;
          color: var(--lime);
          font-style: italic;
          display: block;
          line-height: 1;
          margin-bottom: 1.2rem;
          opacity: 0.7;
        }
        #rtg-root .step h3 {
          font-style: normal;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-weight: 500;
          font-size: 1rem;
          color: var(--white);
          margin-bottom: 0.6rem;
        }
        #rtg-root .step p { font-size: 0.88rem; color: rgba(255,255,255,0.5); }
        #rtg-root .step-done {
          margin-top: 3rem;
          text-align: center;
          font-family: var(--font-playfair, 'Playfair Display', serif);
          font-size: 2rem;
          font-style: italic;
          color: var(--lime);
        }

        /* ─── PRO KOHO ─── */
        #rtg-root .who-list {
          list-style: none;
          margin-top: 3rem;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        #rtg-root .who-list li {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          font-size: 1.05rem;
          color: rgba(17,17,17,0.8);
          padding: 22px 28px;
          background: white;
          border-left: 3px solid var(--lime-bright);
          border-radius: 1px;
        }
        #rtg-root .who-dot {
          width: 8px; height: 8px;
          background: var(--black);
          border-radius: 50%;
          margin-top: 8px;
          flex-shrink: 0;
        }

        /* ─── VARIANTY ─── */
        #rtg-root .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 3.5rem;
        }
        #rtg-root .plan {
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 3px;
          padding: 36px 28px;
          position: relative;
          transition: border-color 0.25s;
        }
        #rtg-root .plan:hover { border-color: rgba(208,236,120,0.4); }
        #rtg-root .plan.featured {
          border-color: var(--lime);
          background: rgba(208,236,120,0.04);
        }
        #rtg-root .plan-badge {
          position: absolute;
          top: -13px; left: 28px;
          background: var(--lime);
          color: var(--black);
          font-size: 0.72rem;
          padding: 4px 12px;
          border-radius: 100px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        #rtg-root .plan-name {
          font-family: var(--font-playfair, 'Playfair Display', serif);
          font-size: 1.5rem;
          margin-bottom: 0.4rem;
        }
        #rtg-root .plan-tagline {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.5);
          margin-bottom: 1.8rem;
          font-style: italic;
        }
        #rtg-root .plan-price {
          font-size: 1.6rem;
          font-weight: 500;
          margin-bottom: 1.8rem;
          color: var(--lime);
        }
        #rtg-root .plan-price span {
          font-size: 0.88rem;
          font-weight: 300;
          color: rgba(255,255,255,0.4);
        }
        #rtg-root .plan-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 2rem;
        }
        #rtg-root .plan-features li {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.7);
          display: flex;
          gap: 10px;
          align-items: flex-start;
          line-height: 1.5;
        }
        #rtg-root .plan-features li::before {
          content: '✓';
          color: var(--lime);
          font-size: 0.85rem;
          margin-top: 1px;
          flex-shrink: 0;
        }
        #rtg-root .plan-btn {
          display: block;
          width: 100%;
          padding: 13px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 2px;
          font-size: 0.9rem;
          color: var(--white);
          text-decoration: none;
          cursor: pointer;
          background: transparent;
          transition: all 0.2s;
        }
        #rtg-root .plan-btn:hover { border-color: var(--lime); color: var(--lime); }
        #rtg-root .plan.featured .plan-btn {
          background: var(--lime);
          color: var(--black);
          border-color: var(--lime);
        }
        #rtg-root .plan.featured .plan-btn:hover { background: var(--lime-bright); }
        #rtg-root .plans-note {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.3);
        }

        /* ─── CTA FINAL ─── */
        #rtg-cta-final {
          background: var(--lime);
          padding: 120px 0;
          text-align: center;
        }
        #rtg-cta-final h2 { color: var(--black); margin-bottom: 1rem; }
        #rtg-cta-final p {
          font-size: 1.1rem;
          color: rgba(17,17,17,0.65);
          max-width: 480px;
          margin: 0 auto 2.5rem;
        }

        /* ─── FOOTER ─── */
        #rtg-footer {
          background: var(--black);
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 40px 0;
          text-align: center;
        }
        #rtg-footer p { font-size: 0.82rem; color: rgba(255,255,255,0.28); letter-spacing: 0.06em; }
        #rtg-footer a { color: rgba(255,255,255,0.35); text-decoration: none; }
        #rtg-footer a:hover { color: var(--lime); }

        /* ─── ANIMATIONS ─── */
        #rtg-root .fade-up {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        #rtg-root .fade-up.visible { opacity: 1; transform: translateY(0); }
        #rtg-root .fade-up.delay-1 { transition-delay: 0.1s; }
        #rtg-root .fade-up.delay-2 { transition-delay: 0.22s; }
        #rtg-root .fade-up.delay-3 { transition-delay: 0.34s; }
        #rtg-root .fade-up.delay-4 { transition-delay: 0.46s; }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 800px) {
          #rtg-root .hero-inner { grid-template-columns: 1fr; gap: 40px; }
          #rtg-root .hero-right { display: none; }
          #rtg-root .pain-grid { grid-template-columns: 1fr; }
          #rtg-root .delivers-grid { grid-template-columns: 1fr; }
          #rtg-root .steps-row { grid-template-columns: 1fr; }
          #rtg-root .plans-grid { grid-template-columns: 1fr; }
          #rtg-root .hero-bg-line { display: none; }
          #rtg-root section { padding: 70px 0; }
        }
      `}</style>

      {/* NAV */}
      <nav id="rtg-nav">
        <a href="#" className="nav-logo">
          Lucifera <span>Ready</span>
        </a>
        <a href="#rtg-varianty" className="nav-cta">Chci to vyzkoušet</a>
      </nav>

      <div id="rtg-root">
        {/* HERO */}
        <section id="rtg-hero">
          <div className="hero-bg-line" />
          <div className="container">
            <div className="hero-inner">
              <div className="hero-left">
                <span className="rtg-label">Lucifera Ready</span>
                <h1 className="hero-title">
                  Obsah na sítě<br />
                  <em>bez hodin</em><br />
                  práce.
                </h1>
                <p className="hero-sub">
                  Videa, záběry a nápady, které jen vezmeš a použiješ — nebo z nich během pár minut vytvoříš vlastní obsah.
                </p>
                <div className="hero-tags">
                  <span className="tag">bez chaosu</span>
                  <span className="tag">bez složitého tvoření</span>
                  <span className="tag">bez začínání od nuly</span>
                </div>
                <a href="#rtg-varianty" className="btn btn-primary">Chci to vyzkoušet</a>
                <a href="#rtg-codostanes" className="btn btn-outline">Co dostanu?</a>
              </div>
              <div className="hero-right">
                <div className="hero-visual">
                  <div className="hero-visual-inner">
                    <span className="hero-visual-icon">🎬</span>
                    <div className="mockup-bars">
                      <div className="bar" style={{ width: 60 }} />
                      <div className="bar" style={{ width: 90, background: "rgba(208,236,120,0.45)" }} />
                      <div className="bar" style={{ width: 45 }} />
                    </div>
                    <div className="mockup-bars">
                      <div className="bar" style={{ width: 50 }} />
                      <div className="bar" style={{ width: 80, background: "rgba(208,236,120,0.3)" }} />
                      <div className="bar" style={{ width: 60 }} />
                    </div>
                    <p className="hero-visual-label">Knihovna záběrů čeká</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REALITA */}
        <section id="rtg-realita">
          <div className="container--narrow">
            <span className="rtg-label fade-up">Možná to znáš…</span>
            <h2 className="fade-up">Nápady jsou.<br />Čas na tvorbu ne.</h2>
            <div className="pain-grid fade-up delay-1">
              <div className="pain-item">
                <p><em className="pain-arrow">→</em>Máš nápady, ale nedotáhneš je do konce</p>
              </div>
              <div className="pain-item">
                <p><em className="pain-arrow">→</em>Video zabere víc času než samotný příspěvek</p>
              </div>
              <div className="pain-item">
                <p><em className="pain-arrow">→</em>Máš plný telefon materiálu, ale nic z toho nevznikne</p>
              </div>
              <div className="pain-item">
                <p><em className="pain-arrow">→</em>Nechceš se učit další nástroj navíc</p>
              </div>
            </div>
            <p className="pain-conclusion fade-up delay-2">A tak to odkládáš.</p>
          </div>
        </section>

        {/* CO KDYBY */}
        <section id="rtg-cokdyby">
          <div className="container--narrow">
            <span className="rtg-label fade-up">Co kdyby to šlo jinak</span>
            <h2 className="fade-up">Představ si, že<br />máš vše připravené.</h2>
            <ul className="imagine-list">
              <li className="fade-up delay-1">
                <span className="imagine-num">1</span>
                <span>Záběry, které můžeš rovnou použít — žádné hledání, žádný chaos</span>
              </li>
              <li className="fade-up delay-2">
                <span className="imagine-num">2</span>
                <span>Nemusíš začínat od nuly. Vždy je odkud pokračovat.</span>
              </li>
              <li className="fade-up delay-3">
                <span className="imagine-num">3</span>
                <span>Když něco natočíš, jen to nahraješ… a máš hotovo.</span>
              </li>
            </ul>
            <p className="imagine-end fade-up delay-4">Bez složitého procesu. Bez hodin práce.</p>
          </div>
        </section>

        {/* CO DOSTANEŠ */}
        <section id="rtg-codostanes">
          <div className="container">
            <span className="rtg-label fade-up">Co dostaneš</span>
            <h2 className="fade-up">Všechno, co potřebuješ<br />k tvorbě obsahu.</h2>
            <div className="delivers-grid">
              <div className="deliver-card fade-up delay-1">
                <span className="deliver-icon">🎥</span>
                <h3>Knihovna záběrů</h3>
                <p>Různé styly, nálady, témata. Vybereš, co pasuje — a použiješ hned.</p>
              </div>
              <div className="deliver-card fade-up delay-2">
                <span className="deliver-icon">🎨</span>
                <h3>Vizuály, které ladí</h3>
                <p>Žádný chaos ve feedu. Vizuální konzistence bez designérských znalostí.</p>
              </div>
              <div className="deliver-card fade-up delay-3">
                <span className="deliver-icon">✍️</span>
                <h3>Nápady + začátky textů</h3>
                <p>Připravené formulace, které si upravíš podle sebe. Prázdná stránka zmizí.</p>
              </div>
              <div className="deliver-card fade-up delay-4">
                <span className="deliver-icon">📲</span>
                <h3>Z vlastního videa hotový výstup</h3>
                <p>Nahraješ záznam — dostaneš výstup. Bez střihu, bez programů.</p>
              </div>
            </div>
            <p className="delivers-closing fade-up">Ty tvoříš. Ale bez té nejtěžší části.</p>
          </div>
        </section>

        {/* JAK TO FUNGUJE */}
        <section id="rtg-jak">
          <div className="container">
            <span className="rtg-label fade-up">Jak to funguje</span>
            <h2 className="fade-up">Tři kroky.<br />Hotovo.</h2>
            <div className="steps-row">
              <div className="step fade-up delay-1">
                <span className="step-num">1</span>
                <h3>Vybereš</h3>
                <p>Z knihovny si vybereš záběry, nápady nebo šablony, které se hodí.</p>
              </div>
              <div className="step fade-up delay-2">
                <span className="step-num">2</span>
                <h3>Upravíš</h3>
                <p>Přizpůsobíš si to podle sebe — nebo necháš upravit za sebe.</p>
              </div>
              <div className="step fade-up delay-3">
                <span className="step-num">3</span>
                <h3>Publikuješ</h3>
                <p>Dáš to na sítě. Tak jednoduché to je.</p>
              </div>
            </div>
            <p className="step-done fade-up">— hotovo.</p>
          </div>
        </section>

        {/* PRO KOHO */}
        <section id="rtg-prokoho" className="light">
          <div className="container--narrow">
            <span className="rtg-label fade-up" style={{ color: "#333" }}>Pro koho to je</span>
            <h2 className="fade-up" style={{ color: "#111" }}>Pro ty, kdo chtějí<br />tvořit — ale efektivně.</h2>
            <ul className="who-list">
              <li className="fade-up delay-1"><span className="who-dot" />Tvoříš obsah sám/sama a nechceš u toho trávit hodiny</li>
              <li className="fade-up delay-2"><span className="who-dot" />Máš nápady, ale chybí ti čas nebo energie je dotáhnout</li>
              <li className="fade-up delay-3"><span className="who-dot" />Video tě brzdí — chceš výsledek, ne učit se nástroje</li>
              <li className="fade-up delay-4"><span className="who-dot" />Chceš konzistentní obsah bez toho, aby to pohltilo tvůj čas</li>
            </ul>
          </div>
        </section>

        {/* VARIANTY */}
        <section id="rtg-varianty">
          <div className="container">
            <span className="rtg-label fade-up">Varianty</span>
            <h2 className="fade-up">Vyber si, co teď<br />potřebuješ nejvíc.</h2>
            <div className="plans-grid">
              <div className="plan fade-up delay-1">
                <div className="plan-name">Start</div>
                <div className="plan-tagline">Vezmi a použij</div>
                <div className="plan-price">— Kč <span>/ měsíc</span></div>
                <ul className="plan-features">
                  <li>Knihovna záběrů a videí</li>
                  <li>Nápady + začátky textů</li>
                  <li>Vizuály připravené k použití</li>
                </ul>
                <a href="#" className="plan-btn">Začít se Startem</a>
              </div>
              <div className="plan featured fade-up delay-2">
                <div className="plan-badge">Nejoblíbenější</div>
                <div className="plan-name">Plus</div>
                <div className="plan-tagline">Víc než jen obsah</div>
                <div className="plan-price">— Kč <span>/ měsíc</span></div>
                <ul className="plan-features">
                  <li>Vše ze Startu</li>
                  <li>Nahraješ vlastní video → dostaneš výstup</li>
                  <li>Bez střihu, bez programů</li>
                </ul>
                <a href="#" className="plan-btn">Chci Plus</a>
              </div>
              <div className="plan fade-up delay-3">
                <div className="plan-name">Pro</div>
                <div className="plan-tagline">Pro ty, kdo jedou naplno</div>
                <div className="plan-price">— Kč <span>/ měsíc</span></div>
                <ul className="plan-features">
                  <li>Vše z Plusu</li>
                  <li>Prioritní zpracování</li>
                  <li>Pokročilé možnosti výstupu</li>
                </ul>
                <a href="#" className="plan-btn">Chci Pro</a>
              </div>
            </div>
            <p className="plans-note">Nevíš, co si vybrat? Napiš nám — poradíme.</p>
          </div>
        </section>

        {/* CTA FINAL */}
        <section id="rtg-cta-final">
          <div className="container--narrow">
            <h2 className="fade-up">Začni tvořit.<br />Bez toho složitého.</h2>
            <p className="fade-up delay-1">Vyber si variantu a vyzkoušej, jak vypadá tvorba obsahu bez zbytečné námahy.</p>
            <a href="#rtg-varianty" className="btn btn-dark fade-up delay-2">Chci to vyzkoušet</a>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="rtg-footer">
          <p>
            © 2025 <a href="#">Lucifera AI Content Studio</a> · Praha ·{" "}
            <a href="#">Podmínky</a> · <a href="#">Kontakt</a>
          </p>
        </footer>
      </div>
    </>
  );
}
