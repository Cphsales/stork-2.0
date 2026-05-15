-- P1a-fix: bring bootstrap-strategier i overensstemmelse med plan-leverance.
--
-- BAGGRUND (Mathias' fang 2026-05-15):
-- P1a-implementationen seedede kun 2 af 3 planlagte strategier ('blank' +
-- 'hash_email'), og 'blank' returnerede '' i stedet for '[anonymized]'.
-- Begge afvigelser fra plan-leverancen var udokumenterede forenklinger.
--
-- RETTELSER:
-- 1. Tilføj _anon_strategy_hash (sha256 generic, uden email-format)
-- 2. Tilføj 'hash' bootstrap-strategy som status='approved'
-- 3. Opdater _anon_strategy_blank: returnerer nu '[anonymized]' så
--    anonymized rows er visuelt eksplicit i UI uden ekstra logik
--
-- Effekt på eksisterende state:
-- - 'blank' og 'hash_email' strategy-rows beholdes (kun deres function-bodies
--   eller registry-rows berøres alt efter case)
-- - Ingen anonymization er kørt endnu (strategier er 'approved', ikke 'active')
--   → safe at ændre function-body for blank uden data-konsekvens

-- ─── Opdatér _anon_strategy_blank: '' → '[anonymized]' ────────────────────
create or replace function core_compliance._anon_strategy_blank(
  p_value text, p_entity_id text
) returns text
language sql immutable parallel safe set search_path = ''
as $$ select '[anonymized]'::text $$;

comment on function core_compliance._anon_strategy_blank(text, text) is
  'P1a (rev): placeholder-streng [anonymized]. Eksplicit anonymization-markering i alle UI-views uden ekstra logik.';

-- ─── Tilføj _anon_strategy_hash (generic sha256) ──────────────────────────
create or replace function core_compliance._anon_strategy_hash(
  p_value text, p_entity_id text
) returns text
language sql immutable parallel safe set search_path = ''
as $$
  select encode(
    extensions.digest(coalesce(p_value, '') || ':' || coalesce(p_entity_id, ''), 'sha256'),
    'hex'
  );
$$;

comment on function core_compliance._anon_strategy_hash(text, text) is
  'P1a-fix: sha256 hex generic hash. For PII der skal anonymiseres til opaque hash uden email-format.';

-- ─── Bootstrap hash-strategy (status='approved') ──────────────────────────
select set_config('stork.source_type', 'migration', false);
select set_config('stork.allow_strategy_write', 'true', false);
select set_config('stork.change_reason',
  'P1a-fix: bootstrap manglende hash-strategy + opdater blank-funktion', false);

insert into core_compliance.anonymization_strategies
  (strategy_name, function_schema, function_name, status, description) values
  ('hash', 'core_compliance', '_anon_strategy_hash', 'approved',
    'P1a-fix: sha256 hex generic hash. For PII der skal anonymiseres uden email-format.')
on conflict (strategy_name) do nothing;

-- Opdatér blank-description for at reflektere ny opførsel
update core_compliance.anonymization_strategies
   set description = 'P1a (rev): placeholder-streng [anonymized]. For navn/fri-tekst-PII; eksplicit anonymization-markering.'
 where strategy_name = 'blank';
