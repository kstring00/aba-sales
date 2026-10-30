/**
 * RLS test harness.
 *
 * Connects as the postgres superuser, then for each "as(user)" block opens a
 * transaction, switches to the `authenticated` role, and sets the JWT claims
 * exactly the way Supabase's PostgREST does. Because `authenticated` is not
 * the table owner, every RLS policy applies to it.
 */
import { Client, Pool } from "pg";
import { randomUUID } from "node:crypto";

export const DB_URL =
  process.env.RLS_TEST_DATABASE_URL ??
  "postgres://postgres:postgres@localhost:5432/support_shelf_test";

export const pool = new Pool({ connectionString: DB_URL, max: 4 });

export type TestUser = { id: string; email: string };

export async function createUser(label: string): Promise<TestUser> {
  const id = randomUUID();
  const email = `${label}-${id.slice(0, 8)}@example.test`;
  await pool.query(
    `insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`,
    [id, email, JSON.stringify({ full_name: label })],
  );
  return { id, email };
}

export type Runner = {
  query: <T = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ) => Promise<{ rows: T[]; rowCount: number }>;
};

/** Run `fn` as an authenticated user. Commits on success. */
export async function as<T>(
  user: TestUser | null,
  fn: (q: Runner) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    if (user) {
      await client.query("set local role authenticated");
      await client.query(`select set_config('request.jwt.claims', $1, true)`, [
        JSON.stringify({ sub: user.id, role: "authenticated", email: user.email }),
      ]);
    } else {
      await client.query("set local role anon");
      await client.query(`select set_config('request.jwt.claims', $1, true)`, [
        JSON.stringify({ role: "anon" }),
      ]);
    }
    const runner: Runner = {
      query: async (text, params) => {
        const r = await client.query(text, params as never[]);
        return { rows: r.rows, rowCount: r.rowCount ?? 0 };
      },
    };
    const result = await fn(runner);
    await client.query("commit");
    return result;
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

/** Run as the service role (bypasses RLS), mirroring the server's admin client. */
export async function asService<T>(fn: (q: Runner) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("set local role service_role");
    const runner: Runner = {
      query: async (text, params) => {
        const r = await client.query(text, params as never[]);
        return { rows: r.rows, rowCount: r.rowCount ?? 0 };
      },
    };
    const result = await fn(runner);
    await client.query("commit");
    return result;
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

/** Superuser helper for fixtures and assertions that must see everything. */
export async function root<T>(fn: (q: Runner) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    const runner: Runner = {
      query: async (text, params) => {
        const r = await client.query(text, params as never[]);
        return { rows: r.rows, rowCount: r.rowCount ?? 0 };
      },
    };
    return await fn(runner);
  } finally {
    client.release();
  }
}

export async function expectDenied(p: Promise<unknown>, pattern?: RegExp) {
  let threw = false;
  try {
    await p;
  } catch (e) {
    threw = true;
    if (pattern) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!pattern.test(msg)) {
        throw new Error(`Denied, but with unexpected message: ${msg}`);
      }
    }
  }
  if (!threw) throw new Error("Expected the statement to be denied, but it succeeded");
}

export async function closePool() {
  await pool.end();
}

export async function checkConnection() {
  const c = new Client({ connectionString: DB_URL });
  await c.connect();
  await c.end();
}
