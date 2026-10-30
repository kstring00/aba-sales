"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import {
  ANTECEDENTS,
  CONSEQUENCES,
  INTENSITY_LABELS,
  antecedentLabel,
  consequenceLabel,
  formatDuration,
} from "@/lib/observation";
import type { AntecedentCode, BehaviorRow, ConsequenceCode, EntryRow } from "@/lib/database.types";
import { fromLocalInputValue, toLocalInputValue } from "@/lib/time/format";
import { insertBehavior, newEntryId, type EntryDraft } from "@/lib/entries/client";
import { submitEntry, submitEntryUpdate, submitEntryDelete } from "@/lib/entries/queue";

type Step = "behavior" | "before" | "after" | "review";

export type LogSheetMode = { kind: "create" } | { kind: "edit"; entry: EntryRow };

type Props = {
  open: boolean;
  onClose: () => void;
  childId: string;
  userId: string;
  behaviors: BehaviorRow[];
  mode: LogSheetMode;
  onSaved: (entry: EntryRow, behaviorLabel: string, pendingSync: boolean) => void;
  onDeleted?: (id: string) => void;
  onBehaviorAdded: (b: BehaviorRow) => void;
};

const TITLES: Record<Step, string> = {
  behavior: "What did you notice?",
  before: "Right before?",
  after: "Right after?",
  review: "Ready to save",
};

const DURATION_PRESETS: Array<{ label: string; seconds: number }> = [
  { label: "Under a minute", seconds: 30 },
  { label: "About 5 min", seconds: 300 },
  { label: "About 15 min", seconds: 900 },
  { label: "30 min or more", seconds: 1800 },
];

function emptyDraft(childId: string): EntryDraft {
  return {
    id: newEntryId(),
    child_id: childId,
    behavior_id: "",
    occurred_at: new Date().toISOString(),
    antecedent_code: null,
    antecedent_note: null,
    consequence_code: null,
    consequence_note: null,
    duration_seconds: null,
    intensity: null,
    note: null,
  };
}

function draftFromEntry(e: EntryRow): EntryDraft {
  return {
    id: e.id,
    child_id: e.child_id,
    behavior_id: e.behavior_id,
    occurred_at: e.occurred_at,
    antecedent_code: e.antecedent_code,
    antecedent_note: e.antecedent_note,
    consequence_code: e.consequence_code,
    consequence_note: e.consequence_note,
    duration_seconds: e.duration_seconds,
    intensity: e.intensity,
    note: e.note,
  };
}

export function LogSheet({ open, onClose, childId, userId, behaviors, mode, onSaved, onDeleted, onBehaviorAdded }: Props) {
  const { toast } = useToast();
  const isEdit = mode.kind === "edit";
  const [step, setStep] = useState<Step>(isEdit ? "review" : "behavior");
  const [draft, setDraft] = useState<EntryDraft>(() =>
    mode.kind === "edit" ? draftFromEntry(mode.entry) : emptyDraft(childId),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [addingBehavior, setAddingBehavior] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [elseNote, setElseNote] = useState("");

  // Reset whenever the sheet opens.
  useEffect(() => {
    if (!open) return;
    setStep(mode.kind === "edit" ? "review" : "behavior");
    setDraft(mode.kind === "edit" ? draftFromEntry(mode.entry) : emptyDraft(childId));
    setSaving(false);
    setError(null);
    setConfirmDelete(false);
    setShowDetails(mode.kind === "edit");
    setAddingBehavior(false);
    setNewLabel("");
    setElseNote("");
  }, [open, mode, childId]);

  const activeBehaviors = useMemo(() => behaviors.filter((b) => b.is_active || b.id === draft.behavior_id), [behaviors, draft.behavior_id]);
  const behaviorLabel = behaviors.find((b) => b.id === draft.behavior_id)?.label ?? "";

  const patch = useCallback((p: Partial<EntryDraft>) => setDraft((d) => ({ ...d, ...p })), []);

  function next(from: Step) {
    if (isEdit) return setStep("review");
    if (from === "behavior") setStep("before");
    else if (from === "before") setStep("after");
    else setStep("review");
  }

  function back() {
    if (step === "before") setStep("behavior");
    else if (step === "after") setStep("before");
    else if (step === "review") setStep(isEdit ? "review" : "after");
  }

  function pickBehavior(id: string) {
    patch({ behavior_id: id });
    next("behavior");
  }

  function pickBefore(code: AntecedentCode) {
    if (code === "something_else") {
      patch({ antecedent_code: code });
      setElseNote(draft.antecedent_note ?? "");
      return; // reveal the one-line note; user taps Next
    }
    patch({ antecedent_code: code, antecedent_note: null });
    next("before");
  }

  function pickAfter(code: ConsequenceCode) {
    if (code === "something_else") {
      patch({ consequence_code: code });
      setElseNote(draft.consequence_note ?? "");
      return;
    }
    patch({ consequence_code: code, consequence_note: null });
    next("after");
  }

  function confirmElse(which: "before" | "after") {
    const note = elseNote.trim() || null;
    if (which === "before") patch({ antecedent_note: note });
    else patch({ consequence_note: note });
    setElseNote("");
    next(which);
  }

  async function addBehaviorInline() {
    const label = newLabel.trim();
    if (!label) return;
    const existing = behaviors.find((b) => b.label.toLowerCase() === label.toLowerCase());
    if (existing) {
      setNewLabel("");
      setAddingBehavior(false);
      pickBehavior(existing.id);
      return;
    }
    try {
      const b = await insertBehavior(childId, label, behaviors.length);
      onBehaviorAdded(b);
      setNewLabel("");
      setAddingBehavior(false);
      pickBehavior(b.id);
    } catch {
      setError("Adding a new label needs a connection. Pick an existing one for now, or try again.");
    }
  }

  async function save() {
    if (!draft.behavior_id) {
      setStep("behavior");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        const { id, child_id: _c, ...rest } = draft;
        void _c;
        const result = await submitEntryUpdate(id, rest, userId);
        toast("Saved.");
        onSaved(result.entry, behaviorLabel, result.pending);
      } else {
        const result = await submitEntry(draft, userId);
        toast(result.pending ? "Logged. Will sync." : "Logged.");
        onSaved(result.entry, behaviorLabel, result.pending);
      }
      onClose();
    } catch {
      setError("That didn't save. Your entry is still here; try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!isEdit) return;
    setSaving(true);
    try {
      await submitEntryDelete(draft.id, userId);
      toast("Deleted.");
      onDeleted?.(draft.id);
      onClose();
    } catch {
      setError("Couldn't delete just now. Try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  const stepIndex = step === "behavior" ? 0 : step === "before" ? 1 : step === "after" ? 2 : 3;

  return (
    <Sheet open={open} onClose={onClose} title={TITLES[step]}>
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
              <Chip key={b.id} selected={b.id === draft.behavior_id} onClick={() => pickBehavior(b.id)}>
                {b.label}
              </Chip>
            ))}
            {!addingBehavior ? (
              <Chip onClick={() => setAddingBehavior(true)} aria-label="Add a new label">
                + Add
              </Chip>
            ) : null}
          </div>
          {addingBehavior ? (
            <div className="flex gap-2">
              <Input
                autoFocus
                aria-label="New label"
                value={newLabel}
                maxLength={60}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void addBehaviorInline();
                  }
                }}
                placeholder="In your own words"
              />
              <Button type="button" onClick={() => void addBehaviorInline()}>
                Add
              </Button>
            </div>
          ) : null}
          <p className="text-[14px] text-ink-mute">Just what you saw. No need to be precise.</p>
        </div>
      ) : null}

      {step === "before" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {ANTECEDENTS.map((a) => (
              <Chip key={a.code} selected={a.code === draft.antecedent_code} onClick={() => pickBefore(a.code)}>
                {a.label}
              </Chip>
            ))}
          </div>
          {draft.antecedent_code === "something_else" ? (
            <div className="flex gap-2">
              <Input
                autoFocus
                aria-label="What was happening right before"
                value={elseNote}
                maxLength={500}
                onChange={(e) => setElseNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    confirmElse("before");
                  }
                }}
                placeholder="One line is plenty"
              />
              <Button type="button" onClick={() => confirmElse("before")}>
                Next
              </Button>
            </div>
          ) : null}
          <div className="flex justify-between pt-2">
            <Button type="button" variant="quiet" onClick={back}>
              Back
            </Button>
            <Button type="button" variant="quiet" onClick={() => { patch({ antecedent_code: null, antecedent_note: null }); next("before"); }}>
              Skip
            </Button>
          </div>
        </div>
      ) : null}

      {step === "after" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {CONSEQUENCES.map((c) => (
              <Chip key={c.code} selected={c.code === draft.consequence_code} onClick={() => pickAfter(c.code)}>
                {c.label}
              </Chip>
            ))}
          </div>
          {draft.consequence_code === "something_else" ? (
            <div className="flex gap-2">
              <Input
                autoFocus
                aria-label="What happened right after"
                value={elseNote}
                maxLength={500}
                onChange={(e) => setElseNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    confirmElse("after");
                  }
                }}
                placeholder="One line is plenty"
              />
              <Button type="button" onClick={() => confirmElse("after")}>
                Next
              </Button>
            </div>
          ) : null}
          <div className="flex justify-between pt-2">
            <Button type="button" variant="quiet" onClick={back}>
              Back
            </Button>
            <Button type="button" variant="quiet" onClick={() => { patch({ consequence_code: null, consequence_note: null }); next("after"); }}>
              Skip
            </Button>
          </div>
        </div>
      ) : null}

      {step === "review" ? (
        <div className="space-y-5">
          <dl className="divide-y divide-line rounded-md bg-cream">
            <ReviewRow label="Noticed" value={behaviorLabel || "—"} onChange={() => setStep("behavior")} />
            <ReviewRow
              label="Right before"
              value={antecedentLabel(draft.antecedent_code, draft.antecedent_note) || "Skipped"}
              onChange={() => setStep("before")}
            />
            <ReviewRow
              label="Right after"
              value={consequenceLabel(draft.consequence_code, draft.consequence_note) || "Skipped"}
              onChange={() => setStep("after")}
            />
          </dl>

          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-between text-left text-[15px] text-ink-soft"
            aria-expanded={showDetails}
            onClick={() => setShowDetails((s) => !s)}
          >
            <span>{showDetails ? "Hide details" : "Add details (optional)"}</span>
            <span aria-hidden className={`transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`}>⌄</span>
          </button>

          {showDetails ? (
            <div className="fade-in space-y-6">
              <Detail label="When">
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Just now", mins: 0 },
                    { label: "15 min ago", mins: 15 },
                    { label: "1 hour ago", mins: 60 },
                  ].map((o) => (
                    <Chip
                      key={o.label}
                      onClick={() => patch({ occurred_at: new Date(Date.now() - o.mins * 60000).toISOString() })}
                    >
                      {o.label}
                    </Chip>
                  ))}
                </div>
                <Input
                  type="datetime-local"
                  aria-label="Date and time"
                  value={toLocalInputValue(draft.occurred_at)}
                  max={toLocalInputValue(new Date().toISOString())}
                  onChange={(e) => {
                    const iso = fromLocalInputValue(e.target.value);
                    if (iso) patch({ occurred_at: iso });
                  }}
                />
              </Detail>

              <Detail label="How long">
                <div className="flex flex-wrap gap-2">
                  {DURATION_PRESETS.map((p) => (
                    <Chip
                      key={p.seconds}
                      selected={draft.duration_seconds === p.seconds}
                      onClick={() => patch({ duration_seconds: draft.duration_seconds === p.seconds ? null : p.seconds })}
                    >
                      {p.label}
                    </Chip>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={1440}
                    aria-label="Minutes"
                    className="max-w-28"
                    value={draft.duration_seconds != null && !DURATION_PRESETS.some((p) => p.seconds === draft.duration_seconds) ? Math.round(draft.duration_seconds / 60) : ""}
                    onChange={(e) => {
                      const v = e.target.value === "" ? null : Math.max(0, Math.min(1440, Number(e.target.value))) * 60;
                      patch({ duration_seconds: v });
                    }}
                    placeholder="min"
                  />
                  <span className="text-[15px] text-ink-mute">minutes, if you want to be exact</span>
                </div>
              </Detail>

              <Detail label="Intensity">
                <div className="flex flex-wrap gap-2">
                  {([1, 2, 3] as const).map((v) => (
                    <Chip key={v} selected={draft.intensity === v} onClick={() => patch({ intensity: draft.intensity === v ? null : v })}>
                      {INTENSITY_LABELS[v]}
                    </Chip>
                  ))}
                </div>
              </Detail>

              <Detail label="Note">
                <Textarea
                  aria-label="Note"
                  value={draft.note ?? ""}
                  maxLength={2000}
                  rows={3}
                  onChange={(e) => patch({ note: e.target.value || null })}
                  placeholder="Anything else you noticed, in your own words"
                />
              </Detail>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="text-[15px] text-ink">
              {error}
            </p>
          ) : null}

          <div className="space-y-3 pt-1">
            <Button type="button" variant="primary" size="lg" className="w-full" disabled={saving} onClick={() => void save()}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Save"}
            </Button>
            {!isEdit ? (
              <Button type="button" variant="quiet" className="w-full" onClick={back}>
                Back
              </Button>
            ) : confirmDelete ? (
              <div className="flex items-center justify-between gap-3 rounded-md bg-cream px-4 py-3 text-[15px]">
                <span>Delete this entry for good?</span>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="quiet" onClick={() => setConfirmDelete(false)}>
                    Keep
                  </Button>
                  <Button type="button" size="sm" variant="danger" disabled={saving} onClick={() => void remove()}>
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <Button type="button" variant="quiet" className="w-full" onClick={() => setConfirmDelete(true)}>
                Delete this entry
              </Button>
            )}
          </div>
          {draft.duration_seconds != null || draft.intensity != null ? (
            <p className="text-center text-[13px] text-ink-mute">
              {[formatDuration(draft.duration_seconds), draft.intensity ? INTENSITY_LABELS[draft.intensity as 1 | 2 | 3] : ""]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </Sheet>
  );
}

function ReviewRow({ label, value, onChange }: { label: string; value: string; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <dt className="text-[13px] uppercase tracking-wider text-ink-mute">{label}</dt>
        <dd className="text-[16px] leading-snug text-ink">{value}</dd>
      </div>
      <button type="button" onClick={onChange} className="min-h-11 shrink-0 px-2 text-[15px] text-sage-deep hover:text-ink">
        Change
      </button>
    </div>
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
