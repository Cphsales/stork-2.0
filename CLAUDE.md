# CLAUDE.md — Disciplin og vision for Stork 2.0

**Formål:** Sikre at hver migration bygger den rigtige løsning. Kortsigtet pragmatik bliver langsigtet gæld. Workarounds uden plan er drift.

---

## Vision — hvad vi måler mod

Fra master-planens §0:

> "Meget data, styr på data og slette-regler, rettigheder der virker, driftsikkert, anonymisering bevarer audit, alt drift styres i UI."

### Tre hovedprincipper

1. **Én sandhed** — én autoritativ kilde pr. fakta
2. **Styr på data** — klassifikation + retention på hver kolonne
3. **Sammenkobling eksplicit i modellen** — relations som data, ikke implicit

### Filosofi

- **Stamme = database** — adgang, klassifikation, audit, periode-lås, anonymisering, snapshot-mønster lever i DB
- **Beregning over databasen** — TypeScript-pakke (ren funktion) bærer pricing, salary, formler. PL/pgSQL kun til triggers
- **Alt drift styres i UI** — konfig-tabeller er UI-redigerbare; migration-gate validerer kun existence, ikke værdier

---

## Disciplin-tjekliste — før hver migration skrives

Besvar disse fire spørgsmål eksplicit, inden migration-fil oprettes:

1. **Hvilket vision-element understøtter dette?**
2. **Hvilket vision-element kunne det svække?**
3. **Er der en simplere løsning der bygger samme funktionalitet uden vision-kompromis?**
4. **Hvis kompromis: er det dokumenteret med plan (G-nummer i `docs/teknisk-gaeld.md` + deadline)?**

**Hvis svaret på spørgsmål 4 er "nej": STOP og spørg Mathias.**

Migration-kommentar bør indeholde svaret på 1+2 i kort form (ikke alle fire — det er disciplin-tjek, ikke dokumentationskrav). Større designvalg dokumenteres i vision-tjek-sektion i trin-rapporten.

### Plan-leverance er kontrakt

Hvis Mathias har leveret en eksplicit plan-leverance med konkrete elementer (antal strategier, navne, return-værdier, signaturer, kolonner), er den **kontrakt**, ikke oplæg. Hver afvigelse — selv "harmløs forenkling" — skal flagges og godkendes **før** implementation, ikke efter.

- Hvis planen siger 3 strategier og du kun ser brug for 2, **spørg først**. "Den tredje virker overflødig" er ikke implementations-autoritet.
- Hvis planen siger en konkret værdi (`'[anonymized]'`, sha256, P0002), brug den værdi. Hvis en anden virker bedre, spørg først.
- Forskellen mellem løse tanker og plan-leverance: løse tanker har ord som "vi skal have", "jeg tænker". Plan-leverancer har **lister, tabelnavne, signatur-specs, konkrete return-types**. Den signal er kontrakt.
- Modsat retning: hvis Mathias siger noget retning-givende uden konkrete elementer, behandl det som retning — ikke specifikation. Spørg før der bygges ovenpå.

### Destructive drops kræver preflight

`DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, sletning af rows via DELETE uden WHERE-clause, og lignende destructive operations kræver eksplicit preflight-check eller break-glass-godkendelse. Konkret minimum:

- **Tom-check:** `select count(*) from <tabel>` skal returnere 0, eller eksplicit kvittering for hvor mange rows der tabes
- **Reference-check:** verificér ingen FK refererer den droppede tabel/kolonne (ikke kun CASCADE-fix)
- **Audit-spor:** session-vars `stork.source_type='migration'` + `stork.change_reason='<konkret begrundelse>'` sættes før operation
- **Rollback-plan:** dokumentér hvordan operation kan rulles tilbage hvis nødvendigt (snapshot, backup, eller breaking-change-accepteret)

Pre-cutover (ingen rigtige data): tom-check + audit-spor er minimum.
Post-cutover: alle 4 punkter er CI-blocker; manglende preflight i migration → review-rejection.

R6 (commission_snapshots_candidate + salary_corrections_candidate drops) blev anvendt uden preflight pre-cutover; pragmatisk acceptabelt fordi 132+1 rows var test-data, men patternet markeres her som ikke-skalerbart.

---

## Vision-tjek-skabelon — i hver trin-rapport

Hver trin-rapport i `docs/bygge-status.md` skal indeholde en eksplicit `### Vision-tjek`-sektion med følgende punkter:

```markdown
### Vision-tjek

- **Bygger vi den rigtige løsning, eller en workaround?**
  [Konkret svar pr. central design-beslutning i trinnet]

- **Hvis workaround: dokumenteret plan?**
  [G-nummer i docs/teknisk-gaeld.md + deadline-trin]

- **Vision-styrkelser denne trin:**
  [Liste — hvilke vision-elementer blev styrket]

- **Vision-svækkelser denne trin:**
  [Liste — hvilke vision-elementer blev svækket, hvis nogen]

- **Teknisk gæld akkumuleret denne trin:**
  [Antal nye G-numre + reference til docs/teknisk-gaeld.md]

- **Konklusion:**
  [forsvarligt / kompromis / drift]
```

### Konklusions-betydning

- **forsvarligt** — rigtig løsning bygget, vision styrket eller uændret
- **kompromis** — workaround taget, MEN konkret plan + deadline dokumenteret i `docs/teknisk-gaeld.md`
- **drift** — workaround uden plan ELLER vision-svækkelse uden bevidst valg

**Hvis konklusion er `kompromis` ELLER `drift`: STOP og spørg Mathias før commit.** Forklar konkret hvad kompromiset er og hvorfor det blev nødvendigt.

---

## Hvornår skal jeg stoppe og spørge?

Ud over de fire disciplin-spørgsmål, STOP altid ved:

- Lock-pipeline benchmark fejler SLA
- Master-plan-konflikt (instruktion vs. master-plan-tekst)
- Designvalg ikke afgjort
- Data-tab risiko ud over allerede afgjort
- Vision-tjek-konklusion = `kompromis` eller `drift`
- Inline-fix-autoritet kræver migration der ændrer trin 1-infrastruktur (audit-trigger, RLS-helpers, classification-registry)

Inline-fix-autoritet gælder for tekniske constraints-fixes (CHECK-relaxering, type-cast-håndtering osv.) men SKAL flagges i rapport som inline-fix med G-nummer.

---

## Arbejds-disciplin

Trin-cyklus, scope-krav, selv-tjek, AI-arbejdsdeling og Codex-fund-håndtering er dokumenteret i `docs/arbejds-disciplin.md`. Læs den før hvert trin startes.

---

## Filer at konsultere før design-beslutninger

- `docs/stork-2-0-master-plan.md` — autoritativ for arkitektur og §4-byggerækkefølge
- `docs/arbejds-disciplin.md` — trin-cyklus + AI-arbejdsdeling + Codex-fund-håndtering
- `docs/teknisk-gaeld.md` — kendt gæld; tilføj nye G-numre når kompromiset tages
- `docs/bygge-status.md` — sporing pr. trin; opdateres efter hver bygning
- `docs/lag-e-beregningsmotor-krav.md` + `docs/lag-e-tidsregistrering-krav.md` — forretnings-detaljer for lag E

---

## Kommandolinje-disciplin

- Migration-gate Phase 2 strict er aktiv i CI (`MIGRATION_GATE_STRICT=true`). Alle nye kolonner SKAL klassificeres samme commit.
- Fitness-checks er CI-blockers. Kør lokalt før commit: `node scripts/fitness.mjs`.
- Pre-commit-hook kører `prettier --write` på markdown/json. Reformatér tabeller forventes.
- Husky kræver `pnpm` på PATH (`corepack enable pnpm` hvis ikke installeret).

---

**Sidste opdatering:** 14. maj 2026 (efter retroaktiv gennemgang trin 1-4 + opgave 3+4 disciplin-pakke)
