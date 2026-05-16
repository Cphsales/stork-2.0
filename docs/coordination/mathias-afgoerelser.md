# Mathias' afgørelser

Append-only log over **strategiske retning-skift og ramme-låsninger** Mathias har truffet. Format pr. entry: Dato / Beslutning (kort) / Begrundelse (kort) / Plan-reference. Begrundelse er HVORFOR beslutningen blev taget, ikke HVAD den var.

**Hvad hører hjemme her:** beslutninger der ændrer retning, låser ramme, eller etablerer princip/disciplin der gælder på tværs af pakker.

**Hvad hører IKKE hjemme her:** pakke-leverancer (bygnings-detaljer, bug-fixes, specifikke commits). Dem finder du i commit-history + slut-rapporter i `docs/coordination/rapport-historik/`.

Append-only natur: fejl efter commit kan kun rettes via efterfølgende rettelse-entry, ikke ved historisk ændring. Hvis en begrundelse mangler i kilden: flag med `[ikke verificeret]`, fabrikér ikke.

---

### 2026-05-11 — Vision-og-principper.md låst som autoritativ kilde

- **Begrundelse:** Greenfield-bygning kræver én autoritativ kilde for "hvad er rigtigt"; 9 principper låses inden master-plan kropstekst kan reference dem konsistent.
- **Plan-reference:** `cfa1d4b` + `f415ef2` (v1.5-låsning)

### 2026-05-11 — Vision-princip 2: superadmin eneste hardkodede rolle

- **Begrundelse:** Andre roller skal være UI-baserede via `role_page_permissions`. Hardkodet `is_admin()` bryder "alt drift styres i UI".
- **Plan-reference:** `94e6cbb` (D4)

### 2026-05-11 / 2026-05-15 — Tre feedback-memories aktiveret for Code's selvdisciplin

- **Begrundelse:** Mathias' løse retning er ikke specifikation; Code skal vælge mindste rimelige tolkning og bekræfte, ikke spejle løse tanker til fast arkitektur. To efterfølgende memories adresserer plan-leverance-disciplin (kontrakt) og divergence-håndtering (stop og rapportér).
- **Plan-reference:** `feedback_no_spejling.md` (2026-05-11), `feedback_plan_leverance_is_contract.md` (2026-05-15), `feedback_dont_fabricate_to_fit.md` (2026-05-15).

### 2026-05-12 — Greenfield-princip i §3.4

- **Begrundelse:** 1.0's anti-mønstre kopieres ikke selv hvis det går hurtigere. Workarounds uden plan er drift.
- **Plan-reference:** `5ddc04b`

### 2026-05-14 — E-conomic udelades fuldstændig

- **Begrundelse:** E-conomic er bogføring; Stork har ingen bogføring. Brug `time_based` ikke `legal` på løn-tabeller. Holder retention-typer rene.
- **Plan-reference:** `97e1ecf` (R1) + master-plan rettelse 22-31

### 2026-05-14 — 11 cutover-blockers operationaliseret med verificerbare success-kriterier

- **Begrundelse:** Hver blocker skal have et konkret artefakt-tjek, ikke kun en ord-beskrivelse. Forhindrer subjektiv "klar"-tolkning.
- **Plan-reference:** `97e1ecf` — master-plan Hard cutover-blockers-sektion

### 2026-05-14 — Admin-rolle omdøbt til superadmin

- **Begrundelse:** Konsistens med vision-princip 2 — navngivning markerer eksplicit at det er eneste hardkodede rolle.
- **Plan-reference:** `becab86` (R1b)

### 2026-05-14 — Q1: "aktiv medarbejder"-definition i UI-konfig

- **Begrundelse:** Aktiv-definitionen kan ikke hardkodes (princip 4 — default = intet). Skal være UI-redigerbar via `employee_active_config`.
- **Plan-reference:** `740cf57` (Q1)

### 2026-05-14 — D1-D2: drop `legal` retention_type, indfør `permanent` med trigger

- **Begrundelse:** Legal er bogføring-kategori; 71 legal-rows konverteres til `time_based`/`permanent`. `permanent` kræver eksplicit trigger-validering for at undgå klassifikations-drift.
- **Plan-reference:** `8c0e70f`

### 2026-05-14 — Arbejds-disciplin etableret som autoritativt dokument

- **Begrundelse:** Trin-cyklus + AI-arbejdsdeling + Codex-fund-håndtering må være eksplicit dokumenteret for at undgå rolle-drift mellem aktører.
- **Plan-reference:** `9413d09`

### 2026-05-15 — Q-pakke: 22 RPC'er konverteret fra is_admin() til has_permission()

- **Begrundelse:** Vision-princip 2-operationalisering. Hver hardkodet `is_admin()`-check skal nu validere via UI-baseret permission-tabel. Etablerer at permission-systemet er UI-styret som ramme, ikke pakke-detalje.
- **Plan-reference:** `e3289a1`

### 2026-05-15 — Lock-mønster-arkitektur udskudt (G032)

- **Begrundelse:** Lock-pipeline-benchmark kræver realistic data-volume; pre-cutover er meningsløst at benchmarke uden sales-rådata. Udskydes til efter sales-tabel eksisterer.
- **Plan-reference:** `2a896cc` + G031 i `docs/teknisk/teknisk-gaeld.md`

### 2026-05-15 — Problem 1-4 (Mathias' låste design-afgørelser pre-R-runde-2)

- **Begrundelse:** Fire centrale forretnings-/disciplin-afgørelser låstes som "Problem 1-4" inden R-runde-2-planen kunne skrives. Problem 4 verificeret konkret: "UI-aktivering kræves pre-cutover for lifecycle-tabeller (anonymization_strategies, anonymization_mappings, break_glass_operation_types)". Problem 1-3 specifikt indhold `[ikke verificeret]` — kun nævnt som blok-reference.
- **Plan-reference:** `docs/teknisk/permission-matrix.md:83` (Problem 4 eksplicit); `docs/coordination/arkiv/r-runde-2-plan.md:486` (blok-reference). Mathias bør udfylde Problem 1-3 ordret i opfølgnings-entry hvis kilde findes.

### 2026-05-15 — Plan-leverance er kontrakt (disciplin-afgørelse)

- **Begrundelse:** Når Mathias har specificeret konkret (antal, navne, værdier), implementer alt; flag afvigelser FØR (ikke efter) — modsat no-spejling-reglen for løse retninger.
- **Plan-reference:** `feedback_plan_leverance_is_contract.md` (2026-05-15)

### 2026-05-15 — R-runde-2: live DB introspection som primær inventory-kilde

- **Begrundelse:** V1-håndskrevne inventories var ufuldstændige (3 readers vs faktisk 6 + cron); live recon via `pg_get_functiondef` + `cron.job` afslørede mismatch. Skift gælder fremover for "alle steder hvor X bruges"-inventories.
- **Plan-reference:** `c165ef1` (r-runde-2-plan v2)

### 2026-05-15 — Stop ved divergence, fix ikke iterativt (disciplin-afgørelse)

- **Begrundelse:** Når reality afviger fra forventning (input refererer ikke-eksisterende artefakt, godkendt arbejde fejler i eksekvering), stop og rapportér; skab ikke for at passe, fix ikke iterativt uden godkendelse.
- **Plan-reference:** `feedback_dont_fabricate_to_fit.md` (2026-05-15)

### 2026-05-15 — Huskelisten ligger ikke i repo

- **Begrundelse:** `huskeliste-stork-2-0.md` er internt arbejds-artefakt mellem Mathias og Claude.ai, ikke fælles aktør-dokumentation. Repo skal kun indeholde det alle aktører konsumerer.
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

### 2026-05-15 — Test-arkitektur: pay_periods-INSERT-tests mangler cleanup (G043+G044)

- **Begrundelse:** Strategisk teknisk gæld. Test-suite ikke idempotent på `pay_periods` — INSERT'er stale-rows der ikke kan ryddes op via DELETE pga. `pay_periods_lock_and_delete_check`-trigger (vision-princip 9). Skal løses før CI-grøn er pålideligt signal. 5 datapunkter samme dag (H010, H010-followup, H021 før+efter H022, H022.1) viste at omgåelse via dato-shift bare flytter problemet.
- **Plan-reference:** `docs/teknisk/teknisk-gaeld.md` G043 + G044

### 2026-05-15 — H022.1 disciplin-læring: defensiv minimal-diff over teknisk korrekthed er anti-pattern

- **Begrundelse:** H022's fixed-dato-shift havde levetids-vurdering 18 måneder; faktisk levetid var én CI-kørsel. Random-offset (valg B) var teknisk korrekt; minimal-diff (valg A) var defensiv tolkning. Plan-leverance-disciplin gælder også for valg af patch-strategi.
- **Plan-reference:** `feedback_plan_leverance_is_contract.md` (etableret som mønster-eksempel)

### 2026-05-15 — Codex-review-prompt-skabelon: 4 strategi-blok-typer aktive

- **Begrundelse:** H021's udvidede codex-notify-action differentierer mellem 6 trigger-typer (ny-plan-version, codex-feedback, code-feedback, plan-approved, plan-blokeret, slut-rapport). Krav-dokument-disciplin etableret med 4 brud-typer der udløser stop-signal via `<pakke>-V<n>-blokeret.md`. Plan-flow for I-pakker dokumenteret med 10-step round-trip-loop.
- **Plan-reference:** PR #13 (H021)

### 2026-05-15 — H020.1 disciplin-læring: yaml-spec i prompt er kontrakt, ikke retning (datapunkt #2)

- **Begrundelse:** branches-filter `branches: [main]` tilføjet som defensiv konvention i H021-implementation, ikke specificeret af Mathias. Anden datapunkt på 2 dage for at "minimal/defensiv tolkning over teknisk korrekthed" er anti-pattern. Cementerer plan-leverance-disciplin.
- **Plan-reference:** `feedback_plan_leverance_is_contract.md` + H020.1 PR #17

### 2026-05-16 — Frontend hosting-ramme: managed-service, ikke selv-hosting

- **Begrundelse:** Infrastruktur-vedligehold (SSL, DDoS, deploy-pipeline, monitoring, OS-patches, backup, disaster recovery) har ikke plads i to-personers projekt der allerede er pressede på resource. 1.0 hostes på Lovable's platform (managed); samme model bevares for 2.0. Specifik platform (Vercel vs. Cloudflare Pages) holdt åben — afgøres ved tilkobling i samme pakke som første frontend-side, så valget baseres på reelt arbejde frem for forhåndsantagelser.
- **Plan-reference:** Master-plan rettelse 32 (§0 Stack, Appendix A, Appendix B, Appendix C).

### 2026-05-16 — Overvågnings-system med trigger-ord (qwers/qwerr/qwerg)

- **Begrundelse:** Plan-automation-flowet etableret via H010+H016+H020+H021 manglede strukturerede trigger-ord for at undgå lange manuelle prompts pr. runde. Tre trigger-ord etableret: `qwers` aktiverer rolle, `qwerr` triggerer aktør-handling, `qwerg` er Mathias' eksplicitte byg-godkendelse. Strict approval-regel: plan er KUN approved når BÅDE Codex og Claude.ai har leveret approval. Codex og Claude.ai har forskellige roller: Codex på teknisk gennemførlighed, Claude.ai på krav-konsistens og kvik-løsning-detektion. Anti-glid-mekanisme indlejret via severity-disciplin (KRITISK/MELLEM/KOSMETISK) + runde-trapper + pakke-skala-disciplin (lille/mellem/stor).
- **Plan-reference:** `docs/coordination/overvaagning/` (tre prompt-filer) + `docs/strategi/arbejdsmetode-og-repo-struktur.md` ("Plan-flow med overvågnings-system"-sektion).
- **Note:** codex-notify.yml-workflow differentierer endnu ikke fuldt mellem `codex-feedback` og `claude-ai-feedback`. Code's overvågnings-prompt kompenserer ved at læse filer direkte i `plan-feedback/`. Workflow-opdatering håndteres som separat H-pakke når prioriteret.

### 2026-05-16 — Mathias-afgørelser-rollen omdefineret til strict strategiske retning-skift

- **Begrundelse:** Tidligere rolle (append-only log over ALT Mathias godkendte) skabte overlap med commit-history + slut-rapporter + master-plan Appendix C. Rensning: drop pakke-leverancer (bygnings-detaljer, bug-fixes), behold kun beslutninger der ændrer retning, låser ramme, eller etablerer princip/disciplin på tværs af pakker. Højere signal-to-noise. Vej A af tre muligheder (A=strict fokus, B=behold som er, C=slet helt).
- **Plan-reference:** Denne commit (clean-up af mathias-afgoerelser.md).

### 2026-05-16 — Oprydnings- og opdaterings-disciplin: obligatorisk i hver plan

- **Begrundelse:** Coordination-mappen vokser ukontrolleret med arbejds-artefakter fra afsluttede pakker; relaterede dokumenter glider ud af synkron uden eksplicit ansvar. Løsning: hver plan skal indeholde "Oprydnings- og opdaterings-strategi"-sektion (obligatorisk; manglende sektion = KRITISK feedback fra reviewers). Code udfører oprydning som DEL af build, ikke separat trin. Slut-rapport verificerer udførelse i ny "Oprydning + opdatering udført"-sektion. Ankret 4 steder: plan-skabelon, rapport-skabelon, Code's overvågnings-prompt (qwerg-fasen), arbejdsmetode-dokument.
- **Plan-reference:** Denne commit. Første implementering: H020-krav-og-data.md flyttet til `docs/coordination/arkiv/` retroaktivt.
