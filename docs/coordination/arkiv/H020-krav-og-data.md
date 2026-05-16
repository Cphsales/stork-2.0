# H020 — Åbenlyse dokument-rettelser (test af plan-automation)

**Type:** H-pakke (lille, afgrænset)
**Forfatter:** Claude.ai
**Anvendelse:** Code laver plan-fil baseret på dette dokument, bruger automation-flow som testpakke
**Dato:** 2026-05-15

---

## Mission-kontekst

> Dokumenterne skal fortælle sandheden om nuværende kode, fremtidsplan, arbejdsfordeling, vision, principper og logikker.

H020 leverer ét skridt mod missionen: alle åbenlyse 1-linjes-rettelser hvor sandheden er entydig og fixet er klart.

---

## Formål

> Denne pakke leverer: alle 29 åbenlyse dokument-rettelser fra H016 + bredde-audit, så de gør dokumenterne mere sande uden design-, arkitektur- eller policy-valg.
>
> Hvis fundet under review ikke bringer os tættere på dette: G-nummer, ikke blocker.

---

## Sekundært formål — teknisk test

H020 er første rigtige test af plan-automation-flowet etableret i H021. Vi vil verificere:

- Code pull før plan-arbejde virker
- aktiv-plan.md-trigger fyrer codex-notify automatisk
- Codex pull før review virker
- Codex committer feedback → trigger Code's tur
- Round-trip-loop konvergerer mod approved-fil
- Slut-rapport trigger Codex-review automatisk
- Hele flowet kører uden manuel intervention fra Mathias

Hvis flow-fejl opdages: stop pakken, dokumentér i `plan-feedback/H020-flow-fejl.md`, og lad Mathias afgøre.

---

## Scope

**I scope (29 rettelser):**

Alle rettelser i sektionen "Rettelses-liste" nedenfor. Code arbejder fra listen og verificerer hver ændring mod faktisk fil-state.

**IKKE i scope:**

- Fund der kræver design-, arkitektur- eller policy-valg (5 kritiske + 5 mellem + 7 bredde-fund — gemmes til I001 eller senere pakke)
- Master-plan ↔ kode-state-konsistens (ikke audit'et endnu)
- Bygge-status trin-rapporter ↔ faktiske leverancer (ikke audit'et)
- Mathias-afgoerelser entries ↔ kilde-commits (ikke audit'et)

---

## Mathias' afgørelser

| #   | Beslutning                                                                                                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Pakke laves som H-nummer, ikke I-pakke — leverancen er rene tekst-rettelser uden plan-runde-behov for tekniske valg                                  |
| 2   | Bruger plan-automation-flow som testpakke — komplet round-trip via commits, ingen manuel kanal                                                       |
| 3   | KS2 + KS3 (reference til ikke-eksisterende filer): fjern references frem for at oprette filer                                                        |
| 4   | M16 (Codex auto-eksekvering ikke implementeret): opdater dokumentation til at sige notification-only er nuværende state, ikke "implementeres senere" |
| 5   | M18 (master-plan rettelser-tælling): brug faktisk antal (28+), ikke estimat                                                                          |
| 6   | M3 (feedback-memories dato): brug faktiske datoer pr. memory-fil. Code verificerer mod commit-historik.                                              |

---

## Tekniske valg overladt til Code

Ingen i denne pakke. Alle rettelser er åbenlyse 1-linjes ændringer.

Hvis Code under arbejdet bemærker at en "åbenlys" rettelse alligevel kræver valg eller har komplikation: STOP, dokumentér i `plan-feedback/H020-V<n>-blokeret.md`.

---

## Aktør-disciplin (eksplicit for H020)

**Pull-disciplin:**

- Code pull main før plan-arbejde starter
- Code pull før build starter
- Codex pull før hver review-runde
- Code pull før hver V<n+1>-iteration
- Hvis pull viser uventede commits: STOP, rapportér til Mathias

**Krav-dokument-disciplin:**

Hvis en rettelse i Rettelses-listen viser sig at modsige krav-dokumentet eller anden autoritativ kilde under arbejdet: STOP, dokumentér i plan-feedback. Argumentér ikke videre.

---

## Rettelses-liste — 29 åbenlyse rettelser

Format pr. rettelse: **Fund-ID** — fil — handling

Code finder konkret linje via grep/search. Linje-numre fra audit-rapporterne kan være stale efter senere commits.

### Kritiske (2)

**K1 — GitHub-org-handle: 5 lokationer**
Filer: `.github/BRANCH_PROTECTION.md` + `.github/CODEOWNERS`
Find alle forekomster af `copenhagensales` → erstat med `Cphsales`
Verifikation: `grep -r "copenhagensales" .github/ docs/` returnerer 0 hits

**K7 — Annullerings-fradrag arkitektur-tekst**
Fil: `docs/teknisk/lag-e-beregningsmotor-krav.md`
Find: tekst der siger annullerings-fradrag falder i lønperiode hvor effekt-dato ligger
Erstat med: tekst der reflekterer master-plan rettelse 2 (bruger vælger target_period_id; effekt-dato styrer ikke periode-placering)
Verifikation: krav-dok-tekst matcher master-plan §-tekst om annullerings-fradrag

### Mellem (21)

**M1 — README lint-coverage præcisering**
Fil: `README.md`
Find: "Husky + lint-staged kører Prettier og ESLint på staged files"
Erstat med: tekst der præciserer: Prettier kører på alle staged tekst-filer; ESLint kører kun på `apps/web/**/*.{ts,tsx}` (jf. package.json lint-staged)
Verifikation: README-tekst matcher package.json lint-staged-blok

**M2 — CLAUDE.md H-nummer-claim**
Fil: `CLAUDE.md`
Find: tekst der siger teknisk-gaeld.md indeholder "H-numre" eller "G-numre + H-numre"
Erstat med: tekst der kun nævner G-numre (H-numre er sporbar i mathias-afgoerelser.md + cutover-checklist.md, ikke i teknisk-gaeld.md)
Verifikation: CLAUDE.md nævner ikke H-numre som teknisk-gaeld.md-indhold

**M3 — Feedback-memories aktiverings-dato**
Fil: `docs/coordination/mathias-afgoerelser.md`
Find: entry der siger "tre feedback-memories aktiveret 2026-05-11"
Erstat med: faktiske datoer pr. memory-fil baseret på commit-historik
Verifikation: `git log --diff-filter=A` for hver memory-fil giver oprettelses-dato

**M4 — Q-pakke RPC-antal**
Fil: `docs/coordination/mathias-afgoerelser.md`
Find: "20" som RPC-antal i Q-pakke-entry
Erstat med: "22"
Verifikation: tal matcher TaskList #33 + commit-besked-historik

**M5 — Arbejdsmetode aktiverings-status**
Fil: `docs/strategi/arbejdsmetode-og-repo-struktur.md`
Find: "Plan, ikke aktiveret"
Erstat med: "Aktiveret via H010 (commit `3c6bc0b`)"
Verifikation: status-felt matcher faktisk merge-tilstand

**M6 — Arbejdsmetode mappetræ-fuldstændighed**
Fil: `docs/strategi/arbejdsmetode-og-repo-struktur.md`
Find: mappetræ der mangler arbejdsmetode-filen selv, codex-review-prompt.md, cutover-checklist.md
Tilføj: de manglende filer i træet
Verifikation: træ-strukturen matcher faktisk `ls docs/`-output

**M8 — Bygge-status klassifikations-tal**
Fil: `docs/strategi/bygge-status.md`
Find: tal 207, 211, 233 som klassificerede-kolonner-tal
Erstat med: 202 (faktisk DB-state per G018-dokumentation)
Verifikation: tal matcher Supabase MCP-query `select count(*) from core_compliance.data_classifications`

**M9 — Permission-matrix is_admin-funktioner**
Fil: `docs/teknisk/permission-matrix.md`
Find: "1 funktion bruger KUN is_admin"
Erstat med: "2 funktioner" + liste de to (core_compliance.superadmin_settings_update + core_identity.is_admin)
Verifikation: tal matcher Supabase MCP-query mod pg_proc

**M10 — Aktiv-plan H010 commit-hash**
Fil: `docs/coordination/aktiv-plan.md`
Find: "afsluttet ved commit-hash der skrives ind her efter samle-commit"
Erstat med: konkret commit-hash `3c6bc0b`
Verifikation: hash matcher merge-commit af PR #10

**M12 — G019 arkiv-flytning**
Fil: `docs/teknisk/teknisk-gaeld.md`
Find: G019-entry markeret "LØST. Flyttes til arkiv ved næste revision" i aktiv-sektion
Flyt: hele G019-blokken til arkiv-sektion (eller opret arkiv-sektion hvis den ikke eksisterer)
Verifikation: G019 forekommer ikke længere i "Åben gæld"-sektion

**M13 — Bygge-status sidste-opdatering-dato**
Fil: `docs/strategi/bygge-status.md`
Find: "Sidste opdatering 14. maj"
Erstat med: faktisk dato hvor rettelsen udføres (ikke 14. maj som er stale)
Verifikation: dato matcher commit-dato for selve H020-rettelses-commit'en

**M15 — README workflow-omtale**
Fil: `README.md`
Find: sektion der nævner ci.yml men ikke codex-notify.yml
Tilføj: omtale af codex-notify.yml (etableret i H010.7, udvidet i H021)
Verifikation: README dokumenterer begge eksisterende workflows

**M16 — Arbejdsmetode Codex auto-eksekvering-status**
Fil: `docs/strategi/arbejdsmetode-og-repo-struktur.md`
Find: tekst der siger Codex CLI auto-eksekvering "implementeres senere" eller lignende
Erstat med: notification-only er nuværende state (notification via codex-notify.yml til tracker-issue #12), Codex læser og leverer review via plan-feedback-commits efter manuel session-start
Verifikation: dokumentation matcher faktisk H010.7 + H021 setup

**M17 — Arbejdsmetode GitHub Action-status**
Fil: `docs/strategi/arbejdsmetode-og-repo-struktur.md`
Find: "GitHub Action sættes op senere" eller lignende
Erstat med: Action er etableret i H010.7 som codex-notify.yml, tracker-issue #12 er aktiv, udvidet med plan-paths i H021
Verifikation: dokumentation matcher faktisk workflow-state

**M18 — Master-plan rettelses-tælling**
Fil: `docs/strategi/stork-2-0-master-plan.md`
Find: "Status: Komplet med 17 rettelser" eller lignende undervurdering
Erstat med: faktisk antal rettelser i Appendix C (28+, Code tæller præcist)
Verifikation: tal matcher faktisk count i Appendix C

**M20 — Lag-e-tidsregistrering fravær-tekst**
Fil: `docs/teknisk/lag-e-tidsregistrering-krav.md`
Find: "Fravær har approval-workflow" (generisk udsagn)
Erstat med: specifik tekst der reflekterer master-plan: ferie har approval-workflow, sygefravær har ikke
Verifikation: krav-dok-tekst matcher master-plan §2.2

**M21 — Teknisk-gaeld sidste-opdatering-dato**
Fil: `docs/teknisk/teknisk-gaeld.md`
Find: "Sidste opdatering: 14. maj 2026 (efter retroaktiv gennemgang trin 1-4)"
Erstat med: faktisk dato hvor rettelsen udføres + opdatérings-beskrivelse der reflekterer seneste tilføjelser (fx G031-G044)
Verifikation: dato matcher commit-dato for selve H020-rettelses-commit'en

**M22 — Teknisk-gaeld schema-navn**
Fil: `docs/teknisk/teknisk-gaeld.md`
Find: `core_sales.sales` eller andre forekomster af `core_sales`-schema
Erstat med: korrekt schema-navn per tre-schema-arkitektur (`core_money` eller `core_compliance` afhængig af kontekst)
Verifikation: ingen forekomster af `core_sales` i teknisk-gaeld.md

**M23 — Seneste-rapport pegepind (omfattet af pakke-leverance, ikke statisk fix)**
Fil: `docs/coordination/seneste-rapport.md`
Konstatering: filen er **dynamisk pegepind** der opdateres ved hver pakke-leverance. Den skal pege på SENESTE leverede slut-rapport. Mit oprindelige krav-dok antog statisk hash-fix mod H010; det er ikke den rigtige mekanik for denne fil.
Handling: Code rør IKKE seneste-rapport.md som separat rettelse. Filen opdateres naturligt når H020's egen slut-rapport leveres (per "Forventet flow"-trin 11 nedenfor).
Verifikation: efter H020-merge peger filen på `rapport-historik/<dato>-h020.md` med commit-hashes fra H020-PR. Codex-notify trigger fyrer automatisk ved samme opdatering.

**M24 — T7 lock-pipeline kommentar**
Fil: `supabase/migrations/20260514150005_t7_lock_pipeline.sql`
Find: kommentar der siger "re-lock skal håndtere overskrivning via ON CONFLICT DO NOTHING" eller refererer ON CONFLICT-mønster
Erstat med: kommentar der reflekterer faktisk implementation (flag-UPDATE-mønster efter R3/R4)
Verifikation: kommentar-tekst matcher SQL-logic-flow i samme migration

**M26 — Tests README script-kommando**
Fil: `supabase/tests/README.md`
Find: `pnpm test:db`
Erstat med: `pnpm db:test`
Verifikation: kommando matcher package.json scripts-blok

### Kosmetiske (5)

**KS1 — Permission-matrix frontmatter-instruks**
Fil: `docs/teknisk/permission-matrix.md`
Find: self-referential tekst der refererer YAML-frontmatter der ikke eksisterer
Fjern: blokken eller flyt til faktisk frontmatter hvis sådan ønskes oprettet
Verifikation: fil indeholder ikke længere self-referential instruks

**KS2 — README forsvunden fil-reference**
Fil: `README.md`
Find: reference til `code-forstaaelse-samlet.md`
Fjern: reference (per Mathias-afgørelse #3)
Verifikation: ingen forekomst af `code-forstaaelse-samlet.md` i README

**KS3 — Master-plan forsvunden fil-reference**
Fil: `docs/strategi/stork-2-0-master-plan.md`
Find: reference til `migration-strategi-analyse.md`
Fjern: reference (per Mathias-afgørelse #3)
Verifikation: ingen forekomst af `migration-strategi-analyse.md` i master-plan

**KS4 — Rapport-skabelon vision-tjek-lokation**
Fil: `docs/skabeloner/rapport-skabelon.md`
Find: reference til forældet vision-tjek-lokation
Erstat med: `docs/strategi/arbejds-disciplin.md` (sektion "Vision-tjek-skabelon — i hver trin-rapport")
Verifikation: skabelonen peger på faktisk lokation af vision-tjek-skabelon

**KS5 — Arkiv stale paths**
Filer: `docs/coordination/arkiv/r-runde-2-plan.md` + `docs/coordination/arkiv/r7h-plan.md`
Find: paths der refererer `docs/permission-matrix.md` (gammel sti før H010-flyt)
Erstat med: `docs/teknisk/permission-matrix.md`
Verifikation: ingen forekomster af `docs/permission-matrix.md` i arkiv-filer

### Bredde (1)

**B4 — Lag-e-tidsregistrering §-reference**
Fil: `docs/teknisk/lag-e-tidsregistrering-krav.md`
Find: "rettigheds-systemet (§5)"
Erstat med: "rettigheds-systemet (§1.7)"
Verifikation: §-reference peger på faktisk master-plan rettigheds-system

---

## Forventet flow efter dette dokument

1. Mathias committer dette krav-dokument til main + tilhørende prompt sendes til Code
2. Code pull main, læser krav-dokument, laver `docs/coordination/H020-plan.md`
3. Plan-fil + opdateret aktiv-plan.md committed på branch claude/h020-plan
4. codex-notify trigger automatisk → tracker-issue #12 får comment
5. Codex pull, læser plan + krav-dokument, leverer feedback i `plan-feedback/H020-V1-codex.md`
6. codex-notify trigger automatisk → Code's tur
7. Round-trip indtil Codex committer `plan-feedback/H020-approved.md`
8. Mathias + Claude.ai validerer plan mod krav-dokument
9. Mathias godkender → Code bygger
10. Code rapporterer i slut-rapport (`rapport-historik/<dato>-h020.md`)
11. seneste-rapport.md opdateret → codex-notify trigger Codex-review af slut-rapport
12. Pakke afsluttet, plan-fil flyttet til plan-historik/

Hvis flow-fejl opdages undervejs: stop, dokumentér i `plan-feedback/H020-flow-fejl.md`, lad Mathias afgøre.

---

## Sammenhæng med I001

H020 og I001 er parallelle pakker:

- **H020** lukker alle åbenlyse fund (29 stk) der ikke kræver design-valg
- **I001** lukker resterende H016-fund (17 stk) der kræver design/arkitektur/policy-valg

Når H020 + I001 er færdige: alle 46 fund fra H016 + bredde-audit-first-sweep er lukket. Næste skridt er deeper-audit-pakke (O1-O5 fra bredde-audit).

Hvis Code under H020-arbejdet finder at en "åbenlys" rettelse er koblet til en I001-rettelse: STOP og dokumentér koblingen før arbejdet fortsætter.
