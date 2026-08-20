import { MwangaLogo } from "./MwangaLogo";

interface LogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  light?: boolean;
}

export function Logo({ 
  showTagline = true, 
  size = "md", 
  className = "",
  light = false 
}: LogoProps) {
  return (
    <MwangaLogo 
      size={size} 
      showWordmark={true} 
      className={className}
      light={light}
    />
  );
}
