DEVIL-DOM: REN

Fremlæggelsen gengiver de tre rettelser sandt, bevarer kravene og beder kun om `plan ok`. Runde 1’s F1–F3 er **rettet med dokumentbevis** i blob `0214545ec2fc5b8446c2cae2d238011494e1c130`. Dette er en kontrol af fremlæggelsen, ikke en plan-gatedom eller et implementeringsbevis.

| post | bord | form | afled | troskab | fund (kort) + FORSLAG til rettet ordlyd (form, aldrig substans) |
|---|---|---|---|---|---|
| Titel, linje 1 | OK | OK | — | OK | Korrekt version og placering før nyt godkendelsesord. Ingen rettelse. |
| Indledning, linje 3 | OK | OK | M-45 | OK | Godkendelsen 21/9, de to uoverensstemmelser og den tredje rettelse er kildebårne. Ingen rettelse. |
| Punkt 1, linje 5 | OK | OK | OK | OK | **F1 lukket:** spærrerne og ændringen i afprøvningen forklares forståeligt. Plan:672 og manifestdiffen bærer 12 → 4 bindinger; alle tolv negativer og deres afvisningskrav består. |
| Punkt 2, linje 7 | OK | OK | OK | OK | K-7/S bevises i Bid 2; faktisk adresseanonymisering under K-7/ac-4(b) i Bid 5. Ingen manifestforpligtelse flyttes. Plan:238,240,526. Ingen rettelse. |
| Punkt 3, linje 9 | OK | OK | Deklareret valg | OK | **F2 lukket:** beskriver den valgte klokstyring uden at erklære andre løsninger umulige. Fremadrettede dagsskridt og uændrede produktregler følger plan:33,678 og M-48. |
| Hvad der ikke ændres, linje 11 | OK | OK | OK | OK | Krav, eksisterende valg og afvisningsforpligtelser består. Resten af §1–§3 er uændret efter de navngivne rettelser. Ingen rettelse. |
| Stop, linje 13 | OK | OK | — | OK | **F3 og F2’s stopdel lukket:** stop til 1/2 kræver anden planrettelse; stop til 3 sætter den valgte løsning i bero. K-5’s forbud mod produktets tidsknap består. Kontraktbehovsanalysens punkt 6–7 og klokkeafsnit bærer udfaldene. |
| Betydningen af `plan ok`, linje 15 | OK | OK | OK | OK | Korrekt ny plan-SHA. Fortsat byggeri og binding af allerede skrevne tests beskrives som efterfølgende handlinger. Ny planændring kræver nyt ord. Ingen rettelse. |
| Afslutning, linje 17 | OK | OK | — | OK | Kun godkendelsesordet efterspørges; intet direkte eller skjult spørgsmål. |

## Noter (tæller ikke)

Ingen yderligere.

**Komplethed**

- **3/3 rettelser dækket:** KB-#6, KB-#7 og FA-3 inklusive S-35. Stop-udfaldene er dækket.
- Strukturel manifestdiff bekræfter uændrede **60 forpligtelser, 127 negativer og 150 assertions**, inklusive bevisformer, afvisningskontrakter og `effekt_bid`. `g.app_dml_revoke` går **12 → 4** bindinger; samlet **48 → 40**.
- §1–§3 ændres kun på linjerne **221, 238, 240, 246, 253 og 526**. Resten er byte-identisk. **§9 og §10 er byte-identiske.**
- S-3’s læsning fra driftssystemet med læseadgang, de kendte grænser og overdragelserne til trin 24, trin 29 og lag F består i den godkendte v3.5-fremlæggelse. De skal ikke gentages i deltaet.
- De tre JSON-vurderinger siger **PASS til v3.5**. Deltaet fremstiller dem ikke som nye vurderinger af v3.6 eller som bevis for et fungerende produkt.
- Tidligere v3.5-fund er efterprøvet mod den godkendte fremlæggelse `c4757b3c…`; ingen genåbnes.

**Binding**

Følgende filblobs er verificeret med `git hash-object`. Plandiff og strukturel manifestdiff er udført lokalt. Ingen filer er skrevet; web er ikke brugt.

`P/` = `plan-build/lokations-skabelon/`.

| artefakt | verificeret blob |
|---|---|
| P/fremlaeggelse-plan-v36.md | `0214545ec2fc5b8446c2cae2d238011494e1c130` |
| P/plan.md | `807fdf93056180c766d23f93c4137ded98b78e3b` |
| P/provenance/plan-v35.md | `289b87616750a1a1180a8ec5f7a639cd43f07a29` |
| P/fremlaeggelse-plan.md | `c4757b3cdff8d6668f2724718cdde1525f90c5ff` |
| docs/sandhed/krav/lokations-skabelon-krav.md | `9402164d87a35fb939661058bea77c1a052493d0` |
| P/mathias-ord.md | `de22e405707012c7a4bce32899b35c212857f309` |
| P/ordbog.md | `bcab6b4ed9c9c0fe21f13c70d8e1d47a2afd9fef` |
| P/p8-kildekontrakt.md | `33dd3509c17a8fa176f91b9d6072c0c1cd1f001a` |
| P/forventnings-manifest.json | `6111747df50432655a8d5aabaea8bb0ef1d1f1ef` |
| P/provenance/manifest-v35.committet.json | `ab4c8501253cbc9310f9875c0ab5c672f1ad23dd` |
| P/fold-ind-rapport-r8.md | `84e0e0ac862c26194334a254d0092d78106e73b9` |
| P/verdikt-code-reviewer-plan.json | `17624938b302c38024c4e71c979b721bb6bbbb94` |
| P/verdikt-codex-plan.json | `f08186d5985fd09a3fcda349b39b077d62667f21` |
| P/verdikt-claude-ai-plan.json | `d433ab93907f8da38f018eebf4228cd9ffd011d5` |
| scripts/v5/roller/claude-ai.md | `946284944deeb73bb62063f2892308c3502e8591` |
| docs/workflow-faerdiggoerelse/workflow-implementeringsplan.md | `8138afa86ead6a227fdc460434fbccf10f3d4494` |
| P/provenance/angrebs-kontraktbehov.leverance.md | `5ea32424b8ddd5ccc8f7244a00a8e448d59d3087` |
| P/provenance/angrebs-tests-pas1.leverance.md | `c1d67af77ae07b85a16ca610b3ae09fe85694645` |
| P/provenance/plan-devil-v36-r1.leverance.md | `4e5d61951293cd12504ac47db0963f55869a8b86` |
| P/provenance/plan-devil-r1.leverance.md | `c9bd5b41dbc77a8b5a99c05e92ef7254cd68714a` |
| P/provenance/plan-devil-r2.leverance.md | `65a108d6e6f6c732e9f660ded3aac1459e995b2c` |
| P/provenance/plan-devil-r3.leverance.md | `645170a2798b06f5a693c315c5a370dd61b1a012` |

De historiske fremlæggelsesbindinger `8afe2d7d529233c0a23bf9440731d02ffdb3a70e`, `6a75be7304a39d098a9b3e950e6e4cfb97ee4229` og `06e91af70cab062378a1292a2ca1ee52f55fb71e` er refereret i de verificerede rapporter; deres oprindelige filbytes er ikke selvstændigt hashverificeret her. Lukningskontrollen bygger på rapporternes konkrete fund og den godkendte efterfølgende tekst.

Commit `25fc0e8acef203e6dba19ab482967d0d316ba2cd` er driverens pin. Uden `.git` attesteres filbytes, ikke commit-medlemskab.

DEVIL-JSON: {"konklusion":"PASS","fremlaeggelse_blob":"0214545ec2fc5b8446c2cae2d238011494e1c130","fund":0}