-- gov-3b-3a (#18 retning A): konvertér permission_tab-RPC'er INVOKER → SECURITY DEFINER.
-- DIFF-summary: tilføjer KUN `SECURITY DEFINER` til 2 eksisterende funktioner. Body 1:1 bevaret.
-- Behavior-preserving (kører som postgres/bypassrls; has_permission() gater via JWT). Idempotent.

CREATE OR REPLACE FUNCTION core_identity.permission_tab_upsert(p_id uuid, p_page_id uuid, p_name text, p_is_active boolean DEFAULT true, p_sort_order integer DEFAULT 0)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_id uuid;
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_tab_upsert', true);

  if p_id is null then
    insert into core_identity.permission_tabs (page_id, name, is_active, sort_order)
    values (p_page_id, p_name, p_is_active, p_sort_order) returning id into v_id;
  else
    insert into core_identity.permission_tabs (id, page_id, name, is_active, sort_order)
    values (p_id, p_page_id, p_name, p_is_active, p_sort_order)
    on conflict (id) do update
    set page_id = excluded.page_id, name = excluded.name,
        is_active = excluded.is_active, sort_order = excluded.sort_order,
        updated_at = now()
    returning id into v_id;
  end if;
  return v_id;
end; $function$;

CREATE OR REPLACE FUNCTION core_identity.permission_tab_deactivate(p_tab_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_tab_deactivate', true);
  update core_identity.permission_tabs set is_active = false, updated_at = now() where id = p_tab_id;
end; $function$;
