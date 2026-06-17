// Regel-flade klausul (a) — gate-/dispositions-checker.
// Aktoer-flade, eksekverbar: validerer gate-ord og review-dispositioner mod den
// autoritative workflow/gate-def.json. Tekst-der-ER-funktionen; testen baerer beviset.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/gate-def.json");

export function loadGateDef(path = DEF_PATH) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const def = loadGateDef();

export const validGateOrd = (w) => def.gateOrd.eksterne.includes(w);
export const validDisposition = (d) => def.dispositioner.includes(d);
export const internalState = (w) =>
  Object.prototype.hasOwnProperty.call(def.gateOrd.interneStates, w) ? def.gateOrd.interneStates[w] : null;

// CLI: `node gate-check.mjs gate "plan OK"` | `node gate-check.mjs disp BLOCKER`
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , kind, token] = process.argv;
  const ok = kind === "gate" ? validGateOrd(token) : kind === "disp" ? validDisposition(token) : null;
  if (ok === null) {
    console.error('brug: gate-check.mjs <gate|disp> "<token>"');
    process.exit(2);
  }
  console.log(`${kind} "${token}" -> ${ok ? "GYLDIG" : "UGYLDIG"}`);
  process.exit(ok ? 0 : 1);
}
