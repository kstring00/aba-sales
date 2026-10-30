"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Field";
import { useAbcStore } from "@/lib/abc/useAbcStore";
import { addBehavior, clearAll, deleteBehavior, renameChild, setBehaviorActive, setChild, withLabels } from "@/lib/abc/store";
import { SEED_BEHAVIORS } from "@/lib/observation";
import { LogSheet } from "@/components/abc/LogSheet";
import { EntryList } from "@/components/abc/EntryList";
import { AntecedentView, TimeOfDayView } from "@/components/abc/Views";
import { ExportPanel } from "@/components/abc/ExportPanel";

type View = "list" | "time" | "before";

export function Logger() {
  const { store, hydrated } = useAbcStore();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("list");
  const [settings, setSettings] = useState(false);
  const entries = useMemo(() => withLabels(store), [store]);

  // Reserve roughly the setup form's height so hydration doesn't shift the page.
  if (!hydrated) return <div className="min-h-[34rem]" aria-hidden />;
  if (!store.child) return <Setup />;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-[clamp(1.9rem,1.5rem+1.5vw,2.6rem)]">How&apos;s {store.child.nickname}?</h2>
        <div className="mt-5">
          <Button variant="primary" size="lg" className="w-full !min-h-16 text-[18px]" onClick={() => setOpen(true)}>Log what happened</Button>
          <p className="mt-3 text-center text-[14px] text-ink-mute">Three taps. Details are optional.</p>
        </div>
      </div>

      <section aria-labelledby="entries-h">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="entries-h" className="text-[1.3rem]">Entries <span className="tnum text-[15px] text-ink-mute">· {entries.length}</span></h2>
          <div role="tablist" aria-label="View" className="flex gap-1 rounded-pill bg-cream-deep p-1">
            {([["list", "List"], ["time", "Time of day"], ["before", "Right before"]] as const).map(([v, label]) => (
              <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
                className={`min-h-10 rounded-pill px-3 text-[14px] ${view === v ? "bg-paper text-ink shadow-soft" : "text-ink-soft"}`}>{label}</button>
            ))}
          </div>
        </div>
        {view === "list" ? <EntryList entries={entries} behaviors={store.behaviors} emptyText={`Nothing logged for ${store.child.nickname} yet. That's fine.`} /> : null}
        {view === "time" ? <TimeOfDayView entries={entries} /> : null}
        {view === "before" ? <AntecedentView entries={entries} /> : null}
      </section>

      <ExportPanel nickname={store.child.nickname} entries={entries} />

      <section className="rounded-lg bg-paper p-5 shadow-soft" aria-labelledby="settings-h">
        <button type="button" className="flex min-h-11 w-full items-center justify-between text-left" aria-expanded={settings} onClick={() => setSettings((s) => !s)}>
          <h2 id="settings-h" className="text-[1.3rem]">Labels &amp; settings</h2>
          <span aria-hidden className="text-ink-mute">{settings ? "–" : "+"}</span>
        </button>
        {settings ? <Settings nickname={store.child.nickname} behaviors={store.behaviors} entryCount={entries.length} /> : null}
      </section>

      <p className="text-[13px] text-ink-mute">
        Nothing here diagnoses, interprets, or suggests what to do. If something you&apos;re seeing worries you, the export puts the facts in your BCBA&apos;s or pediatrician&apos;s hands.{" "}
        <Link href="/crisis" className="underline underline-offset-4">Crisis resources</Link>.
      </p>

      <LogSheet open={open} onClose={() => setOpen(false)} behaviors={store.behaviors} mode={{ kind: "create" }} />
    </div>
  );
}

function Setup() {
  const [nickname, setNickname] = useState("");
  const [selected, setSelected] = useState<string[]>(SEED_BEHAVIORS);
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const all = [...SEED_BEHAVIORS, ...custom];
  const toggle = (l: string) => setSelected((s) => (s.includes(l) ? s.filter((x) => x !== l) : [...s, l]));
  const addCustom = () => {
    const v = draft.trim();
    if (!v || all.some((x) => x.toLowerCase() === v.toLowerCase())) return setDraft("");
    setCustom((c) => [...c, v]);
    setSelected((s) => [...s, v]);
    setDraft("");
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!nickname.trim()) return;
        setChild(nickname, selected);
      }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-[clamp(1.9rem,1.5rem+1.5vw,2.6rem)]">Who are you <span className="display-italic">noticing</span> for?</h2>
        <p className="mt-3 text-ink-soft">A nickname is all this needs. It stays in this browser.</p>
      </div>
      <div className="space-y-2">
        <label htmlFor="nick" className="text-[15px] font-medium">Nickname</label>
        <Input id="nick" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={40} required autoComplete="off" placeholder="Bean, Little A, my kiddo…" />
      </div>
      <fieldset className="space-y-3">
        <legend className="text-[15px] font-medium">What do you want to keep an eye on? <span className="ml-1 font-normal text-ink-mute">Tap to keep or remove. Add your own.</span></legend>
        <div className="flex flex-wrap gap-2">
          {all.map((l) => <Chip key={l} selected={selected.includes(l)} onClick={() => toggle(l)}>{l}</Chip>)}
        </div>
        <div className="flex gap-2">
          <Input aria-label="Add your own" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={60} placeholder="Something else you notice"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} />
          <Button type="button" onClick={addCustom}>Add</Button>
        </div>
      </fieldset>
      <Button type="submit" variant="primary" size="lg" className="w-full">Start logging</Button>
      <p className="text-center text-[14px] text-ink-mute">These are your words for what you see. Nothing here labels your child.</p>
    </form>
  );
}

function Settings({ nickname, behaviors, entryCount }: { nickname: string; behaviors: { id: string; label: string; isActive: boolean }[]; entryCount: number }) {
  const [nick, setNick] = useState(nickname);
  const [label, setLabel] = useState("");
  const [confirm, setConfirm] = useState<0 | 1 | 2>(0);
  return (
    <div className="mt-5 space-y-6">
      <div className="space-y-2">
        <label htmlFor="rename" className="text-[15px] font-medium">Nickname</label>
        <div className="flex gap-2">
          <Input id="rename" value={nick} maxLength={40} onChange={(e) => setNick(e.target.value)} />
          <Button type="button" variant="secondary" onClick={() => renameChild(nick)} disabled={!nick.trim() || nick.trim() === nickname}>Save</Button>
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-[15px] font-medium">Labels</p>
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
        <div className="flex gap-2">
          <Input aria-label="New label" value={label} maxLength={60} onChange={(e) => setLabel(e.target.value)} placeholder="Add a label"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (label.trim()) { addBehavior(label); setLabel(""); } } }} />
          <Button type="button" variant="secondary" onClick={() => { if (label.trim()) { addBehavior(label); setLabel(""); } }}>Add</Button>
        </div>
        <p className="text-[13px] text-ink-mute">Hiding keeps past entries. Deleting is only possible when nothing uses the label.</p>
      </div>
      <div className="space-y-3 border-t border-line pt-5">
        <p className="text-[15px] font-medium">Delete everything</p>
        <p className="text-[14px] text-ink-soft">Removes the nickname, labels, and all {entryCount} entries from this browser. Export first if you want a copy.</p>
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
