#!/usr/bin/env bash

set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-cares}"
DB_USER="${DB_USER:-cares}"
DB_PASSWORD="${DB_PASSWORD:-cares}"
PG_ADMIN_DATABASE="${PG_ADMIN_DATABASE:-postgres}"

for value in "$DB_NAME" "$DB_USER"; do
  if [[ ! "$value" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
    echo "Database and role names may only contain letters, numbers, and underscores."
    exit 1
  fi
done

if ! command -v psql >/dev/null 2>&1; then
  echo "psql was not found. Install PostgreSQL 16 and ensure its bin directory is in PATH."
  exit 1
fi

if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; then
  echo "PostgreSQL is not accepting connections at ${DB_HOST}:${DB_PORT}."
  echo "Start PostgreSQL, then run this script again."
  exit 1
fi

echo "Creating or updating the local CARES PostgreSQL role..."
psql \
  --host "$DB_HOST" \
  --port "$DB_PORT" \
  --dbname "$PG_ADMIN_DATABASE" \
  --set=cares_user="$DB_USER" \
  --set=cares_password="$DB_PASSWORD" <<'SQL'
SELECT format(
  'CREATE ROLE %I LOGIN PASSWORD %L',
  :'cares_user',
  :'cares_password'
)
WHERE NOT EXISTS (
  SELECT 1 FROM pg_roles WHERE rolname = :'cares_user'
)
\gexec

SELECT format(
  'ALTER ROLE %I WITH LOGIN PASSWORD %L',
  :'cares_user',
  :'cares_password'
)
\gexec
SQL

echo "Creating the local CARES database when it does not exist..."
psql \
  --host "$DB_HOST" \
  --port "$DB_PORT" \
  --dbname "$PG_ADMIN_DATABASE" \
  --set=cares_user="$DB_USER" \
  --set=cares_database="$DB_NAME" <<'SQL'
SELECT format(
  'CREATE DATABASE %I OWNER %I',
  :'cares_database',
  :'cares_user'
)
WHERE NOT EXISTS (
  SELECT 1 FROM pg_database WHERE datname = :'cares_database'
)
\gexec
SQL

psql \
  --host "$DB_HOST" \
  --port "$DB_PORT" \
  --dbname "$DB_NAME" \
  --set=cares_user="$DB_USER" <<'SQL'
SELECT format('GRANT ALL ON SCHEMA public TO %I', :'cares_user')
\gexec
SQL

echo
echo "Local PostgreSQL is ready."
echo "DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
