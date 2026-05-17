# T9-plan V5 — Claude.ai forretnings-dokument-approval

**Reviewer:** Claude.ai (forretnings-dokument-konsistens)
**Plan-version:** V5
**Dato:** 2026-05-17
**Resultat:** APPROVAL
**Runde:** 4+

---

## Sammenfatning

V5 er ren konsistens-sweep af V4's nye identity+versions-arkitektur gennem hele planen. Ingen arkitektur-ændring; alle ændringer er tekstuelle rettelser så plan-elementer konsistent bruger V4's Beslutning 13's model.

Mine V4-fund er fuldt adresseret:

- **6 inkonsistens-punkter rettet:** Beslutning 1, Valg 1's tabel-liste, Valg 2's trigger/cycle-detect, Valg 12's seed, Valg 13's `org_tree_read()`, Mathias-mapping pkt 1+2+6+10
- **Nyt fitness-check `org_nodes_no_mutable_columns_in_sql`:** grep-baseret CI-blocker forhindrer regression til pre-V4 gammel model. Per Codex' V4 + min V4-anbefaling

Codex' V4-fund (samme problem som mit) er også adresseret af samme sweep.

Per anti-glid runde 3+: KRITISKE fund mangler, plan er approval-klar fra forretnings-dokument-perspektiv.

---

## Verifikation af V4-fund adresseret

| V4-fund                                                                                       | V5-fix                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Beslutning 1: "self-refererende parent_id + node_type ENUM" på org_nodes                      | V5: "identity-only; mutable felter (name, parent_id, node_type, is_active) lever på org_node_versions. parent_id på versions er self-refererende til org_nodes.id"      |
| Valg 1's tabel-liste: `org_nodes(id, name, parent_id, node_type, is_active, ...)`             | V5: `org_nodes(id, created_at, updated_at)` (identity-only); mutable felter på `org_node_versions`                                                                      |
| Valg 2: "AFTER-trigger på org_nodes" + cycle-detect på `org_nodes.parent_id`                  | V5: AFTER-trigger på `org_node_versions` (på rows effektive at current_date); cycle-detect over versions                                                                |
| Valg 12's seed: `org_nodes(name='Copenhagen Sales', node_type='department', parent_id=NULL)`  | V5: INSERT identity-row + INSERT version-row med effective_from='2026-05-17'; eksplicit pair-pattern for hver knude                                                     |
| Valg 13's `org_tree_read()`: "SELECT \* FROM org_nodes WHERE is_active=true"                  | V5: `= org_tree_read_at(current_date)`. Recursive CTE over org_node_versions med effective-date-filter joined med org_nodes for identity                                |
| Mathias-mapping pkt 1, 2, 6, 10: refererer org_nodes.node_type, parent_id-hierarki, is_active | V5: opdateret til `org_node_versions.node_type` + `org_node_versions.parent_id` + `org_node_versions.is_active` (V5-sweep — mutable felter på versions, ikke org_nodes) |

Plus nyt fitness-check:

> **`org_nodes_no_mutable_columns_in_sql`** (ny V5): grep-baseret CI-blocker; scanner `supabase/migrations/**/*.sql` for `org_nodes.name`, `org_nodes.parent_id`, `org_nodes.node_type`, `org_nodes.is_active`. Fejler hvis nogen findes uden for migration der dropper kolonnen. Forhindrer regression til pre-V4 gammel mutable model. Per Codex V4 + Claude.ai V4 anbefaling.

CI-blocker er den rigtige forsikring mod fremtidig regression — bedre end at stole på review-disciplin alene.

---

## Krav-dok-konsistens-tjek (re-verifikation efter V5-sweep)

| Krav-dok-element                                  | Plan-element                                                                                                                       | Status               |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 6.1 Gammel sandhed ændres ikke af ny sandhed      | Beslutning 13 + Valg 12's seed med effective_from + Valg 13's effective-date-pattern + nyt fitness-check der forhindrer regression | ✓ Konsistent leveret |
| 4.1 Hent træ + Hent historisk træ                 | Valg 13's `org_tree_read() = org_tree_read_at(current_date)` (symmetrisk pattern)                                                  | ✓ Konsistent         |
| 4.2 Hent placering aktuelt + historisk            | Beslutning 14's entydige "aktiv"-definition + Valg 13's read-RPCs                                                                  | ✓ Konsistent         |
| 3.6.1 + 6.1 Historik om strukturændringer bevares | org_node_versions er primær mutable lagring; alle ændringer skaber versions-rows                                                   | ✓ Konsistent         |

Krav-dok 6.1 + 4.1 + 4.2 + 3.6.1 er nu entydigt leveret — V5-sweep eliminerede inkonsistensen der underminerede V4's fix.

---

## Sekundære observationer (KOSMETISKE — ikke plan-blokerende)

Mindre tekst-præciseringer i V5 hvor sweep'en kunne være endnu skarpere. Disse er ikke decideret forkerte og ikke G-nummer-værdige, men kunne forbedres i fremtidig pakke:

1. **Mathias-afgørelser pkt 3:** Refererer "Step 5's team_close-RPC" — men team_close-apply-handler er nu i Step 4 (`_apply_team_close`). Step-nummer-fejl. Mindre kosmetisk.

2. **Step 3's smoke-test-tekst:** "INSERT/UPDATE/DELETE org_nodes → closure-rebuild korrekt" — kunne præciseres til at trigger er på org_node_versions (closure rebuilds når current-version ændres).

3. **Step 2's test-fil-navn:** `t9_org_nodes.sql` indeholder reelt versions-tests; kunne hedde `t9_org_nodes_and_versions.sql`. Navngivning OK som-er.

Ingen af disse er konsistens-fejl der forhindrer Code i at implementere korrekt. CI-blocker `org_nodes_no_mutable_columns_in_sql` fanger eventuelle implementations-fejl. Plan-tekst kunne være endnu mere V5-sweep'et, men det er ikke approval-blokerende.

---

## Modsigelses-tjek mod fire-dokument-rammen

| Dokument                                   | Konflikt observeret?                                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `docs/strategi/vision-og-principper.md`    | Nej. Princip 9 (status-modeller bevarer historik) honoreret konsistent gennem V5-sweep'ede plan-elementer. |
| `docs/strategi/stork-2-0-master-plan.md`   | Nej. §1.7's versionerede tilknytninger udvidet konsistent til org-struktur.                                |
| `docs/coordination/mathias-afgoerelser.md` | Nej. 2026-05-16 pkt 2 + 2026-05-17 pkt 13 honoreret.                                                       |
| `docs/coordination/T9-krav-og-data.md`     | Nej. Krav-dok 6.1 + 4.1 + 4.2 + 3.6.1 nu entydigt leveret efter V5-sweep.                                  |

Ingen modsigelser mod fire-dokument-rammen. Plan er forretnings-dokument-konsistent.

---

## Codex-opgraderings-rolle

Codex' V4-review leverede KRITISK feedback om samme problem (intern V4-inkonsistens), ingen OPGRADERING-forslag. Codex' V5-review afventes. Plan er approval-klar fra Claude.ai-perspektiv uanset Codex' V5-position på forretnings-dokument-niveau; teknisk-niveau verifikation (kode-validering) er Codex' bord.

---

## Konklusion

**Resultat: APPROVAL**

V5 er omhyggelig konsistens-sweep der adresserer Codex V4 + Claude.ai V4's KRITISK fund. Alle 6 inkonsistens-punkter er rettet. Nyt fitness-check forhindrer regression. Plan er forretnings-dokument-konsistent og leverer krav-dok 6.1 + 4.1 + 4.2 + 3.6.1 entydigt.

Sekundære KOSMETISKE observationer (Mathias-mapping step-reference, smoke-test-tekst-præcision) er ikke approval-blokerende.

V5 er femte plan-version i T9-runden, fjerde KRITISK-iteration. Per plan-konklusionens egen disciplin-note: hvis V5 stadig havde inkonsistens, skulle vi STOP. V5 har det IKKE — sweep er gennemført. Approval kan gives med trust til arkitekturen og rettelserne.

---

## Approval-status

| Reviewer          | Status                                                    |
| ----------------- | --------------------------------------------------------- |
| Claude.ai (denne) | **APPROVED** (sekundære KOSMETISKE observationer noteret) |
| Codex             | Afventer V5-review                                        |

Plan er IKKE approval-klar før begge har approved. Hvis Codex approver V5 (eller leverer kun KOSMETISKE), kan Mathias paste `qwerg` til Code for build-start.
