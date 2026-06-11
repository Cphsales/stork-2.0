#!/usr/bin/env node
// scripts/selvtjek-docs.mjs — 1a-selvtjek (rette-til 2026-06-11, Mathias-go).
//
// Mekanisk konsistens-grep FØR Codex-dispatch på docs-ændringer: udtrækker
// fakta-tokens (runde-/PR-numre, hashes, tal-fraser) fra diffen mod base og
// viser ALLE forekomster af samme token-klasse i aktive docs — så stale
// søskende-steder ses på sekunder i stedet for at koste en model-runde.
//
// ADVISORY-lag: exit 0 altid (gaten er og bliver Codex — dette er et ekstra
// lag FØR, aldrig i stedet for). Evidens: bid 1 kostede 2 ekstra runder på
// præcis denne fund-klasse (stale tal i pointer-docs).
//
// Brug:  node scripts/selvtjek-docs.mjs [base-ref]   (default: origin/main)
//        Tokens udtrækkes af `git diff <base>` for *.md under docs/.
//
// Grep-fælden fra 2026-06-11 er indbygget: der matches pr. TOKEN, aldrig med
// linje-niveau-ekskludering (aktiv-plans kæmpelinje åd et fund via `grep -v`).

import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const base = process.argv[2] ?? "origin/main";
const repoRod = execSync("git rev-parse --show-toplevel").toString().trim();
process.chdir(repoRod);

// 1) Ændrede md-linjer (kun tilføjede/ændrede) i docs/
const diff = execSync(`git diff ${base} -- 'docs/**/*.md' 'docs/*.md'`, {
  maxBuffer: 16 * 1024 * 1024,
}).toString();
const nyeLinjer = diff
  .split("\n")
  .filter((l) => l.startsWith("+") && !l.startsWith("+++"))
  .map((l) => l.slice(1));

// 2) Token-klasser der historisk drifter (bid 1-evidensen + runde 47-52-klassen)
const KLASSER = [
  { navn: "PR-nr", re: /PR #\d+/g },
  { navn: "kort-hash", re: /\b[0-9a-f]{8,10}\b/g },
  { navn: "antal-runder", re: /\d+ review-runder/g },
  { navn: "selftest-tal", re: /~?\d+ selftest/g },
  // Kun SAMMENSATTE pakke-ankre (gov-6-arkiv-fold-klassen) — nøgne "gov-N"
  // giver hundredvis af legitime hits (støj-fund ved funktionel test)
  { navn: "pakke-anker", re: /gov-\d+-[a-zæøå][a-zæøå-]+/gi },
];

const tokens = new Map(); // token -> klasse
for (const linje of nyeLinjer)
  for (const k of KLASSER)
    for (const m of linje.matchAll(k.re)) tokens.set(m[0], k.navn);

if (tokens.size === 0) {
  console.log("selvtjek-docs: ingen fakta-tokens i diffen — intet at holde.");
  process.exit(0);
}

// 3) AKTIVE docs = pointer-/sandheds-laget. Bogførte lag (arkiv, codex-reviews,
//    rapport-historik) ekskluderes: de gentager legitimt gamle tokens (støj-fund
//    ved funktionel test 2026-06-11). Diff-MÅLET kan stadig ligge der — det
//    dækkes af diffBerørt-filteret, ikke søgefladen.
const mdFiler = [];
(function gaa(dir) {
  for (const navn of readdirSync(dir)) {
    const sti = join(dir, navn);
    if (statSync(sti).isDirectory()) {
      if (
        !sti.includes("coordination/arkiv") &&
        !sti.includes("codex-reviews") &&
        !sti.includes("rapport-historik")
      )
        gaa(sti);
    } else if (navn.endsWith(".md")) mdFiler.push(sti);
  }
})("docs");

// 4) Pr. token: vis alle forekomster på tværs — divergens ses med det samme
let fundISøskende = 0;
for (const [token, klasse] of [...tokens.entries()].sort()) {
  const hits = [];
  for (const fil of mdFiler) {
    const indhold = readFileSync(fil, "utf8");
    let i = indhold.indexOf(token);
    while (i !== -1) {
      const linjeNr = indhold.slice(0, i).split("\n").length;
      hits.push(`${fil}:${linjeNr}`);
      i = indhold.indexOf(token, i + 1);
    }
  }
  const eksterne = hits.filter((h) => !diffBerørt(h));
  if (eksterne.length > 0) {
    fundISøskende++;
    console.log(`\n■ [${klasse}] "${token}" findes også i:`);
    for (const h of eksterne) console.log(`    ${h}`);
  }
}

function diffBerørt(hit) {
  const fil = hit.split(":")[0];
  return diff.includes(`+++ b/${fil}`) || diff.includes(`--- a/${fil}`);
}

console.log(
  fundISøskende === 0
    ? "\nselvtjek-docs: ingen søskende-forekomster uden for diffen."
    : `\nselvtjek-docs: ${fundISøskende} token(s) har forekomster UDEN FOR diffen — verificér at de stadig er sande (D4-læringen). Advisory: gaten er Codex.`,
);
process.exit(0);
