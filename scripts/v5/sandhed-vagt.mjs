#!/usr/bin/env node
// sandhed-vagt.mjs — Mathias' sandhedsdokumenter og workflowets tekster ændres kun med hans ord
// (disciplin.md §2 regel 2, §8.1).
//
// En ændring i vision-og-principper.md, forretningsforstaaelse.md, masterplanen, disciplin.md
// eller en rolletekst i scripts/v5/roller/ er kun gyldig, hvis ledgeren har en M-række, hvor
// hans ord er netop et godkendelses-ord, og hvor kolonnen »Svar på / godkender« binder netop den fil til
// den nye blob (`<fil> → blob <mindst 12 tegn>`). Sletning kræver en sådan række, hvor filen
// står i et afsnit, der ender med »slettes«. Formaterne: scripts/README.md »Formater«.
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
export const LEDGER = "docs/sandhed/mathias-ord.md";

const beskyttet = (sti) => SANDHEDS_DOK.includes(sti) || (sti.startsWith(ROLLE_MAPPE) && sti.endsWith(".md"));

// raekker(ledger) → [{ nr, ord, maal, linje }] for M-rækkerne (| M-n | dato | »ord« | svar på / godkender |)
export function raekker(ledger) {
  return String(ledger ?? "").split("\n").filter((l) => /^\|\s*M-\d+\s*\|/.test(l)).map((l) => {
    const c = l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((x) => x.trim());
    return { nr: c[0], ord: c[2] ?? "", maal: c.slice(3).join("|"), linje: l };
  });
}

// erGodkendelse(ord, ordet?) → hans citat er netop godkendelses-ordet (uden `ordet`: ja · ok · krav ok · plan ok · slut ok),
// evt. med et punktnummer foran (svar på et nummereret spørgsmål, fx »1. ja«), »tak« og punktum — eller den afgrænsede
// form »ok til planen« (M-81). Alt andet er ikke en godkendelse.
const FORM = /^(?:\d{1,2}[.)] ?)?(ja|ok|krav ok|plan ok|slut ok)( tak)?[.!]?$/u;
const AFGRAENSET = /^ok til planen[.!]?$/u;
export function erGodkendelse(ord, ordet) {
  const m = String(ord ?? "").trim().match(/^»([\s\S]*)«$/);
  if (!m) return false;
  const t = m[1].trim().toLowerCase().replace(/\s+/g, " ");
  const f = t.match(FORM);
  if (f) return !ordet || f[1] === ordet;
  return !ordet && AFGRAENSET.test(t);
}
// M-71 (2026-09-24) er hans ja til de to l.5-linjer, men citatet fortsætter med et spørgsmål og har derfor ikke den rene form.
// Rækken godkender kun netop disse to blobs.
const HISTORISKE_GODKENDELSER = Object.freeze([
  { nr: "M-71", ord: "»ja - ja - ja og har jeg ikke godkendt workflow planen?«", par: [{ fil: "vision-og-principper.md", blob: "309fc5949ded" }, { fil: "forretningsforstaaelse.md", blob: "cde05276985a" }] },
]);
const historisk = (r) => HISTORISKE_GODKENDELSER.find((h) => h.nr === r.nr && h.ord === r.ord.trim())?.par ?? null;

// filBlobPar(tekst) → [{ fil, blob }] for hvert `<fil> → blob <12-40 hex>` (filen evt. i backticks)
export function filBlobPar(tekst) {
  return [...String(tekst ?? "").matchAll(/`?([A-Za-z0-9_./-]+\.[A-Za-z0-9]{1,5})`?\s+→\s+blob\s+([0-9a-f]{12,40})(?![0-9a-f])/g)].map((x) => ({ fil: x[1], blob: x[2] }));
}
// slettes(maal) → filerne i de afsnit (adskilt af ·), der ender med »slettes«
export function slettes(maal) {
  return String(maal ?? "").split("·").filter((a) => /(?<!\p{L})slettes\s*$/u.test(a.trim())).flatMap((a) => [...a.matchAll(/`?([A-Za-z0-9_./-]+\.[A-Za-z0-9]{1,5})`?/g)].map((x) => x[1]));
}
// passer(fil, sti) → filnavnet i rækken er stien eller dens slutning (fx `code.md` for scripts/v5/roller/code.md)
export const passer = (fil, sti) => fil === sti || sti.endsWith("/" + fil);

// ændringer: [{ sti, status: "M"|"A"|"D", blob }] · ledger: tekst · → liste af fejl
export function dom(aendringer, ledger) {
  const alle = raekker(ledger);
  const godkendt = alle.filter((r) => erGodkendelse(r.ord));
  const par = [...godkendt.flatMap((r) => filBlobPar(r.maal)), ...alle.flatMap((r) => historisk(r) ?? [])];
  const fejl = [];
  for (const a of aendringer) {
    if (!beskyttet(a.sti)) continue;
    const ok = a.status === "D"
      ? godkendt.some((r) => slettes(r.maal).some((f) => passer(f, a.sti)))
      : typeof a.blob === "string" && par.some((p) => passer(p.fil, a.sti) && a.blob.startsWith(p.blob));
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
  try { return git(["show", `${spec}${LEDGER}`]); } catch { return ""; }
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
