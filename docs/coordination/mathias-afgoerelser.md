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

### 2026-05-16 — Master-plan sandheds-audit: vision-dok-gaps lukket, FK-coverage som CI-blocker

- **Begrundelse:** Audit af master-plan mod vision-dokumentet afslørede to gaps: (a) Vision-meta-princip 3 "Sammenkobling eksplicit" havde ingen CI-håndhævelse — FK-disciplin var konvention, ikke teknisk regel. (b) Vision-princip 5 "Lifecycle for konfiguration" var implementeret via rettelse 27 men ikke reflekteret i §5 "Det vi står inde for". Løsning: §5 udvidet med to bullets, §3 udvidet med CI-blocker 19 (FK-coverage med allowlist for eksterne reference-ID'er), §0 fik reference til mathias-afgoerelser som kilde for strategiske retning-skift. Konsekvens: master-plan reflekterer nu alle 3 meta-principper + 9 operationelle principper. CI-blocker 19 implementeres som fitness-script-udvidelse i kommende byggetrin.
- **Plan-reference:** Denne commit. Master-plan rettelse 33 i Appendix C. Bygge-status trin 9 markeret PAUSET (jf. mathias-afgoerelser 2026-05-15).
- **G-nummer-kandidater identificeret i audit (ikke i denne commit):** Bygge-status klassifikations-tal-inkonsistens (202 vs 193); Cutover-blocker #6 G017 dækker ikke 2020-benchmark-artefakter; §0 Filosofi-overlap med §5; Cutover-blocker H-numre kobling til cutover-checklist ikke eksplicit.

### 2026-05-16 — Tx-rollback er default mønster for DB-tests; fitness-check håndhæver

- **Begrundelse:** G043+G044 viste at non-idempotente tests (uden BEGIN/ROLLBACK) skaber permanent prod-DB-drift på DELETE-blokerede tabeller. Workaround-rute (H022/H022.1's random-offset) flyttede kun problemet. Arkitektur-fix: alle DB-tests der INSERT'er i immutability + lifecycle-DELETE-restricted tabeller skal bruge `begin; ... rollback;`-wrap. Fitness-check `db-test-tx-wrap-on-immutable-insert` er CI-blocker; falsk-negativ for RPC-side-effects er kendt afgrænsning (G-nummer for senere Mønster D-udvidelse). DISABLE TRIGGER-pattern (engangs cleanup-migration) er one-shot pre-cutover, ikke vedvarende mekanisme — fitness-check sikrer at fremtidige tests aldrig opbygger drift.
- **Plan-reference:** H024 (plan V2, qwerg 2026-05-16). Etablerer test-skrivnings-disciplin der binder Lag E's test-arkitektur.

### 2026-05-16 — Forretningssandhed: org-struktur, teams, klienter, dataejerskab

- **Beslutning (Mathias 2026-05-16, T9 krav-dok-arbejde):**
  1. **Ejerskabs-kæde:** Copenhagen Sales ejer afdelinger; afdelinger ejer teams; teams ejer relationerne til klienter og medarbejdere.
  2. **Afdelinger ændres sjældent.** Når de ændres, bevares historik. Ny sandhed laver ikke gammel sandhed om — gammel sandhed står som den var.
  3. **Team kan ophøre som ledelses-handling.** Når et team ophører, forbliver medarbejderne ansatte uden team-tilknytning (ikke fyret, bare team-løse).
  4. **Klient kan aldrig dræbe et team.** Et team eksisterer uafhængigt af om dets klienter stopper.
  5. **Klient ejer sin egen data.** Salg, calls, og anden klient-data tilhører klienten — ikke teamet. Teamet er den operationelle enhed med ansvar på et givet tidspunkt. Hvis klient skifter team, følger dataen klienten.
  6. **Synlighed af gamle teams og afdelinger:** Når et team eller en afdeling ikke længere skal bruges, sættes det til ikke-aktivt. Det forhindrer at det vælges når nye medarbejdere eller klienter tilknyttes, men det bliver stående i systemet så gamle rapporter stadig kan slå op i det. Samme mønster som eksisterer for roller fra trin 5.
  7. **Én medarbejder kan kun være i ét team ad gangen.** Det gælder også stab — ingen stab-undtagelse i 2.0 (modsat 1.0). Hvis nogen skal kunne se data på tværs af flere teams (fx FM-chef), løses det via rollen — ikke ved at give dem flere team-tilknytninger. Rollen kan have et scope der hedder "ser alt under min afdeling" eller "ser alt".
  8. **Migration af klient-team-historik fra 1.0:** Ingen fast grænse for hvor langt tilbage data hentes. Code laver et script der finder uoverensstemmelser i 1.0's data og giver Mathias en rapport. Mathias retter i 1.0 eller markerer hvad der skal håndteres ved import. Code laver udtræks- og upload-script; Mathias eksekverer manuelt og afgør konkret omfang ved eksekvering. Hele historikken kan hentes.
  9. **Teams og afdelinger anonymiseres ikke.** Navne på dem er forretningsdata, ikke persondata. De bliver stående evigt så historik og audit-spor bevares. Følger reglen om at struktur bevares evigt; kun PII anonymiseres når formålet er opfyldt.
- **Begrundelse:** Disse forretningssandheder var implicit kendt men ikke registreret samlet. Claude.ai fabrikerede mekanismer ("teams lukkes ved at sætte to_date", "status-felt på org_units") i T9 krav-dok-arbejde fordi sandhederne ikke stod et autoritativt sted. Registreres her som ramme-niveau-afgørelser så Code/Codex/Claude.ai kan reference dem uden gætning.
- **Plan-reference:** Denne commit. T9-krav-dok (`docs/coordination/T9-krav-og-data.md`) opdateres til at referere disse fakta. Master-plan §1.7 er konsistent med punkt 1, 4, 5, 7; punkt 2, 3, 6 er nye registreringer der supplerer §1.7's tavshed om team/afdeling-livscyklus; punkt 8, 9 supplerer §0.5 og §1.4 med konkrete T9-konsekvenser.

### 2026-05-16 — Fire-dokument-disciplin: rolle-rensning og obligatorisk konsultations-artefakt

- **Beslutning:** Fire dokumenter har ligeværdig autoritativ rolle for at sikre retningen holder: `vision-og-principper.md`, `stork-2-0-master-plan.md`, `mathias-afgoerelser.md`, og pakkens `<pakke>-krav-og-data.md`. Hver plan og slut-rapport skal eksplicit verificere mod alle fire via obligatorisk "Fire-dokument-konsultation"-sektion (samme tier som "Oprydnings- og opdaterings-strategi" — manglende sektion = KRITISK feedback).
- **Rolle-rensning:**
  - **Codex** = ren kode-validering. Bugs, RLS-huller, SQL-fejl, edge cases, teknisk gennemførlighed, akkumuleret gæld. Verificerer IKKE plan mod forretnings-dokumenter.
  - **Claude.ai** = ren forretnings-dokument-konsistens. Verificerer at planen lever op til alle fire forretningsdokumenter. Skriver IKKE kode-vurderinger.
  - **Mathias** = forretnings-beslutninger + endelig godkendelse (uforandret).
- **Begrundelse:** Klare roller frem for alle-tjækker-alt. Codex og Claude.ai havde overlap på "bryder planen vision-principper" og "dækker planen krav-dok". Resultat: ingen af dem ejede tjekket konsekvent; mathias-afgørelser blev ikke konsulteret af nogen (gap der lod Claude.ai fabrikere i T9-arbejdet). Håndhævelse sker via observerbart artefakt i plan-fil (firekolonne-tabel: dokument / konsulteret / referencer / konflikt) som Claude.ai blokerer planen på hvis ikke udfyldt. Approval-reglen er dobbelt port: plan kun approved når både Codex (kode) OG Claude.ai (forretnings-dokumenter) har approved.
- **Plan-reference:** Denne commit. Otte fil-ændringer: `arbejds-disciplin.md` (AI-arbejdsdeling renses), `plan-skabelon.md` (ny Fire-dokument-konsultation-sektion), `rapport-skabelon.md` (Vision-tjek udvides), `codex-overvaagning.md` (plan-review-fokus renes til kode), `codex-review-prompt.md` (niveau 1-prefix renes), `code-overvaagning.md` (plan-arbejde forpligtes til at udfylde tabel), `claude-ai-overvaagning.md` (NY — formel Claude.ai-rolle i overvågnings-flow), denne entry.

### 2026-05-16 — CLI-automation-niveau for Code og Codex: sprørgsmål-flaskehals fjernet

- **Begrundelse:** Code og Codex spurgte om hver enkelt kommando (sleep, git status, git commit) hvilket gjorde Mathias til konstant flaskehals og dræbte automation-effekten. Sikkerheden ligger ikke i CLI-approval-prompts men i proces-laget: krav-dok-kontrakten i main, qwerg-godkendelse før build-start, lag-boundary-godkendelse, CI-blockers, branch protection, Codex-review-loop. Disse er uberørt.
- **Løsning:** Code kører `--permission-mode bypassPermissions` (fuld autonomi, ingen prompts). Codex kører `-s workspace-write -a never` (skriv kun i repo + tmp + memories, ingen prompts). Forskellen er bevidst: Code's rolle kræver mange kommando-typer (pnpm, supabase, gh, git, sql); Codex' rolle er fokuseret på read + review + push-til-egen-branch og har ikke brug for at gå uden for repo. Aliases i `~/.bashrc` gør det permanent. Bash backslash-escape (`\claude`, `\codex`) bypasser alias for én kommando hvis nødvendigt.
- **Plan-reference:** Denne commit. Backups taget: `~/.codex/config.toml.bak.2026-05-16` + `~/.claude/settings.local.json.bak.2026-05-16`. Ingen ændring til eksisterende config-filer — aliases er additive.

### 2026-05-19 — Compliance-ansvarlige er konkrete medarbejdere, ikke rolle eller permission

- **Beslutning:** §1.7 + §1.13's tekst om "UI-rolle-tildelinger via role_permission_grants" (commit b5d61d8) renses. Korrekt formulering: compliance-ansvarlige (GDPR, AMO, AI) er én eller flere konkrete medarbejdere valgt i UI — ikke rolle, ikke permission. Pr. ansvars-type kan flere medarbejdere have ansvaret samtidigt. Reflekterer Mathias-afgørelse 2026-05-14 (Korrektion C) der allerede er afspejlet i cutover-blocker #3.

- **Begrundelse:** GDPR har ikke noget med systemets permissions at gøre. Permissions er adgangs-mekanik (hvad må medarbejderen i systemet). Compliance-ansvarlig er metadata om hvem der har det operationelle ansvar (modtager fx alarmer). De to ting er ortogonale. Sammenblanding skaber falsk kobling.

- **Plan-reference:** §1.7 + §1.13 opdateret i samme commit. Konkret mekanik designes når relevant RPC eller cutover-blocker kræver det — ikke i T9-fundament.

### 2026-05-18 — Master-plan §1.7 opdateret til at matche T9-omstart-rammen

- **Beslutning:** Master-plan §1.7 "Identitet og rettigheder" omskrevet til at reflektere T9-omstart-rammen (2026-05-17 entry, 15 punkter). Pre-omsadlings-tekst fjernes som forkert fundament. Konkret fjernet/erstattet:
  - 4-dim permission med scope (all/subtree/team/self) → 3-niveau (Område→Page→Tab) + 2 akser ((kan_tilgå/kan_skrive) × visibility (Sig selv/Hiraki/Alt))
  - `org_unit_closure`-navn → `org_node_closure`
  - `role_page_permissions` som primær → `role_permission_grants` som primær (legacy bevaret som readonly fallback)
  - `acl_subtree` → `acl_subtree_org_nodes` + `acl_subtree_employees`
  - Implicit "kan_view/kan_edit"-formulering → kan_tilgå/kan_skrive
  - Stabs-team/stab-rolle helt fjernet (T9-omstart-rammen punkt 8)
  - `is_compliance_officer()` fjernet (T9-omstart-rammen punkt 10 + vision-princip 2: GDPR/AMO/AI-ansvarlig er UI-rolle-tildelinger på relevante areas)
  - Fortrydelses-mekanisme tilføjet (T9-omstart-rammen punkt 13-14)
  - Klient-til-team-only-binding tilføjet (T9-omstart-rammen punkt 6)
  - Knude-løs medarbejder som gyldig tilstand tilføjet (T9-omstart-rammen punkt 7)
  - Write-mekanik-sektion tilføjet: §1.1's session-var-pattern + `stork.t9_write_authorized` for T9 write-RPCs/tabeller

- **Begrundelse:** H011's §1.7-modsigelse identificeret 2026-05-15 lukkes. Pre-omsadlings-tekst om 4-dim permission, scope=team, stab-rolle, `org_unit_closure`-navn og `is_compliance_officer` var forkert fundament. T9-omstart-rammen (2026-05-17, 15 punkter) er det korrekte fundament. Master-plan og T9-kode skal være konsistente; §1.7 var den vigtigste hængende inkonsistens.

  Pre-T9-leverancen byggede 6 write-tabeller med kun SELECT-policies + FORCE RLS, hvilket gjorde at SECURITY INVOKER-write-RPCs ikke kunne skrive fra authenticated-kontekst. §1.1's session-var-pattern (allerede etableret pre-T9 i R1B, P1a m.fl.) skal anvendes konsekvent i T9 også.

- **Plan-reference:** Appendix C rettelse 35. Migration `supabase/migrations/20260518100000_t9_fundament_supplement.sql` implementerer §1.1's pattern (11 RPCs får session-var efter has_permission-check; 6 tabeller får INSERT + UPDATE policies). Opfølgnings-commit samme dag lukker tre flag identificeret efter første commit: (1) §1.13's "Konsekvens for permissions" omskrevet til at matche §1.7's princip (GDPR/AMO/AI-ansvarlig er UI-rolle-tildelinger; ingen `is_compliance_officer()`); (2) `pending_change_approve` + `pending_change_undo` får dispatcher der gates'er approve/undo på `has_permission(underliggende_page, can_edit=true)` per change_type — approve er ikke ny adgang men can_edit på ressourcen ændringen rammer (T9-omstart-rammen punkt 12); (3) `role_permission_grants` får DELETE-policy med samme session-var-mønster (eneste T9-tabel med faktisk DELETE-vej fra authenticated; øvrige 5 bruger deactivate-flag-mønster).

- **Konsekvens for fremtidige byggetrin:** §1.1's pattern er nu eksplicit dokumenteret i §1.7's "Write-mekanik"-sektion. Build-Code skal verificere mod §1.1 + §1.7 før hver write-RPC + write-tabel implementeres. Plan-skabelon kan udvides med pattern-checklist i senere disciplin-pakke.

### 2026-05-17 — T9 omstart efter afdæknings-session: ét træ, permission-elementer, synlighed udledt af placering

- **Beslutning:** T9-runden V1-V3 trækkes tilbage. Nyt krav-dokument skrives på
  basis af dybde-afdækning. Følgende afgøres som ramme:
  1. **Ét træ** — organisations-træet (Copenhagen Sales → afdelinger → teams →
     medarbejdere). Permission-elementer (område, page, tab) er ikke et træ;
     de er steder hvor rettigheder gælder, nestede i tre niveauer.
  2. **Permission-elementer** er DATA i DB i tre niveauer: Område → Page → Tab.
     Alle tre niveauer kan oprettes/deaktiveres i UI uden deploy.
     Page-implementation (React-komponent) er kode; registret er data.
     Bekræfter Mathias' tidligere afgørelse 2026-05-11 ("db skal også styre i UI").
  3. **Permission-modellen har to akser:** (a) hvad man kan tilgå (kan_se/tilgå
     - kan_skrive pr. område/page/tab); (b) synlighed på data (Sig selv / Hiraki /
       Alt). Begge akser sættes UI-styret pr. (rolle × område × page × tab).
       Samme rolle kan have forskellig synlighed på forskellige elementer.
       Eksempel: TM-sælger har Sig selv på vagtplan-page og Hiraki på kalender-page.
  4. **Synligheds-værdier kun tre:** Sig selv / Hiraki / Alt. Team som scope-værdi
     udgår — Hiraki dækker det.
  5. **Hiraki udledes af medarbejderens placering i organisations-træet.** Ser
     egen knude og alt under. Knude-løs medarbejder + synlighed=Hiraki = ser intet.
  6. **Klienter tilknyttes kun knuder af type team.** Aldrig afdelings-knuder.
  7. **Knude-løs medarbejder er gyldig tilstand.** Når et team lukkes, bliver
     medarbejdere knude-løse; de forbliver ansatte og kan tildeles ny placering
     i UI.
  8. **Ingen stabs-team i 2.0.** Stabs-konceptet fra 1.0 udgår fuldstændig.
  9. **Cross-team-adgang løses via rolle med synlighed=Hiraki eller Alt,** ikke
     ved at give medarbejdere flere placeringer.
  10. **Superadmin = synlighed=Alt på alle elementer.** Eneste hardkodede rolle.
      Mathias og Kasper har superadmin-rollen, placeret på en "Ejere"-afdeling
      i træet.
  11. **Alle navne på afdelinger og teams oprettes i UI.** Krav-dokumenter
      specificerer ingen konkrete navne.
  12. **Hvem der må oprette/ændre/lukke knuder styres via rettigheder i UI.**
      Ingen særlig ledelses-handling-kategori; struktur-adgang er almindelig
      rettighed.
  13. **Alle ændringer med gældende dato følger fortrydelses-mekanisme:**
      gældende dato → godkendelse → fortrydelses-periode → ændring kan rulles
      tilbage i UI indtil periodens udløb → derefter permanent. Gælder struktur-
      ændringer, medarbejder-placeringer, klient-flytninger.
  14. **Fortrydelses-periodens længde konfigureres i UI.** Ingen hardkodet værdi.
  15. **Klient-til-team-import udskydes til trin 10** (kræver klient-skabelon
      der bygges der). T9 leverer organisations-træ-import + medarbejder-
      placeringer.

- **Begrundelse:** V1-V3 var bygget på misforstået fundament. Forretnings-
  sandhederne om visibility-model, permission-struktur og terminologi var ikke
  registreret samlet og blev løbende fabrikeret af Claude.ai. Disciplin-fejl:
  Claude.ai godkendte planer der modsagde eksisterende mathias-afgørelser.
  Disse afgørelser registreres nu som ramme-niveau-afgørelser så Code/Codex/
  Claude.ai kan reference dem uden gætning.

- **Plan-reference:** Denne commit. Nyt krav-dokument:
  `docs/coordination/T9-krav-og-data.md`. Gamle artefakter arkiveret i
  `docs/coordination/arkiv/T9-foraeldet-2026-05-17/`.

- **Konsekvens for Claude.ai-rolle:** Læring registreret om at fire-dokument-
  konsultations-tabellen skal verificere mod låste sektioner i tidligere
  dokumenter (særligt §5 i stork-2-0.md som var kilde til flere af de
  misforståede ting) — selvom de dokumenter ikke er fuldt autoritative, er
  deres indhold ofte konsistent med Mathias' tænkning og bør konsulteres.

### 2026-05-17 — To flow-ændringer (modsigelse → afvis; Codex opgraderings-rolle)

Begge ændringer gælder ALLE fremtidige pakker, ikke kun T9.

**Ændring 1: Modsigelse → afvis**

Hvis Code under plan-arbejdet finder modsigelse — internt i krav-dokumentet,
eller mellem krav-dokumentet og fire-dokument-rammen (vision, master-plan,
mathias-afgørelser): han STOPPER. Commit blokker-fil
(`docs/coordination/plan-feedback/<pakke>-V<n>-blokeret.md`) med konkret
reference. Ingen argumentation videre — Mathias afgør om krav-dok skal
præciseres eller om Code's fortolkning er forkert.

Det gælder også Codex under plan-review: modsigelse markeres som KRITISK
feedback (ikke G-nummer-kandidat), og planen passerer ikke på trods af
modsigelsen.

Eksisterende disciplin "Krav-dokument-disciplin" skærpes til at dække alle
fire forretnings-dokumenter, ikke kun krav-dokumentet.

- **Begrundelse:** T9 V1-V3 disaster skete fordi Claude.ai godkendte planer
  der modsagde eksisterende mathias-afgørelser. Disciplin skal være eksplicit:
  modsigelse → afvis, ikke "navigér uden om".

**Ændring 2: Codex opgraderings-rolle**

Codex' rolle udvides fra "find fejl" til "find fejl + foreslå opgraderinger".
Hvis Codex har en bedre kodemetode end den Code har planlagt: Codex må
foreslå opgraderingen med severity OPGRADERING (ny severity, separat fra
KRITISK / MELLEM / KOSMETISK).

Code skal i sin V<n+1>-runde eksplicit håndtere hvert OPGRADERING-forslag:

- **AFVIS** med konkret teknisk begrundelse, ELLER
- **IMPLEMENTER** opgraderingen og lever V<n+1> baseret på den

Opgraderings-forslag er ikke approval-blokerende. Codex må levere APPROVAL
og samtidig foreslå OPGRADERING. Code afgør om opgraderingen tages med
før build.

Grænse: opgraderings-forslag må ALDRIG indebære ændring af formål, scope,
leverancer eller tilføjelse af features. Hvis "bedre løsning" reelt ændrer
hvad planen leverer → "OUT OF SCOPE — kræver Mathias-runde".

- **Begrundelse:** Codex har ofte teknisk indsigt der overstiger Code's første
  løsning. Hidtidig rolle begrænsede ham til "find fejl". Udvidelsen lader
  hans værdi komme i spil tidligt i plan-runden, ikke kun som teknisk gæld
  efter build.

- **Plan-reference:** Denne commit. Fire fil-ændringer:
  - `docs/strategi/arbejds-disciplin.md` (Modsigelses-disciplin + Codex-opgraderings-rolle)
  - `docs/coordination/overvaagning/code-overvaagning.md` (disciplin-regel + plan-fase-tilstand for OPGRADERING)
  - `docs/coordination/overvaagning/codex-overvaagning.md` (OPGRADERING severity + opgraderings-rolle-sektion)
  - Denne entry

### 2026-05-18 — Plan-flow- og krav-dok-disciplin: T9-læring lukkes på styringsfil-niveau

- **Beslutning:** Fire huller i plan-flowet og krav-dok-skrivning lukkes som ramme-låsning der gælder alle fremtidige pakker:
  1. **Plan-dybde-krav** — plan-skabelonen kræver eksakt indhold (signatur + body-skitse) per leverance, ikke prosa. Ny obligatorisk "Fundament-tjek-passeret"-sektion (parallel til Fire-dokument-konsultation og Oprydnings-strategi) med 7 tjek (write-vej-fundament + plan-detalje-eksplicitet).

  2. **Codex end-to-end-tjek** — Codex' Plan-review udvides med 7 obligatoriske end-to-end-tjek per write-vej: GRANT+policy+session-var-tre-pak, SELECT-bredde, backdated guards, apply-dispatcher-extension specificeret per RPC, jsonb-format konsistens, eksempel-row gennem flow, krydsetjek mod plan's egen Fundament-tjek-sektion. Niveau 1-prefix i codex-review-prompt-skabelon udvides parallelt.

  3. **Krav-dok-skrivnings-disciplin** — claude-ai-overvaagning får ny sektion: hver påstand i krav-dok kan peges på Mathias-kilde (direkte ord, mathias-afgoerelser-entry, vision-princip, master-plan-paragraf). Mangler kilde: spørg, skriv ikke. `conversation_search` obligatorisk før reference til tidligere afgørelse. Krav-dok indeholder kun tanker — ingen datamodel, ingen kode-skitser.

  4. **Datamodel-grænse** — arbejds-disciplin.md AI-arbejdsdeling: Claude.ai MÅ IKKE designe datamodel (tabeller, kolonner, RPC-signaturer, granularitets-valg, helper-RPC-forslag, kode-skitser, "Model A/B/C") — det er Code's bord i plan-fasen. Datamodel-STOP-regel tilføjet til Claude.ai's disciplin-regler i claude-ai-overvaagning.

- **Begrundelse:** T9-runden afdækkede to fejl-mønstre med samme rod. Første: plan-V'er passerede plan-fase med fundament-mangler (GRANT/policy/session-var, SELECT-bredde, jsonb-format) fanget post-hoc af Codex, ikke ex-ante af plan-disciplin. Andet: krav-dok-fabrikation ("UI-rolle-tildelinger via role_permission_grants") der modsagde Korrektion C 2026-05-14 (compliance-ansvarlige er konkrete medarbejdere, ikke rolle/permission). Roden: krav-dok og plan blev godkendt uden tilstrækkelig fundament- og kilde-disciplin. Hullerne lukkes på styringsfil-niveau så de aktiveres automatisk hver runde, ikke kun når Mathias husker dem.

- **Plan-reference:** Denne commit. Fem fil-ændringer:
  - `docs/strategi/arbejds-disciplin.md` — to nye Claude.ai MÅ IKKE-punkter (designe datamodel + skrive påstande i krav-dok uden Mathias-kilde)
  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` — ny "Krav-dok-skrivnings-disciplin"-sektion (kilde-disciplin + rene tanker, med T9-eksempel) + blokker-punkt 5 (Fundament-tjek-passeret-sektion) + datamodel-STOP i disciplin-regler
  - `docs/skabeloner/plan-skabelon.md` — Implementations-rækkefølge udvidet (Type, Eksakt indhold, Afhængigheder) + ny obligatorisk "Fundament-tjek-passeret"-sektion med 7 tjek
  - `docs/coordination/overvaagning/codex-overvaagning.md` — Plan-review udvidet med 7 obligatoriske end-to-end-tjek per write-vej
  - `docs/skabeloner/codex-review-prompt.md` — niveau 1-prefix udvidet med samme end-to-end-tjek-liste

- **Konsekvens for fremtidige pakker:** Plan kan ikke approves uden udfyldt Fundament-tjek-passeret-sektion. Krav-dok kan ikke skrives uden kilde-disciplin. Begge tjek er nu i overvågnings-flowet — Claude.ai blokerer plan på struktur (sektion findes), Codex blokerer på indhold (sektion stemmer).

### 2026-05-18 (anden runde) — Output-kvalitets-disciplin: fire tillæg til plan-flowet

- **Beslutning:** Fire yderligere tillæg til plan-flowet for at øge output-kvalitet i nuværende manuelle flow. Automation af flowet er udskudt til efter 15. juni 2026 (Agent SDK credits lander på subscription-plans). Denne pakke fokuserer på disciplin og kildegrundlag, ikke automation.
  1. **Forretningsspørgsmål-fase FØR krav-dok** — ny fase mellem pakke-idé og krav-dok-skrivning. Claude.ai-forfatter stiller forretnings-spørgsmål til Mathias før krav-dok skrives; svar dokumenteres i `docs/coordination/<pakke>-forretningsspoergsmaal.md` som kildegrundlag. Skip-kriterier for mikro-pakker, allerede-låst-kontekst, og tekniske infrastruktur-pakker. Ny skabelon `docs/skabeloner/forretningsspoergsmaal-skabelon.md`.

  2. **Krav-dok review-runde via separat Claude.ai-session** — krav-dok kører gennem reviewer (separat chat) før Mathias-commit. Reviewer er ren Claude.ai-instans uden forfatter-bias. Krav-dok-feedback placeres i `docs/coordination/krav-dok-feedback/`. **Note (2026-05-18 senere — commit `4a9f329`):** Oprindelig tekst omtalte "Tre Claude.ai-roller" som separat-chat-struktur. Dette blev fortrudt samme dag — roller er implicit per chat, ikke en eksplicit aktiverings-mekanisme. Selve krav-dok-review-runden består dog som disciplin.

  3. **NEEDS-MATHIAS-severity** — femte severity-niveau parallel til KRITISK/MELLEM/KOSMETISK/OPGRADERING. Fanger fund hvor reviewer ikke kan afgøre uden Mathias-input (to gyldige valg, ny ramme-beslutning, dokument-modsigelse, scope-grænse-tvivl). Stopper plan i alle runder; Code må ikke lave V<n+1> før Mathias har afgjort. Max 2 per review for at undgå eskalering-misbrug.

  4. **Plan-pre-push-tjekliste i Code** — 9-tjek-tabel Code skal igennem FØR plan-commit. Inkluderer formåls-konsistens, fire-dokument-tabel, Fundament-tjek-passeret, oprydnings-strategi, krav-dok-dækning, scope-grænse, implementations-rækkefølge-format, mathias-afgørelser-konsistens, NEEDS-MATHIAS-flag for nye ramme-beslutninger.

- **Begrundelse:** T9 + efterfølgende fabrikation viste at output-kvalitet kunne øges ved (a) bedre kildegrundlag før krav-dok, (b) review af krav-dok før plan-fase, (c) en severity-mekanisme der eskalerer korrekt til Mathias i stedet for at lade reviewers tvinge V<n+1>-runder uden afgørelses-grundlag, (d) selv-disciplin i Code før push der fanger basale mangler.

- **Bonus-rettelse:** OPGRADERING-niveau tilføjet til severity-listen i `docs/strategi/arbejdsmetode-og-repo-struktur.md` — eksisterende mangel siden 2026-05-17 fanget af recon under denne pakke.

- **Ærligheds-flag:** Et femte forslag (slut-rapport-honesty-tjek med plan-afvigelser-sektion) blev oprindeligt foreslået af Claude.ai, men recon afslørede at det allerede eksisterer i rapport-skabelonen — fabrikation, ikke nyt fund. Fjernet fra pakken inden implementation. Flaget her for at dokumentere at fabrikation skete på dette niveau af samtalen og at recon fangede det inden commit.

- **Plan-reference:** Denne commit. Syv fil-ændringer:
  - `docs/skabeloner/forretningsspoergsmaal-skabelon.md` (NY)
  - `docs/strategi/arbejdsmetode-og-repo-struktur.md` (aktør-rækkefølge: trin 1 + 3 indsat, 15 trin total; mappe-struktur opdateret; krav-dok-feedback filnavngivning; severity-disciplin udvidet med OPGRADERING + NEEDS-MATHIAS)
  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` (forretningsspørgsmål-fase-sektion + krav-dok-review-rolle-sektion + NEEDS-MATHIAS i severity + anti-glid-regel)
  - `docs/strategi/arbejds-disciplin.md` (Claude.ai-rolle udvidet med krav-dok-reviewer + køre forretningsspørgsmål-fase; NEEDS-MATHIAS-severity som ny sektion + tabel udvidet)
  - `docs/coordination/overvaagning/codex-overvaagning.md` (NEEDS-MATHIAS i severity + anti-glid-regel)
  - `docs/coordination/overvaagning/code-overvaagning.md` (NEEDS-MATHIAS-håndtering i tilstand-liste + Plan-pre-push-tjekliste-sektion)
  - Denne entry

- **Konsekvens for fremtidige pakker:** Stor-pakker kører nu forretningsspørgsmål-fase → krav-dok → krav-dok-review → plan-fase. Reviewers kan markere NEEDS-MATHIAS som eskaleringsvej når dokument-modsigelse eller ramme-beslutning kræver Mathias-input. Code skal igennem 9-tjek-pre-push før plan-commit. Net-effekt: færre iterationer pr. pakke, men ekstra fase op-i-flowet (forretningsspørgsmål + krav-dok-review).

### 2026-05-20 — Lag 1 disciplin-fundament komplet

- **Beslutning:** Lag 1's disciplin-fundament er nu komplet etableret på main. Fundamentet består af fire komplementære lag:
  1. **V5.3 workflow-spec** (PR #48 `708ab8d`): 7-step flow, marker-protokol (halt/log/positive markers), dialog-protokol (FLAG → LØS → STOP), `scripts/codex-review.sh`, `scripts/claude-ai-prompt.sh`, Cadence (Claude.ai trigger-baseret review-frekvens)
  2. **PR #42's disciplin-indhold selektivt merget** (PR #52 `8898d3e`): forretningsspoergsmaal-fase (Claude.ai-forfatter), krav-dok-review-rolle (Claude.ai-reviewer separat fra forfatter), NEEDS-MATHIAS-severity (5. niveau parallel til KRITISK/MELLEM/KOSMETISK/OPGRADERING), end-to-end-tjek per write-vej (7 obligatoriske kode-tjek for Codex), Fundament-tjek-passeret-sektion i plan-skabelon, Plan-pre-push-tjekliste (9-tjek for Code før plan-commit), datamodel-STOP for Claude.ai, krav-dok-skrivnings-disciplin (kilde-disciplin + rene tanker)
  3. **Lag 1 interne huller lukket** (PR #53 `048d021`): G055 — `scripts/codex-review.sh` parser udvidet med severity-prefix-detection (`^KRITISK\b` → exit 2, `^NEEDS-MATHIAS\b` → exit 4) så disciplin nu håndhæves på script-niveau, ikke konvention. G056 — `codex-overvaagning.md` rolle-grænse præciseret så forretnings-dokument-modsigelser altid går via OUT OF SCOPE-vejen (Claude.ai's bord), KRITISK + NEEDS-MATHIAS er kun for kode-niveau-fund hos Codex
  4. **Workflow-skabelon konsistens** (del af PR #52): step 1-tabel udvidet med 3 sub-trin (forretningsspoergsmaal → krav-dok → krav-dok-review), Filer-pr-pakke-tabel udvidet med `<pakke>-forretningsspoergsmaal.md` + `krav-dok-feedback/*`

- **Begrundelse:** PR #42 var Mathias' egen disciplin-pakke fra 18. maj 2026 men stod åben fordi den var skrevet FØR Lag 1 etablerede V5.3. Selektiv merge gennem Lag1-filter (PR #42-indhold kun inkluderet hvor det tilfører Lag 1 værdi uden at overskrive) lukker fundamentet uden friktion. Codex' meta-review bekræftede match og afslørede 2 latente huller i Lag 1 (G055+G056) som blev lukket samme dag. Resultat: én sammenhængende disciplin-pakke der dækker hele plan-automation-flowet fra forretningsspoergsmaal → krav-dok → krav-dok-review → plan → build → slut-rapport.

- **Plan-reference:** 3 squash-commits på main:
  - `8898d3e` PR #52 "Disciplin-fundament merge fra PR #42 (selektiv, Lag1-filteret)" — 11 commits squashed, 12 filer ændret
  - `048d021` PR #53 "Lag 1 mini-disciplin: G055 + G056 lukket" — 1 commit, 3 filer ændret
  - `41cf359` PR #54 "Arkivér PR42-handoff-doc efter merge" — 1 commit, 1 fil flyttet
  - Slut-rapport: `docs/coordination/rapport-historik/2026-05-20-Lag1-disciplin-fundament.md` (denne pakke)

- **Konsekvens for fremtidige pakker:** Disciplin-fundamentet er nu fuldt operationelt. Stor/mellem-pakker kan straks bruge forretningsspoergsmaal-fase + krav-dok-review-flow. NEEDS-MATHIAS-eskalering håndhæves på script-niveau (exit 4). KRITISK-severity blokerer automatisk (exit 2) selv uden halt-marker. Codex' rolle er ren — alle forretnings-konflikter går via OUT OF SCOPE-vejen til Claude.ai. Næste pakke kan starte step 1 uden yderligere disciplin-arbejde.

### 2026-05-20 — Trin 10 forretnings-ramme: klient som forretnings-fundament

- **Beslutning:** Forretnings-sandheder om klienten låses som ramme-niveau-afgørelser før trin 10 (klient-skabelon) bygges:
  1. **Klient ejer rå data.** Salg, calls og andre rå data der kobles på klienten følger klienten ved team-skift. Teamet bevarer historik om at have ejet klienten i en periode, men ejer ikke dataen.

  2. **Dato afgør sandheden.** Når et salg laves på dato X, og klienten på dato X var knyttet til team Y, så er den binding historisk fast. Senere ændringer i klient-team-tilknytning ændrer ikke gamle data. Annulleringer eller anden feedback der kommer senere på et salg rammer det team der ejede klienten på salgs-tidspunktet, ikke det nuværende team.

  3. **Klient anonymiseres ikke.** Klient-navn er forretningsdata, ikke persondata. Klient-rækken bliver stående evigt så historik og audit-spor bevares. Felter på klienten kan dog være direkte persondata (fx en kontaktperson) — sådanne felter har egne sletteregler på felt-niveau, ikke klient-niveau.

  4. **Klient-livscyklus = aktiv/inaktiv.** Ingen mellem-tilstande. Samme mønster som teams og afdelinger (jf. 2026-05-16 punkt 6). Inaktiv klient bliver stående for historik, men kan ikke vælges som ny team-tilknytning.

  5. **Klient kan have logo.**

  6. **Rettigheder til klient-handlinger styres i UI.** Hvem må oprette/ændre/deaktivere klienter defineres i rettigheds-systemet, ikke fastlagt i kode.

  7. **Lønarter der refererer klient sættes op via formler i UI.** Formel-systemet (trin 13) leverer mekanikken; konfiguration sker i UI bagefter. Klient-skabelonen selv har ikke lønart-konfiguration på sig.

- **Begrundelse:** Trin 10's krav-dok skal kunne pege på sporbare Mathias-kilder for hver påstand. Disse syv sandheder var implicit kendt fra tidligere afdæknings-sessioner men ikke registreret samlet for klient-specifikt scope. Registreres her som ramme-niveau-afgørelser så Code/Codex/Claude.ai kan reference dem uden gætning. Migration fra 1.0 er eksplicit udskudt til separat pakke.

- **Plan-reference:** Denne commit. Trin 10-krav-dok refererer denne entry som primær kilde.

### 2026-05-20 — Workflow-justering V2 efter trin 10-forsøget

- **Beslutning:** Plan-automation-flowet simplificeres baseret på 30 disciplin-fund fra trin 10-forsøget (dokumenteret i `docs/coordination/rapport-historik/2026-05-20-trin-10-workflow-fund.md`). Kerne-ændringer:
  1. **Dokument-hierarki differentieres.** Kun `vision-og-principper.md` er LÅST-AUTORITATIV. `stork-2-0-master-plan.md` og `mathias-afgoerelser.md` er RETNINGSGIVENDE (kan rettes løbende). `<pakke>-krav-og-data.md` og `<pakke>-plan.md` er PAKKE-KONTRAKT efter approval (låst inden for pakken). Modsigelses-håndtering differentieres efter status: vision-modsigelse = automatisk blokering; master-plan/mathias-afgørelser-modsigelse = trigger for opdatering (Mathias afgør); krav-dok/plan-modsigelse efter approval = KRITISK.

  2. **Krav-dok-fase simplificeres til 5-step Claude.ai-flow med Mathias som direkte validator.** Tre Claude.ai-roller reduceres til to (forfatter + slut-rapport-reviewer). Separat krav-dok-reviewer-chat udgår. Separat `<pakke>-forretningsspoergsmaal.md`-fil udgår. `docs/coordination/krav-dok-feedback/`-mappe udgår. Spørgsmål-runde mellem Claude.ai-forfatter og Mathias sker direkte i chat — ingen committed mellem-artefakter.

  3. **Pakke-skala-vurdering som step 0** (Mathias afgør): Lille (0-2 åbne spm) skip krav-dok helt, Mellem (3-5) kører simplificeret krav-dok-fase, Stor (6+) kører fuld flow med ekstra validering.

  4. **Code's recon-først som obligatorisk forudsætning for plan-skrivning.** Code SKAL læse hver tidligere-trins migration-fil planen refererer FØR plan-indhold skrives. "Verificerede afhængigheder"-sektion med konkrete file:linje-referencer er obligatorisk. Antagelser om API'er = KRITISK-fabrikation. Trin 10's plan V1+V2 fejlede præcis fordi Code (mig) fabrikerede T9-API'er i stedet for at læse migration-filerne.

  5. **Codex KRITISK-fund vedr. fabrikation = STOP** (ikke "fix og fortsæt"). Recon-først skal gentages før V<n+1>. Det forhindrer V<n+1> i at bygge ovenpå fabrikation (som skete i trin 10).

  6. **Plan-fase Code+Codex bevares uændret.** Codex' tekniske review fangede fabrikationer effektivt — det er essentielt sikkerhedsnet. Code kører `scripts/codex-review.sh` selv (ingen manuel paste-instruktion til Mathias).

  7. **Sparring-på-tværs som uformelt sikkerhedsnet.** Mathias kan paste indhold fra én AI-chat til en anden for verifikation. Disciplinen er rammen, ikke isolation mellem AI'er.

- **Begrundelse:** Trin 10-forsøget brugte ~2½ time på at producere en plan der ikke holdt. Hoved-årsager: pakke-skala-mismatch (Stor-flow på Mellem-pakke), Code's egen fabrikation af T9-API'er (ikke fanget af eksisterende disciplin), tre Claude.ai-roller skabte ekstra runder uden at fange de rigtige fejl, master-plan + mathias-afgørelser behandlet som låste når kun vision faktisk er låst. Simplificeringen rammer specifikt krav-dok-fasen (hvor over-disciplin skabte bureaukrati) + tilføjer recon-først for Code (hvor under-disciplin tillod fabrikation). Plan-fase bevares fordi den virkede.

- **Plan-reference:** Denne commit. Ændrede filer:
  - `docs/strategi/arbejds-disciplin.md` — dokument-hierarki + modsigelses-disciplin V2
  - `docs/coordination/overvaagning/code-overvaagning.md` — recon-først, reduceret pre-push-tjekliste, Codex KRITISK STOP
  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` — simplificeret 5-step krav-dok-fase + sparring-på-tværs + 1.0-bibel-reference præciseret
  - `docs/strategi/arbejdsmetode-og-repo-struktur.md` — Aktør-rækkefølge V2 (15-trin → 15-trin men simplificeret)
  - `docs/coordination/rapport-historik/2026-05-20-trin-10-workflow-fund.md` — fund-katalog (30 fund) bevaret som læringskilde

- **Konsekvens for fremtidige pakker:** Krav-dok-fase forventes at tage 25-50% mindre tid for Mellem-pakker. Lille-pakker har ingen krav-dok-overhead. Plan-fase er mere robust mod fabrikation pga. recon-først. Næste pakke der genoptager trin 10 vil køre den nye workflow direkte.

### 2026-05-20 — Trin 10 scope-præcisering: migration og match-rolle ud

- **Beslutning:** To dele fjernes fra master-plan §4 trin 10's leverance og
  §1.8's klient-skabelon:
  1. **Klient-data-migration fjernes fra trin 10.** Trin 10 leverer kun
     klient-skabelonen som greenfield-fundament. Klient-data-migration
     tages op senere som separat pakke når behovet konkret melder sig.

  2. **Match-rolle-konceptet fjernes fra felt-definitioner.** Trin 10's
     felt-definitioner har navn, type, påkrævet, persondata-niveau,
     sortering, aktiv-tilstand. Ingen match-rolle som felt. Match-mekanik
     designes der hvor data-indgange bygges, når UI og konkrete krav er
     kendt.

- **Begrundelse:** 2.0 er greenfield, ikke en kopi af 1.0. Migration-
  leverancen i trin 10 ville være halv-leverance (kun discovery-script
  uden adgang til 1.0) og misvisende ift. master-plan-mønstret hvor
  migration-leverancer normalt dækker både master-data og felt-værdier.

  Match-rolle-konceptet i §1.8 er en for tidlig design-beslutning. Match
  handler om at genkende samme kunde/salg på tværs af kilder (Eesy API,
  TDC Excel-upload osv.), men vi kender ikke data-indgang-UI'en endnu,
  ved ikke om match-feltet skal vælges pr. indgang eller arves fra
  klienten, og har ikke afklaret fejl-håndtering. At designe
  match-mekanikken nu låser senere valg — det er præcis den fabrikation
  V2-workflowet skal forhindre.

- **Plan-reference:** Denne commit. Master-plan §1.8 og §4 trin 10
  rettes som del af trin 10-arbejdet så migration-leverancen og
  match-rolle-konceptet fjernes. Trin 10-krav-dok
  (`docs/coordination/trin-10-krav-og-data.md`) refererer denne entry
  som kilde for scope-grænsen.

### 2026-05-21 — Workflow-justering V3: pre-krav-dok forretningsgang-recon + parallel Code+Codex i plan-fase

To sammenhængende disciplin-justeringer baseret på trin 10-retrospektiv. Begge formaliserer parallel triangulering som default (ikke ad hoc).

**Del 1: Pre-krav-dok forretningsgang-recon (Step 1.0)**

- **Beslutning:** Inden krav-dok skrives, leverer alle tre AI'er (Code, Codex, Claude.ai) parallelt hver deres **forretningsgang-rapport** om samme emne: hvilke forretningsgange/logikker er i spil i næste skridt? Tre uafhængige rapporter trianguleres via konsolidering (Claude.ai sammensætter; ved uenighed kaldes Code ind for at argumentere fra kode-siden). Mathias afgør pr. række: VALIDERET / ÅBENT SPØRGSMÅL / OUT OF SCOPE. Åbne spørgsmål afklares i chat inden krav-dok skrives.

- **Trigger:** Mathias paster `qwers` + pakke-kontekst (fx "trin 11" eller "starter pakke X") til alle tre AI'er. Hver AI starter automatisk sin forretningsgang-rapport — ingen explicit Step 1.0-prompt nødvendig.

- **Gælder ALLE pakker (også Lille):** Step 1.0 sker uanset pakke-skala. Lille pakker (0-2 åbne spørgsmål efter Step 1.0) skipper stadig krav-dok-skrivningen (Step 1.5) — recon-output går direkte til Code's plan-fase. Mellem/Stor pakker fortsætter til Step 1.1-1.5 efter Step 1.0. Step 1.0's output kan i sig selv ændre pakke-skala (hvis recon afslører flere åbne spørgsmål end først antaget i Step 0).

- **Kilder pr. aktør:**
  - **Code:** kode + master-plan + vision
  - **Codex:** kode + master-plan + vision
  - **Claude.ai:** vision + master-plan + mathias-afgoerelser + interne chat-projekt

  Vision er fælles autoritet. Master-plan er fælles for alle tre. Mathias-afgoerelser + chat-historik er Claude.ai's særegne kilde (intentions-spor + samtale-spor).

- **Format pr. rapport:** Resume (1-2 paragraffer) + tabel med forretningsgang i forståeligt ordvalg + "Hvad ved vi?" (konkret faktum + kilde, ELLER tomt hvis ingen data). Forretningssprog, ikke teknisk tabel/kolonne-fokus.

- **Konsoliderings-format:** Claude.ai sammensætter rapporterne i `<pakke>-forretningsgang-konsolideret.md` med matrix (Code | Codex | Claude.ai | Konvergens?).

- **Mathias' afgørelse:**
  - **VALIDERET** → bruges i krav-dok som dokumenteret forudsætning
  - **ÅBENT SPØRGSMÅL** → afklares i chat; svaret bliver til krav-dok-paragraf
  - **OUT OF SCOPE** → eksplicit noteret i krav-dok som "ikke i denne pakke"

- **Hvad ændres ikke:** 5-step workflow-strukturen (Step 0 skala-vurdering → Step 1 krav-dok → Step 2 plan → Step 3 approval → Step 4 build → Step 5 slut-rapport) består uændret. Forretningsgang-recon ligger som Step 1.0 INDENFOR eksisterende Step 1; eksisterende Step 1.1-1.5 består men er nu informeret af tre validerede rapporter. Workflow-skabelon-diagrammet opdateres til at vise Step 1.0 + Step 2-parallel.

**Del 2: Plan-fase parallel Code+Codex (Step 2)**

- **Beslutning:** Plan-fase kører Code OG Codex parallelt fra V1 — ikke ping-pong-sekvens. Begge starter samtidig efter krav-dok er godkendt. Code skriver V<n>; Codex laver parallel **kode-research** efter blind-vinkler relevant for V<n>. Codex integrerer V<n>-review + kode-research i ÉN leverance pr. iteration.

- **Codex' udvidede rolle:** Fra reaktiv reviewer til parallel forsker + reviewer. Kode-research fokus: blind-vinkler i kode-base som Code måske overser (edge cases, race-conditions, cron-context-issues, DB-state-mismatches) + sanity-check at krav-dok er teknisk realiserbart. Ikke patterns-katalog (Code's eget recon-arbejde) eller krav-dok-konsistens-tjek (det er Codex' eksisterende V2 plan-review-rolle — to parallelle roller, ikke duplikerede).

- **Fund-klassifikation mod tre dokumenter** (krav, master-plan, vision):
  - Rammer alle tre → KRITISK
  - Kun krav-dok → MELLEM
  - Kun master-plan → trigger for master-plan-rettelse
  - Kun kode (ingen dokument-spor) → LAV / G-nummer-kandidat

- **Code's V<n+1>-åbning** håndterer hvert KODE-FUND eksplicit (samme mønster som OPGRADERING): ADRESSERET i sektion X / AFVIST fordi Y. Ingen stiltiende ignorering.

- **Stop-betingelse:** Codex APPROVAL + positive marker "INGEN NYE FUND I KODE" → Mathias paster `qwerg`.

- **Hvis Codex finder kritisk fund EFTER qwerg** (under build-fase): håndteres via build-runde-mekanisme (build-review-runder leverer KRITISK/MELLEM-fund mod migrations + commits). Bemærk: Del 4 nedenfor introducerer per-batch build-review som V3-udvidelse af build-fasen — kritisk fund efter qwerg fanges typisk i per-batch review (tidligere end V2-PR-tids-review).

**Del 3: Plan- og bygge-fase overholder 3 dokumenter (præcisering)**

- **Beslutning:** I plan- og bygge-fase OVERHOLDES tre dokumenter: krav-dok, vision-og-principper, stork-2-0-master-plan. Mathias-afgørelser er retningsgivende kontekst (Claude.ai's særegne kilde i Step 1.0), men er IKKE overholdelses-kontrakt i plan/bygge.

- **Disciplin når noget rammer et af de 3 overholdelses-dokumenter:**
  1. **Først:** løs det uden workaround. Find teknisk løsning der overholder dokumentet.
  2. **Hvis ikke muligt uden workaround:** STOP og spørg Mathias.

- **Forbudt:** workaround under build uden Mathias-godkendelse (jf. greenfield-princip 2026-05-12); "midlertidig"-undskyldning; drop af krav-dok-leverance fordi den er svær.

- **Begrundelse:** Trin 10's T10.13b legacy-seed var workaround uden gate → Codex flaggede WORKAROUND-INTRODUCERET → Mathias-afgørelse "fix det ordentligt" → refactor + reverse-migration. Korrekt mønster: stop og spørg FØR workaround, ikke efter.

**Del 4: Build-fase parallel + Code's V<n>-disciplin + udvidelser**

- **Build-fase parallel:** Code committer migrations i batches (3-5 stk); Codex laver per-batch review parallelt med Code's næste batch. Fund flagges som BUILD-KODE-FUND. Eksisterende PR-tids-review består som final overall review. Forventet effekt: tidlig fund-detektion (1-3 dage vs PR-tid).

- **Code's V<n>-disciplin under parallel research:** Code stopper IKKE mid-V<n> baseret på Codex' parallel research. V<n> færdiggøres som planlagt; fund håndteres i V<n+1>-åbning. Undtagelse: Code's egen recon-først kan stadig udløse stop hvis Code SELV opdager fundament-mangler.

- **FULDSTYRKE-MANGEL gælder alle tre AI'er** (ikke kun Code+Codex): Claude.ai's forretningsgang-rapport skal også have konkrete kilde-referencer (mathias-afgoerelser-dato, vision-princip, master-plan-§, chat-citat) — ikke generiske formuleringer.

- **Mathias' afgørelses-format:** Konsoliderings-matrix i Step 1.0 får ny kolonne "Mathias-afgørelse" (VALIDERET / ÅBENT SPM / OUT OF SCOPE). Mathias udfylder direkte i fil eller via chat (Claude.ai opdaterer filen efter chat-afklaring, citerer Mathias-svar i commit-message).

**Del 5: Slut-rapport-fase optimering (V3)**

- **Reference-konsistens-pass FØR slut-rapport committes** (Code's disciplin): Code grep'er hver konkret reference (filsti, G-nummer, runde-nummer, commit-SHA) på tværs af slut-rapport + alle relaterede filer (bygge-status, teknisk-gaeld, master-plan) for konsistens. Fanger stale referencer FØR de bliver rapport-runde-fund.

- **Fix-cycle-disciplin under rapport-review-runder:** Efter hver LAV-fix, kør konsistens-pass på tværs af alle relevante filer FØR commit. Hver fix kan generere nye mismatches i søster-filer; pass'et skal fange dem. Forhindrer "cascade-fixes" der drev trin 10's 7 slut-rapport-runder.

- **Forventet effekt:** færre slut-rapport-runder (V14's 7 runder kunne være 3-4 med konsistens-pass + fix-cycle-disciplin).

**Fuldstyrke-disciplin på tværs (gælder alle dele):** Alle tre AI'er skal arbejde med fuld dybde. Overfladisk output blokerer iteration. Mathias kan markere "FULDSTYRKE-MANGEL — gentag iteration" hvis output er for tyndt (kun Mathias-rejst, chat-baseret; AI scrapper output og gentager samme V-nummer).

- **Begrundelse (begge dele):** Trin 10 (2026-05-21) leverede V14 efter 14 plan-runder + 5 build-runder. Mathias' to centrale observationer i retrospektivet:
  1. **Vi kiggede ikke nok på nuværende kode og opsætning ift. faktisk forretningsgang FØR krav-dok blev skrevet.** Mange Codex-fund i V5+ (manage-tab eksisterer ikke for client_placements, T9-wrappers mangler session-var, is_admin() returnerer false i cron-context) var observerbare i koden FØR plan-V1 men blev først opdaget under iteration. → Del 1 løser via 3-AI forretningsgang-recon.

  2. **Code og Codex skal arbejde samtidig, ikke i ping-pong-sekvens.** "Fuldt gear" var ad hoc i trin 10 (kun for V5+); med Del 2 er parallel arbejde default fra V1. Codex bliver parallel forsker, ikke kun reaktiv reviewer.

- **Plan-reference:** Denne commit. Seks fil-ændringer:
  - `docs/strategi/arbejds-disciplin.md` — fire nye sektioner: Pre-krav-dok forretningsgang-recon (V3) + Plan-fase parallel Code+Codex (V3) + Build-fase parallel + Slut-rapport-fase reference-konsistens-pass + 3-dokuments-overholdelse + FULDSTYRKE-MANGEL-procedure (alle tre AI'er)
  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` — ny Step 1.0 + konsoliderings-rolle (inkl. Mathias-afgørelses-kolonne) + præcisering af Step 1.2 (Step 1.0 sker for alle pakker)
  - `docs/coordination/overvaagning/code-overvaagning.md` — to nye sektioner: forretningsgang-rapport + plan-fase parallel-disciplin
  - `docs/coordination/overvaagning/codex-overvaagning.md` — to nye sektioner: forretningsgang-rapport + plan-fase parallel kode-research; plus stale V1.5-tekster opdateret til V2-virkelighed (Codex dækker fire-dokument-konsistens, enkelt approval-port)
  - `docs/skabeloner/workflow-skabelon.md` — diagram + aktør-tabel opdateret til V3 (Step 1.0 + Step 2-parallel)
  - Denne entry

- **Konsekvens for fremtidige pakker:** Alle pakker (også Lille) starter med 3-AI forretningsgang-recon (Step 1.0). Lille pakker (0-2 åbne spørgsmål efter recon) skipper stadig krav-dok-skrivningen (Step 1.5) — recon-output går direkte til Code's plan-fase. Mellem/Stor pakker fortsætter til krav-dok-fasen efter recon. Plan-fasen kører parallel Code+Codex fra V1 med fuldstyrke-disciplin. Forventet effekt: færre plan-runder (V1 starter med valideret grundlag + parallel kode-research), færre build-runder (fundament + blind-vinkler kendt tidligt), mindre rapport-fix-iteration.
