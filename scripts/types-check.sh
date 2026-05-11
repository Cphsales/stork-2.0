#!/usr/bin/env bash
set -euo pipefail

TYPES_FILE=packages/types/src/database.ts

if [ ! -f "$TYPES_FILE" ]; then
  echo "::error::$TYPES_FILE mangler — kør 'pnpm types:generate'"
  exit 1
fi

if head -1 "$TYPES_FILE" | grep -q "^// PLACEHOLDER"; then
  echo "database.ts er placeholder — springer drift-check over indtil første 'pnpm types:generate'"
  exit 0
fi

TMP=$(mktemp)
trap "rm -f $TMP" EXIT

pnpm exec supabase gen types typescript --linked | pnpm exec prettier --parser typescript >"$TMP"

if ! diff -q "$TYPES_FILE" "$TMP" >/dev/null 2>&1; then
  echo "Types drift mod remote:"
  diff -u "$TYPES_FILE" "$TMP" | head -100
  echo ""
  echo "::error::Types drift. Run 'pnpm types:generate' locally and commit."
  exit 1
fi

echo "Types in sync with remote schema"
