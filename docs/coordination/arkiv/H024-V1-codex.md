# H024 Plan V1 - Codex review

**Review-type:** Plan V1
**Resultat:** FEEDBACK
**Runde:** 1
**Branch:** `claude/H024-plan`
**Notification-commit:** `6ff77a2cbb950753eae90a0990145a99cfec4c45`

Note: Lokal `git pull` kunne ikke gennemfoeres fordi `.git/index.lock` ikke kan oprettes paa read-only filesystem. Local HEAD matcher dog notification-commit `6ff77a2`, og tracker-issue #12 blev laest via GitHub-connector.

Oprydnings-sektion-tjek: OK. Planen har konkret "Oprydnings- og opdaterings-strategi".

## Fund

### [KRITISK] Cleanup-migration mangler test-only guard for rows krav-data selv kalder "reelle"

Konkret afvigelse: `docs/coordination/H024-krav-og-data.md:43` angiver `core_money.pay_periods` som `31 (1 G017 + 1 tidlig + 3 reelle + 26 R3-smoke stale)`, og linje 45 angiver `pay_period_candidate_runs` som `28 (25 r3-smoke + 1 test-checksum + 2 reelle)`. Planen siger samtidig at migrationen rydder `387 stale rows` (`docs/coordination/H024-plan.md:90`) og viser DELETE baseret paa en eksplicit period-id-liste (`H024-plan.md:99`) uden at kraeve en precondition der beviser at alle target rows er test-artefakter.

Det er en produktion-risiko, fordi planen bevidst bypasser DELETE/immutability-triggers i cleanup-migrationen. Hvis de `3 reelle` pay_periods eller `2 reelle` candidate_runs er legitime data, kan Step 1 slette ikke-test rows og deres afhængige snapshots/corrections.

Anbefalet handling: V2-rettelse. Split cleanup-targets i klart test-markerede rows vs. `reelle` rows, og enten ekskluder de reelle rows eller dokumenter hvorfor de er test-artefakter. Tilfoej migrations-preconditions der raiser hvis en target row ikke matcher en tilladt testmarkoer, fx `r3-smoke`, `smoke test`, G017 fixed-date, test checksum, test-email eller anden konkret marker. Count-assertions skal vaere pr. marker/kategori, ikke kun total efter DELETE.

### [MELLEM] Planens audit-spor-antagelse for `commission_snapshots` er forkert

Konkret afvigelse: Planen siger at AFTER-audit-triggers fortsætter med at fyre paa DELETE, og naevner `pay_periods + commission_snapshots` som tabeller hvor audit-spor bevares (`docs/coordination/H024-plan.md:111`). Risiko-tabellen gentager at snapshot-tabeller har DELETE-audit for forensics (`H024-plan.md:255`). Men R3-migrationen dropper eksplicit `commission_snapshots_audit` (`supabase/migrations/20260515090000_r3_r4_commission_snapshots_update_flag.sql:45-47`), og R3-kommentaren siger at fravaeret er bevidst audit-exempt. Den oprindelige trigger i `20260514150001_t7_commission_snapshots.sql:50-52` var kun `after insert`, ikke DELETE.

Konsekvens: Cleanup af 286 `commission_snapshots` vil ikke skrive row-level audit_log, selv hvis kun immutability-triggeren disables. Planens vision-/audit-argument hviler derfor paa en falsk teknisk antagelse.

Anbefalet handling: V2-rettelse. Ret audit-afsnit og risiko-tabel, saa de siger at `commission_snapshots` er audit-exempt efter R3. Hvis cleanup skal have sporbarhed for snapshots, skal planen beskrive det som migration-fil, commit-hash, `NOTICE`/count-assertions eller anden eksplicit metadata - ikke som stork_audit-trigger-output.
