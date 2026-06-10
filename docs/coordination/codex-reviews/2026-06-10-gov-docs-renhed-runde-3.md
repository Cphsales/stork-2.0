# Codex review — gov-docs-renhed runde 3

**Pakke:** gov-docs-renhed
**Fase:** plan
**Plan-fil:** docs/coordination/gov-docs-renhed-plan.md
**Plan-SHA:** 9c1dcff (V3)
**Dato:** 2026-06-10
**Reasoning:** xhigh
**Dispatch:** manuel `codex exec < /dev/null`

---

[KRITISK] A.6 efterlader D4-modsigelse i disciplin §8  
Konkret afvigelse: V3 retter master-planen i A.14, men A.6 indsætter kun en ny `forretningsforstaaelse.md`-række efter den eksisterende vision-række. Vision-rækken bevares som “Vinder over alt”, mens den nye række siger “ingen trumf”. Planen efterlader derfor to modsatrettede regler i samme §8. A.14 lukker master-plan-teksten, men §8.1-modsigelsen er ikke lukket samlet.  
Anbefalet handling: [V4-rettelse] Patch også vision-rækken i A.6 med D4-undtagelsen: vision vinder over alt undtagen forretningsforståelse; indbyrdes stamme-doc-modsigelse STOPPER og lukkes af Mathias.

Ikke-stop: R2-1 parseren matcher `[KRITISK]`, `KRITISK:` og negativ-casen korrekt; parse-test mangler dog fuld routing-table coverage for `WORKAROUND`, `ESCALATE/AUTO` og eksplicit halt-marker → G-nummer-kandidat. R2-3 er funktionelt lukket for de to oprindelige defects.

§8.1-SVAR: MODSIGELSE — disciplin §8 vision-rækken siger stadig “Vinder over alt”.
