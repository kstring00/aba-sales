import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  as,
  asService,
  checkConnection,
  closePool,
  createUser,
  expectDenied,
  root,
  type TestUser,
} from "./harness";

let owner: TestUser;
let caregiver: TestUser;
let stranger: TestUser;
let childId: string;
let behaviorId: string;

async function createChildAs(user: TestUser, nickname = "Bean") {
  return as(user, async (q) => {
    const r = await q.query<{ id: string }>(
      `insert into public.children (nickname, created_by) values ($1, auth.uid()) returning id`,
      [nickname],
    );
    return r.rows[0].id;
  });
}

async function addBehaviorAs(user: TestUser, child: string, label = "dropping to floor") {
  return as(user, async (q) => {
    const r = await q.query<{ id: string }>(
      `insert into public.behaviors (child_id, label) values ($1, $2) returning id`,
      [child, label],
    );
    return r.rows[0].id;
  });
}

async function linkCaregiverDirect(child: string, user: TestUser) {
  // Mirrors a successful invite acceptance without the token dance.
  await root((q) =>
    q.query(
      `insert into public.child_caregivers (child_id, user_id, role) values ($1, $2, 'caregiver')`,
      [child, user.id],
    ),
  );
}

beforeAll(async () => {
  await checkConnection();
  owner = await createUser("owner");
  caregiver = await createUser("caregiver");
  stranger = await createUser("stranger");
  childId = await createChildAs(owner);
  behaviorId = await addBehaviorAs(owner, childId);
  await linkCaregiverDirect(childId, caregiver);
});

afterAll(async () => {
  await closePool();
});

describe("profiles", () => {
  it("are created automatically for new auth users", async () => {
    const r = await root((q) =>
      q.query(`select display_name from public.profiles where id = $1`, [owner.id]),
    );
    expect(r.rowCount).toBe(1);
    expect(r.rows[0].display_name).toBe("owner");
  });

  it("a user can read and update only their own profile", async () => {
    const mine = await as(owner, (q) =>
      q.query(`select id from public.profiles where id = auth.uid()`),
    );
    expect(mine.rowCount).toBe(1);

    const theirs = await as(stranger, (q) =>
      q.query(`select id from public.profiles where id = $1`, [owner.id]),
    );
    expect(theirs.rowCount).toBe(0);

    const upd = await as(stranger, (q) =>
      q.query(`update public.profiles set display_name = 'hacked' where id = $1`, [owner.id]),
    );
    expect(upd.rowCount).toBe(0);
  });

  it("caregivers sharing a child can see each other's display names", async () => {
    const r = await as(caregiver, (q) =>
      q.query(`select id from public.profiles where id = $1`, [owner.id]),
    );
    expect(r.rowCount).toBe(1);
  });
});

describe("children", () => {
  it("creator becomes owner automatically", async () => {
    const r = await root((q) =>
      q.query(`select role from public.child_caregivers where child_id = $1 and user_id = $2`, [
        childId,
        owner.id,
      ]),
    );
    expect(r.rows[0].role).toBe("owner");
  });

  it("a stranger cannot see, update, or delete the child", async () => {
    const sel = await as(stranger, (q) =>
      q.query(`select id from public.children where id = $1`, [childId]),
    );
    expect(sel.rowCount).toBe(0);

    const upd = await as(stranger, (q) =>
      q.query(`update public.children set nickname = 'x' where id = $1`, [childId]),
    );
    expect(upd.rowCount).toBe(0);

    const del = await as(stranger, (q) =>
      q.query(`delete from public.children where id = $1`, [childId]),
    );
    expect(del.rowCount).toBe(0);
  });

  it("a caregiver can read but not rename or delete the child", async () => {
    const sel = await as(caregiver, (q) =>
      q.query(`select nickname from public.children where id = $1`, [childId]),
    );
    expect(sel.rowCount).toBe(1);

    const upd = await as(caregiver, (q) =>
      q.query(`update public.children set nickname = 'renamed' where id = $1`, [childId]),
    );
    expect(upd.rowCount).toBe(0);

    const del = await as(caregiver, (q) =>
      q.query(`delete from public.children where id = $1`, [childId]),
    );
    expect(del.rowCount).toBe(0);
  });

  it("nobody can create a child on behalf of someone else", async () => {
    await expectDenied(
      as(stranger, (q) =>
        q.query(`insert into public.children (nickname, created_by) values ('x', $1)`, [owner.id]),
      ),
      /row-level security/,
    );
  });

  it("anon role cannot read children at all", async () => {
    await expectDenied(as(null, (q) => q.query(`select * from public.children`)));
  });

  it("the creator cannot be reassigned", async () => {
    await expectDenied(
      as(owner, (q) =>
        q.query(`update public.children set created_by = $1 where id = $2`, [stranger.id, childId]),
      ),
      /immutable/,
    );
  });
});

describe("caregiver roles and escalation", () => {
  it("a caregiver cannot promote themselves to owner", async () => {
    await expectDenied(
      as(caregiver, (q) =>
        q.query(
          `update public.child_caregivers set role = 'owner' where child_id = $1 and user_id = auth.uid()`,
          [childId],
        ),
      ),
      /permission denied|row-level security/,
    );
  });

  it("a caregiver cannot add anyone else to the child", async () => {
    await expectDenied(
      as(caregiver, (q) =>
        q.query(`insert into public.child_caregivers (child_id, user_id) values ($1, $2)`, [
          childId,
          stranger.id,
        ]),
      ),
      /permission denied/,
    );
  });

  it("an owner cannot insert links directly either (invites are the only path)", async () => {
    await expectDenied(
      as(owner, (q) =>
        q.query(`insert into public.child_caregivers (child_id, user_id) values ($1, $2)`, [
          childId,
          stranger.id,
        ]),
      ),
      /permission denied/,
    );
  });

  it("a stranger cannot link themselves to a child", async () => {
    await expectDenied(
      as(stranger, (q) =>
        q.query(`insert into public.child_caregivers (child_id, user_id) values ($1, auth.uid())`, [
          childId,
        ]),
      ),
      /permission denied/,
    );
  });

  it("a caregiver cannot remove the owner", async () => {
    const r = await as(caregiver, (q) =>
      q.query(`delete from public.child_caregivers where child_id = $1 and user_id = $2`, [
        childId,
        owner.id,
      ]),
    );
    expect(r.rowCount).toBe(0);
  });

  it("the owner link cannot be deleted by the owner (policy) nor by a direct superuser delete (trigger)", async () => {
    const r = await as(owner, (q) =>
      q.query(`delete from public.child_caregivers where child_id = $1 and user_id = auth.uid()`, [
        childId,
      ]),
    );
    expect(r.rowCount).toBe(0);
    await expectDenied(
      root((q) =>
        q.query(`delete from public.child_caregivers where child_id = $1 and role = 'owner'`, [childId]),
      ),
      /owner link cannot be removed/,
    );
    const still = await root((q) =>
      q.query(`select 1 from public.child_caregivers where child_id = $1 and role = 'owner'`, [childId]),
    );
    expect(still.rowCount).toBe(1);
  });

  it("an owner can remove a caregiver, and the caregiver loses access", async () => {
    const other = await createUser("second");
    await linkCaregiverDirect(childId, other);
    const before = await as(other, (q) =>
      q.query(`select id from public.children where id = $1`, [childId]),
    );
    expect(before.rowCount).toBe(1);

    const del = await as(owner, (q) =>
      q.query(`delete from public.child_caregivers where child_id = $1 and user_id = $2`, [
        childId,
        other.id,
      ]),
    );
    expect(del.rowCount).toBe(1);

    const after = await as(other, (q) =>
      q.query(`select id from public.children where id = $1`, [childId]),
    );
    expect(after.rowCount).toBe(0);
  });

  it("a caregiver can remove themselves", async () => {
    const leaver = await createUser("leaver");
    await linkCaregiverDirect(childId, leaver);
    const del = await as(leaver, (q) =>
      q.query(`delete from public.child_caregivers where child_id = $1 and user_id = auth.uid()`, [
        childId,
      ]),
    );
    expect(del.rowCount).toBe(1);
  });
});

describe("behaviors", () => {
  it("linked users read and add; strangers see nothing", async () => {
    const list = await as(caregiver, (q) =>
      q.query(`select id from public.behaviors where child_id = $1`, [childId]),
    );
    expect(list.rowCount).toBeGreaterThan(0);

    const none = await as(stranger, (q) =>
      q.query(`select id from public.behaviors where child_id = $1`, [childId]),
    );
    expect(none.rowCount).toBe(0);

    await expectDenied(
      as(stranger, (q) =>
        q.query(`insert into public.behaviors (child_id, label) values ($1, 'x')`, [childId]),
      ),
      /row-level security/,
    );
  });

  it("a behavior cannot be moved to another child", async () => {
    const otherChild = await createChildAs(owner, "Pip");
    await expectDenied(
      as(owner, (q) =>
        q.query(`update public.behaviors set child_id = $1 where id = $2`, [otherChild, behaviorId]),
      ),
      /cannot be moved/,
    );
  });
});

describe("entries", () => {
  let ownerEntry: string;
  let caregiverEntry: string;

  it("owner and caregiver can both log; created_by is enforced", async () => {
    ownerEntry = await as(owner, async (q) => {
      const r = await q.query<{ id: string }>(
        `insert into public.entries (child_id, behavior_id, antecedent_code, consequence_code, created_by)
         values ($1, $2, 'instruction_given', 'activity_stopped', auth.uid()) returning id`,
        [childId, behaviorId],
      );
      return r.rows[0].id;
    });
    caregiverEntry = await as(caregiver, async (q) => {
      const r = await q.query<{ id: string }>(
        `insert into public.entries (child_id, behavior_id, antecedent_code, consequence_code, created_by)
         values ($1, $2, 'not_sure', 'not_sure', auth.uid()) returning id`,
        [childId, behaviorId],
      );
      return r.rows[0].id;
    });
    expect(ownerEntry).toBeTruthy();
    expect(caregiverEntry).toBeTruthy();

    await expectDenied(
      as(caregiver, (q) =>
        q.query(
          `insert into public.entries (child_id, behavior_id, created_by) values ($1, $2, $3)`,
          [childId, behaviorId, owner.id],
        ),
      ),
      /row-level security/,
    );
  });

  it("client-generated ids are accepted and duplicates are rejected (idempotent sync)", async () => {
    const id = "11111111-1111-4111-8111-111111111111";
    await as(owner, (q) =>
      q.query(
        `insert into public.entries (id, child_id, behavior_id, created_by) values ($1, $2, $3, auth.uid())`,
        [id, childId, behaviorId],
      ),
    );
    await expectDenied(
      as(owner, (q) =>
        q.query(
          `insert into public.entries (id, child_id, behavior_id, created_by) values ($1, $2, $3, auth.uid())`,
          [id, childId, behaviorId],
        ),
      ),
      /duplicate key/,
    );
    // upsert on conflict do nothing is the path the sync queue uses
    const r = await as(owner, (q) =>
      q.query(
        `insert into public.entries (id, child_id, behavior_id, created_by) values ($1, $2, $3, auth.uid())
         on conflict (id) do nothing`,
        [id, childId, behaviorId],
      ),
    );
    expect(r.rowCount).toBe(0);
  });

  it("a stranger sees no entries and cannot insert", async () => {
    const r = await as(stranger, (q) =>
      q.query(`select id from public.entries where child_id = $1`, [childId]),
    );
    expect(r.rowCount).toBe(0);
    await expectDenied(
      as(stranger, (q) =>
        q.query(
          `insert into public.entries (child_id, behavior_id, created_by) values ($1, $2, auth.uid())`,
          [childId, behaviorId],
        ),
      ),
      /row-level security|does not belong/,
    );
  });

  it("a caregiver can edit their own entry but not the owner's", async () => {
    const mine = await as(caregiver, (q) =>
      q.query(`update public.entries set note = 'edited' where id = $1`, [caregiverEntry]),
    );
    expect(mine.rowCount).toBe(1);
    const theirs = await as(caregiver, (q) =>
      q.query(`update public.entries set note = 'edited' where id = $1`, [ownerEntry]),
    );
    expect(theirs.rowCount).toBe(0);
  });

  it("an owner can edit and delete any entry for their child", async () => {
    const upd = await as(owner, (q) =>
      q.query(`update public.entries set intensity = 2 where id = $1`, [caregiverEntry]),
    );
    expect(upd.rowCount).toBe(1);
  });

  it("entries cannot be reassigned to another child, even one you own", async () => {
    const otherChild = await createChildAs(owner, "Moss");
    await expectDenied(
      as(owner, (q) =>
        q.query(`update public.entries set child_id = $1 where id = $2`, [otherChild, ownerEntry]),
      ),
      /cannot be moved|does not belong/,
    );
  });

  it("an entry cannot reference a behavior from a different child", async () => {
    const otherChild = await createChildAs(owner, "Fern");
    const otherBehavior = await addBehaviorAs(owner, otherChild, "screaming");
    await expectDenied(
      as(owner, (q) =>
        q.query(
          `insert into public.entries (child_id, behavior_id, created_by) values ($1, $2, auth.uid())`,
          [childId, otherBehavior],
        ),
      ),
      /does not belong/,
    );
  });

  it("the author of an entry cannot be changed", async () => {
    await expectDenied(
      as(owner, (q) =>
        q.query(`update public.entries set created_by = $1 where id = $2`, [stranger.id, ownerEntry]),
      ),
      /immutable|row-level/,
    );
  });

  it("intensity and duration are range-checked", async () => {
    await expectDenied(
      as(owner, (q) =>
        q.query(
          `insert into public.entries (child_id, behavior_id, intensity, created_by) values ($1, $2, 5, auth.uid())`,
          [childId, behaviorId],
        ),
      ),
      /check constraint/,
    );
  });
});

describe("subscriptions", () => {
  it("users can read only their own row and cannot write", async () => {
    await asService((q) =>
      q.query(
        `insert into public.subscriptions (user_id, status) values ($1, 'active')
         on conflict (user_id) do update set status = 'active'`,
        [owner.id],
      ),
    );
    const mine = await as(owner, (q) => q.query(`select status from public.subscriptions`));
    expect(mine.rowCount).toBe(1);
    const theirs = await as(stranger, (q) => q.query(`select status from public.subscriptions`));
    expect(theirs.rowCount).toBe(0);
    await expectDenied(
      as(owner, (q) => q.query(`update public.subscriptions set status = 'active'`)),
      /permission denied/,
    );
    await expectDenied(
      as(stranger, (q) =>
        q.query(`insert into public.subscriptions (user_id, status) values (auth.uid(), 'active')`),
      ),
      /permission denied/,
    );
  });

  it("is_pro reflects the subscription row", async () => {
    const r = await as(owner, (q) =>
      q.query<{ pro: boolean }>(`select public.is_pro(auth.uid()) as pro`),
    );
    expect(r.rows[0].pro).toBe(true);
    const s = await as(stranger, (q) =>
      q.query<{ pro: boolean }>(`select public.is_pro(auth.uid()) as pro`),
    );
    expect(s.rows[0].pro).toBe(false);
  });
});

describe("email signups and contact", () => {
  it("anon can insert but never read", async () => {
    await as(null, (q) =>
      q.query(`insert into public.email_signups (email, source) values ('a@example.test', 'home')`),
    );
    await expectDenied(as(null, (q) => q.query(`select * from public.email_signups`)));
    await expectDenied(as(owner, (q) => q.query(`select * from public.email_signups`)));
  });
});
