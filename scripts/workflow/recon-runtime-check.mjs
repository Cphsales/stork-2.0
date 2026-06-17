// S6 (Leverance 2) — recon-eksekvering. KOMPONERER recon-kontrakterne (ingen parallel logik):
// (d) recon-præsentation/output-skema, (e) grundig-recon, (h) recon-dybde. Producerer ÉN
// deterministisk hash'et recon-sandhed (konsolidering: dedupliceret + kanonisk sorteret).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { validateRecon } from "./recon-check.mjs";
import { validateGrundig } from "./grundig-recon-check.mjs";
import { validateReconDybde } from "./recon-dybde-check.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/recon-runtime-kontrakt.json");
export const loadDef = (path = DEF_PATH) => JSON.parse(readFileSync(path, "utf8"));

// Konsolidér til ÉN sandhed: kanonisk sortér + dedup + sha256 (deterministisk).
export function konsoliderReconSandhed(fund) {
  const noegle = (f) => `${f?.emne}|${f?.kilde}`;
  const set = new Map();
  for (const f of fund ?? []) set.set(noegle(f), f);
  const sorted = [...set.values()].sort((a, b) => noegle(a).localeCompare(noegle(b)));
  return createHash("sha256").update(JSON.stringify(sorted)).digest("hex");
}

// run = { punkt, scope, daekningsflade, fund, runde?, tidligereFlader?, stoppedEarly? }
export function validateReconRun(run, def = loadDef()) {
  const fejl = [];
  if (!def.punkter.includes(run?.punkt)) fejl.push(`ukendtPunkt(${run?.punkt})`);
  const d = validateRecon({ fund: run?.fund });
  if (!d.ok) fejl.push(...d.fejl.map((f) => `praesentation:${f}`));
  const e = validateGrundig({ scope: run?.scope, fund: run?.fund, stoppedEarly: run?.stoppedEarly });
  if (!e.ok) fejl.push(...e.fejl.map((f) => `grundig:${f}`));
  const h = validateReconDybde({
    runde: run?.runde,
    daekningsflade: run?.daekningsflade,
    fund: run?.fund,
    tidligereFlader: run?.tidligereFlader,
  });
  if (!h.ok) fejl.push(...h.fejl.map((f) => `dybde:${f}`));
  return { ok: fejl.length === 0, fejl, reconHash: konsoliderReconSandhed(run?.fund) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: recon-runtime-check.mjs <run.json>");
    process.exit(2);
  }
  const res = validateReconRun(JSON.parse(readFileSync(path, "utf8")));
  if (!res.ok) {
    console.error("RECON-RUN AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log(`recon-run OK · recon-sandhed-hash: ${res.reconHash.slice(0, 12)}…`);
}
