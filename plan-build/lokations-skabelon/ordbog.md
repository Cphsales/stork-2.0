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
| tilladelse | klient-tilladelse pr. lokation (klient × lokation × from/to-date, versioneret) | §1.12 · krav-dok |
| koble på / koble fra | oprette/lukke klient-tilladelses-version | M-12 · M-14 |
| lokation | core_identity-lokations-entitet (top-niveau) | §1.12 |

Åbne kandidater (bekræftes i krav-/plan-dialogen): »§14-funktion« for
tilladelse (nævnt i krav-arbejdet — mangler ordret Mathias-kilde i ledgeren).
