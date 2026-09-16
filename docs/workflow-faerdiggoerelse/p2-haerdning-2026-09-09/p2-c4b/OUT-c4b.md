**C4b: FAIL — to materielle fund blokerer samlet PASS. Fire moduler består; produktionsrunneren og build-dommerens CI-kobling gør ikke.** Dommen er input til gaten, ikke den endelige menneskedom.

| Modul | Dom | Verificeret blob-OID |
|---|---|---|
| `ci-build-dom.mjs` | **FAIL**, F-C4b-1 | `a6a32091fe1ae9160847c89a7b472e3d20b74369` |
| `pg-runner.mjs` | **FAIL**, F-C4b-2 | `61b48a9eb56662c535e70b6b747a4fafd856be51` |
| `gates.mjs` | **PASS** | `1a4369b713b6a6a929f6d4fa75a62848febe5aea` |
| `gate-eval.mjs` | **PASS** | `7110053ac597a6b3f3ab99f6449323f208c6e005` |
| `build-proof.mjs` | **PASS** | `756627cb11cb4af4b2d23a994ee7041d8dd8c1e9` |
| `ci-gate-dom.mjs` | **PASS**, hærdet transport | `dc59d796e6c86df5194fe2367e2df3cef9e08520` |
| `v5-build-dom.yml` | **FAIL på formen**, F-C4b-1 | `d8b93527b55e4a1592262c0ecd4810c4567975bf` |

**Bevisgrundlag.** Hele deltaets efterbilleder matcher filerne; tilbagerulning i RAM rekonstruerer diffens før-OID’er, herunder de tidligere PASS-blobs. `DIFF-c4b.diff` har blob-OID `639095d7112a20dba9bf7eebb1b07d92e7d54a5d`.

Fem skrivefri selvtestsuiter består direkte. Yderligere **236 checks** består i build-dommer-, build-proof-, gate-eval- og gate-kerne-suiterne med filsystem og Git modelleret i RAM. Egne angreb kørte de faktiske dommerfunktioner med kontrollerede processtrømme og opsamlede HTTP-payloads.

Udtrækket mangler `.git` og en tilgængelig Postgres-klient. Commit-provenance, live-GitHub og workflowet er derfor ikke genkørt. De **72 Postgres-checks er den leverede log**, ikke min egen integrationskørsel. Intet skrevet; intet web brugt.

**F-C4b-1 — producentkode får dommerens `checks:write`-token.**

Forpligtelsen er plan 2.A/2.E og pkt. 39: CI’s betroede evaluering skal bære `v5/gate/build`.

Workflowets linje 59–62 giver `GITHUB_TOKEN` til processen, der både udfører producentkode og emitterer dommen. Herfra:

- `ci-build-dom.mjs:117` kalder `runProver(..., env: process.env)`.
- `prover.mjs:142–145` giver miljøet videre til producentens `cmd`.
- `pg-runner.mjs:77/169` starter psql og exit-kommandoer med nedarvet miljø.

En detached worktree isolerer Git-checkoutet; den isolerer ikke token eller værtsadgang. Proverens eksisterende kontrakt placerer netop dette ansvar hos **CI-sandboxen** (`prover.mjs:11–13`).

**Eksekveret modprøve:** Med rød motor og grønt prover-resumé gav den ærlige evaluator `failure`. Ved procesgrænsen var et syntetisk check-token samtidig tilgængeligt gennem alle tre kanaler: prover, exit og psql. Den faktiske emitter kunne med dette token konstruere en `success`-POST for samme check og commit uden grøn motor. Procesudførelse og HTTP var kontrollerede adaptere; ingen ekstern emission blev udført.

Angrebsvejen er, at producentkommandoen bruger tokenet direkte og eksempelvis ændrer dommerens check efter emission. Beskyttede workflowfiler og afsenderlås til GitHub Actions afskærer ikke den vej: producentkoden bruger jobbets egen identitet.

Dette er **mere end R-PROVER-REGISTRERING**. Et falsk resumé alene stoppes af motor/verifier; tokenadgangen omgår dem.

**Rettelseskrav og angrebs-spec:** Isolér producentkode fra emissionscredential og det betroede målelag. Plant en producentkommando, der forsøger både umiddelbar og forsinket check-emission/-ændring under en rød motor. Den skal være afskåret, mens den legitime emitter fortsat virker. En targeted mutant, der igen eksponerer credentialet, skal dræbes gennem denne effektsti.

**F-C4b-2 — `race()` ignorerer aktørens settings og kan bevise den forkerte tenant.**

Locus: `pg-runner.mjs:141–145`. `runCase()` sender `{role, settings}` til race-runneren. `race()` anvender rollen og kontrollerer `current_user`, men anvender aldrig `s.actor.settings`.

Det bryder den foreskrevne aktørkontekst; det kræver ingen ændring af en autoriseret spec.

**Eksekveret modprøve gennem runner → motor → verifier → check-mapper:**

| Variant | Foreskrevet tenant | Sessionskontekst i procesmodellen | Resultat |
|---|---|---|---|
| Vurderet runner | `tenant-b` | `tenant-a` | **6 opfyldte cases, 4 dræbte mutanter, `success`** |
| Settings anvendt i RAM | `tenant-b` | `tenant-b` | **SA brudt, `failure`** |

Prøven brugte K-2/ac-6’s SA-forløb med korrekt adfærd i standardtenant og brud i den foreskrevne tenant. Den faktiske `session()`, rammeparser, overlapstyring og invarianttransport blev kørt mod kontrollerede psql-strømme. Postgres-semantikken var modelleret.

RAM-varianten har OID `3509595c8dc78aaa5f8f2882b4b711ca8736d35c`. Den er **kalibrering af angrebet, ikke en rettelse af kandidatblobben**.

**Rettelseskrav og angrebs-spec:** Anvend de foreskrevne settings i begge sessions før handlingerne; fejlet opsætning skal lukke forløbet. Bevar tenant-kontrasten og en positiv kontrol. Mutanten, der udelader settings, skal give falsk grøn under angrebsinputtet og dermed dræbes.

Begge fund er **åbne rettelseskrav**, som afventer *rettet med bevis*. De er ikke lukket ved residualnavngivning og kræver intet nyt forretningsvalg fra Mathias.

**Den krævede mutant-tabel:**

| Værn → mutant | Observeret effekt | Dom |
|---|---|---|
| Tillad `ci-produced` overalt; fjern grænserne i kerne og snapshotbygger | Recon-input: afvist før emission → `success` gennem rigtig proof-verifier og emitter | **Dræbt** |
| Tillad `ci-produced` som binding | Samme manifeststi/OID, forkert type: `failure → success` | **Dræbt** |
| Fortsæt efter fejlet migration | Første migration fejler: `failure → success`; positiv kontrol består | **Dræbt** |
| Ignorér forgængerens lukkede dom | Lukket plan: `failure → success`; positiv kontrol består | **Dræbt** |
| Sæt `ok:true` uanset `engine.allOk` | Manglende audit-vidne: `failure → failure`; verifieren genudleder bruddet | **Redundant værn; intet krav om kunstigt drab** |
| Tag `base_oid = commit` trods bids-fil | Gyldigt review af bidets forfader: `success → failure` med stale review | **Dræbt som kontraktregression**, ikke demonstreret falsk grøn |

Blot at fjerne build-dommerens tidlige forgængerafvisning er også redundant: gate-kernen kontrollerer stadig forgængeren. Den meningsfulde mutant ovenfor ignorerer selve forgængerdommen.

Supplerende drab:

- Genindført F-40-fallback til gamle fejlvariable: `failure → success`, med bestående positiv kontrol.
- Git-stibinding sprunget over for almindelige blob-artefakter: `failure → success`.
- Fjernet build-delegation i `ci-gate-dom`: nul build-POSTs → én uberettiget build-POST.

**A–D: øvrige afgørelser.**

Spec’ens eksistens plus en åben plan binder **ikke** spec’ens ophav og frysning til plan-gaten. Manifestet er kædebundet; `angrebsspec` er kun build-binding. Det er præcist **R-SPEC-LEGITIMITET**, ikke en ny svækkelse af manifestbindingen.

Producentens reviews, bids og falske prover-resumé kan **ikke alene åbne den normale evaluering** uden motorens cases og kills. Det blev efterprøvet med rød motor. F-C4b-1 er den særskilte omgåelse uden om evalueringen.

Migrationer, der ændrer produktværn, måles efter anvendelse. Der er ikke påvist et særskilt footprint-/kill-hul dér. Migrationsindhold, der når psql’s værtskommandoer, hører derimod til isolationsfundet.

`--skip-migrations` bliver mærket, og det vurderede workflow sætter ikke flaget. Et generelt verifierforbud ville også afskære den erklærede lokale brug mod en forberedt store. **Ingen selvstændig F-post** på dette grundlag.

Ejer- og aktørkald er adskilt gennem `{}` versus `{role, settings}`; race kontrollerer rollen ved navn. Det beviser ikke i sig selv `NOBYPASSRLS`, fravær af superuser eller relevant ejerskab efter producentens migrationer. **Hele R-RUNNER-UDFØRELSE er derfor ikke attesteret lukket**; det konkrete falsk-grønne fund her er F-C4b-2.

Timeouts og transportfejl gav ikke en ny demonstreret grøn vej. Manglende lokale timeouts i `sql/q1` er en livscyklusskærpelse; workflowets samlede timeout består. Psql-versionen verificeres ikke eksplicit; den krævede variabelprotokol skal fungere, ellers fejler rammevalideringen. Workflowformen giver en service pr. job, ikke én fælles database på tværs af pushes.

Ændringerne i `gates`, `gate-eval` og `build-proof` er additive og afgrænsede. Almindelige blob-bindinger, genudledning, footprint og locus består. P-1’s identitetsværn og emitter er bevaret. `slut` bliver ikke grøn af den nye type: chain-verifieren afviser fortsat.

**Artefaktet og tredjepartsgenverifikation.**

Hashberegningen er ikke et selvstændigt ophavsbevis. Den binder bytes inden for den betroede producentproces. Jeg genopbyggede envelope fra de serialiserede proof-bytes og fik samme grønne verifierresultat i RAM.

En tredjepart skal:

1. Identificere betroet workflowrevision, run/attempt, repository, check-afsender og fuld `head_sha`.
2. Hente artefaktet fra netop kørslen og beregne Git-blob-OID over **de rå bytes**, inklusive slut-newline.
3. Sammenholde OID og `run_id` med kørselsbeviset. **Check-resuméet indeholder kun 12 hextegn**; fuld OID står i CLI-loggen. Artefakt plus check-resumé alene giver derfor kun præfikssammenligning.
4. Resolve plan, manifest og spec fra checkets commit; genverificere plan-forgængeren og rekonstruere den bundne envelope/snapshot.
5. Køre `evaluateGate` med den faktiske proof-verifier og kontrollere store-/skipmetadata.

Dette genverificerer indhold og dom. Det erstatter ikke betroet kørselsophav eller isolationen i F-C4b-1.

**Residualernes placering:**

| Residual | Præcis placering |
|---|---|
| **R-PLAN-SEMANTIK** | Plan-gatens indholdsdom over K-dækning, orakler, loci og kill-listens tilstrækkelighed. |
| **R-SPEC-LEGITIMITET** | Hooks/frysning og betroet aktørprovenance: spec-OID, Codex-ophav og tidsorden før bidbyg. Eksistenskontrollen i `ci-build-dom:73–78` leverer ikke dette. |
| **C3 / R-C3-REVIEW** | `reviews/<bid>.json` og `bids/<bid>.json`: sammenhæng kontrolleres, men producentfilerne autentificerer ikke revieweren. |
| **R-PROVER-REGISTRERING / C4c** | Autoriseret testkommando og resultatproducent. Frisk skrivning af et resumé beviser ikke dets sandhed. |
| **R-CI-APPROVER-FLOW / C4c** | Mathias’ valgte godkendelseskanal samt serververificeret identitet, indhold og tidsorden. Tidligere F-C4-2 er fortsat ikke implementeringslukket. |
| **Admin** | Kumulative required checks, korrekt afsender, strengt register og dommerjobs samt beskyttelse af målelag på alle emitterende refs. Disse erstatter ikke rettelsen af F-C4b-1. |

**Registerinput: fire PASS som tabuleret; ingen PASS til `ci-build-dom`, `pg-runner` eller workflowformen ved de vurderede OID’er.**