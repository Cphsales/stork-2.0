// Regel-flade klausul (h) — recon-dybde-checker.
// Full-scope first-pass: recon skal vise sin DÆKNINGSFLADE og være dedupliceret; i runde 2+
// er et fund i en allerede-dækket flade en RECON-MISS (burde være fanget i runde 1).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/recon-dybde-kontrakt.json");
export const loadDef = (path = DEF_PATH) => JSON.parse(readFileSync(path, "utf8"));

// recon = { runde, daekningsflade: [..], fund: [{emne, kilde, flade}], tidligereFlader?: [..] }
export function validateReconDybde(recon) {
  const fejl = [];
  if (!Array.isArray(recon?.daekningsflade) || recon.daekningsflade.length === 0)
    fejl.push("manglerDaekningsflade");

  const set = new Set();
  for (const f of Array.isArray(recon?.fund) ? recon.fund : []) {
    const noegle = `${f?.emne}|${f?.kilde}`;
    if (set.has(noegle)) fejl.push(`dublet(${noegle})`);
    set.add(noegle);
  }

  if ((recon?.runde ?? 1) >= 2) {
    const tidligere = new Set(recon?.tidligereFlader ?? []);
    for (const f of Array.isArray(recon?.fund) ? recon.fund : []) {
      if (tidligere.has(f?.flade)) fejl.push(`reconMiss(${f?.flade})`);
    }
  }
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: recon-dybde-check.mjs <recon.json>");
    process.exit(2);
  }
  const res = validateReconDybde(JSON.parse(readFileSync(path, "utf8")));
  if (!res.ok) {
    console.error("RECON-DYBDE AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("recon-dybde OK (dækningsflade vist, dedup, ingen recon-miss)");
}
