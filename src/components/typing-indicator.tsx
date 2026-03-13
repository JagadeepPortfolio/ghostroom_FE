"use client";

import { motion, AnimatePresence } from "framer-motion";

interface TypingIndicatorProps {
  users: string[];
  currentUser: string;
}

export default function TypingIndicator({ users, currentUser }: TypingIndicatorProps) {
  const others = users.filter((u) => u !== currentUser);

  if (others.length === 0) return null;

  const text =
    others.length === 1
      ? `${others[0]} is typing...`
      : `${others.join(", ")} are typing...`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="px-4 py-1 text-white/40 text-xs italic"
      >
        {text}
      </motion.div>
    </AnimatePresence>
  );
}
