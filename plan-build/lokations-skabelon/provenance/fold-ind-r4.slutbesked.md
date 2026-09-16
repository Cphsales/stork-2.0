Alle tre leverancer er skrevet; hashes er taget. Slutbesked:

**Leverancer (workdir @ `8c664f4f`, `plan-build/lokations-skabelon/`)**

| fil | sha256 | blob-OID | linjer |
| --- | --- | --- | --- |
| `plan.md` (v3.2, UDKAST) | `58030e35fcc9e0a38da733daf575f0326d1721fcdeedc22f59ba83739496d246` | `fea69661d135a726b09eea7db588b29c78e46b8b` | 972 |
| `fold-ind-rapport-r4.md` | `bcd168b253e952672f570f0b22b0ff727165a3237f3078bc9f29aab613123288` | `1aa91bbed722261c40fb78162d7bbb50e47c870e` | 180 |
| `forventnings-manifest.json` (v3.2) | `65a9fe1bb1f59b4827144f714138ceb9a8124bef1f0b301e2aed4542f43d216f` | `70eaf415607454586f5aae32be7a41544f4e262f` | 3676 |

**Validator: IKKE kørt her.** Både `node` (validator og transformation) og `python3` krævede interaktiv godkendelse i den ubemandede session. Manifestet er i stedet kontrolleret mekanisk med grep: klammer 474/474, parenteser 250/250, 60 obligationer, 118 negativer (115 + 3), 147 assertions (142 + 5), 10 guards, 11 aliases, SQLSTATE-mængde kun {22023 ×58, 42501 ×28, P0001 ×20, P0002 ×10} + 2 exit, aktør {authenticated 108, postgres 8, ci 2}, effekt_bid-sum 60, 0 »MANGLER KILDE«, 0 `%`-tokens i `grund`, alle 62 `P:`-ankre entydige. `bindings.plan.oid` = `"<udfyldes af driveren>"`. Driveren skal indsætte OID og køre validatoren før commit; forventet stats-linje står i rapport §5. Et ubrugt hjælperscript ligger uden for workdir'en (`scratchpad/v32/manifest-v32-transform.cjs`) og kan slettes.

**Optælling pr. tilstand (alle 108 fund = fund-loggens 106 + NF-7/NF-8):** RETTET M. BEVIS 94 · INDEN FOR MANDAT 12 · DRIVER 2 · KRÆVER MATHIAS 0 · ÅBNE 0.

**HALT-flag: INGEN.** KRÆVER MATHIAS: INGEN (M-42/pkt. 37; §10 er én tabel af deklarerede defaults med bord-test og stop-konsekvens).

**Hovedgreb i v3.2:** S-2 afgjort af M-42 → S-2-B er planens stilling (AK-PII-INDIRECT, `K-7/S/neg-4`, T7.10 I; FUND3-4 bortfalder) · S-1 afgjort af planneren (V1 fast, S-1-B fjernet) · A3-2 (Bid 5 = 12, sum 60, T8.2 → Bid 4, K-1/ac-4 → 5.1, T6.8-a/-b) · A3-3 (§0.3: audit-/årsagskontrakt pr. skrivevej, familie A, T8.6 = 25 instanser) · A3-4 (fuldt rettigheds-overlay, C0-aktør SA) · A3-6 (`udfaset_dato` + bundet event_based-forløb, T7.12 I) · A3-7 (ISO-transport, DateStyle-prøve, ny FS-mutant) · V31-1..11 lukket i §0.2/§4 (S-38..S-45) · FA-5 synkroniseret til `5183dec1` · §11.3 pr. fund-id med linjenumre.

**Bindinger verificeret (`git hash-object`, én pr. kald):** plan v3 `c5f451f8` · rapport-r3 `1b0240c1` · manifest v3.1 `ce191381` · angreb-r3 `1dad9636` · audit-r3 `82229a6a` · manifest-v31.slutbesked `16a76c84` · fund-log `14535e1d` · ledger `5f4425d1` · implplan `11fb2208` · kildekontrakt `5183dec1` · kilde.json `0b253117` · scope.sql `2353d392` · katalog.txt `12f6baba` · gen.mjs `e64e7c20` · krav `9402164d` · kill-list `13b78392` · forventningsliste `2200b76e` · recon2 `2bdbb122` · P-8 `4af07ef4` · ordbog `bcab6b4e` · devil-REN `598f98fd` · validator `64ea01e0`. Web ikke brugt; ingen driver-filer rørt.