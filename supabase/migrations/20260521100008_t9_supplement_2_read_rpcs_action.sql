-- T9-supplement-2 M6b: Udvid read-RPCs med action-info
--
-- pending_changes_read(): tilføj action_id som 10. kolonne. Eksisterende
-- return-kontrakt (9 kolonner) bevares — action_id tilføjes sidst.
-- permission_elements_read(): tilføj action-grenen til UNION ALL.
--
-- V12 (Codex V11 TEKNISK-BLOKERING): DROP FUNCTION + CREATE pattern (return-type
-- ændres; CREATE OR REPLACE understøtter ikke return-type-ændring).
-- V13 (Codex V12 KRITISK-SIKKERHEDSHUL + TEKNISK-BLOKERING): behold
-- _require_read_permission-gate på permission_elements_read; behold eksisterende
-- 9-kolonne-kontrakt på pending_changes_read; brug pc.-kvalificering.
--
-- Reference: docs/coordination/t9-supplement-2-plan.md M6b (Mathias-fund M2).

-- ─── pending_changes_read(): tilføj action_id som 10. kolonne ───────────
-- Eksisterende return-table (20260520000000:958-969): 9 kolonner
-- (change_id, change_type, target_id, effective_from, status,
--  requested_at, approved_at, undo_deadline, applied_at)
-- V13: tilføj action_id KUN; behold pc.-kvalificering og set_config-prefix.
drop function if exists core_identity.pending_changes_read();
create function core_identity.pending_changes_read()
returns table (
  change_id uuid,
  change_type text,
  target_id uuid,
  effective_from date,
  status text,
  requested_at timestamptz,
  approved_at timestamptz,
  undo_deadline timestamptz,
  applied_at timestamptz,
  action_id uuid  -- V13: ny som 10. kolonne; bevarer eksisterende callers' ordering
)
language plpgsql stable security invoker set search_path = '' as $$
begin
  perform set_config('stork.t9_read_at_date', current_date::text, true);
  return query
  select pc.id, pc.change_type, pc.target_id, pc.effective_from, pc.status,
         pc.requested_at, pc.approved_at, pc.undo_deadline, pc.applied_at, pc.action_id
  from core_identity.pending_changes pc;
end; $$;
revoke execute on function core_identity.pending_changes_read() from public, anon;
grant execute on function core_identity.pending_changes_read() to authenticated;

-- ─── permission_elements_read(): tilføj action-grenen ───────────────────
-- V13 (Codex V12-1 KRITISK-SIKKERHEDSHUL): behold eksisterende
-- _require_read_permission-gate. is_active=true-filter konsistent på alle 4 grene.
drop function if exists core_identity.permission_elements_read();
create function core_identity.permission_elements_read()
returns table (
  level text,
  element_id uuid,
  parent_id uuid,
  name text,
  is_active boolean,
  sort_order integer
)
language plpgsql stable security invoker set search_path = '' as $$
begin
  -- V13 (Codex V12-1 KRITISK-SIKKERHEDSHUL fix): behold eksisterende read-permission-gate
  perform core_identity._require_read_permission('permissions', 'manage');
  return query
  select 'area'::text, a.id, null::uuid, a.name, a.is_active, a.sort_order
    from core_identity.permission_areas a where a.is_active = true
  union all
  select 'page'::text, p.id, p.area_id, p.name, p.is_active, p.sort_order
    from core_identity.permission_pages p where p.is_active = true
  union all
  select 'tab'::text, t.id, t.page_id, t.name, t.is_active, t.sort_order
    from core_identity.permission_tabs t where t.is_active = true
  union all
  -- V13: ny action-gren — matchende kolonneorden + is_active-filter
  select 'action'::text, act.id, act.tab_id, act.name, act.is_active, act.sort_order
    from core_identity.permission_actions act where act.is_active = true;
end; $$;
revoke execute on function core_identity.permission_elements_read() from public, anon;
grant execute on function core_identity.permission_elements_read() to authenticated;
