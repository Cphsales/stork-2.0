# Codex feedback — T9 plan V2

Review-type: Plan-review
Pakke: T9 — Identitet del 2
Plan-fil: `docs/coordination/T9-plan.md`
Krav-dok: `docs/coordination/T9-krav-og-data.md`
Branch: `claude/T9-plan`
Resultat: FEEDBACK
Runde: 2

## Oprydnings-sektion-tjek

OK. Planen indeholder konkret sektion `Oprydnings- og opdaterings-strategi` med berørte arkiverings-, dokumentations-, status- og grep-tjek.

## Fund

### [KRITISK] `pending_change_request` er stadig en direkte bypass omkring wrapper-valideringerne

Konkret afvigelse: V2 flytter de tidsbaserede mutationer ind bag public wrapper-RPCs og interne `_apply_*`-handlers. Det adresserer V1's direkte write-bypass. Men planen lader stadig `pending_change_request(p_change_type, p_target_id, p_payload, p_effective_from)` eksistere som RPC og siger, at den kan kaldes direkte for change_types ikke listet ovenfor (`docs/coordination/T9-plan.md:209`). Samtidig siger Step 8, at wrapper-RPC'erne er sikkerhedsgrænsen, og at alle valideringer skal ske der, ikke i apply-handlers (`docs/coordination/T9-plan.md:571`, `docs/coordination/T9-plan.md:573`).

Det giver en ny bypass: en authenticated caller kan potentielt springe wrapperen over og oprette en `pending_changes`-row med en forged payload for en eksisterende `change_type` eller en fremtidig `change_type`. Testlisten verificerer at interne apply-handlers ikke kan kaldes direkte, men den verificerer ikke at direkte authenticated kald til `pending_change_request` afvises eller kører samme permission/payload-validering som wrapperen (`docs/coordination/T9-plan.md:575`, `docs/coordination/T9-plan.md:581`). Hvis en sådan row efterfølgende godkendes/applies, har systemet igen to request-veje med forskellig valideringsgaranti.

Anbefalet handling: V3-rettelse. Vælg én model og gør den entydig:

- Enten er `pending_change_request` intern: `revoke execute from authenticated`, kaldes kun af wrapper-RPCs, og direct-call-test skal give permission denied.
- Eller er `pending_change_request` public: så skal den selv slå op i en change-type registry og udføre præcis samme `has_permission`, payload-schema-validering og invariants som wrapperne. Wrapperne må i så fald kun være ergonomiske aliases.

Tilføj smoke-test for direkte authenticated kald til `pending_change_request` med forged payload for hver kendt pending change_type. Testen skal enten afvise kaldet eller bevise samme validering som wrapperen.

### [KRITISK] Effektiv-dato og historik kan ikke bygges korrekt med den beskrevne state-model

Konkret afvigelse: Krav-dok kræver, at gammel sandhed ikke ændres af ny sandhed, og at historik om strukturændringer, medarbejder-placeringer og klient-tilknytninger bevares (`docs/coordination/T9-krav-og-data.md:93`, `docs/coordination/T9-krav-og-data.md:124`, `docs/coordination/T9-krav-og-data.md:266`). V2 tilføjer read-RPCs, men den konkrete model kan ikke returnere korrekt current/historical state:

- `org_nodes` har kun current-state kolonner (`name`, `parent_id`, `node_type`, `is_active`, timestamps) uden `effective_from/effective_to` eller en versions-/history-tabel (`docs/coordination/T9-plan.md:161`, `docs/coordination/T9-plan.md:456`).
- `org_node_upsert` kan ændre navn, parent, type og `is_active`, og `team_close` sætter team inactive (`docs/coordination/T9-plan.md:183`, `docs/coordination/T9-plan.md:185`, `docs/coordination/T9-plan.md:277`, `docs/coordination/T9-plan.md:279`).
- `org_tree_read_at(p_date)` er planlagt som `created_at <= p_date` på current `org_nodes` og antager, at strukturen er immutable bortset fra `is_active` (`docs/coordination/T9-plan.md:374`). Det kan ikke rekonstruere et tidligere parent_id, navn, node_type eller aktiv/inaktiv-status efter en flytning, omdøbning eller deaktivering med effective date.
- `employee_placement_read` bruger `effective_to IS NULL` som aktuel placering (`docs/coordination/T9-plan.md:375`, `docs/coordination/T9-plan.md:597`). Ved en future-dated flytning vil apply-handleren typisk lukke gammel row med `effective_to=<future date>` og oprette ny row med `effective_from=<future date>, effective_to=NULL`. Indtil datoen indtræffer er den gamle row stadig den aktuelle sandhed, men read-RPC'en returnerer den nye future-row. Samme problem rammer `client_placement_read` og alle helpers der tolker "aktiv placement" som `effective_to IS NULL`.

Det er ikke kun en dokumentationsdetalje. Det betyder at current tree/current placement kan skifte for tidligt, og at historical tree ikke kan beregnes korrekt efter almindelige strukturændringer. Det bryder T9's history-/effective-date-kontrakt på SQL-designniveau.

Anbefalet handling: V3-rettelse. Gør effective-date-modellen eksplicit og testbar:

- Versionér organisationsknuder eller deres mutable felter, fx med `org_node_versions(node_id, name, parent_id, node_type, is_active, effective_from, effective_to)` eller tilsvarende temporal model. `org_tree_read()` og `org_tree_read_at(p_date)` skal bruge samme periodefilter som placements.
- Skift alle current placement-reads og ACL-helperes "aktiv placement"-definition til `effective_from <= current_date AND (effective_to IS NULL OR effective_to > current_date)`, ikke kun `effective_to IS NULL`.
- Hvis T9 bevidst ikke tillader future-dated ændringer, skal wrapperne håndhæve `effective_from <= current_date` og planen skal sige det eksplicit. Historisk træ kræver stadig versionering eller audit-query med effective-date-semantik.
- Tilføj tests for: future-dated employee/client move, future-dated team_close, org-node rename/move/deactivate, og `org_tree_read_at` før/efter ændringen.
