"use client";

import Image from "next/image";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholders";

const HERO_SRC = "/placeholders/hlavnycover_02.png";
const SECTION_SRCS = PLACEHOLDER_IMAGES.slice(1, 4);

/** Hero obrázek na pozadí – pokrývá celou sekci, kontrastní (SCREEN 1 reference). */
export function HeroImageFull() {
  return (
    <div className="absolute inset-0">
      <Image
        src={HERO_SRC}
        alt="Prémiová vizuální identita pro osobní značky – hero vizuál"
        fill
        className="object-cover object-center"
        sizes="100vw"
        priority
        style={{ filter: "contrast(1.12) brightness(1.02)" }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

export function HeroImage() {
  if (!HERO_SRC) return null;
  return (
    <div className="relative aspect-[21/10] w-full overflow-hidden rounded-2xl bg-stone-200 shadow-md animate-fade-in">
      <Image
        src={HERO_SRC}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 1024px"
        priority
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

export function SectionImages({ count = 3 }: { count?: number }) {
  const paths = SECTION_SRCS.slice(0, count);
  if (paths.length === 0) return null;
  return (
    <>
      {paths.map((p, i) => (
        <div
          key={p + i}
          className="relative aspect-video overflow-hidden rounded-xl bg-stone-200 shadow-sm animate-fade-in"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <Image
            src={p}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ))}
    </>
  );
}
