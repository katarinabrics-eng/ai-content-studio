"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { PLACEHOLDER_POOL, getSessionPlaceholderPaths } from "@/lib/placeholder-pool";

/** Fills parent; use in a container with relative and min-height (e.g. hero right column). */
export function HeroImageFull() {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const paths = getSessionPlaceholderPaths();
    setSrc(paths[0] ?? PLACEHOLDER_POOL[0] ?? null);
  }, []);
  if (!src) return null;
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl bg-lucifera-anthracite animate-fade-in">
      <Image
        src={src}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

export function HeroImage() {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const paths = getSessionPlaceholderPaths();
    setSrc(paths[0] ?? PLACEHOLDER_POOL[0] ?? null);
  }, []);
  if (!src) return null;
  return (
    <div className="relative aspect-[21/10] w-full overflow-hidden rounded-2xl bg-stone-200 shadow-md animate-fade-in">
      <Image
        src={src}
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
  const [paths, setPaths] = useState<string[]>([]);
  useEffect(() => {
    const all = getSessionPlaceholderPaths();
    setPaths(all.slice(1, 1 + count));
  }, [count]);
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
