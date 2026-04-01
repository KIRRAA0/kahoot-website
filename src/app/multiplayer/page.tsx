"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserSelector from "@/components/multiplayer/UserSelector";
import PasswordModal from "@/components/multiplayer/PasswordModal";

export default function MultiplayerPage() {
  const router = useRouter();
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const stored = localStorage.getItem("kahoot-mp-user");
    if (stored) setAuthenticatedUser(stored);
  }, []);

  const handleUserSelect = (name: string) => {
    setSelectedUser(name);
    setShowPasswordModal(true);
  };

  const handleAuthSuccess = () => {
    if (selectedUser) {
      localStorage.setItem("kahoot-mp-user", selectedUser);
      setAuthenticatedUser(selectedUser);
    }
    setShowPasswordModal(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("kahoot-mp-user");
    setAuthenticatedUser(null);
  };

  const handleJoinRoom = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code || !authenticatedUser) return;

    setJoining(true);
    setJoinError("");

    try {
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: authenticatedUser }),
      });

      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error || "Failed to join room");
        setJoining(false);
        return;
      }

      router.push(`/multiplayer/room/${code}`);
    } catch {
      setJoinError("Network error");
      setJoining(false);
    }
  };

  // Not authenticated — show user selection
  if (!authenticatedUser) {
    return (
      <div className="min-h-screen bg-[var(--background)] px-6 py-12">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-3xl font-black mb-2">Multiplayer Quiz</h1>
          <p className="text-[var(--muted-foreground)] mb-10">
            Select your name to get started
          </p>
          <UserSelector onSelect={handleUserSelect} />
        </div>

        {showPasswordModal && selectedUser && (
          <PasswordModal
            userName={selectedUser}
            onSuccess={handleAuthSuccess}
            onCancel={() => setShowPasswordModal(false)}
          />
        )}
      </div>
    );
  }

  // Authenticated — show create/join options
  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-12">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-3xl font-black mb-2">Multiplayer Quiz</h1>
        <p className="text-[var(--muted-foreground)] mb-2">
          Playing as <span className="font-bold text-primary-500">{authenticatedUser}</span>
        </p>
        <button
          onClick={handleSignOut}
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline mb-10 transition-colors"
        >
          Switch user
        </button>

        <div className="space-y-6">
          {/* Create Room */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-2">Create a Room</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Pick an assessment and invite your team
            </p>
            <button
              onClick={() => router.push("/multiplayer/create")}
              className="w-full px-6 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all hover:scale-[1.01]"
            >
              Create Room
            </button>
          </div>

          {/* Join Room */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-2">Join a Room</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Enter the 6-character room code
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase().slice(0, 6));
                  setJoinError("");
                }}
                placeholder="ABCDEF"
                maxLength={6}
                className="flex-1 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-center text-lg font-mono tracking-[0.3em] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
              />
              <button
                onClick={handleJoinRoom}
                disabled={joinCode.length < 6 || joining}
                className="px-6 py-3 rounded-lg bg-kahoot-green text-white font-bold hover:bg-kahoot-green/90 transition-colors disabled:opacity-50"
              >
                {joining ? "..." : "Join"}
              </button>
            </div>
            {joinError && (
              <p className="text-sm text-incorrect mt-2">{joinError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
