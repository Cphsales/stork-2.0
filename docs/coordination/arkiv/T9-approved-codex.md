# Codex approval — T9 plan V6

Review-type: Plan-review
Pakke: T9 — Identitet del 2
Plan-fil: `docs/coordination/T9-plan.md`
Krav-dok: `docs/coordination/T9-krav-og-data.md`
Branch: `claude/T9-plan`
Resultat: APPROVAL
Runde: 3+

## Oprydnings-sektion-tjek

OK. Planen indeholder konkret sektion `Oprydnings- og opdaterings-strategi` med arkivering, dokumentopdateringer, grep-tjek og ansvar.

## Vurdering

APPROVED. V6 lukker Codex V5's KRITISKE fund ved at flytte due-checket ind i `pending_change_apply` som central apply-gate. Cron er nu kun selection-filter, og manuel/admin apply går gennem samme guard:

`status='approved' AND undo_deadline <= now() AND effective_from <= current_date`

Jeg finder ingen KRITISKE eller MELLEM kodefund, der skal stoppe planen i runde 3+.

## Kosmetisk note / G-nummer-kandidat

### [KOSMETISK] Step 3-testtekst nævner stadig mutationer på `org_nodes`

Konkret afvigelse: Step 3's testliste siger stadig `Mutations-konsistens: INSERT/UPDATE/DELETE org_nodes -> closure-rebuild korrekt` (`docs/coordination/T9-plan.md:665`). Den egentlige V5/V6-kontrakt er dog klar andre steder: closure-triggeren sidder på `org_node_versions`, ikke på identity-only `org_nodes`.

Anbefalet handling: G-nummer eller kosmetisk build-rettelse. Ret testteksten til `INSERT/UPDATE/DELETE org_node_versions` eller "versions-mutationer" for at undgå forvirring, men det er ikke approval-blokerende i runde 3+.
