"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface UsernameModalProps {
  onSubmit: (username: string) => void;
  error?: string | null;
  checking?: boolean;
}

export default function UsernameModal({ onSubmit, error, checking }: UsernameModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed && trimmed.length <= 30) {
      onSubmit(trimmed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm safe-bottom">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-sm mx-4 mb-4 sm:mb-0 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Enter the Room</h2>
        <p className="text-white/60 text-sm mb-6">
          Choose a display name to get started.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name..."
            maxLength={30}
            autoFocus
            autoComplete="off"
            autoCapitalize="words"
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-base"
          />

          {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!name.trim() || checking}
            className="mt-4 w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all text-base"
          >
            {checking ? "Checking..." : "Join"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
