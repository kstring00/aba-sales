"use client";

import { useMemo, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";

const NEEDS = [
  { id: "meal", label: "A meal", line: "a meal we could reheat one evening" },
  { id: "errand", label: "An errand", line: "help with an errand or a pharmacy run" },
  { id: "ride", label: "A ride", line: "a ride to or from an appointment" },
  { id: "paperwork", label: "Paperwork", line: "an hour helping me sort paperwork" },
  { id: "sibling", label: "Time with a sibling", line: "some time with our other kid while we're at an appointment" },
  { id: "company", label: "Company", line: "a cup of coffee and some company" },
];

/**
 * Concept B. Helps a parent turn "let me know if you need anything" into one
 * concrete ask. Everything happens in the browser; nothing is sent anywhere.
 */
export function AskForHelp() {
  const [picked, setPicked] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [when, setWhen] = useState("this week");
  const [copied, setCopied] = useState(false);

  const message = useMemo(() => {
    const lines = NEEDS.filter((n) => picked.includes(n.id)).map((n) => n.line);
    const ask = lines.length === 0 ? "one practical thing" : lines.length === 1 ? lines[0] : `${lines.slice(0, -1).join(", ")}, or ${lines[lines.length - 1]}`;
    return `Hi${name ? ` ${name}` : ""}. You've asked how you can help, and I've been thinking about it. ${when === "this week" ? "This week" : when}, ${ask} would genuinely make a difference. No pressure at all if it doesn't work out. Thank you for asking.`;
  }, [picked, name, when]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* the text is visible to copy by hand */
    }
  }

  return (
    <div className="rounded-lg bg-paper p-6 shadow-soft" aria-labelledby="ask-h">
      <p className="text-[13px] uppercase tracking-[0.18em] text-ink-mute">Free · in your browser</p>
      <h3 id="ask-h" className="mt-2">Make it easier to ask for help</h3>
      <p className="mt-2 text-[15px] text-ink-soft">
        People say &ldquo;let me know if you need anything.&rdquo; This turns it into one practical thing. Pick what would help, add a name, copy the message.
      </p>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="What would help">
        {NEEDS.map((n) => (
          <Chip key={n.id} selected={picked.includes(n.id)} onClick={() => setPicked((p) => (p.includes(n.id) ? p.filter((x) => x !== n.id) : [...p, n.id]))}>
            {n.label}
          </Chip>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input aria-label="Their name (optional)" placeholder="Their name (optional)" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
        <Input aria-label="When" placeholder="When, e.g. this week" value={when} onChange={(e) => setWhen(e.target.value)} maxLength={40} />
      </div>
      <Textarea aria-label="Your message" className="mt-3" rows={5} value={message} readOnly />
      <div className="mt-3 flex items-center gap-3">
        <Button type="button" variant="secondary" onClick={() => void copy()}>{copied ? "Copied" : "Copy message"}</Button>
        <span className="text-[13px] text-ink-mute">Nothing here is saved or sent by us.</span>
      </div>
    </div>
  );
}
