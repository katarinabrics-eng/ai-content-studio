"use client";

import { useState, useEffect } from "react";

const SLIDES = [
  { src: "/placeholders/PORTFOLIO PORTRET/vyber/7.JPG", alt: "Portrét – ateliérový standard" },
  { src: "/placeholders/PORTFOLIO PORTRET/vyber/8.JPG", alt: "Portrét – ateliérový standard" },
  { src: "/placeholders/PORTFOLIO PORTRET/vyber/10.JPG", alt: "Portrét – ateliérový standard" },
  { src: "/placeholders/PORTFOLIO PORTRET/vyber/11.JPG", alt: "Portrét – ateliérový standard" },
  { src: "/placeholders/PORTFOLIO PORTRET/vyber/18.JPG", alt: "Portrét – ateliérový standard" },
  { src: "/placeholders/PORTFOLIO PORTRET/vyber/20.JPG", alt: "Portrét – ateliérový standard" },
];

const FRAME_BASE = "overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] transition-all duration-500 ease-out";
const FRAME_CENTER = "overflow-hidden rounded-2xl shadow-[0_28px_60px_-12px_rgba(0,0,0,0.28)] transition-all duration-500 ease-out scale-[1.06] z-10";

export function StandardCarousel() {
  const [index, setIndex] = useState(0);
  const n = SLIDES.length;

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, 4500);
    return () => clearInterval(t);
  }, [n]);

  const visible = [index, (index + 1) % n, (index + 2) % n, (index + 3) % n].map((i) => SLIDES[i]);
  const centerIndex = 2;

  return (
    <div className="relative w-full">
      <div className="grid grid-cols-4 gap-4 md:gap-6">
        {visible.map((slide, pos) => (
          <div
            key={`${pos}-${slide.src}`}
            className={pos === centerIndex ? FRAME_CENTER : FRAME_BASE}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="aspect-[3/4] w-full object-cover object-center"
            />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-start gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-8 bg-[#A8EB12]" : "w-2 bg-stone-300 hover:bg-stone-400"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
