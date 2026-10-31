"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { ANTECEDENTS, CONSEQUENCES, DURATION_PRESETS, FUNCTIONS, INTENSITY_LABELS, SEED_BEHAVIORS } from "@/lib/observation";
import type { AbcStore, AntecedentCode, ConsequenceCode, FunctionCode } from "@/lib/abc/types";
import { addBehavior, addEntry, setChild } from "@/lib/abc/store";
import { fromLocalInputValue, toLocalInputValue } from "@/lib/time/format";
import { BehaviorIcon, FunctionIcon, I } from "@/components/abc/icons";

/**
 * The tracker form. Six numbered steps on one card: nickname, behaviors
 * (multi-select), what it might be communicating (the parent's reflection,
 * not a diagnosis), A/B/C details, intensity, duration. Saving writes one
 * entry per selected behavior so counts stay per behavior. Everything stays
 * in localStorage.
 */
export function TrackerForm({ store }: { store: AbcStore }) {
  const id = useId();
  const { toast } = useToast();
  const [nickname, setNickname] = useState(store.child?.nickname ?? "");
  const [when, setWhen] = useState(() => toLocalInputValue(new Date().toISOString()));
  const [selected, setSelected] = useState<string[]>([]);
  const [extra, setExtra] = useState<string[]>([]);
  const [customOpen, setCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState("");
  const [fn, setFn] = useState<FunctionCode | null>(null);
  const [aCode, setACode] = useState<AntecedentCode | null>(null);
  const [aText, setAText] = useState("");
  const [bText, setBText] = useState("");
  const [cCode, setCCode] = useState<ConsequenceCode | null>(null);
  const [cText, setCText] = useState("");
  const [intensity, setIntensity] = useState<1 | 2 | 3 | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const nickRef = useRef<HTMLInputElement>(null);

  const stored = store.behaviors.filter((b) => b.isActive).map((b) => b.label);
  const labels = [...(stored.length ? stored : SEED_BEHAVIORS), ...extra.filter((l) => !stored.includes(l))];

  const toggle = (l: string) => setSelected((s) => (s.includes(l) ? s.filter((x) => x !== l) : [...s, l]));

  function addCustom() {
    const v = customDraft.trim();
    if (!v) return;
    if (!labels.some((l) => l.toLowerCase() === v.toLowerCase())) {
      if (store.child) addBehavior(v);
      else setExtra((x) => [...x, v]);
    }
    const match = labels.find((l) => l.toLowerCase() === v.toLowerCase()) ?? v;
    if (!selected.includes(match)) setSelected((s) => [...s, match]);
    setCustomDraft("");
    setCustomOpen(false);
  }

  function reset() {
    setSelected([]);
    setFn(null);
    setACode(null); setAText("");
    setBText("");
    setCCode(null); setCText("");
    setIntensity(null); setDuration(null);
    setWhen(toLocalInputValue(new Date().toISOString()));
    setError(null);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const nick = nickname.trim();
    if (!nick) { setError("Add a nickname first. It stays in this browser."); nickRef.current?.focus(); return; }
    if (selected.length === 0) { setError("Pick at least one behavior you noticed."); return; }
    const occurredAt = fromLocalInputValue(when) ?? new Date().toISOString();
    // First save creates the child and seeds the labels; later saves just keep the nickname current.
    setChild(nick, store.behaviors.length ? undefined : [...SEED_BEHAVIORS, ...extra]);
    for (const label of selected) {
      const b = addBehavior(label);
      addEntry({
        behaviorId: b.id,
        occurredAt,
        antecedentCode: aCode ?? (aText.trim() ? "something_else" : null),
        antecedentNote: aText.trim() || null,
        consequenceCode: cCode ?? (cText.trim() ? "something_else" : null),
        consequenceNote: cText.trim() || null,
        durationSeconds: duration,
        intensity,
        note: bText.trim() || null,
        functionCode: fn,
      });
    }
    toast(selected.length === 1 ? `Saved 1 entry for ${nick}.` : `Saved ${selected.length} entries for ${nick}.`);
    setExtra([]);
    reset();
  }

  const chip = (on: boolean) =>
    `lift inline-flex min-h-11 items-center gap-2 rounded-pill border px-4 text-[15px] leading-tight ${on ? "border-sage-deep bg-sage-deep text-paper" : "border-line-strong bg-paper text-ink-soft hover:border-ink-faint"}`;
  const seg = (on: boolean) => `min-h-11 flex-1 px-3 text-[14.5px] ${on ? "bg-paper text-ink shadow-soft ring-1 ring-ink" : "text-ink-soft hover:bg-paper/60"}`;

  return (
    <form onSubmit={save} className="paper-card p-5 sm:p-7" aria-labelledby={`${id}-h`} noValidate>
      <h2 id={`${id}-h`} className="sr-only">Log an observation</h2>

      {/* 1. nickname + date */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <StepTitle n={1} htmlFor={`${id}-nick`}>Child nickname</StepTitle>
          <p className="mt-1 text-[14px] text-ink-mute">A nickname is all this needs. It stays in this browser.</p>
        </div>
        <label className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-line-strong bg-paper px-3 text-[14px] text-ink">
          <I.calendar className="h-4 w-4 text-ink-soft" />
          <span className="sr-only">Date and time</span>
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="bg-transparent text-[14px] text-ink outline-none" />
        </label>
      </div>
      <Input ref={nickRef} id={`${id}-nick`} value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={40} autoComplete="off" placeholder="Bean, Little A, my kiddo…" className="mt-3" aria-label="Child nickname" />

      {/* 2. behaviors */}
      <fieldset className="mt-8">
        <legend><StepTitle n={2}>What are you noticing?</StepTitle></legend>
        <p className="mt-1 text-[14px] text-ink-mute">Select all that apply. You can also add your own.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {labels.map((l) => (
            <button key={l} type="button" aria-pressed={selected.includes(l)} onClick={() => toggle(l)} className={chip(selected.includes(l))}>
              {selected.includes(l) ? <I.check className="h-4 w-4" /> : <BehaviorIcon label={l} className="h-4 w-4" />}
              {l}
            </button>
          ))}
          {customOpen ? (
            <span className="flex w-full basis-full items-center gap-2">
              <Input aria-label="Custom behavior" autoFocus value={customDraft} maxLength={60} onChange={(e) => setCustomDraft(e.target.value)} placeholder="Describe what you see" className="!min-h-11 min-w-0 flex-1 !rounded-pill sm:max-w-xs"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } if (e.key === "Escape") setCustomOpen(false); }} />
              <Button type="button" size="sm" variant="secondary" onClick={addCustom}>Add</Button>
            </span>
          ) : (
            <button type="button" onClick={() => setCustomOpen(true)} className="lift inline-flex min-h-11 items-center gap-2 rounded-pill border border-dashed border-line-strong bg-paper px-4 text-[15px] text-ink hover:border-ink">
              <I.plus className="h-4 w-4" /> Add custom behavior
            </button>
          )}
        </div>
      </fieldset>

      {/* 3. function (reflection) */}
      <fieldset className="mt-8">
        <legend><StepTitle n={3}>What might the behavior be communicating?</StepTitle></legend>
        <p className="mt-1 text-[14px] text-ink-mute">This is for reflection and discussion with your BCBA. It is not a diagnosis.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {FUNCTIONS.map((f) => (
            <button key={f.code} type="button" aria-pressed={fn === f.code} onClick={() => setFn(fn === f.code ? null : f.code)} className={chip(fn === f.code)}>
              <FunctionIcon code={f.code} className="h-4 w-4" />
              {f.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* 4. ABC details */}
      <fieldset className="mt-8">
        <legend><StepTitle n={4}>ABC details</StepTitle></legend>
        <p className="mt-1 text-[14px] text-ink-mute">Add a few details about what happened. Tap a phrase or write your own.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <AbcBox letter="A" tint="bg-sky" title="What happened right before?" sub="(Antecedent)">
            <QuickPicks label="Right before, common phrases" options={ANTECEDENTS} value={aCode} onChange={(v) => setACode(v as AntecedentCode | null)} />
            <Textarea aria-label="What happened right before" value={aText} onChange={(e) => setAText(e.target.value)} maxLength={400} placeholder="What was happening? What was asked? What changed?" className="mt-2 !min-h-20 text-[14.5px]" />
          </AbcBox>
          <AbcBox letter="B" tint="bg-blush" title="What happened?" sub="(Behavior)">
            <Textarea aria-label="What happened" value={bText} onChange={(e) => setBText(e.target.value)} maxLength={400} placeholder="What did you see or hear? Be as specific as you can." className="!min-h-20 text-[14.5px]" />
          </AbcBox>
          <AbcBox letter="C" tint="bg-mint" title="What happened right after?" sub="(Consequence)">
            <QuickPicks label="Right after, common phrases" options={CONSEQUENCES} value={cCode} onChange={(v) => setCCode(v as ConsequenceCode | null)} />
            <Textarea aria-label="What happened right after" value={cText} onChange={(e) => setCText(e.target.value)} maxLength={400} placeholder="What happened next? How did others respond? What stopped the behavior?" className="mt-2 !min-h-20 text-[14.5px]" />
          </AbcBox>
        </div>
      </fieldset>

      {/* 5 + 6 */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <fieldset>
          <legend><StepTitle n={5}>Intensity <span className="ml-1 text-[13px] font-normal text-ink-mute">(optional)</span></StepTitle></legend>
          <div className="mt-3 flex overflow-hidden rounded-pill border border-line-strong bg-cream-deep p-1" role="group" aria-label="Intensity">
            {([1, 2, 3] as const).map((v) => (
              <button key={v} type="button" aria-pressed={intensity === v} onClick={() => setIntensity(intensity === v ? null : v)} className={`${seg(intensity === v)} rounded-pill`}>
                <span className="tnum mr-1 text-ink-mute">{v}</span>{INTENSITY_LABELS[v]}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend><StepTitle n={6}>Duration <span className="ml-1 text-[13px] font-normal text-ink-mute">(optional)</span></StepTitle></legend>
          <div className="mt-3 flex overflow-hidden rounded-pill border border-line-strong bg-cream-deep p-1" role="group" aria-label="Duration">
            {DURATION_PRESETS.map((d) => (
              <button key={d.seconds} type="button" aria-pressed={duration === d.seconds} onClick={() => setDuration(duration === d.seconds ? null : d.seconds)} className={`${seg(duration === d.seconds)} tnum rounded-pill`}>
                {d.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {error ? <p role="alert" className="mt-6 rounded-md bg-clay-tint px-4 py-3 text-[15px] text-ink">{error}</p> : null}
      <Button type="submit" variant="primary" size="lg" className="mt-6 w-full">Save entry</Button>
      <p className="mt-3 text-center text-[13px] text-ink-mute">This tool helps you organize observations. It does not diagnose or replace professional guidance.</p>
    </form>
  );
}

function StepTitle({ n, children, htmlFor }: { n: number; children: React.ReactNode; htmlFor?: string }) {
  const inner = (
    <>
      <span className="tnum mr-2 text-ink-mute">{n}.</span>
      {children}
    </>
  );
  return htmlFor ? (
    <label htmlFor={htmlFor} className="font-display text-[1.2rem] text-ink">{inner}</label>
  ) : (
    <span className="font-display text-[1.2rem] text-ink">{inner}</span>
  );
}

function AbcBox({ letter, tint, title, sub, children }: { letter: string; tint: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-cream p-3">
      <div className="flex items-start gap-2">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${tint} font-display text-[1rem] text-ink`}>{letter}</span>
        <p className="text-[14px] leading-snug text-ink">
          <span className="font-medium">{title}</span>
          <span className="block text-[13px] text-ink-mute">{sub}</span>
        </p>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** The original "right before" / "right after" lists, as a compact native select above the free-text box. */
function QuickPicks({ label, options, value, onChange }: { label: string; options: ReadonlyArray<{ code: string; label: string }>; value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className={`min-h-10 w-full appearance-none rounded-md border bg-paper py-2 pl-3 pr-8 text-[13.5px] focus:border-sage-deep focus:outline-none ${value ? "border-sage-deep text-ink" : "border-line text-ink-soft"}`}
      >
        <option value="">Pick a common phrase…</option>
        {options.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
      </select>
      <I.chevron className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
    </div>
  );
}
