"use client";

import { useEffect, useRef } from "react";
import { drawComposition, drawSinglePhotoNameComposition } from "@/lib/canvasUtils";
import type { Template } from "@/lib/templates";

interface TemplateCanvasProps {
  template: Template;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  petImages?: HTMLImageElement[];
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
  const templateImgRef = useRef<HTMLImageElement | null>(null); // src (overlay for type-02)
  const bgImgRef = useRef<HTMLImageElement | null>(null);       // bgSrc (background for type-02)
  const qrImgRef = useRef<HTMLImageElement | null>(null);

  // Keep latest props in refs so async callbacks always read current values
  const petImagesRef = useRef(petImages);
  const userImageRef = useRef(userImage);
  const userNameRef = useRef(userName);
  petImagesRef.current = petImages;
  userImageRef.current = userImage;
  userNameRef.current = userName;

  function redraw() {
    const canvas = canvasRef.current;
    const templateImg = templateImgRef.current;
    if (!canvas || !templateImg) return;

    if (template.type === "pets-arc") {
      drawComposition(canvas, petImagesRef.current, templateImg, template, qrImgRef.current ?? undefined);
    } else {
      drawSinglePhotoNameComposition(
        canvas,
        userImageRef.current ?? null,
        userNameRef.current,
        template,
        templateImg,
        bgImgRef.current ?? undefined
      );
    }
  }

  // Load template assets when template changes
  useEffect(() => {
    templateImgRef.current = null;
    bgImgRef.current = null;

    let overlayReady = false;
    let bgReady = !template.bgSrc; // no bgSrc means bg is not needed

    const overlay = new Image();
    overlay.src = template.src;
    overlay.onload = () => {
      templateImgRef.current = overlay;
      overlayReady = true;
      if (bgReady) redraw();
    };

    if (template.bgSrc) {
      const bg = new Image();
      bg.src = template.bgSrc;
      bg.onload = () => {
        bgImgRef.current = bg;
        bgReady = true;
        if (overlayReady) redraw();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.id]);

  // Load QR code (pets-arc only)
  useEffect(() => {
    if (!template.qrCode) { qrImgRef.current = null; return; }
    const img = new Image();
    img.src = template.qrCode.src;
    img.onload = () => { qrImgRef.current = img; redraw(); };
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

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  );
}
