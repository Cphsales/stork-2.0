# T9-supplement plan V2 — Claude.ai forretnings-dokument-approval

**Reviewer:** Claude.ai (forretnings-dokument-konsistens)
**Plan-version:** V2
**Dato:** 2026-05-19
**Resultat:** APPROVAL
**Runde:** 2

---

## Sammenfatning

V2 adresserer Codex' 4 KRITISK + 2 MELLEM fund fra V1-runden. V2-åbnings-sektionen lister hver fund og håndtering eksplicit. Ingen forretnings-dokument-konflikter introduceret.

Fire-dokument-konsultations-sektionen er bevaret fra V1 og er stadig korrekt udfyldt. Verificeret ved selvstændig læsning af kilderne.

V2's date-aware ACL-helpers er **forbedret konsistens** med Mathias-afgørelse 2026-05-16 pkt 2 ("Afdelinger ændres sjældent. Når de ændres, bevares historik") og 2026-05-17 pkt 5 ("Hiraki udledes af medarbejderens placering i organisations-træet"). Historisk autorisation følger nu historisk placering, ikke current.

---

## V2-ændringer — forretnings-dokument-tjek

### Date-aware ACL-helpers (KRITISK 1 fix)

Nye helpers `acl_subtree_org_nodes_at` + `acl_subtree_employees_at` over `org_node_versions` og placement-tabeller på `p_date`.

- **Vision princip 9:** Konsistent. Date-aware lookup respekterer at "statusmodeller bevarer historik" — autorisation på historisk dato bruger historisk placement, ikke current.
- **Mathias-afgørelse 2026-05-17 pkt 5:** Konsistent. "Hiraki udledes af medarbejderens placering" gælder også retrospektivt.
- **Mathias-afgørelse 2026-05-16 pkt 2:** Konsistent. Historik bevares — ACL på p_date bruger hvad der var sandt på p_date.

### RLS-policy-udvidelse på client_node_placements (KRITISK 2 fix)

Erstatter `using (is_admin())` med `using (is_admin() OR node_id = ANY(acl_subtree_org_nodes(...)))`.

- **Vision princip 4 (default = intet):** Ikke berørt. Policy udvider read-adgang baseret på eksplicit scope, ikke åbner globalt.
- **Mathias-afgørelse 2026-05-17 pkt 5 (Hiraki-synlighed):** Konsistent. Policy implementerer Hiraki for non-admin reads.

### Service-role fitness-check (KRITISK 3 fix)

Ny `postgrest-t9-schema-exposure` bruger service-role via Management API. Hard-fail hvis `SUPABASE_ACCESS_TOKEN` mangler.

- Ingen forretnings-dokument-modsigelse. Ren teknisk implementering.

### Per-tabel exact-start branches for close/remove (KRITISK 4 fix)

Placement-tabeller (`employee_node_placements`, `client_node_placements`): exact-start = DELETE active row.

Org_node_versions (`_apply_org_node_deactivate`, `_apply_team_close`): exact-start = UPDATE is_active=false in-place.

- **Vision princip 9 (status-modeller bevarer historik):** DELETE-branchen rammer KUN den case hvor `effective_from = p_effective_from` — dvs. en zero-length state-row der ville bryde CHECK-constraint. Slettelsen er rettelse af exact-start-edge-case, ikke ændring af historik. Split-close-case bevarer historik via UPDATE effective_to.

  **Flag (severity KOSMETISK):** Planen kunne med fordel eksplicit dokumentere i implementation-kommentar at DELETE-branchen kun rammer zero-length-states og ikke bryder princip 9. Ikke approval-blokerende.

- **Mathias-afgørelse 2026-05-16 pkt 7 (én medarbejder per team):** Ikke berørt; close/remove rammer placement-historik, ikke placement-uniqueness.

### Test-udvidelse (MELLEM 6 fix)

Alle 7 apply-handler-typer dækket i smoke-test, inkl. date-aware case.

- Ingen forretnings-dokument-modsigelse.

---

## Fire-dokument-tjek (V2)

### Vision-og-principper.md

Verificeret. Princip 4 (Afgørelse 6), Princip 5 (pending_changes-mønster bevaret), Princip 9 (date-aware ACL respekterer historik).

Ingen modsigelse.

### Stork-2-0-master-plan.md

Verificeret. §1.7 (rettelse 35) anvendes — `org_node_versions` + `acl_subtree_employees` er etablerede koncepter. V2 udvider ikke rammen, kun anvender med date-parameter.

Ingen modsigelse.

### Mathias-afgoerelser.md

Verificeret mod relevante entries:

- 2026-05-17 (T9-omstart-rammen): date-aware ACL implementerer punkt 5 (Hiraki via placering) korrekt — også retrospektivt
- 2026-05-16 (Forretningssandhed) pkt 2: historik bevares — V2's date-aware ACL respekterer dette
- 2026-05-18 (master-plan §1.7-opdatering): §1.7's session-var-pattern bevares uændret
- 2026-05-19 (compliance-ansvarlige): ikke berørt af V2

Ingen modsigelse.

### T9-supplement-krav-og-data.md

Alle 5 krav stadig dækket. V2's ændringer er teknisk forbedring inden for samme krav-rammer.

Ingen modsigelse.

---

## Severity-vurdering

**KRITISKE fund:** Ingen.

**MELLEM fund:** Ingen.

**KOSMETISKE fund:**

[KOSMETISK] DELETE-branch i exact-start close/remove kunne dokumenteres bedre

Konkret afvigelse: Plan Valg 1 Close/remove-sektion specificerer `DELETE active row (undgår zero-length CHECK violation)` uden eksplicit reference til vision-princip 9. En læser der ikke kender princippet kan tro at vi sletter historik.

Anbefalet handling: G-nummer-kandidat — implementation-kommentar i migration-fil bør reference princip 9 + forklare hvorfor zero-length state ikke er historik der skal bevares. Ikke approval-blokerende.

**OUT OF SCOPE (Codex' bord, ikke verificeret af mig):**

- SQL-implementering af date-aware ACL-helpers
- Rekursiv CTE-korrekthed over `org_node_versions`
- Service-role API-kald i fitness-check (Management API + PostgREST)
- Close/remove branch-logik på SQL-niveau
- Konkret test-coverage på SQL-niveau

---

## Rapport-format

```
Review-type: plan V2
Pakke: T9-supplement
Resultat: APPROVAL
Feedback-fil: docs/coordination/plan-feedback/T9-supplement-V2-approved-claude-ai.md
Kritiske fund: ingen
Forretnings-dokument-konflikter spotted: ingen
Kosmetiske fund: 1 (DELETE-branch dokumentation, G-nummer-kandidat)
```

Plan venter på Codex V2-review for dobbelt-approval.
