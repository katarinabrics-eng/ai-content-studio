import sharp from "sharp";

const SAFE_MARGIN_PX = 48;
const HEADLINE_FONT_SIZE = 56;
const SUBHEADLINE_FONT_SIZE = 32;
const CTA_FONT_SIZE = 36;

/** Overlay headline, subheadline, CTA on base image. Returns PNG buffer. */
export async function composeTextOverlay(
  baseImageBuffer: Buffer,
  opts: {
    headline: string;
    subheadline?: string;
    cta: string;
    targetWidth: number;
    targetHeight: number;
    /** CTA fill color (hex, e.g. #FF0000). Default white. */
    ctaColor?: string;
    /** Logo URL to place in safe area (top-right). Fetched and composited if provided. */
    logoUrl?: string;
  }
): Promise<Buffer> {
  const { headline, subheadline, cta, targetWidth, targetHeight, ctaColor = "#FFFFFF", logoUrl } = opts;

  // Resize base to target dimensions
  let base = sharp(baseImageBuffer)
    .resize(targetWidth, targetHeight, { fit: "cover" })
    .png();

  // SVG text overlays (no external fonts - use system font for simplicity)
  const textLines: { text: string; y: number; fontSize: number; isCta?: boolean }[] = [];
  let y = SAFE_MARGIN_PX + HEADLINE_FONT_SIZE;
  if (headline.trim()) {
    textLines.push({ text: headline.trim().slice(0, 60), y, fontSize: HEADLINE_FONT_SIZE, isCta: false });
    y += HEADLINE_FONT_SIZE + 16;
  }
  if (subheadline?.trim()) {
    textLines.push({ text: subheadline.trim().slice(0, 80), y, fontSize: SUBHEADLINE_FONT_SIZE, isCta: false });
    y += SUBHEADLINE_FONT_SIZE + 16;
  }
  y = targetHeight - SAFE_MARGIN_PX - CTA_FONT_SIZE - 16;
  const ctaText = cta.trim().slice(0, 40);
  const ctaFill = /^#?[0-9A-Fa-f]{3,6}$/.test(ctaColor.replace("#", "")) ? (ctaColor.startsWith("#") ? ctaColor : `#${ctaColor}`) : "#FFFFFF";

  if (ctaText) {
    textLines.push({ text: ctaText, y, fontSize: CTA_FONT_SIZE, isCta: true });
  }

  if (textLines.length === 0 && !logoUrl) {
    return base.toBuffer();
  }

  // Create SVG with text - headline/subhead white, CTA uses brand color
  const svgParts = textLines.map(({ text, y: ty, fontSize, isCta }) => {
    const fill = isCta ? ctaFill : "white";
    return `<text x="${SAFE_MARGIN_PX}" y="${ty}" font-size="${fontSize}" font-family="Arial,sans-serif" font-weight="bold" fill="${escapeXml(fill)}" stroke="black" stroke-width="2">${escapeXml(text)}</text>`;
  });
  const svg = `
    <svg width="${targetWidth}" height="${targetHeight}" xmlns="http://www.w3.org/2000/svg">
      ${svgParts.join("\n")}
    </svg>
  `;

  const textBuffer = Buffer.from(svg);
  const composites: { input: Buffer; top: number; left: number }[] = [{ input: textBuffer, top: 0, left: 0 }];

  // Logo in safe area (top-right) if provided
  if (logoUrl && logoUrl.startsWith("http")) {
    try {
      const logoRes = await fetch(logoUrl);
      if (logoRes.ok) {
        const logoBuf = Buffer.from(await logoRes.arrayBuffer());
        const logoSize = 80;
        const logoResized = await sharp(logoBuf).resize(logoSize, logoSize, { fit: "contain" }).png().toBuffer();
        composites.push({ input: logoResized, top: SAFE_MARGIN_PX, left: targetWidth - SAFE_MARGIN_PX - logoSize });
      }
    } catch {
      // ignore logo fetch failure
    }
  }

  return sharp(await base.toBuffer())
    .composite(composites)
    .png()
    .toBuffer();
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
