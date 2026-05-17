# T9-plan V4 — Claude.ai forretnings-dokument-review

**Reviewer:** Claude.ai (forretnings-dokument-konsistens)
**Plan-version:** V4
**Dato:** 2026-05-17
**Resultat:** FEEDBACK — KRITISK (1 fund)
**Runde:** 3+

---

## Sammenfatning

V4 introducerer korrekt arkitektur i Beslutning 13: `org_nodes` bliver identity-only og `org_node_versions` bliver primær lagring af mutable state med `effective_from`/`effective_to`. Apply-handler skriver version-boundary fra `pending.effective_from`. Beslutning 15 sikrer at cron-filter venter på BÅDE `undo_deadline <= now()` AND `effective_from <= current_date`.

Designen er den rigtige løsning på min V2 KRITISK + Codex V3 KRITISK.

**Men:** V4 har en intern inkonsistens som Codex korrekt har spottet — store dele af planen refererer stadig til den gamle mutable `org_nodes`-model side-om-side med den nye identity-only-model. Det underminerer fix'et og betyder at krav-dok 6.1 + 4.1 + 4.2 ikke konsistent leveres.

Jeg bekræfter Codex' fund fra forretnings-dokument-perspektiv: planen kan ikke approve fordi den ikke entydigt leverer historik-bevarelse mod krav-dok 6.1.

---

## Verifikation af mine tidligere fund

### Min V2 KRITISK (effective-date-model brydende historik) — DELVIST ADRESSERET

V4's Beslutning 13 er det rigtige arkitektoniske fix. Men adresseringen er ikke konsistent gennem hele planen. Konkret er følgende steder stadig på gammel model:

- **Beslutning 1:** "Tabellen `org_nodes` har self-refererende `parent_id` + `node_type ENUM`" — gammel model
- **Valg 1's tabel-liste:** `org_nodes(id, name, parent_id, node_type, is_active, created_at, updated_at)` listet direkte ved siden af `org_node_versions` — intern modsigelse
- **Valg 2 (closure-vedligehold):** "AFTER-trigger på `org_nodes`" + "cycle-detection på `org_nodes.parent_id`" — refererer til kolonner der ifølge Beslutning 13 ikke findes på org_nodes
- **Valg 12 (seed):** `org_nodes(name='Copenhagen Sales', node_type='department', parent_id=NULL)` — seed-eksempel på gammel model
- **Valg 13's `org_tree_read()`:** "`SELECT * FROM org_nodes WHERE is_active=true`" — kan ikke køre mod identity-only-org_nodes
- **Mathias-mapping-tabel pkt 1, 2, 6, 10:** Refererer til `org_nodes.node_type`, `parent_id`-hierarki, `org_nodes.is_active` — gammel model

Konsekvens: hvis Code implementerer fra Valg 1's tabel-definition eller Valg 12's seed-eksempler, vil migrationerne genintroducere den gamle current-state-only-model og det fundamentale historik-problem fra V2/V3 kommer tilbage.

### Codex' V3 KRITISK — DELVIST ADRESSERET (samme problem-klasse)

Codex V3 KRITISK var samme problem-klasse som min V2 KRITISK: effective_from skal være temporal-grænse, ikke fysisk apply-tid. V4's Beslutning 13's apply-handler-design er korrekt ("Version-boundary stammer fra `pending.effective_from`, ikke fra `now()`"). Men inkonsistensen i Valg 1, Valg 2, Valg 12, Valg 13 betyder fix'et ikke gennemføres entydigt.

---

## Eneste KRITISK-finding (bekræfter Codex' V4 KRITISK)

### [KRITISK] V4's nye arkitektur er ikke konsistent gennem hele planen

**Konkret afvigelse:**

V4's Beslutning 13 etablerer:

> "**V4:** `org_nodes` bliver identity-only (id, created_at, updated_at) — uden mutable forretnings-felter direkte. `org_node_versions` bliver primær mutable lagring med effective_from/effective_to"

Men følgende seks steder i V4 modsiger Beslutning 13 ved at bruge den gamle mutable model:

1. **Beslutning 1:** Beskriver `org_nodes.parent_id` og `org_nodes.node_type` som om de stadig er på org_nodes
2. **Valg 1's tabel-liste:** Lister `org_nodes(id, name, parent_id, node_type, is_active, ...)` — direkte modsigelse af identity-only
3. **Valg 2:** Cycle-detection på `org_nodes.parent_id` — kolonnen findes ikke i V4's schema
4. **Valg 12 (seed):** `org_nodes(name='Copenhagen Sales', node_type='department', parent_id=NULL)` — kan ikke køre mod V4's schema
5. **Valg 13 (`org_tree_read()`):** `SELECT * FROM org_nodes WHERE is_active=true` — kolonnen `is_active` findes ikke på org_nodes i V4
6. **Mathias-mapping-tabel:** Referencer til `org_nodes.node_type`, `org_nodes.is_active`, parent_id-hierarki på org_nodes

**Krav-dok-konsekvens:**

- **Krav-dok 6.1** ("Gammel sandhed ændres ikke af ny sandhed"): hvis Code implementerer fra Valg 1/12/13's gamle-model-tekst, vil `org_nodes` blive opdateret direkte ved name/parent/is_active-ændringer, og historikken går tabt. Samme problem som V2.
- **Krav-dok 4.1** (Hent historisk træ): hvis Valg 13's `org_tree_read()` er `SELECT FROM org_nodes`, vil `org_tree_read_at(p_date)` ikke kunne rekonstruere historik fra org_node_versions konsistent — fordi current og historisk så bruger forskellige tabeller.
- **Krav-dok 4.2** (Hent placering aktuelt): mindre direkte konsekvens, men hvis seed-eksempler er forkerte, vil bootstrap-state være inkonsistent med den temporal model resten af systemet forventer.

**Per Modsigelses-disciplin (mathias-afgoerelser 2026-05-17):** "Modsigelse mod krav-dokumentet eller fire-dokument-rammen er plan-blokerende. Modsigelse er ikke kandidat til G-nummer." V4's nye design honorerer krav-dok 6.1 — men kun hvis planen er internt konsistent. Den interne inkonsistens betyder at planen ikke entydigt leverer det krav-dok forlanger.

**Anbefalet handling: V5-rettelse**

Systematisk sweep så alle plan-elementer konsistent bruger V4's nye arkitektur:

- Beslutning 1: omformuler så node_type/parent/is_active er på current version, ikke org_nodes
- Valg 1: fjern `(name, parent_id, node_type, is_active)` fra `org_nodes`-tabel-liste; behold kun identity-felter (id, created_at, updated_at)
- Valg 2: cycle-detection over org_node_versions (versions effective at NEW.effective_from), ikke direct parent_id på org_nodes
- Valg 12 (seed): opret identity-row i org_nodes + initial version-row i org_node_versions med effective_from = bootstrap-dato
- Valg 13 (`org_tree_read()`): brug samme effective-date-pattern som `org_tree_read_at(current_date)` — recursive CTE over org_node_versions
- Mathias-mapping-tabel: opdater pkt 1, 2, 6, 10 til at referere til versions hvor mutable forretnings-felter findes

Codex foreslår derudover et grep/fitness-check der blokerer nye SQL-kontrakter med referencer til `org_nodes.name|parent_id|node_type|is_active`. Det er klogt — sikrer at planen ikke regresserer i V5+.

---

## Modsigelses-tjek mod fire-dokument-rammen

| Dokument                                   | Konflikt observeret?                                                                                                                                                                                                                    |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/strategi/vision-og-principper.md`    | **Indirekte konflikt.** Princip 9 ("Status-modeller bevarer historik") brudt af de plan-elementer der stadig bruger gammel model. Beslutning 13's design er konsistent med princip 9 — men inkonsistens gennem planen underminerer det. |
| `docs/strategi/stork-2-0-master-plan.md`   | Master-plan §1.7 (versionerede tilknytninger) er konsistent med V4's Beslutning 13's design — men ikke med de plan-elementer der stadig bruger gammel model.                                                                            |
| `docs/coordination/mathias-afgoerelser.md` | **Indirekte konflikt.** 2026-05-16 pkt 2 ("Afdelinger ændres sjældent; historik bevares") + 2026-05-17 pkt 13 (alle gældende-dato-ændringer følger fortrydelses-mekanisme) brudt af inkonsistens.                                       |
| `docs/coordination/T9-krav-og-data.md`     | **Konflikt.** Krav-dok 6.1 + 4.1 + 4.2 ikke entydigt leveret pga. intern inkonsistens i V4.                                                                                                                                             |

---

## Codex-opgraderings-rolle

Codex' V4-review leverer KRITISK feedback, ingen OPGRADERING-forslag. V5 forventes med systematisk rettelse.

---

## Konklusion

**Resultat: FEEDBACK — KRITISK**

V4's Beslutning 13 er den rigtige arkitektoniske løsning på min V2 KRITISK + Codex V3 KRITISK. Designen honorerer krav-dok 6.1 + 4.1 + 4.2.

Men adresseringen er ikke konsistent gennem hele planen. Mindst seks plan-elementer (Beslutning 1, Valg 1, Valg 2, Valg 12, Valg 13's `org_tree_read()`, Mathias-mapping) refererer stadig til den gamle mutable `org_nodes`-model. Det betyder planen ikke entydigt leverer historik-bevarelse — hvis Code implementerer fra disse plan-tekst-elementer, kommer V2-problemet tilbage.

Per Modsigelses-disciplin: plan-blokerende. V5 forventes med systematisk V4-sweep.

---

## Approval-status

| Reviewer          | Status                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Claude.ai (denne) | **FEEDBACK — KRITISK** (bekræfter Codex' V4 KRITISK fra forretnings-dokument-perspektiv) |
| Codex             | FEEDBACK — KRITISK (intern V4-inkonsistens)                                              |

Plan er KRITISK-blokeret af begge reviewere. V5 forventes fra Code.
