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

export default function Home() {
  const [petFiles, setPetFiles] = useState<File[]>([]);
  const [petImages, setPetImages] = useState<HTMLImageElement[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const hasPhotos = petImages.length > 0;

  // ── Add files ──────────────────────────────────────────────────────────────
  const handleAdd = useCallback(
    (incoming: File[]) => {
      const capacity = 4 - petFiles.length;
      if (capacity <= 0) return;
      const toAdd = incoming.slice(0, capacity);

      toAdd.forEach((file) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          setPetFiles((prev) => {
            if (prev.length >= 4) return prev;
            return [...prev, file];
          });
          setPetImages((prev) => {
            if (prev.length >= 4) return prev;
            return [...prev, img];
          });
        };
        img.src = url;
      });
    },
    [petFiles.length]
  );

  // ── Remove file ────────────────────────────────────────────────────────────
  const handleRemove = useCallback((index: number) => {
    setPetFiles((prev) => prev.filter((_, i) => i !== index));
    setPetImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Scroll to result ───────────────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleTemplateSelect = useCallback((t: Template) => {
    setSelectedTemplate(t);
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
            <span style={{ color: "#F5A800" }}>✳ ME LA JUEGO ✳</span>
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

        {/* ── Upload zone ───────────────────────────────────────────────────── */}
        <section className="w-full">
          <UploadZone
            files={petFiles}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onGenerate={handleGenerate}
          />
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
              petImages={petImages}
              canvasRef={canvasRef}
            />
          </div>

          {/* Template selector (hidden when only 1 template) */}
          <TemplateSelector
            selected={selectedTemplate}
            onSelect={handleTemplateSelect}
          />

          {/* Download / share — only when at least 1 photo */}
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
