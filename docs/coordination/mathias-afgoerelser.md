# Mathias' afgørelser

Append-only log over låste afgørelser Mathias har truffet. Format pr. entry: Dato / Beslutning (kort) / Begrundelse (kort) / Plan-reference. Begrundelse er HVORFOR beslutningen blev taget, ikke HVAD den var.

Append-only natur: fejl efter commit kan kun rettes via efterfølgende rettelse-entry, ikke ved historisk ændring. Hvis en begrundelse mangler i kilden: flag med `[ikke verificeret]`, fabrikér ikke.

---

### 2026-05-11 — Vision-og-principper.md låst som autoritativ kilde

- **Begrundelse:** Greenfield-bygning kræver én autoritativ kilde for "hvad er rigtigt"; 9 principper låses inden master-plan kropstekst kan reference dem konsistent.
- **Plan-reference:** `cfa1d4b` + `f415ef2` (v1.5-låsning)

### 2026-05-11 — Vision-princip 2: superadmin eneste hardkodede rolle

- **Begrundelse:** Andre roller skal være UI-baserede via `role_page_permissions`. Hardkodet `is_admin()` bryder "alt drift styres i UI".
- **Plan-reference:** `94e6cbb` (D4)

### 2026-05-11 — Tre feedback-memories aktiveret for Code's selvdisciplin (no-spejling)

- **Begrundelse:** Mathias' løse retning er ikke specifikation; Code skal vælge mindste rimelige tolkning og bekræfte, ikke spejle løse tanker til fast arkitektur.
- **Plan-reference:** `feedback_no_spejling.md` (2026-05-11)

### 2026-05-12 — Greenfield-princip i §3.4

- **Begrundelse:** 1.0's anti-mønstre kopieres ikke selv hvis det går hurtigere. Workarounds uden plan er drift.
- **Plan-reference:** `5ddc04b`

### 2026-05-13 / 2026-05-14 — Trin 1-4 fundament godkendt

- **Begrundelse:** §4 trin 1+2+3+4+8 (Trin 1), §4 trin 5 (Trin 2), §4 trin 6 (Trin 3), §4 trin 7+7b+7c (Trin 4) verificeret mod master-plan-paragraffer og godkendt af Mathias som fundament for resten af §4-byggerækkefølgen.
- **Plan-reference:** `ce8c609` (Trin 1, 2026-05-14) + `14dd814` (Trin 2, 2026-05-14) + `fd2ba48` (Trin 3, 2026-05-14) + `bc57ae0` (Trin 4, 2026-05-14)

### 2026-05-14 — E-conomic udelades fuldstændig

- **Begrundelse:** E-conomic er bogføring; Stork har ingen bogføring. Brug `time_based` ikke `legal` på løn-tabeller. Holder retention-typer rene.
- **Plan-reference:** `97e1ecf` (R1) + master-plan rettelse 22-31

### 2026-05-14 — 11 cutover-blockers operationaliseret med verificerbare success-kriterier

- **Begrundelse:** Hver blocker skal have et konkret artefakt-tjek, ikke kun en ord-beskrivelse. Forhindrer subjektiv "klar"-tolkning.
- **Plan-reference:** `97e1ecf` — master-plan Hard cutover-blockers-sektion

### 2026-05-14 — Admin-rolle omdøbt til superadmin

- **Begrundelse:** Konsistens med vision-princip 2 — navngivning markerer eksplicit at det er eneste hardkodede rolle.
- **Plan-reference:** `becab86` (R1b)

### 2026-05-14 — has_permission-helper som fundament

- **Begrundelse:** Permission-system kan ikke være UI-baseret uden generisk runtime-check. `has_permission(page, tab, can_edit)` standardiserer pattern på tværs af RPC'er.
- **Plan-reference:** `4a33ab6` (H1)

### 2026-05-14 — Q1: "aktiv medarbejder"-definition i UI-konfig

- **Begrundelse:** Aktiv-definitionen kan ikke hardkodes (princip 4 — default = intet). Skal være UI-redigerbar via `employee_active_config`.
- **Plan-reference:** `740cf57` (Q1)

### 2026-05-14 — D1-D2: drop `legal` retention_type, indfør `permanent` med trigger

- **Begrundelse:** Legal er bogføring-kategori; 71 legal-rows konverteres til `time_based`/`permanent`. `permanent` kræver eksplicit trigger-validering for at undgå klassifikations-drift.
- **Plan-reference:** `8c0e70f`

### 2026-05-14 — C001: retention NOT NULL + backfill 189 rows

- **Begrundelse:** Codex C001 afslørede at retention-kolonnen kunne være NULL og 189 rows manglede klassifikation; migration-gate Phase 2 strict kræver NOT NULL.
- **Plan-reference:** `b7ba4c3`

### 2026-05-14 — C002+C003: anonymization-dispatcher cron-path + replay idempotent

- **Begrundelse:** Codex C002+C003 afslørede at retention-cron var død i drift (cron-path-bug) og at replay ikke var idempotent (dobbelt-anonymisering risiko). Princip 7 (anonymisering bevarer audit) forudsætter at replay kan køres flere gange.
- **Plan-reference:** `a190dbe`

### 2026-05-14 — C004: pay_period RPC current_user-fallback fjernet

- **Begrundelse:** Codex C004 afslørede `current_user`-fallback der bypassede `has_permission`; bryder vision-princip 2.
- **Plan-reference:** `64b21a5`

### 2026-05-14 — C005: admin-floor count + termination_date trigger

- **Begrundelse:** Codex C005 afslørede at admin kunne slettes uden tjek for ≥1 aktiv tilbage (lockout-risiko); termination_date manglede automatisk is_active-flip.
- **Plan-reference:** `7004da7`

### 2026-05-14 — C006: break-glass regprocedure-allowlist + inactive gdpr

- **Begrundelse:** Codex C006 afslørede at break-glass-dispatcher kunne kalde vilkårlige funktioner via tekst-lookup; regprocedure-allowlist validerer at kun seedede operation-types kan eksekveres.
- **Plan-reference:** `ab22619`

### 2026-05-14 — Arbejds-disciplin etableret som autoritativt dokument

- **Begrundelse:** Trin-cyklus + AI-arbejdsdeling + Codex-fund-håndtering må være eksplicit dokumenteret for at undgå rolle-drift mellem aktører.
- **Plan-reference:** `9413d09`

### 2026-05-15 — Q-pakke: 20 RPC'er konverteret fra is_admin() til has_permission()

- **Begrundelse:** Vision-princip 2-operationalisering. Hver hardkodet `is_admin()`-check skal nu validere via UI-baseret permission-tabel.
- **Plan-reference:** `e3289a1`

### 2026-05-15 — R2: audit-trigger-coverage fitness + AUDIT_EXEMPT_SNAPSHOT_TABLES

- **Begrundelse:** Per-row audit er default (princip 6); aggregat-audit på snapshot-tabeller er bevidst undtagelse. Fitness-check forhindrer drift.
- **Plan-reference:** `daa3106`

### 2026-05-15 — R3: commission_snapshots UPDATE-flag refactor

- **Begrundelse:** Snapshot-mønster bevarer historik (princip 9); UPDATE-flag (`is_candidate` + `candidate_run_id`) erstatter parallel candidate-tabel for at undgå split-state.
- **Plan-reference:** `484c134`

### 2026-05-15 — R5+R6: FOR UPDATE compute-locking + drop legacy candidate-tabeller

- **Begrundelse:** FOR UPDATE erstatter advisory locks for forudsigelig konkurrence-håndtering; candidate-tabeller var pre-cutover test-artefakter (132+1 rows), kunne droppes uden produktion-impact.
- **Plan-reference:** `b670edb`

### 2026-05-15 — Lock-mønster-arkitektur udskudt (G032)

- **Begrundelse:** Lock-pipeline-benchmark kræver realistic data-volume; pre-cutover er meningsløst at benchmarke uden sales-rådata. Udskydes til efter sales-tabel eksisterer.
- **Plan-reference:** `2a896cc` + G031 i `docs/teknisk/teknisk-gaeld.md`

### 2026-05-15 — Problem 1-4 (Mathias' låste design-afgørelser pre-R-runde-2)

- **Begrundelse:** Fire centrale forretnings-/disciplin-afgørelser låstes som "Problem 1-4" inden R-runde-2-planen kunne skrives. Problem 4 verificeret konkret: "UI-aktivering kræves pre-cutover for lifecycle-tabeller (anonymization_strategies, anonymization_mappings, break_glass_operation_types)". Problem 1-3 specifikt indhold `[ikke verificeret]` — kun nævnt som blok-reference i `docs/coordination/arkiv/r-runde-2-plan.md:486` (sektion 7.1-7.3 "Vision/master-plan/Problem 1-4").
- **Plan-reference:** `docs/teknisk/permission-matrix.md:83` (Problem 4 eksplicit); `docs/coordination/arkiv/r-runde-2-plan.md:486` (blok-reference). Mathias bør udfylde Problem 1-3 ordret i opfølgnings-entry hvis kilde findes.

### 2026-05-15 — P0+P1: gdpr_responsible-rolle + anonymization_strategies-registry

- **Begrundelse:** Anonymisering er fundament (vision); strategi-registry kræves for at UI kan styre PII-erstatning pr. felt; bootstrap som `approved` (ikke `active`) lader `gdpr_responsible` aktivere som første handling.
- **Plan-reference:** `945ac58`

### 2026-05-15 — P2+P3+D3: UI-RPCs for mappings + operation_types + ON CONFLICT fitness

- **Begrundelse:** Lifecycle-tabeller skal kun INSERT'es via aktiverings-RPC (draft → tested → approved → active); ON CONFLICT DO NOTHING bootstrap-princip (15) forhindrer migration-duplikat-rows.
- **Plan-reference:** `eb699d4`

### 2026-05-15 — Plan-leverance er kontrakt (disciplin-afgørelse)

- **Begrundelse:** Når Mathias har specificeret konkret (antal, navne, værdier), implementer alt; flag afvigelser FØR (ikke efter) — modsat no-spejling-reglen for løse retninger.
- **Plan-reference:** `feedback_plan_leverance_is_contract.md` (2026-05-15)

### 2026-05-15 — R-runde-2: live DB introspection som primær inventory-kilde

- **Begrundelse:** V1-håndskrevne inventories var ufuldstændige (3 readers vs faktisk 6 + cron); live recon via `pg_get_functiondef` + `cron.job` afslørede mismatch. Skift gælder fremover for "alle steder hvor X bruges"-inventories.
- **Plan-reference:** `c165ef1` (r-runde-2-plan v2)

### 2026-05-15 — R7a-R7g: 8 kritiske bug-fixes fra Codex-review

- **Begrundelse:** Lifecycle-state alignment + RLS-fitness-udvidelser + cron.schedule-aware stripDollarQuoted. Pre-cutover-kvalitets-løft som forudsætning for cutover-blockers.
- **Plan-reference:** `967f170` + `6b9f8b5`

### 2026-05-15 — M1: permission-matrix dokumentation + destructive drops disciplin

- **Begrundelse:** 32 RPC'er har dokumenteret permission-binding; destructive drops kræver 4-punkt preflight (tom-check + reference-check + audit-spor + rollback-plan).
- **Plan-reference:** `531c52c`

### 2026-05-15 — R7h: 7 e2e-tests for anonymization + break-glass + retention-cron

- **Begrundelse:** Pipeline har test-coverage der validerer både pre-aktivering-blokering og (post-aktivering) succes-path.
- **Plan-reference:** `04482b9`

### 2026-05-15 — Merge-strategi: rebase + admin override for trin-1-fundament

- **Begrundelse:** Branch protection blokerede merge (1-godkendelse + non-pusher-rule). Rebase bevarer commit-historie; admin override begrundet i at PR allerede var Mathias-godkendt.
- **Plan-reference:** `gh pr merge 8 --rebase --admin`

### 2026-05-15 — Stop ved divergence, fix ikke iterativt (disciplin-afgørelse)

- **Begrundelse:** Når reality afviger fra forventning (input refererer ikke-eksisterende artefakt, godkendt arbejde fejler i eksekvering), stop og rapportér; skab ikke for at passe, fix ikke iterativt uden godkendelse.
- **Plan-reference:** `feedback_dont_fabricate_to_fit.md` (2026-05-15)

### 2026-05-15 — Huskelisten ligger ikke i repo

- **Begrundelse:** `huskeliste-stork-2-0.md` er internt arbejds-artefakt mellem Mathias og Claude.ai, ikke fælles aktør-dokumentation. Code's pre-PR-fix der oprettede stub blev revertet i working tree FØR commit for at holde grænsen ren. Repo skal kun indeholde det alle aktører konsumerer.
- **Plan-reference:** Ingen commit-hash (filen blev aldrig committet); dokumenteret i `feedback_dont_fabricate_to_fit.md` "Mønster 1".

### 2026-05-15 — §4 trin 9 (identitet del 2) byggetrin pauset

- **Begrundelse:** Huskeliste skal være på fornuftigt niveau før nye byggetrin startes. Ad-hoc-mønstret der har skabt glid skal stoppes via H010-disciplin før §4 trin 9 påbegyndes.
- **Plan-reference:** `huskeliste-stork-2-0.md` (internt mellem Mathias og Claude.ai; ikke i repo)

### 2026-05-15 — Codex-trigger: Pattern A (notification-only fallback)

- **Begrundelse:** Codex CLI ikke offentligt tilgængelig som GitHub Action; notification via tracker-issue er teknisk muligt nu og kan udvides senere når CLI bliver tilgængelig.
- **Plan-reference:** `.github/workflows/codex-notify.yml` (H010.7)

### 2026-05-15 — LÆSEFØLGE.md placeret i docs/-rod som undtagelse til mappe-princippet

- **Begrundelse:** Navigation-filen peger ind i undermapperne. Hvis den selv lå i en undermappe, blev læsefølge-rækkefølgen selv-refererende.
- **Plan-reference:** `docs/strategi/arbejdsmetode-og-repo-struktur.md` (Repo-struktur-sektion)

### 2026-05-15 — H010 committed (single samle-commit, 12 leverancer)

- **Begrundelse:** Etablering af arbejdsmetode + repo-struktur leveret atomisk som single commit; efterfølgende pakker arbejder mod konsistent struktur fra start. Slut-rapport leveret pr. rapport-skabelon i `docs/coordination/rapport-historik/2026-05-15-h010.md`.
- **Plan-reference:** commit `a0ccdf1` lokal → rebased til `70487e0` på main efter merge

### 2026-05-15 — H010 merge: --admin override (tredje --admin-brug)

- **Begrundelse:** Branch protection (`enforce_admins=true`) + CI-fail blokerede merge. CI-fail verificeret som præ-eksisterende test-bug uafhængig af H010-indhold (G043 + G044). H010 docs-only + migration-kommentar verificeret isoleret. `enforce_admins` deaktiveret via gh api før merge for at lade `--admin` flag virke; re-aktiveres efter follow-up-PR er merget.
- **Plan-reference:** PR #10, merge-commit `3c6bc0b` på main
- **Note:** Tredje `--admin`-brug efter R7h-merge og forrige H010-direct-push-forsøg. Cementering af regel for `--admin`-brug er foreslået som H018.

### 2026-05-15 — Test-arkitektur: pay_periods-INSERT-tests mangler cleanup

- **Begrundelse:** Fundet under H010 PR CI-fail. G043+G044 dokumenterer det fulde billede. Test-suite ikke idempotent på `pay_periods` — INSERT'er stale-rows der ikke kan ryddes op via DELETE pga. `pay_periods_lock_and_delete_check`-trigger (vision-princip 9). Skal løses før CI-grøn er pålideligt signal.
- **Plan-reference:** `docs/teknisk/teknisk-gaeld.md` G043 + G044

### 2026-05-15 — H022: G043 minimal-patch (fixed-shift, valg A)

- **Begrundelse:** 3 blokerede merges på én dag (H010, H010-followup, H021) etablerede empirisk grundlag for at unblokke H021 + tillade I001-plan-arbejde uden at vente på dato-vindue-skift. Valg A (fixed-shift "5 years" → "6 years 6 months") vurderet som teknisk renest pga. minimal diff. **Vurderingen var forkert** — se H022.1.
- **Plan-reference:** PR #14, merge-commit `3ff21f8`
- **Note:** Reel G043+G044-løsning skal stadig adresseres. I001-plan argumenterer for om scope skal udvides til at inkludere det.

### 2026-05-15 — H022.1: G043 random-offset (erstat fixed-shift, valg B)

- **Begrundelse:** H022's fixed-shift havde levetids-vurdering 18 måneder; faktisk levetid var én CI-kørsel — H022's egen CI efterlod ny stale-row der umiddelbart blokerede H021. 4 datapunkter samme dag (H010, H010-followup, H021 før H022, H021 efter H022) viste at fixed-dato-shift bare flytter problemet. Random-offset (base 10y + spread 0-3650d → range 2036-2046) er robust minimal-patch. Selvkritik fra Code: defensiv "minimal diff er bedre" over teknisk korrekthed var anti-pattern; plan-leverance-disciplin gælder også for valg af patch-strategi.
- **Plan-reference:** PR #15, merge-commit `5a57d33`

### 2026-05-15 — H021 merged efter H022.1-unblok

- **Begrundelse:** H021 (plan-review-automation) blev unblokt af H022.1's random-offset-patch. Mergede uden `--admin` efter naturligt grøn CI — eksplicit demonstration af at G043+G044-omgåelse er korrekt vej, ikke `--admin`-bypass.
- **Plan-reference:** PR #13, merge-commits `2358100` + `d15b7f3`

### 2026-05-15 — Codex-review-prompt-skabelon: 4 strategi-blok-typer aktive

- **Begrundelse:** H021's udvidede codex-notify-action differentierer mellem 6 trigger-typer (ny-plan-version, codex-feedback, code-feedback, plan-approved, plan-blokeret, slut-rapport). Krav-dokument-disciplin etableret med 4 brud-typer der udløser stop-signal via `<pakke>-V<n>-blokeret.md`. Plan-flow for I-pakker dokumenteret med 10-step round-trip-loop.
- **Plan-reference:** PR #13 (H021)
