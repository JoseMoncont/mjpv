"use client";

import { useEffect, useRef } from "react";
import { drawComposition } from "@/lib/canvasUtils";
import type { Template } from "@/lib/templates";

interface TemplateCanvasProps {
  template: Template;
  /** Non-null loaded images, length 0–4. Length 0 = template only. */
  petImages: HTMLImageElement[];
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function TemplateCanvas({
  template,
  petImages,
  canvasRef,
}: TemplateCanvasProps) {
  const templateImgRef = useRef<HTMLImageElement | null>(null);
  const qrImgRef = useRef<HTMLImageElement | null>(null);

  // Load (or reload) the template PNG whenever its src changes
  useEffect(() => {
    const img = new Image();
    img.src = template.src;
    img.onload = () => {
      templateImgRef.current = img;
      redraw();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.src]);

  // Load QR code image once per template
  useEffect(() => {
    if (!template.qrCode) { qrImgRef.current = null; return; }
    const img = new Image();
    img.src = template.qrCode.src;
    img.onload = () => {
      qrImgRef.current = img;
      redraw();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.qrCode?.src]);

  // Redraw whenever petImages array reference changes (upload or removal)
  useEffect(() => {
    if (templateImgRef.current) redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petImages]);

  function redraw() {
    const canvas = canvasRef.current;
    const templateImg = templateImgRef.current;
    if (!canvas || !templateImg) return;
    drawComposition(canvas, petImages, templateImg, template, qrImgRef.current ?? undefined);
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  );
}
