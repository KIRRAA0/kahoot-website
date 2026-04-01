"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Assessment } from "@/lib/types";
import { cn } from "@/lib/cn";

const typeColors: Record<string, string> = {
  "pre-assessment": "bg-kahoot-blue/10 text-kahoot-blue border-kahoot-blue/30",
  "post-assessment": "bg-kahoot-green/10 text-kahoot-green border-kahoot-green/30",
  combined: "bg-purple-500/10 text-purple-500 border-purple-500/30",
};

export default function CreateRoomPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);

  const currentUser = typeof window !== "undefined" ? localStorage.getItem("kahoot-mp-user") : null;

  useEffect(() => {
    if (!currentUser) {
      router.push("/multiplayer");
      return;
    }
    fetch("/api/assessments")
      .then((r) => r.json())
      .then((data) => setAssessments(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUser, router]);

  const handleCreateRoom = async (assessmentId: string) => {
    if (!currentUser || creating) return;

    setCreating(assessmentId);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, hostName: currentUser }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create room");
        setCreating(null);
        return;
      }

      router.push(`/multiplayer/room/${data.code}`);
    } catch {
      alert("Network error");
      setCreating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Choose an Assessment</h1>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-5 bg-[var(--muted)] rounded w-2/3 mb-3" />
                <div className="h-4 bg-[var(--muted)] rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6 transition-colors"
        >
          &larr; Back
        </button>

        <h1 className="text-2xl font-bold mb-2">Choose an Assessment</h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          Select which assessment to play in multiplayer mode
        </p>

        <div className="grid gap-4">
          {assessments.map((a) => (
            <button
              key={a._id}
              onClick={() => handleCreateRoom(a._id!)}
              disabled={creating !== null}
              className={cn(
                "card p-6 text-left transition-all hover:scale-[1.01] hover:border-primary-500/50",
                creating === a._id && "opacity-50"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">{a.title}</h3>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full border font-medium",
                        typeColors[a.type] || typeColors.combined
                      )}
                    >
                      {a.type}
                    </span>
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {a.questionCount} questions
                    </span>
                  </div>
                </div>
                <div className="text-primary-500">
                  {creating === a._id ? (
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
