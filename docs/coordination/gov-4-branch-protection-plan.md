# gov-4-branch-protection — Plan V1

**Branch:** claude/gov-4-branch-protection-plan
**Krav-dok:** docs/coordination/gov-4-branch-protection-krav-og-data.md (ekstrakt; fælles dok: governance-vagt-krav-og-data.md pkt 4 + D2)
**Dato:** 2026-06-10
**Status-fil:** docs/coordination/gov-4-branch-protection-status.md (konvergens-counter: 1)

## Formål

> Denne pakke leverer: bindende gates på main — required CI-checks og required
> code-owner-review — så intet kan merges uden om processen, med
> approval-mekanikken (H026) løst før required review aktiveres.

## Step 2.0 — Skitse + størrelses-tjek

**0 migrations.** Leverancen er: GitHub-indstillinger (API), én CODEOWNERS-fil,
docs-opdateringer, H026-luk. Under §3.8-grænsen → fuld V1.

## Verificerede repo-objekter (state-dump, 2026-06-10)

§3.2 DB-dump N/A (ingen DB-objekter). Repo-/GitHub-state, råt:

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

**CI-check-navne (fra workflows + PR #108/#109-checks):** ci.yml har ét job
`ci` med display-navn `Lint, typecheck, test, build` (indeholder prettier,
eslint, typecheck, test, build, `governance:check` linje 67,
`governance:selftest` linje 70, fitness). CodeQL kører via GitHub default
setup (check-navn `CodeQL`). `codex-notify` og `pr-drift-warning` er
notify-only og skal IKKE være required.

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

Ny: `@Cphsales` → Mathias' personlige bruger (den gh-auth'ede User-konto) på
alle 5 linjer + kommentar-blok opdateret med hvorfor (org kan ikke være code
owner). Kommenterede lag-B-linjer bevares uændret.

### 2. Branch protection (API-kald, ikke fil)

```
gh api -X PATCH repos/Cphsales/stork-2.0/branches/main/protection/required_status_checks \
  -f strict=true -f "contexts[]=Lint, typecheck, test, build" -f "contexts[]=CodeQL"
gh api -X PATCH repos/Cphsales/stork-2.0/branches/main/protection/required_pull_request_reviews \
  -F required_approving_review_count=1 -F require_code_owner_reviews=true -F dismiss_stale_reviews=true
```

Rollback: samme endpoints med nuværende værdier (dumpet ovenfor).

### 3. Docs

| Fil                                                | Ændring                                                                                                                                                                                                                                       |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `huskeliste.md`                                    | [H026] → lukket: flyttes til historiske koder m. løsning ("bot-identitet + CODEOWNERS-fix, gov-4")                                                                                                                                            |
| `disciplin.md` Forudsætninger                      | "branch protection (gov-4)" fjernes fra udestående; Gjort-listen + gov-4                                                                                                                                                                      |
| `disciplin.md` omtaler af "gøres required i gov-4" | opdateres til gjort-form                                                                                                                                                                                                                      |
| `forretningsforstaaelse.md` banner                 | "Mekanisk håndhævelse ... lander i gov-4" er forældet efter aktivering. **Code forfatter IKKE** (§8.1 forfatterregel): Claude.ai forfatter én-sætnings-justering, Mathias forhåndsgodkender, Code committer ordret. Koordineres i build-fasen |
| `CLAUDE.md`                                        | commit-konventions-note hvis Mathias godkender H026-designet (åbent spørgsmål 2)                                                                                                                                                              |

## Implementations-rækkefølge (rækkefølgen ER risiko-styringen)

| Step | Hvad                                                                                   | Gate                                                                           |
| ---- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1    | Mathias: bot-konto + org-invite + PAT; Code: auth-skift                                | Verifikation: test-PR fra bot, Mathias kan trykke Approve (selve H026-beviset) |
| 2    | CODEOWNERS-fix (PR fra bot)                                                            | governance:check grøn; Mathias-merge                                           |
| 3    | required_status_checks.contexts udfyldes (API)                                         | Verifikation: PR med rød CI kan ikke merges                                    |
| 4    | require_code_owner_reviews + count=1 (API) — **SIDST, kun efter step 1-2 verificeret** | Verifikation: PR uden approval blokeret; med Mathias-approval mergeable        |
| 5    | Docs-opdateringer + H026-luk + banner-koordinering (Claude.ai-forfattet)               | §8.1-gate (governance-docs berørt)                                             |

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
| teknisk-gaeld.md           | nej     | medmindre build finder noget                                         |
| huskeliste.md              | ja      | H026 lukkes                                                          |
| disciplin "Forudsætninger" | ja      | gov-4 → Gjort (§8.1-gate)                                            |

## Åbne spørgsmål (Mathias ved qwerg)

1. Bot-konto-navn (forslag: `stork-code-bot`) + accept af machine-user-valget.
2. Accept af commit-konventions-skiftet (commits forfattes som bot, ikke som
   Mathias) — det er forudsætningen for at hans approval overhovedet er mulig.
