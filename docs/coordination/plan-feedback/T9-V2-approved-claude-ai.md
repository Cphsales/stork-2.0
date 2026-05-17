# T9-plan V2 — Claude.ai forretnings-dokument-review

**Reviewer:** Claude.ai (forretnings-dokument-konsistens)
**Plan-version:** V2
**Dato:** 2026-05-17
**Resultat:** APPROVAL (1 MELLEM-finding som G-nummer-kandidat)

---

## Sammenfatning

V2 adresserer begge MELLEM-fund fra V1 konkret og solidt:

- **V1 MELLEM 1 (Hent-funktioner ikke eksplicit dækket):** Nyt Valg 13 + Step 9 leverer dedikerede read-RPCs for alle 9 Hent-funktioner fra krav-dok sektion 4. Permission-check med `has_permission` på indgang. Aktuelle og historiske queries følger konsistent pattern.

- **V1 MELLEM 2 (rolle-til-medarbejder):** Nyt Valg 14 verificerer trin 5's `employee_upsert` dækker Tildel/Skift/Fjern via role_id-parameter. Tynde wrappers `employee_role_assign/remove` tilføjet for klarhed. Begrundet hvorfor IKKE pending-pligtig (krav-dok 4.4 ikke "gældende dato").

V1's KOSMETISKE-fund er dokumenteret som G-nummer-kandidater i Step 13's teknisk-gæld-opdatering.

Codex' to KRITISKE fund (skrivevej-konflikt + change_type-matrix) er også adresseret med solid arkitektur-ændring: pending_changes etableres tidligt (Step 1), interne apply-handlers i Steps 2+4+5, public pending-wrappers samlet i Step 8. Step-re-ordering eliminerer V1's to-skriveveje-problem.

Per anti-glid runde 2: MELLEM-findings → G-nummer-kandidater, ikke plan-blokerende. APPROVAL afgives.

---

## Verifikation af mine V1-fund er adresseret

### V1 MELLEM 1 — Hent-funktioner — ADRESSERET ✓

V2 leverer dedikerede read-RPCs (Valg 13 + Step 9):

| Krav-dok funktion              | V2's RPC                                        | Status                                            |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------------- |
| 4.1 Hent træ                   | `org_tree_read()`                               | ✓                                                 |
| 4.1 Hent historisk træ         | `org_tree_read_at(p_date)`                      | ✓ (med MELLEM-præcisering, se Finding 1 nedenfor) |
| 4.2 Hent placering             | `employee_placement_read(p_emp_id)`             | ✓                                                 |
| 4.2 Hent historisk placering   | `employee_placement_read_at(p_emp_id, p_date)`  | ✓                                                 |
| 4.3 Hent klients team          | `client_placement_read(p_client_id)`            | ✓                                                 |
| 4.3 Hent historisk tilknytning | `client_placement_read_at(p_client_id, p_date)` | ✓                                                 |
| 4.5 Hent struktur              | `permission_elements_read()`                    | ✓                                                 |
| 4.6 Hent rolles rettigheder    | `role_permissions_read(p_role_id)`              | ✓                                                 |
| 4.7 Hent ventende ændringer    | `pending_changes_read()`                        | ✓                                                 |

Begrundelse for dedikerede RPC'er er solid: "Frontend kan ikke konsistent konstruere versions-filter-queries pr. side. Dedikeret RPC giver én tested implementation pr. krav-dok-funktion + reducerer fejl-overflade." Permission-check på indgang ensures konsistent autorisation.

### V1 MELLEM 2 — Rolle-til-medarbejder — ADRESSERET ✓

V2 verificerer eksplicit mod trin 5's `employee_upsert`-signatur (Valg 14):

- **Tildel:** `employee_upsert(...)` med konkret `p_role_id`
- **Skift:** `employee_upsert(...)` med ny `p_role_id`
- **Fjern:** `employee_upsert(...)` med `p_role_id=NULL`

Tynde wrappers `employee_role_assign` + `employee_role_remove` tilføjet for ækvivalent navngivning med krav-dok 4.4. Konsistent med krav-dok 3.3 ("Hver medarbejder har én rolle ad gangen. Rolle sættes på medarbejderen i UI.").

Begrundelse for IKKE pending-pligtig er solid: "krav-dok 4.4 specificerer ikke 'gældende dato'; sker umiddelbart". Konsistent med Beslutning 11's afgrænsning.

G-nummer-kandidat for fremtidig konvertering til pending-wrapper er passende dokumenteret som åben option.

### V1 KOSMETISKE — Dokumenteret som G-nummer-kandidater ✓

- KOSMETISK 3 (krav-dok-modsigelse 18 vs 25): G-nummer-kandidat i Step 13's teknisk-gæld-opdatering for Mathias-præcisering
- KOSMETISK 4 (ENUM-sprog): Dokumenteret som bevidst valg; G-nummer ikke nødvendig

---

## Ny V2-finding

### Finding 1 — [MELLEM, G-nummer-kandidat] Intern inkonsistens i V2 mellem Valg 13 og Valg 8 om org_nodes mutability

**Konkret afvigelse:**

Valg 13's implementation af `org_tree_read_at(p_date)` antager:

> "V2-implementation: hent alle org_nodes hvor `created_at <= p_date` (struktur-ændringer er log via audit-trail; **`org_nodes`-tabel er immutable bortset fra is_active**)"

Men Valg 8's change-type-matrix specificerer for `org_node_upsert`:

> "| `org_node_upsert` | `org_node_upsert` | `_apply_org_node_upsert` | `{id?, name, parent_id?, node_type, is_active}` | ... | **UPDATE: undo restorer prior payload** |"

"UPDATE-restorer prior payload" indikerer at `name` og potentielt `parent_id` KAN ændres via `pending_change_apply`. Det modsiger Valg 13's "immutable bortset fra is_active".

**Konsekvens for historisk-træ-semantik:**

Hvis et team omdøbes fra "FM" til "Field Marketing" den 1. juni, og bruger spørger `org_tree_read_at('2026-05-15')`, hvad skal returneres?

- Valg 13's implementation (læs `org_nodes.name` direkte): returnerer "Field Marketing" (nuværende navn)
- Krav-dok 4.1's intention ("hvordan træet så ud på en given dato"): returnerer "FM" (navn dengang)

Samme problem med `parent_id`-ændringer hvis et team flyttes mellem afdelinger.

**Anbefalet handling: G-nummer-kandidat (præcisering i V3 eller senere pakke)**

To muligheder:

- **A) Strammere immutability:** Hvis `name` og `parent_id` reelt ER immutable efter create (kun is_active kan ændres), så fjern `org_node_upsert` UPDATE-mode fra change-type-matrix. Ændringer kræver da deaktivering + ny knude. Plan-tekst opdateres for konsistens.

- **B) Audit-historik-baseret implementation:** `org_tree_read_at(p_date)` læser `org_nodes` + audit_log for at rekonstruere historisk state. Mere kompleks implementation; kræver helper for at læse audit-historik.

Per anti-glid runde 2: MELLEM → G-nummer-kandidat. Plan ikke blokeret; Code afgør hvilken vej i V3 eller senere pakke. Bør dokumenteres i Step 13's teknisk-gæld-opdatering.

---

## Modsigelses-tjek mod fire-dokument-rammen

Per Modsigelses-disciplin (mathias-afgoerelser 2026-05-17 + arbejds-disciplin.md): V2-planen er reviewet for modsigelse mod fire-dokument-rammen.

| Dokument                                   | Konflikt observeret?                                                                                                                                                                                                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/strategi/vision-og-principper.md`    | Nej. V2's Beslutning 11 (pending_changes som eneste skrivevej) styrker Princip 6 (audit på alt der ændrer data) og Princip 9 (status-modeller bevarer historik). Konsistent med vision-rammen.                                                                              |
| `docs/strategi/stork-2-0-master-plan.md`   | Nej. V2's Step-re-ordering bevarer master-plan §1.7's helper-arkitektur. CI-blocker 19+20 honoreres. Subtree-RLS-benchmark udskudt til trin 14 (uændret fra V1).                                                                                                            |
| `docs/coordination/mathias-afgoerelser.md` | Nej. V2 honorerer alle 32 afgørelser fra krav-dok sektion 10 (uændret fra V1). Beslutning 11's afgrænsning ("permission-element-CRUD + grants + rolle-tildeling ikke pending-pligtige") er konsistent med krav-dok 3.6.2's eksplicitte liste af pending-pligtige ændringer. |
| `docs/coordination/T9-krav-og-data.md`     | Nej. Krav-dok sektion 4's 9 funktions-grupper er fuldt dækket i V2 via dedikerede RPC'er. Krav-dok 3.6.2's afgrænsning af fortrydelses-mekanisme honoreres. Krav-dok 7.2's migration af eksisterende permission-tabel honoreres.                                            |

**Intern V2-modsigelse identificeret:** Finding 1 ovenfor — mellem Valg 13's og Valg 8's antagelser om `org_nodes` mutability. Ikke modsigelse mod fire-dokument-rammen; intern plan-koherens. G-nummer-kandidat.

---

## Codex-opgraderings-rolle (2026-05-17)

V2 dokumenterer eksplicit at Codex' V1-fund ikke inkluderede OPGRADERING-forslag. Plan inviterer fortsat OPGRADERING-forslag fra Codex på Valg 1-14 (V2's nye Valg medregnet).

Codex' to V1 KRITISKE-fund (skrivevej-konflikt + change_type-matrix) er adresseret med solid arkitektur-ændring. Codex' MELLEM-finding (can_user_see-signatur) er adresseret via helper-split (acl_visibility_check + permission_resolve).

---

## Konklusion

**Resultat: APPROVAL (forretnings-dokument-konsistens)**

V2 er solid plan. Begge mine V1 MELLEM-fund er adresseret. V1 KOSMETISKE-fund er dokumenteret som G-nummer-kandidater. Codex' fund er adresseret med arkitektur-forbedring der eliminerer V1's to-skriveveje-problem.

Én MELLEM-finding identificeret i V2: intern inkonsistens mellem Valg 13 og Valg 8 om `org_nodes` mutability. Per anti-glid runde 2: G-nummer-kandidat, ikke plan-blokerende. Bør dokumenteres i Step 13's teknisk-gæld-opdatering for senere afklaring.

Plan klar til build efter Codex V2-approval. Hvis Codex flagger MELLEM- eller KRITISK-fund i V2, skal V3 leveres. Hvis Codex approver eller flagger KOSMETISK-/OPGRADERING-fund, kan plan godkendes af Mathias for build.

---

## Approval-status

| Reviewer          | Status                                      |
| ----------------- | ------------------------------------------- |
| Claude.ai (denne) | **APPROVED** med 1 MELLEM G-nummer-kandidat |
| Codex             | Afventer V2-review                          |

Plan er IKKE approval-klar før begge har approved.
