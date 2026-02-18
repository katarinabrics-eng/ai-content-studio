import type { DetectedAssets } from "./enrich-schema";

function resolveUrl(href: string, base: string): string {
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

export async function fetchHtml(url: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch(url, {
    signal,
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ContentStudio/1.0)" },
  });
  if (!res.ok) return "";
  return res.text();
}

export async function fetchCss(url: string, signal?: AbortSignal): Promise<string> {
  try {
    const res = await fetch(url, {
      signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ContentStudio/1.0)" },
    });
    if (!res.ok) return "";
    return res.text();
  } catch {
    return "";
  }
}

/** Vytáhne kandidáty na logo z HTML: og:image, twitter:image, img s logo v alt/src, favicon. */
export function extractLogoCandidates(html: string, baseUrl: string): string[] {
  const seen = new Set<string>();
  const add = (u: string) => {
    const trimmed = u.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      out.push(trimmed.startsWith("http") ? trimmed : resolveUrl(trimmed, baseUrl));
    }
  };
  const out: string[] = [];

  const ogImage = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image)["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image)["']/i);
  if (ogImage) add(ogImage[1]);

  const twitterImage = html.match(/<meta[^>]+(?:name|property)=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']twitter:image["']/i);
  if (twitterImage) add(twitterImage[1]);

  const imgRegex = /<img[^>]+(?:alt|src)=["']([^"']*logo[^"']*)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRegex.exec(html)) !== null) {
    const val = m[1];
    if (val.toLowerCase().includes("logo")) add(val.startsWith("data:") ? val : resolveUrl(val, baseUrl));
  }
  const imgSrcRegex = /<img[^>]+src=["']([^"']+)["'][^>]+alt=["'][^"']*logo[^"']*["']/gi;
  while ((m = imgSrcRegex.exec(html)) !== null) add(resolveUrl(m[1], baseUrl));

  const favicon = html.match(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:icon|shortcut icon)["']/i);
  if (favicon) add(favicon[1]);

  return out;
}

/** Vytáhne až 5 URL stylů z HTML. */
export function extractCssUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  const re = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null && urls.length < 5) {
    urls.push(resolveUrl(m[1], baseUrl));
  }
  const re2 = /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']stylesheet["']/gi;
  while ((m = re2.exec(html)) !== null && urls.length < 5) {
    const u = resolveUrl(m[1], baseUrl);
    if (!urls.includes(u)) urls.push(u);
  }
  return urls.slice(0, 5);
}

function rgbToHex(r: number, g: number, b: number): string {
  const hex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function normalizeColor(c: string): string | null {
  const hex = c.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hex) {
    const h = hex[1];
    if (h.length === 3) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase();
    return `#${h.toLowerCase()}`;
  }
  const rgb = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) return rgbToHex(Number(rgb[1]), Number(rgb[2]), Number(rgb[3]));
  return null;
}

/** Hex a rgb z CSS, vrátí top 5 nejčastějších (normalizované na hex). */
export function extractColorsFromCss(css: string): string[] {
  const count = new Map<string, number>();
  const hexRe = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
  let m: RegExpExecArray | null;
  while ((m = hexRe.exec(css)) !== null) {
    const n = normalizeColor(m[0]);
    if (n) count.set(n, (count.get(n) ?? 0) + 1);
  }
  const rgbRe = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g;
  while ((m = rgbRe.exec(css)) !== null) {
    const n = normalizeColor(m[0].replace(/\s/g, ""));
    if (n) count.set(n, (count.get(n) ?? 0) + 1);
  }
  return Array.from(count.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([c]) => c);
}

/** font-family z CSS, vrátí top 5 (bez generických rodin). */
const genericFonts = new Set(["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "inherit", "initial"]);
export function extractFontsFromCss(css: string): string[] {
  const count = new Map<string, number>();
  const re = /font-family\s*:\s*([^;}\n]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    const names = m[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
    for (const name of names) {
      if (name && !genericFonts.has(name.toLowerCase())) {
        count.set(name, (count.get(name) ?? 0) + 1);
      }
    }
  }
  return Array.from(count.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([f]) => f);
}

/** Stáhne HTML stránku a až 5 CSS, vrátí detected assets. */
export async function extractAssetsFromWeb(
  websiteUrl: string,
  signal?: AbortSignal
): Promise<DetectedAssets> {
  const result: DetectedAssets = { logoCandidates: [], colors: [], fonts: [] };
  try {
    const html = await fetchHtml(websiteUrl, signal);
    if (!html) return result;

    result.logoCandidates = extractLogoCandidates(html, websiteUrl);

    const cssUrls = extractCssUrls(html, websiteUrl);
    const allColors: string[] = [];
    const allFonts: string[] = [];
    for (const url of cssUrls) {
      const css = await fetchCss(url, signal);
      if (css) {
        allColors.push(...extractColorsFromCss(css));
        allFonts.push(...extractFontsFromCss(css));
      }
    }
    const colorCount = new Map<string, number>();
    for (const c of allColors) colorCount.set(c, (colorCount.get(c) ?? 0) + 1);
    result.colors = Array.from(colorCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([c]) => c);
    const fontCount = new Map<string, number>();
    for (const f of allFonts) fontCount.set(f, (fontCount.get(f) ?? 0) + 1);
    result.fonts = Array.from(fontCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([f]) => f);
  } catch {
    // ignore
  }
  return result;
}
