# ordbog — lokations-skabelon (Mathias' ord ↔ systemord)

Regler (plan Fase 1/B3): al Mathias-flade bruger HANS ord; planen/koden ARVER
navnene eller mapper eksplicit her — en navne-afvigelse uden ordbogs-entry er
en FAIL ved plan-gaten. Vedligeholdes af driveren; kandidater høstes af
recon-Claude.ai (fra pakke 2) og af krav-dialogen.

| Mathias' ord | systemord (recon/masterplan) | kilde |
|---|---|---|
| stand / stande | placement (child-lokation m. parent_location_id) | M-14 (»lokaitoner beholder de oprettede stande«) · §1.12 |
| gruppe | leverandør (egen master-data-entitet m. type-felt) | krav-dialogen (mathias-78-relæ) · §1.12 |
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
