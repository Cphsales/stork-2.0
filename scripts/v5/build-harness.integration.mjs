#!/usr/bin/env node
// build-harness.integration.mjs — RIGTIG-Postgres-bevis for case-engine v2 (plan 2.C · C1 »integration mod container grøn«).
//
// IKKE en del af v5:selftest (CI er container-fri). Kør manuelt mod en ISOLERET éngangs-container (ALDRIG repoets PROD-db):
//   docker run -d --name v5-buildproof-pg -e POSTGRES_PASSWORD=test -p 55432:5432 public.ecr.aws/supabase/postgres:17.6.1.121
//   node scripts/v5/build-harness.integration.mjs
//
// Beviser mod virkelighed at engine v2 udtrykker de fire bevisformer som SÆRSKILTE udfald og dræber formbestemt:
//   UT  22023 (domæne-afvisning i offentlig fn) · 42501 (direkte DML uden grant) · P0001 (trigger: mindst én aktiv stand)
//   FS  dateret pris-opslag (nu + historisk checkpoint) · K-8-typen: komplet rows=[] ≠ manglende svar
//   MH  legitim non-admin kan oprette via offentlig fn OG audit-vidnet findes
//   SA  to psql-sessions deaktiverer hver sin af de to sidste aktive stande; barrieren er række-låsen på lokationen
//       (observeret i pg_stat_activity som wait_event_type=Lock); præcis én afvises med P0001; invarianten holder
//   Mutanter (én pr. værn): blank-check fjernet → UT-kill · grant fjernet → MH-kill (handling udebliver) · audit-insert
//   fjernet → MH-kill (vidne) · dato ignoreret → FS-kill (checkpoint) · trigger-check fjernet → UT-kill · lås fjernet →
//   SA-kill (invariant brudt) · »findes«-mutant (kommentar) → OVERLEVER.

import { execFileSync, spawn } from "node:child_process";
import { runBuildProofEngine, runCase, STATUS } from "./build-harness.mjs";
import { expectedSet } from "./forventnings-manifest.mjs";

const CONTAINER = process.env.V5_PG_CONTAINER || "v5-buildproof-pg";
let failed = 0, passed = 0;
const ok = (n) => { passed++; console.log(`  ✓ ${n}`); };
const bad = (n, d) => { failed++; console.error(`  ✗ ${n} — ${d}`); };
const eq = (n, got, want) => (got === want ? ok(n) : bad(n, `fik ${JSON.stringify(got)}, forventede ${JSON.stringify(want)}`));

function containerUp() { try { execFileSync("docker", ["exec", CONTAINER, "pg_isready", "-U", "postgres"], { stdio: "ignore" }); return true; } catch { return false; } }
if (!containerUp()) {
  if (process.argv.includes("--skip-db")) { console.log(`⚠ SKIPPED (ikke et bevis): container '${CONTAINER}' kører ikke — 0 prøver kørt.`); process.exit(0); }
  console.error(`✗ container '${CONTAINER}' kører ikke — integrations-bevis kan ikke føres (fail-closed).`); process.exit(1);
}

// ---------- rigtig runner: ÉN psql-session pr. kald (set role + settings + sætning); observe-queries pakkes i json_agg ----------
const PSQL = ["exec", "-i", CONTAINER, "psql", "-U", "postgres", "-v", "ON_ERROR_STOP=1", "-q", "-tA"];
function dockerPsql(sqlText, opts = {}) {
  const isQuery = /^\s*(select|with|table)\b/i.test(sqlText);
  const prelude = ["\\set VERBOSITY verbose"];
  if (opts.role) prelude.push(`set role ${opts.role};`);
  if (opts.settings) for (const [k, v] of Object.entries(opts.settings)) prelude.push(`set ${k} = '${String(v)}';`);
  const body = isQuery ? `select coalesce(json_agg(t), '[]'::json) from (${sqlText.replace(/;\s*$/, "")}) t;` : sqlText;
  try {
    const out = execFileSync("docker", PSQL, { input: `${prelude.join("\n")}\n${body}\n`, stdio: ["pipe", "pipe", "pipe"] }).toString();
    if (isQuery) { const rows = JSON.parse(out.trim() || "[]"); return { ok: true, error: null, code: null, rows: Array.isArray(rows) ? rows : [] }; }
    return { ok: true, error: null, code: null };
  } catch (e) {
    return { ok: false, ...parseErr(String(e.stderr || e.message)), rows: isQuery ? [] : undefined };
  }
}
// psql VERBOSITY verbose: »ERROR:  <SQLSTATE>: <message>« + »CONTEXT:  PL/pgSQL function <routine>(args) line N at RAISE« →
// strukturerede felter (kode · præcist message-token · routine-identitet) — aldrig fri fejltekst som dommer
function parseErr(stderr) {
  const m = stderr.match(/ERROR:\s+([0-9A-Z]{5}):\s+([^\n]*)/); const c = stderr.match(/CONTEXT:\s+PL\/pgSQL function ([^(\s]+)\(/);
  return { error: stderr.slice(0, 200), code: m ? m[1] : null, detail: { message: m ? m[2].trim() : null, routine: c ? c[1] : null } };
}
const q1 = (sqlText) => execFileSync("docker", ["exec", "-i", CONTAINER, "psql", "-U", "postgres", "-tAc", sqlText]).toString().trim();

// ---------- rigtig race-runner: to interaktive psql-sessions, markør-synkroniseret; barriere = række-lås ----------
function session(name) {
  // C1-r2 F-17: ÉN ordnet strøm (stderr → stdout via 2>&1 i containeren), så ERROR-linjer altid står FØR markøren for samme sætning
  const p = spawn("docker", ["exec", "-i", CONTAINER, "sh", "-c", "exec psql -U postgres -v ON_ERROR_STOP=0 -q -tA 2>&1"], { stdio: ["pipe", "pipe", "pipe"] });
  let out = "", n = 0;
  p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (out += d));
  const run = (sql, timeoutMs = 15000) => new Promise((resolve, reject) => {
    const mark = `MARK_${name}_${++n}`; const outStart = out.length;
    p.stdin.write(`${sql}\n\\echo ${mark}\n`);
    const t0 = Date.now();
    const poll = () => {
      if (out.includes(mark, outStart)) { const seg = out.slice(outStart, out.indexOf(mark, outStart)); const pe = parseErr(seg); const ok = !/ERROR:/.test(seg); return resolve({ ok, code: ok ? null : pe.code, detail: ok ? null : pe.detail, out: seg.split("\n").filter((l) => !/^(ERROR|CONTEXT|LOCATION|DETAIL|HINT):/.test(l)).join("\n").trim(), err: seg }); }
      if (Date.now() - t0 > timeoutMs) return reject(new Error(`${name}: timeout på '${sql.slice(0, 40)}'`));
      setTimeout(poll, 15);
    };
    poll();
  });
  // start uden at vente: returnerer promise der løser når sætningen er FÆRDIG (kan blokere på lås)
  const startAsync = (sql, timeoutMs = 20000) => run(sql, timeoutMs);
  const close = () => { try { p.stdin.end(); } catch {} p.kill(); };
  return { run, startAsync, close };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// barriere-vidne: B's backend er blokeret af A's backend (pg_blocking_pids) — pid-bundet, ikke »en eller anden lås«
async function waitBlockedBy(bpid, apid, timeoutMs = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const w = q1(`select ${apid} = any(pg_blocking_pids(${bpid})) and (select wait_event_type from pg_stat_activity where pid = ${bpid}) = 'Lock';`);
    if (w === "t") return true; await sleep(20);
  }
  return false;
}
// race(scenario): A starter og holder (BEGIN + a.sql uden commit) · B starter (blokerer på række-låsen) · barriere observeres ·
// A committer · B færdiggør · begge afslutter · invarianten læses. actor = {role, settings}
async function race(s) {
  const A = session("A"), B = session("B");
  try {
    const pre = (nm) => `\\set VERBOSITY verbose\nset application_name = '${nm}';\n${s.actor?.role ? `set role ${s.actor.role};` : ""}`;
    const pa0 = await A.run(pre("v5race_A")); const pb0 = await B.run(pre("v5race_B"));
    if (!pa0.ok || !pb0.ok) return { protocolOk: false, error: `rolle-/sessionsopsætning fejlede (A ok=${pa0.ok}, B ok=${pb0.ok})` };   // F-17
    const ra0 = await A.run("select current_user;"); const rb0 = await B.run("select current_user;");
    if (s.actor?.role && (ra0.out !== s.actor.role || rb0.out !== s.actor.role)) return { protocolOk: false, error: `faktisk rolle ≠ ønsket (${ra0.out}/${rb0.out} vs ${s.actor.role})` };
    if (s.setup?.sql) { const r = dockerPsql(s.setup.sql, {}); if (!r.ok) return { protocolOk: false, error: `setup: ${r.error}` }; }
    const pa = Number((await A.run("select pg_backend_pid();")).out); const pb = Number((await B.run("select pg_backend_pid();")).out);
    if (!Number.isInteger(pa) || !Number.isInteger(pb)) return { protocolOk: false, error: "kunne ikke læse backend-pids" };
    const ra1 = await A.run("begin;"); const rb1 = await B.run("begin;");
    if (!ra1.ok || !rb1.ok) return { protocolOk: false, error: "begin fejlede" };
    const ra = await A.run(s.a.sql);                              // A holder låsen (ingen commit endnu)
    const bPromise = B.startAsync(s.b.sql);                       // B blokerer hvis barrieren (række-lås) findes
    const observed = await waitBlockedBy(pb, pa);                 // B's pid blokeret af A's pid (pg_blocking_pids)
    const ca = await A.run("commit;");
    const rb = await bPromise;
    const cb = await B.run(rb.ok ? "commit;" : "rollback;");
    const inv = dockerPsql(s.invariant.observe.sql, {});
    return { protocolOk: true,
      a: { pid: pa, ok: ra.ok, code: ra.code, detail: ra.detail, commit: ca.ok ? "commit" : "fejl" },
      b: { pid: pb, ok: rb.ok, code: rb.code, detail: rb.detail, commit: cb.ok ? (rb.ok ? "commit" : "rollback") : "fejl" },
      barrier: { observed, blocked_pid: observed ? pb : null, blocking_pid: observed ? pa : null }, invariantRows: inv.rows ?? null };
  } catch (e) { return { protocolOk: false, error: e.message }; } finally { A.close(); B.close(); }
}
const runner = { sql: dockerPsql, race };

// ---------- fixture: syntetisk lokations-skabelon-udsnit (offentlige fn = security definer; app_role har KUN execute) ----------
console.log(`build-harness INTEGRATION v2 mod '${CONTAINER}':`);
const FN_OPRET = (blankCheck, audit) => `create or replace function f.lokation_opret(p_id int, p_navn text) returns int language plpgsql security definer as $$ begin ${blankCheck ? "if p_navn is null or btrim(p_navn) = '' then raise exception using errcode = '22023', message = 'navn_blank'; end if;" : ""} insert into f.lokation(id, navn) values (p_id, p_navn); ${audit ? "insert into f.audit(handling, lokation_id) values ('opret', p_id);" : ""} return p_id; end $$;`;
const FN_DEAKT = (laas, check) => `create or replace function f.stand_deaktiver(p_stand int) returns void language plpgsql security definer as $$ declare v_lok int; begin select lokation_id into v_lok from f.stand where id = p_stand; ${laas ? "perform 1 from f.lokation where id = v_lok for update;" : ""} update f.stand set aktiv = false where id = p_stand; ${check ? "if not exists (select 1 from f.stand where lokation_id = v_lok and aktiv) then raise exception using errcode = 'P0001', message = 'min_en_stand'; end if;" : ""} end $$;`;
const FN_PRIS = (dato) => `create or replace function f.pris_paa(p_lok int, p_dato date) returns numeric language sql security definer stable as $$ select pris from f.prishist where lokation_id = p_lok ${dato ? "and fra <= p_dato" : ""} order by fra desc limit 1 $$;`;
const FIX = `
drop schema if exists f cascade; create schema f;
do $$ begin if not exists (select from pg_roles where rolname='app_role') then create role app_role; end if; end $$;
grant app_role to postgres; grant usage on schema f to app_role;
create table f.lokation(id int primary key, navn text not null, aktiv boolean not null default true);
create table f.stand(id int primary key, lokation_id int not null references f.lokation, aktiv boolean not null default true);
create table f.audit(id serial primary key, handling text not null, lokation_id int);
create table f.prishist(lokation_id int not null, fra date not null, pris numeric not null);
insert into f.lokation values (1,'Torvet',true); insert into f.stand values (1,1,true),(2,1,true),(3,1,false);
insert into f.prishist values (1,'2026-01-01',80),(1,'2026-06-01',100);
grant select on f.lokation, f.stand, f.audit to app_role;   -- læse-vidner/tilstand; INGEN skriv/insert-grants (direkte DML → 42501)
${FN_OPRET(true, true)}
${FN_PRIS(true)}
${FN_DEAKT(true, true)}
revoke all on all functions in schema f from public;   -- LÆRDOM: Postgres giver EXECUTE til PUBLIC som default — en revoke fra én rolle fjerner intet uden dette
grant execute on function f.lokation_opret(int,text), f.pris_paa(int,date), f.stand_deaktiver(int) to app_role;
`;
const setup = dockerPsql(FIX); eq("fixture opsat", setup.ok, true); if (!setup.ok) { console.error(setup.error); process.exit(1); }
const reset = () => dockerPsql(`delete from f.audit; delete from f.lokation where id <> 1; update f.stand set aktiv = (id in (1,2)) where lokation_id = 1;`, {});

// ---------- manifest (forventningen) + cases ----------
const OID = (c) => c.repeat(40);
const rc = (sqlstate, sted, grund, fase = "wrapper", aktoer = "app_role") => ({ kanal: "sqlstate", sqlstate, grund, afvisningssted: sted, fase, aktoer, observationskanal: "sqlstate", offentlig_signatur: "f.*" });
const manifest = {
  schema_version: 1, pakke: "fixture", bindings: { forventningsliste: { path: "f.md", oid: OID("a") }, krav: { path: "k.md", oid: OID("b") }, plan: { path: "p.md", oid: OID("c") } },
  guards: [{ id: "g.navn", beskrivelse: "blank-check i lokation_opret" }, { id: "g.grant", beskrivelse: "execute-grant til app_role" }, { id: "g.audit", beskrivelse: "audit-insert i lokation_opret" }, { id: "g.pris", beskrivelse: "dato-filter i pris_paa" }, { id: "g.min-check", beskrivelse: "min-én-stand-check" }, { id: "g.min-laas", beskrivelse: "række-lås på lokation (SA-barriere)" }, { id: "g.dml", beskrivelse: "ingen insert-grant på f.lokation" }],
  obligations: [
    { id: "K-1/ac-1", k_id: "K-1", kind: "ac", proof_forms: ["UT", "MH"], scope: "nu", kildeankre: ["K:1"], assertions: [{ id: "audit-opret", form: "MH" }], negatives: [{ id: "K-1/ac-1/neg-1", beskrivelse: "blankt navn → 22023", reject_contract: rc("22023", "f.lokation_opret", "navn_blank"), sole_guard_ref: "g.navn" }, { id: "K-1/ac-1/neg-2", beskrivelse: "direkte insert som app_role → 42501 (ACL, ingen routine)", reject_contract: rc("42501", "-", "permission denied for table lokation", "direkte DML"), sole_guard_ref: "g.dml" }] },
    { id: "K-1/ac-3", k_id: "K-1", kind: "ac", proof_forms: ["FS"], scope: "nu", kildeankre: ["K:3"], assertions: [{ id: "hist-marts", form: "FS" }], negatives: [] },
    { id: "K-2/ac-6", k_id: "K-2", kind: "ac", proof_forms: ["UT", "SA"], scope: "nu", kildeankre: ["K:6"], assertions: [{ id: "r-sidste-to-stande", form: "SA" }], negatives: [{ id: "K-2/ac-6/neg-1", beskrivelse: "sidste aktive stand → P0001", reject_contract: rc("P0001", "f.stand_deaktiver", "min_en_stand", "apply"), sole_guard_ref: "g.min-check" }] },
    { id: "K-8/ac-4", k_id: "K-8", kind: "ac", proof_forms: ["FS"], scope: "nu", kildeankre: ["K:156"], negatives: [] },
  ],
};
const ctx = { forventning: expectedSet(manifest) };
const EP = (ref) => ({ kind: "rpc", ref }); const ACT = { role: "app_role" }; const B = "bid-2"; const HE = "db-row";
const cases = [
  { case_id: "c-navn-ut", obligation_id: "K-1/ac-1", negative_id: "K-1/ac-1/neg-1", proof_form: "UT", fase: "wrapper", bid_id: B, hard_effect: HE, entrypoint: EP("f.lokation_opret"), actor: ACT, setup: { sql: "delete from f.audit where lokation_id <> 1; delete from f.lokation where id <> 1; update f.stand set aktiv = (id in (1,2)) where lokation_id = 1;" },
    positive: { sql: "select f.lokation_opret(2, 'Havnen');" }, negative: { sql: "select f.lokation_opret(3, '   ');" }, state: { sql: "select id from f.lokation where id = 3;" } },
  { case_id: "c-dml-ut", obligation_id: "K-1/ac-1", negative_id: "K-1/ac-1/neg-2", proof_form: "UT", fase: "direkte DML", bid_id: B, hard_effect: HE, entrypoint: EP("f.lokation_opret"), actor: ACT, setup: { sql: "delete from f.audit where lokation_id <> 1; delete from f.lokation where id <> 1; update f.stand set aktiv = (id in (1,2)) where lokation_id = 1;" },
    positive: { sql: "select f.lokation_opret(4, 'Broen');" }, negative: { sql: "insert into f.lokation(id, navn) values (5, 'Direkte');" }, state: { sql: "select id from f.lokation where id = 5;" } },
  { case_id: "c-opret-mh", obligation_id: "K-1/ac-1", proof_form: "MH", bid_id: B, hard_effect: HE, entrypoint: EP("f.lokation_opret"), actor: ACT, setup: { sql: "delete from f.audit where lokation_id <> 1; delete from f.lokation where id <> 1; update f.stand set aktiv = (id in (1,2)) where lokation_id = 1;" },
    action: { sql: "select f.lokation_opret(6, 'Parken');" }, witnesses: [{ id: "audit-opret", observe: { sql: "select handling from f.audit where lokation_id = 6;" }, expect: { kind: "rows", value: [{ handling: "opret" }] } }] },
  { case_id: "c-pris-fs", obligation_id: "K-1/ac-3", proof_form: "FS", bid_id: B, hard_effect: "state", entrypoint: EP("f.pris_paa"), actor: ACT,
    observe: { sql: "select f.pris_paa(1, date '2026-09-10') as pris;" }, expect: { kind: "scalar", value: 100 }, checkpoints: [{ id: "hist-marts", observe: { sql: "select f.pris_paa(1, date '2026-03-01') as pris;" }, expect: { kind: "scalar", value: 80 } }] },
  { case_id: "c-tom-fs", obligation_id: "K-8/ac-4", proof_form: "FS", bid_id: B, hard_effect: "state", entrypoint: EP("f.audit"), actor: ACT,
    observe: { sql: "select id from f.audit where lokation_id = 999;" }, expect: { kind: "empty" } },
  { case_id: "c-min-ut", obligation_id: "K-2/ac-6", negative_id: "K-2/ac-6/neg-1", proof_form: "UT", fase: "apply", bid_id: B, hard_effect: HE, entrypoint: EP("f.stand_deaktiver"), actor: ACT, setup: { sql: "delete from f.audit where lokation_id <> 1; delete from f.lokation where id <> 1; update f.stand set aktiv = (id in (1,2)) where lokation_id = 1;" },
    positive: { sql: "select f.stand_deaktiver(1);" }, negative: { sql: "select f.stand_deaktiver(2);" }, state: { sql: "select id from f.stand where lokation_id = 1 and aktiv order by id;" } },
  { case_id: "c-race-sa", obligation_id: "K-2/ac-6", proof_form: "SA", bid_id: B, hard_effect: HE, entrypoint: EP("f.stand_deaktiver"), actor: ACT,
    race: { race_id: "r-sidste-to-stande", setup: { sql: "update f.stand set aktiv = (id in (1,2)) where lokation_id = 1;" }, a: { sql: "select f.stand_deaktiver(1);" }, b: { sql: "select f.stand_deaktiver(2);" }, barrier: "row-lock:f.lokation", reject_negative_id: "K-2/ac-6/neg-1",
      invariant: { observe: { sql: "select count(*)::int as aktive from f.stand where lokation_id = 1 and aktiv;" }, expect: { kind: "scalar", value: 1 } } } },
];
// mutanter (apply/restore som ejer)
const FP_FN = (fn) => ({ observe: { sql: `select prosrc from pg_proc where proname = '${fn}' and pronamespace = 'f'::regnamespace;` } });
const FP_GRANT = (fn) => ({ observe: { sql: `select has_function_privilege('app_role', '${fn}', 'execute') as x;` } });
const FP_TABLE_GRANT = { observe: { sql: "select has_table_privilege('app_role', 'f.lokation', 'insert') as x;" } };
const mutants = [
  { mutant_id: "m-navn", guard_ref: "g.navn", apply: FN_OPRET(false, true), restore: FN_OPRET(true, true), target_case_id: "c-navn-ut", target_assertion_id: "negativ-afvist-bundet", controls: ["c-pris-fs"], footprint: FP_FN("lokation_opret") },
  { mutant_id: "m-grant", guard_ref: "g.grant", apply: "revoke execute on function f.lokation_opret(int,text) from app_role;", restore: "grant execute on function f.lokation_opret(int,text) to app_role;", target_case_id: "c-opret-mh", target_assertion_id: "handling-mulig-for-legitim-aktoer", controls: ["c-pris-fs"], footprint: FP_GRANT("f.lokation_opret(int,text)") },
  { mutant_id: "m-audit", guard_ref: "g.audit", apply: FN_OPRET(true, false), restore: FN_OPRET(true, true), target_case_id: "c-opret-mh", target_assertion_id: "vidne:audit-opret", controls: ["c-pris-fs"], footprint: FP_FN("lokation_opret") },
  { mutant_id: "m-pris", guard_ref: "g.pris", apply: FN_PRIS(false), restore: FN_PRIS(true), target_case_id: "c-pris-fs", target_assertion_id: "checkpoint:hist-marts", controls: ["c-navn-ut"], footprint: FP_FN("pris_paa") },
  { mutant_id: "m-min-check", guard_ref: "g.min-check", apply: FN_DEAKT(true, false), restore: FN_DEAKT(true, true), target_case_id: "c-min-ut", target_assertion_id: "negativ-afvist-bundet", controls: ["c-pris-fs"], footprint: FP_FN("stand_deaktiver") },
  { mutant_id: "m-min-laas", guard_ref: "g.min-laas", apply: FN_DEAKT(false, true), restore: FN_DEAKT(true, true), target_case_id: "c-race-sa", target_assertion_id: "invariant-efter-commit", controls: ["c-pris-fs"], footprint: FP_FN("stand_deaktiver") },
  { mutant_id: "m-dml", guard_ref: "g.dml", apply: "grant insert on f.lokation to app_role;", restore: "revoke insert on f.lokation from app_role;", target_case_id: "c-dml-ut", target_assertion_id: "negativ-afvist-bundet", controls: ["c-pris-fs"], footprint: FP_TABLE_GRANT },
];

// ---------- kør: baseline pr. case ----------
console.log("\ncases mod rigtig Postgres (baseline):");
// idempotens-wrapper: positive opret-kald bruger faste id'er → slet før kald; stand-fixturen nulstilles før hvert deaktiver(1)
// C1-r1 F-8: ingen runner-wrapper der ændrer tilstand inde i måleforløbet — hver case har et deklareret setup (ejer) ved fasegrænsen
const idem = runner;
for (const c of cases) {
  reset(); const r = await runCase(c, ctx, idem);
  eq(`${c.case_id} [${c.proof_form}] → opfyldt`, r.status, STATUS.OPFYLDT);
  if (r.status !== STATUS.OPFYLDT) console.error("      ", JSON.stringify(r.assertions), JSON.stringify(r.observations).slice(0, 300));
}
{ reset(); const r = await runCase(cases[6], ctx, idem); eq("SA: barrieren (række-lås) blev OBSERVERET via pg_blocking_pids — B's pid blokeret af A's pid, ikke sekventiel", r.observations.barrier.observed === true && r.observations.barrier.blocked_pid === r.observations.b.pid && r.observations.barrier.blocking_pid === r.observations.a.pid, true); eq("SA: præcis én afvisning og den er P0001", r.observations.b?.code === "P0001" && r.observations.a?.ok === true, true); }
{ reset(); const r = await runCase({ ...cases[4], observe: { sql: "select 1 as x where false;" } }, ctx, idem); eq("K-8-typen: komplet rows=[] er opfyldt (ikke manglende svar)", r.status, STATUS.OPFYLDT); }
{ reset(); const r = await runCase({ ...cases[0], negative: { sql: "select f.lokation_opret(3, 'Gyldigt navn');" } }, ctx, idem); eq("UT: forbudt handling TILLADT (ingen afvisning) → brudt, observationen viser negative.ok=true", r.status === STATUS.BRUDT && r.observations.negative.ok === true, true); }

// ---------- mutanter: formbestemt kill mod virkeligheden ----------
console.log("\nmutanter (én pr. værn) — formbestemt kill:");
// engine-kørsel: hver case/mutant nulstiller fixturen via en runner-wrapper der resetter før hvert positivt kald? Enklere: reset før hele kørslen og brug unikke id'er pr. kald via sekvens.
reset();
const eng = await runBuildProofEngine({ manifest, run_id: "int-1", angrebsSpec: { cases, mutants } }, idem);
eq("engine: alle cases opfyldt", eng.summary?.opfyldt, cases.length);
for (const m of eng.mutants) { const good = m.killed && m.restored && m.cleanAfter; eq(`${m.mutant_id} (${m.guard_ref}) → dræbt som ${m.break_form ?? "—"} · restored · ren`, good, true); if (!good) console.error("      ", JSON.stringify({ killed: m.killed, restored: m.restored, cleanAfter: m.cleanAfter, detail: m.detail }).slice(0, 600)); }
eq("engine: allOk (alle former opfyldt + alle 7 mutanter dræbt formbestemt)", eng.allOk, true);
eq("break_form pr. mutant: UT·MH·MH·FS·UT·SA·UT", eng.mutants.map((m) => m.break_form).join(","), "UT,MH,MH,FS,UT,SA,UT");
{ const sa = eng.cases.find((c) => c.case_id === "c-race-sa"); eq("SA-observationer bærer to forskellige backend-pids, blokeret/blokerende pid og afslutnings-udfald (F-8)", Number.isInteger(sa.observations.a.pid) && Number.isInteger(sa.observations.b.pid) && sa.observations.a.pid !== sa.observations.b.pid && sa.observations.barrier.blocked_pid === sa.observations.b.pid && sa.observations.barrier.blocking_pid === sa.observations.a.pid && sa.observations.a.commit === "commit" && sa.observations.b.commit === "rollback", true); }
{ const ut = eng.cases.find((c) => c.case_id === "c-navn-ut"); eq("UT-observationer bærer struktureret afvisning: kode + præcist message-token + routine (F-4)", ut.observations.negative.code === "22023" && ut.observations.negative.detail.message === "navn_blank" && ut.observations.negative.detail.routine === "f.lokation_opret", true); }
{ const r = await runBuildProofEngine({ manifest, run_id: "int-2", angrebsSpec: { cases: [cases[3], cases[0]], mutants: [{ mutant_id: "m-findes", guard_ref: "g.pris", apply: "comment on function f.pris_paa(int,date) is 'mut';", restore: "comment on function f.pris_paa(int,date) is null;", target_case_id: "c-pris-fs", target_assertion_id: "vaerdi-matcher-orakel", controls: ["c-navn-ut"], footprint: FP_FN("pris_paa") }] } }, idem); eq("kontrast: »findes«-mutant (kun kommentar) OVERLEVER → allOk=false (footprint uændret = ingen mutation attesteret)", r.allOk === false && r.mutants[0].killed === false && /mutation_attesteret=false/.test(r.mutants[0].detail), true); }
{ const mn = eng.mutants.find((m) => m.mutant_id === "m-navn"); eq("footprint attesterer mutation og restore: baseline ≠ under, restored == baseline (F-13/F-16)", JSON.stringify(mn.footprint_baseline) !== JSON.stringify(mn.footprint_under) && JSON.stringify(mn.footprint_restored) === JSON.stringify(mn.footprint_baseline), true); }

dockerPsql("drop schema if exists f cascade;", {});
console.log("");
if (failed > 0) { console.error(`build-harness INTEGRATION v2: ${failed} FEJLEDE (${passed} ok)`); process.exit(1); }
console.log(`build-harness INTEGRATION v2: alle ${passed} cases passed (fire bevisformer + formbestemte kills bevist mod rigtig Postgres)`);
