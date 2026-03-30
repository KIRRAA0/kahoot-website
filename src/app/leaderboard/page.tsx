"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface LeaderboardEntry {
  userName: string;
  bestScore: number;
  totalAttempts: number;
  avgScore: number;
  lastAttempt: string;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const getMedal = (index: number) => {
    if (index === 0) return { emoji: "1st", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" };
    if (index === 1) return { emoji: "2nd", color: "bg-gray-300/10 text-gray-500 border-gray-400/30" };
    if (index === 2) return { emoji: "3rd", color: "bg-orange-500/10 text-orange-600 border-orange-500/30" };
    return null;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Leaderboard</h1>
        <p className="text-[var(--muted-foreground)]">
          Top quiz scores across all assessments.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[var(--muted)]" />
                <div className="flex-1">
                  <div className="h-5 w-32 bg-[var(--muted)] rounded mb-1" />
                  <div className="h-3 w-24 bg-[var(--muted)] rounded" />
                </div>
                <div className="h-8 w-16 bg-[var(--muted)] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium mb-1">No quiz attempts yet</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Take a quiz to appear on the leaderboard!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => {
            const medal = getMedal(i);
            return (
              <div
                key={entry.userName}
                className={cn(
                  "card p-4 flex items-center gap-4",
                  medal && `border ${medal.color}`
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold",
                  medal ? medal.color : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                )}>
                  {medal ? medal.emoji : `#${i + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{entry.userName}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {entry.totalAttempts} attempt{entry.totalAttempts !== 1 ? "s" : ""} | Avg: {entry.avgScore}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {entry.bestScore}%
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">Best</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
