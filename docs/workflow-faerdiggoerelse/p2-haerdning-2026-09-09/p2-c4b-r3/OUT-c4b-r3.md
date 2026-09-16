**PASS som hærdet transport** til [ci-build-dom.mjs](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-c4b-r3/wd/scripts/v5/ci-build-dom.mjs:149), blob-OID:

`4deb70bb5bd3be8c85ff8d18d303f53334959c02`

**F-C4b-3: rettet med bevis. Ingen nye materielle fund.** Diffens efterbillede matcher filen; tilbagerulning i RAM reproducerer runde 2’s `5641cd28e7c781af7ca151ce24d61d38d8c35eb6`.

Byte-identitet bekræftet: pg-runner `c43c57bc` · gates `1a4369b7` · gate-eval `7110053a` · build-proof `756627cb` · ci-gate-dom `dc59d796`. Workflowet matcher også runde 2: `884fd2d0b5ff33d380481eb36300e3fb2046088a`.

**Bevisgrundlag:** 38/38 selvtests består. Selvstændige angreb udførte kandidatens dom, verifier og CLI/emission med opsamlede HTTP-payloads. Fixture-Git og filsystem var modelleret i RAM, plan-runneren kontrolleret, og blob-hashing udført med faktisk `git hash-object` gennem procesadapter. Ingen live-GitHub eller Postgres attesteres. Intet skrevet; ingen web.

| Pkt. 39 → targeted mutant | Eksekveret kontrast | Dom |
|---|---|---|
| Genindfør `readFileSync(inn, "utf8")` før hash | `0xff` i ellers gyldigt JSON-strengfelt: kandidat `failure`; mutant `success` med OID ≠ rå bytes | **Dræbt** |
| Fjern fatal-afkodningen | Samme input: kandidat `failure`; mutant `success` trods ugyldig UTF-8 | **Dræbt** |
| Hash den afkodede tekst frem for rå bytes | BOM-input: kandidaten binder hele artefaktet; mutantens OID udelader BOM | **Dræbt af rå-OID-oraklet** |

Alle tre mutanter bevarede den gyldige, grønne kontrol. Den leverede `0xff`-fixtures `subarray(0, -0)` fjerner JSON-præfikset; lukningsbeviset ovenfor bruger derfor en selvstændig fixture, som reproducerer den oprindelige falsk-grønne vej.

**A — byte-binding:** BOM, CRLF, trailing whitespace, kompakt JSON og ændrede ekstra felter gav hver deres korrekte rå-OID. Ugyldig UTF-8, trailing NUL og et ekstra JSON-objekt blev afvist. Ukendte felter ændrer OID’en uden at overtage verifierens forventninger; pyntet status med en tilladt negativ blev fortsat afvist ved genudledning. Samme indlæste Buffer bruges til afkodning og hash. Workflowets filsti og hentning fra samme run er uændrede; artefaktets ophav ligger fortsat under R-CI-AUTENTICITET.

**B — meta:** `naaet:false` gav ingen emission; en ikke-tom `fejl`-liste gav `failure`. Meta kunne hverken reparere et brudt bevis, manglende proof eller forkert commit. Præcisering: `meta.store` påvirker returmetadata; checkets store-tekst og `SKIPPED` kommer fra **body.store**. `skipped_migrations` er beskrivende og udløser ikke selv en verifier-afvisning. Fjernelse eller opdigtning af måleoplysninger hører fortsat til ophavsresidualen.

**C — tidligere forsvar:** F-C4b-1/2 og verifierens genudledning er bevaret. CLI-afvisningerne af `--produce --emit` og produktion med `GITHUB_TOKEN` blev genudført. Credential-genopretning består også ved kast fra prover. Commit-, pakke- og meta-fejlværn blev desuden mutationskontrolleret: `failure → success`, når det respektive værn fjernes.

Residualernes placering er uændret fra [runde 2](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-c4b-r3/wd/C4B-R2-FUND.md):

- **R-CI-AUTENTICITET:** workflowrevision, run/attempt, head-SHA, artefaktophav og job A’s filintegritet.
- **R-RUNNER-UDFØRELSE:** værts-/serviceisolation, herunder `/proc/<ppid>/environ`.
- **C3:** revieweridentitet og provenance.
- **C4c:** autoriseret/frosset spec, proverregistrering og godkendelseskanal.
- **Admin:** kumulative required checks, afsenderbinding, strengt register og beskyttet målelag.

PASS er positivt, OID-bundet registerinput. Den endelige gateafgørelse ligger hos gate-kernen og Mathias.