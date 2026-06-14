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
- **Løses-i:** før cutover (cutover-checklist)

### [H002] GHAS-beslutning

- **Handling:** GitHub Advanced Security aktiveret ELLER eksplicit Mathias-godkendt undtagelse dokumenteret.
- **Status:** åben (cutover-blocker). Refereret fra `cutover-checklist.md`.
- **Løses-i:** før cutover (Mathias-beslutning)

### [H003] CodeQL-beslutning

- **Handling:** CodeQL aktiveret ELLER eksplicit Mathias-godkendt undtagelse dokumenteret.
- **Status:** åben (cutover-blocker). Refereret fra `cutover-checklist.md`.
- **Løses-i:** før cutover (Mathias-beslutning)

### [H006] Migration TODO-markører løst

- **Handling:** 0 TODO-markører i migration-filer før cutover.
- **Status:** åben (cutover-blocker). Refereret fra `cutover-checklist.md`.
- **Løses-i:** 1.0-discovery / før cutover (kobler til G007)

### [H012] Hård deadline-tracker for G039

- **Handling:** Sporer den hårde deadline knyttet til G039 (se `teknisk-gaeld.md`). Lukkes når G039 er løst inden for deadline, eller eskaleres til Mathias hvis deadline nærmer sig.
- **Status:** åben.
- **Løses-i:** følger G039 (REST-eksponeringstest)

### [H025] Sale-FK'er + orphan-oprydning ved Trin 14

- **Handling:** Når `core_money.sales` bygges (Trin 14): (1) tilføj FK `cancellations.source_sale_id`, `commission_snapshots.sale_id`, `salary_corrections.source_sale_id` → `sales.id` (med §3.9-preflight); (2) ryd de 290 orphan `commission_snapshots.sale_id`-værdier der ellers blokerer `ADD CONSTRAINT`; (3) fjern de 3 `FK_PENDING`-entries i `scripts/fitness.mjs`.
- **Status:** åben (Trin 14-blocker). Rejst af gov-3b-1 (#19 FK-dækning). #19's selv-udløb gør (3) mekanisk håndhævet — `fk-coverage` bliver rød hvis FK'erne mangler efter `sales` findes.
- **Løses-i:** Trin 14 (sales-stamme)

### [H028] Mekanisk G/H-opslag i recon-doc'en (partnerskabs-runde-input)

- **Handling:** Recon-/data-grundlags-mekanismen skal udføre G/H-opslaget mekanisk (filtrér åbne G/H på Løses-i mod pakkens trin/scope og præsentér dem i plan-fasen). §3.2's manuelle G/H-opslags-pligt (indført 2026-06-10) er broen indtil da.
- **Status:** åben. Rejst af Mathias 2026-06-10 (restliste DEL 3-note).
- **Løses-i:** gov-5-automation / partnerskabs-runde (recon-doc)

### [H029] Indre tekst-staleness-gennemgang af alle docs

- **Handling:** Indholds-påstande (tal, status, beskrivelser) i alle docs gennemgås mod den endelige virkelighed. Delt efter bord: Claude.ai tager forretnings-docs, Code tekniske docs. Kun reelle fejl rettes — ingen omskrivninger. [G018] (bygge-status-klassifikations-tal) hører under denne paraply.
- **Status:** åben. **Bevidst udskudt til efter gov-5 (Mathias 2026-06-10):** sandheden skal være stabil før teksterne rettes mod den; gov-5 ændrer selv hvad der er sandt.
- **Løses-i:** dedikeret pakke LIGE EFTER gov-6 (Codes anbefaling ved oprettelsen: gov-6's arkiv-fold reducerer doc-fladen først, så gennemgangen rammer mindst mulig flade; gov-6 selv er strukturel, denne er indholds-revision med to aktører — blandes ikke)

## Historiske H-koder (afsluttede — provenance, ikke åbne actions)

Maskin-læsbar source of truth (læses af `governance-check.mjs` til H-ref-integrity):

<!-- gov-historical-codes: H010, H011, H020, H022, H024, H026, H027 -->

Tabel for mennesker:

| Kode | Var                                                                                                                                                                            | Hvor dokumenteret                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| H010 | Arbejdsmetode + repo-struktur-etablering (pakke)                                                                                                                               | git-history; `teknisk-gaeld.md` G-historik |
| H011 | §1.7 permission-modsigelse (lukket v. rettelse 35)                                                                                                                             | `stork-2-0-master-plan.md` Appendix C      |
| H020 | Automation flow-fejl (trigger ej på feature-branch)                                                                                                                            | git-historik                               |
| H022 | Immutable-test tx-wrap (løst i H024)                                                                                                                                           | `teknisk-gaeld.md` G-historik              |
| H026 | gov-4 approval-mekanik (løst: tre-konto-struktur — fælles login urørt/kun protection-API, mgrubak = code owner, stork-code-bot = committer; CODEOWNERS-fix; bevist på PR #110) | gov-4 slut-rapport                         |
| H024 | Test-artefakt-cleanup (pakke)                                                                                                                                                  | git-history; `rapport-historik/`           |

Historiske koder er afsluttede pakke-/issue-identifikatorer (som `T9`, `trin-10`). De er IKKE åbne handlinger og får ikke `### [Hxxx]`-entries; de lever som provenance i de angivne hjem.
