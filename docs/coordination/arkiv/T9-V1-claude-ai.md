# T9-plan V1 — Claude.ai forretnings-dokument-review

**Reviewer:** Claude.ai (forretnings-dokument-konsistens)
**Plan-version:** V1
**Dato:** 2026-05-17
**Resultat:** FEEDBACK (2 MELLEM-fund + 2 KOSMETISKE-fund)

---

## Sammenfatning

Planen er omfattende, struktureret og demonstrerer solid forståelse af krav-dok. Fire-dokument-konsultations-tabellen er korrekt udfyldt med konkrete referencer (ingen "hele filen", ingen "nej" i konsulteret-kolonnen). Alle 32 Mathias-afgørelser fra krav-dok sektion 10 er eksplicit mappet til plan-elementer. Strukturelle beslutninger (1-10) er begrundet og bygger korrekt på lærdom fra arkiveret V1-V3-runde.

To MELLEM-fund relaterer sig til konkret funktions-dækning fra krav-dok sektion 4. To KOSMETISKE-fund er præciseringer.

Per anti-glid-disciplin runde 1 stopper MELLEM-fund planen. V2 forventes med konkret håndtering af de to MELLEM-fund.

---

## Fund 1 — [MELLEM] "Hent"-funktioner i krav-dok sektion 4 har ikke eksplicit dækning

**Konkret afvigelse:**

Krav-dok sektion 4 (Funktioner T9 skal levere) specificerer eksplicit "Hent"-funktioner i flere grupper:

- **4.1 Funktioner på organisations-træet:**
  | Hent træ | Bruger kan se hele træet med alle aktive knuder |
  | Hent historisk træ | Bruger kan se hvordan træet så ud på en given dato i fortiden |

- **4.2 Funktioner på medarbejder-placering:**
  | Hent placering | Bruger kan se hvor en medarbejder er placeret aktuelt |
  | Hent historisk placering | Bruger kan se hvor en medarbejder var placeret på en given dato i fortiden |

- **4.3 Funktioner på klient-til-team-tilknytning:**
  | Hent klients team | ... aktuelt |
  | Hent historisk tilknytning | ... på en given dato i fortiden |

- **4.5 Funktioner på permission-elementer:**
  | Hent struktur | Bruger kan se alle aktive områder/pages/tabs |

- **4.6 Funktioner på rettigheder:**
  | Hent rolles rettigheder | Bruger kan se alle rettigheder for en given rolle |

- **4.7 Funktioner på fortrydelse:**
  | Hent ventende ændringer | ... |

Planens RPC-liste (Valg 1) specificerer ingen "Hent"-RPC'er. Planen forudsætter implicit at frontend læser via direkte SELECT mod `using (true)`-tabeller (PostgREST). Denne tilgang dækker "Hent aktuel"-tilfælde teknisk, men:

1. "Hent historisk træ/placering/tilknytning" på en given dato kræver et SQL-pattern der joiner versionerede placements med en filter-dato. Det er ikke trivielt for frontend at konstruere konsistent og kan resultere i forskellige implementationer pr. konsument.

2. Krav-dok sektion 4 specificerer funktioner som **funktioner T9 skal levere**, ikke som "implicit dækket via SELECT". Planens "alle 9 funktions-grupper leveres 1:1" (Konklusion-sektion) er ikke 1:1 hvis "Hent"-funktionerne kun er åbne SELECT'er uden dokumenteret pattern.

**Anbefalet handling: V2-rettelse**

Planen skal i V2 enten:

- **A)** Tilføje dedikerede RPC'er for "Hent"-funktionerne, særligt for historisk-tilfælde (fx `org_tree_at(p_date date)`, `employee_placement_at(p_employee_id, p_date date)`, `client_placement_at(p_client_id, p_date date)`)
- **B)** Eksplicit dokumentere SELECT-pattern for frontend, inkluderet historisk-queries, med konkret SQL-eksempel pr. funktion fra krav-dok sektion 4
- **C)** En kombination — dedikerede RPC'er for historisk-tilfælde (hvor SQL-pattern er ikke-trivielt), åben SELECT for aktuel-tilfælde

Code's vurdering om hvilken tilgang er bedst forretnings-mæssigt mest sammenhængende.

---

## Fund 2 — [MELLEM] Krav-dok sektion 4.4 (Funktioner på rolle og medarbejder) ikke eksplicit dækket

**Konkret afvigelse:**

Krav-dok sektion 4.4 specificerer:

| Funktion     | Beskrivelse                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| Tildel rolle | Bruger tildeler en rolle til en medarbejder                                                            |
| Skift rolle  | Bruger skifter en medarbejders rolle                                                                   |
| Fjern rolle  | Bruger fjerner rolle fra medarbejder (medarbejderen mister adgang udover personlige basale funktioner) |

Krav-dok sektion 3.3 specificerer: "Hver medarbejder har én rolle ad gangen. Rolle sættes på medarbejderen i UI."

Planens Valg 1 (RPC'er) nævner: "Eksisterende RPC'er fra trin 5 bevares uændret: `employee_upsert`, `role_upsert`, `role_page_permission_upsert`". Implicit antagelse: rolle-til-medarbejder-tildeling håndteres via trin 5's eksisterende `employee_upsert`-RPC (med rolle-felt) eller via en eksisterende dedikeret RPC.

Antagelsen er ikke verificeret i planen. Det er uklart om:

1. Eksisterende `employee_upsert` faktisk håndterer rolle-tildeling/-skift via FK
2. Findes der eksisterende RPC'er specifikt for rolle-tildeling/-skift/-fjernelse?
3. Skal T9 tilføje nye RPC'er hvis trin 5's eksisterende ikke dækker alle tre funktioner (Tildel/Skift/Fjern)?
4. "Fjern rolle" — hvordan virker det? Sættes rolle_id til NULL? Eller specifik "ingen rolle"-rolle? Krav-dok specificerer det ikke teknisk, men funktions-kravet er der.

**Anbefalet handling: V2-rettelse**

Planen skal i V2 eksplicit:

- Verificere mod trin 5's eksisterende RPC-katalog at funktionerne Tildel/Skift/Fjern rolle reelt er dækket
- Hvis trin 5 ikke dækker alle tre: tilføje T9-RPC'er der dækker manglerne (fx `employee_role_assign`, `employee_role_change`, `employee_role_remove`)
- Specificere hvordan "Fjern rolle" implementeres semantisk

Dette er en MELLEM-finding fordi krav-dok sektion 4.4 er eksplicit i scope (per krav-dok sektion 1: "T9 leverer fundamentet for rettighedsstyring"), og planen kan ikke approve som leverende "alle 9 funktions-grupper 1:1" uden at adressere det.

---

## Fund 3 — [KOSMETISK] Mindre navngivnings-modsigelse i krav-dok mellem afgørelse 18 og 25

**Konkret afvigelse:**

Krav-dok afgørelse 18 specificerer:

> Mathias og Kasper har superadmin-rollen; placeret på **"Ejere"-afdeling**

Krav-dok afgørelse 25 specificerer:

> Alle navne på afdelinger og teams oprettes i UI; **krav-dokumentet specificerer ingen konkrete navne**

De to afgørelser er i tilsyneladende modsigelse: afgørelse 18 nævner et konkret navn ("Ejere"), mens afgørelse 25 siger ingen konkrete navne i krav-dokumentet.

Planens Valg 12 håndterer det pragmatisk ved at SEED "Ejere"-afdelingen (bootstrap, ikke ny ramme-beslutning) og lade alle andre navne være UI-oprettelse. Det er forretningsmæssigt korrekt — Mathias har eksplicit specificeret at "Kasper og jeg er i en 'afdeling' med navnet ejere" (afdæknings-session 2026-05-17), så "Ejere" er forretningssandhed for de eksisterende medarbejdere mg@ og km@, ikke et frit valg af navn.

Per modsigelses-disciplin er "intern modsigelse i krav-dokumentet (Mathias afgør om den skal præciseres)" plan-blokerende. Men i praksis er dette IKKE en reel modsigelse fordi:

- Afgørelse 18 specificerer eksisterende forretningssandhed for bootstrap
- Afgørelse 25 specificerer princip for fremtidige navne

Konflikten er præsentations-mæssig, ikke reel.

**Anbefalet handling: G-nummer-kandidat for præcisering af krav-dok**

Krav-dok-tekst i afgørelse 25 kan præciseres til: "Alle navne på afdelinger og teams **oprettes herefter** i UI; krav-dokumentet specificerer ingen konkrete navne **udover bootstrap-knude for eksisterende ejere (jf. afgørelse 18)**."

Eller alternativt: afgørelse 18 kan omformuleres til at fjerne navnet eksplicit og lade Mathias selv vælge navnet ved første UI-oprettelse.

Mathias afgør. Denne KOSMETISKE finding stopper IKKE planen. Plan kan approve med Valg 12 som er.

---

## Fund 4 — [KOSMETISK] Sproglig konsistens mellem dansk krav-dok og engelske ENUM-værdier

**Konkret afvigelse:**

Planens Valg 1 specificerer:

```
org_nodes.node_type ENUM ('department', 'team')
```

Krav-dok sektion 3.1.3 bruger danske ord:

> Hver knude har en type: **afdeling** eller team. Typen sættes i UI.

Krav-dok sektion 5.2 + 6.2 bruger også danske ord for funktionalitet ("knude-løs", "synlighed", "Sig selv", "Hiraki", "Alt"), mens planen mapper til engelske ENUM-værdier ('self', 'subtree', 'all').

Per krav-dok sektion 9 (Tekniske valg overladt til Code) er "Konkrete tabel- og kolonne-navne" Code's bord. Engelske ENUM-værdier i kode er teknisk normalt og acceptabelt.

Risiko: UI-implementation skal mappe mellem engelske kode-værdier ('department') og danske UI-tekster ("afdeling"). Det er trivielt at håndtere via i18n-lag eller direct mapping, men kan være værd at flagge for konsistens.

**Anbefalet handling: kosmetisk note**

Ingen rettelse nødvendig. Mapping mellem engelske ENUM-værdier og danske UI-tekster håndteres af lag F. Bør være bevidst valg dokumenteret i V2's tekst (fx i Valg 1: "ENUM-værdier er engelske; UI-mapping til danske tekster ligger i lag F").

---

## Modsigelses-tjek

Per Modsigelses-disciplin (mathias-afgoerelser 2026-05-17 + arbejds-disciplin.md): planen er reviewet for modsigelse mod fire-dokument-rammen.

| Dokument                                   | Konflikt observeret?                                                                                                                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/strategi/vision-og-principper.md`    | Nej. Vision-princip 2 nævner "Team-træ + Page/tabs"; planens udvidelse til "Område → Page → Tab" er konsistent (granulering, ikke modsigelse).                                           |
| `docs/strategi/stork-2-0-master-plan.md`   | Nej. §1.7 (helpers, FORCE RLS), §1.11 (core_identity-schema), §3 (CI-blockers) honoreres. Subtree-RLS-benchmark udskydes til trin 14 — pragmatisk og dokumenteret som G-nummer-kandidat. |
| `docs/coordination/mathias-afgoerelser.md` | Mindre intern modsigelse mellem 2026-05-17-entry pkt 10 (Ejere-navn) og pkt 11 (ingen konkrete navne) — flagget som KOSMETISK Fund 3. Ikke plan-blokerende.                              |
| `docs/coordination/T9-krav-og-data.md`     | Nej intern modsigelse. To MELLEM-fund er om manglende dækning af specificerede funktioner, ikke modsigelse.                                                                              |

---

## Codex-opgraderings-rolle (2026-05-17)

Planen inviterer eksplicit OPGRADERING-forslag fra Codex på Valg 1-12 (Konsistens-tjek-sektion). Det er konsistent med ny disciplin. Code's V2 skal håndtere både mine MELLEM-fund og eventuelle Codex OPGRADERING-forslag i åbnings-sektion.

---

## Konklusion

**Resultat: FEEDBACK — V2 forventes**

2 MELLEM-fund kræver håndtering i V2:

1. "Hent"-funktioner fra krav-dok sektion 4 ikke eksplicit dækket
2. Rolle-til-medarbejder-tildeling (krav-dok 4.4) ikke eksplicit specificeret

2 KOSMETISKE-fund er G-nummer-kandidater eller præciseringer: 3. Navngivnings-modsigelse i krav-dok mellem afgørelse 18 og 25 (Mathias-præcisering) 4. Engelske ENUM-værdier vs danske UI-tekster (dokumenteres som bevidst valg)

Plan ellers solid: struktur, lineær dependency-chain, korrekt brug af lærdom fra arkiveret runde, fyldig fire-dokument-konsultation, ærlig flagging af G-nummer-kandidater på Valg 3+4.

Klar til V2 efter Code's håndtering af MELLEM-fund + Codex OPGRADERING-forslag (parallelt review).
