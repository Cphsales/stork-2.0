# Codex-P2-hærdning af gate-kernen — leverancer 2026-09-08..10 (M-41 Trin A)

Rå leverancer, prompter og kvitteringer fra Codex' red-team-pas (rolle `codex-angreb`, dom, read-only) på fabrik-mekanikken (scripts/v5). Arkiveret byte-identisk fra fabrik-armens scratchpad. `wd/`-udsnit og stderr-logs er ikke medtaget; blob-OID'erne i leverancerne binder det dømte indhold, og `scripts/v5/haerdet-register.json` peger på regel-commits.

Forløb: transport (wrapper) → gates (kerne) → runde 3-9 delta-verifikation (runde 9 = PASS for de ni .mjs) → runde 10-10h transport-hærdning efter CLI-opdateringen 0.153→0.154 (F-3b native-pin · F-3c privat CODEX_HOME + allowlist-env · F-3d node.pin · F-3e NODE_*-rens · F-3f BINCHECK · F-3g ELF/sti-grammatik · F-3h ptrace-målelag; runde 10h = PASS for codex-run.sh). Runde 10's leverance er uden kvittering: fabrik-armen redigerede wrapperen mens kørslen læste den (drift-fejl, dokumenteret). Mutant-beviset for F-3h ligger i `f3h-mutant-bevis/`. **G-F1 (Mathias' mandat til lokal gate-dom som candidate, plan DEL VIII pkt. 36) står som HALT uden for koden.**

| Mappe | Leverance | regel_commit | kvittering | Dom (første linje) |
|---|---|---|---|---|
| p2-gates | OUT-p2-delta.md | 07ce49b | success · 2026-09-09T13:53 | Dom: FAIL(4) — F-1 består delvist; nye F-5–F-7 blokerer PASS. Dette er P2-input til gaten, ikke den endelige m |
| p2-gates | OUT-p2.md | — | provenance (wrapper før v4) | Dom: FAIL(4) — ét BLOKER-fund og tre RET-fund. Runtime-fundene ligger i eksisterende fælleskode; ændringen gør |
| p2-runde10 | OUT-p2-r10.md | — | provenance (uden kvittering) | FAIL for `codex-run.sh` @ `1caee1ac8e1935bdda7dab1e534e49353dfee0ff`. De ni `.mjs`-modulers runde-9-PASS genbe |
| p2-runde10b | OUT-p2-r10b.md | ac0d68a | success · 2026-09-10T10:32 | FAIL for `codex-run.sh` @ `c6a3cbd6896f6170f94836e6a9a21f9aac9e0fe1`. De ni `.mjs`-modulers runde-9-PASS genbe |
| p2-runde10c | OUT-p2-r10c.md | e9c27b5 | success · 2026-09-10T10:55 | FAIL for `codex-run.sh` @ `31a779c949ee79cca6116257bf19cdaa0ff79165`. F-3d tillader en Node, som ikke matcher  |
| p2-runde10d | OUT-p2-r10d.md | 1f5daf5 | success · 2026-09-10T11:13 | FAIL for `codex-run.sh` @ `f2990e07421427b5f9fd18781d964891c8beeee1`. De ni `.mjs`-modulers runde-9-PASS genbe |
| p2-runde10e | OUT-p2-r10e.md | ac24ab6 | success · 2026-09-10T11:29 | FAIL for `codex-run.sh` @ `a7e1ebb60c511767265baaa5cb8d15817c7b0e7f`. F-3f og F-3d’s to målehuller er rettet m |
| p2-runde10f | OUT-p2-r10f.md | 2cfb243 | success · 2026-09-10T17:04 | FAIL for hærdningen af `codex-run.sh` @ `5102d31b37e1b793d7e8e406c3fa4583448190c8`. F-3g er rettet med effektb |
| p2-runde10g | OUT-p2-r10g.md | f231ce8 | success · 2026-09-10T17:26 | HALT for en ny PASS-entry til `codex-run.sh` @ `5102d31b37e1b793d7e8e406c3fa4583448190c8`. Rettelsen består mi |
| p2-runde10h | OUT-p2-r10h.md | 5ae0f3d | success · 2026-09-10T18:15 | PASS for `codex-run.sh` @ `5102d31b37e1b793d7e8e406c3fa4583448190c8`. F-3h er rettet med bevis efter runde-10g |
| p2-runde3 | OUT-p2-r3.md | 4cacbb3 | success · 2026-09-09T14:14 | FAIL(8) — T-F3, T-F7, T-F8, G-F1 og F-14–F-17; afhængige restfund tælles ikke dobbelt. |
| p2-runde4 | OUT-p2-r4.md | b08b801 | success · 2026-09-09T14:40 | FAIL(3) — G-F1, rest-F-16 og nyt F-18; F-15’s afhængige rest tælles ikke dobbelt. |
| p2-runde5 | OUT-p2-r5.md | 8e875ee | success · 2026-09-09T14:57 | FAIL(3) — G-F1, rest-F-16 og rest-F-18. G-F1 er ikke det eneste udestående. Ingen PASS-registrering. |
| p2-runde6 | OUT-p2-r6.md | 3e2c528 | success · 2026-09-09T15:30 | FAIL(2) — G-F1 og rest-F-16. G-F1 er ikke det eneste udestående. Ingen PASS-registrering. |
| p2-runde7 | OUT-p2-r7.md | 8734df9 | success · 2026-09-09T15:44 | FAIL(2) — G-F1 og rest-F-16. rest-F-16 er DELVIST lukket. G-F1 er ikke det eneste udestående. Ingen PASS-regis |
| p2-runde8 | OUT-p2-r8.md | 034cce6 | success · 2026-09-09T15:55 | FAIL — rest-F-16 er DELVIST lukket. G-F1 er fortsat HALT og er ikke det eneste udestående. Ingen PASS-entries. |
| p2-runde9 | OUT-p2-r9.md | 8a5755f | success · 2026-09-10T09:40 | PASS for runde-9-deltaet: rest-F-16 er rettet med bevis under den udtrykkeligt valgte linjekontrakt. G-F1 er d |
| p2-transport | OUT-p2-delta.md | 536067d | success · 2026-09-09T13:45 | Dom: FAIL(9) — 6 BLOKER + 3 RET. v3 får ikke lokalt driftspas. |
| p2-transport | OUT-p2.md | — | provenance (wrapper før v4) | Dom: FAIL(9) — 6 BLOKER, 3 RET. Denne version får ikke driftspas. |
