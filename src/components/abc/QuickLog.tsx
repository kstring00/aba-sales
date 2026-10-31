"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { ANTECEDENTS, CONSEQUENCES, DURATION_PRESETS, INTENSITY_LABELS, SEED_BEHAVIORS } from "@/lib/observation";
import type { AbcStore, AntecedentCode, ConsequenceCode } from "@/lib/abc/types";
import { addBehavior, addEntry, ensureBehaviors } from "@/lib/abc/store";
import { fmtTime, fromLocalInputValue, toLocalInputValue } from "@/lib/time/format";
import { BehaviorIcon, I } from "@/components/abc/icons";
import { fill, showItem, tracker } from "@/lib/content/data";

const L = tracker.labels;
const lower = (s: string) => s.trim().toLowerCase();

/**
 * The 15-second log. Three chip questions on one screen (what they did,
 * right before, right after), each with "+ my own words". Time defaults to
 * now. Everything else sits behind "+ Add detail". Save lives in a bar
 * pinned to the bottom of the screen, so it is reachable without
 * scrolling. No nickname here; that is asked at first export.
 */
export function QuickLog({ store, onSaved }: { store: AbcStore; onSaved: (labels: string[]) => void }) {
  const id = useId();
  const { toast } = useToast();
  const [when, setWhen] = useState("");
  const [editTime, setEditTime] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [extra, setExtra] = useState<string[]>([]);
  const [aCode, setACode] = useState<AntecedentCode | null>(null);
  const [aText, setAText] = useState("");
  const [cCode, setCCode] = useState<ConsequenceCode | null>(null);
  const [cText, setCText] = useState("");
  const [early, setEarly] = useState<string[]>([]);
  const [earlyExtra, setEarlyExtra] = useState<string[]>([]);
  const [detail, setDetail] = useState(false);
  const [looked, setLooked] = useState("");
  const [intensity, setIntensity] = useState<1 | 2 | 3 | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [exactMinutes, setExactMinutes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // "Now" is filled after mount so server and client markup match (audit F-10).
  useEffect(() => {
    const t = requestAnimationFrame(() => setWhen((w) => w || toLocalInputValue(new Date().toISOString())));
    return () => cancelAnimationFrame(t);
  }, []);

  const stored = store.behaviors.filter((b) => b.isActive).map((b) => b.label);
  const behaviorLabels = [...(stored.length ? stored : SEED_BEHAVIORS), ...extra.filter((l) => !stored.some((s) => lower(s) === lower(l)))];
  const showEarly = showItem(tracker.earlySigns);
  const earlyChips = [...tracker.earlySigns.chips, ...earlyExtra.filter((x) => !tracker.earlySigns.chips.some((c) => lower(c) === lower(x)))];
  const nudge = showItem(tracker.labelNudge) && selected.some((s) => tracker.labelNudge.behaviors.some((b) => lower(b) === lower(s)));

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function reset() {
    setSelected([]); setExtra([]);
    setACode(null); setAText(""); setCCode(null); setCText("");
    setEarly([]); setEarlyExtra([]);
    setLooked(""); setIntensity(null); setDuration(null); setExactMinutes("");
    setDetail(false); setEditTime(false); setError(null);
    setWhen(toLocalInputValue(new Date().toISOString()));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) { setError(L.pickOne); return; }
    ensureBehaviors([...SEED_BEHAVIORS]);
    const behaviorIds = selected.map((label) => addBehavior(label).id);
    addEntry({
      behaviorIds,
      occurredAt: fromLocalInputValue(when) ?? new Date().toISOString(),
      antecedentCode: aText.trim() ? "something_else" : aCode,
      antecedentNote: aText.trim() || null,
      consequenceCode: cText.trim() ? "something_else" : cCode,
      consequenceNote: cText.trim() || null,
      durationSeconds: duration,
      intensity,
      note: looked.trim() || null,
      functionCode: null,
      earlySigns: early.length ? early : null,
    });
    toast(selected.length === 1 ? L.saved : fill(L.savedMany, { n: selected.length }));
    onSaved(selected);
    reset();
  }

  const chip = (on: boolean) =>
    `inline-flex min-h-11 items-center gap-2 rounded-pill border px-4 text-[15px] leading-tight transition-colors ${on ? "border-sage-deep bg-sage-deep text-paper" : "border-line-strong bg-paper text-ink-soft hover:border-ink-faint"}`;
  const seg = (on: boolean) => `min-h-11 flex-1 rounded-pill px-3 text-[14.5px] ${on ? "bg-paper text-ink shadow-soft ring-1 ring-ink" : "text-ink-soft hover:bg-paper/60"}`;
  const nowLabel = when ? (editTime ? L.timeLabel : `${L.now} · ${fmtTime(fromLocalInputValue(when) ?? new Date().toISOString())}`) : L.now;

  return (
    <form onSubmit={save} className="paper-card relative p-5 sm:p-7" aria-labelledby={`${id}-h`} noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={`${id}-h`} className="text-[1.4rem]">{L.heading}</h2>
        {editTime ? (
          <label className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-line-strong bg-paper px-3 text-[14px] text-ink">
            <I.calendar className="h-4 w-4 text-ink-soft" />
            <span className="sr-only">{L.timeLabel}</span>
            <input type="datetime-local" autoFocus value={when} onChange={(e) => setWhen(e.target.value)} className="bg-transparent text-[14px] text-ink outline-none" />
          </label>
        ) : (
          <button type="button" onClick={() => setEditTime(true)} className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-line-strong bg-paper px-3 text-[14px] text-ink" aria-label={`${nowLabel}. ${L.changeTime}`}>
            <I.calendar className="h-4 w-4 text-ink-soft" />
            <span className="tnum">{nowLabel}</span>
          </button>
        )}
      </div>

      <ChipQuestion n={1} title={L.what}>
        {behaviorLabels.map((l) => (
          <button key={l} type="button" aria-pressed={selected.includes(l)} onClick={() => toggle(selected, setSelected, l)} className={chip(selected.includes(l))}>
            {selected.includes(l) ? <I.check className="h-4 w-4" /> : <BehaviorIcon label={l} className="h-4 w-4" />}
            {l}
          </button>
        ))}
        <OwnWords label={L.what} onAdd={(v) => { if (!behaviorLabels.some((l) => lower(l) === lower(v))) setExtra((x) => [...x, v]); const match = behaviorLabels.find((l) => lower(l) === lower(v)) ?? v; if (!selected.includes(match)) setSelected((s) => [...s, match]); }} />
      </ChipQuestion>
      {nudge ? <p className="mt-2 rounded-md bg-honey-soft px-3 py-2 text-[14px] text-ink" role="note">{tracker.labelNudge.text || `[${tracker.labelNudge.status}: describe-don't-label prompt]`}</p> : null}

      <ChipQuestion n={2} title={L.before}>
        {ANTECEDENTS.filter((a) => a.code !== "something_else").map((a) => (
          <button key={a.code} type="button" aria-pressed={aCode === a.code && !aText} onClick={() => { setAText(""); setACode(aCode === a.code ? null : a.code); }} className={chip(aCode === a.code && !aText)}>{a.label}</button>
        ))}
        <OwnWords label={L.before} value={aText} onAdd={(v) => { setAText(v); setACode(null); }} keepValue />
      </ChipQuestion>

      <ChipQuestion n={3} title={L.after}>
        {CONSEQUENCES.filter((c) => c.code !== "something_else").map((c) => (
          <button key={c.code} type="button" aria-pressed={cCode === c.code && !cText} onClick={() => { setCText(""); setCCode(cCode === c.code ? null : c.code); }} className={chip(cCode === c.code && !cText)}>{c.label}</button>
        ))}
        <OwnWords label={L.after} value={cText} onAdd={(v) => { setCText(v); setCCode(null); }} keepValue />
      </ChipQuestion>

      {showEarly ? (
        <ChipQuestion title={`${L.early}`} note={L.optional}>
          {earlyChips.map((x) => (
            <button key={x} type="button" aria-pressed={early.includes(x)} onClick={() => toggle(early, setEarly, x)} className={chip(early.includes(x))}>{x}</button>
          ))}
          <OwnWords label={L.early} onAdd={(v) => { if (!earlyChips.some((c) => lower(c) === lower(v))) setEarlyExtra((x) => [...x, v]); if (!early.includes(v)) setEarly((s) => [...s, v]); }} />
        </ChipQuestion>
      ) : null}

      <button type="button" aria-expanded={detail} aria-controls={`${id}-detail`} onClick={() => setDetail((d) => !d)} className="mt-6 inline-flex min-h-11 items-center text-[15px] font-medium text-heading underline underline-offset-4">
        {detail ? L.hideDetail : L.addDetail}
      </button>
      <div id={`${id}-detail`} hidden={!detail} className="mt-4 space-y-6">
        <label className="block">
          <span className="text-[15px] font-medium text-ink">{L.lookedLike}</span>
          <Textarea value={looked} onChange={(e) => setLooked(e.target.value)} maxLength={400} placeholder={L.lookedLikePlaceholder} className="mt-2 !min-h-20 text-[15px]" />
        </label>
        <fieldset>
          <legend className="text-[15px] font-medium text-ink">{L.intensity}</legend>
          <div className="mt-2 flex rounded-pill border border-line-strong bg-cream-deep p-1">
            {([1, 2, 3] as const).map((v) => (
              <button key={v} type="button" aria-pressed={intensity === v} onClick={() => setIntensity(intensity === v ? null : v)} className={seg(intensity === v)}>{INTENSITY_LABELS[v]}</button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-[15px] font-medium text-ink">{L.duration}</legend>
          <div className="mt-2 flex rounded-pill border border-line-strong bg-cream-deep p-1">
            {DURATION_PRESETS.map((d) => (
              <button key={d.seconds} type="button" aria-pressed={duration === d.seconds} onClick={() => { setExactMinutes(""); setDuration(duration === d.seconds ? null : d.seconds); }} className={`${seg(duration === d.seconds)} tnum`}>{d.label}</button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[13.5px] text-ink-mute">
            <label htmlFor={`${id}-mins`} className="sr-only">{L.exactMinutes}</label>
            <Input id={`${id}-mins`} type="number" inputMode="numeric" min={0} max={1440} value={exactMinutes} placeholder="min" className="!min-h-10 !w-24 !text-[14px]"
              onChange={(e) => { const v = e.target.value; setExactMinutes(v); setDuration(v === "" ? null : Math.max(0, Math.min(1440, Number(v))) * 60); }} />
            <span aria-hidden>{L.exactMinutes}</span>
          </div>
        </fieldset>
      </div>

      <div className="sticky bottom-0 z-10 -mx-5 mt-6 border-t border-line bg-paper/95 px-5 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur sm:-mx-7 sm:px-7">
        {error ? <p role="alert" className="mb-2 text-[14px] text-ink">{error}</p> : null}
        <button type="submit" className="sd-btn primary w-full !min-h-12 !text-[16px]">{L.save}</button>
      </div>
    </form>
  );
}

function ChipQuestion({ n, title, note, children }: { n?: number; title: string; note?: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-6">
      <legend className="font-display text-[1.15rem] text-ink">
        {n ? <span className="tnum mr-2 text-ink-mute">{n}.</span> : null}
        {title}
        {note ? <span className="ml-2 font-sans text-[13px] text-ink-mute">({note})</span> : null}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

/** "+ my own words": a chip that opens a one-line field. */
function OwnWords({ label, onAdd, value, keepValue = false }: { label: string; onAdd: (v: string) => void; value?: string; keepValue?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const commit = () => {
    const v = draft.trim();
    if (v) onAdd(v);
    if (!keepValue) setDraft("");
    setOpen(false);
  };
  if (!open) {
    return (
      <button type="button" onClick={() => { setDraft(value ?? ""); setOpen(true); }} className={`inline-flex min-h-11 items-center rounded-pill border border-dashed px-4 text-[15px] ${value ? "border-sage-deep bg-sage-deep text-paper" : "border-line-strong bg-paper text-ink"}`} aria-pressed={value ? true : undefined}>
        {value ? `“${value}”` : L.ownWords}
      </button>
    );
  }
  return (
    <span className="flex w-full basis-full items-center gap-2">
      <Input aria-label={`${label}: ${L.ownWordsPlaceholder}`} autoFocus value={draft} maxLength={60} onChange={(e) => setDraft(e.target.value)} placeholder={L.ownWordsPlaceholder}
        className="!min-h-11 min-w-0 flex-1 !rounded-pill sm:max-w-xs"
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } if (e.key === "Escape") setOpen(false); }} />
      <button type="button" onClick={commit} className="sd-btn">{L.add}</button>
    </span>
  );
}

/** Shown after saving a moment that includes a safety-relevant behavior. Links always show; wording appears once published. */
export function SafetyCard({ labels, onClose }: { labels: string[]; onClose: () => void }) {
  const card = tracker.safetyCard;
  if (!labels.some((l) => card.behaviors.some((b) => lower(b) === lower(l)))) return null;
  const words = showItem(card);
  return (
    <section role="status" aria-label="Safety" className="rounded-lg border border-line-strong bg-paper p-5 shadow-soft">
      {words ? <p className="font-display text-[1.15rem] text-ink">{card.title || `[${card.status}: safety card title]`}</p> : null}
      {words ? <p className="mt-2 text-[15px] text-ink-soft">{card.body || `[${card.status}: safety card body]`}</p> : null}
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px]">
        <Link href="/crisis" className="inline-flex min-h-11 items-center font-medium text-heading underline underline-offset-4">{card.crisisLink}</Link>
        <span className="text-ink">{card.talkLine}</span>
      </p>
      <button type="button" onClick={onClose} className="sd-btn mt-2">{card.dismiss}</button>
    </section>
  );
}
