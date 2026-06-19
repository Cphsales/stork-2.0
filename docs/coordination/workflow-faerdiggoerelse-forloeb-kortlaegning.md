# Workflow-færdiggørelse — forløbs-kortlægning (Step 1)

**Type:** Step 1 — kortlægning af HELE byg-workflowet, bid-for-bid, fra `qwers` til `slut OK`.
**Status:** UDKAST v18 — komplet kortlægning `qwers`→`slut OK`. Klar til Mathias' grundige gennemgang + godkendelse. Krav 5+9-amendementer afventer Mathias. Intet bygges.
**Læs sådan her (anti-træthed):** FORMÅL + 5 principper (nedenfor) → **SENESTE ÆNDRINGER** (kun deltaet) → dyk KUN i de sektioner der er ændret. Ingen grund til at genlæse hele doc'en hver gang.
**Grundlag:** krav-dok (de 11 krav) · vision + forretning (låste) · masterplan. Aftalt krav 5-model står som sandhed via Mathias' ord (PR #178 ikke merget — vi fortsætter uden merge).
**Acceptkriterie for step 1:** alle elementer er med, hvert lille step står konkret, og kæden hænger sammen uden huller (positivt bevist, ikke ved tavshed).

## SENESTE ÆNDRINGER (læs deltaet, ikke hele doc'en)

*Transient læse-stillads — nyeste øverst, ældre beskæres (git har fuld historik). Slettes når step 1 er godkendt.*

- **v18** — anti-træthed: denne delta-log + "læs sådan her" + batch-push (færre versioner) → *toppen*.
- **v17** — auto-fix-makroer (`issue_to_fix_workflow` o.l.) hegnet ude af build-allowlisten → *FASE 6 / default-deny-boks*.
- **v16** — rolle: Codex' bord = kode-vurdering (**blind for Windows-app'en**); Claude.ai = frisk chat pr. gate via skill/GitHub-plugin → *ROLLER / Aktør-noter*.
- **v15** — FASE 9 rettet: arbejdsdoks løbende, repo-docs **efter** build 1:1 fra plan, lukke-PR sletter arbejdsdoks → *FASE 9 / S9.1*.
- **v14** — krav OK = **S3.3** (Mathias sidst = original krav 5); Codex ikke aktiv ved S2.3 → *FASE 2–3*.
- **v13** — gennemgående: **spørg ved uklarhed, antag ALDRIG** → *Gennemgående regler*.

## FORMÅL + BÆRENDE PRINCIPPER

**Formål (skarpt):** Ét byg-workflow der sikrer at **hvert Stork-step bygges korrekt og efter hensigten** — og som er **fri af den vane der ødelagde gov-1…5: at gå med den første løsning der *ser* grøn ud.** Grøn = **reel konsekvens, aldrig påstand.** Workflowet er **fabrikken, ikke varen**; samme workflow genbruges på hver produkt-pakke i masterplanen.

**Fem bærende principper (filteret for hvad der kommer ind):**
1. **Hjælper vs. ser-godt-ud:** *kan en motiveret snyder forfalske eller bypasse det?* Kan han → det ser godt ud (drop). Kan han ikke → det **hjælper**. Vi bygger kun det u-forfalskelige.
2. **Defense-in-depth — ikke-flugtende huller:** ingen mekanisme står alene. Hvert lag har huller; en falsk-grøn slipper kun forbi hvis hullerne i ALLE lag **flugter samtidig**. Sammenhold = medspillere med **forskellige** blinde vinkler.
3. **Non-LLM deterministisk = primær dommer · LLM = input:** alle AI-aktører (Code · Code-reviewer · Codex · Claude.ai) deler LLM-blinde-vinkler (selvsikkert-forkert). Derfor afgøres grøn/rød af det **deterministiske, non-LLM lag** (reel kør · prover-exit · types · DB-constraints · property/fuzz); LLM'er er **input, aldrig sidste ord**.
4. **Lær af hvert mål:** slipper en falsk-grøn igennem (fanget af en medspiller, af dig, eller i produktion), konverteres den til en **permanent canary** — forsvaret bliver stærkere for hver kamp.
5. **Top-til-tå: kode = Mathias' sandhed:** den endelige dom er **reel kode-kør mod din sandhed ved fuld dybde** — ikke at ordene/docs findes (doc-grøn ≠ dybde).

## Læsenøgle (felter pr. step)

- **Aktiveres af** · **Hvem/hvad** · **Aktiverer** · **Gør / samler** · **Skal kunne** (krav-ref) · **Mekanisme** (mekanisk=deterministisk · dømmekraft=bundet til mekanisk gate) · **Anti-snyd** · **→ næste**

Aktør-noter: **Code** = lokal builder/driver (kontinuerlig i fasen) · **Code-reviewer** = FRISK Code-agent m. frisk rolle, til **kode-troskab/dybde-review** (Claude forstår kode langt bedre end app'en — Mathias 2026-06-19) · **Codex** = lokal **cross-vendor** angriber (`codex exec --ephemeral`, xhigh) — bærer uafhængigheden; **bord = kode-vurdering. Usynlig sandhed:** Codex kan IKKE vurdere noget i **Windows-app'en** (claude.ai-app'en — krav-dialog/forretnings-mening lever dér) → **app-siden er blind for Codex**, valideres kun af Mathias + Claude.ai · **Claude.ai** = Mathias' forretnings-partner: krav-medforfatter + Mathias-flade + **forretnings**-menings-troskab (ikke kode-forståelse); **frisk chat pr. gate** — en gate-rolle-**skill** synket gennem **GitHub-plugin** (claude.ai marketplace-sync, bekræftet virker) styrer app'en → ny uafhængig chat ved **alle 3 gates** (krav OK · plan OK · slut OK). **⚙️ Step-2 (skill-verifikation):** et eksisterende skill peger ikke altid rigtigt — verificér hver brugt skill (peger den rette sted?), byg nyt hvor nyt er bedre (**nyt > forkert genbrug**) · **Mathias** = dømme-gates (**krav OK · plan OK · slut OK**) + definerer hensigt (build OK er mekanisk, ikke hans bord).

**Gennemgående: dybde-først-loop + Code-kontinuitet.** Recon og dybde-tjek (S1.x, S7.6) kører en **dybde-først-loop**: *ny info → vurdér → dyk ned (brugbar?) → dyk dybere → ved X nej (dead-ends) → loop til næste info.* **Dybden af et fund giver konteksten, ikke fundet selv** — loopen er **selv-rensende** (dead-ends droppes efter X nej; kun dybt-verificeret bæres frem). Derfor: **Code = kontinuerlig driver inden for en fase** (bærer dybde-kontekst, ikke flade fund), **nulstilles ved fase-nulpunkter** (anti-session-rot). Anti-drift afhænger IKKE af Code's friskhed, men af mekanismerne + de friske uafhængige angribere (Codex `--ephemeral` · Claude.ai `claude -p`) + frisk kontrakt pr. bid. (Loopen er **metode**, ikke en ny mekanisme — tænderne er dybde-meta-canary + prover.)

**Gennemgående: kun Mathias' dømme-gates stopper FOR Mathias** (= **krav OK · plan OK · slut OK**; build OK er mekanisk, S7.9). Kæden kan **halte mekanisk** (fail-closed) når som helst — modsigelse / uadresseret fund / divergens → **HALT = kæden STOPPER med det samme** (bygger IKKE videre; der akkumuleres aldrig et stort u-godkendt build) + durabelt flag på #126. Modsigelser fanges **løbende pr. bid** (diff-bundet, S7.7) → tidligt, ikke efter et stort build. Det **eneste** der udskydes er at **push-afbryde Mathias** (det dræner friskhed, krav 9) — IKKE stoppet, IKKE detektionen: han ser flaget ved sin **næste gate** eller når han selv **pull'er** (#126 / `/remote-control`), dømmer, og derefter retter han + Claude.ai. Mekanisk halt ≠ at afbryde Mathias. Broerne mellem gates er ren transport. **Uløselig krav-/sandheds-modsigelse → plan OG build STOPPES** (terminal, ikke kun halt): kan en modsigelse mod krav/de låste docs **ikke løses**, er plan/build ugyldig og standses, til Mathias (+ Claude.ai) revurderer krav/vision. Halt = midlertidig (mens fix forsøges); STOP = terminal (uløselig).

**Gennemgående: djævlens-advokat skyder med skarpt.** Angriberen står med **krav-doc / kode / recon i hånden** og fyrer **specifikt**, ikke generisk: *"løser du K-7? hvorfor ikke sådan her? har du husket X?"* — målrettet konkrete K-ID'er, kodepunkter, recon-fund. **Guardrail (mod V26-nit-spiral):** hvert skud lukkes **binært** — forsvares med konkret bevis (canary / prover / citat) ELLER indrømmes. Direkte + bevis-krævende, ikke bare højere stemme. **Standard-djævel-metode (A/B-lært 2026-06-19): angriber-lins > compliance-lins.** Den stærkeste djævel spiller en *uærlig aktør der vil snige falsk-grøn forbi* OG **inspicerer den faktiske kode/substrat** (ikke kun dokumentet) — det fanger design↔virkelighed-gabet, hvor en ren compliance-reviewer kun fanger design↔krav.

**Gennemgående anti-tavsheds-regel (Codex #4/#24):** intet step godkendes ved *fravær* af indvending. Hvert gate har et **forventet antal positive, hash-bundne verdikter**; manglende verdikt / timeout / forkert hash = **fail-closed (BLOKER)**, aldrig auto-grønt. Tavshed er ikke et ja.

**Gennemgående læsebevis-regel (Codex #4/#13):** en aktørs verdikt tæller kun hvis det er **indholds-afledt** — bundet til konkrete fund/citater der kun kan komme af faktisk læsning (eller: aktøren henter selv artefaktet via egen kanal, og hentningen ER beviset) + citerer den læste SHA. Bare at *nævne* en SHA tæller ikke (stale/fabrikeret SHA-citat → BLOKER).

**Gennemgående: spørg ved uklarhed — antag ALDRIG (Mathias).** Støder en aktør på en del af **krav eller plan** den **ikke forstår** eller som **skal uddybes** → den **HALTER og spørger** (flag), den **antager aldrig**. Business-/bord-spørgsmål → til Mathias (ved hans rytme, jf. kun-gates-stopper-ham); teknisk uklarhed → til den relevante ejer. **En antagelse om en uklar krav/plan = en drift-kilde = forbudt.** Uafklaret → ingen videre-byg før spørgsmålet er besvaret. (Anti-snyd: bygget oven på en uafklaret/antaget tolkning → FAIL.)

---

## FASE 0 — Åbning

### S0.1 — qwers
- **Aktiveres af:** Mathias. **Hvem/hvad:** Mathias skriver `qwers <anker>` på #126 — **anker = pakke-navn (masterplan-trin) ELLER doc-navn fra `teknik/`** (når det er gæld eller nyt uden for planen der skal bygges). **Aktiverer:** Code-terminal åbner pakken.
- **Skal kunne:** starte workflowet med ÉN prompt (krav 9). **Mekanisme:** issue-event + author-verificering (kun `mgrubak`).
- **Anti-snyd:** forkert author → IGNORÉR (fail-closed). **→** S0.2.

### S0.2 — Dirigent dispatcher
- **Aktiveres af:** #126-event. **Hvem/hvad:** **Code-terminal** (ikke en separat dirigent-maskine — Code-terminal er miljøet for **både åbning (FASE 0) og recon (FASE 1)**; ingen separat transport imellem). **Aktiverer:** de tre lokale AI-aktører.
- **Gør:** binder ankeret til et **hash-bundet udgangspunkt — masterplan-trin ELLER `teknik/`-doc** (gæld / nyt uden for planen) + sætter read-only recon-mode. **Skal kunne:** aktivere ALLE tre deterministisk (krav 9); recon-scope kommer fra **ankeret** (masterplan-trin eller teknik-doc), da krav ikke findes endnu for en ny pakke.
- **BRO 0→1 (masterplan-anker):** ankeret ER broen mellem åbning og recon — recon (FASE 1) digger FRA ankeret + de låste vision/forretning + nuværende kode, ikke fra et gæt. Det gør 3-bøtten meningsfuld (hvad-skal-være vs. hvad-er).
- **Mekanisme:** deklarativ event-transport, fail-closed. **Anti-snyd:** ikke alle tre aktiveret → FAIL; transport auto-validerer → FAIL; **forkert/manglende masterplan-anker → integrations-canary fanger (recon kører ikke på vilkårlig flade).** **→** S0.3.

### S0.3 — Aktørerne vågner (frisk)
- **Hvem/hvad:** Code · Codex (`--ephemeral`) · Claude.ai (`claude -p`), hver frisk/statsløs. **Aktiverer:** frisk load af workflow-rolle-tekst.
- **Skal kunne:** to rolle-typer pr. AI (workflow/almindelig); **Mathias skifter aktiv rolle via ÉN simpel prompt** (krav 7) — et rolle-ord der loader den rette skill (workflow vs. almindelig).
- **Mekanisme:** rolle-skift-prompt → skill-load + **capability-tjek ved session-start** (`/skills`/`/doctor`) + hook der garanterer rigtig rolle/freshness (forkert/manglende → fejl højt).
- **Anti-snyd:** forkert-rolle-kanariefugl (forkert rolle → afvis/fejl højt); manglende capability → fejl højt. **→** S1.x.

---

## FASE 1 — Recon (FØR krav)

### S1.1 + S1.2 — 2× kode-recon (Code + Codex)
- **Hvem/hvad:** Code og Codex laver hver **uafhængig kode-recon** (ikke angreb — koden er stor/kompleks, to cross-vendor-recons giver bedre dækning).
- **Gør / samler:** fund i recon-output-skema `{kilde, kategori, emne, evidens-ref, aktør, klassifikation}`.
- **Skal kunne:** fuld recon over **kode + docs (din sandhed)** + aktørernes egne indstillinger (capability-info). **IKKE nettet (Mathias):** web i recon skaber **forvirring + nye forkerte sandheder**. Kortlæg HELE scope. **Mekanisme:** read-only + grundig-recon-kontrakt + `--ephemeral` (Codex).
- **RECON-DYBDE — tre u-forfalskelige anchors (dybde BEVIST, ikke påstået):**
  1. **Dybde-canary** *(meta-canary for recon):* plant et kendt DYBT forhold i koden → recon SKAL surface det, ellers FAIL. (Beviser ikke at ALT blev fundet, men at den ville finde et plantet dybt forhold.)
  2. **Evidens-trace pr. fund:** hvert fund citerer konkret kode-lokation (fil:linje/symbol); intet citat = overfladisk = FAIL. Dybde = sporbar, ikke påstand.
  3. **Deterministisk scope (non-LLM):** statisk analyse udleder de berørte symboler/filer → recon skal gøre rede for HVERT; "dækkede recon X?" er **mekanisk**, ikke LLM-skøn.
- **Loop-bund:** dybde-først-loopet dykker til de tre anchors passerer — IKKE til LLM'en *føler* sig færdig.
- **Anti-snyd:** stopper-for-tidligt/uden kilde → FAIL · web som recon-kilde → FAIL · fund uden evidens-trace → FAIL · berørt symbol ikke gjort rede for → FAIL. **Residual:** ukendt-ukendt-komplethed forbliver irreducibel (du + forretnings-recon fanger). *(Coverage-matrix forretningsdele × viewpoints = bredde-laget; den deterministiske scope er den hårde version. Web kun i separat capability-discovery, verificeret — aldrig i pakke-recon.)* **→** S1.4.

### S1.3 — Docs-/forretnings-recon (Claude.ai)
- **Hvem/hvad:** Claude.ai (`claude -p`). **Gør:** læser vision/forretning/masterplan-relevante dele/krav-historik/Mathias-afgørelser.
- **Skal kunne:** ramme "hvad Stork skal være" (krav 4) — **forretnings-/docs-kontekst, IKKE dybden.** Claude.ai's recon-grundighed/dybde er svag (Mathias); **dybden + grundigheden kommer fra Code/Codex' 2× kode-recon + coverage-matrix + omission-angreb** (S1.1/S1.2/S1.5), der backstopper. **Anti-snyd:** recon uden dokument-recon → FAIL; Claude.ai-recon taget som dybde-kilde → FAIL. **→** S1.4.

### S1.4 — Konsolidering til ÉN sandhed
- **Aktiveres af:** alle tre recons færdige (positivt — anti-tavshed). **Aktiverer:** angrebs-funktionen (først NU).
- **Gør / samler:** fletter de tre recons → **ÉN committet, hash-bundet recon-sandhed**.
- **Skal kunne:** ingen pakke på divergent grundlag; alle binder til recon-hash (krav 4).
- **Mekanisme:** mekanisk fletning + hash-binding. **Konflikt-bevaring HÅRD (Codex #5):** divergenser mellem aktør-recons **bevares eksplicit** (ikke dedupet væk); kun *ægte dubletter* dedupes; støjbudget må aldrig kassere en uenighed. Kasseret/ikke-bevaret divergens → BLOKER.
- **Anti-snyd:** u-konsolideret/divergent recon → BLOKER; aktør bundet til anden recon-version → BLOKER. **→** S1.5.

### S1.5 — Omission-angreb (første brug af angreb)
- **Hvem/hvad:** Codex (angriber). **Gør:** finder hvad reconen MISSEDE på den konsoliderede sandhed.
- **Mekanisme:** adversarisk review + coverage-mapping. **Anti-snyd:** fund → tilbage til S1.4; residual ukendt-ukendt navngives ærligt. **→** FASE 2 (S2.0). *(Her slutter recon-fasen: ÉN hash-bundet recon-sandhed.)*

---

## FASE 2 — Krav (åbnes med recon-præsentation · Mathias + Claude.ai på app'en)

### S2.0 — Claude.ai-app bygger lokal projekt-kontekst
- **Aktiveres af:** recon-sandhed klar (FASE 1). **Hvem/hvad:** Mathias åbner Stork 2.0-projektet i Claude.ai-app'en (ny chat).
- **Gør / samler:** app'en bygger en **lokal repo** af **(a) jeres docs** (synket fra GitHub) + **(b) Mathias↔Claude.ai-chatsene** i projektet (chat-beslutninger) + **(c) den konsoliderede recon-sandhed** (hash-bundet). = Claude.ai's kontekst til krav.
- **Skal kunne:** Claude.ai har docs + chat-historik + recon frisk, uden manuel paste (chat-recon-kilden, krav 2).
- **Mekanisme:** **GitHub-adgang + auto-opdatering ved PR (bekræftet virker — Mathias 2026-06-19)** synker docs; app'ens projekt-chats er native; **recon-sandhed-hash ind.** App'en **TILFØJER ikke recon-dybde** — den **konsumerer** den allerede-dybe, committede recon-sandhed (dybden er Code/Codex' i FASE 1; Claude.ai's egen recon-grundighed/dybde er svag → backstoppet).
- **KRITISK led (Mathias): fejler dette handover, er FASE 1's recon spildt.** Værn: recon-sandhed er **committet/durabel** → går IKKE tabt hvis app-session fejler (re-synkes). App'en SKAL **verificere binding til recon-hash'en FØR krav** — binder den ikke (stale/forkert/overfladisk) → **HALT** (krav skrives aldrig på tabt/overfladisk recon; recon gen-køres ikke, re-synkes blot).
- **Anti-snyd (Codex #8):** stale/forkert sync → synlig fejl, ikke tavs gammel kontekst. **→** S2.1.

### S2.1 — Recon præsenteres for Mathias (3-bøtte) — FASE 2's åbning
- **Hvem/hvad:** Claude.ai oversætter den konsoliderede recon; Mathias validerer eller spørger.
- **Gør:** "**Pakken berører disse forretningsdele**" i tre bøtter (verbatim krav 6-formen):
  - **Nuværende kode:** "x er bygget på denne måde i koden — er det korrekt?"
  - **Ikke bygget endnu / dokument-info:** "pakken bygger x, og dokument y siger dette — er det korrekt?"
  - **Intet data:** "pakken berører x, og der er intet data — hvad skal x kunne?"
- **Skal kunne:** Mathias dømmer forretning, ikke kode (krav 6); recon i præcis tre kategorier; validér ELLER spørg. **Scope (Mathias): KUN pakke-relevant** — ingen støj, kun hvad pakken berører. **Komplethed på dit bord (Mathias): HVERT forretnings-/bord-område pakken berører SKAL valideres** — intet sprunget over.
- **Mekanisme:** Mathias-komm-kontrakt + recon-præsentationskontrakt; bundet til **recon-hash**. **Hvert berørt bord-område udledes fra den deterministiske recon-scope** (anchor #3, S1.1/S1.2) → mappet til et forretnings-område → SKAL i 3-bøtten. **Anti-snyd:** berørt bord-område der ikke præsenteres for Mathias → FAIL (ufuldstændig validerings-flade); ikke-pakke-relevant støj → trim.
- **Anti-snyd:** kode til Mathias → FAIL; ikke-3-kategori → FAIL. **Handover-binding (Codex #7):** hvert recon-fund får en **disposition** (behandlet i krav / udskudt / ikke-relevant), bundet til recon-hash → senere gates kan bevise at intet fund blev sprunget over. **→** S2.2.

### S2.2 — Krav skrives (kun HVAD)
- **Hvem/hvad:** Mathias + Claude.ai. **Gør:** krav-doc med **funktioner tydeligt beskrevet ved HVAD de skal kunne** + acceptkriterie + krav-ID. HVORDAN = Code/Codex' bord, ikke i kravet.
- **Skal kunne:** Claude.ai medforfatter + build-vs-ønsker-sammenligning (krav 2); forretnings-sprog (krav 6).
- **Mekanisme:** krav-medforfatter-kontrakt; krav holdt mod LÅSTE vision/forretning ved SKABELSE. **Recon-binding (Codex #7):** krav-doc binder til recon-hash; hvert recon-fund skal være disponeret.
- **Anti-snyd:** krav driver fra vision/forretning → FEEDBACK; kode i kravet → hører ikke hjemme; krav-ID uden acceptkriterie → FAIL. **→** S2.3.

### S2.3 — Krav færdiggøres + Claude.ai uploader (krav OK kommer SIDST, S3.3)
- **Hvem/hvad:** Mathias + Claude.ai. **Gør:** Mathias + Claude.ai **færdiggør** krav-doc; Claude.ai **uploader**. **Ingen krav OK her** — Mathias' godkendelse er SIDST (S3.3, efter Code/Codex). **Codex er IKKE aktiv her** (kun Code aktiverer Codex, og ikke for så små opgaver).
- **Mekanisme + anti-snyd:** **hash-binding** — det Mathias+Claude.ai færdiggjorde har en konkret hash; **upload skal matche den hash** (Claude/app kan ikke regenerere/ændre en anden version ind uden at kæden ser det). Mathias' ord overruler altid (krav 5). **→** S3.x.

---

## FASE 3 — Krav-godkendelse (positivt indvendings-vindue)

### S3.1 — Upload trigger kode-aktørerne
- **Hvem/hvad:** GitHub Action → Code (+ Codex via Code), bundet til krav-hash via egen kanal.
- **Skal kunne:** ekstern aktivering, kører selv (krav 9). **Mekanisme:** GitHub event→Action; committet artefakt uforfalskeligt.
- **Anti-snyd:** aktør uden egen læsekanal (citeret SHA) → gate BLOKERET. **⚙️ Step-2 (Codex #9):** runner-/auth-/workspace-/artefakt-protokol så cloud-event og lokal aktør beviseligt rammer SAMME krav-hash. **→** S3.2.

### S3.2 — Djævel + POSITIVT verdikt
- **Hvem/hvad:** Code + Codex (krav-buildability-review). **Gør:** vurderer kravet ad ÉN akse — **"kan det lade sig gøre at kode?"** + **er der huller?** (gaps/uklarheder der blokerer kodning). De dømmer IKKE forretnings-merit (Mathias + Claude.ai's bord). **Afvis KUN ved NEJ (ikke kodebart) eller HUL** — ellers positivt verdikt.
- **Skal kunne:** Code/Codex ejer buildability (deres bord); krav-huller fanges af dem, ikke Mathias (krav 3/5). **Fire-aktør-dækning (krav 5, Codex-brud #3):** Mathias + Claude.ai (pre-upload, S2.3) + Code + Codex (her) = alle fire godkender kravet; Claude.ai's godkendelse ER pre-upload-trinnet.
- **Mekanisme + anti-snyd (Codex #4/#24):** **begge aktører skal afgive et positivt, hash-bundet verdikt** ("ingen indvending" ELLER konkret fund) bundet til krav-hash + djævel-artefakt. **Manglende verdikt / timeout / forkert hash = BLOKER** (fail-closed). Ingen indvending betyder her: *begge har positivt registreret det* — ikke tavshed. Indvending → tilbage til Mathias (+ Claude.ai retter). **→** S3.3.

### S3.3 — krav OK (Mathias SIDST — gate-state)
- **Hvem/hvad:** **Mathias' krav OK SIDST** — efter de tre AI har clearet (Claude.ai-medforfatter S2.2 + Code+Codex buildability S3.2) = **original krav 5** ("Mathias godkender sidst, efter de tre andre"). + dirigent (registrering). **Gør:** gate-state `krav-laast`; krav-hash = immutable gatet identitet.
- **Mekanisme:** committet gate-state + dirigent læser `gate_ord` (`krav OK` findes). **Anti-snyd:** spring uden registreret ord → blokeret; krav OK før de tre AI har cleared → BLOKER. **→** S4.x.

---

## FASE 4 — Plan (kode-recon FØR plan, så plan)

### S4.1 — Kode-recon #2 (før plan)
- **Hvem/hvad:** Code + Codex (2× kode-recon, mod krav-hash). **Gør:** kodepåvirkning + dokument-recon (krav + vision/forretning + masterplan + **repo-sandheds-inventory**) → konsolideret recon-sandhed-2.
- **Skal kunne:** plan passer vision+forretning+krav, ikke kun koden (krav 4).
- **Anti-snyd:** kode-recon mangler før plan → FAIL. **⚙️ Step-2 (Codex #10):** "repo-sandheds-inventory" defineres som et hash-bundet led i kæden (hvor det kommer fra, hvordan det valideres) — ikke en antaget ekstern dependency. **→** S4.2.

### S4.2 — Plan skrives (hele kæden, 1:1 med build)
- **Hvem/hvad:** Code skriver; Codex angriber. **Gør:** plan-kontrakt, hele kæden gennemtænkt; **bid-opdeling besluttes HER** — og **planen definerer repo-doc-teksten 1:1** (masterplan/tekniske), så den efter build kun **anvendes**, ikke fabrikeres (krav 8 / H).
- **Bid-opdelings-kontrakt (build-biderne vurderet korrekt + logisk i planen):** hver bid navngiver (a) hvilke `K-n`/løfter den leverer · (b) afhængigheds-orden (ingen bid afhænger af en senere) · (c) en størrelse dens prover KAN bevise · (d) sin canary up-front. **Codex angriber opdelingen:** ulogisk orden / hul mellem bids / ikke-bevisbar bid / for stor bid → BLOKER. Gyldig FØRST når hver bid er bevisbar OG bid-kæden dækker alle `K-n` uden huller.
- **Skal kunne:** **plan 1:1 med build**; hver funktion → test der følger tråden til slut-effekt (ikke artefakt-eksistens).
- **Mekanisme:** ingen-byg-før-plan-OK via **hook** (PreToolUse exit-2); **krav-ID-matrix** (`K-n` → step + test) + **løfte↔bevis-bijektion**.
- **Anti-snyd:** byg før plan OK → hook BLOKERER; `K-n` uden step/test → FAIL; plan-løfte uden canary → rød; build uden plan-løfte → "rogue". **Canary-styrke (Codex #11):** en canary tæller kun hvis den tester **slut-effekt** (ikke triviel eksistens); reviewer + dybde-meta-canary vurderer styrke (residual dømmekraft, se "svage led"). **→** S4.3.

### S4.3 — Troskabs-angreb på planen
- **Hvem/hvad:** **frisk Code-reviewer** (kode-/plan-troskab — forstår koden) + **Codex** (cross-vendor angreb) + **Claude.ai** (forretnings-menings-troskab mod vision/forretning). **Gør:** finder hvor plan modsiger krav / krav modsiger vision; overclaim; teknik-forklædt-som-kravopfyldelse.
- **Skal kunne:** **Code/Codex ejer at deres plan/kode leverer hensigten** (deres bord); Claude.ai kryds-tjekker forretnings-meningen; Mathias endelig.
- **Mekanisme:** kode-troskab (frisk Code-reviewer) + cross-vendor angreb (Codex) + Claude.ai sætning-for-sætning mod låste docs (forretning); **troskabs-meta-canary** (plant modsigelse → SKAL fanges). **Anti-snyd:** uadresseret troskabs-fund → BLOKER (positivt verdikt krævet). **→** S5.x.

---

## FASE 5 — Plan-gate

### S5.1 — Plan frosset + binding
- **Hvem/hvad:** plan frosset som plan-SHA. **Uafhængige tekniske verdikter:** frisk Code-reviewer (kode-troskab) + Codex (cross-vendor) binder til plan-SHA + krav-hash **via egen kanal med citeret SHA**; djævel-pass FØR. **Claude.ai binder samme plan-SHA** (læser samme plan), men dens rolle er forretnings-mening + at være HOS Mathias ved gaten (ikke en separat dommer).
- **Gør:** de tekniske verdikter (Code-reviewer + Codex) afgives positivt og hash-bundet før gaten.
- **Skal kunne:** kumulativ kæde-troskab — plan⊨vision+forretning+krav (krav 2).
- **Mekanisme:** plan-SHA-binding + gate-check (approval matcher SHA) + stale-stop. **Anti-snyd:** stale-SHA → BLOKER; verdikt uden citeret SHA → BLOKER; manglende verdikt/timeout → fail-closed. **→** S5.2.

### S5.2 — plan OK (gate-state)
- **Hvem/hvad:** **Mathias sidst — MED Claude.ai ved sin side** (partner/oversætter; 2v2-menneske-siden, ikke en separat dommer). **Gør (flow som krav-gaten):** **Claude.ai OK først** (forretnings-mening) → **Mathias vurderer + giver `plan OK`** → gate-teksten skrives i docs → **GitHub-trigger → Code aktiveres**; gate-state `plan-laast`. **`plan OK` autoriserer build** — intet bygges før plan OK (default-deny hook). Build kører herefter (FASE 6); **`build OK` er MEKANISK** (build⊨plan 1:1, S7.9) — IKKE en Mathias-gate (build er ikke dit bord når det er tro mod den godkendte plan). **Modsigelse mod krav/vision/forretning → kæden halter; uløselig → terminal STOP af plan+build** (jf. gennemgående regel).
- **Mekanisme:** committet gate-state + dirigent (**⚠️ forudsætning: `plan OK` afstemt ind i `gate_ord` — mangler i dag**). **Anti-snyd:** AI retter aldrig selv en modsigelse mod styrende docs. **→** S6.

---

## FASE 6 — Build (bid-for-bid pr. skive)

> Autoriseret af **`plan OK`** (intet bygges før plan OK). **Default-deny hook (Codex #2/#14):** før plan OK er KUN eksplicit tilladte tool-kald lovlige; alt andet (shell/fil-skrivning/scripts/formattere) blokeres — IKKE en omgåelig blocklist; `gate_ord`↔`gate-def` divergens → BLOKER (⚙️ step-2: konkret allowlist). **Auto-fix/“issue→PR”-makroer (fx `issue_to_fix_workflow`) er ALDRIG i allowlisten:** en fix-PR genereret direkte fra en problem-beskrivelse springer hele den gatede kæde over (krav→plan→prover→troskab) = præcis falsk-grøn-generatoren → BLOKER. **`build OK` kommer FØRST EFTER build** (S7.9) — ellers lå plan OK og build OK ryg-mod-ryg uden aktivitet imellem (Mathias 2026-06-19). *(Build-bid-stepsene beholder S7.x-mærker; renummerering = step-2-kosmetik.)*

### S7.1 — Friskhed pr. bid
- **Hvem/hvad:** Code + freshness-skill. **Gør:** loader tynd pakke-kontrakt frisk.
- **Mekanisme + anti-snyd (Codex #15):** kontrakten er **hash-bundet** (pakke + krav-hash + plan-SHA + bid-ID), ikke kun "present" — forkert/gammel kontrakt der er "present" → fail (ingen falsk friskhed). **→** S7.2.

### S7.2 — Codex skriver angrebs-spec FØR byg (HÅRD gate)
- **Hvem/hvad:** Codex. **Gør:** definerer "done" op-front = de hårde canaries skiven skal overleve.
- **Mekanisme + anti-snyd (Codex #16):** **byg-tool-kald uden registreret angrebs-spec for bid'en → hook BLOKERER** (ikke bare "ingen defined done"). Hård gate. **→** S7.3.

### S7.3 — Code bygger skiven
- **Hvem/hvad:** Code. **Gør:** bygger for at dræbe canaries; HVORDAN er Code's bord, men koden skal levere kravets HVAD efter hensigten.
- **Skal kunne:** funktioner skal VIRKE, ikke kun se gode ud (krav 1). **Build-fokus (Mathias): fokus under build SKAL være build.** Ændringer der opstår → **større issue = gæld** (løses KORREKT senere, ikke hurtigt/hacket) · **mindre = bilag** for ændringen. Kun arbejdsdoks/worklog løbende; repo-docs røres ikke her (se FASE 9).
- **Anti-snyd (Codex #17):** **Code må IKKE ændre prover, hooks, gates, fixtures eller canary-defs** (sine egne målepunkter) — uautoriseret ændring af måle-laget → hook BLOKERER/STOP. Byggeren kan ikke flytte egne mål. **→** S7.4.

### S7.4 — Codex angriber forrige skives reelle kør (async)
- **Hvem/hvad:** Codex (lokal, `--ephemeral`), parallelt. **Gør:** adversarisk review + snydevej-check på reel kør (via #126).
- **Mekanisme:** pipeline — N bygger på N-1's **prover-grønne** base (ikke ubevist grundlag); Codex' adversariale angreb på N-1 kører **async som en anden gate**. **Anti-snyd (Codex #10/#18):** finder det sene angreb en fejl i N-1 → **cascade-STOP/rewind** der også invaliderer N. Altså: byg på prover-grøn, aldrig på uafsluttet. **→** S7.5.

### S7.5 — To-sidet prover (model-frit verdikt)
- **Hvem/hvad:** prover (deterministisk, ingen model); Codex planter, Mathias ser rød.
- **Gør:** reel kør der **(a) går RØD på den plantede hårde (dybe) fejl OG (b) GRØN på baseline** — samme kør.
- **Skal kunne:** grøn = reel konsekvens (krav 3). **Mekanisme:** to-sidet bevis + **meta-canary** + **CI mod RIGTIGE committede artefakter, ikke fixtures** (Build 1's synd).
- **Non-LLM = primær dommer (princip 3):** grøn/rød afgøres af det **deterministiske, non-LLM lag** — reel kør · prover-exit · types · DB-constraints · property/fuzz. **LLM-aktører (Code/Codex/Claude.ai) er INPUT, aldrig sidste ord** (de deler blinde vinkler; den deterministiske dommer har andre). Promovér de eksisterende deterministiske checks (fitness/RLS/constraints/real-CI) til primær dommer; **køb property-based + fuzz** som nykøb.
- **Prover-isolation (Codex #3/#19 — Mathias-dom: Codex kan få skrive):** **Codex ejer + har SKRIVE-adgang til prover + canaries + angrebs-spec** (måle-laget); **Code har INGEN skrive-adgang til sit eget måle-lag** (prover/hooks/gates/fixtures). Den der måler ≠ den der bygger — *håndhævet*, ikke en regel. **⚙️ Step-2:** præcis permissions/CI-isolation. **Anti-snyd:** prover der ikke kan gå rød → meta-canary; syntetisk bevis → forbudt. **→** S7.6.

### S7.6 — Dybde-tjek (krav bid-for-bid ned gennem hele koden)
- **Hvem/hvad:** Code + Codex (deres bord). **Gør:** tager kravet **bid for bid** og løber **ned gennem hele koden** til slut-effekt — ikke kun første lag.
- **Mekanisme:** test-dybde-kontrakt; **SHA-bundet dybde-artefakt pr. krav** + **dybde-meta-canary** (fejl plantet DYBT → SKAL fanges, ellers kiggede tjekket kun på lag 1).
- **Anti-snyd:** "doc-/første-lags-check grøn" beviser ikke funktion → afvises. **Residual (Codex #20):** fuld gren-/sti-dækning kan ikke gøres rent deterministisk — dybde-meta-canary + (⚙️ step-2) coverage-kriterier mindsker det; rest = dømmekraft (se "svage led"). **→** S7.7.

### S7.7 — Kontinuerlig troskab (build ⊨ hele kæden)
- **Hvem/hvad:** **frisk Code-reviewer** (kode-troskab) + **Codex** (cross-vendor) + **Claude.ai** (forretnings-mening). **Gør:** build⊨plan · plan⊨krav · krav⊨vision/forretning, diff-bundet ved hver ændring.
- **Skal kunne:** tro hele vejen (krav 2); modsigelse → **kæden HALTER + flag på #126** (Mathias kaldes ikke ind mid-stream — han pull'er / ser ved gate, jf. gennemgående regel).
- **Mekanisme:** diff-bundet re-validering + troskabs-meta-canary; **always-on-floor** scaler aldrig ned. **→** S7.8.

### S7.8 — Loop-driver + fix-loop
- **Hvem/hvad:** `/loop` (intra-bid driver), Code. **Gør:** grøn+bevist → advance; fejl → afgrænset fix-loop (`/loop` driver, bound = `/goal` "stop efter N", **hård success = proveren**); uløst → `/rewind` + eskalér.
- **Mekanisme:** `/loop` (bundlet skill — capability-tjek) + `/goal` turn-cap + `Stop`-hook (hård) + prover som success. **Anti-snyd:** loop der stopper på egen blød "done" → forbudt; success ER proveren. **→** S7.9 (når alle skiver er bygget).

### S7.9 — build OK (MEKANISK — ikke Mathias' bord)
- **Hvem/hvad:** **ingen Mathias-dom.** Er build 1:1 med den godkendte plan, har Mathias intet at godkende (HVORDAN = Code/Codex' bord). **`build OK` = den maskinelle bekræftelse af `build ⊨ plan` 1:1** (løfte↔bevis-bijektion + alle skivers prover grønne + troskab), **meta-canary-bevist** så 1:1-checket ikke selv kan være falsk-grøn.
- **Gør:** verifikationen passerer → gate-state `build-laast` **auto-sættes** → **GitHub-trigger → acceptance**. Mathias kan SE/pull'e (#126) men gater ikke.
- **Skal kunne:** byggeren har intet at "godkende" hos Mathias når build er tro mod den godkendte plan (krav 2 + Mathias-dom 2026-06-19). Aktivitet plan OK→slut OK = build + acceptance (ingen tom dobbelt-godkendelse).
- **Mekanisme + anti-snyd:** committet gate-state, auto-sat KUN når bijektion + alle prover + troskab er grønne (**⚠️ `build OK` afstemt ind i `gate_ord` — mangler i dag**); manglende/rød verifikation → ingen build OK. **NB krav-amendement:** krav 9 har build OK som Mathias-gate → rettes til mekanisk (dit ord overruler). **→** FASE 8 (acceptance).

---

## FASE 8 — Acceptance / slut-gate

### S8.1 — Fuld-kæde reel kør
- **Hvem/hvad:** Code + Codex; prover. **Gør:** hele kæden på reel committet testpakke **UDEN fixtures**; alle hårde canaries døde; **integrations-canary** (plantet brud i en håndover SKAL fanges).
- **Skal kunne:** beviser gearene griber ind i hinanden. **TOP-TIL-TÅ: kode = Mathias' sandhed (Mathias 2026-06-19):** den ultimative test kører HELE kæden top-til-tå og verificerer at **koden faktisk leverer din sandhed** (krav/vision/forretning) ved **fuld dybde** — IKKE at ordene/docs er til stede. *Doc-/ordret-checks er altid grønne (ordene ER der); dybde/kontekst kan mangle — derfor er den reelle kode-kør dommeren, ikke teksten.*
- **Anti-snyd (Codex #21):** **kriterier for "reel" testpakke** — committet, afledt af *faktisk* brug/data, IKKE skrevet til at tilfredsstille workflowet; en omdøbt fixture tæller ikke. (⚙️ step-2: konkrete reel-kriterier.) Ufanget canary / kun-ordret-grøn (dybde mangler) → BLOKER. **→** S8.2.

### S8.2 — slut OK
- **Hvem/hvad:** Code + Codex + Claude.ai (slut-troskab) → Mathias sidst. **Gør:** slut⊨vision+forretning+krav+plan; **krav-rammen tjekkes opfyldt** (alle `K-n` leveret + bevist = "v5 færdigt"); Mathias `slut OK`.
- **Mekanisme:** committet gate-state; promise↔proof-bijektion lukket. **Anti-snyd:** krav-rammen ikke fuldt opfyldt → ikke slut OK. **Residual (Codex #22):** en internt komplet bijektion kan stadig være *eksternt* forkert (krav forkert splittet/udvandet) — fanges ikke rent mekanisk; **Mathias + Claude.ai menings-troskab er den ultimative fangst** (se "svage led"). **→** S9.

---

## FASE 9 — Doc-spor (arbejdsdoks løbende · repo-docs efter build, 1:1 fra plan)

### S9.1 — Repo-docs efter build, 1:1 med planens tekst (Mathias)
- **Under build (FASE 6):** kun **arbejdsdoks** (worklog/status/bid-trace) føres løbende. **Repo-docs røres IKKE under build** — det er farligt; **fokus under build SKAL være build.**
- **Build-ændringer:** opstår der ændringer under build → **større issue = gæld** (logges, løses KORREKT senere, ikke hurtigt/hacket) · **mindre = bilag** for ændringen (registreret). Build-fokus bevaret.
- **Efter build:** Code opdaterer **repo-docs (masterplan + tekniske) 1:1 med tekst FRA PLANEN** — IKKE fabrikeret. Teksten blev besluttet + godkendt ved plan OK; den **anvendes** nu (krav 8 OK: ingen NY dokumentering oven på valideringen — kun forud-godkendt plan-tekst påføres). Masterplan opdateres pr. pakke (krav 10).
- **Lukke-PR (rent repo, krav 8):** den lukkende PR (Code bestemmer/opretter) **sletter arbejdsdoksene** (worklog/status/bid-trace) — **alt står i PR'en** (commits + git-historik = det permanente spor). Arbejdsdoks var transient stillads; main efterlades **rent** = det fulde spor, ikke efterladt skrald.
- **Anti-snyd:** repo-doc-tekst der IKKE er 1:1 fra planen (fabrikeret efter build) → FAIL; **arbejdsdoks efterladt i repo efter lukke-PR → FAIL** (ikke rent); masterplan-diff = **Mathias-gate** (krav 10); **sandheds-docs (vision+forretning) rettes ALDRIG** (mappe-hook); konkurrerende aktiv sandhed → BLOKER. **→** pakke lukket.

---

## ROLLER + AKTIVERING (pr. aktør: rolle · grænse · hvad-gør-rød · kanal · skill)

Hver AI-aktør har **to rolle-typer** (workflow / almindelig, krav 7) og **én egen skill** (rolle-tekst, frisk-loadet pr. bid). *Flere skills mangler i dag — markeret "bygges".*

| Aktør | Rolle / grænse | Hvad gør den rød | Aktiverings-kanal | Skill |
|---|---|---|---|---|
| **Mathias** | Dømme-gates (krav/plan/slut OK) + definerer hensigt. Eneste dommer. | — | `qwers`/gate-ord på #126 (author-verificeret) + pull (#126/`/remote-control`) | — |
| **Code** | Builder/driver (kontinuerlig i fasen); ejer at koden leverer hensigten + **bestemmer/opretter PR**. Aldrig dømmekraft over eget måle-lag. | rører prover/hooks/gates · bygger før plan OK · falsk-grøn | **Code-terminal** (åbning+recon) + GitHub-Action på #126 | **bygges** (rolle+freshness) |
| **Code-reviewer** | FRISK Code-agent, frisk rolle: kode-/dybde-troskab (build⊨plan). | overser dyb fejl (dybde-meta-canary) | frisk session pr. review (≠ byggerens) | **bygges** |
| **Codex** | Cross-vendor angriber; ejer prover+canaries+angrebs-spec. **Afgiver positivt verdikt (clearance) ved krav/plan/slut** (krav 5) — dømmer ikke som autoritet, men bidrager sin aktør-godkendelse. | resumed/stale session · ikke-skarpt angreb · tavshed-som-ja | `codex exec --ephemeral` — **kun Code aktiverer Codex, kun ved reelt behov (ikke små opgaver)** | **bygges** (`stork-adversarial-review`) |
| **Claude.ai** | Mathias' forretnings-partner: krav-medforfatter + Mathias-flade + forretnings-mening. Ikke kode. | kode-vurdering (Codex' bord) · usynlig sandhed | app (Mathias' hånd) + `claude -p` (recon-rolle) | `claude-ai/SKILL.md` (findes) |

**Aktivering — to spor:** (1) **lokalt** (dirigent · `codex exec` · `claude -p`) til recon + build; (2) **GitHub-Action på #126-event** (krav-upload · gate-ord) → committet artefakt. Begge author/SHA-bundet.

## RØDE TRÅD + KONTROL-DOK (hvordan forløbet holdes tro)

Den røde tråd (vision = forretning = krav = plan = slut) holdes på **tre niveauer:**
1. **Pr. handling — lokal disciplin:** hooks/skills/gate-state (deterministisk, men kun pr. handling).
2. **Pr. gate — kæde-troskab:** krav-ID-matrix + løfte↔bevis-bijektion + troskabs-angreb + Claude.ai-mening.
3. **Forløbs-troskab — KONTROL-DOK:** lokal disciplin fanger IKKE om *hele kørslen fulgte workflowet*. Derfor et **kontrol-dok 1:1 med workflowet — og DETTE forløbs-kort ER kontrol-dokket.** Kørslen producerer en **worklog/trace** der holdes **1:1 op mod kontrol-dokket**: sprunget step / fase ude af spec / gate uden positivt verdikt = **forløbs-drift → halt/flag**. Tjekkes **løbende** (pr. fase — ikke kun til sidst, ellers akkumulerer drift) **+ final** (ved slut OK). Workflowets egen "plan⊨build" på meta-niveau.

## MAPPE-STRUKTUR (doc-taksonomi — dækkende for NUVÆRENDE docs)

Mappe-grænsen **håndhæver** bord-delingen (PreToolUse-hook blokerer AI-skrivning til `sandhed/`; CODEOWNERS gater merge). Dækker ALLE nuværende docs:

```
docs/
  sandhed/      # LÅST — Mathias' bord; AI retter ALDRIG (hook + CODEOWNERS)
    vision-og-principper.md · forretningsforstaaelse.md
    krav/<pakke>-krav.md        # workflow-faerdiggoerelse · gov-5 · rette-til ...
    domaene/                    # PRODUKT-krav: lag-e-beregningsmotor · lag-e-tidsregistrering · org-rettigheds-model · permission-matrix
  teknik/       # AI opdaterer EFTER build, under Mathias-gate (krav 10)
    master-plan.md · teknisk-gaeld.md · cutover-checklist.md · doc-redegoerelse.md
    fremtid/                    # gov-6-forslag-og-udskudte · huskeliste
    reference/                  # claude-code-egenskaber · codex-sandbox-opsaetning
  plan-build/   # pr. pakke: plan + recon + status + rapport
    <pakke>-{plan,recon,status}.md · seneste-rapport.md · aktiv-plan.md
    rapport-historik/
  proces/       # workflow-regler + roller + kontrakter (aktør-flade — Mathias læser ikke)
    disciplin.md · governance-vagt.md · LÆSEFØLGE.md
    roller/                     # claude-ai/SKILL · codex-rolle · code-rolle
    workflow/                   # gate-def + kontrakter + *-check (substrat)
  arkiv/        # lukkede artefakter: gov-4 · gov-docs-renhed · mathias-afgoerelser-historik
```

**Nuværende → mål (intet hjemløst):** `strategi/{vision,forretning}`→`sandhed/` · `strategi/master-plan`→`teknik/` · `strategi/disciplin`→`proces/` · `coordination/<pakke>-krav`→`sandhed/krav/` · `coordination/<pakke>-{plan,recon,status}`+`seneste-rapport`+`aktiv-plan`→`plan-build/` · `coordination/rapport-historik`→`plan-build/` · `coordination/gov-6-forslag`→`teknik/fremtid/` · `coordination/governance-vagt`→`proces/` · `coordination/arkiv`→`arkiv/` · `teknisk/{gaeld,cutover,doc-redegoerelse}`→`teknik/` · `teknisk/{lag-e-*,permission-matrix,org-rettigheds}`→`sandhed/domaene/` · `teknisk/claude-code-egenskaber`+`codex/`+`claude-ai/`→`teknik/reference/`+`proces/roller/` · `LÆSEFØLGE`→`proces/`.

- **Håndhævelse:** PreToolUse-hook blokerer AI-skrivning til `sandhed/` (lokalt); CODEOWNERS=mgrubak = merge-gate. Hooken er mekanismen, ikke mappen.
- **Migration = ÉN bevægelse** (gov-6): flyt + opdater alle referencer (hooks/CI/CLAUDE.md/LÆSEFØLGE) i ét. **→ step 2/3** (målstruktur, ikke gjort her).
- **Åbent valg (dit bord):** produkt-krav (`lag-e-*`) i `sandhed/domaene/` vs. egen `produkt/`-rod — afgør ved migration.

---

## KENDTE SVAGE LED (ærlige residualer — fake-fixes IKKE)

- **Forretnings-recon-komplethed** — irreducibel ukendt-ukendt; coverage-matrix + 3-aktør-connect + Mathias krymper den, men residual.
- **Forretnings-troskab (Codex #12)** — semantisk; troskabs-meta-canary beviser tjekket *fyrer*, ikke at *subtil* drift fanges. Ultimativ garant = Mathias + Claude.ai (krav 2/5).
- **Dybde-fuldstændighed (Codex #20)** — fuld gren-dækning ikke rent deterministisk; dybde-meta-canary + coverage-kriterier mindsker, rest = dømmekraft.
- **Internt-komplet vs. eksternt-forkert (Codex #22)** — en lukket bijektion kan stadig misse krav forkert splittet/udvandet. Mathias-vs-krav + Claude.ai-mening er den eneste fangst.
- **Claude.ai-app som menneske-led** — kan ikke automatiseres; afhænger af Mathias' hånd + sync (privat-repo-adgang).
- **Canary-styrke (Codex #11)** — bijektion beviser eksistens, ikke styrke; afbødet af slut-effekt-krav + meta-canary, rest = reviewer-dømmekraft.

---

## FORUDSÆTNINGS-FIX + STEP-2-DETALJER

**Røde i dag (skal fikses før workflowet håndhæver):**
1. `gate_ord`↔`gate-def`-afstemning (`plan OK`/`build OK` ind i motoren) + divergens-vogter.
2. CI mod rigtige committede artefakter (ikke selftests/fixtures) — Build 1's falsk-grøn.
3. `workflow:selftest`-rød på `main` (pre-eksisterende) — fikses for sig.
4. App-/GitHub-adgang ved privat repo (Actions-minutter + app re-grant).

**Substrat-exploits (angriber-runde / B-test 2026-06-19 — design siger X, koden gør ikke X i dag; substratet SKAL håndhæve):**
5. **Verdikter content-afledte, ikke marker-match** — i dag matcher kæden `APPROVAL`/`PASS`/`Plan-SHA` i markdown (`tilstand.mjs`); falske verdikter kan fabrikeres. Anti-tavshed/læsebevis er IKKE i kode.
6. **CI: skipped ≠ OK · doc-grøn ≠ dybde** — aggregatoren tæller skipped som grøn (`ci.yml`); doc-checks er altid grønne fordi *ordene er der*, men dybde/kontekst mangler → derfor top-til-tå-testen (S8.1).
7. **Per-gate-id-afgørelse** — i dag åbner ét `GODKENDT` ALLE åbne gates (`dirigent.mjs`); skal bindes til konkret gate-id/fund-hash.
8. **Code uden write til måle-laget** — i dag `--dangerously-skip-permissions` (`code.sh`); prover/hooks/fixtures uden for Code's skriveadgang.
9. **Beskyttet/committet trace** — `.dispatch-log`/`.kaede-stop` er gitignored/lokale; trace + STOP skal være committet/signeret.
10. **Ownerless-sti-beskyttelse** — aktive sandheds-artefakter i `docs/coordination/*` kan omskrives via alm. PR (`CODEOWNERS`); skal gates.
11. **Reelle gates + dækning:** `plan OK`/`build OK` reelle gates · recon-syntese kræver dækning (ikke bare "to filer findes") · krav-merge kræver buildability-verdikt · async cascade håndhævet.

**⚙️ Step-2 (hvordan sættes op — Codex-flaggede detaljer):** GitHub-Action→lokal aktør protokol (#9) · definition af "byg-tool-kald" (#14) · prover-isolations-mekanik (#19) · repo-sandheds-inventory som kæde-led (#10) · reel-acceptance-kriterier (#21) · dybde-coverage-kriterier (#20) · mappe-migration (én bevægelse).

---

## CODEX RUNDE 1 — DISPOSITIONER

24 fund. **Foldet ind (mekanisk hardening):** #3,#4,#5,#7,#8,#13,#15,#16,#17,#18,#19(delvis),#21,#23,#24 + anti-tavshed/læsebevis som gennemgående regler. **Markeret ⚙️ step-2:** #9,#10,#14,#19(detalje),#20(kriterier). **Ærlige residualer (ikke fake-fixet):** #6(delvis),#11,#12,#20,#22. **Allerede i forudsætnings-fix:** #1,#2.

---

*Slut på step-1-kortlægning v9. Næste: Mathias holder mod krav → ingen feedback = klar til godkendelse → step 2.*
