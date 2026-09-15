# PASS — HÆRDET TRANSPORT

**`ci-gate-dom.mjs` ved blob-OID `c07c7f2bf81c21fe1e213723fbc46738285af02c` er egnet til register-pas som hærdet transport.**

**F-C4-1: (1) rettet med eksekveret bevis.** Ingen nye materielle transportfund.

**F-C4-2: (3) kræver fortsat Mathias’ kanalvalg.** Pkt. 38’s forslag kan lukke autoritetshullet med C4b/C4c-kravene nedenfor. Fundet er ikke implementeringslukket eller genåbnet som transportfund.

## Bevisgrundlag

- **36 CI-cases og 20 mappercases består.**
- Kædeprøven kørte de faktiske default-runnere, `buildSnapshot`, `evaluateGate`, verifikatorerne og emitteren. Uændrede input med senere evidens gav `success` for recon, krav og plan.
- Begge artefakter og samtlige otte krav-/plan-bindinger blev ændret enkeltvis: den berørte gates POST-payload blev `failure`.
- **Fire targeted mutanter dræbt**, med bestående positive kontroller og genetableret afvisning efter restore.
- Deltaet blev vendt i RAM og rekonstruerede præcis runde-1-blobben `ef8b31b48f33b21cf7dbb12ce1b535088a5df0aa`.

**Bevisgrænse:** Git-objekter/historik blev modelleret i RAM; HTTP-payloads blev opsamlet. Udtrækket mangler `.git`; ingen historisk Git-genkørsel eller live-GitHub/admin-verifikation. Ingen netværkskald og intet skrevet.

## A. Identitetens fuldstændighed

[Identitetsværnet](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-c4-p1r2/wd/scripts/v5/ci-gate-dom.mjs:68) dækker registryets faktiske input:

| Gate | Artefakt | Bindinger |
|---|---|---|
| krav | krav | recon, anker |
| plan | plan | krav, recon2, p8, ordbog, killlist, manifest |

Begge sammenligner desuden `launch.pakke`.

**Kædens afgrænsning er vigtig:** Identiteten er ikke rekursiv. Ændret `launch.anker_sha` ændrer kravets **hele ankerblob** og giver rødt krav-check; plan-checket kan fortsat være grønt. Det er dækket af den allerede krævede kumulative fasepolitik, hvor plangrænsen kræver recon **og** krav **og** plan.

Supplerende eksekveret modprøve: efter fornyet recon-/krav-evidens for ankerændringen blev recon og krav grønne, mens den gamle plan blev rød. Plan-runneren genlæser samme krav-approval ved `pushed`, og dens friske forgængerdom afviser det gamle scope.

`DEFAULT_LAYOUT`, registryet og evaluatorens kode er målelag under **R-CI-WORKFLOW-INTEGRITET**. Identitetsværnet kræver ikke lighed for hele Git-træet eller nyere evidensfiler; evidensen verificeres ved `pushed`.

Manglende binding bliver konkret `null` fra `resolveRef` og derefter identitetsmismatch. En kastende opslagfejl giver særskilt `failure`. Begge veje er efterprøvet.

## B. Valg af pinned

- **`pinned == pushed` omgår ikke frisk dom.** Ved kontrolleret indlæsning af denne `commit_sha` blev den ændrede plan med gammel evidens afvist gennem de faktiske runnere og emissionen. Kun identitetssammenligningen springes over.
- **Samme input-OID’er i et andet træ er tilladt**, når pinned er forfader, og evidensen faktisk er bundet til den valgte commit. Prøven afviste gammel evidens og accepterede ny korrekt bundet evidens.
- **Identiske input fra fremmed historik blev afvist.**

Forfader + identitet er dermed tilstrækkeligt **sammen med den bevarede friske evidensverifikation**.

## Mutant-tabel — F-C4-1 / plan 2.A

Alle drab blev målt som faktisk POST-payload for `v5/gate/plan` på den undersøgte `pushed`.

| Værn → mutant | Angrebsinput | Original → mutant |
|---|---|---|
| Fjern identitetskravet | Ændret `plan.md`, gammel pinned/evidens bevaret | `failure → success` — **dræbt** |
| Sammenlign kun artefakt | Ændret manifest; planblob uændret | `failure → success` — **dræbt** |
| Ignorér pakke | Skift `pk → other`; begge pakkers input har identiske blobs | `failure → success` — **dræbt** |
| Behandl opslagfejl som »uændret« | Kast under snapshot-opslag ved pushed | `failure → success` — **dræbt** |

Positive kædekontroller forblev grønne under alle fire mutanter; originalkoden afviste igen efter restore. Pakkeprøven rammer plan-gaten, hvor kravets redundante ankerbinding ikke skjuler virkningen.

## C. C4b/C4c før autoritet

**Forslaget kan lukke F-C4-2**, hvis afsender- og hændelsesbevis kommer fra producentuafhængige serverdata.

### C4c — godkendelseskanal

1. **Hændelse og afsender:** Accepter kun den valgte kanal: oprettet PR-kommentar eller indsendt, gyldigt `APPROVED` PR-review. Verificér repository, PR og hændelses-ID via API samt `mgrubak` mod betroet kontobinding. `author_association` alene giver aldrig autoritet.
2. **Ord og indhold:** Hele body skal følge ét entydigt format, eksempelvis `plan ok <64-hex kvittering_digest>`. Digest skal matche kvitteringens rå bytes; genverificér gate, pakke, artefakt, bindinger, fremlæggelse og endelige verdikter.
3. **Tidsorden:** Serverens godkendelsestid skal ligge efter en **betroet registrering af den publicerede kvitteringscommit**. Producentstyrede Git-author-/committertider og `frosset` beviser ikke dette.
4. **Redigering og tilbagekaldelse:** Afvis redigerede, slettede eller dismissed godkendelser. Samme body ved et senere opslag beviser ikke uredigeret historik. Hændelserne skal udløse ny dom/invalidering; API-fejl eller ubevist tilstand må ikke give grønt.

### C4b — aktørprovenance

CI’s betroede actor-runner skal attestere:

- repository, workflow-/regelrevision, run-ID og attempt;
- aktør/rolle, faktisk anvendt model/effort, binær-, skill- og låseidentitet;
- gate, pakke, pinned commit, artefakt-/bindings-OID’er og promptdigest;
- rå outputdigest, afslutningsstatus og den krævede isolation/frysning.

CI skal verificere attestationens betroede ophav og binding til det valgte verdikt. Kopieret eller selvskrevet provenance uden den faktiske betroede kørsel skal afvises.

**Nuværende kode modarbejder ikke dette**, men C4c kræver ny event-/API-wiring: runnerne læser stadig committet approval, og `makeApprovalVerifier` kræver filoverensstemmelse og Git-orden. Filen kan bevares som krydsbundet spor; dens `login_server_verified` må ikke levere autoriteten. Identitetsværnet tillader de senere evidenscommits.

## D. Runde-1-forsvar og admin

Følgende blobs er **uændrede**:

| Artefakt | Blob-OID |
|---|---|
| `checkrun.mjs` | `137cfe05adbb9f8fcbee9a5a0b5f24590296b485` |
| `v5.yml` | `c752bae82859da0495795fd7ba6187d64175ab5c` |
| `v5-gate-dom.yml` | `fd5aa3d0bf47970cc87863cfefd309eeb9476e9a` |

Emitter, resumé og CLI er byte-identiske med den rekonstruerede runde-1-kode. Deltaet svækker ikke de accepterede forsvar.

Registerets originalkode gav med blob-hashing i RAM **19 pas + én kandidatfejl** i streng tilstand; kandidattilstand gav **19 pas + én advarsel**. Direkte subprocess-kørsel var blokeret af sandboxens `EPERM`.

Admin-forudsætningerne fra [runde 1](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-c4-p1r2/wd/C4-P1-R1-FUND.md) består: kumulative required checks låst til rette afsender, strengt register samt selftest-/emissionsjob; beskyttet målelag og CODEOWNERS på alle emitterende refs uden producentbypass. Eventuel gate-App kræver beskyttet nøgle.

**Transport-PASS er input til gaten. Autoritativ drift afventer C4b/C4c, Mathias’ kanalvalg og admin-håndhævelsen. Registret er ikke ændret.**