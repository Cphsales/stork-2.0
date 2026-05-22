# V4-automation — Krav-og-data

**Type:** Pakke-kontrakt
**Dato:** 2026-05-22

## Formål

> Denne pakke leverer: codex-notify-workflow der virker for V4-flow uden manuel-bro.

## I scope

1. **Fix bulk-push-detektion.** V4-omstillingens 11-commit-push postede "ukendt fil-type" på tracker fordi YAML bruger `HEAD~1..HEAD` (kun seneste commit). Skift til `before..after` så hele push-rangen scannes.

2. **Tilføj build-branch-event.** Push til `claude/<pakke>-build` → tracker-comment "Codex per-batch review klar". Løser at T9-supplement-2 fik Codex-review først ved PR-tid (ikke per batch).

3. **Tilføj slut-rapport-PR-event.** PR åbnet på `claude/<pakke>-slut-rapport` → tracker-comment "Claude.ai step-5 — review FØR merge". Løser at T9-supplement-2 fik Claude.ai-review EFTER merge.

4. **Ryd op i stale ACTION-tekster.** Workflow peger på slettede filer (`codex-review-prompt.md`, `plan-feedback/`). Skift til `docs/strategi/disciplin.md`.

## IKKE i scope

- Preview-deploy + auto-types-regen (separat pakke)
- Krav-dok-branch event (krav-dok skrives i chat — automation behøves ikke)
- Status-opdaterings-event (ville give støj)

## Test

Push test-commit til `claude/test-v4-automation-build` → forventet comment "Codex per-batch". Push test-commit til `claude/test-v4-automation-slut-rapport` + åbn PR → forventet comment "Claude.ai step-5". Slet test-branches efter.
