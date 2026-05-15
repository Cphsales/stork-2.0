# R-runde-2 V2-recon-rapport

**Kørt:** 2026-05-15
**Mål:** Producér autoritative inventories for R7a (regprocedure::text-bug) + R7d (is_active-readers uden status='active') via live DB introspection.
**Kilde:** `pg_proc` + `pg_namespace` + `cron.job` på Supabase project `imtxvrymaqbgcvsarlib`.

---

## V2.1 — regprocedure::text-pattern inventory

**Query (pg_proc-funktioner):**

```sql
select n.nspname || '.' || p.proname as fn,
       pg_get_function_arguments(p.oid) as args
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('core_identity','core_compliance','core_money','core_time')
  and p.prokind = 'f'
  and pg_get_functiondef(p.oid) ~ '(v_proc::text|::regprocedure[^,]*::text)';
```

**Resultat (3 funktioner):**

| Funktion                                  | Args                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `core_compliance.anonymize_generic_apply` | `p_entity_type text, p_entity_id uuid, p_change_reason text`             |
| `core_compliance.break_glass_execute`     | `p_request_id uuid`                                                      |
| `core_compliance.replay_anonymization`    | `p_entity_type text DEFAULT NULL::text, p_dry_run boolean DEFAULT false` |

**Query (cron.job-bodies):**

```sql
select jobid, jobname from cron.job
where command ~ '(v_proc::text|::regprocedure[^,]*::text)';
```

**Resultat (1 cron-body):**

| jobid | jobname                   |
| ----- | ------------------------- |
| 10    | `retention_cleanup_daily` |

**V2.1 sammenfatning:** 3 pg_proc-funktioner + 1 cron-body = **4 affected sites**. Matcher plan v2 Sektion 4.3 forventning.

---

## V2.2 — is_active=true reader-pattern inventory

**Query (pg_proc-funktioner):**

```sql
select n.nspname || '.' || p.proname as fn,
       pg_get_function_arguments(p.oid) as args,
       case when pg_get_functiondef(p.oid) ~* 'status\s*=\s*''active'''
            then 'has status-check' else 'NO status-check' end as status_check
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('core_identity','core_compliance','core_money','core_time')
  and p.prokind = 'f'
  and pg_get_functiondef(p.oid) ~* '(?:where|and)\s+[\w\.]*is_active\s*=\s*true';
```

**Resultat (6 funktioner — 1 allerede compliant, 5 skal fixes):**

| Funktion                                           | Status-check         | Skal fixes?                 |
| -------------------------------------------------- | -------------------- | --------------------------- |
| `core_compliance.anonymize_generic_apply`          | **has status-check** | Nej (P2 har allerede fixet) |
| `core_compliance.break_glass_execute`              | NO status-check      | **Ja**                      |
| `core_compliance.break_glass_request`              | NO status-check      | **Ja**                      |
| `core_compliance.replay_anonymization`             | NO status-check      | **Ja**                      |
| `core_compliance.verify_anonymization_consistency` | NO status-check      | **Ja**                      |
| `core_identity.anonymize_employee_internal`        | NO status-check      | **Ja**                      |

**Query (cron.job-bodies):**

```sql
select jobid, jobname from cron.job
where command ~* '(?:where|and)\s+[\w\.]*is_active\s*=\s*true';
```

**Resultat (1 cron-body):**

| jobid | jobname                   | Status-check    |
| ----- | ------------------------- | --------------- |
| 10    | `retention_cleanup_daily` | NO status-check |

**V2.2 sammenfatning:** 5 pg_proc-funktioner skal fixes + 1 cron-body = **6 affected sites**. Matcher plan v2 Sektion 4.6 Del B forventning.

---

## Kombineret inventory for R7a + R7d

| Site                                               | R7a (regprocedure fix)      | R7d (is_active+status fix) |
| -------------------------------------------------- | --------------------------- | -------------------------- |
| `core_compliance.anonymize_generic_apply`          | ✓                           | — (allerede compliant)     |
| `core_compliance.break_glass_execute`              | ✓                           | ✓                          |
| `core_compliance.break_glass_request`              | — (ingen regprocedure-brug) | ✓                          |
| `core_compliance.replay_anonymization`             | ✓                           | ✓                          |
| `core_compliance.verify_anonymization_consistency` | —                           | ✓ (også R7c permission)    |
| `core_identity.anonymize_employee_internal`        | —                           | ✓                          |
| `cron.job` jobid=10 `retention_cleanup_daily`      | ✓                           | ✓                          |

**Sites med BÅDE R7a + R7d-ændringer:** 3 (break_glass_execute, replay_anonymization, retention_cleanup_daily cron-body).

For disse 3 sites: ifølge **G036 Option A** (Mathias-godkendt) skal R7a + R7d-ændringer kombineres i samme migration-statement, ikke separate. For cron-body specifikt: ét `cron.unschedule` + ét `cron.schedule` med fuldt opdateret body.

---

## Hvad V2-recon IKKE dækker

Per plan v2 + G-numre dokumentation:

- **G034:** Scanner matcher kun literal `is_active = true`. Semantisk ækvivalente former (`IS TRUE`, `coalesce(...) = true`) er ikke fanget. Aktuelt inventory antages komplet — fremtidig fitness-check (G034) skal udvide.
- **G033:** Ingen fitness-check for regprocedure-regressioner efter R-runde-2. Bygges separat.
- **V1 PostgREST-test:** Afventer Mathias HTTP-verifikation (anon + authenticated). Springes over i R7a-R7d (ikke blokerende).

---

## Konklusion

Recon matcher plan v2 forventning. **Ingen flere stier opdaget end planlagt.** R7a-R7d kan starte uden plan-opdatering.

**Næste step:** R7a (regprocedure callable fix). Per G036 Option A: R7a + R7d's cron-body-ændringer kombineres i ét cron.schedule-kald for `retention_cleanup_daily`. Implementations-detalje: R7a fixer pg_proc-funktioner alene; R7a's cron-body-fix inkluderer status='active' fra start (foregriber R7d).
