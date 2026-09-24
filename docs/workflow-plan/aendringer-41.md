# Ændringsliste — Mathias 2026-09-24: »jeg går med dine anbefalinger«

Gælder planens §3-anbefalinger + lukning af de 9 huller. Kilde for analysen: /tmp/claude-1000/-home-mathias/68b2f4a3-3d01-4fc2-a1c7-6219a0dc8b19/scratchpad/overfloedige-uafhaengig.md (læs helt).

## Skæres (FJERN/FORENKL)
S1 Byggetjekket forenkles til ÉT CI-job med fire tjek: (a) testene grønne, (b) de udpegede mutanter dræbt, (c) intet låst ændret (plan, tests, testvalg-fil), (d) planen og testene er dem dit `plan ok` og dækningsdommen bandt. Forenklingen ER omlægningen i planens §4.1 trin 3 (ikke en senere, ekstra ombygning). To tillidszoner, per-bid-reviews, build-proof-artefakt-kæden udgår.
S2 Én plan-læser: Codex (code-reviewer læser ikke planen; den dømmer testdækningen i trin 3).
S3 Manifestets D12-bid-graf forenkles fra pakke 2: tests dækker kravet direkte (D10 bevares; D12 bortfalder som regel — synlig ændring af M-40-forbedring). Pakke 1's eksisterende manifest bruges som det er.
S4 `forventningsliste-udkast.md` fjernes, når byggetjekket er lagt om (dublet af manifestet).
S5 `plan-approval.json`/`krav-approval.json` bortfalder: ledgeren (ordet + reference til tekstens blob) er eneste kilde; byggetjekket og hooken læser ledgeren.
S6 Planner og bygger er samme Code-rolle/session (»Code — planner og bygger«); låsene bærer adskillelsen.
S7 §3.4-afgørelsen (indhold eller teknik når et trin ikke lukker) flyttes fra code-reviewer til Codex.
S8 G/H-opslag flyttes helt til planen (trin 2); krav-trinnets kildetjek omfatter ikke G/H.
S9 `actors.lock.json` fjernes (og dens kobling i hooks/codex-run/roller.mjs), da pins bortfalder.
S10 Gentagelser i disciplin-ny: hver regel ét sted (regel 1, »verificér før du påstår«, e2e-reglen §3.6 flettes i §3.3 med Mathias' sætning ordret, tre regelsæt for dømning → ét i §5, §9.3/§9.4 gentages ikke i rolleteksterne, D13 flettes i »Hvad en test er«, D4 + »Holdt mod de andre« → én). »Én fortælling« (bottens ordlyd) fjernes. §3.0 formålslås: behold hans sætning, kort.
S11 §12 Stop-betingelser fjernes (dubletter; ét punkt modsiger »byggeren vælger resten«).
S12 §11 tjekliste og §7 invarianter BLIVER (hans regler) men kortes ned uden at ændre indhold.
S13 Slutprøven kører på testdatabasen med realistiske data; driftsdata kun når pakken læser eksisterende data (fx løn). For pakke 1: ingen læseadgang til drift, P-8 skrives om til testdatabasen, kildekontrakt/kildefiler/p8-kilde-scope.sql bortfalder, persondata-punktet i ½-siden bortfalder. (Hans »top-til-tå: kode = din sandhed … doc-grøn ≠ dybde« bevares: fuld dybde gennem brugernes indgange.)
S14 `v5.yml`/`pr-drift-warning.yml`: behold kun det der kører selvtests for det der bliver; fjern resten.
S15 Kravet flyttes (git mv) fra udkast til docs/sandhed/krav/ i stedet for at kopieres; hooken tjekker blob mod ledgeren.

## Huller der lukkes
H1 `slut ok` bindes: samle-tjekket kræver en ledger-post `slut ok` der refererer slut-rapportens blob, før en pakke-PR kan merges (og dermed deployes).
H2 Omvendt dækning: Codex' kildetjek tjekker også at hvert punkt i masterplan-trinnet står i kravet eller under »Ikke i scope«, og at negativer i masterplanen er med.
H3 Chat = fil: en fremlæggelse er filens tekst gengivet ordret i chatten (krav, ½-side, slut-rapport-fremlæggelse); ledgeren binder filens blob; krav-rollen/fabrikken kontrollerer at chatteksten er filens tekst før ordet bedes om.
H4 Kildetjek før spørgsmål: Codex' kildetjek (inkl. kodefakta) kører FØR krav-rollen stiller spørgsmål — på pakkens masterplan-trin — og igen på udkastet.
H5 Én global ledger `docs/sandhed/mathias-ord.md` og én global ordbog `docs/sandhed/ordbog.md` (overlever pakke-luk); pakke 1's ledger og ordbog flyttes dertil; M-numre fortsætter.
H6 »Afgøres ved trin X«-listen skrives ind i masterplanen ved det trin (masterplan-rettelse ved `slut ok`), så den har en modtager.
H7 Codex ejer manifest, testindeks og testvalg-fil (`prover.json`) i fremtidige pakker.
H8 Den ene rettelse efter plan-læsningen genlæses af Codex (kun deltaen).
H9 Fabrikken (Code som orkestrator: starter sessioner, overdrager, merger) får en rolletekst med MÅ/MÅ IKKE (fx må ikke merge uden grøn samle-tjek + Codex' merge-dom + ledger-ord; må ikke ændre låste filer; må ikke tale på Mathias' vegne).
