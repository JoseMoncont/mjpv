"use client";

import Image from "next/image";
import { templates, type Template } from "@/lib/templates";

interface TemplateSelectorProps {
  selected: Template;
  onSelect: (t: Template) => void;
}

export default function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  if (templates.length <= 1) return null;

  return (
    <div className="w-full flex flex-col gap-3">
      <p
        className="text-xs font-black uppercase tracking-widest"
        style={{
          color: "#F5A800",
          fontFamily: "var(--font-display), 'Barlow Condensed', sans-serif",
        }}
      >
        Elige tu marco
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
        {templates.map((t) => {
          const isActive = t.id === selected.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className="flex-shrink-0 relative transition-all duration-150 cursor-pointer"
              style={{
                width: 80,
                height: 80,
                outline: isActive ? "3px solid #F5A800" : "3px solid transparent",
                outlineOffset: 2,
                padding: 0,
                background: "none",
                border: "none",
              }}
              aria-label={t.name}
              aria-pressed={isActive}
            >
              <Image
                src={t.src ?? t.bgSrc ?? ""}
                alt={t.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
