#!/usr/bin/env node
// build-harness.integration.mjs — RIGTIG-Postgres-bevis for sandheds-motoren v2.3 (plan 2.C · C1 »integration mod container grøn«).
//
// IKKE en del af v5:selftest (CI er container-fri). Kør manuelt mod en ISOLERET éngangs-container (ALDRIG repoets PROD-db):
//   docker run -d --name v5-buildproof-pg -e POSTGRES_PASSWORD=test -p 55432:5432 public.ecr.aws/supabase/postgres:17.6.1.121
//   node scripts/v5/build-harness.integration.mjs
//
// Beviser mod virkelighed at motoren udtrykker de fire bevisformer som SÆRSKILTE udfald og dræber formbestemt — OG at det producerede
// bevis går HELE vejen gennem spec-validator + verifier (validateAngrebsSpec · verifyBuildProof) mod en rigtig git-historik med
// manifest + angrebs-spec som gate-bindinger (R-INTEGRATIONS-PROVENANCE, C1-r3):
//   UT  22023 (domæne-afvisning i offentlig fn) · 42501 (direkte DML uden grant) · P0001 (trigger: mindst én aktiv stand)
//   FS  dateret pris-opslag (nu + historisk checkpoint) · K-8-typen: komplet rows=[] ≠ manglende svar (filtreret offentlig fn)
//   MH  legitim non-admin kan oprette via offentlig fn OG audit-vidnet findes
//   SA  to psql-sessions deaktiverer hver sin af de to sidste aktive stande; OVERLAP vidnes af en TREDJE backend (pg_stat_activity:
//       begge pids inde i deres skrivende transaktion samtidigt FØR nogen commit — uafhængigt af produktlåsen, F-22); præcis én afvises P0001
//   Mutanter (én pr. værn): blank-check fjernet → UT-kill · grant fjernet → MH-kill · audit-insert fjernet → MH-kill (vidne) · dato
//   ignoreret → FS-kill (checkpoint) · trigger-check fjernet → UT-kill · lås fjernet → SA-kill (begge igennem, overlap vidnet, invariant
//   brudt) · insert-grant givet → UT-kill · lokations-filter fjernet → FS-kill (K-8) · »findes«-mutant (kommentar) → OVERLEVER.
//   Transport (F-27): pr. sætning en tilfældig nonce-markør, matchet som HEL linje og krævet PRÆCIS én gang — data kan ikke afslutte rammen.

import { execFileSync, spawn } from "node:child_process";
import { randomBytes, createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { runBuildProofEngine, runCase, STATUS } from "./build-harness.mjs";
import { expectedSet } from "./forventnings-manifest.mjs";
import { validateAngrebsSpec } from "./angrebs-spec.mjs";
import { verifyBuildProof } from "./build-proof.mjs";
import { makeGit, resolveRef } from "./git.mjs";
import { readBlobLines, excerptAt } from "./verdikt.mjs";

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
  const m = stderr.match(/^ERROR:\s+([0-9A-Z]{5}):\s+([^\n]*)/m); const c = stderr.match(/^CONTEXT:\s+PL\/pgSQL function ([^(\s]+)\(/m);
  return { error: stderr.slice(0, 200), code: m ? m[1] : null, detail: { message: m ? m[2].trim() : null, routine: c ? c[1] : null } };
}
const q1 = (sqlText) => execFileSync("docker", ["exec", "-i", CONTAINER, "psql", "-U", "postgres", "-tAc", sqlText]).toString().trim();

// ---------- rigtig race-runner: to interaktive psql-sessions, nonce-markør-synkroniseret (F-27) ----------
export function session(name, spawnFn = () => spawn("docker", ["exec", "-i", CONTAINER, "sh", "-c", "exec psql -U postgres -v ON_ERROR_STOP=0 -q -tA 2>&1"], { stdio: ["pipe", "pipe", "pipe"] })) {
  // C1-r2 F-17: ÉN ordnet strøm (stderr → stdout via 2>&1 i containeren), så ERROR-linjer altid står FØR markøren for samme sætning.
  // C1-r3 F-27: markøren bærer en TILFÆLDIG nonce pr. session (ukendt for produktkoden), matches kun som HEL linje og skal forekomme
  // PRÆCIS én gang i segmentet — returnerede data kan ikke afslutte rammen eller flytte en fejl til en anden sætning.
  const p = spawnFn();
  let out = "", n = 0; const nonce = randomBytes(12).toString("hex");
  try { p.stdin.write("\\set VERBOSITY verbose\n"); } catch {}   // SQLSTATE i ERROR-linjen fra første sætning (psql udskriver intet for \set)
  p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (out += d));
  const run = (sql, timeoutMs = 15000) => new Promise((resolve, reject) => {
    const mark = `MARK-${nonce}-${name}-${++n}`; const outStart = out.length;
    p.stdin.write(`${sql}\n\\echo ${mark}\n`);
    const t0 = Date.now();
    const poll = () => {
      const seg0 = out.slice(outStart); const re = new RegExp(`^${mark}$`, "m"); const m = re.exec(seg0);
      if (m) {
        const hits = (seg0.match(new RegExp(`^${mark}$`, "mg")) ?? []).length;
        if (hits !== 1) return reject(new Error(`${name}: markøren forekom ${hits} gange — rammen er ikke entydig (F-27)`));
        const seg = seg0.slice(0, m.index); const pe = parseErr(seg); const isErr = /^ERROR:/m.test(seg);
        return resolve({ ok: !isErr, code: isErr ? pe.code : null, detail: isErr ? pe.detail : null, out: seg.split("\n").filter((l) => !/^(ERROR|CONTEXT|LOCATION|DETAIL|HINT):/.test(l)).join("\n").trim(), err: seg });
      }
      if (Date.now() - t0 > timeoutMs) return reject(new Error(`${name}: timeout på '${sql.slice(0, 40)}'`));
      setTimeout(poll, 15);
    };
    poll();
  });
  const startAsync = (sql, timeoutMs = 20000) => run(sql, timeoutMs);   // returnerer promise der løser når sætningen er FÆRDIG (kan blokere på lås)
  const close = () => { try { p.stdin.end(); } catch {} p.kill(); };
  return { run, startAsync, close };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// F-22: UAFHÆNGIGT overlap-vidne — en TREDJE backend (frisk psql) ser A og B inde i deres skrivende transaktion samtidigt
// (xact_start sat OG (backend_xid tildelt ELLER ventende på Lock)) FØR nogen commit. Forudsætter IKKE produktlåsen: fjernes låsen,
// står begge stadig i åben skrivende transaktion samtidigt — og invarianten kan så brydes.
async function witnessOverlap(pa, pb, timeoutMs = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const w = q1(`select pg_backend_pid()::text || ':' || (select count(*) from pg_stat_activity where pid in (${pa}, ${pb}) and xact_start is not null and (backend_xid is not null or wait_event_type = 'Lock'))::text;`);
    const [wp, cnt] = w.split(":");
    if (cnt === "2") return { observed: true, witness_pid: Number(wp), a_pid: pa, b_pid: pb };
    await sleep(20);
  }
  return { observed: false, witness_pid: null, a_pid: pa, b_pid: pb };
}
// produkt-observation (dømmes IKKE af motoren): er B lige nu blokeret af A (pg_blocking_pids)?
const blockedBy = (bpid, apid) => q1(`select ${apid} = any(pg_blocking_pids(${bpid}));`) === "t";
// race(scenario): A starter og holder (BEGIN + a.sql uden commit) · B starter · overlap vidnes af tredje backend · A committer ·
// B færdiggør · begge afslutter · invarianten læses. actor = {role, settings}. setup er MOTORENS (F-20) — runneren afviser den.
async function race(s) {
  const A = session("A"), B = session("B");
  try {
    if (s.setup) return { protocolOk: false, error: "race.setup skal udføres af motoren som ejer (F-20) — runneren modtager ikke setup" };
    const pre = (nm) => `\\set VERBOSITY verbose\nset application_name = '${nm}';\n${s.actor?.role ? `set role ${s.actor.role};` : ""}`;
    const pa0 = await A.run(pre("v5race_A")); const pb0 = await B.run(pre("v5race_B"));
    if (!pa0.ok || !pb0.ok) return { protocolOk: false, error: `rolle-/sessionsopsætning fejlede (A ok=${pa0.ok}, B ok=${pb0.ok})` };   // F-17
    const ra0 = await A.run("select current_user;"); const rb0 = await B.run("select current_user;");
    if (s.actor?.role && (ra0.out !== s.actor.role || rb0.out !== s.actor.role)) return { protocolOk: false, error: `faktisk rolle ≠ ønsket (${ra0.out}/${rb0.out} vs ${s.actor.role})` };
    const pa = Number((await A.run("select pg_backend_pid();")).out); const pb = Number((await B.run("select pg_backend_pid();")).out);
    if (!Number.isInteger(pa) || !Number.isInteger(pb)) return { protocolOk: false, error: "kunne ikke læse backend-pids" };
    const ra1 = await A.run("begin;"); const rb1 = await B.run("begin;");
    if (!ra1.ok || !rb1.ok) return { protocolOk: false, error: "begin fejlede" };
    const ra = await A.run(s.a.sql);                              // A holder (ingen commit endnu)
    const bPromise = B.startAsync(s.b.sql);                       // B starter — blokerer KUN hvis produktlåsen findes
    const overlap = await witnessOverlap(pa, pb);                 // uafhængigt vidne (F-22)
    const blocking = { observed: blockedBy(pb, pa), blocked_pid: pb, blocking_pid: pa };   // produkt-observation, ikke dom
    const ca = await A.run("commit;");
    const rb = await bPromise;
    const cb = await B.run(rb.ok ? "commit;" : "rollback;");
    const inv = dockerPsql(s.invariant.observe.sql, {});
    return { protocolOk: true,
      a: { pid: pa, ok: ra.ok, code: ra.code, detail: ra.detail, commit: ca.ok ? "commit" : "fejl" },
      b: { pid: pb, ok: rb.ok, code: rb.code, detail: rb.detail, commit: cb.ok ? (rb.ok ? "commit" : "rollback") : "fejl" },
      overlap, blocking, invariantRows: inv.rows ?? null };
  } catch (e) { return { protocolOk: false, error: e.message }; } finally { A.close(); B.close(); }
}
const runner = { sql: dockerPsql, race };

// ---------- fixture: syntetisk lokations-skabelon-udsnit (offentlige fn = security definer; app_role har KUN execute) ----------
console.log(`build-harness INTEGRATION v2.3 mod '${CONTAINER}':`);
const FN_OPRET = (blankCheck, audit) => `create or replace function f.lokation_opret(p_id int, p_navn text) returns int language plpgsql security definer as $$ begin ${blankCheck ? "if p_navn is null or btrim(p_navn) = '' then raise exception using errcode = '22023', message = 'navn_blank'; end if;" : ""} insert into f.lokation(id, navn) values (p_id, p_navn); ${audit ? "insert into f.audit(handling, lokation_id) values ('opret', p_id);" : ""} return p_id; end $$;`;
const FN_DEAKT = (laas, check) => `create or replace function f.stand_deaktiver(p_stand int) returns void language plpgsql security definer as $$ declare v_lok int; begin select lokation_id into v_lok from f.stand where id = p_stand; ${laas ? "perform 1 from f.lokation where id = v_lok for update;" : ""} update f.stand set aktiv = false where id = p_stand; ${check ? "if not exists (select 1 from f.stand where lokation_id = v_lok and aktiv) then raise exception using errcode = 'P0001', message = 'min_en_stand'; end if;" : ""} end $$;`;
const FN_PRIS = (dato) => `create or replace function f.pris_paa(p_lok int, p_dato date) returns numeric language sql security definer stable as $$ select pris from f.prishist where lokation_id = p_lok ${dato ? "and fra <= p_dato" : ""} order by fra desc limit 1 $$;`;
const FN_AUDIT_FOR = (filter) => `create or replace function f.audit_for(p_lok int) returns table(id int) language sql security definer stable as $$ select id from f.audit ${filter ? "where lokation_id = p_lok" : ""} order by id $$;`;
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
${FN_AUDIT_FOR(true)}
revoke all on all functions in schema f from public;   -- LÆRDOM: Postgres giver EXECUTE til PUBLIC som default — en revoke fra én rolle fjerner intet uden dette
grant execute on function f.lokation_opret(int,text), f.pris_paa(int,date), f.stand_deaktiver(int), f.audit_for(int) to app_role;
`;
const setup = dockerPsql(FIX); eq("fixture opsat", setup.ok, true); if (!setup.ok) { console.error(setup.error); process.exit(1); }
const reset = () => dockerPsql(`delete from f.audit; delete from f.lokation where id <> 1; update f.stand set aktiv = (id in (1,2)) where lokation_id = 1;`, {});

// ---------- rigtig git-historik: filer → manifest → angrebs-spec (gate-bindinger som i CI) ----------
const ROOT = mkdtempSync(join(tmpdir(), "v5-integration-")); process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]); const git = makeGit(ROOT); git("config", "user.name", "integration"); git("config", "user.email", "integration@local");
const put = (p, c) => { mkdirSync(join(ROOT, dirname(p)), { recursive: true }); writeFileSync(join(ROOT, p), c); };
const sha256 = (s) => createHash("sha256").update(s).digest("hex");
put("plan/plan.md", "# plan — fixture\n\nbid-1 (forudsætning) · bid-2 (effekt) realiserer K-1, K-2, K-8.\n"); put("plan-build/fixture/forventningsliste.md", "# liste (LÅST)\n"); put("docs/krav.md", "# krav\n");
put("build/build-proof.json", JSON.stringify({ note: "artefakt-placeholder" }) + "\n");
put("supabase/migrations/0001_fixture.sql", [FN_OPRET(true, true), FN_PRIS(true), FN_DEAKT(true, true), FN_AUDIT_FOR(true)].join("\n") + "\n");   // linje 1..4 = de fire routiner
git("add", "-A"); git("commit", "-qm", "filer"); const C0 = git("rev-parse", "HEAD"); const oidAt = (p, c = C0) => resolveRef(git, c, p).oid;

// ---------- manifest (forventningen) ----------
const rc = (sqlstate, sted, grund, fase = "wrapper", aktoer = "app_role") => ({ kanal: "sqlstate", sqlstate, grund, afvisningssted: sted, fase, aktoer, observationskanal: "sqlstate", offentlig_signatur: "f.*" });
const manifest = {
  schema_version: 1, pakke: "fixture", bindings: { forventningsliste: { path: "plan-build/fixture/forventningsliste.md", oid: oidAt("plan-build/fixture/forventningsliste.md") }, krav: { path: "docs/krav.md", oid: oidAt("docs/krav.md") }, plan: { path: "plan/plan.md", oid: oidAt("plan/plan.md") } },
  guards: [{ id: "g.navn", beskrivelse: "blank-check i lokation_opret" }, { id: "g.grant", beskrivelse: "execute-grant til app_role" }, { id: "g.audit", beskrivelse: "audit-insert i lokation_opret" }, { id: "g.pris", beskrivelse: "dato-filter i pris_paa" }, { id: "g.min-check", beskrivelse: "min-én-stand-check" }, { id: "g.min-laas", beskrivelse: "række-lås på lokation (SA-overlap)" }, { id: "g.dml", beskrivelse: "ingen insert-grant på f.lokation" }, { id: "g.audit-filter", beskrivelse: "lokations-filter i audit_for (K-8: tom mængde er et svar)" }],
  obligations: [
    { id: "K-1/ac-1", k_id: "K-1", kind: "ac", proof_forms: ["UT", "MH"], scope: "nu", kildeankre: ["K:1"], assertions: [{ id: "audit-opret", form: "MH" }], negatives: [{ id: "K-1/ac-1/neg-1", beskrivelse: "blankt navn → 22023", reject_contract: rc("22023", "f.lokation_opret", "navn_blank"), sole_guard_ref: "g.navn" }, { id: "K-1/ac-1/neg-2", beskrivelse: "direkte insert som app_role → 42501 (ACL, ingen routine)", reject_contract: rc("42501", "-", "permission denied for table lokation", "direkte DML"), sole_guard_ref: "g.dml" }] },
    { id: "K-1/ac-3", k_id: "K-1", kind: "ac", proof_forms: ["FS"], scope: "nu", kildeankre: ["K:3"], assertions: [{ id: "hist-marts", form: "FS" }], negatives: [] },
    { id: "K-2/ac-6", k_id: "K-2", kind: "ac", proof_forms: ["UT", "SA"], scope: "nu", kildeankre: ["K:6"], assertions: [{ id: "r-sidste-to-stande", form: "SA" }], negatives: [{ id: "K-2/ac-6/neg-1", beskrivelse: "sidste aktive stand → P0001", reject_contract: rc("P0001", "f.stand_deaktiver", "min_en_stand", "apply"), sole_guard_ref: "g.min-check" }] },
    { id: "K-8/ac-4", k_id: "K-8", kind: "ac", proof_forms: ["FS"], scope: "nu", kildeankre: ["K:156"], negatives: [] },
  ],
};
put("plan-build/fixture/forventnings-manifest.json", JSON.stringify(manifest, null, 1) + "\n"); git("add", "-A"); git("commit", "-qm", "manifest"); const C1 = git("rev-parse", "HEAD"); const MOID = oidAt("plan-build/fixture/forventnings-manifest.json", C1);
const ctx = { forventning: expectedSet(manifest) };
const EP = (ref) => ({ kind: "rpc", ref }); const ACT = { role: "app_role" }; const B = "bid-2"; const HE = "db-row";
const SETUP = { sql: "delete from f.audit where lokation_id <> 1; delete from f.lokation where id <> 1; update f.stand set aktiv = (id in (1,2)) where lokation_id = 1;" };
const cases = [
  { case_id: "c-navn-ut", obligation_id: "K-1/ac-1", negative_id: "K-1/ac-1/neg-1", proof_form: "UT", fase: "wrapper", bid_id: B, hard_effect: HE, entrypoint: EP("f.lokation_opret"), actor: ACT, setup: SETUP,
    positive: { sql: "select f.lokation_opret(2, 'Havnen');" }, negative: { sql: "select f.lokation_opret(3, '   ');" }, state: { sql: "select id from f.lokation where id = 3;" } },
  { case_id: "c-dml-ut", obligation_id: "K-1/ac-1", negative_id: "K-1/ac-1/neg-2", proof_form: "UT", fase: "direkte DML", bid_id: B, hard_effect: HE, entrypoint: EP("f.lokation_opret"), actor: ACT, setup: SETUP,
    positive: { sql: "select f.lokation_opret(4, 'Broen');" }, negative: { sql: "insert into f.lokation(id, navn) values (5, 'Direkte');" }, state: { sql: "select id from f.lokation where id = 5;" } },
  { case_id: "c-opret-mh", obligation_id: "K-1/ac-1", proof_form: "MH", bid_id: B, hard_effect: HE, entrypoint: EP("f.lokation_opret"), actor: ACT, setup: SETUP,
    action: { sql: "select f.lokation_opret(6, 'Parken');" }, witnesses: [{ id: "audit-opret", observe: { sql: "select handling from f.audit where lokation_id = 6;" }, expect: { kind: "rows", value: [{ handling: "opret" }] } }] },
  { case_id: "c-pris-fs", obligation_id: "K-1/ac-3", proof_form: "FS", bid_id: B, hard_effect: "state", entrypoint: EP("f.pris_paa"), actor: ACT,
    observe: { sql: "select f.pris_paa(1, date '2026-09-10') as pris;" }, expect: { kind: "scalar", value: 100 }, checkpoints: [{ id: "hist-marts", observe: { sql: "select f.pris_paa(1, date '2026-03-01') as pris;" }, expect: { kind: "scalar", value: 80 } }] },
  { case_id: "c-tom-fs", obligation_id: "K-8/ac-4", proof_form: "FS", bid_id: B, hard_effect: "state", entrypoint: EP("f.audit_for"), actor: ACT, setup: { sql: "delete from f.audit; insert into f.audit(handling, lokation_id) values ('seed', 1);" },
    observe: { sql: "select id from f.audit_for(999);" }, expect: { kind: "empty" } },
  { case_id: "c-min-ut", obligation_id: "K-2/ac-6", negative_id: "K-2/ac-6/neg-1", proof_form: "UT", fase: "apply", bid_id: B, hard_effect: HE, entrypoint: EP("f.stand_deaktiver"), actor: ACT, setup: SETUP,
    positive: { sql: "select f.stand_deaktiver(1);" }, negative: { sql: "select f.stand_deaktiver(2);" }, state: { sql: "select id from f.stand where lokation_id = 1 and aktiv order by id;" } },
  { case_id: "c-race-sa", obligation_id: "K-2/ac-6", proof_form: "SA", fase: "apply", bid_id: B, hard_effect: HE, entrypoint: EP("f.stand_deaktiver"), actor: ACT,
    race: { race_id: "r-sidste-to-stande", setup: { sql: "update f.stand set aktiv = (id in (1,2)) where lokation_id = 1;" }, a: { sql: "select f.stand_deaktiver(1);" }, b: { sql: "select f.stand_deaktiver(2);" }, barrier: "row-lock:f.lokation", reject_negative_id: "K-2/ac-6/neg-1",
      invariant: { observe: { sql: "select count(*)::int as aktive from f.stand where lokation_id = 1 and aktiv;" }, expect: { kind: "scalar", value: 1 } } } },
];
// mutanter (apply/restore som ejer) — footprint = ejer-observation af det muterede objekt
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
  { mutant_id: "m-audit-filter", guard_ref: "g.audit-filter", apply: FN_AUDIT_FOR(false), restore: FN_AUDIT_FOR(true), target_case_id: "c-tom-fs", target_assertion_id: "vaerdi-matcher-orakel", controls: ["c-pris-fs"], footprint: FP_FN("audit_for") },
];
const SPEC = { schema_version: 1, pakke: "fixture", bindings: { manifest: { path: "plan-build/fixture/forventnings-manifest.json", oid: MOID }, plan: { path: "plan/plan.md", oid: oidAt("plan/plan.md") } },
  bids: [{ bid_id: "bid-1", kind: "forudsaetning", depends_on: [], covers: [] }, { bid_id: "bid-2", kind: "effekt", depends_on: ["bid-1"], covers: ["K-1/ac-1", "K-1/ac-3", "K-2/ac-6", "K-8/ac-4"] }], cases, mutants };
put("plan-build/fixture/angrebs-spec.json", JSON.stringify(SPEC, null, 1) + "\n"); git("add", "-A"); git("commit", "-qm", "angrebs-spec"); const COMMIT = git("rev-parse", "HEAD");
const ref = (p) => resolveRef(git, COMMIT, p); const plan = ref("plan/plan.md"); const artifact = ref("build/build-proof.json"); const manifestRef = ref("plan-build/fixture/forventnings-manifest.json"); const specRef = ref("plan-build/fixture/angrebs-spec.json");
{ const v = validateAngrebsSpec(SPEC, manifest); eq("angrebs-spec (den faktiske måle-spec) er komplet mod manifestet", v.ok, true); if (!v.ok) console.error("      ", v.reasons.join(" | ")); }

// ---------- kør: baseline pr. case ----------
console.log("\ncases mod rigtig Postgres (baseline):");
for (const c of cases) {
  reset(); const r = await runCase(c, ctx, runner);
  eq(`${c.case_id} [${c.proof_form}] → opfyldt`, r.status, STATUS.OPFYLDT);
  if (r.status !== STATUS.OPFYLDT) console.error("      ", JSON.stringify(r.assertions), JSON.stringify(r.observations).slice(0, 400));
}
{ reset(); const r = await runCase(cases[6], ctx, runner); const o = r.observations; eq("SA: OVERLAP vidnet af en TREDJE backend (witness_pid ∉ {A,B}, a_pid/b_pid = sessionernes) — uafhængigt af produktlåsen (F-22)", o.overlap.observed === true && Number.isInteger(o.overlap.witness_pid) && o.overlap.witness_pid !== o.a.pid && o.overlap.witness_pid !== o.b.pid && o.overlap.a_pid === o.a.pid && o.overlap.b_pid === o.b.pid, true); eq("SA: præcis én afvisning og den er P0001 fra f.stand_deaktiver", o.b?.code === "P0001" && o.b?.detail?.routine === "f.stand_deaktiver" && o.a?.ok === true, true); eq("SA: race.setup udført af motoren og observeret (F-20)", o.setup?.ok, true); }
{ reset(); const r = await race({ ...cases[6].race, setup: undefined, actor: ACT }); eq("runner: produktlåsen BLOKERER faktisk B bag A i baseline (pg_blocking_pids — produkt-observation, ikke dom)", r.protocolOk && r.blocking.observed === true && r.overlap.observed === true, true); }
{ reset(); const r = await race({ ...cases[6].race, actor: ACT }); eq("runner: scenario MED setup afvises som protokol-fejl (setup er motorens, F-20)", r.protocolOk === false && /F-20/.test(r.error), true); }
{ reset(); const r = await runCase({ ...cases[4], observe: { sql: "select 1 as x where false;" } }, ctx, runner); eq("K-8-typen: komplet rows=[] er opfyldt (ikke manglende svar)", r.status, STATUS.OPFYLDT); }
{ reset(); const r = await runCase({ ...cases[0], negative: { sql: "select f.lokation_opret(3, 'Gyldigt navn');" } }, ctx, runner); eq("UT: forbudt handling TILLADT (ingen afvisning) → brudt, observationen viser negative.ok=true", r.status === STATUS.BRUDT && r.observations.negative.ok === true, true); }

// ---------- transport (F-27): markøren kan ikke forveksles med data ----------
console.log("\ntransport-ramme (F-27):");
{ const s = session("T"); const r1 = await s.run("select 'MARK-x-T-1' as data;"); eq("data der LIGNER en markør (uden nonce) afslutter ikke rammen — svaret er dataen selv", r1.ok === true && r1.out === "MARK-x-T-1", true);
  const r2 = await s.run("select 1/0;"); eq("fejl i sætning n står i sætning n's segment (22012), ikke i en anden", r2.ok === false && r2.code === "22012", true);
  const r3 = await s.run("select 'ERROR:  falsk' as data;"); eq("data der begynder med 'ERROR:' som HEL linje tolkes som fejl-ramme kun når det ER en psql-fejl — her: data-linjen står alene, ingen SQLSTATE → ok:false m. code null er en synlig protokol-anomali, ikke en stille sejr", r3.ok === false && r3.code === null, true);
  s.close(); }
{ // kontrolleret strøm: en falsk proces der udskriver en markør-lignende linje FØR den rigtige — rammen må ikke afslutte på data (nonce ukendt for data)
  const { PassThrough } = await import("node:stream"); const fakeOut = new PassThrough(); const fakeIn = new PassThrough(); let seen = "";
  fakeIn.on("data", (d) => { seen += d; const m = seen.match(/\\echo (MARK-[0-9a-f]{24}-F-1)\n/); if (m) { fakeOut.write(`MARK-x-F-1\nERROR:  P0001: min_en_stand\nCONTEXT:  PL/pgSQL function f.stand_deaktiver(int) line 1 at RAISE\n${m[1]}\n`); seen = ""; } });
  const s = session("F", () => ({ stdout: fakeOut, stderr: new PassThrough(), stdin: fakeIn, kill() {} }));
  const r = await s.run("select 1;"); eq("kontrolleret strøm: markør-LIGNENDE data før den rigtige nonce-markør → fejlen tilskrives rigtigt (P0001), rammen afsluttes først ved den rigtige markør", r.ok === false && r.code === "P0001" && r.detail?.routine === "f.stand_deaktiver", true);
  const s2 = session("G", () => { const o = new PassThrough(), i = new PassThrough(); let seen2 = ""; i.on("data", (d) => { seen2 += d; const m = seen2.match(/\\echo (MARK-[0-9a-f]{24}-G-1)\n/); if (m) { o.write(`${m[1]}\n${m[1]}\n`); seen2 = ""; } }); return { stdout: o, stderr: new PassThrough(), stdin: i, kill() {} }; });
  let err = null; try { await s2.run("select 1;"); } catch (e) { err = e.message; } eq("kontrolleret strøm: den rigtige markør to gange → protokol-fejl (rammen er ikke entydig), aldrig et svar", /F-27/.test(err ?? ""), true); }

// ---------- mutanter: formbestemt kill mod virkeligheden ----------
console.log("\nmutanter (én pr. værn) — formbestemt kill:");
reset();
const eng = await runBuildProofEngine({ manifest, run_id: "int-1", angrebsSpec: SPEC }, runner);
eq("engine: alle cases opfyldt", eng.summary?.opfyldt, cases.length);
for (const m of eng.mutants) { const good = m.killed && m.restored && m.cleanAfter; eq(`${m.mutant_id} (${m.guard_ref}) → dræbt som ${m.break_form ?? "—"} · restored · ren`, good, true); if (!good) console.error("      ", JSON.stringify({ killed: m.killed, restored: m.restored, cleanAfter: m.cleanAfter, detail: m.detail }).slice(0, 700)); }
eq("engine: allOk (alle former opfyldt + alle 8 mutanter dræbt formbestemt)", eng.allOk, true);
eq("break_form pr. mutant: UT·MH·MH·FS·UT·SA·UT·FS", eng.mutants.map((m) => m.break_form).join(","), "UT,MH,MH,FS,UT,SA,UT,FS");
{ const sa = eng.cases.find((c) => c.case_id === "c-race-sa"); const o = sa.observations; eq("SA-observationer bærer to forskellige backend-pids, uafhængigt overlap-vidne, afslutnings-udfald, aktør og fase (F-8/F-22/F-24)", Number.isInteger(o.a.pid) && Number.isInteger(o.b.pid) && o.a.pid !== o.b.pid && o.overlap.observed === true && o.overlap.witness_pid !== o.a.pid && o.overlap.witness_pid !== o.b.pid && o.a.commit === "commit" && o.b.commit === "rollback" && o.aktoer === "app_role" && o.fase === "apply", true); }
{ const ml = eng.mutants.find((m) => m.mutant_id === "m-min-laas"); const u = ml.under.observations; eq("SA-kill: under den fjernede lås gik BEGGE igennem og committede, overlappet blev stadig vidnet uafhængigt, invarianten brød (F-22)", u.a.ok === true && u.b.ok === true && u.a.commit === "commit" && u.b.commit === "commit" && u.overlap.observed === true && ml.killed === true, true); }
{ const ut = eng.cases.find((c) => c.case_id === "c-navn-ut"); eq("UT-observationer bærer struktureret afvisning: kode + præcist message-token + routine (F-4)", ut.observations.negative.code === "22023" && ut.observations.negative.detail.message === "navn_blank" && ut.observations.negative.detail.routine === "f.lokation_opret", true); }
{ const r = await runBuildProofEngine({ manifest, run_id: "int-2", angrebsSpec: { cases: [cases[3], cases[0]], mutants: [{ mutant_id: "m-findes", guard_ref: "g.pris", apply: "comment on function f.pris_paa(int,date) is 'mut';", restore: "comment on function f.pris_paa(int,date) is null;", target_case_id: "c-pris-fs", target_assertion_id: "vaerdi-matcher-orakel", controls: ["c-navn-ut"], footprint: FP_FN("pris_paa") }] } }, runner); eq("kontrast: »findes«-mutant (kun kommentar) OVERLEVER → allOk=false (footprint uændret = ingen mutation attesteret)", r.allOk === false && r.mutants[0].killed === false && /mutation_attesteret=false/.test(r.mutants[0].detail), true); }
{ const r = await runBuildProofEngine({ manifest, run_id: "int-3", angrebsSpec: { cases: [cases[3], cases[0]], mutants: [{ ...mutants[0], footprint: { observe: { sql: "select prosrc from pg_proc where proname = 'lokation_opret' and pronamespace = 'f'::regnamespace and (select 1/0) = 1;" } } }] } }, runner); eq("kontrast: footprint-kaldet FEJLER (22012 under alle faser) → footprint null → ingen attesteret mutation → ikke dræbt (F-21)", r.mutants[0].killed === false && r.mutants[0].footprint_under === null && /footprint_gyldigt=false/.test(r.mutants[0].detail), true); }
{ const mn = eng.mutants.find((m) => m.mutant_id === "m-navn"); eq("footprint attesterer mutation og restore: baseline ≠ under, restored == baseline (F-13/F-16)", JSON.stringify(mn.footprint_baseline) !== JSON.stringify(mn.footprint_under) && JSON.stringify(mn.footprint_restored) === JSON.stringify(mn.footprint_baseline), true); }

// ---------- HELE vejen: det producerede bevis gennem verifieren mod gate-bindinger i rigtig git (R-INTEGRATIONS-PROVENANCE) ----------
console.log("\nverifyBuildProof over det faktisk producerede bevis (manifest + angrebs-spec som gate-bindinger @ rigtig commit):");
const mkEvidence = (path, start, end) => { const r = ref(path); const excerpt = excerptAt(readBlobLines(git, r.oid).lines, [start, end]); return { commit_sha: COMMIT, path, blob_oid: r.oid, line_span: [start, end], excerpt_sha: sha256(excerpt) }; };
const ALL_IDS = [...cases.map((c) => c.case_id), ...mutants.map((m) => m.mutant_id)];
const MIG = "supabase/migrations/0001_fixture.sql";
const proof = {
  ok: true, gate_id: "build", proof_kind: "build-proof", artifact_oid: artifact.oid, bindings_oids: { plan: plan.oid, manifest: manifestRef.oid, angrebsspec: specRef.oid },
  run_id: "int-1", engine: { run_id: "int-1", store: "real", summary: eng.summary }, cases: eng.cases, mutants: eng.mutants,
  bid_bindings: [{ bid_id: "bid-1", base_oid: COMMIT }, { bid_id: "bid-2", base_oid: COMMIT }],
  claim_graph: [
    { k_id: "K-1", guard_ref: "g.navn", executed: true, mutant_killed: true, case_ids: ["c-navn-ut", "c-opret-mh"], mutant_ids: ["m-navn"], source_anchor: mkEvidence(MIG, 1, 1) },
    { k_id: "K-2", guard_ref: "g.min-check", executed: true, mutant_killed: true, case_ids: ["c-min-ut", "c-race-sa"], mutant_ids: ["m-min-check"], source_anchor: mkEvidence(MIG, 3, 3) },
    { k_id: "K-8", guard_ref: "g.audit-filter", executed: true, mutant_killed: true, case_ids: ["c-tom-fs"], mutant_ids: ["m-audit-filter"], source_anchor: mkEvidence(MIG, 4, 4) },
  ],
  async_reviews: [{ bid_id: "bid-1", conclusion: "PASS", base_oid: COMMIT }, { bid_id: "bid-2", conclusion: "PASS", base_oid: COMMIT }],
  prover_result: { ok: true, total: ALL_IDS.length, passed: ALL_IDS.length, failed: 0, skipped: 0, executed_ids: [...ALL_IDS] },
};
const snapshot = { commit_sha: COMMIT, artifact, bindings: { plan, manifest: manifestRef, angrebsspec: specRef }, proof_result: proof, verdicts: [], approval: null, predecessor: { gate_id: "plan", conclusion: "success", artifact_oid: plan.oid, bindings_oids: { manifest: manifestRef.oid } } };
{ const v = verifyBuildProof(proof, snapshot, { git }); eq("verifyBuildProof → grøn over det rigtige, ikke-redigerede bevis (alle 7 cases + 8 mutanter genudledt mod spec + manifest)", v.ok, true); if (!v.ok) console.error("      ", v.reasons.join(" | ").slice(0, 2000)); }
{ const p2 = JSON.parse(JSON.stringify(proof)); const c = p2.cases.find((x) => x.case_id === "c-tom-fs"); delete c.observations.setup; const v = verifyBuildProof(p2, { ...snapshot, proof_result: p2 }, { git }); eq("… og rød når det foreskrevne setup udelades af K-8-casen (F-20)", !v.ok && v.reasons.some((r) => /spec-afledte/.test(r)), true); }
{ const p2 = JSON.parse(JSON.stringify(proof)); p2.claim_graph[0].source_anchor = mkEvidence(MIG, 2, 2); const v = verifyBuildProof(p2, { ...snapshot, proof_result: p2 }, { git }); eq("… og rød når K-1-claimets anker peger på en anden routine end den der afviser (F-25)", !v.ok && v.reasons.some((r) => /nævner ikke 'lokation_opret'/.test(r)), true); }

dockerPsql("drop schema if exists f cascade;", {});
console.log("");
if (failed > 0) { console.error(`build-harness INTEGRATION v2.3: ${failed} FEJLEDE (${passed} ok)`); process.exit(1); }
console.log(`build-harness INTEGRATION v2.3: alle ${passed} cases passed (fire bevisformer + formbestemte kills + fuld verifier-kørsel bevist mod rigtig Postgres + rigtig git)`);
