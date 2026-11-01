"use client";

import { useMemo, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import type { Job } from "@/lib/jobs";

type Filter = "all" | "jobs" | "programs" | "remote" | "part-time";

const FILTERS: Array<{ id: Filter; label: string; test: (j: Job) => boolean }> = [
  { id: "all", label: "Everything", test: () => true },
  { id: "jobs", label: "Jobs", test: (j) => j.kind === "Job" },
  { id: "programs", label: "Hiring programs", test: (j) => j.kind === "Hiring program" },
  { id: "remote", label: "Remote or hybrid", test: (j) => j.setting === "Remote" || j.setting === "Hybrid" },
  { id: "part-time", label: "Part-time or flexible", test: (j) => j.hours === "Part-time" || j.hours === "Flexible" },
];

/** Filters are plain chips: one tap, no dropdowns, and the count says what changed. */
export function JobBoard({ jobs, checked }: { jobs: Job[]; checked: Record<string, string | null> }) {
  const [filter, setFilter] = useState<Filter>("all");
  const shown = useMemo(() => jobs.filter(FILTERS.find((f) => f.id === filter)!.test), [jobs, filter]);
  const available = FILTERS.filter((f) => f.id === "all" || jobs.some(f.test));

  return (
    <div>
      {available.length > 2 ? (
        <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
          {available.map((f) => (
            <Chip key={f.id} selected={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</Chip>
          ))}
        </div>
      ) : null}
      <p aria-live="polite" className="mt-4 text-[14px] text-ink-mute">
        {shown.length === 1 ? "1 listing" : `${shown.length} listings`}
      </p>
      <ul className="mt-3 space-y-5">
        {shown.map((j) => <JobCard key={j.handle} job={j} checked={checked[j.handle] ?? null} />)}
      </ul>
    </div>
  );
}

function JobCard({ job, checked }: { job: Job; checked: string | null }) {
  const facts = [job.location, job.setting, job.hours, job.pay].filter(Boolean) as string[];
  return (
    <li className="paper-card p-5 sm:p-6">
      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-sage-deep">{job.kind}</p>
      <h2 className="mt-2 text-[1.35rem] leading-snug">{job.title}</h2>
      <p className="mt-1 text-[16px] text-ink-soft">{job.employer}</p>
      {facts.length ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Details">
          {facts.map((x) => <li key={x} className="rounded-pill border border-line px-3 py-1 text-[14px] text-ink-soft">{x}</li>)}
        </ul>
      ) : null}
      <h3 className="mt-5 font-sans text-[13px] font-medium uppercase tracking-[0.12em] text-ink-mute">Why it&apos;s on the list</h3>
      <ul className="mt-2 space-y-1.5 text-[15.5px] text-ink">
        {job.goodFit.map((g) => <li key={g} className="flex gap-2"><span aria-hidden className="text-sage-deep">·</span>{g}</li>)}
      </ul>
      {job.howToApply ? (
        <>
          <h3 className="mt-4 font-sans text-[13px] font-medium uppercase tracking-[0.12em] text-ink-mute">How applying works</h3>
          <p className="mt-1.5 text-[15.5px] text-ink-soft">{job.howToApply}</p>
        </>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="lift inline-flex min-h-12 items-center gap-2 rounded-pill bg-clay px-5 text-[16px] font-medium text-paper no-underline hover:bg-clay-deep">
          {job.kind === "Job" ? "Apply" : "See the program"}
          <span className="sr-only"> at {job.employer} (opens in a new tab)</span>
          <span aria-hidden>↗</span>
        </a>
        {checked ? <p className="text-[13px] text-ink-mute">Checked {checked}</p> : null}
      </div>
    </li>
  );
}
