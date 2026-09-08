# ANALYSE-r4 — buildability delta-dom (aktør: code), krav-gate RUNDE 4 (v5-delta, sidste)

Pakke: lokations-skabelon · run_id: fase2-buildability-code-r4 · bygger oven på ANALYSE.md (r2, PASS @ blob 43b3e0aa) og ANALYSE-r3.md (r3, PASS @ blob b9c5249b).

## 1. Input-verifikation

- Pinned commit `efc85d5e7ca70aa1689306ee4bf5e560bed029c5` (git rev-parse HEAD — verificeret).
- Krav-doc @ blob `9402164d87a35fb939661058bea77c1a052493d0` (git rev-parse — verificeret); helper-konstanter i workdir-rodens verdikt-byg.mjs matcher (GATED_COMMIT/ARTIFACT_OID — verificeret).
- Delta set SELV med `git diff b9c5249b 9402164d`: 8 insertions / 8 deletions, ALLE hunks er 1:1-linjeudskiftninger (linje 9, 57, 134, 138, 181, 399, 401, 407) — ingen linjeforskydning (ny blob = 426 linjer som v4), ingen andre ændringer.
- Kode-/recon-evidens blob-identisk med r2/r3: recon.md @ `7fbd3a2f`, t9_org_nodes @ `71cadac3`, t10_tables @ `359c0b23`, r7h @ `6083fecd` — mine linjelæsninger gælder uforandret.

## 2. Delta-dom pr. fund: ændrer de 4 P-4-fund PASS?

**Nej — PASS består.** Alle fire er ærligheds-/dispositions-rettelser uden ny substans, og begge sider af hvert nyt plan-fase-valg er kodbare inden for rammen:

- **F-01 (Grundlag, linje 9):** gate-beviset er nu refereret præcist ("recon-gate open:true @ afcf408 · bevis recon/recon-coverage-proof.json @ 58d2bac"). SELV-VERIFICERET: 58d2bac er en commit i repoet; `git rev-parse 58d2bac:recon/recon-coverage-proof.json` = `6b4cbc48…` = HEAD-blob'en — referencen er ærlig og reproducérbar. Ren provenance-styrkelse; buildability-neutral.
- **F-02 (K-3 Værdi linje 57, K-7 Værdi linje 138, plan-fase linje 181):** felt-registry er korrekt degraderet fra kendsgerning til plan-fase-VALG ("feltliste fast eller UI-udvidelig") med deklareret analogi-kilde (klient-mønstret/client_field_definitions) og default ("som for klienter"). Begge udfald er kodbare 1:1: faste kolonner = domæne-tabel-skabelonen; UI-udvidelig = client_field_definitions + fields-jsonb-skabelonen (begge linjelæst i r2, t10_tables). Valget interagerer korrekt med det eksisterende K-7-plan-punkt om anonymiserings-vej (registry-jsonb ⇒ jsonb-vejen skal vælges bevidst — allerede disponeret i v4/N2). Buildability uændret.
- **F-03 (K-7 HVAD linje 134 + dispositions-række linje 401):** "lokationens felter er forretningsdata" er ærligt omklassificeret til pr.-felt-valg m. konservativ default, deklareret som vores læsning (intet Mathias-ord) — med recon'ens adresse-eksempel. Konsistens-tjek foretaget: ingen konflikt med princip 4/ac 3 ("uden aktivt valg er intet felt persondata"), fordi ac 1 i forvejen TVINGER et aktivt klassifikationsvalg pr. kolonne i leverancen — den konservative default er et aktivt bygge-valg, ikke en mekanisme-default. Klassificeres et lokations-felt aktivt som persondata, aktiverer ac 4 lokations-anonymiseringen — infrastrukturen (anonymized_at, mapping, dæknings-gate) findes. Acceptkriterierne er uændrede og fortsat testbare. Buildability uændret.
- **F-04 (linje 407):** "12 intet-data-flag" → "11" — talrettelse. SELV-VERIFICERET mod recon'en (r2-læsning): bøtte 3 indeholder præcis 11 intet-data-fund. Neutral.

## 3. Evidens-re-verifikation mod ny blob

Alle hunks 1:1 ⇒ ingen forskydning. Spans genbrugt/justeret: K-3 [52,67] (indeholder ændret linje 57 — læst i ny blob via diff), K-7 [132,145] (indeholder ændrede linjer 134/138 — læst; K-8 starter linje 147, verificeret), plan-fase [179,182] (ændret linje 181 — læst), Grundlag [9,11] (ændret linje 9 — læst), usikkerheds-disposition [405,408] (ændret linje 407 — læst direkte i ny blob). Kode-anker uændret: t10_tables [24,80] (analogi-kilden clients/fields) og r7h [22,127] (jsonb-kendsgerningen bag K-7-plan-punktet); recon-spannet er skiftet fra [347,358] til bøtte 3 [1361,1407] (læst i r2, blob-identisk) — det bærer F-04-tællingen (præcis 11 intet-data-fund) og F-03's adresse-flag.

## 4. Konklusion

**PASS.** v5-delta'et retter kildetjekkets 4 fund ærligt (bevis-reference verificeret reproducérbar; to kendsgerninger nedgraderet til deklarerede valg/læsninger med kodbare defaults inden for rammen; tælle-fejl rettet). Ingen nye acceptkriterier, ingen ny substans, ingen modsigelser; alle 9 K-krav fortsat byggelige med testbare acceptkriterier. Ingen rest-noter fra denne akse.
