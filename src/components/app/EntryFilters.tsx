import type { BehaviorRow } from "@/lib/database.types";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

/** Plain GET form. Works without JavaScript; the URL is shareable between tabs. */
export function EntryFilters({ from, to, behaviorId, behaviors }: { from: string; to: string; behaviorId?: string; behaviors: BehaviorRow[] }) {
  return (
    <form method="get" className="grid grid-cols-2 gap-3 rounded-lg bg-paper p-4 shadow-soft">
      <label className="space-y-1 text-[13px] text-ink-mute">
        From
        <Input type="date" name="from" defaultValue={from} max={to} className="!text-[15px]" />
      </label>
      <label className="space-y-1 text-[13px] text-ink-mute">
        To
        <Input type="date" name="to" defaultValue={to} className="!text-[15px]" />
      </label>
      <label className="col-span-2 space-y-1 text-[13px] text-ink-mute">
        What
        <Select name="behavior" defaultValue={behaviorId ?? ""} className="!text-[15px]">
          <option value="">Everything</option>
          {behaviors.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
              {b.is_active ? "" : " (hidden)"}
            </option>
          ))}
        </Select>
      </label>
      <Button type="submit" variant="secondary" className="col-span-2">
        Show
      </Button>
    </form>
  );
}
