# Codex feedback — T9 plan V3

Review-type: Plan-review
Pakke: T9 — Identitet del 2
Plan-fil: `docs/coordination/T9-plan.md`
Krav-dok: `docs/coordination/T9-krav-og-data.md`
Branch: `claude/T9-plan`
Resultat: FEEDBACK
Runde: 3

## Oprydnings-sektion-tjek

OK. Planen indeholder konkret sektion `Oprydnings- og opdaterings-strategi` med berørte arkiverings-, dokumentations-, status- og grep-tjek.

## Fund

### [KRITISK] Org-strukturens historik bruger fysisk `updated_at` i stedet for ændringens `effective_from`

Konkret afvigelse: V3 lukker `pending_change_request`-bypasset og retter current-placement-filteret. Men org-strukturens nye historikmodel versionerer stadig på fysisk mutationstid, ikke på den forretningsmæssige gældende dato. Krav-dok siger, at strukturændringer har gældende dato og følger fortrydelses-mekanismen (`docs/coordination/T9-krav-og-data.md:93`, `docs/coordination/T9-krav-og-data.md:126`, `docs/coordination/T9-krav-og-data.md:270`). Planens pending-RPC'er bærer også `p_effective_from` for `org_node_upsert`, `org_node_deactivate` og `team_close` (`docs/coordination/T9-plan.md:238`, `docs/coordination/T9-plan.md:239`, `docs/coordination/T9-plan.md:240`).

V3's `org_node_history`-trigger skriver derimod `version_ended = NEW.updated_at`, og `org_tree_read_at(p_date)` vælger historiske rows ud fra `version_started/version_ended` (`docs/coordination/T9-plan.md:141`, `docs/coordination/T9-plan.md:143`, `docs/coordination/T9-plan.md:513`). Det betyder, at en strukturændring med `effective_from` forskellig fra fysisk apply-tid bliver rekonstrueret forkert:

- Future-dated rename/flytning kan slå igennem i current `org_nodes` og `org_node_closure` ved cron/apply-tid, selv om `effective_from` ligger senere (`docs/coordination/T9-plan.md:273`, `docs/coordination/T9-plan.md:287`, `docs/coordination/T9-plan.md:353`).
- Backdated eller tidligere gældende ændring får historikgrænse ved `updated_at`, ikke ved den dato brugeren angav som gældende dato.
- `org_tree_read_at(p_date)` kan derfor vise gammel struktur for datoer hvor den nye struktur skulle gælde, eller ny struktur for datoer hvor den endnu ikke skulle gælde.

Det er samme klasse fejl som V2's placement-problem, bare for org-strukturen: temporal state skal versioneres på business-validity (`effective_from/effective_to`), ikke på fysisk commit-tid. Ellers leverer SQL-designet ikke "Hent historisk træ" eller strukturændringer med gældende dato korrekt.

Anbefalet handling: V4-rettelse. Gør org-strukturens temporal model effective-date-baseret:

- Lad apply-handleren skrive versionsgrænser fra `pending_changes.effective_from`, ikke fra `NEW.updated_at`.
- Overvej at gøre `org_node_history` til egentlig `org_node_versions(node_id, name, parent_id, node_type, is_active, effective_from, effective_to)` og lad både `org_tree_read()` og `org_tree_read_at(p_date)` bruge samme periodefilter som placements.
- Hvis current `org_nodes` fortsat skal være materialiseret current-state, må den ikke opdateres før både `undo_deadline` og `effective_from` er passeret, eller også skal current-read aldrig læse den alene.
- Closure/subtree skal enten beregnes ud fra den effective-date-baserede struktur for den relevante dato eller eksplicit begrænses til current state efter effective date. Current `org_node_closure` må ikke repræsentere en future-dated struktur før datoen indtræffer.
- Tilføj tests hvor `org_node_upsert` og `team_close` har `effective_from` før, på og efter fysisk apply-tid, og verificér både `org_tree_read()` og `org_tree_read_at(p_date)`.
