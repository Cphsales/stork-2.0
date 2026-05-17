# Codex feedback — T9 plan V4

Review-type: Plan-review
Pakke: T9 — Identitet del 2
Plan-fil: `docs/coordination/T9-plan.md`
Krav-dok: `docs/coordination/T9-krav-og-data.md`
Branch: `claude/T9-plan`
Resultat: FEEDBACK
Runde: 3+

## Oprydnings-sektion-tjek

OK. Planen indeholder konkret sektion `Oprydnings- og opdaterings-strategi` med berørte arkiverings-, dokumentations-, status- og grep-tjek.

## Fund

### [KRITISK] V4 blander stadig identity-only `org_nodes` med den gamle mutable `org_nodes`-kontrakt

Konkret afvigelse: V4's centrale fix er, at `org_nodes` bliver identity-only, og at `org_node_versions` er primær lagring af `name`, `parent_id`, `node_type`, `is_active`, `effective_from` og `effective_to` (`docs/coordination/T9-plan.md:153`, `docs/coordination/T9-plan.md:159`, `docs/coordination/T9-plan.md:160`, `docs/coordination/T9-plan.md:572`, `docs/coordination/T9-plan.md:573`). Den arkitektur adresserer Codex V3-fundet.

Men planen indeholder stadig flere konkrete schema-/SQL-kontrakter fra den gamle model:

- Beslutning 1 siger stadig, at `org_nodes` har self-refererende `parent_id` og `node_type` (`docs/coordination/T9-plan.md:88`, `docs/coordination/T9-plan.md:90`).
- Mathias-mapping refererer stadig til `org_nodes.node_type`, `parent_id`-hierarki og `org_nodes.is_active` (`docs/coordination/T9-plan.md:236`, `docs/coordination/T9-plan.md:241`).
- Valg 1 lister stadig `org_nodes(id, name, parent_id, node_type, is_active, created_at, updated_at)` (`docs/coordination/T9-plan.md:276`), direkte i konflikt med V4's identity-only schema.
- Valg 2 beskriver cycle-detection på `org_nodes.parent_id` (`docs/coordination/T9-plan.md:350`), selv om V4 flytter parent/type til `org_node_versions`.
- `org_tree_read()` beskrives stadig som `SELECT * FROM org_nodes WHERE is_active=true` (`docs/coordination/T9-plan.md:489`), hvilket ikke kan køre mod V4's identity-only `org_nodes`.
- Seed beskriver stadig `org_nodes(name='Copenhagen Sales', node_type='department', parent_id=NULL)` og `org_nodes(name='Ejere', node_type='department', parent_id=<Cph Sales>)` (`docs/coordination/T9-plan.md:473`, `docs/coordination/T9-plan.md:474`), hvilket ikke matcher V4's schema.

Det er en build-blokerende SQL-/kontraktfejl, ikke kun kosmetik: hvis Code følger disse linjer, migrations og read-RPCs vil enten referere til kolonner der ikke findes på `org_nodes`, eller implementere den gamle mutable model ved siden af V4's versionsmodel. Begge dele bryder V4's root-fix.

Anbefalet handling: V5-rettelse. Lav en systematisk V4-sweep så alle schema-, seed-, read-, closure- og test-kontrakter bruger `org_nodes` som identity-only og `org_node_versions` som eneste source for mutable org-state:

- Opdatér Beslutning 1 og Mathias-mapping til at sige, at node_type/parent/is_active ligger i current version, ikke i `org_nodes`.
- Ret Valg 1's tabel-liste og alle seed-eksempler, så seed opretter identity-row i `org_nodes` plus initial version-row i `org_node_versions`.
- Ret `org_tree_read()` til samme effective-date pattern som `org_tree_read_at(current_date)`.
- Ret cycle-/team-har-børn-beskrivelser til at arbejde over `org_node_versions` effective at relevant date.
- Tilføj et grep/fitness-tjek i planen: ingen nye SQL-kontrakter må referere til `org_nodes.name`, `org_nodes.parent_id`, `org_nodes.node_type` eller `org_nodes.is_active`.
