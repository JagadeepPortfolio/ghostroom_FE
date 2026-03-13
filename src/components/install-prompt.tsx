"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Don't show if already dismissed
    if (localStorage.getItem("ghostroom_install_dismissed")) return;

    // iOS detection
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isIOSDevice && isSafari) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    // Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("ghostroom_install_dismissed", "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-50 p-4 rounded-2xl bg-purple-900/90 backdrop-blur-xl border border-purple-400/20 shadow-2xl sm:left-auto sm:right-4 sm:max-w-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">
                {isIOS ? "Install GhostRoom" : "Add to Home Screen"}
              </p>
              <p className="text-white/50 text-xs mt-1">
                {isIOS
                  ? "Tap the Share button, then 'Add to Home Screen'"
                  : "Install for quick access and app-like experience"}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/40 hover:text-white/60 text-lg leading-none"
            >
              ×
            </button>
          </div>

          {!isIOS && (
            <button
              onClick={handleInstall}
              className="mt-3 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all"
            >
              Install App
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
