# Codex review — trin-10 runde 1

**Pakke:** trin-10
**Fase:** slut-rapport
**Plan-fil:** docs/coordination/rapport-historik/2026-05-21-trin-10.md
**Plan-SHA:** d044625
**Dato:** 2026-05-21
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/rapport-historik/2026-05-21-trin-10.md 1 --xhigh --phase=slut-rapport` (re-run via samme args inkl. flags)

---

Reading additional input from stdin...
OpenAI Codex v0.131.0
--------
workdir: /home/mathias/stork-2.0
model: gpt-5.5
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR] (network access enabled)
reasoning effort: xhigh
reasoning summaries: none
session id: 019e4ab2-00f0-71d2-a99d-631da0217003
--------
user
Læs disse filer:
1. docs/skabeloner/codex-review-prompt.md (niveau 1-prefix — anvend ordret)
2. docs/coordination/rapport-historik/2026-05-21-trin-10.md (slut-rapport-fasen for pakke trin-10)

RUNDE-NUMMER: 1
FASE: slut-rapport
FORMÅL (slut-rapport-fase): Verificér at slut-rapporten reflekterer faktisk leverance, plan-afvigelser ærligt, og fire-dokument-tjek korrekt. Underliggende pakke-formål kan slås op i rapport-headerens "Plan-fil"-felt hvis nødvendigt.

Følg niveau 1-prefixens scope-krav + marker-protokol + dialog-regler.

Max 350 ord output. Brug marker-format fra niveau 1-prefix (KRITISK/MELLEM/LAV/HUL/OPTIMERING-FORSLAG/G-NUMMER-KANDIDAT etc.). Hvis du ikke har fund: skriv "APPROVAL — Runde 1".
codex
Jeg læser review-prefixen og slutrapporten først, så vurderingen følger den lokale marker-protokol og ikke antager leverancen ud fra planen alene.
exec
/bin/bash -lc "sed -n '1,260p' docs/coordination/rapport-historik/2026-05-21-trin-10.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
# Trin 10 — Slut-rapport

## Header

- **Pakke:** Trin 10 — Klient-skabelon (`core_identity.clients` + `client_field_definitions` + FK + logo + aktiv/inaktiv + permission-baserede RPC'er)
- **Commit-hash:** `1831760` (PR #64 squash-merged til main 2026-05-21)
- **Plan-fil:** `docs/coordination/arkiv/trin-10-plan.md` (V14)
- **Dato:** 2026-05-21

---

## Lag-boundary-rapport

```
PAKKE trin-10 — commit 1831760
Migration-gate: 14 migrations, ~30 nye kolonner, 0 violations
Fitness: 19/19 grøn
Scope: clean (Codex-runde 5 APPROVAL)
Nye tests: t10_client_lifecycle, t10_client_field_definitions, t10_clients_validate_fields,
           t10_client_logo, t10_client_node_placements_fk, t10_client_active_check
Branch ahead: 0 commits (merged til main)
Plan-afvigelser: 1 (T10.13b workaround — refactored til grant-model i runde 3)
G-numre tilføjet: G057, G058
Næste pakke: TBD (Mathias-valg)
```

---

## Leverancer

| Leverance                                            | Status  | Verifikation                                                                               |
| ---------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| T10.1 `core_identity.clients`-tabel                  | leveret | `20260521000001_t10_tables.sql`; t10_client_lifecycle.sql                                  |
| T10.2 `core_identity.client_field_definitions`-tabel | leveret | `20260521000001_t10_tables.sql`; t10_client_field_definitions.sql                          |
| T10.3 `is_permanent_allowed`-allowlist-udvidelse     | leveret | `20260521000002_t10_is_permanent_allowed_extend.sql`                                       |
| T10.4 `data_field_definitions`-klassifikation        | leveret | `20260521000003_t10_classify.sql`; logo_bytes + logo_filename = `direct` (V12)             |
| T10.5 `audit_filter_values` jsonb-walking            | leveret | `20260521000004_t10_audit_filter_values.sql`; t10_clients_validate_fields.sql T4-assertion |
| T10.6 `clients_validate_fields`-trigger              | leveret | `20260521000005_t10_clients_validate_fields.sql`; LENIENT-default verificeret              |
| T10.7 FK `client_node_placements.client_id`          | leveret | `20260521000007_t10_client_node_placements_fk.sql`; t10_client_node_placements_fk.sql      |
| T10.7a T9-smoke-tests fixture-seed                   | leveret | `t9_placements.sql` + `t9_backdated_historical_traversal.sql` opdateret                    |
| T10.7b aktiv-check (wrapper + apply)                 | leveret | `20260521000008_t10_client_active_check.sql`; t10_client_active_check T2/T3/T5/T6/T7       |
| T10.8 `client_upsert` RPC                            | leveret | `20260521000009_t10_client_rpcs.sql`; t10_client_lifecycle.sql                             |
| T10.9 `client_set_active` RPC                        | leveret | `20260521000009_t10_client_rpcs.sql`                                                       |
| T10.10 `client_field_definition_upsert`              | leveret | `20260521000010_t10_client_field_definition_rpcs.sql`; immutable-key + pii-downgrade-block |
| T10.10a `client_field_definition_set_active`         | leveret | `20260521000010_t10_client_field_definition_rpcs.sql`                                      |
| T10.11 logo-RPC'er (set/clear/get)                   | leveret | `20260521000011_t10_client_logo_rpcs.sql`; t10_client_logo.sql (audit-hash-assertion)      |
| T10.12 read-RPC'er (get/list/list-defs)              | leveret | `20260521000012_t10_client_read_rpcs.sql`                                                  |
| T10.13 grant-model permissions                       | leveret | `20260521000006_t10_seed_permissions.sql` + reverse i `20260521000014`                     |
| T10.14 master-plan §1.8 + §4 trin 10                 | leveret | commits inkluderet i PR #64                                                                |
| T10.15 6 smoke-tests                                 | leveret | alle 6 tests passerer i CI                                                                 |
| T10.16 fitness-script-udvidelse                      | leveret | `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` udvidet med 2 nye funktioner                           |

---

## Halt-eskaleringer + clarifications undervejs (V5.3)

Plan-fase: 14 Codex-runder med halt-marker-eskaleringer; alle løst inden bygge-start. Build-fase: 5 Codex build-review-runder.

| Marker         | Hvad                                                | Iter | Outcome                                 | Gate-fil-reference                                 |
| -------------- | --------------------------------------------------- | ---- | --------------------------------------- | -------------------------------------------------- |
| KRITISK        | Build-runde 1+2 fund (RLS-policy + permission-seed) | 1-2  | LØS-konsensus                           | `docs/coordination/codex-reviews/...-runde-1/2.md` |
| WORKAROUND     | T10.13b legacy-seed (post-build M1-test compat)     | 3    | Mathias-gate → refactor til grant-model | mathias-afgoerelser 2026-05-21                     |
| PLAN-AFVIGELSE | Smoke-test brugte manuel pending-INSERT + ikke cron | 3-4  | LØS-konsensus → wrapper-flow + cron     | runde 4 review-fil                                 |

**STOP-FOR-CLARIFICATION-events:** ingen — alle clarifications håndteret inden-for plan-iterationer (V1→V14).

---

## Optimerings-håndtering (V5.3)

| Forslag                                                        | Klasse   | Code's svar | Begrundelse / G-nummer                                              |
| -------------------------------------------------------------- | -------- | ----------- | ------------------------------------------------------------------- |
| Scope tab/grant-INSERT-queries til `org_structure`-area        | runde 8  | ADOPT       | Trivielt fix; robusthed mod fremtidige same-name pages i andet area |
| FK-coverage-fitness-check                                      | runde 10 | DEFER       | G058 — kræver fitness-arkitektur-arbejde uden for trin 10's scope   |
| T9-public-wrapper-bug (5 RPC'er mangler `t9_write_authorized`) | runde 8  | DEFER       | Ud over scope (T9-fundament); flag som separat pakke; G-kandidat    |

`SPARRING-OENSKE`-events: ingen.

---

## Plan-afvigelser

- **Hvad:** T10.13b legacy-seed migration tilføjet under build (workaround for M1-test compatibility), efterfølgende fjernet via T10.14c reverse-migration.
- **Hvorfor:** M1-test scannede oprindeligt `role_page_permissions` (legacy); planen specificerede kun grant-model. Codex-runde 3 flaggede som workaround-introduceret.
- **Godkendelse:** Mathias 2026-05-21 ("Vigtigt at vi fixer det ordenligt").
- **Konsekvens:** M1-test refactored til grant-model + reverse-migration T10.14c sletter legacy-rows. Ingen G-nummer.

- **Hvad:** Smoke-test t10_client_active_check.sql brugte først manuel pending-INSERT, dernæst delvis wrapper-flow med jwt-context bevaret ved apply.
- **Hvorfor:** Auth.users-FK gjorde non-admin-test-bruger kompleks; rolle-swap-pattern krævede admin-floor-håndtering.
- **Godkendelse:** Mathias 2026-05-21 ("Fix — brug auth-backed employee + rolle-swap").
- **Konsekvens:** Smoke-test refactored med 2 buffer-admins + rolle-swap af Kasper/Mathias + `request.jwt.claim.sub = ''` ved apply for ægte cron-context. Codex-runde 5 APPROVAL.

---

## Vision-tjek

- **Bygger vi den rigtige løsning, eller en workaround?** Rigtig løsning. Greenfield clients-tabel i `core_identity`; ingen migration fra droppede D5-fundament. Aktiv-check håndhæves konsistent i wrapper + apply via employee-id (cron-kompatibel).
- **Hvis workaround: dokumenteret plan?** N/A.
- **Vision-styrkelser:**
  - Princip 1 (data styres i UI): client_field_definitions er UI-redigerbar konfiguration via wrapper-RPC'er.
  - Princip 2 (rettigheder der virker): grant-model brugt konsistent; `has_permission`-resolver-pattern bevaret.
  - Princip 3 (driftsikkert): aktiv-check er employee-id-baseret → virker i cron-context (V10-fix valideret med tom jwt).
  - Princip 7 (anonymisering bevarer audit): direct-PII keys i clients.fields hashes uafhængigt af `is_active`-status (V2 Codex KRITISK-SIKKERHEDSHUL fix).
- **Vision-svækkelser:** ingen.
- **Teknisk gæld akkumuleret:** G057 (T9 forretnings-invariants uden superadmin-bypass), G058 (FK-coverage-fitness-check).
- **Konklusion:** forsvarligt.

---

## Fire-dokument-verifikation

| Dokument                                    | Plan-konsultation            | Post-build status | Afvigelse                                    |
| ------------------------------------------- | ---------------------------- | ----------------- | -------------------------------------------- |
| `docs/strategi/vision-og-principper.md`     | §0 + 9 principper            | overholdt         | nej                                          |
| `docs/strategi/stork-2-0-master-plan.md`    | §1.8 + §4 trin 10 + §1.11    | overholdt         | nej (master-plan opdateret som del af pakke) |
| `docs/coordination/mathias-afgoerelser.md`  | 7 afgørelser 2026-05-20/21   | overholdt         | nej                                          |
| `docs/coordination/trin-10-krav-og-data.md` | §2.3 + §2.5 + §3.1-§3.4 + §7 | overholdt         | nej                                          |

---

## G-numre / H-numre

- **Tilføjet:**
  - G057 — T9 forretnings-invariants uden superadmin-bypass (inkonsistent med Mathias 2026-05-21)
  - G058 — FK-coverage-fitness-check ikke implementeret per master-plan §3 punkt 19
- **Løst:** ingen.
- **Opdateret status:** ingen.

---

## Oprydning + opdatering udført

**Filer flyttet til arkiv (i tidligere commits inden merge):**

- `docs/coordination/trin-10-plan.md` → `docs/coordination/arkiv/trin-10-plan.md`
- `docs/coordination/trin-10-krav-og-data.md` → `docs/coordination/arkiv/trin-10-krav-og-data.md`
- `docs/coordination/plan-feedback/trin-10-approved-codex.md` → `docs/coordination/arkiv/trin-10-approved-codex.md`

**Filer slettet:** ingen.

**Konsekvens-opdateringer for autoritative dokumenter:**

| Dokument                                   | Plan-vurdering | Faktisk udført                                                 |
| ------------------------------------------ | -------------- | -------------------------------------------------------------- |
| `docs/strategi/stork-2-0-master-plan.md`   | ja             | §1.8 + §4 trin 10 + Appendix C #36 opdateret i PR #64          |
| `docs/strategi/bygge-status.md`            | ja             | Trin 10 dokumenteret i PR #64                                  |
| `docs/coordination/mathias-afgoerelser.md` | ja             | Entries 2026-05-21 (rolle-swap-fix + workaround-gate) tilføjet |
| `docs/teknisk/teknisk-gaeld.md`            | ja             | G057 + G058 registreret                                        |

**Andre dokumenter opdateret:**

- `docs/coordination/aktiv-plan.md`: Trin 10 flyttet til Historisk (i PR #64); slut-rapport-pointer opdateres i denne commit.
- `docs/coordination/seneste-rapport.md`: opdateres i denne commit til at pege på denne fil.

**Reference-konsekvenser håndteret:** ikke relevant.

**Verifikation:** fitness 19/19 grøn på commit `1831760`. CI grøn (28 DB-tests passed).

---

## Næste skridt

- **Næste pakke:** TBD — Mathias-valg blandt master-plan §4's resterende trin (11+).
- **Forudsætninger inden næste start:** ingen blokerede; G057 + G058 kan løses i kommende fitness/T9-pakke.

---

## Codex-review-trigger

Efter denne rapport committes + `docs/coordination/seneste-rapport.md` opdateres, posterer Codex-notify-action comment til tracker-issue "Codex review queue". Codex slut-rapport-runde 1 følger.

exec
/bin/bash -lc "sed -n '1,240p' docs/skabeloner/codex-review-prompt.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
# Codex-review-prompt-skabelon

Skabelon for prompts der sendes til Codex ved hver review-runde.
Sikrer at Codex holder sig inden for kode-validering og ikke
træder ind i funktions-beslutninger.

Håndhæver REGEL: Codex-runder = kode-validering, ikke
funktions-beslutning (fra `docs/strategi/arbejds-disciplin.md`).

---

## Niveau 1 — Prompt-prefix (ordret)

Hver Codex-review-prompt indledes med følgende prefix. Kopieres
ordret ind før den runde-specifikke instruks:

```
SCOPE-KRAV (kode-niveau, fra fire-dokument-disciplinen 2026-05-16, udvidet V5.3 2026-05-20):

Du svarer KUN på kode-niveau:
- Leverer koden formålet teknisk?
- Er der bugs, sikkerhedshuller, RLS-huller, SQL-fejl?
- Er der edge cases der bryder formålet på kode-niveau?
- Akkumulerer planen teknisk gæld?
- Følger koden disciplin-pakken (CI-blockers, fitness-checks)?

END-TO-END-TJEK PER WRITE-VEJ (obligatoriske):

For hver write-RPC og INSERT/UPDATE/DELETE-vej i planen — verificér:
- GRANT + policy + session-var-tre-pak
- SELECT-policy bredde
- Backdated guards
- Apply-dispatcher-extension specificeret per RPC
- jsonb-format konsistens producer/consumer
- Eksempel-row gennem flow (gerne som non-admin)
- Krydsetjek mod Fundament-tjek-passeret-sektion

Manglende ét af tjekkene på write-vej = KRITISK fund.

Du svarer IKKE på:
- Skulle formålet have været anderledes
- Mangler features, er funktionalitet rigtig, bedre forretnings-løsninger
- Lever planen op til vision, master-plan, mathias-afgørelser, eller krav-dok på forretnings-niveau — dette er Claude.ai's bord (parallelt review)

OUT OF SCOPE-markering:
- Funktions-spørgsmål: "OUT OF SCOPE — kræver Mathias-runde" + fortsæt
- Forretnings-dokument-konflikt: "OUT OF SCOPE — Claude.ai's bord" + fortsæt

MARKER-PROTOKOL (V5.3 — anvendt i build-fase + plan-fase):

Halt-markers (defensive — 6 typer, FLAG → LØS → STOP):
- BRUD-PAA-KRAV: <hvad>           — build/plan modsiger krav-doc
- TEKNISK-BLOKERING: <hvad>       — ikke fysisk implementerbar
- PLAN-AFVIGELSE: <hvad>          — afviger fra approved plan
- KRITISK-SIKKERHEDSHUL: <hvad>   — RLS/datatab/SQL-injection
- WORKAROUND-INTRODUCERET: <hvad> — bevidst kvalitets-sænkning (Mathias-gate)
- STOP-FOR-CLARIFICATION: <hvad>  — info mangler genuint (auto-STOP)

Log-marker:
- G-NUMMER-KANDIDAT: <hvad>       — forbedring der ikke blokerer; log + fortsæt

Positive markers (offensive — HALTER ALDRIG):
- OPGRADERING (KUN plan-fase, per Mathias-afgørelse 2026-05-17):
    Code-svar: AFVIS / IMPLEMENTER (binær)
- OPTIMERING-FORSLAG (build + slut-rapport):
    Code-svar: ADOPT / DEFER / DISMISS; Codex: CONFIRM-MOVE-ON
- SPARRING-OENSKE (Code rejser, build + slut-rapport):
    Codex-svar: CONFIRM / TIMING / AVOID

Trigger-format (når du mangler info eller anden vinkel):
- REQUEST-RAAD Mathias: <funktions-spørgsmål>
- REQUEST-RAAD Claude.ai: <forretnings-spørgsmål>
- REQUEST-RAAD Codex: <kode-spørgsmål>
- REQUEST-RAAD CONTEXT: <hvad-skal-tjekkes>

DIALOG-PROTOKOL (FLAG → LØS → STOP):

Per fund er max 3 LØS-iterationer tilladt:
- Iter 1: Code-svar (ACCEPT/PUSHBACK/PROPOSE-ALTERNATIVE), Codex-modsvar (AGREE/REFINE/ESCALATE)
- Iter 2: refine
- Iter 3: sidste forsøg
- Iter 4: AUTO-ESKALATION via mathias-gate/

STOP (eskalation) udløses kun ved:
- Nogen rejser ESCALATE, ELLER
- Iter > 3, ELLER
- WORKAROUND-INTRODUCERET (gate uanset konsensus), ELLER
- STOP-FOR-CLARIFICATION (auto-STOP)

MARKER-VALG VED OVERLAP:
Hvis flere markers matcher samme fund: brug den marker der bedst beskriver primær problem. Sekundære nævnes i body som G-nummer-kandidater (ikke separat fund).

RUNDE-NUMMER: [1 | 2 | 3 | ... max 7]

Niveau 3-protokol — runde-afhængige stop-betingelser:
Runde 1: alle fund vurderes
Runde 2: kun HØJ/KRITISK stopper; MELLEM → G-numre
Runde 3+: kun KRITISK stopper; LAV/MELLEM → G-numre

FORMÅL FOR DENNE PAKKE: [indsættes fra plan-skabelonens
Formål-sektion]

Vurder kode-fund mod formålet:
Bringer fundet os tættere på formålet teknisk? → ACCEPT (eller ADOPT for OPTIMERING)
Er fundet uafhængigt af formålet? → G-nummer-kandidat, ikke blocker
```

---

## Niveau 2 — Post-processing-scan

Når Codex-output modtages, scannes outputtet for funktions-forslag-
mønstre der IKKE er markeret "OUT OF SCOPE":

Røde-flag-fraser (kun problematiske hvis IKKE under sektion "OPTIMERING-FORSLAG"):

- "kunne overveje at..."
- "ville være bedre hvis..."
- "burde måske tilføje..."
- "alternativ tilgang..."
- "bedre design ville være..."
- "anbefaler at refaktorere til..."
- "feature mangler:..."
- "mangler funktionalitet for..."

NB (V5.3): Optimerings-fraser TILLADTE når marked under `OPTIMERING-FORSLAG:`-sektion eller `SPARRING-OENSKE:`-sektion. De er ikke disciplin-brud — de er forventet positive-marker-output.

Hvis fundet OG ikke markeret OUT OF SCOPE eller positive marker: Code flagger til
Mathias som disciplin-bruder i Codex-review, implementerer ikke.

Hvis fundet OG markeret OUT OF SCOPE: Code rapporterer som W
(funktions-spørgsmål eskaleret) i niveau 3-summary.

---

## Niveau 3 — Mathias-godkendelse-protokol

Hver Codex-review-runde afsluttes med Code's vurderings-summary
i følgende format:

```
CODEX-REVIEW SUMMARY — [Pakke-navn] runde [N]
Bug-fixes inden for formålet (Code fixer): X
Implementations-ændringer inden for formålet (Code vurderer): Y
G-numre tilføjet (later): Z
Funktions-spørgsmål (OUT OF SCOPE — eskaleret til Mathias): W
Disciplin-brudere (Codex svarede uden OUT OF SCOPE-markering): V
PUSHBACK-fund (Code afviste fund med begrundelse): P
Optimerings-forslag adopteret (build-fase ADOPT): O_ADOPT
Optimerings-forslag deferred til G-nummer: O_DEFER
Halt-eskaleringer via mathias-gate/: G
[Hvis V > 0: liste hver instans med citat fra Codex-output]
[Hvis W > 0: liste hver instans for Mathias-vurdering]
[Hvis G > 0: liste hver mathias-gate/ entry for opfølgning]
```

Mathias kan beslutte W-forslagene i ny planlægnings-runde.
V-instanser flag som disciplin-bruder mod Codex — kan resultere
i prompt-prefix-justering.

---

## Brug

1. Code kopierer niveau 1-prefix ind før hver Codex-review-prompt
2. Indsætter runde-nummer + formål fra aktuel plan
3. Tilføjer runde-specifik instruks (hvilke filer, hvilke fokus-
   områder)
4. Sender til Codex
5. Modtager output, scanner niveau 2
6. Rapporterer niveau 3-summary til Mathias

codex
Jeg tjekker nu rapportens påstande mod repoet: commit/filstatus, migrations/tests, arkiverede planfiler og de fire dokumenter der nævnes i verifikationen.
exec
/bin/bash -lc 'git status --short' in /home/mathias/stork-2.0
 succeeded in 0ms:
exec
/bin/bash -lc 'git log --oneline -8' in /home/mathias/stork-2.0
 succeeded in 0ms:
d044625 Trin 10 slut-rapport: levér + opdater pointers
1831760 Trin 10: Klient-skabelon (core_identity.clients + felt-definitioner) (#64)
8c3c7b9 Trin 10 krav-dok: scope-justering — match-rolle og migration ud
4f1ed88 Trin 10 scope-præcisering: migration og match-rolle ud (#62)
d372585 Workflow V2 finalize: 5 manglende skabeloner + status (#61)
4de7870 Workflow-forenkling V2 baseret på trin 10-erfaring (#60)
023d64f Trin 10 krav-dok: klient-skabelon + felt-definitioner (#58)
7810afe Trin 10 forretnings-ramme: ny mathias-afgoerelser-entry (#57)

exec
/bin/bash -lc "rg --files | rg '202605210000(0[1-9]|1[0-4])|t10_|trin-10|teknisk-gaeld|stork-2-0-master-plan|bygge-status|mathias-afgoerelser|seneste-rapport|aktiv-plan'" in /home/mathias/stork-2.0
 succeeded in 0ms:
supabase/tests/smoke/t10_client_field_definitions.sql
supabase/tests/smoke/t10_client_logo.sql
supabase/tests/smoke/t10_client_lifecycle.sql
supabase/tests/smoke/t10_client_active_check.sql
supabase/tests/smoke/t10_client_node_placements_fk.sql
supabase/tests/smoke/t10_clients_validate_fields.sql
supabase/migrations/20260521000003_t10_classify.sql
supabase/migrations/20260521000001_t10_tables.sql
supabase/migrations/20260521000006_t10_seed_permissions.sql
supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql
supabase/migrations/20260521000007_t10_client_node_placements_fk.sql
supabase/migrations/20260521000009_t10_client_rpcs.sql
supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql
supabase/migrations/20260521000004_t10_audit_filter_values.sql
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql
supabase/migrations/20260521000008_t10_client_active_check.sql
supabase/migrations/20260521000012_t10_client_read_rpcs.sql
supabase/migrations/20260521000002_t10_is_permanent_allowed_extend.sql
supabase/migrations/20260521000005_t10_clients_validate_fields.sql
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql
docs/strategi/stork-2-0-master-plan.md
docs/strategi/bygge-status.md
docs/teknisk/teknisk-gaeld.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-14.md
docs/coordination/codex-reviews/2026-05-20-trin-10-runde-3.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-3.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-12.md
docs/coordination/mathias-afgoerelser.md
docs/coordination/rapport-historik/2026-05-21-trin-10.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-8.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-10.md
docs/coordination/codex-reviews/2026-05-20-trin-10-runde-1.md
docs/coordination/aktiv-plan.md
docs/coordination/seneste-rapport.md
docs/coordination/arkiv/trin-10-krav-og-data.md
docs/coordination/arkiv/trin-10-approved-codex.md
docs/coordination/arkiv/trin-10-plan.md
docs/coordination/rapport-historik/2026-05-20-trin-10-workflow-fund.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-11.md
docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-9.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-2.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md

exec
/bin/bash -lc 'rg -n "G057|G058|Trin 10|client_field_definitions|clients|1831760|seneste-rapport|trin-10" docs/strategi docs/coordination docs/teknisk supabase test tests 2>/dev/null' in /home/mathias/stork-2.0
 exited 2 in 106ms:
codex
Foreløbigt ser jeg én mulig mismatch: rapporten nævner en `t10_clients_validate_fields.sql` T4-assertion, mens repo-indekset peger på at T4 audit-hash-testen blev droppet. Jeg læser de konkrete test- og reviewlinjer før jeg konkluderer.
exec
/bin/bash -lc "sed -n '1,180p' supabase/tests/smoke/t10_clients_validate_fields.sql" in /home/mathias/stork-2.0
 succeeded in 0ms:
-- Trin 10 T10.15: clients_validate_fields smoke-test
--
-- LENIENT-default: unknown key i fields → warning, INSERT accepteret.
-- Strict-mode (stork.clients_fields_strict='true'): unknown key → exception.
-- V2 (Codex V1 MELLEM): assert at non-object fields ('"scalar"'::jsonb,
-- '[1,2]'::jsonb) afvises af clients_fields_is_object-CHECK (errcode 23514).
-- V2 (Codex V1 KRITISK-SIKKERHEDSHUL): assert audit-PII-hashing rammer
-- direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.

begin;

do $test$
declare
  v_client_id uuid;
  v_field_id uuid;
  v_caught text;
  v_superadmin_auth_id uuid;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T10 validate_fields smoke', true);

  select e.auth_user_id into v_superadmin_auth_id
  from core_identity.employees e
  join core_identity.roles r on r.id = e.role_id
  where r.name = 'superadmin'
    and e.auth_user_id is not null
    and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
  limit 1;
  if v_superadmin_auth_id is null then
    raise exception 'SETUP FAIL: ingen aktiv superadmin';
  end if;
  perform set_config('request.jwt.claim.sub', v_superadmin_auth_id::text, true);

  -- Setup: opret felt-definition
  v_field_id := core_identity.client_field_definition_upsert(
    'kontakt_email', 'Kontakt-email', 'email', 'direct',
    'T10-validate setup', false, 0, true, null
  );

  -- ─── T1: LENIENT-default: ukendt key → WARNING (ingen exception) ────
  -- Skal IKKE raise
  v_client_id := core_identity.client_upsert(
    'Validate-test klient',
    '{"ukendt_key": "x"}'::jsonb,
    'T10-validate T1: LENIENT', true, null
  );
  if v_client_id is null then
    raise exception 'T1 FAIL: LENIENT-default skal acceptere INSERT med ukendt key (kun warning)';
  end if;

  -- ─── T2 (V2 MELLEM): non-object fields afvises af CHECK ─────────────
  begin
    v_caught := null;
    perform core_identity.client_upsert(
      'Bad-fields klient',
      '"scalar"'::jsonb,
      'T10-validate T2: non-object', true, null
    );
  exception when sqlstate '23514' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T2 FAIL (V2 MELLEM): scalar jsonb skal afvises af clients_fields_is_object-CHECK';
  end if;

  begin
    v_caught := null;
    perform core_identity.client_upsert(
      'Bad-fields klient',
      '[1,2,3]'::jsonb,
      'T10-validate T2b: array', true, null
    );
  exception when sqlstate '23514' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T2b FAIL: array jsonb skal afvises af clients_fields_is_object-CHECK';
  end if;

  -- ─── T3: strict-mode: ukendt key → exception ────────────────────────
  perform set_config('stork.clients_fields_strict', 'true', true);
  begin
    v_caught := null;
    perform core_identity.client_upsert(
      'Strict-test klient',
      '{"ukendt_strict_key": "x"}'::jsonb,
      'T10-validate T3: strict', true, null
    );
  exception when sqlstate '23514' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T3 FAIL: strict-mode skal afvise ukendt key (errcode 23514)';
  end if;
  perform set_config('stork.clients_fields_strict', 'false', true);

  -- ─── T4 (V2 KRITISK-SIKKERHEDSHUL): audit-PII-hashing efter is_active=false
  -- Bekræft at direct-PII keys i clients.fields hashes selv efter felt-def deaktivering.
  -- Forhindrer datalæk: når et felt deaktiveres mens eksisterende værdier ligger i jsonb,
  -- skal audit-rowen stadig hashes (audit_filter_values' clients-special-case bruger
  -- ingen is_active-filter på cfd-loop).
  declare v_client_pii_id uuid; v_audit_value text; begin
    v_client_pii_id := core_identity.client_upsert(
      'PII-test klient',
      jsonb_build_object('kontakt_email', 'user@example.com'),
      'T10-validate T4: opret med direct-PII', true, null
    );

    -- Deaktiver felt-def. Audit skal stadig hash kontakt_email.
    perform core_identity.client_field_definition_set_active(v_field_id, false, 'T10-validate T4: deaktiver felt-def');

    -- UPDATE klient (genererer audit-row med NY direct-PII-værdi)
    perform core_identity.client_upsert(
      'PII-test klient (opdateret)',
      jsonb_build_object('kontakt_email', 'user-new@example.com'),
      'T10-validate T4: UPDATE efter felt-def deaktivering',
      true, v_client_pii_id
    );

    -- Verificér audit-row har hashed værdi (V2 fix: ingen is_active-filter)
    select new_values -> 'fields' ->> 'kontakt_email' into v_audit_value
    from core_compliance.audit_log
    where table_schema = 'core_identity'
      and table_name = 'clients'
      and record_id = v_client_pii_id
      and operation = 'UPDATE'
    order by occurred_at desc limit 1;

    if v_audit_value is null then
      raise exception 'T4 FAIL: audit-row mangler eller kontakt_email ikke i fields';
    end if;
    if v_audit_value not like 'sha256:%' then
      raise exception 'T4 FAIL (V2 KRITISK-SIKKERHEDSHUL): kontakt_email skal hashes selv efter felt-def is_active=false. Fik: %', v_audit_value;
    end if;
  end;

  raise notice 'T10 validate_fields smoke: ALL TESTS PASSED (T1-T4)';
end;
$test$;

rollback;

exec
/bin/bash -lc "sed -n '1,220p' docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md" in /home/mathias/stork-2.0
exec
/bin/bash -lc "sed -n '1,220p' supabase/tests/smoke/t10_client_logo.sql" in /home/mathias/stork-2.0
 succeeded in 0ms:
-- Trin 10 T10.15: client_logo smoke-test
--
-- Dækker: client_logo_set + client_logo_get + client_logo_clear.
-- V3 (Codex V2 KRITISK-SIKKERHEDSHUL) assertion: client_upsert UPDATE af
-- name/fields bevarer logo_bytes uændret (read før+efter; sammenlign).
-- consistency-CHECK blokerer partiel logo. client_logo_set fejler hvis ét
-- felt er NULL.
-- V12 (Codex V11 KRITISK-SIKKERHEDSHUL): audit_log har logo_filename + logo_bytes
-- SHA256-hashed efter client_logo_set; logo_content_type forbliver klartekst.

begin;

do $test$
declare
  v_client_id uuid;
  v_caught text;
  v_logo_bytes_before bytea;
  v_logo_bytes_after bytea;
  v_logo_filename_before text;
  v_logo_filename_after text;
  v_returned_bytes bytea;
  v_returned_ct text;
  v_returned_fn text;
  v_test_logo bytea := decode('89504e470d0a1a0a', 'hex');
  v_test_logo_2 bytea := decode('89504e470d0a1a0a0000000d49484452', 'hex');
  v_superadmin_auth_id uuid;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T10 logo smoke', true);

  select e.auth_user_id into v_superadmin_auth_id
  from core_identity.employees e
  join core_identity.roles r on r.id = e.role_id
  where r.name = 'superadmin'
    and e.auth_user_id is not null
    and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
  limit 1;
  if v_superadmin_auth_id is null then
    raise exception 'SETUP FAIL: ingen aktiv superadmin';
  end if;
  perform set_config('request.jwt.claim.sub', v_superadmin_auth_id::text, true);

  -- Setup: opret klient
  v_client_id := core_identity.client_upsert(
    'Logo Test Klient', '{}'::jsonb,
    'T10-logo setup: opret klient', true, null
  );

  -- ─── T1: client_logo_set + client_logo_get ──────────────────────────
  perform core_identity.client_logo_set(
    v_client_id, v_test_logo, 'image/png', 'logo.png',
    'T10-logo T1: upload logo'
  );

  select logo_bytes, logo_content_type, logo_filename
    into v_returned_bytes, v_returned_ct, v_returned_fn
    from core_identity.client_logo_get(v_client_id);
  if v_returned_bytes is null or v_returned_bytes <> v_test_logo then
    raise exception 'T1 FAIL: client_logo_get returnerede ikke set bytes';
  end if;
  if v_returned_ct <> 'image/png' or v_returned_fn <> 'logo.png' then
    raise exception 'T1 FAIL: metadata mismatch';
  end if;

  -- ─── T2 (V3 KRITISK): client_upsert UPDATE bevarer logo ─────────────
  select logo_bytes, logo_filename into v_logo_bytes_before, v_logo_filename_before
    from core_identity.clients where id = v_client_id;

  perform core_identity.client_upsert(
    'Logo Test Klient (omdøbt)', '{}'::jsonb,
    'T10-logo T2: ren navne-ændring — logo skal bevares',
    true, v_client_id
  );

  select logo_bytes, logo_filename into v_logo_bytes_after, v_logo_filename_after
    from core_identity.clients where id = v_client_id;

  if v_logo_bytes_after is distinct from v_logo_bytes_before then
    raise exception 'T2 FAIL (V3 KRITISK): client_upsert UPDATE skal IKKE røre logo_bytes!';
  end if;
  if v_logo_filename_after is distinct from v_logo_filename_before then
    raise exception 'T2 FAIL (V3 KRITISK): client_upsert UPDATE skal IKKE røre logo_filename!';
  end if;

  -- ─── T3: client_logo_set fejler hvis ét felt NULL ───────────────────
  begin
    v_caught := null;
    perform core_identity.client_logo_set(
      v_client_id, v_test_logo, 'image/png', null, 'T10-logo T3: partiel'
    );
  exception when sqlstate '22023' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T3 FAIL: client_logo_set med NULL filename skal afvises';
  end if;

  -- ─── T4: client_logo_clear nulstiller alle tre felter ───────────────
  perform core_identity.client_logo_clear(v_client_id, 'T10-logo T4: fjern logo');

  select logo_bytes, logo_content_type, logo_filename
    into v_returned_bytes, v_returned_ct, v_returned_fn
    from core_identity.clients where id = v_client_id;
  if v_returned_bytes is not null or v_returned_ct is not null or v_returned_fn is not null then
    raise exception 'T4 FAIL: client_logo_clear skal nulstille alle tre felter';
  end if;

  -- ─── T5 (V12 KRITISK-SIKKERHEDSHUL): audit-PII-hashing af logo_filename
  -- audit_log skrives af stork_audit-trigger. Vi verificerer at logo_filename
  -- + logo_bytes er sha256-hashed i new_values (pii_level='direct' i T10.4).
  perform core_identity.client_logo_set(
    v_client_id, v_test_logo_2, 'image/png', 'personlig-info-logo.png',
    'T10-logo T5: upload til audit-test'
  );

  -- Audit-log INSERT'er via after-trigger. SELECT seneste UPDATE-row for clients.
  if not exists (
    select 1 from core_compliance.audit_log
    where table_schema = 'core_identity'
      and table_name = 'clients'
      and record_id = v_client_id
      and operation = 'UPDATE'
      and (new_values ->> 'logo_filename') like 'sha256:%'
      and (new_values ->> 'logo_bytes') like 'sha256:%'
  ) then
    raise exception 'T5 FAIL (V12 KRITISK-SIKKERHEDSHUL): logo_filename + logo_bytes skal være SHA256-hashed i audit_log.new_values';
  end if;

  -- logo_content_type forbliver klartekst (pii_level='none')
  if not exists (
    select 1 from core_compliance.audit_log
    where table_schema = 'core_identity'
      and table_name = 'clients'
      and record_id = v_client_id
      and operation = 'UPDATE'
      and (new_values ->> 'logo_content_type') = 'image/png'
  ) then
    raise exception 'T5 FAIL: logo_content_type skal være klartekst i audit_log (pii_level=none)';
  end if;

  raise notice 'T10 logo smoke: ALL TESTS PASSED (T1-T5)';
end;
$test$;

rollback;

 succeeded in 0ms:
# Codex review — trin-10 runde 5

**Pakke:** trin-10
**Fase:** build
**Plan-fil:** docs/coordination/arkiv/trin-10-plan.md
**Plan-SHA:** c3c29e1
**Dato:** 2026-05-21
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/arkiv/trin-10-plan.md 5 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

Reading additional input from stdin...
OpenAI Codex v0.131.0
--------
workdir: /home/mathias/stork-2.0
model: gpt-5.5
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR] (network access enabled)
reasoning effort: xhigh
reasoning summaries: none
session id: 019e4a78-bf6c-7380-a51d-db99298c53c8
--------
user
Læs disse filer:
1. docs/skabeloner/codex-review-prompt.md (niveau 1-prefix — anvend ordret)
2. docs/coordination/arkiv/trin-10-plan.md (build-fasen for pakke trin-10)

RUNDE-NUMMER: 5
FASE: build
FORMÅL: udledes af "## Formål"-sektionen i docs/coordination/arkiv/trin-10-plan.md.

Følg niveau 1-prefixens scope-krav + marker-protokol + dialog-regler.

Max 350 ord output. Brug marker-format fra niveau 1-prefix (KRITISK/MELLEM/LAV/HUL/OPTIMERING-FORSLAG/G-NUMMER-KANDIDAT etc.). Hvis du ikke har fund: skriv "APPROVAL — Runde 5".
codex
Jeg læser først review-prefixet og trin-10-planen, så jeg kan afgrænse build-scope og bruge de rigtige markører.
exec
/bin/bash -lc "sed -n '1,260p' docs/coordination/arkiv/trin-10-plan.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
# Trin 10 — Plan V14

**Pakke:** §4 trin 10 — Klient-skabelon + felt-definitioner
**Krav-dok:** `docs/coordination/trin-10-krav-og-data.md` (PR #63, commit `8c3c7b9`)
**Branch:** `claude/trin-10-plan-v3`
**Status:** V14 — Codex APPROVED V13 (runde 13); V14 lukker proaktivt fund fra Code walk-through
**Dato:** 2026-05-21

---

## Codex runde 13 + Code walk-through (LØS — V5.3 svar-typer)

Codex runde 13 leverede **APPROVAL** på V13. Code's parallel grundige walk-through (Mathias-instruks "vi skal vel løse de huller") fandt 1 yderligere hul som Codex missede.

| #   | Severity            | V13-step                   | Fund                                                                                                                                                                                                                                                                                                                                                                     | V14-svar                                                                                                                                                                                                                             | Hvor i V14      |
| --- | ------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| 1   | KRITISK/FUNKTIONELT | T10.7b `client_node_close` | Wrapper mangler klient-eksistens-check. Bryder krav-dok §3.4 "valideres at klienten faktisk findes" ved BÅDE oprettelse OG ændring. Close er en ændring. Uden check: pending oprettes på ikke-eksisterende client_id → `_apply_client_close` UPDATE'er 0 rows → silent no-op. `client_node_place` har check siden V7; `client_node_close` blev tilføjet i V9 uden check. | **ACCEPT.** Tilføj `if not exists (select 1 from core_identity.clients where id = p_client_id) then raise P0002` i `client_node_close` wrapper FØR session-var + pending_change_request. Konsistent med client_node_place's mønster. | T10.7b + T10.15 |

**Code walk-through-disciplin lockes:** Codex' fokus var aktiv-check + audit-PII + test-setup. Eksistens-check på close-vejen var ikke i Codex' scan-pattern. Walk-through skal proaktivt verificere KRAV-DOK § for § mod hver wrapper/apply-handler, ikke kun "hvad Codex har set."

---

## Codex runde 12 (LØS — V5.3 svar-typer)

| #   | Severity          | V12-step                             | Fund                                                                                                                                                                                                                                                          | V13-svar                                                                                                                                                                                                                                                                                               | Hvor i V13 |
| --- | ----------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| 1   | TEKNISK-BLOKERING | T10.15 `t10_client_active_check.sql` | T9 seed (`20260518000004:228-229`) sætter `undo_settings.undo_period_seconds = 24*3600` for `client_place`/`client_close`. `pending_change_apply` stopper med `not_yet_due` før dispatch til `_apply_client_place`. Test rammer due-gate, ikke aktiv-checken. | **ACCEPT.** T10.15 udvidet med setup-disciplin: BEGIN-blokken sætter `set_config('stork.t9_write_authorized', 'true', true)` + UPDATE `undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place', 'client_close')` transaction-local. ROLLBACK ved test-slut sikrer ingen lækage. | T10.15     |

---

## Codex runde 11 (LØS — V5.3 svar-typer)

| #   | Severity              | V11-step | Fund                                                                                                                                                                                                                                                    | V12-svar                                                                                                                                                                                                                                                                                                   | Hvor i V12     |
| --- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 1   | KRITISK-SIKKERHEDSHUL | T10.4    | `clients.logo_filename` klassificeret som `pii_level='none'` → brugerleveret filnavn lander i klartekst i audit_log. Inkonsistent med `clients.name='direct'` (forsigtigheds-pattern). Filnavne kan realistisk indeholde klient-/personidentifikatorer. | **ACCEPT + proaktiv udvidelse.** `logo_filename` → `pii_level='direct'`. **Plus:** `logo_bytes` → `'direct'` (binær billed-data kan vise stifter/medarbejdere — samme forsigtigheds-pattern). `logo_content_type` forbliver `'none'` (kun MIME-type). T10.15's logo-test udvides med audit-hash-assertion. | T10.4 + T10.15 |

---

## Codex runde 10 (LØS — V5.3 svar-typer)

| #   | Severity          | V10-step                     | Fund                                                                                                                                                                                                                                      | V11-svar                                                                                                                                                                                                                        | Hvor i V11 |
| --- | ----------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | KRITISK           | Fundament-tjek               | Tabellen nævner kun T10.8/T10.9/T10.10/T10.11 + T10.13. V10 tilføjer/ændrer write-veje i T10.7b (`client_node_place`, `client_node_close`, `_apply_client_place`) + T10.10a (`client_field_definition_set_active`) — manglende krydstjek. | **ACCEPT.** Fundament-tjek-tabel udvidet med T10.7b (GRANT/policy/session-var + apply-dispatch + jsonb payload producer/consumer) og T10.10a. Eksempel-row-tjek udvidet med immutable-key + pii-downgrade-block + active-check. |
| 2   | G-NUMMER-KANDIDAT | T10.16 / Oprydnings-strategi | T10.16 nævner FK-coverage som G-nummer-kandidat, men oprydnings-strategi siger "Ingen G-numre forventet". Inkonsistent.                                                                                                                   | **ACCEPT.** **G058** registreret i `docs/teknisk/teknisk-gaeld.md` (FK-coverage-fitness-check ikke implementeret per master-plan §3.19). Oprydnings-strategi opdateret til at angive G057 + G058 som del af trin 10.            |

Plus V10-amendment (`923543c` efter V10's hoved-commit): helper grants matcher is_admin's pattern (authenticated + anon + service_role).

---

## Codex runde 9 (LØS — V5.3 svar-typer)

Codex runde 9 fandt 1 TEKNISK-BLOKERING: `_apply_client_place` bruger `is_admin()` til superadmin-bypass, men `auth.uid()` er NULL i cron-apply-context. Superadmin's pending kan fejle ved cron-apply hvis klient deaktiveres mellem pending og apply.

| #   | Severity          | V9-step              | Fund                                                                                                                                                                                                     | V10-svar                                                                                                                                                                                                                                                                                                                                                             | Hvor i V10                      |
| --- | ----------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 1   | TEKNISK-BLOKERING | T10.7b apply-handler | `is_admin()` returnerer false i cron-context (ingen `auth.uid()`). Wrapper-bypass evalueres mod current user, apply-bypass mod cron-rolle → inkonsistent. Superadmin's pending kan fejle ved cron-apply. | **ACCEPT (option A).** Tilføj ny helper `core_identity.is_admin_by_employee_id(p_employee_id uuid) returns boolean` der tjekker employee-rolle direkte (ikke `auth.uid()`). Apply-handler henter `requested_by` + `approved_by` fra pending_changes-rækken og kalder helperen. Bypass hvis EITHER er superadmin. Wrapper beholder `is_admin()` (altid auth-context). | T10.7b udvidet + T10.15 udvidet |

**Design-begrundelse:** Wrapper kører altid med auth-context (direct user-call) → `is_admin()` virker. Apply-handler kører i to contexts: direct admin-call OG cron-call (ingen auth). For konsistens skal apply-bypass være baseret på pending-rækkens employee-historie. "Bypass hvis EITHER requester eller approver er superadmin" matcher "superadmin må alt"-reglen — superadmin's involvering på enten oprettelses- eller godkendelses-side legitimerer apply.

---

## Codex runde 8 (LØS — V5.3 svar-typer)

Codex runde 8 fandt 1 TEKNISK-BLOKERING + 1 G-nummer-kandidat. Code's parallel walk-through fandt ingen yderligere fund.

| #   | Severity                  | V8-step                    | Fund                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | V9-svar                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Hvor i V9      |
| --- | ------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 1   | TEKNISK-BLOKERING         | T10.7b + client_node_close | `client_node_place` kalder `pending_change_request` som INSERT'er i `core_identity.pending_changes`. Tabellen har INSERT-policy (T9-fundament-supplement `20260518100000:49-51`) der kræver `current_setting('stork.t9_write_authorized', true) = 'true'`. T10.7b's CREATE OR REPLACE sætter ikke session-var → INSERT vil fejle for authenticated-bruger med FORCE RLS. Samme latente T9-bug findes i `client_node_close` (uændret af V8) og de øvrige 5 T9-pending-wrappers (org*node_upsert, etc.) — men trin 10's scope er kun client-RPC'erne. **Code walk-through missede dette** fordi T9-tests bruger `\_apply*\*`-handlers direkte, aldrig fuld wrapper-vej. | **ACCEPT.** T10.7b udvides: `client_node_place` sætter `set_config('stork.t9_write_authorized', 'true', true)` efter aktiv-check, før `pending_change_request`. Plus ny CREATE OR REPLACE af `client_node_close` med samme session-var (uden aktiv-check — `client_node_close` skal kunne lukke placement på inaktiv klient). Default-privileges på `core_identity` schema (`grant execute on functions to authenticated`, T1) dækker GRANT-kravet — explicit GRANT er ikke nødvendigt. | T10.7b udvidet |
| 2   | G-NUMMER-KANDIDAT → ADOPT | T10.13                     | Tab/grant-INSERT-queries filtrerer på `p.name in ('clients', 'client_field_definitions')` uden at scope til `org_structure`-area. Hvis nogen senere tilføjer page med samme navn i andet area (usandsynligt, men ikke robust).                                                                                                                                                                                                                                                                                                                                                                                                                                        | **ADOPT.** Trivielt fix: scope queries til `org_structure`-area via JOIN på area_id.                                                                                                                                                                                                                                                                                                                                                                                                    | T10.13         |

**T9-public-wrapper-bug (Code-observation):** Codex' fund afslører at T9's 7 public-wrappers (`org_node_upsert`, `org_node_deactivate`, `team_close`, `employee_place`, `employee_remove_from_node`, `client_node_place`, `client_node_close`) alle mangler `t9_write_authorized`-session-var. Trin 10's scope er kun de to client-RPC'er; de øvrige 5 er T9-arbejde der skal adresseres som G-nummer/separat pakke (T9 ville fungere i tests fordi `_apply_*`-handlers er SECURITY DEFINER og kan kaldes direkte, men authenticated-bruger via wrapper-vej er broken).

**Walk-through-disciplin V9:** "Fuldt gear" skal omfatte sporing af hver RPC's komplette write-vej til alle berørte RLS-tabeller, ikke kun den direkte tabel. Hver write-RPC's call-chain skal verificeres mod alle policies på destination-tabeller.

---

## Codex runde 7 + Code grundig walk-through (LØS — V5.3 svar-typer)

Codex-runde 7 fandt 1 KRITISK. Code's parallel grundige walk-through (Mathias-instruks "fuldt gear") fandt 3 yderligere fund (2 KRITISK + 1 MELLEM) som Codex missede.

| #   | Severity | V7-step                | Fund                                                                                                                                                                                                                                                                                        | Kilde             | V8-svar                                                                                                                                                                                                                                                                          |
| --- | -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | KRITISK  | T10.6                  | `clients_validate_fields()` trigger-funktion har `cfd.is_active = true` filter. Rammer fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`). T10.16 allowlister kun `client_field_definitions_list`.                                                                    | Codex runde 7     | **ACCEPT.** Udvid T10.16 med `core_identity.clients_validate_fields`. Forretningsmæssigt korrekt at filtrere på aktive felt-definitioner i validate-trigger (LENIENT: ukendte/inaktive keys → warning) — det er ikke R7d-pattern (employees-dual-column), bare lifecycle-signal. |
| 2   | KRITISK  | T10.8                  | `client_upsert` UPDATE-branch sætter `is_active = p_is_active` (default `true`). En admin der opdaterer navn på en inaktiv klient uden eksplicit at sende p_is_active=false **reaktiverer klienten utilsigtet**. Bryder krav-dok §3.1's distinction af "Ændr klient" vs "Deaktivér klient". | Code walk-through | **ACCEPT.** Drop `is_active` fra T10.8's UPDATE-SET-klausul. p_is_active gælder kun INSERT-branch. Aktiv-toggle sker via `client_set_active` (T10.9). Matcher logo-pattern (rør'es ikke i client_upsert).                                                                        |
| 3   | KRITISK  | T10.10                 | `client_field_definition_upsert` UPDATE-branch har **samme bug** med `p_is_active` default true → opdatering af inaktiv felt-definition reaktiverer den utilsigtet.                                                                                                                         | Code walk-through | **ACCEPT.** Drop `is_active` fra T10.10's UPDATE-SET-klausul. + ny T10.10a (se #4).                                                                                                                                                                                              |
| 4   | MELLEM   | T10.10 / krav-dok §3.2 | Krav-dok §3.2 specificerer "Deaktivér felt-definition" som distinct funktion, men V7 har kun samlet `client_field_definition_upsert`. Ingen direct toggle-RPC.                                                                                                                              | Code walk-through | **ACCEPT.** Ny step **T10.10a**: `client_field_definition_set_active(p_field_id, p_is_active, p_change_reason)`. Matcher `client_set_active`-mønstret + krav-dok §3.2.                                                                                                           |

**Superadmin-bypass-konsistens (Mathias-bekræftet 2026-05-21):** T10.7b's aktiv-check har superadmin-bypass (forretnings-invariant), men T10.10's `key`+`pii_level direct→non-direct` har **IKKE** bypass — det er **sikkerheds-invariant** (audit-PII-datalæk i klartekst), ikke forretnings-regel. Sikkerheds-invariants står over "superadmin må alt". Konsistent disciplin.

**Code walk-through-pass verificeret (positivt):**

- Alle 14 fitness-checks gennemgået; kun R7d ramt (T10.6 + T10.12 → T10.16-allowlist dækker begge)
- migration-set-config-discipline: T10.4 + T10.13 sætter source_type + change_reason korrekt
- pii_level escalation (none→indirect→direct) sikker — eksisterende klartekst-værdier i historisk audit_log er retro-acceptable (de blev IKKE hash'et da pii_level var none ved INSERT-tidspunktet)
- audit_filter_values STABLE + mutable-tabel-læsning matcher T1-mønster
- postgrest-sentinel-list rammer kun T9-RPCs, ikke T10

---

## Mathias-terminal-review V6 (LØS — V5.3 svar-typer)

V6's grundlæggende design er bekræftet OK i terminal-review (no-dedup-markers, ON CONFLICT, tab-aware read-paths, T10.16-retning, begin/rollback for FK-test). Men review fandt 4 yderligere fund hvor V6 stadig ikke matchede krav-dok eller havde stale tekst.

| #   | Severity | V6-step            | Fund                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | V7-svar                                                                                                                                                                                                                                                                                                                                                                                                            | Hvor i V7                     |
| --- | -------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| 1   | KRITISK  | T10.7 (FK)         | FK sikrer KUN eksistens, ikke at klient er aktiv. Krav-dok §2.5.2: "Inaktiv klient bliver stående for historik, men kan ikke vælges som ny team-tilknytning." T9-wrapper `client_node_place` (`20260518000007:140-170`) validerer permission + team-only, men ikke aktiv klient. T9-supplement `_apply_client_place` (`20260520000000:285-352`) validerer team-only + team-aktiv, men ikke klient-aktiv. Krav-dok §3.4 siger "valideres at klienten faktisk findes" — sammen med §2.5.2 betyder det: findes + aktiv. Plus: pending kan oprettes mens klient aktiv og applies efter deaktivering → apply-pathen SKAL også tjekke. | **ACCEPT.** Ny step T10.7b: CREATE OR REPLACE begge RPC'er med aktiv-check **og superadmin-bypass** (Mathias 2026-05-21: "superadmin må alt"). Wrapper-rækkefølge: has_permission → team-check → klient-eksistens (P0002) → klient-aktiv (22023 hvis ikke superadmin). Apply-handler: tilføj klient-eksistens (P0002) + klient-aktiv (P0001 hvis ikke superadmin) FØR INSERT/UPDATE. `client_node_close` rør IKKE. | T10.7b (ny) + T10.15          |
| 2   | MELLEM   | Plan-tekst         | To stale referencer til "fjern client_id fra FK_COVERAGE_EXEMPTIONS" på linje 113 (Verificerede afhængigheder-tabel) + linje 142 (Scope-bullet). En implementeringsagent kan følge den forkerte del og lede efter ikke-eksisterende allowlist.                                                                                                                                                                                                                                                                                                                                                                                   | **ACCEPT.** Omformulér begge linjer til at matche T10.16's korrekte V6-retning (R7d-allowlist, ikke FK-allowlist).                                                                                                                                                                                                                                                                                                 | Linje 113 + 142               |
| 3   | MELLEM   | T10.15             | Smoke-test dækker FK-eksistens + ON DELETE RESTRICT, men ikke det vigtigste forretningskrav (krav-dok §2.5.2: inaktiv klient kan ikke vælges).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **ACCEPT.** Ny separat smoke-test `t10_client_active_check.sql` med 4 scenarier: aktiv place success, inaktiv place rejection (22023), pending-mens-aktiv + deaktiver + apply rejection (P0001), close virker på inaktiv klient.                                                                                                                                                                                   | T10.15 + ny test-fil          |
| 4   | LAV      | T10.4 + Konklusion | "alle 9 kolonner" + "(9 kolonner)" på `client_field_definitions` — SQL har 10 rækker (id, key, display_name, field_type, required, pii_level, display_order, is_active, created_at, updated_at). Plus konklusion-historik siger T10.4 ON CONFLICT er "DEFER", men V6 gjorde det obligatorisk. Codex V1-fund-tabel siger stadig "DEFER → G-nummer".                                                                                                                                                                                                                                                                               | **ACCEPT.** Tekstrettelser: 9→10 på `client_field_definitions`; opdatér V1-fund-tabel (linje 68) og Konklusion-historik (linje 1335) til at reflektere V6's ACCEPT.                                                                                                                                                                                                                                                | T10.4 + linje 68 + linje 1335 |

**Rettigheds-grænse (Mathias-bekræftet 2026-05-21):** Trin 10 introducerer ingen nye permission-koncepter ift. T9. Permission-modellen (`has_permission` resolver + areas/pages/tabs/grants) er etableret i T9; trin 10 udvider den med 2 nye pages under `org_structure`-area. Ingen klient-baseret adgangs-scope (det ville være senere pakke hvis besluttet). Aktiv-check (T10.7b) er en forretnings-**invariant**, ikke en permission-check — den håndhæves uafhængigt af caller-identitet.

**Stamme/rådata-disciplin (Mathias-bekræftet 2026-05-21):** Krav-dok §2.5.1 + §2.1.1: klient-rækker (stammen) bevares evigt; rå data (salg/calls) følger klienten med dato-binding. Min plan respekterer dette: ingen DELETE-policy på `core_identity.clients`, ingen anonymisering, immutable `key`/`pii_level` på felt-definitioner, audit-trigger på alle write-veje. Lovlige UPDATE'er (name, fields, is_active, logo) bevarer audit-spor i `audit_log`.

---

## Mathias-terminal-review V5 + Code grundig validering (LØS — V5.3 svar-typer)

V5 fik Codex-automation APPROVAL i runde 5, men Mathias' selvstændige terminal-review afslørede 3 KRITISK-fund som automation-runden missede. Mathias bad om grundig validering før V6 — Code har genlæst hele planen op mod nuværende kode (fitness-script, T1-T9-migrations) og fundet 3 yderligere problemer som automation-runden også missede.

| #   | Severity            | V5-step                                         | Fund                                                                                                                                                                                                                                                                                                                                                   | Kilde            | V6-svar                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | ------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | KRITISK             | T10.1 + T10.2                                   | Tabellerne mangler `-- no-dedup-key: <reason>` marker. Fitness-check `dedup-key-or-opt-out` (`scripts/fitness.mjs:422-450`) blokerer alle nye CREATE TABLE uden dedup_key-kolonne eller eksplicit opt-out-marker.                                                                                                                                      | Mathias-terminal | **ACCEPT.** Tilføj T9-stil marker over begge CREATE TABLE-statements.                                                                                                                                                                                                                                                                                                                                  |
| 2   | KRITISK             | T10.4                                           | INSERT i `core_compliance.data_field_definitions` mangler `ON CONFLICT do nothing`. `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES` (`scripts/fitness.mjs:162-172`); `migration-on-conflict-discipline` (`:675-737`) håndhæver det. V5's DEFER til G-nummer var forkert — fitness brækker.                                    | Mathias-terminal | **ACCEPT.** Tilføj `on conflict (table_schema, table_name, column_name) do nothing`. Fjern G-nummer-kandidat-tekst fra Optimerings-hypoteser (det er ikke en optimering, det er krav).                                                                                                                                                                                                                 |
| 3   | KRITISK/FUNKTIONELT | T10.1 + T10.2 + T10.8 + T10.9 + T10.11 + T10.12 | `has_permission(p_page, NULL, false)` med `p_tab_key=NULL` springer tab-resolver over (`20260518000010_t9_seed_owners.sql:35`) og prøver kun page/area-grants. T10.13 seeder kun TAB-grants → read-paths matcher INGEN grant og returnerer false → SELECT-policy + read-RPC'er tilbageholder data for legitime brugere med kun `clients/manage`-grant. | Mathias-terminal | **ACCEPT.** Skift alle read-paths til tab-aware: `has_permission('clients', 'manage', false)` og `has_permission('client_field_definitions', 'manage', false)`. Berører SELECT-policies (T10.1 + T10.2), client_get/client_list/client_field_definitions_list (T10.12), client_logo_get (T10.11). Write-paths bruger allerede 'manage' tab — konsistent.                                               |
| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
| 5   | KRITISK             | T10.12 client_field_definitions_list            | RPC bruger `where p_include_inactive or is_active = true` — matcher fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`) regex. client_field_definitions har KUN is_active (ingen status-kolonne), så funktionen skal allowlist'es i `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS`.                                                          | Code-validering  | **ACCEPT.** Tilføj `core_identity.client_field_definitions_list` til allowlisten via T10.16's fitness-script-ændring.                                                                                                                                                                                                                                                                                  |
| 6   | KRITISK             | T10.15 `t10_client_node_placements_fk.sql`      | Smoke-test INSERT'er i `core_identity.client_node_placements` som er på `TX_WRAP_REQUIRED_FOR_TEST_INSERT` (`scripts/fitness.mjs:110`). Fitness-check `db-test-tx-wrap-on-immutable-insert` (`:901-924`) kræver `begin;` + `rollback;` på linje-niveau.                                                                                                | Code-validering  | **ACCEPT.** Eksplicit `begin;` + `rollback;` wrap-pattern i T10.15's FK-test specifikation. T10.7a's fixture-INSERT i T9-tests sker indenfor eksisterende BEGIN/ROLLBACK (verificeret: `t9_placements.sql:9` + `:213`, `t9_backdated_historical_traversal.sql:9` + `:311`).                                                                                                                            |

**Falsk-positiv-rod-årsag:** Codex-automation kører `codex exec` med model-reasoning; den læser plan-fil + plan-prefix-instruktioner men ikke nødvendigvis fitness-script-kilden eller has_permission-implementering. Den fanger mønstre den allerede kender; den fanger ikke fitness-checks den ikke ved findes. Manuel walk af plan op mod kode (fitness.mjs + has_permission-body + TX_WRAP_REQUIRED) er nødvendig.

---

## Codex V4-fund-håndtering (LØS — V5.3 svar-typer)

Codex runde 4 (review-fil: `docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md`) leverede 1 fund.

| #   | Severity | V4-step       | Fund                                                                                                                                                                                                                                               | V5-svar                                                                                                                                                                                                                                                                                   | Hvor i V5     |
| --- | -------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1   | KRITISK  | T10.1 + T10.2 | Tabellerne har kun `GRANT SELECT to authenticated`. Mangler `GRANT INSERT, UPDATE` der er nødvendigt før RLS-policy/session-var-vejen kan virke for write-RPC'erne (T10.8-T10.11). Bryder niveau 1-prefixens GRANT + policy + session-var-tre-pak. | **ACCEPT.** Tilføj `grant insert, update on table core_identity.clients to authenticated` i T10.1 og tilsvarende for `client_field_definitions` i T10.2. Ingen DELETE-grant (inaktivering via is_active, ikke DELETE). Matcher T1's mønster for `core_compliance.data_field_definitions`. | T10.1 + T10.2 |

---

## Codex V3-fund-håndtering (LØS — V5.3 svar-typer)

Codex runde 3 (review-fil: `docs/coordination/codex-reviews/2026-05-20-trin-10-runde-3.md` på `claude/trin-10-plan-v3`) leverede 1 fund.

| #   | Severity | V3-step | Fund                                                                                                                                                                                                                                                                                                                                | V4-svar                                                                                                                                 | Hvor i V4               |
| --- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 1   | KRITISK  | T10.13  | T10.13 sætter `stork.source_type` + `stork.change_reason` men IKKE `stork.t9_write_authorized = 'true'` som T9-supplements INSERT-policies på `permission_pages` / `permission_tabs` / `role_permission_grants` kræver. Brudt niveau 1-prefix end-to-end-tjek for INSERT/UPDATE/DELETE-veje (GRANT + policy + session-var-tre-pak). | **ACCEPT.** Tilføj `select set_config('stork.t9_write_authorized', 'true', false);` før INSERTs i T10.13. Opdater Fundament-tjek-tabel. | T10.13 + Fundament-tjek |

---

## Codex V2-fund-håndtering (LØS — V5.3 svar-typer)

Codex runde 2 (review-fil: `docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md` på `claude/trin-10-plan-v3`) leverede 2 fund.

| #   | Severity              | V2-step        | Fund                                                                                                                                                                                                                                                                                                 | V3-svar                                                                                                                                                                                                                     | Hvor i V3                          |
| --- | --------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 1   | KRITISK-SIKKERHEDSHUL | T10.10 / T10.5 | Audit-hashing afhænger af mutable `client_field_definitions.key`/`pii_level`. Hvis felt-definitionen senere får ny `key` eller `pii_level='none'`, vil eksisterende `clients.fields`-værdier skrives i klartekst i audit. V2-fixet for `is_active=false` dækker ikke key-rename eller pii-downgrade. | **ACCEPT.** Gør `key` og `pii_level` effektivt immutable for eksisterende definitions via T10.10's RPC: blokér UPDATE af `key`; blokér `pii_level` direct → non-direct. Tilføj smoke-test der verificerer begge invariants. | T10.10 + T10.15                    |
| 2   | KRITISK               | T10.3          | Min plan baserede sig på D1b's gamle allowlist og missede P1a's tilføjelse af `('core_compliance', 'anonymization_strategies', null)`. CREATE OR REPLACE ville regressere allowlisten og kan blokere fremtidige updates af permanent-klassifikationer for den tabel.                                 | **ACCEPT.** T10.3 baseres på P1a's VALUES-blok (15 entries) + tilføjer 2 nye trin 10-entries (17 total). Recon-først udvidet med P1a's omskrivning.                                                                         | T10.3 + Verificerede afhængigheder |

---

## Codex V1-fund-håndtering (LØS — V5.3 svar-typer)

Codex runde 1 (review-fil: `docs/coordination/codex-reviews/2026-05-20-trin-10-runde-1.md` på `claude/trin-10-plan-v3`) leverede 4 fund.

| #   | Severity              | V1-step | Fund                                                                                                                                                                      | V2-svar                                                                                                                                                                                                                                                                             | Hvor i V2      |
| --- | --------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 1   | KRITISK               | T10.1   | `clients.fields` mangler `CHECK (jsonb_typeof = 'object')` — scalar/array kan lagre uden audit-PII-walking.                                                               | **ACCEPT.** Tilføj CHECK på T10.1. Smoke-test i T10.15 udvides.                                                                                                                                                                                                                     | T10.1 + T10.15 |
| 2   | KRITISK-SIKKERHEDSHUL | T10.5   | audit_filter_values clients-special-case filtrerer `is_active = true` → hvis felt deaktiveres, hashes værdier i eksisterende fields ikke længere. Datalæk i audit-flowet. | **ACCEPT.** Fjern `is_active = true`-filter fra audit_filter_values clients-special-case. Hash alle direct-PII keys uanset is_active. Validation-trigger kan stadig behandle inactive som ukendt key.                                                                               | T10.5          |
| 3   | MELLEM                | T10.15  | Smoke-tests dækker ukendt key lenient/strict, men ikke non-object `fields`.                                                                                               | **ACCEPT.** Tilføj test for CHECK-violation ved non-object.                                                                                                                                                                                                                         | T10.15         |
| 4   | G-NUMMER-KANDIDAT     | T10.4   | INSERT mangler `ON CONFLICT do nothing` (T9-classify bruger det). Ikke blocker for greenfield.                                                                            | **V2-svar: DEFER → G-nummer** (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness-check `migration-on-conflict-discipline` håndhæver det på `core_compliance.data_field_definitions`. Plan har nu `ON CONFLICT (table_schema, table_name, column_name) DO NOTHING`. | T10.4          |

---

## Recon-historik

exec
/bin/bash -lc 'rg -n "audit-hash|T4|G-nummer|APPROVAL|PLAN-AFVIGELSE|clients_validate_fields" docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md docs/coordination/arkiv/trin-10-plan.md docs/teknisk/teknisk-gaeld.md' in /home/mathias/stork-2.0
 succeeded in 0ms:
docs/teknisk/teknisk-gaeld.md:536:- **Beskrivelse:** `scripts/codex-review.sh` halt-marker-parseren tjekkede for V5.3 halt-markers (`BRUD-PAA-KRAV`, `TEKNISK-BLOKERING`, `PLAN-AFVIGELSE`, `KRITISK-SIKKERHEDSHUL`, `WORKAROUND-INTRODUCERET`, `STOP-FOR-CLARIFICATION`, `ESCALATE`, `AUTO-ESKALATION`) som exit-2-trigger. Severity-prefix `KRITISK:` alene blev ikke parset selvstændigt. En ren `KRITISK: <fund>`-linje uden halt-marker gav exit 0, selvom `docs/coordination/overvaagning/codex-overvaagning.md` siger "KRITISK ... STOPPER plan i alle runder". Samme problem for NEEDS-MATHIAS.
docs/coordination/arkiv/trin-10-plan.md:13:Codex runde 13 leverede **APPROVAL** på V13. Code's parallel grundige walk-through (Mathias-instruks "vi skal vel løse de huller") fandt 1 yderligere hul som Codex missede.
docs/coordination/arkiv/trin-10-plan.md:35:| 1   | KRITISK-SIKKERHEDSHUL | T10.4    | `clients.logo_filename` klassificeret som `pii_level='none'` → brugerleveret filnavn lander i klartekst i audit_log. Inkonsistent med `clients.name='direct'` (forsigtigheds-pattern). Filnavne kan realistisk indeholde klient-/personidentifikatorer. | **ACCEPT + proaktiv udvidelse.** `logo_filename` → `pii_level='direct'`. **Plus:** `logo_bytes` → `'direct'` (binær billed-data kan vise stifter/medarbejdere — samme forsigtigheds-pattern). `logo_content_type` forbliver `'none'` (kun MIME-type). T10.15's logo-test udvides med audit-hash-assertion. | T10.4 + T10.15 |
docs/coordination/arkiv/trin-10-plan.md:44:| 2   | G-NUMMER-KANDIDAT | T10.16 / Oprydnings-strategi | T10.16 nævner FK-coverage som G-nummer-kandidat, men oprydnings-strategi siger "Ingen G-numre forventet". Inkonsistent.                                                                                                                   | **ACCEPT.** **G058** registreret i `docs/teknisk/teknisk-gaeld.md` (FK-coverage-fitness-check ikke implementeret per master-plan §3.19). Oprydnings-strategi opdateret til at angive G057 + G058 som del af trin 10.            |
docs/coordination/arkiv/trin-10-plan.md:64:Codex runde 8 fandt 1 TEKNISK-BLOKERING + 1 G-nummer-kandidat. Code's parallel walk-through fandt ingen yderligere fund.
docs/coordination/arkiv/trin-10-plan.md:71:**T9-public-wrapper-bug (Code-observation):** Codex' fund afslører at T9's 7 public-wrappers (`org_node_upsert`, `org_node_deactivate`, `team_close`, `employee_place`, `employee_remove_from_node`, `client_node_place`, `client_node_close`) alle mangler `t9_write_authorized`-session-var. Trin 10's scope er kun de to client-RPC'er; de øvrige 5 er T9-arbejde der skal adresseres som G-nummer/separat pakke (T9 ville fungere i tests fordi `_apply_*`-handlers er SECURITY DEFINER og kan kaldes direkte, men authenticated-bruger via wrapper-vej er broken).
docs/coordination/arkiv/trin-10-plan.md:83:| 1   | KRITISK  | T10.6                  | `clients_validate_fields()` trigger-funktion har `cfd.is_active = true` filter. Rammer fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`). T10.16 allowlister kun `client_field_definitions_list`.                                                                    | Codex runde 7     | **ACCEPT.** Udvid T10.16 med `core_identity.clients_validate_fields`. Forretningsmæssigt korrekt at filtrere på aktive felt-definitioner i validate-trigger (LENIENT: ukendte/inaktive keys → warning) — det er ikke R7d-pattern (employees-dual-column), bare lifecycle-signal. |
docs/coordination/arkiv/trin-10-plan.md:109:| 4   | LAV      | T10.4 + Konklusion | "alle 9 kolonner" + "(9 kolonner)" på `client_field_definitions` — SQL har 10 rækker (id, key, display_name, field_type, required, pii_level, display_order, is_active, created_at, updated_at). Plus konklusion-historik siger T10.4 ON CONFLICT er "DEFER", men V6 gjorde det obligatorisk. Codex V1-fund-tabel siger stadig "DEFER → G-nummer".                                                                                                                                                                                                                                                                               | **ACCEPT.** Tekstrettelser: 9→10 på `client_field_definitions`; opdatér V1-fund-tabel (linje 68) og Konklusion-historik (linje 1335) til at reflektere V6's ACCEPT.                                                                                                                                                                                                                                                | T10.4 + linje 68 + linje 1335 |
docs/coordination/arkiv/trin-10-plan.md:119:V5 fik Codex-automation APPROVAL i runde 5, men Mathias' selvstændige terminal-review afslørede 3 KRITISK-fund som automation-runden missede. Mathias bad om grundig validering før V6 — Code har genlæst hele planen op mod nuværende kode (fitness-script, T1-T9-migrations) og fundet 3 yderligere problemer som automation-runden også missede.
docs/coordination/arkiv/trin-10-plan.md:124:| 2   | KRITISK             | T10.4                                           | INSERT i `core_compliance.data_field_definitions` mangler `ON CONFLICT do nothing`. `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES` (`scripts/fitness.mjs:162-172`); `migration-on-conflict-discipline` (`:675-737`) håndhæver det. V5's DEFER til G-nummer var forkert — fitness brækker.                                    | Mathias-terminal | **ACCEPT.** Tilføj `on conflict (table_schema, table_name, column_name) do nothing`. Fjern G-nummer-kandidat-tekst fra Optimerings-hypoteser (det er ikke en optimering, det er krav).                                                                                                                                                                                                                 |
docs/coordination/arkiv/trin-10-plan.md:126:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/arkiv/trin-10-plan.md:174:| 4   | G-NUMMER-KANDIDAT     | T10.4   | INSERT mangler `ON CONFLICT do nothing` (T9-classify bruger det). Ikke blocker for greenfield.                                                                            | **V2-svar: DEFER → G-nummer** (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness-check `migration-on-conflict-discipline` håndhæver det på `core_compliance.data_field_definitions`. Plan har nu `ON CONFLICT (table_schema, table_name, column_name) DO NOTHING`. | T10.4          |
docs/coordination/arkiv/trin-10-plan.md:191:| T1-drop af D5's public-schema                                                                          | `supabase/migrations/20260514120000_t1_drop_public.sql:32-92`                                                  | Dropper `public.clients`, `public.client_field_definitions`, `public.client_upsert`, `public.client_field_definition_upsert`, `public.clients_validate_fields`, `public.audit_filter_values`, `public.is_admin()`, `public.stork_audit()` etc. INGEN post-T1 migration genskaber clients.                                                                                                               |
docs/coordination/arkiv/trin-10-plan.md:227:Hvis fund under review ikke bringer os tættere på dette: G-nummer, ikke blocker.
docs/coordination/arkiv/trin-10-plan.md:245:- `clients_validate_fields`-trigger (LENIENT-default + strict via session-var)
docs/coordination/arkiv/trin-10-plan.md:314:  - **Begrundelse:** Codex-automation gav APPROVAL i runde 5, men manuel terminal-review afslørede fitness-script-håndhævelse (dedup-key + on-conflict) og has_permission-tab-resolver-detalje som automation missede. Code skal validere planen mod faktisk kode, ikke kun stole på Codex-automation.
docs/coordination/arkiv/trin-10-plan.md:591:- **Hvad:** Genskab D5's clients-special-case-mønster: walker `clients.fields` jsonb og hashes hver key der har `pii_level='direct'` i `client_field_definitions`. **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** ingen `is_active = true`-filter på direct-PII keys — ellers ville deaktivering af et felt skabe datalæk for værdier i eksisterende fields jsonb. Validation-trigger T10.6 behandler stadig inactive som ukendt-key (LENIENT warning), men audit-hashing rammer alle direct-PII definitioner. Resten af T1-logikken bevares uændret.
docs/coordination/arkiv/trin-10-plan.md:710:### T10.6 — `clients_validate_fields`-trigger (LENIENT default)
docs/coordination/arkiv/trin-10-plan.md:717:  create or replace function core_identity.clients_validate_fields()
docs/coordination/arkiv/trin-10-plan.md:744:        raise exception 'clients_validate_fields: ukendte/inaktive keys i fields: % (stork.clients_fields_strict=true)',
docs/coordination/arkiv/trin-10-plan.md:747:        raise warning 'clients_validate_fields: ukendte/inaktive keys i fields (LENIENT - INSERT/UPDATE accepteret): %',
docs/coordination/arkiv/trin-10-plan.md:756:  comment on function core_identity.clients_validate_fields() is
docs/coordination/arkiv/trin-10-plan.md:759:  create trigger clients_validate_fields
docs/coordination/arkiv/trin-10-plan.md:761:    for each row execute function core_identity.clients_validate_fields();
docs/coordination/arkiv/trin-10-plan.md:1542:  | `supabase/tests/smoke/t10_clients_validate_fields.sql`                                      | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
docs/coordination/arkiv/trin-10-plan.md:1543:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T4a (V14):** `client_node_close` på ikke-eksisterende client_id → forvent **P0002 `client_not_found`** (eksistens-check tilføjet i V14). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/arkiv/trin-10-plan.md:1565:    "core_identity.clients_validate_fields", // V8 (Codex runde 7) — T10.6 trigger-funktion; filtrerer på aktive felt-definitioner som lifecycle-signal
docs/coordination/arkiv/trin-10-plan.md:1569:- **G-nummer-kandidat:** FK-coverage-fitness-check ikke implementeret per master-plan §3 punkt 19. Registreres som teknisk gæld for senere pakke der implementerer check'en. T9-migration `20260518000004:5` har forhåndsdokumentation der ikke matcher nuværende fitness-script-tilstand.
docs/coordination/arkiv/trin-10-plan.md:1594:| `t10_clients_validate_fields.sql`   | LENIENT-default WARN; strict-mode raise                                                                               | grøn             |
docs/coordination/arkiv/trin-10-plan.md:1608:- **Forventede PLAN-AFVIGELSE-scenarier:**
docs/coordination/arkiv/trin-10-plan.md:1609:  - Hvis T1-audit_filter_values' STABLE-modifier blokerer mig fra at læse client_field_definitions (immutability-issue), kan jeg ende med at skifte til VOLATILE — PLAN-AFVIGELSE med G-nummer-forslag.
docs/coordination/arkiv/trin-10-plan.md:1610:  - Hvis et T9-test bruger client_id i et flow jeg ikke har spottet i recon → PLAN-AFVIGELSE med STOP og recon-først-gentag.
docs/coordination/arkiv/trin-10-plan.md:1611:  - Hvis pnpm fitness rammer andre exemption-entries der ikke findes i recon → markeres som PLAN-AFVIGELSE.
docs/coordination/arkiv/trin-10-plan.md:1615:  - clients_validate_fields-trigger med LENIENT-default + strict-via-session-var
docs/coordination/arkiv/trin-10-plan.md:1628:- **Hypotese 4 (V6 erstatter Codex V1 #4):** T10.4 har nu `on conflict do nothing` (V6 — Mathias-terminal fund #2). Tidligere DEFER-til-G-nummer var forkert: fitness-check `migration-on-conflict-discipline` håndhæver det, ikke optional.
docs/coordination/arkiv/trin-10-plan.md:1629:- **G-nummer-kandidat (Code-validering fund #4):** FK-coverage-fitness-check ikke implementeret per master-plan §3 punkt 19. T9-migration har forhåndsdokumentation der ikke matcher nuværende fitness-script.
docs/coordination/arkiv/trin-10-plan.md:1642:| T10.6 (clients_validate_fields trigger) | Trigger blokerer legitime writes                                    | lav (LENIENT-default)                                                                  | drop trigger + function     |
docs/coordination/arkiv/trin-10-plan.md:1706:V14-ændring ift. V13 (Code walk-through efter Codex APPROVAL):
docs/coordination/arkiv/trin-10-plan.md:1709:- T10.15 smoke-test T4a tilføjet: `client_node_close` med non-existent client_id → P0002.
docs/coordination/arkiv/trin-10-plan.md:1740:- T10.16 udvidet: `core_identity.clients_validate_fields` tilføjet til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Codex runde 7 KRITISK).
docs/coordination/arkiv/trin-10-plan.md:1757:- T10.4: tilføjet `on conflict (table_schema, table_name, column_name) do nothing` — `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES`; tidligere DEFER-til-G-nummer var forkert (Mathias #2).
docs/coordination/arkiv/trin-10-plan.md:1760:- T10.16 omformuleret: `FK_COVERAGE_EXEMPTIONS` findes ikke i nuværende fitness-script (master-plan §3.19 ikke implementeret); plan tilføjer i stedet `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Code-validering #4 + #5). G-nummer for FK-coverage-check.
docs/coordination/arkiv/trin-10-plan.md:1782:- T10.4 ON CONFLICT: DEFER → G-nummer (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness håndhæver, ON CONFLICT er nu obligatorisk i T10.4.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:37:Max 350 ord output. Brug marker-format fra niveau 1-prefix (KRITISK/MELLEM/LAV/HUL/OPTIMERING-FORSLAG/G-NUMMER-KANDIDAT etc.). Hvis du ikke har fund: skriv "APPROVAL — Runde 5".
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:55:Codex runde 13 leverede **APPROVAL** på V13. Code's parallel grundige walk-through (Mathias-instruks "vi skal vel løse de huller") fandt 1 yderligere hul som Codex missede.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:77:| 1   | KRITISK-SIKKERHEDSHUL | T10.4    | `clients.logo_filename` klassificeret som `pii_level='none'` → brugerleveret filnavn lander i klartekst i audit_log. Inkonsistent med `clients.name='direct'` (forsigtigheds-pattern). Filnavne kan realistisk indeholde klient-/personidentifikatorer. | **ACCEPT + proaktiv udvidelse.** `logo_filename` → `pii_level='direct'`. **Plus:** `logo_bytes` → `'direct'` (binær billed-data kan vise stifter/medarbejdere — samme forsigtigheds-pattern). `logo_content_type` forbliver `'none'` (kun MIME-type). T10.15's logo-test udvides med audit-hash-assertion. | T10.4 + T10.15 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:86:| 2   | G-NUMMER-KANDIDAT | T10.16 / Oprydnings-strategi | T10.16 nævner FK-coverage som G-nummer-kandidat, men oprydnings-strategi siger "Ingen G-numre forventet". Inkonsistent.                                                                                                                   | **ACCEPT.** **G058** registreret i `docs/teknisk/teknisk-gaeld.md` (FK-coverage-fitness-check ikke implementeret per master-plan §3.19). Oprydnings-strategi opdateret til at angive G057 + G058 som del af trin 10.            |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:106:Codex runde 8 fandt 1 TEKNISK-BLOKERING + 1 G-nummer-kandidat. Code's parallel walk-through fandt ingen yderligere fund.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:113:**T9-public-wrapper-bug (Code-observation):** Codex' fund afslører at T9's 7 public-wrappers (`org_node_upsert`, `org_node_deactivate`, `team_close`, `employee_place`, `employee_remove_from_node`, `client_node_place`, `client_node_close`) alle mangler `t9_write_authorized`-session-var. Trin 10's scope er kun de to client-RPC'er; de øvrige 5 er T9-arbejde der skal adresseres som G-nummer/separat pakke (T9 ville fungere i tests fordi `_apply_*`-handlers er SECURITY DEFINER og kan kaldes direkte, men authenticated-bruger via wrapper-vej er broken).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:125:| 1   | KRITISK  | T10.6                  | `clients_validate_fields()` trigger-funktion har `cfd.is_active = true` filter. Rammer fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`). T10.16 allowlister kun `client_field_definitions_list`.                                                                    | Codex runde 7     | **ACCEPT.** Udvid T10.16 med `core_identity.clients_validate_fields`. Forretningsmæssigt korrekt at filtrere på aktive felt-definitioner i validate-trigger (LENIENT: ukendte/inaktive keys → warning) — det er ikke R7d-pattern (employees-dual-column), bare lifecycle-signal. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:151:| 4   | LAV      | T10.4 + Konklusion | "alle 9 kolonner" + "(9 kolonner)" på `client_field_definitions` — SQL har 10 rækker (id, key, display_name, field_type, required, pii_level, display_order, is_active, created_at, updated_at). Plus konklusion-historik siger T10.4 ON CONFLICT er "DEFER", men V6 gjorde det obligatorisk. Codex V1-fund-tabel siger stadig "DEFER → G-nummer".                                                                                                                                                                                                                                                                               | **ACCEPT.** Tekstrettelser: 9→10 på `client_field_definitions`; opdatér V1-fund-tabel (linje 68) og Konklusion-historik (linje 1335) til at reflektere V6's ACCEPT.                                                                                                                                                                                                                                                | T10.4 + linje 68 + linje 1335 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:161:V5 fik Codex-automation APPROVAL i runde 5, men Mathias' selvstændige terminal-review afslørede 3 KRITISK-fund som automation-runden missede. Mathias bad om grundig validering før V6 — Code har genlæst hele planen op mod nuværende kode (fitness-script, T1-T9-migrations) og fundet 3 yderligere problemer som automation-runden også missede.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:166:| 2   | KRITISK             | T10.4                                           | INSERT i `core_compliance.data_field_definitions` mangler `ON CONFLICT do nothing`. `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES` (`scripts/fitness.mjs:162-172`); `migration-on-conflict-discipline` (`:675-737`) håndhæver det. V5's DEFER til G-nummer var forkert — fitness brækker.                                    | Mathias-terminal | **ACCEPT.** Tilføj `on conflict (table_schema, table_name, column_name) do nothing`. Fjern G-nummer-kandidat-tekst fra Optimerings-hypoteser (det er ikke en optimering, det er krav).                                                                                                                                                                                                                 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:168:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:216:| 4   | G-NUMMER-KANDIDAT     | T10.4   | INSERT mangler `ON CONFLICT do nothing` (T9-classify bruger det). Ikke blocker for greenfield.                                                                            | **V2-svar: DEFER → G-nummer** (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness-check `migration-on-conflict-discipline` håndhæver det på `core_compliance.data_field_definitions`. Plan har nu `ON CONFLICT (table_schema, table_name, column_name) DO NOTHING`. | T10.4          |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:233:| T1-drop af D5's public-schema                                                                          | `supabase/migrations/20260514120000_t1_drop_public.sql:32-92`                                                  | Dropper `public.clients`, `public.client_field_definitions`, `public.client_upsert`, `public.client_field_definition_upsert`, `public.clients_validate_fields`, `public.audit_filter_values`, `public.is_admin()`, `public.stork_audit()` etc. INGEN post-T1 migration genskaber clients.                                                                                                               |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:269:Hvis fund under review ikke bringer os tættere på dette: G-nummer, ikke blocker.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:287:- `clients_validate_fields`-trigger (LENIENT-default + strict via session-var)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:360:- PLAN-AFVIGELSE: <hvad>          — afviger fra approved plan
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:397:Hvis flere markers matcher samme fund: brug den marker der bedst beskriver primær problem. Sekundære nævnes i body som G-nummer-kandidater (ikke separat fund).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:411:Er fundet uafhængigt af formålet? → G-nummer-kandidat, ikke blocker
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:456:Optimerings-forslag deferred til G-nummer: O_DEFER
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:517:supabase/migrations/20260521000005_t10_clients_validate_fields.sql
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:529:/bin/bash -lc 'rg -n "client_upsert|client_set_active|client_field_definition_upsert|client_logo_|client_get|client_list|client_field_definitions_list|client_node_place|client_node_close|_apply_client_place|_apply_client_close|clients_validate_fields|audit_filter_values|is_permanent_allowed|LEGACY_IS_ACTIVE|FK_COVERAGE" supabase/migrations supabase/tests scripts docs/master-plan.md' in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:538:scripts/fitness.mjs:157:  "core_identity.clients_validate_fields",
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:541:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:1:-- Trin 10 T10.6: clients_validate_fields BEFORE INSERT/UPDATE-trigger
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:542:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:10:-- T10.16 tilføjer denne funktion til LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS-allowlist
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:543:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:14:create or replace function core_identity.clients_validate_fields()
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:544:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:41:      raise exception 'clients_validate_fields: ukendte/inaktive keys i fields: % (stork.clients_fields_strict=true)',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:545:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:44:      raise warning 'clients_validate_fields: ukendte/inaktive keys i fields (LENIENT - INSERT/UPDATE accepteret): %',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:546:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:53:comment on function core_identity.clients_validate_fields() is
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:547:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:56:create trigger clients_validate_fields
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:548:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:58:  for each row execute function core_identity.clients_validate_fields();
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:551:supabase/migrations/20260511213009_d5_clients.sql:25:-- Validation: clients_validate_fields-trigger logger WARNING ved
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:563:supabase/migrations/20260511213009_d5_clients.sql:260:-- Trigger: clients_validate_fields (LENIENT default)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:564:supabase/migrations/20260511213009_d5_clients.sql:263:CREATE OR REPLACE FUNCTION public.clients_validate_fields()
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:565:supabase/migrations/20260511213009_d5_clients.sql:293:      RAISE EXCEPTION 'clients_validate_fields: ukendte/inaktive keys i fields: % (stork.clients_fields_strict=true)',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:566:supabase/migrations/20260511213009_d5_clients.sql:297:      RAISE WARNING 'clients_validate_fields: ukendte/inaktive keys i fields (LENIENT - INSERT/UPDATE accepteret): %',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:567:supabase/migrations/20260511213009_d5_clients.sql:306:COMMENT ON FUNCTION public.clients_validate_fields() IS
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:568:supabase/migrations/20260511213009_d5_clients.sql:309:CREATE TRIGGER clients_validate_fields
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:569:supabase/migrations/20260511213009_d5_clients.sql:311:  FOR EACH ROW EXECUTE FUNCTION public.clients_validate_fields();
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:838:supabase/migrations/20260514120000_t1_drop_public.sql:61:drop function if exists public.clients_validate_fields() cascade;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:868:supabase/tests/smoke/t10_clients_validate_fields.sql:1:-- Trin 10 T10.15: clients_validate_fields smoke-test
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:869:supabase/tests/smoke/t10_clients_validate_fields.sql:35:  v_field_id := core_identity.client_field_definition_upsert(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:870:supabase/tests/smoke/t10_clients_validate_fields.sql:42:  v_client_id := core_identity.client_upsert(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:871:supabase/tests/smoke/t10_clients_validate_fields.sql:54:    perform core_identity.client_upsert(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:872:supabase/tests/smoke/t10_clients_validate_fields.sql:66:    perform core_identity.client_upsert(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:873:supabase/tests/smoke/t10_clients_validate_fields.sql:80:    perform core_identity.client_upsert(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:874:supabase/tests/smoke/t10_clients_validate_fields.sql:94:  -- skal audit-rowen stadig hashes (audit_filter_values' clients-special-case bruger
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:875:supabase/tests/smoke/t10_clients_validate_fields.sql:97:    v_client_pii_id := core_identity.client_upsert(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:876:supabase/tests/smoke/t10_clients_validate_fields.sql:107:    perform core_identity.client_upsert(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:899:supabase/tests/smoke/t10_client_active_check.sql:242:    raise exception 'T4 FAIL: client_node_close på inaktiv klient skal lykkes (ingen aktiv-check)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:900:supabase/tests/smoke/t10_client_active_check.sql:261:  -- T4a (V14): client_node_close på non-existent → P0002
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:902:supabase/tests/smoke/t10_client_active_check.sql:270:    raise exception 'T4a FAIL (V14): client_node_close på non-existent skal raise P0002';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:945:supabase/tests/smoke/t10_client_logo.sql:96:  -- ─── T4: client_logo_clear nulstiller alle tre felter ───────────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:946:supabase/tests/smoke/t10_client_logo.sql:97:  perform core_identity.client_logo_clear(v_client_id, 'T10-logo T4: fjern logo');
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:947:supabase/tests/smoke/t10_client_logo.sql:103:    raise exception 'T4 FAIL: client_logo_clear skal nulstille alle tre felter';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:964:supabase/tests/smoke/t10_client_lifecycle.sql:89:  -- ─── T4: client_set_active(true) → reaktiver ───────────────────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:965:supabase/tests/smoke/t10_client_lifecycle.sql:90:  perform core_identity.client_set_active(v_client_id, true, 'T10-lifecycle T4: reaktiver');
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:999:supabase/migrations/20260521000005_t10_clients_validate_fields.sql
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1000:supabase/tests/smoke/t10_clients_validate_fields.sql
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1349:/bin/bash -lc "sed -n '1,180p' supabase/migrations/20260521000005_t10_clients_validate_fields.sql" in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1351:-- Trin 10 T10.6: clients_validate_fields BEFORE INSERT/UPDATE-trigger
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1364:create or replace function core_identity.clients_validate_fields()
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1391:      raise exception 'clients_validate_fields: ukendte/inaktive keys i fields: % (stork.clients_fields_strict=true)',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1394:      raise warning 'clients_validate_fields: ukendte/inaktive keys i fields (LENIENT - INSERT/UPDATE accepteret): %',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1403:comment on function core_identity.clients_validate_fields() is
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1406:create trigger clients_validate_fields
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1408:  for each row execute function core_identity.clients_validate_fields();
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1521:-- V9 robusthed (Codex V8 G-nummer ADOPT): queries scope'es til org_structure-area
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1917:-- når M1-test refactores til at læse grant-modellen direkte (G-nummer-kandidat).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2075:-- audit-hashing i clients.fields binder til key; eksisterende værdier ville
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2375:  -- ─── T4: UPDATE display_order accepteres (ikke immutable) ──────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2378:    'T10-cfd T4: opdater display_name + sortering',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2520:  -- ─── T4: client_logo_clear nulstiller alle tre felter ───────────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2521:  perform core_identity.client_logo_clear(v_client_id, 'T10-logo T4: fjern logo');
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2527:    raise exception 'T4 FAIL: client_logo_clear skal nulstille alle tre felter';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2586:--   T4: superadmin → wrapper close inaktiv klient → success (ingen aktiv-check)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2587:--   T4a: superadmin → wrapper close non-existent → P0002
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2808:  -- T4: superadmin → wrapper close inaktiv klient → approve → cron-apply → close
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2813:    raise exception 'T4 FAIL: client_node_close på inaktiv klient skal lykkes (ingen aktiv-check)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2828:    raise exception 'T4 FAIL: cron-apply af close skal sætte status=applied';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2832:  -- T4a (V14): client_node_close på non-existent → P0002
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2834:  -- Sæt auth tilbage (T4 cron-apply rensede jwt → wrapper-call kræver auth)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2841:    raise exception 'T4a FAIL (V14): client_node_close på non-existent skal raise P0002';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3030:  -- ─── T4: client_set_active(true) → reaktiver ───────────────────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3031:  perform core_identity.client_set_active(v_client_id, true, 'T10-lifecycle T4: reaktiver');
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3034:    raise exception 'T4 FAIL: is_active=true forventet efter set_active(true), fik %', v_returned_is_active;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3037:  raise notice 'T10 lifecycle smoke: ALL TESTS PASSED (T1-T4)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3044:/bin/bash -lc "sed -n '1,220p' supabase/tests/smoke/t10_clients_validate_fields.sql" in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3046:-- Trin 10 T10.15: clients_validate_fields smoke-test
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3136:  -- ─── T4 (V2 KRITISK-SIKKERHEDSHUL): audit-PII-hashing efter is_active=false
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3145:      'T10-validate T4: opret med direct-PII', true, null
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3149:    perform core_identity.client_field_definition_set_active(v_field_id, false, 'T10-validate T4: deaktiver felt-def');
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3155:      'T10-validate T4: UPDATE efter felt-def deaktivering',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3169:      raise exception 'T4 FAIL: audit-row mangler eller kontakt_email ikke i fields';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3172:      raise exception 'T4 FAIL (V2 KRITISK-SIKKERHEDSHUL): kontakt_email skal hashes selv efter felt-def is_active=false. Fik: %', v_audit_value;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3176:  raise notice 'T10 validate_fields smoke: ALL TESTS PASSED (T1-T4)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3440:    raise exception 'T4 FAIL: authenticated kald skal afvises';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3543:  // Kategori-udvidelse (G-nummer-kandidat for master-plan rettelse 23-udvidelse til derived-tables).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3557:// G-nummer-kandidat: R7d-fitness-check skal eksplicit dokumentere at den er
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3568:  "core_identity.clients_validate_fields",
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3623:// INSERT'er indirekte (G-nummer for senere Mønster D-udvidelse).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3941:✓ supabase/tests/smoke/t10_clients_validate_fields.sql (4920 ms)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4449:supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:201:  -- Fallback til legacy role_page_permissions (G-nummer for senere pakke-drop).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4451:supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:219:  'T9 Step 11 V6 Valg 11: opdateret med role_permission_grants som primær + fallback til legacy role_page_permissions. Fallback fjernes når alle konsumenter er migreret (G-nummer for senere pakke).';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4804:35:| 1   | KRITISK-SIKKERHEDSHUL | T10.4    | `clients.logo_filename` klassificeret som `pii_level='none'` → brugerleveret filnavn lander i klartekst i audit_log. Inkonsistent med `clients.name='direct'` (forsigtigheds-pattern). Filnavne kan realistisk indeholde klient-/personidentifikatorer. | **ACCEPT + proaktiv udvidelse.** `logo_filename` → `pii_level='direct'`. **Plus:** `logo_bytes` → `'direct'` (binær billed-data kan vise stifter/medarbejdere — samme forsigtigheds-pattern). `logo_content_type` forbliver `'none'` (kun MIME-type). T10.15's logo-test udvides med audit-hash-assertion. | T10.4 + T10.15 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4806:44:| 2   | G-NUMMER-KANDIDAT | T10.16 / Oprydnings-strategi | T10.16 nævner FK-coverage som G-nummer-kandidat, men oprydnings-strategi siger "Ingen G-numre forventet". Inkonsistent.                                                                                                                   | **ACCEPT.** **G058** registreret i `docs/teknisk/teknisk-gaeld.md` (FK-coverage-fitness-check ikke implementeret per master-plan §3.19). Oprydnings-strategi opdateret til at angive G057 + G058 som del af trin 10.            |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4812:71:**T9-public-wrapper-bug (Code-observation):** Codex' fund afslører at T9's 7 public-wrappers (`org_node_upsert`, `org_node_deactivate`, `team_close`, `employee_place`, `employee_remove_from_node`, `client_node_place`, `client_node_close`) alle mangler `t9_write_authorized`-session-var. Trin 10's scope er kun de to client-RPC'er; de øvrige 5 er T9-arbejde der skal adresseres som G-nummer/separat pakke (T9 ville fungere i tests fordi `_apply_*`-handlers er SECURITY DEFINER og kan kaldes direkte, men authenticated-bruger via wrapper-vej er broken).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4814:83:| 1   | KRITISK  | T10.6                  | `clients_validate_fields()` trigger-funktion har `cfd.is_active = true` filter. Rammer fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`). T10.16 allowlister kun `client_field_definitions_list`.                                                                    | Codex runde 7     | **ACCEPT.** Udvid T10.16 med `core_identity.clients_validate_fields`. Forretningsmæssigt korrekt at filtrere på aktive felt-definitioner i validate-trigger (LENIENT: ukendte/inaktive keys → warning) — det er ikke R7d-pattern (employees-dual-column), bare lifecycle-signal. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4825:109:| 4   | LAV      | T10.4 + Konklusion | "alle 9 kolonner" + "(9 kolonner)" på `client_field_definitions` — SQL har 10 rækker (id, key, display_name, field_type, required, pii_level, display_order, is_active, created_at, updated_at). Plus konklusion-historik siger T10.4 ON CONFLICT er "DEFER", men V6 gjorde det obligatorisk. Codex V1-fund-tabel siger stadig "DEFER → G-nummer".                                                                                                                                                                                                                                                                               | **ACCEPT.** Tekstrettelser: 9→10 på `client_field_definitions`; opdatér V1-fund-tabel (linje 68) og Konklusion-historik (linje 1335) til at reflektere V6's ACCEPT.                                                                                                                                                                                                                                                | T10.4 + linje 68 + linje 1335 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4829:124:| 2   | KRITISK             | T10.4                                           | INSERT i `core_compliance.data_field_definitions` mangler `ON CONFLICT do nothing`. `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES` (`scripts/fitness.mjs:162-172`); `migration-on-conflict-discipline` (`:675-737`) håndhæver det. V5's DEFER til G-nummer var forkert — fitness brækker.                                    | Mathias-terminal | **ACCEPT.** Tilføj `on conflict (table_schema, table_name, column_name) do nothing`. Fjern G-nummer-kandidat-tekst fra Optimerings-hypoteser (det er ikke en optimering, det er krav).                                                                                                                                                                                                                 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4831:126:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4841:174:| 4   | G-NUMMER-KANDIDAT     | T10.4   | INSERT mangler `ON CONFLICT do nothing` (T9-classify bruger det). Ikke blocker for greenfield.                                                                            | **V2-svar: DEFER → G-nummer** (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness-check `migration-on-conflict-discipline` håndhæver det på `core_compliance.data_field_definitions`. Plan har nu `ON CONFLICT (table_schema, table_name, column_name) DO NOTHING`. | T10.4          |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4855:245:- `clients_validate_fields`-trigger (LENIENT-default + strict via session-var)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4901:591:- **Hvad:** Genskab D5's clients-special-case-mønster: walker `clients.fields` jsonb og hashes hver key der har `pii_level='direct'` i `client_field_definitions`. **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** ingen `is_active = true`-filter på direct-PII keys — ellers ville deaktivering af et felt skabe datalæk for værdier i eksisterende fields jsonb. Validation-trigger T10.6 behandler stadig inactive som ukendt-key (LENIENT warning), men audit-hashing rammer alle direct-PII definitioner. Resten af T1-logikken bevares uændret.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4920:710:### T10.6 — `clients_validate_fields`-trigger (LENIENT default)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5002:1542:  | `supabase/tests/smoke/t10_clients_validate_fields.sql`                                      | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5003:1543:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T4a (V14):** `client_node_close` på ikke-eksisterende client_id → forvent **P0002 `client_not_found`** (eksistens-check tilføjet i V14). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5010:1565:    "core_identity.clients_validate_fields", // V8 (Codex runde 7) — T10.6 trigger-funktion; filtrerer på aktive felt-definitioner som lifecycle-signal
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5019:1615:  - clients_validate_fields-trigger med LENIENT-default + strict-via-session-var
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5025:1628:- **Hypotese 4 (V6 erstatter Codex V1 #4):** T10.4 har nu `on conflict do nothing` (V6 — Mathias-terminal fund #2). Tidligere DEFER-til-G-nummer var forkert: fitness-check `migration-on-conflict-discipline` håndhæver det, ikke optional.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5031:1642:| T10.6 (clients_validate_fields trigger) | Trigger blokerer legitime writes                                    | lav (LENIENT-default)                                                                  | drop trigger + function     |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5047:1709:- T10.15 smoke-test T4a tilføjet: `client_node_close` med non-existent client_id → P0002.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5058:1740:- T10.16 udvidet: `core_identity.clients_validate_fields` tilføjet til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Codex runde 7 KRITISK).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5069:1757:- T10.4: tilføjet `on conflict (table_schema, table_name, column_name) do nothing` — `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES`; tidligere DEFER-til-G-nummer var forkert (Mathias #2).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5072:1760:- T10.16 omformuleret: `FK_COVERAGE_EXEMPTIONS` findes ikke i nuværende fitness-script (master-plan §3.19 ikke implementeret); plan tilføjer i stedet `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Code-validering #4 + #5). G-nummer for FK-coverage-check.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5082:1782:- T10.4 ON CONFLICT: DEFER → G-nummer (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness håndhæver, ON CONFLICT er nu obligatorisk i T10.4.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5143:  - **Begrundelse:** Codex-automation gav APPROVAL i runde 5, men manuel terminal-review afslørede fitness-script-håndhævelse (dedup-key + on-conflict) og has_permission-tab-resolver-detalje som automation missede. Code skal validere planen mod faktisk kode, ikke kun stole på Codex-automation.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5420:- **Hvad:** Genskab D5's clients-special-case-mønster: walker `clients.fields` jsonb og hashes hver key der har `pii_level='direct'` i `client_field_definitions`. **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** ingen `is_active = true`-filter på direct-PII keys — ellers ville deaktivering af et felt skabe datalæk for værdier i eksisterende fields jsonb. Validation-trigger T10.6 behandler stadig inactive som ukendt-key (LENIENT warning), men audit-hashing rammer alle direct-PII definitioner. Resten af T1-logikken bevares uændret.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5452:APPROVAL — Runde 5
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5455:APPROVAL — Runde 5
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:37:Max 350 ord output. Brug marker-format fra niveau 1-prefix (KRITISK/MELLEM/LAV/HUL/OPTIMERING-FORSLAG/G-NUMMER-KANDIDAT etc.). Hvis du ikke har fund: skriv "APPROVAL — Runde 4".
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:98:- PLAN-AFVIGELSE: <hvad>          — afviger fra approved plan
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:135:Hvis flere markers matcher samme fund: brug den marker der bedst beskriver primær problem. Sekundære nævnes i body som G-nummer-kandidater (ikke separat fund).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:149:Er fundet uafhængigt af formålet? → G-nummer-kandidat, ikke blocker
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:194:Optimerings-forslag deferred til G-nummer: O_DEFER
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:230:Codex runde 13 leverede **APPROVAL** på V13. Code's parallel grundige walk-through (Mathias-instruks "vi skal vel løse de huller") fandt 1 yderligere hul som Codex missede.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:252:| 1   | KRITISK-SIKKERHEDSHUL | T10.4    | `clients.logo_filename` klassificeret som `pii_level='none'` → brugerleveret filnavn lander i klartekst i audit_log. Inkonsistent med `clients.name='direct'` (forsigtigheds-pattern). Filnavne kan realistisk indeholde klient-/personidentifikatorer. | **ACCEPT + proaktiv udvidelse.** `logo_filename` → `pii_level='direct'`. **Plus:** `logo_bytes` → `'direct'` (binær billed-data kan vise stifter/medarbejdere — samme forsigtigheds-pattern). `logo_content_type` forbliver `'none'` (kun MIME-type). T10.15's logo-test udvides med audit-hash-assertion. | T10.4 + T10.15 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:261:| 2   | G-NUMMER-KANDIDAT | T10.16 / Oprydnings-strategi | T10.16 nævner FK-coverage som G-nummer-kandidat, men oprydnings-strategi siger "Ingen G-numre forventet". Inkonsistent.                                                                                                                   | **ACCEPT.** **G058** registreret i `docs/teknisk/teknisk-gaeld.md` (FK-coverage-fitness-check ikke implementeret per master-plan §3.19). Oprydnings-strategi opdateret til at angive G057 + G058 som del af trin 10.            |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:281:Codex runde 8 fandt 1 TEKNISK-BLOKERING + 1 G-nummer-kandidat. Code's parallel walk-through fandt ingen yderligere fund.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:288:**T9-public-wrapper-bug (Code-observation):** Codex' fund afslører at T9's 7 public-wrappers (`org_node_upsert`, `org_node_deactivate`, `team_close`, `employee_place`, `employee_remove_from_node`, `client_node_place`, `client_node_close`) alle mangler `t9_write_authorized`-session-var. Trin 10's scope er kun de to client-RPC'er; de øvrige 5 er T9-arbejde der skal adresseres som G-nummer/separat pakke (T9 ville fungere i tests fordi `_apply_*`-handlers er SECURITY DEFINER og kan kaldes direkte, men authenticated-bruger via wrapper-vej er broken).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:300:| 1   | KRITISK  | T10.6                  | `clients_validate_fields()` trigger-funktion har `cfd.is_active = true` filter. Rammer fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`). T10.16 allowlister kun `client_field_definitions_list`.                                                                    | Codex runde 7     | **ACCEPT.** Udvid T10.16 med `core_identity.clients_validate_fields`. Forretningsmæssigt korrekt at filtrere på aktive felt-definitioner i validate-trigger (LENIENT: ukendte/inaktive keys → warning) — det er ikke R7d-pattern (employees-dual-column), bare lifecycle-signal. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:326:| 4   | LAV      | T10.4 + Konklusion | "alle 9 kolonner" + "(9 kolonner)" på `client_field_definitions` — SQL har 10 rækker (id, key, display_name, field_type, required, pii_level, display_order, is_active, created_at, updated_at). Plus konklusion-historik siger T10.4 ON CONFLICT er "DEFER", men V6 gjorde det obligatorisk. Codex V1-fund-tabel siger stadig "DEFER → G-nummer".                                                                                                                                                                                                                                                                               | **ACCEPT.** Tekstrettelser: 9→10 på `client_field_definitions`; opdatér V1-fund-tabel (linje 68) og Konklusion-historik (linje 1335) til at reflektere V6's ACCEPT.                                                                                                                                                                                                                                                | T10.4 + linje 68 + linje 1335 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:336:V5 fik Codex-automation APPROVAL i runde 5, men Mathias' selvstændige terminal-review afslørede 3 KRITISK-fund som automation-runden missede. Mathias bad om grundig validering før V6 — Code har genlæst hele planen op mod nuværende kode (fitness-script, T1-T9-migrations) og fundet 3 yderligere problemer som automation-runden også missede.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:341:| 2   | KRITISK             | T10.4                                           | INSERT i `core_compliance.data_field_definitions` mangler `ON CONFLICT do nothing`. `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES` (`scripts/fitness.mjs:162-172`); `migration-on-conflict-discipline` (`:675-737`) håndhæver det. V5's DEFER til G-nummer var forkert — fitness brækker.                                    | Mathias-terminal | **ACCEPT.** Tilføj `on conflict (table_schema, table_name, column_name) do nothing`. Fjern G-nummer-kandidat-tekst fra Optimerings-hypoteser (det er ikke en optimering, det er krav).                                                                                                                                                                                                                 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:343:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:391:| 4   | G-NUMMER-KANDIDAT     | T10.4   | INSERT mangler `ON CONFLICT do nothing` (T9-classify bruger det). Ikke blocker for greenfield.                                                                            | **V2-svar: DEFER → G-nummer** (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness-check `migration-on-conflict-discipline` håndhæver det på `core_compliance.data_field_definitions`. Plan har nu `ON CONFLICT (table_schema, table_name, column_name) DO NOTHING`. | T10.4          |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:408:| T1-drop af D5's public-schema                                                                          | `supabase/migrations/20260514120000_t1_drop_public.sql:32-92`                                                  | Dropper `public.clients`, `public.client_field_definitions`, `public.client_upsert`, `public.client_field_definition_upsert`, `public.clients_validate_fields`, `public.audit_filter_values`, `public.is_admin()`, `public.stork_audit()` etc. INGEN post-T1 migration genskaber clients.                                                                                                               |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:444:Hvis fund under review ikke bringer os tættere på dette: G-nummer, ikke blocker.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:462:- `clients_validate_fields`-trigger (LENIENT-default + strict via session-var)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:495:35:| 1   | KRITISK-SIKKERHEDSHUL | T10.4    | `clients.logo_filename` klassificeret som `pii_level='none'` → brugerleveret filnavn lander i klartekst i audit_log. Inkonsistent med `clients.name='direct'` (forsigtigheds-pattern). Filnavne kan realistisk indeholde klient-/personidentifikatorer. | **ACCEPT + proaktiv udvidelse.** `logo_filename` → `pii_level='direct'`. **Plus:** `logo_bytes` → `'direct'` (binær billed-data kan vise stifter/medarbejdere — samme forsigtigheds-pattern). `logo_content_type` forbliver `'none'` (kun MIME-type). T10.15's logo-test udvides med audit-hash-assertion. | T10.4 + T10.15 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:498:44:| 2   | G-NUMMER-KANDIDAT | T10.16 / Oprydnings-strategi | T10.16 nævner FK-coverage som G-nummer-kandidat, men oprydnings-strategi siger "Ingen G-numre forventet". Inkonsistent.                                                                                                                   | **ACCEPT.** **G058** registreret i `docs/teknisk/teknisk-gaeld.md` (FK-coverage-fitness-check ikke implementeret per master-plan §3.19). Oprydnings-strategi opdateret til at angive G057 + G058 som del af trin 10.            |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:506:71:**T9-public-wrapper-bug (Code-observation):** Codex' fund afslører at T9's 7 public-wrappers (`org_node_upsert`, `org_node_deactivate`, `team_close`, `employee_place`, `employee_remove_from_node`, `client_node_place`, `client_node_close`) alle mangler `t9_write_authorized`-session-var. Trin 10's scope er kun de to client-RPC'er; de øvrige 5 er T9-arbejde der skal adresseres som G-nummer/separat pakke (T9 ville fungere i tests fordi `_apply_*`-handlers er SECURITY DEFINER og kan kaldes direkte, men authenticated-bruger via wrapper-vej er broken).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:509:83:| 1   | KRITISK  | T10.6                  | `clients_validate_fields()` trigger-funktion har `cfd.is_active = true` filter. Rammer fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`). T10.16 allowlister kun `client_field_definitions_list`.                                                                    | Codex runde 7     | **ACCEPT.** Udvid T10.16 med `core_identity.clients_validate_fields`. Forretningsmæssigt korrekt at filtrere på aktive felt-definitioner i validate-trigger (LENIENT: ukendte/inaktive keys → warning) — det er ikke R7d-pattern (employees-dual-column), bare lifecycle-signal. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:522:109:| 4   | LAV      | T10.4 + Konklusion | "alle 9 kolonner" + "(9 kolonner)" på `client_field_definitions` — SQL har 10 rækker (id, key, display_name, field_type, required, pii_level, display_order, is_active, created_at, updated_at). Plus konklusion-historik siger T10.4 ON CONFLICT er "DEFER", men V6 gjorde det obligatorisk. Codex V1-fund-tabel siger stadig "DEFER → G-nummer".                                                                                                                                                                                                                                                                               | **ACCEPT.** Tekstrettelser: 9→10 på `client_field_definitions`; opdatér V1-fund-tabel (linje 68) og Konklusion-historik (linje 1335) til at reflektere V6's ACCEPT.                                                                                                                                                                                                                                                | T10.4 + linje 68 + linje 1335 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:527:124:| 2   | KRITISK             | T10.4                                           | INSERT i `core_compliance.data_field_definitions` mangler `ON CONFLICT do nothing`. `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES` (`scripts/fitness.mjs:162-172`); `migration-on-conflict-discipline` (`:675-737`) håndhæver det. V5's DEFER til G-nummer var forkert — fitness brækker.                                    | Mathias-terminal | **ACCEPT.** Tilføj `on conflict (table_schema, table_name, column_name) do nothing`. Fjern G-nummer-kandidat-tekst fra Optimerings-hypoteser (det er ikke en optimering, det er krav).                                                                                                                                                                                                                 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:529:126:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:543:174:| 4   | G-NUMMER-KANDIDAT     | T10.4   | INSERT mangler `ON CONFLICT do nothing` (T9-classify bruger det). Ikke blocker for greenfield.                                                                            | **V2-svar: DEFER → G-nummer** (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness-check `migration-on-conflict-discipline` håndhæver det på `core_compliance.data_field_definitions`. Plan har nu `ON CONFLICT (table_schema, table_name, column_name) DO NOTHING`. | T10.4          |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:564:245:- `clients_validate_fields`-trigger (LENIENT-default + strict via session-var)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:613:591:- **Hvad:** Genskab D5's clients-special-case-mønster: walker `clients.fields` jsonb og hashes hver key der har `pii_level='direct'` i `client_field_definitions`. **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** ingen `is_active = true`-filter på direct-PII keys — ellers ville deaktivering af et felt skabe datalæk for værdier i eksisterende fields jsonb. Validation-trigger T10.6 behandler stadig inactive som ukendt-key (LENIENT warning), men audit-hashing rammer alle direct-PII definitioner. Resten af T1-logikken bevares uændret.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:616:710:### T10.6 — `clients_validate_fields`-trigger (LENIENT default)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:692:1543:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T4a (V14):** `client_node_close` på ikke-eksisterende client_id → forvent **P0002 `client_not_found`** (eksistens-check tilføjet i V14). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:700:1565:    "core_identity.clients_validate_fields", // V8 (Codex runde 7) — T10.6 trigger-funktion; filtrerer på aktive felt-definitioner som lifecycle-signal
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:712:1615:  - clients_validate_fields-trigger med LENIENT-default + strict-via-session-var
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:718:1628:- **Hypotese 4 (V6 erstatter Codex V1 #4):** T10.4 har nu `on conflict do nothing` (V6 — Mathias-terminal fund #2). Tidligere DEFER-til-G-nummer var forkert: fitness-check `migration-on-conflict-discipline` håndhæver det, ikke optional.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:725:1642:| T10.6 (clients_validate_fields trigger) | Trigger blokerer legitime writes                                    | lav (LENIENT-default)                                                                  | drop trigger + function     |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:743:1709:- T10.15 smoke-test T4a tilføjet: `client_node_close` med non-existent client_id → P0002.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:754:1740:- T10.16 udvidet: `core_identity.clients_validate_fields` tilføjet til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Codex runde 7 KRITISK).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:765:1757:- T10.4: tilføjet `on conflict (table_schema, table_name, column_name) do nothing` — `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES`; tidligere DEFER-til-G-nummer var forkert (Mathias #2).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:768:1760:- T10.16 omformuleret: `FK_COVERAGE_EXEMPTIONS` findes ikke i nuværende fitness-script (master-plan §3.19 ikke implementeret); plan tilføjer i stedet `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Code-validering #4 + #5). G-nummer for FK-coverage-check.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:778:1782:- T10.4 ON CONFLICT: DEFER → G-nummer (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness håndhæver, ON CONFLICT er nu obligatorisk i T10.4.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:796:/bin/bash -lc "rg -n \"T10|client_upsert|client_set_active|client_field_definition|client_logo|client_node_place|client_node_close|_apply_client_place|_apply_client_close|allow_clients_write|allow_client_field|t9_write_authorized|pending_change_request|pending_change_apply|clients_validate_fields|audit_filter_values|is_admin_by_employee_id|undo_period_seconds\" supabase docs scripts -g '"'!node_modules'"'" in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:836:docs/strategi/bygge-status.md:311:- `core_identity.clients_validate_fields` BEFORE INSERT/UPDATE-trigger (LENIENT default + strict via session-var).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:843:docs/strategi/bygge-status.md:319:- Fitness-script R7d-allowlist udvidet (client_field_definitions_list + clients_validate_fields).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:845:docs/strategi/bygge-status.md:328:- `20260521000005_t10_clients_validate_fields.sql`
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:851:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:1:-- Trin 10 T10.6: clients_validate_fields BEFORE INSERT/UPDATE-trigger
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:852:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:10:-- T10.16 tilføjer denne funktion til LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS-allowlist
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:853:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:11:-- (Codex runde 7 KRITISK): client_field_definitions har kun is_active, ingen
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:854:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:14:create or replace function core_identity.clients_validate_fields()
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:855:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:35:      select 1 from core_identity.client_field_definitions cfd
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:856:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:41:      raise exception 'clients_validate_fields: ukendte/inaktive keys i fields: % (stork.clients_fields_strict=true)',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:857:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:44:      raise warning 'clients_validate_fields: ukendte/inaktive keys i fields (LENIENT - INSERT/UPDATE accepteret): %',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:858:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:53:comment on function core_identity.clients_validate_fields() is
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:859:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:54:  'T10.6: BEFORE INSERT/UPDATE-trigger på core_identity.clients. LENIENT-default WARNING ved ukendte/inaktive keys i fields. Strict via stork.clients_fields_strict=true. Filtrerer på cfd.is_active=true som lifecycle-signal (R7d-allowlist i T10.16).';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:860:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:56:create trigger clients_validate_fields
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:861:supabase/migrations/20260521000005_t10_clients_validate_fields.sql:58:  for each row execute function core_identity.clients_validate_fields();
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:874:supabase/tests/smoke/t10_client_field_definitions.sql:85:    'T10-cfd T4: opdater display_name + sortering',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:898:scripts/fitness.mjs:157:  "core_identity.clients_validate_fields",
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:926:supabase/tests/smoke/t10_client_logo.sql:96:  -- ─── T4: client_logo_clear nulstiller alle tre felter ───────────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:927:supabase/tests/smoke/t10_client_logo.sql:97:  perform core_identity.client_logo_clear(v_client_id, 'T10-logo T4: fjern logo');
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:928:supabase/tests/smoke/t10_client_logo.sql:103:    raise exception 'T4 FAIL: client_logo_clear skal nulstille alle tre felter';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:982:supabase/tests/smoke/t10_client_lifecycle.sql:89:  -- ─── T4: client_set_active(true) → reaktiver ───────────────────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:983:supabase/tests/smoke/t10_client_lifecycle.sql:90:  perform core_identity.client_set_active(v_client_id, true, 'T10-lifecycle T4: reaktiver');
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:984:supabase/tests/smoke/t10_client_lifecycle.sql:96:  raise notice 'T10 lifecycle smoke: ALL TESTS PASSED (T1-T4)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1057:supabase/tests/smoke/t10_client_active_check.sql:226:    raise exception 'T4 FAIL: client_node_close på inaktiv klient skal lykkes (ingen aktiv-check)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1058:supabase/tests/smoke/t10_client_active_check.sql:230:  -- T4a (V14): client_node_close på non-existent → P0002
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1060:supabase/tests/smoke/t10_client_active_check.sql:237:    raise exception 'T4a FAIL (V14): client_node_close på non-existent skal raise P0002';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1080:supabase/tests/smoke/t9_pending_changes.sql:8:-- T4: pending_change_apply afviser not_yet_due hvis effective_from > current_date (V6 central gate).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1088:supabase/tests/smoke/t9_pending_changes.sql:102:  -- ─── T4: pending_change_apply afviser not_yet_due (effective_from > current_date) ─
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1102:supabase/tests/smoke/t10_clients_validate_fields.sql:1:-- Trin 10 T10.15: clients_validate_fields smoke-test
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1103:supabase/tests/smoke/t10_clients_validate_fields.sql:20:  perform set_config('stork.change_reason', 'T10 validate_fields smoke', true);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1104:supabase/tests/smoke/t10_clients_validate_fields.sql:35:  v_field_id := core_identity.client_field_definition_upsert(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1105:supabase/tests/smoke/t10_clients_validate_fields.sql:37:    'T10-validate setup', false, 0, true, null
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1106:supabase/tests/smoke/t10_clients_validate_fields.sql:42:  v_client_id := core_identity.client_upsert(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1107:supabase/tests/smoke/t10_clients_validate_fields.sql:45:    'T10-validate T1: LENIENT', true, null
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1108:supabase/tests/smoke/t10_clients_validate_fields.sql:54:    perform core_identity.client_upsert(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1109:supabase/tests/smoke/t10_clients_validate_fields.sql:57:      'T10-validate T2: non-object', true, null
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1110:supabase/tests/smoke/t10_clients_validate_fields.sql:66:    perform core_identity.client_upsert(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1111:supabase/tests/smoke/t10_clients_validate_fields.sql:69:      'T10-validate T2b: array', true, null
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1112:supabase/tests/smoke/t10_clients_validate_fields.sql:80:    perform core_identity.client_upsert(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1113:supabase/tests/smoke/t10_clients_validate_fields.sql:83:      'T10-validate T3: strict', true, null
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1114:supabase/tests/smoke/t10_clients_validate_fields.sql:94:  -- skal audit-rowen stadig hashes (audit_filter_values' clients-special-case bruger
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1115:supabase/tests/smoke/t10_clients_validate_fields.sql:97:    v_client_pii_id := core_identity.client_upsert(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1116:supabase/tests/smoke/t10_clients_validate_fields.sql:100:      'T10-validate T4: opret med direct-PII', true, null
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1117:supabase/tests/smoke/t10_clients_validate_fields.sql:104:    perform core_identity.client_field_definition_set_active(v_field_id, false, 'T10-validate T4: deaktiver felt-def');
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1118:supabase/tests/smoke/t10_clients_validate_fields.sql:107:    perform core_identity.client_upsert(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1119:supabase/tests/smoke/t10_clients_validate_fields.sql:110:      'T10-validate T4: UPDATE efter felt-def deaktivering',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1120:supabase/tests/smoke/t10_clients_validate_fields.sql:131:  raise notice 'T10 validate_fields smoke: ALL TESTS PASSED (T1-T4)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1279:supabase/migrations/20260514120000_t1_drop_public.sql:61:drop function if exists public.clients_validate_fields() cascade;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1309:supabase/migrations/20260511213009_d5_clients.sql:25:-- Validation: clients_validate_fields-trigger logger WARNING ved
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1349:supabase/migrations/20260511213009_d5_clients.sql:260:-- Trigger: clients_validate_fields (LENIENT default)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1350:supabase/migrations/20260511213009_d5_clients.sql:263:CREATE OR REPLACE FUNCTION public.clients_validate_fields()
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1352:supabase/migrations/20260511213009_d5_clients.sql:293:      RAISE EXCEPTION 'clients_validate_fields: ukendte/inaktive keys i fields: % (stork.clients_fields_strict=true)',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1353:supabase/migrations/20260511213009_d5_clients.sql:297:      RAISE WARNING 'clients_validate_fields: ukendte/inaktive keys i fields (LENIENT - INSERT/UPDATE accepteret): %',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1354:supabase/migrations/20260511213009_d5_clients.sql:306:COMMENT ON FUNCTION public.clients_validate_fields() IS
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1355:supabase/migrations/20260511213009_d5_clients.sql:309:CREATE TRIGGER clients_validate_fields
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1356:supabase/migrations/20260511213009_d5_clients.sql:311:  FOR EACH ROW EXECUTE FUNCTION public.clients_validate_fields();
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1402:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:62:| 4   | LAV      | T10.4 + Konklusion | "alle 9 kolonner" + "(9 kolonner)" på `client_field_definitions` — SQL har 10 rækker (id, key, display_name, field_type, required, pii_level, display_order, is_active, created_at, updated_at). Plus konklusion-historik siger T10.4 ON CONFLICT er "DEFER", men V6 gjorde det obligatorisk. Codex V1-fund-tabel siger stadig "DEFER → G-nummer".                                                                                                                                                                                                                                                                               | **ACCEPT.** Tekstrettelser: 9→10 på `client_field_definitions`; opdatér V1-fund-tabel (linje 68) og Konklusion-historik (linje 1335) til at reflektere V6's ACCEPT.                                                                                                                                                                                                                                                | T10.4 + linje 68 + linje 1335 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1405:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:77:| 2   | KRITISK             | T10.4                                           | INSERT i `core_compliance.data_field_definitions` mangler `ON CONFLICT do nothing`. `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES` (`scripts/fitness.mjs:162-172`); `migration-on-conflict-discipline` (`:675-737`) håndhæver det. V5's DEFER til G-nummer var forkert — fitness brækker.                                    | Mathias-terminal | **ACCEPT.** Tilføj `on conflict (table_schema, table_name, column_name) do nothing`. Fjern G-nummer-kandidat-tekst fra Optimerings-hypoteser (det er ikke en optimering, det er krav).                                                                                                                                                                                                                 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1407:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:79:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1417:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:127:| 4   | G-NUMMER-KANDIDAT     | T10.4   | INSERT mangler `ON CONFLICT do nothing` (T9-classify bruger det). Ikke blocker for greenfield.                                                                            | **V2-svar: DEFER → G-nummer** (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness-check `migration-on-conflict-discipline` håndhæver det på `core_compliance.data_field_definitions`. Plan har nu `ON CONFLICT (table_schema, table_name, column_name) DO NOTHING`. | T10.4          |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1418:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:144:| T1-drop af D5's public-schema                                                                          | `supabase/migrations/20260514120000_t1_drop_public.sql:32-92`                                                  | Dropper `public.clients`, `public.client_field_definitions`, `public.client_upsert`, `public.client_field_definition_upsert`, `public.clients_validate_fields`, `public.audit_filter_values`, `public.is_admin()`, `public.stork_audit()` etc. INGEN post-T1 migration genskaber clients.                                                                                                               |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1434:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:198:- `clients_validate_fields`-trigger (LENIENT-default + strict via session-var)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1500:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:726:- **Hvad:** Genskab D5's clients-special-case-mønster: walker `clients.fields` jsonb og hashes hver key der har `pii_level='direct'` i `client_field_definitions`. **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** ingen `is_active = true`-filter på direct-PII keys — ellers ville deaktivering af et felt skabe datalæk for værdier i eksisterende fields jsonb. Validation-trigger T10.6 behandler stadig inactive som ukendt-key (LENIENT warning), men audit-hashing rammer alle direct-PII definitioner. Resten af T1-logikken bevares uændret.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1513:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:850:### T10.6 — `clients_validate_fields`-trigger (LENIENT default)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1514:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:857:  create or replace function core_identity.clients_validate_fields()
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1516:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:884:        raise exception 'clients_validate_fields: ukendte/inaktive keys i fields: % (stork.clients_fields_strict=true)',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1517:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:887:        raise warning 'clients_validate_fields: ukendte/inaktive keys i fields (LENIENT - INSERT/UPDATE accepteret): %',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1518:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:896:  comment on function core_identity.clients_validate_fields() is
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1519:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:899:  create trigger clients_validate_fields
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1520:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:901:    for each row execute function core_identity.clients_validate_fields();
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1597:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:1298:37:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1623:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:1331:621:### T10.6 — `clients_validate_fields`-trigger (LENIENT default)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1674:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:1398:1318:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7)  | T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie Mathias #1): opret pending mens klient aktiv → deaktiver klient → approve+apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success (bypass på aktiv-check, ikke på eksistens-check). Test SKAL være `begin;` + `rollback;`-wrapped (`client_node_placements` på TX_WRAP_REQUIRED). |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1689:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:1418:1493:- T10.16 omformuleret: `FK_COVERAGE_EXEMPTIONS` findes ikke i nuværende fitness-script (master-plan §3.19 ikke implementeret); plan tilføjer i stedet `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Code-validering #4 + #5). G-nummer for FK-coverage-check.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1770:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:2041:  | `supabase/tests/smoke/t10_clients_validate_fields.sql`   | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.                                                                                                                                                                                                                                                                                               |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1771:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:2042:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7)  | T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie Mathias #1): opret pending mens klient aktiv → deaktiver klient → approve+apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success (bypass på aktiv-check, ikke på eksistens-check). Test SKAL være `begin;` + `rollback;`-wrapped (`client_node_placements` på TX_WRAP_REQUIRED). |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1787:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:2092:| `t10_clients_validate_fields.sql`   | LENIENT-default WARN; strict-mode raise                                                                               | grøn             |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1789:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:2107:  - Hvis T1-audit_filter_values' STABLE-modifier blokerer mig fra at læse client_field_definitions (immutability-issue), kan jeg ende med at skifte til VOLATILE — PLAN-AFVIGELSE med G-nummer-forslag.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1790:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:2113:  - clients_validate_fields-trigger med LENIENT-default + strict-via-session-var
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1794:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:2126:- **Hypotese 4 (V6 erstatter Codex V1 #4):** T10.4 har nu `on conflict do nothing` (V6 — Mathias-terminal fund #2). Tidligere DEFER-til-G-nummer var forkert: fitness-check `migration-on-conflict-discipline` håndhæver det, ikke optional.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1800:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:2140:| T10.6 (clients_validate_fields trigger) | Trigger blokerer legitime writes                                    | lav (LENIENT-default)                                                                  | drop trigger + function     |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1818:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:2214:- T10.4: tilføjet `on conflict (table_schema, table_name, column_name) do nothing` — `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES`; tidligere DEFER-til-G-nummer var forkert (Mathias #2).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1821:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:2217:- T10.16 omformuleret: `FK_COVERAGE_EXEMPTIONS` findes ikke i nuværende fitness-script (master-plan §3.19 ikke implementeret); plan tilføjer i stedet `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Code-validering #4 + #5). G-nummer for FK-coverage-check.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:1831:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:2239:- T10.4 ON CONFLICT: DEFER → G-nummer (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness håndhæver, ON CONFLICT er nu obligatorisk i T10.4.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2157:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:6519:KRITISK — TEKNISK-BLOKERING: T10.6 `core_identity.clients_validate_fields()` introducerer en ny function-body reader med `cfd.is_active = true`, men T10.16 allowlister kun `core_identity.client_field_definitions_list`.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2158:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:6521:`legacy-is-active-readers` i `scripts/fitness.mjs` scanner live functions for `where/and ... is_active = true` uden `status = 'active'` og filtrerer kun `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS`. `clients_validate_fields()` matcher regexen og vil ikke være allowlistet. Resultat: fitness/CI blokerer efter migration.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2160:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:6525:`core_identity.clients_validate_fields`
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2162:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:6532:KRITISK — TEKNISK-BLOKERING: T10.6 `core_identity.clients_validate_fields()` introducerer en ny function-body reader med `cfd.is_active = true`, men T10.16 allowlister kun `core_identity.client_field_definitions_list`.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2163:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:6534:`legacy-is-active-readers` i `scripts/fitness.mjs` scanner live functions for `where/and ... is_active = true` uden `status = 'active'` og filtrerer kun `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS`. `clients_validate_fields()` matcher regexen og vil ikke være allowlistet. Resultat: fitness/CI blokerer efter migration.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2165:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md:6538:`core_identity.clients_validate_fields`
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2248:docs/coordination/arkiv/trin-10-approved-codex.md:44:- **T10.6:** clients_validate_fields-trigger (LENIENT default + strict via session-var)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2261:docs/coordination/arkiv/trin-10-approved-codex.md:57:- **T10.16:** Fitness-script R7d-allowlist for client_field_definitions_list + clients_validate_fields
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2266:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:237:| 4   | G-NUMMER-KANDIDAT     | T10.4   | INSERT mangler `ON CONFLICT do nothing` (T9-classify bruger det). Ikke blocker for greenfield.                                                                            | **DEFER → G-nummer.** Greenfield-migration kører én gang; idempotens ikke nødvendig nu. Registreres som G-nummer for senere ensretning.                                                               | Optimerings-hypoteser |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2267:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:254:| T1-drop af D5's public-schema                                                                          | `supabase/migrations/20260514120000_t1_drop_public.sql:32-92`                                                  | Dropper `public.clients`, `public.client_field_definitions`, `public.client_upsert`, `public.client_field_definition_upsert`, `public.clients_validate_fields`, `public.audit_filter_values`, `public.is_admin()`, `public.stork_audit()` etc. INGEN post-T1 migration genskaber clients.                                                                                                               |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2284:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:307:- `clients_validate_fields`-trigger (LENIENT-default + strict via session-var)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2311:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:494:### T10.6 — `clients_validate_fields`-trigger (LENIENT default)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2312:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:501:  create or replace function core_identity.clients_validate_fields()
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2314:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:528:        raise exception 'clients_validate_fields: ukendte/inaktive keys i fields: % (stork.clients_fields_strict=true)',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2315:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:531:        raise warning 'clients_validate_fields: ukendte/inaktive keys i fields (LENIENT - INSERT/UPDATE accepteret): %',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2316:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:540:  comment on function core_identity.clients_validate_fields() is
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2317:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:543:  create trigger clients_validate_fields
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2318:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:545:    for each row execute function core_identity.clients_validate_fields();
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2446:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:1080:- **Hvad:** Genskab D5's clients-special-case-mønster: walker `clients.fields` jsonb og hashes hver key der har `pii_level='direct'` i `client_field_definitions`. **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** ingen `is_active = true`-filter på direct-PII keys — ellers ville deaktivering af et felt skabe datalæk for værdier i eksisterende fields jsonb. Validation-trigger T10.6 behandler stadig inactive som ukendt-key (LENIENT warning), men audit-hashing rammer alle direct-PII definitioner. Resten af T1-logikken bevares uændret.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2476:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:1328:  | `supabase/tests/smoke/t10_clients_validate_fields.sql`   | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2488:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:1362:| `t10_clients_validate_fields.sql`   | LENIENT-default WARN; strict-mode raise                                                                    | grøn             |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2490:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:1376:  - Hvis T1-audit_filter_values' STABLE-modifier blokerer mig fra at læse client_field_definitions (immutability-issue), kan jeg ende med at skifte til VOLATILE — PLAN-AFVIGELSE med G-nummer-forslag.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2491:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:1382:  - clients_validate_fields-trigger med LENIENT-default + strict-via-session-var
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2495:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:1395:- **Hypotese 4 (G-nummer-kandidat fra Codex V1 #4):** T10.4 klassifikations-INSERT mangler `ON CONFLICT do nothing` (T9-classify bruger det). Greenfield-migration kører kun én gang så idempotens er ikke nødvendig nu — men ensretning med T9-mønstret er værd at lave senere. **G-nummer for ensretning af classify-migration-pattern på tværs af alle pakker.**
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2501:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:1408:| T10.6 (clients_validate_fields trigger) | Trigger blokerer legitime writes                                    | lav (LENIENT-default)                                                                  | drop trigger + function     |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2517:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:1477:- T10.4 ON CONFLICT: DEFER → G-nummer (greenfield-engangsmigration)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2657:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:4087:-- Trigger: clients_validate_fields (LENIENT default)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2658:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:4090:CREATE OR REPLACE FUNCTION public.clients_validate_fields()
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2659:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:4115:KRITISK-SIKKERHEDSHUL: T10.10/T10.5 gør audit-hashing afhængig af mutable `client_field_definitions.key/pii_level`.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2663:docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md:4124:KRITISK-SIKKERHEDSHUL: T10.10/T10.5 gør audit-hashing afhængig af mutable `client_field_definitions.key/pii_level`.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2714:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:240:| 1   | KRITISK-SIKKERHEDSHUL | T10.4    | `clients.logo_filename` klassificeret som `pii_level='none'` → brugerleveret filnavn lander i klartekst i audit_log. Inkonsistent med `clients.name='direct'` (forsigtigheds-pattern). Filnavne kan realistisk indeholde klient-/personidentifikatorer. | **ACCEPT + proaktiv udvidelse.** `logo_filename` → `pii_level='direct'`. **Plus:** `logo_bytes` → `'direct'` (binær billed-data kan vise stifter/medarbejdere — samme forsigtigheds-pattern). `logo_content_type` forbliver `'none'` (kun MIME-type). T10.15's logo-test udvides med audit-hash-assertion. | T10.4 + T10.15 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2716:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:249:| 2   | G-NUMMER-KANDIDAT | T10.16 / Oprydnings-strategi | T10.16 nævner FK-coverage som G-nummer-kandidat, men oprydnings-strategi siger "Ingen G-numre forventet". Inkonsistent.                                                                                                                   | **ACCEPT.** **G058** registreret i `docs/teknisk/teknisk-gaeld.md` (FK-coverage-fitness-check ikke implementeret per master-plan §3.19). Oprydnings-strategi opdateret til at angive G057 + G058 som del af trin 10.            |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2721:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:276:**T9-public-wrapper-bug (Code-observation):** Codex' fund afslører at T9's 7 public-wrappers (`org_node_upsert`, `org_node_deactivate`, `team_close`, `employee_place`, `employee_remove_from_node`, `client_node_place`, `client_node_close`) alle mangler `t9_write_authorized`-session-var. Trin 10's scope er kun de to client-RPC'er; de øvrige 5 er T9-arbejde der skal adresseres som G-nummer/separat pakke (T9 ville fungere i tests fordi `_apply_*`-handlers er SECURITY DEFINER og kan kaldes direkte, men authenticated-bruger via wrapper-vej er broken).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2722:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:288:| 1   | KRITISK  | T10.6                  | `clients_validate_fields()` trigger-funktion har `cfd.is_active = true` filter. Rammer fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`). T10.16 allowlister kun `client_field_definitions_list`.                                                                    | Codex runde 7     | **ACCEPT.** Udvid T10.16 med `core_identity.clients_validate_fields`. Forretningsmæssigt korrekt at filtrere på aktive felt-definitioner i validate-trigger (LENIENT: ukendte/inaktive keys → warning) — det er ikke R7d-pattern (employees-dual-column), bare lifecycle-signal. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2735:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:314:| 4   | LAV      | T10.4 + Konklusion | "alle 9 kolonner" + "(9 kolonner)" på `client_field_definitions` — SQL har 10 rækker (id, key, display_name, field_type, required, pii_level, display_order, is_active, created_at, updated_at). Plus konklusion-historik siger T10.4 ON CONFLICT er "DEFER", men V6 gjorde det obligatorisk. Codex V1-fund-tabel siger stadig "DEFER → G-nummer".                                                                                                                                                                                                                                                                               | **ACCEPT.** Tekstrettelser: 9→10 på `client_field_definitions`; opdatér V1-fund-tabel (linje 68) og Konklusion-historik (linje 1335) til at reflektere V6's ACCEPT.                                                                                                                                                                                                                                                | T10.4 + linje 68 + linje 1335 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2738:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:329:| 2   | KRITISK             | T10.4                                           | INSERT i `core_compliance.data_field_definitions` mangler `ON CONFLICT do nothing`. `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES` (`scripts/fitness.mjs:162-172`); `migration-on-conflict-discipline` (`:675-737`) håndhæver det. V5's DEFER til G-nummer var forkert — fitness brækker.                                    | Mathias-terminal | **ACCEPT.** Tilføj `on conflict (table_schema, table_name, column_name) do nothing`. Fjern G-nummer-kandidat-tekst fra Optimerings-hypoteser (det er ikke en optimering, det er krav).                                                                                                                                                                                                                 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2740:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:331:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2750:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:379:| 4   | G-NUMMER-KANDIDAT     | T10.4   | INSERT mangler `ON CONFLICT do nothing` (T9-classify bruger det). Ikke blocker for greenfield.                                                                            | **V2-svar: DEFER → G-nummer** (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness-check `migration-on-conflict-discipline` håndhæver det på `core_compliance.data_field_definitions`. Plan har nu `ON CONFLICT (table_schema, table_name, column_name) DO NOTHING`. | T10.4          |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2751:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:396:| T1-drop af D5's public-schema                                                                          | `supabase/migrations/20260514120000_t1_drop_public.sql:32-92`                                                  | Dropper `public.clients`, `public.client_field_definitions`, `public.client_upsert`, `public.client_field_definition_upsert`, `public.clients_validate_fields`, `public.audit_filter_values`, `public.is_admin()`, `public.stork_audit()` etc. INGEN post-T1 migration genskaber clients.                                                                                                               |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2767:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:450:- `clients_validate_fields`-trigger (LENIENT-default + strict via session-var)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2834:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:833:   579	- **Hvad:** Genskab D5's clients-special-case-mønster: walker `clients.fields` jsonb og hashes hver key der har `pii_level='direct'` i `client_field_definitions`. **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** ingen `is_active = true`-filter på direct-PII keys — ellers ville deaktivering af et felt skabe datalæk for værdier i eksisterende fields jsonb. Validation-trigger T10.6 behandler stadig inactive som ukendt-key (LENIENT warning), men audit-hashing rammer alle direct-PII definitioner. Resten af T1-logikken bevares uændret.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2847:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:952:   698	### T10.6 — `clients_validate_fields`-trigger (LENIENT default)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2848:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:959:   705	  create or replace function core_identity.clients_validate_fields()
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2850:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:986:   732	        raise exception 'clients_validate_fields: ukendte/inaktive keys i fields: % (stork.clients_fields_strict=true)',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2851:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:989:   735	        raise warning 'clients_validate_fields: ukendte/inaktive keys i fields (LENIENT - INSERT/UPDATE accepteret): %',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2852:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:998:   744	  comment on function core_identity.clients_validate_fields() is
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2853:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:1001:   747	  create trigger clients_validate_fields
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:2854:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:1003:   749	    for each row execute function core_identity.clients_validate_fields();
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3009:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:1791:  1522	  | `supabase/tests/smoke/t10_clients_validate_fields.sql`                                      | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3010:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:1792:  1523	  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3018:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:1814:  1545	    "core_identity.clients_validate_fields", // V8 (Codex runde 7) — T10.6 trigger-funktion; filtrerer på aktive felt-definitioner som lifecycle-signal
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3027:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:1843:  1574	| `t10_clients_validate_fields.sql`   | LENIENT-default WARN; strict-mode raise                                                                               | grøn             |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3029:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:1858:  1589	  - Hvis T1-audit_filter_values' STABLE-modifier blokerer mig fra at læse client_field_definitions (immutability-issue), kan jeg ende med at skifte til VOLATILE — PLAN-AFVIGELSE med G-nummer-forslag.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3030:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:1864:  1595	  - clients_validate_fields-trigger med LENIENT-default + strict-via-session-var
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3034:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:1877:  1608	- **Hypotese 4 (V6 erstatter Codex V1 #4):** T10.4 har nu `on conflict do nothing` (V6 — Mathias-terminal fund #2). Tidligere DEFER-til-G-nummer var forkert: fitness-check `migration-on-conflict-discipline` håndhæver det, ikke optional.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3040:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:1891:  1622	| T10.6 (clients_validate_fields trigger) | Trigger blokerer legitime writes                                    | lav (LENIENT-default)                                                                  | drop trigger + function     |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3065:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:1984:  1715	- T10.16 udvidet: `core_identity.clients_validate_fields` tilføjet til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Codex runde 7 KRITISK).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3076:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:2001:  1732	- T10.4: tilføjet `on conflict (table_schema, table_name, column_name) do nothing` — `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES`; tidligere DEFER-til-G-nummer var forkert (Mathias #2).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3079:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:2004:  1735	- T10.16 omformuleret: `FK_COVERAGE_EXEMPTIONS` findes ikke i nuværende fitness-script (master-plan §3.19 ikke implementeret); plan tilføjer i stedet `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Code-validering #4 + #5). G-nummer for FK-coverage-check.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3089:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:2026:  1757	- T10.4 ON CONFLICT: DEFER → G-nummer (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness håndhæver, ON CONFLICT er nu obligatorisk i T10.4.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3098:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:2081:  1522	  | `supabase/tests/smoke/t10_clients_validate_fields.sql`                                      | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3099:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:2082:  1523	  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3107:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:2104:  1545	    "core_identity.clients_validate_fields", // V8 (Codex runde 7) — T10.6 trigger-funktion; filtrerer på aktive felt-definitioner som lifecycle-signal
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3116:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:2133:  1574	| `t10_clients_validate_fields.sql`   | LENIENT-default WARN; strict-mode raise                                                                               | grøn             |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3118:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:2148:  1589	  - Hvis T1-audit_filter_values' STABLE-modifier blokerer mig fra at læse client_field_definitions (immutability-issue), kan jeg ende med at skifte til VOLATILE — PLAN-AFVIGELSE med G-nummer-forslag.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3119:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:2154:  1595	  - clients_validate_fields-trigger med LENIENT-default + strict-via-session-var
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3123:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:2167:  1608	- **Hypotese 4 (V6 erstatter Codex V1 #4):** T10.4 har nu `on conflict do nothing` (V6 — Mathias-terminal fund #2). Tidligere DEFER-til-G-nummer var forkert: fitness-check `migration-on-conflict-discipline` håndhæver det, ikke optional.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3129:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:2181:  1622	| T10.6 (clients_validate_fields trigger) | Trigger blokerer legitime writes                                    | lav (LENIENT-default)                                                                  | drop trigger + function     |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3249:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10512:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-10.md:1212:1493:  | `supabase/tests/smoke/t10_clients_validate_fields.sql`                     | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3250:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10513:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-10.md:1213:1494:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context) | T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3260:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10523:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-10.md:1234:1545:| `t10_clients_validate_fields.sql`   | LENIENT-default WARN; strict-mode raise                                                                               | grøn             |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3261:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10525:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-10.md:1237:1560:  - Hvis T1-audit_filter_values' STABLE-modifier blokerer mig fra at læse client_field_definitions (immutability-issue), kan jeg ende med at skifte til VOLATILE — PLAN-AFVIGELSE med G-nummer-forslag.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3270:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10534:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-10.md:1276:1692:- T10.16 omformuleret: `FK_COVERAGE_EXEMPTIONS` findes ikke i nuværende fitness-script (master-plan §3.19 ikke implementeret); plan tilføjer i stedet `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Code-validering #4 + #5). G-nummer for FK-coverage-check.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3339:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10604:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-10.md:1745:  | `supabase/tests/smoke/t10_clients_validate_fields.sql`                     | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3340:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10605:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-10.md:1746:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context) | T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3357:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10623:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-10.md:2227:| `t10_clients_validate_fields.sql`   | LENIENT-default WARN; strict-mode raise                                                                               | grøn             |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3358:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10625:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-10.md:2242:  - Hvis T1-audit_filter_values' STABLE-modifier blokerer mig fra at læse client_field_definitions (immutability-issue), kan jeg ende med at skifte til VOLATILE — PLAN-AFVIGELSE med G-nummer-forslag.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3367:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10634:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-10.md:2374:- T10.16 omformuleret: `FK_COVERAGE_EXEMPTIONS` findes ikke i nuværende fitness-script (master-plan §3.19 ikke implementeret); plan tilføjer i stedet `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Code-validering #4 + #5). G-nummer for FK-coverage-check.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3374:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10641:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-12.md:280:| 1   | KRITISK  | T10.6                  | `clients_validate_fields()` trigger-funktion har `cfd.is_active = true` filter. Rammer fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`). T10.16 allowlister kun `client_field_definitions_list`.                                                                    | Codex runde 7     | **ACCEPT.** Udvid T10.16 med `core_identity.clients_validate_fields`. Forretningsmæssigt korrekt at filtrere på aktive felt-definitioner i validate-trigger (LENIENT: ukendte/inaktive keys → warning) — det er ikke R7d-pattern (employees-dual-column), bare lifecycle-signal. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3378:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10645:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-12.md:306:| 4   | LAV      | T10.4 + Konklusion | "alle 9 kolonner" + "(9 kolonner)" på `client_field_definitions` — SQL har 10 rækker (id, key, display_name, field_type, required, pii_level, display_order, is_active, created_at, updated_at). Plus konklusion-historik siger T10.4 ON CONFLICT er "DEFER", men V6 gjorde det obligatorisk. Codex V1-fund-tabel siger stadig "DEFER → G-nummer".                                                                                                                                                                                                                                                                               | **ACCEPT.** Tekstrettelser: 9→10 på `client_field_definitions`; opdatér V1-fund-tabel (linje 68) og Konklusion-historik (linje 1335) til at reflektere V6's ACCEPT.                                                                                                                                                                                                                                                | T10.4 + linje 68 + linje 1335 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3380:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10647:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-12.md:323:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3385:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10652:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-12.md:388:| T1-drop af D5's public-schema                                                                          | `supabase/migrations/20260514120000_t1_drop_public.sql:32-92`                                                  | Dropper `public.clients`, `public.client_field_definitions`, `public.client_upsert`, `public.client_field_definition_upsert`, `public.clients_validate_fields`, `public.audit_filter_values`, `public.is_admin()`, `public.stork_audit()` etc. INGEN post-T1 migration genskaber clients.                                                                                                               |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3397:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10664:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-12.md:502:106:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3431:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10698:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-12.md:672:1515:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context) | T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3456:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10723:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-12.md:776:- **Hvad:** Genskab D5's clients-special-case-mønster: walker `clients.fields` jsonb og hashes hver key der har `pii_level='direct'` i `client_field_definitions`. **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** ingen `is_active = true`-filter på direct-PII keys — ellers ville deaktivering af et felt skabe datalæk for værdier i eksisterende fields jsonb. Validation-trigger T10.6 behandler stadig inactive som ukendt-key (LENIENT warning), men audit-hashing rammer alle direct-PII definitioner. Resten af T1-logikken bevares uændret.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3566:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10836:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-12.md:2014:  | `supabase/tests/smoke/t10_clients_validate_fields.sql`                     | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3567:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10837:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-12.md:2015:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context) | T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3631:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10902:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-12.md:6006:106:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3650:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10921:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-12.md:7325:docs/coordination/trin-10-plan.md:1515:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context) | T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3658:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10929:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-14.md:127:| 1   | KRITISK  | T10.6                  | `clients_validate_fields()` trigger-funktion har `cfd.is_active = true` filter. Rammer fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`). T10.16 allowlister kun `client_field_definitions_list`.                                                                    | Codex runde 7     | **ACCEPT.** Udvid T10.16 med `core_identity.clients_validate_fields`. Forretningsmæssigt korrekt at filtrere på aktive felt-definitioner i validate-trigger (LENIENT: ukendte/inaktive keys → warning) — det er ikke R7d-pattern (employees-dual-column), bare lifecycle-signal. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3662:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10933:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-14.md:153:| 4   | LAV      | T10.4 + Konklusion | "alle 9 kolonner" + "(9 kolonner)" på `client_field_definitions` — SQL har 10 rækker (id, key, display_name, field_type, required, pii_level, display_order, is_active, created_at, updated_at). Plus konklusion-historik siger T10.4 ON CONFLICT er "DEFER", men V6 gjorde det obligatorisk. Codex V1-fund-tabel siger stadig "DEFER → G-nummer".                                                                                                                                                                                                                                                                               | **ACCEPT.** Tekstrettelser: 9→10 på `client_field_definitions`; opdatér V1-fund-tabel (linje 68) og Konklusion-historik (linje 1335) til at reflektere V6's ACCEPT.                                                                                                                                                                                                                                                | T10.4 + linje 68 + linje 1335 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3664:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10935:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-14.md:170:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3669:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10940:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-14.md:235:| T1-drop af D5's public-schema                                                                          | `supabase/migrations/20260514120000_t1_drop_public.sql:32-92`                                                  | Dropper `public.clients`, `public.client_field_definitions`, `public.client_upsert`, `public.client_field_definition_upsert`, `public.clients_validate_fields`, `public.audit_filter_values`, `public.is_admin()`, `public.stork_audit()` etc. INGEN post-T1 migration genskaber clients.                                                                                                               |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3720:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:10992:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-14.md:818:- **Hvad:** Genskab D5's clients-special-case-mønster: walker `clients.fields` jsonb og hashes hver key der har `pii_level='direct'` i `client_field_definitions`. **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** ingen `is_active = true`-filter på direct-PII keys — ellers ville deaktivering af et felt skabe datalæk for værdier i eksisterende fields jsonb. Validation-trigger T10.6 behandler stadig inactive som ukendt-key (LENIENT warning), men audit-hashing rammer alle direct-PII definitioner. Resten af T1-logikken bevares uændret.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3741:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11013:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-14.md:1261:1543:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T4a (V14):** `client_node_close` på ikke-eksisterende client_id → forvent **P0002 `client_not_found`** (eksistens-check tilføjet i V14). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3795:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11069:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-14.md:1598:  | `supabase/tests/smoke/t10_clients_validate_fields.sql`                                      | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3796:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11070:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-14.md:1599:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T4a (V14):** `client_node_close` på ikke-eksisterende client_id → forvent **P0002 `client_not_found`** (eksistens-check tilføjet i V14). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3827:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11102:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-14.md:2002:| `t10_clients_validate_fields.sql`   | LENIENT-default WARN; strict-mode raise                                                                               | grøn             |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3828:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11104:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-14.md:2017:  - Hvis T1-audit_filter_values' STABLE-modifier blokerer mig fra at læse client_field_definitions (immutability-issue), kan jeg ende med at skifte til VOLATILE — PLAN-AFVIGELSE med G-nummer-forslag.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3840:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11116:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-14.md:2168:- T10.16 omformuleret: `FK_COVERAGE_EXEMPTIONS` findes ikke i nuværende fitness-script (master-plan §3.19 ikke implementeret); plan tilføjer i stedet `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Code-validering #4 + #5). G-nummer for FK-coverage-check.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3846:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11122:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:288:| 1   | KRITISK  | T10.6                  | `clients_validate_fields()` trigger-funktion har `cfd.is_active = true` filter. Rammer fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`). T10.16 allowlister kun `client_field_definitions_list`.                                                                    | Codex runde 7     | **ACCEPT.** Udvid T10.16 med `core_identity.clients_validate_fields`. Forretningsmæssigt korrekt at filtrere på aktive felt-definitioner i validate-trigger (LENIENT: ukendte/inaktive keys → warning) — det er ikke R7d-pattern (employees-dual-column), bare lifecycle-signal. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3850:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11126:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:314:| 4   | LAV      | T10.4 + Konklusion | "alle 9 kolonner" + "(9 kolonner)" på `client_field_definitions` — SQL har 10 rækker (id, key, display_name, field_type, required, pii_level, display_order, is_active, created_at, updated_at). Plus konklusion-historik siger T10.4 ON CONFLICT er "DEFER", men V6 gjorde det obligatorisk. Codex V1-fund-tabel siger stadig "DEFER → G-nummer".                                                                                                                                                                                                                                                                               | **ACCEPT.** Tekstrettelser: 9→10 på `client_field_definitions`; opdatér V1-fund-tabel (linje 68) og Konklusion-historik (linje 1335) til at reflektere V6's ACCEPT.                                                                                                                                                                                                                                                | T10.4 + linje 68 + linje 1335 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3852:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11128:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:331:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3857:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11133:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:396:| T1-drop af D5's public-schema                                                                          | `supabase/migrations/20260514120000_t1_drop_public.sql:32-92`                                                  | Dropper `public.clients`, `public.client_field_definitions`, `public.client_upsert`, `public.client_field_definition_upsert`, `public.clients_validate_fields`, `public.audit_filter_values`, `public.is_admin()`, `public.stork_audit()` etc. INGEN post-T1 migration genskaber clients.                                                                                                               |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3909:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11186:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:833:   579	- **Hvad:** Genskab D5's clients-special-case-mønster: walker `clients.fields` jsonb og hashes hver key der har `pii_level='direct'` i `client_field_definitions`. **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** ingen `is_active = true`-filter på direct-PII keys — ellers ville deaktivering af et felt skabe datalæk for værdier i eksisterende fields jsonb. Validation-trigger T10.6 behandler stadig inactive som ukendt-key (LENIENT warning), men audit-hashing rammer alle direct-PII definitioner. Resten af T1-logikken bevares uændret.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3985:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11264:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:1791:  1522	  | `supabase/tests/smoke/t10_clients_validate_fields.sql`                                      | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3986:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11265:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:1792:  1523	  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3996:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11275:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:1843:  1574	| `t10_clients_validate_fields.sql`   | LENIENT-default WARN; strict-mode raise                                                                               | grøn             |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:3997:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11277:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:1858:  1589	  - Hvis T1-audit_filter_values' STABLE-modifier blokerer mig fra at læse client_field_definitions (immutability-issue), kan jeg ende med at skifte til VOLATILE — PLAN-AFVIGELSE med G-nummer-forslag.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4009:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11289:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:2004:  1735	- T10.16 omformuleret: `FK_COVERAGE_EXEMPTIONS` findes ikke i nuværende fitness-script (master-plan §3.19 ikke implementeret); plan tilføjer i stedet `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Code-validering #4 + #5). G-nummer for FK-coverage-check.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4015:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11295:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:2081:  1522	  | `supabase/tests/smoke/t10_clients_validate_fields.sql`                                      | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4016:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11296:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:2082:  1523	  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4026:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11306:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:2133:  1574	| `t10_clients_validate_fields.sql`   | LENIENT-default WARN; strict-mode raise                                                                               | grøn             |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4027:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11308:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:2148:  1589	  - Hvis T1-audit_filter_values' STABLE-modifier blokerer mig fra at læse client_field_definitions (immutability-issue), kan jeg ende med at skifte til VOLATILE — PLAN-AFVIGELSE med G-nummer-forslag.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4030:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11311:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:3936:/bin/bash -lc 'rg -n "is_admin_by_employee_id|client_field_definition_set_active|logo_filename|undo_period_seconds = 0|not_yet_due|APPROVAL" docs/coordination/trin-10-plan.md docs/coordination/codex-reviews docs/coordination/plan-feedback 2>/dev/null' in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4045:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11326:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:3975:docs/coordination/trin-10-plan.md:1523:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4101:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11382:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:4176:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-12.md:672:1515:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context) | T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4115:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11396:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:4210:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-12.md:2015:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context) | T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4120:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11401:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:4221:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-12.md:7325:docs/coordination/trin-10-plan.md:1515:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context) | T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4123:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11404:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:4236:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-10.md:852:/bin/bash -lc 'rg -n "''^## |''^### |''^#### |''^T10'"\\.|client_node_place|client_node_close|pending_change|t9_write_authorized|is_admin_by_employee_id|apply|GRANT|policy|set_config|clients_validate_fields|client_upsert|client_field_definition|client_logo|smoke|fitness|permanent|audit_filter_values\" docs/coordination/trin-10-plan.md" in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4135:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11416:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:4258:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-10.md:1213:1494:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context) | T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4147:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11428:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:4279:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-10.md:1746:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context) | T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4165:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11446:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:4364:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-11.md:841:1507:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context) | T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4178:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11459:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:4397:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-11.md:2212:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context) | T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4179:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11460:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:4402:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-11.md:3173:docs/coordination/trin-10-plan.md:1507:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context) | T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4250:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11531:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md:5571:docs/coordination/trin-10-plan.md:1515:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context) | T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4260:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11567:   157	  "core_identity.clients_validate_fields",
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4265:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11715:| `t10_clients_validate_fields.sql`   | LENIENT-default WARN; strict-mode raise                                                                               | grøn             |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4267:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11730:  - Hvis T1-audit_filter_values' STABLE-modifier blokerer mig fra at læse client_field_definitions (immutability-issue), kan jeg ende med at skifte til VOLATILE — PLAN-AFVIGELSE med G-nummer-forslag.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4268:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11736:  - clients_validate_fields-trigger med LENIENT-default + strict-via-session-var
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4272:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11749:- **Hypotese 4 (V6 erstatter Codex V1 #4):** T10.4 har nu `on conflict do nothing` (V6 — Mathias-terminal fund #2). Tidligere DEFER-til-G-nummer var forkert: fitness-check `migration-on-conflict-discipline` håndhæver det, ikke optional.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4278:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11763:| T10.6 (clients_validate_fields trigger) | Trigger blokerer legitime writes                                    | lav (LENIENT-default)                                                                  | drop trigger + function     |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4292:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11830:- T10.15 smoke-test T4a tilføjet: `client_node_close` med non-existent client_id → P0002.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4316:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11943:  | `supabase/tests/smoke/t10_clients_validate_fields.sql`                                      | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4317:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11944:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T4a (V14):** `client_node_close` på ikke-eksisterende client_id → forvent **P0002 `client_not_found`** (eksistens-check tilføjet i V14). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4325:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:11966:    "core_identity.clients_validate_fields", // V8 (Codex runde 7) — T10.6 trigger-funktion; filtrerer på aktive felt-definitioner som lifecycle-signal
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4332:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12069:| 1   | KRITISK-SIKKERHEDSHUL | T10.4    | `clients.logo_filename` klassificeret som `pii_level='none'` → brugerleveret filnavn lander i klartekst i audit_log. Inkonsistent med `clients.name='direct'` (forsigtigheds-pattern). Filnavne kan realistisk indeholde klient-/personidentifikatorer. | **ACCEPT + proaktiv udvidelse.** `logo_filename` → `pii_level='direct'`. **Plus:** `logo_bytes` → `'direct'` (binær billed-data kan vise stifter/medarbejdere — samme forsigtigheds-pattern). `logo_content_type` forbliver `'none'` (kun MIME-type). T10.15's logo-test udvides med audit-hash-assertion. | T10.4 + T10.15 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4334:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12078:| 2   | G-NUMMER-KANDIDAT | T10.16 / Oprydnings-strategi | T10.16 nævner FK-coverage som G-nummer-kandidat, men oprydnings-strategi siger "Ingen G-numre forventet". Inkonsistent.                                                                                                                   | **ACCEPT.** **G058** registreret i `docs/teknisk/teknisk-gaeld.md` (FK-coverage-fitness-check ikke implementeret per master-plan §3.19). Oprydnings-strategi opdateret til at angive G057 + G058 som del af trin 10.            |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4339:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12105:**T9-public-wrapper-bug (Code-observation):** Codex' fund afslører at T9's 7 public-wrappers (`org_node_upsert`, `org_node_deactivate`, `team_close`, `employee_place`, `employee_remove_from_node`, `client_node_place`, `client_node_close`) alle mangler `t9_write_authorized`-session-var. Trin 10's scope er kun de to client-RPC'er; de øvrige 5 er T9-arbejde der skal adresseres som G-nummer/separat pakke (T9 ville fungere i tests fordi `_apply_*`-handlers er SECURITY DEFINER og kan kaldes direkte, men authenticated-bruger via wrapper-vej er broken).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4340:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12117:| 1   | KRITISK  | T10.6                  | `clients_validate_fields()` trigger-funktion har `cfd.is_active = true` filter. Rammer fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`). T10.16 allowlister kun `client_field_definitions_list`.                                                                    | Codex runde 7     | **ACCEPT.** Udvid T10.16 med `core_identity.clients_validate_fields`. Forretningsmæssigt korrekt at filtrere på aktive felt-definitioner i validate-trigger (LENIENT: ukendte/inaktive keys → warning) — det er ikke R7d-pattern (employees-dual-column), bare lifecycle-signal. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4353:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12143:| 4   | LAV      | T10.4 + Konklusion | "alle 9 kolonner" + "(9 kolonner)" på `client_field_definitions` — SQL har 10 rækker (id, key, display_name, field_type, required, pii_level, display_order, is_active, created_at, updated_at). Plus konklusion-historik siger T10.4 ON CONFLICT er "DEFER", men V6 gjorde det obligatorisk. Codex V1-fund-tabel siger stadig "DEFER → G-nummer".                                                                                                                                                                                                                                                                               | **ACCEPT.** Tekstrettelser: 9→10 på `client_field_definitions`; opdatér V1-fund-tabel (linje 68) og Konklusion-historik (linje 1335) til at reflektere V6's ACCEPT.                                                                                                                                                                                                                                                | T10.4 + linje 68 + linje 1335 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4356:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12158:| 2   | KRITISK             | T10.4                                           | INSERT i `core_compliance.data_field_definitions` mangler `ON CONFLICT do nothing`. `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES` (`scripts/fitness.mjs:162-172`); `migration-on-conflict-discipline` (`:675-737`) håndhæver det. V5's DEFER til G-nummer var forkert — fitness brækker.                                    | Mathias-terminal | **ACCEPT.** Tilføj `on conflict (table_schema, table_name, column_name) do nothing`. Fjern G-nummer-kandidat-tekst fra Optimerings-hypoteser (det er ikke en optimering, det er krav).                                                                                                                                                                                                                 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4358:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12160:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4368:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12208:| 4   | G-NUMMER-KANDIDAT     | T10.4   | INSERT mangler `ON CONFLICT do nothing` (T9-classify bruger det). Ikke blocker for greenfield.                                                                            | **V2-svar: DEFER → G-nummer** (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness-check `migration-on-conflict-discipline` håndhæver det på `core_compliance.data_field_definitions`. Plan har nu `ON CONFLICT (table_schema, table_name, column_name) DO NOTHING`. | T10.4          |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4371:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12221:supabase/tests/smoke/t10_clients_validate_fields.sql
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4389:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12578:supabase/tests/smoke/t10_client_lifecycle.sql:96:  raise notice 'T10 lifecycle smoke: ALL TESTS PASSED (T1-T4)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4395:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12663:supabase/tests/smoke/t10_clients_validate_fields.sql:1:-- Trin 10 T10.15: clients_validate_fields smoke-test
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4396:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12664:supabase/tests/smoke/t10_clients_validate_fields.sql:20:  perform set_config('stork.change_reason', 'T10 validate_fields smoke', true);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4397:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12665:supabase/tests/smoke/t10_clients_validate_fields.sql:97:  raise notice 'T10 validate_fields smoke: TESTS PASSED (T1-T3); T4 audit-hash dropped → G-nummer';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4400:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12677:/bin/bash -lc "git show --no-ext-diff --unified=80 -- supabase/tests/smoke/t10_client_active_check.sql supabase/tests/smoke/t10_clients_validate_fields.sql | sed -n '1,260p'" in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4402:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12693:diff --git a/supabase/tests/smoke/t10_clients_validate_fields.sql b/supabase/tests/smoke/t10_clients_validate_fields.sql
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4403:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12695:--- a/supabase/tests/smoke/t10_clients_validate_fields.sql
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4404:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12696:+++ b/supabase/tests/smoke/t10_clients_validate_fields.sql
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4417:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12785:-      'T10-validate T4: opret med direct-PII', true, null
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4418:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12789:-    perform core_identity.client_field_definition_set_active(v_field_id, false, 'T10-validate T4: deaktiver felt-def');
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4420:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12795:-      'T10-validate T4: UPDATE efter felt-def deaktivering',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4423:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12818:-  raise notice 'T10 validate_fields smoke: ALL TESTS PASSED (T1-T4)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4424:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12819:+  raise notice 'T10 validate_fields smoke: TESTS PASSED (T1-T3); T4 audit-hash dropped → G-nummer';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4425:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12829:supabase/tests/smoke/t10_clients_validate_fields.sql
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4428:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12834:supabase/tests/smoke/t10_clients_validate_fields.sql
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4430:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12839:PLAN-AFVIGELSE: T10.15 `t10_client_active_check.sql` verifierer ikke de godkendte wrapper/apply-dispatch flows.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4433:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12845:PLAN-AFVIGELSE: T10.15 `t10_clients_validate_fields.sql` dropper godkendt audit-PII assertion.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4434:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12847:Fund: Plan V14 kræver test for at direct-PII keys i `clients.fields` hashes selv efter `client_field_definitions.is_active=false`. HEAD fjerner assertionen og flytter den til G-nummer-kandidat. Det er en godkendt sikkerhedsregression-test fra tidligere KRITISK-SIKKERHEDSHUL, ikke optional build-scope.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4435:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12852:PLAN-AFVIGELSE: T10.15 `t10_client_active_check.sql` verifierer ikke de godkendte wrapper/apply-dispatch flows.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4438:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12858:PLAN-AFVIGELSE: T10.15 `t10_clients_validate_fields.sql` dropper godkendt audit-PII assertion.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4439:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md:12860:Fund: Plan V14 kræver test for at direct-PII keys i `clients.fields` hashes selv efter `client_field_definitions.is_active=false`. HEAD fjerner assertionen og flytter den til G-nummer-kandidat. Det er en godkendt sikkerhedsregression-test fra tidligere KRITISK-SIKKERHEDSHUL, ikke optional build-scope.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4480:supabase/tests/smoke/t10_clients_validate_fields.sql
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4494:supabase/migrations/20260521000005_t10_clients_validate_fields.sql
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4502:/bin/bash -lc "rg -n \"RUNDE|Runde|APPROVAL|PLAN-AFVIGELSE|KRITISK|MELLEM|LAV|OPTIMERING|G-NUMMER|client_active_check|validate_fields|audit\" docs/coordination/codex-reviews docs/coordination -g '*trin-10*'" in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4513:0dbe93d Trin 10 plan V14: client_node_close eksistens-check (Code walk-through efter Codex APPROVAL)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4560:Max 350 ord output. Brug marker-format fra niveau 1-prefix (KRITISK/MELLEM/LAV/HUL/OPTIMERING-FORSLAG/G-NUMMER-KANDIDAT etc.). Hvis du ikke har fund: skriv "APPROVAL — Runde 2".
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4619:- PLAN-AFVIGELSE: <hvad>          — afviger fra approved plan
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4656:Hvis flere markers matcher samme fund: brug den marker der bedst beskriver primær problem. Sekundære nævnes i body som G-nummer-kandidater (ikke separat fund).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4670:Er fundet uafhængigt af formålet? → G-nummer-kandidat, ikke blocker
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4715:Optimerings-forslag deferred til G-nummer: O_DEFER
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4784:Max 350 ord output. Brug marker-format fra niveau 1-prefix (KRITISK/MELLEM/LAV/HUL/OPTIMERING-FORSLAG/G-NUMMER-KANDIDAT etc.). Hvis du ikke har fund: skriv "APPROVAL — Runde 4".
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4845:- PLAN-AFVIGELSE: <hvad>          — afviger fra approved plan
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4882:Hvis flere markers matcher samme fund: brug den marker der bedst beskriver primær problem. Sekundære nævnes i body som G-nummer-kandidater (ikke separat fund).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4896:Er fundet uafhængigt af formålet? → G-nummer-kandidat, ikke blocker
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:4941:Optimerings-forslag deferred til G-nummer: O_DEFER
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5008:Max 350 ord output. Brug marker-format fra niveau 1-prefix (KRITISK/MELLEM/LAV/HUL/OPTIMERING-FORSLAG/G-NUMMER-KANDIDAT etc.). Hvis du ikke har fund: skriv "APPROVAL — Runde 3".
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5067:- PLAN-AFVIGELSE: <hvad>          — afviger fra approved plan
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5104:Hvis flere markers matcher samme fund: brug den marker der bedst beskriver primær problem. Sekundære nævnes i body som G-nummer-kandidater (ikke separat fund).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5118:Er fundet uafhængigt af formålet? → G-nummer-kandidat, ikke blocker
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5163:Optimerings-forslag deferred til G-nummer: O_DEFER
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5201:Codex runde 13 leverede **APPROVAL** på V13. Code's parallel grundige walk-through (Mathias-instruks "vi skal vel løse de huller") fandt 1 yderligere hul som Codex missede.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5223:| 1   | KRITISK-SIKKERHEDSHUL | T10.4    | `clients.logo_filename` klassificeret som `pii_level='none'` → brugerleveret filnavn lander i klartekst i audit_log. Inkonsistent med `clients.name='direct'` (forsigtigheds-pattern). Filnavne kan realistisk indeholde klient-/personidentifikatorer. | **ACCEPT + proaktiv udvidelse.** `logo_filename` → `pii_level='direct'`. **Plus:** `logo_bytes` → `'direct'` (binær billed-data kan vise stifter/medarbejdere — samme forsigtigheds-pattern). `logo_content_type` forbliver `'none'` (kun MIME-type). T10.15's logo-test udvides med audit-hash-assertion. | T10.4 + T10.15 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5270:   226	  raise notice 'T10 active-check smoke: ALL TESTS PASSED (T1, T2, T4, T4a, T5, T6, T8)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5277:/bin/bash -lc "rg -n \"### T10\\.15|t10_client_active_check|T1: opret aktiv|T2:|T3 \\(apply|T4a|T6 \\(V10|T7 \\(V10|T8 \\(V10\" docs/coordination/arkiv/trin-10-plan.md" in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5284:1543:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T4a (V14):** `client_node_close` på ikke-eksisterende client_id → forvent **P0002 `client_not_found`** (eksistens-check tilføjet i V14). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5286:1709:- T10.15 smoke-test T4a tilføjet: `client_node_close` med non-existent client_id → P0002.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5335:  1542	  | `supabase/tests/smoke/t10_clients_validate_fields.sql`                                      | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5336:  1543	  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T4a (V14):** `client_node_close` på ikke-eksisterende client_id → forvent **P0002 `client_not_found`** (eksistens-check tilføjet i V14). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5344:PLAN-AFVIGELSE (KRITISK): `supabase/tests/smoke/t10_client_active_check.sql` dækker stadig ikke godkendt T10.15-flow.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5351:PLAN-AFVIGELSE (KRITISK): `supabase/tests/smoke/t10_client_active_check.sql` dækker stadig ikke godkendt T10.15-flow.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5358:/bin/bash -lc 'rg -n "''^PLAN-AFVIGELSE|''^KRITISK|''^TEKNISK|''^APPROVAL|''^G-NUMMER|''^MELLEM|''^LAV|''^OPTIMERING|''^WORKAROUND" docs/coordination/codex-reviews/2026-05-21-trin-10-runde-2.md docs/coordination/codex-reviews/2026-05-21-trin-10-runde-3.md' in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5360:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-3.md:1697:PLAN-AFVIGELSE (KRITISK): `supabase/tests/smoke/t10_client_active_check.sql` dækker stadig ikke godkendt T10.15-flow.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5361:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-3.md:1704:PLAN-AFVIGELSE (KRITISK): `supabase/tests/smoke/t10_client_active_check.sql` dækker stadig ikke godkendt T10.15-flow.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5362:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-3.md:1769:PLAN-AFVIGELSE: T10.15 `t10_client_active_check.sql` verifierer ikke de godkendte wrapper/apply-dispatch flows.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5363:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-3.md:1775:PLAN-AFVIGELSE: T10.15 `t10_clients_validate_fields.sql` dropper godkendt audit-PII assertion.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5364:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-3.md:1782:PLAN-AFVIGELSE: T10.15 `t10_client_active_check.sql` verifierer ikke de godkendte wrapper/apply-dispatch flows.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5365:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-3.md:1788:PLAN-AFVIGELSE: T10.15 `t10_clients_validate_fields.sql` dropper godkendt audit-PII assertion.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5366:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-3.md:5046:PLAN-AFVIGELSE (KRITISK): `t10_client_active_check.sql` erstatter stadig godkendt T10.15 end-to-end-flow.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5368:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-3.md:5059:PLAN-AFVIGELSE (KRITISK): `t10_client_active_check.sql` erstatter stadig godkendt T10.15 end-to-end-flow.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5370:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-2.md:2943:PLAN-AFVIGELSE: T10.15 `t10_client_active_check.sql` verifierer ikke de godkendte wrapper/apply-dispatch flows.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5371:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-2.md:2949:PLAN-AFVIGELSE: T10.15 `t10_clients_validate_fields.sql` dropper godkendt audit-PII assertion.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5372:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-2.md:2956:PLAN-AFVIGELSE: T10.15 `t10_client_active_check.sql` verifierer ikke de godkendte wrapper/apply-dispatch flows.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5373:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-2.md:2962:PLAN-AFVIGELSE: T10.15 `t10_clients_validate_fields.sql` dropper godkendt audit-PII assertion.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5374:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-2.md:4881:PLAN-AFVIGELSE (KRITISK): `supabase/tests/smoke/t10_client_active_check.sql` dækker stadig ikke godkendt T10.15-flow.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5375:docs/coordination/codex-reviews/2026-05-21-trin-10-runde-2.md:4888:PLAN-AFVIGELSE (KRITISK): `supabase/tests/smoke/t10_client_active_check.sql` dækker stadig ikke godkendt T10.15-flow.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5421:7b86d86 Trin 10 smoke-test T4: brug current_date - 1 for placement (close UPDATE, ikke DELETE)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5439:    V6 Code-validering #5 (kun grant-model) var fejlagtig vurdering: legacy fungerer som M1-test-target. Tilføjer legacy-rows for clients + client_field_definitions/manage. Senere kan legacy fjernes når M1-test refactores (G-nummer-kandidat).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5462:+-- når M1-test refactores til at læse grant-modellen direkte (G-nummer-kandidat).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5486:supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql:9:-- når M1-test refactores til at læse grant-modellen direkte (G-nummer-kandidat).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5496:PLAN-AFVIGELSE (KRITISK): `t10_client_active_check.sql` erstatter stadig godkendt T10.15 end-to-end-flow.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5506:LØS: Enten opdatér godkendt plan + registrér konkret G-nummer, eller fjern migrationen og ret M1-testen til grant-modellen før approval.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5509:PLAN-AFVIGELSE (KRITISK): `t10_client_active_check.sql` erstatter stadig godkendt T10.15 end-to-end-flow.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5519:LØS: Enten opdatér godkendt plan + registrér konkret G-nummer, eller fjern migrationen og ret M1-testen til grant-modellen før approval.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5542:    15	--   T4: superadmin → wrapper close inaktiv klient → success (ingen aktiv-check)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5543:    16	--   T4a: superadmin → wrapper close non-existent → P0002
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5748:   221	  -- T4: superadmin → wrapper close inaktiv klient → success
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5753:   226	    raise exception 'T4 FAIL: client_node_close på inaktiv klient skal lykkes (ingen aktiv-check)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5757:   230	  -- T4a (V14): client_node_close på non-existent → P0002
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:5764:   237	    raise exception 'T4a FAIL (V14): client_node_close på non-existent skal raise P0002';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:6085:     9	-- når M1-test refactores til at læse grant-modellen direkte (G-nummer-kandidat).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:6321:+--   T4: superadmin → wrapper close inaktiv klient → success (ingen aktiv-check)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:6322:+--   T4a: superadmin → wrapper close non-existent → P0002
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:6600:-  -- T4: client_node_close på inaktiv klient → success (ingen aktiv-check)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:6609:-    raise exception 'T4 FAIL: close skulle lukke placement på inaktiv klient';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:6615:+  -- T4: superadmin → wrapper close inaktiv klient → success
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:6620:+    raise exception 'T4 FAIL: client_node_close på inaktiv klient skal lykkes (ingen aktiv-check)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:6624:-  -- T4a (V14): client_node_close på non-existent client_id → P0002
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:6627:+  -- T4a (V14): client_node_close på non-existent → P0002
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:6634:-    raise exception 'T4a FAIL (V14): close skal P0002 ved non-existent client_id';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:6635:+    raise exception 'T4a FAIL (V14): client_node_close på non-existent skal raise P0002';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:6762:-  raise notice 'T10 active-check smoke: ALL TESTS PASSED (T1-T8 inkl. T4a)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:7424:   113	-- audit-hashing i clients.fields binder til key; eksisterende værdier ville
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:7755:    13	-- V9 robusthed (Codex V8 G-nummer ADOPT): queries scope'es til org_structure-area
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:7801:/bin/bash -lc "nl -ba supabase/tests/smoke/t10_clients_validate_fields.sql supabase/tests/smoke/t10_client_logo.sql supabase/tests/smoke/t10_client_field_definitions.sql | sed -n '1,360p'" in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:7803:     1	-- Trin 10 T10.15: clients_validate_fields smoke-test
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:7893:    91	  -- ─── T4 (V2 KRITISK-SIKKERHEDSHUL): audit-PII-hashing efter is_active=false
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:7902:   100	      'T10-validate T4: opret med direct-PII', true, null
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:7906:   104	    perform core_identity.client_field_definition_set_active(v_field_id, false, 'T10-validate T4: deaktiver felt-def');
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:7912:   110	      'T10-validate T4: UPDATE efter felt-def deaktivering',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:7926:   124	      raise exception 'T4 FAIL: audit-row mangler eller kontakt_email ikke i fields';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:7929:   127	      raise exception 'T4 FAIL (V2 KRITISK-SIKKERHEDSHUL): kontakt_email skal hashes selv efter felt-def is_active=false. Fik: %', v_audit_value;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:7933:   131	  raise notice 'T10 validate_fields smoke: ALL TESTS PASSED (T1-T4)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8033:   231	  -- ─── T4: client_logo_clear nulstiller alle tre felter ───────────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8034:   232	  perform core_identity.client_logo_clear(v_client_id, 'T10-logo T4: fjern logo');
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8040:   238	    raise exception 'T4 FAIL: client_logo_clear skal nulstille alle tre felter';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8162:   360	  -- ─── T4: UPDATE display_order accepteres (ikke immutable) ──────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8323:supabase/tests/smoke/t10_clients_validate_fields.sql:1:-- Trin 10 T10.15: clients_validate_fields smoke-test
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8324:supabase/tests/smoke/t10_clients_validate_fields.sql:3:-- LENIENT-default: unknown key i fields → warning, INSERT accepteret.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8325:supabase/tests/smoke/t10_clients_validate_fields.sql:4:-- Strict-mode (stork.clients_fields_strict='true'): unknown key → exception.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8326:supabase/tests/smoke/t10_clients_validate_fields.sql:5:-- V2 (Codex V1 MELLEM): assert at non-object fields ('"scalar"'::jsonb,
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8327:supabase/tests/smoke/t10_clients_validate_fields.sql:6:-- '[1,2]'::jsonb) afvises af clients_fields_is_object-CHECK (errcode 23514).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8328:supabase/tests/smoke/t10_clients_validate_fields.sql:8:-- direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8329:supabase/tests/smoke/t10_clients_validate_fields.sql:20:  perform set_config('stork.change_reason', 'T10 validate_fields smoke', true);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8330:supabase/tests/smoke/t10_clients_validate_fields.sql:36:    'kontakt_email', 'Kontakt-email', 'email', 'direct',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8331:supabase/tests/smoke/t10_clients_validate_fields.sql:51:  -- ─── T2 (V2 MELLEM): non-object fields afvises af CHECK ─────────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8332:supabase/tests/smoke/t10_clients_validate_fields.sql:55:      'Bad-fields klient',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8333:supabase/tests/smoke/t10_clients_validate_fields.sql:61:    raise exception 'T2 FAIL (V2 MELLEM): scalar jsonb skal afvises af clients_fields_is_object-CHECK';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8334:supabase/tests/smoke/t10_clients_validate_fields.sql:67:      'Bad-fields klient',
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8335:supabase/tests/smoke/t10_clients_validate_fields.sql:73:    raise exception 'T2b FAIL: array jsonb skal afvises af clients_fields_is_object-CHECK';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8336:supabase/tests/smoke/t10_clients_validate_fields.sql:77:  perform set_config('stork.clients_fields_strict', 'true', true);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8337:supabase/tests/smoke/t10_clients_validate_fields.sql:89:  perform set_config('stork.clients_fields_strict', 'false', true);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8338:supabase/tests/smoke/t10_clients_validate_fields.sql:91:  -- ─── T4 (V2 KRITISK-SIKKERHEDSHUL): audit-PII-hashing efter is_active=false
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8339:supabase/tests/smoke/t10_clients_validate_fields.sql:92:  -- Bekræft at direct-PII keys i clients.fields hashes selv efter felt-def deaktivering.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8340:supabase/tests/smoke/t10_clients_validate_fields.sql:99:      jsonb_build_object('kontakt_email', 'user@example.com'),
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8341:supabase/tests/smoke/t10_clients_validate_fields.sql:100:      'T10-validate T4: opret med direct-PII', true, null
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8342:supabase/tests/smoke/t10_clients_validate_fields.sql:103:    -- Deaktiver felt-def. Audit skal stadig hash kontakt_email.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8343:supabase/tests/smoke/t10_clients_validate_fields.sql:106:    -- UPDATE klient (genererer audit-row med NY direct-PII-værdi)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8344:supabase/tests/smoke/t10_clients_validate_fields.sql:109:      jsonb_build_object('kontakt_email', 'user-new@example.com'),
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8345:supabase/tests/smoke/t10_clients_validate_fields.sql:115:    select new_values -> 'fields' ->> 'kontakt_email' into v_audit_value
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8346:supabase/tests/smoke/t10_clients_validate_fields.sql:116:    from core_compliance.audit_log
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8347:supabase/tests/smoke/t10_clients_validate_fields.sql:124:      raise exception 'T4 FAIL: audit-row mangler eller kontakt_email ikke i fields';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8348:supabase/tests/smoke/t10_clients_validate_fields.sql:126:    if v_audit_value not like 'sha256:%' then
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8349:supabase/tests/smoke/t10_clients_validate_fields.sql:127:      raise exception 'T4 FAIL (V2 KRITISK-SIKKERHEDSHUL): kontakt_email skal hashes selv efter felt-def is_active=false. Fik: %', v_audit_value;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8350:supabase/tests/smoke/t10_clients_validate_fields.sql:131:  raise notice 'T10 validate_fields smoke: ALL TESTS PASSED (T1-T4)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8447:docs/coordination/arkiv/trin-10-plan.md:83:| 1   | KRITISK  | T10.6                  | `clients_validate_fields()` trigger-funktion har `cfd.is_active = true` filter. Rammer fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`). T10.16 allowlister kun `client_field_definitions_list`.                                                                    | Codex runde 7     | **ACCEPT.** Udvid T10.16 med `core_identity.clients_validate_fields`. Forretningsmæssigt korrekt at filtrere på aktive felt-definitioner i validate-trigger (LENIENT: ukendte/inaktive keys → warning) — det er ikke R7d-pattern (employees-dual-column), bare lifecycle-signal. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8493:supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql:9:-- når M1-test refactores til at læse grant-modellen direkte (G-nummer-kandidat).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8536:/bin/bash -lc 'rg -n "T1:|T2:|T3:|T4:|T4a|T5:|T6:|T7:|T8|pending_change_apply|pending_change_approve|client_node_close|client_node_place|_apply_client_place|insert into core_identity.pending_changes" supabase/tests/smoke/t10_client_active_check.sql docs/coordination/arkiv/trin-10-plan.md' in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8541:supabase/tests/smoke/t10_client_active_check.sql:15:--   T4: superadmin → wrapper close inaktiv klient → success (ingen aktiv-check)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8542:supabase/tests/smoke/t10_client_active_check.sql:16:--   T4a: superadmin → wrapper close non-existent → P0002
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8556:supabase/tests/smoke/t10_client_active_check.sql:221:  -- T4: superadmin → wrapper close inaktiv klient → success
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8558:supabase/tests/smoke/t10_client_active_check.sql:226:    raise exception 'T4 FAIL: client_node_close på inaktiv klient skal lykkes (ingen aktiv-check)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8559:supabase/tests/smoke/t10_client_active_check.sql:230:  -- T4a (V14): client_node_close på non-existent → P0002
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8561:supabase/tests/smoke/t10_client_active_check.sql:237:    raise exception 'T4a FAIL (V14): client_node_close på non-existent skal raise P0002';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8581:docs/coordination/arkiv/trin-10-plan.md:71:**T9-public-wrapper-bug (Code-observation):** Codex' fund afslører at T9's 7 public-wrappers (`org_node_upsert`, `org_node_deactivate`, `team_close`, `employee_place`, `employee_remove_from_node`, `client_node_place`, `client_node_close`) alle mangler `t9_write_authorized`-session-var. Trin 10's scope er kun de to client-RPC'er; de øvrige 5 er T9-arbejde der skal adresseres som G-nummer/separat pakke (T9 ville fungere i tests fordi `_apply_*`-handlers er SECURITY DEFINER og kan kaldes direkte, men authenticated-bruger via wrapper-vej er broken).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8583:docs/coordination/arkiv/trin-10-plan.md:126:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8623:docs/coordination/arkiv/trin-10-plan.md:1543:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T4a (V14):** `client_node_close` på ikke-eksisterende client_id → forvent **P0002 `client_not_found`** (eksistens-check tilføjet i V14). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8633:docs/coordination/arkiv/trin-10-plan.md:1709:- T10.15 smoke-test T4a tilføjet: `client_node_close` med non-existent client_id → P0002.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8839:✓ supabase/tests/smoke/t10_clients_validate_fields.sql (3375 ms)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8852:PLAN-AFVIGELSE (KRITISK): `supabase/tests/smoke/t10_client_active_check.sql` simulerer stadig ikke V14’s cron/no-auth apply-path.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8856:Sekundært under samme fund: T1/T4/T5 verifierer kun wrapper returnerer pending-id, ikke approve+apply/placement-close end-to-end. Niveau-1-prefix kræver eksempel-row gennem write-flow/apply-dispatch.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8858:LØS: Før T6/T7 apply: nulstil auth-context eksplicit og kør apply som cron/service-role/no-auth, eller kald `_apply_client_place` direkte uden JWT som planen tillader. Udvid T1/T4/T5 til approve+apply hvor flowet påstås dækket.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8861:PLAN-AFVIGELSE (KRITISK): `supabase/tests/smoke/t10_client_active_check.sql` simulerer stadig ikke V14’s cron/no-auth apply-path.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8865:Sekundært under samme fund: T1/T4/T5 verifierer kun wrapper returnerer pending-id, ikke approve+apply/placement-close end-to-end. Niveau-1-prefix kræver eksempel-row gennem write-flow/apply-dispatch.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md:8867:LØS: Før T6/T7 apply: nulstil auth-context eksplicit og kør apply som cron/service-role/no-auth, eller kald `_apply_client_place` direkte uden JWT som planen tillader. Udvid T1/T4/T5 til approve+apply hvor flowet påstås dækket.

codex
Den mistænkte T4-mismatch var falsk alarm: den aktuelle testfil indeholder faktisk T4 audit-hash-assertionen og runde 4/5-reviewet viser den med. Jeg fortsætter med de resterende rapportpåstande, især migrationstælling, plan-afvigelser og fire-dokument-spor.
exec
/bin/bash -lc 'rg -n "LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS|client_field_definitions_list|clients_validate_fields|FK_COVERAGE" scripts/fitness.mjs' in /home/mathias/stork-2.0
exec
/bin/bash -lc "rg -n \"fitness|smoke|test:|db\" package.json scripts -g '*.json' -g '*.mjs' -g '*.js'" in /home/mathias/stork-2.0
 succeeded in 0ms:
149:const LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS = new Set([
156:  "core_identity.client_field_definitions_list",
157:  "core_identity.clients_validate_fields",
893:    .filter((r) => !LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS.has(r.site))

 succeeded in 0ms:
package.json:22:    "schema:pull": "supabase db dump --linked --schema public --file supabase/schema.sql",
package.json:25:    "fitness": "node scripts/fitness.mjs",
package.json:26:    "db:test": "node scripts/run-db-tests.mjs",
scripts/fitness.mjs:20:// af fitness-checks. De forbliver grandfathered.
scripts/fitness.mjs:88:// Fitness-check `db-test-tx-wrap-on-immutable-insert` håndhæver disciplin.
scripts/fitness.mjs:105:  // Alle T9-smoke-tests er allerede BEGIN/ROLLBACK-wrapped efter refactor;
scripts/fitness.mjs:146:// G-nummer-kandidat: R7d-fitness-check skal eksplicit dokumentere at den er
scripts/fitness.mjs:555:async function dbRlsPolicies() {
scripts/fitness.mjs:559:    return { name: "db-rls-policies", violations: [], skipped: "SUPABASE_ACCESS_TOKEN ikke sat" };
scripts/fitness.mjs:586:        name: "db-rls-policies",
scripts/fitness.mjs:593:    return { name: "db-rls-policies", violations: [`Network fejl: ${err.message}; check skipped`], soft: true };
scripts/fitness.mjs:616:  return { name: "db-rls-policies", violations };
scripts/fitness.mjs:750:// db-rls-policies). Polcmd ∈ {a,w,d,*} = INSERT/UPDATE/DELETE/ALL.
scripts/fitness.mjs:905:async function dbTestTxWrapOnImmutableInsert() {
scripts/fitness.mjs:927:  return { name: "db-test-tx-wrap-on-immutable-insert", violations };
scripts/fitness.mjs:952:// Tre værn der låser hermetisk-fixture-kontrakten for T9-smoke-tests:
scripts/fitness.mjs:953://   db-test-no-disabled-sql        — midlertidige .sql.disabled må ikke merges
scripts/fitness.mjs:954://   db-test-no-t9-seed-user-fixtures — t9_*.sql må ikke bruge mg@/km@ mutable
scripts/fitness.mjs:955://   db-test-no-t9-skip-guards      — t9_*.sql må ikke skippe ved manglende tabel
scripts/fitness.mjs:957:async function dbTestNoDisabledSql() {
scripts/fitness.mjs:977:  return { name: "db-test-no-disabled-sql", violations };
scripts/fitness.mjs:980:async function dbTestNoT9SeedUserFixtures() {
scripts/fitness.mjs:982:  const dir = "supabase/tests/smoke";
scripts/fitness.mjs:987:    return { name: "db-test-no-t9-seed-user-fixtures", violations };
scripts/fitness.mjs:998:          `${file}: bruger seed-user "${u}" som fixture — forbudt. Brug throwaway employees med uuid-suffix-emails, eller tilføj "-- allow-bootstrap-seed-user-test: <reason>" hvis testen er read-only seed/auth verification.`,
scripts/fitness.mjs:1004:  return { name: "db-test-no-t9-seed-user-fixtures", violations };
scripts/fitness.mjs:1115:async function dbTestNoT9SkipGuards() {
scripts/fitness.mjs:1117:  const dir = "supabase/tests/smoke";
scripts/fitness.mjs:1122:    return { name: "db-test-no-t9-skip-guards", violations };
scripts/fitness.mjs:1140:  return { name: "db-test-no-t9-skip-guards", violations };
scripts/fitness.mjs:1157:  dbRlsPolicies,
scripts/fitness.mjs:1160:  dbTestTxWrapOnImmutableInsert,
scripts/fitness.mjs:1161:  dbTestNoDisabledSql,
scripts/fitness.mjs:1162:  dbTestNoT9SeedUserFixtures,
scripts/fitness.mjs:1163:  dbTestNoT9SkipGuards,
scripts/run-db-tests.mjs:58:    console.error("SUPABASE_ACCESS_TOKEN env-var er påkrævet for test:db");
scripts/run-db-tests.mjs:107:      // Fail-fast for kortest CI-feedback

exec
/bin/bash -lc ls in /home/mathias/stork-2.0
 succeeded in 0ms:
CLAUDE.md
README.md
apps
docs
node_modules
package.json
packages
pnpm-lock.yaml
pnpm-workspace.yaml
scripts
supabase
tsconfig.base.json
turbo.json

exec
/bin/bash -lc "rg -n \"202605210000(01|02|03|04|05|06|07|08|09|10|11|12|13|14)|T10\\.13|legacy|reverse|role_page_permissions|grant-model|client_field_definitions_list|clients_validate_fields\" docs/coordination/rapport-historik/2026-05-21-trin-10.md docs/coordination/arkiv/trin-10-plan.md docs/coordination/mathias-afgoerelser.md docs/strategi/bygge-status.md docs/strategi/stork-2-0-master-plan.md docs/teknisk/teknisk-gaeld.md supabase/migrations/*.sql scripts/fitness.mjs" in /home/mathias/stork-2.0
 succeeded in 0ms:
docs/teknisk/teknisk-gaeld.md:425:- **Beskrivelse:** `anonymize_generic_apply` (P1b) gemmer `anonymization_state.field_mapping_snapshot` i nested shape (`{"first_name":{"strategy":"blank","strategy_id":"..."}}`). `_anonymize_employee_apply` (legacy; kaldt af replay_anonymization via `anonymization_mappings.internal_rpc_apply`) læser flat shape (`p_strategies->>'first_name'` skal returnere `'blank'`).
docs/teknisk/teknisk-gaeld.md:426:- **Reel impact:** Replay af anonymization der er udført via post-P1c flow (anonymize_employee → anonymize_generic_apply) vil fejle — `->>` returnerer JSON-string-værdi, ikke strategy-name → `apply_field_strategy` får forkert input. Replay af pre-P1c-state (eller test-seeded legacy shape) virker.
docs/teknisk/teknisk-gaeld.md:428:- **Introduceret:** P1b (anonymize_generic_apply gemmer nested shape) + Q-pakke (mappings.internal_rpc_apply peger stadig på legacy `_anonymize_employee_apply`)
docs/teknisk/teknisk-gaeld.md:432:  1. Opdatér `_anonymize_employee_apply` til at læse begge shapes (legacy flat + nested) via shape-detection
docs/teknisk/teknisk-gaeld.md:435:- **R7h-håndtering:** Test 2 bruger Strategi A (seed legacy flat-shape direkte i anonymization_state) for at isolere R7a regprocedure-fix. Replay-shape-bug testes IKKE i R7h.
supabase/migrations/20260514130001_t2_identity_rpcs.sql:43:create policy role_page_permissions_insert on core_identity.role_page_permissions
supabase/migrations/20260514130001_t2_identity_rpcs.sql:45:  with check (current_setting('stork.allow_role_page_permissions_write', true) = 'true');
supabase/migrations/20260514130001_t2_identity_rpcs.sql:47:create policy role_page_permissions_update on core_identity.role_page_permissions
supabase/migrations/20260514130001_t2_identity_rpcs.sql:49:  using (current_setting('stork.allow_role_page_permissions_write', true) = 'true')
supabase/migrations/20260514130001_t2_identity_rpcs.sql:50:  with check (current_setting('stork.allow_role_page_permissions_write', true) = 'true');
supabase/migrations/20260514130001_t2_identity_rpcs.sql:52:create policy role_page_permissions_delete on core_identity.role_page_permissions
supabase/migrations/20260514130001_t2_identity_rpcs.sql:54:  using (current_setting('stork.allow_role_page_permissions_write', true) = 'true');
supabase/migrations/20260514130001_t2_identity_rpcs.sql:56:grant insert, update, delete on table core_identity.role_page_permissions to authenticated;
supabase/migrations/20260514130001_t2_identity_rpcs.sql:218:returns core_identity.role_page_permissions
supabase/migrations/20260514130001_t2_identity_rpcs.sql:224:  v_row core_identity.role_page_permissions;
supabase/migrations/20260514130001_t2_identity_rpcs.sql:236:  perform set_config('stork.allow_role_page_permissions_write', 'true', true);
supabase/migrations/20260514130001_t2_identity_rpcs.sql:240:  insert into core_identity.role_page_permissions
scripts/fitness.mjs:35:  "public.role_page_permissions",
scripts/fitness.mjs:48:  "core_identity.role_page_permissions",
scripts/fitness.mjs:126:// - commission_snapshots_candidate + salary_corrections_candidate: legacy
scripts/fitness.mjs:139:// R7d-pattern (legacy-is-active-readers) er specifik for tabeller der har
scripts/fitness.mjs:156:  "core_identity.client_field_definitions_list",
scripts/fitness.mjs:157:  "core_identity.clients_validate_fields",
scripts/fitness.mjs:173:  "core_identity.role_page_permissions",
scripts/fitness.mjs:834:async function legacyIsActiveReaders() {
scripts/fitness.mjs:839:      name: "legacy-is-active-readers",
scripts/fitness.mjs:877:        name: "legacy-is-active-readers",
scripts/fitness.mjs:885:      name: "legacy-is-active-readers",
scripts/fitness.mjs:895:  return { name: "legacy-is-active-readers", violations };
scripts/fitness.mjs:1159:  legacyIsActiveReaders,
supabase/migrations/20260514190400_q_hr_rpcs.sql:186:returns core_identity.role_page_permissions
supabase/migrations/20260514190400_q_hr_rpcs.sql:190:  v_row core_identity.role_page_permissions;
supabase/migrations/20260514190400_q_hr_rpcs.sql:203:  perform set_config('stork.allow_role_page_permissions_write', 'true', true);
supabase/migrations/20260514190400_q_hr_rpcs.sql:207:  insert into core_identity.role_page_permissions
supabase/migrations/20260515120100_p3_break_glass_operation_types_lifecycle.sql:232:select set_config('stork.allow_role_page_permissions_write', 'true', false);
supabase/migrations/20260515120100_p3_break_glass_operation_types_lifecycle.sql:236:insert into core_identity.role_page_permissions (role_id, page_key, tab_key, can_view, can_edit, scope)
supabase/migrations/20260521000002_t10_is_permanent_allowed_extend.sql:29:      ('core_identity',   'role_page_permissions',       null::text),
supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql:1:-- Trin 10 T10.13c: REVERSE af T10.13b — fjern legacy role_page_permissions-rows
supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql:3:-- T10.13b tilføjede legacy-rows som workaround for M1-test compatibility.
supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql:4:-- M1-test er nu refactored til at scanne grant-modellen (role_permission_grants)
supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql:5:-- direkte; legacy-rows er ikke længere nødvendige for testen.
supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql:7:-- Per Codex build-review runde 3: legacy-seed var "WORKAROUND-INTRODUCERET"
supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql:8:-- (plan V14 specificerede kun grant-model). Mathias-afgørelse 2026-05-21:
supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql:9:-- fix ordentligt → refactor M1-test + fjern legacy.
supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql:11:-- has_permission har stadig legacy-fallback i sin body, men det er kun fallback;
supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql:12:-- grant-modellen er primær. Legacy-rows for clients/cfd er ikke længere nødvendige.
supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql:15:select set_config('stork.allow_role_page_permissions_write', 'true', false);
supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql:17:  'T10.13c: fjern T10.13b legacy-rows (M1-test refactored til grant-modellen)', false);
supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql:19:delete from core_identity.role_page_permissions
supabase/migrations/20260514130000_t2_superadmin_floor.sql:4:-- role_page_permissions for admin-permission-rækker. Konfig-tabel definerer
supabase/migrations/20260514130000_t2_superadmin_floor.sql:7:-- Mekanik: AFTER-trigger på employees + role_page_permissions tjekker antal
supabase/migrations/20260514130000_t2_superadmin_floor.sql:28:select set_config('stork.change_reason', 'legacy_import_t0: t2 superadmin_settings singleton bootstrap', false);
supabase/migrations/20260514130000_t2_superadmin_floor.sql:71:    join core_identity.role_page_permissions p on p.role_id = e.role_id
supabase/migrations/20260514130000_t2_superadmin_floor.sql:89:  'AFTER-trigger der validerer at antal aktive admins er ≥ superadmin_settings.min_admin_count. Anvendes på employees og role_page_permissions.';
supabase/migrations/20260514130000_t2_superadmin_floor.sql:96:-- ─── Trigger på role_page_permissions: enforce ved ALL mutations ─────────
supabase/migrations/20260514130000_t2_superadmin_floor.sql:98:create trigger role_page_permissions_enforce_admin_floor
supabase/migrations/20260514130000_t2_superadmin_floor.sql:99:  after update or delete on core_identity.role_page_permissions
docs/strategi/bygge-status.md:31:| 14      | Salgs-stamme + legacy_snapshots                                | ⌛ Udestående        | —          | —       | —       |
docs/strategi/bygge-status.md:125:- enforce_admin_floor-trigger på employees + role_page_permissions + roles
docs/strategi/bygge-status.md:186:- `cancellations`-skeleton (immutable, INSERT-only, reason-enum: kunde_annullering/match_rettelse, reverses_cancellation_id self-FK) — ingen RPC'er endnu, kommer trin 16
docs/strategi/bygge-status.md:258:- Migration af role_page_permissions til ny model + has_permission med fallback
docs/strategi/bygge-status.md:311:- `core_identity.clients_validate_fields` BEFORE INSERT/UPDATE-trigger (LENIENT default + strict via session-var).
docs/strategi/bygge-status.md:317:- 11 RPC'er: client_upsert, client_set_active, client_field_definition_upsert (immutable key + pii-downgrade-block), client_field_definition_set_active, client_logo_set/clear/get, client_get, client_list, client_field_definitions_list.
docs/strategi/bygge-status.md:319:- Fitness-script R7d-allowlist udvidet (client_field_definitions_list + clients_validate_fields).
docs/strategi/bygge-status.md:324:- `20260521000001_t10_tables.sql`
docs/strategi/bygge-status.md:325:- `20260521000002_t10_is_permanent_allowed_extend.sql`
docs/strategi/bygge-status.md:326:- `20260521000003_t10_classify.sql`
docs/strategi/bygge-status.md:327:- `20260521000004_t10_audit_filter_values.sql`
docs/strategi/bygge-status.md:328:- `20260521000005_t10_clients_validate_fields.sql`
docs/strategi/bygge-status.md:329:- `20260521000006_t10_seed_permissions.sql`
docs/strategi/bygge-status.md:330:- `20260521000007_t10_client_node_placements_fk.sql`
docs/strategi/bygge-status.md:331:- `20260521000008_t10_client_active_check.sql`
docs/strategi/bygge-status.md:332:- `20260521000009_t10_client_rpcs.sql`
docs/strategi/bygge-status.md:333:- `20260521000010_t10_client_field_definition_rpcs.sql`
docs/strategi/bygge-status.md:334:- `20260521000011_t10_client_logo_rpcs.sql`
docs/strategi/bygge-status.md:335:- `20260521000012_t10_client_read_rpcs.sql`
supabase/migrations/20260511213009_d5_clients.sql:25:-- Validation: clients_validate_fields-trigger logger WARNING ved
supabase/migrations/20260511213009_d5_clients.sql:260:-- Trigger: clients_validate_fields (LENIENT default)
supabase/migrations/20260511213009_d5_clients.sql:263:CREATE OR REPLACE FUNCTION public.clients_validate_fields()
supabase/migrations/20260511213009_d5_clients.sql:293:      RAISE EXCEPTION 'clients_validate_fields: ukendte/inaktive keys i fields: % (stork.clients_fields_strict=true)',
supabase/migrations/20260511213009_d5_clients.sql:297:      RAISE WARNING 'clients_validate_fields: ukendte/inaktive keys i fields (LENIENT - INSERT/UPDATE accepteret): %',
supabase/migrations/20260511213009_d5_clients.sql:306:COMMENT ON FUNCTION public.clients_validate_fields() IS
supabase/migrations/20260511213009_d5_clients.sql:309:CREATE TRIGGER clients_validate_fields
supabase/migrations/20260511213009_d5_clients.sql:311:  FOR EACH ROW EXECUTE FUNCTION public.clients_validate_fields();
supabase/migrations/20260511204529_d4_role_permissions.sql:1:-- D4: roles + role_page_permissions + redefiner is_admin()
supabase/migrations/20260511204529_d4_role_permissions.sql:38:  'D4: roller som samlinger af rettigheder (ikke titler). Hver employee FK til én rolle. Permissions ligger i role_page_permissions. Ingen is_admin-flag på selve rollen — admin defineres som specifik permission (system.manage).';
supabase/migrations/20260511204529_d4_role_permissions.sql:70:-- role_page_permissions tabel
supabase/migrations/20260511204529_d4_role_permissions.sql:73:CREATE TABLE public.role_page_permissions (
supabase/migrations/20260511204529_d4_role_permissions.sql:85:COMMENT ON TABLE public.role_page_permissions IS
supabase/migrations/20260511204529_d4_role_permissions.sql:89:CREATE UNIQUE INDEX role_page_permissions_role_page_tab_unique
supabase/migrations/20260511204529_d4_role_permissions.sql:90:  ON public.role_page_permissions (role_id, page_key, COALESCE(tab_key, ''));
supabase/migrations/20260511204529_d4_role_permissions.sql:92:CREATE INDEX role_page_permissions_role_idx
supabase/migrations/20260511204529_d4_role_permissions.sql:93:  ON public.role_page_permissions (role_id);
supabase/migrations/20260511204529_d4_role_permissions.sql:95:CREATE TRIGGER role_page_permissions_set_updated_at
supabase/migrations/20260511204529_d4_role_permissions.sql:96:  BEFORE UPDATE ON public.role_page_permissions
supabase/migrations/20260511204529_d4_role_permissions.sql:99:CREATE TRIGGER role_page_permissions_audit
supabase/migrations/20260511204529_d4_role_permissions.sql:100:  AFTER INSERT OR UPDATE OR DELETE ON public.role_page_permissions
supabase/migrations/20260511204529_d4_role_permissions.sql:103:ALTER TABLE public.role_page_permissions ENABLE ROW LEVEL SECURITY;
supabase/migrations/20260511204529_d4_role_permissions.sql:104:ALTER TABLE public.role_page_permissions FORCE ROW LEVEL SECURITY;
supabase/migrations/20260511204529_d4_role_permissions.sql:106:CREATE POLICY role_page_permissions_select ON public.role_page_permissions
supabase/migrations/20260511204529_d4_role_permissions.sql:109:CREATE POLICY role_page_permissions_insert ON public.role_page_permissions
supabase/migrations/20260511204529_d4_role_permissions.sql:111:  WITH CHECK (current_setting('stork.allow_role_page_permissions_write', true) = 'true');
supabase/migrations/20260511204529_d4_role_permissions.sql:113:CREATE POLICY role_page_permissions_update ON public.role_page_permissions
supabase/migrations/20260511204529_d4_role_permissions.sql:115:  USING (current_setting('stork.allow_role_page_permissions_write', true) = 'true')
supabase/migrations/20260511204529_d4_role_permissions.sql:116:  WITH CHECK (current_setting('stork.allow_role_page_permissions_write', true) = 'true');
supabase/migrations/20260511204529_d4_role_permissions.sql:118:CREATE POLICY role_page_permissions_delete ON public.role_page_permissions
supabase/migrations/20260511204529_d4_role_permissions.sql:120:  USING (current_setting('stork.allow_role_page_permissions_write', true) = 'true');
supabase/migrations/20260511204529_d4_role_permissions.sql:122:REVOKE ALL ON TABLE public.role_page_permissions FROM PUBLIC, anon;
supabase/migrations/20260511204529_d4_role_permissions.sql:123:GRANT SELECT ON TABLE public.role_page_permissions TO authenticated;
supabase/migrations/20260511204529_d4_role_permissions.sql:152:    JOIN public.role_page_permissions rpp ON rpp.role_id = e.role_id
supabase/migrations/20260511204529_d4_role_permissions.sql:255:  PERFORM set_config('stork.allow_role_page_permissions_write', 'true', true);
supabase/migrations/20260511204529_d4_role_permissions.sql:257:  INSERT INTO public.role_page_permissions
supabase/migrations/20260511204529_d4_role_permissions.sql:272:  'D4: SECURITY DEFINER upsert af role_page_permissions. ON CONFLICT pa (role_id, page_key, tab_key) opdaterer permission-vaerdier. Kraever is_admin().';
supabase/migrations/20260511204529_d4_role_permissions.sql:278:-- Klassifikation: 15 nye rækker (1 ny på employees + 5 roles + 9 role_page_permissions)
supabase/migrations/20260511204529_d4_role_permissions.sql:283:  'D4: seed klassifikation for roles + role_page_permissions + employees.role_id', true);
supabase/migrations/20260511204529_d4_role_permissions.sql:318:  -- role_page_permissions (9 kolonner)
supabase/migrations/20260511204529_d4_role_permissions.sql:319:  ('public', 'role_page_permissions', 'id',
supabase/migrations/20260511204529_d4_role_permissions.sql:323:  ('public', 'role_page_permissions', 'role_id',
supabase/migrations/20260511204529_d4_role_permissions.sql:327:  ('public', 'role_page_permissions', 'page_key',
supabase/migrations/20260511204529_d4_role_permissions.sql:331:  ('public', 'role_page_permissions', 'tab_key',
supabase/migrations/20260511204529_d4_role_permissions.sql:335:  ('public', 'role_page_permissions', 'can_view',
supabase/migrations/20260511204529_d4_role_permissions.sql:339:  ('public', 'role_page_permissions', 'can_edit',
supabase/migrations/20260511204529_d4_role_permissions.sql:343:  ('public', 'role_page_permissions', 'scope',
supabase/migrations/20260511204529_d4_role_permissions.sql:347:  ('public', 'role_page_permissions', 'created_at',
supabase/migrations/20260511204529_d4_role_permissions.sql:351:  ('public', 'role_page_permissions', 'updated_at',
supabase/migrations/20260511204529_d4_role_permissions.sql:364:SELECT set_config('stork.allow_role_page_permissions_write', 'true', true);
supabase/migrations/20260511204529_d4_role_permissions.sql:374:INSERT INTO public.role_page_permissions
docs/strategi/stork-2-0-master-plan.md:77:3. Audit-spor: `source_type='migration'`, `change_reason='legacy_import_t0'`
docs/strategi/stork-2-0-master-plan.md:95:- Importeres som immutable legacy-data i `core_compliance`-schema (se §1.11)
docs/strategi/stork-2-0-master-plan.md:96:- To-tabel-tilgang: `legacy_snapshots` (data) + `legacy_audit` (1.0's audit-historik)
docs/strategi/stork-2-0-master-plan.md:122:- Source-felt: `source='legacy_adversus'` eller `'legacy_enreach'` afhængigt af oprindelse
docs/strategi/stork-2-0-master-plan.md:137:- Hver migration-handling auditeres med `source_type='migration'` + `change_reason='legacy_import_t0'`
docs/strategi/stork-2-0-master-plan.md:139:- 1.0's audit-historik importeres separat til `legacy_audit` — ikke blandes med 2.0's audit_log
docs/strategi/stork-2-0-master-plan.md:331:**legacy_snapshots har per-row audit:** Importerede historiske sales fra 1.0 (`legacy_snapshots` i core_compliance, trin 14) er almindelig data-import, ikke compute-output. De har per-row audit-trigger som almindelige forretnings-tabeller — IKKE samme aggregat-strategi som commission_snapshots. **salary_corrections** følger samme regel: rå data (modpost ved annullering), per-row audit, ikke snapshot-undtagelse.
docs/strategi/stork-2-0-master-plan.md:597:- **core_compliance** — "vi holder styr på det hele": audit-log, klassifikations-registry, klient-felt-definitions, anonymisering-mappings + anonymization_state, heartbeats, AI-instruction-log, break_glass_requests + break_glass_operation_types, `legacy_snapshots` + `legacy_audit` (immutable migration-data fra 1.0)
docs/strategi/stork-2-0-master-plan.md:913:- Felter: positivt beløb (modposterer original negativt), `reverses_cancellation_id` separat FK-felt der peger på original cancellation-row, target_period_id (valgfri åben periode, bruger vælger)
docs/strategi/stork-2-0-master-plan.md:1524:| 14   | Salgs-stamme (sales med client_crm_match_id, sale_items, status-enum, sale_record-RPC, sale_apply_feedback-stub) — stub-versionen håndterer kun `afventer → godkendt` uden basket_correction. Display-navn-konfig-tabel inkluderet **+ migration: legacy_snapshots-tabel i core_compliance + udtræks-SQL for historiske sales + upload-script (bevarer 1.0's commission_snapshot direkte, source='legacy_adversus'/'legacy_enreach')** | core_money + legacy_snapshots i core_compliance                               |
docs/strategi/stork-2-0-master-plan.md:1526:| 16   | Annulleringer + corrections + reversal (reversal som reason='match_rettelse' med reverses_cancellation_id FK)                                                                                                                                                                                                                                                                                                                          | core_money                                                                    |
docs/strategi/stork-2-0-master-plan.md:1548:| 31   | **Cutover-leverancer: legacy_audit-tabel + audit-import-script + cutover-checklist + adapter-re-pointing-procedure**. Eksekveres når Mathias er overbevist efter manuel sammenligning af 2.0's data mod 1.0                                                                                                                                                                                                                            | core_compliance                                                               |
docs/strategi/stork-2-0-master-plan.md:1640:| Cancellation-reversal      | reason='match_rettelse' + reverses_cancellation_id FK. Ingen ny enum-værdi                          |
docs/strategi/stork-2-0-master-plan.md:1792:| Legacy-data placering | `legacy_snapshots` (data) + `legacy_audit` (1.0's audit-historik) i core_compliance, separat fra 2.0's universelle audit_log                                      |
docs/strategi/stork-2-0-master-plan.md:1795:| Audit-spor            | `source_type='migration'` + `change_reason='legacy_import_t0'`                                                                                                    |
docs/strategi/stork-2-0-master-plan.md:1796:| Source-felt på sales  | `legacy_adversus` / `legacy_enreach` for historiske importerede sales                                                                                             |
docs/strategi/stork-2-0-master-plan.md:1906:| 21  | Cancellation-reversal modelleres som reason='match_rettelse' + reverses_cancellation_id FK. Ingen ny enum-værdi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
docs/strategi/stork-2-0-master-plan.md:1917:| 20  | Migration-strategi indlejret: ny §0.5 med grundprincip (udtræk + upload, ikke ETL), Model B modificeret implementation (manuel skygge-sammenligning, ingen adapter-dobbelt-skriv), legacy_snapshots + legacy_audit i core_compliance, migration-leverancer integreret i eksisterende byggetrin (trin 5, 9, 10, 10b, 14, 21) + nyt trin 31 (cutover). Rådata-omfang styres ved import. 1.0's tal bevares uden re-evaluering                                                                                                                                                                                                                                                                                                                                                                                                                                       |
supabase/migrations/20260514120008_t1_classify_trin_1.sql:13:select set_config('stork.change_reason', 'legacy_import_t0: t1 fundament — klassifikation af trin 1-kolonner', false);
supabase/migrations/20260514120008_t1_classify_trin_1.sql:82:  -- core_identity.role_page_permissions
supabase/migrations/20260514120008_t1_classify_trin_1.sql:83:  ('core_identity', 'role_page_permissions', 'id', 'master_data', 'none', null, null, null, 'primær nøgle'),
supabase/migrations/20260514120008_t1_classify_trin_1.sql:84:  ('core_identity', 'role_page_permissions', 'role_id', 'master_data', 'none', null, null, null, 'FK til roles'),
supabase/migrations/20260514120008_t1_classify_trin_1.sql:85:  ('core_identity', 'role_page_permissions', 'page_key', 'master_data', 'none', null, null, null, 'UI-page-identifier'),
supabase/migrations/20260514120008_t1_classify_trin_1.sql:86:  ('core_identity', 'role_page_permissions', 'tab_key', 'master_data', 'none', null, null, null, 'UI-tab-identifier; NULL = hele page'),
supabase/migrations/20260514120008_t1_classify_trin_1.sql:87:  ('core_identity', 'role_page_permissions', 'can_view', 'master_data', 'none', null, null, null, 'læs-rettighed'),
supabase/migrations/20260514120008_t1_classify_trin_1.sql:88:  ('core_identity', 'role_page_permissions', 'can_edit', 'master_data', 'none', null, null, null, 'skriv-rettighed'),
supabase/migrations/20260514120008_t1_classify_trin_1.sql:89:  ('core_identity', 'role_page_permissions', 'scope', 'master_data', 'none', null, null, null, 'all/subtree/team/self'),
supabase/migrations/20260514120008_t1_classify_trin_1.sql:90:  ('core_identity', 'role_page_permissions', 'created_at', 'master_data', 'none', null, null, null, 'oprettelse'),
supabase/migrations/20260514120008_t1_classify_trin_1.sql:91:  ('core_identity', 'role_page_permissions', 'updated_at', 'master_data', 'none', null, null, null, 'sidste opdatering');
supabase/migrations/20260515120000_p2_anonymization_mapping_lifecycle.sql:307:select set_config('stork.allow_role_page_permissions_write', 'true', false);
supabase/migrations/20260515120000_p2_anonymization_mapping_lifecycle.sql:311:insert into core_identity.role_page_permissions (role_id, page_key, tab_key, can_view, can_edit, scope)
supabase/migrations/20260514170003_c001_retention_not_null.sql:20:--   role_page_permissions, anonymization_*,
supabase/migrations/20260514170003_c001_retention_not_null.sql:148:-- roles + role_page_permissions → permanent (rolle-katalog evigt)
supabase/migrations/20260514170003_c001_retention_not_null.sql:152:   and table_name in ('roles', 'role_page_permissions')
supabase/migrations/20260521000001_t10_tables.sql:67:-- SELECT-policy: tab-aware has_permission ('manage'). T10.13 seeder kun
supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql:1:-- Trin 10 T10.13b: seed legacy role_page_permissions for M1-test compatibility
supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql:3:-- T10.13 seeder kun grant-modellen (permission_pages + permission_tabs +
supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql:5:-- kalder has_permission(...) og verificerer at superadmin har row i legacy
supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql:6:-- role_page_permissions-tabel. Uden legacy-row fejler M1-test.
supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql:8:-- Legacy-pattern bevares til M1-test passes; senere kan legacy-rows fjernes
supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql:9:-- når M1-test refactores til at læse grant-modellen direkte (G-nummer-kandidat).
supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql:12:select set_config('stork.allow_role_page_permissions_write', 'true', false);
supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql:14:  'T10.13b: seed legacy role_page_permissions for clients + client_field_definitions (M1-test compat)', false);
supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql:16:insert into core_identity.role_page_permissions
supabase/migrations/20260521000012_t10_client_read_rpcs.sql:6:-- client_field_definitions_list: list felt-definitioner (filter på is_active).
supabase/migrations/20260521000012_t10_client_read_rpcs.sql:9:-- ikke T10.13's tab-grants. SECURITY INVOKER — caller's role + RLS-policy gælder.
supabase/migrations/20260521000012_t10_client_read_rpcs.sql:67:-- ─── client_field_definitions_list: list felt-def ───────────────────────
supabase/migrations/20260521000012_t10_client_read_rpcs.sql:73:create or replace function core_identity.client_field_definitions_list(p_include_inactive boolean default false)
supabase/migrations/20260521000012_t10_client_read_rpcs.sql:79:    raise exception 'client_field_definitions_list: permission_denied' using errcode = '42501';
supabase/migrations/20260521000012_t10_client_read_rpcs.sql:87:comment on function core_identity.client_field_definitions_list(boolean) is
supabase/migrations/20260521000012_t10_client_read_rpcs.sql:90:revoke all on function core_identity.client_field_definitions_list(boolean) from public, anon;
supabase/migrations/20260521000012_t10_client_read_rpcs.sql:91:grant execute on function core_identity.client_field_definitions_list(boolean) to authenticated;
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:3:-- Master-plan §1.7. Etablerer minimum employees + roles + role_page_permissions
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:76:-- ─── core_identity.role_page_permissions ─────────────────────────────────
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:78:create table core_identity.role_page_permissions (
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:90:comment on table core_identity.role_page_permissions is
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:94:create unique index role_page_permissions_unique
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:95:  on core_identity.role_page_permissions (role_id, page_key, coalesce(tab_key, ''));
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:97:alter table core_identity.role_page_permissions enable row level security;
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:98:alter table core_identity.role_page_permissions force row level security;
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:100:revoke all on table core_identity.role_page_permissions from public, anon, service_role;
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:101:grant select on table core_identity.role_page_permissions to authenticated;
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:103:create policy role_page_permissions_select on core_identity.role_page_permissions
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:121:  insert into core_identity.role_page_permissions
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:165:    join core_identity.role_page_permissions p on p.role_id = e.role_id
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:177:-- Vi atter audit på roles, role_page_permissions, employees så fremtidige
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:188:create trigger role_page_permissions_audit
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:189:  after insert or update or delete on core_identity.role_page_permissions
supabase/migrations/20260514120007_t1_bootstrap_admins.sql:197:create trigger role_page_permissions_set_updated_at before update on core_identity.role_page_permissions
supabase/migrations/20260514150003_t7_cancellations_skeleton.sql:8:-- FK på sales aktiveres trin 14. FK på cancellations (reverses_cancellation_id
supabase/migrations/20260514150003_t7_cancellations_skeleton.sql:22:  reverses_cancellation_id uuid references core_money.cancellations(id) on delete restrict,
supabase/migrations/20260514150003_t7_cancellations_skeleton.sql:25:  constraint cancellations_match_rettelse_requires_reverses_or_match check (
supabase/migrations/20260514150003_t7_cancellations_skeleton.sql:26:    reason <> 'match_rettelse' or (reverses_cancellation_id is not null or match_id is not null)
supabase/migrations/20260514150003_t7_cancellations_skeleton.sql:31:  'Master-plan §2.1.3 cancellations skeleton (trin 7). Immutable feedback-tabel for annullerede salg. Faktiske RPC-mekanik + sale_apply_feedback-dispatcher bygges i trin 16. Sales-FK aktiveres trin 14. reason=match_rettelse bruges også som cancellation-reversal med reverses_cancellation_id.';
supabase/migrations/20260514150003_t7_cancellations_skeleton.sql:35:create index cancellations_reverses_idx on core_money.cancellations (reverses_cancellation_id);
supabase/migrations/20260514150003_t7_cancellations_skeleton.sql:45:  raise exception 'cancellations[%]: er immutable — INSERT-only (reversal via ny row med reason=match_rettelse + reverses_cancellation_id)', old.id
supabase/migrations/20260514190100_q_audit_rpcs.sql:4:-- Permissions er UI-baserede via role_page_permissions, ikke is_admin().
docs/coordination/mathias-afgoerelser.md:20:- **Begrundelse:** Andre roller skal være UI-baserede via `role_page_permissions`. Hardkodet `is_admin()` bryder "alt drift styres i UI".
docs/coordination/mathias-afgoerelser.md:209:  - `role_page_permissions` som primær → `role_permission_grants` som primær (legacy bevaret som readonly fallback)
supabase/migrations/20260519000000_m1_t9_superadmin_permissions.sql:29:select set_config('stork.allow_role_page_permissions_write', 'true', false);
supabase/migrations/20260519000000_m1_t9_superadmin_permissions.sql:33:insert into core_identity.role_page_permissions
supabase/migrations/20260514170001_c005_admin_floor_termination.sql:45:    join core_identity.role_page_permissions p on p.role_id = e.role_id
supabase/migrations/20260514190000_q_seed_permissions.sql:18:select set_config('stork.allow_role_page_permissions_write', 'true', false);
supabase/migrations/20260514190000_q_seed_permissions.sql:22:insert into core_identity.role_page_permissions
supabase/migrations/20260514150000_t7_pay_periods.sql:27:select set_config('stork.change_reason', 'legacy_import_t0: t7 pay_period_settings singleton bootstrap', false);
supabase/migrations/20260514150000_t7_pay_periods.sql:295:  perform set_config('stork.change_reason', 'legacy_import_t0: t7 bootstrap first pay_period i core_money', true);
docs/coordination/rapport-historik/2026-05-21-trin-10.md:19:Nye tests: t10_client_lifecycle, t10_client_field_definitions, t10_clients_validate_fields,
docs/coordination/rapport-historik/2026-05-21-trin-10.md:22:Plan-afvigelser: 1 (T10.13b workaround — refactored til grant-model i runde 3)
docs/coordination/rapport-historik/2026-05-21-trin-10.md:33:| T10.1 `core_identity.clients`-tabel                  | leveret | `20260521000001_t10_tables.sql`; t10_client_lifecycle.sql                                  |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:34:| T10.2 `core_identity.client_field_definitions`-tabel | leveret | `20260521000001_t10_tables.sql`; t10_client_field_definitions.sql                          |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:35:| T10.3 `is_permanent_allowed`-allowlist-udvidelse     | leveret | `20260521000002_t10_is_permanent_allowed_extend.sql`                                       |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:36:| T10.4 `data_field_definitions`-klassifikation        | leveret | `20260521000003_t10_classify.sql`; logo_bytes + logo_filename = `direct` (V12)             |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:37:| T10.5 `audit_filter_values` jsonb-walking            | leveret | `20260521000004_t10_audit_filter_values.sql`; t10_clients_validate_fields.sql T4-assertion |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:38:| T10.6 `clients_validate_fields`-trigger              | leveret | `20260521000005_t10_clients_validate_fields.sql`; LENIENT-default verificeret              |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:39:| T10.7 FK `client_node_placements.client_id`          | leveret | `20260521000007_t10_client_node_placements_fk.sql`; t10_client_node_placements_fk.sql      |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:41:| T10.7b aktiv-check (wrapper + apply)                 | leveret | `20260521000008_t10_client_active_check.sql`; t10_client_active_check T2/T3/T5/T6/T7       |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:42:| T10.8 `client_upsert` RPC                            | leveret | `20260521000009_t10_client_rpcs.sql`; t10_client_lifecycle.sql                             |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:43:| T10.9 `client_set_active` RPC                        | leveret | `20260521000009_t10_client_rpcs.sql`                                                       |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:44:| T10.10 `client_field_definition_upsert`              | leveret | `20260521000010_t10_client_field_definition_rpcs.sql`; immutable-key + pii-downgrade-block |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:45:| T10.10a `client_field_definition_set_active`         | leveret | `20260521000010_t10_client_field_definition_rpcs.sql`                                      |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:46:| T10.11 logo-RPC'er (set/clear/get)                   | leveret | `20260521000011_t10_client_logo_rpcs.sql`; t10_client_logo.sql (audit-hash-assertion)      |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:47:| T10.12 read-RPC'er (get/list/list-defs)              | leveret | `20260521000012_t10_client_read_rpcs.sql`                                                  |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:48:| T10.13 grant-model permissions                       | leveret | `20260521000006_t10_seed_permissions.sql` + reverse i `20260521000014`                     |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:62:| WORKAROUND     | T10.13b legacy-seed (post-build M1-test compat)     | 3    | Mathias-gate → refactor til grant-model | mathias-afgoerelser 2026-05-21                     |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:83:- **Hvad:** T10.13b legacy-seed migration tilføjet under build (workaround for M1-test compatibility), efterfølgende fjernet via T10.14c reverse-migration.
docs/coordination/rapport-historik/2026-05-21-trin-10.md:84:- **Hvorfor:** M1-test scannede oprindeligt `role_page_permissions` (legacy); planen specificerede kun grant-model. Codex-runde 3 flaggede som workaround-introduceret.
docs/coordination/rapport-historik/2026-05-21-trin-10.md:86:- **Konsekvens:** M1-test refactored til grant-model + reverse-migration T10.14c sletter legacy-rows. Ingen G-nummer.
docs/coordination/rapport-historik/2026-05-21-trin-10.md:101:  - Princip 2 (rettigheder der virker): grant-model brugt konsistent; `has_permission`-resolver-pattern bevaret.
supabase/migrations/20260514140003_t6_classify.sql:5:select set_config('stork.change_reason', 'legacy_import_t0: t6 anonymisering — klassifikation', false);
supabase/migrations/20260515110100_p1a_anonymization_strategies.sql:249:      ('core_identity',   'role_page_permissions',       null::text),
supabase/migrations/20260515110100_p1a_anonymization_strategies.sql:331:select set_config('stork.allow_role_page_permissions_write', 'true', false);
supabase/migrations/20260515110100_p1a_anonymization_strategies.sql:335:insert into core_identity.role_page_permissions (role_id, page_key, tab_key, can_view, can_edit, scope)
supabase/migrations/20260514180400_d1b_is_permanent_allowed.sql:33:      ('core_identity',   'role_page_permissions',       null::text),
supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:1:-- Trin 9 / §4 trin 9 Step 11: Migration af eksisterende role_page_permissions til ny model.
supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:4:-- eksisterende role_page_permissions. Eksisterende tabel bevares som read-only
supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:36:    select distinct page_key from core_identity.role_page_permissions
supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:81:    from core_identity.role_page_permissions
supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:94:-- ─── Migrér eksisterende role_page_permissions til role_permission_grants ─
supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:103:  for v_row in select * from core_identity.role_page_permissions
supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:144:-- role_page_permissions (legacy read-only). Fallback fjernes når sidste
supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:201:  -- Fallback til legacy role_page_permissions (G-nummer for senere pakke-drop).
supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:203:  from core_identity.role_page_permissions
supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:219:  'T9 Step 11 V6 Valg 11: opdateret med role_permission_grants som primær + fallback til legacy role_page_permissions. Fallback fjernes når alle konsumenter er migreret (G-nummer for senere pakke).';
supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:221:-- ─── Gør legacy role_page_permissions read-only ─────────────────────────
supabase/migrations/20260515110000_p0_gdpr_responsible_employee.sql:33:    join core_identity.role_page_permissions p on p.role_id = e.role_id
supabase/migrations/20260515110000_p0_gdpr_responsible_employee.sql:63:       join core_identity.role_page_permissions p on p.role_id = e.role_id
supabase/migrations/20260515110000_p0_gdpr_responsible_employee.sql:143:select set_config('stork.allow_role_page_permissions_write', 'true', false);
supabase/migrations/20260515110000_p0_gdpr_responsible_employee.sql:147:insert into core_identity.role_page_permissions (role_id, page_key, tab_key, can_view, can_edit, scope)
docs/coordination/arkiv/trin-10-plan.md:43:| 1   | KRITISK           | Fundament-tjek               | Tabellen nævner kun T10.8/T10.9/T10.10/T10.11 + T10.13. V10 tilføjer/ændrer write-veje i T10.7b (`client_node_place`, `client_node_close`, `_apply_client_place`) + T10.10a (`client_field_definition_set_active`) — manglende krydstjek. | **ACCEPT.** Fundament-tjek-tabel udvidet med T10.7b (GRANT/policy/session-var + apply-dispatch + jsonb payload producer/consumer) og T10.10a. Eksempel-row-tjek udvidet med immutable-key + pii-downgrade-block + active-check. |
docs/coordination/arkiv/trin-10-plan.md:69:| 2   | G-NUMMER-KANDIDAT → ADOPT | T10.13                     | Tab/grant-INSERT-queries filtrerer på `p.name in ('clients', 'client_field_definitions')` uden at scope til `org_structure`-area. Hvis nogen senere tilføjer page med samme navn i andet area (usandsynligt, men ikke robust).                                                                                                                                                                                                                                                                                                                                                                                                                                        | **ADOPT.** Trivielt fix: scope queries til `org_structure`-area via JOIN på area_id.                                                                                                                                                                                                                                                                                                                                                                                                    | T10.13         |
docs/coordination/arkiv/trin-10-plan.md:83:| 1   | KRITISK  | T10.6                  | `clients_validate_fields()` trigger-funktion har `cfd.is_active = true` filter. Rammer fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`). T10.16 allowlister kun `client_field_definitions_list`.                                                                    | Codex runde 7     | **ACCEPT.** Udvid T10.16 med `core_identity.clients_validate_fields`. Forretningsmæssigt korrekt at filtrere på aktive felt-definitioner i validate-trigger (LENIENT: ukendte/inaktive keys → warning) — det er ikke R7d-pattern (employees-dual-column), bare lifecycle-signal. |
docs/coordination/arkiv/trin-10-plan.md:93:- migration-set-config-discipline: T10.4 + T10.13 sætter source_type + change_reason korrekt
docs/coordination/arkiv/trin-10-plan.md:125:| 3   | KRITISK/FUNKTIONELT | T10.1 + T10.2 + T10.8 + T10.9 + T10.11 + T10.12 | `has_permission(p_page, NULL, false)` med `p_tab_key=NULL` springer tab-resolver over (`20260518000010_t9_seed_owners.sql:35`) og prøver kun page/area-grants. T10.13 seeder kun TAB-grants → read-paths matcher INGEN grant og returnerer false → SELECT-policy + read-RPC'er tilbageholder data for legitime brugere med kun `clients/manage`-grant. | Mathias-terminal | **ACCEPT.** Skift alle read-paths til tab-aware: `has_permission('clients', 'manage', false)` og `has_permission('client_field_definitions', 'manage', false)`. Berører SELECT-policies (T10.1 + T10.2), client_get/client_list/client_field_definitions_list (T10.12), client_logo_get (T10.11). Write-paths bruger allerede 'manage' tab — konsistent.                                               |
docs/coordination/arkiv/trin-10-plan.md:126:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/arkiv/trin-10-plan.md:127:| 5   | KRITISK             | T10.12 client_field_definitions_list            | RPC bruger `where p_include_inactive or is_active = true` — matcher fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`) regex. client_field_definitions har KUN is_active (ingen status-kolonne), så funktionen skal allowlist'es i `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS`.                                                          | Code-validering  | **ACCEPT.** Tilføj `core_identity.client_field_definitions_list` til allowlisten via T10.16's fitness-script-ændring.                                                                                                                                                                                                                                                                                  |
docs/coordination/arkiv/trin-10-plan.md:150:| 1   | KRITISK  | T10.13  | T10.13 sætter `stork.source_type` + `stork.change_reason` men IKKE `stork.t9_write_authorized = 'true'` som T9-supplements INSERT-policies på `permission_pages` / `permission_tabs` / `role_permission_grants` kræver. Brudt niveau 1-prefix end-to-end-tjek for INSERT/UPDATE/DELETE-veje (GRANT + policy + session-var-tre-pak). | **ACCEPT.** Tilføj `select set_config('stork.t9_write_authorized', 'true', false);` før INSERTs i T10.13. Opdater Fundament-tjek-tabel. | T10.13 + Fundament-tjek |
docs/coordination/arkiv/trin-10-plan.md:191:| T1-drop af D5's public-schema                                                                          | `supabase/migrations/20260514120000_t1_drop_public.sql:32-92`                                                  | Dropper `public.clients`, `public.client_field_definitions`, `public.client_upsert`, `public.client_field_definition_upsert`, `public.clients_validate_fields`, `public.audit_filter_values`, `public.is_admin()`, `public.stork_audit()` etc. INGEN post-T1 migration genskaber clients.                                                                                                               |
docs/coordination/arkiv/trin-10-plan.md:207:| `core_identity.has_permission(p_page_key, p_tab_key default null, p_can_edit default false) → boolean` | `supabase/migrations/20260518000010_t9_seed_owners.sql:15-80`                                                  | Tab → page → area → legacy `role_page_permissions` fallback. STABLE SECURITY INVOKER.                                                                                                                                                                                                                                                                                                                   |
docs/coordination/arkiv/trin-10-plan.md:209:| `core_identity.permission_areas` seedede rækker                                                        | `supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:14-24`                                | identity (1), permissions (2), org_structure (3), compliance (10), audit (11), anonymization (12), break_glass (13), operations (20), system (99). `client_placements` ligger i `org_structure`.                                                                                                                                                                                                        |
docs/coordination/arkiv/trin-10-plan.md:212:| `core_identity.role_permission_grants` (role + en af area_id/page_id/tab_id)                           | `supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:94-140` + grant-tabellen i T9 Step 7  | Primær grant-tabel. has_permission læser herfra først. ON CONFLICT-key: `(role_id, coalesce(area_id::text,''), coalesce(page_id::text,''), coalesce(tab_id::text,''))`.                                                                                                                                                                                                                                 |
docs/coordination/arkiv/trin-10-plan.md:219:| `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` i fitness-script                                                   | `scripts/fitness.mjs:149-154`                                                                                  | Allowlist for funktioner der bruger `is_active = true` filter uden tilsvarende `status = 'active'`-check. Trin 10 tilføjer `core_identity.client_field_definitions_list` (T10.16) fordi `client_field_definitions` har kun is_active, ingen status-kolonne. **FK_COVERAGE_EXEMPTIONS findes IKKE** — master-plan §3.19 ikke implementeret (V6-fund #4).                                                 |
docs/coordination/arkiv/trin-10-plan.md:244:- SECURITY DEFINER RPC'er: client_upsert (uden logo), client_set_active, client_field_definition_upsert (uden p_match_role), client_logo_set, client_logo_clear, client_logo_get, client_get, client_list, client_field_definitions_list
docs/coordination/arkiv/trin-10-plan.md:245:- `clients_validate_fields`-trigger (LENIENT-default + strict via session-var)
docs/coordination/arkiv/trin-10-plan.md:246:- Seed permissions i grant-modellen (`permission_pages` + `permission_tabs` + `role_permission_grants` under `org_structure`-area)
docs/coordination/arkiv/trin-10-plan.md:248:- Fitness-script-opdatering (tilføj `client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS`)
docs/coordination/arkiv/trin-10-plan.md:295:  - **Plan-konsekvens:** core_identity-placering; grant-model frem for legacy; T9-supplement-policy uændret; alle nye RPC'er bruger has_permission.
docs/coordination/arkiv/trin-10-plan.md:381:  -- page/area-resolver, men T10.13 seeder kun tab-grants → ingen match. 'manage' matcher.
docs/coordination/arkiv/trin-10-plan.md:399:- **Afhængigheder:** T1 (core_identity schema), T1 (stork_audit + set_updated_at), T9 (has_permission), T10.13 (permission-seed skal være på plads så SELECT-policy ikke tilbageholder).
docs/coordination/arkiv/trin-10-plan.md:469:- **Afhængigheder:** T1 (core_identity), T1 (triggers), T9 (has_permission), T10.13
docs/coordination/arkiv/trin-10-plan.md:499:        ('core_identity',   'role_page_permissions',       null::text),
docs/coordination/arkiv/trin-10-plan.md:710:### T10.6 — `clients_validate_fields`-trigger (LENIENT default)
docs/coordination/arkiv/trin-10-plan.md:717:  create or replace function core_identity.clients_validate_fields()
docs/coordination/arkiv/trin-10-plan.md:744:        raise exception 'clients_validate_fields: ukendte/inaktive keys i fields: % (stork.clients_fields_strict=true)',
docs/coordination/arkiv/trin-10-plan.md:747:        raise warning 'clients_validate_fields: ukendte/inaktive keys i fields (LENIENT - INSERT/UPDATE accepteret): %',
docs/coordination/arkiv/trin-10-plan.md:756:  comment on function core_identity.clients_validate_fields() is
docs/coordination/arkiv/trin-10-plan.md:759:  create trigger clients_validate_fields
docs/coordination/arkiv/trin-10-plan.md:761:    for each row execute function core_identity.clients_validate_fields();
docs/coordination/arkiv/trin-10-plan.md:837:      join core_identity.role_page_permissions p on p.role_id = e.role_id
docs/coordination/arkiv/trin-10-plan.md:1109:- **Afhængigheder:** T10.1, T10.13 (permission-row seeded)
docs/coordination/arkiv/trin-10-plan.md:1152:- **Afhængigheder:** T10.1, T10.13
docs/coordination/arkiv/trin-10-plan.md:1244:- **Afhængigheder:** T10.2, T10.13
docs/coordination/arkiv/trin-10-plan.md:1287:- **Afhængigheder:** T10.2, T10.13
docs/coordination/arkiv/trin-10-plan.md:1384:- **Afhængigheder:** T10.1 (logo-kolonner + consistency-CHECK), T10.13
docs/coordination/arkiv/trin-10-plan.md:1388:### T10.12 — Read-RPC'er (`client_get`, `client_list`, `client_field_definitions_list`)
docs/coordination/arkiv/trin-10-plan.md:1438:  create or replace function core_identity.client_field_definitions_list(p_include_inactive boolean default false)
docs/coordination/arkiv/trin-10-plan.md:1444:      raise exception 'client_field_definitions_list: permission_denied' using errcode = '42501';
docs/coordination/arkiv/trin-10-plan.md:1454:  revoke all on function core_identity.client_field_definitions_list(boolean) from public, anon;
docs/coordination/arkiv/trin-10-plan.md:1457:  grant execute on function core_identity.client_field_definitions_list(boolean) to authenticated;
docs/coordination/arkiv/trin-10-plan.md:1460:- **Afhængigheder:** T10.1, T10.2, T10.13
docs/coordination/arkiv/trin-10-plan.md:1464:### T10.13 — Seed permissions i grant-modellen
docs/coordination/arkiv/trin-10-plan.md:1473:    'T10.13: seed permissions for trin 10 RPCs i grant-modellen', false);
docs/coordination/arkiv/trin-10-plan.md:1514:- **Afhængigheder:** T9 migration 9 (grant-modellen + `org_structure`-area), T9 (`superadmin`-rolle)
docs/coordination/arkiv/trin-10-plan.md:1539:  | `supabase/tests/smoke/t10_client_field_definitions.sql`                                     | client_field_definition_upsert (INSERT + UPDATE), is_active toggle, client_field_definitions_list respekterer p_include_inactive. **Audit-PII-hashing:** insert med pii_level='direct' key i fields → audit_log har sha256-hash. **V3 (Codex V2 KRITISK-SIKKERHEDSHUL):** UPDATE af `key` afvises (errcode 22023). UPDATE af pii_level direct → none afvises (errcode 22023). pii_level none → indirect → direct accepteres. **V8 (Code walk-through #3+#4):** assert client_field_definition_upsert UPDATE rør IKKE is_active. client_field_definition_set_active toggles is_active uafhængigt.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
docs/coordination/arkiv/trin-10-plan.md:1542:  | `supabase/tests/smoke/t10_clients_validate_fields.sql`                                      | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
docs/coordination/arkiv/trin-10-plan.md:1545:- **Afhængigheder:** alle migrations i T10.1-T10.13 + T10.7b for active_check-test
docs/coordination/arkiv/trin-10-plan.md:1554:  2. **R7d-allowlist (KRÆVET):** Tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (`scripts/fitness.mjs:149-154`). RPC'en bruger `where p_include_inactive or is_active = true` for at filtrere aktive felt-definitioner. `client_field_definitions` har KUN is_active (ingen status-kolonne) — matcher allowliste-kommentaren: "T9-tabellerne har is_active som lifecycle-signal alene; ingen status-kolonne. Disse er allowlist'et nedenfor."
docs/coordination/arkiv/trin-10-plan.md:1564:    "core_identity.client_field_definitions_list", // V6 — T10.12 RPC; client_field_definitions har kun is_active, ingen status
docs/coordination/arkiv/trin-10-plan.md:1565:    "core_identity.clients_validate_fields", // V8 (Codex runde 7) — T10.6 trigger-funktion; filtrerer på aktive felt-definitioner som lifecycle-signal
docs/coordination/arkiv/trin-10-plan.md:1570:- **Afhængigheder:** T10.12 (`client_field_definitions_list`-RPC skal eksistere så allowlist-entry refererer reel funktion)
docs/coordination/arkiv/trin-10-plan.md:1579:| Hver write-RPC har GRANT + INSERT/UPDATE-policy + session-var  | ja     | T10.8/T10.9/T10.10/T10.10a/T10.11 — `stork.allow_clients_write` / `allow_client_field_definitions_write` + `revoke/grant execute` + has_permission('manage', true). **T10.7b** (`client_node_place` + `client_node_close` + `_apply_client_place`) — `stork.t9_write_authorized = 'true'` før `pending_change_request` (V9-fix); apply-handler tjekker eksistens (P0002) + aktiv (P0001) med employee-id-baseret admin-bypass (V10-fix); pending_change_apply-dispatcher (T9-supplement) cases `client_place` + `client_close` ramt automatisk. **T10.13** (permission-seed) — `stork.t9_write_authorized` (V4-fix) som krævet af T9-supplement's INSERT-policies på permission_pages/tabs/role_permission_grants. Default-privileges på `core_identity` schema (T1: `grant execute on functions to authenticated`) dækker GRANT for alle T10-RPC'er. |
docs/coordination/arkiv/trin-10-plan.md:1580:| Hver SELECT-policy bred nok til legitime læsere                | ja     | T10.1, T10.2 — has_permission('clients'/'client_field_definitions', 'manage', false) **tab-aware (V6-fix)**. T10.13 seeder kun tab-grants → null-tab matcher ikke; 'manage' matcher. T9-supplement's ACL-scoped policy på client_node_placements bevares uændret.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
docs/coordination/arkiv/trin-10-plan.md:1594:| `t10_clients_validate_fields.sql`   | LENIENT-default WARN; strict-mode raise                                                                               | grøn             |
docs/coordination/arkiv/trin-10-plan.md:1615:  - clients_validate_fields-trigger med LENIENT-default + strict-via-session-var
docs/coordination/arkiv/trin-10-plan.md:1642:| T10.6 (clients_validate_fields trigger) | Trigger blokerer legitime writes                                    | lav (LENIENT-default)                                                                  | drop trigger + function     |
docs/coordination/arkiv/trin-10-plan.md:1646:| T10.13 (permission-seed)                | INSERT fejler pga. manglende area/role                              | lav (T9-migration 9 har seedede); ON CONFLICT idempotent                               | DELETE i omvendt rækkefølge |
docs/coordination/arkiv/trin-10-plan.md:1651:**Kompensation generelt:** Hver migration er separat fil. Rækkefølge: tabeller (T10.1, T10.2) → klassifikation-grundlag (T10.3, T10.4) → audit/validate (T10.5, T10.6) → FK med test-fix (T10.7a → T10.7) → RPC'er (T10.8-T10.12) → permission-seed (T10.13) → docs + tests + fitness (T10.14-T10.16). Hver checkpoint kan testes isoleret.
docs/coordination/arkiv/trin-10-plan.md:1735:- T10.13 robusthed: tab/grant-INSERT-queries scope'es til `org_structure`-area via JOIN på area_id (Codex G-NUMMER → ADOPT).
docs/coordination/arkiv/trin-10-plan.md:1740:- T10.16 udvidet: `core_identity.clients_validate_fields` tilføjet til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Codex runde 7 KRITISK).
docs/coordination/arkiv/trin-10-plan.md:1758:- T10.1 + T10.2 SELECT-policies + T10.11 client_logo_get + T10.12 read-RPC'er: alle skiftet fra `has_permission(p, null, false)` til `has_permission(p, 'manage', false)` — tab-aware. T10.13 seeder kun tab-grants så null-tab matcher ikke (Mathias #3).
docs/coordination/arkiv/trin-10-plan.md:1760:- T10.16 omformuleret: `FK_COVERAGE_EXEMPTIONS` findes ikke i nuværende fitness-script (master-plan §3.19 ikke implementeret); plan tilføjer i stedet `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Code-validering #4 + #5). G-nummer for FK-coverage-check.
docs/coordination/arkiv/trin-10-plan.md:1768:- T10.13: tilføjet `set_config('stork.t9_write_authorized', 'true', false)` før INSERTs — krævet af T9-supplement's INSERT-policies på permission_pages/tabs/role_permission_grants (Codex V3 KRITISK).
docs/coordination/arkiv/trin-10-plan.md:1769:- Fundament-tjek-tabel udvidet med T10.13's session-var-disciplin.
docs/coordination/arkiv/trin-10-plan.md:1793:- Grant-modellen seedes (ikke legacy role_page_permissions)
supabase/migrations/20260514120002_t1_helpers_stubs.sql:6:-- Stubs i trin 1 fordi employees-tabel og role_page_permissions først
supabase/migrations/20260514120002_t1_helpers_stubs.sql:44:  'Trin 1 stub: returnerer false. Redefineres i bootstrap (t1_08) til at læse core_identity.role_page_permissions.';
supabase/migrations/20260514180300_q1_employee_active_config.sql:120:    join core_identity.role_page_permissions p on p.role_id = e.role_id
supabase/migrations/20260514180300_q1_employee_active_config.sql:138:    join core_identity.role_page_permissions p on p.role_id = e.role_id
supabase/migrations/20260514180300_q1_employee_active_config.sql:162:    join core_identity.role_page_permissions p on p.role_id = e.role_id
supabase/migrations/20260514180300_q1_employee_active_config.sql:220:select set_config('stork.allow_role_page_permissions_write', 'true', false);
supabase/migrations/20260514180300_q1_employee_active_config.sql:224:insert into core_identity.role_page_permissions (role_id, page_key, tab_key, can_view, can_edit, scope)
supabase/migrations/20260521000008_t10_client_active_check.sql:32:    join core_identity.role_page_permissions p on p.role_id = e.role_id
supabase/migrations/20260515100100_r6_drop_legacy_candidate_tables.sql:1:-- R6: drop legacy candidate-tabeller efter R3 UPDATE-flag-refactor.
supabase/migrations/20260515100100_r6_drop_legacy_candidate_tables.sql:24:  'R6: deaktivér legacy candidate-runs før DROP TABLE candidate-tables', false);
supabase/migrations/20260521000006_t10_seed_permissions.sql:1:-- Trin 10 T10.13: seed permissions i grant-modellen
supabase/migrations/20260521000006_t10_seed_permissions.sql:6:-- V6 fix (Code-validering #5): legacy role_page_permissions seedes IKKE.
supabase/migrations/20260521000006_t10_seed_permissions.sql:8:-- er primær fra T9; legacy er kun fallback.
supabase/migrations/20260521000006_t10_seed_permissions.sql:19:  'T10.13: seed permissions for trin 10 RPCs i grant-modellen', false);
supabase/migrations/20260514120001_t1_schemas_and_defaults.sql:17:  'Compliance og governance: audit, klassifikation, anonymization_state, heartbeats, break_glass_requests, legacy_snapshots, legacy_audit. Master-plan §1.11.';
supabase/migrations/20260514150009_t7_classify.sql:8:select set_config('stork.change_reason', 'legacy_import_t0: t7+7b+7c — klassifikation af periode + break-glass-kolonner', false);
supabase/migrations/20260514150009_t7_classify.sql:65:  ('core_money', 'cancellations', 'reverses_cancellation_id', 'master_data', 'none', null, null, null, 'self-FK for cancellation-reversal (master-plan §2.1.3)'),
supabase/migrations/20260514180200_h1_has_permission_helper.sql:28:-- - role_page_permissions_unique (role_id, page_key, coalesce(tab_key, ''))
supabase/migrations/20260514180200_h1_has_permission_helper.sql:46:    join core_identity.role_page_permissions p on p.role_id = e.role_id
supabase/migrations/20260514140000_t6_anonymization_tables.sql:134:select set_config('stork.change_reason', 'legacy_import_t0: t6 anonymisering — seed mapping for employees', false);
supabase/migrations/20260521000005_t10_clients_validate_fields.sql:1:-- Trin 10 T10.6: clients_validate_fields BEFORE INSERT/UPDATE-trigger
supabase/migrations/20260521000005_t10_clients_validate_fields.sql:14:create or replace function core_identity.clients_validate_fields()
supabase/migrations/20260521000005_t10_clients_validate_fields.sql:41:      raise exception 'clients_validate_fields: ukendte/inaktive keys i fields: % (stork.clients_fields_strict=true)',
supabase/migrations/20260521000005_t10_clients_validate_fields.sql:44:      raise warning 'clients_validate_fields: ukendte/inaktive keys i fields (LENIENT - INSERT/UPDATE accepteret): %',
supabase/migrations/20260521000005_t10_clients_validate_fields.sql:53:comment on function core_identity.clients_validate_fields() is
supabase/migrations/20260521000005_t10_clients_validate_fields.sql:56:create trigger clients_validate_fields
supabase/migrations/20260521000005_t10_clients_validate_fields.sql:58:  for each row execute function core_identity.clients_validate_fields();
supabase/migrations/20260515130200_r7c_verify_anonymization_consistency_permission.sql:82:select set_config('stork.allow_role_page_permissions_write', 'true', false);
supabase/migrations/20260515130200_r7c_verify_anonymization_consistency_permission.sql:86:insert into core_identity.role_page_permissions (role_id, page_key, tab_key, can_view, can_edit, scope)
supabase/migrations/20260514150008_t7c_break_glass.sql:75:select set_config('stork.change_reason', 'legacy_import_t0: t7c — seed break_glass operation_types', false);
supabase/migrations/20260514120000_t1_drop_public.sql:38:drop table if exists public.role_page_permissions cascade;
supabase/migrations/20260514120000_t1_drop_public.sql:61:drop function if exists public.clients_validate_fields() cascade;
supabase/migrations/20260511152603_c2_audit_template.sql:201:  -- → ingen kan læse indtil lag D låser op via role_page_permissions).
supabase/migrations/20260515130100_r7b_has_permission_can_view_required.sql:26:    join core_identity.role_page_permissions p on p.role_id = e.role_id
supabase/migrations/20260515090000_r3_r4_commission_snapshots_update_flag.sql:5:-- Pre-R3 (legacy): compute_candidate INSERT'er til commission_snapshots_candidate;
supabase/migrations/20260515090000_r3_r4_commission_snapshots_update_flag.sql:34:-- Index-navn er kollisions-sikkert (legacy commission_snapshots_candidate
supabase/migrations/20260514130002_t2_classify.sql:7:select set_config('stork.change_reason', 'legacy_import_t0: t2 identitet del 1 — klassifikation af superadmin_settings', false);
supabase/migrations/20260511151815_c1_rls_helpers_stub.sql:3:-- Lag D omdefinerer disse til at læse fra employees + role_page_permissions.
supabase/migrations/20260511151815_c1_rls_helpers_stub.sql:45:  -- Stub: false indtil lag D introducerer role_page_permissions.
supabase/migrations/20260512212115_d7_teams_org_units.sql:11:--   role_page_permissions scope CHECK udvides med 'subtree'
supabase/migrations/20260512212115_d7_teams_org_units.sql:350:-- ALTER role_page_permissions: udvid scope-enum med 'subtree'
supabase/migrations/20260512212115_d7_teams_org_units.sql:353:ALTER TABLE public.role_page_permissions
supabase/migrations/20260512212115_d7_teams_org_units.sql:354:  DROP CONSTRAINT role_page_permissions_scope_check;
supabase/migrations/20260512212115_d7_teams_org_units.sql:355:ALTER TABLE public.role_page_permissions
supabase/migrations/20260512212115_d7_teams_org_units.sql:356:  ADD CONSTRAINT role_page_permissions_scope_check
supabase/migrations/20260518000010_t9_seed_owners.sql:70:  -- Fallback til legacy role_page_permissions.
supabase/migrations/20260518000010_t9_seed_owners.sql:72:  from core_identity.role_page_permissions

codex
De centrale dokument- og kodepåstande matcher indtil videre: 14 T10-migrations findes inkl. legacy-reverse, G057/G058 er registreret, og `seneste-rapport`/`aktiv-plan` peger på rapporten. Jeg kører fitness lokalt for at validere den rapporterede grønne disciplinstatus mod nuværende checkout.
exec
/bin/bash -lc 'pnpm fitness' in /home/mathias/stork-2.0
 succeeded in 11298ms:

> stork-2.0@0.0.0 fitness /home/mathias/stork-2.0
> node scripts/fitness.mjs

✓ no-ts-ignore
✓ eslint-disable-justified
✓ migration-naming
✓ workspace-boundaries
✓ no-hardcoded-supabase-urls
✓ migration-set-config-discipline
✓ dedup-key-or-opt-out
✓ truncate-blocked-on-immutable
✓ cron-change-reason
✓ audit-trigger-coverage
✓ migration-on-conflict-discipline
✓ db-rls-policies
✓ write-policy-session-var-consistency
✓ legacy-is-active-readers
✓ db-test-tx-wrap-on-immutable-insert
✓ db-test-no-disabled-sql
✓ db-test-no-t9-seed-user-fixtures
✓ db-test-no-t9-skip-guards
✓ postgrest-t9-schema-exposure

Fitness: all checks passed

exec
/bin/bash -lc "sed -n '280,350p' docs/strategi/bygge-status.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
8. classify retention_value format ({days} → {max_days}) (PR #40, ramte alle 84 rows)

**Codex review-runder:**

- Runde 1 (diagnose): 4 KRITISK + 3 MELLEM fund identificeret efter første build-PR
- Runde 2 (verifikation): T9-omstart-rammen (mathias-afgoerelser 2026-05-17) etableret som korrekt fundament
- Runde 3 (PR #39 review): 2 KRITISK fund — manglende GRANTs + SELECT-policy blokerer dispatcher
- Runde 4 (PR #39 final): APPROVAL

**Disciplin-afvigelser (alle Mathias-godkendt):**

- 3 admin-merges med rød CI (PR #36-38) — chicken-and-egg-state hvor DB-tests fejlede pga. partial T9-deploy
- Vej B i PR #40 (ret Step 13 direkte i append-only-fil): tilladt fordi filen aldrig var applied til remote (atomic rollback)

**Verifikation:** Alle fitness-checks grøn. Migration-gate Phase 2: alle 91 migrations grøn (448 kolonner i union-tjek). Remote `data_field_definitions`: 286 klassificerede rows (202 pre-T9 + 84 T9). Remote DB state matcher repo state per `supabase migration list`.

**G-numre rejst:** Se `docs/teknisk/teknisk-gaeld.md` G046-G052 (T9-build disciplin-læringer).

---

### Vores trin 6 — Klient-skabelon (§4 trin 10)

**Status: godkendt 2026-05-21**

**Leverancer:**

- `core_identity.clients` greenfield (T1 droppede D5's `public.clients`): id, name, fields jsonb, is_active, logo (bytea+content_type+filename), timestamps. Consistency-CHECK på logo (alle tre eller intet). jsonb-object-CHECK på fields. FORCE RLS + tab-aware SELECT-policy + INSERT/UPDATE-policies med session-var. DML-GRANT til authenticated.
- `core_identity.client_field_definitions` global registry: key UNIQUE, display_name, field_type, required, pii_level (none/indirect/direct), display_order, is_active.
- `core_compliance.is_permanent_allowed` udvidet med 2 nye tabeller (17 entries total).
- Klassifikation (19 kolonner) i `core_compliance.data_field_definitions`. logo_bytes + logo_filename pii_level='direct' (V12 KRITISK-SIKKERHEDSHUL).
- `core_compliance.audit_filter_values` omskrevet med clients-fields-jsonb-walking. Hashes ALLE direct-PII keys uanset is_active (V2 KRITISK-SIKKERHEDSHUL: forhindrer datalæk ved felt-deaktivering).
- `core_identity.clients_validate_fields` BEFORE INSERT/UPDATE-trigger (LENIENT default + strict via session-var).
- T9-permission-seed: 2 pages (clients + client_field_definitions) under org_structure-area + manage-tab + superadmin grants.
- FK `core_identity.client_node_placements.client_id` → `core_identity.clients(id)` ON DELETE RESTRICT.
- T9-smoke-tests opdateret med clients-fixture (T10.7a).
- Ny helper `core_identity.is_admin_by_employee_id(p_employee_id uuid)` — admin-tjek via employee-id for cron-apply-context.
- `client_node_place` + `client_node_close` + `_apply_client_place` CREATE OR REPLACE med klient-eksistens-check (krav-dok §3.4) + aktiv-check (krav-dok §2.5.2) + superadmin-bypass (employee-id-baseret for apply-cron-context).
- 11 RPC'er: client_upsert, client_set_active, client_field_definition_upsert (immutable key + pii-downgrade-block), client_field_definition_set_active, client_logo_set/clear/get, client_get, client_list, client_field_definitions_list.
- Master-plan §1.8 + §4 trin 10 rettet (V36 i Appendix C).
- Fitness-script R7d-allowlist udvidet (client_field_definitions_list + clients_validate_fields).
- 6 smoke-tests dækker lifecycle + felt-def + logo + FK + validate_fields + active_check.

**Migrations (12):**

- `20260521000001_t10_tables.sql`
- `20260521000002_t10_is_permanent_allowed_extend.sql`
- `20260521000003_t10_classify.sql`
- `20260521000004_t10_audit_filter_values.sql`
- `20260521000005_t10_clients_validate_fields.sql`
- `20260521000006_t10_seed_permissions.sql`
- `20260521000007_t10_client_node_placements_fk.sql`
- `20260521000008_t10_client_active_check.sql`
- `20260521000009_t10_client_rpcs.sql`
- `20260521000010_t10_client_field_definition_rpcs.sql`
- `20260521000011_t10_client_logo_rpcs.sql`
- `20260521000012_t10_client_read_rpcs.sql`

**G-numre rejst:** G057 (T9 forretnings-invariants uden superadmin-bypass), G058 (FK-coverage-fitness-check ikke implementeret per master-plan §3.19).

**Plan-rejse:** 14 Codex-runder + 13+ Code walk-through-passes. Codex V5 gav falsk-positiv APPROVAL (Mathias-terminal-review + Code-validering fandt 6 fund). V14 verificeret med konsekvent Codex APPROVAL + Code walk-through konfirmeret krav-dok-konform § for §.

---

## Næste op

Trin 10 afsluttet. Næste pakke afventer Mathias-valg.

exec
/bin/bash -lc 'tail -n 80 docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md' in /home/mathias/stork-2.0
 succeeded in 0ms:
      'permanent', null, null, 'Aktiv-flag; false = inaktiv (historik bevares)'),
    ('core_identity', 'clients', 'logo_bytes',        'master_data', 'direct',
      'permanent', null, null, 'Klient-logo binær (bytea). V12 (Codex runde 11): direct fordi binær billed-data kan vise stifter/medarbejdere — hashes i audit via T1''s direct-PII-logik'),
    ('core_identity', 'clients', 'logo_content_type', 'master_data', 'none',
      'permanent', null, null, 'MIME-type for logo (image/png, image/svg+xml osv.) — ingen PII'),
    ('core_identity', 'clients', 'logo_filename',     'master_data', 'direct',
      'permanent', null, null, 'Original filnavn ved upload. V12 (Codex runde 11 KRITISK-SIKKERHEDSHUL): direct fordi filnavne kan indeholde klient-/person-identifikatorer; hashes i audit'),
    ('core_identity', 'clients', 'created_at',        'master_data', 'none',
      'permanent', null, null, 'INSERT-tid'),
    ('core_identity', 'clients', 'updated_at',        'master_data', 'none',
      'permanent', null, null, 'Sidste mutation'),
    -- core_identity.client_field_definitions (10 kolonner)
    ('core_identity', 'client_field_definitions', 'id',            'konfiguration', 'none',
      'permanent', null, null, 'Field-definition PK'),
    ('core_identity', 'client_field_definitions', 'key',           'konfiguration', 'none',
      'permanent', null, null, 'jsonb-property-name i clients.fields; UNIQUE globalt'),
    ('core_identity', 'client_field_definitions', 'display_name',  'konfiguration', 'none',
      'permanent', null, null, 'UI-label for feltet'),
    ('core_identity', 'client_field_definitions', 'field_type',    'konfiguration', 'none',
      'permanent', null, null, 'Fri-tekst type-identifier (text/email/phone/url/...); UI håndhæver format'),
    ('core_identity', 'client_field_definitions', 'required',      'konfiguration', 'none',
      'permanent', null, null, 'Om feltet skal være sat ved INSERT (UI-validering)'),
    ('core_identity', 'client_field_definitions', 'pii_level',     'konfiguration', 'none',
      'permanent', null, null, 'PII-niveau for jsonb-key. direct hashes i audit_filter_values'),
    ('core_identity', 'client_field_definitions', 'display_order', 'konfiguration', 'none',
      'permanent', null, null, 'UI-sortering'),
    ('core_identity', 'client_field_definitions', 'is_active',     'konfiguration', 'none',
      'permanent', null, null, 'Aktiv-flag; false = udfaset'),
    ('core_identity', 'client_field_definitions', 'created_at',    'konfiguration', 'none',
      'permanent', null, null, 'INSERT-tid'),
    ('core_identity', 'client_field_definitions', 'updated_at',    'konfiguration', 'none',
      'permanent', null, null, 'Sidste mutation')
  on conflict (table_schema, table_name, column_name) do nothing;
  ```

  **V6 (Mathias-terminal fund #2):** `on conflict do nothing` er obligatorisk per fitness-check `migration-on-conflict-discipline` (`core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES`). UNIQUE-constraint på (table_schema, table_name, column_name) gør conflict-targetet entydigt.

- **Afhængigheder:** T10.1, T10.2 (tabeller skal eksistere), T10.3 (allowlist skal være udvidet)
- **Migration-fil:** `supabase/migrations/<ts>_t10_classify.sql`
- **Risiko:** lav (data_field_definitions har INSERT-policy via session-var). Rollback: DELETE matching rows.

### T10.5 — Omskrive `core_compliance.audit_filter_values` med clients-fields-jsonb-walking

- **Type:** migration (CREATE OR REPLACE FUNCTION)
- **Hvad:** Genskab D5's clients-special-case-mønster: walker `clients.fields` jsonb og hashes hver key der har `pii_level='direct'` i `client_field_definitions`. **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** ingen `is_active = true`-filter på direct-PII keys — ellers ville deaktivering af et felt skabe datalæk for værdier i eksisterende fields jsonb. Validation-trigger T10.6 behandler stadig inactive som ukendt-key (LENIENT warning), men audit-hashing rammer alle direct-PII definitioner. Resten af T1-logikken bevares uændret.
- **Eksakt indhold:**

  ```sql
  create or replace function core_compliance.audit_filter_values(
    p_schema text,
    p_table text,
    p_values jsonb
  )
  returns jsonb
  language plpgsql stable security definer set search_path = ''
  as $$
  declare
    v_result jsonb := p_values;
    v_def record;
    v_strict boolean := current_setting('stork.audit_filter_strict', true) = 'true';
    v_has_defs boolean;
    v_key text;
    v_fields jsonb;
    v_field_key text;
    v_field_value jsonb;
  begin
    if p_values is null then
      return null;
    end if;

    -- Tjek om tabellen har klassificering.
    select exists (
      select 1 from core_compliance.data_field_definitions
      where table_schema = p_schema and table_name = p_table

codex
APPROVAL — Runde 5
tokens used
154,412
APPROVAL — Runde 5

exec
/bin/bash -lc 'rg -n "APPROVAL|PLAN-AFVIGELSE|KRITISK|MELLEM|LAV|HUL|WORKAROUND|G-NUMMER" docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md | tail -n 80' in /home/mathias/stork-2.0
 succeeded in 0ms:
1618:    -- V3 (Codex V2 KRITISK-SIKKERHEDSHUL): UPDATE rør IKKE logo. Brug client_logo_set/clear.
1939:-- Per Codex build-review runde 3: legacy-seed var "WORKAROUND-INTRODUCERET"
1962:-- datatab (V3 Codex V2 KRITISK-SIKKERHEDSHUL: default-null-parametre i upsert
2073:-- V3 (Codex V2 KRITISK-SIKKERHEDSHUL): key + pii_level direct→non-direct
2121:    -- V3 (Codex V2 KRITISK-SIKKERHEDSHUL): forbyd key-rename og direct → non-direct
2158:  'T10.10: INSERT-eller-UPDATE felt-definition. key + pii_level (direct→non-direct) immutable for eksisterende (V3 KRITISK-SIKKERHEDSHUL). UPDATE rør ikke is_active (V8). pii_level escalation none→indirect→direct tilladt. Sikkerheds-invariants bypasses ikke for superadmin.';
2270:-- MELLEM #3): client_field_definitions har kun is_active, ingen status-kolonne.
2298:-- V3 (Codex V2 KRITISK-SIKKERHEDSHUL): UPDATE af key afvises (errcode 22023).
2344:  -- ─── T2 (V3 KRITISK-SIKKERHEDSHUL): UPDATE af key afvises ──────────
2358:    raise exception 'T2 FAIL (V3 KRITISK): UPDATE af key skal afvises (immutable)';
2361:  -- ─── T3 (V3 KRITISK-SIKKERHEDSHUL): pii_level direct → none afvises
2372:    raise exception 'T3 FAIL (V3 KRITISK-SIKKERHEDSHUL): pii_level direct → non-direct skal afvises';
2428:-- V3 (Codex V2 KRITISK-SIKKERHEDSHUL) assertion: client_upsert UPDATE af
2432:-- V12 (Codex V11 KRITISK-SIKKERHEDSHUL): audit_log har logo_filename + logo_bytes
2489:  -- ─── T2 (V3 KRITISK): client_upsert UPDATE bevarer logo ─────────────
2503:    raise exception 'T2 FAIL (V3 KRITISK): client_upsert UPDATE skal IKKE røre logo_bytes!';
2506:    raise exception 'T2 FAIL (V3 KRITISK): client_upsert UPDATE skal IKKE røre logo_filename!';
2530:  -- ─── T5 (V12 KRITISK-SIKKERHEDSHUL): audit-PII-hashing af logo_filename
2548:    raise exception 'T5 FAIL (V12 KRITISK-SIKKERHEDSHUL): logo_filename + logo_bytes skal være SHA256-hashed i audit_log.new_values';
3011:  -- ─── T3 (V8 KRITISK): client_upsert UPDATE rør IKKE is_active ──────
3024:    raise exception 'T3 FAIL (V8 KRITISK): client_upsert UPDATE rør IKKE is_active. Forventet false, fik % (utilsigtet reaktivering!)', v_returned_is_active;
3050:-- V2 (Codex V1 MELLEM): assert at non-object fields ('"scalar"'::jsonb,
3052:-- V2 (Codex V1 KRITISK-SIKKERHEDSHUL): assert audit-PII-hashing rammer
3096:  -- ─── T2 (V2 MELLEM): non-object fields afvises af CHECK ─────────────
3106:    raise exception 'T2 FAIL (V2 MELLEM): scalar jsonb skal afvises af clients_fields_is_object-CHECK';
3136:  -- ─── T4 (V2 KRITISK-SIKKERHEDSHUL): audit-PII-hashing efter is_active=false
3172:      raise exception 'T4 FAIL (V2 KRITISK-SIKKERHEDSHUL): kontakt_email skal hashes selv efter felt-def is_active=false. Fik: %', v_audit_value;
3270:  -- Codex runde 1 MELLEM 1: tilføj _apply_org_node_upsert backdated dækning.
4801:17:| 1   | KRITISK/FUNKTIONELT | T10.7b `client_node_close` | Wrapper mangler klient-eksistens-check. Bryder krav-dok §3.4 "valideres at klienten faktisk findes" ved BÅDE oprettelse OG ændring. Close er en ændring. Uden check: pending oprettes på ikke-eksisterende client_id → `_apply_client_close` UPDATE'er 0 rows → silent no-op. `client_node_place` har check siden V7; `client_node_close` blev tilføjet i V9 uden check. | **ACCEPT.** Tilføj `if not exists (select 1 from core_identity.clients where id = p_client_id) then raise P0002` i `client_node_close` wrapper FØR session-var + pending_change_request. Konsistent med client_node_place's mønster. | T10.7b + T10.15 |
4804:35:| 1   | KRITISK-SIKKERHEDSHUL | T10.4    | `clients.logo_filename` klassificeret som `pii_level='none'` → brugerleveret filnavn lander i klartekst i audit_log. Inkonsistent med `clients.name='direct'` (forsigtigheds-pattern). Filnavne kan realistisk indeholde klient-/personidentifikatorer. | **ACCEPT + proaktiv udvidelse.** `logo_filename` → `pii_level='direct'`. **Plus:** `logo_bytes` → `'direct'` (binær billed-data kan vise stifter/medarbejdere — samme forsigtigheds-pattern). `logo_content_type` forbliver `'none'` (kun MIME-type). T10.15's logo-test udvides med audit-hash-assertion. | T10.4 + T10.15 |
4805:43:| 1   | KRITISK           | Fundament-tjek               | Tabellen nævner kun T10.8/T10.9/T10.10/T10.11 + T10.13. V10 tilføjer/ændrer write-veje i T10.7b (`client_node_place`, `client_node_close`, `_apply_client_place`) + T10.10a (`client_field_definition_set_active`) — manglende krydstjek. | **ACCEPT.** Fundament-tjek-tabel udvidet med T10.7b (GRANT/policy/session-var + apply-dispatch + jsonb payload producer/consumer) og T10.10a. Eksempel-row-tjek udvidet med immutable-key + pii-downgrade-block + active-check. |
4806:44:| 2   | G-NUMMER-KANDIDAT | T10.16 / Oprydnings-strategi | T10.16 nævner FK-coverage som G-nummer-kandidat, men oprydnings-strategi siger "Ingen G-numre forventet". Inkonsistent.                                                                                                                   | **ACCEPT.** **G058** registreret i `docs/teknisk/teknisk-gaeld.md` (FK-coverage-fitness-check ikke implementeret per master-plan §3.19). Oprydnings-strategi opdateret til at angive G057 + G058 som del af trin 10.            |
4811:69:| 2   | G-NUMMER-KANDIDAT → ADOPT | T10.13                     | Tab/grant-INSERT-queries filtrerer på `p.name in ('clients', 'client_field_definitions')` uden at scope til `org_structure`-area. Hvis nogen senere tilføjer page med samme navn i andet area (usandsynligt, men ikke robust).                                                                                                                                                                                                                                                                                                                                                                                                                                        | **ADOPT.** Trivielt fix: scope queries til `org_structure`-area via JOIN på area_id.                                                                                                                                                                                                                                                                                                                                                                                                    | T10.13         |
4814:83:| 1   | KRITISK  | T10.6                  | `clients_validate_fields()` trigger-funktion har `cfd.is_active = true` filter. Rammer fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`). T10.16 allowlister kun `client_field_definitions_list`.                                                                    | Codex runde 7     | **ACCEPT.** Udvid T10.16 med `core_identity.clients_validate_fields`. Forretningsmæssigt korrekt at filtrere på aktive felt-definitioner i validate-trigger (LENIENT: ukendte/inaktive keys → warning) — det er ikke R7d-pattern (employees-dual-column), bare lifecycle-signal. |
4815:84:| 2   | KRITISK  | T10.8                  | `client_upsert` UPDATE-branch sætter `is_active = p_is_active` (default `true`). En admin der opdaterer navn på en inaktiv klient uden eksplicit at sende p_is_active=false **reaktiverer klienten utilsigtet**. Bryder krav-dok §3.1's distinction af "Ændr klient" vs "Deaktivér klient". | Code walk-through | **ACCEPT.** Drop `is_active` fra T10.8's UPDATE-SET-klausul. p_is_active gælder kun INSERT-branch. Aktiv-toggle sker via `client_set_active` (T10.9). Matcher logo-pattern (rør'es ikke i client_upsert).                                                                        |
4816:85:| 3   | KRITISK  | T10.10                 | `client_field_definition_upsert` UPDATE-branch har **samme bug** med `p_is_active` default true → opdatering af inaktiv felt-definition reaktiverer den utilsigtet.                                                                                                                         | Code walk-through | **ACCEPT.** Drop `is_active` fra T10.10's UPDATE-SET-klausul. + ny T10.10a (se #4).                                                                                                                                                                                              |
4817:86:| 4   | MELLEM   | T10.10 / krav-dok §3.2 | Krav-dok §3.2 specificerer "Deaktivér felt-definition" som distinct funktion, men V7 har kun samlet `client_field_definition_upsert`. Ingen direct toggle-RPC.                                                                                                                              | Code walk-through | **ACCEPT.** Ny step **T10.10a**: `client_field_definition_set_active(p_field_id, p_is_active, p_change_reason)`. Matcher `client_set_active`-mønstret + krav-dok §3.2.                                                                                                           |
4822:106:| 1   | KRITISK  | T10.7 (FK)         | FK sikrer KUN eksistens, ikke at klient er aktiv. Krav-dok §2.5.2: "Inaktiv klient bliver stående for historik, men kan ikke vælges som ny team-tilknytning." T9-wrapper `client_node_place` (`20260518000007:140-170`) validerer permission + team-only, men ikke aktiv klient. T9-supplement `_apply_client_place` (`20260520000000:285-352`) validerer team-only + team-aktiv, men ikke klient-aktiv. Krav-dok §3.4 siger "valideres at klienten faktisk findes" — sammen med §2.5.2 betyder det: findes + aktiv. Plus: pending kan oprettes mens klient aktiv og applies efter deaktivering → apply-pathen SKAL også tjekke. | **ACCEPT.** Ny step T10.7b: CREATE OR REPLACE begge RPC'er med aktiv-check **og superadmin-bypass** (Mathias 2026-05-21: "superadmin må alt"). Wrapper-rækkefølge: has_permission → team-check → klient-eksistens (P0002) → klient-aktiv (22023 hvis ikke superadmin). Apply-handler: tilføj klient-eksistens (P0002) + klient-aktiv (P0001 hvis ikke superadmin) FØR INSERT/UPDATE. `client_node_close` rør IKKE. | T10.7b (ny) + T10.15          |
4823:107:| 2   | MELLEM   | Plan-tekst         | To stale referencer til "fjern client_id fra FK_COVERAGE_EXEMPTIONS" på linje 113 (Verificerede afhængigheder-tabel) + linje 142 (Scope-bullet). En implementeringsagent kan følge den forkerte del og lede efter ikke-eksisterende allowlist.                                                                                                                                                                                                                                                                                                                                                                                   | **ACCEPT.** Omformulér begge linjer til at matche T10.16's korrekte V6-retning (R7d-allowlist, ikke FK-allowlist).                                                                                                                                                                                                                                                                                                 | Linje 113 + 142               |
4824:108:| 3   | MELLEM   | T10.15             | Smoke-test dækker FK-eksistens + ON DELETE RESTRICT, men ikke det vigtigste forretningskrav (krav-dok §2.5.2: inaktiv klient kan ikke vælges).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **ACCEPT.** Ny separat smoke-test `t10_client_active_check.sql` med 4 scenarier: aktiv place success, inaktiv place rejection (22023), pending-mens-aktiv + deaktiver + apply rejection (P0001), close virker på inaktiv klient.                                                                                                                                                                                   | T10.15 + ny test-fil          |
4825:109:| 4   | LAV      | T10.4 + Konklusion | "alle 9 kolonner" + "(9 kolonner)" på `client_field_definitions` — SQL har 10 rækker (id, key, display_name, field_type, required, pii_level, display_order, is_active, created_at, updated_at). Plus konklusion-historik siger T10.4 ON CONFLICT er "DEFER", men V6 gjorde det obligatorisk. Codex V1-fund-tabel siger stadig "DEFER → G-nummer".                                                                                                                                                                                                                                                                               | **ACCEPT.** Tekstrettelser: 9→10 på `client_field_definitions`; opdatér V1-fund-tabel (linje 68) og Konklusion-historik (linje 1335) til at reflektere V6's ACCEPT.                                                                                                                                                                                                                                                | T10.4 + linje 68 + linje 1335 |
4828:123:| 1   | KRITISK             | T10.1 + T10.2                                   | Tabellerne mangler `-- no-dedup-key: <reason>` marker. Fitness-check `dedup-key-or-opt-out` (`scripts/fitness.mjs:422-450`) blokerer alle nye CREATE TABLE uden dedup_key-kolonne eller eksplicit opt-out-marker.                                                                                                                                      | Mathias-terminal | **ACCEPT.** Tilføj T9-stil marker over begge CREATE TABLE-statements.                                                                                                                                                                                                                                                                                                                                  |
4829:124:| 2   | KRITISK             | T10.4                                           | INSERT i `core_compliance.data_field_definitions` mangler `ON CONFLICT do nothing`. `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES` (`scripts/fitness.mjs:162-172`); `migration-on-conflict-discipline` (`:675-737`) håndhæver det. V5's DEFER til G-nummer var forkert — fitness brækker.                                    | Mathias-terminal | **ACCEPT.** Tilføj `on conflict (table_schema, table_name, column_name) do nothing`. Fjern G-nummer-kandidat-tekst fra Optimerings-hypoteser (det er ikke en optimering, det er krav).                                                                                                                                                                                                                 |
4830:125:| 3   | KRITISK/FUNKTIONELT | T10.1 + T10.2 + T10.8 + T10.9 + T10.11 + T10.12 | `has_permission(p_page, NULL, false)` med `p_tab_key=NULL` springer tab-resolver over (`20260518000010_t9_seed_owners.sql:35`) og prøver kun page/area-grants. T10.13 seeder kun TAB-grants → read-paths matcher INGEN grant og returnerer false → SELECT-policy + read-RPC'er tilbageholder data for legitime brugere med kun `clients/manage`-grant. | Mathias-terminal | **ACCEPT.** Skift alle read-paths til tab-aware: `has_permission('clients', 'manage', false)` og `has_permission('client_field_definitions', 'manage', false)`. Berører SELECT-policies (T10.1 + T10.2), client_get/client_list/client_field_definitions_list (T10.12), client_logo_get (T10.11). Write-paths bruger allerede 'manage' tab — konsistent.                                               |
4831:126:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
4832:127:| 5   | KRITISK             | T10.12 client_field_definitions_list            | RPC bruger `where p_include_inactive or is_active = true` — matcher fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`) regex. client_field_definitions har KUN is_active (ingen status-kolonne), så funktionen skal allowlist'es i `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS`.                                                          | Code-validering  | **ACCEPT.** Tilføj `core_identity.client_field_definitions_list` til allowlisten via T10.16's fitness-script-ændring.                                                                                                                                                                                                                                                                                  |
4833:128:| 6   | KRITISK             | T10.15 `t10_client_node_placements_fk.sql`      | Smoke-test INSERT'er i `core_identity.client_node_placements` som er på `TX_WRAP_REQUIRED_FOR_TEST_INSERT` (`scripts/fitness.mjs:110`). Fitness-check `db-test-tx-wrap-on-immutable-insert` (`:901-924`) kræver `begin;` + `rollback;` på linje-niveau.                                                                                                | Code-validering  | **ACCEPT.** Eksplicit `begin;` + `rollback;` wrap-pattern i T10.15's FK-test specifikation. T10.7a's fixture-INSERT i T9-tests sker indenfor eksisterende BEGIN/ROLLBACK (verificeret: `t9_placements.sql:9` + `:213`, `t9_backdated_historical_traversal.sql:9` + `:311`).                                                                                                                            |
4834:140:| 1   | KRITISK  | T10.1 + T10.2 | Tabellerne har kun `GRANT SELECT to authenticated`. Mangler `GRANT INSERT, UPDATE` der er nødvendigt før RLS-policy/session-var-vejen kan virke for write-RPC'erne (T10.8-T10.11). Bryder niveau 1-prefixens GRANT + policy + session-var-tre-pak. | **ACCEPT.** Tilføj `grant insert, update on table core_identity.clients to authenticated` i T10.1 og tilsvarende for `client_field_definitions` i T10.2. Ingen DELETE-grant (inaktivering via is_active, ikke DELETE). Matcher T1's mønster for `core_compliance.data_field_definitions`. | T10.1 + T10.2 |
4835:150:| 1   | KRITISK  | T10.13  | T10.13 sætter `stork.source_type` + `stork.change_reason` men IKKE `stork.t9_write_authorized = 'true'` som T9-supplements INSERT-policies på `permission_pages` / `permission_tabs` / `role_permission_grants` kræver. Brudt niveau 1-prefix end-to-end-tjek for INSERT/UPDATE/DELETE-veje (GRANT + policy + session-var-tre-pak). | **ACCEPT.** Tilføj `select set_config('stork.t9_write_authorized', 'true', false);` før INSERTs i T10.13. Opdater Fundament-tjek-tabel. | T10.13 + Fundament-tjek |
4836:160:| 1   | KRITISK-SIKKERHEDSHUL | T10.10 / T10.5 | Audit-hashing afhænger af mutable `client_field_definitions.key`/`pii_level`. Hvis felt-definitionen senere får ny `key` eller `pii_level='none'`, vil eksisterende `clients.fields`-værdier skrives i klartekst i audit. V2-fixet for `is_active=false` dækker ikke key-rename eller pii-downgrade. | **ACCEPT.** Gør `key` og `pii_level` effektivt immutable for eksisterende definitions via T10.10's RPC: blokér UPDATE af `key`; blokér `pii_level` direct → non-direct. Tilføj smoke-test der verificerer begge invariants. | T10.10 + T10.15                    |
4837:161:| 2   | KRITISK               | T10.3          | Min plan baserede sig på D1b's gamle allowlist og missede P1a's tilføjelse af `('core_compliance', 'anonymization_strategies', null)`. CREATE OR REPLACE ville regressere allowlisten og kan blokere fremtidige updates af permanent-klassifikationer for den tabel.                                 | **ACCEPT.** T10.3 baseres på P1a's VALUES-blok (15 entries) + tilføjer 2 nye trin 10-entries (17 total). Recon-først udvidet med P1a's omskrivning.                                                                         | T10.3 + Verificerede afhængigheder |
4838:171:| 1   | KRITISK               | T10.1   | `clients.fields` mangler `CHECK (jsonb_typeof = 'object')` — scalar/array kan lagre uden audit-PII-walking.                                                               | **ACCEPT.** Tilføj CHECK på T10.1. Smoke-test i T10.15 udvides.                                                                                                                                                                                                                     | T10.1 + T10.15 |
4839:172:| 2   | KRITISK-SIKKERHEDSHUL | T10.5   | audit_filter_values clients-special-case filtrerer `is_active = true` → hvis felt deaktiveres, hashes værdier i eksisterende fields ikke længere. Datalæk i audit-flowet. | **ACCEPT.** Fjern `is_active = true`-filter fra audit_filter_values clients-special-case. Hash alle direct-PII keys uanset is_active. Validation-trigger kan stadig behandle inactive som ukendt key.                                                                               | T10.5          |
4840:173:| 3   | MELLEM                | T10.15  | Smoke-tests dækker ukendt key lenient/strict, men ikke non-object `fields`.                                                                                               | **ACCEPT.** Tilføj test for CHECK-violation ved non-object.                                                                                                                                                                                                                         | T10.15         |
4841:174:| 4   | G-NUMMER-KANDIDAT     | T10.4   | INSERT mangler `ON CONFLICT do nothing` (T9-classify bruger det). Ikke blocker for greenfield.                                                                            | **V2-svar: DEFER → G-nummer** (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness-check `migration-on-conflict-discipline` håndhæver det på `core_compliance.data_field_definitions`. Plan har nu `ON CONFLICT (table_schema, table_name, column_name) DO NOTHING`. | T10.4          |
4864:346:    -- V2 (Codex V1 KRITISK #1): fields skal være jsonb object — scalar/array forhindres
4867:374:  -- V5 (Codex V4 KRITISK): DML-GRANT obligatorisk så RLS-policy + session-var
4882:449:  -- V5 (Codex V4 KRITISK): DML-GRANT obligatorisk for write-RPC-veje.
4901:591:- **Hvad:** Genskab D5's clients-special-case-mønster: walker `clients.fields` jsonb og hashes hver key der har `pii_level='direct'` i `client_field_definitions`. **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** ingen `is_active = true`-filter på direct-PII keys — ellers ville deaktivering af et felt skabe datalæk for værdier i eksisterende fields jsonb. Validation-trigger T10.6 behandler stadig inactive som ukendt-key (LENIENT warning), men audit-hashing rammer alle direct-PII definitioner. Resten af T1-logikken bevares uændret.
4976:1159:- **Hvad:** SECURITY DEFINER write-RPC for client_field_definitions. has_permission('client_field_definitions', 'manage', true). **V3 (Codex V2 KRITISK-SIKKERHEDSHUL):** UPDATE forbyder ændring af `key` (audit-PII-hash i clients.fields ville miste reference); UPDATE forbyder pii_level direct → non-direct (eksisterende værdier ville pludselig skrives i klartekst i audit). For at ændre `key`: marker den gamle definition `is_active=false` og INSERT en ny. For at sænke pii-niveau: behandl som ny definition.
5002:1542:  | `supabase/tests/smoke/t10_clients_validate_fields.sql`                                      | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
5049:1717:- T10.4: `clients.logo_filename` + `clients.logo_bytes` skiftet til `pii_level='direct'` (audit hasher). `logo_content_type` forbliver `'none'`. Codex KRITISK-SIKKERHEDSHUL: brugerleveret filnavn kunne lande i klartekst i audit_log.
5056:1735:- T10.13 robusthed: tab/grant-INSERT-queries scope'es til `org_structure`-area via JOIN på area_id (Codex G-NUMMER → ADOPT).
5058:1740:- T10.16 udvidet: `core_identity.clients_validate_fields` tilføjet til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Codex runde 7 KRITISK).
5074:1768:- T10.13: tilføjet `set_config('stork.t9_write_authorized', 'true', false)` før INSERTs — krævet af T9-supplement's INSERT-policies på permission_pages/tabs/role_permission_grants (Codex V3 KRITISK).
5076:1773:- T10.3: baseret på P1a's komplette VALUES-blok (15 entries inkl. `anonymization_strategies`) + 2 trin 10-entries = 17 total. V2's D1b-baseline var regression (Codex V2 KRITISK #2).
5077:1774:- T10.10: `key` er funktionelt immutable for eksisterende definitions (UPDATE blokeres). `pii_level` direct → non-direct afvises. Forhindrer audit-PII-datalæk via key-rename eller pii-downgrade (Codex V2 KRITISK-SIKKERHEDSHUL #1).
5079:1779:- T10.1: tilføjet `CHECK (jsonb_typeof(fields) = 'object')` — forhindrer scalar/array i fields-kolonnen (Codex KRITISK #1)
5080:1780:- T10.5: fjernet `is_active = true`-filter fra audit_filter_values clients-special-case — alle direct-PII keys hashes uanset is_active for at undgå datalæk ved felt-deaktivering (Codex KRITISK-SIKKERHEDSHUL #2)
5081:1781:- T10.15: smoke-test for non-object fields-reject + audit-PII-hashing efter is_active=false (Codex MELLEM #3 + V2-supplement til #2)
5142:- **Afgørelse 6:** "Kør V6 men ret op på fejl og lav grundig validering" (chat-validering 2026-05-21 efter selvstændig terminal-review fandt 3 KRITISK).
5143:  - **Begrundelse:** Codex-automation gav APPROVAL i runde 5, men manuel terminal-review afslørede fitness-script-håndhævelse (dedup-key + on-conflict) og has_permission-tab-resolver-detalje som automation missede. Code skal validere planen mod faktisk kode, ikke kun stole på Codex-automation.
5175:    -- V2 (Codex V1 KRITISK #1): fields skal være jsonb object — scalar/array forhindres
5203:  -- V5 (Codex V4 KRITISK): DML-GRANT obligatorisk så RLS-policy + session-var
5278:  -- V5 (Codex V4 KRITISK): DML-GRANT obligatorisk for write-RPC-veje.
5346:  **V3 (Codex V2 KRITISK #2):** baseret på P1a's komplette VALUES-blok (15 entries inkl. `anonymization_strategies`), ikke D1b's gamle baseline. Plus 2 trin 10-entries = 17 total. CREATE OR REPLACE bevarer signatur. Allowlist-ændring er kode-commit + review per master-plan rettelse 29.
5382:      'permanent', null, null, 'Original filnavn ved upload. V12 (Codex runde 11 KRITISK-SIKKERHEDSHUL): direct fordi filnavne kan indeholde klient-/person-identifikatorer; hashes i audit'),
5420:- **Hvad:** Genskab D5's clients-special-case-mønster: walker `clients.fields` jsonb og hashes hver key der har `pii_level='direct'` i `client_field_definitions`. **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** ingen `is_active = true`-filter på direct-PII keys — ellers ville deaktivering af et felt skabe datalæk for værdier i eksisterende fields jsonb. Validation-trigger T10.6 behandler stadig inactive som ukendt-key (LENIENT warning), men audit-hashing rammer alle direct-PII definitioner. Resten af T1-logikken bevares uændret.
5452:APPROVAL — Runde 5
5455:APPROVAL — Runde 5

exec
/bin/bash -lc "sed -n '1,45p' docs/coordination/seneste-rapport.md && sed -n '1,25p' docs/coordination/aktiv-plan.md && sed -n '470,490p;1516,1522p;1930,1935p' docs/strategi/stork-2-0-master-plan.md && sed -n '1,40p' docs/teknisk/teknisk-gaeld.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
# Seneste rapport

Peger på sidste leverede slut-rapport (Code → Mathias).

**Aktuel:** `docs/coordination/rapport-historik/2026-05-21-trin-10.md` (PR #64 squash-merged til main 2026-05-21; commit `1831760`)

Når ny rapport leveres:

1. Rapport-fil oprettes direkte i `docs/coordination/rapport-historik/` med navnet `<dato>-<pakke-kode>.md`.
2. Sti + commit-hash opdateres her.

Denne fil er trigger for Codex-notify GitHub Action (jf. `.github/workflows/codex-notify.yml`). Ændring her poster comment til tracker-issue "Codex review queue".
# Aktiv plan

Peger på den plan-fil der aktuelt er under arbejde (skrives → reviewes → bygges).

**Aktuel:** ingen aktiv pakke — venter på næste pakke-valg fra Mathias.

Workflow-spec V2 (`mathias-afgoerelser.md` 2026-05-20 "Workflow-justering V2") er etableret som autoritativ operationel guide for kommende pakker. Detaljer i `docs/skabeloner/workflow-skabelon.md` + overvaagning-filer.

**Historisk:**

- **Trin 10** (Klient-skabelon: core_identity.clients + client_field_definitions + logo + is_active + FK fra T9 + aktiv-check med superadmin-bypass + employee-id-baseret apply-bypass for cron-context + PII-hashing for logo) afsluttet 2026-05-21 via PR #64 (squash-merged til main, commit `1831760`). Plan V14 efter 14 Codex plan-runder + 5 Codex build-review-runder (APPROVAL runde 5). 14 migrations (inkl. T10.13c reverse-legacy) + 6 smoke-tests + fitness-script-allowlist + master-plan §1.8 + §4 trin 10 rettelser. G057 + G058 registreret som teknisk gæld. Plan + krav-dok + approval-fil arkiveret i `docs/coordination/arkiv/`. Slut-rapport: `rapport-historik/2026-05-21-trin-10.md`.
- **Workflow-forenkling V2** (PR #60) afsluttet 2026-05-20. 30 disciplin-fund fra trin 10-forsøget adresseret. Krav-dok-fase simplificeret + recon-først for Code + dokument-hierarki differentieret. Trin 10 udskudt med krav-dok + mathias-afgoerelser-entry bevaret på main.
- **Lag 1 disciplin-fundament komplet** (PR #42's disciplin-indhold selektivt merget gennem Lag1-filter + G055/G056-fix + handoff-arkivering) afsluttet 2026-05-20 via PR #52 (`8898d3e`), PR #53 (`048d021`), PR #54 (`41cf359`). Tilfører Lag 1's V5.3-spec: forretningsspoergsmaal-fase, krav-dok-review-rolle, NEEDS-MATHIAS-severity, end-to-end-tjek per write-vej, Fundament-tjek-passeret, Plan-pre-push-tjekliste, datamodel-STOP. Lukker 2 latente Lag1-huller (G055 script-parser + G056 Codex rolle-grænse). Slut-rapport: `rapport-historik/2026-05-20-Lag1-disciplin-fundament.md`.
- **Lag 1** (workflow-stabilisering — 9 leverancer A-J + V5.3 marker-protokol-spec) afsluttet 2026-05-20 via PR #48 (`708ab8d`). Plan + V5.1-V5.3 plan-feedback + Codex-approval arkiveret i `docs/coordination/arkiv/` (filnavne `Lag1-*`). Slut-rapport: `rapport-historik/2026-05-20-Lag1.md`. Plan-fase: 7 plan-versioner, 5 Codex-runder med APPROVAL på V5.1, 3 Claude.ai-runder med APPROVAL på V5.3.
- **T9-supplement** (lukke 6 åbne T9-fund: team-retype-overlap-invariant, schema-exposure-verifikation, backdated traversal i 7 apply-handlers, date-aware read-gates, Step 12 robusthed, type-codegen) afsluttet 2026-05-19 via PR #44 (build), #45 (slut-rapport), #46 (G054 type-codegen). Plan + krav-og-data + V1-V4 plan-feedback eksisterer på `claude/T9-supplement-plan`-branchen per slut-rapport-disciplin. Slut-rapport: `rapport-historik/2026-05-19-t9-supplement.md`.
- **T9** (§4 trin 9 — Identitet del 2: organisations-træ + permission-fundament + fortrydelses-mekanisme + import fra 1.0) afsluttet 2026-05-18 via PR #34, #35, #36, #37, #38, #39, #40 → main. Plan + feedback (V1-V6) arkiveret i `docs/coordination/arkiv/` (filnavne `T9-*`). Build i 12 migrations + 6 smoke-tests + 2 stub migration-scripts + T9-fundament-supplement-migration (master-plan §1.7-omskrivning + §1.1 session-var-pattern). 8 push-fase-bugs fix'et via PR #35-38 + #40. Slut-rapport: `rapport-historik/2026-05-18-t9.md`.
- **H010** (etablering af arbejdsmetode + repo-struktur) afsluttet ved commit `3c6bc0b`.
- **H020** (28 åbenlyse dokument-rettelser + plan-automation-flow-test) afsluttet
  ved commit-range `7c0c83d..70d8857` (PR #20 rebase-merged 2026-05-16). Plan +
  feedback arkiveret i `docs/coordination/arkiv/` (filnavne `H020-*`).
  Slut-rapport: `rapport-historik/2026-05-16-h020.md`.
- **H024** (test-idempotens + artefakt-cleanup + Node 24) afsluttet ved commit-range
  `8f46615^..30fbdf4` (PR #26 rebase-merged 2026-05-16). Plan + feedback
  arkiveret i `docs/coordination/arkiv/` (filnavne `H024-*`). Slut-rapport:
  `rapport-historik/2026-05-16-h024.md`.
- Alle write-RPCs er SECURITY INVOKER med `has_permission`-check FØR write
- Hver write-RPC sætter `stork.t9_write_authorized = 'true'` (local til transaktion) efter has_permission-check
- INSERT/UPDATE-policies på write-tabeller kræver session-var sat — DB-level defense-in-depth
- Gælder write-tabeller: `pending_changes`, `undo_settings`, `permission_areas`, `permission_pages`, `permission_tabs`, `role_permission_grants`
- Apply-handlers (`_apply_*`) der INSERT'er i versions/placements er SECURITY DEFINER (trigger-lignende — eksplicit Plan V6 Beslutning 12; intern call-path fra apply-gate)

### §1.8 Klient-skabelon

Klient er driftens grundenhed. Stor variation i felter pr. klient — derfor felt-bag, ikke felt-eksplosion.

- Én klient-entitet med fælles kolonner (id, navn, is_active, logo (bytea+content_type+filename), timestamps). Klient-specifikke værdier i jsonb felt-bag. Klient anonymiseres ikke (mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme")
- Klient-livscyklus = aktiv/inaktiv (krav-dok §2.5.2). Inaktiv klient kan ikke vælges som ny team-tilknytning (håndhævet via aktiv-check i client_node_place wrapper + \_apply_client_place apply-handler)
- Klient-felt-definitions-registry: key, display-navn, type, required, pii-niveau, display-rækkefølge, is_active. Global registry (key UNIQUE) — pr-klient værdier i clients.fields jsonb
- Felter har pii_level (none/indirect/direct). Direct-PII keys hashes i audit via clients-fields-jsonb-walking i `core_compliance.audit_filter_values`. Hashes UANSET is_active for at undgå datalæk ved felt-deaktivering
- Match-mekanik udskudt til data-indgang-pakke (mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud")
- Validerings-trigger advarer ved ukendte jsonb-keys (LENIENT-default; strict-mode via session-var)
- Tabellen lever i `core_identity.clients` (T10.1, ikke `public.clients` der blev droppet i T1)

### §1.9 Beregnings-runtime (TypeScript-pakke)

Filosofi: beregning over databasen. Én delt pakke importeres identisk af edge-functions (Deno) og frontend (Vite/React).
| 7c   | **break_glass_requests-tabel** + RPC-skabelon (`break_glass_request`/`approve`/`reject`/`execute`) + `break_glass_operation_types`-konfig-tabel + expires-cron                                                                                                                                                                                                                                                                         | core_compliance                                                               |
| 8    | Migration-gate Phase 2 strict aktivering                                                                                                                                                                                                                                                                                                                                                                                               | CI                                                                            |
| 9    | Identitet del 2 (org-træ + teams + klient-team + helpers + subtree-scope + **org_unit_closure-tabel + vedligeholdelses-trigger + acl_subtree-helper** + subtree-RLS benchmark-test) **+ migration: discovery-script for teams + udtræks-SQL for klient-team-historik + upload-script**                                                                                                                                                 | core_identity                                                                 |
| 10   | Klient-skabelon (core_identity.clients + client_field_definitions + logo (bytea) + is_active + FK fra client_node_placements + has_permission-RPCs + employee-id-baseret superadmin-bypass i apply-context). Migration udskudt (mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering")                                                                                                                                            | core_identity                                                                 |
| 10b  | Lokations-skabelon (lokationer + placements + leverandører + klient-tilladelser + status + cooldown) **+ migration: udtræks-SQL for lokations-historik hvis relevant**                                                                                                                                                                                                                                                                 | core_identity                                                                 |
| 11   | UDGÅR (schema-grænser fra trin 1)                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
| 12   | @stork/core skeleton (pure funktioner, snapshot-pattern, RPC-stubs pr. core-schema, **eksplicit dokumentation om at frontend-beregning er kosmetisk preview**)                                                                                                                                                                                                                                                                         | TypeScript-pakke                                                              |
| 33  | Master-plan sandheds-audit (Claude.ai 2026-05-16): §5 udvidet med to bullets ("Sammenkobling eksplicit i datamodellen" + "Konfiguration har livscyklus") for at reflektere vision-meta-princip 3 og vision-operationel-princip 5. §3 udvidet med CI-blocker 19 (FK-coverage) for at håndhæve sammenkoblings-princippet teknisk. §0 fik ny "Strategiske retning-skift"-sektion der peger på mathias-afgoerelser som kilde. Konsekvens: master-plan reflekterer nu alle 3 meta-principper + alle 9 operationelle principper fra vision-dokumentet.                                                                                                                                                                                                                                                                                                                 |
| 34  | H024 (test-idempotens + artefakt-cleanup + Node 24): §3 udvidet med CI-blocker 20 (DB-test tx-wrap pr. immutable INSERT — `db-test-tx-wrap-on-immutable-insert` fitness-check). Pre-cutover test-artefakt-cleanup udført via engangs-migration med DISABLE TRIGGER pattern (Mathias-godkendt 2026-05-16). Tx-rollback etableres som default mønster for DB-tests; binder Lag E's test-arkitektur. Node 22 → Node 24 LTS opgradering parallelt.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 35  | T9-fundament-supplement (2026-05-18): §1.7 omskrevet til at matche T9-omstart-rammen (mathias-afgoerelser 2026-05-17, 15 punkter). Pre-omsadlings-tekst om 4-dim permission, scope=team, stab-rolle, `org_unit_closure`-navn og `is_compliance_officer()` fjernet som forkert fundament. Tre-niveau permission-model (Område → Page → Tab) + to akser ((kan_tilgå/kan_skrive) × visibility (Sig selv/Hiraki/Alt)) erstatter 4-dim. ÉT træ-anker, knude-løs medarbejder gyldig, klient-til-team-only-binding, fortrydelses-mekanisme. §1.1's session-var-pattern implementeret i T9-write-veje (migration `20260518100000_t9_fundament_supplement.sql`): INSERT/UPDATE-policies med `stork.t9_write_authorized`-check på 6 write-tabeller; 11 write-RPCs sætter session-var efter has_permission-check. H011's §1.7-modsigelse (identificeret 2026-05-15) lukkes. |
| 36  | Trin 10 (2026-05-21): §1.8 omskrevet til at matche faktisk klient-skabelon-implementation. Pre-fundament-tekst om `anonymized_at`-kolonne, match-rolle-koncept + crm_match_id-rolle, pr-klient felt-definitions-registry, dispatching i `audit_filter_values`-special-case fjernet som scope-justeret. Klient lever i `core_identity.clients` (T1 droppede D5's `public.clients`); is_active erstatter anonymized_at (krav-dok §2.5.1: ikke-anonymiseret); logo (bytea+content_type+filename) med PII-hashing i audit; client_field_definitions globalt registry; aktiv-check i client_node_place wrapper + \_apply_client_place med employee-id-baseret superadmin-bypass for cron-context. §4 trin 10-række rettet: migration + crm_match_id fjernet (mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering"). G057 + G058 registreret som teknisk gæld.   |

---
# Stork 2.0 — Teknisk gæld

**Formål:** Liste af kendt teknisk gæld der svækker visionen (én sandhed, styr på data, eksplicit sammenkobling, stamme=database, beregning over databasen, rettigheder der virker, anonymisering bevarer audit, alt drift styres i UI). Vedligeholdes efter hvert trin. Ny gæld tilføjes ved introduktion; løst gæld flyttes til arkiv.

**Severitet:**

- **Høj** — direkte brud på vision-princip
- **Mellem** — kompromis med dokumenteret plan
- **Lav** — kosmetisk/strukturel, ufuldstændig på en acceptabel måde

**Sidste opdatering:** 19. maj 2026 (G054 LØST — type-codegen for alle 4 eksponerede API-schemas)

---

## Åben gæld

### [G058] MELLEM — FK-coverage-fitness-check ikke implementeret per master-plan §3 punkt 19

- **Beskrivelse:** Master-plan §3 punkt 19 specificerer fitness-check der identificerer kolonner med suffix `_id` og verificerer at de har FK-constraint mod kolonnens ankerentitet. Allowlist `FK_COVERAGE_EXEMPTIONS` skal dokumentere tilladte undtagelser (fx `external_id`, `client_crm_match_id`). Check findes IKKE i `scripts/fitness.mjs`. T9-migration `20260518000004_t9_client_node_placements.sql:5` har forhåndsdokumentation der ikke matcher nuværende fitness-script-state.
- **Vision-svækkelse:** Princip 4 (default = intet — FK-coverage er strukturel disciplin der ikke håndhæves automatisk).
- **Introduceret:** Master-plan §3.19 + T9-kommentar (begge planlagt, ikke implementeret)
- **Skal løses:** Næste fitness-script-pakke. Kan kombineres med Trin 10's T10.16-ændring.
- **Risiko hvis glemt:** Mellem. Nye tabeller kan deploy'es uden FK-coverage-verifikation; potentielt urelaterede `_id`-kolonner uden FK forbliver ikke detekteret.
- **Plan:** Tilføj `fkCoverage()` fitness-check med `FK_COVERAGE_EXEMPTIONS`-allowlist. Eksisterende exemption-kandidater fra master-plan: `external_id`, `client_crm_match_id` (sidstnævnte fjernes når match-mekanik bygges). Trin 10's FK på `client_node_placements.client_id` (T10.7) eliminerer behov for entry der.

### [G057] MELLEM — T9 forretnings-invariants uden superadmin-bypass (inkonsistent med Mathias 2026-05-21)

- **Beskrivelse:** Mathias-afgørelse 2026-05-21 "superadmin må alt" etablerede bypass-disciplin for forretnings-invariants. Trin 10 (T10.7b) tilføjede bypass på klient-aktiv-check via `is_admin()` (wrapper) + `is_admin_by_employee_id()` (apply). T9 har to lignende forretnings-invariants UDEN bypass: `client_placement_requires_active_team` (`_apply_client_place`, T9-supplement linje 317) + `team_close_already_inactive` (`_apply_team_close`, T9-supplement linje 594). Superadmin kan derfor ikke placere klient på lige-lukket team, eller lukke allerede-inaktivt team — selvom "superadmin må alt".
- **Vision-svækkelse:** Princip 2 (superadmin = eneste hardkodede rolle, må bypasse forretnings-invariants for nød-operationer).
- **Strukturelle invariants forbliver uden bypass** (`client_placement_node_not_team`, `team_close_not_team`, `node_not_team_or_inactive`): data-model holder kun ved team-niveau-binding; bypass ville korrumpere.
- **Introduceret:** T9-supplement (`20260520000000_t9_supplement.sql:284-352, 557-619`)
- **Skal løses:** Næste T9-supplement-pakke (efter trin 10-build). Trin 10 fixer kun klient-RPC'erne; org_node/team-RPC'er er ude af scope.
- **Risiko hvis glemt:** Mellem. Superadmin kan blive blokeret i edge-cases. Workaround: deaktiver først, place efter — eller manuel UPDATE som superadmin med break-glass.
- **Plan:** Migration der CREATE OR REPLACE `_apply_client_place` (team-aktiv-check) + `_apply_team_close` (already-inactive-check) med samme employee-id-baseret bypass-mønster som T10.7b.

### [G001] HØJ — `audit_filter_values` LENIENT-default ved ukendt schema/table

- **Beskrivelse:** Hvis migration INSERT'er på en tabel uden klassifikation, returnerer `audit_filter_values` WARNING + lader værdier passere uændret. Strict-mode kræver eksplicit `stork.audit_filter_strict='true'` session-var.
- **Vision-svækkelse:** "Styr på data — klassifikation på hver kolonne". Ukendt tabel kan skrive PII direkte til audit-log uden hash.
- **Introduceret:** Trin 1 (`20260514120006_t1_audit_filter_values.sql`)

exec
/bin/bash -lc "sed -n '1,220p' supabase/migrations/20260521000008_t10_client_active_check.sql" in /home/mathias/stork-2.0
 succeeded in 0ms:
-- Trin 10 T10.7b: klient-aktiv-check i client_node_place + _apply_client_place
--
-- Krav-dok §2.5.2: "Inaktiv klient bliver stående for historik, men kan ikke
-- vælges som ny team-tilknytning." FK (T10.7) sikrer kun eksistens.
-- Krav-dok §3.4: "valideres at klienten faktisk findes" ved BÅDE oprettelse OG
-- ændring (close er en ændring).
--
-- Superadmin-bypass på aktiv-check (Mathias 2026-05-21 "superadmin må alt").
-- Sikkerheds-invariants (immutable key/pii_level i T10.10) bypasses IKKE.
--
-- V10 (Codex runde 9 TEKNISK-BLOKERING): apply-handler bruger employee-id-baseret
-- helper (is_admin_by_employee_id) fordi auth.uid() er NULL i cron-apply-context.
-- Bypass baseret på pending-rækkens requested_by OR approved_by.
--
-- V9 (Codex runde 8 TEKNISK-BLOKERING): wrapper sætter t9_write_authorized FØR
-- pending_change_request (T9-fundament-supplement INSERT-policy kræver det).
--
-- V14 (Code walk-through): client_node_close klient-eksistens-check (P0002) —
-- krav-dok §3.4 konformitet for close-ændring.

-- ─── Ny helper: is_admin_by_employee_id (V10 Codex runde 9) ─────────────
-- Admin-tjek via employee_id direkte (ikke auth.uid). Apply-handlers der
-- kører i cron-context kan ikke bruge is_admin() — den returnerer false
-- når auth.uid() er NULL.
create or replace function core_identity.is_admin_by_employee_id(p_employee_id uuid)
returns boolean
language sql stable security invoker set search_path = ''
as $$
  select exists (
    select 1
    from core_identity.employees e
    join core_identity.role_page_permissions p on p.role_id = e.role_id
    where e.id = p_employee_id
      and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
      and p.page_key = 'system'
      and p.tab_key = 'manage'
      and p.scope = 'all'
      and p.can_edit = true
  );
$$;

comment on function core_identity.is_admin_by_employee_id(uuid) is
  'V10/Trin 10: admin-tjek via employee_id (ikke auth.uid). Anvendes af apply-handlers der kører i cron-context uden auth.';

-- Grant-pattern matcher is_admin() (T1-helpers-stubs:50): authenticated + anon + service_role.
revoke all on function core_identity.is_admin_by_employee_id(uuid) from public;
grant execute on function core_identity.is_admin_by_employee_id(uuid) to authenticated, anon, service_role;

-- ─── client_node_place: tilføj klient-aktiv-check + session-var ─────────
create or replace function core_identity.client_node_place(
  p_client_id uuid,
  p_node_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_request_id uuid;
  v_client_active boolean;
begin
  if not core_identity.has_permission('client_placements', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  -- Pre-check: node_id skal være team (uændret fra T9).
  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = p_node_id and node_type = 'team' and is_active = true
      and effective_from <= current_date
      and (effective_to is null or effective_to > current_date)
  ) then
    raise exception 'client_placement_node_not_team_or_inactive: %', p_node_id using errcode = '22023';
  end if;
  -- V7/Trin 10 (krav-dok §3.4 + §2.5.2): klient skal findes og være aktiv.
  select is_active into v_client_active
    from core_identity.clients where id = p_client_id;
  if not found then
    raise exception 'client_not_found: %', p_client_id using errcode = 'P0002';
  end if;
  if v_client_active = false and not core_identity.is_admin() then
    raise exception 'client_inactive: % er sat is_active=false (krav-dok §2.5.2: inaktiv klient kan ikke vælges som ny team-tilknytning)', p_client_id
      using errcode = '22023';
  end if;
  -- V9 (Codex runde 8 TEKNISK-BLOKERING): pending_changes-INSERT-policy
  -- (T9-fundament-supplement) kræver session-var.
  perform set_config('stork.t9_write_authorized', 'true', true);
  v_request_id := core_identity.pending_change_request(
    'client_place', p_client_id,
    jsonb_build_object(
      'client_id', p_client_id::text,
      'node_id', p_node_id::text,
      'effective_from', p_effective_from::text
    ),
    p_effective_from
  );
  return v_request_id;
end; $$;

revoke execute on function core_identity.client_node_place(uuid, uuid, date) from public, anon;

-- ─── client_node_close: tilføj eksistens-check + session-var ────────────
-- INGEN aktiv-check (krav-dok §2.5.2 gælder ikke for lukning).
-- V14: eksistens-check tilføjet (krav-dok §3.4 dækker BÅDE oprettelse OG ændring).
create or replace function core_identity.client_node_close(
  p_client_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_request_id uuid;
begin
  if not core_identity.has_permission('client_placements', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  -- V14 (Code walk-through): klient-eksistens-check (krav-dok §3.4 — "valideres
  -- at klienten faktisk findes" ved BÅDE oprettelse OG ændring). Close er ændring.
  -- Forhindrer silent no-op på ikke-eksisterende client_id.
  if not exists (select 1 from core_identity.clients where id = p_client_id) then
    raise exception 'client_not_found: %', p_client_id using errcode = 'P0002';
  end if;
  -- V9: pending_changes-INSERT-policy kræver session-var.
  perform set_config('stork.t9_write_authorized', 'true', true);
  v_request_id := core_identity.pending_change_request(
    'client_close', p_client_id,
    jsonb_build_object(
      'client_id', p_client_id::text,
      'effective_from', p_effective_from::text
    ),
    p_effective_from
  );
  return v_request_id;
end; $$;

revoke execute on function core_identity.client_node_close(uuid, date) from public, anon;

-- ─── _apply_client_place: tilføj klient-eksistens + aktiv-check FØR INSERT/UPDATE
create or replace function core_identity._apply_client_place(
  p_payload jsonb,
  p_pending_change_id uuid
) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_client_id uuid;
  v_node_id uuid;
  v_effective_from date;
  v_client_active boolean;
  v_active record;
  v_requested_by uuid;
  v_approved_by uuid;
  v_admin_involved boolean;
begin
  v_client_id := (p_payload->>'client_id')::uuid;
  v_node_id := (p_payload->>'node_id')::uuid;
  v_effective_from := (p_payload->>'effective_from')::date;
  if v_client_id is null or v_node_id is null or v_effective_from is null then
    raise exception 'invalid_payload: client_id + node_id + effective_from required'
      using errcode = '22023';
  end if;

  -- Team-aktiv-check (uændret fra T9-supplement).
  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = v_node_id and node_type = 'team' and is_active = true
      and effective_from <= v_effective_from
      and (effective_to is null or effective_to > v_effective_from)
  ) then
    raise exception 'client_placement_requires_active_team: %', v_node_id
      using errcode = 'P0001';
  end if;

  -- V7/Trin 10 (krav-dok §3.4 + §2.5.2): klient skal findes og være aktiv.
  -- Fanger pending oprettet mens aktiv, applied efter deaktivering.
  select is_active into v_client_active
    from core_identity.clients where id = v_client_id;
  if not found then
    raise exception 'apply_client_place: client_not_found: %', v_client_id using errcode = 'P0002';
  end if;

  -- V10 (Codex runde 9 TEKNISK-BLOKERING): bypass kan IKKE bruge is_admin()
  -- fordi auth.uid() er NULL i cron-apply-context. Hent requester+approver fra
  -- pending-rækken og tjek via employee-id-baseret helper.
  v_admin_involved := false;
  if p_pending_change_id is not null then
    select requested_by, approved_by into v_requested_by, v_approved_by
      from core_identity.pending_changes where id = p_pending_change_id;
    v_admin_involved :=
      core_identity.is_admin_by_employee_id(v_requested_by) or
      (v_approved_by is not null and core_identity.is_admin_by_employee_id(v_approved_by));
  end if;

  if v_client_active = false and not v_admin_involved then
    raise exception 'apply_client_place: client_inactive: % (krav-dok §2.5.2)', v_client_id
      using errcode = 'P0001';
  end if;

  -- Resten af apply-handler-logikken er uændret fra T9-supplement
  -- (20260520000000_t9_supplement.sql:321-350): find aktiv placement,
  -- enten INSERT ny, UPDATE eksisterende eller split placement-række.
  select * into v_active
  from core_identity.client_node_placements
  where client_id = v_client_id
    and effective_from <= v_effective_from
    and (effective_to is null or effective_to > v_effective_from)
  limit 1;

  if not found then
    insert into core_identity.client_node_placements
      (client_id, node_id, effective_from, effective_to, created_by_pending_change_id)
    select v_client_id, v_node_id, v_effective_from,
      (select min(effective_from) from core_identity.client_node_placements
       where client_id = v_client_id and effective_from > v_effective_from),
      p_pending_change_id;
  elsif v_active.effective_from = v_effective_from then
    update core_identity.client_node_placements
    set node_id = v_node_id,
        created_by_pending_change_id = coalesce(p_pending_change_id, created_by_pending_change_id),
        updated_at = now()
    where id = v_active.id;
  else
    update core_identity.client_node_placements
    set effective_to = v_effective_from, updated_at = now()
    where id = v_active.id;

exec
/bin/bash -lc "sed -n '130,180p' scripts/fitness.mjs" in /home/mathias/stork-2.0
 succeeded in 0ms:
  // R6: commission_snapshots_candidate + salary_corrections_candidate droppet
  // T9 Plan V6 Valg 3: closure-tabel er current-state-derived fra org_node_versions.
  // Kategori-udvidelse (G-nummer-kandidat for master-plan rettelse 23-udvidelse til derived-tables).
  "core_identity.org_node_closure",
]);

// Audit-tabellen + dens partitioner auditer ikke sig selv (uendelig rekursion).
const AUDIT_LOG_SELF_EXCLUSION_RE = /^core_compliance\.audit_log(_\d{4}_\d{2}|_default)?$/;

// R7d-pattern (legacy-is-active-readers) er specifik for tabeller der har
// BÅDE is_active boolean OG status text (employees-pattern). Funktioner der
// læser is_active=true på tabeller med kun is_active (uden status) er ikke
// R7d-relevante. T9-tabellerne (org_node_versions, employee_node_placements,
// client_node_placements) har is_active som lifecycle-signal alene; ingen
// status-kolonne. Disse er allowlist'et nedenfor.
//
// G-nummer-kandidat: R7d-fitness-check skal eksplicit dokumentere at den er
// employees-specifik (dual-column-pattern). Tabeller med kun is_active skal
// være allowlist'et fra start, ikke retroaktivt.
const LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS = new Set([
  "core_identity._apply_employee_place",
  "core_identity._apply_client_place",
  "core_identity.client_node_place",
  "core_identity.permission_elements_read",
  // T10.16 (V6+V8 Code-validering): client_field_definitions har kun is_active,
  // ingen status-kolonne. R7d-pattern (dual-column employees) gælder ikke.
  "core_identity.client_field_definitions_list",
  "core_identity.clients_validate_fields",
]);

// D3 (master-plan princip 15): Bootstrap-INSERTs i klassifikations- og
// konfig-tabeller skal være idempotente. ON CONFLICT DO NOTHING (eller
// DO UPDATE) sikrer at replay ikke duplikerer eller fejler. Direkte
// INSERT uden ON CONFLICT er drift.
//
// Tabeller der bootstrappes via migration:
const BOOTSTRAP_CONFIG_TABLES = new Set([
  "core_compliance.data_field_definitions",
  "core_compliance.anonymization_mappings",
  "core_compliance.anonymization_strategies",
  "core_compliance.break_glass_operation_types",
  "core_compliance.superadmin_settings",
  "core_identity.roles",
  "core_identity.role_page_permissions",
  "core_identity.employee_active_config",
  "core_money.pay_period_settings",
]);

// Migrationsfiler der er undtaget fra set-config-discipline-check.
// Pre-D6-filer kan indeholde top-level INSERT/UPDATE uden session-vars.
// Migration-filer er historik og modificeres ikke retroaktivt.

exec
/bin/bash -lc 'rg -n "public-wrapper|t9_write_authorized|org_node_upsert|employee_place|employee_remove_from_node|client_node_place|client_node_close|role-swap|legacy-seed|Plan-afvigelser|Plan-afvigelse|G057|G058" docs/coordination/rapport-historik/2026-05-21-trin-10.md docs/coordination/arkiv/trin-10-plan.md docs/teknisk/teknisk-gaeld.md docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md' in /home/mathias/stork-2.0
exec
/bin/bash -lc 'rg -n "org_node_upsert|org_node_deactivate|team_close|employee_place|employee_remove_from_node|client_node_place|client_node_close|t9_write_authorized" supabase/migrations/202605180000*.sql supabase/migrations/20260520000000_t9_supplement.sql supabase/migrations/20260521000008_t10_client_active_check.sql' in /home/mathias/stork-2.0
 succeeded in 0ms:
supabase/migrations/20260518000001_t9_org_nodes.sql:11:-- - _apply_org_node_upsert: NEW node → INSERT identity + INSERT version
supabase/migrations/20260518000001_t9_org_nodes.sql:14:-- - _apply_org_node_deactivate: UPDATE prior version's effective_to
supabase/migrations/20260518000001_t9_org_nodes.sql:17:-- CREATE OR REPLACE pending_change_apply: tilføj cases for org_node_upsert/deactivate.
supabase/migrations/20260518000001_t9_org_nodes.sql:201:create or replace function core_identity._apply_org_node_upsert(
supabase/migrations/20260518000001_t9_org_nodes.sql:263:comment on function core_identity._apply_org_node_upsert(jsonb, uuid) is
supabase/migrations/20260518000001_t9_org_nodes.sql:264:  'T9 Step 2 V4 Beslutning 13: intern apply-handler for org_node_upsert change_type. Payload {id?, name, parent_id?, node_type, is_active, effective_from}. SECURITY DEFINER; revoke from authenticated.';
supabase/migrations/20260518000001_t9_org_nodes.sql:266:revoke execute on function core_identity._apply_org_node_upsert(jsonb, uuid) from public, anon, authenticated;
supabase/migrations/20260518000001_t9_org_nodes.sql:268:create or replace function core_identity._apply_org_node_deactivate(
supabase/migrations/20260518000001_t9_org_nodes.sql:321:comment on function core_identity._apply_org_node_deactivate(jsonb, uuid) is
supabase/migrations/20260518000001_t9_org_nodes.sql:322:  'T9 Step 2 V4 Beslutning 13: intern apply-handler for org_node_deactivate change_type. Lukker prior version + INSERT ny version med is_active=false. SECURITY DEFINER; revoke from authenticated.';
supabase/migrations/20260518000001_t9_org_nodes.sql:324:revoke execute on function core_identity._apply_org_node_deactivate(jsonb, uuid) from public, anon, authenticated;
supabase/migrations/20260518000001_t9_org_nodes.sql:371:    when 'org_node_upsert' then
supabase/migrations/20260518000001_t9_org_nodes.sql:372:      perform core_identity._apply_org_node_upsert(v_change.payload, p_change_id);
supabase/migrations/20260518000001_t9_org_nodes.sql:373:    when 'org_node_deactivate' then
supabase/migrations/20260518000001_t9_org_nodes.sql:374:      perform core_identity._apply_org_node_deactivate(v_change.payload, p_change_id);
supabase/migrations/20260518000001_t9_org_nodes.sql:396:  ('org_node_upsert', 24 * 3600),
supabase/migrations/20260518000001_t9_org_nodes.sql:397:  ('org_node_deactivate', 24 * 3600)
supabase/migrations/20260521000008_t10_client_active_check.sql:1:-- Trin 10 T10.7b: klient-aktiv-check i client_node_place + _apply_client_place
supabase/migrations/20260521000008_t10_client_active_check.sql:15:-- V9 (Codex runde 8 TEKNISK-BLOKERING): wrapper sætter t9_write_authorized FØR
supabase/migrations/20260521000008_t10_client_active_check.sql:18:-- V14 (Code walk-through): client_node_close klient-eksistens-check (P0002) —
supabase/migrations/20260521000008_t10_client_active_check.sql:49:-- ─── client_node_place: tilføj klient-aktiv-check + session-var ─────────
supabase/migrations/20260521000008_t10_client_active_check.sql:50:create or replace function core_identity.client_node_place(
supabase/migrations/20260521000008_t10_client_active_check.sql:84:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260521000008_t10_client_active_check.sql:97:revoke execute on function core_identity.client_node_place(uuid, uuid, date) from public, anon;
supabase/migrations/20260521000008_t10_client_active_check.sql:99:-- ─── client_node_close: tilføj eksistens-check + session-var ────────────
supabase/migrations/20260521000008_t10_client_active_check.sql:102:create or replace function core_identity.client_node_close(
supabase/migrations/20260521000008_t10_client_active_check.sql:119:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260521000008_t10_client_active_check.sql:131:revoke execute on function core_identity.client_node_close(uuid, date) from public, anon;
supabase/migrations/20260521000008_t10_client_active_check.sql:198:  from core_identity.client_node_placements
supabase/migrations/20260521000008_t10_client_active_check.sql:205:    insert into core_identity.client_node_placements
supabase/migrations/20260521000008_t10_client_active_check.sql:208:      (select min(effective_from) from core_identity.client_node_placements
supabase/migrations/20260521000008_t10_client_active_check.sql:212:    update core_identity.client_node_placements
supabase/migrations/20260521000008_t10_client_active_check.sql:218:    update core_identity.client_node_placements
supabase/migrations/20260521000008_t10_client_active_check.sql:221:    insert into core_identity.client_node_placements
supabase/migrations/20260520000000_t9_supplement.sql:7:--   Section C2 — Udvidet SELECT-policy på client_node_placements (Step 3b)
supabase/migrations/20260520000000_t9_supplement.sql:160:-- ─── _apply_employee_place (place-handler) ────────────────────────────────
supabase/migrations/20260520000000_t9_supplement.sql:161:create or replace function core_identity._apply_employee_place(
supabase/migrations/20260520000000_t9_supplement.sql:233:revoke execute on function core_identity._apply_employee_place(jsonb, uuid) from public, anon, authenticated;
supabase/migrations/20260520000000_t9_supplement.sql:322:  from core_identity.client_node_placements
supabase/migrations/20260520000000_t9_supplement.sql:329:    insert into core_identity.client_node_placements
supabase/migrations/20260520000000_t9_supplement.sql:332:      (select min(effective_from) from core_identity.client_node_placements
supabase/migrations/20260520000000_t9_supplement.sql:336:    update core_identity.client_node_placements
supabase/migrations/20260520000000_t9_supplement.sql:342:    update core_identity.client_node_placements
supabase/migrations/20260520000000_t9_supplement.sql:346:    insert into core_identity.client_node_placements
supabase/migrations/20260520000000_t9_supplement.sql:379:  from core_identity.client_node_placements
supabase/migrations/20260520000000_t9_supplement.sql:388:    delete from core_identity.client_node_placements where id = v_active.id;
supabase/migrations/20260520000000_t9_supplement.sql:392:    update core_identity.client_node_placements
supabase/migrations/20260520000000_t9_supplement.sql:401:-- ─── _apply_org_node_upsert (org_node_versions — split-at-boundary) ──────
supabase/migrations/20260520000000_t9_supplement.sql:402:create or replace function core_identity._apply_org_node_upsert(
supabase/migrations/20260520000000_t9_supplement.sql:491:revoke execute on function core_identity._apply_org_node_upsert(jsonb, uuid) from public, anon, authenticated;
supabase/migrations/20260520000000_t9_supplement.sql:493:-- ─── _apply_org_node_deactivate (org_node_versions — close-handler) ──────
supabase/migrations/20260520000000_t9_supplement.sql:494:create or replace function core_identity._apply_org_node_deactivate(
supabase/migrations/20260520000000_t9_supplement.sql:554:revoke execute on function core_identity._apply_org_node_deactivate(jsonb, uuid) from public, anon, authenticated;
supabase/migrations/20260520000000_t9_supplement.sql:556:-- ─── _apply_team_close (orchestrerer org-node-deactivate + placement-cascade) ─
supabase/migrations/20260520000000_t9_supplement.sql:557:create or replace function core_identity._apply_team_close(
supabase/migrations/20260520000000_t9_supplement.sql:589:    raise exception 'team_close_no_active_version_at: % på %', v_node_id, v_effective_from
supabase/migrations/20260520000000_t9_supplement.sql:594:    raise exception 'team_close_not_team: % er %', v_node_id, v_active.node_type
supabase/migrations/20260520000000_t9_supplement.sql:599:    raise exception 'team_close_already_inactive: %', v_node_id
supabase/migrations/20260520000000_t9_supplement.sql:638:    select * from core_identity.client_node_placements
supabase/migrations/20260520000000_t9_supplement.sql:644:      delete from core_identity.client_node_placements where id = v_cli.id;
supabase/migrations/20260520000000_t9_supplement.sql:646:      update core_identity.client_node_placements
supabase/migrations/20260520000000_t9_supplement.sql:656:revoke execute on function core_identity._apply_team_close(jsonb, uuid) from public, anon, authenticated;
supabase/migrations/20260520000000_t9_supplement.sql:659:-- SECTION C2 — Udvidet SELECT-policy på client_node_placements (Step 3b)
supabase/migrations/20260520000000_t9_supplement.sql:665:drop policy if exists client_node_placements_select on core_identity.client_node_placements;
supabase/migrations/20260520000000_t9_supplement.sql:667:create policy client_node_placements_select on core_identity.client_node_placements
supabase/migrations/20260520000000_t9_supplement.sql:682:comment on policy client_node_placements_select on core_identity.client_node_placements is
supabase/migrations/20260520000000_t9_supplement.sql:846:-- ─── Visibility-RPCs: employee_placement_read_at + current-wrapper ───────
supabase/migrations/20260520000000_t9_supplement.sql:847:create or replace function core_identity.employee_placement_read_at(
supabase/migrations/20260520000000_t9_supplement.sql:878:revoke execute on function core_identity.employee_placement_read_at(uuid, date) from public, anon;
supabase/migrations/20260520000000_t9_supplement.sql:879:grant execute on function core_identity.employee_placement_read_at(uuid, date) to authenticated;
supabase/migrations/20260520000000_t9_supplement.sql:881:create or replace function core_identity.employee_placement_read(p_employee_id uuid)
supabase/migrations/20260520000000_t9_supplement.sql:895:  return query select * from core_identity.employee_placement_read_at(p_employee_id, current_date);
supabase/migrations/20260520000000_t9_supplement.sql:899:revoke execute on function core_identity.employee_placement_read(uuid) from public, anon;
supabase/migrations/20260520000000_t9_supplement.sql:900:grant execute on function core_identity.employee_placement_read(uuid) to authenticated;
supabase/migrations/20260520000000_t9_supplement.sql:922:  from core_identity.client_node_placements p
supabase/migrations/20260518000011_t9_classify.sql:74:  -- core_identity.client_node_placements (operationel)
supabase/migrations/20260518000011_t9_classify.sql:75:  ('core_identity', 'client_node_placements', 'id', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'placement-PK'),
supabase/migrations/20260518000011_t9_classify.sql:76:  ('core_identity', 'client_node_placements', 'client_id', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'klient-id (FK i trin 10)'),
supabase/migrations/20260518000011_t9_classify.sql:77:  ('core_identity', 'client_node_placements', 'node_id', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'FK org_nodes (team)'),
supabase/migrations/20260518000011_t9_classify.sql:78:  ('core_identity', 'client_node_placements', 'effective_from', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'placement-start'),
supabase/migrations/20260518000011_t9_classify.sql:79:  ('core_identity', 'client_node_placements', 'effective_to', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'placement-slut'),
supabase/migrations/20260518000011_t9_classify.sql:80:  ('core_identity', 'client_node_placements', 'applied_at', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'apply'),
supabase/migrations/20260518000011_t9_classify.sql:81:  ('core_identity', 'client_node_placements', 'created_by_pending_change_id', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'FK pending'),
supabase/migrations/20260518000011_t9_classify.sql:82:  ('core_identity', 'client_node_placements', 'created_at', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'created'),
supabase/migrations/20260518000011_t9_classify.sql:83:  ('core_identity', 'client_node_placements', 'updated_at', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'updated'),
supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:40:      'org_nodes', 'employee_placements', 'client_placements', 'permissions',
supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:57:      when v_page_record.page_key = 'employee_placements' then 'org_structure'
supabase/migrations/20260518000008_t9_read_rpcs.sql:30:-- ─── 4.2 employee_placement_read + _at ──────────────────────────────────
supabase/migrations/20260518000008_t9_read_rpcs.sql:31:create or replace function core_identity.employee_placement_read_at(
supabase/migrations/20260518000008_t9_read_rpcs.sql:43:create or replace function core_identity.employee_placement_read(p_employee_id uuid)
supabase/migrations/20260518000008_t9_read_rpcs.sql:46:  select * from core_identity.employee_placement_read_at(p_employee_id, current_date);
supabase/migrations/20260518000008_t9_read_rpcs.sql:56:  from core_identity.client_node_placements
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:8:-- ─── org_node_upsert (pending) ──────────────────────────────────────────
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:9:create or replace function core_identity.org_node_upsert(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:30:    'org_node_upsert',
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:44:revoke execute on function core_identity.org_node_upsert(uuid, text, uuid, text, boolean, date) from public, anon;
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:46:-- ─── org_node_deactivate (pending) ──────────────────────────────────────
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:47:create or replace function core_identity.org_node_deactivate(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:57:    'org_node_deactivate', p_node_id,
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:63:revoke execute on function core_identity.org_node_deactivate(uuid, date) from public, anon;
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:65:-- ─── team_close (pending) ───────────────────────────────────────────────
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:66:create or replace function core_identity.team_close(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:85:    'team_close', p_node_id,
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:91:revoke execute on function core_identity.team_close(uuid, date) from public, anon;
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:93:-- ─── employee_place (pending) ───────────────────────────────────────────
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:94:create or replace function core_identity.employee_place(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:101:  if not core_identity.has_permission('employee_placements', 'manage', true) then
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:105:    'employee_place', p_employee_id,
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:115:revoke execute on function core_identity.employee_place(uuid, uuid, date) from public, anon;
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:117:-- ─── employee_remove_from_node (pending) ────────────────────────────────
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:118:create or replace function core_identity.employee_remove_from_node(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:124:  if not core_identity.has_permission('employee_placements', 'manage', true) then
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:137:revoke execute on function core_identity.employee_remove_from_node(uuid, date) from public, anon;
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:139:-- ─── client_node_place (pending) ────────────────────────────────────────
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:140:create or replace function core_identity.client_node_place(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:170:revoke execute on function core_identity.client_node_place(uuid, uuid, date) from public, anon;
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:172:-- ─── client_node_close (pending) ────────────────────────────────────────
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:173:create or replace function core_identity.client_node_close(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:192:revoke execute on function core_identity.client_node_close(uuid, date) from public, anon;
supabase/migrations/20260518000004_t9_client_node_placements.sql:1:-- Trin 9 / §4 trin 9 Step 5: client_node_placements (uden client-FK) + apply-handlers.
supabase/migrations/20260518000004_t9_client_node_placements.sql:13:create table core_identity.client_node_placements (
supabase/migrations/20260518000004_t9_client_node_placements.sql:26:comment on table core_identity.client_node_placements is
supabase/migrations/20260518000004_t9_client_node_placements.sql:29:create unique index client_node_placements_open_per_client
supabase/migrations/20260518000004_t9_client_node_placements.sql:30:  on core_identity.client_node_placements (client_id)
supabase/migrations/20260518000004_t9_client_node_placements.sql:33:alter table core_identity.client_node_placements
supabase/migrations/20260518000004_t9_client_node_placements.sql:34:  add constraint client_node_placements_no_overlap
supabase/migrations/20260518000004_t9_client_node_placements.sql:40:create index client_node_placements_node_id on core_identity.client_node_placements (node_id);
supabase/migrations/20260518000004_t9_client_node_placements.sql:41:create index client_node_placements_effective on core_identity.client_node_placements (effective_from, effective_to);
supabase/migrations/20260518000004_t9_client_node_placements.sql:43:alter table core_identity.client_node_placements enable row level security;
supabase/migrations/20260518000004_t9_client_node_placements.sql:44:alter table core_identity.client_node_placements force row level security;
supabase/migrations/20260518000004_t9_client_node_placements.sql:46:revoke all on table core_identity.client_node_placements from public, anon, service_role;
supabase/migrations/20260518000004_t9_client_node_placements.sql:47:grant select on table core_identity.client_node_placements to authenticated;
supabase/migrations/20260518000004_t9_client_node_placements.sql:50:create policy client_node_placements_select on core_identity.client_node_placements
supabase/migrations/20260518000004_t9_client_node_placements.sql:53:create trigger client_node_placements_audit
supabase/migrations/20260518000004_t9_client_node_placements.sql:54:  after insert or update or delete on core_identity.client_node_placements
supabase/migrations/20260518000004_t9_client_node_placements.sql:81:create trigger client_node_placements_team_only
supabase/migrations/20260518000004_t9_client_node_placements.sql:82:  before insert or update on core_identity.client_node_placements
supabase/migrations/20260518000004_t9_client_node_placements.sql:109:  update core_identity.client_node_placements
supabase/migrations/20260518000004_t9_client_node_placements.sql:114:  insert into core_identity.client_node_placements
supabase/migrations/20260518000004_t9_client_node_placements.sql:143:  update core_identity.client_node_placements
supabase/migrations/20260518000004_t9_client_node_placements.sql:193:    when 'org_node_upsert' then
supabase/migrations/20260518000004_t9_client_node_placements.sql:194:      perform core_identity._apply_org_node_upsert(v_change.payload, p_change_id);
supabase/migrations/20260518000004_t9_client_node_placements.sql:195:    when 'org_node_deactivate' then
supabase/migrations/20260518000004_t9_client_node_placements.sql:196:      perform core_identity._apply_org_node_deactivate(v_change.payload, p_change_id);
supabase/migrations/20260518000004_t9_client_node_placements.sql:197:    when 'employee_place' then
supabase/migrations/20260518000004_t9_client_node_placements.sql:198:      perform core_identity._apply_employee_place(v_change.payload, p_change_id);
supabase/migrations/20260518000004_t9_client_node_placements.sql:201:    when 'team_close' then
supabase/migrations/20260518000004_t9_client_node_placements.sql:202:      perform core_identity._apply_team_close(v_change.payload, p_change_id);
supabase/migrations/20260518000003_t9_employee_node_placements.sql:9:-- - _apply_employee_place: åbn ny placement; luk prior open hvis flyt
supabase/migrations/20260518000003_t9_employee_node_placements.sql:11:-- - _apply_team_close: ny org_node_version med is_active=false + luk alle åbne placements
supabase/migrations/20260518000003_t9_employee_node_placements.sql:12:--   (V5 KOSMETISK: handler er i Step 4 fordi den rører primært employee_placements)
supabase/migrations/20260518000003_t9_employee_node_placements.sql:62:-- ─── _apply_employee_place ──────────────────────────────────────────────
supabase/migrations/20260518000003_t9_employee_node_placements.sql:63:create or replace function core_identity._apply_employee_place(
supabase/migrations/20260518000003_t9_employee_node_placements.sql:110:revoke execute on function core_identity._apply_employee_place(jsonb, uuid) from public, anon, authenticated;
supabase/migrations/20260518000003_t9_employee_node_placements.sql:148:-- ─── _apply_team_close ──────────────────────────────────────────────────
supabase/migrations/20260518000003_t9_employee_node_placements.sql:149:-- V5-sweep: team_close-handler er i Step 4 (rører primært placements).
supabase/migrations/20260518000003_t9_employee_node_placements.sql:151:create or replace function core_identity._apply_team_close(
supabase/migrations/20260518000003_t9_employee_node_placements.sql:179:    raise exception 'team_close_no_open_version: %', v_node_id
supabase/migrations/20260518000003_t9_employee_node_placements.sql:184:    raise exception 'team_close_not_team: % er %', v_node_id, v_current_version.node_type
supabase/migrations/20260518000003_t9_employee_node_placements.sql:189:    raise exception 'team_close_already_inactive: %', v_node_id
supabase/migrations/20260518000003_t9_employee_node_placements.sql:209:  -- Luk alle åbne client_node_placements på team (Step 5 tilføjer tabellen;
supabase/migrations/20260518000003_t9_employee_node_placements.sql:211:  -- Note: client_node_placements oprettes i Step 5 — denne UPDATE bliver
supabase/migrations/20260518000003_t9_employee_node_placements.sql:213:  if exists (select 1 from pg_class where relname = 'client_node_placements' and relnamespace = (select oid from pg_namespace where nspname = 'core_identity')) then
supabase/migrations/20260518000003_t9_employee_node_placements.sql:214:    execute 'update core_identity.client_node_placements set effective_to = $1, updated_at = now() where node_id = $2 and effective_to is null'
supabase/migrations/20260518000003_t9_employee_node_placements.sql:222:revoke execute on function core_identity._apply_team_close(jsonb, uuid) from public, anon, authenticated;
supabase/migrations/20260518000003_t9_employee_node_placements.sql:266:    when 'org_node_upsert' then
supabase/migrations/20260518000003_t9_employee_node_placements.sql:267:      perform core_identity._apply_org_node_upsert(v_change.payload, p_change_id);
supabase/migrations/20260518000003_t9_employee_node_placements.sql:268:    when 'org_node_deactivate' then
supabase/migrations/20260518000003_t9_employee_node_placements.sql:269:      perform core_identity._apply_org_node_deactivate(v_change.payload, p_change_id);
supabase/migrations/20260518000003_t9_employee_node_placements.sql:270:    when 'employee_place' then
supabase/migrations/20260518000003_t9_employee_node_placements.sql:271:      perform core_identity._apply_employee_place(v_change.payload, p_change_id);
supabase/migrations/20260518000003_t9_employee_node_placements.sql:274:    when 'team_close' then
supabase/migrations/20260518000003_t9_employee_node_placements.sql:275:      perform core_identity._apply_team_close(v_change.payload, p_change_id);
supabase/migrations/20260518000003_t9_employee_node_placements.sql:293:select set_config('stork.change_reason', 'T9 Step 4: seed undo_settings for employee_place/remove + team_close', false);
supabase/migrations/20260518000003_t9_employee_node_placements.sql:297:  ('employee_place', 24 * 3600),
supabase/migrations/20260518000003_t9_employee_node_placements.sql:299:  ('team_close', 24 * 3600)

 succeeded in 1ms:
docs/teknisk/teknisk-gaeld.md:17:### [G058] MELLEM — FK-coverage-fitness-check ikke implementeret per master-plan §3 punkt 19
docs/teknisk/teknisk-gaeld.md:19:- **Beskrivelse:** Master-plan §3 punkt 19 specificerer fitness-check der identificerer kolonner med suffix `_id` og verificerer at de har FK-constraint mod kolonnens ankerentitet. Allowlist `FK_COVERAGE_EXEMPTIONS` skal dokumentere tilladte undtagelser (fx `external_id`, `client_crm_match_id`). Check findes IKKE i `scripts/fitness.mjs`. T9-migration `20260518000004_t9_client_node_placements.sql:5` har forhåndsdokumentation der ikke matcher nuværende fitness-script-state.
docs/teknisk/teknisk-gaeld.md:24:- **Plan:** Tilføj `fkCoverage()` fitness-check med `FK_COVERAGE_EXEMPTIONS`-allowlist. Eksisterende exemption-kandidater fra master-plan: `external_id`, `client_crm_match_id` (sidstnævnte fjernes når match-mekanik bygges). Trin 10's FK på `client_node_placements.client_id` (T10.7) eliminerer behov for entry der.
docs/teknisk/teknisk-gaeld.md:26:### [G057] MELLEM — T9 forretnings-invariants uden superadmin-bypass (inkonsistent med Mathias 2026-05-21)
docs/teknisk/teknisk-gaeld.md:564:- **Beskrivelse:** Alle 6 T9-smoke-tests havde table-existence guards (tilføjet under T9-build for at undgå fail pre-deploy). Under build skipped testene → falsk grøn. Først post-deploy (efter PR #40) prøvede testene at køre rigtigt og afslørede design-bugs. 4 lag af fail under PR #43-CI: (1) M1 superadmin manglede permission-rows for T9-RPCs, (2) `t9_grants_and_helpers` `roles where name = 'admin'` skulle være `'superadmin'` (R1B), (3) `t9_grants_and_helpers` direkte INSERT i `employee_node_placements` for mg@/km@ brød partial UNIQUE pga. Step 12 seed, (4) `t9_placements` `_apply_employee_place` på seed-employee brød CHECK-constraint pga. backdated effective_from (Codex KRITISK 4 manifesteret).
docs/teknisk/teknisk-gaeld.md:580:  4. `TX_WRAP_REQUIRED_FOR_TEST_INSERT` udvidet med 9 T9 mutable state-tabeller (`org_nodes`, `org_node_versions`, `employee_node_placements`, `client_node_placements`, `pending_changes`, `role_permission_grants`, `permission_areas/pages/tabs`) — låser BEGIN/ROLLBACK-mønstret for fremtidige tilføjelser.
docs/coordination/arkiv/trin-10-plan.md:17:| 1   | KRITISK/FUNKTIONELT | T10.7b `client_node_close` | Wrapper mangler klient-eksistens-check. Bryder krav-dok §3.4 "valideres at klienten faktisk findes" ved BÅDE oprettelse OG ændring. Close er en ændring. Uden check: pending oprettes på ikke-eksisterende client_id → `_apply_client_close` UPDATE'er 0 rows → silent no-op. `client_node_place` har check siden V7; `client_node_close` blev tilføjet i V9 uden check. | **ACCEPT.** Tilføj `if not exists (select 1 from core_identity.clients where id = p_client_id) then raise P0002` i `client_node_close` wrapper FØR session-var + pending_change_request. Konsistent med client_node_place's mønster. | T10.7b + T10.15 |
docs/coordination/arkiv/trin-10-plan.md:27:| 1   | TEKNISK-BLOKERING | T10.15 `t10_client_active_check.sql` | T9 seed (`20260518000004:228-229`) sætter `undo_settings.undo_period_seconds = 24*3600` for `client_place`/`client_close`. `pending_change_apply` stopper med `not_yet_due` før dispatch til `_apply_client_place`. Test rammer due-gate, ikke aktiv-checken. | **ACCEPT.** T10.15 udvidet med setup-disciplin: BEGIN-blokken sætter `set_config('stork.t9_write_authorized', 'true', true)` + UPDATE `undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place', 'client_close')` transaction-local. ROLLBACK ved test-slut sikrer ingen lækage. | T10.15     |
docs/coordination/arkiv/trin-10-plan.md:43:| 1   | KRITISK           | Fundament-tjek               | Tabellen nævner kun T10.8/T10.9/T10.10/T10.11 + T10.13. V10 tilføjer/ændrer write-veje i T10.7b (`client_node_place`, `client_node_close`, `_apply_client_place`) + T10.10a (`client_field_definition_set_active`) — manglende krydstjek. | **ACCEPT.** Fundament-tjek-tabel udvidet med T10.7b (GRANT/policy/session-var + apply-dispatch + jsonb payload producer/consumer) og T10.10a. Eksempel-row-tjek udvidet med immutable-key + pii-downgrade-block + active-check. |
docs/coordination/arkiv/trin-10-plan.md:44:| 2   | G-NUMMER-KANDIDAT | T10.16 / Oprydnings-strategi | T10.16 nævner FK-coverage som G-nummer-kandidat, men oprydnings-strategi siger "Ingen G-numre forventet". Inkonsistent.                                                                                                                   | **ACCEPT.** **G058** registreret i `docs/teknisk/teknisk-gaeld.md` (FK-coverage-fitness-check ikke implementeret per master-plan §3.19). Oprydnings-strategi opdateret til at angive G057 + G058 som del af trin 10.            |
docs/coordination/arkiv/trin-10-plan.md:68:| 1   | TEKNISK-BLOKERING         | T10.7b + client_node_close | `client_node_place` kalder `pending_change_request` som INSERT'er i `core_identity.pending_changes`. Tabellen har INSERT-policy (T9-fundament-supplement `20260518100000:49-51`) der kræver `current_setting('stork.t9_write_authorized', true) = 'true'`. T10.7b's CREATE OR REPLACE sætter ikke session-var → INSERT vil fejle for authenticated-bruger med FORCE RLS. Samme latente T9-bug findes i `client_node_close` (uændret af V8) og de øvrige 5 T9-pending-wrappers (org*node_upsert, etc.) — men trin 10's scope er kun client-RPC'erne. **Code walk-through missede dette** fordi T9-tests bruger `\_apply*\*`-handlers direkte, aldrig fuld wrapper-vej. | **ACCEPT.** T10.7b udvides: `client_node_place` sætter `set_config('stork.t9_write_authorized', 'true', true)` efter aktiv-check, før `pending_change_request`. Plus ny CREATE OR REPLACE af `client_node_close` med samme session-var (uden aktiv-check — `client_node_close` skal kunne lukke placement på inaktiv klient). Default-privileges på `core_identity` schema (`grant execute on functions to authenticated`, T1) dækker GRANT-kravet — explicit GRANT er ikke nødvendigt. | T10.7b udvidet |
docs/coordination/arkiv/trin-10-plan.md:71:**T9-public-wrapper-bug (Code-observation):** Codex' fund afslører at T9's 7 public-wrappers (`org_node_upsert`, `org_node_deactivate`, `team_close`, `employee_place`, `employee_remove_from_node`, `client_node_place`, `client_node_close`) alle mangler `t9_write_authorized`-session-var. Trin 10's scope er kun de to client-RPC'er; de øvrige 5 er T9-arbejde der skal adresseres som G-nummer/separat pakke (T9 ville fungere i tests fordi `_apply_*`-handlers er SECURITY DEFINER og kan kaldes direkte, men authenticated-bruger via wrapper-vej er broken).
docs/coordination/arkiv/trin-10-plan.md:106:| 1   | KRITISK  | T10.7 (FK)         | FK sikrer KUN eksistens, ikke at klient er aktiv. Krav-dok §2.5.2: "Inaktiv klient bliver stående for historik, men kan ikke vælges som ny team-tilknytning." T9-wrapper `client_node_place` (`20260518000007:140-170`) validerer permission + team-only, men ikke aktiv klient. T9-supplement `_apply_client_place` (`20260520000000:285-352`) validerer team-only + team-aktiv, men ikke klient-aktiv. Krav-dok §3.4 siger "valideres at klienten faktisk findes" — sammen med §2.5.2 betyder det: findes + aktiv. Plus: pending kan oprettes mens klient aktiv og applies efter deaktivering → apply-pathen SKAL også tjekke. | **ACCEPT.** Ny step T10.7b: CREATE OR REPLACE begge RPC'er med aktiv-check **og superadmin-bypass** (Mathias 2026-05-21: "superadmin må alt"). Wrapper-rækkefølge: has_permission → team-check → klient-eksistens (P0002) → klient-aktiv (22023 hvis ikke superadmin). Apply-handler: tilføj klient-eksistens (P0002) + klient-aktiv (P0001 hvis ikke superadmin) FØR INSERT/UPDATE. `client_node_close` rør IKKE. | T10.7b (ny) + T10.15          |
docs/coordination/arkiv/trin-10-plan.md:126:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/arkiv/trin-10-plan.md:128:| 6   | KRITISK             | T10.15 `t10_client_node_placements_fk.sql`      | Smoke-test INSERT'er i `core_identity.client_node_placements` som er på `TX_WRAP_REQUIRED_FOR_TEST_INSERT` (`scripts/fitness.mjs:110`). Fitness-check `db-test-tx-wrap-on-immutable-insert` (`:901-924`) kræver `begin;` + `rollback;` på linje-niveau.                                                                                                | Code-validering  | **ACCEPT.** Eksplicit `begin;` + `rollback;` wrap-pattern i T10.15's FK-test specifikation. T10.7a's fixture-INSERT i T9-tests sker indenfor eksisterende BEGIN/ROLLBACK (verificeret: `t9_placements.sql:9` + `:213`, `t9_backdated_historical_traversal.sql:9` + `:311`).                                                                                                                            |
docs/coordination/arkiv/trin-10-plan.md:150:| 1   | KRITISK  | T10.13  | T10.13 sætter `stork.source_type` + `stork.change_reason` men IKKE `stork.t9_write_authorized = 'true'` som T9-supplements INSERT-policies på `permission_pages` / `permission_tabs` / `role_permission_grants` kræver. Brudt niveau 1-prefix end-to-end-tjek for INSERT/UPDATE/DELETE-veje (GRANT + policy + session-var-tre-pak). | **ACCEPT.** Tilføj `select set_config('stork.t9_write_authorized', 'true', false);` før INSERTs i T10.13. Opdater Fundament-tjek-tabel. | T10.13 + Fundament-tjek |
docs/coordination/arkiv/trin-10-plan.md:199:| `core_compliance.stork_audit()` trigger-funktion                                                       | Refereret af alle T9-tabeller (`20260518000004_t9_client_node_placements.sql:55` etc.)                         | Generel audit-trigger der bruges `AFTER INSERT OR UPDATE OR DELETE` på alle write-tabeller. Skriver til `core_compliance.audit_log` via `audit_filter_values`.                                                                                                                                                                                                                                          |
docs/coordination/arkiv/trin-10-plan.md:201:| `core_identity.client_node_placements` (tabel)                                                         | `supabase/migrations/20260518000004_t9_client_node_placements.sql:13-24`                                       | `id, client_id uuid NOT NULL (UDEN FK — Plan V6 Valg 4: FK tilføjes i trin 10), node_id FK → org_nodes, effective_from/to date, applied_at, created_by_pending_change_id`.                                                                                                                                                                                                                              |
docs/coordination/arkiv/trin-10-plan.md:202:| T9-supplement `client_node_placements_select` policy                                                   | `supabase/migrations/20260520000000_t9_supplement.sql:665-683`                                                 | `using (is_admin() OR node_id = ANY(acl_subtree_org_nodes_at(current_employee_id(), coalesce(current_setting('stork.t9_read_at_date',true)::date, current_date))))`. **Trin 10 ændrer ikke policy** — kun tilføjer FK.                                                                                                                                                                                  |
docs/coordination/arkiv/trin-10-plan.md:203:| `core_identity._apply_client_place(p_payload jsonb, p_pending_change_id uuid)`                         | `supabase/migrations/20260518000004_t9_client_node_placements.sql:86-119`                                      | SECURITY DEFINER apply-handler. INSERT i client_node_placements.                                                                                                                                                                                                                                                                                                                                        |
docs/coordination/arkiv/trin-10-plan.md:204:| `core_identity._apply_client_close(p_payload jsonb, p_pending_change_id uuid)`                         | `supabase/migrations/20260518000004_t9_client_node_placements.sql:123-147`                                     | SECURITY DEFINER apply-handler. UPDATE effective_to.                                                                                                                                                                                                                                                                                                                                                    |
docs/coordination/arkiv/trin-10-plan.md:205:| `core_identity.client_node_place(p_client_id, p_node_id, p_effective_from)` wrapper                    | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:140-170`                                        | Wrapper-RPC med `has_permission('client_placements', 'manage', true)`. Pre-checker node_id = team. Opretter pending_change.                                                                                                                                                                                                                                                                             |
docs/coordination/arkiv/trin-10-plan.md:206:| `core_identity.client_node_close(p_client_id, p_effective_from)` wrapper                               | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:173-192`                                        | Wrapper-RPC med `has_permission('client_placements', 'manage', true)`.                                                                                                                                                                                                                                                                                                                                  |
docs/coordination/arkiv/trin-10-plan.md:215:| T9-smoke-test `t9_backdated_historical_traversal.sql` BLOCK 3                                          | `supabase/tests/smoke/t9_backdated_historical_traversal.sql:165-305`                                           | Linje 167, 172, 185, 276 INSERT'er direkte i client_node_placements + kalder `_apply_client_place` med tilfældige client_id'er. Brækker ved FK.                                                                                                                                                                                                                                                         |
docs/coordination/arkiv/trin-10-plan.md:242:- FK `core_identity.client_node_placements.client_id` → `core_identity.clients.id`
docs/coordination/arkiv/trin-10-plan.md:267:**Begrundelse:** Master-plan §1.11 placerer klienter i core_identity. T9's `client_node_placements` ligger allerede i core_identity. Konsistent skema-placering.
docs/coordination/arkiv/trin-10-plan.md:319:  - **Plan-konsekvens:** T10.7b CREATE OR REPLACE både `client_node_place` (wrapper) og `_apply_client_place` (apply-handler) med aktiv-check og `is_admin()`-bypass. `client_node_close` rør IKKE — lukning er legitim ved deaktivering. Eksistens-check (P0002) bypasses IKKE for superadmin (FK håndhæver alligevel).
docs/coordination/arkiv/trin-10-plan.md:768:### T10.7 — FK fra `client_node_placements.client_id` til `clients.id`
docs/coordination/arkiv/trin-10-plan.md:775:  alter table core_identity.client_node_placements
docs/coordination/arkiv/trin-10-plan.md:776:    add constraint client_node_placements_client_id_fkey
docs/coordination/arkiv/trin-10-plan.md:782:- **Migration-fil:** `supabase/migrations/<ts>_t10_client_node_placements_fk.sql`
docs/coordination/arkiv/trin-10-plan.md:800:  Pattern (én blok per test, FØR første client_node_placements-write):
docs/coordination/arkiv/trin-10-plan.md:805:  perform set_config('stork.change_reason', 'test fixture for client_node_placements', true);
docs/coordination/arkiv/trin-10-plan.md:815:### T10.7b — CREATE OR REPLACE `client_node_place` + `_apply_client_place` med klient-aktiv-check (V7 — Mathias-terminal-V6 #1)
docs/coordination/arkiv/trin-10-plan.md:823:  - **`client_node_close` rør IKKE:** Lukning af placement ved klient-deaktivering er legitim forretnings-flow. Aktiv-check her ville blokere det.
docs/coordination/arkiv/trin-10-plan.md:854:  create or replace function core_identity.client_node_place(
docs/coordination/arkiv/trin-10-plan.md:887:    -- (T9-fundament-supplement) kræver session-var. T9-public-wrapper sætter
docs/coordination/arkiv/trin-10-plan.md:889:    perform set_config('stork.t9_write_authorized', 'true', true);
docs/coordination/arkiv/trin-10-plan.md:902:  revoke execute on function core_identity.client_node_place(uuid, uuid, date) from public, anon;
docs/coordination/arkiv/trin-10-plan.md:904:  -- V9 (Codex runde 8 TEKNISK-BLOKERING): client_node_close får også t9_write_authorized.
docs/coordination/arkiv/trin-10-plan.md:909:  create or replace function core_identity.client_node_close(
docs/coordination/arkiv/trin-10-plan.md:926:    perform set_config('stork.t9_write_authorized', 'true', true);
docs/coordination/arkiv/trin-10-plan.md:938:  revoke execute on function core_identity.client_node_close(uuid, date) from public, anon;
docs/coordination/arkiv/trin-10-plan.md:1005:    from core_identity.client_node_placements
docs/coordination/arkiv/trin-10-plan.md:1012:      insert into core_identity.client_node_placements
docs/coordination/arkiv/trin-10-plan.md:1015:        (select min(effective_from) from core_identity.client_node_placements
docs/coordination/arkiv/trin-10-plan.md:1019:      update core_identity.client_node_placements
docs/coordination/arkiv/trin-10-plan.md:1025:      update core_identity.client_node_placements
docs/coordination/arkiv/trin-10-plan.md:1028:      insert into core_identity.client_node_placements
docs/coordination/arkiv/trin-10-plan.md:1475:  -- / permission_tabs / role_permission_grants kræver stork.t9_write_authorized.
docs/coordination/arkiv/trin-10-plan.md:1476:  select set_config('stork.t9_write_authorized', 'true', false);
docs/coordination/arkiv/trin-10-plan.md:1524:  - §4 trin 10-række: erstat hele cellen med: "Klient-skabelon (core_identity.clients + client_field_definitions + logo + is_active + FK fra client_node_placements + has_permission-RPCs)". Migration-tekst og crm_match_id-tekst fjernes.
docs/coordination/arkiv/trin-10-plan.md:1541:  | `supabase/tests/smoke/t10_client_node_placements_fk.sql`                                    | FK virker: INSERT med ikke-eksisterende client_id fejler. DELETE af klient med åbne placements fejler RESTRICT. **V6 (Code-validering fund #6):** Test SKAL være `begin;` + `rollback;`-wrapped (linje-niveau) — `core_identity.client_node_placements` er på `TX_WRAP_REQUIRED_FOR_TEST_INSERT` (`scripts/fitness.mjs:110`). Fitness-check `db-test-tx-wrap-on-immutable-insert` blokerer ellers.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
docs/coordination/arkiv/trin-10-plan.md:1543:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T4a (V14):** `client_node_close` på ikke-eksisterende client_id → forvent **P0002 `client_not_found`** (eksistens-check tilføjet i V14). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/arkiv/trin-10-plan.md:1553:  1. **FK-coverage-allowlist:** `FK_COVERAGE_EXEMPTIONS`-allowlist findes IKKE i nuværende `scripts/fitness.mjs` — master-plan §3 punkt 19 er ikke implementeret endnu. Hvis check tilføjes senere, vil `client_node_placements.client_id` ikke længere være en exemption-kandidat (FK eksisterer efter T10.7). **Ingen fitness-script-ændring nødvendig for FK i V6.**
docs/coordination/arkiv/trin-10-plan.md:1560:    "core_identity._apply_employee_place",
docs/coordination/arkiv/trin-10-plan.md:1562:    "core_identity.client_node_place",
docs/coordination/arkiv/trin-10-plan.md:1579:| Hver write-RPC har GRANT + INSERT/UPDATE-policy + session-var  | ja     | T10.8/T10.9/T10.10/T10.10a/T10.11 — `stork.allow_clients_write` / `allow_client_field_definitions_write` + `revoke/grant execute` + has_permission('manage', true). **T10.7b** (`client_node_place` + `client_node_close` + `_apply_client_place`) — `stork.t9_write_authorized = 'true'` før `pending_change_request` (V9-fix); apply-handler tjekker eksistens (P0002) + aktiv (P0001) med employee-id-baseret admin-bypass (V10-fix); pending_change_apply-dispatcher (T9-supplement) cases `client_place` + `client_close` ramt automatisk. **T10.13** (permission-seed) — `stork.t9_write_authorized` (V4-fix) som krævet af T9-supplement's INSERT-policies på permission_pages/tabs/role_permission_grants. Default-privileges på `core_identity` schema (T1: `grant execute on functions to authenticated`) dækker GRANT for alle T10-RPC'er. |
docs/coordination/arkiv/trin-10-plan.md:1580:| Hver SELECT-policy bred nok til legitime læsere                | ja     | T10.1, T10.2 — has_permission('clients'/'client_field_definitions', 'manage', false) **tab-aware (V6-fix)**. T10.13 seeder kun tab-grants → null-tab matcher ikke; 'manage' matcher. T9-supplement's ACL-scoped policy på client_node_placements bevares uændret.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
docs/coordination/arkiv/trin-10-plan.md:1593:| `t10_client_node_placements_fk.sql` | FK afviser ikke-eksisterende client_id; ON DELETE RESTRICT                                                            | grøn             |
docs/coordination/arkiv/trin-10-plan.md:1619:  - T9-supplement's `client_node_placements_select` policy uændret
docs/coordination/arkiv/trin-10-plan.md:1673:| `docs/teknisk/teknisk-gaeld.md`            | ja          | G057 (T9 forretnings-invariants uden superadmin-bypass) + G058 (FK-coverage-fitness-check ikke implementeret per master-plan §3.19) registreret i forbindelse med trin 10 |
docs/coordination/arkiv/trin-10-plan.md:1708:- T10.7b `client_node_close`: tilføjet klient-eksistens-check (P0002) FØR session-var + pending_change_request. Krav-dok §3.4-konformitet: "valideres at klienten faktisk findes" ved BÅDE oprettelse OG ændring. V13 havde checken kun på client_node_place; close-vejen var silent no-op ved ikke-eksisterende client_id.
docs/coordination/arkiv/trin-10-plan.md:1709:- T10.15 smoke-test T4a tilføjet: `client_node_close` med non-existent client_id → P0002.
docs/coordination/arkiv/trin-10-plan.md:1722:- Fundament-tjek-tabel udvidet med T10.7b's komplette write-vej (`client_node_place` + `client_node_close` + `_apply_client_place` + apply-dispatch + jsonb producer/consumer) + T10.10a (`client_field_definition_set_active`).
docs/coordination/arkiv/trin-10-plan.md:1723:- G058 registreret i teknisk-gaeld.md (FK-coverage-fitness-check ikke implementeret per master-plan §3.19). Oprydnings-strategi-tabel opdateret til "ja" på teknisk-gaeld med G057 + G058.
docs/coordination/arkiv/trin-10-plan.md:1729:- Wrapper `client_node_place` beholder `is_admin()` (auth-context er garanteret).
docs/coordination/arkiv/trin-10-plan.md:1734:- T10.7b udvidet: `client_node_place` + ny CREATE OR REPLACE af `client_node_close` sætter `stork.t9_write_authorized = 'true'` før `pending_change_request`. T9-fundament-supplement's `pending_changes_insert`-policy kræver session-var (Codex runde 8 TEKNISK-BLOKERING).
docs/coordination/arkiv/trin-10-plan.md:1749:- **Ny T10.7b:** CREATE OR REPLACE `client_node_place` + `_apply_client_place` med klient-aktiv-check og **superadmin-bypass**. Krav-dok §2.5.2 håndhæves i både wrapper og apply-path (apply fanger pending oprettet mens aktiv, applied efter deaktivering).
docs/coordination/arkiv/trin-10-plan.md:1759:- T10.15 `t10_client_node_placements_fk.sql`: eksplicit `begin;` + `rollback;` wrap — `client_node_placements` på `TX_WRAP_REQUIRED_FOR_TEST_INSERT` (Code-validering #6).
docs/coordination/arkiv/trin-10-plan.md:1768:- T10.13: tilføjet `set_config('stork.t9_write_authorized', 'true', false)` før INSERTs — krævet af T9-supplement's INSERT-policies på permission_pages/tabs/role_permission_grants (Codex V3 KRITISK).
docs/coordination/rapport-historik/2026-05-21-trin-10.md:20:           t10_client_logo, t10_client_node_placements_fk, t10_client_active_check
docs/coordination/rapport-historik/2026-05-21-trin-10.md:22:Plan-afvigelser: 1 (T10.13b workaround — refactored til grant-model i runde 3)
docs/coordination/rapport-historik/2026-05-21-trin-10.md:23:G-numre tilføjet: G057, G058
docs/coordination/rapport-historik/2026-05-21-trin-10.md:39:| T10.7 FK `client_node_placements.client_id`          | leveret | `20260521000007_t10_client_node_placements_fk.sql`; t10_client_node_placements_fk.sql      |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:62:| WORKAROUND     | T10.13b legacy-seed (post-build M1-test compat)     | 3    | Mathias-gate → refactor til grant-model | mathias-afgoerelser 2026-05-21                     |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:74:| FK-coverage-fitness-check                                      | runde 10 | DEFER       | G058 — kræver fitness-arkitektur-arbejde uden for trin 10's scope   |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:75:| T9-public-wrapper-bug (5 RPC'er mangler `t9_write_authorized`) | runde 8  | DEFER       | Ud over scope (T9-fundament); flag som separat pakke; G-kandidat    |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:81:## Plan-afvigelser
docs/coordination/rapport-historik/2026-05-21-trin-10.md:83:- **Hvad:** T10.13b legacy-seed migration tilføjet under build (workaround for M1-test compatibility), efterfølgende fjernet via T10.14c reverse-migration.
docs/coordination/rapport-historik/2026-05-21-trin-10.md:105:- **Teknisk gæld akkumuleret:** G057 (T9 forretnings-invariants uden superadmin-bypass), G058 (FK-coverage-fitness-check).
docs/coordination/rapport-historik/2026-05-21-trin-10.md:124:  - G057 — T9 forretnings-invariants uden superadmin-bypass (inkonsistent med Mathias 2026-05-21)
docs/coordination/rapport-historik/2026-05-21-trin-10.md:125:  - G058 — FK-coverage-fitness-check ikke implementeret per master-plan §3 punkt 19
docs/coordination/rapport-historik/2026-05-21-trin-10.md:148:| `docs/teknisk/teknisk-gaeld.md`            | ja             | G057 + G058 registreret                                        |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:164:- **Forudsætninger inden næste start:** ingen blokerede; G057 + G058 kan løses i kommende fitness/T9-pakke.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:59:| 1   | KRITISK/FUNKTIONELT | T10.7b `client_node_close` | Wrapper mangler klient-eksistens-check. Bryder krav-dok §3.4 "valideres at klienten faktisk findes" ved BÅDE oprettelse OG ændring. Close er en ændring. Uden check: pending oprettes på ikke-eksisterende client_id → `_apply_client_close` UPDATE'er 0 rows → silent no-op. `client_node_place` har check siden V7; `client_node_close` blev tilføjet i V9 uden check. | **ACCEPT.** Tilføj `if not exists (select 1 from core_identity.clients where id = p_client_id) then raise P0002` i `client_node_close` wrapper FØR session-var + pending_change_request. Konsistent med client_node_place's mønster. | T10.7b + T10.15 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:69:| 1   | TEKNISK-BLOKERING | T10.15 `t10_client_active_check.sql` | T9 seed (`20260518000004:228-229`) sætter `undo_settings.undo_period_seconds = 24*3600` for `client_place`/`client_close`. `pending_change_apply` stopper med `not_yet_due` før dispatch til `_apply_client_place`. Test rammer due-gate, ikke aktiv-checken. | **ACCEPT.** T10.15 udvidet med setup-disciplin: BEGIN-blokken sætter `set_config('stork.t9_write_authorized', 'true', true)` + UPDATE `undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place', 'client_close')` transaction-local. ROLLBACK ved test-slut sikrer ingen lækage. | T10.15     |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:85:| 1   | KRITISK           | Fundament-tjek               | Tabellen nævner kun T10.8/T10.9/T10.10/T10.11 + T10.13. V10 tilføjer/ændrer write-veje i T10.7b (`client_node_place`, `client_node_close`, `_apply_client_place`) + T10.10a (`client_field_definition_set_active`) — manglende krydstjek. | **ACCEPT.** Fundament-tjek-tabel udvidet med T10.7b (GRANT/policy/session-var + apply-dispatch + jsonb payload producer/consumer) og T10.10a. Eksempel-row-tjek udvidet med immutable-key + pii-downgrade-block + active-check. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:86:| 2   | G-NUMMER-KANDIDAT | T10.16 / Oprydnings-strategi | T10.16 nævner FK-coverage som G-nummer-kandidat, men oprydnings-strategi siger "Ingen G-numre forventet". Inkonsistent.                                                                                                                   | **ACCEPT.** **G058** registreret i `docs/teknisk/teknisk-gaeld.md` (FK-coverage-fitness-check ikke implementeret per master-plan §3.19). Oprydnings-strategi opdateret til at angive G057 + G058 som del af trin 10.            |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:110:| 1   | TEKNISK-BLOKERING         | T10.7b + client_node_close | `client_node_place` kalder `pending_change_request` som INSERT'er i `core_identity.pending_changes`. Tabellen har INSERT-policy (T9-fundament-supplement `20260518100000:49-51`) der kræver `current_setting('stork.t9_write_authorized', true) = 'true'`. T10.7b's CREATE OR REPLACE sætter ikke session-var → INSERT vil fejle for authenticated-bruger med FORCE RLS. Samme latente T9-bug findes i `client_node_close` (uændret af V8) og de øvrige 5 T9-pending-wrappers (org*node_upsert, etc.) — men trin 10's scope er kun client-RPC'erne. **Code walk-through missede dette** fordi T9-tests bruger `\_apply*\*`-handlers direkte, aldrig fuld wrapper-vej. | **ACCEPT.** T10.7b udvides: `client_node_place` sætter `set_config('stork.t9_write_authorized', 'true', true)` efter aktiv-check, før `pending_change_request`. Plus ny CREATE OR REPLACE af `client_node_close` med samme session-var (uden aktiv-check — `client_node_close` skal kunne lukke placement på inaktiv klient). Default-privileges på `core_identity` schema (`grant execute on functions to authenticated`, T1) dækker GRANT-kravet — explicit GRANT er ikke nødvendigt. | T10.7b udvidet |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:113:**T9-public-wrapper-bug (Code-observation):** Codex' fund afslører at T9's 7 public-wrappers (`org_node_upsert`, `org_node_deactivate`, `team_close`, `employee_place`, `employee_remove_from_node`, `client_node_place`, `client_node_close`) alle mangler `t9_write_authorized`-session-var. Trin 10's scope er kun de to client-RPC'er; de øvrige 5 er T9-arbejde der skal adresseres som G-nummer/separat pakke (T9 ville fungere i tests fordi `_apply_*`-handlers er SECURITY DEFINER og kan kaldes direkte, men authenticated-bruger via wrapper-vej er broken).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:148:| 1   | KRITISK  | T10.7 (FK)         | FK sikrer KUN eksistens, ikke at klient er aktiv. Krav-dok §2.5.2: "Inaktiv klient bliver stående for historik, men kan ikke vælges som ny team-tilknytning." T9-wrapper `client_node_place` (`20260518000007:140-170`) validerer permission + team-only, men ikke aktiv klient. T9-supplement `_apply_client_place` (`20260520000000:285-352`) validerer team-only + team-aktiv, men ikke klient-aktiv. Krav-dok §3.4 siger "valideres at klienten faktisk findes" — sammen med §2.5.2 betyder det: findes + aktiv. Plus: pending kan oprettes mens klient aktiv og applies efter deaktivering → apply-pathen SKAL også tjekke. | **ACCEPT.** Ny step T10.7b: CREATE OR REPLACE begge RPC'er med aktiv-check **og superadmin-bypass** (Mathias 2026-05-21: "superadmin må alt"). Wrapper-rækkefølge: has_permission → team-check → klient-eksistens (P0002) → klient-aktiv (22023 hvis ikke superadmin). Apply-handler: tilføj klient-eksistens (P0002) + klient-aktiv (P0001 hvis ikke superadmin) FØR INSERT/UPDATE. `client_node_close` rør IKKE. | T10.7b (ny) + T10.15          |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:168:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:170:| 6   | KRITISK             | T10.15 `t10_client_node_placements_fk.sql`      | Smoke-test INSERT'er i `core_identity.client_node_placements` som er på `TX_WRAP_REQUIRED_FOR_TEST_INSERT` (`scripts/fitness.mjs:110`). Fitness-check `db-test-tx-wrap-on-immutable-insert` (`:901-924`) kræver `begin;` + `rollback;` på linje-niveau.                                                                                                | Code-validering  | **ACCEPT.** Eksplicit `begin;` + `rollback;` wrap-pattern i T10.15's FK-test specifikation. T10.7a's fixture-INSERT i T9-tests sker indenfor eksisterende BEGIN/ROLLBACK (verificeret: `t9_placements.sql:9` + `:213`, `t9_backdated_historical_traversal.sql:9` + `:311`).                                                                                                                            |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:192:| 1   | KRITISK  | T10.13  | T10.13 sætter `stork.source_type` + `stork.change_reason` men IKKE `stork.t9_write_authorized = 'true'` som T9-supplements INSERT-policies på `permission_pages` / `permission_tabs` / `role_permission_grants` kræver. Brudt niveau 1-prefix end-to-end-tjek for INSERT/UPDATE/DELETE-veje (GRANT + policy + session-var-tre-pak). | **ACCEPT.** Tilføj `select set_config('stork.t9_write_authorized', 'true', false);` før INSERTs i T10.13. Opdater Fundament-tjek-tabel. | T10.13 + Fundament-tjek |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:241:| `core_compliance.stork_audit()` trigger-funktion                                                       | Refereret af alle T9-tabeller (`20260518000004_t9_client_node_placements.sql:55` etc.)                         | Generel audit-trigger der bruges `AFTER INSERT OR UPDATE OR DELETE` på alle write-tabeller. Skriver til `core_compliance.audit_log` via `audit_filter_values`.                                                                                                                                                                                                                                          |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:243:| `core_identity.client_node_placements` (tabel)                                                         | `supabase/migrations/20260518000004_t9_client_node_placements.sql:13-24`                                       | `id, client_id uuid NOT NULL (UDEN FK — Plan V6 Valg 4: FK tilføjes i trin 10), node_id FK → org_nodes, effective_from/to date, applied_at, created_by_pending_change_id`.                                                                                                                                                                                                                              |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:244:| T9-supplement `client_node_placements_select` policy                                                   | `supabase/migrations/20260520000000_t9_supplement.sql:665-683`                                                 | `using (is_admin() OR node_id = ANY(acl_subtree_org_nodes_at(current_employee_id(), coalesce(current_setting('stork.t9_read_at_date',true)::date, current_date))))`. **Trin 10 ændrer ikke policy** — kun tilføjer FK.                                                                                                                                                                                  |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:245:| `core_identity._apply_client_place(p_payload jsonb, p_pending_change_id uuid)`                         | `supabase/migrations/20260518000004_t9_client_node_placements.sql:86-119`                                      | SECURITY DEFINER apply-handler. INSERT i client_node_placements.                                                                                                                                                                                                                                                                                                                                        |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:246:| `core_identity._apply_client_close(p_payload jsonb, p_pending_change_id uuid)`                         | `supabase/migrations/20260518000004_t9_client_node_placements.sql:123-147`                                     | SECURITY DEFINER apply-handler. UPDATE effective_to.                                                                                                                                                                                                                                                                                                                                                    |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:247:| `core_identity.client_node_place(p_client_id, p_node_id, p_effective_from)` wrapper                    | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:140-170`                                        | Wrapper-RPC med `has_permission('client_placements', 'manage', true)`. Pre-checker node_id = team. Opretter pending_change.                                                                                                                                                                                                                                                                             |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:248:| `core_identity.client_node_close(p_client_id, p_effective_from)` wrapper                               | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:173-192`                                        | Wrapper-RPC med `has_permission('client_placements', 'manage', true)`.                                                                                                                                                                                                                                                                                                                                  |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:257:| T9-smoke-test `t9_backdated_historical_traversal.sql` BLOCK 3                                          | `supabase/tests/smoke/t9_backdated_historical_traversal.sql:165-305`                                           | Linje 167, 172, 185, 276 INSERT'er direkte i client_node_placements + kalder `_apply_client_place` med tilfældige client_id'er. Brækker ved FK.                                                                                                                                                                                                                                                         |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:284:- FK `core_identity.client_node_placements.client_id` → `core_identity.clients.id`
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:502:supabase/migrations/20260518000004_t9_client_node_placements.sql
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:519:supabase/migrations/20260521000007_t10_client_node_placements_fk.sql
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:529:/bin/bash -lc 'rg -n "client_upsert|client_set_active|client_field_definition_upsert|client_logo_|client_get|client_list|client_field_definitions_list|client_node_place|client_node_close|_apply_client_place|_apply_client_close|clients_validate_fields|audit_filter_values|is_permanent_allowed|LEGACY_IS_ACTIVE|FK_COVERAGE" supabase/migrations supabase/tests scripts docs/master-plan.md' in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:532:scripts/fitness.mjs:110:  "core_identity.client_node_placements",
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:533:scripts/fitness.mjs:143:// client_node_placements) har is_active som lifecycle-signal alene; ingen
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:536:scripts/fitness.mjs:152:  "core_identity.client_node_place",
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:609:supabase/migrations/20260519000000_m1_t9_superadmin_permissions.sql:20:--   page=client_placements   — client_node_place, client_node_close
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:610:supabase/migrations/20260519000000_m1_t9_superadmin_permissions.sql:42:  -- T9 client-placement-RPCs (client_node_place, client_node_close)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:611:supabase/migrations/20260518000004_t9_client_node_placements.sql:1:-- Trin 9 / §4 trin 9 Step 5: client_node_placements (uden client-FK) + apply-handlers.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:612:supabase/migrations/20260518000004_t9_client_node_placements.sql:5:-- FK_COVERAGE_EXEMPTIONS allowlist i scripts/fitness.mjs.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:613:supabase/migrations/20260518000004_t9_client_node_placements.sql:10:-- Apply-handlers: _apply_client_place + _apply_client_close.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:614:supabase/migrations/20260518000004_t9_client_node_placements.sql:13:create table core_identity.client_node_placements (
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:615:supabase/migrations/20260518000004_t9_client_node_placements.sql:26:comment on table core_identity.client_node_placements is
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:616:supabase/migrations/20260518000004_t9_client_node_placements.sql:29:create unique index client_node_placements_open_per_client
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:617:supabase/migrations/20260518000004_t9_client_node_placements.sql:30:  on core_identity.client_node_placements (client_id)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:618:supabase/migrations/20260518000004_t9_client_node_placements.sql:33:alter table core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:619:supabase/migrations/20260518000004_t9_client_node_placements.sql:34:  add constraint client_node_placements_no_overlap
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:620:supabase/migrations/20260518000004_t9_client_node_placements.sql:40:create index client_node_placements_node_id on core_identity.client_node_placements (node_id);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:621:supabase/migrations/20260518000004_t9_client_node_placements.sql:41:create index client_node_placements_effective on core_identity.client_node_placements (effective_from, effective_to);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:622:supabase/migrations/20260518000004_t9_client_node_placements.sql:43:alter table core_identity.client_node_placements enable row level security;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:623:supabase/migrations/20260518000004_t9_client_node_placements.sql:44:alter table core_identity.client_node_placements force row level security;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:624:supabase/migrations/20260518000004_t9_client_node_placements.sql:46:revoke all on table core_identity.client_node_placements from public, anon, service_role;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:625:supabase/migrations/20260518000004_t9_client_node_placements.sql:47:grant select on table core_identity.client_node_placements to authenticated;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:626:supabase/migrations/20260518000004_t9_client_node_placements.sql:50:create policy client_node_placements_select on core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:627:supabase/migrations/20260518000004_t9_client_node_placements.sql:53:create trigger client_node_placements_audit
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:628:supabase/migrations/20260518000004_t9_client_node_placements.sql:54:  after insert or update or delete on core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:629:supabase/migrations/20260518000004_t9_client_node_placements.sql:81:create trigger client_node_placements_team_only
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:630:supabase/migrations/20260518000004_t9_client_node_placements.sql:82:  before insert or update on core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:631:supabase/migrations/20260518000004_t9_client_node_placements.sql:86:create or replace function core_identity._apply_client_place(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:632:supabase/migrations/20260518000004_t9_client_node_placements.sql:109:  update core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:633:supabase/migrations/20260518000004_t9_client_node_placements.sql:114:  insert into core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:634:supabase/migrations/20260518000004_t9_client_node_placements.sql:121:revoke execute on function core_identity._apply_client_place(jsonb, uuid) from public, anon, authenticated;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:635:supabase/migrations/20260518000004_t9_client_node_placements.sql:123:create or replace function core_identity._apply_client_close(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:636:supabase/migrations/20260518000004_t9_client_node_placements.sql:143:  update core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:637:supabase/migrations/20260518000004_t9_client_node_placements.sql:149:revoke execute on function core_identity._apply_client_close(jsonb, uuid) from public, anon, authenticated;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:638:supabase/migrations/20260518000004_t9_client_node_placements.sql:204:      perform core_identity._apply_client_place(v_change.payload, p_change_id);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:639:supabase/migrations/20260518000004_t9_client_node_placements.sql:206:      perform core_identity._apply_client_close(v_change.payload, p_change_id);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:640:supabase/migrations/20260518000003_t9_employee_node_placements.sql:209:  -- Luk alle åbne client_node_placements på team (Step 5 tilføjer tabellen;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:641:supabase/migrations/20260518000003_t9_employee_node_placements.sql:211:  -- Note: client_node_placements oprettes i Step 5 — denne UPDATE bliver
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:642:supabase/migrations/20260518000003_t9_employee_node_placements.sql:213:  if exists (select 1 from pg_class where relname = 'client_node_placements' and relnamespace = (select oid from pg_namespace where nspname = 'core_identity')) then
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:643:supabase/migrations/20260518000003_t9_employee_node_placements.sql:214:    execute 'update core_identity.client_node_placements set effective_to = $1, updated_at = now() where node_id = $2 and effective_to is null'
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:654:supabase/migrations/20260518000011_t9_classify.sql:74:  -- core_identity.client_node_placements (operationel)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:655:supabase/migrations/20260518000011_t9_classify.sql:75:  ('core_identity', 'client_node_placements', 'id', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'placement-PK'),
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:656:supabase/migrations/20260518000011_t9_classify.sql:76:  ('core_identity', 'client_node_placements', 'client_id', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'klient-id (FK i trin 10)'),
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:657:supabase/migrations/20260518000011_t9_classify.sql:77:  ('core_identity', 'client_node_placements', 'node_id', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'FK org_nodes (team)'),
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:658:supabase/migrations/20260518000011_t9_classify.sql:78:  ('core_identity', 'client_node_placements', 'effective_from', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'placement-start'),
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:659:supabase/migrations/20260518000011_t9_classify.sql:79:  ('core_identity', 'client_node_placements', 'effective_to', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'placement-slut'),
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:660:supabase/migrations/20260518000011_t9_classify.sql:80:  ('core_identity', 'client_node_placements', 'applied_at', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'apply'),
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:661:supabase/migrations/20260518000011_t9_classify.sql:81:  ('core_identity', 'client_node_placements', 'created_by_pending_change_id', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'FK pending'),
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:662:supabase/migrations/20260518000011_t9_classify.sql:82:  ('core_identity', 'client_node_placements', 'created_at', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'created'),
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:663:supabase/migrations/20260518000011_t9_classify.sql:83:  ('core_identity', 'client_node_placements', 'updated_at', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'updated'),
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:664:supabase/migrations/20260521000008_t10_client_active_check.sql:1:-- Trin 10 T10.7b: klient-aktiv-check i client_node_place + _apply_client_place
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:665:supabase/migrations/20260521000008_t10_client_active_check.sql:18:-- V14 (Code walk-through): client_node_close klient-eksistens-check (P0002) —
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:666:supabase/migrations/20260521000008_t10_client_active_check.sql:49:-- ─── client_node_place: tilføj klient-aktiv-check + session-var ─────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:667:supabase/migrations/20260521000008_t10_client_active_check.sql:50:create or replace function core_identity.client_node_place(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:668:supabase/migrations/20260521000008_t10_client_active_check.sql:97:revoke execute on function core_identity.client_node_place(uuid, uuid, date) from public, anon;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:669:supabase/migrations/20260521000008_t10_client_active_check.sql:99:-- ─── client_node_close: tilføj eksistens-check + session-var ────────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:670:supabase/migrations/20260521000008_t10_client_active_check.sql:102:create or replace function core_identity.client_node_close(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:671:supabase/migrations/20260521000008_t10_client_active_check.sql:131:revoke execute on function core_identity.client_node_close(uuid, date) from public, anon;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:674:supabase/migrations/20260521000008_t10_client_active_check.sql:198:  from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:675:supabase/migrations/20260521000008_t10_client_active_check.sql:205:    insert into core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:676:supabase/migrations/20260521000008_t10_client_active_check.sql:208:      (select min(effective_from) from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:677:supabase/migrations/20260521000008_t10_client_active_check.sql:212:    update core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:678:supabase/migrations/20260521000008_t10_client_active_check.sql:218:    update core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:679:supabase/migrations/20260521000008_t10_client_active_check.sql:221:    insert into core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:719:supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:139:-- ─── client_node_place (pending) ────────────────────────────────────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:720:supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:140:create or replace function core_identity.client_node_place(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:721:supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:170:revoke execute on function core_identity.client_node_place(uuid, uuid, date) from public, anon;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:722:supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:172:-- ─── client_node_close (pending) ────────────────────────────────────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:723:supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:173:create or replace function core_identity.client_node_close(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:724:supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:192:revoke execute on function core_identity.client_node_close(uuid, date) from public, anon;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:772:supabase/migrations/20260518000008_t9_read_rpcs.sql:56:  from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:799:supabase/migrations/20260521000007_t10_client_node_placements_fk.sql:1:-- Trin 10 T10.7: FK fra core_identity.client_node_placements.client_id
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:800:supabase/migrations/20260521000007_t10_client_node_placements_fk.sql:15:alter table core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:801:supabase/migrations/20260521000007_t10_client_node_placements_fk.sql:16:  add constraint client_node_placements_client_id_fkey
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:802:supabase/migrations/20260521000007_t10_client_node_placements_fk.sql:20:comment on constraint client_node_placements_client_id_fkey on core_identity.client_node_placements is
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:803:supabase/migrations/20260520000000_t9_supplement.sql:7:--   Section C2 — Udvidet SELECT-policy på client_node_placements (Step 3b)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:806:supabase/migrations/20260520000000_t9_supplement.sql:322:  from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:807:supabase/migrations/20260520000000_t9_supplement.sql:329:    insert into core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:808:supabase/migrations/20260520000000_t9_supplement.sql:332:      (select min(effective_from) from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:809:supabase/migrations/20260520000000_t9_supplement.sql:336:    update core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:810:supabase/migrations/20260520000000_t9_supplement.sql:342:    update core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:811:supabase/migrations/20260520000000_t9_supplement.sql:346:    insert into core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:815:supabase/migrations/20260520000000_t9_supplement.sql:379:  from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:816:supabase/migrations/20260520000000_t9_supplement.sql:388:    delete from core_identity.client_node_placements where id = v_active.id;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:817:supabase/migrations/20260520000000_t9_supplement.sql:392:    update core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:819:supabase/migrations/20260520000000_t9_supplement.sql:638:    select * from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:820:supabase/migrations/20260520000000_t9_supplement.sql:644:      delete from core_identity.client_node_placements where id = v_cli.id;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:821:supabase/migrations/20260520000000_t9_supplement.sql:646:      update core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:822:supabase/migrations/20260520000000_t9_supplement.sql:659:-- SECTION C2 — Udvidet SELECT-policy på client_node_placements (Step 3b)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:823:supabase/migrations/20260520000000_t9_supplement.sql:665:drop policy if exists client_node_placements_select on core_identity.client_node_placements;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:824:supabase/migrations/20260520000000_t9_supplement.sql:667:create policy client_node_placements_select on core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:825:supabase/migrations/20260520000000_t9_supplement.sql:682:comment on policy client_node_placements_select on core_identity.client_node_placements is
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:826:supabase/migrations/20260520000000_t9_supplement.sql:922:  from core_identity.client_node_placements p
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:859:supabase/tests/smoke/t9_placements.sql:1:-- T9 Step 4+5 smoke: employee_node_placements + client_node_placements + apply-handlers.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:862:supabase/tests/smoke/t9_placements.sql:139:  -- (FK på client_node_placements.client_id → clients.id kræver eksistens; trin 10
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:864:supabase/tests/smoke/t9_placements.sql:152:    select 1 from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:867:supabase/tests/smoke/t9_placements.sql:199:    select 1 from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:893:supabase/tests/smoke/t10_client_active_check.sql:160:  v_pending_id := core_identity.client_node_place(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:894:supabase/tests/smoke/t10_client_active_check.sql:163:    raise exception 'T1 FAIL: client_node_place returnerede NULL';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:895:supabase/tests/smoke/t10_client_active_check.sql:172:    select 1 from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:896:supabase/tests/smoke/t10_client_active_check.sql:190:    perform core_identity.client_node_place(v_client_inactive_id, v_team_node_id, current_date);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:897:supabase/tests/smoke/t10_client_active_check.sql:200:  v_pending_id := core_identity.client_node_place(v_client_t3, v_team_node_id, current_date);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:898:supabase/tests/smoke/t10_client_active_check.sql:240:  v_pending_id := core_identity.client_node_close(v_client_inactive_id, current_date);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:899:supabase/tests/smoke/t10_client_active_check.sql:242:    raise exception 'T4 FAIL: client_node_close på inaktiv klient skal lykkes (ingen aktiv-check)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:900:supabase/tests/smoke/t10_client_active_check.sql:261:  -- T4a (V14): client_node_close på non-existent → P0002
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:901:supabase/tests/smoke/t10_client_active_check.sql:267:    perform core_identity.client_node_close(gen_random_uuid(), current_date);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:902:supabase/tests/smoke/t10_client_active_check.sql:270:    raise exception 'T4a FAIL (V14): client_node_close på non-existent skal raise P0002';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:903:supabase/tests/smoke/t10_client_active_check.sql:278:  v_pending_id := core_identity.client_node_place(v_client_inactive_id, v_team_node_id, current_date);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:904:supabase/tests/smoke/t10_client_active_check.sql:288:    select 1 from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:905:supabase/tests/smoke/t10_client_active_check.sql:301:  v_pending_id := core_identity.client_node_place(v_client_t6, v_team_node_id, current_date);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:906:supabase/tests/smoke/t10_client_active_check.sql:319:    select 1 from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:907:supabase/tests/smoke/t10_client_active_check.sql:330:  v_pending_id := core_identity.client_node_place(v_client_t7, v_team_node_id, current_date);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:908:supabase/tests/smoke/t10_client_active_check.sql:350:    select 1 from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:909:supabase/tests/smoke/t10_client_node_placements_fk.sql:1:-- Trin 10 T10.15: client_node_placements FK smoke-test
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:910:supabase/tests/smoke/t10_client_node_placements_fk.sql:4:-- core_identity.client_node_placements er på TX_WRAP_REQUIRED_FOR_TEST_INSERT.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:911:supabase/tests/smoke/t10_client_node_placements_fk.sql:38:    insert into core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:912:supabase/tests/smoke/t10_client_node_placements_fk.sql:47:  insert into core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:914:supabase/tests/smoke/t9_backdated_historical_traversal.sql:168:  -- client_node_placements (FK + apply-handler aktiv-check kræver klient eksisterer).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:915:supabase/tests/smoke/t9_backdated_historical_traversal.sql:174:  insert into core_identity.client_node_placements (client_id, node_id, effective_from, effective_to) values
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:917:supabase/tests/smoke/t9_backdated_historical_traversal.sql:184:    select 1 from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:918:supabase/tests/smoke/t9_backdated_historical_traversal.sql:191:  delete from core_identity.client_node_placements where client_id = v_client_id;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:919:supabase/tests/smoke/t9_backdated_historical_traversal.sql:192:  insert into core_identity.client_node_placements (client_id, node_id, effective_from, effective_to) values
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:921:supabase/tests/smoke/t9_backdated_historical_traversal.sql:198:  if exists (select 1 from core_identity.client_node_placements where client_id = v_client_id) then
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:922:supabase/tests/smoke/t9_backdated_historical_traversal.sql:282:  delete from core_identity.client_node_placements where client_id = v_client_id;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:923:supabase/tests/smoke/t9_backdated_historical_traversal.sql:283:  insert into core_identity.client_node_placements (client_id, node_id, effective_from, effective_to) values
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:924:supabase/tests/smoke/t9_backdated_historical_traversal.sql:307:    select 1 from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:925:supabase/tests/smoke/t9_public_wrapper_rpcs.sql:8:-- T2: Med superadmin auth → client_node_place på department → 22023 (team-only pre-check)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:926:supabase/tests/smoke/t9_public_wrapper_rpcs.sql:83:  -- ─── T2: Med auth → client_node_place på department → 22023 ──────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:927:supabase/tests/smoke/t9_public_wrapper_rpcs.sql:86:    perform core_identity.client_node_place(gen_random_uuid(), v_dept_id, current_date);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:928:supabase/tests/smoke/t9_public_wrapper_rpcs.sql:89:    raise exception 'T2 FAIL: client_node_place på department skal blokeres pre-check med 22023';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:997:supabase/migrations/20260521000007_t10_client_node_placements_fk.sql
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1002:supabase/tests/smoke/t10_client_node_placements_fk.sql
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1004:supabase/migrations/20260518000004_t9_client_node_placements.sql
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1482:/bin/bash -lc "sed -n '1,220p' supabase/migrations/20260521000007_t10_client_node_placements_fk.sql" in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1484:-- Trin 10 T10.7: FK fra core_identity.client_node_placements.client_id
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1498:alter table core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1499:  add constraint client_node_placements_client_id_fkey
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1503:comment on constraint client_node_placements_client_id_fkey on core_identity.client_node_placements is
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1518:-- V4 fix (Codex V3 KRITISK): stork.t9_write_authorized SKAL sættes — T9-supplements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1529:select set_config('stork.t9_write_authorized', 'true', false);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1677:-- Trin 10 T10.7b: klient-aktiv-check i client_node_place + _apply_client_place
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1691:-- V9 (Codex runde 8 TEKNISK-BLOKERING): wrapper sætter t9_write_authorized FØR
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1694:-- V14 (Code walk-through): client_node_close klient-eksistens-check (P0002) —
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1725:-- ─── client_node_place: tilføj klient-aktiv-check + session-var ─────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1726:create or replace function core_identity.client_node_place(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1760:  perform set_config('stork.t9_write_authorized', 'true', true);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1773:revoke execute on function core_identity.client_node_place(uuid, uuid, date) from public, anon;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1775:-- ─── client_node_close: tilføj eksistens-check + session-var ────────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1778:create or replace function core_identity.client_node_close(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1795:  perform set_config('stork.t9_write_authorized', 'true', true);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1807:revoke execute on function core_identity.client_node_close(uuid, date) from public, anon;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1874:  from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1881:    insert into core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1884:      (select min(effective_from) from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1888:    update core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1894:    update core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1897:    insert into core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:1939:-- Per Codex build-review runde 3: legacy-seed var "WORKAROUND-INTRODUCERET"
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2596:select set_config('stork.t9_write_authorized', 'true', true);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2731:  v_pending_id := core_identity.client_node_place(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2734:    raise exception 'T1 FAIL: client_node_place returnerede NULL';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2743:    select 1 from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2761:    perform core_identity.client_node_place(v_client_inactive_id, v_team_node_id, current_date);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2771:  v_pending_id := core_identity.client_node_place(v_client_t3, v_team_node_id, current_date);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2811:  v_pending_id := core_identity.client_node_close(v_client_inactive_id, current_date);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2813:    raise exception 'T4 FAIL: client_node_close på inaktiv klient skal lykkes (ingen aktiv-check)';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2832:  -- T4a (V14): client_node_close på non-existent → P0002
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2838:    perform core_identity.client_node_close(gen_random_uuid(), current_date);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2841:    raise exception 'T4a FAIL (V14): client_node_close på non-existent skal raise P0002';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2849:  v_pending_id := core_identity.client_node_place(v_client_inactive_id, v_team_node_id, current_date);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2859:    select 1 from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2872:  v_pending_id := core_identity.client_node_place(v_client_t6, v_team_node_id, current_date);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2890:    select 1 from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2901:  v_pending_id := core_identity.client_node_place(v_client_t7, v_team_node_id, current_date);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:2921:    select 1 from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3203:  -- client_node_placements (FK + apply-handler aktiv-check kræver klient eksisterer).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3209:  insert into core_identity.client_node_placements (client_id, node_id, effective_from, effective_to) values
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3219:    select 1 from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3226:  delete from core_identity.client_node_placements where client_id = v_client_id;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3227:  insert into core_identity.client_node_placements (client_id, node_id, effective_from, effective_to) values
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3233:  if exists (select 1 from core_identity.client_node_placements where client_id = v_client_id) then
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3268:  -- BLOCK 5 — _apply_org_node_upsert: backdated rename split
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3270:  -- Codex runde 1 MELLEM 1: tilføj _apply_org_node_upsert backdated dækning.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3279:  perform core_identity._apply_org_node_upsert(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3317:  delete from core_identity.client_node_placements where client_id = v_client_id;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3318:  insert into core_identity.client_node_placements (client_id, node_id, effective_from, effective_to) values
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3337:    raise exception 'T12 FAIL: cascade-luk af employee_placement mangler';
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3342:    select 1 from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3356:/bin/bash -lc "sed -n '1,140p' supabase/tests/smoke/t10_client_node_placements_fk.sql" in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3358:-- Trin 10 T10.15: client_node_placements FK smoke-test
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3361:-- core_identity.client_node_placements er på TX_WRAP_REQUIRED_FOR_TEST_INSERT.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3395:    insert into core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3404:  insert into core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3430:    perform core_identity._apply_employee_place(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3445:  -- (FK på client_node_placements.client_id → clients.id kræver eksistens; trin 10
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3458:    select 1 from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3478:  perform core_identity._apply_employee_place(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3505:    select 1 from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3554:// client_node_placements) har is_active som lifecycle-signal alene; ingen
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3561:  "core_identity._apply_employee_place",
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3563:  "core_identity.client_node_place",
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3940:✓ supabase/tests/smoke/t10_client_node_placements_fk.sql (273 ms)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3954:/bin/bash -lc "sed -n '180,230p' supabase/migrations/20260518000004_t9_client_node_placements.sql" in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3969:    when 'org_node_upsert' then
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3970:      perform core_identity._apply_org_node_upsert(v_change.payload, p_change_id);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3973:    when 'employee_place' then
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3974:      perform core_identity._apply_employee_place(v_change.payload, p_change_id);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4033:  from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4040:    insert into core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4043:      (select min(effective_from) from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4047:    update core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4053:    update core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4057:    insert into core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4090:  from core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4099:    delete from core_identity.client_node_placements where id = v_active.id;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4103:    update core_identity.client_node_placements
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4112:-- ─── _apply_org_node_upsert (org_node_versions — split-at-boundary) ──────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4113:create or replace function core_identity._apply_org_node_upsert(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4124:/bin/bash -lc 'rg -n "pending_change_apply|client_place|client_close|when.*change_type|case.*change_type" supabase/migrations/20260518000000_t9_pending_changes.sql supabase/migrations/20260518000004_t9_client_node_placements.sql supabase/migrations/20260520000000_t9_supplement.sql supabase/migrations/20260521000008_t10_client_active_check.sql' in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4126:supabase/migrations/20260521000008_t10_client_active_check.sql:1:-- Trin 10 T10.7b: klient-aktiv-check i client_node_place + _apply_client_place
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4153:supabase/migrations/20260518000004_t9_client_node_placements.sql:10:-- Apply-handlers: _apply_client_place + _apply_client_close.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4154:supabase/migrations/20260518000004_t9_client_node_placements.sql:58:create or replace function core_identity._client_placement_team_check()
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4155:supabase/migrations/20260518000004_t9_client_node_placements.sql:73:    raise exception 'client_placement_node_not_team: % er ikke team-knude på effective_from %', new.node_id, new.effective_from
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4156:supabase/migrations/20260518000004_t9_client_node_placements.sql:83:  for each row execute function core_identity._client_placement_team_check();
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4157:supabase/migrations/20260518000004_t9_client_node_placements.sql:86:create or replace function core_identity._apply_client_place(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4158:supabase/migrations/20260518000004_t9_client_node_placements.sql:121:revoke execute on function core_identity._apply_client_place(jsonb, uuid) from public, anon, authenticated;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4159:supabase/migrations/20260518000004_t9_client_node_placements.sql:123:create or replace function core_identity._apply_client_close(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4160:supabase/migrations/20260518000004_t9_client_node_placements.sql:149:revoke execute on function core_identity._apply_client_close(jsonb, uuid) from public, anon, authenticated;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4161:supabase/migrations/20260518000004_t9_client_node_placements.sql:151:-- ─── CREATE OR REPLACE pending_change_apply: tilføj 2 cases ─────────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4162:supabase/migrations/20260518000004_t9_client_node_placements.sql:152:create or replace function core_identity.pending_change_apply(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4163:supabase/migrations/20260518000004_t9_client_node_placements.sql:190:  perform set_config('stork.change_reason', 'pending_change_apply', true);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4164:supabase/migrations/20260518000004_t9_client_node_placements.sql:192:  case v_change.change_type
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4165:supabase/migrations/20260518000004_t9_client_node_placements.sql:203:    when 'client_place' then
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4166:supabase/migrations/20260518000004_t9_client_node_placements.sql:204:      perform core_identity._apply_client_place(v_change.payload, p_change_id);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4167:supabase/migrations/20260518000004_t9_client_node_placements.sql:205:    when 'client_close' then
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4168:supabase/migrations/20260518000004_t9_client_node_placements.sql:206:      perform core_identity._apply_client_close(v_change.payload, p_change_id);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4169:supabase/migrations/20260518000004_t9_client_node_placements.sql:220:revoke execute on function core_identity.pending_change_apply(uuid) from public, anon;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4170:supabase/migrations/20260518000004_t9_client_node_placements.sql:224:select set_config('stork.change_reason', 'T9 Step 5: seed undo_settings for client_place/close', false);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4171:supabase/migrations/20260518000004_t9_client_node_placements.sql:228:  ('client_place', 24 * 3600),
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4172:supabase/migrations/20260518000004_t9_client_node_placements.sql:229:  ('client_close', 24 * 3600)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4620:revoke execute on function core_identity.employee_remove_from_node(uuid, date) from public, anon;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4622:-- ─── client_node_place (pending) ────────────────────────────────────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4623:create or replace function core_identity.client_node_place(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4653:revoke execute on function core_identity.client_node_place(uuid, uuid, date) from public, anon;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4655:-- ─── client_node_close (pending) ────────────────────────────────────────
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4656:create or replace function core_identity.client_node_close(
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4675:revoke execute on function core_identity.client_node_close(uuid, date) from public, anon;
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4801:17:| 1   | KRITISK/FUNKTIONELT | T10.7b `client_node_close` | Wrapper mangler klient-eksistens-check. Bryder krav-dok §3.4 "valideres at klienten faktisk findes" ved BÅDE oprettelse OG ændring. Close er en ændring. Uden check: pending oprettes på ikke-eksisterende client_id → `_apply_client_close` UPDATE'er 0 rows → silent no-op. `client_node_place` har check siden V7; `client_node_close` blev tilføjet i V9 uden check. | **ACCEPT.** Tilføj `if not exists (select 1 from core_identity.clients where id = p_client_id) then raise P0002` i `client_node_close` wrapper FØR session-var + pending_change_request. Konsistent med client_node_place's mønster. | T10.7b + T10.15 |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4803:27:| 1   | TEKNISK-BLOKERING | T10.15 `t10_client_active_check.sql` | T9 seed (`20260518000004:228-229`) sætter `undo_settings.undo_period_seconds = 24*3600` for `client_place`/`client_close`. `pending_change_apply` stopper med `not_yet_due` før dispatch til `_apply_client_place`. Test rammer due-gate, ikke aktiv-checken. | **ACCEPT.** T10.15 udvidet med setup-disciplin: BEGIN-blokken sætter `set_config('stork.t9_write_authorized', 'true', true)` + UPDATE `undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place', 'client_close')` transaction-local. ROLLBACK ved test-slut sikrer ingen lækage. | T10.15     |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4805:43:| 1   | KRITISK           | Fundament-tjek               | Tabellen nævner kun T10.8/T10.9/T10.10/T10.11 + T10.13. V10 tilføjer/ændrer write-veje i T10.7b (`client_node_place`, `client_node_close`, `_apply_client_place`) + T10.10a (`client_field_definition_set_active`) — manglende krydstjek. | **ACCEPT.** Fundament-tjek-tabel udvidet med T10.7b (GRANT/policy/session-var + apply-dispatch + jsonb payload producer/consumer) og T10.10a. Eksempel-row-tjek udvidet med immutable-key + pii-downgrade-block + active-check. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4806:44:| 2   | G-NUMMER-KANDIDAT | T10.16 / Oprydnings-strategi | T10.16 nævner FK-coverage som G-nummer-kandidat, men oprydnings-strategi siger "Ingen G-numre forventet". Inkonsistent.                                                                                                                   | **ACCEPT.** **G058** registreret i `docs/teknisk/teknisk-gaeld.md` (FK-coverage-fitness-check ikke implementeret per master-plan §3.19). Oprydnings-strategi opdateret til at angive G057 + G058 som del af trin 10.            |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4810:68:| 1   | TEKNISK-BLOKERING         | T10.7b + client_node_close | `client_node_place` kalder `pending_change_request` som INSERT'er i `core_identity.pending_changes`. Tabellen har INSERT-policy (T9-fundament-supplement `20260518100000:49-51`) der kræver `current_setting('stork.t9_write_authorized', true) = 'true'`. T10.7b's CREATE OR REPLACE sætter ikke session-var → INSERT vil fejle for authenticated-bruger med FORCE RLS. Samme latente T9-bug findes i `client_node_close` (uændret af V8) og de øvrige 5 T9-pending-wrappers (org*node_upsert, etc.) — men trin 10's scope er kun client-RPC'erne. **Code walk-through missede dette** fordi T9-tests bruger `\_apply*\*`-handlers direkte, aldrig fuld wrapper-vej. | **ACCEPT.** T10.7b udvides: `client_node_place` sætter `set_config('stork.t9_write_authorized', 'true', true)` efter aktiv-check, før `pending_change_request`. Plus ny CREATE OR REPLACE af `client_node_close` med samme session-var (uden aktiv-check — `client_node_close` skal kunne lukke placement på inaktiv klient). Default-privileges på `core_identity` schema (`grant execute on functions to authenticated`, T1) dækker GRANT-kravet — explicit GRANT er ikke nødvendigt. | T10.7b udvidet |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4812:71:**T9-public-wrapper-bug (Code-observation):** Codex' fund afslører at T9's 7 public-wrappers (`org_node_upsert`, `org_node_deactivate`, `team_close`, `employee_place`, `employee_remove_from_node`, `client_node_place`, `client_node_close`) alle mangler `t9_write_authorized`-session-var. Trin 10's scope er kun de to client-RPC'er; de øvrige 5 er T9-arbejde der skal adresseres som G-nummer/separat pakke (T9 ville fungere i tests fordi `_apply_*`-handlers er SECURITY DEFINER og kan kaldes direkte, men authenticated-bruger via wrapper-vej er broken).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4822:106:| 1   | KRITISK  | T10.7 (FK)         | FK sikrer KUN eksistens, ikke at klient er aktiv. Krav-dok §2.5.2: "Inaktiv klient bliver stående for historik, men kan ikke vælges som ny team-tilknytning." T9-wrapper `client_node_place` (`20260518000007:140-170`) validerer permission + team-only, men ikke aktiv klient. T9-supplement `_apply_client_place` (`20260520000000:285-352`) validerer team-only + team-aktiv, men ikke klient-aktiv. Krav-dok §3.4 siger "valideres at klienten faktisk findes" — sammen med §2.5.2 betyder det: findes + aktiv. Plus: pending kan oprettes mens klient aktiv og applies efter deaktivering → apply-pathen SKAL også tjekke. | **ACCEPT.** Ny step T10.7b: CREATE OR REPLACE begge RPC'er med aktiv-check **og superadmin-bypass** (Mathias 2026-05-21: "superadmin må alt"). Wrapper-rækkefølge: has_permission → team-check → klient-eksistens (P0002) → klient-aktiv (22023 hvis ikke superadmin). Apply-handler: tilføj klient-eksistens (P0002) + klient-aktiv (P0001 hvis ikke superadmin) FØR INSERT/UPDATE. `client_node_close` rør IKKE. | T10.7b (ny) + T10.15          |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4831:126:| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4833:128:| 6   | KRITISK             | T10.15 `t10_client_node_placements_fk.sql`      | Smoke-test INSERT'er i `core_identity.client_node_placements` som er på `TX_WRAP_REQUIRED_FOR_TEST_INSERT` (`scripts/fitness.mjs:110`). Fitness-check `db-test-tx-wrap-on-immutable-insert` (`:901-924`) kræver `begin;` + `rollback;` på linje-niveau.                                                                                                | Code-validering  | **ACCEPT.** Eksplicit `begin;` + `rollback;` wrap-pattern i T10.15's FK-test specifikation. T10.7a's fixture-INSERT i T9-tests sker indenfor eksisterende BEGIN/ROLLBACK (verificeret: `t9_placements.sql:9` + `:213`, `t9_backdated_historical_traversal.sql:9` + `:311`).                                                                                                                            |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4835:150:| 1   | KRITISK  | T10.13  | T10.13 sætter `stork.source_type` + `stork.change_reason` men IKKE `stork.t9_write_authorized = 'true'` som T9-supplements INSERT-policies på `permission_pages` / `permission_tabs` / `role_permission_grants` kræver. Brudt niveau 1-prefix end-to-end-tjek for INSERT/UPDATE/DELETE-veje (GRANT + policy + session-var-tre-pak). | **ACCEPT.** Tilføj `select set_config('stork.t9_write_authorized', 'true', false);` før INSERTs i T10.13. Opdater Fundament-tjek-tabel. | T10.13 + Fundament-tjek |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4844:199:| `core_compliance.stork_audit()` trigger-funktion                                                       | Refereret af alle T9-tabeller (`20260518000004_t9_client_node_placements.sql:55` etc.)                         | Generel audit-trigger der bruges `AFTER INSERT OR UPDATE OR DELETE` på alle write-tabeller. Skriver til `core_compliance.audit_log` via `audit_filter_values`.                                                                                                                                                                                                                                          |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4845:202:| T9-supplement `client_node_placements_select` policy                                                   | `supabase/migrations/20260520000000_t9_supplement.sql:665-683`                                                 | `using (is_admin() OR node_id = ANY(acl_subtree_org_nodes_at(current_employee_id(), coalesce(current_setting('stork.t9_read_at_date',true)::date, current_date))))`. **Trin 10 ændrer ikke policy** — kun tilføjer FK.                                                                                                                                                                                  |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4846:203:| `core_identity._apply_client_place(p_payload jsonb, p_pending_change_id uuid)`                         | `supabase/migrations/20260518000004_t9_client_node_placements.sql:86-119`                                      | SECURITY DEFINER apply-handler. INSERT i client_node_placements.                                                                                                                                                                                                                                                                                                                                        |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4847:204:| `core_identity._apply_client_close(p_payload jsonb, p_pending_change_id uuid)`                         | `supabase/migrations/20260518000004_t9_client_node_placements.sql:123-147`                                     | SECURITY DEFINER apply-handler. UPDATE effective_to.                                                                                                                                                                                                                                                                                                                                                    |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4850:215:| T9-smoke-test `t9_backdated_historical_traversal.sql` BLOCK 3                                          | `supabase/tests/smoke/t9_backdated_historical_traversal.sql:165-305`                                           | Linje 167, 172, 185, 276 INSERT'er direkte i client_node_placements + kalder `_apply_client_place` med tilfældige client_id'er. Brækker ved FK.                                                                                                                                                                                                                                                         |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4861:319:  - **Plan-konsekvens:** T10.7b CREATE OR REPLACE både `client_node_place` (wrapper) og `_apply_client_place` (apply-handler) med aktiv-check og `is_admin()`-bypass. `client_node_close` rør IKKE — lukning er legitim ved deaktivering. Eksistens-check (P0002) bypasses IKKE for superadmin (FK håndhæver alligevel).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4926:768:### T10.7 — FK fra `client_node_placements.client_id` til `clients.id`
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4933:800:  Pattern (én blok per test, FØR første client_node_placements-write):
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4936:815:### T10.7b — CREATE OR REPLACE `client_node_place` + `_apply_client_place` med klient-aktiv-check (V7 — Mathias-terminal-V6 #1)
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4944:887:    -- (T9-fundament-supplement) kræver session-var. T9-public-wrapper sætter
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4945:889:    perform set_config('stork.t9_write_authorized', 'true', true);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4947:904:  -- V9 (Codex runde 8 TEKNISK-BLOKERING): client_node_close får også t9_write_authorized.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4950:926:    perform set_config('stork.t9_write_authorized', 'true', true);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4995:1475:  -- / permission_tabs / role_permission_grants kræver stork.t9_write_authorized.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:4996:1476:  select set_config('stork.t9_write_authorized', 'true', false);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5003:1543:  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T4a (V14):** `client_node_close` på ikke-eksisterende client_id → forvent **P0002 `client_not_found`** (eksistens-check tilføjet i V14). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5006:1553:  1. **FK-coverage-allowlist:** `FK_COVERAGE_EXEMPTIONS`-allowlist findes IKKE i nuværende `scripts/fitness.mjs` — master-plan §3 punkt 19 er ikke implementeret endnu. Hvis check tilføjes senere, vil `client_node_placements.client_id` ikke længere være en exemption-kandidat (FK eksisterer efter T10.7). **Ingen fitness-script-ændring nødvendig for FK i V6.**
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5007:1560:    "core_identity._apply_employee_place",
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5013:1579:| Hver write-RPC har GRANT + INSERT/UPDATE-policy + session-var  | ja     | T10.8/T10.9/T10.10/T10.10a/T10.11 — `stork.allow_clients_write` / `allow_client_field_definitions_write` + `revoke/grant execute` + has_permission('manage', true). **T10.7b** (`client_node_place` + `client_node_close` + `_apply_client_place`) — `stork.t9_write_authorized = 'true'` før `pending_change_request` (V9-fix); apply-handler tjekker eksistens (P0002) + aktiv (P0001) med employee-id-baseret admin-bypass (V10-fix); pending_change_apply-dispatcher (T9-supplement) cases `client_place` + `client_close` ramt automatisk. **T10.13** (permission-seed) — `stork.t9_write_authorized` (V4-fix) som krævet af T9-supplement's INSERT-policies på permission_pages/tabs/role_permission_grants. Default-privileges på `core_identity` schema (T1: `grant execute on functions to authenticated`) dækker GRANT for alle T10-RPC'er. |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5014:1580:| Hver SELECT-policy bred nok til legitime læsere                | ja     | T10.1, T10.2 — has_permission('clients'/'client_field_definitions', 'manage', false) **tab-aware (V6-fix)**. T10.13 seeder kun tab-grants → null-tab matcher ikke; 'manage' matcher. T9-supplement's ACL-scoped policy på client_node_placements bevares uændret.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5023:1619:  - T9-supplement's `client_node_placements_select` policy uændret
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5046:1708:- T10.7b `client_node_close`: tilføjet klient-eksistens-check (P0002) FØR session-var + pending_change_request. Krav-dok §3.4-konformitet: "valideres at klienten faktisk findes" ved BÅDE oprettelse OG ændring. V13 havde checken kun på client_node_place; close-vejen var silent no-op ved ikke-eksisterende client_id.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5047:1709:- T10.15 smoke-test T4a tilføjet: `client_node_close` med non-existent client_id → P0002.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5051:1722:- Fundament-tjek-tabel udvidet med T10.7b's komplette write-vej (`client_node_place` + `client_node_close` + `_apply_client_place` + apply-dispatch + jsonb producer/consumer) + T10.10a (`client_field_definition_set_active`).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5055:1734:- T10.7b udvidet: `client_node_place` + ny CREATE OR REPLACE af `client_node_close` sætter `stork.t9_write_authorized = 'true'` før `pending_change_request`. T9-fundament-supplement's `pending_changes_insert`-policy kræver session-var (Codex runde 8 TEKNISK-BLOKERING).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5064:1749:- **Ny T10.7b:** CREATE OR REPLACE `client_node_place` + `_apply_client_place` med klient-aktiv-check og **superadmin-bypass**. Krav-dok §2.5.2 håndhæves i både wrapper og apply-path (apply fanger pending oprettet mens aktiv, applied efter deaktivering).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5071:1759:- T10.15 `t10_client_node_placements_fk.sql`: eksplicit `begin;` + `rollback;` wrap — `client_node_placements` på `TX_WRAP_REQUIRED_FOR_TEST_INSERT` (Code-validering #6).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5074:1768:- T10.13: tilføjet `set_config('stork.t9_write_authorized', 'true', false)` før INSERTs — krævet af T9-supplement's INSERT-policies på permission_pages/tabs/role_permission_grants (Codex V3 KRITISK).
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5096:**Begrundelse:** Master-plan §1.11 placerer klienter i core_identity. T9's `client_node_placements` ligger allerede i core_identity. Konsistent skema-placering.
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:5148:  - **Plan-konsekvens:** T10.7b CREATE OR REPLACE både `client_node_place` (wrapper) og `_apply_client_place` (apply-handler) med aktiv-check og `is_admin()`-bypass. `client_node_close` rør IKKE — lukning er legitim ved deaktivering. Eksistens-check (P0002) bypasses IKKE for superadmin (FK håndhæver alligevel).

exec
/bin/bash -lc 'rg -n "T9-public-wrapper-bug|public-wrapper|G0[0-9]+|G-nummer" docs/coordination/rapport-historik/2026-05-21-trin-10.md docs/teknisk/teknisk-gaeld.md docs/coordination/arkiv/trin-10-plan.md | head -n 80' in /home/mathias/stork-2.0
 succeeded in 0ms:
docs/coordination/rapport-historik/2026-05-21-trin-10.md:23:G-numre tilføjet: G057, G058
docs/coordination/rapport-historik/2026-05-21-trin-10.md:71:| Forslag                                                        | Klasse   | Code's svar | Begrundelse / G-nummer                                              |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:74:| FK-coverage-fitness-check                                      | runde 10 | DEFER       | G058 — kræver fitness-arkitektur-arbejde uden for trin 10's scope   |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:75:| T9-public-wrapper-bug (5 RPC'er mangler `t9_write_authorized`) | runde 8  | DEFER       | Ud over scope (T9-fundament); flag som separat pakke; G-kandidat    |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:86:- **Konsekvens:** M1-test refactored til grant-model + reverse-migration T10.14c sletter legacy-rows. Ingen G-nummer.
docs/coordination/rapport-historik/2026-05-21-trin-10.md:105:- **Teknisk gæld akkumuleret:** G057 (T9 forretnings-invariants uden superadmin-bypass), G058 (FK-coverage-fitness-check).
docs/coordination/rapport-historik/2026-05-21-trin-10.md:124:  - G057 — T9 forretnings-invariants uden superadmin-bypass (inkonsistent med Mathias 2026-05-21)
docs/coordination/rapport-historik/2026-05-21-trin-10.md:125:  - G058 — FK-coverage-fitness-check ikke implementeret per master-plan §3 punkt 19
docs/coordination/rapport-historik/2026-05-21-trin-10.md:148:| `docs/teknisk/teknisk-gaeld.md`            | ja             | G057 + G058 registreret                                        |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:164:- **Forudsætninger inden næste start:** ingen blokerede; G057 + G058 kan løses i kommende fitness/T9-pakke.
docs/teknisk/teknisk-gaeld.md:11:**Sidste opdatering:** 19. maj 2026 (G054 LØST — type-codegen for alle 4 eksponerede API-schemas)
docs/teknisk/teknisk-gaeld.md:17:### [G058] MELLEM — FK-coverage-fitness-check ikke implementeret per master-plan §3 punkt 19
docs/teknisk/teknisk-gaeld.md:26:### [G057] MELLEM — T9 forretnings-invariants uden superadmin-bypass (inkonsistent med Mathias 2026-05-21)
docs/teknisk/teknisk-gaeld.md:36:### [G001] HØJ — `audit_filter_values` LENIENT-default ved ukendt schema/table
docs/teknisk/teknisk-gaeld.md:45:### [G002] LAV — `source_type`-enum udvidet inline med 'migration'
docs/teknisk/teknisk-gaeld.md:54:### [G003] LAV — Hardkodede `auth.users`-id'er i bootstrap
docs/teknisk/teknisk-gaeld.md:63:### [G004] STRUKTUREL — `employees_active_idx` mangler `current_date` i prædikat
docs/teknisk/teknisk-gaeld.md:71:### [G005] LAV — Fase 0 migration-filer bevaret som "historik"
docs/teknisk/teknisk-gaeld.md:80:### [G006] MELLEM — `db-rls-policies` fitness-check er "soft" (warning only)
docs/teknisk/teknisk-gaeld.md:89:### [G007] MELLEM — Migration-scripts har TODO-markører for 1.0-skema
docs/teknisk/teknisk-gaeld.md:98:### [G008] LAV — Default-rolle 'sælger' hardkodet i upload-script
docs/teknisk/teknisk-gaeld.md:107:### [G029] MELLEM — C001-backfill bruger legal retention mod master-plan-reservation
docs/teknisk/teknisk-gaeld.md:119:### [G028] MELLEM — C002/C003-commit klassificerede ikke nye dispatcher-kolonner (LØST som disciplin-fix)
docs/teknisk/teknisk-gaeld.md:129:### [G026] HØJ — Replay-anonymisering brugte live mapping + INSERT'ede state-row (LØST i C002/C003)
docs/teknisk/teknisk-gaeld.md:143:### [G025] HØJ — `retention_cleanup_daily` cron-vej kunne ikke kalde anonymize-RPC (LØST i C002/C003)
docs/teknisk/teknisk-gaeld.md:158:### [G011] MELLEM — `verify_anonymization_consistency` kun har employee-branch (LØST i C002/C003)
docs/teknisk/teknisk-gaeld.md:160:Generaliseret via dispatcher samme commit som G025/G026. Verify læser nu `anonymization_mappings.anonymized_check_column` og dispatcher dynamic SQL pr. entity_type.
docs/teknisk/teknisk-gaeld.md:162:### [G010] MELLEM — `replay_anonymization` kun har employee-branch (LØST i C002/C003)
docs/teknisk/teknisk-gaeld.md:164:Generaliseret via dispatcher samme commit som G025/G026. Replay læser nu `anonymization_mappings.internal_rpc_apply` og dispatcher pr. entity_type. Forward-kompat for clients (trin 10) + identity-master (trin 15).
docs/teknisk/teknisk-gaeld.md:166:### [G009] HØJ — `retention_cleanup_daily` HARDKODER 1825 dage for employees (LØST i C002/C003)
docs/teknisk/teknisk-gaeld.md:168:Generisk evaluator implementeret samme commit som G025/G026. retention-cron læser nu `data_field_definitions.retention_value->>'days_after'` pr. tabel (max over alle event_based-kolonner). Hardkodning fjernet — "alt drift styres i UI" overholdt.
docs/teknisk/teknisk-gaeld.md:170:### [G012] HØJ — `pay_period_compute_candidate` er SKELETON → fejl-låst prod-periode-risiko
docs/teknisk/teknisk-gaeld.md:177:- **Plan i denne commit:** **Safety-flip `pay_period_settings.auto_lock_enabled = false` (migration `20260514160001_t7_disable_auto_lock_until_compute_real.sql`)**. Cron tjekker global switch FØR den itererer perioder, så alle periode-locks skippes. Re-aktiveres når trin 14 + trin 22 er færdige OG G013 er løst.
docs/teknisk/teknisk-gaeld.md:179:### [G013] MELLEM — `pay_period_lock` re-lock efter break-glass-unlock håndterer ikke UNIQUE-conflict
docs/teknisk/teknisk-gaeld.md:188:### [G014] MELLEM — SELECT-policies på løn-tabeller er admin-only
docs/teknisk/teknisk-gaeld.md:197:### [G015] LAV — `_compute_period_data_checksum` mangler sales-state
docs/teknisk/teknisk-gaeld.md:206:### [G016] LAV — `pay_periods.locked_by` NULLABLE i locked-state (inline-fix)
docs/teknisk/teknisk-gaeld.md:215:### [G017] LAV — Test-artefakter i prod-DB (LØST i H024)
docs/teknisk/teknisk-gaeld.md:220:- **Status:** **LØST i H024 build-PR** — engangs cleanup-migration `20260516200000_h024_test_artifact_cleanup.sql` rydder G017-cluster atomically (1 pay_period + 1 candidate_run + 260 snapshots + 1 salary_correction + 1 anonymization_state + 1 anonymized employee) via marker-based DELETE + DISABLE/ENABLE TRIGGER pattern. Mathias-godkendt one-shot pre-cutover-mekanisme (qwerg 2026-05-16). G017-cluster tolkning (b) bekræftet: hele G017-clusteret er test-artefakt, krav-dok's "2 reelle candidate_runs" var faktuelt forkert (kun 1 reel — e8070819 paired med f4c86616).
docs/teknisk/teknisk-gaeld.md:224:### [G018] LAV — Bygge-status klassifikations-tal er forkerte
docs/teknisk/teknisk-gaeld.md:233:### [G024] HØJ — Klassifikations-registry tillod NULL retention på hver kolonne (LØST i C001)
docs/teknisk/teknisk-gaeld.md:253:### [G023] MELLEM — Break-glass dispatcher fri-tekst + inactive RPC-seed (LØST i C006)
docs/teknisk/teknisk-gaeld.md:268:### [G022] HØJ — Admin-floor count + trigger inkluderede ikke termination_date (LØST i C005)
docs/teknisk/teknisk-gaeld.md:283:### [G021] HØJ — `pay_period` SECURITY DEFINER current_user-fallback (LØST i C004)
docs/teknisk/teknisk-gaeld.md:302:### [G031] MELLEM — Lock-pipeline-benchmark mangler (R8b post-lag-E)
docs/teknisk/teknisk-gaeld.md:307:- **Opdaget:** Codex Fund 18 + R5b/G030-context
docs/teknisk/teknisk-gaeld.md:317:### [G030] MELLEM — `commission_snapshots.sale_id` er `gen_random_uuid()`-placeholder (R5b post-lag-E)
docs/teknisk/teknisk-gaeld.md:332:### [G033] MELLEM — Varig fitness-check for regprocedure-callable-regressioner mangler
docs/teknisk/teknisk-gaeld.md:340:- **Plan (G033):**
docs/teknisk/teknisk-gaeld.md:346:### [G034] LAV — V2-recon-scanner matcher kun literal `is_active = true`
docs/teknisk/teknisk-gaeld.md:353:- **Plan (G034):** Udvid V2.2-pattern + D5-pattern til at også matche `IS TRUE`, `coalesce(_, ...) = true`, eller migrér til AST-baseret PG-parser hvis kompleksitet stiger.
docs/teknisk/teknisk-gaeld.md:355:### [G035] LAV — D5 checker globalt pr. function-body, ikke pr. occurrence
docs/teknisk/teknisk-gaeld.md:362:- **Plan (G035):** Per-occurrence-detection via AST eller regex split af SELECT/WHERE-blokke. Eller: kør D5 + dokumentér antagelsen om at funktioner enten har alle compliant eller ingen.
docs/teknisk/teknisk-gaeld.md:364:### [G036] MELLEM — R7a+R7d cron-reschedule race-window
docs/teknisk/teknisk-gaeld.md:371:- **Plan (G036):** Implementér Option A — kombinér R7a's cron-body-fix + R7d's reader-fix i ét cron.unschedule + cron.schedule kald. Eller flag som G036-deferred hvis implementation viser at to separate migrations er nødvendige af andre grunde.
docs/teknisk/teknisk-gaeld.md:373:### [G037] MELLEM — R7d backfill mangler session-vars for audit-spor
docs/teknisk/teknisk-gaeld.md:380:- **Plan (G037):** R7d-migration starter med:
docs/teknisk/teknisk-gaeld.md:389:### [G038] LAV — cron.unschedule via navn-lookup vs jobid-lookup
docs/teknisk/teknisk-gaeld.md:396:- **Plan (G038):** Pattern:
docs/teknisk/teknisk-gaeld.md:405:### [G039] LAV — V1 PostgREST-test bør køres med både anon og authenticated
docs/teknisk/teknisk-gaeld.md:412:- **Plan (G039):** V1 curl-instruks udvides med to kald — anon + authenticated JWT — begge mod `/rest/v1/rpc/set_config`. Forventet output: 404 fra begge. Hvis ikke: stop-protokol.
docs/teknisk/teknisk-gaeld.md:414:### [G040] LAV — Option D PostgREST-schema-isolation skal verificere faktisk deployed API config
docs/teknisk/teknisk-gaeld.md:421:- **Plan (G040):** Hvis V1 afslører eksponering OG Option D aktiveres: tilføj fitness-check der scanner deployed API-config + alerter hvis pg_catalog tilføjes til db-schemas.
docs/teknisk/teknisk-gaeld.md:423:### [G042] MELLEM — Replay-shape mismatch: nested (P1b) vs flat (`_anonymize_employee_apply`)
docs/teknisk/teknisk-gaeld.md:437:### [G041] LAV — Retention cron e2e-test bør eksekvere faktisk scheduled command
docs/teknisk/teknisk-gaeld.md:444:- **Plan (G041):** Test-pattern:
docs/teknisk/teknisk-gaeld.md:454:### [G043] MELLEM — r3_commission_snapshots_immutability test mangler cleanup-strategi (LØST i H024)
docs/teknisk/teknisk-gaeld.md:464:### [G044] MELLEM — pay_periods-INSERT-tests har ingen cleanup-mekanisme (LØST i H024)
docs/teknisk/teknisk-gaeld.md:467:- **Berørte tests (kendt):** `r3_commission_snapshots_immutability` (G017's salary_correction er prod-DB-rest, ikke fra dedikeret test). Tidligere fejl-reference til `r4_salary_corrections_cleanup` rettet.
docs/teknisk/teknisk-gaeld.md:469:- **Status:** **LØST i H024 build-PR** — samme rod-årsag som G043, samme løsning: tx-rollback wraps test-INSERTs så DELETE-blokering aldrig trigges. Cleanup-migration rydder eksisterende stale rows (inkl. 28 pay_periods-test-artefakter). Fitness-check fremover.
docs/teknisk/teknisk-gaeld.md:473:### [G046] MELLEM — Fitness-check fanger ikke manglende table grants ved policy-tilføjelse
docs/teknisk/teknisk-gaeld.md:482:### [G047] MELLEM — DB-tests kører mod live remote DB (ingen isoleret test-DB)
docs/teknisk/teknisk-gaeld.md:491:### [G048] LAV — Step 3's fil-as-applied indeholder buggy closure-rebuild CTE
docs/teknisk/teknisk-gaeld.md:498:- **Spor til fix-location:** G048 selv + bygge-status.md "Vores trin 5"-detalje-sektion + T9 slut-rapport (`docs/coordination/rapport-historik/2026-05-18-t9.md`) dokumenterer bug-klassen og fix-location i Step 12. Inline kommentar i Step 3-filen overvejet, ikke leveret (ville kræve modifikation af applied migration-fil; rejected per append-only).
docs/teknisk/teknisk-gaeld.md:500:### [G049] MELLEM — Apply-dispatcher-extension-pattern ikke formaliseret i plan-skabelon
docs/teknisk/teknisk-gaeld.md:509:### [G050] MELLEM — Plan V6 mangelfuldt om RLS write-policy-strategi
docs/teknisk/teknisk-gaeld.md:518:### [G051] LAV — Pre-T9 funktioner redefineret uden eksplicit signatur-diff
docs/teknisk/teknisk-gaeld.md:527:### [G056] LØST i PR claude/lag1-disciplin-G055-G056 — `codex-overvaagning.md` rolle-grænse præciseret
docs/teknisk/teknisk-gaeld.md:534:### [G055] LØST i PR claude/lag1-disciplin-G055-G056 — `scripts/codex-review.sh` parser udvidet med severity-prefix + NEEDS-MATHIAS
docs/teknisk/teknisk-gaeld.md:541:### [G052] LAV — Vej B i PR #40 skabte præcedens for "ret merged-til-main migration når ej applied"

exec
/bin/bash -lc 'rg -n "pending_changes_insert|create policy pending_changes_insert|t9_write_authorized|pending_change_request" supabase/migrations/20260518100000_t9_fundament_supplement.sql supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql supabase/migrations/20260521000008_t10_client_active_check.sql' in /home/mathias/stork-2.0
 succeeded in 0ms:
supabase/migrations/20260521000008_t10_client_active_check.sql:15:-- V9 (Codex runde 8 TEKNISK-BLOKERING): wrapper sætter t9_write_authorized FØR
supabase/migrations/20260521000008_t10_client_active_check.sql:16:-- pending_change_request (T9-fundament-supplement INSERT-policy kræver det).
supabase/migrations/20260521000008_t10_client_active_check.sql:84:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260521000008_t10_client_active_check.sql:85:  v_request_id := core_identity.pending_change_request(
supabase/migrations/20260521000008_t10_client_active_check.sql:119:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260521000008_t10_client_active_check.sql:120:  v_request_id := core_identity.pending_change_request(
supabase/migrations/20260518100000_t9_fundament_supplement.sql:16:-- - 6 write-tabeller får INSERT + UPDATE policies med t9_write_authorized-check
supabase/migrations/20260518100000_t9_fundament_supplement.sql:17:-- - 11 write-RPCs får perform set_config('stork.t9_write_authorized', 'true', true)
supabase/migrations/20260518100000_t9_fundament_supplement.sql:44:-- Begge kræver current_setting('stork.t9_write_authorized', true) = 'true'.
supabase/migrations/20260518100000_t9_fundament_supplement.sql:49:create policy pending_changes_insert on core_identity.pending_changes
supabase/migrations/20260518100000_t9_fundament_supplement.sql:51:  with check (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:55:  using (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:88:  with check (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:92:  using (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:97:  with check (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:101:  using (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:106:  with check (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:110:  using (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:115:  with check (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:119:  using (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:129:  with check (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:133:  using (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:137:  using (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:143:--   2. perform set_config('stork.t9_write_authorized', 'true', true)
supabase/migrations/20260518100000_t9_fundament_supplement.sql:237:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:308:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:344:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:377:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:408:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:425:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:452:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:469:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:496:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:528:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:559:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:4:-- - 7 pending-pligtige public RPC'er (tynde wrappers omkring pending_change_request)
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:29:  v_request_id := core_identity.pending_change_request(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:56:  v_request_id := core_identity.pending_change_request(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:84:  v_request_id := core_identity.pending_change_request(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:104:  v_request_id := core_identity.pending_change_request(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:127:  v_request_id := core_identity.pending_change_request(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:159:  v_request_id := core_identity.pending_change_request(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:182:  v_request_id := core_identity.pending_change_request(

exec
/bin/bash -lc "sed -n '1,145p' supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql" in /home/mathias/stork-2.0
 succeeded in 0ms:
-- Trin 9 / §4 trin 9 Step 8: Public pending-wrapper RPCs + employee_role-wrappers.
--
-- Plan V6 Beslutning 11+12 + Valg 1+14:
-- - 7 pending-pligtige public RPC'er (tynde wrappers omkring pending_change_request)
-- - 2 direkte role-RPC'er (employee_role_assign/remove; ikke pending)
-- Alle SECURITY DEFINER med has_permission-check.

-- ─── org_node_upsert (pending) ──────────────────────────────────────────
create or replace function core_identity.org_node_upsert(
  p_id uuid,
  p_name text,
  p_parent_id uuid,
  p_node_type text,
  p_is_active boolean,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_request_id uuid;
begin
  if not core_identity.has_permission('org_nodes', 'manage', true) then
    raise exception 'permission_denied: org_nodes/manage/can_edit' using errcode = '42501';
  end if;
  if p_name is null or p_node_type is null or p_effective_from is null then
    raise exception 'invalid_input: name, node_type, effective_from required' using errcode = '22023';
  end if;
  if p_node_type not in ('department', 'team') then
    raise exception 'invalid_node_type: %', p_node_type using errcode = '22023';
  end if;

  v_request_id := core_identity.pending_change_request(
    'org_node_upsert',
    p_id,
    jsonb_build_object(
      'id', coalesce(p_id::text, ''),
      'name', p_name,
      'parent_id', coalesce(p_parent_id::text, ''),
      'node_type', p_node_type,
      'is_active', p_is_active,
      'effective_from', p_effective_from::text
    ),
    p_effective_from
  );
  return v_request_id;
end; $$;
revoke execute on function core_identity.org_node_upsert(uuid, text, uuid, text, boolean, date) from public, anon;

-- ─── org_node_deactivate (pending) ──────────────────────────────────────
create or replace function core_identity.org_node_deactivate(
  p_node_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_request_id uuid;
begin
  if not core_identity.has_permission('org_nodes', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  v_request_id := core_identity.pending_change_request(
    'org_node_deactivate', p_node_id,
    jsonb_build_object('node_id', p_node_id::text, 'effective_from', p_effective_from::text),
    p_effective_from
  );
  return v_request_id;
end; $$;
revoke execute on function core_identity.org_node_deactivate(uuid, date) from public, anon;

-- ─── team_close (pending) ───────────────────────────────────────────────
create or replace function core_identity.team_close(
  p_node_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_request_id uuid;
begin
  if not core_identity.has_permission('org_nodes', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  -- Pre-check: verificér at det er team-knude (apply-handler re-validerer).
  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = p_node_id and node_type = 'team'
      and effective_from <= current_date
      and (effective_to is null or effective_to > current_date)
  ) then
    raise exception 'node_not_team_or_inactive: %', p_node_id using errcode = '22023';
  end if;
  v_request_id := core_identity.pending_change_request(
    'team_close', p_node_id,
    jsonb_build_object('node_id', p_node_id::text, 'effective_from', p_effective_from::text),
    p_effective_from
  );
  return v_request_id;
end; $$;
revoke execute on function core_identity.team_close(uuid, date) from public, anon;

-- ─── employee_place (pending) ───────────────────────────────────────────
create or replace function core_identity.employee_place(
  p_employee_id uuid,
  p_node_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_request_id uuid;
begin
  if not core_identity.has_permission('employee_placements', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  v_request_id := core_identity.pending_change_request(
    'employee_place', p_employee_id,
    jsonb_build_object(
      'employee_id', p_employee_id::text,
      'node_id', p_node_id::text,
      'effective_from', p_effective_from::text
    ),
    p_effective_from
  );
  return v_request_id;
end; $$;
revoke execute on function core_identity.employee_place(uuid, uuid, date) from public, anon;

-- ─── employee_remove_from_node (pending) ────────────────────────────────
create or replace function core_identity.employee_remove_from_node(
  p_employee_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_request_id uuid;
begin
  if not core_identity.has_permission('employee_placements', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  v_request_id := core_identity.pending_change_request(
    'employee_remove', p_employee_id,
    jsonb_build_object(
      'employee_id', p_employee_id::text,
      'effective_from', p_effective_from::text
    ),
    p_effective_from
  );
  return v_request_id;
end; $$;
revoke execute on function core_identity.employee_remove_from_node(uuid, date) from public, anon;

-- ─── client_node_place (pending) ────────────────────────────────────────
create or replace function core_identity.client_node_place(
  p_client_id uuid,
  p_node_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_request_id uuid;

exec
/bin/bash -lc "sed -n '40,75p' supabase/migrations/20260518100000_t9_fundament_supplement.sql" in /home/mathias/stork-2.0
 succeeded in 0ms:

-- ─── DEL 1: Policies på 6 write-tabeller ──────────────────────────────────
--
-- Pattern: INSERT-policy med WITH CHECK + UPDATE-policy med USING.
-- Begge kræver current_setting('stork.t9_write_authorized', true) = 'true'.
-- Tredje arg til current_setting('...', true) returnerer NULL hvis var ikke
-- er sat — koalescerer til false i bool-sammenligning.

-- 1.1 pending_changes
create policy pending_changes_insert on core_identity.pending_changes
  for insert to authenticated
  with check (current_setting('stork.t9_write_authorized', true) = 'true');

create policy pending_changes_update on core_identity.pending_changes
  for update to authenticated
  using (current_setting('stork.t9_write_authorized', true) = 'true');

-- Codex runde 3 fund 2: SELECT-policy fra Step 1 (Step 1's body linje 87-93)
-- tillod kun requester + is_admin() at se pending rows. Det blokerer
-- pending_change_approve/undo's dispatcher (select * ... for update køres
-- FØR dispatcher kan evaluere has_permission). Erstat med policy der også
-- tillader potentielle approvere/undoere baseret på samme change_type →
-- page_key-mapping som dispatcheren bruger. Holder §1.1: policy er
-- write-uafhængig; dispatcher gates'er write som sandhed.
drop policy if exists pending_changes_select on core_identity.pending_changes;

create policy pending_changes_select on core_identity.pending_changes
  for select to authenticated
  using (
    requested_by = core_identity.current_employee_id()
    or core_identity.is_admin()
    or (
      change_type in ('org_node_upsert', 'org_node_deactivate', 'team_close')
        and core_identity.has_permission('org_nodes', null, true)
    )
    or (

exec
/bin/bash -lc "sed -n '1,180p' docs/coordination/mathias-afgoerelser.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
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

exec
/bin/bash -lc "sed -n '1,180p' docs/coordination/arkiv/trin-10-krav-og-data.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
# Trin 10 — Klient-skabelon og felt-definitioner

**Pakke:** §4 trin 10 — Klient-skabelon + felt-definitioner
**Status:** Klar til Mathias-godkendelse
**Dato:** 2026-05-20

---

## 1. Pakkens formål

Trin 10 etablerer klienten som forretnings-fundament i Stork 2.0. En klient er én af de firmaer Stork sælger for — eksempelvis Tryg, Eesy, TDC, Finansforbundet. Alt i forretningen hænger på klienten: salg, calls, team-tilknytning, lønarter.

Trin 10 bygger klient-stammen og felt-definitioner-mekanikken så alt andet senere kan kobles på den. Pakken leverer ikke frontend-pages og ikke admin-UI'er. Den leverer fundamentet i databasen.

Kilde: master-plan §1.8 "Klient er driftens grundenhed".

---

## 2. Forretningsmæssige sandheder

Disse er rammen for trin 10. De er afgjort af Mathias og kan ikke ændres af Code eller Codex.

### 2.1 Klient-identitet og dataejerskab

1. **Klient ejer rå dataen der kobles på klienten.** Salg, calls og andre rå data følger klienten ved team-skift. Teamet bevarer historik om at have ejet klienten i en periode, men ejer ikke dataen.

2. **Dato afgør sandheden.** Når et salg laves på dato X, og klienten på dato X var knyttet til team Y, så er den binding historisk fast. Senere ændringer i klient-team-tilknytning ændrer ikke gamle data. Annulleringer eller anden feedback der kommer senere på et salg rammer det team der ejede klienten på salgs-tidspunktet, ikke det nuværende team.

### 2.2 Klient-til-team

1. **Klient knyttes kun til team-niveau.** Aldrig til afdelinger eller Copenhagen Sales-niveauet.

2. **En klient er knyttet til maksimalt ét team ad gangen.** Historikken bevares så Stork altid kan se hvilket team der ejede klienten på et givet tidspunkt.

3. **Klient kan ikke dræbe et team.** Hvis klient stopper, fortsætter teamet. Klient-til-team-tilknytningen lukkes med en slut-dato; teamet eksisterer uafhængigt.

4. **Klient-team-skift følger fortrydelses-mekanismen.** Ændring med gældende dato → godkendelse → kan rulles tilbage i fortrydelses-periode → derefter permanent. Mekanikken er etableret i T9.

### 2.3 Klient-felter

1. **Hver klient kan have sine egne felter.** Felter defineres pr. klient. Felter tilføjes og ændres uden teknisk ændring.

2. **Pr. felt-definition registreres:** navn, type, om feltet er påkrævet, persondata-niveau, sortering, aktiv-tilstand.

### 2.4 Klient-logo

1. **Klient kan have et logo.**

### 2.5 Klient-livscyklus og persondata

1. **Klient anonymiseres ikke.** Klient-navn er forretningsdata, ikke persondata. Klient-rækken bliver stående evigt så historik og audit-spor bevares.

2. **Klient-livscyklus er kun aktiv/inaktiv.** Ingen mellem-tilstande. Samme mønster som teams og afdelinger. Inaktiv klient bliver stående for historik, men kan ikke vælges som ny team-tilknytning.

3. **Felter på klienten kan være persondata.** Hvis et felt er direkte persondata (fx en kontaktperson), har det egne sletteregler på felt-niveau, ikke klient-niveau.

### 2.6 Klient-styring

1. **Rettigheder til klient-handlinger styres i UI.** Hvem må oprette/ændre/deaktivere klienter defineres i rettigheds-systemet, ikke fastlagt i kode.

2. **Lønarter der refererer klient sættes op via formler i UI.** Formel-systemet (trin 13) leverer mekanikken; konfiguration sker i UI bagefter. Klient-skabelonen selv har ikke lønart-konfiguration på sig.

---

## 3. Funktioner trin 10 skal levere

Dette afsnit beskriver HVAD systemet skal kunne gøre. Det er det centrale — krav-dokumentet er en kontrakt på funktioner, ikke på datastruktur.

### 3.1 Funktioner på klient

| Funktion           | Beskrivelse                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| Opret klient       | Bruger opretter en ny klient med navn                                                                           |
| Ændr klient        | Bruger ændrer navn på klient                                                                                    |
| Deaktivér klient   | Bruger sætter klient inaktiv. Klienten bliver stående for historik, men kan ikke vælges som ny team-tilknytning |
| Hent klient        | Bruger kan se en klient med dens aktuelle felt-værdier                                                          |
| Hent klient-liste  | Bruger kan se alle klienter (aktive og inaktive)                                                                |
| Upload klient-logo | Bruger uploader et logo på klienten                                                                             |

### 3.2 Funktioner på klient-felter (felt-definitioner)

| Funktion                  | Beskrivelse                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| Opret felt-definition     | Bruger opretter en ny felt-definition for en klient med navn, type, krav, persondata-niveau, sortering |
| Ændr felt-definition      | Bruger ændrer en eksisterende felt-definition                                                          |
| Deaktivér felt-definition | Bruger sætter felt inaktiv (bliver stående for historik)                                               |
| Hent felt-definitioner    | Bruger kan se alle aktive felt-definitioner for en klient                                              |

### 3.3 Funktioner på klient-felt-værdier

| Funktion        | Beskrivelse                                                |
| --------------- | ---------------------------------------------------------- |
| Sæt felt-værdi  | Bruger sætter eller ændrer værdien af et felt på en klient |
| Hent felt-værdi | Bruger kan se den aktuelle værdi af et felt på en klient   |

### 3.4 Funktioner på klient-til-team-tilknytning

Klient-til-team-tilknytningen er etableret som mekanik i T9. Trin 10 leverer at den faktisk kobler til klienter:

| Funktion                         | Beskrivelse                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| Verifikation af klient-reference | Når en klient-til-team-tilknytning oprettes eller ændres, valideres at klienten faktisk findes |

---

## 4. Status og forudsætninger

### 4.1 Allerede bygget i tidligere trin

- Trin 1-7c: schemas, audit, klassifikations-registry, retention-disciplin, periode-skabelon, anonymisering
- Trin 9: organisations-træ, medarbejder-placeringer, permission-fundament, fortrydelses-mekanisme, klient-til-team-tilknytnings-mekanik (uden klient-reference)

### 4.2 Hvad trin 10 udvider på eksisterende

- Klient-til-team-tilknytningen fra T9 får sin reference til klient-stammen
- Fortrydelses-mekanismen fra T9 dækker også klient-handlinger med gældende dato

---

## 5. Ikke en del af trin 10

- **Salg som funktionalitet** — trin 14
- **Pricing-regler pr. klient** — senere trin
- **Lønarter der refererer klient** — formel-systemet, trin 13
- **Frontend-pages og admin-UI'er** — senere lag
- **Konkrete rettighedstildelinger** — sættes op i UI når frontend etableres
- **Klient-anonymiserings-mekanik** — klient anonymiseres ikke

### 5.1 Klient-data-migration fra 1.0

Migration af klient-data fra 1.0 til 2.0 er udskudt fra trin 10. Trin 10 leverer kun klient-skabelonen som greenfield-fundament. Klient-data-migration tages op senere som separat pakke når behovet konkret melder sig.

Kilde: mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud".

### 5.2 Match-mekanik mellem data-indgange

Når data lander i Stork fra forskellige kilder (Eesy via API, TDC via Excel-upload, måske andre senere), skal Stork kunne sige "denne nye række er samme kunde / samme salg som den række jeg allerede har". Det kræver et felt der kan bruges som matche-nøgle — fx et telefonnummer, et kunde-id, eller et opportunity-id.

Eksempel i hverdags-sprog: TDC sender en Excel hver morgen med salg fra i går. Eesy sender salg via API. Begge har et felt "telefon". Når TDC's række kommer ind, skal Stork tjekke: "har jeg allerede sét et salg på dette telefonnummer fra Eesy de seneste 48 timer? Hvis ja → dublet, drop det." Det er match.

**Det hører ikke i trin 10.** For at kunne designe match-mekanikken skal vi vide:

- Hvordan ser data-indgang-UI'en ud? (API-konfiguration? Excel-upload-side? Begge?)
- Skal match-feltet vælges pr. data-indgang, eller arves fra klienten?
- Hvad sker når en match fejler — manuel håndtering? Stilles i kø?

Ingen af de spørgsmål er afklaret. At designe match-mekanikken nu er at gætte på en arkitektur der låser senere valg. Det udskydes til der hvor data-indgange bygges, når UI og konkrete krav er kendt.

Kilde: mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud".

---

## 6. Tekniske valg overladt til Code og Codex

Krav-dokumentet specificerer kun forretningsmæssige sandheder og funktioner. Følgende er Code's og Codex' opgave:

- Hvordan klient-stammen teknisk implementeres
- Hvordan klient-felt-definitioner teknisk gemmes og opdateres
- Hvordan klient-felt-værdier teknisk håndteres
- Hvordan klient-logo teknisk håndteres (upload, lagring, størrelses-håndtering, normalisering)
- Hvordan klient-livscyklus (aktiv/inaktiv) teknisk realiseres
- Hvordan klient-FK til T9's klient-til-team-tilknytning teknisk tilføjes
- Hvordan triggers vedligeholder konsistens
- Hvilke fitness-checks og tests
- Konkrete tabel- og kolonne-navne

Hvis Code finder at en teknisk afgørelse rummer en forretningsmæssig dimension der bør være Mathias' bord, flagges det eksplicit i plan-arbejdet — ikke besluttet af Code alene.

---

## 7. Master-plan-rettelser nødvendige

Som konsekvens af afgørelserne om scope (sektion 5.1 og 5.2) skal master-plan rettes som del af trin 10-arbejdet:

- **§1.8 (Klient-skabelon):** match-rolle-konceptet (match-rolle pr. felt + crm_match_id-rolle + enum-liste over match-typer) fjernes fra felt-definitions-mønstret
- **§4 trin 10:** migration-leverancen og crm_match_id-rolle-teksten fjernes fra trin 10's række

De konkrete tekstrettelser er Code's bord at finde og udføre. Begge rettelser har sporbar kilde i mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud".

---

exec
/bin/bash -lc "rg -n \"source_type|change_reason|t9_write_authorized|allow_clients_write|allow_client_field_definitions_write|has_permission\\('clients'|has_permission\\('client_field_definitions'|create policy|grant insert|grant update|grant execute|revoke execute\" supabase/migrations/2026052100000{1,6,9}.sql supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql supabase/migrations/20260521000011_t10_client_logo_rpcs.sql supabase/migrations/20260521000012_t10_client_read_rpcs.sql" in /home/mathias/stork-2.0
 exited 2 in 0ms:
rg: supabase/migrations/20260521000001.sql: No such file or directory (os error 2)
rg: supabase/migrations/20260521000006.sql: No such file or directory (os error 2)
rg: supabase/migrations/20260521000009.sql: No such file or directory (os error 2)
supabase/migrations/20260521000012_t10_client_read_rpcs.sql:25:  if not core_identity.has_permission('clients', 'manage', false) then
supabase/migrations/20260521000012_t10_client_read_rpcs.sql:41:grant execute on function core_identity.client_get(uuid) to authenticated;
supabase/migrations/20260521000012_t10_client_read_rpcs.sql:51:  if not core_identity.has_permission('clients', 'manage', false) then
supabase/migrations/20260521000012_t10_client_read_rpcs.sql:65:grant execute on function core_identity.client_list() to authenticated;
supabase/migrations/20260521000012_t10_client_read_rpcs.sql:78:  if not core_identity.has_permission('client_field_definitions', 'manage', false) then
supabase/migrations/20260521000012_t10_client_read_rpcs.sql:91:grant execute on function core_identity.client_field_definitions_list(boolean) to authenticated;
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:17:  p_change_reason text
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:22:  if not core_identity.has_permission('clients', 'manage', true) then
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:25:  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:26:    raise exception 'client_logo_set: change_reason er paakraevet' using errcode = '22023';
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:32:  perform set_config('stork.source_type', 'manual', true);
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:33:  perform set_config('stork.change_reason', p_change_reason, true);
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:34:  perform set_config('stork.allow_clients_write', 'true', true);
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:48:grant execute on function core_identity.client_logo_set(uuid, bytea, text, text, text) to authenticated;
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:53:  p_change_reason text
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:58:  if not core_identity.has_permission('clients', 'manage', true) then
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:61:  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:62:    raise exception 'client_logo_clear: change_reason er paakraevet' using errcode = '22023';
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:65:  perform set_config('stork.source_type', 'manual', true);
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:66:  perform set_config('stork.change_reason', p_change_reason, true);
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:67:  perform set_config('stork.allow_clients_write', 'true', true);
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:81:grant execute on function core_identity.client_logo_clear(uuid, text) to authenticated;
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:89:  if not core_identity.has_permission('clients', 'manage', false) then
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:102:grant execute on function core_identity.client_logo_get(uuid) to authenticated;
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:4:-- has_permission('client_field_definitions', 'manage', true).
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:21:  p_change_reason text,
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:34:  if not core_identity.has_permission('client_field_definitions', 'manage', true) then
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:37:  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:38:    raise exception 'client_field_definition_upsert: change_reason er paakraevet' using errcode = '22023';
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:44:  perform set_config('stork.source_type', 'manual', true);
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:45:  perform set_config('stork.change_reason', p_change_reason, true);
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:46:  perform set_config('stork.allow_client_field_definitions_write', 'true', true);
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:95:grant execute on function core_identity.client_field_definition_upsert(text, text, text, text, text, boolean, integer, boolean, uuid) to authenticated;
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:101:  p_change_reason text
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:106:  if not core_identity.has_permission('client_field_definitions', 'manage', true) then
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:109:  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:110:    raise exception 'client_field_definition_set_active: change_reason er paakraevet' using errcode = '22023';
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:113:  perform set_config('stork.source_type', 'manual', true);
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:114:  perform set_config('stork.change_reason', p_change_reason, true);
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:115:  perform set_config('stork.allow_client_field_definitions_write', 'true', true);
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:130:grant execute on function core_identity.client_field_definition_set_active(uuid, boolean, text) to authenticated;

exec
/bin/bash -lc 'rg -n "Trin 10|superadmin|scope-præcisering|forretnings-ramme|rolle-swap|workaround|grant-model|client|klient|felt-definition|is_active" docs/coordination/mathias-afgoerelser.md docs/coordination/arkiv/trin-10-krav-og-data.md docs/strategi/vision-og-principper.md' in /home/mathias/stork-2.0
 succeeded in 0ms:
docs/strategi/vision-og-principper.md:12:ny lovgivning, nye klienter, nye datatyper, og nye krav uden at blive
docs/coordination/arkiv/trin-10-krav-og-data.md:1:# Trin 10 — Klient-skabelon og felt-definitioner
docs/coordination/arkiv/trin-10-krav-og-data.md:3:**Pakke:** §4 trin 10 — Klient-skabelon + felt-definitioner
docs/coordination/arkiv/trin-10-krav-og-data.md:11:Trin 10 etablerer klienten som forretnings-fundament i Stork 2.0. En klient er én af de firmaer Stork sælger for — eksempelvis Tryg, Eesy, TDC, Finansforbundet. Alt i forretningen hænger på klienten: salg, calls, team-tilknytning, lønarter.
docs/coordination/arkiv/trin-10-krav-og-data.md:13:Trin 10 bygger klient-stammen og felt-definitioner-mekanikken så alt andet senere kan kobles på den. Pakken leverer ikke frontend-pages og ikke admin-UI'er. Den leverer fundamentet i databasen.
docs/coordination/arkiv/trin-10-krav-og-data.md:25:1. **Klient ejer rå dataen der kobles på klienten.** Salg, calls og andre rå data følger klienten ved team-skift. Teamet bevarer historik om at have ejet klienten i en periode, men ejer ikke dataen.
docs/coordination/arkiv/trin-10-krav-og-data.md:27:2. **Dato afgør sandheden.** Når et salg laves på dato X, og klienten på dato X var knyttet til team Y, så er den binding historisk fast. Senere ændringer i klient-team-tilknytning ændrer ikke gamle data. Annulleringer eller anden feedback der kommer senere på et salg rammer det team der ejede klienten på salgs-tidspunktet, ikke det nuværende team.
docs/coordination/arkiv/trin-10-krav-og-data.md:33:2. **En klient er knyttet til maksimalt ét team ad gangen.** Historikken bevares så Stork altid kan se hvilket team der ejede klienten på et givet tidspunkt.
docs/coordination/arkiv/trin-10-krav-og-data.md:35:3. **Klient kan ikke dræbe et team.** Hvis klient stopper, fortsætter teamet. Klient-til-team-tilknytningen lukkes med en slut-dato; teamet eksisterer uafhængigt.
docs/coordination/arkiv/trin-10-krav-og-data.md:41:1. **Hver klient kan have sine egne felter.** Felter defineres pr. klient. Felter tilføjes og ændres uden teknisk ændring.
docs/coordination/arkiv/trin-10-krav-og-data.md:43:2. **Pr. felt-definition registreres:** navn, type, om feltet er påkrævet, persondata-niveau, sortering, aktiv-tilstand.
docs/coordination/arkiv/trin-10-krav-og-data.md:53:2. **Klient-livscyklus er kun aktiv/inaktiv.** Ingen mellem-tilstande. Samme mønster som teams og afdelinger. Inaktiv klient bliver stående for historik, men kan ikke vælges som ny team-tilknytning.
docs/coordination/arkiv/trin-10-krav-og-data.md:55:3. **Felter på klienten kan være persondata.** Hvis et felt er direkte persondata (fx en kontaktperson), har det egne sletteregler på felt-niveau, ikke klient-niveau.
docs/coordination/arkiv/trin-10-krav-og-data.md:59:1. **Rettigheder til klient-handlinger styres i UI.** Hvem må oprette/ændre/deaktivere klienter defineres i rettigheds-systemet, ikke fastlagt i kode.
docs/coordination/arkiv/trin-10-krav-og-data.md:61:2. **Lønarter der refererer klient sættes op via formler i UI.** Formel-systemet (trin 13) leverer mekanikken; konfiguration sker i UI bagefter. Klient-skabelonen selv har ikke lønart-konfiguration på sig.
docs/coordination/arkiv/trin-10-krav-og-data.md:69:### 3.1 Funktioner på klient
docs/coordination/arkiv/trin-10-krav-og-data.md:73:| Opret klient       | Bruger opretter en ny klient med navn                                                                           |
docs/coordination/arkiv/trin-10-krav-og-data.md:74:| Ændr klient        | Bruger ændrer navn på klient                                                                                    |
docs/coordination/arkiv/trin-10-krav-og-data.md:75:| Deaktivér klient   | Bruger sætter klient inaktiv. Klienten bliver stående for historik, men kan ikke vælges som ny team-tilknytning |
docs/coordination/arkiv/trin-10-krav-og-data.md:76:| Hent klient        | Bruger kan se en klient med dens aktuelle felt-værdier                                                          |
docs/coordination/arkiv/trin-10-krav-og-data.md:77:| Hent klient-liste  | Bruger kan se alle klienter (aktive og inaktive)                                                                |
docs/coordination/arkiv/trin-10-krav-og-data.md:78:| Upload klient-logo | Bruger uploader et logo på klienten                                                                             |
docs/coordination/arkiv/trin-10-krav-og-data.md:80:### 3.2 Funktioner på klient-felter (felt-definitioner)
docs/coordination/arkiv/trin-10-krav-og-data.md:84:| Opret felt-definition     | Bruger opretter en ny felt-definition for en klient med navn, type, krav, persondata-niveau, sortering |
docs/coordination/arkiv/trin-10-krav-og-data.md:85:| Ændr felt-definition      | Bruger ændrer en eksisterende felt-definition                                                          |
docs/coordination/arkiv/trin-10-krav-og-data.md:86:| Deaktivér felt-definition | Bruger sætter felt inaktiv (bliver stående for historik)                                               |
docs/coordination/arkiv/trin-10-krav-og-data.md:87:| Hent felt-definitioner    | Bruger kan se alle aktive felt-definitioner for en klient                                              |
docs/coordination/arkiv/trin-10-krav-og-data.md:89:### 3.3 Funktioner på klient-felt-værdier
docs/coordination/arkiv/trin-10-krav-og-data.md:93:| Sæt felt-værdi  | Bruger sætter eller ændrer værdien af et felt på en klient |
docs/coordination/arkiv/trin-10-krav-og-data.md:94:| Hent felt-værdi | Bruger kan se den aktuelle værdi af et felt på en klient   |
docs/coordination/arkiv/trin-10-krav-og-data.md:96:### 3.4 Funktioner på klient-til-team-tilknytning
docs/coordination/arkiv/trin-10-krav-og-data.md:98:Klient-til-team-tilknytningen er etableret som mekanik i T9. Trin 10 leverer at den faktisk kobler til klienter:
docs/coordination/arkiv/trin-10-krav-og-data.md:102:| Verifikation af klient-reference | Når en klient-til-team-tilknytning oprettes eller ændres, valideres at klienten faktisk findes |
docs/coordination/arkiv/trin-10-krav-og-data.md:111:- Trin 9: organisations-træ, medarbejder-placeringer, permission-fundament, fortrydelses-mekanisme, klient-til-team-tilknytnings-mekanik (uden klient-reference)
docs/coordination/arkiv/trin-10-krav-og-data.md:115:- Klient-til-team-tilknytningen fra T9 får sin reference til klient-stammen
docs/coordination/arkiv/trin-10-krav-og-data.md:116:- Fortrydelses-mekanismen fra T9 dækker også klient-handlinger med gældende dato
docs/coordination/arkiv/trin-10-krav-og-data.md:123:- **Pricing-regler pr. klient** — senere trin
docs/coordination/arkiv/trin-10-krav-og-data.md:124:- **Lønarter der refererer klient** — formel-systemet, trin 13
docs/coordination/arkiv/trin-10-krav-og-data.md:127:- **Klient-anonymiserings-mekanik** — klient anonymiseres ikke
docs/coordination/arkiv/trin-10-krav-og-data.md:131:Migration af klient-data fra 1.0 til 2.0 er udskudt fra trin 10. Trin 10 leverer kun klient-skabelonen som greenfield-fundament. Klient-data-migration tages op senere som separat pakke når behovet konkret melder sig.
docs/coordination/arkiv/trin-10-krav-og-data.md:133:Kilde: mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud".
docs/coordination/arkiv/trin-10-krav-og-data.md:144:- Skal match-feltet vælges pr. data-indgang, eller arves fra klienten?
docs/coordination/arkiv/trin-10-krav-og-data.md:149:Kilde: mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud".
docs/coordination/arkiv/trin-10-krav-og-data.md:157:- Hvordan klient-stammen teknisk implementeres
docs/coordination/arkiv/trin-10-krav-og-data.md:158:- Hvordan klient-felt-definitioner teknisk gemmes og opdateres
docs/coordination/arkiv/trin-10-krav-og-data.md:159:- Hvordan klient-felt-værdier teknisk håndteres
docs/coordination/arkiv/trin-10-krav-og-data.md:160:- Hvordan klient-logo teknisk håndteres (upload, lagring, størrelses-håndtering, normalisering)
docs/coordination/arkiv/trin-10-krav-og-data.md:161:- Hvordan klient-livscyklus (aktiv/inaktiv) teknisk realiseres
docs/coordination/arkiv/trin-10-krav-og-data.md:162:- Hvordan klient-FK til T9's klient-til-team-tilknytning teknisk tilføjes
docs/coordination/arkiv/trin-10-krav-og-data.md:175:- **§1.8 (Klient-skabelon):** match-rolle-konceptet (match-rolle pr. felt + crm_match_id-rolle + enum-liste over match-typer) fjernes fra felt-definitions-mønstret
docs/coordination/arkiv/trin-10-krav-og-data.md:178:De konkrete tekstrettelser er Code's bord at finde og udføre. Begge rettelser har sporbar kilde i mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud".
docs/coordination/arkiv/trin-10-krav-og-data.md:186:| 1   | Klient ejer rå data                                            | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 1    |
docs/coordination/arkiv/trin-10-krav-og-data.md:187:| 2   | Dato afgør sandheden — historiske bindinger er faste           | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 2    |
docs/coordination/arkiv/trin-10-krav-og-data.md:188:| 3   | Klient anonymiseres ikke                                       | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 3    |
docs/coordination/arkiv/trin-10-krav-og-data.md:189:| 4   | Klient-livscyklus = aktiv/inaktiv                              | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 4    |
docs/coordination/arkiv/trin-10-krav-og-data.md:190:| 5   | Klient kan have logo                                           | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 5    |
docs/coordination/arkiv/trin-10-krav-og-data.md:191:| 6   | Rettigheder til klient-handlinger styres i UI                  | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 6    |
docs/coordination/arkiv/trin-10-krav-og-data.md:192:| 7   | Lønarter der refererer klient sættes op via formler i UI       | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 7    |
docs/coordination/arkiv/trin-10-krav-og-data.md:194:| 9   | En klient = maks ét team ad gangen                             | mathias-afgoerelser 2026-05-20 chat-validering ifm. krav-dok-arbejdet |
docs/coordination/arkiv/trin-10-krav-og-data.md:197:| 12  | Klient-data-migration udskydes fra trin 10                     | mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering" punkt 1    |
docs/coordination/arkiv/trin-10-krav-og-data.md:198:| 13  | Match-rolle-konceptet udskydes fra trin 10                     | mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering" punkt 2    |
docs/coordination/arkiv/trin-10-krav-og-data.md:240:- `grep -n "match-rolle\|crm_match_id\|migration: discovery-script for klienter" docs/strategi/stork-2-0-master-plan.md` returnerer ingen forekomster
docs/coordination/mathias-afgoerelser.md:18:### 2026-05-11 — Vision-princip 2: superadmin eneste hardkodede rolle
docs/coordination/mathias-afgoerelser.md:43:### 2026-05-14 — Admin-rolle omdøbt til superadmin
docs/coordination/mathias-afgoerelser.md:165:### 2026-05-16 — Forretningssandhed: org-struktur, teams, klienter, dataejerskab
docs/coordination/mathias-afgoerelser.md:168:  1. **Ejerskabs-kæde:** Copenhagen Sales ejer afdelinger; afdelinger ejer teams; teams ejer relationerne til klienter og medarbejdere.
docs/coordination/mathias-afgoerelser.md:171:  4. **Klient kan aldrig dræbe et team.** Et team eksisterer uafhængigt af om dets klienter stopper.
docs/coordination/mathias-afgoerelser.md:172:  5. **Klient ejer sin egen data.** Salg, calls, og anden klient-data tilhører klienten — ikke teamet. Teamet er den operationelle enhed med ansvar på et givet tidspunkt. Hvis klient skifter team, følger dataen klienten.
docs/coordination/mathias-afgoerelser.md:173:  6. **Synlighed af gamle teams og afdelinger:** Når et team eller en afdeling ikke længere skal bruges, sættes det til ikke-aktivt. Det forhindrer at det vælges når nye medarbejdere eller klienter tilknyttes, men det bliver stående i systemet så gamle rapporter stadig kan slå op i det. Samme mønster som eksisterer for roller fra trin 5.
docs/coordination/mathias-afgoerelser.md:175:  8. **Migration af klient-team-historik fra 1.0:** Ingen fast grænse for hvor langt tilbage data hentes. Code laver et script der finder uoverensstemmelser i 1.0's data og giver Mathias en rapport. Mathias retter i 1.0 eller markerer hvad der skal håndteres ved import. Code laver udtræks- og upload-script; Mathias eksekverer manuelt og afgør konkret omfang ved eksekvering. Hele historikken kan hentes.
docs/coordination/mathias-afgoerelser.md:255:      Mathias og Kasper har superadmin-rollen, placeret på en "Ejere"-afdeling
docs/coordination/mathias-afgoerelser.md:265:      ændringer, medarbejder-placeringer, klient-flytninger.
docs/coordination/mathias-afgoerelser.md:267:  15. **Klient-til-team-import udskydes til trin 10** (kræver klient-skabelon
docs/coordination/mathias-afgoerelser.md:411:### 2026-05-20 — Trin 10 forretnings-ramme: klient som forretnings-fundament
docs/coordination/mathias-afgoerelser.md:413:- **Beslutning:** Forretnings-sandheder om klienten låses som ramme-niveau-afgørelser før trin 10 (klient-skabelon) bygges:
docs/coordination/mathias-afgoerelser.md:414:  1. **Klient ejer rå data.** Salg, calls og andre rå data der kobles på klienten følger klienten ved team-skift. Teamet bevarer historik om at have ejet klienten i en periode, men ejer ikke dataen.
docs/coordination/mathias-afgoerelser.md:416:  2. **Dato afgør sandheden.** Når et salg laves på dato X, og klienten på dato X var knyttet til team Y, så er den binding historisk fast. Senere ændringer i klient-team-tilknytning ændrer ikke gamle data. Annulleringer eller anden feedback der kommer senere på et salg rammer det team der ejede klienten på salgs-tidspunktet, ikke det nuværende team.
docs/coordination/mathias-afgoerelser.md:418:  3. **Klient anonymiseres ikke.** Klient-navn er forretningsdata, ikke persondata. Klient-rækken bliver stående evigt så historik og audit-spor bevares. Felter på klienten kan dog være direkte persondata (fx en kontaktperson) — sådanne felter har egne sletteregler på felt-niveau, ikke klient-niveau.
docs/coordination/mathias-afgoerelser.md:420:  4. **Klient-livscyklus = aktiv/inaktiv.** Ingen mellem-tilstande. Samme mønster som teams og afdelinger (jf. 2026-05-16 punkt 6). Inaktiv klient bliver stående for historik, men kan ikke vælges som ny team-tilknytning.
docs/coordination/mathias-afgoerelser.md:424:  6. **Rettigheder til klient-handlinger styres i UI.** Hvem må oprette/ændre/deaktivere klienter defineres i rettigheds-systemet, ikke fastlagt i kode.
docs/coordination/mathias-afgoerelser.md:426:  7. **Lønarter der refererer klient sættes op via formler i UI.** Formel-systemet (trin 13) leverer mekanikken; konfiguration sker i UI bagefter. Klient-skabelonen selv har ikke lønart-konfiguration på sig.
docs/coordination/mathias-afgoerelser.md:428:- **Begrundelse:** Trin 10's krav-dok skal kunne pege på sporbare Mathias-kilder for hver påstand. Disse syv sandheder var implicit kendt fra tidligere afdæknings-sessioner men ikke registreret samlet for klient-specifikt scope. Registreres her som ramme-niveau-afgørelser så Code/Codex/Claude.ai kan reference dem uden gætning. Migration fra 1.0 er eksplicit udskudt til separat pakke.
docs/coordination/mathias-afgoerelser.md:430:- **Plan-reference:** Denne commit. Trin 10-krav-dok refererer denne entry som primær kilde.
docs/coordination/mathias-afgoerelser.md:441:  4. **Code's recon-først som obligatorisk forudsætning for plan-skrivning.** Code SKAL læse hver tidligere-trins migration-fil planen refererer FØR plan-indhold skrives. "Verificerede afhængigheder"-sektion med konkrete file:linje-referencer er obligatorisk. Antagelser om API'er = KRITISK-fabrikation. Trin 10's plan V1+V2 fejlede præcis fordi Code (mig) fabrikerede T9-API'er i stedet for at læse migration-filerne.
docs/coordination/mathias-afgoerelser.md:449:- **Begrundelse:** Trin 10-forsøget brugte ~2½ time på at producere en plan der ikke holdt. Hoved-årsager: pakke-skala-mismatch (Stor-flow på Mellem-pakke), Code's egen fabrikation af T9-API'er (ikke fanget af eksisterende disciplin), tre Claude.ai-roller skabte ekstra runder uden at fange de rigtige fejl, master-plan + mathias-afgørelser behandlet som låste når kun vision faktisk er låst. Simplificeringen rammer specifikt krav-dok-fasen (hvor over-disciplin skabte bureaukrati) + tilføjer recon-først for Code (hvor under-disciplin tillod fabrikation). Plan-fase bevares fordi den virkede.
docs/coordination/mathias-afgoerelser.md:460:### 2026-05-20 — Trin 10 scope-præcisering: migration og match-rolle ud
docs/coordination/mathias-afgoerelser.md:463:  §1.8's klient-skabelon:
docs/coordination/mathias-afgoerelser.md:464:  1. **Klient-data-migration fjernes fra trin 10.** Trin 10 leverer kun
docs/coordination/mathias-afgoerelser.md:465:     klient-skabelonen som greenfield-fundament. Klient-data-migration
docs/coordination/mathias-afgoerelser.md:468:  2. **Match-rolle-konceptet fjernes fra felt-definitioner.** Trin 10's
docs/coordination/mathias-afgoerelser.md:469:     felt-definitioner har navn, type, påkrævet, persondata-niveau,
docs/coordination/mathias-afgoerelser.md:483:  klienten, og har ikke afklaret fejl-håndtering. At designe
docs/coordination/mathias-afgoerelser.md:489:  match-rolle-konceptet fjernes. Trin 10-krav-dok

codex
Jeg fandt nu et mere konkret rapportproblem: den kendte T9 wrapper-fejl står som DEFER/G-kandidat i rapporten, men den er ikke registreret som G-nummer, og koden viser at de fem wrappers stadig mangler session-var før `pending_change_request`. Jeg validerer lige, om det er isoleret til rapport/tracking eller også modsiger andre rapportfelter.
exec
/bin/bash -lc 'pnpm db:test' in /home/mathias/stork-2.0
 succeeded in 77383ms:

> stork-2.0@0.0.0 db:test /home/mathias/stork-2.0
> node scripts/run-db-tests.mjs

Kører 38 DB-test(s) mod project imtxvrymaqbgcvsarlib

✓ supabase/tests/break_glass/02_gdpr_retroactive_remove_inactive.sql (1539 ms)
✓ supabase/tests/classification/02_retention_value_consistency.sql (1172 ms)
✓ supabase/tests/classification/03_admin_floor_blocks_termination.sql (751 ms)
✓ supabase/tests/negative/d1c_permanent_blocked_outside_allowlist.sql (1779 ms)
✓ supabase/tests/negative/has_permission_unauthenticated.sql (2193 ms)
✓ supabase/tests/negative/p1b_anonymize_requires_active_strategy.sql (843 ms)
✓ supabase/tests/negative/q1_employee_active_config_update_without_permission.sql (26023 ms)
✓ supabase/tests/negative/r7b_can_view_can_edit_matrix.sql (1108 ms)
✓ supabase/tests/negative/r7d_mapping_legacy_status_active_required.sql (692 ms)
✓ supabase/tests/negative/r7d_op_type_legacy_status_active_required.sql (992 ms)
✓ supabase/tests/smoke/01_function_grants_matrix.sql (2363 ms)
✓ supabase/tests/smoke/d1bc_is_permanent_allowed.sql (1198 ms)
✓ supabase/tests/smoke/has_permission_admin_grant.sql (1062 ms)
✓ supabase/tests/smoke/has_permission_can_view_only.sql (814 ms)
✓ supabase/tests/smoke/m1_permission_matrix.sql (1534 ms)
✓ supabase/tests/smoke/p1a_anonymization_strategies.sql (750 ms)
✓ supabase/tests/smoke/q1_employee_active_config.sql (829 ms)
✓ supabase/tests/smoke/r3_commission_snapshots_immutability.sql (4583 ms)
✓ supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql (1598 ms)
✓ supabase/tests/smoke/r7a_break_glass_execute_e2e.sql (997 ms)
✓ supabase/tests/smoke/r7a_replay_anonymization_e2e.sql (2466 ms)
✓ supabase/tests/smoke/r7a_retention_cleanup_cron_e2e.sql (1511 ms)
✓ supabase/tests/smoke/r7d_is_active_status_consistency.sql (912 ms)
✓ supabase/tests/smoke/superadmin_role_exists_after_rename.sql (749 ms)
✓ supabase/tests/smoke/t10_client_active_check.sql (1121 ms)
✓ supabase/tests/smoke/t10_client_field_definitions.sql (1028 ms)
✓ supabase/tests/smoke/t10_client_lifecycle.sql (1311 ms)
✓ supabase/tests/smoke/t10_client_logo.sql (846 ms)
✓ supabase/tests/smoke/t10_client_node_placements_fk.sql (1062 ms)
✓ supabase/tests/smoke/t10_clients_validate_fields.sql (5933 ms)
✓ supabase/tests/smoke/t9_backdated_historical_traversal.sql (2218 ms)
✓ supabase/tests/smoke/t9_grants_and_helpers.sql (1799 ms)
✓ supabase/tests/smoke/t9_org_node_closure.sql (994 ms)
✓ supabase/tests/smoke/t9_org_nodes.sql (893 ms)
✓ supabase/tests/smoke/t9_pending_changes.sql (1067 ms)
✓ supabase/tests/smoke/t9_placements.sql (782 ms)
✓ supabase/tests/smoke/t9_public_wrapper_rpcs.sql (2316 ms)
✓ supabase/tests/smoke/t9_read_gates.sql (1404 ms)

DB-tests: 38 passed, 0 failed

exec
/bin/bash -lc "sed -n '1,220p' supabase/tests/smoke/t9_public_wrapper_rpcs.sql" in /home/mathias/stork-2.0
 succeeded in 0ms:
-- T9 Step 8 smoke: public pending-wrapper RPCs.
--
-- Minimal smoke — wrappers er tynde passthroughs til pending_change_request +
-- apply-handlers (testet i Steps 1-5).
--
-- T0: Uden auth → permission_denied (PR #39 pattern: has_permission FØR validation)
-- T1: Med superadmin auth → invalid node_type → 22023 (validation-path)
-- T2: Med superadmin auth → client_node_place på department → 22023 (team-only pre-check)
-- T3: Med superadmin auth → team_close på department → 22023 (node_type pre-check)
--
-- HERMETIC FIXTURE (G053 refactor 2026-05-19 / Mathias Vej D):
-- Denne test bruger eksisterende superadmin read-only som auth-caller for at
-- nå authorized wrapper-path. Den muterer IKKE seed-employees; alle business-
-- fixtures er transaction-local throwaway rows (org_nodes, names, client uuids).
-- Auth-caller-pattern bruger generisk superadmin-lookup, ikke hardcoded mg@/km@.

begin;

do $test$
declare
  v_caught text;
  v_dept_id uuid;
  v_uuid_suffix text;
  v_superadmin_auth_id uuid;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T9 step 8 smoke hermetic fixture', true);

  v_uuid_suffix := replace(gen_random_uuid()::text, '-', '');

  -- Setup throwaway dept-knude (current_date - 10).
  v_dept_id := gen_random_uuid();
  insert into core_identity.org_nodes (id) values (v_dept_id);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_dept_id, 'TestDept_' || v_uuid_suffix, null, 'department', true, current_date - 10);

  -- ─── T0: Unauthenticated → permission_denied (42501) ──────────────────
  -- Ingen JWT claim sat → current_employee_id() er null → has_permission
  -- returnerer false → wrapper raiser 42501 FØR validation.
  begin
    v_caught := null;
    perform core_identity.org_node_upsert(null, 'unauth_' || v_uuid_suffix, null, 'invalid_type', true, current_date);
  exception when sqlstate '42501' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T0 FAIL: unauthenticated kald skal afvises med 42501 før validation';
  end if;

  -- ─── Authorized superadmin context ────────────────────────────────────
  -- Find generisk superadmin med active auth_user_id. Setup-fail hvis ingen.
  select e.auth_user_id into v_superadmin_auth_id
  from core_identity.employees e
  join core_identity.roles r on r.id = e.role_id
  where r.name = 'superadmin'
    and e.auth_user_id is not null
    and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
  limit 1;

  if v_superadmin_auth_id is null then
    raise exception 'SETUP FAIL: ingen aktiv superadmin med auth_user_id fundet';
  end if;

  perform set_config('request.jwt.claim.sub', v_superadmin_auth_id::text, true);

  -- Verificér at superadmin har de permissions wrapper-T1/T2/T3 kræver.
  if not core_identity.has_permission('org_nodes', 'manage', true) then
    raise exception 'SETUP FAIL: superadmin mangler org_nodes/manage/can_edit (M1-seed?)';
  end if;
  if not core_identity.has_permission('client_placements', 'manage', true) then
    raise exception 'SETUP FAIL: superadmin mangler client_placements/manage/can_edit (M1-seed?)';
  end if;

  -- ─── T1: Med auth → invalid node_type → 22023 ─────────────────────────
  begin
    v_caught := null;
    perform core_identity.org_node_upsert(null, 'authed_' || v_uuid_suffix, null, 'invalid_type', true, current_date);
  exception when sqlstate '22023' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T1 FAIL: org_node_upsert skal afvise invalid node_type med 22023';
  end if;

  -- ─── T2: Med auth → client_node_place på department → 22023 ──────────
  begin
    v_caught := null;
    perform core_identity.client_node_place(gen_random_uuid(), v_dept_id, current_date);
  exception when sqlstate '22023' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T2 FAIL: client_node_place på department skal blokeres pre-check med 22023';
  end if;

  -- ─── T3: Med auth → team_close på department → 22023 ─────────────────
  begin
    v_caught := null;
    perform core_identity.team_close(v_dept_id, current_date);
  exception when sqlstate '22023' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T3 FAIL: team_close på department skal blokeres pre-check med 22023';
  end if;

  raise notice 'T9 Step 8 smoke: ALL TESTS PASSED (T0-T3)';
end;
$test$;

rollback;

exec
/bin/bash -lc "sed -n '220,475p' supabase/migrations/20260518100000_t9_fundament_supplement.sql" in /home/mathias/stork-2.0
 succeeded in 0ms:
    raise exception 'permission_denied: approve % kræver can_edit på %', v_change.change_type, v_page_key
      using errcode = '42501';
  end if;

  if v_change.requested_by = v_approver and not core_identity.is_admin() then
    raise exception 'pending_change_self_approve_forbidden'
      using errcode = '42501', hint = 'requester må ikke selv approve (medmindre admin)';
  end if;

  select undo_period_seconds into v_undo_period
  from core_identity.undo_settings
  where change_type = v_change.change_type;

  if v_undo_period is null then
    v_undo_period := 24 * 3600;
  end if;

  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'pending_change_approve', true);

  update core_identity.pending_changes
  set status = 'approved',
      approved_by = v_approver,
      approved_at = now(),
      undo_deadline = now() + (v_undo_period || ' seconds')::interval,
      updated_at = now()
  where id = p_change_id;
end;
$$;
revoke execute on function core_identity.pending_change_approve(uuid) from public, anon;

-- 2.2 pending_change_undo (Step 1, UPDATE pending_changes)
--
-- Undo af pending change kræver samme can_edit-rettighed på underliggende
-- ressource som approve af samme change. Dispatcher-mapping identisk med
-- pending_change_approve.
create or replace function core_identity.pending_change_undo(
  p_change_id uuid
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_change record;
  v_page_key text;
begin
  select * into v_change
  from core_identity.pending_changes
  where id = p_change_id
  for update;

  if not found then
    raise exception 'pending_change_not_found %', p_change_id
      using errcode = 'P0002';
  end if;

  if v_change.status <> 'approved' then
    raise exception 'pending_change_wrong_status: % (expected approved)', v_change.status
      using errcode = '22023';
  end if;

  if v_change.undo_deadline <= now() then
    raise exception 'undo_deadline_expired'
      using errcode = '22023',
            hint = format('deadline var %s', v_change.undo_deadline);
  end if;

  -- Dispatcher: samme mapping som pending_change_approve.
  case v_change.change_type
    when 'org_node_upsert'     then v_page_key := 'org_nodes';
    when 'org_node_deactivate' then v_page_key := 'org_nodes';
    when 'team_close'          then v_page_key := 'org_nodes';
    when 'employee_place'      then v_page_key := 'employee_placements';
    when 'employee_remove'     then v_page_key := 'employee_placements';
    when 'client_place'        then v_page_key := 'client_placements';
    when 'client_close'        then v_page_key := 'client_placements';
    else
      raise exception 'unknown_change_type for undo-gate: %', v_change.change_type
        using errcode = '42883';
  end case;

  if not core_identity.has_permission(v_page_key, null, true) then
    raise exception 'permission_denied: undo % kræver can_edit på %', v_change.change_type, v_page_key
      using errcode = '42501';
  end if;

  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'pending_change_undo', true);

  update core_identity.pending_changes
  set status = 'undone',
      undone_at = now(),
      updated_at = now()
  where id = p_change_id;
end;
$$;
revoke execute on function core_identity.pending_change_undo(uuid) from public, anon;

-- 2.3 undo_setting_update (Step 1, INSERT/UPDATE undo_settings)
create or replace function core_identity.undo_setting_update(
  p_change_type text,
  p_undo_period_seconds integer
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_updater uuid;
begin
  v_updater := core_identity.current_employee_id();
  if v_updater is null then
    raise exception 'no_authenticated_employee'
      using errcode = '42501';
  end if;

  if not core_identity.has_permission('pending_changes', 'settings', true) then
    raise exception 'permission_denied: pending_changes/settings/can_edit'
      using errcode = '42501';
  end if;

  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'undo_setting_update', true);

  insert into core_identity.undo_settings (change_type, undo_period_seconds, updated_at, updated_by)
  values (p_change_type, p_undo_period_seconds, now(), v_updater)
  on conflict (change_type) do update
  set undo_period_seconds = excluded.undo_period_seconds,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by;
end;
$$;
revoke execute on function core_identity.undo_setting_update(text, integer) from public, anon;

-- 2.4 permission_area_upsert (Step 6, INSERT/UPDATE permission_areas)
create or replace function core_identity.permission_area_upsert(
  p_id uuid,
  p_name text,
  p_is_active boolean default true,
  p_sort_order integer default 0
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied: permissions/manage/can_edit'
      using errcode = '42501';
  end if;

  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_area_upsert', true);

  if p_id is null then
    insert into core_identity.permission_areas (name, is_active, sort_order)
    values (p_name, p_is_active, p_sort_order)
    returning id into v_id;
  else
    insert into core_identity.permission_areas (id, name, is_active, sort_order)
    values (p_id, p_name, p_is_active, p_sort_order)
    on conflict (id) do update
    set name = excluded.name,
        is_active = excluded.is_active,
        sort_order = excluded.sort_order,
        updated_at = now()
    returning id into v_id;
  end if;

  return v_id;
end;
$$;
revoke execute on function core_identity.permission_area_upsert(uuid, text, boolean, integer) from public, anon;

-- 2.5 permission_area_deactivate (Step 6, UPDATE permission_areas)
create or replace function core_identity.permission_area_deactivate(p_area_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_area_deactivate', true);
  update core_identity.permission_areas set is_active = false, updated_at = now() where id = p_area_id;
end; $$;
revoke execute on function core_identity.permission_area_deactivate(uuid) from public, anon;

-- 2.6 permission_page_upsert (Step 6)
create or replace function core_identity.permission_page_upsert(
  p_id uuid, p_area_id uuid, p_name text,
  p_is_active boolean default true, p_sort_order integer default 0
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_id uuid;
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_page_upsert', true);

  if p_id is null then
    insert into core_identity.permission_pages (area_id, name, is_active, sort_order)
    values (p_area_id, p_name, p_is_active, p_sort_order) returning id into v_id;
  else
    insert into core_identity.permission_pages (id, area_id, name, is_active, sort_order)
    values (p_id, p_area_id, p_name, p_is_active, p_sort_order)
    on conflict (id) do update
    set area_id = excluded.area_id, name = excluded.name,
        is_active = excluded.is_active, sort_order = excluded.sort_order,
        updated_at = now()
    returning id into v_id;
  end if;
  return v_id;
end; $$;
revoke execute on function core_identity.permission_page_upsert(uuid, uuid, text, boolean, integer) from public, anon;

-- 2.7 permission_page_deactivate (Step 6)
create or replace function core_identity.permission_page_deactivate(p_page_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_page_deactivate', true);
  update core_identity.permission_pages set is_active = false, updated_at = now() where id = p_page_id;
end; $$;
revoke execute on function core_identity.permission_page_deactivate(uuid) from public, anon;

-- 2.8 permission_tab_upsert (Step 6)
create or replace function core_identity.permission_tab_upsert(
  p_id uuid, p_page_id uuid, p_name text,
  p_is_active boolean default true, p_sort_order integer default 0
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_id uuid;
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_tab_upsert', true);

  if p_id is null then
    insert into core_identity.permission_tabs (page_id, name, is_active, sort_order)
    values (p_page_id, p_name, p_is_active, p_sort_order) returning id into v_id;

exec
/bin/bash -lc 'rg -n "t9_public_wrapper_rpcs|public wrapper|wrapper" docs/coordination/rapport-historik/2026-05-21-trin-10.md docs/strategi/bygge-status.md docs/teknisk/teknisk-gaeld.md docs/coordination/aktiv-plan.md' in /home/mathias/stork-2.0
 succeeded in 0ms:
docs/teknisk/teknisk-gaeld.md:28:- **Beskrivelse:** Mathias-afgørelse 2026-05-21 "superadmin må alt" etablerede bypass-disciplin for forretnings-invariants. Trin 10 (T10.7b) tilføjede bypass på klient-aktiv-check via `is_admin()` (wrapper) + `is_admin_by_employee_id()` (apply). T9 har to lignende forretnings-invariants UDEN bypass: `client_placement_requires_active_team` (`_apply_client_place`, T9-supplement linje 317) + `team_close_already_inactive` (`_apply_team_close`, T9-supplement linje 594). Superadmin kan derfor ikke placere klient på lige-lukket team, eller lukke allerede-inaktivt team — selvom "superadmin må alt".
docs/teknisk/teknisk-gaeld.md:567:- **Løsning (PR #43 d7aa835, T9-test-fixture-hardening):** Hermetisk-fixture-kontrakt etableret. Mutable fixtures skal være transaction-local throwaway data; seed-users må kun bruges read-only som auth-caller for at nå authorized wrapper-paths. Konkret leveret:
docs/teknisk/teknisk-gaeld.md:574:     - `t9_public_wrapper_rpcs.sql`: Vej D — split test i unauthenticated (42501) + authorized superadmin context (22023) via generisk superadmin-lookup + `request.jwt.claim.sub`
docs/strategi/bygge-status.md:190:- `pay_period_lock_attempt(period_id)` — cron-wrapper med fejl-logging til pay_periods.consecutive_lock_failures + last_lock_error
docs/strategi/bygge-status.md:256:- 7 public pending-wrapper RPCs + employee_role_assign/\_remove
docs/coordination/rapport-historik/2026-05-21-trin-10.md:41:| T10.7b aktiv-check (wrapper + apply)                 | leveret | `20260521000008_t10_client_active_check.sql`; t10_client_active_check T2/T3/T5/T6/T7       |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:63:| PLAN-AFVIGELSE | Smoke-test brugte manuel pending-INSERT + ikke cron | 3-4  | LØS-konsensus → wrapper-flow + cron     | runde 4 review-fil                                 |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:75:| T9-public-wrapper-bug (5 RPC'er mangler `t9_write_authorized`) | runde 8  | DEFER       | Ud over scope (T9-fundament); flag som separat pakke; G-kandidat    |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:88:- **Hvad:** Smoke-test t10_client_active_check.sql brugte først manuel pending-INSERT, dernæst delvis wrapper-flow med jwt-context bevaret ved apply.
docs/coordination/rapport-historik/2026-05-21-trin-10.md:97:- **Bygger vi den rigtige løsning, eller en workaround?** Rigtig løsning. Greenfield clients-tabel i `core_identity`; ingen migration fra droppede D5-fundament. Aktiv-check håndhæves konsistent i wrapper + apply via employee-id (cron-kompatibel).
docs/coordination/rapport-historik/2026-05-21-trin-10.md:100:  - Princip 1 (data styres i UI): client_field_definitions er UI-redigerbar konfiguration via wrapper-RPC'er.

exec
/bin/bash -lc "rg -n \"create or replace function core_identity\\.(org_node_upsert|org_node_deactivate|team_close|employee_place|employee_remove_from_node|client_node_place|client_node_close)|t9_write_authorized|pending_change_request\" supabase/migrations/*.sql" in /home/mathias/stork-2.0
 succeeded in 0ms:
supabase/migrations/20260520000000_t9_supplement.sql:847:create or replace function core_identity.employee_placement_read_at(
supabase/migrations/20260520000000_t9_supplement.sql:881:create or replace function core_identity.employee_placement_read(p_employee_id uuid)
supabase/migrations/20260518000000_t9_pending_changes.sql:13:--   pending_change_request(change_type, target_id, payload, effective_from)
supabase/migrations/20260518000000_t9_pending_changes.sql:49:  -- change_type valideres ved RPC-niveau (pending_change_request kræver registered handler).
supabase/migrations/20260518000000_t9_pending_changes.sql:118:-- ─── RPC: pending_change_request (INTERN; kaldes kun af public wrappers) ──
supabase/migrations/20260518000000_t9_pending_changes.sql:119:-- V3 Beslutning 12: pending_change_request er INTERN. Public wrappers (Step 8)
supabase/migrations/20260518000000_t9_pending_changes.sql:121:create or replace function core_identity.pending_change_request(
supabase/migrations/20260518000000_t9_pending_changes.sql:138:      using errcode = '42501', hint = 'pending_change_request kræver authenticated employee';
supabase/migrations/20260518000000_t9_pending_changes.sql:143:  perform set_config('stork.change_reason', 'pending_change_request', true);
supabase/migrations/20260518000000_t9_pending_changes.sql:155:comment on function core_identity.pending_change_request(text, uuid, jsonb, date) is
supabase/migrations/20260518000000_t9_pending_changes.sql:159:revoke execute on function core_identity.pending_change_request(text, uuid, jsonb, date) from public, anon, authenticated;
supabase/migrations/20260518100000_t9_fundament_supplement.sql:16:-- - 6 write-tabeller får INSERT + UPDATE policies med t9_write_authorized-check
supabase/migrations/20260518100000_t9_fundament_supplement.sql:17:-- - 11 write-RPCs får perform set_config('stork.t9_write_authorized', 'true', true)
supabase/migrations/20260518100000_t9_fundament_supplement.sql:44:-- Begge kræver current_setting('stork.t9_write_authorized', true) = 'true'.
supabase/migrations/20260518100000_t9_fundament_supplement.sql:51:  with check (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:55:  using (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:88:  with check (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:92:  using (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:97:  with check (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:101:  using (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:106:  with check (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:110:  using (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:115:  with check (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:119:  using (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:129:  with check (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:133:  using (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:137:  using (current_setting('stork.t9_write_authorized', true) = 'true');
supabase/migrations/20260518100000_t9_fundament_supplement.sql:143:--   2. perform set_config('stork.t9_write_authorized', 'true', true)
supabase/migrations/20260518100000_t9_fundament_supplement.sql:237:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:308:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:344:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:377:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:408:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:425:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:452:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:469:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:496:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:528:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260518100000_t9_fundament_supplement.sql:559:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260521000008_t10_client_active_check.sql:15:-- V9 (Codex runde 8 TEKNISK-BLOKERING): wrapper sætter t9_write_authorized FØR
supabase/migrations/20260521000008_t10_client_active_check.sql:16:-- pending_change_request (T9-fundament-supplement INSERT-policy kræver det).
supabase/migrations/20260521000008_t10_client_active_check.sql:50:create or replace function core_identity.client_node_place(
supabase/migrations/20260521000008_t10_client_active_check.sql:84:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260521000008_t10_client_active_check.sql:85:  v_request_id := core_identity.pending_change_request(
supabase/migrations/20260521000008_t10_client_active_check.sql:102:create or replace function core_identity.client_node_close(
supabase/migrations/20260521000008_t10_client_active_check.sql:119:  perform set_config('stork.t9_write_authorized', 'true', true);
supabase/migrations/20260521000008_t10_client_active_check.sql:120:  v_request_id := core_identity.pending_change_request(
supabase/migrations/20260518000008_t9_read_rpcs.sql:31:create or replace function core_identity.employee_placement_read_at(
supabase/migrations/20260518000008_t9_read_rpcs.sql:43:create or replace function core_identity.employee_placement_read(p_employee_id uuid)
supabase/migrations/20260521000006_t10_seed_permissions.sql:10:-- V4 fix (Codex V3 KRITISK): stork.t9_write_authorized SKAL sættes — T9-supplements
supabase/migrations/20260521000006_t10_seed_permissions.sql:21:select set_config('stork.t9_write_authorized', 'true', false);
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:4:-- - 7 pending-pligtige public RPC'er (tynde wrappers omkring pending_change_request)
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:9:create or replace function core_identity.org_node_upsert(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:29:  v_request_id := core_identity.pending_change_request(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:47:create or replace function core_identity.org_node_deactivate(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:56:  v_request_id := core_identity.pending_change_request(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:66:create or replace function core_identity.team_close(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:84:  v_request_id := core_identity.pending_change_request(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:94:create or replace function core_identity.employee_place(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:104:  v_request_id := core_identity.pending_change_request(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:118:create or replace function core_identity.employee_remove_from_node(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:127:  v_request_id := core_identity.pending_change_request(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:140:create or replace function core_identity.client_node_place(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:159:  v_request_id := core_identity.pending_change_request(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:173:create or replace function core_identity.client_node_close(
supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:182:  v_request_id := core_identity.pending_change_request(

exec
/bin/bash -lc "find supabase/tests -name '*.sql' | sort" in /home/mathias/stork-2.0
 succeeded in 0ms:
supabase/tests/break_glass/02_gdpr_retroactive_remove_inactive.sql
supabase/tests/classification/02_retention_value_consistency.sql
supabase/tests/classification/03_admin_floor_blocks_termination.sql
supabase/tests/negative/d1c_permanent_blocked_outside_allowlist.sql
supabase/tests/negative/has_permission_unauthenticated.sql
supabase/tests/negative/p1b_anonymize_requires_active_strategy.sql
supabase/tests/negative/q1_employee_active_config_update_without_permission.sql
supabase/tests/negative/r7b_can_view_can_edit_matrix.sql
supabase/tests/negative/r7d_mapping_legacy_status_active_required.sql
supabase/tests/negative/r7d_op_type_legacy_status_active_required.sql
supabase/tests/smoke/01_function_grants_matrix.sql
supabase/tests/smoke/d1bc_is_permanent_allowed.sql
supabase/tests/smoke/has_permission_admin_grant.sql
supabase/tests/smoke/has_permission_can_view_only.sql
supabase/tests/smoke/m1_permission_matrix.sql
supabase/tests/smoke/p1a_anonymization_strategies.sql
supabase/tests/smoke/q1_employee_active_config.sql
supabase/tests/smoke/r3_commission_snapshots_immutability.sql
supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql
supabase/tests/smoke/r7a_break_glass_execute_e2e.sql
supabase/tests/smoke/r7a_replay_anonymization_e2e.sql
supabase/tests/smoke/r7a_retention_cleanup_cron_e2e.sql
supabase/tests/smoke/r7d_is_active_status_consistency.sql
supabase/tests/smoke/superadmin_role_exists_after_rename.sql
supabase/tests/smoke/t10_client_active_check.sql
supabase/tests/smoke/t10_client_field_definitions.sql
supabase/tests/smoke/t10_client_lifecycle.sql
supabase/tests/smoke/t10_client_logo.sql
supabase/tests/smoke/t10_client_node_placements_fk.sql
supabase/tests/smoke/t10_clients_validate_fields.sql
supabase/tests/smoke/t9_backdated_historical_traversal.sql
supabase/tests/smoke/t9_grants_and_helpers.sql
supabase/tests/smoke/t9_org_node_closure.sql
supabase/tests/smoke/t9_org_nodes.sql
supabase/tests/smoke/t9_pending_changes.sql
supabase/tests/smoke/t9_placements.sql
supabase/tests/smoke/t9_public_wrapper_rpcs.sql
supabase/tests/smoke/t9_read_gates.sql

exec
/bin/bash -lc "find supabase/tests -name '*.sql' | wc -l" in /home/mathias/stork-2.0
 succeeded in 0ms:
38

exec
/bin/bash -lc "git show --stat --oneline --name-only d044625 | sed -n '1,220p'" in /home/mathias/stork-2.0
 succeeded in 0ms:
d044625 Trin 10 slut-rapport: levér + opdater pointers
docs/coordination/aktiv-plan.md
docs/coordination/rapport-historik/2026-05-21-trin-10.md
docs/coordination/seneste-rapport.md

exec
/bin/bash -lc "git show --stat --oneline --name-only 1831760 | sed -n '1,220p'" in /home/mathias/stork-2.0
 succeeded in 0ms:
1831760 Trin 10: Klient-skabelon (core_identity.clients + felt-definitioner) (#64)
docs/coordination/aktiv-plan.md
docs/coordination/arkiv/trin-10-approved-codex.md
docs/coordination/arkiv/trin-10-krav-og-data.md
docs/coordination/arkiv/trin-10-plan.md
docs/coordination/codex-reviews/2026-05-20-trin-10-runde-1.md
docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md
docs/coordination/codex-reviews/2026-05-20-trin-10-runde-3.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-1.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-10.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-11.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-12.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-13.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-14.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-2.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-3.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-7.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-8.md
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-9.md
docs/strategi/bygge-status.md
docs/strategi/stork-2-0-master-plan.md
docs/teknisk/teknisk-gaeld.md
packages/types/src/database.ts
scripts/fitness.mjs
supabase/migrations/20260521000001_t10_tables.sql
supabase/migrations/20260521000002_t10_is_permanent_allowed_extend.sql
supabase/migrations/20260521000003_t10_classify.sql
supabase/migrations/20260521000004_t10_audit_filter_values.sql
supabase/migrations/20260521000005_t10_clients_validate_fields.sql
supabase/migrations/20260521000006_t10_seed_permissions.sql
supabase/migrations/20260521000007_t10_client_node_placements_fk.sql
supabase/migrations/20260521000008_t10_client_active_check.sql
supabase/migrations/20260521000009_t10_client_rpcs.sql
supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql
supabase/migrations/20260521000011_t10_client_logo_rpcs.sql
supabase/migrations/20260521000012_t10_client_read_rpcs.sql
supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql
supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql
supabase/tests/smoke/m1_permission_matrix.sql
supabase/tests/smoke/t10_client_active_check.sql
supabase/tests/smoke/t10_client_field_definitions.sql
supabase/tests/smoke/t10_client_lifecycle.sql
supabase/tests/smoke/t10_client_logo.sql
supabase/tests/smoke/t10_client_node_placements_fk.sql
supabase/tests/smoke/t10_clients_validate_fields.sql
supabase/tests/smoke/t9_backdated_historical_traversal.sql
supabase/tests/smoke/t9_placements.sql

exec
/bin/bash -lc 'rg -n "28 DB|38 DB|DB-tests|Fitness:|all checks passed" docs/coordination/rapport-historik/2026-05-21-trin-10.md docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md docs/coordination/arkiv/trin-10-approved-codex.md docs/coordination/arkiv/trin-10-plan.md' in /home/mathias/stork-2.0
 succeeded in 0ms:
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3620:// H024: DB-tests der INSERT'er i immutable/lifecycle-DELETE-blokerede tabeller
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3783:Fitness: all checks passed
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3900:  console.log(`DB-tests: ${passed} passed, ${failed} failed`);
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3920:Kører 28 DB-test(s) mod project imtxvrymaqbgcvsarlib
docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md:3951:DB-tests: 28 passed, 0 failed
docs/coordination/rapport-historik/2026-05-21-trin-10.md:17:Fitness: 19/19 grøn
docs/coordination/rapport-historik/2026-05-21-trin-10.md:157:**Verifikation:** fitness 19/19 grøn på commit `1831760`. CI grøn (28 DB-tests passed).

exec
/bin/bash -lc "sed -n '1,160p' scripts/run-db-tests.mjs" in /home/mathias/stork-2.0
 succeeded in 0ms:
#!/usr/bin/env node
// DB-level test runner. Itererer supabase/tests/**/*.sql, sender hver til
// Supabase Management API som én query, fail-fast ved første test-fejl.
//
// Konvention: hver test er en SQL-fil med DO-block der RAISE EXCEPTION ved
// assertion-failure. Filer med side-effekter (employees/audit) bruger
// BEGIN/ROLLBACK så prod-DB ikke forurenes.

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TESTS_DIR = "supabase/tests";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "imtxvrymaqbgcvsarlib";

function parseArgs() {
  const args = process.argv.slice(2);
  const dirArg = args.indexOf("--dir");
  return {
    dir: dirArg >= 0 ? args[dirArg + 1] : null,
  };
}

async function walk(dir) {
  const out = [];
  async function recurse(d) {
    const entries = await readdir(d, { withFileTypes: true });
    for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const p = join(d, e.name);
      if (e.isDirectory()) await recurse(p);
      else if (e.name.endsWith(".sql")) out.push(p);
    }
  }
  await recurse(dir);
  return out;
}

async function runQuery(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const body = await res.text();
    return { ok: false, status: res.status, body };
  }
  const body = await res.json();
  return { ok: true, body };
}

async function main() {
  if (!TOKEN) {
    console.error("SUPABASE_ACCESS_TOKEN env-var er påkrævet for test:db");
    process.exit(2);
  }

  const { dir } = parseArgs();
  const targetDir = dir ? join(TESTS_DIR, dir) : TESTS_DIR;

  try {
    await stat(targetDir);
  } catch {
    console.error(`Test-mappe findes ikke: ${targetDir}`);
    process.exit(2);
  }

  const files = await walk(targetDir);
  if (files.length === 0) {
    console.log(`Ingen test-filer fundet i ${targetDir}`);
    return;
  }

  console.log(`Kører ${files.length} DB-test(s) mod project ${PROJECT_REF}`);
  console.log("");

  let passed = 0;
  let failed = 0;

  for (const file of files) {
    const rel = relative(ROOT, file);
    const sql = await readFile(file, "utf8");
    const start = Date.now();
    const result = await runQuery(sql);
    const elapsed = Date.now() - start;

    if (result.ok) {
      console.log(`✓ ${rel} (${elapsed} ms)`);
      passed++;
    } else {
      console.log(`✗ ${rel} (${elapsed} ms)`);
      console.log(`  status: ${result.status || "n/a"}`);
      let errMsg;
      try {
        const parsed = JSON.parse(result.body);
        errMsg = parsed.message || result.body;
      } catch {
        errMsg = result.body;
      }
      console.log(`  error: ${errMsg.split("\n").slice(0, 5).join("\n         ")}`);
      console.log(`::error file=${rel}::DB-test fejlet: ${errMsg.split("\n")[0]}`);
      failed++;
      // Fail-fast for kortest CI-feedback
      break;
    }
  }

  console.log("");
  console.log(`DB-tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test-runner fatal:", err);
  process.exit(2);
});

exec
/bin/bash -lc "git show 1831760:scripts/run-db-tests.mjs | sed -n '1,140p'" in /home/mathias/stork-2.0
 succeeded in 0ms:
#!/usr/bin/env node
// DB-level test runner. Itererer supabase/tests/**/*.sql, sender hver til
// Supabase Management API som én query, fail-fast ved første test-fejl.
//
// Konvention: hver test er en SQL-fil med DO-block der RAISE EXCEPTION ved
// assertion-failure. Filer med side-effekter (employees/audit) bruger
// BEGIN/ROLLBACK så prod-DB ikke forurenes.

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TESTS_DIR = "supabase/tests";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "imtxvrymaqbgcvsarlib";

function parseArgs() {
  const args = process.argv.slice(2);
  const dirArg = args.indexOf("--dir");
  return {
    dir: dirArg >= 0 ? args[dirArg + 1] : null,
  };
}

async function walk(dir) {
  const out = [];
  async function recurse(d) {
    const entries = await readdir(d, { withFileTypes: true });
    for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const p = join(d, e.name);
      if (e.isDirectory()) await recurse(p);
      else if (e.name.endsWith(".sql")) out.push(p);
    }
  }
  await recurse(dir);
  return out;
}

async function runQuery(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const body = await res.text();
    return { ok: false, status: res.status, body };
  }
  const body = await res.json();
  return { ok: true, body };
}

async function main() {
  if (!TOKEN) {
    console.error("SUPABASE_ACCESS_TOKEN env-var er påkrævet for test:db");
    process.exit(2);
  }

  const { dir } = parseArgs();
  const targetDir = dir ? join(TESTS_DIR, dir) : TESTS_DIR;

  try {
    await stat(targetDir);
  } catch {
    console.error(`Test-mappe findes ikke: ${targetDir}`);
    process.exit(2);
  }

  const files = await walk(targetDir);
  if (files.length === 0) {
    console.log(`Ingen test-filer fundet i ${targetDir}`);
    return;
  }

  console.log(`Kører ${files.length} DB-test(s) mod project ${PROJECT_REF}`);
  console.log("");

  let passed = 0;
  let failed = 0;

  for (const file of files) {
    const rel = relative(ROOT, file);
    const sql = await readFile(file, "utf8");
    const start = Date.now();
    const result = await runQuery(sql);
    const elapsed = Date.now() - start;

    if (result.ok) {
      console.log(`✓ ${rel} (${elapsed} ms)`);
      passed++;
    } else {
      console.log(`✗ ${rel} (${elapsed} ms)`);
      console.log(`  status: ${result.status || "n/a"}`);
      let errMsg;
      try {
        const parsed = JSON.parse(result.body);
        errMsg = parsed.message || result.body;
      } catch {
        errMsg = result.body;
      }
      console.log(`  error: ${errMsg.split("\n").slice(0, 5).join("\n         ")}`);
      console.log(`::error file=${rel}::DB-test fejlet: ${errMsg.split("\n")[0]}`);
      failed++;
      // Fail-fast for kortest CI-feedback
      break;
    }
  }

  console.log("");
  console.log(`DB-tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test-runner fatal:", err);
  process.exit(2);
});

exec
/bin/bash -lc 'rg -n "db:test|run-db-tests|supabase/tests|DB-tests|CI" .github scripts package.json' in /home/mathias/stork-2.0
 succeeded in 0ms:
package.json:26:    "db:test": "node scripts/run-db-tests.mjs",
scripts/fitness.mjs:2:// Fitness-functions: arkitektoniske invarianter der køres i CI på hver PR.
scripts/fitness.mjs:86:// H024: Tabeller hvor DB-tests der INSERT'er skal bruge BEGIN/ROLLBACK wrap.
scripts/fitness.mjs:181:const GRANDFATHERED_NO_SETCONFIG_DISCIPLINE = new Set([
scripts/fitness.mjs:403:    if (GRANDFATHERED_NO_SETCONFIG_DISCIPLINE.has(file)) continue;
scripts/fitness.mjs:898:// H024: DB-tests der INSERT'er i immutable/lifecycle-DELETE-blokerede tabeller
scripts/fitness.mjs:907:  const testsDir = "supabase/tests";
scripts/fitness.mjs:959:  const testsDir = "supabase/tests";
scripts/fitness.mjs:982:  const dir = "supabase/tests/smoke";
scripts/fitness.mjs:1016:  // Hard-fail hvis SUPABASE_ACCESS_TOKEN mangler i CI; skip lokalt for udvikler-flow.
scripts/fitness.mjs:1117:  const dir = "supabase/tests/smoke";
scripts/run-db-tests.mjs:2:// DB-level test runner. Itererer supabase/tests/**/*.sql, sender hver til
scripts/run-db-tests.mjs:13:const TESTS_DIR = "supabase/tests";
scripts/run-db-tests.mjs:107:      // Fail-fast for kortest CI-feedback
scripts/run-db-tests.mjs:113:  console.log(`DB-tests: ${passed} passed, ${failed} failed`);
.github/BRANCH_PROTECTION.md:17:| Required status checks                                           | `Lint, typecheck, test, build` (CI workflow job-navn) |
scripts/data-grundlag.sh:88:  PROMPT="Kort teknisk status for repo lige nu for pakke '$PAKKE_NAME': hvilken state er stork-2.0 i (seneste merged pakke, åbne PR'er, CI-state). Max 100 ord. Brug 'git log --oneline -5' og 'gh pr list --state open --limit 3'."
.github/workflows/ci.yml:1:name: CI
.github/workflows/ci.yml:77:        run: pnpm db:test
scripts/README.md:3:Disciplin-mekanismer der køres lokalt og i CI.

exec
/bin/bash -lc 'git diff --name-status 1831760..HEAD -- supabase/tests docs/coordination/rapport-historik/2026-05-21-trin-10.md docs/coordination/aktiv-plan.md docs/coordination/seneste-rapport.md' in /home/mathias/stork-2.0
 succeeded in 0ms:
M	docs/coordination/aktiv-plan.md
A	docs/coordination/rapport-historik/2026-05-21-trin-10.md
M	docs/coordination/seneste-rapport.md

exec
/bin/bash -lc "git ls-tree -r --name-only 1831760 supabase/tests | rg '\\.sql"'$'"' | wc -l" in /home/mathias/stork-2.0
 succeeded in 0ms:
38

exec
/bin/bash -lc "git ls-tree -r --name-only 1831760 supabase/tests | rg '\\.sql"'$'"' | sort" in /home/mathias/stork-2.0
 succeeded in 0ms:
supabase/tests/break_glass/02_gdpr_retroactive_remove_inactive.sql
supabase/tests/classification/02_retention_value_consistency.sql
supabase/tests/classification/03_admin_floor_blocks_termination.sql
supabase/tests/negative/d1c_permanent_blocked_outside_allowlist.sql
supabase/tests/negative/has_permission_unauthenticated.sql
supabase/tests/negative/p1b_anonymize_requires_active_strategy.sql
supabase/tests/negative/q1_employee_active_config_update_without_permission.sql
supabase/tests/negative/r7b_can_view_can_edit_matrix.sql
supabase/tests/negative/r7d_mapping_legacy_status_active_required.sql
supabase/tests/negative/r7d_op_type_legacy_status_active_required.sql
supabase/tests/smoke/01_function_grants_matrix.sql
supabase/tests/smoke/d1bc_is_permanent_allowed.sql
supabase/tests/smoke/has_permission_admin_grant.sql
supabase/tests/smoke/has_permission_can_view_only.sql
supabase/tests/smoke/m1_permission_matrix.sql
supabase/tests/smoke/p1a_anonymization_strategies.sql
supabase/tests/smoke/q1_employee_active_config.sql
supabase/tests/smoke/r3_commission_snapshots_immutability.sql
supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql
supabase/tests/smoke/r7a_break_glass_execute_e2e.sql
supabase/tests/smoke/r7a_replay_anonymization_e2e.sql
supabase/tests/smoke/r7a_retention_cleanup_cron_e2e.sql
supabase/tests/smoke/r7d_is_active_status_consistency.sql
supabase/tests/smoke/superadmin_role_exists_after_rename.sql
supabase/tests/smoke/t10_client_active_check.sql
supabase/tests/smoke/t10_client_field_definitions.sql
supabase/tests/smoke/t10_client_lifecycle.sql
supabase/tests/smoke/t10_client_logo.sql
supabase/tests/smoke/t10_client_node_placements_fk.sql
supabase/tests/smoke/t10_clients_validate_fields.sql
supabase/tests/smoke/t9_backdated_historical_traversal.sql
supabase/tests/smoke/t9_grants_and_helpers.sql
supabase/tests/smoke/t9_org_node_closure.sql
supabase/tests/smoke/t9_org_nodes.sql
supabase/tests/smoke/t9_pending_changes.sql
supabase/tests/smoke/t9_placements.sql
supabase/tests/smoke/t9_public_wrapper_rpcs.sql
supabase/tests/smoke/t9_read_gates.sql

exec
/bin/bash -lc 'git status --short' in /home/mathias/stork-2.0
 succeeded in 0ms:
exec
/bin/bash -lc "sed -n '3890,3960p' docs/coordination/codex-reviews/2026-05-21-trin-10-runde-5.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
      }
      console.log(`  error: ${errMsg.split("\n").slice(0, 5).join("\n         ")}`);
      console.log(`::error file=${rel}::DB-test fejlet: ${errMsg.split("\n")[0]}`);
      failed++;
      // Fail-fast for kortest CI-feedback
      break;
    }
  }

  console.log("");
  console.log(`DB-tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test-runner fatal:", err);
  process.exit(2);
});

codex
Migration-gate og fitness er grønne. Jeg kører smoke-DB-testene nu for at få end-to-end-dækning af RPC'er, RLS og apply-dispatch, hvis miljøet har token sat.
exec
/bin/bash -lc 'pnpm db:test -- --dir smoke' in /home/mathias/stork-2.0
 succeeded in 51969ms:

> stork-2.0@0.0.0 db:test /home/mathias/stork-2.0
> node scripts/run-db-tests.mjs -- --dir smoke

Kører 28 DB-test(s) mod project imtxvrymaqbgcvsarlib

✓ supabase/tests/smoke/01_function_grants_matrix.sql (7884 ms)
✓ supabase/tests/smoke/d1bc_is_permanent_allowed.sql (4866 ms)
✓ supabase/tests/smoke/has_permission_admin_grant.sql (277 ms)
✓ supabase/tests/smoke/has_permission_can_view_only.sql (279 ms)
✓ supabase/tests/smoke/m1_permission_matrix.sql (1210 ms)
✓ supabase/tests/smoke/p1a_anonymization_strategies.sql (1073 ms)
✓ supabase/tests/smoke/q1_employee_active_config.sql (2939 ms)
✓ supabase/tests/smoke/r3_commission_snapshots_immutability.sql (1399 ms)
✓ supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql (629 ms)
✓ supabase/tests/smoke/r7a_break_glass_execute_e2e.sql (3035 ms)
✓ supabase/tests/smoke/r7a_replay_anonymization_e2e.sql (1573 ms)
✓ supabase/tests/smoke/r7a_retention_cleanup_cron_e2e.sql (279 ms)
✓ supabase/tests/smoke/r7d_is_active_status_consistency.sql (268 ms)
✓ supabase/tests/smoke/superadmin_role_exists_after_rename.sql (253 ms)
✓ supabase/tests/smoke/t10_client_active_check.sql (569 ms)
✓ supabase/tests/smoke/t10_client_field_definitions.sql (213 ms)
✓ supabase/tests/smoke/t10_client_lifecycle.sql (1035 ms)
✓ supabase/tests/smoke/t10_client_logo.sql (321 ms)
✓ supabase/tests/smoke/t10_client_node_placements_fk.sql (273 ms)
✓ supabase/tests/smoke/t10_clients_validate_fields.sql (4920 ms)
✓ supabase/tests/smoke/t9_backdated_historical_traversal.sql (3866 ms)
✓ supabase/tests/smoke/t9_grants_and_helpers.sql (485 ms)
✓ supabase/tests/smoke/t9_org_node_closure.sql (2985 ms)
✓ supabase/tests/smoke/t9_org_nodes.sql (180 ms)
✓ supabase/tests/smoke/t9_pending_changes.sql (3354 ms)
✓ supabase/tests/smoke/t9_placements.sql (2814 ms)
✓ supabase/tests/smoke/t9_public_wrapper_rpcs.sql (391 ms)
✓ supabase/tests/smoke/t9_read_gates.sql (6844 ms)

DB-tests: 28 passed, 0 failed

exec
/bin/bash -lc "sed -n '180,230p' supabase/migrations/20260518000004_t9_client_node_placements.sql" in /home/mathias/stork-2.0
 succeeded in 0ms:
            hint = format('undo_deadline=%s, now=%s', v_change.undo_deadline, now());
  end if;

  if v_change.effective_from > current_date then
    raise exception 'not_yet_due'

codex
MELLEM: Slutrapportens G-håndtering er ufuldstændig.

Fund: Rapporten nævner `T9-public-wrapper-bug (5 RPC'er mangler t9_write_authorized)` som `DEFER` / `G-kandidat`, men `G-numre tilføjet`, `Teknisk gæld akkumuleret` og `Forudsætninger inden næste start` nævner kun G057 + G058. Fejlen er teknisk konkret og stadig relevant for T9-scope. LØS: registrér som selvstændigt G-nummer eller fjern/omklassificér rapportens G-kandidat-tekst med begrundelse.

LAV: Plan-afvigelses-count er inkonsistent.

Fund: Lag-boundary siger `Plan-afvigelser: 1`, men rapportens egen `Plan-afvigelser`-sektion lister 2: legacy-seed workaround og smoke-test wrapper/cron-afvigelsen. LØS: ret count til 2 eller marker smoke-test-afvigelsen som ikke tællende.

LAV: Verifikations-tal er upræcist.

Fund: Rapporten siger `CI grøn (28 DB-tests passed)`, men 28 er smoke-only (`pnpm db:test -- --dir smoke` i runde 5). Aktuel fuld `pnpm db:test` kører 38 og passerer. LØS: skriv `28 smoke DB-tests` eller `38 DB-tests` afhængigt af hvad der menes.

Verificeret lokalt: `pnpm fitness` grøn; fuld `pnpm db:test` grøn med 38 passed.
tokens used
175,387
MELLEM: Slutrapportens G-håndtering er ufuldstændig.

Fund: Rapporten nævner `T9-public-wrapper-bug (5 RPC'er mangler t9_write_authorized)` som `DEFER` / `G-kandidat`, men `G-numre tilføjet`, `Teknisk gæld akkumuleret` og `Forudsætninger inden næste start` nævner kun G057 + G058. Fejlen er teknisk konkret og stadig relevant for T9-scope. LØS: registrér som selvstændigt G-nummer eller fjern/omklassificér rapportens G-kandidat-tekst med begrundelse.

LAV: Plan-afvigelses-count er inkonsistent.

Fund: Lag-boundary siger `Plan-afvigelser: 1`, men rapportens egen `Plan-afvigelser`-sektion lister 2: legacy-seed workaround og smoke-test wrapper/cron-afvigelsen. LØS: ret count til 2 eller marker smoke-test-afvigelsen som ikke tællende.

LAV: Verifikations-tal er upræcist.

Fund: Rapporten siger `CI grøn (28 DB-tests passed)`, men 28 er smoke-only (`pnpm db:test -- --dir smoke` i runde 5). Aktuel fuld `pnpm db:test` kører 38 og passerer. LØS: skriv `28 smoke DB-tests` eller `38 DB-tests` afhængigt af hvad der menes.

Verificeret lokalt: `pnpm fitness` grøn; fuld `pnpm db:test` grøn med 38 passed.
