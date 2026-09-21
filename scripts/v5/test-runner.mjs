#!/usr/bin/env node
// test-runner.mjs — v5's angrebs-TEST-runner (kursændring 2026-09-21, Mathias: »vi overkompliserer opgaven«): Codex skriver angrebs-testene
// som KODE i måle-laget (scripts/v5/<pakke>/tests/*.test.mjs), ikke som en JSON-DSL verifieren skal genudlede. Beskyttelsen mod falsk-grøn
// er PROCESSEN: der måler ≠ der bygger (hooks: byggeren kan ikke skrive i scripts/v5/**) · CI kører testene mod den friske store · hver
// mutant skal få Codex' navngivne tests til at FEJLE (mutant-kill) · build-gaten læser RAPPORTEN (ikke selvrapporterede flag).
//
// INDEKS (angrebs-spec.json, gate-binding, skema 2 — angrebs-spec.mjs validerer komplethed mod manifestet):
//   { schema_version: 2, pakke, bindings:{manifest, plan}, bids:[…],
//     tests:   [{ id, file: "scripts/v5/<pakke>/tests/<navn>.test.mjs", oid, covers: ["K-n/ac-m:UT", "K-n/ac-m/neg-k", "K-n/ac-m|<delbevis-id>", …] }],
//     mutants: [{ mutant_id, guard_ref | locus_ref, apply, restore, target_test_ids:[…], control_test_ids:[…] }] }   (locus_ref = planbundet I-locus uden manifest-værn)
// TESTFIL: `export const tests = [{ id, covers, run: async (lib) => { … kast ved fejl … } }]` — id'er og covers SKAL være indeksets (mismatch = rød).
// BINDING (Mathias 2026-09-21 »sandhed = krav = plan = byg … uden at overteste«): en test der afgiver ingen forventning er VAKUUM (rød);
// dækker den et negativ, SKAL den have kaldt forvent.afvist(…, netop det negativ) — ellers rød. Billigt, mekanisk, ingen ny runde.
// LIB (det Codex' tests får — alt andet er kode i testen):
//   lib.ejer.sql(text)                       → kald-udfald som ejer            lib.som(actor).sql(text) / .http(req) → som aktør {role, settings}
//   lib.race(scenario)                       → pg-runner race (overlap-vidne)  lib.kontrakt(negative_id) → manifestets reject_contract
//   lib.exec(cmd[])                          → {exit_code, stdout} (exit-kanal)  lib.session(name) → én psql-backend (pg-runner session)
//   lib.ur.saet(iso) / lib.ur.frem(sek)      → FA-3-ur (libfaketime-fil, fremad-kun) — Afvist hvis måle-jobbet ikke har ur-driver
//   lib.forvent.afvist(kald, negative_id|kontrakt, {subst?})  UT: code + grund (+ sted når observerbart)   lib.forvent.ok(kald)
//   lib.forvent.lig(rows, expect)  (matchExpect: rows|count|scalar|empty|null)  lib.forvent.sandt(x, detail)
// RAPPORT (bevisets body): { schema_version: 3, pakke, run_id, index_oid, tests:[{id, file, covers, ok, ms, detail}],
//   mutants:[{mutant_id, guard_ref, applied_ok, targets:[{id, failed, detail}], controls:[{id, ok}], restored:[{id, ok}], killed}], summary }
// KILL = apply ok ∧ ALLE target-tests fejler under mutationen ∧ alle control-tests består ∧ efter restore består targets+controls igen.

import { pathToFileURL } from "node:url";
import { resolve, isAbsolute, normalize } from "node:path";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { expectedSet } from "./forventnings-manifest.mjs";
import { matchExpect, grundEffektiv } from "./build-harness.mjs";

const isPlain = (v) => v !== null && typeof v === "object" && !Array.isArray(v) && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const isStr = (v) => typeof v === "string" && v.length > 0;
export class Afvist extends Error { constructor(detail) { super(detail); this.name = "Afvist"; } }
const fejl = (d) => { throw new Afvist(d); };
const hashObject = (path, root) => { const r = spawnSync("git", ["-C", root, "hash-object", path], { encoding: "utf8" }); if (r.status !== 0) throw new Error(`hash-object ${path}: ${r.stderr}`); return r.stdout.trim(); };

// urFraMiljoe(env) → FA-3-ur-driveren (libfaketime på Postgres-processen, styret via FAKETIME_TIMESTAMP_FILE m. FAKETIME_NO_CACHE=1):
//   env.V5_FAKETIME_FILE = stien til tidsstempel-filen (delt m. containeren). saet(iso) skriver "@YYYY-MM-DD HH:MM:SS" (UTC) · frem(sek) rykker
//   fremad fra sidst satte tid (fremad-kun: P:33). Uden V5_FAKETIME_FILE → Afvist (testen er ærligt rød: ur-driver ikke tilgængelig).
export function urFraMiljoe(env = process.env) {
  const file = typeof env.V5_FAKETIME_FILE === "string" && env.V5_FAKETIME_FILE.length ? env.V5_FAKETIME_FILE : null;
  let nu = null;
  const fmt = (d) => "@" + d.toISOString().slice(0, 19).replace("T", " ");
  const skriv = (d) => { if (!file) fejl("ur-driver ikke tilgængelig i dette måle-job (V5_FAKETIME_FILE mangler — FA-3)"); if (nu && d.getTime() < nu.getTime()) fejl(`uret må kun gå fremad (P:33): ${d.toISOString()} < ${nu.toISOString()}`); writeFileSync(file, fmt(d) + "\n"); nu = d; return fmt(d); };
  return { tilgaengelig: file !== null, nu: () => (nu ? new Date(nu.getTime()) : null),
    saet: (iso) => { const d = new Date(iso); if (!isStr(iso) || Number.isNaN(d.getTime())) throw new Error(`ur.saet: ugyldig ISO-tid '${String(iso)}'`); return skriv(d); },
    frem: (sek) => { if (!Number.isFinite(sek) || sek <= 0) throw new Error("ur.frem: sekunder > 0 kræves"); if (!nu) fejl("ur.frem før ur.saet — sæt et starttidspunkt først"); return skriv(new Date(nu.getTime() + Math.round(sek * 1000))); } };
}

// makeLib({runner, manifest, pakke, ur?}) → lib til testene
export function makeLib({ runner, manifest, pakke, ur = urFraMiljoe() }) {
  const F = expectedSet(manifest);
  // Mathias 2026-09-21: »sandhed = krav = plan = byg … uden at overteste« → billig BINDING mellem covers og faktisk håndhævelse:
  // hver test skal afgive ≥1 forventning, og hvert negativ testen dækker SKAL være håndhævet m. forvent.afvist(…, <netop det negativ>).
  const spor = { n: 0, nids: new Set() }; const tael = (nid) => { spor.n++; if (nid) spor.nids.add(nid); };
  const NID = Symbol.for("v5.negativ_id");
  const kald = async (fn, ...a) => { let r; try { r = await fn(...a); } catch (e) { fejl(`runner kastede: ${e?.message ?? e}`); } if (!isPlain(r) || typeof r.ok !== "boolean") fejl("runner leverede ikke {ok:boolean}"); return r; };
  const som = (actor) => {
    if (!isPlain(actor) || !isStr(actor.role)) throw new Error("lib.som(actor): {role, settings?} kræves");
    const opts = { role: actor.role, settings: isPlain(actor.settings) ? actor.settings : undefined };
    return { sql: (text) => kald(runner.sql, text, opts), http: (req) => { if (typeof runner.http !== "function") fejl("runner.http mangler (PostgREST-transport ikke tilgængelig i dette måle-job)"); return kald(runner.http, req, actor); } };
  };
  const kontrakt = (nid) => { const n = F.negatives.get(nid); if (!n) throw new Error(`negativ '${nid}' findes ikke i manifestet`); return Object.defineProperty({ ...n.reject_contract }, NID, { value: nid }); };
  const forvent = {
    ok: (k, hvad = "kaldet") => { tael(); if (k?.ok !== true) fejl(`${hvad} blev afvist: ${k?.code ?? "?"} ${k?.detail?.message ?? k?.error ?? ""}`); return k; },
    afvist: (k, nidEllerKontrakt, { subst } = {}) => {
      const rc = isStr(nidEllerKontrakt) ? kontrakt(nidEllerKontrakt) : nidEllerKontrakt;
      if (!isPlain(rc) || rc.kanal !== "sqlstate") throw new Error("forvent.afvist kræver en sqlstate-kontrakt");
      tael(isStr(nidEllerKontrakt) ? nidEllerKontrakt : rc[NID]);
      if (k?.ok !== false) fejl(`FORBUDT HANDLING TILLADT (kontrakt ${rc.sqlstate}/${rc.grund})`);
      if (k.code !== rc.sqlstate) fejl(`afvist m. ${k.code} ≠ kontraktens ${rc.sqlstate} (${k?.detail?.message ?? ""})`);
      const ge = grundEffektiv(rc.grund, subst); if (ge.fejl) fejl(`substitution: ${ge.fejl}`);
      if ((k.detail?.message ?? null) !== ge.grund) fejl(`grund '${k.detail?.message}' ≠ kontraktens '${ge.grund}'`);
      const viaApi = Number.isInteger(k.http_status);
      if (viaApi && !(k.http_status >= 400 && k.http_status < 600)) fejl(`API-afvisning m. http_status ${k.http_status}`);
      if (!viaApi && rc.afvisningssted !== "-" && (k.detail?.routine ?? null) !== rc.afvisningssted) fejl(`afvisningssted '${k.detail?.routine}' ≠ kontraktens '${rc.afvisningssted}'`);
      return k;
    },
    lig: (rows, expect, hvad = "observation") => { tael(); const m = matchExpect(rows, expect); if (m.ok === null) fejl(`${hvad}: protokol — ${m.detail}`); if (!m.ok) fejl(`${hvad}: ${m.detail}`); return true; },
    sandt: (x, detail) => { tael(); if (x !== true) fejl(detail ?? "forventning ikke opfyldt"); return true; },
  };
  const exec = async (cmd) => { if (typeof runner.exec !== "function") fejl("runner.exec mangler (exit-kanalen ikke tilgængelig i dette måle-job)"); let r; try { r = await runner.exec(cmd); } catch (e) { fejl(`exec kastede: ${e?.message ?? e}`); } if (!isPlain(r) || !Number.isInteger(r.exit_code) || typeof r.stdout !== "string") fejl("runner.exec leverede ikke {exit_code, stdout}"); return r; };
  const session = (name) => { if (typeof runner.session !== "function") fejl("runner.session mangler (samme-backend-forløb ikke tilgængeligt)"); return runner.session(name); };   // én interaktiv psql (pg-runner.mjs session(name)) — flere sætninger i SAMME backend (tx over UTC-midnat, P:526/534)
  // bindingsdom efter en test: covers ↔ håndhævelse (kaldes af runneren med testens covers; nulstiller sporet)
  const bindingsFejl = (covers) => { const n = spor.n, nids = new Set(spor.nids); spor.n = 0; spor.nids.clear(); if (n === 0) return "VAKUUM: testen afgav ingen forventning (lib.forvent.*) — dækker intet"; for (const c of covers) if (F.negatives.has(c) && !nids.has(c)) return `dækker negativet '${c}' uden at håndhæve dets kontrakt (forvent.afvist(…, "${c}") blev ikke kaldt)`; return null; };
  return { pakke, manifest, forventning: F, ejer: { sql: (text) => kald(runner.sql, text, {}) }, som, race: (s) => kald(runner.race, s), http: runner.http ? (req, actor) => kald(runner.http, req, actor) : undefined, exec, session, ur, kontrakt, forvent, Afvist, _bindingsFejl: bindingsFejl };
}

// loadTests(index, root) → Map(id → {id, file, covers, run}) — filerne SKAL være indeksets (sti under scripts/v5/<pakke>/tests/, blob-oid == indeks)
export async function loadTests(index, root) {
  const out = new Map(); const seen = new Set();
  for (const t of index.tests) {
    const rel = normalize(t.file); if (isAbsolute(rel) || rel.split(/[\\/]/).includes("..") || !rel.startsWith(`scripts/v5/${index.pakke}/tests/`)) throw new Error(`test ${t.id}: file '${t.file}' ligger ikke under scripts/v5/${index.pakke}/tests/`);
    const abs = resolve(root, rel); if (!existsSync(abs)) throw new Error(`test ${t.id}: filen ${t.file} findes ikke i checkoutet`);
    const oid = hashObject(rel, root); if (oid !== t.oid) throw new Error(`test ${t.id}: ${t.file} har blob ${oid.slice(0, 12)} ≠ indeksets ${String(t.oid).slice(0, 12)} — testfilen er ikke den frosne`);
    if (!seen.has(abs)) { seen.add(abs); const mod = await import(pathToFileURL(abs).href + `?v=${oid}`); if (!Array.isArray(mod.tests)) throw new Error(`${t.file} eksporterer ikke \`tests\` (array)`);
      for (const x of mod.tests) { if (!isPlain(x) || !isStr(x.id) || typeof x.run !== "function" || !Array.isArray(x.covers)) throw new Error(`${t.file}: test uden {id, covers[], run()}`); if (out.has(x.id)) throw new Error(`dublet test-id ${x.id}`); out.set(x.id, { id: x.id, file: rel, covers: [...x.covers], run: x.run }); } }
  }
  for (const t of index.tests) { const x = out.get(t.id); if (!x) throw new Error(`indeksets test ${t.id} findes ikke i ${t.file}`); if (x.file !== normalize(t.file)) throw new Error(`test ${t.id} ligger i ${x.file}, indeks siger ${t.file}`); const a = [...x.covers].sort().join("|"), b = [...t.covers].sort().join("|"); if (a !== b) throw new Error(`test ${t.id}: covers i filen (${a}) ≠ indeksets (${b})`); }
  for (const id of out.keys()) if (!index.tests.some((t) => t.id === id)) throw new Error(`testfilen eksporterer '${id}' som ikke står i indekset`);
  return out;
}

async function koer(test, lib, timeoutMs) {
  const t0 = Date.now(); let timer;
  try { await Promise.race([test.run(lib), new Promise((_, rej) => { timer = setTimeout(() => rej(new Afvist(`timeout ${timeoutMs} ms`)), timeoutMs); })]); const b = lib._bindingsFejl(test.covers); return b ? { ok: false, ms: Date.now() - t0, detail: `binding: ${b}` } : { ok: true, ms: Date.now() - t0, detail: null }; }
  catch (e) { lib._bindingsFejl(test.covers); return { ok: false, ms: Date.now() - t0, detail: `${e?.name === "Afvist" ? "" : "(exception) "}${e?.message ?? String(e)}`.slice(0, 500) }; }
  finally { clearTimeout(timer); }
}

// runTestSuite({index, indexOid, runner, manifest, root, runId, timeoutMs}) → rapport
export async function runTestSuite({ index, indexOid, runner, manifest, root, runId, timeoutMs = 60000 } = {}) {
  const lib = makeLib({ runner, manifest, pakke: index.pakke });
  const tests = await loadTests(index, root);
  const rapport = { schema_version: 3, pakke: index.pakke, run_id: runId, index_oid: indexOid ?? null, tests: [], mutants: [], summary: null };
  for (const t of index.tests) { const x = tests.get(t.id); const r = await koer(x, lib, timeoutMs); rapport.tests.push({ id: x.id, file: x.file, covers: x.covers, ok: r.ok, ms: r.ms, detail: r.detail }); }
  for (const m of index.mutants) {
    const res = { mutant_id: m.mutant_id, guard_ref: m.guard_ref ?? null, locus_ref: m.locus_ref ?? null, applied_ok: false, targets: [], controls: [], restored: [], killed: false };
    let ap; try { ap = await runner.sql(m.apply, {}); } catch (e) { ap = { ok: false, error: String(e?.message ?? e) }; }
    res.applied_ok = ap?.ok === true; if (!res.applied_ok) { res.detail = `apply fejlede: ${ap?.code ?? ""} ${ap?.error ?? ap?.detail?.message ?? ""}`.trim(); }
    if (res.applied_ok) {
      for (const id of m.target_test_ids) { const r = await koer(tests.get(id), lib, timeoutMs); res.targets.push({ id, failed: r.ok === false, detail: r.detail }); }
      for (const id of m.control_test_ids) { const r = await koer(tests.get(id), lib, timeoutMs); res.controls.push({ id, ok: r.ok }); }
    }
    let rs; try { rs = await runner.sql(m.restore, {}); } catch (e) { rs = { ok: false }; }
    res.restore_ok = rs?.ok === true;
    if (res.restore_ok) for (const id of [...m.target_test_ids, ...m.control_test_ids]) { const r = await koer(tests.get(id), lib, timeoutMs); res.restored.push({ id, ok: r.ok }); }
    res.killed = res.applied_ok && res.targets.length > 0 && res.targets.every((t) => t.failed) && res.controls.every((c) => c.ok) && res.restore_ok && res.restored.every((r) => r.ok);
    rapport.mutants.push(res);
  }
  rapport.summary = summarizeReport(rapport);
  return rapport;
}
export function summarizeReport(r) { return { tests: r.tests.length, bestaaet: r.tests.filter((t) => t.ok === true).length, fejlet: r.tests.filter((t) => t.ok !== true).length, mutanter: r.mutants.length, draebt: r.mutants.filter((m) => m.killed === true).length }; }
