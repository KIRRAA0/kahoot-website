"use client";

import { useState } from "react";
import { Question } from "@/lib/types";
import { cn } from "@/lib/cn";
import CodeText from "@/components/ui/CodeText";

const answerColors = [
  "border-kahoot-red/30 bg-kahoot-red/5",
  "border-kahoot-blue/30 bg-kahoot-blue/5",
  "border-kahoot-yellow/30 bg-kahoot-yellow/5",
  "border-kahoot-green/30 bg-kahoot-green/5",
];

const answerDots = [
  "bg-kahoot-red",
  "bg-kahoot-blue",
  "bg-kahoot-yellow",
  "bg-kahoot-green",
];

interface QuestionCardProps {
  question: Question;
  index: number;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export default function QuestionCard({ question, index, isBookmarked, onToggleBookmark }: QuestionCardProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-bold">
            {index + 1}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--muted)] text-xs text-[var(--muted-foreground)]">
            {question.timeLimit}s
          </span>
        </div>
        {onToggleBookmark && (
          <button
            onClick={onToggleBookmark}
            className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors"
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <svg
              className={cn("h-5 w-5", isBookmarked ? "fill-yellow-500 text-yellow-500" : "text-[var(--muted-foreground)]")}
              fill={isBookmarked ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        )}
      </div>

      <div className="text-base font-medium mb-4 leading-relaxed">
        <CodeText text={question.text} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {question.answers.map((answer, i) => (
          <div
            key={answer.id}
            className={cn(
              "relative flex items-center gap-3 p-3 rounded-lg border transition-all",
              revealed && answer.isCorrect
                ? "border-correct/50 bg-correct/10 ring-2 ring-correct/30"
                : revealed && !answer.isCorrect
                  ? "border-[var(--border)] opacity-50"
                  : answerColors[i % 4]
            )}
          >
            <span className={cn("flex-shrink-0 w-2.5 h-2.5 rounded-full", answerDots[i % 4])} />
            <span className="text-sm"><CodeText text={answer.text} /></span>
            {revealed && answer.isCorrect && (
              <svg className="ml-auto h-5 w-5 text-correct flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => setRevealed(!revealed)}
        className={cn(
          "text-sm font-medium px-4 py-2 rounded-lg transition-colors",
          revealed
            ? "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
            : "bg-primary-600 text-white hover:bg-primary-700"
        )}
      >
        {revealed ? "Hide Answer" : "Reveal Answer"}
      </button>
    </div>
  );
}
