# Dokument-redegørelse (fuld gennemgang)

**Status: FÆRDIG.** Alle 58 docs læst ordret (undtagen arkiv, jf. Mathias-reglen). Ingen rettelser i de gennemgåede docs — kun flag/rapport.

**Metode:** Hvert dok (undtagen arkiv) læst ordret start→slut og holdt op mod de andre. Trin 2 = modsigelser (+ kan sandheden bevises? ved bevis: INGEN rettelse). Trin 3 = dublet-tekst. Arkiv-gruppen undtaget trin 2+3. Tvivl om placering → arkiv taber.

**Tilføjet gruppe:** "Byggeplan" (master-planen passer hverken som ren workflow eller kode-rapport).

**Hoved-konklusion op front:** Den gennemgående modsigelse er **V5 vs. V6**. En stor del af aktiv-doc-laget (disciplin, aktiv-plan, master-plan §0, SKILL, gov-5-automation, LÅST-bannere) er skrevet i V5-æraen og læser som aktivt, MEN `v6-krav-og-data.md` §8 (GODKENDT 2026-06-13) lukker "hele V5 som mislykket". **Denne staleness er allerede kendt og bevidst udskudt** af Mathias som **[H029] tekst-staleness → "pakke efter gov-6"** (set i gov-5-automation-plan G/H-tabel + bekræftet i aktiv-plan/status). Næsten alle mine modsigelses-fund er instanser af præcis dén kendte, udskudte staleness — ikke nye fejl. De få der IKKE er dækket af H029 er markeret **[NY]** nedenfor.

---

## RAMME (Mathias 2026-06-15) — fortælling + kohærens-lag

**Fuld rapportering** (modsigelser + dublet) på **alt der ikke er arkiv**. Målet: **ÉN sammenhængende fortælling** — Storks ene sandhed.

**Kun to lag MÅ modsige fortællingen:**

- **Fremtidige/undersøgelses-docs** = de 10 i **ÅBNE**-gruppen (fx `org-rettigheds-model-UDKAST` der foreslår at ændre rolle-modellen). De er oplæg — de må afvige.
- **Arkiv** = fortid, superseded — må afvige.

**Kohærens-laget (skal KOHÆRE — 28 docs):** Mathias sandhed (4) + Byggeplan (1) + Workflow (9) + Koderapportering (14). Enhver modsigelse MELLEM disse er en **defekt** der skal løses ind i fortællingen — ikke en tilladt afvigelse. (Asymmetri værd at bemærke: `aktiv-plan` ligger i ÅBNE og MÅ derfor pege på V5-flowet; men `disciplin`/`SKILL`/master-plan §0/`gov-5-automation` ligger i kohærens-laget, så deres V5-rester ER defekter — det er kernen i H029.)

Fortællingen bygges som capstone nederst i dette dok. Stadig **report-only**.

---

## Gruppering (58 docs + 2 config)

### ARKIV — ingen review (20)

- arkiv/README.md
- arkiv/gov-4-branch-protection-krav-og-data.md
- arkiv/gov-4-branch-protection-plan.md
- arkiv/gov-docs-renhed-krav-og-data.md
- arkiv/gov-docs-renhed-plan.md
- v4-slettede-docs/ (15 filer): INDEX, T9-supplement-skitse, afdaekning×2, arbejds-disciplin, arbejdsmetode-og-repo-struktur, bygge-status, mathias-afgoerelser--slettet-version, overvaagning×3, skabelon×4

### MATHIAS SANDHED — review (4)

- [x] strategi/vision-og-principper.md
- [x] strategi/forretningsforstaaelse.md
- [x] coordination/v6-krav-og-data.md
- [x] arkiv/mathias-afgoerelser-historik.md _(flyttet fra arkiv → Mathias sandhed pr. tvivl-reglen)_

### BYGGEPLAN — review (1)

- [x] strategi/stork-2-0-master-plan.md _(2090 linjer, læst i chunks 1-2090)_

### WORKFLOW — review (9)

- [x] strategi/disciplin.md
- [x] coordination/governance-vagt-krav-og-data.md
- [x] coordination/v6-aktiverings-prompt.md
- [x] coordination/v6-bro.md
- [x] .claude/porten.md
- [x] .claude/partner-note.md
- [x] CLAUDE.md
- [x] claude-ai/SKILL.md
- [x] codex/sandbox-opsaetning.md

### ÅBNE DOKS MED UNDERSØGELSER — review (10)

- [x] coordination/aktiv-plan.md
- [x] coordination/gov-5-automation-recon.md
- [x] coordination/gov-6-krav-og-recon-UDKAST.md
- [x] coordination/gov-6-forslag-og-udskudte.md
- [x] coordination/v6-plan.md
- [x] coordination/rette-til-krav-og-data.md
- [x] coordination/rette-til-plan.md
- [x] teknisk/lag-e-tidsregistrering-krav.md
- [x] teknisk/lag-e-beregningsmotor-krav.md
- [x] teknisk/org-rettigheds-model-UDKAST.md

### KODERAPPORTERING — review (14)

- [x] teknisk/teknisk-gaeld.md
- [x] teknisk/huskeliste.md
- [x] teknisk/permission-matrix.md
- [x] teknisk/cutover-checklist.md
- [x] teknisk/claude-code-egenskaber.md
- [x] coordination/gov-5-automation-krav-og-data.md
- [x] coordination/gov-5-automation-plan.md _(865 linjer, læst i chunks 1-865)_
- [x] coordination/gov-5-automation-status.md
- [x] coordination/rette-til-status.md
- [x] coordination/seneste-rapport.md
- [x] rapport-historik/2026-06-10-gov-4-branch-protection.md
- [x] rapport-historik/2026-06-10-gov-docs-renhed.md
- [x] rapport-historik/2026-06-11-gov-5-automation.md
- [x] rapport-historik/README.md

_(Config, ikke prosa-docs: .claude/settings.json, settings.local.json — noteret, ikke prosa-reviewet.)_

---

## FUND — modsigelser (trin 2)

### Mathias sandhed (alle 4 læst ordret)

- **M1 [stærk]** — `vision-og-principper.md` + `forretningsforstaaelse.md` bærer banner "LÅST / autoritativ / vinder ved konflikt", men `v6-krav-og-data.md` §5 (2026-06-13, GODKENDT) siger "kun dette dokument er lukket — alt andet, også vision-dok, er åbent". To docs hævder øverste autoritet. **Bevist sandhed:** v6-krav-og-data er nyeste godkendte ramme (CLAUDE.md: "det eneste lukkede dokument"); de andres låst-banner er stale. _(Dækket af H029.)_ INGEN rettelse — kun flag.
- **M2** — `mathias-afgoerelser-historik` etablerer kilde-disciplin (hver krav-dok-påstand → Mathias-kilde, 2026-05-18) + recon-friskhed; `v6-krav-og-data` §7 AFVISER eksplicit "kilde-mærkning pr. påstand (fylde)" + "friskheds-regel på data". **Bevist:** v6-krav nyere + "afvist, genforeslås ikke" → stale i mathias-afgoerelser.
- **M3** — `mathias-afgoerelser-historik`s proces-/workflow-halvdel (fire-dokument-disciplin, qwers/qwerr/qwerg-overvågning, workflow-justering V2/V3) beskriver V5; `v6-krav-og-data` §8: "Hele V5 er lukket som mislykket". → proces-entries superseded; forretnings-frame-entries (org/T9/klient) står ved magt.

### Byggeplan (master-plan, læst ordret 1-2090)

- **B1 [stærk, INTERN i master-plan]** — §1.2 angiver retention-enum "time_based / event_based / **legal** / manual", men master-planens egen **Appendix C rettelse 24** siger ordret: "`legal` retention-type fjernes fra systemet. retention_type-enum reduceres til {time_based, event_based, manual, permanent}". §1.13 har den korrekte enum ({time_based, event_based, manual, permanent}). **Bevist sandhed:** rettelse 24 (Appendix C = master-planens egen rettelses-log) + §1.13 vinder; §1.2 blev aldrig opdateret (har stadig "legal", mangler "permanent"). _(Ikke H029 — intern master-plan-staleness.)_ **[NY]** INGEN rettelse — kun flag.
- **B2 [stærk, INTERN]** — §1.2 angiver "Match-rolle pr. felt", men master-planens egen **Appendix C rettelse 36** fjernede match-rolle fra §1.8 + §4 trin 10. §1.2 blev ikke synket. **Bevist:** rettelse 36. **[NY]** INGEN rettelse — kun flag.
- **B3** — §0 erklærer vision + forretningsforstaaelse autoritative ("vinder ved konflikt") — samme stale LÅST-hierarki som M1. v6-krav §5 supersederer. **Bevist:** v6-krav. _(Dækket af H029.)_
- **B4 [ÅBEN, kryds med Åbne-gruppen]** — §1.7 + Appendix A: "Én rolle pr. medarbejder. Ingen M2M" (rolle via FK på medarbejder). `org-rettigheds-model-UDKAST.md` foreslår rolle knyttet til **KNUDE**, ikke medarbejder. Dette er **ikke en bevisbar modsigelse** — UDKAST er et eksplicit udkast/oplæg, dvs. et FORESLÅET skifte til master-planens model. Sandheden kan ikke bevises mekanisk: det er en forretnings-afgørelse (Mathias' bord), endnu uafklaret. **[NY — venter på Mathias]** INGEN rettelse.

### Workflow (alle 9 læst ordret)

- **W1 [stærk]** — `disciplin.md` præsenterer sig (linje 7) som "det eneste rolle- og proces-hjem", fuldt current og gov-5-integreret (kæde-kurér, ny gate-model, "qwerg udgået" — opdateret 2026-06-11). `CLAUDE.md` siger ordret: "V5-strukturen (LÆSEFØLGE, **disciplin**, kæde-flowet) er lukket som mislykket 2026-06-13 ... følg den ikke som default." Aktivt proces-hjem vs. lukket-som-mislykket. **Bevist:** CLAUDE.md + v6-krav §8. _(Kernen i H029.)_

- **W1b [stærk — ROD-modsigelsen]** — Spørgsmålet "hvilket dok vinder?" besvares **forskelligt fem steder**:
  1. `disciplin` §8: vision LÅST + forretningsforstaaelse LÅST · master-plan/afgørelser RETNINGSGIVENDE · krav-dok/plan PAKKE-KONTRAKT
  2. `mathias-afgørelser` 05-20 pkt 1: **kun** vision LÅST-AUTORITATIV (forretningsforstaaelse ikke nævnt som låst)
  3. `master-plan` §0: vision **+** forretningsforstaaelse autoritative ("vinder ved konflikt")
  4. `vision`/`forretningsforstaaelse` egne bannere: begge "LÅST"
  5. `v6-krav` §5 (06-13): **kun v6-krav** er lukket — alt andet, også vision, er åbent

  **Bevist sandhed:** v6-krav §5 (nyeste, "det eneste lukkede"). Dette er selve roden under M1/B3/W1 — autoritets-ordenen er det mest dublerede-og-drevne punkt i hele repoet. INGEN rettelse — kun flag.

- **W2** — `claude-ai/SKILL.md` peger på `disciplin.md §9.1` som rolle-hjem → aktiv skill-pointer ind i lukket V5-dok. _(H029.)_

- **W3** — `governance-vagt-krav-og-data.md` (2026-06-05) er kontrakt der bygger "et **V5**-workflow ... mekanisk håndhævet" (Formål, ordret). Hele V5 lukket 06-13. V5-æra-kontrakt, superseded. _(H029/gov-6.)_

- **W3b [NY]** — `governance-vagt-krav` definerer **gov-6 = "arkiv-fold"** (fold arkiv til git-history). Men gov-6 er **omdefineret** (2026-06-11, `aktiv-plan` + `gov-6-forslag-og-udskudte`): "fuld gennemgang af V5 + implementering af mangler + rettelse af fejl". Og arkiv-folden blev allerede gjort tidligt (disciplin Forudsætninger: "UDFØRT 2026-06-12, PR #146"). Governance-vagts gov-6-definition er dobbelt-stale. **Bevist:** aktiv-plan + disciplin Forudsætninger. INGEN rettelse — kun flag.

- **Ikke-modsigelser (verificeret):** `v6-bro` + `v6-aktiverings-prompt` ER V6-docs (ramme = v6-krav, "det eneste lukkede; alt andet åbent" — ordret konsistent med v6-krav §5). `porten` + `partner-note` er kvalitets-gates dateret 06-13, aligner med V6-æraen. `codex/sandbox-opsaetning` = ren teknik. Ingen modsigelse.

### Åbne doks med undersøgelser (alle 10 læst ordret)

**Ramme:** Dette er **fremtids-laget — modsigelser her er TILLADT** (Mathias-regel 2026-06-15). Rapporteres for fuldstændighed, men tæller ikke som defekter i fortællingen.

- **Å1 [TILLADT afvigelse]** — `aktiv-plan.md` linje 9 siger ordret: "Når ny pakke startes følges V5-flowet i `docs/strategi/disciplin.md` §2" (+ linje 11-19 oplister V5-trinnene Step 0-5). Aktiv-markør = `ingen`. Peger på det lukkede V5-flow — men aktiv-plan er working-pointer i ÅBNE-laget, så afvigelsen er **tilladt** (ikke en kohærens-defekt). INGEN rettelse — kun flag.
- **Å2** — `v6-plan.md` (DEL 1 #2+#7) dokumenterer SELV V5/V6-modsigelsen (disciplin aktiv vs. V5 lukket) som præcis det gov-6 skal fikse. Dvs. modsigelsen er allerede katalogiseret. Ikke selv modstridende — det er meta-dokumentet der navngiver problemet. _(Bekræfter H029/gov-6.)_
- **Å3** — `gov-5-automation-recon.md` er recon for gov-5 (V5-æra). Superseded kontekst; ramme-neutral data om kodens tilstand.
- **gov-6-trioen** (`gov-6-krav-og-recon-UDKAST`, `gov-6-forslag-og-udskudte`, `v6-plan`): indbyrdes konsistente; gov-6 er den aktive planlægning der løser V5/V6. `gov-6-forslag-og-udskudte` = forslag-katalog (gov-6 UDSKUDT pr. Mathias 2026-06-11). Ingen indbyrdes modsigelse.
- **rette-til-parret** (`rette-til-krav-og-data` + `rette-til-plan`): krav+plan-par for kæde-fix før gov-6-genåbning. Konsistente.
- **Å4 [TILLADT afvigelse — headline]** — `org-rettigheds-model-UDKAST` foreslår rolle knyttet til **knude**, hvilket afviger fra master-plan §1.7 + Appendix A ("én rolle pr. medarbejder, ingen M2M" = P12/B4). Som UDKAST i fremtids-laget er afvigelsen **tilladt** — det er et oplæg til Mathias' beslutning, ikke en kohærens-defekt. Kan ikke bevises (forretnings-afgørelse, Mathias' bord).

### Koderapportering (alle 14 læst ordret)

- **K1 [stærk]** — `gov-5-automation-plan.md` (V21, 865 linjer) er bygge-planen for at AUTOMATISERE V5-workflowet (qwers/qwerg/kæde/disciplin-gate-model). Dens Formål kalder sig "grundstenen under alle fremtidige Stork 2.0-pakker". `gov-5-automation-status.md` viser den blev **bygget + merged** (PR #125 @ `ba6f4e54`, 2026-06-11, "SLUT OK GIVET"). To dage senere (2026-06-13) lukker v6-krav §8 hele V5 som mislykket. → Et frisk-bygget+merget automations-system for et workflow der derefter blev forladt. **Bevist:** v6-krav + v6-plan (gov-6 = re-do). _(H029/gov-6.)_ INGEN rettelse — kun flag.
- **K2 [NY, stærk]** — `rette-til-status.md` er stale: angiver "afventer klik" på arbejde der reelt er merged (PR #153). **Bevist:** git-historik (PR #153 merged). **[NY — ikke dækket af H029, som er tekst-staleness mod V5; dette er status-fil bag virkeligheden.]** INGEN rettelse — kun flag.
- **K3** — `gov-5-automation-status.md` + aktiv-plan refererer 2026-06-11 som seneste, to dage før V5-lukningen — ikke synket. Men dette er præcis H029-staleness (kendt, udskudt). Bemærk: kæden blev kørt én gang og **STOPPET** (KAEDE-STOP, transport-fund) → rette-til-pakken fikser før gov-6 genåbner.
- **Ikke-modsigelser (verificeret):** `permission-matrix.md` er auto-genereret (live DB-introspektion 2026-05-15): RPC→`has_permission(page,tab,can_edit)` + `is_admin()` som superadmin-anker — KONSISTENT med master-plan rettelse 26/31 + vision-princip 2. Intet fund. `cutover-checklist.md`: de 4 døde dok-referencer er allerede rettet til "git-historik" (PR #157); internt konsistent nu. `teknisk-gaeld.md` (G-register) + `huskeliste.md` (H-register): konsistente registre. `claude-code-egenskaber.md`: ren reference. `seneste-rapport.md` + `rapport-historik/*`: historiske snapshots — ingen modsigelse (datids-data).

## FUND — dublet-tekst (trin 3)

### Mathias sandhed + Byggeplan — TRE-VEJS DUBLET-KORT (forretningsforstaaelse × mathias-afgørelser × master-plan)

**Fund:** De tre docs er TRE VISNINGER af samme ene sandhed — `forretningsforstaaelse` (FF) = tematisk prosa · `mathias-afgørelser` (MA) = kronologisk beslutnings-log · `master-plan` (MP) = bygge-spec + Appendix A beslutnings-tabel. Næsten hvert forretnings-punkt i FF går igen i MA og/eller MP (samme punkt, anden ordlyd). Bevidst destillat — MEN også motoren bag modsigelserne: hvor en kopi ikke synkes, driver de fra hinanden (B1/B2). Alle tre docs er læst ordret start→slut (FF 1-265, MA 1-656, MP 1-2090).

| #   | Forretnings-punkt                                                                   | FF              | MA                                       | MP                                             | Status                                                                                                  |
| --- | ----------------------------------------------------------------------------------- | --------------- | ---------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| P1  | Klient = omdrejningspunkt; klient ejer rå data; data følger klient ved team-skift   | §1, §16         | 05-16 pkt 5; 05-20 pkt 1                 | §0.5/§1.4, §1                                  | konsistent (3 docs)                                                                                     |
| P2  | Dato-snapshot: klient-team fryses; fortid skrives ikke om                           | §2, §6, §8, §16 | 05-16 pkt 2; 05-20 pkt 2                 | §1 "sales bevarer snapshot"; App. A            | konsistent (3 docs)                                                                                     |
| P3  | Attribution-trekant sælger/klient/team; team via klient (ikke sælger)               | §3              | 05-16 ejerskabs-kæde                     | §1 attribution-resolver + klient-team-snapshot | konsistent                                                                                              |
| P4  | Superadmin = eneste hardkodede rolle                                                | §12             | 05-11 (princip 2); 05-14; 05-17 pkt 10   | App. A; (+permission-matrix:13; vision-pr.2)   | konsistent (4+ steder)                                                                                  |
| P5  | Permission: 3-niveau (Område→Page→Tab) + 2 akser; synlighed udledt af træ-placering | §12             | 05-17 pkt 2-5; 05-18 (4-dim→3+2)         | §1.7; App. A (rettelse 35)                     | konsistent (ordlyd: FF "hierarki" vs MA/MP "Hiraki")                                                    |
| P6  | Forretningslogik som data; algoritme=kode/værdi=data; alt drift i UI                | §9, §16         | 05-11 (db styres i UI)                   | §5 "UI styrer alt drift"; App. A               | konsistent (3 docs)                                                                                     |
| P7  | Vagten autoritativ for løn-timer, ikke stempelur                                    | §5              | (vagt-typer)                             | §2.2/§2.6; App. A "vagten bestemmer"           | konsistent (+lag-e, ÅBNE)                                                                               |
| P8  | Struktur (team/afdeling/klient) bevares evigt; kun PII anonymiseres                 | §11, §2         | 05-16 pkt 9; 05-20 pkt 3                 | §1; App. A "UPDATE aldrig DELETE"              | konsistent                                                                                              |
| P9  | Greenfield: 2.0 ≠ kopi af 1.0; migration pr. pakke                                  | §15             | 05-12; 05-14; 05-20                      | §0; App. A                                     | konsistent (3 docs)                                                                                     |
| P10 | FM på samme stamme (klient-dim, attribution, pricing)                               | §14             | 05-16 pkt 7 (FM-chef via rolle)          | §2; §5 "FM hænger på samme stamme"             | konsistent                                                                                              |
| P11 | Lønperiode-låsning; modposter i åben periode; attribution følger snapshot           | §8, §6          | —                                        | §1; App. A                                     | konsistent                                                                                              |
| P12 | Én rolle pr. medarbejder; én medarbejder i ét team; cross-team via rolle            | §12             | 05-16 pkt 7; 05-17 pkt 8-9               | §1.7; App. A "ingen M2M"                       | konsistent — MEN `org-rettigheds-model-UDKAST` (ÅBNE/fremtidig) foreslår skifte → **tilladt afvigelse** |
| P13 | Identitet én gang; Microsoft eneste login; ikke-matchet frem for gæt                | §10             | (Entra)                                  | §5 "Entra låst"; §1 identitets-master          | konsistent                                                                                              |
| P14 | Compliance-ansvarlige = konkrete medarbejdere, ikke rolle/permission                | §12             | 05-19; 05-18                             | §1.7/§1.13                                     | konsistent                                                                                              |
| P15 | Break-glass to-niveau godkendelse på låste data                                     | §12             | 05-21 (approve-disciplin)                | §1 break_glass; App. A                         | konsistent                                                                                              |
| —   | **retention-enum**                                                                  | —               | 05-14 (drop `legal`, indfør `permanent`) | §1.2 vs §1.13 vs rettelse 24                   | **DREVET FRA HINANDEN → B1**                                                                            |
| —   | **match-rolle pr. felt**                                                            | —               | 05-20 (match-rolle ud)                   | §1.2 (har den) vs rettelse 36 (fjernet)        | **DREVET FRA HINANDEN → B2**                                                                            |

**Vægt:** 15 forretnings-punkter lever i 2-4 docs hver (samme punkt, anden ordlyd). Mathias' overraskelse var berettiget — langt mere dublet end det oprindelige D1. To kopier (retention, match-rolle) ER drevet fra hinanden = B1/B2; resten er pt. konsistente, men hver er en fremtidig drift-kandidat. **Fortælling-konsekvens:** P1-P15 ER kernen i den ene sandhed — fortalt ét sted, gentaget tre. Dér hvor de skal samles til én sandhed, vinder MP's egne rettelser (B1/B2) hhv. v6-krav (M1/B3).

### Mathias sandhed — øvrige dubletter

- **D2** — `mathias-afgørelser-historik` ≈ near-dublet af sin slettede V4-version i v4-slettede-docs-mappen (arkiv — tilladt).
- **D3** — `vision-og-principper` (9 principper) overlapper FF (superadmin · algoritme=kode/værdi=data · identitet · anonymisering · P4/P6/P13/P8). Komplementær men overlappende — `vision` er den 4. visning af samme kerne.

### Byggeplan — interne dubletter

- **D4** — MP §5 "Det vi står inde for" (prosa) ≈ Appendix A "Lukkede beslutninger" (tabel) — samme afgørelser i to former. Bevidst (oversigt + opslag).
- **D5** — MP §0 dublerer LÅST-banneret fra vision/FF (overlap med M1/B3).

### Workflow

- **DW1 [stor]** — `disciplin` ER V5-proces-spec'en, og dens indhold er dublet på tværs af:
  - `mathias-afgørelser` proces-halvdel: 5-trins flow, severities (KRITISK/MELLEM/KOSMETISK/OPGRADERING/NEEDS-MATHIAS), qwers/qwerr/qwerg, gates, roller §9, modsigelses-disciplin, V2/V3-workflow-justeringer (05-16/17/18/20/21) — disciplin §2/§5/§8/§9 destillerer disse entries.
  - `gov-5-automation-plan`: disciplin §2 + §6.2 SAMMENFATTER gov-5's kæde-kurér/regelbog/gate-model/Mathias-flade.
  - V4-arbejds-disciplinen i v4-slettede-docs-mappen (arkiv): forgængeren (disciplin linje 9 lister "V5-ændringer fra V4").
- **DW2** — disciplin §9 glid-detector + §9.1 gate-hjælp + "vær god ikke virk god" ≈ `porten` (17 selvtest) + `partner-note` (forpligtelser). Samme selv-disciplin, anden form — porten/partner-note er V6-æraens destillat af samme substans.
- **DW3** — `SKILL.md` rolle-beskrivelse ≈ disciplin §9.1 (peger derhen — near-dublet).
- **DW4** — disciplin §10 inline-skabeloner (krav-dok/plan/slut-rapport/codex-review-prompt/pakke-status) ≈ de fire slettede skabelon-filer i v4-slettede-docs-mappen (arkiv) — disciplin absorberede dem inline.
- **DW5 [drift]** — disciplin §8 modsigelses-tabel ≈ `mathias-afgørelser` 05-20 pkt 1 (dokument-hierarki) — MEN drevet fra hinanden (disciplin har forretningsforstaaelse som LÅST, 05-20 har den ikke). Føder W1b.
- **DW6 [drift]** — gov-pakke-sekvensen (gov-1→6) står i `governance-vagt-krav` + `aktiv-plan` + disciplin Forudsætninger — samme liste tre steder, drevet fra hinanden på gov-6's definition (W3b).

### Åbne doks

- **D9** — `lag-e-tidsregistrering-krav.md` ≈ destillat-dublet af master-plan §2.2 (vagter, fravær, klient-fordeling, vagt-status-enum).
- **D10** — `lag-e-beregningsmotor-krav.md` ≈ destillat-dublet af master-plan §2.5 (lønarter, KPI'er, formel-engine, output_type).
- **D11** — `v6-plan` + `gov-6-krav-og-recon-UDKAST` overlapper på gov-6-problemformuleringen.
- **D12** — `rette-til-krav-og-data` + `rette-til-plan` overlapper (krav→plan-par, naturligt).

### Koderapportering

- **DK1 [register-system]** — `teknisk-gaeld` (G-register) + `huskeliste` (H-register) + `cutover-checklist` (go/no-go der refererer G'er + H'er + master-plan §4 trin 31) er ÉT sammenhængende register-system spredt på tre filer. Bevidst split (G=kode-gæld · H=eksterne handlinger · cutover=gate), men hver G/H-reference lever to steder (i registret + i den refererende fil) → mekanisk H-ref-integritet er netop derfor bygget ind i `governance-check` (disciplin §8.1). Konsistent, men struktur-dublet pr. design.
- **DK2 [pakke-kvartet]** — gov-5 lever i FEM filer: `gov-5-automation-krav-og-data` + `-plan` + `-status` (koderapport.) + `-recon` (ÅBNE) + `rapport-historik/2026-06-11-gov-5-automation`. Samme pakke, fem visninger. Plan §Formål er 1:1 af krav §Formål (planen erklærer det selv, linje 131). Status + `aktiv-plan` (ÅBNE) overlapper på merge-tilstand. Pakke-kvartet-dublet pr. design.
- **DK3 [intern]** — `gov-5-automation-plan`s "Kode-fund-håndtering"-append-log (runde V1→V21) gentager ACCEPT-mønstret ("ACCEPT — mekanisk", "P7(x)-diffen udvidet") runde efter runde. Struktur-repetition (append-log).
- **DK4 [snapshot]** — `rapport-historik/*` (gov-4, gov-docs-renhed, gov-5) er historiske snapshots der dublerer deres respektive krav/plan/status. `seneste-rapport` ≈ seneste rapport-historik-entry. Bevidst (datids-snapshots).
- **DK5** — `cutover-checklist` overlapper master-plan §4 trin 31 (cutover-leverancer) + teknisk-gaeld G-referencer. `claude-code-egenskaber` (egenskabs-katalog) er kilde for `v6-aktiverings-prompt`s recon-flade — komplementær reference, ikke dublet.

---

## FORTÆLLINGEN — Storks ene sandhed

Når al dublet og alle modsigelser er holdt op mod hinanden, står ÉN sammenhængende sandhed tilbage. Den fortælles her — beskrevet, ikke rettet.

### 1. Hvad Stork er (forretningen — kohærent på tværs af FF + MA + MP)

Stork driver Copenhagen Sales: et bureau der sælger for andre firmaer. **Klienten er omdrejningspunktet** — alt (salg, calls, vagter, løn, rapporter) hænger på den. **Dato-snapshot** fryser klient-team-bindingen ind, så fortiden aldrig skrives om; annulleringer rejser tilbage som modposter til det historiske team. Salg får pris via **regler** (produkt + kampagne + felt), ikke fra produktet alene. **Vagten** er autoritativ for løn-timer (ikke stempeluret); klient-tid kan give CPO/provision gennem samme regel-motor. **Lønperioden låser** alt; sene rettelser lander som modposter i en åben periode. **Forretningslogik er data, ikke kode** (algoritme=kode, værdi=data, alt drift i UI). **Identitet eksisterer én gang** (Microsoft-login, ingen bagdør). **PII adskilles fra forretningsdata** — struktur bevares evigt, kun PII anonymiseres. **Rettigheder** er 3-niveau (Område→Page→Tab) + 2 akser (kan_tilgå/kan_skrive × synlighed sig-selv/hierarki/alt), synlighed udledt af træ-placering; **superadmin er eneste hardkodede rolle**. **FM hænger på samme stamme** som TM. **Greenfield:** 2.0 er ikke en kopi af 1.0. → Dette er P1-P15 i dublet-kortet: fortalt ét sted, gentaget i fire (FF, MA, MP, vision).

### 2. Hvad der er bygget (master-plan)

DB-fundamentet står (trin 1-10 af 31): adgang, audit, klassifikation, periode-lås, anonymisering, identitet, org-træ, klient-skabelon. Beregning lever i `@stork/core` (ren funktion, snapshot-mønster); DB bærer stamme + FORCE RLS (default deny). Formel-systemet er tre-lags (rådata→beregning→output, ét output_type). Forretningsdomænerne (salg, vagter, løn, dashboards, FM) venter. Cutover er trin 31, når Mathias er overbevist.

### 3. Hvordan vi arbejder NU (V6)

`v6-krav-og-data.md` (godkendt 2026-06-13) er **den eneste ramme** — det eneste lukkede dokument; alt andet er åbent. **V5 (disciplin, kæde-flowet, qwerg, LÆSEFØLGE) er lukket som mislykket.** Vi frigør os fra den gamle struktur; hvert skridt tages løbende efter det logiske næste. `porten` + `partner-note` er de altid-aktive kvalitets-gates. LIGE NU bygges byggerammen selv (v6/gov-6: find hjælpemidler → ret til → genoptag).

### 4. Det ene brud i kohærens-laget (defekten — kendt, udskudt)

Fortællingen brydes ét sted: **V5-residuet.** `disciplin` (præsenterer sig som "det eneste proces-hjem"), `SKILL` (→disciplin), `master-plan` §0 (vision/FF "vinder ved konflikt"), `gov-5-automation`-docs, `governance-vagt-krav`, og LÅST-bannerne er skrevet i V5-æraen og læser som aktive — men v6-krav lukkede V5. Roden er **autoritets-ordenen (W1b):** "hvilket dok vinder?" besvares forskelligt fem steder; v6-krav §5 ("kun jeg er låst") er den gældende. Dertil to interne master-plan-drifter (**B1** retention-enum, **B2** match-rolle — §1.2 ikke synket med egne rettelser 24/36) og én stale status (**K2** rette-til-status "afventer klik" efter merge). **Alt dette er kendt og bevidst udskudt som [H029] → pakken efter gov-6.** Det er ikke nye fejl — det er den oprydning V6 endnu ikke har nået.

### 5. De tilladte afviger-lag (uden for fortællingen — pr. Mathias-regel)

- **ÅBNE (10 fremtids-/undersøgelses-docs)** MÅ afvige: `org-rettigheds-model-UDKAST` foreslår rolle-på-**knude** mod master-planens rolle-på-**medarbejder** (P12/B4) — et oplæg til Mathias, ikke en fejl. `gov-6-trio` + `v6-plan` + `rette-til`-parret er igangværende planlægning. `aktiv-plan` må pege på V5-flowet (working-pointer).
- **ARKIV (20 fortids-docs)** MÅ afvige: superseded V4/V5-versioner, bevaret som historik.

### 6. Hvordan én sandhed genoprettes (rapport, ikke handling)

Den gældende autoritets-regel er **v6-krav §5**. Forretnings-kernen (P1-P15) er sand og konsistent — den skal blot samles ét sted; hvor kopier driver, vinder master-planens egne rettelser (B1/B2) hhv. v6-krav (M1/B3/W1b). Selve oprydningen er **H029/gov-6's bord** — ikke denne rapports. Rapporten leverer kortet; handlingen er Mathias' beslutning.

---

## ANBEFALING — vej til et rent repo (kun anbefaling, intet handlet)

**Mål:** ét rent repo = én sandhed pr. emne, ét hjem. I dag ligger samme sandhed 3-4 steder, og V5-apparatet fylder selvom V5 er lukket. **Køretøjet er gov-6** (= H029). Net: 58 → ~15 levende docs uden tab af sandhed.

### FORBLIVER (rygraden — de eneste sandheder)

- **Ramme/autoritet:** `v6-krav-og-data` — det eneste låste; afgør alene "hvilket dok vinder" (løser W1b).
- **Forretnings-sandhed:** `forretningsforstaaelse` — hjemmet for P1-P15.
- **Bygge-spec:** `stork-2-0-master-plan` — den ene byggeplan.
- **Drift-registre:** `teknisk-gaeld` (G) · `huskeliste` (H) · `cutover-checklist` · `permission-matrix` · `claude-code-egenskaber`.
- **Live "hvor er vi":** `CLAUDE.md` · `v6-bro` · `aktiv-plan`.
- **Kvalitets-gates:** `porten` · `partner-note`.
- **Historik-hjem:** `rapport-historik/`.

### SAMLES / MERGES (kollaps dublet → ét hjem)

- **Arbejdsmåden:** `disciplin` + mathias-afgørelsers proces-halvdel + `gov-5-automation`-docs → **én V6-proces-doc**. Skrives når V6-metoden besluttes (gov-6); rør dem ikke før.
- **Autoritets-ordenen (W1b):** ligger 5 steder → saml i `v6-krav §5`; fjern de konkurrerende "LÅST/vinder"-udsagn (master-plan §0, disciplin §8, bannerne).
- **Lag E:** `lag-e-*` (×2) dublerer master-plan §2.2/§2.5 → fold ind når Lag E bygges.

### SLETTES → git-historik (per disciplin §4 + gov-6)

- **gov-5-automation** plan/status/recon → historik (behold krav-dok→arkiv + slut-rapport).
- **rette-til** plan/status → historik når lukket (K2).
- **governance-vagt-krav** → arkiv (familie-kontrakt færdig).
- **v4-slettede-docs/** (15, untracked) → git-historik (G063).
- **gov-6-trio + v6-plan** → fold når gov-6 er kørt.

### Rækkefølge (så intet bygges på sand)

1. Beslut V6-metoden → skriv den ÉNE proces-doc → slet V5-proces-laget.
2. Reducér autoritets-ordenen til v6-krav §5 alene.
3. Reconcile master-plan internt (B1 + B2).
4. Prune lukkede pakkers arbejdsfiler (gov-5, rette-til) per §4.
5. Fold v4-slettede + tynd arkiv.

### To beslutninger der er Mathias' (forretning, ikke mekanik)

- **B4 — rolle-model:** `org-rettigheds-model-UDKAST` (rolle på knude) vs. master-plan (rolle på medarbejder). Skal udkastet vinde eller forkastes?
- **Vision vs. forretningsforstaaelse:** fold vision ind (ét forretnings-hjem) eller behold separat? (overlap D3)

**Kerne-råd:** behold rygraden, lad gov-6 kollapse V5-laget + dubletterne til git-historik, fjern de konkurrerende autoritets-udsagn så kun v6-krav afgør hvad der vinder.

---

## Dækningsbevis (alle 58 docs)

**Metode pr. dok:** Read-tool ordret (store docs i chunks dækkende hele linje-spændet). Greps brugt KUN til at verificere konkrete fund (permission-matrix akse-model, gov-5-status stale-tegn, aktiv-plan markør) — ikke som erstatning for læsning.

| Gruppe          | Dok                                                          | Læst              | Note                                                                                                                                              |
| --------------- | ------------------------------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mathias sandhed | vision-og-principper.md                                      | ✓ ordret          | LÅST-banner (M1)                                                                                                                                  |
| Mathias sandhed | forretningsforstaaelse.md                                    | ✓ ordret          | LÅST-banner (M1, D1)                                                                                                                              |
| Mathias sandhed | v6-krav-og-data.md                                           | ✓ ordret          | beviset for M1/M2/M3                                                                                                                              |
| Mathias sandhed | mathias-afgoerelser-historik.md                              | ✓ ordret (656 l.) | M2/M3/D2                                                                                                                                          |
| Byggeplan       | stork-2-0-master-plan.md                                     | ✓ ordret (1-2090) | B1-B4, D4-D5                                                                                                                                      |
| Workflow        | disciplin.md                                                 | ✓ ordret (528 l.) | W1 (V5-kernen)                                                                                                                                    |
| Workflow        | governance-vagt-krav-og-data.md                              | ✓ ordret          | W3                                                                                                                                                |
| Workflow        | v6-aktiverings-prompt.md                                     | ✓ ordret          | V6, konsistent                                                                                                                                    |
| Workflow        | v6-bro.md                                                    | ✓ ordret          | V6, konsistent                                                                                                                                    |
| Workflow        | .claude/porten.md                                            | ✓ ordret          | ramme-neutral gate                                                                                                                                |
| Workflow        | .claude/partner-note.md                                      | ✓ ordret          | D6                                                                                                                                                |
| Workflow        | CLAUDE.md                                                    | ✓ ordret          | beviset for W1/Å1                                                                                                                                 |
| Workflow        | claude-ai/SKILL.md                                           | ✓ ordret          | W2, D8                                                                                                                                            |
| Workflow        | codex/sandbox-opsaetning.md                                  | ✓ ordret          | ren teknik                                                                                                                                        |
| Åbne            | aktiv-plan.md                                                | ✓ ordret          | Å1 (peger på V5)                                                                                                                                  |
| Åbne            | gov-5-automation-recon.md                                    | ✓ ordret          | Å3                                                                                                                                                |
| Åbne            | gov-6-krav-og-recon-UDKAST.md                                | ✓ ordret          | gov-6, D11                                                                                                                                        |
| Åbne            | gov-6-forslag-og-udskudte.md                                 | ✓ ordret          | forslag-katalog                                                                                                                                   |
| Åbne            | v6-plan.md                                                   | ✓ ordret          | Å2, D11                                                                                                                                           |
| Åbne            | rette-til-krav-og-data.md                                    | ✓ ordret          | D12                                                                                                                                               |
| Åbne            | rette-til-plan.md                                            | ✓ ordret          | D12                                                                                                                                               |
| Åbne            | lag-e-tidsregistrering-krav.md                               | ✓ ordret          | D9                                                                                                                                                |
| Åbne            | lag-e-beregningsmotor-krav.md                                | ✓ ordret          | D10                                                                                                                                               |
| Åbne            | org-rettigheds-model-UDKAST.md                               | ✓ ordret          | B4 (foreslået skifte)                                                                                                                             |
| Koderapport.    | teknisk-gaeld.md                                             | ✓ ordret (709 l.) | G-register, konsistent                                                                                                                            |
| Koderapport.    | huskeliste.md                                                | ✓ ordret          | H-register, konsistent                                                                                                                            |
| Koderapport.    | permission-matrix.md                                         | ✓ ordret + grep   | konsistent (intet fund)                                                                                                                           |
| Koderapport.    | cutover-checklist.md                                         | ✓ ordret          | konsistent (refs rettet #157)                                                                                                                     |
| Koderapport.    | claude-code-egenskaber.md                                    | ✓ ordret          | ren reference                                                                                                                                     |
| Koderapport.    | gov-5-automation-krav-og-data.md                             | ✓ ordret          | D13                                                                                                                                               |
| Koderapport.    | gov-5-automation-plan.md                                     | ✓ ordret (1-865)  | K1, D14                                                                                                                                           |
| Koderapport.    | gov-5-automation-status.md                                   | ✓ ordret + grep   | K1/K3 (merged+stoppet)                                                                                                                            |
| Koderapport.    | rette-til-status.md                                          | ✓ ordret          | K2 [NY] stale                                                                                                                                     |
| Koderapport.    | seneste-rapport.md                                           | ✓ ordret          | D16                                                                                                                                               |
| Koderapport.    | rapport-historik/2026-06-10-gov-4-branch-protection.md       | ✓ ordret          | historik, D15                                                                                                                                     |
| Koderapport.    | rapport-historik/2026-06-10-gov-docs-renhed.md               | ✓ ordret          | historik, D15                                                                                                                                     |
| Koderapport.    | rapport-historik/2026-06-11-gov-5-automation.md              | ✓ ordret          | historik, D15                                                                                                                                     |
| Koderapport.    | rapport-historik/README.md                                   | ✓ ordret          | historik                                                                                                                                          |
| ARKIV (20)      | README + gov-4×2 + gov-docs-renhed×2 + v4-slettede-docs (15) | —                 | Mathias-regel: ingen review-pligt. README + gov-4/gov-docs-renhed krav/plan tidligere skimtet; v4-slettede-docs er slettede V4-versioner (datid). |

**Config (ikke prosa):** .claude/settings.json, settings.local.json — noteret, ikke prosa-reviewet.

**Sammentælling:** 4 (Mathias sandhed) + 1 (Byggeplan) + 9 (Workflow) + 10 (Åbne) + 14 (Koderapportering) = **38 docs review-læst ordret** + **20 arkiv-docs** (undtaget) = **58 docs**. Ingen rettelser foretaget i nogen gennemgået doc.
