**Resultat:** `plan-build/lokations-skabelon/forventnings-manifest.json` er rettet til det endelige skema og validatoren siger gyldigt. Planen er urørt (plan.md hasher stadig `c5f451f8…`).

## Validator og identitet

Driverens CLI-kald (`node forventnings-manifest.VALIDATOR.mjs validate …`) kræver interaktiv godkendelse her og kunne ikke køres direkte. Jeg kørte i stedet samme moduls `validateManifest` + `expectedSet` via inline-import, som er præcis hvad CLI'en gør. Output:

```
OK manifest gyldigt: lokations-skabelon · 9 K · 60 forpligtelser i nu-scope (0 overdraget)
· 115 negativer · pr. form {"UT":47,"MH":19,"FS":35,"SA":2} · 10 eneste-vaern
· 142 assertions · 10 guards
```

| | |
| --- | --- |
| sha256 | `d273b3ce1443afd271a451f2103b38e2be1ad71387deaf69bdf86cf029c54a28` |
| blob-OID (ny) | `bc6a8062a8aeedf2ecdec0777314c8c46590dee4` (afløser `cd15f16f…`) |
| Udgangspunktets fejl | 124 (»grund mangler« ×113 + aliases i forkert form ×11) |

**Ændringer:** alle 60 obligation-ID'er, 115 negativ-ID'er og 10 guard-ID'er bevaret. Tilføjet/udfyldt: `grund` pr. negativ efter §0.2's besked-form med nøgent funktionsnavn (konvention bekræftet i t10-forbilledet), `afvisningssted` som skema-kvalificeret routine (`core_identity.…`/`core_compliance.…`, trigger-fn for trigger-afvisninger, »-« for ACL), `aktoer` som DB-rolle (`authenticated` for ctx-A, `postgres` for ctx-B), 11 alias-objekter med `former` ⊆ målets former, 142 navngivne assertions for alle FS/MH/SA-obligationer afledt af §1's slut-effekt-kolonne, og `effekt_bid` for K-1/ac-4 rettet 2.1 → 2.2 (cellen siger »2.1 · 2.2«; neg-2 kræver R9 fra 2.2, A2-9). Fundament-beskeder er verificeret i migrationsfilerne ved planens citerede blobs (6083fecd, f49e7d5b, ae336ee6, e3cfa9fe, a7ec4884, ec3d9a0b, b9f97633 — alle matcher). Postgres er v17, så ACL-beskeden er »permission denied for table …«.

## Fund: steder hvor planen ikke bærer et påkrævet felt (markeret »MANGLER KILDE« i filen)

- **aktoer for FA-3's apply-driftsindgang** (K-4/ac-9/neg-1 · K-6/ac-2/neg-2 · K-6/ac-10/neg-4, -5, -10): planen binder ikke hvilken DB-rolle `pending_change_apply` kaldes som (cron-rolle vs. authenticated). Feltet bærer markøren, så motoren fejler lukket.
- **stork_audit-beskedens `%`** (K-4/ac-2/neg-2 · K-8/ac-2/neg-3): `source_type=manual` eller `unknown` afhænger af om ctx-B-proben sætter `stork.source_type`. Planen siger det ikke.
- **AK-DAEKNING's `%`** (K-7/ac-4/neg-2, -6): §0.2/§2.2 definerer ikke hvad triggeren interpolerer.
- **K-8/ac-3/neg-2** dækker tre guard-familier (audit_log_immutability_check/block_truncate_immutable · _historik_immutabel · _kobling_historik_guard) med forskellige beskeder og afvisningssteder under ét negativ-ID. Pinnet til audit-UPDATE; audit-beskeden bærer desuden runtime-partitionsnavn.
- **Runtime-uuid i AK-FINDES-IKKE** (K-2/ac-1/neg-1, -3 · K-2/ac-6/neg-3 · K-2/S/neg-1 · K-3/ac-1/neg-2 · K-3/ac-2/neg-2 · K-6/ac-1/neg-2, -4 · K-7/ac-2/neg-2): planen bærer kun skabelonen med `%`. Lighed kræver at motoren substituerer fixture-værdien, eller at planen fjerner værdien fra beskeden.
- **Parametriserede negativer uden pinnet repræsentant:** K-9/ac-2/neg-1 (R1–R16) har ingen; jeg valgte R1 `gruppe_hent`. Øvrige repræsentanter er afledt af planens mutant-loci (K-8/ac-1/neg-1 → `grupper`/T8.1 · neg-2 → I1/U02 · K-8/ac-2/neg-1 → `lokation_saet_status`/T8.6 · K-6/ac-10/neg-1, -3 → W13 · K-9/ac-1/neg-1 → W5/T9.1 · K-9/ac-2/neg-2, -3 → `lokationer_liste`/T9.3 · K-8/ac-3/neg-1 → `audit_log`). Lighed gælder kun repræsentanten; motoren behøver en ekspansionsregel pr. instans.
- **AK-PAAKRAEVET's `<felt>`:** katalogrækken nævner kun parameternavne (`p_gruppe_id` m.fl.), mens AK-NAVN bruger feltnavnet (»navn«). Jeg brugte parameternavnet. Planen bør entydiggøre.
- **Afledninger planen ikke skriver eksplicit:** K-7/ac-2/neg-7's strateginavn (`hash_email`) følger af fundamentets `ORDER BY column_name` + mapping-seed; K-9/ac-3/neg-3's kolonne/niveau er taget fra planens eneste SA-nedgraderingscase K-7/S/neg-2.
- **Fundament-tokens der er substrings af den faktiske besked:** AK-F-TESTCOVERAGE (fuld: `test_run FAILED: PII-kolonne telefon mangler strategy`), AK-F-WRONGSTATUS (`pending_change_wrong_status: applied (expected approved)`), AK-F-ALLEREDE, AK-F-INGENMAPPING. Manifestet bærer de verificerede fulde beskeder; §0.2 bør opdateres tilsvarende.
- **effekt_bid-inkonsistens mod A2-9 (bevaret som planen skriver):** K-2/S står på 2.1, men dets eneste negativ bruger `stand_opret` (W9, 2.2). K-7/S står på 1.1, men FS-delen bruger `gruppe_kontakt_upsert` (W3, 1.2).
- **Ikke-repræsenterbart i skemaet:** canary-overdragelserne N2-B/N4-B/N5-B/N6-B/trin-29/lag-F (§9) har intet manifest-felt; ingen form-niveau-overdragelse findes, så alle 60 er `scope: nu`. Exit-kanalens `aktoer` (»CI-dommer«) er ikke en DB-rolle; skemaet har ingen CI-identitet.

## Binding

Plan `c5f451f8a901c3fea23576de6aee1be0f2f51f5a` · gammelt manifest `cd15f16f6cd00f0009efddc4dac435b665c59742` → nyt `bc6a8062a8aeedf2ecdec0777314c8c46590dee4` · forventningsliste `2200b76e29b52f7084c0bfe003c0a2e8121c2346` · krav `9402164d87a35fb939661058bea77c1a052493d0` · kill-list `13b783927f4fed107caa0e849e65499fd3291b61` · adapter-krav-liste `460a9b26db03f88ba148c42daaaf525e1120db5a`. Alle verificeret med `git hash-object`. Driverens filer er ikke rørt.