-- H1: has_permission(page_key, tab_key, can_edit) helper-funktion.
--
-- VISION-PRINCIP 2: "Rettigheder i UI. Page/tabs styrer hvilke dele af systemet
-- der ses. Superadmin er eneste hardkodede rolle."
--
-- Helperen er FUNDAMENT for permission-baseret aktivering pr. princip 1+2.
-- 22 RPC'er konverteres fra is_admin() til has_permission() i Q-pakken
-- (Q-AUTH, Q-AUDIT, Q-ANON, Q-BREAK, Q-HR, Q-PAY).
-- Kun superadmin_settings_update bevarer is_admin() (Mathias-korrektion).
--
-- KONTRAKT:
-- - has_permission(p_page_key, p_tab_key, p_can_edit) returnerer true hvis:
--   1. Caller har auth.uid() der mapper til en aktiv employee
--      (anonymized_at IS NULL AND (termination_date IS NULL OR termination_date >= current_date))
--   2. Employee's rolle har permission på (p_page_key, coalesce(p_tab_key, ''))
--      MED scope='all'
--   3. Hvis p_can_edit=true: permission har can_edit=true
-- - Helperen håndterer KUN scope='all'. Subtree/team/self-helpers tilføjes
--   ved trin 9+ (G014). Indtil da kan helperen ikke bruges til delegering af
--   data-tilgang pr. team/sælger.
-- - SECURITY INVOKER + IMMUTABLE search_path: helperen virker som caller-side
--   lookup, ikke privilege-escalation.
--
-- INDEX-DÆKNING:
-- - employees_auth_user_id_key UNIQUE INDEX dækker auth_user_id-lookup
-- - employees_active_idx (id, termination_date) WHERE anonymized_at IS NULL
--   dækker aktiv-filter
-- - role_page_permissions_unique (role_id, page_key, coalesce(tab_key, ''))
--   dækker permission-lookup
-- Ingen yderligere index nødvendig.

create or replace function core_identity.has_permission(
  p_page_key text,
  p_tab_key text default null,
  p_can_edit boolean default false
)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from core_identity.employees e
    join core_identity.role_page_permissions p on p.role_id = e.role_id
    where e.auth_user_id = auth.uid()
      and e.anonymized_at is null
      and (e.termination_date is null or e.termination_date >= current_date)
      and p.page_key = p_page_key
      and coalesce(p.tab_key, '') = coalesce(p_tab_key, '')
      and p.scope = 'all'
      and (not p_can_edit or p.can_edit = true)
  );
$$;

comment on function core_identity.has_permission(text, text, boolean) is
  'H1 (vision-princip 2): permission-baseret rolle-tjek. Returnerer true hvis caller har aktiv employee-mapping + rolle med permission (page_key, tab_key) på scope=all (+ can_edit hvis krævet). Bruges af Q-pakken (22 RPC-konverteringer fra is_admin). Subtree/team/self-helpers tilføjes ved trin 9+.';

revoke all on function core_identity.has_permission(text, text, boolean) from public;
grant execute on function core_identity.has_permission(text, text, boolean) to authenticated;
