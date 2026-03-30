"use client";

import { useState, useCallback, useEffect } from "react";
import { Question, QuizAnswer } from "@/lib/types";
import { cn } from "@/lib/cn";
import CodeText from "@/components/ui/CodeText";

const answerBgColors = [
  "bg-kahoot-red hover:bg-kahoot-red/90",
  "bg-kahoot-blue hover:bg-kahoot-blue/90",
  "bg-kahoot-yellow hover:bg-kahoot-yellow/90",
  "bg-kahoot-green hover:bg-kahoot-green/90",
];

interface QuizPlayerProps {
  questions: Question[];
  assessmentId: string;
  assessmentTitle: string;
  onComplete: (answers: QuizAnswer[], timeSpent: number) => void;
}

export default function QuizPlayer({ questions, assessmentTitle, onComplete }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 30);
  const [questionStart, setQuestionStart] = useState(Date.now());
  const [totalTime, setTotalTime] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleNext = useCallback(() => {
    const elapsed = (Date.now() - questionStart) / 1000;
    const isCorrect =
      selectedAnswer !== null &&
      currentQuestion.answers[selectedAnswer]?.isCorrect === true;

    const answer: QuizAnswer = {
      questionId: currentQuestion._id || "",
      selectedIndex: selectedAnswer ?? -1,
      isCorrect,
      timeSpent: Math.round(elapsed),
    };

    const newAnswers = [...answers, answer];
    const newTotalTime = totalTime + elapsed;

    if (currentIndex + 1 >= questions.length) {
      onComplete(newAnswers, Math.round(newTotalTime));
    } else {
      setAnswers(newAnswers);
      setTotalTime(newTotalTime);
      setSelectedAnswer(null);
      setShowResult(false);
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(questions[currentIndex + 1]?.timeLimit || 30);
      setQuestionStart(Date.now());
    }
  }, [selectedAnswer, currentQuestion, currentIndex, questions, answers, totalTime, questionStart, onComplete]);

  useEffect(() => {
    if (showResult) return;
    if (timeLeft <= 0) {
      setShowResult(true);
      setTimeout(handleNext, 1500);
      return;
    }

    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showResult, handleNext]);

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    setTimeout(handleNext, 1500);
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

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
          {currentIndex + 1} of {questions.length}
        </div>
        <div className="text-sm font-medium">{assessmentTitle}</div>
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
          <CodeText text={currentQuestion.text} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {currentQuestion.answers.map((answer, i) => {
            const isSelected = selectedAnswer === i;
            const isCorrectAnswer = answer.isCorrect;

            return (
              <button
                key={answer.id}
                onClick={() => handleSelectAnswer(i)}
                disabled={showResult}
                className={cn(
                  "relative p-4 sm:p-6 rounded-xl text-white font-medium text-left transition-all",
                  answerBgColors[i % 4],
                  showResult && isCorrectAnswer && "ring-4 ring-white/50 scale-105",
                  showResult && isSelected && !isCorrectAnswer && "opacity-50 scale-95",
                  showResult && !isSelected && !isCorrectAnswer && "opacity-30",
                  !showResult && "hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                <span className="text-sm sm:text-base"><CodeText text={answer.text} /></span>
                {showResult && isCorrectAnswer && (
                  <svg className="absolute top-2 right-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {showResult && isSelected && !isCorrectAnswer && (
                  <svg className="absolute top-2 right-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
