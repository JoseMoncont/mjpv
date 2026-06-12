"use client";

import { useCallback } from "react";
import { FileRejection, useDropzone } from "react-dropzone";

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED = { "image/jpeg": [], "image/png": [], "image/webp": [] };

interface UploadZoneProps {
  files: File[];
  onAdd: (incoming: File[]) => void;
  onRemove: (index: number) => void;
  maxFiles?: number;
}

export default function UploadZone({ files, onAdd, onRemove, maxFiles = 4 }: UploadZoneProps) {
  const remaining = maxFiles - files.length;

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        const code = rejected[0]?.errors[0]?.code;
        const msg =
          code === "file-too-large"
            ? "El archivo supera los 10 MB."
            : code === "too-many-files"
              ? `Máximo ${maxFiles} foto${maxFiles === 1 ? "" : "s"} en total.`
              : "Formato no admitido. Usa JPG, PNG o WebP.";
        alert(msg);
        return;
      }
      if (accepted.length > 0) onAdd(accepted);
    },
    [onAdd, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    maxFiles: remaining,
    multiple: maxFiles > 1,
    disabled: remaining <= 0,
  });

  const instructionText =
    maxFiles === 1
      ? "Sube 1 foto"
      : `Sube entre 1 y ${maxFiles} fotos`;

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Instruction */}
      <p
        className="text-center text-sm"
        style={{
          color: "rgba(255,255,255,0.7)",
          fontFamily: "var(--font-body), Nunito, sans-serif",
        }}
      >
        {instructionText}
        {files.length > 0 && (
          <span style={{ color: "#F5A800", fontWeight: 700 }}>
            {" "}— {files.length}/{maxFiles} subida{files.length === 1 ? "" : "s"}
          </span>
        )}
      </p>

      {/* Dropzone */}
      {remaining > 0 && (
        <div
          {...getRootProps()}
          className="flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors duration-150"
          style={{
            border: `2px dashed ${isDragActive ? "#ffffff" : "#F5A800"}`,
            backgroundColor: isDragActive ? "#1A1A8C" : "rgba(255,255,255,0.05)",
            padding: "2rem 1rem",
            minHeight: 140,
          }}
        >
          <input {...getInputProps()} />
          <svg
            width="36" height="36" viewBox="0 0 24 24"
            fill="none" stroke="#F5A800" strokeWidth="2" strokeLinecap="square"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p
            className="font-black uppercase text-center"
            style={{
              color: "#F5A800",
              fontFamily: "var(--font-display), 'Barlow Condensed', sans-serif",
              letterSpacing: "-0.02em",
              fontSize: "1.4rem",
            }}
          >
            {isDragActive ? "Suelta aquí" : "Arrastra o haz clic"}
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            JPG, PNG o WebP — máx. 10 MB por foto
          </p>
        </div>
      )}

      {/* Thumbnails */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center">
          {files.map((file, i) => {
            const url = URL.createObjectURL(file);
            return (
              <div key={i} className="relative" style={{ width: 80, height: 80 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Foto ${i + 1}`}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "3px solid #F5A800",
                    display: "block",
                  }}
                />
                <button
                  onClick={() => onRemove(i)}
                  className="absolute flex items-center justify-center cursor-pointer"
                  style={{
                    top: -4,
                    right: -4,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    backgroundColor: "#E8401C",
                    border: "2px solid #ffffff",
                    color: "#ffffff",
                    fontWeight: 900,
                    fontSize: "0.65rem",
                    lineHeight: 1,
                    padding: 0,
                  }}
                  aria-label={`Eliminar foto ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
