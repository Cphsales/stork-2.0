# Proces-forslag: hvordan vi laver planen (Code's forslag til fælles proces)

**Type:** Forslag til HVORDAN planen laves — ikke planen selv · **Forfatter:** Code (`stork-code-bot`) · **Dato:** 2026-06-16
**Status:** Codes halvdel af ét fælles forslag. **Codex har endnu ikke publiceret sit** — så dette er grundlaget, ikke en konvergeret konsensus. Codex reviewer + amender på dette committede artefakt → fælles forslag → Mathias afgør.
**Kontrakt:** `docs/coordination/workflow-faerdiggoerelse-krav-og-data.md`.

## Mathias' to-plan-split (rygraden i dette forslag)

Workflowet deles ved sit naturlige søm — **GATE 2 (godkendt plan)** — i to implementerings-pakker under ÉT krav-dok (kontrakt-sanktioneret: "krav-dok forbliver ÉT dok, implementation splittes over pakker"):

- **Pakke 1 — front-halvdel + delt substrat:** åbning → krav → recon → krav-ID-spec → plan → fire-aktør plan-godkendelse (GATE 2). Plus det **delte substrat** begge halvdele bruger: git/ledger/worklog, cross-review-på-committet-PR, hooks/CI-gates, worktree-isolation.
- **Pakke 2 — bag-halvdel:** godkendt plan → batch-build → per-batch cross-review + dispositioner → slutrapport (genereret) → fire slut-godkendelser → ren luk.

**Bootstrap-rækkefølgen (det der gør splittet stærkt):**

1. Plan for **Pakke 1 laves i hånden** (meta-processen nedenfor) — mindre scope end én fuld plan, så hånd-bootstrappet er billigere.
2. **Pakke 1 bygges** (hånd-kørt, da bag-halvdelens automatik endnu ikke findes).
3. Plan for **Pakke 2 produceres IGENNEM den byggede front-halvdel** = front-halvdelens **rigtige e2e-test** (erstatter en syntetisk dry-run). Producerer den en ren, godkendt Plan 2, er front-halvdelen bevist på en ægte opgave.
4. **Pakke 2 bygges**; derefter er workflowet komplet.
5. **Første rigtige Stork-pakke gennem hele workflowet** = fuld e2e-bekræftelse.

**Ærlig sekventering af hvad der beviser hvad:** front-halvdelen bevises ved at producere en _godkendt_ Plan 2 (hvor "godkendt" inkluderer Code build-ready + Codex APPROVAL = byggbar-dømt). At godkendte planer _faktisk bygger rent_ bevises først når bag-halvdelen findes (trin 4) og en fuld pakke er kørt igennem (trin 5). Selve build'et er hånd-kørt indtil bag-halvdelen findes — splittet front-loader den mest genbrugelige halvdel (planlægning), ikke automatiseringen af build.

## Meta-princip — hvorfor hånd-processen ikke er lovløs

Vi har ikke det automatiserede workflow (det er det vi bygger), men vi har dets **beviste primitiver**, alle terminal-testede denne session og **uafhængigt af kæden**: committet-PR cross-review, krav-ID-dækning, plan-SHA-binding, evidens-gate, isolerede worktrees, hooks, drift-gate. Pakke 1's plan laves **i hånden med disse primitiver**; Pakke 2's plan laves igennem den byggede front-halvdel.

## Prærekvisit (FLAG, kontrakt)

Krav-dokket er `Status: UDKAST — krav OK ikke givet`. Kontrakten + begge buds GATE 1 siger intet planlægges uden et krav-OK'd krav-dok bag. → **Mathias giver `krav OK <hash>` (eller bekræfter krav-dokket som bindende) FØR planlægning.** Det er Mathias' ord at give.

## Meta-proces for Pakke 1's plan (i hånden)

| Trin                                                                                                                 | Hvad | Skriver                                                                                           | Uafhængig review                                  | Lås |
| -------------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------- | --- |
| **A. Konsolidér de to bud → ét fundament-doc** (Codex' form + Codes carry-ins)                                       | Code | Codex (PR) + Claude.ai (tro mod krav-dok)                                                         | commit/PR; Mathias design-bekræfter (hvad-niveau) |
| **B. Verificeret koblings-recon** (front-halvdel + substrat → nuværende setup pr. sti/commit)                        | Code | Codex (uafhængig verifikation)                                                                    | commit                                            |
| **C. Plan-skrivning for Pakke 1** (krav-ID → step → verificeret kobling → test; **lean form**; frosset som plan-SHA) | Code | —                                                                                                 | plan-SHA                                          |
| **D. Uafhængig validering**                                                                                          | —    | Codex teknisk review (dispositioner) + Claude.ai krav-troskab, begge SHA-bundet → iterér til grøn | plan-SHA                                          |
| **E. Mathias-gate**                                                                                                  | —    | fire-aktør-godkendelse på samme plan-SHA                                                          | færdig, valideret Pakke-1-plan                    |

Pakke 2's plan kører derefter trin A–E **igennem den byggede front-halvdel**, ikke i hånden — det er testen.

## Roller og gates

- **Code skriver** (builder/teknisk planforfatter): konsolidering, koblings-recon, plan.
- **Codex reviewer uafhængigt** på hvert committet artefakt i frisk kontekst; dispositioner i hånden (`BLOCKER/FIX-NOW/FOLLOW-UP/FALSE-POSITIVE-WITH-EVIDENCE/MATHIAS-GATE`). Den der skriver, reviewer ikke selv.
- **Claude.ai** ved trin A (fundament tro mod krav-dok) og trin D (**krav-troskab** — plan sætning-for-sætning mod krav-dok → PASS/FEEDBACK).
- **Mathias' gates:** `krav OK` (prærekvisit) · design-bekræftelse (trin A) · plan-hvad-gate (trin E). Holdes ude af det mekaniske.

## Hvad planen kobler til — verificeret (sti/commit), ikke antaget

Regel: **hver kobling citerer sti/commit**; koblings-recon (trin B) verificeres uafhængigt af Codex. Allerede verificerede ankre (denne session):

- CI: `.github/workflows/{ci.yml, migrations-deploy.yml, pr-drift-warning.yml}`.
- Gates: `governance:check`, `fitness(:selftest)`, `migration:check`, `kaede:selftest`, `db:test` (`package.json`).
- Owner/protection: `.github/CODEOWNERS` (default `@mgrubak`); branch-protection (bot-token 403 → admin kun på eksplicit Mathias-mandat).
- Code's hook-flade: PreToolUse i `~/.claude/settings.json`.
- Eksisterende kæde (kun inspiration): `scripts/kaede/*` — planen afgør genbrug vs. erstatning, citeret pr. sti.

## Hvor tungt-vs-lean-valget lander (nu empirisk)

Splittet gør valget empirisk i stedet for et forhånds-spike: **byg Pakke 1 lean**; friktionen ved at producere Plan 2 igennem front-halvdelen ER målingen. Knækker en overgang reelt under Plan-2-produktionen, hærder vi netop den overgang — bevist, ikke valgt. Den fulde e2e-bekræftelse er trin 5 (første rigtige pakke).

## Konvergens-mekanisme + åbne punkter

**Sådan bliver vi enige:** Codex reviewer dette committede forslag, foreslår amendments på PR'en (samme cross-review-primitiv vi vil bruge i workflowet), vi lukker punkterne nedenfor → fælles forslag → Mathias afgør.

**Forventet enighed:** to-plan-splittet ved GATE 2, meta-princippet, trin A–E, rolle-/gate-fordelingen, lean-start + empirisk hærdning, alt låst via PR i egne worktrees.

**Åbne punkter at lukke (valg, ikke uenigheder):**

1. **Hvem drafter konsolideringen (trin A):** Code (builder) med Codex uafhængig review — eller co-author. Forslag: Code drafter.
2. **Substrat-snittet:** præcis hvilke delte dele der hører i Pakke 1 vs. kan vente til Pakke 2 (forslag: alt cross-review/ledger/worklog/CI-gate-substrat i Pakke 1, da front-halvdelen ikke kan validere uden det).

Intet i dette modsiger kontrakten; den ene kontrakt-binding jeg flager er prærekvisitten (`krav OK` før planlægning).
