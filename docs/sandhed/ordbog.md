# Ordbog (Mathias' ord ↔ systemord)

Én ordbog for hele Stork (disciplin.md §2 trin 2 »Ordbogen arves«): alt Mathias ser, bruger hans ord; planen og koden arver navnene eller mapper dem her. En navne-afvigelse uden række er et fund i Codex' planlæsning. Krav-rollen høster kandidater i krav-dialogen; Code tilføjer planens rækker.

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

## Plan v3.8 (pakke 1) — nye navne

| Mathias' ord | systemord (planens navne) | kilde |
|---|---|---|
| lokation | `core_identity.lokationer` · indgange `lokation_*` | plan v3.8 · M-23/M-24 · §1.12 |
| kobles på / kobles fra (gruppen) | `core_identity.gruppe_klient_koblinger` · `gruppe_klient_kobl` · `gruppe_klient_frakobl` | plan v3.8 · M-12/M-17 |
| fravælge / ophæve fravalget | `core_identity.lokation_klient_fravalg` · `lokation_klient_fravaelg` · `lokation_klient_fravalg_ophaev` | plan v3.8 · M-17 · K-3 ac 6 |
| må stå på (klienten på lokationen) | `klient_maa_staa_paa(klient, lokation, dato)` · `lokation_klienter` (afledt ret, ingen gemt tilladelse) | plan v3.8 · forretningsforstaaelse §14 · K-6 ac 7 |
| kan bookes | `lokation_er_bookbar` · `stand_er_bookbar` (kun status aktiv) | plan v3.8 · M-25.1 |
| sætte i dvale / stoppe dvaleperioden / nedlægge / genåbne | `lokation_saet_status` (samme handling for alle skift) | plan v3.8 · M-25/M-27b/M-28 |
| dvale til en dato | `dvale_ophoer` (første dag lokationen kan bookes igen) | plan v3.8 · K-5 |
| antal hviledage | `lokationer.hviledage` (heltal, dage; NULL = intet valgt) | plan v3.8 · M-21 |
| dagspris | `dagspris` · `lokation_dagspris_paa` · `stand_dagspris_paa` · `pris_historik` | plan v3.8 · K-1/K-2 |
| type (butik / messe / marked / event / andet) | CHECK-værdierne `'butik','messe','marked','event','andet'` | plan v3.8 · K-1 |
| taget ud af brug (gruppe, stand, kontaktperson) | `is_active = false` · `gruppe_saet_aktiv` · `stand_saet_aktiv` · `gruppe_kontakt_saet_aktiv` | plan v3.8 · K-2/K-3 ac 5 |
| gruppeskift (lokationen skifter ejer) | `lokation_saet_gruppe` · `lokation_gruppe_historik` | plan v3.8 · K-6 ac 7 |
| anonymisere | `anonymiser_gruppe_kontakt` · `anonymiser_lokation` | plan v3.8 · K-7 |
| årsag | parameteren `p_change_reason` | plan v3.8 · K-8 |
| systemets dag | `core_identity.dags_dato_utc()` (UTC-dagen) | plan v3.8 · afvigelse A7 |
