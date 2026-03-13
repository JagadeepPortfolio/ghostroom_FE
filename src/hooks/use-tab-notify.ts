"use client";

import { useEffect, useRef, useCallback } from "react";

export function useTabNotify() {
  const unreadCount = useRef(0);
  const originalTitle = useRef("GhostRoom");

  const addUnread = useCallback(() => {
    if (document.visibilityState === "hidden") {
      unreadCount.current += 1;
      document.title = `(${unreadCount.current}) GhostRoom`;
    }
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        unreadCount.current = 0;
        document.title = originalTitle.current;
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return { addUnread };
}
