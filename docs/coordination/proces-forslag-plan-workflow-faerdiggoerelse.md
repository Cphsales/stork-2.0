# Proces for at lave planen — Code + Codex fuldt konvergeret

**Type:** Fælles proces til HVORDAN planen laves — ikke planen selv · **Dato:** 2026-06-16
**Status:** **FULDT KONVERGERET (Code + Codex).** Codex reviewede PR #164 (`4943256`) fra origin, foreslog tre amendments + forward-kompat-krav — alle tiltrådt og indfoldet her. **Ingen åbne punkter.** Afventer Mathias' afgørelse + `krav OK`.
**Kontrakt:** `docs/coordination/workflow-faerdiggoerelse-krav-og-data.md`.

## To-plan-split (Mathias' idé; Code + Codex enige, søm ved GATE 2)

Workflowet deles ved sit naturlige søm — **GATE 2 (godkendt plan)** — i to implementerings-pakker under ÉT krav-dok (kontrakt-sanktioneret: "krav-dok forbliver ÉT dok, implementation splittes over pakker"):

- **Pakke 1 — front-halvdel:** åbning → godkendt plan. Bygges først, i hånden (mindre scope).
- **Pakke 2 — bag-halvdel:** godkendt plan → luk. **Dens plan produceres IGENNEM den byggede front-halvdel = front-halvdelens rigtige acceptance-test** (en ægte opgave, ikke en syntetisk dry-run).

Det løser bootstrap-problemet: vi mangler workflowet til at lave planen, så vi bygger først den del der kan lave planer.

## Pakke 1 bygger front-substratet (alt der kræves for at producere en godkendt Plan 2)

- author-verificeret åbning
- rule-snapshot
- scale-provisional → scale-signal → scale-lock
- krav-ID-spec + hash
- krav-ID coverage-gate
- plan-SHA-binding for fire aktører
- genereret worklog/projektion for **planfasens** mekaniske felter
- worklog-drift-gate for de felter
- PR/blob-handoff
- worktree-isolation
- plan-review på committet PR
- review-dispositioner for plan-/review-fund
- relevante hooks/CI-checks for docs/spec/plan/worklog
- e2e-test for netop åbning → godkendt plan

## Pakke 1 bygger IKKE bag-substratet endnu (→ Pakke 2)

- batch-build orchestration
- fuld per-batch build review-pakke-automatik
- slutrapport-generator fra build-evidens
- fuld archive/cleanup-automatik
- fuld production CI-gate-matrix ud over eksisterende checks
- egentlig multi-schema ledger — **kun hvis Plan-2-produktionen beviser behovet**

Kort: Pakke 1 skal have nok substrat til at validere front-halvdelen ved at lave Plan 2. Den forudbygger ikke bag-halvdelen.

## Worklog/ledger — forward-kompat (Codex' skærpelse, tiltrådt)

Plan 1's worklog/ledger er lean, men bygges som **front-halvdelens første version (v1) af samme blivende artefaktfamilie** — ikke en midlertidig fil der omskrives i Plan 2:

- `schemaVersion`/format-version fra start.
- Stabile felter: `packageId`, krav-ID'er, `scale-*`, `planSha`, gate-state, artefakt-referencer.
- Plan 2 udvider **additivt** (build-batch, review, disposition, slutrapport-felter).
- Plan 2 må **ikke** rename/omskrive Plan 1-felter.
- Breaking change kræver eksplicit rule-/schema-change gate.
- Worklog er stadig **projektion**: de mekaniske felter genereres/tjekkes (drift-gate), håndholdes ikke.

→ forward-kompat = Plan 1 laver minimal v1 af den blivende struktur; Plan 2 udvider den. Ikke to forskellige strukturer.

## Acceptance-test (hvornår Plan 1 er færdig)

Når Plan 1 er bygget og godkendt, åbnes en ny pakke ("byg workflow fra godkendt plan til slut"), og dens plan køres **gennem den byggede front-halvdel**: Mathias åbner → Code/Codex/Claude.ai recon → kravspec m. krav-ID → Plan 2 skrives → scale-lock + plan-SHA → fire godkender samme SHA.

**Kriteriet (skarpt):** _"Plan 2 kan produceres gennem front-halvdelen uden manuel improvisation, med krav-ID, scale-lock, plan-SHA og fire aktør-godkendelser."_ Dømmekraften (recon-fund, krav, plan-indhold) er stadig aktørernes; det er TRANSPORTEN/gates der skal køre uden improvisation. Hver manuel hånd-syning af et artefakt workflowet selv skal drive = et logget hul i Plan 1.

**Bevisrækken (Codex, tiltrådt):** 1) Plan 1 laves håndholdt · 2) Pakke 1 bygges · 3) Plan 2 laves gennem Pakke 1 · 4) godkendes Plan 2 rent, er front-halvdelen bevist · 5) Pakke 2 bygger bag-halvdelen · 6) første rigtige Stork-pakke gennem hele workflowet = fuld e2e-bekræftelse. To naturlige beviser i rækkefølge, ikke én uoverskuelig test.

## Meta-princip — hvorfor Pakke 1's hånd-proces ikke er lovløs

Vi har ikke det automatiserede workflow, men dets **beviste primitiver** (committet-PR cross-review, krav-ID-dækning, plan-SHA-binding, evidens-gate, isolerede worktrees, hooks, drift-gate — alle terminal-testede denne session, uafhængigt af kæden). Pakke 1's plan laves i hånden med dem; Pakke 2's plan laves igennem den byggede front-halvdel.

## Prærekvisit (FLAG, kontrakt)

Krav-dokket er `Status: UDKAST — krav OK ikke givet`. Kontrakten + begge buds GATE 1 siger intet planlægges uden et krav-OK'd krav-dok bag. → **Mathias giver `krav OK <hash>` (eller gør krav-dokket eksplicit bindende) FØR Plan 1 skrives.**

## Meta-proces for Pakke 1's plan (i hånden)

| Trin                                                                                                                                                                                                                                                                                            | Hvad | Skriver                                                                                           | Uafhængig review |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------- | ---------------- |
| **A. Plan-skrivning for Pakke 1** — formål/grundlag = **fælles plan-præmis/rygrad** der refererer begge finalbud (ingen separat langlivet konsoliderings-doc; foldes ind i Plan 1 / senere `docs/workflow/*`); krav-ID → step → verificeret kobling → test; **lean form**; frosset som plan-SHA | Code | —                                                                                                 |
| **B. Verificeret koblings-recon** — front-halvdel → nuværende setup pr. sti/commit                                                                                                                                                                                                              | Code | Codex (uafhængig verifikation)                                                                    |
| **C. Uafhængig validering**                                                                                                                                                                                                                                                                     | —    | Codex teknisk review (dispositioner) + Claude.ai krav-troskab, begge SHA-bundet → iterér til grøn |
| **D. Mathias-gate**                                                                                                                                                                                                                                                                             | —    | fire-aktør-godkendelse på samme plan-SHA → færdig, valideret Pakke-1-plan                         |

**Code drafter; Codex reviewer uafhængigt** (ikke co-author — bevarer den uafhængige reviewflade).

## Roller og gates

- **Code skriver** (builder/teknisk planforfatter): plan, koblings-recon.
- **Codex reviewer uafhængigt** på committede artefakter i frisk kontekst; dispositioner i hånden (`BLOCKER/FIX-NOW/FOLLOW-UP/FALSE-POSITIVE-WITH-EVIDENCE/MATHIAS-GATE`). Den der skriver, reviewer ikke selv.
- **Claude.ai** ved trin C: **krav-troskab** — plan sætning-for-sætning mod krav-dok → PASS/FEEDBACK.
- **Mathias' gates:** `krav OK` (prærekvisit) · plan-hvad-gate (trin D). Holdes ude af det mekaniske.

## Hvad planen kobler til — verificeret (sti/commit), ikke antaget

Regel: **hver kobling citerer sti/commit**; koblings-recon (trin B) verificeres uafhængigt af Codex. Allerede verificerede ankre (denne session):

- CI: `.github/workflows/{ci.yml, migrations-deploy.yml, pr-drift-warning.yml}`.
- Gates: `governance:check`, `fitness(:selftest)`, `migration:check`, `kaede:selftest`, `db:test` (`package.json`).
- Owner/protection: `.github/CODEOWNERS` (default `@mgrubak`); branch-protection (bot-token 403 → admin kun på eksplicit Mathias-mandat).
- Code's hook-flade: PreToolUse i `~/.claude/settings.json`.
- Eksisterende kæde (kun inspiration): `scripts/kaede/*` — planen afgør genbrug vs. erstatning, citeret pr. sti.

## Tungt-vs-lean (empirisk, ikke forhånds-spike)

Byg Pakke 1 **lean**; friktionen ved at producere Plan 2 igennem front-halvdelen ER målingen. Knækker en overgang reelt, hærder vi netop den — bevist, ikke valgt. Multi-schema ledger bygges kun hvis Plan-2-produktionen beviser behovet.

## Konvergens-status

Fuldt konvergeret mellem Code og Codex — ingen åbne punkter:

- To-plan-split ved GATE 2 · Plan 1 først · Plan 2 = acceptance-test for Plan 1.
- Front-substrat i Pakke 1, bag-substrat i Pakke 2 (præcise lister ovenfor).
- Worklog/ledger = lean v1 af blivende struktur, forward-kompat (additiv udvidelse, ingen omskrivning, breaking change kun via gate).
- Code drafter, Codex reviewer uafhængigt; ingen separat tung konsoliderings-doc.
- Skarpt acceptkriterie + bevisrække i to trin.
- Mathias' `krav OK <hash>` er prærekvisit før Plan 1 skrives.
