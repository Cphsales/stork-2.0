-- Trin 10 T10.6: clients_validate_fields BEFORE INSERT/UPDATE-trigger
--
-- LENIENT-default: WARNING ved ukendte/inaktive keys i fields jsonb.
-- Strict-mode: stork.clients_fields_strict='true' → raise exception.
--
-- Matcher D5's pattern (genskabt i nyt schema). Inaktive felt-definitioner
-- behandles som "ukendt" — keys i fields jsonb der refererer dem giver warning.
-- Det er forretningsmæssigt korrekt: deaktiveret felt skal ikke længere udfyldes.
--
-- T10.16 tilføjer denne funktion til LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS-allowlist
-- (Codex runde 7 KRITISK): client_field_definitions har kun is_active, ingen
-- status-kolonne; R7d-pattern gælder ikke.

create or replace function core_identity.clients_validate_fields()
returns trigger
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_strict boolean;
  v_unknown_keys text[];
begin
  if new.fields is null or jsonb_typeof(new.fields) <> 'object' then
    return new;
  end if;

  v_strict := coalesce(
    nullif(current_setting('stork.clients_fields_strict', true), ''),
    'false'
  ) = 'true';

  select array_agg(n.key order by n.key)
    into v_unknown_keys
    from jsonb_each(new.fields) as n(key, value)
    where not exists (
      select 1 from core_identity.client_field_definitions cfd
      where cfd.key = n.key and cfd.is_active = true
    );

  if v_unknown_keys is not null and array_length(v_unknown_keys, 1) > 0 then
    if v_strict then
      raise exception 'clients_validate_fields: ukendte/inaktive keys i fields: % (stork.clients_fields_strict=true)',
        v_unknown_keys using errcode = '23514';
    else
      raise warning 'clients_validate_fields: ukendte/inaktive keys i fields (LENIENT - INSERT/UPDATE accepteret): %',
        v_unknown_keys;
    end if;
  end if;

  return new;
end;
$$;

comment on function core_identity.clients_validate_fields() is
  'T10.6: BEFORE INSERT/UPDATE-trigger på core_identity.clients. LENIENT-default WARNING ved ukendte/inaktive keys i fields. Strict via stork.clients_fields_strict=true. Filtrerer på cfd.is_active=true som lifecycle-signal (R7d-allowlist i T10.16).';

create trigger clients_validate_fields
  before insert or update on core_identity.clients
  for each row execute function core_identity.clients_validate_fields();
