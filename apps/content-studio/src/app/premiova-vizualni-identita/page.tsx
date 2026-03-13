"use client";

import { useEffect, useState } from "react";
import { Header } from "../components/Header";

const CAROUSEL_PHOTOS = [
  "/placeholders/UKAZKY BRANDU/01.JPG",
  "/placeholders/UKAZKY BRANDU/02.JPG",
  "/placeholders/UKAZKY BRANDU/04.JPG",
  "/placeholders/UKAZKY BRANDU/05.JPG",
  "/placeholders/UKAZKY BRANDU/06.JPG",
  "/placeholders/UKAZKY BRANDU/07.JPG",
  "/placeholders/UKAZKY BRANDU/08.JPG",
  "/placeholders/UKAZKY BRANDU/09.JPG",
];

export default function PremiovaVizualniIdentita() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((i) => (i + 1) % CAROUSEL_PHOTOS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("vis");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
    <Header />
    <div className="pvi-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        .pvi-page {
          --lime:#b4e842; --lime-dark:#8fb82e; --lime-bg:rgba(180,232,66,0.08); --lime-border:rgba(180,232,66,0.25);
          --black:#0e0e0e; --dark:#1a1a1a; --cream:#f5f4ef; --sand:#ece9e1; --white:#fff;
          --gray:#888; --gray-light:#e0ddd5; --warm:#c9a96e;
          --r:16px;
          font-family:'DM Sans',sans-serif;
          background:var(--cream);
          color:var(--black);
          overflow-x:hidden;
        }
        html { scroll-behavior:smooth; }

        /* ── HERO ── */
        .pvi-page .hero{
          position:relative;min-height:100vh;
          display:flex;align-items:center;overflow:hidden;
        }
        .pvi-page .hero-container{
          width:100%;max-width:1360px;margin:0 auto;
          padding:80px 40px;position:relative;z-index:2;
        }
        .pvi-page .hero-left{
          display:flex;flex-direction:column;max-width:540px;
        }
        .pvi-page .hero-right{
          position:absolute;right:0;top:0;bottom:0;width:50%;
          background:var(--black);overflow:hidden;
        }
        .pvi-page .hero-badge{
          display:inline-flex;align-items:center;gap:6px;
          font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;
          color:var(--lime-dark);margin-bottom:24px;
        }
        .pvi-page .hero-badge::before{content:'';width:24px;height:1px;background:var(--lime-dark);}
        .pvi-page h1{
          font-family:'DM Sans',sans-serif;
          font-size:clamp(40px,4.8vw,66px);font-weight:900;line-height:1.05;
          letter-spacing:-0.03em;
          margin-bottom:24px;
        }
        .pvi-page h1 em{font-style:italic;font-weight:900;color:var(--lime-dark);}
        .pvi-page .hero-sub{font-size:16px;color:#555;line-height:1.7;max-width:440px;margin-bottom:36px;}
        .pvi-page .hero-actions{display:flex;flex-direction:column;gap:10px;}
        .pvi-page .btn-primary{
          display:inline-flex;align-items:center;gap:10px;
          background:var(--black);color:#fff;
          padding:16px 32px;border-radius:10px;
          font-size:15px;font-weight:600;border:none;cursor:pointer;
          width:fit-content;transition:all 0.2s;
        }
        .pvi-page .btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,0.2);}
        .pvi-page .btn-secondary{
          display:inline-flex;align-items:center;gap:8px;
          color:var(--gray);font-size:13px;cursor:pointer;
          border:none;background:none;padding:0;
          transition:color 0.2s;width:fit-content;
        }
        .pvi-page .btn-secondary:hover{color:var(--black);}
        .pvi-page .hero-note{font-size:12px;color:#bbb;margin-top:6px;}

        /* HERO RIGHT — CROSSFADE CAROUSEL */
        .pvi-page .hero-right{
          position:relative;background:var(--black);overflow:hidden;
        }
        .pvi-page .carousel-img{
          position:absolute;inset:0;width:100%;height:100%;
          object-fit:cover;object-position:center top;
          opacity:0;transition:opacity 1.4s ease;
          pointer-events:none;
        }
        .pvi-page .carousel-img.active{opacity:1;}
        .pvi-page .carousel-overlay{
          position:absolute;inset:0;pointer-events:none;
          background:linear-gradient(to right,rgba(0,0,0,0.18) 0%,transparent 40%),
                      linear-gradient(to top,rgba(0,0,0,0.35) 0%,transparent 50%);
        }

        /* FLOATING CARDS */
        .pvi-page .float-card{
          position:absolute;background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);
          border-radius:12px;padding:14px 18px;box-shadow:0 8px 32px rgba(0,0,0,0.25);
        }
        .pvi-page .fc-1{bottom:80px;left:32px;animation:float1 4s ease-in-out infinite;}
        .pvi-page .fc-2{top:100px;right:32px;animation:float2 5s ease-in-out infinite;}
        .pvi-page .fc-3{bottom:160px;right:28px;animation:float3 4.5s ease-in-out infinite;}
        @keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
        @keyframes float3{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .pvi-page .fc-dot{width:7px;height:7px;border-radius:50%;background:var(--lime);display:inline-block;margin-right:6px;animation:pulse 1.8s ease infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .pvi-page .fc-title{font-size:11px;font-weight:700;color:var(--black);margin-bottom:2px;}
        .pvi-page .fc-sub{font-size:10px;color:var(--gray);}
        .pvi-page .fc-num{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:700;color:var(--lime-dark);line-height:1;}

        /* ── SECTION BASE ── */
        .pvi-page section{padding:96px 80px;}
        .pvi-page .label{font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:var(--lime-dark);margin-bottom:10px;}
        .pvi-page h2{font-family:'Cormorant Garamond',serif;font-size:clamp(32px,3.5vw,48px);font-weight:700;line-height:1.15;margin-bottom:16px;}
        .pvi-page h2 em{font-style:italic;font-weight:300;}
        .pvi-page .section-sub{font-size:15px;color:var(--gray);line-height:1.7;max-width:580px;}

        /* ── PROBLEM ── */
        .pvi-page .problem{background:var(--black);padding:96px 80px;}
        .pvi-page .problem-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;max-width:1200px;margin:0 auto;}
        .pvi-page .problem-left h2{color:#fff;}
        .pvi-page .problem-left h2 em{color:var(--lime);}
        .pvi-page .problem-quote{
          font-family:'Cormorant Garamond',serif;font-size:28px;font-style:italic;
          color:rgba(255,255,255,0.4);line-height:1.4;
          border-left:2px solid var(--lime-border);padding-left:24px;margin-top:32px;
        }
        .pvi-page .problem-list{list-style:none;display:flex;flex-direction:column;gap:16px;}
        .pvi-page .problem-list li{
          display:flex;gap:14px;align-items:flex-start;
          font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;
        }
        .pvi-page .pl-icon{
          width:32px;height:32px;border-radius:8px;flex-shrink:0;
          background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);
          display:flex;align-items:center;justify-content:center;font-size:14px;
        }

        /* ── WOW ── */
        .pvi-page .wow{background:var(--cream);padding:96px 80px;max-width:none;}
        .pvi-page .wow-inner{max-width:1200px;margin:0 auto;}
        .pvi-page .wow-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;margin-top:56px;}

        /* BOARD MOCKUP */
        .pvi-page .board-mockup{
          background:var(--black);border-radius:20px;padding:24px;
          box-shadow:0 32px 80px rgba(0,0,0,0.2);position:relative;overflow:hidden;
        }
        .pvi-page .bm-header{display:flex;align-items:center;gap:6px;margin-bottom:18px;}
        .pvi-page .bm-dot{width:9px;height:9px;border-radius:50%;}
        .pvi-page .bm-title{font-size:11px;color:rgba(255,255,255,0.25);margin-left:8px;letter-spacing:0.06em;}
        .pvi-page .bm-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .pvi-page .bm-cell{border-radius:12px;overflow:hidden;position:relative;}
        .pvi-page .bm-cell-main{grid-column:span 2;height:200px;}
        .pvi-page .bm-cell-sub{height:120px;}
        .pvi-page .bc-1{background:radial-gradient(ellipse at 35% 40%,#c9a96e 0%,#1a1208 70%);display:flex;align-items:flex-end;padding:12px;}
        .pvi-page .bc-2{background:linear-gradient(135deg,#e8d5b0 0%,#c9a96e 100%);}
        .pvi-page .bc-3{background:#1a2820;display:flex;align-items:center;justify-content:center;}
        .pvi-page .bc-label{font-size:10px;font-weight:600;color:rgba(255,255,255,0.6);letter-spacing:0.08em;text-transform:uppercase;}
        .pvi-page .bm-outfit-tag{
          position:absolute;top:10px;right:10px;
          background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);
          padding:4px 10px;border-radius:6px;font-size:10px;color:rgba(255,255,255,0.7);
        }
        .pvi-page .bm-score{
          position:absolute;bottom:16px;right:16px;
          background:var(--black);border:1px solid var(--lime-border);
          border-radius:10px;padding:10px 14px;text-align:center;
        }
        .pvi-page .bm-score-num{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--lime);}
        .pvi-page .bm-score-label{font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.08em;}

        /* WOW TEXT */
        .pvi-page .wow-text .label{margin-bottom:8px;}
        .pvi-page .wow-text h2{margin-bottom:16px;}
        .pvi-page .wow-text .section-sub{margin-bottom:32px;}
        .pvi-page .wow-steps{display:flex;flex-direction:column;gap:14px;margin-bottom:32px;}
        .pvi-page .ws{display:flex;gap:14px;align-items:flex-start;}
        .pvi-page .ws-num{
          width:28px;height:28px;border-radius:7px;flex-shrink:0;
          background:var(--lime-bg);border:1px solid var(--lime-border);
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:700;color:var(--lime-dark);
        }
        .pvi-page .ws-text{font-size:14px;color:#555;line-height:1.6;padding-top:4px;}
        .pvi-page .ws-text strong{color:var(--black);font-weight:600;}

        /* ── PROCESS ── */
        .pvi-page .process{background:var(--sand);padding:96px 80px;}
        .pvi-page .process-inner{max-width:1200px;margin:0 auto;}
        .pvi-page .process-phases{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-top:56px;}
        .pvi-page .phase-card{border-radius:20px;overflow:hidden;}
        .pvi-page .ph-0{background:var(--white);border:1px solid var(--gray-light);padding:36px;}
        .pvi-page .ph-1{background:var(--black);padding:36px;}
        .pvi-page .ph-2{background:#111827;padding:36px;border:1px solid rgba(180,232,66,0.08);}
        .pvi-page .ph-badge{
          display:inline-flex;align-items:center;gap:6px;
          padding:4px 12px;border-radius:10px;font-size:10px;font-weight:700;
          letter-spacing:0.1em;text-transform:uppercase;margin-bottom:20px;
        }
        .pvi-page .pb-light{background:var(--sand);color:#888;}
        .pvi-page .pb-dark{background:var(--lime-bg);color:var(--lime);}
        .pvi-page .pb-violet{background:rgba(167,139,250,0.1);color:#a78bfa;}
        .pvi-page .ph-when{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;}
        .pvi-page .ph-0 .ph-when{color:#bbb;}
        .pvi-page .ph-1 .ph-when,.pvi-page .ph-2 .ph-when{color:rgba(255,255,255,0.25);}
        .pvi-page .ph-title{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;line-height:1.2;margin-bottom:6px;}
        .pvi-page .ph-0 .ph-title{color:var(--black);}
        .pvi-page .ph-1 .ph-title,.pvi-page .ph-2 .ph-title{color:#fff;}
        .pvi-page .ph-price{font-size:13px;font-weight:600;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid;}
        .pvi-page .ph-0 .ph-price{color:var(--black);border-color:var(--gray-light);}
        .pvi-page .ph-1 .ph-price{color:var(--lime);border-color:rgba(255,255,255,0.08);}
        .pvi-page .ph-2 .ph-price{color:#a78bfa;border-color:rgba(255,255,255,0.06);}
        .pvi-page .ph-items{list-style:none;display:flex;flex-direction:column;gap:10px;}
        .pvi-page .ph-items li{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.55;}
        .pvi-page .ph-0 .ph-items li{color:#555;}
        .pvi-page .ph-1 .ph-items li,.pvi-page .ph-2 .ph-items li{color:rgba(255,255,255,0.45);}
        .pvi-page .ph-0 .ph-items li::before{content:'·';color:var(--lime-dark);font-size:16px;line-height:1;flex-shrink:0;}
        .pvi-page .ph-1 .ph-items li::before,.pvi-page .ph-2 .ph-items li::before{content:'·';color:var(--lime);font-size:16px;line-height:1;flex-shrink:0;}
        .pvi-page .ph-items li strong{font-weight:600;}
        .pvi-page .ph-0 .ph-items li strong{color:var(--black);}
        .pvi-page .ph-1 .ph-items li strong,.pvi-page .ph-2 .ph-items li strong{color:#fff;}

        /* ── DELIVERABLES ── */
        .pvi-page .deliverables{padding:96px 80px;background:var(--cream);}
        .pvi-page .del-inner{max-width:1200px;margin:0 auto;}
        .pvi-page .del-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:48px;}
        .pvi-page .del-card{
          background:var(--white);border:1px solid var(--gray-light);
          border-radius:16px;padding:24px;
          transition:transform 0.25s,box-shadow 0.25s;
        }
        .pvi-page .del-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.08);}
        .pvi-page .del-icon{font-size:28px;margin-bottom:14px;}
        .pvi-page .del-num{font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:700;color:var(--lime-dark);line-height:1;margin-bottom:4px;}
        .pvi-page .del-unit{font-size:11px;color:var(--gray);margin-bottom:10px;}
        .pvi-page .del-title{font-size:14px;font-weight:600;margin-bottom:6px;}
        .pvi-page .del-desc{font-size:12px;color:var(--gray);line-height:1.6;}
        .pvi-page .extras{
          margin-top:32px;padding:24px;background:var(--sand);
          border-radius:14px;border:1px solid var(--gray-light);
        }
        .pvi-page .extras-label{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray);margin-bottom:12px;}
        .pvi-page .extras-row{display:flex;gap:10px;flex-wrap:wrap;}
        .pvi-page .extra-tag{
          padding:6px 14px;border-radius:20px;font-size:12px;font-weight:500;
          background:var(--white);color:#555;border:1px solid var(--gray-light);
        }
        .pvi-page .extra-tag span{color:var(--lime-dark);font-weight:600;}

        /* ── PRICING ── */
        .pvi-page .pricing{background:var(--black);padding:96px 80px;}
        .pvi-page .pricing-inner{max-width:900px;margin:0 auto;text-align:center;}
        .pvi-page .pricing-inner h2{color:#fff;}
        .pvi-page .pricing-inner h2 em{color:var(--lime);}
        .pvi-page .pricing-inner .section-sub{color:rgba(255,255,255,0.35);margin:0 auto 56px;}
        .pvi-page .price-cards{display:grid;grid-template-columns:1fr 1fr;gap:20px;text-align:left;margin-bottom:32px;}
        .pvi-page .price-card{border-radius:18px;padding:32px;}
        .pvi-page .pc-entry{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);}
        .pvi-page .pc-full{background:var(--lime-bg);border:1px solid var(--lime-border);}
        .pvi-page .pc-badge{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;}
        .pvi-page .pc-entry .pc-badge{color:rgba(255,255,255,0.3);}
        .pvi-page .pc-full .pc-badge{color:var(--lime);}
        .pvi-page .pc-price{font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:700;line-height:1;margin-bottom:6px;}
        .pvi-page .pc-entry .pc-price{color:#fff;}
        .pvi-page .pc-full .pc-price{color:var(--lime);}
        .pvi-page .pc-period{font-size:13px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid;}
        .pvi-page .pc-entry .pc-period{color:rgba(255,255,255,0.3);border-color:rgba(255,255,255,0.08);}
        .pvi-page .pc-full .pc-period{color:rgba(180,232,66,0.5);border-color:var(--lime-border);}
        .pvi-page .pc-items{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:24px;}
        .pvi-page .pc-items li{font-size:13px;display:flex;align-items:center;gap:8px;}
        .pvi-page .pc-entry .pc-items li{color:rgba(255,255,255,0.45);}
        .pvi-page .pc-full .pc-items li{color:rgba(255,255,255,0.7);}
        .pvi-page .pc-items li::before{content:'✓';font-size:11px;font-weight:700;flex-shrink:0;}
        .pvi-page .pc-entry .pc-items li::before{color:rgba(255,255,255,0.2);}
        .pvi-page .pc-full .pc-items li::before{color:var(--lime);}
        .pvi-page .pc-btn{
          width:100%;padding:13px;border-radius:10px;font-size:13px;font-weight:600;
          cursor:pointer;border:none;transition:all 0.2s;
        }
        .pvi-page .pc-entry .pc-btn{background:rgba(255,255,255,0.06);color:#fff;border:1px solid rgba(255,255,255,0.1);}
        .pvi-page .pc-entry .pc-btn:hover{background:rgba(255,255,255,0.1);}
        .pvi-page .pc-full .pc-btn{background:var(--lime);color:var(--black);}
        .pvi-page .pc-full .pc-btn:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(180,232,66,0.25);}
        .pvi-page .pricing-note{font-size:12px;color:rgba(255,255,255,0.2);text-align:center;}

        /* ── SCAN CTA ── */
        .pvi-page .scan-cta{background:var(--cream);padding:96px 80px;text-align:center;}
        .pvi-page .scan-inner{max-width:700px;margin:0 auto;}
        .pvi-page .scan-inner h2{margin-bottom:12px;}
        .pvi-page .scan-inner .section-sub{margin:0 auto 40px;}
        .pvi-page .scan-input-wrap{
          display:flex;gap:10px;background:var(--white);
          border:1px solid var(--gray-light);border-radius:14px;
          padding:8px 8px 8px 20px;
          box-shadow:0 4px 24px rgba(0,0,0,0.06);
          max-width:540px;margin:0 auto;
        }
        .pvi-page .scan-input{
          flex:1;border:none;background:none;font-size:14px;
          font-family:'DM Sans',sans-serif;outline:none;color:var(--black);
        }
        .pvi-page .scan-input::placeholder{color:#bbb;}
        .pvi-page .scan-btn{
          background:var(--black);color:#fff;padding:12px 24px;
          border-radius:9px;font-size:14px;font-weight:600;border:none;cursor:pointer;
          white-space:nowrap;transition:all 0.2s;
        }
        .pvi-page .scan-btn:hover{background:var(--dark);}
        .pvi-page .scan-note{font-size:12px;color:#bbb;margin-top:12px;}

        /* ── TEAM ── */
        .pvi-page .team{background:var(--black);padding:96px 80px;}
        .pvi-page .team-inner{max-width:1200px;margin:0 auto;}
        .pvi-page .team-inner h2{color:#fff;text-align:center;margin-bottom:8px;}
        .pvi-page .team-inner .section-sub{color:rgba(255,255,255,0.3);text-align:center;margin:0 auto 56px;}
        .pvi-page .team-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;}
        .pvi-page .team-card{
          background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);
          border-radius:18px;padding:32px;text-align:center;
        }
        .pvi-page .team-avatar{
          width:80px;height:80px;border-radius:50%;margin:0 auto 16px;
          display:flex;align-items:center;justify-content:center;font-size:32px;
          background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
        }
        .pvi-page .team-name{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;color:#fff;margin-bottom:4px;}
        .pvi-page .team-role{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--lime);margin-bottom:12px;}
        .pvi-page .team-desc{font-size:13px;color:rgba(255,255,255,0.35);line-height:1.65;}

        /* ── FOOTER CTA ── */
        .pvi-page .footer-cta{
          background:var(--cream);padding:120px 80px;text-align:center;
          position:relative;overflow:hidden;
        }
        .pvi-page .footer-cta::before{
          content:'';position:absolute;width:600px;height:600px;border-radius:50%;
          background:radial-gradient(circle,rgba(180,232,66,0.06),transparent 70%);
          top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;
        }
        .pvi-page .footer-cta h2{font-size:clamp(40px,5vw,72px);margin-bottom:16px;position:relative;}
        .pvi-page .footer-cta h2 em{color:var(--lime-dark);}
        .pvi-page .footer-cta .section-sub{margin:0 auto 48px;position:relative;}
        .pvi-page .footer-cta .btn-primary{margin:0 auto;font-size:16px;padding:18px 40px;}
        .pvi-page .footer-note{font-size:12px;color:#bbb;margin-top:16px;position:relative;}
        .pvi-page .footer-bottom{
          background:var(--black);padding:24px 80px;
          display:flex;align-items:center;justify-content:space-between;
        }
        .pvi-page .fb-logo{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:600;color:#fff;letter-spacing:0.06em;}
        .pvi-page .fb-logo span{color:var(--lime);}
        .pvi-page .fb-note{font-size:12px;color:rgba(255,255,255,0.2);}

        /* ── SCROLL REVEAL ── */
        .pvi-page .reveal{opacity:0;transform:translateY(28px);transition:opacity 0.7s ease,transform 0.7s ease;}
        .pvi-page .reveal.vis{opacity:1;transform:translateY(0);}
        .pvi-page .reveal-d1{transition-delay:0.1s;}
        .pvi-page .reveal-d2{transition-delay:0.2s;}
        .pvi-page .reveal-d3{transition-delay:0.3s;}
        .pvi-page .reveal-d4{transition-delay:0.4s;}
      `}</style>

      {/* HERO */}
      <section className="hero" style={{padding:0}}>
        <div className="hero-container">
          <div className="hero-left">
            <div className="hero-badge">Prémiová vizuální identita · Praha, Kampa</div>
            <h1>Jeden den.<br /><em>Obsah na měsíce dopředu.</em></h1>
            <p className="hero-sub">Přijdete do ateliéru. Odejdete s 500 fotografiemi, jasnou strategií a systémem který tvoří obsah každý týden za vás.</p>
            <div className="hero-actions">
              <button className="btn-primary">Spustit bezplatnou analýzu značky →</button>
              <button className="btn-secondary">nebo Rezervovat strategický hovor ↓</button>
              <div className="hero-note">Analýza webu · Zdarma · Výsledky za 2 minuty</div>
            </div>
          </div>
        </div>
        <div className="hero-right">
          {CAROUSEL_PHOTOS.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              className={`carousel-img${i === activeIdx ? " active" : ""}`}
            />
          ))}
          <div className="carousel-overlay" />
          <div className="float-card fc-1">
            <div><span className="fc-dot"></span><span className="fc-title">Systém aktivní</span></div>
            <div className="fc-sub">Právě připravuje obsah</div>
          </div>
          <div className="float-card fc-2" style={{textAlign:"center"}}>
            <div className="fc-num">500+</div>
            <div className="fc-sub">fotek z jednoho dne</div>
          </div>
          <div className="float-card fc-3">
            <div className="fc-title" style={{marginBottom:"4px"}}>Týdenní výstupy</div>
            <div className="fc-sub">Příspěvky · Vizuály · Reels</div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="problem">
        <div className="problem-grid">
          <div className="problem-left">
            <div className="label" style={{color:"rgba(180,232,66,0.6)"}}>Problém který znáte</div>
            <h2>Vaše práce je skvělá.<br /><em>Ale nikdo to nevidí.</em></h2>
            <div className="problem-quote">&ldquo;Tohle není problém tvorby. Je to problém obrazu.&rdquo;</div>
          </div>
          <div>
            <ul className="problem-list">
              <li><div className="pl-icon">📱</div>Web říká jedno, Instagram druhé, LinkedIn třetí. Zákazník neví jestli jste to vy — a odejde.</li>
              <li><div className="pl-icon">⏰</div>Tvoříte obsah místo toho abyste dělali svou práci. Každý týden znovu od nuly.</li>
              <li><div className="pl-icon">🤖</div>20 aplikací na generování, texty, plánování. Místo tvorby řešíte systémy.</li>
              <li><div className="pl-icon">📷</div>Fotky z loňska. Styl který vás nepředstavuje. Vizuál který neodpovídá vaší ceně.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* WOW — VIZUÁLNÍ BOARD */}
      <section className="wow">
        <div className="wow-inner">
          <div className="label reveal">Naše největší přednost</div>
          <h2 className="reveal">Víte jak budete vypadat<br /><em>ještě před focením.</em></h2>
          <div className="wow-grid">
            <div className="board-mockup reveal">
              <div className="bm-header">
                <div className="bm-dot" style={{background:"#ff5f57"}}></div>
                <div className="bm-dot" style={{background:"#ffbd2e"}}></div>
                <div className="bm-dot" style={{background:"#28c940"}}></div>
                <div className="bm-title">Vizuální board · Jana Procházková · Před focením</div>
              </div>
              <div className="bm-grid">
                <div className="bm-cell bm-cell-main bc-1">
                  <div className="bc-label">Tmavé sako · Ateliér Kampa · Záběr č. 1</div>
                  <div className="bm-outfit-tag">Outfit A · Tmavě zelená</div>
                  <div className="bm-score">
                    <div className="bm-score-num">87</div>
                    <div className="bm-score-label">Brand skóre</div>
                  </div>
                </div>
                <div className="bm-cell bm-cell-sub bc-2">
                  <div className="bm-outfit-tag" style={{color:"rgba(0,0,0,0.5)"}}>Detail · ruce + notes</div>
                </div>
                <div className="bm-cell bm-cell-sub bc-3">
                  <div style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"16px",color:"rgba(255,255,255,0.5)",fontStyle:"italic"}}>&ldquo;Vaše vize.&rdquo;</div>
                    <div style={{fontSize:"10px",color:"rgba(255,255,255,0.2)",marginTop:"4px"}}>Faceless záběr</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="wow-text reveal reveal-d2">
              <div className="label">Vizuální board s vaší podobou</div>
              <h2>AI náhledovky.<br /><em>Váš obličej. Váš styl.</em></h2>
              <p className="section-sub" style={{marginBottom:"28px"}}>Ještě před tím než vstoupíte do ateliéru víte přesně jak výsledek bude vypadat. Modré sako nebo hnědé? Kampa nebo interiér? Vše vidíte dopředu — na sobě.</p>
              <div className="wow-steps">
                <div className="ws"><div className="ws-num">1</div><div className="ws-text"><strong>Pošlete fotografie.</strong> Stačí několik běžných fotek.</div></div>
                <div className="ws"><div className="ws-num">2</div><div className="ws-text"><strong>AI vás zasadí do scén.</strong> Různé outfity, prostory, rekvizity — přesně podle strategie vaší značky.</div></div>
                <div className="ws"><div className="ws-num">3</div><div className="ws-text"><strong>Vyberete co se vám líbí.</strong> A přesně tak pak focení proběhne.</div></div>
                <div className="ws"><div className="ws-num">4</div><div className="ws-text"><strong>Výsledek je garantovaný.</strong> Žádné překvapení. Žádné fotky které pak nechcete použít.</div></div>
              </div>
              <button className="btn-primary">Chci vidět ukázku →</button>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="process">
        <div className="process-inner">
          <div className="reveal">
            <div className="label">Jak to funguje</div>
            <h2>Tři kroky.<br /><em>Jeden výsledek.</em></h2>
          </div>
          <div className="process-phases">
            <div className="phase-card ph-0 reveal reveal-d1">
              <div className="ph-badge pb-light">Před focením</div>
              <div className="ph-when">Krok 1 · Strategický hovor</div>
              <div className="ph-title">Pochopíme vaši značku.</div>
              <div className="ph-price">9 900 Kč · Bez závazku focení</div>
              <ul className="ph-items">
                <li><strong>Analýza vaší online přítomnosti</strong> — web, Instagram, LinkedIn</li>
                <li><strong>Strategický hovor 90 minut</strong> — co chcete říkat a komu</li>
                <li><strong>20stránková prezentace</strong> rozvoje značky a kampaní</li>
                <li><strong>Vizuální board s vaší podobou</strong> — náhledovky jak budete vypadat</li>
                <li><strong>3 Canva šablony na míru</strong> s ukázkou v reálných příspěvcích</li>
              </ul>
            </div>
            <div className="phase-card ph-1 reveal reveal-d2">
              <div className="ph-badge pb-dark">Den focení · Praha Kampa</div>
              <div className="ph-when">Krok 2 · Reálný obsah</div>
              <div className="ph-title" style={{color:"#fff"}}>Přijdete jednou.<br />Obsah na měsíce.</div>
              <div className="ph-price">Cena dle rozsahu</div>
              <ul className="ph-items">
                <li><strong>5 stylů focení</strong> — každý 15 fotografií</li>
                <li><strong>10 faceless fotek</strong> pro grafiku a kampaně</li>
                <li><strong>1 minuta b-rollu</strong> pro Reels a LinkedIn video</li>
                <li>Focení přesně dle vizuálního boardu</li>
                <li>Prostor pro improvizaci a nápady</li>
                <li>Za příplatek: promo video, Reels, grafika</li>
              </ul>
            </div>
            <div className="phase-card ph-2 reveal reveal-d3">
              <div className="ph-badge pb-violet">Po focení · Autopilot</div>
              <div className="ph-when">Krok 3 · Systém za vás</div>
              <div className="ph-title" style={{color:"#fff"}}>Značka pracuje.<br />Vy žijete.</div>
              <div className="ph-price">Měsíční spolupráce</div>
              <ul className="ph-items">
                <li>Aplikace která <strong>zná vaši značku</strong></li>
                <li>Hotové příspěvky, vizuály, Reels — každý týden</li>
                <li>Vy schválíte. Systém publikuje.</li>
                <li>Kurátor hlídá strategii a náladu</li>
                <li>Obsah který vypadá jako vy — protože je to vy</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section className="deliverables">
        <div className="del-inner">
          <div className="reveal">
            <div className="label">Co konkrétně dostanete</div>
            <h2>Čísla. Ne přísliby.</h2>
          </div>
          <div className="del-grid">
            <div className="del-card reveal reveal-d1">
              <div className="del-icon">📷</div>
              <div className="del-num">500+</div>
              <div className="del-unit">fotografií z jednoho dne</div>
              <div className="del-title">5 stylů · 15 fotek každý</div>
              <div className="del-desc">Portréty, pracovní momenty, detail záběry, faceless — vše dle vizuálního boardu.</div>
            </div>
            <div className="del-card reveal reveal-d2">
              <div className="del-icon">🎬</div>
              <div className="del-num">1 min</div>
              <div className="del-unit">b-roll video záběrů</div>
              <div className="del-title">Reels, LinkedIn, stories</div>
              <div className="del-desc">Autentické klipy pro Reels a video obsah. Teplý grading dle vaší palety.</div>
            </div>
            <div className="del-card reveal reveal-d3">
              <div className="del-icon">🎨</div>
              <div className="del-num">3</div>
              <div className="del-unit">Canva šablony na míru</div>
              <div className="del-title">Grafika připravená k použití</div>
              <div className="del-desc">Ukázka jak fotky žijí v reálných příspěvcích — fonty, barvy, styl.</div>
            </div>
            <div className="del-card reveal reveal-d4">
              <div className="del-icon">📋</div>
              <div className="del-num">20</div>
              <div className="del-unit">stran strategické prezentace</div>
              <div className="del-title">Rozvoj značky + kampaně</div>
              <div className="del-desc">Positioning, cílová skupina, obsahový plán, todolist — vše konkrétní.</div>
            </div>
          </div>
          <div className="extras reveal" style={{marginTop:"20px"}}>
            <div className="extras-label">Za příplatek</div>
            <div className="extras-row">
              <div className="extra-tag">Promo video <span>+</span></div>
              <div className="extra-tag">Reels produkce <span>+</span></div>
              <div className="extra-tag">Grafika kampaní <span>+</span></div>
              <div className="extra-tag">Měsíční autopilot <span>+</span></div>
              <div className="extra-tag">AI avatar <span>+</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing">
        <div className="pricing-inner">
          <div className="label" style={{color:"var(--lime)",textAlign:"center"}}>Investice</div>
          <h2>Jasná cena.<br /><em>Bez překvapení.</em></h2>
          <p className="section-sub">Začněte strategickým hovorem. Focení a autopilot jsou váš další krok — pokud budete chtít.</p>
          <div className="price-cards">
            <div className="price-card pc-entry">
              <div className="pc-badge">Krok 1 · Vstup</div>
              <div className="pc-price">9 900</div>
              <div className="pc-period">Kč · Strategický hovor + Vizuální board</div>
              <ul className="pc-items">
                <li>Analýza vaší online přítomnosti</li>
                <li>Strategický hovor 90 minut</li>
                <li>20stránková prezentace značky</li>
                <li>Vizuální board s vaší podobou</li>
                <li>3 Canva šablony</li>
              </ul>
              <button className="pc-btn">Rezervovat hovor →</button>
            </div>
            <div className="price-card pc-full">
              <div className="pc-badge">Krok 1 + 2 · Komplet</div>
              <div className="pc-price">49 900</div>
              <div className="pc-period">Kč · Hovor + Focení + Výstupy</div>
              <ul className="pc-items">
                <li>Vše ze Kroku 1</li>
                <li>Den focení v ateliéru Praha Kampa</li>
                <li>500+ fotografií · 5 stylů</li>
                <li>B-roll video záběry</li>
                <li>Měsíc autopilotu zdarma</li>
              </ul>
              <button className="pc-btn">Chci kompletní spolupráci →</button>
            </div>
          </div>
          <div className="pricing-note">Autopilot — měsíční spolupráce — domlouváme individuálně. Žádné dlouhodobé závazky.</div>
        </div>
      </section>

      {/* BRAND SCAN CTA */}
      <section className="scan-cta">
        <div className="scan-inner">
          <div className="label reveal">Začněte zdarma</div>
          <h2 className="reveal">Zjistěte kde vaše značka<br /><em>ztrácí zákazníky.</em></h2>
          <p className="section-sub reveal">Zadejte adresu webu. Za dvě minuty víte přesně na čem pracovat — a zda má smysl se potkat.</p>
          <div className="scan-input-wrap reveal">
            <input className="scan-input" type="url" placeholder="vasweb.cz" />
            <button className="scan-btn">Spustit analýzu →</button>
          </div>
          <div className="scan-note reveal">Zdarma · Bez registrace · Výsledky okamžitě</div>
        </div>
      </section>

      {/* TEAM */}
      <section className="team">
        <div className="team-inner">
          <div className="label" style={{color:"var(--lime)",textAlign:"center"}}>Za Luciferous stojí</div>
          <h2>52 let zkušeností.<br /><em>Nejsme agentura. Jsme studio.</em></h2>
          <p className="section-sub">Fyzický svět fotoateliéru na Kampě. Digitální ekosystém AI. Jedno místo kde se to celé skládá dohromady.</p>
          <div className="team-grid">
            <div className="team-card reveal reveal-d1">
              <div className="team-avatar">📷</div>
              <div className="team-name">Katarína</div>
              <div className="team-role">Obraz &amp; Strategie</div>
              <div className="team-desc">26 let fotografie, videa a vizuální identity. Stovky značek. Komerční banka, Vodafone, Oriflame. Ateliér na Praze Kampě.</div>
            </div>
            <div className="team-card reveal reveal-d2">
              <div className="team-avatar">⚡</div>
              <div className="team-name">Luboš</div>
              <div className="team-role">Systémy &amp; AI</div>
              <div className="team-desc">26 let v technologiích. Skládá desítky AI nástrojů do jednoho funkčního celku. Systém který pracuje místo vás.</div>
            </div>
            <div className="team-card reveal reveal-d3">
              <div className="team-avatar">✨</div>
              <div className="team-name">Eska</div>
              <div className="team-role">Duše &amp; Kresba</div>
              <div className="team-desc">Kousek skutečného života který dává obsahu duši. Ilustrace, kresby, vizuální svět který AI sama nevymyslí.</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="footer-cta">
        <div className="label reveal">Jeden krok</div>
        <h2 className="reveal">Váš obsah nemůže čekat,<br /><em>až ho zákazník pochopí.</em></h2>
        <p className="section-sub reveal">Strategický hovor trvá 90 minut. Výsledek pracuje za vás měsíce dopředu.</p>
        <button className="btn-primary reveal">Rezervovat hovor · 9 900 Kč →</button>
        <div className="footer-note reveal">nebo začněte bezplatnou analýzou značky — žádný závazek</div>
      </section>

      <div className="footer-bottom">
        <div className="fb-logo">△ <span>LUCIFERA</span> · Studio</div>
        <div className="fb-note">Praha, Kampa · studio@lucifera.cz · Prémiová vizuální identita pro osobní značky</div>
      </div>
    </div>
    </>
  );
}
