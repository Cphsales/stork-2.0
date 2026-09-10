#!/usr/bin/env node
// build-harness.mjs — v5's effect-harness/mutations-FRAMEWORK, v2 (plan 2.C · M-41 Trin C1 · Codex' adapter-krav B2).
//
// verifyBuildProof (build-proof.mjs) VALIDERER en build-proof; DETTE modul PRODUCERER beviset ved at KØRE
// cases mod en real backing store som ikke-bypass rolle og dræbe mutanter formbestemt.
//
// v2-KERNEN (B2): hvert atomart delbevis er en CASE med præcis én bevisform HENTET FRA MANIFESTET (aldrig fra
// buildets udfald), status ∈ {opfyldt, brudt, protokol-fejl}, typede observationer og en navngiven assertion:
//   UT  ulovlig tilladelse   — lovligt søsterkald (samme aktør) lykkes · det forbudte afvises med NETOP den bundne
//                              SQLSTATE fra manifestets reject_contract · tilstand (state-observation) er uændret
//   FS  forkert slutværdi    — lovlig handling → typet observation (rows/count/scalar/empty/null) == orakel; historiske
//                              checkpoints genlæses; komplet tomt svar (rows=[]) skelnes fra manglende svar (protokol-fejl)
//   MH  manglende handling   — lovlig handling KAN udføres af legitim non-admin via offentlig indgang OG hvert krævet
//                              sideeffekt-vidne observeres
//   SA  samtidighed          — to sessions m. dokumenteret barriere (runner.race) · præcis ét forløb afvises med den
//                              bundne SQLSTATE · barrieren er observeret · invarianten holder efter commit
// MUTANT-KILL er formbestemt: baseline opfyldt → under mutanten er MÅL-casens assertion BRUDT på formens måde
// (UT: forbudt tilladt · FS: værdi ≠ orakel · MH: handling/vidne udebliver · SA: invariant brudt/forkert antal
// afvisninger) MENS kontrol-cases stadig er opfyldt (ingen protokol-fejl) · restore + ren eftertilstand bevises.
// Uvedkommende fejl, protokol-fejl, mutant-apply der fejler eller manglende restore er ALDRIG et kill.
//
// TRANSPORT-AGNOSTISK: `runner` er dependency-injected:
//   runner.sql(text, opts) → {ok, error, code, rows?}   (sync eller async)  opts = {role, settings}
//     ok=false ⟺ afvist; code = SQLSTATE; rows = rækkesæt (array af plain objects) for queries — kræves af FS/MH/state
//   runner.race(scenario) → {protocolOk, a:{ok,code}, b:{ok,code}, blockedObserved, invariantRows}   (kun SA)
//   runner.exec?(cmd[]) → {exit_code, stdout}                                                        (kun kanal=exit)
// Fail-closed overalt: egne data-felter, tætte arrays, manglende rows = protokol-fejl, aldrig delvis grøn.

import { expectedSet } from "./forventnings-manifest.mjs";

export const HARD_EFFECTS = Object.freeze(["state", "event", "db-row"]);
export const PUBLIC_ENTRYPOINT_KINDS = Object.freeze(["api", "rpc", "ui-flow"]);
export const STATUS = Object.freeze({ OPFYLDT: "opfyldt", BRUDT: "brudt", PROTOKOL: "protokol-fejl" });
const EXPECT_KINDS = Object.freeze(["rows", "count", "scalar", "empty", "null"]);

const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const own = (o, k) => {
  if (o === null || typeof o !== "object") return undefined;
  const d = Object.getOwnPropertyDescriptor(o, k);
  return d && typeof d.get !== "function" && typeof d.set !== "function" ? d.value : undefined;
};
const isPlain = (v) => {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const p = Object.getPrototypeOf(v);
  return p === Object.prototype || p === null;
};
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const isDense = (a, pred = () => true) => {
  if (!Array.isArray(a) || Object.getPrototypeOf(a) !== Array.prototype) return false;
  const len = a.length;
  for (const k of Reflect.ownKeys(a)) {
    if (typeof k === "symbol") return false;
    if (k === "length") continue;
    const idx = Number(k);
    if (!Number.isInteger(idx) || idx < 0 || idx >= len || String(idx) !== k) return false;
    const d = Object.getOwnPropertyDescriptor(a, k);
    if (!d || typeof d.get === "function" || typeof d.set === "function" || !d.enumerable) return false;
  }
  for (let i = 0; i < len; i++) if (!hasOwn(a, i) || !pred(a[i])) return false;
  return true;
};
// kanonisk JSON (sorterede nøgler, kun egne data-felter) — til typede sammenligninger af rækkesæt/værdier
const canon = (v) => {
  if (v === null || typeof v !== "object") return JSON.stringify(v === undefined ? null : v);
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  const keys = Object.keys(v).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canon(own(v, k))).join(",") + "}";
};

// ---------- runner-kald (protokol-vagt) ----------
// safeSql(runner, text, opts) → {protocolOk, ok, code, error, rows|null}
async function safeSql(runner, text, opts) {
  const dead = (error) => ({ protocolOk: false, ok: false, code: null, error, rows: null });
  const fn = isPlain(runner) || typeof runner === "function" ? (typeof runner === "function" ? runner : own(runner, "sql")) : null;
  if (typeof fn !== "function") return dead("runner.sql mangler (fail-closed)");
  if (!isStr(text)) return dead("tom/ugyldig sql (fail-closed)");
  let r;
  try { r = await fn(text, opts); } catch (e) { return dead(`runner kastede: ${e?.message ?? String(e)}`); }
  const okVal = own(r, "ok");
  if (!isPlain(r) || typeof okVal !== "boolean") return dead("runner returnerede ikke {ok:boolean} som eget data-felt (fail-closed)");
  const code = own(r, "code"); const err = own(r, "error"); const rows = own(r, "rows");
  return { protocolOk: true, ok: okVal, code: typeof code === "string" ? code : null, error: typeof err === "string" ? err : null, rows: isDense(rows, isPlain) ? rows : null };
}

// ---------- typede observationer ----------
// matchExpect(rows, expect) → {ok, detail}  — rows=null (manglende svar) er ALTID protokol-fejl (ok:null)
export function matchExpect(rows, expect) {
  if (!isPlain(expect) || !EXPECT_KINDS.includes(own(expect, "kind"))) return { ok: null, detail: "expect.kind skal være rows|count|scalar|empty|null" };
  if (rows === null || !Array.isArray(rows)) return { ok: null, detail: "manglende rækkesæt (runner leverede ikke rows) — protokol-fejl, ikke et udfald" };
  const kind = own(expect, "kind"); const value = own(expect, "value");
  switch (kind) {
    case "empty": return { ok: rows.length === 0, detail: `rows=${rows.length} (forventet 0)` };
    case "count": return Number.isInteger(value) && value >= 0 ? { ok: rows.length === value, detail: `rows=${rows.length} (forventet ${value})` } : { ok: null, detail: "count kræver heltal value" };
    case "scalar": {
      if (rows.length !== 1) return { ok: false, detail: `scalar kræver præcis 1 række, fik ${rows.length}` };
      const cols = Object.keys(rows[0]); if (cols.length !== 1) return { ok: false, detail: `scalar kræver præcis 1 kolonne, fik ${cols.length}` };
      const got = own(rows[0], cols[0]); return { ok: canon(got) === canon(value), detail: `fik ${canon(got)}, forventet ${canon(value)}` };
    }
    case "null": {
      if (rows.length !== 1) return { ok: false, detail: `null kræver præcis 1 række, fik ${rows.length}` };
      const cols = Object.keys(rows[0]); if (cols.length !== 1) return { ok: false, detail: "null kræver præcis 1 kolonne" };
      return { ok: own(rows[0], cols[0]) === null, detail: `fik ${canon(own(rows[0], cols[0]))}` };
    }
    case "rows": {
      if (!isDense(value, isPlain)) return { ok: null, detail: "rows kræver value = tæt array af rækker" };
      const ordered = own(expect, "ordered") === true;
      const a = ordered ? rows.map(canon) : rows.map(canon).sort(); const b = ordered ? value.map(canon) : value.map(canon).sort();
      return { ok: a.length === b.length && a.every((x, i) => x === b[i]), detail: `fik ${rows.length} rækker (forventet ${value.length}); ${ordered ? "ordnet" : "mængde"}-sammenligning` };
    }
  }
  return { ok: null, detail: "ukendt" };
}

// ---------- case-kørsel ----------
// runCase(c, ctx, runner) → resultat. ctx = { forventning (expectedSet) } — formen og reject-klassen hentes fra manifestet.
export async function runCase(c, ctx, runner) {
  const res = (status, assertions, observations = {}) => ({
    case_id: own(c, "case_id") ?? null, obligation_id: own(c, "obligation_id") ?? null, negative_id: own(c, "negative_id") ?? null,
    proof_form: own(c, "proof_form") ?? null, bid_id: own(c, "bid_id") ?? null, hard_effect: own(c, "hard_effect") ?? null,
    entrypoint: isPlain(own(c, "entrypoint")) ? { kind: own(own(c, "entrypoint"), "kind") ?? null, ref: own(own(c, "entrypoint"), "ref") ?? null } : null,
    actor_role: isPlain(own(c, "actor")) ? own(own(c, "actor"), "role") ?? null : null,
    status, assertions, observations,
  });
  const protokol = (why) => res(STATUS.PROTOKOL, [{ id: "protokol", ok: false, detail: why }]);
  if (!isPlain(c)) return protokol("case er ikke et plain object");
  const forventning = isPlain(ctx) ? own(ctx, "forventning") : null;
  if (!forventning || !(forventning.obligations instanceof Map)) return protokol("ctx.forventning (expectedSet fra manifest) mangler");
  const cid = own(c, "case_id"); const oid = own(c, "obligation_id"); const form = own(c, "proof_form");
  if (!isStr(cid)) return protokol("case_id mangler");
  const ob = forventning.obligations.get(oid);
  if (!ob) return protokol(`obligation '${String(oid)}' findes ikke i manifestets nu-scope (rogue/overdraget)`);
  if (!ob.forms.has(form)) return protokol(`bevisform '${String(form)}' er ikke en af manifestets former for ${oid} (${[...ob.forms].join(",")}) — formen hentes fra manifestet, ikke fra casen`);
  const ep = own(c, "entrypoint");
  if (!isPlain(ep) || !PUBLIC_ENTRYPOINT_KINDS.includes(own(ep, "kind")) || !isStr(own(ep, "ref"))) return protokol("entrypoint skal være {kind: api|rpc|ui-flow, ref} (offentlig indgang)");
  const actor = own(c, "actor");
  if (!isPlain(actor) || !isStr(own(actor, "role"))) return protokol("actor.role (ikke-bypass rolle) kræves");
  if (!HARD_EFFECTS.includes(own(c, "hard_effect"))) return protokol("hard_effect skal være state|event|db-row (hård slut-effekt — ALDRIG helper-return)");
  if (!isStr(own(c, "bid_id"))) return protokol("bid_id kræves (D12: casen hører til et effekt-bid)");
  const opts = { role: own(actor, "role"), settings: isPlain(own(actor, "settings")) ? own(actor, "settings") : undefined };
  const A = []; const obs = {};
  const push = (id, ok, detail) => A.push({ id, ok, detail });

  if (form === "UT") {
    const nid = own(c, "negative_id");
    const neg = forventning.negatives.get(nid);
    if (!neg || neg.obligation_id !== oid) return protokol(`negative_id '${String(nid)}' findes ikke under ${oid} i manifestet`);
    const rc = neg.reject_contract;
    if (own(rc, "kanal") === "exit") {
      const check = own(c, "check"); const ex = isPlain(runner) ? own(runner, "exec") : null;
      if (!isPlain(check) || !isDense(own(check, "cmd"), isStr) || typeof ex !== "function") return protokol("exit-kanal kræver case.check.cmd[] og runner.exec");
      let r; try { r = await ex(own(check, "cmd")); } catch (e) { return protokol(`runner.exec kastede: ${e?.message}`); }
      const code = own(r, "exit_code"); if (!Number.isInteger(code)) return protokol("runner.exec returnerede ikke exit_code");
      obs.exit_code = code; push("exit-klasse", code === rc.exit_code, `exit ${code} (kontrakt ${rc.exit_code} = ${rc.klasse})`);
      return res(A.every((a) => a.ok) ? STATUS.OPFYLDT : STATUS.BRUDT, A, obs);
    }
    const pos = own(c, "positive"); const negS = own(c, "negative"); const st = own(c, "state");
    if (!isPlain(pos) || !isPlain(negS) || !isPlain(st)) return protokol("UT kræver positive{sql} (lovligt søsterkald), negative{sql} og state{sql} (tilstands-observation)");
    // rækkefølge: lovligt søsterkald FØRST (aktøren beviser adgang), så tilstand FØR det forbudte, det forbudte, tilstand EFTER —
    // så »afvist mutation bevarer tilstand« måles omkring NETOP det forbudte forsøg (ikke omkring det lovlige kald)
    const p = await safeSql(runner, own(pos, "sql"), opts); if (!p.protocolOk) return protokol(`positiv: ${p.error}`);
    const before = await safeSql(runner, own(st, "sql"), opts); if (!before.protocolOk || before.rows === null) return protokol(`state-observation før: ${before.error ?? "ingen rows"}`);
    const n = await safeSql(runner, own(negS, "sql"), opts); if (!n.protocolOk) return protokol(`negativ: ${n.error}`);
    const after = await safeSql(runner, own(st, "sql"), opts); if (!after.protocolOk || after.rows === null) return protokol(`state-observation efter: ${after.error ?? "ingen rows"}`);
    obs.positive = { ok: p.ok, code: p.code }; obs.negative = { ok: n.ok, code: n.code }; obs.state_unchanged = canon(before.rows) === canon(after.rows);
    push("positiv-soesterkald", p.ok === true, p.ok ? "lovligt kald lykkedes" : `lovligt kald afvist (${p.code}) — aktøren har ikke bevist adgang`);
    push("negativ-afvist-bundet", n.ok === false && n.code === rc.sqlstate, n.ok ? "FORBUDT HANDLING TILLADT" : `afvist m. ${n.code} (kontrakt ${rc.sqlstate} @ ${rc.afvisningssted})`);
    push("tilstand-uaendret", obs.state_unchanged, obs.state_unchanged ? "state før == efter" : "tilstand ændret af det afviste forsøg");
    obs.neg_allowed = n.ok === true;
    return res(A.every((a) => a.ok) ? STATUS.OPFYLDT : STATUS.BRUDT, A, obs);
  }
  if (form === "FS") {
    const act = own(c, "action"); const ob1 = own(c, "observe"); const exp = own(c, "expect");
    if (!isPlain(ob1) || !isPlain(exp)) return protokol("FS kræver observe{sql} og expect{kind,value}");
    if (isPlain(act)) { const a = await safeSql(runner, own(act, "sql"), opts); if (!a.protocolOk) return protokol(`action: ${a.error}`); obs.action = { ok: a.ok, code: a.code }; push("handling-lykkedes", a.ok === true, a.ok ? "ok" : `afvist ${a.code}`); }
    const o = await safeSql(runner, own(ob1, "sql"), opts); if (!o.protocolOk) return protokol(`observe: ${o.error}`);
    const m = matchExpect(o.rows, exp); if (m.ok === null) return protokol(`observation: ${m.detail}`);
    obs.observed_rows = o.rows; push("vaerdi-matcher-orakel", m.ok, m.detail);
    const cps = own(c, "checkpoints");
    if (hasOwn(c, "checkpoints")) {
      if (!isDense(cps, isPlain)) return protokol("checkpoints skal være et tæt array");
      for (let i = 0; i < cps.length; i++) {
        const cp = cps[i]; const r = await safeSql(runner, own(own(cp, "observe"), "sql"), opts); if (!r.protocolOk) return protokol(`checkpoint ${i}: ${r.error}`);
        const mm = matchExpect(r.rows, own(cp, "expect")); if (mm.ok === null) return protokol(`checkpoint ${i}: ${mm.detail}`);
        push(`checkpoint-${i}`, mm.ok, mm.detail);
      }
    }
    return res(A.every((a) => a.ok) ? STATUS.OPFYLDT : STATUS.BRUDT, A, obs);
  }
  if (form === "MH") {
    const act = own(c, "action"); const wit = own(c, "witnesses");
    if (!isPlain(act) || !isDense(wit, isPlain) || wit.length === 0) return protokol("MH kræver action{sql} og ≥1 witnesses[{observe{sql}, expect}]");
    const a = await safeSql(runner, own(act, "sql"), opts); if (!a.protocolOk) return protokol(`action: ${a.error}`);
    obs.action = { ok: a.ok, code: a.code }; push("handling-mulig-for-legitim-aktoer", a.ok === true, a.ok ? "lovlig handling gennemført" : `HANDLING UDEBLEV (afvist ${a.code})`);
    for (let i = 0; i < wit.length; i++) {
      const w = wit[i]; const r = await safeSql(runner, own(own(w, "observe"), "sql"), opts); if (!r.protocolOk) return protokol(`vidne ${i}: ${r.error}`);
      const m = matchExpect(r.rows, own(w, "expect")); if (m.ok === null) return protokol(`vidne ${i}: ${m.detail}`);
      push(`sideeffekt-vidne-${i}`, m.ok, m.detail);
    }
    return res(A.every((a) => a.ok) ? STATUS.OPFYLDT : STATUS.BRUDT, A, obs);
  }
  if (form === "SA") {
    const race = own(c, "race"); const rf = isPlain(runner) ? own(runner, "race") : null;
    if (!isPlain(race) || typeof rf !== "function") return protokol("SA kræver case.race{race_id,a,b,barrier,invariant,reject_negative_id} og runner.race");
    const nid = own(race, "reject_negative_id"); const neg = forventning.negatives.get(nid);
    if (!neg || neg.obligation_id !== oid || own(neg.reject_contract, "kanal") !== "sqlstate") return protokol(`race.reject_negative_id '${String(nid)}' er ikke et sqlstate-negativ under ${oid}`);
    if (!isStr(own(race, "race_id")) || !isPlain(own(race, "a")) || !isPlain(own(race, "b")) || !isStr(own(race, "barrier")) || !isPlain(own(race, "invariant"))) return protokol("race mangler race_id/a/b/barrier/invariant");
    let r; try { r = await rf({ ...race, actor: opts }); } catch (e) { return protokol(`runner.race kastede: ${e?.message}`); }
    if (!isPlain(r) || own(r, "protocolOk") !== true) return protokol(`race-runner protokol-fejl: ${String(own(r, "error") ?? "ukendt")}`);
    const ra = own(r, "a"); const rb = own(r, "b");
    if (!isPlain(ra) || !isPlain(rb) || typeof own(ra, "ok") !== "boolean" || typeof own(rb, "ok") !== "boolean") return protokol("race-runner leverede ikke a/b {ok,code}");
    const rejected = [ra, rb].filter((x) => own(x, "ok") === false);
    const rightCode = rejected.every((x) => own(x, "code") === neg.reject_contract.sqlstate);
    obs.a = { ok: own(ra, "ok"), code: own(ra, "code") }; obs.b = { ok: own(rb, "ok"), code: own(rb, "code") }; obs.blockedObserved = own(r, "blockedObserved") === true;
    push("barriere-observeret", obs.blockedObserved, obs.blockedObserved ? "det konkurrerende forløb blev observeret blokeret" : "ingen barriere observeret — sekventiel kørsel er ikke SA");
    push("praecis-en-afvisning-bundet", rejected.length === 1 && rightCode, `afvisninger=${rejected.length} (${rejected.map((x) => own(x, "code")).join(",")}) kontrakt ${neg.reject_contract.sqlstate}`);
    const inv = own(race, "invariant"); const m = matchExpect(own(r, "invariantRows") ?? null, own(inv, "expect")); if (m.ok === null) return protokol(`invariant: ${m.detail}`);
    push("invariant-efter-commit", m.ok, m.detail); obs.invariant_broken = m.ok === false;
    return res(A.every((a) => a.ok) ? STATUS.OPFYLDT : STATUS.BRUDT, A, obs);
  }
  return protokol(`ukendt bevisform ${String(form)}`);
}

// ---------- formbestemt mutant-kill ----------
// brudtPaaFormensMaade(resultat) — er MÅL-casen brudt netop dér hvor formen siger et hul viser sig?
function brudtPaaFormensMaade(r) {
  if (r.status !== STATUS.BRUDT) return false;
  const a = (id) => r.assertions.find((x) => x.id === id)?.ok;
  switch (r.proof_form) {
    case "UT": return r.observations.neg_allowed === true || a("tilstand-uaendret") === false;     // forbudt tilladt ELLER afvist men tilstand ændret
    case "FS": return a("vaerdi-matcher-orakel") === false || r.assertions.some((x) => x.id.startsWith("checkpoint-") && x.ok === false);
    case "MH": return a("handling-mulig-for-legitim-aktoer") === false || r.assertions.some((x) => x.id.startsWith("sideeffekt-vidne-") && x.ok === false);
    case "SA": return r.observations.invariant_broken === true || a("praecis-en-afvisning-bundet") === false;
    default: return false;
  }
}
// killCaseMutant(mutant, cases, ctx, runner) → {mutant_id, guard_ref, target_case_id, killed, break_form, restored, cleanAfter, baselineOk, controlsOk, detail}
// mutant = { mutant_id, guard_ref, apply, restore, target_case_id, controls: [case_id…] }  (apply/restore køres som ejer/DDL-rolle)
export async function killCaseMutant(mutant, cases, ctx, runner) {
  const mid = own(mutant, "mutant_id") ?? null; const out = (o) => ({ mutant_id: mid, guard_ref: own(mutant, "guard_ref") ?? null, target_case_id: own(mutant, "target_case_id") ?? null, killed: false, break_form: null, restored: false, cleanAfter: false, baselineOk: false, controlsOk: false, ...o });
  if (!isPlain(mutant) || !isStr(mid) || !isStr(own(mutant, "guard_ref")) || !isStr(own(mutant, "apply")) || !isStr(own(mutant, "restore")) || !isStr(own(mutant, "target_case_id")))
    return out({ detail: "malformet mutant (mutant_id/guard_ref/apply/restore/target_case_id kræves)" });
  if (!isDense(cases, isPlain)) return out({ detail: "cases skal være et tæt array" });
  const byId = new Map(cases.map((c) => [own(c, "case_id"), c]));
  const target = byId.get(own(mutant, "target_case_id"));
  if (!target) return out({ detail: `target_case_id '${own(mutant, "target_case_id")}' findes ikke` });
  const ctrlIds = hasOwn(mutant, "controls") ? own(mutant, "controls") : [];
  if (!isDense(ctrlIds, isStr) || ctrlIds.some((id) => !byId.has(id) || id === own(mutant, "target_case_id"))) return out({ detail: "controls skal være eksisterende case_ids ≠ target" });
  const controls = ctrlIds.map((id) => byId.get(id));
  const base = await runCase(target, ctx, runner);
  if (base.status !== STATUS.OPFYLDT) return out({ detail: `baseline ikke opfyldt (${base.status}) — intet at dræbe mod` });
  const applied = await safeSql(runner, own(mutant, "apply"), {});
  if (!applied.protocolOk || !applied.ok) {
    const rr = await safeSql(runner, own(mutant, "restore"), {}); const clean = await runCase(target, ctx, runner);
    return out({ baselineOk: true, restored: rr.ok === true, cleanAfter: clean.status === STATUS.OPFYLDT, detail: `mutant-apply fejlede: ${applied.error ?? applied.code}` });
  }
  const under = await runCase(target, ctx, runner);
  const ctrlRes = []; for (const cc of controls) ctrlRes.push(await runCase(cc, ctx, runner));
  const rr = await safeSql(runner, own(mutant, "restore"), {});
  const clean = await runCase(target, ctx, runner);
  const controlsOk = ctrlRes.every((r) => r.status === STATUS.OPFYLDT);
  const killed = brudtPaaFormensMaade(under) && controlsOk;   // protokol-fejl på målet er aldrig et kill
  return out({ killed, break_form: killed ? under.proof_form : null, restored: rr.ok === true, cleanAfter: clean.status === STATUS.OPFYLDT, baselineOk: true, controlsOk,
    detail: killed ? `dræbt: ${under.assertions.filter((a) => !a.ok).map((a) => a.id).join(",")}` : `overlevede/ugyldig: mål=${under.status} (${under.assertions.filter((a) => !a.ok).map((a) => a.id).join(",") || "ingen brudt assertion"}) kontroller=${controlsOk}`,
    under: { status: under.status, assertions: under.assertions } });
}

// ---------- engine ----------
// runBuildProofEngine({manifest, run_id, cases, mutants}, runner) → {run_id, cases:[…], mutants:[…], summary, allOk}
// Formen pr. case hentes fra manifestet (expectedSet); rogue/overdraget forpligtelse → protokol-fejl.
export async function runBuildProofEngine(spec, runner) {
  const dead = (error) => ({ run_id: null, cases: [], mutants: [], summary: null, allOk: false, error });
  if (!isPlain(spec)) return dead("malformet spec");
  const manifest = own(spec, "manifest"); const cases = own(spec, "cases"); const mutants = hasOwn(spec, "mutants") ? own(spec, "mutants") : [];
  const runId = own(spec, "run_id");
  if (!isStr(runId)) return dead("run_id kræves (binder alle delbeviser til én kørsel)");
  let forventning; try { forventning = expectedSet(manifest); } catch (e) { return dead(`manifest: ${e.message}`); }
  if (!isDense(cases, isPlain) || cases.length === 0) return dead("cases skal være et ikke-tomt, tæt array");
  if (!isDense(mutants, isPlain)) return dead("mutants skal være et tæt array");
  const ids = new Set(); for (const c of cases) { const id = own(c, "case_id"); if (!isStr(id) || ids.has(id)) return dead(`case_id mangler/dublet: ${String(id)}`); ids.add(id); }
  const ctx = { forventning };
  const caseRes = []; for (const c of cases) caseRes.push({ ...(await runCase(c, ctx, runner)), run_id: runId });
  const mutRes = []; for (const m of mutants) mutRes.push({ ...(await killCaseMutant(m, cases, ctx, runner)), run_id: runId });
  const summary = {
    opfyldt: caseRes.filter((r) => r.status === STATUS.OPFYLDT).length, brudt: caseRes.filter((r) => r.status === STATUS.BRUDT).length,
    protokol_fejl: caseRes.filter((r) => r.status === STATUS.PROTOKOL).length,
    mutanter: mutRes.length, draebt: mutRes.filter((m) => m.killed && m.restored && m.cleanAfter).length,
  };
  const allOk = summary.brudt === 0 && summary.protokol_fejl === 0 && summary.draebt === summary.mutanter;
  return { run_id: runId, cases: caseRes, mutants: mutRes, summary, allOk };
}
