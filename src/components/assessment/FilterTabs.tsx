"use client";

import { cn } from "@/lib/cn";

interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { value: "all", label: "All" },
  { value: "pre-assessment", label: "Pre-Assessment" },
  { value: "post-assessment", label: "Post-Assessment" },
  { value: "combined", label: "Combined" },
];

export default function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-[var(--muted)]">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
            activeFilter === filter.value
              ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
