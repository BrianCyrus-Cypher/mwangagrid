import { useState, useEffect, useRef } from "react";

export function useDelayedLoading(isLoading: boolean, minDurationMs = 1200) {
  const [showLoader, setShowLoader] = useState(false);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now();
      setShowLoader(true);
    } else if (showLoader && startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minDurationMs - elapsed);
      timerRef.current = setTimeout(() => setShowLoader(false), remaining);
    } else {
      setShowLoader(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoading, minDurationMs, showLoader]);

  return showLoader;
}
