# recon — lokations-skabelon

Status: konsolideret · bundle: 79a30c922eb93bd8ec72750e6733c8a63f991f42 · anker: masterplan §4 trin 10b / §1.12 (launch/launch.json)
Aktører (3-blind): code · codex · claude-ai · pakke-flade: 173 punkter (flade_filter i bundlet)
Aftager: KRAV-dokken (Fase 2) — hvert fund er disposition-klart (behandlet/udskudt/ikke-relevant).
Mutation-/test-dybde-materiale: se recon/recon-2-bilag.md (aftager: recon-2/plan, Fase 3).

## Bøtte 1 — nuværende kode ("x er bygget sådan — korrekt?")

- **config:supabase/config.toml** (code · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  Lokal Supabase-stackens konfiguration: api.schemas = [public, graphql_public] LOKALT — mens den LIVE eksponerede API-flade pr. scripts/types-gen.sh er public+core_identity+core_compliance+core_money (holdes synkron med Dashboard). max_rows=1000 begrænser payloads. Lokations-read-RPC'er skal ligge i et eksponeret schema (core_identity) for at være REST-kaldbare; fitness postgrest-t9-schema-exposure verificerer live-eksponering + schema-cache via OpenAPI-spec.
  - AFVISER: RPC i ikke-eksponeret schema → 404/406 via PostgREST
  - AFVISER: >1000 rækker i ét svar → afskåret ved max_rows
  _evidens:_ supabase/config.toml:6-20 @ 011818baf197
- **config:supabase/config.toml** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: eksponerer kun public og graphql_public gennem lokal Supabase API og holder core_* som interne schemas bag RPC/wrapper-mønsteret. AFVISER: direkte PostgREST-flade til core_identity/core_compliance/core_money uden eksplicit public wrapper eller config-ændring.
  - AFVISER: Direkte REST-kald mod en ny core_identity.locations-tabel er ikke en gyldig adgangsvej i nuværende config.
  - AFVISER: At tilføje core_identity til api.schemas ville ændre sikkerhedsmodellen for alle core-tabeller.
  _evidens:_ supabase/config.toml:7-18 @ 011818baf197
- **migration:supabase/migrations/20260514120000_t1_drop_public.sql** (code · skabelon-genbrug)
  Dropper ALLE 17 fase-0-tabeller i public CASCADE, unscheduler alle cron-jobs og dropper alle public-funktioner. Konsekvens for recon: samtlige public.*-punkter i den mekaniske flade er død historik — sluttilstanden har ingen stork-objekter i public (håndhævet live af fitness-checket schema-ownership). Lokations-pakken bygger derfor udelukkende i core_identity (+ registreringer i core_compliance).
  - AFVISER: Enhver ny stork-tabel oprettet i public afvises af fitness schema-ownership (live pg_catalog-query, fail-closed i CI)
  _evidens:_ supabase/migrations/20260514120000_t1_drop_public.sql:20-92 @ 2455be659e4d
- **migration:supabase/migrations/20260514120001_t1_schemas_and_defaults.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Opretter core_compliance/core_identity/core_money + default-privilegie-skabelonen alle nye lokations-tabeller arver: ALTER DEFAULT PRIVILEGES REVOKE ALL på tabeller for public/authenticated/anon/service_role (ny tabel = 0 app-rettigheder indtil eksplicit GRANT+policy) og GRANT EXECUTE på funktioner til authenticated (nye RPC'er er default-kaldbare — skal eksplicit revokes hvor upassende). Statement-timeout: authenticated 30s, anon 10s. core_identity-schemaets comment nævner eksplicit 'lokationer' som hjemhørende dér.
  - AFVISER: Direkte INSERT/UPDATE på en ny core_identity-tabel fra authenticated uden eksplicit GRANT → permission denied for table (42501) FØR nogen RLS-policy evalueres
  - AFVISER: RPC-eksekvering der overstiger 30s som authenticated → statement timeout
  _evidens:_ supabase/migrations/20260514120001_t1_schemas_and_defaults.sql:11-51 @ c6fb84d25dcc
- **migration:supabase/migrations/20260514120001_t1_schemas_and_defaults.sql** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: opretter core_compliance, core_identity og core_money som interne schemas og revoker default table-rettigheder fra app-roller; core_identity beskrives som aktør/masterdata inklusive hvem og hvor. AFVISER: implicit table CRUD for nye lokationsobjekter via default privileges.
  - AFVISER: Ny core_identity-lokationstabel arver ikke app-write-rettigheder fra default privileges.
  - AFVISER: Anonyme/offentlige roller får ikke implicit core-table-adgang.
  _evidens:_ supabase/migrations/20260514120001_t1_schemas_and_defaults.sql:11-41 @ c6fb84d25dcc
- **migration:supabase/migrations/20260514120002_t1_helpers_stubs.sql** (code · skabelon-genbrug)
  Etablerer helper-KONTRAKTERNE current_employee_id() (uuid) og is_admin() (boolean): sql, STABLE, SECURITY INVOKER, set search_path=''. Stub-bodies (NULL/false) er senere redefineret (t1_bootstrap → q1 → t9_seed_owners), men form-kontrakten (invoker + tom search_path + grant til authenticated/anon/service_role) er mønstret enhver ny lokations-helper skal følge.
  - AFVISER: Uautentificeret kald → current_employee_id()=NULL, is_admin()=false (alle downstream-gates afviser derfra)
  _evidens:_ supabase/migrations/20260514120002_t1_helpers_stubs.sql:15-51 @ 1ec265cce080
- **migration:supabase/migrations/20260514120003_t1_audit_partitioned.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Audit-fundamentet lokations-tabellernes triggere skriver til: core_compliance.audit_log PARTITIONED BY RANGE(occurred_at), månedlige partitioner + default; operation CHECK IN (INSERT/UPDATE/DELETE); source_type CHECK IN (manual/cron/webhook/trigger_cascade/service_role/unknown/migration); change_reason NOT NULL + trim>0. stork_audit() (SECDEF trigger-fn): source_type-detektion i prioritet session-var → pg_trigger_depth()>1 → current_user service_role → auth.uid() → unknown; RAISER P0001 hvis stork.change_reason mangler for source_type udenfor {cron,trigger_cascade} (dér autogenereres 'auto: <op> on <tabel>'); record_id = (row->>'id')::uuid; old/new_values PII-filtreres via audit_filter_values; changed_columns beregnes ved UPDATE. Immutability: BEFORE UPDATE/DELETE-trigger RAISER altid (eneste undtagelse stork.gdpr_retroactive='true'); BEFORE TRUNCATE blokeret via block_truncate_immutable() (genbruges af andre immutable tabeller). Læsning KUN via audit_log_read()-RPC; ensure_audit_partition() (service_role) holder partitioner 2 mdr frem.
  - AFVISER: UPDATE/DELETE på audit_log → P0001 'audit_log er immutable'
  - AFVISER: TRUNCATE → P0001
  - AFVISER: Mutation på audit-trigget tabel uden stork.change_reason (source_type=manual) → P0001 'stork.change_reason session-var er påkrævet'
  - AFVISER: source_type='batch' → CHECK-violation
  - AFVISER: change_reason='   ' → CHECK-violation (trim>0)
  _evidens:_ supabase/migrations/20260514120003_t1_audit_partitioned.sql:21-284 @ a7ec48847312
- **migration:supabase/migrations/20260514120003_t1_audit_partitioned.sql** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: opretter partitioneret audit_log, stork_audit-trigger og immutability-blokering; manuelle/ukendte writes kræver change_reason. AFVISER: lokationsmutation uden change_reason samt UPDATE/DELETE/TRUNCATE på audit_log uden GDPR-session-undtagelse.
  - AFVISER: Manual lokations-RPC uden stork.change_reason fejler i audit-triggeren.
  - AFVISER: Audit_log kan ikke ændres eller slettes af normal kode.
  _evidens:_ supabase/migrations/20260514120003_t1_audit_partitioned.sql:20-245 @ a7ec48847312
- **migration:supabase/migrations/20260514120004_t1_cron_skabelon.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Cron-skabelonen lokations-pakkens cooldown/udtræks-cron SKAL genbruge: core_compliance.cron_heartbeats (én row pr. job; ENABLE RLS, 0 policies, REVOKE all — læsning kun via RPC). cron_heartbeat_record() (SECDEF, service_role-only) upserter heartbeat og AFVISER status uden for {ok,failure,skipped,partial_failure} med 22023. cron_heartbeats_read()/cron_heartbeats_export() permission-gated (nuværende gates i q_audit_rpcs); healthcheck() rapporterer failing/stale jobs. Cron-body-mønsteret (ensure_audit_partition, '0 2 * * *'): set_config source_type='cron' + change_reason, arbejde, heartbeat 'ok', EXCEPTION-blok → heartbeat 'failure' + re-raise.
  - AFVISER: cron_heartbeat_record(..., 'running') → 22023 'invalid status'
  - AFVISER: Direkte SELECT på cron_heartbeats som authenticated → permission denied (revoked, 0 policies)
  - AFVISER: cron.schedule-body uden set_config('stork.change_reason',...) → fitness cron-change-reason rød
  _evidens:_ supabase/migrations/20260514120004_t1_cron_skabelon.sql:20-230 @ de1eb1b3f829
- **migration:supabase/migrations/20260514120004_t1_cron_skabelon.sql** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: etablerer cron_heartbeats, heartbeat RPC, admin healthcheck/export og audit af failure-heartbeats; cron jobs sætter source_type/change_reason. AFVISER: invalid heartbeat status og læsning/export uden admin.
  - AFVISER: cron_heartbeat_record afviser status udenfor ok/failure/skipped/partial_failure.
  - AFVISER: cron_heartbeats_read kræver is_admin.
  - AFVISER: healthcheck tæller stale/failure/audit partition issues.
  _evidens:_ supabase/migrations/20260514120004_t1_cron_skabelon.sql:20-230 @ de1eb1b3f829
- **migration:supabase/migrations/20260514120005_t1_data_field_definitions.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Klassifikations-registret hver ny lokations-kolonne SKAL have en række i: core_compliance.data_field_definitions pr. (table_schema,table_name,column_name) UNIQUE; category CHECK IN (operationel/konfiguration/master_data/audit/raw_payload); pii_level CHECK IN (none/indirect/direct); retention-validation-trigger håndhæver value-format pr. type (time_based kræver {max_days:int}; event_based kræver {event,days_after:int}; ...). RLS: SELECT åben for authenticated; INSERT/UPDATE/DELETE kræver session-var stork.allow_data_field_definitions_write='true' (sættes af upsert/delete-RPC'erne, som kræver change_reason). set_updated_at-triggermønster defineret her.
  - AFVISER: INSERT-klassifikation uden stork.allow_data_field_definitions_write → RLS-afvist
  - AFVISER: category='drift' → CHECK-violation
  - AFVISER: retention_type='time_based' med retention_value='{}' → 22023
  - AFVISER: data_field_definition_upsert uden change_reason → 22023
  _evidens:_ supabase/migrations/20260514120005_t1_data_field_definitions.sql:9-223 @ fb805b56b827
- **migration:supabase/migrations/20260514120005_t1_data_field_definitions.sql** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: etablerer data_field_definitions som klassifikationsregister med kategori/PII/retention-validering og admin-styrede upsert/delete RPCs. AFVISER: ugyldige retention-shapes, ugyldige pii_level/category samt klassifikationswrites uden admin og change_reason.
  - AFVISER: time_based uden retention_days afvises.
  - AFVISER: event_based uden trigger_event afvises.
  - AFVISER: Upsert/delete RPC uden is_admin eller change_reason afvises.
  _evidens:_ supabase/migrations/20260514120005_t1_data_field_definitions.sql:9-223 @ fb805b56b827
- **migration:supabase/migrations/20260514120006_t1_audit_filter_values.sql** (code · direkte)
  PII-filteret i audit-vejen (historisk body — NUVÆRENDE definition er t10_audit_filter_values): walker klassificerede kolonner for (schema,table); pii_level='direct' → 'sha256:'+hex(digest). LENIENT default: uklassificeret tabel/kolonne → WARNING og værdi bevares UÆNDRET (klartekst i audit!); strict kun via stork.audit_filter_strict='true'. Vigtig negativ-viden for lokations-pakken: mangler klassifikationen når audit-triggeren fyrer, hashes intet.
  - AFVISER: strict-mode + tabel uden klassifikation → P0001
  - AFVISER: LENIENT (default) + uklassificeret lokations-kolonne → INGEN afvisning — værdien skrives i klartekst med kun en WARNING
  _evidens:_ supabase/migrations/20260514120006_t1_audit_filter_values.sql:9-93 @ c17e447816c0
- **migration:supabase/migrations/20260514120007_t1_bootstrap_admins.sql** (code · skabelon-genbrug)
  Bootstrap af core_identity.employees (m. anonymized_at — anonymized_at-mønstret §1.12-lokationen kopierer), roles (name UNIQUE), role_page_permissions (partial UNIQUE (role_id,page_key,coalesce(tab_key,''))). FORCE RLS + REVOKE + select-policies; admin defineret som permission (system/manage/scope=all/can_edit) — ikke titel. Redefinerer current_employee_id/is_admin til aktiv-filtrerede lookups (senere generaliseret i q1). Audit + set_updated_at triggere attaches EFTER bootstrap-INSERTs.
  - AFVISER: current_employee_id() → NULL for anonymiseret/termineret medarbejder (efter q1: pr. employee_active_config)
  - AFVISER: is_admin() → false uden (system,manage,all,can_edit)-permission-række
  _evidens:_ supabase/migrations/20260514120007_t1_bootstrap_admins.sql:14-198 @ 669539b1e1dc
- **migration:supabase/migrations/20260514120008_t1_classify_trin_1.sql** (code · skabelon-genbrug)
  Det mekaniske klassifikations-mønster en ny pakke gentager: top-level SELECT set_config (allow_write + source_type='migration' + change_reason — top-level så fitness kan se dem gennem stripDollarQuoted) + én INSERT med ALLE nye kolonner. Migration-gate kører STRICT i CI (ci.yml:102) og udleder klassifikations-tuples ved at parse netop disse INSERTs.
  - AFVISER: Ny lokations-kolonne uden tilsvarende INSERT-tuple → migration-gate Phase 2 '::error Uklassificeret kolonne' → CI blokerer merge
  _evidens:_ supabase/migrations/20260514120008_t1_classify_trin_1.sql:1-92 @ f99690667c98
- **migration:supabase/migrations/20260514130000_t2_superadmin_floor.sql** (code · skabelon-genbrug)
  Singleton-konfigtabel-mønstret (id integer PRIMARY KEY CHECK (id=1)) + UI-redigerbar via session-var-policy (stork.allow_superadmin_settings_write) — den strukturelle skabelon for §1.12's cooldown-konfigtabel. Plus enforce_admin_floor(): AFTER-trigger på employees/role_page_permissions/roles der RAISER P0001 hvis aktive admins < superadmin_settings.min_admin_count (ruller transaktionen tilbage).
  - AFVISER: INSERT af row nr. 2 (id=2) → CHECK-violation
  - AFVISER: UPDATE uden session-var → RLS-afvist
  - AFVISER: Mutation der bringer aktive admins under floor → P0001 'superadmin-floor overtrådt'
  _evidens:_ supabase/migrations/20260514130000_t2_superadmin_floor.sql:14-106 @ d3f3e0e3b416
- **migration:supabase/migrations/20260514130001_t2_identity_rpcs.sql** (code · skabelon-genbrug)
  Ur-mønstret for write-veje under FORCE RLS: pr. tabel INSERT/UPDATE(/DELETE)-policies med current_setting('stork.allow_<tabel>_write', true)='true' + eksplicit DML-GRANT + SECDEF-RPC'er der sætter session-vars (allow-write + change_reason + source_type='manual') efter admin-/permission-check. Lokations-tabellens write-policies følger præcis denne form (eller den nyere t9_write_authorized-variant).
  - AFVISER: Direkte INSERT på core_identity.employees uden stork.allow_employees_write → policy-afvist (ingen row)
  - AFVISER: Efter 20260607110004: selv med session-var er authenticated-DML revoked — kun SECDEF-vejen virker
  _evidens:_ supabase/migrations/20260514130001_t2_identity_rpcs.sql:17-56 @ 47ad98b3072d
- **migration:supabase/migrations/20260514130002_t2_classify.sql** (code · skabelon-genbrug)
  Klassificerer t2's nye kolonner (superadmin_settings) efter t1_classify-mønstret — bekræfter at OGSÅ konfigtabeller (som cooldown-konfig) skal klassificeres.
  - AFVISER: Uklassificeret konfig-kolonne → migration-gate STRICT rød
  _evidens:_ supabase/migrations/20260514130002_t2_classify.sql:1-14 @ 1e0989af229b
- **migration:supabase/migrations/20260514140000_t6_anonymization_tables.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Anonymiserings-datamodellen en lokations-entity med anonymized_at skal registreres i: core_compliance.anonymization_mappings (field_strategies jsonb {kolonne:strategi}; jsonb_field_strategies for jsonb-bags; strategy_version; UNIQUE (entity_type,table_schema,table_name); UI-skrivning kun via stork.allow_anonymization_mappings_write) og core_compliance.anonymization_state (autoritativ 'hvad ER anonymiseret'-log: UNIQUE (entity_type,entity_id); immutability-trigger + TRUNCATE-blok; 0 policies + REVOKE all — INSERT kun fra SECDEF-RPC'er, læsning via anonymization_state_read). Løser backup-paradokset: state replayes mod restored data.
  - AFVISER: UPDATE/DELETE på anonymization_state → P0001 'anonymization_state er immutable'
  - AFVISER: INSERT mapping uden session-var → RLS-afvist
  - AFVISER: State-INSERT nr. 2 for samme (entity_type,entity_id) → unique violation
  _evidens:_ supabase/migrations/20260514140000_t6_anonymization_tables.sql:19-141 @ e6206176802a
- **migration:supabase/migrations/20260514140000_t6_anonymization_tables.sql** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: opretter anonymization_mappings og immutable anonymization_state med aktiv mapping, check-kolonne og audit. AFVISER: duplicate mappings/state, state uden reason og update/delete/truncate af state.
  - AFVISER: INSERT anonymization_state uden anonymization_reason afvises.
  - AFVISER: UPDATE/DELETE/TRUNCATE anonymization_state blokeres.
  - AFVISER: Aktiv mapping kan ikke skrives direkte uden allow-session-var.
  _evidens:_ supabase/migrations/20260514140000_t6_anonymization_tables.sql:17-129 @ e6206176802a
- **migration:supabase/migrations/20260514140001_t6_anonymization_rpcs.sql** (code · skabelon-genbrug)
  Legacy-strategivejen (delvist superseded): apply_field_strategy(strategy,value) mapper blank→'[anonymized]', hash→'sha256:'+hex, hash_email→'anon-'+hex16+'@anonymized.local' og returnerer NULL for UKENDT strategi — callers coalescer til original værdi, så en strategi-navnefejl er et SILENT no-op (afviser IKKE). v1-anonymize_employee/replay/verify er sidenhen erstattet af dispatcher+registry (c002/p1b), men apply_field_strategy kaldes stadig af _anonymize_employee_apply.
  - AFVISER: apply_field_strategy('tastefejl', v) → NULL — INGEN exception; feltet forbliver u-anonymiseret
  - AFVISER: anonymization_state_read uden permission (nu audit/anonymization) → 42501
  _evidens:_ supabase/migrations/20260514140001_t6_anonymization_rpcs.sql:22-44 @ d28286b9d32c
- **migration:supabase/migrations/20260514140002_t6_anonymization_crons.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  De to anonymiserings-crons: verify_anonymization_daily ('15 2 * * *') kalder verify_anonymization_consistency() og skriver heartbeat 'failure' ved inkonsistens (alarm-kanalen); retention_cleanup_daily ('30 2 * * *') v1 med hardkodet 1825d — senere generaliseret (c002) og sidst re-scheduleret i r7a (nuværende body kræver mapping status='active' AND is_active og læser days_after fra data_field_definitions).
  - AFVISER: State-row hvis master-row har anonymized_at=NULL → verify-cron heartbeat 'failure' med inconsistent-count
  _evidens:_ supabase/migrations/20260514140002_t6_anonymization_crons.sql:13-116 @ ac335748c8b6
- **migration:supabase/migrations/20260514140002_t6_anonymization_crons.sql** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: scheduler daglig anonymiseringsverifikation og retention cleanup med source_type=cron, change_reason og heartbeat. AFVISER: tavs lokationsretention/anonymiseringsbatch uden heartbeat og audit-kontekst.
  - AFVISER: Cron-mønsteret sætter stork.change_reason før verify/cleanup.
  - AFVISER: Failure registreres i cron_heartbeats med status failure.
  _evidens:_ supabase/migrations/20260514140002_t6_anonymization_crons.sql:13-115 @ ac335748c8b6
- **migration:supabase/migrations/20260514140003_t6_classify.sql** (code · skabelon-genbrug)
  Klassificerer anonymiserings-tabellernes kolonner (mønster-gentagelse).
  - AFVISER: Uklassificeret kolonne → migration-gate STRICT rød
  _evidens:_ supabase/migrations/20260514140003_t6_classify.sql:1-33 @ f1501ad84310
- **migration:supabase/migrations/20260514150006_t7b_cron_consecutive_failure.sql** (code · direkte)
  NUVÆRENDE cron_heartbeat_record()-body: vedligeholder consecutive_failure_count (ok→0; failure→+1; skipped/partial ændrer ikke) oven på run_count/failure_count/last_successful_run_at. healthcheck() rapporterer cron_jobs_consecutive_failures_critical (≥3 = alarmtærskel §1.6). Lokations-pakkens cron-heartbeats flyder gennem denne funktion.
  - AFVISER: status uden for whitelist → 22023 (uændret)
  - AFVISER: 3 failures i træk på lokations-cron → healthcheck critical-tæller > 0
  _evidens:_ supabase/migrations/20260514150006_t7b_cron_consecutive_failure.sql:10-111 @ 25805ccec7c8
- **migration:supabase/migrations/20260514160000_t1_inline_fix_audit_non_uuid_id.sql** (code · direkte)
  NUVÆRENDE stork_audit()-body: uuid-cast af id-feltet er try/catch'et — tabeller med non-uuid PK (fx singleton-konfig id=1, som cooldown-konfigtabellen kan blive) auditeres med record_id=NULL i stedet for at crashe; faktisk id-værdi bevares i old/new_values.
  - AFVISER: UPDATE på tabel med integer-PK → audit-row skrives med record_id=NULL (ingen exception)
  _evidens:_ supabase/migrations/20260514160000_t1_inline_fix_audit_non_uuid_id.sql:1-113 @ e3cfa9fefc63
- **migration:supabase/migrations/20260514170003_c001_retention_not_null.sql** (code · skabelon-genbrug)
  Indførte retention_type='permanent' + strammet retention_consistency (permanent→value NULL; øvrige→value NOT NULL) + NOT NULL. BEMÆRK: d1_d2 har siden fjernet 'legal' og gen-tilladt NULL — nuværende enum er {time_based,event_based,manual,permanent} og NULL er lovligt for forretningsdata. Validation-trigger-versionen her håndterer 'permanent'.
  - AFVISER: retention_type='permanent' med retention_value != NULL → check/22023
  - AFVISER: retention_type='legal' (efter d1_d2) → CHECK-violation
  _evidens:_ supabase/migrations/20260514170003_c001_retention_not_null.sql:34-209 @ 550119e661e6
- **migration:supabase/migrations/20260514170004_c002_c003_anonymization_dispatcher.sql** (code · direkte)
  DISPATCHER-mønstret (config-drevet runtime-dispatch — statisk traversal er blind her): anonymization_mappings.internal_rpc_anonymize/internal_rpc_apply er RPC-NAVNE SOM DATA, valideret ved ::regprocedure-cast og EXECUTE't dynamisk; anonymized_check_column (default 'anonymized_at') og retention_event_column styrer det dynamiske SQL. Generisk retention_cleanup_daily: for hver aktiv mapping med retention_event_column → max(days_after) fra data_field_definitions (event_based) → kandidat-query '<check_col> is null and <event_col> <= cutoff' → EXECUTE internal_rpc_anonymize. replay_anonymization: re-apply via SNAPSHOT (ikke live mapping), aldrig ny state-INSERT. En lokations-mapping registrerer sine egne internal_rpc-navne her — fladen udvides med DATA, ikke kode.
  - AFVISER: Mapping hvis internal_rpc_anonymize ikke findes som (uuid,text)-funktion → fanget undefined_function, tælles som cron-fejl
  - AFVISER: Tabel uden event_based-klassifikation → SILENT skip (continue) — retention kører aldrig for den (vigtig ikke-afvisning!)
  - AFVISER: Replay af entity hvis master-row mangler → tælles som fejl i rapport
  _evidens:_ supabase/migrations/20260514170004_c002_c003_anonymization_dispatcher.sql:33-358 @ c5b47ec57dc8
- **migration:supabase/migrations/20260514180000_g028_classify_anonymization_dispatcher_columns.sql** (code · skabelon-genbrug)
  Efter-klassificering af dispatcher-kolonnerne — lærestykke: ALTER TABLE ADD COLUMN kræver også klassifikations-rows, ellers fanger migration-gate STRICT det.
  - AFVISER: ALTER TABLE ... ADD COLUMN uden klassifikations-INSERT → migration-gate rød
  _evidens:_ supabase/migrations/20260514180000_g028_classify_anonymization_dispatcher_columns.sql:1-59 @ a683e2c67df1
- **migration:supabase/migrations/20260514180100_r1b_rename_admin_to_superadmin.sql** (code · skabelon-genbrug)
  Rollen hedder 'superadmin' (vision-princip 2: eneste hardkodede rolle). Alle seeds (q_seed, p1a, q1, t10, m1) slår rolle-id op via name='superadmin' — is_admin() kigger på permission-data, ikke navn.
  - AFVISER: Seed mod name='admin' → subselect giver NULL role_id → INSERT rammer FK/NOT NULL eller no-op'er — permissions lander ingen steder
  _evidens:_ supabase/migrations/20260514180100_r1b_rename_admin_to_superadmin.sql:1-44 @ 2761a565cc57
- **migration:supabase/migrations/20260514180200_h1_has_permission_helper.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  KONTRAKTEN has_permission(p_page_key, p_tab_key default null, p_can_edit default false) → boolean — gate-primitiven ALLE lokations-RPC'er og SELECT-policies skal kalde. Denne fil er den oprindelige legacy-model-body; NUVÆRENDE body er t9_seed_owners (grants-model med tab→page→area-arv + legacy-fallback). SECURITY INVOKER + STABLE + search_path=''.
  - AFVISER: Uautentificeret / inaktiv medarbejder → false
  - AFVISER: p_can_edit=true uden write-grant → false
  _evidens:_ supabase/migrations/20260514180200_h1_has_permission_helper.sql:32-61 @ 1cce28170a30
- **migration:supabase/migrations/20260514180200_h1_has_permission_helper.sql** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: definerer baseline has_permission som auth.uid -> active employee -> role_page_permissions med scope all og can_edit-krav når p_can_edit=true. AFVISER: adgang uden employee-match, uden permission-row eller uden can_edit ved write-path.
  - AFVISER: En bruger uden core_identity.employees.auth_user_id-match får false.
  - AFVISER: En row med can_edit=false accepteres ikke for lokations-write RPCs.
  _evidens:_ supabase/migrations/20260514180200_h1_has_permission_helper.sql:32-61 @ 1cce28170a30
- **migration:supabase/migrations/20260514180300_q1_employee_active_config.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  UI-konfigurerbar 'aktiv medarbejder'-definition — OG skabelonen for cooldown-konfig: singleton core_identity.employee_active_config (id smallint CHECK id=1; post_termination_grace_days >=0; treat_anonymized_as_active). is_active_employee_state(anonymized_at, termination_date) læser konfigen og bruges af current_employee_id/has_permission(legacy-gren)/is_admin/enforce_admin_floor → lokations-RPC'ernes adgangskæde afhænger transitivt af denne tabel. employee_active_config_update-RPC: has_permission('employee_active_config','manage',true) + change_reason + session-var.
  - AFVISER: employee_active_config_update med grace_days=-1 → 22023
  - AFVISER: uden permission → 42501
  - AFVISER: UPDATE uden stork.allow_employee_active_config_write → RLS-afvist
  - AFVISER: Termineret medarbejder uden for grace → alle has_permission-kald → false
  _evidens:_ supabase/migrations/20260514180300_q1_employee_active_config.sql:29-242 @ 776b884b0913
- **migration:supabase/migrations/20260514180300_q1_employee_active_config.sql** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: gør employee-aktivitet konfigurationsstyret og bruger samme aktive-medarbejderfilter i current_employee_id, has_permission og is_admin. AFVISER: lokationsadgang fra anonymiserede/terminerede brugere udenfor den gældende grace-konfiguration.
  - AFVISER: Terminering ældre end grace giver ingen current_employee_id og dermed ingen pending request.
  - AFVISER: employee_active_config_update uden permission, change_reason eller med negativ grace afvises.
  _evidens:_ supabase/migrations/20260514180300_q1_employee_active_config.sql:73-146 @ 776b884b0913
- **migration:supabase/migrations/20260514180400_d1b_is_permanent_allowed.sql** (code · direkte)
  is_permanent_allowed(schema,table,column) — IMMUTABLE hardkodet allowlist for retention_type='permanent'. Ændring kræver kode-commit (ny migration med CREATE OR REPLACE af hele VALUES-blokken — NUVÆRENDE version er t10_is_permanent_allowed_extend med 17 entries). Skal lokations-kolonner klassificeres 'permanent', SKAL allowlisten udvides først.
  - AFVISER: is_permanent_allowed('core_identity','locations',NULL) → false i nuværende version → d1c-trigger blokerer permanent-klassificering af lokations-kolonner
  _evidens:_ supabase/migrations/20260514180400_d1b_is_permanent_allowed.sql:15-55 @ f6d3104aba9b
- **migration:supabase/migrations/20260514180500_d1_d2_drop_legal_convert_rows.sql** (code · skabelon-genbrug)
  NUVÆRENDE retention-regime: 'legal' fjernet fra enum; NULL retention_type gen-tilladt som forretningsdata-default; 71 rækker konverteret. retention_consistency nu: permanent→NULL value; time/event/manual→NOT NULL value; NULL→NULL value.
  - AFVISER: retention_type='legal' → CHECK-violation
  - AFVISER: NULL retention_type + retention_value sat → CHECK-violation
  _evidens:_ supabase/migrations/20260514180500_d1_d2_drop_legal_convert_rows.sql:1-59 @ 5f93b405b918
- **migration:supabase/migrations/20260514180600_d1c_validate_permanent_classification.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  BEFORE INSERT/UPDATE-trigger på data_field_definitions: retention_type='permanent' uden for is_permanent_allowed-allowlisten → P0001 med hint om kode-review-vejen. Direkte constraint på lokations-pakkens klassifikations-migration.
  - AFVISER: INSERT ('core_identity','locations','id','...','permanent') før allowlist-udvidelse → P0001 'retention_type=permanent ikke tilladt'
  _evidens:_ supabase/migrations/20260514180600_d1c_validate_permanent_classification.sql:15-36 @ a0c4771d1b0a
- **migration:supabase/migrations/20260514180600_d1c_validate_permanent_classification.sql** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: trigger-validerer at retention_type=permanent kun bruges for allowlistede felter. AFVISER: ny permanent lokationsklassifikation uden eksplicit allowlist-review i migration.
  - AFVISER: core_identity.locations.* med permanent retention fejler hvis is_permanent_allowed ikke udvides.
  - AFVISER: Ikke-permanent rækker går udenom denne permanente allowlist.
  _evidens:_ supabase/migrations/20260514180600_d1c_validate_permanent_classification.sql:14-36 @ a0c4771d1b0a
- **migration:supabase/migrations/20260514190000_q_seed_permissions.sql** (code · skabelon-genbrug)
  Legacy-modellens permission-seed-mønster: INSERT i role_page_permissions for superadmin via name-lookup + ON CONFLICT DO NOTHING + top-level session-vars. (Grant-modellens pendant er t10_seed_permissions — den lokations-pakken skal kopiere.)
  - AFVISER: INSERT uden ON CONFLICT i bootstrap-tabel → fitness migration-on-conflict-discipline rød (role_page_permissions er BOOTSTRAP_CONFIG_TABLES)
  _evidens:_ supabase/migrations/20260514190000_q_seed_permissions.sql:17-53 @ 31a0041006dd
- **migration:supabase/migrations/20260514190100_q_audit_rpcs.sql** (code · direkte)
  NUVÆRENDE gates på audit-læsevejene (lokations-historik læses her): audit_log_read → has_permission('audit','log',false); anonymization_state_read → ('audit','anonymization',false); cron_heartbeats_read → ('audit','cron',false); cron_heartbeats_export → ('audit','cron',true).
  - AFVISER: Kald uden audit.log-permission → 42501 'audit_log_read kraever permission audit.log'
  _evidens:_ supabase/migrations/20260514190100_q_audit_rpcs.sql:13-109 @ cfd502ed3be7
- **migration:supabase/migrations/20260514190200_q_class_anon_rpcs.sql** (code · skabelon-genbrug)
  Permission-konvertering af klassifikations-RPC'erne: data_field_definition_upsert/delete → has_permission('classification','manage',true); replay_anonymization → ('anonymization','replay',true). Runtime-vejen til at klassificere lokations-kolonner fra UI.
  - AFVISER: upsert uden classification.manage.can_edit → 42501
  _evidens:_ supabase/migrations/20260514190200_q_class_anon_rpcs.sql:1-30 @ b9f976338ddd
- **migration:supabase/migrations/20260515110100_p1a_anonymization_strategies.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Strategi-REGISTRY'et (endnu en config-drevet dispatch-flade): anonymization_strategies m. strategy_name UNIQUE → function_schema/function_name (funktion SOM DATA). Validation-trigger AFVISER: schema != core_compliance; navn uden prefix '_anon_strategy_'; funktion findes ikke som (text,text); returtype != text; volatilitet ikke i {IMMUTABLE,STABLE}. Lifecycle-trigger: INSERT kun draft (eller approved i migration-kontekst); →active KUN via activate-RPC-session-var (stork.allow_strategy_activate); active er terminal; regression forbudt. DELETE kun draft. Strategi-funktioner _anon_strategy_blank/hash_email (+hash i fix). anonymization_strategy_activate kræver has_permission('anonymization_strategies','activate',true) + status='approved'. Udvidede også is_permanent_allowed (v2).
  - AFVISER: INSERT strategy m. function_name='min_fn' → P0001 (prefix-krav)
  - AFVISER: UPDATE status draft→active direkte → 42501
  - AFVISER: DELETE på approved-strategy → P0001
  - AFVISER: INSERT status='approved' uden source_type='migration' → P0001
  - AFVISER: activate på draft → P0001 'kan kun aktivere approved'
  _evidens:_ supabase/migrations/20260515110100_p1a_anonymization_strategies.sql:20-343 @ d69ea57e1c45
- **migration:supabase/migrations/20260515110100_p1a_anonymization_strategies.sql** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: validerer anonymiseringsstrategier på schema, navn, signatur, returtype, volatility og lifecycle. AFVISER: vilkårlige functions, aktiv status uden activate-RPC og sletning af ikke-draft strategier.
  - AFVISER: function_schema udenfor core_compliance afvises.
  - AFVISER: function_name uden _anon_strategy_-prefix afvises.
  - AFVISER: active uden activated_at/by og session-var afvises.
  _evidens:_ supabase/migrations/20260515110100_p1a_anonymization_strategies.sql:20-328 @ d69ea57e1c45
- **migration:supabase/migrations/20260515110150_p1a_fix_lifecycle_coalesce.sql** (code · skabelon-genbrug)
  Nil-safety-lektionen for session-var-gates: current_setting(x,true) er NULL når var ikke er sat, og NULL<>'true' er NULL (ikke true) — betingelsen skal coalesces. Enhver ny lokations-session-var-gate skal skrives coalesce-sikkert (eller som ligheds-test = 'true', der er NULL-sikker).
  - AFVISER: Direkte UPDATE→active uden session-var → nu korrekt 42501 (før fixet slap den forbi til CHECK-constraint)
  _evidens:_ supabase/migrations/20260515110150_p1a_fix_lifecycle_coalesce.sql:1-42 @ 6775c82975f7
- **migration:supabase/migrations/20260515110200_p1b_anonymize_generic_apply.sql** (code · direkte)
  Generisk anonymisering (NUVÆRENDE body = r7h; algoritmen defineret her): (1) aktiv mapping for entity_type ellers P0002; (2) stale-detection — hver field_strategies-key skal matche en EKSISTERENDE kolonne klassificeret pii_level='direct' ellers P0001; (3) itererer over PII-ALLOWLISTEN (alle direct-kolonner via information_schema×data_field_definitions) — hver SKAL have en strategi ellers P0001 PII-coverage-fejl; (4) strategien skal være status='active'; (5) dynamisk UPDATE 'set col=strategy_fn(col,$1) ... where id=$2 AND <check_col> IS NULL returning id' — NOT FOUND → P0002 (findes ikke ELLER allerede anonymiseret); (6) state-INSERT m. snapshot. En lokations-anonymisering går præcis her igennem når mappingen er registreret.
  - AFVISER: direct-klassificeret lokations-kolonne uden strategi i mappingen → P0001 PII-coverage-fejl
  - AFVISER: field_strategies-key mod droppet/non-direct kolonne → P0001 stale
  - AFVISER: allerede-anonymiseret entity → P0002
  - AFVISER: 0 direct-kolonner → P0001 'kraever klassifikation foer anonymisering'
  _evidens:_ supabase/migrations/20260515110200_p1b_anonymize_generic_apply.sql:24-187 @ f953769574f0
- **migration:supabase/migrations/20260515110300_p1c_anonymize_employee_wrapper.sql** (code · skabelon-genbrug)
  Entity-wrapper-mønstret en fremtidig anonymize_location kopierer: has_permission('<entity>','anonymize',true) + null/blank-checks → deleger til anonymize_generic_apply('<entity>',id,reason) → returnér den opdaterede række.
  - AFVISER: Uden employees.anonymize.can_edit → 42501
  - AFVISER: reason blank → 22023
  _evidens:_ supabase/migrations/20260515110300_p1c_anonymize_employee_wrapper.sql:20-57 @ ca921ccbd402
- **migration:supabase/migrations/20260515110350_p1a_fix_strategy_completeness.sql** (code · skabelon-genbrug)
  Bootstrap-strategisættet komplet: blank ('[anonymized]'), hash, hash_email — alle seedet status='approved' (aktivering er bevidst et manuelt UI-pre-cutover-step). Lokations-mapping kan genbruge disse strateginavne.
  - AFVISER: generic_apply mod strategi med status='approved' (ikke 'active') → P0001 'strategy er ikke active'
  _evidens:_ supabase/migrations/20260515110350_p1a_fix_strategy_completeness.sql:1-60 @ 15557e9340a7
- **migration:supabase/migrations/20260515120000_p2_anonymization_mapping_lifecycle.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Mapping-lifecycle (samme disciplin som strategier) + UI-RPC'erne lokations-mappingen registreres igennem: anonymization_mapping_upsert (permission anonymization_mappings/manage; opretter draft m. is_active=false; UPDATE bevarer status/activated_*), _test_run (draft→tested; dry-run af stale+coverage+strategi-checks), _approve (tested→approved), _activate (approved→active via stork.allow_mapping_activate). Lifecycle-trigger: →active kun via RPC; active terminal; regression forbudt; INSERT approved kun i migration. DELETE kun draft.
  - AFVISER: activate på draft/tested → P0001
  - AFVISER: direkte UPDATE status→active → 42501
  - AFVISER: DELETE på approved mapping → P0001
  - AFVISER: upsert uden anonymized_check_column → 22023
  _evidens:_ supabase/migrations/20260515120000_p2_anonymization_mapping_lifecycle.sql:25-200 @ ec3d9a0bb5bb
- **migration:supabase/migrations/20260515120000_p2_anonymization_mapping_lifecycle.sql** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: indfører draft/test/approve/activate for anonymization_mappings og kræver direct-PII coverage samt aktive strategier før apply. AFVISER: stale keys, manglende strategi for direct PII, strategi uden approved/active status og direkte active-mapping.
  - AFVISER: test_run fejler hvis field_strategies indeholder nøgle uden matchende direct PII-kolonne.
  - AFVISER: activate kræver approved status og permission.
  - AFVISER: apply afviser mapping uden active/is_active.
  _evidens:_ supabase/migrations/20260515120000_p2_anonymization_mapping_lifecycle.sql:25-431 @ ec3d9a0bb5bb
- **migration:supabase/migrations/20260515130000_r7a_regprocedure_callable_fix.sql** (code · direkte)
  regprocedure-lektionen for al dynamisk dispatch: v_proc::text er SIGNATUREN ('fn(text,text)') og kan ikke kaldes — callable identifier skal slås op via pg_proc/quote_ident. Fixet i generic_apply, break_glass_execute, replay + NUVÆRENDE retention_cleanup_daily-cron-body (kræver nu også mapping status='active' AND is_active=true).
  - AFVISER: Mapping med status!='active' → retention-cron springer entiteten over (SILENT — ingen fejl)
  - AFVISER: internal_rpc der ikke findes → talt fejl i heartbeat-detaljer
  _evidens:_ supabase/migrations/20260515130000_r7a_regprocedure_callable_fix.sql:1-120 @ 6f0e1db3eca1
- **migration:supabase/migrations/20260515130100_r7b_has_permission_can_view_required.sql** (code · skabelon-genbrug)
  Historisk sikkerhedsfix på legacy-has_permission: can_view=true kræves ALTID (før kunne (can_view=false,can_edit=false)-rækker passere read-checks). Lektion for lokations-policies: read-gaten skal eksplicit kræve view-flaget — nuværende grants-model bruger can_access tilsvarende.
  - AFVISER: Permission-række (can_view=false) → has_permission(page,tab,false)=false
  _evidens:_ supabase/migrations/20260515130100_r7b_has_permission_can_view_required.sql:15-38 @ 8a353dd37fad
- **migration:supabase/migrations/20260515130200_r7c_verify_anonymization_consistency_permission.sql** (code · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  verify_anonymization_consistency har nu permission-gate has_permission('audit','verify_anonymization',false) MED cron-bypass (stork.source_type='cron' sat af cron-body springer checket over). Mønster for lokations-drift-checks der både skal kunne køres af UI og cron.
  - AFVISER: Authenticated uden audit.verify_anonymization → 42501 (medmindre source_type='cron')
  _evidens:_ supabase/migrations/20260515130200_r7c_verify_anonymization_consistency_permission.sql:1-30 @ e690c622182d
- **migration:supabase/migrations/20260515130200_r7c_verify_anonymization_consistency_permission.sql** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: verify_anonymization_consistency kræver audit/verify_anonymization view-permission for manuel brug og tillader cron-undtagelse via stork.source_type. AFVISER: ikke-autoriseret manuel konsistensscan af lokationsanonymisering.
  - AFVISER: Ikke-cron caller uden audit/verify_anonymization afvises.
  - AFVISER: Entity_type uden aktiv mapping rapporteres som inconsistency.
  _evidens:_ supabase/migrations/20260515130200_r7c_verify_anonymization_consistency_permission.sql:19-78 @ e690c622182d
- **migration:supabase/migrations/20260515130300_r7d_is_active_status_alignment.sql** (code · skabelon-genbrug)
  Dual-column-disciplinen der CONSTRAINER lokations-status-designet (§1.12 status-livscyklus): tabeller med BÅDE is_active og status skal læses med status='active' AND is_active=true; backfill ryddede falsk-aktive rækker. Håndhæves fremadrettet af fitness legacy-is-active-readers (live pg_get_functiondef-scan): enhver NY funktion der filtrerer is_active=true uden status-check bliver violation medmindre allowlistet (tabeller med KUN is_active).
  - AFVISER: Ny lokations-læser med 'where is_active = true' uden status-check → fitness-violation (medmindre LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS-entry m. begrundelse)
  _evidens:_ supabase/migrations/20260515130300_r7d_is_active_status_alignment.sql:1-127 @ 97282fac582e
- **migration:supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  NUVÆRENDE anonymize_generic_apply-body: state-INSERT medtager table_schema/table_name fra mappingen (NOT NULL-kolonner). Al øvrig r7a/p2-logik bevaret.
  - AFVISER: Pre-fix ville state-INSERT fejle 23502 — nu skrives komplet state-række
  _evidens:_ supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql:1-30 @ 6083fecd79ff
- **migration:supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: final anonymize_generic_apply kræver aktiv mapping, change_reason, direct PII coverage og opdaterer anonymized_check_column før state insert. AFVISER: manglende/allerede anonymiseret entity, blank reason, ingen active mapping og tabeller uden direct PII.
  - AFVISER: p_change_reason blank afvises.
  - AFVISER: Ingen aktiv mapping for entity_type afvises.
  - AFVISER: UPDATE uden fundet row eller row allerede anonymiseret afvises.
  _evidens:_ supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql:22-127 @ 6083fecd79ff
- **migration:supabase/migrations/20260518000000_t9_pending_changes.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Fortrydelses-maskineriet: core_identity.pending_changes (status-livscyklus pending→approved→applied|undone m. CHECK-invarianter der binder statusfelter til tidsstempler; payload jsonb pr. change_type) + undo_settings (UI-konfig: undo_period_seconds 0..30 dage pr. change_type). RPC'er: pending_change_request er INTERN (revoked fra authenticated — kun SECDEF-wrappers kalder den; kræver aktiv employee); approve (self-approve forbudt medmindre admin; sætter undo_deadline=now()+konfig, default 24t); undo (kun approved + før deadline); pending_change_apply = CENTRAL APPLY-GATE (SECDEF): status='approved' AND undo_deadline<=now() AND effective_from<=current_date ellers 'not_yet_due' — dispatcher CASE på change_type (udvidet pr. pakke via CREATE OR REPLACE; ukendt → 42883). Cron pending_changes_apply_due (hvert minut) er kun selection-filter — gaten re-verificerer. Er skrivevejen for klient-placeringer (som lokations-pakken refererer).
  - AFVISER: direkte kald af pending_change_request som authenticated → permission denied (revoked)
  - AFVISER: approve af egen request som non-admin → 42501 self_approve_forbidden
  - AFVISER: undo efter deadline → 22023 undo_deadline_expired
  - AFVISER: apply af future-dated effective_from → 22023 not_yet_due
  - AFVISER: ukendt change_type → 42883
  _evidens:_ supabase/migrations/20260518000000_t9_pending_changes.sql:30-439 @ c3b2865c5b72
- **migration:supabase/migrations/20260518000000_t9_pending_changes.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: etablerer pending_changes, undo_settings, pending_change_request/apply og cron-apply med status-, due- og audit-kontekst. AFVISER: pending request uden current_employee_id, apply før undo_deadline/effective_from og ukendt change_type.
  - AFVISER: pending_change_request afviser unauthenticated/inactive employee.
  - AFVISER: pending_change_apply returnerer not_yet_due før undo_deadline eller effective_from.
  - AFVISER: Ukendt dispatcher-change_type afvises.
  _evidens:_ supabase/migrations/20260518000000_t9_pending_changes.sql:30-435 @ c3b2865c5b72
- **migration:supabase/migrations/20260518000001_t9_org_nodes.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Org-modellen lokations-placeringer refererer + CYCLE-CHECK-SKABELONEN for §1.12's parent_location_id: org_nodes identity-only + org_node_versions (effective_from/to; CHECK from<to; CHECK parent!=self; partial UNIQUE én åben version pr. node; EXCLUDE gist no-overlap pr. node). _org_node_cycle_check (BEFORE INSERT/UPDATE): traverserer parent-kæden i versions effektive på NEW.effective_from med besøgs-array + dybde-loft 100 → P0001 ved cyklus eller dybde>=100 — præcis den rekursions-mekanik lokations-tabellens selv-reference skal genbruge. Team-no-children-trigger. Apply-handlere upsert/deactivate (version-lukning + ny åben version).
  - AFVISER: version med parent_id=node_id → CHECK-violation
  - AFVISER: A→B→A parent-kæde → P0001 org_node_cycle_detected
  - AFVISER: overlappende versionsperioder → exclusion violation
  - AFVISER: 2. åbne version for samme node → unique violation
  - AFVISER: payload uden name/node_type/effective_from → 22023
  _evidens:_ supabase/migrations/20260518000001_t9_org_nodes.sql:20-399 @ 71cadac316a6
- **migration:supabase/migrations/20260518000001_t9_org_nodes.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: modellerer org_nodes/org_node_versions med department/team, effective intervals, no-overlap, no self-parent, cycle/depth check og team-children-regler. AFVISER: ugyldig node_type, overlappende versioner, cykler og team som parent for andre nodes.
  - AFVISER: node_type udenfor department/team afvises.
  - AFVISER: Overlappende version for samme node afvises.
  - AFVISER: Cycle/depth >=100 afvises.
  _evidens:_ supabase/migrations/20260518000001_t9_org_nodes.sql:23-188 @ 71cadac316a6
- **migration:supabase/migrations/20260518000002_t9_org_node_closure.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Closure-tabellen (ancestor,descendant,depth; self-ref depth=0) er CURRENT-STATE-DERIVED fra versions effektive i dag — aldrig future-dated; fuld-rebuild-trigger på hver versions-mutation (NUVÆRENDE rebuild-body = t9_seed_owners' CTE-fix). Bevidst audit-EXEMPT (AUDIT_EXEMPT_SNAPSHOT_TABLES i fitness — derived-table-kategorien). acl_subtree-helpers læser den → lokations-RPC'ers subtree-synlighed afhænger transitivt.
  - AFVISER: INSERT af (ancestor,descendant)-dublet → PK-violation
  - AFVISER: rebuild med cyklisk input begrænses af depth<100 i CTE'en
  _evidens:_ supabase/migrations/20260518000002_t9_org_node_closure.sql:13-113 @ 82d21194bff5
- **migration:supabase/migrations/20260518000002_t9_org_node_closure.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: vedligeholder derived current-state org_node_closure med self-depth og descendants til ACL. AFVISER: audit-trigger på derived closure og direkte forretningsmutation af closure.
  - AFVISER: Closure rebuild bruger kun versioner aktive på current_date.
  - AFVISER: Derived table er audit-exempt med kommentar og fitness-allowlist.
  _evidens:_ supabase/migrations/20260518000002_t9_org_node_closure.sql:14-112 @ 82d21194bff5
- **migration:supabase/migrations/20260518000003_t9_employee_node_placements.sql** (code · skabelon-genbrug)
  DET versionerede placement-mønster §1.12's klient-tilladelser (klient × lokation × from_date × to_date, versioneret) skal kopiere: effective_from/to; 'aktiv' = from<=d AND (to IS NULL OR to>d); partial UNIQUE (employee_id) WHERE effective_to IS NULL (én åben ad gangen); EXCLUDE gist no-overlap; FORCE RLS + select-policy; audit-trigger; apply-handlers lukker prior åben ved flyt.
  - AFVISER: 2. åbne placement for samme employee → unique violation
  - AFVISER: overlappende perioder → exclusion violation
  - AFVISER: effective_to<=effective_from → CHECK-violation
  _evidens:_ supabase/migrations/20260518000003_t9_employee_node_placements.sql:15-60 @ 179306497852
- **migration:supabase/migrations/20260518000004_t9_client_node_placements.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Klient-placeringstabellen pakken refererer (org/client_node_placements i bundlet): client_id (FK tilføjet i t10.7), node_id→org_nodes RESTRICT; versioneret som employee-varianten (partial UNIQUE åben pr. client + EXCLUDE no-overlap); BEFORE-trigger _client_placement_team_check afviser placering på ikke-team-knude (P0001); oprindelig select-policy is_admin() — NUVÆRENDE policy er t9_supplement (subtree-ACL). Apply-handlere place/close (nuværende bodies = t10.7b/supplement-2 m. klient-aktiv-check + admin-bypass).
  - AFVISER: placement på department-knude → P0001 client_placement_node_not_team
  - AFVISER: 2. åbne placering for samme klient → unique violation
  - AFVISER: payload uden client_id/node_id/effective_from → 22023
  _evidens:_ supabase/migrations/20260518000004_t9_client_node_placements.sql:13-84 @ f49e7d5bf248
- **migration:supabase/migrations/20260518000004_t9_client_node_placements.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: modellerer client_node_placements som effective intervals med unique open row, no-overlap exclusion, team-check og audit. AFVISER: flere åbne placeringer for samme client, interval overlap og non-team node.
  - AFVISER: Exclusion constraint afviser overlappende client placement intervals.
  - AFVISER: Unique open index afviser to åbne placements for samme client.
  - AFVISER: Trigger afviser node som ikke er team ved effective_from.
  _evidens:_ supabase/migrations/20260518000004_t9_client_node_placements.sql:13-83 @ f49e7d5bf248
- **migration:supabase/migrations/20260518000005_t9_permission_elements.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Permission-træet lokations-siderne seedes ind i: permission_areas (name UNIQUE) → permission_pages (UNIQUE(area_id,name), FK RESTRICT) → permission_tabs (UNIQUE(page_id,name)). FORCE RLS; select using(true); write-policies kom i fundament-supplement (t9_write_authorized). CRUD-RPC'er gated på has_permission('permissions','manage',true); deactivate = is_active=false (aldrig DELETE).
  - AFVISER: INSERT page med ukendt area_id → FK-violation
  - AFVISER: dublet (area,name) → unique violation
  - AFVISER: CRUD uden permissions.manage.can_edit → 42501
  _evidens:_ supabase/migrations/20260518000005_t9_permission_elements.sql:6-217 @ ec5f8a4e7a46
- **migration:supabase/migrations/20260518000005_t9_permission_elements.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: opretter permission_areas/pages/tabs med FK-kæde, natural unique keys, RLS og CRUD-RPCer med permissions/manage/can_edit. AFVISER: permissions-konfiguration uden manage-rettighed og tabs/pages uden gyldig parent-FK.
  - AFVISER: permission_page_upsert uden permissions/manage/can_edit afvises.
  - AFVISER: permission_tab_upsert med ikke-eksisterende page_id afvises af FK.
  - AFVISER: Duplicate area/page/tab natural key afvises.
  _evidens:_ supabase/migrations/20260518000005_t9_permission_elements.sql:8-216 @ ec5f8a4e7a46
- **migration:supabase/migrations/20260518000006_t9_grants_and_helpers.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Grant-modellen der bærer lokations-adgang: role_permission_grants (rolle × PRÆCIS ét element — CHECK sum=1, udvidet med action_id i supplement-2; can_access/can_write; visibility self/subtree/all; UNIQUE pr. rolle×element via coalesce-index). permission_resolve: arv tab→page→area→default-deny. acl_subtree_org_nodes/employees (via placements×closure), acl_visibility_check (visibility-only, komponeres separat). Grant-CRUD gated på permissions/manage.
  - AFVISER: grant med både page_id og tab_id sat → CHECK-violation (sum=1)
  - AFVISER: rolle uden grant på element og uden arv → permission_resolve → (false,false,'self') default-deny
  - AFVISER: invalid element_type → 22023
  _evidens:_ supabase/migrations/20260518000006_t9_grants_and_helpers.sql:8-178 @ 05bcc94be0d6
- **migration:supabase/migrations/20260518000006_t9_grants_and_helpers.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: opretter role_permission_grants, permission_resolve med tab->page->area fallback og ACL subtree helpers. AFVISER: grant med flere/ingen elementniveauer, ugyldig element_type og visibility udenfor self/subtree/all.
  - AFVISER: role_permission_grants CHECK afviser både area_id og tab_id sat samtidig.
  - AFVISER: role_permission_grant_set afviser element_type udenfor area/page/tab i baseline.
  - AFVISER: permission_resolve default-deny hvis ingen grant findes.
  _evidens:_ supabase/migrations/20260518000006_t9_grants_and_helpers.sql:8-245 @ 05bcc94be0d6
- **migration:supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql** (code · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  Wrapper-mønstret (SECDEF public-RPC → permission-check → pending_change_request): org_node_upsert/deactivate, team_close, employee_place/remove, client_node_place/close, employee_role_assign/remove. NUVÆRENDE bodies for wrappers = supplement-2 M1 + t10.7b (session-var t9_write_authorized + grants).
  - AFVISER: wrapper-kald uden has_permission(<side>,'manage',true) → 42501
  _evidens:_ supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:9-220 @ 19b88ffe0ed1
- **migration:supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: definerer pending-wrapper RPCs for org/team/employee/client placements med has_permission checks og input pre-checks. AFVISER: lokations-/placeringsændringer uden relevant manage/can_edit eller med ugyldig node_type/team-status.
  - AFVISER: org_node_upsert uden org_nodes/manage/can_edit afvises.
  - AFVISER: team_close på ikke-team/inaktiv node afvises i wrapper pre-check.
  - AFVISER: client_node_place på ikke-aktivt team afvises i baseline wrapper.
  _evidens:_ supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:8-192 @ 19b88ffe0ed1
- **migration:supabase/migrations/20260518000008_t9_read_rpcs.sql** (code · skabelon-genbrug)
  Read-RPC-mønstret (read() = read_at(current_date) symmetri) for org-tree/placements/permission-elements/pending — skabelonen for lokations-read-RPC'er inkl. historisk-pr.-dato-læsning (lokations-historik-udtræk §4 trin 10b). NUVÆRENDE bodies = t9_supplement (+_require_read_permission-gate) og read_rpcs_action.
  - AFVISER: permission_elements_read uden permissions/manage-view → 42501 (efter supplement-gaten)
  _evidens:_ supabase/migrations/20260518000008_t9_read_rpcs.sql:7-135 @ b0b1c01c9fe6
- **migration:supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql** (code · direkte)
  Migrationen til grants-modellen + has_permission v2 (grants primær, legacy role_page_permissions som read-only fallback; scope→visibility-mapping m. team→subtree). Legacy-write-vej lukket: role_page_permission_upsert revoked fra authenticated. NUVÆRENDE has_permission-body er t9_seed_owners (record-syntaks-fix af DENNE version).
  - AFVISER: Ny permission KUN i legacy-tabellen → virker via fallback, men grant-modellen er primær (fallbacks fjernelse er kendt G-nummer) — seed derfor ALDRIG kun legacy
  - AFVISER: role_page_permission_upsert som authenticated → permission denied
  _evidens:_ supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:100-229 @ be58cbe15df7
- **migration:supabase/migrations/20260518000010_t9_seed_owners.sql** (code · direkte)
  NUVÆRENDE has_permission(text,text,boolean)-body: aktiv employee → role_id → grants-opslag tab(page-navn+tab-navn)→page→area → 'can_access AND (not can_edit-krav OR can_write)' → ellers legacy-fallback (can_view/can_edit) → false. + NUVÆRENDE _org_node_closure_rebuild (CTE-fix: join på ancestor_id). + seed: Copenhagen Sales/Ejere, mg@+km@ placeret, superadmin-rolle m. area-grants visibility='all' på ALLE aktive areas — dvs. et NYT lokations-area får IKKE automatisk superadmin-grant (seedet itererede kun over dengang-eksisterende areas); genbruges org_structure-area arver superadmin via area-grantet.
  - AFVISER: Bruger uden grant og uden legacy-row → false (default-deny)
  - AFVISER: inaktiv medarbejder → false (via current_employee_id=NULL)
  _evidens:_ supabase/migrations/20260518000010_t9_seed_owners.sql:15-213 @ 07ec8a8e600e
- **migration:supabase/migrations/20260518000011_t9_classify.sql** (code · skabelon-genbrug)
  Klassificering af alle T9-tabellers kolonner (mønster-gentagelse for org/pending/permission-fladerne).
  - AFVISER: Uklassificeret kolonne → migration-gate STRICT rød
  _evidens:_ supabase/migrations/20260518000011_t9_classify.sql:1-126 @ 8ea0d5cc5c34
- **migration:supabase/migrations/20260518100000_t9_fundament_supplement.sql** (code · direkte)
  t9_write_authorized-mønstret (§1.1's session-var-pattern på T9-vejene): INSERT/UPDATE(-/DELETE for grants)-policies på pending_changes/undo_settings/permission_areas/pages/tabs/role_permission_grants kræver current_setting('stork.t9_write_authorized',true)='true'; 11 RPC'er sætter var'en EFTER permission-check (defense-in-depth). Approve/undo-dispatcher: change_type→page_key-mapping (org_nodes/employee_placements/client_placements) — approve kræver can_edit på ressourcen changen rammer; udtømmende CASE, ukendt → 42883. (DML-grants givet her er senere revoked af 20260607110004; policies består som defense-in-depth.)
  - AFVISER: approve af client_place uden client_placements.can_edit → 42501
  - AFVISER: INSERT i pending_changes uden t9_write_authorized → policy-afvist
  - AFVISER: ukendt change_type i approve → 42883
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:26-250 @ 7851d3b19f7b
- **migration:supabase/migrations/20260519000000_m1_t9_superadmin_permissions.sql** (code · skabelon-genbrug)
  Lektionen 'nye (page,tab)-kombinationer kræver seed': T9-RPC'ernes 5 nye permission-par blev seedet bagud for superadmin, fordi m1-smoke-testen (permission-matrix) scanner alle has_permission-kaldesteder og kræver dækning. Lokations-pakkens nye sider skal seedes i samme PR.
  - AFVISER: has_permission-kaldested uden tilsvarende superadmin-dækning → m1_permission_matrix-DB-test rød i CI
  _evidens:_ supabase/migrations/20260519000000_m1_t9_superadmin_permissions.sql:1-49 @ 1d74e04f9f35
- **migration:supabase/migrations/20260520000000_t9_supplement.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  NUVÆRENDE org-maskineri-bodies: date-parametriserede ACL-helpers (acl_subtree_org_nodes_at/employees_at); apply-handlere m. backdated-effective_from-guards og split-at-boundary-semantik (_apply_employee_place/remove, _apply_client_place/close, _apply_org_node_upsert/deactivate, _apply_team_close m. cascade-lukning af employee+client-placements); client_node_placements_select-policy v2: is_admin() ELLER node_id i callers subtree pr. stork.t9_read_at_date (default current_date); _require_read_permission(page,tab)-helper (42501); read-RPC'er m. gates. Lokations-pakkens læsning af klient-placeringer går gennem denne policy.
  - AFVISER: non-admin SELECT på client_node_placements uden for eget subtree → 0 rækker (policy-filtreret)
  - AFVISER: _require_read_permission uden view-permission → 42501
  _evidens:_ supabase/migrations/20260520000000_t9_supplement.sql:657-716 @ 7e490d5f302f
- **migration:supabase/migrations/20260520000000_t9_supplement.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: finaliserer split-at-boundary apply-handlers, date-aware ACL helpers og read-RPCs for org/employee/client placements. AFVISER: invalid payloads, placering på inaktivt/non-team node, close uden aktiv placering og læsning uden permission.
  - AFVISER: _apply_client_place kræver client_id/node_id/effective_from.
  - AFVISER: Client placement splitter eksisterende interval fremfor at skabe overlap.
  - AFVISER: _require_read_permission rejser permission_denied uden page permission.
  _evidens:_ supabase/migrations/20260520000000_t9_supplement.sql:79-952 @ 7e490d5f302f
- **migration:supabase/migrations/20260521000001_t10_tables.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Klient-masteren lokations-klient-tilladelser FK'er til + domæne-tabel-skabelonen: core_identity.clients (name trim>0; fields jsonb CHECK typeof='object'; is_active-toggle i stedet for DELETE — INGEN delete-policy = default-deny; logo-konsistens-CHECK alle-eller-ingen; INGEN anonymized_at — klienter anonymiseres bevidst ikke) + client_field_definitions (global key UNIQUE; pii_level-CHECK; is_active-udfasning). FORCE RLS; SELECT via tab-aware has_permission('<side>','manage',false); INSERT/UPDATE via stork.allow_<tabel>_write; eksplicit DML-GRANT (dokumenteret som obligatorisk — T1-defaults giver kun function-execute); audit + set_updated_at-triggere.
  - AFVISER: INSERT client med fields='[]' (array) → CHECK-violation
  - AFVISER: logo_bytes uden content_type/filename → CHECK-violation
  - AFVISER: DELETE på clients → default-deny (ingen policy)
  - AFVISER: SELECT uden clients/manage-view → 0 rækker
  _evidens:_ supabase/migrations/20260521000001_t10_tables.sql:24-144 @ 359c0b2301f3
- **migration:supabase/migrations/20260521000001_t10_tables.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: opretter clients og client_field_definitions med nonempty checks, JSON fields, logo all-or-none, RLS og no delete-policy. AFVISER: blank client name/key/display_label, non-object fields, partial logo og direkte delete.
  - AFVISER: clients.name blank afvises.
  - AFVISER: clients.fields skal være JSON object.
  - AFVISER: Kun delvist logo-felt-sæt afvises af all-or-none check.
  - AFVISER: Der findes ingen delete policy for clients.
  _evidens:_ supabase/migrations/20260521000001_t10_tables.sql:24-142 @ 359c0b2301f3
- **migration:supabase/migrations/20260521000002_t10_is_permanent_allowed_extend.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  NUVÆRENDE is_permanent_allowed-allowlist (17 entries: P1a-baseline + clients + client_field_definitions). Lokations-pakken skal CREATE OR REPLACE med HELE VALUES-blokken + sine nye entries (mønstret er kopiér-alt+tilføj, ikke patch).
  - AFVISER: 'permanent'-klassificering af lokations-kolonner før denne funktion er udvidet → d1c-trigger P0001
  _evidens:_ supabase/migrations/20260521000002_t10_is_permanent_allowed_extend.sql:10-47 @ bb21196b0b4c
- **migration:supabase/migrations/20260521000002_t10_is_permanent_allowed_extend.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: udvider permanent-allowlisten specifikt til clients og client_field_definitions, ikke generisk til alle core_identity-tabeller. AFVISER: at en lokationspakke automatisk kan bruge permanent retention uden at tilføje egne allowlist-regler.
  - AFVISER: core_identity.locations er ikke dækket af T10-allowlisten.
  - AFVISER: Wildcard på core_identity ville gøre alle fremtidige lokationstabeller permanent-tilladte.
  _evidens:_ supabase/migrations/20260521000002_t10_is_permanent_allowed_extend.sql:10-44 @ bb21196b0b4c
- **migration:supabase/migrations/20260521000003_t10_classify.sql** (code · skabelon-genbrug)
  Domæne-klassifikations-eksemplet: 19 kolonner, alle 'permanent' (klient bevares evigt); logo_filename/bytes klassificeret direct-PII (filnavne/billeder kan identificere); fields 'indirect' top-level fordi jsonb-nøgler hashes individuelt i audit_filter_values-special-casen; ON CONFLICT obligatorisk (BOOTSTRAP_CONFIG_TABLES).
  - AFVISER: INSERT uden ON CONFLICT → fitness migration-on-conflict-discipline rød
  _evidens:_ supabase/migrations/20260521000003_t10_classify.sql:16-66 @ f467bafd0769
- **migration:supabase/migrations/20260521000004_t10_audit_filter_values.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  NUVÆRENDE audit_filter_values-body: T1-logik + (a) NULL-værdi-skip (jsonb_set med NULL ville nulstille hele objektet — silent audit-tab), (b) clients.fields-special-case: walker jsonb-nøgler og hasher hver key med pii_level='direct' i client_field_definitions UDEN is_active-filter (deaktivering af felt må ikke åbne datalæk for gamle værdier). En lokations-tabel med konfig-jsonb (cooldown-konfig) der bærer PII-nøgler ville kræve en tilsvarende special-case — der findes INGEN generisk jsonb-walking.
  - AFVISER: direct-PII-nøgle i clients.fields → 'sha256:...' i audit
  - AFVISER: NULL-værdi i direct-kolonne → bevaret NULL (ikke objekt-nulstilling)
  - AFVISER: uklassificeret tabel i LENIENT → værdier bevaret m. WARNING
  _evidens:_ supabase/migrations/20260521000004_t10_audit_filter_values.sql:15-130 @ 4eb775c9f77b
- **migration:supabase/migrations/20260521000004_t10_audit_filter_values.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: final audit_filter_values hasher direct PII og har særlig clients.fields-walk, så dynamiske direct PII-felter hashes uanset aktiv status. AFVISER: strict audit af uklassificerede kolonner eller ukendte JSON-felter.
  - AFVISER: Strict mode rejser no_data_field_definitions for en ny lokationstabel uden klassifikation.
  - AFVISER: Strict mode rejser unknown_column_for_audit_filter for ukendt kolonne/felt.
  _evidens:_ supabase/migrations/20260521000004_t10_audit_filter_values.sql:15-126 @ 4eb775c9f77b
- **migration:supabase/migrations/20260521000005_t10_clients_validate_fields.sql** (code · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  LENIENT konfig-jsonb-validering (mønster for cooldown-konfig jsonb): BEFORE-trigger matcher fields-nøgler mod aktive definitioner; ukendte/inaktive → WARNING (exception kun ved stork.clients_fields_strict='true').
  - AFVISER: strict-mode + ukendt nøgle → 23514
  - AFVISER: LENIENT + ukendt nøgle → accepteret m. WARNING (ikke-afvisning man skal kende)
  _evidens:_ supabase/migrations/20260521000005_t10_clients_validate_fields.sql:14-59 @ 82f83e0e32ac
- **migration:supabase/migrations/20260521000005_t10_clients_validate_fields.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: clients_validate_fields validerer dynamiske fields mod client_field_definitions og kan køre lenient warn eller strict raise via stork.clients_fields_strict. AFVISER: ukendte/inaktive fields i strict mode.
  - AFVISER: Strict mode rejser 23514 på unknown_client_field.
  - AFVISER: Strict mode rejser 23514 på inactive_client_field.
  - AFVISER: Non-object fields fanges af table CHECK.
  _evidens:_ supabase/migrations/20260521000005_t10_clients_validate_fields.sql:14-57 @ 82f83e0e32ac
- **migration:supabase/migrations/20260521000006_t10_seed_permissions.sql** (code · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GRANT-MODEL-seed-skabelonen lokations-pakken kopierer 1:1: pages under eksisterende area (scoped via area-JOIN mod navne-kollision) + 'manage'-tab pr. page + superadmin tab-grants (can_access+can_write+visibility='all') — alt ON CONFLICT DO NOTHING + stork.t9_write_authorized sat top-level (INSERT-policies kræver den). Legacy role_page_permissions seedes IKKE.
  - AFVISER: Seed uden t9_write_authorized → policy-afvist under migration
  - AFVISER: Seed uden area-scope-JOIN → risiko for kollision med samme page-navn i andet area
  _evidens:_ supabase/migrations/20260521000006_t10_seed_permissions.sql:17-57 @ fcf49401ff24
- **migration:supabase/migrations/20260521000006_t10_seed_permissions.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: seeder clients og client_field_definitions som pages/tabs/grants under org_structure med t9_write_authorized og scope til area. AFVISER: seed der rammer page-navnekollision i andet area eller mangler write-session-var.
  - AFVISER: Seed uden stork.t9_write_authorized fejler INSERT-policies.
  - AFVISER: Page lookup scope-es til org_structure for at afvise fremtidig name-kollision.
  _evidens:_ supabase/migrations/20260521000006_t10_seed_permissions.sql:17-56 @ fcf49401ff24
- **migration:supabase/migrations/20260521000007_t10_client_node_placements_fk.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  FK-indfrielsen: client_node_placements.client_id → clients(id) ON DELETE RESTRICT (klient deaktiveres, slettes aldrig; forsøg blokeres). Mønster for lokations-FK'er (leverandør-FK, klient-tilladelser): udskudt FK er en fitness-FK_PENDING-sag med selv-udløb — target findes → FK SKAL tilføjes.
  - AFVISER: DELETE af klient med placeringer → FK RESTRICT-violation
  - AFVISER: *_id-kolonne uden FK/exemption/pending → fitness fk-coverage rød
  _evidens:_ supabase/migrations/20260521000007_t10_client_node_placements_fk.sql:15-22 @ 81fe5ff76e77
- **migration:supabase/migrations/20260521000007_t10_client_node_placements_fk.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: tilføjer FK fra client_node_placements.client_id til clients(id) med ON DELETE RESTRICT. AFVISER: lokationsplacering for ikke-eksisterende client og sletning af client med placements.
  - AFVISER: INSERT placement med ukendt client_id afvises.
  - AFVISER: DELETE client med refererende placement afvises.
  _evidens:_ supabase/migrations/20260521000007_t10_client_node_placements_fk.sql:15-21 @ 81fe5ff76e77
- **migration:supabase/migrations/20260521000008_t10_client_active_check.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Klient-aktiv-håndhævelsen + cron-kontekst-helperen: is_admin_by_employee_id(uuid) (admin-tjek via employee-id — auth.uid() er NULL i cron-apply; grant-mønster som is_admin). client_node_place (wrapper): kræver client_placements/manage/can_edit; pre-check team aktiv; klient SKAL findes (P0002) og være aktiv (22023, is_admin-bypass); sætter t9_write_authorized. client_node_close: eksistens-check (P0002), INGEN aktiv-check (lukning er altid lovlig). Apply-versionen re-verificerer (pending oprettet-mens-aktiv, applied-efter-deaktivering fanges).
  - AFVISER: place af inaktiv klient som non-admin → 22023 client_inactive
  - AFVISER: place af ukendt klient → P0002
  - AFVISER: close af ukendt klient → P0002 (ikke silent no-op)
  _evidens:_ supabase/migrations/20260521000008_t10_client_active_check.sql:21-132 @ 713960b8fd27
- **migration:supabase/migrations/20260521000008_t10_client_active_check.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: client_node_place wrapper kræver client_placements/manage/can_edit, aktiv team pre-check, eksisterende client og afviser inactive client for non-admin; close kræver permission og eksisterende client. AFVISER: placering af inactive client af non-admin og placement på inaktivt/non-team node.
  - AFVISER: Non-admin kan ikke place inactive client.
  - AFVISER: client_node_close afviser client_not_found.
  - AFVISER: client_node_place afviser manglende team ved current_date pre-check.
  _evidens:_ supabase/migrations/20260521000008_t10_client_active_check.sql:25-131 @ 713960b8fd27
- **migration:supabase/migrations/20260521000009_t10_client_rpcs.sql** (code · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  Write-RPC-skabelonen for lokations-CRUD: client_upsert (permission+change_reason+navn-krav; INSERT bruger p_is_active; UPDATE rører BEVIDST IKKE is_active eller logo — separate RPC'er forhindrer utilsigtet reaktivering/datatab; ukendt id → P0002) + client_set_active (dedikeret toggle svarende til §1.12's status-livscyklus-RPC m. audit+årsag).
  - AFVISER: upsert uden change_reason → 22023
  - AFVISER: upsert med blankt navn → 22023
  - AFVISER: upsert mod ukendt id → P0002
  - AFVISER: uden clients.manage.can_edit → 42501
  _evidens:_ supabase/migrations/20260521000009_t10_client_rpcs.sql:17-105 @ bb9ee808bc6f
- **migration:supabase/migrations/20260521000009_t10_client_rpcs.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: client_upsert/client_set_active håndhæver clients/manage/can_edit, nonempty change_reason/name og session-var for table update; upsert-update ændrer ikke is_active/logo. AFVISER: client masterdata mutation uden permission/reason eller update af manglende client.
  - AFVISER: client_upsert uden change_reason afvises.
  - AFVISER: client_upsert med blank name afvises.
  - AFVISER: UPDATE-path ændrer ikke is_active; set_active er separat.
  _evidens:_ supabase/migrations/20260521000009_t10_client_rpcs.sql:17-104 @ bb9ee808bc6f
- **migration:supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql** (code · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  Sikkerheds-invariant-mønstret for konfig-registre: key er IMMUTABLE post-INSERT (audit-hash binder til key) og pii_level 'direct'→lavere AFVISES — begge UDEN superadmin-bypass ('sikkerheds-invariants > superadmin må alt'). Eskalering none→direct tilladt. set_active-RPC separat.
  - AFVISER: UPDATE med ny key → 22023 'key er immutable'
  - AFVISER: pii_level direct→indirect → 22023 (eksisterende værdier ville skrives i klartekst i audit)
  _evidens:_ supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:16-131 @ 9d2a0e0470ea
- **migration:supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: field-definition RPCs kræver permission/reason, validerer pii_level, forbyder key rename og direct->non-direct downgrade; active-toggle er separat. AFVISER: nedklassificering af direct PII og schema-drift for dynamiske klient/lokationsfelter.
  - AFVISER: p_pii_level udenfor none/indirect/direct afvises.
  - AFVISER: Key rename på eksisterende definition afvises.
  - AFVISER: direct -> indirect/none afvises.
  _evidens:_ supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:16-130 @ 9d2a0e0470ea
- **migration:supabase/migrations/20260521000011_t10_client_logo_rpcs.sql** (codex · direkte)
  GØR: client_logo_set/clear/get håndhæver clients/manage-permission, reason ved write og all-or-none logo-felter. AFVISER: partial logo metadata, logo-write uden reason og logo-read uden view permission.
  - AFVISER: client_logo_set med en null logo-komponent afvises.
  - AFVISER: client_logo_set uden change_reason afvises.
  - AFVISER: client_logo_get uden clients/manage/can_view afvises.
  _evidens:_ supabase/migrations/20260521000011_t10_client_logo_rpcs.sql:12-102 @ 34d5eac98c27
- **migration:supabase/migrations/20260521000012_t10_client_read_rpcs.sql** (code · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  Read-RPC-skabelonen: client_get/client_list/client_field_definitions_list — SECURITY INVOKER (RLS gælder), tab-aware has_permission('<side>','manage',false) eksplicit i body (42501, ikke tom liste), tunge felter projiceres som flag (has_logo) i stedet for bytea.
  - AFVISER: kald uden view-permission → 42501
  - AFVISER: inaktive felt-definitioner udelades pr. default (p_include_inactive=false)
  _evidens:_ supabase/migrations/20260521000012_t10_client_read_rpcs.sql:11-92 @ 8bef6e71142e
- **migration:supabase/migrations/20260521000012_t10_client_read_rpcs.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: client_get/client_list/client_field_definitions_list kræver view permissions og definitions-list skjuler inaktive definitions som default. AFVISER: klient-/feltkonfigurationslæsning uden permission og implicit visning af inaktive felter.
  - AFVISER: client_get uden clients/manage/can_view afvises.
  - AFVISER: client_list returnerer først efter permission check.
  - AFVISER: client_field_definitions_list inkluderer ikke inaktive definitions medmindre p_include_inactive=true.
  _evidens:_ supabase/migrations/20260521000012_t10_client_read_rpcs.sql:11-91 @ 8bef6e71142e
- **migration:supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql** (code · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  Workaround-seed af legacy-rows for m1-test-kompatibilitet — sidenhen REVERSERET (t10.13c) da testen blev refactoret til grant-modellen. Lektion: seed KUN grant-modellen for lokations-sider.
  - AFVISER: (historisk) m1-test krævede legacy-row pr. has_permission-kaldested
  _evidens:_ supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql:1-24 @ 5a1ef0bab0ea
- **migration:supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: seeder legacy role_page_permissions for clients og client_field_definitions som test-/fallback-kompatibilitet med has_permission-scannere. AFVISER: lokations-RPCs med has_permission uden tilsvarende superadmin legacy row, så M1-permission-matrix kan fejle.
  - AFVISER: Legacy seed kræver allow_role_page_permissions_write session-var.
  - AFVISER: Kun superadmin all/can_edit seeding er inkluderet for de nye client pages.
  _evidens:_ supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql:11-24 @ 5a1ef0bab0ea
- **migration:supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql** (code · skabelon-genbrug)
  Reversal af t10.13b: legacy-rows fjernet; grant-modellen er primær, has_permission's legacy-fallback består kun som fallback.
  - AFVISER: Efter fjernelsen bæres clients/cfd-adgang alene af grant-modellen: mangler tab-grantet, returnerer has_permission false (fallbacken finder ingen legacy-row)
  _evidens:_ supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql:1-22 @ c59b88d96e17
- **migration:supabase/migrations/20260521100000_t9_supplement_2_wrappers_session_var.sql** (code · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  G059-lektionen: wrapper-RPC'er SKAL sætte stork.t9_write_authorized FØR pending_change_request (ellers afviser pending_changes-INSERT-policyen under FORCE RLS) OG have eksplicit GRANT EXECUTE til authenticated (revoke fra public dækker ikke authenticated i Supabase).
  - AFVISER: wrapper uden session-var → INSERT-policy-afvisning ved pending_change_request
  - AFVISER: wrapper uden grant → ikke-kaldbar via REST (permission denied)
  _evidens:_ supabase/migrations/20260521100000_t9_supplement_2_wrappers_session_var.sql:1-60 @ 6f8f00a1f939
- **migration:supabase/migrations/20260521100000_t9_supplement_2_wrappers_session_var.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: retter wrapperne til at sætte stork.t9_write_authorized før pending_change_request og grant execute til authenticated. AFVISER: lokations-/placeringswrapper som ser korrekt ud men fejler RLS INSERT eller ikke kan kaldes via API.
  - AFVISER: Wrapper uden t9_write_authorized før pending_change_request fejler pending_changes INSERT.
  - AFVISER: SECURITY DEFINER-wrapper uden explicit authenticated grant kan ikke kaldes via Supabase REST.
  _evidens:_ supabase/migrations/20260521100000_t9_supplement_2_wrappers_session_var.sql:13-160 @ 6f8f00a1f939
- **migration:supabase/migrations/20260521100001_t9_supplement_2_grants_fix.sql** (code · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  Konsolideret grant-fix: 9 RPC'er fik manglende GRANT EXECUTE TO authenticated. Disciplinen: hver revoke-fra-public SKAL følges af eksplicit grant til den tilsigtede rolle.
  - AFVISER: RPC med revoke uden grant → REST-kald fejler med permission denied for function
  _evidens:_ supabase/migrations/20260521100001_t9_supplement_2_grants_fix.sql:1-22 @ add08e47ed47
- **migration:supabase/migrations/20260521100001_t9_supplement_2_grants_fix.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: giver explicit execute grants til T9 fundament-supplement RPCs, fordi authenticated ikke arver public execute i Supabase. AFVISER: nye lokations-RPCs der kun revoker public/anon men aldrig grants til authenticated.
  - AFVISER: RPC uden grant execute to authenticated er utilgængelig via REST selvom function eksisterer.
  - AFVISER: pending_change_undo og permission CRUD var eksplicit rettet som mønster.
  _evidens:_ supabase/migrations/20260521100001_t9_supplement_2_grants_fix.sql:1-22 @ add08e47ed47
- **migration:supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  NUVÆRENDE _apply_client_place/_apply_team_close-bodies + superadmin-bypass-RAMMEN: v_admin_involved beregnes fra pending-rækkens requested_by/approved_by via is_admin_by_employee_id (auth.uid() er NULL i cron-apply) og bypasser KUN forretnings-vagter (team-aktiv-check; allerede-inaktiv→idempotent no-op) — ALDRIG strukturelle vagter (findes-ikke P0002, forkert type 22023). Grænsen forretnings-vagt (bypassbar) vs. struktur-/sikkerhedsvagt (aldrig) er den disponering lokations-pakkens vagter skal genbruge.
  - AFVISER: _apply_client_place mod inaktivt team uden admin-involveret → P0001 client_placement_requires_active_team
  - AFVISER: team_close på ikke-team → 22023 (bypasses ALDRIG)
  - AFVISER: team_close på allerede-inaktiv m. admin → return (no-op), uden admin → 22023
  _evidens:_ supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql:1-110 @ b0cff39e52b6
- **migration:supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: superadmin-bypass gælder kun bestemte business-regler i _apply_client_place/_apply_team_close; strukturelle guards bliver. AFVISER: non-admin placering på inaktiv client/team og team_close uden aktiv version eller på non-team.
  - AFVISER: Non-admin kan ikke placere inaktiv client.
  - AFVISER: Client not found afvises også for admin.
  - AFVISER: No active team version/not team afvises stadig ved team_close.
  _evidens:_ supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql:18-231 @ b0cff39e52b6
- **migration:supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Handlings-granulariteten lokations-status-RPC'en kan bindes til: permission_actions under tabs (UNIQUE(tab_id,name); kode-låste flag requires_second_approver/has_undo/bypass_tab_write — kun migration-seed; second_approver_type UI-redigerbar 'above'|'superadmin'; CHECK: has_undo kræver requires_second_approver). role_permission_grants udvidet: CHECK præcis ét af area/page/tab/action; UNIQUE-index inkl. action. permission_resolve v2: action→tab→page→area→default-deny. role_permissions_read m. action-gren.
  - AFVISER: INSERT action med has_undo=true, requires_second_approver=false → CHECK-violation
  - AFVISER: second_approver_type='peer' → CHECK-violation
  - AFVISER: grant med både tab_id og action_id → CHECK-violation
  _evidens:_ supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql:12-240 @ 5a09930f3230
- **migration:supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: tilføjer permission_actions med second-approver/undo/bypass flags, action_id i grants og action-aware permission_resolve. AFVISER: action uden tab, has_undo uden requires_second_approver og action grants der falder tilbage til tab/page for selve action-adgang.
  - AFVISER: permission_actions CHECK afviser has_undo=true hvis requires_second_approver=false.
  - AFVISER: role_permission_grants CHECK kræver præcis ét af area/page/tab/action.
  - AFVISER: Action permission kræver direkte action grant.
  _evidens:_ supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql:13-215 @ 5a09930f3230
- **migration:supabase/migrations/20260521100004_t9_supplement_2_approve_helpers.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  Approve-eligibility-primitiverne: pending_changes.action_id (nullable, FK RESTRICT); acl_higher_level_employees (ancestors via closure depth>0 — 'above'-godkendere); has_permission_action(action_id): kræver (a) tab-can_access via permission_resolve, (b) EKSPLICIT action-grant (ingen arv/fallback — additiv model), (c) tab-can_write MEDMINDRE bypass_tab_write. Lokations-actions med 2. godkender kører denne kæde.
  - AFVISER: action-grant uden tab-can_access → false
  - AFVISER: tab-can_write mangler og bypass_tab_write=false → false
  - AFVISER: inaktiv action → false
  _evidens:_ supabase/migrations/20260521100004_t9_supplement_2_approve_helpers.sql:10-99 @ 2793702cfd7b
- **migration:supabase/migrations/20260521100004_t9_supplement_2_approve_helpers.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: has_permission_action kræver aktiv employee, aktiv action, tab-access, direkte action grant og tab-write medmindre bypass_tab_write er sat; higher-level helper bruger org_node_closure. AFVISER: action-approve uden direkte action grant eller uden nødvendig tab-write.
  - AFVISER: Inactive action giver false.
  - AFVISER: Direct action grant med can_access=false giver false.
  - AFVISER: Tab can_write=false afviser medmindre action.bypass_tab_write=true.
  _evidens:_ supabase/migrations/20260521100004_t9_supplement_2_approve_helpers.sql:20-89 @ 2793702cfd7b
- **migration:supabase/migrations/20260521100005_t9_supplement_2_pending_changes_select_policy.sql** (code · direkte)
  NUVÆRENDE pending_changes_select-policy: requester ELLER is_admin ELLER (action_id NULL + change_type-gruppe + can_edit på tilhørende side) ELLER (action_id sat + has_permission_action + approve-eligibility spejlet: uden 2.-godkender-krav ELLER 'above' og læser er higher-level af requester). Sibling-gren-overread eksplicit lukket. Nye lokations-change_types kræver policy-udvidelse for at godkendere kan SE pending'er.
  - AFVISER: non-admin med action-grant i anden gren → 0 rækker (ingen payload-overread)
  - AFVISER: 'above'-action læst af ikke-overordnet → 0 rækker
  _evidens:_ supabase/migrations/20260521100005_t9_supplement_2_pending_changes_select_policy.sql:17-61 @ 4df2fca6e873
- **migration:supabase/migrations/20260521100006_t9_supplement_2_pending_change_approve.sql** (code · skabelon-genbrug)
  Approve v3 (action-aware; historik — NUVÆRENDE body er secdef-versionen 20260607110001): action-pendings kræver has_permission_action + ved requires_second_approver: 'above' → approver skal være i acl_higher_level_employees(requester) (admin bypass), 'superadmin' → is_admin.
  - AFVISER: 'above'-action approved af sideordnet → 42501
  - AFVISER: superadmin-action approved af non-admin → 42501
  _evidens:_ supabase/migrations/20260521100006_t9_supplement_2_pending_change_approve.sql:13-129 @ 43f1a14925b6
- **migration:supabase/migrations/20260521100007_t9_supplement_2_ui_rpcs.sql** (code · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  Action-CRUD-mønstret: permission_action_upsert/deactivate (kode-låste flag sættes IKKE her — kun navn/aktiv/sortering), permission_action_set_approver_type (KUN second_approver_type), role_permission_grant_set m. action-element, pending_change_eligible_approvers (UI-opslag).
  - AFVISER: set_approver_type('peer') → CHECK-violation
  - AFVISER: upsert kan ikke sætte requires_second_approver (parametrene findes ikke — kode-låst)
  _evidens:_ supabase/migrations/20260521100007_t9_supplement_2_ui_rpcs.sql:10-214 @ 3df4807f5d7b
- **migration:supabase/migrations/20260521100007_t9_supplement_2_ui_rpcs.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: udvider role_permission_grant_set/remove til action og tilføjer UI-RPCs for permission_actions samt eligible approvers. AFVISER: action grant changes uden permissions/manage/can_edit, invalid element_type og invalid approver type.
  - AFVISER: role_permission_grant_set afviser element_type udenfor area/page/tab/action.
  - AFVISER: permission_action_set_approver_type afviser p_type udenfor above/superadmin.
  - AFVISER: Non-permission-manager afvises.
  _evidens:_ supabase/migrations/20260521100007_t9_supplement_2_ui_rpcs.sql:9-214 @ 3df4807f5d7b
- **migration:supabase/migrations/20260521100008_t9_supplement_2_read_rpcs_action.sql** (code · skabelon-genbrug)
  Return-type-ændringer på read-RPC'er kræver DROP FUNCTION + CREATE (CREATE OR REPLACE afvises af Postgres) og re-grant. pending_changes_read +action_id; permission_elements_read +action-gren (gate bevaret).
  - AFVISER: CREATE OR REPLACE med ny return-tabel → 42P13 cannot change return type
  _evidens:_ supabase/migrations/20260521100008_t9_supplement_2_read_rpcs_action.sql:1-30 @ 0b14515695b3
- **migration:supabase/migrations/20260607100001_core_identity_secdef_permission_action.sql** (code · skabelon-genbrug)
  INVOKER→SECDEF-konvertering af permission_action_upsert/deactivate/set_approver_type (body 1:1; has_permission-gate + session-vars bevaret). Kører nu som postgres/bypassrls — gaten er permission-checket i body, ikke RLS. Hver konverteret funktion SKAL stå i fitness' SECDEF_SANCTIONED med kategori, ellers rød CI.
  - AFVISER: Ny SECDEF-funktion uden SECDEF_SANCTIONED-entry → fitness secdef-marker-discipline violation (fail-closed i CI)
  _evidens:_ supabase/migrations/20260607100001_core_identity_secdef_permission_action.sql:1-30 @ a5577bd8f271
- **migration:supabase/migrations/20260607100002_core_identity_secdef_permission_area.sql** (code · skabelon-genbrug)
  INVOKER→SECDEF-konvertering af permission_area_upsert/deactivate (body 1:1; has_permission-gate + session-vars bevaret). Kører nu som postgres/bypassrls — gaten er permission-checket i body, ikke RLS. Hver konverteret funktion SKAL stå i fitness' SECDEF_SANCTIONED med kategori, ellers rød CI.
  - AFVISER: Ny SECDEF-funktion uden SECDEF_SANCTIONED-entry → fitness secdef-marker-discipline violation (fail-closed i CI)
  _evidens:_ supabase/migrations/20260607100002_core_identity_secdef_permission_area.sql:1-20 @ c371e2c95d0d
- **migration:supabase/migrations/20260607100003_core_identity_secdef_permission_page.sql** (code · skabelon-genbrug)
  INVOKER→SECDEF-konvertering af permission_page_upsert/deactivate (body 1:1; has_permission-gate + session-vars bevaret). Kører nu som postgres/bypassrls — gaten er permission-checket i body, ikke RLS. Hver konverteret funktion SKAL stå i fitness' SECDEF_SANCTIONED med kategori, ellers rød CI.
  - AFVISER: Ny SECDEF-funktion uden SECDEF_SANCTIONED-entry → fitness secdef-marker-discipline violation (fail-closed i CI)
  _evidens:_ supabase/migrations/20260607100003_core_identity_secdef_permission_page.sql:1-20 @ a7ca205d367a
- **migration:supabase/migrations/20260607100004_core_identity_secdef_permission_tab.sql** (code · skabelon-genbrug)
  INVOKER→SECDEF-konvertering af permission_tab_upsert/deactivate (body 1:1; has_permission-gate + session-vars bevaret). Kører nu som postgres/bypassrls — gaten er permission-checket i body, ikke RLS. Hver konverteret funktion SKAL stå i fitness' SECDEF_SANCTIONED med kategori, ellers rød CI.
  - AFVISER: Ny SECDEF-funktion uden SECDEF_SANCTIONED-entry → fitness secdef-marker-discipline violation (fail-closed i CI)
  _evidens:_ supabase/migrations/20260607100004_core_identity_secdef_permission_tab.sql:1-20 @ 8cea98574a17
- **migration:supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  NUVÆRENDE pending_change_approve/undo-bodies (SECDEF; kanonisk body-paritet genoprettet): approve validerer status='pending', action-gren (has_permission_action + above/superadmin-godkender-disciplin) eller legacy change_type→page_key-can_edit, self-approve-forbud, undo_deadline fra undo_settings; undo kræver approved + før deadline + samme gate.
  - AFVISER: above-action approved af ikke-overordnet → 42501
  - AFVISER: self-approve som non-admin → 42501
  - AFVISER: undo efter deadline → 22023
  _evidens:_ supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql:1-30 @ ae336ee67bbb
- **migration:supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: final SECURITY DEFINER approve/undo håndhæver current employee, pending status, kendt change_type, legacy/action-permission, self-approve-blokering, higher-level/superadmin second approver og undo-deadline. AFVISER: lokationsgodkendelse uden korrekt rolle, approver-niveau eller status.
  - AFVISER: Approve af status != pending afvises.
  - AFVISER: Non-admin self-approve af legacy path afvises.
  - AFVISER: Action requiring superadmin afvises for non-admin.
  - AFVISER: Undo efter deadline afvises.
  _evidens:_ supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql:8-183 @ ae336ee67bbb
- **migration:supabase/migrations/20260607110002_core_identity_secdef_role_permission_grant.sql** (code · skabelon-genbrug)
  role_permission_grant_set/remove som SECDEF (samme konverteringsmønster + SECDEF_SANCTIONED-kobling).
  - AFVISER: uden permissions/manage/can_edit → 42501
  _evidens:_ supabase/migrations/20260607110002_core_identity_secdef_role_permission_grant.sql:1-20 @ b19ef09f0a35
- **migration:supabase/migrations/20260607110003_core_identity_secdef_undo_setting.sql** (code · skabelon-genbrug)
  undo_setting_update som SECDEF (mønster; gate pending_changes/settings/can_edit bevaret). Lokations-change_types' undo-perioder konfigureres her.
  - AFVISER: undo_period_seconds > 30 dage → CHECK-violation (tabel-constraint)
  _evidens:_ supabase/migrations/20260607110003_core_identity_secdef_undo_setting.sql:1-20 @ fab7af0d62e8
- **migration:supabase/migrations/20260607110004_core_identity_revoke_authenticated_core_writes.sql** (code · direkte) **[divergens bevaret — se Konflikter]**
  DEN HÅRDE skrivegrænse alle lokations-tabeller fødes under: REVOKE INSERT/UPDATE/DELETE/TRUNCATE på ALLE tabeller i core_identity/core_compliance/core_money fra authenticated OG anon. SELECT består (RLS-policies bærer læsning). Al skrivning går via SECURITY DEFINER-RPC'er (postgres/bypassrls). Session-var-write-policies består som moot defense-in-depth (D4-fitness kræver dem for mappede tabeller). Håndhævet løbende af fitness app-write-revoke-discipline (has_table_privilege-live-test, tom exemption-liste).
  - AFVISER: Direkte INSERT på enhver core_*-tabel som authenticated → permission denied — uanset session-vars/policies
  - AFVISER: Ny lokations-tabel med GRANT INSERT til authenticated → fitness app-write-revoke rød (medmindre begrundet exemption)
  _evidens:_ supabase/migrations/20260607110004_core_identity_revoke_authenticated_core_writes.sql:1-13 @ 408a96ff17ec
- **migration:supabase/migrations/20260607110004_core_identity_revoke_authenticated_core_writes.sql** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: revoker endeligt insert/update/delete/truncate på alle core_* tabeller fra authenticated og anon. AFVISER: direkte app-mutation af core_identity-lokationer, klientplaceringer eller permission-konfiguration uden godkendt RPC/session-var.
  - AFVISER: Authenticated kan ikke INSERT/UPDATE/DELETE direkte på core_identity.clients eller tilsvarende lokationstabeller.
  - AFVISER: RLS write-policy alene er ikke nok hvis table grants er revokeret.
  _evidens:_ supabase/migrations/20260607110004_core_identity_revoke_authenticated_core_writes.sql:1-12 @ 408a96ff17ec
- **migration:supabase/migrations/20260610190000_gov4_g061_comment_paritet.sql** (code · skabelon-genbrug)
  Comment-paritet repo↔live: 2 COMMENT ON-statements genudført 1:1 fordi de aldrig nåede live (deploy-hul). Disciplin: migrations-kommentarer er del af leverancen og skal verificeres live.
  - AFVISER: live_comment=NULL for repo-defineret comment → gov-4-afvigelse
  _evidens:_ supabase/migrations/20260610190000_gov4_g061_comment_paritet.sql:1-13 @ bad2fddfc756
- **oid:021357f80b6e770bafe9dc63b91d841a0bf636bc:supabase/classification.json** (code · skabelon-genbrug)
  Tom transitions-fil ({"columns":{}}): migration-INSERTs er kilden; filen består kun som fallback-kilde A for migration-gaten. Lokations-klassifikationer skal IKKE hertil — de skal i migrations.
  - AFVISER: Klassifikation KUN i denne fil → virker mekanisk i gaten, men bryder 'migrations er sandheden'-regimet
  _evidens:_ supabase/classification.json:1-4 @ 021357f80b6e
- **oid:4312d4b59493cd35cad092c17fd9921190747be5:.github/workflows/ci.yml** (code · direkte)
  CI-wiringen der gør gates til HÅRDE grænser for pakken: migration-gate m. MIGRATION_GATE_STRICT=true, pnpm fitness + fitness:selftest, governance:check(+selftest), kæde/workflow-selftests, samt DB-jobbet: types:check, schema:check, db:test. Slutjob kræver success fra alle.
  - AFVISER: Ethvert gate-trin exit!=0 → merge blokeret
  _evidens:_ .github/workflows/ci.yml:78-168 @ 4312d4b59493
- **oid:70d52135782e35327a8392e7e5922f322750279c:scripts/types-gen.sh** (code · direkte)
  Type-codegen-gaten: genererer packages/types/src/database.ts fra live-DB for schemas public,core_identity,core_compliance,core_money (listen dokumenterer samtidig den LIVE-eksponerede API-flade); --check-mode diff'er og fejler ved drift (kørt i CI, ci.yml:142). Nye lokations-tabeller/RPC'er ÆNDRER genererede typer → pnpm types:generate skal køres og committes i samme leverance.
  - AFVISER: Ny tabel deployet uden regenererede typer → types:check '::error Types drift' → CI rød
  _evidens:_ scripts/types-gen.sh:13-53 @ 70d52135782e
- **oid:b09f79cf83b27b83d00e1575768e90600de83f18:supabase/advisor-baseline.json** (code · direkte)
  Advisor-baselinen fitness sammenligner live-DB mod: secdef_exposed (alle SECDEF-funktioner eksekverbare af authenticated/anon) + rls_no_policy (RLS-tabeller med 0 policies). Ny lokations-SECDEF-RPC og evt. 0-policy-tabel SKAL tilføjes baselinen i samme PR (nye eksponeringer = rød; forsvundne entries = også rød — baselinen bider begge veje).
  - AFVISER: Ny SECDEF-RPC uden baseline-entry → fitness advisor-baseline rød
  - AFVISER: slettet RPC uden baseline-oprydning → også rød
  _evidens:_ supabase/advisor-baseline.json:1-10 @ b09f79cf83b2
- **oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs** (code · direkte) **[divergens bevaret — se Konflikter]**
  CI-fitness-gaten der håndhæver ALLE mønstrene på lokations-pakken — og fladen hvor pakken skal udvide allowlists (data, ikke kode-logik): (1) dedup-key-or-opt-out: ny CREATE TABLE kræver dedup_key-kolonne ELLER '-- no-dedup-key: <grund>'-kommentar (GRANDFATHERED-settet er lukket). (2) audit-trigger-coverage: hver core_*-tabel kræver stork_audit-trigger ELLER entry i AUDIT_EXEMPT_SNAPSHOT_TABLES (+ hygiejne: stale entries er også rød). (3) truncate-blocked-on-immutable + immutability-trigger-coverage + snapshot-field-protection: immutable lokations-tabeller skal registreres i IMMUTABLE_TABLES_REQUIRE_TRUNCATE_BLOCK/IMMUTABLE_GUARDS. (4) cron-change-reason: cron.schedule-body uden stork.change_reason er rød. (5) migration-set-config-discipline + on-conflict-discipline (BOOTSTRAP_CONFIG_TABLES). (6) LIVE-checks (fail-closed i CI): db-rls-policies (0-policy-tabel kræver '-- default-deny:'-markør), write-policy-session-var-consistency (aktiv anonymization-mapping kræver stork.allow_<tabel>_write-policy), legacy-is-active-readers (r7d), schema-ownership (intet i public), cross-schema-fk-discipline (kun allowlistede mål: employees + auth.users), fk-coverage (hver *_id kræver FK/PK/exemption/FK_PENDING m. selv-udløb), index-per-policy (policy-prædikat-kolonner kræver ledende btree-index), secdef-marker-discipline (hver SECDEF-signatur SKAL stå i SECDEF_SANCTIONED — nye lokations-RPC'er skal tilføjes), app-write-revoke-discipline (ingen app-rolle-DML på core_*), advisor-baseline (nye SECDEF-eksponeringer/0-policy-tabeller skal i baseline-filen i samme PR). (7) DB-test-disciplin: tx-wrap ved INSERT i TX_WRAP-listede tabeller, ingen .sql.disabled, ingen seed-user-fixtures, ingen skip-guards.
  - AFVISER: Ny lokations-tabel uden dedup_key/opt-out → rød
  - AFVISER: uden stork_audit-trigger og uden exemption → rød
  - AFVISER: ny SECDEF-RPC uden SANCTIONED-entry → rød
  - AFVISER: leverandør-FK udeladt → fk-coverage rød
  - AFVISER: select-policy på has_permission uden index-relevans er ok, men prædikat-KOLONNE uden ledende btree-index → rød
  - AFVISER: manglende SUPABASE_ACCESS_TOKEN i CI → live-checks fail-closed røde (aldrig falsk-grøn)
  _evidens:_ scripts/fitness.mjs:25-1837 @ d1b4d601ef27
- **oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: fitness-gaten håndhæver audit-trigger coverage, cron change_reason, cross-schema FK-disciplin, SECURITY DEFINER-sanctionering og forbud mod app-write grants på core_* tabeller. AFVISER: nye lokationstabeller uden audit/allowlist, cron.schedule uden change_reason, *_id uden FK/exemption, usanktioneret SECDEF og direkte core writes.
  - AFVISER: Ny core_identity.locations uden stork_audit-trigger eller allowlist flagges.
  - AFVISER: Ny cron uden set_config(stork.change_reason) flagges.
  - AFVISER: Ny SECURITY DEFINER lokations-RPC skal på sanctioned-listen eller fejler.
  - AFVISER: Authenticated write-grants på core_* flagges.
  _evidens:_ scripts/fitness.mjs:120-1725 @ d1b4d601ef27
- **oid:e767efb8b392a98102f88dd9008d6d6ad6dfb05f:scripts/run-db-tests.mjs** (code · direkte)
  DB-test-runneren: kører hver supabase/tests/**/*.sql som ÉN query via Management API, fail-fast, exit 1 ved fejl (CI-trin db:test). Konvention: DO-blokke der RAISE'r ved assertion-brud; BEGIN/ROLLBACK-wrap ved side-effekter (håndhævet af fitness for TX_WRAP-listede tabeller). Lokations-pakkens smoke/negativ-tests (jf. t10_*-testene som forbillede) afleveres hertil.
  - AFVISER: Test-fil der RAISE'r → rød CI (fail-fast: efterfølgende tests køres ikke)
  - AFVISER: INSERT i listet tabel uden BEGIN/ROLLBACK → fitness-violation
  _evidens:_ scripts/run-db-tests.mjs:1-122 @ e767efb8b392
- **oid:e79ce6eb985c5994cd320398cb9c23f101db8135:scripts/migration-gate.mjs** (code · direkte) **[divergens bevaret — se Konflikter]**
  Klassifikations-gaten (STRICT i CI via MIGRATION_GATE_STRICT=true, ci.yml:102): parser alle CREATE TABLE/ALTER TABLE ADD COLUMN i migrations og kræver at hver (schema,tabel,kolonne) matches af en INSERT INTO data_field_definitions-tuple (public|core_compliance) eller classification.json (tom transitions-fil). Validerer KUN eksistens — værdier er UI-konfigurerbare (Mathias' låste regel).
  - AFVISER: Lokations-migration med ny kolonne uden klassifikations-INSERT i samme PR → '::error Uklassificeret kolonne' → exit 1
  _evidens:_ scripts/migration-gate.mjs:1-250 @ e79ce6eb985c
- **oid:e79ce6eb985c5994cd320398cb9c23f101db8135:scripts/migration-gate.mjs** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: CI-gate parser CREATE/ALTER-kolonner og kræver klassifikationsrow i migrations, når strict mode er slået til. AFVISER: nye lokationstabeller eller lokationskolonner uden data_field_definitions-seed i samme migrationsæt.
  - AFVISER: MIGRATION_GATE_STRICT=true fejler på unclassified create table column.
  - AFVISER: ALTER TABLE ADD COLUMN uden tilsvarende klassifikation flagges.
  _evidens:_ scripts/migration-gate.mjs:1-244 @ e79ce6eb985c
- **oid:ecc23f9767347a90cf0bdee677bebec84c36efbf:scripts/schema-check.sh** (code · skabelon-genbrug)
  Schema-drift-check: diff'er supabase/schema.sql mod 'supabase db dump --linked --schema public' — dækker KUN public-schemaet. Lokations-objekter i core_identity er IKKE dækket af dette drift-check (kendt blind vinkel; typernes drift-check dækker core_* i stedet).
  - AFVISER: Drift i public → CI-fejl m. diff
  - AFVISER: Drift i core_identity → dette check er BLINDT (types:check fanger struktur-drift)
  _evidens:_ scripts/schema-check.sh:1-29 @ ecc23f976734
- **oid:f3012195132643a4f6740884b0723e3487fb07a0:scripts/governance-check.mjs** (code · skabelon-genbrug)
  Dokument-kæde-gaten: structural-chain kræver aktiv-pakke-markør i aktiv-plan.md + <pakke>-krav-og-data.md/-plan.md/-status.md + krydspegninger + IDENTISK '> Denne pakke leverer:'-formålsblok (§3.0 formåls-immutabilitet) på tværs af krav/plan(/rapport). Plus dead-doc-paths/H-ref-integrity m.m. Lokations-pakkens dokumentkæde skal bestå dette for grøn CI.
  - AFVISER: Formåls-streng der afviger mellem krav og plan → violation
  - AFVISER: manglende status-fil for aktiv pakke → violation
  _evidens:_ scripts/governance-check.mjs:273-326 @ f30121951326
- **rls_enabled:core_compliance.anonymization_mappings** (code · direkte)
  ENABLE + FORCE RLS på mapping-konfigurationen; write kun via session-var-policy (RPC-vejen).
  - AFVISER: INSERT/UPDATE uden session-var → afvist
  _evidens:_ supabase/migrations/20260514140000_t6_anonymization_tables.sql:46-47 @ e6206176802a
- **rls_enabled:core_compliance.anonymization_state** (code · direkte) **[divergens bevaret — se Konflikter]**
  ENABLE + FORCE RLS + 0 policies + REVOKE ALL (inkl. authenticated) — kombineret med immutability-triggere er tabellen kun nåelig via SECDEF-INSERT og RPC-læsning.
  - AFVISER: Enhver direkte adgang som app-rolle → permission denied
  - AFVISER: UPDATE/DELETE selv fra SECDEF → P0001 (trigger)
  _evidens:_ supabase/migrations/20260514140000_t6_anonymization_tables.sql:100-104 @ e6206176802a
- **rls_enabled:core_compliance.anonymization_state** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: FORCE RLS på anonymization_state uden app select-policies og med adgang via RPC. AFVISER: direkte liste/læsning af anonymiseringsstate for lokationsentiteter.
  - AFVISER: Authenticated table SELECT på anonymization_state returnerer ikke via policy.
  - AFVISER: Direkte write er både revoked og blokeret af state-triggere.
  _evidens:_ supabase/migrations/20260514140000_t6_anonymization_tables.sql:100-129 @ e6206176802a
- **rls_enabled:core_compliance.anonymization_strategies** (code · direkte)
  ENABLE + FORCE RLS på strategi-registret; writes session-var-gated (stork.allow_strategy_write), lifecycle-triggere ovenpå.
  - AFVISER: Write uden session-var → afvist
  _evidens:_ supabase/migrations/20260515110100_p1a_anonymization_strategies.sql:40-41 @ d69ea57e1c45
- **rls_enabled:core_compliance.audit_log** (code · direkte) **[divergens bevaret — se Konflikter]**
  ENABLE RLS uden FORCE (§1.1-undtagelsen: SECDEF-trigger skal kunne INSERT'e) + 0 policies = default-deny for alle app-roller; al direkte adgang REVOKED. Læsning kun via audit_log_read()-RPC. 0-policy-tilstanden er dokumenteret via advisor-baseline (rls_no_policy) — ny 0-policy-lokations-tabel skal enten have policies eller baseline-entry.
  - AFVISER: SELECT på audit_log som authenticated → permission denied (revoked + ingen policy)
  _evidens:_ supabase/migrations/20260514120003_t1_audit_partitioned.sql:71-76 @ a7ec48847312
- **rls_enabled:core_compliance.audit_log** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: har RLS slået til på audit_log og ingen direkte table-policies; læsning går via audit_log_read med admin-krav. AFVISER: direkte SELECT/WRITE på audit_log for app-roller.
  - AFVISER: Authenticated kan ikke læse audit_log direkte med table select.
  - AFVISER: Ikke-admin kan ikke bruge audit_log_read.
  _evidens:_ supabase/migrations/20260514120003_t1_audit_partitioned.sql:71-76 @ a7ec48847312
- **rls_enabled:core_compliance.cron_heartbeats** (code · direkte) **[divergens bevaret — se Konflikter]**
  ENABLE RLS (ikke FORCE), 0 policies, REVOKE all — heartbeats læses kun via permission-gated RPC'er; cron_heartbeat_record (SECDEF) skriver.
  - AFVISER: Direkte SELECT/INSERT som authenticated → permission denied
  _evidens:_ supabase/migrations/20260514120004_t1_cron_skabelon.sql:38-41 @ de1eb1b3f829
- **rls_enabled:core_compliance.cron_heartbeats** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: cron_heartbeats har RLS og ingen direkte access; læsning går via admin-RPC. AFVISER: direkte observability-læsning eller write af lokationscron-status fra app-session.
  - AFVISER: Authenticated table SELECT på cron_heartbeats gives ikke direkte.
  - AFVISER: Heartbeat updates går via cron_heartbeat_record.
  _evidens:_ supabase/migrations/20260514120004_t1_cron_skabelon.sql:38-42 @ de1eb1b3f829
- **rls_enabled:core_compliance.data_field_definitions** (code · direkte)
  ENABLE + FORCE RLS: selv tabelejerens INVOKER-kontekster går gennem policies. Registret lokations-kolonnerne klassificeres i.
  - AFVISER: Enhver write uden stork.allow_data_field_definitions_write → afvist
  _evidens:_ supabase/migrations/20260514120005_t1_data_field_definitions.sql:105-106 @ fb805b56b827
- **rls_enabled:core_compliance.superadmin_settings** (code · skabelon-genbrug)
  ENABLE + FORCE RLS på singleton-konfig — mønstret cooldown-konfigtabellen arver (select åben, update session-var-gated).
  - AFVISER: UPDATE uden stork.allow_superadmin_settings_write → afvist
  _evidens:_ supabase/migrations/20260514130000_t2_superadmin_floor.sql:32-33 @ d3f3e0e3b416
- **rls_enabled:core_identity.client_field_definitions** (code · skabelon-genbrug)
  ENABLE + FORCE RLS på felt-konfig-registret (mønster for lokations-konfigregistre).
  - AFVISER: Write uden stork.allow_client_field_definitions_write → afvist
  _evidens:_ supabase/migrations/20260521000001_t10_tables.sql:122-123 @ 359c0b2301f3
- **rls_enabled:core_identity.client_node_placements** (code · direkte)
  ENABLE + FORCE RLS på klient-placeringer; select-policy (nuværende: subtree-ACL) filtrerer rækker pr. caller — lokations-pakkens klient-opslag ser kun eget subtree.
  - AFVISER: non-admin uden subtree-dækning → 0 rækker
  _evidens:_ supabase/migrations/20260518000004_t9_client_node_placements.sql:43-44 @ f49e7d5bf248
- **rls_enabled:core_identity.clients** (code · direkte)
  ENABLE + FORCE RLS på klient-masteren (FK-mål for lokations-klient-tilladelser); læsning permission-gated, skrivning session-var-gated (+ post-revoke: kun SECDEF).
  - AFVISER: SELECT uden clients/manage → 0 rækker
  _evidens:_ supabase/migrations/20260521000001_t10_tables.sql:57-58 @ 359c0b2301f3
- **rls_enabled:core_identity.employee_active_config** (code · direkte)
  ENABLE + FORCE RLS på aktiv-definitions-singletonen; select åben (alle skal kunne evaluere aktiv-status), update session-var-gated.
  - AFVISER: UPDATE uden session-var → afvist
  _evidens:_ supabase/migrations/20260514180300_q1_employee_active_config.sql:49-50 @ 776b884b0913
- **rls_enabled:core_identity.employee_node_placements** (code · skabelon-genbrug)
  ENABLE + FORCE RLS på det versionerede placement-mønster (skabelonen for klient-tilladelser pr. lokation); REVOKE all + grant select — writes kun via SECDEF-apply-handlers.
  - AFVISER: Direkte INSERT/UPDATE som authenticated → permission denied (revoked; ingen write-policy)
  _evidens:_ supabase/migrations/20260518000003_t9_employee_node_placements.sql:47-48 @ 179306497852
- **rls_enabled:core_identity.employees** (code · direkte)
  ENABLE + FORCE RLS på medarbejder-masteren — adgangskædens datakilde (has_permission/current_employee_id joiner den) og anonymized_at-mønstrets hjem.
  - AFVISER: SELECT som authenticated ser kun egen række eller kræver is_admin (policy)
  _evidens:_ supabase/migrations/20260514120007_t1_bootstrap_admins.sql:38-39 @ 669539b1e1dc
- **rls_enabled:core_identity.org_node_closure** (code · direkte)
  ENABLE + FORCE RLS på closure (derived); REVOKE all + grant select — kun _org_node_closure_rebuild (SECDEF) skriver; select-policy åben (ACL-helpers er INVOKER og skal kunne læse).
  - AFVISER: Direkte INSERT/DELETE som authenticated → permission denied (revoked; ingen write-policy)
  _evidens:_ supabase/migrations/20260518000002_t9_org_node_closure.sql:27-28 @ 82d21194bff5
- **rls_enabled:core_identity.org_node_versions** (code · direkte)
  ENABLE + FORCE RLS på versions-tabellen (primær mutable lagring); select åben; skrivning kun via SECDEF-apply-handlers.
  - AFVISER: Direkte INSERT som authenticated → permission denied (revoked)
  _evidens:_ supabase/migrations/20260518000001_t9_org_nodes.sql:94-95 @ 71cadac316a6
- **rls_enabled:core_identity.org_nodes** (code · direkte)
  ENABLE + FORCE RLS på identity-tabellen; select åben.
  - AFVISER: Direkte write som authenticated → permission denied
  _evidens:_ supabase/migrations/20260518000001_t9_org_nodes.sql:34-35 @ 71cadac316a6
- **rls_enabled:core_identity.pending_changes** (code · direkte)
  ENABLE + FORCE RLS på fortrydelses-loggen; select-policy afgrænser til requester/admin/eligible-approvers; writes t9_write_authorized-gated.
  - AFVISER: SELECT af andres pending uden eligibility → 0 rækker
  _evidens:_ supabase/migrations/20260518000000_t9_pending_changes.sql:81-82 @ c3b2865c5b72
- **rls_enabled:core_identity.permission_actions** (code · direkte) **[divergens bevaret — se Konflikter]**
  ENABLE + FORCE RLS på permission_actions (permission-element-træet lokations-sider seedes ind i); select åben using(true) — elementstrukturen er metadata; writes t9_write_authorized-gated.
  - AFVISER: INSERT uden stork.t9_write_authorized → policy-afvist (og post-revoke: permission denied uden SECDEF)
  _evidens:_ supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql:39-40 @ 5a09930f3230
- **rls_enabled:core_identity.permission_actions** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: permission_actions har FORCE RLS og select/write policies under t9_write_authorized. AFVISER: direkte skrivning af lokationsaction-konfiguration uden permission action UI-RPC eller migration.
  - AFVISER: INSERT/UPDATE permission_actions uden t9_write_authorized afvises.
  - AFVISER: SELECT er bevidst åben til authenticated via using(true).
  _evidens:_ supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql:39-53 @ 5a09930f3230
- **rls_enabled:core_identity.permission_areas** (code · direkte)
  ENABLE + FORCE RLS på permission_areas (permission-element-træet lokations-sider seedes ind i); select åben using(true) — elementstrukturen er metadata; writes t9_write_authorized-gated.
  - AFVISER: INSERT uden stork.t9_write_authorized → policy-afvist (og post-revoke: permission denied uden SECDEF)
  _evidens:_ supabase/migrations/20260518000005_t9_permission_elements.sql:20-21 @ ec5f8a4e7a46
- **rls_enabled:core_identity.permission_pages** (code · direkte)
  ENABLE + FORCE RLS på permission_pages (permission-element-træet lokations-sider seedes ind i); select åben using(true) — elementstrukturen er metadata; writes t9_write_authorized-gated.
  - AFVISER: INSERT uden stork.t9_write_authorized → policy-afvist (og post-revoke: permission denied uden SECDEF)
  _evidens:_ supabase/migrations/20260518000005_t9_permission_elements.sql:46-47 @ ec5f8a4e7a46
- **rls_enabled:core_identity.permission_tabs** (code · direkte)
  ENABLE + FORCE RLS på permission_tabs (permission-element-træet lokations-sider seedes ind i); select åben using(true) — elementstrukturen er metadata; writes t9_write_authorized-gated.
  - AFVISER: INSERT uden stork.t9_write_authorized → policy-afvist (og post-revoke: permission denied uden SECDEF)
  _evidens:_ supabase/migrations/20260518000005_t9_permission_elements.sql:72-73 @ ec5f8a4e7a46
- **rls_enabled:core_identity.role_page_permissions** (code · skabelon-genbrug)
  ENABLE + FORCE RLS på legacy-permission-tabellen (read-only fallback i has_permission; historiske seeds skriver via session-var).
  - AFVISER: Write uden stork.allow_role_page_permissions_write → afvist
  _evidens:_ supabase/migrations/20260514120007_t1_bootstrap_admins.sql:97-98 @ 669539b1e1dc
- **rls_enabled:core_identity.role_permission_grants** (code · direkte)
  ENABLE + FORCE RLS på grants (adgangs-sandheden); select åben (INVOKER-helpers resolver); writes t9_write_authorized-gated + post-revoke SECDEF-only.
  - AFVISER: Direkte grant-INSERT som authenticated → permission denied
  _evidens:_ supabase/migrations/20260518000006_t9_grants_and_helpers.sql:39-40 @ 05bcc94be0d6
- **rls_enabled:core_identity.roles** (code · direkte)
  ENABLE + FORCE RLS på roller; select åben; writes session-var-gated (allow_roles_write).
  - AFVISER: Write uden session-var → afvist
  _evidens:_ supabase/migrations/20260514120007_t1_bootstrap_admins.sql:61-62 @ 669539b1e1dc
- **rls_enabled:core_identity.undo_settings** (code · direkte)
  ENABLE + FORCE RLS på undo-konfig; select åben; writes t9_write_authorized-gated (undo_setting_update-RPC).
  - AFVISER: Direkte UPDATE uden session-var → afvist
  _evidens:_ supabase/migrations/20260518000000_t9_pending_changes.sql:108-109 @ c3b2865c5b72
- **rls_policy:core_compliance.anonymization_mappings:anonymization_mappings_insert** (code · direkte) **[divergens bevaret — se Konflikter]**
  WITH CHECK stork.allow_anonymization_mappings_write='true' — lokations-mappingen kan kun registreres via RPC/migration.
  - AFVISER: INSERT uden session-var → afvist
  _evidens:_ supabase/migrations/20260514140000_t6_anonymization_tables.sql:55-57 @ e6206176802a
- **rls_policy:core_compliance.anonymization_mappings:anonymization_mappings_insert** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: mapping INSERT kræver stork.allow_anonymization_mappings_write. AFVISER: direkte oprettelse af lokations-anonymiseringsmapping uden lifecycle-RPC.
  - AFVISER: INSERT uden allow-session-var afvises.
  - AFVISER: Mapping med duplicate entity/table natural key afvises af unique constraint.
  _evidens:_ supabase/migrations/20260514140000_t6_anonymization_tables.sql:46-64 @ e6206176802a
- **rls_policy:core_compliance.anonymization_mappings:anonymization_mappings_select** (code · direkte)
  FOR SELECT USING (true) — mapping-konfig er læsbar for authenticated (UI-visning).
  - AFVISER: anon → ingen adgang
  _evidens:_ supabase/migrations/20260514140000_t6_anonymization_tables.sql:52-53 @ e6206176802a
- **rls_policy:core_compliance.anonymization_mappings:anonymization_mappings_update** (code · direkte) **[divergens bevaret — se Konflikter]**
  USING+WITH CHECK samme session-var; lifecycle-trigger håndhæver derudover status-overgange.
  - AFVISER: UPDATE status→active selv MED session-var → 42501 fra lifecycle-trigger (kræver allow_mapping_activate)
  _evidens:_ supabase/migrations/20260514140000_t6_anonymization_tables.sql:59-62 @ e6206176802a
- **rls_policy:core_compliance.anonymization_mappings:anonymization_mappings_update** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: mapping UPDATE kræver samme allow-session-var som lifecycle-RPC. AFVISER: direkte aktivering eller ændring af lokations-field-strategier.
  - AFVISER: UPDATE status=active uden lifecycle-session-var afvises.
  - AFVISER: Direkte ændring af anonymized_check_column afvises.
  _evidens:_ supabase/migrations/20260514140000_t6_anonymization_tables.sql:46-64 @ e6206176802a
- **rls_policy:core_compliance.anonymization_strategies:strategies_delete** (code · direkte) **[divergens bevaret — se Konflikter]**
  USING stork.allow_strategy_write; delete-trigger begrænser DERUDOVER til status='draft'.
  - AFVISER: DELETE af approved/active → P0001 uanset session-var
  _evidens:_ supabase/migrations/20260515110100_p1a_anonymization_strategies.sql:56-58 @ d69ea57e1c45
- **rls_policy:core_compliance.anonymization_strategies:strategies_delete** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: strategy DELETE kræver write-session-var og trigger tillader kun draft. AFVISER: sletning af testede/godkendte/aktive lokationsstrategier.
  - AFVISER: DELETE status=approved afvises.
  - AFVISER: DELETE status=active afvises.
  _evidens:_ supabase/migrations/20260515110100_p1a_anonymization_strategies.sql:162-179 @ d69ea57e1c45
- **rls_policy:core_compliance.anonymization_strategies:strategies_insert** (code · direkte) **[divergens bevaret — se Konflikter]**
  WITH CHECK stork.allow_strategy_write='true'; oveni: validation-trigger (prefix/signatur/volatilitet) + lifecycle (kun draft/approved-i-migration).
  - AFVISER: INSERT uden session-var → afvist
  - AFVISER: INSERT m. session-var men ugyldig funktion → P0001/P0002 fra trigger
  _evidens:_ supabase/migrations/20260515110100_p1a_anonymization_strategies.sql:49-51 @ d69ea57e1c45
- **rls_policy:core_compliance.anonymization_strategies:strategies_insert** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: strategy INSERT kræver stork.allow_strategy_write og lifecycle-triggeren validerer draft/approved-migration. AFVISER: direkte oprettelse af aktive lokationsstrategier.
  - AFVISER: INSERT status=active uden activate-session-var afvises.
  - AFVISER: INSERT med forkert function signature afvises.
  _evidens:_ supabase/migrations/20260515110100_p1a_anonymization_strategies.sql:40-58 @ d69ea57e1c45
- **rls_policy:core_compliance.anonymization_strategies:strategies_select** (code · direkte)
  FOR SELECT USING (true) — strategi-katalog læsbart (UI-vælger).
  - AFVISER: anon → ingen adgang
  _evidens:_ supabase/migrations/20260515110100_p1a_anonymization_strategies.sql:47-48 @ d69ea57e1c45
- **rls_policy:core_compliance.anonymization_strategies:strategies_update** (code · direkte) **[divergens bevaret — se Konflikter]**
  USING+WITH CHECK stork.allow_strategy_write; aktivering kræver DERUDOVER stork.allow_strategy_activate (kun activate-RPC sætter begge).
  - AFVISER: UPDATE→active med kun allow_strategy_write → 42501 fra lifecycle-trigger
  _evidens:_ supabase/migrations/20260515110100_p1a_anonymization_strategies.sql:52-55 @ d69ea57e1c45
- **rls_policy:core_compliance.anonymization_strategies:strategies_update** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: strategy UPDATE kræver stork.allow_strategy_write og lifecycle-regler forhindrer status-regression/deaktivering af active. AFVISER: direkte aktivering eller rollback af lokationsstrategier.
  - AFVISER: UPDATE active->approved afvises.
  - AFVISER: UPDATE tested->draft afvises.
  - AFVISER: UPDATE active uden activation session-var afvises.
  _evidens:_ supabase/migrations/20260515110100_p1a_anonymization_strategies.sql:103-160 @ d69ea57e1c45
- **rls_policy:core_compliance.data_field_definitions:data_field_definitions_delete** (code · direkte) **[divergens bevaret — se Konflikter]**
  USING samme session-var — DELETE kun via data_field_definition_delete-RPC (change_reason-krav).
  - AFVISER: DELETE uden session-var → 0 rækker
  _evidens:_ supabase/migrations/20260514120005_t1_data_field_definitions.sql:123-125 @ fb805b56b827
- **rls_policy:core_compliance.data_field_definitions:data_field_definitions_delete** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: data_field_definitions DELETE kræver session-var og delete-RPCen kræver admin + change_reason. AFVISER: sletning af lokationsklassifikation uden sporbar beslutning.
  - AFVISER: DELETE uden stork.allow_data_field_definitions_write matcher ikke policy.
  - AFVISER: Delete-RPC uden change_reason afvises.
  _evidens:_ supabase/migrations/20260514120005_t1_data_field_definitions.sql:104-130 @ fb805b56b827
- **rls_policy:core_compliance.data_field_definitions:data_field_definitions_insert** (code · direkte) **[divergens bevaret — se Konflikter]**
  WITH CHECK current_setting('stork.allow_data_field_definitions_write',true)='true' — kun RPC/migrations-vejen kan indsætte klassifikationer.
  - AFVISER: INSERT uden session-var → afvist
  _evidens:_ supabase/migrations/20260514120005_t1_data_field_definitions.sql:114-116 @ fb805b56b827
- **rls_policy:core_compliance.data_field_definitions:data_field_definitions_insert** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: data_field_definitions INSERT kræver session-var stork.allow_data_field_definitions_write sat af admin-RPC. AFVISER: direkte klassifikationsoprettelse for lokationskolonner fra app-session.
  - AFVISER: INSERT uden stork.allow_data_field_definitions_write matcher ikke policy.
  - AFVISER: App-kode kan ikke seed klassifikation uden migration/RPC-gate.
  _evidens:_ supabase/migrations/20260514120005_t1_data_field_definitions.sql:104-130 @ fb805b56b827
- **rls_policy:core_compliance.data_field_definitions:data_field_definitions_select** (code · direkte)
  FOR SELECT TO authenticated USING (true) — klassifikations-metadata er åben læsning (ikke PII).
  - AFVISER: anon → ingen adgang (ikke i policy-rollen + revoked)
  _evidens:_ supabase/migrations/20260514120005_t1_data_field_definitions.sql:109-111 @ fb805b56b827
- **rls_policy:core_compliance.data_field_definitions:data_field_definitions_update** (code · direkte) **[divergens bevaret — se Konflikter]**
  USING+WITH CHECK på samme session-var — UPDATE af klassifikationsrækker kun via RPC.
  - AFVISER: UPDATE uden session-var → 0 rækker ramt
  _evidens:_ supabase/migrations/20260514120005_t1_data_field_definitions.sql:118-121 @ fb805b56b827
- **rls_policy:core_compliance.data_field_definitions:data_field_definitions_update** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: data_field_definitions UPDATE kræver samme session-var som upsert-RPCen. AFVISER: direkte ændring af PII/retention for lokationskolonner uden adminspor.
  - AFVISER: UPDATE pii_level direct->none uden RPC/session-var afvises af RLS.
  - AFVISER: UPDATE retention_config direkte gennem table write afvises.
  _evidens:_ supabase/migrations/20260514120005_t1_data_field_definitions.sql:104-130 @ fb805b56b827
- **rls_policy:core_compliance.superadmin_settings:superadmin_settings_select** (code · skabelon-genbrug)
  FOR SELECT USING (true) — singleton-konfig læsbar (mønster for cooldown-konfig).
  - AFVISER: anon → ingen adgang
  _evidens:_ supabase/migrations/20260514130000_t2_superadmin_floor.sql:37-38 @ d3f3e0e3b416
- **rls_policy:core_compliance.superadmin_settings:superadmin_settings_update** (code · skabelon-genbrug)
  USING+WITH CHECK stork.allow_superadmin_settings_write='true' (superadmin_settings_update-RPC'en er bevidst den ENESTE der beholdt is_admin()-gate).
  - AFVISER: UPDATE uden session-var → afvist
  _evidens:_ supabase/migrations/20260514130000_t2_superadmin_floor.sql:40-43 @ d3f3e0e3b416
- **rls_policy:core_identity.client_field_definitions:client_field_definitions_insert** (code · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  WITH CHECK stork.allow_client_field_definitions_write='true'.
  - AFVISER: INSERT uden session-var → afvist
  _evidens:_ supabase/migrations/20260521000001_t10_tables.sql:135-137 @ 359c0b2301f3
- **rls_policy:core_identity.client_field_definitions:client_field_definitions_insert** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: client_field_definitions INSERT kræver stork.allow_client_field_definitions_write. AFVISER: direkte introduktion af nye dynamiske PII-felter fra lokationskode.
  - AFVISER: INSERT uden allow-session-var afvises.
  - AFVISER: key/display_label blank afvises af table checks.
  _evidens:_ supabase/migrations/20260521000001_t10_tables.sql:118-142 @ 359c0b2301f3
- **rls_policy:core_identity.client_field_definitions:client_field_definitions_select** (code · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  FOR SELECT USING has_permission('client_field_definitions','manage',false) — tab-aware.
  - AFVISER: uden grant → 0 rækker
  _evidens:_ supabase/migrations/20260521000001_t10_tables.sql:131-133 @ 359c0b2301f3
- **rls_policy:core_identity.client_field_definitions:client_field_definitions_select** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: client_field_definitions SELECT kræver manage view permission. AFVISER: læsning af dynamisk klientfeltkonfiguration uden klientfelt-rettighed.
  - AFVISER: User uden client_field_definitions/manage/can_view kan ikke selecte definitions.
  - AFVISER: client_field_definitions_list gentager permission gate.
  _evidens:_ supabase/migrations/20260521000001_t10_tables.sql:118-142 @ 359c0b2301f3
- **rls_policy:core_identity.client_field_definitions:client_field_definitions_update** (code · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  USING+WITH CHECK samme var; key/pii-immutabilitet håndhæves i RPC-laget (ikke policy).
  - AFVISER: UPDATE uden session-var → 0 rækker
  _evidens:_ supabase/migrations/20260521000001_t10_tables.sql:139-142 @ 359c0b2301f3
- **rls_policy:core_identity.client_field_definitions:client_field_definitions_update** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: client_field_definitions UPDATE kræver allow-session-var og upsert-RPC forhindrer key-rename samt direct->non-direct downgrade. AFVISER: direkte PII-nedklassificering eller omdøbning.
  - AFVISER: UPDATE pii_level direct->none via RPC afvises.
  - AFVISER: UPDATE key til nyt navn via RPC afvises.
  - AFVISER: Direkte UPDATE uden session-var afvises.
  _evidens:_ supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql:16-130 @ 9d2a0e0470ea
- **rls_policy:core_identity.client_node_placements:client_node_placements_select** (code · direkte) **[divergens bevaret — se Konflikter]**
  NUVÆRENDE version (t9_supplement C2): USING is_admin() OR node_id = ANY(acl_subtree_org_nodes_at(current_employee_id(), coalesce(nullif(stork.t9_read_at_date,'')::date, current_date))) — subtree-scoped læsning m. historisk dato via session-var. Lokations-pakkens klient-opslag arver denne grænse.
  - AFVISER: non-admin uden placement-subtree-dækning → 0 rækker
  - AFVISER: ugyldig dato-streng i t9_read_at_date → cast-fejl (22007) ved evaluering
  _evidens:_ supabase/migrations/20260520000000_t9_supplement.sql:665-680 @ 7e490d5f302f
- **rls_policy:core_identity.client_node_placements:client_node_placements_select** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: final client_node_placements_select tillader admin eller node_id i callers ACL subtree på valgt read-date. AFVISER: lokations-/klientplaceringer udenfor subtree for non-admin.
  - AFVISER: Non-admin uden node i acl_subtree_org_nodes_at kan ikke selecte placeringen.
  - AFVISER: stork.t9_read_at_date styrer date-aware ACL i read-RPCs.
  _evidens:_ supabase/migrations/20260520000000_t9_supplement.sql:667-683 @ 7e490d5f302f
- **rls_policy:core_identity.clients:clients_insert** (code · direkte) **[divergens bevaret — se Konflikter]**
  WITH CHECK stork.allow_clients_write='true' (sættes af client_upsert efter permission+change_reason).
  - AFVISER: INSERT uden session-var → afvist; post-revoke: permission denied allerede ved DML
  _evidens:_ supabase/migrations/20260521000001_t10_tables.sql:73-75 @ 359c0b2301f3
- **rls_policy:core_identity.clients:clients_insert** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: clients INSERT kræver stork.allow_clients_write sat af client_upsert. AFVISER: direkte klientoprettelse fra lokationskode.
  - AFVISER: INSERT uden allow_clients_write afvises.
  - AFVISER: client_upsert uden clients/manage/can_edit eller change_reason afvises.
  _evidens:_ supabase/migrations/20260521000001_t10_tables.sql:69-80 @ 359c0b2301f3
- **rls_policy:core_identity.clients:clients_select** (code · direkte) **[divergens bevaret — se Konflikter]**
  FOR SELECT USING core_identity.has_permission('clients','manage',false) — TAB-AWARE gate direkte i policyen (T10.13 seeder kun tab-grants; null-tab matcher ikke). Skabelonen for lokations-select-policies.
  - AFVISER: Bruger uden clients/manage-grant → 0 rækker (ikke fejl)
  _evidens:_ supabase/migrations/20260521000001_t10_tables.sql:69-71 @ 359c0b2301f3
- **rls_policy:core_identity.clients:clients_select** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: clients SELECT kræver has_permission clients/manage/can_view. AFVISER: læsning af klientgrundlag for lokationsskabelon uden clients manage view.
  - AFVISER: Authenticated uden clients/manage/can_view kan ikke selecte clients.
  - AFVISER: client_get/list RPCs gentager samme permission gate.
  _evidens:_ supabase/migrations/20260521000001_t10_tables.sql:53-80 @ 359c0b2301f3
- **rls_policy:core_identity.clients:clients_update** (code · direkte) **[divergens bevaret — se Konflikter]**
  USING+WITH CHECK samme session-var; BEMÆRK ingen delete-policy overhovedet = DELETE default-deny (is_active-toggle er eneste 'sletning').
  - AFVISER: UPDATE uden session-var → 0 rækker
  - AFVISER: DELETE → altid afvist (ingen policy)
  _evidens:_ supabase/migrations/20260521000001_t10_tables.sql:77-80 @ 359c0b2301f3
- **rls_policy:core_identity.clients:clients_update** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: clients UPDATE kræver stork.allow_clients_write, sat af client_upsert/client_set_active/logo RPCs. AFVISER: direkte ændring af klientnavn, fields, active-status eller logo fra lokationskode.
  - AFVISER: UPDATE is_active direkte afvises.
  - AFVISER: UPDATE fields med ukendt strict key afvises af trigger når strict er sat.
  _evidens:_ supabase/migrations/20260521000001_t10_tables.sql:69-80 @ 359c0b2301f3
- **rls_policy:core_identity.employee_active_config:employee_active_config_select** (code · direkte)
  USING (true) — aktiv-definitionen SKAL være læselig for alle authenticated: is_active_employee_state er SECURITY INVOKER og evalueres i enhver adgangskæde.
  - AFVISER: anon → ingen adgang (og dermed ingen helper-evaluering)
  _evidens:_ supabase/migrations/20260514180300_q1_employee_active_config.sql:55-56 @ 776b884b0913
- **rls_policy:core_identity.employee_active_config:employee_active_config_update** (code · direkte) **[divergens bevaret — se Konflikter]**
  USING+WITH CHECK stork.allow_employee_active_config_write='true' (RPC'en gates af employee_active_config/manage/can_edit + change_reason).
  - AFVISER: UPDATE uden session-var → 0 rækker
  _evidens:_ supabase/migrations/20260514180300_q1_employee_active_config.sql:58-61 @ 776b884b0913
- **rls_policy:core_identity.employee_active_config:employee_active_config_update** (codex · skabelon-genbrug) **[divergens bevaret — se Konflikter]**
  GØR: tillader kun employee_active_config-update når session-var stork.allow_employee_active_config_write er sat af RPCen. AFVISER: direkte UPDATE på aktiv-medarbejder-konfiguration fra almindelig authenticated session.
  - AFVISER: UPDATE core_identity.employee_active_config uden session-var matcher ikke policy.
  - AFVISER: RPCen afviser manglende manage-permission, tom change_reason og negativ grace før session-var sættes.
  _evidens:_ supabase/migrations/20260514180300_q1_employee_active_config.sql:49-63 @ 776b884b0913
- **rls_policy:core_identity.employee_node_placements:employee_node_placements_select** (code · skabelon-genbrug)
  FOR SELECT TO authenticated USING (true) — struktur-metadata bevidst åben (V3-V5-arkitektur); forretningsdata-scope lægges på forretningstabeller. Lokations-KLIENT-tilladelser er forretningsdata og bør IKKE arve denne åbne form (jf. cnp's subtree-policy).
  - AFVISER: anon → ingen adgang (ikke i policy-rollen + revoked)
  _evidens:_ supabase/migrations/20260518000003_t9_employee_node_placements.sql:53-56 @ 179306497852
- **rls_policy:core_identity.employees:employees_insert** (code · skabelon-genbrug)
  WITH CHECK stork.allow_employees_write='true' (t2-mønstret; sættes af employee_upsert/_anonymize_employee_apply).
  - AFVISER: INSERT uden session-var → afvist
  _evidens:_ supabase/migrations/20260514130001_t2_identity_rpcs.sql:17-19 @ 47ad98b3072d
- **rls_policy:core_identity.employees:employees_select** (code · direkte)
  USING (auth_user_id = auth.uid() OR is_admin()) — medarbejdere ser kun sig selv; admin ser alle. Lokations-RPC'er der joiner employees (fx ansvarlig pr. lokation) rammer denne grænse for non-admins.
  - AFVISER: non-admin SELECT af kollega-række → 0 rækker
  _evidens:_ supabase/migrations/20260514120007_t1_bootstrap_admins.sql:44-46 @ 669539b1e1dc
- **rls_policy:core_identity.employees:employees_update** (code · skabelon-genbrug)
  USING+WITH CHECK stork.allow_employees_write='true' — anonymiserings-UPDATEN går også her igennem.
  - AFVISER: UPDATE uden session-var → 0 rækker
  _evidens:_ supabase/migrations/20260514130001_t2_identity_rpcs.sql:21-24 @ 47ad98b3072d
- **rls_policy:core_identity.org_node_closure:org_node_closure_select** (code · direkte) **[divergens bevaret — se Konflikter]**
  USING (true) — closure skal være INVOKER-læsbar for acl_subtree-helpers.
  - AFVISER: anon → ingen adgang
  _evidens:_ supabase/migrations/20260518000002_t9_org_node_closure.sql:33-34 @ 82d21194bff5
- **rls_policy:core_identity.org_node_closure:org_node_closure_select** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: org_node_closure SELECT er using(true), så ACL helpers kan beregne subtree. AFVISER: lokations-ACL uden closure-læsbarhed eller direkte closure-write fra app.
  - AFVISER: Direkte INSERT/UPDATE closure gives ikke til app-roller.
  - AFVISER: Fjernes select-policy, fejler has_permission_action/higher-level ACL afhængigt af RLS.
  _evidens:_ supabase/migrations/20260518000002_t9_org_node_closure.sql:27-34 @ 82d21194bff5
- **rls_policy:core_identity.org_node_versions:org_node_versions_select** (code · direkte) **[divergens bevaret — se Konflikter]**
  USING (true) — hele versionshistorikken læsbar for authenticated; afgrænsning af FORRETNINGSdata sker i read-RPC'er, ikke her.
  - AFVISER: anon → ingen adgang
  _evidens:_ supabase/migrations/20260518000001_t9_org_nodes.sql:100-101 @ 71cadac316a6
- **rls_policy:core_identity.org_node_versions:org_node_versions_select** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: org_node_versions SELECT er using(true), så wrappers/read-RPCs kan validere aktive teams og effective intervals. AFVISER: direkte mutation af historikken fra app-session.
  - AFVISER: Direkte UPDATE org_node_versions afvises af manglende grants/write policy.
  - AFVISER: Lokationsplacering til non-team afvises af versiondata, ikke skjules af RLS.
  _evidens:_ supabase/migrations/20260518000001_t9_org_nodes.sql:43-101 @ 71cadac316a6
- **rls_policy:core_identity.org_nodes:org_nodes_select** (code · direkte) **[divergens bevaret — se Konflikter]**
  USING (true) — org-identiteter åbne (navne/struktur lever i versions).
  - AFVISER: anon → ingen adgang
  _evidens:_ supabase/migrations/20260518000001_t9_org_nodes.sql:40-41 @ 71cadac316a6
- **rls_policy:core_identity.org_nodes:org_nodes_select** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: org_nodes SELECT er using(true), så ACL-beregning og lokationsvalg kan læse strukturens noder. AFVISER: ikke skrivning; write går via pending/RPC og final revokes.
  - AFVISER: Direkte UPDATE org_nodes er ikke givet til authenticated.
  - AFVISER: Lokationsskabelonen kan ikke bruge denne select-policy som write-adgang.
  _evidens:_ supabase/migrations/20260518000001_t9_org_nodes.sql:23-42 @ 71cadac316a6
- **rls_policy:core_identity.pending_changes:pending_changes_insert** (code · direkte) **[divergens bevaret — se Konflikter]**
  WITH CHECK stork.t9_write_authorized='true' — kun wrapper-RPC'er (der satte var efter permission-check) kan skabe pendings.
  - AFVISER: pending_change_request via egen SQL uden var → afvist (og funktion er revoked)
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:49-51 @ 7851d3b19f7b
- **rls_policy:core_identity.pending_changes:pending_changes_insert** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: pending_changes INSERT kræver stork.t9_write_authorized, så kun wrapper/RPC kan oprette lokationsændringsønsker. AFVISER: direkte INSERT i pending_changes fra app-session.
  - AFVISER: Direkte INSERT uden t9_write_authorized matcher ikke policy.
  - AFVISER: Wrapperne skal sætte session-var før pending_change_request.
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:48-93 @ 7851d3b19f7b
- **rls_policy:core_identity.pending_changes:pending_changes_select** (code · direkte) **[divergens bevaret — se Konflikter]**
  NUVÆRENDE version (supplement-2 M3b): requester OR is_admin OR (legacy change_type-grupper + can_edit på siden) OR (action-pendings: has_permission_action + approve-eligibility-spejl for above/superadmin). Nye lokations-change_types er USYNLIGE for godkendere indtil policyen udvides.
  - AFVISER: approver uden can_edit på ressourcesiden → 0 rækker
  - AFVISER: action-grant i sibling-gren → 0 rækker (V15-fix)
  _evidens:_ supabase/migrations/20260521100005_t9_supplement_2_pending_changes_select_policy.sql:19-60 @ 4df2fca6e873
- **rls_policy:core_identity.pending_changes:pending_changes_select** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: final pending_changes_select viser requester/admin, legacy-permissioner eller action-berettigede approvere med higher-level/superadmin-regler. AFVISER: ikke-involverede brugere og sibling-approvere uden action/higher-level adgang.
  - AFVISER: Non-admin uden relevant legacy permission kan ikke se legacy pending row.
  - AFVISER: Action med second_approver_type=above kræver højere niveau end requester.
  _evidens:_ supabase/migrations/20260521100005_t9_supplement_2_pending_changes_select_policy.sql:17-60 @ 4df2fca6e873
- **rls_policy:core_identity.pending_changes:pending_changes_update** (code · direkte) **[divergens bevaret — se Konflikter]**
  USING stork.t9_write_authorized='true' — approve/undo/apply-UPDATE'er kræver var'en (sat af de gated RPC'er).
  - AFVISER: Direkte status-UPDATE uden var → 0 rækker
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:53-55 @ 7851d3b19f7b
- **rls_policy:core_identity.pending_changes:pending_changes_update** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: pending_changes UPDATE kræver stork.t9_write_authorized, brugt af approve/undo/apply. AFVISER: direkte status-skift til approved/applied/undone.
  - AFVISER: UPDATE status=approved uden session-var afvises.
  - AFVISER: UPDATE undo_deadline direkte fra app afvises.
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:48-93 @ 7851d3b19f7b
- **rls_policy:core_identity.permission_actions:permission_actions_insert** (code · direkte) **[divergens bevaret — se Konflikter]**
  WITH CHECK stork.t9_write_authorized='true'; kode-låste flag kan KUN sættes i migration-seed (RPC'en eksponerer dem ikke).
  - AFVISER: INSERT uden var → afvist
  _evidens:_ supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql:47-49 @ 5a09930f3230
- **rls_policy:core_identity.permission_actions:permission_actions_insert** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: permission_actions INSERT kræver t9_write_authorized. AFVISER: direkte oprettelse af lokationsaction fra klientkode.
  - AFVISER: INSERT action uden session-var afvises.
  - AFVISER: Action uden tab_id afvises af NOT NULL/FK.
  _evidens:_ supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql:39-53 @ 5a09930f3230
- **rls_policy:core_identity.permission_actions:permission_actions_select** (code · direkte)
  USING (true) — actions er UI-metadata; flag-semantikken (kode-låst) vogtes i RPC-laget.
  - AFVISER: anon → ingen adgang
  _evidens:_ supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql:45-46 @ 5a09930f3230
- **rls_policy:core_identity.permission_actions:permission_actions_update** (code · direkte) **[divergens bevaret — se Konflikter]**
  USING stork.t9_write_authorized='true'.
  - AFVISER: UPDATE uden var → 0 rækker
  _evidens:_ supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql:50-52 @ 5a09930f3230
- **rls_policy:core_identity.permission_actions:permission_actions_update** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: permission_actions UPDATE kræver t9_write_authorized, mens UI-RPC kun må redigere begrænsede felter. AFVISER: direkte manipulation af requires_second_approver/has_undo/bypass_tab_write for lokationsactions.
  - AFVISER: UPDATE requires_second_approver direkte fra app afvises.
  - AFVISER: permission_action_set_approver_type afviser type udenfor above/superadmin og action uden second approver.
  _evidens:_ supabase/migrations/20260521100007_t9_supplement_2_ui_rpcs.sql:57-140 @ 3df4807f5d7b
- **rls_policy:core_identity.permission_areas:permission_areas_insert** (code · direkte) **[divergens bevaret — se Konflikter]**
  WITH CHECK stork.t9_write_authorized='true' (fundament-supplement).
  - AFVISER: INSERT uden var → afvist
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:95-97 @ 7851d3b19f7b
- **rls_policy:core_identity.permission_areas:permission_areas_insert** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: permission_areas INSERT er lukket bag stork.t9_write_authorized efter supplementet. AFVISER: direkte oprettelse af lokations-area uden permission RPC/migration session.
  - AFVISER: INSERT permission_areas uden t9_write_authorized afvises.
  - AFVISER: Seed-migrationer skal sætte session-var.
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:48-137 @ 7851d3b19f7b
- **rls_policy:core_identity.permission_areas:permission_areas_select** (code · direkte)
  USING (true) — element-træet er UI-metadata.
  - AFVISER: anon → ingen adgang
  _evidens:_ supabase/migrations/20260518000005_t9_permission_elements.sql:24-25 @ ec5f8a4e7a46
- **rls_policy:core_identity.permission_areas:permission_areas_update** (code · direkte)
  USING stork.t9_write_authorized='true'.
  - AFVISER: UPDATE uden var → 0 rækker
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:99-101 @ 7851d3b19f7b
- **rls_policy:core_identity.permission_pages:permission_pages_insert** (code · direkte) **[divergens bevaret — se Konflikter]**
  WITH CHECK stork.t9_write_authorized='true' — lokations-page-seeds skal sætte var'en.
  - AFVISER: Seed uden var → afvist
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:104-106 @ 7851d3b19f7b
- **rls_policy:core_identity.permission_pages:permission_pages_insert** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: permission_pages INSERT kræver t9_write_authorized. AFVISER: direkte oprettelse af lokations-page uden godkendt seed/RPC.
  - AFVISER: INSERT page uden session-var afvises.
  - AFVISER: Duplicate (area_id,name) afvises.
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:48-137 @ 7851d3b19f7b
- **rls_policy:core_identity.permission_pages:permission_pages_select** (code · direkte)
  USING (true).
  - AFVISER: anon → ingen adgang
  _evidens:_ supabase/migrations/20260518000005_t9_permission_elements.sql:50-51 @ ec5f8a4e7a46
- **rls_policy:core_identity.permission_pages:permission_pages_update** (code · direkte)
  USING stork.t9_write_authorized='true'.
  - AFVISER: UPDATE uden var → 0 rækker
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:108-110 @ 7851d3b19f7b
- **rls_policy:core_identity.permission_tabs:permission_tabs_insert** (code · direkte) **[divergens bevaret — se Konflikter]**
  WITH CHECK stork.t9_write_authorized='true'.
  - AFVISER: Seed uden var → afvist
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:113-115 @ 7851d3b19f7b
- **rls_policy:core_identity.permission_tabs:permission_tabs_insert** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: permission_tabs INSERT kræver t9_write_authorized. AFVISER: direkte oprettelse af lokations-manage/action tabs uden godkendt session.
  - AFVISER: INSERT tab uden session-var afvises.
  - AFVISER: Tab uden valid page_id afvises af FK.
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:48-137 @ 7851d3b19f7b
- **rls_policy:core_identity.permission_tabs:permission_tabs_select** (code · direkte)
  USING (true).
  - AFVISER: anon → ingen adgang
  _evidens:_ supabase/migrations/20260518000005_t9_permission_elements.sql:76-77 @ ec5f8a4e7a46
- **rls_policy:core_identity.permission_tabs:permission_tabs_update** (code · direkte)
  USING stork.t9_write_authorized='true'.
  - AFVISER: UPDATE uden var → 0 rækker
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:117-119 @ 7851d3b19f7b
- **rls_policy:core_identity.role_page_permissions:role_page_permissions_delete** (code · skabelon-genbrug)
  USING samme var; floor-trigger vogter admin-permission-rækker.
  - AFVISER: DELETE af system/manage-rækken → P0001 floor
  _evidens:_ supabase/migrations/20260514130001_t2_identity_rpcs.sql:52-54 @ 47ad98b3072d
- **rls_policy:core_identity.role_page_permissions:role_page_permissions_insert** (code · skabelon-genbrug)
  WITH CHECK stork.allow_role_page_permissions_write='true' (kun migrations-seeds bruger den nu; legacy-upsert-RPC revoked).
  - AFVISER: INSERT uden var → afvist
  _evidens:_ supabase/migrations/20260514130001_t2_identity_rpcs.sql:43-45 @ 47ad98b3072d
- **rls_policy:core_identity.role_page_permissions:role_page_permissions_select** (code · skabelon-genbrug)
  USING (true) — legacy-permission-rækker læsbare (has_permission-fallback er INVOKER).
  - AFVISER: anon → ingen adgang (ikke i policy-rollen + revoked)
  _evidens:_ supabase/migrations/20260514120007_t1_bootstrap_admins.sql:103-105 @ 669539b1e1dc
- **rls_policy:core_identity.role_page_permissions:role_page_permissions_update** (code · skabelon-genbrug)
  USING+WITH CHECK samme var.
  - AFVISER: UPDATE uden var → 0 rækker
  _evidens:_ supabase/migrations/20260514130001_t2_identity_rpcs.sql:47-50 @ 47ad98b3072d
- **rls_policy:core_identity.role_permission_grants:role_permission_grants_delete** (code · direkte)
  USING stork.t9_write_authorized='true' — ENESTE T9-tabel med delete-policy (grant_remove udfører reel DELETE).
  - AFVISER: DELETE uden var → 0 rækker
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:135-137 @ 7851d3b19f7b
- **rls_policy:core_identity.role_permission_grants:role_permission_grants_insert** (code · direkte) **[divergens bevaret — se Konflikter]**
  WITH CHECK stork.t9_write_authorized='true' (grant_set-RPC + seeds).
  - AFVISER: INSERT uden var → afvist
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:127-129 @ 7851d3b19f7b
- **rls_policy:core_identity.role_permission_grants:role_permission_grants_insert** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: role_permission_grants INSERT kræver t9_write_authorized og table CHECK kræver præcis ét grant-element. AFVISER: direkte tildeling af lokationsrettigheder eller grants på flere elementniveauer.
  - AFVISER: INSERT grant uden session-var afvises.
  - AFVISER: Grant med både tab_id og action_id afvises efter supplementets exact-one check.
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:48-137 @ 7851d3b19f7b
- **rls_policy:core_identity.role_permission_grants:role_permission_grants_select** (code · direkte)
  USING (true) — grants læsbare (resolve er INVOKER).
  - AFVISER: anon → ingen adgang
  _evidens:_ supabase/migrations/20260518000006_t9_grants_and_helpers.sql:43-44 @ 05bcc94be0d6
- **rls_policy:core_identity.role_permission_grants:role_permission_grants_update** (code · direkte) **[divergens bevaret — se Konflikter]**
  USING stork.t9_write_authorized='true'.
  - AFVISER: UPDATE uden var → 0 rækker
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:131-133 @ 7851d3b19f7b
- **rls_policy:core_identity.role_permission_grants:role_permission_grants_update** (codex · direkte) **[divergens bevaret — se Konflikter]**
  GØR: role_permission_grants UPDATE kræver t9_write_authorized. AFVISER: direkte ændring af can_access/can_write/visibility for lokationsroller.
  - AFVISER: UPDATE can_write=true uden session-var afvises.
  - AFVISER: UPDATE visibility all uden RPC afvises.
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:48-137 @ 7851d3b19f7b
- **rls_policy:core_identity.roles:roles_delete** (code · direkte)
  USING stork.allow_roles_write='true'; enforce_admin_floor-AFTER-trigger blokerer derudover DELETE der bringer admins under floor.
  - AFVISER: DELETE af superadmin-rollen → P0001 fra floor-trigger (efter policy-pass)
  _evidens:_ supabase/migrations/20260514130001_t2_identity_rpcs.sql:37-39 @ 47ad98b3072d
- **rls_policy:core_identity.roles:roles_insert** (code · direkte)
  WITH CHECK stork.allow_roles_write='true'.
  - AFVISER: INSERT uden var → afvist
  _evidens:_ supabase/migrations/20260514130001_t2_identity_rpcs.sql:28-30 @ 47ad98b3072d
- **rls_policy:core_identity.roles:roles_select** (code · direkte)
  USING (true) — rollekatalog åbent (navne, ikke rettigheder).
  - AFVISER: anon → ingen adgang
  _evidens:_ supabase/migrations/20260514120007_t1_bootstrap_admins.sql:67-69 @ 669539b1e1dc
- **rls_policy:core_identity.roles:roles_update** (code · direkte)
  USING+WITH CHECK stork.allow_roles_write='true'.
  - AFVISER: UPDATE uden var → 0 rækker
  _evidens:_ supabase/migrations/20260514130001_t2_identity_rpcs.sql:32-35 @ 47ad98b3072d
- **rls_policy:core_identity.undo_settings:undo_settings_insert** (code · direkte)
  WITH CHECK stork.t9_write_authorized='true' (undo_setting_update-RPC).
  - AFVISER: INSERT uden var → afvist
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:86-88 @ 7851d3b19f7b
- **rls_policy:core_identity.undo_settings:undo_settings_select** (code · direkte)
  USING (true) — undo-perioder læsbare (UI viser fortrydelsesfrist).
  - AFVISER: anon → ingen adgang
  _evidens:_ supabase/migrations/20260518000000_t9_pending_changes.sql:114-116 @ c3b2865c5b72
- **rls_policy:core_identity.undo_settings:undo_settings_update** (code · direkte)
  USING stork.t9_write_authorized='true'.
  - AFVISER: UPDATE uden var → 0 rækker
  _evidens:_ supabase/migrations/20260518100000_t9_fundament_supplement.sql:90-92 @ 7851d3b19f7b

## Bøtte 2 — dokument ("dok y siger — korrekt?")

- **doc:docs/strategi/forretningsforstaaelse.md#12:rettigheder-form** (claude-ai · Rettigheds-form for lokations-handlinger)
  Rettigheder defineres pr. side og pr. handling i UI; synlighed adskilles fra handling; permission-gating via has_permission-modellen (tre-niveau + to akser, rettelse 35). Lokations-handlingerne (status-RPC, cooldown-redigering, tilladelses-administration, leverandør-administration) skal gates ad denne vej.
  - AFVISER: Forbyder hardkodede roller for lokations-administration (superadmin er eneste hardkodede undtagelse); forbyder at samme permission implicit giver både læse- og skrive-adgang (synlighed ≠ handling); forbyder lokations-særskilt rettigheds-mekanisme uden om den fælles model.
  _evidens:_ "Stork skal kunne adskille synlighed (hvad ses) fra handling (hvad må ændres)" — forretningsforstaaelse.md §12. + Appendix A Adgang: "Permission-model | Tre-niveau (Område → Page → Tab) + to akser". NB: de KONKRETE tildelinger er intet-data — se separat fund.
- **doc:docs/strategi/forretningsforstaaelse.md#14-fm-grenen:klient-tilladelses-kontrol** (claude-ai · Klient-tilladelse pr. lokation (kernenegativ for hele pakken))
  Systemet skal kunne kontrollere at en klient kun sælges på lokationer hvor der er tilladelse — tilladelsen er en dato-afgrænset, versioneret kendsgerning systemet håndhæver, ikke en konvention.
  - AFVISER: Forbyder booking/salg af en klient på en lokation uden gyldig tilladelse på den relevante dato; forbyder at tilladelses-kontrollen ligger som manuel disciplin/UI-konvention i stedet for håndhævet validering i skrive-vejen.
  _evidens:_ "Stork skal kunne kontrollere at en klient kun sælges på lokationer hvor der er tilladelse" — forretningsforstaaelse.md §14 FM-grenen.
- **doc:docs/strategi/forretningsforstaaelse.md#14-fm-grenen:lokation-som-master-data** (claude-ai · Lokation som master-data (FM-grenens fundament))
  Fysiske lokationer skal planlægges som master-data på linje med klient og medarbejder — en selvstændig, central entitet med eget liv, ikke et attribut på noget andet.
  - AFVISER: Forbyder lokation som fritekst/ad-hoc-felt på en booking; forbyder at lokationsdata opstår spredt pr. booking i stedet for i én master-data-kilde (vision: én autoritativ kilde pr. fakta); forbyder et parallelt FM-univers med egen lokations-model.
  _evidens:_ "Stork skal kunne planlægge fysiske lokationer som master-data på linje med klient og medarbejder" — forretningsforstaaelse.md §14 FM-grenen. Understøttet af master-plan §1.12: "Lokationer er master-data på linje med klienter og medarbejdere."
- **doc:docs/strategi/forretningsforstaaelse.md#15+master-plan-0.5:migration** (claude-ai · Migration af lokations-historik (betinget leverance))
  Migration er separat beslutning pr. pakke; hvis relevant leveres udtræks-SQL (+ upload-script, discovery hvor relevant) efter §0.5-mekanikken: direkte udtræk + upload, audit med source_type='migration' + change_reason='legacy_import_t0'. Lokation er kategori 3 master-data (discovery-fase, direkte upload til core_identity).
  - AFVISER: Forbyder ETL-pipeline, sync-job, adapter-dobbelt-skriv og staging-schema; forbyder at arve 1.0's lokations-antagelser i 2.0's design (greenfield: design afgøres ud fra vision og principper, ikke 'hvordan gør 1.0 det?'); forbyder migration-upload uden migrations-audit-spor.
  _evidens:_ "Migration sker via direkte udtræk + upload, IKKE via ETL-pipeline eller adapter-dobbelt-skriv." — master-plan §0.5. + forretningsforstaaelse.md §15: "Stork 2.0 skal kunne tage migration som separat beslutning pr. pakke, ikke som automatisk leverance". + §4 trin 10b: "hvis relevant".
- **doc:docs/strategi/stork-2-0-master-plan.md#1.12+appendix-a-fm:cooldown-pr-lokation** (claude-ai · Cooldown-dimensionen (låst afgørelse))
  Cooldown konfigureres pr. lokation — i konfig-tabel, UI-redigerbar. Nedstrøms (trin 24) tjekker cooldown-trigger at samme lokation ikke overlapper med tidligere booking inden for konfigureret cooldown.
  - AFVISER: Forbyder cooldown modelleret pr. klient eller pr. kampagne (eksplicit fravalgt, låst afgørelse); forbyder hardkodede cooldown-værdier i kode (skal være UI-redigerbar data, vision-princip 3); forbyder cooldown-regler der kun lever i UI-laget uden autoritativ konfig-kilde.
  _evidens:_ "**Cooldown pr. lokation** (ikke pr. klient eller kampagne — afgørelse fra rettelse 17). Konfig-tabel, UI-redigerbar." — master-plan §1.12. Låst i Appendix A FM-domæne: "Cooldown | Pr. lokation (ikke pr. klient/kampagne)". NB: se usikkerhed om rettelse-17-nummereringen.
- **doc:docs/strategi/stork-2-0-master-plan.md#1.12:klient-tilladelser-form** (claude-ai · Klient-tilladelsers datamæssige form og håndhævelsespunkt)
  Separat relations-tabel klient × lokation × from_date × to_date, versioneret; booking-RPC (nedstrøms, trin 24) validerer at klient er tilladt på lokation på booking-datoen — skabelonen skal levere tabellen og opslags-fladen.
  - AFVISER: Forbyder tilladelse som flag/jsonb på lokations- eller klient-rækken (skal være separat relations-tabel); forbyder destruktiv redigering af historiske tilladelses-versioner (versioneret = fortid skrives ikke om); forbyder tilladelses-model uden dato-interval (tilladelse er tidsafgrænset, ikke evig binær).
  _evidens:_ "Separat relations-tabel: klient × lokation × from_date × to_date. Versioneret" + "Booking-RPC validerer at klient er tilladt på lokation på booking-dato" — master-plan §1.12 Klient-tilladelser pr. lokation.
- **doc:docs/strategi/stork-2-0-master-plan.md#1.12:leverandoerer** (claude-ai · Leverandører som egen master-data-entitet)
  Leverandør er egen master-data-entitet, separat fra lokation; lokation har leverandør-FK; leverandør-type-felt kategoriserer (kæde/enkelt-butik/messe-operatør/andet) og styrer rabataftale-lookup nedstrøms (trin 29).
  - AFVISER: Forbyder leverandør-data indlejret i lokations-tabellen; forbyder leverandør som fritekst-navn (samme leverandør må ikke kunne optræde som flere stave-varianter — én-sandheds-princippet); forbyder type-løs leverandør (typen er forretningsbærende: den styrer rabataftale-lookup).
  _evidens:_ "Egen master-data-entitet (separat fra lokation). Lokation har leverandør-FK" + "Leverandør-type-felt kategoriserer (kæde / enkelt-butik / messe-operatør / andet) — styrer rabataftale-lookup" — master-plan §1.12 Leverandører.
- **doc:docs/strategi/stork-2-0-master-plan.md#1.12:lokations-entitet-felter** (claude-ai · Lokations-entitetens forretningsindhold)
  Pr. lokation: navn, adresse, default-dagspris, leverandør-FK, type (butik/messe/marked/event/andet), status (livscyklus), cooldown-konfiguration jsonb, anonymized_at. Type-enum'en er doc-fastlagt (i modsætning til status-enum'en som er åben).
  - AFVISER: Forbyder at udelade et af de otte doc-fastlagte felter; forbyder leverandør som fritekst (skal være FK til leverandør-entitet); forbyder type-værdier uden for den fastlagte liste uden ny Mathias-beslutning; forbyder pris-data uden lokations-anker.
  _evidens:_ "Pr. lokation: navn, adresse, default-dagspris, leverandør-FK, type (butik / messe / marked / event / andet), status (livscyklus), cooldown-konfiguration jsonb, anonymized_at" — master-plan §1.12 Lokations-entitet.
- **doc:docs/strategi/stork-2-0-master-plan.md#1.12:placement-hierarki-og-pris-arv** (claude-ai · Lokation/placement-hierarki i samme tabel + pris-arv + cycle-detection)
  Selv-refererende parent_location_id; top-niveau lokation kan have placements (stand-positioner) under sig; samme tabel håndterer begge; placement bærer egen pris hvis sat, ellers arves fra parent; cycle-detection-trigger via rekursiv CTE.
  - AFVISER: Forbyder to parallelle tabeller for lokation og placement (én-sandheds-princippet); forbyder cykler i hierarkiet (en lokation må aldrig være sin egen — direkte eller transitive — parent); forbyder placement uden pris-opløsning (enten egen pris eller entydig arv fra parent); forbyder pris-kopiering der bryder arven (to sandheder om samme pris).
  _evidens:_ "Selv-refererende `parent_location_id` — top-niveau lokation kan have placements (stand-positioner) under sig. Samme tabel håndterer både lokation og placement" + "Placement-niveau bærer egen pris hvis sat (ellers arves fra parent-lokation)" + "Cycle-detection-trigger via rekursiv CTE" — master-plan §1.12.
- **doc:docs/strategi/stork-2-0-master-plan.md#1.12:status-livscyklus** (claude-ai · Lokations-status som første-klasses livscyklus (den doc-låste del))
  Status-overgange sker via dedikeret RPC og auditeres med årsag; bookings kan kun oprettes på aktiv lokation (håndhævet regel nedstrøms-forbrugerne bygger på).
  - AFVISER: Forbyder direkte status-UPDATE uden om RPC'en; forbyder status-ændring uden angivet årsag i audit; forbyder at booking-oprettelse på ikke-aktiv lokation kan lykkes; forbyder status-ændring ved overskrivning uden historik (vision-princip 9).
  _evidens:_ "Overgange via dedikeret RPC. Auditeres med årsag" + "Bookings kan kun oprettes på aktiv lokation" — master-plan §1.12 Lokations-status som første-klasses livscyklus.
- **doc:docs/strategi/stork-2-0-master-plan.md#1.1:adgangs-moenster** (claude-ai · Adgangs-mønster for alle nye lokations-tabeller)
  FORCE RLS som default pr. tabel, default deny; skrivning udelukkende via sanktionerede RPC'er (session-var-mønster); direkte tabel-rettigheder revoked; policy-prædikat-kolonner indexeret; smoke-test pr. rolle pr. tabel.
  - AFVISER: Forbyder direkte INSERT/UPDATE/DELETE på lokations-, tilladelses-, cooldown- og leverandør-tabeller uden om RPC; forbyder SECURITY DEFINER uden has_permission-gate og sanktions-markør (skjult RLS-bypass); forbyder adgangs-sandhed i app-laget i stedet for databasen.
  _evidens:_ "FORCE RLS som default pr. tabel. Default deny. Adgangs-sandheden lever i databasen, ikke i appen." — master-plan §1.1 Adgangs-mekanik.
- **doc:docs/strategi/stork-2-0-master-plan.md#1.2:klassifikations-pligt** (claude-ai · Klassifikations-pligt for alle nye kolonner)
  Hver ny kolonne (lokation, placement, tilladelse, cooldown-konfig, leverandør) skal have registry-indgang: kategori, PII-niveau, retention-type; migration-gate blokerer PR ved ny kolonne uden indgang.
  - AFVISER: Forbyder nye kolonner uden eksplicit klassifikation; forbyder implicit PII-/retention-antagelse (default = intet: ingen PII, ingen retention, ingen anonymisering medmindre aktivt valgt — vision-princip 4).
  _evidens:_ "Migration-gate blokerer PR ved ny kolonne uden registry-indgang" — master-plan §1.2 Klassifikations-registry. + vision-og-principper.md princip 4: "Ingen PII, ingen retention, ingen anonymisering, ingen audit-opgradering medmindre det aktivt vælges i UI."
- **doc:docs/strategi/stork-2-0-master-plan.md#1.3:audit-pligt** (claude-ai · Audit-pligt på alle lokations-mutationer)
  Per-row audit som default på alle mutable lokations-tabeller (universel audit-trigger); status-overgange auditeres med årsag; audit er append-only og immutable.
  - AFVISER: Forbyder mutation af lokation/tilladelse/cooldown/leverandør uden audit-spor; forbyder at nogen lokations-tabel optages i snapshot-audit-undtagelsen (undtagelsen er en statisk allowlist for computational byproducts — lokations-data er forretnings-mutationer); forbyder ændring/sletning af audit-rækker.
  _evidens:_ "Én universel audit-tabel — append-only, immutable" + "Universel audit-trigger attaches pr. mutable tabel, bortset fra eksplicitte audit-undtagelser nedenfor" — master-plan §1.3 Audit-mønster. + vision-og-principper.md princip 6: "Per-row audit som default."
- **doc:docs/strategi/stork-2-0-master-plan.md#1.4:anonymisering-af-lokation** (claude-ai · Anonymiserings-mønster (lokationen har anonymized_at))
  Anonymisering = UPDATE, ikke DELETE; master-row bevares evigt; anonymized_at sættes; felt-listen pr. entitet er deklareret data (anonymiserings-mapping), ikke hardkodet; anonymization_state er autoritativ kilde med replay efter restore.
  - AFVISER: Forbyder DELETE som anonymiserings-mekanisme (audit-FK'er må aldrig orphan'e); forbyder hardkodet felt-liste for hvad der anonymiseres på lokationen; forbyder anonymisering uden om anonymize_<entity>-RPC-vejen. NB: HVAD der er personhenførbart på en lokation er intet-data — se separat fund.
  _evidens:_ "Anonymisering = UPDATE, ikke DELETE. Audit-FK'er må aldrig orphan'e." — master-plan §1.4. + §1.12 lokations-entitet inkluderer "anonymized_at".
- **doc:docs/strategi/stork-2-0-master-plan.md#1.8:klient-reference-kontrast** (claude-ai · Klient-referencen i tilladelses-tabellen (FK-mål + anonymiserings-kontrast))
  Klienten lever i core_identity.clients med is_active-livscyklus; klient-tilladelser refererer denne entitet via FK (sammenkobling eksplicit — FK-constraints obligatoriske). Klient anonymiseres ikke — lokationen HAR anonymized_at; de to entiteter har altså bevidst forskellig anonymiserings-profil.
  - AFVISER: Forbyder klient-reference som navn/fritekst i tilladelses-tabellen (skal være FK); forbyder at kopiere klient-skabelonens 'anonymiseres ikke'-valg til lokationen uden Mathias-afgørelse (docs siger eksplicit anonymized_at på lokation).
  _evidens:_ "Klient anonymiseres ikke (mathias-afgoerelser 2026-05-20 \"Trin 10 forretnings-ramme\")" — master-plan §1.8. + vision-og-principper.md bærende princip 3: "FK-constraints er obligatoriske mellem relaterede entiteter."
- **doc:docs/strategi/stork-2-0-master-plan.md#2.7.1:attribution-ikke-via-lokation** (claude-ai · Attribution — lokationen er IKKE en attributions-dimension)
  Salg fra booking attribueres via klientens team på salgs-tidspunktet — samme regel som al anden salgs-attribution. Lokationen knytter kun det fysiske sted; klienten forbliver dimensionen.
  - AFVISER: Forbyder at lokations-skabelonen indfører lokations-baseret attribution, provision eller team-kobling (attribution går via klient, aldrig via lokation eller sælgers team — forretningsforstaaelse §3); forbyder lokations-ejerskab som skygge-dimension for økonomi.
  _evidens:_ "Salg fra booking attribueres via klientens team på salgs-tidspunktet — samme regel som al anden salgs-attribution" — master-plan §2.7.1 Booking-attribution. + forretningsforstaaelse.md §3: "Stork skal kunne afgøre team-attribution via klienten, ikke via sælgerens nuværende team".
- **doc:docs/strategi/stork-2-0-master-plan.md#2.7.8:markeder-messer-ingen-saermodel** (claude-ai · Markeder/messer som type-værdi, ikke særmodel)
  Messe og marked er type-værdier på lokationen; UI filtrerer på type; booking-flow er identisk uanset lokations-type.
  - AFVISER: Forbyder separat messe-/markeds-entitet eller -tabel; forbyder type-specifik mekanik i skabelonen (forskellige regler pr. lokations-type er ikke doc-hjemlet).
  _evidens:_ "Ikke en særmodel. Type-felt på lokation: messe eller marked blandt mulige værdier. UI filtrerer på type. Booking-flow er identisk uanset lokations-type." — master-plan §2.7.8. Låst i Appendix A FM-domæne: "Markeder/messer | Type-felt på lokation, ikke særmodel".
- **doc:docs/strategi/stork-2-0-master-plan.md#2.7:nedstroems-baereevne** (claude-ai · Nedstrøms-forbrugere skabelonen skal kunne bære (trin 24-29))
  Bookinger (§2.7.1: klient-tilladelse valideres, cooldown-trigger pr. lokation, bookings kun på aktiv lokation), booking-assignments (§2.7.2), hotel (§2.7.3), køretøj/mileage (§2.7.4), leverandør-fakturering (§2.7.6: rabataftale-trapper på leverandør + per-lokation undtagelses-tabel lokation × leverandør × max_discount × excluded × from_date × to_date) hænger alle på lokationen. Skabelonens opslags-flader (aktiv-status, tilladelses-opslag pr. dato, cooldown-konfig, leverandør-type) skal kunne forbruges af disse trin uden om-design.
  - AFVISER: Forbyder skabelon-design der blokerer en kendt nedstrøms-forbruger (fx status-model uden entydigt 'aktiv'-begreb til booking-gate, cooldown-konfig der ikke kan evalueres pr. lokation, leverandør uden type til rabat-lookup, lokations-nøgle der ikke kan indgå i undtagelses-tabellen); forbyder at flytte nedstrøms-beslutninger (booking-livscyklus, assignment-status m.fl. — Appendix B: afgøres ved trin 24-27) ind i denne pakke.
  _evidens:_ "Bookinger, hotel-tildelinger, køretøjs-tildelinger og leverandør-fakturering hænger på lokationen." — master-plan §1.12 intro. + §2.7.1: "Cooldown-trigger tjekker at samme lokation ikke overlapper med tidligere booking inden for konfigureret cooldown (pr. lokation)" + §2.7.6: "Relations-tabel: lokation × leverandør × max_discount × excluded × from_date × to_date".
- **doc:docs/strategi/stork-2-0-master-plan.md#4-trin-10b:scope-og-schema** (claude-ai · Pakkens scope-afgrænsning og schema-placering)
  Trin 10b leverer: lokationer + placements + leverandører + klient-tilladelser + status + cooldown, i schema core_identity, plus migration: udtræks-SQL for lokations-historik hvis relevant. §1.11 placerer 'lokationer' eksplicit i core_identity.
  - AFVISER: Forbyder at bygge nedstrøms-funktionalitet i denne pakke (bookinger, assignments, hotel, køretøj, leverandør-fakturering er trin 24-29 — skabelonen skal BÆRE dem, ikke bygge dem); forbyder placering af lokations-entiteterne i andet schema end core_identity; forbyder at droppe migration-leverancen uden eksplicit 'ikke relevant'-afgørelse.
  _evidens:_ "Lokations-skabelon (lokationer + placements + leverandører + klient-tilladelser + status + cooldown) + migration: udtræks-SQL for lokations-historik hvis relevant | core_identity" — master-plan §4 trin 10b. + §1.11: "core_identity — \"hvem og hvor\": medarbejdere, identitets-master, org-træ, teams, klient-team, roller, permissions, klienter, lokationer, vehicle-registry".
- **doc:docs/strategi/stork-2-0-master-plan.md#appendix-a-fm:alt-med** (claude-ai · FM-scope-låsning (ingen udskydelser))
  FM er fuldt med i Stork 2.0 — lokations-skabelonen er fundamentet for hele FM-kæden og kan ikke skæres til en minimal-version der udskyder tilladelser/cooldown/leverandører.
  - AFVISER: Forbyder at udskyde dele af 10b-scopet (lokationer + placements + leverandører + klient-tilladelser + status + cooldown er alle i trin-definitionen) til senere trin uden Mathias-beslutning.
  _evidens:_ "FM i Stork 2.0 | Alt med (ingen udskydelser)" — master-plan Appendix A, FM-domæne.
- **doc:docs/strategi/vision-og-principper.md#princip-3:forretningslogik-som-data** (claude-ai · Konfigurerbarhed af lokations-værdier)
  Cooldown-konfiguration, dagspriser og tilladelses-data er data i UI; algoritmerne (cycle-detection, cooldown-evaluering, tilladelses-opslag) er kode. Forretningen skal kunne ændre værdier uden udvikler.
  - AFVISER: Forbyder hardkodede cooldown-perioder, priser eller tilladelses-lister i kode; forbyder at en regel-ændring (fx ny cooldown-længde) kræver teknisk ændring.
  _evidens:_ "KPI'er, lønarter, formler, klassifikationer, regler — alt er data i UI. Algoritmer er kode, værdier er data." — vision-og-principper.md princip 3. + forretningsforstaaelse.md §9: "Stork skal kunne adskille algoritmer (hvordan noget beregnes) fra værdier (hvad satserne er)".
- **doc:docs/strategi/vision-og-principper.md#princip-9:status-bevarer-historik** (claude-ai · Historik-bevarelse på tværs af pakken (status + tilladelser))
  Statusændringer og tilladelses-ændringer sker via status-felter/separate versionerede rækker med bevaret historik — man skal altid kunne se hvad der gjaldt hvornår.
  - AFVISER: Forbyder overskrivning af oprindelig data ved forretningshandlinger (status-skift, tilladelses-ændring, cooldown-ændring); forbyder at en tilladelses-periode redigeres destruktivt i stedet for at versioneres.
  _evidens:_ "Forretningshandlinger ændrer aldrig oprindelig data. Statusændringer sker via separate tabeller eller status-felter, aldrig ved overskrivning." — vision-og-principper.md, operationelt princip 9.

## Bøtte 3 — intet-data ("hvad skal x kunne?")

- **intet-data:anonymiserings-infrastruktur-udvidelse** (claude-ai · Om replay_anonymization/retention-cron skal udvides med lokations-branch i 10b)
  §4.2 action-items binder 'replay_anonymization udvides med branches per entity' til trin 10 (clients) + trin 15, og 'retention_cleanup_daily refactoreres til generisk evaluator' til 'når flere entities har retention-deadlines (trin 10+)'. Lokationen har anonymized_at — om 10b udløser disse udvidelser (anonymize_location-RPC, replay-branch, retention-evaluator) er ikke eksplicit afgjort.
  - AFVISER: Forbyder tavs udeladelse: hvis lokationen kan anonymiseres skal replay-efter-restore også dække den (backup-paradox-garantien, §1.4), ellers er GDPR-mekanikken hul for denne entitet.
  _evidens:_ intet-data → kræver Mathias. Doc-hjemmel: §4.2: "replay_anonymization | Udvides med branches per entity | §4 trin 10 (clients) + trin 15 (identitets-master)" — trin 10b er ikke nævnt, men §1.12 giver lokationen anonymized_at.
- **intet-data:cooldown-forretnings-semantik** (claude-ai · Cooldown: hvad reglen konkret betyder kommercielt)
  Doc-låst er kun dimensionen (pr. lokation) og formen (konfig-tabel, jsonb, UI-redigerbar) samt trigger-adfærden nedstrøms (ingen booking-overlap inden for konfigureret cooldown). Uafgjort: (a) cooldown-enheden og jsonb-strukturen (dage? forskellige værdier pr. situation?), (b) om cooldown gælder på tværs af klienter eller kun samme klient igen (pr.-lokation-dimensionen antyder på tværs — men det er en antagelse), (c) om annullerede/aflyste bookinger tæller som cooldown-udløsende, (d) om cooldown kan overrides og af hvem (break-glass? permission?), (e) om cooldown evalueres pr. placement eller pr. top-lokation.
  - AFVISER: Negativerne kan ikke formuleres færdigt: 'booking X dage efter forrige booking skal AFVISES' mangler X, subjekt (hvilken klient) og niveau (placement vs. lokation).
  _evidens:_ intet-data → kræver Mathias. Doc-hjemmel for det låste: "Cooldown pr. lokation (ikke pr. klient eller kampagne...). Konfig-tabel, UI-redigerbar." — §1.12; "Cooldown-trigger tjekker at samme lokation ikke overlapper med tidligere booking inden for konfigureret cooldown (pr. lokation)" — §2.7.1. Ingen doc afgør enhed, tværs-af-klient-semantik, annullerings-effekt, override eller placement-niveau.
- **intet-data:hierarki-dybde-og-placement-regler** (claude-ai · Hierarki: tilladt dybde og placement-adfærd for status/tilladelse/cooldown)
  Doc-teksten siger 'top-niveau lokation kan have placements under sig' — antyder to niveauer, men selv-reference tillader vilkårlig dybde. Uafgjort: (a) må placements have under-placements (skal dybde >2 afvises?), (b) arver placement status fra parent (kan en placement være aktiv under en inaktiv lokation?), (c) kan en placement have egen leverandør-FK eller arves den, (d) evalueres tilladelse og cooldown pr. placement eller pr. top-lokation (også rejst under cooldown/tilladelses-fundene — samlet hierarki-afgørelse nødvendig).
  - AFVISER: Uden dybde-/arv-afgørelsen kan cycle-detection-kravet ikke suppleres med de forretnings-negativer der reelt beskytter driften (fx 'booking på inaktiv parents placement skal AFVISES' — uafgjort).
  _evidens:_ intet-data → kræver Mathias. Doc-hjemmel for det låste: "Selv-refererende `parent_location_id` — top-niveau lokation kan have placements (stand-positioner) under sig" — §1.12. Ingen doc afgør dybdegrænse eller arv af status/leverandør/tilladelse/cooldown.
- **intet-data:klient-tilladelse-kommerciel-betydning** (claude-ai · Klient-tilladelse: hvad 'tilladelse' ER kommercielt, og dens kant-regler)
  Doc-låst er formen (klient × lokation × from_date × to_date, versioneret) og håndhævelsen (booking-RPC validerer på dato). Uafgjort: (a) hvad tilladelsen repræsenterer kommercielt (aftale med leverandøren? kæde-aftale der dækker mange lokationer på én gang?), (b) hvem der må oprette/ændre/lukke tilladelser, (c) om to_date må være åben (NULL = indtil videre), (d) om flere klienter må have tilladelse på samme lokation i samme periode, (e) om overlappende tilladelses-versioner for samme klient×lokation skal afvises, (f) hvad der sker med eksisterende fremtidige bookinger når en tilladelse trækkes tilbage/udløber, (g) om tilladelse gives pr. top-lokation eller pr. placement.
  - AFVISER: Uden disse afgørelser kan systemets afvisnings-adfærd ikke specificeres (fx 'tilbagetrækning af tilladelse skal/skal-ikke annullere fremtidige bookinger' er uafgjort begge veje).
  _evidens:_ intet-data → kræver Mathias. Doc-hjemmel for det låste: §1.12 Klient-tilladelser pr. lokation + forretningsforstaaelse.md §14. Ingen doc definerer tilladelsens kommercielle kilde, kardinalitet, åben-slutdato, tilbagetræknings-konsekvens eller placement-granularitet.
- **intet-data:konfig-lifecycle-for-cooldown** (claude-ai · Om cooldown-konfig (og tilladelser) skal gennem konfigurations-lifecycle)
  Vision-princip 5 + rettelse 27 kræver draft → tested → approved → active for 'alt der påvirker data-håndtering' / 'tabeller med klassifikations-styring'. Uafgjort om cooldown-konfig-tabellen og klient-tilladelser falder ind under lifecycle-kravet (de er forretningskonfig, ikke data-håndterings-konfig) — eller om simpel UI-redigering med audit er nok.
  - AFVISER: Må ikke afgøres ved antagelse: enten mangler lifecycle-negativerne ('en cooldown-ændring må ALDRIG være aktiv uden godkendelse'?) eller også over-bygges der (v5: over-test ikke).
  _evidens:_ intet-data → kræver Mathias. Doc-hjemmel for spændingen: vision-og-principper.md princip 5: "Alt der påvirker data-håndtering gennemgår draft → tested → approved → active." vs. §1.12: "Konfig-tabel, UI-redigerbar." — ingen doc afgør om lokations-konfig er 'data-håndtering' i princip-5-forstand.
- **intet-data:leverandoer-entitetens-fulde-indhold** (claude-ai · Leverandør-entitetens felter ud over type — og rabataftale-jsonb'ens hjemsted i tid)
  §1.12 fastlægger kun: egen entitet + type-felt. §2.7.6 (trin 29) siger 'Leverandør-entitet bærer rabataftale jsonb: procent-trapper'. Uafgjort: (a) hvilke øvrige felter leverandøren har (navn, adresse, kontakt-info, CVR, status/livscyklus?), (b) om rabataftale-jsonb-feltet skal med i skabelonen nu (så trin 29 kun bygger evaluering) eller først tilføjes ved trin 29, (c) om leverandør har egen status-livscyklus som lokationen.
  - AFVISER: Uden afgørelsen kan hverken skabelonens leverandør-scope eller negativet 'leverandør uden aktiv aftale må ALDRIG...' fastlægges.
  _evidens:_ intet-data → kræver Mathias. Doc-hjemmel for det låste: §1.12 Leverandører + §2.7.6: "Leverandør-entitet bærer rabataftale jsonb: procent-trapper". Ingen doc afgør felt-listen eller timing af rabataftale-feltet.
- **intet-data:lokations-pii-og-retention** (claude-ai · PII-klassifikation og retention for lokations- og leverandør-felter)
  Lokationen har anonymized_at (doc-låst) — men HVAD der er personhenførbart på en lokation/leverandør er uafgjort: er adresse forretningsdata (butiksadresse) eller kan den være indirekte PII (privat-adresse for enkelt-butik-ejer)? Kommer der kontaktperson-felter på leverandør (jf. hotel-registry der har kontakt-info)? Pr. kolonne skal vælges: kategori, pii_level, retention-type — default = intet kræver aktivt valg. Desuden: hvornår anonymiseres en lokation overhovedet (hvilken forretningshændelse udløser det)?
  - AFVISER: Forbyder at klassifikationen gættes: uden Mathias-valg pr. felt kan anonymiserings-mappingen (deklareret data, §1.4) ikke udfyldes, og negativet 'lokations-anonymisering må ALDRIG fjerne forretningsbærende felter (navn til rapporter?)' er uafgjort.
  _evidens:_ intet-data → kræver Mathias. Doc-hjemmel for pligten: §1.2 (registry-indgang pr. kolonne) + §1.4 (felt-liste er deklareret data) + vision-princip 4 (default = intet). Ingen doc klassificerer lokations-/leverandør-felterne eller definerer anonymiserings-triggeren.
- **intet-data:lokations-status-enum-og-semantik** (claude-ai · Lokations-status: enum-værdier, lovlige overgange og kommerciel betydning pr. status)
  SKAL disponeres i denne pakke — Appendix B binder beslutningen eksplicit til trin 10b. Der mangler: (a) de konkrete status-værdier (fx aktiv/inaktiv/midlertidigt lukket/under forhandling/nedlagt?), (b) hvilke overgange der er lovlige, (c) hvad hver status betyder kommercielt: kan der bookes (kun 'aktiv' er doc-låst som bookbar), vises lokationen i UI-lister, tæller den i leverandør-rabat-trapper, blokerer den nye tilladelser?
  - AFVISER: Uden Mathias-afgørelse kan negativerne pr. status ikke formuleres (fx 'på nedlagt lokation må HELLER IKKE nye klient-tilladelser oprettes' — uafgjort). Kill-list nedstrøms har intet at ramme før enum + overgangsmatrix er valgt.
  _evidens:_ intet-data → kræver Mathias. Doc-hjemmel for at beslutningen er åben og hører til her: "Lokations-status | Afgøres ved trin 10b" — master-plan Appendix B, Enum-værdier. + §1.12: "Konkrete enum-værdier afgøres ved bygning (åben beslutning, se Appendix B)".
- **intet-data:migration-relevans-lokationer** (claude-ai · Om 1.0 har lokations-historik der skal migreres)
  Trin 10b-rækken siger 'udtræks-SQL for lokations-historik hvis relevant' — relevans-spørgsmålet er uafgjort: findes der lokations-/booking-historik i 1.0 der skal med, i hvilket omfang (jf. §0.5: omfang styres ved import, Mathias afgør pr. kategori), og skal leverandører/tilladelser også udtrækkes?
  - AFVISER: Forbyder både at antage 'ikke relevant' (dropper leverancen tavst) og at bygge migration uden afgørelse — beslutningen skal træffes eksplicit af Mathias.
  _evidens:_ intet-data → kræver Mathias. Doc-hjemmel for betingelsen: "+ migration: udtræks-SQL for lokations-historik hvis relevant" — §4 trin 10b; "Mathias afgør pr. kategori hvor langt tilbage data importeres" — §0.5 kategori 4.
- **intet-data:permissions-konkrete-tildelinger** (claude-ai · Hvem må hvad: konkrete permission-tildelinger for lokations-området)
  Formen er doc-låst (has_permission, side/tab, synlighed ≠ handling), men de konkrete forretnings-tildelinger er uafgjorte: hvem må ændre lokations-status (FM-leder? kun admin?), hvem må redigere cooldown-konfig, hvem må oprette/tilbagetrække klient-tilladelser, hvem må administrere leverandører, og hvilken synligheds-scope lokations-data har (er lokationer synlige for alle eller scoped?).
  - AFVISER: Uden tildelingerne kan afvisnings-kravene ikke skrives ('en sælger må ALDRIG ændre lokations-status' er sandsynligt men uafgjort).
  _evidens:_ intet-data → kræver Mathias. Doc-hjemmel for formen: forretningsforstaaelse.md §12 + master-plan Appendix A Adgang. Ingen doc tildeler lokations-handlinger til roller/områder.
- **intet-data:pris-semantik** (claude-ai · Default-dagspris: forbrug, ændrings-semantik og arv-dybde)
  Doc-låst: lokation har default-dagspris; placement bærer egen pris hvis sat, ellers arv fra parent. Uafgjort: (a) hvad dagsprisen forbruges til kommercielt (leverandør-fakturering trin 29? intern kalkyle? informativ som hotellets default-pris?) — ingen doc kobler den eksplicit til en beregning, (b) om pris-ændring på parent slår igennem på fremtidige og/eller allerede oprettede bookinger (snapshot-princippet nedstrøms antyder frys-ved-brug, men det er trin 24+'s beslutning), (c) valuta/enhed og om 0/NULL-pris er gyldig, (d) om arv går flere niveauer ned hvis hierarkiet er dybere end to.
  - AFVISER: Negativet 'en pris-ændring må ALDRIG ændre historiske bookinger' er sandsynligt ud fra dato-snapshot-princippet men IKKE doc-afgjort for lokationspriser — må ikke antages.
  _evidens:_ intet-data → kræver Mathias. Doc-hjemmel for det låste: "default-dagspris" + "Placement-niveau bærer egen pris hvis sat (ellers arves fra parent-lokation)" — §1.12. Ingen doc afgør forbrugs-punkt, gennemslags-semantik eller enhed.

## Konflikter (bevaret uenighed — aktør-mærket, aldrig kasseret)

- fund-divergens @ migration:supabase/migrations/20260514120001_t1_schemas_and_defaults.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260514120003_t1_audit_partitioned.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260514120004_t1_cron_skabelon.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260514120005_t1_data_field_definitions.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260514140000_t6_anonymization_tables.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260514140002_t6_anonymization_crons.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260514180200_h1_has_permission_helper.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260514180300_q1_employee_active_config.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260514180600_d1c_validate_permanent_classification.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260515110100_p1a_anonymization_strategies.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260515120000_p2_anonymization_mapping_lifecycle.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260515130200_r7c_verify_anonymization_consistency_permission.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260518000000_t9_pending_changes.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260518000001_t9_org_nodes.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260518000002_t9_org_node_closure.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260518000004_t9_client_node_placements.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260518000005_t9_permission_elements.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260518000006_t9_grants_and_helpers.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260520000000_t9_supplement.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521100000_t9_supplement_2_wrappers_session_var.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521100001_t9_supplement_2_grants_fix.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521100004_t9_supplement_2_approve_helpers.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521100007_t9_supplement_2_ui_rpcs.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521000001_t10_tables.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521000002_t10_is_permanent_allowed_extend.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521000004_t10_audit_filter_values.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521000005_t10_clients_validate_fields.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521000006_t10_seed_permissions.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521000007_t10_client_node_placements_fk.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521000008_t10_client_active_check.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521000009_t10_client_rpcs.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521000012_t10_client_read_rpcs.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql (2 bidrag)
- fund-divergens @ migration:supabase/migrations/20260607110004_core_identity_revoke_authenticated_core_writes.sql (2 bidrag)
- fund-divergens @ rls_enabled:core_compliance.audit_log (2 bidrag)
- fund-divergens @ rls_enabled:core_compliance.cron_heartbeats (2 bidrag)
- fund-divergens @ rls_enabled:core_compliance.anonymization_state (2 bidrag)
- fund-divergens @ rls_enabled:core_identity.permission_actions (2 bidrag)
- fund-divergens @ rls_policy:core_compliance.data_field_definitions:data_field_definitions_insert (2 bidrag)
- fund-divergens @ rls_policy:core_compliance.data_field_definitions:data_field_definitions_update (2 bidrag)
- fund-divergens @ rls_policy:core_compliance.data_field_definitions:data_field_definitions_delete (2 bidrag)
- fund-divergens @ rls_policy:core_compliance.anonymization_mappings:anonymization_mappings_insert (2 bidrag)
- fund-divergens @ rls_policy:core_compliance.anonymization_mappings:anonymization_mappings_update (2 bidrag)
- fund-divergens @ rls_policy:core_compliance.anonymization_strategies:strategies_insert (2 bidrag)
- fund-divergens @ rls_policy:core_compliance.anonymization_strategies:strategies_update (2 bidrag)
- fund-divergens @ rls_policy:core_compliance.anonymization_strategies:strategies_delete (2 bidrag)
- fund-divergens @ rls_policy:core_identity.clients:clients_select (2 bidrag)
- fund-divergens @ rls_policy:core_identity.clients:clients_insert (2 bidrag)
- fund-divergens @ rls_policy:core_identity.clients:clients_update (2 bidrag)
- fund-divergens @ rls_policy:core_identity.client_field_definitions:client_field_definitions_select (2 bidrag)
- fund-divergens @ rls_policy:core_identity.client_field_definitions:client_field_definitions_insert (2 bidrag)
- fund-divergens @ rls_policy:core_identity.client_field_definitions:client_field_definitions_update (2 bidrag)
- fund-divergens @ rls_policy:core_identity.client_node_placements:client_node_placements_select (2 bidrag)
- fund-divergens @ rls_policy:core_identity.employee_active_config:employee_active_config_update (2 bidrag)
- fund-divergens @ rls_policy:core_identity.org_nodes:org_nodes_select (2 bidrag)
- fund-divergens @ rls_policy:core_identity.org_node_versions:org_node_versions_select (2 bidrag)
- fund-divergens @ rls_policy:core_identity.org_node_closure:org_node_closure_select (2 bidrag)
- fund-divergens @ rls_policy:core_identity.pending_changes:pending_changes_select (2 bidrag)
- fund-divergens @ rls_policy:core_identity.pending_changes:pending_changes_insert (2 bidrag)
- fund-divergens @ rls_policy:core_identity.pending_changes:pending_changes_update (2 bidrag)
- fund-divergens @ rls_policy:core_identity.permission_areas:permission_areas_insert (2 bidrag)
- fund-divergens @ rls_policy:core_identity.permission_pages:permission_pages_insert (2 bidrag)
- fund-divergens @ rls_policy:core_identity.permission_tabs:permission_tabs_insert (2 bidrag)
- fund-divergens @ rls_policy:core_identity.permission_actions:permission_actions_insert (2 bidrag)
- fund-divergens @ rls_policy:core_identity.permission_actions:permission_actions_update (2 bidrag)
- fund-divergens @ rls_policy:core_identity.role_permission_grants:role_permission_grants_insert (2 bidrag)
- fund-divergens @ rls_policy:core_identity.role_permission_grants:role_permission_grants_update (2 bidrag)
- fund-divergens @ config:supabase/config.toml (2 bidrag)
- fund-divergens @ oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs (2 bidrag)
- fund-divergens @ oid:e79ce6eb985c5994cd320398cb9c23f101db8135:scripts/migration-gate.mjs (2 bidrag)

## Usikkerheder (HALT-flag — til afklaring, aldrig oprundet til fund)

- (code) supabase/config.toml (api.schemas) styrer kun LOKAL stack; den live PostgREST-eksponering (Dashboard) kan jeg ikke aflæse fra repoet — scripts/types-gen.sh:15 dokumenterer public+core_identity+core_compliance+core_money som den tilsigtede liste, og fitness postgrest-t9-schema-exposure verificerer den live, men jeg kan ikke selv forudsige den faktiske live-tilstand.
- (code) core_identity.pending_changes/undo_settings: mekanikken er læst og forstået, men om lokations-writes (status-livscyklus, klient-tilladelser) SKAL gennem pending/action-modellen eller det direkte SECDEF-RPC-mønster (t10 client_upsert/set_active) kan ikke afgøres fra koden — begge mønstre er bærende i nuværende flade; det er en krav-/plan-beslutning.
- (code) migration:supabase/migrations/20260520000000_t9_supplement.sql linje 161-656 (apply-handler-bodies med backdated-effective_from-guards): jeg har læst strukturen, senere overskrivende versioner (t10.7b, supplement-2) og C2/C3-sektionerne i fuld dybde, men IKKE hver guard-linje i _apply_employee_place/_apply_org_node_upsert i netop denne fil — afvisningsadfærden for backdatede datoer dér er udledt af kommentarer + efterfølgende versioner, ikke af linje-læsning. Konsolidering bør ikke regne min fund-dybde for de to handlers som verificeret.
- (code) core_compliance.break_glass_operation_types.internal_rpc (t7c/p3/c006) er endnu en config-drevet dispatch-flade af samme klasse som anonymization-dispatcheren. Jeg har klassificeret hele break-glass-fladen ikke-beroert fordi bundlet ikke nævner den — MEN hvis lokations-status-fortrydelse (fx genåbning efter cooldown) ender som break-glass-operation, er den flade under-scoped i min recon.
- (code) public.*-punkterne (17 rls_enabled + tilhørende policies i d/c-serien) er klassificeret ud fra t1_drop_public's CASCADE-drop (verificeret) — jeg har IKKE læst d-seriens policy-bodies i dybden, da de er død kode i sluttilstanden; deres interne afvisningsadfærd er derfor ikke kortlagt.
- (code) fitness' live-checks (db-rls-policies, fk-coverage, secdef-marker m.fl.) er fail-closed i CI (verificeret i kode, fitness.mjs:1249-1265), men om SUPABASE_ACCESS_TOKEN faktisk er sat i CI-secrets kan ikke ses fra repoet — fail-closed betyder dog at manglende token giver rød, aldrig falsk-grøn.
- (code) config:pnpm-workspace.yaml, config:tsconfig.base.json og config:turbo.json er klassificeret uden fund (ikke-beroert): de er generel build-infrastruktur der ikke læses/skrives/begrænses specifikt af lokations-pakken ud over types:check-kæden (dækket under scripts/types-gen.sh). Stop-begrundelse: ingen lokations-specifik kant.
- (code) Re-bind 2026-08-13 (proveniens, så verdikt-laget kan verificere): bundle_oid peger nu på det opdaterede bundle (git rev-parse 7c08e4c:recon/bundle.json == 79a30c922eb93bd8ec72750e6733c8a63f991f42 — verificeret). commit_sha forbliver e68793cb35d3561872c2a182b8ebec7e7ea7702d = det tree jeg kortlagde; `git diff --name-only e68793c 7c08e4c -- supabase/` er TOM (verificeret), og ingen af mine evidens-stier (scripts/fitness.mjs, migration-gate.mjs, schema-check.sh, governance-check.mjs, run-db-tests.mjs, types-gen.sh, config.toml, classification.json, advisor-baseline.json, ci.yml) er ændret mellem de to commits — alle fund-OIDs er derfor fortsat gyldige mod begge trees. Eneste bundle-indholdsændring er det nye felt flade_filter (læst fuldt).
- (code) UENIGHED med flade_filter (ét punkt): migration:supabase/migrations/20260521000011_t10_client_logo_rpcs.sql står i flade_filter.punkt_ids, men jeg dømte den ikke-beroert og gav den intet fund. Begrundelse: §1.12's lokations-entitet (navn, adresse, default-dagspris, leverandør-FK, type, status, cooldown-konfig, anonymized_at) har ingen logo-/binær-asset-flade, og logo-RPC-mønstret (atomisk 3-felts set/clear pga. logo-konsistens-CHECK) er klient-specifikt — stop-reglen: kanten hverken læses, skrives eller begrænser lokations-pakken. Filteret er driver-forfattet som UNION af begge aktørers markeringer, så punktet stammer formentlig fra den anden aktør; muligt modargument (hvis leverandør-/lokations-billeder bliver et krav, er dette bytea+consistency-mønstret at genbruge) er en krav-beslutning, ikke nuværende kode-kant. Divergensen bør bevares til konsolidering, ikke dedupes væk. Omvendt retning: 0 af mine pakke-relevante punkter mangler i filteret (172/173 overlap, verificeret mekanisk mod surface.json).
- (codex) Repoen indeholder ingen eksisterende locations/lokations-tabel, -RPC eller -policy; direkte lokationsfund er derfor afgrænset til de skabelon- og genbrugsmønstre bundle.json peger på.
- (codex) surface.json dækker mekanisk migrations/config/RLS-flade; scripts/fitness.mjs og scripts/migration-gate.mjs er medtaget som oid-fund udenfor den mekaniske flade efter INSTRUKS-kontrakten.
- (codex) RE-BIND mod flade_filter i bundle 79a30c922eb93bd8ec72750e6733c8a63f991f42: mine tidligere skabelon-genbrug-fund oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs og oid:e79ce6eb985c5994cd320398cb9c23f101db8135:scripts/migration-gate.mjs mangler i filteret; begrundelse for uenighed/afgrænsning er, at jeg tog dem med som fælles governance-gates for nye lokationsmigrations, mens det nye filter eksplicit deklarerer pakkefladen til de 173 punkt-id'er.
- (codex) Recon er statisk mod commit e68793cb35d3561872c2a182b8ebec7e7ea7702d og blob-OID-evidens; der er ikke kørt database-migrationer eller runtime-tests.
- (claude-ai) Rettelse-17-kryds-referencen: §1.12 citerer 'afgørelse fra rettelse 17' for cooldown-pr-lokation, men Appendix C's række 17 lyder 'Schema-grænser fra trin 1. Vagt-tabel inkluderer FM-koblingen fra trin 17' — og Appendix C har duplikerede numre (to rækker nr. 18 og to nr. 19). Substansen ER låst (Appendix A FM-domæne), men den numeriske kilde-henvisning kan ikke verificeres i bundlet → flag til Mathias/plan-vedligehold
- (claude-ai) Lokations-status-enum: Appendix B binder beslutningen til trin 10b — Mathias skal vælge værdier, overgangsmatrix og kommerciel semantik pr. status (fuldt disponeret i intet-data-fund)
- (claude-ai) Cooldown-semantik: enhed/jsonb-struktur, tværs-af-klienter vs. samme klient, annullerede bookingers effekt, override-mulighed, placement- vs. lokations-niveau — alle uafgjorte (intet-data-fund)
- (claude-ai) Klient-tilladelsens kommercielle betydning: kilde (leverandør-aftale? kæde-aftale?), åben to_date, multi-klient-samtidighed, overlap-regler, konsekvens for eksisterende bookinger ved tilbagetrækning, placement-granularitet (intet-data-fund)
- (claude-ai) Default-dagspris: hvad den forbruges til (fakturering? informativ som hotel-default?), gennemslag ved ændring, enhed/valuta, NULL-gyldighed (intet-data-fund)
- (claude-ai) Hierarki-dybde: to niveauer eller vilkårlig; status-/leverandør-/tilladelses-arv mellem parent og placement (intet-data-fund)
- (claude-ai) Permissions: konkrete tildelinger for status-ændring, cooldown-redigering, tilladelses- og leverandør-administration + synligheds-scope for lokations-data (intet-data-fund)
- (claude-ai) PII/retention pr. lokations- og leverandør-kolonne + hvilken forretningshændelse der udløser lokations-anonymisering; kontrast til klientens 'anonymiseres ikke'-valg (intet-data-fund)
- (claude-ai) Migration-relevans: findes 1.0-lokations-/leverandør-/tilladelses-data der skal udtrækkes, og i hvilket omfang (intet-data-fund)
- (claude-ai) Leverandør-entitetens fulde felt-liste (navn/adresse/kontakt/CVR/status?) + om rabataftale-jsonb hører til 10b eller trin 29 (intet-data-fund)
- (claude-ai) Konfig-lifecycle: gælder draft→tested→approved→active (vision-princip 5/rettelse 27) for cooldown-konfig og tilladelser, eller er UI-redigering + audit nok? (intet-data-fund)
- (claude-ai) Anonymiserings-infrastruktur: skal anonymize_location-RPC, replay_anonymization-branch og retention-evaluator-refactor med i 10b? §4.2 nævner kun trin 10 (clients) + 15, men §1.12 giver lokationen anonymized_at (intet-data-fund)
- (claude-ai) Uklarhed om 'aktiv lokation' i §1.12 ('Bookings kan kun oprettes på aktiv lokation') refererer til en konkret kommende enum-værdi 'aktiv' eller til en klasse af bookbare statusser — afhænger af enum-beslutningen; må ikke antages
- (claude-ai) Leverandør-status: har leverandøren egen livscyklus (jf. hotel-registry og vehicle-registry der begge har status-felt)? Ikke doc-afgjort for leverandør → indgår i leverandør-felt-listen til Mathias
- (claude-ai) flade_filter-udelukkelse vs. åbent override-spørgsmål (bundle 79a30c9): flade_filter.note udelukker break-glass fra pakke-fladen, men mit intet-data-fund om cooldown-semantik rejser eksplicit om cooldown (og evt. status-overgange) skal kunne overrides — og ad hvilken vej (break-glass? permission?). Udelukkelsen forudsætter dermed et svar på et endnu uafgjort Mathias-spørgsmål: afgøres override-vejen til break-glass ved krav, skal flade_filter suppleres (noten siger selv 'Scopet bekræftes ved krav OK' — flagget her så koblingen ikke tabes). Øvrige udelukkelser (core_money, droppet public-æra, build-config) er konsistente med forretnings-kortlægningen: core_money-forbrugerne er netop trin 24-29 som skabelonen skal bære, ikke bygge — intet berørt forretnings-område mister dækning

## Forretnings-flade-enumeration (claude-ai — udeladelser er synlige her)

- vision-og-principper.md :: Vision (holdbarhed, greenfield, data/rettigheder/logik i UI) — BERØRT: rammesætter alle skabelon-valg; cooldown/pris/tilladelser skal være UI-data, ingen shortcuts
- vision-og-principper.md :: Bærende princip 1 (én sandhed) — BERØRT: én lokations-tabel for lokation+placement; leverandør som én entitet; ingen parallelle sandheder
- vision-og-principper.md :: Bærende princip 2 (styr på data) — BERØRT: klassifikations-pligt for alle nye kolonner (fund §1.2)
- vision-og-principper.md :: Bærende princip 3 (sammenkobling eksplicit, FK obligatorisk) — BERØRT: leverandør-FK, parent_location_id, klient-FK i tilladelser
- vision-og-principper.md :: Operationelt princip 1 (data-kontrol i UI) — BERØRT: klassifikation af lokations-kolonner vælges i UI-registry
- vision-og-principper.md :: Operationelt princip 2 (rettigheder i UI) — BERØRT: lokations-handlinger gates via permission-modellen; konkrete tildelinger = intet-data
- vision-og-principper.md :: Operationelt princip 3 (forretningslogik som data) — BERØRT: cooldown-konfig + priser + tilladelser er data, ikke kode
- vision-og-principper.md :: Operationelt princip 4 (default = intet) — BERØRT: ingen implicit PII/retention på nye kolonner
- vision-og-principper.md :: Operationelt princip 5 (lifecycle for konfiguration) — MULIGT BERØRT: uafgjort om cooldown-konfig er 'data-håndtering' i princip-5-forstand → intet-data-fund + usikkerhed
- vision-og-principper.md :: Operationelt princip 6 (audit på alt) — BERØRT: per-row audit på alle nye tabeller; ingen snapshot-undtagelse gælder her
- vision-og-principper.md :: Operationelt princip 7 (anonymisering bevarer audit) — BERØRT: anonymized_at på lokation; UPDATE ikke DELETE
- vision-og-principper.md :: Operationelt princip 8 (identitet én gang) — IKKE BERØRT: lokation/leverandør er ikke person-identiteter; ingen identity-mapping i pakken. Grænse-note: leverandør-kontaktperson-felter ville aktivere princippet — felt-listen er intet-data
- vision-og-principper.md :: Operationelt princip 9 (status-modeller bevarer historik) — BERØRT: status-livscyklus via RPC + versionerede tilladelser
- forretningsforstaaelse.md :: §1 Klient som omdrejningspunkt — BERØRT: klient-tilladelser knytter klient til lokation; klient forbliver dimensionen
- forretningsforstaaelse.md :: §2 Dato-snapshot-princippet — BERØRT (mønster): tilladelser er dato-interval-versionerede; opslag 'hvad gjaldt på dato X' skal kunne besvares. Pris-gennemslags-semantik = intet-data
- forretningsforstaaelse.md :: §3 Attribution-trekanten — BERØRT SOM NEGATIV: lokationen må ALDRIG blive attributions-dimension; attribution går via klient (jf. §2.7.1)
- forretningsforstaaelse.md :: §4 Salget — IKKE BERØRT: ingen salgs-/pricing-mekanik i pakken; salgs-kæden forbruger først lokationen via bookinger (trin 24+)
- forretningsforstaaelse.md :: §5 Vagter, stempelur og klient-tid — IKKE BERØRT: vagter opstår fra booking-assignments (trin 25), ikke fra skabelonen
- forretningsforstaaelse.md :: §6 Annulleringer — IKKE BERØRT: ingen modpost-mekanik i pakken. Grænse-note: annullerede bookingers effekt på cooldown er intet-data (trin 24-kobling)
- forretningsforstaaelse.md :: §7 Provision-mekanikken — IKKE BERØRT: ingen løn-/provisions-flade; FM-lønarter er trin 28
- forretningsforstaaelse.md :: §8 Lønperiode-låsning — IKKE BERØRT: lokations-data indgår ikke i periode-låsning; ingen frosne tal i pakken
- forretningsforstaaelse.md :: §9 Forretningslogik som data — BERØRT: cooldown/pris/tilladelser som UI-data; algoritme/værdi-adskillelse
- forretningsforstaaelse.md :: §10 Identitet én gang — IKKE BERØRT: ingen person-entiteter (se princip-8-noten)
- forretningsforstaaelse.md :: §11 Persondata vs. forretningsdata — BERØRT: klassifikation + anonymized_at; HVAD der er PII på lokation/leverandør = intet-data
- forretningsforstaaelse.md :: §12 Rettigheder og adgang — BERØRT: form doc-låst; konkrete tildelinger = intet-data
- forretningsforstaaelse.md :: §13 Yderligere funktioner (kontrakt/besked/dashboard/rapportering) — IKKE BERØRT: selvstændige områder, afdækkes pakke for pakke
- forretningsforstaaelse.md :: §14 FM-grenen — KERNE-BERØRT: lokation som master-data + klient-tilladelses-kontrol; bookinger/lønarter er nedstrøms
- forretningsforstaaelse.md :: §15 Greenfield-rammen — BERØRT: migration separat beslutning ('hvis relevant'); 1.0-antagelser forbudt i design
- forretningsforstaaelse.md :: §16 Sammenhængen — BERØRT: skabelonen er første led i kæden lokation → booking → vagt → løn; skabelonen skal bære kæden uden at bygge den
- stork-2-0-master-plan.md :: §4 trin 10b (anker) — BERØRT: scope-definition (lokationer + placements + leverandører + klient-tilladelser + status + cooldown + betinget migration), schema core_identity; §4.1 status: ⌛ Udestående
- stork-2-0-master-plan.md :: §1.12 Lokations-skabelon (anker) — KERNE-BERØRT: alle fem under-blokke disponeret som fund (entitet, hierarki/pris-arv, status-livscyklus, klient-tilladelser, cooldown, leverandører)
- stork-2-0-master-plan.md :: Appendix B → 'Lokations-status: Afgøres ved trin 10b' (anker) — BERØRT: åben enum-beslutning SKAL disponeres i pakken → intet-data-fund. Øvrige Appendix B-punkter (booking-livscyklus trin 24, assignment-status trin 25, hotel trin 26, vehicle/aflevering trin 27) — IKKE BERØRT: eksplicit bundet til senere trin
- stork-2-0-master-plan.md :: rettelse 17 / Appendix A FM-domæne 'Cooldown pr. lokation' (anker) — BERØRT: låst afgørelse; substansen står i §1.12 + Appendix A. Nummererings-uoverensstemmelse i Appendix C → usikkerhed
- stork-2-0-master-plan.md :: §2.7 FM-domæne intro + §2.7.1 booking-stamme (anker) — BERØRT som nedstrøms-forbruger: tilladelses-validering, cooldown-trigger, aktiv-lokation-gate, attribution-via-klient
- stork-2-0-master-plan.md :: §2.7.2 booking-assignment — BERØRT KUN som bæreevne-krav (trin 25 bygger); ingen skabelon-regler udover at lokations-nøglen skal kunne forbruges
- stork-2-0-master-plan.md :: §2.7.3 hotel-booking — IKKE BERØRT direkte: hotel-registry er egen entitet (trin 26); bemærk mønster-parallel (default-pris 'informativ') til dagspris-spørgsmålet → usikkerhed
- stork-2-0-master-plan.md :: §2.7.4 køretøj/mileage — IKKE BERØRT: vehicle-registry er trin 27 (dog samme schema core_identity)
- stork-2-0-master-plan.md :: §2.7.5 diæt/oplæringsbonus — IKKE BERØRT: formel-instanser trin 28
- stork-2-0-master-plan.md :: §2.7.6 leverandør-fakturering — BERØRT som bæreevne: leverandør-type styrer rabat-lookup; rabataftale-jsonb + undtagelses-tabel (lokation × leverandør) er trin 29 — timing af rabataftale-feltet = intet-data
- stork-2-0-master-plan.md :: §2.7.7 FM-checkliste — IKKE BERØRT: trin 30
- stork-2-0-master-plan.md :: §2.7.8 markeder/messer — BERØRT: type-felt, ingen særmodel (negativ-fund)
- stork-2-0-master-plan.md :: §1.1 Adgangs-mekanik (anker) — BERØRT: FORCE RLS/RPC-mønster for alle nye tabeller
- stork-2-0-master-plan.md :: §1.2 Klassifikations-registry (anker) — BERØRT: registry-indgang pr. ny kolonne; migration-gate
- stork-2-0-master-plan.md :: §1.3 Audit-mønster (anker) — BERØRT: per-row audit; status-årsag; ingen snapshot-undtagelse
- stork-2-0-master-plan.md :: §1.4 Anonymisering (anker) — BERØRT: anonymized_at, UPDATE-ikke-DELETE, mapping som data, replay-garanti → udvidelses-spørgsmål = intet-data
- stork-2-0-master-plan.md :: §1.11 Tre-schema-arkitektur (anker) — BERØRT: 'lokationer' eksplicit i core_identity; app-skrivning kun via SECDEF-RPC
- stork-2-0-master-plan.md :: §0.5 Migration fra 1.0 — BERØRT via trin 10b-rækkens migration-leverance (udtræk+upload-mekanik, kategori 3 master-data, migrations-audit); relevans = intet-data
- stork-2-0-master-plan.md :: §1.8 Klient-skabelon — BERØRT som FK-mål og anonymiserings-kontrast (klient anonymiseres ikke; lokation har anonymized_at)
- stork-2-0-master-plan.md :: §4.2 Action-items — BERØRT: retention_cleanup_daily (trin 10+) + replay_anonymization-udvidelse rører pakken → intet-data-fund
- stork-2-0-master-plan.md :: Appendix A FM-domæne — BERØRT: 'Alt med', cooldown-dimension, markeder/messer låst
- stork-2-0-master-plan.md :: Øvrige afsnit uden for bundlets anker (§0 plan-grundlag, §1.5-§1.7, §1.9-§1.10, §1.13-§1.15, §2.1-§2.6, §3 disciplin, §5, Appendix A øvrige tabeller, Appendix C øvrig historik, cutover-blockers, rettelse-19-begrundelser) — IKKE DISPONERET SOM FORRETNINGS-FLADE: uden for ankerets punkter; teknisk disciplin (§3, CI) er Code/Codex' bord. Deklareret her så udeladelsen er aktiv og synlig, ikke tavs
