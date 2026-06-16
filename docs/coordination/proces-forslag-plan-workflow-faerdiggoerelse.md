# Proces-forslag: hvordan vi laver planen (Code's forslag til fælles proces)

**Type:** Forslag til HVORDAN planen laves — ikke planen selv · **Forfatter:** Code (`stork-code-bot`) · **Dato:** 2026-06-16
**Status:** Codes halvdel af ét fælles forslag. **Codex har endnu ikke publiceret sit** (verificeret: ingen commit/fil/branch) — så dette er grundlaget, ikke en konvergeret konsensus. Codex reviewer + amender på dette committede artefakt → fælles forslag → Mathias afgør.
**Kontrakt:** `docs/coordination/workflow-faerdiggoerelse-krav-og-data.md`.

## Meta-princip — hvorfor hånd-processen ikke er lovløs

Vi har ikke det automatiserede workflow (det er det vi bygger), men vi har dets **beviste primitiver**, alle terminal-testede denne session og **uafhængigt af kæden**: committet-PR cross-review, krav-ID-dækning, plan-SHA-binding, evidens-gate, isolerede worktrees, hooks, drift-gate. Planen laves **i hånden med disse primitiver** — disciplinen er der, kun orkestreringen mangler.

## Prærekvisit (FLAG, kontrakt)

Krav-dokket er `Status: UDKAST — krav OK ikke givet`. Kontrakten + begge buds GATE 1 siger intet planlægges uden et krav-OK'd krav-dok bag. → **Mathias giver `krav OK <hash>` (eller bekræfter krav-dokket som bindende) FØR planlægning.** Ellers planlægger vi mod en ulåst spec. Det er Mathias' ord at give.

## Trinene fra nu til en færdig, valideret plan

| Trin                                                                                                | Hvad | Skriver                                                                                           | Uafhængig review                                  | Lås |
| --------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------- | --- |
| **1. Konsolidér de to bud → ét fundament-doc** (den aftalte løsning: Codex' form + Codes carry-ins) | Code | Codex (PR) + Claude.ai (tro mod krav-dok)                                                         | commit/PR; Mathias design-bekræfter (hvad-niveau) |
| **2. Verificeret koblings-recon** (fundament → nuværende setup pr. sti/commit)                      | Code | Codex (uafhængig verifikation)                                                                    | commit                                            |
| **3. e2e-dry-run decision-spike** (afgør tungt-vs-lean med evidens; kæde-uafhængig harness)         | Code | Codex (PR)                                                                                        | commit                                            |
| **4. Plan-skrivning** (krav-ID → step → verificeret kobling → test; frosset som plan-SHA)           | Code | —                                                                                                 | plan-SHA                                          |
| **5. Uafhængig validering**                                                                         | —    | Codex teknisk review (dispositioner) + Claude.ai krav-troskab, begge SHA-bundet → iterér til grøn | plan-SHA                                          |
| **6. Mathias-gate**                                                                                 | —    | fire-aktør-godkendelse på samme plan-SHA                                                          | færdig, valideret plan                            |

## Roller og gates

- **Code skriver** (builder/teknisk planforfatter): konsolidering, koblings-recon, spike, plan.
- **Codex reviewer uafhængigt** på hvert committet artefakt i frisk kontekst; dispositioner anvendt i hånden (`BLOCKER/FIX-NOW/FOLLOW-UP/FALSE-POSITIVE-WITH-EVIDENCE/MATHIAS-GATE`). Strukturel uafhængighed: den der skriver, reviewer ikke selv.
- **Claude.ai** kobles ind ved trin 1 (fundament tro mod krav-dok) og trin 5 (**krav-troskab** — plan sætning-for-sætning mod krav-dok → PASS/FEEDBACK).
- **Mathias' gates:** `krav OK` (prærekvisit) · design-bekræftelse (trin 1) · plan-hvad-gate (trin 6). Holdes ude af det mekaniske (recon, koblings-verifikation, review-retry).

## Hvad planen kobler til — verificeret (sti/commit), ikke antaget

Regel: **hver kobling i planen citerer sti/commit**; koblings-recon (trin 2) verificeres uafhængigt af Codex. Allerede verificerede ankre (denne session):

- CI: `.github/workflows/{ci.yml, migrations-deploy.yml, pr-drift-warning.yml}`.
- Gates: `governance:check`, `fitness(:selftest)`, `migration:check`, `kaede:selftest`, `db:test` (`package.json`).
- Owner/protection: `.github/CODEOWNERS` (default `@mgrubak`); branch-protection (bot-token 403 → admin kun på eksplicit Mathias-mandat).
- Code's hook-flade: PreToolUse i `~/.claude/settings.json`.
- Eksisterende kæde (kun inspiration): `scripts/kaede/*` — planen afgør genbrug vs. erstatning, citeret pr. sti.

## Hvor tungt-vs-lean-valget og e2e-dry-run'en lander

De er samme ting: den åbne kontrakt-lag-uenighed afgøres **ikke af argument, men af e2e-dry-run'en** (begge buds udestående bevis). Trin 3 = decision-spike FØR planen finaliseres: kør lean-formen vs. den to-schema-form mod en syntetisk pakke (krav→plan→build-PR→review→slut); mål (a) friktion på en Small-pakke og (b) om schema-migration kan flytte en kørende pakke rent. Resultatet vælger formen. Samme dry-run bliver derefter workflowets stående accept-gate.

## Konvergens-mekanisme + de åbne punkter

**Sådan bliver vi enige:** Codex reviewer dette committede forslag, foreslår amendments på PR'en (samme cross-review-primitiv vi vil bruge i selve workflowet), vi lukker de to åbne punkter nedenfor, og det bliver det fælles forslag Mathias tager stilling til.

**Forventet enighed** (givet konvergensen): meta-princippet, trin-rækken, rolle-/gate-fordelingen, at dry-run'en afgør kontrakt-laget, og at alt låses via PR i egne worktrees (clobber-disciplinen).

**To åbne punkter at lukke (valg, ikke uenigheder):**

1. **Hvem drafter konsolideringen (trin 1):** Code (builder, implementerer) med Codex uafhængig review — eller co-author. Forslag: Code drafter.
2. **Spike-først vs. plan-med-flag:** kør dry-run (trin 3) FØR plan-finalisering så planen hviler på afgjort grund — eller skriv planen med kontrakt-laget som flagget åbent valg og kør spiken som planens første build-step. Forslag: spike-først.

Intet i dette modsiger kontrakten; den ene kontrakt-binding jeg flager er prærekvisitten (`krav OK` skal gives før planlægning).
