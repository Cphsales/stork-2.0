# Plan — Pakke 1 (front-halvdel: åbning → godkendt plan)

**Pakke:** workflow-færdiggørelse · **Del:** Pakke 1 af 2 (front-halvdel; bag-halvdel = Pakke 2) · **Forfatter:** Code · **Dato:** 2026-06-17
**Status:** UDKAST (trin A) — afventer trin C (Codex teknisk review + Claude.ai krav-troskab, SHA-bundet) → trin D (Mathias plan-gate). Frosset som plan-SHA ved trin C.
**Grundlag:** krav-dok `c964826` (krav OK givet) · koblings-recon PR #166 `@2edb290` (Codex PASS) · konvergeret proces PR #164 · begge finalbud (Code #162, Codex #163) som ramme (krav 11).
**Form:** lean (konvergeret akse: hærd overgange med genererede/tjekkede kontrakter, lean kerne).

## Formål (plan-præmis / fælles rygrad)

Pakke 1 bygger den del af workflowet der **kan producere en godkendt plan**: åbning → recon → kravspec → plan → fire-aktør plan-godkendelse (GATE ved plan OK). Det løser bootstrap-problemet — derefter produceres Pakke 2's plan IGENNEM denne front-halvdel (acceptance-test). Plan-præmissen er de to finalbud + de tre styrende docs (krav 11); ingen separat langlivet fundament-doc.

## Krav-ID-dækning (de 11 krav → Pakke 1 / Pakke 2)

Stabile krav-ID'er `K1`–`K11` = krav-dokkets nummererede krav (NET-NEW jf. recon #4; etableres her).

| Krav                               | Pakke 1 leverer                                                                | Test                                               | Udskudt til Pakke 2       |
| ---------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------- | ------------------------- |
| K1 Funktioner bygges grundigt      | front-halvdelens funktioner bygges + testes (ikke kun papir)                   | hver komponent har egen test (nedenfor)            | bag-halvdelens funktioner |
| K2 Kæden hænger sammen             | krav=plan-leddet (krav-ID-tråd spec→plan→test)                                 | krav-ID coverage-gate (S4)                         | plan=slut-leddet          |
| K3 Fejl fanges løbende             | front-halvdelens fejl-fangst: coverage-gate, drift-gate, plan-review, hooks/CI | hver gate har FAIL-test                            | build-tids fejl-fangst    |
| K4 Recon før krav/plan             | recon-step + recon-format + **kode-recon-før-plan-rækkefølge**                 | denne pakkes egen koblings-recon (#166) er beviset | —                         |
| K5 Fire-aktør (Mathias sidst)      | krav-godkendelse + plan-godkendelse (4 aktører, Mathias sidst)                 | S7 plan-SHA-binding-test                           | slut-godkendelse          |
| K6 Mathias' bord + recon-format    | recon præsenteret i 3 kategorier; kun hvad-spørgsmål til Mathias               | S5 recon-format-output-test                        | —                         |
| K7 Roller (2 typer, prompt-styret) | rolle-aktivering for front-halvdelens roller                                   | rolle-skift-test (S2)                              | —                         |
| K8 Docs rent                       | `workflow/`-regelflade + governance for den + ingen dubletter                  | governance-check grøn på nye stier (S1)            | —                         |
| K9 Flow og gates                   | åbning → krav OK → plan OK (front-gates)                                       | S12 e2e åbning→godkendt plan                       | build OK + slut           |
| K10 Master-plan styrer             | master-plan-kobling (ændring kræver Mathias)                                   | doc-currency-tjek                                  | —                         |
| K11 Rammen (2 bud + 3 docs)        | plan-præmissen ER de to bud + tre docs                                         | opfyldt ved konstruktion                           | —                         |

## Verificerede koblinger (fra recon #166 — REUSE/EXTEND/NET-NEW)

REUSE: PR/blob-handoff (git/gh), worktree-isolation, CI/governance-skelet. EXTEND: plan-SHA-binding (2→4 aktører), gate-ord-flade, plan-review (lokal-fil → committed-PR). NET-NEW: rule-snapshot, scale-mekanik, krav-ID + coverage-gate, recon-format, worklog+drift-gate, dispositioner, kæde-uafhængig e2e. (Detaljer + sti/commit: PR #166.)

## Implementerings-steps (front-halvdel)

Hver step: **hvad · kobling (recon-klasse) · test · krav-ID**. Rækkefølge er afhængigheds-ordnet (S1 først).

- **S1 — `workflow/`-regelflade + rule-snapshot + governance-allowlist** · NET-NEW (kobling: governance-check). Opret regel-flade (under docs) der bærer rolle-instrukser, gate-defs, spec-skema; rule-snapshot = git-SHA af regel-fladen pr. pakke; **udvid `governance-check` allowlist samtidigt** så nye stier ikke fejler dead-doc-paths (lært af #166). · Test: governance-check grøn på de nye stier + rule-snapshot-mismatch → BLOKERET. · K8, K3.
- **S2 — Rolle-aktivering (2 rolle-typer, prompt-styret)** · EXTEND (kobling: custom-agents/skills/permission-mode). Front-halvdelens roller (Code/Codex/Claude.ai workflow- vs. almindelig-rolle), skiftbar via simpel prompt (krav 7). · Test: rolle-skift giver kontrakt-output vs. dialog (jf. §8C). · K7.
- **S3 — Author-verificeret åbning** · INSPIRATION/EXTEND (kobling: dirigent author-check, l.104). Front-halvdelens egen åbning (ikke afhængig af gammel kæde): author-verificeret start-ord. · Test: forkert author → IGNORER; rigtig author → ÅBNET. · K9.
- **S4 — Scale-livscyklus (provisional → signal → lock)** · NET-NEW. Mål scope ved åbning; recon giver signal; plan låser; ruter **dybde**, ikke gulvet. · Test: §8F/§8N (recon-mismatch → re-route; gulv ufravigeligt). · K9, (sikkerheds-gulv).
- **S5 — Recon-step + recon-format (krav 6)** · EXTEND recon + NET-NEW format. Recon producerer 3-kategori-output (nuværende kode / ikke-bygget / intet-data) til Mathias. **Kode-recon FØR plan** (krav 4). · Test: recon-syntese blokerer uden alle kilder; format-output matcher 3 kategorier. · K4, K6.
- **S6 — Kravspec: stabile krav-ID'er + hash + coverage-gate** · krav-ID NET-NEW, hash REUSE-princip (kobling: kaede-regler hash-match). Kravspec får `K-<n>` + acceptkriterie; krav-hash bindes; coverage-gate: umappet krav-ID → FAIL. · Test: §8E (umappet → BLOKERET). · K2, K3.
- **S7 — Plan-SHA 4-aktør-binding** · EXTEND (kobling: kaede-regler 2-aktør-binding) + eksplicit status-check. Alle fire godkendelser navngiver samme plan-SHA; stale → afvist; **Mathias sidst** (krav 5). NB (recon-BLOCKER): 4-aktør kan ikke bæres af branch-protection+CODEOWNERS alene → bygges som eksplicit status-check; _required på GitHub_ kræver **Mathias/admin-protection-opsætning** (flagges som beslutning, ikke antaget). · Test: §8O (stale-SHA → BLOKERET). · K5.
- **S8 — Worklog/ledger v1 + drift-gate** · NET-NEW drift-gate; EXTEND observations-mønster (kobling: tilstand.mjs read-only reader). Worklog = **v1 af den blivende struktur** (forward-kompat, Codex' krav): `schemaVersion` fra start; stabile felter `packageId/krav-ID/scale-*/planSha/gate-state/artefakt-ref`; Pakke 2 udvider additivt, omskriver ikke; mekaniske felter genereres fra git + drift-tjekkes. · Test: §8M (worklog≠git → DRIFT BLOKERET). · K3, (én sandhed K8).
- **S9 — Plan-review på committet PR + dispositioner** · EXTEND/INSPIRATION (kobling: codex-review.sh — men lokal-fil; bygges til committed-PR) + NET-NEW dispositioner. Review kører på **fetched PR/head-blob** (ikke working tree); hvert fund får disposition `BLOCKER/FIX-NOW/FOLLOW-UP/FALSE-POSITIVE-WITH-EVIDENCE/MATHIAS-GATE`; loop bundet (max runder → eskalér). · Test: §8P (FOLLOW-UP lukker, udisponeret blokerer) + §8L (bundet loop). · K3, K5.
- **S10 — Gate-ord-afstemning** · EXTEND + afstemning #1. Eksterne gate-ord = Mathias' ord `krav OK / plan OK` (front-halvdel; `build OK` + `slut OK` er Pakke 2) → mappes til interne states. · Test: gate-ord-mapping-test. · K9.
- **S11 — Hooks/CI for front-halvdelens artefakter** · EXTEND-skelet (kobling: ci.yml governance-job + PreToolUse). Tilføj checks for rule-snapshot, krav-ID-coverage, worklog-drift til CI/hooks. · Test: hver check FAIL-test i CI. · K3, K8.
- **S12 — Kæde-uafhængig e2e: åbning → godkendt plan** · NET-NEW (kobling: ingen; bevidst kæde-uafhængig per PR #164). E2e der kører hele front-halvdelen på en syntetisk pakke uden kæde-selftest-afhængighed. · Test: e2e grøn = front-halvdelen bærer en plans tilblivelse uden manuel improvisation. · K1, K9.

## End-to-end-test-design (acceptance for Pakke 1)

Front-halvdelens e2e (S12), **kæde-uafhængig**: syntetisk pakke kører åbning(S3) → scale(S4) → recon+format(S5) → kravspec+coverage(S6) → plan + plan-SHA + 4-aktør(S7) → plan OK. Grøn e2e = front-halvdelen kan producere en godkendt plan uden hånd-syning af et artefakt workflowet selv skal drive (acceptkriteriet, PR #164). **Den endelige acceptance er Plan 2 produceret gennem denne front-halvdel** (ægte opgave).

## Implementerings-rækkefølge (afhængigheds-ordnet)

S1 (regel-flade+governance) → S2 (roller) → S8 (worklog v1, da flere steps skriver til den) → S3 (åbning) → S4 (scale) → S5 (recon) → S6 (kravspec+coverage) → S7 (plan-SHA-binding) → S9 (plan-review+dispositioner) → S10 (gate-ord) → S11 (hooks/CI) → S12 (e2e samler det hele).

## IKKE i Pakke 1 (→ Pakke 2)

batch-build, build-PR cross-review, slutrapport-generator, fuld arkiv/oprydnings-automatik, build OK + slut OK-gates, fuld production-impl, multi-schema ledger (kun hvis Plan-2-produktionen beviser behovet).

## Afstemninger (lukket)

1. **Gate-navne (S10):** Mathias' ord `krav OK / plan OK` som eksterne gates (front-halvdel), mappet til interne states. `build OK`/`slut` = Pakke 2.
2. **Recon-format (S5):** krav 6's tre kategorier som konkret output.

## Doc-currency

- Krav-dok `c964826` (krav OK) — current. Koblings-recon `@2edb290` (Codex PASS) — current.
- Status-flip-bogføring på krav-dokket (main siger stadig UDKAST) — separat lille PR; blokerer ikke denne plan.
- Ingen intent-ændring mod vision/forretning (krav 11 + IKKE-i-scope).
