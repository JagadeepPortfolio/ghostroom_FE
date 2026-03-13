"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
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
  } = useSocket(roomId, username);

  // On mount, check localStorage for existing username or show modal
  useEffect(() => {
    const stored = localStorage.getItem("ghostroom_username");
    if (stored) {
      setUsername(stored);
    } else {
      setShowModal(true);
    }
  }, []);

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
