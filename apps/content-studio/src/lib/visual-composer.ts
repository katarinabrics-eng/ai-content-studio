import sharp from "sharp";

const SAFE_MARGIN_PX = 48;
const HEADLINE_FONT_SIZE = 56;
const SUBHEADLINE_FONT_SIZE = 32;
const CTA_FONT_SIZE = 36;
const HEADLINE_MAX_WORDS = 6;
const SUBHEADLINE_MAX_WORDS = 12;

function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(" ");
}

/** Optional color grade overlay (brand colors) and logo placement. */
export type ComposeOverlayOptions = {
  headline: string;
  subheadline?: string;
  cta: string;
  targetWidth: number;
  targetHeight: number;
  /** CTA button fill (hex). Default white. */
  ctaColor?: string;
  /** Logo URL – placed bottom-right safe zone. */
  logoUrl?: string;
  /** Brand colors for gradient overlay (hex[]). Applied when length > 0. */
  brandColors?: string[];
  /** Apply brand color grade overlay. */
  brandLock?: boolean;
  /** AbortSignal for logo fetch (e.g. 3s timeout). */
  logoFetchSignal?: AbortSignal;
};

/** Overlay headline (max 6 words), subheadline (max 12 words), CTA button. Text only via Sharp+SVG; no text in base image. */
export async function composeTextOverlay(
  baseImageBuffer: Buffer,
  opts: ComposeOverlayOptions
): Promise<Buffer> {
  const {
    headline,
    subheadline,
    cta,
    targetWidth,
    targetHeight,
    ctaColor = "#FFFFFF",
    logoUrl,
    brandColors = [],
    brandLock = false,
    logoFetchSignal,
  } = opts;

  const headlineText = truncateWords(headline, HEADLINE_MAX_WORDS).slice(0, 60);
  const subheadlineText = subheadline ? truncateWords(subheadline, SUBHEADLINE_MAX_WORDS).slice(0, 80) : "";
  const ctaText = cta.trim().slice(0, 40);

  const ctaFill = /^#?[0-9A-Fa-f]{3,6}$/.test(String(ctaColor).replace("#", ""))
    ? (String(ctaColor).startsWith("#") ? ctaColor : `#${ctaColor}`)
    : "#FFFFFF";

  // Resize base to target
  let base = sharp(baseImageBuffer)
    .resize(targetWidth, targetHeight, { fit: "cover" })
    .png();

  let currentBuffer = await base.toBuffer();

  // 1) Optional color grade overlay (brand colors)
  if (brandLock && brandColors.length > 0) {
    const hexColors = brandColors
      .map((c) => (c.startsWith("#") ? c : `#${c}`))
      .filter((c) => /^#[0-9A-Fa-f]{3,6}$/.test(c));
    if (hexColors.length > 0) {
      const [c1, c2] = hexColors;
      const gradientSvg = `
        <svg width="${targetWidth}" height="${targetHeight}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${escapeXml(c1)};stop-opacity:0.15"/>
              <stop offset="100%" style="stop-color:${escapeXml(c2 || c1)};stop-opacity:0.25"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)"/>
        </svg>
      `;
      try {
        const gradBuf = Buffer.from(gradientSvg);
        currentBuffer = await sharp(currentBuffer)
          .composite([{ input: gradBuf, top: 0, left: 0 }])
          .png()
          .toBuffer();
      } catch (e) {
        throw new Error(`Color grade overlay selhal: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  // 2) Text overlay (headline, subheadline, CTA button)
  const textLines: { text: string; y: number; fontSize: number; isCta?: boolean }[] = [];
  let y = SAFE_MARGIN_PX + HEADLINE_FONT_SIZE;
  if (headlineText) {
    textLines.push({ text: headlineText, y, fontSize: HEADLINE_FONT_SIZE, isCta: false });
    y += HEADLINE_FONT_SIZE + 16;
  }
  if (subheadlineText) {
    textLines.push({ text: subheadlineText, y, fontSize: SUBHEADLINE_FONT_SIZE, isCta: false });
    y += SUBHEADLINE_FONT_SIZE + 16;
  }
  const ctaY = targetHeight - SAFE_MARGIN_PX - CTA_FONT_SIZE - 24;
  if (ctaText) {
    textLines.push({ text: ctaText, y: ctaY + CTA_FONT_SIZE, fontSize: CTA_FONT_SIZE, isCta: true });
  }

  if (textLines.length > 0) {
    const svgParts = textLines.map(({ text, y: ty, fontSize, isCta }) => {
      const fill = isCta ? ctaFill : "white";
      const stroke = isCta ? "rgba(0,0,0,0.3)" : "black";
      const strokeW = isCta ? 1 : 2;
      return `<text x="${SAFE_MARGIN_PX}" y="${ty}" font-size="${fontSize}" font-family="Arial,sans-serif" font-weight="bold" fill="${escapeXml(fill)}" stroke="${escapeXml(stroke)}" stroke-width="${strokeW}">${escapeXml(text)}</text>`;
    });
    const svg = `
      <svg width="${targetWidth}" height="${targetHeight}" xmlns="http://www.w3.org/2000/svg">
        ${svgParts.join("\n")}
      </svg>
    `;
    try {
      currentBuffer = await sharp(currentBuffer)
        .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
        .png()
        .toBuffer();
    } catch (e) {
      throw new Error(`Text overlay selhal: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // 3) Logo in safe zone – bottom-right (respects logoFetchSignal for timeout)
  if (logoUrl && logoUrl.startsWith("http")) {
    try {
      const logoRes = await fetch(logoUrl, { signal: logoFetchSignal });
      if (!logoRes.ok) throw new Error(`HTTP ${logoRes.status}`);
      const logoBuf = Buffer.from(await logoRes.arrayBuffer());
      const logoSize = 80;
      const logoResized = await sharp(logoBuf).resize(logoSize, logoSize, { fit: "contain" }).png().toBuffer();
      currentBuffer = await sharp(currentBuffer)
        .composite([
          {
            input: logoResized,
            top: targetHeight - SAFE_MARGIN_PX - logoSize,
            left: targetWidth - SAFE_MARGIN_PX - logoSize,
          },
        ])
        .png()
        .toBuffer();
    } catch (e) {
      throw new Error(`Logo overlay selhal (${logoUrl}): ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return currentBuffer;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
