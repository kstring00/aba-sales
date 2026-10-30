"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { selectChild } from "@/app/app/actions";
import type { ChildWithRole } from "@/lib/data";

export function ChildSwitcher({ children, selectedId }: { children: ChildWithRole[]; selectedId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (children.length < 2) return null;
  return (
    <div className="scroll-quiet -mx-5 flex gap-2 overflow-x-auto px-5" role="tablist" aria-label="Child">
      {children.map((c) => {
        const active = c.id === selectedId;
        return (
          <button
            key={c.id}
            role="tab"
            aria-selected={active}
            disabled={pending}
            onClick={() =>
              start(async () => {
                await selectChild(c.id);
                router.refresh();
              })
            }
            className={`lift min-h-11 shrink-0 rounded-pill border px-4 text-[15px] ${
              active ? "border-ink bg-ink text-paper" : "border-line-strong bg-paper text-ink-soft"
            }`}
          >
            {c.nickname}
          </button>
        );
      })}
    </div>
  );
}
