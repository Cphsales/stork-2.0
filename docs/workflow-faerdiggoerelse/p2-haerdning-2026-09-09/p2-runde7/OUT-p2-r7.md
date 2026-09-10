**FAIL(2) — G-F1 og rest-F-16. rest-F-16 er DELVIST lukket. G-F1 er ikke det eneste udestående. Ingen PASS-registrering.**

Diffens tre før-/efter-versioner rekonstruerer de angivne blob-OID’er. De øvrige otte moduler er identiske med runde 6. Ingen filer skrevet; intet web.

Kørselsgrundlag: produktionsparser, hjælper, verifikatorer og gate-kerne, med Git/FS modelleret i hukommelsen og grøn krav-forgænger. Hjælperens faktiske PASS-output er ført uændret videre til gaten. Fysiske Git-repoer og fuld wrapper-/runnerkørsel er ikke efterprøvet; udsnittet mangler `.git` og importafhængigheder.

**rest-F-16: Ugyldig backtick-info forskyder fence-tilstanden og gør et citat autoritativt.**

Locus: [kvittering.mjs:297](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde7/wd/scripts/v5/kvittering.mjs:297), især linje 299–302. Parseren opretter en fence, selvom backtick-info-strengen indeholder en backtick.

Med en ellers gyldig PASS-draft `D`:

```js
const PASS_blok =
  "```json verdikt-draft\n" + JSON.stringify(D) + "\n```";

const leverance =
  "Dom: FAIL\n```json verdikt-draft `x\n```\n" + PASS_blok;
```

CommonMark afviser den første backtick-linje som fence-åbner. Den efterfølgende nøgne tredobbelte backtick-linje **åbner** derfor en kodeblok, som indeholder PASS-blokken. Produktionsparseren bruger samme linje til at **lukke** sin fejlagtige fence og aktiverer derefter PASS-blokken.

Den lokale `markdown-it-py 3.0.0` i CommonMark-tilstand bekræfter citatet. Eksekveret effekt:

| Version | Parser | Hjælper | Transport | Gate |
|---|---|---|---|---|
| Runde 7, repro | `ok:true` | status 0/PASS | `ok:true` | `open:true` |
| Backtick-info-værn tilføjet i hukommelsen | Afvist | status 1 | Afvist | Lukket |
| Gyldig aktiv kontrol, begge versioner | Godkendt | status 0/PASS | Godkendt | Åben |

Effekten rammer både [verdikt-byg.mjs:81](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde7/wd/scripts/v5/verdikt-byg.mjs:81) og transportens genudledning i `kvittering.mjs:269`. Dette er **ikke konservativ strenghed**: citeret indhold bliver aktivt.

De efterspurgte øvrige grænser er efterprøvet:

| Vektor | CommonMark og observeret parseradfærd |
|---|---|
| U+2028/U+2029 i info; lone CR før åbner | Runde-6-reproerne afvises nu gennem begge effektveje. |
| NEL U+0085 og form feed | Ingen af dem er CommonMark-linjeskift. I info-strengen bevares den ydre fence; efter almindelig tekst skaber de ingen ny fence-linje. Parseren følger dette. |
| Tab eller mellemrum+tab før åbner | Indrykningen når mindst fire kolonner: ingen fence-åbner på topniveau. En efterfølgende uindrykket draft bliver korrekt aktiv. |
| Tilde eller backtick i tilde-info | Tilladt. Den ydre fence citerer korrekt; en aktiv blok efter en ægte lukker accepteres. |
| Lukker med 0–3 mellemrum | Lukker korrekt, både for aktiv draft og ydre fence. |
| Lukker med 4–5 mellemrum eller tab | Lukker ikke; de prøvede leverancer afvises gennem begge effektveje. |
| Kun uindrykket åbner med præcis tre backticks; uafsluttede fences afvises | Konservativt strengere begrænsninger. De gør ellers anvendelige blokke inaktive eller afviser dokumentet. |

**Mutant-tabellen viser stadig et målehul for åbnere.**

Jeg eksekverede de **25 leverede parserassertioner** og de **8 leverede fence-relaterede hjælperassertioner**, sidstnævnte med modelleret I/O. Originalen består alle.

| Mutant | Leverede parserassertioner | Leverede hjælperassertioner | Dræbt gennem effekt-stien? |
|---|---|---|---|
| **a: split kun på `\n`** | Overlever 25/25 | CR-assertionen fejler kun på fejlteksten; status forbliver 1 | **Ja med uafhængig CR-case uden sidste `~~~`**: original lukket → mutant PASS/åben gate. Ikke effektbevist af den leverede CR-case. |
| **b: åbner med `.*`** | Overlever 25/25 | U+2028-assertionen fejler kun på fejlteksten; status forbliver 1 | **Ja med uafhængige U+2028/U+2029-cases uden sidste `~~~`**: original lukket → mutant PASS/åben gate. |
| **c: lukker med `\s*`** | Dræbt af NBSP og VT uden sidste fence | NBSP-assertionen dræber den: status 1 → 0 | **Ja.** Original lukket → mutant PASS/åben gate. Det tidligere NBSP/VT-målehul er lukket. |

For a/b bliver testernes afsluttende `~~~` stadig en ny, uafsluttet fence i mutanten. Afvisningen består derfor af en anden årsag. Se [kvittering.selftest.mjs:215](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde7/wd/scripts/v5/kvittering.selftest.mjs:215), linje 216–218, og [codex-run.selftest.mjs:339](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde7/wd/scripts/v5/codex-run.selftest.mjs:339), linje 342–344.

Angrebs-spec, bundet til F-16’s afvisning af citerede drafts:

- Tilføj CR- og U+2028/U+2029-cases **uden afsluttende ydre fence**, gennem hjælper og transport/gate. Kræv særskilt drab af a/b med ændret slut-effekt.
- Håndhæv backtick-info-reglen før oprettelse af fence-tilstand. Tilføj reproen ovenfor; mutant = fjern dette værn. Den afprøvede hukommelsesrettelse afviser reproen; fjernelse genåbner gaten.
- Bevar NBSP/VT-cases og grønne kontroller, inklusive tilde-info med backtick og aktiv blok efter ægte lukker.

Hukommelsesrettelsen består også de 25 parser- og 8 hjælperassertioner. Den er ikke indført i input og lukker derfor ikke fundet.

**G-F1: IKKE LUKKET — HALT afventer Mathias’ udtrykkelige ord.** Undtagelseslisten i [gates.mjs:38](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde7/wd/scripts/v5/gates.mjs:38) er uændret. De historiske approval-/verdikt-digests matcher listen; det beviser ikke mandatet.

Dommen er bundet til følgende blob-OID’er — **ikke PASS-entries**:

```text
gates.mjs                 9c94efde403d26312f72557b3bfb5dcf1a223429
git.mjs                   9bc53ebfd7ea1a4e56906a567f276638297620cb
gate-eval.mjs             1f9934570739d2b14b7ab27833f9084fbf15fe5b
verdikt.mjs               4d80c7b05f01540d6a3a65438fb07ad172e334b7
kvittering.mjs            3c87e0ef768ad8406d84d83a2ae1acf9a18689dd
verdikt-byg.mjs           81b4aab5598bb3e73a1208241fa21464813fa7d9
recon-gate-run.mjs        b776d19d9d4fe8e3169e780d30c5ef4a2181a060
krav-gate-run.mjs         a8723a5321e733b4b5fc385559087ad2195daf9f
plan-gate-run.mjs         8b4f60f529262e353a9f8f3a89c72819a3aee5f3

kvittering.selftest.mjs   a353a4fd82956cfbe45bac430b7f8b9d254b25b9
codex-run.selftest.mjs    874472d4dd61599facfa3d3493a987e2ec33717a
DIFF-runde6-til-runde7.diff f7aab38cdc5aa5b6064250b1c20a99cb91b696c9
RUNDE6-FUND.md            a18359eb31a80b6310aaf120d4ae4b2df06cce2e
```