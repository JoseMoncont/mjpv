/**
 * Generates a 1080x1350 placeholder template PNG:
 *   - Solid #2D2EE0 blue background
 *   - Large transparent circle (the "main" slot area with a white dashed border)
 *   - 5 smaller transparent circles in an arc below the main circle,
 *     each with a white dashed border — shows where pet photos will appear.
 *
 * Replace this file with the real campaign PNG when it's ready.
 * The slot values here match lib/templates.ts so the guide lines align.
 */
import { deflateSync } from "zlib";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const W = 1080;
const H = 1350;

// Main circle (matches templates.ts mainCircle)
const MCX = 540, MCY = 445, MCR = 390;

// Pet arc (matches templates.ts petArc)
const PET_R = 90;
const DIST  = 460;
const START_DEG = 48;
const END_DEG   = 132;
const MAX_PETS  = 5;

function petPositions(count) {
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const deg = START_DEG + t * (END_DEG - START_DEG);
    const rad = (deg * Math.PI) / 180;
    return {
      cx: MCX + DIST * Math.cos(rad),
      cy: MCY + DIST * Math.sin(rad),
    };
  });
}

const petCircles = petPositions(MAX_PETS);

// ── PNG helpers ─────────────────────────────────────────────────────────────

function uint32(n) {
  const b = Buffer.allocUnsafe(4);
  b.writeUInt32BE(n, 0);
  return b;
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const len = uint32(data.length);
  const crc = uint32(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([len, typeBytes, data, crc]);
}

function insideCircle(x, y, cx, cy, r) {
  return (x - cx) ** 2 + (y - cy) ** 2 < r * r;
}

function onCircleEdge(x, y, cx, cy, r, halfWidth) {
  const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  return Math.abs(d - r) <= halfWidth;
}

function dashedEdge(x, y, cx, cy, r) {
  if (!onCircleEdge(x, y, cx, cy, r, 3)) return false;
  const angle = Math.atan2(y - cy, x - cx);
  const arc = ((angle + Math.PI) / (2 * Math.PI)) * (2 * Math.PI * r);
  const period = 20;
  return ((arc % period) + period) % period < 12;
}

// ── Pixel rasteriser ────────────────────────────────────────────────────────

const rows = [];

for (let y = 0; y < H; y++) {
  const row = Buffer.allocUnsafe(1 + W * 4);
  row[0] = 0; // filter = None

  for (let x = 0; x < W; x++) {
    const px = 1 + x * 4;

    let r, g, b, a;

    const inMain   = insideCircle(x, y, MCX, MCY, MCR - 2);
    const mainEdge = dashedEdge(x, y, MCX, MCY, MCR);

    // Check pet circles
    let inPet = false, onPetEdge = false;
    for (const p of petCircles) {
      if (insideCircle(x, y, p.cx, p.cy, PET_R - 2)) { inPet = true; break; }
      if (dashedEdge(x, y, p.cx, p.cy, PET_R))        { onPetEdge = true; break; }
    }

    if (onPetEdge || mainEdge) {
      // Dashed white guide outline
      r = 255; g = 255; b = 255; a = 200;
    } else if (inMain || inPet) {
      // Transparent slot (user photo will go here)
      r = 0; g = 0; b = 0; a = 0;
    } else {
      // Solid blue background #2D2EE0
      r = 0x2d; g = 0x2e; b = 0xe0; a = 255;
    }

    row[px] = r; row[px + 1] = g; row[px + 2] = b; row[px + 3] = a;
  }

  rows.push(row);
}

const raw        = Buffer.concat(rows);
const compressed = deflateSync(raw, { level: 6 });

const sig  = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = chunk("IHDR", Buffer.concat([uint32(W), uint32(H), Buffer.from([8, 6, 0, 0, 0])]));
const idat = chunk("IDAT", compressed);
const iend = chunk("IEND", Buffer.alloc(0));

const png     = Buffer.concat([sig, ihdr, idat, iend]);
const outPath = join(__dirname, "../public/templates/template-01.png");
writeFileSync(outPath, png);
console.log(`Written ${png.length} bytes → ${outPath}`);
console.log(`Main circle:  cx=${MCX} cy=${MCY} r=${MCR}`);
console.log(`Pet circles (${MAX_PETS}):`, petCircles.map(p => `(${Math.round(p.cx)},${Math.round(p.cy)})`).join(" "));
