"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Assessment, Material, TechTopic } from "@/lib/types";
import AssessmentCard from "@/components/assessment/AssessmentCard";

export default function Dashboard() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [topics, setTopics] = useState<TechTopic[]>([]);
  const [topicFilter, setTopicFilter] = useState("All");
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [materialForm, setMaterialForm] = useState({ title: "", url: "", week: "" });
  const [submittingMaterial, setSubmittingMaterial] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [topicForm, setTopicForm] = useState({ title: "", category: "", tagline: "", description: "", url: "" });
  const [submittingTopic, setSubmittingTopic] = useState(false);

  useEffect(() => {
    fetchAssessments();
    fetchMaterials();
    fetchTopics();
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

  const fetchTopics = async () => {
    try {
      const res = await fetch("/api/tech-topics");
      const data = await res.json();
      setTopics(Array.isArray(data) ? data : []);
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

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicForm.title || !topicForm.category || !topicForm.tagline || !topicForm.description || !topicForm.url) return;

    setSubmittingTopic(true);
    try {
      const res = await fetch("/api/tech-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(topicForm),
      });
      if (res.ok) {
        const newTopic = await res.json();
        setTopics((prev) => [...prev, newTopic]);
        setTopicForm({ title: "", category: "", tagline: "", description: "", url: "" });
        setShowAddTopic(false);
      }
    } catch {
      // Failed to add
    } finally {
      setSubmittingTopic(false);
    }
  };

  const topicCategories = ["All", ...Array.from(new Set(topics.map((t) => t.category)))];
  const filteredTopics = topicFilter === "All" ? topics : topics.filter((t) => t.category === topicFilter);

  const categoryColors: Record<string, string> = {
    Architecture: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    "State Management": "bg-kahoot-blue/10 text-kahoot-blue border-kahoot-blue/30",
    "CI/CD": "bg-kahoot-green/10 text-kahoot-green border-kahoot-green/30",
    Tool: "bg-kahoot-yellow/10 text-kahoot-yellow border-kahoot-yellow/30",
    Backend: "bg-kahoot-red/10 text-kahoot-red border-kahoot-red/30",
    Testing: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
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

      {/* Tech Topics */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Tech Topics</h2>
          <button
            onClick={() => setShowAddTopic(!showAddTopic)}
            className="text-sm px-3 py-1.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
          >
            {showAddTopic ? "Cancel" : "+ Add Topic"}
          </button>
        </div>

        {/* Add Topic Form */}
        {showAddTopic && (
          <form onSubmit={handleAddTopic} className="card p-5 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Title</label>
                <input
                  type="text"
                  placeholder="e.g. BLoC Pattern"
                  value={topicForm.title}
                  onChange={(e) => setTopicForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Category</label>
                <select
                  value={topicForm.category}
                  onChange={(e) => setTopicForm((f) => ({ ...f, category: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select category</option>
                  <option value="Architecture">Architecture</option>
                  <option value="State Management">State Management</option>
                  <option value="CI/CD">CI/CD</option>
                  <option value="Tool">Tool</option>
                  <option value="Backend">Backend</option>
                  <option value="Testing">Testing</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Tagline</label>
              <input
                type="text"
                placeholder="One-line summary"
                value={topicForm.tagline}
                onChange={(e) => setTopicForm((f) => ({ ...f, tagline: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="mb-3">
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Description</label>
              <textarea
                placeholder="2-3 sentence description"
                value={topicForm.description}
                onChange={(e) => setTopicForm((f) => ({ ...f, description: e.target.value }))}
                required
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={topicForm.url}
                  onChange={(e) => setTopicForm((f) => ({ ...f, url: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                disabled={submittingTopic}
                className="px-5 py-2 rounded-lg bg-kahoot-green text-white font-medium hover:bg-kahoot-green/90 transition-colors disabled:opacity-50 text-sm shrink-0"
              >
                {submittingTopic ? "Adding..." : "Add Topic"}
              </button>
            </div>
          </form>
        )}

        {/* Category Filters */}
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {topicCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setTopicFilter(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  topicFilter === cat
                    ? "bg-primary-600 text-white border-primary-600"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-primary-500/50"
                }`}
              >
                {cat}
                {cat !== "All" && (
                  <span className="ml-1 opacity-60">
                    {topics.filter((t) => t.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Topic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((t) => (
            <a
              key={t._id}
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-5 flex flex-col hover:border-primary-500/50 transition-all hover:scale-[1.01] group"
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    categoryColors[t.category] || "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]"
                  }`}
                >
                  {t.category}
                </span>
                <svg className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-primary-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </div>
              <h3 className="font-bold text-base mb-1">{t.title}</h3>
              <p className="text-xs text-primary-500 font-medium mb-2">{t.tagline}</p>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-3">{t.description}</p>
            </a>
          ))}
          {filteredTopics.length === 0 && topics.length > 0 && (
            <div className="card p-6 text-center text-sm text-[var(--muted-foreground)] col-span-full">
              No topics in this category.
            </div>
          )}
          {topics.length === 0 && (
            <div className="card p-6 text-center text-sm text-[var(--muted-foreground)] col-span-full">
              Loading topics...
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
