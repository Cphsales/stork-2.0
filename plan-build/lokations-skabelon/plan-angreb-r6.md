**1) Rest-status — DOM: FAIL**

To afgrænsede rester: **A6-1, klasse (a)** — A5-7 placerer fortsat runneren uden for måle-lags-zonen; **A6-2, klasse (a)** — to ændringshunks mangler §11.5’s krævede kobling til fund-id. Intet konstateret krav-problem → **ikke HALT**.

De øvrige navngivne rettelser accepteres som **planrettelser med kildebevis**. Der attesteres ingen implementeret effekt eller dræbte produktmutanter.

Uændret tekst bæres af **A'''**, `plan-angreb-r5.md @ 1cd8ff7ba761bc9dff1cb7a274a6548669fb6ae5`. Intet frit helhedspas er udført.

**2) Hunk-kontrol**

Begge `diff` er kørt mod de hash-verificerede kopier under `plan-build/lokations-skabelon/provenance/`.

Planen har **41 erstatningshunks med 45 ændrede linjer samt én indsættelse**. Alle 45 linjer står i §11.5’s fælles liste, `plan.md:1012`. Ingen yderligere §1–§3-ændringer findes. Men **235 og 599 mangler fund-id + linje i fundtabellen**.

Herunder er §11.5-henvisninger angivet som *fund-id @ planlinje*.

| Plan-diff-hunk | §11.5-henvisning | Ja/nej |
|---|---|---|
| `1c1` | R4-3 @1018; A5-1 @1023; hoved @1026 | Ja |
| `11c11` | A5-6 @1024; hoved @1026 | Ja |
| `13c13` | hoved @1026 | Ja |
| `20,21c20,21` | R4-1/A5-3 @1016; R4-3 @1018; A5-5 @1021; A5-1 @1023 | Ja |
| `23c23` | R4-1/A5-3 @1016; R4-3 @1018 | Ja |
| `35c35` | A5-1 @1023 | Ja |
| `37c37` | R4-3 @1018; A5-7 @1022; A5-1 @1023 | Ja |
| `41c41` | R4-1/A5-3 @1016; A5-2 @1019; A5-4 @1020; A5-5 @1021 | Ja |
| `95c95` | A5-5 @1021 | Ja |
| `107c107` | R4-1/A5-3 @1016 | Ja |
| `178c178` | A5-2 @1019 | Ja |
| `235c235` | Kun fælles hunkliste @1012 | **Nej — A6-2** |
| `237,238c237,238` | R4-1/A5-3 @1016; R4-2 @1017; A5-4 @1020; A5-5 @1021 | Ja |
| `240c240` | R4-1/A5-3 @1016; A5-4 @1020; A5-5 @1021 | Ja |
| `272,273c272,273` | R4-1/A5-3 @1016; A5-5 @1021; A5-7 @1022 | Ja |
| `275c275` | A5-2 @1019 | Ja |
| `278c278` | R4-1/A5-3 @1016; A5-2 @1019 | Ja |
| `315c315` | R4-1/A5-3 @1016; A5-5 @1021 | Ja |
| `328c328` | R4-2 @1017 | Ja |
| `391c391` | R4-3 @1018; A5-7 @1022 | Ja |
| `393c393` | A5-7 @1022 | Ja |
| `430c430` | R4-1/A5-3 @1016 | Ja |
| `436c436` | A5-7 @1022 | Ja |
| `438c438` | R4-1/A5-3 @1016; A5-5 @1021; A5-7 @1022 | Ja |
| `442c442` | R4-1/A5-3 @1016; A5-5 @1021 | Ja |
| `520c520` | R4-1/A5-3 @1016; A5-5 @1021 | Ja |
| `526c526` | R4-1/A5-3 @1016; A5-5 @1021 | Ja |
| `590c590` | A5-2 @1019 | Ja |
| `599c599` | Kun fælles hunkliste @1012 | **Nej — A6-2** |
| `606c606` | R4-1/A5-3 @1016 | Ja |
| `608c608` | R4-1/A5-3 @1016; A5-4 @1020 | Ja |
| `667c667` | R4-1/A5-3 @1016 | Ja |
| `689c689` | R4-1/A5-3 @1016 | Ja |
| `786c786` | R4-3 @1018 | Ja |
| `790c790` | R4-1/A5-3 @1016; R4-2 @1017; A5-7 @1022 | Ja |
| `796c796` | A5-1 @1023 | Ja |
| `804c804` | A5-1 @1023; allowlist-lukningen beskrevet @1016 | Ja |
| `806c806` | R4-3 @1018; hoved @1026 | Ja |
| `814c814` | A5-1 @1023 | Ja |
| `829c829` | R4-1/A5-3 @1016; F-2 @1025 | Ja |
| `840,841c840,841` | R4-1/A5-3 @1016; A5-7 @1022; A5-1 @1023 | Ja |
| `1008a1009,1027` | Selve §11.5 | Ja |

| Manifest-diff-hunk | §11.5-henvisning | Ja/nej |
|---|---|---|
| `15c15` | Ny planbinding; hoved @1026 | Ja |
| `25c25` | R4-1/A5-3 @1016; A5-5 @1021 | Ja |
| `29c29` | A5-4 @1020 | Ja |
| `950c950` | A5-2 @1019 | Ja |
| `2982c2982` | A5-4 @1020 | Ja |
| `3125c3125` | A5-5 @1021 | Ja |
| `3140c3140` | A5-5 @1021 | Ja |
| `3155c3155` | A5-5 @1021 | Ja |
| `3170c3170` | Allowlist-rettelsen R4-1/A5-3 @1016 | Ja |
| `3174a3175,3189` | Ny neg-8, R4-1/A5-3 @1016 | Ja |

**3) Delta-dom pr. fund**

Alle nedenstående planrettelser bindes til rettelses-OID **`71479b11c6a4346311c2140d43e92b0a1b2f6bf4`**. Filstierne er under `plan-build/lokations-skabelon/`.

| Fund | Lukket ved kilden? | Efterprøvning og kilde |
|---|---|---|
| R4-1 | **Ja, indholdsmæssigt** | `plan.md:107,238,315,526,667,689,829`: samme fem kolonner i guard, S-24, S-46 og D-11. `type`, gruppens navn samt tal-/datofelter udelukkes. Neg-8 og T7.18 kræver offentlig klassifikation og observeret registry-effekt. Henvisningsresten behandles særskilt som A6-2. |
| R4-2 | **Ja** | `plan.md:237,328,790`: NULL betyder uændret; tom/whitespace betyder rydning. Guard og UPDATE bruger den effektive værdi. Navneændring med udeladt adresse bevarer positiven; rydning af direct-adresse omfattes af neg-5’s eksisterende `22023`-kontrakt. |
| R4-3 | **Udtaget som gate-fund** | Fabrik-afgørelse **(a)** er bindende. Implplanens pin ved `plan.md:20` bruges ikke som selvstændig gate-binding eller FAIL-grund. |
| A5-2 | **Ja** | `plan.md:178,275,278,590`; `forventnings-manifest.json:942–965`: effekt-step er 4.3, hvor R13 findes. FS-observation, begge assertions og eksisterende negativer er bevaret. |
| A5-3 | **Ja** | `plan.md:107,237–238,315,689`: den tidligere tilladte `type→direct` afvises ved indgangen. T7.18 genindfører teksttype-testen og skal afsløres ved `pii_level='direct'`. Lovlig adresseklassifikation → lifecycle → faktisk erstatning består som søsterkontrol. |
| A5-4 | **Ja** | `plan.md:237,240,608`: T7.8-b udelader `active` fra WHEN. Normal: præcis afvisning og uændret mapping/status/store. Mutant: aktiv mapping accepteres uden telefon-strategi. Senere runtime-afvisning krediteres ikke. T7.8-a bevarer tested-negativets særskilte drab. |
| A5-5 | **Ja** | `plan.md:95,238,315,438,526`: eksisterende og første definition afvises begge i BEFORE INSERT. Begge inputtilstande og T7.10 bevares; særskilt bevist UPDATE-gren krediteres ikke. Manifestets eksisterende afvisningskontrakter er uændrede. |
| A5-7 | **Nej — A6-1** | `plan.md:37,391,436,438`: forfatterskab og frys er flyttet til Codex, men den konkrete runner-sti ligger stadig i produktzonen. |

**Afvisningskontrakterne er konkrete.** Neg-8 har `kanal=observationskanal=sqlstate`, `P0001`, grund `pii_direct_uden_anonymiseringsvej: core_identity.lokationer.type`, sted `core_compliance._pii_klassifikation_guard`, fase `konfiguration (data_field_definition_upsert)`, aktør `authenticated`, den fulde offentlige signatur og `sole_guard_ref=g.pii_klassifikation_guard` (`forventnings-manifest.json:3184–3196`).

Aktiv-mapping-negativet har tilsvarende `P0001`, grund `anonymiseringsdaekning_ufuldstaendig: core_identity.gruppe_kontakter.telefon mangler strategi`, sted `core_compliance._mapping_daekning_guard`, mapping-upsert-fase, `authenticated`, offentlig signatur og eneste-værn-reference (`forventnings-manifest.json:2981–2993`). Dermed er rettelserne bundet til de oprindelige negativer og deres effekt-stier.

**4) Manifest-delta og validator**

Manifestet er **1:1 for de ændrede ID’er**:

- `K-3/ac-5.effekt_bid`: `4.2 → 4.3`.
- Ny `K-7/S/neg-8`.
- Beskrivelser rettet for `K-7/S/neg-4..7`, `K-7/ac-4/neg-6` og de to berørte guards.
- Planbinding opdateret til det verificerede plan-OID.
- Ingen eksisterende afvisningskontrakter eller assertions ændret; ingen negativer fjernet.

`validate` og `stats` er begge kørt med exit **0**:

```text
✓ manifest gyldigt: lokations-skabelon · 9 K · 60 forpligtelser i nu-scope (0 overdraget) · 127 negativer · pr. form {"UT":47,"MH":19,"FS":35,"SA":2} · 12 eneste-værn
```

**150 assertion-ID’er; maksimum 78 tegn; ingen over 80.** Bidfordelingen er fortsat `1 + 12 + 13 + 22 + 12 = 60`.

**5) A6-n**

**A6-1 — klasse (a), A5-7 ikke fuldt lukket: runneren ligger uden for måle-lags-zonen.**

`plan.md:391,436` binder både `cmd` og kørsel til `plan-build/lokations-skabelon/prover-run.mjs`. Det strider mod fabrik-afgørelse **(b)**.

En eksekveret, skrivefri probe mod den aktuelle zoneklassifikation gav:

| Runner-sti | Zone | Builder-skrivning | Builder-commit | Codex-commit |
|---|---|---|---|---|
| `plan-build/lokations-skabelon/prover-run.mjs` | produkt | allow | allow | deny |
| `scripts/v5/lokations-skabelon/prover-run.mjs` | maale-lag | deny | deny | allow |

Ejerskabsprosaen lukker således ikke den konkrete adgang til målekomponenten. **Lukning:** bind runneren til den beskyttede sti under `scripts/v5/`, og ret `cmd` samt kørselsreferencerne tilsvarende. Forfatterskab, frys og builderens kørsel bevares. Dette er en rest i den navngivne rettelse, ikke et nyt helhedsfund.

**A6-2 — klasse (a), ufuldstændig hunk→fund-henvisning.**

`235c235` og `599c599` tilføjer/korrigerer strategiankrene, herunder `blank='[anonymized]'`. De står i fælleslisten ved `plan.md:1012`, men **ingen fundrække henviser til `:235` eller `:599`**, selv om indledningen hævder, at hver ændret §1–§3-linje er bundet til et fund nedenfor.

Indholdet er efterprøvet og stemmer med R4-1’s strategianker. Resten er det eksplicit krævede henvisningspar. **Lukning:** føj begge linjer og deres ankerrettelse til R4-1/A5-3-rækken ved `plan.md:1016`. Ingen ny substantiel review-runde er nødvendig.

Ingen yderligere A6-residualer eller kravændringer rejses.

**6) Binding**

Snapshot: opgivet pinned commit **`b9b93bcf7448365f1125ab4dbf78ab4c2b55e544`**. Uden `.git` er commit-medlemskab ikke selvstændigt verificerbart; alle syv krævede blobs er verificeret med `git hash-object`:

| Gate-input | Verificeret blob-OID |
|---|---|
| `plan-build/lokations-skabelon/plan.md` | `71479b11c6a4346311c2140d43e92b0a1b2f6bf4` |
| `plan-build/lokations-skabelon/forventnings-manifest.json` | `a2128907582f659070a6f9942be28cd6f04bc718` |
| `docs/sandhed/krav/lokations-skabelon-krav.md` | `9402164d87a35fb939661058bea77c1a052493d0` |
| `plan-build/lokations-skabelon/recon2.md` | `2bdbb122158b6f8c72fc942b8de28e679742b4aa` |
| `plan-build/lokations-skabelon/p8-slutproeve-spec.md` | `4af07ef4164882ca54643e79df3554c0bf22b0e4` |
| `plan-build/lokations-skabelon/ordbog.md` | `bcab6b4ed9c9c0fe21f13c70d8e1d47a2afd9fef` |
| `plan-build/lokations-skabelon/kill-list-udkast.md` | `13b783927f4fed107caa0e849e65499fd3291b61` |

Web er ikke brugt; ingen filer er ændret. Dommen er Codex’ blokerende input til plan-gaten.

VERDIKT-DRAFT: eyJha3RvciI6ImNvZGV4IiwiY29uY2x1c2lvbiI6IkZBSUwiLCJuZWdhdGl2ZV9jYXNlcyI6WyJLLTcvUyDDlyBwbGFuLm1kOjIzOCDigJQgdHlwZeKGkmRpcmVjdCBoYXIgbmVnLTggbWVkIGZ1bGQgYWZ2aXNuaW5nc2tvbnRyYWt0IG9nIG9ic2VydmVyZXQgcmVnaXN0cnktZWZmZWt0IGZvciBUNy4xODsgcGxhbnJldHRlbHNlbiBhY2NlcHRlcmVzLCBtdXRhbnQgaWtrZSBrw7hydC4iLCJLLTcvUyDDlyBwbGFuLm1kOjMxNSDigJQgYWxsb3dsaXN0ZW4gdWRlbHVra2VyIGdydXBwZW5zIG5hdm4gc2FtdCB0YWwtIG9nIGRhdG9mZWx0ZXI7IFQ3LjE1IG9nIG5lZy02Ly03IGVyIGJldmFyZXQ7IHBsYW5yZXR0ZWxzZW4gYWNjZXB0ZXJlcy4iLCJLLTcvYWMtNCDDlyBwbGFuLm1kOjIzNyDigJQgVDcuOC1iIGZqZXJuZXIgYWN0aXZlIGZyYSBXSEVOOyBuZWctNiBza2FsIG9wZGFnZSBhY2NlcHRlcmV0IGFrdGl2IG1hcHBpbmcgdWRlbiB0ZWxlZm9uOyBwbGFucmV0dGVsc2VuIGFjY2VwdGVyZXMuIiwiSy03L1Mgw5cgcGxhbi5tZDoyMzgg4oCUIGluZGlyZWN0IHDDpSBla3Npc3RlcmVuZGUgb2cgZsO4cnN0ZSBkZWZpbml0aW9uIHJhbW1lciBCRUZPUkUgSU5TRVJUOyBiZWdnZSBpbnB1dHRpbHN0YW5kZSBvZyBUNy4xMCBlciBiZXZhcmV0OyBhY2NlcHRlcmV0LiIsIkstNy9hYy00IMOXIHBsYW4ubWQ6MzI4IOKAlCB1ZGVsYWR0IGFkcmVzc2UgYmV2YXJlczsgcnlkbmluZyBhZiBkaXJlY3QtYWRyZXNzZSBww6UgYW5vbnltaXNlcmV0IHLDpmtrZSBhZnZpc2VzIG1lZCAyMjAyMzsgcGxhbnJldHRlbHNlbiBhY2NlcHRlcmVzLiIsIkstMy9hYy01IMOXIHBsYW4ubWQ6MTc4IOKAlCBSZXQtb2JzZXJ2YXRpb25lbiBlciBmbHl0dGV0IHRpbCA0LjM7IGFzc2VydGlvbnMgb2cgYWZ2aXNuaW5nc2tvbnRyYWt0ZXIgZXIgdcOmbmRyZWRlIGkgbWFuaWZlc3RldDsgYWNjZXB0ZXJldC4iLCJLLTkgw5cgcGxhbi5tZDozOTEg4oCUIHJ1bm5lcmVucyBwbGFubGFndGUgc3RpIGtsYXNzaWZpY2VyZXMgdmVkIGVrc2VrdmVyZXQgem9uZXByb2JlIHNvbSBwcm9kdWt0IG1lZCBidWlsZGVyIGFsbG93IG9nIENvZGV4IGRlbnk7IEE2LTEsIEZBSUwuIiwiSy03L2FjLTIgw5cgcGxhbi5tZDoyMzUg4oCUIMOmbmRyaW5nZXJuZSBww6UgMjM1IG9nIDU5OSBlciBsaXN0ZXQsIG1lbiBtYW5nbGVyIGZ1bmQtaWQgcGx1cyBsaW5qZSBpIMKnMTEuNTsgQTYtMiwgRkFJTCBww6UgaGVudmlzbmluZ3NrcmF2ZXQuIl0sImNsYWltX2dyYXBoX3JlZnMiOltdLCJldmlkZW5jZSI6W3sicGF0aCI6InBsYW4tYnVpbGQvbG9rYXRpb25zLXNrYWJlbG9uL3BsYW4ubWQiLCJsaW5lX3NwYW4iOlsyMzcsMjM4XX0seyJwYXRoIjoicGxhbi1idWlsZC9sb2thdGlvbnMtc2thYmVsb24vcGxhbi5tZCIsImxpbmVfc3BhbiI6WzMxNSwzMjhdfSx7InBhdGgiOiJwbGFuLWJ1aWxkL2xva2F0aW9ucy1za2FiZWxvbi9wbGFuLm1kIiwibGluZV9zcGFuIjpbMzkxLDQzNl19LHsicGF0aCI6InBsYW4tYnVpbGQvbG9rYXRpb25zLXNrYWJlbG9uL3BsYW4ubWQiLCJsaW5lX3NwYW4iOlsxMDEyLDEwMjJdfSx7InBhdGgiOiJwbGFuLWJ1aWxkL2xva2F0aW9ucy1za2FiZWxvbi9mb3J2ZW50bmluZ3MtbWFuaWZlc3QuanNvbiIsImxpbmVfc3BhbiI6WzMxODQsMzE5Nl19LHsicGF0aCI6ImRvY3Mvc2FuZGhlZC9rcmF2L2xva2F0aW9ucy1za2FiZWxvbi1rcmF2Lm1kIiwibGluZV9zcGFuIjpbMTM0LDE0M119XX0=