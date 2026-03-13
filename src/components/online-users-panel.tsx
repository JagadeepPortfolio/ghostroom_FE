"use client";

import { motion, AnimatePresence } from "framer-motion";

interface OnlineUsersPanelProps {
  users: string[];
  open: boolean;
  onClose: () => void;
}

export default function OnlineUsersPanel({
  users,
  open,
  onClose,
}: OnlineUsersPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 right-2 z-50 w-56 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-3 safe-top"
          >
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 px-1">
              Online ({users.length})
            </p>
            <div className="space-y-1">
              {users.map((user) => (
                <div
                  key={user}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                >
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                  <span className="text-white text-sm truncate">{user}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
