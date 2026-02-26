"use client";

import { useState, useEffect } from "react";

const SLIDES = [
  { src: "/placeholders/PORTFOLIO PORTRET/2.JPG", alt: "Portrét – ateliérový standard" },
  { src: "/placeholders/PORTFOLIO PORTRET/11.JPG", alt: "Portrét – ateliérový standard" },
  { src: "/placeholders/PORTFOLIO PORTRET/22.JPG", alt: "Portrét – ateliérový standard" },
  { src: "/placeholders/PORTFOLIO PORTRET/33.JPG", alt: "Portrét – ateliérový standard" },
  { src: "/placeholders/PORTFOLIO PORTRET/1.JPG", alt: "Portrét – ateliérový standard" },
  { src: "/placeholders/PORTFOLIO PORTRET/13.JPG", alt: "Portrét – ateliérový standard" },
];

const FRAME_CLASS = "overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)]";

export function StandardCarousel() {
  const [index, setIndex] = useState(0);
  const n = SLIDES.length;

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, 4000);
    return () => clearInterval(t);
  }, [n]);

  const visible = [index, (index + 1) % n, (index + 2) % n].map((i) => SLIDES[i]);

  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-4 md:gap-6">
        {visible.map((slide) => (
          <div key={slide.src} className={FRAME_CLASS}>
            <img
              src={slide.src}
              alt={slide.alt}
              className="aspect-[3/4] w-full object-cover object-center"
            />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-8 bg-[#A8EB12]" : "w-2 bg-stone-300 hover:bg-stone-400"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
