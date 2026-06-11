# Codex review — gov-5-automation runde 38

**Pakke:** gov-5-automation
**Fase:** build
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 16db58f
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 38 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Status-dump matcher ikke faktisk runtime-state  
Konkret afvigelse: `docs/coordination/gov-5-automation-status.md:3` siger “baseline 57 poster + online dry-run”, men `scripts/kaede/.dispatch-log.jsonl` findes ikke i workspace. Uden den vil live-kørsel ramme fail-closed baseline-guard; `--offline --dry-run` viser historiske leverancer klar til dispatch.  
Anbefalet handling: [V39-rettelse før B4] Genskab baseline eller ret status til “baseline mangler”, og dokumentér faktisk log-count + dry-run efter baseline.

[MELLEM] `--phase=docs`-prompten er stadig selvmotsigende  
Konkret afvigelse: `scripts/codex-review.sh:265-290` siger først “Tjek IKKE plan-skabelon/§3.1-§3.3”, men den fælles “Review-fokus” lige efter kræver patch-først, end-to-end-spor og state-dump. Det underminerer P4-løftet om ren docs/§8.1-klassifikation.  
Anbefalet handling: [V39-rettelse] Split prompten pr. fase, så docs-fasen kun får §8.1/docs-checks.

Verificeret: `pnpm -s kaede:selftest`, `pnpm -s governance:check`, `scripts/codex-review.sh --parse-test`.

§8.1-SVAR: INGEN-MODSIGELSE
