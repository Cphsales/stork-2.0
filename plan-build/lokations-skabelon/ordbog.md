# ordbog — lokations-skabelon (Mathias' ord ↔ systemord)

Regler (plan Fase 1/B3): al Mathias-flade bruger HANS ord; planen/koden ARVER
navnene eller mapper eksplicit her — en navne-afvigelse uden ordbogs-entry er
en FAIL ved plan-gaten. Vedligeholdes af driveren; kandidater høstes af
recon-Claude.ai (fra pakke 2) og af krav-dialogen.

| Mathias' ord | systemord (recon/masterplan) | kilde |
|---|---|---|
| stand / stande | placement (child-lokation m. parent_location_id) | M-14 (»lokaitoner beholder de oprettede stande«) · §1.12 |
| gruppe (tidlig læsning) | leverandør (egen master-data-entitet m. type-felt) — AFKLARES i plan-fasen: er gruppen leverandør-entiteten udvidet m. klient-kobling? | krav-dialogen · §1.12 |
| dvale / hvile | status-tilstand mellem aktiv og nedlagt (+ cooldown-relateret) | M-7 (status: aktiv·dvale·nedlagt) |
| nedlagt | status-livscyklussens slut-tilstand (historik bevares — M-13) | M-7 · M-13 |
| gruppe | ejer-entiteten: gruppe EJER lokationer; klienter kobles på gruppen og arver lokationerne | M-17 · M-18 |
| ejer | ejerkæden gruppe→lokation→stand | M-18 |
| kobles på (gruppen) | klient-kobling sker på GRUPPE-niveau (arver lokationer) | M-17 |
| fravælge | lokation fravælger en klient gruppen har (undtagelse pr. lokation) | M-17 |
| tilladelse (FORÆLDET af gruppe-modellen, M-17) | ~~klient × lokation direkte~~ → retten kommer fra gruppe-koblingen + lokations-fravalg | M-17 · runde 2-krav |
| koble på / koble fra (FORÆLDET som lokations-direkte, M-17) | kobling ligger på gruppen; pr. lokation hedder det til-/fravalg | M-12 · M-17 |
| lokation | core_identity-lokations-entitet (top-niveau) | §1.12 |

Åbne kandidater (bekræftes i krav-/plan-dialogen): »§14-funktion« for
tilladelse (nævnt i krav-arbejdet — mangler ordret Mathias-kilde i ledgeren).

## Plan-fasens navne-entries (appendet af driveren FØR plan-gaten — plan.md §4)

| Mathias' ord | systemord (planens navne) | kilde |
|---|---|---|
| stand / stande (OPDATERER tidligere entry) | `core_identity.stande` (egen tabel m. `lokation_id`-FK, S-1) — IKKE child-lokation m. parent_location_id; »placement« = masterplanens ord | plan.md §4 · M-14/M-17/M-18 |
| gruppe (LUKKER afklaringen) | `core_identity.grupper` · `gruppe_id` — gruppen ER leverandør-entiteten: ÉN entitet | plan.md V5 · M-17/M-18/M-27c · §1.12 |
| aktiv · dvale · nedlagt (RETTER »slut-tilstand«) | enum-værdier `'aktiv'`,`'dvale'`,`'nedlagt'` + tabel `lokation_status_skift`; nedlagt er GENÅBNELIG | plan.md §4 · M-25.1 · M-28 |
| gruppens type | CHECK-værdier `'kaede','enkelt_butik','messe_operatoer','andet'` (ASCII æ/ø→ae/oe) | plan.md §4 · §1.12 |
| kontaktperson | `core_identity.gruppe_kontakter` | plan.md §4 · K-7/§11 |
| klient | eksisterende `core_identity.clients` · param-/kolonnenavn `klient_id` (dansk i pakkens flade; tabellen uændret) | plan.md §4 |
