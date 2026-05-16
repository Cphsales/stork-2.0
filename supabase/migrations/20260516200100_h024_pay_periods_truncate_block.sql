-- H024 scope-bonus: BEFORE TRUNCATE-trigger på core_money.pay_periods.
--
-- Codex sidefund #3 (afdæknings-rapport 2026-05-16): pay_periods har
-- `DELETE altid blokeret` via lock_and_delete_check-trigger, men manglede
-- BEFORE TRUNCATE-blokering. TRUNCATE bypasser row-level triggers, så
-- uden denne trigger kunne en migration ramme TRUNCATE og rydde alle
-- pay_periods-rows.
--
-- block_truncate_immutable() er etableret i T7 og bruges allerede på
-- commission_snapshots, salary_corrections, cancellations, audit_log,
-- anonymization_state. Denne migration tilføjer samme håndhævelse til
-- pay_periods.
--
-- Vision-princip 9 (status-modeller bevarer historik) — uændret;
-- pakke-bonus, ikke krav-dok-leverance.

create trigger pay_periods_block_truncate
  before truncate on core_money.pay_periods
  for each statement execute function core_compliance.block_truncate_immutable();
