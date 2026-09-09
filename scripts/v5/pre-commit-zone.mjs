#!/usr/bin/env node
// pre-commit-zone.mjs — commit-zone-hook (plan 2.E, A4 — lokal UX, exit 2).
//
// Kaldes fra .husky/pre-commit. Session-rollen deklareres pr. session:
//   STORK_V5_ROLLE=fabrik|claude-ai|builder-code|codex|recon-*
// kravUpload-mandatet (kun driver-flytten) deklareres:
//   STORK_V5_KRAV_UPLOAD="<pakke>:<udkast-blob-oid>:<audit-blob-oid>"  (B1: fresh-eyes-audit påkrævet)
//
// Fail-closed-graduering (bevidst): ER rollen sat → fuld zone-håndhævelse.
// Er rollen IKKE sat → deny KUN commits der rører de beskyttede zoner
// (docs/sandhed + måle-laget); alm. commits får en advarsel. Det beskytter
// zonerne uden at brick'e Mathias' egne/manuelle commits — platform-autoriteten
// er stadig rulesets (DEL V), dette er friktion ved kilden.

import { execFileSync } from "node:child_process";
import { commitZoneDecision, pathZone } from "./hooks.mjs";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
// P2-pas 2026-09-09 F-8: --no-renames (en flyttet rolletekst = delete+add, ikke usynlig) ·
// -z (rå stier, ingen quotePath-escaping) · name-status så en SLETTET lås ikke tæller som "følger med"
const statusRaw = execFileSync("git", ["-C", repoRoot, "diff", "--cached", "--no-renames", "--name-status", "-z"], { encoding: "utf8" });
const stagedStatus = new Map();
{
  const parts = statusRaw.split("\0").filter((x) => x.length > 0);
  for (let i = 0; i + 1 < parts.length; i += 2) stagedStatus.set(parts[i + 1], parts[i]);
}
const staged = [...stagedStatus.keys()];

if (staged.length === 0) process.exit(0);

// M-41 Trin A4 (fabrik-frys, GRUNDPLAN-v2 princip 8): en rolletekst må ALDRIG
// committes uden at actors.lock.json følger i SAMME commit — ellers kører næste
// aktør-kald på en lås der peger på en anden tekst end HEAD (3 stale pins fundet
// 2026-09-08). Atomisk rolletekst→lock. Registret (hærdet) håndhæves i CI, ikke
// her: et Codex-pas kræver en commit at referere.
const rollerStaged = staged.filter((p) => /^scripts\/v5\/roller\/[^/]+\.md$/.test(p));
const lockStatus = stagedStatus.get("scripts/v5/actors.lock.json");
const lockFoelgerMed = lockStatus !== undefined && lockStatus !== "D"; // slettet lås = mangler
if (rollerStaged.length > 0 && !lockFoelgerMed) {
  console.error("✗ commit-zone (M-41 A4): rolletekst staged uden scripts/v5/actors.lock.json i samme commit:");
  for (const p of rollerStaged) console.error(`    ${p}`);
  console.error("  Regenerér låsen (skill_oid = git hash-object af rolleteksten) og stage den sammen med teksten.");
  process.exit(2);
}

const rolle = process.env.STORK_V5_ROLLE;
let kravUpload;
const mandat = process.env.STORK_V5_KRAV_UPLOAD;
if (typeof mandat === "string") {
  const dele = mandat.split(":");
  if (dele.length === 3) kravUpload = { pakke: dele[0], udkastBlobOid: dele[1], auditBlobOid: dele[2] };
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
