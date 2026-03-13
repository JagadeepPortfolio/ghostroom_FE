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
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
    <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-white/10">
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
