interface LogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { emblem: 36, text: "text-sm", tagline: "text-[9px]", gap: "gap-2" },
  md: { emblem: 48, text: "text-base", tagline: "text-[10px]", gap: "gap-2.5" },
  lg: { emblem: 56, text: "text-lg", tagline: "text-[11px]", gap: "gap-3" },
};

export function Logo({ showTagline = true, size = "md" }: LogoProps) {
  const s = sizes[size];
  const half = s.emblem / 2;

  return (
    <div className={`flex items-center ${s.gap}`}>
      {/* Emblem */}
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: s.emblem, height: s.emblem }}
      >
        <svg width={s.emblem} height={s.emblem} viewBox="0 0 48 48" fill="none">
          {/* Background circle */}
          <circle cx="24" cy="24" r="23" fill="#1E2B38" />
          <circle
            cx="24"
            cy="24"
            r="21"
            stroke="#3B82F6"
            strokeWidth="1.5"
            opacity="0.6"
          />

          {/* Sun (solar) — center */}
          <circle cx="24" cy="24" r="7" fill="#3B82F6" opacity="0.9" />
          {/* Sun rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
            <line
              key={angle}
              x1="24"
              y1="13"
              x2="24"
              y2="16"
              stroke="#3B82F6"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.7"
              transform={`rotate(${angle} 24 24)`}
            />
          ))}

          {/* Signal arcs (network) — bottom-right */}
          <path
            d="M30 31a5 5 0 018 0"
            stroke="#4A6373"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M27 35a8 8 0 0114 0"
            stroke="#7B9A99"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />

          {/* Camera lens (surveillance) — bottom-left */}
          <circle
            cx="17"
            cy="31"
            r="5"
            stroke="#7B9A99"
            strokeWidth="1.5"
            fill="none"
            opacity="0.8"
          />
          <circle cx="17" cy="31" r="2.5" fill="#7B9A99" opacity="0.5" />
          <rect
            x="12"
            y="27"
            width="10"
            height="8"
            rx="2"
            stroke="#7B9A99"
            strokeWidth="1.2"
            fill="none"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Text */}
      <div className="leading-none">
        <div
          className={`font-heading font-extrabold tracking-tight text-foreground ${s.text}`}
        >
          MWANGA <span className="text-gold">GRID</span>
        </div>
        {showTagline && (
          <div
            className={`${s.tagline} tracking-wider text-accent font-medium mt-0.5`}
          >
            empower · connect · secure
          </div>
        )}
      </div>
    </div>
  );
}
