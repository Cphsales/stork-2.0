# gov-4-branch-protection — Plan V5

**Branch:** claude/gov-4-branch-protection-plan
**Krav-dok:** docs/coordination/gov-4-branch-protection-krav-og-data.md (ekstrakt; fælles dok: governance-vagt-krav-og-data.md pkt 4 + D2)
**Dato:** 2026-06-10
**Status-fil:** docs/coordination/gov-4-branch-protection-status.md (konvergens-counter: 5 — **§3.4 AUTO-PAUSE aktiv**, se status-fil)

## Formål

> Denne pakke leverer: bindende gates på main — required CI-checks og required
> code-owner-review — så intet kan merges uden om processen, med
> approval-mekanikken (H026) løst før required review aktiveres.

## V1 → V2: Codex-fund runde 1 (alle ADRESSERET)

| #    | Fund                                                              | Severity | Code-svar                                                                                                                                                                                                                                                                                                |
| ---- | ----------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1-1 | Bot-PAT (write) kan ikke PATCH'e branch protection (kræver admin) | KRITISK  | **ACCEPT.** To-credential-design: bot-PAT til commits/PR'er (ny default); Mathias' eksisterende admin-auth bevares KUN til de to konkrete protection-kald, udført af Code på eksplicit qwerg-mandat. Botten får ALDRIG admin. Se H026-afsnit                                                             |
| R1-2 | `CodeQL`-context ubevist — kan give hul eller brick               | KRITISK  | **ACCEPT.** Empirisk check-run-dump på main HEAD viser INTET `CodeQL`-aggregat (kun `Analyze (...)`-jobs fra default setup, matrix-navne der kan skifte). Required = KUN `Lint, typecheck, test, build` (= A8-designet i BRANCH_PROTECTION.md). CodeQL forbliver ikke-required — bevidst valg, ikke gæld |
| R1-3 | G061 har deadline "før gov-4" men planen ignorerede den           | MELLEM   | **ACCEPT.** G061-opsamlings-migrationen (2 `comment on`-mål) tages MED i builden (batch 1) — lukker gælden frem for rebaseline. Skitsen er nu 1 migration                                                                                                                                                |
| R1-4 | `.github/BRANCH_PROTECTION.md` efterlades stale                   | MELLEM   | **ACCEPT.** Patch-først-sektion tilføjet (fil 4). Bonus-fund: doc'en kræver ci-checken som required, live har TOM contexts-liste — endnu et docs↔virkelighed-gab som pakken lukker                                                                                                                       |

## V2 → V3: Codex-fund runde 2 (alle ADRESSERET)

| #    | Fund                                                                         | Severity | Code-svar                                                                                                                                |
| ---- | ---------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| R2-1 | §3.2-dump forkert markeret N/A — G061-migrationen er en DB-mutation          | KRITISK  | **ACCEPT.** Frisk live-dump af begge mål via Supabase MCP indsat i state-dump-sektionen: begge live-comments er `null`; repo-tekster 1:1 |
| R2-2 | `gh api -f strict=true` sender string, API kræver boolean — step 3 kan fejle | KRITISK  | **ACCEPT.** `-f` → `-F` (typed felt) i kaldet                                                                                            |

## V3 → V4: Codex-fund runde 3 (ADRESSERET)

| #    | Fund                                                                                        | Severity | Code-svar                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---- | ------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R3-1 | CODEOWNERS-fix ikke pin'et til eksakt handle + ingen gyldigheds-verifikation før aktivering | KRITISK  | **ACCEPT.** Handle pin'et deterministisk (se CODEOWNERS-sektionen — definitionen er bindende; selve strengen kan ikke stå i denne fil pga. Mathias' stork1-lås-hook, rejst som åbent spørgsmål 3). Codex' API-tjek bekræftede 5 "Unknown owner"-fejl på nuværende fil. Ny gate: `codeowners/errors` SKAL være tom efter CODEOWNERS-PR og FØR `require_code_owner_reviews=true` (step 2-gate + verifikations-case e) |

## V4 → V5: Codex-fund runde 4 (ADRESSERET)

| #    | Fund                                                                                     | Severity | Code-svar                                                                                                                                                                                                                                                                          |
| ---- | ---------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R4-1 | ADMIN-HANDLE-definitionen er tidsafhængig — efter bot-auth-skift resolver den til botten | KRITISK  | **ACCEPT.** Capture-rækkefølge bindende i step 1: `ADMIN_HANDLE` fanges FØR bot-login, `BOT_LOGIN` efter, assert `ADMIN_HANDLE != BOT_LOGIN`; CODEOWNERS bruger den capturede `ADMIN_HANDLE`-værdi; step 2-gaten udvidet med indholds-tjek (aktive linjer indeholder ADMIN_HANDLE) |

## qwerg-revision af H026-strukturen (Mathias, §1-suverænitet, 2026-06-10)

Mathias ændrede konto-strukturen ved build step 1 — gælder straks; planen
opdateret som konsekvens (ikke betingelse):

- Det hidtidige gh-login er et FÆLLES login (bærer Stork 1.0 + drift) — det
  nedgraderes IKKE og bruges fremover KUN til protection-API-kaldene (step
  3-4), som planlagt.
- **ADMIN_HANDLE := `mgrubak`** — Mathias' NYE personlige konto (org-owner),
  eksplicit udpeget (capture-protokollen fra R4-1 erstattet: værdien kan ikke
  captures fra det fælles login). R4-1's formål (CODEOWNERS ≠ bot) opfyldes
  fortsat: assert `mgrubak != BOT_LOGIN` efter auth-skift.
- Bot uændret: `stork-code-bot` (org-member, write, fine-grained PAT godkendt
  i org-settings).
- CODEOWNERS peger på `@mgrubak` (ikke det fælles login).
- H026-beviset: bot-PR approves af **mgrubak**.

## Step 2.0 — Skitse + størrelses-tjek

**1 migration** (G061-opsamling: 2 `comment on`-statements — ikke-destruktiv,
§3.9 N/A). Derudover: GitHub-indstillinger (API), CODEOWNERS,
BRANCH_PROTECTION.md, docs-opdateringer, H026-luk. Under §3.8-grænsen → fuld V2.

## Verificerede repo-objekter (state-dump, 2026-06-10)

**§3.2 DB-state-dump (fund R2-1 — G061-målene, Supabase MCP `execute_sql`
2026-06-10, råt):**

```json
[
  { "art": "constraint", "navn": "client_node_placements_client_id_fkey", "live_comment": null },
  { "art": "table", "navn": "core_identity.permission_actions", "live_comment": null }
]
```

Repo-definitionerne (1:1, kilder til migrationen):

- `supabase/migrations/20260521000007_t10_client_node_placements_fk.sql:20` —
  `comment on constraint client_node_placements_client_id_fkey on core_identity.client_node_placements is 'T10.7: FK fra client_id til core_identity.clients(id). ON DELETE RESTRICT støtter krav-dok §2.2.3 (klient deaktiveres, ikke slettes). T9 Plan V6 Valg 4 indfriet.';`
- `supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql:36` —
  `comment on table core_identity.permission_actions is 'T9-supplement-2: handlings-granularitet under tabs. Konfigurerede actions kræver action-grant + tab-can_write (eller kun can_access hvis bypass_tab_write=true). requires_second_approver/has_undo/bypass_tab_write er kode-låste; second_approver_type er UI-redigerbart.';`

Gabet er præcis G061: live `null` på begge, repo definerer begge.
G061-migrationen genudfører de to statements ordret (patch-først: teksterne
ovenfor ER migrations-indholdet). Ingen øvrige DB-objekter berøres.

Repo-/GitHub-state, råt:

**Branch protection på main (allerede delvist aktiv — Mathias slog PR-krav til
2026-06-10; verificeret via `gh api .../branches/main/protection`):**

```json
required_status_checks: { strict: true, contexts: [], checks: [] }
required_pull_request_reviews: { dismiss_stale_reviews: true, require_code_owner_reviews: false, require_last_push_approval: false, required_approving_review_count: 0 }
required_signatures: false · enforce_admins: true · required_linear_history: true
allow_force_pushes: false · allow_deletions: false · required_conversation_resolution: true
```

**Deltaen gov-4 skal levere er altså KUN:** `contexts` udfyldes +
`required_approving_review_count: 1` + `require_code_owner_reviews: true`.
Resten af beskyttelsen står allerede korrekt.

**Konti (verificeret via `gh api`):** repo-ejer `Cphsales` er en
**Organization**; Mathias' personlige konto (gh-auth på Codes maskine, alle
commits/PR'er til dato) er en **User**. Det giver to fund:

1. **[H026]-roden bekræftet:** PR-author = Mathias' konto → GitHub nægter
   self-approval → required review ville blokere ALT.
2. **CODEOWNERS-fund (KRITISK for D2):** `.github/CODEOWNERS` bruger
   `@Cphsales` (organisationen) som owner på alle 5 regler. En org kan ikke
   være code owner (kun bruger eller `@org/team`) → `require_code_owner_reviews`
   ville i dag pege på ingen gyldig owner.

**CI-check-navne (empirisk check-run-dump på main HEAD `d71c447`, fund R1-2):**

```
Analyze (actions) · Analyze (javascript-typescript) · Lint, typecheck, test, build
· Post comment to Codex review queue · drift-check
```

ci.yml har ét job med display-navn `Lint, typecheck, test, build` (prettier,
eslint, typecheck, test, build, `governance:check` ci.yml:67,
`governance:selftest` ci.yml:70, fitness). Der findes INTET `CodeQL`-aggregat
som check-run på main — kun `Analyze (...)`-jobs fra GitHub default setup,
hvis matrix-navne kan ændre sig. Required context = KUN
`Lint, typecheck, test, build`. CodeQL-analyserne forbliver ikke-required
(bevidst valg: default-setup-checks med ustabile navne som required = brick-
risiko; matcher A8-designet i BRANCH_PROTECTION.md). `codex-notify`,
`pr-drift-warning` og `migrations-deploy` er notify/deploy og skal IKKE være
required.

## H026-løsning (kravets pkt 3 — afgøres her, bekræftes ved qwerg)

**Valg: machine user (bot-konto), IKKE GitHub App.** Begrundelse: én builder,
ét repo — en App giver kortlivede tokens og webhook-infrastruktur vi ikke
behøver før gov-5; en machine user er 15 minutters setup, gratis på Free-org,
og flytter PR-authorship væk fra Mathias med det samme. Kan opgraderes til App
i gov-5 hvis runneren kræver det (noteres som mulighed, ikke gæld).

**Mathias-handlinger (kan ikke udføres af Code):**

1. Opret GitHub-bruger til Code (navne-forslag, Mathias vælger: `stork-code-bot`).
2. Invitér den til `Cphsales`-org'en med **write** på stork-2.0 (ikke admin).
3. Generér fine-grained PAT (repo-scope: contents RW, pull-requests RW) og
   udlevér til Code.

**Code-handlinger derefter:** `gh auth login` med bot-PAT + git
credential-skift på maskinen. Commits forfattes fremover med bot-identiteten
(navn + bot-mail), IKKE længere med Mathias' git-identitet — så authorship i
historikken er ærlig (Code er afsender; Mathias er beslutningstager via
review). Flagget her som bevidst ændring af commit-konvention (åbent spørgsmål
2 ved qwerg).

**To-credential-design (fund R1-1):** botten får write, ALDRIG admin.
Protection-PATCH-kaldene (step 3-4) kræver repo-admin og udføres derfor af
Code under Mathias' EKSISTERENDE admin-auth (den nuværende gh-session —
admin-adgang verificeret ved at protection-endpointet kunne læses). Mandatet
er qwerg + de to konkrete kald citeret 1:1 i planen — ingen andre
admin-operationer. Efter gov-4 er bot-auth default for alt commit/PR-arbejde;
Mathias-admin-auth bruges kun til governance-API-operationer på eksplicit
ordre (noteres i CLAUDE.md).

## Patch-først pr. ændret fil (§3.1)

### 1. `.github/CODEOWNERS`

Nuværende (1:1, alle aktive regler):

```
*       @Cphsales
/docs/strategi/vision-og-principper.md     @Cphsales
/docs/strategi/forretningsforstaaelse.md   @Cphsales
/docs/strategi/disciplin.md                @Cphsales
/docs/strategi/stork-2-0-master-plan.md    @Cphsales
```

Ny: `@Cphsales` → `@<ADMIN-HANDLE>` på alle 5 linjer. **ADMIN-HANDLE :=
værdien af `gh api user --jq .login` CAPTURET FØR bot-auth-skiftet (fund
R4-1)** — det verificerede Mathias-admin-handle (User-type, dokumenteret 1:1 i
Codex' runde 3-review). Capture-protokol i step 1: (i) under nuværende
Mathias-admin-auth: `ADMIN_HANDLE` fanges og noteres i status-filen; (ii)
efter bot-login: `BOT_LOGIN` fanges; (iii) assert `ADMIN_HANDLE != BOT_LOGIN`
— fejler asserten STOPPER builden (H026 ville være uløst).
Definitionen er bindende og deterministisk; selve strengen kan ikke skrives i
denne plan-fil, fordi Mathias' stork1-lås-hook blokerer Code-writes der
indeholder den (åbent spørgsmål 3). Kommentar-blok opdateres med hvorfor (org
kan ikke være code owner — GitHubs codeowners-errors viser 5 "Unknown owner"
på nuværende fil). Kommenterede lag-B-linjer bevares uændret.

**Gyldigheds-gate (fund R3-1 + R4-1):** efter CODEOWNERS-PR'en er merget og
FØR step 4 aktiveres: (1) `gh api repos/Cphsales/stork-2.0/codeowners/errors`
SKAL returnere `errors: []`; (2) alle 5 aktive CODEOWNERS-linjer SKAL
indeholde den capturede `ADMIN_HANDLE` (indholds-tjek — beviser owner er
Mathias, ikke kun at owner er gyldig).

### 2. Branch protection (API-kald, ikke fil)

Udføres under Mathias' admin-auth på qwerg-mandat (fund R1-1), 1:1:

```
gh api -X PATCH repos/Cphsales/stork-2.0/branches/main/protection/required_status_checks \
  -F strict=true -f "contexts[]=Lint, typecheck, test, build"
gh api -X PATCH repos/Cphsales/stork-2.0/branches/main/protection/required_pull_request_reviews \
  -F required_approving_review_count=1 -F require_code_owner_reviews=true -F dismiss_stale_reviews=true
```

(CodeQL er IKKE i contexts — fund R1-2, begrundet i state-dump.)
Rollback: samme endpoints med nuværende værdier (dumpet ovenfor).

### 2b. G061-opsamlings-migration (fund R1-3)

Én migration (§E default-mønster), ikke-destruktiv: de to `comment on`-
statements citeret 1:1 i state-dump-sektionen ovenfor (fund R2-1 — live-dump
viser `null` på begge; repo-teksterne ER migrations-indholdet). Deploy: auto
via migrations-deploy.yml ved merge → repo↔live comment-paritet 100% → G061
lukkes i teknisk-gaeld.md.

### 2c. `.github/BRANCH_PROTECTION.md` (fund R1-4)

Nuværende nøglelinjer (1:1): `Required approving reviews | 0 (solo — Mathias
reviewer egen kode)` · `Require review from Code Owners (lad være indtil flere
udviklere)` · PUT-eksemplets `"required_approving_review_count": 0,
"require_code_owner_reviews": false` · "Hvornår strammer vi op?"-sektionen
("Når 2. udvikler kommer ind: sæt ... 1 og aktivér ...").

Diff: tabel + PUT-eksempel opdateres til gov-4-slutstate (reviews=1,
code-owner=true, contexts=[ci-checken]); "Hvornår strammer vi op?" omskrives
— "2. udvikler"-præmissen er overhalet af bot-designet (Code som bot ER den
anden identitet); verifikations-sektionen udvides med protokollens case (c)+(d).
Bonus-fund dokumenteret: doc'en har hele tiden krævet ci-checken som required,
men live havde TOM contexts-liste — gabet lukkes af step 3.

### 3. Docs

| Fil                                                | Ændring                                                                                                                                                                                                                                       |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `huskeliste.md`                                    | [H026] → lukket: flyttes til historiske koder m. løsning ("bot-identitet + CODEOWNERS-fix, gov-4")                                                                                                                                            |
| `disciplin.md` Forudsætninger                      | "branch protection (gov-4)" fjernes fra udestående; Gjort-listen + gov-4                                                                                                                                                                      |
| `disciplin.md` omtaler af "gøres required i gov-4" | opdateres til gjort-form                                                                                                                                                                                                                      |
| `forretningsforstaaelse.md` banner                 | "Mekanisk håndhævelse ... lander i gov-4" er forældet efter aktivering. **Code forfatter IKKE** (§8.1 forfatterregel): Claude.ai forfatter én-sætnings-justering, Mathias forhåndsgodkender, Code committer ordret. Koordineres i build-fasen |
| `CLAUDE.md`                                        | commit-konventions-note hvis Mathias godkender H026-designet (åbent spørgsmål 2)                                                                                                                                                              |

## Implementations-rækkefølge (rækkefølgen ER risiko-styringen)

| Step | Hvad (0 = G061-migration: batch 1, kan køre når som helst før step 3)                                                              | Gate                                                                           |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1    | Capture ADMIN_HANDLE (før!); Mathias: bot-konto + org-invite + PAT; Code: auth-skift; capture BOT_LOGIN; assert forskellige (R4-1) | Verifikation: test-PR fra bot, Mathias kan trykke Approve (selve H026-beviset) |
| 2    | CODEOWNERS-fix (PR fra bot)                                                                                                        | governance:check grøn; Mathias-merge; `codeowners/errors` == [] (fund R3-1)    |
| 3    | required_status_checks.contexts udfyldes (API)                                                                                     | Verifikation: PR med rød CI kan ikke merges                                    |
| 4    | require_code_owner_reviews + count=1 (API) — **SIDST, kun efter step 1-2 verificeret**                                             | Verifikation: PR uden approval blokeret; med Mathias-approval mergeable        |
| 5    | Docs-opdateringer + H026-luk + banner-koordinering (Claude.ai-forfattet)                                                           | §8.1-gate (governance-docs berørt)                                             |

Step 3 kan ikke bricke (CI er grøn på main). Step 4 er det farlige — deraf
rækkefølgekravet fra Mathias ("H026 løst FØR required review").

## End-to-end-test-design (§3.6 — ærlig grænse)

Branch protection kan ikke selftestes i CI (gaten kan ikke teste sig selv
indefra). Erstattes af verifikations-protokol med rå outputs i slut-rapporten:

- (a) direkte push til main → afvist — **allerede observeret 2026-06-10**
  ("protected branch hook declined")
- (b) PR med rød CI → merge blokeret
- (c) PR uden Mathias-approval → blokeret (efter step 4)
- (d) PR med approval + grøn CI → mergeable
- (e) `gh api .../codeowners/errors` → `errors: []` (fund R3-1 — nuværende
  fil har 5 "Unknown owner"; skal være 0 før step 4)

## Doc-currency

**A. Fundament-validering (FØR qwerg):** ingen forretnings-intentions-ændring.
Forretningsforstaaelse-banneret berøres (forældet gov-4-fremtidsform), men
forfattes af Claude.ai efter Mathias-godkendelse — ikke af Code. Vision urørt.
Verificeret current pr. main @ `d71c447`.

**B. Status-opdatering (ved merge):**

| Doc                        | Berørt? | Opdatering                                                           |
| -------------------------- | ------- | -------------------------------------------------------------------- |
| aktiv-plan.md              | ja      | markør + Aktuel (build) → senest-merged + rest-sekvens (gov-5 næste) |
| seneste-rapport.md         | ja      | ny rapport ved Step 5                                                |
| master-plan §4.1           | nej     | gov-spor; aktiv-plan bærer status                                    |
| teknisk-gaeld.md           | ja      | G061 lukkes (opsamlings-migration, fund R1-3)                        |
| huskeliste.md              | ja      | H026 lukkes                                                          |
| disciplin "Forudsætninger" | ja      | gov-4 → Gjort (§8.1-gate)                                            |

## Åbne spørgsmål (Mathias ved qwerg)

1. Bot-konto-navn (forslag: `stork-code-bot`) + accept af machine-user-valget.
2. Accept af commit-konventions-skiftet (commits forfattes som bot, ikke som
   Mathias) — det er forudsætningen for at hans approval overhovedet er mulig.
3. **Hook-lås vs CODEOWNERS-write (fund R3-1):** stork1-lås-hooken blokerer
   Code fra at skrive Mathias-handlet i filer. Build step 2 kræver enten (a)
   midlertidig unlock (`rm ~/.claude/stork1-locked`) under CODEOWNERS-committen,
   eller (b) at hook-regexen præciseres til kun at matche repo-stier (handlet
   efterfulgt af `/`). Mathias vælger; (b) fjerner false-positive-fladen varigt.
