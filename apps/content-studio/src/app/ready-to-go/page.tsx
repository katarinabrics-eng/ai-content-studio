"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./styles.css";

export default function ReadyToGoPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Three.js hero ── */
  useEffect(() => {
    let animId: number;
    function init() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, 6);

      scene.add(new THREE.AmbientLight(0xffffff, 0.3));
      const limeLight = new THREE.PointLight(0xd0ec78, 2, 20);
      limeLight.position.set(2, 2, 3);
      scene.add(limeLight);
      const blueLight = new THREE.PointLight(0x4080ff, 1, 20);
      blueLight.position.set(-3, -1, 2);
      scene.add(blueLight);

      // Particles
      const particles: THREE.Mesh[] = [];
      const pGeo = new THREE.SphereGeometry(0.04, 8, 8);
      for (let i = 0; i < 60; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: Math.random() > 0.5 ? 0xd0ec78 : 0xffffff,
          emissive: Math.random() > 0.5 ? 0xd0ec78 : 0x333333,
          emissiveIntensity: 0.3,
          transparent: true,
          opacity: Math.random() * 0.5 + 0.2,
        });
        const mesh = new THREE.Mesh(pGeo, mat);
        mesh.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6 - 2);
        mesh.userData.speed = Math.random() * 0.003 + 0.001;
        mesh.userData.offset = Math.random() * Math.PI * 2;
        scene.add(mesh);
        particles.push(mesh);
      }

      // Torus knot
      const torusGeo = new THREE.TorusKnotGeometry(1.2, 0.3, 128, 16, 2, 3);
      const torus = new THREE.Mesh(torusGeo, new THREE.MeshStandardMaterial({
        color: 0xd0ec78, emissive: 0x4a6b0a, emissiveIntensity: 0.2,
        roughness: 0.3, metalness: 0.8, transparent: true, opacity: 0.15,
      }));
      torus.position.set(3.5, 0, -1);
      scene.add(torus);
      const wire = new THREE.Mesh(torusGeo, new THREE.MeshBasicMaterial({ color: 0xd0ec78, wireframe: true, transparent: true, opacity: 0.08 }));
      wire.position.copy(torus.position);
      scene.add(wire);

      // Icosahedron
      const icoGeo = new THREE.IcosahedronGeometry(0.9, 1);
      const ico = new THREE.Mesh(icoGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.12 }));
      ico.position.set(-3.5, 1, -1);
      scene.add(ico);
      const icoWire = new THREE.Mesh(icoGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.06 }));
      icoWire.position.copy(ico.position);
      scene.add(icoWire);

      let mouseX = 0, mouseY = 0;
      const onMouse = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
      };
      document.addEventListener("mousemove", onMouse);

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", onResize);

      const clock = new THREE.Clock();
      function animate() {
        animId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        torus.rotation.x = t * 0.15; torus.rotation.y = t * 0.2;
        wire.rotation.copy(torus.rotation);
        ico.rotation.x = t * 0.1; ico.rotation.y = -t * 0.15;
        icoWire.rotation.copy(ico.rotation);
        camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.04;
        camera.position.y += (mouseY * 0.2 - camera.position.y) * 0.04;
        camera.lookAt(scene.position);
        particles.forEach(p => {
          p.position.y += Math.sin(t * p.userData.speed * 10 + p.userData.offset) * 0.003;
          p.position.x += Math.cos(t * p.userData.speed * 8 + p.userData.offset) * 0.002;
        });
        limeLight.position.x = Math.sin(t * 0.5) * 3;
        limeLight.position.y = Math.cos(t * 0.3) * 2;
        renderer.render(scene, camera);
      }
      animate();

      return () => {
        cancelAnimationFrame(animId);
        document.removeEventListener("mousemove", onMouse);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
      };
    }
    const cleanup = init();
    return () => { if (typeof cleanup === 'function') cleanup(); };
  }, []);

  /* ── Scroll animations ── */
  useEffect(() => {
    // Fade up
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("rtg-visible"); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll(".rtg-fade").forEach(el => obs.observe(el));

    // Pipeline stagger
    const pipeObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".rtg-step").forEach((s, i) => {
            setTimeout(() => s.classList.add("rtg-visible"), i * 200);
          });
          pipeObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    document.querySelectorAll(".rtg-pipeline").forEach(el => pipeObs.observe(el));

    // Parallax
    const onScroll = () => {
      const scrollY = window.scrollY;
      const inner = document.querySelector<HTMLElement>(".rtg-hero-inner");
      if (inner) inner.style.transform = `translateY(${scrollY * 0.2}px)`;
      const glow = document.querySelector<HTMLElement>(".rtg-hero-glow");
      if (glow) glow.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.1}px))`;
    };
    window.addEventListener("scroll", onScroll);

    // Dashboard card interaction
    document.querySelectorAll(".rtg-dp-card").forEach(card => {
      card.addEventListener("click", function (this: Element) {
        const pair = this.closest(".rtg-dp-pair");
        pair?.querySelectorAll(".rtg-dp-card").forEach(c => c.classList.remove("rtg-selected"));
        this.classList.add("rtg-selected");
      });
    });

    return () => {
      obs.disconnect();
      pipeObs.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>

      <div id="rtg-root">
        {/* NAV */}
        <nav id="rtg-nav">
          <div className="rtg-nav-logo">Ready <em>to Go</em></div>
          <div className="rtg-nav-links">
            <a href="#how">Jak to funguje</a>
            <a href="#plans">Plány</a>
            <a href="#rtg-cta" className="rtg-nav-cta">Vyzkoušet →</a>
          </div>
        </nav>

        {/* HERO */}
        <section id="rtg-hero">
          <canvas id="rtg-canvas" ref={canvasRef} />
          <div className="rtg-hero-glow" />
          <div className="rtg-hero-inner">
            <div className="rtg-badge">obsah na sítě · bez hodin práce</div>
            <h1>Obsah bez<br /><em>chaosu.</em></h1>
            <p className="rtg-hero-sub">Videa, záběry a nápady připravené každý týden. Ty jen vybereš a schválíš — systém udělá zbytek.</p>
            <div className="rtg-hero-actions">
              <a href="#rtg-cta" className="rtg-btn-lime">Chci to vyzkoušet</a>
              <a href="#how" className="rtg-btn-ghost">Jak to funguje →</a>
            </div>
            <div className="rtg-hero-stats">
              <div className="rtg-stat">
                <div className="rtg-stat-num">2<span>×</span></div>
                <div className="rtg-stat-label">varianty každého příspěvku</div>
              </div>
              <div className="rtg-stat-div" />
              <div className="rtg-stat">
                <div className="rtg-stat-num"><span>1</span>×</div>
                <div className="rtg-stat-label">zadáš info — nikdy víckrát</div>
              </div>
              <div className="rtg-stat-div" />
              <div className="rtg-stat">
                <div className="rtg-stat-num">0</div>
                <div className="rtg-stat-label">hodin nad tvorbou</div>
              </div>
            </div>
          </div>
        </section>

        <div className="rtg-transition" />

        {/* PAIN */}
        <section className="rtg-section" id="pain">
          <div className="rtg-container">
            <div className="rtg-eyebrow rtg-fade">01 · možná to znáš</div>
            <h2 className="rtg-fade">Máš nápady.<br /><em>Ale zůstanou v hlavě.</em></h2>
            <div className="rtg-pain-list">
              <div className="rtg-pain-item rtg-fade"><div className="rtg-pain-icon">💡</div><span className="rtg-pain-text">Máš nápady, ale nedotáhneš je do konce.</span></div>
              <div className="rtg-pain-item rtg-fade"><div className="rtg-pain-icon">🎬</div><span className="rtg-pain-text">Video zabere víc času než samotný příspěvek.</span></div>
              <div className="rtg-pain-item rtg-fade"><div className="rtg-pain-icon">📱</div><span className="rtg-pain-text">Máš plný telefon materiálu, ale nic z toho nevznikne.</span></div>
              <div className="rtg-pain-item rtg-fade"><div className="rtg-pain-icon">🛠️</div><span className="rtg-pain-text">Nechceš se učit další nástroje.</span></div>
            </div>
            <p className="rtg-pain-closer rtg-fade">A tak to odkládáš.</p>
          </div>
        </section>

        {/* PIPELINE */}
        <section className="rtg-section rtg-alt" id="how">
          <div className="rtg-container">
            <div className="rtg-eyebrow rtg-fade">02 · jak to funguje</div>
            <h2 className="rtg-fade">Zadáš jednou.<br /><em>Schvaluješ navždy.</em></h2>
            <div className="rtg-pipeline">
              <div className="rtg-step">
                <div className="rtg-step-num">1</div>
                <div className="rtg-step-content">
                  <h3>Zadáš web nebo Instagram</h3>
                  <p>Systém si přečte tvou značku — styl, tón, témata, barvy. Jednou. Nikdy víckrát.</p>
                  <span className="rtg-step-tag">⚡ Hotovo za 2 minuty</span>
                </div>
              </div>
              <div className="rtg-step">
                <div className="rtg-step-num">2</div>
                <div className="rtg-step-content">
                  <h3>AI připraví obsah každý týden</h3>
                  <p>Videa, grafiky, texty — vždy ve dvou variantách. Systém ví co tvoří a nikdy neopakuje.</p>
                  <span className="rtg-step-tag">🤖 Automaticky dle intervalu</span>
                </div>
              </div>
              <div className="rtg-step">
                <div className="rtg-step-num">3</div>
                <div className="rtg-step-content">
                  <h3>Ty jen vybereš a schválíš</h3>
                  <p>Varianta A nebo B. Klikneš schválit. Stáhneš nebo naplánuješ. Hotovo.</p>
                  <span className="rtg-step-tag">✓ Bez komunikace, bez briefů</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DASHBOARD PREVIEW */}
        <section className="rtg-section" style={{ paddingTop: 0, paddingBottom: 100 }}>
          <div className="rtg-container">
            <div className="rtg-eyebrow rtg-fade" style={{ marginBottom: 24 }}>03 · co vidíš v dashboardu</div>
            <h2 className="rtg-fade" style={{ marginBottom: 40 }}>Vybereš variantu.<br /><em>Schválíš. Jdeš dál.</em></h2>
            <div className="rtg-dp-wrap rtg-fade">
              <div className="rtg-dp-topbar">
                <div className="rtg-dp-dots">
                  <div className="rtg-dp-dot" /><div className="rtg-dp-dot" /><div className="rtg-dp-dot" />
                </div>
                <div className="rtg-dp-title">Ready to Go · Klientský portál</div>
              </div>
              <div className="rtg-dp-body">
                <div className="rtg-dp-header">
                  <div className="rtg-dp-week">Týden 24.–28. 3.</div>
                  <div className="rtg-dp-prog">1 / 2 schváleno</div>
                </div>
                <div className="rtg-dp-bar"><div className="rtg-dp-bar-fill" /></div>
                <div className="rtg-dp-pair">
                  <div className="rtg-dp-card rtg-selected">
                    <span className="rtg-dp-type video">VIDEO · Reels</span>
                    <div className="rtg-dp-thumb">▶ záběr · 15s</div>
                    <div className="rtg-dp-hook">&ldquo;Tohle mi trvalo 2 hodiny. Teď to zvládnu za 5 minut.&rdquo;</div>
                    <div className="rtg-dp-sub">Hook přímý · tón osobní · Varianta A</div>
                  </div>
                  <div className="rtg-dp-card">
                    <span className="rtg-dp-type video">VIDEO · Reels</span>
                    <div className="rtg-dp-thumb">▶ záběr · 12s</div>
                    <div className="rtg-dp-hook">&ldquo;Co kdybys měla obsah na celý týden hotový za odpoledne?&rdquo;</div>
                    <div className="rtg-dp-sub">Hook otázka · tón zvídavý · Varianta B</div>
                  </div>
                </div>
                <div className="rtg-dp-pair">
                  <div className="rtg-dp-card">
                    <span className="rtg-dp-type graphic">GRAFIKA</span>
                    <div className="rtg-dp-thumb" style={{ aspectRatio: "1/1", maxHeight: 80 }}>◻ světlý styl</div>
                    <div className="rtg-dp-hook">&ldquo;3 věci které mi ušetří hodiny každý týden.&rdquo;</div>
                    <div className="rtg-dp-sub">Varianta A · seznam</div>
                  </div>
                  <div className="rtg-dp-card">
                    <span className="rtg-dp-type graphic">GRAFIKA</span>
                    <div className="rtg-dp-thumb" style={{ aspectRatio: "1/1", maxHeight: 80, background: "rgba(208,236,120,0.06)" }}>◻ tmavý styl</div>
                    <div className="rtg-dp-hook">&ldquo;Přestala jsem řešit obsah. Začala jsem ho tvořit.&rdquo;</div>
                    <div className="rtg-dp-sub">Varianta B · příběh</div>
                  </div>
                </div>
                <div className="rtg-dp-actions">
                  <button className="rtg-dp-btn edit">Upravit text</button>
                  <button className="rtg-dp-btn approve">Schválit vybranou →</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DELIVERABLES */}
        <section className="rtg-section rtg-alt">
          <div className="rtg-container">
            <div className="rtg-eyebrow rtg-fade">04 · co dostaneš</div>
            <h2 className="rtg-fade">Vše připravené<br /><em>k použití.</em></h2>
            <div className="rtg-deliver-grid">
              <div className="rtg-deliver-item rtg-fade"><div className="rtg-d-check">✔</div><h3>Videa + Reels</h3><p>AI zpracuje tvoje záběry nebo vybere z knihovny. Hook overlay, střih, 2 varianty.</p></div>
              <div className="rtg-deliver-item rtg-fade"><div className="rtg-d-check">✔</div><h3>Grafické příspěvky</h3><p>Canva šablony na míru tvého brandu. Vlastní fotka nebo AI generovaný vizuál.</p></div>
              <div className="rtg-deliver-item rtg-fade"><div className="rtg-d-check">✔</div><h3>Texty a hooky</h3><p>Psané v tvém tónu. Systém ví co jsi už použila — nikdy neopakuje.</p></div>
              <div className="rtg-deliver-item rtg-fade"><div className="rtg-d-check">✔</div><h3>Archiv na Google Drive</h3><p>Každý výstup automaticky uložený ve tvé složce. Stahuj kdykoli.</p></div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="rtg-section" id="plans">
          <div className="rtg-container">
            <div className="rtg-eyebrow rtg-fade">05 · plány</div>
            <h2 className="rtg-fade">Vyber si,<br /><em>kde začneš.</em></h2>
            <div className="rtg-pricing-grid">
              <div className="rtg-plan rtg-fade">
                <div className="rtg-plan-head"><div className="rtg-plan-name">Start</div><div className="rtg-plan-tag">Vezmi a použij.</div></div>
                <div className="rtg-plan-counts"><span className="rtg-count-pill v">▶ 2 videa / týden</span><span className="rtg-count-pill g">◻ 2 grafiky / týden</span></div>
                <ul className="rtg-plan-features">
                  <li><span className="rtg-ck">✔</span>AI zpracování videa</li>
                  <li><span className="rtg-ck">✔</span>Hook + grafika overlay</li>
                  <li><span className="rtg-ck">✔</span>Canva grafiky na míru</li>
                  <li><span className="rtg-ck">✔</span>Google Drive archiv</li>
                  <li><span className="rtg-ck">✔</span>2 varianty každého výstupu</li>
                </ul>
              </div>
              <div className="rtg-plan rtg-featured rtg-fade">
                <div className="rtg-plan-head"><div className="rtg-plan-badge">NEJOBLÍBENĚJŠÍ</div><div className="rtg-plan-name">Plus</div><div className="rtg-plan-tag">Nahraješ → dostaneš.</div></div>
                <div className="rtg-plan-counts"><span className="rtg-count-pill v">▶ 4 videa / týden</span><span className="rtg-count-pill g">◻ 4 grafiky / týden</span></div>
                <ul className="rtg-plan-features">
                  <li><span className="rtg-ck">✔</span>Vše ze Start</li>
                  <li><span className="rtg-pl">+</span>Prioritní zpracování</li>
                  <li><span className="rtg-pl">+</span>Reels · Stories · Feed formáty</li>
                  <li><span className="rtg-pl">+</span>Analytika výkonu</li>
                  <li><span className="rtg-pl">+</span>Plánování přímo na sítě</li>
                </ul>
              </div>
              <div className="rtg-plan rtg-fade">
                <div className="rtg-plan-head"><div className="rtg-plan-name">Pro</div><div className="rtg-plan-tag">Maximální výstup.</div></div>
                <div className="rtg-plan-counts"><span className="rtg-count-pill v">▶ 8 videí / týden</span><span className="rtg-count-pill g">◻ 10 grafik / týden</span></div>
                <ul className="rtg-plan-features">
                  <li><span className="rtg-ck">✔</span>Vše z Plus</li>
                  <li><span className="rtg-pl">+</span>Avatar výstupy</li>
                  <li><span className="rtg-pl">+</span>Automatizace bez schvalování</li>
                  <li><span className="rtg-pl">+</span>Dokoupení extra kusů</li>
                  <li><span className="rtg-pl">+</span>Pokročilé šablony na míru</li>
                </ul>
              </div>
            </div>
            <p style={{ textAlign: "center", marginTop: 28, fontSize: 13, color: "#6b6b6b" }}>
              Interval generování: každý týden / ob týden / ob 3 týdny / měsíčně — nastav si sám/sama.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section id="rtg-cta">
          <div className="rtg-container">
            <h2 className="rtg-fade">Začni tvořit<br /><em>jednodušeji.</em></h2>
            <p className="rtg-fade">Bez chaosu. Bez složitého procesu. Bez hodin práce.</p>
            <div className="rtg-cta-actions rtg-fade">
              <a href="#" className="rtg-btn-lime">Chci to vyzkoušet</a>
              <a href="#" className="rtg-btn-ghost">Chci vidět ukázky →</a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="rtg-footer">
          <div className="rtg-f-logo">Ready <em>to Go</em></div>
          <p>Lucifera AI Content Studio · Praha, Kampa</p>
        </footer>
      </div>
    </>
  );
}
