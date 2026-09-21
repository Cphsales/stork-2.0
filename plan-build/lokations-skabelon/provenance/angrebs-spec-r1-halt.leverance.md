**HALT — pakken er ikke leveret.** To kontraktbrud hindrer en korrekt, komplet angrebs-spec. De otte oplyste input-OID’er matcher og er uændrede. Kun de tre tilladte filer er skrevet.

| Sti | SHA256 | Bytes |
|---|---|---:|
| `plan-build/lokations-skabelon/angrebs-spec.json` | `b8a77d1b45b1d819ed3a6039ed0c4a9f7f374c8760ac0e209792b14a45137dad` | 3435 |
| `plan-build/lokations-skabelon/prover.json` | `cb3b11adef9c45ca28e6abb990fd0fb927d22a679704a7547dffa3f362ac2b7a` | 135 |
| `scripts/v5/lokations-skabelon/prover-run.mjs` | `f2342eba9c0d54382929dd3ea14f5dba602d85dec4f651b58113a36a8ee2ae00` | 2201 |

Prover-filerne er skrevet efter kontrakten, inklusive `total=0 → exit 1` og ejerskabskommentar. Proveren er ikke kørt. Angrebs-spec’en indeholder HALT-begrundelser og tomme arrays; den er **ufuldstændig og ikke frosset til byg**.

Den krævede validator blev kørt: **exit 1**, 439 komplethedsfejl. Sidste linje ordret:

```text
  - K 'K-9' har ingen mutant (mutant-kill-gulv)
```

Dækningsregnskab:

- Cases pr. form: **UT 0 · FS 0 · MH 0 · SA 0**.
- Cases pr. effekt-bid: **1.2: 0 · 2.1: 0 · 2.2: 0 · 3.1: 0 · 4.1: 0 · 4.2: 0 · 4.3: 0 · 5.1: 0 · 5.2: 0**.
- Mutanter pr. K: **K-1 til K-9: hver 0**; ingen mutant-id’er.
- Ramte fejl-loci fra §3: **ingen**. D10 og K-gulvet er ikke opfyldt.

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

**Åbne HALT-punkter til driveren:**

1. **API-bevisformen kan ikke udtrykkes.** `plan.md:259`, `:260`, `:606` kræver PostgREST-forløb; manifestet binder MH-vidner ved `forventnings-manifest.json:3606` og `:3657`. Men `angrebs-spec.mjs:116` kræver `action.sql`, og `build-harness.mjs:330` udfører kun SQL for MH. `check.cmd` forbruges kun ved UT-exit (`:294`); API-negativet K-9/ac-1/neg-1 er selv bundet til **sqlstate** (`forventnings-manifest.json:3623`). Der mangler en afstemt adapter-/skemakontrakt. Berører også K-1/ac-5 og K-5/ac-4.

2. **UUID-substitution mangler.** `plan.md:47` kræver substitution af `{id}` for K-7/ac-2/neg-2; manifestets `grund` indeholder tokenet ved `forventnings-manifest.json:2776`. `build-harness.mjs:310` kopierer det uændret, og `:184` bruger strenglighed. Fundamentet raiser den konkrete UUID (`20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql:108`). En korrekt produktafvisning kan derfor ikke bestå denne kontrakt.

Begge kræver rettelser uden for de tre tilladte filer. Ingen produktobservation er omskrevet for at frembringe grønt.

LEVERANCE-JSON: {"status":"HALT","validator_exit":1,"cases":0,"mutants":0,"files":{"plan-build/lokations-skabelon/angrebs-spec.json":"b8a77d1b45b1d819ed3a6039ed0c4a9f7f374c8760ac0e209792b14a45137dad","plan-build/lokations-skabelon/prover.json":"cb3b11adef9c45ca28e6abb990fd0fb927d22a679704a7547dffa3f362ac2b7a","scripts/v5/lokations-skabelon/prover-run.mjs":"f2342eba9c0d54382929dd3ea14f5dba602d85dec4f651b58113a36a8ee2ae00"},"halt":["h1.api-proof-form: API-forpligtelsernes MH/sqlstate-former kan ikke udfoeres gennem den foreskrevne check.cmd-kanal.","h2.uuid-substitution: K-7/ac-2/neg-2 kraever planens {id}-substitution, som motoren ikke implementerer."]}