import type { Template } from "./templates";

const DEG = Math.PI / 180;

/** Pet circle center coords for a given count, using correct math-coords formula. */
export function getPetPositions(
  template: Template,
  count: 1 | 2 | 3 | 4
): Array<{ cx: number; cy: number }> {
  const { mainCircle, petConfig } = template;
  const { arcRadiusPct, angles } = petConfig[count];
  const arcRadius = Math.round(mainCircle.r * arcRadiusPct / 100);
  return angles.map((deg) => ({
    cx: mainCircle.cx + arcRadius * Math.cos(deg * DEG),
    cy: mainCircle.cy - arcRadius * Math.sin(deg * DEG),
  }));
}

/**
 * Full composition:
 *   1. Draw template PNG (candidates' photo already inside the main circle)
 *   2. For each uploaded pet photo: draw circular-clipped image + white border ring
 *
 * petImages must be non-null and length 1–4.
 * Pass an empty array to render the template alone (no pet circles).
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

  // 1. Template background (candidates already drawn inside the main circle)
  ctx.drawImage(templateImage, 0, 0, template.width, template.height);

  if (petImages.length === 0) return;

  const count = Math.min(petImages.length, 4) as 1 | 2 | 3 | 4;
  const positions = getPetPositions(template, count);
  const r = Math.round(template.mainCircle.r * template.petConfig[count].radiusPct / 100);

  petImages.slice(0, 4).forEach((img, i) => {
    const { cx, cy } = positions[i];

    // Clipped pet photo (object-fit: cover)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    const scale = Math.max((r * 2) / img.naturalWidth, (r * 2) / img.naturalHeight);
    const sw = img.naturalWidth * scale;
    const sh = img.naturalHeight * scale;
    ctx.drawImage(img, cx - sw / 2, cy - sh / 2, sw, sh);

    ctx.restore();

    // White border ring drawn on top
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  });

  // QR code — bottom-right corner
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
