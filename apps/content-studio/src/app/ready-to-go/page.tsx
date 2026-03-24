"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

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
    const cleanup = init() as (() => void) | undefined;
    return () => { cleanup?.(); };
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
      <style>{`
        /* ── RESET ── */
        #rtg-root *, #rtg-root *::before, #rtg-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        #rtg-root { font-family: 'DM Sans', sans-serif; overflow-x: hidden; background: #0a0a0a; }
        html { scroll-behavior: smooth; }

        /* ── ANIMATIONS ── */
        .rtg-fade { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .rtg-fade.rtg-visible { opacity: 1; transform: translateY(0); }
        .rtg-step { opacity: 0; transform: translateX(-20px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .rtg-step.rtg-visible { opacity: 1; transform: translateX(0); }
        @keyframes rtg-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.6)} }

        /* ── NAV ── */
        #rtg-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          height: 60px; display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; background: rgba(10,10,10,0.7); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .rtg-nav-logo { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-weight: 700; color: #fff; }
        .rtg-nav-logo em { font-style: italic; color: #d0ec78; }
        .rtg-nav-links { display: flex; align-items: center; gap: 32px; }
        .rtg-nav-links a { font-size: 13px; color: rgba(255,255,255,0.5); text-decoration: none; transition: color 0.2s; }
        .rtg-nav-links a:hover { color: #fff; }
        .rtg-nav-cta {
          background: #d0ec78 !important; color: #000 !important;
          padding: 9px 22px; border-radius: 6px; font-size: 13px; font-weight: 700;
          text-decoration: none; transition: all 0.2s; letter-spacing: 0.01em;
          box-shadow: 0 0 0 2px rgba(208,236,120,0.4), 0 4px 16px rgba(208,236,120,0.25);
        }
        .rtg-nav-cta:hover { background: #e8ff8a !important; transform: translateY(-1px); }

        /* ── HERO ── */
        #rtg-hero {
          min-height: 100vh; position: relative; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center;
          padding: 100px 40px 80px; background: #0a0a0a; overflow: hidden;
        }
        #rtg-canvas {
          position: absolute; inset: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: 0; opacity: 0.7;
        }
        .rtg-hero-glow {
          position: absolute; width: 600px; height: 600px;
          background: radial-gradient(ellipse, rgba(208,236,120,0.12) 0%, transparent 70%);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          pointer-events: none; z-index: 0;
        }
        .rtg-hero-inner { position: relative; z-index: 1; max-width: 860px; }
        .rtg-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(208,236,120,0.1); border: 1px solid rgba(208,236,120,0.2);
          padding: 6px 16px; border-radius: 100px; font-size: 12px;
          color: #d0ec78; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 36px;
        }
        .rtg-badge::before {
          content: ''; width: 6px; height: 6px; background: #d0ec78;
          border-radius: 50%; animation: rtg-pulse 2s infinite;
        }
        #rtg-hero h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(48px, 7vw, 92px); font-weight: 800;
          line-height: 1.02; letter-spacing: -0.025em; color: #fff; margin-bottom: 28px;
        }
        #rtg-hero h1 em { font-style: italic; color: #d0ec78; }
        .rtg-hero-sub {
          font-size: clamp(16px, 2vw, 19px); color: rgba(255,255,255,0.5);
          max-width: 540px; margin: 0 auto 44px; line-height: 1.7; font-weight: 300;
        }
        .rtg-hero-actions { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; margin-bottom: 72px; }
        .rtg-btn-lime {
          display: inline-block; background: #d0ec78; color: #0a0a0a;
          padding: 15px 36px; border-radius: 8px; font-size: 15px;
          font-weight: 500; text-decoration: none; transition: all 0.2s;
        }
        .rtg-btn-lime:hover { background: #b5d45c; transform: translateY(-1px); }
        .rtg-btn-ghost {
          display: inline-block; color: rgba(255,255,255,0.5); font-size: 14px;
          text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.15);
          padding-bottom: 1px; transition: all 0.2s;
        }
        .rtg-btn-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.4); }
        .rtg-hero-stats { display: flex; align-items: center; justify-content: center; gap: 48px; flex-wrap: wrap; }
        .rtg-stat { text-align: center; }
        .rtg-stat-num { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 800; color: #fff; line-height: 1; }
        .rtg-stat-num span { color: #d0ec78; }
        .rtg-stat-label { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 4px; letter-spacing: 0.05em; }
        .rtg-stat-div { width: 1px; height: 40px; background: rgba(255,255,255,0.08); }

        /* ── TRANSITION ── */
        .rtg-transition { height: 120px; background: linear-gradient(to bottom, #0a0a0a, #fafaf7); }

        /* ── LIGHT SECTIONS ── */
        .rtg-section { background: #fafaf7; padding: 100px 40px; }
        .rtg-section.rtg-alt { background: #fff; }
        .rtg-container { max-width: 1000px; margin: 0 auto; }
        .rtg-eyebrow {
          font-size: 11px; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: #6b6b6b;
          display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
        }
        .rtg-eyebrow::before { content: ''; width: 24px; height: 2px; background: #b5d45c; border-radius: 2px; }
        .rtg-section h2, .rtg-section.rtg-alt h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(30px, 4.5vw, 50px); font-weight: 800; line-height: 1.1;
          letter-spacing: -0.02em; color: #111; margin-bottom: 52px;
        }
        .rtg-section h2 em { font-style: italic; }

        /* ── PAIN ── */
        .rtg-pain-list { max-width: 680px; }
        .rtg-pain-item {
          display: flex; align-items: flex-start; gap: 20px;
          padding: 22px 0; border-bottom: 1px solid #e8e8e4;
        }
        .rtg-pain-item:first-child { border-top: 1px solid #e8e8e4; }
        .rtg-pain-icon {
          width: 40px; height: 40px; background: #f3fbdc; border: 1px solid #dff09a;
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          font-size: 17px; flex-shrink: 0;
        }
        .rtg-pain-text { font-size: 17px; color: #111; line-height: 1.5; padding-top: 8px; }
        .rtg-pain-closer { margin-top: 36px; font-family: 'Playfair Display', serif; font-size: 20px; font-style: italic; color: #6b6b6b; }

        /* ── PIPELINE ── */
        .rtg-pipeline { display: flex; flex-direction: column; gap: 0; max-width: 720px; position: relative; }
        .rtg-pipeline::before {
          content: ''; position: absolute; left: 28px; top: 56px; bottom: 56px; width: 2px;
          background: linear-gradient(to bottom, #b5d45c, rgba(181,212,92,0.2));
        }
        .rtg-step { display: flex; align-items: flex-start; gap: 28px; padding: 32px 0; position: relative; }
        .rtg-step-num {
          width: 56px; height: 56px; background: #111; color: #d0ec78;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 800;
          flex-shrink: 0; position: relative; z-index: 1; box-shadow: 0 0 0 6px #fff;
        }
        .rtg-step-content h3 { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.01em; color: #111; }
        .rtg-step-content p { font-size: 15px; color: #6b6b6b; line-height: 1.6; }
        .rtg-step-tag {
          display: inline-block; background: #f3fbdc; border: 1px solid #dff09a;
          padding: 3px 12px; border-radius: 100px; font-size: 12px; color: #3a6b0e;
          font-weight: 500; margin-top: 10px;
        }

        /* ── DASHBOARD PREVIEW ── */
        .rtg-dp-wrap {
          background: #1a1a1a; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.4);
          transform: perspective(1200px) rotateX(3deg); transition: transform 0.5s ease;
        }
        .rtg-dp-wrap:hover { transform: perspective(1200px) rotateX(0deg); }
        .rtg-dp-topbar {
          background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 12px 20px; display: flex; align-items: center; gap: 16px;
        }
        .rtg-dp-dots { display: flex; gap: 6px; }
        .rtg-dp-dot { width: 10px; height: 10px; border-radius: 50%; }
        .rtg-dp-dot:nth-child(1) { background: #ff5f57; }
        .rtg-dp-dot:nth-child(2) { background: #ffbd2e; }
        .rtg-dp-dot:nth-child(3) { background: #28c840; }
        .rtg-dp-title { font-size: 12px; color: rgba(255,255,255,0.3); letter-spacing: 0.05em; }
        .rtg-dp-body { padding: 24px; }
        .rtg-dp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .rtg-dp-week { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #fff; }
        .rtg-dp-prog { font-size: 12px; color: rgba(255,255,255,0.4); }
        .rtg-dp-bar { height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; margin-bottom: 24px; }
        .rtg-dp-bar-fill { height: 3px; background: #d0ec78; border-radius: 2px; width: 50%; }
        .rtg-dp-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .rtg-dp-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 14px; cursor: pointer; transition: border-color 0.2s;
        }
        .rtg-dp-card.rtg-selected { border-color: #d0ec78; background: rgba(208,236,120,0.06); }
        .rtg-dp-type {
          display: inline-block; font-size: 9px; font-weight: 600;
          padding: 2px 8px; border-radius: 100px; letter-spacing: 0.06em; margin-bottom: 10px;
        }
        .rtg-dp-type.video { background: rgba(59,130,246,0.15); color: #93c5fd; }
        .rtg-dp-type.graphic { background: rgba(34,197,94,0.15); color: #86efac; }
        .rtg-dp-thumb {
          width: 100%; aspect-ratio: 16/9; border-radius: 6px;
          background: rgba(255,255,255,0.05); margin-bottom: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: rgba(255,255,255,0.2);
        }
        .rtg-dp-hook { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.85); line-height: 1.4; margin-bottom: 4px; }
        .rtg-dp-sub { font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.4; }
        .rtg-dp-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; }
        .rtg-dp-btn {
          padding: 8px 20px; border-radius: 6px; font-size: 12px;
          font-weight: 500; cursor: pointer; border: none;
        }
        .rtg-dp-btn.approve { background: #d0ec78; color: #111; }
        .rtg-dp-btn.edit { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); }

        /* ── DELIVERABLES ── */
        .rtg-deliver-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .rtg-deliver-item {
          background: #fff; border: 1px solid #e8e8e4;
          border-radius: 12px; padding: 28px 24px; transition: border-color 0.2s, background 0.2s;
        }
        .rtg-deliver-item:hover { border-color: #b5d45c; background: #f3fbdc; }
        .rtg-d-check {
          width: 28px; height: 28px; background: #d0ec78;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 12px; margin-bottom: 14px; font-weight: 700;
        }
        .rtg-deliver-item h3 { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700; margin-bottom: 6px; color: #111; }
        .rtg-deliver-item p { font-size: 14px; color: #6b6b6b; line-height: 1.6; }

        /* ── PRICING ── */
        .rtg-pricing-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .rtg-plan { background: #fff; border: 1px solid #e8e8e4; border-radius: 14px; overflow: hidden; transition: border-color 0.2s; }
        .rtg-plan.rtg-featured { border-color: #111; }
        .rtg-plan-head { padding: 28px 24px 20px; border-bottom: 1px solid #e8e8e4; }
        .rtg-plan-badge { display: inline-block; background: #d0ec78; color: #111; font-size: 10px; font-weight: 600; padding: 3px 12px; border-radius: 100px; letter-spacing: 0.06em; margin-bottom: 14px; }
        .rtg-plan-name { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 800; margin-bottom: 6px; color: #111; }
        .rtg-plan-tag { font-size: 14px; color: #6b6b6b; font-style: italic; }
        .rtg-plan-counts { display: flex; gap: 8px; flex-wrap: wrap; padding: 16px 24px; border-bottom: 1px solid #e8e8e4; }
        .rtg-count-pill { font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 100px; }
        .rtg-count-pill.v { background: #dbeafe; color: #1d4ed8; }
        .rtg-count-pill.g { background: #dcfce7; color: #15803d; }
        .rtg-plan-features { padding: 20px 24px; list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .rtg-plan-features li { font-size: 13px; color: #111; display: flex; gap: 10px; line-height: 1.5; }
        .rtg-ck { color: #b5d45c; flex-shrink: 0; font-weight: 600; }
        .rtg-pl { color: #6b6b6b; flex-shrink: 0; }

        /* ── CTA DARK ── */
        #rtg-cta {
          background: #111; padding: 120px 40px; text-align: center;
          position: relative; overflow: hidden;
        }
        #rtg-cta::before {
          content: ''; position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
          width: 700px; height: 500px;
          background: radial-gradient(ellipse, rgba(208,236,120,0.12), transparent 70%);
          pointer-events: none;
        }
        #rtg-cta h2 { color: #fff !important; margin-bottom: 16px !important; }
        #rtg-cta h2 em { color: #d0ec78; }
        #rtg-cta p { color: rgba(255,255,255,0.5); font-size: 18px; font-weight: 300; max-width: 440px; margin: 0 auto 44px; }
        .rtg-cta-actions { display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap; }

        /* ── FOOTER ── */
        #rtg-footer {
          background: #0a0a0a; border-top: 1px solid rgba(255,255,255,0.05);
          padding: 36px 40px; display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .rtg-f-logo { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #fff; }
        .rtg-f-logo em { font-style: italic; color: #d0ec78; }
        #rtg-footer p { font-size: 13px; color: rgba(255,255,255,0.25); }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          #rtg-nav { padding: 0 20px; }
          .rtg-nav-links { display: none; }
          #rtg-hero { padding: 80px 20px 60px; }
          .rtg-section { padding: 64px 20px; }
          .rtg-pipeline::before { display: none; }
          .rtg-deliver-grid, .rtg-pricing-grid { grid-template-columns: 1fr; }
          .rtg-dp-pair { grid-template-columns: 1fr; }
          .rtg-stat-div { display: none; }
          #rtg-footer { padding: 28px 20px; }
        }
      `}</style>

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
