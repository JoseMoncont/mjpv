export interface PetCountConfig {
  radiusPct: number;
  arcRadiusPct: number;
  angles: number[];
}

export interface NameTextConfig {
  /** Text center X as % of template width  (e.g. 50 = center) */
  xPct: number;
  /** Text baseline Y as % of template height */
  yPct: number;
  /** Maximum text width as % of template width (auto-shrinks font if wider) */
  maxWidthPct: number;
  /** Font size as % of template height */
  fontSizePct: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  /** Optional filled rect drawn behind the text */
  bgColor?: string;
  /** Horizontal padding of the bg rect in px */
  bgPaddingX?: number;
  /** Vertical padding of the bg rect in px */
  bgPaddingY?: number;
  align: CanvasTextAlign;
  uppercase: boolean;
}

export interface UserPhotoSlotConfig {
  /** Center X as % of template width */
  cxPct: number;
  /** Center Y as % of template height */
  cyPct: number;
  /** Radius as % of template width */
  rPct: number;
}

export interface Template {
  id: string;
  name: string;
  type: "pets-arc" | "single-photo-name";
  width: number;
  height: number;
  /**
   * Main template PNG.
   * - pets-arc: background layer (candidates already in it).
   * - single-photo-name: top overlay (needs transparent cutout at userPhotoSlot).
   */
  src: string;
  /** Background layer for single-photo-name — drawn first, before user photo. */
  bgSrc?: string;

  // ── pets-arc ─────────────────────────────────────────────────────────────
  mainCircle?: { cx: number; cy: number; r: number };
  petConfig?: Record<1 | 2 | 3 | 4, PetCountConfig>;
  qrCode?: { src: string; size: number; padding: number };

  // ── single-photo-name ────────────────────────────────────────────────────
  userPhotoSlot?: UserPhotoSlotConfig;
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
    src: "/templates/template-02-A.png",  // overlay — drawn on top
    bgSrc: "/templates/template-02.png",  // background — drawn first
    width: 1080,
    height: 1350,
    // cx=540 → 50%, cy=510 → 37.8%, r=220 → 20.4% of width
    userPhotoSlot: { cxPct: 50, cyPct: 37.8, rPct: 20.4 },
    nameText: {
      // x=540 → 50%, y=760 → 56.3%, fontSize=68 → 5% of height, maxWidth=900 → 83.3% of width
      xPct: 50,
      yPct: 56.3,
      fontSizePct: 5,
      maxWidthPct: 83,
      fontFamily: '"Barlow Condensed", sans-serif',
      fontWeight: 800,
      color: "#F5A800",
      bgColor: "#2D2EE0",
      bgPaddingX: 32,
      bgPaddingY: 14,
      align: "center",
      uppercase: true,
    },
  },
];
