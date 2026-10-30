"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Input, Label } from "@/components/ui/Field";
import { SEED_BEHAVIORS } from "@/lib/observation";
import { createChild, type ActionState } from "@/app/app/actions";

/** First run: one nickname, a few editable suggestions, done. */
export function Onboarding({ displayName }: { displayName: string | null }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createChild, null);
  const [selected, setSelected] = useState<string[]>(SEED_BEHAVIORS);
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const all = [...SEED_BEHAVIORS, ...custom];

  function toggle(label: string) {
    setSelected((s) => (s.includes(label) ? s.filter((x) => x !== label) : [...s, label]));
  }
  function addCustom() {
    const v = draft.trim();
    if (!v || all.some((x) => x.toLowerCase() === v.toLowerCase())) return setDraft("");
    setCustom((c) => [...c, v]);
    setSelected((s) => [...s, v]);
    setDraft("");
  }

  return (
    <main id="main" className="mx-auto w-full max-w-lg px-5 pt-6 sm:pt-12">
      <p className="text-[15px] text-ink-mute">{displayName ? `Hi ${displayName.split(" ")[0]}.` : "Hi."}</p>
      <h1 className="mt-2 text-[clamp(2rem,1.6rem+1.5vw,2.8rem)]">
        Who are you <span className="display-italic">noticing</span> for?
      </h1>
      <p className="mt-4 text-ink-soft">
        A nickname is all we store. No full name, no birthday. You can change it later.
      </p>

      <form action={action} className="mt-8 space-y-8">
        <div className="space-y-2">
          <Label htmlFor="nickname">Nickname</Label>
          <Input id="nickname" name="nickname" required maxLength={40} autoComplete="off" placeholder="Bean, Little A, my kiddo…" autoFocus />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-[15px] font-medium text-ink">
            What do you want to keep an eye on?
            <span className="ml-2 font-normal text-ink-mute">Tap to keep or remove. Add your own.</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {all.map((label) => (
              <Chip key={label} selected={selected.includes(label)} onClick={() => toggle(label)}>
                {label}
              </Chip>
            ))}
          </div>
          {selected.map((label) => (
            <input key={label} type="hidden" name="behavior" value={label} />
          ))}
          <div className="flex gap-2">
            <Input
              aria-label="Add your own"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
              maxLength={60}
              placeholder="Something else you notice"
            />
            <Button type="button" variant="secondary" onClick={addCustom}>
              Add
            </Button>
          </div>
        </fieldset>

        {state?.error ? (
          <p role="alert" className="text-[15px]">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
          {pending ? "Setting up…" : "Start tracking"}
        </Button>
        <p className="text-center text-[14px] text-ink-mute">
          These are your words for what you see. Nothing here labels your child.
        </p>
      </form>
    </main>
  );
}
