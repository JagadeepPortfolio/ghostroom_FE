"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@/types";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

function getSessionId(): string {
  let sessionId = localStorage.getItem("ghostroom_session_id");
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("ghostroom_session_id", sessionId);
  }
  return sessionId;
}

export function useSocket(roomId: string, username: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [rateLimited, setRateLimited] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    if (!username) return;

    const sessionId = getSessionId();
    sessionIdRef.current = sessionId;

    const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);

      // Join the room with sessionId
      socket.emit(
        "join_room",
        { roomId, username, sessionId },
        (res: { success: boolean; error?: string }) => {
          if (res.success) {
            setJoined(true);
            setJoinError(null);
          } else {
            setJoinError(res.error || "Failed to join room");
          }
        }
      );
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setJoined(false);
    });

    // Existing messages on rejoin
    socket.on("existing_messages", (msgs: Message[]) => {
      setMessages(msgs);
    });

    socket.on("room_users", (users: string[]) => {
      setOnlineUsers(users);
    });

    socket.on("new_message", (message: Message) => {
      setMessages((prev) => {
        // Avoid duplicates (in case of reconnect race)
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    socket.on(
      "message_read_ack",
      ({
        messageId,
        readBy,
      }: {
        messageId: string;
        readBy: Record<string, number>;
      }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, readBy } : msg
          )
        );
      }
    );

    socket.on(
      "user_typing",
      ({ username: typingUser }: { username: string }) => {
        setTypingUsers((prev) =>
          prev.includes(typingUser) ? prev : [...prev, typingUser]
        );

        if (typingTimeoutRef.current[typingUser]) {
          clearTimeout(typingTimeoutRef.current[typingUser]);
        }
        typingTimeoutRef.current[typingUser] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== typingUser));
        }, 3000);
      }
    );

    socket.on(
      "user_stop_typing",
      ({ username: typingUser }: { username: string }) => {
        setTypingUsers((prev) => prev.filter((u) => u !== typingUser));
        if (typingTimeoutRef.current[typingUser]) {
          clearTimeout(typingTimeoutRef.current[typingUser]);
        }
      }
    );

    socket.on("rate_limited", () => {
      setRateLimited(true);
      setTimeout(() => setRateLimited(false), 3000);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    };
  }, [roomId, username]);

  const sendMessage = useCallback(
    (text: string) => {
      socketRef.current?.emit("send_message", { roomId, text });
    },
    [roomId]
  );

  const markRead = useCallback(
    (messageId: string) => {
      if (!username) return;
      socketRef.current?.emit("message_read", {
        roomId,
        messageId,
        username,
      });
    },
    [roomId, username]
  );

  const emitTypingStart = useCallback(() => {
    if (!username) return;
    socketRef.current?.emit("typing_start", { roomId, username });
  }, [roomId, username]);

  const emitTypingStop = useCallback(() => {
    if (!username) return;
    socketRef.current?.emit("typing_stop", { roomId, username });
  }, [roomId, username]);

  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const checkUsername = useCallback(
    (name: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const sessionId = getSessionId();
        if (!socketRef.current?.connected) {
          const tempSocket = io(SERVER_URL, {
            transports: ["websocket", "polling"],
          });
          tempSocket.on("connect", () => {
            tempSocket.emit(
              "check_username",
              { roomId, username: name, sessionId },
              (res: { available: boolean }) => {
                tempSocket.disconnect();
                resolve(res.available);
              }
            );
          });
          return;
        }
        socketRef.current.emit(
          "check_username",
          { roomId, username: name, sessionId },
          (res: { available: boolean }) => {
            resolve(res.available);
          }
        );
      });
    },
    [roomId]
  );

  return {
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
  };
}
