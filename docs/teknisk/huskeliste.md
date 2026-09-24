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

- **Handling:** 0 TODO-markører i 1.0-migrations-skabelonerne før cutover: `scripts/migration/employees/1_discovery.sql` (4 i dag) og `2_extract.sql` (3 i dag). (`supabase/migrations/` har 0 — aflæst 2026-09-24.)
- **Status:** åben (cutover-blocker). Refereret fra `cutover-checklist.md`.
- **Løses-i:** 1.0-discovery / før cutover (kobler til G007; samme præcisering gælder cutover-checklist #11 og masterplanens cutover-blocker #11)

### [H012] Hård deadline-tracker for G039

- **Handling:** Sporer den hårde deadline knyttet til G039 (se `teknisk-gaeld.md`). Lukkes når G039 er løst inden for deadline, eller eskaleres til Mathias hvis deadline nærmer sig.
- **Status:** åben.
- **Løses-i:** følger G039 (REST-eksponeringstest)

### [H025] Sale-FK'er + orphan-oprydning ved Trin 14

- **Handling:** Når `core_money.sales` bygges (Trin 14): (1) tilføj FK `cancellations.source_sale_id`, `commission_snapshots.sale_id`, `salary_corrections.source_sale_id` → `sales.id` (med §3.9-preflight); (2) ryd de 290 orphan `commission_snapshots.sale_id`-værdier der ellers blokerer `ADD CONSTRAINT`; (3) fjern de 3 `FK_PENDING`-entries i `scripts/fitness.mjs`.
- **Status:** åben (Trin 14-blocker). Rejst af gov-3b-1 (#19 FK-dækning). #19's selv-udløb gør (3) mekanisk håndhævet — `fk-coverage` bliver rød hvis FK'erne mangler efter `sales` findes.
- **Løses-i:** Trin 14 (sales-stamme)

### [H030] Nedgradér stork-code-bot fra admin til write + aflæs branch-beskyttelsen

- **Handling:** (1) Sæt `stork-code-bot`s rolle på `Cphsales/stork-2.0` til `write` (i dag `admin` — aflæst 2026-09-24 med `gh api repos/Cphsales/stork-2.0/collaborators`). (2) Aflæs hele beskyttelsesreglen for `main` (`gh api repos/Cphsales/stork-2.0/branches/main/protection`: krævede godkendelser, code-owner-review, `enforce_admins`) og skriv den ind i `.github/BRANCH_PROTECTION.md`. (3) Ret linjen om botten i `CLAUDE.md`, når (1) er gjort.
- **Hvem:** et login med administrations-adgang (det fælles admin-login, jf. H026). Botten kan ikke selv: dens token får 403 på beskyttelses-API'et. Mathias rører ikke GitHub.
- **Hvorfor:** Så længe botten er admin, kan den muligvis gå uden om beskyttelsen; det afhænger af `enforce_admins`, som ikke kan aflæses (workflow-planen §2, accepterede risici).
- **Status:** åben.
- **Løses-i:** når et admin-login er til rådighed (ingen fast deadline; risikoen er accepteret indtil da)

### [H031] Codex-CLI-opdatering: tjek den native binær, ikke shim'en

- **Handling:** Ved opdatering af Codex-CLI'en (`npm`) verificeres versionen på den native binær under `node_modules/@openai/codex-linux-x64/vendor/…/bin/codex`. Shim-filen `bin/codex.js` er byte-identisk på tværs af versioner, så en pin eller et versionstjek på den fanger ikke en opdatering.
- **Status:** åben (gælder hver opdatering, så længe Codex er dommer).
- **Løses-i:** ved hver Codex-CLI-opdatering

### [H032] Codex-opsætning: identitet og git-tilladelser

- **Handling:** (1) Identitet tjekkes før skrivehandling: CLI = `stork-code-bot`, GitHub-integration = `copenhagensales`. (2) Git-tilladelsen `git branch` matcher også `git branch -D` og skal indsnævres. (3) Der findes ingen projekt-`AGENTS.md` eller `.codex/` i repoet (aflæst 2026-09-24); de oprettes kun hvis rollerne kræver det.
- **Status:** åben.
- **Løses-i:** før næste pakke der lader Codex skrive (testene i pakke 1, trin 3)

## Historiske H-koder (afsluttede — provenance, ikke åbne actions)

Liste over afsluttede koder:

<!-- gov-historical-codes: H010, H011, H020, H022, H024, H026, H027, H028, H029 -->

Tabel for mennesker:

| Kode | Var                                                                                                                                                                            | Hvor dokumenteret                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| H010 | Arbejdsmetode + repo-struktur-etablering (pakke)                                                                                                                               | git-history; `teknisk-gaeld.md` G-historik |
| H011 | §1.7 permission-modsigelse (lukket v. rettelse 35)                                                                                                                             | `stork-2-0-master-plan.md` Appendix C      |
| H020 | Automation flow-fejl (trigger ej på feature-branch)                                                                                                                            | git-historik                               |
| H022 | Immutable-test tx-wrap (løst i H024)                                                                                                                                           | `teknisk-gaeld.md` G-historik              |
| H026 | gov-4 approval-mekanik (løst: tre-konto-struktur — fælles login urørt/kun protection-API, mgrubak = code owner, stork-code-bot = committer; CODEOWNERS-fix; bevist på PR #110) | gov-4 slut-rapport                         |
| H024 | Test-artefakt-cleanup (pakke)                                                                                                                                                  | git-history; `rapport-historik/`           |
| H027 | Node 24-deadline: GitHub Actions bumpet til v6 (løst 2026-06-10, PR #114/#116)                                                                                                | git-historik (commit `b4c8c49`)            |
| H028 | Mekanisk G/H-opslag i recon (erstattet: planens G/H-disposition, tjekket i Codex' planlæsning, workflow-planen §2)                                                            | git-historik                               |
| H029 | Indre tekst-staleness-gennemgang af alle docs (udført 2026-09-24 som dokumentgennemgangen + oprydningen, workflow-planen §4)                                                | git-historik                               |

Historiske koder er afsluttede pakke-/issue-identifikatorer (som `T9`, `trin-10`). De er IKKE åbne handlinger og får ikke `### [Hxxx]`-entries; de lever som provenance i de angivne hjem.
