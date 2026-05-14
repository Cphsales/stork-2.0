# Migration: employees fra Stork 1.0 til 2.0

Leverance fra trin 2 (§4 trin 5 i master-plan).

Master-plan §0.5 (rettelse 20): **direkte udtræk + upload**, ikke ETL/sync-job/dobbelt-skriv.

## Filer

| Fil               | Database              | Formål                                                         |
| ----------------- | --------------------- | -------------------------------------------------------------- |
| `1_discovery.sql` | Stork 1.0 (read-only) | Rapport over format-anomalier, dubletter, identitets-spredning |
| `2_extract.sql`   | Stork 1.0 (read-only) | CSV-export der matcher core_identity.employees-strukturen      |
| `3_upload.sql`    | Stork 2.0 (admin)     | Loader CSV til staging og upserter til employees               |

## Rækkefølge

1. **Discovery** — kør `1_discovery.sql` mod 1.0; gennemgå rapport; ret i 1.0 eller markér håndtering i `2_extract.sql`'s normaliserings-blok.
2. **Extract** — kør `2_extract.sql` mod 1.0; CSV lander i `/tmp/stork_1_employees.csv`.
3. **Upload** — kopiér CSV til 2.0-miljø; kør `3_upload.sql` som postgres/admin.

## Audit-spor

`3_upload.sql` sætter `source_type='migration'` + `change_reason='legacy_import_t0: employees fra Stork 1.0'`. Hver upsertet medarbejder fanges via universel `stork_audit`-trigger.

## Forudsætninger

- 1.0's faktiske tabel- og kolonne-navne erstattes hvor markeret med `TODO` i `1_discovery.sql` og `2_extract.sql`.
- 2.0 har et `core_identity.roles`-row med navn `sælger` (oprettes automatisk af `3_upload.sql` hvis ikke).
- mg@ + km@ admin-mapping fra trin 1 (bootstrap) bevares uændret — `3_upload.sql` filtrerer disse fra import.

## Forventede risici (master-plan §0.5)

- **Format-inkonsistenser** (telefon, email-casing) håndteres inline i extract-SQL.
- **Dubletter** afsløres i discovery; resolution sker manuelt før extract.
- **Identitets-spredning** (1.0 har 3 parallelle identitets-strukturer) håndteres i trin 15 (identitets-master).
- **Auth-mapping** sker som best-effort: hvis 1.0's `auth_user_id` matcher en `auth.users`-row i 2.0, kobles; ellers NULL og fyldes når Microsoft Entra ID konfigureres i lag F.
