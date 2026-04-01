"use client";

import { useState } from "react";
import { Room } from "@/lib/types";
import { cn } from "@/lib/cn";
import Link from "next/link";

const podiumColors = [
  "from-yellow-400 to-yellow-600",
  "from-slate-300 to-slate-500",
  "from-amber-600 to-amber-800",
  "from-slate-500 to-slate-700",
];

const podiumBg = [
  "bg-yellow-500/10 border-yellow-500/30",
  "bg-slate-400/10 border-slate-400/30",
  "bg-amber-700/10 border-amber-700/30",
  "bg-slate-500/10 border-slate-500/30",
];

interface UserAnalytics {
  userName: string;
  totalCorrect: number;
  totalWrong: number;
  percentage: number;
  totalTime: number;
  wrongQuestions: {
    questionIndex: number;
    selectedIndex: number;
    correctIndex: number;
  }[];
}

interface MultiplayerResultsProps {
  room: Room;
  questionsData: { text: string; answers: { text: string; isCorrect: boolean }[] }[];
}

export default function MultiplayerResults({ room, questionsData }: MultiplayerResultsProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Compute per-user analytics
  const analytics: UserAnalytics[] = room.participants
    .map((p) => {
      const userAnswers = room.answers.filter((a) => a.userName === p.userName);
      const totalCorrect = userAnswers.filter((a) => a.isCorrect).length;
      const totalWrong = room.totalQuestions - totalCorrect;
      const totalTime = userAnswers.reduce((sum, a) => sum + a.timeSpent, 0);

      const wrongQuestions = userAnswers
        .filter((a) => !a.isCorrect)
        .map((a) => {
          const q = questionsData[a.questionIndex];
          const correctIndex = q
            ? q.answers.findIndex((ans) => ans.isCorrect)
            : -1;
          return {
            questionIndex: a.questionIndex,
            selectedIndex: a.selectedIndex,
            correctIndex,
          };
        });

      return {
        userName: p.userName,
        totalCorrect,
        totalWrong,
        percentage: room.totalQuestions > 0 ? Math.round((totalCorrect / room.totalQuestions) * 100) : 0,
        totalTime,
        wrongQuestions,
      };
    })
    .sort((a, b) => b.totalCorrect - a.totalCorrect || a.totalTime - b.totalTime);

  const selectedAnalytics = analytics.find((a) => a.userName === selectedUser);

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-black text-center mb-2">Quiz Complete!</h1>
        <p className="text-center text-[var(--muted-foreground)] mb-10">
          {room.totalQuestions} questions answered
        </p>

        {/* Podium */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {analytics.map((a, i) => (
            <button
              key={a.userName}
              onClick={() => setSelectedUser(selectedUser === a.userName ? null : a.userName)}
              className={cn(
                "relative p-5 rounded-2xl border-2 text-center transition-all hover:scale-[1.02]",
                podiumBg[i],
                selectedUser === a.userName && "ring-2 ring-primary-500"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full mx-auto mb-3 bg-gradient-to-br flex items-center justify-center text-white text-xl font-black",
                  podiumColors[i]
                )}
              >
                {i + 1}
              </div>
              <div className="font-bold text-sm mb-1">{a.userName}</div>
              <div className="text-3xl font-black text-primary-500">{a.totalCorrect}</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {a.percentage}% &middot; {a.totalTime}s
              </div>
            </button>
          ))}
        </div>

        {/* User detail panel */}
        {selectedAnalytics && (
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              {selectedAnalytics.userName}&apos;s Results
            </h2>

            <div className="flex gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-correct">{selectedAnalytics.totalCorrect}</div>
                <div className="text-xs text-[var(--muted-foreground)]">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-incorrect">{selectedAnalytics.totalWrong}</div>
                <div className="text-xs text-[var(--muted-foreground)]">Wrong</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{selectedAnalytics.percentage}%</div>
                <div className="text-xs text-[var(--muted-foreground)]">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{selectedAnalytics.totalTime}s</div>
                <div className="text-xs text-[var(--muted-foreground)]">Time</div>
              </div>
            </div>

            {selectedAnalytics.wrongQuestions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3 uppercase tracking-wider">
                  Wrong Answers
                </h3>
                <div className="space-y-2">
                  {selectedAnalytics.wrongQuestions.map((wq) => {
                    const q = questionsData[wq.questionIndex];
                    return (
                      <div
                        key={wq.questionIndex}
                        className="p-3 rounded-lg bg-incorrect/5 border border-incorrect/20"
                      >
                        <div className="text-sm font-medium mb-1">
                          Q{wq.questionIndex + 1}: {q?.text || "Unknown"}
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {wq.selectedIndex >= 0 ? (
                            <>
                              Answered:{" "}
                              <span className="text-incorrect">
                                {q?.answers[wq.selectedIndex]?.text || "N/A"}
                              </span>
                            </>
                          ) : (
                            <span className="text-incorrect">No answer (time out)</span>
                          )}
                          {" | "}Correct:{" "}
                          <span className="text-correct">
                            {q?.answers[wq.correctIndex]?.text || "N/A"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedAnalytics.wrongQuestions.length === 0 && (
              <p className="text-sm text-correct font-medium">
                Perfect score! No wrong answers.
              </p>
            )}
          </div>
        )}

        {!selectedUser && (
          <p className="text-center text-sm text-[var(--muted-foreground)] mb-8">
            Click on a player above to see their detailed results
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Link
            href="/multiplayer"
            className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
          >
            Play Again
          </Link>
          <Link
            href="/assessments"
            className="px-6 py-2.5 rounded-lg border border-[var(--border)] font-medium hover:bg-[var(--muted)] transition-colors"
          >
            All Assessments
          </Link>
        </div>
      </div>
    </div>
  );
}
