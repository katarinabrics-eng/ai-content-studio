"use client";

import { useEffect, useRef, useState } from "react";

const LIME_VIBE = "#b4e842";

export function VibeSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="vibe"
      className="w-full bg-[#111111] py-[140px] md:py-[160px]"
      style={{
        transition: "opacity 0.9s ease-out, transform 0.9s ease-out",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
      }}
    >
      <div className="mx-auto max-w-[900px] px-6 text-center xl:px-10">
        <p
          className="text-[#f2f2f2] md:text-base"
          style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
            fontWeight: 400,
            letterSpacing: "0.06em",
            opacity: 0.6,
          }}
        >
          To funguje, dokud vás znají osobně.
        </p>
        <h2
          className="mt-8 leading-[1.05] tracking-tight text-[#fff] md:mt-12"
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontWeight: 700,
            fontSize: "clamp(2.5rem, 6vw, 4.25rem)",
          }}
        >
          Jakmile vás neznají,
          <br />
          rozhoduje obraz.
        </h2>
        <div className="mt-16 space-y-6 md:mt-20 md:space-y-8">
          <p
            className="text-[#fff] md:text-[22px]"
            style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 20, fontWeight: 400, lineHeight: 1.6 }}
          >
            Vaše podnikání roste.
          </p>
          <p
            className="text-[#fff] md:text-[22px]"
            style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 20, fontWeight: 400, lineHeight: 1.6 }}
          >
            Vaše cena roste.
          </p>
          <p
            className="md:text-[20px]"
            style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 18, fontWeight: 400, lineHeight: 1.6, color: LIME_VIBE, fontStyle: "italic" }}
          >
            Jen váš obraz ne.
          </p>
        </div>
        <p
          className="mt-14 leading-[1.1] tracking-tight text-[#fff] md:mt-16"
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontWeight: 700,
            fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
          }}
        >
          Obraz musí unést vaši úroveň.
        </p>
        <a
          href="/diagnostika"
          className="mt-12 inline-block rounded px-6 py-3 text-[15px] font-medium transition-colors hover:opacity-90 md:mt-14"
          style={{
            background: LIME_VIBE,
            color: "#111",
          }}
        >
          Zjistit co dostanete →
        </a>
      </div>
    </section>
  );
}
