"use client";

import { useMemo, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { ANTECEDENTS, CONSEQUENCES, INTENSITY_LABELS, antecedentLabel, consequenceLabel, formatDuration } from "@/lib/observation";
import type { AntecedentCode, Behavior, ConsequenceCode, Entry } from "@/lib/abc/types";
import { addBehavior, addEntry, deleteEntry, updateEntry, type EntryInput } from "@/lib/abc/store";
import { fromLocalInputValue, toLocalInputValue } from "@/lib/time/format";

type Step = "behavior" | "before" | "after" | "review";
export type LogSheetMode = { kind: "create" } | { kind: "edit"; entry: Entry };

type Props = { open: boolean; onClose: () => void; behaviors: Behavior[]; mode: LogSheetMode };

const TITLES: Record<Step, string> = {
  behavior: "What did you notice?",
  before: "Right before?",
  after: "Right after?",
  review: "Ready to save",
};

const DURATION_PRESETS = [
  { label: "Under a minute", seconds: 30 },
  { label: "About 5 min", seconds: 300 },
  { label: "About 15 min", seconds: 900 },
  { label: "30 min or more", seconds: 1800 },
];

function emptyDraft(): EntryInput {
  return {
    behaviorId: "",
    occurredAt: new Date().toISOString(),
    antecedentCode: null,
    antecedentNote: null,
    consequenceCode: null,
    consequenceNote: null,
    durationSeconds: null,
    intensity: null,
    note: null,
  };
}

/** Mounts fresh each time it opens so every state starts clean. */
export function LogSheet(props: Props) {
  if (!props.open) return null;
  return <LogSheetInner {...props} />;
}

function LogSheetInner({ onClose, behaviors, mode }: Props) {
  const { toast } = useToast();
  const isEdit = mode.kind === "edit";
  const [step, setStep] = useState<Step>(isEdit ? "review" : "behavior");
  const [draft, setDraft] = useState<EntryInput>(() => (mode.kind === "edit" ? { ...mode.entry } : emptyDraft()));
  const [showDetails, setShowDetails] = useState(isEdit);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addingBehavior, setAddingBehavior] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [elseNote, setElseNote] = useState("");

  const activeBehaviors = useMemo(() => behaviors.filter((b) => b.isActive || b.id === draft.behaviorId), [behaviors, draft.behaviorId]);
  const behaviorLabel = behaviors.find((b) => b.id === draft.behaviorId)?.label ?? "";
  const patch = (p: Partial<EntryInput>) => setDraft((d) => ({ ...d, ...p }));

  function next(from: Step) {
    if (isEdit) return setStep("review");
    setStep(from === "behavior" ? "before" : from === "before" ? "after" : "review");
  }
  function back() {
    if (step === "before") setStep("behavior");
    else if (step === "after") setStep("before");
    else if (step === "review" && !isEdit) setStep("after");
  }

  function pickBehavior(id: string) {
    patch({ behaviorId: id });
    next("behavior");
  }
  function pickBefore(code: AntecedentCode) {
    if (code === "something_else") {
      patch({ antecedentCode: code });
      setElseNote(draft.antecedentNote ?? "");
      return;
    }
    patch({ antecedentCode: code, antecedentNote: null });
    next("before");
  }
  function pickAfter(code: ConsequenceCode) {
    if (code === "something_else") {
      patch({ consequenceCode: code });
      setElseNote(draft.consequenceNote ?? "");
      return;
    }
    patch({ consequenceCode: code, consequenceNote: null });
    next("after");
  }
  function confirmElse(which: "before" | "after") {
    const note = elseNote.trim() || null;
    if (which === "before") patch({ antecedentNote: note });
    else patch({ consequenceNote: note });
    setElseNote("");
    next(which);
  }
  function addLabelInline() {
    const label = newLabel.trim();
    if (!label) return;
    const b = addBehavior(label);
    setNewLabel("");
    setAddingBehavior(false);
    pickBehavior(b.id);
  }

  function save() {
    if (!draft.behaviorId) return setStep("behavior");
    if (isEdit) {
      updateEntry(mode.entry.id, draft);
      toast("Saved.");
    } else {
      addEntry(draft);
      toast("Logged.");
    }
    onClose();
  }
  function remove() {
    if (!isEdit) return;
    deleteEntry(mode.entry.id);
    toast("Deleted.");
    onClose();
  }

  const stepIndex = ["behavior", "before", "after", "review"].indexOf(step);

  return (
    <Sheet open onClose={onClose} title={TITLES[step]}>
      {!isEdit ? (
        <ol className="mb-4 flex gap-1.5" aria-label={`Step ${stepIndex + 1} of 4`}>
          {[0, 1, 2, 3].map((i) => (
            <li key={i} aria-hidden className={`h-1 flex-1 rounded-pill ${i <= stepIndex ? "bg-sage" : "bg-line"}`} />
          ))}
        </ol>
      ) : null}

      {step === "behavior" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {activeBehaviors.map((b) => (
              <Chip key={b.id} selected={b.id === draft.behaviorId} onClick={() => pickBehavior(b.id)}>{b.label}</Chip>
            ))}
            {!addingBehavior ? <Chip onClick={() => setAddingBehavior(true)} aria-label="Add a new label">+ Add</Chip> : null}
          </div>
          {addingBehavior ? (
            <div className="flex gap-2">
              <Input autoFocus aria-label="New label" value={newLabel} maxLength={60} onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLabelInline(); } }} placeholder="In your own words" />
              <Button type="button" onClick={addLabelInline}>Add</Button>
            </div>
          ) : null}
          <p className="text-[14px] text-ink-mute">Just what you saw. No need to be precise.</p>
        </div>
      ) : null}

      {step === "before" ? (
        <StepChips
          options={ANTECEDENTS}
          selected={draft.antecedentCode}
          onPick={(c) => pickBefore(c as AntecedentCode)}
          elseOpen={draft.antecedentCode === "something_else"}
          elseNote={elseNote}
          setElseNote={setElseNote}
          onElseConfirm={() => confirmElse("before")}
          elseLabel="What was happening right before"
          onBack={back}
          onSkip={() => { patch({ antecedentCode: null, antecedentNote: null }); next("before"); }}
        />
      ) : null}

      {step === "after" ? (
        <StepChips
          options={CONSEQUENCES}
          selected={draft.consequenceCode}
          onPick={(c) => pickAfter(c as ConsequenceCode)}
          elseOpen={draft.consequenceCode === "something_else"}
          elseNote={elseNote}
          setElseNote={setElseNote}
          onElseConfirm={() => confirmElse("after")}
          elseLabel="What happened right after"
          onBack={back}
          onSkip={() => { patch({ consequenceCode: null, consequenceNote: null }); next("after"); }}
        />
      ) : null}

      {step === "review" ? (
        <div className="space-y-5">
          <ul className="divide-y divide-line rounded-md bg-cream">
            <ReviewRow label="Noticed" value={behaviorLabel || "—"} onChange={() => setStep("behavior")} />
            <ReviewRow label="Right before" value={antecedentLabel(draft.antecedentCode, draft.antecedentNote) || "Skipped"} onChange={() => setStep("before")} />
            <ReviewRow label="Right after" value={consequenceLabel(draft.consequenceCode, draft.consequenceNote) || "Skipped"} onChange={() => setStep("after")} />
          </ul>

          <button type="button" className="flex min-h-11 w-full items-center justify-between text-left text-[15px] text-ink-soft" aria-expanded={showDetails} onClick={() => setShowDetails((s) => !s)}>
            <span>{showDetails ? "Hide details" : "Add details (optional)"}</span>
            <span aria-hidden className={`transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`}>⌄</span>
          </button>

          {showDetails ? (
            <div className="fade-in space-y-6">
              <Detail label="When">
                <div className="flex flex-wrap gap-2">
                  {[{ label: "Just now", mins: 0 }, { label: "15 min ago", mins: 15 }, { label: "1 hour ago", mins: 60 }].map((o) => (
                    <Chip key={o.label} onClick={() => patch({ occurredAt: new Date(Date.now() - o.mins * 60000).toISOString() })}>{o.label}</Chip>
                  ))}
                </div>
                <Input type="datetime-local" aria-label="Date and time" value={toLocalInputValue(draft.occurredAt)} max={toLocalInputValue(new Date().toISOString())}
                  onChange={(e) => { const iso = fromLocalInputValue(e.target.value); if (iso) patch({ occurredAt: iso }); }} />
              </Detail>
              <Detail label="How long">
                <div className="flex flex-wrap gap-2">
                  {DURATION_PRESETS.map((p) => (
                    <Chip key={p.seconds} selected={draft.durationSeconds === p.seconds} onClick={() => patch({ durationSeconds: draft.durationSeconds === p.seconds ? null : p.seconds })}>{p.label}</Chip>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Input type="number" inputMode="numeric" min={0} max={1440} aria-label="Minutes" className="max-w-28"
                    value={draft.durationSeconds != null && !DURATION_PRESETS.some((p) => p.seconds === draft.durationSeconds) ? Math.round(draft.durationSeconds / 60) : ""}
                    onChange={(e) => patch({ durationSeconds: e.target.value === "" ? null : Math.max(0, Math.min(1440, Number(e.target.value))) * 60 })} placeholder="min" />
                  <span className="text-[15px] text-ink-mute">minutes, if you want to be exact</span>
                </div>
              </Detail>
              <Detail label="Intensity">
                <div className="flex flex-wrap gap-2">
                  {([1, 2, 3] as const).map((v) => (
                    <Chip key={v} selected={draft.intensity === v} onClick={() => patch({ intensity: draft.intensity === v ? null : v })}>{INTENSITY_LABELS[v]}</Chip>
                  ))}
                </div>
              </Detail>
              <Detail label="Note">
                <Textarea aria-label="Note" value={draft.note ?? ""} maxLength={2000} rows={3} onChange={(e) => patch({ note: e.target.value || null })} placeholder="Anything else you noticed, in your own words" />
              </Detail>
            </div>
          ) : null}

          <div className="space-y-3 pt-1">
            <Button type="button" variant="primary" size="lg" className="w-full" onClick={save}>{isEdit ? "Save changes" : "Save"}</Button>
            {!isEdit ? (
              <Button type="button" variant="quiet" className="w-full" onClick={back}>Back</Button>
            ) : confirmDelete ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-cream px-4 py-3 text-[15px]">
                <span>Delete this entry for good?</span>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="quiet" onClick={() => setConfirmDelete(false)}>Keep</Button>
                  <Button type="button" size="sm" variant="danger" onClick={remove}>Delete</Button>
                </div>
              </div>
            ) : (
              <Button type="button" variant="quiet" className="w-full" onClick={() => setConfirmDelete(true)}>Delete this entry</Button>
            )}
          </div>
          {draft.durationSeconds != null || draft.intensity != null ? (
            <p className="text-center text-[13px] text-ink-mute">
              {[formatDuration(draft.durationSeconds), draft.intensity ? INTENSITY_LABELS[draft.intensity] : ""].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </Sheet>
  );
}

function StepChips(props: {
  options: ReadonlyArray<{ code: string; label: string }>;
  selected: string | null;
  onPick: (code: string) => void;
  elseOpen: boolean;
  elseNote: string;
  setElseNote: (v: string) => void;
  onElseConfirm: () => void;
  elseLabel: string;
  onBack: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {props.options.map((o) => (
          <Chip key={o.code} selected={o.code === props.selected} onClick={() => props.onPick(o.code)}>{o.label}</Chip>
        ))}
      </div>
      {props.elseOpen ? (
        <div className="flex gap-2">
          <Input autoFocus aria-label={props.elseLabel} value={props.elseNote} maxLength={500} onChange={(e) => props.setElseNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); props.onElseConfirm(); } }} placeholder="One line is plenty" />
          <Button type="button" onClick={props.onElseConfirm}>Next</Button>
        </div>
      ) : null}
      <div className="flex justify-between pt-2">
        <Button type="button" variant="quiet" onClick={props.onBack}>Back</Button>
        <Button type="button" variant="quiet" onClick={props.onSkip}>Skip</Button>
      </div>
    </div>
  );
}

function ReviewRow({ label, value, onChange }: { label: string; value: string; onChange: () => void }) {
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[13px] uppercase tracking-wider text-ink-mute">{label}</p>
        <p className="text-[16px] leading-snug text-ink">{value}</p>
      </div>
      <button type="button" onClick={onChange} className="min-h-11 shrink-0 px-2 text-[15px] text-sage-deep hover:text-ink" aria-label={`Change ${label.toLowerCase()}`}>Change</button>
    </li>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] uppercase tracking-wider text-ink-mute">{label}</p>
      {children}
    </div>
  );
}
