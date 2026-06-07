-- gov-3b-3a (#18 retning A): de 9 permission_* T9-RPC'er konverteret INVOKER → SECURITY DEFINER.
-- Verificerer: (T1) konverteringen er applikeret; (T2-T5) has_permission-gaten BÆRER fortsat under
-- SECDEF — behavior-preserving; (T6) write→read-flow virker (idiomatisk T9-smoke: direkte INSERT m.
-- session-var, da positiv RPC-auth-context ikke kan mockes i SQL-smoke, jf. has_permission_admin_grant).
-- §3 #20 tx-wrap (begin/rollback).

begin;

do $test$
declare
  v_secdef int;
  v_caught text;
  v_tab_id uuid;
  v_action_id uuid;
begin
  -- ─── T1: alle 9 permission_*-fns er nu SECURITY DEFINER ──────────────────────
  select count(*) into v_secdef
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'core_identity' and p.prosecdef
    and p.proname in (
      'permission_action_upsert', 'permission_action_deactivate', 'permission_action_set_approver_type',
      'permission_area_upsert', 'permission_area_deactivate',
      'permission_page_upsert', 'permission_page_deactivate',
      'permission_tab_upsert', 'permission_tab_deactivate');
  if v_secdef <> 9 then
    raise exception 'T1 FAIL: forventede 9 SECURITY DEFINER permission_*-fns, fik %', v_secdef;
  end if;

  -- ─── T2-T5: has_permission-gaten bærer under SECDEF (authenticated uden permission → 42501) ──
  begin
    v_caught := null; set local role authenticated;
    perform core_identity.permission_action_upsert(null::uuid, gen_random_uuid(), 'x', true, 0);
    reset role;
  exception when sqlstate '42501' then v_caught := 'ok'; reset role; end;
  if v_caught is null then raise exception 'T2 FAIL: permission_action_upsert skal raise 42501 uden permission'; end if;

  begin
    v_caught := null; set local role authenticated;
    perform core_identity.permission_area_upsert(null::uuid, 'x', true, 0);
    reset role;
  exception when sqlstate '42501' then v_caught := 'ok'; reset role; end;
  if v_caught is null then raise exception 'T3 FAIL: permission_area_upsert skal raise 42501 uden permission'; end if;

  begin
    v_caught := null; set local role authenticated;
    perform core_identity.permission_page_upsert(null::uuid, gen_random_uuid(), 'x', true, 0);
    reset role;
  exception when sqlstate '42501' then v_caught := 'ok'; reset role; end;
  if v_caught is null then raise exception 'T4 FAIL: permission_page_upsert skal raise 42501 uden permission'; end if;

  begin
    v_caught := null; set local role authenticated;
    perform core_identity.permission_tab_upsert(null::uuid, gen_random_uuid(), 'x', true, 0);
    reset role;
  exception when sqlstate '42501' then v_caught := 'ok'; reset role; end;
  if v_caught is null then raise exception 'T5 FAIL: permission_tab_upsert skal raise 42501 uden permission'; end if;

  -- ─── T6: write→read-flow (direkte INSERT m. session-var; idiomatisk T9-smoke) ──
  select id into v_tab_id from core_identity.permission_tabs limit 1;
  if v_tab_id is null then raise exception 'T6 SETUP FAIL: ingen permission_tabs-rows'; end if;
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'gov-3b-3a secdef smoke', true);
  perform set_config('stork.t9_write_authorized', 'true', true);
  insert into core_identity.permission_actions (id, tab_id, name, is_active, sort_order)
  values (gen_random_uuid(), v_tab_id, 'gov3b3a-' || gen_random_uuid()::text, true, 0)
  returning id into v_action_id;
  if not exists (select 1 from core_identity.permission_actions where id = v_action_id) then
    raise exception 'T6 FAIL: write→read-flow virker ikke';
  end if;

  raise notice 'gov-3b-3a permission_* SECDEF: ALL PASSED (T1-T6)';
end;
$test$;

rollback;
