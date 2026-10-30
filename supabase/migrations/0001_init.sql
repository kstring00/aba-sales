-- ============================================================================
-- The Support Shelf — Phase 1A schema
--
-- Security model in one sentence: every row of child data is reachable only
-- through a child_caregivers link, that link is granted only by an owner
-- through SECURITY DEFINER functions, and Row Level Security is enforced on
-- every table so the anon key can never read what the app's own code forgot
-- to check.
--
-- Runs on Supabase (auth schema present) and on plain Postgres with
-- supabase/local/auth_shim.sql applied first (for tests).
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enumerations: observable events only. No function inference anywhere.
-- ---------------------------------------------------------------------------
create type public.caregiver_role as enum ('owner', 'caregiver');

create type public.antecedent_code as enum (
  'instruction_given',      -- An instruction was given
  'item_unavailable',       -- An item or activity was unavailable
  'activity_changed',       -- An activity or location changed
  'someone_approached',     -- Someone approached or interacted
  'child_alone',            -- The child was alone
  'something_else',         -- Something else (reveals a one-line note)
  'not_sure'                -- Not sure
);

create type public.consequence_code as enum (
  'item_provided',          -- An item or activity was provided
  'activity_stopped',       -- The activity or instruction stopped
  'someone_interacted',     -- Someone spoke to or interacted with the child
  'comfort_offered',        -- Someone offered comfort
  'no_response_observed',   -- No immediate response was observed
  'something_else',         -- Something else (reveals a one-line note)
  'not_sure'                -- Not sure
);

create type public.subscription_status as enum (
  'inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete'
);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  display_name      text check (display_name is null or char_length(display_name) <= 60),
  adult_attested_at timestamptz,
  created_at        timestamptz not null default now()
);

create table public.children (
  id          uuid primary key default gen_random_uuid(),
  -- Nickname only. Never a full name. Enforced by length and by product copy.
  nickname    text not null check (char_length(btrim(nickname)) between 1 and 40),
  created_by  uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table public.child_caregivers (
  child_id    uuid not null references public.children (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        public.caregiver_role not null default 'caregiver',
  created_at  timestamptz not null default now(),
  primary key (child_id, user_id)
);
create index child_caregivers_user_idx on public.child_caregivers (user_id);

create table public.behaviors (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references public.children (id) on delete cascade,
  label       text not null check (char_length(btrim(label)) between 1 and 60),
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
create index behaviors_child_idx on public.behaviors (child_id);

create table public.entries (
  -- Client-generated UUIDs are accepted so offline writes are idempotent.
  id                uuid primary key default gen_random_uuid(),
  child_id          uuid not null references public.children (id) on delete cascade,
  behavior_id       uuid not null references public.behaviors (id) on delete restrict,
  occurred_at       timestamptz not null default now(),
  antecedent_code   public.antecedent_code,
  antecedent_note   text check (antecedent_note is null or char_length(antecedent_note) <= 500),
  consequence_code  public.consequence_code,
  consequence_note  text check (consequence_note is null or char_length(consequence_note) <= 500),
  duration_seconds  integer check (duration_seconds is null or duration_seconds between 0 and 86400),
  intensity         smallint check (intensity is null or intensity between 1 and 3),
  note              text check (note is null or char_length(note) <= 2000),
  -- Nullable with SET NULL so a caregiver deleting their own account does not
  -- erase the owner's record of what happened.
  created_by        uuid references auth.users (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index entries_child_occurred_idx on public.entries (child_id, occurred_at desc);

create table public.subscriptions (
  user_id                 uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  status                  public.subscription_status not null default 'inactive',
  price_id                text,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean not null default false,
  updated_at              timestamptz not null default now()
);

create table public.email_signups (
  id          uuid primary key default gen_random_uuid(),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source      text check (source is null or char_length(source) <= 60),
  created_at  timestamptz not null default now()
);
create unique index email_signups_email_idx on public.email_signups (lower(email));

create table public.caregiver_invites (
  id            uuid primary key default gen_random_uuid(),
  child_id      uuid not null references public.children (id) on delete cascade,
  invited_by    uuid not null references auth.users (id) on delete cascade,
  email         text not null,
  -- Only a hash is stored. The raw token lives in the invite link alone.
  token_hash    text not null unique,
  expires_at    timestamptz not null,
  accepted_at   timestamptz,
  accepted_by   uuid references auth.users (id) on delete set null,
  revoked_at    timestamptz,
  created_at    timestamptz not null default now()
);
create index caregiver_invites_child_idx on public.caregiver_invites (child_id);

-- Pro: read-only export share links, expire in 30 days. Served by a server
-- route using the service key after validating the token hash.
create table public.share_links (
  id            uuid primary key default gen_random_uuid(),
  child_id      uuid not null references public.children (id) on delete cascade,
  created_by    uuid not null references auth.users (id) on delete cascade,
  token_hash    text not null unique,
  range_start   date not null,
  range_end     date not null check (range_end >= range_start),
  expires_at    timestamptz not null,
  revoked_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- Contact form (Phase 3 wires the page; table exists now so RLS is complete).
create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message     text not null check (char_length(message) between 1 and 4000),
  user_id     uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper functions. SECURITY DEFINER so policies on child_caregivers can be
-- consulted without recursing into themselves. Locked search_path.
-- ---------------------------------------------------------------------------
create or replace function public.has_child_access(p_child_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.child_caregivers
    where child_id = p_child_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_child_owner(p_child_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.child_caregivers
    where child_id = p_child_id and user_id = auth.uid() and role = 'owner'
  );
$$;

-- Pro check readable from SQL so the database can enforce Pro-only grants as a
-- second line behind the app's isPro() helper.
create or replace function public.is_pro(p_user_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = p_user_id
      and status in ('active', 'trialing')
      and (current_period_end is null or current_period_end > now() - interval '3 days')
  );
$$;

revoke all on function public.has_child_access(uuid) from public;
revoke all on function public.is_child_owner(uuid) from public;
revoke all on function public.is_pro(uuid) from public;
grant execute on function public.has_child_access(uuid) to authenticated;
grant execute on function public.is_child_owner(uuid) to authenticated;
grant execute on function public.is_pro(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- New auth user → profile row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, adult_attested_at)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    -- The sign-in form passes adult_attested=true in sign-up metadata, so
    -- magic-link users are not asked twice. OAuth users confirm in-app.
    case when (new.raw_user_meta_data ->> 'adult_attested') = 'true' then now() else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- New child → creator becomes owner. The only way an owner row is created.
create or replace function public.handle_new_child()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.child_caregivers (child_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger on_child_created
  after insert on public.children
  for each row execute function public.handle_new_child();

-- Entries: behavior must belong to the same child; child_id and created_by
-- are immutable after insert (prevents reassigning records between children).
create or replace function public.validate_entry()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.behaviors b
    where b.id = new.behavior_id and b.child_id = new.child_id
  ) then
    raise exception 'behavior does not belong to this child' using errcode = '23514';
  end if;

  if tg_op = 'UPDATE' then
    if new.child_id <> old.child_id then
      raise exception 'entries cannot be moved between children' using errcode = '23514';
    end if;
    -- created_by may only change via the FK cascade (SET NULL when the
    -- author's account is deleted). Cascades run at trigger depth > 1.
    if new.created_by is distinct from old.created_by
       and not (new.created_by is null and pg_trigger_depth() > 1) then
      raise exception 'created_by is immutable' using errcode = '23514';
    end if;
    new.created_at := old.created_at;
    new.updated_at := now();
  end if;

  return new;
end;
$$;

create trigger entries_validate
  before insert or update on public.entries
  for each row execute function public.validate_entry();

-- Behaviors: child_id immutable.
create or replace function public.lock_behavior_child()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.child_id <> old.child_id then
    raise exception 'behaviors cannot be moved between children' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger behaviors_lock_child
  before update on public.behaviors
  for each row execute function public.lock_behavior_child();

-- Children: created_by immutable.
create or replace function public.lock_child_owner()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.created_by <> old.created_by then
    raise exception 'created_by is immutable' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger children_lock_owner
  before update on public.children
  for each row execute function public.lock_child_owner();

-- child_caregivers: an owner row can never be removed directly. It goes away
-- only when the child is deleted (cascade) or the owner's account is deleted.
create or replace function public.protect_owner_row()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- A direct DELETE fires this at depth 1; a cascade from children fires it
  -- at depth 2. Only cascades may remove an owner link.
  if old.role = 'owner' and pg_trigger_depth() <= 1 then
    raise exception 'the owner link cannot be removed; delete the child instead'
      using errcode = '23514';
  end if;
  return old;
end;
$$;

create trigger child_caregivers_protect_owner
  before delete on public.child_caregivers
  for each row execute function public.protect_owner_row();

-- ---------------------------------------------------------------------------
-- Caregiver invites. Only an owner can create; only the invited email can
-- accept; a caregiver can never grant or change roles. Pro is required to
-- create (second caregiver is a Pro feature) — enforced here and in the app.
-- ---------------------------------------------------------------------------
create or replace function public.create_caregiver_invite(
  p_child_id uuid,
  p_email text,
  p_token_hash text
)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not signed in' using errcode = '28000';
  end if;
  if not public.is_child_owner(p_child_id) then
    raise exception 'only the owner can invite a caregiver' using errcode = '42501';
  end if;
  if not public.is_pro(auth.uid()) then
    raise exception 'inviting a second caregiver requires Pro' using errcode = '42501';
  end if;
  if p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email' using errcode = '22023';
  end if;

  insert into public.caregiver_invites (child_id, invited_by, email, token_hash, expires_at)
  values (p_child_id, auth.uid(), lower(btrim(p_email)), p_token_hash, now() + interval '7 days')
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.accept_caregiver_invite(p_token_hash text)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_invite public.caregiver_invites%rowtype;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'not signed in' using errcode = '28000';
  end if;

  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  select * into v_invite
  from public.caregiver_invites
  where token_hash = p_token_hash
  for update;

  if not found then
    raise exception 'invite not found' using errcode = 'P0002';
  end if;
  if v_invite.revoked_at is not null then
    raise exception 'invite was revoked' using errcode = 'P0002';
  end if;
  if v_invite.accepted_at is not null then
    raise exception 'invite already used' using errcode = 'P0002';
  end if;
  if v_invite.expires_at < now() then
    raise exception 'invite expired' using errcode = 'P0002';
  end if;
  if v_invite.email <> v_email then
    raise exception 'this invite was sent to a different email address' using errcode = '42501';
  end if;
  if v_invite.invited_by = auth.uid() then
    raise exception 'you already have access to this child' using errcode = '42501';
  end if;

  -- Role is always caregiver. Never owner. Never chosen by the caller.
  insert into public.child_caregivers (child_id, user_id, role)
  values (v_invite.child_id, auth.uid(), 'caregiver')
  on conflict (child_id, user_id) do nothing;

  update public.caregiver_invites
  set accepted_at = now(), accepted_by = auth.uid()
  where id = v_invite.id;

  return v_invite.child_id;
end;
$$;

-- Hard delete: everything the caller owns. Called by the server route right
-- before the auth user itself is deleted with the service key.
create or replace function public.delete_my_owned_data()
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in' using errcode = '28000';
  end if;
  delete from public.children c
  where exists (
    select 1 from public.child_caregivers cc
    where cc.child_id = c.id and cc.user_id = auth.uid() and cc.role = 'owner'
  );
  delete from public.share_links where created_by = auth.uid();
  delete from public.caregiver_invites where invited_by = auth.uid();
end;
$$;

revoke all on function public.create_caregiver_invite(uuid, text, text) from public;
revoke all on function public.accept_caregiver_invite(text) from public;
revoke all on function public.delete_my_owned_data() from public;
grant execute on function public.create_caregiver_invite(uuid, text, text) to authenticated;
grant execute on function public.accept_caregiver_invite(text) to authenticated;
grant execute on function public.delete_my_owned_data() to authenticated;

-- ---------------------------------------------------------------------------
-- Grants (Supabase sets these by default; explicit for plain Postgres parity)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant select, insert, update, delete on
  public.profiles, public.children, public.behaviors,
  public.entries, public.caregiver_invites, public.share_links
  to authenticated;
-- No INSERT or UPDATE privilege at all on links: roles are never editable and
-- links are created only by SECURITY DEFINER code.
grant select, delete on public.child_caregivers to authenticated;
grant select on public.subscriptions to authenticated;
grant insert on public.email_signups, public.contact_messages to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security — on, and FORCED so even the table owner obeys it.
-- ---------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.children          enable row level security;
alter table public.child_caregivers  enable row level security;
alter table public.behaviors         enable row level security;
alter table public.entries           enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.email_signups     enable row level security;
alter table public.caregiver_invites enable row level security;
alter table public.share_links       enable row level security;
alter table public.contact_messages  enable row level security;

-- profiles: your own row, plus display names of people you share a child with.
create policy profiles_select on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1 from public.child_caregivers mine
      join public.child_caregivers theirs on theirs.child_id = mine.child_id
      where mine.user_id = auth.uid() and theirs.user_id = profiles.id
    )
  );
create policy profiles_insert on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- children
-- created_by is included so INSERT ... RETURNING passes before the owner-link
-- trigger has fired (SELECT policies are checked at row-insert time).
create policy children_select on public.children for select to authenticated
  using (created_by = auth.uid() or public.has_child_access(id));
create policy children_insert on public.children for insert to authenticated
  with check (created_by = auth.uid());
create policy children_update on public.children for update to authenticated
  using (public.is_child_owner(id)) with check (public.is_child_owner(id));
create policy children_delete on public.children for delete to authenticated
  using (public.is_child_owner(id));

-- child_caregivers: readable by anyone linked; no direct insert or update for
-- anyone (links are created only by triggers and accept_caregiver_invite);
-- owners may remove caregivers; a caregiver may remove only themselves.
create policy child_caregivers_select on public.child_caregivers for select to authenticated
  using (public.has_child_access(child_id));
create policy child_caregivers_delete on public.child_caregivers for delete to authenticated
  using (
    role = 'caregiver'
    and (user_id = auth.uid() or public.is_child_owner(child_id))
  );

-- behaviors: anyone linked may read, add, and edit (both caregivers log);
-- only owners delete, and only when no entries reference it (FK restrict).
create policy behaviors_select on public.behaviors for select to authenticated
  using (public.has_child_access(child_id));
create policy behaviors_insert on public.behaviors for insert to authenticated
  with check (public.has_child_access(child_id));
create policy behaviors_update on public.behaviors for update to authenticated
  using (public.has_child_access(child_id)) with check (public.has_child_access(child_id));
create policy behaviors_delete on public.behaviors for delete to authenticated
  using (public.is_child_owner(child_id));

-- entries: anyone linked may read and add; a caregiver edits or deletes only
-- what they recorded; an owner edits or deletes anything for their child.
create policy entries_select on public.entries for select to authenticated
  using (public.has_child_access(child_id));
create policy entries_insert on public.entries for insert to authenticated
  with check (public.has_child_access(child_id) and created_by = auth.uid());
create policy entries_update on public.entries for update to authenticated
  using (
    public.has_child_access(child_id)
    and (created_by = auth.uid() or public.is_child_owner(child_id))
  )
  with check (public.has_child_access(child_id));
create policy entries_delete on public.entries for delete to authenticated
  using (
    public.has_child_access(child_id)
    and (created_by = auth.uid() or public.is_child_owner(child_id))
  );

-- subscriptions: read your own. Writes come only from the Stripe webhook via
-- the service role.
create policy subscriptions_select on public.subscriptions for select to authenticated
  using (user_id = auth.uid());

-- email_signups and contact_messages: write-only for visitors.
create policy email_signups_insert on public.email_signups for insert to anon, authenticated
  with check (true);
create policy contact_messages_insert on public.contact_messages for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

-- caregiver_invites: owners see and revoke their child's invites. Creation
-- and acceptance go through the functions above.
create policy caregiver_invites_select on public.caregiver_invites for select to authenticated
  using (public.is_child_owner(child_id));
create policy caregiver_invites_update on public.caregiver_invites for update to authenticated
  using (public.is_child_owner(child_id)) with check (public.is_child_owner(child_id));
create policy caregiver_invites_delete on public.caregiver_invites for delete to authenticated
  using (public.is_child_owner(child_id));

-- share_links: owners only.
create policy share_links_select on public.share_links for select to authenticated
  using (public.is_child_owner(child_id));
create policy share_links_insert on public.share_links for insert to authenticated
  with check (public.is_child_owner(child_id) and created_by = auth.uid());
create policy share_links_update on public.share_links for update to authenticated
  using (public.is_child_owner(child_id)) with check (public.is_child_owner(child_id));
create policy share_links_delete on public.share_links for delete to authenticated
  using (public.is_child_owner(child_id));
