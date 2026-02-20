"use client";

import Image from "next/image";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholders";

const HERO_SRC = "/placeholders/hlavnycover_02.png";
const SECTION_SRCS = PLACEHOLDER_IMAGES.slice(1, 4);

/** Hero obrázek – contained proporce, bez přetažení. */
export function HeroImageFull() {
  return (
    <div className="relative aspect-[4/5] w-full min-h-[360px] xl:aspect-[3/4] xl:min-h-[480px]">
      <Image
        src={HERO_SRC}
        alt=""
        fill
        className="object-contain object-center"
        sizes="(max-width: 1280px) 100vw, 760px"
        priority
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
