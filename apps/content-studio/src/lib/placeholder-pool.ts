/**
 * Curated pool of placeholder image paths under /public/placeholders/.
 * Add 8–12 images (e.g. 1.jpg … 12.jpg) to public/placeholders/ for hero and section visuals.
 */
export const PLACEHOLDER_POOL = [
  "/placeholders/1.jpg",
  "/placeholders/2.jpg",
  "/placeholders/3.jpg",
  "/placeholders/4.jpg",
  "/placeholders/5.jpg",
  "/placeholders/6.jpg",
  "/placeholders/7.jpg",
  "/placeholders/8.jpg",
  "/placeholders/9.jpg",
  "/placeholders/10.jpg",
  "/placeholders/11.jpg",
  "/placeholders/12.jpg",
];

const SESSION_KEY = "lp_placeholder_indices";
const PICK_COUNT = 4;

function pickStableIndices(poolLength: number): number[] {
  if (typeof window === "undefined" || poolLength === 0) return [];
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as number[];
      if (Array.isArray(parsed) && parsed.length >= 2 && parsed.every((i) => i >= 0 && i < poolLength))
        return parsed.slice(0, PICK_COUNT);
    }
    const indices: number[] = [];
    const available = Array.from({ length: poolLength }, (_, i) => i);
    for (let n = 0; n < Math.min(PICK_COUNT, available.length); n++) {
      const idx = Math.floor(Math.random() * available.length);
      indices.push(available[idx]!);
      available.splice(idx, 1);
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(indices));
    return indices;
  } catch {
    return [];
  }
}

export function getSessionPlaceholderPaths(): string[] {
  const pool = PLACEHOLDER_POOL;
  const indices = typeof window !== "undefined" ? pickStableIndices(pool.length) : [0, 1, 2, 3].slice(0, pool.length);
  return indices.map((i) => pool[i]!).filter(Boolean);
}
