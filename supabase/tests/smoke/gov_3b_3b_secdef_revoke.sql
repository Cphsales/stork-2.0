-- gov-3b-3b (#18 retning A, lukker G065): sidste 5 T9-RPC'er → SECDEF + REVOKE authenticated-write på core_*.
-- T1: de 5 er SECURITY DEFINER. T2: has_permission-gate bærer under SECDEF (42501). T3: REVOKE-bevis —
-- authenticated har INGEN direkte write på core_*. T4: write→read-flow virker. §3 #20 tx-wrap.

begin;

do $test$
declare
  v_secdef int;
  v_caught text;
  v_can_write boolean;
  v_ct text;
begin
  -- ─── T1: de 5 resterende T9-RPC'er er nu SECURITY DEFINER ─────────────────────
  select count(*) into v_secdef
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'core_identity' and p.prosecdef
    and p.proname in (
      'pending_change_approve', 'pending_change_undo',
      'role_permission_grant_set', 'role_permission_grant_remove', 'undo_setting_update');
  if v_secdef <> 5 then
    raise exception 'T1 FAIL: forventede 5 SECURITY DEFINER, fik %', v_secdef;
  end if;

  -- ─── T2: has_permission-gate bærer fortsat under SECDEF (authenticated uden permission → 42501) ──
  begin
    v_caught := null; set local role authenticated;
    perform core_identity.role_permission_grant_set(gen_random_uuid(), 'area', gen_random_uuid(), true, false, 'self');
    reset role;
  exception when sqlstate '42501' then v_caught := 'ok'; reset role; end;
  if v_caught is null then raise exception 'T2 FAIL: role_permission_grant_set skal raise 42501 uden permission'; end if;

  -- ─── T3: REVOKE-bevis — authenticated har INGEN direkte write på core_* (#18) ──
  v_can_write := has_table_privilege('authenticated', 'core_identity.clients', 'INSERT')
              or has_table_privilege('authenticated', 'core_identity.clients', 'UPDATE')
              or has_table_privilege('authenticated', 'core_identity.role_permission_grants', 'DELETE')
              or has_table_privilege('authenticated', 'core_money.pay_periods', 'INSERT')
              or has_table_privilege('authenticated', 'core_compliance.data_field_definitions', 'UPDATE');
  if v_can_write then
    raise exception 'T3 FAIL: authenticated har stadig direkte write på core_* — REVOKE virkede ikke';
  end if;

  -- ─── T4: write→read-flow (direkte INSERT m. session-var, postgres-rolle; idiomatisk T9-smoke) ──
  v_ct := 'gov3b3b_smoke_' || replace(gen_random_uuid()::text, '-', '');
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'gov-3b-3b secdef+revoke smoke', true);
  perform set_config('stork.t9_write_authorized', 'true', true);
  insert into core_identity.undo_settings (change_type, undo_period_seconds)
  values (v_ct, 3600);
  if not exists (select 1 from core_identity.undo_settings where change_type = v_ct) then
    raise exception 'T4 FAIL: write→read-flow virker ikke';
  end if;

  raise notice 'gov-3b-3b SECDEF+REVOKE: ALL PASSED (T1-T4)';
end;
$test$;

rollback;
