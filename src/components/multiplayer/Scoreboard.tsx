"use client";

import { PreviousQuestionResult } from "@/lib/types";
import { cn } from "@/lib/cn";
import CodeText from "@/components/ui/CodeText";

const podiumColors = [
  "bg-kahoot-yellow text-black", // 1st - gold
  "bg-slate-400 text-black",     // 2nd - silver
  "bg-amber-700 text-white",     // 3rd - bronze
  "bg-slate-600 text-white",     // 4th
];

interface ScoreboardProps {
  previousQuestionResults: PreviousQuestionResult;
  scores: { userName: string; score: number; totalCorrect: number }[];
  currentQuestionIndex: number;
  totalQuestions: number;
}

export default function Scoreboard({
  previousQuestionResults,
  scores,
  currentQuestionIndex,
  totalQuestions,
}: ScoreboardProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6 py-8">
      {/* Previous question result */}
      <div className="text-center mb-8 max-w-2xl">
        <p className="text-sm text-[var(--muted-foreground)] mb-2">
          Question {previousQuestionResults.questionIndex + 1} of {totalQuestions}
        </p>
        <div className="text-lg font-medium mb-4">
          <CodeText text={previousQuestionResults.questionText} />
        </div>

        {/* Who got it right/wrong */}
        <div className="flex justify-center gap-3 mb-8">
          {previousQuestionResults.participantResults.map((pr) => (
            <div
              key={pr.userName}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm",
                pr.isCorrect
                  ? "bg-correct/20 text-correct"
                  : "bg-incorrect/20 text-incorrect"
              )}
            >
              {pr.isCorrect ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {pr.userName.split(" ")[0]}
              {pr.timeSpent > 0 && (
                <span className="text-xs opacity-60">{pr.timeSpent}s</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Running scores */}
      <div className="w-full max-w-md">
        <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-4 text-center uppercase tracking-wider">
          Standings
        </h3>
        <div className="space-y-3">
          {scores.map((s, i) => (
            <div
              key={s.userName}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl font-medium transition-all",
                podiumColors[i] || podiumColors[3]
              )}
            >
              <span className="text-2xl font-black w-8 text-center">
                {i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : "4th"}
              </span>
              <span className="flex-1 text-lg">{s.userName}</span>
              <span className="text-2xl font-black">{s.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next question indicator */}
      <div className="mt-8 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
        {currentQuestionIndex + 1 < totalQuestions
          ? `Next question in a moment...`
          : "Final results coming..."}
      </div>
    </div>
  );
}
