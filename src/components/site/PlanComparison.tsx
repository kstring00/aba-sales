/** One plain comparison. Free is a real tier, not a trial. */
const ROWS: Array<{ label: string; free: string | true; pro: string | true }> = [
  { label: "Logging, editing, deleting", free: "Unlimited", pro: "Unlimited" },
  { label: "PDF and CSV export", free: true, pro: true },
  { label: "Full data export (JSON)", free: true, pro: true },
  { label: "Pattern views", free: "—", pro: true },
  { label: "A second caregiver", free: "—", pro: true },
  { label: "Custom report layouts", free: "—", pro: true },
  { label: "Read-only share links (expire in 30 days)", free: "—", pro: true },
];

export function PlanComparison({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-lg bg-paper shadow-soft ${compact ? "text-[14px]" : "text-[15px]"}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-line text-left text-[13px] uppercase tracking-wider text-ink-mute">
            <th scope="col" className="px-4 py-3 font-medium">What you get</th>
            <th scope="col" className="px-3 py-3 font-medium">Free</th>
            <th scope="col" className="px-3 py-3 font-medium">Pro</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.label} className="border-b border-line last:border-0">
              <th scope="row" className="px-4 py-3 text-left font-normal text-ink">{r.label}</th>
              <td className="px-3 py-3 text-ink-soft">{r.free === true ? <Check /> : r.free}</td>
              <td className="px-3 py-3 text-ink-soft">{r.pro === true ? <Check /> : r.pro}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-3 text-[13px] text-ink-mute">Pro is $6 a month or $49 a year.</p>
    </div>
  );
}

function Check() {
  return (
    <svg aria-label="Included" role="img" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sage-deep">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
