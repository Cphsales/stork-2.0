#!/usr/bin/env node
// build-harness.mjs — v5's effect-harness/mutations-FRAMEWORK, v2.1 (plan 2.C · M-41 Trin C1 · Codex' adapter-krav B2 · C1-r1 F-3..F-8).
//
// verifyBuildProof (build-proof.mjs) VALIDERER en build-proof; DETTE modul PRODUCERER beviset ved at KØRE cases mod en real
// backing store som ikke-bypass rolle og dræbe mutanter formbestemt. Kernen i v2.1: hvert delbevis afleverer RÅ OBSERVATIONER,
// og dommen (status · assertions · kill) er en REN funktion af observationerne (judgeObservations · judgeKill) — verifieren
// genudleder den; et selvrapporteret flag tæller intet (C1-r1 F-3).
//
// CASE = ét atomart delbevis m. præcis én bevisform HENTET FRA MANIFESTET, status ∈ {opfyldt, brudt, protokol-fejl}:
//   UT  lovligt søsterkald (samme aktør) lykkes · tilstand FØR · det forbudte afvises med NETOP kontraktens SQLSTATE + GRUND
//       (præcist fejl-token) + AFVISNINGSSTED (routine) · aktøren er kontraktens · tilstand EFTER uændret   (kanal exit: exit-kode + klasse-linje)
//   FS  lovlig handling → typet observation == orakel · NAVNGIVNE checkpoints (historisk genlæsning) · komplet rows=[] ≠ manglende svar
//   MH  legitim non-admin kan handle via offentlig indgang OG hvert NAVNGIVET sideeffekt-vidne observeres
//   SA  to bundne sessions (pid'er) · barriere observeret (blokeret pid / blokerende pid) · præcis én bundet afvisning · afslutning
//       committet/rullet tilbage · invariant efter commit
// PROTOKOL-FEJL (aldrig et udfald): runner-fejl, manglende rows, afvist observations-/state-kald, afvisning med kode UDEN FOR de
// anerkendte klasser (fx 42601 syntax = uvedkommende), manglende orakel-værdi, ikke-endelige tal.
// MUTANT-KILL er formbestemt OG målrettet: baseline (mål + kontroller) opfyldt → apply (ejer) → målets NAVNGIVNE target_assertion
// brudt på formens måde MENS ≥1 nødvendig kontrol-case stadig er opfyldt → restore → mål OG kontroller opfyldt igen (cleanAfter).
//
// runner (dependency-injected; sync eller async):
//   runner.sql(text, opts) → {ok, error, code, detail?:{message, routine}, rows?}   opts = {role, settings} · ejer-kald: opts = {}
//   runner.race(scenario) → {protocolOk, a:{pid,ok,code,detail,commit}, b:{…}, barrier:{observed, blocked_pid, blocking_pid}, invariantRows}
//   runner.exec?(cmd[]) → {exit_code, stdout}

import { expectedSet, REJECT_SQLSTATES } from "./forventnings-manifest.mjs";

export const HARD_EFFECTS = Object.freeze(["state", "event", "db-row"]);
export const PUBLIC_ENTRYPOINT_KINDS = Object.freeze(["api", "rpc", "ui-flow"]);
export const STATUS = Object.freeze({ OPFYLDT: "opfyldt", BRUDT: "brudt", PROTOKOL: "protokol-fejl" });
const EXPECT_KINDS = Object.freeze(["rows", "count", "scalar", "empty", "null"]);

const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const own = (o, k) => { if (o === null || typeof o !== "object") return undefined; const d = Object.getOwnPropertyDescriptor(o, k); return d && typeof d.get !== "function" && typeof d.set !== "function" ? d.value : undefined; };
const isPlain = (v) => { if (v === null || typeof v !== "object" || Array.isArray(v)) return false; const p = Object.getPrototypeOf(v); return p === Object.prototype || p === null; };
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const isDense = (a, pred = () => true) => {
  if (!Array.isArray(a) || Object.getPrototypeOf(a) !== Array.prototype) return false;
  const len = a.length;
  for (const k of Reflect.ownKeys(a)) { if (typeof k === "symbol") return false; if (k === "length") continue; const idx = Number(k); if (!Number.isInteger(idx) || idx < 0 || idx >= len || String(idx) !== k) return false; const d = Object.getOwnPropertyDescriptor(a, k); if (!d || typeof d.get === "function" || typeof d.set === "function" || !d.enumerable) return false; }
  for (let i = 0; i < len; i++) if (!hasOwn(a, i) || !pred(a[i])) return false;
  return true;
};
// kanonisk JSON (sorterede nøgler, egne data-felter). Ikke-endelige tal og undefined er IKKE værdier → kaster (protokol-fejl opstrøms)
export function canon(v) {
  if (v === undefined) throw new Error("undefined er ikke en observérbar værdi");
  if (typeof v === "number" && !Number.isFinite(v)) throw new Error("ikke-endeligt tal er ikke en observérbar værdi");
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canon(own(v, k))).join(",") + "}";
}
const safeCanon = (v) => { try { return canon(v); } catch { return null; } };
const klasse = (r) => (r.ok ? "ok" : REJECT_SQLSTATES.includes(r.code) ? "afvist" : "uvedkommende");

// ---------- runner-kald (protokol-vagt) ----------
async function safeSql(runner, text, opts) {
  const dead = (error) => ({ protocolOk: false, ok: false, code: null, error, detail: null, rows: null });
  const fn = typeof runner === "function" ? runner : isPlain(runner) ? own(runner, "sql") : null;
  if (typeof fn !== "function") return dead("runner.sql mangler (fail-closed)");
  if (!isStr(text)) return dead("tom/ugyldig sql (fail-closed)");
  let r; try { r = await fn(text, opts); } catch (e) { return dead(`runner kastede: ${e?.message ?? String(e)}`); }
  const okVal = own(r, "ok");
  if (!isPlain(r) || typeof okVal !== "boolean") return dead("runner returnerede ikke {ok:boolean} som eget data-felt (fail-closed)");
  const code = own(r, "code"); const err = own(r, "error"); const rows = own(r, "rows"); const det = own(r, "detail");
  const detail = isPlain(det) ? { message: typeof own(det, "message") === "string" ? own(det, "message") : null, routine: typeof own(det, "routine") === "string" ? own(det, "routine") : null } : null;
  const rowsOk = isDense(rows, isPlain) && rows.every((row) => safeCanon(row) !== null);
  return { protocolOk: true, ok: okVal, code: typeof code === "string" ? code : null, error: typeof err === "string" ? err : null, detail, rows: rowsOk ? rows : null };
}
const kald = (r) => ({ ok: r.ok, code: r.code, detail: r.detail });   // det der gemmes i observationerne

// ---------- typede observationer ----------
// matchExpect(rows, expect) → {ok, detail}; ok:null = protokol (manglende rækkesæt / ugyldig forventning) — aldrig et udfald
export function matchExpect(rows, expect) {
  if (!isPlain(expect) || !EXPECT_KINDS.includes(own(expect, "kind"))) return { ok: null, detail: "expect.kind skal være rows|count|scalar|empty|null" };
  if (!isDense(rows, isPlain)) return { ok: null, detail: "manglende rækkesæt (runner leverede ikke rows) — protokol-fejl, ikke et udfald" };
  const kind = own(expect, "kind");
  if (kind !== "empty" && kind !== "null" && !hasOwn(expect, "value")) return { ok: null, detail: `expect.${kind} kræver eksplicit value` };
  const value = own(expect, "value");
  switch (kind) {
    case "empty": return { ok: rows.length === 0, detail: `rows=${rows.length} (forventet 0)` };
    case "count": return Number.isInteger(value) && value >= 0 ? { ok: rows.length === value, detail: `rows=${rows.length} (forventet ${value})` } : { ok: null, detail: "count kræver heltal value" };
    case "scalar": {
      const want = safeCanon(value); if (want === null) return { ok: null, detail: "scalar value er ikke en gyldig endelig værdi" };
      if (rows.length !== 1) return { ok: false, detail: `scalar kræver præcis 1 række, fik ${rows.length}` };
      const cols = Object.keys(rows[0]); if (cols.length !== 1) return { ok: false, detail: `scalar kræver præcis 1 kolonne, fik ${cols.length}` };
      const got = safeCanon(own(rows[0], cols[0])); if (got === null) return { ok: null, detail: "observeret værdi er ikke endelig/gyldig" };
      return { ok: got === want, detail: `fik ${got}, forventet ${want}` };
    }
    case "null": { if (rows.length !== 1) return { ok: false, detail: `null kræver præcis 1 række, fik ${rows.length}` }; const cols = Object.keys(rows[0]); if (cols.length !== 1) return { ok: false, detail: "null kræver præcis 1 kolonne" }; return { ok: own(rows[0], cols[0]) === null, detail: `fik ${safeCanon(own(rows[0], cols[0]))}` }; }
    case "rows": {
      if (!isDense(value, isPlain)) return { ok: null, detail: "rows kræver value = tæt array af rækker" };
      const ordered = own(expect, "ordered") === true;
      const a = rows.map(safeCanon), b = value.map(safeCanon); if (a.includes(null) || b.includes(null)) return { ok: null, detail: "ugyldig værdi i rækkesæt" };
      const A = ordered ? a : [...a].sort(), B = ordered ? b : [...b].sort();
      return { ok: A.length === B.length && A.every((x, i) => x === B[i]), detail: `fik ${rows.length} rækker (forventet ${value.length}); ${ordered ? "ordnet" : "mængde"}-sammenligning` };
    }
  }
  return { ok: null, detail: "ukendt" };
}

// ---------- REN DOM over observationer (deles af motor og verifier) ----------
// judgeObservations(form, obs) → {status, assertions:[{id, ok, detail}]}   — obs er self-contained (inkl. kontrakt/forventninger)
export function judgeObservations(form, obs) {
  const A = []; const push = (id, ok, detail) => A.push({ id, ok, detail });
  const done = () => ({ status: A.length && A.every((a) => a.ok) ? STATUS.OPFYLDT : STATUS.BRUDT, assertions: A });
  const protokol = (why) => ({ status: STATUS.PROTOKOL, assertions: [{ id: "protokol", ok: false, detail: why }] });
  if (!isPlain(obs)) return protokol("observationer mangler");
  const k = own(obs, "kontrakt");
  if (form === "UT") {
    if (!isPlain(k)) return protokol("reject-kontrakt mangler i observationerne");
    const kanal = own(k, "kanal");
    if (kanal === "exit") {   // F-11: kontraktens KANAL bestemmer varianten — SQL-felter i en exit-case (eller omvendt) er protokol-fejl
      for (const f of ["positive", "negative", "state_before", "state_after"]) if (hasOwn(obs, f)) return protokol(`exit-kanal m. SQL-observation '${f}' — blandet variant afvises`);
      const ex = own(obs, "exit"); if (!Number.isInteger(own(k, "exit_code")) || !isStr(own(k, "klasse"))) return protokol("exit-kontrakt mangler exit_code/klasse");
      if (!isPlain(ex) || !Number.isInteger(own(ex, "exit_code"))) return protokol("exit_code ikke observeret");
      const code = own(ex, "exit_code");
      if (code !== 0 && code !== k.exit_code) return protokol(`kontrol-processen fungerer ikke (exit ${code} ∉ {0, ${k.exit_code}}) — uvedkommende, ikke et udfald`);   // F-15
      push("exit-klasse", code === k.exit_code && own(ex, "klasse_observeret") === k.klasse, `exit ${code} klasse=${String(own(ex, "klasse_observeret"))} (kontrakt ${k.exit_code} ${k.klasse})`);
      return done();
    }
    if (kanal !== "sqlstate") return protokol(`ukendt kontrakt-kanal '${String(kanal)}'`);
    if (hasOwn(obs, "exit")) return protokol("sqlstate-kanal m. exit-observation — blandet variant afvises");
    const p = own(obs, "positive"), n = own(obs, "negative"), b = own(obs, "state_before"), e = own(obs, "state_after");
    if (!isStr(own(k, "sqlstate")) || !isStr(own(k, "grund")) || !isStr(own(k, "afvisningssted")) || !isStr(own(k, "aktoer")) || !isStr(own(k, "fase"))) return protokol("reject-kontrakt (sqlstate/grund/afvisningssted/aktoer/fase) mangler i observationerne");
    if (!isPlain(p) || !isPlain(n) || !isDense(b, isPlain) || !isDense(e, isPlain)) return protokol("UT-observationer ufuldstændige (positive/negative/state_before/state_after)");
    if (klasse(p) === "uvedkommende") return protokol(`positivt kald fejlede uvedkommende (${p.code})`);
    if (klasse(n) === "uvedkommende") return protokol(`negativt kald fejlede uvedkommende (${n.code}) — ikke en afvisning, ikke et bevis`);
    push("positiv-soesterkald", p.ok === true, p.ok ? "lovligt kald lykkedes" : `lovligt kald afvist (${p.code}) — aktøren har ikke bevist adgang`);
    const det = isPlain(n.detail) ? n.detail : {};
    const grundOk = det.message === k.grund; const stedOk = k.afvisningssted === "-" ? true : det.routine === k.afvisningssted;
    push("negativ-afvist-bundet", n.ok === false && n.code === k.sqlstate && grundOk && stedOk, n.ok ? "FORBUDT HANDLING TILLADT" : `afvist m. ${n.code}/${String(det.message)}@${String(det.routine)} (kontrakt ${k.sqlstate}/${k.grund}@${k.afvisningssted})`);
    push("aktoer-bundet", own(obs, "aktoer") === k.aktoer, `forsøget kørte som ${String(own(obs, "aktoer"))} (kontrakt ${k.aktoer})`);
    push("fase-bundet", own(obs, "fase") === k.fase, `forsøget skete i fasen '${String(own(obs, "fase"))}' (kontrakt ${k.fase})`);   // F-14
    const bc = safeCanon(b), ec = safeCanon(e); if (bc === null || ec === null) return protokol("tilstands-observation indeholder ugyldige værdier");
    push("tilstand-uaendret", bc === ec, bc === ec ? "state før == efter" : "tilstand ændret af det afviste forsøg");
    return done();
  }
  if (form === "FS") {
    const o = own(obs, "observe"), exp = own(obs, "expect");
    if (hasOwn(obs, "action")) { const a = own(obs, "action"); if (!isPlain(a)) return protokol("action-observation ugyldig"); if (klasse(a) === "uvedkommende") return protokol(`handling fejlede uvedkommende (${a.code})`); push("handling-lykkedes", a.ok === true, a.ok ? "ok" : `afvist ${a.code}`); }
    if (!isPlain(o) || o.ok !== true) return protokol("observations-kaldet lykkedes ikke (afvist/manglende) — ingen observation");
    const m = matchExpect(own(o, "rows"), exp); if (m.ok === null) return protokol(`observation: ${m.detail}`);
    push("vaerdi-matcher-orakel", m.ok, m.detail);
    const cps = own(obs, "checkpoints"); if (!isDense(cps, isPlain)) return protokol("checkpoints-observationer mangler (tomt array hvis ingen)");
    for (const cp of cps) { if (!isStr(own(cp, "id")) || own(cp, "ok") !== true) return protokol(`checkpoint ${String(own(cp, "id"))}: observations-kaldet lykkedes ikke`); const mm = matchExpect(own(cp, "rows"), own(cp, "expect")); if (mm.ok === null) return protokol(`checkpoint ${cp.id}: ${mm.detail}`); push(`checkpoint:${cp.id}`, mm.ok, mm.detail); }
    return done();
  }
  if (form === "MH") {
    const a = own(obs, "action"), w = own(obs, "witnesses");
    if (!isPlain(a) || !isDense(w, isPlain) || w.length === 0) return protokol("MH-observationer ufuldstændige (action + ≥1 vidne)");
    if (klasse(a) === "uvedkommende") return protokol(`handling fejlede uvedkommende (${a.code}) — ikke »handling udebliver«`);
    push("handling-mulig-for-legitim-aktoer", a.ok === true, a.ok ? "lovlig handling gennemført" : `HANDLING UDEBLEV (afvist ${a.code})`);
    for (const x of w) { if (!isStr(own(x, "id")) || own(x, "ok") !== true) return protokol(`vidne ${String(own(x, "id"))}: observations-kaldet lykkedes ikke`); const m = matchExpect(own(x, "rows"), own(x, "expect")); if (m.ok === null) return protokol(`vidne ${x.id}: ${m.detail}`); push(`vidne:${x.id}`, m.ok, m.detail); }
    return done();
  }
  if (form === "SA") {
    const a = own(obs, "a"), b = own(obs, "b"), bar = own(obs, "barrier");
    if (!isPlain(k) || !isStr(own(k, "sqlstate")) || !isStr(own(k, "grund")) || !isStr(own(k, "aktoer"))) return protokol("SA: reject-kontrakt (sqlstate/grund/aktoer) mangler");
    if (!isPlain(a) || !isPlain(b) || !isPlain(bar) || typeof own(a, "ok") !== "boolean" || typeof own(b, "ok") !== "boolean") return protokol("SA-observationer ufuldstændige (a/b/barrier)");
    if (klasse(a) === "uvedkommende" || klasse(b) === "uvedkommende") return protokol(`et forløb fejlede uvedkommende (${a.code}/${b.code}) — ikke et race-udfald`);
    const pa = own(a, "pid"), pb = own(b, "pid");
    // F-15: manglende sessions-/afslutnings-/overlapbevis er PROTOKOL-fejl — ikke et udfald der kan blive brudt/kill
    if (!Number.isInteger(pa) || !Number.isInteger(pb)) return protokol("SA: backend-pids ikke observeret (ingen sessionsbevis)");
    if (!["commit", "rollback"].includes(own(a, "commit")) || !["commit", "rollback"].includes(own(b, "commit"))) return protokol("SA: afslutning (commit/rollback) ikke observeret pr. session");
    if (typeof own(bar, "observed") !== "boolean") return protokol("SA: barriere-observation mangler");
    push("aktoer-bundet", own(obs, "aktoer") === k.aktoer, `forløbene kørte som ${String(own(obs, "aktoer"))} (kontrakt ${k.aktoer})`);   // F-14
    push("to-sessions", pa !== pb, `pid A=${pa} B=${pb}`);
    push("barriere-observeret", own(bar, "observed") === true && own(bar, "blocked_pid") === pb && own(bar, "blocking_pid") === pa, own(bar, "observed") === true ? `B (${String(own(bar, "blocked_pid"))}) blokeret af A (${String(own(bar, "blocking_pid"))})` : "ingen barriere observeret — sekventiel kørsel er ikke SA");
    const rej = [a, b].filter((x) => x.ok === false); const bundet = rej.every((x) => x.code === k.sqlstate && (isPlain(x.detail) ? x.detail.message : null) === k.grund && (k.afvisningssted === "-" || (isPlain(x.detail) ? x.detail.routine : null) === k.afvisningssted));
    push("praecis-en-afvisning-bundet", rej.length === 1 && bundet, `afvisninger=${rej.length} (${rej.map((x) => x.code).join(",")}) kontrakt ${k.sqlstate}/${k.grund}`);
    const afsl = (x) => (x.ok ? own(x, "commit") === "commit" : own(x, "commit") === "rollback");
    push("afslutning-committet", afsl(a) && afsl(b), `A=${String(own(a, "commit"))} B=${String(own(b, "commit"))}`);
    const m = matchExpect(own(obs, "invariantRows"), own(obs, "invariant_expect")); if (m.ok === null) return protokol(`invariant: ${m.detail}`);
    push("invariant-efter-commit", m.ok, m.detail);
    return done();
  }
  return protokol(`ukendt bevisform ${String(form)}`);
}

// brudtPaaFormensMaade(result) — er MÅL-casen brudt netop dér hvor formen siger et hul viser sig?
export function brudtPaaFormensMaade(r) {
  if (!isPlain(r) || r.status !== STATUS.BRUDT || !isDense(r.assertions, isPlain)) return false;
  const a = (id) => r.assertions.find((x) => x.id === id)?.ok;
  switch (r.proof_form) {
    case "UT": return a("negativ-afvist-bundet") === false && (own(own(r, "observations"), "negative")?.ok === true || own(own(r, "observations"), "exit") !== undefined) || a("tilstand-uaendret") === false || a("exit-klasse") === false;
    case "FS": return a("vaerdi-matcher-orakel") === false || r.assertions.some((x) => x.id.startsWith("checkpoint:") && x.ok === false);
    case "MH": return a("handling-mulig-for-legitim-aktoer") === false || r.assertions.some((x) => x.id.startsWith("vidne:") && x.ok === false);
    case "SA": return a("invariant-efter-commit") === false;   // F-15: kun racets faktiske brud er formens brud
    default: return false;
  }
}

// ---------- case-kørsel (indsamler observationer; dommen er judgeObservations) ----------
export async function runCase(c, ctx, runner) {
  const base = () => ({
    case_id: own(c, "case_id") ?? null, obligation_id: own(c, "obligation_id") ?? null, negative_id: own(c, "negative_id") ?? null,
    proof_form: own(c, "proof_form") ?? null, bid_id: own(c, "bid_id") ?? null, hard_effect: own(c, "hard_effect") ?? null,
    entrypoint: isPlain(own(c, "entrypoint")) ? { kind: own(own(c, "entrypoint"), "kind") ?? null, ref: own(own(c, "entrypoint"), "ref") ?? null } : null,
    actor_role: isPlain(own(c, "actor")) ? own(own(c, "actor"), "role") ?? null : null,
    run_id: isPlain(ctx) ? own(ctx, "run_id") ?? null : null,   // ALLE delresultater (også indlejrede i mutanter) bærer kørslens id (C1-r2 F-12)
  });
  const protokol = (why) => ({ ...base(), status: STATUS.PROTOKOL, assertions: [{ id: "protokol", ok: false, detail: why }], observations: {} });
  if (!isPlain(c)) return protokol("case er ikke et plain object");
  const forventning = isPlain(ctx) ? own(ctx, "forventning") : null;
  if (!forventning || !(forventning.obligations instanceof Map)) return protokol("ctx.forventning (expectedSet fra manifest) mangler");
  const cid = own(c, "case_id"); const oid = own(c, "obligation_id"); const form = own(c, "proof_form");
  if (!isStr(cid)) return protokol("case_id mangler");
  const ob = forventning.obligations.get(oid);
  if (!ob) return protokol(`obligation '${String(oid)}' findes ikke i manifestets nu-scope (rogue/overdraget)`);
  if (!ob.forms.has(form)) return protokol(`bevisform '${String(form)}' er ikke en af manifestets former for ${oid} (${[...ob.forms].join(",")}) — formen hentes fra manifestet`);
  const ep = own(c, "entrypoint");
  if (!isPlain(ep) || !PUBLIC_ENTRYPOINT_KINDS.includes(own(ep, "kind")) || !isStr(own(ep, "ref"))) return protokol("entrypoint skal være {kind: api|rpc|ui-flow, ref} (offentlig indgang)");
  const actor = own(c, "actor");
  if (!isPlain(actor) || !isStr(own(actor, "role"))) return protokol("actor.role (ikke-bypass rolle) kræves");
  if (!HARD_EFFECTS.includes(own(c, "hard_effect"))) return protokol("hard_effect skal være state|event|db-row (hård slut-effekt — ALDRIG helper-return)");
  if (!isStr(own(c, "bid_id"))) return protokol("bid_id kræves (D12: casen hører til et effekt-bid)");
  if (form !== "UT" && hasOwn(c, "negative_id") && own(c, "negative_id") !== null) return protokol("negative_id kun på UT-cases");
  const opts = { role: own(actor, "role"), settings: isPlain(own(actor, "settings")) ? own(actor, "settings") : undefined };
  const obs = {};
  if (hasOwn(c, "setup")) { const s = await safeSql(runner, own(own(c, "setup"), "sql"), {}); if (!s.protocolOk || !s.ok) return protokol(`setup (ejer) fejlede: ${s.error ?? s.code}`); obs.setup = { ok: true }; }
  const finish = () => { const j = judgeObservations(form, obs); return { ...base(), status: j.status, assertions: j.assertions, observations: obs }; };

  if (form === "UT") {
    const nid = own(c, "negative_id"); const neg = forventning.negatives.get(nid);
    if (!neg || neg.obligation_id !== oid) return protokol(`negative_id '${String(nid)}' findes ikke under ${oid} i manifestet`);
    const rc = neg.reject_contract;
    if (own(rc, "kanal") === "exit") {
      const check = own(c, "check"); const ex = isPlain(runner) ? own(runner, "exec") : null;
      if (!isPlain(check) || !isDense(own(check, "cmd"), isStr) || typeof ex !== "function") return protokol("exit-kanal kræver case.check.cmd[] og runner.exec");
      let r; try { r = await ex(own(check, "cmd")); } catch (e) { return protokol(`runner.exec kastede: ${e?.message}`); }
      const code = own(r, "exit_code"); const out = typeof own(r, "stdout") === "string" ? own(r, "stdout") : "";
      if (!Number.isInteger(code)) return protokol("runner.exec returnerede ikke exit_code");
      const m = out.split(/\r?\n/).map((l) => l.match(/^klasse=([A-Za-z0-9._:-]+)$/)).find(Boolean);   // struktureret diagnose-linje, ikke fri tekst
      obs.kontrakt = { kanal: "exit", exit_code: rc.exit_code, klasse: rc.klasse }; obs.exit = { exit_code: code, klasse_observeret: m ? m[1] : null };
      return finish();
    }
    const pos = own(c, "positive"); const negS = own(c, "negative"); const st = own(c, "state");
    if (!isPlain(pos) || !isPlain(negS) || !isPlain(st)) return protokol("UT kræver positive{sql} (lovligt søsterkald), negative{sql} og state{sql}");
    obs.kontrakt = { kanal: "sqlstate", sqlstate: rc.sqlstate, grund: rc.grund, afvisningssted: rc.afvisningssted, aktoer: rc.aktoer, fase: rc.fase }; obs.aktoer = opts.role; obs.fase = own(c, "fase") ?? null;
    const p = await safeSql(runner, own(pos, "sql"), opts); if (!p.protocolOk) return protokol(`positiv: ${p.error}`);
    const b = await safeSql(runner, own(st, "sql"), opts); if (!b.protocolOk || !b.ok || b.rows === null) return protokol(`state-observation før: ${b.error ?? b.code ?? "ingen rows"}`);
    const n = await safeSql(runner, own(negS, "sql"), opts); if (!n.protocolOk) return protokol(`negativ: ${n.error}`);
    const e = await safeSql(runner, own(st, "sql"), opts); if (!e.protocolOk || !e.ok || e.rows === null) return protokol(`state-observation efter: ${e.error ?? e.code ?? "ingen rows"}`);
    obs.positive = kald(p); obs.state_before = b.rows; obs.negative = kald(n); obs.state_after = e.rows;
    return finish();
  }
  if (form === "FS") {
    const act = own(c, "action"); const o1 = own(c, "observe"); const exp = own(c, "expect");
    if (!isPlain(o1) || !isPlain(exp)) return protokol("FS kræver observe{sql} og expect{kind,value}");
    if (isPlain(act)) { const a = await safeSql(runner, own(act, "sql"), opts); if (!a.protocolOk) return protokol(`action: ${a.error}`); obs.action = kald(a); }
    const o = await safeSql(runner, own(o1, "sql"), opts); if (!o.protocolOk) return protokol(`observe: ${o.error}`);
    obs.observe = { ok: o.ok, code: o.code, rows: o.rows }; obs.expect = exp;
    const cps = hasOwn(c, "checkpoints") ? own(c, "checkpoints") : [];
    if (!isDense(cps, isPlain)) return protokol("checkpoints skal være et tæt array");
    obs.checkpoints = [];
    for (const cp of cps) { const id = own(cp, "id"); if (!isStr(id)) return protokol("checkpoint uden id"); const r = await safeSql(runner, own(own(cp, "observe"), "sql"), opts); if (!r.protocolOk) return protokol(`checkpoint ${id}: ${r.error}`); obs.checkpoints.push({ id, ok: r.ok, code: r.code, rows: r.rows, expect: own(cp, "expect") }); }
    return finish();
  }
  if (form === "MH") {
    const act = own(c, "action"); const wit = own(c, "witnesses");
    if (!isPlain(act) || !isDense(wit, isPlain) || wit.length === 0) return protokol("MH kræver action{sql} og ≥1 witnesses[{id, observe{sql}, expect}]");
    const a = await safeSql(runner, own(act, "sql"), opts); if (!a.protocolOk) return protokol(`action: ${a.error}`);
    obs.action = kald(a); obs.witnesses = [];
    for (const w of wit) { const id = own(w, "id"); if (!isStr(id)) return protokol("vidne uden id"); const r = await safeSql(runner, own(own(w, "observe"), "sql"), opts); if (!r.protocolOk) return protokol(`vidne ${id}: ${r.error}`); obs.witnesses.push({ id, ok: r.ok, code: r.code, rows: r.rows, expect: own(w, "expect") }); }
    return finish();
  }
  if (form === "SA") {
    const race = own(c, "race"); const rf = isPlain(runner) ? own(runner, "race") : null;
    if (!isPlain(race) || typeof rf !== "function") return protokol("SA kræver case.race{race_id,a,b,barrier,invariant,reject_negative_id} og runner.race");
    const nid = own(race, "reject_negative_id"); const neg = forventning.negatives.get(nid);
    if (!neg || neg.obligation_id !== oid || own(neg.reject_contract, "kanal") !== "sqlstate") return protokol(`race.reject_negative_id '${String(nid)}' er ikke et sqlstate-negativ under ${oid}`);
    if (!isStr(own(race, "race_id")) || !isPlain(own(race, "a")) || !isPlain(own(race, "b")) || !isStr(own(race, "barrier")) || !isPlain(own(race, "invariant"))) return protokol("race mangler race_id/a/b/barrier/invariant");
    let r; try { r = await rf({ ...race, actor: opts }); } catch (e) { return protokol(`runner.race kastede: ${e?.message}`); }
    if (!isPlain(r) || own(r, "protocolOk") !== true) return protokol(`race-runner protokol-fejl: ${String(own(r, "error") ?? "ukendt")}`);
    const sess = (x) => (isPlain(x) ? { pid: own(x, "pid") ?? null, ok: own(x, "ok"), code: own(x, "code") ?? null, detail: isPlain(own(x, "detail")) ? { message: own(own(x, "detail"), "message") ?? null, routine: own(own(x, "detail"), "routine") ?? null } : null, commit: own(x, "commit") ?? null } : null);
    const bar = own(r, "barrier");
    obs.race_id = race.race_id; obs.kontrakt = { kanal: "sqlstate", sqlstate: neg.reject_contract.sqlstate, grund: neg.reject_contract.grund, afvisningssted: neg.reject_contract.afvisningssted, aktoer: neg.reject_contract.aktoer }; obs.aktoer = opts.role;
    obs.a = sess(own(r, "a")); obs.b = sess(own(r, "b")); obs.barrier = isPlain(bar) ? { observed: own(bar, "observed") === true, blocked_pid: own(bar, "blocked_pid") ?? null, blocking_pid: own(bar, "blocking_pid") ?? null } : {};
    obs.invariantRows = own(r, "invariantRows") ?? null; obs.invariant_expect = own(own(race, "invariant"), "expect");
    return finish();
  }
  return protokol(`ukendt bevisform ${String(form)}`);
}

// ---------- mutant-kill: målrettet + formbestemt; dommen er judgeKill (ren) ----------
// mutant = { mutant_id, guard_ref, apply, restore, target_case_id, target_assertion_id, controls:[case_id…] (≥1) }
export function judgeKill(m) {
  if (!isPlain(m)) return { killed: false, restored: false, cleanAfter: false, break_form: null, why: "malformet resultat" };
  const st = (r) => (isPlain(r) ? own(r, "status") : null);
  const base = own(m, "baseline"); const under = own(m, "under"); const cu = own(m, "controls_under"); const cb = own(m, "controls_baseline"); const rest = own(m, "restore"); const clean = own(m, "clean");
  const baselineOk = st(base) === STATUS.OPFYLDT && isDense(cb, isPlain) && cb.length >= 1 && cb.every((r) => st(r) === STATUS.OPFYLDT);
  const controlsOk = isDense(cu, isPlain) && cu.length >= 1 && cu.every((r) => st(r) === STATUS.OPFYLDT);
  const tid = own(m, "target_assertion_id");
  const targetBroken = isPlain(under) && isDense(own(under, "assertions"), isPlain) && under.assertions.some((a) => a.id === tid && a.ok === false);
  const fb = safeCanon(own(m, "footprint_baseline")), fu = safeCanon(own(m, "footprint_under")), fr = safeCanon(own(m, "footprint_restored"));
  const fpOk = fb !== null && fu !== null && fr !== null && isDense(own(m, "footprint_baseline"), isPlain);
  const mutationAttesteret = fpOk && fb !== fu;             // uden aftryk er intet muteret (findes-mutant/no-op)
  const killed = baselineOk && controlsOk && st(under) === STATUS.BRUDT && targetBroken && brudtPaaFormensMaade(under) && mutationAttesteret;
  const restored = isPlain(rest) && own(rest, "ok") === true && fpOk && fr === fb;   // restore bevist ved aftryk == baseline, FØR clean-setup
  const cleanAfter = restored && isPlain(clean) && st(own(clean, "target")) === STATUS.OPFYLDT && isDense(own(clean, "controls"), isPlain) && clean.controls.length >= 1 && clean.controls.every((r) => st(r) === STATUS.OPFYLDT);
  return { killed, restored, cleanAfter, break_form: killed ? own(under, "proof_form") : null, why: killed ? `dræbt: ${tid}` : `ikke dræbt: baseline=${baselineOk} kontroller=${controlsOk} mål=${st(under)} target_assertion_brudt=${targetBroken} mutation_attesteret=${mutationAttesteret}` };
}
export async function killCaseMutant(mutant, cases, ctx, runner) {
  const mid = own(mutant, "mutant_id") ?? null;
  const out = (o) => ({ mutant_id: mid, guard_ref: own(mutant, "guard_ref") ?? null, target_case_id: own(mutant, "target_case_id") ?? null, target_assertion_id: own(mutant, "target_assertion_id") ?? null, killed: false, break_form: null, restored: false, cleanAfter: false, ...o });
  if (!isPlain(mutant) || !isStr(mid) || !isStr(own(mutant, "guard_ref")) || !isStr(own(mutant, "apply")) || !isStr(own(mutant, "restore")) || !isStr(own(mutant, "target_case_id")) || !isStr(own(mutant, "target_assertion_id")))
    return out({ detail: "malformet mutant (mutant_id/guard_ref/apply/restore/target_case_id/target_assertion_id kræves)" });
  if (!isDense(cases, isPlain)) return out({ detail: "cases skal være et tæt array" });
  const byId = new Map(cases.map((c) => [own(c, "case_id"), c]));
  const target = byId.get(own(mutant, "target_case_id"));
  if (!target) return out({ detail: `target_case_id '${own(mutant, "target_case_id")}' findes ikke` });
  const ctrlIds = own(mutant, "controls");
  if (!isDense(ctrlIds, isStr) || ctrlIds.length === 0 || ctrlIds.some((id) => !byId.has(id) || id === own(mutant, "target_case_id"))) return out({ detail: "controls skal være ≥1 eksisterende case_ids ≠ target (de nødvendige kontrolforløb)" });
  const controls = ctrlIds.map((id) => byId.get(id));
  const fpSpec = own(mutant, "footprint");
  if (!isPlain(fpSpec) || !isPlain(own(fpSpec, "observe")) || !isStr(own(own(fpSpec, "observe"), "sql"))) return out({ detail: "footprint.observe{sql} kræves (ejer-observation af det muterede objekt — attesterer mutation og restore)" });
  const fp = async () => { const r = await safeSql(runner, own(own(fpSpec, "observe"), "sql"), {}); return r.protocolOk && r.ok && r.rows !== null ? r.rows : null; };
  const runAll = async (list) => { const r = []; for (const cc of list) r.push(await runCase(cc, ctx, runner)); return r; };
  const baseline = await runCase(target, ctx, runner); const controls_baseline = await runAll(controls);
  const footprint_baseline = await fp();
  const res = { baseline, controls_baseline, footprint_baseline };
  if (baseline.status !== STATUS.OPFYLDT || !controls_baseline.every((r) => r.status === STATUS.OPFYLDT)) return out({ ...res, detail: "baseline (mål + kontroller) ikke opfyldt — intet at dræbe mod" });
  const applied = await safeSql(runner, own(mutant, "apply"), {});
  if (!applied.protocolOk || !applied.ok) {
    const rr = await safeSql(runner, own(mutant, "restore"), {}); const clean = { target: await runCase(target, ctx, runner), controls: await runAll(controls) };
    const j = judgeKill({ ...res, restore: { ok: rr.ok === true }, clean });
    return out({ ...res, restore: { ok: rr.ok === true }, clean, restored: j.restored, cleanAfter: j.cleanAfter, detail: `mutant-apply fejlede: ${applied.error ?? applied.code}` });
  }
  const footprint_under = await fp();                       // mutationen SKAL efterlade et aftryk (attesteret mutation, F-13)
  const under = await runCase(target, ctx, runner); const controls_under = await runAll(controls);
  const rr = await safeSql(runner, own(mutant, "restore"), {});
  const footprint_restored = await fp();                    // aftrykket SKAL være tilbage FØR nogen clean-kørsels setup (F-16)
  const clean = { target: await runCase(target, ctx, runner), controls: await runAll(controls) };
  const full = { ...res, footprint_under, footprint_restored, under, controls_under, restore: { ok: rr.ok === true }, clean, target_assertion_id: own(mutant, "target_assertion_id") };
  const j = judgeKill(full);
  return out({ ...full, killed: j.killed, break_form: j.break_form, restored: j.restored, cleanAfter: j.cleanAfter, detail: j.why });
}

// ---------- engine ----------
export async function runBuildProofEngine(spec, runner) {
  const dead = (error) => ({ run_id: null, cases: [], mutants: [], summary: null, allOk: false, error });
  if (!isPlain(spec)) return dead("malformet spec");
  const manifest = own(spec, "manifest");
  const src = isPlain(own(spec, "angrebsSpec")) ? own(spec, "angrebsSpec") : spec;   // måle-spec'en (angrebs-spec.json) leverer cases + mutants
  const cases = own(src, "cases"); const mutants = hasOwn(src, "mutants") ? own(src, "mutants") : [];
  const runId = own(spec, "run_id");
  if (!isStr(runId)) return dead("run_id kræves (binder alle delbeviser til én kørsel)");
  let forventning; try { forventning = expectedSet(manifest); } catch (e) { return dead(`manifest: ${e.message}`); }
  if (!isDense(cases, isPlain) || cases.length === 0) return dead("cases skal være et ikke-tomt, tæt array");
  if (!isDense(mutants, isPlain)) return dead("mutants skal være et tæt array");
  const ids = new Set(); for (const c of cases) { const id = own(c, "case_id"); if (!isStr(id) || ids.has(id)) return dead(`case_id mangler/dublet: ${String(id)}`); ids.add(id); }
  const ctx = { forventning, run_id: runId };
  const caseRes = []; for (const c of cases) caseRes.push(await runCase(c, ctx, runner));
  const mutRes = []; for (const m of mutants) mutRes.push({ ...(await killCaseMutant(m, cases, ctx, runner)), run_id: runId });
  const summary = summarize(caseRes, mutRes);
  return { run_id: runId, cases: caseRes, mutants: mutRes, summary, allOk: summary.brudt === 0 && summary.protokol_fejl === 0 && summary.draebt === summary.mutanter };
}
export function summarize(caseRes, mutRes) {
  return { opfyldt: caseRes.filter((r) => r.status === STATUS.OPFYLDT).length, brudt: caseRes.filter((r) => r.status === STATUS.BRUDT).length, protokol_fejl: caseRes.filter((r) => r.status === STATUS.PROTOKOL).length, mutanter: mutRes.length, draebt: mutRes.filter((m) => m.killed && m.restored && m.cleanAfter).length };
}
