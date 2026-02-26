"use client";

import { useEffect, useRef, useState } from "react";

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
        <p className="text-[15px] font-normal tracking-wide text-[#a0a0a0] md:text-base">
          To funguje, dokud vás znají osobně.
        </p>
        <h2
          className="mt-8 font-bold leading-[1.05] tracking-tight text-[#f2f2f2] md:mt-12"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4.25rem)" }}
        >
          Jakmile vás neznají,
          <br />
          rozhoduje obraz.
        </h2>
        <div className="mt-16 space-y-6 md:mt-20 md:space-y-8">
          <p className="text-[20px] font-medium leading-[1.6] text-[#f2f2f2] md:text-[22px]">
            Vaše podnikání roste.
          </p>
          <p className="text-[20px] font-medium leading-[1.6] text-[#f2f2f2] md:text-[22px]">
            Vaše cena roste.
          </p>
          <p className="text-[18px] font-normal leading-[1.6] text-[#777777] md:text-[20px]">
            Jen váš obraz ne.
          </p>
        </div>
        <p
          className="mt-14 font-bold leading-[1.1] tracking-tight text-[#f2f2f2] md:mt-16"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)" }}
        >
          Obraz musí unést vaši úroveň.
        </p>
        <a
          href="/start"
          className="mt-12 inline-block rounded border-2 border-white px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-white/10 md:mt-14"
        >
          Spustit projekt
        </a>
      </div>
    </section>
  );
}
