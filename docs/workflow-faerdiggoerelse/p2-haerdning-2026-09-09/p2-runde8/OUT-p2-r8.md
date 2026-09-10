**FAIL — rest-F-16 er DELVIST lukket. G-F1 er fortsat HALT og er ikke det eneste udestående. Ingen PASS-entries.**

Diffens tre før-/efter-versioner rekonstruerer de angivne blob-OID’er. De øvrige otte moduler er identiske med runde 7. Ingen filer skrevet; intet web.

**rest-F-16: Backtick-info-rettelsen og mutant-målehullet er lukket med bevis. Containerhåndteringen gør stadig citeret PASS aktivt.**

Det nye værn i [kvittering.mjs:302](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde8/wd/scripts/v5/kvittering.mjs:302) afviser runde-7-reproen gennem både hjælper og transport/gate. Men parserens globale fence-tilstand tager ikke højde for lister og containerafslutning.

Repro med en ellers gyldig PASS-draft `D`:

```js
const PASS_blok =
  "```json verdikt-draft\n" + JSON.stringify(D) + "\n```\n";

const leverance =
  "Dom: FAIL\n\n- ```\n  ```\n```\n" + PASS_blok;
```

| Linje | CommonMark | Produktionsparser |
|---|---|---|
| `- ``` ` | Åbner fence i listeelementet | Ignoreres |
| To mellemrum + tre backticks | Lukker listeelementets fence | Åbner en inaktiv global fence |
| Tre uindrykkede backticks | Afslutter listen og åbner en topniveau-fence | Lukker den globale fence |
| PASS-blokken | Citeret kode; sidste fence lukker citatet | Aktiv draft |

Begge CommonMark-fences er afsluttede i denne repro. Fejlen afhænger altså ikke af en uafsluttet yderblok.

Loci: åbnergenkendelsen i [kvittering.mjs:297](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde8/wd/scripts/v5/kvittering.mjs:297) og lukningen i [kvittering.mjs:312](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde8/wd/scripts/v5/kvittering.mjs:312). Effekten videreføres gennem hjælperens linje 81 og transportens genudledning på linje 269.

Eksekveret resultat:

| Input | Parser | Hjælper | Transport | Gate |
|---|---|---|---|---|
| Gyldig aktiv kontrol | `ok:true` | 0/PASS | Godkendt | Åben |
| Runde-7-backtick-info-repro | Afvist | 1 | Afvist | Lukket |
| Liste-repro ovenfor | **`ok:true`** | **0/PASS** | **Godkendt** | **Åben** |

Samme falsk-grøn er efterprøvet med tilder, nummereret liste og denne særskilte containergrænse:

```js
const leverance =
  "Dom: FAIL\n\n- x\n  ```\n```\n" + PASS_blok;
```

Her afslutter den uindrykkede fence listecontaineren og åbner et nyt citat. Parseren bruger den fejlagtigt som lukker. En rettelse, der kun genkender liste-markør direkte foran fence-tegn, lukker derfor ikke fundet.

**Den systematiske §4.5-gennemgang** brugte lokal `markdown-it-py 3.0.0` i CommonMark-tilstand som sammenligningsgrundlag. Jeg kørte 10.725 kombinationer af åbnere, lukkere, indrykning, info, linjeskift og containere.

| Regelområde | Resultat |
|---|---|
| Mindst tre ens fence-tegn; tegn må ikke blandes | Ingen citeret→aktivt-afvigelse i de prøvede kombinationer. |
| Backtick-info må ikke indeholde backticks | Runde-8-værnet virker. |
| Tilde-info må indeholde backticks **og tilder** | Korrekt. Aktiv kontrol efter ægte lukker består. |
| Lukker: samme tegn, mindst åbnerens længde | Korrekt på topniveau. |
| Lukker med info | Lukker ikke; citatet bevares. |
| Lukkerens afsluttende mellemrum/tab; NBSP, VT, FF, NEL og Unicode-separatorer | Ingen ny citeret→aktivt-afvigelse. |
| 0–3 mellemrum; ≥4 kolonner og tab-indrykning | Topniveau-reglerne gav ingen ny falsk-grøn. Containerrelativ indrykning fejler som vist ovenfor. |
| Fence kan afbryde et afsnit; blanklinjer kræves ikke; indhold behandles bogstaveligt | Ingen ny citeret→aktivt-afvigelse. |
| Blockquotes og laziness | Ingen falsk-grøn i de 400 prøvede kombinationer. Fenced indhold kan ikke fortsættes som almindelig lazy afsnitstekst uden nødvendigt containerpræfiks. |
| Listefences og afslutning ved containerens slutning | **FAIL:** både overset listeåbner og fejltolket udrykning forskyder tilstanden. |
| Uafsluttet fence ved dokumentets slutning | Parserens afvisning er isoleret set konservativ. Den erstatter ikke korrekt containerhåndtering. |

**De tre efterspurgte mutanter er nu dræbt med ændret slut-effekt.**

Originalen består de **30 leverede parserassertioner** og **11 fence-relaterede hjælperassertioner**, eksekveret fra selvtesternes kode.

| Mutant | Dræbende case | Parser, original→mutant | Hjælper, original→mutant | Gate, original→mutant |
|---|---|---|---|---|
| a. Fjern backtick-info-værnet | Runde-7-repro | Afvist→godkendt | **1→0/PASS** | **Lukket→åben** |
| b. Split kun på `\n` | CR-åbner uden sidste yderfence | Afvist→godkendt | **1→0/PASS** | **Lukket→åben** |
| c. Åbner med `.*` | U+2028/U+2029 i info uden sidste yderfence | Afvist→godkendt | **1→0/PASS** | **Lukket→åben** |

Cases står i [kvittering.selftest.mjs:224](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde8/wd/scripts/v5/kvittering.selftest.mjs:224) og [codex-run.selftest.mjs:345](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde8/wd/scripts/v5/codex-run.selftest.mjs:345). U+2029 findes i den leverede parsertest; hjælper-/gate-effekten for U+2029 blev efterprøvet særskilt.

**Angrebs-spec for rest-F-16:** Bevar de nu dræbte mutanter. Tilføj begge liste-reproer gennem hjælper og uafhængig transport/genudledning. Værnet skal forhindre, at containerlokale åbnere/lukkere eller containerafslutning ændrer den globale fence-tilstand forkert. Targeted mutant: genindfør den nuværende containerblinde tilstandsmaskine; kræv status **1→0** og gate **lukket→åben** på citaterne, mens den aktive kontrol består. Fundet er fortsat urettet.

Kørselsgrundlaget var produktionsparser, hjælperkode, snapshotbygger, verifikatorer og gate-kerne med Git/FS modelleret i hukommelsen og grøn forgænger. Hjælperens `process.exit` blev opfanget; dens PASS-output blev ført uændret videre. Fysiske Git-repoer og fuld wrapper-/runnerkørsel er ikke efterprøvet; udsnittet mangler `.git` og importafhængigheder.

**G-F1: Uændret — kræver Mathias’ udtrykkelige ord, HALT.** De historiske approval-/verdikt-digests matcher fortsat undtagelseslisten i [gates.mjs:38](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde8/wd/scripts/v5/gates.mjs:38). Digestligheden beviser ikke mandatet.

Dommen er bundet til disse blob-OID’er — **ikke PASS-entries**:

```text
gates.mjs                 9c94efde403d26312f72557b3bfb5dcf1a223429
git.mjs                   9bc53ebfd7ea1a4e56906a567f276638297620cb
gate-eval.mjs             1f9934570739d2b14b7ab27833f9084fbf15fe5b
verdikt.mjs               4d80c7b05f01540d6a3a65438fb07ad172e334b7
kvittering.mjs            8e296af3c7320b032af30f18e6df034a21d8ce4c
verdikt-byg.mjs           81b4aab5598bb3e73a1208241fa21464813fa7d9
recon-gate-run.mjs        b776d19d9d4fe8e3169e780d30c5ef4a2181a060
krav-gate-run.mjs         a8723a5321e733b4b5fc385559087ad2195daf9f
plan-gate-run.mjs         8b4f60f529262e353a9f8f3a89c72819a3aee5f3

kvittering.selftest.mjs   a73bf1e6c33517f13a74cd6a0b36bf97c977088f
codex-run.selftest.mjs    33b42312a04b19c30f1e47dcf3d5886540c3d959
DIFF-runde7-til-runde8.diff 2ee05c07dfd05ac5876c8ba35ed9af9536c524e0
RUNDE7-FUND.md            677ad06daa2cabb5a0bcd0dc168b9af601a1b97a
```