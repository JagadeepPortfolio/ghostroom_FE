"use client";

interface OnlineUsersProps {
  users: string[];
  onTogglePanel?: () => void;
}

export default function OnlineUsers({ users, onTogglePanel }: OnlineUsersProps) {
  return (
    <>
      {/* Mobile: compact badge */}
      <button
        onClick={onTogglePanel}
        className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs active:bg-white/20 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span>{users.length}</span>
      </button>

      {/* Desktop: full pills */}
      <div className="hidden sm:flex items-center gap-2 flex-wrap">
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
    </>
  );
}
