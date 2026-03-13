"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { io } from "socket.io-client";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = () => {
    setLoading(true);
    const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });

    socket.on("connect", () => {
      socket.emit("create_room", (res: { roomId: string }) => {
        socket.disconnect();
        router.push(`/room/${res.roomId}`);
      });
    });

    socket.on("connect_error", () => {
      setLoading(false);
    });
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        <h1 className="text-6xl font-bold text-white mb-2">
          Ghost<span className="text-purple-400">Room</span>
        </h1>
        <p className="text-white/50 text-lg mb-10">
          Ephemeral chat. No login. No history. Messages burn after reading.
        </p>

        <button
          onClick={handleCreateRoom}
          disabled={loading}
          className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-lg transition-all shadow-lg shadow-purple-600/25 hover:shadow-purple-500/40"
        >
          {loading ? "Creating..." : "Create a Room"}
        </button>

        <p className="mt-6 text-white/30 text-sm">
          Share the link with friends. Chat disappears forever.
        </p>
      </motion.div>
    </div>
  );
}
