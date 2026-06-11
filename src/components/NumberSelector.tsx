"use client";

interface NumberSelectorProps {
  value: number;
  onChange: (n: number) => void;
  max?: number;
}

export default function NumberSelector({
  value,
  onChange,
  max = 5,
}: NumberSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p
        className="text-xs font-black uppercase tracking-widest"
        style={{
          color: "#F5A800",
          fontFamily: "var(--font-display), 'Barlow Condensed', sans-serif",
        }}
      >
        ¿Cuántas mascotas quieres agregar?
      </p>
      <div
        className="flex gap-1 p-1"
        style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        role="group"
        aria-label="Número de mascotas"
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className="w-11 h-11 font-black text-base transition-all duration-150 cursor-pointer"
            style={
              value === n
                ? {
                    backgroundColor: "#F5A800",
                    color: "#1A1A8C",
                    fontFamily: "var(--font-display), 'Barlow Condensed', sans-serif",
                  }
                : {
                    backgroundColor: "transparent",
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: "var(--font-display), 'Barlow Condensed', sans-serif",
                  }
            }
            aria-pressed={value === n}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
