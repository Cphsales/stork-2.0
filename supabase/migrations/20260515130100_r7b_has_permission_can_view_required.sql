-- R7b: has_permission kraever altid can_view=true.
--
-- BAGGRUND (Codex v1 Fund #2):
-- Pre-R7b: `(not p_can_edit or p.can_edit = true)` — hvis p_can_edit=false,
-- evaluerer til `not false or ...` = `true or ...` = `true`. Row med
-- can_view=false, can_edit=false ville passere has_permission(_,_,false).
--
-- Sikkerhedshul: read-only permissions kunne udstedes uden at have set
-- can_view=true. Q-SEED + P-seeds har alle can_view=true verificeret, så
-- ingen funktionalitet brydes; fix lukker fremtidigt hul.
--
-- FIX: tilføj `and p.can_view = true` altid. can_edit-check forbliver
-- yderligere gate hvis p_can_edit=true.

create or replace function core_identity.has_permission(
  p_page_key text,
  p_tab_key text default null,
  p_can_edit boolean default false
)
returns boolean
language sql stable security invoker set search_path = ''
as $$
  select exists (
    select 1
    from core_identity.employees e
    join core_identity.role_page_permissions p on p.role_id = e.role_id
    where e.auth_user_id = auth.uid()
      and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
      and p.page_key = p_page_key
      and coalesce(p.tab_key, '') = coalesce(p_tab_key, '')
      and p.scope = 'all'
      and p.can_view = true
      and (not p_can_edit or p.can_edit = true)
  );
$$;

comment on function core_identity.has_permission(text, text, boolean) is
  'R7b: kraever altid can_view=true; can_edit yderligere gate hvis p_can_edit=true. Lukker sikkerhedshul fra Codex Fund #2.';
