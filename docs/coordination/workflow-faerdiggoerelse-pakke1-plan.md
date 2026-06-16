# Plan — Pakke 1 (front-halvdel: åbning → godkendt plan)

**Pakke:** workflow-færdiggørelse · **Del:** Pakke 1 af 2 (front-halvdel; bag-halvdel = Pakke 2) · **Forfatter:** Code · **Dato:** 2026-06-17
**Status:** v2 (trin A) — Codex' trin-C-FEEDBACK adresseret; re-request review. Frosset som plan-SHA; trin C (Codex review + Claude.ai krav-troskab, SHA-bundet) → trin D (Mathias plan-gate, sidst krav 5).
**Grundlag:** krav-dok `c964826` (krav OK) · koblings-recon PR #166 `@2edb290` (Codex PASS) · proces PR #164 · finalbud Code #162 + Codex #163 (ramme, krav 11).
**Form:** lean. Test-referencer `#162 §8X` = terminal-testet mekanisme i Code-buddet (PR #162, §8), gengivet lokalt pr. step.

## Formål (plan-præmis)

Pakke 1 bygger den del af workflowet der **kan producere en godkendt plan**: åbning → recon → kravspec → **krav-gate** → plan → **plan-gate**. Bootstrap: Plan 2 produceres derefter gennem front-halvdelen (acceptance). Plan-præmis = de to finalbud + de tre styrende docs (krav 11); ingen separat fundament-doc.

## Krav-ID-dækning (K1–K11 → Pakke 1 / Pakke 2)

`K1`–`K11` = krav-dokkets nummererede krav (stabile ID'er etableres her, S7).

| Krav                            | Pakke 1 leverer                                          | Step          | Test                                                | Udskudt → Pakke 2 |
| ------------------------------- | -------------------------------------------------------- | ------------- | --------------------------------------------------- | ----------------- |
| K1 grundigt                     | front-funktioner bygges+testes                           | alle          | hver komponent har egen test                        | bag-funktioner    |
| K2 kæden hænger                 | krav=plan-led (krav-ID-tråd spec→plan→test)              | S7,S9         | coverage-gate (S7)                                  | plan=slut-led     |
| K3 fejl løbende                 | coverage-gate, drift-gate, plan-review, hooks/CI         | S7,S3,S10,S13 | hver gate FAIL-test                                 | build-tids fangst |
| K4 recon før krav/plan          | recon-step + format + recon-før-plan                     | S6            | denne pakkes koblings-recon #166                    | —                 |
| K5 fire-aktør (Mathias sidst)   | **krav-gate** + **plan-gate** (4 aktører, Mathias sidst) | **S8, S9**    | S8 krav-gate-test + S9 plan-SHA-test                | slut-gate         |
| K6 Mathias' bord + recon-format | recon i 3 kategorier; kun hvad til Mathias               | S6            | recon-format-output-test                            | —                 |
| K7 roller (2 typer)             | rolle-aktivering for front-roller                        | S2            | rolle-skift kontrakt-vs-dialog                      | —                 |
| K8 docs rent                    | `workflow/`-regelflade + governance + ingen dubletter    | S1            | governance-check grøn på nye stier                  | —                 |
| K9 flow og gates                | åbning → krav OK → plan OK                               | S4,S8,S9      | S14 e2e                                             | build OK + slut   |
| K10 master-plan styrer          | **master-plan-snapshot + ændrings-/modsigelses-gate**    | **S1, S11**   | S11 master-plan-ændret-siden-krav-OK → Mathias-gate | —                 |
| K11 rammen (2 bud + 3 docs)     | plan-præmissen ER de to bud + tre docs                   | —             | opfyldt ved konstruktion                            | —                 |

## Verificerede koblinger (fra recon #166)

REUSE: PR/blob-handoff, worktree-isolation, CI/governance-skelet. EXTEND: plan-SHA-binding (2→4 aktører), gate-ord, plan-review (lokal-fil → committed-PR). NET-NEW: rule-snapshot, scale, krav-ID + coverage-gate, krav-gate, recon-format, worklog+drift-gate, dispositioner, master-plan-gate, kæde-uafhængig e2e, rolle-aktivering. (Sti/commit: PR #166.)

## Implementerings-steps (afhængigheds-ordnet)

Hver: **hvad · kobling (klasse) · test · krav-ID**.

- **S1 — `workflow/`-regelflade + rule-snapshot + master-plan-snapshot + governance-allowlist** · NET-NEW (kobling: governance-check #166-2). Regel-flade (under docs) m. rolle-instrukser, gate-defs, spec-skema; rule-snapshot = git-SHA af regel-flade pr. pakke; **master-plan-SHA fanges i samme snapshot** (K10); udvid `governance-check`-allowlist samtidigt (lært af #166). · Test: governance-check grøn på nye stier; snapshot-mismatch → BLOKERET (#162 §8A-mønster). · K8, K10, K3.
- **S2 — Rolle-aktivering (2 rolle-typer, prompt-styret)** · **NET-NEW** (kobling: S1's regel-flade — rolle-instrukser som workflow-docs). Rolle-type-primitiverne (`--agents`/`--agent` kontrakt-output, `--permission-mode`/cycleMode, skills-dispatch) er **produkt-features bevist live i #162 §8C/§5**, ikke repo-koblinger; selve rolle-aktiveringen bygges frisk på S1. · Test: rolle-skift giver kontrakt-output vs. dialog (#162 §8C). · K7.
- **S3 — Worklog/ledger v1 + drift-gate** · NET-NEW drift-gate; EXTEND observations-mønster (kobling: `tilstand.mjs` read-only reader #166-7). v1 af **blivende** struktur (forward-kompat): `schemaVersion` fra start; stabile felter `packageId/krav-ID/scale-*/kravHash/planSha/gate-state/artefakt-ref`; Pakke 2 udvider additivt; mekaniske felter genereres fra git + drift-tjekkes. · Test: worklog≠git → DRIFT BLOKERET (#162 §8M). · K3, K8.
- **S4 — Author-verificeret åbning** · INSPIRATION/EXTEND (kobling: dirigent author-check l.104 #166-1). Front-halvdelens egen åbning: author-verificeret start-ord. · Test: forkert author → IGNORER; rigtig → ÅBNET. · K9.
- **S5 — Scale-livscyklus (provisional → signal → lock)** · NET-NEW. Ruter dybde, ikke gulvet; recon-mismatch → re-route. · Test: 1→DIRECT/9→DELEGATED; recon=7≠prov → re-route; sensitive → fuld cross-review (#162 §8F/§8N/§8K). · K9.
- **S6 — Recon-step + recon-format (krav 6)** · EXTEND recon + NET-NEW format. 3-kategori-output (nuværende kode / ikke-bygget / intet-data); kode-recon FØR plan (krav 4). · Test: syntese blokerer uden alle kilder; output = 3 kategorier. · K4, K6.
- **S7 — Kravspec: stabile krav-ID'er + hash + coverage-gate** · krav-ID NET-NEW; hash REUSE-princip (kobling: kaede-regler hash-match #166-4). `K-<n>` + acceptkriterie; krav-hash bindes; coverage-gate: umappet krav-ID → FAIL. · Test: umappet ID → BLOKERET (#162 §8E). · K2, K3.
- **S8 — KRAV-GATE: fire-aktør på krav-hash (Mathias sidst)** · NET-NEW (kobling: S3-worklog + S7-hash). Tre AI-valideringer (Claude.ai krav-troskab + Code byggelighed + Codex realiserbarhed) bundet til **samme krav-hash**, derefter Mathias `krav OK <hash>` **sidst** (krav 5); stale/hash-mismatch → BLOKERET. **Plan kan ikke skrives/låses før krav-gaten er ren.** · Test: hash-mismatch → BLOKERET; plan-start før ren krav-gate → BLOKERET (S14 e2e). · K5, K9, K2.
- **S9 — PLAN-GATE: plan-SHA fire-aktør-binding** · EXTEND (kobling: kaede-regler 2-aktør #166-6) + eksplicit status-check. Fire godkendelser navngiver samme plan-SHA; stale → afvist; Mathias sidst. NB (recon-BLOCKER): kan ikke bæres af branch-protection+CODEOWNERS alene → eksplicit status-check; _required på GitHub_ kræver **Mathias/admin-protection-opsætning** (beslutning, ikke antaget). · Test: stale-SHA → BLOKERET (#162 §8O). · K5, K9.
- **S10 — Plan-review på committet PR + dispositioner** · EXTEND/INSPIRATION (kobling: codex-review.sh lokal-fil → committed-PR #166-10) + NET-NEW dispositioner. Review på **fetched PR/head-blob**; disposition pr. fund (`BLOCKER/FIX-NOW/FOLLOW-UP/FALSE-POSITIVE-WITH-EVIDENCE/MATHIAS-GATE`); loop bundet. · Test: FOLLOW-UP lukker / udisponeret blokerer (#162 §8P); bundet loop (#162 §8L). · K3, K5.
- **S11 — Master-plan-konsistens-gate** · NET-NEW (kobling: S1 master-plan-snapshot). Tjek om master-plan er ændret siden krav OK, og om planen modsiger master-plan → **Mathias-gate** (krav 10: ændring/modsigelse kræver Mathias). · Test: master-plan-ændret-siden-krav-OK → Mathias-gate; plan modsiger master-plan → Mathias-gate. · K10.
- **S12 — Gate-ord-afstemning** · EXTEND + afstemning #1. Eksterne gate-ord = Mathias' `krav OK / plan OK` (front; `build OK`/`slut OK` = Pakke 2) → interne states. · Test: gate-ord-mapping. · K9.
- **S13 — Hooks/CI for front-artefakter** · EXTEND-skelet (kobling: ci.yml governance-job + PreToolUse #166-12). Checks for rule-snapshot, krav-ID-coverage, worklog-drift, master-plan-konsistens i CI/hooks. · Test: hver check FAIL-test i CI (#162 §8A). · K3, K8.
- **S14 — Kæde-uafhængig e2e: åbning → godkendt plan** · NET-NEW (bevidst kæde-uafhængig, PR #164). Kører hele front-halvdelen på syntetisk pakke: åbning(S4) → scale(S5) → recon(S6) → kravspec(S7) → **krav-gate(S8)** → plan + plan-gate(S9) → plan OK. **Verificerer eksplicit at plan ikke kan låses før krav-gaten er ren.** · Test: e2e grøn = front-halvdelen bærer en plans tilblivelse uden manuel improvisation. · K1, K9.

## End-to-end-test-design (acceptance)

S14, kæde-uafhængig: åbning → scale → recon+format → kravspec+coverage → **krav-gate (4-aktør, Mathias sidst)** → plan + plan-SHA (4-aktør) → plan OK. Grøn = front-halvdelen producerer en godkendt plan uden hånd-syning, OG plan kan ikke låses før krav-gaten er ren. Endelig acceptance: Plan 2 produceret gennem front-halvdelen.

## Implementerings-rækkefølge

S1 → S2 → S3 (worklog tidligt; flere steps skriver) → S4 → S5 → S6 → S7 → **S8 (krav-gate)** → S9 (plan-gate) → S10 → S11 → S12 → S13 → S14 (samler).

## IKKE i Pakke 1 (→ Pakke 2)

batch-build, build-PR cross-review, slutrapport-generator, arkiv/oprydnings-automatik, `build OK` + `slut OK`-gates, slut-godkendelse (K5/K9-slut-del), fuld production-impl, multi-schema ledger (kun hvis Plan-2 beviser behovet).

## Afstemninger (lukket)

1. Gate-navne (S12): `krav OK / plan OK` eksterne (front), mappet til interne states. 2. Recon-format (S6): krav 6's tre kategorier.

## Lukkede dispositioner (Codex trin-C-FEEDBACK)

- **K5/K9 (BLOCKER):** ny **S8 krav-gate** (4-aktør på krav-hash, Mathias sidst); e2e tester plan-lås-blokeret-før-ren-krav-gate. ✓
- **S2 (BLOCKER):** reklassificeret EXTEND → **NET-NEW** båret af S1; rolle-primitiver er #162-beviste produkt-features, ikke repo-koblinger. ✓
- **K10 (FIX-NOW):** bundet til **S1 (master-plan-snapshot) + S11 (konsistens-gate)** med test. ✓
- **FOLLOW-UP:** test-referencer gjort selvbærende (`#162 §8X` + lokal beskrivelse pr. step). ✓

## Doc-currency

Krav-dok `c964826` (krav OK) + koblings-recon `@2edb290` (Codex PASS) — current. Status-flip-bogføring på krav-dok (main siger UDKAST) — separat lille PR; blokerer ikke. Ingen intent-ændring mod vision/forretning.
