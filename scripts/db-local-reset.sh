#!/usr/bin/env bash
# Recreates the local RLS test database from scratch.
# Requires a local Postgres 16 reachable as the postgres superuser.
set -euo pipefail
DB="${RLS_TEST_DB_NAME:-support_shelf_test}"
PSQL="${PSQL:-psql -v ON_ERROR_STOP=1 -h localhost -U postgres}"
export PGPASSWORD="${PGPASSWORD:-postgres}"
$PSQL -d postgres -c "drop database if exists ${DB};" >/dev/null
$PSQL -d postgres -c "create database ${DB};" >/dev/null
$PSQL -d "$DB" -f supabase/local/auth_shim.sql >/dev/null
for f in supabase/migrations/*.sql; do
  $PSQL -d "$DB" -f "$f" >/dev/null
done
echo "local db ${DB} ready"
