"use client";

import { motion } from "framer-motion";

interface MentionPopupProps {
  users: string[];
  filter: string;
  onSelect: (username: string) => void;
}

export default function MentionPopup({
  users,
  filter,
  onSelect,
}: MentionPopupProps) {
  const filtered = users.filter((u) =>
    u.toLowerCase().startsWith(filter.toLowerCase())
  );

  if (filtered.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-full left-0 right-0 sm:right-auto sm:w-48 mb-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden shadow-xl"
    >
      {filtered.map((user) => (
        <button
          key={user}
          onClick={() => onSelect(user)}
          className="w-full px-4 py-2.5 sm:py-2 text-left text-white hover:bg-white/10 active:bg-white/20 transition-colors text-sm"
        >
          @{user}
        </button>
      ))}
    </motion.div>
  );
}
