# H024 Plan V2 — Claude.ai approval

**Review-type:** Plan V2
**Resultat:** APPROVAL
**Runde:** 2
**Branch:** `claude/H024-plan`
**Reviewer-fokus:** Krav-konsistens, scope-glid, kvik-løsninger, vision-principper

---

## Oprydnings-sektion-tjek

OK. Planen har konkret "Oprydnings- og opdaterings-strategi" med fil-flytninger, dokument-opdateringer, reference-konsekvenser, og note om scope-bonus afdæknings-fil-import.

---

## V1-fund — alle adresseret

| Fund (severity)                                                                 | Reviewer  | V2-handling                                                                                                                                                  | Approval-status |
| ------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| Cleanup-migration mangler test-only guard (KRITISK)                             | Codex     | Step 1 omskrevet med marker-based DELETE pr. tabel, pre/post-precondition-assertions, temp-table for pay_period-IDs, 5 reelle rows eksplicit ekskluderet     | ✓ Adresseret    |
| Audit-spor-antagelse for commission_snapshots forkert (MELLEM)                  | Codex     | Audit-spor for snapshots-cleanup = migration-fil + commit-hash + NOTICE-counts. Risiko-tabel og Konsistens-tjek opdateret med "audit-exempt post-R3"-nuance. | ✓ Adresseret    |
| Valg 2 klassificeret "A" men implementerer "D (andet)" (MELLEM)                 | Claude.ai | Valg 2 omdøbt til "D (andet, DISABLE TRIGGER-variant)". Eksplicit Mathias-godkendelse-forudsætning angivet. Argument D over A/B/C eksplicit.                 | ✓ Adresseret    |
| pay_periods → IMMUTABLE_TABLES_REQUIRE_TRUNCATE_BLOCK er scope-glid (KOSMETISK) | Claude.ai | Markeret som "scope-bonus" i scope-sektion + Valg 3                                                                                                          | ✓ Adresseret    |
| Afdæknings-filer på main = scope-rydning (KOSMETISK)                            | Claude.ai | Markeret som "scope-bonus" i scope-sektion + Oprydnings-strategi                                                                                             | ✓ Adresseret    |

---

## Nye fund i V2 — ingen reelle

Code har selv flagget en åben afklaring til Mathias om G017 candidate_run-cluster-tolkning. Det er ikke et plan-fund — det er korrekt anvendelse af krav-dokument-disciplin (flag åbent i stedet for at antage). Tolkning (b) — G017-cluster behandles atomically som test-artefakt — er konsistent med:

- `docs/teknisk/teknisk-gaeld.md` G017-entry: _"test-artefakter i prod-DB"_
- FK-graf: candidate_run `724c73cb` er FK-linked til G017 pay_period; sletning af G017 pay_period kræver enten første sletning af 724c73cb eller bevarelse af begge.
- Description på G017's tilknyttede salary_correction (`'smoke test'`) understøtter test-kategori for hele clusteret.

Min anbefaling til Mathias: bekræft tolkning (b). G017-cluster er test-artefakt. Krav-dok-tabellens "2 reelle candidate_runs" var faktuelt forkert (kun 1 reel: e8070819 paired med f4c86616 reelle pay_period). Code's V2-plan håndterer det atomically.

---

## Akkord-note om krav-dok-data

Krav-dok-tabellen (`H024-krav-og-data.md:43-45`) var baseret på Code's afdæknings-rapport som kategoriserede 2 hash-baserede candidate_runs som "Reelle hash-checksums". FK-link mellem 724c73cb og G017 pay_period blev først opdaget under V2-plan-arbejdet.

Det er disciplin-læring, ikke plan-fejl: afdæknings-rapporter bør i fremtidige pakker krydstjekke FK-grafer mellem clean-target tabeller for at fange cluster-konsistens. Forslag til G-nummer-kandidat: "Afdæknings-rapport-skabelon udvides med FK-graf-tjek". Ikke H024-scope.

---

## Konsistens-tjek mod krav-dok

| Krav-dok-element                        | V2-status                                                                                      |
| --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Formål                                  | Ordret bevaret                                                                                 |
| Scope (8 punkter)                       | Alle dækket                                                                                    |
| Mathias' 6 afgørelser                   | Alle implementeret 1:1                                                                         |
| Tekniske valg 1 (test-cleanup-tilgang)  | A (transaction-rollback) — argumenteret                                                        |
| Tekniske valg 2 (cleanup-vej)           | D (andet, DISABLE TRIGGER) — afventer Mathias-godkendelse                                      |
| Tekniske valg 3 (fitness-check)         | Mønster A (regex) — argumenteret, falsk-negativ-afgrænsning dokumenteret som G-nummer-kandidat |
| Tekniske valg 4 (Node minor-version)    | Hybrid (major i .nvmrc, exact i .tool-versions, range i engines) — argumenteret                |
| Tekniske valg 5 (commit-struktur)       | Fil-cluster-commits, @types/node samme commit som engines — argumenteret                       |
| Tekniske valg 6 (audit af øvrige tests) | Re-verifikation via fitness-check — argumenteret                                               |
| Strukturel observation om Lag E-binding | Reflekteret i "Strukturel beslutning"-sektion                                                  |
| Oprydnings-strategi                     | Fuldstændig (filer, dokumenter, reference-konsekvenser, ansvar)                                |

Ingen scope-glid ud over de markerede scope-bonuser.

---

## Vision-principper

- **Princip 5 (lifecycle for konfiguration):** Bevaret. Lifecycle-trigger på anonymization_strategies bevares; cleanup respekterer pattern via DISABLE TRIGGER.
- **Princip 6 (audit på alt der ændrer data):** Bevaret med ærlig nuance. Audit-virkelighed for commission_snapshots (audit-exempt post-R3) anerkendt; alternativt audit-spor for snapshots-cleanup dokumenteret.
- **Princip 9 (status-modeller bevarer historik):** Bevaret pragmatisk. DISABLE TRIGGER er one-shot pre-cutover; fitness-check sikrer fremtidig tx-rollback-disciplin. Pattern etableres IKKE som vedvarende.
- **"Greenfield ikke 1.0-antimønstre":** Styrket. H022.1 random-offset rulles tilbage; tx-rollback + fitness-check er arkitektur-fix.

---

## Konklusion

**Plan-status: APPROVAL**

V2 adresserer alle V1-fund konkret og teknisk solidt. Ingen nye plan-fund. Code's åbne afklaring til Mathias (G017 candidate_run-cluster-tolkning) er korrekt anvendelse af krav-dokument-disciplin, ikke et plan-svaghed.

**Build-forudsætninger (Code har eksplicit angivet):**

1. Mathias-godkendelse på DISABLE TRIGGER-pattern (Valg 2 — D) som one-shot pre-cutover-mekanisme.
2. Mathias-bekræftelse på G017-cluster-tolkning (b): G017-cluster behandles atomically som test-artefakt.

Begge er strategiske afgørelser Mathias skal tage før build starter. Hvis Mathias vælger anden tolkning af G017: V3-justering. Hvis Mathias afviser DISABLE TRIGGER: Code skifter til A eller B i V3.

Plan er klar til Codex-runde 2 + Mathias-godkendelse af build-forudsætninger.
