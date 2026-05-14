-- P1a inline-fix: lifecycle-trigger nil-safety.
--
-- Bug: `current_setting('foo', true)` returnerer NULL hvis variablen ikke
-- er sat. `NULL <> 'true'` evaluerer til NULL (ikke true), så
-- `if current_setting(...) <> 'true' then raise ...` blev sprunget over.
-- En direkte UPDATE til status='active' uden session-var slap igennem
-- raise-blokken og fortsatte til CHECK-constraint-violation i stedet for
-- den ønskede 42501.
--
-- Fix: coalesce NULL → '' så sammenligningen altid evaluerer til boolean.

create or replace function core_compliance.enforce_anonymization_strategy_lifecycle()
returns trigger language plpgsql set search_path = '' as $func$
begin
  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'approved') then
      raise exception 'INSERT med status=% er ikke tilladt (kun draft eller approved/bootstrap)', new.status using errcode = 'P0001';
    end if;
    if new.status = 'approved' and coalesce(current_setting('stork.source_type', true), '') <> 'migration' then
      raise exception 'INSERT med status=approved kun tilladt under migration (source_type=%)',
        coalesce(current_setting('stork.source_type', true), 'null') using errcode = 'P0001';
    end if;
    return new;
  end if;
  if old.status = new.status then return new; end if;
  if new.status = 'active' then
    if coalesce(current_setting('stork.allow_strategy_activate', true), '') <> 'true' then
      raise exception 'status=active kraever aktivering via anonymization_strategy_activate-RPC' using errcode = '42501';
    end if;
    new.activated_at := now();
    new.activated_by := core_identity.current_employee_id();
  end if;
  if old.status = 'active' and new.status <> 'active' then
    raise exception 'kan ikke deaktivere active-strategy via direkte UPDATE' using errcode = '42501';
  end if;
  if ((old.status = 'tested' and new.status = 'draft')
      or (old.status = 'approved' and new.status in ('draft', 'tested'))) then
    raise exception 'lifecycle-regression % -> % er ikke tilladt', old.status, new.status using errcode = 'P0001';
  end if;
  return new;
end;
$func$;
