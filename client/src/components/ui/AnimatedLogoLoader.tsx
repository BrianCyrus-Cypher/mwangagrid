import { useEffect, useState } from "react";

const SUN_EMBLEM = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <path d="M100 20 L170 60 L170 140 L100 180 L30 140 L30 60 Z" fill="#1E3A8A" stroke="#60A5FA" stroke-width="8"/>
  <circle cx="100" cy="100" r="35" fill="none" stroke="white" stroke-width="6" opacity="0.3"/>
  <circle cx="100" cy="100" r="15" fill="white" />
  <g stroke="white" stroke-width="5" stroke-linecap="round">
    <line x1="100" y1="65" x2="100" y2="40" />
    <line x1="100" y1="135" x2="100" y2="160" />
    <line x1="65" y1="100" x2="40" y2="100" />
    <line x1="135" y1="100" x2="160" y2="100" />
  </g>
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
