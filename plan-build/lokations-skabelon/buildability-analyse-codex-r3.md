**PASS — codex, DELTA-RE-BIND runde 3.** Deltaet ændrer ikke min r2-konklusion: K-1 til K-9 er fortsat byggelige med mekanisk efterprøvelige acceptkriterier. De nye plan-defaults ligger inden for kravets udtrykkelige planmandat. Ingen ny kravblokker eller uafgørlig byggeligheds-usikkerhed er fundet.

Min forhistorie er de committede `plan-build/lokations-skabelon/verdikt-codex-krav-r2.json` og `buildability-analyse-codex-r2.md`, begge læst. Denne korte analyse vurderer deltaet; r2's gennemgang af uændrede krav og byggearbejde består. Brugerens r3-instruks bestemmer filnavne, run_id og byggerkald frem for de ældre eksempler i INSTRUKS.md.

**Identitet og faktisk diff.** `git rev-parse d5fa4bed145505461a7d6af5e9f3b1646c2ba55f:docs/sandhed/krav/lokations-skabelon-krav.md` gav præcis `b9c5249b7ab90d8898992bde61b8cb018bc4f561`. HEAD er samme pinned commit. R2-blobben er `43b3e0aa760e2060391b70f018ef64ca8fe34284`. Direkte blob-diff viser 2 slettede og 2 tilføjede tekstlinjer: erstatninger på linje 54 og 181, ingen indsatte/fjernede linjepositioner. Der er derfor ingen linjeforskydning. Recon- og anker-bindingerne er genverificeret til henholdsvis `7fbd3a2f43c03ce239aa81e20483326bf438463c` og `7096d2ecbebce37426899dce29ba1984f3225293`; ankeret er genlæst. Alle evidensuddrag er læst ved deres OID i den nye commit.

**K-3-citat, linje 54.** De to forekomster af »lokation«/»lokationer« inde i M-17-citatet er rettet til kildens »loaktion«/»loaktioner«. Uddraget er verificeret mod M-17 i ledgeren ved pinned commit. Det ændrer ingen entitet, relation eller acceptregel.

**Gruppetype, linje 181.** Default »valgfri ved oprettelse, krævet før rabat-brug i trin 29« er kodbar som en tom tilladt type på gruppen, valideret værdi ved udfyldning og en obligatorisk kontrol ved rabatforbruget. Manglende type må ikke udfyldes med en skjult standardkategori. Positivt: en navngivet gruppe uden type kan oprettes, typen kan senere sættes gennem offentlig indgang. Negativt: rabat-brug uden type afvises i trin 29; med gyldig type passerer typekontrollen. Gruppens typefelt og opslag leveres nu, rabatmekanikken ligger fortsat nedstrøms (linje 411-412). Dette ændrer ikke K-1's særskilte lokationstype eller K-9's strukturelle forbud. Det er et eksplicit plan-default, ikke en antagelse om et allerede implementeret rabatcheck.

**Fravalg på nedlagt lokation, linje 181.** Defaultafvisningen kan bygges som statuskontrol i den autoritative lokale skrivevej og genvalidering ved pending/apply, serialiseret med statusændringen. Positivt: lokale til-/fravalg er fortsat mulige i dvale (K-4 ac 6) og efter genåbning. Negativt: lokal fravalgs-/frakoblingshandling på nedlagt lokation afvises uden at ændre fravalg eller historiske rettighedssvar; også en tidligere bestilt ændring skal afvises, hvis lokationen er nedlagt ved apply. Recon 309-328 bærer pending/apply-mønstret; pakkens handlers og statuskontrol skal bygges som allerede beskrevet i r2.

Afvisningen gælder handlingen på den nedlagte lokation. Gruppefrakobling er fortsat en gruppehandling efter K-6 ac 6 og skal kunne ændre gruppens gældende klientmængde, også når en af dens lokationer er nedlagt. Automatisk frakobling ved selve nedlæggelsen er statusovergangens krævede følge, ikke et separat brugerfravalg, der må blokere overgangen. Dermed kan K-4 ac 9/K-6 ac 9 opfyldes atomisk, og genåbning arver gruppens da gældende klienter. Bevarelse kontra nulstilling af tidligere fravalg er fortsat et særskilt delegeret planvalg. Ingen konflikt med K-3/K-6's generelle lokale fravalgsmulighed.

**Anonymiseringsvej, linje 181 og K-7 ac 4.** Planvalget mellem kolonner og registry-JSONB synliggør præcis r2's kendte byggearbejde. Den generiske anonymisering gennemløber fysiske direct-PII-kolonner (`20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql:54-118`); audit-filterets eksisterende JSONB-walk er specifikt for clients.fields og inkluderer inaktive direct-PII-definitioner (`20260521000004_t10_audit_filter_values.sql:78-105`). Begge kodeuddrag er genlæst ved pinned commit.

JSONB-valget kræver derfor feltvis dækning gennem klassifikation, audit-filter, anonymisering og replay, også for udfasede felter med bevarede personværdier. K-7 ac 4 er en leveranceforpligtelse: en fysisk kolonneklassifikationskontrol alene beviser ikke JSONB-dækningen. Negativt skal manglende anonymiseringsvej for en personfeltnøgle blokere leverancen; positivt skal anonymisering og replay erstatte personværdier og bevare række, relationer og audit. Kolonnevalget fritager heller ikke planen fra K-7/K-9's UI-styrbare felt-registry og drift uden ny udviklerleverance. En udvidet, datadrevet JSONB-vej er en konkret byggelig løsning; lagringsvalget træffes fortsat i planen. Ingen anonymiseringsdækning udskydes til senere trin.

**Otte evidensspænd genverificeret.** Hvert r2-uddrag blev søgt som eksakt tekst i den tilsvarende blob ved pinned commit; hvert havde præcis ét match, på den oprindelige position. De tre recon-/kodeblobs er identiske med r2. Alle otte evidensposter bindes på ny til pinned commit, og hjælperen beregner deres blob-OID og excerpt-hash fra Git.

| Evidens | Sti | R2-spænd | R3-spænd |
|---|---|---|---|
| 1 | docs/sandhed/krav/lokations-skabelon-krav.md | 35-46 | 35-46 |
| 2 | docs/sandhed/krav/lokations-skabelon-krav.md | 97-105 | 97-105 |
| 3 | docs/sandhed/krav/lokations-skabelon-krav.md | 111-126 | 111-126 |
| 4 | docs/sandhed/krav/lokations-skabelon-krav.md | 134-143 | 134-143 |
| 5 | docs/sandhed/krav/lokations-skabelon-krav.md | 165-175 | 165-181 |
| 6 | recon/recon.md | 309-328 | 309-328 |
| 7 | supabase/migrations/20260521000009_t10_client_rpcs.sql | 29-41 | 29-41 |
| 8 | scripts/fitness.mjs | 1709-1725 | 1709-1725 |

Spænd 5 er udvidet efter læsning for også at bære de nye planvilkår; det er ikke en forskydningskorrektion. De øvrige spans kræver ingen talændring. R2's negative cases videreføres og suppleres med deltaets konkrete afvisningskanter.

**Bevisgrænse.** Dette er statisk byggelighedsvurdering og evidenskontrol, ikke udførte database-/lokations-runtime-tests. Ingen webkald eller arbejde uden for workdir. `draft.json` binder SHA-256 af denne fulde UTF-8-fil og run_id `fase2-buildability-codex-r3`; `OUT-verdikt.json` bygges med `node verdikt-byg.mjs draft.json > OUT-verdikt.json`. Lokal schema-/evidensvalidering og bindinger kontrolleres efter byggerkaldet. Server-provenance forbliver hjælperens udtrykkelige residual til CI actor-runner.
