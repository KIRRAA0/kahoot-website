"use client";

import { Room } from "@/lib/types";
import { cn } from "@/lib/cn";

const playerColors = [
  "bg-kahoot-red",
  "bg-kahoot-blue",
  "bg-kahoot-yellow",
  "bg-kahoot-green",
];

interface RoomLobbyProps {
  room: Room;
  currentUser: string;
  onStart: () => void;
}

export default function RoomLobby({ room, currentUser, onStart }: RoomLobbyProps) {
  const isHost = room.hostName === currentUser;

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      {/* Room Code */}
      <div className="text-center mb-10">
        <p className="text-sm text-[var(--muted-foreground)] mb-2 uppercase tracking-wider font-medium">
          Room Code
        </p>
        <button
          onClick={copyCode}
          className="text-5xl sm:text-7xl font-black tracking-[0.3em] text-primary-500 hover:text-primary-400 transition-colors"
          title="Click to copy"
        >
          {room.code}
        </button>
        <p className="text-xs text-[var(--muted-foreground)] mt-2">
          Click to copy
        </p>
      </div>

      {/* Participants */}
      <div className="w-full max-w-md mb-10">
        <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-4 text-center uppercase tracking-wider">
          Players ({room.participants.length}/4)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {room.participants.map((p, i) => (
            <div
              key={p.userName}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl text-white font-medium",
                playerColors[i % 4]
              )}
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                {p.userName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </div>
              <div>
                <div className="text-sm font-semibold">{p.userName}</div>
                {p.userName === room.hostName && (
                  <div className="text-xs opacity-75">Host</div>
                )}
              </div>
            </div>
          ))}
          {Array.from({ length: 4 - room.participants.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center justify-center p-4 rounded-xl border-2 border-dashed border-[var(--border)] text-[var(--muted-foreground)]"
            >
              <span className="text-sm">Waiting...</span>
            </div>
          ))}
        </div>
      </div>

      {/* Start button (host only) */}
      {isHost ? (
        <button
          onClick={onStart}
          disabled={room.participants.length < 1}
          className="px-10 py-4 rounded-xl bg-primary-600 text-white text-lg font-bold hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          Start Quiz
        </button>
      ) : (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)]">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            Waiting for host to start...
          </div>
        </div>
      )}
    </div>
  );
}
