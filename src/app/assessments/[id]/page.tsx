"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Assessment, Question } from "@/lib/types";
import QuestionCard from "@/components/assessment/QuestionCard";
import SearchBar from "@/components/assessment/SearchBar";
import { cn } from "@/lib/cn";

export default function AssessmentViewerPage() {
  const params = useParams();
  const id = params.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  useEffect(() => {
    fetch(`/api/assessments/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setAssessment(data.assessment);
        setQuestions(data.questions || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const stored = localStorage.getItem(`bookmarks-${id}`);
    if (stored) setBookmarks(new Set(JSON.parse(stored)));
  }, [id]);

  const toggleBookmark = useCallback(
    (questionId: string) => {
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (next.has(questionId)) next.delete(questionId);
        else next.add(questionId);
        localStorage.setItem(`bookmarks-${id}`, JSON.stringify(Array.from(next)));
        return next;
      });
    },
    [id]
  );

  const filtered = questions.filter((q) => {
    if (showBookmarkedOnly && !bookmarks.has(q._id || "")) return false;
    if (search) {
      const query = search.toLowerCase();
      return (
        q.text.toLowerCase().includes(query) ||
        q.answers.some((a) => a.text.toLowerCase().includes(query))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-2/3 bg-[var(--muted)] rounded mb-4" />
          <div className="h-4 w-1/2 bg-[var(--muted)] rounded mb-8" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 mb-4">
              <div className="h-6 w-3/4 bg-[var(--muted)] rounded mb-4" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-10 bg-[var(--muted)] rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Assessment Not Found</h1>
        <Link href="/assessments" className="text-primary-600 hover:underline">
          Back to Assessments
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/assessments" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4 inline-flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Assessments
        </Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold mb-1">{assessment.title}</h1>
            <p className="text-[var(--muted-foreground)]">{assessment.description}</p>
            <div className="flex items-center gap-3 mt-3 text-sm text-[var(--muted-foreground)]">
              <span>{questions.length} questions</span>
              {assessment.weeks.length > 0 && (
                <span>Weeks: {assessment.weeks.join(", ")}</span>
              )}
            </div>
          </div>
          <Link
            href={`/assessments/${id}/quiz`}
            className="flex-shrink-0 px-5 py-2.5 rounded-lg bg-kahoot-blue text-white font-medium hover:bg-kahoot-blue/90 transition-colors"
          >
            Start Quiz
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search questions or answers..." />
        </div>
        <button
          onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
          className={cn(
            "px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2",
            showBookmarkedOnly
              ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
              : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
          )}
        >
          <svg className={cn("h-4 w-4", showBookmarkedOnly && "fill-current")} fill={showBookmarkedOnly ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Bookmarked ({bookmarks.size})
        </button>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-[var(--muted-foreground)]">
            {search || showBookmarkedOnly ? "No questions match your filters." : "No questions found."}
          </div>
        ) : (
          filtered.map((question, i) => (
            <QuestionCard
              key={question._id}
              question={question}
              index={i}
              isBookmarked={bookmarks.has(question._id || "")}
              onToggleBookmark={() => toggleBookmark(question._id || "")}
            />
          ))
        )}
      </div>
    </div>
  );
}
