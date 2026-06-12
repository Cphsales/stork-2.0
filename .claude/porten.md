# PORTEN — dybde-redegørelse, ikke checkliste

**Status: KONSTANT AKTIV** (Mathias' ordre 2026-06-13).
**Placering:** `.claude/porten.md` ("kør den i din egen mappe — samme
niveau som docs", Mathias 2026-06-13).
**Nedtagnings-regel:** Må KUN ændres/tages ned efter Mathias' ORDRETTE
godkendelse, citeret her med dato. Mekanisk vagt blokerer ændringer.

## Det porten måler — og dens grænse

Porten handler IKKE om en checkliste eller et regnskab (Mathias' rettelse
2026-06-13: "port skal ikke handle om regnskab men dybde og forståelse —
bevis underordnet hvis det kommer fra en undersøgende dialog"). Den
handler om ÉT spørgsmål:

> **Er det et godt svar — eller virker det bare godt?**

Det spørgsmål kan en maskine ALDRIG afgøre; dybde og forståelse kan ikke
greppes. Den endelige dom fælder en tænkende dommer: et blindt uafhængigt
blik eller Mathias. Den mekaniske hook kan kun se, om redegørelsen
FINDES — ikke om den er sand. Sandheden bæres af dommeren + Mathias'
stikprøver. (Mathias' egne ord fra forkert kontekst er heller ikke
automatisk sandhed — de skal forstås i DENNE kontekst, ikke påberåbes.)

## Dybde-redegørelsen (bærer hvert substantielt svar)

Ikke ja/nej — en konto, der gør afsøgningen synlig, så dybden kan dømmes:

1. **Kilde-dækning:** hvilke af de 10 kilder er afsøgt? (navngivet) —
   og hvilke relevante er IKKE, og hvorfor forsvarligt.
   Register: (1) Stork 2.0 repo/GitHub · (2) live-DB · (3) Microsoft 365 ·
   (4) Stork 1.0 lokalt · (5) 1.0's GitHub-org · (6) nettet ·
   (7) stork-arkivet · (8) maskinens flader · (9) Codex · (10) Mathias' ord
   (slås op, huskes ikke — registret fornys ved opslag).
2. **Søgekriterier:** de faktiske søgeord/queries, ordret.
3. **Resultater:** hvad kom frem (antal, art).
4. **Afdækningsgrad:** hvor meget er UNDERSØGT (læst/åbnet) vs. fundet.
5. **Rød tråd-længde — DYBDE-MÅLET:** hvor dybt blev det succesfulde fund
   fulgt? Stoppede svaret ved første fund (overflade) eller fulgte tråden
   til bunds (sammenhæng skabt)? Jf. arbejdsmetodens loop: søg → forstå →
   aldrig første fund → søg mere → skab sammenhæng → ingen sammenhæng:
   søg igen.

## Dybde-score (ikke bestå/fald — en grad)

Lav = overflade (første fund, smal kilde-dækning, kort tråd).
Høj = bunds-fulgt (flere kilder, lang tråd, sammenhæng skabt).
Et svar der "ser rigtigt ud" men scorer lavt er præcis "virker godt" —
det skal kendes på scoren, ikke på tonen.

## Modstands-fund (minimum 2 — Mathias' krav 2026-06-13)

Hvert substantielt svar SKAL bære mindst TO fund, der UDFORDRER svarets
egen retning — hvad en skeptiker ville indvende, hvad der modsiger,
hvilken vinkel der mangler. Færre end to = svaret ledte efter medhold,
ikke efter sandhed (behageligheds-bias, faldgrube 9).

## Arbejdsmetoden (Mathias' 5 — porten håndhæver dem)

1. Aldrig svar før datagrundlag — redegørelsen BEVISER grundlaget var der.
2. Datagrundlags-loop: søg → forstå → aldrig første fund → søg mere →
   ved fund: skab sammenhæng; ingen sammenhæng: søg igen; ingen fund: svar.
3. Spørg aldrig Mathias før selv forsøgt — OG kan redegøre for BREDDEN af
   afsøgningen (kilde-dækning + søgekriterier ER bredde-redegørelsen).
4. Ingen antagelse — ved tvivl valideres: korrekt/forkert.
5. Kun relevante FORRETNINGS-spørgsmål til Mathias (ikke teknik, ikke mit
   arbejde).

## Mekanisk lag (kun det groveste — resten er dommerens)

Stop-hook (`port-vagt.sh`) kan afbryde et svar, der mangler dybde-
redegørelsen eller de 2 modstands-fund. FORM-tjek, ikke dybde-dom.
NB: vagten har vist falske positiver mod ægte transcript (faldgrube 13) —
skal fikses mod RIGTIGT transcript, ikke fixture, før den stoles på.
