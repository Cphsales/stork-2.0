# T9-supplement plan V3 — Claude.ai forretnings-dokument-approval

**Reviewer:** Claude.ai (forretnings-dokument-konsistens)
**Plan-version:** V3
**Dato:** 2026-05-19
**Resultat:** APPROVAL
**Runde:** 3

---

## Sammenfatning

V3 adresserer Codex' 2 KRITISK + 1 MELLEM fund fra V2-runden. V3-åbnings-sektionen lister hver fund og håndtering eksplicit. Ingen forretnings-dokument-konflikter introduceret.

V3's session-var-mønster i RLS-policy er **forbedret konsistens** med master-plan §1.1's etablerede pattern (samme klasse som `stork.t9_write_authorized`). Bevarer INVOKER og introducerer ingen DEFINER på forretningsfunktion.

V3's interval-overlap-trigger er **forbedret implementering** af Mathias-afgørelse 2026-05-16 pkt 2 ("Ny sandhed laver ikke gammel sandhed om") — to-vejs daterange-overlap-check beskytter mod backdated/future inkonsistens som V2's `effective_from`-only check ikke fangede.

---

## V3-ændringer — forretnings-dokument-tjek

### Session-var RLS-mønster (KRITISK 1 fix)

`stork.t9_read_at_date` session-var brugt af både RLS-policy og RPC-filter. `_at`-RPC sætter session-var; current-wrapper sætter ikke (coalesce default = `current_date`).

- **Master-plan §1.1:** V3 refererer eksplicit at mønstret er "samme klasse som PR #39's `stork.t9_write_authorized`". Konsistent — INVOKER + session-var, ingen DEFINER på forretningsfunktion.
- **Vision princip 9 (statusmodeller bevarer historik):** Session-var gør historisk state læseligt med korrekt ACL-evaluation på samme dato. Forbedring af historik-konsistens.
- **Mathias-afgørelse 2026-05-17 pkt 5 (Hiraki via placering):** Implementeret nu også retroaktivt — caller på p_date evalueres mod sin placement på p_date.

### To-vejs interval-overlap-trigger (KRITISK 2 fix)

`_org_node_team_no_children_check()` udvidet til daterange `&&` predikat over to invarianter:

- Invariant a: child-version's interval må ikke overlappe team-version af parent
- Invariant b: team-version's interval må ikke overlappe child-version af samme node

- **Vision princip 9:** Trigger validerer at organisatoriske status-ændringer ikke skaber overlap mellem inkonsistente historiske states. Konsistent.
- **Mathias-afgørelse 2026-05-16 (Forretningssandhed) pkt 2:** "Ny sandhed laver ikke gammel sandhed om — gammel sandhed står som den var." Trigger-fixet beskytter præcis denne invariant ved at fange backdated/future-cases V2's `effective_from`-only check ikke fangede.
- **Mathias-afgørelse 2026-05-17 pkt 13 (gældende dato + fortrydelses-mekanisme):** Backdated ændringer kan nu valideres på interval-niveau, ikke kun current-state.

### SQL-baseret authenticated-callability-check (MELLEM fix)

`set local role authenticated` + `request.jwt.claim.sub` + RPC-kald i smoke-test for at verificere EXECUTE-grant separat fra schema-exposure.

- Ingen forretnings-dokument-modsigelse. Ren test-coverage-udvidelse.
- JWT-baseret PostgREST-test G-nummer-dokumenteres som senere arbejde — markeres som teknisk gæld der adresseres hvis SQL-niveau viser sig utilstrækkelig.

---

## Fire-dokument-tjek (V3)

### Vision-og-principper.md

Verificeret. Princip 4 (Afgørelse 6), Princip 5 (pending_changes-mønster bevaret), Princip 9 (session-var + interval-overlap forbedrer historik-konsistens).

Ingen modsigelse.

### Stork-2-0-master-plan.md

Verificeret. §1.1 (rettelse 31's session-var-pattern) anvendes konsistent — V3's `stork.t9_read_at_date` er samme klasse som etablerede `stork.t9_write_authorized`. §1.7 (rettelse 35) bevares. V3 udvider ikke rammen, kun anvender med ny session-var i samme pattern.

Ingen modsigelse.

### Mathias-afgoerelser.md

Verificeret mod relevante entries:

- 2026-05-17 (T9-omstart-rammen): session-var-mønster implementerer punkt 5 (Hiraki via placering) konsistent — retroaktivt; punkt 13 (gældende dato) styrkes af interval-overlap-trigger
- 2026-05-16 (Forretningssandhed) pkt 2: interval-overlap-trigger beskytter "ny sandhed laver ikke gammel sandhed om" — konkret implementering
- 2026-05-18 (master-plan §1.7-opdatering): §1.1's session-var-pattern udvides med ny session-var (`stork.t9_read_at_date`) inden for samme klasse
- 2026-05-19 (compliance-ansvarlige): ikke berørt af V3

Ingen modsigelse.

### T9-supplement-krav-og-data.md

Alle 5 krav stadig dækket. V3's ændringer er teknisk forbedring inden for samme krav-rammer.

Ingen modsigelse.

---

## Severity-vurdering

**KRITISKE fund:** Ingen.

**MELLEM fund:** Ingen.

**KOSMETISKE fund:**

[KOSMETISK] DELETE-branch i exact-start close/remove kunne dokumenteres bedre (gentaget fra V2-review)

Konkret afvigelse: Plan Valg 1 Close/remove-sektion specificerer `DELETE active row (undgår zero-length CHECK violation)` uden eksplicit reference til vision-princip 9. Ikke adresseret i V3 (forventeligt — Codex har ikke flagget det).

Anbefalet handling: G-nummer-kandidat — implementation-kommentar i migration-fil bør reference princip 9 + forklare hvorfor zero-length state ikke er historik der skal bevares. Ikke approval-blokerende.

**OUT OF SCOPE (Codex' bord, ikke verificeret af mig):**

- SQL-implementering af session-var-mønster i RLS-policy
- Daterange `&&` predikat-korrekthed på to-vejs trigger
- `set local role authenticated` + `request.jwt.claim.sub` i smoke-test
- Konkret test-coverage på SQL-niveau

---

## Rapport-format

```
Review-type: plan V3
Pakke: T9-supplement
Resultat: APPROVAL
Feedback-fil: docs/coordination/plan-feedback/T9-supplement-V3-approved-claude-ai.md
Kritiske fund: ingen
Forretnings-dokument-konflikter spotted: ingen
Kosmetiske fund: 1 (DELETE-branch dokumentation, gentaget fra V2-review, G-nummer-kandidat)
```

Plan venter på Codex V3-review for dobbelt-approval.
