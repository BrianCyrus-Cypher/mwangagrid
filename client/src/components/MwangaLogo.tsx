interface MwangaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
  light?: boolean;
}

const SIZES = {
  sm: { icon: 28, wordmark: "text-sm" },
  md: { icon: 36, wordmark: "text-base" },
  lg: { icon: 48, wordmark: "text-xl" },
  xl: { icon: 64, wordmark: "text-3xl" },
} as const;

export function MwangaLogo({
  size = "md",
  showWordmark = true,
  className = "",
  light = false,
}: MwangaLogoProps) {
  const s = SIZES[size];
  const textColor = light ? "text-white" : "text-foreground";
  const subColor = light ? "text-white/50" : "text-muted-foreground";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 200 200"
        width={s.icon}
        height={s.icon}
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm flex-shrink-0"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>

        {/* 1. Security: The Hexagonal Shield */}
        <path 
          d="M100 20 L170 60 L170 140 L100 180 L30 140 L30 60 Z" 
          fill="url(#shieldGrad)" 
        />
        
        {/* 2. Solar: Solar Panel Grid Overlay */}
        <g stroke="white" strokeWidth="2" opacity="0.2">
          <line x1="30" y1="80" x2="170" y2="80" />
          <line x1="30" y1="100" x2="170" y2="100" />
          <line x1="30" y1="120" x2="170" y2="120" />
          <line x1="70" y1="43" x2="70" y2="163" />
          <line x1="100" y1="20" x2="100" y2="180" />
          <line x1="130" y1="43" x2="130" y2="163" />
        </g>

        {/* 3. Network & Solar: The Central Core */}
        <circle cx="100" cy="100" r="35" fill="none" stroke="var(--gold)" strokeWidth="8" />
        <circle cx="100" cy="100" r="15" fill="white" />
        
        {/* Connections / Sun Rays */}
        <g stroke="white" strokeWidth="5" strokeLinecap="round">
          <line x1="100" y1="65" x2="100" y2="40" />
          <line x1="100" y1="135" x2="100" y2="160" />
          <line x1="65" y1="100" x2="40" y2="100" />
          <line x1="135" y1="100" x2="160" y2="100" />
          
          {/* Diagonal Nodes */}
          <circle cx="55" cy="55" r="5" fill="white" />
          <circle cx="145" cy="55" r="5" fill="white" />
          <circle cx="55" cy="145" r="5" fill="white" />
          <circle cx="145" cy="145" r="5" fill="white" />
        </g>

        {/* Premium Border Overlay */}
        <path 
          d="M100 20 L170 60 L170 140 L100 180 L30 140 L30 60 Z" 
          stroke="white" strokeWidth="4" strokeOpacity="0.2" fill="none" 
        />
      </svg>

      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-heading font-extrabold tracking-tight ${s.wordmark} ${textColor}`}
          >
            MWANGA
          </span>
          <span
            className={`font-heading font-light tracking-[0.25em] ${s.wordmark === "text-3xl" ? "text-lg" : s.wordmark === "text-xl" ? "text-sm" : "text-[0.65em]"} ${subColor}`}
          >
            GRID
          </span>
        </div>
      )}
    </div>
  );
}
