# H020-plan V3

**Aktør:** Code
**Branch:** `claude/h020-plan`
**Krav-dokument:** `docs/coordination/H020-krav-og-data.md` (commit `9b288ed` — M13+M21 dato-formulering præciseret)
**Dato:** 2026-05-16

**V3-ændring (svar på Codex' V2-feedback, status `ikke-enig`):** M13+M21 dato-verifikation strammet til at matche krav-dokumentets opdaterede formulering (commit `9b288ed`). Krav-dok siger nu eksplicit: "Erstat med: faktisk dato hvor rettelsen udføres" + "Verifikation: dato matcher commit-dato for selve H020-rettelses-commit'en". Plan-V2's tabel-verifikation (`dato 2026-05-15 eller -16` / `dato 2026-05-15+`) gav plan-frihed der kunne afvige fra krav. V3-tabel viser nu deterministisk verifikation: `git show --format=%cd <fil-cluster-commit>` skal matche datoen indsat i filen. Codex' V2-risiko (H020 må ikke lukkes før flow-trin 11 har opdateret `seneste-rapport.md`) adresseret som eksplicit Lukningskriterium-sektion. Ingen ændring i scope eller antal commits (16 fil-clusters + 1 flow-konsekvens).

**V2-ændring (svar på Codex' V1-blokering):** M23 omklassificeret. Krav-dokumentet siger nu eksplicit at `seneste-rapport.md` er dynamisk pegepind der ikke skal røres som separat fix — den opdateres naturligt af H020's egen slut-rapport-leverance (flow-trin 11). Plan-V1's "hash matcher faktisk HEAD efter H022-rebase" var brud mod opdateret krav. V2 fjerner M23-row fra implementations-rækkefølge. Antal fil-clusters: 17 → 16. Antal rettelser med separat commit: 29 → 28. M23 leveres som flow-konsekvens, ikke separat handling.

---

## Formål

> Denne pakke leverer: alle 29 åbenlyse dokument-rettelser fra H016 + bredde-audit, så de gør dokumenterne mere sande uden design-, arkitektur- eller policy-valg.
>
> Hvis fundet under review ikke bringer os tættere på dette: G-nummer, ikke blocker.

---

## Scope

**I scope:** Alle 29 rettelser i Rettelses-listen i krav-dokumentet (K1 + K7 + 21 M-rettelser + 5 KS + 1 B-rettelse). Bemærk: M23 er ikke en separat-commit-rettelse (krav-dok M23-formulering post-`a335f42`); leveres som flow-konsekvens ved H020's slut-rapport (se flow-trin 11). Antal separate-commit-rettelser: 28.

**IKKE i scope:**

- Fund der kræver design-, arkitektur- eller policy-valg (5 kritiske + 5 mellem + 7 bredde-fund — gemmes til I001 eller senere pakke)
- Master-plan ↔ kode-state-konsistens (ikke audit'et endnu)
- Bygge-status trin-rapporter ↔ faktiske leverancer (ikke audit'et)
- Mathias-afgoerelser entries ↔ kilde-commits (ikke audit'et)

---

## Strukturel beslutning

**Fil-cluster frem for fund-cluster.** Rettelserne grupperes efter fil, ikke efter severitet. Hver fil åbnes/redigeres/verificeres som én enhed. Begrundelse:

- Færre kontekst-skift; én fil ad gangen
- Git-diff koncentreret pr. fil
- Lettere verifikation efter hver fil-blok
- Hvis en rettelse i en fil afslører kobling: blokeret-fil på fil-niveau, ikke per-fund-niveau

Total filer at røre: 16 filer/fil-clusters med 28 separate-commit-rettelser. M23 er flow-konsekvens (ikke i tabel). Indenfor hver fil-cluster udføres rettelserne i én commit.

---

## Mathias' afgørelser (input til denne plan)

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

Ingen i denne pakke. Krav-dokumentet siger eksplicit: "Alle rettelser er åbenlyse 1-linjes ændringer."

Hvis en "åbenlys" rettelse alligevel viser sig at kræve valg eller har komplikation: STOP, dokumentér i `plan-feedback/H020-V<n>-blokeret.md`.

---

## Implementations-rækkefølge (fil-cluster, 16 commits + 1 flow-konsekvens)

| #   | Fil(er)                                                     | Rettelser                                                                                     | Verifikation                                                                                                                                                                                                           |
| --- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `.github/BRANCH_PROTECTION.md` + `.github/CODEOWNERS`       | K1 (org-handle)                                                                               | `grep -r "copenhagensales" .github/ docs/` → 0 hits                                                                                                                                                                    |
| 2   | `docs/teknisk/lag-e-beregningsmotor-krav.md`                | K7 (annullerings-fradrag)                                                                     | tekst matcher master-plan rettelse 2 (bruger vælger target_period_id)                                                                                                                                                  |
| 3   | `README.md`                                                 | M1 + M15 + KS2 (lint-coverage præcis, codex-notify omtale, fjern code-forstaaelse-samlet-ref) | grep `code-forstaaelse-samlet` → 0; codex-notify nævnt; lint-staged-blok-konsistens                                                                                                                                    |
| 4   | `CLAUDE.md`                                                 | M2 (H-nummer-claim)                                                                           | `grep -i "H-numre" CLAUDE.md` returnerer ingen claim om teknisk-gaeld.md-indhold                                                                                                                                       |
| 5   | `docs/coordination/mathias-afgoerelser.md`                  | M3 + M4 (memory-datoer, Q-pakke 22 RPC'er)                                                    | `git log --diff-filter=A` for hver memory-fil verificerer datoer; "22" matcher TaskList #33                                                                                                                            |
| 6   | `docs/strategi/arbejdsmetode-og-repo-struktur.md`           | M5 + M6 + M16 + M17 (status, mappetræ, Codex-status, Action-status)                           | status-felt = "Aktiveret via H010"; mappetræ matcher `ls docs/`; ingen "senere"-tekst om Codex-CLI eller Action                                                                                                        |
| 7   | `docs/strategi/bygge-status.md`                             | M8 + M13 (klassifikations-tal, sidste-opdatering)                                             | tal=202 matcher MCP-query; M13-dato matcher commit-dato (`git show --format=%cd HEAD` på fil-cluster #7-commit)                                                                                                        |
| 8   | `docs/teknisk/permission-matrix.md`                         | M9 + KS1 (2 is_admin-funktioner, fjern frontmatter-instruks)                                  | "2 funktioner" + liste; ingen self-referential frontmatter-tekst                                                                                                                                                       |
| 9   | `docs/coordination/aktiv-plan.md`                           | M10 (H010 commit-hash)                                                                        | hash `3c6bc0b` til stede; ingen "skrives ind"-placeholder                                                                                                                                                              |
| 10  | `docs/teknisk/teknisk-gaeld.md`                             | M12 + M21 + M22 (G019-arkiv, sidste-opdatering, schema-navn)                                  | G019 ikke i åben-sektion; M21-dato matcher commit-dato (`git show --format=%cd HEAD` på fil-cluster #10-commit) + opdaterings-beskrivelse refererer seneste tilføjelser (fx G031-G044); ingen `core_sales`-forekomster |
| 11  | `docs/strategi/stork-2-0-master-plan.md`                    | M18 + KS3 (rettelses-tælling, fjern migration-strategi-analyse-ref)                           | tal matcher faktisk Appendix C-count; ingen `migration-strategi-analyse`                                                                                                                                               |
| 12  | `docs/teknisk/lag-e-tidsregistrering-krav.md`               | M20 + B4 (fravær-tekst, §-reference)                                                          | ferie-vs-sygefravær præciseret; §1.7 erstatter §5                                                                                                                                                                      |
| 13  | `supabase/migrations/20260514150005_t7_lock_pipeline.sql`   | M24 (kommentar)                                                                               | kommentar matcher flag-UPDATE-mønster post-R3/R4                                                                                                                                                                       |
| 14  | `supabase/tests/README.md`                                  | M26 (script-kommando)                                                                         | `pnpm db:test` erstatter `pnpm test:db`                                                                                                                                                                                |
| 15  | `docs/skabeloner/rapport-skabelon.md`                       | KS4 (vision-tjek-lokation)                                                                    | reference peger på `docs/strategi/arbejds-disciplin.md` "Vision-tjek-skabelon"-sektionen                                                                                                                               |
| 16  | `docs/coordination/arkiv/r-runde-2-plan.md` + `r7h-plan.md` | KS5 (gammel sti)                                                                              | `docs/permission-matrix.md` erstattet med `docs/teknisk/permission-matrix.md` i begge filer                                                                                                                            |

**Flow-konsekvens (ikke separat commit):**

| - | `docs/coordination/seneste-rapport.md` | M23 (dynamisk pegepind) | Opdateres af H020's slut-rapport-leverance (flow-trin 11); peger derefter på `rapport-historik/<dato>-h020.md`; codex-notify trigger fyrer automatisk ved samme opdatering |

**Single PR med 16 commits** — én commit pr. fil-cluster for clean git-historie. M23 håndteres som flow-konsekvens uden separat commit. Alternativt: én commit hvis Codex foretrækker monolitisk. Foreslået: 16 commits for granular reverteringsmulighed.

---

## Migration-strategi

Ingen migrations. Single migration-fil rørt (M24) er kun kommentar-ændring i allerede-applied migration. Ingen SQL-eksekvering ændret.

---

## Test-konsekvens

Verifikation pr. rettelse er specificeret i krav-dokumentet og opsummeret i Implementations-rækkefølge-tabellen ovenfor. Generelt:

- **Grep-baseret verifikation:** K1, KS2, KS3, KS5, M22 — kan automatiseres som CI-check hvis ønsket (ikke i scope nu)
- **DB-state verifikation:** M8 (klassifikations-tal), M9 (is_admin-funktioner) — udført via Supabase MCP
- **Indholds-konsistens:** K7, M1, M2, M16, M17, M20, M24 — manuel læsning mod kilde-tekst
- **Dato/hash-akkuratesse:** M3, M10 — git log / merge-commit-verifikation. M13, M21 — dato indsat i filen skal matche commit-dato for samme fil-cluster-commit (verificeres med `git show --format=%cd <commit>`); M23 håndteres af slut-rapport-flow.

Ingen nye tests skrives. Ingen eksisterende tests ændres.

---

## Risiko + kompensation

| Rettelse                            | Værste-case                                                                                            | Sandsynlighed                                                                              | Rollback                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------- | --------------------------------------------------------------- |
| K1 (org-handle)                     | Forkert org-handle introduceret hvor `copenhagensales` skulle have været bevaret (historisk reference) | Lav — krav-dokument bekræfter `Cphsales` er korrekt                                        | `git revert` pr. fil-cluster-commit                     |
| K7 (annullerings-fradrag)           | Misforstå master-plan rettelse 2-tekst                                                                 | Lav                                                                                        | Pull master-plan-tekst ordret hvis tvivl                |
| M3 (memory-datoer)                  | Forkert dato pr. memory-fil pga. ambiguøs git-historie                                                 | Mellem — `feedback_dont_fabricate_to_fit.md` har metadata `originSessionId` der kan bruges | Verificér mod `git log --diff-filter=A -- <memory-fil>` |
| M18 (master-plan rettelser-tælling) | Tæller forkert hvis Appendix C struktur er ambiguøs                                                    | Lav                                                                                        | Brug `grep -c "^                                        | [0-9]" docs/strategi/stork-2-0-master-plan.md` mod tabel-format |
| M24 (migration-kommentar)           | Migration-historik-integritet (CI har schema-drift-check)                                              | Lav — schema.sql er PLACEHOLDER, drift-check de facto inaktiv                              | Kommentar-ændring er harmløs; ingen SQL-side-effekt     |
| Resten                              | Tekst-rettelser uden afhængigheder                                                                     | Meget lav                                                                                  | `git revert` pr. fil-cluster-commit                     |

**Kompensation (generelt):** Hver commit er én fil/fil-cluster, så revert kan ske granulært. CI grøn på hver commit verificerer at fitness/migration-gate ikke rammes.

---

## Konsistens-tjek

- **Vision:** Styrker. H020 lukker afstand mellem dokumenter og kode-state — direkte understøtter "én sandhed" + "styr på data". Ingen vision-svækkelse identificeret.
- **Master-plan:** Ingen modsigelser. H020 retter dokumenter til at matche master-plan + faktisk kode-state; ikke omvendt.
- **Disciplin-pakke (afsnit 1-4 fra `arbejds-disciplin.md`):** Plan-skabelon-Formål ordret. Lag-boundary-rapport leveres i slut-rapport. Validerings-runde-disciplin: alle rettelser er åbenlyse — runde 1 bør konvergere. Glid-detector: hvis Code finder en "åbenlys" rettelse der ikke er åbenlys, stop og dokumentér.
- **Krav-dokument-disciplin:** Plan-forslag er konsistent med krav-dokumentet's 6 afgørelser + scope. Ingen brud-typer ramt.

---

## Sekundær formål — flow-test verifikation

Per krav-dokumentets "Sekundært formål" verificerer H020 hele plan-automation-flowet:

| Flow-trin                             | Verifikation under H020                                                         | Forventet udfald                                       |
| ------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Code pull før plan-arbejde            | `git pull origin main` udført før plan blev skrevet                             | ✓ verificeret før denne plan                           |
| aktiv-plan.md-trigger                 | aktiv-plan opdateres + pushes → tracker-issue #12 får "ny-plan-version"-comment | Verificeres efter denne plan committes                 |
| Codex pull før review                 | Codex pull verificerer HEAD matcher plan-fil                                    | Verificeres af Codex                                   |
| Codex committer feedback → Code's tur | Codex committer `H020-V1-codex.md` → tracker-issue får "codex-feedback"-comment | Verificeres efter Codex review                         |
| Round-trip konvergerer mod approved   | Få iterationer indtil `H020-approved.md`                                        | Forventet 1-2 runder grundet rettelses-listens åbenhed |
| Slut-rapport trigger Codex-review     | seneste-rapport.md-opdatering efter merge → "slut-rapport-push"-comment         | Verificeres efter H020-merge                           |
| Hele flowet uden manuel intervention  | Ingen Mathias-trigger nødvendig mellem aktør-skift                              | Verificeres af event-rækkefølge                        |

Hvis flow-fejl: dokumentér i `plan-feedback/H020-flow-fejl.md` per krav-dokumentets instruks.

---

## Lukningskriterium (adresserer Codex V2-risiko)

H020 må IKKE markeres færdig før følgende er verificeret i nævnte rækkefølge:

1. Alle 16 fil-cluster-commits er på `claude/h020-plan` og CI grøn pr. commit.
2. PR merget til `main`.
3. Slut-rapport committet til `docs/coordination/rapport-historik/<dato>-h020.md`.
4. `docs/coordination/seneste-rapport.md` opdateret til at pege på slut-rapport-filen i samme commit eller efterfølgende commit (flow-trin 11 — M23 flow-konsekvens).
5. codex-notify trigger fyret automatisk ved seneste-rapport.md-push (verificeres via tracker-issue #12-comment).

Hvis trin 4 ikke sker spontant via flow-disciplin, er det H020-fejl, ikke fremtidig opgave. Plan er først leveret når M23 er reelt opfyldt via flow.

---

## Konklusion

29 åbenlyse rettelser: 28 i 16 fil-clusters + 1 flow-konsekvens (M23). Lav risiko, ingen design-valg, ingen migrations. Single PR med granulære commits. Plan er konsistent med krav-dokumentet (post-`9b288ed` M13+M21-præcisering, post-`4a14819` M23-formulering) og styrker vision-elementer.

Klar til Codex-review-runde V3.
