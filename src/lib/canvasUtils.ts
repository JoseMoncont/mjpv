import type { Template } from "./templates";

const DEG = Math.PI / 180;

/** Resolves a CSS variable font reference (e.g. "var(--font-kurdis)") to the actual
 *  font-family string that the browser registered, so it can be used in ctx.font. */
function resolveFontFamily(fontFamily: string): string {
  if (typeof document === "undefined") return fontFamily;
  const match = fontFamily.match(/^var\((--[\w-]+)\)(?:,\s*(.+))?$/);
  if (!match) return fontFamily;
  const resolved = getComputedStyle(document.documentElement)
    .getPropertyValue(match[1])
    .trim();
  return resolved || match[2] || fontFamily;
}

/** Pet circle center coords for a given count, using correct math-coords formula. */
export function getPetPositions(
  template: Template,
  count: 1 | 2 | 3 | 4
): Array<{ cx: number; cy: number }> {
  const { mainCircle, petConfig } = template;
  if (!mainCircle || !petConfig) return [];
  const { arcRadiusPct, angles } = petConfig[count];
  const arcRadius = Math.round(mainCircle.r * arcRadiusPct / 100);
  return angles.map((deg) => ({
    cx: mainCircle.cx + arcRadius * Math.cos(deg * DEG),
    cy: mainCircle.cy - arcRadius * Math.sin(deg * DEG),
  }));
}

/**
 * Composition for 'pets-arc' templates:
 *   1. Template PNG (candidates already inside the main circle)
 *   2. For each pet photo: circular-clipped image + white border ring
 *   3. Optional QR code overlay (bottom-right corner)
 */
export function drawComposition(
  canvas: HTMLCanvasElement,
  petImages: HTMLImageElement[],
  templateImage: HTMLImageElement,
  template: Template,
  qrImage?: HTMLImageElement
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = template.width;
  canvas.height = template.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(templateImage, 0, 0, template.width, template.height);

  if (petImages.length === 0) return;

  const count = Math.min(petImages.length, 4) as 1 | 2 | 3 | 4;
  const positions = getPetPositions(template, count);
  const r = Math.round(template.mainCircle!.r * template.petConfig![count].radiusPct / 100);

  petImages.slice(0, 4).forEach((img, i) => {
    const { cx, cy } = positions[i];

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    const scale = Math.max((r * 2) / img.naturalWidth, (r * 2) / img.naturalHeight);
    const sw = img.naturalWidth * scale;
    const sh = img.naturalHeight * scale;
    ctx.drawImage(img, cx - sw / 2, cy - sh / 2, sw, sh);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  });

  if (qrImage && template.qrCode) {
    const { size, padding } = template.qrCode;
    ctx.drawImage(
      qrImage,
      template.width - size - padding,
      template.height - size - padding,
      size,
      size
    );
  }
}

/**
 * Composition for 'single-photo-name' templates. Draw order:
 *   1. Background (bgImg) — template-02.png
 *   2. User photo — circular, object-fit cover — + white border ring
 *   3. Overlay (overlayImg) — template-02-A.png, drawn on top with alpha transparency
 *   4. Name text
 */
export function drawSinglePhotoNameComposition(
  canvas: HTMLCanvasElement,
  userImage: HTMLImageElement | null,
  userName: string,
  template: Template,
  overlayImg: HTMLImageElement,
  bgImg?: HTMLImageElement,
  qrImage?: HTMLImageElement
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = template.width;
  canvas.height = template.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Background layer
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, template.width, template.height);
  }

  // 2. User photo
  if (userImage && template.userPhotoSlot) {
    const { cxPct, cyPct, rPct } = template.userPhotoSlot;
    const cx = template.width  * cxPct / 100;
    const cy = template.height * cyPct / 100;
    const r  = template.width  * rPct  / 100;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    const scale = Math.max((r * 2) / userImage.naturalWidth, (r * 2) / userImage.naturalHeight);
    const sw = userImage.naturalWidth * scale;
    const sh = userImage.naturalHeight * scale;
    ctx.drawImage(userImage, cx - sw / 2, cy - sh / 2, sw, sh);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  // 3. Name text — drawn before overlay so candidates layer sits on top
  if (userName.trim() && template.nameText) {
    const cfg = template.nameText;
    const text = cfg.uppercase ? userName.toUpperCase() : userName;
    const x        = template.width  * cfg.xPct        / 100;
    const y        = template.height * cfg.yPct        / 100;
    const maxWidth = template.width  * cfg.maxWidthPct / 100;
    let   fontSize = template.height * cfg.fontSizePct / 100;

    const family = resolveFontFamily(cfg.fontFamily);
    ctx.textAlign = cfg.align;
    ctx.font = `${cfg.fontWeight} ${fontSize}px ${family}`;

    while (ctx.measureText(text).width > maxWidth && fontSize > 12) {
      fontSize -= 2;
      ctx.font = `${cfg.fontWeight} ${fontSize}px ${family}`;
    }

    // Background rect
    if (cfg.bgColor) {
      const padX = cfg.bgPaddingX ?? 24;
      const padY = cfg.bgPaddingY ?? 12;
      const metrics = ctx.measureText(text);
      const textW = metrics.width;
      const ascent  = metrics.actualBoundingBoxAscent  ?? fontSize * 0.8;
      const descent = metrics.actualBoundingBoxDescent ?? fontSize * 0.2;
      ctx.fillStyle = cfg.bgColor;
      ctx.fillRect(
        x - textW / 2 - padX,
        y - ascent - padY,
        textW + padX * 2,
        ascent + descent + padY * 2
      );
    }

    ctx.fillStyle = cfg.color;
    ctx.fillText(text, x, y);
  }

  // 4. Overlay on top (candidates + frame, transparent elsewhere)
  ctx.drawImage(overlayImg, 0, 0, template.width, template.height);

  // 5. QR code — bottom-right corner
  if (qrImage && template.qrCode) {
    const { size, padding } = template.qrCode;
    ctx.drawImage(
      qrImage,
      template.width - size - padding,
      template.height - size - padding,
      size,
      size
    );
  }
}

/** Returns the canvas content as a PNG Blob. */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("canvas.toBlob returned null"));
      },
      "image/png"
    );
  });
}
