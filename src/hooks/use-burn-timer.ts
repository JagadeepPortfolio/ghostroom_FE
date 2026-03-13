"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const BURN_DURATION = 10;

interface BurnTimer {
  secondsLeft: number;
  burning: boolean;
  startBurn: (readTimestamp: number) => void;
}

export function useBurnTimer(onBurn: () => void): BurnTimer {
  const [secondsLeft, setSecondsLeft] = useState(BURN_DURATION);
  const [active, setActive] = useState(false);
  const [burning, setBurning] = useState(false);
  const readAtRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const burnedRef = useRef(false);

  const recalculate = useCallback(() => {
    if (!readAtRef.current || burnedRef.current) return;

    const elapsed = (Date.now() - readAtRef.current) / 1000;
    const remaining = Math.ceil(BURN_DURATION - elapsed);

    if (remaining <= 0) {
      setSecondsLeft(0);
      setBurning(true);
      burnedRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTimeout(onBurn, 1000);
    } else {
      setSecondsLeft(remaining);
    }
  }, [onBurn]);

  const startBurn = useCallback(
    (readTimestamp: number) => {
      if (active || burnedRef.current) return;
      readAtRef.current = readTimestamp;
      setActive(true);

      // Immediate calculation
      const elapsed = (Date.now() - readTimestamp) / 1000;
      const remaining = Math.ceil(BURN_DURATION - elapsed);

      if (remaining <= 0) {
        setSecondsLeft(0);
        setBurning(true);
        burnedRef.current = true;
        setTimeout(onBurn, 1000);
        return;
      }

      setSecondsLeft(remaining);
    },
    [active, onBurn]
  );

  // Tick interval — recalculates from server timestamp each tick
  useEffect(() => {
    if (!active || burnedRef.current) return;

    intervalRef.current = setInterval(recalculate, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, recalculate]);

  // Recalculate on tab refocus
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && active) {
        recalculate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [active, recalculate]);

  return { secondsLeft, burning, startBurn };
}
