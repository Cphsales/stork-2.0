# gov-2-vagt — Plan V1

**Branch:** claude/gov-2-vagt-plan
**Krav-dok:** governance-vagt (ét dok over 6 pakker — Claude.ai's bord; denne pakke = leverance "mekanisk governance-spærhage + Codex-mandat + H-hjem")
**Forfatter:** Code · **Dato:** 2026-06-04 · **Type:** repo-side scanner + docs (0 migrations)

## Formål (låst)

Byg det mekaniske lag-1 der fanger governance-drift automatisk, så V5-disciplinen ikke kun hviler på selv-tjek + manuel opmærksomhed. Scope B (Mathias): letvægts-`owns:`-register så "samme begreb defineret to steder" fanges mekanisk — root-cause-klassen der startede V5.

## §3.2 / §3.1 / §3.3 anvendelighed

- **DB-state-dump (§3.2):** ikke relevant (ingen DB-objekter).
- **Patch-først (§3.1):** gælder for redigering af eksisterende docs (owns:-markører på ~9 docs, H-ref-migration, cutover-dup-resolution) — build viser nuværende body + diff pr. fil. `fitness.mjs` udvides IKKE (governance er eget begreb → nyt script).
- **End-to-end-spor (§3.3):** ikke relevant (ingen write-vej). Erstattes af negativ-tests (§ End-to-end-test).

---

## Recon-grundlag (verificeret)

- Doc-graf scanner validerer: 14 aktive .md + 6 LÆSEFØLGE-stier + 2 pointer-filer (lille, lav-FP).
- `fitness.mjs` (19 checks) + `ci.yml`-step-mønster er skabelonen; ingen governance-scanner findes.
- **H-numre er to klasser** (se §C) — ikke 10 ensartede ventende-handlinger.
- **Cutover-blockers duplikeret** i `cutover-checklist.md` + `master-plan.md` (H001-003/006) — reel defined-twice.

---

## Leverance A — Mekanisk scanner (`scripts/governance-check.mjs` + `pnpm governance:check` + ci.yml-step)

Nyt script (ikke fitness-udvidelse — ét hjem pr. begreb). Check-klasser (alle deterministiske, lav-FP):

| Check                  | Hvad                                                                 | Ville have fanget                                         |
| ---------------------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| dead-doc-paths         | hver \`docs/…\`-reference i aktive .md stat'es; manglende mål = fejl | brudt seneste-rapport-pointer; stale codex-notify §8-refs |
| junk-files             | `~$*` / Office-lock-filer i docs/                                    | V4-junk                                                   |
| laesefoelge-targets    | de 6 LÆSEFØLGE-stier eksisterer                                      | brudt nav                                                 |
| pointer-validity       | `aktiv-plan`/`seneste-rapport`-mål eksisterer                        | gov-1's brudte pointer                                    |
| owns-uniqueness        | hvert begreb i præcis ÉN docs `owns:`-liste (se §B-register)         | rolle defineret i vision+disciplin                        |
| number-home-uniqueness | hvert G-/H-nummer har kanonisk entry i præcis ét hjem                | cutover-blocker-dup                                       |
| H-ref-integrity        | hver H-ref peger på eksisterende entry i `huskeliste.md`             | forældreløse H-refs                                       |

**Ærlig grænse:** owns-uniqueness fanger _deklareret_ dobbelt-ejerskab (to docs claimer samme begreb). _Udeklareret_ prosa-overlap (en doc redefinerer i prosa et begreb en anden ejer, uden owns:-claim) fanges IKKE mekanisk → det er Codex-mandatets bord (B). Number-home-uniqueness fanger til gengæld nummer-dubletter mekanisk (derfor cutover-dup'en fanges).

## Leverance B — owns:-register + Codex-mandat

**owns:-markør:** HTML-kommentar nær top af hver governance-doc (usynlig ved render, parsebar):
`<!-- governance-owns: begreb-a, begreb-b -->`

**Initial begreb→hjem-mapping** (seedet fra V5-konsolideringen):

| Doc                       | owns                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------- |
| vision-og-principper.md   | vision, principper                                                                 |
| disciplin.md              | aktører-roller, workflow, gates, severities, vagter, skabeloner, bevarings-politik |
| forretningsforstaaelse.md | forretnings-intention                                                              |
| stork-2-0-master-plan.md  | teknisk-plan, byggerækkefølge, låste-beslutninger, åbne-beslutninger               |
| teknisk-gaeld.md          | kode-gæld                                                                          |
| huskeliste.md (ny)        | eksterne-handlinger                                                                |
| permission-matrix.md      | rpc-side-mapping                                                                   |
| cutover-checklist.md      | cutover-blockers                                                                   |
| LÆSEFØLGE.md              | læseflade-nav                                                                      |

Scanner fejler hvis et begreb optræder i ≥2 owns:-lister.

**Codex-mandat** (tilføjelse til `disciplin.md` §9.3 + §8-modsigelses-disciplin): ved ændring til en governance-doc (vision/disciplin/master-plan/owns:-register) SKAL Codex eksplicit svare "modsiger dette en anden docs ejede begreb (prosa-niveau)?" før merge. Det dækker den semantiske klasse scanneren ikke kan. Governance-ændringer er review-artefakter (V5 §4).

## Leverance C — H-numrenes hjem (`docs/teknisk/huskeliste.md`) + klassificering

**Ny `docs/teknisk/huskeliste.md`** (parallel til teknisk-gaeld.md). Konvention: **H = ekstern handling / ventende beslutning** (uden for koden — Dependabot, deadlines, eksterne afgørelser); **G = kode-gæld**.

**Klassificering af de 10 (recon-bekræftet):**

| H                            | Klasse                                      | Handling                                                                                                                                                      |
| ---------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H001, H002, H003, H006       | åben ekstern-handling (cutover-blockers)    | kanonisk entry → huskeliste.md; cutover-checklist + master-plan beholder _reference_ (dup-resolution)                                                         |
| H012                         | åben deadline-tracker (→ G039)              | kanonisk entry → huskeliste.md                                                                                                                                |
| H010, H011, H020, H022, H024 | **historisk** pakke-/issue-kode (afsluttet) | IKKE huskeliste-items; dokumentér i konvention at historiske H-koder lever i rapport-historik/git-history (som T9/trin-10-koder). Referencer beholdes uændret |

**Cutover-blocker-dup-resolution:** H001-003/006 har i dag kanonisk indhold i BÅDE cutover-checklist.md OG master-plan §Cutover-blockers. Build vælger huskeliste.md som kanonisk hjem; de to andre beholder reference. number-home-uniqueness-checken (A) håndhæver det fremover.

⚠️ **Afviger fra pakke-åbningens premiss** ("migrér de 10 H-refs"): kun ~5 er migrerbare åbne handlinger; 5 er historiske koder der ikke hører i en ventende-liste. Flaget til din + Codex' bekræftelse.

---

## Implementations-rækkefølge

1. `huskeliste.md` oprettes + konvention (H vs G) + 5 åbne H-entries migreret; cutover-dup → reference.
2. owns:-markører tilføjes til de 9 docs (patch-først: additiv kommentar-linje pr. doc).
3. `governance-check.mjs` skrives (7 check-klasser) + `package.json` `governance:check` + `ci.yml`-step (efter `fitness`).
4. Kør scanner mod nuværende repo → grøn (efter at trin 1-2 har ryddet kendte dubletter: cutover-dup + evt. eksisterende defined-twice).
5. Codex-mandat + governance-ændring-som-review-artefakt → `disciplin.md`.

## End-to-end-test-design (§3.6 — leverings-kriterium)

Negativ-tests (scanner-ækvivalent til smoke-test): plant syntetisk overtrædelse → scanner exit≠0:

- planted dead doc-path → fejl
- to docs med samme begreb i owns: → fejl
- H-ref uden huskeliste-entry → fejl
- planted `~$junk.md` → fejl
  Plus positiv: ren repo → exit 0. Tests i `scripts/__tests__/` eller som selvtest-flag.

## Oprydnings-strategi

`aktiv-plan.md` opdateres · disciplin.md (Codex-mandat) · ny huskeliste.md + cutover-checklist/master-plan dup-resolution · ingen vision/forretningsforstaaelse-ændring (kun owns:-markør).

## Risici + åbne spørgsmål til Codex

1. **owns:-register-grænsen:** er deklareret-ejerskabs-unikhed + number-home-unikhed tilstrækkelig mekanisk dækning, eller forventer I en heuristik for udeklareret prosa-overlap (med accepteret FP-risiko)? Min vurdering: hold mekanisk = deklareret; prosa → Codex-mandat.
2. **H-klassificering:** enig i at H010/011/020/022/024 er historiske koder (ikke huskeliste-items), eller skal nogen af dem være åbne H-entries?
3. **owns:-markør-format:** HTML-kommentar vs YAML-frontmatter — er der en doc hvor frontmatter brækker render/CODEOWNERS? (vision er LÅST m. CODEOWNERS — owns:-markør er en ændring til den; kræver Mathias-approve jf. CODEOWNERS.)
4. **ci.yml-step nu, required senere:** scanner-step tilføjes men er ikke required før gov-4 (branch protection). Korrekt rækkefølge?
5. **Begreb-vokabular:** er den initiale 9-doc-mapping for grov/fin? Risiko for at et ægte delt begreb (fx "permission-model" i master-plan §1.7 + permission-matrix) tvinger en kunstig opsplitning.
