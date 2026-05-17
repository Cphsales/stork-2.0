# T9 V2 — Approval fra Claude.ai

**Reviewer:** Claude.ai (forretnings-dokument-reviewer)
**Plan-version:** V2
**Plan-fil:** `docs/coordination/T9-plan.md`
**Dato:** 2026-05-17
**Resultat:** APPROVAL

---

## Fire-dokument-konsultations-tjek

| Tjek                                                    | Resultat |
| ------------------------------------------------------- | -------- |
| Sektion findes i plan                                   | ✓        |
| Alle 4 rækker har "ja" på konsulteret                   | ✓        |
| Referencer konkrete (ikke "hele filen" som dovent svar) | ✓        |
| Konflikter rapporteret af Code                          | ingen    |

---

## V1-findings status

### Finding 1 — Princip 8-reference upræcis (KOSMETISK)

**Status: LØST i V2.**

Code har fjernet princip 8-reference fra vision-rækken i Fire-dokument-konsultations-tabellen. V2 tilføjer eksplicit note: "én medarbejder i ét team ad gangen (krav-dok pkt 7) er IKKE afledt af vision-princip 8 — princip 8 handler om person-entitets-unikhed på tværs af eksterne systemer (identitets-master i §1.7), ikke om team-tilknytnings-unikhed. Korrekt kilde: mathias-afgoerelser pkt 7. Reference rettet per Claude.ai V1 finding 1".

Materielt korrekt. Rettelsen er præcis.

### Finding 2 — Rettelse 23-mønster udvides til derived-tables (KOSMETISK)

**Status: LØST i V2.**

Code's Valg 3 har nu eksplicit "Kategori-udvidelse acknowledged (Claude.ai V1 finding 2)"-sektion der forklarer udvidelsen ærligt: "Rettelse 23 i master-plan formulerede `AUDIT_EXEMPT_SNAPSHOT_TABLES` specifikt for snapshot-tabeller som compute-byproducts... Closure-table er semantisk derived-from-parent men ikke compute-byproduct af én aggregat-event — hver org_units-mutation producerer mutationer i closure. Princippet ('audit-spor findes på forudgående mutation') holder i begge tilfælde, men anvendelse på closure er en kategori-udvidelse af eksisterende mønster".

G-nummer-kandidat dokumenteret: master-plan rettelse 23 udvides eller suppleres med eksplicit derived-tables-kategori efter T9-merge.

Master-plan-rækken i Fire-dokument-konsultations-tabellen reflekterer også udvidelsen eksplicit.

### Finding 3 — CI-blocker 19-allowlist udvides til ny kategori (KOSMETISK)

**Status: LØST i V2.**

Code's Valg 4 har nu eksplicit "Kategori-udvidelse acknowledged (Claude.ai V1 finding 3)"-sektion: "CI-blocker 19's `FK_COVERAGE_EXEMPTIONS` blev oprettet for eksterne reference-ID'er (fx `client_crm_match_id` der peger uden for Stork's schema; jf. master-plan rettelse 33). `client_team_ownerships.client_id` er en intern FK der venter på cross-trin schema-evolution (trin 10 tilføjer FK ved ALTER) — ny use-case for allowlist-mekanismen".

G-nummer-kandidat dokumenteret: hvis mønstret gentages bør mathias-afgørelse eller master-plan-rettelse formalisere etableret pattern.

Step 10 i implementations-rækkefølgen tilføjer eksplicit G-nummer-kandidater fra findings 2+3 til `teknisk-gaeld.md`. Det matcher min V1-anbefaling.

---

## Verificering af V2-ændringer mod forretnings-dokumenter

V2 introducerer arkitektur-ændringer som svar på Codex KRITISKE-fund. Selvom Codex' fund er kode-bord, har ændringerne forretnings-dokument-implikationer jeg skal verificere.

### Helper-split (acl_subtree_org_units + acl_subtree_employees)

V1 havde én helper `acl_subtree(employee_id) returns uuid[]` med tvetydig semantik. V2 splitter til to helpers med eksplicit return-type.

**Master-plan §1.7 verificeret:** §1.7 siger "Helper `acl_subtree(employee_id)` returnerer descendant-array via indexed lookup, ingen rekursion ved query-tid". Specifikationen siger ikke noget om return-type — det er udeladt detalje, ikke fastsat regel. §1.7 nævner én helper, men ikke "kun én helper må eksistere".

V2's split er **præciserings-udvidelse** af §1.7's mønster, ikke brud. Princippet "ingen rekursive CTE'er i RLS-policy-prædikater" er stadig overholdt for begge helpers. Helpers er stadig STABLE, SECURITY INVOKER, deterministisk search_path (master-plan §1.1 + §1.7).

**Vision-konsistens:** Princip 2 (rettigheder i UI) styrkes — splittet gør det muligt at bruge `acl_subtree_org_units` i client_team_ownerships-policy (team → org_unit-chain) når trin 10 aktiverer, hvilket den oprindelige enkelt-helper ikke ville understøtte rent.

**Code's håndtering:** "Strukturel beslutning"-sektionen forklarer udvidelsen åbent som svar på Codex KRITISK fund 1. Det er gennemsigtig håndtering, ikke skjult ændring.

### Step 5 ny — acl-helpers + team_deactivate

V1 oprettede acl_subtree i Step 2 (efter closure) men før teams (Step 3) og employee_team_assignments (Step 4). V2 flytter helpers + team_deactivate til Step 5 hvor dependencies eksisterer.

**Master-plan §1.7 konsistens:** acl-helpers' tekniske egenskaber (STABLE, SECURITY INVOKER, deterministisk search_path) bevares. Rækkefølge-ændring er kode-spørgsmål, ikke forretnings-spørgsmål.

**Mathias-afgoerelser pkt 3 konsistens:** team_deactivate er den dedikerede RPC der "lukker alle åbne employee_team_assignments via dedikeret UPDATE" — det matcher mathias-afgoerelser pkt 3 ordret: "Når team ophører, forbliver medarbejderne ansatte uden team-tilknytning (ikke fyret, bare team-løse)". RPC implementerer denne forretnings-regel teknisk.

### Step 4 midlertidig self+admin-policy + Step 7 subtree-udvidelse

V2 deler subtree-policy-aktivering: Step 4 har midlertidig self+admin-clause (fordi `acl_subtree_employees` først eksisterer fra Step 5); Step 7 udvider med subtree-clause efter helpers er på plads.

**Vision-princip 2 konsistens:** Policy-replacement er additiv — eksisterende self-clause bevares, subtree-clause tilføjes. Princippet om "team-træ styrer hvilken data der vises" er målet; V2's faseinddeling når dertil med korrekt rækkefølge.

**Test-konsekvens:** Step 4-tests bekræfter midlertidig self+admin-adgang virker; Step 7-tests bekræfter subtree-udvidelse er korrekt. Begge tests inkluderet i V2.

### Step 7 samler subtree-policies på employees + employee_team_assignments

V2 aktiverer subtree-policy på begge tabeller samtidig (employees får udvidet SELECT; employee_team_assignments får ny subtree-clause).

**Princip 2 + mathias-afgoerelser pkt 7 konsistens:** Employee-data tilgås via subtree (FM-chef ser alle employees i sin afdeling); assignment-data tilgås via subtree (FM-chef ser alle assignments). Konsistent forretnings-model: "cross-team-adgang via rolle-scope, ikke via flere tilknytninger" (mathias-afgoerelser pkt 7).

### Step 10 dokumenterer findings 2+3 som G-numre

V2's Step 10 ekspliciterer at `teknisk-gaeld.md` får G-nummer-kandidater fra mine V1 findings 2+3. Det matcher hvad jeg anbefalede i V1-approvalen.

---

## Mathias' afgørelser-mapping (verificeret 1:1)

Alle 19 afgørelser fra krav-dok stadig honoreret 1:1. Alle 9 forretningssandheder fra mathias-afgoerelser 2026-05-16 entry stadig mappet til konkrete plan-elementer. V2's helper-split og step-re-ordering ændrer ikke noget materielt i forretnings-mapping — kun teknisk implementation.

---

## Approval-rationale

V2 adresserer:

- **Codex V1 KRITISK 1** (acl_subtree-kontrakt tvetydig) — helper splittet med eksplicit return-semantik. Forretnings-dokument-mæssigt konsistent med §1.7 som præciserings-udvidelse.
- **Codex V1 KRITISK 2** (implementations-rækkefølge) — steps re-orderet til lineær dependency-chain. Kode-bord; ingen forretnings-dokument-implikation.
- **Claude.ai V1 KOSMETISK 1** (princip 8-reference) — fjernet og rettet til mathias-afgoerelser pkt 7.
- **Claude.ai V1 KOSMETISK 2** (rettelse 23-kategori-udvidelse) — eksplicit flagget i Valg 3 med G-nummer-kandidat.
- **Claude.ai V1 KOSMETISK 3** (CI-blocker 19-kategori-udvidelse) — eksplicit flagget i Valg 4 med G-nummer-kandidat.

Alle fem fund er adresseret. Planen er fortsat konsistent med alle fire forretnings-dokumenter på materielt niveau. V2's strukturelle ændringer (helper-split, step-re-ordering) er præciserings-udvidelser inden for §1.7's mønster, ikke brud.

---

## Forretnings-dokument-konflikter spotted

Ingen.

---

## Rapportér-format

```
Review-type: plan V2
Pakke: T9 (Identitet del 2)
Resultat: APPROVAL
Feedback-fil: docs/coordination/plan-feedback/T9-V2-approved-claude-ai.md
Kritiske fund: ingen
Forretnings-dokument-konflikter spotted: ingen
G-nummer-kandidater fra V1: 3 (alle eksplicit dokumenteret i V2 + Step 10 tilføjer til teknisk-gaeld.md)
Nye fund i V2: ingen
```

Plan er approved af Claude.ai for V2. Afventer Codex's V2 kode-review for at lukke approval-port (dobbelt-port).
