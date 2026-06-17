// Regel-flade klausul (g) — review-dybde / proportionel re-validering (deterministisk).
// Afgør re-validerings-omfang fra en ændrings berørte trigger-tags — IKKE skøn:
//  - ingen baseline endnu        → full-scope (baseline etableres)
//  - berører en re-full-scope-trigger → full-scope
//  - ellers                       → diff-bundet (+ regression-sweep)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/review-dybde-kontrakt.json");
export const loadDef = (path = DEF_PATH) => JSON.parse(readFileSync(path, "utf8"));

// aendring = { hasBaseline: boolean, touched: ["trigger-tag", ...] }
export function decideReValidering(aendring, def = loadDef()) {
  if (!aendring?.hasBaseline) return "full-scope";
  const triggers = new Set(def.reFullScopeTriggers);
  const ramt = (aendring?.touched ?? []).filter((t) => triggers.has(t));
  return ramt.length ? "full-scope" : "diff-bundet";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: review-dybde-check.mjs <aendring.json>");
    process.exit(2);
  }
  console.log(decideReValidering(JSON.parse(readFileSync(path, "utf8"))));
}
