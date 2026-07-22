import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{
          type: "tween" as const,
          ease: [0.25, 0.46, 0.45, 0.94],
          duration: 0.25,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
