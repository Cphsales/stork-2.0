#!/usr/bin/env node
// sandhed-vagt.mjs — Mathias' sandhedsdokumenter ændres kun med hans ord (M-67 + 24/9).
//
// En ændring i vision-og-principper.md, forretningsforstaaelse.md eller masterplanen er kun
// gyldig, hvis ledgeren har en M-række der nævner filen OG den nye blob (første 12 tegn).
// Rækken skrives, når den ordrette rettelse er vist i chatten, og Mathias har sagt ja til
// netop den (disciplin.md §8.1). Sletning kræver en række der nævner filen og »slettes«.
//
// Brug:
//   node scripts/v5/sandhed-vagt.mjs --staged            (pre-commit: index mod HEAD)
//   node scripts/v5/sandhed-vagt.mjs --base <ref>        (CI: <ref>...HEAD)
// Exit 0 = ok · exit 2 = ændring uden Mathias' ord.

import { execFileSync } from "node:child_process";

export const SANDHEDS_DOK = Object.freeze([
  "docs/strategi/vision-og-principper.md",
  "docs/strategi/forretningsforstaaelse.md",
  "docs/strategi/stork-2-0-master-plan.md",
]);
export const LEDGER_STIER = Object.freeze(["docs/sandhed/mathias-ord.md", "plan-build/lokations-skabelon/mathias-ord.md"]);

// ændringer: [{ sti, status: "M"|"A"|"D", blob }] · ledger: tekst · → liste af fejl
export function dom(aendringer, ledger) {
  const rader = String(ledger ?? "").split("\n").filter((l) => /^\|\s*M-\d+\s*\|/.test(l));
  const fejl = [];
  for (const a of aendringer) {
    if (!SANDHEDS_DOK.includes(a.sti)) continue;
    const navn = a.sti.split("/").pop();
    const ok = a.status === "D"
      ? rader.some((r) => r.includes(navn) && /slettes/i.test(r))
      : typeof a.blob === "string" && a.blob.length >= 12 && rader.some((r) => r.includes(navn) && r.includes(a.blob.slice(0, 12)));
    if (!ok) fejl.push(`${a.sti}: ${a.status === "D" ? "slettes" : `ny blob ${String(a.blob).slice(0, 12)}`} uden en M-række i ledgeren med Mathias' ord for netop denne tekst`);
  }
  return fejl;
}

const git = (args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

function aendringerFra(diffArgs, blobAf) {
  const raw = git(["diff", ...diffArgs, "--no-renames", "--name-status", "-z", "--", ...SANDHEDS_DOK]);
  const parts = raw.split("\0").filter(Boolean);
  const ud = [];
  for (let i = 0; i + 1 < parts.length; i += 2) {
    const status = parts[i][0], sti = parts[i + 1];
    ud.push({ sti, status, blob: status === "D" ? null : blobAf(sti) });
  }
  return ud;
}

function laesLedger(spec) {
  for (const s of LEDGER_STIER) { try { return git(["show", `${spec}${s}`]); } catch {} }
  return "";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const i = process.argv.indexOf("--base");
  let aendringer, ledger;
  if (process.argv.includes("--staged")) {
    aendringer = aendringerFra(["--cached"], (p) => git(["rev-parse", `:${p}`]).trim());
    ledger = laesLedger(":");
  } else if (i > 0 && process.argv[i + 1]) {
    const base = process.argv[i + 1];
    aendringer = aendringerFra([`${base}...HEAD`], (p) => git(["rev-parse", `HEAD:${p}`]).trim());
    ledger = laesLedger("HEAD:");
  } else {
    console.error("brug: sandhed-vagt.mjs --staged | --base <ref>");
    process.exit(2);
  }
  const fejl = dom(aendringer, ledger);
  if (fejl.length) {
    console.error("✗ sandhed-vagt: Mathias' sandhedsdokumenter ændres kun med hans ord for netop den tekst (disciplin.md §8.1):");
    for (const f of fejl) console.error(`    ${f}`);
    process.exit(2);
  }
  if (aendringer.length) console.log(`✓ sandhed-vagt: ${aendringer.length} ændring(er) i sandhedsdokumenterne har Mathias' ord i ledgeren`);
}
