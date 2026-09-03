#!/usr/bin/env node
// pre-commit-zone.mjs — commit-zone-hook (plan 2.E, A4 — lokal UX, exit 2).
//
// Kaldes fra .husky/pre-commit. Session-rollen deklareres pr. session:
//   STORK_V5_ROLLE=fabrik|claude-ai|builder-code|codex|recon-*
// kravUpload-mandatet (kun driver-flytten) deklareres:
//   STORK_V5_KRAV_UPLOAD="<pakke>:<udkast-blob-oid>"
//
// Fail-closed-graduering (bevidst): ER rollen sat → fuld zone-håndhævelse.
// Er rollen IKKE sat → deny KUN commits der rører de beskyttede zoner
// (docs/sandhed + måle-laget); alm. commits får en advarsel. Det beskytter
// zonerne uden at brick'e Mathias' egne/manuelle commits — platform-autoriteten
// er stadig rulesets (DEL V), dette er friktion ved kilden.

import { execFileSync } from "node:child_process";
import { commitZoneDecision, pathZone } from "./hooks.mjs";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const staged = execFileSync("git", ["-C", repoRoot, "diff", "--cached", "--name-only"], { encoding: "utf8" })
  .split("\n")
  .filter((l) => l.length > 0);

if (staged.length === 0) process.exit(0);

const rolle = process.env.STORK_V5_ROLLE;
let kravUpload;
const mandat = process.env.STORK_V5_KRAV_UPLOAD;
if (typeof mandat === "string" && mandat.includes(":")) {
  const i = mandat.indexOf(":");
  kravUpload = { pakke: mandat.slice(0, i), udkastBlobOid: mandat.slice(i + 1) };
}

if (rolle === undefined || rolle === "") {
  const beskyttede = staged.filter((p) => {
    const z = pathZone(p, repoRoot);
    return z === "sandhed" || z === "maale-lag";
  });
  if (beskyttede.length > 0) {
    console.error(`✗ commit-zone: rolle ikke sat (STORK_V5_ROLLE) og commit rører beskyttede zoner:`);
    for (const p of beskyttede.slice(0, 10)) console.error(`    ${p}`);
    console.error(`  Sæt rollen for sessionen, fx: export STORK_V5_ROLLE=fabrik`);
    process.exit(2);
  }
  console.error("⚠ commit-zone: STORK_V5_ROLLE ikke sat — kun beskyttede zoner håndhæves for denne commit");
  process.exit(0);
}

const r = commitZoneDecision({ rolle, paths: staged, repoRoot, kravUpload });
if (r.decision !== "allow") {
  console.error(`✗ commit-zone (rolle '${rolle}'): ${r.reason}`);
  console.error(`  (git add -A på tværs af zoner er præcis fejlen denne hook forbygger — stage kun din zone)`);
  process.exit(2);
}
process.exit(0);
