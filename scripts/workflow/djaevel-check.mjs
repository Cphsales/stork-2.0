// Regel-flade klausul (k) — djævlens-advokat-checker (krav 3/5).
// Pr. krav skal reviewer udfylde 6 felter; en APPROVAL uden fuldt pass → afvist.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/djaevel-kontrakt.json");
export const loadDef = (path = DEF_PATH) => JSON.parse(readFileSync(path, "utf8"));

const tom = (v) => v == null || (typeof v === "string" && v.trim() === "");

// pass = { krav: [{id, minLaesning, maxLaesning, ...}], approval?: boolean }
export function validateDjaevelPass(pass, def = loadDef()) {
  const fejl = [];
  const krav = Array.isArray(pass?.krav) ? pass.krav : [];
  let alleFulde = krav.length > 0;
  for (const k of krav) {
    for (const felt of def.seksFelter) {
      if (tom(k?.[felt])) {
        fejl.push(`manglerFelt(${k?.id ?? "?"}.${felt})`);
        alleFulde = false;
      }
    }
  }
  if (pass?.approval && !alleFulde) fejl.push("approvalUdenFuldtPass");
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: djaevel-check.mjs <pass.json>");
    process.exit(2);
  }
  const res = validateDjaevelPass(JSON.parse(readFileSync(path, "utf8")));
  if (!res.ok) {
    console.error("DJÆVEL-PASS AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("djævel-pass OK");
}
