"use client";

import { useEffect, useRef } from "react";
import { drawComposition, drawSinglePhotoNameComposition } from "@/lib/canvasUtils";
import type { Template } from "@/lib/templates";

interface TemplateCanvasProps {
  template: Template;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  // pets-arc
  petImages?: HTMLImageElement[];
  // single-photo-name
  userImage?: HTMLImageElement | null;
  userName?: string;
}

export default function TemplateCanvas({
  template,
  canvasRef,
  petImages = [],
  userImage,
  userName = "",
}: TemplateCanvasProps) {
  const templateImgRef = useRef<HTMLImageElement | null>(null);
  const qrImgRef = useRef<HTMLImageElement | null>(null);

  // Load template PNG whenever the template changes
  useEffect(() => {
    templateImgRef.current = null;
    const img = new Image();
    img.src = template.src;
    img.onload = () => {
      templateImgRef.current = img;
      redraw();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.id]);

  // Load QR code (pets-arc only)
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

  // Redraw when pet photos change
  useEffect(() => {
    if (template.type === "pets-arc") redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petImages]);

  // Redraw when user photo or name changes
  useEffect(() => {
    if (template.type === "single-photo-name") redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userImage, userName]);

  function redraw() {
    const canvas = canvasRef.current;
    const templateImg = templateImgRef.current;
    if (!canvas || !templateImg) return;

    if (template.type === "pets-arc") {
      drawComposition(canvas, petImages, templateImg, template, qrImgRef.current ?? undefined);
    } else {
      drawSinglePhotoNameComposition(canvas, userImage ?? null, userName, template, templateImg);
    }
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  );
}
