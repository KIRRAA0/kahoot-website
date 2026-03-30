"use client";

import { useEffect, useState } from "react";
import { Assessment } from "@/lib/types";
import AssessmentCard from "@/components/assessment/AssessmentCard";
import SearchBar from "@/components/assessment/SearchBar";
import FilterTabs from "@/components/assessment/FilterTabs";

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/assessments")
      .then((res) => res.json())
      .then((data) => setAssessments(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = assessments.filter((a) => {
    if (filter !== "all" && a.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Assessments</h1>
        <p className="text-[var(--muted-foreground)]">
          Browse all weekly assessments and their questions.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search assessments..." />
        </div>
        <FilterTabs activeFilter={filter} onFilterChange={setFilter} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 w-24 bg-[var(--muted)] rounded mb-4" />
              <div className="h-6 w-3/4 bg-[var(--muted)] rounded mb-2" />
              <div className="h-4 w-full bg-[var(--muted)] rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--muted-foreground)]">
            {search || filter !== "all" ? "No assessments match your search." : "No assessments available."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((assessment) => (
            <AssessmentCard key={assessment._id} assessment={assessment} />
          ))}
        </div>
      )}
    </div>
  );
}
