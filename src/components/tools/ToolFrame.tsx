"use client";

import { useState } from "react";
import { ui } from "@/lib/content/data";
import { BoxBreathing } from "@/components/tools/BoxBreathing";
import { Grounding } from "@/components/tools/Grounding";

/** A calming tool with the "Do it together" toggle (bigger visuals, simpler words). */
export function ToolFrame({ tool }: { tool: "breathe" | "ground" }) {
  const [together, setTogether] = useState(false);
  const hint = `${tool}-together-hint`;
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2">
        <label className="flex min-h-11 items-center gap-3 rounded-pill border border-line-strong bg-paper px-4 text-[15px] text-ink">
          <input type="checkbox" checked={together} onChange={(e) => setTogether(e.target.checked)} className="h-6 w-6 accent-[var(--accent-text)]" aria-describedby={hint} />
          {ui.tools.together}
        </label>
        <p id={hint} className="text-center text-[13.5px] text-ink-mute">{ui.tools.togetherHint}</p>
      </div>
      {tool === "breathe" ? <BoxBreathing together={together} /> : <Grounding together={together} />}
    </div>
  );
}
