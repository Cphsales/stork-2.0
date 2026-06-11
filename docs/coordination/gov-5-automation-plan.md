# gov-5-automation — Plan V21

**Branch:** claude/gov-5-automation-build (plan-iteration V8+ sker på build-branchen — V14-stale-fix, runde 22)
**Krav-dok:** docs/coordination/gov-5-automation-krav-og-data.md (fornyet runde 1, Mathias-valideret 2026-06-10)
**Pakke-status:** docs/coordination/gov-5-automation-status.md
**Recon-grundlag:** docs/coordination/gov-5-automation-recon.md (PR #122)
**Plan-version:** V21 · konvergens-counter: 21 (V21 under RAMME-TILLADELSEN — mekanisk klasse. Verdikter altid på frossen version)

## Kode-fund-håndtering (fra Codex V20/runde 29)

- **KRITISK (krav-dok-udkast forsvinder fra bærer-listen efter commit): ACCEPT — mekanisk.** P7(f)-diffen rettet: `<aktivPakke>-krav-og-data.md` er leverance-bærer i BEGGE tilstande (untracked OG committed-indtil-behandlet) m. type-inferens fra filnavnet — decide()'s normale to-cyklus-flow (untracked → TRANSPORT-COMMIT; committed+ubehandlet → DISPATCH mathias/hash-post) bærer dermed leddet. Selftest-case: untracked krav-dok → transport-commit → næste cyklus DISPATCH mathias/hash-post → behandlet.
- **KRITISK (eventSpor ikke brugt i lås/betingelser): ACCEPT — mekanisk.** P7(e)-diffen rettet: `eventSpor = ev.pakke ?? spor` udledes FØR betingelses-/lås-tjek og bruges KONSEKVENT (lås-opslag, betingelser, dispatch-kontekst) — dublet-dispatch ved åbning (markør=ingen, lås på qwers-båret navn) er dermed udelukket. Selftest-case: markør=ingen + qwers-event + eksisterende lås på pakkenavnet → VENT, ingen ny dispatch.

## Kode-fund-håndtering (fra Codex V19/runde 28)

- **KRITISK (spor=ingen ved åbning — event-pakken føres ikke videre): ACCEPT — mekanisk.** P7(e)-diffen udvidet: event-dispatch-konteksten bruger `spor: ev.pakke ?? spor` — det qwers-bårne pakkenavn VINDER over markørens "ingen" ved åbning og føres til adapters (KAEDE_SPOR), pr.-pakke-issue-oprettelsen (mathias-adapter) og status-fil-ankeret; alle senere `<aktivPakke>`-opslag ankres dermed fra første dispatch. Selftest-case: qwers m. pakke=ingen → recon-dispatches m. kontekst.spor == det qwers-bårne navn.
- **KRITISK (hash-post som prosa, ikke regelbogsvej): ACCEPT — mekanisk.** P7(a)-diffen ekspliciteret: `"krav-dok-udkast": { "afsender": "dialog", "modtager": "mathias", "opgave": "hash-post" }` (decide()'s normale type-routing bærer leddet — ingen særvej) + selftest-case: committet krav-dok-udkast → DISPATCH mathias/hash-post.

## Kode-fund-håndtering (fra Codex V18/runde 27)

- **KRITISK (krav-dok-udkast mangler transportvej i læseren): ACCEPT — mekanisk.** P7(f)-diffen udvidet: leverance-bærer-listen får untracked `docs/coordination/<pakke>-krav-og-data.md` (kun untracked — committet krav-dok er kontrakt, ikke leverance-i-transit) med TYPE-INFERENS fra filnavns-mønstret (`*-krav-og-data.md` → `krav-dok-udkast`; dialogen skriver ingen →NÆSTE-deklaration — det er præcis pointen) · efter transport-commit: dispatch mathias-adapter m. opgave `hash-post` (poster "krav-dok klar @ <indholds-hash>" på pakke-issuet) — dermed kører end-to-end-leddet "dialog-fil → transport-commit → hash-post → krav OK <hash> → hash-match-betinget merge" mekanisk hele vejen.

## Kode-fund-håndtering (fra Codex V17/runde 26)

- **M-E-B (leverance_typer-blokken ikke citeret 1:1): ACCEPT — mekanisk.** P7(a) udvidet med den ordrette `leverance_typer`-blok (kaede-regler.json:18–30, maskinelt udtrukket).
- **MELLEM (status-stale igen — præcis selvtjek-klassen): ACCEPT — synket.** 'Næste forventet'-linjen opdateres nu maskinelt sammen med de øvrige i HVER status-skrivning (alle tre linjer i samme operation).

## Kode-fund-håndtering (fra Codex V16/runde 25)

- **KRITISK (review-approval-routing ikke ført til TILLÆG 3-modellen): ACCEPT — mekanisk.** P7(a)-diffen udvidet: `leverance_typer["review-approval"]` ændres fra `{code, build-start}` til `{claude-ai-rolle, krav-troskabs-tjek}`; `troskabs-verdikt`-typen routes pr. markers: PASS → `{code, build-start}` (m. build-betingelserne) · FEEDBACK → `{code, naeste-version}`. PASS produceres dermed FØR build-betingelsen kræver den.
- **KRITISK (SELVTJEK-FEJL mangler afsender-kilde): ACCEPT — mekanisk.** P7(a)-diffen udvidet: `afsender`-felt pr. leverance-type (deklarativt — allerede semantikken i Vækningsmodel-tabellen); SELVTJEK-FEJL routes til typens afsender. Særtilfælde: `krav-dok-udkast` har afsender `dialog` → fejl routes som MATHIAS-NOTIFIKATION (dialogens output genkøres ikke af en aktør — rettes i dialogen). laesTilstand behøver intet nyt felt: typen afgør afsenderen via regelbogen.

## Kode-fund-håndtering (fra Codex V15/runde 24)

- **KRITISK (selvtjek ikke ført ind i P7(e)'s regel 3-diff): ACCEPT — mekanisk.** P7(e)-diffen udvidet: regel 3 (transport-commit-vejen) evaluerer typens selvtjek-liste FØR frys — PASS → TRANSPORT-COMMIT · FEJL → `{ handling: "SELVTJEK-FEJL", fil, tjek }` + dispatch af AFSENDER-aktøren m. fejl-kontekst (ny kørsel); ingen frys, ingen videre routing. Rækkefølge bevaret: halvskrevet-værnet (kørsel på spor → VENT) evalueres FØR selvtjek (en fil under skrivning selvtjekkes ikke).
- **MELLEM (status 'Næste forventet' stale igen): ACCEPT — synket.** Klassen er nu selv et argument for selvtjekkets `tal-mod-virkelighed` (status-filen bliver selvtjek-omfattet leverance-type).

## Kode-fund-håndtering (fra Codex V14/runde 23)

- **KRITISK (hvem skaber dialog-krav-dok-filen?): ACCEPT — mekanisk eksplicitering af dagens praktiserede mønster (V2-mønstret, brugt to gange i gov-5 selv).** Krav-dok-filen skrives af Claude.ai I DIALOGEN — Windows-appen har Filesystem-MCP og skriver untracked til docs/coordination (sådan blev gov-5's eget krav-dok + fornyelser til). Det er IKKE en kæde-vækning: filen er dialogens output; ingen routing-regel, ingen dispatch. Kuréren observerer den untracked fil og transport-committer ORDRET (eksisterende regel 3-mekanik) → poster "krav-dok klar @ hash" → Mathias: "krav OK hash". Hegnet PRÆCISERES (ingen svækkelse): "ingen aktør VÆKKES/dispatches til at skrive krav-dok — filen er den manuelle dialogs output". Ny leverance-type `krav-dok-udkast` (untracked krav-og-data-fil): → transport-commit + mathias-adapter (hash-post); ingen modtager-dispatch. Mathias kopierer intet; Code skriver intet; headless-rollen vækkes ikke — alle tre brud-scenarier er udelukket.
- **KRITISK (Claude.ai-adapterens rollelinje taber to leverancer): ACCEPT — mekanisk synk.** Ansvarstabel + designtekst synket til de FIRE leverancer (slut-rapport-review · fund-gate-pakker · recon-oplaeg · krav-troskabs-tjek), 1:1 med step 7.

## Mathias-forslag indarbejdet (2026-06-11): mekanisk selv-validering før frys

**[FORSLAG, design Codes]: ACCEPT — mekanismen i gov-5, indholdet vokser i partnerskabs-runden.** Ny tilstands-betingelse FØR transport-commit (design pkt. 12): kuréren kører leverance-typens deklarative `selvtjek`-liste (kaede-regler.json) — fejl = INGEN frys, INGEN Codex-dispatch; leverancen forbliver untracked og SELVTJEK-FEJL routes til afsender-aktøren (ny kørsel). Begrundelse (Mathias): runde 18-fundene var begge mekanisk selvfangbare og kostede fulde xhigh-runder. **Design-snit (Codes):** gov-5 leverer MEKANISMEN + minimal tjekliste for de tre målte fund-klasser: `ordret-diff` (citerede "body 1:1"-blokke diffes mod kildefil — runde 18a-klassen) · `tal-mod-virkelighed` (citerede SHA'er/linjenumre/counters greppes mod faktisk state — runde 18b/22-klassen) · `konsistens-grep` (interne selvmodsigelser, fx "afventer" efter indarbejdelse). Tjeklisterne pr. type udvides i partnerskabs-runden. **HEGN (Mathias):** erstatter ALDRIG Codex-gaten (selvtjek er præ-filter, mekanisk — ingen dømmekraft); effekten VEJES PÅ FUND OVER TID — slut-rapporten + gov-6 bogfører sparede vs. kostede runder (anti-bureaukrati: fjernes hvis det ikke bærer).

## Kode-fund-håndtering (fra Codex V13/runde 22)

- **M-E-B (laesTilstand-body ikke citeret 1:1 for V13-berørt region): ACCEPT — mekanisk.** P7(f) tilføjet: hele `laesTilstand` maskinelt udtrukket 1:1 + diff + BEVARES.
- **MELLEM (pakke-status stale: 'Næste forventet' pegede to runder bagud; plan-header-branch forkert): ACCEPT — mekanisk.** Status-sed ramte ikke linjen — begge synket; branch-linjen rettet til build-branchen (plan-iteration V8+ sker dér).

## Kode-fund-håndtering (fra Codex V12/runde 21)

- **KRITISK (qwers-åbning ikke reelt end-to-end-startpunkt): ACCEPT — mekanisk klasse.** Åbningen sker netop når `aktiv-pakke: ingen`, men tre guards spærrede: kaede_issue=null (gateOrd læses ikke), laesTilstand afleder kun events m. aktiv pakke, afledEvents tidlig-returnerer ved "ingen" — og selftesten fastfrøs fejlen ("ingen aktiv pakke → ingen events"). V13 fører det EKSISTERENDE to-flade-design (stående dirigent-issue + pr.-pakke kæde-issue, design pkt. 6) eksplicit igennem: se "Stående åbningsflade" + P7(a)/(b)/(c)-diffs udvidet.

## Kode-fund-håndtering (fra Codex V11/runde 20)

- **M-E-B (decide()-ændringen mangler patch-først): ACCEPT — mekanisk klasse.** Regelbogs-håndhævelsen (betingelser → BLOKERET) ændrer `decide()` i eksisterende `dirigent.mjs` — P7(e) tilføjet m. nuværende body 1:1 (maskinelt udtrukket, linje 37–200), eksplicit diff og BEVARES-liste.

## Kode-fund-håndtering (fra Codex V10/runde 19)

- **KRITISK (P3-snittet ikke ført gennem beslutningssti-helperen): ACCEPT — mekanisk klasse (ramme-tilladelsen).** Mathias' rest-klik-afgørelse (krav-og-data + arkiv un-ownet) manglede i `erBogfoeringsSti` (BOGFOERING_RES), selftest-sektion 19 og 11b — rene krav-dok-/arkiv-PR'er ville fortsat udløse review-request. V11: P7(d) tilføjet m. ordret body + diff (7 → 9 mønstre); selftest-cases vendes per afgørelsen; 11b udvidet m. krav-og-data- og arkiv-cases.

## Kode-fund-håndtering (fra Codex V8/runde 17)

- **M-E-B (B1-kædekoden mangler patch-først): ACCEPT.** B1-koden ER eksisterende kode nu — ny P7: patch-først for `scripts/kaede/` (nuværende bodies 1:1 + diff + BEVARES-liste). Codex' B1-verdikt indarbejdet i hypotese-tabellen.
- **KRITISK (recon-oplaeg-routing internt modstridende): ACCEPT.** Tabel-rækken rettet: recon-oplaeg dispatches EFTER begge kode-recon-docs (tilstands-betingelse, design pkt. 11) — ikke "parallel ved qwers".

## Rest-klik-afgørelser (Mathias, 2026-06-11 — Formåls-fejningens to ⚠-rækker LUKKET)

1. **Arkiv un-ownes:** `/docs/coordination/arkiv/` ind i P3's ejer-løse flade — bogføring efter slut OK.
2. **Krav-dok-merge un-ownes PÅ BETINGELSE af versions-binding:** Mathias' "krav OK" bindes til konkret indholds-version (samme mekanik som PASS→plan-SHA). Mekanik (leverbar, regelbogs-håndhævet): når dialog-krav-dokket transport-committes, poster kæden på kæde-issuet: _"krav-dok klar @ \<indholds-hash\> — validér med 'krav OK \<hash\>'"_; Mathias svarer "krav OK \<hash\>" (mobil, ét paste); merge-dispatch har som TILSTANDS-BETINGELSE at author-verificeret krav OK-hash == filens aktuelle indholds-hash. Ændres filen efter hans ord → mismatch → BLOKERET + re-validering. Kæden merger beviseligt præcis det han validerede. (Kan bindingen mod forventning ikke leveres i build: hans klik består — STOP-gate, ikke selvbeslutning.)

## Plan-afvigelses-håndtering (Mathias-fund under build → V8)

**[KRITISK — anden krav-dok-afvigelse i samme pakke]: ACCEPT, rod + instans.** Krav 1 siger "FRA ÅBNING til lukning kører alt selv". V7's kæde startede ved krav-dok-merge — strækningen qwers → krav OK (recon-fasen) lå udenfor, så Mathias selv skulle dirigere recon med manuelle bokse. Samme glid-klasse som V4: planen holdt mod DAGENS flow (recon er manuel i dag) i stedet for formålet.

- **Instansen:** kæden starter nu ved qwers — recon er leverance-typer med routing (se Vækningsmodel + kæde-spor). Forretnings-grunden (Mathias): recon på nuværende kodes forretningsside FØR krav-dok — rettigheder, PII, lifecycle som de reelt fungerer i koden — er præcis den info krav-dokket skal stå på, særligt frem mod UI-bygning. Workflowet er rammen for HELE Stork 2.0-bygningen.
- **Roden:** "tavlen viskes ren ved HVERT kæde-led" — ny sektion "Formåls-fejning af alle kæde-led" gennemgår hvert led mod formålet og afdækker to rest-klik af samme klasse (krav-dok-merge + pakke-luk-arkiv) med [FORSLAG] til Mathias' re-godkendelse.
- **Hegn der består:** krav-dok-DIALOGEN forbliver Mathias↔Claude.ai og automatiseres ALDRIG (kontrolposten, formålets egen undtagelse). Anti-tunnelsyn 3 uændret: ingen aktør vækkes til at SKRIVE krav-dok — recon INFORMERER dialogen, fodrer den ikke. Verdikter altid på frossen version.
- **Afgrænsning:** H028/partnerskabs-runden bærer IKKE recon-transporten — H028 er kun det mekaniske G/H-opslag; runden formaliserer §9-tekst. Transporten er DENNE pakkes leverance (G/H-opslags-tabellen justeret).

**TILLÆG 1 (claude-ai-rolle-instruksen skal bære dagens gate-læringer): ACCEPT.** Step 7's instruks-indholdskrav udvidet — se Implementations-rækkefølge step 7.

**TILLÆG 2 (sikkert/frosset-snittet er hypotese): ACCEPT.** Ny sektion "B1-bevarings-verifikation (hypotese)" — Codex' V8-review skal eksplicit verificere hver påstået væknings-agnostisk B1-del under qwers-starten, FØR den bevares. (Nummerering: Mathias' "runde 8" = næste plan-runde semantisk; mekanisk navngives den runde 17 — den globale review-sekvens fortsætter, build-batch-runderne brugte 8–16.)

**TILLÆG 3 [KRITISK] (fangst-laget røg ud med qwerg): ACCEPT.** Krav 6 kræver rollernes validering uændret og altid fuld — kun HVORNÅR Mathias' klik kræves ændres. Da qwerg udgik, udgik Claude.ai's plan-mod-krav-dok-validering med — det lag fangede BEGGE pakkens afvigelser (V4: klik bevaret; V7: recon udenfor), som Codex approvede forbi begge gange (krav-troskab er forretnings-bord, ikke kode-bord). V8 genindsætter laget AUTOMATISERET som obligatorisk plan-led: **Codex APPROVAL → Claude.ai-rollen krav-troskabs-tjek (sætning for sætning per TILLÆG 1-instruksen) → PASS → build-start / FEEDBACK → Code-V\<n+1\>.** Nul Mathias-klik: krav 1 består, fangst-laget består. Ny leverance-type `troskabs-verdikt` (se Vækningsmodel); kæde-spor led 4 justeret; §9.1-rettelsen i P1 udvides (rollen er nu plan-led — V2-beslutningen fra maj om at fjerne Claude.ai fra plan-fasen omgøres ÆRLIGT i disciplin-diffen).

**TILLÆG 3-SKÆRPELSE (Mathias: leddet HÅNDHÆVES mekanisk, ikke som tekst-pligt): ACCEPT — ophøjet til generelt V8-princip.** `kaede-regler.json` får et `betingelser`-felt pr. dispatch-regel: build-dispatch har Claude.ai-PASS-leverancen som TILSTANDS-BETINGELSE — mangler filen, KAN kuréren ikke dispatche build (decide() returnerer BLOKERET m. manglende betingelse, ikke en advarsel). Generelt princip (design pkt. 11): hver regel i kæden der KAN håndhæves som tilstands-betingelse i regelbogen, SKAL — regler i tekst er det svageste lag; dagens tre fund slap alle gennem tekst-håndhævede pligter. Betingelses-fejning af alle kæde-regler: se "Regelbogs-håndhævelse". Bonus: den manuelle diff-tom-verifikation fra V7-qwerg MEKANISERES — build-betingelsen kræver at APPROVAL + PASS er bundet til SAMME frosne plan-SHA som artefaktets aktuelle; afviger den, blokeres build og ny review-runde routes.

**TILLÆG 5 (pligternes INDHOLD rettes FØR mekanisering — ellers automatiseres hullerne): ACCEPT.** Pligterne kørte manuelt i dag og fangede alligevel ikke. To defekter: **(a)** Codex' plan-pligt siger "krav-dok-konsistens" = modsigelses-tjek — V4/V7 modsagde intet, de UNDLOD. Pligten omformuleres til FULDSTÆNDIGHED: _"hver krav-sætning realiseret eller eksplicit begrundet afgrænset"_ — rettes i P1 (§9.3-review-fokus i disciplin) OG i P4 (plan-prompten i codex-review.sh, så den dispatchede Codex får pligten i hånden). **(b)** Claude.ai-pligten havde indhold uden METODE — metoden (sætning for sætning) skrives ind i instruksen, jf. TILLÆG 1. **Rækkefølge-princip (ophøjet til build-orden):** indhold rettes → DEREFTER håndhæves mekanisk (TILLÆG 3) — P4-prompt- og instruks-rettelserne sekvenseres FØR betingelses-mekanikken aktiveres i regelbogen; en mekanisk håndhævet pligt med hul i indholdet er hullet på maskinkraft.

**TILLÆG 4 (gov-6-mål + recon-form fra formålet): ACCEPT.** (1) gov-6-målekriterierne udvidet til den nye strækning — se End-to-end-test-design. (2) Recon-designet er argumenteret fra formålet, ikke fra dagens manuelle recon — se "Recon-formen (krav 9)" i Vækningsmodel: sekvensen Code+Codex parallelt → Claude.ai-rollen (med begge kode-recon-docs som input) er valgt fordi oplægget informerer dialogen bedst når det kan PEGE PÅ divergenser mellem kodens virkelighed og forretningsforståelsen — uafhængighed først (anti-tunnelsyn), syntese-blik sidst, dialog til sidst (kontrolposten).

## Kode-fund-håndtering (fra Codex V6)

- **MANGLENDE-EKSISTERENDE-BEVARELSE (P3-inversion taber /supabase/-rest + 4 værn-scripts): ACCEPT — strukturelt fix, ikke lap.** Fund-klassen ("glemt sti i positiv enumeration") ramte to gange (V5: teknisk-docs; V6: supabase-rest + scripts) — positiv enumeration af Mathias' flader er ikke sikkert vedligeholdbar. V7 vender til **default-own**: `* @mgrubak` BESTÅR; kun bogførings-fladen enumereres ejer-løst (7 mønstre, Mathias-accepteret ordret 2026-06-11). Alle V6-fundets flader dækkes af defaulten; klassen er elimineret strukturelt. 11b udvidet med værn-fil-case som krævet. P3-diffen er nu RENT ADDITIV mod eksisterende fil (M-E-B-venlig pr. konstruktion: intet eksisterende fjernes).

## Kode-fund-håndtering (fra Codex V5)

- **KRITISK (13a-dump manglede): LUKKET VED HANDLING.** Mathias-mandat givet 2026-06-11; admin READ udført (switch-back til bot straks efter, verificeret). Rå dump + eksakt diff står nu i step 13a-sektionen nedenfor.
- **MANGLENDE-EKSISTERENDE-BEVARELSE (4 governance-owned teknisk-docs uden gate i P3): ACCEPT.** `/docs/teknisk/` tilføjet P3-snittet (dækker teknisk-gaeld, huskeliste, permission-matrix, cutover-checklist — alle governance-owns). Konservativt: hele mappen, ved tvivl er det hans.
- **MELLEM (prefix-state stale): ACCEPT.** Krav-dok-prefixet ER fornyet (verificeret på disk + i historik); Formål-blokken nedenfor er synket 1:1, format-punktet fjernet fra åbne punkter. Proces-note: fornyelsen røg med i V5-commit'en via bredt `git add` uden egen ordret-deklaration — rapporteret til Mathias som levende argument for transport-commit-designet (ordret + deklareret).

## Fund-håndtering (fra Claude.ai-gate-FEEDBACK på V4, leveret via Mathias)

- **KRITISK 1 (formåls-afvigelse — Mathias' flade): ACCEPT.** V4 holdt planen mod nuværende flow; formålet + krav 2 definerer fladen udtømmende, og krav 6 siger ordret at det er _hvornår Mathias' klik kræves_ der ændres. V5 leverer formålets flade: qwerg og build-PR-approve UDGÅR som ubetingede Mathias-led; plan og byg valideres af rollerne; Mathias kaldes ved fund der er hans + ved ændringer af hans beslutnings-flader (se Mathias-flade-modellen). P1 omfatter nu disciplinens gate-model (krav 6-leverancen). Ingen krav-doc-feedback rejses — Code ser ingen teknisk grund mod formålet; selv-modifikations-risikoen (kæden ændrer egne værn) håndteres ved at værn-stierne ER en afgørelse der er hans (beslutnings-CODEOWNERS).
- **KRITISK 2 (krav 5 ikke fuldt realiseret): ACCEPT.** Vækningsmodellen omdesignet: §5-mekanismerne (SPARRING-OENSKE, FLAG→LØS-replikker, KODE-FUND-deling, OPTIMERING-FORSLAG) får filbårne formater med routing — aktør-til-aktør spørgsmål/svar MID-FASE, fund deles når de findes (ikke ved runde-grænser), ping/pong i ventevinduer. Se Vækningsmodel.
- **KRITISK 3 (kun dirigenten vækker, kun ved fase-skift): ACCEPT.** Vækningsretten flyttet til aktørerne: hver leverance bærer en `→NÆSTE:`-deklaration (eller routes af sin type); dirigenten er kurér, ikke vækker — den har ingen egen dagsorden, kun aktørernes deklarationer + kalender-poll. Se Vækningsmodel.
- **MELLEM 1 (intro "én kørsel ad gangen" vs. parallel-dispatch): ACCEPT.** Rettet: dirigenten kører flere samtidige aktør-kørsler — lås pr. aktør pr. spor (én Codex-kørsel ad gangen pr. spor; Code og Codex samtidig er normal-tilstand), ikke global lås.
- **MELLEM 2 (krav 9-begrundelse tynd på systemd + headless): ACCEPT.** Begrundelser mod alternativer tilføjet + verificér-før-tillid-markører. Se Design-valg-begrundelser.

## Kode-fund-håndtering (fra Codex V1–V3 — alle lukket, Codex APPROVAL på V4)

- **V1-KRITISK 1 (CODEOWNERS-mekanik ubevist):** ACCEPT → mekanik-citat + bevis-step 11b (test-PR, gov-4 #111-mønster). Består i V5 (snittet er inverteret, beviset samme mønster — nu to test-cases: ejet sti kræver klik, u-ejet merger på grøn CI).
- **V1-KRITISK 2 + V2-KRITISK 2 (protection-state):** ACCEPT → 13a-dump (MATHIAS-MANDAT, uændret afventende); bevarelsesliste er forventninger, dump er sandhed.
- **V1-MELLEM (Forudsætninger stale):** ACCEPT → P5.
- **V2-KRITISK 1 + V3-KRITISK 1 (commit-ansvar):** ACCEPT → transport-commit (design pkt. 10), fejet konsistent.
- **V2-KRITISK 3 (systemd Linger=no):** ACCEPT → step 10-preflight; nu også begrundet mod alternativer (MELLEM 2).

## Mathias-vagter indarbejdet (2026-06-10, efter V1)

1. **Split (§3.8):** egen analyse — afgjort af leverance-kæden. Re-vurderet i V5 (se Split-analyse).
2. **Dokument-opdatering er leverance:** hver tekst pakken forælder rettes i pakken — nu inkl. disciplinens gate-model (P1 udvidet).
3. **Rolle-linjer + anti-tunnelsyn:** ansvars-tabel + divergens-STOP + ingen kæde-vej ind i krav-dok.

## Formål

> Denne pakke leverer: workflowet kørende automatisk fra start til slut — Mathias åbner, og Mathias lukker. Undervejs har han én fast kontrolpost — krav-dokket, forretningen, som kun han kan validere. Plan og byg valideres af rollerne; Mathias kaldes kun ind når der findes en afgørelse der er hans. Det vi bygger er grundstenen under alle fremtidige Stork 2.0-pakker, og målet er klart: sammen kan vi opnå greatness.

(1:1 fra krav-dok §Formål — prefix-fornyet version, synket i V6.)

## Mathias-flade-modellen (formåls-tro — KRITISK 1-leverancen)

**Ubetingede Mathias-led (udtømmende, fra formål + krav 2):**

| Led                 | Flade                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Åbning              | qwers-udmelding (chat eller kæde-issue fra mobil)                                                                                 |
| Krav-dok-validering | krav OK i dialogen + "krav OK \<indholds-hash\>" på kæde-issuet (V9: versions-bindingen — kæden merger beviseligt det validerede) |
| Lukning             | slut OK efter Claude.ai-rolle-review af slut-rapport                                                                              |

**Betingede Mathias-led (kun når afgørelsen er hans):**

| Trigger                                                           | Mekanik                                                                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| NEEDS-MATHIAS / ESCALATE / iter>3 / halt-markers (§5, §6.1, §6.3) | Fund-gate: gate-fil + kæde-issue-anmodning m. @mgrubak → mobil; kæden pauser sporet                           |
| Plan-afvigelse / formåls-tvivl / krav-doc-feedback                | Samme fund-gate-mekanik                                                                                       |
| PR der rører hans beslutnings-stier (værn, governance, identitet) | Code-owner-review-krav → GitHub Mobile push → hans klik. Det ER afgørelsen — værn-ændringer er hans pr. natur |
| Konvergens-counter 4/5/6 (§3.4)                                   | Alert/pause/STOP til hans flade                                                                               |

**UDGÅR som ubetingede led:** qwerg (Mathias' læsning var transport af tillid han ikke teknisk kan validere — formålet flytter den til fund-gates) · build-PR-approve (byg valideres af rollerne: Codex per-batch + final + grøn CI; merge på rolle-validering, medmindre beslutnings-stier røres eller fund er åbne). **V8-rettelse (TILLÆG 3):** plan-godkendelse er IKKE længere Codex alene — fuld rolle-validering er Codex-APPROVAL (kode-bord) + Claude.ai-rollens krav-troskabs-PASS (forretnings-bord). Fangst-laget der fangede V4- og V7-afvigelserne består — automatiseret, nul Mathias-klik.

**Suverænitet uændret:** Mathias kan altid gribe ind, stoppe, omgøre — fladen ovenfor er hvad kæden KRÆVER af ham, ikke hvad den tillader ham.

**Overgangs-klarhed:** gov-5 selv bygges under NUVÆRENDE disciplin (qwerg + approvals gælder for denne plan). Den nye flade aktiveres ved pakkens leverance (P1-disciplin-rettelse + B4-protection/CODEOWNERS) og bevises i gov-6 (krav 8). Mathias' qwerg på DENNE plan er samtidig hans ratificering af den nye gate-model og beslutnings-sti-snittet.

## Vækningsmodel (KRITISK 2+3-leverancen — krav 1 + 5)

**Vækningsretten ligger hos aktørerne.** Hver aktør-leverance er en fil med en afsluttende deklaration `→NÆSTE: <aktør> [<leverance-type>]` (eller falder tilbage til sin types default-routing i kaede-regler.json). Dirigenten er **kurér**: den transport-committer leverancen ordret, læser deklarationen/typen og dispatcher modtageren med pointer. Den vækker aldrig af egen dagsorden — kun aktør-deklarationer + kalender-poll (opsamling af eksterne events: merges, checks, Mathias-gate-ord).

**Leverance-typer med routing (alle §5-mekanismer bæres — mid-fase, ikke kun fase-skift):**

| Type                                                                                                         | Afsender → modtager                             | Hvornår                                                                   |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------- |
| plan-V\<n\> / build-batch / slut-rapport                                                                     | Code → Codex                                    | fase-arbejde (uændret)                                                    |
| review/feedback/APPROVAL                                                                                     | Codex → Code                                    | reviews (uændret)                                                         |
| SPARRING-OENSKE → CONFIRM/TIMING/AVOID                                                                       | Code ⇄ Codex                                    | **mid-fase**, når spørgsmålet opstår                                      |
| FLAG→LØS-replik (ACCEPT/PUSHBACK/PROPOSE-ALTERNATIVE ⇄ AGREE/REFINE/ESCALATE)                                | Code ⇄ Codex                                    | **pr. fund løbende** — max 3 iter, så fund-gate (§5 uændret)              |
| KODE-FUND-deling (research)                                                                                  | Codex → Code                                    | **når fundet gøres** — ikke ved runde-grænse                              |
| OPTIMERING-FORSLAG → ADOPT/DEFER/DISMISS                                                                     | Codex ⇄ Code                                    | build, løbende                                                            |
| qwerg-gate-pakke → fund-gate-pakke (§9.1-rettelse i P1)                                                      | Claude.ai-rolle → Mathias                       | ved fund-gates + slut OK                                                  |
| **recon-kode-doc (V8)** — nuværende kodes forretningsside: rettigheder, PII, lifecycle som de reelt fungerer | Code → repo (transport-commit) → Mathias-flade  | **ved qwers** — kæde-start                                                |
| **recon-research-doc (V8)** — uafhængig kode-recon (blind-vinkler, teknisk realiserbarhed)                   | Codex → repo (transport-commit) → Mathias-flade | **ved qwers** — parallel m. Codes                                         |
| **recon-oplaeg (V8)** — forretningsdata-oplæg TIL MATHIAS (informerer dialogen, fodrer ikke krav-dok)        | Claude.ai-rolle → Mathias                       | **efter begge kode-recon-docs** (tilstands-betingelse — V9-konsistensfix) |
| gate-ord / GODKENDT / AFVIST / stop                                                                          | Mathias → kæden                                 | author-verificeret, enhver tid                                            |

| **krav-dok-udkast (V15)** — dialogens output (Claude.ai i Windows-appen, Filesystem-MCP — IKKE en vækning) | dialog → untracked fil → transport-commit + hash-post (mathias-adapter) | når dialogen lander kontrakten |
| **troskabs-verdikt (V8, TILLÆG 3)** — krav-troskabs-tjek af Codex-approvet plan: PASS/FEEDBACK | Claude.ai-rolle → kæden (PASS → Code build-start · FEEDBACK → Code V\<n+1\>) | **obligatorisk efter Codex-APPROVAL**, før build |

**Kæde-start (V8, Mathias-fund) — Recon-formen (krav 9, fra formålet):** qwers-eventet IGANGSÆTTER kæden. Sekvens: (1) Code + Codex dispatches PARALLELT — to uafhængige blikke på nuværende kode (Codes: forretningssiden — rettigheder, PII, lifecycle som de reelt fungerer; Codex': teknisk realiserbarhed + blind-vinkler). Uafhængigheden er begrundet i anti-tunnelsyn: divergens mellem de to synliggør blinde vinkler. (2) Når begge recon-docs er transport-committet → Claude.ai-rollen dispatches med forretningsdata + BEGGE docs som input → recon-oplaeg TIL MATHIAS, der kan pege på hvor kodens virkelighed og forretningsforståelsen divergerer (syntese-blik sidst — derfor sekventielt, ikke fordi recon "plejer" at køre sådan). (3) `recon-klar` → Mathias notificeres (mobil): krav-dok-DIALOGEN (Mathias↔Claude.ai, Windows-appen) begynder — kontrolposten, automatiseres ALDRIG. Kæden venter på krav OK/krav-dok-merge. Hegn (V15-præcisering): ingen aktør VÆKKES/dispatches til at skrive krav-dok — filen er den manuelle dialogs output (Claude.ai skriver den i Windows-appen via Filesystem-MCP, V2-mønstret); kuréren transport-committer den ordret som untracked leverance og poster indholds-hashen. Recon-leverancer er INPUT til dialogen, ikke til krav-dok-filen (anti-tunnelsyn 3).

**Stående åbningsflade (V13-eksplicitering af design pkt. 6, Codex runde 21):** TO issue-flader. (1) **Stående dirigent-issue** — ÉT issue, består på tværs af pakker; nummeret bor i `kaede-regler.json:kaede_issue` (sættes ved B3-leverancen; null = åbningsflade ikke etableret → kæden kan ikke åbne pakker, fail-closed, manuelt flow). Bærer qwers-åbnings-ord og læses ALTID — også (især) når `aktiv-pakke: ingen`. (2) **Pr.-pakke kæde-issue** — oprettes af mathias-adapteren ved åbning; nummeret bogføres i pakke-status-filen (linje `Kæde-issue: #N`, læses af tilstandslæseren); bærer pakkens gate-ord (krav OK-hash, qwerg-arv, slut OK, GODKENDT/AFVIST, stop) og notifikationer. Guards justeres tilsvarende: qwers-events afledes uanset pakke-tilstand; øvrige events kræver aktiv pakke (uændret).

**Ventevinduer (krav 5):** mens Codex reviewer V\<n\>, er Code IKKE i tomgang: dirigenten dispatcher Codes deklarerede vente-opgaver (fx svar på åbne SPARRING/LØS-tråde, forberedelse af næste batch) — kun opgaver AKTØREN selv har deklareret som næste; kuréren finder ikke på arbejde. Parallel-kørsel: lås pr. aktør pr. spor — Code og Codex kører samtidig som normal-tilstand; to samtidige Codex-kørsler på samme spor er forbudt (verdikt på frossen version: hver review-dispatch binder til plan-SHA, og ny V\<n\> invaliderer ikke en igangværende review — den køber næste runde).

## Design-valg-begrundelser (MELLEM 2 — krav 9: formålet mod alternativer)

- **systemd-user-unit** vs. alternativer: cron (ingen long-running proces, ingen restart-semantik — polling-kurér er en proces, ikke et job) · nohup/terminal-proces (dør med session, intet selvhelende Restart=on-failure — bryder "ingen venter på Mathias" når processen dør stille) · pm2 (ekstra dependency + endnu en daemon at drifte; systemd ER der allerede). systemd vinder på: deklarativ unit, journald-log (auditerbar transport), Restart=on-failure, ingen nye dependencies. **Verificér-før-tillid:** Linger=no-fundet (Codex V2) består — step 10-preflight beviser hosting før kæden får tillid; fallback krav 7.
- **`claude -p` headless** vs. alternativer: Agent SDK (mere kode for samme model-adgang; ny kodebase at vedligeholde) · rå API (mister tool-harness — fil-adgang, git, gh — som rollerne kræver) · stående interaktiv session (kan ikke dispatches deterministisk; tilstand lækker mellem kørsler). `claude -p` vinder på: genbruger eksisterende lokal auth + tool-adgang + rolle-instruks pr. kørsel, frisk kontekst pr. dispatch (anti-tunnelsyn 1). **Verificér-før-tillid:** step 9 dry-run beviser auth-kontekst + leverance-format før tillid.
- **Polling-kurér** (begrundet i V2, består): webhooks kræver offentlig tunnel ind på Mathias' maskine — afvist (angrebs-flade); 60s-latens irrelevant mod kørslers minutter.

## Split-analyse (§3.8 + vagt 1 — re-vurderet i V5)

**Kandidat-snit:** A) kæde-kerne (kurér + routing + adapters + tests + systemd) · B) Mathias-flade (kæde-issue + author-verifikation + notifikation) · C) gate-model-ændringen (disciplin P1 + CODEOWNERS-inversion + protection) · D) dokument-leverancen.

**Analyse:** A+B fortsat udelelig (kurér uden Mathias-flade kan ikke køre fund-gates). V5 GØR C tungere (gate-model-ændring i disciplin er nu del af C) — re-vurdering: C er stadig 3 steps + docs-diff, men dens natur er ændret: den er nu PRIMÆRT en disciplin-/CODEOWNERS-leverance hvis apply (B4/B5) ligger EFTER kæde-kernen er bevist i dry-run (step 9). Et C-split ville give: gov-5a leverer kæden under gamle gates (qwerg består) → gov-5b leverer gate-modellen → gov-6 beviser. Mod-argument (vægtigst): formålet er ÉN helhed — "Mathias kaldes kun ind ved fund" er ikke leveret før C er leveret; gov-6-beviset (krav 8) skal køre den FULDE flade. To pakker = to slut OK + dobbelt overgangs-tilstand i disciplinen (gamle gates i 5a-perioden, nye i 5b) = mere stale-risiko (vagt 2), ikke mindre. **Konklusion: fortsat ÉN pakke.** B4/B5-rækkefølgen giver allerede C-isolation (apply efter kerne-bevis). Revisit-trigger består: flagger Codex V5-review reviewability-problemer, splittes C ud.

## Verificerede DB-objekter (§3.2)

**Ingen DB-objekter berøres.** 0 migrations, 0 RPC'er, 0 policies, 0 grants — implementations-rækkefølgen indeholder ingen SQL-filer. (Supabase-MCP-dump bevidst udeladt — ingen objekter at dumpe for.)

## G/H-opslag (§3.2)

| G/H                          | Løses-i                    | Håndtering                                                                                                                                                                                                                                     |
| ---------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [H028] mekanisk G/H-opslag   | gov-5 / partnerskabs-runde | **V8-præcisering (Mathias):** H028 er KUN det mekaniske G/H-opslag (udskudt til partnerskabs-runden, som også formaliserer §9-tekst). Recon-TRANSPORTEN (qwers → recon-leverancer → dialog) er DENNE pakkes leverance — den bæres ikke af H028 |
| [G062] recurring types-drift | —                          | Bevidst udskudt — ikke kæde-transport                                                                                                                                                                                                          |
| [H029] tekst-staleness       | pakke efter gov-6          | Udskudt (Mathias-besluttet); gov-5 retter selv alt den forælder (Dokument-currency)                                                                                                                                                            |
| H012/G039, H025, G063        | —                          | Rammer ikke automation-scope                                                                                                                                                                                                                   |

## Verificerede afhængigheder

| Reference                                                                                                               | Defineret i                                      | Linje               | Brug i denne plan                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| §2-flow + gate-linje ("Tre gates kræver Mathias: krav OK, qwerg, slut OK")                                              | docs/strategi/disciplin.md                       | 32–46               | P1: gate-model rettes (formåls-flade)                                                                                      |
| §2 Step 3 (qwerg) + fundament-validering                                                                                | docs/strategi/disciplin.md                       | 67–71               | P1: Step 3 → rolle-godkendelse + fund-gates; fundament-validering BESTÅR uændret (flyttes til Codex-APPROVAL-forudsætning) |
| §9.1 qwerg-gate-pakke · §9.2 qwerg-trigger · §10.2 doc-currency-skabelon                                                | docs/strategi/disciplin.md                       | 253 / 265 / 354+358 | P1: gate-pakke → fund-gate-pakke; trigger-rettelse; skabelon-rettelse. Fuld qwerg-grep i B5-fejning                        |
| §2-automation-note · §6.2                                                                                               | docs/strategi/disciplin.md                       | 48 / 178–180        | P1/P2: dirigent-virkelighed (uændret fra V2)                                                                               |
| Forudsætninger-afsnit                                                                                                   | docs/strategi/disciplin.md                       | 476–484             | P5 (uændret)                                                                                                               |
| §9.1/§9.2/§9.3 rolle-hjem                                                                                               | docs/strategi/disciplin.md                       | 246/260/268         | Adapter-instrukser genbruger rollernes §9-sektioner                                                                        |
| §5 severities + FLAG→LØS + positive markers                                                                             | docs/strategi/disciplin.md                       | 150–168             | Vækningsmodellens leverance-typer er §5-mekanismerne filbårne — ingen nye severities opfindes                              |
| CODEOWNERS (nuværende: `* @mgrubak` + 4 strategi-linjer)                                                                | .github/CODEOWNERS                               | 1–22                | P3 INVERTERET: beslutnings-stier ejes eksplicit (se P3)                                                                    |
| codex-review.sh (dispatch, marker-parser, exit 0–4, plan-SHA i output-header, `--parse-test`)                           | scripts/codex-review.sh                          | 1–60, 200–247       | Codex-adapter + docs-fase (P4); plan-SHA-header = frossen-version-bevis                                                    |
| ci.yml (pull_request u. draft-eksklusion) · migrations-deploy.yml · governance-check structural-chain                   | .github/workflows + scripts/governance-check.mjs | —                   | Uændret / markør-flip post-godkendelse                                                                                     |
| Lokalt værktøj (claude 2.1.172, codex 0.137.0, gh 2.45.0 bot-aktiv, node 24, systemd `running` i session MEN Linger=no) | —                                                | —                   | Hosting mulig MED step 10-preflight                                                                                        |
| Merge-konvention (mgrubak-approval er gaten; Code armerer auto-merge)                                                   | CLAUDE.md + disciplin:48                         | —                   | BESTÅR for beslutnings-sti-PR'er; rolle-validerede PR'er merger på grøn CI (ny gate-model, P1+13b)                         |

## Design (krav 9: tavlen visket ren — formålet afgør)

**Kæde-kuréren** (`scripts/kaede/dirigent.mjs` + `scripts/kaede/adapters/`): lokal systemd-user-proces; poll-cyklus (60s) læser tilstand (git fetch + gh api) og eksekverer **aktørernes vækninger** (leverance-deklarationer/typer → routing) + opsamler eksterne events (merges, checks, Mathias-ord). Flere samtidige aktør-kørsler; lås pr. aktør pr. spor.

1. **Tilstandslæsning, ikke besked-kø** — crash/stop mister intet; stop = manuelt flow (krav 7 strukturelt).
2. **Polling, ikke webhooks** — begrundet i Design-valg-begrundelser.
3. **Transport-renhed (krav 6):** kuréren læser KUN tilstands-felter + leverance-DEKLARATIONER (sidste `→NÆSTE:`-linje / fil-type) — aldrig leverance-indhold i øvrigt. Routing deklarativ i `kaede-regler.json`.
4. **Dømmekraft bor i aktørerne:** adapters kører rollens §9-instruks; severities/FLAG→LØS/fuldstyrke uændret.
5. **Kvalitet pr. led (krav 4):** marker-/exit-parse pr. leverance: KRITISK → næste runde samme spor · NEEDS-MATHIAS/ESCALATE/halt → fund-gate + spor-pause · parse-fejl/ukendt deklaration → kæde-STOP + notifikation + manuelt flow. Fejl transporteres aldrig videre.
6. **Mathias' flade:** kæde-issue pr. pakke (gate-anmodninger m. @mgrubak-mention → mobil-push; gate-ord KUN fra author `mgrubak`); beslutnings-sti-PR'er → review-request → mobil. Åbning fra mobil: qwers-kommentar på stående issue.
7. **Klik kun på beslutninger:** Mathias-flade-modellen + P3-inversion + 13b.
8. **Spille hinanden bedre (krav 5):** Vækningsmodellens mid-fase-typer + ventevindue-dispatch.
9. **Suverænitet:** "stop" (enhver læst kanal) → øjeblikkelig pause; kæde-tilstand synlig i issuet.
10. **Transport-commit:** al aktør-leverance-commit sker i kurérens transport-commit — ordret, logget, aldrig eget/redigeret indhold. Codex read-only; Claude.ai-rollen docs-lag (untracked → transport-commit); Code committer egne leverancer.
11. **Regelbogs-håndhævelse (V8, TILLÆG 3-skærpelse):** hver kæde-regel der KAN udtrykkes som tilstands-betingelse i `kaede-regler.json`, SKAL — tekst-pligter er svageste lag. Dispatch-regler bærer `betingelser` (krævede leverancer/tilstande, SHA-bundne); decide() kan ikke dispatche når en betingelse mangler — den returnerer BLOKERET med den manglende betingelse navngivet (logget, synligt i kæde-issue). Betingelses-fejningen: **build-start** kræver Codex-APPROVAL + troskabs-PASS, begge bundet til plan-filens AKTUELLE SHA (mekaniseret diff-tom-tjek — V7-qwergs manuelle verifikation) + ingen åbne fund-gates · **krav-dok-merge** kræver author-verificeret "krav OK \<hash\>" hvor hash == filens aktuelle indholds-hash (V9, rest-klik-afgørelse 2 — versions-bindingen) · **slut-merge** kræver Claude.ai-APPROVAL-leverance + author-verificeret slut OK · **recon-klar** kræver alle tre recon-leverancer · **claude-ai-syntese-dispatch** kræver begge kode-recon-docs. Strukturelt håndhævet (ingen regel = ingen vej): krav-dok-skrivning kan ikke dispatches. GitHub-håndhævet: grøn CI, code-owner-review på beslutnings-stier.
12. **Selv-validering før frys (V15, Mathias-forslag):** transport-commit har leverance-typens `selvtjek`-liste som tilstands-betingelse — mekaniske tjek (ordret-diff, tal-mod-virkelighed, konsistens-grep), ingen dømmekraft. Fejl → ingen frys, ingen videre dispatch; SELVTJEK-FEJL → afsender-aktøren. Erstatter aldrig Codex-gaten; vejes på fund (gov-6 + slut-rapport bogfører effekten).

**Claude.ai-rollen lokalt (krav 1):** `claude -p` m. §9.1-instruks for de FIRE vækbare leverancer (V15-synk m. step 7): slut-rapport-review · fund-gate-pakker (følger fund-gates + slut OK) · recon-oplaeg · krav-troskabs-tjek. Untracked output → transport-commit. Windows-appen urørt til Mathias-dialog.

### Rolle- og ansvars-linjer (vagt 3)

| Komponent               | Identitet                  | MÅ                                                                                                                                                               | MÅ ALDRIG                                                                                                                                                       |
| ----------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kurér (dirigent)        | stork-code-bot             | Læse tilstand + deklarationer; dispatche pr. routing; transport-committe ordret (logget); poste kæde-issue; re-requeste reviews på beslutnings-sti-PR'er         | Generere/redigere leverance-indhold; vurdere indhold; vække af egen dagsorden; røre protection/admin; merge beslutnings-sti-PR'er; dispatche krav-dok-skrivning |
| Code-adapter            | Code (§9.2)                | Fuld rolle headless                                                                                                                                              | Overskride §9.2; fortsætte forbi STOP uden gate-fil                                                                                                             |
| Codex-adapter           | Codex (§9.3), read-only    | Review + research + §5-replikker                                                                                                                                 | Skrive kode; committe (transport-commit bærer output)                                                                                                           |
| Claude.ai-rolle-adapter | Claude.ai (§9.1), docs-lag | Slut-rapport-review; fund-gate-pakker; recon-oplaeg (efter begge kode-recon-docs); krav-troskabs-tjek (efter Codex-APPROVAL) — de FIRE leverancer, 1:1 m. step 7 | Kode-vurdering; datamodel; committe; skrive krav-dok (vækkes ALDRIG dertil)                                                                                     |
| Mathias-adapter         | bot poster; mgrubak afgør  | Notifikation + ordret gate-ord-aflæsning m. author-verifikation                                                                                                  | Tolke/sammenfatte; acceptere gate-ord fra andre                                                                                                                 |

### Anti-tunnelsyn-mekanismer (vagt 3)

1. Frisk tilstand hver cyklus — ingen cached antagelser; frisk kontekst pr. aktør-kørsel.
2. Divergens-STOP (én sandhed): uenige kilder → intet dispatches; STOP + notifikation m. begge værdier.
3. Ingen antagelses-vej ind i krav-dok: ingen routing-regel producerer krav-dok-indhold — Step 0/1 er dialog (Microsoft-casen, Mathias 2026-06-10, kan ikke opstå).
4. Kilde-pligt nedarves uændret (fabrikations-STOP §9.2, fuldstyrke §9.3, kilde-pligt §9.1).
5. Dispatch-log: tilstand → regel/deklaration → handling; gov-6 leverer loggen som bevis.

## End-to-end-spor (§3.3-tilpasset: kæde-spor, gov-6 som case — NY GATE-MODEL)

1. Mathias: "qwers gov-6-arkiv-fold" (mobil, author-verificeret) → **kæden IGANGSÆTTES (V8)**: Code + Codex recon-kørsler PARALLELT (kodens forretningsside → recon-kode-doc · uafhængig kode-recon → recon-research-doc; begge transport-committes)
   1b. Begge kode-recon-docs klar → Claude.ai-rollen dispatches (forretningsdata + begge docs) → recon-oplaeg til Mathias → `recon-klar` → Mathias notificeres (mobil) → krav-dok-DIALOG Mathias↔Claude.ai (kontrolposten — ALDRIG automatiseret; recon informerer, fodrer ikke). Dialog-krav-dok transport-committes → kæden poster "krav-dok klar @ \<hash\>" → **Mathias: "krav OK \<hash\>" (mobil)** → hash-match som tilstands-betingelse → krav-dok merges (V9: versions-bindingen)
2. Krav-dok merged → Code-plan + Codex-research dispatches parallelt; mid-fase: SPARRING/KODE-FUND-filer routes løbende begge veje
3. Code committer plan-V\<n\> (`→NÆSTE: Codex [review]`) → Codex-review (frossen V\<n\>, plan-SHA i header)
4. Codex APPROVAL (+ INGEN NYE FUND) → **Claude.ai-rollen: krav-troskabs-tjek (V8, TILLÆG 3 — sætning for sætning mod krav-dok)** → PASS → **build starter automatisk** (qwerg udgået, fangst-laget består) · FEEDBACK → Code-V\<n+1\>; åbne fund-gates blokerer fortsat (fund-gate-pakke → Mathias afgør fra mobil)
5. Build: batches; Codex per-batch parallelt; §5-replikker løbende; fund-der-er-hans → fund-gate
6. Build-PR (ingen beslutnings-stier, ingen åbne fund) → grøn CI + Codex final → **merger på rolle-validering** (auto-merge armeret). Rører PR'en beslutnings-stier → mgrubak-review-request → hans klik (afgørelsen er hans)
7. Merge → Code-slut-rapport → Claude.ai-rolle-review → APPROVAL → **"slut OK"-gate (mobil)** → merge (lukning — Mathias lukker, formålet)
8. Hvert led: marker-/exit-parse; brud → spor-pause + notifikation + manuelt flow

## Implementations-rækkefølge

| Step | Type             | Hvad                                                                                                                                                                                                                                                                                                                                                                                                                           | Eksakt indhold                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Afh.                | Risiko                                           |
| ---- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------ |
| 1    | Node             | `scripts/kaede/tilstand.mjs`                                                                                                                                                                                                                                                                                                                                                                                                   | Tilstandslæser (read-only) inkl. kilde-par til divergens-tjek + leverance-deklarations-læsning (`→NÆSTE:`-linje + fil-type)                                                                                                                                                                                                                                                                                                                                                                                                                                 | gh bot              | Lav                                              |
| 2    | JSON+Node        | `kaede-regler.json` + `dirigent.mjs`                                                                                                                                                                                                                                                                                                                                                                                           | Leverance-type→modtager-routing (vækningsmodellen) + kalender-poll-events + multi-kørsel m. lås pr. aktør/spor + transport-commit + dispatch-log + divergens-STOP                                                                                                                                                                                                                                                                                                                                                                                           | 1                   | Mellem — kernen; fixtures (3)                    |
| 3    | Tests            | `dirigent.test.mjs`                                                                                                                                                                                                                                                                                                                                                                                                            | Fixtures: alle leverance-typer + routing + mid-fase-tråde + author-tjek + divergens + STOP-ruter + lås-semantik + frossen-SHA-binding + selvtjek-betingelser (fejl → ingen frys + SELVTJEK-FEJL-routing)                                                                                                                                                                                                                                                                                                                                                    | 2                   | Lav                                              |
| 4    | Shell            | codex-review.sh `--phase=docs`                                                                                                                                                                                                                                                                                                                                                                                                 | P4 (uændret fra V2)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —                   | Lav                                              |
| 5    | Adapter          | `adapters/codex.sh`                                                                                                                                                                                                                                                                                                                                                                                                            | Fase-/type-valg → codex-review.sh → output m. deklaration → transport-commit → exit-kode                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 2,4                 | Lav                                              |
| 6    | Adapter          | `adapters/code.sh`                                                                                                                                                                                                                                                                                                                                                                                                             | `claude -p` headless m. qwerr-ækvivalent + §5-replik-opgaver; deklarations-pligt i output                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 2                   | Mellem — STOP-dækning; dry-run før tillid        |
| 7    | Adapter          | `adapters/claude-ai-rolle.sh` + `scripts/kaede/claude-ai-rolle-instruks.md`                                                                                                                                                                                                                                                                                                                                                    | `claude -p` m. §9.1-instruks — FIRE leverancer (V8): slut-rapport-review · fund-gate-pakker · recon-oplaeg · krav-troskabs-tjek (TILLÆG 3). **Instruksen SKAL bære gate-læringerne (TILLÆG 1):** krav-dok læses SÆTNING FOR SÆTNING mod planen; formålet læses FØRST og gate-spørgsmålet er "er formålet opnået?"; kravets MENING, ikke ord-match; leverancen DEKLARERER sit grundlag (egen læsning vs. rollernes verdikt); ALDRIG fuldstændigheds-garantier — kun "hvad er holdt mod hvad"; stikprøver flages som stikprøver. Untracked → transport-commit | 2                   | Mellem — rolle-renhed i instruks + Codex tjekker |
| 8    | Adapter          | `adapters/mathias.mjs`                                                                                                                                                                                                                                                                                                                                                                                                         | Kæde-issue: gate-anmodninger, author-verifikation, review-re-request på beslutnings-stier                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 1                   | Lav                                              |
| 9    | Integration      | `--dry-run` + ét live led (Codex --quick på test-branch) + headless-auth-bevis                                                                                                                                                                                                                                                                                                                                                 | Dispatch-log mod forventet; verificér-før-tillid (MELLEM 2)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 1–8                 | Lav                                              |
| 10   | systemd          | `stork-kaede.service` + preflight (linger-tjek, `loginctl enable-linger`, env-krav)                                                                                                                                                                                                                                                                                                                                            | Begrundet mod alternativer (Design-valg); Restart=on-failure; stop = manuelt flow                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 9                   | Mellem                                           |
| 11   | CODEOWNERS       | P3-inversion                                                                                                                                                                                                                                                                                                                                                                                                                   | Beslutnings-stier ejes eksplicit (eksakt diff i P3)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —                   | Mellem — 11b beviser                             |
| 11b  | Bevis            | FEM test-PR-cases: (a) governance-doc (docs/strategi) → forvent review-krav; (b) tidligere-default VÆRN-fil (scripts/migration-gate.mjs el. supabase/config.toml, Codex V6-krav) → forvent review-krav; (c) bogførings-sti (aktiv-plan.md) → forvent merge på grøn CI; (d) krav-og-data-fil → forvent INGEN code-owner-krav (merge gated af krav OK-hash-betingelsen, runde 19); (e) arkiv-flytning → forvent merge på grøn CI | gov-4 #111-mønster; fejl → P3-rollback + STOP-gate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 11,13               | Lav                                              |
| 12   | Docs             | Dokument-currency-leverancen (P1+P2+P5 + grep-fejning inkl. "qwerg")                                                                                                                                                                                                                                                                                                                                                           | §8.1-gate; eksakte diffs i Patch-først                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | build               | Lav                                              |
| 13a  | Protection-dump  | **UDFØRT 2026-06-11 (Mathias-mandat)** — rå dump + verifikation + eksakt diff: se "Step 13a"-sektionen; alle gov-4-forventninger verificeret sande                                                                                                                                                                                                                                                                             | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | mandat              | Lav                                              |
| 13b  | Protection-apply | 13a-diff: approvals→0; code-owner-review BESTÅR (bærer beslutnings-stierne); required CI BESTÅR; admin kun på mandat, switch-back straks; verificeret af 11b                                                                                                                                                                                                                                                                   | 13a + plan-godkendelse                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Mellem — gate-flade |
| 14   | Docs             | aktiv-plan markør-flip + status                                                                                                                                                                                                                                                                                                                                                                                                | Doc-currency B                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | godkendelse         | Lav                                              |

**Skitse-størrelse:** 0 migrations. Batches: B1=1–3 · B2=4–7 · B3=8–9 · B4=10–11+13 · B5=12+14+11b. Per-batch Codex-review.

## Dokument-currency-leverance (vagt 2)

| Tekst                                                                                                                                                                                                    | Fil:linje                      | Handling                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------- |
| §2-flow + gate-linje + Step 3 (qwerg)                                                                                                                                                                    | disciplin.md:32–46, 67–71      | **P1 (udvidet i V5):** gate-model → formåls-flade                                            |
| §9.1 qwerg-gate-pakke · §9.2 qwerg-trigger · §10.2-skabelon                                                                                                                                              | disciplin.md:253, 265, 354+358 | P1: fund-gate-pakke / trigger-rettelse / skabelon                                            |
| §2-automation-note · §6.2                                                                                                                                                                                | disciplin.md:48, 178–180       | P1/P2: dirigent-virkelighed                                                                  |
| Forudsætninger                                                                                                                                                                                           | disciplin.md:476–484           | P5                                                                                           |
| CLAUDE.md merge-konvention                                                                                                                                                                               | CLAUDE.md                      | Rettes: konvention gælder beslutnings-sti-PR'er; rolle-validerede merger på grøn CI (P6, NY) |
| codex-review.sh header                                                                                                                                                                                   | scripts/codex-review.sh:4–12   | P4                                                                                           |
| **Grep-fejning (B5):** `grep -ri "qwerg\|notify\|runner\|manuel dispatch\|mål-tilstand\|skal bygges\|tre gates" docs/ scripts/ CLAUDE.md README.md` — hvert hit klassificeres: rettes / sand / historisk | alle aktive docs               | Vagt 2: maskinen må aldrig validere mod en løgn                                              |

## Patch-først pr. ændret fil (§3.1)

**P1 — disciplin.md gate-model (UDVIDET i V5).** Nuværende §2-gate-linje 1:1 (linje 46): "Tre gates kræver Mathias: `krav OK`, `qwerg`, `slut OK`. Trin 2 og 4 er hvor det meste arbejde sker." + flow-diagram (linje 32–44, trin 3 = "qwerg approval (Mathias) ← gate: qwerg") + Step 3-afsnit 1:1 (linje 67–71, citeret i Verificerede afhængigheder). DIFF: trin 3 → "Rolle-godkendelse (Codex-APPROVAL; fund-gates til Mathias ved NEEDS-MATHIAS m.v.)"; gate-linjen → "To ubetingede Mathias-gates: `krav OK`, `slut OK`. Betingede fund-gates + beslutnings-sti-review når afgørelsen er hans (Mathias-flade-modellen, gov-5)."; Step 3-afsnit omskrives (qwerg-mekanik → fund-gate-mekanik). **BEVARES:** fundament-valideringen (§2 Step 3-forudsætningen) ordret — flyttes til Codex-APPROVAL-forudsætning, ingen svækkelse; §9.1-gate-hjælpens substans (gate-pakke-format) — retarget til fund-gates + slut OK; konvergens-trappen §3.4 uændret. Også §2-automation-note (linje 48, verbatim i V2-P1) → dirigent-virkelighed. **V8-udvidelser:** trin 3 → "Rolle-godkendelse (Codex-APPROVAL + Claude.ai krav-troskabs-PASS; fund-gates til Mathias)" (TILLÆG 3 — V2-beslutningen fra maj om Claude.ai ude af plan-fasen omgøres ærligt); §2-flow trin 0/1 → kæde-start ved qwers m. recon-leverancer (dialog-kontrolposten uændret); §9.3-plan-review-fokus: "krav-dok-konsistens uden scope-creep" → **"FULDSTÆNDIGHED: hver krav-sætning realiseret eller eksplicit begrundet afgrænset"** (TILLÆG 5a — undladelser fanges, ikke kun modsigelser); §9.1 udvides m. de fire kæde-leverancer + TILLÆG 1-metoden. §8.1-gate + Codex prosa-svar obligatorisk; **Mathias' re-godkendelse af denne plan ratificerer modellen — disciplin-diffen committes ordret derefter.**

**P2 — disciplin.md:178–180 (§6.2).** Verbatim + diff uændret fra V2 (notify-only → kæde-beskrivelse; migrations-deploy-sætning + arve-reference bevares).

**P3 — .github/CODEOWNERS (STRUKTURELT REDESIGNET i V7 efter Codex V6-M-E-B — Mathias-accepteret 2026-06-11).** Nuværende 1:1 (22 linjer, header + `* @mgrubak` + 4 strategi-linjer + 3 udkommenterede lag-B). DIFF: **`* @mgrubak` BESTÅR** (default-own: alt nyt og alt uopremset er hans — fund-klassen "glemt sti" kan strukturelt ikke opstå); KUN den rolle-validerede bogførings-flade enumereres som ejer-løse undtagelses-linjer, indsat EFTER `* @mgrubak`, FØR strategi-linjerne (sidst-matchende vinder; strategi-linjerne gen-ejer intet der er undtaget — de matcher andre stier):

```
# Rolle-valideret bogførings-flade (gov-5, Mathias-accepteret 2026-06-11;
# udvidet m. rest-klik-afgørelserne — V9): ejer-løs linje fjerner code-owner-
# kravet (GitHub-dokumenteret mekanik). Mathias' gates er ORDENE (krav OK
# m. indholds-hash / slut OK, author-verificeret i kæden), ikke PR-klikkene —
# kæden merger aldrig før ordet er registreret; krav-dok kun ved hash-match.
/docs/coordination/aktiv-plan.md
/docs/coordination/seneste-rapport.md
/docs/coordination/codex-reviews/
/docs/coordination/plan-feedback/
/docs/coordination/rapport-historik/
/docs/coordination/arkiv/
docs/coordination/*-status.md
docs/coordination/*-plan.md
docs/coordination/*-krav-og-data.md
```

**Snittet (ved tvivl er det hans — strukturelt håndhævet af defaulten):** ALT beholder hans gate undtagen de syv bogførings-mønstre — dvs. supabase/ (hele, inkl. config/baseline/schema/tests), scripts/ (alle værn), packages/, apps/, .github/, docs/strategi/, docs/teknisk/, CLAUDE.md, krav-dok-kontrakter, mathias-gate/, README, rod-configs og alt fremtidigt. Codex V6-fundets flader (config.toml, advisor-baseline.json, schema.sql, supabase/tests, migration-gate.mjs, run-db-tests.mjs, schema-check.sh, types-gen.sh, selftests) er dækket af defaulten — ingen inventory nødvendig, klassen er elimineret. Rapport-historik + plan-filer er ejer-løse fordi gaterne er Mathias' ORD: kæden merger slut-rapport først når slut OK er author-verificeret registreret, og plan-merges følger rolle-godkendelse (gov-5-gate-model). **NB:** forretnings-builds (migrations/packages/apps) kræver fortsat hans klik — forretnings-trinnets klik-model er en NY afgørelse til den tid. **BEVARES:** hele den eksisterende fil ordret (header-historik, `* @mgrubak`, 4 strategi-linjer, lag-B-kommentarer) — diffen er RENT ADDITIV. Bevis: 11b (tre cases).

**P4 — codex-review.sh (UDVIDET i V8, TILLÆG 5a).** V2-indhold består (docs-fase + header; parser/exit/`--parse-test` bevares). NYT: plan-prompt-fokuslinjen "Krav-dok-konsistens uden scope-creep" (heredoc, §10.4-genereret) omformuleres til fuldstændigheds-pligten: _"FULDSTÆNDIGHED mod krav-dok: hver krav-sætning realiseret i planen eller eksplicit begrundet afgrænset — undladelse er et fund, ikke kun modsigelse"_. Build-orden: denne indholds-rettelse lander FØR betingelses-mekanikken aktiveres (TILLÆG 5-rækkefølgen).

**P5 — disciplin Forudsætninger (476–484).** Uændret fra V2 (punkt → Gjort-listen).

**P6 — CLAUDE.md (NY i V5).** Nuværende merge-konvention-afsnit 1:1 (CLAUDE.md "Identiteter"-sektion, citeret i Verificerede afhængigheder). DIFF: konventionen præciseres: mgrubak-approval er gaten **på beslutnings-sti-PR'er**; rolle-validerede PR'er merger på grøn CI + Codex (gov-5-gate-model, jf. disciplin §2). **BEVARES:** tre-konto-strukturen, aldrig-admin-reglen, alt andet.

**P7 — scripts/kaede/ eksisterende B1-kode (NY i V9; ORDRETTE bodies i V10, Codex runde 18-M-E-B).** Event-fladen reworkes mod V9-semantik; alt andet BEVARES.

(a) **`scripts/kaede/kaede-regler.json:31–42` — nuværende body 1:1:**

```json
"events": {
  "qwers-aabning": [{ "aktoer": "mathias", "opgave": "kvittering" }],
  "krav-dok-merged": [
    { "aktoer": "code", "opgave": "plan-start" },
    { "aktoer": "codex", "opgave": "kode-research" }
  ],
  "build-pr-klar-beslutningssti": [{ "aktoer": "mathias", "opgave": "review-request" }],
  "build-pr-merged": [{ "aktoer": "code", "opgave": "slut-rapport" }],
  "slut-ok-registreret": [{ "aktoer": "code", "opgave": "slut-merge" }],
  "gate-godkendt": [{ "aktoer": "code", "opgave": "gate-afgjort-fortsaet" }],
  "gate-afvist": [{ "aktoer": "code", "opgave": "gate-afvist-alternativ" }]
},
```

DIFF: `qwers-aabning` → `[{code, recon-kode}, {codex, recon-research}]` (kvittering består som mathias-adapter-bihandling) · NYE events: `recon-kode-klar` (→ claude-ai-rolle: recon-syntese), `recon-klar` (→ mathias: notifikation), `krav-ok-hash-registreret` (→ krav-dok-merge) · NYT felt `betingelser` pr. dispatch-regel (design pkt. 11): build-start kræver `codex-approval@plan-sha` + `troskabs-pass@plan-sha` + `ingen-aabne-gates` · krav-dok-merge kræver `krav-ok-hash == fil-hash` · claude-ai-syntese kræver begge recon-docs · slut-merge kræver claude-ai-approval + slut-ok. **BEVARES:** alle 7 eksisterende events (krav-dok-merged er fortsat væknings-punkt — blot ikke kæde-START), leverance_typer (+ `recon-kode-doc`, `recon-research-doc`, `recon-oplaeg`, `troskabs-verdikt` tilføjes), gate_ord, identiteter, fund_gate_markers. **V13-tilføjelse:** `kaede_issue`-feltets semantik ændres fra pr.-pakke (null) til STÅENDE dirigent-issue-nummer (sættes i B3; null = fail-closed åbningsflade); kommentar-feltet opdateres tilsvarende. **V15-tilføjelse:** `selvtjek`-felt pr. leverance-type (deklarativ liste af mekaniske tjek: ordret-diff/tal-mod-virkelighed/konsistens-grep) — betingelse for transport-commit (design pkt. 12); minimal liste i gov-5, udvides i partnerskabs-runden. **V17-tilføjelser (runde 25):** (1) `review-approval` → `{claude-ai-rolle, krav-troskabs-tjek}` (var `{code, build-start}` — TILLÆG 3-modellen ført ind i tabellen); `troskabs-verdikt` routes pr. marker: PASS → `{code, build-start}` · FEEDBACK → `{code, naeste-version}`. (2) `afsender`-felt pr. leverance-type (SELVTJEK-FEJL-routing); `krav-dok-udkast`: afsender `dialog` → fejl = Mathias-notifikation, ingen aktør-genkørsel. **V20-eksplicitering:** `"krav-dok-udkast": { "afsender": "dialog", "modtager": "mathias", "opgave": "hash-post" }` — routes af decide()'s normale type-vej; selftest-case medfølger.

**`scripts/kaede/kaede-regler.json:18–30` (`leverance_typer`) — nuværende body 1:1 (maskinelt udtrukket ved V18):**

```json
  "leverance_typer": {
    "plan-version": { "modtager": "codex", "opgave": "plan-review" },
    "build-batch": { "modtager": "codex", "opgave": "batch-review" },
    "slut-rapport": { "modtager": "claude-ai-rolle", "opgave": "slut-rapport-review" },
    "review-feedback": { "modtager": "code", "opgave": "naeste-version" },
    "review-approval": { "modtager": "code", "opgave": "build-start" },
    "sparring-oenske": { "modtager": "codex", "opgave": "sparring-svar" },
    "sparring-svar": { "modtager": "code", "opgave": "fortsaet" },
    "kode-fund": { "modtager": "code", "opgave": "fund-haandtering" },
    "optimering-forslag": { "modtager": "code", "opgave": "adopt-defer-dismiss" },
    "loes-replik": { "modtager": "codex", "opgave": "agree-refine-escalate" },
    "fund-gate-pakke": { "modtager": "mathias", "opgave": "gate-anmodning" }
  },
```

DIFF (samlet for V8-V17-tilføjelserne): `review-approval`: `{"modtager": "code", "opgave": "build-start"}` → `{"modtager": "claude-ai-rolle", "opgave": "krav-troskabs-tjek"}` · NYE typer: `recon-kode-doc`, `recon-research-doc`, `recon-oplaeg`, `krav-dok-udkast`, `troskabs-verdikt` (PASS/FEEDBACK-routing pr. marker) · NYE felter pr. type: `afsender` + `selvtjek`. **BEVARES:** alle øvrige 10 typer ordret (plan-version, build-batch, slut-rapport, review-feedback, sparring-oenske/-svar, kode-fund, optimering-forslag, loes-replik, fund-gate-pakke).

(b) **`scripts/kaede/tilstand.mjs:92–112` (`afledEvents`) — nuværende body 1:1:**

```js
export function afledEvents({ pakke, paaMain, buildPr, gateOrd, gateAuthor, mainSha }) {
  if (!pakke || pakke === "ingen") return [];
  const events = [];
  if (paaMain.kravDok && !paaMain.planFil) events.push({ type: "krav-dok-merged", sha: mainSha });
  if (buildPr?.merged && !paaMain.rapportFil)
    events.push({ type: "build-pr-merged", sha: buildPr.mergeSha ?? mainSha });
  if (buildPr?.klar && buildPr?.beslutningsSti)
    events.push({ type: "build-pr-klar-beslutningssti", sha: buildPr.headSha ?? mainSha });
  for (const ord of gateOrd ?? []) {
    if (ord.author !== gateAuthor) continue;
    if (ord.tekst === "slut OK") events.push({ type: "slut-ok-registreret", sha: ord.id ?? mainSha });
    if (ord.tekst.startsWith("qwers "))
      events.push({ type: "qwers-aabning", sha: ord.id ?? mainSha, pakke: ord.tekst.slice(6).trim() });
    // Gate-afgørelser (runde 16): GODKENDT/AFVIST løfter åben Mathias-gate
    if (ord.tekst === "GODKENDT" || ord.tekst.startsWith("GODKENDT "))
      events.push({ type: "gate-godkendt", sha: ord.id ?? mainSha });
    if (ord.tekst === "AFVIST" || ord.tekst.startsWith("AFVIST "))
      events.push({ type: "gate-afvist", sha: ord.id ?? mainSha });
  }
  return events;
}
```

DIFF: linje 95 (krav-dok-merged — Codex runde 17: holder kun betinget) → betinges af recon-fase afsluttet: nyt input-felt `reconKlar`, afledt af recon-leverancernes eksistens + behandlet recon-klar-event · NYE afledninger: recon-kode-klar (begge kode-recon-docs findes), recon-klar (+ oplæg findes), krav-ok-hash (parsing `/^krav OK ([0-9a-f]{7,64})$/`). **BEVARES ordret:** linje 96–99 (build-PR-afledninger), 100–101 (author-filter, forsvar i dybden), 102 (slut OK), 103–104 (qwers), 105–109 (gate-afgørelser). **V13-tilføjelse (runde 21-guards):** afledEvents' tidlig-retur `if (!pakke || pakke === "ingen") return []` ændres: qwers-parsing løftes FØR guarden (åbnings-events afledes altid; øvrige events kræver fortsat aktiv pakke) · laesTilstand's events-guard (`if (pakke !== "ingen")`) tilsvarende: gateOrd fra stående issue + qwers-afledning kører altid; pakke-events kun m. aktiv pakke + pr.-pakke-issue fra status-filens `Kæde-issue:`-linje.

(c) **`scripts/kaede/dirigent.selftest.mjs:331 ff.` (sektion 11) — nuværende cases 1:1:** krav-dok-merged → Code OG Codex parallelt (§2.1) · build-pr-merged → Code (slut-rapport) · build-pr-klar-beslutningssti → Mathias review-request · slut OK → slut-merge · qwers → kvittering. DIFF: qwers-casen → recon-dispatches; krav-dok-merged-casen + reconKlar-forudsætning; NYE betingelses-cases: build uden PASS → BLOKERET · PASS m. forkert SHA → BLOKERET · krav-dok-merge uden hash-match → BLOKERET · syntese uden begge docs → BLOKERET. **V13:** casen "ingen aktiv pakke → ingen events" VENDES til "ingen aktiv pakke → KUN author-verificeret 'qwers <pakke>' afleder åbnings-event → recon-dispatches" + ny case: qwers fra forkert author m. pakke=ingen → intet. **BEVARES (Codex-verificeret runde 17):** alle øvrige B1-værn — gate-deadlock-fixet, transport-commit-isolation (tmp-repo-bevist), exit-0-behandlet-semantik, event-idempotens pr. modtager, halvskrevet-værn, lås-semantik, divergens-STOP, ARV-IGNORERET, NUL-fixet. Tab af ét uden begrundelse = M-E-B.

(d) **`scripts/kaede/tilstand.mjs:114–125` (`BOGFOERING_RES` + helper-kommentar) — nuværende body 1:1 (Codex runde 19):**

```js
// Bogførings-sti-tjek (de 7 P3-mønstre). NB: CODEOWNERS er det HÅNDHÆVENDE
// værn (GitHub) — denne helper afgør kun om kuréren skal re-requeste Mathias-
// review (transport-høflighed); GitHub kræver det uanset hvad denne siger.
const BOGFOERING_RES = [
  /^docs\/coordination\/aktiv-plan\.md$/,
  /^docs\/coordination\/seneste-rapport\.md$/,
  /^docs\/coordination\/codex-reviews\//,
  /^docs\/coordination\/plan-feedback\//,
  /^docs\/coordination\/rapport-historik\//,
  /^docs\/coordination\/[^/]+-status\.md$/,
  /^docs\/coordination\/[^/]+-plan\.md$/,
];
```

DIFF (rest-klik-afgørelsen ført igennem): + `/^docs\/coordination\/arkiv\//` + `/^docs\/coordination\/[^/]+-krav-og-data\.md$/` (7 → 9 mønstre, 1:1 m. P3's ejer-løse liste); kommentaren → "de 9 P3-mønstre". Selftest-sektion 19: casen "krav-og-data er IKKE bogføring (kontrakt)" VENDES (er nu bogføring — gated af krav OK-hash, ikke af klik) og "arkiv-plan er IKKE bogføring" VENDES (arkiv/ er bogføring efter slut OK); scripts/kaede-casen består (værn = aldrig bogføring). **BEVARES:** de 7 eksisterende mønstre ordret + helperens transport-høfligheds-semantik (CODEOWNERS er fortsat det håndhævende værn).

(e) **`scripts/kaede/dirigent.mjs:37–200` (`decide()`) — nuværende body 1:1 (maskinelt udtrukket ved V12):**

```js
export function decide(tilstand, regler) {
  const handlinger = [];
  const laase = tilstand.laase ?? [];
  const behandlede = new Set(tilstand.behandlede ?? []);
  const spor = tilstand.marker?.pakke ?? "ingen";

  // 1. Divergens (én sandhed) — STOPPER alt; intet andet vurderes.
  if (tilstand.divergens?.length) {
    return [{ handling: "KAEDE-STOP", grund: "divergens", detalje: tilstand.divergens }];
  }

  // (Åben-gate-tjek flyttet til 2b — EFTER gate-ord-behandling, så Mathias'
  // GODKENDT/AFVIST kan løfte pausen; Codex runde 16: deadlock ellers.)

  // 2. Gate-ord: author-verifikation FØR alt andet brug af ordet.
  for (const ord of tilstand.gateOrd ?? []) {
    const erGateOrd = regler.gate_ord.some(
      (g) => ord.tekst === g || ord.tekst.startsWith(`${g} `) || ord.tekst.startsWith(`${g}\n`),
    );
    if (!erGateOrd) continue;
    if (ord.author !== regler.identiteter.gate_author) {
      handlinger.push({ handling: "IGNORER-GATE-ORD", author: ord.author, tekst: ord.tekst, flag: true });
      continue;
    }
    if (ord.tekst === "stop" || ord.tekst.startsWith("stop ")) {
      return [...handlinger, { handling: "KAEDE-PAUSE", grund: "Mathias-stop (suverænitet)" }];
    }
    handlinger.push({ handling: "GATE-ORD-REGISTRERET", ord: ord.tekst });
  }

  // 2b. Åben Mathias-gate (runde 14 + 16): gate-fil m. "AFVENTER MATHIAS"
  // pauser sporet — MEN en frisk, author-verificeret afgørelse (gate-godkendt/
  // gate-afvist-event fra GODKENDT/AFVIST-ord) løfter den: gate-filen afgøres
  // (ordret transport af Mathias' ord) og Code dispatches til genoptagelse.
  // Alt andet på sporet forbliver pauset i denne cyklus.
  if (tilstand.aabneGates?.length) {
    const afgoerelser = (tilstand.events ?? []).filter(
      (e) =>
        (e.type === "gate-godkendt" || e.type === "gate-afvist") &&
        !behandlede.has(`event:${e.type}@${e.sha ?? "HEAD"}#code`),
    );
    if (!afgoerelser.length) {
      return [...handlinger, { handling: "SPOR-PAUSET", gates: tilstand.aabneGates, spor }];
    }
    for (const e of afgoerelser) {
      handlinger.push({ handling: "GATE-AFGJORT", afgoerelse: e.type, gates: tilstand.aabneGates, sha: e.sha });
      handlinger.push({
        handling: "DISPATCH",
        aktoer: "code",
        opgave: regler.events[e.type][0].opgave,
        adapter: regler.aktoerer.code.adapter,
        kontekst: { event: e.type, sha: e.sha ?? null, spor },
      });
    }
    return handlinger; // afgørelsen bærer cyklussen; øvrig routing fra næste cyklus
  }

  // 3. Untracked leverancer → transport-commit (ordret) før routing — men
  // ALDRIG mens en kørsel er aktiv på sporet (Codex runde 15-fund): filen kan
  // være halvskrevet indtil aktørens exit 0 har bevist at den er færdig.
  // Konservativt: enhver aktiv kørsel på sporet → VENT.
  for (const lev of tilstand.leverancer ?? []) {
    if (!lev.untracked) continue;
    if (laase.some((l) => l.spor === spor)) {
      handlinger.push({ handling: "VENT", fil: lev.fil, grund: "koersel-paa-spor" });
      continue;
    }
    handlinger.push({ handling: "TRANSPORT-COMMIT", fil: lev.fil });
  }

  // 4. Committede, ubehandlede leverancer → routing.
  for (const lev of tilstand.leverancer ?? []) {
    if (lev.untracked) continue; // routes i næste cyklus, efter transport-commit
    if (lev.aendret) {
      // Modificeret tracked bærer (runde 13-fund 1): aktør m. commit-ret er
      // midt i arbejdet — ingen routing (stale filSha ≠ worktree-indhold),
      // ingen transport-commit (aldrig halvfærdigt arbejde). Venter.
      handlinger.push({ handling: "AFVENTER-COMMIT", fil: lev.fil });
      continue;
    }
    const noegle = `${lev.fil}@${lev.sha ?? "HEAD"}`;
    if (behandlede.has(noegle)) continue;

    // 4a. Fund-gate-markers → Mathias-gate + spor-pause (runde 14-fund 1):
    // fund-gaten DISPATCHES til mathias-adapteren (gate-anmodning + gate-fil,
    // B3) og ALT efterfølgende på sporet pauses i denne cyklus. Fra næste
    // cyklus bærer gate-filen pausen (regel 1b) til Mathias afgør.
    const gateMarkers = (lev.markers ?? []).filter((m) => regler.fund_gate_markers.includes(m));
    if (gateMarkers.length) {
      handlinger.push({ handling: "FUND-GATE", fil: lev.fil, markers: gateMarkers, spor });
      handlinger.push({
        handling: "DISPATCH",
        aktoer: "mathias",
        opgave: "gate-anmodning",
        adapter: regler.aktoerer.mathias.adapter,
        kontekst: { fil: lev.fil, sha: lev.sha ?? null, spor },
      });
      return handlinger; // spor-pause: intet andet routes i denne cyklus
    }

    // 4b. Type: deklaration vinder over filnavns-inferens. Committed fil HELT
    //     uden deklaration/type er pre-kæde-arv (menneske-committet) — kuréren
    //     handler kun på eksplicitte deklarationer (transport-princippet); den
    //     ignoreres logget. DEKLARERET men ukendt type → STOP (aktiv fejl).
    const type = lev.deklaration?.type ?? lev.type ?? null;
    if (type === null && lev.deklaration === null) {
      handlinger.push({ handling: "ARV-IGNORERET", fil: lev.fil });
      continue;
    }
    const regel = type ? regler.leverance_typer[type] : null;
    if (!regel) {
      return [...handlinger, { handling: "KAEDE-STOP", grund: "ukendt-leverance-type", fil: lev.fil, type }];
    }

    // 4c. Modtager: aktør-deklaration kan override modtager (vækningsret hos
    //     aktørerne) — men kun til kendte aktører; ukendt → STOP (fail-closed).
    const modtager = lev.deklaration?.naeste ?? regel.modtager;
    if (!regler.aktoerer[modtager]) {
      return [...handlinger, { handling: "KAEDE-STOP", grund: "ukendt-modtager", fil: lev.fil, modtager }];
    }

    // 4d. Lås pr. (aktør, spor): igangværende kørsel afbrydes ALDRIG
    //     (verdikt på frossen version) — leverancen venter til næste cyklus.
    if (laase.some((l) => l.aktoer === modtager && l.spor === spor)) {
      handlinger.push({ handling: "VENT", fil: lev.fil, modtager, grund: "laas" });
      continue;
    }

    handlinger.push({
      handling: "DISPATCH",
      aktoer: modtager,
      opgave: regel.opgave,
      adapter: regler.aktoerer[modtager].adapter,
      kontekst: { fil: lev.fil, sha: lev.sha ?? null, spor },
    });
  }

  // 5. Kalender-poll-events (eksterne tilstande: merges, checks, åbnings-ord).
  for (const ev of tilstand.events ?? []) {
    const modtagere = regler.events[ev.type];
    if (!modtagere) {
      return [...handlinger, { handling: "KAEDE-STOP", grund: "ukendt-event", event: ev.type }];
    }
    for (const m of modtagere) {
      // Event-idempotens PR. MODTAGER (Codex runde 11-fund): multi-modtager-
      // events må aldrig droppe én aktørs kørsel fordi en andens lykkedes.
      if (behandlede.has(`event:${ev.type}@${ev.sha ?? "HEAD"}#${m.aktoer}`)) continue;
      if (laase.some((l) => l.aktoer === m.aktoer && l.spor === spor)) {
        handlinger.push({ handling: "VENT", event: ev.type, modtager: m.aktoer, grund: "laas" });
        continue;
      }
      handlinger.push({
        handling: "DISPATCH",
        aktoer: m.aktoer,
        opgave: m.opgave,
        adapter: regler.aktoerer[m.aktoer].adapter,
        kontekst: { event: ev.type, sha: ev.sha ?? null, spor },
      });
    }
  }

  if (!handlinger.length) handlinger.push({ handling: "INGEN" });
  return handlinger;
}
```

DIFF (regelbogs-håndhævelsen, design pkt. 11): decide() udvides med ÉN ny regel-klasse: før hver DISPATCH (leverance- og event-vejen) evalueres reglens `betingelser`-felt fra kaede-regler.json mod tilstands-felter (leverance-eksistens m. SHA-binding, hash-match, åbne gates); en manglende betingelse → `{ handling: "BLOKERET", regel, betingelse }` i stedet for DISPATCH (logget, synligt i kæde-issue) — aldrig en advarsel der kan overhøres. **V16-udvidelse (runde 24):** regel 3 (untracked → TRANSPORT-COMMIT) udvides: typens `selvtjek`-liste evalueres FØR frys — PASS → TRANSPORT-COMMIT · FEJL → `{ handling: "SELVTJEK-FEJL", fil, tjek }` + DISPATCH af afsender-aktøren m. fejl-kontekst; ingen frys. Halvskrevet-værnet (VENT v. kørsel på spor) evalueres FØR selvtjek. **V20/V21-udvidelse (runde 28+29):** `eventSpor = ev.pakke ?? spor` udledes FØR betingelses-/lås-tjek og bruges KONSEKVENT i event-loopet (lås-opslag, betingelser, dispatch-kontekst) — qwers-båret pakkenavn vinder over markørens "ingen" hele vejen; dublet-dispatch under åbning udelukket. Event-routingen får recon-/krav-ok-hash-events fra P7(a). **BEVARES (eksplicit, jf. runde 20-krav):** regel 1 divergens-STOP · regel 2 gate-ord-author-verifikation + Mathias-stop · regel 2b gate-deadlock-fixet (gate-ord FØR pause; GODKENDT/AFVIST løfter; idempotens pr. kommentar-id) · regel 3 transport-commit m. halvskrevet-værn (VENT v. kørsel på spor) · regel 4 AFVENTER-COMMIT (modificeret tracked) + behandlet-idempotens + FUND-GATE→mathias-dispatch m. tidlig retur + ARV-IGNORERET + fail-closed (ukendt type/modtager) + lås-VENT + frossen-SHA-kontekst · regel 5 event-idempotens PR. MODTAGER · INGEN-fallback. Tab af ét uden begrundelse = M-E-B.

(f) **`scripts/kaede/tilstand.mjs:176–337` (`laesTilstand`) — nuværende body 1:1 (maskinelt udtrukket ved V14):**

```js
export function laesTilstand({ repoRod, kaedeIssue = null, fetch = true }) {
  if (fetch) git(["fetch", "--quiet"], repoRod);

  const branch = git(["branch", "--show-current"], repoRod);
  const lokalSha = git(["rev-parse", "HEAD"], repoRod);
  let remoteSha = null;
  try {
    remoteSha = git(["rev-parse", `origin/${branch}`], repoRod);
  } catch {
    remoteSha = null; // branch endnu ikke pushet — ikke divergens, men observeret
  }

  const aktivPlanSti = join(repoRod, "docs/coordination/aktiv-plan.md");
  const marker = existsSync(aktivPlanSti) ? parseAktivMarker(readFileSync(aktivPlanSti, "utf8")) : null;

  // Åbne Mathias-gates (§6.3-to-fil-flow): gate-fil m. "AFVENTER MATHIAS"
  // pauser sporet (decide regel 1b) indtil Mathias afgør.
  const gateDir = join(repoRod, "docs/coordination/mathias-gate");
  const aabneGates = existsSync(gateDir)
    ? readdirSync(gateDir)
        .filter((f) => f.endsWith(".md"))
        .filter((f) => /AFVENTER MATHIAS/.test(readFileSync(join(gateDir, f), "utf8")))
        .map((f) => `docs/coordination/mathias-gate/${f}`)
    : [];

  // Leverance-filer: coordination-fladen (untracked = afventer transport-commit)
  const koordDir = join(repoRod, "docs/coordination");
  const porcelain = git(["status", "--porcelain", "docs/coordination/"], repoRod).split("\n").filter(Boolean);
  const untracked = porcelain.filter((l) => l.startsWith("??")).map((l) => l.slice(3).trim());
  // Modificeret TRACKED fil (Codex runde 13-fund 1): en aktør m. commit-ret er
  // midt i arbejdet — kuréren committer ALDRIG halvfærdigt arbejde og må ikke
  // route filen (worktree-tekst + gammel filSha = forkert frossen version).
  const aendrede = porcelain.filter((l) => !l.startsWith("??")).map((l) => l.slice(3).trim());

  // Leverance-bærere (Codex B1-runde 9-fund 1 — fuld flade):
  //   codex-reviews/ + plan-feedback/  → Codex'/Claude.ai-rollens leverancer
  //   rapport-historik/                → slut-rapporter
  //   <pakke>-status.md                → CODES leverance-bærer (§3.5: status
  //     opdateres sidst i hver leverance med →NÆSTE-deklaration som sidste
  //     linje — plan-V<n>/build-batch/slut-rapport routes via den)
  const aktivPakke =
    (existsSync(aktivPlanSti) && parseAktivMarker(readFileSync(aktivPlanSti, "utf8"))?.pakke) || "ingen";
  const leveranceStier = [];
  for (const dir of ["codex-reviews", "plan-feedback", "rapport-historik"]) {
    const fuldDir = join(koordDir, dir);
    if (!existsSync(fuldDir)) continue;
    for (const fil of readdirSync(fuldDir)) {
      if (fil.endsWith(".md")) leveranceStier.push(`docs/coordination/${dir}/${fil}`);
    }
  }
  if (aktivPakke !== "ingen" && existsSync(join(koordDir, `${aktivPakke}-status.md`))) {
    leveranceStier.push(`docs/coordination/${aktivPakke}-status.md`);
  }

  // Artefakt-opslag (Codex runde 10-fund 1): status-filen er BÆRER, men
  // verdiktet skal fryses til ARTEFAKTET. Pr. deklareret type slås artefaktets
  // egen sidste commit op — den SHA bindes i dispatch-konteksten.
  function artefaktSha(deklType) {
    if (aktivPakke === "ingen" || !deklType) return null;
    if (deklType === "plan-version") return filSha(`docs/coordination/${aktivPakke}-plan.md`, repoRod);
    if (deklType === "build-batch") return git(["rev-parse", "HEAD"], repoRod); // batch = commit-flade
    if (deklType === "slut-rapport") {
      const dir = join(koordDir, "rapport-historik");
      if (!existsSync(dir)) return null;
      const fil = readdirSync(dir)
        .filter((f) => f.endsWith(`-${aktivPakke}.md`))
        .sort()
        .at(-1);
      return fil ? filSha(`docs/coordination/rapport-historik/${fil}`, repoRod) : null;
    }
    return null;
  }

  const leverancer = [];
  for (const sti of leveranceStier) {
    const tekst = readFileSync(join(repoRod, sti), "utf8");
    const erUntracked = untracked.includes(sti);
    const deklaration = parseDeklaration(tekst);
    leverancer.push({
      fil: sti,
      untracked: erUntracked,
      aendret: aendrede.includes(sti),
      // frossen version: artefaktets SHA vinder over bærerens (runde 10-fund 1)
      sha: erUntracked ? null : (artefaktSha(deklaration?.type) ?? filSha(sti, repoRod)),
      deklaration,
      markers: udtraekMarkers(tekst),
    });
  }

  // Gate-ord fra kæde-issue (author + kommentar-id følger med — verifikation i decide())
  let gateOrd = [];
  if (kaedeIssue) {
    try {
      // NB: jq-filteret gives RÅT (Codex runde 9-fund 2: JSON.stringify gjorde
      // det til streng-literal → gh-fejl → catch → tomme gate-ord, stille).
      const raw = gh(
        [
          "issue",
          "view",
          String(kaedeIssue),
          "--json",
          "comments",
          "--jq",
          ".comments[] | {id: .id, author: .author.login, body: .body}",
        ],
        repoRod,
      );
      gateOrd = raw
        .split("\n")
        .filter(Boolean)
        .map((l) => JSON.parse(l))
        .map((k) => ({ id: k.id, author: k.author, tekst: k.body.trim() }));
    } catch {
      gateOrd = []; // issue utilgængeligt → ingen gate-ord; kæden venter (fail-closed)
    }
  }

  // Events: afledte tilstande for den aktive pakke (rå kilder: origin/main + build-PR)
  const pakke = marker?.pakke ?? "ingen";
  const reglerSti = join(repoRod, "scripts/kaede/kaede-regler.json");
  const gateAuthor = JSON.parse(readFileSync(reglerSti, "utf8")).identiteter.gate_author;
  let events = [];
  if (pakke !== "ingen") {
    const mainSha = git(["rev-parse", "origin/main"], repoRod);
    events = afledEvents({
      pakke,
      paaMain: {
        kravDok: paaOriginMain(`docs/coordination/${pakke}-krav-og-data.md`, repoRod),
        planFil: paaOriginMain(`docs/coordination/${pakke}-plan.md`, repoRod),
        rapportFil: false, // rapport-historik/<dato>-<pakke>.md — dato ukendt; afklares ved opslag
      },
      buildPr: fetch ? laesBuildPr(pakke, repoRod) : null,
      gateOrd,
      gateAuthor,
      mainSha,
    });
    // rapportFil: glob-opslag mod origin/main (dato-præfiks ukendt)
    try {
      const rapportFiler = git(
        ["ls-tree", "--name-only", "origin/main", "docs/coordination/rapport-historik/"],
        repoRod,
      );
      if (rapportFiler.split("\n").some((f) => f.endsWith(`-${pakke}.md`))) {
        events = events.filter((e) => e.type !== "build-pr-merged");
      }
    } catch {
      /* rapport-historik findes ikke endnu — events står */
    }
  }

  const divergens = findDivergens([
    {
      felt: `branch-sha (${branch})`,
      kilder: [
        { navn: "lokal", vaerdi: lokalSha },
        { navn: "origin", vaerdi: remoteSha ?? lokalSha }, // upushet branch er ikke uenighed
      ],
    },
  ]);

  return { branch, lokalSha, remoteSha, marker, leverancer, gateOrd, events, aabneGates, divergens };
}
```

DIFF (V13-guards ført til body-niveau): events-blokkens guard `if (pakke !== "ingen")` → qwers-/åbnings-afledning kører ALTID (stående issue læses uanset markør); pakke-events + pr.-pakke-issue (fra status-filens `Kæde-issue:`-linje, ny parser) kun m. aktiv pakke · gateOrd-læsning: stående issue (kaede_issue) ALTID + pakke-issue når aktiv. **V19/V21-tilføjelse (runde 27+29):** leveranceStier udvides m. `docs/coordination/<aktivPakke>-krav-og-data.md` i BEGGE tilstande — untracked (→ transport-commit) OG committed-indtil-behandlet (→ DISPATCH mathias/hash-post næste cyklus, decide()'s normale to-cyklus-flow); type-infereres af filnavns-mønstret → `krav-dok-udkast` (ingen deklaration — dialogens output bærer ingen →NÆSTE). Hash-posten lander på pakke-issuet jf. Rest-klik-afgørelse 2. **BEVARES:** fetch-flag (--offline), branch/SHA-læsning + divergens-par, aktiv-markør-parsing, åbne-gates-scan (AFVENTER MATHIAS), leverance-bærer-listen (codex-reviews/plan-feedback/rapport-historik/status-fil), untracked/aendrede-porcelain-split, artefaktSha-opslag pr. deklareret type, fail-closed tom gateOrd v. issue-fejl. Tab af ét uden begrundelse = M-E-B.

## Step 13a — Protection-state-dump (udført 2026-06-11 på Mathias-mandat)

Admin READ via fælles admin-login; switch-back til bot straks efter (verificeret: `gh auth status` → stork-code-bot aktiv). Rå dump (`gh api repos/Cphsales/stork-2.0/branches/main/protection`, felter ordret — URL-felter udeladt for læsbarhed, intet andet ændret):

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Lint, typecheck, test, build"],
    "checks": [{ "context": "Lint, typecheck, test, build", "app_id": 15368 }]
  },
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "require_last_push_approval": false,
    "required_approving_review_count": 1
  },
  "required_signatures": { "enabled": false },
  "enforce_admins": { "enabled": true },
  "required_linear_history": { "enabled": true },
  "allow_force_pushes": { "enabled": false },
  "allow_deletions": { "enabled": false },
  "block_creations": { "enabled": false },
  "required_conversation_resolution": { "enabled": true },
  "lock_branch": { "enabled": false },
  "allow_fork_syncing": { "enabled": false }
}
```

**Verifikation mod gov-4-forventningerne:** required CI-check "Lint, typecheck, test, build" ✓ · require_code_owner_reviews=true ✓ · dismiss_stale_reviews=true ✓ — alle forventninger SANDE (ingen afvigelses-rapport nødvendig). Strict=true forklarer i øvrigt merge-kø-friktionen (recon E.2): branch skal være ajour + stale-dismiss ved rebase.

**Eksakt 13b-diff (én felt-ændring, alt andet bevares ordret):**

| Felt                                                            | Nu  | Efter 13b |
| --------------------------------------------------------------- | --- | --------- |
| `required_pull_request_reviews.required_approving_review_count` | 1   | **0**     |

Konsekvens: PR der rører CODEOWNERS-ejede stier kræver fortsat code-owner-approval (mgrubak); PR der kun rører rolle-validerede stier kræver 0 menneske-approvals → merger på grøn CI (+ kædens Codex-discipliner). `enforce_admins=true` bevares — ingen bypass-vej, heller ikke for admin. `required_conversation_resolution=true` bevares (note: drift-warning-kommentarer er issue-comments, ikke review-tråde — blokerer ikke).

## Formåls-fejning af alle kæde-led (V8 — roden, ikke kun instansen)

Hvert led holdt mod formålet ("fra åbning til lukning kører alt selv; Mathias kaldes kun ind når afgørelsen er hans"), IKKE mod dagens flow:

| Led                                                    | Formåls-status                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Åbning (qwers, mobil)                                  | ✓ kæde-båret                                                                                                                                                                                                                                                                                  |
| Recon (qwers → recon-klar)                             | ✓ **V8-fixet** — var udenfor kæden (fundets instans)                                                                                                                                                                                                                                          |
| Krav-dok-dialog                                        | ✓ bevidst manuel — KONTROLPOSTEN (formålets egen undtagelse)                                                                                                                                                                                                                                  |
| **Krav-dok-commit/merge efter krav OK**                | ✓ **AFGJORT (Mathias 2026-06-11):** un-ownet PÅ BETINGELSE af versions-binding — "krav OK \<indholds-hash\>" (author-verificeret) skal matche filens aktuelle hash som tilstands-betingelse for merge-dispatch (se Rest-klik-afgørelser). Kan bindingen ikke leveres: klik består (STOP-gate) |
| Plan-fase (rolle-valideret)                            | ✓                                                                                                                                                                                                                                                                                             |
| Build + build-merge                                    | ✓ (rolle-valideret; beslutnings-stier → hans klik = afgørelsen)                                                                                                                                                                                                                               |
| Slut-rapport + slut OK                                 | ✓ (lukning — formålets ord)                                                                                                                                                                                                                                                                   |
| **Pakke-luk-bogføring (arkiv-flytning, doc-currency)** | ✓ **AFGJORT (Mathias 2026-06-11):** `/docs/coordination/arkiv/` un-ownet — bogføring efter slut OK (P3 udvidet)                                                                                                                                                                               |
| gov-6-bevis                                            | ✓ (krav 8)                                                                                                                                                                                                                                                                                    |

Fejnings-regel fremad (roden): enhver ny plan-version holder HVERT led mod formålet før Codex-review — checken er nu del af pre-push-tjeklisten for denne pakke.

## B1-bevarings-verifikation (TILLÆG 2 — verdikter leveret af Codex runde 17, indarbejdet i V10)

| B1-del                                                                                                                                      | Påstand: væknings-agnostisk?            | Codex-verdikt (V8-review)                              |
| ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------ |
| tilstandslæsning + parsere (deklaration/markers/divergens)                                                                                  | JA — læser tilstand uanset kæde-start   | **BEKRÆFTET — bevares** (runde 17)                     |
| transport-commit-isolation (--only)                                                                                                         | JA                                      | **BEKRÆFTET — bevares**                                |
| parallel-eksekvering + kørende-register + låse                                                                                              | JA                                      | **BEKRÆFTET — bevares**                                |
| behandlet-semantik (kun exit 0) + idempotens-nøgler                                                                                         | JA                                      | **BEKRÆFTET — bevares**                                |
| author-verifikation + gate-mekanik (fund-gate/SPOR-PAUSET/GATE-AFGJORT)                                                                     | JA                                      | **BEKRÆFTET — bevares**                                |
| `kaede-regler.json` events-tabel (`qwers-aabning`: "kvittering" → SKAL ændres til recon-igangsætning; `krav-dok-merged`-events composition) | **NEJ — re-åbnes efter V8-godkendelse** | **BEKRÆFTET: re-åbnes** — P7(a)                        |
| `afledEvents` (krav-dok-merged-afledning: "kravDok && !planFil" — holder den når recon-docs ligger FØR krav-dok?)                           | **TVIVL — Codex afgør**                 | **AFGJORT: holder kun betinget** — patch-først i P7(b) |
| event-fixtures (krav-dok-merged/qwers-cases)                                                                                                | **NEJ — omskrives m. V8-semantik**      | **BEKRÆFTET: omskrives** — P7(c)                       |

## End-to-end-test-design (§3.6 + krav 8)

- **Komponent:** routing-fixtures (alle leverance-typer inkl. recon-typer + troskabs-verdikt + mid-fase-tråde + lås + SHA-binding) · `--parse-test` udvidet.
- **Led:** dry-run-gennemløb + ét live led + headless-auth-bevis (step 9) + 11b's tre gate-cases.
- **Fuldt bevis (krav 8, læsning a — TILLÆG 4: dækker den NYE strækning):** gov-6 kører den FULDE flade FRA qwers. Målbart: (1) qwers → recon-kørsler dispatches automatisk (Code+Codex parallelt, derefter Claude.ai-rolle) · (2) recon-leverancer transport-committet + `recon-klar` → Mathias-notifikation uden relæ · (3) krav-dok-dialogen forbliver manuel (kontrolposten — 0 automatiserede krav-dok-skrivninger, verificeret i dispatch-log) · (4) Codex-APPROVAL → krav-troskabs-tjek → PASS → build uden Mathias-klik (TILLÆG 3-leddet fyrede) · (5) alle øvrige vækninger aktør-deklarerede/automatiske · (6) Mathias' handlinger = åbning, krav OK, slut OK + evt. fund-gates ALENE · 0 relæ · 0 bogførings-klik · 0 ubetingede plan/byg-klik. Slut-rapport bærer dispatch-loggen led-for-led; pakke-luk efter.

## Doc-currency (§10.2)

**A. Fundament-validering:** ingen forretnings-intentions-ændring — verificeret current pr. main `437fc8b` mod vision + forretningsforstaaelse. Gate-model-ændringen er PROCES (disciplin), ikke forretnings-intention; disciplin er ikke stamme-doc — ændringen går gennem §8.1 + Mathias' CODEOWNERS-approval (ratificering ved qwerg på denne plan). Ingen intent-ændring.

**B. Status-opdatering (med merge):** aktiv-plan ✓ (flip, step 14) · seneste-rapport n/a · master-plan §4.1 n/a (proces-pakke) · teknisk-gaeld ✓ (G062 noteret) · huskeliste ✓ (H028 noteret) · disciplin Forudsætninger ✓ (P5).

## Åbne punkter (Codex runde 18 + Mathias-re-godkendelse)

1. Step 6 headless-Code STOP-dækning — Codex: blind-vinkler (uændret fra V7).
2. Headless-auth (step 9-bevis før tillid, uændret).
3. **P3-snittets forretnings-linjer** bekræftet ved V7-qwerg; står ved magt medmindre Mathias siger andet ved re-godkendelse.

(Lukket i V9: rest-klik AFGJORT (arkiv un-ownet; krav-dok-merge un-ownet m. versions-binding) · B1-verdikt leveret runde 17 og indarbejdet i P7. Tidligere lukket: V5-prefix · 13a-dump · V7-qwerg. Efter runde 18-APPROVAL: Claude.ai gate-pakke på frossen version → Mathias-re-godkendelse.)
