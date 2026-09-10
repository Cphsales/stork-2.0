**PASS for runde-9-deltaet: rest-F-16 er rettet med bevis under den udtrykkeligt valgte linjekontrakt. G-F1 er det ENESTE udestående og forbliver HALT, indtil Mathias giver sit udtrykkelige mandat.**

Diffens fire før-/efter-versioner rekonstruerer de angivne blob-OID’er. De syv uændrede moduler matcher runde 8. Ingen filer skrevet; intet web.

Den positive begrundelse er, at [udtrækket](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde9/wd/scripts/v5/kvittering.mjs:291) kræver én marker-linje, håndhæver dens sidsteplacering og dekoder hele værdien som kanonisk base64 og JSON. Transporten [genudleder derefter draften og sammenligner dommens felter](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde9/wd/scripts/v5/kvittering.mjs:269). Markdown-containere kan derfor ikke forskyde udvælgelsen.

Eksekveret: **14 leverede parserassertioner og 9 leverede hjælperassertioner består**, samt 48 konkrete angreb/kontroller. Yderligere **5.040 kombinationer** af præfikser, containere og separatorer valgte aldrig en tidligere PASS frem for den efterfølgende FAIL.

| Angreb | Observeret resultat |
|---|---|
| Trailing ` (eksempel)`; to markers på samme linje | Parser afviser; hjælper 1; transport afviser; gate lukket. |
| Citeret marker + ægte marker; marker efterfulgt af tekst/fence-lukker | Samme afvisning. |
| ZWSP foran eneste marker | Ingen marker → rød. En tidligere marker bliver heller ikke valgt, når ZWSP-linjen følger efter. |
| BOM foran marker | Accepteres via `trim()`; samme dom gennem hele stien. |
| U+2028 inde i base64 eller efterfulgt af tekst/anden marker | Rød. U+2028 alene ved kanten trimmes og accepteres. |
| LF, CR og CRLF | Gyldige kontroller består; ekstra marker afvises. |
| Tom base64; manglende/ekstra padding; ikke-nul paddingbits | Rød. |
| Ikke-JSON; to JSON-objekter; array, tal eller `null` | Rød. |
| JSON-dubletnøgler | Sidste værdi gælder konsekvent. PASS→FAIL giver FAIL og lukket gate; efterfølgende tvunget PASS afvises af transporten. |
| `__proto__` som JSON-nøgle | Almindeligt eget datafelt; ændrer ikke prototypen. Påkrævede felter alene inde i `__proto__` åbner intet. |
| Manglende `aktor`, `conclusion`, `negative_cases` eller `evidence` | Objektudtræk kan lykkes; hjælper/transport afviser, gate lukket. |
| Lang linje | Gyldig kontrol med 1.000.000 tegn i et felt består; lang ugyldig suffix afvises. |
| Runde-8-liste-repro | Gammelt fence-format alene afvises. Tilføjet gyldig terminal marker bliver den eneste maskindom. |

**Kontraktgrænsen skal stå præcist:** En *enlig terminal marker i en uafsluttet fence* kan blive den anvendte dom. Det er eksekveret og ligger inden for opgavens udtrykkelige valg: »alle linjer tæller, også inde i fences«. Prosa som `Dom: FAIL` før denne marker er ikke en anden maskindom efter den nye kontrakt. Dette lukkes som **allerede delegeret valg**, ikke som et bevis for, at citeret indhold generelt afvises. Ingen af de prøvede veje erstattede en gyldig sidste marker med tidligere indhold.

**Mutant-tabel — alle dræbt gennem effekt-stien:**

| Værn → konkret mutant | Dræbende case | Hjælper, original→mutant | Transport/gate, original→mutant | Leveret test fanger |
|---|---|---|---|---|
| a. Alle linjer tæller → optæl kun uden for fences | Citeret FAIL + terminal PASS | 1→0/PASS | Afvist/lukket→godkendt/åben | Parser + hjælper |
| b. Sidsteplacering → fjern positionsværnet | PASS-marker efterfulgt af fence-lukker | 1→0/PASS | Afvist/lukket→godkendt/åben | Parser + hjælper |
| c. Kanonisk base64 → fjern round-trip-værnet | Padding fjernet fra gyldig draft | 1→0/PASS | Afvist/lukket→godkendt/åben | Parser + hjælper |
| d. Trimmet marker → fjern `trim()` i optællingen | Indrykket terminal marker | 0/PASS→1 | Godkendt/åben→afvist/lukket | Parser; ikke de ni hjælperassertioner |

Mutant d beviser en forkert afvisning af tilladt input. Den gør ikke et redundant sikkerhedsværn nødvendigt. Desuden blev **F-14-mutanten**, der fjerner sammenligningen af `draft.conclusion`, dræbt: en FAIL-leverance med et efterfølgende PASS-verdikt ændrede transport/gate fra **afvist/lukket til godkendt/åben**.

Kørslerne anvendte produktionskode for parser, hjælper, snapshotbygger, verifikatorer og gate-kerne, med Git/FS modelleret i hukommelsen og grøn forgænger. Hjælperens exit blev opfanget. Udsnittet mangler `.git` og importafhængigheder; fuld fysisk wrapper-/runnerkørsel er derfor ikke efterprøvet.

**PASS-entries for de ni moduler** — teknisk delta-PASS; G-F1-HALT består:

```text
PASS gates.mjs           9c94efde403d26312f72557b3bfb5dcf1a223429
PASS git.mjs             9bc53ebfd7ea1a4e56906a567f276638297620cb
PASS gate-eval.mjs       1f9934570739d2b14b7ab27833f9084fbf15fe5b
PASS verdikt.mjs         4d80c7b05f01540d6a3a65438fb07ad172e334b7
PASS kvittering.mjs      a9f13ed38449d8961a361dead87e4076f36fee91
PASS verdikt-byg.mjs     411f47f6a482384e3e0adc58e89cbf98222c627f
PASS recon-gate-run.mjs  b776d19d9d4fe8e3169e780d30c5ef4a2181a060
PASS krav-gate-run.mjs   a8723a5321e733b4b5fc385559087ad2195daf9f
PASS plan-gate-run.mjs   8b4f60f529262e353a9f8f3a89c72819a3aee5f3
```

Øvrig inputbinding:

```text
kvittering.selftest.mjs     07ff633bb894bd15583ff526baeb71ec54cd9a82
codex-run.selftest.mjs      cc2a380607760ef3aa50a25568f23107f7a91ee0
DIFF-runde8-til-runde9.diff 9f4a98b36c7e9dd7cd4b4ad04754e0afcd5c3844
RUNDE8-FUND.md              3d793370dabe6cb1a8e3e07a8cc9f073e2011b1a
```

**G-F1: kræver Mathias’ ord → HALT.** De historiske approval-/verdikt-digests matcher fortsat undtagelseslisten. Den lighed beviser ikke mandatet. Dette PASS er input til gaten og ophæver ikke blokeringen.