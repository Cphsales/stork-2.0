# T9-supplement plan V4 — Claude.ai forretnings-dokument-approval

**Reviewer:** Claude.ai (forretnings-dokument-konsistens)
**Plan-version:** V4
**Dato:** 2026-05-19
**Resultat:** APPROVAL
**Runde:** 4

---

## Sammenfatning

V4 adresserer Codex' V3-OPGRADERING-forslag (2 stk) + kosmetisk fix. Codex har allerede leveret APPROVAL i V3-runden; V4 er styrkelse, ikke fundamental ændring.

Fire-dokument-konsultations-sektionen er bevaret. Ingen forretnings-dokument-konflikter introduceret.

V4's eksplicit funktionslokal session-var-sætning er **forbedret determinisme** der styrker master-plan §1.1's session-var-pattern — gør adfærd uafhængig af tidligere transactions-state.

V4's tre-lags test er **forbedret test-coverage** der adskiller grant-mangel fra permission-raise på 42501-niveau.

---

## V4-ændringer — forretnings-dokument-tjek

### OPGRADERING 1 — Eksplicit funktionslokal session-var i alle entrypoints

Current-wrappers sætter nu også eksplicit `set_config('stork.t9_read_at_date', current_date::text, true)` — ikke kun coalesce-default i RLS-policy.

- **Master-plan §1.1:** Styrkelse af session-var-pattern — eksplicit sætning i hver entrypoint forhindrer state-lækage mellem RPC-kald i samme transaction. Konsistent med rettelse 31's pattern-disciplin.
- **Vision princip 9:** Determinisme i historik-evaluering forbedres. Konsistent.

### OPGRADERING 2 — Tre-lags test (has_function_privilege + uden permission + med fixture-role)

Smoke-test `t9_read_gates.sql` udvidet til tre lag:

1. Deklarativ `has_function_privilege`-assertion for alle 9 RPCs
2. Runtime uden permission (raiser 42501 fra `_require_read_permission`)
3. Runtime med korrekt fixture-role + permission

- Ingen forretnings-dokument-modsigelse. Ren test-coverage-udvidelse.

### Kosmetisk fix

Dubleret linje om `employee_node_placements_select` fjernet.

- Ren plan-tekst-fix. Ingen forretnings-dokument-modsigelse.

---

## Fire-dokument-tjek (V4)

### Vision-og-principper.md

Verificeret. Princip 4 (Afgørelse 6), Princip 5 (pending_changes-mønster bevaret), Princip 9 (session-var + deterministisk current-wrapper).

Ingen modsigelse.

### Stork-2-0-master-plan.md

Verificeret. §1.1's session-var-pattern styrkes ved eksplicit sætning i current-wrappers. §1.7 (rettelse 35) uændret.

Ingen modsigelse.

### Mathias-afgoerelser.md

Verificeret. V4's ændringer rører ikke ramme-niveau-beslutninger; rene tekniske præciseringer.

Ingen modsigelse.

### T9-supplement-krav-og-data.md

Alle 5 krav stadig dækket. V4's ændringer er teknisk styrkelse inden for samme krav-rammer.

Ingen modsigelse.

---

## Severity-vurdering

**KRITISKE fund:** Ingen.

**MELLEM fund:** Ingen.

**KOSMETISKE fund:**

[KOSMETISK] DELETE-branch i exact-start close/remove kunne dokumenteres bedre (gentaget fra V2 + V3 review)

Konkret afvigelse: Plan Valg 1 Close/remove-sektion specificerer `DELETE active row (undgår zero-length CHECK violation)` uden eksplicit reference til vision-princip 9. Ikke adresseret i V4 (forventeligt — Codex har ikke flagget det).

Anbefalet handling: G-nummer-kandidat — implementation-kommentar i migration-fil bør reference princip 9 + forklare hvorfor zero-length state ikke er historik der skal bevares. Ikke approval-blokerende.

**OUT OF SCOPE (Codex' bord, ikke verificeret af mig):**

- SQL-implementering af eksplicit session-var i current-wrappers
- `has_function_privilege`-assertion-syntaks
- plpgsql-konvertering af alle 9 RPCs
- Konkret test-coverage på SQL-niveau

---

## Rapport-format

```
Review-type: plan V4
Pakke: T9-supplement
Resultat: APPROVAL
Feedback-fil: docs/coordination/plan-feedback/T9-supplement-V4-approved-claude-ai.md
Kritiske fund: ingen
Forretnings-dokument-konflikter spotted: ingen
Kosmetiske fund: 1 (DELETE-branch dokumentation, gentaget fra V2 + V3, G-nummer-kandidat)
```

Plan venter på Codex V4-review for dobbelt-approval.
