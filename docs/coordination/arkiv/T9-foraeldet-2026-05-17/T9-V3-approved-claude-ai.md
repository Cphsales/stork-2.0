# T9 V3 — Approval fra Claude.ai

**Reviewer:** Claude.ai (forretnings-dokument-reviewer)
**Plan-version:** V3
**Plan-fil:** `docs/coordination/T9-plan.md`
**Dato:** 2026-05-17
**Resultat:** APPROVAL (med 1 MELLEM-finding som G-nummer-kandidat — kræver Mathias-eskalering)

---

## Fire-dokument-konsultations-tjek

| Tjek                                                    | Resultat |
| ------------------------------------------------------- | -------- |
| Sektion findes i plan                                   | ✓        |
| Alle 4 rækker har "ja" på konsulteret                   | ✓        |
| Referencer konkrete (ikke "hele filen" som dovent svar) | ✓        |
| Konflikter rapporteret af Code                          | ingen    |

V3 har tilføjet eksplicit §1.1-reference (SECURITY INVOKER-bevarelse) til master-plan-rækken. Det er præciserende og korrekt.

---

## V1+V2-findings status

**Alle 5 tidligere findings adresseret og bevaret i V3:**

- Codex V1 KRITISK 1 (helper-kontrakt tvetydig) — splittet bevaret ✓
- Codex V1 KRITISK 2 (implementations-rækkefølge) — lineær dependency-chain bevaret ✓
- Claude.ai V1 KOSMETISK 1 (princip 8-reference) — rettet, bevaret ✓
- Claude.ai V1 KOSMETISK 2 (rettelse 23-kategori-udvidelse) — eksplicit flagget i Valg 3, bevaret ✓
- Claude.ai V1 KOSMETISK 3 (CI-blocker 19-kategori-udvidelse) — eksplicit flagget i Valg 4, bevaret ✓

---

## Codex V2 KRITISK-håndtering — forretnings-dokument-vurdering

V3 løser RLS-rekursion via `employee_team_assignments_select = using (true)` på helper-source-tabeller (closure/teams/assignments). Det er kode-bord teknisk korrekt — alternativet (SECURITY DEFINER på helper) ville bypassse RLS og bryde master-plan §1.1's "Pure, STABLE, SECURITY INVOKER, deterministisk search_path".

V3's løsning **bevarer** master-plan §1.1's SECURITY INVOKER-krav og §1.7's princip om "ingen rekursive CTE'er i RLS-policy-prædikater". Ingen master-plan-deviation. Forretnings-dokument-konsistens på denne dimension: OK.

**Men:** løsningen flytter visibility-modellen for assignments-tabellen — det er forretnings-dokument-relevant.

---

## MELLEM-finding — Visibility-model for `employee_team_assignments` er strategisk forretnings-beslutning ikke autoritativt afgjort

**Severity:** MELLEM

**Konkret afvigelse:** V3 ændrer `employee_team_assignments` SELECT-policy fra V2's subtree-clause til `using (true)` (alle authenticated-brugere ser alle assignments). Code's argument (V3 Strukturel beslutning + Konklusion): "team-membership behandles som strukturel meta-data (synlig på tværs af authenticated-rolle), ikke som scope-beskyttet data".

Det er en strategisk forretnings-beslutning om visibility-modellen:

- **V3 valgt — lempelig:** team-medlemskab = åben metadata på tværs af afdelinger. FM-chef ser alle assignments inkl. udenfor egen afdeling. Forretningsdata-scope (sales, calls, payroll) bevares via subtree-policies på forretnings-tabeller fra trin 14+.
- **V2 alternativ — strikere:** team-medlemskab = privat per afdeling. FM-chef ser kun assignments i egen subtree. Kræver denormaliseret cache-tabel (`employee_org_unit_memberships`) for at undgå RLS-rekursion — beskrevet i V3's Strukturel beslutning som åben alternativ-arkitektur.

**Verificering mod de fire dokumenter:** Ingen af dem afgører visibility-modellen direkte:

- **Vision-princip 2** ("Team-træ styrer hvilken data der vises. Page/tabs styrer hvilke dele af systemet der ses") er flertydig. "Data" kan referere til forretningsdata (sales, calls — det Code antager) eller til strukturen selv (assignments-tabellen). Code's fortolkning er forsvarlig men ikke éntydig fra princip-teksten.
- **Master-plan §1.7** specificerer scope-mekanismen (self/team/subtree/all) generelt, ikke pr. tabel-policy. Specifikt for assignments siger §1.7 kun "Versioneret med from_date + to_date. Partial unique på (medarbejder, to_date IS NULL)". Visibility er ikke fastlagt.
- **Mathias-afgoerelser 2026-05-16** punkterne 1-9 dækker org-struktur, team-livscyklus, klient-data-ejerskab. Punkterne 6-7 berører synlighed (is_active-flag) og single-team-regel, men ikke visibility på tværs af struktur. Punkt 7 nævner "cross-team-adgang via rolle-scope" som mekanisme — det implicerer at strikere visibility er den default tænkning, men ikke specifikt for assignments-tabellen.
- **Krav-dok** specificerer ikke visibility-model for assignments-tabellen.

**Per arbejds-disciplin:** "Mathias afgør forretning. Code afgør teknik." Visibility-model er forretning (hvem ser hvad), ikke teknik (hvordan implementeres RLS).

**Code's håndtering er pæn:**

- Tradeoff eksplicit acknowledged i V3's Revision-sektion og Strukturel beslutning
- Alternativ-arkitektur (denormaliseret cache-tabel) dokumenteret som åben option
- Klassificeret som "master-plan-rettelse-niveau-beslutning" hvis Mathias ønsker stricter visibility

Men beslutningen selv er truffet i V3-planen uden eksplicit Mathias-godkendelse i de fire forretnings-dokumenter. Code har truffet en forretnings-beslutning som del af teknisk plan-arbejde.

**Anbefalet handling:** G-nummer-kandidat: "Mathias formaliserer visibility-model for `employee_team_assignments` i mathias-afgoerelser efter T9-merge". Mathias har to veje:

1. **Acceptere V3-valg:** entry i mathias-afgoerelser der formaliserer "team-medlemskab er strukturel metadata; visibility = using (true)". Princip-præcedens for fremtidige struktur-tabeller. Pre-cutover ingen produktions-konsekvens.
2. **Ønske stricter visibility:** entry der etablerer "team-medlemskab er privat per afdeling". Master-plan-rettelse indfører denormaliseret cache-tabel (skitseret i V3's Strukturel beslutning) — kan ske senere (trin 10+) uden at blokere T9 nu fordi forretningsdata-scope er bevaret.

Per severity-disciplin V3 er runde 3 → MELLEM-fund leverer APPROVAL + G-nummer-anbefaling, ikke V4-blocker. Pre-cutover ingen reel data-risiko. Mathias afgør timing.

**Hvorfor MELLEM og ikke KOSMETISK:** dette er ikke en reference-fejl eller stilistisk præcisering (som V1-findings 1-3). Det er en strukturel forretnings-beslutning der hører under Mathias' bord per arbejds-disciplinen. Konservativ severity-vurdering pr. min overvågnings-prompt.

**Hvorfor MELLEM og ikke KRITISK:** V3 modsiger ikke noget eksplicit afgjort i de fire dokumenter. Code's fortolkning af princip 2 er forsvarlig. Det er en åben strategisk beslutning, ikke en modsigelse af afgjort linje.

---

## Approval-rationale

V3 lukker Codex V2 KRITISK korrekt (bevarer SECURITY INVOKER, ingen master-plan-deviation). Alle V1+V2-findings adresseret og bevaret. Fire-dokument-konsultations-tabel udfyldt korrekt.

Ét MELLEM-finding eskaleret som G-nummer-kandidat: visibility-modellen for assignments-tabellen er strategisk forretnings-beslutning der hører under Mathias' bord. Code's V3-valg er åbent dokumenteret og rimeligt forretningsmæssigt; pre-cutover ingen reel risiko. Mathias formaliserer beslutningen efter T9-merge.

Approval gives fordi:

1. Per severity-disciplin V3 er runde 3 — MELLEM-fund → G-nummer, ikke V4-blocker
2. Pre-cutover ingen data-konsekvens af visibility-valg
3. Alternativ-arkitektur er nemt at indføre senere uden T9-rollback
4. Forretnings-dokument-konsistens på materielt niveau holdt: §1.1 (SECURITY INVOKER) bevaret, §1.7 (closure + helpers + versioneret tilknytning) implementeret 1:1, alle 9 mathias-afgoerelser-punkter stadig mappet, alle krav-dok-leverancer adresseret

---

## Forretnings-dokument-konflikter spotted

Ingen direkte modsigelser. Én strategisk åben beslutning eskaleret (visibility-model).

---

## Rapportér-format

```
Review-type: plan V3
Pakke: T9 (Identitet del 2)
Resultat: APPROVAL
Feedback-fil: docs/coordination/plan-feedback/T9-V3-approved-claude-ai.md
Kritiske fund: ingen
MELLEM-fund (G-nummer-kandidat): 1 (visibility-model for employee_team_assignments er strategisk forretnings-beslutning der bør formaliseres af Mathias)
Forretnings-dokument-konflikter spotted: ingen direkte modsigelser
G-nummer-kandidater fra V1: 3 (alle dokumenteret i V3 Step 10 → teknisk-gaeld.md)
G-nummer-kandidat fra V3: 1 (visibility-model — kræver Mathias-eskalering)
```

Plan er approved af Claude.ai for V3. Afventer Codex's V3 kode-review for at lukke approval-port (dobbelt-port).

**Vigtigt for Mathias' qwerg-overvejelse:** approval gives med eksplicit G-nummer-eskalering. Hvis Mathias accepterer V3-visibility-valget, bør entry tilføjes til mathias-afgoerelser som del af T9-merge eller umiddelbart efter. Hvis Mathias ønsker stricter visibility, kan T9 bygges som V3 nu og denormaliseret cache indføres som separat pakke senere (ingen T9-rollback nødvendig).
