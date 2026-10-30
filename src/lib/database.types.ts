/**
 * Hand-maintained database types mirroring supabase/migrations.
 * Regenerate with `supabase gen types typescript` once a project exists and
 * compare; the shape here is intentionally identical.
 */
export type CaregiverRole = "owner" | "caregiver";

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

export type SubscriptionStatus =
  | "inactive"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete";

type Timestamp = string;

export type ProfileRow = {
  id: string;
  display_name: string | null;
  adult_attested_at: Timestamp | null;
  created_at: Timestamp;
};

export type ChildRow = {
  id: string;
  nickname: string;
  created_by: string;
  created_at: Timestamp;
};

export type ChildCaregiverRow = {
  child_id: string;
  user_id: string;
  role: CaregiverRole;
  created_at: Timestamp;
};

export type BehaviorRow = {
  id: string;
  child_id: string;
  label: string;
  is_active: boolean;
  sort_order: number;
  created_at: Timestamp;
};

export type EntryRow = {
  id: string;
  child_id: string;
  behavior_id: string;
  occurred_at: Timestamp;
  antecedent_code: AntecedentCode | null;
  antecedent_note: string | null;
  consequence_code: ConsequenceCode | null;
  consequence_note: string | null;
  duration_seconds: number | null;
  intensity: number | null;
  note: string | null;
  created_by: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type SubscriptionRow = {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  price_id: string | null;
  current_period_end: Timestamp | null;
  cancel_at_period_end: boolean;
  updated_at: Timestamp;
};

export type EmailSignupRow = {
  id: string;
  email: string;
  source: string | null;
  created_at: Timestamp;
};

export type CaregiverInviteRow = {
  id: string;
  child_id: string;
  invited_by: string;
  email: string;
  token_hash: string;
  expires_at: Timestamp;
  accepted_at: Timestamp | null;
  accepted_by: string | null;
  revoked_at: Timestamp | null;
  created_at: Timestamp;
};

export type ShareLinkRow = {
  id: string;
  child_id: string;
  created_by: string;
  token_hash: string;
  range_start: string;
  range_end: string;
  expires_at: Timestamp;
  revoked_at: Timestamp | null;
  created_at: Timestamp;
};

export type ContactMessageRow = {
  id: string;
  email: string;
  message: string;
  user_id: string | null;
  created_at: Timestamp;
};

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      children: Table<ChildRow, { nickname: string; created_by: string; id?: string }>;
      child_caregivers: Table<ChildCaregiverRow>;
      behaviors: Table<
        BehaviorRow,
        { child_id: string; label: string; is_active?: boolean; sort_order?: number; id?: string }
      >;
      entries: Table<
        EntryRow,
        Omit<Partial<EntryRow>, "child_id" | "behavior_id"> & {
          child_id: string;
          behavior_id: string;
        }
      >;
      subscriptions: Table<SubscriptionRow>;
      email_signups: Table<EmailSignupRow, { email: string; source?: string | null }>;
      caregiver_invites: Table<CaregiverInviteRow>;
      share_links: Table<ShareLinkRow>;
      contact_messages: Table<
        ContactMessageRow,
        { email: string; message: string; user_id?: string | null }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      has_child_access: { Args: { p_child_id: string }; Returns: boolean };
      is_child_owner: { Args: { p_child_id: string }; Returns: boolean };
      is_pro: { Args: { p_user_id: string }; Returns: boolean };
      create_caregiver_invite: {
        Args: { p_child_id: string; p_email: string; p_token_hash: string };
        Returns: string;
      };
      accept_caregiver_invite: { Args: { p_token_hash: string }; Returns: string };
      delete_my_owned_data: { Args: Record<string, never>; Returns: undefined };
    };
    Enums: {
      caregiver_role: CaregiverRole;
      antecedent_code: AntecedentCode;
      consequence_code: ConsequenceCode;
      subscription_status: SubscriptionStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
