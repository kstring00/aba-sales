"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LogSheet } from "@/components/app/LogSheet";
import { EntryList } from "@/components/app/EntryList";
import type { BehaviorRow, EntryRow } from "@/lib/database.types";
import type { EntryWithBehavior } from "@/lib/data";
import { refreshIfSynced } from "@/lib/entries/refresh";

type Props = {
  childId: string;
  childNickname: string;
  userId: string;
  behaviors: BehaviorRow[];
  recentEntries: EntryWithBehavior[];
};

/** The whole product on one screen: one button, one sheet, today's list. */
export function LogHome({ childId, childNickname, userId, behaviors: initial, recentEntries }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [behaviors, setBehaviors] = useState(initial);
  const [entries, setEntries] = useState(recentEntries);

  return (
    <>
      <div className="mt-6">
        <Button variant="primary" size="lg" className="w-full !min-h-16 text-[18px]" onClick={() => setOpen(true)}>
          Log what happened
        </Button>
        <p className="mt-3 text-center text-[14px] text-ink-mute">Three taps. You can add details or skip them.</p>
      </div>

      <section className="mt-12">
        <h2 className="mb-3 font-sans text-[13px] font-medium uppercase tracking-wider text-ink-mute">Today</h2>
        <EntryList
          key={entries.map((e) => e.id + e.updated_at).join("|")}
          entries={entries}
          behaviors={behaviors}
          childId={childId}
          userId={userId}
          todayOnly
          emptyText={`Nothing logged for ${childNickname} yet today. That's fine.`}
        />
      </section>

      <LogSheet
        open={open}
        onClose={() => setOpen(false)}
        childId={childId}
        userId={userId}
        behaviors={behaviors}
        mode={{ kind: "create" }}
        onBehaviorAdded={(b) => setBehaviors((bs) => [...bs, b])}
        onSaved={(entry: EntryRow, label, pendingSync) => {
          setEntries((list) => [{ ...entry, behavior_label: label }, ...list.filter((x) => x.id !== entry.id)]);
          refreshIfSynced(router, pendingSync);
        }}
      />
    </>
  );
}
