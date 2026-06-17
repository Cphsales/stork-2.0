// Regel-flade klausul (e) — grundig-recon-kontrakt-checker (krav 4).
// Hele det berørte scope skal kortlægges; reconen må ikke stoppe ved første fund.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/grundig-recon-kontrakt.json");
export const loadDef = (path = DEF_PATH) => JSON.parse(readFileSync(path, "utf8"));

// recon = { scope: ["emne", ...], fund: [{emne}], stoppedEarly?: boolean }
export function validateGrundig(recon) {
  const fejl = [];
  if (recon?.stoppedEarly) fejl.push("stoppetVedFoersteFund");
  const dækket = new Set((Array.isArray(recon?.fund) ? recon.fund : []).map((f) => f?.emne));
  for (const emne of Array.isArray(recon?.scope) ? recon.scope : []) {
    if (!dækket.has(emne)) fejl.push(`ukortlagtScope: ${emne}`);
  }
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: grundig-recon-check.mjs <recon.json>");
    process.exit(2);
  }
  const res = validateGrundig(JSON.parse(readFileSync(path, "utf8")));
  if (!res.ok) {
    console.error("GRUNDIG-RECON AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("grundig-recon OK (hele scope kortlagt)");
}
