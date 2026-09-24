# Øvrige rettelser: de færdige tekster (til workflow-planen (v41) §4.3/§4.4)

2026-09-24 · grundlag: repo-øjebliksbillede `claude/workflow-implementeringsplan` @ `87a877b` (snap/) + git read-only i `/home/mathias/stork-implplan` + `gh` (kun læsning) · intet i repoet er ændret · indarbejdet: ændringslisten `aendringer-41.md` S4, S5, S9, S13 (pakke 1), S14, S15 og H5 (dit ord 24/9 »jeg går med dine anbefalinger«) — de står samlet i §8.
Dækker alt der **opdateres** efter planen. **Ikke** med her: `disciplin.md` (`tekster/disciplin-ny.md`), masterplanen (`tekster/masterplan-rettelser.md`), rolleteksterne (`tekster/skill-og-roller.md`) og de nye linje-5-tekster i visionen og forretningsforståelsen (`tekster/stammedok-hoveder.md`).

**Sådan læses filen.** Hver rettelse har: fil · sted (afsnit/linje @ 87a877b) · NUVÆRENDE (ordret) · NY (ordret) · bevis. Flyttes en hel post, står overskriften ordret sammen med linjeintervallet i stedet for hele posten. `<…>` er en værdi der først findes, når ændringen laves (dato, blob-OID, linjenummer). Den skal udfyldes dér og ikke gættes nu.

**Hvornår hver rettelse lægges ind** (planens §4.1):

| Rettelse | Hvornår | Hvorfor netop da |
|---|---|---|
| §1 forretningsforståelsen, §2 teknisk gæld, §3 huskeliste, §5.6 ledgerens hoved og statusblok, §6 flytninger | 4.1 trin 1 | viden flyttes før noget fjernes |
| §5.7 ordbogens hoved | 4.1 trin 2, i samme ændring som plan v3.8 | ordbogen er bundet af planen (`gates.mjs:86`, plan.md:1042 `ordbog bcab6b4e`); v3.8 binder den nye blob |
| §5.8 `plan-approval.json` / `krav-approval.json` fjernes · `launch.json` rettes | 4.1 trin 3 | den gamle port binder dem, til trin 3 fjerner den (S5) |
| §8.5 pakke 1's byte-identiske `krav-udkast.md` fjernes | 4.1 trin 3 | omlægningen; kravet findes allerede i `docs/sandhed/krav/` |
| §8.6 ledgeren og ordbogen flyttes til `docs/sandhed/` (+ LG-1/OB-1-stierne, masterplan A1) | 4.1 trin 3, i samme ændring som den gamle plan-port fjernes | den gamle port læser ordbogen i `plan-build/<pakke>/ordbog.md` (`gate-eval.mjs:30`) |
| §8.7 P-8 omskrives; kildekontrakt og kildefiler fjernes | 4.1 trin 2 (P-8 i plan v3.8) · filerne i 4.1 trin 3 | planen er bundet til P-8 (`plan.md:1` `p8_oid 4af07ef4`) |
| §8.4 `v5.yml`, `pr-drift-warning.yml` | 4.1 trin 4-5, i samme ændring som de filer selvtestene dækker | ellers bliver `v5.yml` rød |
| §2 G063-lukningen · §3 markører og l.12 | i samme ændring som governance-tjekket fjernes (4.1 trin 5) | før da er markørerne i brug |
| §4 `CLAUDE.md` l.8 | i samme ændring som `docs/foraeldet-workflow/` fjernes | |
| §5.5 `CODEOWNERS` | 4.1 trin 6, efter trin 5 har fjernet `docs/coordination/…krav-og-data.md` | ellers får filen ejer lige før den fjernes |
| resten af §4-§5 | 4.1 trin 6 | |

---

## 1. `docs/strategi/forretningsforstaaelse.md` (dit dokument, du godkender teksten)

### 1.1 Lag E-noterne: flyttes ikke (disposition)

**Disposition:** Ingen sætninger fra Lag E-noterne flyttes ind i forretningsforståelsen. De to noter (`docs/teknisk/lag-e-beregningsmotor-krav.md` og `docs/teknisk/lag-e-tidsregistrering-krav.md`) **bliver liggende, hvor de er**. De fjernes ikke i denne omgang.

**Grund:** Forfatterreglen (`disciplin.md:263`) lader kun dit eget eller dit forhåndsgodkendte indhold komme ind i forretningsforståelsen. At noternes sætninger er dine, kan ikke dokumenteres:
- `f40453b` (14/5, »flyttet fra docs/lag-e/ til docs/«) er lagt ind under din konto, men commit-beskeden har `Co-Authored-By: Claude Opus 4.7 (1M context)` (`git show -s f40453b`).
- `1a88d7f` (22/5, »konsolidér tanke-data — lag-e-beregning + lag-e-tid → forretningsforstaaelse«) har samme medforfatter-linje (`git show -s 1a88d7f`).
- `git blame` viser desuden tre linjer, der senere er rettet af AI-kørsler: beregningsmotor l.42 (`a26abe4`) og tidsregistrering l.91 + l.97 (`9ebe006`).

Medforfatter-linjen beviser ikke, at sætningerne er AI's. Men den underbygger heller ikke, at de er dine. Derfor står der her ingen indsættelser (tidligere FF-1…FF-4 er taget ud), og der ændres intet i forretningsforståelsens indhold. Vil du have noget af noterne ind, formulerer du det selv (eller claude-ai-rollen efter din forhåndsgodkendelse, forfatterreglen).

### 1.4 Hovedet (l.3 og l.5): Code skriver ingen tekst

- **l.5** rettes efter `tekster/stammedok-hoveder.md` §2. Den tekst er formuleret af claude-ai-rollen efter forfatterreglen (`disciplin.md:263`); dit `ok` til planen er forhåndsgodkendelsen, og Code indsætter den ordret. Code formulerer intet her. (Baggrund: sidste sætning »Mekanisk håndhævelse (required code-owner-review) er aktiv på main (gov-4).« kan ikke bekræftes — botten får 403 på beskyttelses-API'et, aflæst 2026-09-24, og PR #110 (selve gov-4) blev merget af `mgrubak` uden review, `gh pr view 110`.) **Hvornår:** 4.1 trin 1.
- **l.3** `<!-- governance-owns: forretnings-intention -->`: markøren bliver død, når governance-tjekket fjernes (planens §4.5). Forslaget er kun at slette linjen, uden ny tekst. Det sker i samme ændring som fjernelsen af tjekket og kun med dit ok.

---

## 2. `docs/teknisk/teknisk-gaeld.md`

### 2.1 Hovedet

**TG-1 · l.3**
NUVÆRENDE: `<!-- governance-owns: kode-gaeld -->`
NY: *(linjen slettes, i samme ændring som governance-tjekket fjernes)*
Bevis: kun `scripts/governance-check.mjs:192-196` læser markøren (A2), og planens §4.5 fjerner tjekket.

**TG-2 · l.13**
NUVÆRENDE:
```
**Sidste opdatering:** 10. juni 2026 (revision + DEL 5: G066 rejst m. advisor-baseline-check leveret; G001/G039/G040 Løses-i præciseret)
```
NY:
```
**Sidste opdatering:** <dato> (oprydningen efter workflow-planen: G018/G029/G036/G037/G038/G041/G046/G058 lukket, G063 lukket med governance-tjekket, G006 afgrænset, døde henvisninger rettet, G067-G082 rejst)
```

### 2.2 Poster der lukkes (flyttes fra »Åben gæld« til »Løst gæld (arkiv)«, øverst i arkivet)

Hver post fjernes fra »Åben gæld« og står herefter i arkivet med denne tekst:

**TG-3 · G029** · NUVÆRENDE: l.137-148, `### [G029] MELLEM — C001-backfill bruger legal retention mod master-plan-reservation`
NY:
```
### [G029] LØST 2026-05-15 — C001-backfill bruger legal retention mod master-plan-reservation

- **Beskrivelse:** C001-fix (`71ab37f`) klassificerede løn-tabeller m.fl. som `retention_type='legal'` (2555 dage); `legal` skulle fjernes pr. rettelse 24.
- **Løst:** `20260514180500_d1_d2_drop_legal_convert_rows.sql` fjerner `legal` fra retention_type-CHECK og konverterer de 71 legal-rækker: `audit_log.*` → `permanent`, alle øvrige (bl.a. pay_periods, commission_snapshots, salary_corrections, cancellations, break_glass_requests) → NULL (ikke valgt). Løsningen blev NULL, ikke `time_based` (rettelse 24/25).
- **Konstateret lukket:** 2026-09-24 (dokumentgennemgangen).
```
Bevis: migrationen l.1-18, 34-43.

**TG-4 · G036** · NUVÆRENDE: l.277-285, `### [G036] MELLEM — R7a+R7d cron-reschedule race-window`
NY:
```
### [G036] LØST 2026-05-15 — R7a+R7d cron-reschedule race-window

- **Beskrivelse:** R7a og R7d ændrede begge `retention_cleanup_daily`s cron-body; cron kunne fyre mellem de to migrationer.
- **Løst:** Option A — R7a kombinerer begge cron-body-rettelser i én unschedule + schedule; R7d rører ikke cron'en (`20260515130000_r7a_regprocedure_callable_fix.sql` l.19-21, 304; `20260515130300_r7d_is_active_status_alignment.sql` l.24-25).
- **Konstateret lukket:** 2026-09-24.
```

**TG-5 · G037** · NUVÆRENDE: l.287-302, `### [G037] MELLEM — R7d backfill mangler session-vars for audit-spor`
NY:
```
### [G037] LØST 2026-05-15 — R7d backfill mangler session-vars for audit-spor

- **Beskrivelse:** R7d-backfillen manglede session-var-mønstret (source_type, allow_*_write, change_reason).
- **Løst:** `20260515130300_r7d_is_active_status_alignment.sql` l.9 og l.27-31 sætter `stork.source_type`, begge `stork.allow_*_write` og `stork.change_reason` før UPDATE.
- **Konstateret lukket:** 2026-09-24.
```

**TG-6 · G038** · NUVÆRENDE: l.304-319, `### [G038] LAV — cron.unschedule via navn-lookup vs jobid-lookup`
NY:
```
### [G038] LØST 2026-05-15 — cron.unschedule via navn-lookup vs jobid-lookup

- **Beskrivelse:** `cron.unschedule('retention_cleanup_daily')` var navne-baseret.
- **Løst:** `20260515130000_r7a_regprocedure_callable_fix.sql` l.23 og l.306-312: jobid slås op i `cron.job`; unschedule kun hvis jobbet findes.
- **Konstateret lukket:** 2026-09-24.
```

**TG-7 · G041** · NUVÆRENDE: l.356-372, `### [G041] LAV — Retention cron e2e-test bør eksekvere faktisk scheduled command`
NY:
```
### [G041] LØST 2026-05-15 — Retention cron e2e-test bør eksekvere faktisk scheduled command

- **Beskrivelse:** e2e-testen kørte kopieret helper-logik, ikke selve `cron.job.command`.
- **Løst:** `supabase/tests/smoke/r7a_retention_cleanup_cron_e2e.sql` l.3-4 og l.56-61 henter `command` fra `cron.job` og eksekverer den (commit `04482b9`).
- **Konstateret lukket:** 2026-09-24.
```

**TG-8 · G058** · NUVÆRENDE: l.48-56, `### [G058] MELLEM — FK-coverage-fitness-check ikke implementeret per master-plan §3 punkt 19`
NY:
```
### [G058] LØST 2026-06-05 — FK-coverage-fitness-check ikke implementeret per master-plan §3 punkt 19

- **Beskrivelse:** Master-plan §3 punkt 19 krævede et fitness-tjek for `_id`-kolonner uden FK.
- **Løst:** gov-3b-1 (commit `58f36d4`, PR #96): `fkCoverage()` i `scripts/fitness.mjs` (l.1443) med `FK_COVERAGE_EXEMPTIONS` (l.1368) og `FK_PENDING` (l.1380); står i checks-listen (l.1832) og er fail-closed i CI.
- **Konstateret lukket:** 2026-09-24.
```

**TG-9 · G046 (overhalet)** · NUVÆRENDE: l.374-382, `### [G046] MELLEM — Fitness-check fanger ikke manglende table grants ved policy-tilføjelse`
NY:
```
### [G046] LUKKET (overhalet) 2026-06-07 — Fitness-check fanger ikke manglende table grants ved policy-tilføjelse

- **Beskrivelse:** Policies på write-tabeller blev tilføjet uden matchende GRANT; fitness så det ikke.
- **Hvorfor lukket:** Præmissen er væk. gov-3b-3b (G065, PR #105) fjernede alle direkte write-grants til `authenticated` på core_* (`20260607110004_core_identity_revoke_authenticated_core_writes.sql` l.11); skrivning går udelukkende via SECURITY DEFINER-RPC'er. `app-write-revoke-discipline` (`scripts/fitness.mjs` l.1728, effektiv privilegie-test, fail-closed i CI) forbyder direkte app-write-grants. Et manglende grant kan derfor ikke længere være fejlen.
- **Konstateret lukket:** 2026-09-24 (workflow-planen §4.3). G/H-dispositionen for pakke 1 (24/9) sagde »tages med«; det er afløst af denne lukning.
```

**TG-10 · G018 (overhalet)** · NUVÆRENDE: l.200-208, `### [G018] LAV — Bygge-status klassifikations-tal er forkerte`
NY:
```
### [G018] LUKKET (overhalet) 2026-05-22 — Bygge-status klassifikations-tal er forkerte

- **Beskrivelse:** `docs/strategi/bygge-status.md` havde forkerte tal for klassificerede kolonner efter trin 1-3.
- **Hvorfor lukket:** Filen blev slettet 22/5 (`c1c1b1b`, »koble bygge-status ind i master-plan §4.1 + §4.2«). Lærdommen står fortsat: brug `SELECT count(*)` mod databasen, ikke migration-gate-output. Masterplanens eget punkt om klassifikations-tal (§4.2) hører til masterplan-rettelserne.
- **Konstateret lukket:** 2026-09-24.
```

**TG-11 · G063 (lukkes i samme ændring som governance-tjekket fjernes, 4.1 trin 5)** · NUVÆRENDE: l.30-37, `### [G063] LAV — midlertidig governance-check-allowlist for v4-slettede-docs`
NY:
```
### [G063] LUKKET <dato> — midlertidig governance-check-allowlist for v4-slettede-docs

- **Beskrivelse:** `scripts/governance-check.mjs` havde en allowlist-post for `docs/coordination/v4-slettede-docs`, som skulle fjernes i gov-6.
- **Hvorfor lukket:** gov-6 blev opgivet, og `governance-check.mjs` er fjernet (workflow-planen §4.5), så allowlisten findes ikke længere. `.gitignore`-linjerne for `docs/coordination/v4-slettede-docs` fjernes i samme ændring.
```
Bevis: allowlisten `governance-check.mjs:29, 94`; `.gitignore:50-51` (B §2.1).

### 2.3 Poster der rettes (bliver åbne)

**TG-12 · G006, hele posten l.107-115 erstattes (afgrænset til resten)**
NUVÆRENDE (overskrift + l.109, 111, 112, 114, 115):
```
### [G006] MELLEM — `db-rls-policies` fitness-check er "soft" (warning only)
- **Beskrivelse:** Tabeller med ENABLE RLS + 0 policies (default-deny) skal have `-- skip-force-rls:` eller `-- default-deny:`-markør. Check skippes hvis fitness ikke kan kontakte Supabase Management API. Violations er markeret som warnings (soft), ikke errors.
- **Introduceret:** Trin 1 (`scripts/fitness.mjs:397-458`)
- **Skal løses:** Når Supabase-token er pålideligt sat i CI
- **Plan:** Flip soft → hard når CI-token er stabil
- **Løses-i:** CI-hardening (når Supabase-token er pålideligt i CI)
```
NY (hele posten):
```
### [G006] MELLEM — fire ældre live-fitness-tjek kan give grønt uden at have tjekket (delvist løst)

- **Beskrivelse:** De egentlige fund er nu hårde fejl (`db-rls-policies` returnerer fund uden `soft`, `scripts/fitness.mjs` l.622). Tilbage er at fire ældre live-tjek ikke bruger `liveGuard()` (l.1249-1263, fail-closed i CI): (1) uden `SUPABASE_ACCESS_TOKEN` returnerer `db-rls-policies` (l.564-566), `write-policy-session-var-consistency` (l.760-766), `legacy-is-active-readers` (l.843-849) og `postgrest-t9-schema-exposure` (l.1022-1028) `skipped` med 0 fund — også i CI; (2) ved API- eller netværksfejl returnerer de tre første `soft: true` (l.590-599 m.fl.), og soft-fund tæller ikke (l.1859).
- **Vision-svækkelse:** "Rettigheder der virker" — et manglende token eller et API-udfald giver grønt uden at tjekket er kørt.
- **Introduceret:** Trin 1 (`db-rls-policies`); de tre andre fulgte samme mønster.
- **Delvist løst:** fund er hårde; tokenet er sat i CI (`.github/workflows/ci.yml` l.87).
- **Skal løses:** Manglende token, API-fejl og netværksfejl skal give rødt i CI for alle fire (samme adfærd som `liveGuard()`); lokal udvikler-kørsel må fortsat springe over.
- **Risiko hvis glemt:** Mellem. Et udfald ser ud som et bestået tjek.
- **Løses-i:** pakke 1 (lokations-skabelon), trin 2 — sammen med test-databasen (G047), workflow-planen §3.
```

**TG-13 · G001, l.62 og l.66**
NUVÆRENDE:
```
- **Introduceret:** Trin 1 (`20260514120006_t1_audit_filter_values.sql`)
```
NY:
```
- **Introduceret:** Trin 1 (`20260514120006_t1_audit_filter_values.sql`). **Gældende definition:** `20260521000004_t10_audit_filter_values.sql` l.26 og l.43-50 (`stork.audit_filter_strict` skal være `'true'`; ellers WARNING og værdierne bevares uændret; kommentaren l.129 siger selv »LENIENT-default«).
```
NUVÆRENDE:
```
- **Løses-i:** forretnings-trinnet/Trin 9+ — SKAL være løst FØR trinnet åbner for første reelle data (DEL 5-præcisering)
```
NY:
```
- **Løses-i:** pakke 1 (lokations-skabelon, trin 10b) — i plan v3.8 (workflow-planen §3 trin 1): migration der gør filteret strict som default, negativ test og tjek af de eksisterende migrationer; også i manifestet. SKAL være løst FØR trinnet åbner for første reelle data (DEL 5-præcisering).
```
Bevis: bilaget, »Afgjort«: t10 er gældende kilde; G/H-dispositionen 24/9 (Codex: »TAGES MED, kræver plan-delta«).

**TG-14 · G003, ny linje efter l.86 (`- **Løses-i:** …`)**
NY:
```
- **Pakke 1:** test-opstart på en tom database indsætter to syntetiske `auth.users`-rækker før migrationerne (workflow-planen §3 trin 2). Selve migrationen ændres ikke (append-only), så posten forbliver åben for driften. Fabrikkens lokale afprøvning 24/9 (ikke genkørt her): uden bootstrap stopper historikken ved `20260514120007`; med bootstrap stopper den ved `20260516200000_h024_test_artifact_cleanup.sql` (precondition på live-data), og resten er grønt.
```
Bevis: `trin0-noter.md` (fabrikkens spike, uden for repoet).

**TG-15 · G047, l.392**
NUVÆRENDE: `- **Løses-i:** næste større schema-pakke`
NY: `- **Løses-i:** pakke 1 (lokations-skabelon), trin 2 — test-database til PR-kontrollerne (workflow-planen §3). \`db:test\` og fitness' live-tjek rammer i dag driftsprojektet (\`scripts/run-db-tests.mjs\` l.15).`
*(i filen uden backslashes: `` `db:test` `` osv.)*

**TG-16 · G048, l.401**
NUVÆRENDE:
```
- **Spor til fix-location:** G048 selv + bygge-status.md "Vores trin 5"-detalje-sektion + T9 slut-rapport (git-historik) dokumenterer bug-klassen og fix-location i Step 12. Inline kommentar i Step 3-filen overvejet, ikke leveret (ville kræve modifikation af applied migration-fil; rejected per append-only).
```
NY:
```
- **Spor til fix-location:** G048 selv + T9 slut-rapport (git-historik) dokumenterer bug-klassen og fix-location i Step 12 (`20260518000010_t9_seed_owners.sql`). (`bygge-status.md` er slettet, `c1c1b1b`.) Inline kommentar i Step 3-filen overvejet, ikke leveret (ville kræve modifikation af applied migration-fil; rejected per append-only).
```

**TG-17 · G049, l.411**
NUVÆRENDE:
```
- **Plan:** Plan-skabelon (`docs/skabeloner/plan-skabelon.md`) opdateres med pattern-checklist for CREATE OR REPLACE FUNCTION: signatur-bevarelse (DEFAULTs, arg-count), CASE-statement-minimums-WHEN, record-INTO-field-restriction.
```
NY:
```
- **Plan:** Plan-skabelonen i `docs/strategi/disciplin.md` (§10.2) får pattern-checklist for CREATE OR REPLACE FUNCTION: signatur-bevarelse (DEFAULTs, arg-count), CASE-statement-minimums-WHEN, record-INTO-field-restriction. (`docs/skabeloner/plan-skabelon.md` blev slettet 22/5, `4e65fa8`.)
```

**TG-18 · G050, l.421-422**
NUVÆRENDE:
```
- **Plan:** Plan-skabelon udvides med "Write-policy-checklist": for hver write-tabel skal planen specificere INSERT/UPDATE/DELETE-policies + session-var + GRANTs.
- **Løses-i:** disciplin-skabelon-revision (delvist dækket af V5 §3.3 — verificér)
```
NY:
```
- **Plan:** Plan-skabelonen i `docs/strategi/disciplin.md` (§10.2) får en "Write-policy-checklist": for hver write-tabel skal planen specificere policies + session-var + skrivevej (i dag: SECURITY DEFINER-RPC; direkte write-grants er forbudt, jf. G065/`app-write-revoke-discipline`).
- **Løses-i:** disciplin-skabelon-revision (delvist dækket af `disciplin.md` §3.3 — verificér mod den omskrevne disciplin.md)
```

**TG-19 · G051, l.432**
NUVÆRENDE: `- **Løses-i:** næste funktions-ændrende pakke (V5 §3.1 dækker formentlig — verificér)`
NY: `- **Løses-i:** næste funktions-ændrende pakke (\`disciplin.md\` §3.1 patch-først dækker formentlig — verificér mod den omskrevne disciplin.md)`
*(i filen uden backslashes)*

**TG-20 · G052, l.441**
NUVÆRENDE:
```
- **Plan:** Append-only-sektion i `docs/strategi/arbejds-disciplin.md` udvides: "Filer merget til main MEN ikke applied til remote (atomic rollback) kan rettes direkte med eksplicit Mathias-godkendelse. Vej A (repair --status applied + ny fix-migration) er default; Vej B (ret filen) kræver eksplicit beslutning."
```
NY:
```
- **Plan:** `docs/strategi/disciplin.md` (afløser `arbejds-disciplin.md`, slettet 22/5 i `4e65fa8`) får append-only-reglen med nuancen: "Filer merget til main MEN ikke applied til remote (atomic rollback) kan rettes direkte med eksplicit Mathias-godkendelse. Vej A (repair --status applied + ny fix-migration) er default; Vej B (ret filen) kræver eksplicit beslutning."
```

### 2.4 Nye poster (indsættes øverst under `## Åben gæld`, nyeste først: G082 … G067, derefter G066)

*Fundamentet: huller der i dag kun står i pakke 1's plan (arv-noter `plan.md:846-851`, fund-log NF-5)*

```
### [G067] MELLEM — `pending_change_apply(uuid)` har ingen rettigheds-gate

- **Beskrivelse:** Enhver indlogget (`authenticated`) bruger kan udløse apply af en godkendt, forfalden pending-ændring. Funktionen tjekker kun status og forfaldsdato — ingen `has_permission`/`is_admin` (seneste definition `20260518000004_t9_client_node_placements.sql` l.152-220; kun `revoke … from public, anon`, l.220).
- **Vision-svækkelse:** "Rettigheder der virker" (vision operationelt princip 2).
- **Introduceret:** T9 (pending-fundamentet). Synliggjort i pakke 1's plan (NF-5, arv-note plan.md:850).
- **Skal løses:** Beslut om apply skal kræve en rettighed eller kun køre som cron/service-rolle; dokumentér det valgte som kontrakt.
- **Risiko hvis glemt:** Mellem. Ændringen er godkendt, men tidspunktet for gennemførelse kan styres af enhver bruger; alle senere pakker med pending-flow arver det.
- **Løses-i:** næste pakke der ændrer pending-fundamentet; senest før cutover.

### [G068] MELLEM — pending-modellen har ingen »afvist«-status

- **Beskrivelse:** `pending_changes.status` tillader kun `pending/approved/applied/undone` (`20260518000000_t9_pending_changes.sql` l.45-46). En godkendt ændring hvis apply-genvalidering fejler, bliver stående som `approved` og logges af cron som `partial_failure` (samme fil l.394-435).
- **Vision-svækkelse:** Princip 9 (status-modeller bevarer historik) — en fejlet ændring kan ikke skelnes fra en ventende.
- **Introduceret:** T9. Synliggjort i pakke 1's plan (D-10, arv-note plan.md:846).
- **Skal løses:** Terminal status for fejlet apply (fx `afvist`/`failed`) + audit af årsagen.
- **Risiko hvis glemt:** Mellem. Cron forsøger samme fejlede ændring igen hver kørsel.
- **Løses-i:** næste pakke der ændrer pending-fundamentet.

### [G069] MELLEM — retention udføres kun for `event_based`

- **Beskrivelse:** Retention-jobbet (`retention_cleanup_daily`, cron-body i `20260515130000_r7a_regprocedure_callable_fix.sql` l.331-339) læser kun `event_based`-klassifikation via `retention_event_column`. `time_based` og `manual` har ingen udførende vej.
- **Vision-svækkelse:** "Alt drift styres i UI" + princip 2 (styr på data) — et UI-valg af `time_based`/`manual` har ingen effekt.
- **Introduceret:** R7a/fundamentet. Synliggjort i pakke 1's plan (SM-4, arv-note plan.md:847).
- **Skal løses:** Executor for `time_based` og `manual`, eller UI der afviser valg uden executor.
- **Risiko hvis glemt:** Mellem. Data der skulle slettes/anonymiseres bliver liggende uden fejl.
- **Løses-i:** før cutover (retention er fundament, jf. vision »skal være på plads før systemet går i produktion«).

### [G070] LAV — due-gaten bruger `current_date` i sessionens tidszone

- **Beskrivelse:** `pending_change_apply` afviser med `not_yet_due` når `effective_from > current_date` (`20260518000004_t9_client_node_placements.sql` l.183-186); `current_date` følger sessionens tidszone.
- **Vision-svækkelse:** Én sandhed — samme ændring kan være forfalden eller ej afhængigt af sessionen.
- **Introduceret:** T9. Synliggjort i pakke 1's plan (arv-note plan.md:849; pakken gør sin egen effektive dato robust, S-17/S-18).
- **Skal løses:** Fast tidszone for forfalds-afgørelsen (afhænger af beslutningen om »systemets dag«, se pakke 1's ½ side).
- **Risiko hvis glemt:** Lav.
- **Løses-i:** når »systemets dag« er afgjort (pakke 1's `plan ok`); rettelsen i fundamentet ved næste pending-pakke.

### [G071] LAV — `pending_change_request` overskriver `stork.change_reason`

- **Beskrivelse:** `pending_change_request` sætter `stork.change_reason` til sin egen label før INSERT (`20260518000000_t9_pending_changes.sql` l.143). Request-audit'en bærer labelen; brugerens årsag lever i payload og på apply-rækkerne.
- **Vision-svækkelse:** Princip 6 (audit) — årsagen står ikke på request-rækken.
- **Introduceret:** T9. Synliggjort i pakke 1's plan (R2-2, arv-note plan.md:851).
- **Skal løses:** Bevar brugerens change_reason (fx label + årsag).
- **Risiko hvis glemt:** Lav.
- **Løses-i:** næste pakke der ændrer pending-fundamentet.

### [G072] LAV — `gdpr_responsible_employee_id` er erklæret, men ikke koblet; migrations-kommentaren er forkert

- **Beskrivelse:** Kolonnen `core_compliance.superadmin_settings.gdpr_responsible_employee_id` sættes (`20260515110000_p0_gdpr_responsible_employee.sql` l.48, 76), men ingen RPC læser den; aktivering af anonymiserings-strategier kræver kun rettigheden (`20260515110100_p1a_anonymization_strategies.sql` l.293). Kolonnens COMMENT (samme p0-fil l.50-51) siger "Refereret af anonymization-RPCs" — det passer ikke.
- **Vision-svækkelse:** Én sandhed — en kommentar i selve databasen påstår noget der ikke gælder.
- **Introduceret:** P0 (2026-05-15). Synliggjort i recon.md:216 (pakke 1).
- **Skal løses:** Ny `COMMENT ON COLUMN` (migrationen selv er append-only). Om den GDPR-ansvarlige skal være den eneste der kan aktivere strategier, er Mathias' spørgsmål (masterplan l.1950) og afgøres i den pakke der rører GDPR-strategierne.
- **Risiko hvis glemt:** Lav.
- **Løses-i:** den pakke der rører anonymiserings-strategierne.
```

*Byggetjekkets kendte grænser (står i dag kun i `haerdet-register.json`, implementeringsplanen og Codex-leverancer, som fjernes)*

```
### [G073] MELLEM — byggetjekkets moduler har intet gældende Codex-pas

- **Beskrivelse:** De moduler der bevares som byggetjek, er ændret efter Codex' sidste PASS: `scripts/v5/ci-build-dom.mjs` (i dag blob `3acea6d1`), `pg-runner.mjs` (`42531d3a`, inkl. PostgREST/JWT-stien, som aldrig er angrebet), `build-proof.mjs` (`c9a09e61`), `build-harness.mjs` og `test-runner.mjs`. `haerdet-register.json` markerer alle fem `kandidat`.
- **Vision-svækkelse:** Én sandhed — den dommer der skal spærre før drift, er ikke efterprøvet i sin nuværende form.
- **Introduceret:** Hurtigt spor 21/9 (kandidat-drift; M-47).
- **Skal løses:** Én Codex-gennemgang af byggetjekket (ci-build-dom, test-runner, pg-runner) i sin omlagte form.
- **Risiko hvis glemt:** Mellem. En fejl i dommeren giver falsk grønt for alle pakker.
- **Løses-i:** pakke 1, trin 2 (workflow-planen §3: »Én Codex-gennemgang af byggetjekket«) og efter omlægningen i 4.1 trin 3.

### [G074] MELLEM — byggetjekkets tillidsgrænser (runneren)

- **Beskrivelse:** Kendte, ikke lukkede grænser i målingen: (a) migrationer og ejer-kald kører som superuser; det tjekkes ikke at aktørrollerne mangler `BYPASSRLS`/superuser efter producentens migrationer — en test-rolle med bypass giver falsk-grønne RLS-tests; (b) `pg-runner` kører med `ON_ERROR_STOP=0` (`pg-runner.mjs` l.137), så et flersætnings-setup kan være delvist udført; (c) et renset underproces-miljø er ikke isolation: produktkode kan læse forælderens miljø via `/proc/<ppid>/environ`, og `prover.mjs` l.145 merger `process.env`; (d) `COPY TO PROGRAM`/`lo_export` kører i Postgres-servicecontaineren, hvis isolation ikke er attesteret; (e) manglende `meta` i måle-jobbet giver intet check (tavshed), ikke rødt.
- **Vision-svækkelse:** Én sandhed — målingen kan i særtilfælde bevise noget andet end det produktet gør.
- **Introduceret:** C4b (2026-09-16). Navngivet som R-RUNNER-UDFØRELSE/-ATOMARITET/-LIVSCYKLUS/-OVERLAP i implementeringsplanen (@ 87a877b, l.105, 341).
- **Skal løses:** (a) tjek af rolle-attributter efter migrationerne; (b) atomar udførelse eller eksplicit tjek; (e) samle-tjekket behandler et manglende byggetjek som rødt (workflow-planen §2). (c)/(d) dokumenteres som accepteret, hvis de ikke lukkes.
- **Risiko hvis glemt:** Mellem.
- **Løses-i:** (e) 4.1 trin 3 (samle-tjekket); (a)-(d) i Codex-gennemgangen af byggetjekket (G073).

### [G075] MELLEM — `prover.json` ligger i produkt-zonen, og dens kommando køres uden zone-tjek (R6-2)

- **Beskrivelse:** `plan-build/<pakke>/prover.json` angiver kommandoen CI kører (`ci-build-dom.mjs` l.131-141). Filen ligger hvor byggeren kan skrive, så byggeren kan pege kommandoen om og ændre hvad der måles.
- **Vision-svækkelse:** Én sandhed — den der bygger, kan påvirke målingen.
- **Introduceret:** C4b. Rejst i planreview (plan-slutlaesning-r6 R6-2; verdikt-code-reviewer-plan-r4 neg[6]).
- **Skal løses:** `prover.json` og `prover-run.mjs` med i låsen på testene (workflow-planen §2 trin 3: »testene + filen der vælger hvilke tests der køres« låses ved grøn dækningsdom). Dækningsdommen binder hele kørselsfladen med blob-OID'er (testene, manifestet, testindekset, `prover.json`), og byggetjekkets tjek 3-4 kontrollerer dem. Hooken klassificerer manifest, testindeks og `prover.json` som Codex' målelag (Codex før låsen, byggeren aldrig; `skill-og-roller.md` D).
- **Risiko hvis glemt:** Mellem.
- **Løses-i:** pakke 1 (låsen i trin 3).

### [G076] LAV — accepteret restrisiko: godkendelsesordet kommer fra en kanal producenten kan skrive i

- **Beskrivelse:** Mathias' `krav ok`/`plan ok`/`slut ok` falder i chatten og skrives i ledgeren af en AI-session (approval-filerne fjernes, §8.2). Kæden beviser tekst og rækkefølge, ikke hvem der skrev ordet (R-CI-APPROVER-FLOW / R-CI-AUTENTICITET, implementeringsplanen @ 87a877b l.338, 340).
- **Vision-svækkelse:** Ingen direkte — det er en accepteret risiko.
- **Introduceret:** C4 (2026-09-15).
- **Skal løses:** Ingen aktiv handling. Accepteret i workflow-planen §2 (accepterede risici): ordet bindes til teksten og står i ledgeren.
- **Risiko hvis glemt:** Lav.
- **Løses-i:** ingen handling (accepteret risiko; genovervejes kun hvis godkendelseskanalen ændres).
```

*Test og CI*

```
### [G077] MELLEM — testbiblioteket: race-tests kaster altid, HTTP-svar tabes, OpenAPI-tjekket rammer driftsprojektet

- **Beskrivelse:** (1) LIB-RACE: `lib.race` kræver `{ok:boolean}` (`scripts/v5/test-runner.mjs` l.58, 87), men `pg-runner`s `race()` returnerer `{protocolOk,…}` (`pg-runner.mjs` l.211-239), så alle race-tests kaster. (2) LIB-HTTP: et HTTP-svar der ikke er et array, tabes (`rows` kun hvis `Array.isArray`, `pg-runner.mjs` l.125), og headers ignoreres. (3) Kontraktbehov #10: `postgrest-t9-schema-exposure` spørger det eksterne driftsprojekt (`scripts/fitness.mjs` l.1015), ikke test-databasen. (4) 15 datoforløb er ikke testet, fordi den styrede klokke mangler (HALT-FA3-listen i Codex' pas 1). (5) Det er ikke verificeret at en manglende database aldrig giver exit 0 i de beholdte runnere (O-9).
- **Vision-svækkelse:** Én sandhed — test-grønt kan skyldes et bibliotek der ikke måler.
- **Introduceret:** Fase 4 (2026-09-21). Står i dag kun i `provenance/angrebs-tests-pas1.leverance.md`, `angrebs-kontraktbehov.leverance.md` og fund-log (fjernes).
- **Skal løses:** (1)-(2) rettes i test-biblioteket; (3) OpenAPI-tjekket flyttes til test-databasen; (4) styret klokke — også for API- og login-tokens' tid; (5) manglende database = rødt.
- **Risiko hvis glemt:** Mellem. »Codex færdiggør testene« kan ikke lykkes.
- **Løses-i:** pakke 1, trin 2 (workflow-planen §3).

### [G078] MELLEM — »Schema drift check« i CI tjekker intet

- **Beskrivelse:** `supabase/schema.sql` er stadig en pladsholder (3 linjer, `-- PLACEHOLDER`), og `scripts/schema-check.sh` l.11-14 slutter med 0 på markøren. Trinnet i `ci.yml` (l.143-145) er derfor grønt uden at tjekke noget. Desuden dumper scriptet kun `--schema public` (l.19), mens alle rigtige tabeller ligger i core_* (dem dækker kun `types:check`).
- **Vision-svækkelse:** Én sandhed — et grønt trin der intet tjekker.
- **Introduceret:** Fase 0 (pladsholderen blev aldrig erstattet).
- **Skal løses:** Gøres reelt (pull + core_*-schemas) eller fjernes.
- **Risiko hvis glemt:** Mellem. Falsk tryghed om skema-drift.
- **Løses-i:** pakke 1, trin 2 (workflow-planen §3).

### [G079] MELLEM — destruktive drops (`disciplin.md` §3.9) håndhæves ikke mekanisk

- **Beskrivelse:** §3.9 kræver tom-check, reference-check, audit-spor og rollback-plan for `DROP TABLE/COLUMN`, `TRUNCATE`, `DELETE` uden WHERE, og siger "Post-cutover: alle fire er CI-blocker". Der findes intet mekanisk tjek (`scripts/migration-gate.mjs`: 0 træf på DROP/TRUNCATE); i dag bærer reviewet det.
- **Vision-svækkelse:** "Stork rører løndata" — den dyreste fejl-klasse.
- **Introduceret:** §3.9 (genindført); løftet om CI-blocker står kun i disciplin.
- **Skal løses:** CI-tjek for de fire krav.
- **Risiko hvis glemt:** Mellem før cutover, høj efter.
- **Løses-i:** før cutover.

### [G080] LAV — ingen lint for hardkodede satser (`disciplin.md` §7 invariant 4)

- **Beskrivelse:** Invariant 4 "Ingen hardkodede satser/lønarter" håndhæves af Codex- og Claude-tjek; "lint bygges i senere spor" (`disciplin.md` l.232). Der fandtes ingen G-post (grep i dette register: 0).
- **Vision-svækkelse:** Princip 3 (forretningslogik som data).
- **Introduceret:** disciplin §7.
- **Skal løses:** Lint/fitness-tjek for hardkodede satser i kode.
- **Risiko hvis glemt:** Lav før formel-systemet findes.
- **Løses-i:** senest ved trin 13 (formel-system).
```

*Faldgruber i fundamentet (står i dag kun i `recon/recon.md`, `recon2.md` og pakke 1's plan §6)*

```
### [G081] LAV — stille ikke-afvisninger i anonymiserings- og retention-vejen

- **Beskrivelse:** Retention-jobbet springer uden fejl over tabeller uden `event_based`-klassifikation og mappings der ikke er `status='active' AND is_active=true` (`20260515130000_r7a_regprocedure_callable_fix.sql` l.331-339, 247-249).
- **Vision-svækkelse:** Princip 2 (styr på data) — et fravalg ser ud som et vellykket job.
- **Introduceret:** R7a/fundamentet. Synliggjort i recon.md:152, 279 (pakke 1).
- **Skal løses:** Jobbet rapporterer oversprungne tabeller/mappings (heartbeat/audit), så det kan ses i drift.
- **Risiko hvis glemt:** Lav før rigtige retention-regler er aktiveret.
- **Løses-i:** før cutover (sammen med G069).

### [G082] LAV — migration-gate ser ikke dynamisk DDL; audit-filteret gennemgår ikke jsonb generelt

- **Beskrivelse:** (1) `scripts/migration-gate.mjs` finder kolonner i `CREATE TABLE`/`ALTER TABLE ADD COLUMN`-tekst; DDL bygget med `EXECUTE format(...)` ses ikke. (2) `core_compliance.audit_filter_values` har kun specialtilfældet `core_identity.clients.fields` for jsonb (`20260521000004_t10_audit_filter_values.sql`, kommentaren l.129); andre jsonb-kolonner med PII gennemgås ikke.
- **Vision-svækkelse:** Princip 2 (styr på data).
- **Introduceret:** Fundamentet. Synliggjort i recon (pakke 1).
- **Skal løses:** (1) forbud mod eller tjek af dynamisk DDL i migrationer; (2) generisk jsonb-gennemgang, når næste jsonb-felt med PII kommer.
- **Risiko hvis glemt:** Lav.
- **Løses-i:** den pakke der indfører næste jsonb-felt med PII eller dynamisk DDL.
```

---

## 3. `docs/teknisk/huskeliste.md`

**HL-1 · l.1** (i samme ændring som governance-tjekket fjernes)
NUVÆRENDE: `<!-- governance-owns: eksterne-handlinger -->`
NY: *(linjen slettes)*

**HL-2 · l.12** (samme tidspunkt)
NUVÆRENDE:
```
En H-reference andre steder i docs er en _mention_; den kanoniske definition bor som `### [Hxxx]`-entry her. `governance-check.mjs` håndhæver: hver H-ref peger på enten en åben entry herunder eller en kode i historisk-registret.
```
NY:
```
En H-reference andre steder i docs er en _mention_; den kanoniske definition bor som `### [Hxxx]`-entry her. Hver H-ref skal pege på enten en åben entry herunder eller en kode i historisk-registret (tjekkes af Codex' planlæsning ved planens G/H-opslag, ikke længere mekanisk — `governance-check.mjs` er fjernet).
```

**HL-3 · H006, l.38 og l.40**
NUVÆRENDE:
```
- **Handling:** 0 TODO-markører i migration-filer før cutover.
```
NY:
```
- **Handling:** 0 TODO-markører i 1.0-migrations-skabelonerne før cutover: `scripts/migration/employees/1_discovery.sql` (4 i dag) og `2_extract.sql` (3 i dag). (`supabase/migrations/` har 0 — aflæst 2026-09-24.)
```
NUVÆRENDE: `- **Løses-i:** 1.0-discovery / før cutover (kobler til G007)`
NY: `- **Løses-i:** 1.0-discovery / før cutover (kobler til G007; samme præcisering gælder cutover-checklist #11 og masterplanens cutover-blocker #11)`
Bevis: `grep -c TODO` pr. fil (4/3/0); `supabase/migrations`: 0 træf.

**HL-4 · H028 lukkes**
NUVÆRENDE: l.54-58, `### [H028] Mekanisk G/H-opslag i recon-doc'en (partnerskabs-runde-input)`
NY: *(posten fjernes fra »Åbne H-handlinger«; se HL-6)*
Bevis: recon-maskineriet fjernes (planens §4.5). I stedet disponerer planen den G/H der rammer pakken (`disciplin.md` §2 trin 2), og Codex tjekker opslaget i planlæsningen (§9.3). Kravets kildetjek omfatter ikke G/H (S8).

**HL-5 · H029 lukkes**
NUVÆRENDE: l.60-64, `### [H029] Indre tekst-staleness-gennemgang af alle docs`
NY: *(posten fjernes fra »Åbne H-handlinger«; se HL-6)*
Bevis: gennemgangen er udført 24/9 (alle 685 dokumenter, 16 agenter), og rettelserne er denne oprydning (workflow-planen §4).

**HL-6 · historisk-registret, l.68, l.70 og tabellen l.74-81**
NUVÆRENDE (l.68): `Maskin-læsbar source of truth (læses af `governance-check.mjs` til H-ref-integrity):`
NY (l.68): `Liste over afsluttede koder:`
NUVÆRENDE (l.70): `<!-- gov-historical-codes: H010, H011, H020, H022, H024, H026, H027 -->`
NY (l.70): `<!-- gov-historical-codes: H010, H011, H020, H022, H024, H026, H027, H028, H029 -->`
NY rækker (indsættes sidst i tabellen efter H024-rækken, l.81):
```
| H027 | Node 24-deadline: GitHub Actions bumpet til v6 (løst 2026-06-10, PR #114/#116)                                                                                                | git-historik (commit `b4c8c49`)            |
| H028 | Mekanisk G/H-opslag i recon (erstattet: planens G/H-disposition, tjekket i Codex' planlæsning, workflow-planen §2)                                                            | git-historik                               |
| H029 | Indre tekst-staleness-gennemgang af alle docs (udført 2026-09-24 som dokumentgennemgangen + oprydningen, workflow-planen §4)                                                | git-historik                               |
```
Bevis: H027 står i koden l.70, men manglede i tabellen (B §2.2); `b4c8c49` »[H027] Node 24-deadline (2026-06-16): bump actions/checkout, actions/setup-node, pnpm/action-setup → v6 i alle workflows« ligger på main.

**HL-7 · nye poster (indsættes sidst under »Åbne H-handlinger«, efter H025)**
```
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
```
Bevis: H030: `gh api …/collaborators` → `stork-code-bot role_name: admin`; `…/branches/main/protection` → 403. H031: `p2-runde10/prompt.txt` + `OUT-p2-r10e.md` F-3g (D2 U7) @ 87a877b. H032: `analyser-2026-09-08/grundplan-v1.md` l.108-109 og `grundplan-v2.md` l.124 @ 87a877b; `ls AGENTS.md .codex` → findes ikke.

---

## 4. `CLAUDE.md`

**CM-1 · l.3**
NUVÆRENDE:
```
Greenfield-rebuild. Byg-workflowet ("v5") bygges på ny. Rolle/orientering kommer via skills — ikke her. **Bulk-læs ikke docs for at orientere dig; læs snævert, on-demand.**
```
NY:
```
Greenfield-rebuild. Byg-workflowet står i `docs/strategi/disciplin.md` (det ene proces-dokument). Rolle/orientering kommer via rolleteksterne i `scripts/v5/roller/` — ikke her. **Bulk-læs ikke docs for at orientere dig; læs snævert, on-demand.**
```
Bevis: workflow-planen §2 (»Ét proces-dokument: din `disciplin.md` … rolleteksterne peger på den«). Claude.ai-skillen bruges ikke af workflowet (`skill-og-roller.md` A).

**CM-2 · l.7**
NUVÆRENDE:
```
- Commits/PR'er forfattes som `stork-code-bot` (write, aldrig admin); approvals/merge-gates = `@mgrubak`. Tjek konto med `gh auth status` ved tvivl.
```
NY:
```
- Commits/PR'er forfattes som `stork-code-bot`. Botten har i dag **admin**-rolle på repoet (aflæst 2026-09-24) og skal nedgraderes til write — huskeliste [H030]. Mathias' godkendelser er hans ord (`krav ok` · `plan ok` · `slut ok`), ført i ledgeren `docs/sandhed/mathias-ord.md`; han rører ikke GitHub. Spærringen før drift er det krævede CI-tjek `Lint, typecheck, test, build`. Tjek konto med `gh auth status` ved tvivl.
```
Bevis: `gh api repos/Cphsales/stork-2.0/collaborators` → `stork-code-bot role_name: admin`; `gh api …/branches/main` → `required_status_checks.contexts: ["Lint, typecheck, test, build"]`, `enforcement_level: everyone`; workflow-planen §2 (accepterede risici). Ledgerens sti: H5 (§8.6). **Hvornår:** CM-2 lægges ind efter flytningen i §8.6 (4.1 trin 3). `CLAUDE.md` @ `87a877b` nævner hverken ledgeren eller ordbogen andre steder (grep `mathias-ord`, `ordbog`: 0).

**CM-3 · l.8** (i samme ændring som `docs/foraeldet-workflow/` fjernes)
NUVÆRENDE:
```
- **Læs ikke:** `docs/foraeldet-workflow/` (dødt, parkeret) · `/home/mathias/sales-commission-hub/` (1.0, anti-mønstre) · `copenhagensales/*`-repos.
```
NY:
```
- **Læs ikke:** `/home/mathias/sales-commission-hub/` (1.0, anti-mønstre) · `copenhagensales/*`-repos.
```

---

## 5. Øvrige dokumenter og filer

### 5.1 `README.md`

**RM-1 · layout, l.10-20**
NUVÆRENDE:
```
stork-2.0/
├── apps/
│   └── web/              shadcn + Vite + React 18 frontend
├── packages/
│   ├── core/             @stork/core: formel-engine, status-model
│   ├── types/            @stork/types: auto-generated Database-typer
│   ├── utils/            @stork/utils: rene helpers
│   └── eslint-config/    @stork/eslint-config: delt ESLint-config
├── supabase/             migrations, edge functions, config
└── .github/workflows/    CI
```
NY:
```
stork-2.0/
├── apps/
│   └── web/              shadcn + Vite + React 18 frontend
├── packages/
│   ├── core/             @stork/core: tom indtil videre (skeleton = masterplan trin 12)
│   ├── types/            @stork/types: auto-generated Database-typer
│   ├── utils/            @stork/utils: rene helpers
│   └── eslint-config/    @stork/eslint-config: delt ESLint-config
├── supabase/             migrations, tests, config
├── docs/
│   ├── strategi/         Mathias' sandhed (vision, forretningsforståelse, masterplan) + disciplin.md (workflowet)
│   ├── sandhed/          godkendte krav pr. pakke (krav/) + ledgeren (mathias-ord.md) + ordbogen (ordbog.md)
│   └── teknisk/          teknisk gæld, huskeliste, permission-matrix, cutover-checkliste
├── plan-build/<pakke>/   pakkens plan, test-indeks og slut-rapport
├── scripts/              fitness, migration-gate, typer, byggetjekket (scripts/v5) — se scripts/README.md
└── .github/workflows/    CI
```
Bevis: `packages/core/src/index.ts` = `export {};`; `supabase/functions/` findes ikke; masterplan §4.1 l.1571 (trin 12 »@stork/core skeleton ⌛ Udestående«). Ledger og ordbog i `docs/sandhed/`: H5 (§8.6); RM-1 lægges ind efter flytningen.

**RM-2 · l.69-70**
NUVÆRENDE:
```
- **Branch-protection:** Påkrævede checks + review + linear history.
  Konfiguration dokumenteret i `.github/BRANCH_PROTECTION.md`
```
NY:
```
- **Branch-protection:** Påkrævet check `Lint, typecheck, test, build`
  (håndhævet for alle — aflæst 2026-09-24). Resten af reglen er
  dokumenteret i `.github/BRANCH_PROTECTION.md`
- **Workflow:** krav → plan → byg → slut efter `docs/strategi/disciplin.md`
```

**RM-3 · l.76-78**
NUVÆRENDE:
```
## Status

Fase 0 — fundament.
```
NY:
```
## Status

Masterplanens trin 1-10 er bygget (migrationshistorikken i
`supabase/migrations/`). Næste pakke er trin 10b (lokations-skabelonen).
Status pr. trin: `docs/strategi/stork-2-0-master-plan.md` §4.1.
```
Bevis: masterplan l.1556-1567 (trin 1-10 »✓«, 10b udestående); 125 filer i `supabase/migrations/`.

### 5.2 `supabase/README.md` (kun de linjer der er forkerte; resten bliver)

**SR-1 · l.5**
NUVÆRENDE: `PostgreSQL 17. Tom database — migrations ankommer i lag B/C.`
NY:
```
PostgreSQL 17. Skemaet bygges af migrationerne i `supabase/migrations/`
(masterplanens trin 1-10) og er i drift. Tabeller og funktioner ligger i
`core_identity`, `core_compliance` og `core_money`; `public` holdes tom
(fitness `schema-ownership`, trin 1 `20260514120000_t1_drop_public.sql`).
```

**SR-2 · l.54 (kommando-tabellen)**
NUVÆRENDE: `| \`pnpm exec supabase functions deploy <name>\`       | Deploy edge function                                                                                           |`
NY: *(rækken slettes — der findes ingen edge functions)*

**SR-3 · l.57-93 (RLS-template + helper-funktioner)**
NUVÆRENDE (l.57, 65-67, 77 og 85-93):
```
## RLS-template (lag C1)
CREATE TABLE public.example (...);
ALTER TABLE public.example ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.example FORCE ROW LEVEL SECURITY;
ALTER TABLE public.example ENABLE ROW LEVEL SECURITY;
### Helper-funktioner

| Funktion                       | Returner          | Status                                           |
| ------------------------------ | ----------------- | ------------------------------------------------ |
| `public.current_employee_id()` | `uuid` (null)     | Stub i C1. Lag D mapper `auth.uid()` → employees |
| `public.is_admin()`            | `boolean` (false) | Stub i C1. Lag D læser `role_page_permissions`   |

Stubs returnerer safe defaults så feature-tabeller i lag D kan reference
dem i policies uden circular dependency.
```
NY (samme steder; `public.example` → `core_<domæne>.example` i alle tre SQL-eksempler; overskrift og helper-afsnit):
```
## RLS-template

CREATE TABLE core_<domæne>.example (...);
ALTER TABLE core_<domæne>.example ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_<domæne>.example FORCE ROW LEVEL SECURITY;
ALTER TABLE core_<domæne>.example ENABLE ROW LEVEL SECURITY;

En tabel med RLS og 0 policies (default-deny) skal have markøren
`-- skip-force-rls: <begrundelse>` eller `-- default-deny: <begrundelse>`
(fitness `db-rls-policies`). App-roller har ingen direkte skrive-grants
på core_* — skrivning går via SECURITY DEFINER-RPC'er (fitness
`app-write-revoke-discipline`, G065).

### Helper-funktioner

| Funktion                                                   | Returner  |
| ---------------------------------------------------------- | --------- |
| `core_identity.current_employee_id()`                      | `uuid`    |
| `core_identity.is_admin()`                                 | `boolean` |
| `core_identity.has_permission(p_page_key, p_tab_key, p_can_edit)` | `boolean` |
| `core_identity.has_permission_action(p_action_id)`         | `boolean` |
```
Bevis: `create or replace function core_identity.*` i migrationerne (`20260514120002_t1_helpers_stubs.sql`, `20260518000010_t9_seed_owners.sql` l.15-19 m.fl.); fitness l.1333, 1728.

**SR-4 · l.95-138 (audit-template)**
NUVÆRENDE (l.95, 97, 105-106, 118-121, 126, 133-138):
```
## Audit-template (lag C2)
Alle feature-tabeller får audit via `public.stork_audit()`-trigger.
  AFTER INSERT OR UPDATE OR DELETE ON public.example
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();
`source_type` auto-detekteres ellers via:
`pg_trigger_depth()` → `current_user` → `auth.uid()` → fallback.
6 mulige værdier: `manual / cron / webhook / trigger_cascade /
service_role / unknown`.
SELECT * FROM public.audit_log_read(
Kalder skal være admin (per `public.is_admin()`-helper). C1-stub
returnerer false → ingen kan læse indtil lag D låser op.

**PII-filter-hook:** `public.audit_filter_values(schema, table, jsonb)`.
C2-stub returnerer values uændret. Lag D omdefinerer til at hashe
kolonner med `pii_level=direct` inden de gemmes.
```
NY (samme steder):
```
## Audit-template
Alle feature-tabeller får audit via `core_compliance.stork_audit()`-trigger
(fitness `audit-trigger-coverage`; undtagelser i `AUDIT_EXEMPT_SNAPSHOT_TABLES`).
  AFTER INSERT OR UPDATE OR DELETE ON core_<domæne>.example
  FOR EACH ROW EXECUTE FUNCTION core_compliance.stork_audit();
`source_type` auto-detekteres ellers via:
`pg_trigger_depth()` → `current_user` → `auth.uid()` → fallback.
7 mulige værdier: `manual / cron / webhook / trigger_cascade /
service_role / unknown / migration`.
SELECT * FROM core_compliance.audit_log_read(
  p_table_schema => 'core_money',
Kalder skal have rettigheden `audit.log` (`has_permission('audit', 'log', false)`).

**PII-filter-hook:** `core_compliance.audit_filter_values(schema, table, jsonb)`
hasher kolonner med `pii_level=direct` før de gemmes. Ukendt tabel eller
kolonne: WARNING og værdien bevares uændret, medmindre
`stork.audit_filter_strict='true'` (LENIENT-default = G001).
```
Bevis: `20260514120003_t1_audit_partitioned.sql` l.31-33 (7 værdier); `20260514190100_q_audit_rpcs.sql` l.8, 13-26; `20260521000004_t10_audit_filter_values.sql` l.26, 43-50.

**SR-5 · l.146-151, 155-156, 175-190 (navne) og l.198-232 (edge-function-eksemplet)**
NUVÆRENDE (l.146-148):
```
**Princip:** `pg_cron` til DB-interne jobs, scheduled edge functions
til eksterne. Hybrid mønster — `pg_cron` tickrer + edge function
gør arbejdet — bruges når DB-jobs skal kalde eksterne API'er.
```
NY:
```
**Princip:** `pg_cron` til DB-interne jobs. Der findes ingen edge
functions endnu; eksterne kald afgøres når de første integrationer
bygges (masterplan trin 21).
```
NUVÆRENDE (l.155-156): `Hver cron-job rapporterer status til \`public.cron_heartbeats\`` / `via \`public.cron_heartbeat_record()\`.`
NY: `Hver cron-job rapporterer status til \`core_compliance.cron_heartbeats\`` / `via \`core_compliance.cron_heartbeat_record()\` (status \`ok / failure / skipped / partial_failure\`). Cron-bodies skal sætte \`stork.change_reason\` (fitness \`cron-change-reason\`).`
I eksemplet l.173-189: `public.example_tokens` → `core_<domæne>.example_tokens`, `public.cron_heartbeat_record(` → `core_compliance.cron_heartbeat_record(` (to steder).
NUVÆRENDE l.198-232 (`### Eksempel: edge function med heartbeat (hybrid pattern)` til og med `eller \`pg_cron + pg_net.http_post()\` for at trigge fra DB.`) → NY: *(afsnittet slettes)*
NUVÆRENDE l.239-240: `` `audit_log` (filter source_type='cron') og via `` / `` `public.cron_heartbeats_read()` RPC. ``
NY: `` `audit_log` (filter source_type='cron') og via `` / `` `core_compliance.cron_heartbeats_read()` RPC (rettighed `audit.cron`). ``
Bevis: `20260514120004_t1_cron_skabelon.sql` l.25, 57; `20260514150006_t7b_cron_consecutive_failure.sql`; `q_audit_rpcs.sql` l.10; `supabase/functions/` findes ikke; masterplan l.1537 (trin 21).
*(i filen uden backslashes)*

**SR-6 · l.242-257 (period-lock, navne)**
NUVÆRENDE (l.242, 254-257):
```
## Period-lock-template (lag C4)
Lag C4 instans: `pay_periods` + `commission_snapshots` + `salary_corrections`

- `ensure_pay_periods`-cron. Lag D får `kpi_snapshots`/`kpi_corrections`.
  Lag E udvider med faktisk materialisering i `on_period_lock()`.
```
NY:
```
## Period-lock-template
Instans (trin 4, `core_money`): `pay_periods` + `commission_snapshots` + `salary_corrections`

- `ensure_pay_periods`-cron. Beregningen er stadig et skelet (G012);
  den reelle materialisering kommer med trin 14 + 22.
```
Bevis: `create table core_money.pay_periods` m.fl.; G012 (`pay_period_compute_candidate` er SKELETON, Løses-i trin 14 + 22).

**SR-7 · l.322-369 (klassifikations-systemet)**
NUVÆRENDE (l.322, 324-326, 336, 349, 355, 361, 369):
```
## Klassifikations-systemet (lag D1)
`public.data_field_definitions` er registry over hvad hver kolonne pr. kilde
er klassificeret som. Lag D6 importerer eksisterende `classification.json`
hertil og flipper migration-gate til Phase 2 (strict).
| `retention_type`                              | enum (CHECK, NULL) | `time_based` / `event_based` / `legal` / `manual`                         |
| `legal`        | `{"max_days": positive integer}` — lovgivning er fast MAKS           |
- **Lovgivning er fast MAKS** — `retention_type='legal'` valideres som positive integer max_days, ingen forlængelse-mekanisme i skema
- `data_field_definition_upsert(...)` — admin-only via `is_admin()` (C1-stub afviser indtil D4)
Lag D opdaterer policy til at konsultere permission-system når det lander.
```
NY (samme steder):
```
## Klassifikations-systemet
`core_compliance.data_field_definitions` er registry over hvad hver kolonne pr. kilde
er klassificeret som. Migration-gate kører Phase 2 (strict) i CI; tabellen i
databasen er sandheden.
| `retention_type`                              | enum (CHECK, NULL) | `time_based` / `event_based` / `manual` / `permanent` (NULL = ikke valgt) |
| `permanent`    | NULL — ingen sletning (fx audit-struktur)                            |
- **`legal` er fjernet** (masterplan rettelse 24: Stork har ingen lovbestemt min-retention på forretningsdata); tidligere legal-rækker er NULL eller `permanent` (`20260514180500_d1_d2_drop_legal_convert_rows.sql`)
- `core_compliance.data_field_definition_upsert(...)` — kræver rettigheden `classification.manage`
*(l.369 slettes)*
```
De øvrige »Mathias-principper håndhævet« (l.354 kolonne-pr-kilde, l.356 formål påkrævet, l.357 kategorier låst — »Mathias' U3-afgørelse«) **bliver uændret.**
Bevis: `20260514120005_t1_data_field_definitions.sql` (core_compliance); d1_d2-migrationen l.45-58; permission-matrix.md l.63 (`data_field_definition_upsert` → `classification/manage`); `ci.yml` l.100-103.

**SR-8 · l.376-407 (migration-gate)**
NUVÆRENDE (l.378-386 og 393-407):
```
`scripts/migration-gate.mjs` parser hver migration, finder kolonner
fra `CREATE TABLE` og `ALTER TABLE ADD COLUMN`, og tjekker dem mod
`supabase/classification.json`.

**Phase 1 (lag B-D, default):** uklassificerede kolonner giver
`::warning::` i CI men blokerer ikke merge.

**Phase 2 (efter lag D):** samme tjek, men som `::error::` der
fejler CI. Aktiveres via `MIGRATION_GATE_STRICT=true` env var i CI.
…
### Klassifikations-registry
… (til og med) hver indgang skal opfylde, og flytter registryet til en DB-tabel.
```
NY:
```
`scripts/migration-gate.mjs` parser hver migration, finder kolonner
fra `CREATE TABLE` og `ALTER TABLE ADD COLUMN`, og tjekker at hver har
en klassifikations-række (`INSERT INTO … data_field_definitions` i
migrationerne). Gaten tjekker kun at rækken findes, ikke værdierne —
værdierne styres i UI (Mathias' låste UI-konfig-regel, migration-gate.mjs l.10-13).

**Phase 2 (strict) kører i CI** (`MIGRATION_GATE_STRICT=true`, `ci.yml`):
en uklassificeret kolonne fejler CI. Lokalt uden variablen: kun warning.

Gaten ser ikke DDL der bygges dynamisk med `EXECUTE format(...)` (G082).

### Klassifikations-registry

`supabase/classification.json` er en tom overgangsfil (`"columns": {}`).
Sandheden er `core_compliance.data_field_definitions` i databasen.
```
Bevis: `migration-gate.mjs` l.1-13; `classification.json` (`$comment` + tom `columns`); `ci.yml` l.100-103.

**SR-9 · l.428-443 (typer + schema-snapshot)**
NUVÆRENDE:
```
Placeholder-Database-typen blev pre-genereret i B1. Når første
migration lander, kør `pnpm types:generate` lokalt og commit.
…
Indtil første pull er filen en placeholder med marker — CI's
schema drift check springer over til filen er populated. Det betyder
første migration's PR SKAL include en opdateret schema.sql.
```
NY:
```
`packages/types/src/database.ts` er genereret for `public`,
`core_identity`, `core_compliance` og `core_money` (`scripts/types-gen.sh`).
Efter en migration: kør `pnpm types:generate` og commit.
…
`supabase/schema.sql` er stadig en pladsholder, og `schema:pull`
dumper kun `public`. CI's »Schema drift check« tjekker derfor intet
i dag (G078) — det gøres reelt eller fjernes i pakke 1, trin 2.
```

**SR-10 · l.445-449**
NUVÆRENDE:
```
## Edge functions

Edge functions lever i `supabase/functions/<name>/index.ts`. Lag B
introducerer skabelon + disciplin (Deno-runtime, error-handling,
audit-integration).
```
NY:
```
## Ny tabel eller RPC i fundamentet — tjekliste

CI håndhæver det meste, men det står kun her samlet:

- `dedup_key`-kolonne eller `-- no-dedup-key: <grund>` (fitness `dedup-key-or-opt-out`)
- audit-trigger eller post i `AUDIT_EXEMPT_SNAPSHOT_TABLES` (fitness `audit-trigger-coverage`)
- klassifikation af hver kolonne i samme migration (migration-gate, strict)
- SECURITY DEFINER-funktion: post i `SECDEF_SANCTIONED` (fitness `secdef-marker-discipline`) og `supabase/advisor-baseline.json` med begrundelse (fitness `advisor-baseline`)
- Postgres giver EXECUTE til PUBLIC som default: `revoke execute … from public, anon` og derefter eksplicit `grant execute` til den rolle der skal kalde
- nyt permission-area/page/tab: seed grant til superadmin eksplicit — seedet i `20260518000010_t9_seed_owners.sql` (l.199) dækkede kun de areas der fandtes dengang
- ny `change_type` i pending-flowet: udvid `pending_changes_select`, ellers kan godkendere ikke se den
- regenerér typer (`pnpm types:generate`)
- skrivning kun via SECURITY DEFINER-RPC (ingen direkte grants, fitness `app-write-revoke-discipline`)

Der findes ingen edge functions i repoet.
```
Bevis: fitness l.17-18, 130, 1535, 1746-1761, 1728; `20260518000010_t9_seed_owners.sql` l.199; implementeringsplanen @ 87a877b l.105 (»Postgres giver EXECUTE til PUBLIC som default …«); recon.md:629, 722 (H V5, V6, V8).

### 5.3 `scripts/README.md` (hele filen, ny tekst; skrives når §4.5-fjernelserne er gjort)

NUVÆRENDE: hele filen (l.1-24; 4 scripts, 5 fitness-tjek).
NY:
````markdown
# scripts/

Disciplin-mekanismer der køres lokalt og i CI.

| Script                                     | Formål                                                                                                                                                                                             | Aktiveres                                                  |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `types-gen.sh`                             | Type-codegen for eksponerede API-schemas (`public,core_identity,core_compliance,core_money`). `--write` regenererer `packages/types/src/database.ts`; `--check` verificerer drift mod remote.        | `pnpm types:generate` / `pnpm types:check`                 |
| `schema-check.sh`                          | Drift mod `supabase/schema.sql`. **Tjekker i dag intet:** filen er en pladsholder, og dumpet dækker kun `public` (G078).                                                                          | `pnpm schema:check`                                        |
| `migration-gate.mjs`                       | Hver ny kolonne skal have en klassifikations-række. Strict (`MIGRATION_GATE_STRICT=true`) i CI.                                                                                                    | `pnpm migration:check`                                     |
| `fitness.mjs`                              | 28 arkitektoniske invarianter (tabellen nedenfor). `fitness.selftest.mjs` er negativ-test af dem.                                                                                                  | `pnpm fitness`                                             |
| `run-db-tests.mjs`                         | Kører `supabase/tests/**` mod databasen. Rammer i dag driftsprojektet (G047).                                                                                                                       | `pnpm db:test`                                             |
| `scope-cleanup-patterns.txt`               | Mønstre for cutover-blocker #7.                                                                                                                                                                    | `pnpm scope:check`                                         |
| `migration/employees/`                     | Skabeloner til udtræk fra 1.0 (TODO-markører, H006/G007).                                                                                                                                          | manuelt                                                    |
| `v5/`                                      | Byggetjekket og Codex-indpakningen (afsnittene nedenfor).                                                                                                                                          | CI (byggetjekket i samle-tjekket) / manuelt               |

## Fitness checks

Live-tjek (markeret *live*) spørger databasen via Supabase Management API. De nyere er fail-closed i CI (manglende token/API-fejl = rødt); fire ældre kan stadig give grønt uden at have kørt (G006).

| Check                                   | Hvad fanger den                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `no-ts-ignore`                          | Brug `@ts-expect-error` i stedet                                                                  |
| `eslint-disable-justified`              | Hver `eslint-disable*` skal have `-- begrundelse`                                                 |
| `migration-naming`                      | `supabase/migrations/<14digits>_<snake_case>.sql`                                                 |
| `workspace-boundaries`                  | `packages/*` må ikke importere fra `@stork/web`                                                   |
| `no-hardcoded-supabase-urls`            | Supabase-URLs fra env-variabel, ikke hardkodet i `apps/web/src/`                                  |
| `migration-set-config-discipline`       | Migrationer der muterer data, sætter `stork.source_type` + `stork.change_reason` først            |
| `dedup-key-or-opt-out`                  | Ny tabel har `dedup_key` eller `-- no-dedup-key: <grund>`                                         |
| `truncate-blocked-on-immutable`         | Immutable tabeller blokerer også TRUNCATE                                                         |
| `cron-change-reason`                    | `cron.schedule()`-bodies sætter `stork.change_reason`                                             |
| `audit-trigger-coverage`                | Hver core_*-tabel har audit-trigger eller står i `AUDIT_EXEMPT_SNAPSHOT_TABLES`                   |
| `migration-on-conflict-discipline`      | Bootstrap-INSERT i klassifikations-/konfig-tabeller er idempotente (ON CONFLICT)                  |
| `db-rls-policies` *live*                | RLS + 0 policies kræver `-- skip-force-rls:`/`-- default-deny:`-markør                            |
| `write-policy-session-var-consistency` *live* | Write-policies har session-var-form                                                          |
| `legacy-is-active-readers` *live*       | Læsere af `is_active = true` tjekker også `status = 'active'`                                     |
| `db-test-tx-wrap-on-immutable-insert`   | Tests der indsætter i immutable tabeller, kører i BEGIN/ROLLBACK                                  |
| `db-test-no-disabled-sql`               | `.sql.disabled` må ikke merges                                                                    |
| `db-test-no-t9-seed-user-fixtures`      | `t9_*.sql` bruger ikke seed-brugerne som mutable fixtures                                         |
| `db-test-no-t9-skip-guards`             | `t9_*.sql` har ingen skip-guards                                                                  |
| `postgrest-t9-schema-exposure` *live*   | core_identity er eksponeret via PostgREST (OpenAPI) — spørger i dag driftsprojektet (G077)        |
| `immutability-trigger-coverage` *live*  | Guard-triggeren dækker både UPDATE og DELETE                                                      |
| `snapshot-field-protection` *live*      | Snapshot-felter er beskyttet; kun det tilladte flag-sæt kan ændres                                |
| `schema-ownership` *live*               | Ingen Stork-tabel i `public`                                                                      |
| `cross-schema-fk-discipline` *live*     | Cross-schema-FK fra core_* rammer allowlist-mål                                                   |
| `fk-coverage` *live*                    | Hver `*_id`-reference på core_* har FK, er PK, er exempt eller `FK_PENDING`                       |
| `index-per-policy` *live*               | Hver policy-prædikat-kolonne er ledende i et btree-indeks                                         |
| `secdef-marker-discipline` *live*       | Hver SECURITY DEFINER-funktion er trigger-funktion eller står i `SECDEF_SANCTIONED`               |
| `app-write-revoke-discipline` *live*    | App-roller har ingen direkte INSERT/UPDATE/DELETE/TRUNCATE på core_*                              |
| `advisor-baseline` *live*               | Supabase-advisor-fund matcher `supabase/advisor-baseline.json` (nye = rødt)                       |

Tilføj en ny check: implementér en async function i `scripts/fitness.mjs`
der returnerer `{ name, violations: string[] }`, og push den til
`checks`-array'et nederst i filen. Nye live-tjek bruger `liveGuard()`.

## Byggetjekket (`scripts/v5/`)

Byggetjekket dømmer at en pakkes kode består Codex' tests og mutant-prøven. Det er
ét CI-job i det krævede samle-tjek `Lint, typecheck, test, build` med fire tjek
(`docs/strategi/disciplin.md` §2 trin 3):

1. **Testene er grønne** mod en frisk database: Postgres-service (supabase-image) +
   PostgREST; migrationerne anvendes i rækkefølge, fejl = stop.
2. **De udpegede mutanter er dræbt:** mutant anvendes → alle target-tests fejler →
   kontrol-tests består → restore → alt grønt igen. Først da tæller den som dræbt.
3. **Intet låst er ændret:** planen, testene, manifestet
   (`forventnings-manifest.json`), testindekset (`angrebs-spec.json`, der også vælger
   mutanterne) og testvalg-filen (`prover.json`).
4. **Planen og kørselsfladen er dem Mathias' `plan ok` og den grønne dækningsdom bandt:**
   `plan ok`-posten i ledgeren `docs/sandhed/mathias-ord.md` bærer planens blob-OID;
   dækningsdommen bærer blob-OID'erne for testene, manifestet, testindekset og
   `prover.json`.

- **Test uden forventning = vakuum = rød.** En test der dækker et negativ, skal
  have kaldt `forvent.afvist(…, netop det negativ)`.
- **Kendte grænser:** G073 (intet gældende Codex-pas), G074 (runnerens
  tillidsgrænser), G075 (`prover.json` i produkt-zonen).

## Codex-indpakningen (`scripts/v5/codex-run.sh`)

Codex kaldes kun gennem indpakningen:

- **Eget Codex-hjem:** CLI'en får en privat `CODEX_HOME` med kun en kopi af
  `auth.json` og ingen `config.toml`. Brugerens `~/.codex/config.toml` læses
  aldrig — gyldig TOML kan omdirigere til en anden udbyder/profil/sandbox.
- **Miljø som allowlist** (`env -i`: HOME, PATH, LANG, CODEX_HOME, CODEX_MANAGED_*).
- **Sandbox-politikken sættes eksplicit pr. kald**: `network_access=false`,
  `/tmp` og `$TMPDIR` ikke skrivbare, kun workdir. (Lærdom 2026-09-10: den
  lokale config havde `network_access=true`, så kørsler havde netværk trods
  »web forbudt«.)
- **Kun-læse ved domme** (`--sandbox read-only`); skrivning kun når rollen
  skriver tests.
- Model og effort gives af fabrikken i kaldet (ingen model-pins); rolleteksten
  læses fra `scripts/v5/roller/<rolle>.md`. Stdin lukket (`< /dev/null`).

## Styret klokke (FA-3) — opskrift

Verificeret lokalt 2026-09-23 mod `supabase/postgres:17.6.1.121`:

- `libfaketime.so.1` = wolfcw/libfaketime master `9fdda43` bygget i
  `debian:bookworm-slim` (glibc 2.36). Ubuntu-pakken 0.9.10 crasher mod nix-glibc 2.39.
- Container-start (som root, før entrypoint): `apk add --no-cache busybox-static`;
  `/bin/sh` → `busybox.static` (popen-børn af postgres bliver immune for LD_PRELOAD);
  pgsodium-nøglen skrives og `pgsodium_getkey.sh` peger på den; `postgres` og
  `pg_ctl` wrappes med `LD_PRELOAD=/ft/libfaketime.so.1 FAKETIME_TIMESTAMP_FILE=/ft/faketime.txt FAKETIME_NO_CACHE=1 FAKETIME_DONT_FAKE_MONOTONIC=1`.
- `faketime.txt` (skrivbar for testene) = `@2026-04-01 00:00:00` fra start; uret
  flyttes kun fremad. Planlagte jobs testes ved at sætte uret lige før (fx 02:29:50).
- Verificeret: `now()`/`current_date` følger uret, pg_cron fyrer hvert fake-minut,
  `pg_sleep`/`statement_timeout` er reelle, pgsodium/vault/roller virker.
- Ikke dækket endnu: PostgREST/JWT-tiden (pakke 1, trin 2).

## Driftslærdomme (headless Claude/Codex-kørsler)

- Luk stdin (`< /dev/null`) — ellers hænger kørslen.
- Stop kørsler via PID-fil, aldrig brede `pkill`-mønstre.
- WSL2-dvale fryser også det monotone ur; en kørsel der »står stille«, kan være frosset.
- Claude Code nægter at skrive under `~/.claude/` (»sensitive file«): brug workdir udenfor.
- En leverance er alle tekstblokke, ikke kun den sidste besked.
````
Bevis: fitness l.1808-1837 (28 checks) og kommentarerne ved hver funktion; `schema-check.sh` l.11-14, 19; `run-db-tests.mjs` l.15; byggetjekkets fire tjek: workflow-planen §4.1 trin 3 og ændringslisten S1 (den gamle to-zone-form: `v5-build-dom.yml` l.5-8, 20-25, 40-41, 65, 81, 92-99 @ 87a877b); model og effort: S9 (§8.3); implementeringsplanen @ 87a877b l.341, 344; `codex-run.sh` l.175-189, 222-225, 288-294; `~/.local/share/stork-v5/faketime/RECEPT.md`; `drift-log.md` l.5-6, 44-45, 56, 74.
*Forudsætning:* rækken `v5/` beskriver det der bliver efter §4.5. Fjerner ombygningen i 4.1 trin 3 et navn, rettes det i samme ændring.

### 5.4 `.github/BRANCH_PROTECTION.md` (hele filen, ny tekst)

NUVÆRENDE: hele filen (l.1-170).
NY:
````markdown
# Branch-protection — main

Repoet `Cphsales/stork-2.0` ejes af en organisation og er offentligt.

## Aflæst tilstand (2026-09-24, med bot-token)

| Indstilling                      | Værdi                                                             | Kilde                                   |
| -------------------------------- | ----------------------------------------------------------------- | --------------------------------------- |
| Beskyttelse aktiv                | ja                                                                | `gh api …/branches/main` → `protection.enabled` |
| Krævet status-check              | `Lint, typecheck, test, build` fra GitHub Actions (app 15368)     | `required_status_checks.checks`         |
| Håndhæves for                    | alle (`enforcement_level: everyone`)                              | samme                                   |
| Krævede godkendelser             | **ikke aflæst** (403) — PR #172 blev merget med 0 reviews         | `gh pr view 172`                        |
| Code-owner-review                | **ikke aflæst** (403)                                             |                                         |
| `enforce_admins`                 | **ikke aflæst** (403)                                             |                                         |
| Botten `stork-code-bot`          | `admin` på repoet                                                 | `gh api …/collaborators`                |

De tre ikke-aflæste punkter aflæses med et admin-login (huskeliste H030) og
skrives ind her.

## Hvad spærringen før drift hviler på

Det krævede check `Lint, typecheck, test, build` er samle-jobbet i
`.github/workflows/ci.yml`. Byggetjekket og slutdommen lægges ind i det (workflow-planen §2),
og det afviser en pakke-PR uden Mathias' `slut ok` for slut-rapporten og den prøvede
kodeversion i ledgeren, eller hvis PR'ens kode ikke længere er den prøvede version
(`docs/strategi/disciplin.md` §6); et manglende eller oversprunget check tæller som rødt. Mathias rører ikke GitHub —
hans godkendelse er hans ord (`krav ok` · `plan ok` · `slut ok`), ikke et klik.

## Aflæs reglen (kræver admin-login)

```bash
gh api /repos/Cphsales/stork-2.0/branches/main/protection \
  | jq '{
      linear_history: .required_linear_history.enabled,
      force_push: .allow_force_pushes.enabled,
      deletions: .allow_deletions.enabled,
      enforce_admins: .enforce_admins.enabled,
      required_checks: .required_status_checks.contexts,
      required_reviews: .required_pull_request_reviews.required_approving_review_count,
      code_owner_reviews: .required_pull_request_reviews.require_code_owner_reviews
    }'
```

## Røgtests (skal alle afvises)

```bash
git switch main && git pull
git commit --allow-empty -m "branch-protection smoke test"
git push origin main             # forventet: GH006 Protected branch update failed
git reset --hard HEAD~1
git push origin main --force     # forventet: remote rejected (force push)
git push origin --delete main    # forventet: remote rejected (deletion)
```

## Historik

- **gov-4 (2026-06-10):** reglen blev sat med 1 krævet godkendelse +
  code-owner-review + `enforce_admins` (tre-konto-strukturen, H026). Om det
  stadig er den live regel, er ikke aflæst; PR #172 (17/6) blev merget med 0 reviews.
- gov-4-konfigurationen (JSON til `PUT …/protection`) ligger i git-historikken
  (denne fil @ `87a877b`).
````
Bevis: `gh api repos/Cphsales/stork-2.0` → `owner.type: Organization`, `visibility: public`; `…/branches/main` → `enabled: true`, `checks[{app_id: 15368, context: "Lint, typecheck, test, build"}]`, `enforcement_level: everyone`; `…/protection` → 403; `gh pr view 172` → `reviews: 0`, `mergedBy: stork-code-bot`; `ci.yml` l.153 (jobnavnet). De gamle linjer, der modsagde hinanden (l.13 »1« mod l.163-164 »0«), og »personlig konto/private repos« (l.3, 26-27) er væk.

### 5.5 `.github/CODEOWNERS` (4.1 trin 6)

**CO-1 · l.12-36** (begge ejerløse blokke)
NUVÆRENDE: l.12-36, fra `# Rolle-valideret bogførings-flade (gov-5 P3, Mathias-ratificeret ved qwerg V21` til og med `docs/coordination/*-recon-oplaeg.md`.
NY: *(slettes)*
Bevis: kæden de begrunder, er død (`systemctl --user is-enabled stork-kaede` → disabled). l.27 `docs/coordination/*-krav-og-data.md` gjorde din workflow-kravfil ejerløs. Efter 4.1 trin 5 findes ingen fil under `docs/coordination/`.

**CO-2 · l.44-47**
NUVÆRENDE:
```
# Disciplin-mekanismer (lag B kommer) — kræver ekstra opmærksomhed
# /supabase/migrations/        @mgrubak
# /packages/core/              @mgrubak
# /.github/                    @mgrubak
```
NY: *(slettes — døde kommentarer; planen indfører ingen ny ejerregel)*
Filen består herefter af l.1-10 (default `* @mgrubak`) og l.38-42 (de fire låste dokumenter), uændret.

### 5.6 Ledgeren `plan-build/lokations-skabelon/mathias-ord.md` → `docs/sandhed/mathias-ord.md` (dit dokument)

**LG-1 · regel-hovedet, l.3-6**
NUVÆRENDE:
```
Regler (plan DEL IV + 2.F): append-only · tidsstemplet · VERBATIM (stavefejl
bevares — `[sic]` markeres ikke; parafrase deklareres eksplicit) · committes af
driveren ved hvert ord · krav/plan CITERER ord-id (K-n → M-n). Et ord uden
ledger-entry kan ikke bære et krav.
```
NY:
```
Regler (jf. `docs/strategi/disciplin.md`): append-only · tidsstemplet · VERBATIM
(stavefejl bevares — `[sic]` markeres ikke; parafrase deklareres eksplicit) ·
committes ved hvert ord af den session der modtog det · krav/plan CITERER ord-id
(K-n → M-n). Et ord uden ledger-entry kan ikke bære et krav. Er ordet en
godkendelse (`krav ok` · `plan ok` · `slut ok`), står blob-OID for præcis den
fil Mathias så, i kontekst-feltet; ved `slut ok` også den prøvede kodeversion
(commit), som slutprøven, Codex' samlede gennemgang og byggetjekket kørte på. Én ledger for hele Stork: M-numrene fortsætter
på tværs af pakker, og kontekst-feltet nævner pakken. Ledgeren slettes aldrig.
```
Bevis: »plan DEL IV + 2.F« er implementeringsplanen, som afløses; der er ingen driver i det nye workflow; workflow-planen §2 (»ledgeren gemmer hvert ord med en reference til præcis den fil du så«; »Én ledger og én ordbog for hele Stork«) og §4.2 (»plus ledgeren, som altid bliver«); ændringslisten H3, H5. Titellinjen l.1 `# mathias-ord — lokations-skabelon (append-only ledger)` → `# mathias-ord — Stork 2.0 (append-only ledger)` i samme ændring som flytningen (§8.6).

**LG-2 · statusblokken, l.27-32**
NUVÆRENDE:
```
## Afventer verbatim (må kun leveres af den session der modtog dem)

Fra mathias-78 (modtaget dér 2026-09-02/03, hidtil kun som parafrase):
de 7 svar fra spørgerunden — »stande-model«-svaret · »forstår ikke« ×2 ·
»styres i retigheder« · »den skal væres åben« · »hvad menes der med aftaler? …«
(+ fuld kontekst pr. svar). Tilføjes som M-23+ når de leveres ordret (M-17..M-22 = runde 2 nedenfor).
```
NY:
```
## Afventer verbatim — opfyldt

De 7 svar fra spørgerunden 2026-09-02/03 er leveret ordret som M-23..M-30
(afsnittet »Spørgerunden« nedenfor); intet afventer.
```
Bevis: M-29 (l.55) indeholder »1. hvis vi skal gøre det korrekt …« (stande-model), »2 forstår ikke«, »4 forstår ikke« og »5 styres i retigheder«; M-30 (l.56) indeholder »2. den skal væres åben« og »4 hvad menes der med aftaler?«.

**LG-3 · nyt afsnit sidst i ledgeren (append-only; ingen eksisterende række ændres)**
NY:
```
## Ordlyd uafklaret (tilføjet <dato>, workflow-planen §4.3)

To ord har en anden ordlyd i andre kilder. Rækkerne ovenfor er ikke ændret; Mathias retter dem, hvis han vil.

- **M-46** — ledgeren: »vi overkompliserer opgaven — det kan ikke være rigtigt at der bruges så meget tid på en simpel pakke« · implementeringsplanen (`docs/workflow-faerdiggoerelse/workflow-implementeringsplan.md` l.344, blob `8138afa8` @ `87a877b`): »Du skal løse at vi lige nu overkomplisere opgaven. det kan ikke være rigtigt at der bliver brugt så meget tid på en simpel pakke«
- **M-53** — ledgeren: »der går alt for langsomt — tjek for over-test« · implementeringsplanen (samme blob, l.105): »der går alt for langsomt — tjek grundigt for at vi over-tester« · Codex-prompten `docs/workflow-faerdiggoerelse/p2-haerdning-2026-09-09/p2-c1-r6/prompt.txt` l.4 (blob `8a3e6880` @ `87a877b`): »der går alt for langsomt. Tjek grundigt for at vi over tester og dermed forsinker vores proces«
```
Bevis: citaterne er kopieret ordret fra de tre filer @ 87a877b (grep). M-53-rækken siger selv »kilde: fabrik-armens log«.

### 5.7 `plan-build/lokations-skabelon/ordbog.md` → `docs/sandhed/ordbog.md`: hovedet (4.1 trin 2, samme ændring som plan v3.8)

**OB-1 · l.3-6**
NUVÆRENDE:
```
Regler (plan Fase 1/B3): al Mathias-flade bruger HANS ord; planen/koden ARVER
navnene eller mapper eksplicit her — en navne-afvigelse uden ordbogs-entry er
en FAIL ved plan-gaten. Vedligeholdes af driveren; kandidater høstes af
recon-Claude.ai (fra pakke 2) og af krav-dialogen.
```
NY:
```
Regler (ordbogen arves, Mathias 2026-09-03 — jf. `docs/strategi/disciplin.md`):
al Mathias-flade bruger HANS ord; planen/koden ARVER navnene eller mapper
eksplicit her — en navne-afvigelse uden ordbogs-entry er en fejl, som Codex
fanger, når den læser planen. Én ordbog for hele Stork; hver pakke tilføjer sine
navne, og den slettes aldrig. Planens rækker skrives af Code — planner og bygger;
kandidater høstes i krav-dialogen.
```
Bevis: `scripts/v5/roller/planner-code.md:78-83` (»Pakke-ordbogen arves (B3, Mathias 2026-09-03)«); plan-gaten og recon fjernes (§4.5); én plan-læser (S2); én ordbog (H5). Ordbogens rækker røres ikke. Titellinjen l.1 `# ordbog — lokations-skabelon (Mathias' ord ↔ systemord)` → `# ordbog — Stork 2.0 (Mathias' ord ↔ systemord)` i samme ændring som flytningen (§8.6).

### 5.8 `launch.json` rettes; `krav-approval.json` og `plan-approval.json` fjernes (S5)

Alt sker i 4.1 trin 3, i samme ændring som den gamle port fjernes.

**`launch/launch.json`**: feltet `"author": "mgrubak"` fjernes (botten skrev det, ikke Mathias). Resten er uændret:
```json
{
  "anker": "docs/strategi/stork-2-0-master-plan.md · §4 trin 10b — Lokations-skabelon (indhold: §1.12)",
  "anker_sha": "e6c9a715b81b8d9b069f36ae77a798186dabcde1",
  "pakke": "lokations-skabelon"
}
```
Bevis: kun `.pakke` læses af koden (`ci-build-dom.mjs` l.83 m.fl.; grep `author` i scripts/v5: 0).

**`plan-build/lokations-skabelon/plan-approval.json` og `krav-approval.json`**: fjernes. Ledgeren er eneste kilde til dine ord (S5): ordet står ordret med blob-OID for den fil du så, i kontekst-feltet (LG-1). Hooken og byggetjekket læser ledgeren. Ingen ny form skrives; det der skal bevares, står allerede i ledgeren:
- `krav ok`: M-38 (l.89) »krav ok«; kontekst-feltet: »binder mod krav-blob 9402164d @ upload-commit efc85d5«. Det fulde OID `9402164d87a35fb939661058bea77c1a052493d0` er blobben af `docs/sandhed/krav/lokations-skabelon-krav.md` @ 87a877b.
- `plan ok` til v3.5: M-45 (l.99); kontekst-feltet: »plan v3.5 blob `289b8761`«.
- `plan ok` til v3.8 (4.1 trin 2): ny ledger-post med `plan.md`'s blob-OID. `plan-approval.json` opdateres ikke: den gamle port læser den (`plan-gate-run.mjs` l.50), men dens check `v5/gate/plan` er ikke et krævet check — kun `Lint, typecheck, test, build` er krævet (§5.4) — og porten fjernes i 4.1 trin 3, før noget bygges.

De fejlagtige felter (`login_server_verified`, `scope_digest`, `prerequisite_digests`, `kvittering_digest`, `verdikt_run_ids`, `pinned_commit`, `kvittering_commit`, `kvittering_frosset`) forsvinder med filerne. Samme ændring fjerner `gates.mjs:39-40` (digest-binding + HISTORISKE_UNDTAGELSER), jf. bilaget R4.
Bevis: nuværende filer l.1-21 hhv. l.1-28; ledger M-38 (l.89) og M-45 (l.99); `.github/workflows/v5-build-dom.yml` l.9 (»Nået = plan-approval.json + angrebs-spec.json findes«) — den linje forsvinder med omlægningen (S1).

### 5.9 `docs/teknisk/permission-matrix.md`

Filen regenereres fra databasen, når ændringen laves. Tallene kan kun aflæses den dag, så RPC-tabellen skrives ikke her. Den faste tekst:

**PM-1 · l.3** `<!-- governance-owns: rpc-side-mapping -->` → *(slettes sammen med governance-tjekket)*

**PM-2 · l.5**
NUVÆRENDE: `**Auto-genereret fra live DB introspection 2026-05-15** efter R-runde-2 (R7a-R7d + R7c verify_anonymization_consistency-konvertering).`
NY: `**Auto-genereret fra live DB introspection <dato>** (\`pg_proc\` i \`core_identity\`, \`core_compliance\`, \`core_money\`; samme mønster-søgning som \`supabase/tests/smoke/m1_permission_matrix.sql\`).`
*(i filen uden backslashes)*

**PM-3 · l.9-20 og RPC-tabellen** → genereres: antal RPC'er, fordeling `has_permission` / `has_permission_action` / `is_admin`, og én række pr. RPC.

**PM-4 · l.78-80**
NUVÆRENDE:
```
## Q-SEED konsistens (verificeret PASS via m1-test)

Hver (page_key, tab_key) i tabellen ovenfor har matching row i `core_identity.role_page_permissions` for superadmin-rolle med `can_view=true`. Auto-verificeret 2026-05-15 — ingen missing-violations.
```
NY:
```
## Superadmin-dækning (verificeret via m1-test)

Hver (page_key, tab_key) i tabellen ovenfor er dækket for superadmin i `core_identity.role_permission_grants` (tab-, page- eller area-grant med `can_access=true`). Verificeret <dato> af `m1_permission_matrix.sql`.
```

**PM-5 · l.82-90 (lifecycle-tabellen)**: tallene aflæses på ny ved regenereringen; linjen »**Aktivering kræves pre-cutover** (Mathias Problem 4-afgørelse). …« bliver uændret.

**PM-6 · l.92-99**
NUVÆRENDE:
```
1. Skriv RPC med `has_permission(page, tab, can_edit)`-check (eller dokumentér `is_admin()`-undtagelse i G-nummer)
2. Tilføj seed-row til `core_identity.role_page_permissions` for superadmin via ON CONFLICT DO NOTHING
3. `smoke/m1_permission_matrix.sql` fanger missing-rows på næste CI-run
4. Regenérer denne fil ved at køre `pg_proc`-introspection mod live DB og opdatere RPC-tabellen ovenfor manuelt
```
NY:
```
1. Skriv RPC med `core_identity.has_permission(page, tab, can_edit)`-check (eller dokumentér `is_admin()`-undtagelse i G-nummer)
2. Seed grant til superadmin i `core_identity.role_permission_grants` i samme migration via ON CONFLICT DO NOTHING — også for et nyt permission-area/page/tab (det gamle seed dækkede kun de areas der fandtes dengang)
3. `smoke/m1_permission_matrix.sql` fejler på næste CI-run, hvis superadmin mangler grant
4. Regenerér denne fil ved `pg_proc`-introspection mod live DB
```
Bevis: `role_page_permission_upsert` er revoked (`20260518000009_t9_migrate_role_page_permissions.sql` l.226-228), de gamle rækker er slettet (`20260521000014_t10_remove_legacy_permissions.sql`); m1-testen l.4-7, 48-60 tjekker `role_permission_grants` med `can_access`; `t9_seed_owners.sql` l.199.

---

## 6. Indhold der flyttes, før filer fjernes (bilaget §2)

Dine egne ord står allerede ordret i ledgeren, som bliver (bilaget §3, NB: alle M-ord i de fjernede filer er fundet i ledgeren; undtagelsen er M-46/M-53 → LG-3). Tabellen viser hvad der ellers skal flyttes, hvorhen, og hvilken rettelse ovenfor der bærer det. Det der skal ind i `disciplin.md` eller plan v3.8, skrives dér af andre. Kildeteksten står her, så den ikke tabes.

| # | Fra (@ 87a877b) | Til | Bæres af |
|---|---|---|---|
| V1 | `scripts/v5/roller/claude-ai.md` l.61-141: afled-før-spørg, BORD-TESTEN, ÉT-SKRIDTS-REGLEN, FORM-KRAV 1-4, »Antag ALDRIG«, upload ≠ krav OK, fremlæggelses-pligt | `disciplin.md` trin 1 | disciplin-teksten. Dine ord bag dem står i ledgeren: M-6 »Det er vigtigt at jeg bliver præsenteret for krav-doc'en inden ok, og at den står overskueligt og i mit sprog.« · M-32 »Hvorfor kommer der konstant nye spørgsmål og er de relevante for det vi bygger nu?« · M-33 »ja undtagen nummer 3« · M-34 »godt, nu skal jeg præsenteres for krav doc og efter det kan jeg godkende det. ingen grund til først at godkende upload for derefter at skrive ok det man lige har godkendt.« |
| V2 | `scripts/v5/roller/planner-code.md` l.78-83 »Pakke-ordbogen arves (B3, Mathias 2026-09-03)« | ordbogens hoved + `disciplin.md` §2 trin 2 (én ordbog, H5) | OB-1 |
| V3 | `scripts/kaede/claude-ai-rolle-instruks.md` l.14-20 »Gate-læringerne (TILLÆG 1 — Mathias 2026-06-11; METODEN er bindende)« | `disciplin.md` trin 4 | disciplin-teksten. Kildeteksten (AI's gengivelse af din metode): »1. Krav-dok læses SÆTNING FOR SÆTNING mod planen/leverancen … Hver krav-sætning: realiseret, eksplicit begrundet afgrænset, eller FUND. 2. Formålet læses FØRST. … 3. Kravets MENING, ikke ord-match. … 4. Leverancen DEKLARERER sit grundlag … 5. ALDRIG fuldstændigheds-garantier. … 6. Stikprøver flages som stikprøver.« |
| V4 | kortlægningen (`docs/workflow-faerdiggoerelse/workflow-faerdiggoerelse-forloeb-kortlaegning.md`) + implementeringsplanen: M1 »spørg ved uklarhed — antag ALDRIG (Mathias)« (kortl. l.48, implplan l.40) · M2 »IKKE nettet (Mathias): web i recon skaber forvirring + nye forkerte sandheder« (kortl. l.82) · M3 »større issue = gæld (løses KORREKT senere, ikke hurtigt/hacket) · mindre = bilag« (kortl. l.224) · M4 »TOP-TIL-TÅ: kode = Mathias' sandhed (Mathias 2026-06-19)« (kortl. l.271) og »Grøn = reel konsekvens, aldrig påstand« (l.22) · M6 »sandheds-docs (vision+forretning) rettes ALDRIG« (l.289) · M7 »Mathias rører aldrig GitHub-UI« (implplan l.306) · M8 »Valg af masterplan-trin = Mathias' bord (mindst muligt trin først …)« (implplan l.8) | `disciplin.md` | disciplin-teksten. Citaterne er kildens gengivelse (AI-skrevet, tilskrevet dig), ikke ledger-ord. M5 (build OK), M9 (L1-L3) og M10 vendes af planen (§5) og flyttes ikke. |
| V5 | `p2-transport/prompt.txt` l.7: M-41 princip 7 »rollen bestemmer kaldet«, V-8 »sandbox efter aktivitet« | — | Bortfalder (planens §5). »Kun-læse ved domme« bevares i Codex-indpakningen (§5.3). |
| V6 | implementeringsplanen l.105: D10 »hvert negativ med eneste-værn kræver ≥1 dræbt mutant på netop det værn der rammer netop det negativ + K-gulv« · D12 »bids skelner forudsætning/effekt … hver forudsætning bæres af et effekt-bid« | `disciplin.md` (testene) | disciplin-teksten (D12 gælder kun pakke 1, S3); dit ord: M-40 »godt, jeg vil have al der vurderes som forbedring integreret« |
| V7 | `scripts/v5/codex-run.sh` l.175-189, 222-225, 288-294 | `scripts/README.md` | §5.3 »Codex-indpakningen« |
| V8 | p2-runde10 / F-3g (shim vs. native) | huskeliste | H031 |
| V9 | implementeringsplanen l.339-344 + `OUT-c4b*.md` | `scripts/README.md` | §5.3 »Byggetjekket« |
| V10 | implementeringsplanen l.105, 341; `OUT-c4b*`, `OUT-c1-r8` | teknisk gæld | G074, G076 |
| V11 | `scripts/v5/haerdet-register.json` (kandidat-status) | teknisk gæld | G073 |
| V12 | `c1-integration/*.log` + `build-harness.integration.mjs` (transport-fælder) | ny pg-runner-test | pakke 1 trin 2 (kode, ikke tekst) |
| V13 | `fold-ind-instruks-v38.md` pkt. 45 (G001) | plan v3.8 + manifest | planneren; gældende kilde t10 l.43-50 (TG-13) |
| V14 | `~/.local/share/stork-v5/workflow-undersoegelse/gh-disposition-pakke1.md` | plan v3.8 (planen disponerer G/H, §2 trin 2) | planneren. NB: G046 er nu lukket (TG-9), ikke »tages med« |
| V15 | `provenance/angrebs-tests-pas1.leverance.md`, `angrebs-kontraktbehov.leverance.md`, `fund-log.md:445` | Codex' brief til pas 2 + teknisk gæld | G077 (LIB-RACE, LIB-HTTP, #10, HALT-FA3). Plan.md binder de to leverancer som input: de fjernes først, når v3.8 er bundet (4.1 trin 4) |
| V16 | plan-slutlaesning r6-r8, plan-verdikt-claude-ai | plan v3.8 + låsen | planneren; R6-2 = G075 |
| V17 | `recon/recon.md`, `recon2.md` (H V1-V8) | teknisk gæld + `supabase/README.md` | G072, G078, G081, G082 + SR-10 (tjeklisten); V3 = G047 |
| V18 | `docs/teknisk/doc-redegoerelse.md` B1/B2 (l.106-107), RAMME (»RAMME (Mathias 2026-06-15)«, l.13-24), B4 (l.109, 284-287) | B1/B2 → masterplanen · RAMME → bortfalder · B4 → masterplanen Del C | B1 (retention-enum) og B2 (match-rolle): `masterplan-rettelser.md` A5. RAMME bortfalder (ændringslisten S10): ordlyden er en bots (`e5ca450`, PR #158; overskriften tilskriver dig rammen), og indholdet dækkes af `disciplin.md` §4 »Én bevarings-politik … én sandhed« (dit juni-krav 8) og §8-tabellen, jf. `disciplin-ny.md` Del B.1. B4 (rolle på knude eller medarbejder): `masterplan-rettelser.md` Del C, C6. **Betingelse for sletning (4.1):** filen fjernes først, når de to tekster er lagt ind. |
| V19 | `docs/foraeldet-workflow/arkiv/mathias-afgoerelser-historik.md` | `docs/strategi/` eller commit-henvisning | masterplan-rettelserne. Filen er ikke læst (forbudt); planens §4.4 tillader læsning kun for at redde indholdet |
| V20 | disciplin l.520 (Appendix C-spørgsmålet: »afklar om Appendix C's rettelses-historik hører i planen eller i historik«) | senere spørgsmål | `masterplan-rettelser.md` Del C, C9. **Betingelse for sletning (4.1 trin 1):** den gamle `disciplin.md` erstattes først, når C9 står i den godkendte tekst. |
| V21 | Lag E-noterne (`docs/teknisk/lag-e-*.md`) | bliver liggende i `docs/teknisk/` | §1.1: flyttes ikke; proveniensen kan ikke dokumenteres (`f40453b`, `1a88d7f` er Claude-medforfattet) |
| V22 | `fremlaeggelse-*.md` | ledgerens blob-OID-felt | LG-1. Fremover er fremlæggelsen filens egen tekst (H3), så der skrives ingen særskilte fremlæggelses-filer. De gamle fjernes først, når feltet findes (bilaget R13) |
| V23 | `provenance/plan-kvittering-v35.json` | ledgerens M-45-række | allerede der: M-45 nævner `4fdcef1` og digest `840c0fbb…` (l.99). Ingen ændring |
| V24 | pakke 1-planens arv-noter + fund-log NF-5 | teknisk gæld | G067-G071 |
| V25 | drift-log l.5-6, 44-45, 74; implementeringsplanen l.132 | `scripts/README.md` | §5.3 »Driftslærdomme« |
| V26 | IKKE-listen (grundplan-v2 l.136, implplan l.230) | `disciplin.md` | disciplin-teksten tager stilling |
| V27 | grundplan-v1 l.108-109, v2 l.124 | huskeliste | H032 |
| V28 | `OUT-c4b-r2.md` (manglende meta = tavshed) | samle-tjekket i `ci.yml` | 4.1 trin 3 (kode) + G074 (e) |
| — | klokke-opskriften `~/.local/share/stork-v5/faketime/RECEPT.md` | `scripts/README.md` | §5.3 »Styret klokke«. Binæren `libfaketime.so.1` committes ikke; den bygges efter opskriften i trin 2 |

---

## Åbne punkter

1. *(Løst i workflow-planen v39 §4.3, som nu siger »5 åbne huller«; G072 står som det særskilte GDPR-ansvarlig-felt.)* **»6 åbne huller i fundamentet«** (planens §4.3): kilderne (G3 §2.1, G2 U4, bilaget T5, `plan.md:846-851`) navngiver **fem** (G067-G071). Jeg har lagt `gdpr_responsible`-hullet (H V1) ind som G072, så der er seks poster, men ingen kilde kalder det et af »de seks«. Planens tal bør hedde 5 eller pege på G072.
2. *(Løst i workflow-planen v39 §4.3: »6 poster er løst … G006 er kun delvist løst … G046 og G018 er overhalet og lukkes«.)* **»7 løste poster«**: kilderne navngiver seks fuldt løste (G029, G036, G037, G038, G041, G058) + G006 som delvist løst; G046 lukkes særskilt. Teksten lukker de seks + G046 + G018 (overhalet), og G063 lukkes med governance-tjekket.

---

## 7. Tillæg: tests-README, cutover-checkliste og visionens hoved

### 7.1 `supabase/tests/README.md` (4.1 trin 6; l.24 igen, når test-databasen fra pakke 1 trin 2 findes)

**TR-1 · l.24**
NUVÆRENDE:
```
`BEGIN ... ROLLBACK` sikrer at side-effekter (employees, audit-rows, etc.) ikke persisterer i prod-DB. Hvis testen RAISE EXCEPTION'er → runner ser fejl → CI fejler.
```
NY:
```
`BEGIN ... ROLLBACK` sikrer at side-effekter (employees, audit-rows, etc.) ikke persisterer. Testene kører i dag mod driftsdatabasen (G047), så en test uden ROLLBACK efterlader data dér. Hvis testen RAISE EXCEPTION'er → runner ser fejl → CI fejler.
```
Bevis: `scripts/run-db-tests.mjs` l.15 (driftsprojektet er default); G047.

**TR-2 · l.30-35 (mapper)**
NUVÆRENDE:
```
- `smoke/` — happy-path admin-vej-tests
- `negative/` — RLS/permission blokering (verificer at uberettigede caller fejler)
- `cron/` — service-role-paths (retention, replay, auto-lock-cron)
- `break_glass/` — request/approve/execute flow + regprocedure-allowlist
- `classification/` — retention NOT NULL + permanent + admin-floor
- `benchmark/` — performance SLA-tests (lock-pipeline)
```
NY:
```
- `smoke/` — happy-path-tests, også service-role-paths (fx `r7a_retention_cleanup_cron_e2e.sql`, `r7a_replay_anonymization_e2e.sql`)
- `negative/` — RLS/permission blokering (verificer at uberettigede caller fejler)
- `break_glass/` — request/approve/execute flow + regprocedure-allowlist
- `classification/` — retention NOT NULL + permanent + admin-floor

Der findes ingen benchmark-tests (lock-pipeline-benchmarket er G031).
```
Bevis: `ls supabase/tests` → `break_glass classification negative smoke README.md`; de to r7a-filer ligger i `smoke/`; G031.

**TR-3 · l.42-43**
NUVÆRENDE:
```
pnpm db:test                    # kør alle tests
pnpm db:test -- --dir benchmark # kun benchmark-tests
```
NY:
```
pnpm db:test                    # kør alle tests
pnpm db:test -- --dir smoke     # kun én mappe
```
Bevis: `run-db-tests.mjs` l.19-21, 62-63 (`--dir` = undermappe af `supabase/tests/`).

### 7.2 `docs/teknisk/cutover-checklist.md` (4.1 trin 6; l.3 med governance-tjekket)

**CC-1 · l.3** `<!-- governance-owns: cutover-flade -->` → *(slettes sammen med governance-tjekket)*

**CC-2 · l.7 (det gamle kilde-flag)**
NUVÆRENDE:
```
**Kilde-flag (H010.6):** Den oprindelige reference "plan v1 sektion 4" kunne ikke lokaliseres som distinkt artefakt i repo'et. Indholdet nedenfor er destilleret fra (a) master-plan §X cutover-blockers, (b) `docs/teknisk/permission-matrix.md` pre-cutover lifecycle-state, og (c) G039 i `docs/teknisk/teknisk-gaeld.md`. Hvis "plan v1 sektion 4" var en anden konkret kilde: send referencen, så afstemmes indholdet ordret.
```
NY:
```
**Kilder:** (a) masterplanens afsnit »Cutover-blockers (rettelse 28)«, som er autoritativ, (b) `docs/teknisk/permission-matrix.md` pre-cutover lifecycle-state, (c) G039 i `docs/teknisk/teknisk-gaeld.md`. (Den gamle henvisning »plan v1 sektion 4« blev aldrig fundet; masterplanen er kilden.)
```
Bevis: masterplan l.1930-1950 har de samme 11 blockers; filens egen l.5: »Master-plan-blockers er autoritative«.

**CC-3 · række #5 (l.21)**
NUVÆRENDE: `| 5   | Backup-retention verificeret                   | Antal dage dokumenteret i denne fil + Supabase Management API verificerer faktisk værdi                                                                                      | åben   |`
NY: `| 5   | Backup-retention verificeret                   | Antal dage dokumenteret i \`CLAUDE.md\` (som masterplanen siger) + Supabase Management API verificerer faktisk værdi                                                            | åben   |`
*(i filen uden backslashes)*
Bevis: masterplan-rækken #5 siger »Antal dage dokumenteret i `CLAUDE.md`«, og filen følger masterplanen (l.5). Ingen af de to filer har et tal endnu.

**CC-4 · række #6 (l.22), kun Status-kolonnen**
NUVÆRENDE: `| åben   |`
NY: `| migration kørt (\`20260516200000_h024_test_artifact_cleanup.sql\`); afventer live-kvittering |`
*(i filen uden backslashes)*
Bevis: G017 »LØST i H024« (teknisk-gaeld.md l.556-561); live-tallet er ikke aflæst.

**CC-5 · række #11 (l.27)**
NUVÆRENDE: `| 11  | Migration TODO-markører løst (H006)            | 0 TODO-markører i migration-filer                                                                                                                                            | åben   |`
NY: `| 11  | Migration TODO-markører løst (H006)            | 0 TODO-markører i \`scripts/migration/employees/1_discovery.sql\` og \`2_extract.sql\` (1.0-udtræk; \`supabase/migrations/\` har 0)                                          | åben   |`
*(i filen uden backslashes)*
Bevis: som HL-3.

**CC-6 · l.44 og l.46**
NUVÆRENDE:
```
- `core_identity.role_page_permissions` — superadmin-rows seedet via Q-pakke; andre roller skal seedes via UI
- `core_compliance.gdpr_responsible` valgt via UI
```
NY:
```
- `core_identity.role_permission_grants` — superadmin-grants seedet i T9 (`20260518000010_t9_seed_owners.sql`); andre roller skal seedes via UI
- GDPR-ansvarlig (`core_compliance.superadmin_settings.gdpr_responsible_employee_id`) valgt via UI (`gdpr_responsible_set`); ved oprettelsen sat til ældste aktive superadmin
```
Bevis: `role_page_permissions` er erstattet (`20260518000009_t9_migrate_role_page_permissions.sql` l.226-228, `20260521000014_t10_remove_legacy_permissions.sql`); `20260515110000_p0_gdpr_responsible_employee.sql` l.48, 57-76, 128.

**CC-7 · l.68**
NUVÆRENDE: `Reference: G039 i \`docs/teknisk/teknisk-gaeld.md\`. H012 sporer hård deadline.`
NY: `Reference: G039 i \`docs/teknisk/teknisk-gaeld.md\`. H012 sporer deadlinen: før cutover (der er ikke sat en dato).`
*(i filen uden backslashes)*
Bevis: H012 og G039 nævner ingen dato (grep); afsnittets overskrift l.66 siger »HÅRD DEADLINE før cutover«.

### 7.3 Visionens hoved (`vision-og-principper.md` l.5)

l.5 rettes efter `tekster/stammedok-hoveder.md` §1 (formuleret af claude-ai-rollen efter forfatterreglen, `disciplin.md:263`; dit `ok` til planen er forhåndsgodkendelsen; Code indsætter ordret). Code formulerer intet her. **Hvornår:** 4.1 trin 1, i samme ændring som forretningsforståelsens l.5 (§1.4), så de to stamme-dokumenter siger det samme (D4).


---

## 8. Ændringslisten 24/9: filer, kobling og pakke 1 (S4, S5, S9, S13, S14, S15, H5)

Dit ord 24/9: »jeg går med dine anbefalinger« (ændringslisten `aendringer-41.md`). Her står de poster, der rammer filer uden for `disciplin.md`, masterplanen og rolleteksterne. Tidspunkterne står også i tabellen øverst.

### 8.1 S4 — `forventningsliste-udkast.md` fjernes

- **Fil:** `plan-build/lokations-skabelon/forventningsliste-udkast.md` fjernes i 4.1 trin 3, i samme ændring som byggetjekket lægges om.
- **Kobling der fjernes samme sted:** validatoren kræver `bindings.forventningsliste` (`scripts/v5/forventnings-manifest.mjs` l.89), og `build-proof.mjs` l.67 path-binder den (build-proof fjernes med S1).
- **Pakke 1's manifest** bruges som det er (S3). Dets felt `bindings.forventningsliste` peger derefter på git-historikken og læses ikke.
- **Grund:** listen er en byte-kopi af manifestet, og manifestet har forrang (workflow-planen §4.2).

### 8.2 S5 — godkendelses-filerne

Står i §5.8: `plan-approval.json` og `krav-approval.json` fjernes i 4.1 trin 3; ledgeren er eneste kilde, og hooken og byggetjekket læser den (`disciplin.md` §2 »Godkendelses-ordene«).

### 8.3 S9 — `actors.lock.json` og dens kobling

I samme commit som de nye rolletekster (workflow-planen §4.5, sidste række; teksten i `skill-og-roller.md` D):
- `scripts/v5/actors.lock.json`, `actors-lock.mjs`, `actors-lock.selftest.mjs`, `roller.mjs` og `roller.selftest.mjs` fjernes.
- `scripts/v5/pre-commit-zone.mjs` l.31-69 (låsen skal følge rolleteksten i samme commit) fjernes.
- `scripts/v5/codex-run.sh` l.4-8 og l.246-274 (rolle-opslag i den pinnede lås og `skill_oid`-tjek) erstattes af: rolleteksten læses fra `scripts/v5/roller/<rolle>.md`, og model og effort gives af fabrikken i kaldet.
- `package.json` l.31 (`v5:selftest`): `actors-lock.selftest.mjs` og `roller.selftest.mjs` tages ud.
- **Grund:** pins bortfalder (workflow-planen §5, M-31/M-33); låsen beskyttede kun sin egen konsistens.

### 8.4 S14 — `v5.yml` og `pr-drift-warning.yml`

**`.github/workflows/v5.yml`** (4.1 trin 4-5, i samme ændring som de filer selvtestene dækker):
- Jobbet `v5-haerdet-register-autoritet` (l.42-54) fjernes: hærdet-registeret fjernes (workflow-planen §4.5).
- I jobbet `v5-selftest` fjernes `env: STORK_V5_KANDIDAT_OK: "1"` (l.39-40; det hører til registret), og trinnavnet l.37 `v5:selftest (kandidat-drift — registrets kandidater tæller som ⚠, ikke rød)` bliver `v5:selftest`.
- Navnet l.1 `v5 gate-dommer selftests` bliver `v5 selftests`, og hovedkommentaren l.3-6 bliver:
  ```
  # Kører selvtestene for de v5-filer der bliver (byggetjekket, testbiblioteket,
  # hooken, Codex-indpakningen) ved hvert push + PR. contents:read.
  ```
- `package.json` l.31 (`v5:selftest`) kører kun selvtests for filer der bliver. Ud med deres filer: `driver`, `preflight`, `consolidate-recon`, `recon-gate-run`, `krav-gate-run`, `plan-gate-run`, `ci-gate-dom`, `kvittering`, `haerdet-register`, `checkrun`, `proofs`, `build-proof` (workflow-planen §4.5 og S1) og `actors-lock`, `roller` (S9). Bliver, så længe filen bliver: `test-runner`, `prover`, `angrebs-indeks`, `ci-build-dom`, `hooks`, `codex-run`, `git`. De øvrige (`gate-kerne`, `coverage`, `gate-eval`, `build-harness`) følger deres fil: den forenklede byggedom i 4.1 trin 3 afgør, om `gates.mjs`, `gate-eval.mjs` og `build-harness.mjs` stadig bruges (`ci-build-dom.mjs` importerer i dag `gates`, `gate-eval`, `proofs`, `checkrun`, `ci-gate-dom`); en selvtest hvis fil fjernes, tages ud i samme ændring.

**`.github/workflows/pr-drift-warning.yml`**: fjernes. Det kører ingen selvtest; det poster rebase-kommentarer på åbne PR'er (l.1-5).

**Grund:** ændringslisten S14: »behold kun det der kører selvtests for det der bliver; fjern resten«.

### 8.5 S15 — kravet flyttes, det kopieres ikke

- Fra pakke 2: claude-ai-rollen flytter udkastet med `git mv plan-build/<pakke>/krav-udkast.md docs/sandhed/krav/<pakke>-krav.md` efter `krav ok` (`disciplin.md` §2 trin 1). Hooken tjekker, at filens blob er den ledgeren binder til `krav ok` (tilpasningen af `hooks.mjs` l.64-122: `skill-og-roller.md` D).
- **Hookens måle-lag (H7):** i samme tilpasning af `hooks.mjs` klassificeres `plan-build/<pakke>/forventnings-manifest.json`, `angrebs-spec.json` og `prover.json` som Codex' målelag: Codex må committe dem før dækningslåsen, byggeren aldrig (teksten: `skill-og-roller.md` D).
- **Pakke 1:** kravet ligger allerede i `docs/sandhed/krav/lokations-skabelon-krav.md`. `plan-build/lokations-skabelon/krav-udkast.md` er byte-identisk (begge blob `9402164d87a35fb939661058bea77c1a052493d0` @ 87a877b). Den fjernes ved omlægningen, i 4.1 trin 3, ikke først ved pakke-luk. `docs/sandhed/krav/lokations-skabelon-krav.md` er den eneste kravfil herefter.

### 8.6 H5 — én ledger og én ordbog i `docs/sandhed/`

**Flytning (4.1 trin 3, i samme ændring som den gamle plan-port fjernes):**
```
git mv plan-build/lokations-skabelon/mathias-ord.md docs/sandhed/mathias-ord.md
git mv plan-build/lokations-skabelon/ordbog.md      docs/sandhed/ordbog.md
```
- Hvorfor netop da: den gamle plan-port læser ordbogen i `plan-build/<pakke>/ordbog.md` (`scripts/v5/gate-eval.mjs` l.30); porten fjernes i samme ændring.
- `git mv` ændrer ikke filernes blob. Planens binding af ordbogens blob holder derfor.
- M-numrene fortsætter: næste ord får næste ledige nummer efter den sidste række. Ingen række ændres (append-only).
- Hooken lader AI tilføje poster til de to filer; resten af `docs/sandhed/` forbliver lukket (`skill-og-roller.md` D).

**Henvisninger der følger med:**

| Hvor | Hvad | Tekst |
|---|---|---|
| ledgerens titel og hoved | ny sti, én ledger for Stork | LG-1 (§5.6) |
| ordbogens titel og hoved | ny sti, én ordbog for Stork | OB-1 (§5.7) |
| masterplanen §0 | »Hans ord står ordret i ledgeren `docs/sandhed/mathias-ord.md`« | `masterplan-rettelser.md` A1 |
| `CLAUDE.md` | ledgerens sti | CM-2 (§4) |
| `README.md` | layoutet | RM-1 (§5.1) |
| `docs/strategi/disciplin.md` | §2, §4, §9.1, §10.2 | `disciplin-ny.md` (allerede med ny sti) |
| rolletekster | input-stier | `skill-og-roller.md` B1, B3, B7 (allerede med ny sti) |
| plan v3.8 | stien til ledger og ordbog (i dag `plan.md:20`) | skrives med den nye sti i v3.8 (workflow-planen §3 trin 1) |
| pakke 1-kravet l.3 | »kilder pr. K citerer ledger `plan-build/lokations-skabelon/m…`« | **rettes ikke:** kravet ændres kun med et nyt `krav ok`. M-numrene er de samme, så citaterne holder; den gamle sti findes i git-historikken. Rettes ved pakke 1's slut sammen med »UDKAST«-mærket (workflow-planen §4.3) |

### 8.7 S13 — pakke 1: P-8, kildekontrakten og kildefilerne

Slutprøven kører på testdatabasen med realistiske data gennem brugernes indgange; der er ingen læseadgang til drift (`disciplin.md` §2 trin 4; der findes ingen lokationsdata i drift, P-8 §1.1). Din regel »kode = Mathias' sandhed … doc-grøn ≠ dybde« bevares: fuld dybde gennem brugernes indgange.

**Bortfalder** (filerne fjernes i 4.1 trin 3; plan v3.8 binder dem ikke):

| Fil (@ 87a877b) | Blob |
|---|---|
| `plan-build/lokations-skabelon/p8-kildekontrakt.md` | `33dd3509` |
| `plan-build/lokations-skabelon/p8-kilde.json` | `05fe45f5` |
| `plan-build/lokations-skabelon/p8-kilde-scope.sql` | `82d10149` |
| `plan-build/lokations-skabelon/p8-kilde-katalog.txt` | `9731beba` |
| `plan-build/lokations-skabelon/p8-kilde-gen.mjs` | `4c2f7038` |

Ingen kode læser dem (grep `p8-kilde`/`kildekontrakt` i `scripts/v5/*.mjs` og `.github/`: 0 træf uden for selvtests). I planen står de i `plan.md:20` (kildekontrakt v4), `:35` (FA-5), `:841` (BV-5); de linjer tages ud i v3.8.

**Persondata-punktet i ½-siden bortfalder:** `plan.md:814` S-3 »Slutprøvens kildedata. Slutprøven læser jeres rigtige klient-, organisations- og medarbejderdata direkte fra driftssystemet — kun læsning, intet ændres. …« tages ud af v3.8 og af ½-siden.

**P-8 (`p8-slutproeve-spec.md`, blob `4af07ef4`) skrives om i plan v3.8 (4.1 trin 2).** Afsnit for afsnit:

| P-8-afsnit | Bliver til |
|---|---|
| §0 Kildebinding | K (kravet) og T (SQL-runneren) bliver. W peger på `docs/strategi/disciplin.md` §2 trin 4 i stedet for implementeringsplanen. V (`proofs.mjs`, chain-proof-routeren) udgår med S1 |
| §1.1 Hvad »reel« betyder | Pkt. 1 (eksisterende klienter, org-data og employees hentet fra driftskilden efter build) → realistiske data oprettet i testdatabasen af slutprøvens opsætning: klienter, organisation og medarbejdere med roller — ingen persondata og ingen læsning fra drift. Pkt. 2 (produktet skaber selv grupper, lokationer, stande, tilladelser og historik gennem sine offentlige indgange) og pkt. 3 (ugyldige input og mutanter, mærket) bliver |
| §1.2 Kildepopulation · §1.3 Seed og rangering (`k_run`, HMAC, signeret attest) · §1.4 Anti-cherry-pick | bortfalder: der er ingen kilde at udvælge fra |
| §2.1 Følsomhed i prøvematerialet · §2.2 To digests og signering | bortfalder: testdatabasen har ingen persondata |
| §2.3 Produktets anonymisering skal selv prøves | bliver |
| §3 Negative kontroltilfælde — mindst ét pr. K (afvisningsforsøgene) | bliver |
| §4.1-4.3 Kæden på tværs af bid (identitet, den ubrudte sti, metamorfiske og samtidige krav) | bliver |
| §4.4 Kørsel og afleveret chain-proof | bliver, uden signering og uden kilde-/transformbindingerne fra §2. Resultatet bevarer pr. scenarie: scenarie-ID · forventet effekt · faktisk effekt · forbindelsen mellem trinnenes objekter (de grupper, lokationer, stande, tilladelser og historik produktet selv skaber, følges som samme objekter gennem hele kæden; §1.1 pkt. 2, §4.1-4.3) · afstemning mod den forudberegnede liste (facit). Et resumé-tal (`{total, passed, failed, skipped}`) alene er ikke resultatet: samme antal beståede beviser ikke de rette scenarier eller en sammenhængende kæde. Signering og driftsudtræk bortfalder fortsat |
| §5 A1 (»kilden eller transformationen har fjernet fejlene«) | bortfalder med kilden |
| §5 A2 · A3 | bliver |
| »Afleveringsstatus« (held-out udtræk efter build) | bortfalder |

**Grund:** ændringslisten S13; workflow-planen §3 trin 1: »Hemmelig nøgle, HMAC, signering, udtræk fra drift og kildekontrakten udgår; afvisningsforsøgene, kæden og facit bliver.«
