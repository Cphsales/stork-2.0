#!/usr/bin/env node
// build-harness.selftest.mjs — red-team af case-engine v2.1 (C1-r1 F-3..F-8): observationer er rå, dommen er ren (judgeObservations/
// judgeKill), reject-kontraktens grund/sted/aktør håndhæves, uvedkommende fejl er protokol (aldrig brudt/kill), kills er målrettede.
import { runCase, killCaseMutant, runBuildProofEngine, matchExpect, judgeObservations, judgeKill, brudtPaaFormensMaade, STATUS } from "./build-harness.mjs";
import { expectedSet } from "./forventnings-manifest.mjs";

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log(`  ✓ ${n}`); };
const bad = (n, r) => { fail++; console.error(`  ✗ ${n}: ${r}`); };
const eq = (n, got, want) => (got === want ? ok(n) : bad(n, `fik ${JSON.stringify(got)}, forventede ${JSON.stringify(want)}`));
const OID = (c) => c.repeat(40);
const rc = (sqlstate, sted, grund, fase = "wrapper", aktoer = "app_role") => ({ kanal: "sqlstate", sqlstate, grund, afvisningssted: sted, fase, aktoer, observationskanal: "sqlstate", offentlig_signatur: "f(text)" });
const manifest = {
  schema_version: 1, pakke: "p", bindings: { forventningsliste: { path: "f.md", oid: OID("a") }, krav: { path: "k.md", oid: OID("b") }, plan: { path: "p.md", oid: OID("c") } },
  guards: [{ id: "g.navn", beskrivelse: "navn-check" }, { id: "g.min", beskrivelse: "min-én-stand-trigger" }, { id: "g.pris", beskrivelse: "dato-filter" }, { id: "g.grant", beskrivelse: "grant" }, { id: "g.audit", beskrivelse: "audit" }],
  obligations: [
    { id: "K-1/ac-1", k_id: "K-1", kind: "ac", proof_forms: ["UT", "MH"], scope: "nu", kildeankre: ["K:1"], assertions: [{ id: "audit-row", form: "MH" }], negatives: [{ id: "K-1/ac-1/neg-1", beskrivelse: "blank", reject_contract: rc("22023", "f.lokation_opret", "navn_blank"), sole_guard_ref: "g.navn" }] },
    { id: "K-1/ac-3", k_id: "K-1", kind: "ac", proof_forms: ["FS"], scope: "nu", kildeankre: ["K:3"], assertions: [{ id: "hist", form: "FS" }], negatives: [] },
    { id: "K-2/ac-6", k_id: "K-2", kind: "ac", proof_forms: ["SA", "UT"], scope: "nu", kildeankre: ["K:6"], assertions: [{ id: "r1", form: "SA" }], negatives: [{ id: "K-2/ac-6/neg-1", beskrivelse: "sidste stand", reject_contract: rc("P0001", "f.stand_deaktiver", "min_en_stand", "apply"), sole_guard_ref: "g.min" }] },
    { id: "K-7/S", k_id: "K-7", kind: "struktur", proof_forms: ["UT"], scope: "nu", kildeankre: ["K:7"], negatives: [{ id: "K-7/S/neg-1", beskrivelse: "ci", reject_contract: { kanal: "exit", exit_code: 1, klasse: "klassifikation", afvisningssted: "ci", fase: "ci", aktoer: "ci" } }] },
    { id: "K-2/ac-4", k_id: "K-2", kind: "ac", proof_forms: ["FS"], scope: "overdragelse", overdragelse_ref: "trin 24", kildeankre: ["K:4"], negatives: [] },
  ],
};
const ctx = { forventning: expectedSet(manifest) };
const R = (ok, code = null, message = null, routine = null, rows) => ({ ok, error: ok ? null : message, code, detail: ok ? null : { message, routine }, ...(rows !== undefined ? { rows } : {}) });
// --- mock-runner m. tilstand: knapper slås af/på af mutant-sql ---
function mkRunner(over = {}) {
  const st = { guardNavn: true, pris: 100, grant: true, audit: true, trg: true, laas: true, stateRows: [{ n: 1 }], ...over.state };
  const runner = {
    st,
    sql(text, opts) {
      if (over.sql) { const r = over.sql(text, opts, st); if (r !== undefined) return r; }
      switch (text) {
        case "POS": return R(true);
        case "NEG": return st.guardNavn ? R(false, "22023", "navn_blank", "f.lokation_opret") : R(true);
        case "NEG_ANDEN_GRUND": return R(false, "22023", "lokation_nedlagt", "f.lokation_opret");
        case "NEG_ANDET_STED": return R(false, "22023", "navn_blank", "f.anden_fn");
        case "NEG_WRONG_CLASS": return R(false, "42501", "permission denied", null);
        case "NEG_SYNTAX": return R(false, "42601", "syntax error", null);
        case "STATE": return R(true, null, null, null, st.stateRows.map((r) => ({ ...r })));
        case "ACT": return R(true);
        case "OBS": return R(true, null, null, null, [{ pris: st.pris }]);
        case "OBS_HIST": return R(true, null, null, null, [{ pris: 80 }]);
        case "OBS_EMPTY": return R(true, null, null, null, []);
        case "OBS_NOROWS": return R(true);
        case "OBS_DENIED": return R(false, "42501", "permission denied", null, []);
        case "ACT_MH": return st.grant ? R(true) : R(false, "42501", "permission denied for function", null);
        case "ACT_MH_SYNTAX": return R(false, "42601", "syntax error", null);
        case "AUDIT": return R(true, null, null, null, st.audit ? [{ id: 1 }] : []);
        case "SETUP": return R(true);
        case "SETUP_FAIL": return R(false, "42601", "x", null);
        case "MUT_NAVN_OFF": st.guardNavn = false; return R(true);
        case "MUT_NAVN_ON": st.guardNavn = true; return R(true);
        case "MUT_PRIS_90": st.pris = 90; return R(true);
        case "MUT_PRIS_100": st.pris = 100; return R(true);
        case "MUT_GRANT_OFF": st.grant = false; return R(true);
        case "MUT_GRANT_ON": st.grant = true; return R(true);
        case "MUT_AUDIT_OFF": st.audit = false; return R(true);
        case "MUT_AUDIT_ON": st.audit = true; return R(true);
        case "MUT_TRG_OFF": st.trg = false; return R(true);
        case "MUT_TRG_ON": st.trg = true; return R(true);
        case "MUT_LAAS_OFF": st.laas = false; return R(true);
        case "MUT_LAAS_ON": st.laas = true; return R(true);
        case "MUT_NAVN_OFF_OG_PRIS": st.guardNavn = false; st.pris = 90; return R(true);
        case "MUT_NAVN_ON_PRIS_90": st.guardNavn = true; st.pris = 90; return R(true);   // »restore« der efterlader kontrollen ødelagt
        case "MUT_NOOP": return R(true);
        case "MUT_FAIL": return R(false, "42601", "kan ikke", null);
        case "RESTORE_FAIL": return R(false, "42601", "restore fejl", null);
        default: return R(false, "42601", `ukendt sql ${text}`, null);
      }
    },
    race(s) {
      if (over.race) return over.race(s, st);
      const rej = { pid: 202, ok: false, code: "P0001", detail: { message: "min_en_stand", routine: "f.stand_deaktiver" }, commit: "rollback" };
      const okB = { pid: 202, ok: true, code: null, detail: null, commit: "commit" };
      const a = { pid: 101, ok: true, code: null, detail: null, commit: "commit" };
      if (!st.laas) return { protocolOk: true, a, b: okB, barrier: { observed: false, blocked_pid: null, blocking_pid: null }, invariantRows: [{ aktive: 0 }] };
      if (!st.trg) return { protocolOk: true, a, b: okB, barrier: { observed: true, blocked_pid: 202, blocking_pid: 101 }, invariantRows: [{ aktive: 0 }] };
      return { protocolOk: true, a, b: rej, barrier: { observed: true, blocked_pid: 202, blocking_pid: 101 }, invariantRows: [{ aktive: 1 }] };
    },
    exec(cmd) { return over.exec ? over.exec(cmd) : { exit_code: 1, stdout: "fejl: klassifikation mangler\nklasse=klassifikation\n" }; },
  };
  return runner;
}
const ep = { kind: "rpc", ref: "lokation_opret" }; const actor = { role: "app_role", settings: { "app.org": "1" } }; const HE = "db-row"; const BID = "bid-2";
const C = {
  ut: { case_id: "c-ut", hard_effect: HE, bid_id: BID, obligation_id: "K-1/ac-1", negative_id: "K-1/ac-1/neg-1", proof_form: "UT", fase: "wrapper", entrypoint: ep, actor, positive: { sql: "POS" }, negative: { sql: "NEG" }, state: { sql: "STATE" } },
  fs: { case_id: "c-fs", hard_effect: HE, bid_id: BID, obligation_id: "K-1/ac-3", proof_form: "FS", entrypoint: ep, actor, action: { sql: "ACT" }, observe: { sql: "OBS" }, expect: { kind: "scalar", value: 100 }, checkpoints: [{ id: "hist", observe: { sql: "OBS_HIST" }, expect: { kind: "scalar", value: 80 } }] },
  mh: { case_id: "c-mh", hard_effect: HE, bid_id: BID, obligation_id: "K-1/ac-1", proof_form: "MH", entrypoint: ep, actor, action: { sql: "ACT_MH" }, witnesses: [{ id: "audit-row", observe: { sql: "AUDIT" }, expect: { kind: "count", value: 1 } }] },
  sa: { case_id: "c-sa", hard_effect: HE, bid_id: BID, obligation_id: "K-2/ac-6", proof_form: "SA", entrypoint: ep, actor, race: { race_id: "r1", a: { sql: "A" }, b: { sql: "B" }, barrier: "row-lock", invariant: { observe: { sql: "INV" }, expect: { kind: "scalar", value: 1 } }, reject_negative_id: "K-2/ac-6/neg-1" } },
  ci: { case_id: "c-ci", hard_effect: "state", bid_id: BID, obligation_id: "K-7/S", negative_id: "K-7/S/neg-1", proof_form: "UT", entrypoint: { kind: "ui-flow", ref: "ci" }, actor: { role: "ci" }, check: { cmd: ["node", "klassifikation.mjs"] } },
};
const run = (c, r = mkRunner()) => runCase(c, ctx, r);
const st = async (c, r) => (await run(c, r)).status;
const withCase = (c, mut) => { const x = JSON.parse(JSON.stringify(c)); mut(x); return x; };

console.log("matchExpect — typede observationer:");
eq("empty: rows=[] → opfyldt", matchExpect([], { kind: "empty" }).ok, true);
eq("empty: manglende rows → protokol (null), ikke brudt", matchExpect(null, { kind: "empty" }).ok, null);
eq("scalar uden value → protokol (F-5: ikke NULL-match)", matchExpect([{ v: null }], { kind: "scalar" }).ok, null);
eq("scalar: NULL-observation vs forventet 0 → brudt", matchExpect([{ v: null }], { kind: "scalar", value: 0 }).ok, false);
eq("scalar: ikke-endelig observeret værdi → protokol (F-5)", matchExpect([{ v: Infinity }], { kind: "scalar", value: null }).ok, null);
eq("scalar: streng '100' ≠ tal 100", matchExpect([{ v: "100" }], { kind: "scalar", value: 100 }).ok, false);
eq("null: false ≠ null", matchExpect([{ v: false }], { kind: "null" }).ok, false);
eq("rows: mængde-lig uanset orden", matchExpect([{ a: 1 }, { a: 2 }], { kind: "rows", value: [{ a: 2 }, { a: 1 }] }).ok, true);
eq("rows: dubletmultiplicitet bevares", matchExpect([{ a: 1 }, { a: 1 }], { kind: "rows", value: [{ a: 1 }] }).ok, false);

console.log("\nUT — ulovlig tilladelse (grund · sted · aktør · tilstand):");
eq("baseline → opfyldt", await st(C.ut), STATUS.OPFYLDT);
{ const r = await run(C.ut); eq("observationer er rå og self-contained (kontrakt · positive · negative m. detail · state før/efter · aktør)", r.observations.kontrakt.grund === "navn_blank" && r.observations.negative.detail.message === "navn_blank" && Array.isArray(r.observations.state_before) && r.observations.aktoer === "app_role", true);
  const j = judgeObservations("UT", r.observations); eq("judgeObservations genudleder samme status/assertions fra observationerne", j.status === r.status && JSON.stringify(j.assertions) === JSON.stringify(r.assertions), true); }
eq("forbudt handling TILLADT → brudt", await st(C.ut, mkRunner({ state: { guardNavn: false } })), STATUS.BRUDT);
eq("afvist m. rigtig kode men ANDEN GRUND (lokation_nedlagt) → brudt (F-4)", await st(withCase(C.ut, (x) => (x.negative.sql = "NEG_ANDEN_GRUND"))), STATUS.BRUDT);
eq("afvist m. rigtig kode+grund men ANDET STED → brudt (F-4)", await st(withCase(C.ut, (x) => (x.negative.sql = "NEG_ANDET_STED"))), STATUS.BRUDT);
eq("afvist m. anden anerkendt klasse (42501 ≠ 22023) → brudt", await st(withCase(C.ut, (x) => (x.negative.sql = "NEG_WRONG_CLASS"))), STATUS.BRUDT);
eq("afvist m. UVEDKOMMENDE kode (42601 syntax) → protokol-fejl, ikke brudt (F-6)", await st(withCase(C.ut, (x) => (x.negative.sql = "NEG_SYNTAX"))), STATUS.PROTOKOL);
eq("forsøget kørte som anden aktør end kontraktens → brudt (F-4)", await st(withCase(C.ut, (x) => (x.actor = { role: "anden_rolle" }))), STATUS.BRUDT);
eq("søsterkald afvist → brudt", await st(C.ut, mkRunner({ sql: (t) => (t === "POS" ? R(false, "42501", "denied", null) : undefined) })), STATUS.BRUDT);
eq("afvist men tilstand ændret → brudt", await st(C.ut, mkRunner({ sql: (t, o, s) => { if (t === "NEG") { s.stateRows = [{ n: 2 }]; return R(false, "22023", "navn_blank", "f.lokation_opret"); } } })), STATUS.BRUDT);
eq("state-kald AFVIST (ok:false, rows:[]) → protokol-fejl (F-5)", await st(withCase(C.ut, (x) => (x.state.sql = "OBS_DENIED"))), STATUS.PROTOKOL);
eq("state uden rows → protokol", await st(withCase(C.ut, (x) => (x.state.sql = "OBS_NOROWS"))), STATUS.PROTOKOL);
eq("negative_id på ikke-UT-case → protokol", await st(withCase(C.fs, (x) => (x.negative_id = "K-1/ac-1/neg-1"))), STATUS.PROTOKOL);
eq("rogue forpligtelse → protokol", await st(withCase(C.ut, (x) => (x.obligation_id = "K-9/ac-1"))), STATUS.PROTOKOL);
eq("overdraget forpligtelse → protokol", await st(withCase(C.fs, (x) => (x.obligation_id = "K-2/ac-4"))), STATUS.PROTOKOL);
eq("setup (ejer) kørt før casen og noteret", (await run(withCase(C.ut, (x) => (x.setup = { sql: "SETUP" })))).observations.setup?.ok, true);
eq("setup fejler → protokol", await st(withCase(C.ut, (x) => (x.setup = { sql: "SETUP_FAIL" }))), STATUS.PROTOKOL);
eq("exit-kanal: exit 1 + struktureret klasse-linje → opfyldt", await st(C.ci), STATUS.OPFYLDT);
eq("exit-kanal: exit 1 men ANDEN klasse (ENOENT) → brudt (F-4)", await st(C.ci, mkRunner({ exec: () => ({ exit_code: 1, stdout: "klasse=ENOENT\n" }) })), STATUS.BRUDT);
eq("exit-kanal: klasse kun som fri tekst (ingen klasse=-linje) → brudt", await st(C.ci, mkRunner({ exec: () => ({ exit_code: 1, stdout: "klassifikation mangler\n" }) })), STATUS.BRUDT);
eq("exit-kanal: exit 0 → brudt", await st(C.ci, mkRunner({ exec: () => ({ exit_code: 0, stdout: "klasse=klassifikation\n" }) })), STATUS.BRUDT);

console.log("\nFS — forkert slutværdi:");
eq("baseline → opfyldt (m. navngivet checkpoint)", await st(C.fs), STATUS.OPFYLDT);
eq("værdi ≠ orakel → brudt", await st(C.fs, mkRunner({ state: { pris: 90 } })), STATUS.BRUDT);
eq("checkpoint afviger → brudt", await st(withCase(C.fs, (x) => (x.checkpoints[0].expect.value = 81))), STATUS.BRUDT);
eq("checkpoints:[] → resultatet bærer INGEN checkpoint-assertion (verifieren kræver dem fra manifestet)", (await run(withCase(C.fs, (x) => (x.checkpoints = [])))).assertions.some((a) => a.id.startsWith("checkpoint:")), false);
eq("rows=[] m. expect empty → opfyldt", await st(withCase(C.fs, (x) => { x.observe.sql = "OBS_EMPTY"; x.expect = { kind: "empty" }; x.checkpoints = []; })), STATUS.OPFYLDT);
eq("observations-kald AFVIST (42501, rows:[]) → protokol-fejl, aldrig opfyldt (F-5)", await st(withCase(C.fs, (x) => { x.observe.sql = "OBS_DENIED"; x.expect = { kind: "empty" }; x.checkpoints = []; })), STATUS.PROTOKOL);
eq("manglende rows → protokol", await st(withCase(C.fs, (x) => { x.observe.sql = "OBS_NOROWS"; x.expect = { kind: "empty" }; })), STATUS.PROTOKOL);
eq("handling afvist m. anerkendt klasse → brudt", await st(C.fs, mkRunner({ sql: (t) => (t === "ACT" ? R(false, "42501", "denied", null) : undefined) })), STATUS.BRUDT);
eq("handling fejler uvedkommende (syntax) → protokol", await st(C.fs, mkRunner({ sql: (t) => (t === "ACT" ? R(false, "42601", "syntax", null) : undefined) })), STATUS.PROTOKOL);

console.log("\nMH — manglende handling:");
eq("baseline → opfyldt", await st(C.mh), STATUS.OPFYLDT);
eq("handling udebliver (42501 for legitim aktør) → brudt", await st(C.mh, mkRunner({ state: { grant: false } })), STATUS.BRUDT);
eq("handling fejler UVEDKOMMENDE (42601) → protokol, ikke brudt (F-6)", await st(withCase(C.mh, (x) => (x.action.sql = "ACT_MH_SYNTAX"))), STATUS.PROTOKOL);
eq("vidne mangler (audit 0 rækker) → brudt", await st(C.mh, mkRunner({ state: { audit: false } })), STATUS.BRUDT);
eq("vidne-kald afvist → protokol (F-5)", await st(withCase(C.mh, (x) => (x.witnesses[0].observe.sql = "OBS_DENIED"))), STATUS.PROTOKOL);
{ const r = await run(C.mh); eq("vidnerækker gemmes rå i observationerne (F-3)", Array.isArray(r.observations.witnesses[0].rows), true); }

console.log("\nSA — samtidighed (sessions · barriere · afslutning):");
eq("baseline → opfyldt", await st(C.sa), STATUS.OPFYLDT);
eq("ingen barriere observeret → brudt", await st(C.sa, mkRunner({ state: { laas: false } })), STATUS.BRUDT);
eq("trigger fjernet: begge lykkes + invariant brudt → brudt", await st(C.sa, mkRunner({ state: { trg: false } })), STATUS.BRUDT);
eq("samme pid for A og B → brudt (to-sessions, F-8)", await st(C.sa, mkRunner({ race: () => ({ protocolOk: true, a: { pid: 7, ok: true, commit: "commit" }, b: { pid: 7, ok: false, code: "P0001", detail: { message: "min_en_stand", routine: "f.stand_deaktiver" }, commit: "rollback" }, barrier: { observed: true, blocked_pid: 7, blocking_pid: 7 }, invariantRows: [{ aktive: 1 }] }) })), STATUS.BRUDT);
eq("barriere peger på forkerte pids → brudt", await st(C.sa, mkRunner({ race: () => ({ protocolOk: true, a: { pid: 1, ok: true, commit: "commit" }, b: { pid: 2, ok: false, code: "P0001", detail: { message: "min_en_stand", routine: "f.stand_deaktiver" }, commit: "rollback" }, barrier: { observed: true, blocked_pid: 1, blocking_pid: 2 }, invariantRows: [{ aktive: 1 }] }) })), STATUS.BRUDT);
eq("afvist forløb ikke rullet tilbage → brudt (afslutning)", await st(C.sa, mkRunner({ race: () => ({ protocolOk: true, a: { pid: 1, ok: true, commit: "commit" }, b: { pid: 2, ok: false, code: "P0001", detail: { message: "min_en_stand", routine: "f.stand_deaktiver" }, commit: "commit" }, barrier: { observed: true, blocked_pid: 2, blocking_pid: 1 }, invariantRows: [{ aktive: 1 }] }) })), STATUS.BRUDT);
eq("begge fejler UVEDKOMMENDE (42601) → protokol, ikke brudt (F-6)", await st(C.sa, mkRunner({ race: () => ({ protocolOk: true, a: { pid: 1, ok: false, code: "42601", commit: "rollback" }, b: { pid: 2, ok: false, code: "42601", commit: "rollback" }, barrier: { observed: true, blocked_pid: 2, blocking_pid: 1 }, invariantRows: [{ aktive: 1 }] }) })), STATUS.PROTOKOL);
eq("afvisning m. rigtig kode men forkert grund → brudt", await st(C.sa, mkRunner({ race: () => ({ protocolOk: true, a: { pid: 1, ok: true, commit: "commit" }, b: { pid: 2, ok: false, code: "P0001", detail: { message: "andet", routine: "f.stand_deaktiver" }, commit: "rollback" }, barrier: { observed: true, blocked_pid: 2, blocking_pid: 1 }, invariantRows: [{ aktive: 1 }] }) })), STATUS.BRUDT);
eq("race-runner protokol-fejl → protokol", await st(C.sa, mkRunner({ race: () => ({ protocolOk: false, error: "session 2 døde" }) })), STATUS.PROTOKOL);

console.log("\nkillCaseMutant — målrettet, formbestemt kill m. nødvendige kontroller:");
const cases = [C.ut, C.fs, C.mh, C.sa];
const M = {
  ut: { mutant_id: "m-navn", guard_ref: "g.navn", apply: "MUT_NAVN_OFF", restore: "MUT_NAVN_ON", target_case_id: "c-ut", target_assertion_id: "negativ-afvist-bundet", controls: ["c-fs"] },
  fs: { mutant_id: "m-pris", guard_ref: "g.pris", apply: "MUT_PRIS_90", restore: "MUT_PRIS_100", target_case_id: "c-fs", target_assertion_id: "vaerdi-matcher-orakel", controls: ["c-ut"] },
  mhGrant: { mutant_id: "m-grant", guard_ref: "g.grant", apply: "MUT_GRANT_OFF", restore: "MUT_GRANT_ON", target_case_id: "c-mh", target_assertion_id: "handling-mulig-for-legitim-aktoer", controls: ["c-ut"] },
  mhAudit: { mutant_id: "m-audit", guard_ref: "g.audit", apply: "MUT_AUDIT_OFF", restore: "MUT_AUDIT_ON", target_case_id: "c-mh", target_assertion_id: "vidne:audit-row", controls: ["c-fs"] },
  sa: { mutant_id: "m-trg", guard_ref: "g.min", apply: "MUT_TRG_OFF", restore: "MUT_TRG_ON", target_case_id: "c-sa", target_assertion_id: "invariant-efter-commit", controls: ["c-ut", "c-fs"] },
};
const kill = (m, r = mkRunner()) => killCaseMutant(m, cases, ctx, r);
{ const r = await kill(M.ut); eq("UT-mutant → dræbt (UT), restored, ren; resultatet bærer baseline/under/kontroller/clean rå", r.killed && r.break_form === "UT" && r.restored && r.cleanAfter && r.under?.status === STATUS.BRUDT && Array.isArray(r.controls_under) && r.clean?.target?.status === STATUS.OPFYLDT, true);
  const j = judgeKill(r); eq("judgeKill genudleder kill fra de rå delresultater", j.killed === true && j.break_form === "UT", true); }
{ const r = await kill(M.fs); eq("FS-mutant → dræbt (FS)", r.killed && r.break_form === "FS", true); }
{ const r = await kill(M.mhGrant); eq("MH-mutant (grant fjernet → 42501) → dræbt (MH)", r.killed && r.break_form === "MH", true); }
{ const r = await kill(M.mhAudit); eq("MH-mutant (vidne udebliver) → dræbt (MH)", r.killed && r.break_form === "MH", true); }
{ const r = await kill(M.sa); eq("SA-mutant (trigger fjernet → invariant brudt) → dræbt (SA)", r.killed && r.break_form === "SA", true); }
{ const r = await kill({ ...M.ut, target_assertion_id: "tilstand-uaendret" }); eq("mutanten bryder en ANDEN assertion end den målrettede → ikke dræbt (målrettet kill)", r.killed, false); }
{ const r = await kill({ ...M.ut, apply: "MUT_NOOP", restore: "MUT_NOOP" }); eq("»findes«-mutant → overlever", r.killed, false); }
{ const r = await kill({ ...M.ut, apply: "MUT_FAIL" }); eq("mutant-apply fejler → ikke dræbt", r.killed === false && /apply fejlede/.test(r.detail), true); }
{ const r = await kill({ ...M.ut, restore: "RESTORE_FAIL" }); eq("restore fejler → restored=false, cleanAfter=false", r.killed === true && r.restored === false && r.cleanAfter === false, true); }
{ const r = await kill({ ...M.ut, apply: "MUT_NAVN_OFF_OG_PRIS", restore: "MUT_NAVN_ON" }, mkRunner()); eq("mutanten ødelægger også en kontrol (pris) → ikke dræbt (uvedkommende regression)", r.killed === false && /kontroller=false/.test(r.detail), true); }
{ const r = await kill({ ...M.ut, restore: "MUT_NAVN_ON_PRIS_90" }); eq("restore efterlader en KONTROL ødelagt → cleanAfter=false (F-7)", r.killed === true && r.cleanAfter === false, true); }
{ const r = await kill({ ...M.mhGrant, apply: "MUT_GRANT_OFF", }, mkRunner({ sql: (t, o, s) => (t === "ACT_MH" && !s.grant ? R(false, "42601", "syntax", null) : undefined) })); eq("MH-handling fejler UVEDKOMMENDE under mutanten → protokol → ikke dræbt (F-6)", r.killed === false && r.under?.status === STATUS.PROTOKOL, true); }
{ const r = await kill({ ...M.ut, controls: [] }); eq("controls tomme → afvist (≥1 nødvendig kontrol kræves)", r.killed === false && /controls/.test(r.detail), true); }
{ const r = await kill({ ...M.ut, target_assertion_id: undefined }); eq("uden target_assertion_id → malformet", /malformet/.test(r.detail), true); }
{ const r = await kill(M.ut, mkRunner({ state: { guardNavn: false } })); eq("baseline ikke opfyldt → intet at dræbe mod", r.killed === false && /baseline/.test(r.detail), true); }
{ const r = await kill(M.ut, mkRunner({ state: { pris: 90 } })); eq("kontrol ikke opfyldt i baseline → intet at dræbe mod", r.killed === false && /baseline/.test(r.detail), true); }
eq("brudtPaaFormensMaade: UT brudt kun pga. aktør-binding (ikke tilladt/tilstand) → ikke formens brud", brudtPaaFormensMaade({ status: STATUS.BRUDT, proof_form: "UT", assertions: [{ id: "aktoer-bundet", ok: false }, { id: "negativ-afvist-bundet", ok: true }], observations: { negative: { ok: false } } }), false);

console.log("\nrunBuildProofEngine — samlet kørsel:");
{
  const r = await runBuildProofEngine({ manifest, run_id: "r-1", cases, mutants: [M.ut, M.fs, M.mhGrant, M.sa] }, mkRunner());
  eq("alt opfyldt + alle mutanter dræbt → allOk", r.allOk, true);
  eq("summary: 4 opfyldt · 0 brudt · 0 protokol · 4/4 dræbt", JSON.stringify(r.summary), JSON.stringify({ opfyldt: 4, brudt: 0, protokol_fejl: 0, mutanter: 4, draebt: 4 }));
  eq("hvert delbevis bærer run_id, bid_id, hard_effect, entrypoint, actor_role", r.cases.every((c) => c.run_id === "r-1" && c.bid_id === BID && c.hard_effect && c.entrypoint?.kind && c.actor_role) && r.mutants.every((m) => m.run_id === "r-1"), true);
}
eq("én overlevende mutant → allOk=false", (await runBuildProofEngine({ manifest, run_id: "r-2", cases, mutants: [{ ...M.ut, apply: "MUT_NOOP", restore: "MUT_NOOP" }] }, mkRunner())).allOk, false);
eq("protokol-fejl → allOk=false", (await runBuildProofEngine({ manifest, run_id: "r-4", cases: [withCase(C.fs, (x) => (x.observe.sql = "OBS_NOROWS"))], mutants: [] }, mkRunner())).allOk, false);
eq("run_id mangler → dead", /run_id/.test((await runBuildProofEngine({ manifest, cases }, mkRunner())).error), true);
eq("dublet case_id → dead", /dublet/.test((await runBuildProofEngine({ manifest, run_id: "r", cases: [C.ut, C.ut] }, mkRunner())).error), true);
{ const arr = [C.ut]; Object.defineProperty(arr, 1, { enumerable: true, get: () => C.fs }); arr.length = 2; eq("cases m. accessor-index → dead", /cases/.test((await runBuildProofEngine({ manifest, run_id: "r", cases: arr }, mkRunner())).error), true); }
{ const c = Object.create({ proof_form: "UT" }); Object.assign(c, C.ut); delete c.proof_form; eq("arvet proof_form tæller ikke → protokol", (await run(c)).status, STATUS.PROTOKOL); }

console.log("");
if (fail > 0) { console.error(`build-harness: ${fail} FEJLEDE (${pass} ok)`); process.exit(1); }
console.log(`build-harness red-team: alle ${pass} cases passed`);
