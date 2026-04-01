"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Assessment, Material } from "@/lib/types";
import AssessmentCard from "@/components/assessment/AssessmentCard";

export default function Dashboard() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [materialForm, setMaterialForm] = useState({ title: "", url: "", week: "" });
  const [submittingMaterial, setSubmittingMaterial] = useState(false);

  useEffect(() => {
    fetchAssessments();
    fetchMaterials();
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

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/materials");
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch {
      // Failed to fetch
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.title || !materialForm.url || !materialForm.week) return;

    setSubmittingMaterial(true);
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: materialForm.title,
          url: materialForm.url,
          week: Number(materialForm.week),
        }),
      });
      if (res.ok) {
        const newMaterial = await res.json();
        setMaterials((prev) =>
          [...prev, newMaterial].sort((a, b) => a.week - b.week)
        );
        setMaterialForm({ title: "", url: "", week: "" });
        setShowAddMaterial(false);
      }
    } catch {
      // Failed to add
    } finally {
      setSubmittingMaterial(false);
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

      {/* Workshop Materials */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Workshop Materials</h2>
          <button
            onClick={() => setShowAddMaterial(!showAddMaterial)}
            className="text-sm px-3 py-1.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
          >
            {showAddMaterial ? "Cancel" : "+ Add Material"}
          </button>
        </div>

        {/* Add Material Form */}
        {showAddMaterial && (
          <form onSubmit={handleAddMaterial} className="card p-5 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_80px_auto] gap-3 items-end">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. State Management"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">
                  URL
                </label>
                <input
                  type="url"
                  placeholder="https://canva.link/..."
                  value={materialForm.url}
                  onChange={(e) => setMaterialForm((f) => ({ ...f, url: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">
                  Week
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="#"
                  value={materialForm.week}
                  onChange={(e) => setMaterialForm((f) => ({ ...f, week: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                disabled={submittingMaterial}
                className="px-5 py-2 rounded-lg bg-kahoot-green text-white font-medium hover:bg-kahoot-green/90 transition-colors disabled:opacity-50 text-sm"
              >
                {submittingMaterial ? "Adding..." : "Add"}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {materials.map((m) => (
            <a
              key={m._id}
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-5 flex items-center gap-4 hover:border-primary-500/50 transition-all hover:scale-[1.01] group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary-500 mb-0.5">Week {m.week}</p>
                <p className="font-semibold truncate">{m.title}</p>
              </div>
              <svg className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-primary-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          ))}
          {materials.length === 0 && (
            <div className="card p-6 text-center text-sm text-[var(--muted-foreground)] col-span-full">
              No materials yet. Click &quot;+ Add Material&quot; to add the first one.
            </div>
          )}
        </div>
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
