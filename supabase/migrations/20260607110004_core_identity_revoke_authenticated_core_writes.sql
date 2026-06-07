-- gov-3b-3b (#18 retning A) — LUKKER [G065]: REVOKE alle authenticated direkte write-grants på core_*.
-- Forudsætning: alle 14 T9-write-RPC'er er nu SECURITY DEFINER (3a's 9 + denne pakkes 5) → 0 auth-eksekverbare
-- INVOKER-writers afhænger af grantet. Apps skriver kun via SECDEF-RPC'er (postgres/bypassrls).
-- §1.1:157 ("direkte tabel-rettigheder revokes fra alle roller") + §3 #18.
--
-- BEHOLD SELECT (læsning via SELECT-policies). Kun write-privileger revokes. postgres/service_role urørt.
-- ALL TABLES IN SCHEMA = også defense-in-depth mod tabeller uden nuværende grant + partition-børn (no-op).
-- De moot authenticated-write-policies BLIVER (D4 write-policy-session-var-consistency kræver dem; harmless uden grant).
-- Idempotent (revoke).

revoke insert, update, delete, truncate on all tables in schema core_identity, core_compliance, core_money from authenticated;
revoke insert, update, delete, truncate on all tables in schema core_identity, core_compliance, core_money from anon;
