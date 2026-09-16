#!/usr/bin/env node
// haerdet-register.selftest.mjs — hærdet-registrets dommer (plan 2.A/2.C + DEL VI).
//
// Reglen (Mathias 2026-09-03, "u-hærdet gate-transport må ikke gå i drift"):
// HVERT modul gate-dommen afhænger af — transitiv import fra gate-entrypoints
// + producenter af gatede artefakter — SKAL have en entry i
// haerdet-register.json med (a) pas_ref (Codex-P2-pas-commit) og (b) blob_oid
// der matcher modulets NUVÆRENDE indhold. Ændret modul uden nyt pas → RØD i CI.
// Blob-binding kræver ingen git-historik (CI depth-1-sikkert: hash-object).
//
// KANDIDAT-TILSTAND (fabrik-beslutning 2026-09-15, plan DEL VIII pkt. 36 + vejnings-skæring: »lokal = candidate, CI = autoritet«):
// en entry kan være { status: "kandidat", blob_oid, pas_afventer, kandidat_siden } — modulet er blob-bundet og i kandidat-drift, men
// har endnu ikke Codex-P2-pas. Med STORK_V5_KANDIDAT_OK=1 (lokal drift · CI's selftest-job) tæller den som ⚠ kandidat, ikke rød;
// UDEN (autoritets-tilstand: CI's register-job · C4's gate-dommer) er den RØD. Ændret indhold er ALTID rødt, også for kandidater.
// Grunden: registret må ikke blokere overdragelse af kandidat-mekanik i dagevis mens Codex' runder løber — autoriteten ligger i CI.

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");

// gate-entrypoints: filerne hvis dom åbner/lukker en gate. Udvides når
// build-/chain-gatens transport bygges (behov-drevet, aldrig i drift u-hærdet).
const GATE_ENTRYPOINTS = ["recon-gate-run.mjs", "krav-gate-run.mjs", "plan-gate-run.mjs", "gate-eval.mjs", "ci-gate-dom.mjs", "ci-build-dom.mjs"];   // ci-gate-dom = C4 CI-dommer (v5/gate/recon|krav|plan) · ci-build-dom = C4b build-dommer m. produktionsrunner (v5/gate/build)
// producenter af gatede artefakter (ikke i import-closuret, men deres output
// er det gaten dømmer på):
const ARTEFAKT_PRODUCENTER = ["consolidate-recon.mjs", "verdikt-byg.mjs", "codex-run.sh"];

let pass = 0, fail = 0, kandidater = 0;
const ok = (n) => { pass++; console.log(`  ✓ ${n}`); };
const bad = (n, r) => { fail++; console.error(`  ✗ ${n}: ${r}`); };
const KANDIDAT_OK = process.env.STORK_V5_KANDIDAT_OK === "1";
const kandidat = (n, r) => { kandidater++; if (KANDIDAT_OK) console.log(`  ⚠ ${n}: KANDIDAT — ${r}`); else bad(n, `KANDIDAT (${r}) — ikke autoritativ; autoritets-tilstand kræver Codex-pas`); };

// transitiv import-closure (kun lokale ./x.mjs-imports)
const closure = new Set(ARTEFAKT_PRODUCENTER);
const queue = [...GATE_ENTRYPOINTS];
while (queue.length) {
  const f = queue.pop();
  if (closure.has(f)) continue;
  closure.add(f);
  if (f.endsWith(".mjs")) {
    const src = readFileSync(join(HERE, f), "utf8");
    // alle import-skrivemåder: import ... from "./x.mjs" · import("./x.mjs") · export ... from "./x.mjs"
    for (const m of src.matchAll(/from\s+"\.\/([a-z0-9-]+\.mjs)"|import\("\.\/([a-z0-9-]+\.mjs)"\)/g)) {
      const dep = m[1] ?? m[2];
      if (dep && !closure.has(dep)) queue.push(dep);
    }
  }
}

const register = JSON.parse(readFileSync(join(HERE, "haerdet-register.json"), "utf8"));
const isHex40 = (s) => typeof s === "string" && /^[0-9a-f]{40}$/.test(s);
const hashObject = (f) =>
  execFileSync("git", ["-C", ROOT, "hash-object", join("scripts/v5", f)], { encoding: "utf8" }).trim();

console.log(`gate-afhængige moduler (${closure.size}): ${[...closure].sort().join(" · ")}`);
for (const f of [...closure].sort()) {
  const e = register[f];
  if (!e) { bad(f, "MANGLER i hærdet-registret (u-hærdet gate-afhængigt modul — CI rød)"); continue; }
  if (!existsSync(join(HERE, f))) { bad(f, "register-entry for fil der ikke findes"); continue; }
  if (e.status === "kandidat") {
    if (!isHex40(e.blob_oid) || typeof e.pas_afventer !== "string" || !e.pas_afventer || !/^\d{4}-\d{2}-\d{2}$/.test(String(e.kandidat_siden))) { bad(f, "kandidat-entry malformet (kræver blob_oid · pas_afventer · kandidat_siden YYYY-MM-DD)"); continue; }
    const nuK = hashObject(f);
    if (nuK !== e.blob_oid) { bad(f, `kandidat-entry ÆNDRET siden registrering: ${e.blob_oid.slice(0, 12)} ≠ nuværende ${nuK.slice(0, 12)} — også kandidater er blob-bundne`); continue; }
    kandidat(f, `blob bundet (${e.blob_oid.slice(0, 12)}), pas afventer: ${e.pas_afventer} (siden ${e.kandidat_siden})`);
    continue;
  }
  if (!isHex40(e.pas_ref)) { bad(f, `pas_ref er ikke en commit-OID: ${String(e.pas_ref)}`); continue; }
  const nu = hashObject(f);
  nu === e.blob_oid
    ? ok(`${f} — blob matcher pas (${e.pas_ref.slice(0, 7)})`)
    : bad(f, `ÆNDRET siden Codex-pas (${e.pas_ref.slice(0, 7)}): registreret ${e.blob_oid.slice(0, 12)} ≠ nuværende ${nu.slice(0, 12)} — kræver nyt pas + register-opdatering`);
}
// register-entries for ukendte filer = drift i registret selv
for (const f of Object.keys(register))
  if (!closure.has(f) && !existsSync(join(HERE, f)))
    bad(f, "register-entry uden tilhørende fil (stale register)");

console.log("");
if (fail > 0) {
  console.error(`haerdet-register: ${fail} FEJLEDE${kandidater && !KANDIDAT_OK ? ` (heraf ${kandidater} kandidat(er) — sæt STORK_V5_KANDIDAT_OK=1 for kandidat-drift; autoritet kræver Codex-pas)` : ""}`);
  process.exit(1);
}
console.log(kandidater ? `haerdet-register: ${pass} moduler pas-bundne · ${kandidater} KANDIDAT(ER) i drift uden pas (ikke autoritativt — CI's autoritets-job er rødt indtil Codex-pas)` : `haerdet-register: alle ${pass} moduler pas-bundne`);
