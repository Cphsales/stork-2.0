# T9-supplement plan V1 — Claude.ai forretnings-dokument-approval

**Reviewer:** Claude.ai (forretnings-dokument-konsistens)
**Plan-version:** V1
**Dato:** 2026-05-19
**Resultat:** APPROVAL
**Runde:** 1

---

## Sammenfatning

Planen leverer fokuseret append-only supplement der lukker de 6 åbne T9-fund konsistent med krav-dok og de tre rammeniveau-dokumenter.

Fire-dokument-konsultations-sektionen er udfyldt korrekt med konkrete referencer (ikke "hele filen" som dovent svar på rammeniveau-dokumenter). Alle fire dokumenter er reelt konsulteret — verificeret ved selvstændig læsning af kilderne.

Ingen modsigelser fundet mellem plan og vision, master-plan, mathias-afgørelser, eller krav-dok.

---

## Fire-dokument-tjek

### Vision-og-principper.md (LÅST DOKUMENT)

Planen anvender og overholder:

- **Princip 4 (default = intet):** Afgørelse 6 låser "Automatically expose new tables" som FRA. Plan dokumenterer at konfigurationen forbliver default-deny.
- **Princip 5 (lifecycle for konfiguration):** Pending_changes-mønstret er bevaret som etableret i PR #39; planen udvider ikke rammen.
- **Princip 9 (status-modeller bevarer historik):** Backdated traversal i Valg 1 er konkret implementering af princippet — eksisterende intervaller bevares ved split, ikke overskrives.

Ingen modsigelse fundet.

### Stork-2-0-master-plan.md (rammeniveau)

Planen refererer §1.1 og §1.7 som "anvendes, ikke udvides". Verificeret mod planens implementations-rækkefølge:

- §1.1's session-var-pattern (`stork.t9_write_authorized`): bevares som etableret i PR #39 (planen forholder sig ikke til den)
- §1.7's etablerede rammer (org_node_closure, role_permission_grants, ACL-helpers): anvendes i Valg 2's read-gates uden ændring

Ingen modsigelse fundet.

### Mathias-afgoerelser.md (rammeniveau)

Verificeret mod relevante entries:

- **2026-05-17 (T9-omstart-rammen, 15 punkter):** Plan anvender Hiraki-synlighed (punkt 5), knude-løs medarbejder som gyldig tilstand (punkt 7), fortrydelses-mekanisme via pending_changes (punkt 13-14), ingen stabs-team (punkt 8). Planens Valg 2's `employee_placement_read[_at]`-filter (`OR employee_id = current_employee_id()` for self) er konsistent med punkt 5's "Sig selv"-synlighed.
- **2026-05-18 (master-plan §1.7-opdatering):** Plan anvender den opdaterede §1.7 uden at genåbne rammen.
- **2026-05-19 (compliance-ansvarlige):** Plan rører ikke compliance-ansvarlig-mekanik, korrekt udeladt fra T9-supplement.
- **2026-05-16 (Forretningssandhed):** Punkt 7 (én medarbejder per team) — planen er en read-gates-pakke, ikke en placement-write-pakke; ingen direkte berøring.
- **2026-05-16 (Oprydnings- og opdaterings-disciplin):** Sektionen er udfyldt med konkret indhold (arkivering, sletninger, opdaterings-konsekvenser, ansvar). Overholdt.
- **2026-05-16 (Fire-dokument-disciplin):** Fire-dokument-konsultations-sektionen er udfyldt med konkrete referencer.
- **2026-05-17 (Modsigelse → afvis):** Planen identificerer ingen modsigelser. Verificeret ved selvstændig tjek.

Ingen modsigelse fundet.

### T9-supplement-krav-og-data.md (pakke-specifik)

Krav-til-plan-dækning:

| Krav-dok                        | Plan-dækning                                                   | Status |
| ------------------------------- | -------------------------------------------------------------- | ------ |
| Krav 1 (schema-exposure verif.) | Step 5 + Valg 3 (fitness-check `postgrest-t9-schema-exposure`) | ✓      |
| Krav 2 (backdated edge-cases)   | Valg 1 + Step 2 — alle 5 edge-cases eksplicit dækket           | ✓      |
| Krav 3 (read-gates strategi)    | Valg 2 + Step 3 — mixed strategi matcher 1:1                   | ✓      |
| Krav 4 (Step 12 hardcoded)      | Step 4 + Afgørelse 5 — bootstrap-undtagelse dokumenteret       | ✓      |
| Krav 5 (drift lokal/remote)     | Step 5 — config.toml-drift-fix                                 | ✓      |
| Mathias-afgørelser 1-6          | Plan-konsekvens dokumenteret pr. afgørelse                     | ✓      |
| Tekniske valg 1-4               | Planen argumenterer for alle 4 valg                            | ✓      |

Scope-anker holdt: planen leverer kun de 6 åbne T9-fund; ingen scope-creep til §1.1/forretningsrammen eller import.

---

## Severity-vurdering

**KRITISKE fund:** Ingen.

**MELLEM fund:** Ingen.

**KOSMETISKE fund:** Ingen.

**OUT OF SCOPE (Codex' bord, ikke verificeret af mig):**

- Konkret SQL i Valg 1's split-at-boundary-pseudokode
- Helper-funktions-implementation i Valg 2
- Fitness-check-implementations-detaljer i Valg 3
- Commit-struktur og rollback-mekanik
- Smoke-test-coverage på faktisk SQL-niveau

---

## Rapport-format

```
Review-type: plan V1
Pakke: T9-supplement
Resultat: APPROVAL
Feedback-fil: docs/coordination/plan-feedback/T9-supplement-V1-approved-claude-ai.md
Kritiske fund: ingen
Forretnings-dokument-konflikter spotted: ingen
```

Plan venter på Codex-review for at opnå dobbelt-approval.
