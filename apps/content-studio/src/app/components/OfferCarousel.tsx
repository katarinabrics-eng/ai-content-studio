"use client";

import { useState, useEffect } from "react";

const SLIDES = [
  { src: "/placeholders/PORTFOLIO PORTRET/vyber/16.JPG", alt: "Autorský portrét" },
  { src: "/placeholders/PORTFOLIO PORTRET/vyber/19.JPG", alt: "Autorský portrét" },
  { src: "/placeholders/PORTFOLIO PORTRET/vyber/23.JPG", alt: "Autorský portrét" },
  { src: "/placeholders/PORTFOLIO PORTRET/vyber/33.JPG", alt: "Autorský portrét" },
  { src: "/placeholders/PORTFOLIO PORTRET/vyber/35.JPG", alt: "Autorský portrét" },
  { src: "/placeholders/PORTFOLIO PORTRET/vyber/38.JPG", alt: "Autorský portrét" },
];

export function OfferCarousel() {
  const [index, setIndex] = useState(0);
  const n = SLIDES.length;

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, 4000);
    return () => clearInterval(t);
  }, [n]);

  return (
    <div className="relative max-w-[560px] w-full">
      <div className="overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)]">
        {SLIDES.map((s, i) => (
          <div
            key={s.src}
            className="transition-opacity duration-500 ease-out"
            style={{ display: i === index ? "block" : "none" }}
          >
            <img
              src={s.src}
              alt={s.alt}
              className="aspect-[3/4] w-full object-cover object-center"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2">
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
