# Masterplan — samlet rettelse (tekst til dit `ok`)

2026-09-24 · dokument: `docs/strategi/stork-2-0-master-plan.md` (ens på `main` @ `0eb9b25` og på arbejdsbranchen @ `87a877b` — `git diff` er tom) · hører til workflow-planen (v41) §4.3 og §5 · indarbejdet: ændringslisten `aendringer-41.md` H5, H6 og S13 (dit ord 24/9 »jeg går med dine anbefalinger«).
Intet er ændret. Teksten her anvendes først, når du har sagt `ok` til planen.

**Ændringslisten 24/9 i denne fil:**
- **H6** (»afgøres ved trin X« får en modtager): kravets poster på listen »Afgøres ved senere trin« / »IKKE i scope« med trin-nummer skrives ind i masterplanen ved det trin, med `slut ok`. For pakke 1 står det i Del B, B2 (trin 24) og B3 (trin 29).
- **H5** (én ledger): A1 peger på ledgeren `docs/sandhed/mathias-ord.md`.
- **S13** (slutprøven på testdatabasen): masterplanen nævner ikke slutprøven eller driftsdata som prøvegrundlag (`grep -i "slutprøve\|driftsdata\|rigtige data"` i filen @ `87a877b`: 0 træf). Der er derfor intet at rette her; reglen står i `disciplin.md` §2 trin 4.

**Sådan læses den.** Hver rettelse: *afsnit/linje · NUVÆRENDE (ordret) · NY (ordret) · bevis.* Linjenumre er fra filen i dag. Tabelrækker er gengivet med kolonnefyldet (mellemrum) trukket sammen; ved indsættelse justerer Prettier kolonnerne.
- **Del A** — rettes nu: fejl om det der er bygget, plus rangordenen i §0.
- **Del B** — skrevet færdig nu, men **træder i kraft med `slut ok`** for pakke 1.
- **Del C** — rettes ikke her: steder hvor masterplanen modsiger forretningsforståelsen, eller hvor det kræver din forretningsbeslutning. Der står, i hvilket trin det afgøres.

Dine regler for rangorden, som gælder for alt nedenfor (ordret):
- vision-og-principper l.5: »ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette«
- masterplan §0 l.34: »Konflikt mellem master-plan og vision-dokument løses ved at master-planen tilrettes — vision-dokumentet er autoritativ kilde.«
- masterplan §0 l.40: »Ved konflikt vinder stamme-docs (vision + forretningsforstaaelse …)«

---

## Del A — rettelser nu

### A1 · §0 »Strategiske retning-skift« l.40 — rangorden og døde stier

NUVÆRENDE:
> Mathias' tanker pr. pakke lever i `docs/coordination/<pakke>-krav-og-data.md` (pakke-kontrakt). Tanker der ændrer ramme på tværs af pakker går ind i `docs/strategi/forretningsforstaaelse.md` (LÅST stamme-doc) eller `docs/strategi/vision-og-principper.md` (LÅST evig, ved princip-niveau). Master-planen reflekterer arkitektur-konsekvensen som Appendix C-rettelser. Ved konflikt vinder stamme-docs (vision + forretningsforstaaelse — indbyrdes modsigelse mellem de to er et hul → STOP → Mathias lukker, D4) → krav-dok → master-plan tilrettes.

NY:
> Mathias' tanker pr. pakke lever i pakkens krav-dokument (pakke 1: `docs/sandhed/krav/lokations-skabelon-krav.md`). Hans ord står ordret i ledgeren `docs/sandhed/mathias-ord.md` (én for hele Stork). Tanker der ændrer ramme på tværs af pakker går ind i `docs/strategi/forretningsforstaaelse.md` (LÅST stamme-doc) eller `docs/strategi/vision-og-principper.md` (LÅST evig, ved princip-niveau). Master-planen reflekterer arkitektur-konsekvensen som Appendix C-rettelser.
>
> **Rangorden:** Ved konflikt vinder stamme-docs (vision + forretningsforstaaelse — indbyrdes modsigelse mellem de to er et hul → STOP → Mathias lukker, D4). Master-planen er sandhed for det en pakke rører. Et krav eller en plan, der afviger fra master-planen, er altid Mathias' valg: afvigelsen fremlægges for ham, og med hans godkendelse rettes master-planen som en Appendix C-rettelse.

Bevis / begrundelse:
- Workflow-planen §5 (bekræftelses-linje): »masterplanen er sandhed for det en pakke rører; en afvigelse er altid dit valg. `disciplin.md` §8 (»retningsgivende«) og masterplanens §0 rettes, så de siger det samme.«
- Dine ord: M-54 »Vi skal have er workflow som sikre mathias sandhed (forretningsforstaaelse, vision-og-principper og masterplan) = krav = plan = byg.« og M-50 »Da jeg skrev storks ontologi mente jeg mine dokumenter.«
- Den gamle kæde »→ krav-dok → master-plan tilrettes« gav kravet forrang for masterplanen. Den er erstattet af »afvigelse = dit valg«.
- Stien: `docs/coordination/` på branchen indeholder kun `workflow-faerdiggoerelse-krav-og-data.md` (`git ls-tree`). Pakke 1's krav ligger i `docs/sandhed/krav/`.
- Ledgeren: én ledger for hele Stork i `docs/sandhed/mathias-ord.md` (ændringslisten H5; `disciplin.md` §4). Pakke 1's ledger flyttes dertil (`oevrige-rettelser.md` §8). **Tidspunkt:** A1 lægges ind i samme ændring som flytningen, så stien findes, når teksten peger på den.
- Uændret: stamme-docs og D4 er ordret bevaret. Det samme gælder l.34 (vision er autoritativ).
- `disciplin.md` §8 skal sige det samme. Det sker i omskrivningen af `disciplin.md` (en anden tekst), ikke her.

### A2 · §0 l.42 — kilden til dine tidligere afgørelser

NUVÆRENDE:
> Historiske ramme-niveau-beslutninger fra V3 og tidligere lever i `docs/coordination/arkiv/mathias-afgoerelser-historik.md` som læsbar reference (ikke aktiv kilde).

NY:
> Historiske ramme-niveau-beslutninger fra V3 og tidligere lever i git-historikken: `docs/coordination/arkiv/mathias-afgoerelser-historik.md` @ `0eb9b25` (main), som læsbar reference (ikke aktiv kilde). Henvisningerne »mathias-afgoerelser <dato>« i denne plan peger dertil.

Bevis:
- På `main` @ `0eb9b25` ligger filen i `docs/coordination/arkiv/`.
- På branchen er den flyttet til `docs/foraeldet-workflow/arkiv/`. Den mappe fjernes ifølge workflow-planen §4.4.
- Masterplanen citerer filen i l.353, 370, 484, 488, 667 og 1519. En commit-reference holder også efter oprydningen (bilag O4/V19: »eller masterplanens henvisninger → commit«).

### A3 · Hoved l.5-6 — antal rettelser og dato

NUVÆRENDE:
> **Status:** Komplet med 45 rettelser indlejret (Appendix C — bemærk at tabel-numrene 18-29 er duplikerede pga. to lag af nummerering; antallet refererer faktiske row-entries)
> **Dato:** 13. maj 2026

NY:
> **Status:** Komplet med 49 rettelser indlejret (Appendix C: 1-17, 18a-29a, 18-37. Rækkerne 18a-29a er det første nummereringslag, omdøbt ved rettelse 37, så hvert nummer er entydigt)
> **Dato:** 13. maj 2026 (oprindelig) · senest rettet ved rettelse 37 (Appendix C)

Bevis: Appendix C har i dag 48 rækker (l.1960-2007: 1-29 og derefter 18-36), ikke 45. Med rettelse 37 (A24) bliver det 49.

### A4 · Appendix C l.1977-1988 — dobbelt nummerering

NUVÆRENDE: Første lag har numrene `| 18 |` … `| 29 |` (l.1977 »Partiel salgs-annullering …« til l.1988 »Display-navn på sale_items …«), og andet lag bruger de samme numre `| 18 |` … `| 29 |` (l.1989-2000).

NY: Kun første lag omdøbes. l.1977-1988 får `| 18a |`, `| 19a |`, `| 20a |`, `| 21a |`, `| 22a |`, `| 23a |`, `| 24a |`, `| 25a |`, `| 26a |`, `| 27a |`, `| 28a |`, `| 29a |`. Rækkernes indhold er uændret. Andet lag (l.1989-2000) beholder 18-29.

Bevis: Alle henvisninger i repoet til »rettelse 18-29« betyder andet lag. Eksempler:
- masterplan l.1840 »rettelse 18«, l.1488/1618 »rettelse 19«, l.1857 »rettelse 20«, l.1930 »rettelse 28«
- migrationerne »rettelse 18 A3«, »19 C3/C4«, »24«, »29« og `t9_seed_owners.sql:179` »rettelse 26 + 31«
- `fitness.mjs` »rettelse 23«

Ingen henvisning bruger første lags 18-29 (grep over repoet). Omdøbningen bryder derfor ingen henvisning.

### A5 · §1.2 l.178 og l.180 — retention-typer og default

NUVÆRENDE:
> - 4 retention-typer: time_based / event_based / legal / manual (med tilhørende jsonb-værdi)
> - Default retention-type: time_based. `legal` reserveres til lovgivnings-bundne entiteter

NY:
> - 4 retention-typer: time_based / event_based / manual / permanent (med tilhørende jsonb-værdi). `permanent` kun via allowlist `is_permanent_allowed` (§1.13)
> - Default retention-type: NULL — intet valgt; admin vælger eksplicit pr. kolonne i UI (§1.13, vision-princip 4)

Bevis:
- `20260514180500_d1_d2_drop_legal_convert_rows.sql:17-22`: CHECK-reglen tillader kun `retention_type is null or retention_type in ('time_based', 'event_based', 'manual', 'permanent')`. Kolonnen har ingen default.
- Masterplanen siger selv det samme i §1.13 l.660-661 og rettelse 24 (l.1995).
- Vision princip 4 (ordret): »Ingen PII, ingen retention, ingen anonymisering, ingen audit-opgradering medmindre det aktivt vælges i UI.«
- *Ikke rettet:* »Match-rolle pr. felt« (l.179) er korrekt. Kolonnen `match_role` findes i klassifikations-registret (`20260514120005_t1_data_field_definitions.sql:20`). Rettelse 36 fjernede kun match-rollen på klienten (§1.8).

### A6 · §1.3 l.196 — audit-undtagelsen

NUVÆRENDE (sætning i afsnittet):
> Allowlist håndhævet statisk i `scripts/fitness.mjs` (`AUDIT_EXEMPT_SNAPSHOT_TABLES`) — tilføjelse kræver kode-commit.

NY:
> Allowlist håndhævet statisk i `scripts/fitness.mjs` (`AUDIT_EXEMPT_SNAPSHOT_TABLES`) — tilføjelse kræver kode-commit. Listen indeholder i dag `core_money.commission_snapshots` og `core_identity.org_node_closure` (closure-tabellen afledes af `org_node_versions`, som selv har audit).

Bevis: `scripts/fitness.mjs:130-136`.

### A7 · §1.6 l.337-340 — benchmark for lock-pipeline

NUVÆRENDE:
> **Benchmark-test i CI:**
>
> - Performance-test som CI-blocker i trin 7 (periode-skabelon) med syntetisk data svarende til 500 medarbejdere × 4 ugers data × 100k sales
> - Fail hvis lock-pipeline overskrider 10s SLA

NY (de to punkter uændrede; ét punkt tilføjes):
> **Benchmark-test i CI:**
>
> - Performance-test som CI-blocker i trin 7 (periode-skabelon) med syntetisk data svarende til 500 medarbejdere × 4 ugers data × 100k sales
> - Fail hvis lock-pipeline overskrider 10s SLA
> - **Status:** ikke bygget i trin 7. Udskudt til trin 14/22 (§4.2 »Lock-pipeline fuld benchmark«; teknisk-gaeld G031)

Bevis:
- `supabase/tests/` har kun `smoke/ negative/ break_glass/ classification/`, både på `main` og på branchen.
- Ingen benchmark-fil har nogensinde ligget i git (`git log --all -- 'supabase/tests/benchmark*'` er tom).
- Masterplanen siger selv i l.1618, at det er udskudt. Det samme står i `teknisk-gaeld.md` G031.

### A8 · §1.7 l.372-375 — permission-modellen har fire niveauer

NUVÆRENDE:
> - Permission-elementer er DATA i DB i **tre niveauer**: Område → Page → Tab. Alle tre niveauer kan oprettes/deaktiveres i UI uden deploy
> - Permission-elementer er IKKE et træ — de er steder hvor rettigheder gælder, nestede i tre niveauer
> - Page-implementation (React-komponent) er kode; registret er data
> - **To akser pr. (rolle × område × page × tab):**

NY:
> - Permission-elementer er DATA i DB i **fire niveauer**: Område → Page → Tab → Handling. Alle fire niveauer kan oprettes/deaktiveres i UI uden deploy. Handlings-niveauet (`permission_actions`) er tilføjet 2026-05-21 (T9-supplement-2; mathias-afgoerelser 2026-05-21, handlings-granularitet)
> - Permission-elementer er IKKE et træ — de er steder hvor rettigheder gælder, nestede i fire niveauer
> - Page-implementation (React-komponent) er kode; registret er data
> - En konfigureret handling kræver både handlings-grant og tab-`can_write` (undtagen handlinger markeret `bypass_tab_write`). Kode-låste flag pr. handling: `requires_second_approver`, `has_undo`, `bypass_tab_write`. UI-redigerbart: `second_approver_type` (`above` / `superadmin`)
> - **To akser pr. (rolle × område × page × tab × handling):**

Bevis:
- `20260521100003_t9_supplement_2_permission_actions.sql:1-37`: tabellen og flagene.
- Samme fil l.58-60: `role_permission_grants.action_id`.
- Samme fil l.97-160: `permission_resolve` slår op i rækkefølgen handling → tab → page → område.
- Din forretningsforståelse §12 l.207 (ordret): »Stork skal kunne definere rettigheder pr. side og pr. handling i UI uden teknisk ændring«. Masterplanen halter altså efter både koden og dit låste dokument.

### A9 · §1.7 l.469 — opslagsrækkefølge

NUVÆRENDE:
> - Arve-aware lookup: tab → page → area → default-deny

NY:
> - Arve-aware lookup: handling → tab → page → area → default-deny

Bevis: som A8 (`permission_resolve`, l.109-160 i samme migration).

### A10 · §1.7 l.474 og l.477 — skrive-RPC'erne kører som SECURITY DEFINER

NUVÆRENDE:
> - Alle write-RPCs er SECURITY INVOKER med `has_permission`-check FØR write
>
> - Gælder write-tabeller: `pending_changes`, `undo_settings`, `permission_areas`, `permission_pages`, `permission_tabs`, `role_permission_grants`

NY:
> - Alle write-RPCs er SECURITY DEFINER (jf. §1.1: sanktionerede write-RPC'er der selv håndhæver adgang) med `has_permission`-check FØR write. Konverteret fra SECURITY INVOKER 2026-06-07 (gov-3b-3, migrationer `20260607100001`–`20260607110003`). Samtidig er alle direkte skrive-rettigheder for `authenticated` på core_* fjernet (`20260607110004`, REVOKE; håndhæves af fitness `app-write-revoke-discipline`). Skrivning sker kun gennem disse RPC'er
>
> - Gælder write-tabeller: `pending_changes`, `undo_settings`, `permission_areas`, `permission_pages`, `permission_tabs`, `permission_actions`, `role_permission_grants`

Bevis:
- `20260607100001_core_identity_secdef_permission_action.sql:1-9`: »konvertér permission_action-RPC'er INVOKER → SECURITY DEFINER«. Det samme gælder `…100002-100004` og `…110001-110003`.
- `20260607110004_…revoke_authenticated_core_writes.sql:1-3`: »alle 14 T9-write-RPC'er er nu SECURITY DEFINER«.
- Et gennemløb af alle migrationer viser, at alle 21 funktioner, der sætter `stork.t9_write_authorized`, i deres seneste udgave er SECURITY DEFINER.
- Skrive-policies med session-variablen findes på de syv nævnte tabeller, inkl. `permission_actions`.
- `scripts/fitness.mjs:1728` (`appWriteRevokeDiscipline`).
- §1.1 l.160 blev rettet samme dag (commit `a14518a`), men §1.7 blev ikke. Dokumentet modsagde derfor sig selv.

### A11 · §3 CI-blocker 13 l.1471 — migrationsnavne

NUVÆRENDE:
> 13. **Migration-naming** med schema-præfiks: `<14digits>_<schema>_<snake_case>.sql`

NY:
> 13. **Migration-naming**: `<14digits>_<snake_case>.sql` (håndhævet af fitness `migration-naming`). Schema-præfiks kræves ikke; historikken bruger blandt andet trin- og schema-præfikser, fx `20260521000001_t10_tables.sql` og `20260607100001_core_identity_secdef_permission_action.sql`

Bevis: `scripts/fitness.mjs:356` `const re = /^\d{14}_[a-z0-9_]+\.sql$/`. Fitness kræver ikke schema-præfiks; historikken bruger blandt andet trin- og schema-præfikser (fx `20260521000001_t10_tables.sql` og `20260607100001_core_identity_secdef_permission_action.sql`). Om reglen skal skærpes, er et teknisk valg og ikke dit bord (workflow-planen §2 regel 1). Rettelsen beskriver kun, hvad der håndhæves.

### A12 · §3 »Benchmark-test som CI-blockers« l.1492-1498 — status

NUVÆRENDE: afsnittet (l.1492-1498) har ingen statuslinje.

NY: afsnittet er uændret. Efter l.1498 tilføjes:
> **Status (rettelse 37):** ingen af de tre benchmark-tests er bygget (`supabase/tests/` har kun `smoke/`, `negative/`, `break_glass/`, `classification/`). Lock-pipeline: udskudt til trin 14/22 (§4.2, G031). Subtree-RLS: ikke bygget i trin 9; intet trin fastsat (§4.2). Dashboard-refresh: hører til trin 23.

Bevis: som A7. Reglen fra rettelse 19 er din beslutning og bevares. Kun påstanden om, at testene findes, rettes.

### A13 · §4 trin 7 (l.1514) og trin 9 (l.1518) — hvad der faktisk er leveret

NUVÆRENDE (l.1514, uddrag):
> … + **lock-pipeline benchmark-test** med SLA <10s) | core_money |

NY:
> … + **lock-pipeline benchmark-test** med SLA <10s — ikke bygget, udskudt til trin 14/22, se §4.2) | core_money |

NUVÆRENDE (l.1518):
> | 9 | Identitet del 2 (org-træ + teams + klient-team + helpers + subtree-scope + **org_unit_closure-tabel + vedligeholdelses-trigger + acl_subtree-helper** + subtree-RLS benchmark-test) **+ migration: discovery-script for teams + udtræks-SQL for klient-team-historik + upload-script** | core_identity |

NY:
> | 9 | Identitet del 2 (org-træ + teams + klient-team + helpers + subtree-scope + **org_node_closure-tabel + vedligeholdelses-trigger + acl_subtree_org_nodes/acl_subtree_employees-helpers** + subtree-RLS benchmark-test — ikke bygget, se §4.2) **+ migration: discovery-script for teams + udtræks-SQL for klient-team-historik + upload-script** — ikke leveret; afgøres sammen med migration fra 1.0 (forretningsforståelse §15, se Appendix B) | core_identity |

Bevis:
- `20260518000002_t9_org_node_closure.sql:14` `create table core_identity.org_node_closure`.
- Funktionerne hedder `acl_subtree_org_nodes`, `acl_subtree_employees` (+ `_at`) (`20260520000000_t9_supplement.sql`). Masterplanen bruger selv de rigtige navne i §1.7 l.429-437.
- Rettelse 35 (l.2006) siger, at navnet `org_unit_closure` er »fjernet som forkert fundament«.
- `scripts/migration/` indeholder kun `employees/` (trin 5). Der er intet for teams.
- *Hvordan migrationen skal laves, rettes ikke her* (Del C, C3).

### A14 · §4.1 l.1552 — død sti

NUVÆRENDE:
> For detaljerede leverance-rapporter pr. trin: se `docs/coordination/rapport-historik/<dato>-<pakke>.md`.

NY:
> For detaljerede leverance-rapporter pr. trin: se pakkens slut-rapport. Rapporter fra før 24/9 2026 findes i git-historikken: `docs/coordination/rapport-historik/` @ `0eb9b25` (main).

Bevis: Mappen findes på `main` @ `0eb9b25`. På branchen er den flyttet til `docs/foraeldet-workflow/rapport-historik/`, og den fjernes (workflow-planen §4.4). Fremover overlever kun krav, plan og slut-rapport (workflow-planen §4.2).

### A15 · §4.1 statustabel l.1556-1559 og l.1565 — commits der ikke findes

NUVÆRENDE (fem rækker, samme fejl):
> | 1 | Adgangs-mekanik | ✓ Godkendt | Trin 1 | ce8c609 | 13. maj |
> | 2 | Audit-mønster (partitioneret) | ✓ Godkendt | Trin 1 | ce8c609 | 13. maj |
> | 3 | Drift-skabelon (heartbeats) | ✓ Godkendt | Trin 1 | ce8c609 | 13. maj |
> | 4 | Klassifikations-registry + migration-gate Phase 1 | ✓ Godkendt | Trin 1 | ce8c609 | 13. maj |
> | 8 | Migration-gate Phase 2 strict | ✓ Aktiveret i trin 1 | Trin 1 | ce8c609 | 13. maj |

NY:
> | 1 | Adgangs-mekanik | ✓ Godkendt | Trin 1 | 39a701b | 14. maj |
> | 2 | Audit-mønster (partitioneret) | ✓ Godkendt | Trin 1 | 39a701b | 14. maj |
> | 3 | Drift-skabelon (heartbeats) | ✓ Godkendt | Trin 1 | 39a701b | 14. maj |
> | 4 | Klassifikations-registry + migration-gate Phase 1 | ✓ Godkendt | Trin 1 | 39a701b | 14. maj |
> | 8 | Migration-gate Phase 2 strict | ✓ Aktiveret i trin 1 | Trin 1 | 39a701b | 14. maj |

Og i de tre rækker l.1560-1564 skiftes kun commit-feltet:
- trin 5: `14dd814` → `5726aca`
- trin 6: `fd2ba48` → `65c2627`
- trin 7, 7b og 7c: `bc57ae0` → `6052bd9`

Datoerne 14. maj er uændrede.

Bevis:
- `git cat-file` kender ikke `ce8c609`, `14dd814`, `fd2ba48` eller `bc57ae0` (i `gh api compare` er de »diverged«, jf. A2-rapporten).
- På `main` (`git merge-base --is-ancestor`) ligger:
  - `39a701b` »trin 1: fundament — core-schemas, partitioneret audit, klassifikation, bootstrap«, forfattet 2026-05-14 00:44 +0200. Derfor 14. maj, ikke 13.
  - `5726aca` »trin 2: identitet del 1 fuld struktur (§4 trin 5)«
  - `65c2627` »trin 6: anonymisering (§4 trin 6)«
  - `6052bd9` »trin 4: periode-skabelon + auto-lock + break-glass (§4 trin 7+7b+7c)«
- **Rettes ikke** (afgjort efter gennemgangen, bilaget): trin 9 `d73d929` og trin 10 `1831760` ligger begge på `main`.

### A16 · §4.1 l.1568 — status for 10b

NUVÆRENDE:
> | 10b | Lokations-skabelon | ⌛ Udestående | — | — | — |

NY:
> | 10b | Lokations-skabelon | ⏳ Næste | Pakke 1 | — | — |

Bevis:
- »⌛ Udestående — venter på tidligere trin« (l.1604) er forkert. Trin 10 er afsluttet (`1831760`).
- Kravet er godkendt (M-38 »krav ok«), planen v3.5 er godkendt (M-45 »plan ok«), og intet er bygget.
- Rettelsen anvendes først efter dit `ok` til workflow-planen. Det `ok` sætter pakke 1 i gang (workflow-planen §5: »oprydning … → pakke 1 efter §3«). Derfor ⏳ og ikke ⏸ (som bilaget foreslog, mens M-54 »vent lige« stod).
- Del B, B6 afløser rækken ved `slut ok`.

### A17 · §4.2 action-items l.1614, 1616, 1620 og 1621 — forældede rækker, plus én manglende række

NUVÆRENDE → NY:

> | replay_anonymization | Udvides med branches per entity | §4 trin 10 (clients) + trin 15 (identitets-master) |

→

> | replay_anonymization | Udvides med branches per entity | §4 trin 15 (identitets-master). (Trin 10 bortfaldt: klienter anonymiseres ikke, §1.8) |

> | Anonymization-revert break-glass | Bygges sammen med break-glass-tabel | §4 trin 7c |

→

> | Anonymization-revert break-glass | Ikke bygget i trin 7c: kun `pay_period_unlock` og `gdpr_retroactive_remove` er oprettet som operations-typer. En ny operations-type tilføjes som data + intern RPC (§1.15) | Ikke fastsat (trin 7c er afsluttet) |

> | Benchmark-artifacts i prod-DB | Skeleton-benchmark efterlod 1 syntetisk pay_period (2020-01-15→2020-02-14, locked), 260 commission_snapshots og 1 salary_correction (description='smoke test', amount=-100). Ufarligt men kosmetisk støj. **Note:** Cutover-blocker #6 G017-tjek dækker pre-2000-perioder, ikke 2020-artefakter (åbent G-nummer-kandidat fra master-plan sandheds-audit). | Inden produktions-go-live |

→

> | Benchmark-artifacts i prod-DB | Skeleton-benchmark efterlod 1 syntetisk pay_period (2020-01-15→2020-02-14, locked), 260 commission_snapshots og 1 salary_correction (description='smoke test', amount=-100). Fjernes af engangs-migrationen `20260516200000_h024_test_artifact_cleanup.sql` (teknisk-gaeld G017: LØST i H024). At den er kørt i driftsdatabasen, kvitteres via cutover-blocker #6 | Inden produktions-go-live |

> | Klassifikations-tal-inkonsistens | … | Når trin 9+ genoptages — klassifikations-tal tjekkes på ny |

→ (beskrivelsen uændret)

> | Klassifikations-tal-inkonsistens | … | Åbent. Fristen »når trin 9+ genoptages« er passeret (trin 9 og 10 er afsluttet) |

Ny række efter »Lock-pipeline fuld benchmark«:

> | Subtree-RLS benchmark | CI-blockeren i §3 (50 enheder × 5 niveauer, 500 medarbejdere, 1M sales; >5 ms pr. row eller rekursion i EXPLAIN = fail) er ikke bygget i trin 9 | Ikke fastsat |

Bevis:
- `20260521000001_t10_tables.sql:9` »anonymiseres ikke (ingen anonymized_at)«. Masterplanen l.484 siger det samme.
- `20260514150008_t7c_break_glass.sql:77-86` opretter kun de to operations-typer. `anonymization-revert` findes kun som kommentar (`t6_anonymization_rpcs.sql:16`).
- `20260516200000_h024…sql:1-7` og `teknisk-gaeld.md:556-561`.
- Om H024-migrationen er kørt i drift, er *ikke verificeret* her. Derfor henvises til blocker #6's kvittering.
- Om klassifikations-tallet er tjekket, fremgår ikke af repoet (*ikke verificeret*). Derfor står posten åben.
- Subtree-RLS: som A7 og A12.

### A18 · Appendix A »Adgang« l.1691 og l.1694

NUVÆRENDE:
> | Permission-model | Tre-niveau (Område → Page → Tab) + to akser ((kan_tilgå/kan_skrive) × visibility (Sig selv/Hiraki/Alt)). **4-dim superseded af rettelse 35 (2026-05-18)** |
> | Stab/FM-leder | Roller i samme permission-tabel. Ingen FM-isoleret rolle-mekanisme |

NY:
> | Permission-model | Fire niveauer (Område → Page → Tab → Handling) + to akser ((kan_tilgå/kan_skrive) × visibility (Sig selv/Hiraki/Alt)). Handling tilføjet 2026-05-21 (T9-supplement-2). **4-dim superseded af rettelse 35 (2026-05-18)** |
> | FM-leder | Almindelig rolle i samme permission-model. Ingen FM-isoleret rolle-mekanisme. Stab-rollen udgår (§1.7: »Stabs-konceptet fra 1.0 udgår fuldstændig«) |

Bevis:
- Som A8. »4-dim« i rettelse 35 var en anden model (rolle-dimensioner) og står uændret.
- Stab: masterplan l.389 og rettelse 35 (l.2006: »stab-rolle … fjernet«). Vagt-typen »Stab« (l.1735) er et andet begreb og røres ikke.

### A19 · Appendix A l.1852 og »Rettelse 19 — Begrundelser« l.2013 og l.2017

NUVÆRENDE (l.1852):
> | Subtree-RLS | Materialiseret `org_unit_closure`-tabel + trigger. Helper `acl_subtree(employee_id)` via indexed lookup. Ingen rekursive CTE'er i policy-prædikater (generelt princip) |

NY:
> | Subtree-RLS | Materialiseret `org_node_closure`-tabel + trigger. Helpers `acl_subtree_org_nodes(employee_id)` / `acl_subtree_employees(employee_id)` via indexed lookup. Ingen rekursive CTE'er i policy-prædikater (generelt princip) |

NUVÆRENDE (l.2013):
> Hvert C-område havde 2-4 forslag i `performance-resilience-undersoegelse.md`. Hvert valg dokumenteret her med 5-års-perspektivet som kriterium.

NY:
> Hvert C-område havde 2-4 forslag i `performance-resilience-undersoegelse.md` (kilden er ikke bevaret; filen har aldrig ligget i git). Hvert valg dokumenteret her med 5-års-perspektivet som kriterium.

NUVÆRENDE (l.2017):
> **Valgt:** Materialiseret `org_unit_closure`-tabel + trigger. Helper `acl_subtree` returnerer descendants via indexed lookup.

NY:
> **Valgt:** Materialiseret closure-tabel + trigger (bygget som `core_identity.org_node_closure`). Helpers `acl_subtree_org_nodes` / `acl_subtree_employees` returnerer descendants via indexed lookup.

Bevis:
- Navnene: som A13.
- Kilden: `git log --all -- '*performance-resilience*'` giver 0 commits.
- Appendix C række 19 (l.1990) er historik og røres ikke.

### A20 · Appendix A »Migration fra 1.0« l.1867

NUVÆRENDE:
> | Migration-trin | Integreret i eksisterende byggetrin (trin 5, 9, 10, 10b, 14, 21, 31). Ikke separate trin |

NY (kun trin 10 fjernes nu; 10b fjernes i Del B, B5):
> | Migration-trin | Integreret i eksisterende byggetrin (trin 5, 9, 10b, 14, 21, 31). Ikke separate trin. Trin 10: udskudt (mathias-afgoerelser 2026-05-20, »Trin 10 scope-præcisering«, §4) |

Bevis: masterplan §4 trin 10 (l.1519) og rettelse 36 (l.2007): »migration + crm_match_id fjernet«. Om migration overhovedet er en del af byggetrinene, er Del C, C3.

### A21 · Cutover-blocker #11 l.1946 — præcisering

NUVÆRENDE:
> | 11 | Migration TODO-markører løst (H006) | 0 TODO-markører i migration-filer |

NY:
> | 11 | Migration TODO-markører løst (H006) | 0 TODO-markører i 1.0-migrations-scripts (`scripts/migration/`; i dag 4 i `employees/1_discovery.sql` og 3 i `employees/2_extract.sql`) |

Bevis:
- `grep -c TODO`: `supabase/migrations/*.sql` har 0.
- `scripts/migration/employees/1_discovery.sql` har 4, og `2_extract.sql` har 3.
- §4.2 l.1615 (»Erstattes med faktiske 1.0-skema-referencer«) viser, at det er 1.0-scripts der menes.
- Samme præcisering af `huskeliste.md` H006 hører til en anden tekst.

### A22 · Hoved l.3 — `governance-owns`-markøren

NUVÆRENDE:
> <!-- governance-owns: teknisk-plan, byggeraekkefoelge, laaste-beslutninger, aabne-beslutninger, permission-model -->

NY: linjen fjernes. **Tidspunkt:** i samme ændring som fjerner governance-tjekket (workflow-planen §4.5), ikke før. Tjekket læser markøren i dag.

Bevis: `scripts/governance-check.mjs:192-196` er den eneste læser. Workflow-planen §4.5: »governance-tjek … ud«.

### A23 · Appendix B — ny række om migration

NUVÆRENDE: Appendix B »Strukturelle (afgøres ved bygning)« (l.1880-1885) nævner ikke migration.

NY: tilføj række:
> | Migration fra 1.0 | Forretningsforståelse §15 siger »migration som separat beslutning pr. pakke, ikke som automatisk leverance« og peger på klient-API'er som primær kilde. §0.5 og trin 5/9/14/21 bygger migration ind i trinene. Afgøres af Mathias før næste pakke med migration (trin 12+) |

Bevis:
- Forretningsforståelse l.246-247 (ordret citeret i C3).
- Rækken registrerer kun den åbne beslutning, så A13's henvisning »se Appendix B« har et mål. Den afgør intet.
- Workflow-planen §5 placerer spørgsmålet ved »trin 12+«.

### A24 · Appendix C — ny række 37 (denne rettelse)

NY (tilføjes efter række 36):
> | 37 | Faktuel afstemning mod det byggede (workflow-planen godkendt med Mathias' ok (version angives ved godkendelsen)): §0 rangorden (master-plan er sandhed for det en pakke rører; afvigelse = Mathias' valg) og døde stier rettet · §1.2 retention-enum {time_based, event_based, manual, permanent} + default NULL · §1.3 audit-undtagelse inkl. `org_node_closure` · §1.7 fire permission-niveauer (+ Handling, `20260521100003`) og write-RPC'er som SECURITY DEFINER + REVOKE af direkte writes (gov-3b-3, `20260607100001`–`110004`) · navne `org_node_closure`/`acl_subtree_*` · benchmark-tests markeret ikke bygget · §3 #13 migrationsnavne som håndhævet · §4.1 commits for trin 1-8 rettet til main-commits · 10b-status · §4.2 forældede rækker · Appendix A/B/C: stab-rolle, migration-trin, første nummereringslag omdøbt 18a-29a |

---

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
> | Lokations-status | aktiv / dvale / nedlagt. Kun aktiv er bookbar. Nedlæggelse kobler klienterne fra, standene består; genåbning giver klienterne automatisk tilbage (M-14, M-19, M-25, M-28) |

NUVÆRENDE (l.1867, efter A20):
> | Migration-trin | Integreret i eksisterende byggetrin (trin 5, 9, 10b, 14, 21, 31). Ikke separate trin. Trin 10: udskudt (mathias-afgoerelser 2026-05-20, »Trin 10 scope-præcisering«, §4) |

NY:
> | Migration-trin | Integreret i eksisterende byggetrin (trin 5, 9, 14, 21, 31). Ikke separate trin. Trin 10: udskudt (mathias-afgoerelser 2026-05-20, »Trin 10 scope-præcisering«, §4). Trin 10b: udskudt (M-25: »dette importeres senere«) |

NUVÆRENDE (l.1891):
> | Lokations-status | Afgøres ved trin 10b |

NY: rækken fjernes. Den er afgjort (se Appendix A ovenfor).

Bevis: dine ord ordret i ledgeren. M-14: »altså klienter kobles automatisk fra lokationer når den nedlægges men lokaitoner beholder de oprettede stande«. M-19: »ja« (automatisk tilbage). M-28: »en nedlagt skal kunne genåbnes«. Kravet K-4 og K-6.

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
