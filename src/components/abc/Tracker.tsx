"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useAbcStore } from "@/lib/abc/useAbcStore";
import { addBehavior, clearAll, deleteBehavior, renameChild, setBehaviorActive, withLabels } from "@/lib/abc/store";
import { QuickLog, SafetyCard } from "@/components/abc/QuickLog";
import { BcbaPreview } from "@/components/abc/BcbaPreview";
import { EntryList } from "@/components/abc/EntryList";
import { Insights } from "@/components/abc/Insights";
import { MIN_FOR_PATTERNS } from "@/lib/abc/patterns";
import { showItem, tracker } from "@/lib/content/data";

type View = "insights" | "list";
const WALKTHROUGH_KEY = "support-shelf-abc-walkthrough-seen";

/**
 * The tracker page body: form and entries on the left, what the BCBA
 * receives plus two short explainers on the right. All state is the
 * localStorage store; nothing here talks to a server except the optional
 * "email me my export".
 */
const NEXT_SEEN_KEY = "support-shelf-abc-next-seen";

export function Tracker({ explainers, lessonVisible = false }: { explainers: React.ReactNode; lessonVisible?: boolean }) {
  const { store, hydrated } = useAbcStore();
  const [chosenView, setView] = useState<View | null>(null);
  const [settings, setSettings] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [lastSaved, setLastSaved] = useState<string[] | null>(null);
  const [walkthrough, setWalkthrough] = useState(false);
  const entries = useMemo(() => withLabels(store), [store]);
  const nickname = store.child?.nickname ?? "";
  // "What you're noticing" is the default once there are enough moments; List stays a tab.
  const view: View = chosenView ?? (entries.length >= MIN_FOR_PATTERNS ? "insights" : "list");
  const dyk = tracker.didYouKnow;
  const dykLine = showItem(dyk) ? (dyk.lines.length ? dyk.lines[entries.length % dyk.lines.length] : `[${dyk.status}: "Did you know" lines]`) : null;

  // First visit: a short walkthrough, once, when its wording exists (or on preview).
  useEffect(() => {
    if (!hydrated || !showItem(tracker.walkthrough)) return;
    let seen = false;
    try { seen = Boolean(localStorage.getItem(WALKTHROUGH_KEY)); } catch { /* show it */ }
    if (seen || entries.length > 0) return;
    const id = requestAnimationFrame(() => setWalkthrough(true));
    return () => cancelAnimationFrame(id);
  }, [hydrated, entries.length]);
  const dismissWalkthrough = () => { setWalkthrough(false); try { localStorage.setItem(WALKTHROUGH_KEY, "1"); } catch { /* ignore */ } };

  // One-time "what to do next" card after the first saved observation.
  useEffect(() => {
    if (!hydrated || entries.length === 0) return;
    try {
      if (localStorage.getItem(NEXT_SEEN_KEY)) return;
    } catch { /* storage unavailable: show it this once */ }
    const id = requestAnimationFrame(() => setShowNext(true));
    return () => cancelAnimationFrame(id);
  }, [hydrated, entries.length]);
  const dismissNext = () => { setShowNext(false); try { localStorage.setItem(NEXT_SEEN_KEY, "1"); } catch { /* ignore */ } };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
      <div className="min-w-0 space-y-8">
        <section className="rounded-lg border border-line bg-paper/70 px-5 py-4 text-[14.5px] text-ink-soft" aria-label="What ABC is">
          <p><strong className="font-medium text-ink">A</strong> is what happened right before. <strong className="font-medium text-ink">B</strong> is the behavior you saw. <strong className="font-medium text-ink">C</strong> is what happened right after.</p>
          <p className="mt-1">Write what you saw, not what it means. Noticing what happens before and after can help you and your BCBA spot what the behavior might be communicating.</p>
        </section>
        {walkthrough ? (
          <section className="rounded-lg border border-dashed border-honey bg-honey-soft p-5" aria-label="How it works">
            <p className="font-display text-[1.15rem] text-ink">{tracker.walkthrough.title || `[${tracker.walkthrough.status}: walkthrough title]`}</p>
            {tracker.walkthrough.steps.length ? (
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-[14.5px] text-ink-soft">{(tracker.walkthrough.steps as string[]).map((s) => <li key={s}>{s}</li>)}</ol>
            ) : <p className="mt-2 text-[14.5px] text-ink-soft">[{tracker.walkthrough.status}: three or four steps using the shoes example]</p>}
            <Button type="button" size="sm" variant="secondary" className="mt-3" onClick={dismissWalkthrough}>{tracker.walkthrough.dismiss}</Button>
          </section>
        ) : null}
        <QuickLog store={store} onSaved={(labels) => setLastSaved(labels)} />
        {lastSaved ? <SafetyCard labels={lastSaved} onClose={() => setLastSaved(null)} /> : null}
        {lastSaved && dykLine ? <p role="status" className="rounded-md bg-cream px-4 py-3 text-[14.5px] text-ink-soft">{dykLine}</p> : null}
        {showNext ? (
          <section className="rounded-lg bg-sage-tint p-5" role="status" aria-label="What happens next">
            <p className="font-display text-[1.15rem] text-ink">{tracker.whatNext.title}</p>
            <ul className="mt-2 space-y-1 text-[14.5px] text-ink-soft">
              {tracker.whatNext.items.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <Button type="button" size="sm" variant="secondary" className="mt-3" onClick={dismissNext}>{tracker.whatNext.dismiss}</Button>
          </section>
        ) : null}

        <section className="paper-card p-5 sm:p-6" aria-labelledby="entries-h">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="entries-h" className="text-[1.25rem]">Observations <span className="tnum text-[15px] text-ink-mute">· {entries.length}</span></h2>
            <div role="tablist" aria-label="View" className="flex gap-1 rounded-pill bg-cream-deep p-1">
              {([["insights", tracker.insights.tab], ["list", tracker.insights.listTab]] as const).map(([v, label]) => (
                <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
                  className={`min-h-10 rounded-pill px-3 text-[14px] ${view === v ? "bg-paper text-ink shadow-soft" : "text-ink-soft"}`}>{label}</button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            {!hydrated ? <p className="text-[15px] text-ink-mute">Loading your observations…</p> : null}
            {hydrated && view === "list" ? <EntryList entries={entries} behaviors={store.behaviors} emptyText={nickname ? `Nothing logged for ${nickname} yet. That's fine.` : "Nothing logged yet. Your saved observations appear here, and you can tap one to edit it."} /> : null}
            {hydrated && view === "insights" ? <Insights entries={entries} lessonVisible={lessonVisible} /> : null}
          </div>
        </section>

        <section className="paper-card p-5 sm:p-6" aria-labelledby="settings-h">
          <button type="button" className="flex min-h-11 w-full items-center justify-between text-left" aria-expanded={settings} onClick={() => setSettings((s) => !s)}>
            <h2 id="settings-h" className="text-[1.25rem]">Labels &amp; settings</h2>
            <span aria-hidden className="text-ink-mute">{settings ? "–" : "+"}</span>
          </button>
          {settings ? <Settings nickname={nickname} behaviors={store.behaviors} entryCount={entries.length} /> : null}
        </section>

        <p className="text-[13px] text-ink-mute">
          Nothing here diagnoses or tells you what to do. If something you&apos;re seeing worries you, the export puts the facts in your BCBA&apos;s or pediatrician&apos;s hands.{" "}
          <Link href="/crisis" className="underline underline-offset-4">Crisis resources</Link>.
        </p>
      </div>

      <aside className="min-w-0 space-y-6 lg:sticky lg:top-6 lg:self-start">
        <BcbaPreview nickname={nickname} entries={entries} hydrated={hydrated} />
        {explainers}
      </aside>
    </div>
  );
}

function Settings({ nickname, behaviors, entryCount }: { nickname: string; behaviors: { id: string; label: string; isActive: boolean }[]; entryCount: number }) {
  const [nick, setNick] = useState(nickname);
  const [label, setLabel] = useState("");
  const [confirm, setConfirm] = useState<0 | 1 | 2>(0);
  return (
    <div className="mt-5 space-y-6">
      {nickname ? (
        <div className="space-y-2">
          <label htmlFor="rename" className="text-[15px] font-medium">Nickname</label>
          <div className="flex gap-2">
            <Input id="rename" value={nick} maxLength={40} onChange={(e) => setNick(e.target.value)} />
            <Button type="button" variant="secondary" onClick={() => renameChild(nick)} disabled={!nick.trim() || nick.trim() === nickname}>Save</Button>
          </div>
        </div>
      ) : null}
      <div className="space-y-3">
        <p className="text-[15px] font-medium">Behavior labels</p>
        {behaviors.length ? (
          <ul className="divide-y divide-line rounded-md bg-cream">
            {behaviors.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-2 px-3 py-2 text-[15px]">
                <span className={b.isActive ? "" : "text-ink-mute"}>{b.label}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="quiet" onClick={() => setBehaviorActive(b.id, !b.isActive)}>{b.isActive ? "Hide" : "Show"}</Button>
                  {!b.isActive ? <Button size="sm" variant="quiet" onClick={() => deleteBehavior(b.id)}>Delete</Button> : null}
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="text-[14px] text-ink-mute">Labels are saved with your first entry.</p>}
        {behaviors.length ? (
          <div className="flex gap-2">
            <Input aria-label="New label" value={label} maxLength={60} onChange={(e) => setLabel(e.target.value)} placeholder="Add a label"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (label.trim()) { addBehavior(label); setLabel(""); } } }} />
            <Button type="button" variant="secondary" onClick={() => { if (label.trim()) { addBehavior(label); setLabel(""); } }}>Add</Button>
          </div>
        ) : null}
        <p className="text-[13px] text-ink-mute">Hiding keeps past entries. Deleting is only possible when nothing uses the label.</p>
      </div>
      <div className="space-y-3 border-t border-line pt-5">
        <p className="text-[15px] font-medium">Delete everything</p>
        <p className="text-[14px] text-ink-soft">Removes the nickname, labels, and all {entryCount} observations from this browser. Export first if you want a copy.</p>
        {confirm === 0 ? <Button type="button" variant="quiet" onClick={() => setConfirm(1)}>Delete everything…</Button> : null}
        {confirm === 1 ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="danger" onClick={() => setConfirm(2)}>Yes, I&apos;ve exported what I need</Button>
            <Button type="button" variant="quiet" onClick={() => setConfirm(0)}>Keep</Button>
          </div>
        ) : null}
        {confirm === 2 ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="danger" onClick={() => { clearAll(); setConfirm(0); }}>Delete for good</Button>
            <Button type="button" variant="quiet" onClick={() => setConfirm(0)}>Keep</Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
