**1) Rest-status — DOM: FAIL**

**KB-#6 er ikke fuldt lukket: A8-1, klasse (a).** `K-1/S/neg-1` beholder en sole-binding, hvis foreskrevne grant-mutant ikke kan frembringe den lovede lagrede lokation gennem planens triggersti. De øvrige 11 sole-afgørelser, KB-#7 og FA-3 består kildekontrollen. Intet konstateret krav-problem → ingen HALT.

Dommen binder plan `807fdf93056180c766d23f93c4137ded98b78e3b`. Uændret indhold bæres af **A7**, `plan-angreb-r7.md @ fa3d9c13533318a298b47282b3dd0cfbb871d2ce`, PASS over v3.5. Dette er en plandom; ingen implementeret effekt eller dræbt produktmutant attesteres.

**2) Hunk-kontrol**

Begge `diff` er kørt mod de hash-verificerede v3.5-kopier. Planen har **14 erstatningshunks og én indsættelse**. I §1–§3 ændres præcis **221, 238, 240, 246, 253 og 526**; resten er byte-identisk.

Filnavne nedenfor er under `plan-build/lokations-skabelon/`.

| Plan-diff-hunk | Henvisning i §11.7 | Dækket? |
|---|---|---|
| `1c1` | Hoved/§0, :1049 | Ja |
| `11c11` | Hoved/§0, :1049 | Ja |
| `13c13` | Hoved/§0, :1049 | Ja |
| `20c20` | Hoved/§0, :1049 | Ja |
| `33c33` | FA-3, :1048 | Ja |
| `104c104` | KB-#6, :1046 | Ja |
| `221c221` | KB-#6, :1046 | Ja |
| `238c238` | KB-#7, :1047 | Ja |
| `240c240` | KB-#7, :1047 | Ja |
| `246c246` | KB-#6, :1046 | Ja |
| `253c253` | KB-#6, :1046 | Ja |
| `526c526` | KB-#7, :1047 | Ja |
| `672c672` | KB-#6, :1046 | Ja |
| `678c678` | FA-3, :1048 | Ja |
| `1038a1039,1050` | Selve §11.7; indsættelsen angivet :1042 | Ja |

Manifestets **23 hunks** er alle anmeldt:

| Manifest-diff-hunk(s) | §11.7-henvisning | Dækket? |
|---|---|---|
| `15c15` | Planbinding, :1042 | Ja |
| `21c21` | Guard-beskrivelse, :1042/:1046 | Ja |
| `240c240`; `250,251c250` | K-1/ac-3/neg-1, :1046 | Ja |
| `383c382` | K-1/S/neg-1, :1046 | Ja |
| `459c458` | K-2/ac-1/neg-5, :1046 | Ja |
| `610c609`; `620,621c619` | K-2/ac-5/neg-1, :1046 | Ja |
| `970c968`; `980,981c978` | K-3/ac-5/neg-1, :1046 | Ja |
| `1256c1253`; `1266,1267c1263` | K-4/ac-3/neg-1, :1046 | Ja |
| `1302c1298`; `1312,1313c1308` | K-4/ac-4/neg-1, :1046 | Ja |
| `1586c1581`; `1596,1597c1591` | K-5/ac-1/neg-4, :1046 | Ja |
| `2250c2244` | K-6/ac-6/neg-1, :1046 | Ja |
| `2757c2751`; `2767,2768c2761` | K-7/ac-2/neg-1, :1046 | Ja |
| `3185c3178` | K-7/S/neg-8, :1047 | Ja |
| `3219c3212` | K-8/ac-1/neg-1, :1046 | Ja |
| `3368c3361`; `3378,3379c3371` | K-8/ac-3/neg-1, :1046 | Ja |

**3) Delta pr. rettelse**

**KB-#6 — afgørelser pr. negativ**

| Negativ | Afgørelse | Rigtig? | Kilde og efterprøvning |
|---|---|---|---|
| K-1/S/neg-1 | BEHOLD | **Nej** | `plan.md:288,304,312–314,520,672`; `forventnings-manifest.json:381–393`. Direkte INSERT udløser historikskrivning, hvis adgangsblokering består efter det ene GRANT. **A8-1 nedenfor.** |
| K-2/ac-1/neg-5 | BEHOLD | Ja | `plan.md:288,295,313`; manifest :457–469. INSERT af en gyldig stand med `dagspris=NULL` udløser ingen prislog-INSERT. Grant + GUC kan derfor give den forbudte lagrede stand. |
| K-6/ac-6/neg-1 | BEHOLD | Ja | `plan.md:221,288,299,311`; manifest :2243–2255. Åben række lukkes med gyldig `gaeldende_til`, mens guardens beskyttede felter bevares. Guarden tillader denne UPDATE; pending-kæden kan omgås efter grant. |
| K-8/ac-1/neg-1 | BEHOLD | Ja, for repræsentanten | `plan.md:246,288,292`; manifest :3211–3223. UPDATE `grupper` kan passere write-policy med selvsat GUC og gyldig årsag efter grant. Den brede generalisering rammes dog af A8-1. |
| K-1/ac-3/neg-1 | FJERN | Ja | `plan.md:288,297,310`; manifest :239–250. Pinnet UPDATE af `pris_historik` møder RLS default-deny; immutability består også. |
| K-2/ac-5/neg-1 | FJERN | Ja | `plan.md:288,295`; manifest :608–619. Ingen DELETE-policy; grant alene giver ingen slettet stand. |
| K-3/ac-5/neg-1 | FJERN | Ja | `plan.md:288,292`; manifest :967–978. Ingen DELETE-policy; FK-beskyttelse er yderligere dækning. |
| K-4/ac-3/neg-1 | FJERN | Ja | `plan.md:288,296`; manifest :1252–1263. Statusloggen har ingen INSERT-policy; grant alene tillader ingen event-række. |
| K-4/ac-4/neg-1 | FJERN | Ja | `plan.md:288,296,310`; manifest :1297–1308. Pinnet UPDATE dækkes af default-deny og immutability. |
| K-5/ac-1/neg-4 | FJERN | Ja | `plan.md:288,296`; manifest :1580–1591. Samme statuslog-INSERT som K-4/ac-3; RLS forhindrer den skjulte aktivering. |
| K-7/ac-2/neg-1 | FJERN | Ja | `plan.md:288,293`; manifest :2750–2761. Ingen DELETE-policy på `gruppe_kontakter`; rækken består efter grant alene. |
| K-8/ac-3/neg-1 | FJERN | Ja | `plan.md:91,288,310–311`; manifest :3360–3371. Repræsentanten `audit_log` ligger uden for pakkens ni tabeller og har sin egen immutability-familie. |

**A8-1 — klasse (a), rest i KB-#6: historikskrivernes adgangslag er overset.**

Den ændrede beskrivelse i `forventnings-manifest.json:382` lover:

`GRANT INSERT lokationer` + selvsat GUC/årsag → lagret lokation uden stand/status-event.

Men `plan.md:312,314,520` monterer AFTER INSERT-triggere, som skriver til `pris_historik` og `lokation_gruppe_historik`. Historikfunktionerne er ikke specificeret som `SECURITY DEFINER`; den beskrevne SECDEF-kontekst kommer fra RPC-vejen (`plan.md:319,520,673`). Direkte INSERT som `authenticated` får ikke denne RPC-ejerkontekst.

Med planens almindelige invoker-form rammer historik-INSERT derfor de fortsat manglende grants på logtabellerne (`plan.md:288`); logtabellernes manglende write-policies består også. Statementet rulles tilbage. **En ændret 42501-besked fra en historiktabel er ikke den lovede lagrede effekt og må ikke krediteres som et D10-drab.**

Dette er inden for den navngivne rettelse: [plan.md:672](/tmp/claude-1000/-home-mathias/f959f211-d030-4057-8817-443b2b6f1add/scratchpad/r5/wd-a/plan-build/lokations-skabelon/plan.md:672) og manifest :382 hævder netop, at revoken bærer alene.

Minimal rettelse inden for eksisterende produktkontrakt: fjern K-1/S’s sole-binding, behold negativet og dets reject-contract, og ret de afledte generaliseringer og tal til **3 app-revoke-bindinger / 39 sole-bindinger**. K-1’s øvrige targeted mutanter består. Tilføjelse af privilegier eller fjernelse af historikværn for at få mutanten til at virke ville ændre forsøgets grundlag.

**KB-#7**

| Efterprøvning | Resultat | Kilde |
|---|---|---|
| Bid 2 bevarer otte negativer, registry-positivet og FS audit-hash efter W3 | **Rettet med kildebevis** | `plan.md:238,240,526`; manifest :3048–3068,3178 |
| Faktisk adresseanonymisering gennem lifecycle → W18 består i Bid 5.1 | **Rettet med kildebevis** | `plan.md:237`; manifest :2882,2903–2912 |
| T7.18 dræbes gennem registry-effekten; `grupper`/`dagspris` forbliver negative kontroller | **Konsistent** | `plan.md:238,240` |
| K:136/K:143 indsnævres ikke; intet assertion-ID eller effekt-bid flyttes | **Bestået** | `docs/sandhed/krav/lokations-skabelon-krav.md:136–143`; strukturel manifest-sammenligning |

**FA-3**

| Efterprøvning | Resultat | Kilde |
|---|---|---|
| Produktet beholder `clock_timestamp()`; ingen produkt-tidsparameter eller override | **Rettet med kildebevis** | `plan.md:33,308–309,678`; krav :97 |
| Målelaget påvirker Postgres-processens klokke, fremad; produktkoden ændres ikke | **Konsistent** | `plan.md:33,678` |
| Ingen skrivning af pending-status, deadline eller domænerækker for at tvinge due | **Bevaret** | `plan.md:33`; `p8-slutproeve-spec.md:191` |
| Navngivne forløb i Bid 2–5, apply-rolle og faktisk retention-scheduler består | **Bevaret ordret** | `plan.md:33`; diffens uændrede suffix |

Procesklokken ændrer forsøgets tid uden at indføre en omgåelseshandling i produktet. Den faktiske clock-/scheduler-afvikling skal fortsat bevises i build.

**4) Manifest-delta og validator**

Den strukturelle sammenligning accepterer præcis:

- `bindings.plan.oid` → den verificerede v3.6-planblob.
- Én guard-beskrivelse og 13 negativbeskrivelser.
- Otte navngivne fjernelser af `sole_guard_ref`.

Alt øvrigt er identisk: **60 forpligtelser, 127 negativer, 150 assertions, 12 guard-ID’er**, alle reject-contracts, bevisformer, scope og effekt-bids. Sole-bindinger: **48 → 40**. Plan og manifest stemmer strukturelt overens, men gentager A8-1’s fejlagtige sole-påstand.

Kørt med exit **0**:

```text
node scripts/v5/forventnings-manifest.mjs validate plan-build/lokations-skabelon/forventnings-manifest.json
✓ manifest gyldigt: lokations-skabelon · 9 K · 60 forpligtelser i nu-scope (0 overdraget) · 127 negativer · pr. form {"UT":47,"MH":19,"FS":35,"SA":2} · 12 eneste-værn
```

**5) A8-n uden for hunks**

Ingen yderligere materielle fund uden for hunks. **A8-1 er en åben klasse-(a)-rest i KB-#6**, efterprøvet mod dens triggerafhængigheder. Den er ikke lukket af validatoren eller §11.7’s RB-label.

**6) Binding**

Alle syv gate-inputs matcher `git hash-object`:

| Artefakt | Verificeret blob-OID |
|---|---|
| `plan.md` — 1051 linjer | `807fdf93056180c766d23f93c4137ded98b78e3b` |
| `forventnings-manifest.json` | `6111747df50432655a8d5aabaea8bb0ef1d1f1ef` |
| `docs/sandhed/krav/lokations-skabelon-krav.md` | `9402164d87a35fb939661058bea77c1a052493d0` |
| `recon2.md` | `2bdbb122158b6f8c72fc942b8de28e679742b4aa` |
| `p8-slutproeve-spec.md` | `4af07ef4164882ca54643e79df3554c0bf22b0e4` |
| `ordbog.md` | `bcab6b4ed9c9c0fe21f13c70d8e1d47a2afd9fef` |
| `kill-list-udkast.md` | `13b783927f4fed107caa0e849e65499fd3291b61` |

Commit `0264a2912e519b1ac9a179e1000030802abe59a3` er driveroplyst; uden `.git` attesteres filbytes, ikke commit-medlemskab. Ingen filer ændret; intet web anvendt. Dommen er Codex’ blokerende input til plan-gaten; den endelige afgørelse ligger hos gate-kernen og Mathias.

VERDIKT-DRAFT: eyJha3RvciI6ImNvZGV4IiwiY29uY2x1c2lvbiI6IkZBSUwiLCJuZWdhdGl2ZV9jYXNlcyI6WyJLLTEvUy9uZWctMSDDlyBwbGFuLm1kOjY3MiDigJQgRkFJTDogcmVuIGdyYW50LUlOU0VSVCBlZnRlcmxhZGVyIGhpc3Rvcmlrc2tyaXZlcm5lcyBBQ0wvUkxTOyBkZW4gbG92ZWRlIGxhZ3JlZGUgbG9rYXRpb24gZsO4bGdlciBpa2tlIGFmIHBsYW5lbi4iLCJLLTIvYWMtMS9uZWctNSDDlyBwbGFuLm1kOjMxMyDigJQgUEFTUzogSU5TRVJUIHN0YW5kIG1lZCBkYWdzcHJpcyBOVUxMIHVuZGfDpXIgaGlzdG9yaWstSU5TRVJUOyBzb2xlLWJpbmRpbmdlbiBoYXIgZW4gbsOlYmFyIGVmZmVrdHN0aS4iLCJLLTYvYWMtNi9uZWctMSDDlyBwbGFuLm1kOjIyMSDigJQgUEFTUzogbHVrLVVQREFURSBww6Ugw6ViZW4ga29ibGluZyBlciB0aWxsYWR0IGFmIGd1YXJkZW4gaSAzMTE7IHNvbGUtYmluZGluZ2VuIGJldmFyZXMga29ycmVrdC4iLCJLLTgvYWMtMS9uZWctMSDDlyBwbGFuLm1kOjI0NiDigJQgUEFTUyBmb3IgcmVwcsOmc2VudGFudGVuIFVQREFURSBncnVwcGVyOiBncmFudCBvZyBzZWx2c2F0IEdVQyDDpWJuZXIgZGVuIGRpcmVrdGUgc2tyaXZldmVqLiIsIkstMS9hYy0zL25lZy0xIMOXIHBsYW4ubWQ6Mjk3IOKAlCBQQVNTOiBoaXN0b3JpayBoYXIgZGVmYXVsdC1kZW55IG9nIGltbXV0YWJpbGl0eTsgRkpFUk4gbWlzdGVyIGluZ2VuIGVmZmVrdC1raWxsIGZvciBkZW4gcGlubmVkZSBVUERBVEUuIiwiSy00L2FjLTMvbmVnLTEgw5cgcGxhbi5tZDoyOTYg4oCUIFBBU1M6IHN0YXR1c2xvZ2dlbiBtYW5nbGVyIGluc2VydC1wb2xpY3k7IEZKRVJOIGJldmFyZXIgbmVnYXRpdmV0IG9nIGRldHMgcmVqZWN0X2NvbnRyYWN0LiIsIkstMi9hYy01L25lZy0xIMOXIHBsYW4ubWQ6Mjg4IOKAlCBQQVNTOiBpbmdlbiBkZWxldGUtcG9saWN5OyBGSkVSTiBtaXN0ZXIgaW5nZW4gZWZmZWt0LWtpbGwgZm9yIERFTEVURSBzdGFuZGUuIiwiSy03L1MvbmVnLTggw5cgcGxhbi5tZDoyMzgg4oCUIFBBU1M6IHJlZ2lzdHJ5LXBvc2l0aXYgb2cgVDcuMTggYmxpdmVyIGkgQmlkIDI7IG90dGUgbmVnYXRpdmVyIG9nIEZTIGF1ZGl0LWhhc2ggYmV2YXJlcy4iLCJLLTcvYWMtNCDDlyBwbGFuLm1kOjIzNyDigJQgUEFTUzogZmFrdGlzayBhZHJlc3NlYW5vbnltaXNlcmluZyB2aWEgbGlmZWN5Y2xlIG9nIFcxOCBiZXN0w6VyIGkgQmlkIDUuMSBtZWQgdcOmbmRyZWRlIGFzc2VydGlvbnMuIiwiSy01L2FjLTEgw5cgcGxhbi5tZDozMyDigJQgUEFTUzogbcOlbGVsYWdldCBzdHlyZXIgUG9zdGdyZXMtcHJvY2Vzc2VucyBrbG9ra2U7IGluZ2VuIHByb2R1a3Qtb3ZlcnJpZGUgZWxsZXIgRE1MIHRpbCBhdCB0dmluZ2UgZHVlLiJdLCJjbGFpbV9ncmFwaF9yZWZzIjpbXSwiZXZpZGVuY2UiOlt7InBhdGgiOiJwbGFuLWJ1aWxkL2xva2F0aW9ucy1za2FiZWxvbi9wbGFuLm1kIiwibGluZV9zcGFuIjpbMjg4LDMxNF19LHsicGF0aCI6InBsYW4tYnVpbGQvbG9rYXRpb25zLXNrYWJlbG9uL3BsYW4ubWQiLCJsaW5lX3NwYW4iOls1MjAsNTIwXX0seyJwYXRoIjoicGxhbi1idWlsZC9sb2thdGlvbnMtc2thYmVsb24vcGxhbi5tZCIsImxpbmVfc3BhbiI6WzY3Miw2NzJdfSx7InBhdGgiOiJwbGFuLWJ1aWxkL2xva2F0aW9ucy1za2FiZWxvbi9mb3J2ZW50bmluZ3MtbWFuaWZlc3QuanNvbiIsImxpbmVfc3BhbiI6WzM4MSwzOTNdfSx7InBhdGgiOiJwbGFuLWJ1aWxkL2xva2F0aW9ucy1za2FiZWxvbi9wbGFuLm1kIiwibGluZV9zcGFuIjpbMjM3LDI0MF19LHsicGF0aCI6InBsYW4tYnVpbGQvbG9rYXRpb25zLXNrYWJlbG9uL2ZvcnZlbnRuaW5ncy1tYW5pZmVzdC5qc29uIiwibGluZV9zcGFuIjpbMzA0OCwzMDY4XX0seyJwYXRoIjoicGxhbi1idWlsZC9sb2thdGlvbnMtc2thYmVsb24vcGxhbi5tZCIsImxpbmVfc3BhbiI6WzMzLDMzXX0seyJwYXRoIjoicGxhbi1idWlsZC9sb2thdGlvbnMtc2thYmVsb24vcDgtc2x1dHByb2V2ZS1zcGVjLm1kIiwibGluZV9zcGFuIjpbMTkxLDE5MV19LHsicGF0aCI6ImRvY3Mvc2FuZGhlZC9rcmF2L2xva2F0aW9ucy1za2FiZWxvbi1rcmF2Lm1kIiwibGluZV9zcGFuIjpbMTM2LDE0M119LHsicGF0aCI6InBsYW4tYnVpbGQvbG9rYXRpb25zLXNrYWJlbG9uL3BsYW4ubWQiLCJsaW5lX3NwYW4iOlsxMDQyLDEwNTBdfV19Cg==