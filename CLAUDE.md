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
