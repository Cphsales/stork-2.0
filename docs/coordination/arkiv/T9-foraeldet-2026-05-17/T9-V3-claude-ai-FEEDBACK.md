# T9 V3 — Feedback fra Claude.ai (trækker V3-approval tilbage)

**Reviewer:** Claude.ai (forretnings-dokument-reviewer)
**Plan-version:** V3
**Plan-fil:** `docs/coordination/T9-plan.md`
**Dato:** 2026-05-17
**Resultat:** FEEDBACK (KRITISK)
**Status:** Trækker tidligere `T9-V3-approved-claude-ai.md` tilbage. Min approval modsagde §5's låste fundament + mathias-afgoerelser pkt 7. Denne fil erstatter approvalen.

---

## Reviewer-fejl — anerkendt

Min V3-approval behandlede visibility-modellen for `employee_team_assignments` som MELLEM-finding ("strategisk forretnings-beslutning ikke autoritativt afgjort"). Det var forkert. Deep-dive i project knowledge afslørede at det er afgjort på FLERE niveauer end pkt 7:

- §5.1, §5.2, §5.4, §5.6 i `stork-2-0.md` er alle LÅSTE og definerer hele rettighedsmodellen
- Mathias' eksempler fra past chats (2026-05-12 om vagtplan, og denne chat om "TM sælger / vagtplan = self / kalender = team") demonstrerer eksplicit pr-page scope
- Mathias-afgoerelser 2026-05-16 pkt 7 låser cross-team-adgang til scope-mekanismen

V3 bryder ikke ét punkt — V3 bryder hele fundamentet.

---

## KRITISK fund — V3 bryder §5's låste rettighedsmodel

### Det låste fundament (alle fra `stork-2-0.md`)

**§5.1 To dimensioner [LÅST]:**

> "Adgang har to dimensioner: Rolle bestemmer hvilke dele af systemet en bruger må se (menu, sider, funktioner). Team bestemmer hvilken data inden for det der vises."
>
> "Permissions-akse (D4): Hvem må noget. Hvilke pages/tabs/funktioner. Scope-akse (D7): Hvilken data inden for det."
>
> "Forskellen betyder noget for debugging: 'Hvis Alice ikke kan se en page, er det permissions-problem. Hvis Alice kan se pagen men ingen data, er det scope-problem.'"

**§5.2 Permission-modellen er firedimensionel [LÅST]:**

> "1. Hvad: page_key + tab_key (tab_key NULL = hele page) 2. Adgangsniveau: can_view + can_edit (separate booleans) 3. Scope: all / team / self 4. Hvem: role_id (FK)"

**§5.4 Pages-arkitektur [LÅST]:**

> "ÉN page per funktion. Scope-filtrering på rækker:
>
> - Sælger med scope=self → ser kun sit
> - Teamleder med scope=team → ser sit teams
> - CEO/admin med scope=all → ser alle"

**§5.6 UI-disciplin [PRINCIP for lag F]:**

> "UI håndhæver: Hvis rolle har scope='team' → team SKAL vælges ved oprettelse af medarbejder. Forhindrer 0-data-admins."

### Mathias' eksempler der demonstrerer pr-page scope

**2026-05-12 chat (under D4/D7-design):**

Mathias: "vagtplan. sælger skal kunne se leder skal kunne redigere"

Det fastlægger at samme tabel (vagter) har forskellig adgang afhængigt af rolle PÅ DEN PAGE.

**2026-05-17 (denne chat, direkte fra Mathias):**

> "det er vigtigt at hvad der kan ses bliver ui styret på page/tabe niveau. eks Rolle=TM sælger - vagtplan = kun sig selv - Kalender = team osv."

Mathias laver eksplicit eksemplet: SAMME rolle (TM sælger) har SCOPE=`self` på vagtplan-page og scope=`team` på kalender-page. Det er pr (rolle × page × tab)-kombination — ikke et globalt scope på rollen.

### Mathias-afgoerelser 2026-05-16 pkt 7

> "Hvis nogen skal kunne se data på tværs af flere teams (fx FM-chef), løses det via rollen — ikke ved at give dem flere team-tilknytninger. Rollen kan have et scope der hedder 'ser alt under min afdeling' eller 'ser alt'."

Cross-team-adgang skal gå via scope-mekanismen, ikke uden om den.

### V3's konkrete brud

V3 sætter `employee_team_assignments` SELECT-policy til `using (true)`. Konsekvenser pr. §5:

| §5-fundament                      | V3's brud                                                                                                                                                |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §5.1 to dimensioner               | V3 fjerner scope-dimensionen for denne tabel — eneste reelle filter er "er du authenticated"                                                             |
| §5.2 firedimensionel model        | V3 ignorerer page_key, tab_key, can_view, scope for denne tabel — uanset hvilken page der querier den, ser alle alt                                      |
| §5.4 én page med scope-filtrering | Hvis to forskellige pages bruger denne tabel (fx "Min profil" og "Team-administration"), KAN UI'en ikke give dem forskellig scope — RLS er allerede åben |
| §5.6 UI håndhæver                 | UI'en kan ikke håndhæve noget når RLS-policyen er `using (true)`                                                                                         |
| pkt 7                             | Cross-team-adgang sker uden om scope — alle ser alt uafhængigt af rolle                                                                                  |

V3 bygger en undtagelse for én tabel uden for §5's model. Hvis det får lov til at stå, bliver det præcedens: "tabeller der har RLS-recursion-problemer → giv dem `using (true)` og kald det metadata". Det underminerer hele rettighedsmodellen for fremtidige tabeller.

**Severity: KRITISK.** Modsiger låst fundament på fire niveauer plus eksplicit afgørelse.

---

## Hvad V4 skal levere

V3's tekniske problem (RLS-recursion mellem `acl_subtree_employees` og `employee_team_assignments`) skal stadig løses. Men IKKE ved at gøre tabellen åben.

Code har selv i V3's Strukturel beslutning skitseret den korrekte løsning:

> "hvis Mathias senere ønsker subtree-niveau-visibility på assignments-listen (FM-chef ser kun assignments for egen subtree), kan en denormaliseret core_identity.employee_org_unit_memberships(employee_id, org_unit_id, from_date, to_date)-cache-tabel indføres. Cache vedligeholdes af trigger på employee_team_assignments, har using (true) SELECT-policy (struktur), og helper læser denne cache i stedet for assignments direkte."

V4 skal indeholde cache-arkitekturen. Code klassificerede den i V3 som "master-plan-rettelse-niveau-beslutning, ikke V3-scope". Med §5 og pkt 7 som låst fundament er den ikke uden for scope — den er nødvendig for at honore fundamentet.

**Konkret for V4:**

1. **Cache-tabel oprettes som del af T9** (`employee_org_unit_memberships` eller tilsvarende). Cache-tabellen har `using (true)` på SELECT (den er ren struktur uden forretningsdata; samme rationale som `org_unit_closure` og `teams` der allerede er `using (true)`).

2. **Trigger på `employee_team_assignments`** holder cache synkron. Trigger fyrer ved INSERT/UPDATE/DELETE og ved relevante ændringer i `teams.org_unit_id`.

3. **Hjælpe-funktionen `acl_subtree_employees`** læser cache-tabellen i stedet for at scanne `employee_team_assignments` direkte. Det bryder rekursions-kæden.

4. **`employee_team_assignments` får scope-baseret SELECT-policy** som §5 kræver. Subtree-clause som V2 forsøgte, men nu uden rekursion fordi helperen læser cache.

5. **Tests skal verificere pr-page scope-evaluering:**
   - TM sælger på "Min profil" (scope=self) → ser kun egen tilknytning
   - TM sælger på "Team-overblik" (scope=team) → ser teamets tilknytninger
   - FM-chef på relevant page (scope=subtree) → ser tilknytninger i egen afdeling og under
   - Stab (scope=all) → ser alt
   - Tests bruger `set local role authenticated` + `request.jwt.claim.sub` per Codex V2-anbefaling

Det er strukturel ændring af V3 — ikke kosmetisk justering.

---

## Mathias' egen formulering om fundamentet (2026-05-17)

> "Det er vigtigt at hvad der kan ses bliver ui styret på page/tab niveau. eks Rolle=TM sælger - vagtplan = kun sig selv - Kalender = team osv."

Denne sætning fra Mathias er præcis det fundament V4 skal honore. Tabellen `employee_team_assignments` skal opføre sig efter samme regel: scope-værdien for den (rolle × page × tab)-kombination der querier tabellen.

---

## Forventet flow

1. Code paster qwerr → laver T9-plan-V4 med cache-arkitektur og scope-baseret policy på assignments
2. Codex reviewer V4 (kode-validering — cache-trigger-korrekthed, atomicity, FK-coverage på cache, ingen RLS-recursion)
3. Claude.ai reviewer V4 (forretnings-dokument-konsistens — §5.1/§5.2/§5.4/§5.6/pkt 7 honoreret)
4. Begge approver → qwerg → build

---

## Rapportér-format

```
Review-type: plan V3
Pakke: T9 (Identitet del 2)
Resultat: FEEDBACK (KRITISK)
Status: trækker tidligere V3-approval tilbage
Feedback-fil: docs/coordination/plan-feedback/T9-V3-claude-ai.md
Forretnings-dokument-konflikter: 1 KRITISK på 5 niveauer
- §5.1 (to dimensioner): V3 fjerner scope-dimensionen for assignments
- §5.2 (firedimensionel model): V3 ignorerer page_key/tab_key/scope
- §5.4 (én page med scope-filtrering): umuligt når RLS er åben
- §5.6 (UI håndhæver): umuligt når RLS er åben
- mathias-afgoerelser 2026-05-16 pkt 7: cross-team-adgang via scope, ikke uden om
Reviewer-fejl anerkendt: tidligere approval behandlede dette som MELLEM; korrekt severity er KRITISK på fundament-niveau.
Mathias-direktiv 2026-05-17 (denne chat): "hvad der kan ses bliver ui styret på page/tab niveau" — V4 skal honore dette.
```

Approval-port-status:

- Claude.ai (forretnings-dokumenter): **FEEDBACK** (tidligere approval trukket tilbage)
- Codex (kode): approved V3 — men V4 kommer; Codex skal re-reviewe når Code leverer (forventes at finde V4 teknisk gennemførlig med cache-arkitektur)
