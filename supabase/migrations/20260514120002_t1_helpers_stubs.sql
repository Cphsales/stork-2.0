-- Trin 1 / fundament — RLS-helper-stubs i core_identity.
--
-- Master-plan §1.1 + §1.7. Helpers er pure, STABLE, SECURITY INVOKER,
-- deterministisk search_path.
--
-- Stubs i trin 1 fordi employees-tabel og role_page_permissions først
-- bygges i trin 5 (identitet del 1). Bootstrap (t1_08) opretter minimum
-- struktur så stubs kan redefineres samme transaktion.

-- ─── current_employee_id() ───────────────────────────────────────────────
-- Returnerer den aktuelle brugers employee_id (eller NULL hvis ikke logget ind
-- eller ikke mappet til en employee). Redefineres i trin 5 / bootstrap når
-- employees-tabel findes.

create or replace function core_identity.current_employee_id()
returns uuid
language sql
stable
security invoker
set search_path = ''
as $$
  select null::uuid;
$$;

comment on function core_identity.current_employee_id() is
  'Trin 1 stub: returnerer NULL. Redefineres i bootstrap (t1_08) til at læse core_identity.employees via auth.uid().';

-- ─── is_admin() ──────────────────────────────────────────────────────────
-- Returnerer true hvis aktuel bruger har permission system.manage med
-- scope=all og can_edit=true. Permission-baseret, ikke titel-baseret
-- (§5.2, anti-mønster #2).

create or replace function core_identity.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select false;
$$;

comment on function core_identity.is_admin() is
  'Trin 1 stub: returnerer false. Redefineres i bootstrap (t1_08) til at læse core_identity.role_page_permissions.';

-- ─── Permissions ─────────────────────────────────────────────────────────
revoke all on function core_identity.current_employee_id() from public;
revoke all on function core_identity.is_admin() from public;
grant execute on function core_identity.current_employee_id() to authenticated, anon, service_role;
grant execute on function core_identity.is_admin() to authenticated, anon, service_role;
