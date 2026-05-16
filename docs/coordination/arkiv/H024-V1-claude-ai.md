# H024 Plan V1 — Claude.ai review

**Review-type:** Plan V1
**Resultat:** FEEDBACK
**Runde:** 1
**Branch:** `claude/H024-plan`
**Reviewer-fokus:** Krav-konsistens, scope-glid, kvik-løsninger, vision-principper

---

## Oprydnings-sektion-tjek

OK. Planen har konkret "Oprydnings- og opdaterings-strategi" med fil-flytninger, dokument-opdateringer og reference-konsekvenser.

---

## Fund

### [MELLEM] Plan klassificerer cleanup-vej som "Valg 2 — A", men implementerer faktisk "D (andet)"

**Konkret afvigelse:** Krav-dok specificerer Valg 2's option A som: _"Engangs-migration der bypasser immutability-trigger med eksplicit reason-marker (`stork.allow\___cleanup='true'` pattern)"\* (`docs/coordination/H024-krav-og-data.md:128`). Den specifikke mekanisme — `stork.allow_\*\_cleanup`-session-var-pattern — er en del af option A's definition i krav-dok.

Planen erklærer "Valg 2 — A" (`docs/coordination/H024-plan.md:85`) men implementerer **DISABLE TRIGGER**-pattern, ikke session-var-pattern. Code afviser eksplicit session-var-vejen som "A1" (`H024-plan.md:111`): _"Alternativ A1 (tilføj `stork.allow_cleanup`-session-var som permanent exception til triggers): bygger permanent mekanisme for one-shot job. Afvist."_

Funktionelt er Code's valg dermed option **D ("andet")**, ikke A. Code's argument mod session-var er valid, men nomenklatur er misvisende — det skjuler at plan afviger fra krav-dok's specifikke wording.

**Konsekvens:** Mathias godkender plan baseret på antagelsen "Code valgte A". Han ser ikke at A's specificerede mekanisme (session-var) blev afvist til fordel for DISABLE TRIGGER. Det er afvigelse fra krav-dok-kontrakt.

**Princip-relateret bekymring:** DISABLE TRIGGER på immutability-triggers etablerer pattern — selv som one-shot. Master-plan §1.4 skitserer GDPR-retroactive-vej som _eneste_ exception-vej til audit_log-immutability, med audit-spor garanteret via dedikeret RPC. DISABLE TRIGGER pattern omgår denne arkitektur. For one-shot pre-cutover-cleanup er det pragmatisk, men det er reel afvigelse fra hvordan immutability-undtagelser er designet i master-plan.

**Anbefalet handling V2:**

1. Omdøb i plan: "Valg 2 — D (andet, DISABLE TRIGGER-variant)". Eksplicit anerkend at det ikke er option A som krav-dok specificerede.
2. Tilføj kort sub-sektion: "Hvorfor D over A, B, C" — Code's argumentation mod session-var-pattern er allerede der; flyt den til toppen af valg-argumentationen og marker som D-begrundelse.
3. Tilføj eksplicit note: "Mathias-godkendelse på D-pattern" som forudsætning for build. DISABLE TRIGGER bypass af immutability-trigger er fundament-relateret pattern; det skal være bevidst godkendt, ikke implicit antaget.

Alternativ: Plan justeres til faktisk option A (session-var-pattern). Mindre attraktivt fordi Code's argument om "permanent mekanisme for one-shot job" er valid.

---

### [KOSMETISK] Bonus-tilføjelse til `IMMUTABLE_TABLES_REQUIRE_TRUNCATE_BLOCK`-liste ligger uden for krav-dok-scope

**Konkret afvigelse:** Plan Step 3 tilføjer `core_money.pay_periods` til eksisterende `IMMUTABLE_TABLES_REQUIRE_TRUNCATE_BLOCK`-fitness-check (`H024-plan.md:170`). Det er Codex's sidefund #3 fra afdækningen — ikke i krav-dok-scope.

**Konsekvens:** Lavt-impact scope-glid. 1 entry til eksisterende liste, ingen ny mekanisme, lav risiko. Men det er strengt taget ikke pakke-formålet.

**Anbefalet handling V2:** Acceptabelt at bevare i pakken som "bonus", men flag eksplicit at det er scope-udvidelse ud over krav-dok. Alternativ: split ud som mikro-G-pakke senere. Min anbefaling: bevar i H024 — det er trivielt og beslægtet med formålet.

---

### [KOSMETISK] Afdæknings-filer bringes på main som del af build-PR

**Konkret afvigelse:** Plan's Oprydnings-strategi noterer at afdæknings-filerne (`g043-g044-data-code-2026-05-16.md`, `g043-g044-data-codex-2026-05-16.md`) bringes på main som del af build-PR (`H024-plan.md:271-273`).

**Konsekvens:** Krav-dok refererer filerne som autoritativt data-grundlag uden at specificere om de er på main. Plan adresserer inkonsistensen ærligt. Lavt-impact.

**Anbefalet handling V2:** Ingen. Acceptabelt. Det er rydning af et hul krav-dok efterlod.

---

## Sammenhæng med Codex's fund

Codex har leveret FEEDBACK med [KRITISK] + [MELLEM] fund relateret til samme cleanup-migration:

- **Codex KRITISK:** Cleanup-migration mangler test-only guard. 3 reelle pay_periods + 2 reelle candidate_runs kunne ryddes uden præcondition-tjek.
- **Codex MELLEM:** Audit-spor-antagelse for `commission_snapshots` er teknisk forkert (R3 droppede `commission_snapshots_audit`-trigger).

**Krav-dok-perspektiv på Codex's KRITISK:** Krav-dok lister i tabellen (`H024-krav-og-data.md:43`) eksplicit "3 reelle" pay_periods og "2 reelle" candidate_runs som SKAL bevares. Hvis plan rydder dem, bryder det krav-dok 1:1. Codex's KRITISK er også krav-brud, ikke kun produktion-risiko. V2 skal explicit ekskludere disse 5 reelle rows.

**Krav-dok-perspektiv på Codex's MELLEM:** Plan's audit-argument hviler på teknisk forkert antagelse. Det undergraver vision-princip 6 (audit på alt der ændrer data) — hvis snapshots ryddes uden audit-spor, er der ingen forensics-mulighed. V2 skal anerkende at commission_snapshots-cleanup mangler trigger-baseret audit-spor og dokumentere alternativ (migration-fil + commit-hash + NOTICE-counts som eneste audit-spor).

---

## Konklusion

**Plan-status: FEEDBACK**

3 fund:

- 1 × MELLEM (krav-afvigelse på Valg 2 A→D klassifikation + princip-bekymring)
- 2 × KOSMETISK (scope-udvidelser, acceptable)

Plus akkord-noter på Codex's KRITISK + MELLEM fund (samme cleanup-migration, krav-dok-perspektiv styrker Codex's anbefalinger).

**Anbefaling til Code (V2):**

1. **Fix Codex's KRITISK først.** Cleanup-migration skal have eksplicit test-only-guard. 5 reelle rows ekskluderes. Precondition-assertions pr. marker/kategori. Det er krav-brud, ikke kun teknisk risiko.
2. **Fix Codex's MELLEM.** Audit-argument korrigeres for commission_snapshots-cleanup. Plan-tekst beskriver alternativt audit-spor (migration-fil + commit-hash + NOTICE).
3. **Fix mit MELLEM.** Omdøb cleanup-vejen til "Valg 2 — D (andet)", begrund D over A/B/C, og flag Mathias-godkendelse på DISABLE TRIGGER-pattern som forudsætning.
4. **Bevar mine KOSMETISKE.** Pay_periods TRUNCATE-tilføjelse og afdæknings-fil-import er acceptable. Marker dem dog eksplicit som bonus/scope-rydning, ikke som del af krav-dok-leverancer.

V2 bør være tilstrækkeligt — alle fund er konkrete og handlings-orienterede.
