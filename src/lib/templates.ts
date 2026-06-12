export interface PetCountConfig {
  radiusPct: number;
  arcRadiusPct: number;
  angles: number[];
}

export interface NameTextConfig {
  x: number;
  y: number;
  maxWidth: number;
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  color: string;
  align: CanvasTextAlign;
  uppercase: boolean;
}

export interface Template {
  id: string;
  name: string;
  type: "pets-arc" | "single-photo-name";
  width: number;
  height: number;
  /**
   * Main template PNG.
   * - pets-arc: drawn as background (candidates already in it).
   * - single-photo-name: drawn as top overlay (must have transparent cutout at userPhotoSlot).
   */
  src: string;
  /**
   * Optional background layer for single-photo-name templates.
   * Drawn first, before the user photo and the overlay (src).
   */
  bgSrc?: string;

  // ── pets-arc ─────────────────────────────────────────────────────────────
  mainCircle?: { cx: number; cy: number; r: number };
  petConfig?: Record<1 | 2 | 3 | 4, PetCountConfig>;
  qrCode?: { src: string; size: number; padding: number };

  // ── single-photo-name ────────────────────────────────────────────────────
  userPhotoSlot?: { cx: number; cy: number; r: number };
  nameText?: NameTextConfig;
}

export const templates: Template[] = [
  {
    id: "template-01",
    name: "Mascotas",
    type: "pets-arc",
    src: "/templates/template-01.png",
    width: 1080,
    height: 1350,
    mainCircle: { cx: 539, cy: 633, r: 287 },
    petConfig: {
      1: { radiusPct: 55, arcRadiusPct: 90,  angles: [270] },
      2: { radiusPct: 55, arcRadiusPct: 115, angles: [225, 315] },
      3: { radiusPct: 40, arcRadiusPct: 115, angles: [220, 270, 320] },
      4: { radiusPct: 35, arcRadiusPct: 115, angles: [210, 250, 290, 330] },
    },
    qrCode: { src: "/templates/qrcode.png", size: 150, padding: 32 },
  },
  {
    id: "template-02",
    name: "Foto y nombre",
    type: "single-photo-name",
    src: "/templates/template-02-A.png",   // overlay drawn on top
    bgSrc: "/templates/template-02.png",   // background drawn first
    width: 1080,
    height: 1350,
    userPhotoSlot: { cx: 540, cy: 510, r: 220 },
    nameText: {
      x: 540,
      y: 760,
      maxWidth: 900,
      fontFamily: '"Barlow Condensed", sans-serif',
      fontWeight: 800,
      fontSize: 48,
      color: "#F5A800",
      align: "center",
      uppercase: true,
    },
  },
];
