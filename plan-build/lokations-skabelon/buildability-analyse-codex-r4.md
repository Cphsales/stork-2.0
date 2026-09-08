**PASS — codex, DELTA-RE-BIND runde 4 (sidste).** Deltaet ændrer ikke min r3-dom. Plan-fase-valgene er fortsat kodbare inden for K-1 til K-9. Feltlistens udvidelighed er nu udtrykkeligt et planvalg; feltvis klassifikation, offentlige skriveindgange og fuld anonymiseringsdækning er stadig leverancekrav. Ingen ny byggelighedsblokker er fundet.

Forhistorien `plan-build/lokations-skabelon/verdikt-codex-krav-r3.json` og `plan-build/lokations-skabelon/buildability-analyse-codex-r3.md` er læst. De uændrede vurderinger videreføres; r3's udsagn om obligatorisk UI-styrbar feltliste korrigeres nedenfor. Dette er en delta-vurdering, ikke en ny runtime-afprøvning af pakken.

**Identitet og diff.** HEAD er pinned commit `efc85d5e7ca70aa1689306ee4bf5e560bed029c5`. Git-opslag af `docs/sandhed/krav/lokations-skabelon-krav.md` på denne commit og `git hash-object` af arbejdsfilen giver begge præcis `9402164d87a35fb939661058bea77c1a052493d0`. R3-blobben er `b9c5249b7ab90d8898992bde61b8cb018bc4f561` ved `d5fa4bed145505461a7d6af5e9f3b1646c2ba55f`. Den bestilte diff er læst fuldt. `git diff --numstat d5fa4be efc85d5 -- docs/sandhed/krav/lokations-skabelon-krav.md` viser **8 tilføjede og 8 slettede linjer**, ikke 12. De er erstatninger ved linje 9, 57, 134, 137, 181, 399, 400 og 407; ingen linjeposition flyttes. Recon og anker er genbundet til henholdsvis `7fbd3a2f43c03ce239aa81e20483326bf438463c` og `7096d2ecbebce37426899dce29ba1984f3225293`; ankeret er genlæst fra pinned Git.

**Gate-bevis-reference, linje 9.** Referencen til `recon/recon-coverage-proof.json @ 58d2bac` kan opløses. Bevisets blob er `6b4cbc483c0d0fa7bf58bb006cdd79eb84ccc741`, identisk ved den aktuelle pin, med korrekt recon-/anker-binding. Frisk kørsel af `node scripts/v5/recon-gate-run.mjs efc85d5e7ca70aa1689306ee4bf5e560bed029c5` giver exit 0, `open: true`, ingen reasons.

Der er en præcis bevisgrænse: samme nuværende runner kørt mod `afcf4080a6c3619462eb9e53df10f49495e19abf` giver exit 1, `open: false`, fordi det daværende proof mangler eksplicit `ok: true` og de krævede gate-/artifact-/bindings-felter. Linjens historiske »open:true @ afcf408« er derfor ikke reproduceret med den nuværende runner. Den aktuelle pins gate er faktisk re-verificeret grøn; denne historiske referencepræcision ændrer ingen forretningsregel eller min byggeligheds-PASS. Jeg påstår ikke, at den historiske kørsel blev grøn i denne runde.

**Feltliste → planvalg, linje 57, 137, 181 og 399.** Både fast feltliste med fysiske kolonner og UI-udvideligt registry er konkrete modeller. Med fast liste leveres felterne og deres værdi-/klassifikationshandlinger gennem offentlige, rettighedsstyrede indgange. At udvide selve strukturen er da ikke en krævet driftshandling. Med registry leveres også definitionernes oprettelse, ændring og udfasning gennem disse indgange. Begge modeller kan bevare navn, ejerreference, entydighed og øvrige strukturelle forbud.

»Default: som for klienter« giver et konkret udgangspunkt: klientmønstret med globalt `client_field_definitions`-registry og JSONB-værdier er beskrevet i masterplanens trin 10 og recon. Det er en analogi og et plan-default, ikke et nyt krav om at genbruge klienttabellen eller kopiere alle klientens særregler. Planen vælger feltliste og lagring synligt inden for kravets ramme. R3's formulering om at kolonnevalget også skal opfylde obligatorisk UI-udvidelig feltliste gælder ikke længere.

K-7 ac 4 bortfalder ikke ved nogen af valgene. Registry-JSONB kræver feltvis klassifikation, audit-filtrering, anonymisering og replay, også for udfasede felter med bevarede værdier. Recon beskriver den eksisterende JSONB-walk som klientspecifik; klassifikation af containerkolonnen alene giver ikke dækning af personfeltnøgler. En fast liste skal tilsvarende have en deklareret anonymiseringsvej for hvert relevant felt. Dette er byggearbejde i pakken og kan ikke skubbes til booking eller frontend. Negative kanter: ukendt felt må ikke omgå den valgte model; krævede driftshandlinger må ikke kræve migration; ingen personfeltnøgle må leveres uden anonymiseringsvej.

**Feltvis klassifikation, linje 134 og 400.** Den blanket-antagelse, at alle lokationsfelter er evige forretningsdata, er fjernet. Entiteten og dens forretningsbærende historik bevares; feltværdier kan behandles efter deres aktivt valgte klassifikation. Recon 1387-1390 nævner netop adresse som mulig indirekte persondata. Kravet deklarerer nu læsningen og tillægger den ikke Mathias.

»Konservativ default« læses sammen med den fortsat bindende ac 3 og strukturreglen: ingen automatisk PII-/retention-aktivering uden aktivt valg, ingen uklassificeret leverance og ingen automatisk slutning fra bevaret entitet til evigt bevarede rå feltværdier. Det er kodbart med klassifikationsmetadata pr. felt og kontroller ved klassifikationsændringer. En adresse må ikke blot fritages fra feltvurdering, fordi den ligger på en lokationsrække. Ved aktiv persondata-klassifikation skal den relevante anonymiserings-/replayvej kunne anvendes uden ny udviklerleverance; række, relationer og audit består, mens personværdier behandles efter deklarationen. Direct-PII-nedgradering er fortsat forbudt.

Der er således ikke to modstridende automatiske defaults: ac 3 afgør aktivering, mens konservativ feltvurdering undgår den tidligere blanket-klassifikation. Jeg tilføjer ikke et nyt krav om automatisk at klassificere alle adresser som persondata. Konkrete feltvalg skal foretages synligt; ingen skjult juridisk eller forretningsmæssig klassifikation er forudsat af PASS.

**Optælling, linje 407.** Recon indeholder 11 claude-ai-fund med `intet-data:` i bøtte 3; kravets 11 tilsvarende dispositionsrækker matcher dem. Rettelsen 12 → 11 ændrer ingen kapabilitet eller acceptregel.

**Otte evidensspænd.** Alle r3-excerpt-hashes er kontrolleret mod de gamle rå Git-blobs. De tilsvarende nye uddrag er genlæst på pinned commit. Seks uddrag er tekstidentiske; spænd 4 og 5 indeholder delta og skal have nye excerpt-hashes. Alle otte poster bindes til den nye commit; de fem kravposter får ny blob-OID. Recon-/kodeblobs er uændrede. Ingen numerisk span-forskydning er nødvendig.

| Nr. | Sti | R3-spænd | R4-spænd | Uddrag |
|---|---|---|---|---|
| 1 | docs/sandhed/krav/lokations-skabelon-krav.md | 35-46 | 35-46 | Uændret |
| 2 | docs/sandhed/krav/lokations-skabelon-krav.md | 97-105 | 97-105 | Uændret |
| 3 | docs/sandhed/krav/lokations-skabelon-krav.md | 111-126 | 111-126 | Uændret |
| 4 | docs/sandhed/krav/lokations-skabelon-krav.md | 134-143 | 134-143 | Ny feltklassifikation og feltliste |
| 5 | docs/sandhed/krav/lokations-skabelon-krav.md | 165-181 | 165-181 | Nyt feltliste-planvalg |
| 6 | recon/recon.md | 309-328 | 309-328 | Uændret |
| 7 | supabase/migrations/20260521000009_t10_client_rpcs.sql | 29-41 | 29-41 | Uændret |
| 8 | scripts/fitness.mjs | 1709-1725 | 1709-1725 | Uændret |

**Leverance og bevisgrænse.** `draft.json` har run_id `fase2-buildability-codex-r4`, de otte genverificerede spans, r3's negative cases samt deltaets ekstra kanter. `raw_output_sha256` er SHA-256 af denne fulde UTF-8-fil. Verdiktet bygges med `node verdikt-byg.mjs draft.json > OUT-verdikt.json`; r4-hjælperen beregner citaterne fra Git og håndhæver schemaet. Efter byggerkaldet kontrolleres schema, alle otte evidensposter mod rå Git, artifact-/bindings-OID'er, run_id og analysehash særskilt. Ingen database-/lokations-runtime-tests er udført. Server-provenance er fortsat hjælperens eksplicitte residual til CI actor-runner. Alt arbejde er udført i workdir uden webadgang.
