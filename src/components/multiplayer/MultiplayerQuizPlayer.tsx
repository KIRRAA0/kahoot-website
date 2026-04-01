"use client";

import { useState, useEffect } from "react";
import { Room, Question } from "@/lib/types";
import { cn } from "@/lib/cn";
import CodeText from "@/components/ui/CodeText";

const answerBgColors = [
  "bg-kahoot-red hover:bg-kahoot-red/90",
  "bg-kahoot-blue hover:bg-kahoot-blue/90",
  "bg-kahoot-yellow hover:bg-kahoot-yellow/90",
  "bg-kahoot-green hover:bg-kahoot-green/90",
];

interface MultiplayerQuizPlayerProps {
  room: Room;
  question: Question;
  currentUser: string;
  scores: { userName: string; score: number }[];
  onAnswer: (selectedIndex: number, timeSpent: number) => void;
  hasAnswered: boolean;
  answerResult: boolean | null; // null = not answered, true/false = correct/incorrect
}

export default function MultiplayerQuizPlayer({
  room,
  question,
  currentUser,
  scores,
  onAnswer,
  hasAnswered,
  answerResult,
}: MultiplayerQuizPlayerProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answerStartTime] = useState(Date.now());

  // Compute time left from server's questionStartedAt
  useEffect(() => {
    if (!room.questionStartedAt) return;

    const timeLimit = room.questionTimeLimits[room.currentQuestionIndex] || 30;
    const startedAt = new Date(room.questionStartedAt).getTime();

    const updateTimer = () => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const remaining = Math.max(0, Math.ceil(timeLimit - elapsed));
      setTimeLeft(remaining);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 500);
    return () => clearInterval(timer);
  }, [room.questionStartedAt, room.currentQuestionIndex, room.questionTimeLimits]);

  // Reset selection when question changes
  useEffect(() => {
    setSelectedAnswer(null);
  }, [room.currentQuestionIndex]);

  const handleSelectAnswer = (index: number) => {
    if (hasAnswered || selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const timeSpent = Math.round((Date.now() - answerStartTime) / 1000);
    onAnswer(index, timeSpent);
  };

  const progress = ((room.currentQuestionIndex + 1) / room.totalQuestions) * 100;

  // Check who has answered
  const answeredUsers = room.answers
    .filter((a) => a.questionIndex === room.currentQuestionIndex)
    .map((a) => a.userName);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Progress bar */}
      <div className="h-1.5 bg-[var(--muted)]">
        <div
          className="h-full bg-primary-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--border)]">
        <div className="text-sm text-[var(--muted-foreground)]">
          {room.currentQuestionIndex + 1} of {room.totalQuestions}
        </div>

        {/* Mini scoreboard */}
        <div className="flex gap-3">
          {scores.map((s) => (
            <div
              key={s.userName}
              className={cn(
                "text-xs px-2 py-1 rounded-lg",
                s.userName === currentUser
                  ? "bg-primary-500/20 text-primary-500 font-bold"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              )}
            >
              {s.userName.split(" ")[0]}: {s.score}
            </div>
          ))}
        </div>

        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold",
            timeLeft <= 5
              ? "bg-incorrect/10 text-incorrect animate-pulse"
              : "bg-primary-500/10 text-primary-600 dark:text-primary-400"
          )}
        >
          {timeLeft}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-4xl mx-auto w-full">
        <div className="text-xl sm:text-2xl font-bold text-center mb-8 leading-relaxed">
          <CodeText text={question.text} />
        </div>

        {!hasAnswered ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {question.answers.map((answer, i) => (
              <button
                key={i}
                onClick={() => handleSelectAnswer(i)}
                className={cn(
                  "p-4 sm:p-6 rounded-xl text-white font-medium text-left transition-all",
                  answerBgColors[i % 4],
                  "hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                <span className="text-sm sm:text-base">
                  <CodeText text={answer.text} />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center space-y-6">
            {/* Answer feedback */}
            <div
              className={cn(
                "inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white text-lg font-bold",
                answerResult ? "bg-correct" : "bg-incorrect"
              )}
            >
              {answerResult ? (
                <>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Correct!
                </>
              ) : (
                <>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Wrong!
                </>
              )}
            </div>

            {/* Who has answered */}
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">
                Waiting for others...
              </p>
              <div className="flex justify-center gap-3">
                {room.participants.map((p) => {
                  const hasThisUserAnswered = answeredUsers.includes(p.userName);
                  return (
                    <div
                      key={p.userName}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        hasThisUserAnswered
                          ? "bg-correct/20 text-correct"
                          : "bg-[var(--muted)] text-[var(--muted-foreground)] animate-pulse"
                      )}
                    >
                      {hasThisUserAnswered ? "✓" : "..."} {p.userName.split(" ")[0]}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
