// Mekanisk transformation af forventnings-manifest.json v3.1 (ce191381) -> v3.2 (afledt af plan v3.2 §1).
// Hjaelper uden for workdir; ikke en leverance. Laeser og skriver KUN manifestet.
const fs = require('fs');
const p = process.argv[2];
const m = JSON.parse(fs.readFileSync(p, 'utf8'));
m.bindings.plan.oid = '<udfyldes af driveren>';
const g = m.guards.find(x => x.id === 'g.pii_klassifikation_guard');
g.beskrivelse = 'BEFORE INSERT/UPDATE/DELETE-trigger paa core_compliance.data_field_definitions med tre grene: (1) delete af direct-raekke, (2) direct->lavere og rename af direct-raekke, (3) pii_level=indirect paa pakkens 9 tabeller - alle afvises uden bypass (S-21 + S-2-B/M-42; T7.1/T7.2/T7.10)';
const byId = id => m.obligations.find(o => o.id === id);
const neg = (oid, nid) => byId(oid).negatives.find(n => n.id === nid);
const shift = a => { const mm = /^P:(\d+)$/.exec(a); if (!mm) return a; const n = +mm[1]; return 'P:' + (n >= 103 && n <= 380 ? n + 34 : n); };
for (const o of m.obligations) {
  o.kildeankre = o.kildeankre.map(shift);
  for (const n of o.negatives) {
    const rc = n.reject_contract;
    if (rc.grund) {
      rc.grund = rc.grund.replace(/: (gruppe|lokation|klient|stand|kontakt|pending) % findes ikke$/, ': $1 findes ikke');
      rc.grund = rc.grund.replace(/: p_(gruppe_id|lokation_id|klient_id|stand_id|kontakt_id) er paakraevet$/, ': $1 er paakraevet');
    }
    if (typeof rc.aktoer === 'string' && rc.aktoer.startsWith('MANGLER KILDE')) rc.aktoer = 'authenticated';
    if (rc.kanal === 'exit') { rc.aktoer = 'ci'; rc.fase = 'ci'; }
  }
}
byId('K-1/ac-4').effekt_bid = '5.1';
byId('K-1/ac-4').kildeankre.push('P:602');
neg('K-1/ac-4', 'K-1/ac-4/neg-1').beskrivelse = 'leverance-mutant: FK/kolonne mod core_money, provision-kolonne i lokation_hent returns eller core_money-reference i I5-body -> fitness/kontrakt-assert roed (AK-CI-GATE). Slutbinding i Bid 5.1: asserten itererer ALLE 43 pakke-funktioner (plan §1 K-1/ac-4, A3-2).';
byId('K-2/S').effekt_bid = '2.2';
neg('K-2/S', 'K-2/S/neg-1').beskrivelse = 'stand_opret med stand-id som lokation -> AK-FINDES-IKKE; samme case som K-2/ac-1/neg-1. Ingen uuid i beskeden (S-41). Rolle R+.';
for (const n of byId('K-2/ac-1').negatives) n.beskrivelse = n.beskrivelse.replace(/\s*%\s*=\s*[^.]*runtime[^.]*\.?/g, ' Ingen uuid i beskeden (S-41).');
neg('K-2/ac-6', 'K-2/ac-6/neg-1').reject_contract.grund = 'lokation_opret: foerste_stand_navn er paakraevet';
neg('K-2/ac-6', 'K-2/ac-6/neg-1').beskrivelse = 'p_foerste_stand_navn NULL/blank -> AK-NAVN (<felt>-reglen: foerste_stand_navn); ingen lokation committed. Rolle R+.';
for (const [oid, nid, tabel] of [['K-4/ac-2', 'K-4/ac-2/neg-2', 'lokation_status_skift'], ['K-8/ac-2', 'K-8/ac-2/neg-3', 'grupper']]) {
  const n = neg(oid, nid);
  n.reject_contract.grund = 'stork.change_reason session-var er paakraevet for source_type=unknown';
  n.beskrivelse = 'ctx-B (S) INSERT i ' + tabel + ' uden stork.change_reason -> stork_audit P0001 (e3cfa9fe:47-67). ctx-B saetter IKKE stork.source_type; under postgres uden JWT afleder triggeren source_type=unknown (S-43).';
}
neg('K-4/ac-9', 'K-4/ac-9/neg-1').beskrivelse = 'lovligt fravalgs-request -> nedlaeg L1 -> approve/due/apply -> AK-NEDLAGT ved apply i I3 (pending forbliver approved; ingen relation skrevet). Request af R+, godkendt af A+; pending_change_apply kaldes som authenticated (A+ via API - S-40).';
neg('K-6/ac-2', 'K-6/ac-2/neg-2').beskrivelse = 'to requests foer foerste apply -> anden apply (authenticated, A+ via API - S-40) -> AK-KOBLING-FINDES (apply-genvalidering i I1 under gruppe-laas; pending forbliver approved; 23505/23P01 er bagstoppere).';
neg('K-6/ac-10', 'K-6/ac-10/neg-4').beskrivelse = 'apply foer undo-frist (authenticated, A+ via API - S-40) -> AK-F-NOTDUE not_yet_due (fundament f49e7d5b:177-181; besked verificeret).';
neg('K-6/ac-10', 'K-6/ac-10/neg-5').beskrivelse = 'apply foer oensket dato (authenticated, A+ via API - S-40) -> AK-F-NOTDUE not_yet_due (fundament f49e7d5b:183-187; besked verificeret).';
neg('K-6/ac-10', 'K-6/ac-10/neg-10').beskrivelse = 'apply-handler I1 moeder payload-dato (ISO YYYY-MM-DD, S-39) <> effective_from (ctx-B-praepareret pending) -> AK-DATO-DRIFT (date-sammenligning, R2-7). Apply som authenticated (S-40).';
neg('K-7/ac-2', 'K-7/ac-2/neg-2').reject_contract.grund = 'entity {id} af type gruppe_kontakt findes ikke eller er allerede anonymized';
neg('K-7/ac-2', 'K-7/ac-2/neg-2').beskrivelse = "anonymiser_gruppe_kontakt(K1b) igen -> AK-F-ALLEREDE (fundament 6083fecd:107-109 via I5; fuld besked verificeret). {id} = K1b's uuid (p_kontakt_id) - substitutionsregel B, plan §0.2/S-41. Rolle R+.";
for (const nid of ['K-7/ac-4/neg-2', 'K-7/ac-4/neg-6']) neg('K-7/ac-4', nid).reject_contract.grund = 'anonymiseringsdaekning_ufuldstaendig: core_identity.gruppe_kontakter.telefon mangler strategi';
neg('K-7/ac-4', 'K-7/ac-4/neg-2').beskrivelse = 'mapping i status tested redigeret uden telefon -> AK-DAEKNING (A2-3-kaeden). Besked = sag (a) for foerste udaekkede direct-kolonne i column_name-orden (email/navn daekkede, telefon udaekket) - S-44. Rolle R+.';
neg('K-7/ac-4', 'K-7/ac-4/neg-6').beskrivelse = 'aktiv mapping redigeret uden telefon -> AK-DAEKNING (samme besked som neg-2, S-44). Rolle R+.';
byId('K-7/ac-4').kildeankre.push('K:137', 'T:164');
byId('K-7/ac-4').assertions.push(
  { id: 'k-7.ac-4.fs.e-event-based-ingen-tidlig-erstatning-d0-plus-29', form: 'FS' },
  { id: 'k-7.ac-4.fs.e-event-based-k1a-erstattet-d0-plus-30-via-retention-job-k1b-kh-uberoerte', form: 'FS' },
  { id: 'k-7.ac-4.fs.e-uden-ui-valg-sker-intet-k142', form: 'FS' }
);
byId('K-7/S').effekt_bid = '1.2';
byId('K-7/S').kildeankre.push('K:143');
byId('K-7/S').negatives.push({
  id: 'K-7/S/neg-4',
  beskrivelse: "data_field_definition_upsert('core_identity','lokationer','adresse','master_data','indirect','Adresse ...', null, null, null, aarsag) som R+ (classification/manage) -> AK-PII-INDIRECT (trigger BEFORE UPDATE-gren, raekken findes som none); samme som SA. adresse forbliver none (S-2-B, M-42, K:143).",
  reject_contract: {
    kanal: 'sqlstate', sqlstate: 'P0001',
    grund: 'pii_indirect_uden_anonymiseringsvej: core_identity.lokationer.adresse',
    afvisningssted: 'core_compliance._pii_klassifikation_guard',
    fase: 'konfiguration (data_field_definition_upsert)',
    aktoer: 'authenticated', observationskanal: 'sqlstate',
    offentlig_signatur: 'data_field_definition_upsert(text,text,text,text,text,text,text,jsonb,text,text)'
  },
  sole_guard_ref: 'g.pii_klassifikation_guard'
});
const n82 = neg('K-8/ac-2', 'K-8/ac-2/neg-2');
n82.beskrivelse = "blank aarsag paa familie A - de SYV faelles fundament-RPC'er m. aarsagsparameter (data_field_definition_upsert/_delete, anonymization_mapping_upsert/_test_run/_approve/_activate, anonymization_strategy_activate) -> 22023 change_reason er paakraevet (arv, observeret). Repraesentant anonymization_mapping_upsert (ec3d9a0b:129-131); ekspansionsreglen giver de oevrige seks. RPC'er UDEN aarsagsparameter (role_permission_grant_set, undo_setting_update, replay_anonymization, pending_change_approve/undo) har intet aarsags-negativ - deres kontrakt er labelen (plan §0.3). Rolle R+.";
n82.reject_contract.afvisningssted = 'core_compliance.anonymization_mapping_upsert';
n82.reject_contract.fase = 'konfiguration (faelles RPC, familie A)';
n82.reject_contract.offentlig_signatur = 'anonymization_mapping_upsert(text,text,text,jsonb,text,text,text,text,text) m.fl. (familie A)';
const a82 = byId('K-8/ac-2').assertions;
const d = a82.find(a => a.id === 'k-8.ac-2.fs.d-faelles-fundament-rpc-brugerens-tekst-i-audit');
d.id = 'k-8.ac-2.fs.d-faelles-rpc-audit-praecis-som-0-3-tabellen-aarsag-eller-praefiks';
a82.push({ id: 'k-8.ac-2.fs.pending-update-til-applied-baerer-brugerens-tekst', form: 'FS' });
const o83 = byId('K-8/ac-3');
const old2 = o83.negatives.find(n => n.id === 'K-8/ac-3/neg-2');
old2.beskrivelse = 'ctx-B (S), audit-familien: TRUNCATE core_compliance.audit_log -> block_truncate_immutable P0001 (statement-trigger paa PARENT, a7ec4884:194-207; besked uden partitionsnavn). UPDATE/DELETE-row-proben mod audit koeres som S-observation uden manifest-lighed (audit_log_immutability_check baerer partitionens tg_table_name). S-45/V31-4.';
old2.reject_contract = { kanal: 'sqlstate', sqlstate: 'P0001', grund: 'TRUNCATE blokeret på immutable tabel core_compliance.audit_log', afvisningssted: 'core_compliance.block_truncate_immutable', fase: 'direkte DML (ctx-B ejer-probe, schema-bevis)', aktoer: 'postgres', observationskanal: 'sqlstate', offentlig_signatur: 'TRUNCATE core_compliance.audit_log (ctx-B)' };
o83.negatives.push({
  id: 'K-8/ac-3/neg-3',
  beskrivelse: 'ctx-B (S), historik-logs-familien: UPDATE/DELETE (row) og TRUNCATE (statement) paa de tre logs -> _historik_immutabel P0001. Repraesentant UPDATE core_identity.pris_historik; ekspansion 3 logs x 3 operationer (grund = <tabel>_immutabel (operation <op>)). S-45.',
  reject_contract: { kanal: 'sqlstate', sqlstate: 'P0001', grund: 'pris_historik_immutabel (operation UPDATE)', afvisningssted: 'core_identity._historik_immutabel', fase: 'direkte DML (ctx-B ejer-probe, schema-bevis)', aktoer: 'postgres', observationskanal: 'sqlstate', offentlig_signatur: 'UPDATE core_identity.pris_historik (ctx-B)' }
});
o83.negatives.push({
  id: 'K-8/ac-3/neg-4',
  beskrivelse: 'ctx-B (S), koblings-/fravalgs-familien: DELETE, TRUNCATE (statement) og ulovlig UPDATE (lukket raekke; andre kolonner end gaeldende_til) -> _kobling_historik_guard P0001; lovlig luk-UPDATE passerer (positiv kontrol). Repraesentant DELETE FROM core_identity.gruppe_klient_koblinger. S-45.',
  reject_contract: { kanal: 'sqlstate', sqlstate: 'P0001', grund: 'gruppe_klient_koblinger_immutabel (operation DELETE)', afvisningssted: 'core_identity._kobling_historik_guard', fase: 'direkte DML (ctx-B ejer-probe, schema-bevis)', aktoer: 'postgres', observationskanal: 'sqlstate', offentlig_signatur: 'DELETE FROM core_identity.gruppe_klient_koblinger (ctx-B)' }
});
neg('K-9/ac-2', 'K-9/ac-2/neg-1').beskrivelse = 'hver READ-handling R1-R16 som R- via API -> AK-PERM (16 cases; pending_change_apply er driftsindgang og undtaget). Repraesentant R1 gruppe_hent pinnet i plan §0.2/§1 (V31-6); ekspansionsreglen giver de oevrige 15.';
neg('K-9/ac-3', 'K-9/ac-3/neg-3').beskrivelse = "app-superadmin (SA) + pii-nedgradering: data_field_definition_upsert('core_identity','gruppe_kontakter','email','master_data','none',...) direct->none (samme case som K-7/S/neg-2; kolonne/niveau pinnet eksplicit i plan §1 K-9/ac-3 - V31-8) -> AK-PII-NEDGRADERING (neg-4 API-signatur er S-note).";
byId('K-6/ac-10').assertions.push({ id: 'k-6.ac-10.fs.datestyle-dmy-request-mdy-apply-samme-dato-2026-04-03-ingen-drift', form: 'FS' });
byId('K-6/ac-10').kildeankre.push('P:90');
fs.writeFileSync(p, JSON.stringify(m, null, 2) + '\n');
console.log('skrevet; obligations=' + m.obligations.length + ' negatives=' + m.obligations.reduce((s, o) => s + o.negatives.length, 0) + ' assertions=' + m.obligations.reduce((s, o) => s + (o.assertions ? o.assertions.length : 0), 0));
