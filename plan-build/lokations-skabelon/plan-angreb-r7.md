**1) Rest-status — DOM: PASS**

**A6-1 og A6-2 er rettet med kildebevis**, bundet til plan-OID `289b87616750a1a1180a8ec5f7a639cd43f07a29`. Ingen uanmeldt §1–§3-ændring; manifestet er gyldigt og indholdsmæssigt uændret.

Uændret tekst bæres af `plan-angreb-r6.md @ 529be398b3a33e94c1ce9cb5b196c6528882a1d9` — A'''' over v3.4, som viderefører A''' fra `plan-angreb-r5.md @ 1cd8ff7ba761bc9dff1cb7a274a6548669fb6ae5`. Intet frit helhedspas er udført. Dommen accepterer planrettelserne; den attesterer ingen implementeret produkteffekt eller dræbte produktmutanter.

**2) Hunk-kontrol**

Begge `diff` er kørt mod de hash-verificerede provenance-kopier. Planen har **11 erstatningshunks og én indsættelse**. §1–§3, linje 139–611, er byte-identiske med baseline bortset fra **391, 436 og 438**.

Filnavne nedenfor er under `plan-build/lokations-skabelon/`.

| Diff-hunk | §11.6-henvisning | Dækket? |
|---|---|---|
| Plan `1c1` | Hoved/§0 @1037 | Ja |
| Plan `11c11` | Hoved/§0 @1037 | Ja |
| Plan `13c13` | Hoved/§0 @1037 | Ja |
| Plan `37c37` | A6-1 @1035 | Ja |
| Plan `391c391` | A6-1 @1035 | Ja |
| Plan `436c436` | A6-1 @1035 | Ja |
| Plan `438c438` | A6-1 @1035 | Ja |
| Plan `790c790` | A6-1 @1035 | Ja |
| Plan `1004c1004` | A6-1 @1035 | Ja |
| Plan `1016c1016` | A6-2 @1036 | Ja |
| Plan `1022c1022` | A6-1 @1035 | Ja |
| Plan `1027a1028,1038` | Selve §11.6; indsættelsen angivet @1031 | Ja |
| Manifest `15c15` | Planbindingens opdatering @1031 | Ja |

**3) Delta-dom pr. fund**

| Fund | Lukket ved kilden? | Kilde og efterprøvning |
|---|---|---|
| **A6-1 = R5-2** | **Ja** | `plan.md:37,391,436,438,790`: runneren er `scripts/v5/lokations-skabelon/prover-run.mjs`. JSON-`cmd` ved 391 og kørslen ved 436 er maskinelt sammenlignet og identiske. Eksekveret zoneprobe giver **builder-skrivning: deny; builder-commit: deny; Codex-commit: allow**. `prover.json` beholder pkt. 39’s placering og Codex’ forfatterskab/frys før Bid 1. |
| **A6-2 = R5-1** | **Ja** | `plan.md:1016` henviser nu eksplicit til **235** med værdi-assert/`blank='[anonymized]'` og **599** med mappingens strategiankre under **R4-1/A5-3**. Begge kildepassager er byte-uændrede fra den tidligere efterprøvning. §11.6:1036 henviser korrekt til rettelsen. |

Den gamle runner-sti forekommer kun ved `plan.md:11,37,1004,1022,1035`, alle som historik eller før/efter-forklaring. Ved 1004 er den gamle `cmd` udtrykkeligt markeret som erstattet i v3.5.

`prover.json`-layoutet stemmer med implplan pkt. 39 og CI-læsningen i `scripts/v5/ci-build-dom.mjs:129`. Planen kræver P-7-rød ved builderændring af både konfiguration og runner; den yderligere hook-afvisning gælder runneren.

Ingen negativ, observation, mutant eller `reject_contract` er ændret. De tidligere accepterede kontrakter, herunder K-7/S/neg-8 med T7.18 og K-7/ac-4/neg-6 med T7.8-b, er bevaret med samtlige afvisningsfelter og `sole_guard_ref`. Implementeringsbeviset kommer fortsat i build.

**4) Manifest-delta og validator**

Eneste ændring er `forventnings-manifest.json:15`:

`bindings.plan.oid`: `71479b11…` → **`289b8761…`**, som matcher den verificerede planblob.

Ingen ændrede forpligtelses-ID’er. Hele JSON-indholdet er identisk efter normalisering af netop dette felt; dermed bevares den tidligere accepterede 1:1-binding.

`validate` og `stats` er kørt på det faktiske gate-input, begge med **exit 0**:

```text
✓ manifest gyldigt: lokations-skabelon · 9 K · 60 forpligtelser i nu-scope (0 overdraget) · 127 negativer · pr. form {"UT":47,"MH":19,"FS":35,"SA":2} · 12 eneste-værn
```

**150 unikke assertion-ID’er; maksimum 78 tegn; ingen over 80.**

**5) A7-n**

Ingen nye materielle fund eller åbne rester i det afgrænsede delta. Intet konstateret krav-problem.

**6) Binding**

Alle syv gate-inputs er verificeret med `git hash-object` og matcher:

| Artefakt | Verificeret blob-OID |
|---|---|
| `plan.md` | `289b87616750a1a1180a8ec5f7a639cd43f07a29` |
| `forventnings-manifest.json` | `ab4c8501253cbc9310f9875c0ab5c672f1ad23dd` |
| `docs/sandhed/krav/lokations-skabelon-krav.md` | `9402164d87a35fb939661058bea77c1a052493d0` |
| `recon2.md` | `2bdbb122158b6f8c72fc942b8de28e679742b4aa` |
| `p8-slutproeve-spec.md` | `4af07ef4164882ca54643e79df3554c0bf22b0e4` |
| `ordbog.md` | `bcab6b4ed9c9c0fe21f13c70d8e1d47a2afd9fef` |
| `kill-list-udkast.md` | `13b783927f4fed107caa0e849e65499fd3291b61` |

Dommen gælder det fremlagte snapshot @ `4a91894d0a34e5dc5bc5547b84df384385614491`, bundet gennem ovenstående blobs. Web er ikke brugt; ingen filer er ændret. Dette er Codex’ input til plan-gaten; den endelige afgørelse ligger hos gate-kernen og Mathias.

VERDIKT-DRAFT: eyJha3RvciI6ImNvZGV4IiwiY29uY2x1c2lvbiI6IlBBU1MiLCJuZWdhdGl2ZV9jYXNlcyI6WyJLLTkgw5cgcGxhbi5tZDozOTEg4oCUIG55IHJ1bm5lci1zdGkgZ2l2ZXIgYnVpbGRlciB3cml0ZT1kZW55IG9nIGNvbW1pdD1kZW55OyBDb2RleCBjb21taXQ9YWxsb3cgaSBla3Nla3ZlcmV0IHpvbmVwcm9iZS4gUEFTUyBmb3IgQTYtMS4iLCJLLTkgw5cgcGxhbi5tZDo0MzYg4oCUIGNtZCBvZyBTdGVwIDEuNCBicnVnZXIgc2FtbWUgc2NyaXB0cy92NS1zdGk7IGdhbW1lbCBwcm9kdWt0c3RpIGZpbmRlcyBrdW4gaSBla3NwbGljaXQgaGlzdG9yaWsuIFBBU1MuIiwiSy05IMOXIHBsYW4ubWQ6Mzcg4oCUIHByb3Zlci5qc29uIGhhciBwa3QuIDM5LWxheW91dDsgQ29kZXggZm9yZmF0dGVyIG9nIGZyeXNlciBmw7hyIEJpZCAxLCBieWdnZXJlbiBtw6Uga3VuIGvDuHJlLiBQQVNTIHNvbSBwbGFua29udHJha3QuIiwiSy03L2FjLTIgw5cgcGxhbi5tZDoxMDE2IOKAlCBtYW5nbGVuZGUgZnVuZC1oZW52aXNuaW5nIHRpbCA6MjM1IGVyIHJldHRldCB1bmRlciBSNC0xL0E1LTM7IHbDpnJkaS1hc3NlcnRlbiBlciB1w6ZuZHJldC4gUEFTUyBmb3IgQTYtMi4iLCJLLTcvYWMtMiDDlyBwbGFuLm1kOjEwMTYg4oCUIG1hbmdsZW5kZSBmdW5kLWhlbnZpc25pbmcgdGlsIDo1OTkgZXIgcmV0dGV0IG1lZCBzdHJhdGVnaWFua3JlbmU7IG1hcHBpbmctc2VlZCBlciB1w6ZuZHJldC4gUEFTUyBmb3IgQTYtMi4iLCJLLTcvUyDDlyBwbGFuLm1kOjEwMzEg4oCUIGluZ2VuIHRhdnMgw6ZuZHJpbmcgYWYgbmVnYXRpdmVyIGVsbGVyIHJlamVjdF9jb250cmFjdDogbWFuaWZlc3QtZGlmZiDDpm5kcmVyIGt1biBwbGFuLU9JRC4gUEFTUyBtZWQgdGlkbGlnZXJlIEEtdmVyZGlrdHMgcHLDpm1pcy4iLCJLLTcvUyDDlyBwbGFuLm1kOjQzOCDigJQgaW5nZW4gdWFubWVsZHQgw6ZuZHJpbmcgYWYgZWZmZWt0LWJpZCBlbGxlciBtdXRhbnRrcmF2OyBrdW4gcnVubmVyLXN0aWVuIGVyIHRpbGbDuGpldC4gUEFTUyB2ZWQgbWVrYW5pc2sgZGVsdGEta29udHJvbC4iXSwiY2xhaW1fZ3JhcGhfcmVmcyI6W10sImV2aWRlbmNlIjpbeyJwYXRoIjoicGxhbi1idWlsZC9sb2thdGlvbnMtc2thYmVsb24vcGxhbi5tZCIsImxpbmVfc3BhbiI6WzM3LDM3XX0seyJwYXRoIjoicGxhbi1idWlsZC9sb2thdGlvbnMtc2thYmVsb24vcGxhbi5tZCIsImxpbmVfc3BhbiI6WzM5MSwzOTFdfSx7InBhdGgiOiJwbGFuLWJ1aWxkL2xva2F0aW9ucy1za2FiZWxvbi9wbGFuLm1kIiwibGluZV9zcGFuIjpbNDM2LDQzOF19LHsicGF0aCI6InBsYW4tYnVpbGQvbG9rYXRpb25zLXNrYWJlbG9uL3BsYW4ubWQiLCJsaW5lX3NwYW4iOlsxMDE2LDEwMTZdfSx7InBhdGgiOiJwbGFuLWJ1aWxkL2xva2F0aW9ucy1za2FiZWxvbi9wbGFuLm1kIiwibGluZV9zcGFuIjpbMTAzMSwxMDM4XX0seyJwYXRoIjoicGxhbi1idWlsZC9sb2thdGlvbnMtc2thYmVsb24vZm9ydmVudG5pbmdzLW1hbmlmZXN0Lmpzb24iLCJsaW5lX3NwYW4iOlsxMywxNl19LHsicGF0aCI6InBsYW4tYnVpbGQvbG9rYXRpb25zLXNrYWJlbG9uL2ZvcnZlbnRuaW5ncy1tYW5pZmVzdC5qc29uIiwibGluZV9zcGFuIjpbMzE4NCwzMTk2XX1dfQ==