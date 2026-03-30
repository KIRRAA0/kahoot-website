"use client";

import Link from "next/link";
import { Assessment } from "@/lib/types";
import { cn } from "@/lib/cn";

const typeConfig = {
  "pre-assessment": { color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", label: "Pre-Assessment" },
  "post-assessment": { color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20", label: "Post-Assessment" },
  combined: { color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", label: "Combined" },
};

export default function AssessmentCard({ assessment }: { assessment: Assessment }) {
  const config = typeConfig[assessment.type];

  return (
    <Link href={`/assessments/${assessment._id}`}>
      <div className="card p-6 hover:shadow-lg hover:border-primary-500/30 transition-all duration-200 cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", config.color)}>
            {config.label}
          </span>
          <span className="text-sm text-[var(--muted-foreground)]">
            {assessment.questionCount} questions
          </span>
        </div>

        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {assessment.title}
        </h3>

        {assessment.description && (
          <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-2">
            {assessment.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {assessment.weeks.length > 0 && (
            <div className="flex gap-1">
              {assessment.weeks.map((w) => (
                <span key={w} className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--muted)] text-xs font-medium text-[var(--muted-foreground)]">
                  Week {w}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
          View Questions
          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
