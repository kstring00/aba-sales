"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ui } from "@/lib/content/data";

const T = ui.rightNow;

/**
 * "Is anyone in danger?" Two large answers. Yes shows the emergency actions;
 * No reveals the rest of the page. Both start hidden so nothing shifts when
 * scripts load; with scripts off, a <noscript> style shows everything.
 */
export function RightNowSafety({ question, rest }: { question: ReactNode; rest: ReactNode }) {
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const showDanger = answer === "yes";
  const showRest = answer === "no";
  return (
    <>
      <noscript>
        <style>{"@layer base{#rn-danger,#rn-rest{display:block!important}}"}</style>
      </noscript>
      {question}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" aria-expanded={showDanger} aria-controls="rn-danger" onClick={() => setAnswer("yes")} className={`min-h-16 rounded-xl border-2 px-5 text-left text-[1.15rem] font-semibold ${answer === "yes" ? "border-heading bg-heading text-paper" : "border-line-strong bg-paper text-heading"}`}>
          {T.yes}
        </button>
        <button type="button" aria-expanded={showRest} aria-controls="rn-rest" onClick={() => setAnswer("no")} className={`min-h-16 rounded-xl border-2 px-5 text-left text-[1.15rem] font-semibold ${answer === "no" ? "border-accent-text bg-accent-text text-paper" : "border-line-strong bg-paper text-heading"}`}>
          {T.no}
        </button>
      </div>
      <div id="rn-danger" hidden={!showDanger} className="mt-6 grid gap-3 sm:grid-cols-2">
        <a href="tel:911" className="flex min-h-16 items-center justify-center rounded-xl bg-heading px-5 text-[1.25rem] font-semibold text-paper">{T.call911}</a>
        <Link href="/crisis" className="flex min-h-16 items-center justify-center rounded-xl border-2 border-heading px-5 text-[1.15rem] font-semibold text-heading">{T.crisisLink}</Link>
      </div>
      <div id="rn-rest" hidden={!showRest}>{rest}</div>
    </>
  );
}
