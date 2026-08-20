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
        className="drop-shadow-md flex-shrink-0"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Hexagonal Shield — Security */}
        <path 
          d="M100 20 L170 60 L170 140 L100 180 L30 140 L30 60 Z" 
          fill="url(#shieldGrad)" 
          stroke="var(--gold)" 
          strokeWidth="4" 
          opacity="0.9"
        />
        
        {/* Glow Effect — Solar Energy */}
        <circle cx="100" cy="100" r="50" fill="url(#glowGrad)" />

        {/* Network Grid — Connectivity */}
        <g stroke="white" strokeWidth="1.5" opacity="0.3">
          <circle cx="100" cy="100" r="40" fill="none" />
          <circle cx="100" cy="100" r="25" fill="none" />
          <line x1="100" y1="60" x2="100" y2="140" />
          <line x1="60" y1="100" x2="140" y2="100" />
          <line x1="71.7" y1="71.7" x2="128.3" y2="128.3" />
          <line x1="71.7" y1="128.3" x2="128.3" y2="71.7" />
        </g>

        {/* Connection Nodes */}
        <g fill="var(--gold)">
          <circle cx="100" cy="100" r="6" />
          <circle cx="100" cy="60" r="3" />
          <circle cx="100" cy="140" r="3" />
          <circle cx="60" cy="100" r="3" />
          <circle cx="140" cy="100" r="3" />
          <circle cx="71.7" cy="71.7" r="3" />
          <circle cx="128.3" cy="128.3" r="3" />
          <circle cx="71.7" cy="128.3" r="3" />
          <circle cx="128.3" cy="71.7" r="3" />
        </g>

        {/* Solar Rays — Top Accents */}
        <g stroke="var(--gold)" strokeWidth="3" strokeLinecap="round">
          <line x1="100" y1="35" x2="100" y2="25" />
          <line x1="85" y1="38" x2="80" y2="30" />
          <line x1="115" y1="38" x2="120" y2="30" />
        </g>
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
