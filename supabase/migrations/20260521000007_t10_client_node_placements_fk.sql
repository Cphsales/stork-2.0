-- Trin 10 T10.7: FK fra core_identity.client_node_placements.client_id
-- til core_identity.clients.id
--
-- T9 Plan V6 Valg 4: client_id var UDEN FK fordi clients-tabel ikke eksisterede
-- (T1 droppede D5's pre-fundament). Trin 10 etablerer clients (T10.1) og kan
-- nu tilføje FK.
--
-- ON DELETE RESTRICT: forhindrer DELETE af klient med åbne placements
-- (krav-dok §2.2.3 "Klient kan ikke dræbe et team" — klient deaktiveres via
-- is_active=false, ikke DELETE; men hvis DELETE forsøges, blokerer FK).
--
-- Afhænger af T10.7a: T9-smoke-tests opdateret til at seede clients-fixture
-- FØR FK aktiveres. ALTER ADD CONSTRAINT brækker ellers eksisterende tests.

alter table core_identity.client_node_placements
  add constraint client_node_placements_client_id_fkey
  foreign key (client_id) references core_identity.clients(id)
  on delete restrict;

comment on constraint client_node_placements_client_id_fkey on core_identity.client_node_placements is
  'T10.7: FK fra client_id til core_identity.clients(id). ON DELETE RESTRICT støtter krav-dok §2.2.3 (klient deaktiveres, ikke slettes). T9 Plan V6 Valg 4 indfriet.';
