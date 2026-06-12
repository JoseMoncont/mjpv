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
 *   1. User photo — circular, object-fit cover — + white border ring
 *   2. Template PNG on top (must have a transparent circular cutout at userPhotoSlot)
 *   3. Name text
 */
export function drawSinglePhotoNameComposition(
  canvas: HTMLCanvasElement,
  userImage: HTMLImageElement | null,
  userName: string,
  template: Template,
  templateImg: HTMLImageElement
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = template.width;
  canvas.height = template.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. User photo behind the template
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

  // 2. Template overlay (transparent cutout reveals user photo)
  ctx.drawImage(templateImg, 0, 0, template.width, template.height);

  // 3. Name text
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
