-- Trin 4 nødvendigt sikkerheds-flip: deaktivér auto-lock globalt.
--
-- Baggrund (teknisk-gaeld G012):
-- pay_period_compute_candidate er skeleton i trin 7 — den genererer
-- 0.00-amount placeholder commission-snapshots fordi sales (trin 14)
-- og aggregat-formler (trin 13/22) ikke eksisterer endnu.
--
-- Auto-lock-cron blev aktiveret i trin 7b og kører dagligt 02:45 UTC.
-- Hvis cron rammer en periode hvor recommended_lock_date er passeret,
-- vil pay_period_lock promovere de tomme placeholder-rows til final
-- commission_snapshots (immutable). Den låste periode vil ikke kunne
-- indeholde reel lønudbetalingsdata uden break-glass-unlock + ny lock-runde
-- — og selv da kun hvis G013 (re-lock idempotency) er løst.
--
-- VALG: Global switch frem for per-periode-flag.
-- Begrundelse: cron tjekker pay_period_settings.auto_lock_enabled FØR den
-- itererer over perioder ("if not v_settings_enabled then return"). Global
-- switch dækker alle nuværende OG fremtidige perioder (ensure_pay_periods_daily
-- opretter nye perioder med per-row-default=true; vi vil ikke flippe alle
-- per-row-flag og glemme at flippe dem tilbage). Reversibel via
-- pay_period_settings_update-RPC.
--
-- RE-AKTIVERING: Når trin 14 (sales-stamme) og trin 22 (medarbejder-aggregater
-- + payroll-linjer) er færdige OG G013 (re-lock idempotency) er løst, skal
-- denne switch flippes til true via UI eller pay_period_settings_update-RPC.
-- Tracking: docs/teknisk/teknisk-gaeld.md [G012].

select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason',
  'safety_flip_g012: deaktivér auto-lock indtil compute_candidate er reel (trin 14+22)',
  false);
select set_config('stork.allow_pay_period_settings_write', 'true', false);

update core_money.pay_period_settings
   set auto_lock_enabled = false
 where id = 1;

-- Sanity-check
do $verify$
declare v_enabled boolean;
begin
  select auto_lock_enabled into v_enabled from core_money.pay_period_settings where id = 1;
  if v_enabled then
    raise exception 'safety_flip_g012: auto_lock_enabled er stadig true efter UPDATE — flip fejlede';
  end if;
end;
$verify$;
