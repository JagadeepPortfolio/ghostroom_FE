"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import MentionPopup from "./mention-popup";

interface MessageInputProps {
  onSend: (text: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  onlineUsers: string[];
  rateLimited: boolean;
}

export default function MessageInput({
  onSend,
  onTypingStart,
  onTypingStop,
  onlineUsers,
  rateLimited,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const typingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    setShowMentions(false);
    onTypingStop();
    typingRef.current = false;
  }, [text, onSend, onTypingStop]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);

    // Typing indicator
    if (!typingRef.current) {
      typingRef.current = true;
      onTypingStart();
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      typingRef.current = false;
      onTypingStop();
    }, 3000);

    // Mention detection
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const afterAt = value.slice(lastAtIndex + 1);
      // Only show if no space after @
      if (!afterAt.includes(" ")) {
        setShowMentions(true);
        setMentionFilter(afterAt);
        return;
      }
    }
    setShowMentions(false);
  };

  const handleMentionSelect = (username: string) => {
    const lastAtIndex = text.lastIndexOf("@");
    const newText = text.slice(0, lastAtIndex) + `@${username} `;
    setText(newText);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <div className="relative px-4 py-3 border-t border-white/10">
      <AnimatePresence>
        {showMentions && (
          <MentionPopup
            users={onlineUsers}
            filter={mentionFilter}
            onSelect={handleMentionSelect}
          />
        )}
      </AnimatePresence>

      {rateLimited && (
        <div className="absolute -top-8 left-4 text-red-400 text-xs font-medium">
          Slow down.
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          maxLength={2000}
          className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all text-sm"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
        >
          Send
        </button>
      </div>
    </div>
  );
}
