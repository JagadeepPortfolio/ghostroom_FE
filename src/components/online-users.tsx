"use client";

interface OnlineUsersProps {
  users: string[];
}

export default function OnlineUsers({ users }: OnlineUsersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {users.map((user) => (
        <span
          key={user}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 text-white/80 text-xs"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {user}
        </span>
      ))}
    </div>
  );
}
