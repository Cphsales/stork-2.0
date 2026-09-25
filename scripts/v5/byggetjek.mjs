#!/usr/bin/env node
// byggetjek.mjs — byggetjekket og slutdommen (disciplin.md §2 trin 3-4, §6).
//
// For den åbne pakke (launch/launch.json):
//   (d) bindinger: kravet er det `krav ok` bandt · ½-siden er den `plan ok` bandt · planen er den
//       Codex' plan-dom (codex-plan.md) bandt · kørselsfladen er den dækningsdommen bandt, blob for blob
//   (c) intet låst ændret — følger af (d)
//   (a) testene grønne · (b) de udpegede mutanter dræbt — for den åbne pakke og alle lukkede pakker
//   slutdom: slutprøven (slutproeve.json) grøn
// Uden domme for den åbne pakke er den »ikke nået«: kun de lukkede pakkers regressionstests køres.
//
// Brug:
//   node scripts/v5/byggetjek.mjs --pg env --rapport <fil>        (CI: frisk testdatabase fra PG*-miljøet)
//   node scripts/v5/byggetjek.mjs --kun-bindinger                   (ingen database; kun (d))
//   node scripts/v5/byggetjek.mjs --pg env --kun-migrationer        (kun testdatabasens opstart og migrationer, fx til db:test)
//   … --base <ref>   en PR der ændrer pakke-kode kræver grønt byggetjek + `slut ok` + kun afslutningsfiler efter prøven
// Exit 0 = grøn eller ikke nået (se rapporten) · exit 1 = rød.

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { raekker } from "./sandhed-vagt.mjs";

export const FRISK_STORE_BOOTSTRAP = "insert into auth.users (id, email, aud, role) values ('6d034bba-84ec-48ad-a94e-219aa5755b88','bootstrap-1@test.invalid','authenticated','authenticated'), ('735dca62-808c-4389-b038-9242313c4a20','bootstrap-2@test.invalid','authenticated','authenticated') on conflict (id) do nothing;";
// én oprydnings-migration kræver data fra driften og har ingen effekt på en tom database; undtagelsen gælder kun præcis denne blob
export const FRISK_STORE_UNDTAGELSER = Object.freeze([{ path: "supabase/migrations/20260516200000_h024_test_artifact_cleanup.sql", blob: "b076fbc6b7a969aa4cb2e838e31653efc225f2d2" }]);

const LEDGER_STIER = ["docs/sandhed/mathias-ord.md", "plan-build/lokations-skabelon/mathias-ord.md"];
const HEX = /^[0-9a-f]{8,40}$/;

export function halvside(planTekst) {
  const linjer = String(planTekst).split("\n");
  const i = linjer.findIndex((l) => /^## Mathias' ½ side\s*$/.test(l));
  if (i < 0) return null;
  let j = linjer.findIndex((l, k) => k > i && /^## /.test(l));
  if (j < 0) j = linjer.length;
  return linjer.slice(i, j).join("\n").trim();
}
export const sha256 = (s) => createHash("sha256").update(s, "utf8").digest("hex");

// godkendt(rækker, ord, krav) → true når en række med ordet (fx »krav ok«) nævner alle krav-strenge i »Svar på / godkender«
const godkendt = (r, ord, krav) => r.some((x) => new RegExp(`^»\\s*${ord}\\b`, "i").test(x.ord) && krav.every((k) => x.maal.includes(k)));
const har8 = (maal, oid) => maal.includes(oid.slice(0, 8));

// bindinger({pakke, blob, tekst, findes, ledger}) → { status: "ikke nået"|"grøn"|"rød", fejl: [] }
export function bindinger({ pakke, blob, tekst, findes, ledger }) {
  const P = `plan-build/${pakke}`;
  const r = raekker(ledger);
  const fejl = [];
  const krav = `docs/sandhed/krav/${pakke}-krav.md`;
  if (!findes(`${P}/daekningsdom.json`)) return { status: "ikke nået", fejl: ["ingen dækningsdom endnu"] };
  // kravet mod krav ok
  if (!findes(krav)) fejl.push(`${krav} findes ikke`);
  else if (!r.some((x) => /^»\s*krav ok\b/i.test(x.ord) && har8(x.maal, blob(krav)))) fejl.push(`kravet (blob ${blob(krav).slice(0, 12)}) har intet \`krav ok\` i ledgeren`);
  // ½-siden mod plan ok
  const plan = `${P}/plan.md`;
  if (!findes(plan)) fejl.push(`${plan} findes ikke`);
  else {
    const hs = halvside(tekst(plan));
    if (!hs) fejl.push("planen har intet afsnit »## Mathias' ½ side«");
    else if (!godkendt(r, "plan ok", [`½-side → sha256 ${sha256(hs).slice(0, 12)}`])) fejl.push(`½-siden (sha256 ${sha256(hs).slice(0, 12)}) har intet \`plan ok\` i ledgeren`);
    // planen mod Codex' plan-dom
    const cp = `${P}/codex-plan.md`;
    if (!findes(cp)) fejl.push("Codex' plan-dom (codex-plan.md) mangler");
    else {
      const t = tekst(cp);
      if (!/^dom: grøn\s*$/m.test(t)) fejl.push("Codex' plan-dom er ikke grøn");
      if (!t.includes(`plan.md → blob ${blob(plan).slice(0, 12)}`)) fejl.push(`Codex' plan-dom gælder ikke den nuværende plan (blob ${blob(plan).slice(0, 12)})`);
    }
  }
  // kørselsfladen mod dækningsdommen
  let d; try { d = JSON.parse(tekst(`${P}/daekningsdom.json`)); } catch { fejl.push("daekningsdom.json er ikke gyldig JSON"); d = null; }
  if (d) {
    if (d.dom !== "grøn") fejl.push("dækningsdommen er ikke grøn");
    if (findes(krav) && d.krav !== blob(krav)) fejl.push("dækningsdommen gælder et andet krav");
    if (findes(plan) && d.plan !== blob(plan)) fejl.push("dækningsdommen gælder en anden plan");
    const filer = d.filer && typeof d.filer === "object" ? d.filer : {};
    for (const nødvendig of ["forventnings-manifest.json", "angrebs-spec.json", "prover.json"]) if (!filer[`${P}/${nødvendig}`]) fejl.push(`dækningsdommen binder ikke ${P}/${nødvendig}`);
    for (const [sti, oid] of Object.entries(filer)) {
      if (!findes(sti)) fejl.push(`låst fil mangler: ${sti}`);
      else if (blob(sti) !== oid) fejl.push(`låst fil ændret efter dækningsdommen: ${sti}`);
    }
  }
  return { status: fejl.length ? "rød" : "grøn", fejl };
}

const PRODUKT_RE = /^(supabase\/migrations|supabase\/functions|apps|packages)\//;
export const erPakkePr = (stier) => stier.some((p) => PRODUKT_RE.test(p));

// mergeKontrol({pakke, ledger, blob, aendretSiden, ledgerSletninger}) → fejl[]
// Efter `slut ok` må kun afslutningsfilerne ændres (disciplin.md §2 trin 4 punkt 1-4).
export function mergeKontrol({ pakke, ledger, blob, aendretSiden, ledgerSletninger, tekst }) {
  const P = `plan-build/${pakke}`;
  const fejl = [];
  const slut = raekker(ledger).filter((x) => /^»\s*slut ok\b/i.test(x.ord) && x.maal.includes("slut-rapport.md"));
  if (!slut.length) return [`ledgeren har intet \`slut ok\` for ${pakke}'s slut-rapport`];
  const maal = slut[slut.length - 1].maal;
  const rapportOid = (maal.match(/slut-rapport\.md → blob ([0-9a-f]{8,40})/) ?? [])[1];
  const commit = (maal.match(/commit ([0-9a-f]{7,40})/) ?? [])[1];
  if (!rapportOid || !commit) return ["`slut ok`-rækken skal nævne »slut-rapport.md → blob …« og »commit …«"];
  if (!blob(`${P}/slut-rapport.md`).startsWith(rapportOid)) fejl.push("slut-rapporten er ændret efter `slut ok`");
  const dok = [...maal.matchAll(/([A-Za-z0-9_./-]+\.md) → blob ([0-9a-f]{8,40})/g)].filter(([, f]) => f !== "slut-rapport.md");
  const tilladt = new Set([`${P}/slut-rapport.md`, `${P}/codex-gennemgang.md`, ...LEDGER_STIER]);
  const aendret = aendretSiden(commit);
  if (aendret === null) return [`det prøvede commit ${commit} findes ikke`];
  for (const sti of aendret) {
    if (tilladt.has(sti)) continue;
    const d = dok.find(([, f]) => sti.endsWith("/" + f) || sti === f);
    if (d && blob(sti).startsWith(d[2])) continue;
    fejl.push(`${sti} er ændret efter den prøvede version (commit ${commit}) og er ikke en afslutningsfil`);
  }
  if (ledgerSletninger(commit) > 0) fejl.push("ledgeren har fået ændret eller slettet rækker efter `slut ok`");
  if (aendret.includes(`${P}/codex-gennemgang.md`) && !tekst(`${P}/codex-gennemgang.md`).includes(commit)) fejl.push("Codex' gennemgang nævner ikke det prøvede commit");
  return fejl;
}

// pakker med målelag = mapper i plan-build/ med angrebs-spec.json
export function pakkerMedMaalelag(root) {
  if (!existsSync(join(root, "plan-build"))) return [];
  return readdirSync(join(root, "plan-build")).filter((p) => existsSync(join(root, "plan-build", p, "angrebs-spec.json"))).sort();
}

async function koerDatabase({ root, argv, rapport, pakker, kunMigrationer = false }) {
  const { makePgRunner } = await import("./pg-runner.mjs");
  const { runTestSuite } = await import("./test-runner.mjs");
  const http = process.env.V5_PGRST_URL ? { baseUrl: process.env.V5_PGRST_URL, jwtSecret: process.env.V5_PGRST_JWT_SECRET ?? "", defaultSchema: process.env.V5_PGRST_SCHEMA || null } : null;
  const runner = makePgRunner({ argv, http });
  const git = (a) => execFileSync("git", ["-C", root, ...a], { encoding: "utf8" });
  const b = await runner.sql(FRISK_STORE_BOOTSTRAP, {});
  if (!b.ok) return { ok: false, fejl: [`testdatabasens opstart fejlede: ${b.error}`] };
  const migs = readdirSync(join(root, "supabase/migrations")).filter((f) => f.endsWith(".sql")).sort();
  for (const f of migs) {
    const p = `supabase/migrations/${f}`;
    const u = FRISK_STORE_UNDTAGELSER.find((x) => x.path === p);
    if (u) { if (git(["hash-object", p]).trim() !== u.blob) return { ok: false, fejl: [`${p} er ændret; undtagelsen gælder kun blob ${u.blob.slice(0, 8)}`] }; continue; }
    const r = await runner.sql(readFileSync(join(root, p), "utf8"), {});
    if (!r.ok) return { ok: false, fejl: [`migration ${p} fejlede: ${r.error}`] };
  }
  if (http) { try { await runner.sql("notify pgrst, 'reload schema';", {}); } catch {} }
  if (kunMigrationer) return { ok: true, fejl: [], pakker: {} };
  // testene kører som brugernes roller; de må ikke kunne omgå rettighederne
  const by = await runner.sql("select rolname from pg_roles where rolname in ('authenticated','anon') and rolbypassrls", {});
  if (!by.ok) return { ok: false, fejl: [`kan ikke tjekke testrollerne: ${by.error}`] };
  if (by.rows.length) return { ok: false, fejl: [`testrolle kan omgå rettighederne: ${by.rows.map((x) => x.rolname).join(", ")}`] };
  const ud = { ok: true, fejl: [], pakker: {} };
  for (const pakke of pakker) {
    const P = `plan-build/${pakke}`;
    const manifest = JSON.parse(readFileSync(join(root, P, "forventnings-manifest.json"), "utf8"));
    const suiter = [["test", "angrebs-spec.json"], ["slutprøve", "slutproeve.json"]].filter(([, f]) => existsSync(join(root, P, f)));
    ud.pakker[pakke] = {};
    for (const [navn, fil] of suiter) {
      const index = JSON.parse(readFileSync(join(root, P, fil), "utf8"));
      const res = await runTestSuite({ index, indexOid: git(["hash-object", `${P}/${fil}`]).trim(), runner, manifest, root, runId: `byggetjek-${pakke}-${navn}` });
      const alleOk = res.tests.every((t) => t.ok === true) && res.mutants.every((m) => m.killed === true);
      ud.pakker[pakke][navn] = res.summary;
      if (!alleOk) { ud.ok = false; ud.fejl.push(`${pakke}: ${navn} ikke grøn (${JSON.stringify(res.summary)})`); }
    }
    // testvalg-filen: kun pakkens egen prover-run.mjs må køres
    if (existsSync(join(root, P, "prover.json"))) {
      const pj = JSON.parse(readFileSync(join(root, P, "prover.json"), "utf8"));
      const tilladt = ["node", `scripts/v5/${pakke}/prover-run.mjs`];
      if (JSON.stringify(pj.cmd) !== JSON.stringify(tilladt)) { ud.ok = false; ud.fejl.push(`${pakke}: prover.json må kun køre ${tilladt.join(" ")}`); continue; }
      const { producentMiljoe } = await import("./pg-runner.mjs");
      const k = spawnSync(tilladt[0], tilladt.slice(1), { cwd: root, encoding: "utf8", env: producentMiljoe(process.env), timeout: 600000 });
      let res = null; try { res = JSON.parse(readFileSync(join(root, pj.resultRelPath), "utf8")); } catch {}
      ud.pakker[pakke].prover = res;
      if (k.status !== 0 || !res || res.failed !== 0 || !(res.total >= 1)) { ud.ok = false; ud.fejl.push(`${pakke}: prover-kørslen ikke grøn (rc ${k.status}, ${JSON.stringify(res)})`); }
    }
  }
  if (rapport) writeFileSync(rapport, JSON.stringify(ud, null, 1) + "\n");
  return ud;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  const root = process.env.STORK_V5_REPO ?? process.cwd();
  const git = (a) => execFileSync("git", ["-C", root, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const findes = (p) => existsSync(join(root, p));
  const blob = (p) => git(["hash-object", p]).trim();
  const tekst = (p) => readFileSync(join(root, p), "utf8");
  const ledger = LEDGER_STIER.filter(findes).map(tekst).join("\n");
  let pakke = null; try { pakke = JSON.parse(tekst("launch/launch.json")).pakke ?? null; } catch {}
  const b = pakke ? bindinger({ pakke, blob, tekst, findes, ledger }) : { status: "ingen åben pakke", fejl: [] };
  console.log(`byggetjek: åben pakke ${pakke ?? "(ingen)"} → bindinger ${b.status}${b.fejl.length ? ": " + b.fejl.join(" · ") : ""}`);
  let db = { ok: true, fejl: [] };
  if (!process.argv.includes("--kun-bindinger")) {
    const pg = arg("--pg") ?? "env";
    const argv = pg === "env" ? ["psql", "-X"] : JSON.parse(pg);
    // den åbne pakke køres først, når dens bindinger er grønne; lukkede pakker køres altid (regression)
    const pakker = pakkerMedMaalelag(root).filter((p) => p !== pakke || b.status === "grøn");
    db = await koerDatabase({ root, argv, rapport: arg("--rapport"), pakker, kunMigrationer: process.argv.includes("--kun-migrationer") });
    console.log(`byggetjek: tests og slutprøve ${db.ok ? "grønne" : "RØDE: " + db.fejl.join(" · ")}`);
  }
  let status = b.status === "rød" || !db.ok ? "rød" : b.status === "grøn" ? "grøn" : "ikke nået";
  const base = arg("--base");
  if (base) {
    const stier = git(["diff", "--name-only", `${base}...HEAD`]).split("\n").filter(Boolean);
    if (erPakkePr(stier)) {
      const mk = pakke ? mergeKontrol({ pakke, ledger, blob, tekst,
        aendretSiden: (c) => { try { return git(["diff", "--name-only", `${c}`, "HEAD"]).split("\n").filter(Boolean); } catch { return null; } },
        ledgerSletninger: (c) => LEDGER_STIER.reduce((n, p) => { try { const x = git(["diff", "--numstat", c, "HEAD", "--", p]).trim().split(/\s+/); return n + (Number(x[1]) || 0); } catch { return n; } }, 0) }) : ["pakke-kode ændret, men ingen åben pakke i launch/launch.json"];
      if (status !== "grøn") mk.unshift(`en pakke-PR kræver et grønt byggetjek (status: ${status})`);
      console.log(`byggetjek: pakke-PR → ${mk.length ? "AFVIST: " + mk.join(" · ") : "slut ok og afslutningsfiler i orden"}`);
      if (mk.length) status = "rød";
    }
  }
  console.log(`byggetjek: ${status}`);
  if (process.env.GITHUB_OUTPUT) writeFileSync(process.env.GITHUB_OUTPUT, `status=${status}\n`, { flag: "a" });
  process.exit(status === "rød" ? 1 : 0);
}
