"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const BURN_DURATION = 10;

interface BurnTimer {
  secondsLeft: number;
  burning: boolean;
  startBurn: () => void;
}

export function useBurnTimer(onBurn: () => void): BurnTimer {
  const [secondsLeft, setSecondsLeft] = useState(BURN_DURATION);
  const [active, setActive] = useState(false);
  const [burning, setBurning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startBurn = useCallback(() => {
    if (active) return;
    setActive(true);
    setSecondsLeft(BURN_DURATION);
  }, [active]);

  useEffect(() => {
    if (!active) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setBurning(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          // Delay removal to allow animation
          setTimeout(onBurn, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, onBurn]);

  return { secondsLeft, burning, startBurn };
}
