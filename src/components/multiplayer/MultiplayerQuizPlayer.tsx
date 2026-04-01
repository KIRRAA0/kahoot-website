"use client";

import { useState, useEffect, useRef } from "react";
import { Room, Question } from "@/lib/types";
import { cn } from "@/lib/cn";
import CodeText from "@/components/ui/CodeText";

const answerBgColors = [
  "bg-kahoot-red",
  "bg-kahoot-blue",
  "bg-kahoot-yellow",
  "bg-kahoot-green",
];

const answerShapes = ["triangle", "diamond", "circle", "square"] as const;

function AnswerIcon({ shape }: { shape: (typeof answerShapes)[number] }) {
  switch (shape) {
    case "triangle":
      return (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L2 21h20L12 3z" />
        </svg>
      );
    case "diamond":
      return (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
        </svg>
      );
    case "circle":
      return (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case "square":
      return (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      );
  }
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

interface MultiplayerQuizPlayerProps {
  room: Room;
  question: Question;
  currentUser: string;
  scores: { userName: string; score: number }[];
  onAnswer: (selectedIndex: number, timeSpent: number) => void;
  onAdvance: () => void;
  hasAnswered: boolean;
  answerResult: boolean | null;
}

export default function MultiplayerQuizPlayer({
  room,
  question,
  currentUser,
  scores,
  onAnswer,
  onAdvance,
  hasAnswered,
  answerResult,
}: MultiplayerQuizPlayerProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answerStartTime] = useState(Date.now());
  const advanceCalled = useRef(false);

  const isLocked = selectedAnswer !== null || hasAnswered;
  const showResult = selectedAnswer !== null && answerResult !== null;

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

  // Reset selection and advance guard when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    advanceCalled.current = false;
  }, [room.currentQuestionIndex]);

  // Call advance when timer expires
  useEffect(() => {
    if (timeLeft === 0 && !advanceCalled.current) {
      advanceCalled.current = true;
      onAdvance();
    }
  }, [timeLeft, onAdvance]);

  const handleSelectAnswer = (index: number) => {
    if (isLocked) return;
    setSelectedAnswer(index);
    const timeSpent = Math.round((Date.now() - answerStartTime) / 1000);
    onAnswer(index, timeSpent);
  };

  const progress = ((room.currentQuestionIndex + 1) / room.totalQuestions) * 100;

  // Who has answered this question
  const answeredUsers = room.answers
    .filter((a) => a.questionIndex === room.currentQuestionIndex)
    .map((a) => a.userName);

  // Get answer button styles based on state
  const getAnswerStyles = (index: number) => {
    const base = answerBgColors[index % 4];

    // Not yet selected anything — fully interactive
    if (!isLocked) {
      return cn(base, "hover:scale-[1.02] active:scale-[0.98] cursor-pointer");
    }

    // This is the selected answer
    if (index === selectedAnswer) {
      if (!showResult) {
        // Waiting for server response — pulsing ring
        return cn(base, "ring-4 ring-white/60 animate-pulse");
      }
      // Got result — green or red ring
      return cn(
        base,
        answerResult
          ? "ring-4 ring-correct shadow-[0_0_20px_rgba(34,197,94,0.4)]"
          : "ring-4 ring-incorrect shadow-[0_0_20px_rgba(239,68,68,0.4)]"
      );
    }

    // Unselected answers — dim them
    return cn(base, "opacity-40");
  };

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
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between border-b border-[var(--border)]">
        <div className="text-sm text-[var(--muted-foreground)]">
          {room.currentQuestionIndex + 1} of {room.totalQuestions}
        </div>

        {/* Mini result badge (shows after answering) */}
        {showResult && (
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold text-white transition-all",
              answerResult ? "bg-correct" : "bg-incorrect"
            )}
          >
            {answerResult ? <CheckIcon /> : <XIcon />}
            {answerResult ? "Correct!" : "Wrong!"}
          </div>
        )}

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

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Question + Answers (main) */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-lg sm:text-2xl font-bold text-center mb-6 sm:mb-8 leading-relaxed max-w-3xl">
            <CodeText text={question.text} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-3xl">
            {question.answers.map((answer, i) => (
              <button
                key={i}
                onClick={() => handleSelectAnswer(i)}
                disabled={isLocked}
                className={cn(
                  "relative p-4 sm:p-5 rounded-xl text-white font-medium text-left transition-all duration-200",
                  getAnswerStyles(i)
                )}
              >
                <div className="flex items-start gap-3">
                  <AnswerIcon shape={answerShapes[i % 4]} />
                  <span className="text-sm sm:text-base flex-1">
                    <CodeText text={answer.text} />
                  </span>
                </div>

                {/* Result icon overlay on selected answer */}
                {i === selectedAnswer && showResult && (
                  <div
                    className={cn(
                      "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white",
                      answerResult ? "bg-correct" : "bg-incorrect"
                    )}
                  >
                    {answerResult ? <CheckIcon /> : <XIcon />}
                  </div>
                )}

                {/* Pending spinner on selected answer */}
                {i === selectedAnswer && !showResult && (
                  <div className="absolute top-2 right-2 w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Participants sidebar */}
        <div className="lg:w-64 lg:border-l border-t lg:border-t-0 border-[var(--border)] bg-[var(--background)]">
          <div className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
              Players
            </h3>
            <div className="space-y-2">
              {room.participants.map((p) => {
                const hasThisUserAnswered = answeredUsers.includes(p.userName);
                const userScore = scores.find((s) => s.userName === p.userName);
                const isMe = p.userName === currentUser;

                return (
                  <div
                    key={p.userName}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300",
                      isMe
                        ? "bg-primary-500/10 border border-primary-500/20"
                        : "bg-[var(--muted)]/50"
                    )}
                  >
                    {/* Answer status icon */}
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                        hasThisUserAnswered
                          ? "bg-correct text-white"
                          : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                      )}
                    >
                      {hasThisUserAnswered ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          isMe ? "text-primary-500" : "text-[var(--foreground)]"
                        )}
                      >
                        {p.userName}
                        {isMe && <span className="text-xs opacity-60 ml-1">(you)</span>}
                      </p>
                    </div>

                    {/* Score */}
                    <span className="text-xs font-bold text-[var(--muted-foreground)] tabular-nums">
                      {userScore?.score ?? 0}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Answered count */}
            <div className="mt-4 pt-3 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--muted-foreground)] text-center">
                <span className="font-bold text-[var(--foreground)]">{answeredUsers.length}</span>
                {" / "}
                {room.participants.length} answered
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
