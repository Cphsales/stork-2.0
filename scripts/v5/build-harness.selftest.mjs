#!/usr/bin/env node
// build-harness.selftest.mjs — red-team af case-engine v2 (C1): mock-runner med tilstand; hver bevisform grøn på den
// rigtige måde, rød på den rigtige måde, og formbestemte mutant-kills — plus alle fail-closed-veje (protokol ≠ brudt).
import { runCase, killCaseMutant, runBuildProofEngine, matchExpect, STATUS } from "./build-harness.mjs";
import { expectedSet } from "./forventnings-manifest.mjs";

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log(`  ✓ ${n}`); };
const bad = (n, r) => { fail++; console.error(`  ✗ ${n}: ${r}`); };
const eq = (n, got, want) => (got === want ? ok(n) : bad(n, `fik ${JSON.stringify(got)}, forventede ${JSON.stringify(want)}`));
const OID = (c) => c.repeat(40);
const rc = (sqlstate, sted) => ({ kanal: "sqlstate", sqlstate, afvisningssted: sted, fase: "wrapper", aktoer: "rettighedshaver", observationskanal: "sqlstate", offentlig_signatur: "f(text)" });
const manifest = {
  schema_version: 1, pakke: "p", bindings: { forventningsliste: { path: "f.md", oid: OID("a") }, krav: { path: "k.md", oid: OID("b") }, plan: { path: "p.md", oid: OID("c") } },
  guards: [{ id: "g.navn", beskrivelse: "navn-check" }, { id: "g.min", beskrivelse: "min-én-stand-trigger" }],
  obligations: [
    { id: "K-1/ac-1", k_id: "K-1", kind: "ac", proof_forms: ["UT", "MH"], scope: "nu", kildeankre: ["K:1"], negatives: [{ id: "K-1/ac-1/neg-1", beskrivelse: "blank", reject_contract: rc("22023", "opret"), sole_guard_ref: "g.navn" }] },
    { id: "K-1/ac-3", k_id: "K-1", kind: "ac", proof_forms: ["FS"], scope: "nu", kildeankre: ["K:3"], negatives: [] },
    { id: "K-2/ac-6", k_id: "K-2", kind: "ac", proof_forms: ["SA", "UT"], scope: "nu", kildeankre: ["K:6"], negatives: [{ id: "K-2/ac-6/neg-1", beskrivelse: "sidste stand", reject_contract: rc("P0001", "trg"), sole_guard_ref: "g.min" }] },
    { id: "K-7/S", k_id: "K-7", kind: "struktur", proof_forms: ["UT"], scope: "nu", kildeankre: ["K:7"], negatives: [{ id: "K-7/S/neg-1", beskrivelse: "ci", reject_contract: { kanal: "exit", exit_code: 1, klasse: "klassifikation", afvisningssted: "ci", fase: "ci", aktoer: "ci" } }] },
    { id: "K-2/ac-4", k_id: "K-2", kind: "ac", proof_forms: ["FS"], scope: "overdragelse", overdragelse_ref: "trin 24", kildeankre: ["K:4"], negatives: [] },
  ],
};
const ctx = { forventning: expectedSet(manifest) };
// --- mock-runner m. tilstand: knapper slås af/på af mutant-sql ---
function mkRunner(over = {}) {
  const st = { guardNavn: true, pris: 100, grant: true, audit: true, trg: true, stateRows: [{ n: 1 }], throwUnderMut: false, ...over.state };
  const runner = {
    st,
    sql(text, opts) {
      if (over.sql) { const r = over.sql(text, opts, st); if (r !== undefined) return r; }
      switch (text) {
        case "POS": return { ok: true, error: null, code: null };
        case "NEG": return st.guardNavn ? { ok: false, error: "blank", code: "22023" } : { ok: true, error: null, code: null };
        case "NEG_WRONG": return { ok: false, error: "syntax", code: "42601" };
        case "STATE": return { ok: true, error: null, code: null, rows: st.stateRows.map((r) => ({ ...r })) };
        case "ACT": return { ok: true, error: null, code: null };
        case "OBS": return { ok: true, error: null, code: null, rows: [{ pris: st.pris }] };
        case "OBS_HIST": return { ok: true, error: null, code: null, rows: [{ pris: 80 }] };
        case "OBS_EMPTY": return { ok: true, error: null, code: null, rows: [] };
        case "OBS_NOROWS": return { ok: true, error: null, code: null };
        case "ACT_MH": return st.grant ? { ok: true, error: null, code: null } : { ok: false, error: "no grant", code: "42501" };
        case "AUDIT": return { ok: true, error: null, code: null, rows: st.audit ? [{ id: 1 }] : [] };
        case "MUT_NAVN_OFF": st.guardNavn = false; return { ok: true, error: null, code: null };
        case "MUT_NAVN_ON": st.guardNavn = true; return { ok: true, error: null, code: null };
        case "MUT_PRIS_90": st.pris = 90; return { ok: true, error: null, code: null };
        case "MUT_PRIS_100": st.pris = 100; return { ok: true, error: null, code: null };
        case "MUT_GRANT_OFF": st.grant = false; return { ok: true, error: null, code: null };
        case "MUT_GRANT_ON": st.grant = true; return { ok: true, error: null, code: null };
        case "MUT_AUDIT_OFF": st.audit = false; return { ok: true, error: null, code: null };
        case "MUT_AUDIT_ON": st.audit = true; return { ok: true, error: null, code: null };
        case "MUT_TRG_OFF": st.trg = false; return { ok: true, error: null, code: null };
        case "MUT_TRG_ON": st.trg = true; return { ok: true, error: null, code: null };
        case "MUT_NOOP": return { ok: true, error: null, code: null };
        case "MUT_FAIL": return { ok: false, error: "kan ikke", code: "42601" };
        case "MUT_STATE": st.stateRows = [{ n: 2 }]; return { ok: true, error: null, code: null };
        case "RESTORE_FAIL": return { ok: false, error: "restore fejl", code: "42601" };
        case "MUT_THROW": st.throwUnderMut = true; return { ok: true, error: null, code: null };
        case "MUT_THROW_OFF": st.throwUnderMut = false; return { ok: true, error: null, code: null };
        default: return { ok: false, error: `ukendt sql ${text}`, code: "42601" };
      }
    },
    race(s) {
      if (over.race) return over.race(s, st);
      return st.trg
        ? { protocolOk: true, a: { ok: true, code: null }, b: { ok: false, code: "P0001" }, blockedObserved: true, invariantRows: [{ aktive: 1 }] }
        : { protocolOk: true, a: { ok: true, code: null }, b: { ok: true, code: null }, blockedObserved: true, invariantRows: [{ aktive: 0 }] };
    },
    exec(cmd) { return over.exec ? over.exec(cmd) : { exit_code: 1, stdout: "klassifikation mangler" }; },
  };
  return runner;
}
const ep = { kind: "rpc", ref: "lokation_opret" }; const actor = { role: "app_role", settings: { "app.org": "1" } }; const HE = "db-row"; const BID = "bid-2";
const C = {
  ut: { case_id: "c-ut", hard_effect: HE, bid_id: BID, obligation_id: "K-1/ac-1", negative_id: "K-1/ac-1/neg-1", proof_form: "UT", entrypoint: ep, actor, positive: { sql: "POS" }, negative: { sql: "NEG" }, state: { sql: "STATE" } },
  fs: { case_id: "c-fs", hard_effect: HE, bid_id: BID, obligation_id: "K-1/ac-3", proof_form: "FS", entrypoint: ep, actor, action: { sql: "ACT" }, observe: { sql: "OBS" }, expect: { kind: "scalar", value: 100 }, checkpoints: [{ observe: { sql: "OBS_HIST" }, expect: { kind: "scalar", value: 80 } }] },
  mh: { case_id: "c-mh", hard_effect: HE, bid_id: BID, obligation_id: "K-1/ac-1", proof_form: "MH", entrypoint: ep, actor, action: { sql: "ACT_MH" }, witnesses: [{ observe: { sql: "AUDIT" }, expect: { kind: "count", value: 1 } }] },
  sa: { case_id: "c-sa", hard_effect: HE, bid_id: BID, obligation_id: "K-2/ac-6", proof_form: "SA", entrypoint: ep, actor, race: { race_id: "r1", a: { sql: "A" }, b: { sql: "B" }, barrier: "row-lock", invariant: { observe: { sql: "INV" }, expect: { kind: "scalar", value: 1 } }, reject_negative_id: "K-2/ac-6/neg-1" } },
  ci: { case_id: "c-ci", hard_effect: "state", bid_id: BID, obligation_id: "K-7/S", negative_id: "K-7/S/neg-1", proof_form: "UT", entrypoint: { kind: "ui-flow", ref: "ci" }, actor: { role: "ci" }, check: { cmd: ["node", "klassifikation.mjs"] } },
};
const run = (c, r = mkRunner()) => runCase(c, ctx, r);
const st = async (c, r) => (await run(c, r)).status;
const withCase = (c, mut) => { const x = JSON.parse(JSON.stringify(c)); mut(x); return x; };

console.log("matchExpect — typede observationer:");
eq("empty: rows=[] → opfyldt", matchExpect([], { kind: "empty" }).ok, true);
eq("empty: manglende rows → protokol (null), ikke brudt", matchExpect(null, { kind: "empty" }).ok, null);
eq("empty: 1 række → brudt", matchExpect([{ a: 1 }], { kind: "empty" }).ok, false);
eq("scalar: match", matchExpect([{ v: 100 }], { kind: "scalar", value: 100 }).ok, true);
eq("scalar: forkert værdi → brudt", matchExpect([{ v: 90 }], { kind: "scalar", value: 100 }).ok, false);
eq("scalar: 2 rækker → brudt", matchExpect([{ v: 1 }, { v: 1 }], { kind: "scalar", value: 1 }).ok, false);
eq("scalar: streng '100' ≠ tal 100 (typet)", matchExpect([{ v: "100" }], { kind: "scalar", value: 100 }).ok, false);
eq("null: match", matchExpect([{ v: null }], { kind: "null" }).ok, true);
eq("null: false ≠ null", matchExpect([{ v: false }], { kind: "null" }).ok, false);
eq("count", matchExpect([{}, {}], { kind: "count", value: 2 }).ok, true);
eq("rows: mængde-lig uanset orden", matchExpect([{ a: 1 }, { a: 2 }], { kind: "rows", value: [{ a: 2 }, { a: 1 }] }).ok, true);
eq("rows: ordnet → orden tæller", matchExpect([{ a: 1 }, { a: 2 }], { kind: "rows", value: [{ a: 2 }, { a: 1 }], ordered: true }).ok, false);
eq("rows: fremmed række → brudt", matchExpect([{ a: 1 }, { a: 9 }], { kind: "rows", value: [{ a: 1 }] }).ok, false);
eq("ukendt kind → protokol", matchExpect([], { kind: "ca" }).ok, null);

console.log("\nUT — ulovlig tilladelse:");
eq("baseline: søsterkald ok · afvist 22023 (fra manifestet) · tilstand uændret → opfyldt", await st(C.ut), STATUS.OPFYLDT);
eq("forbudt handling TILLADT → brudt (neg_allowed)", (await run(C.ut, mkRunner({ state: { guardNavn: false } }))).observations.neg_allowed, true);
eq("… status brudt", await st(C.ut, mkRunner({ state: { guardNavn: false } })), STATUS.BRUDT);
eq("afvist m. FORKERT kode (42601 ≠ 22023) → brudt, ikke opfyldt", await st(withCase(C.ut, (x) => (x.negative.sql = "NEG_WRONG"))), STATUS.BRUDT);
eq("søsterkald afvist (aktøren har ikke bevist adgang) → brudt", await st(C.ut, mkRunner({ sql: (t) => (t === "POS" ? { ok: false, code: "42501" } : undefined) })), STATUS.BRUDT);
eq("afvist men tilstand ændret → brudt", await st(C.ut, mkRunner({ sql: (t, o, s) => { if (t === "NEG") { s.stateRows = [{ n: 2 }]; return { ok: false, code: "22023" }; } } })), STATUS.BRUDT);
eq("state uden rows → protokol-fejl (ikke brudt)", await st(withCase(C.ut, (x) => (x.state.sql = "OBS_NOROWS"))), STATUS.PROTOKOL);
eq("negative_id under anden forpligtelse → protokol", await st(withCase(C.ut, (x) => (x.negative_id = "K-2/ac-6/neg-1"))), STATUS.PROTOKOL);
eq("UT uden state-observation → protokol", await st(withCase(C.ut, (x) => delete x.state)), STATUS.PROTOKOL);
eq("case-form ikke i manifestet (FS på K-1/ac-1) → protokol", await st(withCase(C.fs, (x) => (x.obligation_id = "K-1/ac-1"))), STATUS.PROTOKOL);
eq("rogue forpligtelse → protokol", await st(withCase(C.ut, (x) => (x.obligation_id = "K-9/ac-1"))), STATUS.PROTOKOL);
eq("overdraget forpligtelse → protokol (ikke forventet nu)", await st(withCase(C.fs, (x) => (x.obligation_id = "K-2/ac-4"))), STATUS.PROTOKOL);
eq("hard_effect helper-return → protokol", await st(withCase(C.ut, (x) => (x.hard_effect = "helper-return"))), STATUS.PROTOKOL);
eq("bid_id mangler → protokol (D12)", await st(withCase(C.ut, (x) => delete x.bid_id)), STATUS.PROTOKOL);
eq("entrypoint fri streng → protokol", await st(withCase(C.ut, (x) => (x.entrypoint = { kind: "helper", ref: "x" }))), STATUS.PROTOKOL);
eq("actor.role mangler (bypass) → protokol", await st(withCase(C.ut, (x) => (x.actor = {}))), STATUS.PROTOKOL);
eq("runner kaster → protokol", await st(C.ut, mkRunner({ sql: () => { throw new Error("db nede"); } })), STATUS.PROTOKOL);
eq("runner uden {ok:boolean} → protokol", await st(C.ut, mkRunner({ sql: () => ({ status: "ok" }) })), STATUS.PROTOKOL);
eq("exit-kanal: exit 1 == kontrakt → opfyldt", await st(C.ci), STATUS.OPFYLDT);
eq("exit-kanal: exit 0 → brudt", await st(C.ci, mkRunner({ exec: () => ({ exit_code: 0 }) })), STATUS.BRUDT);
eq("exit-kanal uden runner.exec → protokol", await st(C.ci, { sql: () => ({ ok: true }) }), STATUS.PROTOKOL);

console.log("\nFS — forkert slutværdi:");
eq("baseline: værdi == orakel + checkpoint → opfyldt", await st(C.fs), STATUS.OPFYLDT);
eq("værdi ≠ orakel (90) → brudt", await st(C.fs, mkRunner({ state: { pris: 90 } })), STATUS.BRUDT);
eq("checkpoint (historisk genlæsning) afviger → brudt", await st(withCase(C.fs, (x) => (x.checkpoints[0].expect.value = 81))), STATUS.BRUDT);
eq("K-8-typen: komplet rows=[] == expect empty → opfyldt", await st(withCase(C.fs, (x) => { x.observe.sql = "OBS_EMPTY"; x.expect = { kind: "empty" }; delete x.checkpoints; })), STATUS.OPFYLDT);
eq("manglende rows (ok:true uden svar) → protokol-fejl, aldrig opfyldt", await st(withCase(C.fs, (x) => { x.observe.sql = "OBS_NOROWS"; x.expect = { kind: "empty" }; })), STATUS.PROTOKOL);
eq("fremmed række i tomt-forventet svar → brudt", await st(withCase(C.fs, (x) => { x.observe.sql = "OBS"; x.expect = { kind: "empty" }; delete x.checkpoints; })), STATUS.BRUDT);
eq("handling afvist → brudt", await st(C.fs, mkRunner({ sql: (t) => (t === "ACT" ? { ok: false, code: "42501" } : undefined) })), STATUS.BRUDT);
eq("FS uden observe → protokol", await st(withCase(C.fs, (x) => delete x.observe)), STATUS.PROTOKOL);

console.log("\nMH — manglende handling:");
eq("baseline: handling ok + vidne → opfyldt", await st(C.mh), STATUS.OPFYLDT);
eq("handling udebliver (42501 for legitim aktør) → brudt", await st(C.mh, mkRunner({ state: { grant: false } })), STATUS.BRUDT);
eq("sideeffekt-vidne mangler (audit 0 rækker) → brudt", await st(C.mh, mkRunner({ state: { audit: false } })), STATUS.BRUDT);
eq("MH uden vidner → protokol", await st(withCase(C.mh, (x) => (x.witnesses = []))), STATUS.PROTOKOL);

console.log("\nSA — samtidighed:");
eq("baseline: barriere observeret · præcis én afvisning P0001 · invariant holder → opfyldt", await st(C.sa), STATUS.OPFYLDT);
eq("ingen barriere observeret (sekventiel) → brudt", await st(C.sa, mkRunner({ race: () => ({ protocolOk: true, a: { ok: true }, b: { ok: false, code: "P0001" }, blockedObserved: false, invariantRows: [{ aktive: 1 }] }) })), STATUS.BRUDT);
eq("begge lykkes + invariant brudt → brudt", await st(C.sa, mkRunner({ state: { trg: false } })), STATUS.BRUDT);
eq("begge afvises (uvedkommende grund) → brudt (ikke grønt invariantbevis)", await st(C.sa, mkRunner({ race: () => ({ protocolOk: true, a: { ok: false, code: "P0001" }, b: { ok: false, code: "P0001" }, blockedObserved: true, invariantRows: [{ aktive: 1 }] }) })), STATUS.BRUDT);
eq("én afvisning m. forkert kode (23505 bagstopper) → brudt", await st(C.sa, mkRunner({ race: () => ({ protocolOk: true, a: { ok: true }, b: { ok: false, code: "23505" }, blockedObserved: true, invariantRows: [{ aktive: 1 }] }) })), STATUS.BRUDT);
eq("race-runner protokol-fejl → protokol", await st(C.sa, mkRunner({ race: () => ({ protocolOk: false, error: "session 2 døde" }) })), STATUS.PROTOKOL);
eq("race uden invariantRows → protokol", await st(C.sa, mkRunner({ race: () => ({ protocolOk: true, a: { ok: true }, b: { ok: false, code: "P0001" }, blockedObserved: true }) })), STATUS.PROTOKOL);
eq("SA uden runner.race → protokol", await st(C.sa, { sql: () => ({ ok: true }) }), STATUS.PROTOKOL);
eq("reject_negative_id ikke under forpligtelsen → protokol", await st(withCase(C.sa, (x) => (x.race.reject_negative_id = "K-1/ac-1/neg-1"))), STATUS.PROTOKOL);

console.log("\nkillCaseMutant — formbestemt kill:");
const cases = [C.ut, C.fs, C.mh, C.sa];
const M = {
  ut: { mutant_id: "m-navn", guard_ref: "g.navn", apply: "MUT_NAVN_OFF", restore: "MUT_NAVN_ON", target_case_id: "c-ut", controls: ["c-fs"] },
  fs: { mutant_id: "m-pris", guard_ref: "g.pris", apply: "MUT_PRIS_90", restore: "MUT_PRIS_100", target_case_id: "c-fs", controls: ["c-ut"] },
  mhGrant: { mutant_id: "m-grant", guard_ref: "g.grant", apply: "MUT_GRANT_OFF", restore: "MUT_GRANT_ON", target_case_id: "c-mh", controls: ["c-ut"] },
  mhAudit: { mutant_id: "m-audit", guard_ref: "g.audit", apply: "MUT_AUDIT_OFF", restore: "MUT_AUDIT_ON", target_case_id: "c-mh" },
  sa: { mutant_id: "m-trg", guard_ref: "g.min", apply: "MUT_TRG_OFF", restore: "MUT_TRG_ON", target_case_id: "c-sa", controls: ["c-ut", "c-fs"] },
};
const kill = (m, r = mkRunner()) => killCaseMutant(m, cases, ctx, r);
{ const r = await kill(M.ut); eq("UT-mutant (værn af → forbudt tilladt) → dræbt, break_form UT, restored, ren", r.killed && r.break_form === "UT" && r.restored && r.cleanAfter, true); }
{ const r = await kill(M.fs); eq("FS-mutant (orakel-værdi afviger) → dræbt, break_form FS", r.killed && r.break_form === "FS", true); }
{ const r = await kill(M.mhGrant); eq("MH-mutant (grant fjernet → lovlig handling udebliver) → dræbt (målrettet MH-kill, ikke »positiv regression«)", r.killed && r.break_form === "MH", true); }
{ const r = await kill(M.mhAudit); eq("MH-mutant (audit-vidne udebliver) → dræbt", r.killed && r.break_form === "MH", true); }
{ const r = await kill(M.sa); eq("SA-mutant (trigger fjernet → invariant brudt) → dræbt, break_form SA", r.killed && r.break_form === "SA", true); }
{ const r = await kill({ ...M.ut, apply: "MUT_NOOP", restore: "MUT_NOOP" }); eq("»findes«-mutant (ændrer intet) → OVERLEVER", r.killed, false); }
{ const r = await kill({ ...M.ut, apply: "MUT_FAIL" }); eq("mutant-apply fejler → ikke dræbt, restore forsøgt", r.killed === false && /apply fejlede/.test(r.detail), true); }
{ const r = await kill({ ...M.ut, restore: "RESTORE_FAIL" }); eq("restore fejler → dræbt men restored=false (ikke ren)", r.killed === true && r.restored === false, true); }
{ const r = await kill({ ...M.ut, controls: ["c-mh"] }, mkRunner({ sql: (t, o, s) => (t === "ACT_MH" && !s.guardNavn ? { ok: false, code: "42501" } : undefined) })); eq("mutanten bryder en KONTROL-case → ikke dræbt (uvedkommende regression)", r.killed === false && r.controlsOk === false, true); }
{ const r = await kill({ ...M.ut, apply: "MUT_THROW", restore: "MUT_THROW_OFF" }, mkRunner({ sql: (t, o, s) => (s.throwUnderMut && t === "NEG" ? (() => { throw new Error("db"); })() : undefined) })); eq("målet får protokol-fejl under mutanten → ikke dræbt (virkeligheden ukendt)", r.killed, false); }
{ const r = await kill({ ...M.ut, apply: "MUT_STATE", restore: "MUT_NOOP" }); eq("mutant der kun ændrer tilstanden mellem før/efter? (state-rows skifter men ikke i selve negativet) → ikke dræbt", r.killed, false); }
{ const r = await kill(M.ut, mkRunner({ state: { guardNavn: false } })); eq("baseline ikke opfyldt → intet at dræbe mod", r.killed === false && r.baselineOk === false, true); }
{ const r = await kill({ ...M.ut, target_case_id: "c-x" }); eq("ukendt target_case_id → ikke dræbt", r.killed, false); }
{ const r = await kill({ ...M.ut, controls: ["c-ut"] }); eq("control == target → afvist", r.killed === false && /controls/.test(r.detail), true); }
{ const r = await kill({ ...M.ut, guard_ref: "" }); eq("uden guard_ref → malformet (D10 kræver værn-reference)", /malformet/.test(r.detail), true); }

console.log("\nrunBuildProofEngine — samlet kørsel:");
{
  const r = await runBuildProofEngine({ manifest, run_id: "r-1", cases, mutants: [M.ut, M.fs, M.mhGrant, M.sa] }, mkRunner());
  eq("alt opfyldt + alle mutanter dræbt → allOk", r.allOk, true);
  eq("summary: 4 opfyldt · 0 brudt · 0 protokol · 4/4 dræbt", JSON.stringify(r.summary), JSON.stringify({ opfyldt: 4, brudt: 0, protokol_fejl: 0, mutanter: 4, draebt: 4 }));
  eq("hvert delbevis bærer run_id", r.cases.every((c) => c.run_id === "r-1") && r.mutants.every((m) => m.run_id === "r-1"), true);
  eq("hvert delbevis bærer bid_id · hard_effect · entrypoint · actor_role", r.cases.every((c) => c.bid_id === "bid-2" && c.hard_effect && c.entrypoint?.kind && c.actor_role), true);
  eq("hvert delbevis bærer obligation_id + proof_form + assertions", r.cases.every((c) => c.obligation_id && c.proof_form && Array.isArray(c.assertions) && c.assertions.length > 0), true);
}
eq("én overlevende mutant → allOk=false", (await runBuildProofEngine({ manifest, run_id: "r-2", cases, mutants: [{ ...M.ut, apply: "MUT_NOOP", restore: "MUT_NOOP" }] }, mkRunner())).allOk, false);
eq("én brudt case → allOk=false", (await runBuildProofEngine({ manifest, run_id: "r-3", cases, mutants: [] }, mkRunner({ state: { pris: 90 } }))).allOk, false);
eq("protokol-fejl → allOk=false (ikke grøn ved tavshed)", (await runBuildProofEngine({ manifest, run_id: "r-4", cases: [withCase(C.fs, (x) => (x.observe.sql = "OBS_NOROWS"))], mutants: [] }, mkRunner())).allOk, false);
eq("run_id mangler → dead", (await runBuildProofEngine({ manifest, cases }, mkRunner())).allOk === false && /run_id/.test((await runBuildProofEngine({ manifest, cases }, mkRunner())).error), true);
eq("dublet case_id → dead", /dublet/.test((await runBuildProofEngine({ manifest, run_id: "r", cases: [C.ut, C.ut] }, mkRunner())).error), true);
eq("ugyldigt manifest → dead", /manifest/.test((await runBuildProofEngine({ manifest: { ...manifest, obligations: [] }, run_id: "r", cases }, mkRunner())).error), true);
eq("tom cases → dead", /cases/.test((await runBuildProofEngine({ manifest, run_id: "r", cases: [] }, mkRunner())).error), true);
{ const arr = [C.ut]; Object.defineProperty(arr, 1, { enumerable: true, get: () => C.fs }); arr.length = 2; eq("cases m. accessor-index → dead", /cases/.test((await runBuildProofEngine({ manifest, run_id: "r", cases: arr }, mkRunner())).error), true); }
{ const c = Object.create({ proof_form: "UT" }); Object.assign(c, C.ut); delete c.proof_form; eq("arvet proof_form tæller ikke → protokol", (await run(c)).status, STATUS.PROTOKOL); }

console.log("");
if (fail > 0) { console.error(`build-harness: ${fail} FEJLEDE (${pass} ok)`); process.exit(1); }
console.log(`build-harness red-team: alle ${pass} cases passed`);
