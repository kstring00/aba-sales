#!/usr/bin/env bash
# Recreates a local database from scratch: auth shim + migrations.
# Usage: scripts/db-local-reset.sh [db_name]   (default support_shelf_test)
set -euo pipefail
DB="${1:-${RLS_TEST_DB_NAME:-support_shelf_test}}"
PSQL="${PSQL:-psql -v ON_ERROR_STOP=1 -h localhost -U postgres}"
export PGPASSWORD="${PGPASSWORD:-postgres}"
$PSQL -d postgres -c "drop database if exists ${DB};" >/dev/null
$PSQL -d postgres -c "create database ${DB};" >/dev/null
$PSQL -d "$DB" -f supabase/local/auth_shim.sql >/dev/null 2>&1
for f in supabase/migrations/*.sql; do
  $PSQL -d "$DB" -f "$f" >/dev/null 2>&1
done
echo "local db ${DB} ready"
