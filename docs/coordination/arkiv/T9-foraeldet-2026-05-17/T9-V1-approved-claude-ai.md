# T9 V1 — Approval fra Claude.ai

**Reviewer:** Claude.ai (forretnings-dokument-reviewer)
**Plan-version:** V1
**Plan-fil:** `docs/coordination/T9-plan.md`
**Dato:** 2026-05-17
**Resultat:** APPROVAL

---

## Fire-dokument-konsultations-tjek

| Tjek                                                    | Resultat |
| ------------------------------------------------------- | -------- |
| Sektion findes i plan                                   | ✓        |
| Alle 4 rækker har "ja" på konsulteret                   | ✓        |
| Referencer konkrete (ikke "hele filen" som dovent svar) | ✓        |
| Konflikter rapporteret af Code                          | ingen    |

---

## Verificering direkte mod kilderne

Jeg har læst hver refereret kilde via Filesystem-MCP og verificeret Code's plan mod indholdet — ikke stolet på Code's egen erklæring.

### Vision (`docs/strategi/vision-og-principper.md`)

- Princip 2 (rettigheder i UI — subtree-scope-helpers aktiveres på role_page_permissions.scope-feltet): **konsistent**
- Princip 3 (sammenkobling eksplicit — FK-constraints obligatoriske; client_id allowlistet med plan til trin 10): **konsistent inden for rettelse 33's allowlist-mekanisme** (se finding 3 nedenfor)
- Princip 6 (audit på alt der ændrer data — alle T9-tabeller har audit-trigger; closure exempt via udvidet mønster): **konsistent inden for rettelse 23's allowlist-mekanisme** (se finding 2 nedenfor)
- Princip 9 (status-modeller bevarer historik — is_active-flag + versioneret tilknytning): **konsistent**
- Princip 8 (identitet eksisterer én gang): **reference-fejl** (se finding 1 nedenfor)

### Master-plan (`docs/strategi/stork-2-0-master-plan.md`)

- §0.5 (migration-grundprincip): plan følger direkte udtræk + upload uden ETL/staging-schema ✓
- §1.7 (org-træ, closure, acl_subtree, teams, versionerede tilknytninger): plan implementerer 1:1 ✓
- §1.11 (core_identity-schema): alle T9-tabeller placeret korrekt ✓
- §3 CI-blocker 19 (FK-coverage): planen håndhæver via allowlist-entry for client_id (se finding 3)
- §3 CI-blocker 20 (tx-wrap): benchmark + tests bruger BEGIN/ROLLBACK ✓
- §3 Performance-disciplin (subtree-RLS benchmark som CI-blocker): aktiveres via fitness.mjs ✓
- §4 trin 9 (alle leverancer): dækket ✓
- Rettelse 19 C1 (closure-table over rekursiv CTE): fulgt 1:1 ✓
- Rettelse 20 (migration): fulgt ✓
- Rettelse 23 (AUDIT_EXEMPT_SNAPSHOT_TABLES-mønster): genbrugt til closure (se finding 2)

### Mathias-afgørelser (`docs/coordination/mathias-afgoerelser.md`)

2026-05-16 entry "Forretningssandhed: org-struktur, teams, klienter, dataejerskab" — alle 9 punkter verificeret mappet til konkrete plan-elementer:

1. Ejerskabs-kæde Copenhagen Sales → afdelinger → teams → relationer — implementeret via `org_units.parent_id`-hierarki + `teams.org_unit_id` FK ✓
2. Afdelinger ændres sjældent; historik bevares — is_active-mønster + audit-trigger på org_units ✓
3. Team kan ophøre; medarbejdere bliver team-løse — `team_deactivate`-RPC lukker assignments via UPDATE; employees-row uændret ✓
4. Klient kan aldrig dræbe et team — ingen CASCADE-konstruktion; client_team_ownership FK on delete restrict (når FK tilføjes i trin 10) ✓
5. Klient ejer sin egen data — dokumenteret som konsekvens for trin 14+ (sales-attribution via client_id) ✓
6. is_active-flag på teams og afdelinger — implementeret på begge tabeller ✓
7. Én medarbejder i ét team ad gangen, også stab — partial unique `(employee_id, to_date IS NULL)`, ingen stab-undtagelse ✓
8. Ingen hardkodet horizon for migration — upload-script `--from-date` parameter, default = "alt" ✓
9. Teams/afdelinger anonymiseres ikke — pii_level='none' på alle org_units/teams-kolonner ✓

Andre relevante afgørelser også honoreret: 2026-05-16 Tx-rollback default mønster, 2026-05-16 Oprydnings-disciplin, 2026-05-16 Fire-dokument-disciplin, 2026-05-15 Plan-leverance er kontrakt.

### Krav-dok (`docs/coordination/T9-krav-og-data.md`)

Alle 8 verificerede scope-underafsnit + alle 19 Mathias-afgørelser fra krav-dok's afgørelses-tabel + alle 10 tekniske valg adresseret. Klassifikations-tal-inkonsistens lukket i Step 9. Anonymiserings-håndtering (pii_level='none') matcher krav-dok §1.4 + §0.5.

---

## Findings

### Finding 1 — Princip 8-reference upræcis

**Severity:** KOSMETISK

**Konkret afvigelse:** Plan citerer vision-princip 8 ("Identitet eksisterer én gang") som rationale for "én medarbejder kan kun være i ét team ad gangen pr. krav-dok pkt 7" i Fire-dokument-konsultations-tabellen.

Princip 8 lyder: "Personer findes som én entitet. Systemer kobles via identity-mapping, ikke parallelle person-tabeller."

Det handler om **person-entitets-unikhed på tværs af eksterne systemer** (en person har én row i `employees`, eksterne identifikationer går via identity-master-tabellen — §1.7 Identitet-master). Det handler IKKE om team-tilknytnings-unikhed.

Den korrekte kilde for én-medarbejder-ét-team-reglen er mathias-afgoerelser 2026-05-16 punkt 7 (allerede refereret i samme række — fint at have begge, men princip 8 er ikke materiel kilde).

**Anbefalet handling:** Kosmetisk note. Hvis pakken får runde V2 af andre grunde: fjern princip 8-reference fra vision-rækken; behold mathias-afgoerelser pkt 7-reference. Ellers G-nummer-kandidat: "Plan-skabelon-vejledning: præcisering af vision-princip-referencer i Fire-dokument-konsultations-tabel."

### Finding 2 — Rettelse 23-mønster udvides til derived-tables uden eksplicit flagging

**Severity:** KOSMETISK

**Konkret afvigelse:** Plan Valg 3 anbefaler at tilføje `core_identity.org_unit_closure` til `AUDIT_EXEMPT_SNAPSHOT_TABLES`-allowlist. Code's argument 3: "Closure er semantisk i samme kategori som snapshot: derived-from-parent, atomically rebuilt."

Rettelse 23 (master-plan linje 192) etablerer mønstret SPECIFIKT for snapshot-tabeller som compute-byproducts fra auditerede aggregat-operationer (lock-pipeline-output med `pay_period_candidate_runs`-tracking). Den oprindelige scope-beskrivelse: "commission_snapshots og fremtidige kpi_snapshots + payroll-linjer (trin 22)".

Closure-table er ikke samme kategori i streng forstand:

- Snapshot-tabeller: én aggregat-event producerer mange rows; audit-spor er på aggregatet
- Closure-table: mange små mutations-events (én pr. org_units-ændring); audit-spor er på hver org_units-mutation

Forskellen er ikke kritisk — princippet om "audit-spor findes på forudgående mutation" holder i begge tilfælde. Men Code's begrundelse formulerer det som direkte anvendelse af eksisterende mønster, hvor det reelt er en **kategori-udvidelse**: snapshot-tabeller → snapshot-tabeller + derived-tables.

**Anbefalet handling:** G-nummer. Master-plan rettelse 23 bør på sigt udvides til at eksplicit dække derived-tables-kategorien (eller ny rettelse der formaliserer mønstret). Konkret tekst i slut-rapportens "Plan-afvigelser"-sektion kan dokumentere kategori-udvidelsen så audit-trail er klar.

### Finding 3 — CI-blocker 19 allowlist udvides til "endnu-ikke-eksisterende interne FK"

**Severity:** KOSMETISK

**Konkret afvigelse:** Master-plan linje 1415 (CI-blocker 19): "Tilladte undtagelser dokumenteres i `scripts/fitness.mjs` allowlist (`FK_COVERAGE_EXEMPTIONS`) med begrundelse (fx eksterne reference-ID'er som `external_id`, `client_crm_match_id`)".

Eksemplerne er **eksterne reference-ID'er** — ID'er der peger på data uden for Stork's eget schema. Code's Valg 4 tilføjer `client_team_ownerships.client_id` til allowlist'en med begrundelse "FK tilføjes i trin 10 når core_identity.clients eksisterer; pre-cutover ingen rows".

Det er en **ny kategori**: "intern FK der venter på cross-trin schema-evolution". Rettelse 33's krav om "med begrundelse" er teknisk opfyldt, men kategorien er ny.

Code's afvisning af alternativ B (udskyd hele tabellen til trin 10) er solid: krav-dok specificerer client_team_ownerships som T9-leverance. Code's afvisning af C (NOT VALID FK) er også solid: NOT VALID skjuler hvad der faktisk er på plads.

Materielt er der ingen reel risiko (pre-cutover ingen rows; trin 10 tilføjer FK ved ALTER). Men strategisk er det en ny use-case for allowlist-mekanismen.

**Anbefalet handling:** G-nummer. Slut-rapporten dokumenterer kategori-udvidelsen eksplicit. På sigt: hvis mønstret gentages (andre cross-trin FK'er), bør mathias-afgørelse formalisere det som etableret pattern. Indtil da: éngangs-undtagelse med dokumenteret plan til trin 10-lukning.

---

## Approval-rationale

Tre KOSMETISKE findings; ingen MELLEM eller KRITISKE. Per claude-ai-overvågnings-prompt severity-disciplin: KOSMETISKE fund leverer APPROVAL med G-nummer-anbefalinger.

Plan-V1 er gennemarbejdet:

- Alle krav-dok-leverancer adresseret med konkret implementations-vej
- Alle 10 tekniske valg har eksplicit anbefaling + begrundelse + alternativ-argumentation
- Alle 9 mathias-afgørelser-punkter mappet til konkrete plan-elementer
- Implementations-rækkefølge er logisk (org_units → closure → teams → tilknytninger → policy → scripts → benchmark → klassifikation → cleanup)
- Risiko-matrix dækker steps med konkret rollback
- Oprydnings-strategi og fire-dokument-konsultations-sektionen er obligatoriske og udfyldt korrekt

Planen er konsistent med vision, master-plan, mathias-afgørelser og krav-dok på materielt niveau. De tre findings er præcisering af begrundelser/referencer, ikke materielle brud.

---

## Forretnings-dokument-konflikter spotted

Ingen.

---

## Rapportér-format

```
Review-type: plan V1
Pakke: T9 (Identitet del 2)
Resultat: APPROVAL
Feedback-fil: docs/coordination/plan-feedback/T9-V1-approved-claude-ai.md
Kritiske fund: ingen
Forretnings-dokument-konflikter spotted: ingen
G-nummer-kandidater: 3 (princip 8-reference upræcis, rettelse 23-kategori-udvidelse, CI-blocker 19-allowlist-kategori-udvidelse)
```

Plan er approved af Claude.ai. Afventer Codex's kode-review for at lukke approval-port (dobbelt-port).
