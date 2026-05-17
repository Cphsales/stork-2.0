# T9-plan V2 — Claude.ai forretnings-dokument-feedback (ERSTATTER tidligere V2-approval)

**Reviewer:** Claude.ai (forretnings-dokument-konsistens)
**Plan-version:** V2
**Dato:** 2026-05-17
**Resultat:** FEEDBACK — KRITISK
**Erstatter:** `T9-V2-approved-claude-ai.md` (approval trukket tilbage)

---

## Begrundelse for tilbagetrækning af approval

Min oprindelige V2-approval flaggede én MELLEM-finding ("intern inkonsistens mellem Valg 13 og Valg 8 om `org_nodes` mutability") som G-nummer-kandidat, ikke plan-blokerende.

Codex' V2 KRITISK 2-finding viser at jeg har **undervurderet severity**. Han argumenterer at hele effektiv-dato-modellen i V2 ikke kan bevare historik korrekt, og at "aktuel placement"-definitionen (`effective_to IS NULL`) er forkert for future-dated ændringer.

Hans analyse afslører at problemet ikke kun er "name kan ændres uden historik" (mit MELLEM-fund), men også:

1. `org_nodes` mangler `effective_from/effective_to` — hele tabel-modellen er current-state-only
2. `effective_to IS NULL` som "aktuel"-definition returnerer FUTURE-rows før gælder-dato — det er ikke "aktuelt"
3. Krav-dok 4.2's "Hent placering — Bruger kan se hvor en medarbejder er placeret **aktuelt**" returnerer forkert resultat efter future-dated approve+apply

Det er en **direkte modsigelse mod krav-dok** på følgende punkter:

- **Krav-dok 6.1:** "Gammel sandhed ændres ikke af ny sandhed" — bryder ved org-node-rename/move/deactivate fordi V2's current-state-only-model overskriver historik
- **Krav-dok 4.1 Hent historisk træ:** Kan ikke rekonstruere træ-state på given dato fordi name/parent/type/is_active historik ikke bevares
- **Krav-dok 4.2 Hent placering aktuelt:** `effective_to IS NULL` returnerer future-rows før gælder-dato
- **Krav-dok 3.6.1:** "Gammel sandhed ændres ikke af ny sandhed" gælder også for fremtidige ændringer der er approved men ikke effective endnu

Per Modsigelses-disciplin (mathias-afgoerelser 2026-05-17 + arbejds-disciplin.md): "Modsigelse mod krav-dokumentet eller fire-dokument-rammen er plan-blokerende. Modsigelse er ikke kandidat til G-nummer."

Min V2-approval var for lempelig. Trækkes tilbage. Plan-V2 er KRITISK-blokeret.

---

## Sammenfatning

V2 adresserer mine V1 MELLEM-fund konkret (Valg 13 + Valg 14 + Step 9). Det er solidt arbejde. Codex' V1 KRITISKE-fund er også adresseret (Beslutning 11 + Step-re-ordering).

**Men:** V2 introducerer en ny KRITISK modsigelse mod krav-dok som jeg oprindeligt undervurderede. Plan kan ikke approve i runde 2.

---

## Min KRITISK-finding (opgraderet fra V2-approval's MELLEM)

### [KRITISK] V2's `org_nodes`-model + `effective_to IS NULL`-pattern modsiger krav-dok's historik-kontrakt

**Konkret afvigelse:**

Krav-dok 6.1 specificerer:

> "Gammel sandhed ændres ikke af ny sandhed. Historik om alle struktur-ændringer, medarbejder-placeringer og klient-tilknytninger bevares."

Krav-dok 4.1 specificerer:

> "Hent historisk træ — Bruger kan se hvordan træet så ud på en given dato i fortiden"

Krav-dok 4.2 specificerer:

> "Hent placering — Bruger kan se hvor en medarbejder er placeret aktuelt"

V2's plan-elementer:

- **Valg 1 — `org_nodes`-tabel:** `(id, name, parent_id, node_type, is_active, created_at, updated_at)` — kun current-state, ingen versionering, ingen effective_from/effective_to
- **Valg 8's change-type-matrix — `org_node_upsert`:** "Payload-schema: `{id?, name, parent_id?, node_type, is_active}` ... UPDATE: undo restorer prior payload" — bekræfter at name, parent_id, node_type, is_active KAN ændres via apply
- **Valg 13's `org_tree_read_at(p_date)`:** Implementation "hent alle org_nodes hvor `created_at <= p_date`" — kan ikke rekonstruere historisk navn/parent/type/is_active
- **Valg 13's `employee_placement_read(p_emp_id)`:** Implementation "`SELECT * FROM employee_node_placements WHERE employee_id=p_emp_id AND effective_to IS NULL`" — returnerer FUTURE-row før gælder-dato hvis en future-dated flytning er apply'et

**Konsekvens — fire konkrete brud:**

1. **Org-node rename:** Hvis "FM"-afdelingen omdøbes til "Field Marketing" 1. juni via `org_node_upsert` (apply'et 1. juni), så returnerer `org_tree_read_at('2026-05-15')` "Field Marketing" — men dengang hed afdelingen "FM". Krav-dok 6.1 brudt: gammel sandhed (navnet "FM") er ændret af ny sandhed (omdøbningen).

2. **Org-node parent-flytning:** Hvis et team flyttes fra FM-afdelingen til TM-afdelingen 1. juni, så returnerer `org_tree_read_at('2026-05-15')` teamet under TM — men dengang var det under FM. Samme krav-dok 6.1-brud.

3. **Org-node deaktivering:** Hvis et team deaktiveres 1. juni, så returnerer `org_tree_read_at('2026-05-15')` teamet som inaktivt — men dengang var det aktivt. Krav-dok 4.1's "hvordan træet så ud på en given dato" returnerer forkert state.

4. **Future-dated placement:** Hvis Mads flyttes fra Team A til Team B med `effective_from='2026-07-01'` (apply'et i dag), så har Mads to placement-rows: gammel (Team A, effective_to='2026-07-01') og ny (Team B, effective_from='2026-07-01', effective_to=NULL). `employee_placement_read(Mads)` returnerer Team B — men i dag (før 1. juli) er Mads stadig på Team A. Krav-dok 4.2's "aktuelt" returnerer forkert resultat.

**Anbefalet handling: V3-rettelse**

To muligheder (Code's bord at vælge):

- **A) Versionér organisations-knuder:** Tabel `org_node_versions(node_id, name, parent_id, node_type, is_active, effective_from, effective_to)`. Læsning bruger effective-date-pattern samme som placements. Read-RPCs bruger konsistent filter `effective_from <= ref_date AND (effective_to IS NULL OR effective_to > ref_date)`.

- **B) Audit-historik-baseret rekonstruktion:** Læs `org_nodes` + audit_log for at rekonstruere state på given dato. Mere kompleks; kræver helper for at læse audit-historik.

Plus uafhængig af valg:

- Skift alle "aktuel placement"-reads og helpers fra `effective_to IS NULL` til `effective_from <= current_date AND (effective_to IS NULL OR effective_to > current_date)`.
- Eller eksplicit håndhæv `effective_from <= current_date` i wrappers hvis future-dated ændringer ikke skal understøttes (men det bryder den planlagte fortrydelses-mekanisme med gældende dato i fremtiden).

Tests skal verificere:

- Future-dated employee/client move: aktuel placement = gammel row indtil gælder-dato; ny row aktiveres på dato
- Future-dated team_close: team er aktivt indtil gælder-dato
- Org-node rename + read_at før/efter: returnerer korrekt navn for begge datoer
- Org-node parent-flytning + read_at: returnerer korrekt parent for hver dato

---

## Modsigelses-tjek mod fire-dokument-rammen (opdateret)

| Dokument                                   | Konflikt observeret?                                                                                                                                                                                                                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/strategi/vision-og-principper.md`    | **Ja.** Princip 9 ("Status-modeller bevarer historik") brudt af V2's current-state-only `org_nodes`-model. Princip 1 ("Én sandhed") brudt af `effective_to IS NULL` som "aktuel" — to konkurrerende fortolkninger ved future-dated ændringer. |
| `docs/strategi/stork-2-0-master-plan.md`   | Master-plan §1.7 ("identitet og rettigheder") specificerer versionerede tilknytninger. V2 implementerer placements som versionerede men ikke org_nodes selv.                                                                                  |
| `docs/coordination/mathias-afgoerelser.md` | **Ja.** 2026-05-16 pkt 2 ("Afdelinger ændres sjældent; historik bevares") og 2026-05-17 pkt 13 ("Alle ændringer med gældende dato følger fortrydelses-mekanisme") brudt af current-state-only-model + `effective_to IS NULL`-pattern.         |
| `docs/coordination/T9-krav-og-data.md`     | **Ja.** Krav-dok 4.1 (Hent historisk træ), 4.2 (Hent placering aktuelt), 6.1 (Gammel sandhed ændres ikke), 3.6.1 (samme) — alle brudt.                                                                                                        |

Flere konflikter mod fire-dokument-rammen identificeret. Plan-V2 er KRITISK-blokeret af forretnings-dokument-konsistens-grunde.

---

## Forhold til Codex' V2 KRITISK-fund

Codex' V2 KRITISK 2 dækker samme problem som min nuværende KRITISK-finding, men hans analyse går bredere. Vi er enige på severity og anbefalet handling.

Codex' V2 KRITISK 1 (`pending_change_request` som bypass) er kode-niveau-finding, ikke direkte forretnings-dokument-konsistens. Den indirekte konsekvens er at fortrydelses-mekanismen ikke garanteres konsistens, hvilket har forretnings-dokument-konsekvens — krav-dok 3.6.2's "Alle ændringer med gældende dato kan fortrydes" er ikke ægte håndhævet hvis caller kan bypasse wrapper-validering. Jeg bekræfter Codex' fund som relevant også på forretnings-niveau, men selve teknik-løsningen er Codex' bord.

---

## Konklusion

**Resultat: FEEDBACK — KRITISK**

Min V2-approval trækkes tilbage. V2 har én KRITISK forretnings-dokument-modsigelse (effektiv-dato-modellen) der bryder krav-dok 4.1, 4.2, 6.1, 3.6.1 + vision-princip 1 og 9 + mathias-afgørelser 2026-05-16 pkt 2 + 2026-05-17 pkt 13.

V3 forventes med konkret rettelse af effektiv-dato-modellen (versionering af org-nodes eller audit-historik-baseret read + korrekt "aktuel placement"-pattern).

**Erkendelse af review-fejl:** Jeg burde have vurderet Finding 1 i V2-approval som KRITISK, ikke MELLEM. Codex' V2 KRITISK 2 gjorde det klart at scopet er bredere end jeg så. Lærdom: ved interne plan-inkonsistenser der berører historik-bevarelse, vurder severity som modsigelse mod krav-dok 6.1 / vision-princip 9 — det er KRITISK, ikke MELLEM.

---

## Approval-status

| Reviewer          | Status                                               |
| ----------------- | ---------------------------------------------------- |
| Claude.ai (denne) | **FEEDBACK — KRITISK** (V2-approval trukket tilbage) |
| Codex             | FEEDBACK — KRITISK (2 fund)                          |

Plan er KRITISK-blokeret af begge reviewere. V3 forventes fra Code.
