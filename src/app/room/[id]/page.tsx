"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useSocket } from "@/hooks/use-socket";
import UsernameModal from "@/components/username-modal";
import ChatArea from "@/components/chat-area";
import MessageInput from "@/components/message-input";
import TypingIndicator from "@/components/typing-indicator";
import OnlineUsers from "@/components/online-users";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  const [username, setUsername] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalChecking, setModalChecking] = useState(false);
  const [roomExists, setRoomExists] = useState<boolean | null>(null);

  const {
    connected,
    joined,
    joinError,
    messages,
    onlineUsers,
    typingUsers,
    rateLimited,
    sendMessage,
    markRead,
    emitTypingStart,
    emitTypingStop,
    removeMessage,
    checkUsername,
    checkRoom,
  } = useSocket(roomId, username);

  // Check if room exists
  useEffect(() => {
    checkRoom().then((exists) => {
      setRoomExists(exists);
      if (exists) {
        // Check localStorage for existing username
        const stored = localStorage.getItem("ghostroom_username");
        if (stored) {
          setUsername(stored);
        } else {
          setShowModal(true);
        }
      }
    });
  }, [checkRoom]);

  // Handle join errors (e.g., username taken from localStorage)
  useEffect(() => {
    if (joinError) {
      setUsername(null);
      localStorage.removeItem("ghostroom_username");
      setModalError(joinError);
      setShowModal(true);
    }
  }, [joinError]);

  const handleUsernameSubmit = useCallback(
    async (name: string) => {
      setModalChecking(true);
      setModalError(null);

      const available = await checkUsername(name);
      if (!available) {
        setModalError("Name already taken in this room.");
        setModalChecking(false);
        return;
      }

      localStorage.setItem("ghostroom_username", name);
      setUsername(name);
      setShowModal(false);
      setModalChecking(false);
    },
    [checkUsername]
  );

  // Room not found
  if (roomExists === false) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-3">Room Not Found</h1>
          <p className="text-white/40 mb-6">This room doesn&apos;t exist or has been dissolved.</p>
          <a
            href="/"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all"
          >
            Create a New Room
          </a>
        </motion.div>
      </div>
    );
  }

  // Loading
  if (roomExists === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-white/40">Connecting...</div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col">
      {/* Username Modal */}
      {showModal && (
        <UsernameModal
          onSubmit={handleUsernameSubmit}
          error={modalError}
          checking={modalChecking}
        />
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white">
            Ghost<span className="text-purple-400">Room</span>
          </h1>
          <span className="text-white/30 text-xs font-mono">/{roomId}</span>
        </div>
        <OnlineUsers users={onlineUsers} />
      </header>

      {/* Connection status */}
      {username && !connected && (
        <div className="px-4 py-2 bg-red-500/20 text-red-300 text-xs text-center">
          Disconnected. Reconnecting...
        </div>
      )}

      {/* Chat */}
      {username && joined ? (
        <>
          <ChatArea
            messages={messages}
            currentUser={username}
            onRead={markRead}
            onBurned={removeMessage}
          />

          <TypingIndicator users={typingUsers} currentUser={username} />

          <MessageInput
            onSend={sendMessage}
            onTypingStart={emitTypingStart}
            onTypingStop={emitTypingStop}
            onlineUsers={onlineUsers}
            rateLimited={rateLimited}
          />
        </>
      ) : username && !joined ? (
        <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
          Joining room...
        </div>
      ) : null}
    </div>
  );
}
