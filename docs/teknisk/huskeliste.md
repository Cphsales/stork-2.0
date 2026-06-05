<!-- governance-owns: eksterne-handlinger -->

# Stork 2.0 — Huskeliste (H-numre)

**Formål:** Hjem for **H-numre = eksterne handlinger / ventende beslutninger** — ting der skal gøres eller afgøres uden for koden (sårbarheds-håndtering, eksterne aktiveringer, deadlines, ventende Mathias-afgørelser).

**Konvention — H vs G (ét hjem pr. begreb):**

- **H = ekstern handling / ventende beslutning** → bor her (`huskeliste.md`).
- **G = kode-gæld** (vision-svækkelse i koden) → bor i `teknisk-gaeld.md`.

En H-reference andre steder i docs er en _mention_; den kanoniske definition bor som `### [Hxxx]`-entry her. `governance-check.mjs` håndhæver: hver H-ref peger på enten en åben entry herunder eller en kode i historisk-registret.

---

## Åbne H-handlinger

### [H001] Dependabot-sårbarheder håndteret

- **Handling:** 0 høj/kritisk-sårbarheder på default branch.
- **Status:** åben (cutover-blocker). Refereret fra `cutover-checklist.md`.

### [H002] GHAS-beslutning

- **Handling:** GitHub Advanced Security aktiveret ELLER eksplicit Mathias-godkendt undtagelse dokumenteret.
- **Status:** åben (cutover-blocker). Refereret fra `cutover-checklist.md`.

### [H003] CodeQL-beslutning

- **Handling:** CodeQL aktiveret ELLER eksplicit Mathias-godkendt undtagelse dokumenteret.
- **Status:** åben (cutover-blocker). Refereret fra `cutover-checklist.md`.

### [H006] Migration TODO-markører løst

- **Handling:** 0 TODO-markører i migration-filer før cutover.
- **Status:** åben (cutover-blocker). Refereret fra `cutover-checklist.md`.

### [H012] Hård deadline-tracker for G039

- **Handling:** Sporer den hårde deadline knyttet til G039 (se `teknisk-gaeld.md`). Lukkes når G039 er løst inden for deadline, eller eskaleres til Mathias hvis deadline nærmer sig.
- **Status:** åben.

### [H025] Sale-FK'er + orphan-oprydning ved Trin 14

- **Handling:** Når `core_money.sales` bygges (Trin 14): (1) tilføj FK `cancellations.source_sale_id`, `commission_snapshots.sale_id`, `salary_corrections.source_sale_id` → `sales.id` (med §3.9-preflight); (2) ryd de 290 orphan `commission_snapshots.sale_id`-værdier der ellers blokerer `ADD CONSTRAINT`; (3) fjern de 3 `FK_PENDING`-entries i `scripts/fitness.mjs`.
- **Status:** åben (Trin 14-blocker). Rejst af gov-3b-1 (#19 FK-dækning). #19's selv-udløb gør (3) mekanisk håndhævet — `fk-coverage` bliver rød hvis FK'erne mangler efter `sales` findes.

---

## Historiske H-koder (afsluttede — provenance, ikke åbne actions)

Maskin-læsbar source of truth (læses af `governance-check.mjs` til H-ref-integrity):

<!-- gov-historical-codes: H010, H011, H020, H022, H024 -->

Tabel for mennesker:

| Kode | Var                                                 | Hvor dokumenteret                           |
| ---- | --------------------------------------------------- | ------------------------------------------- |
| H010 | Arbejdsmetode + repo-struktur-etablering (pakke)    | git-history; `teknisk-gaeld.md` G-historik  |
| H011 | §1.7 permission-modsigelse (lukket v. rettelse 35)  | `stork-2-0-master-plan.md` Appendix C       |
| H020 | Automation flow-fejl (trigger ej på feature-branch) | `docs/coordination/arkiv/H020-flow-fejl.md` |
| H022 | Immutable-test tx-wrap (løst i H024)                | `teknisk-gaeld.md` G-historik               |
| H024 | Test-artefakt-cleanup (pakke)                       | git-history; `rapport-historik/`            |

Historiske koder er afsluttede pakke-/issue-identifikatorer (som `T9`, `trin-10`). De er IKKE åbne handlinger og får ikke `### [Hxxx]`-entries; de lever som provenance i de angivne hjem.
