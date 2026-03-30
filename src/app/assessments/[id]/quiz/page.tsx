"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Assessment, Question, QuizAnswer } from "@/lib/types";
import QuizPlayer from "@/components/quiz/QuizPlayer";
import QuizResults from "@/components/quiz/QuizResults";

type QuizState = "loading" | "ready" | "playing" | "results";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [state, setState] = useState<QuizState>("loading");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    fetch(`/api/assessments/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setAssessment(data.assessment);
        setQuestions(data.questions || []);
        setState("ready");
      })
      .catch(() => router.push("/assessments"));
  }, [id, router]);

  const handleStart = () => setState("playing");

  const handleComplete = async (answers: QuizAnswer[], totalTime: number) => {
    setQuizAnswers(answers);
    setTimeSpent(totalTime);
    setState("results");

    const score = answers.filter((a) => a.isCorrect).length;
    const percentage = Math.round((score / answers.length) * 100);

    const userName = localStorage.getItem("kahoot-username") || "Anonymous";

    try {
      await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: id,
          userName,
          answers,
          score,
          totalQuestions: answers.length,
          percentage,
          timeSpent: totalTime,
        }),
      });
    } catch {
      // Failed to save attempt
    }
  };

  const handleRetry = () => {
    setQuizAnswers([]);
    setTimeSpent(0);
    setState("playing");
  };

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-[var(--muted)] rounded mx-auto mb-4" />
          <div className="h-4 w-32 bg-[var(--muted)] rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (state === "ready" && assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 sm:p-12 max-w-lg w-full text-center">
          <div className="flex justify-center gap-1 mb-6">
            <div className="h-10 w-2.5 rounded-full bg-kahoot-red" />
            <div className="h-10 w-2.5 rounded-full bg-kahoot-blue" />
            <div className="h-10 w-2.5 rounded-full bg-kahoot-yellow" />
            <div className="h-10 w-2.5 rounded-full bg-kahoot-green" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{assessment.title}</h1>
          <p className="text-[var(--muted-foreground)] mb-6">{assessment.description}</p>

          <div className="flex justify-center gap-6 mb-8 text-sm text-[var(--muted-foreground)]">
            <div>
              <span className="block text-2xl font-bold text-[var(--foreground)]">{questions.length}</span>
              Questions
            </div>
            <div>
              <span className="block text-2xl font-bold text-[var(--foreground)]">
                {questions.reduce((s, q) => s + q.timeLimit, 0)}s
              </span>
              Total Time
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm text-[var(--muted-foreground)] block mb-2">Your Name (for leaderboard)</label>
            <input
              type="text"
              defaultValue={typeof window !== "undefined" ? localStorage.getItem("kahoot-username") || "" : ""}
              onChange={(e) => localStorage.setItem("kahoot-username", e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>

          <button
            onClick={handleStart}
            className="w-full px-6 py-3 rounded-lg bg-kahoot-blue text-white font-bold text-lg hover:bg-kahoot-blue/90 transition-colors"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (state === "playing" && assessment) {
    return (
      <QuizPlayer
        questions={questions}
        assessmentId={id}
        assessmentTitle={assessment.title}
        onComplete={handleComplete}
      />
    );
  }

  if (state === "results") {
    const score = quizAnswers.filter((a) => a.isCorrect).length;
    const percentage = quizAnswers.length > 0 ? Math.round((score / quizAnswers.length) * 100) : 0;

    return (
      <QuizResults
        questions={questions}
        answers={quizAnswers}
        score={score}
        totalQuestions={quizAnswers.length}
        percentage={percentage}
        timeSpent={timeSpent}
        assessmentId={id}
        onRetry={handleRetry}
      />
    );
  }

  return null;
}
