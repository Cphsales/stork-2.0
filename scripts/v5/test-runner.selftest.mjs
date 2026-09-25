#!/usr/bin/env node
// test-runner.selftest.mjs — red-team af test-runneren (hurtigt spor 2026-09-21): testfiler er FROSNE via indeksets blob-oids og skal
// ligge i måle-laget · id/covers i fil == indeks · lib håndhæver kontrakten (kode+grund+sted, subst) · mutant-kill-protokollen
// (apply · alle targets FEJLER · controls ok · restore · alle grønne igen) · rapport skema 3 m. genudledt summary.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, appendFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { makeLib, loadTests, runTestSuite, summarizeReport, urFraMiljoe, Afvist } from "./test-runner.mjs";

let passed = 0, failed = 0;
const ok = (n) => { passed++; console.log(`  ✓ ${n}`); };
const bad = (n, d) => { failed++; console.error(`  ✗ ${n} — ${d}`); };
const eq = (n, got, want) => (got === want ? ok(n) : bad(n, `fik ${JSON.stringify(got)}, forventede ${JSON.stringify(want)}`));
const throwsWith = async (n, fn, needle) => { try { await fn(); bad(n, "kastede IKKE"); } catch (e) { new RegExp(needle).test(e?.message ?? "") ? ok(n) : bad(n, `kastede men uden '${needle}': ${e?.message}`); } };

// ---------- fixture: repo m. testfiler i måle-laget ----------
const ROOT = mkdtempSync(join(tmpdir(), "v5-testrunner-")); process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]);
const put = (p, c) => { mkdirSync(join(ROOT, dirname(p)), { recursive: true }); writeFileSync(join(ROOT, p), c); };
const oidOf = (p) => execFileSync("git", ["-C", ROOT, "hash-object", p], { encoding: "utf8" }).trim();
const F1 = "scripts/v5/pk/tests/k1.test.mjs", F2 = "scripts/v5/pk/tests/k1-fs.test.mjs";
put(F1, `export const tests = [
  { id: "t-k1-neg", covers: ["K-1/ac-1:UT", "K-1/ac-1/neg-1"], run: async (lib) => { const a = lib.som({ role: "app_role" }); lib.forvent.ok(await a.sql("POS"), "positiv"); lib.forvent.afvist(await a.sql("NEG"), "K-1/ac-1/neg-1"); } },
  { id: "t-k1-audit", covers: ["K-1/ac-1:MH", "K-1/ac-1|audit-row"], run: async (lib) => { lib.forvent.ok(await lib.som({ role: "app_role" }).sql("ACT_MH")); lib.forvent.lig((await lib.ejer.sql("AUDIT")).rows, { kind: "count", value: 1 }, "audit-row"); } },
];
`);
put(F2, `export const tests = [
  { id: "t-k1-fs", covers: ["K-1/ac-3:FS", "K-1/ac-3|hist"], run: async (lib) => { lib.forvent.ok(await lib.som({ role: "app_role" }).sql("ACT")); lib.forvent.lig((await lib.ejer.sql("OBS")).rows, { kind: "scalar", value: 100 }, "slut"); lib.forvent.lig((await lib.ejer.sql("OBS_HIST")).rows, { kind: "scalar", value: 80 }, "hist"); } },
];
`);
const rc = (sqlstate, sted, grund, fase = "wrapper", aktoer = "app_role") => ({ kanal: "sqlstate", sqlstate, grund, afvisningssted: sted, fase, aktoer, observationskanal: "sqlstate", offentlig_signatur: "f(text)" });
const O = "0".repeat(40);
const MANIFEST = { schema_version: 1, pakke: "pk", bindings: { forventningsliste: { path: "plan-build/pk/forventningsliste.md", oid: O }, krav: { path: "docs/sandhed/krav/pk-krav.md", oid: O }, plan: { path: "plan-build/pk/plan.md", oid: O } },
  guards: [{ id: "g.navn", beskrivelse: "navn" }],
  obligations: [
    { id: "K-1/ac-1", k_id: "K-1", kind: "ac", proof_forms: ["UT", "MH"], scope: "nu", effekt_bid: "bid-2", kildeankre: ["K:1"], assertions: [{ id: "audit-row", form: "MH" }], negatives: [{ id: "K-1/ac-1/neg-1", beskrivelse: "blank", reject_contract: rc("22023", "f.lokation_opret", "navn_blank"), sole_guard_ref: "g.navn" }] },
    { id: "K-1/ac-3", k_id: "K-1", kind: "ac", proof_forms: ["FS"], scope: "nu", kildeankre: ["K:3"], assertions: [{ id: "hist", form: "FS" }], negatives: [] },
    { id: "K-7/ac-2", k_id: "K-7", kind: "ac", proof_forms: ["UT"], scope: "nu", kildeankre: ["K:140"], negatives: [{ id: "K-7/ac-2/neg-2", beskrivelse: "id", reject_contract: rc("22023", "f.anonymiser", "entity {id} findes ikke", "apply") }] },
  ] };
const IDX = () => ({ schema_version: 2, pakke: "pk", bindings: { manifest: { path: "plan-build/pk/forventnings-manifest.json", oid: O }, plan: { path: "plan-build/pk/plan.md", oid: O } },
  bids: [{ bid_id: "bid-1", kind: "forudsaetning", depends_on: [], covers: [] }, { bid_id: "bid-2", kind: "effekt", depends_on: ["bid-1"], covers: ["K-1/ac-1", "K-1/ac-3", "K-7/ac-2"] }],
  tests: [
    { id: "t-k1-neg", file: F1, oid: oidOf(F1), covers: ["K-1/ac-1:UT", "K-1/ac-1/neg-1"] },
    { id: "t-k1-audit", file: F1, oid: oidOf(F1), covers: ["K-1/ac-1:MH", "K-1/ac-1|audit-row"] },
    { id: "t-k1-fs", file: F2, oid: oidOf(F2), covers: ["K-1/ac-3:FS", "K-1/ac-3|hist"] },
  ],
  mutants: [{ mutant_id: "m-navn", guard_ref: "g.navn", apply: "M_NAVN_OFF", restore: "M_NAVN_ON", target_test_ids: ["t-k1-neg"], control_test_ids: ["t-k1-fs"] }] });
const R = (okv, code = null, message = null, routine = null, rows) => ({ ok: okv, error: okv ? null : message, code, detail: okv ? null : { message, routine }, ...(rows !== undefined ? { rows } : {}) });
function mkRunner(over = {}) {
  const st = { navn: true, audit: true, mutable: true, applyOk: true, restoreOk: true, calls: [], ...over };
  return { st,
    sql(t, opts) { st.calls.push([t, opts?.role ?? "ejer"]); switch (t) {
      case "POS": return R(true); case "NEG": return st.navn ? R(false, "22023", "navn_blank", "f.lokation_opret") : R(true); case "ACT_MH": return R(true); case "ACT": return R(true);
      case "AUDIT": return R(true, null, null, null, st.audit ? [{ id: 1 }] : []); case "OBS": return R(true, null, null, null, [{ pris: 100 }]); case "OBS_HIST": return R(true, null, null, null, [{ pris: 80 }]);
      case "M_NAVN_OFF": if (!st.applyOk) return R(false, "42601", "apply syntax"); if (st.mutable) st.navn = false; return R(true); case "M_NAVN_ON": if (!st.restoreOk) return R(false, "42601", "restore syntax"); st.navn = true; return R(true);
      case "NEG_ID": return R(false, "22023", "entity 11111111-1111-1111-1111-111111111111 findes ikke", "f.anonymiser");
      case "NEG_FORKERT_KODE": return R(false, "P0001", "navn_blank", "f.lokation_opret"); case "NEG_FORKERT_STED": return R(false, "22023", "navn_blank", "f.anden");
      default: return R(false, "42601", "ukendt " + t, null); } },
    race(s) { return { ok: true, protocolOk: true, s }; } };
}

console.log("loadTests — frosne filer i måle-laget:");
{ const m = await loadTests(IDX(), ROOT); eq("indlæser 3 tests fra 2 filer", m.size, 3); eq("test bærer fil + covers fra filen", m.get("t-k1-fs").file === F2 && m.get("t-k1-fs").covers.join("|") === "K-1/ac-3:FS|K-1/ac-3|hist", true); }
await throwsWith("fil uden for scripts/v5/<pakke>/tests/ → kast", () => { const i = IDX(); i.tests[2].file = "supabase/tests/x.test.mjs"; return loadTests(i, ROOT); }, "ligger ikke under");
await throwsWith("fil m. '..' → kast", () => { const i = IDX(); i.tests[2].file = "scripts/v5/pk/tests/../../../x.test.mjs"; return loadTests(i, ROOT); }, "ligger ikke under");
await throwsWith("fil findes ikke i checkoutet → kast", () => { const i = IDX(); i.tests[2].file = "scripts/v5/pk/tests/mangler.test.mjs"; return loadTests(i, ROOT); }, "findes ikke i checkoutet");
await throwsWith("indeks-oid ≠ filens blob (testfilen er ændret efter frysning) → kast", () => { const i = IDX(); i.tests[2].oid = "f".repeat(40); return loadTests(i, ROOT); }, "ikke den frosne");
await throwsWith("indeksets test-id findes ikke i filen → kast", () => { const i = IDX(); i.tests[2].id = "t-findes-ikke"; return loadTests(i, ROOT); }, "findes ikke i");
await throwsWith("covers i indeks ≠ filens → kast", () => { const i = IDX(); i.tests[2].covers = ["K-1/ac-3:FS"]; return loadTests(i, ROOT); }, "covers i filen");
await throwsWith("filen eksporterer en test der ikke står i indekset → kast (ingen skjulte tests)", () => { const i = IDX(); i.tests = i.tests.filter((t) => t.id !== "t-k1-audit"); return loadTests(i, ROOT); }, "som ikke står i indekset");
{ const F3 = "scripts/v5/pk/tests/daarlig.test.mjs"; put(F3, "export const ikkeTests = 1;\n"); await throwsWith("fil uden `tests`-eksport → kast", () => { const i = IDX(); i.tests.push({ id: "t-x", file: F3, oid: oidOf(F3), covers: ["K-1/ac-3:FS"] }); return loadTests(i, ROOT); }, "eksporterer ikke"); }
{ const F4 = "scripts/v5/pk/tests/uden-run.test.mjs"; put(F4, "export const tests = [{ id: 't-y', covers: [] }];\n"); await throwsWith("test uden run() → kast", () => { const i = IDX(); i.tests.push({ id: "t-y", file: F4, oid: oidOf(F4), covers: [] }); return loadTests(i, ROOT); }, "uden \\{id, covers"); }
{ const frossen = IDX(); const original = readFileSync(join(ROOT, F2)); appendFileSync(join(ROOT, F2), "// ændret efter frysning\n"); await throwsWith("filen ændret på disk efter indeksets oid → kast (frysning håndhævet mod checkoutet)", () => loadTests(frossen, ROOT), "ikke den frosne"); writeFileSync(join(ROOT, F2), original); eq("fixture genoprettet", oidOf(F2), frossen.tests[2].oid); }

console.log("\nlib — kontrakten håndhæves i koden:");
{ const lib = makeLib({ runner: mkRunner(), manifest: MANIFEST, pakke: "pk" });
  eq("kontrakt(nid) → manifestets reject_contract", lib.kontrakt("K-1/ac-1/neg-1").sqlstate, "22023");
  let e = null; try { lib.kontrakt("K-9/x"); } catch (x) { e = x.message; } eq("ukendt negativ → kast", /findes ikke i manifestet/.test(e ?? ""), true);
  const a = lib.som({ role: "app_role", settings: { "request.jwt.claim.sub": "u" } });
  eq("som(actor).sql sender rolle til runneren", (await a.sql("POS"), lib.forventning.obligations.size), 3);
  const chk = async (n, fn, needle) => { try { await fn(); bad(n, "afviste IKKE"); } catch (x) { x instanceof Afvist && new RegExp(needle).test(x.message) ? ok(n) : bad(n, `${x?.name}: ${x?.message}`); } };
  await chk("forvent.afvist: kaldet lykkedes → 'FORBUDT HANDLING TILLADT'", async () => lib.forvent.afvist(await a.sql("POS"), "K-1/ac-1/neg-1"), "FORBUDT HANDLING TILLADT");
  await chk("forvent.afvist: forkert sqlstate → Afvist", async () => lib.forvent.afvist(await a.sql("NEG_FORKERT_KODE"), "K-1/ac-1/neg-1"), "≠ kontraktens 22023");
  await chk("forvent.afvist: forkert afvisningssted → Afvist", async () => lib.forvent.afvist(await a.sql("NEG_FORKERT_STED"), "K-1/ac-1/neg-1"), "afvisningssted");
  eq("forvent.afvist: rigtig kode+grund+sted → ok", (lib.forvent.afvist(await a.sql("NEG"), "K-1/ac-1/neg-1")).code, "22023");
  await chk("forvent.afvist m. {id}-grund uden subst → Afvist (substitution kræves)", async () => lib.forvent.afvist(await a.sql("NEG_ID"), "K-7/ac-2/neg-2"), "substitution");
  eq("forvent.afvist m. subst {id} → ok", (lib.forvent.afvist(await a.sql("NEG_ID"), "K-7/ac-2/neg-2", { subst: { id: "11111111-1111-1111-1111-111111111111" } })).code, "22023");
  await chk("forvent.afvist m. forkert subst-uuid → Afvist", async () => lib.forvent.afvist(await a.sql("NEG_ID"), "K-7/ac-2/neg-2", { subst: { id: "22222222-2222-2222-2222-222222222222" } }), "grund");
  await chk("forvent.lig: protokolfejl (ingen rows) → Afvist m. 'protokol'", async () => lib.forvent.lig(undefined, { kind: "count", value: 1 }), "protokol");
  await chk("forvent.lig: mismatch → Afvist", async () => lib.forvent.lig([{ a: 1 }, { a: 2 }], { kind: "count", value: 1 }), "forventet 1");
  await chk("forvent.ok: afvist kald → Afvist", async () => lib.forvent.ok(await a.sql("NEG")), "blev afvist");
  await chk("som(actor).http uden http-runner → Afvist (transport mangler i måle-jobbet)", async () => a.http({ method: "POST", path: "/rpc/x" }), "runner.http mangler");
  await chk("runner leverer ikke {ok:boolean} → Afvist (protokol)", async () => makeLib({ runner: { sql: () => "hm" }, manifest: MANIFEST, pakke: "pk" }).ejer.sql("X"), "leverede ikke");
  let e2 = null; try { lib.som({ settings: {} }); } catch (x) { e2 = x.message; } eq("som() uden role → kast", /role/.test(e2 ?? ""), true); }
{ const http = async (req, actor) => ({ ok: false, code: "42501", detail: { message: "lokation_opret: permission_denied", routine: null }, http_status: 403, actor: actor.role }); const lib = makeLib({ runner: { ...mkRunner(), http }, manifest: MANIFEST, pakke: "pk" });
  const k = await lib.som({ role: "authenticated" }).http({ method: "POST", path: "/rpc/lokation_opret" }); eq("som(actor).http → runner.http(req, actor)", k.actor, "authenticated");
  eq("forvent.afvist via API: http_status 4xx + kode + grund → ok (sted ikke observerbart via API)", lib.forvent.afvist(k, rc("42501", "f.lokation_opret", "lokation_opret: permission_denied")).http_status, 403);
  let e = null; try { lib.forvent.afvist({ ...k, http_status: 200 }, rc("42501", "f.x", "lokation_opret: permission_denied")); } catch (x) { e = x.message; } eq("API-afvisning m. http_status 200 → Afvist", /http_status 200/.test(e ?? ""), true); }

console.log("\nlib — exec · session · ur (FA-3):");
{ const lib = makeLib({ runner: { ...mkRunner(), exec: async (cmd) => ({ exit_code: 1, stdout: "klasse=klassifikation\n", cmd }), session: (n) => ({ navn: n }) }, manifest: MANIFEST, pakke: "pk", ur: urFraMiljoe({}) });
  const r = await lib.exec(["node", "x.mjs"]); eq("lib.exec → runner.exec {exit_code, stdout}", r.exit_code === 1 && /klasse=/.test(r.stdout), true);
  eq("lib.session(name) → runner.session", lib.session("A").navn, "A");
  let e = null; try { lib.ur.saet("2026-04-01T00:00:00Z"); } catch (x) { e = x; } eq("ur uden V5_FAKETIME_FILE → Afvist (ærligt rød, ikke stiltiende)", e instanceof Afvist && /ur-driver ikke tilgængelig/.test(e.message), true); eq("ur.tilgaengelig false", lib.ur.tilgaengelig, false); }
{ const lib = makeLib({ runner: { ...mkRunner(), race: async () => ({ protocolOk: true, a: {}, b: {} }) }, manifest: MANIFEST, pakke: "pk" }); const r = await lib.race({}); eq("lib.race med den rigtige runners svar ({protocolOk} uden ok) → virker", r.protocolOk === true, true); }
{ const lib = makeLib({ runner: { ...mkRunner(), race: async () => ({ ok: true }) }, manifest: MANIFEST, pakke: "pk" }); let e = null; try { await lib.race({}); } catch (x) { e = x; } eq("lib.race uden protocolOk → Afvist", e instanceof Afvist && /protocolOk/.test(e.message), true); }
{ const lib = makeLib({ runner: mkRunner(), manifest: MANIFEST, pakke: "pk" }); let e = null; try { await lib.exec(["x"]); } catch (x) { e = x; } eq("lib.exec uden runner.exec → Afvist", e instanceof Afvist && /runner.exec mangler/.test(e.message), true); }
{ const file = join(ROOT, "faketime.txt"); const ur = urFraMiljoe({ V5_FAKETIME_FILE: file });
  eq("ur.saet skriver libfaketime-format @YYYY-MM-DD HH:MM:SS", ur.saet("2026-04-03T02:29:30Z"), "@2026-04-03 02:29:30"); eq("filen bærer stemplet", readFileSync(file, "utf8"), "@2026-04-03 02:29:30\n");
  eq("ur.frem(90) → +90 s", ur.frem(90), "@2026-04-03 02:31:00");
  let e = null; try { ur.saet("2026-04-01T00:00:00Z"); } catch (x) { e = x; } eq("bagud → Afvist (fremad-kun, P:33)", e instanceof Afvist && /fremad/.test(e.message), true);
  let e2 = null; try { ur.saet("ikke-en-tid"); } catch (x) { e2 = x.message; } eq("ugyldig ISO → kast", /ugyldig ISO/.test(e2 ?? ""), true);
  const ur2 = urFraMiljoe({ V5_FAKETIME_FILE: file }); let e3 = null; try { ur2.frem(10); } catch (x) { e3 = x; } eq("frem før saet → Afvist", e3 instanceof Afvist, true); }

console.log("\nrunTestSuite — rapport skema 3 + mutant-kill-protokol:");
{ const r = mkRunner(); const rep = await runTestSuite({ index: IDX(), indexOid: "a".repeat(40), runner: r, manifest: MANIFEST, root: ROOT, runId: "run-1" });
  eq("skema 3 · pakke · run_id · index_oid", rep.schema_version === 3 && rep.pakke === "pk" && rep.run_id === "run-1" && rep.index_oid === "a".repeat(40), true);
  eq("alle 3 tests ok m. fil + covers", rep.tests.length === 3 && rep.tests.every((t) => t.ok === true && Number.isInteger(t.ms) && t.detail === null) && rep.tests[2].file === F2, true);
  const m = rep.mutants[0]; eq("mutant dræbt: applied · target fejlede · control ok · restore ok · alle grønne igen", m.applied_ok === true && m.targets.length === 1 && m.targets[0].failed === true && /FORBUDT HANDLING TILLADT/.test(m.targets[0].detail) && m.controls[0].ok === true && m.restore_ok === true && m.restored.length === 2 && m.restored.every((x) => x.ok) && m.killed === true, true);
  eq("summary genudledt", JSON.stringify(rep.summary), JSON.stringify({ tests: 3, bestaaet: 3, fejlet: 0, mutanter: 1, draebt: 1 }));
  eq("summarizeReport er ren", JSON.stringify(summarizeReport(rep)), JSON.stringify(rep.summary));
  const order = r.st.calls.map((c) => c[0]).filter((c) => /^M_/.test(c)).join("|"); eq("apply før restore", order, "M_NAVN_OFF|M_NAVN_ON");
  eq("state genoprettet efter mutant-loop", r.st.navn, true); }
{ const rep = await runTestSuite({ index: IDX(), runner: mkRunner({ mutable: false }), manifest: MANIFEST, root: ROOT, runId: "run-2" });
  const m = rep.mutants[0]; eq("mutation uden effekt (target overlever) → applied men IKKE dræbt", m.applied_ok === true && m.targets[0].failed === false && m.killed === false, true); eq("summary: draebt 0", rep.summary.draebt, 0); }
{ const rep = await runTestSuite({ index: IDX(), runner: mkRunner({ applyOk: false }), manifest: MANIFEST, root: ROOT, runId: "run-3" });
  const m = rep.mutants[0]; eq("apply fejler → applied_ok false, ingen targets kørt, restore stadig forsøgt, ikke dræbt", m.applied_ok === false && m.targets.length === 0 && /apply fejlede/.test(m.detail) && m.restore_ok === true && m.killed === false, true); }
{ const rep = await runTestSuite({ index: IDX(), runner: mkRunner({ restoreOk: false }), manifest: MANIFEST, root: ROOT, runId: "run-4" });
  const m = rep.mutants[0]; eq("restore fejler → restore_ok false, ingen restored-kørsel, ikke dræbt (store er beskidt)", m.restore_ok === false && m.restored.length === 0 && m.killed === false, true); }
{ const rep = await runTestSuite({ index: IDX(), runner: mkRunner({ audit: false }), manifest: MANIFEST, root: ROOT, runId: "run-5" });
  const t = rep.tests.find((x) => x.id === "t-k1-audit"); eq("vidne udebliver → testen FEJLER m. detail", t.ok === false && /audit-row/.test(t.detail) && /forventet 1/.test(t.detail), true); eq("summary: fejlet 1", rep.summary.fejlet, 1); }
{ const F5 = "scripts/v5/pk/tests/kaster.test.mjs"; put(F5, "export const tests = [{ id: 't-kast', covers: ['K-1/ac-3:FS'], run: async () => { throw new TypeError('bug i testen'); } }, { id: 't-hang', covers: ['K-1/ac-3:FS'], run: () => new Promise(() => {}) }];\n");
  const i = IDX(); i.tests.push({ id: "t-kast", file: F5, oid: oidOf(F5), covers: ["K-1/ac-3:FS"] }, { id: "t-hang", file: F5, oid: oidOf(F5), covers: ["K-1/ac-3:FS"] });
  const rep = await runTestSuite({ index: i, runner: mkRunner(), manifest: MANIFEST, root: ROOT, runId: "run-6", timeoutMs: 50 });
  eq("test der kaster en ikke-Afvist → ok:false mærket (exception)", rep.tests.find((x) => x.id === "t-kast").detail, "(exception) bug i testen");
  eq("test der hænger → ok:false m. timeout", /timeout 50 ms/.test(rep.tests.find((x) => x.id === "t-hang").detail), true); }
console.log("\nbinding covers ↔ håndhævelse (Mathias 2026-09-21: sandhed = krav = plan = byg):");
{ const F6 = "scripts/v5/pk/tests/binding.test.mjs"; put(F6, `export const tests = [
  { id: "t-vakuum", covers: ["K-1/ac-3:FS"], run: async (lib) => { await lib.ejer.sql("OBS"); } },
  { id: "t-neg-uden-afvist", covers: ["K-1/ac-1:UT", "K-1/ac-1/neg-1"], run: async (lib) => { lib.forvent.ok(await lib.som({ role: "app_role" }).sql("POS")); } },
  { id: "t-neg-via-kontrakt", covers: ["K-1/ac-1/neg-1"], run: async (lib) => { lib.forvent.afvist(await lib.som({ role: "app_role" }).sql("NEG"), lib.kontrakt("K-1/ac-1/neg-1")); } },
  { id: "t-neg-fremmed-kontrakt", covers: ["K-1/ac-1/neg-1"], run: async (lib) => { lib.forvent.afvist(await lib.som({ role: "app_role" }).sql("NEG"), { kanal: "sqlstate", sqlstate: "22023", grund: "navn_blank", afvisningssted: "f.lokation_opret" }); } },
];
`);
  const i = IDX(); i.tests.push({ id: "t-vakuum", file: F6, oid: oidOf(F6), covers: ["K-1/ac-3:FS"] }, { id: "t-neg-uden-afvist", file: F6, oid: oidOf(F6), covers: ["K-1/ac-1:UT", "K-1/ac-1/neg-1"] }, { id: "t-neg-via-kontrakt", file: F6, oid: oidOf(F6), covers: ["K-1/ac-1/neg-1"] }, { id: "t-neg-fremmed-kontrakt", file: F6, oid: oidOf(F6), covers: ["K-1/ac-1/neg-1"] });
  const rep = await runTestSuite({ index: i, runner: mkRunner(), manifest: MANIFEST, root: ROOT, runId: "run-7" }); const T = (id) => rep.tests.find((t) => t.id === id);
  eq("test uden forventning → RØD 'VAKUUM' (dækker intet)", T("t-vakuum").ok === false && /VAKUUM/.test(T("t-vakuum").detail), true);
  eq("test der dækker et negativ uden forvent.afvist(…, negativet) → RØD (binding)", T("t-neg-uden-afvist").ok === false && /uden at håndhæve dets kontrakt/.test(T("t-neg-uden-afvist").detail), true);
  eq("forvent.afvist m. lib.kontrakt(nid) tæller som håndhævelse af nid → grøn", T("t-neg-via-kontrakt").ok, true);
  eq("forvent.afvist m. fremmed kontrakt-objekt (ikke fra lib.kontrakt) håndhæver IKKE negativet → RØD", T("t-neg-fremmed-kontrakt").ok === false && /uden at håndhæve/.test(T("t-neg-fremmed-kontrakt").detail), true);
  eq("de oprindelige tests stadig grønne (sporet nulstilles pr. test)", ["t-k1-neg", "t-k1-audit", "t-k1-fs"].every((id) => T(id).ok === true), true);
  eq("mutant-loopet: target (der fejler under mutanten) tæller stadig som kill", rep.mutants[0].killed, true); }
await throwsWith("runTestSuite m. ændret testfil → kast (ingen rapport)", () => { const i = IDX(); i.tests[0].oid = "e".repeat(40); return runTestSuite({ index: i, runner: mkRunner(), manifest: MANIFEST, root: ROOT, runId: "x" }); }, "ikke den frosne");

console.log("");
if (failed) { console.error(`test-runner: ${failed} FEJLEDE (${passed} ok)`); process.exit(1); }
console.log(`test-runner red-team: alle ${passed} cases passed`);
