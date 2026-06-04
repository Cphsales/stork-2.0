# gov-2-vagt — Plan V2

**Branch:** claude/gov-2-vagt-plan
**Krav-dok:** governance-vagt (ét dok over 6 pakker — Claude.ai's bord; denne pakke = "mekanisk governance-spærhage + Codex-mandat + H-hjem")
**Forfatter:** Code · **Dato:** 2026-06-05 · **Type:** repo-side scanner + docs (0 migrations)

## V2 — håndtering af Codex-fund (Step 2.1)

| Fund                                                     | Severity | Svar       | Hvordan adresseret                                                                                                                                                                                                        |
| -------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #1 H-ref-integrity selvmodsigende (åbne vs historiske H) | KRITISK  | **ACCEPT** | §C: huskeliste.md får TO sektioner (åbne H-entries + historisk-H-registry); H-ref-integrity accepterer begge; **number-home tæller kun kanoniske `### [Hxxx]`-entries, ikke mentions**; suffix `H010.6` → forælder `H010` |
| #2 dead-doc-paths for bredt (FP mod ren repo)            | KRITISK  | **ACCEPT** | §A: eksplicit fil-scope + path-klasser (template-skip via `<>`, allowlist for historisk/future m. grund). Triageret konkret mod nuværende repo → grøn                                                                     |
| #3 cutover-checklist vs huskeliste ejer-kant             | MELLEM   | **ACCEPT** | §B: cutover-checklist ejer **cutover-flade** (processen); huskeliste ejer **eksterne-handlinger** (H-actions). H001-006 = H-actions kanonisk i huskeliste; cutover-checklist _refererer_ dem. Distinkte begreber          |

Codex Q-svar indarbejdet: owner = **definitionshjem, ikke mention-hjem** (gennemgående princip) · HTML-kommentar-markør (vision-ændring kræver CODEOWNERS-approval) · ci-step før remote/Supabase-afhængige checks (Q4) · alias/nabo-begreber håndteret (permission-model vs rpc-side-mapping, §B).

## Formål (låst)

Mekanisk lag-1 der fanger governance-drift automatisk. Scope B: letvægts-`owns:`-register så "begreb defineret to steder" fanges mekanisk.

## §3.2/§3.1/§3.3

DB-dump ikke relevant. Patch-først for doc-redigering (owns:-markører, H-migration, cutover-dup-resolution). End-to-end → negativ-tests.

---

## §A Mekanisk scanner (`scripts/governance-check.mjs`)

**Fil-scope (eksplicit):** `docs/**/*.md` MINUS `docs/coordination/arkiv/**`, `docs/coordination/v4-slettede-docs/**`, `docs/coordination/rapport-historik/**`. Plus `.github/workflows/*.yml` for §-ref-checks (codex-notify).

**Gennemgående princip (Codex Q5):** _owner = definitionshjem, ikke mention-hjem._ Et begreb/nummer "bor" hvor det DEFINERES (owns:-claim; `### [Xxxx]`-entry), ikke hvor det blot nævnes.

| Check                  | Regel                                                                                  | Path-/scope-håndtering         |
| ---------------------- | -------------------------------------------------------------------------------------- | ------------------------------ |
| dead-doc-paths         | `docs/…`-ref skal eksistere                                                            | **path-klasser** nedenfor      |
| junk-files             | intet `~$*`/Office-lock i docs/                                                        | —                              |
| laesefoelge-targets    | de 6 LÆSEFØLGE-stier findes                                                            | —                              |
| pointer-validity       | aktiv-plan/seneste-rapport-mål findes                                                  | —                              |
| owns-uniqueness        | hvert begreb i præcis ÉN `owns:`-liste                                                 | deklareret-ejerskab            |
| number-home-uniqueness | hvert G-/H-nummer har kanonisk `### [Xxxx]`-entry i præcis ét hjem                     | **kun entries, ikke mentions** |
| H-ref-integrity        | hver `Hxxx`(-suffix)-ref er enten åben-entry i huskeliste ELLER i historisk-H-registry | suffix → forælder              |

### dead-doc-paths — path-klasser (fund #2)

1. **Template** — ref indeholder `<` `>` (fx `<pakke>`, `<dato>`) → **skip**. (4 nuværende: `<pakke>-{krav,plan,status}`, `<dato>-<pakke>`)
2. **Inde i fenced code / §10-skabeloner** → skip (skabelon-eksempler, ikke links).
3. **Current-link** → SKAL eksistere; ellers fejl.
4. **Future/historisk** → kræver allowlist-entry `GOV_MISSING_PATH_ALLOWLIST` med grund (mønster fra fitness' `FK_COVERAGE_EXEMPTIONS`).

**Triageret allowlist (nuværende repo → grøn):**

- `docs/teknisk/huskeliste.md` — future-this-package (findes efter gov-2 trin 1; fjernes fra allowlist ved build-slut).
- `docs/gdpr-compliance.md` — future-required (ej bygget endnu).
- `docs/coordination/overvaagning/codex-overvaagning.md`, `docs/strategi/arbejds-disciplin.md`, `docs/strategi/bygge-status.md`, `docs/skabeloner/plan-skabelon.md` — historisk provenance (V4-slettede docs refereret i teknisk-gaeld G-entries). Grund pr. entry.

Build verificerer: efter trin 1-2 kører scanneren grøn mod repo (template-skip + allowlist + reelle fixes).

---

## §B owns:-register + Codex-mandat

**Markør:** `<!-- governance-owns: begreb-a, begreb-b -->` (HTML-kommentar, top af doc).

**Begreb→hjem (definitionshjem; revideret for alias/nabo + cutover-kant):**

| Doc                       | owns                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| vision-og-principper.md   | vision, principper                                                                                |
| disciplin.md              | aktører-roller, workflow, gates, severities, vagter, skabeloner, bevarings-politik                |
| forretningsforstaaelse.md | forretnings-intention                                                                             |
| stork-2-0-master-plan.md  | teknisk-plan, byggerækkefølge, låste-beslutninger, åbne-beslutninger, **permission-model**        |
| permission-matrix.md      | **rpc-side-mapping** (nabo til permission-model, distinkt begreb — mapping, ikke model)           |
| teknisk-gaeld.md          | kode-gæld                                                                                         |
| huskeliste.md (ny)        | eksterne-handlinger                                                                               |
| cutover-checklist.md      | **cutover-flade** (processen/checklisten — ikke "cutover-blockers"; H-actions ejes af huskeliste) |
| LÆSEFØLGE.md              | læseflade-nav                                                                                     |

owns-uniqueness fejler hvis et begreb optræder i ≥2 lister. permission-model (master-plan) og rpc-side-mapping (permission-matrix) er **distinkte** begreber — ingen konflikt.

**Codex-mandat** (disciplin.md §9.3 + §8): ved ændring til governance-doc SKAL Codex svare "modsiger dette prosa-mæssigt en anden docs ejede begreb?" før merge. Dækker udeklareret prosa-overlap (ikke mekanisk fangbart). Governance-ændringer = review-artefakter.

---

## §C huskeliste.md — to-sektions-struktur + klassificering (fund #1)

Konvention: **H = ekstern handling/ventende beslutning** (uden for koden); **G = kode-gæld** (teknisk-gaeld.md).

```
## Åbne H-handlinger        ← kanoniske entries, format: ### [Hxxx] <titel>
### [H001] Dependabot-sårbarheder håndteret
### [H002] GHAS-beslutning
### [H003] CodeQL-beslutning
### [H006] Migration TODO-markører løst
### [H012] <deadline-tracker → G039>

## Historiske H-koder (afsluttede — provenance, ikke åbne actions)
| Kode | Var | Hvor dokumenteret |
| H010 | arbejdsmetode/repo-struktur-pakke | rapport-historik/git-history |
| H011 | §1.7-modsigelse (lukket v. rettelse 35) | master-plan Appendix C |
| H020 | automation flow-fejl | arkiv/H020-flow-fejl.md |
| H022 | immutable-test-tx-wrap (løst i H024) | teknisk-gaeld G-historik |
| H024 | test-artefakt-cleanup-pakke | rapport-historik/git-history |
```

**Scanner-semantik (fund #1):**

- **number-home-uniqueness:** tæller kun `### [Hxxx]`-kanoniske entries → H001/002/003/006/012 hver præcis én gang (huskeliste). Historisk-registry-rækker er IKKE `### [Hxxx]`-entries → ingen konflikt. Mentions/referencer tælles ikke.
- **H-ref-integrity:** en `Hxxx`-ref (inkl. suffix `H010.6` → forælder `H010`) er gyldig hvis den er ENTEN en åben-entry ELLER i historisk-registry. Ukendt `Hxxx` (ingen af delene) = fejl (forældreløs).
- Cutover-blocker-dup (H001-006 kanonisk i både cutover-checklist OG master-plan i dag) → build flytter kanonisk indhold til huskeliste; cutover-checklist + master-plan beholder reference. number-home-uniqueness håndhæver fremover.

⚠️ **Premiss-afvigelse (bekræftet af Codex):** kun 5/10 H er åbne actions; 5 er historiske koder. Håndteres via to-sektions-struktur.

---

## Implementations-rækkefølge

1. `huskeliste.md` (to sektioner: 5 åbne entries migreret fra cutover-checklist/master-plan + historisk-registry for de 5) + H/G-konvention. Cutover-dup → reference.
2. owns:-markører på 9 docs (patch-først; vision kræver CODEOWNERS-approval).
3. `governance-check.mjs` (7 checks, path-klasser, allowlist) + `package.json` `governance:check` + `ci.yml`-step **før** Supabase-link-step (Q4).
4. Triage + ryd: kør scanner → grøn (template-skip + allowlist + reelle fixes af evt. ægte dead-refs).
5. Codex-mandat + governance-som-review-artefakt → disciplin.md.

## End-to-end-test (§3.6 — negativ-tests)

Plant syntetisk overtrædelse → exit≠0: dead current-link · to docs samme owns:-begreb · `Hxxx` uden entry/registry · `~$junk.md` · samme G-nummer-entry i to docs. Positiv: ren repo → exit 0. I `scripts/__tests__/` eller selvtest-flag.

## Oprydnings-strategi

aktiv-plan · disciplin.md (Codex-mandat) · ny huskeliste.md · cutover-checklist + master-plan dup→reference · owns:-markører (9 docs).

## Risici + åbne spørgsmål til Codex (runde 2)

1. §C historisk-H-registry: er tabel-rækker den rette "ikke-kanonisk"-form, eller foretrækker I en eksplicit `<!-- gov-historical-codes: H010,H011,... -->`-markør scanneren læser (mindre prosa-afhængig parsing)?
2. §A allowlist for historisk provenance (4 V4-slettede-doc-refs): acceptabelt, eller skal de refs i teknisk-gaeld i stedet omskrives til ikke-link-form (så de ikke kræver allowlist)?
3. §A: skal scanneren også dække `scripts/*.sh`-doc-refs (de havde stale refs i tidligere audit), eller er det uden for gov-2-scope?
