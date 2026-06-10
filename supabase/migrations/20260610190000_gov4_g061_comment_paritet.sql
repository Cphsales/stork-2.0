-- gov-4 batch 1: G061-opsamling — comment-paritet (repo↔live).
-- Diff-summary (patch-først §3.1): genudfører 2 comment on-statements 1:1 fra
-- deres oprindelige migrationsfiler; de nåede aldrig live (deploy fyrede ikke,
-- H020-æraen). Live-dump 2026-06-10 (plan §3.2): begge live_comment = null.
-- Ikke-destruktiv (§3.9 N/A). Ingen øvrige objekter berøres.

-- 1:1 fra 20260521000007_t10_client_node_placements_fk.sql:20
comment on constraint client_node_placements_client_id_fkey on core_identity.client_node_placements is
  'T10.7: FK fra client_id til core_identity.clients(id). ON DELETE RESTRICT støtter krav-dok §2.2.3 (klient deaktiveres, ikke slettes). T9 Plan V6 Valg 4 indfriet.';

-- 1:1 fra 20260521100003_t9_supplement_2_permission_actions.sql:36
comment on table core_identity.permission_actions is
  'T9-supplement-2: handlings-granularitet under tabs. Konfigurerede actions kræver action-grant + tab-can_write (eller kun can_access hvis bypass_tab_write=true). requires_second_approver/has_undo/bypass_tab_write er kode-låste; second_approver_type er UI-redigerbart.';
