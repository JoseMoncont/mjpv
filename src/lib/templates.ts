export interface PetCountConfig {
  /** Pet circle radius as a percentage of mainCircle.r. */
  radiusPct: number;
  /** Distance from mainCircle center to pet center as a percentage of mainCircle.r. */
  arcRadiusPct: number;
  /** Angles in degrees. 0°=right, 270°=straight down (math coords, y-flipped for screen). */
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
  /** Discriminates the draw strategy used by canvasUtils and TemplateCanvas. */
  type: "pets-arc" | "single-photo-name";
  width: number;
  height: number;
  /**
   * Template PNG path. Used by both types:
   * - pets-arc: drawn as background; pet photos appear on top.
   * - single-photo-name: drawn as overlay on top of the user photo.
   *   The PNG must have a transparent circular cutout at userPhotoSlot
   *   so the user photo shows through.
   */
  src: string;

  // ── pets-arc fields ──────────────────────────────────────────────────────
  /** Reference circle already drawn in the PNG — used for arc positioning only. */
  mainCircle?: { cx: number; cy: number; r: number };
  /** Per-count layout config. Pixel values derived at draw time from mainCircle.r. */
  petConfig?: Record<1 | 2 | 3 | 4, PetCountConfig>;
  /** Optional QR code overlay drawn in the bottom-right corner. */
  qrCode?: { src: string; size: number; padding: number };

  // ── single-photo-name fields ─────────────────────────────────────────────
  /** Circular slot where the user photo is drawn (behind the template PNG). */
  userPhotoSlot?: { cx: number; cy: number; r: number };
  /** Config for the name text drawn after the template. */
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
    src: "/templates/template-02.png",
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
