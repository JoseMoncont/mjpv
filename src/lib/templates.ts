export interface PetCountConfig {
  /** Pet circle radius as a percentage of mainCircle.r. */
  radiusPct: number;
  /** Distance from mainCircle center to pet center as a percentage of mainCircle.r. */
  arcRadiusPct: number;
  /** Angles in degrees. 0°=right, 270°=straight down (math coords, y-flipped for screen). */
  angles: number[];
}

export interface Template {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  /** Reference circle already drawn in the PNG — used for arc positioning only. */
  mainCircle: { cx: number; cy: number; r: number };
  /** Per-count layout config. Pixel values are derived at draw time from mainCircle.r. */
  petConfig: Record<1 | 2 | 3 | 4, PetCountConfig>;
  /** Optional QR code overlay drawn in the bottom-right corner. */
  qrCode?: { src: string; size: number; padding: number };
}

export const templates: Template[] = [
  {
    id: "template-01",
    name: "Me la juego por la vida",
    src: "/templates/template-01.png",
    width: 1080,
    height: 1350,
    mainCircle: { cx: 539, cy: 633, r: 287 },
    petConfig: {
      1: { radiusPct: 55,  arcRadiusPct: 90,  angles: [270] },
      2: { radiusPct: 55,  arcRadiusPct: 115, angles: [225, 315] },
      3: { radiusPct: 40,  arcRadiusPct: 115, angles: [220, 270, 320] },
      4: { radiusPct: 35,  arcRadiusPct: 115, angles: [210, 250, 290, 330] },
    },
    qrCode: { src: "/templates/qrcode.png", size: 150, padding: 32 },
  },
];
