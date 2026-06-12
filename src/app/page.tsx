"use client";

import { useCallback, useRef, useState } from "react";
import ActionButtons from "@/components/ActionButtons";
import TemplateCanvas from "@/components/TemplateCanvas";
import TemplateSelector from "@/components/TemplateSelector";
import UploadZone from "@/components/UploadZone";
import { templates, type Template } from "@/lib/templates";

function StarIcon({ color = "#E8401C", size = 24 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
    </svg>
  );
}

function AsteriskIcon({ color = "#F5A800", size = "1em" }: { color?: string; size?: string | number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: "inline-block", verticalAlign: "middle", marginBottom: "0.1em" }}
    >
      <line x1="12" y1="2"     x2="12" y2="22"    stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="2"  y1="12"    x2="22" y2="12"    stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  // ── pets-arc state ─────────────────────────────────────────────────────────
  const [petFiles, setPetFiles] = useState<File[]>([]);
  const [petImages, setPetImages] = useState<HTMLImageElement[]>([]);

  // ── single-photo-name state ────────────────────────────────────────────────
  const [userFile, setUserFile] = useState<File | null>(null);
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [userName, setUserName] = useState("");

  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const hasPhotos =
    selectedTemplate.type === "pets-arc" ? petImages.length > 0 : userImage !== null;

  // ── pets-arc handlers ──────────────────────────────────────────────────────
  const handleAdd = useCallback(
    (incoming: File[]) => {
      const capacity = 4 - petFiles.length;
      if (capacity <= 0) return;
      const toAdd = incoming.slice(0, capacity);
      toAdd.forEach((file) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          setPetFiles((prev) => (prev.length >= 4 ? prev : [...prev, file]));
          setPetImages((prev) => (prev.length >= 4 ? prev : [...prev, img]));
        };
        img.src = url;
      });
    },
    [petFiles.length]
  );

  const handleRemove = useCallback((index: number) => {
    setPetFiles((prev) => prev.filter((_, i) => i !== index));
    setPetImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── single-photo-name handlers ─────────────────────────────────────────────
  const handleAddSingle = useCallback((incoming: File[]) => {
    const file = incoming[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setUserFile(file);
      setUserImage(img);
    };
    img.src = url;
  }, []);

  const handleRemoveSingle = useCallback(() => {
    setUserFile(null);
    setUserImage(null);
  }, []);

  // ── Shared handlers ────────────────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleTemplateSelect = useCallback((t: Template) => {
    setSelectedTemplate(t);
    setPetFiles([]);
    setPetImages([]);
    setUserFile(null);
    setUserImage(null);
    setUserName("");
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#2D2EE0" }}>
      <main className="flex-1 flex flex-col items-center px-4 py-12 md:py-20 gap-10 max-w-2xl mx-auto w-full">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="flex flex-col items-center gap-4 text-center w-full">
          <div className="flex items-center gap-3">
            <StarIcon color="#E8401C" size={28} />
            <StarIcon color="#F5A800" size={18} />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display), 'Barlow Condensed', sans-serif",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 0.92,
              fontSize: "clamp(3rem, 12vw, 5.5rem)",
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: "#F5A800" }}>
              <AsteriskIcon size="0.7em" /> ME LA JUEGO <AsteriskIcon size="0.7em" />
            </span>
            <br />
            <span style={{ color: "#ffffff" }}>POR LA VIDA</span>
          </h1>
          <div className="flex items-center gap-3">
            <StarIcon color="#F5A800" size={18} />
            <StarIcon color="#E8401C" size={28} />
          </div>
          <p
            style={{
              fontFamily: "var(--font-display), 'Barlow Condensed', sans-serif",
              fontWeight: 700,
              letterSpacing: "0.18em",
              fontSize: "clamp(0.85rem, 3vw, 1.1rem)",
              textTransform: "uppercase",
              color: "#F5A800",
              border: "2px solid #F5A800",
              padding: "0.35rem 1rem",
            }}
          >
            Versión mascotas
          </p>
          <p
            className="text-sm md:text-base max-w-sm"
            style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-body), Nunito, sans-serif" }}
          >
            Sube las fotos de tus mascotas (máx. 4) y aparecerán alrededor del círculo
          </p>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="w-full">
          <ol className="flex flex-col gap-3">
            {[
              { n: "1", text: "Sube entre 1 y 4 fotos de tus mascotas (JPG, PNG o WebP)." },
              { n: "2", text: 'Haz clic en "Generar" para ver la imagen lista.' },
              { n: "3", text: "Descarga o comparte directamente desde tu celular." },
            ].map(({ n, text }) => (
              <li key={n} className="flex items-start gap-3">
                <span
                  style={{
                    fontFamily: "var(--font-display), 'Barlow Condensed', sans-serif",
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    color: "#2D2EE0",
                    backgroundColor: "#F5A800",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {n}
                </span>
                <p
                  className="text-sm"
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: "var(--font-body), Nunito, sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  {text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Upload zone (conditional by template type) ────────────────────── */}
        <section className="w-full">
          {selectedTemplate.type === "pets-arc" ? (
            <UploadZone
              files={petFiles}
              onAdd={handleAdd}
              onRemove={handleRemove}
              onGenerate={handleGenerate}
            />
          ) : (
            <div className="flex flex-col gap-5 w-full">
              <UploadZone
                files={userFile ? [userFile] : []}
                onAdd={handleAddSingle}
                onRemove={handleRemoveSingle}
                onGenerate={handleGenerate}
                maxFiles={1}
              />
              {/* Name input */}
              <div className="flex flex-col gap-2 w-full">
                <label
                  htmlFor="user-name"
                  style={{
                    fontFamily: "var(--font-display), 'Barlow Condensed', sans-serif",
                    fontWeight: 900,
                    fontSize: "0.8rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#F5A800",
                  }}
                >
                  Escribe tu nombre
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  maxLength={30}
                  placeholder="Tu nombre"
                  style={{
                    fontFamily: "var(--font-body), Nunito, sans-serif",
                    fontSize: "1rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    border: "2px solid #F5A800",
                    color: "#ffffff",
                    outline: "none",
                    width: "100%",
                  }}
                />
              </div>
            </div>
          )}
        </section>

        {/* ── Canvas preview ────────────────────────────────────────────────── */}
        <section ref={resultRef} className="w-full flex flex-col gap-6">
          <div
            style={{
              outline: hasPhotos ? "3px solid #F5A800" : "3px solid rgba(255,255,255,0.15)",
              outlineOffset: "4px",
              transition: "outline-color 0.3s",
            }}
          >
            <TemplateCanvas
              template={selectedTemplate}
              canvasRef={canvasRef}
              petImages={selectedTemplate.type === "pets-arc" ? petImages : []}
              userImage={selectedTemplate.type === "single-photo-name" ? userImage : undefined}
              userName={selectedTemplate.type === "single-photo-name" ? userName : undefined}
            />
          </div>

          <TemplateSelector
            selected={selectedTemplate}
            onSelect={handleTemplateSelect}
          />

          {hasPhotos && (
            <ActionButtons canvasRef={canvasRef} disabled={false} />
          )}
        </section>

      </main>

      <footer
        className="py-6 text-center"
        style={{ borderTop: "2px solid rgba(255,255,255,0.15)" }}
      >
        <p
          className="text-xs uppercase tracking-widest"
          style={{
            color: "rgba(255,255,255,0.4)",
            fontFamily: "var(--font-display), 'Barlow Condensed', sans-serif",
          }}
        >
          Me la juego por la vida
        </p>
      </footer>
    </div>
  );
}
