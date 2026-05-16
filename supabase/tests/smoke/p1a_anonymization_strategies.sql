-- P1a smoke: validation + lifecycle + delete triggers.
-- T1: INSERT med invalid function_schema → P0001
-- T2: INSERT med invalid function_name (mangler _anon_strategy_ prefix) → P0001
-- T3: INSERT med ikke-eksisterende funktion → P0002
-- T4: INSERT med disallowed status (tested) → P0001
-- T5: Direct UPDATE status='active' uden activate-RPC session-var → 42501
-- T6: DELETE af non-draft strategy → P0001
--
-- H024: tx-rollback er nu default mønster (fitness-check håndhæver).
-- T5's INSERT (med `extract(epoch)`-suffix for unik strategy_name) bliver
-- rollback'et — ingen prod-DB drift fra denne test.

begin;
do $test$
declare v_caught text; v_id uuid;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'P1a smoke', true);
  perform set_config('stork.allow_strategy_write', 'true', true);

  begin
    v_caught := null;
    insert into core_compliance.anonymization_strategies (strategy_name, function_schema, function_name, status)
    values ('p1a_smoke_test1', 'core_identity', '_anon_strategy_blank', 'draft');
  exception when sqlstate 'P0001' then v_caught := 'ok'; end;
  if v_caught is null then raise exception 'T1 FAIL: invalid schema skal blokere'; end if;

  begin
    v_caught := null;
    insert into core_compliance.anonymization_strategies (strategy_name, function_schema, function_name, status)
    values ('p1a_smoke_test2', 'core_compliance', 'foo_bar', 'draft');
  exception when sqlstate 'P0001' then v_caught := 'ok'; end;
  if v_caught is null then raise exception 'T2 FAIL: invalid prefix skal blokere'; end if;

  begin
    v_caught := null;
    insert into core_compliance.anonymization_strategies (strategy_name, function_schema, function_name, status)
    values ('p1a_smoke_test3', 'core_compliance', '_anon_strategy_nonexistent', 'draft');
  exception when sqlstate 'P0002' then v_caught := 'ok'; end;
  if v_caught is null then raise exception 'T3 FAIL: non-existent funktion skal raise P0002'; end if;

  begin
    v_caught := null;
    insert into core_compliance.anonymization_strategies (strategy_name, function_schema, function_name, status)
    values ('p1a_smoke_test4', 'core_compliance', '_anon_strategy_blank', 'tested');
  exception when sqlstate 'P0001' then v_caught := 'ok'; end;
  if v_caught is null then raise exception 'T4 FAIL: status=tested ved INSERT skal blokere'; end if;

  insert into core_compliance.anonymization_strategies (strategy_name, function_schema, function_name, status)
  values ('p1a_smoke_t5_' || extract(epoch from clock_timestamp())::text, 'core_compliance', '_anon_strategy_blank', 'draft')
  returning id into v_id;
  begin
    v_caught := null;
    update core_compliance.anonymization_strategies set status = 'active' where id = v_id;
  exception when sqlstate '42501' then v_caught := 'ok'; end;
  if v_caught is null then raise exception 'T5 FAIL: direkte UPDATE til active skal raise 42501'; end if;

  update core_compliance.anonymization_strategies set status = 'tested' where id = v_id;
  begin
    v_caught := null;
    delete from core_compliance.anonymization_strategies where id = v_id;
  exception when sqlstate 'P0001' then v_caught := 'ok'; end;
  if v_caught is null then raise exception 'T6 FAIL: DELETE af non-draft skal raise P0001'; end if;
end;
$test$;
rollback;
