"use client";

import { useEffect, useState } from "react";
import { canvasToBlob } from "@/lib/canvasUtils";

interface ActionButtonsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  disabled: boolean;
}

export default function ActionButtons({ canvasRef, disabled }: ActionButtonsProps) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(
      typeof navigator !== "undefined" &&
        "share" in navigator &&
        typeof navigator.canShare === "function"
    );
  }, []);

  async function getBlob(): Promise<Blob | null> {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    try {
      return await canvasToBlob(canvas);
    } catch {
      return null;
    }
  }

  const handleDownload = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "me-la-juego-por-la-vida.png";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const file = new File([blob], "me-la-juego-por-la-vida.png", { type: "image/png" });
    const shareData: ShareData = {
      title: "Me la juego por la vida",
      text: "¡Me uno a la campaña! #MeLaJuegoPorLaVida",
      files: [file],
    };
    if (navigator.canShare(shareData)) {
      await navigator.share(shareData);
    }
  };

  const btnBase: React.CSSProperties = {
    fontFamily: "var(--font-display), 'Barlow Condensed', sans-serif",
    fontWeight: 900,
    fontSize: "1.125rem",
    letterSpacing: "-0.02em",
    textTransform: "uppercase",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    padding: "0.875rem 2.5rem",
    transition: "opacity 0.15s",
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <button
        onClick={handleDownload}
        disabled={disabled}
        style={{
          ...btnBase,
          backgroundColor: "#F5A800",
          color: "#1A1A8C",
          flex: 1,
        }}
      >
        DESCARGAR
      </button>

      {canShare && (
        <button
          onClick={handleShare}
          disabled={disabled}
          style={{
            ...btnBase,
            backgroundColor: "#2D2EE0",
            color: "#ffffff",
            border: "2px solid #ffffff",
            flex: 1,
          }}
        >
          COMPARTIR
        </button>
      )}
    </div>
  );
}
