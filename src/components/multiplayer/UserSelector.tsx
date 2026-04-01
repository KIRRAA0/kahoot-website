"use client";

import { ALLOWED_USERS } from "@/lib/roomUtils";
import { cn } from "@/lib/cn";

const userColors = [
  "bg-kahoot-red hover:bg-kahoot-red/90",
  "bg-kahoot-blue hover:bg-kahoot-blue/90",
  "bg-kahoot-yellow hover:bg-kahoot-yellow/90",
  "bg-kahoot-green hover:bg-kahoot-green/90",
];

const userInitials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

interface UserSelectorProps {
  onSelect: (name: string) => void;
  selectedUser?: string | null;
}

export default function UserSelector({ onSelect, selectedUser }: UserSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
      {ALLOWED_USERS.map((name, i) => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          className={cn(
            "flex flex-col items-center gap-3 p-6 rounded-2xl text-white font-medium transition-all",
            userColors[i],
            selectedUser === name && "ring-4 ring-white/50 scale-105",
            "hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {userInitials(name)}
          </div>
          <span className="text-lg">{name}</span>
        </button>
      ))}
    </div>
  );
}
