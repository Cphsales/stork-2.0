# Masterplan-rettelser til pakke 1 (Del B og C)

Del A er lagt ind i masterplanen 29/9 (PR #186, Mathias' »1. ja«, M-86). Del B træder i kraft med pakke 1's `slut ok`: rettelserne hører i slut-rapportens afsnit »Rettelser i Mathias' dokumenter« og efterprøves mod masterplanen, som den er da. Del C afgøres af Mathias i de trin, der står ved hvert punkt. Linjenumrene er fra masterplanen før Del A.
Denne fil flyttes ind i `plan-build/lokations-skabelon/` med pakke 1's første commit og fjernes ved pakke-luk.

## Del B — træder i kraft med `slut ok` for pakke 1

**Grundlag:**
- Pakke 1-kravet, godkendt (M-38 »krav ok«, blob `9402164d`).
- Ledgeren (i dag `plan-build/lokations-skabelon/mathias-ord.md`; flyttes til `docs/sandhed/mathias-ord.md` i oprydningens 4.1 trin 3, H5).
- Kravets poster med trin-nummer (»IKKE i scope« l.411-417 og nedstrøms-noterne i K-1, K-2, K-5, K-6): hver skrives ind ved sit trin (H6) — trin 24 i B2, trin 29 i B3. Lokations-skabelonens egne forbrugsflader (trin 24-29, l.411) står allerede i B1.
- Planens forhåndsgodkendte tekst: plan.md §7, **Blok A** (l.734-767) og **Blok B** (l.772-774) @ `87a877b`. Den er brugt ordret, med de ændringer der står under hver rettelse.
- **Blok C** (l.776-780) udgår. Det er et forslag i workflow-planen §3 trin 1 og dækkes af dit `ok` til planen (Blok C's rettelse af henvisningen »afgørelse fra rettelse 17« laves i stedet direkte i B1: Blok A henviser til Appendix A).

**Før `slut ok`:**
- `<BUILD-COMMIT>` og `<DATO>` udfyldes ved lukning.
- Afviger det byggede fra teksten, retter slut-rapporten teksten (workflow-planen §2 trin 4), før du siger `slut ok`.

**To steder har to varianter.** Begge varianter står færdigskrevet nedenfor. Den der bruges, er **den variant plan v3.8 vælger**, med dit `plan ok`:
- **V-1: er gruppe og leverandør én eller to entiteter?** Det er **ikke dit spørgsmål.** Pakke 1-kravet, som du godkendte, lægger valget i plan-fasen (krav l.181: »om gruppe og §1.12's leverandør er én eller to entiteter, om type er krævet ved oprettelse …«; sprog-noten l.11: »om gruppe og leverandør er én eller to entiteter afgøres i plan-fasen«). Plan v3.5 valgte én entitet (plan.md l.624 »V5 · Gruppe = §1.12's leverandør: ÉN entitet«; Blok A l.762).
- **V-2: systemets dag — UTC eller dansk kalenderdag?** Planens default er UTC-dag (D-2). Det afviger fra dine dokumenter, som peger på dansk kalenderdag (Del C, C8). Afvigelsen fremlægges i din ½ side (workflow-planen §3 trin 1); dit `plan ok` godkender den variant planen står på, og et stop giver den anden.

### B1 · §1.12 l.611-634 — lokations-skabelonen

NUVÆRENDE (l.611-617, 624-634):
> **Lokations-entitet:**
>
> - Pr. lokation: navn, adresse, default-dagspris, leverandør-FK, type (butik / messe / marked / event / andet), status (livscyklus), cooldown-konfiguration jsonb, anonymized_at
> - Selv-refererende `parent_location_id` — top-niveau lokation kan have placements (stand-positioner) under sig. Samme tabel håndterer både lokation og placement
> - Placement-niveau bærer egen pris hvis sat (ellers arves fra parent-lokation)
> - Cycle-detection-trigger via rekursiv CTE
>
> **Lokations-status som første-klasses livscyklus:**
>
> - Konkrete enum-værdier afgøres ved bygning (åben beslutning, se Appendix B)
> - Overgange via dedikeret RPC. Auditeres med årsag
> - Bookings kan kun oprettes på aktiv lokation
>
> **Klient-tilladelser pr. lokation:**
>
> - Separat relations-tabel: klient × lokation × from_date × to_date. Versioneret
> - Booking-RPC validerer at klient er tilladt på lokation på booking-dato
>
> **Cooldown pr. lokation** (ikke pr. klient eller kampagne — afgørelse fra rettelse 17). Konfig-tabel, UI-redigerbar.
>
> **Leverandører:**
>
> - Egen master-data-entitet (separat fra lokation). Lokation har leverandør-FK
> - Leverandør-type-felt kategoriserer (kæde / enkelt-butik / messe-operatør / andet) — styrer rabataftale-lookup

NY: plan.md Blok A l.735-767 ordret (afsnittene »Lokations-entitet (bygget ved trin 10b, commit <BUILD-COMMIT>)«, »Lokations-status som første-klasses livscyklus (afgjort ved trin 10b)«, »Klient-tilladelser (Mathias-modellen 2026-09-03, M-17 …)«, »Cooldown pr. lokation … (ikke pr. klient eller kampagne — Appendix A)« og »Grupper (leverandører)«), med disse ændringer:

1. **Ny første linje** under overskriften §1.12, før »Lokations-entitet«:
   > Ejerkæden er fast: gruppe ejer lokation, lokation ejer stand (Mathias 2026-09-03, M-18: »altså med minimum en stand menes der at gruppe ejer lokation og lokation ejer stand«). Flere klienter kan stå på en lokation samtidig, men maks 1 klient pr. stand (M-29: »derfor kan deres godt være flere klienter på en lokation samtidig men der kan maks være 1 klient pr stand«) — håndhæves i booking-leddet (trin 24).
2. **Migration** — ny linje sidst i afsnittet:
   > Migration af lokations-historik fra 1.0: udskudt (Mathias 2026-09-02, M-25: »dette importeres senere«).
3. **V-1, variant »én entitet«** (den variant plan v3.8 vælger, hvis den beholder v3.5's valg): Blok A's afsnit »Grupper (leverandører)« bruges ordret, også parentesen »(afgjort i plan-fasen, trin 10b)«.

   **V-1, variant »to entiteter«** (den variant plan v3.8 vælger, hvis den skifter): Blok A's afsnit »Grupper (leverandører)« erstattes af dette afsnit. Punkt 3-6 er Blok A l.764-767 ordret. Nyt er overskriften og første punkt; andet punkt er Blok A l.763 ordret med én sætning tilføjet (»Typen ligger på gruppen, ikke på leverandøren«):
   > **Grupper og leverandører:**
   >
   > - TO entiteter: `core_identity.grupper` er Mathias' ord "gruppe" — ejeren af lokationen (M-18: »gruppe ejer lokation«). Lokationens ejer-FK er `gruppe_id` (afgjort i plan-fasen, trin 10b). Masterplanens leverandør er en egen master-data-entitet (`core_identity.<LEVERANDØR-TABEL>`), separat fra lokation og gruppe; lokationen har leverandør-FK
   > - Gruppe oprettes i UI med navn; type-felt (kæde / enkelt-butik / messe-operatør / andet — lagret som kaede/enkelt_butik/messe_operatoer/andet) er valgfrit ved oprettelse og styrer rabataftale-lookup i trin 29. Typen ligger på gruppen, ikke på leverandøren
   > - Kontaktpersoner i egen tabel (`gruppe_kontakter`) … *(Blok A l.764 ordret)*
   > - En anonymiseret lokation kan ikke få nye værdier i persondata-klassificerede felter … *(Blok A l.765 ordret)*
   > - Grupper slettes aldrig (FK RESTRICT + ingen delete-vej); udfasning via is_active *(Blok A l.766 ordret)*
   > - Persondata-klassifikation kan aldrig sænkes fra direct … *(Blok A l.767 ordret)*

   `<LEVERANDØR-TABEL>` er tabelnavnet i plan v3.8 og udfyldes ved lukning som `<BUILD-COMMIT>`. Kilder til de nye punkter: »Egen master-data-entitet (separat fra lokation). Lokation har leverandør-FK« er masterplanens nuværende §1.12 l.633 ordret; at typen ligger på gruppen, er pakke 1-kravet K-3 (l.54: gruppen »bærer §1.12's type-felt … som opslags-anker for rabat-mekanikken i trin 29«) og sprog-noten l.11 (»forretnings-kravene (ejer, type som rabat-anker, klient-kobling) gælder gruppen«).
4. **V-2, variant »UTC-dag«** (planens default D-2): Blok A bruges ordret (»UTC-datostempel«, »UTC-dateret«).
   **V-2, variant »dansk kalenderdag«:** I Blok A l.740 og l.746 erstattes »UTC-datostempel« med »datostempel efter dansk kalenderdag (Europe/Copenhagen)« og »UTC-dateret« med »dateret efter dansk kalenderdag (Europe/Copenhagen)«.

Bevis:
- Kravets vedligeholds-flag (a) (krav l.426): »§1.12 "Klient-tilladelser pr. lokation: separat relations-tabel …" — Mathias' model 2026-09-03 er kobling på gruppen med fravalg pr. lokation«.
- Dine ord M-17, M-18, M-21, M-25, M-27, M-28, M-29, M-36 (ordret i ledgeren).
- De fem afvigelser fra §1.12 (E-rapporten §4, verificeret mod l.607-635):
  - stande i egen tabel
  - status som historik
  - klient-ret via gruppen med fravalg
  - hviledage som heltal og dvale med slutdato
  - gruppe = leverandør (kun variant »én entitet«)
- Den forkerte henvisning »afgørelse fra rettelse 17« (l.629) forsvinder, fordi Blok A henviser til Appendix A. Appendix C række 17 handler om schema-grænser (l.1976).

### B2 · §2.7.1 Booking-stamme l.1303-1304

NUVÆRENDE:
> - Klient-tilladelse pr. lokation valideres
> - Cooldown-trigger tjekker at samme lokation ikke overlapper med tidligere booking inden for konfigureret cooldown (pr. lokation)

NY:
> - Klient-tilladelse valideres pr. booking-dato mod `klient_maa_staa_paa(klient, lokation, dato)` (§1.12: klient koblet på lokationens gruppe ∧ ikke fravalgt ∧ lokationen ikke nedlagt)
> - Maks 1 klient pr. stand ad gangen — to klienter på samme stand samtidig afvises (M-29: »der kan maks være 1 klient pr stand«)
> - Booking kun på bookbar lokation/stand pr. dato (`lokation_er_bookbar` / `stand_er_bookbar`: kun status aktiv er bookbar; M-25: »aktiv · dvale · nedlagt: kan kun bookes i aktiv«)
> - Cooldown-trigger: efter en kampagne hviler lokationen (dvale med planlagt ophør) i det antal hviledage, der er valgt i UI. Intet valgt antal = ingen automatisk hvile (M-21: »kan hvis antal hvile dage er valgt i ui«). Gælder pr. lokation, på tværs af klienter
> - Afgøres ved trin 24: hvad der sker med allerede bookede dage, når en klient kobles fra gruppen eller fravælges på lokationen (pakke 1-kravet K-6)
> - Afgøres ved trin 24: om en annulleret booking udløser hvile, og om hvilen vurderes pr. stand eller pr. lokation (pakke 1-kravet K-5)
> - Afgøres ved trin 24 og 29: hvad lokationens dagspris bruges til — fakturering, kalkyle, binding ved brug (pakke 1-kravet K-1 ac 3; prisens historik er leveret i trin 10b)

Bevis:
- Kravet K-2 ac 4, K-4 ac 5, K-5 (»Scope-ærlighed«: udløsningen »kobles på i trin 24«) og K-6 ac 7 og trin 24-noten.
- De to nye »Afgøres ved«-linjer (H6): kravets »IKKE i scope« l.415 (»Annullerede bookingers hvile-effekt + hvile-evalueringsniveau (stand vs. lokation): trin 24 — noteret som nedstrøms-afhængighed i K-5.«) og l.417 (»Hvad dagsprisen bruges til (fakturering, kalkyle, binding ved brug): trin 24/29 — skabelonen bærer feltet og dets historik (K-1 ac 3).«). l.416 er allerede dækket af linjen om bookede dage og linjen om maks 1 klient pr. stand.
- Planens overdragelser N2-B/N4-B/N5-B/N6-B (plan.md l.798: »`downstream_dependency: trin-24`«).

### B3 · §2.7.6 Leverandør-fakturering l.1412-1414

NUVÆRENDE:
> **Rabataftaler pr. leverandør:**
>
> - Leverandør-entitet bærer rabataftale jsonb: procent-trapper

NY, variant »én entitet«:
> **Rabataftaler pr. leverandør (= gruppe, §1.12):**
>
> - Leverandør-entitet (gruppen, `core_identity.grupper`) bærer rabataftale jsonb: procent-trapper. Gruppens type skal være udfyldt, før gruppen kan bruges i rabat-beregning (pakke 1: typen er valgfri ved oprettelse)

NY, variant »to entiteter«:
> **Rabataftaler pr. leverandør:**
>
> - Leverandør-entitet bærer rabataftale jsonb: procent-trapper. Rabataftale-opslaget bruger gruppens type (§1.12). Gruppens type skal være udfyldt, før gruppen kan bruges i rabat-beregning (pakke 1: typen er valgfri ved oprettelse)

Begge varianter får desuden denne linje (H6), sidst under »Rabataftaler pr. leverandør«:
> - Afgøres ved trin 29: om lokationens dagspris indgår i leverandør-faktureringen (pakke 1-kravet K-1 ac 3; se også §2.7.1)

Bevis:
- Kravet l.181: »default: valgfri ved oprettelse, krævet før rabat-brug i trin 29«.
- H6-linjen: kravets »IKKE i scope« l.417 (»trin 24/29«) og l.412 (»Rabataftale-trapper + undtagelses-tabel (trin 29): gruppens type-felt leveres som opslags-anker; mekanikken bygges i trin 29.«), som allerede er dækket af gruppe-type-linjen ovenfor.
- Plan.md l.798: »`trin-29`: … gruppe-type krævet før rabat (V3)«.
- Hvor rabat-feltet fysisk ligger, afgøres i trin 29. Teksten peger kun på entiteten.

### B4 · §4 trin 10b l.1520

NUVÆRENDE:
> | 10b | Lokations-skabelon (lokationer + placements + leverandører + klient-tilladelser + status + cooldown) **+ migration: udtræks-SQL for lokations-historik hvis relevant** | core_identity |

NY:
> | 10b | Lokations-skabelon (lokationer + stande + grupper + klient-kobling på gruppen med fravalg pr. lokation + status aktiv/dvale/nedlagt + hviledage). Migration udskudt (Mathias 2026-09-02, M-25: »dette importeres senere«) | core_identity |

Variant »to entiteter«: »grupper« skrives som »grupper + leverandører«.

Bevis: Kravet »IKKE i scope« l.414: »Migration af 1.0-data: UDSKUDT på Mathias' ord 2026-09-02 (M-25.4 …)«. E-rapporten §5.4(c): Blok B nævner ikke udskydelsen. Det gør den her.

### B5 · Appendix A »FM-domæne« l.1812, »Migration fra 1.0« l.1867 og Appendix B l.1891

NUVÆRENDE (l.1812):
> | Cooldown | Pr. lokation (ikke pr. klient/kampagne) |

NY (rækken ændres, og tre rækker tilføjes under den):
> | Cooldown | Pr. lokation (ikke pr. klient/kampagne). Antal hviledage vælges i UI; intet valg = ingen automatisk hvile (M-21) |
> | Lokations-ejerskab | Gruppe ejer lokation, lokation ejer stand (M-18). Maks 1 klient pr. stand (M-29) |
> | Klient på lokation | Klienter kobles på gruppen og arver alle dens lokationer, også senere tilkomne; en lokation kan fravælge og ophæve fravalget (M-17, M-36) |
> | Lokations-status | aktiv / dvale / nedlagt. Kun aktiv er bookbar. Nedlæggelse kobler klienterne fra, standene består; genåbning giver klienterne automatisk tilbage (M-14, M-25, M-28; kravet K-4/K-6, godkendt M-38) |

NUVÆRENDE (l.1867, efter A20):
> | Migration-trin | Integreret i eksisterende byggetrin (trin 5, 9, 10b, 14, 21, 31). Ikke separate trin. Trin 10: udskudt (mathias-afgoerelser 2026-05-20, »Trin 10 scope-præcisering«, §4) |

NY:
> | Migration-trin | Integreret i eksisterende byggetrin (trin 5, 9, 14, 21, 31). Ikke separate trin. Trin 10: udskudt (mathias-afgoerelser 2026-05-20, »Trin 10 scope-præcisering«, §4). Trin 10b: udskudt (M-25: »dette importeres senere«) |

NUVÆRENDE (l.1891):
> | Lokations-status | Afgøres ved trin 10b |

NY: rækken fjernes. Den er afgjort (se Appendix A ovenfor).

Bevis: dine ord ordret i ledgeren. M-14: »altså klienter kobles automatisk fra lokationer når den nedlægges men lokaitoner beholder de oprettede stande«. Automatisk tilbage ved genåbning: kravet K-6, godkendt med M-38 (M-19 »ja« alene afgør det ikke, fordi spørgsmålet havde to udfald). M-28: »en nedlagt skal kunne genåbnes«. Kravet K-4 og K-6.

### B6 · §4.1 statusrækken for 10b (afløser A16)

NUVÆRENDE (efter A16):
> | 10b | Lokations-skabelon | ⏳ Næste | Pakke 1 | — | — |

NY (plan.md Blok B l.773, ordret):
> | 10b | Lokations-skabelon | ✓ Godkendt | Trin 10b | <BUILD-COMMIT> | <DATO> |

Bevis: l.1600 »✓ Godkendt — bygget, verificeret, accepteret af Mathias« = dit `slut ok`.

### B7 · Hoved l.5 og Appendix C — rettelse 38

NUVÆRENDE (efter A3):
> **Status:** Komplet med 49 rettelser indlejret (Appendix C: 1-17, 18a-29a, 18-37 …

NY:
> **Status:** Komplet med 50 rettelser indlejret (Appendix C: 1-17, 18a-29a, 18-38 …

(resten af linjen uændret). Ny række i Appendix C:
> | 38 | Trin 10b (pakke 1, `slut ok` <DATO>, commit <BUILD-COMMIT>): §1.12 omskrevet til Mathias' model — gruppe ejer lokation, lokation ejer stand (stande i egen tabel); klienter kobles på gruppen med fravalg pr. lokation; maks 1 klient pr. stand; status aktiv/dvale/nedlagt som historik; hviledage som antal valgt i UI. Gruppe = leverandør [variant »én entitet«] / Gruppe og leverandør er to entiteter; typen ligger på gruppen [variant »to entiteter«]. Migration udskudt (M-25). §2.7.1 booking-regler til trin 24, §2.7.6 gruppe-type før rabat til trin 29, kravets udskudte poster skrevet ind ved trin 24 og 29, Appendix A/B afstemt, §4/§4.1 10b-rækker opdateret |

---

## Del C — rettes ikke her (din beslutning i et senere trin)

**Din regel ved modsigelse:** Stamme-dokumenterne vinder over masterplanen (vision l.5; masterplan §0 l.40; `disciplin.md` §8). Men i de punkter nedenfor er rettelsen ikke ét skridt fra dit ord. Workflow-planen §5 har lagt dem på listen »Spørgsmål der hører til senere trin«. Derfor står de som spørgsmål med et default, ikke som bekræftelse.

| # | Sted i masterplanen | Modsigelse / hvad der skal afgøres | Default efter dine regler | Afgøres |
|---|---|---|---|---|
| C1 | Løn-adgang: §2.1 l.902-911, §2.5 l.1237-1244, Appendix A l.1696-1697 (`self` / `team` / `subtree` / `all`) | Forretningsforståelse §12 l.211 (ordret): »Stork skal kunne styre synlighed via tre niveauer: sig selv, hierarki (egen knude og alt under), eller alt«. §1.7 l.377 siger det samme. Løn-afsnittene har fire, inkl. `team`, som rettelse 35 fjernede fra §1.7. Intet bygget skal laves om: løn-tabellerne har i dag kun admin-læsning (`20260514150001:63-65`; teknisk-gaeld G014). | Tre niveauer (forretningsforståelsen vinder) | Pakken der bygger løn-adgangen (trin 5/14-22; G014 siger trin 16/17) |
| C2 | Dashboard-adgang: §2.4 l.1170-1185 (`tl` / `ledelse` / `alle`), Appendix A l.1695 | Er dashboard-adgang en egen dimension, eller bruger den de tre synlighedsniveauer? | — | Trin 23 |
| C3 | Migration fra 1.0: §0.5 (l.69-145, især l.131 »Migration-trin er ikke separate trin — de integreres i eksisterende byggetrin«), §4 trin 5/9/14/21, Appendix A l.1857-1870 | Forretningsforståelse §15 l.246-247 (ordret): »Stork 2.0 skal kunne tage migration som separat beslutning pr. pakke, ikke som automatisk leverance« og »Stork 2.0 skal kunne hente data direkte fra eksterne kilder (klient-API'er) som primær kilde frem for at gå gennem 1.0«. | Forretningsforståelsen vinder: migration er en separat beslutning pr. pakke | Før næste pakke der rører migration (trin 12+). Registreret i Appendix B (A23) |
| C4 | Appendix A l.1774 »Klient pr. team \| Max 1 ad gangen« | Det byggede er ét team pr. klient: partial UNIQUE på `client_id` (`20260518000004_t9_client_node_placements.sql:12`), mens `node_id` kun har et almindeligt indeks (l.40). Et team kan altså have flere klienter. Forretningsforståelse §1 l.17 »klienter ejes af teams — én klient ad gangen« kan læses begge veje. | — | Når en pakke rører klient-team-tilknytningen (workflow-planen nævner intet trin) |
| C5 | Pre-cutover-step l.1950 »Bootstrap-strategier … aktiveret af `gdpr_responsible` via UI« | Koden kræver kun rettigheden `has_permission('anonymization_strategies','activate',true)` (`20260515110100_p1a_anonymization_strategies.sql:293`) og tjekker ikke, om brugeren er den udpegede GDPR-ansvarlige. Hvem der må aktivere, er dit valg. | — | Før cutover (cutover-blockers / trin 31) |
| C6 | §1.7 l.379-395 (rolle pr. medarbejder, placering, superadmin på `Ejere`-afdeling, knude-løs + Hiraki) | Org-udkastet (`docs/teknisk/org-rettigheds-model-UDKAST.md`, afventer dit ja) ændrer §1.7 fire steder: rettigheder følger knuden · tvær-link · superadmin kun på toppen · knude-løs = ingen adgang. | Masterplanen står, til du siger ja | Pakken der bruger org-udkastet (workflow-planen §4.4) |
| C7 | (forretningsforståelse, ikke masterplanen) §14 FM l.231-239 | **Disponeret, intet åbent spørgsmål:** FM-rammerne (gruppe → lokation → stand, klienter via gruppen, maks 1 pr. stand, aktiv/dvale/nedlagt) bliver i masterplanen (Del B). Ingen ændring af forretningsforståelsen (forfatterreglen, `disciplin.md:263`: kun Mathias eller krav-rollen efter hans forhåndsgodkendelse). | FM-rammerne bliver i masterplanen; forretningsforståelsen ændres ikke | Afgjort her (tidl. bilag Q9) |
| C8 | Del B, V-2 | Systemets dag: UTC eller dansk kalenderdag? (Forretningsforståelse §16 l.262 »forhindre tidszone-drift mellem rapportering og pricing«; masterplan §2.3 l.1091 »render Europe/Copenhagen«.) Planens UTC-dag afviger fra det; afvigelsen fremlægges i din ½ side. (V-1, én eller to entiteter, er ikke her: kravet l.181 lægger det i plan-fasen.) | UTC (planens default D-2, godkendt med M-45) | Pakke 1's ½ side til `plan ok` |
| C9 | Appendix C (l.1960-2007) — rettelses-historikken | **Afgjort (ikke dit bord — ændrer intet der bygges):** Appendix C's rettelses-historik bliver i masterplanen. Åbent punkt fra den gamle `disciplin.md` l.520 (ordret): »**Master-plan (Claude.ai's bord):** afklar om Appendix C's rettelses-historik hører i planen eller i historik.« Claude.ai's bord → krav-rollen afgør: den bliver, fordi Del A og B tilføjer rettelse 37 og 38 dér, og henvisningerne i repoet peger på den. | Appendix C bliver i masterplanen | lukket med planen |

**Ikke rettet, fordi det ikke kan verificeres her** (ingen adgang til Supabase-dashboard; GitHub-API 403):
- §1.14 l.678-681: Pro-tier, organisation og »PITR ikke aktiveret endnu«.
- §4.2 l.1617: Dependabot »4 sårbarheder pr. 2026-05-16«.
- Om H024-oprydningen er kørt i driftsdatabasen (A17 henviser til cutover-blocker #6).

---

## Åbne punkter

1. **A2 og kilden til dine afgørelser:** Workflow-planen §4.4 giver lov til at redde dit indhold fra `docs/foraeldet-workflow/` (bl.a. `mathias-afgoerelser-historik.md`), før mappen fjernes. Den siger ikke, hvor indholdet skal hen. A2 peger på commit `0eb9b25`, og det holder uanset hvad. Flyttes filen til en fil der bliver, skal A2's sti pege dertil i stedet.
2. **A16:** Symbolet ⏳ (i stedet for bilagets ⏸) bygger på, at dit `ok` til planen ophæver M-54 »vent lige« for pakke 1 (workflow-planen §5). Anvendes rettelsen, før pakke 1 er genoptaget, er ⏸ PAUSET det rigtige.
