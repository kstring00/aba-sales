# Local Supabase stand-in (dev/test only)

This folder runs a tiny Node server that speaks the subset of the PostgREST
(`/rest/v1`) and GoTrue (`/auth/v1`) APIs this app uses, on top of the real
Postgres schema in `supabase/migrations` with real Row Level Security.

It exists because the cloud build environment has no Docker, so the Supabase
CLI can't start. It is **not** Supabase. Use it for local development and
automated tests. Anything verified against it is "verified locally"; a real
Supabase project still needs its own check.

```bash
npm run db:local:dev       # creates support_shelf_dev with the auth shim + migrations
npm run local:supabase     # starts the stand-in on :54321 and prints keys
```

Then put the printed keys in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon from the console>
SUPABASE_SERVICE_KEY=<service from the console>
```

Magic links are not emailed. They are printed to the console and listed at
`http://localhost:54321/_dev/outbox`. "Continue with Google" signs you in as
`google.user@example.test` without leaving your machine.
