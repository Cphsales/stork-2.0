# I001 — Krav-og-data-grundlag

**Type:** Input fra Claude.ai til Code's plan-arbejde
**Anvendelse:** Code bruger dette dokument som grundlag for at lave `docs/coordination/I001-plan.md` per `docs/skabeloner/plan-skabelon.md`
**Plan-niveau:** Krav, formål, data — IKKE implementations-plan. Tekniske valg om HVORDAN er Code's plan-arbejde.
**Dato:** 2026-05-15

---

## Formål

> Denne pakke leverer: alle 38 unikke sandheds-fund fra H016-audit lukket, så dokumenter, kode, setup og live-state er konsistente.
>
> Hvis fundet under review ikke bringer os tættere på dette: G-nummer, ikke blocker.

---

## Data-grundlag

Autoritative input til implementation. Code arbejder fra disse, ikke fra dette dokuments fortolkninger:

- **`docs/coordination/audit/audit-konsolideret-2026-05-15.md`** — 38 unikke fund (7 kritiske, 26 mellem, 5 kosmetiske). Hvert fund har lokation (fil:linje), citat af fejlagtig påstand, bevis for faktisk tilstand, og konsekvens-vurdering.
- **`docs/coordination/audit/audit-code-2026-05-15.md`** — Code's parallelle audit (24 fund)
- **`docs/coordination/audit/audit-codex-2026-05-15.md`** — Codex' parallelle audit (19 fund)
- **`docs/strategi/stork-2-0-master-plan.md`** — autoritativ over krav-dokumenter ved konflikt mellem dokumenter

---

## Scope

**I scope:**

- Alle 38 fund fra konsolideret rapport
- Sletninger: `.agents/`, `.codex/`, `.claude/settings.jsonZone.Identifier`
- Omdøbning: `docs/coordination/arkiv/` → `docs/coordination/plan-historik/`
- Reference-konsekvenser af omdøbningen
- Tekniske valg afgjort af Code i kode-plan (se "Tekniske valg overladt til Code" nedenfor)

**IKKE i scope:**

- Drift-detection som reel mekanisme — kun dokumentation af nuværende inaktive state
- Lag E-arbejde
- Test-arkitektur-fix for pay_periods cleanup (G043 + G044 dokumenteret som teknisk gæld; fix er senere pakke)
- Nye features eller arkitektur-ændringer

---

## Mathias' afgørelser (input til Code's plan)

Følgende er afgjort før plan-arbejde starter. Code's plan skal være konsistent med disse — argumentation mod dem hører til ny runde, ikke til I001's plan-fase.

| #   | Beslutning                                                                                                 | Begrundelse                                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | Samlet I-pakke, ikke splittet i flere                                                                      | Mathias' valg                                                                                                             |
| 2   | Slet `.agents/`, `.codex/`, `.claude/settings.jsonZone.Identifier`                                         | Tomme mapper / Windows-artefakt uden formål                                                                               |
| 3   | Omdøb arkiv-mappen til `plan-historik/` (behold ikke ordret arkiv-navngivning, slet ikke funktionaliteten) | "Vi skal vel bruge arkiv til senere" — symmetri med `rapport-historik/`, klart formål                                     |
| 4   | K7 (annullerings-fradrag) er dokument-fix, ikke arkitektur-revision                                        | Master-plan rettelse 2 har allerede afgjort: bruger vælger target_period_id. `lag-e-beregningsmotor-krav.md:42` er stale. |
| 5   | CODEOWNERS skal pege på `@Cphsales` (org-handle)                                                           | Mathias bekræftet                                                                                                         |
| 6   | Drift-detection bliver dokumenteret som inaktiv, ikke aktiveret nu                                         | Aktivering kræver ny mekanisme-bygning. Hører til separat pakke, ikke I001.                                               |

---

## Tekniske valg overladt til Code

Disse valg er IKKE afgjort. Code argumenterer teknisk i sin plan-fil og foreslår valg. Codex reviewer. Mathias godkender den samlede plan.

**Valg 1 — K5+K6: stale anonymization_strategies-rows**

DB har 10 rows, dokumenter siger 3. 7 er stale `p1a_smoke_t5*`-test-artefakter med status='tested'. To veje at lukke fundet:

- A. DELETE 7 stale rows fra DB. Permission-matrix matcher derefter virkeligheden uden ændring. G017 forbliver uændret.
- B. Behold 10 rows. Udvid G017's tjek-pattern til at fange stale konfig-rows. Permission-matrix opdateres til at vise alle 10 med stale-markering.

Code argumenterer mod vision-princip "én sandhed" og lifecycle-disciplin (`approved`/`tested`/`active`-mønster).

**Valg 2 — Skal H018 oprettes som del af I001's konsekvens-arbejde?**

H018 = cementering af `--admin` / `enforce_admins`-bypass-regel. Tre `--admin`-merges i dag, plus to `enforce_admins`-deaktiveringer. Ingen formel regel.

Hvis Code vurderer at det er teknisk gæld der skal ankres nu: H018 oprettes i `teknisk-gaeld.md` med konkret problem-beskrivelse. Hvis ikke: ingen H-nummer i denne pakke.

**Valg 3 — Skal H019 oprettes som del af I001's konsekvens-arbejde?**

H019 = drift-detection-mekanisme der skal bygges. K3+K4 viste at den eksisterende mekanisme er ufunktionel.

Hvis Code vurderer at det er kritisk teknisk gæld med klar bygnings-spec: H019 oprettes med specifikke krav (auto-schema-snapshot, auto-types-generation, reel CI-fang). Hvis ikke: åbent fund, dokumenteret som hul.

**Valg 4 — M25: vision-tjek-regel**

`arbejds-disciplin.md:342` kræver `### Vision-tjek`-sektion i hver trin-rapport i `bygge-status.md`. Den findes ikke. Slut-rapporter i `rapport-historik/` HAR vision-tjek (per skabelon).

- A. Håndhæv reglen: tilføj Vision-tjek-sektion retroaktivt til alle eksisterende trin-rapporter i `bygge-status.md`
- B. Justér reglen: vision-tjek hører i slut-rapport, ikke i status-oversigt. Opdatér `arbejds-disciplin.md`.

Code argumenterer for det rette disciplin-niveau givet at slut-rapport-skabelonen allerede har struktureret vision-tjek.

---

## Mønster-observation (kontekst, ikke krav)

H016 afslørede at 38 fund ikke er 38 isolerede fejl. De manifesterer 4 strukturelle mønstre:

1. **Setup-papir vs setup-virkelighed** (~10 fund) — disciplin der lever på papir, ikke håndhæves
2. **Stale efter rebase/merge/refaktor** (~8 fund) — statusfelter glemmes når kode ændres
3. **Dokumenter modsiger hinanden** (~9 fund) — ingen autoritativ hierarki
4. **Plan-til-implementation-drift** (~5 fund) — afvigelser dokumenteres ikke

I001 fixer symptomer. Underliggende mønster forbliver indtil drift-detector-mekanisme bygges. Code kan bruge mønstrene som strukturerings-hjælp i implementations-rækkefølge, men er ikke forpligtet til det.

---

## Forventet flow efter dette dokument

1. Mathias godkender dette krav-og-data-grundlag
2. Code laver `docs/coordination/I001-plan.md` per `docs/skabeloner/plan-skabelon.md`
3. Code argumenterer for de 4 tekniske valg ovenfor i sin plan
4. Code opdaterer `docs/coordination/aktiv-plan.md` til at pege på I001-plan
5. Codex reviewer planen — automation trigger via `codex-notify.yml` udvidelse (H021)
6. Code + Codex kører runder via commits indtil enige
7. Mathias + Claude.ai validerer plan mod krav-dokumentet
8. Code bygger
9. Slut-rapport i `docs/coordination/rapport-historik/`
10. Plan-filen flyttes til `docs/coordination/plan-historik/` (efter omdøbningen er gennemført)
