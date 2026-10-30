import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { reportForShareToken } from "@/lib/share";
import { fmtRangeLabel } from "@/lib/export/report";
import { Wordmark } from "@/components/ui/Logo";
import { buttonClass } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Shared observations", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const resolved = await reportForShareToken(token);
  if (!resolved) notFound();
  const { report, expiresAt } = resolved;
  const expires = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(new Date(expiresAt));

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-5 pb-24 pt-8 sm:px-8">
      <div className="flex items-center justify-between">
        <Wordmark />
        <a href={`/share/${token}/pdf`} className={buttonClass("secondary", "sm")}>Download PDF</a>
      </div>
      <h1 className="mt-10 text-[clamp(1.9rem,1.5rem+1.5vw,2.8rem)]">Observations · {report.nickname}</h1>
      <p className="mt-2 text-ink-soft">
        {fmtRangeLabel(report.from, report.to)} · {report.total} {report.total === 1 ? "entry" : "entries"} · recorded by a parent or caregiver
      </p>
      <p className="mt-1 text-[14px] text-ink-mute">Read-only link. It stops working on {expires}.</p>

      <div className="mt-10 space-y-10">
        {report.weeks.map((w, i) => (
          <section key={w.start}>
            <h2 className="text-[1.3rem]">Week {i + 1} <span className="text-[15px] text-ink-mute">· {fmtRangeLabel(w.start, w.end)}</span></h2>
            {w.rows.length === 0 ? (
              <p className="mt-2 text-[15px] text-ink-mute">Nothing recorded this week.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line rounded-lg bg-paper shadow-soft">
                {w.rows.map((r) => (
                  <li key={r.id} className="grid gap-1 px-4 py-3 text-[15px] sm:grid-cols-[6rem_1fr]">
                    <span className="tnum text-ink-mute">{r.date.slice(5).replace("-", "/")} {r.time}</span>
                    <div>
                      <p className="text-ink">{r.noticed}</p>
                      <p className="text-[14px] text-ink-soft">
                        {[r.beforeNote ? `${r.before}: ${r.beforeNote}` : r.before, r.afterNote ? `${r.after}: ${r.afterNote}` : r.after].filter(Boolean).join(" → ")}
                      </p>
                      {r.duration || r.intensity || r.note ? (
                        <p className="text-[13px] text-ink-mute">{[r.duration, r.intensity, r.note].filter(Boolean).join(" · ")}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section>
          <h2 className="text-[1.3rem]">Counts</h2>
          <p className="mt-1 text-[14px] text-ink-soft">What was recorded, how often. Not why.</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {[["Noticed", report.byBehavior], ["Right before", report.byAntecedent], ["Right after", report.byConsequence]].map(([title, counts]) => (
              <div key={title as string}>
                <h3 className="text-[1rem]">{title as string}</h3>
                <ul className="mt-2 space-y-1 text-[14px]">
                  {(counts as Array<{ label: string; count: number }>).map((c) => (
                    <li key={c.label} className="flex justify-between gap-3"><span className="text-ink-soft">{c.label}</span><span className="tnum">{c.count}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
      <p className="mt-14 text-[13px] text-ink-mute">
        Made with The Support Shelf. Nothing on this page is a diagnosis, an assessment, or a recommendation.
      </p>
    </main>
  );
}
