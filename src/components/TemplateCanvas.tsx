"use client";

import { useEffect, useRef } from "react";
import {
  drawComposition,
  drawSinglePhotoNameComposition,
  chromaKeyBlackToAlpha,
} from "@/lib/canvasUtils";
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
  // pets-arc refs
  const templateImgRef = useRef<HTMLImageElement | null>(null);
  const qrImgRef = useRef<HTMLImageElement | null>(null);
  // single-photo-name refs
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  // HTMLCanvasElement after chromaKey processing (or null if using real alpha)
  const overlayRef = useRef<HTMLCanvasElement | null>(null);

  // Load assets whenever the template changes
  useEffect(() => {
    templateImgRef.current = null;
    bgImgRef.current = null;
    overlayRef.current = null;

    if (template.type === "pets-arc" && template.src) {
      const img = new Image();
      img.src = template.src;
      img.onload = () => {
        templateImgRef.current = img;
        redraw();
      };
    }

    if (template.type === "single-photo-name") {
      let bgReady = false;
      let overlayReady = false;

      if (template.bgSrc) {
        const bg = new Image();
        bg.src = template.bgSrc;
        bg.onload = () => {
          bgImgRef.current = bg;
          bgReady = true;
          if (overlayReady) redraw();
        };
      }

      if (template.overlaySrc) {
        const ov = new Image();
        ov.src = template.overlaySrc;
        ov.onload = () => {
          // Apply chroma key to convert black pixels to alpha.
          // If the overlay PNG is re-exported with real alpha transparency,
          // replace this line with: overlayRef.current = ov (as any)
          overlayRef.current = chromaKeyBlackToAlpha(ov);
          overlayReady = true;
          if (bgReady) redraw();
        };
      }
    }
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
    if (!canvas) return;

    if (template.type === "pets-arc") {
      const templateImg = templateImgRef.current;
      if (!templateImg) return;
      drawComposition(canvas, petImages, templateImg, template, qrImgRef.current ?? undefined);
    } else {
      const bg = bgImgRef.current;
      const overlay = overlayRef.current;
      if (!bg || !overlay) return;
      drawSinglePhotoNameComposition(
        canvas,
        userImage ?? null,
        userName,
        template,
        bg,
        overlay
      );
    }
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  );
}
