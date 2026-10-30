"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import type { ChildWithRole } from "@/lib/data";
import { createChild, deleteChild, leaveChild, renameChild, type ActionState } from "@/app/app/actions";

export function ChildrenSettings({ items }: { items: ChildWithRole[] }) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-3">
      <ul className="divide-y divide-line rounded-lg bg-paper shadow-soft">
        {items.map((c) => (
          <ChildRowItem key={c.id} child={c} />
        ))}
      </ul>
      {adding ? (
        <AddChildForm onDone={() => setAdding(false)} />
      ) : (
        <Button type="button" variant="secondary" onClick={() => setAdding(true)}>
          Add another child
        </Button>
      )}
    </div>
  );
}

function AddChildForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, fd) => {
    const r = await createChild(prev, fd);
    if (r?.ok) onDone();
    return r;
  }, null);
  return (
    <form action={action} className="space-y-3 rounded-lg bg-paper p-4 shadow-soft">
      <label htmlFor="new-nick" className="text-[15px] font-medium">Nickname</label>
      <Input id="new-nick" name="nickname" required maxLength={40} autoFocus />
      <p className="text-[14px] text-ink-mute">You can set up what to track from the logging screen.</p>
      {state?.error ? <p role="alert" className="text-[15px]">{state.error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={pending}>{pending ? "Adding…" : "Add"}</Button>
        <Button type="button" variant="quiet" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}

function ChildRowItem({ child }: { child: ChildWithRole }) {
  const [mode, setMode] = useState<"view" | "rename" | "delete">("view");
  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, fd) => {
    const r = await renameChild(prev, fd);
    if (r?.ok) setMode("view");
    return r;
  }, null);

  return (
    <li className="px-4 py-4">
      {mode === "view" ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[16px]">{child.nickname}</p>
            <p className="text-[13px] text-ink-mute">{child.role === "owner" ? "You own this record" : "Shared with you"}</p>
          </div>
          <div className="flex gap-1">
            {child.role === "owner" ? (
              <>
                <Button size="sm" variant="quiet" onClick={() => setMode("rename")}>Rename</Button>
                <Button size="sm" variant="quiet" onClick={() => setMode("delete")}>Delete</Button>
              </>
            ) : (
              <form action={leaveChild}>
                <input type="hidden" name="child_id" value={child.id} />
                <Button size="sm" variant="quiet" type="submit">Leave</Button>
              </form>
            )}
          </div>
        </div>
      ) : null}

      {mode === "rename" ? (
        <form action={action} className="flex flex-col gap-2 sm:flex-row">
          <input type="hidden" name="child_id" value={child.id} />
          <Input name="nickname" defaultValue={child.nickname} maxLength={40} required aria-label="Nickname" autoFocus />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={pending}>Save</Button>
            <Button type="button" variant="quiet" onClick={() => setMode("view")}>Cancel</Button>
          </div>
          {state?.error ? <p role="alert" className="text-[15px]">{state.error}</p> : null}
        </form>
      ) : null}

      {mode === "delete" ? (
        <form action={deleteChild} className="space-y-3 rounded-md bg-cream p-4">
          <input type="hidden" name="child_id" value={child.id} />
          <p className="text-[15px]">
            This deletes <strong>{child.nickname}</strong> and every entry, for you and anyone you&apos;ve
            shared with. It can&apos;t be undone. Export first if you want a copy.
          </p>
          <label className="block text-[14px] text-ink-soft">
            Type the nickname to confirm
            <Input name="confirm" autoComplete="off" required className="mt-1" />
          </label>
          <div className="flex gap-2">
            <Button type="submit" variant="danger">Delete for good</Button>
            <Button type="button" variant="quiet" onClick={() => setMode("view")}>Keep</Button>
          </div>
        </form>
      ) : null}
    </li>
  );
}
