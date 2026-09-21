**HALT — pakken er ikke leveret.** Prover-filerne er færdigskrevet. `angrebs-spec.json` indeholder bindinger og bid-graf, men ingen cases eller mutanter: fire konkrete kontraktblokeringer forhindrer en dækkende, ærlig spec. Kun de tre tilladte filer er skrevet. Ingen databasekørsel eller webadgang.

| Sti | SHA256 | Bytes |
|---|---|---:|
| `plan-build/lokations-skabelon/angrebs-spec.json` | `3d4742b5c5d4c5bea23f4df95159ce8df1e8f2036a610d50003e4462b239c93d` | 3357 |
| `plan-build/lokations-skabelon/prover.json` | `cb3b11adef9c45ca28e6abb990fd0fb927d22a679704a7547dffa3f362ac2b7a` | 135 |
| `scripts/v5/lokations-skabelon/prover-run.mjs` | `394784f5499bcc05fc7fc107d8eac33ea977d4a7d94a689cd4fdf0903159612e` | 1817 |

Validatoren er kørt med den foreskrevne kommando: **exit 1**, 498 komplethedsfejl. Sidste linje ordret:

```text
  - K 'K-9' har ingen mutant (mutant-kill-gulv)
```

Dækningsregnskab: **UT 0 · FS 0 · MH 0 · SA 0**.

| Effekt-bid | Manifestforpligtelser i `covers` | Cases |
|---|---:|---:|
| 1.2 | 1 | 0 |
| 2.1 | 1 | 0 |
| 2.2 | 11 | 0 |
| 3.1 | 13 | 0 |
| 4.1 | 3 | 0 |
| 4.2 | 4 | 0 |
| 4.3 | 15 | 0 |
| 5.1 | 8 | 0 |
| 5.2 | 4 | 0 |

Forudsætningsnoder: `1.1`, `1.3`, `1.4`, `2.3`; hver har `covers: []` og 0 cases. Alle 60 manifestforpligtelser er placeret i grafen.

Mutanter pr. K: **K-1 til K-9: 0 hver**. Ingen fejl-loci fra §3 er dækket af leverede mutanter.

| Eneste-værn | Mutanter |
|---|---:|
| `g.app_dml_revoke` | 0 |
| `g.pii_klassifikation_guard` | 0 |
| `g.mapping_daekning_guard` | 0 |
| `g.lokation_anonymiseret_gate` | 0 |
| `g.w15_ikke_i_gruppen` | 0 |
| `g.nedlagt_guard` | 0 |
| `g.apply_gruppe_laas` | 0 |
| `g.has_permission_write_gate` | 0 |
| `g.r1_read_gate` | 0 |
| `g.kontakt_lukket` | 0 |
| `g.r17_pending_read_gate` | 0 |
| `g.i4_ikke_i_gruppen_genvalidering` | 0 |

Følgende punkter er åbne og blokerende:

1. **H3 — API-forløb kan ikke udtrykkes.** `plan.md:606` kræver hele API-kæden med genlæsning efter hver handling og særskilt A+. Manifestet binder bl.a. W5→W6 i ét navngivet vidne (`forventnings-manifest.json:352`) og hele handlingslisten (`:3606`). `build-harness.mjs:380` udfører én MH-handling med én aktør; HTTP-body er statisk, og der findes ingen binding fra returneret lokations-/pending-ID til næste request. Der mangler en kontrakt for API-trin, resultatbinding og aktørskift. SQL-setup kan ikke bevise den krævede API-kæde.

2. **H4 — FA-3 mangler en eksekverbar grænseflade.** `plan.md:32` kræver styring af databaseværtsklokken og cron for historiske forløb, herunder D0+29/D0+30 (`forventnings-manifest.json:2926`, `:2930`). `runCase` har ingen klokke-/job-trin; `pg-runner.mjs:251` eksponerer heller ingen sådan operation. Der mangler en bundet driver og kaldbar protokol. Håndskrevne sluttilstande ville omgå effektkravet.

3. **H5 — audit-observationens rolle er uforenelig med planen.** `plan.md:187` kræver ejerlæsning af audit efter R+’s handling; `:606` udelukker `audit/log`-grant. Men FS-observationer og checkpoints bruger handlingens samme `opts` (`build-harness.mjs:372`, `:377`). `audit_log` har ingen SELECT-policy og eksplicit revoke (`20260514120003_t1_audit_partitioned.sql:72`). Der mangler særskilt, bundet ejertransport til kontrolobservationerne.

4. **H6 — D10-bindingen for gruppelåsen kan ikke opfyldes som krævet.** Manifestets `K-6/ac-2/neg-2` binder `g.apply_gruppe_laas` (`forventnings-manifest.json:2005`, `:2017`). Validatoren kræver en mutant på netop negativets **UT** (`angrebs-spec.mjs:173`). Planens T6.2 er derimod udtrykkeligt et **SA-race** (`plan.md:217`): fjernet lås ændrer ikke den sekventielle anden apply, fordi genvalideringen stadig finder koblingen. Desuden er planens forventede mutantudfald 23505 uden for motorens accepterede SQLSTATE-mængde (`forventnings-manifest.mjs:38`). Der mangler en konsistent manifest-/dommerbinding; ekstra svækkelse af genvalidering eller UNIQUE ville ændre mutanten.

De syv øvrige angivne input-OID’er matcher. `angrebs-spec.mjs` har faktisk blob-OID `5e9e60e02c31f3addde6c48f56d8ff56098faf00`, ikke opgavens `e768060dc551e347fcc82362e1fc716251e9022e`; workdir-skemaet er fulgt som instrueret.

LEVERANCE-JSON: {"status":"HALT","validator_exit":1,"cases":0,"mutants":0,"files":{"plan-build/lokations-skabelon/angrebs-spec.json":"3d4742b5c5d4c5bea23f4df95159ce8df1e8f2036a610d50003e4462b239c93d","plan-build/lokations-skabelon/prover.json":"cb3b11adef9c45ca28e6abb990fd0fb927d22a679704a7547dffa3f362ac2b7a","scripts/v5/lokations-skabelon/prover-run.mjs":"394784f5499bcc05fc7fc107d8eac33ea977d4a7d94a689cd4fdf0903159612e"},"halt":["H3: API-forløb mangler trin, resultatbinding og aktørskift (plan:606; manifest:352,3606; build-harness:380).","H4: FA-3 mangler kaldbar klokke-/job-protokol (plan:32; manifest:2926,2930; pg-runner:251).","H5: Audit kræver ejerobservation, men FS observerer som handlingsaktøren (plan:187,606; build-harness:372,377).","H6: g.apply_gruppe_laas kræver UT-kill, mens planens T6.2 er SA og giver uaccepteret 23505 (plan:217; manifest:2017; angrebs-spec:173)."]}