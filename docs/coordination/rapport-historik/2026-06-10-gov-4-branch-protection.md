# gov-4-branch-protection — Slut-rapport

**Dato:** 2026-06-10 · **Branch:** claude/gov-4-branch-protection-build + claude/gov-4-step5 · **Merge-commit:** _(udfyldes ved merge)_
**Krav-dok:** docs/coordination/arkiv/gov-4-branch-protection-krav-og-data.md · **Plan:** docs/coordination/arkiv/gov-4-branch-protection-plan.md (V5, Codex-approved runde 5)

## Formål (genfremlagt fra krav-dok)

> Denne pakke leverer: bindende gates på main — required CI-checks og required
> code-owner-review — så intet kan merges uden om processen, med
> approval-mekanikken (H026) løst før required review aktiveres.

## Leverancer (mod krav-dok §I scope)

| #   | Krav-dok-leverance              | Status | Evidens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | ------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Required status checks på main  | ✓      | `Lint, typecheck, test, build` (strict) aktiv — API-verificeret; required check bed første gang på PR #110                                                                                                                                                                                                                                                                                                                                                                                        |
| 2   | Required code-owner-review (≥1) | ✓      | `count=1` + `require_code_owner_reviews=true` aktiv (step 4, API-verificeret) — aktiveret EFTER H026-bevis, som krævet                                                                                                                                                                                                                                                                                                                                                                            |
| 3   | H026 løst FØRST                 | ✓      | Tre-konto-struktur (qwerg-revideret af Mathias, §1-suverænitet): fælles login urørt/kun protection-API · `@mgrubak` = code owner/approver · `stork-code-bot` = committer (PAT: contents+PR RW, ALDRIG admin). R4-1-assert bestået. Bevis i to lag: PR #110 (bot-author, merged AF mgrubak — men UDEN formel approval; API: reviews=[], count-kravet var endnu 0, fund R8-1) + **PR #112 = det fulde bevis: første PR der SKAL have mgrubak-approval under aktiv gate — bekræftes ved dens merge** |
| 4   | CODEOWNERS virker               | ✓      | Alle 5 regler → `@mgrubak`; `codeowners/errors`: 5 "Unknown owner" → **0** (verificeret på branch + main)                                                                                                                                                                                                                                                                                                                                                                                         |
| +   | G061 (deadline "før gov-4")     | ✓      | Migration `20260610190000_gov4_g061_comment_paritet.sql` — 2 comment-mål 1:1 (live-dump før: begge `null`); live ved merge-deploy; G061 → LØST                                                                                                                                                                                                                                                                                                                                                    |

## Verifikations-protokol (§3.6-erstatning — rå outputs)

| Case                                    | Resultat                                                                                                                                                                                                                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (a) direkte push til main               | AFVIST — "protected branch hook declined" (observeret 2026-06-10, før pakken)                                                                                                                                                                                                                           |
| (b) PR med rød CI → merge blokeret      | Required check aktiv (API: strict + contexts). Ærlig note: ikke fremprovokeret med bevidst fejl-commit; enforcement-laget er identisk med (c)'s `mergeStateStatus`-mekanisme                                                                                                                            |
| (c) bot-PR uden mgrubak-approval        | **BLOCKED + REVIEW_REQUIRED** (test-PR #111, lukket uden merge)                                                                                                                                                                                                                                         |
| (d) bot-PR + mgrubak-approval + grøn CI | **PR #112 selv** — første PR under fuld gate; (c)-beviset (#111 BLOCKED) viser kravet bider; (d) bekræftes empirisk ved #112's approval+merge og merge-hash-fixup noterer det. (#110 var bot-authored og merged af mgrubak, men FØR step 4 og uden formel approval — utilstrækkelig som (d), fund R8-1) |
| (e) codeowners/errors                   | **0** på main (5 før fixet)                                                                                                                                                                                                                                                                             |

## Stork-invariant-tjek

| Invariant              | Status | Evidens                                                                                                                                             |
| ---------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vision-overholdelse    | ✓      | Princip 1 (repo↔live-paritet) styrket: G061 lukket + gates der forhindrer fremtidig drift. Rigtig løsning (identitets-adskillelse), ikke workaround |
| Permission-matrix      | N/A    | Ingen RPC'er/policies berørt                                                                                                                        |
| Audit-trigger          | N/A    | Ingen nye tabeller                                                                                                                                  |
| Konfiguration-i-data   | ✓      | Intet hardkodet introduceret                                                                                                                        |
| End-to-end-flow        | ✓      | Verifikations-protokol (a)-(e) — empirisk, ikke schema-only; G061-migrationen verificeres live ved merge-deploy                                     |
| Anonymisering-bevaring | N/A    | Ingen data berørt                                                                                                                                   |

## Plan-afvigelser

1. **qwerg-revision af H026-strukturen (Mathias, §1-suverænitet):** machine-user-planen ændret til tre-konto-struktur — det hidtidige login viste sig at være FÆLLES (bærer Stork 1.0/drift, kan ikke nedgraderes); ny personlig konto `mgrubak` blev code owner/approver; ADMIN_HANDLE eksplicit udpeget i stedet for captured. Suverænitets-reglen fulgt: gjaldt straks, kæden opdateret som konsekvens.
2. **Status-staleness (Codex runde 7-fund):** status-filen var skrevet før PAT-leverancen og ikke synkroniseret efter auth-skiftet — samme klasse som i gov-docs-renhed. Rettet; lærepunkt: status committes MED batchen, ikke før.
3. **Hook-regex-præcisering** (Mathias-valg b): stork1-låsen matcher nu kun repo-stier (handle + `/`) — Code kan skrive handle-strenge i CODEOWNERS; stork 1.0-værnet intakt (verificeret begge veje). Gennemført med transparent unlock→edit→re-lock på Mathias-mandat.

Ingen krævede gate-fil: 1 er Mathias-besluttet (suverænitet), 2-3 er tekniske inden for formål.

## G-numre rejst

Ingen rejst. G061 LØST. [H027] rejst (Node 20-actions → tvungen Node 24 fra 2026-06-16; required check kan blive rød = main låst — mikro-PR straks efter pakke-luk; ejer Code).

## §8.1-svar (governance-docs berørt)

Codex runde 8 svarede `§8.1-SVAR: MODSIGELSE` (fund R8-2, korrekt): disciplin.md sagde gov-4 aktiv mens forretningsforstaaelse-banneret stod i fremtidsform. **Lukket 2026-06-10:** Claude.ai-forfattet, Mathias-godkendt banner-tekst committet ordret af Code (§8.1 forfatterregel fulgt — første kørsel af reglen i praksis). Codex runde 9 re-indhentet: **INGEN-MODSIGELSE** (alle tre governance-docs prosa-konsistente om gov-4-status). (Runde 5/6/7: INGEN-MODSIGELSE.)

## Konvergens-historie (runde 8: 2 KRITISK + 1 MELLEM — R8-1 bevis-overdrivelse rettet ærligt, R8-2 banner = merge-blocker, R8-3 aktiv-plan-rester synkroniseret)

| Runde | Fase          | Fund                         | Outcome                                                       |
| ----- | ------------- | ---------------------------- | ------------------------------------------------------------- |
| 1     | plan          | 2 KRITISK + 2 MELLEM         | V2 (alle ACCEPT)                                              |
| 2     | plan          | 2 KRITISK                    | V3                                                            |
| 3     | plan          | 1 KRITISK                    | V4 (§3.4-alert, counter 4)                                    |
| 4     | plan          | 1 KRITISK                    | V5 (§3.4 AUTO-PAUSE, counter 5 — Mathias valgte (a): fortsæt) |
| 5     | plan          | **APPROVAL**                 | qwerg                                                         |
| 6     | build batch 1 | APPROVAL                     | —                                                             |
| 7     | build batch 2 | 1 KRITISK (status-staleness) | batch 2b                                                      |

## Vision-tjek

- **Rigtig løsning eller workaround?** Rigtig: identiteterne er adskilt efter ansvar (beslutning/byggeri/admin), gates er mekaniske og empirisk beviste, og review-kæden er reel — Mathias' approval er nu en faktisk handling fra en faktisk anden konto.
- **Styrkelser:** workflowets tre gates er nu GitHub-håndhævede, ikke disciplin-håndhævede. Systemet beviste sin egen leverance: PR #110 var både leverancen og beviset.
- **Lærepunkter (Code):** (1) V1's state-dump dækkede ikke GitHubs API-flade (permissions, check-navne, typed felter, handle-timing) — kostede 4 review-runder; ekstern-API-state skal dumpes med samme disciplin som DB-state. (2) Status-filen committes MED batchen. (3) Mathias-handlinger skal altid leveres klik-for-klik med valget truffet (squash/rebase-casen).
- **Konklusion:** forsvarligt. Gates fuldt bindende; 0 åbne kompromiser; H027 rejst med hård deadline.

## Step 5-gate

Mathias: **slut OK** 2026-06-10 (Claude.ai-relæ er Mathias' bord — gate-ordet er
afgivet efter banner-luk + Codex runde 9 INGEN-MODSIGELSE).

## Mathias-handlinger efter merge

1. Ingen platform-/konto-handlinger udestår — tre-konto-strukturen er fuldt aktiv.
2. Fremover: approvals fra mgrubak (browser); merges som hidtil (rebase and merge).
3. H027 (Node 24, deadline 16/6): Code leverer mikro-PR straks — kræver kun din vante approve+merge.

Batch-hashes: build 1 `fd3ce19`/`d896cae` · build 2 `041dff6` · build 2b `a64881f` · step 4 + verifikation: API-ops (ingen commits) · step 5: denne PR.
