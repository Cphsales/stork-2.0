**1) Rest-status — DOM: PASS**

**A8-1/R-1 og R-2 er rettet med kildebevis.** Repræsentant-afgrænsningen er gennemført, og fabrik-vilkåret om UPDATE `grupper` er opfyldt: ingen blokerende invoker-kaskade til historik/log. Ingen uanmeldte plan-/manifestændringer; manifestet er 1:1 og gyldigt.

Dommen binder **plan v3.7 `934291780be93ec7353d7a9f777b4661e79a0158`**. Rettelsen følger A8/C5’s foreskrevne fjernelse, NULL-pinning og afgrænsning uden ny produkt- eller måleforpligtelse.

Uændret indhold videreføres fra:

- **A8**, `plan-angreb-r8.md @ 00471d62c62883f80dc1f7b0d9a406acd78e948e`, :84–102: KB-#7 og FA-3 lukket.
- **A7, runde 4**, `plan-angreb-r7.md @ fa3d9c13533318a298b47282b3dd0cfbb871d2ce`, :1–5: PASS for resten.

Dette er en plandom med kildebevis; ingen implementeret effekt eller dræbt produktmutant attesteres.

**2) Hunk-kontrol**

Byte-sammenligningen viser præcis otte linjeerstatninger og én tilføjelse. I §1–§3 ændres kun **246 og 253**.

| Hunk v3.6 → v3.7 | Indhold | §11.8-henvisning | Dækket |
|---|---|---|---|
| `1c1` | Version og provenance-OID’er | :1057 | Ja |
| `11c11` | Indledning om rettelsen | :1053–1057 | Ja |
| `13c13` | Arbejdsgrundlagets commit | :1057 | Ja |
| `104c104` | AK-DIREKTE-DML’s værnfordeling | :1061–1062 | Ja |
| `246c246` | T8.1 afgrænset til repræsentanten | :1061/:1063 | Ja |
| `253c253` | Kill-list-binding og 4 → 3 | :1057 | Ja |
| `672c672` | S-29: fjernelse, pinning og tal | :1061–1062 | Ja |
| `1046c1046` | Tilbagetrækning i tidligere ændringslog | :1061 | Ja |
| `1051a1052,1064` | Selve §11.8 | :1053–1064 | Ja |

Alle øvrige bytes er identiske med den hash-verificerede v3.6-kopi.

**3) Lukning ved kilden og fabrik-vilkår**

Stier uden præfiks nedenfor ligger i `plan-build/lokations-skabelon/`.

| Efterprøvning | Udfald | Kildebevis |
|---|---|---|
| **A8-1/R-1 lukket ved kilden?** | **Ja** | `plan.md:104,312–314,520,672`; manifest :381–392. Direkte INSERT `lokationer` rammer invoker-historikskrivernes manglende logadgang. Sole-bindingen er fjernet; negativet og hele reject-contracten består. Et ændret fejlbudskab krediteres ikke som lagret effekt. |
| **R-2 pinnet korrekt?** | **Ja** | `plan.md:104,313,672`; manifest :456–468. INSERT `stande` er eksplicit pinnet til `dagspris IS NULL`, hvor ingen prislog-INSERT udføres. Formen med pris er udtrykkeligt dobbelt dækket. |
| **K-8/ac-1/neg-1 afgrænset til repræsentanten?** | **Ja** | `plan.md:246,253,672`; manifest :3210–3222. Sole-påstanden gælder UPDATE `grupper`; de **36 normale afvisningsprøver** består. |
| **K-6/ac-6/neg-1 fortsat sole i luk-formen?** | **Ja** | `plan.md:221,288,311,548–559`; manifest :2242–2254. Gyldig lukning bevarer guardens beskyttede felter og indsnævrer intervallet. `set_updated_at` og SECDEF-audit tilføjer ingen blokering. |
| **UPDATE `grupper` → blokerende invoker-logkaskade?** | **Nej** | `plan.md:288,292,309–317,401–430`: `grupper` får fælleshalens tidsstempel- og audittrigger. Historiktriggerne er monteret på `lokationer`/`stande`; klassifikationstriggeren på `data_field_definitions`. Ingen af dem monteres på `grupper`. |

**Fabrik-vilkåret er særskilt bekræftet:**

- `supabase/migrations/20260514120005_t1_data_field_definitions.sql:45–54`: `set_updated_at` ændrer kun `NEW.updated_at` og returnerer rækken.
- `supabase/migrations/20260514120003_t1_audit_partitioned.sql:93–97,153–163`: `stork_audit` skriver til auditloggen som **SECURITY DEFINER**. Auditloggen har ENABLE uden FORCE (:71–76).
- Den senere redefinering, `supabase/migrations/20260514160000_t1_inline_fix_audit_non_uuid_id.sql:30–34,98–108`, **bevarer SECURITY DEFINER**.

Der sker altså audit-skrivning, men ikke A8-1’s blokerende invoker-kaskade. Med T8.1’s UPDATE-grant, læseadgang, gyldige felter/årsag og selvsat GUC kan repræsentantens ændring lagres efter den specificerede DDL. **Sole beholdes; antallet er 3, ikke 2.** Dette følger effektkravet i `kill-list-udkast.md:180`.

**4) Manifest-delta og validator**

Den strukturelle sammenligning tillader præcis disse seks feltændringer:

| Manifest-hunk | Ændring | §11.8 |
|---|---|---|
| `15c15` | `bindings.plan.oid` → verificeret v3.7-blob | :1057 |
| `21c21` | `g.app_dml_revoke.beskrivelse` | :1057/:1063 |
| `382c382` | K-1/S/neg-1’s beskrivelse | :1061 |
| `392,393c392` | K-1/S/neg-1’s `sole_guard_ref` fjernet | :1061 |
| `458c457` | K-2/ac-1/neg-5’s NULL-pinning | :1062 |
| `3212c3211` | K-8/ac-1/neg-1’s repræsentant-afgrænsning | :1063 |

Alle øvrige værdier og rækkefølger er identiske: **60 forpligtelser, 127 negativer, 150 assertions, 12 guards**, alle reject-contracts, bevisformer og effekt-bids. Sole-bindinger **40 → 39**; `g.app_dml_revoke` **4 → 3**. De tre tilbageværende bindinger stemmer med planens konkrete operationsformer.

Kørt med exit **0**:

```text
node scripts/v5/forventnings-manifest.mjs validate plan-build/lokations-skabelon/forventnings-manifest.json
✓ manifest gyldigt: lokations-skabelon · 9 K · 60 forpligtelser i nu-scope (0 overdraget) · 127 negativer · pr. form {"UT":47,"MH":19,"FS":35,"SA":2} · 12 eneste-værn
```

**5) A9-n — nye fund uden for hunks**

Ingen nye materielle fund. Ingen åben klasse-(a)-rest i rettelsen eller konstateret kravændring. PASS bygger på de efterprøvede rettelser og triggerafhængigheder ovenfor.

**6) Binding**

Alle syv gate-inputs er verificeret med `git hash-object`:

| Artefakt | Verificeret blob-OID |
|---|---|
| `plan.md` — 1064 linjer | `934291780be93ec7353d7a9f777b4661e79a0158` |
| `forventnings-manifest.json` | `4e84481d6df1750581cce8b78288602006d06cc2` |
| `docs/sandhed/krav/lokations-skabelon-krav.md` | `9402164d87a35fb939661058bea77c1a052493d0` |
| `recon2.md` | `2bdbb122158b6f8c72fc942b8de28e679742b4aa` |
| `p8-slutproeve-spec.md` | `4af07ef4164882ca54643e79df3554c0bf22b0e4` |
| `ordbog.md` | `bcab6b4ed9c9c0fe21f13c70d8e1d47a2afd9fef` |
| `kill-list-udkast.md` | `13b783927f4fed107caa0e849e65499fd3291b61` |

Pinned commit **`0288741faad5b0bcbf25f7a6ab2147791e61611c`** er driveroplyst; uden `.git` attesteres filbytes, ikke commit-medlemskab. Ingen filer ændret; intet web anvendt. Dommen er Codex’ input til plan-gaten; gate-kernen og Mathias træffer den endelige afgørelse.

VERDIKT-DRAFT: eyJha3RvciI6ImNvZGV4IiwiY29uY2x1c2lvbiI6IlBBU1MiLCJuZWdhdGl2ZV9jYXNlcyI6WyJLLTEvUy9uZWctMSDDlyBwbGFuLm1kOjEwNCwzMTIsMzE0LDY3MiDigJQgSU5TRVJUIGxva2F0aW9uZXIga2Fza2FkZXJlciBzb20gaW52b2tlciB0aWwgbG9nczsgc29sZSBmamVybmV0LCByZWplY3RfY29udHJhY3QgYmV2YXJldC4gQTgtMS9SLTEgbHVra2V0IG1lZCBraWxkZWJldmlzIGkgdjMuNy4iLCJLLTIvYWMtMS9uZWctNSDDlyBwbGFuLm1kOjEwNCwzMTMsNjcyIOKAlCBJTlNFUlQgc3RhbmRlIGVyIHBpbm5ldCB0aWwgZGFnc3ByaXMgSVMgTlVMTDsgaW5nZW4gcHJpc2xvZy1JTlNFUlQgaSBkZW5uZSBmb3JtLiBSLTIgbHVra2V0OyBzb2xlIGtvcnJla3QgYmVob2xkdC4iLCJLLTYvYWMtNi9uZWctMSDDlyBwbGFuLm1kOjIyMSwyODgsMzExIOKAlCBsdWstZm9ybWVuIHRpbGxhZGVzIGFmIGd1YXJkZW47IGd5bGRpZyBzbHV0ZGF0byBvZyBTRUNERUYtYXVkaXQgZ2l2ZXIgaW5nZW4gZWtzdHJhIGJsb2tlcmluZy4gU29sZSBrb3JyZWt0IGJlaG9sZHQuIiwiSy04L2FjLTEvbmVnLTEgw5cgcGxhbi5tZDoyNDYsMjg4LDQwMS00MzAg4oCUIFVQREFURSBncnVwcGVyIGhhciBpbmdlbiBpbnZva2VyLWxvZ2thc2thZGU7IHNldF91cGRhdGVkX2F0IHNrcml2ZXIga3VuIE5FVywgc3RvcmtfYXVkaXQgZXIgU0VDREVGLiBGYWJyaWstdmlsa2FhciBvcGZ5bGR0OyBzb2xlIGJlaG9sZHQuIiwiSy04L2FjLTEvbmVnLTEgw5cgcGxhbi5tZDoyNDYsMjUzLDY3MiDigJQgc29sZSBhZmdyYWVuc2V0IHRpbCByZXByYWVzZW50YW50ZW47IGFsbGUgMzYgbm9ybWFsZSBETUwtYWZ2aXNuaW5nZXIgYmVzdGFhci4gSW5nZW4gbmVnYXRpdi1mb3JwbGlndGVsc2UgaW5kc2tyYWVua2V0LiIsIkstMS4uSy05IMOXIHBsYW4ubWQ6MTA1Ny0xMDY0IOKAlCBieXRlLWRpZmYgbWF0Y2hlciBhbGxlIG5pIGFubWVsZHRlIGh1bmtzOyBtYW5pZmVzdCBoYXIga3VuIHNla3MgdGlsbGFkdGUgZmVsdGRlbHRhZXIuIDYwLzEyNy8xNTAgb2cgMTIgZ3VhcmRzIGJldmFyZXQ7IHZhbGlkYXRvciBleGl0IDAuIiwiSy03L1Mgw5cgcGxhbi5tZDoyMzgsMjQwLDUyNiDigJQgYnl0ZS1pZGVudGlzayBtZWQgdjMuNjsgQTgncyBraWxkZWJldmlzIGZvciBLQi0jNyB2aWRlcmVmb2VydCwgaW5nZW4gbnkgZ2VubGFlc25pbmcuIiwiSy01L2FjLTEgw5cgcGxhbi5tZDozMyw2Nzgg4oCUIEZBLTMgYnl0ZS1pZGVudGlzayBtZWQgdjMuNjsgQTgncyBraWxkZWJldmlzIHZpZGVyZWZvZXJ0LiBJbmdlbiBpbXBsZW1lbnRlcmV0IGVmZmVrdCBlbGxlciBtdXRhbnRkcmFiIGF0dGVzdGVyZXQgaGVyLiJdLCJjbGFpbV9ncmFwaF9yZWZzIjpbXSwiZXZpZGVuY2UiOlt7InBhdGgiOiJwbGFuLWJ1aWxkL2xva2F0aW9ucy1za2FiZWxvbi9wbGFuLm1kIiwibGluZV9zcGFuIjpbMjQ2LDI1M119LHsicGF0aCI6InBsYW4tYnVpbGQvbG9rYXRpb25zLXNrYWJlbG9uL3BsYW4ubWQiLCJsaW5lX3NwYW4iOlsyODgsMzE0XX0seyJwYXRoIjoicGxhbi1idWlsZC9sb2thdGlvbnMtc2thYmVsb24vcGxhbi5tZCIsImxpbmVfc3BhbiI6WzQwMSw0MzBdfSx7InBhdGgiOiJwbGFuLWJ1aWxkL2xva2F0aW9ucy1za2FiZWxvbi9wbGFuLm1kIiwibGluZV9zcGFuIjpbNjcyLDY3Ml19LHsicGF0aCI6InBsYW4tYnVpbGQvbG9rYXRpb25zLXNrYWJlbG9uL3BsYW4ubWQiLCJsaW5lX3NwYW4iOlsxMDUzLDEwNjRdfSx7InBhdGgiOiJwbGFuLWJ1aWxkL2xva2F0aW9ucy1za2FiZWxvbi9mb3J2ZW50bmluZ3MtbWFuaWZlc3QuanNvbiIsImxpbmVfc3BhbiI6WzM4MSwzOTJdfSx7InBhdGgiOiJwbGFuLWJ1aWxkL2xva2F0aW9ucy1za2FiZWxvbi9mb3J2ZW50bmluZ3MtbWFuaWZlc3QuanNvbiIsImxpbmVfc3BhbiI6WzQ1Niw0NjhdfSx7InBhdGgiOiJwbGFuLWJ1aWxkL2xva2F0aW9ucy1za2FiZWxvbi9mb3J2ZW50bmluZ3MtbWFuaWZlc3QuanNvbiIsImxpbmVfc3BhbiI6WzMyMTAsMzIyMl19LHsicGF0aCI6InBsYW4tYnVpbGQvbG9rYXRpb25zLXNrYWJlbG9uL2tpbGwtbGlzdC11ZGthc3QubWQiLCJsaW5lX3NwYW4iOlsxODAsMTgwXX1dfQ==