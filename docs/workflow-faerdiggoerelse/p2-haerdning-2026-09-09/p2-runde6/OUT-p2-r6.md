**FAIL(2) — G-F1 og rest-F-16. G-F1 er ikke det eneste udestående. Ingen PASS-registrering.**

Ingen filer skrevet; intet web. Diffens fire før-/efter-versioner rekonstruerer de angivne blob-OID’er.

Kørselsgrundlag: produktionsparser, hjælper, verifikatorer og gate-kerne, med Git/FS modelleret i hukommelsen og grøn krav-forgænger. Hjælperens faktiske output er ført videre til gaten. **Fysiske Git-repoer, fuld wrapper-/runnerkørsel og commit-attestation er ikke efterprøvet**; `.git` og importafhængigheder mangler i udsnittet.

| Fund | Dom | Locus |
|---|---|---|
| rest-F-16 | **DELVIST** — lukkerrettelsen virker; en ydre åbner kan stadig skjules | [kvittering.mjs:288](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde6/wd/scripts/v5/kvittering.mjs:288), linje 295 og 306 |
| rest-F-18 | **LUKKET på det angivne kørselsgrundlag** — længde og objekttype håndhæves begge veje | [kvittering.mjs:192](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde6/wd/scripts/v5/kvittering.mjs:192), linje 256–264; [verdikt-byg.mjs:74](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde6/wd/scripts/v5/verdikt-byg.mjs:74), linje 144–154 |
| G-F1 | **IKKE — HALT** — afventer fortsat Mathias’ udtrykkelige ord, jf. driverens DEL VIII pkt. 36 | [gates.mjs:38](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde6/wd/scripts/v5/gates.mjs:38), linje 391 |

**rest-F-16: citeret PASS bliver stadig autoritativt.**

Repro, hvor `PASS_blok` er en ellers gyldig verdikt-draft:

```js
"Dom: FAIL\n~~~mark\u2028down\n" + PASS_blok
```

`U+2028` splittes ikke af `/\r?\n/`, men matches heller ikke af åbnerens `.*`. Derfor overses hele den ydre fence. Resultatet er **parser `ok:true`, hjælperstatus 0/PASS, transport `ok:true`, gate `open:true`**.

Samme effekt er eksekveret med U+2029, indrykket tilde-fence og fire backticks. CR giver også en falsk-grøn, eksempelvis:

```js
"Dom: FAIL\r~~~markdown\n" + PASS_blok
```

Den lokale `markdown-it-py 3.0.0` i CommonMark-tilstand bekræfter, at PASS-blokken er indhold i den ydre fence.

Lukkerrettelsen består: NBSP, VT, form feed, zero-width space, U+2028/U+2029 og flere Unicode-whitespace-varianter afvises gennem begge effektveje. Mellemrum/tab og CRLF bevarer grønne kontroller.

**Målehullet under samme F-16:** Mutant (a) overlever alle **34 leverede rene assertioner**, inklusive NBSP/VT, samt den leverede NBSP-hjælperassertion. Testernes afsluttende `~~~` bliver med mutanten en ny, uafsluttet fence; testen bliver rød af en anden årsag og består derfor stadig. Se [kvittering.selftest.mjs:211](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde6/wd/scripts/v5/kvittering.selftest.mjs:211) og [codex-run.selftest.mjs:333](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde6/wd/scripts/v5/codex-run.selftest.mjs:333).

Angrebs-spec: behold de eksisterende cases, og tilføj falsk-lukker-cases **uden sidste `~~~`** samt de skjulte åbnere ovenfor. En hukommelsesrettelse med CR/LF/CRLF-split og dotAll på åbneren afviser reproerne og bevarer kontrollerne. Separat tilbagerulning af hver rettelse genåbner gaten.

**rest-F-18: positivt efterprøvet.**

| `regel_commit` | Hjælper | Gate |
|---|---:|---|
| Commit; ældre commit med identisk låseblob | 0 | Åben |
| Tree-OID med identisk låseblob | 1 | Lukket |
| Annoteret tag til commit | 1 | Lukket |
| Fraværende OID, modelleret som fremmed commit | 1 | Lukket |
| Blob-OID, `HEAD`, forkortet OID, 64 hex | 1 | Lukket |

Tag-/fraværscases er kørt mod Git-modellen. Historiske approval-/verdikt-digests matcher undtagelseslisten; det lukker ikke G-F1.

| Mutant | Fanges den? |
|---|---|
| **a · lukker tilbage til `\s*`** | **Ikke af de leverede whitespace-tests.** Dræbt af den uafhængige variant uden sidste fence: original rød → mutant hjælper 0/PASS og åben gate. |
| **b · drop typekontrollen** | **Ja, begge loci.** De leverede tree-assertioner fejler. Transportmutanten åbner gaten; hjælpermutanten producerer PASS. |
| **c · `isOid` frem for 40 hex** | **Ja.** Den leverede 64-hex-assertion fejler. I SHA-256-repomodellen åbner transportmutanten gaten; hjælperens særskilte længdeværn afviser fortsat. |

Dommen er bundet til følgende blob-OID’er; de er **ikke PASS-entries**:

```text
gates.mjs                 9c94efde403d26312f72557b3bfb5dcf1a223429
git.mjs                   9bc53ebfd7ea1a4e56906a567f276638297620cb
gate-eval.mjs             1f9934570739d2b14b7ab27833f9084fbf15fe5b
verdikt.mjs               4d80c7b05f01540d6a3a65438fb07ad172e334b7
kvittering.mjs            862c330287878796c359e783fe3b381b3110b2e6
verdikt-byg.mjs           81b4aab5598bb3e73a1208241fa21464813fa7d9
recon-gate-run.mjs        b776d19d9d4fe8e3169e780d30c5ef4a2181a060
krav-gate-run.mjs         a8723a5321e733b4b5fc385559087ad2195daf9f
plan-gate-run.mjs         8b4f60f529262e353a9f8f3a89c72819a3aee5f3

kvittering.selftest.mjs   45d80c46ac8898656a9ddfde4dcb69950d8fc31e
codex-run.selftest.mjs    1093b34ea1948f591bd75501a777bb387f468711
DIFF-runde5-til-runde6.diff eeeeb777adf670de3f39522479cb0e25f8682813
RUNDE5-FUND.md            88463c68edc66b7b3273705ea6d7c4577652382c
```