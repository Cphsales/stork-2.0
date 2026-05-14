-- Q-SEED: bootstrap 20 page/tab-permissions til superadmin-rolle.
--
-- BAGGRUND (master-plan rettelse 31):
-- 20 RPC'er konverteres fra is_admin() til has_permission(page, tab, can_edit).
-- For at undgå brick-on-cutover seedes superadmin-rolle med alle 20
-- permissions via ON CONFLICT DO NOTHING.
--
-- LISTE (godkendt af Mathias 2026-05-15):
-- page=audit:           log(read), anonymization(read), cron(read+export)
-- page=classification:  manage(upsert+delete)
-- page=anonymization:   replay(replay)
-- page=break_glass:     request, approve(approve+reject), execute, view(read)
-- page=employees:       manage(upsert), terminate, anonymize
-- page=roles:           manage(upsert), permissions(upsert)
-- page=pay_periods:     compute, lock, settings

select set_config('stork.source_type', 'migration', false);
select set_config('stork.allow_role_page_permissions_write', 'true', false);
select set_config('stork.change_reason',
  'Q-SEED: bootstrap 20 RPC-permissions til superadmin (Q-pakke rettelse 31)', false);

insert into core_identity.role_page_permissions
  (role_id, page_key, tab_key, can_view, can_edit, scope)
select (select id from core_identity.roles where name = 'superadmin'),
       page_key, tab_key, can_view, can_edit, 'all'
from (values
  -- page=audit
  ('audit',          'log',           true,  false),
  ('audit',          'anonymization', true,  false),
  ('audit',          'cron',          true,  true),   -- _read kræver kun can_view; _export kræver can_edit
  -- page=classification
  ('classification', 'manage',        true,  true),
  -- page=anonymization
  ('anonymization',  'replay',        true,  true),
  -- page=break_glass
  ('break_glass',    'request',       true,  true),
  ('break_glass',    'approve',       true,  true),   -- approve + reject deler tab
  ('break_glass',    'execute',       true,  true),
  ('break_glass',    'view',          true,  false),
  -- page=employees
  ('employees',      'manage',        true,  true),
  ('employees',      'terminate',     true,  true),
  ('employees',      'anonymize',     true,  true),
  -- page=roles
  ('roles',          'manage',        true,  true),
  ('roles',          'permissions',   true,  true),
  -- page=pay_periods
  ('pay_periods',    'compute',       true,  true),
  ('pay_periods',    'lock',          true,  true),
  ('pay_periods',    'settings',      true,  true)
) as perms(page_key, tab_key, can_view, can_edit)
on conflict (role_id, page_key, coalesce(tab_key, '')) do nothing;
