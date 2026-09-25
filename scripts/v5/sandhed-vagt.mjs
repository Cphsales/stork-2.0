#!/usr/bin/env node
// sandhed-vagt.mjs — Mathias' sandhedsdokumenter og workflowets tekster ændres kun med hans ord
// (disciplin.md §2 regel 2, §8.1).
//
// En ændring i vision-og-principper.md, forretningsforstaaelse.md, masterplanen, disciplin.md
// eller en rolletekst i scripts/v5/roller/ er kun gyldig, hvis ledgeren har en M-række, hvor
// hans ord er en godkendelse (»ja«, »ok«, »krav ok«, »plan ok«, »slut ok« …), og hvor kolonnen
// »Svar på / godkender« nævner filen og den nye blob (første 12 tegn). Sletning kræver en sådan
// række med filen og »slettes«.
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
  "docs/strategi/disciplin.md",
]);
export const ROLLE_MAPPE = "scripts/v5/roller/";
export const LEDGER_STIER = Object.freeze(["docs/sandhed/mathias-ord.md", "plan-build/lokations-skabelon/mathias-ord.md"]);

const beskyttet = (sti) => SANDHEDS_DOK.includes(sti) || (sti.startsWith(ROLLE_MAPPE) && sti.endsWith(".md"));
// hans ord er en godkendelse, når citatet begynder med ja/ok eller et af de tre godkendelses-ord
const GODKENDELSE = /^»\s*(ja|ok|krav ok|plan ok|slut ok)\b/i;

// rækker → [{ ord, maal }] for M-rækkerne (| M-n | dato | »ord« | svar på / godkender |)
function raekker(ledger) {
  return String(ledger ?? "").split("\n").filter((l) => /^\|\s*M-\d+\s*\|/.test(l)).map((l) => {
    const c = l.split("|").map((x) => x.trim());
    return { ord: c[3] ?? "", maal: c.slice(4).join("|") };
  });
}

// ændringer: [{ sti, status: "M"|"A"|"D", blob }] · ledger: tekst · → liste af fejl
export function dom(aendringer, ledger) {
  const godkendt = raekker(ledger).filter((r) => GODKENDELSE.test(r.ord));
  const fejl = [];
  for (const a of aendringer) {
    if (!beskyttet(a.sti)) continue;
    const navn = a.sti.split("/").pop();
    const ok = a.status === "D"
      ? godkendt.some((r) => r.maal.includes(navn) && /slettes/i.test(r.maal))
      : typeof a.blob === "string" && a.blob.length >= 12 && godkendt.some((r) => r.maal.includes(navn) && r.maal.includes(a.blob.slice(0, 12)));
    if (!ok) fejl.push(`${a.sti}: ${a.status === "D" ? "slettes" : `ny blob ${String(a.blob).slice(0, 12)}`} uden en M-række, hvor Mathias godkender netop denne tekst`);
  }
  return fejl;
}

const git = (args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

function aendringerFra(diffArgs, blobAf) {
  const raw = git(["diff", ...diffArgs, "--no-renames", "--name-status", "-z", "--", ...SANDHEDS_DOK, ROLLE_MAPPE]);
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
    console.error("✗ sandhed-vagt: Mathias' sandhedsdokumenter og workflowets tekster ændres kun med hans ord for netop den tekst (disciplin.md §8.1):");
    for (const f of fejl) console.error(`    ${f}`);
    process.exit(2);
  }
  if (aendringer.length) console.log(`✓ sandhed-vagt: ${aendringer.length} ændring(er) i sandhedsdokumenterne har Mathias' ord i ledgeren`);
}
