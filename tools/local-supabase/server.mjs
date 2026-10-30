#!/usr/bin/env node
/**
 * Local Supabase stand-in — DEVELOPMENT AND TESTING ONLY.
 *
 * Speaks the subset of the PostgREST (/rest/v1) and GoTrue (/auth/v1) APIs
 * that supabase-js uses in this app, on top of the real Postgres schema with
 * real Row Level Security. Every query runs as the JWT's role with the JWT's
 * claims, exactly as PostgREST would, so RLS behaves identically.
 *
 * It is NOT Supabase. It exists because this environment has no Docker for
 * the Supabase CLI. Anything verified here is "verified locally"; the live
 * project still needs its own run.
 *
 *   node tools/local-supabase/server.mjs
 *
 * Env: LOCAL_SUPABASE_DB (postgres url), LOCAL_SUPABASE_PORT (54321),
 *      LOCAL_SUPABASE_JWT_SECRET, LOCAL_SUPABASE_SITE_URL (http://localhost:3000)
 */
import http from "node:http";
import crypto from "node:crypto";
import pg from "pg";

const PORT = Number(process.env.LOCAL_SUPABASE_PORT ?? 54321);
const DB = process.env.LOCAL_SUPABASE_DB ?? "postgres://postgres:postgres@localhost:5432/support_shelf_dev";
const SECRET = process.env.LOCAL_SUPABASE_JWT_SECRET ?? "local-dev-secret-local-dev-secret-local-dev-secret";
const SITE = process.env.LOCAL_SUPABASE_SITE_URL ?? "http://localhost:3000";

const pool = new pg.Pool({ connectionString: DB, max: 8 });

// ── JWT (HS256) ──────────────────────────────────────────────────────────────
const b64u = (buf) => Buffer.from(buf).toString("base64url");
function signJwt(payload) {
  const header = b64u(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64u(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}
function verifyJwt(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const sig = crypto.createHmac("sha256", SECRET).update(`${parts[0]}.${parts[1]}`).digest("base64url");
  if (sig.length !== parts[2].length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(parts[2]))) return null;
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}
export const ANON_KEY = signJwt({ role: "anon", iss: "local", iat: 1700000000, exp: 2000000000 });
export const SERVICE_KEY = signJwt({ role: "service_role", iss: "local", iat: 1700000000, exp: 2000000000 });

// ── State for auth flows ─────────────────────────────────────────────────────
const pkce = new Map(); // code -> { email, challenge, method }
const refreshTokens = new Map(); // refresh -> userId
const outbox = []; // "emails" (magic links) for tests to read

function session(user) {
  const now = Math.floor(Date.now() / 1000);
  const access_token = signJwt({
    aud: "authenticated",
    role: "authenticated",
    sub: user.id,
    email: user.email,
    iss: "local",
    iat: now,
    exp: now + 3600,
    app_metadata: { provider: "email" },
    user_metadata: user.raw_user_meta_data ?? {},
  });
  const refresh_token = crypto.randomBytes(24).toString("base64url");
  refreshTokens.set(refresh_token, user.id);
  return { access_token, token_type: "bearer", expires_in: 3600, expires_at: now + 3600, refresh_token, user: userJson(user) };
}
function userJson(u) {
  return {
    id: u.id,
    aud: "authenticated",
    role: "authenticated",
    email: u.email,
    email_confirmed_at: u.created_at,
    confirmed_at: u.created_at,
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: u.raw_user_meta_data ?? {},
    identities: [],
    created_at: u.created_at,
    updated_at: u.created_at,
    is_anonymous: false,
  };
}
async function findOrCreateUser(email, meta = {}) {
  const c = await pool.connect();
  try {
    const found = await c.query("select * from auth.users where lower(email) = lower($1)", [email]);
    if (found.rows[0]) return found.rows[0];
    const created = await c.query(
      "insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning *",
      [email.toLowerCase(), JSON.stringify(meta)],
    );
    return created.rows[0];
  } finally {
    c.release();
  }
}
async function getUserById(id) {
  const r = await pool.query("select * from auth.users where id = $1", [id]);
  return r.rows[0] ?? null;
}

// ── HTTP helpers ─────────────────────────────────────────────────────────────
function send(res, status, body, headers = {}) {
  const h = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "Access-Control-Expose-Headers": "Content-Range, X-Supabase-Api-Version",
    ...headers,
  };
  if (body === undefined || body === null) {
    res.writeHead(status, h);
    return res.end();
  }
  const text = typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json", ...h });
  res.end(text);
}
async function readJson(req) {
  const chunks = [];
  for await (const ch of req) chunks.push(ch);
  const raw = Buffer.concat(chunks).toString();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function parsePrefer(req) {
  const out = {};
  for (const part of (req.headers.prefer ?? "").split(",")) {
    const [k, v] = part.trim().split("=");
    if (k) out[k] = v ?? true;
  }
  return out;
}

// ── PostgREST subset ─────────────────────────────────────────────────────────
const IDENT = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const q = (ident) => {
  if (!IDENT.test(ident)) throw httpError(400, `bad identifier ${ident}`);
  return `"${ident}"`;
};
function httpError(status, message, code = "PGRST000") {
  const e = new Error(message);
  e.status = status;
  e.code = code;
  return e;
}

const fkCache = new Map();
async function foreignKeys(table) {
  if (fkCache.has(table)) return fkCache.get(table);
  const r = await pool.query(
    `select kcu.column_name as col, ccu.table_name as ref_table, ccu.column_name as ref_col
     from information_schema.table_constraints tc
     join information_schema.key_column_usage kcu on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
     join information_schema.constraint_column_usage ccu on ccu.constraint_name = tc.constraint_name and ccu.table_schema = tc.table_schema
     where tc.constraint_type = 'FOREIGN KEY' and tc.table_schema = 'public' and tc.table_name = $1`,
    [table],
  );
  fkCache.set(table, r.rows);
  return r.rows;
}

/** Parse "a, b, rel(x, y), alias:col" (one level of embedding). */
function parseSelect(sel) {
  const out = [];
  let depth = 0,
    cur = "";
  const parts = [];
  for (const ch of sel ?? "*") {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur) parts.push(cur);
  for (let p of parts) {
    p = p.trim();
    if (!p) continue;
    const m = p.match(/^(?:([a-zA-Z_][a-zA-Z0-9_]*):)?(\*|[a-zA-Z_][a-zA-Z0-9_]*)(?:\((.*)\))?$/s);
    if (!m) throw httpError(400, `cannot parse select "${p}"`);
    const [, alias, name, inner] = m;
    if (inner !== undefined) out.push({ kind: "embed", alias: alias ?? name, table: name, columns: inner.trim() || "*" });
    else out.push({ kind: "col", alias, name });
  }
  return out;
}

async function buildSelectList(table, selectStr, alias = "t") {
  const items = parseSelect(selectStr);
  const pieces = [];
  for (const it of items) {
    if (it.kind === "col") {
      if (it.name === "*") pieces.push(`${alias}.*`);
      else pieces.push(it.alias ? `${alias}.${q(it.name)} as ${q(it.alias)}` : `${alias}.${q(it.name)}`);
    } else {
      const fks = await foreignKeys(table);
      const fk = fks.find((f) => f.ref_table === it.table);
      if (!fk) throw httpError(400, `no relationship from ${table} to ${it.table}`, "PGRST200");
      const innerCols = it.columns === "*" ? "sub.*" : it.columns.split(",").map((c) => `sub.${q(c.trim())}`).join(", ");
      pieces.push(
        `(select to_jsonb(row) from (select ${innerCols} from public.${q(it.table)} sub where sub.${q(fk.ref_col)} = ${alias}.${q(fk.col)}) row) as ${q(it.alias)}`,
      );
    }
  }
  return pieces.join(", ");
}

const OPS = { eq: "=", neq: "<>", gt: ">", gte: ">=", lt: "<", lte: "<=", like: "like", ilike: "ilike" };
function buildWhere(params, args) {
  const clauses = [];
  for (const [key, raw] of params) {
    if (["select", "order", "limit", "offset", "on_conflict", "columns"].includes(key)) continue;
    const dot = raw.indexOf(".");
    if (dot < 0) throw httpError(400, `bad filter ${key}=${raw}`);
    const op = raw.slice(0, dot);
    const val = raw.slice(dot + 1);
    const col = `t.${q(key)}`;
    if (op in OPS) {
      args.push(val);
      clauses.push(`${col} ${OPS[op]} $${args.length}`);
    } else if (op === "is") {
      if (val === "null") clauses.push(`${col} is null`);
      else if (val === "true" || val === "false") clauses.push(`${col} is ${val}`);
      else throw httpError(400, `bad is filter`);
    } else if (op === "in") {
      const inner = val.replace(/^\(/, "").replace(/\)$/, "");
      const vals = inner.split(",").map((s) => s.trim().replace(/^"(.*)"$/, "$1"));
      args.push(vals);
      clauses.push(`${col} = any($${args.length})`);
    } else if (op === "not") {
      // not.is.null etc.
      const [op2, v2] = val.split(".");
      if (op2 === "is" && v2 === "null") clauses.push(`${col} is not null`);
      else throw httpError(400, `unsupported not filter`);
    } else throw httpError(400, `unsupported operator ${op}`);
  }
  return clauses.length ? `where ${clauses.join(" and ")}` : "";
}
function buildOrder(params) {
  const o = params.get("order");
  if (!o) return "";
  const parts = o.split(",").map((p) => {
    const [col, ...mods] = p.split(".");
    let s = `t.${q(col)}`;
    if (mods.includes("desc")) s += " desc";
    else s += " asc";
    if (mods.includes("nullsfirst")) s += " nulls first";
    if (mods.includes("nullslast")) s += " nulls last";
    return s;
  });
  return `order by ${parts.join(", ")}`;
}

async function withRole(claims, fn) {
  const c = await pool.connect();
  try {
    await c.query("begin");
    const role = claims?.role === "service_role" ? "service_role" : claims?.role === "authenticated" ? "authenticated" : "anon";
    await c.query(`set local role ${role}`);
    await c.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify(claims ?? { role: "anon" })]);
    const out = await fn(c);
    await c.query("commit");
    return out;
  } catch (e) {
    await c.query("rollback").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

function pgErrorResponse(res, e) {
  if (e.status) return send(res, e.status, { code: e.code, message: e.message, details: null, hint: null });
  const code = e.code ?? "XX000";
  let status = 400;
  if (code === "42501") status = 403;
  if (code === "23505") status = 409;
  if (code === "42P01") status = 404;
  if (code === "PGRST116") status = 406;
  return send(res, status, { code, message: e.message, details: e.detail ?? null, hint: e.hint ?? null });
}

async function handleRest(req, res, url, claims) {
  const path = url.pathname.replace(/^\/rest\/v1\/?/, "");
  const prefer = parsePrefer(req);
  const single = (req.headers.accept ?? "").includes("vnd.pgrst.object+json");
  const params = url.searchParams;

  if (path.startsWith("rpc/")) {
    const fn = path.slice(4);
    const body = (await readJson(req)) ?? {};
    const keys = Object.keys(body);
    const args = keys.map((k, i) => `${q(k)} := $${i + 1}`).join(", ");
    try {
      const r = await withRole(claims, (c) => c.query(`select public.${q(fn)}(${args}) as result`, keys.map((k) => body[k])));
      const v = r.rows[0]?.result;
      return send(res, 200, v === undefined ? null : v);
    } catch (e) {
      return pgErrorResponse(res, e);
    }
  }

  const table = path;
  if (!IDENT.test(table)) return send(res, 404, { message: "not found" });

  try {
    if (req.method === "GET" || req.method === "HEAD") {
      const args = [];
      const where = buildWhere(params, args);
      const order = buildOrder(params);
      const limit = params.get("limit") ? `limit ${Number(params.get("limit"))}` : "";
      const offset = params.get("offset") ? `offset ${Number(params.get("offset"))}` : "";
      const selectList = await buildSelectList(table, params.get("select"));
      const wantCount = prefer.count === "exact";
      const r = await withRole(claims, async (c) => {
        const rows = req.method === "HEAD" && wantCount ? { rows: [] } : await c.query(`select ${selectList} from public.${q(table)} t ${where} ${order} ${limit} ${offset}`, args);
        let total = null;
        if (wantCount) {
          const cnt = await c.query(`select count(*)::int as n from public.${q(table)} t ${where}`, args);
          total = cnt.rows[0].n;
        }
        return { rows: rows.rows, total };
      });
      const headers = {};
      if (r.total !== null) headers["Content-Range"] = `0-${Math.max(0, r.rows.length - 1)}/${r.total}`;
      else headers["Content-Range"] = `0-${Math.max(0, r.rows.length - 1)}/*`;
      if (req.method === "HEAD") return send(res, 200, null, headers);
      if (single) {
        if (r.rows.length !== 1) return send(res, 406, { code: "PGRST116", message: `JSON object requested, multiple (or no) rows returned`, details: `Results contain ${r.rows.length} rows`, hint: null });
        return send(res, 200, r.rows[0], headers);
      }
      return send(res, 200, r.rows, headers);
    }

    if (req.method === "POST") {
      const body = await readJson(req);
      const rows = Array.isArray(body) ? body : [body];
      if (rows.length === 0) return send(res, 201, []);
      const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
      const args = [];
      const values = rows
        .map((r) => `(${cols.map((c) => { args.push(r[c] === undefined ? null : r[c]); return `$${args.length}`; }).join(", ")})`)
        .join(", ");
      let conflict = "";
      if (prefer.resolution === "ignore-duplicates") {
        const target = params.get("on_conflict");
        conflict = target ? `on conflict (${target.split(",").map((c) => q(c.trim())).join(", ")}) do nothing` : "on conflict do nothing";
      } else if (prefer.resolution === "merge-duplicates") {
        const target = params.get("on_conflict");
        const targets = target ? target.split(",").map((c) => q(c.trim())).join(", ") : null;
        if (!targets) throw httpError(400, "merge-duplicates requires on_conflict");
        const sets = cols.map((c) => `${q(c)} = excluded.${q(c)}`).join(", ");
        conflict = `on conflict (${targets}) do update set ${sets}`;
      }
      const returning = prefer.return === "representation" ? `returning ${await buildSelectList(table, params.get("select"), "t")}` : "";
      const sql = `insert into public.${q(table)} as t (${cols.map(q).join(", ")}) values ${values} ${conflict} ${returning}`;
      const r = await withRole(claims, (c) => c.query(sql, args));
      if (prefer.return !== "representation") return send(res, 201, null);
      if (single) {
        if (r.rows.length !== 1) return send(res, 406, { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned", details: `Results contain ${r.rows.length} rows`, hint: null });
        return send(res, 201, r.rows[0]);
      }
      return send(res, 201, r.rows);
    }

    if (req.method === "PATCH") {
      const body = await readJson(req);
      const args = [];
      const sets = Object.keys(body).map((k) => { args.push(body[k]); return `${q(k)} = $${args.length}`; }).join(", ");
      const where = buildWhere(params, args);
      if (!where) throw httpError(400, "PATCH requires filters");
      const returning = prefer.return === "representation" ? `returning ${await buildSelectList(table, params.get("select"), "t")}` : "";
      const r = await withRole(claims, (c) => c.query(`update public.${q(table)} t set ${sets} ${where} ${returning}`, args));
      if (prefer.return !== "representation") return send(res, 204, null);
      if (single) {
        if (r.rows.length !== 1) return send(res, 406, { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned", details: `Results contain ${r.rows.length} rows`, hint: null });
        return send(res, 200, r.rows[0]);
      }
      return send(res, 200, r.rows);
    }

    if (req.method === "DELETE") {
      const args = [];
      const where = buildWhere(params, args);
      if (!where) throw httpError(400, "DELETE requires filters");
      const returning = prefer.return === "representation" ? `returning ${await buildSelectList(table, params.get("select"), "t")}` : "";
      const r = await withRole(claims, (c) => c.query(`delete from public.${q(table)} t ${where} ${returning}`, args));
      if (prefer.return !== "representation") return send(res, 204, null);
      return send(res, 200, r.rows);
    }
    return send(res, 405, { message: "method not allowed" });
  } catch (e) {
    return pgErrorResponse(res, e);
  }
}

// ── GoTrue subset ────────────────────────────────────────────────────────────
function sha256b64u(s) {
  return crypto.createHash("sha256").update(s).digest("base64url");
}

async function handleAuth(req, res, url, claims) {
  const path = url.pathname.replace(/^\/auth\/v1\/?/, "");
  const query = url.searchParams;

  if (path === "health") return send(res, 200, { name: "local-supabase", version: "0" });

  if (path === "otp" && req.method === "POST") {
    const body = (await readJson(req)) ?? {};
    const email = String(body.email ?? "").toLowerCase();
    if (!email) return send(res, 400, { code: 400, msg: "email required" });
    const code = crypto.randomBytes(16).toString("hex");
    pkce.set(code, { email, challenge: body.code_challenge ?? null, method: body.code_challenge_method ?? "s256", meta: body.data ?? {} });
    const redirect = body.redirect_to ?? `${SITE}/auth/callback`;
    const link = `${redirect}${redirect.includes("?") ? "&" : "?"}code=${code}`;
    outbox.push({ to: email, link, at: new Date().toISOString() });
    console.log(`[local-supabase] magic link for ${email}: ${link}`);
    return send(res, 200, {});
  }

  if (path === "authorize" && req.method === "GET") {
    // Fake OAuth: immediately "sign in" as a provider-derived user.
    const provider = query.get("provider") ?? "google";
    const redirect = query.get("redirect_to") ?? `${SITE}/auth/callback`;
    const email = query.get("email") ?? `${provider}.user@example.test`;
    const code = crypto.randomBytes(16).toString("hex");
    pkce.set(code, { email, challenge: query.get("code_challenge"), method: query.get("code_challenge_method") ?? "s256", meta: { full_name: "Google User" } });
    res.writeHead(302, { Location: `${redirect}${redirect.includes("?") ? "&" : "?"}code=${code}` });
    return res.end();
  }

  if (path === "token" && req.method === "POST") {
    const grant = query.get("grant_type");
    const body = (await readJson(req)) ?? {};
    if (grant === "pkce") {
      const rec = pkce.get(body.auth_code);
      if (!rec) return send(res, 400, { error: "invalid_grant", error_description: "invalid or expired code", code: 400, msg: "invalid or expired code" });
      if (rec.challenge) {
        const expected = rec.method === "plain" ? body.code_verifier : sha256b64u(body.code_verifier ?? "");
        if (expected !== rec.challenge) return send(res, 400, { error: "invalid_grant", error_description: "code verifier mismatch", code: 400, msg: "code verifier mismatch" });
      }
      pkce.delete(body.auth_code);
      const user = await findOrCreateUser(rec.email, rec.meta);
      return send(res, 200, session(user));
    }
    if (grant === "refresh_token") {
      const uid = refreshTokens.get(body.refresh_token);
      if (!uid) return send(res, 400, { error: "invalid_grant", error_description: "refresh token not found", code: 400, msg: "refresh token not found" });
      refreshTokens.delete(body.refresh_token);
      const user = await getUserById(uid);
      if (!user) return send(res, 400, { error: "invalid_grant", error_description: "user gone", code: 400, msg: "user gone" });
      return send(res, 200, session(user));
    }
    return send(res, 400, { error: "unsupported_grant_type", code: 400, msg: "unsupported grant" });
  }

  if (path === "user" && req.method === "GET") {
    if (!claims || claims.role !== "authenticated") return send(res, 401, { code: 401, msg: "invalid JWT" });
    const user = await getUserById(claims.sub);
    if (!user) return send(res, 403, { code: 403, msg: "user not found", error_code: "user_not_found" });
    return send(res, 200, userJson(user));
  }

  if (path === "logout" && req.method === "POST") return send(res, 204, null);

  if (path.startsWith("admin/users/") && req.method === "DELETE") {
    if (!claims || claims.role !== "service_role") return send(res, 401, { code: 401, msg: "service role required" });
    const id = path.slice("admin/users/".length);
    await pool.query("delete from auth.users where id = $1", [id]);
    return send(res, 200, {});
  }

  return send(res, 404, { code: 404, msg: `not implemented: ${req.method} ${path}` });
}

// ── Server ───────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (req.method === "OPTIONS") return send(res, 204, null);
  const auth = req.headers.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : req.headers.apikey;
  const claims = verifyJwt(token);
  try {
    if (url.pathname.startsWith("/rest/v1")) return await handleRest(req, res, url, claims);
    if (url.pathname.startsWith("/auth/v1")) return await handleAuth(req, res, url, claims);
    if (url.pathname === "/_dev/outbox") return send(res, 200, outbox);
    if (url.pathname === "/_dev/keys") return send(res, 200, { anon: ANON_KEY, service: SERVICE_KEY });
    return send(res, 404, { message: "not found" });
  } catch (e) {
    console.error(e);
    return send(res, 500, { message: String(e?.message ?? e) });
  }
});

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  server.listen(PORT, () => {
    console.log(`[local-supabase] listening on http://localhost:${PORT}`);
    console.log(`[local-supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}`);
    console.log(`[local-supabase] SUPABASE_SERVICE_KEY=${SERVICE_KEY}`);
  });
}
