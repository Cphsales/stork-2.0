# P-5 DOKUMENT-AKSEN — lokations-skabelon (M-35, retroaktiv)

**Konklusion: PASS (0 materielle fund).** Der er ingen påvist udeladelse af et kildeudsagn, som kræver en ændring af krav-dokken ved `b9c5249b`. Fire udsagn får ikke en selvstændig disposition på udsagnsniveau; de er gennemgået nedenfor med citat, pakke-materialitet og dispositionsforslag. De vedrører senere forbrugere eller datatilførsel, og tilfører ikke lokations-skabelonen et udækket krav.

## Grundlag og afgrænsning

Kørt i repo ved **`846a3e233bdbea3e48d1432b6ab118027a4b30bf`**, 2026-09-08. Ingen web. Kilder læst fra Git-objekterne i bundlet, ikke fra nyere udgaver af strategi-dokumenterne.

| Artefakt | Verificeret blob-OID |
| --- | --- |
| `recon/bundle.json` | `cde07ec7ac7daecc004f1d4671108b29570f4e28` |
| `recon/recon.md` | `7fbd3a2f43c03ce239aa81e20483326bf438463c` |
| **V:** `docs/strategi/vision-og-principper.md` | `37cf974c4674913ad39851d876bce2b6cbf5ab15` |
| **F:** `docs/strategi/forretningsforstaaelse.md` | `74c9a5727a39d00c6479623336b7a34a55a8ccba` |
| **M:** `docs/strategi/stork-2-0-master-plan.md` | `e6c9a715b81b8d9b069f36ae77a798186dabcde1` |
| **K:** `docs/sandhed/krav/lokations-skabelon-krav.md` | `b9c5249b7ab90d8898992bde61b8cb018bc4f561` |

`b9c5249b` er et **blob-id**, ikke et commit. Krav-filen i workdir og ved HEAD er byte-identisk med denne blob. Bundle og recon matcher også HEAD. Bundlets `tree_sha`/`launch_commit` er `7ad2bde1a798c33fdf83e07c04c67ee1963df130`; dette er recon-grundlaget, ikke en påstand om at pakken allerede er implementeret.

V og F er læst i deres helhed. M er holdt på bundlets anker: §1.12, §4 trin 10b, §2.7, lokationsbeslutningen i Appendix B samt de udpegede fundamentmønstre §1.1–§1.4/§1.11. De udtrykkelige krydshenvisninger til §0.5, §1.8, §4.2 og Appendix A FM er medtaget. Appendix B's øvrige beslutninger er kontrolleret for pakkegrænsen.

**E1–E51** nedenfor betyder de 51 punkter i recon's »Forretnings-flade-enumeration«, i rækkefølge, linje 1522–1572. Antallet er kontrolleret mekanisk. Dækning er undersøgt i både enumeration, claude-ai's dokument-/intet-data-fund (linje 1272–1406) og aktørens usikkerheder (1504–1518). En emneoverskrift alene er ikke bevis for, at alle dens udsagn er behandlet; omvendt kræves der ikke gentagelse af samme regel under alle dens kildehenvisninger.

**Materialitet:** Et fund skal være et oversprunget forretningsudsagn med en konkret konsekvens for DENNE pakkes krav. Kendt nedstrømsfunktionalitet tæller kun, hvis skabelonen mangler den nødvendige bæreevne. Derudover er hvert muligt hul prøvet mod hele K, inklusive bindende recon-dispositioner og synligt flyttede beslutninger. Eksisterende kode-/funddækning bruges til at frasortere falske P-5-fund; der er ikke kørt en ny kode-akse eller implementeringsaudit.

## Udsagn uden selvstændig disposition på udsagnsniveau

### U-1 — Hver bookingdag er en selvstændig planlægningsenhed

**Kilde + citat:** M §2.7.1, linje 1308:

> Hver dag i en booking er en planlægnings-enhed. Konkret modellering (én row pr. dag vs. dato-array) afgøres ved bygning

**Hvad recon sprang over:** E34 reducerer §2.7.1 til tilladelsesvalidering, cooldown, aktiv-gate og attribution. Fundet `#2.7:nedstroems-baereevne` (1340–1343) gentager disse flader; dagsopløsningen fremgår ikke som eget udsagn eller åben beslutning. Bookingområdet er dog overordnet placeret nedstrøms.

**Materielt for DENNE pakke: nej.** Udsagnet kræver dagsplanlægning i trin 24, ikke en bookingdag-entitet i trin 10b. Den relevante følge for skabelonen er opslag på den enkelte dato. K-4 ac 5 og K-6 ac 7 leverer netop aktiv-/tilladelsesopslag pr. dato; K-2 ac 4 leverer stand-identiteten. Kravet binder ikke forbrugeren til et udeleligt ugeopslag.

**Allerede dækket i krav-dokken?** Bæreevnen: ja, K linje 81, 44 og 123. Selve dagsplanlægningen: uden for pakken, K linje 411. Intet nyt krav nødvendigt.

**Disposition-forslag:** Supplér E34 med »Dagsopløsning: trin 24; 10b leverer dato-opslag og stand-identitet«. Bevar valget row/dato-array ved bookingtrinnet.

### U-2 — Antallet af placements kan variere mellem bookingens dage

**Kilde + citat:** M §2.7.1, linje 1309:

> Antal placements pr. dag kan variere

**Hvad recon sprang over:** E31/fundet om placement-hierarki dækker identitet, parent, pris og cykler. E34 og bæreevne-fundet nævner ikke variationen pr. dag. Hierarki-intet-data (1371–1374) handler om dybde og arv, ikke om denne variation.

**Materielt for DENNE pakke: nej.** Udsagnet handler om bookingens anvendelse af stande pr. dag. Det er ikke et krav om, at master-lokationens antal oprettede stande skal være en kalenderkonfiguration. K-2 tillader flere stande og leverer dem som de enheder bookingleddet binder til. Reglen »én klient pr. stand ad gangen« låser ikke antallet af anvendte stande over en hel booking.

**Allerede dækket i krav-dokken?** Den nødvendige mulighed for flere identificerbare stande: ja, K-2 linje 35–46. Dagsvis valg af antal er bookingfunktionalitet, ikke leveret i 10b (K linje 411/416). Der er ingen påvist begrænsning i K, som skal fjernes.

**Disposition-forslag:** Tilføj som nedstrømsnote til E34: »Booking kan bruge forskelligt antal stande pr. dag — trin 24; ingen fast ugekapacitet må udledes af skabelonen«. Ingen ny kalender-/kapacitetstabel i denne pakke på dette udsagn alene.

### U-3 — Eksterne klient-API'er er primær kilde frem for en rute gennem 1.0

**Kilde + citat:** F §15, linje 247:

> Stork 2.0 skal kunne hente data direkte fra eksterne kilder (klient-API'er) som primær kilde frem for at gå gennem 1.0

**Hvad recon sprang over:** E28 og migrationsfundet (1284–1287) disponerer greenfield, særskilt migrationsbeslutning og udtræk/upload. De disponerer ikke dette særskilte udsagn om den løbende primærkilde. Udtræk fra 1.0 og direkte klient-API-ingest er forskellige forhold.

**Materielt for DENNE pakke: nej.** Udsagnet etablerer ikke en ekstern autoritativ lokations-/leverandørkilde eller et krav om en lokationsadapter. Klient-API-ingest er et andet område. Lokationerne oprettes som autoritativ master-data; migration af gamle data er desuden eksplicit udskudt på M-25.4.

**Allerede dækket i krav-dokken?** Ikke et klient-API-krav i K, og det skal det heller ikke være her. K-1/K-9 kræver oprettelse og vedligehold uden udvikler; K linje 414 afgrænser migrationen synligt. Udsagnet ændrer ingen af disse krav.

**Disposition-forslag:** Supplér E28: »Direkte eksterne primærkilder: ikke berørt i 10b; ingen klient-API-ingest i lokations-skabelonen«. Bevar reglen til ingest-pakken; udled ikke en 1.0-synkronisering af migrationsnoten.

### U-4 — Ingen tidszonedrift mellem rapportering og pricing

**Kilde + citat:** F §16, linje 262:

> Stork skal kunne forhindre tidszone-drift mellem rapportering og pricing

**Hvad recon sprang over:** E29 gengiver kæden lokation → booking → vagt → løn, men ikke tidszonekravet. Det er heller ikke fanget i claude-ai's fund/usikkerheder. E17 og E26 afgrænser dog de to berørte domæner — pricing og rapportering — som uden for pakken.

**Materielt for DENNE pakke: nej.** 10b leverer ingen pricing-evaluering eller rapportaggregering. K-4/K-6's dato-opslag skal være entydige, men kildeudsagnet fastlægger hverken en tidszone, en timestamp-konvertering eller et nyt lokationsfelt. Det ville være en ekstra afledning at kræve en sådan beslutning her.

**Allerede dækket i krav-dokken?** Det konkrete tværdomænekrav er ikke skrevet ind i K; dets fravær er ikke et hul i denne pakke. Entydige opslag på dato D er allerede krævet i K-4 ac 5/K-6 ac 7, og prisens anvendelse er synligt placeret i trin 24/29 (K linje 417).

**Disposition-forslag:** Gør E29 eksplicit: »Tidszonekonsistens mellem pricing/rapportering: ikke berørt i 10b; behold som krav ved de forbrugende beregnings-/rapporttrin«. Lad ikke et generisk »kæden er dækket« være fremtidigt dækningsbevis for dette udsagn.

Disse fire rækker viser manglende detaljering i recon; de dokumenterer ikke fire manglende leverancer. Den eksisterende overordnede afgrænsning til senere trin er medtaget i materialitetsvurderingen.

## Angreb der ikke er nye P-5-fund

| Kildeudsagn / kandidat | Hvor det faktisk er disponeret eller fanget | Kontrol mod K og afgørelse |
| --- | --- | --- |
| V linje 13–25/53–54: holdbarhed, UI-styring, værdier som data | E1/E5–E7; dokumentfund `#princip-3:forretningslogik-som-data`, recon 1352–1355 | K-1/K-3/K-5/K-6/K-7/K-8/K-9 konkretiserer værdier og handlinger. UI-sider er synligt flyttet til lag F, handlingsfladen bevises nu (K 175). Ingen sprunget intention. |
| F §9, linje 169: »Stork skal kunne nægte at virke når kritisk konfiguration ikke er sat (default = intet)« | E8/E22 nævner ikke selve afvisningen tydeligt, men den relevante eksisterende kodeadfærd er fanget: manglende/ufuldstændig aktiv anonymiseringsmapping afvises, recon 248–254; uklassificerede kolonner er dokumentfund 1316–1319 | K-7 ac 1/4 samt bindende bøtte-1-dispositioner (K 185, 223/226) dækker klassifikation/anonymisering. Tilladelse uden gyldig ret afvises i K-6. Tom pris er synligt et planvalg (K 181). Ingen hvile ved intet valg er et udtrykkeligt M-21-krav (K-5 ac 5), ikke en glemt standard. Ingen udækket, kodefri 10b-konsekvens fundet. |
| F §9, linje 171–172: superadmin-aktivering af følsom konfiguration og logning fra hvert stadie | Konfigurations-lifecycle er E9 og fund 1379–1382; anonymiseringsstrategier/mappings har allerede kodeflade og fund 230–281; auditpligten er E10/fund 1320–1323 | K-7/K-8 og deres bindende fundament-dispositioner. En eventuel uoverensstemmelse mellem eksisterende aktiveringsrettigheder og ordet superadmin er en kode-/dispositionskontrol, ikke et kildeudsagn uden kodeaftryk. Ingen ny konklusion om den uoverensstemmelse her. |
| V princip 8/F §10: kontaktpersoner som én identitet | E12 har udtrykkelig grænsenote om leverandør-kontaktpersoner; leverandørfeltlisten er intet-data 1383–1386, persondata er 1387–1390 | K-3/K-7 og planlisten 181 behandler gruppefelter og kontaktdata. At drøfte om kontaktfelter kræver en personentitet er ikke en overset kildeintention: grænsen er allerede flagget. |
| F §12, linje 211–214: synlighedsscope, udpeget compliance-ansvar, break-glass | Scope er intet-data 1399–1402. GDPR-ansvar har kodefund 215–229 og claude-ai's rebind-note 1518. Override er intet-data 1367–1370 samt samme usikkerhed | K-8; K 220 indarbejder GDPR-fund; K-5/M-27b og K 407 disponerer fravigelse. Intet tavst P-5-hul. Den bevarede uenighed om GDPR-kantens wiring er ikke gjort til et nyt fund. |
| M §2.7.8, linje 1451: »UI filtrerer på type.« | Ikke skrevet ud i E41, men ordret i dokumentfundet 1336–1339 | Ikke en recon-udeladelse. K 388 markerer hele fundet behandlet; type er i K-1, UI-afgrænsningen i K-9. K's gengivelse kan ikke bruges til at genfinde dette som et oversprunget kildeudsagn. |
| M §2.7.6, linje 1414–1429: rabattrapper, max-rabat, excluded-lokation der tæller med uden selv at få rabat, fakturasnapshot/immutable godkendte rapporter | E39 lægger rabatmekanik i trin 29; fund 1340–1343 fastlægger skabelonens nødvendige leverandørtype/lokationsnøgle. Prisforbrug er intet-data 1403–1406 | K-3 leverer type-/ejerankeret, og K 411–412/417 flytter fakturering/rabat/prisforbrug synligt. Reglerne er forbrugernes mekanik; intet yderligere master-data-krav udledt. |
| F §16, linje 261: konsistent aggregering på tværs af TM/FM | E17/E20/E26 afgrænser salg, provision og rapportering; E2/E16/E27/E34 og fund 1280–1283/1332–1335 fastholder fælles model og attribution | K-1 forbyder parallel lokationsattribution. Ingen aggregeringsmotor i 10b. Ikke et nyt krav til pakken. |

## Kontrol af ankerets fulde forretningsindhold

| Kildeområde | Recon-dækning | Krav-resultat ved den angivne blob |
| --- | --- | --- |
| M §1.12, 609/613: master-data og samtlige otte lokationsfelter | E31; fund 1280–1283/1300–1303 | K-1, K-3, K-4, K-5, K-7. Ingen feltintention tabt. |
| M §1.12, 614–616: placements, fælles entitet/hierarki, prisarv, ingen cykler | Fund 1304–1307; hierarki-/pris-intet-data | K-2; konkrete ejer-/standregler kommer også fra M-17/M-18/M-29. De er efterfølgende afklaringer, ikke oversprungne kildeudsagn. |
| M §1.12, 620–622 + Appendix B 1891: statusvalg i 10b, dedikeret overgang, årsag/audit, aktiv bookinggate | E31/E32; fund 1308–1311/1391–1394; usikkerhed 1516 | K-4: aktiv/dvale/nedlagt, årsag, historik og dato-opslag. |
| M §1.12, 626–627: dateret/versioneret klientret og validering på bookingdato | Fund 1276–1279/1292–1295/1375–1378 | K-6 leverer retten pr. dato. Gruppekobling/fravalg er senere Mathias-model; afvigelsen fra kildeafsnittets tabelform er synligt vedligeholdsflag (K 426), ikke en glemt regel. |
| M §1.12, 629 + Appendix A 1812: cooldown pr. lokation, UI-konfiguration | E33; fund 1288–1291/1367–1370/1379–1382 | K-5; automatisk trigger og annullerings-/niveauvalg er synligt trin 24. |
| M §1.12, 633–634: separat leverandør, FK og type som rabatanker | Fund 1296–1299/1383–1386; E39 | K-3; gruppe/leverandør-identifikation og tidspunkt for krævet type er synlige planvalg (K 181). De er disponeret, selv om man kan angribe dispositionen på en anden akse. |
| M §4 trin 10b, 1520: samlet scope, core_identity, betinget migration | E30; fund 1284–1287/1344–1351/1395–1398 | K-1–K-9; migration udsat ved M-25.4 og registreret i K 375/402/414. |
| M §2.7.2–§2.7.5/§2.7.7 og øvrige Appendix B-valg | E32/E35–E40, inklusive begrundede henvisninger til senere trin | Ingen assignments, hotel, køretøj, diæt eller checkliste i 10b. Bookingstruktur/andre status-enums må ikke importeres som nye lokationskrav. |
| V's tre bærende/ni operationelle principper; F §1–§16; M's udpegede fundamentmønstre | E1–E29/E42–E49; relevante dokument-/intet-data-fund og kontrollerne ovenfor | Én sandhed, FK, historik, adgang, audit, klassifikation og anonymisering er indarbejdet. Åbne forretningsvalg er ikke forvekslet med manglende kildeudsagn. |

## Disposition og fremlæggelse

**PASS — 0 materielle fund. Materiel fundliste: tom.** U-1–U-4 foreslås præciseret som ikke-berørte/nedstrømsudsagn ved næste normale vedligehold af recon. De kræver ingen ændring af K ved `b9c5249b`.

Forslag til synlig fremlæggelseslinje: »P-5 dokument-aksen er kørt retroaktivt mod de bundlede kilder: PASS, ingen nye materielle udeladelser og ingen kravændring. Fire udsagn om senere funktionalitet er registreret med eksplicit disposition i OUT-p5-dokument.md.«

Hvis en disposition senere gør en af rækkerne materiel, skal den genåbnes som et navngivet fund, få normal disposition og fremgå som **»ændret siden sidst«** med den konkrete kravændring. Denne rapport ændrer kun rapportfilen; krav, recon, bundle og fremlæggelse er ikke omskrevet eller sendt.
