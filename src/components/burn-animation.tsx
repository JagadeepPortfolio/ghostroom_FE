"use client";

import { motion } from "framer-motion";

export default function BurnAnimation() {
  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 0, scale: 1.5, y: -20 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="flex items-center justify-center gap-1 text-2xl pointer-events-none"
    >
      <span>🔥</span>
      <span>💨</span>
      <span>🔥</span>
    </motion.div>
  );
}
