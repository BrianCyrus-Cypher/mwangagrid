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
        viewBox="0 0 48 52"
        width={s.icon}
        height={s.icon}
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm flex-shrink-0"
      >
        <defs>
          <clipPath id="shieldClip">
            <path d="M24 8 L42 17 L40 37 C38 44 24 48 24 48 C24 48 10 44 8 37 L6 17 Z" />
          </clipPath>
        </defs>

        {/* Solar rays — light/energy */}
        <line
          x1="24"
          y1="0"
          x2="24"
          y2="6"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <line
          x1="15"
          y1="1.5"
          x2="17.5"
          y2="6"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.55"
        />
        <line
          x1="33"
          y1="1.5"
          x2="30.5"
          y2="6"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.55"
        />
        <line
          x1="9"
          y1="5"
          x2="11.5"
          y2="8.5"
          stroke="var(--primary)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.35"
        />
        <line
          x1="39"
          y1="5"
          x2="36.5"
          y2="8.5"
          stroke="var(--primary)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Shield body — security */}
        <path
          d="M24 8 L42 17 L40 37 C38 44 24 48 24 48 C24 48 10 44 8 37 L6 17 Z"
          fill="var(--primary)"
        />

        {/* Grid lines — network/connectivity */}
        <g clipPath="url(#shieldClip)">
          <line
            x1="6"
            y1="22"
            x2="42"
            y2="22"
            stroke="white"
            strokeWidth="0.7"
            opacity="0.15"
          />
          <line
            x1="6"
            y1="30"
            x2="42"
            y2="30"
            stroke="white"
            strokeWidth="0.7"
            opacity="0.12"
          />
          <line
            x1="6"
            y1="38"
            x2="42"
            y2="38"
            stroke="white"
            strokeWidth="0.7"
            opacity="0.08"
          />
          <line
            x1="16"
            y1="17"
            x2="16"
            y2="46"
            stroke="white"
            strokeWidth="0.7"
            opacity="0.15"
          />
          <line
            x1="24"
            y1="17"
            x2="24"
            y2="46"
            stroke="white"
            strokeWidth="0.7"
            opacity="0.12"
          />
          <line
            x1="32"
            y1="17"
            x2="32"
            y2="46"
            stroke="white"
            strokeWidth="0.7"
            opacity="0.15"
          />
        </g>

        {/* Connection node — central hub */}
        <circle cx="24" cy="30" r="2.5" fill="var(--accent)" opacity="0.7" />
        <circle
          cx="24"
          cy="30"
          r="4"
          stroke="var(--accent)"
          strokeWidth="0.6"
          fill="none"
          opacity="0.35"
        />

        {/* Shield outline */}
        <path
          d="M24 8 L42 17 L40 37 C38 44 24 48 24 48 C24 48 10 44 8 37 L6 17 Z"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="0.8"
          opacity="0.3"
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
