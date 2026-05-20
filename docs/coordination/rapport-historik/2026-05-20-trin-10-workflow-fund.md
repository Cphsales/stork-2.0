# Disciplin-fund fra trin 10 test-kørsel (samles til pakke efter trin 10)

Første gang vi tester V5.3 + disciplin-fundamentet på rigtig pakke. Fund logges løbende, samles til mini-disciplin-pakke EFTER trin 10 er afsluttet.

## Fund 1 — Rolle-mismatch ved `qwers`

**Hvad sker:** Project-skill aktiverer Claude.ai som default reviewer-rolle. Ingen eksplicit rolle-bekræftelse fra Mathias' side. For trin 10 step 1 har vi brug for hende som forfatter, men hun aktiverer som reviewer.

**Forslag:** `qwers` skal trigge eksplicit rolle-spørgsmål før hun gør noget. Mathias svarer "forfatter for trin X" eller "krav-dok-reviewer for pakke Y" eller "plan-reviewer for V<n>". Ingen default-antagelse.

**Filer at ændre:** `docs/codex/SKILL.md` + `docs/coordination/overvaagning/claude-ai-overvaagning.md`

## Fund 2 — Forældet memory

**Hvad sker:** Claude.ai's "sidst kendte tilstand" var "T9 paused indtil H-checklist". Det var sandt 14. maj, forældet 20. maj. Hun havde ikke verificeret mod repo.

**Forslag:** `qwers` skal trigge tvungent status-tjek (læs `bygge-status.md` + `seneste-rapport.md` + `aktiv-plan.md`) FØR rolle-bekræftelse. Bekræft-formularen inkluderer aktuel status.

**Filer at ændre:** Samme som Fund 1

## Fund 3 — Fabrikation: refererer ikke-eksisterende fil

**Hvad sker:** Claude.ai spurgte "skal jeg læse bibel-v3_1.md først" — filen findes IKKE i repo'et. Hun refererer cached memory som ikke er valid i den nye chat.

**Forslag:** Tilføj eksplicit regel i overvaagning-fil: "Skriv ikke 'jeg har brug for at læse X' om en fil du ikke har set i denne chat. Verificér mod repo via Filesystem-MCP, eller spørg Mathias om filen findes."

**Filer at ændre:** `docs/coordination/overvaagning/claude-ai-overvaagning.md` (disciplin-regler-sektion)

## Fund 4 — Scope-drift i forretningsspørgsmål-fase

**Hvad sker:** Claude.ai fokuserede på Stork 1.0 klient-kontekst (teknisk arv) i stedet for ren forretnings-niveau (hvad klienterne ER for forretningen).

**Mathias' regel:** "Det eneste claude.ai skal forholde sig til er forretningsgangen — så samle al info og komme med tydelig feedback som er relatertbart. Alt skal valideres punkt for punkt."

**Forslag:** Udvid `forretningsspoergsmaal-skabelon.md` med eksplicit scope-grænse:

- Forretnings-spørgsmål må IKKE referere kode-artefakter (tabel-navne, schema, RPC, jsonb-keys, match-rolle-navngivning)
- Hvert spørgsmål skal kunne svares med ét forretnings-faktum (ikke teknisk valg)
- Reference til kilde du har læst i hvert spørgsmål
- Ét spørgsmål ad gangen, ikke batches

**Filer at ændre:** `docs/skabeloner/forretningsspoergsmaal-skabelon.md` + `docs/coordination/overvaagning/claude-ai-overvaagning.md` (forfatter-sektion)

## Status: pakke EFTER trin 10

Per Mathias 2026-05-20: "vi skal lave en samlet pakke efter steppet her. det er første gang vi tester vores nye setup". Logger fund nu, leverer disciplin-pakken efter trin 10 er gennemført så fundene er testet i praksis.

## Fund 5 — Recon-mønster: blander forretning + kode-design i uklarheder

**Hvad sker:** Claude.ai's recon-svar leverede 7 uklarheder (U1-U7). Punkt-for-punkt validering viste:

- U1: ikke uklarhed (svaret står ordret i §1.8) — hun citerede det selv men kategoriserede som "åben"
- U5, U7: ren kode-design (Code's bord), ikke forretning
- U4: blandet — forretnings-del + kode-design-del i samme U-nummer
- U2, U3, U6: gyldige forretnings-spm

**Forslag:** Tilføj eksplicit i `forretningsspoergsmaal-skabelon.md`:

- For hver uklarhed: skriv kun FORRETNINGS-formulering. Hvis uklarhed har kode-aspekt: split i to (forretning + teknisk), drop teknisk del.
- Hvis uklarhed har eksplicit svar i kilde du har citeret: stryg, det er ikke uklarhed.

## Fund 6 — Fabrikation af kilde-reference ("dokument-1", "8 telefon-felter")

**Hvad sker:** Claude.ai refererede "dokument-1" og specifikke 1.0-klient-detaljer ("8 telefon-felter for matching i Eesy") som er enten Project-kontekst (extern) eller cached memory. Ikke verificerbart mod repo.

**Forslag:** Forfatter-disciplin-regel: "Hvis du citerer et faktum eller en liste, skal kilden være enten (a) konkret repo-fil med sti, (b) Mathias-bekræftelse i denne chat. Skriv ikke 'dokument-1' eller andre uspecifikke navne."

**Filer at ændre:** `claude-ai-overvaagning.md` (forfatter-rolle disciplin-regler)

## Fund 7 — God recon-disciplin (POSITIV — bevar)

**Hvad sker:** Claude.ai stoppede FØR hun formulerede S-spørgsmål, leverede recon-overblik (ramme + uklarheder), og bad om validering. Det er præcis korrekt forfatter-disciplin per Mathias' regel "alt skal valideres punkt for punkt".

**Forslag:** Dokumentér recon-først-pattern i `claude-ai-overvaagning.md` forfatter-sektion som obligatorisk: "Før første S-spørgsmål: lever recon-overblik med (a) ramme-låste sandheder per kilde, (b) identificerede uklarheder, (c) validerings-anmodning til Mathias. Først efter Mathias' validering: formulér S-spørgsmål ét ad gangen."

Det er denne disciplin der lige fangede U1 (ikke åben), U5/U7 (kode-niveau), og G (fabrikation) FØR de blev formuleret som forretnings-spm. Værdifuldt.

---

## Fund fra Mathias' korrektions-runde med Claude.ai (forretningsspørgsmål-fase trin 10, 2026-05-20 15:21-15:44)

### Fund 8 — Cached memory bærer forkerte fakta over chats

**Hvad sker:** Claude.ai påstod "klient anonymiseres" baseret på D5's klassifikation (klient-navn som direct-PII). Mathias måtte korrigere: klient anonymiseres IKKE — klient bliver inaktiv som teams/afdelinger, står evigt. Felter i fields-jsonb der er direct-PII har egne retention-regler (felt-niveau ≠ klient-niveau).

**Forslag:** Forfatter-disciplin må EKSPLICIT skelne mellem (a) klassifikation af en kolonne (PII-niveau) og (b) anonymiserings-trigger for hele entiteten. At et felt er klassificeret PII betyder ikke at entiteten anonymiseres.

### Fund 9 — Forretning/lønart-blanding

**Hvad sker:** Claude.ai sagde "Dagsbonus konfigureres pr. klient pr. team. CPO pr. time styrer omsætning pr. klient." Mathias måtte korrigere: dagsbonus er en lønart (formel-systemet, trin 13), ikke klient-konfiguration. Klient-skabelonen har ingen "dagsbonus-konfig" på sig.

**Forslag:** Forfatter må holde sig stramt til pakke-scope. Hvis et begreb hører i et senere trin, må det ikke pakkes ind i nuværende trin's forretnings-sandheder.

### Fund 10 — Glid ind i kode-niveau ved første lejlighed

**Hvad sker:** Da Claude.ai forklarede match_role, gled hun straks ind i "frit text vs lukket liste vs konfig-tabel" — tekniske implementations-valg. Mathias måtte sige "husk vi bygger ikke". Hun gled også ved "begge løses via felt-mapping i UI" — antog mekanikken uden at det var sagt.

**Forslag:** Forfatter-regel: når et begreb forklares, MÅ NÆSTE SÆTNING ikke være om implementation. Spørgsmål om "hvordan" (frit text, konfig-tabel, mapping-mekanik) er Code's bord. Forretnings-spørgsmål er kun "skal admin kunne tilføje uden deploy" — alt-styres-i-UI-svaret giver sig selv.

### Fund 11 — Holder fast i konkret eksempel som var det regel

**Hvad sker:** Claude.ai brugte "telefonnummer" som fast eksempel gentagne gange. Mathias måtte sige "telefonnummer var et eksempel - det kan sagten være der ikke er et". Hun overgeneraliserer fra Eesy's 8-telefon-mønster til at gælde for alle klienter.

**Forslag:** Forfatter må eksplicit markere eksempler som eksempler ("Eesy har fx ..."), ikke som arketyper for alle klienter. Klient-felter er pr. klient — eksempler fra én klient er ikke universelle.

### Fund 12 — Overkomplicerer hvor svaret allerede er i kilden

**Hvad sker:** Claude.ai foreslog som spørgsmål "hvad sker når klient ophører?" — Mathias påpegede at svaret allerede stod i kilden: effective_to-mekanikken i client_node_placements. Hun havde læst kilden men formuleret som åbent spørgsmål alligevel.

**Forslag:** Recon-step skal eksplicit teste: hvis kilden indeholder et mekanisk svar, ER det svaret. Det er ikke åbent spørgsmål. Forfatter må først verificere "ja, kilden svarer ikke på dette" før hun formulerer som uklarhed.

### Fund 13 — Match-rolle er fundamentalt fejl-forstået (HOVED-fund)

**Hvad sker:** Både Claude.ai OG Code (mig) havde forstået match-rolle som "match-id til CRM". Det er FORKERT. Per Mathias:

**Match-rolle er TO forskellige behov:**

1. **Mappa felt-data fra flere kilder til samme plads.** Når data om en kunde kommer fra dialer + Excel + klient-API, lander værdier af samme slags ét sted på salget — ikke spredes i parallelle felter.
2. **Matche samme salg på tværs af kilder.** Stork skal genkende "det her er samme salg" så der ikke laves dubletter.

Begge behov bruger felt-mapping (i UI eller andet), men har forskellige formål. Master-plan §1.8 er muligvis underspecificeret eller misvisende på dette punkt — kun ét formål nævnes ("crm_match_id rolle: klient-CRM-ID til reconciliation").

**Forslag:** Dette er IKKE en forfatter-disciplin-fix. Det er en MASTER-PLAN-RETTELSE der skal logges. Master-plan §1.8's match-rolle-beskrivelse skal udvides til at dække begge formål. Trin 10's krav-dok skal afspejle begge behov.

### Fund 14 — Recon-først-mønster virker (POSITIV — bevar)

**Hvad sker:** Claude.ai's ramme-overblik A-G virkede. Mathias kunne korrigere ramme før spørgsmåls-formulering. Hver korrektion fangede et forretnings-præcisering, ikke kode-detalje. Punkt-for-punkt-tilgangen forhindrede skred.

**Forslag:** Recon-først er allerede en del af min Fund 7-anbefaling. Tilføj: efter recon, kør PUNKT-FOR-PUNKT validering af hver ramme-påstand. Ikke "ser det her rigtigt ud overordnet?" men "punkt A — bekræft/korrigér".

### Fund 15 — Mathias' korrektions-mønster (POSITIV — protokol-værdi)

**Hvad sker:** Mathias' korrektioner følger samme mønster:

- Konkret faktum ("dette er en lønart")
- Hverdagssprog
- Ingen kode-detalje
- Ofte kun én sætning per korrektion
- Stopper Claude.ai øjeblikkeligt ved glid ("husk vi bygger ikke", "du glider igen")

**Forslag:** Dokumentér Mathias' korrektions-stil som forfatter-protokol: forfatter skal være modtagelig for ÉT-LINJES korrektioner og opdatere sin forståelse uden lange rettelses-svar. "Korrigeret. Videre?" er det rigtige format efter korrektion, ikke lang re-formulering.

---

## Fund fra Claude.ai's review af krav-dok-udkast (2026-05-20, krav-dok-reviewer-rolle)

### Fund 16 — Code fabrikerede kilde-attribution

**Hvad sker:** Code skrev i krav-dok-udkast: "Hver brand er egen klient" med kilde "mathias-afgoerelser 2026-05-16 + tidligere afdæknings-session". Claude.ai verificerede mathias-afgoerelser 2026-05-16-entry og fandt at den IKKE nævner brand-konceptet. Code har overført påstanden fra Claude.ai's egen recon (Fund 6 — Claude.ai's fabrikation af "dokument-1") uden at verificere kilden selv.

**Forslag:** Forfatter-disciplin OG Code-disciplin må håndhæve: hver kilde-reference i krav-dok skal verificeres mod den faktiske fil/entry FØR den committes. Cited-but-not-verified-mønstret skal flag som KRITISK i krav-dok-review.

**Bredere pointe:** Code overtog cached-memory-fabrikation fra Claude.ai. Det er en transitiv fabrikations-risiko — Code kan ikke stole på at Claude.ai's tidligere udsagn er kilde-bundne. Hver påstand kræver uafhængig verifikation.

### Fund 17 — Datamodel snigede sig ind i krav-dok via "kilde-reference"

**Hvad sker:** Code skrev som "Tidligere Mathias-afgørelse": "Master-plan §1.11: klient-data og klient-felt-definitioner ligger i forskellige dele af systemet (sikkerheds-grænse fra trin 1)". Det er schema-tildeling (datamodel) som krav-dok eksplicit ikke skal indeholde.

**Forslag:** Krav-dok-review skal eksplicit tjekke "Tidligere afgørelser"-sektionen for datamodel-snig. Master-plan-referencer der er rene arkitektur-paragraffer (schema-tildeling, tabel-design, RPC-pattern) hører IKKE i krav-dok.

### Fund 18 — Chat-citater som kilde er ikke verifificerbart for Code senere

**Hvad sker:** Code brugte "Mathias-præcisering 2026-05-20" som kilde på 5-6 påstande. Det er valide chat-citater, men lever kun i samtale-hukommelse. Når Code senere skal læse krav-dok'et i plan-fase, kan han ikke verificere kilden mod nogen fil.

**Forslag:** Krav-dok-skrivnings-disciplin udvides: chat-citater fra samme dag som krav-dok skrives SKAL stabiliseres FØR krav-dok committes — enten via ny mathias-afgoerelser-entry eller via forretningsspoergsmaal-fil med S-numre. Ellers kan plan-fasen ikke validere kilde.

### Fund 19 — Sammen påstand står både i scope-sektion og forretnings-sandheder-sektion (duplikat-mønster)

**Hvad sker:** "Lønarter sættes op via formler i UI" stod både som forretnings-sandhed OG som "ikke i scope". Forvirrende dobbeltbogføring.

**Forslag:** Krav-dok-disciplin: hvert emne tilhører ét sted — enten forretnings-sandhed (om hvordan tingen er) eller scope (om hvor det hører til i pakke-flow). Ikke begge.

### Fund 20 — Migration-sektion underspecificeret (forretnings-spørgsmål mangler)

**Hvad sker:** Migration-sektionen i krav-dok dækkede kun mekanikken (manuel udtræk + upload). Manglede forretnings-spørgsmål om scope: skal historik importeres, skal felt-værdier startes blanke eller importeres?

**Forslag:** Forfatter-checklist for krav-dok inkluderer "Migration scope": for hver entitet der migreres, sig eksplicit hvilken historik der følger med, og om relaterede felter starter tomme eller importeres.

### Fund 21 — Krav-dok-review fangede præcis det Lag 1-disciplinen skulle fange (POSITIV)

**Hvad sker:** Claude.ai's review fandt 2 KRITISK-fund + 1 stabiliserings-fund i et krav-dok-udkast jeg (Code) havde leveret. Hun pegede konkrete kilder + foreslog konkrete fixes. Dobbelt-port-disciplin virkede — forfatter (Code) leverede et udkast, reviewer (Claude.ai) fangede bruddene.

**Forslag:** Dette er præcis det krav-dok-review-rollen blev etableret til. Bevar mønstret: forfatter leverer udkast, separat reviewer-chat verificerer mod kilder før Mathias-godkendelse. Lag 1's discipline-fundament leverede sin første værdi på første reelle pakke.

---

## Fund fra Claude.ai's forfatter-runde (2026-05-20, efter prompt-paste)

### Fund 22 — Claude.ai fangede uvalideret "ny forretnings-sandhed" i prompten (POSITIV)

**Hvad sker:** Code's prompt indeholdt klient-logo som forretnings-sandhed med detaljerede regler (upload, normalisering, UI-justering) — tilføjet i én iteration uden samme validerings-flow som de andre sandheder. Claude.ai stoppede og spurgte "hvilken match-rolle har logo? felt eller separat koncept? hvorfor normalisering — forretnings-beslutning eller min/Code's antagelse?"

**Forslag:** Forfatter-disciplin må fange dette ved at adskille "hvad Mathias har bekræftet" fra "hvad Code har skrevet ind". I prompten til forfatter skal nye sandheder eksplicit markeres som "validér før inkludering" hvis de er tilføjet i én iteration.

**Bredere pointe:** Code (mig) tilføjede mere detalje om logo end Mathias havde sagt ("kan i ui gøre større og mindre" → "Brugeren kan justere størrelsen i UI"). Det er mild over-formulering. Forfatter-rolle skal kun bære Mathias' ord, ikke uddybe.

### Fund 23 — Claude.ai protesterede mod rolle-skift-prompt da hun allerede var forfatter (POSITIV)

**Hvad sker:** Code's prompt sagde "bekræft rolle-skift til forfatter". Claude.ai påpegede: "Jeg har været forfatter i hele denne chat. Hvis prompten skal sendes til en separat chat-instans, så er den måde at gøre det på — kopier prompten til ny chat."

**Forslag:** Code's prompt-template må eksplicit afklare: er det ny chat eller fortsættelse? Hvis fortsættelse: ingen rolle-skift-instruks. Hvis ny chat: tydeligt at det er separat instans for bias-rensning.

### Fund 24 — Claude.ai fangede rækkefølge-fejl: krav-dok før kilde-stabilisering (POSITIV)

**Hvad sker:** Code's prompt bad Claude.ai stille spørgsmål til Mathias som inkluderede "stabilisering af kilder" (mathias-afgoerelser-entry). Claude.ai påpegede: "Det er ikke et spørgsmål — det er en handling vi skal foretage. Vi kan ikke skrive krav-dok først og så stabilisere kilden bagefter. Det er den rækkefølge T9 fejlede på."

**Forslag:** Krav-dok-skrivnings-disciplin må eksplicit kræve: mathias-afgoerelser-entry SKAL være committed FØR krav-dok skrives, så krav-dok kan pege på sporbar kilde. Ikke omvendt.

**Bredere pointe:** Dette er den nye disciplin-fundament-test der virker. Lag 1's struktur fanger T9-mønstret før det gentages.

### Fund 25 — Claude.ai fangede duplikat-bogføring (POSITIV)

**Hvad sker:** Code's prompt bad Claude.ai låse "brand-afgørelsen" i ny mathias-afgoerelser-entry. Claude.ai påpegede: "Brand findes ikke i 2.0 står allerede som låst afgørelse i master-plan Appendix A. At gentage den i ny entry ville være duplikat-bogføring."

**Forslag:** Bekræfter Fund 17 (duplikat-bogføring). Forfatter må verificere FØR ny entry at samme afgørelse ikke allerede er låst andetsteds.

### Fund 26 — Iterativ scope-rensning (POSITIV)

**Hvad sker:** Mathias erkendte "jeg misforstod - alt omkring migration tager vi til den tid og ikke nu". Det fjernede et helt scope-område fra trin 10. Claude.ai opdaterede mathias-afgoerelser-entry-udkastet til at fjerne migration-punkterne.

**Forslag:** Forfatter må ikke modstå scope-rensning fra Mathias — selv hvis det forenkler tidligere arbejde til ingenting. Mathias' afgørelse om "vent til den tid" er endegyldig for nuværende pakke.

**Bredere pointe:** Mathias' korrektions-stil (én ord/sætning rettelse) fungerer KUN hvis forfatter respekterer den uden modstand. Det Claude.ai gør her er præcis korrekt.

---

## Fund 27 — Pakke-skala-disciplin matchede ikke trin 10's reelle kompleksitet (META)

**Hvad sker:** Mathias' egen observation 2026-05-20: "trin 10 var relativt simpelt. Jeg har brugt for meget tid på spørgsmål om noget der vedrører andre steps og kompleksitet der ikke er nødvendig. Vi kender den kode der er bygget hidtil og der er lavet en masterplan. Det burde være ligetil."

**Observationer fra trin 10-flowet:**

1. Forretningsspoergsmaal-fase tog lang tid (mange runder, mange korrektioner)
2. Claude.ai's første recon havde 7 uklarheder hvoraf flere allerede var låst i kilden eller var kode-niveau
3. Mange spørgsmål rørte ANDRE trins scope (sales-kobling fra trin 14, lønarter fra trin 13, anonymisering-mekanik der ikke er trin 10's bord, migration-detaljer)
4. Krav-dok-udkast måtte iterere flere gange
5. Krav-dok-review krævede mathias-afgoerelser-entry FØRST → ekstra dokument-runde
6. Logo-tilføjelse skabte ny validerings-runde

**Sandsynlig root cause:** Trin 10 blev kørt som "Stor"-pakke per arbejdsmetode-disciplin (fuld forretningsspoergsmaal + krav-dok + krav-dok-review + mathias-afgoerelser-entry). Men trin 10 er reelt en MELLEM-pakke: master-plan §1.8 + §1.11 + tidligere mathias-afgoerelser låser allerede det meste. De reelle uklarheder var få (dato afgør sandheden, match-rolle to behov, klient-livscyklus, logo).

**Forslag til workflow-fix:**

A) **Skarpere pakke-skala-vurdering i step 0:** Før forretningsspoergsmaal-fasen starter, vurdér eksplicit:

- Hvor meget af pakke-scope er allerede låst i master-plan + mathias-afgoerelser?
- Hvor mange reelle åbne forretnings-spørgsmål er der (efter recon)?
- Hvis under 3-4 reelle åbne spørgsmål → MELLEM-pakke, skip fuld forretningsspoergsmaal-fase, gå direkte til krav-dok med integrerede afklarings-spørgsmål

B) **Stram scope-discipline i forretningsspoergsmaal-fasen:** Forfatter må KUN stille spørgsmål om:

- Aktuel pakkes scope (trin 10 = klient-skabelon)
- Ikke senere trin (sales, lønarter, mekanik der hører i lag E)
- Ikke detaljer der er kode-niveau (datamodel, mekanik, integration)
  Hver spørgsmål skal kunne svares med ét forretnings-faktum der direkte påvirker AKTUEL pakke's leverance.

C) **Recon-først-disciplinen skal være præcisere:** I stedet for at samle 7 "uklarheder" hvoraf 3-4 reelt er låst, må forfatter eksplicit teste hver påstand mod kilden FØR den formuleres som spørgsmål:

- "Står svaret eksplicit i kilden? → ikke spørgsmål"
- "Er det kode-niveau? → ikke forretnings-spørgsmål"
- "Er det andet trins scope? → ikke trin-10-spørgsmål"

D) **Mathias-afgoerelser-entry timing:** Hvis krav-dok-review fanger at flere chat-citater skal låses som entry, kan det gøres som DEL af krav-dok-runde, ikke som separat runde. Forfatter laver entry-udkast + krav-dok i samme leverance; Mathias committer entry'en + godkender krav-dok i én operation.

**Bredere pointe:** Disciplin-fundamentet skal beskytte mod fabrikation og glid, men det må ikke skabe proces-overhead på pakker hvor rammen allerede er stram. Stor-pakke-flow på mellem-pakke = spildt tid.

---

## Fund 28 — Overvågnings-filer refererer ikke-repo-filer ("1.0-bibel")

**Hvad sker:** `claude-ai-overvaagning.md` instruerer Claude.ai til at læse "evt. relateret 1.0-bibel-sektion" som del af forretnings-dokumenter (linje ~41 + 138, både forfatter-rolle og krav-dok-reviewer-rolle). Men der findes ingen "bibel"-fil i repo'et. Under trin 10-review fandt Claude.ai en fil ved navn `stork-2-0.md` i sit Project (extern, uploaded af Mathias) der reelt er 1.0-bibel — naming-kollision med repo'ets `stork-2-0-master-plan.md`.

**Forslag:**

1. Overvågnings-filer må ikke instruere læsning af ikke-repo-bundne filer. Hvis 1.0-bibel skal være en kilde, må den importeres til repo (fx `docs/strategi/stork-1-0-baggrund.md`).
2. Hvis 1.0-bibel forbliver i Project-files, skal claude-ai-overvaagning fjerne reference — eller eksplicit markere den som "Project-ekstern, ikke obligatorisk".
3. Naming-kollision (`stork-2-0.md` = 1.0-bibel) er kritisk forvirring. Filen bør omdøbes til noget der entydigt siger "1.0".

---

## Fund 29 — Code's egen fabrikation under plan-skrivning (KRITISK META)

**Hvad sker:** Trin 10 plan V1 + V2 fabrikerede 5+ tekniske strukturer (permission-API, pending_changes-kolonner, dispatcher-omskrivning, apply-handler-tællinger) uden at verificere mod T9's faktiske kode. Codex runde 2 fandt NYE fund i V2 fordi V2-fixes blev bygget på fortsatte fabrikationer.

**Forslag:** Plan-pre-push-tjekliste i `code-overvaagning.md` mangler EKSPLICIT verifikation-step: "Hver T9/tidligere-trin-reference SKAL valideres ved at læse den faktiske migration-fil. Antagelser om API'er (RPC-signaturer, kolonne-navne, dispatcher-struktur) er KRITISK-fabrikation hvis ikke verificeret."

**Bredere pointe:** Det her er præcis Fund 16 (transitiv fabrikation) men for Code i stedet for Claude.ai. Plan-skrivning kræver verificering af afhængigheder mod faktisk kode, ikke mod min hukommelse om hvordan T9 ser ud.

---

## Fund 30 — Dokument-hierarki-misforståelse (FUNDAMENTAL)

**Hvad sker:** Hele "fire-dokument-disciplinen" (etableret 2026-05-16) behandler vision + master-plan + mathias-afgoerelser + krav-dok som **låste autoritative kontrakter**. Disciplin-fundamentet kræver kilde-binding til alle fire og blokerer ved "modsigelse mod rammen".

**Mathias' realitet (2026-05-20):**

- Kun `vision-og-principper.md` er låst-autoritativt
- `master-plan` styrer **retning**, kan rettes løbende (Appendix C-mekanisme allerede etableret)
- `mathias-afgoerelser` kan være **forældet** på nogle punkter — punktvise beslutninger, ikke uforanderlige sandheder

**Hvad det betyder for workflow:**

Den nuværende disciplin (arbejds-disciplin.md "Modsigelses-disciplin"):

> "Hvis Code finder modsigelse — internt i krav-dokumentet, eller mellem krav-dokumentet og fire-dokument-rammen: STOP. Commit blokker-fil. Argumentér ikke videre — Mathias afgør."

Det er **for hård** når kun ÉT af de fire dokumenter er låst. Modsigelse mod master-plan eller mathias-afgørelser kan være:

- (a) Krav-dok er forkert — krav-dok skal rettes
- (b) Master-plan/mathias-afgørelser er forældet — rammen skal opdateres
- (c) Begge — afgøres af Mathias

Den nuværende disciplin tvinger (a). Den korrekte disciplin lader Mathias afgøre.

**Konsekvenser for nylige fund:**

- **Fund 1 (Claude.ai-reviewer's "Hver brand er egen klient"-kilde-fejl):** Vi behandlede det som "krav-dok refererer forkert kilde". Faktisk: brand-afgørelsen er bare ikke i mathias-afgoerelser endnu (kun i 1.0-bibel/Project). Hvis vi vil låse den som ramme, skal mathias-afgoerelser opdateres. Hvis ikke, er det ikke "kilde-fejl" — det er bare uskreven afgørelse.

- **Mathias' frustration "trin 10 er relativt simpelt, vi har en masterplan":** Master-plan §1.8 dækker det meste af klient-skabelonen. Krav-dok skulle have været kort kondensering, ikke fuld validering mod 4 dokumenter.

**Forslag — Rettelse H (TILFØJES OPRYDNINGS-PAKKEN):**

Differentier dokument-status i disciplin:

| Dokument                   | Status           | Modsigelses-håndtering                                                                                                                 |
| -------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `vision-og-principper.md`  | LÅST-AUTORITATIV | KRITISK — modsiges aldrig. Code/Claude.ai STOPPER ved modsigelse.                                                                      |
| `stork-2-0-master-plan.md` | RETNINGSGIVENDE  | Modsigelse = TRIGGER for master-plan-rettelse (Appendix C). Ikke automatisk blokering. Mathias afgør om plan eller master-plan rettes. |
| `mathias-afgoerelser.md`   | RETNINGSGIVENDE  | Modsigelse = TRIGGER for ny entry eller opdatering af tidligere entry. Ikke automatisk blokering. Mathias afgør.                       |
| `<pakke>-krav-og-data.md`  | PAKKE-KONTRAKT   | Inden pakke-build: krav-dok er kontrakt. Modsigelse mod krav-dok = KRITISK (kræver krav-dok-rettelse før plan kan committes).          |

**Konkret ændringer i overvaagning-filer:**

1. `arbejds-disciplin.md` "Fire autoritative forretnings-dokumenter": omdøbes til "Fire forretnings-dokumenter (én låst, tre retningsgivende)" + status-differentiering
2. "Modsigelses-disciplin"-sektion: opdateres så modsigelse mod retningsgivende dokumenter ikke automatisk blokerer
3. `claude-ai-overvaagning.md` review-fokus: differentier "vision-modsigelse" (KRITISK) fra "master-plan/mathias-afgørelser-uoverensstemmelse" (rapport til Mathias, lader ham afgøre)
4. Plan-fase Fire-dokument-konsultation-tabel: "Konflikt med plan? ja/nej" får ny kolonne "Type" (vision = blocker; andre = trigger-for-opdatering)
5. `code-overvaagning.md` modsigelses-håndtering: ny vej for "krav-dok-uklarhed" (mod master-plan eller mathias-afgørelser) = rapport til Mathias, ikke blokker-fil
