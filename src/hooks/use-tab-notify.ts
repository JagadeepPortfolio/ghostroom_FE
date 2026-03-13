"use client";

import { useEffect, useRef, useCallback } from "react";

export function useTabNotify() {
  const unreadCount = useRef(0);

  const addUnread = useCallback(() => {
    if (document.visibilityState === "hidden") {
      unreadCount.current += 1;
      document.title = `(${unreadCount.current}) GhostRoom`;

      // Android PWA badge
      if ("setAppBadge" in navigator) {
        (navigator as unknown as { setAppBadge: (n: number) => void }).setAppBadge(
          unreadCount.current
        );
      }
    }
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        unreadCount.current = 0;
        document.title = "GhostRoom";

        // Clear Android PWA badge
        if ("clearAppBadge" in navigator) {
          (navigator as unknown as { clearAppBadge: () => void }).clearAppBadge();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return { addUnread };
}
