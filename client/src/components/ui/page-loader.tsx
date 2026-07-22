import { AnimatedLogoLoader } from "./AnimatedLogoLoader";

export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return <AnimatedLogoLoader text={text} />;
}
