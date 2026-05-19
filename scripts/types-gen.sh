#!/usr/bin/env bash
# Single source of truth for type-codegen.
#
# Bruges af både `pnpm types:generate` (write-mode) og `pnpm types:check`
# (drift-mode). Schema-listen står ét sted nedenfor.
#
# Modes:
#   --write   Regenerér packages/types/src/database.ts fra remote
#   --check   Verificér database.ts er i sync med remote (drift-check)

set -euo pipefail

# Schemas der eksponeres via PostgREST og derfor skal have TypeScript-typer.
# Hold synkront med Supabase Dashboard's "Exposed schemas" (Project Settings → API).
SCHEMAS="public,core_identity,core_compliance,core_money"

TYPES_FILE=packages/types/src/database.ts

mode="${1:-}"
if [ "$mode" != "--write" ] && [ "$mode" != "--check" ]; then
  echo "usage: $0 --write|--check"
  exit 2
fi

if [ "$mode" = "--write" ]; then
  supabase gen types typescript --linked --schema "$SCHEMAS" \
    | prettier --parser typescript > "$TYPES_FILE"
  echo "Regenerated $TYPES_FILE for schemas: $SCHEMAS"
  exit 0
fi

# --check mode
if [ ! -f "$TYPES_FILE" ]; then
  echo "::error::$TYPES_FILE mangler — kør 'pnpm types:generate' (schemas: $SCHEMAS)"
  exit 1
fi

TMP=$(mktemp)
trap "rm -f $TMP" EXIT

pnpm exec supabase gen types typescript --linked --schema "$SCHEMAS" \
  | pnpm exec prettier --parser typescript > "$TMP"

if ! diff -q "$TYPES_FILE" "$TMP" >/dev/null 2>&1; then
  echo "Types drift mod remote (schemas: $SCHEMAS):"
  diff -u "$TYPES_FILE" "$TMP" | head -100
  echo ""
  echo "::error::Types drift. Kør 'pnpm types:generate' lokalt og commit."
  exit 1
fi

echo "Types in sync with remote schema ($SCHEMAS)"
