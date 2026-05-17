-- Trin 9 / §4 trin 9 Step 12: Seed Cph Sales + Ejere + Mathias/Kasper + superadmin-grants.
--
-- Plan V6 Valg 12 (V5-sweep): identity + version pair-pattern.
-- mathias-afgoerelser pkt 1+18 + krav-dok 3.3.4: Mathias + Kasper på "Ejere"-afdeling.
-- Eneste konkrete navne i krav-dokumentet (bootstrap, ikke fri valg).

-- ─── FIX: closure-rebuild CTE-bug fra Step 3 (000002) ──────────────────
-- Step 3's rekursive CTE havde `join n.node_id = ac.descendant_id` (linje 71)
-- i stedet for `ac.ancestor_id`. Det fik recursion til at gen-besøge samme
-- (parent, child)-relation på alle depths 1..100 i stedet for at gå op til
-- bedsteforælderen. PK = (ancestor_id, descendant_id) → duplicate-key
-- violation ved første ægte INSERT (her i seed_owners).
--
-- Step 3 er applied; immutability gælder. Fix via CREATE OR REPLACE her
-- (PRE-seeds så closure-trigger har korrekt logik når seeds INSERT'er).
create or replace function core_identity._org_node_closure_rebuild()
returns void
language plpgsql
security definer
set search_path = ''
as $fix$
begin
  delete from core_identity.org_node_closure;

  with recursive nodes_now as (
    select distinct on (node_id) node_id, parent_id
    from core_identity.org_node_versions
    where effective_from <= current_date
      and (effective_to is null or effective_to > current_date)
    order by node_id, effective_from desc
  ),
  ancestor_chain as (
    -- Base: self-reference (depth=0).
    select n.node_id as ancestor_id, n.node_id as descendant_id, 0 as depth
    from nodes_now n
    union all
    -- Recursive: walk parent-chain (FIX: join på ancestor_id, ikke descendant_id).
    select n.parent_id as ancestor_id, ac.descendant_id, ac.depth + 1
    from ancestor_chain ac
    join nodes_now n on n.node_id = ac.ancestor_id
    where n.parent_id is not null
      and ac.depth < 100
  )
  insert into core_identity.org_node_closure (ancestor_id, descendant_id, depth)
  select ancestor_id, descendant_id, depth from ancestor_chain;
end;
$fix$;

do $seed$
declare
  v_root_id uuid := gen_random_uuid();
  v_ejere_id uuid := gen_random_uuid();
  v_mg_id uuid;
  v_km_id uuid;
  v_superadmin_role_id uuid;
  v_admin_role_id uuid;
  v_area_id uuid;
  v_page_id uuid;
  v_tab_id uuid;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T9 Step 12 seed: Cph Sales + Ejere + owners', true);

  -- Hent eksisterende employees fra trin 1 bootstrap.
  select id into v_mg_id from core_identity.employees where email = 'mg@copenhagensales.dk';
  select id into v_km_id from core_identity.employees where email = 'km@copenhagensales.dk';

  if v_mg_id is null or v_km_id is null then
    raise exception 'Step 12 SEED FAILED: mg@ eller km@ findes ikke';
  end if;

  -- ─── Root-knude: Copenhagen Sales (identity + initial version) ───────
  insert into core_identity.org_nodes (id) values (v_root_id);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_root_id, 'Copenhagen Sales', null, 'department', true, '2026-05-17'::date);

  -- ─── Ejere-afdeling (identity + initial version) ─────────────────────
  insert into core_identity.org_nodes (id) values (v_ejere_id);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_ejere_id, 'Ejere', v_root_id, 'department', true, '2026-05-17'::date);

  -- ─── Placér mg@ og km@ på Ejere ──────────────────────────────────────
  insert into core_identity.employee_node_placements
    (employee_id, node_id, effective_from)
  values
    (v_mg_id, v_ejere_id, '2026-05-17'::date),
    (v_km_id, v_ejere_id, '2026-05-17'::date);

  -- ─── Superadmin-rolle (omdøb admin hvis findes, ellers opret) ────────
  select id into v_admin_role_id from core_identity.roles where name = 'admin';
  select id into v_superadmin_role_id from core_identity.roles where name = 'superadmin';

  if v_superadmin_role_id is null then
    if v_admin_role_id is not null then
      -- Omdøb admin → superadmin (per master-plan rettelse 26 + 31).
      update core_identity.roles
      set name = 'superadmin',
          description = 'Superadmin — eneste hardkodede rolle. Visibility=Alt på alle elementer.',
          updated_at = now()
      where id = v_admin_role_id;
      v_superadmin_role_id := v_admin_role_id;
    else
      -- Opret ny superadmin-rolle.
      insert into core_identity.roles (name, description)
      values ('superadmin', 'Superadmin — eneste hardkodede rolle. Visibility=Alt på alle elementer.')
      on conflict (name) do update set description = excluded.description, updated_at = now()
      returning id into v_superadmin_role_id;

      -- Tilknyt mg@ og km@ til superadmin.
      update core_identity.employees set role_id = v_superadmin_role_id where id in (v_mg_id, v_km_id);
    end if;
  end if;

  -- ─── role_permission_grants for superadmin: visibility='all' på alle elementer ─
  for v_area_id in select id from core_identity.permission_areas where is_active
  loop
    insert into core_identity.role_permission_grants
      (role_id, area_id, page_id, tab_id, can_access, can_write, visibility)
    values
      (v_superadmin_role_id, v_area_id, null, null, true, true, 'all')
    on conflict (role_id, coalesce(area_id::text, ''), coalesce(page_id::text, ''), coalesce(tab_id::text, ''))
    do update set
      can_access = true, can_write = true, visibility = 'all', updated_at = now();
  end loop;

  -- Tilføj area-grants for T9-pages der ikke har area-grants endnu (hvis ikke seeded ovenfor).
  -- (Step 11's seed dækker eksisterende; T9-specifikke pages er omfattet via area).
end;
$seed$;
