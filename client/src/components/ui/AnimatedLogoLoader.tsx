import { useEffect, useState } from "react";

const SUN_EMBLEM = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
  <circle cx="24" cy="24" r="22" fill="#0F172A" stroke="#3B82F6" stroke-width="2"/>
  <circle cx="24" cy="24" r="8" fill="#60A5FA"/>
  <g stroke="#60A5FA" stroke-width="2" stroke-linecap="round">
    <line x1="24" y1="4" x2="24" y2="12"/>
    <line x1="24" y1="36" x2="24" y2="44"/>
    <line x1="4" y1="24" x2="12" y2="24"/>
    <line x1="36" y1="24" x2="44" y2="24"/>
    <line x1="9.86" y1="9.86" x2="15.52" y2="15.52"/>
    <line x1="32.48" y1="32.48" x2="38.14" y2="38.14"/>
    <line x1="9.86" y1="38.14" x2="15.52" y2="32.48"/>
    <line x1="32.48" y1="15.52" x2="38.14" y2="9.86"/>
  </g>
  <path d="M14 29 Q18 35 24 35 Q30 35 34 29" stroke="#3B82F6" stroke-width="1.5" fill="none"/>
  <circle cx="18" cy="19" r="2" fill="#3B82F6"/>
  <circle cx="30" cy="19" r="2" fill="#3B82F6"/>
</svg>`;

export function AnimatedLogoLoader({ text = "Loading..." }: { text?: string }) {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowText(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full bg-accent/5 animate-ping"
          style={{ animationDuration: "2s" }}
        />
        <div
          className="relative w-16 h-16 animate-[spin_3s_linear_infinite]"
          style={{ filter: "drop-shadow(0 0 20px oklch(0.62 0.22 255 / 0.3))" }}
          dangerouslySetInnerHTML={{ __html: SUN_EMBLEM }}
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-accent/20 animate-[spin_2s_linear_infinite]"
          style={{ animationDirection: "reverse" }}
        />
      </div>
      <div
        className={`mt-8 transition-all duration-700 ease-out ${showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <p className="text-foreground/60 text-sm tracking-wider uppercase font-heading">
          {text}
        </p>
        <div className="mt-3 flex justify-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full bg-accent animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-accent/70 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-accent/40 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
