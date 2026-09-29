#!/usr/bin/env node
// pre-commit-zone.mjs — kaldes fra .husky/pre-commit. Afviser en commit, hvor rollen
// (STORK_V5_ROLLE) skriver uden for sine zoner (hooks.mjs), hvor ledgeren slettes eller får
// andet end nye rækker, eller hvor et krav i docs/sandhed/krav/ ikke er det flyttede udkast med
// Mathias' `krav ok` for netop den blob (disciplin.md §2 trin 1).

import { execFileSync } from "node:child_process";
import { beslutning, toRepoRel, zone } from "./hooks.mjs";
import { LEDGER, erGodkendelse, filBlobPar, passer, raekker } from "./sandhed-vagt.mjs";

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
const ledger = () => { try { return git(["-C", repoRoot, "show", `:${LEDGER}`]); } catch { return ""; } };

for (const [p, s] of status) {
  const rel = toRepoRel(p, repoRoot);
  const z = rel && zone(rel);
  if (z === "ledger" && s === "D") fejl.push(`ledgeren ${p} må ikke slettes`);
  if (z === "ledger" && s === "M") {
    const numstat = git(["-C", repoRoot, "diff", "--cached", "--numstat", "--", p]).trim().split(/\s+/);
    if (Number(numstat[1]) > 0) fejl.push(`ledgeren ${p}: kun nye rækker må tilføjes (${numstat[1]} linje(r) slettet/ændret)`);
  }
  // et krav (nyt eller revideret) er det flyttede udkast byte for byte, og ledgeren har et `krav ok`, der binder netop den blob
  if (z === "krav" && s !== "D") {
    const pakke = rel.slice("docs/sandhed/krav/".length, -"-krav.md".length);
    const udkast = `plan-build/${pakke}/krav-udkast.md`;
    const nyBlob = blob(`:${rel}`);
    const udkastBlob = status.get(udkast) === "D" ? blob(`HEAD:${udkast}`) : null;
    if (!nyBlob || udkastBlob !== nyBlob) fejl.push(`${rel}: kravet skal være det flyttede udkast ${udkast} byte for byte (git mv; ved en revision git mv -f)`);
    const godkendt = raekker(ledger()).some((r) => erGodkendelse(r.ord, "krav ok") && filBlobPar(r.maal).some((x) => (passer(x.fil, rel) || passer(x.fil, udkast)) && nyBlob?.startsWith(x.blob)));
    if (nyBlob && !godkendt) fejl.push(`${rel}: ledgeren har intet \`krav ok\`, der binder ${pakke}-krav.md → blob ${nyBlob.slice(0, 12)}`);
  }
}

if (fejl.length) {
  console.error("✗ commit-zone:");
  for (const f of fejl) console.error(`  ${f}`);
  if (!rolle) console.error("  Sæt rollen for sessionen, fx: export STORK_V5_ROLLE=fabrik");
  process.exit(2);
}
if (!rolle) console.error("⚠ commit-zone: STORK_V5_ROLLE ikke sat — kun de beskyttede zoner er håndhævet");
