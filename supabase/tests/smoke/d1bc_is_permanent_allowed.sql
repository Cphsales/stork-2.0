-- D1b smoke: is_permanent_allowed-allowlist returnerer korrekt boolean.

do $test$
begin
  -- TABEL-NIVEAU allow (column=null i allowlist betyder alle kolonner)
  if not core_compliance.is_permanent_allowed('core_compliance', 'audit_log', 'occurred_at') then
    raise exception 'TEST FAILED: audit_log skal være i allowlist';
  end if;
  if not core_compliance.is_permanent_allowed('core_compliance', 'data_field_definitions', 'retention_type') then
    raise exception 'TEST FAILED: data_field_definitions skal være i allowlist';
  end if;
  if not core_compliance.is_permanent_allowed('core_identity', 'roles', 'name') then
    raise exception 'TEST FAILED: roles skal være i allowlist';
  end if;

  -- KOLONNE-NIVEAU allow (kun specifikke kolonner)
  if not core_compliance.is_permanent_allowed('core_identity', 'employees', 'id') then
    raise exception 'TEST FAILED: employees.id skal være i allowlist';
  end if;
  if core_compliance.is_permanent_allowed('core_identity', 'employees', 'first_name') then
    raise exception 'TEST FAILED: employees.first_name skal IKKE være i allowlist (PII)';
  end if;

  -- DENY: tabeller udenfor allowlist
  if core_compliance.is_permanent_allowed('core_compliance', 'break_glass_requests', 'id') then
    raise exception 'TEST FAILED: break_glass_requests skal IKKE være i allowlist';
  end if;
  if core_compliance.is_permanent_allowed('core_money', 'cancellations', 'amount') then
    raise exception 'TEST FAILED: cancellations skal IKKE være i allowlist';
  end if;
  if core_compliance.is_permanent_allowed('core_money', 'commission_snapshots', 'amount') then
    raise exception 'TEST FAILED: commission_snapshots skal IKKE være i allowlist';
  end if;
end;
$test$;
