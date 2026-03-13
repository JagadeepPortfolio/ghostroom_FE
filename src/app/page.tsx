"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const FIXED_ROOM = "SGBOYS";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/room/${FIXED_ROOM}`);
  }, [router]);

  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="text-white/40">Entering room...</div>
    </div>
  );
}
