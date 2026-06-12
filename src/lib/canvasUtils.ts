import type { Template } from "./templates";

const DEG = Math.PI / 180;

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
 *   1. Background layer (bgImg)
 *   2. User photo — circular, object-fit cover — + white border ring
 *   3. Overlay layer (candidates on top)
 *   4. Name text below the photo circle
 *
 * overlayImg must have real alpha transparency in its empty areas.
 * If the overlay PNG uses solid black as transparent, pre-process it with
 * chromaKeyBlackToAlpha() before passing it here — or re-export the PNG
 * with a proper alpha channel (preferred, lets you remove the chroma key step).
 */
export function drawSinglePhotoNameComposition(
  canvas: HTMLCanvasElement,
  userImage: HTMLImageElement | null,
  userName: string,
  template: Template,
  bgImg: HTMLImageElement | HTMLCanvasElement,
  overlayImg: HTMLImageElement | HTMLCanvasElement
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = template.width;
  canvas.height = template.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Background
  ctx.drawImage(bgImg, 0, 0, template.width, template.height);

  // 2. User photo
  if (userImage && template.userPhotoSlot) {
    const { cx, cy, r } = template.userPhotoSlot;

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
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  // 3. Overlay (candidates) on top
  ctx.drawImage(overlayImg, 0, 0, template.width, template.height);

  // 4. Name text
  if (userName.trim() && template.nameText) {
    const cfg = template.nameText;
    const text = cfg.uppercase ? userName.toUpperCase() : userName;
    let fontSize = cfg.fontSize;

    ctx.textAlign = cfg.align;
    ctx.fillStyle = cfg.color;
    ctx.font = `${cfg.fontWeight} ${fontSize}px ${cfg.fontFamily}`;

    while (ctx.measureText(text).width > cfg.maxWidth && fontSize > 20) {
      fontSize -= 2;
      ctx.font = `${cfg.fontWeight} ${fontSize}px ${cfg.fontFamily}`;
    }

    ctx.fillText(text, cfg.x, cfg.y);
  }
}

/**
 * Converts pure-black pixels to fully transparent.
 * Only needed when the overlay PNG was exported with black (#000000) instead of
 * real alpha transparency. If the PNG already has correct alpha, skip this and
 * pass the HTMLImageElement directly to drawSinglePhotoNameComposition.
 */
export function chromaKeyBlackToAlpha(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, c.width, c.height);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] < 8 && d[i + 1] < 8 && d[i + 2] < 8) {
      d[i + 3] = 0;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return c;
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
