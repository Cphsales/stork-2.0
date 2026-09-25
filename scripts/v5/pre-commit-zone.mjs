#!/usr/bin/env node
// pre-commit-zone.mjs — kaldes fra .husky/pre-commit. Afviser en commit, hvor rollen
// (STORK_V5_ROLLE) skriver uden for sine zoner (hooks.mjs), hvor ledgeren får andet end
// nye rækker, eller hvor et krav i docs/sandhed/krav/ ikke er det flyttede udkast med
// Mathias' `krav ok` for netop den blob (disciplin.md §2 trin 1).

import { execFileSync } from "node:child_process";
import { beslutning, toRepoRel, zone } from "./hooks.mjs";

const git = (args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
const repoRoot = git(["rev-parse", "--show-toplevel"]).trim();
const raw = git(["-C", repoRoot, "diff", "--cached", "--no-renames", "--name-status", "-z"]).split("\0").filter(Boolean);
const status = new Map();
for (let i = 0; i + 1 < raw.length; i += 2) status.set(raw[i + 1], raw[i][0]);
const stier = [...status.keys()];
if (stier.length === 0) process.exit(0);

const fejl = [];
const rolle = process.env.STORK_V5_ROLLE;
const b = beslutning({ rolle, stier, repoRoot });
if (!b.ok) {
  fejl.push(b.grund);
  for (const a of b.afviste.slice(0, 10)) fejl.push(`    ${a.sti} (${a.zone})`);
}

const blob = (spec) => { try { return git(["-C", repoRoot, "rev-parse", spec]).trim(); } catch { return null; } };
const ledgerTekst = () => {
  for (const p of ["docs/sandhed/mathias-ord.md", "plan-build/lokations-skabelon/mathias-ord.md"]) {
    try { return git(["-C", repoRoot, "show", `:${p}`]); } catch {}
  }
  return "";
};

for (const [p, s] of status) {
  const rel = toRepoRel(p, repoRoot);
  const z = rel && zone(rel);
  if (z === "ledger" && s === "M") {
    const numstat = git(["-C", repoRoot, "diff", "--cached", "--numstat", "--", p]).trim().split(/\s+/);
    if (Number(numstat[1]) > 0) fejl.push(`ledgeren ${p}: kun nye rækker må tilføjes (${numstat[1]} linje(r) slettet/ændret)`);
  }
  if (z === "krav" && s !== "D") {
    const pakke = rel.slice("docs/sandhed/krav/".length, -"-krav.md".length);
    const udkast = `plan-build/${pakke}/krav-udkast.md`;
    const nyBlob = blob(`:${rel}`);
    const udkastBlob = status.get(udkast) === "D" ? blob(`HEAD:${udkast}`) : null;
    if (s === "A" && udkastBlob !== nyBlob) fejl.push(`${rel}: kravet skal være det flyttede udkast ${udkast} byte for byte (git mv)`);
    if (s === "M") fejl.push(`${rel}: et godkendt krav ændres kun med et nyt krav-udkast og et nyt \`krav ok\``);
    const rader = ledgerTekst().split("\n").filter((l) => /^\|\s*M-\d+\s*\|/.test(l));
    if (nyBlob && !rader.some((l) => /krav ok/i.test(l) && l.includes(nyBlob.slice(0, 12))))
      fejl.push(`${rel}: ledgeren har ingen \`krav ok\`-række med kravets blob ${nyBlob.slice(0, 12)}`);
  }
}

if (fejl.length) {
  console.error("✗ commit-zone:");
  for (const f of fejl) console.error(`  ${f}`);
  if (!rolle) console.error("  Sæt rollen for sessionen, fx: export STORK_V5_ROLLE=fabrik");
  process.exit(2);
}
if (!rolle) console.error("⚠ commit-zone: STORK_V5_ROLLE ikke sat — kun de beskyttede zoner er håndhævet");
