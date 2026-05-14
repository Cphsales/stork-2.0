-- Trin 1 inline-fix (G019 i teknisk-gaeld): stork_audit() håndterer non-uuid id.
--
-- Baggrund: stork_audit-trigger (t1_audit_partitioned) caster `id`-feltet til
-- uuid uden at verificere typen først:
--   v_record_id := (to_jsonb(new) ->> 'id')::uuid;
--
-- For tabeller med uuid PK virker det. Men trin 1's superadmin_settings og
-- trin 7's pay_period_settings bruger henholdsvis integer/smallint PK (id=1
-- singleton-konvention). INSERT på disse tabeller skete BEFORE audit-trigger
-- blev attached (intet audit-event for bootstrap). MEN: første UPDATE fejler
-- med "invalid input syntax for type uuid: \"1\"".
--
-- Bug-opdaget: 2026-05-14 ved forsøg på at deaktivere auto-lock-cron globalt
-- via UPDATE pay_period_settings.auto_lock_enabled (G012-mitigation).
--
-- Fix: TRY/CATCH omkring uuid-cast. Hvis id ikke kan castes, sætter vi
-- record_id=NULL. audit_log.record_id er allerede nullable. old_values og
-- new_values jsonb bevarer den faktiske id-værdi som tekst, så audit-spor
-- er intakt.
--
-- Vision-tjek:
-- - Bygger den rigtige løsning? Ja — singletons skal kunne UPDATE'es uden
--   audit-bypass. TRY/CATCH er minimal-invasiv og semantisk korrekt.
-- - Vision-styrkelse: "Anonymisering bevarer audit" + "Én sandhed" —
--   audit-trail virker nu for alle PK-typer.
-- - Vision-svækkelse: ingen.
-- - Teknisk gæld akkumuleret: nej (det er en ren fix af eksisterende gæld G019).
-- - Konklusion: forsvarligt.

create or replace function core_compliance.stork_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source_type text;
  v_change_reason text;
  v_old jsonb;
  v_new jsonb;
  v_changed text[];
  v_record_id uuid;
  v_id_text text;
  v_actor uuid := auth.uid();
begin
  -- source_type detection
  v_source_type := current_setting('stork.source_type', true);
  if v_source_type is null or v_source_type = '' then
    if pg_trigger_depth() > 1 then
      v_source_type := 'trigger_cascade';
    elsif current_user in ('service_role', 'supabase_admin') then
      v_source_type := 'service_role';
    elsif v_actor is not null then
      v_source_type := 'manual';
    else
      v_source_type := 'unknown';
    end if;
  end if;

  v_change_reason := current_setting('stork.change_reason', true);
  if v_change_reason is null or length(trim(v_change_reason)) = 0 then
    if v_source_type in ('cron', 'trigger_cascade') then
      v_change_reason := 'auto: ' || tg_op || ' on ' || tg_table_schema || '.' || tg_table_name;
    else
      raise exception 'stork.change_reason session-var er paakraevet for source_type=%', v_source_type
        using errcode = 'P0001';
    end if;
  end if;

  -- Bestem record_id med graceful håndtering af non-uuid PK (singletons).
  -- Hvis id ikke er en gyldig uuid, lagrer vi det som tekst i new/old_values
  -- og sætter v_record_id=NULL. audit_log.record_id er nullable.
  if tg_op = 'DELETE' then
    v_id_text := to_jsonb(old) ->> 'id';
    v_old := core_compliance.audit_filter_values(tg_table_schema, tg_table_name, to_jsonb(old));
    v_new := null;
  elsif tg_op = 'INSERT' then
    v_id_text := to_jsonb(new) ->> 'id';
    v_old := null;
    v_new := core_compliance.audit_filter_values(tg_table_schema, tg_table_name, to_jsonb(new));
  else  -- UPDATE
    v_id_text := to_jsonb(new) ->> 'id';
    v_old := core_compliance.audit_filter_values(tg_table_schema, tg_table_name, to_jsonb(old));
    v_new := core_compliance.audit_filter_values(tg_table_schema, tg_table_name, to_jsonb(new));
    select array_agg(key)
    into v_changed
    from jsonb_each(to_jsonb(new)) n
    where to_jsonb(old)->>n.key is distinct from n.value::text;
  end if;

  -- Forsøg uuid-cast. Hvis fejl (non-uuid PK fx singleton id=1), behold NULL.
  begin
    v_record_id := v_id_text::uuid;
  exception when invalid_text_representation or others then
    v_record_id := null;
  end;

  insert into core_compliance.audit_log (
    occurred_at, table_schema, table_name, record_id, operation,
    actor_user_id, actor_role, source_type, change_reason,
    schema_version, changed_columns, old_values, new_values, trigger_depth
  ) values (
    now(), tg_table_schema, tg_table_name, v_record_id, tg_op,
    v_actor, current_user, v_source_type, v_change_reason,
    1, v_changed, v_old, v_new, pg_trigger_depth()
  );

  return null;
end;
$$;

comment on function core_compliance.stork_audit() is
  'Universel audit-trigger. AFTER INSERT/UPDATE/DELETE. SECURITY DEFINER. Trin 1 + inline-fix G019 (2026-05-14): TRY/CATCH omkring uuid-cast så singletons med integer/smallint PK ikke crash''er audit. record_id=NULL ved non-uuid PK; id-værdien bevares i old/new_values jsonb.';
