**DEVIL-DOM: REN**

De fire rettelser er gengivet tro mod plan v3.7. Stop-udfaldene og den nye plan-SHA stemmer med kilderne. Kun `plan ok` efterspørges. Dommen gælder fremlæggelsen, ikke plan-gaten eller implementeret effekt.

`OK` = bestået · `N` = sproglig note uden betydning for dommen · `—` = ingen tilskrivning til Mathias.

| post | bord | form | afled | troskab | fund (kort) + FORSLAG til rettet ordlyd (form, aldrig substans) |
|---|---|---|---|---|---|
| Titel, linje 1 | OK | OK | — | OK | Korrekt version og nyt godkendelsesord. |
| Baggrund, linje 3 | OK | OK | OK | OK | M-45 bærer godkendelsen 21/9. §11.7–§11.8 og dommernes rapporter bærer rettelsesforløbet. |
| Punkt 1: tolv forbud, linje 5 | OK | N1 | — | OK | Ni med flere spærrer og tre med én stemmer med S-29 og manifestet. Ingen afvisning fjernes. |
| Punkt 1: butikkens oprettelse | OK | OK | — | OK | K-1/S/neg-1 flyttes korrekt: historikskrivningen møder selv en spærre. Plan:104,672,1061. |
| Punkt 1: stand uden egen pris | OK | OK | — | OK | Afgrænsningen svarer præcist til K-2/ac-1/neg-5. Plan:672,1062. |
| Punkt 2: persondata, linje 7 | OK | N2 | — | OK | Registreringskontrollen ligger i Bid 2; faktisk anonymisering i Bid 5. Ingen bevisforpligtelse flyttes i manifestet. Plan:238,526,1047. |
| Punkt 3: klokken, linje 9 | OK | OK | OK | OK | »Vi har valgt« tilskriver ikke Mathias løsningen. Fremadgående prøvetid og uændrede produktregler følger FA-3/S-35 og M-48. |
| Uændret indhold, linje 11 | OK | N3 | — | OK | Kravbinding, de 22 valg og bevisforpligtelser består. §1–§3 er ellers byte-identiske. |
| Stop, linje 13 | OK | OK | — | OK | Betingede stop-udfald, ingen skjulte spørgsmål. Ingen mulighed for at fravige K-5 smugles ind. |
| Betydningen af `plan ok`, linje 15 | OK | OK | — | OK | Den fulde SHA er korrekt. Ny binding, fortsat byg og nyt ord ved senere planændring er korrekt beskrevet. |
| Afslutning, linje 17 | OK | OK | — | OK | Kun det tilladte godkendelsesord efterspørges. |

**Komplethed**

- **4/4 rettelser dækket:** KB-#6, KB-#7, FA-3 og v3.7’s rettelse af spærrernes fordeling.
- **Uændret indhold efterprøvet:** §9 og §10 er byte-identiske med v3.5. I §1–§3 ændres alene linje 221, 238, 240, 246, 253 og 526, alle inden for de navngivne rettelser.
- **Manifest-diff efterprøvet:** 60 forpligtelser, 127 negativer og 150 assertions består. Ingen ændrede afvisningskontrakter, bevisformer eller effekt-bids. Sammenlignet med v3.5 går sole-bindinger 48→39 og `g.app_dml_revoke` 12→3. Validatoren består.
- **S-3 og overdragelser består:** læsning fra driftssystemet med læseadgang samt trin 24, trin 29 og lag F er uændrede. Deltaformatet kræver ikke gentagelse.
- **Tidligere fund genåbnes ikke:** rettelserne er efterprøvet i den godkendte fremlæggelse `c4757b3c…`, herunder dato-/fristforbehold, persondataopsætning, arvede grænser, kildeadgang og stopregler.
- **Status gengives uden falsk genbrug:** de tre eksisterende PASS-filer gælder v3.5. Denne tekst påstår hverken tre nye PASS eller en udført CI-dom for v3.7.

### Noter (tæller ikke)

1. **Linje 5:** »alle tolv afviser stadig« kan gøres tydeligere som plankrav: »Planen kræver fortsat, at alle tolv forsøg afvises.« Sammenhængen handler allerede om planen; der attesteres ikke en kørsel.
2. **Linje 7:** erstat eventuelt »kun hvornår« med »nu står det tydeligt, hvilket trin der beviser hvad«. Det fremhæver, at manifestets fordeling ikke flyttes.
3. **Linje 11:** »dine tidligere ord« er mere præcist end »oversigten over dine ord«. Ledgeren har fået nye procesord; rettelsen ændrer ikke de tidligere ord.

**Binding**

Alle nedenstående blobs er verificeret med `git hash-object`. `P/` betyder `plan-build/lokations-skabelon/`. Commit-tilhørsforholdet kan ikke efterprøves uden `.git`; indholdsbindingerne er verificeret.

| Kilde | Verificeret blob |
|---|---|
| P/fremlaeggelse-plan-v37.md | `81e1425428297341b997df4eeca4bb09f6cd91b4` |
| P/plan.md | `934291780be93ec7353d7a9f777b4661e79a0158` |
| docs/sandhed/krav/lokations-skabelon-krav.md | `9402164d87a35fb939661058bea77c1a052493d0` |
| P/mathias-ord.md | `de22e405707012c7a4bce32899b35c212857f309` |
| P/ordbog.md | `bcab6b4ed9c9c0fe21f13c70d8e1d47a2afd9fef` |
| P/p8-kildekontrakt.md | `33dd3509c17a8fa176f91b9d6072c0c1cd1f001a` |
| P/verdikt-code-reviewer-plan.json | `17624938b302c38024c4e71c979b721bb6bbbb94` |
| P/verdikt-codex-plan.json | `f08186d5985fd09a3fcda349b39b077d62667f21` |
| P/verdikt-claude-ai-plan.json | `d433ab93907f8da38f018eebf4228cd9ffd011d5` |
| scripts/v5/roller/claude-ai.md | `946284944deeb73bb62063f2892308c3502e8591` |
| docs/workflow-faerdiggoerelse/workflow-implementeringsplan.md | `8138afa86ead6a227fdc460434fbccf10f3d4494` |
| P/provenance/plan-v35.md | `289b87616750a1a1180a8ec5f7a639cd43f07a29` |
| P/provenance/plan-v36.md | `807fdf93056180c766d23f93c4137ded98b78e3b` |
| P/fremlaeggelse-plan.md | `c4757b3cdff8d6668f2724718cdde1525f90c5ff` |
| P/provenance/manifest-v35.committet.json | `ab4c8501253cbc9310f9875c0ab5c672f1ad23dd` |
| P/forventnings-manifest.json | `4e84481d6df1750581cce8b78288602006d06cc2` |
| P/fold-ind-rapport-r8.md | `84e0e0ac862c26194334a254d0092d78106e73b9` |
| P/fold-ind-rapport-r9.md | `68b4ccdd87f5b96691cef062410866540e581bf0` |
| P/plan-angreb-r8.md | `00471d62c62883f80dc1f7b0d9a406acd78e948e` |
| P/plan-slutlaesning-r7.md | `474e9189384c55f7cd085dacea5b1d0eaea30656` |
| P/plan-verdikt-claude-ai-r5.md | `cbac8ca555536f4a06aca2e93a50df5eaec4c6e2` |
| P/provenance/plan-devil-r1.leverance.md | `c9bd5b41dbc77a8b5a99c05e92ef7254cd68714a` |
| P/provenance/plan-devil-r2.leverance.md | `65a108d6e6f6c732e9f660ded3aac1459e995b2c` |
| P/provenance/plan-devil-r3.leverance.md | `645170a2798b06f5a693c315c5a370dd61b1a012` |
| scripts/v5/forventnings-manifest.mjs | `64ea01e0bbacbc00ceb1e4da6d484b715e899b1d` |

DEVIL-JSON: {"konklusion":"PASS","fremlaeggelse_blob":"81e1425428297341b997df4eeca4bb09f6cd91b4","fund":0}