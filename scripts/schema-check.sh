#!/usr/bin/env bash
set -euo pipefail

SCHEMA_FILE=supabase/schema.sql

if [ ! -f "$SCHEMA_FILE" ]; then
  echo "::error::$SCHEMA_FILE mangler — kør 'pnpm schema:pull'"
  exit 1
fi

if grep -q "^-- PLACEHOLDER" "$SCHEMA_FILE"; then
  echo "schema.sql er placeholder — springer drift-check over indtil første 'pnpm schema:pull'"
  exit 0
fi

TMP=$(mktemp)
trap "rm -f $TMP" EXIT

pnpm exec supabase db dump --linked --schema public >"$TMP"

if ! diff -q "$SCHEMA_FILE" "$TMP" >/dev/null 2>&1; then
  echo "Schema drift mod remote:"
  diff -u "$SCHEMA_FILE" "$TMP" | head -200
  echo ""
  echo "::error::Schema drift detected. Run 'pnpm schema:pull' locally and commit."
  exit 1
fi

echo "Schema in sync with remote"
