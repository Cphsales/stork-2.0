**FAIL(3) — G-F1, rest-F-16 og rest-F-18. G-F1 er ikke det eneste udestående. Ingen PASS-registrering.**

Ingen filer skrevet; intet web. Diffens fire før-/efter-versioner rekonstruerer deres blob-OID’er. De øvrige syv moduler matcher runde 4.

Kørselsgrundlaget er produktionslogikken i hjælper, verifikatorer og gate-kerne med Git/FS modelleret i hukommelsen og grøn krav-forgænger. **30 leverede selvtestassertioner består.** Fuld wrapper-/runnerkørsel og commit-attestation er ikke udført: `.git` og de tidligere nævnte importafhængigheder mangler.

| Fund | Dom | Locus |
|---|---|---|
| rest-F-16 | **DELVIST:** annoncerede cases rettet; falsk lukker med Unicode-whitespace giver stadig citeret PASS autoritet | [kvittering.mjs:301](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde5/wd/scripts/v5/kvittering.mjs:301) |
| F-18 | **DELVIST:** flytbar ref afvises, og den sammenlignede blob læses; Git-typen `commit` håndhæves ikke | [kvittering.mjs:192](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde5/wd/scripts/v5/kvittering.mjs:192), samme fil:256; [verdikt-byg.mjs:74](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde5/wd/scripts/v5/verdikt-byg.mjs:74), samme fil:145 |
| G-F1 | **IKKE — HALT:** kræver fortsat Mathias’ udtrykkelige ord, DEL VIII pkt. 36. Historiske digests matcher; det lukker ikke mandatfundet | [gates.mjs:38](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde5/wd/scripts/v5/gates.mjs:38), samme fil:391 |

**rest-F-16:** Alle 15 annoncerede kontrolvarianter giver forventet resultat gennem parser, hjælper og gate: info efter tilder, indrykning, længere lukkere, begge blandinger af fence-tegn, uafsluttet ydre fence, CRLF, aktiv blok efter lukket citat og leverance direkte fra aktiv blok.

Men følgende leverance accepteres:

```text
"Dom: FAIL\n~~~markdown\n~~~\u00a0\n" + gyldig_PASS_blok
```

Her er `\u00a0` **det faktiske NBSP-tegn**. CommonMark lukker ikke den ydre fence på den linje; PASS-blokken er fortsat citeret. Produktionens `\s*` accepterer derimod NBSP som afsluttende whitespace: **hjælperstatus 0/PASS, gate `open:true`**. Vertikal tab giver samme resultat. Den installerede CommonMark-parser bekræfter citeringen.

Angrebs-spec: kræv rød effekt for disse falske lukkere. En indsnævring til `[ \t]*`, efterprøvet i hukommelsen, lukker gaten og bevarer alle 15 kontrolresultater. Genindførsel af `\s*` skal dræbes.

**F-18:** Efterprøvningen viser:

| Input | Hjælper | Gate |
|---|---:|---|
| Fast commit, samme låseblob | 0 | Åben |
| Ældre commit, identisk låseblob | 0 | Åben |
| Samme låseblob, forkert `skill_oid` i receipt | 1 | Lukket |
| `"HEAD"` | 1 | Lukket |
| Forkortet OID, 7 hex | 1 | Lukket |
| **Rodens tree-OID**, samme låseblob | **0** | **Åben** |
| Blob-OID | 1 | Lukket |

`<tree-OID>:scripts/v5/actors.lock.json` er et gyldigt Git-opslag. Derfor beviser det nuværende låseopslag ikke commit-typen. Den tidligere skill-binding håndhæves korrekt ved `kvittering.mjs:261` og `verdikt-byg.mjs:151`.

Desuden accepterer transportvalidatorens `isOid` også **64 hex-tegn**, mens hjælperen kræver 40. Det tælles under samme F-18-rest.

Angrebs-spec: håndhæv streng med præcis 40 hex samt faktisk Git-type `commit` i begge effektveje. Kræv tree-negativ med identisk låseblob og grøn kontrol med ældre commit. En typekontrol efterprøvet i hukommelsen gør tree-reproen rød begge veje; fjernelse genåbner gaten. Leverede versioner er fortsat urettede.

| Mutant | Resultat |
|---|---|
| a · ignorér tilder | **Dræbt:** leverede assertioner fejler; citeret PASS skifter hjælper/gate fra rød til grøn |
| b · ignorér indrykning | **Dræbt:** samme effekt for indrykket ydre fence |
| c · accepter `"HEAD"` | **Dræbt:** HEAD-negativ fejler; stabil HEAD accepteres gennem begge veje |
| d · læs igen via `${regel_commit}:sti` | **Overlever alene; redundant for refskift**, når OID er fast og replacements deaktiveret. Ingen selvstændig kill kræves efter D10 |
| c+d · begge lempelser | **Dræbt:** tidsordnet xhigh→low-refskift giver fejlagtigt hjælper 0/PASS og åben gate; originalen afviser |

Det korte kædepas afviser manglende Codex-verdikt, manglende/ukendt transportkvittering, FAIL/HALT, manglende approval, forkert approver, manglende godkendelseskvittering og rød forgænger. En aktiv FAIL-draft koblet til et PASS-verdikt lukker også gaten. **NBSP-reproen er fortsat en vej fra FAIL-leverance til åben lokal gate.** Kørslerne beviser lokale databindinger; usignerede kvitteringer autentificerer ikke selve Codex-kaldet eller Mathias’ faktiske ord.

Dommen er bundet til:

```text
DIFF-runde4-til-runde5.diff  938ef57d29024aff5941309e4443989919da8999
RUNDE4-FUND.md              62380788453b5fa8aa391b77a601b08a0f6dea7c
kvittering.mjs             9b05d5af53bf1d4b35beaeb9eb32671bc42c1e4e
verdikt-byg.mjs            d7d7914e17e12f2e9e757486807a3f896c0c4eb4
gates.mjs                  9c94efde403d26312f72557b3bfb5dcf1a223429
```