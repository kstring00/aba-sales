/**
 * The ABC logger's data model. Lives in the browser only (localStorage).
 * Codes describe observable events, never inferred functions.
 */
export type AntecedentCode =
  | "instruction_given"
  | "item_unavailable"
  | "activity_changed"
  | "someone_approached"
  | "child_alone"
  | "something_else"
  | "not_sure";

export type ConsequenceCode =
  | "item_provided"
  | "activity_stopped"
  | "someone_interacted"
  | "comfort_offered"
  | "no_response_observed"
  | "something_else"
  | "not_sure";

/**
 * A parent's reflection on what the behavior might be communicating. It is
 * recorded as the parent's own guess for discussion with the BCBA, never
 * as a finding, and exports label it that way.
 */
export type FunctionCode = "attention" | "escape" | "access" | "sensory" | "pain" | "not_sure";

export type Behavior = {
  id: string;
  label: string;
  isActive: boolean;
  createdAt: string;
};

/**
 * One observation. Several behaviors can be noticed in the same moment, so
 * an observation carries a list; counts are per observation (audit F-04).
 */
export type Entry = {
  id: string;
  behaviorIds: string[];
  /** ISO 8601 */
  occurredAt: string;
  antecedentCode: AntecedentCode | null;
  antecedentNote: string | null;
  consequenceCode: ConsequenceCode | null;
  consequenceNote: string | null;
  durationSeconds: number | null;
  /** 1 mild · 2 moderate · 3 high */
  intensity: 1 | 2 | 3 | null;
  /** "What happened?" in the parent's words. */
  note: string | null;
  /** Optional reflection; no longer asked. Kept so older entries still render and export. */
  functionCode?: FunctionCode | null;
  /** Optional: what the parent noticed before it got big. */
  earlySigns?: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export type Child = {
  /** Nickname only. No name, no birthday, no diagnosis field exists. */
  nickname: string;
  createdAt: string;
};

export type AbcStore = {
  version: 2;
  child: Child | null;
  behaviors: Behavior[];
  entries: Entry[];
};

/** A row ready for export: the observation plus its behavior labels ("; "-joined in behaviorLabel). */
export type EntryWithBehavior = Entry & { behaviorLabels: string[]; behaviorLabel: string };
