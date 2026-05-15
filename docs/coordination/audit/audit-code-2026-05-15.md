# H016 sandheds-audit — Code's del

## Header

- **Aktør:** Code (Claude Code CLI)
- **Dato:** 2026-05-15
- **Branch:** `claude/h016-audit-code`
- **HEAD ved audit-start:** `27ac90b` (origin/main efter H010 follow-up merge)
- **Parallel audit:** Codex laver samme audit uafhængigt; rapporter sammenlignes efter begge er afleveret.
- **Scope:** LAG 1 sandheds-konsistens. LAG 2 (bugs/sikkerhed) holdes ude — det er review, ikke audit.

---

## Sammendrag

| Kategori                           | Verificeret | [uverificeret] | Note                        |
| ---------------------------------- | ----------- | -------------- | --------------------------- |
| A — dokument modsiger dokument     | 6           | 0              |                             |
| B — dokument modsiger kode/DB      | 5           | 0              | live state via Supabase MCP |
| C — kode-kommentar modsiger SQL/TS | 2           | 0              |                             |
| D — path-reference dødt link       | 1           | 0              |                             |
| E — status-felt forkert            | 2           | 0              |                             |
| F — setup-claim modsiger setup     | 8           | 0              | inkluderer org-handle-fund  |
| **Total**                          | **24**      | **0**          |                             |

| Konsekvens | Antal |                                        |
| ---------- | ----- | -------------------------------------- |
| Kritisk    | 5     | direkte skade hvis nogen tror på claim |
| Mellem     | 17    | misleading men ikke akut skadelig      |
| Kosmetisk  | 2     | indre konsistens                       |

---

## Verificerede fund

### FN-001 [F] [verificeret] [kritisk]

**Lokation:** `.github/BRANCH_PROTECTION.md:34, 60, 69, 143` + `.github/CODEOWNERS:7`
**Påstand (citat):** `gh api .../repos/copenhagensales/stork-2.0/branches/main/protection` + `* @copenhagensales`
**Faktisk tilstand:** Repo-owner er `Cphsales`, ikke `copenhagensales`. URL'er er døde, CODEOWNERS-default-rule peger på non-existent org-handle.
**Bevis:** `gh repo view --json owner,name,url` → `{"owner":{"login":"Cphsales"},"url":"https://github.com/Cphsales/stork-2.0"}`. 5+ steder bruger forkert org-navn.
**Konsekvens:** Hvis Mathias kopierer kommandoerne fra BRANCH_PROTECTION.md, fejler de. CODEOWNERS-reglen matcher ingen reel bruger, så review-routing er deaktiveret de facto.

### FN-002 [F] [verificeret] [kritisk]

**Lokation:** `README.md:29`
**Påstand (citat):** "Supabase CLI 2.98.x ... downloadet via postinstall"
**Faktisk tilstand:** `package.json` har INGEN `postinstall`-script. `supabase` er normal devDependency (`^2.98.2`), installeret via standard pnpm-install.
**Bevis:** `cat package.json | grep -E "postinstall|scripts"` viser kun de listede scripts; ingen `postinstall`.
**Konsekvens:** Nye udviklere kan tro at supabase CLI installeres ved en postinstall-hook. Hvis pnpm install fejler skal de derudover have specifikt versionspin (^2.98.2 ≠ 2.98.x — tillader 2.99.x også).

### FN-003 [F] [verificeret] [mellem]

**Lokation:** `README.md:63-64`
**Påstand (citat):** "Pre-commit: Husky + lint-staged kører Prettier og ESLint på staged files"
**Faktisk tilstand:** `.husky/pre-commit` kalder kun `pnpm exec lint-staged`. lint-staged-config kører **Prettier på alle staged matchende ext + ESLint kun på `apps/web/**/\*.{ts,tsx}`**.
**Bevis:** `package.json:38-44` viser to lint-staged-regler. ESLint er ikke universel.
**Konsekvens:** README giver indtryk af bred lint-coverage; reelt eslintes kun frontend-kode.

### FN-004 [F] [verificeret] [kritisk]

**Lokation:** `supabase/schema.sql:1` + `packages/types/src/database.ts:1`
**Påstand (citat):** Begge filer markeret PLACEHOLDER. README.md L65 + ci.yml L67-73 implicerer at drift-check er aktiv mekanisme.
**Faktisk tilstand:** Begge filer er stadig PLACEHOLDER (3-4 linjer). `types-check.sh` + `schema-check.sh` har eksplicit `if head -1 ... | grep -q "^// PLACEHOLDER"; then ... exit 0`. CI's drift-check har ALDRIG kørt mod faktisk schema.
**Bevis:** `head -3 supabase/schema.sql` → "PLACEHOLDER: snapshot af supabase imtxvrymaqbgcvsarlib ..."; `head -3 packages/types/src/database.ts` → "PLACEHOLDER: regenereres ved første pnpm types:generate ..."
**Konsekvens:** Drift-detection-pipelinen er de facto ufunktionel. Schema kan drifte uden CI-fang så længe placeholder-flag står.

### FN-005 [F] [verificeret] [kritisk]

**Lokation:** `scripts/schema-check.sh:17`
**Påstand (citat):** `pnpm exec supabase db dump --linked --schema public >"$TMP"`
**Faktisk tilstand:** Script dumper KUN `public` schema. Men `public` schema er DROP CASCADED i trin 1 (`20260514120000_t1_drop_public.sql`). Faktiske schemas er `core_compliance` + `core_identity` + `core_money`.
**Bevis:** `grep -c "core_compliance\|core_identity\|core_money" supabase/schema.sql` → 0. Migration t1_drop_public.sql L17-21 dokumenterer DROP CASCADE af alle 17 public-tabeller.
**Konsekvens:** Selv hvis schema.sql blev populated, ville drift-check fange 0 drift fordi den ikke ser de relevante schemas. Fald gennem en sikkerheds-mekanisme.

### FN-006 [A] [verificeret] [mellem]

**Lokation:** `CLAUDE.md:47`
**Påstand (citat):** "**Kendt teknisk gæld (G-numre + H-numre):** `docs/teknisk/teknisk-gaeld.md`"
**Faktisk tilstand:** `teknisk-gaeld.md` indeholder kun G-numre. H-numre findes ikke som registret enheder. `grep -nE "^### \[H" docs/teknisk/teknisk-gaeld.md` returnerer 0 matches.
**Bevis:** H001-H003+H006 nævnes som cutover-blockers (`docs/coordination/cutover-checklist.md:22-25`), H010+H012+H016+H018 nævnes i mathias-afgoerelser, men ingen har formel hjemme.
**Konsekvens:** Code/Codex/Mathias kan ikke finde H-nummer-detaljer ved at læse teknisk-gaeld.md. Index claimer indhold der ikke er der.

### FN-007 [A] [verificeret] [mellem]

**Lokation:** `docs/coordination/mathias-afgoerelser.md:19-22`
**Påstand (citat):** "### 2026-05-11 — Tre feedback-memories aktiveret for Code's selvdisciplin (no-spejling) ... **Plan-reference:** `feedback_no_spejling.md` (2026-05-11)"
**Faktisk tilstand:** Entry-titel siger TRE memories, men plan-reference peger på kun ÉN fil med dato 2026-05-11. De to andre memories (`feedback_plan_leverance_is_contract.md` 2026-05-15, `feedback_dont_fabricate_to_fit.md` 2026-05-15) er senere oprettet — kan ikke have været "aktiveret 2026-05-11".
**Bevis:** `ls -la /home/mathias/.claude/projects/-home-mathias-stork-2-0/memory/` viser modify-dates 2026-05-11, 2026-05-15, 2026-05-15.
**Konsekvens:** Entry-titel og plan-reference er ikke konsistente. Læseren tror tre memories blev aktiveret 2026-05-11 — kun én blev.

### FN-008 [A] [verificeret] [mellem]

**Lokation:** `docs/coordination/mathias-afgoerelser.md:94-97`
**Påstand (citat):** "### 2026-05-15 — Q-pakke: 20 RPC'er konverteret fra is_admin() til has_permission()"
**Faktisk tilstand:** Task #33 navngivet "Q-pakke: is_admin → has_permission på 22 RPC'er". Commit-besked `e3289a1` siger "20 RPC'er konverteret". Diskrepans 20 vs 22.
**Bevis:** `git log --oneline | grep Q-pakke` → "e3289a1 Q-pakke: 20 RPC'er konverteret fra is_admin() til has_permission()". TaskList #33 viser "22 RPC'er".
**Konsekvens:** En af tallene er forkert. Konsistens-mangel mellem task-tracker og commit/afgørelseslog.

### FN-009 [A] [verificeret] [mellem]

**Lokation:** `docs/strategi/arbejdsmetode-og-repo-struktur.md:3`
**Påstand (citat):** "**Status:** Plan, ikke aktiveret. Etableres efter R-runde-2 er færdig."
**Faktisk tilstand:** H010 ER nu merget (commit `3c6bc0b` på origin/main). Planen ER aktiveret. Status er stale efter H010-merge.
**Bevis:** `git log origin/main --oneline -3` viser H010-commits på main.
**Konsekvens:** Læser som forventer "Plan, ikke aktiveret"-mode kan forsømme at følge LÆSEFØLGE-disciplinen.

### FN-010 [A] [verificeret] [mellem]

**Lokation:** `docs/strategi/arbejdsmetode-og-repo-struktur.md:24-46`
**Påstand (citat):** Mappetræ angiver `strategi/` indeholder 4 filer (vision-og-principper, master-plan, arbejds-disciplin, bygge-status); `skabeloner/` indeholder 2 (plan-skabelon, rapport-skabelon); `coordination/` indeholder 6 entries.
**Faktisk tilstand:**

- `strategi/` har 5 filer (mangler arbejdsmetode-og-repo-struktur.md SELV i træet — fil refererer ikke sig selv)
- `skabeloner/` har 3 filer (mangler codex-review-prompt.md, H010.12)
- `coordination/` mangler cutover-checklist.md (H010.6) i træet
  **Bevis:** `find docs/ -name "*.md" | sort` viser faktisk indhold; CLAUDE.md L9-37 har korrekt opdateret mappetræ.
  **Konsekvens:** Scope-dokumentet's mappetræ matcher ikke virkeligheden. CLAUDE.md L9-37 har den korrekte version. Inkonsistens mellem to autoritative kilder.

### FN-011 [A] [verificeret] [mellem]

**Lokation:** `docs/strategi/vision-og-principper.md:70-76`
**Påstand (citat):** "### Tre AI-aktører ... Claude.ai ... Code (CLI) ... Codex"
**Faktisk tilstand:** `arbejdsmetode-og-repo-struktur.md:9-12` lister FIRE aktører (Mathias + Claude.ai + Code + Codex). Vision-og-principper mangler Mathias som distinkt aktør.
**Bevis:** `head -15 docs/strategi/arbejdsmetode-og-repo-struktur.md` viser 4 aktører.
**Konsekvens:** Inkonsistens i aktør-rammen. Vision-fil burde være autoritativ, men er mangelfuld.

### FN-012 [B] [verificeret] [mellem]

**Lokation:** `docs/strategi/bygge-status.md:107, 134, 154`
**Påstand (citat):** "207 klassificerede kolonner" (trin 1), "211 klassificerede kolonner" (trin 2), "233 klassificerede kolonner" (trin 3)
**Faktisk tilstand:** DB-state: 202 klassificerede kolonner total. G018 (`docs/teknisk/teknisk-gaeld.md:205-212`) dokumenterer at tallene altid har været forkerte (migration-gate union-count over fase 0-filer der blev DROP CASCADED).
**Bevis:** `select count(*) from core_compliance.data_field_definitions` → 202. G018 har eksisteret som åbent fund siden trin 1-3 retroaktiv gennemgang.
**Konsekvens:** Bygge-status er stale trods erklæring af problemet. Tallene er udadtil "verifikation" men er forkerte.

### FN-013 [B] [verificeret] [kritisk]

**Lokation:** `docs/teknisk/permission-matrix.md:79` + `docs/coordination/cutover-checklist.md:35`
**Påstand (citat):** "`anonymization_strategies` | 3 (blank, hash, hash*email) | alle `approved`"
**Faktisk tilstand:** DB har 10 rows total, kun 3 approved. 7 stale `p1a_smoke_t5*_`-rows med status='tested' fra smoke-test-kørsler. Permission-matrix L3 hævder "Auto-genereret fra live DB introspection 2026-05-15" — men reelt outdated.
**Bevis:** `select strategy_name, status, count(_) from core_compliance.anonymization_strategies group by ...` returnerer 10 rows (3 approved + 7 tested).
**Konsekvens:** Permission-matrix og cutover-checklist undervurderer DB-state. UI-aktivering pre-cutover skal håndtere 7 ekstra stale rows, eller rydde dem først.

### FN-014 [B] [verificeret] [kritisk]

**Lokation:** `docs/strategi/bygge-status.md:78` (action-items) + `docs/teknisk/teknisk-gaeld.md:196-203` (G017)
**Påstand (citat):** Bygge-status action-item-78: "Benchmark-artifacts i prod-DB: ... 1 syntetisk pay*period (2020-01-15→2020-02-14, locked), 260 commission_snapshots og 1 salary_correction"
**Faktisk tilstand:** Listen er ikke komplet. 7 stale `p1a_smoke_t5*\*`strategi-rows er IKKE listet. G017 cutover-blocker tjekker kun`pay_periods.start_date < '2000-01-01'`+`salary_corrections.description='smoke test'` — fanger ikke stale anonymization_strategies.
**Bevis:** Live DB-query (FN-013). G017 success-kriterium dokumenteret i cutover-checklist L20.
**Konsekvens:** Test-artefakt-oprydning er uafsluttet. Cutover-blocker 6's tjek er mangelfuldt — kan stå "0" og passere selvom 7 stale rows er der.

### FN-015 [B] [verificeret] [mellem]

**Lokation:** `docs/teknisk/permission-matrix.md:7-14`
**Påstand (citat):** "Total: 32 RPC'er — 31 bruger `has_permission(...)`, 1 beholder `is_admin()`"
**Faktisk tilstand:** DB har 32 funktioner i (core_compliance, core_identity, core_money) der refererer `has_permission`, OG 2 funktioner der KUN bruger `is_admin` uden `has_permission`: `core_compliance.superadmin_settings_update` + `core_identity.is_admin` (helper-funktionen selv).
**Bevis:** Query mod pg_proc filtreret på pg_get_functiondef.
**Konsekvens:** Tabellen formenteligt ekskluderer helper-funktionen `is_admin` selv (kun lister "retained"-RPC). Men det er ikke eksplicit. Læseren kan tro at kun 1 is_admin-funktion eksisterer; faktisk 2.

### FN-016 [E] [verificeret] [kritisk]

**Lokation:** `docs/coordination/aktiv-plan.md:5`
**Påstand (citat):** "**Aktuel:** ingen aktiv plan. H010 (etablering af arbejdsmetode + repo-struktur) afsluttet ved commit-hash der skrives ind her efter samle-commit."
**Faktisk tilstand:** H010 ER nu merget; commit-hash er IKKE skrevet ind. Også: H016 ER aktiv nu — "ingen aktiv plan" er forkert.
**Bevis:** Git log viser H010-commits på main (`3c6bc0b` og `70487e0`). Denne audit selv er H016.
**Konsekvens:** Aktiv-plan-pegepind er stale. Andre aktører (Codex, Claude.ai) der følger LÆSEFØLGE-procedure får forkert state.

### FN-017 [C] [verificeret] [mellem]

**Lokation:** `scripts/run-db-tests.mjs:7`
**Påstand (citat):** "Filer med side-effekter (employees/audit) bruger BEGIN/ROLLBACK så prod-DB ikke forurenes."
**Faktisk tilstand:** `r3_commission_snapshots_immutability.sql:8` (do $test$ ... $test$) har INGEN BEGIN/ROLLBACK-wrap. Den INSERT'er pay_period med `current_date + interval '5 years'` direkte i prod-DB. G043+G044 (`docs/teknisk/teknisk-gaeld.md:435-455`) dokumenterer netop dette mismatch.
**Bevis:** `head -40 supabase/tests/smoke/r3_commission_snapshots_immutability.sql`. G043/G044 åbnede i sidste commit.
**Konsekvens:** Kommentar-claim er bredere end faktisk praksis. Andre udviklere kan skrive nye tests forudsat at runner wrapper i tx — det gør den ikke.

### FN-018 [C] [verificeret] [kosmetisk]

**Lokation:** `docs/teknisk/permission-matrix.md:92`
**Påstand (citat):** "4. Regenérer denne fil ved at køre query i `docs/teknisk/permission-matrix.md`-frontmatter"
**Faktisk tilstand:** Filen har INGEN frontmatter. Filen starter direkte med `# RPC permission matrix` på L1.
**Bevis:** `head -3 docs/teknisk/permission-matrix.md`. Ingen YAML-frontmatter.
**Konsekvens:** Self-referential bug. Vedligeholdelses-instruks peger på indhold der ikke eksisterer.

### FN-019 [D] [verificeret] [kosmetisk]

**Lokation:** `README.md:77`
**Påstand (citat):** "Se forrige sessions `code-forstaaelse-samlet.md` for kontekst og A1-A10-plan."
**Faktisk tilstand:** Filen findes ikke i repo'et.
**Bevis:** `find . -name "code-forstaaelse-samlet.md" -not -path "*/node_modules/*"` returnerer tomt.
**Konsekvens:** Dødt link i README. Nye udviklere der søger "A1-A10-plan" finder intet.

### FN-020 [E] [verificeret] [mellem]

**Lokation:** `docs/teknisk/teknisk-gaeld.md:461-474`
**Påstand (citat):** L461-470 G019-entry med "Status i denne commit: **LØST i `20260514160000_t1_inline_fix_audit_non_uuid_id.sql`**" + L471 "Note: Flyttes til arkiv ved næste teknisk-gaeld-revision". L474 "_Ingen endnu. G019 flyttes hertil ved næste revision._"
**Faktisk tilstand:** G019 er stadig i aktiv-sektion, ikke flyttet til arkiv på trods af LØST-marker. Mange dage er gået siden trin 1-revision.
**Bevis:** Læs aktiv-fil; G019 stadig på L461.
**Konsekvens:** Aktiv-sektion er mudret med løste fund. "Næste revision" har ikke fundet sted.

### FN-021 [E] [verificeret] [mellem]

**Lokation:** `docs/strategi/bygge-status.md:5`
**Påstand (citat):** "**Sidste opdatering:** 14. maj 2026 (efter trin 4 — periode-skabelon + auto-lock + break-glass)"
**Faktisk tilstand:** Mange substantielle arbejdspakker er afsluttet siden (C001-C006, D1-D5, Q-pakken, R-runde-2 R1-R8, P-pakken P0-P3, T1, M1, R7-pakken R7a-R7h, H010). Filen mangler trin-rapport for alle disse.
**Bevis:** `git log --oneline --since="2026-05-14"` viser 50+ commits efter L5's "14. maj"-dato.
**Konsekvens:** Bygge-status er pålideligt outdated efter sin egen "Sidste opdatering"-dato. Læseren får billede af trin 4 som seneste leverance.

### FN-022 [F] [verificeret] [mellem]

**Lokation:** `.github/BRANCH_PROTECTION.md:20, 161`
**Påstand (citat):** "Do not allow bypassing the above settings (enforce admins) — ✓" + verification-output viser `enforce_admins: true`.
**Faktisk tilstand:** Branch protection-rules siger enforce_admins=true. MEN: Vi har midlertidigt deaktiveret den 2 gange i dag (H010-merge + follow-up-merge), brugt --admin merge, derefter re-aktiveret. Den faktiske "bypassing"-mekanisme er ikke dokumenteret nogen steder.
**Bevis:** `gh api .../enforce_admins` viste `enabled: false` mellem merges. Mathias-afgoerelser-entry L194-198 dokumenterer mønstret.
**Konsekvens:** Dokumentet er "korrekt" om current state men forklarer ikke override-praksis. H018 (cementering af `--admin`-regel) er åbent.

### FN-023 [F] [verificeret] [mellem]

**Lokation:** `README.md:65-66`
**Påstand (citat):** "**CI:** GitHub Actions kører hele pipelinen på PRs (`.github/workflows/ci.yml`)"
**Faktisk tilstand:** Der er nu TO workflows: `ci.yml` + `codex-notify.yml` (H010.7). README refererer kun til ci.yml.
**Bevis:** `ls .github/workflows/` returnerer begge filer.
**Konsekvens:** README er stale efter H010-merge. Læseren ved ikke om codex-notify-pipelinen.

### FN-024 [F] [verificeret] [mellem]

**Lokation:** `docs/strategi/arbejdsmetode-og-repo-struktur.md:120-128`
**Påstand (citat):** "Automatiseret Codex-trigger ... GitHub Action der trigger på commits til `docs/coordination/seneste-rapport.md`. Action kører Codex CLI mod rapport + diff'et siden sidste validering. Output committes som `docs/coordination/codex-reviews/<timestamp>.md`. Ingen auto-block, ingen auto-merge — Mathias ser begge rapporter og afgør."
**Faktisk tilstand:** Implementation er notification-only Pattern A (codex-notify.yml) — INGEN Codex CLI-eksekvering, INGEN auto-commit af review-output. Plan-afvigelse #1 i H010-rapport.
**Bevis:** Læs `.github/workflows/codex-notify.yml` — kun `gh issue comment`. Læs H010 slut-rapport plan-afvigelse #1.
**Konsekvens:** Scope-dokumentet beskriver intention; implementation er andet. Læseren tror Codex CLI kører automatisk — gør den ikke. Scope-dokumentet er ikke opdateret efter H010's plan-afvigelse.

### FN-025 [F] [verificeret] [mellem]

**Lokation:** `docs/strategi/arbejdsmetode-og-repo-struktur.md:155`
**Påstand (citat):** "GitHub Action + Codex-trigger sættes op som separat lille pakke. Kan kræve API-key-konfig — håndteres når relevant."
**Faktisk tilstand:** Action er allerede etableret i H010.7 (`.github/workflows/codex-notify.yml`). Tracker-issue #12 oprettet. Pipelinen er aktiv.
**Bevis:** `gh issue view 12` viser tracker-issue; `.github/workflows/codex-notify.yml` eksisterer.
**Konsekvens:** "Sættes op senere"-status er stale. Etableringen er færdig.

---

## [uverificeret]-fund

Ingen i denne audit. Alle fund har konkret bevis.

---

## Fil-dækningstabel

| Fil                                                     | Læst                                                                 | Bemærkning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                                             | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `CLAUDE.md`                                             | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `docs/LÆSEFØLGE.md`                                     | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `docs/strategi/vision-og-principper.md`                 | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `docs/strategi/stork-2-0-master-plan.md`                | delvist (sektioner samplet via grep + linje 1798-1870 + indeks-tjek) | 1900+ linjer; ikke linje-for-linje læst                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `docs/strategi/arbejds-disciplin.md`                    | delvist (L1-80 + spot-check)                                         | 300+ linjer; ikke fuldt                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `docs/strategi/bygge-status.md`                         | delvist (L1-200)                                                     | hovedstatus + 4 første trin-rapporter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `docs/strategi/arbejdsmetode-og-repo-struktur.md`       | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `docs/teknisk/teknisk-gaeld.md`                         | delvist (struktur + G017-G044 + L460-474)                            | grep'et indeksvis                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `docs/teknisk/permission-matrix.md`                     | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `docs/teknisk/lag-e-beregningsmotor-krav.md`            | ikke læst                                                            | uden for sample (ikke ramt af fund-jagt)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `docs/teknisk/lag-e-tidsregistrering-krav.md`           | ikke læst                                                            | uden for sample                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `docs/coordination/aktiv-plan.md`                       | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `docs/coordination/seneste-rapport.md`                  | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `docs/coordination/mathias-afgoerelser.md`              | delvist (L1-100 + L175-200)                                          | 200+ linjer; entries 1-15 og sidste 5 fuldt                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `docs/coordination/cutover-checklist.md`                | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `docs/coordination/rapport-historik/README.md`          | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `docs/coordination/rapport-historik/2026-05-15-h010.md` | delvist (L1-100)                                                     | sidste sektion (vision-tjek + næste) skummet                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `docs/coordination/codex-reviews/README.md`             | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `docs/coordination/arkiv/README.md`                     | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `docs/coordination/arkiv/r-runde-2-plan.md`             | delvist (sektioner)                                                  | 530+ linjer; sektioner 6.2, 7.1-7.5 fuldt                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `docs/coordination/arkiv/r-runde-2-recon.md`            | ikke læst                                                            | uden for sample                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `docs/coordination/arkiv/r7h-plan.md`                   | delvist (grep)                                                       | 660+ linjer; T2-tabel + setup-fix spot                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `docs/skabeloner/codex-review-prompt.md`                | ikke direkte læst i denne audit-runde                                | har eksisterende H010-context                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `docs/skabeloner/plan-skabelon.md`                      | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `docs/skabeloner/rapport-skabelon.md`                   | ikke læst i denne runde                                              | spot-check via H010-rapport                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `.github/CODEOWNERS`                                    | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `.github/BRANCH_PROTECTION.md`                          | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `.github/workflows/ci.yml`                              | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `.github/workflows/codex-notify.yml`                    | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `.husky/pre-commit`                                     | fuldt (1 linje)                                                      | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `scripts/fitness.mjs`                                   | delvist (L1-180)                                                     | 600+ linjer; whitelist-sektioner + extract-funktioner                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `scripts/migration-gate.mjs`                            | delvist (L1-120)                                                     | 200+ linjer; extract + INSERT-parser                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `scripts/run-db-tests.mjs`                              | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `scripts/types-check.sh`                                | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `scripts/schema-check.sh`                               | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `scripts/scope-cleanup-patterns.txt`                    | fuldt                                                                | 4 linjer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `package.json` (root)                                   | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `pnpm-workspace.yaml`                                   | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `turbo.json`                                            | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `.nvmrc` + `.tool-versions` + `.npmrc`                  | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `supabase/schema.sql`                                   | fuldt                                                                | 3 linjer placeholder                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `supabase/classification.json`                          | fuldt                                                                | 4 linjer; tom                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Migrations læst (29 af 76)**                          | fuldt headers                                                        | t1_drop_public, t1_audit_partitioned, t1_data_field_definitions, t1_helpers_stubs, t1_audit_filter_values, t1_bootstrap_admins, t2_superadmin_floor, t6_anonymization_tables, t7_pay_periods, t7c_break_glass, t1_inline_fix_audit_non_uuid_id, t7_disable_auto_lock, c004_pay_period_rpc_security, c005_admin_floor_termination, c001_retention_not_null, g028_classify_dispatcher, q_class_anon_rpcs, p1a_anonymization_strategies, p1a_fix_lifecycle_coalesce, p1b_anonymize_generic_apply, p3_break_glass_op_types_lifecycle, r7a_regprocedure_fix, r7d_is_active_status_alignment, r7h_state_insert_fix, r3_r4_commission_snapshots, r5_for_update, r6_drop_legacy_candidate, p0_gdpr_responsible_employee, p1c_anonymize_employee_wrapper |
| **Migrations ikke læst (47 af 76)**                     | ikke læst                                                            | uden for sample (T1 audit_filter_values v2, mange c/r/d/q-fix-migrations, alle p1a-fix-coalesce-iterationer udover én, alle R7b/R7c/R7e/R7f/R7g, D-serien D1-D5 fuldt, m.fl.)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Tests læst**                                          | fuldt                                                                | r3_commission_snapshots_immutability (verifikation af FN-017)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Tests ikke læst**                                     | spot-check                                                           | de fleste smoke + negative tests; verificeret ved navngivning ikke indhold                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `supabase/tests/README.md`                              | ikke fundet (filen findes ikke)                                      | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

**Live DB-state-checks udført:**

- `select count(*) from data_field_definitions` → 202 (verificerer FN-012)
- `select strategy_name, status, count(*) from anonymization_strategies` → 10 rows (verificerer FN-013, FN-014)
- `select count(*) anonymization_strategies/_mappings/break_glass_operation_types` → 10/1/2 (verificerer FN-013)
- `select fqn from pg_proc filter is_admin without has_permission` → 2 funktioner (verificerer FN-015)
- `gh repo view` → owner=Cphsales (verificerer FN-001)
- `gh api .../branches/main/protection` → enforce_admins-state midlertidigt fluet (verificerer FN-022)

---

## Egne refleksioner

Jeg har rørt 22 af de 24 fund selv via H010-arbejde, R-pakken eller tidligere. Defensiv impuls var stærkest på FN-013/FN-014 (stale strategi-rows fra MIN egen smoke-test-kørsel) og FN-016 (aktiv-plan.md som jeg selv skrev og glemte at opdatere post-merge). Jeg måtte tvinge mig til at klassificere dem som kritiske, ikke som "venter på næste pakke at fixe".

Områder hvor jeg sandsynligvis er blind: tests-mappen (kun læst 1 fil), 47 ulæste migrations, lag-e-krav-filer, sektioner i master-plan jeg ikke samplede. Hvis Codex går grundigere i SQL-headers vs body-kode, finder han sandsynligvis flere C-fund (kommentar modsiger SQL).

Det stærkeste fund-cluster er Kategori F (setup-claim modsiger setup) — 8 stk, alle verificerede. De peger på at fil-niveau-disciplin (R7-pakken, M1) er strammere end repo-niveau-disciplin (README, BRANCH_PROTECTION, scope-dokument). Inkonsistensen er størst hvor jeg ikke har bygget — README og BRANCH_PROTECTION er fra opstarts-pakken A8/A10 og er ikke vedligeholdt aktivt. Det kan være en blind plet jeg har overset fordi de "altid har stået der".
