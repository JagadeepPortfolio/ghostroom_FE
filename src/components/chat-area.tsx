"use client";

import { useEffect, useRef, useCallback } from "react";
import { Message } from "@/types";
import MessageBubble from "./message-bubble";

interface ChatAreaProps {
  messages: Message[];
  currentUser: string;
  onRead: (messageId: string) => void;
  onBurned: (messageId: string) => void;
}

export default function ChatArea({
  messages,
  currentUser,
  onRead,
  onBurned,
}: ChatAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  // Track if user is near the bottom
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const threshold = 100;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    isNearBottomRef.current = distanceFromBottom < threshold;
  }, []);

  // Auto-scroll only if user is near bottom
  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const handleRead = useCallback(
    (messageId: string) => {
      onRead(messageId);
    },
    [onRead]
  );

  const handleBurned = useCallback(
    (messageId: string) => {
      onBurned(messageId);
    },
    [onBurned]
  );

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-white/10"
    >
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-white/20 text-sm">
          No messages yet. Start the conversation.
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          currentUser={currentUser}
          onRead={handleRead}
          onBurned={handleBurned}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
