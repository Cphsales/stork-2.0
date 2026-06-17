// Regel-flade klausul (f) — krav-troskab-metode (krav 2). KOMPONERER de eksisterende
// checkere (ingen parallel logik): matrix = (b) spec-check, dual-hash = (j) handoff-check;
// + menings-gate (rolle PASS/FEEDBACK) + kumulativ kæde-troskab (krav⊨vision).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { validateSpec } from "./spec-check.mjs";
import { validateBinding } from "./handoff-check.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/krav-troskab-kontrakt.json");
export const loadDef = (path = DEF_PATH) => JSON.parse(readFileSync(path, "utf8"));

// input = { spec, verdikt: {planSha, kravHash, meningsGate}, current, kaedeTroskab: {kravModVision} }
export function validateKravTroskab(input, def = loadDef()) {
  const fejl = [];
  // Matrix-gate via (b) — genbrug.
  const m = validateSpec(input?.spec);
  if (!m.ok) fejl.push(...m.fejl.map((f) => `matrix:${f}`));
  // Dual-hash-binding via (j) — genbrug.
  const b = validateBinding(input?.verdikt, input?.current);
  if (!b.ok) fejl.push(...b.fejl.map((f) => `binding:${f}`));
  // Menings-gate (rolle-dømmekraft, men dens verdikt skal være registreret + gyldigt).
  const mg = input?.verdikt?.meningsGate;
  if (!mg) fejl.push("manglerMeningsGate");
  else if (!def.meningsGateVerdikter.includes(mg)) fejl.push(`ugyldigMeningsGate(${mg})`);
  // Kumulativ kæde-troskab (krav⊨vision).
  for (const felt of def.kaedeTroskabFelter) {
    if (!input?.kaedeTroskab?.[felt]) fejl.push(`manglerKaedeTroskab(${felt})`);
  }
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: krav-troskab-check.mjs <input.json>");
    process.exit(2);
  }
  const res = validateKravTroskab(JSON.parse(readFileSync(path, "utf8")));
  if (!res.ok) {
    console.error("KRAV-TROSKAB AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("krav-troskab OK (matrix + binding + menings-gate + kæde-troskab)");
}
