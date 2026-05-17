-- Trin 9 / §4 trin 9 Step 3: org_node_closure + maintain-trigger.
--
-- Plan V6 Beslutning 2 (V5-sweep): closure-tabel er current-state-derived
-- fra org_node_versions effective at current_date. Trigger rebuilds closure
-- når versions ændres. Closure repræsenterer ALDRIG future-dated structure.
--
-- Plan V6 Valg 3: tilføj org_node_closure til AUDIT_EXEMPT_SNAPSHOT_TABLES
-- allowlist (derived-tables-kategori — G-nummer-kandidat for master-plan-rettelse).
--
-- Historisk-tree-queries (org_tree_read_at) bruger recursive CTE over versions
-- direkte for given dato; closure-tabellen er kun for current state (performance).

-- no-dedup-key: closure-tabel er current-state-derived fra org_node_versions; PK er (ancestor, descendant).
create table core_identity.org_node_closure (
  ancestor_id uuid not null references core_identity.org_nodes(id) on delete cascade,
  descendant_id uuid not null references core_identity.org_nodes(id) on delete cascade,
  depth integer not null check (depth >= 0),
  primary key (ancestor_id, descendant_id)
);

comment on table core_identity.org_node_closure is
  'T9 Step 3 (V5-sweep): current-state-derived closure af org_node_versions effective at current_date. Inkluderer self-reference (depth=0) per master-plan §1.7. Rebuilds når versions ændres. ALDRIG future-dated state.';

-- Index på descendant_id for revers-lookup.
create index org_node_closure_descendant on core_identity.org_node_closure (descendant_id);

alter table core_identity.org_node_closure enable row level security;
alter table core_identity.org_node_closure force row level security;

revoke all on table core_identity.org_node_closure from public, anon, service_role;
grant select on table core_identity.org_node_closure to authenticated;

create policy org_node_closure_select on core_identity.org_node_closure
  for select to authenticated using (true);

-- Bemærk: ingen audit-trigger på closure-tabel (derived-fra-versions; audit-spor
-- lever på versions). Plan V6 Valg 3 + G-nummer-kandidat for rettelse 23-
-- kategori-udvidelse til derived-tables.

-- ─── Closure-rebuild-funktion ───────────────────────────────────────────
-- Genberegner hele closure-tabellen fra versions effective at current_date.
-- Small N (typisk <100 org_nodes); full rebuild er trivielt billig.
create or replace function core_identity._org_node_closure_rebuild()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Truncate er destructive; men closure er derived og restoreable.
  -- Som SECURITY DEFINER kører som table owner med tilstrækkelig privilegier.
  delete from core_identity.org_node_closure;

  -- Bygge recursive CTE over versions effective at current_date.
  with recursive nodes_now as (
    -- Alle aktive (is_active eller ej) nodes med current-effective version.
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
    -- Recursive: walk parent-chain.
    select n.parent_id as ancestor_id, ac.descendant_id, ac.depth + 1
    from ancestor_chain ac
    join nodes_now n on n.node_id = ac.descendant_id
    where n.parent_id is not null
      and ac.depth < 100
  )
  insert into core_identity.org_node_closure (ancestor_id, descendant_id, depth)
  select ancestor_id, descendant_id, depth from ancestor_chain;
end;
$$;

comment on function core_identity._org_node_closure_rebuild() is
  'T9 Step 3: genberegn closure-tabel fra versions effective at current_date. Aktiveres af trigger på org_node_versions mutation. Idempotent.';

revoke execute on function core_identity._org_node_closure_rebuild() from public, anon, authenticated;

-- ─── Trigger på org_node_versions ────────────────────────────────────────
-- AFTER INSERT/UPDATE/DELETE på versions → rebuild closure.
-- Row-level: hver mutation triggerer rebuild. For en pending-apply der
-- gør 2 mutationer (luk prior + insert ny) fyrer trigger 2 gange; sidste vinder.
-- Idempotent + cheap for small N.
create or replace function core_identity._org_node_versions_trigger_closure_rebuild()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform core_identity._org_node_closure_rebuild();
  return null;  -- AFTER trigger ignorerer return.
end;
$$;

create trigger org_node_versions_maintain_closure
  after insert or update or delete on core_identity.org_node_versions
  for each row execute function core_identity._org_node_versions_trigger_closure_rebuild();

-- ─── Tilføj org_node_closure til AUDIT_EXEMPT_SNAPSHOT_TABLES ───────────
-- Plan V6 Valg 3 + G-nummer-kandidat: rettelse 23-kategori-udvidelse til derived-tables.
-- Allowlisten lever i scripts/fitness.mjs — opdateres som del af Step 11-13's
-- fitness-check-arbejde.

-- Initialiser closure for eksisterende state (ingen rows endnu, men idempotent).
select core_identity._org_node_closure_rebuild();
