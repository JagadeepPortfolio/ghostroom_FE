"use client";

import { useEffect, useCallback, useRef, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "@/types";
import { useBurnTimer } from "@/hooks/use-burn-timer";
import BurnAnimation from "./burn-animation";

interface MessageBubbleProps {
  message: Message;
  currentUser: string;
  onRead: (messageId: string) => void;
  onBurned: (messageId: string) => void;
}

function renderTextWithMentions(text: string) {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span key={i} className="text-purple-300 font-semibold">
          {part}
        </span>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function MessageBubble({
  message,
  currentUser,
  onRead,
  onBurned,
}: MessageBubbleProps) {
  const isSender = message.sender === currentUser;
  const hasRead = !!message.readBy[currentUser];
  const hasMarkedRead = useRef(false);

  const handleBurn = useCallback(() => {
    onBurned(message.id);
  }, [message.id, onBurned]);

  const { secondsLeft, burning, startBurn } = useBurnTimer(handleBurn);

  // Mark as read when visible (non-sender only)
  useEffect(() => {
    if (!isSender && !hasRead && !hasMarkedRead.current) {
      hasMarkedRead.current = true;
      onRead(message.id);
    }
  }, [isSender, hasRead, message.id, onRead]);

  // Start burn timer once we've read it
  useEffect(() => {
    if (hasRead) {
      startBurn();
    }
  }, [hasRead, startBurn]);

  return (
    <AnimatePresence mode="wait">
      {burning ? (
        <motion.div key={`burn-${message.id}`} className="flex justify-center py-2">
          <BurnAnimation />
        </motion.div>
      ) : (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3`}
        >
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
              isSender
                ? "bg-purple-600/40 backdrop-blur-md border border-purple-400/20"
                : "bg-white/10 backdrop-blur-md border border-white/10"
            }`}
          >
            {!isSender && (
              <p className="text-xs font-semibold text-purple-300 mb-1">
                {message.sender}
              </p>
            )}

            <p className="text-white text-sm leading-relaxed">
              {renderTextWithMentions(message.text)}
            </p>

            {hasRead && secondsLeft > 0 && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-white/40">
                <span>💣</span>
                <span>{secondsLeft}s</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
