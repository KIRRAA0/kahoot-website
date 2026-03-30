"use client";

import Link from "next/link";
import { Question, QuizAnswer } from "@/lib/types";
import { cn } from "@/lib/cn";
import CodeText from "@/components/ui/CodeText";

interface QuizResultsProps {
  questions: Question[];
  answers: QuizAnswer[];
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  assessmentId: string;
  onRetry: () => void;
}

export default function QuizResults({
  questions,
  answers,
  score,
  totalQuestions,
  percentage,
  timeSpent,
  assessmentId,
  onRetry,
}: QuizResultsProps) {
  const getGrade = () => {
    if (percentage >= 90) return { label: "Excellent!", color: "text-correct" };
    if (percentage >= 70) return { label: "Good Job!", color: "text-primary-500" };
    if (percentage >= 50) return { label: "Keep Practicing", color: "text-kahoot-yellow" };
    return { label: "Needs Improvement", color: "text-incorrect" };
  };

  const grade = getGrade();

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Score Card */}
        <div className="card p-8 text-center mb-8">
          <h1 className={cn("text-3xl font-bold mb-2", grade.color)}>{grade.label}</h1>
          <div className="text-6xl font-bold my-6">
            {score}<span className="text-2xl text-[var(--muted-foreground)]">/{totalQuestions}</span>
          </div>
          <div className="flex justify-center gap-8 text-sm text-[var(--muted-foreground)]">
            <div>
              <span className="block text-2xl font-bold text-[var(--foreground)]">{percentage}%</span>
              Accuracy
            </div>
            <div>
              <span className="block text-2xl font-bold text-[var(--foreground)]">{timeSpent}s</span>
              Total Time
            </div>
            <div>
              <span className="block text-2xl font-bold text-[var(--foreground)]">
                {totalQuestions > 0 ? Math.round(timeSpent / totalQuestions) : 0}s
              </span>
              Avg/Question
            </div>
          </div>

          <div className="flex gap-3 justify-center mt-8">
            <button
              onClick={onRetry}
              className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href={`/assessments/${assessmentId}`}
              className="px-6 py-2.5 rounded-lg border border-[var(--border)] font-medium hover:bg-[var(--muted)] transition-colors"
            >
              Review Questions
            </Link>
            <Link
              href="/assessments"
              className="px-6 py-2.5 rounded-lg border border-[var(--border)] font-medium hover:bg-[var(--muted)] transition-colors"
            >
              All Assessments
            </Link>
          </div>
        </div>

        {/* Answer Review */}
        <h2 className="text-xl font-bold mb-4">Answer Review</h2>
        <div className="space-y-3">
          {answers.map((answer, i) => {
            const question = questions[i];
            if (!question) return null;
            return (
              <div
                key={i}
                className={cn(
                  "card p-4 flex items-start gap-4",
                  answer.isCorrect ? "border-correct/30" : "border-incorrect/30"
                )}
              >
                <span
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white",
                    answer.isCorrect ? "bg-correct" : "bg-incorrect"
                  )}
                >
                  {answer.isCorrect ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium mb-1">
                    Q{i + 1}: <CodeText text={question.text} />
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {answer.selectedIndex >= 0 ? (
                      <>
                        Your answer: <span className={answer.isCorrect ? "text-correct" : "text-incorrect"}>
                          {question.answers[answer.selectedIndex]?.text}
                        </span>
                      </>
                    ) : (
                      <span className="text-incorrect">Time ran out</span>
                    )}
                    {!answer.isCorrect && (
                      <>
                        {" | "}Correct: <span className="text-correct">
                          {question.answers.find((a) => a.isCorrect)?.text}
                        </span>
                      </>
                    )}
                    {" | "}{answer.timeSpent}s
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
