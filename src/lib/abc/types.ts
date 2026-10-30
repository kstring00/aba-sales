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

export type Behavior = {
  id: string;
  label: string;
  isActive: boolean;
  createdAt: string;
};

export type Entry = {
  id: string;
  behaviorId: string;
  /** ISO 8601 */
  occurredAt: string;
  antecedentCode: AntecedentCode | null;
  antecedentNote: string | null;
  consequenceCode: ConsequenceCode | null;
  consequenceNote: string | null;
  durationSeconds: number | null;
  /** 1 gentle · 2 moderate · 3 intense */
  intensity: 1 | 2 | 3 | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Child = {
  /** Nickname only. No name, no birthday, no diagnosis field exists. */
  nickname: string;
  createdAt: string;
};

export type AbcStore = {
  version: 1;
  child: Child | null;
  behaviors: Behavior[];
  entries: Entry[];
};

/** A row ready for export: entry plus its behavior label. */
export type EntryWithBehavior = Entry & { behaviorLabel: string };
