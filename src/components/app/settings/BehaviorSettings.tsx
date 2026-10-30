"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import type { BehaviorRow } from "@/lib/database.types";
import { addBehavior, deleteBehavior, renameBehavior, setBehaviorActive, type ActionState } from "@/app/app/actions";

export function BehaviorSettings({ childId, behaviors }: { childId: string; behaviors: BehaviorRow[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addBehavior, null);
  const active = behaviors.filter((b) => b.is_active);
  const hidden = behaviors.filter((b) => !b.is_active);

  return (
    <div className="space-y-4">
      <p className="text-[15px] text-ink-soft">
        Your words for what you notice. Hiding a label keeps its past entries; deleting is only possible when nothing uses it.
      </p>
      <ul className="divide-y divide-line rounded-lg bg-paper shadow-soft">
        {active.map((b) => (
          <BehaviorItem key={b.id} b={b} />
        ))}
        {active.length === 0 ? <li className="px-4 py-4 text-[15px] text-ink-mute">No labels yet.</li> : null}
      </ul>
      <form action={action} className="flex gap-2">
        <input type="hidden" name="child_id" value={childId} />
        <Input name="label" aria-label="New label" placeholder="Add a label" maxLength={60} required />
        <Button type="submit" variant="secondary" disabled={pending}>Add</Button>
      </form>
      {state?.error ? <p role="alert" className="text-[15px]">{state.error}</p> : null}

      {hidden.length > 0 ? (
        <details className="rounded-lg bg-paper shadow-soft">
          <summary className="cursor-pointer px-4 py-3 text-[15px] text-ink-soft">Hidden labels ({hidden.length})</summary>
          <ul className="divide-y divide-line border-t border-line">
            {hidden.map((b) => (
              <BehaviorItem key={b.id} b={b} />
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function BehaviorItem({ b }: { b: BehaviorRow }) {
  const [renaming, setRenaming] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, fd) => {
    const r = await renameBehavior(prev, fd);
    if (r?.ok) setRenaming(false);
    return r;
  }, null);

  return (
    <li className="px-4 py-3">
      {renaming ? (
        <form action={action} className="flex gap-2">
          <input type="hidden" name="behavior_id" value={b.id} />
          <Input name="label" defaultValue={b.label} maxLength={60} required aria-label="Label" autoFocus />
          <Button type="submit" size="sm" variant="primary" disabled={pending}>Save</Button>
          <Button type="button" size="sm" variant="quiet" onClick={() => setRenaming(false)}>Cancel</Button>
          {state?.error ? <p role="alert" className="text-[14px]">{state.error}</p> : null}
        </form>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[16px] ${b.is_active ? "" : "text-ink-mute"}`}>{b.label}</span>
          <div className="flex shrink-0 gap-1">
            <Button size="sm" variant="quiet" onClick={() => setRenaming(true)}>Rename</Button>
            <form action={setBehaviorActive}>
              <input type="hidden" name="behavior_id" value={b.id} />
              <input type="hidden" name="active" value={b.is_active ? "false" : "true"} />
              <Button size="sm" variant="quiet" type="submit">{b.is_active ? "Hide" : "Show"}</Button>
            </form>
            {!b.is_active ? (
              <form action={deleteBehavior}>
                <input type="hidden" name="behavior_id" value={b.id} />
                <Button size="sm" variant="quiet" type="submit">Delete</Button>
              </form>
            ) : null}
          </div>
        </div>
      )}
    </li>
  );
}
