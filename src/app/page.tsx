"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Assessment } from "@/lib/types";
import AssessmentCard from "@/components/assessment/AssessmentCard";

export default function Dashboard() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await fetch("/api/assessments");
      const data = await res.json();
      setAssessments(Array.isArray(data) ? data : []);
    } catch {
      // Failed to fetch
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      await fetchAssessments();
    } catch {
      // Seed failed
    } finally {
      setSeeding(false);
    }
  };

  const totalQuestions = assessments.reduce((sum, a) => sum + a.questionCount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-0.5">
            <div className="h-8 w-2 rounded-full bg-kahoot-red" />
            <div className="h-8 w-2 rounded-full bg-kahoot-blue" />
            <div className="h-8 w-2 rounded-full bg-kahoot-yellow" />
            <div className="h-8 w-2 rounded-full bg-kahoot-green" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Flutter Assessment Hub</h1>
        </div>
        <p className="text-[var(--muted-foreground)] text-lg mt-2">
          Browse questions, take quizzes, and track your Flutter training progress.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="card p-6">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {loading ? "-" : assessments.length}
          </div>
          <div className="text-sm text-[var(--muted-foreground)] mt-1">Assessments</div>
        </div>
        <div className="card p-6">
          <div className="text-3xl font-bold text-kahoot-green">
            {loading ? "-" : totalQuestions}
          </div>
          <div className="text-sm text-[var(--muted-foreground)] mt-1">Total Questions</div>
        </div>
        <div className="card p-6">
          <div className="text-3xl font-bold text-kahoot-blue">
            {loading ? "-" : assessments.filter((a) => a.type === "post-assessment").length}
          </div>
          <div className="text-sm text-[var(--muted-foreground)] mt-1">Weekly Assessments</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Link
          href="/assessments"
          className="px-5 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
        >
          Browse Questions
        </Link>
        <Link
          href="/upload"
          className="px-5 py-2.5 rounded-lg border border-[var(--border)] font-medium hover:bg-[var(--muted)] transition-colors"
        >
          Upload New Assessment
        </Link>
        <Link
          href="/leaderboard"
          className="px-5 py-2.5 rounded-lg border border-[var(--border)] font-medium hover:bg-[var(--muted)] transition-colors"
        >
          View Leaderboard
        </Link>
        {assessments.length === 0 && !loading && (
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-5 py-2.5 rounded-lg bg-kahoot-green text-white font-medium hover:bg-kahoot-green/90 transition-colors disabled:opacity-50"
          >
            {seeding ? "Seeding..." : "Seed Initial Data"}
          </button>
        )}
      </div>

      {/* Assessments Grid */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Recent Assessments</h2>
        {assessments.length > 0 && (
          <Link href="/assessments" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            View all
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 w-24 bg-[var(--muted)] rounded mb-4" />
              <div className="h-6 w-3/4 bg-[var(--muted)] rounded mb-2" />
              <div className="h-4 w-full bg-[var(--muted)] rounded mb-4" />
              <div className="h-4 w-1/3 bg-[var(--muted)] rounded" />
            </div>
          ))}
        </div>
      ) : assessments.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium mb-1">No assessments yet</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Seed the initial data or upload a new assessment to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.slice(0, 6).map((assessment) => (
            <AssessmentCard key={assessment._id} assessment={assessment} />
          ))}
        </div>
      )}
    </div>
  );
}
