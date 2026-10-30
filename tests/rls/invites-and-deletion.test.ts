import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
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

const hash = (t: string) => createHash("sha256").update(t).digest("hex");

let owner: TestUser;
let invitee: TestUser;
let impostor: TestUser;
let childId: string;

async function makePro(user: TestUser) {
  await asService((q) =>
    q.query(
      `insert into public.subscriptions (user_id, status) values ($1, 'active')
       on conflict (user_id) do update set status = 'active'`,
      [user.id],
    ),
  );
}

beforeAll(async () => {
  await checkConnection();
  owner = await createUser("owner");
  invitee = await createUser("invitee");
  impostor = await createUser("impostor");
  childId = await as(owner, async (q) => {
    const r = await q.query<{ id: string }>(
      `insert into public.children (nickname, created_by) values ('Bean', auth.uid()) returning id`,
    );
    return r.rows[0].id;
  });
});

afterAll(closePool);

describe("caregiver invites", () => {
  it("a free owner cannot invite (second caregiver is Pro)", async () => {
    await expectDenied(
      as(owner, (q) =>
        q.query(`select public.create_caregiver_invite($1, $2, $3)`, [
          childId,
          invitee.email,
          hash("t0"),
        ]),
      ),
      /requires Pro/,
    );
  });

  it("a non-owner cannot invite even if Pro", async () => {
    await makePro(impostor);
    await expectDenied(
      as(impostor, (q) =>
        q.query(`select public.create_caregiver_invite($1, $2, $3)`, [
          childId,
          impostor.email,
          hash("t1"),
        ]),
      ),
      /only the owner/,
    );
  });

  it("a Pro owner can invite; only the invited email can accept; role is caregiver", async () => {
    await makePro(owner);
    const token = "secret-token-abc";
    await as(owner, (q) =>
      q.query(`select public.create_caregiver_invite($1, $2, $3)`, [
        childId,
        invitee.email.toUpperCase(),
        hash(token),
      ]),
    );

    // Impostor with the link but the wrong email is refused.
    await expectDenied(
      as(impostor, (q) => q.query(`select public.accept_caregiver_invite($1)`, [hash(token)])),
      /different email/,
    );

    // Wrong token is refused.
    await expectDenied(
      as(invitee, (q) => q.query(`select public.accept_caregiver_invite($1)`, [hash("nope")])),
      /not found/,
    );

    const accepted = await as(invitee, (q) =>
      q.query<{ accept_caregiver_invite: string }>(
        `select public.accept_caregiver_invite($1)`,
        [hash(token)],
      ),
    );
    expect(accepted.rows[0].accept_caregiver_invite).toBe(childId);

    const link = await root((q) =>
      q.query(`select role from public.child_caregivers where child_id = $1 and user_id = $2`, [
        childId,
        invitee.id,
      ]),
    );
    expect(link.rows[0].role).toBe("caregiver");

    // Replay is refused.
    await expectDenied(
      as(invitee, (q) => q.query(`select public.accept_caregiver_invite($1)`, [hash(token)])),
      /already used/,
    );
  });

  it("expired invites are refused", async () => {
    const token = "expired-token";
    await as(owner, (q) =>
      q.query(`select public.create_caregiver_invite($1, $2, $3)`, [
        childId,
        impostor.email,
        hash(token),
      ]),
    );
    await root((q) =>
      q.query(`update public.caregiver_invites set expires_at = now() - interval '1 minute' where token_hash = $1`, [
        hash(token),
      ]),
    );
    await expectDenied(
      as(impostor, (q) => q.query(`select public.accept_caregiver_invite($1)`, [hash(token)])),
      /expired/,
    );
  });

  it("revoked invites are refused and only owners see invites", async () => {
    const token = "revoked-token";
    await as(owner, (q) =>
      q.query(`select public.create_caregiver_invite($1, $2, $3)`, [
        childId,
        impostor.email,
        hash(token),
      ]),
    );
    const notMine = await as(invitee, (q) =>
      q.query(`select id from public.caregiver_invites where child_id = $1`, [childId]),
    );
    expect(notMine.rowCount).toBe(0);

    const revoked = await as(owner, (q) =>
      q.query(`update public.caregiver_invites set revoked_at = now() where token_hash = $1`, [
        hash(token),
      ]),
    );
    expect(revoked.rowCount).toBe(1);

    await expectDenied(
      as(impostor, (q) => q.query(`select public.accept_caregiver_invite($1)`, [hash(token)])),
      /revoked/,
    );
  });
});

describe("account deletion", () => {
  it("deleting an owner removes their children, entries, and links; a caregiver's entries elsewhere survive", async () => {
    const leaving = await createUser("leaving-owner");
    const staying = await createUser("staying-owner");

    // leaving owns child A; staying owns child B and leaving is a caregiver on B.
    const childA = await as(leaving, async (q) => {
      const r = await q.query<{ id: string }>(
        `insert into public.children (nickname, created_by) values ('A', auth.uid()) returning id`,
      );
      return r.rows[0].id;
    });
    const childB = await as(staying, async (q) => {
      const r = await q.query<{ id: string }>(
        `insert into public.children (nickname, created_by) values ('B', auth.uid()) returning id`,
      );
      return r.rows[0].id;
    });
    await root((q) =>
      q.query(`insert into public.child_caregivers (child_id, user_id, role) values ($1, $2, 'caregiver')`, [
        childB,
        leaving.id,
      ]),
    );
    const bA = await as(leaving, async (q) => {
      const r = await q.query<{ id: string }>(
        `insert into public.behaviors (child_id, label) values ($1, 'running off') returning id`,
        [childA],
      );
      return r.rows[0].id;
    });
    const bB = await as(staying, async (q) => {
      const r = await q.query<{ id: string }>(
        `insert into public.behaviors (child_id, label) values ($1, 'hitting') returning id`,
        [childB],
      );
      return r.rows[0].id;
    });
    await as(leaving, (q) =>
      q.query(`insert into public.entries (child_id, behavior_id, created_by) values ($1, $2, auth.uid())`, [
        childA,
        bA,
      ]),
    );
    const entryOnB = await as(leaving, async (q) => {
      const r = await q.query<{ id: string }>(
        `insert into public.entries (child_id, behavior_id, created_by) values ($1, $2, auth.uid()) returning id`,
        [childB, bB],
      );
      return r.rows[0].id;
    });

    // Step 1 (server route): delete owned data as the user.
    await as(leaving, (q) => q.query(`select public.delete_my_owned_data()`));
    // Step 2 (server route, service key): delete the auth user.
    await root((q) => q.query(`delete from auth.users where id = $1`, [leaving.id]));

    const a = await root((q) => q.query(`select id from public.children where id = $1`, [childA]));
    expect(a.rowCount).toBe(0);
    const aEntries = await root((q) =>
      q.query(`select id from public.entries where child_id = $1`, [childA]),
    );
    expect(aEntries.rowCount).toBe(0);
    const links = await root((q) =>
      q.query(`select * from public.child_caregivers where user_id = $1`, [leaving.id]),
    );
    expect(links.rowCount).toBe(0);
    const profile = await root((q) =>
      q.query(`select * from public.profiles where id = $1`, [leaving.id]),
    );
    expect(profile.rowCount).toBe(0);

    // The entry the leaver logged on B survives for B's owner, with author cleared.
    const survivor = await root((q) =>
      q.query<{ created_by: string | null }>(`select created_by from public.entries where id = $1`, [
        entryOnB,
      ]),
    );
    expect(survivor.rowCount).toBe(1);
    expect(survivor.rows[0].created_by).toBeNull();
  });

  it("delete_my_owned_data touches only the caller's children", async () => {
    const other = await createUser("other");
    const otherChild = await as(other, async (q) => {
      const r = await q.query<{ id: string }>(
        `insert into public.children (nickname, created_by) values ('O', auth.uid()) returning id`,
      );
      return r.rows[0].id;
    });
    await as(impostor, (q) => q.query(`select public.delete_my_owned_data()`));
    const still = await root((q) =>
      q.query(`select id from public.children where id = $1`, [otherChild]),
    );
    expect(still.rowCount).toBe(1);
  });
});

describe("cross-user export surface", () => {
  it("an export query scoped by child returns nothing for a non-linked user", async () => {
    // This is exactly the query the export route runs through the user's client.
    const r = await as(impostor, (q) =>
      q.query(
        `select e.id from public.entries e
         join public.behaviors b on b.id = e.behavior_id
         where e.child_id = $1 and e.occurred_at between now() - interval '365 days' and now()`,
        [childId],
      ),
    );
    expect(r.rowCount).toBe(0);
  });
});
