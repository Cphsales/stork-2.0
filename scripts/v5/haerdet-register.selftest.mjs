#!/usr/bin/env node
// haerdet-register.selftest.mjs — hærdet-registrets dommer (plan 2.A/2.C + DEL VI).
//
// Reglen (Mathias 2026-09-03, "u-hærdet gate-transport må ikke gå i drift"):
// HVERT modul gate-dommen afhænger af — transitiv import fra gate-entrypoints
// + producenter af gatede artefakter — SKAL have en entry i
// haerdet-register.json med (a) pas_ref (Codex-P2-pas-commit) og (b) blob_oid
// der matcher modulets NUVÆRENDE indhold. Ændret modul uden nyt pas → RØD i CI.
// Blob-binding kræver ingen git-historik (CI depth-1-sikkert: hash-object).

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");

// gate-entrypoints: filerne hvis dom åbner/lukker en gate. Udvides når
// build-/chain-gatens transport bygges (behov-drevet, aldrig i drift u-hærdet).
const GATE_ENTRYPOINTS = ["recon-gate-run.mjs", "gate-eval.mjs"];
// producenter af gatede artefakter (ikke i import-closuret, men deres output
// er det gaten dømmer på):
const ARTEFAKT_PRODUCENTER = ["consolidate-recon.mjs"];

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log(`  ✓ ${n}`); };
const bad = (n, r) => { fail++; console.error(`  ✗ ${n}: ${r}`); };

// transitiv import-closure (kun lokale ./x.mjs-imports)
const closure = new Set(ARTEFAKT_PRODUCENTER);
const queue = [...GATE_ENTRYPOINTS];
while (queue.length) {
  const f = queue.pop();
  if (closure.has(f)) continue;
  closure.add(f);
  const src = readFileSync(join(HERE, f), "utf8");
  for (const m of src.matchAll(/from "\.\/([a-z0-9-]+\.mjs)"/g)) if (!closure.has(m[1])) queue.push(m[1]);
}

const register = JSON.parse(readFileSync(join(HERE, "haerdet-register.json"), "utf8"));
const isHex40 = (s) => typeof s === "string" && /^[0-9a-f]{40}$/.test(s);
const hashObject = (f) =>
  execFileSync("git", ["-C", ROOT, "hash-object", join("scripts/v5", f)], { encoding: "utf8" }).trim();

console.log(`gate-afhængige moduler (${closure.size}): ${[...closure].sort().join(" · ")}`);
for (const f of [...closure].sort()) {
  const e = register[f];
  if (!e) { bad(f, "MANGLER i hærdet-registret (u-hærdet gate-afhængigt modul — CI rød)"); continue; }
  if (!isHex40(e.pas_ref)) { bad(f, `pas_ref er ikke en commit-OID: ${String(e.pas_ref)}`); continue; }
  if (!existsSync(join(HERE, f))) { bad(f, "register-entry for fil der ikke findes"); continue; }
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
  console.error(`haerdet-register: ${fail} FEJLEDE`);
  process.exit(1);
}
console.log(`haerdet-register: alle ${pass} moduler pas-bundne`);
