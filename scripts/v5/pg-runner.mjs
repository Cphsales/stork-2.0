#!/usr/bin/env node
// pg-runner.mjs — v5's RIGTIGE Postgres-runner for sandheds-motoren (build-harness.mjs's runner-kontrakt), v2 (C4b · plan 2.C/2.E ·
// udtrukket af build-harness.integration.mjs v2.8 efter Codex C1-runde 1-8: F-17 · F-27 · F-32 · F-33 · F-36 · F-38 · F-39 · F-40 ·
// Codex C4b-runde: F-C4b-1 (miljø-isolation) · F-C4b-2 (aktørens settings i race)).
//
// makePgRunner({ argv, env? }) → { sql(text, opts), race(scenario), exec(cmd), session(name), q1(sql) }
//   argv = kommandopræfiks der starter psql m. stdin (fx ["docker","exec","-i",CONTAINER,"psql","-U","postgres"] lokalt, eller
//   ["psql"] i CI m. PGHOST/PGUSER/PGPASSWORD/PGDATABASE i miljøet). Alle kald er ÉN psql-proces (sql/q1) eller én interaktiv
//   session (race: to sessions + et tredje vidne).
//   env = det MILJØ alle underprocesser (psql · exit-kontroller) får — default `producentMiljoe(process.env)`: process.env UDEN
//   credentials (GITHUB_TOKEN · GH_TOKEN · ACTIONS_* · INPUT_* · RUNNER_TOKEN · NODE_AUTH_TOKEN). Produktkode (migrationer, exit-kommandoer,
//   psql-værtskommandoer) må ALDRIG kunne nå dommerens emissions-token (F-C4b-1) — emissionen sker i et andet job uden produktkode.
//   race(scenario) anvender aktørens {role, settings} i BEGGE sessions før handlingerne (F-C4b-2): en forkert tenant-kontekst ville ellers
//   bevise den forkerte tenant; fejlet opsætning lukker forløbet (protocolOk:false).
//
// KONTRAKT (koden er sandheden — se build-harness.mjs header):
//   sql(text, {role, settings}) → {ok, error, code, detail:{message, routine}, rows?}   — observe-queries (select/with/table) pakkes i json_agg
//   race(scenario) → {protocolOk, a:{pid,ok,code,detail,commit}, b:{…}, overlap:{observed, witness_pid, a_pid, b_pid}, blocking, invariantRows}
//   exec(cmd[]) → {exit_code, stdout}   — exit-kanalens kontrol; manglende binær → 127 (processen fungerer ikke), stdout altid streng
//
// DIAGNOSTIK (F-32/F-36/F-38/F-39/F-40): status + SQLSTATE + HELE primærmeddelelsen tages STRUKTURELT fra psql's egne variable
// (:ERROR :SQLSTATE :LAST_ERROR_SQLSTATE :LAST_ERROR_MESSAGE) udskrevet mellem nonce-markører på stdout EFTER sætningen; stderr bruges
// kun til at tælle ERROR-linjer, krydstjekke SQLSTATE og læse afvisningsstedet (CONTEXT) — og kun når blokken er entydig. Data (stdout)
// og diagnostik (stderr) holdes adskilt; produktdata der ligner »ERROR:« er data. Flertydig diagnostik er protokol (aldrig et valg);
// status=succes m. ERROR-linje er protokol (gamle fejlvariable klassificerer aldrig). Tomt/ikke-array query-output = fejlet måling.
// OVERLAP (F-22): et UAFHÆNGIGT tredje backend ser A og B inde i deres skrivende transaktion samtidigt før nogen commit —
// pg_stat_activity: xact_start sat ∧ (backend_xid ∨ wait_event_type=Lock) — uafhængigt af produktlåsen. pg_blocking_pids er kun
// en produkt-observation (blocking), ikke dom.

import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";

const FELT = /^(ERROR|NOTICE|WARNING|INFO|LOG|DEBUG\d?|DETAIL|HINT|CONTEXT|LOCATION|QUERY|STATEMENT|SCHEMA NAME|TABLE NAME|COLUMN NAME|DATA TYPE|CONSTRAINT NAME):\s/;
void FELT;

// parseErr(stderr) → { errLines, ctxLines, code, routine, flertydig, error }
export function parseErr(stderr) {
  const lines = String(stderr).split(/\r?\n/);
  const errIdx = lines.map((l, i) => (/^ERROR:\s+[0-9A-Z]{5}:/.test(l) ? i : -1)).filter((i) => i >= 0);
  const ctxIdx = lines.map((l, i) => (/^CONTEXT:\s/.test(l) ? i : -1)).filter((i) => i >= 0);
  const base = { error: String(stderr).slice(0, 200), errLines: errIdx.length, ctxLines: ctxIdx.length, code: null, routine: null, flertydig: false };
  if (errIdx.length === 0) return ctxIdx.length ? { ...base, flertydig: `0 ERROR-linjer · ${ctxIdx.length} CONTEXT-linjer` } : base;
  if (errIdx.length > 1 || ctxIdx.length > 1 || ctxIdx.some((i) => i < errIdx[0])) return { ...base, flertydig: `${errIdx.length} ERROR-linjer · ${ctxIdx.length} CONTEXT-linjer${ctxIdx.some((i) => i < errIdx[0]) ? " (CONTEXT før ERROR)" : ""}` };
  const m = lines[errIdx[0]].match(/^ERROR:\s+([0-9A-Z]{5}):/); const c = ctxIdx.length ? lines[ctxIdx[0]].match(/^CONTEXT:\s+PL\/pgSQL function ([^(\s]+)\(/) : null;
  return { ...base, code: m[1], routine: c ? c[1] : null };
}

// frame(stdout, stderr, S, M, E) → {ok, code, message, routine, data} | {protokol}
export function frame(stdout, stderr, S, M, E) {
  const lines = String(stdout).split("\n");
  const idxS = lines.findIndex((l) => l.startsWith(`${S} `)), idxM = lines.indexOf(M), idxE = lines.indexOf(E);
  const cnt = (pred) => lines.filter(pred).length;
  if (idxS < 0 || idxM < 0 || idxE < 0) return { protokol: "status-rammen (S/M/E-markører) mangler i stdout — sætningen/psql afsluttede ikke normalt" };
  if (cnt((l) => l.startsWith(`${S} `)) !== 1 || cnt((l) => l === M) !== 1 || cnt((l) => l === E) !== 1 || !(idxS < idxM && idxM < idxE)) return { protokol: "status-rammen er ikke entydig/ordnet (F-27)" };
  const st = lines[idxS].match(new RegExp(`^${S} (true|false) ([0-9A-Z]{5}) ([0-9A-Z]{5})$`)); if (!st) return { protokol: `status-linjen er malformet: ${lines[idxS].slice(0, 80)}` };
  const statusErr = st[1] === "true"; const sqlstate = st[2]; const lastErr = st[3];
  const message = lines.slice(idxM + 1, idxE).join("\n");
  const data = lines.slice(0, idxS).join("\n");
  const pe = parseErr(String(stderr));
  if (pe.errLines === 0 && !statusErr) return { ok: true, code: null, message: null, routine: null, data };
  if (pe.flertydig) return { protokol: `flertydig diagnostik (${pe.flertydig}) — ikke klassificerbar (F-38)` };
  if (pe.errLines === 0 && statusErr) return { protokol: `psql-status siger fejl (${sqlstate}) men stderr har ingen ERROR-linje — inkonsistent (F-32)` };
  if (!statusErr) return { protokol: `stderr har ${pe.errLines} ERROR-linje(r) men psql-status siger succes for den aktuelle sætning — enten fejlede en tidligere sætning i scriptet eller diagnostikken er forfalsket; gamle fejlvariable (${lastErr}) bruges aldrig som denne sætnings afvisning (F-40)` };
  if (sqlstate !== lastErr) return { protokol: `psql-status ${sqlstate} ≠ LAST_ERROR_SQLSTATE ${lastErr} — inkonsistent (F-32)` };
  if (pe.code !== sqlstate) return { protokol: `psql-variabel ${sqlstate} ≠ stderr-diagnostikkens SQLSTATE ${String(pe.code)} — inkonsistent fejlramme (F-32)` };
  return { ok: false, code: sqlstate, message, routine: pe.routine, data };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// producentMiljoe(env) → kopi uden credentials/CI-tokens (F-C4b-1). Fail-closed: mønstrene er brede — hellere for lidt miljø end et token.
export const CREDENTIAL_ENV_RE = /^(GITHUB_TOKEN|GH_TOKEN|GITHUB_PAT|ACTIONS_[A-Z0-9_]*|INPUT_[A-Z0-9_]*|RUNNER_TOKEN|NODE_AUTH_TOKEN|NPM_TOKEN|AWS_[A-Z0-9_]*|AZURE_[A-Z0-9_]*|GOOGLE_APPLICATION_CREDENTIALS|SUPABASE_ACCESS_TOKEN|SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY)$/;
export function producentMiljoe(env = process.env) {
  const out = {}; for (const [k, v] of Object.entries(env)) if (!CREDENTIAL_ENV_RE.test(k) && typeof v === "string") out[k] = v; return out;
}
const settingsGyldige = (settings) => settings === undefined || settings === null || (settings !== null && typeof settings === "object" && !Array.isArray(settings) && Object.keys(settings).every((k) => /^[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)*$/i.test(k)));
const setSql = (settings) => Object.entries(settings ?? {}).map(([k, v]) => `set ${k} = '${String(v).replace(/'/g, "''")}';`).join("\n");

export function makePgRunner({ argv, env = producentMiljoe(process.env) } = {}) {
  if (!Array.isArray(argv) || argv.length === 0 || !argv.every((a) => typeof a === "string")) throw new Error("makePgRunner: argv (psql-kommandopræfiks) kræves");
  if (env === null || typeof env !== "object") throw new Error("makePgRunner: env skal være et objekt");
  for (const k of Object.keys(env)) if (CREDENTIAL_ENV_RE.test(k)) throw new Error(`makePgRunner: env indeholder credential '${k}' — produktkode må ikke få den (F-C4b-1)`);
  const PSQL = [...argv, "-v", "ON_ERROR_STOP=0", "-q", "-tA"];

  function sql(sqlText, opts = {}) {
    const isQuery = /^\s*(select|with|table)\b/i.test(sqlText);
    const nonce = randomBytes(8).toString("hex"); const S = `V5S-${nonce}`, M = `V5M-${nonce}`, E = `V5E-${nonce}`;
    const prelude = ["\\set VERBOSITY verbose"];
    if (opts.role) prelude.push(`set role ${opts.role};`);
    if (!settingsGyldige(opts.settings)) return { ok: false, error: "aktør-settings har ugyldige nøgler (kun identifier.identifier)", code: null, detail: { message: null, routine: null }, rows: isQuery ? null : undefined };
    if (opts.settings) prelude.push(setSql(opts.settings));
    const body = isQuery ? `select coalesce(json_agg(t), '[]'::json) from (${sqlText.replace(/;\s*$/, "")}) t;` : sqlText;
    const input = `${prelude.join("\n")}\n${body}\n\\echo ${S} :ERROR :SQLSTATE :LAST_ERROR_SQLSTATE\n\\echo ${M}\n\\echo :LAST_ERROR_MESSAGE\n\\echo ${E}\n`;
    const r = spawnSync(PSQL[0], PSQL.slice(1), { input, encoding: "utf8", env });
    const dead = (error) => ({ ok: false, error, code: null, detail: { message: null, routine: null }, rows: isQuery ? null : undefined });
    if (r.error || r.status !== 0) return dead(`psql-transport fejlede (rc ${r.status ?? r.error?.message}): ${String(r.stderr ?? "").slice(0, 200)}`);
    const fr = frame(String(r.stdout ?? ""), String(r.stderr ?? ""), S, M, E);
    if (fr.protokol) return dead(fr.protokol);
    if (!fr.ok) return { ok: false, error: `${fr.code}: ${fr.message}`.slice(0, 200), code: fr.code, detail: { message: fr.message, routine: fr.routine }, rows: isQuery ? null : undefined };
    if (isQuery) {
      const t = fr.data.trim(); if (!t) return dead("query-transport gav intet output (manglende måling)");
      let rows; try { rows = JSON.parse(t); } catch { return dead("query-output er ikke JSON (manglende måling)"); }
      if (!Array.isArray(rows)) return dead(`query-output er ikke et rækkesæt (${typeof rows})`);
      return { ok: true, error: null, code: null, rows };
    }
    return { ok: true, error: null, code: null };
  }

  const q1 = (sqlText) => { const r = spawnSync(argv[0], [...argv.slice(1), "-tAc", sqlText], { encoding: "utf8", env }); if (r.error || r.status !== 0) throw new Error(`q1 fejlede: ${String(r.stderr ?? r.error?.message).slice(0, 200)}`); return String(r.stdout).trim(); };

  // session(name, spawnFn?) — én interaktiv psql; stdout (data) og stderr (diagnostik) adskilt; pr. sætning nonce-markør på begge strømme
  function session(name, spawnFn = () => spawn(PSQL[0], PSQL.slice(1), { stdio: ["pipe", "pipe", "pipe"], env })) {
    const p = spawnFn();
    let out = "", err = "", n = 0; const nonce = randomBytes(12).toString("hex");
    p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (err += d));
    try { p.stdin.write("\\set VERBOSITY verbose\n"); } catch {}
    const run = (sqlText, timeoutMs = 15000) => new Promise((resolve, reject) => {
      const mark = `MARK-${nonce}-${name}-${++n}`; const outStart = out.length, errStart = err.length;
      p.stdin.write(`${sqlText}\n\\warn ${mark}\n\\echo ${mark} :ERROR :SQLSTATE :LAST_ERROR_SQLSTATE\n\\echo ${mark}-MSG\n\\echo :LAST_ERROR_MESSAGE\n\\echo ${mark}-END\n`);
      const t0 = Date.now();
      const poll = () => {
        const so = out.slice(outStart), se = err.slice(errStart);
        const me = new RegExp(`^${mark}$`, "m").exec(se); const endHit = new RegExp(`^${mark}-END$`, "m").exec(so);
        if (me && endHit) {
          const hitsE = (se.match(new RegExp(`^${mark}$`, "mg")) ?? []).length;
          if (hitsE !== 1) return reject(new Error(`${name}: stderr-markøren forekom ${hitsE} gange — rammen er ikke entydig (F-27)`));
          const diag = se.slice(0, me.index);
          const fr = frame(so, diag, mark, `${mark}-MSG`, `${mark}-END`);
          if (fr.protokol) return reject(new Error(`${name}: ${fr.protokol}`));
          return resolve({ ok: fr.ok, code: fr.ok ? null : fr.code, detail: fr.ok ? null : { message: fr.message, routine: fr.routine }, out: fr.data.trim(), err: diag });
        }
        if (Date.now() - t0 > timeoutMs) return reject(new Error(`${name}: timeout på '${sqlText.slice(0, 40)}'`));
        setTimeout(poll, 15);
      };
      poll();
    });
    const startAsync = (sqlText, timeoutMs = 20000) => run(sqlText, timeoutMs);
    const close = () => { try { p.stdin.end(); } catch {} p.kill(); };
    return { run, startAsync, close };
  }

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
  const blockedBy = (bpid, apid) => q1(`select ${apid} = any(pg_blocking_pids(${bpid}));`) === "t";

  async function race(s) {
    const A = session("A"), B = session("B");
    try {
      if (s.setup) return { protocolOk: false, error: "race.setup skal udføres af motoren som ejer (F-20) — runneren modtager ikke setup" };
      if (!settingsGyldige(s.actor?.settings)) return { protocolOk: false, error: "aktør-settings har ugyldige nøgler (kun identifier.identifier)" };
      // F-C4b-2: aktørens KONTEKST (rolle + settings) anvendes i BEGGE sessions før handlingerne — ellers måles den forkerte tenant
      const pre = (nm) => `\\set VERBOSITY verbose\nset application_name = '${nm}';\n${s.actor?.role ? `set role ${s.actor.role};\n` : ""}${setSql(s.actor?.settings)}`;
      const pa0 = await A.run(pre("v5race_A")); const pb0 = await B.run(pre("v5race_B"));
      if (!pa0.ok || !pb0.ok) return { protocolOk: false, error: `rolle-/sessions-/settings-opsætning fejlede (A ok=${pa0.ok} ${pa0.code ?? ""}, B ok=${pb0.ok} ${pb0.code ?? ""})` };
      if (s.actor?.settings) for (const [k, v] of Object.entries(s.actor.settings)) {   // verificér at konteksten FAKTISK står i begge sessions
        const qa = await A.run(`select current_setting('${k}', true);`); const qb = await B.run(`select current_setting('${k}', true);`);
        if (!qa.ok || !qb.ok || qa.out !== String(v) || qb.out !== String(v)) return { protocolOk: false, error: `aktør-setting ${k} står ikke som foreskrevet i begge sessions (A='${qa.out}', B='${qb.out}', foreskrevet '${String(v)}')` };
      }
      const ra0 = await A.run("select current_user;"); const rb0 = await B.run("select current_user;");
      if (s.actor?.role && (ra0.out !== s.actor.role || rb0.out !== s.actor.role)) return { protocolOk: false, error: `faktisk rolle ≠ ønsket (${ra0.out}/${rb0.out} vs ${s.actor.role})` };
      const pa = Number((await A.run("select pg_backend_pid();")).out); const pb = Number((await B.run("select pg_backend_pid();")).out);
      if (!Number.isInteger(pa) || !Number.isInteger(pb)) return { protocolOk: false, error: "kunne ikke læse backend-pids" };
      const ra1 = await A.run("begin;"); const rb1 = await B.run("begin;");
      if (!ra1.ok || !rb1.ok) return { protocolOk: false, error: "begin fejlede" };
      const ra = await A.run(s.a.sql);
      const bPromise = B.startAsync(s.b.sql);
      const overlap = await witnessOverlap(pa, pb);
      const blocking = { observed: blockedBy(pb, pa), blocked_pid: pb, blocking_pid: pa };
      const ca = await A.run("commit;");
      const rb = await bPromise;
      const cb = await B.run(rb.ok ? "commit;" : "rollback;");
      const inv = sql(s.invariant.observe.sql, {});
      if (!inv.ok || !Array.isArray(inv.rows)) return { protocolOk: false, error: `invariant-måling fejlede (${inv.code ?? inv.error}) — en fejlet måling er hverken brud eller tomt svar (F-33)` };
      return { protocolOk: true,
        a: { pid: pa, ok: ra.ok, code: ra.code, detail: ra.detail, commit: ca.ok ? "commit" : "fejl" },
        b: { pid: pb, ok: rb.ok, code: rb.code, detail: rb.detail, commit: cb.ok ? (rb.ok ? "commit" : "rollback") : "fejl" },
        overlap, blocking, invariantRows: inv.rows };
    } catch (e) { return { protocolOk: false, error: e.message }; } finally { A.close(); B.close(); }
  }

  // exit-kanalens kontrol: kør cmd[] og aflever rc + stdout (altid streng). Manglende binær/spawn-fejl → 127 (processen fungerer ikke).
  function exec(cmd) {
    if (!Array.isArray(cmd) || cmd.length === 0 || !cmd.every((c) => typeof c === "string")) return { exit_code: 127, stdout: "" };
    const r = spawnSync(cmd[0], cmd.slice(1), { encoding: "utf8", timeout: 120000, env });
    if (r.error) return { exit_code: 127, stdout: "" };
    return { exit_code: typeof r.status === "number" ? r.status : 128, stdout: typeof r.stdout === "string" ? r.stdout : "" };
  }

  return { sql, race, exec, session, q1 };
}
