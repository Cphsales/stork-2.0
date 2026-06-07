-- gov-3b-3b (#18 retning A): konvertér undo_setting_update INVOKER → SECURITY DEFINER.
-- DIFF-summary: KUN `security invoker` → `security definer`. Body 1:1 fra kanonisk 20260518100000:322-355
-- (parity-body-audit: live matchede kanonisk, ingen drift). Behavior-preserving (postgres/bypassrls; gates via JWT).
-- Idempotent (create or replace).

create or replace function core_identity.undo_setting_update(
  p_change_type text,
  p_undo_period_seconds integer
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updater uuid;
begin
  v_updater := core_identity.current_employee_id();
  if v_updater is null then
    raise exception 'no_authenticated_employee'
      using errcode = '42501';
  end if;

  if not core_identity.has_permission('pending_changes', 'settings', true) then
    raise exception 'permission_denied: pending_changes/settings/can_edit'
      using errcode = '42501';
  end if;

  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'undo_setting_update', true);

  insert into core_identity.undo_settings (change_type, undo_period_seconds, updated_at, updated_by)
  values (p_change_type, p_undo_period_seconds, now(), v_updater)
  on conflict (change_type) do update
  set undo_period_seconds = excluded.undo_period_seconds,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by;
end;
$$;
